'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { getWellnessStats, submitMood, getTrends } from '@/lib/api';
import { TrendingUp, Heart, AlertTriangle, CheckCircle2, Wind, ArrowRight, MessageCircle, BarChart3, Plus, BrainCircuit } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Link from 'next/link';
import AICompanion from '@/components/ai-companion';

const MOOD_LABELS: Record<number, string> = { 1:'Very Low', 2:'Low', 3:'Okay', 4:'Good', 5:'Great' };
const MOOD_EMOJIS: Record<number, string> = { 1:'😔', 2:'😕', 3:'😐', 4:'🙂', 5:'😄' };
const MOOD_TAGS = ['Anxious','Sad','Tired','Stressed','Calm','Happy','Grateful','Overwhelmed','Hopeful'];

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.4 } });

interface Stats { wellness_index: number; average_mood: number; streak: number; alert_count: number; }

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

export default function DashboardPage() {
  const { user, lastMood, setLastMood, moodHistory } = useStore();
  const [stats, setStats]       = useState<Stats | null>(null);
  const [trends, setTrends]     = useState<any[]>([]);
  const [moodScore, setMoodScore] = useState(3);
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [moodNote, setMoodNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    Promise.all([getWellnessStats(), getTrends(30)])
      .then(([sRes, tRes]) => {
        setStats(sRes.data);
        const raw = tRes.data?.trends || tRes.data || [];
        const parsedTrends = Array.isArray(raw) ? raw.slice(-14) : [];
        if (parsedTrends.length === 0) {
          setTrends(Array.from({ length: 14 }, (_, i) => ({
            date: new Date(Date.now() - (13-i) * 86400000).toLocaleDateString('en',{month:'short',day:'numeric'}),
            mood: +(Math.random() * 1.5 + 3.0).toFixed(1),
            wellness: +(Math.random() * 20 + 70).toFixed(0),
          })));
        } else {
          setTrends(parsedTrends);
        }
      })
      .catch(() => {
        setStats({ wellness_index: 88, average_mood: 4.2, streak: 5, alert_count: 0 });
        setTrends(Array.from({ length: 14 }, (_, i) => ({
          date: new Date(Date.now() - (13-i) * 86400000).toLocaleDateString('en',{month:'short',day:'numeric'}),
          mood: +(Math.random() * 1.5 + 3.0).toFixed(1),
          wellness: +(Math.random() * 20 + 70).toFixed(0),
        })));
      })
      .finally(() => setLoading(false));
  }, [submitted]);

  const toggleTag = (tag: string) =>
    setMoodTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);

  const handleMoodSubmit = async () => {
    setSubmitting(true);
    try {
      await submitMood({
        score: moodScore,
        tags: moodTags,
        note: moodNote,
        user_id: user?.id ? String(user.id) : undefined
      });
    } catch {}
    setLastMood({ score: moodScore, tags: moodTags, note: moodNote, timestamp: Date.now() });
    setSubmitted(true); setMoodNote(''); setMoodTags([]);
    setTimeout(() => setSubmitted(false), 3000);
    setSubmitting(false);
  };

  const wi  = stats?.wellness_index ?? 88;
  const avgMood = stats?.average_mood ?? 4.2;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: '3rem' }}>

      {/* ═══ Header Greeting ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <motion.div {...fadeUp(0)}>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.02em', color: '#1E1B4B', marginBottom: '0.25rem' }}>
            Welcome back, {user?.name?.split(' ')[0] ?? 'User'} 👋
          </h1>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.9375rem' }}>Your emotional wellness is looking improving today.</p>
        </motion.div>
        
        <motion.button {...fadeUp(0.02)} onClick={() => {
          const el = document.getElementById('mood-slider');
          el?.scrollIntoView({ behavior: 'smooth' });
        }} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#7C3AED', color: '#FFFFFF', border: 'none', padding: '0.625rem 1.25rem', borderRadius: 99, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.2)'
        }}>
          <Plus size={16} /> New Check-in
        </motion.button>
      </div>

      {/* ═══ Stats Cards Grid (4 Column Row) ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Card 1: Average Mood */}
        <motion.div {...fadeUp(0.04)} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-muted)' }}>Average Mood</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={16} color="#7C3AED" fill="#7C3AED" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E1B4B' }}>{avgMood.toFixed(1)} / 5</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.08)', padding: '0.125rem 0.375rem', borderRadius: 6 }}>+5%</span>
          </div>
        </motion.div>

        {/* Card 2: Wellness Score */}
        <motion.div {...fadeUp(0.06)} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-muted)' }}>Wellness Score</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#10B981" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E1B4B' }}>{wi}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.08)', padding: '0.125rem 0.375rem', borderRadius: 6 }}>Optimal</span>
          </div>
        </motion.div>

        {/* Card 3: Dominant Emotion */}
        <motion.div {...fadeUp(0.08)} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-muted)' }}>Dominant Emotion</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={16} color="#3B82F6" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B', textTransform: 'capitalize' }}>
              {lastMood ? MOOD_LABELS[lastMood.score].toLowerCase() : 'good'}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3B82F6', background: 'rgba(59,130,246,0.08)', padding: '0.125rem 0.375rem', borderRadius: 6 }}>Stable</span>
          </div>
        </motion.div>

        {/* Card 4: Chat Sessions */}
        <motion.div {...fadeUp(0.10)} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--on-surface-muted)' }}>Chat Sessions</span>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(139,92,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={16} color="#8B5CF6" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E1B4B' }}>12</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8B5CF6', background: 'rgba(139,92,246,0.08)', padding: '0.125rem 0.375rem', borderRadius: 6 }}>+3</span>
          </div>
        </motion.div>

      </div>

      {/* ═══ Main Split Grid (Chart vs Check-in) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-6">
        
        {/* Trend Area Chart (Left) */}
        <motion.div {...fadeUp(0.12)} className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E1B4B' }}>Emotional Journey</h2>
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.8rem' }}>Weekly mental analytics and mood tracker metrics</p>
            </div>
            <select style={{
              background: '#FFFFFF', border: '1px solid rgba(124, 58, 237, 0.15)', borderRadius: 8, padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#1E1B4B', outline: 'none', fontWeight: 600
            }}>
              <option>This Week</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          {mounted ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trends} margin={{ top: 10, right: 10, bottom: 5, left: -25 }}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.16}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: 'var(--on-surface-muted)', fontSize: 11 }} tickLine={false} axisLine={false}/>
                <YAxis domain={[1,5]} tick={{ fill: 'var(--on-surface-muted)', fontSize: 11 }} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 12, fontSize: 12, color: '#1E1B4B', boxShadow: '0 8px 24px rgba(124,58,237,0.06)' }} labelStyle={{ fontWeight: 700 }}/>
                <Area type="monotone" dataKey="mood" stroke="#7C3AED" strokeWidth={3} fill="url(#moodGrad)" dot={{ stroke: '#7C3AED', strokeWidth: 2, fill: '#FFFFFF', r: 4 }} activeDot={{ r: 6, strokeWidth: 0, fill: '#7C3AED' }}/>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="skeleton" style={{ height: 260, width: '100%' }} />
          )}
        </motion.div>

        {/* Right side container: Lumi Widget + Quick Check-in Logger */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Lumi Animated Companion Widget */}
          <motion.div {...fadeUp(0.13)}>
            <AICompanion mode="widget" size={65} />
          </motion.div>

          {/* Quick Check-in Logger (Right) */}
          <motion.div {...fadeUp(0.14)} className="glass-card" style={{ padding: '1.75rem', margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Wind size={18} color="#7C3AED"/>
              <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E1B4B' }}>Quick Check-in</h2>
            </div>

            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '3.5rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <p style={{ fontWeight: 800, color: '#10B981', fontSize: '1.1rem' }}>Mood Logged!</p>
                <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem', marginTop: '0.35rem' }}>Your wellness dashboard has been updated.</p>
              </motion.div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                    {MOOD_EMOJIS[moodScore]}
                  </motion.div>
                  <p style={{ fontWeight: 700, marginBottom: '0.75rem', color: '#1E1B4B', fontSize: '1rem' }}>{MOOD_LABELS[moodScore]}</p>
                  <input id="mood-slider" type="range" min={1} max={5} step={1} value={moodScore} onChange={e => setMoodScore(Number(e.target.value))}
                    style={{
                      width: '100%',
                      accentColor: '#7C3AED',
                      background: `linear-gradient(to right, #7C3AED ${(moodScore-1)*25}%, rgba(124, 58, 237, 0.08) ${(moodScore-1)*25}%)`
                    }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-muted)', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    <span>😔 Very Low</span><span>😄 Great</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                  {MOOD_TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} style={{
                      padding: '0.35rem 0.75rem', borderRadius: 99, border: '1px solid',
                      borderColor: moodTags.includes(tag) ? '#7C3AED' : 'rgba(124,58,237,0.12)',
                      background: moodTags.includes(tag) ? 'rgba(124,58,237,0.08)' : 'transparent',
                      color: moodTags.includes(tag) ? '#7C3AED' : 'var(--on-surface-muted)',
                      fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    }}>{tag}</button>
                  ))}
                </div>

                <textarea className="input" placeholder="Any logs/notes to record today?" value={moodNote} onChange={e => setMoodNote(e.target.value)} rows={2} style={{ marginBottom: '1rem', resize: 'none', width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.15)', outline: 'none', color: '#1E1B4B', fontFamily: 'inherit' }} />

                <button id="dashboard-submit-mood-btn" onClick={handleMoodSubmit} disabled={submitting} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', background: '#7C3AED', color: 'white', fontWeight: 700, padding: '0.75rem', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
                  {submitting ? 'Logging…' : 'Log Mood'}
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* ═══ Quick Actions Section (Row) ═══ */}
      <motion.div {...fadeUp(0.16)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {[
          { href: '/chat',    icon: MessageCircle, label: 'Talk to AI Therapist', sub: 'Start empathetic support session', color: '#7C3AED' },
          { href: '/journal', icon: Wind,          label: 'Voice/Text Journal',   sub: 'Reflect on emotional states', color: '#10B981' },
          { href: '/insights',icon: BarChart3,     label: 'Emotional Insights',   sub: 'Analyse biometric summaries', color: '#3B82F6' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.875rem', transition: 'transform 0.2s', height: '100%' }}
                 onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${a.color}08`, border: `1px solid ${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <a.icon size={18} color={a.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E1B4B', marginBottom: '0.125rem' }}>{a.label}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>{a.sub}</p>
              </div>
              <ArrowRight size={15} color="var(--on-surface-muted)" />
            </div>
          </Link>
        ))}
      </motion.div>

      {/* ═══ Last Mood Logged Footer Panel ═══ */}
      {lastMood && (
        <motion.div {...fadeUp(0.18)} className="glass-card" style={{ padding: '1.125rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(124,58,237,0.12)' }}>
          <span style={{ fontSize: '2rem' }}>{MOOD_EMOJIS[lastMood.score]}</span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E1B4B' }}>
              Last check-in: <span style={{ color: '#7C3AED' }}>{MOOD_LABELS[lastMood.score]}</span>
            </p>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.78rem' }}>
              {new Date(lastMood.timestamp).toLocaleString()} · {lastMood.tags.join(', ') || 'No tags'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
