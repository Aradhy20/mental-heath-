"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Brain, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react'

const DISTORTIONS = [
  { id: 'catastrophizing', name: 'Catastrophizing', desc: 'Predicting the worst possible outcome.' },
  { id: 'filtering', name: 'Mental Filtering', desc: 'Focusing only on the negatives.' },
  { id: 'overgeneralizing', name: 'Overgeneralizing', desc: 'Viewing a single event as a never-ending pattern.' },
  { id: 'mindreading', name: 'Mind Reading', desc: 'Assuming others are thinking negatively about you.' }
]

const SCENARIOS = [
  {
    thought: "My boss didn't reply to my email immediately. I'm definitely getting fired.",
    distortions: ['catastrophizing', 'mindreading'],
    reframe: "My boss is likely busy with other tasks. They will reply when they have time."
  },
  {
    thought: "I made one mistake in my presentation. The whole thing was a disaster.",
    distortions: ['filtering', 'overgeneralizing'],
    reframe: "I made one small error, but the rest of the presentation went well and provided value."
  },
  {
    thought: "Everyone at the party was looking at me and thinking I look awkward.",
    distortions: ['mindreading'],
    reframe: "Most people are focused on themselves and their own conversations. I'm doing just fine."
  }
]

export default function ThoughtChallengePage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'game' | 'complete'>('intro')
  const [currentScenario, setCurrentScenario] = useState(0)
  const [selectedDistortions, setSelectedDistortions] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)

  const scenario = SCENARIOS[currentScenario]

  const handleNext = () => {
    if (currentScenario < SCENARIOS.length - 1) {
      setCurrentScenario(currentScenario + 1)
      setSelectedDistortions([])
      setShowResult(false)
    } else {
      setStep('complete')
    }
  }

  const checkAnswers = () => {
    const isCorrect = scenario.distortions.every(d => selectedDistortions.includes(d)) && 
                      selectedDistortions.length === scenario.distortions.length
    if (isCorrect) setScore(s => s + 1)
    setShowResult(true)
  }

  const toggleDistortion = (id: string) => {
    if (selectedDistortions.includes(id)) {
      setSelectedDistortions(selectedDistortions.filter(d => d !== id))
    } else {
      setSelectedDistortions([...selectedDistortions, id])
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
        <div className="px-4 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Zap size={12} /> Neural Training Mode
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary shadow-2xl shadow-primary/10 border border-primary/20">
              <Brain size={48} />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight">Thought <span className="text-primary italic">Challenge</span></h1>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                Train your brain to identify and reframe cognitive distortions. Master the art of balanced thinking.
              </p>
            </div>
            <button 
              onClick={() => setStep('game')}
              className="px-12 py-5 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/30"
            >
              Initialize Neuro-Sync
            </button>
          </motion.div>
        )}

        {step === 'game' && (
          <motion.div 
            key="game"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 space-y-8"
          >
            <div className="glass p-10 rounded-[3rem] border border-black/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-5">
                  <HelpCircle size={120} />
               </div>
               <div className="relative z-10 space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Intrusive Thought Analysis</p>
                  <h2 className="text-3xl font-medium leading-relaxed italic text-foreground/90">
                    "{scenario.thought}"
                  </h2>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <AlertCircle size={16} /> Identify the Distortions
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DISTORTIONS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => !showResult && toggleDistortion(d.id)}
                      disabled={showResult}
                      className={`p-6 rounded-[2rem] border transition-all text-left group ${
                        selectedDistortions.includes(d.id)
                          ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                          : 'bg-black/5 border-black/5 text-muted-foreground hover:border-black/10'
                      }`}
                    >
                      <h4 className={`font-black uppercase tracking-tighter mb-1 ${selectedDistortions.includes(d.id) ? 'text-white' : 'text-foreground'}`}>{d.name}</h4>
                      <p className={`text-xs ${selectedDistortions.includes(d.id) ? 'text-primary-foreground' : 'text-muted-foreground'}`}>{d.desc}</p>
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex justify-center pt-8">
               {!showResult ? (
                 <button 
                   onClick={checkAnswers}
                   disabled={selectedDistortions.length === 0}
                   className="px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                 >
                   Submit Analysis
                 </button>
               ) : (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="w-full space-y-8"
                 >
                   <div className={`p-8 rounded-[2.5rem] border ${
                     scenario.distortions.every(d => selectedDistortions.includes(d)) 
                       ? 'bg-emerald-500/10 border-emerald-500/20' 
                       : 'bg-amber-500/10 border-amber-500/20'
                   }`}>
                      <div className="flex items-center gap-4 mb-4">
                         {scenario.distortions.every(d => selectedDistortions.includes(d)) 
                           ? <CheckCircle2 className="text-emerald-400" /> 
                           : <ShieldCheck className="text-amber-400" />}
                         <h4 className="font-black uppercase tracking-widest text-sm">AI Cognitive Reframe</h4>
                      </div>
                      <p className="text-lg font-medium italic text-foreground/90">"{scenario.reframe}"</p>
                   </div>
                   <button 
                     onClick={handleNext}
                     className="w-full py-5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:opacity-90"
                   >
                     Next Scenario <ChevronRight size={16} />
                   </button>
                 </motion.div>
               )}
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
          >
            <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
               <CheckCircle2 size={48} />
            </div>
            <div className="space-y-4">
               <h2 className="text-4xl font-black tracking-tight">Neuro-Baseline <span className="text-emerald-400 italic">Realigned</span></h2>
               <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                 You successfully identified {score} out of {SCENARIOS.length} cognitive distortion patterns. Your resilience index has increased.
               </p>
            </div>
            <div className="flex gap-4">
               <button 
                 onClick={() => { setStep('intro'); setCurrentScenario(0); setScore(0); }}
                 className="px-10 py-5 bg-black/5 border border-black/5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black/10 transition-all"
               >
                 Recalibrate
               </button>
               <button 
                 onClick={() => router.push('/dashboard')}
                 className="px-10 py-5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
               >
                 View Insights
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
