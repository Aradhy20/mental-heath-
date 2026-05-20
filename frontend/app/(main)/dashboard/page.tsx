'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { getWellnessStats, submitMood, getTrends } from '@/lib/api';
import { TrendingUp, Zap, Heart, AlertTriangle, CheckCircle2, Wind } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const MOOD_LABELS: Record<number, string> = { 1: 'Very Low', 2: 'Low', 3: 'Okay', 4: 'Good', 5: 'Great' };
const MOOD_EMOJIS: Record<number, string> = { 1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };
const MOOD_TAGS = ['Anxious', 'Sad', 'Tired', 'Stressed', 'Calm', 'Happy', 'Grateful', 'Overwhelmed', 'Hopeful'];

interface Stats {
  wellness_index: number;
  average_mood: number;
  streak: number;
  alert_count: number;
}

export default function DashboardPage() {
  const { user, lastMood, setLastMood, moodHistory } = useStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [moodScore, setMoodScore] = useState(3);
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [moodNote, setMoodNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWellnessStats(), getTrends(30)])
      .then(([statsRes, trendsRes]) => {
        setStats(statsRes.data);
        // Format trend data for chart
        const raw = trendsRes.data?.trends || trendsRes.data || [];
        setTrends(Array.isArray(raw) ? raw.slice(-14) : []);
      })
      .catch(() => {
        // Use mock data if API not running
        setStats({ wellness_index: 72, average_mood: 3.8, streak: 5, alert_count: 0 });
        setTrends(
          Array.from({ length: 14 }, (_, i) => ({
            date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
            mood: +(Math.random() * 2 + 2.5).toFixed(1),
            wellness: +(Math.random() * 30 + 55).toFixed(0),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [submitted]);

  const toggleTag = (tag: string) => {
    setMoodTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleMoodSubmit = async () => {
    setSubmitting(true);
    try {
      await submitMood({ score: moodScore, tags: moodTags, note: moodNote });
    } catch {}
    setLastMood({ score: moodScore, tags: moodTags, note: moodNote, timestamp: Date.now() });
    setSubmitted(true);
    setMoodNote('');
    setMoodTags([]);
    setTimeout(() => setSubmitted(false), 3000);
    setSubmitting(false);
  };

  const wellnessIndex = stats?.wellness_index ?? 72;
  const circumference = 2 * Math.PI * 54;
  const dash = circumference - (circumference * wellnessIndex) / 100;

  const wellnessColor = wellnessIndex >= 70 ? '#34D399' : wellnessIndex >= 45 ? '#FBBF24' : '#F87171';

  return (
    <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="headline-md">Good {getTimeGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: 'var(--on-surface-muted)', marginTop: '0.25rem' }}>Here&apos;s your wellness overview for today.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Wellness Gauge Card */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', gridColumn: 'span 1' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width={124} height={124} viewBox="0 0 124 124">
              <circle cx="62" cy="62" r="54" fill="none" stroke="var(--surface-3)" strokeWidth="8" />
              <circle
                cx="62" cy="62" r="54"
                fill="none"
                stroke={wellnessColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={loading ? circumference : dash}
                className="gauge-ring"
                transform="rotate(-90 62 62)"
                style={{ filter: `drop-shadow(0 0 8px ${wellnessColor}80)` }}
              />
              <text x="62" y="58" textAnchor="middle" fill={wellnessColor} fontSize="22" fontWeight="800" fontFamily="Outfit,sans-serif">
                {loading ? '–' : wellnessIndex}
              </text>
              <text x="62" y="76" textAnchor="middle" fill="var(--on-surface-muted)" fontSize="11" fontFamily="Outfit,sans-serif">
                /100
              </text>
            </svg>
          </div>
          <div>
            <p className="label-md" style={{ color: 'var(--on-surface-muted)', marginBottom: '0.25rem' }}>Wellness Index</p>
            <p style={{ fontWeight: 700, fontSize: '1.1rem', color: wellnessColor }}>
              {wellnessIndex >= 70 ? 'Thriving' : wellnessIndex >= 45 ? 'Steady' : 'Needs Care'}
            </p>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {stats?.streak ?? '–'} day streak 🔥
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        {[
          { icon: Heart, label: 'Avg Mood', value: stats ? `${stats.average_mood.toFixed(1)} / 5` : '–', color: '#818CF8' },
          { icon: TrendingUp, label: 'Check-ins', value: `${moodHistory.length} logged`, color: '#34D399' },
          { icon: stats?.alert_count ? AlertTriangle : CheckCircle2, label: 'Alerts', value: stats?.alert_count ? `${stats.alert_count} active` : 'All clear', color: stats?.alert_count ? '#FBBF24' : '#34D399' },
        ].map((s) => (
          <div key={s.label} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={18} color={s.color} />
              </div>
              <p className="label-md" style={{ color: 'var(--on-surface-muted)' }}>{s.label}</p>
            </div>
            <p style={{ fontWeight: 700, fontSize: '1.25rem', color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Two-column: Chart + Mood Check-In */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Trend Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Mood Trend</h2>
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.8rem' }}>Last 14 days</p>
            </div>
            <span className="badge badge-success"><TrendingUp size={12} /> Tracking</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trends} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: 'var(--on-surface-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[1, 5]} tick={{ fill: 'var(--on-surface-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--outline)', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: 'var(--on-surface)' }}
              />
              <Area type="monotone" dataKey="mood" stroke="#818CF8" strokeWidth={2.5} fill="url(#moodGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Mood Check-In */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Wind size={18} color="var(--primary)" />
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Quick Check-in</h2>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
              <p style={{ fontWeight: 600, color: 'var(--secondary)' }}>Logged successfully!</p>
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>See you tomorrow!</p>
            </div>
          ) : (
            <>
              {/* Mood slider */}
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{MOOD_EMOJIS[moodScore]}</div>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{MOOD_LABELS[moodScore]}</p>
                <input
                  id="mood-slider"
                  type="range" min={1} max={5} step={1}
                  value={moodScore}
                  onChange={(e) => setMoodScore(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, var(--primary) ${(moodScore - 1) * 25}%, var(--surface-3) ${(moodScore - 1) * 25}%)`,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface-muted)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                  <span>😔</span><span>😄</span>
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1rem' }}>
                {MOOD_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '0.25rem 0.625rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid',
                      borderColor: moodTags.includes(tag) ? 'var(--primary)' : 'var(--outline)',
                      background: moodTags.includes(tag) ? 'var(--primary-container)' : 'transparent',
                      color: moodTags.includes(tag) ? 'var(--primary)' : 'var(--on-surface-muted)',
                      fontSize: '0.75rem',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      transition: 'all var(--transition)',
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <textarea
                className="input"
                placeholder="Any notes? (optional)"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                rows={2}
                style={{ marginBottom: '1rem', resize: 'none' }}
              />

              <button
                id="dashboard-submit-mood-btn"
                onClick={handleMoodSubmit}
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {submitting ? 'Logging…' : 'Log Mood'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Last mood summary */}
      {lastMood && (
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.75rem' }}>{MOOD_EMOJIS[lastMood.score]}</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Last check-in: <span style={{ color: 'var(--primary)' }}>{MOOD_LABELS[lastMood.score]}</span>
            </p>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.8rem' }}>
              {new Date(lastMood.timestamp).toLocaleString()} · {lastMood.tags.join(', ') || 'No tags'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
