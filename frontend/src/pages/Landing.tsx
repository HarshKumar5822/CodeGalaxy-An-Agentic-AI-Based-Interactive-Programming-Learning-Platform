import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  Zap,
  Trophy,
  BookOpen,
  Users,
  ArrowRight,
  Sparkles,
  Target,
  Rocket,
  ChevronRight,
  Star,
  Cpu,
  Globe,
  LayoutDashboard
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import AuthModal from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const GALAXY_STARS = [
  // Arm 1 (green)
  ...[...Array(25)].map((_, i) => {
    const theta = (i / 25) * 2.5 * Math.PI;
    const r = (i / 25) * 105 + 15;
    const x = 160 + r * Math.cos(theta);
    const y = 160 + r * Math.sin(theta);
    const size = 1 + (i / 25) * 1.8;
    const opacity = 0.35 + (1 - i / 25) * 0.65;
    return { x, y, size, opacity, color: '#00ff88' };
  }),
  // Arm 2 (purple)
  ...[...Array(25)].map((_, i) => {
    const theta = (i / 25) * 2.5 * Math.PI + Math.PI;
    const r = (i / 25) * 105 + 15;
    const x = 160 + r * Math.cos(theta);
    const y = 160 + r * Math.sin(theta);
    const size = 1 + (i / 25) * 1.8;
    const opacity = 0.35 + (1 - i / 25) * 0.65;
    return { x, y, size, opacity, color: '#8b5cf6' };
  })
];

interface CodeLine {
  indent: number;
  content: React.ReactNode;
}

const BINARY_SEARCH_LINES: CodeLine[] = [
  { indent: 0, content: <span><span className="text-cq-cyan">const</span> search = (arr, target) =&gt; &#123;</span> },
  { indent: 1, content: <span><span className="text-cq-cyan">let</span> l = <span className="text-cq-gold">0</span>, h = arr.length - <span className="text-cq-gold">1</span>;</span> },
  { indent: 1, content: <span><span className="text-cq-purple">while</span> (l &lt;= h) &#123;</span> },
  { indent: 2, content: <span>const m = (l + h) &gt;&gt; <span className="text-cq-gold">1</span>;</span> },
  { indent: 2, content: <span><span className="text-cq-purple">if</span> (arr[m] === target) <span className="text-cq-red">return</span> m;</span> },
  { indent: 2, content: <span>arr[m] &lt; target ? l = m + <span className="text-cq-gold">1</span> : h = m - <span className="text-cq-gold">1</span>;</span> },
  { indent: 1, content: <span>&#125;</span> },
  { indent: 1, content: <span><span className="text-cq-red">return</span> -<span className="text-cq-gold">1</span>;</span> },
  { indent: 0, content: <span>&#125;;</span> },
];

const BINARY_SEARCH_STATES = [
  "idle - waiting",
  "init: l=0, h=9 (val=42)",
  "check m=4 (val=30) -> l=5",
  "check m=7 (val=48) -> h=6",
  "check m=5 (val=42) -> Found!",
  "done: index 5 returned"
];

const DFS_TRAVERSE_LINES: CodeLine[] = [
  { indent: 0, content: <span><span className="text-cq-purple">def</span> <span className="text-cq-gold">dfs</span>(graph, start, visited=<span className="text-cq-cyan">None</span>):</span> },
  { indent: 1, content: <span><span className="text-cq-purple">if</span> visited <span className="text-cq-cyan">is</span> <span className="text-cq-cyan">None</span>:</span> },
  { indent: 2, content: <span>visited = set()</span> },
  { indent: 1, content: <span>visited.add(start)</span> },
  { indent: 1, content: <span><span className="text-cq-purple">for</span> nxt <span className="text-cq-cyan">in</span> graph[start]:</span> },
  { indent: 2, content: <span><span className="text-cq-purple">if</span> nxt <span className="text-cq-cyan">not in</span> visited:</span> },
  { indent: 3, content: <span>dfs(graph, nxt, visited)</span> },
  { indent: 1, content: <span><span className="text-cq-red">return</span> visited</span> },
];

const DFS_TRAVERSE_STATES = [
  "idle - unvisited",
  "call: dfs(node_A)",
  "visit: node_A",
  "branch: check node_B",
  "call: dfs(node_B)",
  "visit: node_B",
  "done: visited set returned"
];

const GALAXY_ORBIT_LINES: CodeLine[] = [
  { indent: 0, content: <span><span className="text-cq-cyan">struct</span> <span className="text-cq-purple">Vector3</span> &#123; <span className="text-cq-cyan">float</span> x, y, z; &#125;;</span> },
  { indent: 0, content: <span><span className="text-cq-cyan">void</span> <span className="text-cq-gold">update</span>(<span className="text-cq-purple">Vector3</span>&amp; pos) &#123;</span> },
  { indent: 1, content: <span>pos.x += cos(angle) * radius;</span> },
  { indent: 1, content: <span>pos.y += sin(angle) * radius;</span> },
  { indent: 1, content: <span>angle += speed;</span> },
  { indent: 0, content: <span>&#125;</span> },
];

const GALAXY_ORBIT_STATES = [
  "system: active",
  "tick 1: theta=0.0 rad",
  "pos: x=10.00, y=0.00",
  "tick 2: theta=0.05 rad",
  "pos: x=9.98, y=0.50",
  "status: orbiting active"
];

interface InteractiveCodeCardProps {
  title: string;
  lines: CodeLine[];
  states: string[];
  accentColor: string;
  floatDirection: 'up' | 'down';
  delay: number;
}

const InteractiveCodeCard: React.FC<InteractiveCodeCardProps> = ({
  title,
  lines,
  states,
  accentColor,
  floatDirection,
  delay
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowStyle, setGlowStyle] = useState('0px 10px 30px rgba(0,0,0,0.4)');
  const [activeLine, setActiveLine] = useState(0);
  const [activeStateIdx, setActiveStateIdx] = useState(0);

  useEffect(() => {
    const lineInterval = setInterval(() => {
      setActiveLine(prev => (prev + 1) % lines.length);
    }, 1800);
    return () => clearInterval(lineInterval);
  }, [lines.length]);

  useEffect(() => {
    const stateInterval = setInterval(() => {
      setActiveStateIdx(prev => (prev + 1) % states.length);
    }, 2800);
    return () => clearInterval(stateInterval);
  }, [states.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const angleX = -(y - yc) / 8;
    const angleY = (x - xc) / 8;
    setRotateX(angleX);
    setRotateY(angleY);
    setGlowStyle(`0px 20px 40px ${accentColor}25, inset 0 0 10px ${accentColor}10`);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlowStyle('0px 10px 30px rgba(0,0,0,0.4)');
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="backdrop-blur-md bg-white/20 dark:bg-black/35 border border-gray-200/40 dark:border-white/10 rounded-2xl p-4 font-mono text-[9px] text-left w-68 pointer-events-auto hover:border-cq-green/50 transition-all duration-300 select-none cursor-pointer"
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        boxShadow: glowStyle,
        perspective: 1000
      }}
      animate={{ y: floatDirection === 'up' ? [-8, 8, -8] : [8, -8, 8] }}
      transition={{
        y: {
          duration: 6 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        }
      }}
    >
      <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-gray-200/20 dark:border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400/80" />
          <div className="w-2 h-2 rounded-full bg-yellow-400/80" />
          <div className="w-2 h-2 rounded-full bg-green-400/80" />
          <span className="ml-2 text-gray-500 dark:text-gray-400 text-[8px] font-black uppercase tracking-wider">{title}</span>
        </div>
        <span className="text-[7px] text-cq-green font-bold px-1.5 py-0.5 rounded bg-cq-green/10 uppercase tracking-widest">Active</span>
      </div>

      <div className="space-y-1 mb-3">
        {lines.map((line, idx) => (
          <div
            key={idx}
            style={{
              paddingLeft: `${line.indent * 8}px`,
              transform: activeLine === idx ? 'translateX(2px)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
            className={`flex items-center py-0.5 rounded relative ${activeLine === idx
                ? 'bg-white/5 dark:bg-white/5 font-semibold text-white'
                : 'text-gray-600 dark:text-gray-400'
              }`}
          >
            {activeLine === idx && (
              <span className="absolute left-0 w-0.5 h-full bg-cq-green" style={{ transform: 'translateX(-2px)' }} />
            )}
            {line.content}
          </div>
        ))}
      </div>

      <div className="mt-2.5 pt-2 border-t border-gray-200/10 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-[7.5px]">
          <span className="text-gray-500 font-bold uppercase">OUT:</span>
          <motion.span
            key={activeStateIdx}
            initial={{ opacity: 0, x: -3 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-cq-green font-semibold"
          >
            {states[activeStateIdx]}
          </motion.span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-cq-green animate-ping" />
      </div>
    </motion.div>
  );
};

const Landing = () => {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login',
  });
  const location = useLocation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo));
      } catch (e) {
        localStorage.removeItem('userInfo');
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === 'true') {
      setAuthModal({ isOpen: true, mode: 'login' });
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    toast.success('Logged out successfully');
  };

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Neural Pathfinding',
      description: 'AI-driven challenges that adapt to your logic patterns in real-time.',
      color: 'text-cq-cyan'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Holographic Simulation',
      description: 'Watch your data structures breathe through live orbital visualizations.',
      color: 'text-cq-purple'
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: 'Global Hegemony',
      description: 'Scale the leaderboard and earn high-fidelity badges in the CodeGalaxy network.',
      color: 'text-cq-gold'
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Tactical Archive',
      description: 'Step-by-step documentation detailing even the most complex algorithmic maneuvers.',
      color: 'text-primary'
    },
  ];

  const stats = [
    { value: '50+', label: 'Active Missions' },
    { value: '10K+', label: 'Navigators' },
    { value: '15+', label: 'Sectors' },
    { value: '4.9', label: 'Telemetry Rating' },
  ];

  return (
    <div className="w-full bg-background text-foreground selection:bg-primary/30 scroll-smooth overflow-x-hidden md:pl-[70px]">
      <Navbar
        isLoggedIn={!!userInfo}
        onLoginClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
        onSignupClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
        onLogout={handleLogout}
      />

      {/* Hero Section: The Galaxy Entrance */}
      <section className="relative pt-20 pb-10 md:pb-12 px-6 border-b border-border/30 bg-background text-foreground overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-grid opacity-0 dark:opacity-15 pointer-events-none z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] opacity-0 dark:opacity-35 pointer-events-none z-10" />

        {/* Left Side: Floating Code Snippets */}
        <div className="absolute left-[2%] xl:left-[4%] top-1/2 -translate-y-1/2 w-[300px] h-[420px] hidden lg:flex flex-col justify-between pointer-events-none select-none z-10 gap-3">
          <InteractiveCodeCard
            title="binary_search.js"
            lines={BINARY_SEARCH_LINES}
            states={BINARY_SEARCH_STATES}
            accentColor="#00ff88"
            floatDirection="up"
            delay={0}
          />
          <InteractiveCodeCard
            title="dfs_traverse.py"
            lines={DFS_TRAVERSE_LINES}
            states={DFS_TRAVERSE_STATES}
            accentColor="#8b5cf6"
            floatDirection="down"
            delay={1}
          />
          <InteractiveCodeCard
            title="galaxy_orbit.cpp"
            lines={GALAXY_ORBIT_LINES}
            states={GALAXY_ORBIT_STATES}
            accentColor="#00f0ff"
            floatDirection="up"
            delay={2}
          />
        </div>

        {/* Right Side: Twinkling Spiral Galaxy */}
        <div className="absolute right-[3%] xl:right-[6%] top-1/2 -translate-y-1/2 w-72 h-72 hidden lg:flex items-center justify-center pointer-events-none select-none z-10">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Outer Orbiting Accretion Disk */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-72 h-72 rounded-full border border-[#00ff88]/10 dark:border-white/5 border-dashed"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute w-56 h-56 rounded-full border border-purple-500/10 dark:border-white/5"
            />

            {/* Twinkling Spiral Galaxy SVG */}
            <motion.svg
              width="280"
              height="280"
              viewBox="0 0 320 320"
              className="absolute"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <defs>
                <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#00ff88" stopOpacity="0.8" />
                  <stop offset="35%" stopColor="#8b5cf6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Galaxy Core */}
              <circle cx="160" cy="160" r="32" fill="url(#coreGlow)" className="animate-pulse" />

              {/* Stars */}
              {GALAXY_STARS.map((star, idx) => (
                <motion.circle
                  key={idx}
                  cx={star.x}
                  cy={star.y}
                  r={star.size}
                  fill={star.color}
                  initial={{ opacity: star.opacity }}
                  animate={{ opacity: [star.opacity * 0.4, star.opacity * 1.3, star.opacity * 0.4] }}
                  transition={{ duration: 2.5 + (idx % 4) * 0.5, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </motion.svg>

            {/* Ambient Background Glow behind the Galaxy */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-44 h-44 bg-primary/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
            />
          </div>
        </div>

        <div className="relative z-20 max-w-xl mx-auto text-center">
          {/* Uplink Status Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card border border-border/50 mb-6 max-w-max mx-auto shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-cq-cyan animate-pulse" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Connecting to CodeGalaxy Network
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-display text-4xl md:text-5xl font-black mb-4 leading-[1.15] tracking-tight italic text-foreground"
          >
            MASTER <br />
            <span className="bg-gradient-to-r from-cq-cyan via-blue-600 dark:via-white to-cq-purple bg-clip-text text-transparent inline-block pr-4 drop-shadow-[0_2px_8px_rgba(139,92,246,0.25)] dark:drop-shadow-[0_2px_15px_rgba(34,211,238,0.4)]">
              ALGORITHMS
            </span>
            <br />
            IN ORBIT
          </motion.h1>

          {/* Descriptive Paragraph */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto text-sm md:text-base text-muted-foreground font-medium mb-8 leading-relaxed"
          >
            Welcome to the new era of learning. Navigate through coding challenges with high-fidelity visualizations and real-time feedback.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Button
              onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
              className="h-12 px-6 rounded-xl bg-black text-white hover:bg-black/80 border border-black dark:bg-black dark:text-white dark:hover:bg-black/80 dark:border-white/40 text-xs font-black uppercase tracking-widest transition-all group shadow-md"
            >
              <Rocket className="mr-2 h-4 w-4" />
              Get Started
            </Button>
            <Link to="/challenges">
              <Button className="h-12 px-6 rounded-xl bg-black text-white hover:bg-black/80 border border-black dark:bg-black dark:text-white dark:hover:bg-black/80 dark:border-white/40 text-xs font-black uppercase tracking-widest transition-all shadow-md">
                Explore Challenges
              </Button>
            </Link>
          </motion.div>

          {/* Stats Breakdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-4 gap-4 max-w-md mx-auto border-t border-border/40 pt-6"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-display text-xl md:text-2xl font-black text-foreground">
                  {stat.value}
                </div>
                <div className="text-[9px] text-muted-foreground font-mono uppercase font-bold tracking-wider mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Terminal View / Preview Section */}
      <section className="py-12 md:py-16 px-6 border-b border-border/30 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-1 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-border/30 shadow-xl"
          >
            {/* Fake Browser Headers */}
            <div className="h-10 border-b border-border/30 flex items-center px-5 gap-2 bg-card/80 rounded-t-3xl">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <div className="ml-4 flex items-center gap-2 text-[10px] text-muted-foreground font-mono tracking-widest">
                <Globe className="w-3.5 h-3.5 text-cq-cyan" /> NETWORK_STATUS: ONLINE // MISSION_CONTROL_UI
              </div>
            </div>

            <div className="bg-card border border-border/20 rounded-b-3xl overflow-hidden">
              {/* Visualizer Overlay Simulation */}
              <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-black mb-3 italic uppercase tracking-tight text-foreground">
                    Tactical <span className="text-cq-cyan leading-none">Feedback</span>
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    Every keystroke is analyzed against optimal neural patterns. Watch your code transform into a living orbital map of data flows and pointers.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Real-time heap visualization',
                      'Dynamic time complexity analysis',
                      'Autonomous memory tracking',
                      'Integrated AI logic mentoring'
                    ].map(text => (
                      <li key={text} className="flex items-center gap-3 text-xs md:text-sm font-bold text-foreground">
                        <div className="w-5 h-5 rounded-lg bg-cq-cyan/10 border border-cq-cyan/30 flex items-center justify-center shrink-0">
                          <Zap className="w-3 h-3 text-cq-cyan" />
                        </div>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-cq-cyan/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6 rounded-2xl bg-card border border-border/30 shadow-md">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/20">
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-cq-cyan italic">Live Telemetry</span>
                      <Cpu className="w-4 h-4 text-cq-cyan opacity-70" />
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Latency', val: '4ms', color: 'bg-cq-cyan' },
                        { label: 'Neural Match', val: '98%', color: 'bg-emerald-400' },
                        { label: 'Stability', val: 'Stable', color: 'bg-amber-400' }
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between mb-1.5 text-[10px] font-mono font-bold uppercase text-foreground/80">
                            <span>{item.label}</span>
                            <span>{item.val}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: '80%' }}
                              className={`h-full ${item.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-12 md:py-16 px-6 border-b border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-black mb-2 italic tracking-tight text-foreground">
              SYSTEM <span className="text-cq-cyan">CAPABILITIES</span>
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm max-w-xl mx-auto">
              Engineered for the elite. Over 500 tactical coding modules distributed across a unified skill network.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="mission-card group p-6 bg-card border-border/40 hover:border-cq-cyan/40 transition-all rounded-3xl"
              >
                <div className={`w-11 h-11 rounded-2xl bg-cq-cyan/10 border border-cq-cyan/20 flex items-center justify-center ${feature.color} mb-4 group-hover:scale-105 transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-display text-base font-bold mb-1.5 tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Tactical Call */}
      <section className="py-12 md:py-16 px-6 text-center">
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-cq-gold fill-cq-gold" />
            ))}
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-black mb-2 italic tracking-tight text-foreground">
            READY TO <span className="text-cq-cyan underline decoration-border underline-offset-4">ENGAGE?</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Join the leading algorithm platform and start your journey across the CodeGalaxy path.
          </p>
          <Button
            onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
            className="h-12 px-8 rounded-xl bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90 text-xs font-black uppercase tracking-widest shadow-md transition-all group overflow-hidden relative"
          >
            <span className="relative z-10">Create Account</span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border/40 bg-card/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cq-cyan flex items-center justify-center font-black italic text-xs text-black">CG</div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">CodeGalaxy</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono font-medium uppercase tracking-wider text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-widest">
            © 2024 CodeGalaxy // Tactical Edition
          </p>
        </div>
      </footer>

      {/* Auth Modal stays functional as before */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialMode={authModal.mode}
        onLoginSuccess={(user, isSignup) => {
          setUserInfo(user);
          if (isSignup) {
            navigate('/questionnaire');
          } else {
            navigate('/dashboard');
          }
        }}
      />
    </div>
  );
};

export default Landing;
