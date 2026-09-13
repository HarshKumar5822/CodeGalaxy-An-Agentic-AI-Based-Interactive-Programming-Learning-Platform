import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter,
  MoreVertical,
  Activity,
  Cpu,
  Globe,
  LayoutDashboard,
  ShieldCheck,
  Target,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data for students
const mockStudents = [
  { id: 1, name: 'AlgoMaster', level: 42, xp: 125000, lastActive: '2 min ago', progress: 85, status: 'Online' },
  { id: 2, name: 'CodeNinja', level: 38, xp: 98500, lastActive: '15 min ago', progress: 72, status: 'Idle' },
  { id: 3, name: 'ByteWarrior', level: 35, xp: 87200, lastActive: '1 hour ago', progress: 68, status: 'Offline' },
  { id: 4, name: 'DataDragon', level: 32, xp: 76800, lastActive: '3 hours ago', progress: 55, status: 'Offline' },
  { id: 5, name: 'StackSorcerer', level: 29, xp: 65400, lastActive: '5 hours ago', progress: 48, status: 'Offline' },
];

const activityData = [
  { day: 'Mon', active: 42, completed: 28 },
  { day: 'Tue', active: 55, completed: 35 },
  { day: 'Wed', active: 48, completed: 30 },
  { day: 'Thu', active: 70, completed: 45 },
  { day: 'Fri', active: 62, completed: 40 },
  { day: 'Sat', active: 35, completed: 22 },
  { day: 'Sun', active: 40, completed: 25 },
];

const TeacherDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar isLoggedIn />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
               <ShieldCheck className="w-6 h-6 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Fleet Command Authority</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">
               Sector <span className="text-primary italic">Controller</span>
            </h1>
            <p className="text-white/40 font-medium">Monitoring 1,248 active entities across the CodeGalaxy network.</p>
          </motion.div>

          <div className="flex items-center gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Entity Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all font-mono text-xs w-64"
                />
             </div>
             <Link to="/ai-generator">
               <Button className="h-12 px-6 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  Deploy Quest
               </Button>
             </Link>
          </div>
        </div>

        {/* Tactical Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Entities', val: '1,248', icon: <Users />, color: 'text-cq-cyan' },
            { label: 'Network Pulse', val: '98.4%', icon: <Activity />, color: 'text-primary' },
            { label: 'Lessons Synced', val: '45', icon: <BookOpen />, color: 'text-cq-purple' },
            { label: 'Avg Mastery', val: '82%', icon: <TrendingUp />, color: 'text-cq-gold' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="mission-card border-white/5 group"
            >
              <div className="flex items-center justify-between mb-4">
                 <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                 </div>
                 <MoreVertical className="w-4 h-4 text-white/10" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
              <h3 className="font-display text-4xl font-black italic tracking-tighter leading-none group-hover:text-primary transition-colors">{stat.val}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Activity Analytics - Recharts */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 glass-panel p-8 rounded-[2.5rem]"
          >
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="font-display text-2xl font-black italic uppercase tracking-tighter leading-none mb-2">Network <span className="text-primary italic">Live Pulse</span></h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Active Entites vs Mission Completions</p>
               </div>
               <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-primary" /> <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-cq-purple" /> <span>Success</span>
                  </div>
               </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                  />
                  <Area type="monotone" dataKey="active" stroke="#00ff88" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                  <Area type="monotone" dataKey="completed" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorSuccess)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Logs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-[2.5rem] flex flex-col"
          >
             <h3 className="font-display text-2xl font-black italic uppercase tracking-tighter leading-none mb-10">Systems <span className="text-primary italic">Live Log</span></h3>
             <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                {[
                  { user: 'AlgoMaster', task: 'Binary Search Mastery', time: '2m ago', icon: <Zap className="w-3 h-3 text-cq-gold" /> },
                  { user: 'CodeNinja', task: 'Linked List Deployment', time: '12m ago', icon: <Target className="w-3 h-3 text-cq-cyan" /> },
                  { user: 'DataDragon', task: 'Dijkstra Telemetry', time: '1h ago', icon: <Cpu className="w-3 h-3 text-cq-purple" /> },
                  { user: 'StackSorcerer', task: 'Auth Protocol Fix', time: '3h ago', icon: <Activity className="w-3 h-3 text-primary" /> },
                  { user: 'ByteWarrior', task: 'Sector 5 Cleared', time: '5h ago', icon: <ShieldCheck className="w-3 h-3 text-cq-green" /> }
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                     <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">{log.icon}</div>
                     <div>
                        <p className="text-xs font-black text-white/70 group-hover:text-primary transition-colors italic uppercase leading-none mb-1">{log.user}</p>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-tight leading-none mb-1">{log.task}</p>
                        <p className="text-[9px] text-white/20 font-mono italic">{log.time}</p>
                     </div>
                  </div>
                ))}
             </div>
             <Button 
               variant="ghost" 
               onClick={() => setIsTelemetryOpen(true)}
               className="w-full mt-8 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
             >
                View All Telemetry
             </Button>
          </motion.div>
        </div>

        {/* Entity Roster */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[2.5rem] overflow-hidden"
        >
          <div className="px-6 sm:px-10 py-6 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <h3 className="font-display text-xl sm:text-2xl font-black italic uppercase tracking-tighter leading-none">Fleet <span className="text-primary italic">Entity Roster</span></h3>
             <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <Button variant="ghost" size="sm" className="rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest px-4 h-9 flex-1 sm:flex-none">Download Roster</Button>
                <div className="h-9 bg-white/5 border border-white/5 rounded-xl px-4 flex items-center text-[10px] font-black uppercase text-white/40 tracking-widest flex-1 sm:flex-none justify-center"><Filter className="w-3 h-3 mr-2" /> Latest First</div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0c0e12] border-b border-white/5 text-[10px] font-black uppercase tracking-[0.3em]">
                  <th className="px-10 py-5 text-white">Student Name</th>
                  <th className="px-8 py-5 text-center text-white">Status</th>
                  <th className="px-8 py-5 text-center text-white">Difficulty Level</th>
                  <th className="px-8 py-5 text-center text-white">Progress</th>
                  <th className="px-8 py-5 text-center text-white">Last Active</th>
                  <th className="px-10 py-5 text-right text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {mockStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-cq-purple/20 border border-white/5 flex items-center justify-center font-black group-hover:scale-110 transition-transform">{student.name[0]}</div>
                        <div>
                          <p className="font-bold text-base leading-none mb-1 group-hover:text-primary transition-colors">{student.name}</p>
                          <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">{student.xp.toLocaleString()} Mastered XP</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${student.status === 'Online' ? 'bg-cq-green/10 text-cq-green' : 'bg-white/5 text-white/20'}`}>
                          {student.status}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="font-display text-sm font-black italic text-cq-gold tracking-tighter">Lvl {student.level}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex items-center justify-center gap-4 max-w-[120px] mx-auto">
                          <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               whileInView={{ width: `${student.progress}%` }}
                               className="h-full bg-primary"
                             />
                          </div>
                          <span className="text-[10px] font-mono text-white/50">{student.progress}%</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <p className="text-[10px] text-white/30 font-black tracking-widest">{student.lastActive}</p>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <Button variant="ghost" size="sm" className="rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest hover:text-primary hover:border-primary/40 h-10 px-6">Access Profile</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      {/* Telemetry Logs Modal */}
      <Dialog open={isTelemetryOpen} onOpenChange={setIsTelemetryOpen}>
        <DialogContent className="glass-dark border-white/10 max-w-2xl text-white max-h-[80vh] overflow-hidden flex flex-col rounded-[2rem]">
          <DialogHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <Cpu className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Network Diagnostics</span>
            </div>
            <DialogTitle className="font-display text-2xl font-black italic uppercase tracking-tighter">
              All Fleet <span className="text-primary italic">Telemetry Logs</span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detailed list of live telemetry activity logs for all fleet entities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4 overflow-y-auto pr-2 scrollbar-thin flex-1 text-left">
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center text-xs font-mono mb-4">
              <div>
                <span className="text-white/40">GATEWAY_STATUS: </span>
                <span className="text-cq-green font-bold text-emerald-400">ONLINE</span>
              </div>
              <div>
                <span className="text-white/40">PING: </span>
                <span className="text-primary font-bold text-cyan-400">12ms</span>
              </div>
              <div>
                <span className="text-white/40">ACTIVE_TUNNELS: </span>
                <span className="text-cq-purple font-bold text-violet-400">42</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { user: 'AlgoMaster', task: 'Binary Search Mastery', time: '2m ago', status: 'SUCCESS', details: 'Completed in 148s (100% Neural Match)', icon: <Zap className="w-3.5 h-3.5 text-cq-gold text-amber-400" /> },
                { user: 'CodeNinja', task: 'Linked List Deployment', time: '12m ago', status: 'SUCCESS', details: 'Completed in 210s (92% Neural Match)', icon: <Target className="w-3.5 h-3.5 text-cq-cyan text-cyan-400" /> },
                { user: 'DataDragon', task: 'Dijkstra Telemetry', time: '1h ago', status: 'SUCCESS', details: 'Completed in 412s (85% Neural Match)', icon: <Cpu className="w-3.5 h-3.5 text-cq-purple text-violet-400" /> },
                { user: 'StackSorcerer', task: 'Auth Protocol Fix', time: '3h ago', status: 'WARNING', details: 'Compilation failed on line 42 (Retry initialized)', icon: <Activity className="w-3.5 h-3.5 text-primary text-emerald-400" /> },
                { user: 'ByteWarrior', task: 'Sector 5 Cleared', time: '5h ago', status: 'SUCCESS', details: 'Access granted. Integrity verified.', icon: <ShieldCheck className="w-3.5 h-3.5 text-cq-green text-emerald-400" /> },
                { user: 'QuantumCoder', task: 'Quantum Gate Array', time: '6h ago', status: 'SUCCESS', details: 'Completed in 89s (98% Accuracy)', icon: <Zap className="w-3.5 h-3.5 text-cq-gold text-amber-400" /> },
                { user: 'PixelPioneer', task: 'Rasterization Pipeline', time: '8h ago', status: 'WARNING', details: 'Shader buffer overrun detected at frame 1440', icon: <Activity className="w-3.5 h-3.5 text-primary text-emerald-400" /> },
                { user: 'LogicLancer', task: 'Red-Black Tree Balancing', time: '12h ago', status: 'SUCCESS', details: 'Tree rotation successful. Balance factor optimized.', icon: <ShieldCheck className="w-3.5 h-3.5 text-cq-green text-emerald-400" /> }
              ].map((log, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group">
                   <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">{log.icon}</div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                         <p className="text-xs font-black text-white/70 italic uppercase leading-none group-hover:text-primary transition-colors">{log.user}</p>
                         <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                           log.status === 'SUCCESS' ? 'bg-cq-green/10 text-cq-green' : 'bg-primary/10 text-primary'
                         }`}>
                           {log.status}
                         </span>
                      </div>
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-tight leading-none mb-1">{log.task}</p>
                      <p className="text-[10px] text-white/30 font-mono leading-relaxed mb-1">{log.details}</p>
                      <p className="text-[9px] text-white/20 font-mono italic">{log.time}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
