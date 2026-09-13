import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Bot, CheckCircle, ChevronRight, HelpCircle, 
  RefreshCw, Sparkles, XCircle, ArrowLeft 
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/utils/api';

interface Question {
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  type: string;
}

const AIInterviewQuiz = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Scoring / Submission
  const [answers, setAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [language, setLanguage] = useState('');
  const [level, setLevel] = useState('');

  const fetchQuiz = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setIsSubmitted(false);
    try {
      // First get state to know current config
      const stateRes = await api.get('/interview-prep/state');
      setLanguage(stateRes.data.selectedLanguage);
      setLevel(stateRes.data.skillLevel);

      const res = await api.post('/interview-prep/quiz/generate');
      if (res.data && res.data.questions) {
        setQuestions(res.data.questions);
      } else {
        throw new Error('Incorrect format returned');
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating dynamic quiz. Using local mock workspace questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return; // Answer locked
    setSelectedOption(idx);
  };

  const handleNext = async () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      // Complete quiz
      setSubmitting(true);
      try {
        let finalScore = 0;
        const strong: string[] = [];
        const weak: string[] = [];

        questions.forEach((q, idx) => {
          const userAns = newAnswers[idx];
          if (userAns === q.correctOption) {
            finalScore++;
            if (q.type && !strong.includes(q.type)) strong.push(q.type);
          } else {
            if (q.type && !weak.includes(q.type)) weak.push(q.type);
          }
        });

        setScore(finalScore);

        await api.post('/interview-prep/quiz/submit', {
          score: finalScore,
          totalQuestions: questions.length,
          strongTopics: strong,
          weakTopics: weak
        });

        setIsSubmitted(true);
        toast.success("Quiz completed and memory log updated!");
      } catch (err) {
        console.error(err);
        toast.error("Could not save score history.");
        setIsSubmitted(true);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090d] text-foreground flex flex-col items-center justify-center font-mono p-4">
        <Bot className="w-12 h-12 text-[#00ff88] animate-bounce mb-4" />
        <h2 className="text-lg font-bold text-white uppercase italic mb-2">Synthesizing Questions...</h2>
        <p className="text-xs text-gray-500 max-w-sm text-center leading-relaxed">
          The AI Interview engine is querying target namespace nodes for {level} technical interview preparation vectors.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-x-hidden pb-12">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-24 relative z-10 w-full flex-1 flex flex-col justify-center">
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/interview-prep')}
          className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground uppercase mb-6 w-fit transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>

        {!isSubmitted ? (
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
            
            {/* Header progress bar */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-xs">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-[10px] uppercase font-mono bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-0.5 rounded text-[#00ff88] font-bold">
                {questions[currentIndex].type || 'Concept'}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-8 leading-relaxed whitespace-pre-line">
              {questions[currentIndex].question}
            </h3>

            {/* Options layout */}
            <div className="space-y-4 mb-8">
              {questions[currentIndex].options.map((opt, idx) => {
                let borderStyle = 'border-border bg-muted/40 hover:border-border hover:bg-muted/75';
                if (selectedOption !== null) {
                  if (idx === questions[currentIndex].correctOption) {
                    borderStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                  } else if (selectedOption === idx) {
                    borderStyle = 'border-red-500 bg-red-500/10 text-red-400';
                  } else {
                    borderStyle = 'border-border/50 bg-muted/20 opacity-50';
                  }
                }
                
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`border p-5 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${borderStyle}`}
                  >
                    <span className="text-xs sm:text-sm font-semibold leading-relaxed">{opt}</span>
                    {selectedOption !== null && idx === questions[currentIndex].correctOption && (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {selectedOption !== null && selectedOption === idx && idx !== questions[currentIndex].correctOption && (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI Explanation details display */}
            <AnimatePresence>
              {selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-muted/80 border border-border p-5 rounded-2xl mb-8 space-y-2"
                >
                  <h4 className="text-xs uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Diagnostic Explanation:
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {questions[currentIndex].explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-6 border-t border-border">
              <Button
                disabled={selectedOption === null || submitting}
                onClick={handleNext}
                className="h-12 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-bold uppercase tracking-wider text-xs flex items-center gap-2"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8"
          >
            {/* Scorecard Header */}
            <div className="text-center space-y-3 relative overflow-hidden py-6 rounded-2xl bg-muted/30 border border-border">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <Award className="w-16 h-16 text-cyan-400 mx-auto" />
              <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tight font-display">Performance Scorecard</h2>
              <p className="text-sm text-muted-foreground">
                Language: <strong className="text-foreground">{language}</strong> | Level: <strong className="text-foreground">{level}</strong>
              </p>
              <div className="text-4xl font-black text-foreground font-mono mt-4">
                {score} <span className="text-lg text-muted-foreground">/ {questions.length}</span>
              </div>
            </div>

            {/* Detailed Questions Review */}
            <div className="space-y-6">
              <h3 className="text-base font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">Diagnostic Log Review</h3>
              
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const isCorrect = userAns === q.correctOption;
                
                return (
                  <div key={idx} className="bg-muted/20 border border-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-bold text-foreground leading-relaxed">{idx + 1}. {q.question}</h4>
                      {isCorrect ? (
                        <span className="text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold shrink-0">Correct</span>
                      ) : (
                        <span className="text-[10px] font-mono uppercase bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold shrink-0">Incorrect</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div>
                        Selected: <strong className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>{q.options[userAns]}</strong>
                      </div>
                      {!isCorrect && (
                        <div>
                          Correct: <strong className="text-emerald-400">{q.options[q.correctOption]}</strong>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border leading-relaxed">
                      <strong>AI Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Final Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-border">
              <Button
                variant="ghost"
                onClick={fetchQuiz}
                className="h-12 rounded-xl text-muted-foreground hover:text-foreground border border-border hover:bg-muted font-bold uppercase tracking-wider text-xs flex items-center gap-2 justify-center"
              >
                <RefreshCw className="w-4 h-4" /> Start New Quiz
              </Button>
              <Button
                onClick={() => navigate('/interview-prep')}
                className="h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-all font-bold uppercase tracking-wider text-xs flex items-center gap-2 justify-center"
              >
                Return to Dashboard
              </Button>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AIInterviewQuiz;
