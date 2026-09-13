import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Menu, X, User, LogIn, Settings, LayoutDashboard, LogOut, Users, Zap,
  Home, FileText, Map, Target, Sparkles, Trophy, GraduationCap, ChevronLeft, ChevronRight,
  PlaySquare, Award
} from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { ModeToggle } from "@/components/theme/ModeToggle";

interface NavbarProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
}

const Navbar = ({ onLoginClick, onSignupClick, onLogout, isLoggedIn = false }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const location = useLocation();
  const navigate = useNavigate();
  const { stats, lastAwardedXp } = useGamification();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  useEffect(() => {
    let sidebarWidth = '0px';
    if (isDesktop || isTablet) {
      sidebarWidth = '70px';
    } else {
      sidebarWidth = '0px';
    }
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);

    return () => {
      document.documentElement.style.setProperty('--sidebar-width', '0px');
    };
  }, [isDesktop, isTablet]);

  const userInfoStr = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
  let userInfo = null;
  if (userInfoStr) {
    try {
      userInfo = JSON.parse(userInfoStr);
    } catch (e) {
      console.error("Invalid userInfo JSON", e);
    }
  }
  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('userInfo');
      navigate('/');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Learning Path', path: '/learning-path', icon: Map },
    { name: 'Challenges', path: '/challenges', icon: Target },
    { name: 'AI Generator', path: '/ai-generator', icon: Sparkles },
    { name: 'DSA Visualizer', path: '/algorithm-visualizer', icon: PlaySquare },
    { name: 'Certificates', path: '/certificates', icon: Award },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Interview Prep', path: '/interview-prep', icon: GraduationCap },
  ];

  const renderTopRightHeaderControls = () => (
    <div className="flex items-center gap-3">
      {isLoggedIn && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 border border-primary/20 rounded-xl group cursor-default relative shrink-0 shadow-sm"
        >
          <Zap className="w-4 h-4 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="text-xs font-mono font-bold text-primary tracking-tighter">
            <XPCounter value={stats.xp} />
          </span>
          <AnimatePresence>
            {lastAwardedXp && (
              <motion.span
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -20, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -top-4 right-2 text-xs font-bold text-cq-gold"
              >
                +{lastAwardedXp} XP
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <ModeToggle />

      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="glass" size="sm" className="rounded-xl gap-2 h-9 px-4 font-bold border border-border/50 hover:border-primary/40 shadow-sm">
              <User className="h-4 w-4" />
              <span>{userInfo?.name || 'Profile'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass border-border/50 z-[100]">
            <DropdownMenuLabel>
              <span>My Account</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <Link to="/dashboard">
              <DropdownMenuItem className="cursor-pointer focus:bg-primary/20 focus:text-primary">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/settings">
              <DropdownMenuItem className="cursor-pointer focus:bg-primary/20 focus:text-primary">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer text-destructive focus:bg-destructive/20 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onLoginClick}>
            <LogIn className="h-4 w-4 mr-2" />
            Log In
          </Button>
          <Button variant="hero" size="sm" onClick={onSignupClick}>
            Get Started
          </Button>
        </div>
      )}
    </div>
  );

  const renderSidebarContent = (collapsed: boolean, onLinkClick?: () => void) => {
    return (
      <>
        {/* Top Section: Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start gap-3'} w-full shrink-0 py-2`}>
          <Link to="/" onClick={onLinkClick} className="flex items-center gap-3 group shrink-0 overflow-hidden">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-9 h-9 p-2 rounded-xl bg-gradient-to-br from-cq-cyan to-cq-purple shadow-sm shrink-0 flex items-center justify-center"
            >
              <Code2 className="h-4.5 w-4.5 text-cq-dark" />
            </motion.div>
            {!collapsed && (
              <span className="font-display text-xl font-black text-foreground group-hover:text-primary transition-all tracking-tight italic whitespace-nowrap">
                CodeGalaxy
              </span>
            )}
          </Link>
        </div>

        {/* Middle Section: Vertical Navigation Links */}
        <div className="flex-1 flex flex-col gap-1.5 w-full mt-6 overflow-y-auto scrollbar-none pr-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onLinkClick}
                title={collapsed ? link.name : undefined}
                className={`relative flex items-center ${collapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} text-xs xl:text-sm font-black uppercase tracking-wider transition-all rounded-xl hover:bg-muted/40 ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {Icon && <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
                {!collapsed && <span>{link.name}</span>}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="navbar-indicator-desktop"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-gradient-to-b from-cq-cyan to-cq-purple"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <>
      {/* Top Right Header Controls (Desktop & Tablet) - Only visible at top of page, hides on scroll */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: scrolled ? -70 : 0, 
          opacity: scrolled ? 0 : 1,
          scale: scrolled ? 0.95 : 1
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`hidden md:flex fixed top-4 right-6 z-40 items-center bg-background/80 backdrop-blur-xl border border-border/50 p-2 rounded-2xl shadow-xl ${
          scrolled ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      >
        {renderTopRightHeaderControls()}
      </motion.div>

      {/* Desktop / Tablet Vertical Sidebar with Hover Auto-Expand */}
      <motion.nav
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex fixed top-0 left-0 bottom-0 h-screen transition-all duration-300 z-50 sidebar-nav border-r ${
          isHovered 
            ? 'w-[280px] bg-background/95 backdrop-blur-2xl border-border/80 shadow-2xl p-4' 
            : 'w-[70px] bg-background/60 backdrop-blur-md border-border/50 p-3 shadow-lg'
        }`}
      >
        <div className="flex flex-col h-full justify-between w-full overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            {renderSidebarContent(!isHovered)}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Top Horizontal Header */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`md:hidden fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'bg-background/80 backdrop-blur-md border-b border-border/80 shadow-lg py-2' 
            : 'bg-background/30 backdrop-blur-sm border-b border-transparent py-4'
        }`}
      >
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-2.5 rounded-xl bg-gradient-to-br from-cq-cyan to-cq-purple shadow-sm"
              >
                <Code2 className="h-5.5 w-5.5 text-cq-dark" />
              </motion.div>
              <span className="font-display text-xl font-black text-foreground group-hover:text-primary transition-all tracking-tight italic">
                CodeGalaxy
              </span>
            </Link>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2">
              {renderTopRightHeaderControls()}
              <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/60 z-[90] md:hidden"
            />
            {/* Slide-in sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] h-screen bg-background border-r border-border/50 p-6 flex flex-col justify-between z-[100] shadow-2xl md:hidden"
            >
              <div className="flex flex-col h-full justify-between w-full overflow-hidden">
                <div className="flex flex-col flex-1 overflow-hidden">
                  {renderSidebarContent(false, () => setIsMobileOpen(false))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Micro-component: Rolling XP Counter ---
const XPCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 1000;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = (t: number) => t * (2 - t);
      const current = Math.floor(start + (end - start) * easeOutQuad(progress));
      
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }, [value]);

  return <>{displayValue} XP</>;
};

export default Navbar;
