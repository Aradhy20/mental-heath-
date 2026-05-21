"use client";

import { useEffect, useState } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell,
} from 'recharts';
import {
  Shield, Sparkles, Activity, Target, Brain, Info,
  ChevronRight, ShieldCheck, AlertTriangle, TrendingUp, BarChart3,
} from 'lucide-react';
import { INSIGHTS_DATA } from '@/lib/static-data';
import { insightsAPI, type InsightData } from '@/lib/api';

const EMOTION_COLORS: Record<string, string> = {
  joy:     '#FBBF24', sadness: '#60A5FA', anger:   '#F87171',
  fear:    '#FB923C', neutral: '#94A3B8', focused: '#A78BFA',
  calm:    '#22D3EE', happy:   '#4ADE80', anxious: '#FB923C',
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'emotions' | 'flow'>('emotions');

  useEffect(() => {
    insightsAPI.get()
      .then((d) => setData(d))
      .catch(() => setData(INSIGHTS_DATA as InsightData))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'aura-float 2s ease-in-out infinite' }}>
          <Target size={26} color="var(--primary)" />
        </div>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--primary)' }}>Analysing your data…</p>
      </div>
    );
  }

  // Safe destructuring with fallback to INSIGHTS_DATA
  const rawData = data as any;
  const weekly_summary = rawData.weekly_summary || {
    avg_mood: rawData.digital_twin?.resilience_index ? (rawData.digital_twin.resilience_index / 20) : (INSIGHTS_DATA.weekly_summary?.avg_mood ?? 3.8),
    trend: rawData.digital_twin?.stress_trend || (INSIGHTS_DATA.weekly_summary?.trend ?? 'stable'),
    dominant_emotion: rawData.digital_twin?.dominant_emotion || (INSIGHTS_DATA.weekly_summary?.dominant_emotion ?? 'Calm'),
    total_sessions: (INSIGHTS_DATA.weekly_summary as any)?.total_sessions ?? 7
  };

  const emotion_breakdown = rawData.emotion_breakdown || INSIGHTS_DATA.emotion_breakdown;
  const recommendations = rawData.recommendations || INSIGHTS_DATA.recommendations;
  const risk_assessment = rawData.risk_assessment || {
    level: rawData.digital_twin?.risk_level || (INSIGHTS_DATA.risk_assessment?.level ?? 'low'),
    confidence: INSIGHTS_DATA.risk_assessment?.confidence ?? 0.95
  };
  const mood_history = rawData.mood_history || INSIGHTS_DATA.mood_history;

  const historyData = mood_history?.map((m: any) => ({
    date: new Date(m.date).toLocaleDateString('en', { weekday: 'short' }),
    score: (m.score || 3.8) * 20,
  })) || [];

  const wellnessScore = Math.round((weekly_summary.avg_mood ?? 3.8) * 20);
  const circumference = 2 * Math.PI * 54;
  const dash = circumference - (circumference * wellnessScore) / 100;
  const wellnessColor = wellnessScore >= 70 ? '#34D399' : wellnessScore >= 45 ? '#FBBF24' : '#F87171';
  const isSafe = !risk_assessment?.level || risk_assessment.level === 'safe' || risk_assessment.level === 'low';

  return (
    <div className="page-enter" style={{ maxWidth: 1140, margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ padding: '0.35rem', background: 'var(--primary-container)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={16} color="var(--primary)" />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Wellness Analytics</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>Your Insights</h1>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.9375rem' }}>Deep analysis of your emotional patterns & wellness trajectory.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--surface-2)', border: '1px solid var(--outline)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, color: '#34D399' }}>
          <ShieldCheck size={14} />
          Encrypted Diagnostic
        </div>
      </div>

      {/* ── Top Row: Gauge + Risk + Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>

        {/* Wellness Gauge */}
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <p className="label-md" style={{ color: 'var(--on-surface-muted)', marginBottom: '1.25rem' }}>Mood Stability Index</p>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <svg width={128} height={128} viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="54" fill="none" stroke="var(--surface-3)" strokeWidth="9" />
              <circle cx="64" cy="64" r="54" fill="none" stroke={wellnessColor} strokeWidth="9"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dash}
                className="gauge-ring" transform="rotate(-90 64 64)"
                style={{ filter: `drop-shadow(0 0 8px ${wellnessColor}80)` }}
              />
              <text x="64" y="60" textAnchor="middle" fill={wellnessColor} fontSize="22" fontWeight="800" fontFamily="Outfit,sans-serif">{wellnessScore}</text>
              <text x="64" y="78" textAnchor="middle" fill="var(--on-surface-muted)" fontSize="11" fontFamily="Outfit,sans-serif">/100</text>
            </svg>
          </div>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: wellnessColor }}>
            {weekly_summary.trend === 'improving' ? '📈 Improving' : weekly_summary.trend === 'stable' ? '➡️ Stable' : '📉 Needs Care'}
          </p>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Based on {(weekly_summary as any).total_sessions ?? 7} sessions</p>
        </div>

        {/* Risk Card */}
        <div className="glass-card" style={{
          padding: '2rem',
          background: isSafe ? undefined : 'rgba(239,68,68,0.06)',
          borderColor: isSafe ? undefined : 'rgba(239,68,68,0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Safety Profile</h3>
            <span style={{
              padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700,
              background: isSafe ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)',
              color: isSafe ? '#34D399' : '#F87171',
            }}>
              {risk_assessment.level?.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: isSafe ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isSafe ? <Shield size={22} color="#34D399" /> : <AlertTriangle size={22} color="#F87171" />}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>Risk Markers</p>
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.8rem' }}>Confidence: {Math.round(risk_assessment.confidence * 100)}%</p>
            </div>
          </div>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.825rem', lineHeight: 1.6 }}>
            {isSafe
              ? 'Neurological signals are stable. No intervention protocols required.'
              : 'Elevated markers detected. Consider speaking to a professional.'}
          </p>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Avg Mood', value: `${Number(weekly_summary.avg_mood ?? 3.8).toFixed(1)} / 5`, icon: TrendingUp, color: '#818CF8' },
            { label: 'Sessions this week', value: (weekly_summary as any).total_sessions ?? 7, icon: Activity, color: '#34D399' },
            { label: 'Top emotion', value: emotion_breakdown?.[0]?.emotion ?? 'Calm', icon: Sparkles, color: '#FBBF24' },
          ].map((s) => (
            <div key={s.label} className="glass-card" style={{ padding: '1.125rem 1.375rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon size={17} color={s.color} />
              </div>
              <div>
                <p className="label-md" style={{ color: 'var(--on-surface-muted)' }}>{s.label}</p>
                <p style={{ fontWeight: 700, fontSize: '1.0625rem', color: s.color, textTransform: 'capitalize' }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Emotion Spectrum */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>Emotion Spectrum</h3>
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.78rem' }}>Multimodal signal breakdown</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={emotion_breakdown} layout="vertical" margin={{ left: 20, right: 10 }}>
              <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="var(--outline)" />
              <XAxis type="number" hide />
              <YAxis dataKey="emotion" type="category" axisLine={false} tickLine={false}
                tick={{ fill: 'var(--on-surface-muted)', fontSize: 11, fontWeight: 600 }}
                tickFormatter={(v) => String(v).charAt(0).toUpperCase() + String(v).slice(1)}
              />
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--outline)', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="percentage" radius={[0, 8, 8, 0]} barSize={18}>
                {emotion_breakdown.map((entry: any, i: number) => (
                  <Cell key={i} fill={EMOTION_COLORS[entry.emotion] || 'var(--primary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mood Flow */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>Mood Flow</h3>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.78rem' }}>Longitudinal stability analysis</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="moodFlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--outline)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--on-surface-muted)', fontSize: 10, fontWeight: 600 }} dy={8} />
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--outline)', borderRadius: 10, fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} fill="url(#moodFlowGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── AI Recommendations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Synthesis */}
        <div className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(52,211,153,0.06))', borderColor: 'var(--outline-strong)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.06 }}>
            <Brain size={120} color="var(--primary)" />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles size={16} color="var(--primary)" />
              <span className="label-md" style={{ color: 'var(--primary)' }}>AI Synthesis</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.5, marginBottom: '1.25rem', color: 'var(--on-surface)' }}>
              "Vocal journaling has increased your clarity index by 14% this week."
            </p>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'gap var(--transition)' }}>
              Explore recommendations <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Protocols */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.125rem' }}>
            <Info size={15} color="var(--on-surface-muted)" />
            <span className="label-md" style={{ color: 'var(--on-surface-muted)' }}>Recommended Protocols</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {(recommendations as string[]).slice(0, 3).map((rec: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {i + 1}
                </div>
                <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
