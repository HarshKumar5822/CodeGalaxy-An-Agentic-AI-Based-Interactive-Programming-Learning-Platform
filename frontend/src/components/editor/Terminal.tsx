import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionResult } from '@/services/judge0';
import { Button } from '@/components/ui/button';
import { Wrench, X, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import api from '@/utils/api';

interface TerminalProps {
    result: ExecutionResult | null;
    isExecuting?: boolean;
    height?: number;
    onHeightChange?: (height: number) => void;
    code?: string;
    language?: string;
    testCases?: any[];
}

const Terminal = ({ result, isExecuting, height = 200, onHeightChange, code, language = 'python', testCases = [] }: TerminalProps) => {
    const hasResult = result !== null;
    const isError = result?.status.id !== 3 && result?.status.id !== undefined; // 3 = Accepted in Judge0

    const [showAgent, setShowAgent] = useState(false);
    const [isRepairing, setIsRepairing] = useState(false);
    const [diagnosisData, setDiagnosisData] = useState<any>(null);

    // Reset agent view when a new execution starts
    useEffect(() => {
        if (isExecuting) {
            setShowAgent(false);
            setDiagnosisData(null);
        }
    }, [isExecuting]);

    const handleDeployRepairAgent = async () => {
        if (!code) return;
        setShowAgent(true);
        setIsRepairing(true);
        try {
            const errorMsg = result?.compile_output || result?.stderr || result?.message || "Unknown execution error";
            const res = await api.post('/ai/repair/diagnose', {
                code,
                language,
                errorMsg,
                testCases
            });
            setDiagnosisData(res.data);
        } catch (err) {
            console.error("Repair agent failure", err);
            setDiagnosisData({
                diagnosis: "Diagnosis link lost. Logic core reported general failure.",
                steps: [
                    "Check compiler log files manually.",
                    "Ensure variables are initialized and imported properly."
                ]
            });
        } finally {
            setIsRepairing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e] border-t border-border/50 overflow-hidden font-mono text-sm leading-relaxed" style={{ minHeight: height }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5 select-none shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Console Output</span>
                    {hasResult && !isExecuting && (
                        <div className="flex items-center gap-3 text-xs">
                            <span className={isError ? 'text-red-400' : 'text-green-400'}>
                                {result.status.description}
                            </span>
                            <span className="text-gray-500">
                                Time: {result.time}s
                            </span>
                            <span className="text-gray-500">
                                Mem: {result.memory} KB
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {isError && !isExecuting && !showAgent && (
                        <Button
                            size="sm"
                            onClick={handleDeployRepairAgent}
                            className="h-6 px-3 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1.5 animate-pulse"
                        >
                            <Wrench className="w-3.5 h-3.5" /> Deploy Repair Agent
                        </Button>
                    )}
                    <div className="flex gap-1.5 opacity-75">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                    </div>
                </div>
            </div>

            {/* Output / Agent View */}
            <div className="flex-1 overflow-auto relative bg-[#0f1011] p-4">
                <AnimatePresence mode="wait">
                    {showAgent ? (
                        <motion.div
                            key="repair-agent"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            className="flex flex-col h-full space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                                <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-widest text-xs">
                                    <AlertTriangle className="w-4 h-4" /> Subsystem Repair Diagnostic Report
                                </div>
                                <button
                                    onClick={() => setShowAgent(false)}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {isRepairing ? (
                                <div className="flex-1 flex flex-col items-center justify-center space-y-3 opacity-80 py-6">
                                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                                    <p className="text-xs text-red-400 uppercase tracking-widest animate-pulse font-bold">Scanning Code Memory Nodes...</p>
                                </div>
                            ) : (
                                <div className="space-y-4 text-xs">
                                    {diagnosisData && (
                                        <>
                                            {/* Diagnosis */}
                                            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                                                <span className="text-[10px] text-red-400 uppercase font-black tracking-widest mb-1.5 block">AI Diagnosis:</span>
                                                <p className="text-gray-300 font-medium">{diagnosisData.diagnosis}</p>
                                            </div>

                                            {/* Steps */}
                                            {diagnosisData.steps && (
                                                <div className="space-y-2">
                                                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Recommended Repair Actions:</span>
                                                    <ul className="space-y-1.5 list-disc pl-4 text-gray-300">
                                                        {diagnosisData.steps.map((step: string, i: number) => (
                                                            <li key={i}>{step}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Conceptual Snippet */}
                                            {diagnosisData.remedialCodeSnippet && (
                                                <div className="space-y-2">
                                                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">Conceptual Repair Blueprint:</span>
                                                    <pre className="bg-[#1c1c1e] p-3 rounded-lg border border-white/5 text-emerald-400 overflow-x-auto whitespace-pre">
                                                        {diagnosisData.remedialCodeSnippet}
                                                    </pre>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="standard-terminal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="flex gap-2 text-muted-foreground mb-3 opacity-50 select-none">
                                <span className="text-green-500">➜</span>
                                <span>~ Executing...</span>
                            </div>

                            {isExecuting ? (
                                <div className="text-gray-400 animate-pulse">
                                    Communicating with Judge0 execution engine...
                                </div>
                            ) : hasResult ? (
                                <pre className={`whitespace-pre-wrap break-all ${isError ? 'text-red-400' : 'text-gray-300'}`}>
                                    {result.compile_output || result.stderr || result.stdout || result.message || "No Output"}
                                </pre>
                            ) : (
                                <div className="text-muted-foreground italic opacity-50">
                                    Run your code to see output logic here...
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Terminal;
