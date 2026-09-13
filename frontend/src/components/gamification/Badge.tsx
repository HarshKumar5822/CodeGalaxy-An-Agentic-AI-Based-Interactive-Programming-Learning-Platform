import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';

interface BadgeProps {
  icon: string | React.ReactNode;
  name: string;
  description: string;
  isEarned: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Badge = ({ icon, name, description, isEarned, size = 'md' }: BadgeProps) => {
  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const ringGlow = isEarned 
    ? 'border-cq-gold/50 shadow-[0_0_20px_rgba(251,191,36,0.3)]' 
    : 'border-white/5 shadow-none';

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-3 group relative cursor-help"
    >
      {/* Premium Outer Ring */}
      <div className={`
        ${sizeClasses[size]} rounded-[2rem] border-2 flex items-center justify-center relative 
        transition-all duration-700 bg-[#0a0a0a] overflow-hidden
        ${ringGlow}
      `}>
        {/* Internal Metallic Texture / Gradient */}
        <div className={`
            absolute inset-1 rounded-[1.8rem] flex items-center justify-center
            ${isEarned 
                ? 'bg-gradient-to-br from-gray-800 via-cq-gold/20 to-black' 
                : 'bg-[#121212]'}
        `}>
            {/* Glossy Surface */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
            
            {/* Animated Shine for Earned */}
            {isEarned && (
                <motion.div
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 4 }}
                    className="absolute inset-0 z-10 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                />
            )}

            {/* Icon Overlay */}
            <div className={`
                z-20 transition-all duration-500
                ${isEarned ? 'scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'opacity-20 grayscale'}
            `}>
              {typeof icon === 'string' ? <span className="text-3xl">{icon}</span> : icon}
            </div>

            {/* Locked Icon */}
            {!isEarned && (
                <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/40 backdrop-blur-[1px]">
                    <Lock className="w-5 h-5 text-white/30" />
                </div>
            )}
        </div>

        {/* Orbiting Sparkle for Earned */}
        {isEarned && (
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 pointer-events-none"
            >
                <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 text-cq-gold opacity-50" />
            </motion.div>
        )}
      </div>

      {/* Label & Description Tooltip */}
      <div className="text-center relative">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isEarned ? 'text-cq-gold' : 'text-white/20'}`}>
          {name}
        </p>
        
        {/* Floating Tooltip */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
                <p className="text-[9px] text-gray-400 leading-relaxed font-medium capitalize">
                    {description}
                </p>
                {!isEarned && (
                    <div className="mt-2 pt-2 border-t border-white/5">
                        <span className="text-[8px] text-primary font-bold uppercase tracking-widest">Locked Achievement</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Badge;
