"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Smile, 
  Frown, 
  Meh, 
  Angry, 
  Activity, 
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const SCENARIOS = [
  {
    text: "You walk into a crowded room and suddenly feel a tightness in your chest, even though no one is looking at you.",
    emotions: [
      { id: 'anxious', label: 'Anxiety', icon: Activity, color: 'text-violet-400' },
      { id: 'sad', label: 'Sadness', icon: Frown, color: 'text-blue-400' },
      { id: 'calm', label: 'Calm', icon: Smile, color: 'text-emerald-400' }
    ],
    correct: 'anxious',
    insight: "This tightness is a somatic marker of social anxiety, triggered by the brain's rapid environmental scanning."
  },
  {
    text: "A friend cancels plans at the last minute. You feel a sudden surge of heat and start clenching your jaw.",
    emotions: [
      { id: 'angry', label: 'Anger', icon: Angry, color: 'text-rose-400' },
      { id: 'bored', label: 'Boredom', icon: Meh, color: 'text-slate-400' },
      { id: 'happy', label: 'Relief', icon: Smile, color: 'text-emerald-400' }
    ],
    correct: 'angry',
    insight: "The jaw clench is an evolutionary 'fight' response, signaling frustration even before you consciously label the emotion."
  }
]

export default function MoodMirrorPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [isFinished, setIsFinished] = useState(false)

  const scenario = SCENARIOS[step]

  const handleSelect = (id: string) => {
    setSelected(id)
  }

  const handleNext = () => {
    if (step < SCENARIOS.length - 1) {
      setStep(step + 1)
      setSelected(null)
    } else {
      setIsFinished(true)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-[80vh] flex flex-col">
      <header className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-2 text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="px-4 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-violet-400 flex items-center gap-2">
          <Zap size={12} /> Subconscious Mapping
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div 
            key={step}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 space-y-12"
          >
            <div className="text-center space-y-4">
               <h1 className="text-4xl font-black">Identify the <span className="text-violet-400 italic">Somatic Cue</span></h1>
               <p className="text-muted-foreground text-lg">Read the scenario and identify the underlying subconscious emotion.</p>
            </div>

            <div className="glass p-12 rounded-[4rem] border border-black/5 bg-gradient-to-br from-violet-500/5 to-transparent relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Zap size={160} className="text-violet-500" />
               </div>
               <p className="text-2xl font-medium leading-relaxed italic text-foreground relative z-10">
                 "{scenario.text}"
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {scenario.emotions.map((e) => (
                 <button
                   key={e.id}
                   onClick={() => !selected && handleSelect(e.id)}
                   disabled={selected !== null}
                   className={`p-8 rounded-[3rem] border transition-all flex flex-col items-center gap-4 ${
                     selected === e.id
                       ? (e.id === scenario.correct ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-rose-500/20 border-rose-500/40')
                       : 'bg-black/5 border-black/5 hover:border-black/20'
                   }`}
                 >
                    <e.icon size={40} className={e.color} />
                    <span className="font-black uppercase tracking-widest text-xs">{e.label}</span>
                    {selected === e.id && (
                      <div className="mt-2">
                         {e.id === scenario.correct ? <CheckCircle className="text-emerald-400" /> : <AlertCircle className="text-rose-400" />}
                      </div>
                    )}
                 </button>
               ))}
            </div>

            {selected && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="p-8 rounded-[2.5rem] bg-black/5 border border-black/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-4">Neural Insight</p>
                   <p className="text-lg font-medium text-muted-foreground italic">{scenario.insight}</p>
                </div>
                <button 
                  onClick={handleNext}
                  className="w-full py-5 bg-violet-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-violet-700 transition-all"
                >
                  Proceed to Next Layer
                </button>
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
             <div className="w-24 h-24 bg-violet-500/20 border border-violet-500/30 rounded-[2rem] flex items-center justify-center text-violet-400">
               <Smile size={48} />
            </div>
            <div className="space-y-4">
               <h2 className="text-4xl font-black tracking-tight">Emotional <span className="text-violet-400 italic">Clarity</span> Achieved</h2>
               <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                 You've completed the subconscious mapping session. Your ability to detect somatic cues is improving.
               </p>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-12 py-5 bg-violet-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-violet-500/20"
            >
              Return to Core
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
