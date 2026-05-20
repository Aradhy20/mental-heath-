'use client';
import { useEffect, useRef } from 'react';

interface Props {
  size?: number;
  className?: string;
}

export default function AnimatedBreather({ size = 220, className = '' }: Props) {
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const phaseRef = useRef<'inhale' | 'hold' | 'exhale'>('inhale');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const phases: Record<string, { label: string; duration: number; scale: number; color: string }> = {
    inhale: { label: 'Inhale', duration: 4000, scale: 1, color: '#818CF8' },
    hold:   { label: 'Hold',   duration: 4000, scale: 1, color: '#34D399' },
    exhale: { label: 'Exhale', duration: 6000, scale: 0.7, color: '#818CF8' },
  };

  useEffect(() => {
    const container = circleRef.current?.closest('svg') as SVGSVGElement | null;
    if (!container) return;

    const ring = container.querySelector('.breath-ring') as SVGCircleElement;
    const glow = container.querySelector('.breath-glow') as SVGCircleElement;
    const label = container.querySelector('.breath-label') as SVGTextElement;
    const counter = container.querySelector('.breath-counter') as SVGTextElement;

    let countdown = 0;
    let countInterval: ReturnType<typeof setInterval> | null = null;

    const runPhase = (phase: 'inhale' | 'hold' | 'exhale') => {
      const p = phases[phase];
      phaseRef.current = phase;

      const r = size / 2 - 16;
      const targetR = phase === 'exhale' ? r * 0.7 : r;

      ring.style.transition = `r ${p.duration}ms cubic-bezier(0.4,0,0.2,1)`;
      ring.setAttribute('r', String(targetR));
      ring.setAttribute('stroke', p.color);

      glow.style.transition = `r ${p.duration}ms cubic-bezier(0.4,0,0.2,1)`;
      glow.setAttribute('r', String(targetR));

      if (label) label.textContent = p.label;

      countdown = Math.round(p.duration / 1000);
      if (counter) counter.textContent = String(countdown);
      if (countInterval) clearInterval(countInterval);
      countInterval = setInterval(() => {
        countdown -= 1;
        if (counter) counter.textContent = String(Math.max(0, countdown));
      }, 1000);

      timerRef.current = setTimeout(() => {
        const next = phase === 'inhale' ? 'hold' : phase === 'hold' ? 'exhale' : 'inhale';
        runPhase(next);
      }, p.duration);
    };

    runPhase('inhale');
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countInterval) clearInterval(countInterval);
    };
  }, [size]);

  const cx = size / 2;
  const cy = size / 2;
  const initR = size / 2 - 16;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label="Breathing exercise guide"
    >
      <defs>
        <radialGradient id="breathGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Glow blob */}
      <circle className="breath-glow" cx={cx} cy={cy} r={initR} fill="url(#breathGlow)" filter="url(#glow)" />

      {/* Outer track */}
      <circle cx={cx} cy={cy} r={initR} fill="none" stroke="rgba(129,140,248,0.12)" strokeWidth="2" />

      {/* Animated ring */}
      <circle
        ref={circleRef}
        className="breath-ring"
        cx={cx}
        cy={cy}
        r={initR}
        fill="rgba(99,102,241,0.08)"
        stroke="#818CF8"
        strokeWidth="2.5"
        filter="url(#glow)"
      />

      {/* Center text */}
      <text
        ref={textRef}
        className="breath-label"
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="#e8e8f0"
        fontSize="16"
        fontFamily="Outfit, sans-serif"
        fontWeight="600"
      >
        Inhale
      </text>
      <text
        className="breath-counter"
        x={cx}
        y={cy + 20}
        textAnchor="middle"
        fill="#818CF8"
        fontSize="28"
        fontFamily="Outfit, sans-serif"
        fontWeight="700"
      >
        4
      </text>
    </svg>
  );
}
