import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Bot, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  Layers, 
  Compass, 
  CheckCircle,
  FileText,
  Shield,
  Code,
  Sliders,
  Terminal,
  Cpu,
  Brain,
  Mic,
  MicOff
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/utils/api';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

const PRESET_TEMPLATES = [
  {
    label: "Grid Shortest Path",
    prompt: "Create a challenge about finding the shortest path in a 2D grid containing obstacles. The inputs are start and end coordinates and a list of blocked grid cell coordinates.",
    difficulty: "Medium",
    desc: "Coordinate pathfinding with blockages",
    icon: <Compass className="w-5 h-5 text-cyan-500" />
  },
  {
    label: "Clean Corrupted Packets",
    prompt: "Design a challenge to filter out corrupted packets from a data stream. Packets must have valid checksums and be sorted by their priority value.",
    difficulty: "Easy",
    desc: "Packets checksums validation and sorting",
    icon: <Zap className="w-5 h-5 text-emerald-500" />
  },
  {
    label: "Custom Frequency Sorting",
    prompt: "Write a challenge about sorting list frequencies. Even numbers must come first sorted ascending, then odd numbers sorted descending.",
    difficulty: "Hard",
    desc: "Complex double-pass sorting constraints",
    icon: <Layers className="w-5 h-5 text-purple-500" />
  },
  {
    label: "Maximum Signal Energy",
    prompt: "Implement a sliding window challenge to find the maximum sum of subarray elements of size K in an input array.",
    difficulty: "Medium",
    desc: "Optimized range subarray max sum queries",
    icon: <Sparkles className="w-5 h-5 text-amber-500" />
  }
];

const GENERATION_STAGES = [
  "🛸 Contacting LLM engine and initializing workspace...",
  "🧬 Synthesizing coding instructions and parameters...",
  "🧪 Fabricating test cases and assertions...",
  "🪐 Registering challenge and mapping database index..."
];

const AIChallengeGenerator = () => {
  const navigate = useNavigate();
  const [promptInput, setPromptInput] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);

  const voice = useVoiceRecognition({
    lang: 'en-IN',
    continuous: false,
    silenceTimeoutMs: 6000,
    onFinalResult: (text) => {
      setPromptInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
    },
  });

  React.useEffect(() => {
    if (voice.error) toast.error(voice.error);
  }, [voice.error]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) {
      toast.error("Please enter a challenge description or select a preset.");
      return;
    }

    setIsGenerating(true);
    setGenerationStage(0);

    const stageInterval = setInterval(() => {
      setGenerationStage((prev) => {
        if (prev < GENERATION_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1800);

    try {
      const res = await api.post('/ai/forge/generate', {
        prompt: `${promptInput} (Difficulty: ${difficulty})`
      });

      clearInterval(stageInterval);
      setGenerationStage(GENERATION_STAGES.length - 1);
      
      setTimeout(() => {
        toast.success("Challenge generated successfully!");
        navigate(`/challenge/${res.data._id}`);
      }, 1000);

    } catch (err: any) {
      clearInterval(stageInterval);
      setIsGenerating(false);
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to generate challenge.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden pb-20">
      {/* Background accents */}
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar isLoggedIn />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 relative z-10 flex flex-col gap-8">
        
        {/* Header Banner */}
        <div className="border-b border-border/40 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <Bot className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">SaaS AI Workspace</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-foreground uppercase tracking-tight italic">
              AI Challenge <span className="text-primary italic">Generator</span>
            </h1>
            <p className="text-xs text-muted-foreground max-w-xl mt-1">
              Create personalized coding challenges powered by AI to test logic, syntax, and time complexity.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 bg-card border border-border/50 px-4 py-2.5 rounded-2xl shadow-sm self-start md:self-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-foreground">AI Generation Service Online</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isGenerating ? (
            <motion.div
              key="workspace-setup"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Form Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleGenerate} className="bg-card/70 border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden space-y-6 backdrop-blur-xl">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-purple-500" />

                  {/* Prompt Textarea Box */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
                        Challenge Specification Prompt
                      </label>
                      <div className="flex items-center gap-2">
                        {voice.isListening && (
                          <span className="text-[10px] font-mono text-cq-red bg-cq-red/10 border border-cq-red/20 px-2.5 py-0.5 rounded-lg animate-pulse">
                            Listening...
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/40 px-2 py-0.5 rounded-md">
                          Markdown Supported
                        </span>
                      </div>
                    </div>

                    <div className="relative group">
                      <textarea
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        placeholder="Describe your challenge concept, programming topic, or algorithmic theme (e.g. 'Binary Search in a collapsing array, returning index of key element')... or tap the mic and say it out loud."
                        className="w-full h-36 bg-background/60 border border-border/50 rounded-2xl p-4 pr-14 text-foreground text-xs md:text-sm focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/50 resize-none font-medium leading-relaxed"
                      />
                      {voice.isSupported && (
                        <button
                          type="button"
                          onClick={voice.toggleListening}
                          title={voice.isListening ? "Stop listening" : "Dictate prompt by voice"}
                          className={`absolute right-3.5 bottom-3.5 p-2.5 rounded-xl transition-all ${
                            voice.isListening
                              ? 'bg-cq-red text-white animate-pulse shadow-md'
                              : 'bg-card border border-border/60 text-primary hover:bg-primary/10'
                          }`}
                        >
                          {voice.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preset Templates */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-border/30 pb-2">
                      <Sliders className="w-3.5 h-3.5 text-primary" />
                      <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                        Quick Preset Templates
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {PRESET_TEMPLATES.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setPromptInput(preset.prompt);
                            setDifficulty(preset.difficulty);
                          }}
                          className="bg-background/40 hover:bg-card border border-border/40 hover:border-primary/40 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-card border border-border/40 group-hover:border-primary/30 transition-colors shrink-0">
                              {preset.icon}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{preset.label}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{preset.desc}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/20">
                            <span className="text-[9px] font-mono text-muted-foreground uppercase font-medium">Load Template</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                              preset.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                              preset.difficulty === 'Medium' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
                              'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            }`}>{preset.difficulty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controls Footer */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">Difficulty:</span>
                      <div className="flex bg-background/80 rounded-xl p-1 border border-border/40">
                        {['Easy', 'Medium', 'Hard'].map((diff) => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setDifficulty(diff)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                              difficulty === diff
                                ? 'bg-primary text-black shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      className="h-12 px-6 rounded-xl font-bold uppercase tracking-wider text-xs gap-2 shrink-0"
                    >
                      <span>Generate Challenge</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </div>

              {/* Right Column: AI Info Spec Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-card/70 border border-border/50 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden backdrop-blur-xl">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-border/40 pb-3">
                    <Brain className="w-4 h-4 text-primary" />
                    AI Workspace Output
                  </h3>

                  <p className="text-xs text-muted-foreground font-medium mb-5 leading-relaxed">
                    Our AI Challenge Synthesizer maps prompts against logic constraints to output production-ready developer tasks.
                  </p>

                  <div className="space-y-3">
                    {[
                      { title: "Problem Statement", desc: "Detailed explanation, test case logic, and algorithmic goals.", icon: <FileText className="w-4 h-4 text-cyan-400" /> },
                      { title: "Test Cases & Assertion", desc: "Correct input and expected outputs to run against user solution.", icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
                      { title: "Complexity constraints", desc: "Time complexity and space constraints specifications.", icon: <Cpu className="w-4 h-4 text-purple-400" /> },
                      { title: "Verification Sandbox", desc: "Pre-configured coding editor for testing code.", icon: <Code className="w-4 h-4 text-amber-400" /> }
                    ].map((spec, i) => (
                      <div key={i} className="flex gap-3.5 p-3.5 bg-background/50 border border-border/40 rounded-2xl">
                        <div className="p-2 rounded-xl bg-card border border-border/40 shrink-0 h-fit">
                          {spec.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">{spec.title}</h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal">{spec.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center gap-2.5 text-muted-foreground font-mono text-[10px] uppercase">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                    <span>AI Engine Model Version: 2.5-Pro</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="workspace-running"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              className="w-full max-w-xl bg-card/80 border border-border/60 rounded-3xl p-8 md:p-12 text-center shadow-2xl mx-auto relative overflow-hidden backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-purple-500 animate-pulse" />

              <div className="relative w-32 h-32 mx-auto mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-t-emerald-400 border-r-transparent border-b-purple-400 border-l-transparent rounded-full opacity-60"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-3 border-4 border-l-cyan-400 border-r-transparent border-t-transparent border-b-amber-400 rounded-full opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
              </div>

              <h2 className="text-xl font-display font-black text-foreground uppercase tracking-wider mb-1 italic">
                Synthesizing Code Task
              </h2>
              <p className="text-xs text-muted-foreground font-mono tracking-wider uppercase mb-6">
                Compiling problem structure
              </p>

              <div className="bg-background/60 border border-border/50 rounded-2xl p-5 font-mono text-xs text-left space-y-2.5">
                {GENERATION_STAGES.map((stage, idx) => {
                  const isActive = idx === generationStage;
                  const isPast = idx < generationStage;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 transition-opacity duration-300 ${
                        isActive ? 'text-emerald-400 font-bold animate-pulse' : isPast ? 'text-foreground/60 opacity-60' : 'text-foreground/20 opacity-20'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-emerald-400 animate-ping' : isPast ? 'bg-foreground/40' : 'bg-foreground/20'
                      }`} />
                      <p className="truncate">{stage}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AIChallengeGenerator;
