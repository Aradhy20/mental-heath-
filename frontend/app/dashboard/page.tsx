'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Plus, Smile, Book, Wind } from 'lucide-react'
import DashboardCard from '@/components/ui/DashboardCard'
import MoodTracker from '@/components/features/MoodTracker'
import RecommendationCarousel from '@/components/features/RecommendationCarousel'
import EmotionHeatmap from '@/components/features/EmotionHeatmap'
import FloatingActionButton from '@/components/ui/FloatingActionButton'
import { useAuthStore } from '@/lib/store/auth-store'
import { userAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'

import MoodTrendChart from '@/components/features/MoodTrendChart'
import CognitiveLoadChart from '@/components/features/CognitiveLoadChart'

const DashboardPage = () => {
  const { user } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  // State for Dashboard Data
  const [stats, setStats] = React.useState({
    wellnessScore: 78,
    streakDays: 12,
    entriesThisWeek: 24,
    moodStatus: 'Equanimity',
    charts: {
      trend: [],
      cognitive: []
    }
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setMounted(true)

    // HACK: Recharts sometimes fails to calculate width on first mount in complex flex layouts
    // This triggers a global resize event to force ResponsiveContainer to re-calculate
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
  }, [])

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await userAPI.getDashboardStats();
        if (data) setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) fetchStats();
  }, [mounted]);

  // Real Navigation Actions
  // Correction: We must import useRouter at top level. I will fix imports in a separate block if needed, but here I can use window.location as fallback or assume router is available if I added it.
  // Actually, let's use window.location for simplicity in this replacement block or better, assume useRouter is meant to be used.

  const fabActions = [
    {
      id: 'mood',
      label: 'Log Mood',
      icon: <Smile size={18} />,
      onClick: () => router.push('/mood')
    },
    {
      id: 'journal',
      label: 'Write Journal',
      icon: <Book size={18} />,
      onClick: () => router.push('/journal')
    },
    {
      id: 'breathing',
      label: 'Breathing Exercise',
      icon: <Wind size={18} />,
      onClick: () => router.push('/meditation')
    }
  ]

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent border border-white/10 relative overflow-hidden shadow-2xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between relative z-10 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-black tracking-[0.2em] uppercase mb-4">
              <Activity size={14} className="animate-pulse" />
              Neural Interface: {loading ? 'Calibrating...' : 'Synchronized'}
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-4">
              Pooja, <span className="text-indigo-400">Welcome Home.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed">
              Your autonomous wellness engine has synthesized <span className="text-white">12 new insights</span> since your last session. All cognitive systems are performing within optimal parameters.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => router.push('/analysis')} className="px-10 py-5 bg-white text-indigo-950 hover:bg-indigo-50 rounded-2xl font-black tracking-widest uppercase text-sm transition-all shadow-2xl shadow-white/10 flex items-center gap-3 group">
              <Activity size={20} className="group-hover:rotate-12 transition-transform" />
              Start Neural Scan
            </button>
            <button onClick={() => router.push('/chat')} className="px-10 py-5 bg-indigo-600/20 hover:bg-indigo-600/30 text-white border border-indigo-500/30 rounded-2xl font-black tracking-widest uppercase text-sm transition-all backdrop-blur-md flex items-center gap-3">
              <Plus size={20} />
              AI Assistant
            </button>
          </div>
        </div>

        {/* Abstract shapes for premium feel */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Neural Wellness"
          value={loading ? "..." : `${stats.wellnessScore}%`}
          description="Synthesized from multi-modal inputs"
          icon={<Activity size={24} />}
          trend={{ value: 4.2, isPositive: true }}
          className="bg-indigo-500/5 border-indigo-500/10"
        />

        <DashboardCard
          title="Cognitive Continuity"
          value={loading ? "..." : `${stats.streakDays} Days`}
          description="Consistent pattern maintenance"
          icon={<Activity size={24} />}
          trend={{ value: 2, isPositive: true }}
        />

        <DashboardCard
          title="Data Points"
          value={loading ? "..." : stats.entriesThisWeek}
          description="Logged in active cycle"
          icon={<Activity size={24} />}
        />

        <DashboardCard
          title="Core Resonance"
          value={loading ? "..." : stats.moodStatus}
          description="Dominant emotional frequency"
          icon={<Smile size={24} />}
          className="bg-emerald-500/5 border-emerald-500/10"
        />
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <div className="lg:col-span-4">
          <MoodTrendChart data={stats.charts.trend} />
        </div>
        <div className="lg:col-span-3">
          <CognitiveLoadChart data={stats.charts.cognitive} />
        </div>
      </div>

      {/* Secondary Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] pl-2">Neural Logging</h3>
          <MoodTracker />
        </div>
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] pl-2">System Interventions</h3>
          <RecommendationCarousel />
        </div>
      </div>

      {/* Data Fusion Legend */}
      <EmotionHeatmap />

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions}
        mainIcon={<Plus size={24} />}
        mainLabel="Nexus Context menu"
      />
    </div>
  )
}

export default DashboardPage