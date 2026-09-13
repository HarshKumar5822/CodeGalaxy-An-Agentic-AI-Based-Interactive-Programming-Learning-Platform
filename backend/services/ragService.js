// Basic RAG (Retrieval-Augmented Generation) over uploaded PDF/TXT documents.
//
// This deliberately does NOT use the Qdrant vector DB already scaffolded in
// services/qdrantService.js — that needs a running Qdrant instance (self-hosted or cloud) plus
// a separate embeddings API, which is extra infrastructure to stand up. Instead this uses a
// classic TF-IDF + cosine-similarity retriever computed in plain JS: zero extra services, zero
// extra API keys, works immediately with whatever LLM provider is already configured
// (AI_PROVIDER in .env). It's "real" retrieval (documents are chunked and ranked by relevance
// to the query, not just dumped whole into the prompt) — just without learned embeddings.
//
// If you later want proper semantic embeddings (better at matching questions phrased very
// differently from the source text), the Qdrant scaffold + Gemini's free embedding-001 API
// (you already have GEMINI_KEY) is the natural upgrade path — this module can be swapped out
// without changing the controller/routes that call it.

const { v4: uuidv4 } = require('uuid');
const { PDFParse } = require('pdf-parse');
const geminiService = require('./geminiService');
const groqService = require('./groqService');

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const isImageFile = (mimetype, originalname) => {
    const lower = (originalname || '').toLowerCase();
    return IMAGE_MIME_TYPES.includes(mimetype) || /\.(jpe?g|png|webp|gif)$/i.test(lower);
};

// In-memory store: docId -> { filename, chunks: [{ id, text }], vocabulary, idf, chunkVectors, uploadedAt }
// Fine for a single-instance dev/demo server. Would need Redis/a DB for multi-instance prod use.
const documentStore = new Map();

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const CHUNK_SIZE = 900; // characters
const CHUNK_OVERLAP = 150; // characters of overlap between consecutive chunks

// ---------- Text extraction ----------

const extractText = async (buffer, mimetype, originalname) => {
    const lower = (originalname || '').toLowerCase();
    if (mimetype === 'application/pdf' || lower.endsWith('.pdf')) {
        // pdf-parse v2 API: class-based, not the old v1 pdfParse(buffer) function call.
        const parser = new PDFParse({ data: buffer });
        try {
            const result = await parser.getText();
            return result.text;
        } finally {
            await parser.destroy();
        }
    }
    if (mimetype === 'text/plain' || lower.endsWith('.txt') || lower.endsWith('.md')) {
        return buffer.toString('utf-8');
    }
    throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
};

// ---------- Chunking ----------

const chunkText = (text) => {
    const cleaned = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    if (!cleaned) return [];

    const chunks = [];
    let start = 0;
    while (start < cleaned.length) {
        let end = Math.min(start + CHUNK_SIZE, cleaned.length);
        // Try to break on a sentence/paragraph boundary near the target end, so we don't cut
        // words/sentences mid-way, which would make retrieval + citations messier.
        if (end < cleaned.length) {
            const boundary = cleaned.lastIndexOf('. ', end);
            if (boundary > start + CHUNK_SIZE * 0.5) {
                end = boundary + 1;
            }
        }
        const chunkStr = cleaned.slice(start, end).trim();
        if (chunkStr) {
            chunks.push({ id: chunks.length, text: chunkStr });
        }
        if (end >= cleaned.length) break;
        start = end - CHUNK_OVERLAP;
    }
    return chunks;
};

// ---------- TF-IDF retrieval ----------

const tokenize = (text) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2);

const buildTfIdfIndex = (chunks) => {
    const docFreq = new Map(); // term -> number of chunks containing it
    const chunkTermFreqs = chunks.map((chunk) => {
        const tokens = tokenize(chunk.text);
        const tf = new Map();
        tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
        tf.forEach((_, term) => docFreq.set(term, (docFreq.get(term) || 0) + 1));
        return tf;
    });

    const N = chunks.length || 1;
    const idf = new Map();
    docFreq.forEach((df, term) => idf.set(term, Math.log((N + 1) / (df + 1)) + 1));

    const chunkVectors = chunkTermFreqs.map((tf) => {
        const vec = new Map();
        let normSq = 0;
        tf.forEach((count, term) => {
            const weight = count * (idf.get(term) || 0);
            vec.set(term, weight);
            normSq += weight * weight;
        });
        return { vec, norm: Math.sqrt(normSq) || 1 };
    });

    return { idf, chunkVectors };
};

const vectorizeQuery = (query, idf) => {
    const tokens = tokenize(query);
    const tf = new Map();
    tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
    const vec = new Map();
    let normSq = 0;
    tf.forEach((count, term) => {
        const weight = count * (idf.get(term) || 0);
        if (weight > 0) {
            vec.set(term, weight);
            normSq += weight * weight;
        }
    });
    return { vec, norm: Math.sqrt(normSq) || 1 };
};

const cosineSimilarity = (a, b) => {
    let dot = 0;
    const [smaller, larger] = a.vec.size < b.vec.size ? [a, b] : [b, a];
    smaller.vec.forEach((weight, term) => {
        if (larger.vec.has(term)) {
            dot += weight * larger.vec.get(term);
        }
    });
    return dot / (a.norm * b.norm);
};

const retrieveRelevantChunks = (doc, query, topK = 4) => {
    const queryVec = vectorizeQuery(query, doc.idf);
    const scored = doc.chunks.map((chunk, i) => ({
        chunk,
        score: cosineSimilarity(queryVec, doc.chunkVectors[i]),
    }));
    scored.sort((a, b) => b.score - a.score);
    // If nothing scored above ~0 (query shares no vocabulary with the doc — e.g. a very short
    // or generic question), just fall back to the first few chunks so the model still has
    // *something* to ground on rather than nothing.
    const meaningful = scored.filter((s) => s.score > 0);
    const pool = meaningful.length > 0 ? meaningful : scored;
    return pool.slice(0, topK).map((s) => s.chunk);
};

// ---------- Public API ----------

// Images aren't "chunked and retrieved" the way text is — there's no meaningful TF-IDF over
// pixels. Instead the whole image is kept (as base64) and handed directly to a vision-capable
// LLM alongside the user's question each time they ask something — genuine multimodal Q&A
// rather than text extraction/OCR, so it can answer about diagrams, handwriting, screenshots,
// photos of whiteboards, UI mockups, etc., not just images that happen to contain plain text.
const ingestImage = async (buffer, mimetype, originalname) => {
    if (buffer.length > MAX_FILE_SIZE_BYTES) {
        throw new Error('Image is too large (max 15MB).');
    }
    if (!groqService.isGroqConfigured()) {
        // Image Q&A currently only goes through Groq's vision model (see answerImageQuestion) —
        // the generic multi-provider dispatcher doesn't support image content blocks yet.
        throw new Error('Image analysis requires GROQ_API_KEY to be set in backend/.env.');
    }

    const docId = uuidv4();
    documentStore.set(docId, {
        type: 'image',
        filename: originalname,
        mimetype: IMAGE_MIME_TYPES.includes(mimetype) ? mimetype : 'image/jpeg',
        base64: buffer.toString('base64'),
        uploadedAt: new Date(),
    });

    return {
        docId,
        filename: originalname,
        type: 'image',
        preview: `data:${IMAGE_MIME_TYPES.includes(mimetype) ? mimetype : 'image/jpeg'};base64,${buffer.toString('base64')}`,
    };
};

const ingestDocument = async (buffer, mimetype, originalname) => {
    if (isImageFile(mimetype, originalname)) {
        return ingestImage(buffer, mimetype, originalname);
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
        throw new Error('File is too large (max 15MB).');
    }
    const text = await extractText(buffer, mimetype, originalname);
    if (!text || !text.trim()) {
        throw new Error('Could not extract any readable text from this file.');
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
        throw new Error('Document appears to be empty after cleaning.');
    }

    const { idf, chunkVectors } = buildTfIdfIndex(chunks);
    const docId = uuidv4();
    documentStore.set(docId, {
        type: 'text',
        filename: originalname,
        chunks,
        idf,
        chunkVectors,
        uploadedAt: new Date(),
    });

    return {
        docId,
        filename: originalname,
        type: 'text',
        numChunks: chunks.length,
        charCount: text.length,
        preview: chunks[0].text.slice(0, 220),
    };
};

const RAG_SYSTEM_PROMPT = `You are a document Q&A assistant. Answer the user's question using ONLY the CONTEXT excerpts provided below, which were retrieved from a document they uploaded.

Rules:
- If the answer is present in the context, answer it clearly and directly, citing specifics from the text.
- If the context does not contain enough information to answer, say so plainly instead of guessing or using outside knowledge.
- Use Markdown formatting (bullet points, bold) where it improves readability.
- Be concise — a few sentences or a short list, not an essay, unless the question clearly asks for more detail.`;

const IMAGE_SYSTEM_PROMPT = `You are an image analysis assistant. Look at the image the user uploaded and answer their question about it as accurately and specifically as possible.

Rules:
- Describe only what is actually visible in the image — do not invent details.
- If the image contains text (a document, a screenshot, handwriting, a whiteboard, code, etc.), read and use it to answer.
- If the question can't be answered from what's visible, say so plainly.
- Use Markdown formatting where it improves readability.
- Be concise and direct.`;

const answerTextDocument = async (doc, question) => {
    const relevantChunks = retrieveRelevantChunks(doc, question, 4);
    const context = relevantChunks
        .map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`)
        .join('\n\n---\n\n');

    const userPrompt = `CONTEXT (from "${doc.filename}"):\n\n${context}\n\n---\n\nQUESTION: ${question}`;
    const answer = await geminiService.generateWithSystemPrompt(RAG_SYSTEM_PROMPT, userPrompt);

    return {
        answer,
        sources: relevantChunks.map((c) => ({ excerpt: c.text.slice(0, 160) + (c.text.length > 160 ? '…' : '') })),
    };
};

const answerImageQuestion = async (doc, question) => {
    const answer = await groqService.generateVisionChat(doc.base64, doc.mimetype, question, IMAGE_SYSTEM_PROMPT);
    return { answer, sources: [] };
};

const answerQuestion = async (docId, question) => {
    const doc = documentStore.get(docId);
    if (!doc) {
        throw new Error('Document not found. It may have expired — please re-upload it.');
    }

    return doc.type === 'image' ? answerImageQuestion(doc, question) : answerTextDocument(doc, question);
};

const deleteDocument = (docId) => documentStore.delete(docId);

const getDocumentInfo = (docId) => {
    const doc = documentStore.get(docId);
    if (!doc) return null;
    return {
        docId,
        filename: doc.filename,
        type: doc.type,
        numChunks: doc.chunks?.length,
        uploadedAt: doc.uploadedAt,
    };
};

module.exports = {
    ingestDocument,
    answerQuestion,
    deleteDocument,
    getDocumentInfo,
};
