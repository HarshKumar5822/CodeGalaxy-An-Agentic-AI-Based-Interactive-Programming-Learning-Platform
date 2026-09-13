import React from 'react';
import { Heart, Sparkles, Code2, Github } from 'lucide-react';

const GlobalFooter: React.FC = () => {
  return (
    <footer className="w-full py-6 px-4 mt-auto bg-background/60 backdrop-blur-xl border-t border-border/40 text-center relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
        
        {/* Left branding */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cq-cyan to-cq-purple flex items-center justify-center text-cq-dark shadow-sm">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-display font-bold text-foreground italic tracking-tight">CodeGalaxy Platform</span>
          <span className="text-border">|</span>
          <span className="text-gray-400">Agentic AI Learning Environment</span>
        </div>

        {/* Center Creator Tag */}
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-foreground font-bold shadow-sm hover:border-primary/40 transition-all">
          <Sparkles className="w-3.5 h-3.5 text-cq-cyan animate-pulse" />
          <span>Created with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-bounce" />
          <span>by</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cq-cyan via-primary to-cq-purple font-extrabold tracking-wide">
            Harsh Kumar
          </span>
        </div>

        {/* Right Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/HarshKumar5822/CodeGalaxy-An-Agentic-AI-Based-Interactive-Programming-Learning-Platform"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
          <span className="text-gray-600">© {new Date().getFullYear()}</span>
        </div>

      </div>
    </footer>
  );
};

export default GlobalFooter;
