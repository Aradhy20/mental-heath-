'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  Brain, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  Activity, 
  MessageSquare, 
  ShieldAlert, 
  Smile, 
  Mic, 
  Video, 
  CheckCircle,
  Database,
  Lock,
  Layers,
  Zap,
  Check,
  Menu,
  X,
  Play,
  Pause,
  ChevronRight,
  TrendingUp,
  Volume2,
  Sun,
  Moon
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring' as const, 
      stiffness: 70, 
      damping: 15,
      duration: 0.8
    } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

// ── TOUR SIMULATORS ──

// 1. Webcam Face Analyzer Simulator
const FaceTrackerSimulator = () => {
  const { theme } = useTheme();
  const [emotion, setEmotion] = useState('Calm');
  const [dots, setDots] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
    // Generate static facial landmarks
    const landmarks = [];
    // Oval outline
    for(let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      landmarks.push({ x: 50 + Math.cos(angle) * 30, y: 50 + Math.sin(angle) * 38 });
    }
    // Eyes
    landmarks.push({ x: 40, y: 40 });
    landmarks.push({ x: 60, y: 40 });
    // Nose
    landmarks.push({ x: 50, y: 48 });
    landmarks.push({ x: 50, y: 56 });
    // Mouth
    landmarks.push({ x: 40, y: 66 });
    landmarks.push({ x: 45, y: 69 });
    landmarks.push({ x: 50, y: 70 });
    landmarks.push({ x: 55, y: 69 });
    landmarks.push({ x: 60, y: 66 });
    landmarks.push({ x: 50, y: 65 }); // inner mouth

    setDots(landmarks);

    const emotions = ['Calm', 'Focused', 'Empathetic', 'Happy', 'Relaxed'];
    const interval = setInterval(() => {
      setEmotion(prev => {
        const nextIdx = (emotions.indexOf(prev) + 1) % emotions.length;
        return emotions[nextIdx];
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[330px] rounded-2xl bg-[#E8E8F5]/40 dark:bg-slate-950/90 border border-[#1E1B4B]/10 dark:border-white/10 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
      {/* Top Bar */}
      <div className="flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">Live Camera Stream</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-brand-violet/20 border border-brand-purple/20 text-[9px] text-brand-purple font-mono font-bold">
          FPS: 30 · Latency: 12ms
        </div>
      </div>

      {/* Scan overlay grid */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: theme === 'light' ? 'radial-gradient(#1e1b4b 1px, transparent 1px)' : 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }} />
      </div>

      {/* Face Landmark Canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-48 h-48 text-brand-indigo/40">
          {/* Target bounds */}
          <rect x="15" y="8" width="70" height="84" rx="8" fill="none" stroke="#6366F1" strokeWidth="0.4" strokeDasharray="3,3" />
          <path d="M 15 20 L 15 8 L 27 8" fill="none" stroke="#6366F1" strokeWidth="0.8" />
          <path d="M 85 20 L 85 8 L 73 8" fill="none" stroke="#6366F1" strokeWidth="0.8" />
          <path d="M 15 80 L 15 92 L 27 92" fill="none" stroke="#6366F1" strokeWidth="0.8" />
          <path d="M 85 80 L 85 92 L 73 92" fill="none" stroke="#6366F1" strokeWidth="0.8" />

          {/* Landmarks dots */}
          {dots.map((dot, idx) => (
            <motion.circle 
              key={idx}
              cx={dot.x}
              cy={dot.y}
              r="0.9"
              fill="#8B5CF6"
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.4, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.2, 
                delay: (dot.x + dot.y) * 0.008 
              }}
            />
          ))}

          {/* Glowing Laser Scan Line */}
          <motion.line 
            x1="12" y1="12" x2="88" y2="12" 
            stroke="#14B8A6" strokeWidth="0.6" 
            animate={{ y1: [12, 88, 12], y2: [12, 88, 12] }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Telemetry Display */}
      <div className="z-10 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-[#1E1B4B]/5 dark:border-white/5 flex gap-4 items-center justify-between shadow-2xl">
        <div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">Classification</div>
          <div className="text-sm font-extrabold text-[#1E1B4B] dark:text-white flex items-center gap-1.5 mt-0.5">
            <Smile size={15} className="text-brand-teal" />
            <span>{emotion}</span>
          </div>
        </div>
        <div className="flex-1 max-w-[120px] flex flex-col gap-1">
          <div className="flex justify-between text-[8px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Accuracy</span>
            <span>99.2%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="bg-brand-teal h-full"
              initial={{ width: "80%" }}
              animate={{ width: emotion === 'Calm' ? '95%' : emotion === 'Focused' ? '88%' : '97%' }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Empathy CBT Voice Assistant Simulator
const VoiceChatSimulator = () => {
  const [activeStep, setActiveStep] = useState(0);

  const dialogue = [
    { speaker: 'user', text: "I've been feeling extremely stressed about this deadline..." },
    { speaker: 'assistant', text: "I hear you... that sounds heavy. Let's take a slow breath. I'm right here with you." },
    { speaker: 'user', text: "Thank you. It feels like if I fail, my whole career is in jeopardy." },
    { speaker: 'assistant', text: "It's natural to feel that weight. Let's look at the facts and untangle that thought together." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % dialogue.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[330px] rounded-2xl bg-[#E8E8F5]/40 dark:bg-slate-950/90 border border-[#1E1B4B]/10 dark:border-white/10 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
      {/* Waveform indicator */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-brand-purple animate-pulse" />
          <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">Therapist Voice Engine</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
          Voice Model: Sarah
        </span>
      </div>

      {/* Message Area */}
      <div className="flex-1 my-4 flex flex-col gap-3 overflow-y-auto scrollbar-none justify-center">
        <AnimatePresence mode="popLayout">
          {dialogue.slice(0, activeStep + 1).map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 100, damping: 14 }}
              className={`flex flex-col max-w-[85%] ${msg.speaker === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <div className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                msg.speaker === 'user' 
                  ? 'bg-gradient-to-r from-brand-indigo to-brand-violet text-white rounded-tr-none shadow-[0_4px_12px_rgba(99,102,241,0.25)]' 
                  : 'bg-[#1E1B4B]/5 dark:bg-white/10 text-[#1E1B4B] dark:text-[#eeeef5] border border-[#1E1B4B]/5 dark:border-white/5 rounded-tl-none backdrop-blur-md'
              }`}>
                {msg.text}
              </div>
              <span className="text-[8px] text-slate-500 mt-1 uppercase font-bold tracking-wider px-1">
                {msg.speaker === 'user' ? 'You' : 'MindfulAI'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Voice wave pulsing bar */}
      <div className="h-10 border-t border-white/5 flex items-center justify-center gap-1.5 pt-2">
        {[...Array(16)].map((_, i) => (
          <motion.div 
            key={i}
            className="w-1 bg-brand-purple rounded-full"
            initial={{ height: 4 }}
            animate={{ 
              height: activeStep % 2 === 1 
                ? [4, Math.random() * 26 + 6, 4] 
                : [4, Math.random() * 8 + 4, 4] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.1, 
              delay: i * 0.04 
            }}
          />
        ))}
      </div>
    </div>
  );
};

// 3. Somatic Vagus Breathing Guide
const BreathingSimulator = () => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [counter, setCounter] = useState(4);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 4;
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 4;
          } else {
            setPhase('Inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isPaused]);

  return (
    <div className="relative w-full h-[330px] rounded-2xl bg-[#E8E8F5]/40 dark:bg-slate-950/90 border border-[#1E1B4B]/10 dark:border-white/10 overflow-hidden flex flex-col justify-between p-4 shadow-inner">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Heart size={15} className="text-brand-rose" />
          <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 dark:text-slate-400">Vagus Somatic Guide</span>
        </div>
        <button 
          onClick={() => setIsPaused(!isPaused)} 
          className="p-1.5 rounded-full bg-[#1E1B4B]/5 dark:bg-white/5 border border-[#1E1B4B]/10 dark:border-white/10 text-[#1E1B4B] dark:text-white transition active:scale-95 flex items-center justify-center"
        >
          {isPaused ? <Play size={9} /> : <Pause size={9} />}
        </button>
      </div>

      {/* Breathing Bubble */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <motion.div 
          className="absolute w-36 h-36 rounded-full bg-brand-teal/20 filter blur-xl pointer-events-none"
          animate={{
            scale: phase === 'Inhale' ? 1.45 : phase === 'Hold' ? 1.45 : 1.0,
            opacity: phase === 'Hold' ? 0.75 : 0.35
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />

        <motion.div 
          className="w-28 h-28 rounded-full border-2 border-brand-teal flex flex-col items-center justify-center bg-brand-teal/10 shadow-[0_0_40px_rgba(20,184,166,0.25)] z-10"
          animate={{
            scale: phase === 'Inhale' ? 1.3 : phase === 'Hold' ? 1.3 : 1.0,
            borderColor: phase === 'Hold' ? '#8B5CF6' : '#14B8A6',
            boxShadow: phase === 'Hold' 
              ? '0 0 40px rgba(139,92,246,0.35)' 
              : '0 0 40px rgba(20,184,166,0.25)'
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
        >
          <motion.span 
            className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-200"
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {phase}
          </motion.span>
          <span className="text-2xl font-black font-mono text-[#1E1B4B] dark:text-white mt-1.5">
            {counter}s
          </span>
        </motion.div>

        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-6 text-center max-w-[200px] leading-relaxed">
          {phase === 'Inhale' && 'Slowly breathe in, expanding your lungs.'}
          {phase === 'Hold' && 'Hold gently. Release tension in your neck.'}
          {phase === 'Exhale' && 'Release slowly. Let all stressors melt away.'}
        </p>
      </div>

      <div className="flex gap-2 justify-center items-center h-4">
        <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${phase === 'Inhale' ? 'bg-brand-teal scale-125' : 'bg-slate-300 dark:bg-slate-800'}`} />
        <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${phase === 'Hold' ? 'bg-brand-purple scale-125' : 'bg-slate-300 dark:bg-slate-800'}`} />
        <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${phase === 'Exhale' ? 'bg-brand-teal scale-125' : 'bg-slate-300 dark:bg-slate-800'}`} />
      </div>
    </div>
  );
};

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'biometrics' | 'chat' | 'insights'>('biometrics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#F5F5FA] dark:bg-[#080816] text-[#1E1B4B] dark:text-[#eeeef5] min-h-screen font-sans overflow-x-hidden selection:bg-brand-violet/30 selection:text-white relative transition-colors duration-300">
      
      {/* Floating Space Ambient Glowing Orbs */}
      <div className="absolute top-[-10vw] left-[5vw] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-brand-indigo/8 dark:from-brand-indigo/15 to-transparent filter blur-[120px] z-0 pointer-events-none" />
      <div className="absolute top-[30vw] right-[-10vw] w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-brand-rose/5 dark:from-brand-rose/8 via-brand-purple/3 dark:via-brand-purple/5 to-transparent filter blur-[140px] z-0 pointer-events-none" />
      <div className="absolute bottom-[10vw] left-[-5vw] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-brand-teal/5 dark:from-brand-teal/8 to-transparent filter blur-[110px] z-0 pointer-events-none" />

      {/* ── STICKY GLASSMORPHIC NAVBAR ── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 py-4 flex items-center justify-between border-b ${
          scrolled 
            ? 'bg-[#F5F5FA]/75 dark:bg-[#080816]/75 backdrop-blur-xl border-[#1E1B4B]/[0.08] dark:border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]' 
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/10 relative overflow-hidden group">
            <Brain size={18} className="text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-black text-xl tracking-tight text-[#1E1B4B] dark:text-white">
            Mindful<span className="bg-gradient-to-r from-brand-purple to-brand-rose bg-clip-text text-transparent">AI</span>
          </span>
        </div>

        {/* Desktop Nav links */}
        <div className="hidden md:flex gap-8 items-center">
          {['features', 'demo', 'architecture'].map((section) => (
            <a 
              key={section}
              href={`#${section}`} 
              className="text-xs font-black uppercase tracking-widest text-[#6B7280] dark:text-[#8888aa] hover:text-[#1E1B4B] dark:hover:text-white transition duration-200"
            >
              {section}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          {mounted ? (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-[#1E1B4B]/5 dark:bg-white/5 border border-[#1E1B4B]/10 dark:border-white/10 hover:bg-[#1E1B4B]/10 dark:hover:bg-white/10 text-[#1E1B4B] dark:text-white transition-all duration-200 flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#1E1B4B]/5 dark:bg-white/5 border border-[#1E1B4B]/10 dark:border-white/10" />
          )}

          <Link 
            href="/auth" 
            className="hidden sm:inline-flex items-center justify-center text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-btn hover:shadow-[0_8px_28px_rgba(124,58,237,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition duration-200"
          >
            Launch App
          </Link>

          {/* Mobile menu trigger button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#1E1B4B]/5 dark:bg-white/5 border border-[#1E1B4B]/10 dark:border-white/10 md:hidden hover:bg-[#1E1B4B]/10 dark:hover:bg-white/10 transition text-[#1E1B4B] dark:text-white"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer links */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[70px] left-0 right-0 z-40 bg-[#F5F5FA]/95 dark:bg-[#080816]/95 border-b border-[#1E1B4B]/[0.08] dark:border-white/[0.08] backdrop-blur-2xl flex flex-col p-6 gap-4 md:hidden shadow-2xl"
          >
            {['features', 'demo', 'architecture'].map((section) => (
              <a 
                key={section}
                href={`#${section}`} 
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-black uppercase tracking-widest py-2 border-b border-[#1E1B4B]/5 dark:border-white/5 text-[#6B7280] dark:text-[#8888aa] hover:text-[#1E1B4B] dark:hover:text-white"
              >
                {section}
              </a>
            ))}
            
            {/* Mobile Theme Toggle Row */}
            <div className="flex items-center justify-between py-2 border-b border-[#1E1B4B]/5 dark:border-white/5">
              <span className="text-xs font-black uppercase tracking-widest text-[#6B7280] dark:text-[#8888aa]">Theme</span>
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full bg-[#1E1B4B]/5 dark:bg-white/5 border border-[#1E1B4B]/10 dark:border-white/10 text-[#1E1B4B] dark:text-white transition-all duration-200"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              )}
            </div>

            <Link 
              href="/auth" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 rounded-full bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-black uppercase tracking-widest shadow-btn"
            >
              Launch Dashboard
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        
        {/* Subtle grid background to overlay details */}
        <div className="absolute inset-0 z-[-1] opacity-[0.3] dark:opacity-[0.04] pointer-events-none transition-opacity duration-300" style={{
          backgroundImage: mounted && theme === 'light' 
            ? 'radial-gradient(rgba(30, 27, 75, 0.08) 1px, transparent 1px)' 
            : 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="lg:col-span-6 flex flex-col items-center lg:items-start max-w-2xl"
        >
          {/* Announcement Badge */}
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-indigo/8 border border-brand-purple/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] mb-8"
          >
            <Sparkles size={12} className="text-brand-purple animate-pulse" />
            <span className="text-[10px] font-black text-brand-purple uppercase tracking-widest">
              Multimodal Emotional AI Suite
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-[#1E1B4B] dark:text-white mb-6 text-center lg:text-left"
          >
            Empathy-Driven Tech for <br className="lg:hidden" />
            <span className="bg-gradient-to-r from-brand-purple via-brand-rose to-brand-indigo bg-clip-text text-transparent relative">
              Mental Resilience
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={fadeInUp}
            className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mb-10 text-center lg:text-left"
          >
            MindfulAI fuses real-time facial analytics, vocal-tone inference, and clinical CBT models to map emotional patterns and guide your path to self-improvement.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 mb-8 lg:mb-0"
          >
            <Link 
              href="/auth" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-sm font-black uppercase tracking-widest shadow-btn hover:shadow-[0_8px_32px_rgba(124,58,237,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition duration-200"
            >
              Launch Dashboard <ArrowRight size={16} />
            </Link>
            <Link 
              href="/auth" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#1E1B4B]/5 dark:bg-white/5 border border-[#1E1B4B]/10 dark:border-white/10 hover:bg-[#1E1B4B]/10 dark:hover:bg-white/10 text-[#1E1B4B] dark:text-white text-sm font-black uppercase tracking-widest transition duration-200"
            >
              Demo Access
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Visual Mockup Container */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 w-full relative mt-4 lg:mt-0"
        >
          {/* Ambient light glow behind mockup */}
          <div className="absolute inset-0 bg-brand-indigo/10 filter blur-3xl rounded-3xl pointer-events-none scale-90 z-[-1]" />
          
          {/* Mock Browser Frame */}
          <div className="relative rounded-2xl border border-[#1E1B4B]/[0.08] dark:border-white/[0.08] bg-[#F5F5FA]/80 dark:bg-slate-950/80 shadow-[0_32px_96px_rgba(99,102,241,0.15)] dark:shadow-[0_32px_96px_rgba(99,102,241,0.25)] backdrop-blur-xl overflow-hidden p-1.5">
            {/* Header dots */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E1B4B]/5 dark:border-white/5 bg-[#E8E8F5]/40 dark:bg-slate-900/40">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 max-w-xs md:max-w-md mx-4">
                <div className="bg-[#E8E8F5] dark:bg-[#0b0a1a] rounded-md py-1 text-[10px] text-slate-500 dark:text-slate-500 text-center border border-[#1E1B4B]/5 dark:border-white/5 truncate font-mono">
                  https://mindfulai.com/dashboard
                </div>
              </div>
              <div className="w-12" />
            </div>

            {/* Inner Image */}
            <div className="relative overflow-hidden rounded-b-xl h-[320px] sm:h-[400px] md:h-[480px]">
              <img 
                src="/mindfulness_hero.png" 
                alt="MindfulAI App Interface" 
                className="w-full h-full object-cover object-top rounded-b-xl block"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F5F5FA]/70 dark:from-[#080816]/70 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Floating Widget 1: Vocal Monitor */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="hidden lg:flex absolute -left-12 top-[15%] bg-white/95 dark:bg-slate-950/90 border border-[#1E1B4B]/10 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] items-center gap-3 max-w-[210px] z-20"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-purple/10 dark:bg-brand-purple/20 border border-brand-purple/20 dark:border-brand-purple/30 flex items-center justify-center text-brand-purple animate-pulse">
              <Mic size={16} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Audio Copilot</div>
              <div className="text-xs font-bold text-[#1E1B4B] dark:text-white mt-0.5">Sarah (Female)</div>
              <div className="text-[9px] text-[#34D399] flex items-center gap-1 mt-1 font-mono">
                <CheckCircle size={10} /> Active Tone
              </div>
            </div>
          </motion.div>

          {/* Floating Widget 2: Mood Radar */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.5 }}
            className="hidden lg:flex absolute -right-16 top-[45%] bg-white/95 dark:bg-slate-950/90 border border-[#1E1B4B]/10 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex-col gap-2 max-w-[190px] z-20"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Emotion Radar</span>
              <span className="text-xs font-black text-brand-teal">85%</span>
            </div>
            <div className="flex items-center gap-2">
              <Smile size={16} className="text-brand-teal" />
              <span className="text-xs font-bold text-[#1E1B4B] dark:text-white">Calm & Focused</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="w-[85%] bg-brand-teal h-full" />
            </div>
          </motion.div>

          {/* Floating Widget 3: Streak Tracker */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.2 }}
            className="hidden lg:flex absolute left-[10%] -bottom-8 bg-white/95 dark:bg-slate-950/90 border border-[#1E1B4B]/10 dark:border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] items-center gap-3 z-20"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-rose/10 dark:bg-brand-rose/20 border border-brand-rose/20 dark:border-brand-rose/30 flex items-center justify-center text-brand-rose">
              <Heart size={16} />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">CBT Challenge</div>
              <div className="text-xs font-bold text-[#1E1B4B] dark:text-white mt-0.5">5 Day Streak Active</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── CORE COMPONENT FEATURES GRID ── */}
      <section id="features" className="py-24 border-t border-[#1E1B4B]/[0.04] dark:border-white/[0.04] bg-[#E8E8F5]/30 dark:bg-[#090816]/40 relative z-10 px-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-purple">Clinical Strength</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E1B4B] dark:text-white mt-2 mb-4 leading-tight">
              Premium Multimodal Diagnostics
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Four specialized systems designed to monitor wellness indicators, provide therapeutic dialogue, and secure clinical coordinates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-[#1E1B4B]/[0.06] dark:border-white/[0.06] bg-[#1E1B4B]/[0.01] dark:bg-white/[0.01] p-6 hover:bg-[#1E1B4B]/[0.03] dark:hover:bg-white/[0.03] hover:border-brand-indigo/35 hover:-translate-y-1.5 transition-all duration-300 shadow-xl hover:shadow-[0_20px_40px_rgba(99,102,241,0.06)]">
              <div className="w-11 h-11 rounded-xl bg-brand-indigo/10 flex items-center justify-center mb-5 text-brand-indigo border border-brand-indigo/20 group-hover:scale-105 transition-transform">
                <Video size={20} />
              </div>
              <h3 className="text-sm font-black text-[#1E1B4B] dark:text-white uppercase tracking-wider mb-2">Webcam Face Analyzer</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Processes frames via a local convolutional model to predict primary micro-expressions (happy, sad, neutral, angry, surprised).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-[#1E1B4B]/[0.06] dark:border-white/[0.06] bg-[#1E1B4B]/[0.01] dark:bg-white/[0.01] p-6 hover:bg-[#1E1B4B]/[0.03] dark:hover:bg-white/[0.03] hover:border-brand-indigo/35 hover:-translate-y-1.5 transition-all duration-300 shadow-xl hover:shadow-[0_20px_40px_rgba(99,102,241,0.06)]">
              <div className="w-11 h-11 rounded-xl bg-brand-indigo/10 flex items-center justify-center mb-5 text-brand-indigo border border-brand-indigo/20 group-hover:scale-105 transition-transform">
                <Mic size={20} />
              </div>
              <h3 className="text-sm font-black text-[#1E1B4B] dark:text-white uppercase tracking-wider mb-2">Voice Speech Engine</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Streams vocal signals to process tone shifts. Re-synthesizes spoken therapist audio dynamically with natural inflection.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-[#1E1B4B]/[0.06] dark:border-white/[0.06] bg-[#1E1B4B]/[0.01] dark:bg-white/[0.01] p-6 hover:bg-[#1E1B4B]/[0.03] dark:hover:bg-white/[0.03] hover:border-brand-indigo/35 hover:-translate-y-1.5 transition-all duration-300 shadow-xl hover:shadow-[0_20px_40px_rgba(99,102,241,0.06)]">
              <div className="w-11 h-11 rounded-xl bg-brand-indigo/10 flex items-center justify-center mb-5 text-brand-indigo border border-brand-indigo/20 group-hover:scale-105 transition-transform">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-sm font-black text-[#1E1B4B] dark:text-white uppercase tracking-wider mb-2">Parallel Chat Coaches</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Engage in specialized CBT workflows with distinct agents backed by vector context and persistent memory banks.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-[#1E1B4B]/[0.06] dark:border-white/[0.06] bg-[#1E1B4B]/[0.01] dark:bg-white/[0.01] p-6 hover:bg-[#1E1B4B]/[0.03] dark:hover:bg-white/[0.03] hover:border-brand-rose/35 hover:-translate-y-1.5 transition-all duration-300 shadow-xl hover:shadow-[0_20px_40px_rgba(239,68,68,0.04)]">
              <div className="w-11 h-11 rounded-xl bg-brand-rose/10 flex items-center justify-center mb-5 text-brand-rose border border-brand-rose/20 group-hover:scale-105 transition-transform">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-sm font-black text-[#1E1B4B] dark:text-white uppercase tracking-wider mb-2">Crisis Guardrails</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automated risk classification checks for emotional vulnerability indicators and embeds local support coordinates instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE LIVE TOUR ── */}
      <section id="demo" className="py-24 bg-[#F5F5FA]/90 dark:bg-[#05040f]/90 relative z-10 px-6 border-t border-[#1E1B4B]/[0.04] dark:border-white/[0.04] transition-colors duration-300">
        <div className="max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side selectors */}
            <div className="lg:col-span-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-purple">Interactive Tour</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E1B4B] dark:text-white mt-2 mb-6 leading-tight">
                Explore the Core Features
              </h2>
              
              <div className="flex flex-col gap-3">
                {/* Option 1 */}
                <button
                  onClick={() => setActiveTab('biometrics')}
                  className={`text-left p-4 rounded-xl border transition-all duration-300 flex flex-col gap-1 relative overflow-hidden group ${
                    activeTab === 'biometrics' 
                      ? 'bg-[#1E1B4B]/[0.03] dark:bg-white/[0.03] border-[#1E1B4B]/30 dark:border-brand-indigo/30' 
                      : 'bg-transparent border-transparent hover:bg-[#1E1B4B]/[0.01] dark:hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 z-10">
                    <span className={`text-[10px] font-black tracking-wider uppercase ${activeTab === 'biometrics' ? 'text-brand-indigo' : 'text-slate-500'}`}>01.</span>
                    <h4 className={`text-xs font-black uppercase tracking-widest ${activeTab === 'biometrics' ? 'text-[#1E1B4B] dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      Emotion Profiler
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 z-10 pl-6 leading-relaxed">
                    Predict facial expressions and audio valence in real-time using neural network grids.
                  </p>
                </button>

                {/* Option 2 */}
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`text-left p-4 rounded-xl border transition-all duration-300 flex flex-col gap-1 relative overflow-hidden group ${
                    activeTab === 'chat' 
                      ? 'bg-[#1E1B4B]/[0.03] dark:bg-white/[0.03] border-[#1E1B4B]/30 dark:border-brand-indigo/30' 
                      : 'bg-transparent border-transparent hover:bg-[#1E1B4B]/[0.01] dark:hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 z-10">
                    <span className={`text-[10px] font-black tracking-wider uppercase ${activeTab === 'chat' ? 'text-brand-indigo' : 'text-slate-500'}`}>02.</span>
                    <h4 className={`text-xs font-black uppercase tracking-widest ${activeTab === 'chat' ? 'text-[#1E1B4B] dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      CBT Speech Coaches
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 z-10 pl-6 leading-relaxed">
                    Discuss issues with customized cognitive therapists speaking with premium inflection.
                  </p>
                </button>

                {/* Option 3 */}
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`text-left p-4 rounded-xl border transition-all duration-300 flex flex-col gap-1 relative overflow-hidden group ${
                    activeTab === 'insights' 
                      ? 'bg-[#1E1B4B]/[0.03] dark:bg-white/[0.03] border-[#1E1B4B]/30 dark:border-brand-indigo/30' 
                      : 'bg-transparent border-transparent hover:bg-[#1E1B4B]/[0.01] dark:hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 z-10">
                    <span className={`text-[10px] font-black tracking-wider uppercase ${activeTab === 'insights' ? 'text-brand-indigo' : 'text-slate-500'}`}>03.</span>
                    <h4 className={`text-xs font-black uppercase tracking-widest ${activeTab === 'insights' ? 'text-[#1E1B4B] dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      Vagus Breathing Somatics
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 z-10 pl-6 leading-relaxed">
                    Access somatic breathing patterns built to trigger acute nervous de-escalation instantly.
                  </p>
                </button>
              </div>
            </div>

            {/* Right side live widget preview */}
            <div className="lg:col-span-7">
              <div className="bg-white/60 dark:bg-slate-900/40 border border-[#1E1B4B]/[0.08] dark:border-white/[0.08] rounded-3xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
                
                {/* Glow ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-brand-indigo/10 filter blur-3xl pointer-events-none z-0" />
                
                <div className="relative z-10">
                  <AnimatePresence mode="wait">
                    {activeTab === 'biometrics' && (
                      <motion.div
                        key="biometrics"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaceTrackerSimulator />
                        <div className="mt-6 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1.5" />
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Optical flow metrics extract 478 face coordinate landmarks directly on the client, classifying micro-expressions locally to safeguard biometric data.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'chat' && (
                      <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <VoiceChatSimulator />
                        <div className="mt-6 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-1.5" />
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Conversational dialogue is mapped via LLMs with vector context retrieval. Text is converted to speech dynamically using ElevenLabs voices with Hindi and English capability.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'insights' && (
                      <motion.div
                        key="insights"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <BreathingSimulator />
                        <div className="mt-6 flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-1.5" />
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Somatic deep breathing exercises guide parasympathetic activation. Toggle play/pause anytime to engage in the 4-4-4 chest expansion rhythm.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── TECHNOLOGY & INTEGRITY SECTION ── */}
      <section id="architecture" className="py-24 border-t border-[#1E1B4B]/[0.04] dark:border-white/[0.04] bg-[#E8E8F5]/30 dark:bg-[#090816]/40 relative z-10 px-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-purple">System Architecture</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1E1B4B] dark:text-white mt-2 mb-4 leading-tight">
              Scientific Integrity & Tech Stack
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Secure identity structures built on performant engines and state-of-the-art weights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* System 1 */}
            <div className="rounded-2xl border border-[#1E1B4B]/[0.05] dark:border-white/[0.05] bg-[#1E1B4B]/[0.01] dark:bg-white/[0.01] p-8 flex flex-col gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
                <Layers size={18} />
              </div>
              <h4 className="text-sm font-black text-[#1E1B4B] dark:text-white uppercase tracking-wider">Clinical Classification</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Runs fine-tuned local classifiers to run sentiment and risk analysis checks on inputs to guarantee rapid emergency identification.
              </p>
            </div>

            {/* System 2 */}
            <div className="rounded-2xl border border-[#1E1B4B]/[0.05] dark:border-white/[0.05] bg-[#1E1B4B]/[0.01] dark:bg-white/[0.01] p-8 flex flex-col gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
                <Database size={18} />
              </div>
              <h4 className="text-sm font-black text-[#1E1B4B] dark:text-white uppercase tracking-wider">High Performance Data</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Saves logs, notes, profiles, and activities inside a secure relational SQL database layer supporting real-time transactions.
              </p>
            </div>

            {/* System 3 */}
            <div className="rounded-2xl border border-[#1E1B4B]/[0.05] dark:border-white/[0.05] bg-[#1E1B4B]/[0.01] dark:bg-white/[0.01] p-8 flex flex-col gap-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
                <Lock size={18} />
              </div>
              <h4 className="text-sm font-black text-[#1E1B4B] dark:text-white uppercase tracking-wider">Strict Privacy Guard</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Authenticates via robust cryptographic JSON web tokens. No raw webcam recordings are persisted on external server machines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1E1B4B]/[0.04] dark:border-white/[0.04] py-16 bg-[#E8E8F5] dark:bg-[#04030a] relative z-10 px-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8 text-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-[#1E1B4B] dark:text-white">MindfulAI</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {['Privacy Policy', 'Terms of Service', 'Support Desk', 'Clinical Resource Guides'].map((link) => (
              <a key={link} href="#" className="text-[11px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-500 hover:text-[#1E1B4B] dark:hover:text-slate-300 transition">
                {link}
              </a>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-600 max-w-xl leading-relaxed">
            © 2026 MindfulAI Systems. Clinically-informed mental wellness intelligence tools. Not a substitute for professional medical care, diagnosis, or crisis therapy.
          </p>
        </div>
      </footer>

    </div>
  );
}
