import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  ArrowRight,
  Layers,
  CheckCircle,
  ListChecks,
  Wand2,
  Loader2,
  ClipboardList,
  PlayCircle,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import api from '@/utils/api';

type Tab = 'chain' | 'agent';

interface ChainStep {
  name: string;
  output: string;
}

interface ChainResult {
  topic: string;
  steps: ChainStep[];
}

interface AgentResult {
  task: string;
  plan: string[];
  stepResults: string[];
  finalOutput: string;
}

const MarkdownBlock: React.FC<{ text: string }> = ({ text }) => (
  <div className="prose-invert text-sm text-foreground/90 leading-relaxed [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:list-inside [&_ol]:list-decimal [&_ol]:list-inside [&_ul]:space-y-1 [&_ol]:space-y-1 [&_p]:mb-2 last:[&_p]:mb-0">
    <ReactMarkdown>{text}</ReactMarkdown>
  </div>
);

const AILabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('chain');

  // --- Prompt Chaining state ---
  const [topic, setTopic] = useState('');
  const [chainResult, setChainResult] = useState<ChainResult | null>(null);
  const [isChaining, setIsChaining] = useState(false);

  const runChain = async () => {
    if (!topic.trim()) {
      toast.error('Enter a topic first.');
      return;
    }
    setIsChaining(true);
    setChainResult(null);
    try {
      const res = await api.post('/ai/prompt-chain', { topic: topic.trim() });
      setChainResult(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Prompt chain failed');
    } finally {
      setIsChaining(false);
    }
  };

  // --- Agentic AI state ---
  const [task, setTask] = useState('');
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [isRunningAgent, setIsRunningAgent] = useState(false);

  const runAgent = async () => {
    if (!task.trim()) {
      toast.error('Enter a task first.');
      return;
    }
    setIsRunningAgent(true);
    setAgentResult(null);
    try {
      const res = await api.post('/ai/agent/run', { task: task.trim() });
      setAgentResult(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Agent run failed');
    } finally {
      setIsRunningAgent(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden pb-16">
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-32">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-4">
            <Bot className="w-3.5 h-3.5" /> AI Lab
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Prompt Chaining &amp; Agentic AI
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
            Two small, self-contained demos: a sequential multi-step LLM workflow, and a simple
            plan-then-execute AI agent.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveTab('chain')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
              activeTab === 'chain'
                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
            }`}
          >
            <Layers className="w-4 h-4" /> Prompt Chaining
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
              activeTab === 'agent'
                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/50'
            }`}
          >
            <Bot className="w-4 h-4" /> Agentic AI
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'chain' && (
            <motion.div
              key="chain"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-card/50 border border-border rounded-2xl p-5 sm:p-6">
                <label className="text-xs font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Topic
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runChain()}
                    placeholder="e.g. Binary Search Trees, REST vs GraphQL, React Hooks..."
                    className="flex-1 bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-muted/40 transition-all placeholder:text-muted-foreground/50"
                  />
                  <Button onClick={runChain} disabled={isChaining} className="shrink-0">
                    {isChaining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                    Run Chain
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  3 sequential LLM calls: <strong>Summary</strong> → (fed into) <strong>Key Points</strong> → (fed into) <strong>3 Questions</strong>.
                </p>
              </div>

              {chainResult && (
                <div className="space-y-4">
                  {chainResult.steps.map((step, i) => (
                    <motion.div
                      key={step.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card/50 border border-border rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <h3 className="font-bold text-sm uppercase tracking-wide text-foreground/90">{step.name}</h3>
                      </div>
                      <MarkdownBlock text={step.output} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'agent' && (
            <motion.div
              key="agent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-card/50 border border-border rounded-2xl p-5 sm:p-6">
                <label className="text-xs font-black uppercase tracking-widest text-foreground/80 flex items-center gap-2 mb-3">
                  <Wand2 className="w-4 h-4 text-purple-400" /> Task for the agent
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runAgent()}
                    placeholder="e.g. Plan a 3-day trip to Goa on a budget of ₹15,000"
                    className="flex-1 bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:bg-muted/40 transition-all placeholder:text-muted-foreground/50"
                  />
                  <Button onClick={runAgent} disabled={isRunningAgent} className="shrink-0">
                    {isRunningAgent ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                    Run Agent
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  The agent <strong>plans</strong> the steps needed, <strong>executes</strong> each one in order
                  (using earlier results as context), then <strong>finalizes</strong> one consolidated output.
                </p>
              </div>

              {agentResult && (
                <div className="space-y-4">
                  <div className="bg-card/50 border border-border rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ClipboardList className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-sm uppercase tracking-wide text-foreground/90">Plan</h3>
                    </div>
                    <ol className="space-y-2">
                      {agentResult.plan.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                          <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {agentResult.stepResults.map((result, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-card/30 border border-border/70 rounded-2xl p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <ListChecks className="w-3.5 h-3.5 text-cyan-400" />
                        <h4 className="font-semibold text-xs uppercase tracking-wide text-foreground/70">
                          Step {i + 1}: {agentResult.plan[i]}
                        </h4>
                      </div>
                      <MarkdownBlock text={result} />
                    </motion.div>
                  ))}

                  <div className="bg-primary/5 border border-primary/25 rounded-2xl p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <h3 className="font-black text-sm uppercase tracking-wide text-primary">Final Output</h3>
                    </div>
                    <MarkdownBlock text={agentResult.finalOutput} />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AILabPage;
