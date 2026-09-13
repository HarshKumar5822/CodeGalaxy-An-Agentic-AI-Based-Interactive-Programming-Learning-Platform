import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, Sparkles, Loader2, Maximize2, Minimize2, Trash2, Copy, Check, Mic, MicOff, Volume2, VolumeX, Plus, FileText, XCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '@/utils/speak';
import { getPageContext } from '@/utils/pageModules';

// Base API URL (same logic as src/utils/api.ts) — used here directly because streaming
// responses need the raw fetch() Reader API, which axios doesn't expose.
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5005/api';

interface Message {
    id: string;
    sender: 'ai' | 'user';
    text: string;
    timestamp: Date;
    streaming?: boolean;
}

const INITIAL_MESSAGE: Message = {
    id: 'init-1',
    sender: 'ai',
    text: 'Hi there! I am your CodeGalaxy AI learning assistant. Ask me anything about the platform, code challenges, or general programming help!',
    timestamp: new Date()
};

// Gemini initialization moved to backend for secure API key handling

const getFallbackResponse = (input: string, context: string) => {
    const lowerInput = input.toLowerCase();

    // Contextual Help based on Page
    if (context.includes('Coding Challenge')) {
        if (lowerInput.includes('stuck') || lowerInput.includes('help')) {
            return "I see you're working on a challenge! Try breaking the problem down. What data structures might be useful here? Array? Hashmap?";
        }
        if (lowerInput.includes('error') || lowerInput.includes('bug')) {
            return "Errors are stepping stones to success. Check the terminal output at the bottom right—it usually points to the exact line number.";
        }
        if (lowerInput.match(/solution|answer|code/)) {
            return "I won't give you the exact code—that ruins the fun! But I suggest you look closely at the Example Output in the left panel.";
        }
        if (lowerInput.includes('visualizer')) {
            return "The visualizer actively tracks memory and execution time in real-time as your code runs. It's a great tool to benchmark algorithms!";
        }
    }

    if (context.includes('Dashboard')) {
        if (lowerInput.includes('what') || lowerInput.includes('next')) {
            return "Based on your progress, you should head to the 'Challenges' tab to earn some more XP!";
        }
        if (lowerInput.includes('xp')) {
            return "XP is your mastery points! The more modules and challenges you solve, the higher you rank on the global leaderboard.";
        }
    }

    if (context.includes('Learning Paths') || context.includes('Modules')) {
        return "These curated modules are designed to take you step-by-step. Make sure to read the articles fully before taking the quizzes!";
    }

    if (context.includes('Leaderboard')) {
        return "The leaderboard is updated in real-time. Earn XP points by completing challenges to climb the ranks!";
    }

    // General Tech inquiries (Prioritized over Greetings)
    if (lowerInput.includes('python')) return "Python is a high-level, interpreted programming language incredibly popular for machine learning, data science, and algorithmic scripting. It emphasizes readability and minimal syntax. Remember to watch your indentation!";
    if (lowerInput.includes('javascript') || lowerInput.includes('js')) return "JavaScript powers the interactive web. It evolved from browser-only to full-stack with Node.js. Remember that it's single-threaded and asynchronous!";
    if (lowerInput.includes('react')) return "React is a JavaScript library for building user interfaces with reusable components! CodeGalaxy is actually built with React, Vite, and Tailwind CSS.";
    if (lowerInput.includes('java')) return "Java is a class-based, object-oriented programming language designed to have as few implementation dependencies as possible. 'Write once, run anywhere!'";
    if (lowerInput.includes('c++')) return "C++ is a high-performance language widely used for game engines, operating systems, and competitive programming where hardware-level control matters.";

    // Greetings
    if (lowerInput.match(/\b(hello|hi|hey|greetings|hola)\b/)) {
        const greets = [
            "Hello! CodeGalaxy AI here. I see you're " + (context.includes('Dashboard') ? 'on your dashboard.' : 'working hard!') + " How can I assist?",
            "Hi there! Ready to learn something new today?",
            "Greetings! I am currently running in my offline intelligence engine, but I can still help you navigate!",
        ];
        return greets[Math.floor(Math.random() * greets.length)];
    }

    // Fallbacks
    const generics = [
        "That's an interesting point. How would you approach solving that?",
        "I'm operating without my Gemini API link right now, but I still believe in you! Keep going!",
        "Could you elaborate on that? In offline mode, I'm best at giving hints about your current page.",
        "Remember, the key to mastery is consistency. You're doing great.",
        "I don't have a specific answer for that in my offline database, but I suggest checking the CodeGalaxy documentation or diving back into the code!"
    ];
    return generics[Math.floor(Math.random() * generics.length)];
};

// Reusable custom code block with Copy button
const CodeBlock: React.FC<{ children: string; className?: string }> = ({ children, className }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy code block: ", err);
        }
    };

    const language = className?.replace('language-', '') || 'code';

    return (
        <div className="relative group/code my-2 border border-white/10 rounded-lg overflow-hidden bg-black/40">
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5 text-[10px] text-gray-400 font-mono">
                <span className="uppercase tracking-wider font-semibold text-cq-green">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 hover:text-cq-green text-gray-400 transition-colors p-1 rounded hover:bg-white/5"
                >
                    {copied ? (
                        <>
                            <Check className="w-3 h-3 text-cq-green" />
                            <span className="text-cq-green font-medium">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className="p-3 overflow-x-auto max-w-full">
                <code className="text-xs font-mono text-cq-green break-all whitespace-pre-wrap">{children}</code>
            </pre>
        </div>
    );
};

const AIChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // RAG attachment state — a PDF/TXT document or an image the user uploaded via the "+"
    // button. While one is attached, chat messages are answered from its content (text
    // retrieval for documents, direct vision Q&A for images) instead of the general assistant.
    const [attachedDoc, setAttachedDoc] = useState<{ docId: string; filename: string; type: 'text' | 'image'; preview?: string } | null>(null);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Voice input: tap the mic once to turn the assistant ON. It then listens continuously —
    // short pauses while thinking don't stop it, only a real gap (silenceTimeoutMs) finalizes
    // a phrase and sends it. The mic is briefly paused while the assistant is generating/
    // speaking its reply (so it doesn't hear and transcribe itself), then automatically resumes
    // listening for your next command — a real back-and-forth conversation, not one-shot dictation.
    const voice = useVoiceRecognition({
        lang: 'en-IN',
        continuous: true,
        silenceTimeoutMs: 6000, // tolerates pauses up to ~5-6s before treating speech as finished
        onFinalResult: (text) => {
            voice.pauseListening();
            setInputValue('');
            sendChatMessage(text, true);
        },
    });

    useEffect(() => {
        if (voice.error) {
            toast.error(voice.error);
        }
    }, [voice.error]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleClearChat = () => {
        setMessages([INITIAL_MESSAGE]);
        stopSpeaking();
    };

    const getAuthToken = (): string | null => {
        const userInfoStr = localStorage.getItem('userInfo');
        try {
            return userInfoStr ? JSON.parse(userInfoStr)?.token : null;
        } catch {
            return null;
        }
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // allow re-selecting the same file later
        if (!file) return;

        const isAllowed = /\.(pdf|txt|md|jpe?g|png|webp|gif)$/i.test(file.name);
        if (!isAllowed) {
            toast.error('Only PDF, TXT, and image files (JPG/PNG/WEBP/GIF) are supported.');
            return;
        }
        if (file.size > 15 * 1024 * 1024) {
            toast.error('File is too large (max 15MB).');
            return;
        }

        const token = getAuthToken();
        if (!token) {
            toast.error('Please log in to use document/image Q&A.');
            return;
        }

        setIsUploadingDoc(true);
        if (!isOpen) setIsOpen(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_URL}/rag/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets multipart boundary
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || 'Failed to process file');
            }

            setAttachedDoc({ docId: data.docId, filename: data.filename, type: data.type, preview: data.preview });

            const isImage = data.type === 'image';
            setMessages(prev => [...prev, {
                id: `sys-${Date.now()}`,
                sender: 'ai',
                text: isImage
                    ? `🖼️ **${data.filename}** attached. Ask me anything about this image — I'll analyze what's actually in it until you remove it.`
                    : `📄 **${data.filename}** attached (${data.numChunks} sections indexed). Ask me anything about it — I'll answer only from this document until you remove it.`,
                timestamp: new Date(),
            }]);
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload file');
        } finally {
            setIsUploadingDoc(false);
        }
    };

    const handleRemoveDoc = async () => {
        if (!attachedDoc) return;
        const token = getAuthToken();
        try {
            await fetch(`${API_URL}/rag/${attachedDoc.docId}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
        } catch {
            // best-effort cleanup — even if this fails, forgetting it client-side is enough
        }
        setAttachedDoc(null);
        toast.success('Attachment removed — back to normal chat.');
    };

    const getSuggestionsForPage = (pathname: string) => {
        if (pathname.startsWith('/challenge/')) {
            return [
                "Give me a hint 💡",
                "Explain the problem description 📝",
                "Check for bugs in my logic 🛠️"
            ];
        }
        if (pathname === '/learning-path') {
            return [
                "What is my next node? 🎯",
                "How do I earn more XP? ⚡",
                "Explain the learning map 🗺️"
            ];
        }
        if (pathname === '/dashboard') {
            return [
                "What should I study next? 📚",
                "Show my progress overview 📊",
                "How does the leaderboard work? 🏆"
            ];
        }
        // Default suggestions
        return [
            "What is CodeGalaxy? 🌌",
            "Give me a coding challenge 💻",
            "Explain React basics ⚛️"
        ];
    };

    const sendChatMessage = async (text: string, viaVoice: boolean = false) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: `user-${Date.now()}-${Math.random()}`,
            sender: 'user',
            text: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        if (!isOpen) setIsOpen(true); // voice command fired from elsewhere on the page opens the panel

        // Injecting Page Context Awareness — pulls detailed module/feature descriptions from
        // the shared registry so the assistant can genuinely explain "what's on this page"
        // instead of a vague one-liner.
        const currentPageInfo = getPageContext(location.pathname);

        const getSimulatedReply = () => getFallbackResponse(text, currentPageInfo);
        const maybeSpeak = (finalText: string) => {
            if (!viaVoice) return;
            if (voiceReplyEnabled && isSpeechSynthesisSupported()) {
                // Resume listening exactly when the assistant finishes talking, not before —
                // otherwise the mic would pick up its own voice and "hear" a fake command.
                speakText(finalText, 'en-IN', () => voice.resumeListening());
            } else {
                // Nothing was spoken, so there's no TTS-end event to wait for — resume now.
                voice.resumeListening();
            }
        };

        try {
            const userInfoStr = localStorage.getItem('userInfo');
            let userInfo = null;
            if (userInfoStr) {
                try {
                    userInfo = JSON.parse(userInfoStr);
                } catch (e) {}
            }

            // Document/image Q&A mode: something is attached, so answer from it instead of the
            // general assistant. Plain JSON endpoint (no streaming) since retrieval/vision +
            // answering happens in one backend round trip.
            if (attachedDoc) {
                if (!userInfo?.token) {
                    throw new Error('Please log in to use document/image Q&A.');
                }
                const ragRes = await fetch(`${API_URL}/rag/ask`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                    body: JSON.stringify({ docId: attachedDoc.docId, question: text }),
                });
                const ragData = await ragRes.json();
                if (!ragRes.ok) {
                    throw new Error(ragData?.message || 'Failed to answer from attachment');
                }
                setMessages(prev => [...prev, {
                    id: `ai-${Date.now()}-${Math.random()}`,
                    sender: 'ai',
                    text: ragData.answer,
                    timestamp: new Date(),
                }]);
                maybeSpeak(ragData.answer);
                return;
            }

            const res = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {}),
                },
                body: JSON.stringify({
                    message: text,
                    history: [...messages, userMsg],
                    pageContext: currentPageInfo,
                }),
            });

            if (!res.ok || !res.body) {
                throw new Error(`Chat request failed (${res.status})`);
            }

            const aiMsgId = `ai-${Date.now()}-${Math.random()}`;
            setIsTyping(false); // first chunk is about to arrive; swap typing dots for live text
            setMessages(prev => [...prev, {
                id: aiMsgId,
                sender: 'ai',
                text: '',
                timestamp: new Date(),
                streaming: true,
            }]);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                if (!chunk) continue;
                fullText += chunk;
                setMessages(prev => prev.map(m =>
                    m.id === aiMsgId ? { ...m, text: m.text + chunk } : m
                ));
            }
            setMessages(prev => prev.map(m =>
                m.id === aiMsgId ? { ...m, streaming: false } : m
            ));
            maybeSpeak(fullText);
        } catch (error: any) {
            console.error("AI Generation Error:", error);

            if (attachedDoc) {
                // Don't mask document/image Q&A failures behind the generic "offline mode"
                // canned reply — that would be actively misleading (e.g. an auth error looking
                // like a real answer about the file). Surface it honestly instead.
                toast.error(error?.message || 'Failed to answer from the attached file.');
                setMessages(prev => [...prev, {
                    id: `ai-${Date.now()}-${Math.random()}`,
                    sender: 'ai',
                    text: `⚠️ Couldn't answer from **${attachedDoc.filename}**: ${error?.message || 'something went wrong'}. You can try again or remove the attachment.`,
                    timestamp: new Date(),
                }]);
                return;
            }

            // Dynamic Fallback to simulated offline reply if API key is invalid, exceeded quota, or blocked
            await new Promise(resolve => setTimeout(resolve, 1000)); // Artificial wait so it doesn't instantly snap
            const reply = getSimulatedReply();
            setMessages(prev => [...prev, {
                id: `ai-${Date.now()}-${Math.random()}`,
                sender: 'ai',
                text: reply,
                timestamp: new Date()
            }]);
            maybeSpeak(reply);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const text = inputValue;
        setInputValue('');
        await sendChatMessage(text);
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
                    >
                        {voice.isSupported && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={voice.toggleListening}
                                title={voice.isActive ? "Voice assistant is ON — tap to turn off" : "Turn on voice assistant"}
                                className={`p-4 rounded-full shadow-[0_0_25px_rgba(0,255,136,0.35)] flex items-center justify-center transition-all duration-200 ${
                                    voice.isListening
                                        ? 'bg-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.45)] animate-pulse'
                                        : 'bg-cq-green hover:bg-cq-green/90 text-cq-dark'
                                }`}
                            >
                                {voice.isActive ? <MicOff className="w-6 h-6 text-cq-dark" /> : <Mic className="w-6 h-6 text-cq-dark" />}
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsOpen(true)}
                            className="p-4 bg-cq-green hover:bg-cq-green/90 text-cq-dark rounded-full shadow-[0_0_25px_rgba(0,255,136,0.35)] flex items-center justify-center transition-all duration-200"
                        >
                            <Bot className="w-6 h-6" />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Interface Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`fixed bottom-6 right-6 z-50 rounded-2xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.55)] flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-[#0f1012]/95 backdrop-blur-md shadow-[0_0_40px_rgba(33,193,82,0.06)]
                            ${isExpanded 
                                ? 'w-[95vw] sm:w-[720px] h-[800px] max-h-[90vh]' 
                                : 'w-[90vw] sm:w-[460px] h-[720px] max-h-[85vh]'
                            }`}
                    >
                        {/* Header */}
                        <div className="px-4 py-3.5 bg-[#161719] border-b border-white/10 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cq-green/20 flex items-center justify-center border border-cq-green/30 relative">
                                    <Bot className="w-5 h-5 text-cq-green" />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-cq-green border-2 border-[#161719]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-display font-semibold text-sm flex items-center gap-1.5">
                                        CodeGalaxy AI <Sparkles className="w-3.5 h-3.5 text-cq-gold animate-pulse" />
                                    </h3>
                                    <span className="text-[10px] text-cq-green font-mono font-medium tracking-wider uppercase">Active Assistant</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Voice reply mute toggle */}
                                {isSpeechSynthesisSupported() && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setVoiceReplyEnabled(v => !v);
                                            if (voiceReplyEnabled) stopSpeaking();
                                        }}
                                        title={voiceReplyEnabled ? "Mute spoken replies" : "Enable spoken replies"}
                                        className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 transition-colors"
                                    >
                                        {voiceReplyEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                    </Button>
                                )}
                                {/* Clear Chat Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearChat}
                                    title="Clear conversation"
                                    className="text-gray-400 hover:text-cq-red hover:bg-cq-red/10 rounded-full w-8 h-8 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                {/* Maximize / Minimize Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    title={isExpanded ? "Collapse panel" : "Expand panel"}
                                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 transition-colors"
                                >
                                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                                {/* Close Button */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    title="Close chat"
                                    className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20 bg-[#0b0c0d]">
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex items-start gap-2.5 max-w-[88%] min-w-0 ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-md ${
                                        msg.sender === 'user' 
                                            ? 'bg-cq-cyan/20 text-cq-cyan border-cq-cyan/30' 
                                            : 'bg-cq-green/20 text-cq-green border-cq-green/30'
                                    }`}>
                                        {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed min-w-0 flex-1 break-words shadow-sm ${
                                        msg.sender === 'user'
                                            ? 'bg-gradient-to-br from-cq-cyan/15 to-cq-purple/10 text-white border border-cq-cyan/25 rounded-tr-none'
                                            : 'bg-[#18191b] text-gray-200 border border-white/5 rounded-tl-none'
                                    }`}>
                                        {msg.sender === 'ai' ? (
                                            <div className="chat-markdown prose prose-invert max-w-none text-gray-200">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                                                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                                        em: ({ children }) => <em className="italic">{children}</em>,
                                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 break-words">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 break-words">{children}</ol>,
                                                        li: ({ children }) => <li className="break-words mb-0.5">{children}</li>,
                                                        a: ({ children, href }) => (
                                                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-cq-green hover:underline break-all">
                                                                {children}
                                                            </a>
                                                        ),
                                                        code: ({ className, children, ...props }) => {
                                                            const isBlock = /language-/.test(className || '');
                                                            const codeString = String(children).replace(/\n$/, '');
                                                            return isBlock ? (
                                                                <CodeBlock className={className}>{codeString}</CodeBlock>
                                                            ) : (
                                                                <code className="bg-black/40 px-1.5 py-0.5 rounded text-xs font-mono text-cq-green break-all whitespace-normal" {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                    }}
                                                >
                                                    {msg.text || (msg.streaming ? '' : '')}
                                                </ReactMarkdown>
                                                {msg.streaming && (
                                                    <span className="inline-block w-1.5 h-3.5 bg-cq-green/80 ml-0.5 animate-pulse align-middle" />
                                                )}
                                            </div>
                                        ) : (
                                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                        )}
                                        <div className={`text-[9px] mt-1.5 text-gray-500 font-mono ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-2.5 max-w-[85%] min-w-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-cq-green/20 text-cq-green flex items-center justify-center shrink-0 border border-cq-green/30">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="p-4 bg-[#18191b] border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-2 h-2 bg-cq-green/80 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-cq-green/80 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-cq-green/80 rounded-full" />
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestion Chips */}
                        {messages.length === 1 && !isTyping && (
                            <div className="px-4 py-3 bg-[#0f1011] shrink-0 border-t border-white/5 flex flex-col gap-2">
                                <span className="text-[10px] text-gray-500 font-mono tracking-wide uppercase">Quick Suggestions:</span>
                                <div className="flex flex-wrap gap-2">
                                    {getSuggestionsForPage(location.pathname).map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendChatMessage(suggestion)}
                                            className="text-xs bg-[#18191b] hover:bg-cq-green/20 hover:text-cq-green text-gray-300 px-3.5 py-2 rounded-full border border-white/5 hover:border-cq-green/30 transition-all duration-200 flex items-center gap-1 shadow-sm font-medium"
                                        >
                                            <span>{suggestion}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 bg-[#161719] border-t border-white/10 shrink-0">
                            {/* Hidden file input, triggered by the + button */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.txt,.md,.jpg,.jpeg,.png,.webp,.gif,application/pdf,text/plain,image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={handleFileSelected}
                            />

                            {attachedDoc && (
                                <div className="flex items-center justify-between gap-2 px-3 py-2 mb-2 rounded-xl bg-cq-green/10 border border-cq-green/25">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {attachedDoc.type === 'image' && attachedDoc.preview ? (
                                            <img src={attachedDoc.preview} alt={attachedDoc.filename} className="w-6 h-6 rounded object-cover shrink-0 border border-cq-green/30" />
                                        ) : attachedDoc.type === 'image' ? (
                                            <ImageIcon className="w-3.5 h-3.5 text-cq-green shrink-0" />
                                        ) : (
                                            <FileText className="w-3.5 h-3.5 text-cq-green shrink-0" />
                                        )}
                                        <span className="text-xs text-cq-green truncate" title={attachedDoc.filename}>
                                            {attachedDoc.filename}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveDoc}
                                        title="Remove attachment — return to normal chat"
                                        className="text-cq-green/70 hover:text-cq-red transition-colors shrink-0"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {voice.isActive && (
                                <div className="flex items-center gap-2 px-2 pb-2 text-[11px] font-mono">
                                    {voice.isListening ? (
                                        <>
                                            <span className="flex gap-0.5">
                                                <motion.span animate={{ height: [4, 12, 4] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }} className="w-0.5 bg-cq-green rounded-full inline-block" />
                                                <motion.span animate={{ height: [4, 14, 4] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }} className="w-0.5 bg-cq-green rounded-full inline-block" />
                                                <motion.span animate={{ height: [4, 10, 4] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }} className="w-0.5 bg-cq-green rounded-full inline-block" />
                                            </span>
                                            <span className="text-cq-green">{voice.interimTranscript || 'Voice assistant on — listening...'}</span>
                                        </>
                                    ) : (
                                        <span className="text-cq-gold">🎙️ Voice assistant on — thinking / responding...</span>
                                    )}
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingDoc}
                                    title={attachedDoc ? "Replace attachment" : "Attach a PDF/TXT/image to ask questions about it"}
                                    className="p-3 rounded-full bg-[#0b0c0d] border border-white/10 text-gray-400 hover:text-cq-green hover:border-cq-green/40 transition-colors shrink-0 disabled:opacity-50"
                                >
                                    {isUploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                </button>
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={voice.isActive ? "Voice assistant active..." : attachedDoc ? `Ask about ${attachedDoc.filename}...` : "Ask CodeGalaxy AI..."}
                                        disabled={voice.isActive}
                                        className="w-full bg-[#0b0c0d] border border-white/10 text-white text-sm rounded-full py-3.5 pl-5 pr-12 focus:outline-none focus:border-cq-green/50 focus:ring-1 focus:ring-cq-green/50 transition-all placeholder:text-gray-500 disabled:opacity-60"
                                    />
                                    {voice.isSupported && (
                                        <button
                                            type="button"
                                            onClick={voice.toggleListening}
                                            title={voice.isActive ? "Turn off voice assistant" : "Turn on voice assistant"}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                                                voice.isListening
                                                    ? 'bg-cq-red/20 text-cq-red animate-pulse'
                                                    : voice.isActive
                                                        ? 'bg-cq-gold/20 text-cq-gold'
                                                        : 'text-gray-400 hover:text-cq-green hover:bg-white/5'
                                            }`}
                                        >
                                            {voice.isActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping || voice.isActive}
                                    className="p-3.5 bg-cq-green text-cq-dark rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cq-green/90 transition-colors shadow-md shrink-0"
                                >
                                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatbot;
