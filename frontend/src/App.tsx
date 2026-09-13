import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { GamificationProvider } from "@/contexts/GamificationContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AIChatbot from "./components/CodeGalaxy/Learning/AIChatbot";
import GlobalFooter from "./components/layout/GlobalFooter";

// Lazy-loaded pages to enable code-splitting and ultra-fast initial load
const Landing = lazy(() => import("./pages/Landing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CodeGalaxyDashboard = lazy(() => import("./pages/CodeGalaxyDashboard"));
const ChallengePage = lazy(() => import("./pages/ChallengePage"));
const Challenges = lazy(() => import("./pages/Challenges"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Badges = lazy(() => import("./pages/Badges"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Register = lazy(() => import("./pages/Register"));
const Settings = lazy(() => import("./pages/Settings"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const Feedback = lazy(() => import("./pages/Feedback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const LearningPage = lazy(() => import("./pages/LearningPage"));
const Questionnaire = lazy(() => import("./pages/Questionnaire"));
const ExpertRecommendations = lazy(() => import("./pages/ExpertRecommendations"));
const AIChallengeGenerator = lazy(() => import("./pages/AIChallengeGenerator"));
const AIInterviewPrepDashboard = lazy(() => import("./pages/AIInterviewPrepDashboard"));
const AIInterviewQuiz = lazy(() => import("./pages/AIInterviewQuiz"));
const AIInterviewCoding = lazy(() => import("./pages/AIInterviewCoding"));
const AIInterviewSimulator = lazy(() => import("./pages/AIInterviewSimulator"));
const MyNotes = lazy(() => import("./pages/MyNotes"));
const AlgorithmVisualizer = lazy(() => import("./pages/AlgorithmVisualizer"));
const Certificates = lazy(() => import("./pages/Certificates"));

import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400 text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white mb-1">CodeGalaxy Recovered from Error</h2>
          <p className="text-xs text-gray-400 mb-6 font-mono max-w-md">
            {this.state.error?.message || 'An unexpected session error occurred.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/dashboard';
              }}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
            >
              Continue to Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="px-5 py-2.5 bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Reset Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const PageLoader = () => (
  <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center font-sans">
    <div className="relative flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-cq-green/20 border-t-cq-green animate-spin" />
      <div className="absolute w-8 h-8 rounded-full bg-cq-green/10 blur-sm animate-pulse" />
    </div>
    <p className="mt-4 text-xs font-mono tracking-widest text-gray-400 uppercase">
      Loading CodeGalaxy...
    </p>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <GamificationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/challenge/:id" element={
                  <ProtectedRoute>
                    <ChallengePage />
                  </ProtectedRoute>
                } />
                <Route path="/challenges" element={
                  <ProtectedRoute>
                    <Challenges />
                  </ProtectedRoute>
                } />
                <Route path="/leaderboard" element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                } />
                <Route path="/badges" element={
                  <ProtectedRoute>
                    <Badges />
                  </ProtectedRoute>
                } />
                <Route path="/learning" element={
                  <ProtectedRoute>
                    <LearningPage />
                  </ProtectedRoute>
                } />
                <Route path="/learning-path" element={
                  <ProtectedRoute>
                    <CodeGalaxyDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/notes" element={
                  <ProtectedRoute>
                    <MyNotes />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={<About />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/experts" element={
                  <ProtectedRoute>
                    <ExpertRecommendations />
                  </ProtectedRoute>
                } />
                <Route path="/ai-generator" element={
                  <ProtectedRoute>
                    <AIChallengeGenerator />
                  </ProtectedRoute>
                } />
                <Route path="/algorithm-visualizer" element={
                  <ProtectedRoute>
                    <AlgorithmVisualizer />
                  </ProtectedRoute>
                } />
                <Route path="/certificates" element={
                  <ProtectedRoute>
                    <Certificates />
                  </ProtectedRoute>
                } />
                <Route path="/interview-prep" element={
                  <ProtectedRoute>
                    <AIInterviewPrepDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/interview-prep/quiz" element={
                  <ProtectedRoute>
                    <AIInterviewQuiz />
                  </ProtectedRoute>
                } />
                <Route path="/interview-prep/coding" element={
                  <ProtectedRoute>
                    <AIInterviewCoding />
                  </ProtectedRoute>
                } />
                <Route path="/interview-prep/simulator" element={
                  <ProtectedRoute>
                    <AIInterviewSimulator />
                  </ProtectedRoute>
                } />
                <Route path="/questionnaire" element={<ProtectedRoute><Questionnaire /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <AIChatbot />
            <GlobalFooter />
          </BrowserRouter>
        </GamificationProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
</ErrorBoundary>
);

export default App;
