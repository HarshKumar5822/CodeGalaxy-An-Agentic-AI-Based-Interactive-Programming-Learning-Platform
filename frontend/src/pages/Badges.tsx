import { motion } from 'framer-motion';
import { Award, Lock, ShieldCheck, Zap, Star, Trophy, Globe } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Badge from '@/components/gamification/Badge';
import { useGamification } from '@/contexts/GamificationContext';
import { Button } from '@/components/ui/button';

const Badges = () => {
    const { stats } = useGamification();
    
    const ALL_BADGES = [
        { id: 'b1', name: 'Neural Link', description: 'Reached 500 Mastery XP', icon: '🧠', xpRequired: 500, tier: 'Bronze' },
        { id: 'b2', name: 'Knowledge Architect', description: 'Reached 1000 Mastery XP', icon: '🏛️', xpRequired: 1000, tier: 'Silver' },
        { id: 'b3', name: 'Code Pilot', description: 'Completed first 5 challenges', icon: '🚀', xpRequired: 0, tier: 'Bronze' },
        { id: 'b4', name: 'CodeGalaxy Scholar', description: 'Reached 2500 Mastery XP', icon: '📜', xpRequired: 2500, tier: 'Gold' },
        { id: 'b5', name: 'Bug Hunter', description: 'Solved a hard difficulty challenge', icon: '🕷️', xpRequired: 0, tier: 'Silver' },
        { id: 'b6', name: 'Grand Oracle', description: 'Reached 5000 Mastery XP', icon: '⚔️', xpRequired: 5000, tier: 'Platinum' },
    ];

    const earnedBadges = ALL_BADGES.filter(b => 
        (b.xpRequired > 0 && (stats?.xp || 0) >= b.xpRequired) || 
        stats?.badges?.some((sb: any) => sb.badge === b.id || sb.badge?._id === b.id)
    );
    const lockedBadges = ALL_BADGES.filter(b => !earnedBadges.find(eb => eb.id === b.id));

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 scroll-smooth overflow-x-hidden">
            <Navbar isLoggedIn />

            {/* Background Atmosphere */}
            <div className="fixed inset-0 bg-deep-space z-0 pointer-events-none" />
            <div className="fixed inset-0 bg-grid opacity-5 z-0 pointer-events-none" />

            <main className="relative z-10 pt-32 pb-24 px-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                           <ShieldCheck className="w-6 h-6 text-primary animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Sector Honor Registry</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 italic leading-none">
                            Collection of <span className="text-primary italic text-glow-cyan leading-tight">Honors</span>
                        </h1>
                        <p className="text-white/40 text-lg font-medium tracking-tight max-w-xl">
                            Your journey through the CodeGalaxy Universe, recorded in high-fidelity holographic markers.
                        </p>
                    </motion.div>

                    <div className="flex gap-10">
                        <div className="mission-card border-cq-gold/20 bg-cq-gold/[0.03] p-8 text-center min-w-[160px] group">
                            <Star className="w-5 h-5 text-cq-gold mb-3 mx-auto drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-cq-gold/50 mb-1 group-hover:text-cq-gold transition-colors">Licenses Earned</p>
                            <p className="text-5xl font-display font-black italic tracking-tighter leading-none group-hover:scale-110 transition-transform">{earnedBadges.length}</p>
                        </div>
                        <div className="mission-card border-white/5 p-8 text-center min-w-[160px] group">
                            <Globe className="w-5 h-5 text-white/20 mb-3 mx-auto group-hover:text-primary transition-colors" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1 group-hover:text-white/40 transition-colors">Synchronization</p>
                            <p className="text-5xl font-display font-black italic tracking-tighter text-white/40 leading-none group-hover:text-white transition-colors">
                                {ALL_BADGES.length > 0 ? Math.round((earnedBadges.length / ALL_BADGES.length) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section: Validated Credentials (Earned) */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-32"
                >
                    <div className="flex items-center gap-6 mb-12">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-cq-gold bg-white/5 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-xl flex items-center gap-4 group">
                            <Zap className="w-3 h-3 text-cq-gold fill-cq-gold animate-pulse" />
                            Active Tactical Licenses
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-cq-gold/20 to-transparent" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-12">
                        {earnedBadges.map((badge, i) => (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + (i * 0.05) }}
                            >
                                <Badge
                                    icon={badge.icon}
                                    name={badge.name}
                                    description={badge.description}
                                    isEarned={true}
                                    size="lg"
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Section: Locked Records (Locked) */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                     <div className="flex items-center gap-6 mb-12">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 bg-white/[0.02] px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4">
                            <Lock className="w-3 h-3 text-white/10" />
                            Pending Authentication Nodes
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-12 opacity-50">
                        {lockedBadges.map((badge, i) => (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + (i * 0.05) }}
                            >
                                <Badge
                                    icon={badge.icon}
                                    name={badge.name}
                                    description={badge.description}
                                    isEarned={false}
                                    size="lg"
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Return Dashboard Call */}
                <motion.div
                   initial={{ opacity: 0, y: 40 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="mt-40 p-16 rounded-[4rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl text-center group relative overflow-hidden"
                >
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[120px] pointer-events-none" />
                   <Trophy className="w-16 h-16 text-cq-gold mb-8 mx-auto animate-bounce duration-[3s]" />
                   <h3 className="font-display text-4xl font-black italic tracking-tighter uppercase mb-4">Ascend to <span className="text-primary italic leading-none italic">Glory</span></h3>
                   <p className="text-white/40 mb-12 max-w-lg mx-auto font-medium">Continue your missions to synchronize remaining badges with your neural profile.</p>
                   <Button 
                      onClick={() => window.location.href = '/dashboard'}
                      className="h-16 px-16 rounded-[2rem] bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                   >
                      Back to Mission Control
                   </Button>
                </motion.div>
            </main>

            {/* Footer Registry */}
            <footer className="py-16 border-t border-white/5 opacity-30 mt-20">
               <div className="text-center text-[10px] font-black uppercase tracking-[0.5em]">
                  CodeGalaxy // Synthetic Honor Registry // End of Logs
               </div>
            </footer>
        </div>
    );
};

export default Badges;
