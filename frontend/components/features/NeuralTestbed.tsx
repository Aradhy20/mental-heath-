'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Shield, Terminal, Cpu } from 'lucide-react'

const NeuralTestbed = () => {
    const [signals, setSignals] = useState<number[]>([])
    const [log, setLog] = useState<string[]>([])

    useEffect(() => {
        const interval = setInterval(() => {
            setSignals(prev => [...prev.slice(-20), Math.random() * 100])
            const entries = [
                'Calibrating synaptic weights...',
                'Recursive state estimation active',
                'Filtering latent noise (alpha-beta)',
                'Neural resonance synchronized',
                'Cross-modal fusion complete'
            ]
            setLog(prev => [...prev.slice(-4), entries[Math.floor(Math.random() * entries.length)]])
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden bg-slate-950/20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Quantum Testbed</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Real-time Model Inference Lab</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-widest">Inference Latency</span>
                        <span className="text-xs font-display font-bold text-emerald-400">12.4ms</span>
                    </div>
                    <div className="h-8 w-[1px] bg-white/5" />
                    <Shield size={20} className="text-indigo-400 opacity-50" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Signal Visualizer */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={12} className="text-emerald-400" />
                            Live Synaptic Stream
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">NODE_TX_04</span>
                    </div>
                    <div className="h-32 flex items-end gap-1 bg-white/5 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                        {signals.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${s}%` }}
                                className="flex-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-t-sm"
                                transition={{ type: 'spring', damping: 20 }}
                            />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Live Logs */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Terminal size={12} className="text-indigo-400" />
                            Kernel Logs
                        </span>
                    </div>
                    <div className="h-32 bg-slate-900/50 p-4 rounded-2xl border border-white/5 font-mono text-[10px] space-y-2 overflow-hidden">
                        {log.map((l, i) => (
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-slate-400"
                            >
                                <span className="text-indigo-500">[{new Date().toLocaleTimeString()}]</span> {l}
                            </motion.p>
                        ))}
                        <div className="w-2 h-4 bg-indigo-500 animate-pulse inline-block" />
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                    Dump Analysis Report
                </button>
            </div>

            {/* Background decoration */}
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
        </div>
    )
}

export default NeuralTestbed
