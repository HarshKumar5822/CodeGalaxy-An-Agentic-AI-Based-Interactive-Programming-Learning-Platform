import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Save, 
  LogOut,
  Cpu,
  Zap,
  Activity,
  Globe
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Settings = () => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile settings updated successfully.');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 scroll-smooth">
      <Navbar isLoggedIn />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
               <Cpu className="w-6 h-6 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">User Settings</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-2 leading-none">
               Account <span className="text-primary italic">Profile</span>
            </h1>
            <p className="text-white/40 font-medium tracking-wide">Configure your user profile details and settings.</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full glass-panel p-6 sm:p-10 rounded-[3rem] border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.02)]"
        >
          <div className="space-y-12">
            <div className="flex flex-col sm:flex-row items-center gap-8 pb-12 border-b border-white/5 text-center sm:text-left">
               <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-cq-purple/20 border-2 border-white/10 flex items-center justify-center font-black text-4xl shadow-xl transition-all duration-500 overflow-hidden">
                     <User className="w-12 h-12 text-primary opacity-50" />
                  </div>
               </div>
               <div>
                  <h3 className="font-display text-2xl font-black italic uppercase tracking-tighter mb-2">Entity Identity</h3>
                  <p className="text-xs text-white/30 font-black uppercase tracking-widest mb-6">Web Developer // CodeGalaxy Member</p>
                  <Button variant="ghost" size="sm" className="rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest px-6 h-9 hover:bg-white/5">Change Avatar</Button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {[
                 { label: 'Full Name', val: 'AlgoMaster', icon: <User className="w-4 h-4" /> },
                 { label: 'Email Address', val: 'master@codegalaxy.dev', icon: <Globe className="w-4 h-4" /> },
                 { label: 'GitHub Username', val: 'algo_master_v3', icon: <Activity className="w-4 h-4" /> },
                 { label: 'Preferred Language', val: 'Python Master', icon: <Zap className="w-4 h-4" /> }
               ].map(field => (
                 <div key={field.label}>
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-3 block">{field.label}</label>
                    <div className="relative group">
                       <input 
                         type="text" 
                         defaultValue={field.val}
                         className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-primary/40 focus:bg-white/10 transition-all font-mono text-sm group-hover:border-white/20"
                       />
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary transition-colors">
                          {field.icon}
                       </div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
               <Button 
                  variant="ghost" 
                  className="w-full sm:w-auto h-16 px-8 rounded-3xl border border-red-500/10 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 font-black uppercase tracking-widest text-xs gap-3 group transition-all"
               >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Terminate Session
               </Button>

               <Button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="w-full sm:w-auto h-16 px-12 rounded-[2rem] bg-primary text-black font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(var(--primary),0.2)] flex items-center justify-center gap-3"
               >
                  {isSaving ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isSaving ? 'Saving Changes...' : 'Save Settings'}
               </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 opacity-30 mt-20">
         <div className="text-center text-[10px] font-black uppercase tracking-[0.5em]">
            CodeGalaxy // User Settings
         </div>
      </footer>
    </div>
  );
};

export default Settings;
