import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, ChevronRight, Briefcase, RefreshCw, ArrowLeft, 
  Send, User, Award, CheckCircle2, ShieldAlert, Zap 
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/utils/api';

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

const AIInterviewSimulator = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('Python');
  const [level, setLevel] = useState('Beginner');

  // Conversational states
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userReply, setUserReply] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  
  // Appraisal report states
  const [isFinished, setIsFinished] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState<any>(null);

  const startInterview = async () => {
    setLoading(true);
    setChatHistory([]);
    setIsFinished(false);
    setEvaluationReport(null);
    setQuestionCount(1);
    
    try {
      const stateRes = await api.get('/interview-prep/state');
      setLanguage(stateRes.data.selectedLanguage);
      setLevel(stateRes.data.skillLevel);

      // Start dialog with first question
      const initialGreeting = `Welcome to your ${stateRes.data.selectedLanguage} ${stateRes.data.skillLevel} technical interview simulation. I am your AI evaluator. Let us start: Can you explain how you would explain local scope versus global scope in your code?`;
      setChatHistory([{ sender: 'ai', text: initialGreeting }]);
    } catch (err) {
      console.error(err);
      toast.error("Could not initialize simulated interviewer interface.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startInterview();
  }, []);

  // Scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAiReplying]);

  const handleSubmitAnswer = async () => {
    if (!userReply.trim() || isAiReplying) return;

    const userMsg: Message = { sender: 'user', text: userReply };
    const updatedHistory = [...chatHistory, userMsg];
    
    setChatHistory(updatedHistory);
    setUserReply('');
    setIsAiReplying(true);

    try {
      const res = await api.post('/interview-prep/interview/answer', {
        chatHistory: updatedHistory
      });

      if (res.data.isCompleted) {
        setIsFinished(true);
        setEvaluationReport(res.data.evaluation);
        toast.success("Interview completed! Calibration score generated.");
      } else {
        const nextMsg: Message = { sender: 'ai', text: `${res.data.response}\n\n${res.data.nextQuestion}` };
        setChatHistory(prev => [...prev, nextMsg]);
        setQuestionCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Evaluation pipeline failed to answer.");
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-mono p-4">
        <Bot className="w-12 h-12 text-purple-400 animate-bounce mb-4" />
        <h2 className="text-lg font-bold text-foreground uppercase italic mb-2">Connecting to Room...</h2>
        <p className="text-xs text-muted-foreground max-w-sm text-center leading-relaxed">
          The AI Interviewer evaluator is loading language weights for {level} dialog simulation.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden h-screen pb-4">
      <Navbar />

      <div className="flex-1 pt-20 flex flex-col overflow-hidden max-w-6xl mx-auto w-full px-4 lg:px-6">
        
        {/* Navigation top header */}
        <div className="h-14 flex items-center justify-between shrink-0 border-b border-border">
          <button
            onClick={() => navigate('/interview-prep')}
            className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground uppercase transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Room
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-mono bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded text-purple-400 font-bold">
              Simulation Session Active
            </span>
            <span className="text-xs font-mono bg-muted border border-border px-3 py-1 rounded-lg text-muted-foreground">
              Domain: {language} ({level})
            </span>
          </div>
        </div>

        {!isFinished ? (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden mt-4">
            
            {/* Left dialog panel */}
            <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden min-h-[300px]">
              
              {/* Message display feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <Bot className="w-4.5 h-4.5" />
                      </div>
                    )}
                    
                    <div className={`p-4 rounded-2xl max-w-[80%] text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line border ${
                      msg.sender === 'user'
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-800 dark:text-purple-200'
                        : 'bg-muted/60 border-border text-muted-foreground'
                    }`}>
                      {msg.text}
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground shrink-0">
                        <User className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isAiReplying && (
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div className="bg-muted/60 border border-border p-4 rounded-2xl flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-75"></span>
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Textarea answering workspace console */}
              <div className="p-4 border-t border-border bg-muted/20 shrink-0 flex items-center gap-3">
                <textarea
                  rows={2}
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Explain your approach or write code here..."
                  className="flex-1 bg-muted/40 hover:bg-muted/65 focus:bg-muted/90 border border-border hover:border-border focus:border-purple-500/30 rounded-xl p-3 text-xs sm:text-sm text-foreground placeholder-muted-foreground outline-none resize-none transition-all font-mono"
                />
                <Button
                  disabled={!userReply.trim() || isAiReplying}
                  onClick={handleSubmitAnswer}
                  className="w-12 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all flex items-center justify-center shrink-0"
                >
                  <Send className="w-4.5 h-4.5" />
                </Button>
              </div>

            </div>

            {/* Right virtual room telemetry panel */}
            <div className="w-full lg:w-72 shrink-0 bg-card border border-border rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase italic tracking-tight font-display mb-6 border-b border-border pb-3">Interviewer Status</h3>
                
                {/* Glowing Avatar representation */}
                <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center bg-purple-500/5 border border-purple-500/20 rounded-full">
                  <div className="absolute inset-0 rounded-full border border-purple-500/10 animate-ping"></div>
                  <Bot className="w-12 h-12 text-purple-400" />
                  
                  {/* Glowing Sound waves */}
                  <div className="absolute bottom-2 flex items-center gap-1">
                    <span className="w-1 h-3 bg-[#00ff88] rounded-full animate-pulse"></span>
                    <span className="w-1 h-5 bg-[#00ff88] rounded-full animate-pulse delay-75"></span>
                    <span className="w-1 h-4 bg-[#00ff88] rounded-full animate-pulse delay-150"></span>
                    <span className="w-1 h-2 bg-[#00ff88] rounded-full animate-pulse"></span>
                  </div>
                </div>

                <div className="space-y-4 text-center">
                  <div>
                    <h4 className="text-xs text-foreground font-bold uppercase tracking-wider">AI Evaluator Node</h4>
                    <span className="text-[10px] text-muted-foreground font-mono">Status: Dialog analysis active</span>
                  </div>

                  <div className="border border-border p-4 rounded-xl space-y-2 bg-muted/20 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress:</span>
                      <strong className="text-foreground">Q {questionCount} of 5</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Language:</span>
                      <strong className="text-foreground">{language}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-6 text-center">
                <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">Secure evaluation sandbox</span>
              </div>
            </div>

          </div>
        ) : (
          /* Finished State Appraisal Report */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-2xl max-w-3xl mx-auto w-full mt-4 space-y-8 overflow-y-auto"
          >
            {/* Header Score appraisal */}
            <div className="text-center py-6 bg-muted/30 border border-border rounded-2xl relative overflow-hidden space-y-3">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <Award className="w-16 h-16 text-purple-400 mx-auto" />
              <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tight font-display">Performance Appraisal Report</h2>
              <p className="text-xs text-muted-foreground">
                Evaluation complete for {language} technical simulation.
              </p>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="text-center">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono block">Interview Score</span>
                  <span className="text-2xl font-black text-foreground font-mono">{evaluationReport?.score || 0}%</span>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center">
                  <span className="text-[9px] text-muted-foreground uppercase font-mono block">Appraisal Rating</span>
                  <span className="text-2xl font-black text-[#00ff88] uppercase italic font-display">{evaluationReport?.rating || 'Pass'}</span>
                </div>
              </div>
            </div>

            {/* Specific weak Areas identified */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/20 border border-border p-5 rounded-2xl space-y-3">
                <h4 className="text-xs uppercase font-mono font-bold text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Needs Remedial calibration
                </h4>
                {evaluationReport?.weakAreas && evaluationReport.weakAreas.length > 0 ? (
                  <ul className="space-y-2">
                    {evaluationReport.weakAreas.map((area: string) => (
                      <li key={area} className="text-xs text-muted-foreground leading-relaxed list-disc list-inside">{area}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No major vulnerabilities identified. All logical indices verified.</p>
                )}
              </div>

              {/* Custom roadmap checklists */}
              <div className="bg-muted/20 border border-border p-5 rounded-2xl space-y-3">
                <h4 className="text-xs uppercase font-mono font-bold text-[#00ff88] flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Custom Calibration Plan
                </h4>
                {evaluationReport?.roadmap && evaluationReport.roadmap.length > 0 ? (
                  <ul className="space-y-2">
                    {evaluationReport.roadmap.map((step: string) => (
                      <li key={step} className="text-xs text-muted-foreground leading-relaxed list-disc list-inside">{step}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Roadmap completed. Ready for standard production deploy.</p>
                )}
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={startInterview}
                className="h-12 rounded-xl text-muted-foreground hover:text-foreground border border-border hover:bg-muted font-bold uppercase tracking-wider text-xs flex items-center gap-2 justify-center"
              >
                <RefreshCw className="w-4 h-4" /> Start New Simulation
              </Button>
              <Button
                onClick={() => navigate('/interview-prep')}
                className="h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-bold uppercase tracking-wider text-xs flex items-center gap-2 justify-center"
              >
                Return to Dashboard
              </Button>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AIInterviewSimulator;
