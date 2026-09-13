import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, CheckCircle, XCircle, Award, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What is the worst-case time complexity of QuickSort?",
    options: ["O(log n)", "O(n log n)", "O(n²)", "O(n)"],
    correctIndex: 2,
    explanation: "QuickSort degrades to O(n²) when the pivot selection is poor (e.g. sorted array with first element pivot)."
  },
  {
    question: "Which data structure operates on a Last-In, First-Out (LIFO) principle?",
    options: ["Queue", "Stack", "Heap", "Binary Tree"],
    correctIndex: 1,
    explanation: "A Stack adds and removes elements from the top (LIFO)."
  },
  {
    question: "What algorithm is used to find the shortest path in a weighted graph without negative edges?",
    options: ["Dijkstra's Algorithm", "Breadth-First Search", "Kruskal's Algorithm", "Depth-First Search"],
    correctIndex: 0,
    explanation: "Dijkstra's algorithm finds single-source shortest paths in weighted graphs with non-negative edge weights."
  }
];

export const InteractiveMiniQuiz: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(idx);

    if (idx === q.correctIndex) {
      setScore(prev => prev + 50);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleNext = () => {
    setSelectedIndex(null);
    setCurrentIdx(prev => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-white/90 via-gray-50/90 to-cq-cyan/5 dark:from-[#0d091a]/90 dark:via-[#080512]/90 dark:to-cq-purple/10 border border-gray-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cq-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/60 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cq-cyan/20 text-cq-cyan">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-foreground italic uppercase tracking-tight">
              Instant Knowledge Challenge
            </h3>
            <p className="text-xs text-muted-foreground">Test your algorithm intuition in 10 seconds</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cq-gold/10 border border-cq-gold/30 text-cq-gold font-mono font-bold text-xs">
          <Zap className="w-3.5 h-3.5 fill-cq-gold" />
          <span>+{score} XP Earned</span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cq-cyan mb-2 block">
          Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
        </span>
        <h4 className="font-display text-base sm:text-lg font-extrabold text-foreground">
          {q.question}
        </h4>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {q.options.map((option, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrect = idx === q.correctIndex;
          let btnStyle = 'border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 hover:border-cq-cyan/50 text-foreground';

          if (selectedIndex !== null) {
            if (isCorrect) {
              btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]';
            } else if (isSelected) {
              btnStyle = 'border-red-500 bg-red-500/20 text-red-600 dark:text-red-400 font-bold';
            } else {
              btnStyle = 'border-gray-200/40 dark:border-white/5 opacity-40 text-muted-foreground';
            }
          }

          return (
            <motion.button
              key={idx}
              whileHover={{ scale: selectedIndex === null ? 1.02 : 1 }}
              whileTap={{ scale: selectedIndex === null ? 0.98 : 1 }}
              onClick={() => handleSelect(idx)}
              className={`p-3.5 rounded-2xl border text-left font-mono text-xs flex items-center justify-between transition-all duration-200 ${btnStyle}`}
            >
              <span>{option}</span>
              {selectedIndex !== null && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
              {selectedIndex !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback Footer */}
      <AnimatePresence mode="wait">
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/60 dark:border-white/10"
          >
            <div className="text-xs text-foreground">
              <strong className="block mb-1 font-mono text-cq-cyan">
                {selectedIndex === q.correctIndex ? '🎉 Perfect Solution!' : '💡 Learning Insight:'}
              </strong>
              <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
            </div>
            <Button
              onClick={handleNext}
              className="rounded-xl bg-cq-cyan text-black hover:bg-cq-cyan/80 text-xs font-black shrink-0 w-full sm:w-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Next Question
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
