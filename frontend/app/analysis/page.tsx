'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  Tooltip as ReTooltip, Cell
} from 'recharts'
import { BrainCircuit, ShieldCheck, Microscope, Zap, Database, Activity, Sparkles } from 'lucide-react'
import FloatingCard from '@/components/anti-gravity/FloatingCard'
import FaceAnalyzer from '@/components/features/FaceAnalyzer'
import VoiceAnalyzer from '@/components/features/VoiceAnalyzer'
import NeuralTestbed from '@/components/features/NeuralTestbed'
import { useAuthStore } from '@/lib/store/auth-store'

const cognitiveData = [
  { subject: 'Attention', A: 120, B: 110, fullMark: 150 },
  { subject: 'Memory', A: 98, B: 130, fullMark: 150 },
  { subject: 'Reflection', A: 86, B: 130, fullMark: 150 },
  { subject: 'Logic', A: 99, B: 100, fullMark: 150 },
  { subject: 'Sleep', A: 85, B: 90, fullMark: 150 },
  { subject: 'Social', A: 65, B: 85, fullMark: 150 },
]

const clusterData = [
  { x: 10, y: 30, z: 200, name: 'Calm State' },
  { x: 40, y: 50, z: 260, name: 'Flow State' },
  { x: 90, y: 15, z: 400, name: 'Anxiety Spike' },
  { x: 60, y: 80, z: 100, name: 'Reflection' },
]

export default function AnalysisPage() {
  const { user } = useAuthStore()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-20 max-w-[1400px] mx-auto">
      {/* Hub Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <BrainCircuit size={200} />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-28 h-28 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 relative overflow-hidden">
            <Activity size={56} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black tracking-[0.3em] uppercase mb-4">
              <Sparkles size={14} className="animate-pulse" />
              Cognitive Informatics
            </div>
            <h1 className="text-6xl font-display font-black text-white tracking-tighter mb-2">Neural Scan Hub</h1>
            <p className="text-slate-400 max-w-2xl font-medium text-lg">
              Welcome to the lab, Pooja. Our Bayesian inference models are cross-referencing multi-modal data streams to construct your real-time psychological profile.
            </p>
          </div>
          <div className="hidden lg:flex gap-6">
            <div className="px-8 py-4 rounded-3xl bg-white/5 border border-white/5 text-center backdrop-blur-xl">
              <span className="block text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">Inference Reliability</span>
              <span className="text-3xl font-display font-black text-emerald-400">99.2%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Lab Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Spectrogram Analysis</h2>
            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Mic Primed</span>
          </div>
          <VoiceAnalyzer />
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Physiognomic Mapping</h2>
            <span className="text-[10px] text-indigo-500 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase">Optics Ready</span>
          </div>
          <FaceAnalyzer />
        </div>
      </div>

      {/* Quantum Testbed Integration */}
      <NeuralTestbed />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cognitive Radar Chart */}
        <FloatingCard className="lg:col-span-7 aspect-square md:aspect-auto md:h-[550px] glass-panel p-8 rounded-[2.5rem] border-white/5" delay={0.1}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Biometric Profile</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Holistic Synthesis Matrix</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck size={28} />
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={cognitiveData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="Current Potential"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.4}
                  strokeWidth={3}
                  animationDuration={2500}
                />
                <Radar
                  name="System Baseline"
                  dataKey="B"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active State</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-purple-500/50" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Baseline</span>
            </div>
          </div>
        </FloatingCard>

        {/* Behavioral Clustering */}
        <FloatingCard className="lg:col-span-5 h-[550px] glass-panel p-8 rounded-[2.5rem] border-white/5" delay={0.2}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">State Manifold</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">T-SNE Dimensionality Analysis</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Microscope size={28} />
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" name="Arousal" hide />
                <YAxis type="number" dataKey="y" name="Valence" hide />
                <ZAxis type="number" dataKey="z" range={[200, 1500]} name="Duration" />
                <ReTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                          <p className="text-xs text-white font-bold">Resonance: {payload[0].payload.z} pts</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter name="States" data={clusterData}>
                  {clusterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 2 ? '#f43f5e' : '#6366f1'}
                      fillOpacity={0.6}
                      stroke={index === 2 ? '#f43f5e' : '#6366f1'}
                      strokeWidth={2}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-12">
            {clusterData.map((item, i) => (
              <div key={i} className="flex flex-col gap-1 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-default">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-indigo-500'}`} />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Detected Index: {item.z}</span>
              </div>
            ))}
          </div>
        </FloatingCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FloatingCard className="glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
          <div className="absolute -right-8 -bottom-8 opacity-5">
            <Zap size={180} />
          </div>
          <div className="flex items-center gap-5 mb-8">
            <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/10">
              <Zap size={28} />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Predictive Risk Matrix</h3>
          </div>
          <p className="text-lg text-slate-300 leading-relaxed font-medium">
            Our recursive Bayesian engine predicts a <span className="text-emerald-400 font-black px-2 py-0.5 rounded-lg bg-emerald-400/10 border border-emerald-400/20">low probability (12%)</span> of neuro-fatigue escalation in the upcoming 72-hour window.
          </p>
          <div className="mt-10 p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 relative animate-pulse">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] block mb-3">Model Recommendation</span>
            <p className="text-base text-slate-200 font-medium italic">"Maintain current non-focused rest cycles. Cortisol simulations indicate peak recovery efficiency at 02:00 local time."</p>
          </div>
        </FloatingCard>

        <FloatingCard className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-indigo-500/5 to-transparent">
          <div className="flex items-center gap-5 mb-8">
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
              <Database size={28} />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Data Source Fusion</h3>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { id: 'Text', model: 'BERT-RAG', val: '88%' },
              { id: 'Face', model: 'ResNet-50', val: '94%' },
              { id: 'Voice', model: 'VGGVox-V3', val: '91%' }
            ].map((node) => (
              <div key={node.id} className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                <span className="block text-2xl font-display font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">{node.val}</span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{node.id}</span>
                <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-2 block">{node.model}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">End-to-End Encrypted Node</span>
            </div>
          </div>
        </FloatingCard>
      </div>
    </div>
  )
}

