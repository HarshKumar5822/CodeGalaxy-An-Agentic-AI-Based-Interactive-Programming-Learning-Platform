// Groq provider — uses Groq's OpenAI-compatible Chat Completions API (https://groq.com).
// Groq runs open models (Llama, GPT-OSS, Qwen, etc.) on their own LPU hardware, so replies
// come back in well under a second even for 8B-70B class models — this is why it's used here
// instead of/alongside local Ollama or Gemini.
//
// SETUP (backend/.env):
//   GROQ_API_KEY=gsk_...              (from https://console.groq.com/keys)
//   GROQ_MODEL=llama-3.1-8b-instant   (used for both JSON + chat unless overridden below)
//   AI_PROVIDER=groq
//
// Optional overrides (only needed if you want different models for structured JSON output
// vs conversational chat):
//   GROQ_JSON_MODEL=...
//   GROQ_CHAT_MODEL=...
//
// NOTE ON MODEL DEPRECATION: Groq retires models on a schedule (see
// https://console.groq.com/docs/deprecations). `llama-3.1-8b-instant` is scheduled to be shut
// down around 2026-08-16 in favor of `openai/gpt-oss-20b`. If your chat requests suddenly start
// failing with a 400/404 "model not found" error after that date, update GROQ_MODEL in .env (or
// check the deprecations page for the current recommended replacement) — no code changes needed.
//
// VISION: Groq's multimodal (image-understanding) lineup changes especially often — several
// vision models have been deprecated within months of release. `qwen/qwen3.6-27b` is the
// current documented vision-capable model as of this writing, but Groq serves it as a preview
// model (fine for a project like this, not guaranteed stable for production). If image uploads
// start failing, check https://console.groq.com/docs/vision for the current model name and
// update GROQ_VISION_MODEL in .env — no code changes needed.

const GROQ_BASE_URL = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_JSON_MODEL = process.env.GROQ_JSON_MODEL || process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const GROQ_VISION_MODEL = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.6-27b';

const isGroqConfigured = () => Boolean(GROQ_API_KEY);

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${GROQ_API_KEY}`,
});

// Structured/JSON generation — same role as ollamaService.generateJSON: used for challenge
// generation, code analysis, debugging, interview quiz/coding/evaluation, skill profiling, etc.
const generateJSON = async (prompt, options = {}) => {
    if (!isGroqConfigured()) {
        throw new Error('GROQ_API_KEY is not set in backend/.env');
    }

    const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            model: options.model || GROQ_JSON_MODEL,
            messages: [
                // response_format: json_object requires the word "json" to appear somewhere in
                // the conversation — this system message guarantees that regardless of prompt.
                { role: 'system', content: 'You always respond with a single valid JSON object and nothing else.' },
                { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: options.temperature ?? 0.3,
            top_p: 0.9,
            max_tokens: options.max_tokens ?? 1536,
        }),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Groq request failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content;
};

const buildChatMessages = (message, history, systemInstruction) => {
    const messages = [];
    if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
    }
    (history || []).forEach((msg) => {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.parts?.[0]?.text || msg.text || '',
        });
    });
    messages.push({ role: 'user', content: message });
    return messages;
};

// Conversational chat (non-streaming) — used by the CodeGalaxy AI chatbot widget when a caller
// wants the full text at once.
const generateChat = async (message, history = [], systemInstruction = '') => {
    if (!isGroqConfigured()) {
        throw new Error('GROQ_API_KEY is not set in backend/.env');
    }

    const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            model: GROQ_CHAT_MODEL,
            messages: buildChatMessages(message, history, systemInstruction),
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1024,
            stream: false,
        }),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Groq chat request failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content;
};

// Streaming chat — calls onToken(chunkText) as each piece of the reply arrives, mirroring
// ollamaService.generateChatStream's signature so the controller can use either provider
// interchangeably. Groq's LPU hardware makes even 70B-class models stream back near-instantly,
// so this is the fastest option of the three providers wired into this app.
const generateChatStream = async (message, history = [], systemInstruction = '', onToken = () => {}) => {
    if (!isGroqConfigured()) {
        throw new Error('GROQ_API_KEY is not set in backend/.env');
    }

    const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            model: GROQ_CHAT_MODEL,
            messages: buildChatMessages(message, history, systemInstruction),
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 1024,
            stream: true,
        }),
    });

    if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Groq chat request failed (${res.status}): ${errText}`);
    }

    // Groq streams OpenAI-style Server-Sent Events: lines prefixed "data: {...}", terminated
    // by a final "data: [DONE]" line.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);
            if (!line || !line.startsWith('data:')) continue;

            const payload = line.slice('data:'.length).trim();
            if (payload === '[DONE]') continue;

            let parsed;
            try {
                parsed = JSON.parse(payload);
            } catch {
                continue; // ignore partial/malformed chunks
            }

            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) {
                fullText += chunk;
                onToken(chunk);
            }
        }
    }

    return fullText;
};

// Vision (image understanding) — sends an image + a question to a multimodal Groq model using
// the standard OpenAI-compatible content-array format (text block + image_url block with a
// base64 data URI). Used by the RAG feature's image upload: user attaches a photo, asks
// questions, gets answers grounded in what's actually in the image.
const generateVisionChat = async (base64Image, mimeType, question, systemPrompt = '') => {
    if (!isGroqConfigured()) {
        throw new Error('GROQ_API_KEY is not set in backend/.env');
    }

    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({
        role: 'user',
        content: [
            { type: 'text', text: question },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
        ],
    });

    const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
            model: GROQ_VISION_MODEL,
            messages,
            temperature: 0.5,
            max_tokens: 1024,
        }),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Groq vision request failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content;
};

module.exports = {
    generateJSON,
    generateChat,
    generateChatStream,
    generateVisionChat,
    isGroqConfigured,
    GROQ_BASE_URL,
    GROQ_JSON_MODEL,
    GROQ_CHAT_MODEL,
    GROQ_VISION_MODEL,
};
