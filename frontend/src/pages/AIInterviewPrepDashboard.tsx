import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Award, BookOpen, Bot, Briefcase, ChevronRight, Code2, Cpu, 
  HelpCircle, RefreshCw, ShieldAlert, Sparkles, Target, Zap 
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/utils/api';

const LANGUAGES = [
  { name: 'Python', desc: 'AI, Scripting, Data Science', color: 'from-blue-500/20 to-yellow-500/20 border-blue-500/30' },
  { name: 'Java', desc: 'Enterprise Systems, Android', color: 'from-orange-500/20 to-red-500/20 border-orange-500/30' },
  { name: 'JavaScript', desc: 'Frontend & Backend Web', color: 'from-yellow-400/10 to-yellow-500/20 border-yellow-500/30' },
  { name: 'React.js', desc: 'Modern Web UI Library', color: 'from-cyan-400/10 to-blue-500/20 border-cyan-500/30' },
  { name: 'C++', desc: 'Performance, Game Engines', color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30' },
  { name: 'C', desc: 'Low-Level Systems Programming', color: 'from-slate-500/20 to-blue-500/10 border-slate-500/30' },
  { name: 'SQL', desc: 'Database Querying & schemas', color: 'from-green-500/20 to-emerald-500/20 border-emerald-500/30' },
  { name: 'HTML/CSS', desc: 'Web Structure & Styling', color: 'from-orange-500/10 to-blue-500/10 border-orange-400/30' }
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const AIInterviewPrepDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userState, setUserState] = useState<any>(null);
  
  // Onboarding States
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [selectedLang, setSelectedLang] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchState = async () => {
    try {
      const res = await api.get('/interview-prep/state');
      setUserState(res.data);
      if (!res.data.selectedLanguage || !res.data.skillLevel) {
        setIsOnboarding(true);
      } else {
        setSelectedLang(res.data.selectedLanguage);
        setSelectedLevel(res.data.skillLevel);
        setIsOnboarding(false);
      }
    } catch (err) {
      console.error("Failed to load interview prep state", err);
      toast.error("Could not load interview prep workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleSaveConfig = async () => {
    if (!selectedLang || !selectedLevel) {
      toast.error("Please make sure language and level are selected.");
      return;
    }
    setIsUpdating(true);
    try {
      const res = await api.post('/interview-prep/config', {
        language: selectedLang,
        skillLevel: selectedLevel
      });
      setUserState(res.data);
      setIsOnboarding(false);
      setOnboardingStep(1);
      toast.success("AI model configured successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Could not save AI configuration profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-mono">Calibrating Interview Logic Core...</div>;
  }

  // Render Onboarding Screen
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none animate-pulse"></div>
        <Navbar />
        
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl bg-card border border-border/50 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500"></div>
            
            {onboardingStep === 1 ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Bot className="w-8 h-8 text-[#00ff88]" />
                  <h1 className="text-2xl font-display font-black text-foreground uppercase italic">Select Interview Language</h1>
                </div>
                <p className="text-xs text-muted-foreground font-mono mb-8 uppercase tracking-widest">Step 1 of 2: Choose target domain expertise</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {LANGUAGES.map((lang) => (
                    <div
                      key={lang.name}
                      onClick={() => setSelectedLang(lang.name)}
                      className={`bg-gradient-to-br ${lang.color} p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-32 hover:scale-[1.03] ${
                        selectedLang === lang.name ? 'border-[#00ff88] ring-1 ring-[#00ff88]' : 'hover:border-border/30'
                      }`}
                    >
                      <h3 className="text-base font-bold text-foreground">{lang.name}</h3>
                      <p className="text-[10px] text-muted-foreground leading-normal">{lang.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-border/50">
                  <Button
                    disabled={!selectedLang}
                    onClick={() => setOnboardingStep(2)}
                    className="h-12 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-bold uppercase tracking-wider text-xs flex items-center gap-2"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Target className="w-8 h-8 text-cyan-400" />
                  <h1 className="text-2xl font-display font-black text-foreground uppercase italic">What is your current skill level?</h1>
                </div>
                <p className="text-xs text-muted-foreground font-mono mb-8 uppercase tracking-widest">Step 2 of 2: Calibrating parameters for {selectedLang}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {LEVELS.map((level) => (
                    <div
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`bg-muted/40 hover:bg-muted/65 border border-border rounded-2xl p-6 cursor-pointer transition-all text-center flex flex-col justify-center h-40 ${
                        selectedLevel === level ? 'border-cyan-400 ring-1 ring-cyan-400 bg-cyan-500/10' : ''
                      }`}
                    >
                      <h3 className="text-lg font-black text-foreground mb-2">{level}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {level === 'Beginner' && "Basic syntax, constructs, loops, and simple variables."}
                        {level === 'Intermediate' && "Functional structures, core objects, and medium challenges."}
                        {level === 'Advanced' && "Complex architectures, algorithmic Big-O optimization, and tree layouts."}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    onClick={() => setOnboardingStep(1)}
                    className="h-12 px-6 rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    Back
                  </Button>
                  <Button
                    disabled={!selectedLevel || isUpdating}
                    onClick={handleSaveConfig}
                    className="h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-black uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    Save & Continue <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden pb-12">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 relative z-10 w-full flex-1 flex flex-col gap-8">
        
        {/* Header Config Section */}
        <div className="bg-card border border-border/50 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-lg relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
              <Code2 className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">AI Interview Prep Workspace</h1>
                <span className="text-[10px] uppercase font-mono bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full text-cyan-400 font-bold">Model Synchronized</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Target Language: <strong className="text-foreground">{userState.selectedLanguage}</strong> | Skill Level: <strong className="text-[#00ff88]">{userState.skillLevel}</strong>
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => setIsOnboarding(true)}
            className="h-10 px-4 rounded-xl text-xs font-bold bg-muted/50 text-muted-foreground border border-border hover:bg-muted hover:text-foreground flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Change Settings
          </Button>
        </div>

        {/* Action Panel: launch options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col justify-between hover:border-border transition-all hover:scale-[1.01] shadow-lg group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center text-[#00ff88] mb-6">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2 uppercase italic tracking-tight font-display">AI Interview Quiz</h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-8">
                Synthesize dynamic MCQ, predictive output, and conceptual question runs. Tests target memory indices at {userState.skillLevel} difficulty.
              </p>
            </div>
            <Button
              onClick={() => navigate('/interview-prep/quiz')}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2"
            >
              Start Quiz <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col justify-between hover:border-border transition-all hover:scale-[1.01] shadow-lg group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                <Code2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2 uppercase italic tracking-tight font-display">AI Coding Practice</h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-8">
                Write code inside a sandboxed workspace. Get real-time Logic Commander compilations, Big-O estimates, and code reviews.
              </p>
            </div>
            <Button
              onClick={() => navigate('/interview-prep/coding')}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2"
            >
              Start Coding <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col justify-between hover:border-border transition-all hover:scale-[1.01] shadow-lg group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
                <Briefcase className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2 uppercase italic tracking-tight font-display">AI Interview Simulator</h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-8">
                Practice dialog-based interviewing with an autonomous evaluator. Receives appraisal roadmaps and preparation recommendations.
              </p>
            </div>
            <Button
              onClick={() => navigate('/interview-prep/simulator')}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2"
            >
              Start Simulator <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats and Study Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Stats Memory Dashboard */}
          <div className="lg:col-span-1 bg-card border border-border/50 rounded-3xl p-6 shadow-lg space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-3">
              <Cpu className="w-5 h-5 text-[#00ff88]" /> AI Memory Statistics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/40 p-4 rounded-2xl border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-mono block mb-1">Quizzes Run</span>
                <span className="text-xl font-black text-foreground">{userState.quizzes?.length || 0}</span>
              </div>
              <div className="bg-muted/40 p-4 rounded-2xl border border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase font-mono block mb-1">Solved Tasks</span>
                <span className="text-xl font-black text-foreground">{userState.solvedProblems?.length || 0}</span>
              </div>
            </div>

            {/* Identified strong areas */}
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold block">Strong Concepts:</span>
              {userState.strongTopics && userState.strongTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userState.strongTopics.map((t: string) => (
                    <span key={t} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-xs font-semibold">{t}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No strong concepts recorded yet. Take quizzes to sync statistics.</p>
              )}
            </div>

            {/* Subsystems needing repair */}
            <div className="space-y-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold block">Weak Areas (Needs Sync):</span>
              {userState.weakTopics && userState.weakTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userState.weakTopics.map((t: string) => (
                    <span key={t} className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs font-semibold">{t}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No weak concepts identified yet. All systems reports green.</p>
              )}
            </div>
          </div>

          {/* Study Roadmap */}
          <div className="lg:col-span-2 bg-card border border-border/50 rounded-3xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-3 mb-6">
                <Award className="w-5 h-5 text-cyan-400" /> AI Study Roadmap Recommendations
              </h2>

              {userState.weakTopics && userState.weakTopics.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl">
                    <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">Tailored Roadmap Calibrated</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        Based on your performance anomalies in <strong>{userState.weakTopics.join(', ')}</strong>, the AI recommends prioritizing the following practice tracks:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {userState.weakTopics.map((topic: string, index: number) => (
                      <div key={topic} className="flex items-center justify-between bg-muted/20 border border-border p-4 rounded-xl hover:border-border/80 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground">{index + 1}</span>
                          <span className="text-xs font-bold text-foreground">Target Review: {topic} syntax & structure</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate('/interview-prep/quiz')}
                          className="h-8 text-xs text-primary hover:text-foreground hover:bg-primary/10"
                        >
                          Generate Quiz
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center opacity-60">
                  <Zap className="w-12 h-12 text-[#00ff88] mb-3 fill-emerald-500/20" />
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-1">Ready for Calibration</h4>
                  <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                    Once you complete quizzes, code tests, and simulator sessions, the AI will diagnose weak topics and build a customized step-by-step roadmap.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border/50 mt-6 flex justify-end">
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">AI Memory Core version: 1.0.0</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIInterviewPrepDashboard;
