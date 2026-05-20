"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Palette, 
  CheckCircle2, 
  Zap,
  Info
} from 'lucide-react'

const COLORS = [
  { hex: '#6366F1', label: 'Indigo', emotion: 'Focused / Analytical', desc: 'Higher cognitive load, deep thinking.' },
  { hex: '#10B981', label: 'Emerald', emotion: 'Balanced / Calm', desc: 'Parasympathetic activation, steady state.' },
  { hex: '#F59E0B', label: 'Amber', emotion: 'Alert / High Energy', desc: 'Adrenal readiness, hyper-vigilance.' },
  { hex: '#EF4444', label: 'Rose', emotion: 'Intense / Reactive', desc: 'Amygdala signaling, emotional intensity.' },
  { hex: '#8B5CF6', label: 'Violet', emotion: 'Creative / Abstract', desc: 'Flow state, lateral thinking enabled.' },
  { hex: '#06B6D4', label: 'Cyan', emotion: 'Relaxed / Open', desc: 'Reduced stress markers, receptive state.' }
]

export default function ColorPickerPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<number | null>(null)
  const [isFinished, setIsFinished] = useState(false)

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-[80vh] flex flex-col">
      <header className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-2 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="px-4 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
          <Zap size={12} /> Chromatic Analysis
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div 
            key="picker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 space-y-12"
          >
            <div className="text-center space-y-4">
               <h1 className="text-4xl font-black">Color <span className="text-amber-500 italic">Mood</span> Picker</h1>
               <p className="text-muted-foreground text-lg">Select the color that resonates most with your current mental state.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
               {COLORS.map((c, i) => (
                 <motion.button
                   key={i}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setSelected(i)}
                   className={`aspect-square rounded-[3rem] border-4 transition-all relative overflow-hidden group ${
                     selected === i ? 'border-white shadow-2xl scale-105' : 'border-transparent opacity-80 hover:opacity-100'
                   }`}
                   style={{ backgroundColor: c.hex }}
                 >
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Palette className="text-white" size={40} />
                    </div>
                 </motion.button>
               ))}
            </div>

            {selected !== null && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="glass p-10 rounded-[4rem] border border-black/5 bg-gradient-to-br from-white/5 to-transparent flex flex-col md:flex-row items-center gap-10">
                   <div 
                     className="w-32 h-32 rounded-full shadow-2xl shrink-0"
                     style={{ backgroundColor: COLORS[selected].hex }}
                   />
                   <div className="space-y-4 text-center md:text-left">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Detected Resonance</p>
                        <h3 className="text-3xl font-black">{COLORS[selected].emotion}</h3>
                      </div>
                      <p className="text-muted-foreground font-medium leading-relaxed">
                        {COLORS[selected].desc} This chromatic association suggests your nervous system is currently in a <span className="text-foreground font-bold">{COLORS[selected].label.toLowerCase()}</span> frequency.
                      </p>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelected(null)}
                    className="flex-1 py-5 bg-black/5 border border-black/5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all"
                  >
                    Rescan
                  </button>
                  <button 
                    onClick={() => setIsFinished(true)}
                    className="flex-[2] py-5 bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20"
                  >
                    Confirm & Log State
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
          >
             <div className="w-24 h-24 bg-amber-500/20 border border-amber-500/30 rounded-[2rem] flex items-center justify-center text-amber-500">
               <CheckCircle2 size={48} />
            </div>
            <div className="space-y-4">
               <h2 className="text-4xl font-black tracking-tight">State <span className="text-amber-500 italic">Quantified</span></h2>
               <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                 Your chromatic state has been integrated into your neural profile. We'll use this to adjust your AI companion's tone.
               </p>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-12 py-5 bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-amber-500/20"
            >
              Back to Hub
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
