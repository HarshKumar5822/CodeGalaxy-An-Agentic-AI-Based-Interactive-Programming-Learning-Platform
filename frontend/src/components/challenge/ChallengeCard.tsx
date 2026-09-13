import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ChevronRight, Star, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Challenge } from '@/data/mockData';

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
}

const difficultyColors: Record<string, string> = {
  beginner: 'from-cq-green to-emerald-600',
  intermediate: 'from-cq-cyan to-blue-600',
  advanced: 'from-cq-purple to-pink-600',
  Easy: 'from-cq-green to-emerald-600',
  Medium: 'from-cq-cyan to-blue-600',
  Hard: 'from-cq-purple to-pink-600',
};

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  Easy: 'Beginner',
  Medium: 'Intermediate',
  Hard: 'Advanced',
};

const ChallengeCard = ({ challenge, index }: ChallengeCardProps) => {
  if (!challenge) return null;
  const isAccessible = !challenge.isLocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={isAccessible ? { scale: 1.02, y: -5 } : {}}
      className={`relative group ${!isAccessible ? 'opacity-40 grayscale pointer-events-none' : ''}`}
    >
      {isAccessible ? (
        <Link to={`/challenge/${challenge._id || challenge.id}`}>
          <CardContent challenge={challenge} />
        </Link>
      ) : (
        <CardContent challenge={challenge} />
      )}

      {/* Lock overlay */}
      {challenge.isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md rounded-[2rem] z-20 border border-border/40">
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
               <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Secure Connection Required</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const CardContent = ({ challenge }: { challenge: Challenge }) => {
  if (!challenge) return null;
  const diffClass = difficultyColors[challenge.difficulty] || 'from-cq-cyan to-blue-600';
  
  return (
    <div className="mission-card border-border/40 group hover:border-primary/40 transition-all duration-500 h-full flex flex-col">
      {/* Glow Effect on Hover */}
      <div className={`absolute -inset-2 bg-gradient-to-br ${diffClass} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity`} />
      
      {/* Top Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <span className="px-3 py-1 rounded-lg bg-secondary/30 border border-border/30 text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
          {challenge.category?.toLowerCase() === 'nebula forge' 
            ? 'AI Generated' 
            : (challenge.category || challenge.type || 'MISSION_MODULE')}
        </span>
        
        {challenge.isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cq-green/10 border border-cq-green/20 text-cq-green text-[9px] font-black uppercase tracking-widest"
          >
            <CheckCircle2 className="h-3 w-3" />
            CLEARED
          </motion.div>
        )}
      </div>

      <div className="flex-1 relative z-10">
        {/* Title */}
        <h3 className="font-display text-xl font-black mb-3 italic tracking-tight group-hover:text-primary dark:text-white text-foreground transition-colors leading-tight">
          {challenge.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-xs font-medium leading-relaxed group-hover:text-foreground transition-colors line-clamp-3">
          {challenge.description}
        </p>
      </div>

      {/* Footer / Stats */}
      <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
           {/* Difficulty Label */}
           <div className={`flex items-center gap-1.5`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${diffClass} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {difficultyLabels[challenge.difficulty]}
              </span>
           </div>

           {/* XP Stat */}
           <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-cq-gold" />
              <span className="text-[10px] font-black text-foreground/80 dark:text-white/80 tracking-widest font-mono">
                {challenge.xpReward} XP
              </span>
           </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-secondary/30 border border-border/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
           <ChevronRight className="w-4 h-4 text-muted-foreground/80 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};

export default ChallengeCard;
