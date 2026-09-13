import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, ShieldCheck, Download, Share2, Search, CheckCircle2, 
  Sparkles, ExternalLink, Calendar, User, Code2, QrCode, Lock
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface CertificateData {
  id: string;
  title: string;
  track: string;
  issueDate: string;
  recipientName: string;
  skills: string[];
  grade: string;
  verified: boolean;
}

const MOCK_CERTIFICATES: CertificateData[] = [
  {
    id: 'CG-2026-DSA99',
    title: 'Full-Stack Data Structures & Algorithms',
    track: 'Algorithmic Mastery',
    issueDate: 'July 28, 2026',
    recipientName: 'Harsh Kumar',
    skills: ['Trees & Graphs', 'Dynamic Programming', 'Complexity Analysis', 'QuickSort'],
    grade: 'Mastery Tier (Top 1%)',
    verified: true
  },
  {
    id: 'CG-2026-RT882',
    title: 'React & TypeScript Advanced Architecture',
    track: 'Web Engineering',
    issueDate: 'June 15, 2026',
    recipientName: 'Harsh Kumar',
    skills: ['React 18', 'TypeScript', 'State Management', 'Vite & Next.js'],
    grade: 'Excellence Tier',
    verified: true
  },
  {
    id: 'CG-2026-AI341',
    title: 'AI Challenge Conqueror & Prompt Engineer',
    track: 'Artificial Intelligence',
    issueDate: 'May 20, 2026',
    recipientName: 'Harsh Kumar',
    skills: ['LLM Integration', 'Prompt Engineering', 'AI Debugging', 'Code Optimization'],
    grade: 'Distinction Tier',
    verified: true
  }
];

const Certificates = () => {
  const [userName, setUserName] = useState<string>(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      return userInfo.name || userInfo.username || 'Student Explorer';
    } catch {
      return 'Student Explorer';
    }
  });

  useEffect(() => {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      if (userInfoStr) {
        const parsed = JSON.parse(userInfoStr);
        if (parsed.name) {
          setUserName(parsed.name);
        } else if (parsed.username) {
          setUserName(parsed.username);
        }
      }
    } catch (err) {
      console.error('Error reading user info:', err);
    }
  }, []);

  // Dynamically map certificates to use current user's profile name
  const userCertificates = MOCK_CERTIFICATES.map(c => ({
    ...c,
    recipientName: userName
  }));

  const [selectedCert, setSelectedCert] = useState<CertificateData>(userCertificates[0]);
  const [searchId, setSearchId] = useState('');
  const [verificationResult, setVerificationResult] = useState<CertificateData | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Keep selectedCert synced with current user name
  const currentCert = {
    ...selectedCert,
    recipientName: userName
  };

  const handleSearchVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setIsVerifying(true);

    setTimeout(() => {
      const found = MOCK_CERTIFICATES.find(c => c.id.toLowerCase() === searchId.trim().toLowerCase());
      if (found) {
        const verifiedWithUser = { ...found, recipientName: userName };
        setVerificationResult(verifiedWithUser);
        toast.success(`Certificate ${found.id} Verified Authentic!`);
      } else {
        setVerificationResult(null);
        toast.error('Certificate ID not found in CodeGalaxy ledger.');
      }
      setIsVerifying(false);
    }, 600);
  };

  const handleDirectDownload = () => {
    try {
      const width = 1600;
      const height = 1050;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        toast.error('Could not initialize canvas context');
        return;
      }

      // 1. Background (White Canva Paper)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // 2. Outer Gold Frame Border
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#c5a059';
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // Inner Hairline Border
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.5)';
      ctx.strokeRect(35, 35, width - 70, height - 70);

      // Corner Accents
      const drawCorner = (x: number, y: number, dx: number, dy: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y + dy * 25);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx * 25, y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#c5a059';
        ctx.stroke();
      };
      drawCorner(45, 45, 1, 1);
      drawCorner(width - 45, 45, -1, 1);
      drawCorner(45, height - 45, 1, -1);
      drawCorner(width - 45, height - 45, -1, -1);

      // 3. Header Section
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CodeGalaxy', 90, 110);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('ACADEMY OF ALGORITHMIC SCIENCE', 90, 135);

      // Official Badge (Top Right)
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(width - 320, 85, 230, 45);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(width - 320, 85, 230, 45);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('OFFICIAL CREDENTIAL', width - 205, 113);

      // Header Divider Line
      ctx.beginPath();
      ctx.moveTo(80, 170);
      ctx.lineTo(width - 80, 170);
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Main Body
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('CERTIFICATE OF COMPLETION', width / 2, 230);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 44px serif';
      ctx.fillText('PROUDLY PRESENTED TO', width / 2, 290);

      // Student Name
      ctx.fillStyle = '#0f172a';
      ctx.font = 'italic bold 64px serif';
      ctx.fillText(currentCert.recipientName, width / 2, 385);

      // Name Underline
      ctx.beginPath();
      ctx.moveTo(width / 2 - 250, 410);
      ctx.lineTo(width / 2 + 250, 410);
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Description text
      ctx.fillStyle = '#475569';
      ctx.font = '500 20px sans-serif';
      ctx.fillText(
        'For successfully demonstrating advanced algorithm optimization, data structures mastery,',
        width / 2,
        470
      );
      ctx.fillText('and fulfilling all official requirements for:', width / 2, 500);

      // Course Banner Box (Navy Blue Card)
      const boxWidth = 900;
      const boxHeight = 110;
      const boxX = (width - boxWidth) / 2;
      const boxY = 540;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.strokeStyle = '#c5a059';
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(currentCert.title, width / 2, boxY + 50);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`${currentCert.track} • ${currentCert.grade}`, width / 2, boxY + 85);

      // 5. Bottom Section
      ctx.beginPath();
      ctx.moveTo(80, 860);
      ctx.lineTo(width - 80, 860);
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Left: Issued Date & ID
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('DATE OF ISSUANCE', 90, 900);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(currentCert.issueDate, 90, 930);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`ID: ${currentCert.id}`, 90, 960);

      // Center: Gold Verified Seal Medallion
      const sealX = width / 2;
      const sealY = 920;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 45, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('VERIFIED', sealX, sealY - 5);
      ctx.fillText('SEAL', sealX, sealY + 15);

      // Right: Signature (Mr. Harsh Kumar)
      ctx.textAlign = 'right';
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('AUTHORIZED SIGNATURE', width - 90, 900);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'italic bold 28px serif';
      ctx.fillText('Mr. Harsh Kumar', width - 90, 935);

      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('CHIEF ACADEMIC DIRECTOR', width - 90, 965);

      // Convert Canvas to PNG and Trigger Direct Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `CodeGalaxy_Certificate_${currentCert.id}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully downloaded ${currentCert.id} certificate!`);
    } catch (err) {
      console.error('Direct download error:', err);
      toast.error('Could not process direct image download.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://codegalaxy.dev/verify/${currentCert.id}`);
    toast.success('Verification link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar isLoggedIn />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-cq-gold/10 border border-cq-gold/30 text-cq-gold">
                <Award className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
                Verifiable <span className="text-cq-gold italic">Completion Certificates</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Official cryptographically-verifiable credentials earned across CodeGalaxy learning paths and algorithmic milestones.
            </p>
          </div>

          {/* Verification Search Bar */}
          <form onSubmit={handleSearchVerify} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
              <Input
                placeholder="Verify Cert ID (e.g. CG-2026-DSA99)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-card border-border/50 text-xs font-mono"
              />
            </div>
            <Button type="submit" variant="hero" size="sm" className="rounded-xl h-10 px-4 font-bold text-xs gap-1.5 shrink-0">
              <ShieldCheck className="w-4 h-4" /> Verify
            </Button>
          </form>
        </div>

        {/* Verification Result Alert if searched */}
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-sm text-emerald-400 block">Verified Authentic Record</span>
                <span className="text-xs text-muted-foreground">
                  Certificate ID <strong className="text-foreground">{verificationResult.id}</strong> is issued to <strong className="text-foreground">{verificationResult.recipientName}</strong> for {verificationResult.title}.
                </span>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setVerificationResult(null)} className="text-xs text-muted-foreground">
              Dismiss
            </Button>
          </motion.div>
        )}

        {/* Main Grid: Certificate Selection & Live Certificate Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Certificate Selector List */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground px-1">
              Your Earned Certificates ({userCertificates.length})
            </h3>

            {userCertificates.map((cert) => {
              const isSelected = currentCert.id === cert.id;
              return (
                <motion.div
                  key={cert.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setSelectedCert(cert)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cq-gold/10 border-cq-gold/50 shadow-[0_0_25px_rgba(255,215,0,0.15)]'
                      : 'bg-card/70 border-border/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Badge variant="outline" className="text-[10px] font-mono text-cq-gold border-cq-gold/30">
                      {cert.id}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-medium">{cert.issueDate}</span>
                  </div>

                  <h4 className="font-display font-bold text-base text-foreground mb-1 leading-snug">
                    {cert.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">{cert.track}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {cert.skills.map((skill, i) => (
                      <span key={i} className="text-[10px] bg-background/60 border border-border/40 px-2 py-0.5 rounded-md font-mono text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Certificate Frame */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border/50 p-3 rounded-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 Verified Ledger</span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="rounded-xl text-xs gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Button variant="hero" size="sm" onClick={handleDirectDownload} className="rounded-xl text-xs gap-1.5 font-bold cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Download PDF / Image
                </Button>
              </div>
            </div>

            {/* High Resolution Printable Canva-Style Certificate Frame */}
            <div
              id="printable-certificate"
              className="relative min-h-[580px] bg-white text-slate-900 border-[6px] border-[#c5a059] rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col justify-between overflow-hidden select-none"
            >
              {/* Inner Decorative Hairline Border */}
              <div className="absolute inset-3 border border-[#c5a059]/60 rounded-2xl pointer-events-none" />
              
              {/* Corner Ornate Accents */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#c5a059]" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#c5a059]" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#c5a059]" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#c5a059]" />

              {/* Watermark Crest Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award className="w-[350px] h-[350px] text-[#c5a059]" />
              </div>

              {/* Top Certificate Header */}
              <div className="flex items-center justify-between border-b border-[#c5a059]/30 pb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1e293b] to-[#0f172a] p-2 flex items-center justify-center text-[#f59e0b] shadow-md">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="font-display font-black text-xl text-[#0f172a] tracking-tight block">
                      CodeGalaxy
                    </span>
                    <span className="text-[9px] font-mono text-[#b45309] uppercase font-bold tracking-[0.25em] block">
                      Academy of Algorithmic Science
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-black text-[#b45309] bg-[#fef3c7] border border-[#f59e0b]/40 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm inline-block">
                    Official Credential
                  </span>
                </div>
              </div>

              {/* Main Certificate Title & Body */}
              <div className="my-8 text-center space-y-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono font-bold text-[#b45309] uppercase tracking-[0.35em] block">
                    Certificate of Completion
                  </span>
                  <h2 className="font-serif font-black text-3xl md:text-4xl text-[#0f172a] tracking-[0.15em] uppercase">
                    PROUDLY PRESENTED TO
                  </h2>
                </div>

                {/* Student Recipient Name */}
                <div className="py-2">
                  <h3 className="font-serif font-bold text-4xl md:text-5xl text-[#0f172a] tracking-tight italic underline decoration-[#c5a059]/40 underline-offset-8">
                    {currentCert.recipientName}
                  </h3>
                </div>

                <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed">
                  For successfully demonstrating advanced algorithm optimization, data structures mastery, and fulfilling all official requirements for:
                </p>

                {/* Course Title Banner */}
                <div className="py-3.5 px-8 bg-[#0f172a] border-2 border-[#c5a059] rounded-2xl inline-block max-w-xl shadow-xl">
                  <h4 className="text-xl md:text-2xl font-display font-black text-[#f59e0b] tracking-wide">
                    {currentCert.title}
                  </h4>
                  <span className="text-xs font-mono text-slate-300 block mt-1">
                    {currentCert.track} • {currentCert.grade}
                  </span>
                </div>
              </div>

              {/* Bottom Section: Official Gold Seal, Signatures & Verification QR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[#c5a059]/30 pt-6 relative z-10">
                
                {/* Left: Issued Date & Certificate Hash ID */}
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block">Date of Issuance</span>
                  <span className="text-xs font-mono font-bold text-slate-900 block">{currentCert.issueDate}</span>
                  <span className="text-[10px] font-mono text-[#b45309] font-bold block pt-1">
                    ID: {currentCert.id}
                  </span>
                </div>

                {/* Center: Official Embossed Gold Medallion Seal */}
                <div className="flex items-center gap-3 bg-amber-50/80 border border-[#c5a059]/40 px-4 py-2 rounded-2xl shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 border-2 border-amber-200 shadow-md flex items-center justify-center text-slate-900 shrink-0">
                    <Sparkles className="w-6 h-6 fill-slate-900" />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-mono font-black text-[#b45309] uppercase tracking-wider block">Verified Seal</span>
                    <span className="text-[10px] font-serif font-bold text-slate-800 block">CodeGalaxy Certified</span>
                  </div>
                </div>

                {/* Right: Signature & Detailed Real QR Code */}
                <div className="flex items-center gap-4 text-center sm:text-right">
                  {/* Detailed High-Resolution QR Code */}
                  <div className="w-14 h-14 bg-white border border-[#c5a059]/50 p-1.5 rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 29 29" fill="#0f172a">
                      {/* Top-Left Finder Pattern */}
                      <path d="M0,0 h7 v7 h-7 z M1,1 v5 h5 v-5 z M2,2 h3 v3 h-3 z" />
                      
                      {/* Top-Right Finder Pattern */}
                      <path d="M22,0 h7 v7 h-7 z M23,1 v5 h5 v-5 z M24,2 h3 v3 h-3 z" />
                      
                      {/* Bottom-Left Finder Pattern */}
                      <path d="M0,22 h7 v7 h-7 z M1,23 v5 h5 v-5 z M2,24 h3 v3 h-3 z" />
                      
                      {/* Alignment Pattern */}
                      <path d="M20,20 h5 v5 h-5 z M21,21 v3 h3 v-3 z M22,22 h1 v1 h-1 z" />
                      
                      {/* Timing Patterns */}
                      <path d="M8,6 h1 v1 h-1 z M10,6 h1 v1 h-1 z M12,6 h1 v1 h-1 z M14,6 h1 v1 h-1 z M16,6 h1 v1 h-1 z M18,6 h1 v1 h-1 z M20,6 h1 v1 h-1 z" />
                      <path d="M6,8 h1 v1 h-1 z M6,10 h1 v1 h-1 z M6,12 h1 v1 h-1 z M6,14 h1 v1 h-1 z M6,16 h1 v1 h-1 z M6,18 h1 v1 h-1 z M6,20 h1 v1 h-1 z" />
                      
                      {/* High Density Data Matrix Modules */}
                      <rect x="8" y="0" width="1" height="2" />
                      <rect x="10" y="1" width="2" height="1" />
                      <rect x="13" y="0" width="1" height="3" />
                      <rect x="15" y="1" width="2" height="1" />
                      <rect x="18" y="0" width="1" height="2" />
                      <rect x="20" y="1" width="1" height="3" />
                      <rect x="8" y="3" width="2" height="1" />
                      <rect x="11" y="4" width="1" height="1" />
                      <rect x="13" y="3" width="3" height="1" />
                      <rect x="17" y="4" width="2" height="1" />
                      <rect x="20" y="3" width="1" height="2" />
                      <rect x="0" y="8" width="2" height="1" />
                      <rect x="3" y="9" width="2" height="1" />
                      <rect x="8" y="8" width="1" height="3" />
                      <rect x="10" y="9" width="3" height="1" />
                      <rect x="14" y="8" width="2" height="2" />
                      <rect x="17" y="9" width="1" height="2" />
                      <rect x="19" y="8" width="3" height="1" />
                      <rect x="23" y="9" width="2" height="1" />
                      <rect x="26" y="8" width="3" height="1" />
                      <rect x="1" y="11" width="1" height="2" />
                      <rect x="3" y="12" width="3" height="1" />
                      <rect x="8" y="12" width="2" height="1" />
                      <rect x="11" y="11" width="2" height="2" />
                      <rect x="15" y="12" width="1" height="2" />
                      <rect x="18" y="11" width="3" height="1" />
                      <rect x="22" y="12" width="2" height="1" />
                      <rect x="25" y="11" width="2" height="2" />
                      <rect x="0" y="14" width="3" height="1" />
                      <rect x="4" y="15" width="2" height="1" />
                      <rect x="7" y="14" width="2" height="2" />
                      <rect x="10" y="14" width="1" height="3" />
                      <rect x="12" y="15" width="3" height="1" />
                      <rect x="16" y="14" width="2" height="1" />
                      <rect x="19" y="15" width="2" height="2" />
                      <rect x="22" y="14" width="1" height="3" />
                      <rect x="24" y="15" width="3" height="1" />
                      <rect x="28" y="14" width="1" height="3" />
                      <rect x="1" y="17" width="2" height="1" />
                      <rect x="4" y="18" width="1" height="2" />
                      <rect x="8" y="17" width="3" height="1" />
                      <rect x="13" y="18" width="2" height="1" />
                      <rect x="16" y="17" width="1" height="2" />
                      <rect x="18" y="18" width="3" height="1" />
                      <rect x="23" y="17" width="2" height="1" />
                      <rect x="26" y="18" width="2" height="2" />
                      <rect x="0" y="20" width="1" height="1" />
                      <rect x="8" y="20" width="2" height="2" />
                      <rect x="11" y="20" width="1" height="3" />
                      <rect x="13" y="21" width="3" height="1" />
                      <rect x="17" y="20" width="2" height="1" />
                      <rect x="26" y="21" width="3" height="1" />
                      <rect x="8" y="23" width="3" height="1" />
                      <rect x="12" y="24" width="2" height="2" />
                      <rect x="15" y="23" width="3" height="1" />
                      <rect x="19" y="24" width="1" height="3" />
                      <rect x="21" y="26" width="3" height="1" />
                      <rect x="25" y="24" width="2" height="2" />
                      <rect x="28" y="23" width="1" height="3" />
                      <rect x="8" y="26" width="1" height="3" />
                      <rect x="10" y="27" width="2" height="1" />
                      <rect x="15" y="26" width="2" height="2" />
                      <rect x="18" y="28" width="3" height="1" />
                      <rect x="26" y="27" width="3" height="2" />
                    </svg>
                  </div>

                  {/* Cursive Signature for Mr. Harsh Kumar */}
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-mono font-bold text-slate-500 block tracking-wider">Authorized Signature</span>
                    <span className="font-serif italic font-extrabold text-lg text-slate-900 block leading-tight tracking-wide border-b-2 border-[#c5a059]/60 pb-0.5 px-2">
                      Mr. Harsh Kumar
                    </span>
                    <span className="text-[8px] font-mono text-[#b45309] font-bold uppercase tracking-widest block pt-0.5">
                      Chief Academic Director
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Certificates;
