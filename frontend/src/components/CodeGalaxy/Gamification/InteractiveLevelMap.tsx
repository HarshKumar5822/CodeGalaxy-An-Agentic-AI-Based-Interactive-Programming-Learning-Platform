import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Play, CheckCircle2, Star, Sparkles, Navigation, Layers, Compass, AlertCircle } from 'lucide-react';
import api from '@/utils/api';
import TrackSelectorPanel from './TrackSelectorPanel';

// --- Custom Star Node (The Module) ---
const StarNode = ({ data }: { data: any }) => {
  const isLocked = data.status === 'locked';
  const isCompleted = data.status === 'completed';
  const isCurrent = data.status === 'current';

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="relative flex flex-col items-center"
    >
      {/* Star Aura / Nebula */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: isCurrent ? [0.4, 0.7, 0.4] : isCompleted ? [0.2, 0.4, 0.2] : [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className={`absolute inset-[-25px] rounded-full blur-2xl pointer-events-none ${
          isCompleted ? 'bg-green-500/30' : isLocked ? 'bg-white/10' : 'bg-primary/40'
        }`}
      />

      {/* Main Star Body */}
      <div className={`
        w-16 h-16 rounded-full border flex items-center justify-center relative z-10
        transition-all duration-700
        ${isLocked ? 'bg-[#1a1a1a] border-white/20 text-white/30 shadow-[0_0_15px_rgba(255,255,255,0.03)]' : 
          isCompleted ? 'bg-gradient-to-br from-green-600/30 to-black border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 
          'bg-gradient-to-br from-primary/30 to-black border-primary/80 text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.35)]'}
      `}>
        <Handle type="target" position={Position.Top} className="!opacity-0" />
        
        <div className="flex flex-col items-center">
          {isLocked ? <Lock className="w-4 h-4" /> : 
           isCompleted ? <CheckCircle2 className="w-5 h-5" /> : 
           <Play className="w-5 h-5 fill-primary/20" />}
          <span className="text-[7.5px] font-black uppercase tracking-widest mt-0.5">Lvl {data.levelNumber}</span>
        </div>

        <Handle type="source" position={Position.Bottom} className="!opacity-0" />
      </div>

      {/* Label Flare */}
      <div className="mt-2.5 text-center z-20">
        <h3 className={`text-xs font-black uppercase tracking-[0.15em] transition-colors duration-500 ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
             {data.label}
        </h3>
        <div className={`text-[8px] font-bold mt-0.5 px-2 py-0.5 rounded-full inline-block border ${
            isLocked ? 'border-white/20 text-white/30' : 'border-primary/45 text-primary/85 bg-primary/5'
        }`}>
            {data.difficulty}
        </div>
      </div>

      {/* Surface Sparkles */}
      {!isLocked && (
          <div className="absolute inset-0 pointer-events-none z-30">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 text-white/20" />
              </motion.div>
          </div>
      )}
    </motion.div>
  );
};

const nodeTypes = {
  levelNode: StarNode,
};

// --- Internal Map with Provider Context ---
const MapContent = ({ category, difficulty, onDrillDown, onTrackChange, onOpenSelector }: any) => {
  const { setViewport, fitView } = useReactFlow();
  const [levels, setLevels] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [levelsRes, progressRes] = await Promise.all([
        api.get('/learning/levels', { params: { category, difficulty } }),
        api.get('/learning/progress')
      ]);
      
      if (Array.isArray(levelsRes.data)) {
        setLevels(levelsRes.data);
      }
      setUserProgress(progressRes.data);
    } catch (err) {
      console.error("Failed to fetch levels or progress", err);
      setError("Failed to sync neural grid. Mission Control is offline.");
    } finally {
      setLoading(false);
    }
  }, [category, difficulty]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    if (!levels.length) return { nodes: [], edges: [] };

    // --- GALAXY VERTICAL WINDING PATH LAYOUT ---
    const nodes = levels.map((level, index) => {
      // A gentle, vertical winding S-curve layout that fits perfectly inside the screen width
      const x = Math.sin(index * 1.0) * 55;
      const y = index * 120;

      const completedIds = userProgress?.completedChallenges?.map((c: any) => (c?.challenge?._id || c?.challenge || '').toString()) || [];
      let status = 'locked';
      const levelChallengeIds = level.challenges?.map((c: any) => (c?._id || c || '').toString()) || [];
      const isCompleted = levelChallengeIds.length > 0 && levelChallengeIds.every((id: string) => completedIds.includes(id));
      const prevLevelChallengeIds = levels[index-1]?.challenges?.map((c: any) => (c?._id || c || '').toString()) || [];
      const isPreviousCompleted = index === 0 || (prevLevelChallengeIds.length > 0 && prevLevelChallengeIds.every((id: string) => completedIds.includes(id)));

      if (isCompleted) status = 'completed';
      else if (isPreviousCompleted) status = 'current';

      return {
        id: level._id,
        type: 'levelNode',
        position: { x, y },
        data: {
          label: level.title,
          status: status,
          levelNumber: level.levelNumber,
          difficulty: level.difficulty || difficulty,
        },
      };
    });

    const edges = levels.slice(0, -1).map((level, index) => {
        const sourceStatus = nodes[index].data.status;
        const isCompleted = sourceStatus === 'completed';
        
        return {
          id: `e-${level._id}-${levels[index+1]._id}`,
          source: level._id,
          target: levels[index+1]._id,
          animated: isCompleted,
          type: 'bezier',
          style: { 
            stroke: isCompleted ? '#4f46e5' : 'rgba(255,255,255,0.2)', 
            strokeWidth: isCompleted ? 3 : 1.5,
            filter: isCompleted ? 'drop-shadow(0 0 15px #4f46e5)' : 'none',
            strokeDasharray: isCompleted ? 'none' : '5,5'
          },
        };
    });

    return { nodes, edges };
  }, [levels, userProgress, difficulty]);

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(flowNodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setRfNodes(flowNodes);
    setRfEdges(flowEdges);
    // Auto-focus on current node
    const currentNode = flowNodes.find(n => n.data.status === 'current') || flowNodes[0];
    if (currentNode) {
        fitView({ nodes: [currentNode], duration: 1500, padding: 2 });
    }
  }, [flowNodes, flowEdges, setRfNodes, setRfEdges, fitView]);

  const handleNodeClick = (_: any, node: any) => {
    if (node.data.status !== 'locked') {
        // Zoom and FTL transition
        fitView({ nodes: [node], duration: 800, padding: 0.2 });
        setTimeout(() => onDrillDown(node.id), 850);
    }
  };

  const translateExtent = useMemo(() => {
    if (!levels.length) return undefined;
    const maxY = (levels.length - 1) * 120;
    return [
      [-1000, -1000],
      [1000, maxY + 1000]
    ] as [[number, number], [number, number]];
  }, [levels.length]);

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center bg-black/80 backdrop-blur-md">
       <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
            transition={{ rotate: { duration: 10, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
            className="w-20 h-20 rounded-full border-b-2 border-primary shadow-[0_0_30px_#4f46e5]"
          />
          <p className="text-primary text-xs uppercase font-black tracking-[0.5em] animate-pulse">Calculating Hyper-Jump...</p>
       </div>
    </div>
  );

  if (error) return (
    <div className="h-full w-full flex items-center justify-center bg-black/90 backdrop-blur-md">
       <div className="flex flex-col items-center gap-6 p-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
             <AlertCircle className="w-10 h-10 text-red-500 animate-pulse" />
          </div>
          <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">Neural Sync Failed</h3>
          <p className="text-red-400 text-xs font-mono uppercase tracking-widest">{error}</p>
          <p className="text-white/40 text-[10px] uppercase font-black tracking-wider mt-4 leading-relaxed">Please ensure the backend server is active and running on port 5005.</p>
       </div>
    </div>
  );

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        panOnScroll
        selectionOnDrag
        zoomOnScroll={false}
        minZoom={0.6}
        maxZoom={1.5}
        translateExtent={translateExtent}
      />

      {/* HUD: GALAXY HUB SELECTOR */}
      <div className="absolute top-4 left-4 z-[100]">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSelector}
          className="flex items-center gap-2.5 bg-card/90 backdrop-blur-xl border border-border/40 rounded-xl px-4 py-2.5 shadow-lg group text-foreground"
        >
          <Compass className="w-5 h-5 text-primary transition-transform duration-700 group-hover:rotate-45" />
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Navigation HUB</p>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">{category.split('-').join(' ')}</p>
          </div>
          <div className="ml-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-black text-primary group-hover:bg-primary group-hover:text-card-foreground transition-colors border border-primary/20">
            {levels.length}
          </div>
        </motion.button>
      </div>

      {/* HUD: STATUS INDICATOR */}
      <div className="absolute bottom-4 right-4 flex gap-3 pointer-events-none hidden sm:flex">
          <div className="bg-card/90 backdrop-blur-xl border border-border/40 rounded-xl p-3 flex items-center gap-3 shadow-md">
               <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                   <Layers className="w-4 h-4 text-primary" />
               </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Difficulty</p>
                    <p className="text-xs font-bold text-foreground uppercase">{difficulty}</p>
                </div>
           </div>
           <div className="bg-card/90 backdrop-blur-xl border border-border/40 rounded-xl p-3 flex items-center gap-3 shadow-md">
                <div className="w-2.5 h-8 rounded-full bg-muted relative overflow-hidden border border-border/40">
                    <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: '65%' }}
                     className="absolute bottom-0 left-0 w-full bg-primary" 
                    />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">AI Core</p>
                    <p className="text-xs font-bold text-primary uppercase italic tracking-wider">Ready</p>
                </div>
           </div>
      </div>
    </div>
  );
};

const InteractiveLevelMap: React.FC<InteractiveLevelMapProps> = (props) => {
  return (
    <div className="h-[460px] md:h-[480px] lg:h-[500px] w-full bg-card rounded-2xl border border-border/40 overflow-hidden relative shadow-2xl">
      {/* Galaxy Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0f172a,transparent_70%)] opacity-10 dark:opacity-70" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 dark:opacity-40 pointer-events-none" />
      
      <ReactFlowProvider>
        <MapContent {...props} />
      </ReactFlowProvider>
    </div>
  );
};

interface InteractiveLevelMapProps {
  category: string;
  difficulty: string;
  onDrillDown: (levelId: string) => void;
  onTrackChange?: (track: string, level: string) => void;
  onOpenSelector?: () => void;
}

export default InteractiveLevelMap;
