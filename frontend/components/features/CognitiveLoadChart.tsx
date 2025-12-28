'use client'

import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

const CognitiveLoadChart = ({ data: chartData }: { data?: any[] }) => {
    const fallbackData = [
        { name: 'Focus', value: 85, color: '#6366f1' },
        { name: 'Memory', value: 62, color: '#8b5cf6' },
        { name: 'Logic', value: 78, color: '#a855f7' },
        { name: 'Creative', value: 92, color: '#d946ef' },
    ];

    const displayData = chartData && chartData.length > 0
        ? chartData.map((d, i) => ({ ...d, color: d.color || fallbackData[i % 4].color }))
        : fallbackData;
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-[2.5rem] border border-white/5 h-[400px] relative overflow-hidden group"
        >
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Cognitive Load Factor</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Real-time heuristics analysis</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                    <Zap size={20} className="animate-pulse" />
                </div>
            </div>

            <div className="h-[200px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayData} layout="vertical" margin={{ left: -20 }}>
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                            width={80}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                            {displayData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 relative z-10">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Peak Performance</span>
                    <span className="text-lg font-display font-bold text-emerald-400">Creative Flow</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Recommended Action</span>
                    <span className="text-lg font-display font-bold text-indigo-400">Deep Work</span>
                </div>
            </div>
        </motion.div>
    )
}

export default CognitiveLoadChart
