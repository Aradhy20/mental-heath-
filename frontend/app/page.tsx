'use client';
import Link from 'next/link';
import { useState } from 'react';
import AnimatedBreather from '@/components/animated-breather';
import { Shield, Brain, TrendingUp, MapPin, ArrowRight, Zap, Lock } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Copilot',
    desc: 'Multi-mode support — SUPPORT, CBT, COACHING, and CRISIS — powered by LLaMA-3.',
    color: '#818CF8',
  },
  {
    icon: TrendingUp,
    title: 'Wellness Index',
    desc: 'Real-time mood tracking, 30-day trend analysis, and vulnerability prediction.',
    color: '#34D399',
  },
  {
    icon: MapPin,
    title: 'Nearby Resources',
    desc: 'Geolocation-aware map of mental health professionals and clinics near you.',
    color: '#FBBF24',
  },
  {
    icon: Shield,
    title: 'Crisis Sentinel',
    desc: 'Automatic risk detection locks the interface and shows emergency helplines instantly.',
    color: '#F87171',
  },
  {
    icon: Zap,
    title: 'Instant Response',
    desc: 'Server-Sent Events stream AI responses with under 120ms first-token latency.',
    color: '#818CF8',
  },
  {
    icon: Lock,
    title: 'Private & Secure',
    desc: 'Zero-password OTP auth. All data stays on-device until you explicitly sync.',
    color: '#34D399',
  },
];

export default function LandingPage() {
  const [showBreather, setShowBreather] = useState(false);

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient aura blobs */}
        <div
          className="aura-blob"
          style={{ width: 500, height: 500, background: 'rgba(99,102,241,0.15)', top: -100, left: -100 }}
        />
        <div
          className="aura-blob"
          style={{ width: 400, height: 400, background: 'rgba(52,211,153,0.1)', bottom: -80, right: -80, animationDelay: '3s' }}
        />

        {/* Content */}
        <div className="page-enter" style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.875rem' }}>
              <Brain size={12} /> AI-Powered Mental Health
            </span>
          </div>

          <h1 className="display-lg" style={{ marginBottom: '1.25rem' }}>
            Your personal{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818CF8, #34D399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              wellness copilot
            </span>
            , always with you.
          </h1>

          <p
            className="body-lg"
            style={{ color: 'var(--on-surface-muted)', marginBottom: '2.5rem', maxWidth: 520, margin: '0 auto 2.5rem' }}
          >
            Real-time AI support, CBT coaching, mood analytics, and crisis intervention — 
            all in one beautifully designed, private platform.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link href="/auth" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
            <button
              onClick={() => setShowBreather(!showBreather)}
              className="btn btn-ghost"
              style={{ fontSize: '1rem', padding: '0.75rem 2rem' }}
            >
              Try Breather
            </button>
          </div>

          {/* Crisis CTA */}
          <div style={{ marginBottom: '3rem' }}>
            <a
              href="tel:9152987821"
              className="btn btn-crisis"
              style={{ fontSize: '0.875rem', padding: '0.625rem 1.5rem' }}
              id="crisis-cta-988"
            >
              🆘 In Crisis? Call iCall — 9152987821
            </a>
          </div>

          {/* Animated Breather (conditional) */}
          {showBreather && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                padding: '2rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                backdropFilter: 'blur(24px)',
                marginTop: '1rem',
                animation: 'page-in 0.4s ease-out both',
              }}
            >
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
                Take a moment to breathe. Follow the circle.
              </p>
              <AnimatedBreather size={200} />
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'var(--on-surface-muted)',
            fontSize: '0.75rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'aura-float 2s ease-in-out infinite',
          }}
        >
          <div style={{ width: 1, height: 40, background: 'var(--outline)' }} />
          scroll
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="label-md" style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Everything you need</p>
          <h2 className="headline-md">Built for real mental wellness</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${f.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  border: `1px solid ${f.color}30`,
                }}
              >
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.0625rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          borderTop: '1px solid var(--outline)',
          color: 'var(--on-surface-muted)',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ marginBottom: '0.5rem' }}>
          <Brain size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> MindfulAI © 2026
        </p>
        <p>Built with care for mental health. Not a replacement for professional therapy.</p>
      </footer>
    </main>
  );
}
