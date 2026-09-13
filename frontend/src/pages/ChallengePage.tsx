import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Star, BookOpen, CheckCircle2, Volume2, VolumeX, Bot, Sparkles, Cpu, Zap, ArrowRight, Code2, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import CodeEditor, { Language } from '@/components/editor/CodeEditor';
import Terminal from '@/components/editor/Terminal';
import { Button } from '@/components/ui/button';
import { codeTemplates } from '@/data/mockData';
import ReactMarkdown from 'react-markdown';
import { submitCode, ExecutionResult, LANGUAGE_IDS } from '@/services/judge0';
import { toast } from 'sonner';
import api from '@/utils/api';

import ArticleView from '@/components/CodeGalaxy/Learning/ArticleView';
import QuizView from '@/components/CodeGalaxy/Learning/QuizView';
import AIChatbot from '@/components/CodeGalaxy/Learning/AIChatbot';
import { useGamification } from '@/contexts/GamificationContext';
import { ChallengeVisualizer } from '@/components/challenge/ChallengeVisualizer';

const ChallengePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const gamification = useGamification();
  const { awardXp } = gamification;
  const searchParams = new URLSearchParams(location.search);
  const backUrl = searchParams.get('from') === 'learning-path' ? '/learning-path' : '/challenges';

  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [leftTab, setLeftTab] = useState<'description' | 'copilot'>('description');
  const [isAnalyzingCode, setIsAnalyzingCode] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [editorLanguage, setEditorLanguage] = useState<string>('python');

  const handleAnalyzeCode = async () => {
    if (!code) {
      toast.error("Please write some code first.");
      return;
    }
    setIsAnalyzingCode(true);
    try {
      const res = await api.post('/ai/copilot/analyze', {
        code: code,
        language: editorLanguage,
        challengeTitle: challenge?.title,
        challengeDescription: challenge?.description
      });
      setAnalysisResult(res.data);
      toast.success("Logic Commander diagnostics updated.");
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || e.message || "Failed to analyze code flow.");
    } finally {
      setIsAnalyzingCode(false);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleReadInstructions = () => {
    if (!challenge) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-Speech is not supported in this browser.');
      return;
    }

    const stripMd = (str: string) => str ? str.replace(/[*_#`]/g, '') : '';
    const textToRead = `Challenge: ${challenge.title}. Problem description: ${stripMd(challenge.description)}. ${challenge.instructions ? 'Instructions: ' + stripMd(challenge.instructions) : ''}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;

    utterance.onend = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };
  const [isAITutorSpeaking, setIsAITutorSpeaking] = useState(false);

  const handleAITutorSpeak = () => {
    if (!challenge) return;
    if (isAITutorSpeaking) {
      window.speechSynthesis.cancel();
      setIsAITutorSpeaking(false);
      return;
    }
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-Speech is not supported in this browser.');
      return;
    }

    const hints = [
      "Let's break down the problem statement.",
      `We need to focus on variables and data flows for ${challenge.title}.`,
      "First, define your initial variables and check the edge cases.",
      "Then, iterate or process the input as required by the optimal algorithm.",
      "Remember to return exactly what the problem asks for."
    ].join(' ');

    const textToRead = `Hello, I am your AI Tutor. Here are some insights for ${challenge.title}. ${hints} Good luck with your logic building!`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'en-US';
    utterance.pitch = 1.1; // Make it sound slightly different from the basic reader
    utterance.rate = 0.95;

    utterance.onend = () => setIsAITutorSpeaking(false);

    setIsAITutorSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  interface VisualVariable {
    name: string;
    value: string;
    type: 'array' | 'string' | 'number' | 'node' | 'object' | 'unknown';
  }

  // Note: this is a lightweight static parse of the code text as you type — it gives a quick
  // "variable map" preview, not a real step-by-step execution trace (that would require an
  // actual language runtime/debugger per language). It's intentionally broadened to recognize
  // common declaration styles across Python, JavaScript/TypeScript, Java, and C/C++ so the
  // panel isn't blank just because a challenge is being solved in a non-JS language.
  const parsedVariables = useMemo(() => {
    if (!code) return [];
    const vars: Record<string, VisualVariable> = {};
    const lines = code.split('\n');

    // Common primitive/container type keywords seen before a variable name in typed languages
    const TYPE_PREFIX = '(?:int|long|short|byte|float|double|char|bool|boolean|String|var|auto|size_t|unsigned(?:\\s+int)?)';
    const CONTAINER_PREFIX = '(?:[A-Za-z_][A-Za-z0-9_]*\\s*(?:<[^=;]*>)?\\s*\\[\\s*\\]|std::vector\\s*<[^=;]*>|vector\\s*<[^=;]*>|List\\s*<[^=;]*>|ArrayList\\s*<[^=;]*>|Map\\s*<[^=;]*>|HashMap\\s*<[^=;]*>|dict|Dict\\s*\\[[^\\]]*\\])';

    const patterns = [
      // JS/TS: let/const/var x = ...
      /^\s*(?:let|const|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*(?::\s*[\w<>\[\],\s]+)?=\s*(.*)/,
      // Typed containers: int[] arr = {..}, List<Integer> arr = new ArrayList<>(), vector<int> v = {...}
      new RegExp(`^\\s*(?:${CONTAINER_PREFIX})\\s+([a-zA-Z_][0-9a-zA-Z_]*)\\s*=\\s*(.*)`),
      // Typed primitives: int x = 5; String s = "hi"; double total = 0.0;
      new RegExp(`^\\s*(?:${TYPE_PREFIX})\\s+([a-zA-Z_][0-9a-zA-Z_]*)\\s*=\\s*(.*)`),
      // Python / bare assignment fallback: x = 5, arr = [1,2,3], n = Node(1)
      /^\s*(self\.)?([a-zA-Z_][0-9a-zA-Z_]*)\s*=\s*(?!=)(.*)/,
    ];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      // Skip comparisons/comments/imports so we don't pick up `if (x == 5)` etc.
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#') || trimmedLine.startsWith('*')) return;
      if (/^(import|from|package|using|include)\b/.test(trimmedLine)) return;

      let name: string | null = null;
      let rawVal: string | null = null;

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          if (pattern === patterns[3]) {
            // self.x = ... / x = ... variant has an extra capture group for the "self." prefix
            name = match[2];
            rawVal = match[3];
          } else {
            name = match[1];
            rawVal = match[2];
          }
          break;
        }
      }

      if (name && rawVal !== null) {
        let val = rawVal.trim().replace(/;\s*$/, '');
        if (!val) return;

        let type: VisualVariable['type'] = 'unknown';
        if (val.startsWith('[') || val.startsWith('{') && val.includes(',') && !val.includes(':')) type = 'array';
        else if (val.startsWith('{')) type = 'object';
        else if (val.startsWith('"') || val.startsWith("'") || val.startsWith('`')) type = 'string';
        else if (!isNaN(Number(val))) type = 'number';
        else if (/\b(Node|TreeNode|ListNode)\b/.test(val)) type = 'node';
        else if (/^new\s+(ArrayList|HashMap|List|Map|Array)/.test(val) || /^(ArrayList|HashMap|List|Map)\s*[<(]/.test(val)) type = 'array';

        vars[name] = { name, value: val, type };
      }
    });
    return Object.values(vars);
  }, [code]);

  // Simplified Challenge Page

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        let data;
        try {
          // Try standard challenge first
          const res = await api.get(`/challenges/${id}`);
          data = res.data;
        } catch (err: any) {
          // If not found, try learning path challenge
          if (err.response && err.response.status === 404) {
            const res = await api.get(`/learning/challenges/${id}`);
            data = res.data;
          } else {
            throw err;
          }
        }

        setChallenge(data);

        if (data.type === 'Algorithm' || data.type === 'Debugging' || !data.type) {
          // Default to coding layout if no type or specific type
          setCode(data.initialCode || data.template || codeTemplates.python);
        }
      } catch (err) {
        console.error("Failed fetching challenge", err);
        toast.error("Challenge not found or corrupted.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchChallenge();
  }, [id]);

  const handleQuizComplete = (score: number) => {
    setShowSuccess(true);
    const xp = challenge.xpReward || 50;
    setEarnedXP(xp);
    awardXp(xp);
  };

  const handleArticleComplete = async () => {
    let nextNavigated = false;
    try {
      // Mark as read to award XP
      await api.post('/learning/submit', { challengeId: challenge._id, passed: true });
      
      if (searchParams.get('from') === 'learning-path') {
        const res = await api.get(`/learning/challenges/${challenge._id}/next`);
        const nextId = res.data.nextChallengeId;
        
        if (nextId) {
          console.log(`Navigating to next challenge: ${nextId}`);
          navigate(`/challenge/${nextId}?from=learning-path`);
          nextNavigated = true;
        } else {
          console.log("No next challenge found for this path.");
        }
      }
    } catch (err) {
      console.error("Error going to next module", err);
    }

    if (!nextNavigated) {
      setShowSuccess(true);
      const xp = challenge.xpReward || 50;
      setEarnedXP(xp);
      awardXp(xp);
    }
  };

  const handleRunCode = async (runCode: string, language: string) => {
    setIsExecuting(true);
    try {
      const langId = LANGUAGE_IDS[language as Language] || 71;
      const result = await submitCode(runCode, langId, challenge.testCases?.[0]?.input || "");
      setExecutionResult(result);
    } catch (e: any) {
      toast.error("Execution Failed: " + e.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async (runCode: string, language: string) => {
    setIsExecuting(true);
    try {
      const langId = LANGUAGE_IDS[language as Language] || 71;

      // In a real scenario, you'd run multiple test cases hidden from the user.
      // For this frontend demo, we run it once against public test cases or just pretend it's a submission run.
      const result = await submitCode(runCode, langId, challenge.testCases?.[0]?.input || "");
      setExecutionResult(result);

      if (result.status.id === 3) {
        // ID 3 means Accepted in Judge0
        setShowSuccess(true);
        const xp = challenge.xpReward || 50;
        setEarnedXP(xp);
        awardXp(xp);
        toast.success("All test cases passed!");
        // TODO: Optional API call to mark challenge as complete for user
      } else {
        toast.error("Submission failed. Review the console output.");
      }
    } catch (e: any) {
      toast.error("Submission Error: " + e.message);
    } finally {
      setIsExecuting(false);
    }
  };


  if (loading) return <div className="min-h-[100dvh] bg-background flex items-center justify-center">Loading Mission Details...</div>;
  if (!challenge) return <div className="min-h-[100dvh] bg-background flex items-center justify-center">Challenge Data Corrupted</div>;

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-background dark:bg-[#0f1011] flex flex-col overflow-hidden">
      {/* Top Navbar Header */}
      <div className="h-14 shrink-0 px-4 border-b border-border/40 bg-card dark:bg-[#161616] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={backUrl}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              {challenge.difficulty}
            </span>
            <h1 className="text-sm font-semibold text-foreground dark:text-gray-200">
              {challenge.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-4 py-1.5 rounded-2xl border border-amber-500/20 dark:border-amber-500/30 backdrop-blur-xl">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="font-display font-black text-[10px] tracking-[0.2em] uppercase">User Telemetry: {gamification?.stats?.xp || 0} XP</span>
          </div>
          <div className="flex items-center gap-2 text-teal-800 dark:text-primary bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-2xl border border-primary/25 dark:border-primary/30 backdrop-blur-xl">
            <Zap className="h-4 w-4 fill-current" />
            <span className="font-display font-black text-[10px] tracking-[0.2em] uppercase">Reward: {challenge.xpReward} XP</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {challenge.type === 'Article' ? (
          <div className="flex-1 overflow-y-auto"><ArticleView title={challenge.title} content={challenge.articleContent || challenge.description} resources={challenge.resources || []} onComplete={handleArticleComplete} nextLabel="Next" /></div>
        ) : challenge.type === 'Quiz' ? (
          <div className="flex-1 overflow-y-auto"><QuizView title={challenge.title} questions={challenge.quizQuestions || []} onComplete={handleQuizComplete} /></div>
        ) : (
          // Standard Coding Interface
          <div className="flex-1 flex overflow-hidden">

            {/* LEFT PANEL: Problem Statement / Logic Commander */}
            <div className="w-[30%] min-w-[300px] flex flex-col border-r border-border/40 bg-card dark:bg-[#1e1e1e]">
              <div className="flex items-center justify-between border-b border-border/40 bg-muted/40 dark:bg-[#161616] shrink-0">
                <div className="flex">
                  <button
                    onClick={() => setLeftTab('description')}
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${leftTab === 'description' ? 'border-[#00ff88] text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white'}`}
                  >
                    Briefing
                  </button>
                  <button
                    onClick={() => setLeftTab('copilot')}
                    className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${leftTab === 'copilot' ? 'border-[#00ff88] text-white bg-white/5' : 'border-transparent text-gray-400 hover:text-white'}`}
                  >
                    <Bot className="w-3.5 h-3.5" /> Logic Commander
                  </button>
                </div>
                {leftTab === 'description' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReadInstructions}
                    className={`h-8 px-2 mr-2 transition-colors ${isPlayingAudio ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'}`}
                    title={isPlayingAudio ? "Stop Reading" : "Read Aloud"}
                  >
                    {isPlayingAudio ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                    <span className="text-xs font-semibold">{isPlayingAudio ? 'Stop' : 'Listen'}</span>
                  </Button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-border">
                {leftTab === 'description' ? (
                  <div className="prose dark:prose-invert prose-sm max-w-none text-muted-foreground dark:text-white/50 leading-relaxed font-medium">
                    <ReactMarkdown>
                      {challenge.description || "No description provided."}
                    </ReactMarkdown>

                    {challenge.instructions && (
                      <div className="mt-10 pt-8 border-t border-border/40">
                        <h3 className="text-foreground dark:text-white font-black mb-6 font-display italic uppercase tracking-tight text-xl">Tactical Briefing</h3>
                        <ReactMarkdown>{challenge.instructions}</ReactMarkdown>
                      </div>
                    )}

                    {challenge.testCases && challenge.testCases.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-border/40">
                        <h3 className="text-foreground dark:text-white font-bold mb-4 font-display">Example Output</h3>
                        {challenge.testCases.slice(0, 2).map((tc: any, i: number) => (
                          <div key={i} className="mb-4 bg-secondary/30 p-4 rounded-xl border border-border/40 font-mono text-sm leading-relaxed">
                            <p className="text-muted-foreground mb-1">Input:</p>
                            <div className="text-green-500 mb-3">{tc.input || "No Input Parameters"}</div>
                            <p className="text-muted-foreground mb-1">Expected Output:</p>
                            <div className="text-foreground dark:text-white">{tc.expectedOutput}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
                        <Bot className="w-5 h-5 text-[#00ff88]" /> Logic Commander
                      </h2>
                      <span className="text-[10px] uppercase font-bold text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-0.5 rounded-full animate-pulse">Sync Active</span>
                    </div>

                    <p className="text-xs text-gray-400 font-mono leading-relaxed">
                      Deploy the Logic Commander agent to analyze your code variables, flow patterns, and computational complexity in real-time.
                    </p>

                    <Button
                      onClick={handleAnalyzeCode}
                      disabled={isAnalyzingCode}
                      className="w-full h-12 bg-white text-black hover:bg-[#00ff88] transition-all font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 group"
                    >
                      {isAnalyzingCode ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black animate-spin" />
                          Scanning Neural Logic...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
                          Analyze Code Flow
                        </>
                      )}
                    </Button>

                    {analysisResult ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 pt-4 border-t border-white/5"
                      >
                        {/* Analysis Badge & Hint */}
                        <div className={`p-4 rounded-xl border ${
                          analysisResult.status === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                          analysisResult.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                          'bg-blue-500/5 border-blue-500/20 text-blue-400'
                        }`}>
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              analysisResult.status === 'warning' ? 'bg-amber-400' :
                              analysisResult.status === 'success' ? 'bg-emerald-400' :
                              'bg-blue-400'
                            }`}></div>
                            {analysisResult.status || 'Analysis'} Status
                          </div>
                          <p className="text-xs text-gray-300 font-medium leading-relaxed">{analysisResult.hint}</p>
                        </div>

                        {/* Complexity */}
                        {analysisResult.complexity && (
                          <div className="bg-[#161920] border border-white/5 p-4 rounded-xl font-mono text-xs">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Computational Profile:</span>
                            <span className="text-purple-400 font-bold">{analysisResult.complexity}</span>
                          </div>
                        )}

                        {/* Suggestions */}
                        {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Agent Directives:</span>
                            <ul className="space-y-2 text-xs text-gray-300">
                              {analysisResult.suggestions.map((suggestion: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2.5 bg-white/5 border border-white/5 p-3 rounded-lg leading-relaxed">
                                  <span className="text-[#00ff88] shrink-0 font-bold">▶</span>
                                  <span>{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center bg-white/5 border border-white/5 border-dashed rounded-2xl opacity-40 mt-6">
                        <Bot className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-xs font-mono uppercase tracking-wider">Awaiting Analysis Directive</p>
                        <p className="text-[10px] text-gray-500 mt-1">Write code in the editor and ignite diagnostics.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CENTER PANEL: Visualization Area */}
            <div className="flex-1 min-w-[300px] flex flex-col border-r border-white/5 bg-[#0a0a0b] visualizer-container">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#161616]">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-gray-200">Real-Time Visualizer</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] text-green-500 uppercase font-bold tracking-wider">Sync Active</span>
                </div>
              </div>
              <div className="flex-1 relative flex flex-col w-full min-h-0 overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] p-4">
                {isExecuting ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="relative w-32 h-32">
                      {/* Animated Rings */}
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-t-cq-green border-r-cq-cyan border-b-cq-purple border-l-transparent rounded-full opacity-70" />
                      <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border-4 border-l-cq-gold border-r-transparent border-t-transparent border-b-transparent rounded-full" />
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-white">COMPILING</div>
                    </div>
                    <p className="font-mono text-cq-cyan animate-pulse">Analyzing Nodes...</p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col w-full h-full">
                    {/* Execution Result Banner (Compact) */}
                    {executionResult && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 p-4 rounded-xl border shrink-0 flex items-center justify-between shadow-lg ${executionResult.status.id === 3 ? 'bg-cq-green/10 border-cq-green/30' : 'bg-red-500/10 border-red-500/30'}`}
                      >
                        <div className="flex items-center gap-4">
                          {executionResult.status.id === 3 ? <CheckCircle2 className="w-8 h-8 text-cq-green" /> : <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold border border-red-500/50 text-xl">!</div>}
                          <div>
                            <p className={`text-base font-bold ${executionResult.status.id === 3 ? 'text-cq-green' : 'text-red-500'}`}>
                              {executionResult.status.id === 3 ? 'Operation Successful' : 'Exception Thrown'}
                            </p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                              Time: {executionResult.time}s | Mem: {executionResult.memory}KB
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 w-full min-h-0 flex flex-col overflow-hidden">
                      <ChallengeVisualizer
                        challengeId={challenge._id || challenge.id || ""}
                        challengeTitle={challenge.title}
                        code={code}
                        parsedVariables={parsedVariables}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Editor & Terminal Container */}
            <div className="w-[40%] min-w-[400px] flex flex-col bg-[#0f1011] editor-container">
              <div className="h-12 border-b border-white/5 flex items-center px-6 justify-between bg-[#111111]">
                <div className="flex items-center gap-3">
                  <Code2 className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 italic">Logic Deployment Unit</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary/80">Compiler: Online</span>
                </div>
              </div>
              
              {/* Editor Top Section */}
              <div className="flex-1 min-h-0 relative">
                <CodeEditor
                  onCodeChange={setCode}
                  onLanguageChange={setEditorLanguage}
                  onRun={handleRunCode}
                  onSubmit={handleSubmitCode}
                  initialCode={code}
                  isRunning={isExecuting}
                />
              </div>

              {/* Terminal Bottom Section */}
              <div className="h-[300px] shrink-0 z-10">
                <Terminal
                  result={executionResult}
                  isExecuting={isExecuting}
                  code={code}
                  language={editorLanguage}
                  testCases={challenge.testCases || []}
                />
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Success Modal */}
  {/* Success Modal */}
  <AnimatePresence>
    {showSuccess && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center overflow-hidden"
      >
        {/* Holographic Background Rays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ 
                        rotate: [0, 360],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 15 + i * 5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-1 bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent"
                />
            ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 1.1, opacity: 0 }}
          className="relative text-center pt-16 pb-8 px-8 rounded-3xl border border-[rgba(255,255,255,0.15)] bg-[#0a0a0a]/90 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,255,136,0.12)] max-w-sm w-full mx-4 z-20 group"
        >
          {/* Animated Internal Glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-[#00ff88]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
             <div className="relative">
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="w-24 h-24 bg-[#00ff88]/20 rounded-full blur-2xl absolute inset-0 -translate-x-2 -translate-y-2" 
                />
                <div className="relative z-10 p-4 rounded-2xl bg-[#111] border border-[#00ff88]/30 shadow-[0_0_20px_rgba(0,255,136,0.2)] flex items-center justify-center">
                   <Trophy className="w-10 h-10 text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.6)]" />
                </div>
             </div>
          </div>

          <div className="mt-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-5 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[9px] font-black uppercase tracking-[0.3em] italic"
            >
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                Mission Authentication: SUCCESS
            </motion.div>
            
            <h2 className="font-display text-3xl font-extrabold text-white mb-4 tracking-tight uppercase italic leading-none">
              Sector <span className="text-[#00ff88] text-glow-cyan">Cleared</span>
            </h2>
            
            <div className="flex flex-col items-center gap-4 mb-8">
                <div className="mission-card border-[#00ff88]/30 bg-[#00ff88]/5 px-6 py-3 rounded-2xl">
                    <div className="flex items-center gap-3">
                       <Zap className="w-5 h-5 text-[#00ff88] fill-[#00ff88] drop-shadow-[0_0_6px_rgba(0,255,136,0.4)]" />
                       <div className="text-left">
                          <span className="text-2xl font-display font-black text-white tracking-wider leading-none">+{earnedXP}</span>
                          <p className="text-[8px] font-black uppercase tracking-widest text-[#00ff88]/60 mt-0.5">Mastery Telemetry Sync</p>
                       </div>
                    </div>
                </div>
                <p className="text-zinc-400 font-medium text-[10px] uppercase tracking-[0.15em] max-w-xs mx-auto leading-relaxed">
                  Neural logic patterns successfully encoded into the CodeGalaxy network archive.
                </p>
            </div>

            <Link to={backUrl} className="block group">
              <Button className="w-full h-12 rounded-xl text-sm font-bold uppercase tracking-[0.2em] bg-white text-[#050505] hover:bg-[#00ff88] hover:scale-[1.01] active:scale-[0.99] transition-all relative overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.08)]">
                <span className="relative z-10 flex items-center justify-center gap-3">
                    Return to Orbit <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Particle Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ 
                        x: Math.random() * window.innerWidth, 
                        y: window.innerHeight + 100, 
                        opacity: 1 
                    }}
                    animate={{ 
                        y: -100, 
                        x: (Math.random() - 0.5) * 200 + (Math.random() * window.innerWidth),
                        opacity: 0 
                    }}
                    transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 5 }}
                    className="w-1 h-1 bg-[#00ff88] rounded-full blur-[1px]"
                />
            ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
    </div>
  );
};

export default ChallengePage;
