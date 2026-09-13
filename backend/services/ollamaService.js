// Local LLM provider using Ollama (https://ollama.com) — runs entirely on your own machine,
// no API key, no quota, no external network call. Used as:
//   1. A drop-in replacement when AI_PROVIDER=ollama in backend/.env
//   2. An automatic fallback when AI_PROVIDER=auto (default) and the Gemini call fails
//      (bad/expired key, quota exceeded, no internet, etc.)
//
// SETUP (one-time, on the machine that runs the backend):
//   1. Install Ollama: https://ollama.com/download
//   2. Pull the models this app is tuned for:
//        ollama pull qwen2.5-coder:7b   -> code/JSON generation (challenges, analysis, debug, interview coding)
//        ollama pull llama3.1:8b        -> conversational chatbot replies
//      (If your machine is low on RAM/VRAM, use the ":3b"/"1.5b" tagged variants instead —
//       see OLLAMA_MODEL / OLLAMA_CHAT_MODEL below.)
//   3. Make sure the Ollama server is running (it starts automatically after install, or run
//      `ollama serve` manually). It listens on http://localhost:11434 by default.
//   4. In backend/.env set (or leave the defaults — they already match the above):
//        AI_PROVIDER=auto
//        OLLAMA_BASE_URL=http://localhost:11434
//        OLLAMA_MODEL=qwen2.5-coder:7b
//        OLLAMA_CHAT_MODEL=llama3.1:8b

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
// qwen2.5-coder is a code-specialized model — noticeably better than general chat models at
// producing correct starter code, test cases, and structured JSON for this platform's
// challenge/interview generation prompts.
const OLLAMA_JSON_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';
// A general-purpose instruction model reads more naturally for open-ended chatbot conversation.
const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || OLLAMA_JSON_MODEL;

let ollamaAvailabilityCache = { checked: 0, available: null };

// Cheap reachability check so we don't wait out a long fetch timeout on every single request
// when Ollama simply isn't running. Cached for 30s so it doesn't add overhead per-request.
const isOllamaReachable = async () => {
    const now = Date.now();
    if (ollamaAvailabilityCache.available !== null && now - ollamaAvailabilityCache.checked < 30000) {
        return ollamaAvailabilityCache.available;
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal });
        clearTimeout(timeout);
        ollamaAvailabilityCache = { checked: now, available: res.ok };
        return res.ok;
    } catch (e) {
        ollamaAvailabilityCache = { checked: now, available: false };
        return false;
    }
};

// Structured/JSON generation — used for challenge generation, code analysis, debugging,
// interview quiz/coding/evaluation, skill profiling, etc.
// `format: 'json'` tells Ollama to constrain output to valid JSON (supported since Ollama 0.1.x+).
const generateJSON = async (prompt, options = {}) => {
    const reachable = await isOllamaReachable();
    if (!reachable) {
        throw new Error(`Ollama is not reachable at ${OLLAMA_BASE_URL}. Is 'ollama serve' running?`);
    }

    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: options.model || OLLAMA_JSON_MODEL,
            prompt,
            format: 'json',
            stream: false,
            options: {
                // Lower temperature: these prompts want correct, consistent, parseable JSON
                // (test cases, code templates) rather than creative variety.
                temperature: options.temperature ?? 0.3,
                top_p: 0.9,
                num_predict: options.num_predict ?? 1024,
                // Larger context window so full challenge descriptions / code / chat history fit.
                num_ctx: options.num_ctx ?? 8192,
            }
        })
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Ollama request failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.response;
};

// Shared message-array builder for the chatbot.
const buildChatMessages = (message, history, systemInstruction) => {
    const messages = [];
    if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
    }
    (history || []).forEach(msg => {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.parts?.[0]?.text || msg.text || ''
        });
    });
    messages.push({ role: 'user', content: message });
    return messages;
};

// Conversational chat (non-streaming) — kept for any caller that wants the full text at once.
const generateChat = async (message, history = [], systemInstruction = '') => {
    const reachable = await isOllamaReachable();
    if (!reachable) {
        throw new Error(`Ollama is not reachable at ${OLLAMA_BASE_URL}. Is 'ollama serve' running?`);
    }

    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_CHAT_MODEL,
            messages: buildChatMessages(message, history, systemInstruction),
            stream: false,
            // Keep the model resident in memory between requests so we don't pay the
            // multi-second (sometimes 30s+) reload cost on every single chat message.
            keep_alive: '30m',
            options: {
                temperature: 0.7,
                top_p: 0.9,
                // Trimmed down from 1024/8192 — a chatbot reply rarely needs to be an essay,
                // and a smaller context window means far less prompt to chew through on
                // every request, which is the single biggest lever for reducing latency on
                // CPU-only / low-VRAM machines.
                num_predict: 512,
                num_ctx: 4096,
            }
        })
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Ollama chat request failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.message?.content;
};

// Streaming chat — calls `onToken(chunkText)` as each piece of the reply arrives from Ollama,
// so the UI can render text progressively instead of waiting for the whole answer.
// Returns the full concatenated reply once the stream ends.
const generateChatStream = async (message, history = [], systemInstruction = '', onToken = () => {}) => {
    const reachable = await isOllamaReachable();
    if (!reachable) {
        throw new Error(`Ollama is not reachable at ${OLLAMA_BASE_URL}. Is 'ollama serve' running?`);
    }

    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_CHAT_MODEL,
            messages: buildChatMessages(message, history, systemInstruction),
            stream: true,
            keep_alive: '30m',
            options: {
                temperature: 0.7,
                top_p: 0.9,
                num_predict: 512,
                num_ctx: 4096,
            }
        })
    });

    if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => res.statusText);
        throw new Error(`Ollama chat request failed (${res.status}): ${errText}`);
    }

    // Ollama streams newline-delimited JSON objects, one per token/chunk.
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
            if (!line) continue;

            let parsed;
            try {
                parsed = JSON.parse(line);
            } catch {
                continue; // ignore malformed/partial lines
            }

            const chunk = parsed.message?.content;
            if (chunk) {
                fullText += chunk;
                onToken(chunk);
            }
        }
    }

    return fullText;
};

module.exports = {
    generateJSON,
    generateChat,
    generateChatStream,
    isOllamaReachable,
    OLLAMA_BASE_URL,
    OLLAMA_JSON_MODEL,
    OLLAMA_CHAT_MODEL,
};
