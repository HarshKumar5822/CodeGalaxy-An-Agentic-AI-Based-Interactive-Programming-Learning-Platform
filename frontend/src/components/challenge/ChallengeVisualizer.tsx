import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, RotateCcw, Sparkles, Hash, ArrowRight, ArrowLeft,
  Grid3X3, Layers, Search, GitCommit, Network, Cpu, CheckCircle2, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChallengeVisualizerProps {
  challengeId: string;
  challengeTitle: string;
  code: string;
  parsedVariables: Array<{ name: string; value: string; type: string }>;
}

export const ChallengeVisualizer: React.FC<ChallengeVisualizerProps> = ({
  challengeId,
  challengeTitle,
  code,
  parsedVariables
}) => {
  const titleLower = (challengeTitle || '').toLowerCase();

  // Match every challenge title / topic to a specific interactive visualizer
  if (titleLower.includes('two sum')) {
    return <TwoSumVisualizer />;
  } else if (titleLower.includes('reverse string') || titleLower.includes('palindrome') || titleLower.includes('string')) {
    return <StringPatternVisualizer challengeTitle={challengeTitle} />;
  } else if (titleLower.includes('search') || titleLower.includes('binary') || titleLower.includes('find')) {
    return <BinarySearchVisualizer challengeTitle={challengeTitle} />;
  } else if (titleLower.includes('grid') || titleLower.includes('path') || titleLower.includes('matrix') || titleLower.includes('maze')) {
    return <GridPathVisualizer challengeTitle={challengeTitle} />;
  } else if (titleLower.includes('linked list') || titleLower.includes('node') || titleLower.includes('head')) {
    return <LinkedListVisualizer challengeTitle={challengeTitle} />;
  } else if (titleLower.includes('stack') || titleLower.includes('queue') || titleLower.includes('parentheses')) {
    return <StackQueueVisualizer challengeTitle={challengeTitle} />;
  } else if (titleLower.includes('sort') || titleLower.includes('packet') || titleLower.includes('frequency')) {
    return <SortingVisualizer challengeTitle={challengeTitle} />;
  } else if (titleLower.includes('tree') || titleLower.includes('bst') || titleLower.includes('graph')) {
    return <TreeGraphVisualizer challengeTitle={challengeTitle} />;
  }

  // Universal Dynamic Execution Visualizer for all other AI & Custom challenges
  return <DynamicExecutionVisualizer challengeTitle={challengeTitle} parsedVariables={parsedVariables || []} code={code} />;
};

/* ==========================================
   1. TWO SUM VISUALIZER
   ========================================== */
const TwoSumVisualizer = () => {
  const nums = [2, 7, 11, 15];
  const target = 9;

  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seen, setSeen] = useState<Record<number, number>>({});
  const [status, setStatus] = useState("Click Play to start Two Sum trace.");
  const [highlightIndices, setHighlightIndices] = useState<number[]>([]);
  const [foundPair, setFoundPair] = useState<[number, number] | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => {
        handleNextStep();
      }, 1800);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, step]);

  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
    setSeen({});
    setHighlightIndices([]);
    setFoundPair(null);
    setStatus("Simulation reset. Ready.");
  };

  const handleNextStep = () => {
    if (foundPair) {
      setIsPlaying(false);
      return;
    }

    const currentIdx = step;
    if (currentIdx >= nums.length) {
      setStatus("Searched array. No sum pair matches target.");
      setIsPlaying(false);
      return;
    }

    const val = nums[currentIdx];
    const complement = target - val;

    setHighlightIndices([currentIdx]);

    if (seen[complement] !== undefined) {
      const firstIdx = seen[complement];
      setFoundPair([firstIdx, currentIdx]);
      setHighlightIndices([firstIdx, currentIdx]);
      setStatus(`Complement ${complement} FOUND in Map at index ${firstIdx}! Solution: Indices [${firstIdx}, ${currentIdx}].`);
      setIsPlaying(false);
    } else {
      const nextSeen = { ...seen, [val]: currentIdx };
      setSeen(nextSeen);
      setStatus(`Checking ${val} at index ${currentIdx}. Complement ${target}-${val}=${complement} not in Map. Adding ${val} -> ${currentIdx}.`);
      setStep(prev => prev + 1);
    }
  };

  return (
    <div className="w-full flex flex-col h-full justify-between gap-4 font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="text-[10px] uppercase font-black text-cq-green tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Two Sum Neural Trace
        </span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={handleReset} className="w-7 h-7 text-gray-400 hover:text-white rounded-lg">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsPlaying(!isPlaying)} className="w-7 h-7 text-cq-green hover:text-cq-green/80 rounded-lg">
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button size="icon" variant="ghost" onClick={handleNextStep} disabled={!!foundPair} className="w-7 h-7 text-cq-cyan hover:text-cq-cyan/80 rounded-lg disabled:opacity-20">
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="bg-[#151518] border border-white/5 p-3 rounded-xl flex justify-between items-center shrink-0">
        <span className="text-gray-500 font-bold uppercase text-[9px]">Target:</span>
        <span className="text-lg font-black text-cq-cyan tracking-wider">{target}</span>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <span className="text-gray-500 font-bold uppercase text-[9px]">Input Array (nums):</span>
        <div className="grid grid-cols-4 gap-2">
          {nums.map((num, idx) => {
            const isCurrent = step === idx && !foundPair;
            const isResolved = foundPair && foundPair.includes(idx);
            return (
              <motion.div
                key={idx}
                animate={{
                  scale: isCurrent || isResolved ? 1.05 : 1,
                  borderColor: isResolved ? "#00ff88" : isCurrent ? "#00f0ff" : "rgba(255,255,255,0.05)"
                }}
                className={`p-3 rounded-xl border text-center relative flex flex-col justify-center items-center h-16 transition-all duration-300 ${
                  isResolved 
                    ? "bg-[#00ff88]/10 shadow-[0_0_15px_rgba(0,255,136,0.15)]" 
                    : isCurrent 
                      ? "bg-[#00f0ff]/10 shadow-[0_0_15px_rgba(0,240,255,0.15)]" 
                      : "bg-[#18181b]"
                }`}
              >
                <span className="absolute top-1.5 left-2 text-[7px] text-gray-500 font-bold font-mono">idx: {idx}</span>
                <span className="text-base font-black tracking-tight">{num}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <span className="text-gray-500 font-bold uppercase text-[9px] flex items-center gap-1">
          <Hash className="w-3 h-3 text-cq-purple" /> Lookup Map (seen):
        </span>
        <div className="flex-1 bg-[#121214] border border-white/5 rounded-xl p-3 overflow-y-auto min-h-[80px] flex flex-wrap gap-2 content-start">
          {Object.keys(seen).length === 0 ? (
            <div className="text-gray-600 text-[10px] w-full text-center my-auto uppercase italic">Map is empty</div>
          ) : (
            Object.entries(seen).map(([key, value]) => (
              <motion.div key={key} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-[#1c1c20] border border-white/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px]">
                <span className="text-cq-purple font-bold">{key}</span> ➔ <span className="text-cq-gold font-bold">idx {value}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="bg-black/40 border border-white/5 p-3 rounded-xl min-h-[50px] flex items-center shrink-0">
        <p className="text-[10px] text-gray-300 font-mono">{status}</p>
      </div>
    </div>
  );
};

/* ==========================================
   2. BINARY SEARCH VISUALIZER
   ========================================== */
const BinarySearchVisualizer = ({ challengeTitle }: { challengeTitle: string }) => {
  const arr = [4, 12, 25, 38, 42, 55, 68, 79, 91];
  const target = 42;

  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(arr.length - 1);
  const [mid, setMid] = useState(Math.floor((0 + arr.length - 1) / 2));
  const [foundIdx, setFoundIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState(`Searching for target ${target}...`);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && foundIdx === null) {
      timer = setTimeout(() => handleNext(), 1600);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, low, high, foundIdx]);

  const handleReset = () => {
    setLow(0);
    setHigh(arr.length - 1);
    setMid(Math.floor((0 + arr.length - 1) / 2));
    setFoundIdx(null);
    setIsPlaying(false);
    setStatus(`Searching for target ${target}...`);
  };

  const handleNext = () => {
    if (low > high) {
      setStatus(`Target ${target} not found in array.`);
      setIsPlaying(false);
      return;
    }
    const currentMid = Math.floor((low + high) / 2);
    setMid(currentMid);

    if (arr[currentMid] === target) {
      setFoundIdx(currentMid);
      setStatus(`FOUND target ${target} at index ${currentMid}!`);
      setIsPlaying(false);
    } else if (arr[currentMid] < target) {
      setLow(currentMid + 1);
      setStatus(`arr[mid] (${arr[currentMid]}) < ${target}. Move low to mid+1 (${currentMid + 1}).`);
    } else {
      setHigh(currentMid - 1);
      setStatus(`arr[mid] (${arr[currentMid]}) > ${target}. Move high to mid-1 (${currentMid - 1}).`);
    }
  };

  return (
    <div className="w-full flex flex-col h-full justify-between gap-4 font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="text-[10px] uppercase font-black text-cq-cyan tracking-widest flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" /> Binary Search Trace
        </span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={handleReset} className="w-7 h-7">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsPlaying(!isPlaying)} className="w-7 h-7 text-cq-green">
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button size="icon" variant="ghost" onClick={handleNext} className="w-7 h-7 text-cq-cyan">
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
        <div className="bg-primary/10 border border-primary/30 p-2 rounded-lg">Low: {low}</div>
        <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg text-amber-400">Mid: {mid} ({arr[mid]})</div>
        <div className="bg-rose-500/10 border border-rose-500/30 p-2 rounded-lg text-rose-400">High: {high}</div>
      </div>

      <div className="flex gap-1.5 items-end justify-center h-32 py-2">
        {arr.map((val, idx) => {
          const isMid = idx === mid;
          const isMatched = foundIdx === idx;
          const isRange = idx >= low && idx <= high;

          let bg = 'bg-white/10 border-white/10 opacity-30';
          if (isMatched) bg = 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]';
          else if (isMid) bg = 'bg-amber-400 border-amber-300 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]';
          else if (isRange) bg = 'bg-primary/40 border-primary text-white';

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-400">{val}</span>
              <div style={{ height: `${val * 1.1}px` }} className={`w-full rounded-t-lg border transition-all ${bg}`} />
              <span className="text-[8px] text-gray-500">[{idx}]</span>
            </div>
          );
        })}
      </div>

      <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-[10px]">
        {status}
      </div>
    </div>
  );
};

/* ==========================================
   3. GRID / PATHFINDING VISUALIZER
   ========================================== */
const GridPathVisualizer = ({ challengeTitle }: { challengeTitle: string }) => {
  const [pathStep, setPathStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const path = [[0,0], [1,0], [2,0], [2,1], [2,2], [3,2], [3,3]];
  const obstacles = [[1,1], [0,2], [2,3]];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && pathStep < path.length - 1) {
      timer = setTimeout(() => setPathStep(prev => prev + 1), 1200);
    } else if (pathStep >= path.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, pathStep]);

  return (
    <div className="w-full flex flex-col h-full justify-between gap-3 font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="text-[10px] uppercase font-black text-purple-400 tracking-widest flex items-center gap-1.5">
          <Grid3X3 className="w-3.5 h-3.5" /> 2D Grid Shortest Path Trace
        </span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setPathStep(0)} className="w-7 h-7">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setIsPlaying(!isPlaying)} className="w-7 h-7 text-cq-green">
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 max-w-[240px] mx-auto p-3 bg-black/40 border border-white/10 rounded-2xl">
        {Array.from({ length: 16 }).map((_, i) => {
          const r = Math.floor(i / 4);
          const c = i % 4;
          const isObstacle = obstacles.some(([oR, oC]) => oR === r && oC === c);
          const isPassed = path.slice(0, pathStep + 1).some(([pR, pC]) => pR === r && pC === c);
          const isCurrent = path[pathStep][0] === r && path[pathStep][1] === c;
          const isGoal = r === 3 && c === 3;

          return (
            <div
              key={i}
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-[10px] transition-all border ${
                isCurrent ? 'bg-primary border-primary shadow-[0_0_15px_rgba(0,255,136,0.5)] text-black' :
                isGoal ? 'bg-amber-400 border-amber-300 text-black' :
                isObstacle ? 'bg-rose-500/30 border-rose-500/50 text-rose-300' :
                isPassed ? 'bg-purple-500/30 border-purple-400/50 text-purple-200' :
                'bg-white/5 border-white/10 text-white/30'
              }`}
            >
              {isCurrent ? '🚀' : isGoal ? '🏁' : isObstacle ? '🚧' : `${r},${c}`}
            </div>
          );
        })}
      </div>

      <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-[10px]">
        Current Position: ({path[pathStep][0]}, {path[pathStep][1]}). {pathStep === path.length - 1 ? 'Goal Reached!' : 'Traversing grid...'}
      </div>
    </div>
  );
};

/* ==========================================
   4. LINKED LIST VISUALIZER
   ========================================== */
const LinkedListVisualizer = ({ challengeTitle }: { challengeTitle: string }) => {
  const nodes = [14, 28, 42, 67];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="w-full flex flex-col h-full justify-between gap-4 font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="text-[10px] uppercase font-black text-cq-cyan tracking-widest flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Linked List Node Trace
        </span>
        <Button size="icon" variant="ghost" onClick={() => setActiveIdx((prev) => (prev + 1) % nodes.length)} className="w-7 h-7 text-cq-cyan"><SkipForward className="w-3.5 h-3.5" /></Button>
      </div>

      <div className="flex items-center justify-center gap-3 py-8 overflow-x-auto">
        {nodes.map((val, idx) => (
          <div key={idx} className="flex items-center gap-2 shrink-0">
            <div className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center min-w-[70px] ${
              activeIdx === idx ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(0,255,136,0.3)]' : 'bg-white/5 border-white/10'
            }`}>
              <span className="text-sm font-bold text-white">{val}</span>
              <span className="text-[8px] text-gray-400">next ➔</span>
            </div>
            {idx < nodes.length - 1 && <span className="text-primary font-bold">➔</span>}
          </div>
        ))}
      </div>

      <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-[10px]">
        Inspecting Node {activeIdx + 1}: Value = {nodes[activeIdx]}
      </div>
    </div>
  );
};

/* ==========================================
   5. STACK & QUEUE VISUALIZER
   ========================================== */
const StackQueueVisualizer = ({ challengeTitle }: { challengeTitle: string }) => {
  const [stackItems, setStackItems] = useState([10, 20, 30]);

  const handlePush = () => {
    if (stackItems.length < 5) {
      setStackItems(prev => [...prev, (prev.length + 1) * 10]);
    }
  };

  const handlePop = () => {
    if (stackItems.length > 0) {
      setStackItems(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="w-full flex flex-col h-full justify-between gap-4 font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="text-[10px] uppercase font-black text-amber-400 tracking-widest flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Stack & Queue (LIFO/FIFO) Trace
        </span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handlePush} className="h-6 text-[9px] px-2">Push</Button>
          <Button size="sm" variant="outline" onClick={handlePop} className="h-6 text-[9px] px-2 text-rose-400">Pop</Button>
        </div>
      </div>

      <div className="flex justify-center items-end py-6">
        <div className="w-40 border-2 border-t-0 border-primary/50 rounded-b-2xl p-3 flex flex-col-reverse gap-2 bg-white/5 min-h-[160px]">
          {stackItems.map((item, idx) => (
            <motion.div key={idx} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-primary/20 border border-primary/40 p-2 rounded-xl text-center font-bold text-xs text-primary">
              {item} {idx === stackItems.length - 1 && <span className="text-[8px] bg-primary text-black px-1.5 rounded ml-2">TOP</span>}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-[10px]">
        Stack Depth: {stackItems.length} elements. Top element = {stackItems[stackItems.length - 1] || 'Empty'}.
      </div>
    </div>
  );
};

/* ==========================================
   6. SORTING VISUALIZER
   ========================================== */
const SortingVisualizer = ({ challengeTitle }: { challengeTitle: string }) => {
  const [items, setItems] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [inputVal, setInputVal] = useState('');
  const [csvVal, setCsvVal] = useState('');
  const [comparing, setComparing] = useState<number[]>([]);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sorted, setSorted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('Insert elements or click Play to start sorting.');

  const handleInsert = () => {
    const val = parseInt(inputVal.trim(), 10);
    if (!isNaN(val)) {
      setItems(prev => [...prev, val]);
      setInputVal('');
      setSorted(false);
      setStatus(`Inserted element ${val} into array.`);
    }
  };

  const handleSetCustomArray = () => {
    if (!csvVal.trim()) return;
    const parsed = csvVal.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
    if (parsed.length > 0) {
      setItems(parsed);
      setCsvVal('');
      setSorted(false);
      setStatus(`Array updated with ${parsed.length} custom elements.`);
    }
  };

  const handleSortInstant = () => {
    setItems([...items].sort((a, b) => a - b));
    setSorted(true);
    setComparing([]);
    setSwapping([]);
    setStatus('Array sorted in ascending order!');
  };

  const handleReset = () => {
    setItems([64, 34, 25, 12, 22, 11, 90]);
    setSorted(false);
    setComparing([]);
    setSwapping([]);
    setIsPlaying(false);
    setStatus('Array reset to default state.');
  };

  return (
    <div className="w-full flex flex-col h-full justify-between gap-3 font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="text-[10px] uppercase font-black text-cq-cyan tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Interactive Array Sorting
        </span>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={handleReset} className="h-6 text-[9px] px-2 text-gray-400">
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
          <Button size="sm" variant="hero" onClick={handleSortInstant} className="h-6 text-[9px] px-2">
            Sort Array
          </Button>
        </div>
      </div>

      {/* Input controls to insert / edit elements */}
      <div className="flex flex-wrap items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 shrink-0">
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Num"
            className="w-16 h-7 bg-white/5 border border-white/10 rounded-lg px-2 text-xs font-mono text-white focus:outline-none focus:border-primary"
          />
          <Button size="sm" variant="outline" onClick={handleInsert} className="h-7 text-[10px] px-2">
            + Insert
          </Button>
        </div>

        <div className="w-px h-4 bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
          <input
            type="text"
            value={csvVal}
            onChange={(e) => setCsvVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSetCustomArray()}
            placeholder="e.g. 45, 12, 89, 3"
            className="flex-1 h-7 bg-white/5 border border-white/10 rounded-lg px-2 text-[10px] font-mono text-white focus:outline-none focus:border-primary"
          />
          <Button size="sm" variant="secondary" onClick={handleSetCustomArray} className="h-7 text-[10px] px-2">
            Set Array
          </Button>
        </div>
      </div>

      {/* Dynamic Bar Display */}
      <div className="flex gap-1.5 items-end justify-center h-36 py-2 px-1 bg-black/20 rounded-xl border border-white/5 overflow-x-auto">
        {items.map((val, idx) => {
          const maxVal = Math.max(...items, 1);
          const heightPct = Math.max(15, Math.min(100, (val / maxVal) * 100));

          return (
            <div key={idx} className="flex-1 min-w-[20px] flex flex-col items-center gap-1">
              <span className="text-[8px] text-gray-400 font-mono">{val}</span>
              <motion.div
                layout
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t-lg border transition-all ${
                  sorted
                    ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-primary/50 border-primary shadow-[0_0_10px_rgba(0,255,136,0.15)]'
                }`}
              />
              <span className="text-[7px] text-gray-500 font-mono">[{idx}]</span>
            </div>
          );
        })}
      </div>

      <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl text-[10px] flex items-center justify-between">
        <span className="text-gray-300 font-mono">{status}</span>
        <span className="text-gray-500 font-mono text-[9px]">{items.length} items</span>
      </div>
    </div>
  );
};

/* ==========================================
   7. STRING & PATTERN VISUALIZER
   ========================================== */
const StringPatternVisualizer = ({ challengeTitle }: { challengeTitle: string }) => {
  const str = "ALGORITHM";
  const [ptr, setPtr] = useState(0);

  return (
    <div className="w-full flex flex-col h-full justify-between gap-4 font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="text-[10px] uppercase font-black text-amber-400 tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> String & Character Trace
        </span>
        <Button size="icon" variant="ghost" onClick={() => setPtr((prev) => (prev + 1) % str.length)} className="w-7 h-7 text-amber-400"><SkipForward className="w-3.5 h-3.5" /></Button>
      </div>

      <div className="flex gap-2 justify-center py-8">
        {str.split('').map((char, idx) => (
          <div key={idx} className={`w-10 h-14 rounded-xl border flex flex-col items-center justify-center ${
            ptr === idx ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold scale-110 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/5 border-white/10'
          }`}>
            <span className="text-xs">{char}</span>
            <span className="text-[8px] text-gray-500 mt-1">i:{idx}</span>
          </div>
        ))}
      </div>

      <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-[10px]">
        Character Pointer at index {ptr}: '{str[ptr]}'
      </div>
    </div>
  );
};

/* ==========================================
   8. TREE & GRAPH VISUALIZER
   ========================================== */
const TreeGraphVisualizer = ({ challengeTitle }: { challengeTitle: string }) => {
  return (
    <div className="w-full flex flex-col h-full justify-between gap-4 font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="text-[10px] uppercase font-black text-primary tracking-widest flex items-center gap-1.5">
          <GitCommit className="w-3.5 h-3.5" /> Binary Tree Node Hierarchy
        </span>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 py-6">
        <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-bold text-primary shadow-[0_0_15px_rgba(0,255,136,0.3)]">
          Root (50)
        </div>
        <div className="flex gap-16">
          <div className="w-10 h-10 rounded-full bg-cq-cyan/20 border border-cq-cyan flex items-center justify-center text-cq-cyan text-xs">
            L (25)
          </div>
          <div className="w-10 h-10 rounded-full bg-cq-purple/20 border border-cq-purple flex items-center justify-center text-cq-purple text-xs">
            R (75)
          </div>
        </div>
      </div>

      <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-[10px]">
        Binary Tree structure loaded. Left child &lt; Parent &lt; Right child.
      </div>
    </div>
  );
};

/* ==========================================
   9. UNIVERSAL DYNAMIC EXECUTION VISUALIZER (For AI & All Custom Questions)
   ========================================== */
const DynamicExecutionVisualizer: React.FC<{ challengeTitle: string; parsedVariables: Array<{ name: string; value: string; type: string }>; code: string }> = ({
  challengeTitle,
  parsedVariables,
  code
}) => {
  const validVars = (parsedVariables || []).filter(v => v && v.name);

  return (
    <div className="w-full flex flex-col h-full justify-between gap-4 font-mono text-xs text-white">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
        <span className="text-[10px] uppercase font-black text-cq-cyan tracking-widest flex items-center gap-1.5 animate-pulse">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          Neural Execution Register: {challengeTitle || 'Custom Challenge'}
        </span>
        <span className="text-[8px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
          Sync Active
        </span>
      </div>

      {/* Register State Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-3">
        {validVars.length > 0 ? (
          validVars.map((v) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#161619] border border-white/10 rounded-2xl p-3.5 shadow-xl relative overflow-hidden group hover:border-primary/40 transition-all"
            >
              <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-1.5">
                <span className="text-xs text-primary font-bold flex items-center gap-1.5">
                  <span className="text-[8px] text-primary">▶</span>
                  {v.name}
                </span>
                <span className="text-[8px] uppercase font-black text-gray-400 bg-white/5 px-2 py-0.5 rounded font-mono">{v.type}</span>
              </div>

              {v.type === 'array' ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(v.value || '').replace(/[\[\]]/g, '').split(',').map((item, i) => (
                    item.trim() && (
                      <div key={i} className="bg-primary/15 border border-primary/30 text-primary px-2 py-0.5 rounded-lg text-xs font-bold">
                        {item.trim()}
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="font-mono text-xs text-white/90 bg-black/30 p-2 rounded-xl border border-white/5">
                  {v.value}
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full opacity-60 py-16 text-center space-y-3">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-gray-300">Live Execution Register Active</span>
            <p className="text-[10px] text-gray-400 max-w-xs leading-relaxed">
              Type variable declarations in the editor (e.g. `arr = [1, 2, 3]`) or click Run Code to observe state changes in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
