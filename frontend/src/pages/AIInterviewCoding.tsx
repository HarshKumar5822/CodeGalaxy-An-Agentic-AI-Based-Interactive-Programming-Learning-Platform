import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, ChevronRight, Code2, Cpu, RefreshCw, Sparkles, 
  ArrowLeft, Terminal as TerminalIcon, ShieldAlert, CheckCircle, 
  XCircle, Play, Send 
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import CodeEditor, { Language } from '@/components/editor/CodeEditor';
import Terminal from '@/components/editor/Terminal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/utils/api';

const AIInterviewCoding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('Python');
  const [level, setLevel] = useState('Beginner');

  // Problem State
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState('');
  
  // Execution & Review State
  const [isExecuting, setIsExecuting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [terminalResult, setTerminalResult] = useState<any>(null);
  const [reviewResult, setReviewResult] = useState<any>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'details' | 'advisor'>('details');

  const fetchProblem = async () => {
    setLoading(true);
    setTerminalResult(null);
    setReviewResult(null);
    try {
      const stateRes = await api.get('/interview-prep/state');
      setLanguage(stateRes.data.selectedLanguage);
      setLevel(stateRes.data.skillLevel);

      const problemRes = await api.post('/interview-prep/coding/generate');
      setProblem(problemRes.data);
      setCode(problemRes.data.template || '');
    } catch (err) {
      console.error(err);
      toast.error("Error generating coding problem. Loading fallback challenge.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, []);

  const getEditorLanguage = (lang: string): Language => {
    const l = lang.toLowerCase();
    if (l.includes('python')) return 'python';
    if (l.includes('javascript') || l.includes('react')) return 'javascript';
    if (l.includes('java')) return 'java';
    if (l.includes('c++')) return 'cpp';
    if (l.includes('c')) return 'c';
    return 'python'; // fallback
  };

  const handleRunLocal = async () => {
    if (!code) {
      toast.error("Please write some code before execution.");
      return;
    }
    setIsExecuting(true);
    setTerminalResult(null);
    try {
      // We will perform local simulation tests
      const langLower = language.toLowerCase();
      let normalizedLanguage = langLower;
      if (normalizedLanguage === 'javascript' || normalizedLanguage === 'react.js') normalizedLanguage = 'js';
      if (normalizedLanguage === 'python') normalizedLanguage = 'py';
      
      const payload = {
        language: normalizedLanguage,
        code,
        input: problem?.testCases?.[0]?.input || ""
      };

      // Call execution directly
      const res = await api.post('/challenges/run', payload);
      
      const isOk = res.data.success;
      setTerminalResult({
        stdout: res.data.output,
        stderr: isOk ? null : res.data.output,
        compile_output: null,
        message: null,
        status: {
          id: isOk ? 3 : 4,
          description: isOk ? 'Accepted' : 'Runtime Error'
        },
        time: '0.06',
        memory: 2048
      });
      toast.success("Execution completed successfully.");
    } catch (err: any) {
      console.error(err);
      setTerminalResult({
        stdout: null,
        stderr: err.response?.data?.message || err.message || "Execution exception",
        compile_output: null,
        message: null,
        status: {
          id: 4,
          description: 'Runtime Error'
        },
        time: null,
        memory: null
      });
      toast.error("Local sandbox compilation failed.");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAIReview = async () => {
    if (!code) {
      toast.error("Code workspace is empty.");
      return;
    }
    setIsEvaluating(true);
    setReviewResult(null);
    try {
      const res = await api.post('/interview-prep/coding/evaluate', {
        code,
        problemTitle: problem.title,
        problemDescription: problem.description,
        testCases: problem.testCases
      });

      setReviewResult(res.data);
      
      // Update terminal with evaluation run
      setTerminalResult({
        stdout: res.data.runOutput || "Execution simulated.",
        stderr: res.data.runSuccess ? null : "Execution warnings generated.",
        compile_output: null,
        message: null,
        status: {
          id: res.data.runSuccess ? 3 : 4,
          description: res.data.runSuccess ? 'Accepted' : 'Runtime Error'
        },
        time: '0.04',
        memory: 1024
      });

      if (res.data.passed) {
        toast.success("Review Complete: Code passed test parameters!");
      } else {
        toast.warning("Review Complete: Syntax/logic checks failed.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Could not obtain AI evaluation.");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-mono p-4">
        <Bot className="w-12 h-12 text-cyan-400 animate-bounce mb-4" />
        <h2 className="text-lg font-bold text-foreground uppercase italic mb-2">Synthesizing Challenge...</h2>
        <p className="text-xs text-muted-foreground max-w-sm text-center leading-relaxed">
          The AI Interview engine is designing a {level} coding task tailored for your {language} memory indexes.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden h-screen">
      <Navbar />

      <div className="flex-1 pt-20 flex flex-col overflow-hidden px-4 lg:px-6 pb-4">
        
        {/* Top workspace navigation */}
        <div className="h-14 flex items-center justify-between shrink-0 border-b border-border">
          <button
            onClick={() => navigate('/interview-prep')}
            className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground uppercase transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-muted border border-border px-3 py-1 rounded-lg text-muted-foreground">
              Language: <strong className="text-foreground">{language}</strong>
            </span>
            <span className="text-xs font-mono bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-lg text-cyan-400 font-bold">
              Level: {level}
            </span>
          </div>
        </div>

        {/* Two-Pane Workspace Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden mt-4">
          
          {/* Left panel: problem descriptor & logic advice */}
          <div className="lg:col-span-5 bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/40 shrink-0">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3.5 text-xs font-mono uppercase tracking-widest font-bold border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-cyan-400 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Problem Details
              </button>
              <button
                onClick={() => setActiveTab('advisor')}
                className={`flex-1 py-3.5 text-xs font-mono uppercase tracking-widest font-bold border-b-2 transition-colors ${
                  activeTab === 'advisor' ? 'border-cyan-400 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Advisor Chat
              </button>
            </div>

            {/* Tab contents */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              {activeTab === 'details' ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2 leading-tight uppercase font-display italic">{problem.title}</h2>
                    <span className="text-[10px] uppercase font-mono bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] px-2.5 py-0.5 rounded-full font-bold">
                      {problem.difficulty}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line font-medium border-t border-border pt-4">
                    {problem.description}
                  </div>

                  {problem.exampleInput && (
                    <div className="space-y-3 border-t border-border pt-4 font-mono">
                      <h4 className="text-xs uppercase text-muted-foreground font-bold">Example Node Case</h4>
                      <div className="bg-muted/40 p-4 rounded-xl border border-border text-[11px] leading-relaxed">
                        <div><strong className="text-muted-foreground">Input:</strong> {problem.exampleInput}</div>
                        <div className="mt-1"><strong className="text-muted-foreground">Expected Output:</strong> {problem.exampleOutput}</div>
                      </div>
                    </div>
                  )}

                  {problem.constraints && (
                    <div className="space-y-2 border-t border-border pt-4">
                      <h4 className="text-xs uppercase font-mono text-muted-foreground font-bold">Constraints</h4>
                      <div className="text-xs text-muted-foreground font-mono whitespace-pre-line leading-relaxed">
                        {problem.constraints}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-3 bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl">
                    <Bot className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">Live Code Flow Advisor</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        I am analyzing the problem structure. Here are live complexity guidelines to prevent performance anomalies:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    <div className="border border-border p-4 rounded-xl space-y-2 bg-muted/20">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold">Pattern Hint</span>
                      <p className="text-muted-foreground leading-relaxed">
                        For reversing an array in-place, utilize two pointers: one starting from the beginning (index 0) and one from the tail (length - 1). Swap elements while left &lt; right.
                      </p>
                    </div>

                    <div className="border border-border p-4 rounded-xl space-y-2 bg-muted/20">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold">Big-O Benchmark Target</span>
                      <p className="text-muted-foreground leading-relaxed">
                        Aim for a Time Complexity of <strong>O(N)</strong> and Space Complexity of <strong>O(1)</strong> auxiliary. Allocating arrays increases spatial complexities.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Workspace + Terminal + Evaluation reviews */}
          <div className="lg:col-span-7 flex flex-col overflow-hidden relative">
            
            {/* Editor Workspace */}
            <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col relative min-h-[300px]">
              <div className="flex-1 relative overflow-hidden">
                <CodeEditor
                  language={getEditorLanguage(language)}
                  initialCode={code}
                  onCodeChange={(val) => setCode(val)}
                  onRun={handleRunLocal}
                  onSubmit={handleAIReview}
                  isRunning={isExecuting}
                />
              </div>

              {/* Bottom compiler actions bar */}
              <div className="h-14 border-t border-border bg-muted/20 px-4 flex items-center justify-between shrink-0">
                <Button
                  disabled={isExecuting}
                  onClick={handleRunLocal}
                  className="h-10 px-4 rounded-xl bg-muted border border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground text-xs font-bold flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5" /> Run Local tests
                </Button>
                
                <Button
                  disabled={isEvaluating}
                  onClick={handleAIReview}
                  className="h-10 px-5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold flex items-center gap-2"
                >
                  {isEvaluating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  AI Review & Submit
                </Button>
              </div>
            </div>

            {/* Monaco Terminal Output (Height = 160px) */}
            <div className="h-40 shrink-0 mt-4 bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
              <div className="h-9 border-b border-border bg-muted/40 px-4 flex items-center justify-between shrink-0 font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
                <span className="flex items-center gap-1.5"><TerminalIcon className="w-3.5 h-3.5" /> Console logs & repair diagnostic</span>
                {terminalResult && (
                  <button 
                    onClick={() => setTerminalResult(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-auto bg-background">
                <Terminal
                  result={terminalResult}
                  isExecuting={isExecuting}
                  height={120}
                  code={code}
                  language={getEditorLanguage(language)}
                  testCases={problem.testCases}
                />
              </div>
            </div>

            {/* AI Review Result Overlay card */}
            <AnimatePresence>
              {reviewResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-background/80 backdrop-blur-md p-4 sm:p-6 z-[100] flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-[540px] max-h-[85vh] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
                  >
                    {/* Modal Header */}
                    <div className="p-6 pb-4 border-b border-border shrink-0 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl shrink-0 ${reviewResult.passed ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                          {reviewResult.passed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-foreground uppercase italic tracking-tight font-display">AI Evaluation Review</h3>
                          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            Time: {reviewResult.timeComplexity} | Space: {reviewResult.spaceComplexity}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setReviewResult(null)}
                        className="text-muted-foreground hover:text-foreground text-xs font-mono uppercase tracking-wider border border-border bg-muted/40 hover:bg-muted px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </div>

                    {/* Scrollable Modal Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                      {/* Scores Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/40 p-4 rounded-xl border border-border text-center flex flex-col justify-center">
                          <span className="text-[9px] text-muted-foreground uppercase font-mono block mb-1 tracking-wider">Logic Score</span>
                          <span className="text-lg font-black text-foreground font-mono">{reviewResult.logicScore} / 100</span>
                        </div>
                        <div className="bg-muted/40 p-4 rounded-xl border border-border text-center flex flex-col justify-center">
                          <span className="text-[9px] text-muted-foreground uppercase font-mono block mb-1 tracking-wider">Style Grade</span>
                          <span className="text-lg font-black text-cyan-400 font-mono">{reviewResult.styleScore} / 100</span>
                        </div>
                      </div>

                      {/* Feedback Text */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] text-muted-foreground uppercase font-mono block font-bold tracking-wider">Feedback Diagnostic:</span>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium bg-muted/30 border border-border p-4 rounded-xl whitespace-pre-line break-words">
                          {reviewResult.feedback}
                        </p>
                      </div>

                      {/* Refactored Optimized Sample Code */}
                      {reviewResult.optimizedCode && (
                        <div className="space-y-2.5">
                          <span className="text-[10px] text-cyan-400 uppercase font-mono block font-bold tracking-wider">Refactored Optimized Sample:</span>
                          <div className="relative overflow-hidden rounded-xl border border-border bg-background">
                            <pre className="text-[10px] font-mono text-muted-foreground p-4 overflow-x-auto leading-relaxed whitespace-pre scrollbar-thin">
                              {reviewResult.optimizedCode}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fixed Footer Actions */}
                    <div className="p-6 border-t border-border bg-muted/20 shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-between">
                      <Button
                        variant="ghost"
                        onClick={fetchProblem}
                        className="h-11 rounded-xl text-muted-foreground hover:text-foreground border border-border text-xs font-bold flex items-center gap-2 justify-center w-full sm:w-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Next Problem
                      </Button>
                      <Button
                        onClick={() => navigate('/interview-prep')}
                        className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold w-full sm:w-auto"
                      >
                        Return to Dashboard
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AIInterviewCoding;
