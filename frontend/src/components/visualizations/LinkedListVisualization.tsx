import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LinkedListNode {
  id: string;
  data: number | string;
  x: number;
  y: number;
  isNew: boolean;
  isTraversing: boolean;
}

interface LinkedListVisualizationProps {
  nodes: { data: number | string }[];
  currentStep: 'create' | 'assign' | 'link' | 'traverse' | 'idle';
  traverseIndex?: number;
}

const LinkedListVisualization = ({ nodes, currentStep, traverseIndex = -1 }: LinkedListVisualizationProps) => {
  const [visualNodes, setVisualNodes] = useState<LinkedListNode[]>([]);
  const nodeWidth = 100;
  const nodeHeight = 60;
  const gap = 80;

  useEffect(() => {
    const newNodes = nodes.map((node, index) => ({
      id: `node-${index}`,
      data: node.data,
      x: 50 + index * (nodeWidth + gap),
      y: 120,
      isNew: index === nodes.length - 1 && currentStep === 'create',
      isTraversing: currentStep === 'traverse' && index === traverseIndex,
    }));
    setVisualNodes(newNodes);
  }, [nodes, currentStep, traverseIndex]);

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* SVG for connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="hsl(var(--cq-cyan))"
            />
          </marker>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--cq-cyan))" />
            <stop offset="100%" stopColor="hsl(var(--cq-purple))" />
          </linearGradient>
        </defs>

        {/* Connection lines */}
        {visualNodes.map((node, index) => {
          if (index < visualNodes.length - 1) {
            const nextNode = visualNodes[index + 1];
            const startX = node.x + nodeWidth;
            const startY = node.y + nodeHeight / 2;
            const endX = nextNode.x;
            const endY = nextNode.y + nodeHeight / 2;

            return (
              <motion.line
                key={`line-${index}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="url(#lineGradient)"
                strokeWidth={3}
                markerEnd="url(#arrowhead)"
                className={currentStep === 'link' && index === visualNodes.length - 2 ? 'connection-line' : ''}
              />
            );
          }
          return null;
        })}
      </svg>

      {/* Nodes */}
      <AnimatePresence>
        {visualNodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              boxShadow: node.isTraversing
                ? '0 0 30px hsl(var(--cq-cyan) / 0.8)'
                : node.isNew
                ? '0 0 20px hsl(var(--cq-green) / 0.6)'
                : '0 0 15px hsl(var(--cq-cyan) / 0.3)',
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: index * 0.1,
            }}
            className={`absolute flex flex-col rounded-xl border-2 overflow-hidden ${
              node.isTraversing
                ? 'border-cq-cyan bg-cq-cyan/20'
                : node.isNew
                ? 'border-cq-green bg-cq-green/20'
                : 'border-cq-cyan/50 bg-card'
            }`}
            style={{
              left: node.x,
              top: node.y,
              width: nodeWidth,
              height: nodeHeight,
            }}
          >
            {/* Data section */}
            <div className="flex-1 flex items-center justify-center bg-card/80 px-2">
              <span className="font-mono font-bold text-lg text-foreground">
                {node.data}
              </span>
            </div>

            {/* Pointer section */}
            <div className="h-5 flex items-center justify-center bg-muted/50 border-t border-border/30">
              <span className="font-mono text-xs text-muted-foreground">
                {index < visualNodes.length - 1 ? 'next →' : 'null'}
              </span>
            </div>

            {/* Pulse animation for new nodes */}
            {node.isNew && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 1, repeat: 2 }}
                className="absolute inset-0 border-2 border-cq-green rounded-xl"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Head pointer label */}
      {visualNodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute flex flex-col items-center"
          style={{ left: 50 + nodeWidth / 2 - 20, top: 70 }}
        >
          <span className="text-sm font-display font-semibold text-cq-cyan">HEAD</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-cq-cyan"
          />
        </motion.div>
      )}

      {/* Tail pointer label */}
      {visualNodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute flex flex-col items-center"
          style={{
            left: visualNodes[visualNodes.length - 1].x + nodeWidth / 2 - 15,
            top: 200,
          }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-cq-purple"
          />
          <span className="text-sm font-display font-semibold text-cq-purple">TAIL</span>
        </motion.div>
      )}

      {/* Empty state */}
      {visualNodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4"
            >
              <span className="text-3xl text-muted-foreground/50">?</span>
            </motion.div>
            <p className="text-muted-foreground">Write code to create your first node</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedListVisualization;
