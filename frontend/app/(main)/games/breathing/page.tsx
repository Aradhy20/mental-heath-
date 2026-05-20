"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react'

export default function BreathingPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<'ready' | 'inhale' | 'hold' | 'exhale' | 'complete'>('ready')
  const [cycle, setCycle] = useState(0)
  const MAX_CYCLES = 4

  useEffect(() => {
    if (phase === 'ready') return

    let timer: NodeJS.Timeout
    if (phase === 'inhale') {
      timer = setTimeout(() => setPhase('hold'), 4000)
    } else if (phase === 'hold') {
      timer = setTimeout(() => setPhase('exhale'), 4000)
    } else if (phase === 'exhale') {
      timer = setTimeout(() => {
        if (cycle + 1 >= MAX_CYCLES) {
          setPhase('complete')
        } else {
          setCycle(c => c + 1)
          setPhase('inhale')
        }
      }, 4000)
    }
    return () => clearTimeout(timer)
  }, [phase, cycle])

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col items-center justify-center relative">
      <button 
        onClick={() => router.back()}
        className="absolute top-0 left-0 p-4 text-muted-foreground hover:text-foreground flex items-center gap-2"
      >
        <ArrowLeft size={20} /> Back to Games
      </button>

      <AnimatePresence mode="wait">
        {phase === 'ready' && (
          <motion.div 
            key="ready"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center space-y-12"
          >
            <div className="space-y-4">
              <h1 className="text-5xl font-bold">Breathing Rhythm</h1>
              <p className="text-muted-foreground text-lg">Follow the circle to reset your nervous system.</p>
            </div>
            <button 
              onClick={() => setPhase('inhale')}
              className="px-12 py-5 bg-primary text-white font-bold text-xl rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40"
            >
              Start Exercise
            </button>
          </motion.div>
        )}

        {(phase === 'inhale' || phase === 'hold' || phase === 'exhale') && (
          <motion.div 
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-80 h-80 flex items-center justify-center">
              {/* Animated Circle */}
              <motion.div 
                animate={{ 
                  scale: phase === 'inhale' ? 1.5 : (phase === 'exhale' ? 1 : 1.5),
                  opacity: phase === 'hold' ? 0.8 : 1
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 blur-xl opacity-50"
              />
              <motion.div 
                animate={{ 
                  scale: phase === 'inhale' ? 1.5 : (phase === 'exhale' ? 1 : 1.5),
                  borderWidth: phase === 'hold' ? '8px' : '2px'
                }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="w-40 h-40 rounded-full border-2 border-primary flex items-center justify-center relative z-10"
              >
                <span className="text-2xl font-bold uppercase tracking-widest text-primary italic">
                  {phase}
                </span>
              </motion.div>

              {/* Progress Dots */}
              <div className="absolute -bottom-20 flex gap-3">
                {[...Array(MAX_CYCLES)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-all duration-500 ${i <= cycle ? 'bg-primary w-4' : 'bg-black/10'}`} 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'complete' && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-8">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-bold">Session Complete</h2>
            <p className="text-muted-foreground text-lg max-w-sm mx-auto">
              Your focus has improved. We've logged this as a positive recovery event in your digital twin.
            </p>
            <div className="flex gap-4 justify-center pt-8">
              <button 
                onClick={() => { setCycle(0); setPhase('inhale'); }}
                className="flex items-center gap-2 px-6 py-3 bg-black/5 border border-black/5 rounded-2xl font-bold hover:bg-black/10 transition-all"
              >
                <RefreshCw size={18} /> Repeat
              </button>
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
