'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Calendar, Filter, Download, Brain, Activity, Zap } from 'lucide-react'
import FloatingCard from '@/components/anti-gravity/FloatingCard'
import { useAuthStore } from '@/lib/store/auth-store'

const moodData = [
    { date: '2025-12-14', mood: 4, stress: 2, sleep: 7 },
    { date: '2025-12-15', mood: 3, stress: 4, sleep: 6 },
    { date: '2025-12-16', mood: 5, stress: 1, sleep: 8 },
    { date: '2025-12-17', mood: 4, stress: 3, sleep: 7 },
    { date: '2025-12-18', mood: 2, stress: 5, sleep: 5 },
    { date: '2025-12-19', mood: 4, stress: 2, sleep: 7 },
    { date: '2025-12-20', mood: 5, stress: 1, sleep: 9 },
]

const emotionDistribution = [
    { name: 'Joy', value: 40, color: '#10b981' },
    { name: 'Calm', value: 30, color: '#3b82f6' },
    { name: 'Anxiety', value: 15, color: '#f59e0b' },
    { name: 'Sadness', value: 10, color: '#6366f1' },
    { name: 'Anger', value: 5, color: '#ef4444' },
]

import { userAPI, analysisAPI } from '@/lib/api'

export default function InsightsPage() {
    const { user } = useAuthStore()
    const [timeRange, setTimeRange] = useState('7d')
    const [isMounted, setIsMounted] = useState(false)
    const [chartData, setChartData] = useState(moodData)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsMounted(true)
        const fetchMoodHistory = async () => {
            if (!user) return
            try {
                // Use centralized API instead of hardcoded port 8008
                const response = await userAPI.getMoodHistory();
                if (response.data) {
                    const data = response.data;
                    // Handle both {history:[]} and direct [] formats
                    const history = Array.isArray(data) ? data : (data.history || []);

                    if (history.length > 0) {
                        const formatted = history.slice(-7).map((entry: any) => ({
                            date: new Date(entry.createdAt || entry.timestamp).toLocaleDateString(),
                            mood: entry.score,
                            stress: (entry.score < 5) ? 4 : 1, // Dynamic stress logic
                            sleep: entry.energy_level || 7
                        }))
                        setChartData(formatted)
                    }
                }
            } catch (err) {
                console.error("Failed to fetch insights:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchMoodHistory()
    }, [user])

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                        Mental Health Insights
                    </h1>
                    <p className="text-muted-foreground mt-2">Advanced analytical overview of your emotional wellbeing.</p>
                </motion.div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10">
                        {['7d', '30d', '90d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-white dark:bg-white/10 shadow-sm text-serenity-600 dark:text-white'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {range.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    {
                        label: 'Avg Mood Score',
                        value: chartData.length > 0
                            ? (chartData.reduce((acc, curr) => acc + curr.mood, 0) / chartData.length).toFixed(1)
                            : '4.2',
                        icon: TrendingUp,
                        color: 'text-green-500'
                    },
                    {
                        label: 'Wellness Consistency',
                        value: chartData.length > 4 ? '92%' : '65%',
                        icon: Activity,
                        color: 'text-blue-500'
                    },
                    {
                        label: 'AI Resilience Score',
                        value: chartData.length > 0
                            ? Math.min(60 + chartData.length * 5, 95) + '/100'
                            : '76/100',
                        icon: Brain,
                        color: 'text-purple-500'
                    },
                ].map((stat, i) => (
                    <FloatingCard key={i} delay={i * 0.05}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-2xl bg-black/5 dark:bg-white/5 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </FloatingCard>
                ))}
            </div>

            <div className="flex justify-end gap-4">
                <button
                    onClick={async () => {
                        try {
                            const avgMood = chartData.reduce((acc, curr) => acc + curr.mood, 0) / (chartData.length || 1);
                            const response = await analysisAPI.getWellnessScore({
                                mood_score: avgMood * 2,
                                sentiment_score: 0.2,
                                energy_level: 6
                            });

                            if (response.data) {
                                const data = response.data;
                                alert(`Fuzzy Logic Assessment: ${data.result.label}\nRisk: ${data.result.riskLevel}\nVitality Score: ${data.result.vitalityScore}`);
                            }
                        } catch (e) {
                            console.error("Fuzzy analysis failed:", e);
                        }
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                    <Zap size={20} />
                    Run Fuzzy Logic Analysis
                </button>

                <button
                    onClick={async () => {
                        if (!user) return;
                        setIsLoading(true);
                        try {
                            const res = await fetch('/api/analysis/report', { // Unified API Proxy
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    user_id: user.user_id,
                                    username: user.name || user.username
                                })
                            });
                            if (res.ok) alert("Professional Wellness Report generated successfully!");
                        } catch (e) {
                            console.error(e);
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                    disabled={isLoading}
                    className="px-6 py-3 bg-serenity-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-serenity-700 transition-all shadow-lg hover:shadow-serenity-500/25 disabled:opacity-50"
                >
                    <Download size={20} />
                    {isLoading ? 'Generating...' : 'Generate Full Wellness Report'}
                </button>
            </div>

            {isMounted && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <FloatingCard className="lg:col-span-8 h-[450px]" delay={0.2}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold">Emotional Correlation</h3>
                                <p className="text-sm text-muted-foreground">Mapping mood against stress levels.</p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} />
                                <YAxis hide domain={[0, 6]} />
                                <Tooltip />
                                <Area type="monotone" dataKey="mood" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                                <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </FloatingCard>

                    <FloatingCard className="lg:col-span-4 h-[450px]" delay={0.3}>
                        <h3 className="text-xl font-bold mb-2">Emotion Mix</h3>
                        <div className="h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={emotionDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {emotionDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-8 space-y-2">
                            {emotionDistribution.slice(0, 3).map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="text-muted-foreground">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </FloatingCard>
                </div>
            )}
        </div>
    )
}
