import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Layers } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import ChallengeCard from '@/components/challenge/ChallengeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/utils/api';

// Define interface matching backend response + frontend needs
interface Challenge {
  _id: string;
  id?: string; // Fallback
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  category: string;
  isLocked?: boolean;
  isCompleted?: boolean;
  type?: string;
}

type FilterType = 'all' | 'beginner' | 'intermediate' | 'advanced';
type StatusType = 'all' | 'completed' | 'inProgress' | 'locked';

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.get('/challenges');
        console.log("Challenges API Response:", res.data);
        
        // Deduplicate challenges by title to prevent duplicates safely
        const uniqueChallenges = res.data.filter((c: Challenge, index: number, self: Challenge[]) => {
          if (!c || !c.title) return false;
          return self.findIndex(t => t && t.title && t.title.trim().toLowerCase() === c.title.trim().toLowerCase()) === index;
        });
        
        setChallenges(uniqueChallenges);
      } catch (error) {
        console.error("Failed to fetch challenges API ERROR:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  // Reset page to 1 when filters or query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, difficultyFilter, statusFilter]);

  const filteredChallenges = challenges.filter(challenge => {
    // Search filter
    if (searchQuery && !challenge.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Difficulty filter (Backend uses PascalCase 'Easy', 'Medium', 'Hard')
    if (difficultyFilter !== 'all') {
      const diffMap: Record<string, string> = { 'beginner': 'Easy', 'intermediate': 'Medium', 'advanced': 'Hard' };
      if (challenge.difficulty !== diffMap[difficultyFilter]) return false;
    }

    // Status filter
    if (statusFilter === 'completed' && !challenge.isCompleted) return false;
    if (statusFilter === 'inProgress' && (challenge.isCompleted || challenge.isLocked)) return false;
    if (statusFilter === 'locked' && !challenge.isLocked) return false;

    return true;
  });

  const difficulties: FilterType[] = ['all', 'beginner', 'intermediate', 'advanced'];
  const statuses: { value: StatusType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'locked', label: 'Locked' },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(filteredChallenges.length / ITEMS_PER_PAGE);
  const paginatedChallenges = filteredChallenges.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p>Loading challenges...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Challenges
              </h1>
            </div>
            <p className="text-muted-foreground">
              Choose your next adventure and level up your skills
            </p>
          </motion.div>

          {/* Filters Bar: Flex row with Filters on Left and Search Box on Right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-card/30 border border-white/5 p-6 rounded-[2rem] mb-8 backdrop-blur-xl"
          >
            {/* Filter buttons on the Left */}
            <div className="flex-1 flex flex-col gap-4 w-full">
              {/* Difficulty */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <Filter className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Difficulty:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((diff) => (
                    <Button
                      key={diff}
                      variant={difficultyFilter === diff ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDifficultyFilter(diff)}
                      className={`capitalize text-xs rounded-xl h-9 px-4 transition-all ${
                        difficultyFilter !== diff 
                          ? 'text-muted-foreground hover:text-foreground border-white/5 bg-[#171719]' 
                          : 'bg-primary text-black hover:bg-primary/90'
                      }`}
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 min-w-[100px]">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground pl-6">Status:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <Button
                      key={status.value}
                      variant={statusFilter === status.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status.value)}
                      className={`text-xs rounded-xl h-9 px-4 transition-all ${
                        statusFilter !== status.value 
                          ? 'text-muted-foreground hover:text-foreground border-white/5 bg-[#171719]' 
                          : 'bg-primary text-black hover:bg-primary/90'
                      }`}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Input Box on the Right */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                type="text"
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-black/40 border border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 rounded-xl w-full"
              />
            </div>
          </motion.div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredChallenges.length} of {challenges.length} challenges
          </p>

          {/* Challenge Grid showing paginated items */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedChallenges.map((challenge, index) => (
              <ChallengeCard key={challenge._id || challenge.id} challenge={challenge as any} index={index} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              {/* First Page Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-10 px-3 bg-card border-white/5 hover:bg-primary/20 hover:text-white transition-all text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-30 disabled:pointer-events-none"
              >
                First
              </Button>

              {/* Previous Page Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 bg-card border-white/5 hover:bg-primary/20 hover:text-white transition-all rounded-xl disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
              >
                &lt;
              </Button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-10 w-10 text-xs font-bold rounded-xl transition-all ${
                    currentPage === pageNum 
                      ? 'bg-primary text-black hover:bg-primary/95 shadow-md shadow-primary/20' 
                      : 'bg-card border-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {pageNum}
                </Button>
              ))}

              {/* Next Page Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-10 w-10 bg-card border-white/5 hover:bg-primary/20 hover:text-white transition-all rounded-xl disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center"
              >
                &gt;
              </Button>

              {/* Last Page Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-10 px-3 bg-card border-white/5 hover:bg-primary/20 hover:text-white transition-all text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-30 disabled:pointer-events-none"
              >
                End
              </Button>
            </div>
          )}

          {/* Empty state */}
          {filteredChallenges.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                No challenges found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Challenges;
