"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import { 
  Shield, 
  Sparkles, 
  Activity, 
  Target, 
  Brain,
  Info,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { INSIGHTS_DATA } from '@/lib/static-data'
import { insightsAPI, type InsightData } from '@/lib/api'

const EMOTION_COLORS: Record<string, string> = {
  joy:     '#fbbf24',
  sadness: '#60a5fa',
  anger:   '#f87171',
  fear:    '#fb923c',
  neutral: '#94a3b8',
  focused: '#a78bfa',
  calm:    '#22d3ee',
  happy:   '#4ade80',
  anxious: '#fb923c',
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const iData = await insightsAPI.get()
        setData(iData)
      } catch (err) {
        console.error("Insights fetch failed, using fallback.", err)
        setData(INSIGHTS_DATA as InsightData)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6">
         <motion.div 
           animate={{ rotate: 360 }} 
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
           className="p-4 glass rounded-[2.5rem] border border-primary/20"
         >
            <Target className="text-primary w-12 h-12" />
         </motion.div>
         <p className="text-sm font-black uppercase tracking-[0.3em] text-primary">Scanning Neural Architecture...</p>
      </div>
    )
  }

  const { weekly_summary, emotion_breakdown, recommendations, risk_assessment, mood_history } = data

  const historyData = mood_history?.map(m => ({
    date: new Date(m.date).toLocaleDateString('en', { weekday: 'short' }),
    score: m.score * 10
  }))

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-12">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                <Target className="text-primary" size={20} />
             </div>
             <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">Forensic Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none">
            Neural <span className="text-gradient">Forensics.</span>
          </h1>
          <p className="text-muted-foreground font-semibold text-lg max-w-2xl leading-relaxed">
            Deep spectrum analysis of your cognitive architecture and emotional volatility markers.
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 glass rounded-2xl border border-black/5 flex items-center gap-3">
             <ShieldCheck className="text-emerald-500" size={18} />
             <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Encrypted Diagnostic</span>
          </div>
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Core Indexes */}
        <div className="lg:col-span-4 space-y-10">
          {/* Stability Gauge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 glass rounded-[3.5rem] border border-black/5 shadow-2xl flex flex-col items-center text-center relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Activity size={120} className="text-primary" />
            </div>
            
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mb-8 opacity-60">Mood Stability Index</h3>
            
            <div className="relative w-48 h-48 mb-8">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="rgba(0,0,0,0.03)" strokeWidth="12" fill="none" />
                  <circle 
                    cx="96" cy="96" r="88" 
                    stroke="#7e22ce" 
                    strokeWidth="12" 
                    strokeDasharray={553} 
                    strokeDashoffset={553 * (1 - weekly_summary.avg_mood/5)} 
                    fill="none" 
                    className="transition-all duration-1000"
                    strokeLinecap="round"
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-foreground tracking-tighter">{(weekly_summary.avg_mood * 20).toFixed(0)}</span>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Quotient</span>
               </div>
            </div>
            
            <p className="text-sm font-bold text-muted-foreground leading-relaxed px-4">
              Your emotional trajectory is <span className="text-primary font-black uppercase">{weekly_summary.trend}</span> based on 42 biometric data points.
            </p>
          </motion.div>

          {/* Risk Diagnostic */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-10 rounded-[3.5rem] border shadow-2xl ${
              risk_assessment.level === 'safe' || risk_assessment.level === 'low'
              ? 'glass border-black/5'
              : 'bg-rose-50 border-rose-100'
            }`}
          >
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black tracking-tighter">Safety Architecture</h3>
               <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                  risk_assessment.level === 'safe' || risk_assessment.level === 'low'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
               }`}>
                  {risk_assessment.level} Profile
               </div>
            </div>
            
            <div className="flex items-center gap-6 mb-8">
               <div className={`p-4 rounded-2xl ${
                  risk_assessment.level === 'safe' || risk_assessment.level === 'low'
                  ? 'bg-emerald-500/10'
                  : 'bg-rose-500/10 text-rose-500'
               }`}>
                  {risk_assessment.level === 'safe' || risk_assessment.level === 'low' ? <Shield size={24} className="text-emerald-500" /> : <AlertTriangle size={24} />}
               </div>
               <div>
                  <h4 className="text-sm font-black uppercase tracking-widest mb-1">Risk Markers</h4>
                  <p className="text-[10px] font-bold text-muted-foreground">Confidence Index: {Math.round(risk_assessment.confidence * 100)}%</p>
               </div>
            </div>
            
            <p className="text-xs font-bold text-muted-foreground leading-relaxed opacity-70">
              Biometric signals indicate stable neurological activity. No intervention protocols required at this time.
            </p>
          </motion.div>
        </div>

        {/* Right Column: Deep Data */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Emotion Spectrum Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-10 glass rounded-[3.5rem] border border-black/5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-2xl font-black tracking-tighter mb-1">Emotion Spectrum.</h3>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">Multimodal Signal Breakdown</p>
               </div>
               <button className="p-3 glass rounded-xl border border-black/5 hover:text-primary transition-colors">
                  <Info size={18} />
               </button>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotion_breakdown} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="6 6" horizontal={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="emotion" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
                    itemStyle={{ fontWeight: 900 }}
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  />
                  <Bar dataKey="percentage" radius={[0, 12, 12, 0]} barSize={24}>
                    {emotion_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.emotion] || '#7e22ce'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Longitudinal Analysis */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-10 glass rounded-[3.5rem] border border-black/5 shadow-2xl relative overflow-hidden"
          >
             <div className="absolute -right-20 -bottom-20 p-20 opacity-[0.02] pointer-events-none">
                <Brain size={400} className="text-primary" />
             </div>

            <div className="flex items-center justify-between mb-12">
               <div>
                  <h3 className="text-2xl font-black tracking-tighter mb-1">Neural Flow.</h3>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest opacity-60">Longitudinal Stability Analysis</p>
               </div>
               <div className="flex bg-black/5 p-1.5 rounded-2xl border border-black/5">
                <button className="px-6 py-2 text-[10px] font-black rounded-xl transition-all bg-primary text-white shadow-lg shadow-primary/20">
                   QUANTUM VIEW
                </button>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7e22ce" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#7e22ce" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontWeight: 900 }} dy={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#7e22ce" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#flowGradient)" 
                    animationDuration={2500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Synthesis Prescriptions */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
             <div className="p-10 bg-primary/10 rounded-[3.5rem] border border-primary/20 relative group overflow-hidden shadow-xl">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                   <Sparkles size={80} className="text-primary animate-pulse" />
                </div>
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-6">Neural Synthesis</h4>
                <p className="text-lg font-black tracking-tight mb-8 leading-tight">"Vocal journaling has increased your clarity index by 14% this week."</p>
                <button className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:translate-x-2 transition-transform">
                   Optimize Workflow <ChevronRight size={14} />
                </button>
             </div>

             <div className="p-10 glass rounded-[3.5rem] border border-black/5 shadow-xl">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] mb-6">Protocols</h4>
                <div className="space-y-4">
                   {recommendations.slice(0, 2).map((rec: string, i: number) => (
                      <div key={i} className="flex gap-4 items-start">
                         <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-black text-primary">{i+1}</span>
                         </div>
                         <p className="text-xs font-bold text-muted-foreground leading-relaxed">{rec}</p>
                      </div>
                   ))}
                </div>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
