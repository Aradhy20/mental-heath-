'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { X, MessageCircle, Heart, Sparkles, Smile, Play, RefreshCw, Volume2 } from 'lucide-react';

interface AICompanionProps {
  mode?: 'floating' | 'widget' | 'chat-sidekick';
  size?: number;
}

export default function AICompanion({ mode = 'floating', size = 80 }: AICompanionProps) {
  const pathname = usePathname();
  const { user, lastMood, messages } = useStore();
  
  // Companion states
  const [isMinimized, setIsMinimized] = useState(false);
  const [emotion, setEmotion] = useState<'neutral' | 'happy' | 'sad' | 'anxious'>('neutral');
  const [bubbleText, setBubbleText] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [breathingState, setBreathingState] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathingCount, setBreathingCount] = useState(4);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync emotion state based on store context
  useEffect(() => {
    // Determine active emotion
    // 1. Check last chat message emotion
    const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1] : null;
    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.emotion) {
      const emo = lastMsg.emotion.toLowerCase();
      if (emo.includes('happy') || emo.includes('joy')) setEmotion('happy');
      else if (emo.includes('sad') || emo.includes('depress')) setEmotion('sad');
      else if (emo.includes('anxious') || emo.includes('scared') || emo.includes('worry')) setEmotion('anxious');
      else setEmotion('neutral');
      return;
    }

    // 2. Fallback to check-in mood score
    if (lastMood) {
      if (lastMood.score >= 4) setEmotion('happy');
      else if (lastMood.score === 3) setEmotion('neutral');
      else if (lastMood.score === 2) setEmotion('anxious');
      else if (lastMood.score === 1) setEmotion('sad');
    }
  }, [lastMood, messages]);

  // Context-aware speech trigger when paths/emotions change
  useEffect(() => {
    if (breathingState !== 'idle') return; // Don't interrupt breathing guide

    let greeting = `Hello, ${user?.name?.split(' ')[0] || 'friend'}! I'm Lumi, your wellness companion. 💜`;
    
    // Path prompts
    if (pathname.includes('/journal')) {
      greeting = "Writing down thoughts can bring so much clarity. Would you like to try a short breathing exercise before you start? 📝";
    } else if (pathname.includes('/chat')) {
      greeting = "I'll be right here supporting you. Feel free to express whatever is on your mind. 🌸";
    } else if (pathname.includes('/insights')) {
      greeting = "Your journey shows real strength. Every small step forward is worth celebrating! 📊";
    } else if (pathname.includes('/nearby')) {
      greeting = "If you ever need a little extra support, these nearby centers can help. You are never alone. 🤝";
    } else if (pathname.includes('/face-tracker')) {
      greeting = "Let's explore your facial emotions together. Whenever you're ready! 📷";
    } else if (pathname.includes('/settings')) {
      greeting = "Need to adjust anything? Customize your profile to make this space feel like home. ⚙️";
    } else {
      // Mood specific greeting
      if (emotion === 'happy') {
        greeting = "Your positive energy is wonderful! I'm so glad you're feeling good today. 😄✨";
      } else if (emotion === 'sad') {
        greeting = "I can feel you're carrying a heavy heart. I'm right here with you, and it's okay to rest. 💙";
      } else if (emotion === 'anxious') {
        greeting = "Things might feel overwhelming right now. Let's take a slow breath together. 🌬️";
      }
    }

    setBubbleText(greeting);
    setShowBubble(true);

    // Auto-dismiss bubble after 10 seconds to not be distracting in floating mode
    if (mode === 'floating') {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowBubble(false), 9000);
    }
  }, [pathname, emotion, user, mode, breathingState]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, []);

  // Breathing Cycle Logic
  const startBreathing = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowBubble(true);
    setBreathingState('inhale');
    setBreathingCount(4);
  };

  useEffect(() => {
    if (breathingState === 'idle') return;

    // Breathing phase duration manager
    if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    
    setBreathingCount(4);
    let count = 4;
    
    breathingIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        if (breathingState === 'inhale') {
          setBreathingState('hold');
          count = 4;
        } else if (breathingState === 'hold') {
          setBreathingState('exhale');
          count = 4;
        } else if (breathingState === 'exhale') {
          // Loop or complete
          setBreathingState('idle');
          setBubbleText("Wonderful job. How do you feel now? 🧘‍♂️✨");
          if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
          return;
        }
      }
      setBreathingCount(count);
    }, 1000);

    return () => {
      if (breathingIntervalRef.current) clearInterval(breathingIntervalRef.current);
    };
  }, [breathingState]);

  // Handle breathing bubble copy
  const getBreathingText = () => {
    switch (breathingState) {
      case 'inhale':
        return `Breath In... Fill your lungs 🌬️ (${breathingCount}s)`;
      case 'hold':
        return `Pause... Feel the calm 🌸 (${breathingCount}s)`;
      case 'exhale':
        return `Exhale... Release all tension 🍃 (${breathingCount}s)`;
      default:
        return bubbleText;
    }
  };

  // SVG Facial Path Configurations for Dynamic Morphing
  const getMouthPath = () => {
    if (breathingState !== 'idle') {
      // Circular O mouth for breathing
      return 'M 35 60 Q 50 68 65 60 Q 50 56 35 60'; 
    }
    switch (emotion) {
      case 'happy':
        // Big smile
        return 'M 35 56 Q 50 72 65 56 Q 50 58 35 56';
      case 'sad':
        // Frown
        return 'M 38 64 Q 50 54 62 64';
      case 'anxious':
        // Wavy concerned line
        return 'M 37 60 Q 43 56 50 60 Q 57 64 63 60';
      default:
        // Soft happy smile
        return 'M 38 58 Q 50 66 62 58';
    }
  };

  const getEyebrows = () => {
    switch (emotion) {
      case 'happy':
        return {
          left: 'M 24 32 Q 32 26 40 31',
          right: 'M 60 31 Q 68 26 76 32'
        };
      case 'sad':
        // Slanted downwards to outer corners (concerned/empathy)
        return {
          left: 'M 26 28 Q 33 33 40 33',
          right: 'M 60 33 Q 67 33 74 28'
        };
      case 'anxious':
        // Slanted upwards in center (worried)
        return {
          left: 'M 25 33 Q 32 28 39 25',
          right: 'M 61 25 Q 68 28 75 33'
        };
      default:
        // Straight soft
        return {
          left: 'M 25 29 Q 32 27 39 29',
          right: 'M 61 29 Q 68 27 75 29'
        };
    }
  };

  // Aura colors based on emotions
  const getAuraColor = () => {
    if (breathingState === 'inhale') return 'rgba(52, 211, 153, 0.4)'; // Emerald
    if (breathingState === 'hold') return 'rgba(96, 165, 250, 0.4)';   // Blue
    if (breathingState === 'exhale') return 'rgba(129, 140, 248, 0.4)'; // Indigo
    
    switch (emotion) {
      case 'happy':
        return 'rgba(251, 191, 36, 0.35)'; // Amber/Gold
      case 'sad':
        return 'rgba(59, 130, 246, 0.3)';  // Royal Blue
      case 'anxious':
        return 'rgba(16, 185, 129, 0.3)';  // Emerald / Calming Green
      default:
        return 'rgba(124, 58, 237, 0.25)'; // Purple/Lavender
    }
  };

  // Animate body scale for breathing guide
  const getBodyScale = () => {
    if (breathingState === 'inhale') return 1.25;
    if (breathingState === 'hold') return 1.25;
    if (breathingState === 'exhale') return 0.85;
    return 1;
  };

  // RENDER MINIMIZED FLOATING ORB
  if (mode === 'floating' && isMinimized) {
    return (
      <motion.button 
        onClick={() => { setIsMinimized(false); setShowBubble(true); }}
        whileHover={{ scale: 1.1, y: -3 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'var(--glass-bg)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.25)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <motion.div 
          animate={{ scale: [1, 1.15, 1] }} 
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 14, height: 14, borderRadius: '50%', background: '#7C3AED', boxShadow: '0 0 10px #7C3AED' }} 
        />
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#7C3AED', marginLeft: 4, marginRight: 8 }}>Lumi</span>
      </motion.button>
    );
  }

  // RENDER COMPANION (FLOATING, WIDGET, OR SIDEKICK)
  return (
    <div style={
      mode === 'floating' 
        ? { position: 'fixed', bottom: '24px', right: '24px', zIndex: 9998, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' } 
        : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem', width: '100%', padding: '1.25rem', borderRadius: 20, background: 'var(--glass-bg)', border: '1px solid rgba(124, 58, 237, 0.08)', position: 'relative' }
    }>
      
      {/* Speech Bubble / Interface */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{
              padding: '0.85rem 1.15rem',
              borderRadius: 18,
              background: '#FFFFFF',
              border: '1px solid rgba(124, 58, 237, 0.12)',
              boxShadow: '0 10px 30px rgba(124, 58, 237, 0.08)',
              color: '#1E1B4B',
              fontSize: '0.85rem',
              fontWeight: 500,
              maxWidth: mode === 'floating' ? 280 : '100%',
              lineHeight: 1.4,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {/* Close Button for floating mode */}
            {mode === 'floating' && (
              <button 
                onClick={() => setShowBubble(false)}
                style={{ position: 'absolute', top: 6, right: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--on-surface-muted)', display: 'flex', padding: 2 }}
              >
                <X size={12} />
              </button>
            )}

            <p style={{ margin: 0, paddingRight: mode === 'floating' ? '12px' : 0 }}>
              {getBreathingText()}
            </p>

            {/* Quick Actions inside Bubble */}
            {breathingState === 'idle' && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: 4 }}>
                <button 
                  onClick={startBreathing}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.55rem', borderRadius: 8, border: 'none', background: 'rgba(16, 185, 129, 0.08)', color: '#10B981', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'}
                >
                  <Play size={10} fill="#10B981" /> Breathe
                </button>
                
                {mode === 'floating' && (
                  <button 
                    onClick={() => { setIsMinimized(true); }}
                    style={{
                      padding: '0.25rem 0.55rem', borderRadius: 8, border: 'none', background: 'rgba(124, 58, 237, 0.06)', color: '#7C3AED', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Minimize
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Avatar Drawing Container */}
      <div 
        onClick={() => { if (!showBubble) setShowBubble(true); }}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <motion.div
          animate={{ 
            y: breathingState === 'idle' ? [0, -6, 0] : 0,
            scale: getBodyScale() 
          }}
          transition={
            breathingState === 'idle' 
              ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 4, ease: 'easeInOut' }
          }
          style={{
            width: size,
            height: size,
            position: 'relative',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Pulsing Aura */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              borderRadius: '50%',
              background: getAuraColor(),
              filter: 'blur(10px)',
              zIndex: 1,
              transition: 'background 0.5s ease',
            }}
          />

          {/* SVG Character Graphics */}
          <svg 
            viewBox="0 0 100 100" 
            style={{ width: '100%', height: '100%', zIndex: 2, filter: 'drop-shadow(0 8px 16px rgba(124, 58, 237, 0.15))' }}
          >
            {/* Ambient Shadow */}
            <ellipse cx="50" cy="90" rx="30" ry="6" fill="rgba(0,0,0,0.06)" />

            {/* Lumi Core Body */}
            <defs>
              <linearGradient id="lumiBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EEF2FF" />
                <stop offset="60%" stopColor="#E0E7FF" />
                <stop offset="100%" stopColor="#C7D2FE" />
              </linearGradient>
            </defs>
            {/* Blob shape */}
            <path 
              d="M 25 50 C 25 30, 40 22, 50 22 C 60 22, 75 30, 75 50 C 75 70, 62 78, 50 78 C 38 78, 25 70, 25 50 Z" 
              fill="url(#lumiBodyGrad)" 
            />

            {/* Cheeks blush (interactive) */}
            <motion.circle 
              cx="31" 
              cy="53" 
              r="5" 
              fill="#F472B6" 
              animate={{ opacity: emotion === 'happy' ? 0.65 : 0.2 }}
            />
            <motion.circle 
              cx="69" 
              cy="53" 
              r="5" 
              fill="#F472B6" 
              animate={{ opacity: emotion === 'happy' ? 0.65 : 0.2 }}
            />

            {/* Eyes */}
            {emotion === 'happy' ? (
              <>
                {/* Curved happy arched lines */}
                <path d="M 27 48 Q 33 42 39 48" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M 61 48 Q 67 42 73 48" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                {/* Standard Blinking Eyes */}
                <motion.ellipse 
                  cx="33" 
                  cy="46" 
                  rx="3.5" 
                  animate={{ ry: [3.5, 0.1, 3.5] }}
                  transition={{ repeat: Infinity, duration: 3.5, repeatDelay: 3 }}
                  fill="#1E1B4B" 
                />
                <motion.ellipse 
                  cx="67" 
                  cy="46" 
                  rx="3.5" 
                  animate={{ ry: [3.5, 0.1, 3.5] }}
                  transition={{ repeat: Infinity, duration: 3.5, repeatDelay: 3 }}
                  fill="#1E1B4B" 
                />
              </>
            )}

            {/* Eyebrows */}
            <path 
              d={getEyebrows().left} 
              stroke="#1E1B4B" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              fill="none" 
              style={{ transition: 'd 0.3s ease' }}
            />
            <path 
              d={getEyebrows().right} 
              stroke="#1E1B4B" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              fill="none" 
              style={{ transition: 'd 0.3s ease' }}
            />

            {/* Mouth */}
            <path 
              d={getMouthPath()} 
              stroke="#1E1B4B" 
              strokeWidth="3" 
              strokeLinecap="round" 
              fill={breathingState !== 'idle' || emotion === 'happy' ? '#1E1B4B' : 'none'} 
              style={{ transition: 'd 0.3s ease' }}
            />
          </svg>
        </motion.div>
      </div>

    </div>
  );
}
