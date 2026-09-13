import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Code2, Target, Brain, ArrowRight, Zap, Cpu, Globe, Rocket } from 'lucide-react';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    language: string;
    difficulty: Difficulty;
}

const QUESTIONS: Question[] = [
    { id: 1, text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Text Markup Language', 'Hyper Tabular Markup Language', 'None of these'], correctAnswer: 0, language: 'HTML', difficulty: 'beginner' },
    { id: 2, text: 'What is the correct syntax to output "Hello World" in Python?', options: ['echo "Hello World"', 'print("Hello World")', 'p("Hello World")', 'console.log("Hello World")'], correctAnswer: 1, language: 'Python', difficulty: 'beginner' },
    { id: 3, text: 'Choose the correct HTML element for the largest heading:', options: ['<heading>', '<h6>', '<head>', '<h1>'], correctAnswer: 3, language: 'HTML', difficulty: 'beginner' },
    { id: 4, text: 'Inside which HTML element do we put the JavaScript?', options: ['<script>', '<javascript>', '<js>', '<scripting>'], correctAnswer: 0, language: 'JavaScript', difficulty: 'beginner' },
    { id: 5, text: 'How do you create a function in JavaScript?', options: ['function = myFunction()', 'function myFunction()', 'function:myFunction()', 'create myFunction()'], correctAnswer: 1, language: 'JavaScript', difficulty: 'beginner' },
    { id: 15, text: 'What is the output of JavaScript: console.log(typeof NaN)?', options: ['"number"', '"NaN"', '"undefined"', '"string"'], correctAnswer: 0, language: 'JavaScript', difficulty: 'advanced' },
    { id: 19, text: 'What is a closure in JavaScript?', options: ['A function inside another function that has access to the outer function\'s variables', 'A way to stop execution', 'A method to close browser tabs', 'Closing a database connection'], correctAnswer: 0, language: 'JavaScript', difficulty: 'advanced' },
];

const Questionnaire = () => {
    const navigate = useNavigate();
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [animDirection, setAnimDirection] = useState(1);



    const question = QUESTIONS[currentQuestionIdx];

    const handleOptionSelect = (optionIdx: number) => {
        setAnswers({ ...answers, [question.id]: optionIdx });
        nextQuestion();
    };

    const nextQuestion = () => {
        if (currentQuestionIdx < QUESTIONS.length - 1) {
            setAnimDirection(1);
            setCurrentQuestionIdx(currentQuestionIdx + 1);
        } else {
            finishQuestionnaire();
        }
    };

    const finishQuestionnaire = () => {
        navigate('/dashboard');
    };

    const progressPercentage = ((currentQuestionIdx + 1) / QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-background selection:bg-primary/30">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-background dark:bg-deep-space z-0" />
            <div className="absolute inset-0 bg-grid opacity-5 dark:opacity-10 z-0" />
            <div className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] opacity-20 pointer-events-none" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[800px] h-[800px] bg-cq-purple/10 rounded-full blur-[140px] opacity-30 pointer-events-none" />

            <div className="relative z-10 w-full max-w-3xl">
                {/* Header */}
                <div className="mb-12 flex justify-between items-end px-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                           <Brain className="w-6 h-6 text-primary animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">Neural Initialization Protocol</span>
                        </div>
                        <h1 className="font-display text-4xl font-black italic uppercase tracking-tighter leading-none text-foreground">
                            Identity <span className="text-primary italic text-glow-cyan">Verification</span>
                        </h1>
                    </div>
                    <Button 
                       variant="ghost" 
                       onClick={() => navigate('/dashboard')} 
                       className="h-10 px-6 rounded-xl border border-border/30 bg-muted/40 backdrop-blur-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-muted/60 text-foreground"
                    >
                        Bypass Calibration
                    </Button>
                </div>

                <div className="glass-panel p-1 rounded-[3.5rem] border-border/40 shadow-[0_0_100px_rgba(0,0,0,0.1)] dark:shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="bg-card/85 backdrop-blur-3xl p-12 sm:p-16 rounded-[3.3rem] relative">
                         {/* Progress bar */}
                        <div className="absolute top-0 left-0 h-1.5 w-full bg-white/5">
                            <motion.div
                                className="h-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        <div className="mb-12">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                                    Module sync: {(currentQuestionIdx + 1).toString().padStart(2, '0')} // {QUESTIONS.length.toString().padStart(2, '0')}
                                </span>
                                <div className="flex gap-3">
                                    <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary italic">
                                        {question.difficulty}
                                    </div>
                                    <div className="px-3 py-1 rounded-lg bg-muted border border-border/30 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                        {question.language}
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence mode="wait" custom={animDirection}>
                                <motion.div
                                    key={question.id}
                                    initial={{ opacity: 0, x: animDirection * 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: animDirection * -30 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    <h2 className="text-3xl sm:text-4xl font-display font-black text-foreground italic mb-12 leading-tight tracking-tight">
                                        {question.text}
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4">
                                        {question.options.map((option, idx) => (
                                            <motion.button
                                                key={idx}
                                                whileHover={{ scale: 1.01, x: 5 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => handleOptionSelect(idx)}
                                                className="w-full text-left p-6 rounded-[1.8rem] border border-border/40 bg-card hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 group relative overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex items-center gap-6 relative z-10">
                                                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-muted border border-border/40 group-hover:border-primary/30 group-hover:bg-primary/10 font-mono text-sm text-muted-foreground group-hover:text-primary transition-all">
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <span className="text-lg font-bold text-foreground/80 group-hover:text-primary transition-colors">{option}</span>
                                                    <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Footer UI Details */}
                <div className="mt-12 grid grid-cols-3 gap-8 px-8">
                   {[
                     { label: 'Matching Profile', val: 'Matching...', icon: <Zap /> },
                     { label: 'System Connection', val: 'Connected', icon: <Globe /> },
                     { label: 'Login Status', val: 'Identified', icon: <Target /> }
                   ].map(item => (
                     <div key={item.label} className="text-center group">
                        <div className="text-muted-foreground/40 mb-3 mx-auto w-fit group-hover:text-primary transition-colors">{item.icon}</div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mb-1">{item.label}</p>
                        <p className="text-[10px] font-mono text-muted-foreground/40 group-hover:text-primary transition-colors">{item.val}</p>
                     </div>
                   ))}
                </div>
            </div>
        </div>
    );
};

export default Questionnaire;
