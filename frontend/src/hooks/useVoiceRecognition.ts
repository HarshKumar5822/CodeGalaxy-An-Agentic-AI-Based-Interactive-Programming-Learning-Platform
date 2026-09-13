import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal shape of the Web Speech API's SpeechRecognition — not in TS's default DOM lib,
// so we type just what we use here instead of pulling in a full ambient declaration file.
interface SpeechRecognitionResultLike {
    isFinal: boolean;
    0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
    resultIndex: number;
    results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    }
}

interface UseVoiceRecognitionOptions {
    // 'en-IN' handles Hinglish / code-mixed Hindi-English speech noticeably better than
    // plain 'en-US' in Chrome, which is why it's the default for this Indian-audience app.
    lang?: string;
    // How long to wait, after the user stops producing new speech, before treating the
    // utterance as "finished" and firing onFinalResult. The Web Speech API gives us no direct
    // control over this — Chrome ends an utterance on its own after ~1-2s of silence — so we
    // implement our own tolerance on top by never trusting the browser's "isFinal" timing and
    // instead resetting our own timer on every result (interim or final). Keep this comfortably
    // above your longest expected thinking-pause (5000-6000ms covers "pause up to 5s").
    silenceTimeoutMs?: number;
    // If true (default), the mic keeps listening indefinitely across multiple utterances —
    // each time the silence timer fires, the accumulated phrase is delivered via onFinalResult
    // and listening continues automatically for the next one, until stopListening() is called.
    // Set false for one-shot dictation (e.g. filling a single text box) where it should stop
    // after the first completed phrase.
    continuous?: boolean;
    onFinalResult?: (text: string) => void;
}

interface UseVoiceRecognitionReturn {
    isListening: boolean;
    // True whenever "assistant mode" is turned on — including brief moments where the mic is
    // paused (e.g. while the assistant is speaking) but will resume automatically. Use this for
    // an on/off toggle UI; use isListening for "is it actively capturing my voice right now".
    isActive: boolean;
    isSupported: boolean;
    interimTranscript: string;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    toggleListening: () => void;
    // Temporarily silences the mic without ending "assistant mode" — use this while the
    // assistant's own voice (TTS) is playing, so it doesn't hear and transcribe itself.
    pauseListening: () => void;
    resumeListening: () => void;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}): UseVoiceRecognitionReturn {
    const { lang = 'en-IN', silenceTimeoutMs = 6000, continuous = true, onFinalResult } = options;

    const [isListening, setIsListening] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
    const onFinalResultRef = useRef(onFinalResult);
    onFinalResultRef.current = onFinalResult;

    // activeRef: user wants the assistant listening at all (survives brief pause/resume cycles
    // and browser-initiated restarts). manualStopRef: true only when the user explicitly stopped
    // it — this is what prevents auto-restart from reviving a session they deliberately ended.
    const activeRef = useRef(false);
    const manualStopRef = useRef(false);
    const pausedRef = useRef(false);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const accumulatedFinalRef = useRef('');
    const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const SpeechRecognitionCtor =
        typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : undefined;
    const isSupported = Boolean(SpeechRecognitionCtor);

    const clearSilenceTimer = () => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    };

    const finalizeUtterance = useCallback(() => {
        clearSilenceTimer();
        const text = accumulatedFinalRef.current.trim();
        accumulatedFinalRef.current = '';
        setInterimTranscript('');
        if (text) {
            onFinalResultRef.current?.(text);
        }
        if (!continuous) {
            // One-shot mode: stop entirely after delivering the phrase.
            manualStopRef.current = true;
            activeRef.current = false;
            setIsActive(false);
            recognitionRef.current?.stop();
        }
        // In continuous mode we deliberately do nothing else here — the recognizer keeps
        // running (or gets auto-restarted by onend below) so the mic stays live.
    }, [continuous]);

    const armSilenceTimer = () => {
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(finalizeUtterance, silenceTimeoutMs);
    };

    const attachAndStart = useCallback(() => {
        if (!SpeechRecognitionCtor) {
            setError('Voice input is not supported in this browser. Try Chrome or Edge.');
            return;
        }

        const recognition = new SpeechRecognitionCtor();
        recognition.lang = lang;
        // Always true internally — we do our own end-of-speech detection via the silence
        // timer above, rather than trusting the browser's own (uncontrollable, ~1-2s) cutoff.
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            setError(null);
            setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    accumulatedFinalRef.current = (accumulatedFinalRef.current + ' ' + result[0].transcript).trim();
                } else {
                    interim += result[0].transcript;
                }
            }
            setInterimTranscript(interim);
            // Any speech activity (interim or final) means the user is still talking —
            // push the "are they done yet?" decision back out by silenceTimeoutMs.
            armSilenceTimer();
        };

        recognition.onerror = (event: any) => {
            const code = event?.error;
            if (code === 'no-speech') {
                // Expected in continuous mode during quiet gaps — not a real error, and the
                // onend handler below will transparently restart the session if needed.
                return;
            }
            if (code === 'not-allowed' || code === 'service-not-allowed') {
                setError('Microphone access denied. Please allow mic permissions.');
                manualStopRef.current = true;
                activeRef.current = false;
                return;
            }
            if (code === 'aborted') {
                return; // caused by our own stop()/abort() calls; not a user-facing error
            }
            setError('Voice recognition error: ' + code);
        };

        recognition.onend = () => {
            recognitionRef.current = null;
            setIsListening(false);

            // If the browser ended the session on its own (network hiccup, internal timeout,
            // etc.) but the user hasn't manually stopped or paused it, silently restart so the
            // mic effectively never "gives up" until the user says so.
            if (activeRef.current && !manualStopRef.current && !pausedRef.current) {
                restartTimeoutRef.current = setTimeout(() => {
                    if (activeRef.current && !manualStopRef.current && !pausedRef.current) {
                        attachAndStart();
                    }
                }, 250);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [SpeechRecognitionCtor, lang]);

    useEffect(() => {
        return () => {
            activeRef.current = false;
            manualStopRef.current = true;
            clearSilenceTimer();
            if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
            recognitionRef.current?.abort();
        };
    }, []);

    const startListening = useCallback(() => {
        if (activeRef.current) return; // already running
        activeRef.current = true;
        manualStopRef.current = false;
        pausedRef.current = false;
        accumulatedFinalRef.current = '';
        setIsActive(true);
        attachAndStart();
    }, [attachAndStart]);

    const stopListening = useCallback(() => {
        activeRef.current = false;
        manualStopRef.current = true;
        pausedRef.current = false;
        clearSilenceTimer();
        accumulatedFinalRef.current = '';
        setInterimTranscript('');
        setIsActive(false);
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        recognitionRef.current?.stop();
    }, []);

    // Mutes the mic without turning off "assistant mode" — used while the assistant is
    // speaking its reply aloud, so it doesn't pick up and transcribe its own voice.
    const pauseListening = useCallback(() => {
        if (!activeRef.current) return;
        pausedRef.current = true;
        clearSilenceTimer();
        accumulatedFinalRef.current = '';
        setInterimTranscript('');
        recognitionRef.current?.stop();
    }, []);

    const resumeListening = useCallback(() => {
        if (!activeRef.current || !pausedRef.current) return;
        pausedRef.current = false;
        attachAndStart();
    }, [attachAndStart]);

    const toggleListening = useCallback(() => {
        if (activeRef.current) {
            stopListening();
        } else {
            startListening();
        }
    }, [startListening, stopListening]);

    return {
        isListening,
        isActive,
        isSupported,
        interimTranscript,
        error,
        startListening,
        stopListening,
        toggleListening,
        pauseListening,
        resumeListening,
    };
}
