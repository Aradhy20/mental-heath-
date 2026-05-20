'use client';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

const CRISIS_LINES = [
  { name: 'iCall (India)', number: '9152987821', flag: '🇮🇳' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', flag: '🇮🇳' },
  { name: 'AASRA', number: '9820466627', flag: '🇮🇳' },
  { name: 'International (988)', number: '988', flag: '🌍' },
];

export default function CrisisGuard() {
  const crisisActive = useStore((s) => s.crisisActive);
  const setCrisisActive = useStore((s) => s.setCrisisActive);

  useEffect(() => {
    if (crisisActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [crisisActive]);

  if (!crisisActive) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crisis support overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'page-in 0.3s ease-out both',
      }}
    >
      <div
        style={{
          background: 'var(--crisis-container)',
          border: '2px solid var(--crisis)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 60px rgba(239,68,68,0.4)',
        }}
      >
        {/* Pulse indicator */}
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem', animation: 'crisis-pulse 1.5s infinite' }}>🆘</div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fca5a5', marginBottom: '0.5rem' }}>
          You&apos;re not alone
        </h2>
        <p style={{ color: 'var(--on-surface-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          It sounds like you may be going through something very difficult. Please reach out to a crisis professional right now — they care and they can help.
        </p>

        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '2rem' }}>
          {CRISIS_LINES.map((line) => (
            <a
              key={line.number}
              href={`tel:${line.number}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1.25rem',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all var(--transition)',
              }}
            >
              <span>{line.flag} {line.name}</span>
              <span style={{ color: '#fca5a5', fontFamily: 'monospace' }}>{line.number}</span>
            </a>
          ))}
        </div>

        <button
          onClick={() => setCrisisActive(false)}
          className="btn btn-ghost"
          style={{ width: '100%' }}
        >
          I&apos;m safe — continue to MindfulAI
        </button>
      </div>
    </div>
  );
}
