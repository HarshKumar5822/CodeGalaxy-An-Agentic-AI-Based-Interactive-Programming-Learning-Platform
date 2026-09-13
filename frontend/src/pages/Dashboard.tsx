import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const formatTimeAgo = (date: Date) => {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (isNaN(diffSec) || diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};
import {
  TrendingUp,
  Flame,
  Award,
  ChevronRight,
  Zap,
  BookOpen,
  Clock,
  Code,
  Users,
  ExternalLink,
  Target,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle2,
  Brain,
  History
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from '@/utils/api';

const getUser = () => {
  try {
    const raw = localStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};
import Navbar from '@/components/layout/Navbar';
import XPBar from '@/components/gamification/XPBar';
import Badge from '@/components/gamification/Badge';
import StreakCounter from '@/components/gamification/StreakCounter';
import ChallengeCard from '@/components/challenge/ChallengeCard';
import { useGamification } from '@/contexts/GamificationContext';
import { Button } from '@/components/ui/button';
import { mockUser, mockChallenges, mockLinkedInProfiles } from '@/data/mockData';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const Dashboard = () => {
  const [language, setLanguage] = useState("javascript");
  const [challenges, setChallenges] = useState<any[]>(mockChallenges);
  const [userStats, setUserStats] = useState<any>(mockUser);
  const { stats } = useGamification();
  const navigate = useNavigate();
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  const techStacks = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'cpp', label: 'C++' },
    { id: 'csharp', label: 'C#' },
    { id: 'go', label: 'Go' },
    { id: 'ruby', label: 'Ruby' },
    { id: 'swift', label: 'Swift' },
    { id: 'php', label: 'PHP' },
    { id: 'rust', label: 'Rust' },
  ];

  useEffect(() => {
    const savedFocus = localStorage.getItem('userFocusLanguage') || 'javascript';
    setLanguage(savedFocus);
    
    const fetchData = async () => {
      try {
        const [challengesRes, statsRes] = await Promise.all([
          api.get('/challenges'),
          api.get('/gamification/progress')
        ]);
        setChallenges(challengesRes.data);
        setUserStats(statsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setUserStats(mockUser);
      }
    };
    fetchData();
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('userFocusLanguage', newLanguage);
  };

  const handleDownloadReport = () => {
    const reportContent = `
=== CodeGalaxy Mission Report ===
User: ${getUser().name || 'Explorer'}
Level: ${stats?.level || 1}
Total XP: ${stats?.xp || 0}
Streak: ${stats?.streak || 0} Days
Focus: ${language.toUpperCase()}

--- Skill Breakdown ---
Logic: ${userStats?.skillLevels?.logic || 80}%
Syntax: ${userStats?.skillLevels?.syntax || 65}%
Algorithms: ${userStats?.skillLevels?.algorithms || 90}%
Debugging: ${userStats?.skillLevels?.debugging || 45}%
Clean Code: ${userStats?.skillLevels?.cleanCode || 70}%

--- Recent Achievements ---
${(stats?.badges || []).map(b => `- ${b?.name || 'Badge'}: ${b?.description || ''}`).join('\n')}

Generated on: ${new Date().toLocaleString()}
==================================
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CodeGalaxy_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSkip = () => {
    setCurrentChallengeIndex((prev) => (prev + 1) % displayChallenges.length);
  };

  const handleStartFix = (moduleId: string) => {
    const challenge = challenges.find(c => c.id === moduleId || c._id === moduleId);
    if (challenge) {
        navigate(`/challenge/${challenge._id || challenge.id}`);
    } else {
        navigate('/challenges');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const [activeMetrics, setActiveMetrics] = useState({
    xp: true,
    challenges: true,
    progress: true,
  });

  const displayChallenges = challenges.length > 0 ? challenges : mockChallenges;
  const recommendedChallenge = displayChallenges[currentChallengeIndex] || displayChallenges[0];

  // Dynamic Weekly Multi-Metric Analytics Data (XP, Challenges, Skill Mastery Progress)
  const realXpHistoryData = useMemo(() => {
    const totalXp = stats?.xp ?? userStats?.totalXP ?? 100;
    const completedList = userStats?.completedChallenges || [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const dayXpMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayChallengeMap: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    let hasRealData = false;
    if (Array.isArray(completedList) && completedList.length > 0) {
      completedList.forEach((item: any) => {
        if (item.completedAt) {
          const d = new Date(item.completedAt);
          const dayName = days[(d.getDay() + 6) % 7];
          dayXpMap[dayName] = (dayXpMap[dayName] || 0) + (item.challenge?.xp || 50);
          dayChallengeMap[dayName] = (dayChallengeMap[dayName] || 0) + 1;
          hasRealData = true;
        }
      });
    }

    if (!hasRealData) {
      // Create organic progression curve that sums EXACTLY to totalXp
      const weights = [0.08, 0.10, 0.14, 0.16, 0.20, 0.16, 0.16];
      let runningXpSum = 0;

      const totalSolvedCount = completedList.length > 0 ? completedList.length : Math.max(1, Math.round(totalXp / 50));
      const challengeWeights = [0.1, 0.25, 0.45, 0.6, 0.75, 0.9, 1.0];

      return days.map((day, idx) => {
        let dailyXp = Math.round(totalXp * weights[idx]);
        if (idx === days.length - 1) {
          dailyXp = Math.max(5, totalXp - runningXpSum);
        }
        runningXpSum += dailyXp;

        const cumChallenges = Math.round(totalSolvedCount * challengeWeights[idx]);
        const dailyChallenges = idx === 0 ? cumChallenges : Math.max(0, cumChallenges - Math.round(totalSolvedCount * challengeWeights[idx - 1]));
        const progressPct = Math.min(100, Math.round((runningXpSum / Math.max(totalXp, 100)) * 100));

        return {
          day,
          xp: dailyXp,
          totalXp: runningXpSum,
          challenges: cumChallenges,
          dailyChallenges,
          progress: progressPct
        };
      });
    }

    let runningXpSum = 0;
    let runningChallenges = 0;

    return days.map((day) => {
      const dailyXp = dayXpMap[day] || 0;
      const dailyChal = dayChallengeMap[day] || 0;
      runningXpSum += dailyXp;
      runningChallenges += dailyChal;

      const progressPct = Math.min(100, Math.round((runningXpSum / Math.max(totalXp, 100)) * 100));

      return {
        day,
        xp: dailyXp,
        totalXp: runningXpSum,
        challenges: runningChallenges,
        dailyChallenges: dailyChal,
        progress: progressPct
      };
    });
  }, [userStats, stats]);

  // Dynamic Knowledge Core Distribution Data (Pie Chart)
  const realProgressData = useMemo(() => {
    const focus = (language || 'javascript').toLowerCase();
    let pyCount = 0, jsCount = 0, dsaCount = 0, algoCount = 0, backendCount = 0;
    
    if (userStats?.completedChallenges && Array.isArray(userStats.completedChallenges)) {
      userStats.completedChallenges.forEach((item: any) => {
        const title = (item.challenge?.title || item.title || '').toLowerCase();
        const cat = (item.challenge?.category || '').toLowerCase();

        if (title.includes('python') || cat.includes('python')) pyCount++;
        else if (title.includes('js') || title.includes('javascript') || cat.includes('js')) jsCount++;
        else if (title.includes('tree') || title.includes('list') || title.includes('stack') || cat.includes('data')) dsaCount++;
        else if (title.includes('sort') || title.includes('search') || cat.includes('algo')) algoCount++;
        else backendCount++;
      });
    }

    const totalCompleted = pyCount + jsCount + dsaCount + algoCount + backendCount;
    if (totalCompleted === 0) {
      return [
        { name: focus.toUpperCase(), value: 45 },
        { name: 'Data Structures', value: 25 },
        { name: 'Algorithms', value: 15 },
        { name: 'System Design', value: 15 },
      ];
    }

    return [
      { name: 'JavaScript', value: jsCount || 10 },
      { name: 'Python', value: pyCount || 10 },
      { name: 'Data Structures', value: dsaCount || 15 },
      { name: 'Algorithms', value: algoCount || 10 },
      { name: 'Backend', value: backendCount || 5 },
    ].filter(item => item.value > 0);
  }, [userStats, language]);

  // Dynamic Skill Gap Analysis
  const realSkillGaps = useMemo(() => {
    const skills = userStats?.skillLevels || {};
    const logicScore = skills.logic || 65;
    const syntaxScore = skills.syntax || 70;
    const algoScore = skills.algorithms || 55;

    return [
      { skill: 'Problem Solving Logic', current: logicScore, target: 95, color: 'text-[#00ff88]', moduleId: 'logic-1' },
      { skill: 'Syntax Mastery', current: syntaxScore, target: 85, color: 'text-amber-400', moduleId: 'syntax-1' },
      { skill: 'Algorithmic Efficiency', current: algoScore, target: 90, color: 'text-rose-400', moduleId: 'algo-1' },
    ];
  }, [userStats]);

  // Dynamic Overall Completion Percentage & Weekly Growth
  const overallCompletion = useMemo(() => {
    const completedCount = stats?.completedChallenges?.length || userStats?.completedChallenges?.length || 0;
    const totalAvailable = Math.max(1, challenges.length || 15);
    return Math.min(100, Math.max(12, Math.round((completedCount / totalAvailable) * 100)));
  }, [stats, userStats, challenges]);

  const weeklyGrowth = useMemo(() => {
    const totalXP = userStats?.totalXP || stats?.xp || 0;
    return Math.min(100, Math.max(15, Math.round((totalXP / 300) * 12)));
  }, [userStats, stats]);

  // Real dynamic user activity tracking telemetry
  const realRecentActivity = useMemo(() => {
    if (!userStats) return [];
    const list: Array<{ type: 'challenge' | 'badge' | 'level'; title: string; time: string; xp: string; rawTime: number }> = [];

    // 1. Process Completed Challenges from backend userStats
    const completed = userStats.completedChallenges || [];
    completed.forEach((c: any) => {
      const title = typeof c === 'string' ? c : (c?.challenge?.title || c?.title || 'Code Challenge');
      const date = (c && c.completedAt) ? new Date(c.completedAt) : new Date();
      const xpVal = (c && c.challenge?.xp) || 50;
      list.push({
        type: 'challenge',
        title,
        time: formatTimeAgo(date),
        xp: `+${xpVal} XP`,
        rawTime: isNaN(date.getTime()) ? Date.now() : date.getTime()
      });
    });

    // 2. Process Unlocked Badges
    const earnedBadges = (userStats.badges || []).filter((b: any) => b.isEarned);
    earnedBadges.forEach((b: any) => {
      list.push({
        type: 'badge',
        title: b.name || 'Badge Unlocked',
        time: 'Unlocked',
        xp: 'Badge Earned',
        rawTime: Date.now() - 1000
      });
    });

    // 3. Process Active Level Milestone
    const activeLevel = userStats.level || stats?.level || 1;
    const totalXpVal = userStats.totalXP || stats?.xp || 0;
    list.push({
      type: 'level',
      title: `Reached Level ${activeLevel}`,
      time: 'Current Tier',
      xp: `${totalXpVal.toLocaleString()} XP`,
      rawTime: Date.now()
    });

    // Sort by most recent
    list.sort((a, b) => b.rawTime - a.rawTime);
    return list;
  }, [userStats, stats]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isLoggedIn onLogout={handleLogout} />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-2">
                Mission <span className="text-primary italic">Control</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Welcome back, <span className="text-foreground dark:text-white font-semibold">{getUser().name || 'Explorer'}</span>. Systems are nominal.
              </p>
            </motion.div>

            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-3 bg-card border border-border/40 p-2.5 rounded-2xl backdrop-blur-xl">
                 <Target className="w-5 h-5 text-primary" />
                 <span className="text-sm font-medium text-muted-foreground">Focus:</span>
                 <Select value={language} onValueChange={handleLanguageChange}>
                   <SelectTrigger className="w-[140px] bg-transparent border-none focus:ring-0 text-foreground dark:text-white font-bold h-8">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="bg-card border-border text-foreground">
                     {techStacks.map(stack => (
                       <SelectItem key={stack.id} value={stack.id}>{stack.label}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <Button 
                variant="outline" 
                onClick={handleDownloadReport}
                className="rounded-2xl border-border/40 bg-secondary/30 text-foreground hover:bg-secondary/50 gap-2 h-12 px-6"
               >
                 <Activity className="w-4 h-4" />
                 Download Report
               </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total XP', value: (stats?.xp || 0).toLocaleString(), icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { label: 'Current Level', value: `Level ${stats?.level || 1}`, icon: Award, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Daily Streak', value: `${stats?.streak || 0} Days`, icon: Flame, color: 'text-rose-500', bg: 'bg-rose-500/10' },
              { label: 'Completed', value: stats?.completedChallenges?.length || 0, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-card border border-border/40 backdrop-blur-sm group hover:border-primary/30 transition-all cursor-default"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Multi-Vector XP & Performance Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-2 p-6 md:p-8 rounded-[2.5rem] glass-panel"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/40">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <BarChart3 className="w-5 h-5 text-cq-cyan" />
                    Multi-Vector Performance Matrix
                  </h3>
                  <p className="text-muted-foreground text-xs mt-0.5 font-medium">Dynamic tracking of XP momentum, solved challenges & mastery curve</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveMetrics(prev => ({ ...prev, xp: !prev.xp }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      activeMetrics.xp
                        ? 'bg-cq-cyan/20 border-cq-cyan text-cq-cyan shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                        : 'bg-card/40 border-border/40 text-muted-foreground opacity-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cq-cyan animate-pulse" />
                    ⚡ XP Velocity
                  </button>

                  <button
                    onClick={() => setActiveMetrics(prev => ({ ...prev, challenges: !prev.challenges }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      activeMetrics.challenges
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
                        : 'bg-card/40 border-border/40 text-muted-foreground opacity-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    🎯 Challenges Solved
                  </button>

                  <button
                    onClick={() => setActiveMetrics(prev => ({ ...prev, progress: !prev.progress }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      activeMetrics.progress
                        ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                        : 'bg-card/40 border-border/40 text-muted-foreground opacity-50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    📈 Mastery (%)
                  </button>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realXpHistoryData}>
                    <defs>
                      <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorChallenges" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'currentColor', fontSize: 12 }} 
                      className="text-muted-foreground font-mono"
                      dy={10}
                    />
                    <YAxis 
                      yAxisId="left"
                      hide 
                      domain={[0, 'dataMax + 20']}
                    />
                    <YAxis 
                      yAxisId="challengesAxis"
                      hide 
                      domain={[0, 'dataMax + 0.5']}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      hide 
                      domain={[0, 100]}
                    />

                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0]?.payload || {};
                          return (
                            <div className="bg-[#090a0f]/95 border border-cq-cyan/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl font-mono text-xs space-y-2.5 min-w-[230px]">
                              <div className="text-white font-bold pb-2 border-b border-white/10 flex items-center justify-between">
                                <span className="text-cq-cyan tracking-wider">{label} Telemetry</span>
                                <span className="text-[9px] text-muted-foreground uppercase font-black">Live Data</span>
                              </div>
                              <div className="space-y-2 pt-0.5">
                                {activeMetrics.xp && (
                                  <div className="flex items-center justify-between gap-3 font-sans text-xs">
                                    <span className="flex items-center gap-2 font-bold text-cq-cyan">
                                      <span className="w-2 h-2 rounded-full bg-cq-cyan shadow-[0_0_8px_#22d3ee]" />
                                      XP Velocity
                                    </span>
                                    <span className="font-mono font-black text-white">
                                      +{item.xp} XP <span className="text-[10px] text-muted-foreground">({item.totalXp} Total)</span>
                                    </span>
                                  </div>
                                )}
                                {activeMetrics.challenges && (
                                  <div className="flex items-center justify-between gap-3 font-sans text-xs">
                                    <span className="flex items-center gap-2 font-bold text-emerald-400">
                                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                                      Challenges Solved
                                    </span>
                                    <span className="font-mono font-black text-white">
                                      {item.challenges} Solved
                                    </span>
                                  </div>
                                )}
                                {activeMetrics.progress && (
                                  <div className="flex items-center justify-between gap-3 font-sans text-xs">
                                    <span className="flex items-center gap-2 font-bold text-amber-400">
                                      <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                                      Skill Mastery
                                    </span>
                                    <span className="font-mono font-black text-white">
                                      {item.progress}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }} 
                    />

                    {activeMetrics.xp && (
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="xp" 
                        name="XP Velocity"
                        stroke="#22d3ee" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorXP)" 
                      />
                    )}

                    {activeMetrics.challenges && (
                      <Area 
                        yAxisId="challengesAxis"
                        type="monotone" 
                        dataKey="challenges" 
                        name="Challenges Solved"
                        stroke="#34d399" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorChallenges)" 
                      />
                    )}

                    {activeMetrics.progress && (
                      <Area 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="progress" 
                        name="Mastery Progress"
                        stroke="#fbbf24" 
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        fillOpacity={1} 
                        fill="url(#colorProgress)" 
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Knowledge Distribution */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-[2.5rem] glass-panel flex flex-col"
            >
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Knowledge Core
              </h3>
              <p className="text-muted-foreground text-sm mb-6">Course distribution analysis</p>
              
              <div className="flex-1 min-h-[250px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={realProgressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {realProgressData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(5, 5, 5, 0.95)', 
                        border: '1px solid rgba(139, 92, 246, 0.5)', 
                        borderRadius: '16px', 
                        backdropBlur: '12px',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      labelStyle={{ color: '#fff', marginBottom: '4px', opacity: 0.7 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-2xl font-bold">{overallCompletion}%</div>
                  <div className="text-[10px] text-muted-foreground uppercase font-black">Overall</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {realProgressData.slice(0, 4).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                    <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            {/* Skill Radar */}
            <motion.div 
               className="lg:col-span-1 p-8 rounded-[2.5rem] glass-panel"
            >
              <h3 className="text-lg font-bold mb-6">Expertise Profile</h3>
              <div className="h-[250px] -ml-4 -mr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                    { subject: 'Logic', A: userStats.skillLevels?.logic || 80, B: 100 },
                    { subject: 'Syntax', A: userStats.skillLevels?.syntax || 65, B: 100 },
                    { subject: 'Algo', A: userStats.skillLevels?.algorithms || 90, B: 100 },
                    { subject: 'Debug', A: userStats.skillLevels?.debugging || 45, B: 100 },
                    { subject: 'Clean', A: userStats.skillLevels?.cleanCode || 70, B: 100 },
                  ]}>
                    <PolarGrid stroke="rgba(156,163,175,0.25)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10 }} className="text-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(5, 5, 5, 0.95)', 
                        border: '1px solid rgba(139, 92, 246, 0.5)', 
                        borderRadius: '16px', 
                        backdropBlur: '12px',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#8B5CF6', fontWeight: 'bold' }}
                      labelStyle={{ color: '#fff', marginBottom: '4px', opacity: 0.7 }}
                    />
                    <Radar
                      name="Current"
                      dataKey="A"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.6}
                      activeDot={{ r: 6 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Gap Analysis */}
            <motion.div 
               className="lg:col-span-2 p-8 rounded-[2.5rem] glass-panel"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    Gap Analysis
                  </h3>
                  <p className="text-muted-foreground text-sm">Where you need more focus</p>
                </div>
              </div>

              <div className="space-y-6">
                {realSkillGaps.map((gap) => (
                  <div key={gap.skill} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{gap.skill}</span>
                      <span className="text-muted-foreground">{gap.current}% / {gap.target}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(gap.current / gap.target) * 100}%` }}
                        className={`h-full bg-gradient-to-r from-primary to-primary/40`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">Recommended Fix</div>
                  <div className="text-xs text-muted-foreground">Complete "Advanced Async Patterns" to boost Logic & Debugging scores.</div>
                </div>
                <Button size="sm" onClick={() => handleStartFix('js-async-1')} className="rounded-xl">Start</Button>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
               className="lg:col-span-1 p-8 rounded-[2.5rem] glass-panel"
            >
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                Recent Intel
              </h3>
              <div className="space-y-6">
                {realRecentActivity.length > 0 ? (
                  realRecentActivity.slice(0, 5).map((act, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== Math.min(realRecentActivity.length, 5) - 1 && (
                        <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-border"></div>
                      )}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 z-10 ${
                        act.type === 'challenge' ? 'bg-primary/20 text-primary' : 
                        act.type === 'badge' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-emerald-400/20 text-emerald-400'
                      }`}>
                        {act.type === 'challenge' ? <Code className="w-3 h-3" /> : 
                         act.type === 'badge' ? <Award className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground leading-none mb-1">{act.title}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-black mb-1">{act.time}</div>
                        <div className="text-[10px] font-bold text-primary">{act.xp}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-muted-foreground">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-bold text-foreground">No recent telemetry recorded</p>
                    <p className="text-[10px] mt-1">Complete challenges to track real-time activity here!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Continue Mission */}
             <motion.div 
              className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2">Continue Mission</h3>
                <p className="text-muted-foreground mb-6">Objective: {recommendedChallenge?.title || 'Next Milestone'}</p>
                <div className="flex items-center gap-4">
                  <Link to={recommendedChallenge ? `/challenge/${recommendedChallenge._id || recommendedChallenge.id}` : '/challenges'}>
                    <Button variant="hero" className="rounded-2xl px-8 h-12 gap-2 shadow-lg shadow-primary/20">
                      Engage <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={handleSkip} className="rounded-2xl h-12 text-muted-foreground">Skip</Button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <Code className="w-48 h-48 rotate-12" />
              </div>
            </motion.div>

             {/* LinkedIn Connections Card */}
             <motion.div 
               className="p-8 rounded-[2.5rem] glass-panel"
             >
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h3 className="text-xl font-bold">LinkedIn Connections</h3>
                   <p className="text-muted-foreground text-sm">Developers matching your skills</p>
                 </div>
                 <div className="flex -space-x-4">
                   {mockLinkedInProfiles.slice(0, 4).map((p, i) => (
                     <img key={i} src={p.imageUrl} className="w-10 h-10 rounded-full border-4 border-background" />
                   ))}
                 </div>
               </div>
               <Link to="/experts">
                 <Button variant="outline" className="w-full rounded-2xl border-border/40 bg-secondary/30 text-foreground hover:bg-secondary/50 h-12">
                   Expand Connections
                 </Button>
               </Link>
             </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
