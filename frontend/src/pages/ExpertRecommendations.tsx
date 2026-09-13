import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  ExternalLink, 
  ChevronLeft, 
  Search, 
  Globe, 
  Linkedin,
  Filter,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { mockLinkedInProfiles, LinkedInProfile } from '@/data/mockData';

const ExpertRecommendations = () => {
  const navigate = useNavigate();
  const [focusLanguage, setFocusLanguage] = useState<string>('javascript');
  const [filteredProfiles, setFilteredProfiles] = useState<LinkedInProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In a real app, we'd pull the focus from a global state or API
    // For this demo, we'll try to sync with the Dashboard's choice via localStorage if available
    const savedFocus = localStorage.getItem('userFocusLanguage') || 'javascript';
    setFocusLanguage(savedFocus);
  }, []);

  useEffect(() => {
    let result = mockLinkedInProfiles.filter(profile => 
      profile.techStack.toLowerCase() === focusLanguage.toLowerCase() ||
      profile.skills.some(skill => skill.toLowerCase().includes(focusLanguage.toLowerCase()))
    );

    if (searchQuery) {
      result = result.filter(profile => 
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Ensure we have 5-10 profiles as requested
    // If not enough match the focus, we'll add some generic top experts
    if (result.length < 5) {
      const others = mockLinkedInProfiles.filter(p => !result.includes(p));
      result = [...result, ...others.slice(0, 5 - result.length)];
    }

    setFilteredProfiles(result.slice(0, 10));
  }, [focusLanguage, searchQuery]);

  const handleVisitProfile = (url: string, name: string) => {
    // Open the actual profile if it exists, otherwise open a LinkedIn search for them
    const searchUrl = `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;
    window.open(url.startsWith('http') ? url : searchUrl, '_blank');
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isLoggedIn onLogout={handleLogout} />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Mission Control
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl font-display font-bold tracking-tight mb-2 flex items-center gap-3">
                <Cpu className="w-10 h-10 text-primary animate-pulse" />
                Neural <span className="text-primary italic">Network</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                AI-curated experts matching your <span className="text-white font-semibold uppercase">{focusLanguage}</span> telemetry.
              </p>
            </motion.div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search experts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card/30 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary/50 transition-all backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative p-6 rounded-[2rem] bg-card/30 border border-white/5 backdrop-blur-md hover:border-primary/30 transition-all overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                
                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="relative">
                    <img 
                      src={profile.imageUrl} 
                      alt={profile.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-primary/30 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#050505] p-1 rounded-lg">
                      <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                       {profile.name}
                       {i < 3 && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-tight">{profile.role}</p>
                    <p className="text-xs text-primary/80 font-bold mt-1 uppercase tracking-wider">{profile.company}</p>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-muted-foreground uppercase border border-white/5 group-hover:border-primary/20 transition-all">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="w-3 h-3" />
                      <span>Remote / Global</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleVisitProfile(profile.profileUrl, profile.name)}
                      className="h-9 px-4 rounded-xl gap-2 hover:bg-primary hover:text-white transition-all group/btn"
                    >
                      Visit Profile
                      <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold mb-2">No experts found</h3>
              <p className="text-muted-foreground">Try adjusting your focus telemetry or mission search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExpertRecommendations;
