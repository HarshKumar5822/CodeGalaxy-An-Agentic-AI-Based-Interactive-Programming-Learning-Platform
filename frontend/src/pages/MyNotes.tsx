import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Save, 
  Search, 
  Tag, 
  Mic, 
  MicOff, 
  BookOpen, 
  Calendar, 
  Globe, 
  Sparkles,
  CheckCircle2,
  FileText
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const MyNotes = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('code_galaxy_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved notes:", e);
      }
    }
    return [
      {
        id: 'n1',
        title: 'Binary Search Mastery',
        content: 'Binary Search operates in O(log N) time by continuously dividing the sorted search interval in half. Note: Always verify that the array is sorted before executing binary search!',
        tags: ['Algorithms', 'Logic'],
        createdAt: new Date().toLocaleDateString()
      }
    ];
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active selected note editing states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTagsText, setNoteTagsText] = useState('');

  // Speech-to-Text Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'en-US' | 'hi-IN'>('en-US');
  const [recognition, setRecognition] = useState<any>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync edits to state when selection changes
  useEffect(() => {
    const active = notes.find(n => n.id === selectedNoteId);
    if (active) {
      setNoteTitle(active.title);
      setNoteContent(active.content);
      setNoteTagsText(active.tags.join(', '));
    } else {
      setNoteTitle('');
      setNoteContent('');
      setNoteTagsText('');
    }
  }, [selectedNoteId]);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('code_galaxy_notes', JSON.stringify(notes));
  }, [notes]);

  // Setup browser Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = speechLanguage;

      recog.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          insertTextAtCursor(finalTranscript);
        }
      };

      recog.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsRecording(false);
      };

      recog.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recog);
    }
  }, [speechLanguage]);

  // Insert transcribed voice text at current caret cursor position
  const insertTextAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setNoteContent(prev => prev + ' ' + text);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const newText = currentText.substring(0, start) + ' ' + text + ' ' + currentText.substring(end);

    setNoteContent(newText);
    
    // Position cursor after inserted transcript text
    setTimeout(() => {
      textarea.focus();
      const newPos = start + text.length + 2; // +2 for padded spaces
      textarea.setSelectionRange(newPos, newPos);
    }, 50);
  };

  const toggleRecording = () => {
    if (!recognition) {
      toast.error("Web Speech API is not supported in this browser. Try Chrome or Edge!");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      toast.success("Voice recording stopped.");
    } else {
      recognition.start();
      setIsRecording(true);
      toast.success(`Voice transcription active (${speechLanguage === 'en-US' ? 'English' : 'Hindi'}). Speak now!`);
    }
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: 'note_' + Date.now(),
      title: 'New Memory Node',
      content: '',
      tags: ['General'],
      createdAt: new Date().toLocaleDateString()
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    toast.success("Created new note container.");
  };

  const handleSaveNote = () => {
    if (!selectedNoteId) return;
    
    const parsedTags = noteTagsText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    setNotes(prev => prev.map(n => {
      if (n.id === selectedNoteId) {
        return {
          ...n,
          title: noteTitle.trim() || 'Untitled Note',
          content: noteContent,
          tags: parsedTags.length > 0 ? parsedTags : ['General']
        };
      }
      return n;
    }));
    toast.success("Note saved successfully.");
  };

  const handleDeleteNote = (idToDelete: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setNotes(prev => prev.filter(n => n.id !== idToDelete));
    if (selectedNoteId === idToDelete) {
      setSelectedNoteId(notes.find(n => n.id !== idToDelete)?.id || null);
    }
    toast.success("Note deleted successfully.");
  };

  const filteredNotes = notes.filter(n => {
    const query = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.tags.some(t => t.toLowerCase().includes(query))
    );
  });

  const activeNote = notes.find(n => n.id === selectedNoteId);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 scroll-smooth overflow-x-hidden relative transition-colors duration-300">
      <Navbar isLoggedIn />

      {/* Cyber Theme-Adaptive Background Grids */}
      <div className="fixed inset-0 bg-slate-50 dark:bg-[#0c0d0f] z-0 pointer-events-none transition-colors duration-300" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(0,180,120,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.025)_1px,transparent_1px)] bg-[size:32px_32px] z-0 pointer-events-none" />

      <main className="relative z-10 pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto h-[100vh] flex flex-col justify-start">
        {/* Page Title Header */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-cq-cyan animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Memory Archives</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-black italic uppercase tracking-tight text-foreground leading-none">
              Cognitive <span className="text-cq-cyan italic">Notes Core</span>
            </h1>
          </div>
          <Button 
            onClick={handleCreateNote}
            className="rounded-xl border border-cq-cyan/30 bg-cq-cyan/10 hover:bg-cq-cyan text-cq-cyan hover:text-black font-black uppercase text-xs tracking-wider gap-1.5 transition-all shadow-md h-10 px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Node
          </Button>
        </div>

        {/* Workspace Columns */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
          
          {/* Left Column: Notes Directory */}
          <div className="lg:col-span-1 flex flex-col min-h-0 bg-white/90 dark:bg-card/30 border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-none backdrop-blur-xl p-4 rounded-3xl transition-colors duration-300">
            {/* Directory Header / Search */}
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Query nodes by keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-slate-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-cq-cyan/20 rounded-xl"
              />
            </div>

            {/* List scroll panel */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs uppercase tracking-wider font-mono italic">
                  No records synchronized
                </div>
              ) : (
                filteredNotes.map(n => {
                  const isActive = n.id === selectedNoteId;
                  return (
                    <div
                      key={n.id}
                      onClick={() => setSelectedNoteId(n.id)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                        isActive 
                          ? 'bg-cq-cyan/10 border-cq-cyan/50 shadow-md font-bold' 
                          : 'bg-slate-50/70 dark:bg-[#141518]/50 border-gray-200/80 dark:border-white/5 hover:border-cq-cyan/40 shadow-sm'
                      }`}
                    >
                      {/* Active Left Indicator Strip */}
                      {isActive && (
                        <div className="absolute top-0 bottom-0 left-0 w-1 bg-cq-cyan" />
                      )}
                      
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h3 className={`font-bold text-xs tracking-wide line-clamp-1 ${isActive ? 'text-cq-cyan' : 'text-foreground'}`}>
                          {n.title || 'Untitled Note'}
                        </h3>
                        <button
                          onClick={(e) => handleDeleteNote(n.id, e)}
                          className="text-muted-foreground hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-muted-foreground text-[10px] line-clamp-2 leading-relaxed mb-3">
                        {n.content || 'Empty data index...'}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
                        <div className="flex flex-wrap gap-1 max-w-[70%]">
                          {n.tags.map(t => (
                            <span key={t} className="text-[7px] font-black uppercase bg-slate-200/60 dark:bg-secondary/40 border border-gray-200 dark:border-white/5 text-muted-foreground px-1.5 py-0.5 rounded-md">
                              {t}
                            </span>
                          ))}
                        </div>
                        <span className="text-[8px] font-bold text-muted-foreground flex items-center gap-1 font-mono">
                          <Calendar className="w-2.5 h-2.5" />
                          {n.createdAt}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Note Node Editor */}
          <div className="lg:col-span-2 flex flex-col min-h-0 bg-white/90 dark:bg-card/30 border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-none backdrop-blur-xl rounded-3xl relative overflow-hidden transition-colors duration-300">
            {activeNote ? (
              <div className="flex-1 flex flex-col min-h-0 p-6">
                {/* Note Editor Header */}
                <div className="flex flex-col gap-4 mb-4 shrink-0">
                  <div className="flex justify-between items-center gap-6">
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={e => setNoteTitle(e.target.value)}
                      placeholder="Note Title..."
                      className="flex-1 bg-transparent border-0 border-b border-gray-200 dark:border-white/10 text-lg font-bold tracking-tight text-foreground focus:outline-none focus:border-cq-cyan/40 pb-1"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        onClick={handleSaveNote}
                        size="sm"
                        className="h-9 px-3.5 rounded-xl bg-cq-cyan text-black hover:bg-cq-cyan/90 font-bold text-xs uppercase tracking-wider gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Node
                      </Button>
                      <Button
                        onClick={() => handleDeleteNote(activeNote.id)}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl border border-gray-200 dark:border-white/10 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Tag className="w-3.5 h-3.5 text-cq-cyan" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tags:</span>
                    <input
                      type="text"
                      value={noteTagsText}
                      onChange={e => setNoteTagsText(e.target.value)}
                      placeholder="e.g. Algorithms, Python, ToDo (comma separated)..."
                      className="flex-1 bg-transparent border-none text-xs text-cq-cyan focus:outline-none focus:ring-0 p-0 pl-1 placeholder:text-muted-foreground/60 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 min-h-0 relative flex flex-col border border-gray-200 dark:border-white/10 bg-slate-50/70 dark:bg-black/20 rounded-2xl p-4 mb-4">
                  <textarea
                    ref={textareaRef}
                    value={noteContent}
                    onChange={e => setNoteContent(e.target.value)}
                    placeholder="Document your coding insights, algorithm notes or strategy details here..."
                    className="flex-1 bg-transparent border-none resize-none w-full h-full focus:outline-none focus:ring-0 text-xs md:text-sm text-foreground placeholder:text-muted-foreground/60 font-medium leading-relaxed overflow-y-auto pr-1"
                  />
                  
                  {/* Floating speech status bar */}
                  {isRecording && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-4 left-4 right-4 bg-cq-cyan/10 border border-cq-cyan/30 rounded-xl p-3 backdrop-blur-md flex items-center justify-between gap-4 shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-cq-cyan animate-pulse">
                          Voice assistant active... Speak now
                        </span>
                      </div>
                      
                      {/* Waveform visual animations */}
                      <div className="flex items-end gap-0.5 h-3">
                        {[0.6, 0.9, 0.4, 0.8, 0.5, 0.7, 0.3].map((val, idx) => (
                          <motion.div
                            key={idx}
                            animate={{ height: ['4px', `${val * 16}px`, '4px'] }}
                            transition={{ repeat: Infinity, duration: 0.8 + idx * 0.1, ease: 'easeInOut' }}
                            className="w-0.5 bg-cq-cyan rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Speech Dictation control Toolbar */}
                <div className="h-14 shrink-0 flex items-center justify-between border-t border-gray-200 dark:border-white/10 pt-3">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={toggleRecording}
                      variant="outline"
                      className={`h-11 rounded-2xl border flex items-center gap-2.5 transition-all text-xs font-black uppercase tracking-wider px-5 cursor-pointer ${
                        isRecording 
                          ? 'border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                          : 'border-cq-cyan/30 bg-cq-cyan/10 hover:bg-cq-cyan hover:text-black text-cq-cyan shadow-sm'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isRecording ? 'Mute' : 'Dictate voice'}
                    </Button>

                    {/* Language selector selection */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl h-11 px-3.5 text-xs text-muted-foreground">
                      <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                      <select
                        value={speechLanguage}
                        onChange={e => setSpeechLanguage(e.target.value as any)}
                        disabled={isRecording}
                        className="bg-transparent border-0 text-[10px] uppercase font-bold tracking-wider text-foreground focus:outline-none focus:ring-0 cursor-pointer disabled:opacity-50"
                      >
                        <option value="en-US" className="bg-popover text-popover-foreground">English (US)</option>
                        <option value="hi-IN" className="bg-popover text-popover-foreground">Hindi (भारत)</option>
                      </select>
                    </div>
                  </div>
                  
                  <span className="text-[8px] font-black uppercase text-muted-foreground font-mono tracking-widest hidden md:inline">
                    *Appends text directly at cursor point
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-32 h-32 relative mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 bg-cq-cyan/10 rounded-full animate-pulse blur-2xl"></div>
                  <BookOpen className="w-16 h-16 text-cq-cyan opacity-50 animate-pulse" />
                </div>
                <h3 className="text-xl font-display text-foreground mb-2 font-black">Memory Node Standby</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-6">
                  Select an archival record on the directory list, or initialize a new node to begin notes synthesis.
                </p>
                <Button 
                  onClick={handleCreateNote}
                  className="rounded-2xl border border-cq-cyan/30 bg-cq-cyan text-black hover:bg-cq-cyan/90 font-black uppercase text-xs tracking-wider px-6 h-11 shadow-lg cursor-pointer"
                >
                  Allocate Memory Node
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyNotes;
