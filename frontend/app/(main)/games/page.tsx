"use client"

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Wind,
  Brain,
  Activity,
  Palette,
  ChevronRight,
  Star,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'

const GAMES = [
  {
    id: 'mood-mirror',
    title: 'Mood Mirror',
    desc: 'Interactive scenarios to map your emotional spectrum subconscious cues.',
    icon: Brain,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    type: 'Diagnostic'
  },
  {
    id: 'breathing',
    title: 'Breathing Rhythm',
    desc: 'Relieve stress instantly with guided heart-rate variability breathing.',
    icon: Wind,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    type: 'Relief'
  },
  {
    id: 'thought-challenge',
    title: 'Thought Challenge',
    desc: 'Master CBT techniques to reframe negative thinking patterns.',
    icon: Activity,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    type: 'Psychology'
  },
  {
    id: 'color-picker',
    title: 'Color Mood Picker',
    desc: 'Map your inner state through abstract color associations.',
    icon: Palette,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    type: 'Subconscious'
  }
]

export default function GamesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <header>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-5xl font-black mb-4 tracking-tight">Wellness <span className="gradient-text italic">Protocols</span></h1>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl">
            Interactive neural exercises designed to realign your cognitive baseline and discharge emotional tension.
          </p>
        </motion.div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity" />
            <Link 
              href={`/games/${game.id}`}
              className="relative block p-10 glass rounded-[3.5rem] border border-black/5 hover:border-primary/40 transition-all overflow-hidden"
            >
              <div className="flex justify-between items-start mb-10">
                <div className={cn("p-6 rounded-[2rem] shadow-2xl border border-black/5 transition-transform group-hover:scale-110", game.bg, game.color)}>
                  <game.icon size={36} />
                </div>
                <div className="px-5 py-2 rounded-full bg-black/5 border border-black/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">
                  {game.type}
                </div>
              </div>
              
              <h3 className="text-3xl font-black mb-4 tracking-tight">{game.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-10 text-sm font-medium">{game.desc}</p>
              
              <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.2em]">
                Initialize Session <Play size={14} fill="currentColor" className="ml-1" />
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="p-12 glass rounded-[4rem] border border-black/5 bg-gradient-to-br from-primary/10 via-transparent to-transparent relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <Activity size={200} />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              <Star size={14} /> Optimized Track Recommended
            </div>
            <h2 className="text-4xl font-black tracking-tight leading-tight">Master Your Neural <span className="italic text-primary">Focus</span></h2>
            <p className="text-muted-foreground leading-relaxed text-lg font-medium">
              Your "Beast Mode" analytics suggest a shift in focus. Starting with 
              <span className="text-foreground font-black px-2">Breathing Rhythm</span> will help align your nervous system with your current work intensity.
            </p>
            <Link href="/games/breathing" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-[1.5rem] hover:scale-105 transition-all shadow-2xl">
              Launch Tracking Track <ChevronRight size={16} />
            </Link>
          </div>
          <div className="w-80 h-80 glass rounded-[3rem] border border-black/5 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse opacity-50" />
            <Wind size={120} className="text-primary relative z-10 transition-transform group-hover:scale-110 duration-700" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}