"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Zap, 
  Wind, 
  Brain, 
  Shield, 
  ArrowRight,
  Sparkles,
  Activity,
  Heart
} from 'lucide-react'

const TOOLS = [
  { 
    id: 'thought-challenge', 
    title: "Thought Reframer", 
    desc: "Interactive CBT tool to identify and challenge cognitive distortions.", 
    icon: Brain, 
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    path: "/games/thought-challenge"
  },
  { 
    id: 'breathing', 
    title: "Serenity Breather", 
    desc: "Guided heart-rate variability breathing to reset your nervous system.", 
    icon: Wind, 
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    path: "/games/breathing"
  },
  { 
    id: 'mood-mirror', 
    title: "Mood Mirror", 
    desc: "Map your subconscious emotional cues through somatic awareness.", 
    icon: Activity, 
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    path: "/games/mood-mirror"
  },
  { 
    id: 'crisis', 
    title: "Crisis Guard", 
    desc: "Immediate redirection to human support and safety protocols.", 
    icon: Shield, 
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    path: "/nearby"
  },
]

export default function ResiliencePage() {
  const router = useRouter()

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
             <Heart className="text-primary fill-primary/20" size={20} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Core Resilience Protocol Active</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4">Resilience <span className="gradient-text italic">Hub</span></h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl">
            A suite of interactive neural-recalibration tools designed to strengthen your cognitive baseline.
          </p>
        </motion.div>
        
        <div className="px-6 py-4 glass rounded-[2.5rem] border border-black/5 flex items-center gap-5 shadow-2xl">
           <div className="w-12 h-12 rounded-[1.25rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Zap size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Stability Index</p>
              <p className="text-sm font-black tracking-tight text-emerald-400">94.2% Optimal</p>
           </div>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {TOOLS.map((tool, i) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="group relative"
            onClick={() => router.push(tool.path)}
          >
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity" />
            <div className="relative p-10 glass rounded-[3.5rem] border border-black/5 hover:border-primary/40 transition-all cursor-pointer overflow-hidden">
               <div className="flex justify-between items-start mb-8">
                  <div className={`p-6 rounded-[2rem] shadow-2xl border border-black/5 transition-transform group-hover:scale-110 ${tool.bg} ${tool.color}`}>
                     <tool.icon size={36} />
                  </div>
                  <div className="p-4 bg-black/5 rounded-full text-muted-foreground group-hover:text-primary transition-colors">
                     <ArrowRight size={20} />
                  </div>
               </div>
               
               <h3 className="text-3xl font-black mb-4 tracking-tight">{tool.title}</h3>
               <p className="text-muted-foreground leading-relaxed font-medium">{tool.desc}</p>
               
               {/* Decorative Background Pattern */}
               <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <tool.icon size={200} />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="p-12 glass rounded-[4rem] border border-black/5 bg-gradient-to-r from-primary/10 via-transparent to-transparent flex flex-col md:flex-row items-center gap-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <Sparkles size={200} />
        </div>
        <div className="w-20 h-20 rounded-[2rem] bg-primary/20 flex items-center justify-center text-primary shadow-2xl border border-primary/30 relative z-10">
          <Brain size={40} />
        </div>
        <div className="flex-1 space-y-4 relative z-10 text-center md:text-left">
          <h4 className="text-2xl font-black tracking-tight">Need a full assessment?</h4>
          <p className="text-base font-medium text-muted-foreground leading-relaxed max-w-2xl">
            If you're feeling persistent symptoms, taking a standardized PHQ-9 or GAD-7 assessment can help our AI provide more tailored support.
          </p>
        </div>
        <button 
          onClick={() => router.push('/assessments')}
          className="px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-[1.5rem] hover:scale-105 transition-all shadow-2xl relative z-10"
        >
          Start Assessment
        </button>
      </motion.div>
    </div>
  )
}
