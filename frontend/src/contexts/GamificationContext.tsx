import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import ShieldAchievement from '@/components/CodeGalaxy/Gamification/ShieldAchievement';

interface UserStats {
  xp: number;
  level: number;
  badges: any[];
  streak: number;
  completedChallenges: any[];
}

interface GamificationContextType {
  stats: UserStats;
  refreshStats: () => Promise<void>;
  awardXp: (amount: number) => void;
  lastAwardedXp: number | null;
  triggerAchievement: (title: string, xp: number) => void;
  achievement: { isVisible: boolean; title: string; xp: number } | null;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<UserStats>({ xp: 0, level: 1, badges: [], streak: 0, completedChallenges: [] });
  const [lastAwardedXp, setLastAwardedXp] = useState<number | null>(null);
  const [achievement, setAchievement] = useState<{ isVisible: boolean; title: string; xp: number } | null>(null);

  const refreshStats = useCallback(async () => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) return;
      const userInfo = JSON.parse(userInfoStr);
      if (!userInfo?.token) return;

      const res = await api.get('/auth/me'); // Assuming auth/me returns xp and profile info
      if (res.data) {
        setStats({
          xp: res.data.totalXp || 0,
          level: res.data.level || 1,
          badges: res.data.unlockedBadges || [],
          streak: res.data.currentStreak || 0,
          completedChallenges: res.data.completedChallenges || []
        });
      }
    } catch (err) {
      console.error("Failed to refresh gamification stats", err);
    }
  }, []);

  const awardXp = useCallback((amount: number) => {
    setLastAwardedXp(amount);
    setStats(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
    // Clear after animation duration
    setTimeout(() => setLastAwardedXp(null), 3000);
  }, []);

  const triggerAchievement = useCallback((title: string, xp: number) => {
    setAchievement({ isVisible: true, title, xp });
    if (xp > 0) awardXp(xp);
  }, [awardXp]);

  const closeAchievement = useCallback(() => {
    setAchievement(prev => prev ? { ...prev, isVisible: false } : null);
  }, []);



  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <GamificationContext.Provider value={{ stats, refreshStats, awardXp, lastAwardedXp, triggerAchievement, achievement }}>
      {children}
      {achievement && (
        <ShieldAchievement 
           isVisible={achievement.isVisible} 
           onClose={closeAchievement} 
           title={achievement.title} 
           xpAwarded={achievement.xp} 
        />
      )}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
