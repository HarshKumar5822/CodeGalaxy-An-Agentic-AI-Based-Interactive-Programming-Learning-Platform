import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Flame, Zap, Shield, Target } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import api from '@/utils/api';

interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  xp: number;
  streak: number;
  badges: number;
}

const fallbackMock: LeaderboardEntry[] = [
  { rank: 1, username: 'AlgoMaster', level: 42, xp: 125000, streak: 45, badges: 28 },
  { rank: 2, username: 'CodeNinja', level: 38, xp: 98500, streak: 32, badges: 24 },
  { rank: 3, username: 'ByteWarrior', level: 35, xp: 87200, streak: 28, badges: 22 },
  { rank: 4, username: 'DataDragon', level: 32, xp: 76800, streak: 21, badges: 19 },
  { rank: 5, username: 'StackSorcerer', level: 29, xp: 65400, streak: 18, badges: 17 },
  { rank: 6, username: 'RecursiveRider', level: 27, xp: 58900, streak: 15, badges: 15 },
  { rank: 7, username: 'BinaryBoss', level: 25, xp: 52100, streak: 12, badges: 14 },
  { rank: 8, username: 'HeapHero', level: 23, xp: 46500, streak: 10, badges: 12 },
  { rank: 9, username: 'QueueQueen', level: 21, xp: 41200, streak: 8, badges: 11 },
  { rank: 10, username: 'TreeTitan', level: 19, xp: 36800, streak: 7, badges: 10 },
];

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(fallbackMock);
  const [userRank, setUserRank] = useState(6);
  const [userXp, setUserXp] = useState(130);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/gamification/leaderboard');
        const realData = res.data.leaderboard || [];
        const padded = [...realData];
        
        if (padded.length < 10) {
          const needed = 10 - padded.length;
          for (let i = 0; i < needed; i++) {
            const mockEntry = fallbackMock[padded.length];
            if (mockEntry) {
              padded.push({
                ...mockEntry,
                rank: padded.length + 1,
                xp: Math.max(0, Math.min(mockEntry.xp, padded[padded.length - 1] ? padded[padded.length - 1].xp - 1200 : mockEntry.xp))
              });
            }
          }
        }
        
        setLeaderboard(padded);
        if (res.data.userRank) setUserRank(res.data.userRank);
        if (res.data.userXp !== undefined) setUserXp(res.data.userXp);
      } catch (err) {
        console.error("Failed to load leaderboard data:", err);
      }
    };
    
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar isLoggedIn />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto relative z-10 space-y-6">
        
        {/* Compact Header & User Status Capsule */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card/70 border border-border/50 p-5 rounded-3xl backdrop-blur-xl shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-cq-gold/10 border border-cq-gold/30 text-cq-gold shrink-0">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-black italic uppercase tracking-tight">
                Hall of <span className="text-cq-gold">Heroes</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium">
                Top performing developers and algorithmic navigators across CodeGalaxy.
              </p>
            </div>
          </div>

          {/* User Rank & Telemetry Summary Pill */}
          <div className="flex items-center justify-between md:justify-end gap-5 bg-background/60 border border-border/40 px-5 py-2.5 rounded-2xl shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Your Rank:</span>
              <span className="font-display font-black text-xl text-primary">#{userRank}</span>
            </div>
            <div className="w-px h-5 bg-border/60" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cq-gold fill-cq-gold" />
              <span className="font-mono font-bold text-sm text-foreground">{userXp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Compact Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-2 md:order-1 bg-card/60 border border-border/40 rounded-2xl p-4 text-center shadow-md hover:border-gray-400/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 text-black font-black text-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-foreground truncate">{leaderboard[1]?.username || 'Syncing...'}</h3>
            <p className="text-xs font-mono font-bold text-primary mt-0.5">{(leaderboard[1]?.xp || 0).toLocaleString()} XP</p>
            <span className="text-[9px] font-mono uppercase text-muted-foreground mt-2 block">Lvl {leaderboard[1]?.level || 1} • {leaderboard[1]?.streak || 0}D Streak</span>
          </motion.div>

          {/* 1st Place Apex */}
          <motion.div
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            className="order-1 md:order-2 bg-cq-gold/10 border border-cq-gold/40 rounded-2xl p-5 text-center shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cq-gold via-amber-400 to-cq-gold" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cq-gold to-amber-500 text-black font-black text-xl flex items-center justify-center mx-auto mb-2 shadow-md relative">
              1
              <Star className="w-4 h-4 text-cq-gold fill-cq-gold absolute -top-1.5 -right-1.5 drop-shadow" />
            </div>
            <h3 className="font-display font-black text-base text-foreground italic uppercase tracking-tight truncate">{leaderboard[0]?.username || 'Syncing...'}</h3>
            <p className="text-sm font-mono font-black text-cq-gold mt-0.5">{(leaderboard[0]?.xp || 0).toLocaleString()} XP</p>
            <span className="text-[10px] font-mono font-bold uppercase text-cq-gold/80 mt-2 block">Grand Oracle • Lvl {leaderboard[0]?.level || 1}</span>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-3 md:order-3 bg-card/60 border border-border/40 rounded-2xl p-4 text-center shadow-md hover:border-amber-600/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black text-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-foreground truncate">{leaderboard[2]?.username || 'Syncing...'}</h3>
            <p className="text-xs font-mono font-bold text-amber-400 mt-0.5">{(leaderboard[2]?.xp || 0).toLocaleString()} XP</p>
            <span className="text-[9px] font-mono uppercase text-muted-foreground mt-2 block">Lvl {leaderboard[2]?.level || 1} • {leaderboard[2]?.streak || 0}D Streak</span>
          </motion.div>
        </div>

        {/* Compact Ranking Table */}
        <div className="bg-card/70 border border-border/50 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
          <div className="grid grid-cols-12 gap-3 px-6 py-3.5 border-b border-border/40 bg-muted/30 text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider">
            <div className="col-span-2 sm:col-span-1">Rank</div>
            <div className="col-span-6 sm:col-span-5">Navigator</div>
            <div className="col-span-2 text-center">Level</div>
            <div className="col-span-2 text-right">XP Points</div>
          </div>

          <div className="divide-y divide-border/30">
            {leaderboard.map((entry) => (
              <div
                key={`${entry.rank}-${entry.username}`}
                className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center hover:bg-muted/30 transition-colors text-xs"
              >
                <div className="col-span-2 sm:col-span-1 font-mono font-bold">
                  <span className={entry.rank <= 3 ? 'text-cq-gold font-black' : 'text-muted-foreground'}>
                    #{entry.rank.toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                    {entry.username[0] || '?'}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-foreground block truncate">{entry.username}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{entry.badges} Badges • {entry.streak}D Streak</span>
                  </div>
                </div>
                <div className="col-span-2 text-center font-mono font-bold text-muted-foreground">
                  Lvl {entry.level}
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-primary">
                  {entry.xp.toLocaleString()} XP
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Leaderboard;
