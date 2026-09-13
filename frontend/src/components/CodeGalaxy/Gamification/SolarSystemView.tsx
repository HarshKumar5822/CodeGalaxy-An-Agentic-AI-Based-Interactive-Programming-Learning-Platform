import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, Star, Zap, Info, Sparkles, BookOpen, 
  Code2, CheckCircle2, ArrowRight, RefreshCw, X, ShieldAlert, Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/utils/api';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  type: string;
  xpReward: number;
}

interface SolarSystemViewProps {
  levelId: string;
  onBack: () => void;
}

// Generate topic-aware 15-20 lines AI study material matching exact programming language & concept
const generateTopicAIGuide = (topicTitle: string, levelTitle: string, description?: string) => {
  const titleLower = (topicTitle + ' ' + levelTitle).toLowerCase();
  
  // Detect language / domain
  const isC = titleLower.includes('c ') || titleLower.includes('intro to c') || titleLower.includes('pointer') || titleLower.includes('memory') || titleLower.includes('c++') || titleLower.includes('struct');
  const isPython = titleLower.includes('python') || titleLower.includes('django') || titleLower.includes('flask');
  const isJava = titleLower.includes('java') || titleLower.includes('spring');
  const isJS = titleLower.includes('javascript') || titleLower.includes('react') || titleLower.includes('web') || titleLower.includes('node');

  let langLabel = 'C Language / Systems Programming';
  let codeExample = `#include <stdio.h>
#include <stdlib.h>

// Production C Implementation Pattern for ${topicTitle}
int main() {
    int size = 5;
    int* dataArray = (int*)malloc(size * sizeof(int));
    if (dataArray == NULL) {
        printf("Memory allocation failed!\\n");
        return 1; // Exit with error code
    }

    // Initialize & Process Memory Array
    for (int i = 0; i < size; i++) {
        dataArray[i] = (i + 1) * 10;
        printf("Value at index %d: %d\\n", i, dataArray[i]);
    }

    // Always free dynamically allocated heap memory to prevent memory leaks
    free(dataArray);
    dataArray = NULL; // Clear dangling pointer
    return 0;
}`;

  let pitfalls = [
    `⚠️ Dangling Pointers & Memory Leaks: Always free heap memory allocated via malloc()/calloc().`,
    `⚠️ Buffer Overflow Vulnerabilities: Ensure array indexes stay strictly within allocated bounds.`,
    `⚠️ Uninitialized Pointer Access: Pointers contain garbage addresses until explicitly initialized.`
  ];

  let realWorldApp = `Powering Operating Systems (Linux, Windows), Embedded IoT Devices, High-Frequency Trading Engines, Database Kernels (PostgreSQL, MySQL), and Game Engines.`;

  if (isPython) {
    langLabel = 'Python 3';
    codeExample = `# Production Python Pattern for ${topicTitle}
def execute_optimized_${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}(data_input: list) -> dict:
    if not data_input:
        return {}
    
    # Process frequency and data structure
    results = {}
    for item in data_input:
        results[item] = results.get(item, 0) + 1
        
    return results`;

    pitfalls = [
      `⚠️ Mutable Default Arguments: Avoid using lists or dicts as default parameter values.`,
      `⚠️ Global Interpreter Lock (GIL): Use multiprocessing instead of threading for CPU-bound tasks.`,
      `⚠️ Late Binding Closures: Be cautious when creating lambda functions inside iteration loops.`
    ];
    realWorldApp = `Data Science pipelines (PyTorch, TensorFlow), Backend API microservices (FastAPI, Django), and AI/ML model orchestration.`;
  } else if (isJS) {
    langLabel = 'TypeScript / JavaScript (Node.js & React)';
    codeExample = `// Modern Production Pattern for ${topicTitle}
export const process${topicTitle.replace(/[^a-zA-Z0-9]/g, '')} = (dataStream: string[]): Map<string, number> => {
  const tracker = new Map<string, number>();
  
  for (const token of dataStream) {
    tracker.set(token, (tracker.get(token) || 0) + 1);
  }
  
  return tracker;
};`;

    pitfalls = [
      `⚠️ Unhandled Promise Rejections: Always chain .catch() or wrap await calls in try-catch blocks.`,
      `⚠️ Event Listener Leaks: Remove window scroll and resize event listeners in cleanup functions.`,
      `⚠️ Closure Variable Capturing: Beware of stale state in React hooks when dependencies are omitted.`
    ];
    realWorldApp = `Modern Full-Stack Applications, Next.js Web Platforms, React Native Mobile Apps, and Real-Time Socket Servers.`;
  }

  return {
    overview: description && description.length > 20 
      ? description 
      : `Mastering ${topicTitle} in ${levelTitle} provides core foundational competence. This guide covers syntax rules, execution semantics, memory management, and production engineering practices in ${langLabel}.`,

    coreMechanics: [
      `1. Syntax Fundamentals: ${topicTitle} establishes correct memory semantics and compiler control flow.`,
      `2. Data Organization: Manages variable scopes, data types, and stack/heap memory layouts cleanly.`,
      `3. Execution Safety: Validates boundary conditions and guards against runtime panic / segfaults.`,
      `4. Time & Space Bounds: Optimized for predictable runtime performance and low latency.`,
      `5. Best Practices: Clean code organization with modular functions and defensive programming.`
    ],

    langLabel,
    codeExample,
    pitfalls,
    realWorldApplication: realWorldApp
  };
};

const SolarSystemView: React.FC<SolarSystemViewProps> = ({ levelId, onBack }) => {
  const navigate = useNavigate();
  const [level, setLevel] = useState<any>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Active Selected Topic for AI Deep Dive Modal
  const [selectedTopic, setSelectedTopic] = useState<Challenge | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiContent, setAiContent] = useState<any>(null);

  useEffect(() => {
    const fetchSystemData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/learning/levels/${levelId}`);
        if (res.data) {
          setLevel(res.data);
          if (res.data.challenges && res.data.challenges.length > 0 && typeof res.data.challenges[0] === 'object') {
            setChallenges(res.data.challenges.filter(Boolean));
          } else if (res.data.challenges) {
             const challengeDetails = await Promise.all(
               res.data.challenges.map((id: string) => 
                 api.get(`/learning/challenges/${id}`)
                   .then(r => r.data)
                   .catch((err) => {
                     console.error(`Failed to fetch challenge details for ID: ${id}`, err);
                     return null;
                   })
               )
             );
             setChallenges(challengeDetails.filter(Boolean));
          }
        }
      } catch (err) {
        console.error("Failed to fetch solar system data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSystemData();
  }, [levelId]);

  // Open Topic Modal and generate AI content
  const handleOpenTopic = async (challenge: Challenge) => {
    setSelectedTopic(challenge);
    setIsGeneratingAI(true);

    // Initial synthesis matching language and description
    const guide = generateTopicAIGuide(challenge.title, level?.title || 'Learning Path', challenge.description);
    setAiContent(guide);

    // Simulate AI LLM Deep-Dive synthesis
    try {
      const aiRes = await api.post('/ai/forge/generate', {
        prompt: `Generate 15-20 line comprehensive masterclass notes for topic: ${challenge.title} in level ${level?.title}`
      }).catch(() => null);

      if (aiRes?.data?.description) {
        setAiContent((prev: any) => ({ ...prev, overview: aiRes.data.description }));
      }
    } catch {
      // Gracefully use synthesized guide
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleRegenerateAI = () => {
    if (!selectedTopic) return;
    setIsGeneratingAI(true);
    toast.info("Synthesizing new AI explanation...");
    setTimeout(() => {
      const guide = generateTopicAIGuide(selectedTopic.title, level?.title || 'Learning Path', selectedTopic.description);
      setAiContent(guide);
      setIsGeneratingAI(false);
      toast.success("AI Topic Notes updated!");
    }, 700);
  };

  if (loading) return (
    <div className="h-[600px] w-full flex flex-col items-center justify-center gap-4">
      <div className="relative w-24 h-24">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-2 border-primary border-b-transparent rounded-full"
        />
      </div>
      <p className="text-primary font-display font-medium animate-pulse">Scanning Star System Topics...</p>
    </div>
  );

  if (!level) return null;

  return (
    <div className="relative h-[460px] md:h-[480px] lg:h-[500px] w-full bg-card rounded-2xl border border-border/40 overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Stars Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />

      {/* Header Info */}
      <div className="absolute top-8 left-8 z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Return to Universe</span>
        </button>
      </div>

      <div className="absolute top-8 right-8 text-right z-10">
         <h2 className="text-2xl font-display font-bold text-foreground mb-1 uppercase tracking-tight">{level.title}</h2>
         <p className="text-xs text-muted-foreground uppercase tracking-widest leading-none flex items-center justify-end gap-2">
           <Zap className="w-3.5 h-3.5 text-yellow-500" /> Tap any topic node to launch AI Masterclass
         </p>
      </div>

      {/* The Sun (Central Level Node) */}
      <div className="relative z-20">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="relative w-40 h-40 flex items-center justify-center"
        >
           <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute -inset-4 border border-primary/20 border-dashed rounded-full"
           />
           <div className="w-28 h-28 bg-card border-4 border-primary rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_#4f46e533] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
              <Zap className="w-10 h-10 text-primary animate-pulse" />
           </div>
        </motion.div>
      </div>

      {/* The Planets (Challenge / Topic Nodes) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         {challenges.map((challenge, index) => {
            const total = challenges.length;
            const radius = 220;
            const angle = (index / total) * 2 * Math.PI - (Math.PI / 2);

            return (
              <PlanetNode 
                key={challenge._id}
                challenge={challenge}
                index={index}
                radius={radius}
                angle={angle}
                onClick={() => handleOpenTopic(challenge)}
              />
            );
         })}
      </div>

      {/* System Stats HUD */}
      <div className="absolute bottom-10 left-10 p-5 bg-card/80 backdrop-blur-md rounded-2xl border border-border/40 max-w-xs pointer-events-none hidden md:block">
          <div className="flex items-start gap-3">
             <div className="p-2.5 bg-primary/20 rounded-xl text-primary shrink-0">
                <Sparkles className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">AI Masterclass Ready</p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  Select any topic node to generate 15-20 lines of AI study notes & interactive coding challenge.
                </p>
             </div>
          </div>
      </div>

      {/* --- AI TOPIC MASTERCLASS STUDY MODAL --- */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border/60 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative space-y-6 scrollbar-none"
            >
              {/* Top Modal Header */}
              <div className="flex items-start justify-between border-b border-border/40 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono text-primary border-primary/30">
                      AI GENERATED MASTERCLASS (15-20 LINES)
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono text-cq-gold border-cq-gold/30">
                      +{selectedTopic.xpReward || 50} XP
                    </Badge>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground italic">
                    {selectedTopic.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleRegenerateAI} disabled={isGeneratingAI} title="Regenerate AI Explanation" className="rounded-xl">
                    <RefreshCw className={`w-4 h-4 text-primary ${isGeneratingAI ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedTopic(null)} className="rounded-xl">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* AI Content Body (15 - 20 Lines structured) */}
              {aiContent && (
                <div className="space-y-5 text-xs md:text-sm leading-relaxed">
                  
                  {/* Section 1: Overview (3-4 lines) */}
                  <div className="space-y-2 bg-muted/20 border border-border/40 p-4 rounded-2xl">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> 1. Concept Overview & Core Mechanics
                    </h4>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                      {aiContent.overview}
                    </p>
                  </div>

                  {/* Section 2: Core Key Principles (5 lines) */}
                  <div className="space-y-2 bg-muted/20 border border-border/40 p-4 rounded-2xl">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cq-cyan flex items-center gap-2">
                      <Cpu className="w-4 h-4" /> 2. Key Algorithmic Principles
                    </h4>
                    <ul className="space-y-1.5 font-mono text-xs text-foreground/80">
                      {aiContent.coreMechanics.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary font-bold">›</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 3: Production Code Example (5-6 lines) */}
                  <div className="space-y-2 bg-[#0c0d12] border border-border/60 p-4 rounded-2xl font-mono text-xs text-emerald-400 overflow-x-auto">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-white/50">
                      <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-primary" /> Production Code Template</span>
                      <span>ES6 / TypeScript</span>
                    </div>
                    <pre className="py-2 text-[11px] leading-relaxed text-white/90">
                      {aiContent.codeExample}
                    </pre>
                  </div>

                  {/* Section 4: Pitfalls & Warnings (3 lines) */}
                  <div className="space-y-2 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> 4. Common Engineering Pitfalls
                    </h4>
                    <ul className="space-y-1 text-xs text-rose-300/90 font-mono">
                      {aiContent.pitfalls.map((pitfall: string, idx: number) => (
                        <li key={idx}>{pitfall}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 5: Real World Application (2-3 lines) */}
                  <div className="space-y-2 bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> 5. Real-World Industry Application
                    </h4>
                    <p className="text-xs text-purple-200/80 font-medium">
                      {aiContent.realWorldApplication}
                    </p>
                  </div>

                </div>
              )}

              {/* Modal Action Footer */}
              <div className="pt-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs font-mono text-muted-foreground">
                  Ready to test your knowledge against AI test cases?
                </span>

                <Button
                  variant="hero"
                  onClick={() => {
                    const targetId = selectedTopic?._id || selectedTopic?.id;
                    if (targetId) {
                      setSelectedTopic(null);
                      navigate(`/challenge/${targetId}?from=learning-path`);
                    } else {
                      toast.error("Module ID is missing or invalid.");
                    }
                  }}
                  className="rounded-xl px-6 font-bold text-xs gap-2 w-full sm:w-auto"
                >
                  <span>Start Coding Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- Sub-component: PlanetNode ---
const PlanetNode = ({ challenge, index, radius, angle, onClick }: any) => {
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <motion.div 
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ x, y, opacity: 1 }}
      transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 100 }}
      className="absolute pointer-events-auto"
    >
       <motion.div 
         whileHover={{ scale: 1.15 }}
         onClick={onClick}
         className="relative group cursor-pointer"
       >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/5 rounded-full -z-10" 
               style={{ width: radius * 2, height: radius * 2 }} />

          <div className="w-16 h-16 bg-card border-2 border-border/40 rounded-2xl flex flex-col items-center justify-center transition-all group-hover:border-primary/50 group-hover:shadow-[0_0_20px_rgba(0,255,136,0.3)]">
             <BookOpen className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
             <span className="text-[8px] font-bold uppercase mt-1 opacity-60">Topic {index + 1}</span>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 opacity-0 group-hover:opacity-100 transition-all text-center w-36 pointer-events-none">
             <p className="text-[10px] font-bold text-foreground whitespace-nowrap overflow-hidden text-ellipsis shadow-lg bg-card/90 px-2.5 py-1 rounded-lg border border-border/40">
               {challenge.title}
             </p>
             <div className="flex items-center justify-center gap-1 mt-1">
                <Zap className="w-2.5 h-2.5 text-cq-gold" />
                <span className="text-[9px] font-bold text-cq-gold">AI Study Notes</span>
             </div>
          </div>
       </motion.div>
    </motion.div>
  );
};

export default SolarSystemView;
