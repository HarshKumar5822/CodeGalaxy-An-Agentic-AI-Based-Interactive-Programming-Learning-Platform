import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, CheckCircle2, Zap } from 'lucide-react';

interface ShieldAchievementProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  xpAwarded: number;
}

const ShieldAchievement: React.FC<ShieldAchievementProps> = ({ isVisible, onClose, title, xpAwarded }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    if (isVisible) {
      // Create random particles for the flourish
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
        color: ['#4f46e5', '#818cf8', '#fbbf24', '#00ff88'][Math.floor(Math.random() * 4)]
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop Blur overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

          <div className="relative">
            {/* Flourish Particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ 
                  x: p.x, 
                  y: p.y, 
                  opacity: 0, 
                  scale: Math.random() * 1.5 
                }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                style={{ backgroundColor: p.color }}
                className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
              />
            ))}

            <motion.div
                initial={{ scale: 0.5, y: 50, rotateY: 90 }}
                animate={{ scale: 1, y: 0, rotateY: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 100 }}
                className="relative w-[450px] bg-[#0c0c0c]/95 border border-primary/40 rounded-[3rem] p-10 text-center shadow-[0_0_100px_rgba(79,70,229,0.4)] pointer-events-auto overflow-hidden"
            >
                {/* Glow Ring */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-primary/20 rounded-full blur-[100px]"
                />

                <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full"
                            />
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.5)] rotate-45"
                            >
                                <Shield className="w-12 h-12 text-white -rotate-45" />
                            </motion.div>
                            
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0"
                            >
                                <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 text-cq-gold" />
                            </motion.div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">Achievement Unlocked</span>
                        <h2 className="text-3xl font-display font-bold text-white tracking-tight uppercase mb-2">{title}</h2>
                        <div className="h-0.5 w-12 bg-primary mx-auto rounded-full mb-6" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 }}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full"
                    >
                        <Zap className="w-4 h-4 text-cq-gold fill-cq-gold" />
                        <span className="font-mono font-bold text-lg">+{xpAwarded} Mastery XP</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-10"
                    >
                        <button 
                            onClick={onClose}
                            className="text-xs text-primary font-black uppercase tracking-[0.2em] hover:text-white transition-colors cursor-pointer"
                        >
                            Return to Mission
                        </button>
                    </motion.div>
                </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShieldAchievement;
