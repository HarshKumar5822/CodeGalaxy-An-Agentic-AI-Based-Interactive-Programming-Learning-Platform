// Speaks text aloud via the browser's built-in speech synthesis, after stripping Markdown
// syntax so the assistant doesn't literally say "asterisk asterisk bold asterisk asterisk" or
// read out code fences / bullet dashes.
const stripMarkdownForSpeech = (text: string): string => {
    return text
        .replace(/```[\s\S]*?```/g, ' code block, check the chat for details. ') // fenced code
        .replace(/`([^`]+)`/g, '$1') // inline code
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> just the label
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
        .replace(/(\*|_)(.*?)\1/g, '$2') // italic
        .replace(/^#{1,6}\s+/gm, '') // headings
        .replace(/^\s*[-*+]\s+/gm, '') // bullet points
        .replace(/^\s*\d+\.\s+/gm, '') // numbered list markers
        .replace(/>\s?/g, '') // blockquotes
        .trim();
};

export const isSpeechSynthesisSupported = (): boolean =>
    typeof window !== 'undefined' && 'speechSynthesis' in window;

export const speakText = (text: string, lang = 'en-IN', onEnd?: () => void) => {
    if (!isSpeechSynthesisSupported() || !text.trim()) {
        onEnd?.();
        return;
    }

    // Cancel anything already queued/speaking so replies don't stack up.
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(stripMarkdownForSpeech(text));
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd; // still resume listening even if TTS itself fails
    }
    window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
    if (isSpeechSynthesisSupported()) {
        window.speechSynthesis.cancel();
    }
};
