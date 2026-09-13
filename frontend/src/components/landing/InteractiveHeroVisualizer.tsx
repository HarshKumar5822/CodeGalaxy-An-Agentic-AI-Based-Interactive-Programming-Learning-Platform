import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Shuffle, Sparkles, Binary, BarChart3, Network, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InteractiveHeroVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'binary' | 'sort' | 'graph' | 'ai'>('binary');

  // --- 1. Binary Search State ---
  const bsArray = [5, 14, 23, 38, 47, 59, 68, 77, 86, 94];
  const [bsTarget, setBsTarget] = useState<number>(68);
  const [bsLow, setBsLow] = useState<number>(0);
  const [bsHigh, setBsHigh] = useState<number>(bsArray.length - 1);
  const [bsMid, setBsMid] = useState<number | null>(Math.floor((0 + bsArray.length - 1) / 2));
  const [bsStatus, setBsStatus] = useState<string>('Ready: Target is ' + bsTarget);
  const [bsIsPlaying, setBsIsPlaying] = useState<boolean>(false);
  const [bsFound, setBsFound] = useState<boolean>(false);

  const resetBinarySearch = (targetVal = 68) => {
    setBsTarget(targetVal);
    setBsLow(0);
    setBsHigh(bsArray.length - 1);
    const initialMid = Math.floor((0 + bsArray.length - 1) / 2);
    setBsMid(initialMid);
    setBsStatus(`Initialized: Target ${targetVal}. Initial Mid index = ${initialMid} (value: ${bsArray[initialMid]})`);
    setBsFound(false);
    setBsIsPlaying(false);
  };

  const stepBinarySearch = () => {
    if (bsFound || bsLow > bsHigh) {
      resetBinarySearch(bsTarget);
      return;
    }
    const currentMid = Math.floor((bsLow + bsHigh) / 2);
    setBsMid(currentMid);
    const midVal = bsArray[currentMid];

    if (midVal === bsTarget) {
      setBsFound(true);
      setBsStatus(`🎉 Found target ${bsTarget} at index ${currentMid}!`);
      setBsIsPlaying(false);
    } else if (midVal < bsTarget) {
      setBsLow(currentMid + 1);
      const nextMid = Math.floor((currentMid + 1 + bsHigh) / 2);
      setBsMid(nextMid);
      setBsStatus(`Value ${midVal} < ${bsTarget} ➔ Shift Low pointer to index ${currentMid + 1}`);
    } else {
      setBsHigh(currentMid - 1);
      const nextMid = Math.floor((bsLow + currentMid - 1) / 2);
      setBsMid(nextMid);
      setBsStatus(`Value ${midVal} > ${bsTarget} ➔ Shift High pointer to index ${currentMid - 1}`);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (bsIsPlaying && !bsFound && bsLow <= bsHigh) {
      timer = setTimeout(() => {
        stepBinarySearch();
      }, 1200);
    } else if (bsFound) {
      setBsIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [bsIsPlaying, bsLow, bsHigh, bsMid, bsFound, bsTarget]);

  // --- 2. Sorting Visualizer State ---
  const [sortBars, setSortBars] = useState<number[]>([45, 80, 25, 90, 60, 30, 70, 15, 55, 95]);
  const [sortActiveIndices, setSortActiveIndices] = useState<number[]>([]);
  const [sortSortedIndices, setSortSortedIndices] = useState<number[]>([]);
  const [sortIsSorting, setSortIsSorting] = useState<boolean>(false);
  const [sortStepCount, setSortStepCount] = useState<number>(0);

  const shuffleSortBars = () => {
    const newArr = Array.from({ length: 10 }, () => Math.floor(Math.random() * 80) + 15);
    setSortBars(newArr);
    setSortActiveIndices([]);
    setSortSortedIndices([]);
    setSortIsSorting(false);
    setSortStepCount(0);
  };

  const runBubbleSort = async () => {
    if (sortIsSorting) return;
    setSortIsSorting(true);
    const arr = [...sortBars];
    let steps = 0;

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        setSortActiveIndices([j, j + 1]);
        steps++;
        setSortStepCount(steps);
        await new Promise(res => setTimeout(res, 220));

        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setSortBars([...arr]);
          await new Promise(res => setTimeout(res, 220));
        }
      }
      setSortSortedIndices(prev => [...prev, arr.length - 1 - i]);
    }
    setSortSortedIndices(arr.map((_, idx) => idx));
    setSortActiveIndices([]);
    setSortIsSorting(false);
  };

  // --- 3. Graph Traversal State ---
  const graphNodes = [
    { id: 'A', x: 70, y: 50 },
    { id: 'B', x: 170, y: 30 },
    { id: 'C', x: 170, y: 110 },
    { id: 'D', x: 270, y: 40 },
    { id: 'E', x: 270, y: 120 },
    { id: 'F', x: 360, y: 80 }
  ];
  const graphEdges = [
    ['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F'], ['B', 'E']
  ];
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [graphIsRunning, setGraphIsRunning] = useState<boolean>(false);
  const [graphLog, setGraphLog] = useState<string>('Click Start to trace Graph BFS!');

  const runGraphBFS = async () => {
    if (graphIsRunning) return;
    setGraphIsRunning(true);
    setVisitedNodes([]);
    setGraphLog('Starting BFS from root node A...');

    const order = ['A', 'B', 'C', 'D', 'E', 'F'];
    for (let node of order) {
      setCurrentNode(node);
      setVisitedNodes(prev => [...prev, node]);
      setGraphLog(`Visited Node ${node} ➔ Queued adjacent nodes`);
      await new Promise(res => setTimeout(res, 700));
    }

    setCurrentNode(null);
    setGraphLog('✅ BFS Traversal Complete! All nodes explored.');
    setGraphIsRunning(false);
  };

  // --- 4. AI Code Mentorship State ---
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiFixed, setAiFixed] = useState<boolean>(false);

  const runAiAnalysis = () => {
    setAiAnalyzing(true);
    setAiFixed(false);
    setTimeout(() => {
      setAiAnalyzing(false);
      setAiFixed(true);
    }, 1200);
  };

  return (
    <div className="w-full bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-gray-200/80 dark:border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Decorative Gradient Flare */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-cq-cyan/20 to-cq-purple/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tabs */}
      <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-gray-200/60 dark:border-white/10 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
          <button
            onClick={() => setActiveTab('binary')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'binary'
                ? 'bg-cq-cyan text-black shadow-md font-extrabold'
                : 'text-gray-600 dark:text-gray-400 hover:text-foreground'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Binary Search</span>
          </button>

          <button
            onClick={() => setActiveTab('sort')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sort'
                ? 'bg-cq-purple text-white shadow-md font-extrabold'
                : 'text-gray-600 dark:text-gray-400 hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Sorting</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'graph'
                ? 'bg-emerald-500 text-white shadow-md font-extrabold'
                : 'text-gray-600 dark:text-gray-400 hover:text-foreground'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Graph BFS</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai'
                ? 'bg-amber-500 text-black shadow-md font-extrabold'
                : 'text-gray-600 dark:text-gray-400 hover:text-foreground'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Mentor</span>
          </button>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold tracking-widest uppercase">
          <Sparkles className="w-3 h-3 animate-spin" /> Interactive
        </span>
      </div>

      {/* Tab Content Display */}
      <div className="min-h-[220px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* 1. BINARY SEARCH TAB */}
          {activeTab === 'binary' && (
            <motion.div
              key="binary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                  Target Selection:
                  <span className="ml-2 px-2 py-0.5 rounded bg-cq-cyan/20 text-cq-cyan font-black">
                    {bsTarget}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[23, 59, 68, 86].map(num => (
                    <button
                      key={num}
                      onClick={() => resetBinarySearch(num)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all ${
                        bsTarget === num
                          ? 'bg-cq-cyan/20 border-cq-cyan text-cq-cyan'
                          : 'border-gray-200 dark:border-white/10 text-gray-500 hover:text-foreground'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Array Boxes */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 py-2">
                {bsArray.map((val, idx) => {
                  const isMid = bsMid === idx;
                  const isLow = bsLow === idx;
                  const isHigh = bsHigh === idx;
                  const isFound = bsFound && bsMid === idx;
                  const isOutOfRange = idx < bsLow || idx > bsHigh;

                  return (
                    <motion.div
                      key={idx}
                      onClick={() => resetBinarySearch(val)}
                      animate={{ scale: isMid ? 1.08 : 1 }}
                      className={`relative flex flex-col items-center justify-center h-14 rounded-xl font-mono border text-xs cursor-pointer transition-all duration-300 ${
                        isFound
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                          : isMid
                          ? 'bg-cq-cyan/20 border-cq-cyan text-cq-cyan font-black shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                          : isOutOfRange
                          ? 'bg-gray-100/50 dark:bg-white/5 border-gray-200/50 dark:border-white/5 text-gray-400 opacity-40'
                          : 'bg-white dark:bg-white/10 border-gray-300 dark:border-white/15 text-foreground hover:border-cq-cyan/50'
                      }`}
                    >
                      <span className="font-bold">{val}</span>
                      <span className="text-[8px] opacity-60">[{idx}]</span>

                      {/* Pointer Indicators */}
                      <div className="absolute -bottom-4 flex items-center gap-0.5 text-[8px] font-bold">
                        {isLow && <span className="text-cq-gold">L</span>}
                        {isMid && <span className="text-cq-cyan font-black">M</span>}
                        {isHigh && <span className="text-cq-purple">H</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Status Message */}
              <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 font-mono text-[11px] text-gray-700 dark:text-gray-300 flex items-center justify-between">
                <span className="truncate pr-2">{bsStatus}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-cq-cyan shrink-0">
                  {bsFound ? 'SUCCESS' : 'SEARCHING'}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => setBsIsPlaying(!bsIsPlaying)}
                  className="rounded-xl bg-cq-cyan text-black hover:bg-cq-cyan/80 text-xs font-black"
                >
                  {bsIsPlaying ? <Pause className="w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                  {bsIsPlaying ? 'Pause' : 'Auto Play'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stepBinarySearch}
                  disabled={bsFound}
                  className="rounded-xl text-xs font-bold border-gray-300 dark:border-white/15"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-1" />
                  Step Forward
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => resetBinarySearch(bsTarget)}
                  className="rounded-xl text-xs font-bold text-gray-500 hover:text-foreground"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              </div>
            </motion.div>
          )}

          {/* 2. SORTING VISUALIZER TAB */}
          {activeTab === 'sort' && (
            <motion.div
              key="sort"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-600 dark:text-gray-400">
                <span>Algorithm: <strong className="text-cq-purple">Bubble Sort</strong></span>
                <span>Swaps / Comparisons: <strong className="text-cq-purple">{sortStepCount}</strong></span>
              </div>

              {/* Bar Visualizer */}
              <div className="h-32 flex items-end justify-between gap-1.5 p-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/5">
                {sortBars.map((val, idx) => {
                  const isActive = sortActiveIndices.includes(idx);
                  const isSorted = sortSortedIndices.includes(idx);

                  return (
                    <motion.div
                      key={idx}
                      layout
                      style={{ height: `${val}%` }}
                      className={`flex-1 rounded-t-lg transition-all duration-200 flex flex-col justify-end items-center pb-1 text-[9px] font-mono font-bold ${
                        isActive
                          ? 'bg-cq-purple text-white shadow-[0_0_12px_rgba(139,92,246,0.6)]'
                          : isSorted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-cq-cyan/70 text-black'
                      }`}
                    >
                      <span>{val}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={runBubbleSort}
                  disabled={sortIsSorting}
                  className="rounded-xl bg-cq-purple text-white hover:bg-cq-purple/80 text-xs font-black"
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  {sortIsSorting ? 'Sorting...' : 'Start Bubble Sort'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={shuffleSortBars}
                  disabled={sortIsSorting}
                  className="rounded-xl text-xs font-bold border-gray-300 dark:border-white/15"
                >
                  <Shuffle className="w-3.5 h-3.5 mr-1" />
                  Shuffle Array
                </Button>
              </div>
            </motion.div>
          )}

          {/* 3. GRAPH BFS TAB */}
          {activeTab === 'graph' && (
            <motion.div
              key="graph"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* SVG Graph Canvas */}
              <div className="relative h-36 w-full rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 overflow-hidden flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 440 160">
                  {/* Render Edges */}
                  {graphEdges.map(([fromId, toId], idx) => {
                    const fromNode = graphNodes.find(n => n.id === fromId)!;
                    const toNode = graphNodes.find(n => n.id === toId)!;
                    const isVisitedEdge = visitedNodes.includes(fromId) && visitedNodes.includes(toId);

                    return (
                      <line
                        key={idx}
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke={isVisitedEdge ? '#10b981' : 'rgba(150,150,150,0.3)'}
                        strokeWidth={isVisitedEdge ? 2.5 : 1.5}
                        strokeDasharray={isVisitedEdge ? 'none' : '4 2'}
                      />
                    );
                  })}

                  {/* Render Nodes */}
                  {graphNodes.map(n => {
                    const isCurrent = currentNode === n.id;
                    const isVisited = visitedNodes.includes(n.id);

                    return (
                      <g key={n.id}>
                        <circle
                          cx={n.x}
                          cy={n.y}
                          r={16}
                          fill={isCurrent ? '#3b82f6' : isVisited ? '#10b981' : '#1f2937'}
                          stroke={isCurrent ? '#60a5fa' : isVisited ? '#34d399' : '#4b5563'}
                          strokeWidth={2}
                          className="transition-all duration-300"
                        />
                        <text
                          x={n.x}
                          y={n.y + 4}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {n.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                {graphLog}
              </div>

              <Button
                size="sm"
                onClick={runGraphBFS}
                disabled={graphIsRunning}
                className="rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 text-xs font-black"
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                {graphIsRunning ? 'Exploring Graph...' : 'Run BFS Traversal'}
              </Button>
            </motion.div>
          )}

          {/* 4. AI MENTOR TAB */}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className="p-3 rounded-2xl bg-gray-900 text-white font-mono text-[11px] border border-gray-800 space-y-1">
                <div className="text-gray-500 text-[9px] font-bold uppercase">Code Telemetry Inspection:</div>
                <div className="text-gray-400">1: <span className="text-purple-400">def</span> <span className="text-amber-300">find_max</span>(arr):</div>
                <div className="text-gray-400">2:   max_val = arr[0]</div>
                <div className={`p-1 rounded ${aiFixed ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300' : 'bg-red-950/80 border border-red-500/50 text-red-300'}`}>
                  3: {aiFixed ? '  for i in range(1, len(arr)):' : '  for i in range(0, len(arr) + 1):  # ⚠️ IndexOutOfBounds Bug'}
                </div>
                <div className="text-gray-400">4:     if arr[i] &gt; max_val: max_val = arr[i]</div>
              </div>

              {aiAnalyzing && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin shrink-0" />
                  <span>AI Neural Engine inspecting memory bounds and loop indices...</span>
                </div>
              )}

              {aiFixed && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Diagnostic Fixed! Range adjusted to avoid off-by-one array overflow.</span>
                </div>
              )}

              <Button
                size="sm"
                onClick={runAiAnalysis}
                disabled={aiAnalyzing}
                className="rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-xs font-black"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {aiAnalyzing ? 'Analyzing Bug...' : 'Run AI Diagnostic Demo'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
