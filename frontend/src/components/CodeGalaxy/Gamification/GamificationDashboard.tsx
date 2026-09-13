import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';

const GamificationDashboard: React.FC = () => {
    const { stats } = useGamification();

    return (
        <div className="w-full flex flex-col gap-3 font-mono text-white">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center transition-all hover:border-primary/20 hover:bg-white/[0.02]">
                    <Trophy className="w-5 h-5 text-cq-gold mb-1.5 drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]" />
                    <span className="text-xl md:text-2xl font-display font-black italic tracking-tighter leading-none mb-1">
                        {stats.xp}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground text-center">Total XP</span>
                </div>

                <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center transition-all hover:border-primary/20 hover:bg-white/[0.02]">
                    <Medal className="w-5 h-5 text-cq-cyan mb-1.5 drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]" />
                    <span className="text-xl md:text-2xl font-display font-black italic tracking-tighter leading-none mb-1">
                        {stats.badges.length}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground text-center">Badges</span>
                </div>

                <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center transition-all hover:border-primary/20 hover:bg-white/[0.02]">
                    <span className="text-xl mb-1 animate-bounce">🔥</span>
                    <span className="text-xl md:text-2xl font-display font-black italic tracking-tighter leading-none mb-1">
                        {stats.streak}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground text-center">Streak</span>
                </div>
            </div>

            {/* Recent Badges */}
            <div className="mt-2 border-t border-white/5 pt-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Recent Credentials</span>
                {stats.badges.length === 0 ? (
                    <div className="text-[9px] text-muted-foreground italic uppercase tracking-wider font-mono py-1">
                        No active licenses registry
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {stats.badges.slice(0, 4).map((item: any, idx: number) => {
                            const badgeObj = item?.badge || item;
                            if (!badgeObj || !badgeObj.name) return null;
                            return (
                                <motion.div
                                    key={badgeObj._id || badgeObj.id || idx}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    className="flex items-center gap-2 p-2 bg-white/[0.02] hover:bg-white/5 rounded-lg border border-white/5 transition-colors"
                                >
                                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cq-purple to-cq-cyan flex items-center justify-center text-white font-black text-xs italic shrink-0">
                                        {badgeObj.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[11px] text-white truncate">{badgeObj.name}</p>
                                        <p className="text-[8px] text-muted-foreground font-black uppercase tracking-wider">{badgeObj.rarity || 'Verified'}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamificationDashboard;
