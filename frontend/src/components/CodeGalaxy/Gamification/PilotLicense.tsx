import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Shield, ChevronDown, Award, Zap, Code2, Terminal, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PilotLicenseProps {
  stack: string;
  level: string;
  progressPercentage: number;
  onOpenSelector: () => void;
}

const PilotLicense: React.FC<PilotLicenseProps> = ({ stack, level, progressPercentage, onOpenSelector }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Kinetic Tilt Effect Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const getStackIcon = (stackName: string) => {
    switch (stackName) {
      case 'Python': return <Terminal className="w-6 h-6" />;
      case 'JavaScript': return <Code2 className="w-6 h-6" />;
      default: return <Layers className="w-6 h-6" />;
    }
  };

  return (
    <div className="relative z-30 inline-block">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative group cursor-pointer inline-block"
        onClick={onOpenSelector}
      >
        {/* Kinetic Badge Emblem */}
        <div className="inline-flex items-center gap-3 bg-card/90 dark:bg-[#111111] border border-border/60 dark:border-white/10 rounded-2xl p-2.5 px-4 shadow-md dark:shadow-2xl transition-all duration-300 group-hover:border-cq-cyan/60 overflow-hidden">
          {/* Backdrop Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cq-cyan/5 to-transparent pointer-events-none" />
          
          {/* The Shield Badge */}
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
             {/* Metallic Rings */}
             <div className="absolute inset-0 border-[2px] border-border/40 dark:border-white/10 rounded-full" />
             <motion.div 
               animate={{ rotate: isHovered ? 180 : 0 }}
               className="absolute inset-0 border-[2px] border-cq-cyan/20 border-t-cq-cyan rounded-full" 
             />
             
             {/* Emblem Body */}
             <div className="relative w-8 h-8 bg-muted dark:bg-gradient-to-br dark:from-gray-800 dark:to-black rounded-lg shadow-inner flex items-center justify-center text-cq-cyan group-hover:text-primary transition-colors">
                <div className="transform transition-transform duration-500 group-hover:scale-110">
                   {getStackIcon(stack)}
                </div>
             </div>
          </div>

          {/* License Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-cq-cyan transition-colors">
                 Knowledge License
               </span>
               <div className="w-1 h-1 rounded-full bg-cq-cyan animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
               <h3 className="text-base font-display font-bold text-foreground dark:text-white tracking-tight leading-none uppercase">
                 {stack} <span className="text-cq-cyan italic">{level}</span>
               </h3>
               <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground dark:group-hover:text-white transition-colors" />
            </div>

            {/* Micro Progress Bar */}
            <div className="mt-1.5 w-full h-1 bg-muted dark:bg-white/10 rounded-full overflow-hidden border border-border/30 dark:border-white/5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progressPercentage}%` }}
                 className="h-full bg-gradient-to-r from-cq-cyan to-blue-500"
               />
            </div>
          </div>
        </div>

        {/* Hover Particle Effect */}
        {isHovered && (
          <div className="absolute -inset-1.5 bg-cq-cyan/20 blur-xl -z-10 rounded-2xl animate-pulse" />
        )}
      </motion.div>
    </div>
  );
};

export default PilotLicense;
