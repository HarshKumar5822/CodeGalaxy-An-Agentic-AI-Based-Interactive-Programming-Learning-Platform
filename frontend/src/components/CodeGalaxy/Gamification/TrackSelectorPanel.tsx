import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, X, Search, Binary, Cpu, Globe, Braces, Terminal, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/utils/api';

interface Category {
  category: string;
  difficulties: string[];
  totalLevels: number;
}

interface TrackSelectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: string;
  currentLevel: string;
  onSelectTrack: (trackId: string, level: string) => void;
}

const TrackSelectorPanel: React.FC<TrackSelectorPanelProps> = ({ isOpen, onClose, currentTrack, currentLevel, onSelectTrack }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const res = await api.get('/learning/categories');
          setCategories(res.data);
        } catch (err) {
          console.error("Failed to fetch categories", err);
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  const filteredCategories = categories.filter(c => 
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('python')) return <Terminal className="w-5 h-5" />;
    if (n.includes('java') || n.includes('c#') || n.includes('c++') || n.includes(' c ')) return <Code2 className="w-5 h-5" />;
    if (n.includes('react') || n.includes('web') || n.includes('html') || n.includes('javascript') || n.includes('ts')) return <Globe className="w-5 h-5" />;
    if (n.includes('ai') || n.includes('neural') || n.includes('data')) return <Cpu className="w-5 h-5" />;
    if (n.includes('algo') || n.includes('dsa') || n.includes('system')) return <Binary className="w-5 h-5" />;
    return <Braces className="w-5 h-5" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-start">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Sliding Sidebar Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-[380px] h-screen bg-card border-r border-border/40 shadow-2xl flex flex-col text-foreground z-[1001]"
          >
            <div className="flex flex-col h-full p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3.5 h-3.5 text-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Mission Control</span>
                  </div>
                  <h2 className="text-xl font-display font-bold text-foreground uppercase tracking-tight">Select Track</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-8 h-8 hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search Bar */}
               <div className="relative mb-6 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                     type="text" 
                     placeholder="Search 25+ Galactic Tracks..." 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-muted border border-border/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground text-foreground"
                  />
               </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-3">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] uppercase font-black tracking-widest text-primary/40">Scanning sectors...</p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground uppercase font-black text-xs tracking-widest">No Tracks Identified</div>
                ) : filteredCategories.map((cat) => (
                    <div 
                        key={cat.category}
                        className={`
                            p-4 rounded-2xl border border-border/40 bg-card hover:bg-muted/50 transition-all duration-300
                            ${currentTrack === cat.category ? 'border-primary/40 ring-1 ring-primary/20 bg-primary/5' : ''}
                        `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${currentTrack === cat.category ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'bg-muted border-border/40 text-muted-foreground'}`}>
                                {getIcon(cat.category)}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-base font-bold text-foreground uppercase tracking-wide leading-tight">{cat.category}</h4>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight mt-0.5">{cat.totalLevels} Symmetrical Levels</p>
                            </div>
                        </div>

                        {/* Level Selectors Inside Course */}
                        <div className="flex gap-2 mt-4">
                            {['Beginner', 'Intermediate', 'Advanced'].map(diff => {
                                const exists = cat.difficulties.includes(diff);
                                const isCurrent = currentTrack === cat.category && currentLevel === diff;
                                return (
                                    <button
                                        key={diff}
                                        disabled={!exists}
                                        onClick={() => onSelectTrack(cat.category, diff)}
                                        className={`
                                            flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all duration-300
                                            ${!exists ? 'opacity-10 cursor-not-allowed border-transparent bg-transparent text-muted-foreground/30' : 
                                              isCurrent 
                                              ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.25)]' 
                                              : 'border-border/40 bg-muted text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary'}
                                        `}
                                    >
                                        {diff.slice(0, 3)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">
                    <span>Total Tracks: {categories.length}</span>
                    <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-primary animate-pulse" /> Sector Sync Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TrackSelectorPanel;
