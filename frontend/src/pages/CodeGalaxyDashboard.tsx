import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GamificationDashboard from '@/components/CodeGalaxy/Gamification/GamificationDashboard';
import InteractiveLevelMap from '@/components/CodeGalaxy/Gamification/InteractiveLevelMap';
import SolarSystemView from '@/components/CodeGalaxy/Gamification/SolarSystemView';
import PilotLicense from '@/components/CodeGalaxy/Gamification/PilotLicense';
import TrackSelectorPanel from '@/components/CodeGalaxy/Gamification/TrackSelectorPanel';
import Navbar from '@/components/layout/Navbar';
import { Code2, Terminal, Layers, Zap, BookOpen, Map, ArrowRight, Server, Database, Brain, Globe, Cpu, LayoutDashboard, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGamification } from '@/contexts/GamificationContext';

const CodeGalaxyDashboard: React.FC = () => {
    const [step, setStep] = useState<'stack' | 'level' | 'dashboard'>('stack');
    const [selectedStack, setSelectedStack] = useState<string>('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [drillDownLevelId, setDrillDownLevelId] = useState<string | null>(null);
    const [selectorOpen, setSelectorOpen] = useState(false);
    const { stats, triggerAchievement } = useGamification();

    useEffect(() => {
        const savedStack = localStorage.getItem('codegalaxy_stack');
        const savedLevel = localStorage.getItem('codegalaxy_level');
        if (savedStack && savedLevel) {
            setSelectedStack(savedStack);
            setSelectedLevel(savedLevel);
            setStep('dashboard');
        }
    }, []);

    const handleStackSelect = (stack: string) => {
        setSelectedStack(stack);
        setStep('level');
    };

    const handleLevelSelect = (level: string) => {
        setSelectedLevel(level);
        localStorage.setItem('codegalaxy_stack', selectedStack);
        localStorage.setItem('codegalaxy_level', level);
        setStep('dashboard');
    };

    const getRoadmapLink = (stack: string) => {
        switch (stack) {
            case 'Frontend': return 'https://roadmap.sh/frontend';
            case 'Backend': return 'https://roadmap.sh/backend';
            case 'DevOps': return 'https://roadmap.sh/devops';
            case 'Full Stack': return 'https://roadmap.sh/full-stack';
            case 'Data Science': return 'https://roadmap.sh/data-science';
            case 'AI & ML': return 'https://roadmap.sh/ai';
            default: return 'https://roadmap.sh';
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 scroll-smooth overflow-x-hidden">
            <Navbar isLoggedIn />
            
            {/* Background Atmosphere */}
            <div className="fixed inset-0 bg-deep-space z-0 pointer-events-none" />
            <div className="fixed inset-0 bg-grid opacity-5 z-0 pointer-events-none" />

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 py-2 mt-2">
                <AnimatePresence mode="wait">
                    {step === 'stack' && (
                        <motion.div
                            key="stack"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            className="py-2"
                        >
                            <div className="text-center mb-6 relative">
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cq-cyan/10 dark:bg-white/5 border border-cq-cyan/30 dark:border-white/10 backdrop-blur-xl mb-2.5 shadow-sm"
                                >
                                    <div className="w-2 h-2 rounded-full bg-cq-cyan animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-foreground">Establish Specialization Context</span>
                                </motion.div>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black mb-2 tracking-tight italic leading-tight text-foreground">
                                  Choose Your <span className="text-cq-cyan italic">Knowledge Track</span>
                                </h1>
                                <p className="text-muted-foreground text-xs sm:text-sm max-w-xl mx-auto font-medium">
                                  Select a neural path to begin your journey in the CodeGalaxy ecosystem.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { id: 'Python', label: 'Python Master', desc: 'Core language, automation, and backend.', icon: Terminal, color: 'text-blue-400' },
                                    { id: 'JavaScript', label: 'Web Architect', desc: 'Modern web development with Node/React.', icon: Code2, color: 'text-yellow-400' },
                                    { id: 'Backend', label: 'Systems Engineer', desc: 'Server logic, DBs, and architecture.', icon: Server, color: 'text-emerald-400' },
                                    { id: 'Data Science', label: 'Data Alchemist', desc: 'Analysis, visualization, and insights.', icon: Database, color: 'text-purple-400' },
                                    { id: 'AI & ML', label: 'Neural Pioneer', desc: 'Machine learning and intelligent agents.', icon: Brain, color: 'text-rose-400' },
                                    { id: 'DevOps', label: 'Infra Architect', desc: 'Clouds, pipelines, and scalability.', icon: Layers, color: 'text-cyan-400' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => handleStackSelect(item.id)}
                                        className="mission-card cursor-pointer group p-6 bg-white/80 dark:bg-card/20 border-gray-200 dark:border-border/40 shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${item.color} group-hover:scale-110 transition-transform`}>
                                                <item.icon className="w-8 h-8" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Sector {i+1}</span>
                                        </div>
                                        <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{item.label}</h3>
                                        <p className="text-muted-foreground text-xs font-medium leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'level' && (
                        <motion.div
                            key="level"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl mx-auto py-2"
                        >
                            <div className="text-center mb-6">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setStep('stack')}
                                    className="mb-2 text-xs font-mono text-muted-foreground hover:text-foreground"
                                >
                                    ← Back to Sectors
                                </Button>
                                <h1 className="text-2xl md:text-3xl font-display font-black text-foreground mb-2 uppercase tracking-tight">
                                    Target <span className="text-cq-cyan italic">Proficiency</span>
                                </h1>
                                <p className="text-muted-foreground text-xs">Calibrating difficulty vectors for {selectedStack}.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { id: 'Beginner', title: 'Cadet', xp: '0 - 1,000 XP', desc: 'Fundamentals, basic syntax, and initial logic setup.' },
                                    { id: 'Intermediate', title: 'Commander', xp: '1,000 - 5,000 XP', desc: 'Complex structures, dynamic algorithms, optimization.' },
                                    { id: 'Advanced', title: 'Grandmaster', xp: '5,000+ XP', desc: 'System design, high-frequency logic, elite challenges.' },
                                ].map((lvl) => (
                                    <motion.div
                                        key={lvl.id}
                                        whileHover={{ y: -4 }}
                                        onClick={() => handleLevelSelect(lvl.id)}
                                        className="mission-card cursor-pointer text-center group p-8 bg-white/80 dark:bg-card/20 border-gray-200 dark:border-border/40 shadow-lg"
                                    >
                                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cq-cyan/10 border border-cq-cyan/30 flex items-center justify-center text-cq-cyan group-hover:scale-110 transition-transform">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-display text-xl font-bold text-foreground mb-1">{lvl.title}</h3>
                                        <p className="text-[10px] font-mono font-bold text-cq-cyan mb-3">{lvl.xp}</p>
                                        <p className="text-muted-foreground text-xs leading-relaxed">{lvl.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col lg:flex-row gap-6"
                        >
                            {/* Main Content: Learning Path */}
                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center gap-3 mb-3">
                                    <div className="flex-1 min-w-[280px]">
                                        <div className="mb-2">
                                            <PilotLicense 
                                                stack={selectedStack} 
                                                level={selectedLevel} 
                                                progressPercentage={Math.min(100, (stats.xp % 1000) / 10)} 
                                                onOpenSelector={() => setSelectorOpen(true)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                           <LayoutDashboard className="w-3.5 h-3.5 text-cq-cyan animate-pulse" />
                                           <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground">Active Sector Mapping</span>
                                        </div>
                                         <motion.h1 
                                            key={drillDownLevelId ? 'module' : 'universe'}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-xl md:text-3xl font-display font-black tracking-tight text-foreground mb-0.5 italic uppercase leading-none"
                                        >
                                            {drillDownLevelId ? (
                                                <>Module Core: <span className="text-cq-cyan italic">Galaxy View</span></>
                                            ) : (
                                                <>My Learning <span className="text-cq-cyan italic">Path</span></>
                                            )}
                                        </motion.h1>
                                        <p className="text-muted-foreground text-xs font-medium">
                                            {drillDownLevelId ? 'Analyzing high-level nodes within the active mission sector.' : 'View and manage your strategic learning paths.'}
                                        </p>
                                    </div>

                                    <div className="shrink-0">
                                       <a href={getRoadmapLink(selectedStack)} target="_blank" rel="noopener noreferrer">
                                           <Button className="h-10 px-4 rounded-xl bg-card border border-border/50 hover:bg-cq-cyan hover:text-black font-black uppercase tracking-wider text-xs gap-2 transition-all duration-300 group shadow-sm">
                                               <Map className="w-3.5 h-3.5 text-cq-cyan group-hover:text-black transition-colors" />
                                               Developer Roadmap
                                           </Button>
                                       </a>
                                    </div>
                                </div>

                                <div className="glass-panel p-2 rounded-2xl border-white/10 bg-white/[0.01]">
                                    {drillDownLevelId ? (
                                        <SolarSystemView 
                                            levelId={drillDownLevelId} 
                                            onBack={() => setDrillDownLevelId(null)} 
                                        />
                                    ) : (
                                        <InteractiveLevelMap 
                                            category={selectedStack} 
                                            difficulty={selectedLevel} 
                                            onDrillDown={(id) => setDrillDownLevelId(id)}
                                            onOpenSelector={() => setSelectorOpen(true)}
                                            onTrackChange={(track, level) => {
                                                setSelectedStack(track);
                                                setSelectedLevel(level);
                                                localStorage.setItem('codegalaxy_stack', track);
                                                localStorage.setItem('codegalaxy_level', level);
                                                setDrillDownLevelId(null);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Sidebar: Gamification Stats */}
                            <div className="w-full lg:w-[340px] xl:w-[380px] shrink-0 space-y-4 relative z-20 lg:pt-16">
                                <div className="glass-panel p-4 md:p-5 rounded-2xl border-white/10">
                                    <div className="flex items-center gap-2.5 mb-4">
                                       <Zap className="w-4 h-4 text-cq-gold" />
                                       <h3 className="font-display text-lg font-bold uppercase italic tracking-tighter">Mission Stats</h3>
                                    </div>
                                    <GamificationDashboard />
                                </div>

                                <div className="glass-panel p-4 md:p-5 rounded-2xl border-white/10 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                       <div className="flex items-center gap-2.5">
                                          <Target className="w-4 h-4 text-primary" />
                                          <h3 className="font-display text-lg font-bold uppercase italic tracking-tighter">Daily Quests</h3>
                                       </div>
                                       <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">Active Quests</span>
                                    </div>
                                    <ul className="space-y-3 relative z-10">
                                        {[
                                          'Complete 1 Lesson',
                                          'Follow 5 Developers',
                                          'Submit 1 Code Challenge'
                                        ].map((quest, i) => (
                                          <li key={quest} className="flex items-center gap-3 transition-transform hover:translate-x-1 duration-300">
                                              <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40">
                                                 <div className={`w-1.5 h-1.5 rounded-sm ${i === 0 ? 'bg-primary animate-pulse' : 'bg-white/10'}`} />
                                              </div>
                                              <span className={`text-xs font-bold uppercase tracking-tight ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{quest}</span>
                                          </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <Button 
                                    className="w-full h-12 rounded-xl border border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-white text-xs font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group shadow-sm"
                                    onClick={() => triggerAchievement("Neural Link Established", 500)}
                                >
                                    <span className="relative z-10">Show Achievement Notification</span>
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* GLOBAL MISSION CONTROL: Truly Fixed & Centered */}
            <TrackSelectorPanel 
                isOpen={selectorOpen}
                onClose={() => setSelectorOpen(false)}
                currentTrack={selectedStack}
                currentLevel={selectedLevel}
                onSelectTrack={(track, level) => {
                    setSelectorOpen(false);
                    setSelectedStack(track);
                    setSelectedLevel(level);
                    localStorage.setItem('codegalaxy_stack', track);
                    localStorage.setItem('codegalaxy_level', level);
                    setDrillDownLevelId(null);
                }}
            />
        </div>
    );
};

export default CodeGalaxyDashboard;
