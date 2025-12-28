'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface HeatmapData {
  date: string
  emotion: string
  intensity: number
}

interface EmotionColorMap {
  [key: string]: string
}

const EmotionHeatmap = () => {
  // Mock data for the heatmap
  const heatmapData: HeatmapData[] = [
    { date: '2023-05-01', emotion: 'happy', intensity: 8 },
    { date: '2023-05-02', emotion: 'calm', intensity: 6 },
    { date: '2023-05-03', emotion: 'anxious', intensity: 4 },
    { date: '2023-05-04', emotion: 'sad', intensity: 3 },
    { date: '2023-05-05', emotion: 'excited', intensity: 9 },
    { date: '2023-05-06', emotion: 'angry', intensity: 2 },
    { date: '2023-05-07', emotion: 'peaceful', intensity: 7 },
    { date: '2023-05-08', emotion: 'stressed', intensity: 5 },
    { date: '2023-05-09', emotion: 'content', intensity: 7 },
    { date: '2023-05-10', emotion: 'frustrated', intensity: 3 },
    { date: '2023-05-11', emotion: 'hopeful', intensity: 8 },
    { date: '2023-05-12', emotion: 'overwhelmed', intensity: 4 },
    { date: '2023-05-13', emotion: 'grateful', intensity: 9 },
    { date: '2023-05-14', emotion: 'lonely', intensity: 3 },
    { date: '2023-05-15', emotion: 'motivated', intensity: 8 },
    { date: '2023-05-16', emotion: 'exhausted', intensity: 2 },
    { date: '2023-05-17', emotion: 'optimistic', intensity: 7 },
    { date: '2023-05-18', emotion: 'worried', intensity: 4 },
    { date: '2023-05-19', emotion: 'accomplished', intensity: 8 },
    { date: '2023-05-20', emotion: 'disappointed', intensity: 3 },
    { date: '2023-05-21', emotion: 'relieved', intensity: 7 },
  ]

  const emotionColors: EmotionColorMap = {
    happy: 'bg-emerald-400',
    calm: 'bg-indigo-400',
    anxious: 'bg-amber-400',
    sad: 'bg-blue-500',
    excited: 'bg-fuchsia-400',
    angry: 'bg-rose-500',
    peaceful: 'bg-violet-400',
    stressed: 'bg-orange-400',
    content: 'bg-teal-400',
    frustrated: 'bg-red-400',
    hopeful: 'bg-cyan-400',
    overwhelmed: 'bg-purple-500',
    grateful: 'bg-lime-400',
    lonely: 'bg-slate-500',
    motivated: 'bg-sky-400',
    exhausted: 'bg-zinc-600',
    optimistic: 'bg-green-400',
    worried: 'bg-yellow-500',
    accomplished: 'bg-emerald-600',
    disappointed: 'bg-indigo-600',
    relieved: 'bg-teal-300',
  }

  const getIntensityOpacity = (intensity: number) => {
    return intensity / 10;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-tight">Emotional Spectrum Matrix</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Multi-cycle recursive sentiment mapping</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synthesis Active</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {heatmapData.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            whileHover={{ scale: 1.2, zIndex: 10 }}
            className="group relative"
          >
            <div
              style={{ opacity: getIntensityOpacity(day.intensity) }}
              className={`w-12 h-12 rounded-2xl ${emotionColors[day.emotion] || 'bg-slate-700'} cursor-pointer shadow-lg transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]`}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{day.date}</p>
              <p className="text-sm font-bold text-white capitalize">{day.emotion}</p>
              <div className="w-full h-1 bg-white/5 mt-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${day.intensity * 10}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
        {/* Placeholder for future growth */}
        {[...Array(7)].map((_, i) => (
          <div key={`p-${i}`} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 border-dashed" />
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10 border-t border-white/5">
        <div className="lg:col-span-2">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Frequency Legend</h3>
          <div className="flex flex-wrap gap-4">
            {Object.entries(emotionColors).slice(0, 10).map(([emotion, color]) => (
              <div key={emotion} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[10px] font-bold text-slate-400 capitalize">{emotion}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Neural Insight</h4>
            <p className="text-sm text-indigo-100/80 leading-relaxed font-medium">
              Your "Equanimity" threshold is rising. Optimal recovery patterns detected during low-intensity cycles.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
        </div>
      </div>
    </motion.div>
  )
}


export default EmotionHeatmap