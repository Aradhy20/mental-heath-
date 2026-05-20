'use client';
import { useState } from 'react';
import { submitAssessment } from '@/lib/api';
import { ClipboardList, CheckCircle2, ArrowRight, ArrowLeft, BarChart3 } from 'lucide-react';

// PHQ-9 Questions
const PHQ9 = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure',
  'Trouble concentrating on things',
  'Moving or speaking so slowly that people could have noticed',
  'Thoughts that you would be better off dead, or thoughts of hurting yourself',
];

// GAD-7 Questions
const GAD7 = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
];

const FREQUENCY_OPTIONS = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

function getSeverity(score: number, max: number): { label: string; color: string } {
  const pct = score / max;
  if (pct < 0.2) return { label: 'Minimal', color: '#34D399' };
  if (pct < 0.4) return { label: 'Mild', color: '#FBBF24' };
  if (pct < 0.6) return { label: 'Moderate', color: '#F97316' };
  return { label: 'Severe', color: '#F87171' };
}

type AssessmentType = 'PHQ9' | 'GAD7';
type Phase = 'select' | 'questions' | 'result';

export default function AssessmentsPage() {
  const [phase, setPhase] = useState<Phase>('select');
  const [type, setType] = useState<AssessmentType>('PHQ9');
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; max: number } | null>(null);

  const questions = type === 'PHQ9' ? PHQ9 : GAD7;

  const startAssessment = (t: AssessmentType) => {
    setType(t);
    setAnswers(new Array(t === 'PHQ9' ? 9 : 7).fill(-1));
    setCurrentQ(0);
    setResult(null);
    setPhase('questions');
  };

  const handleAnswer = (val: number) => {
    const next = [...answers];
    next[currentQ] = val;
    setAnswers(next);

    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ((q) => q + 1), 200);
    }
  };

  const handleSubmit = async () => {
    const score = answers.reduce((s, v) => s + (v >= 0 ? v : 0), 0);
    const max = questions.length * 3;
    setSubmitting(true);
    try {
      await submitAssessment(type, answers);
    } catch {}
    setResult({ score, max });
    setPhase('result');
    setSubmitting(false);
  };

  const progress = answers.filter((a) => a >= 0).length / questions.length;

  return (
    <div className="page-enter" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="headline-md">Clinical Assessments</h1>
        <p style={{ color: 'var(--on-surface-muted)', marginTop: '0.25rem' }}>
          Standardized mental health screening tools (PHQ-9 & GAD-7)
        </p>
      </div>

      {phase === 'select' && (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {[
            {
              id: 'PHQ9' as const,
              name: 'PHQ-9',
              full: 'Patient Health Questionnaire',
              desc: 'Screens for depression severity across 9 questions. Takes ~2 minutes.',
              color: '#818CF8',
              questions: 9,
            },
            {
              id: 'GAD7' as const,
              name: 'GAD-7',
              full: 'Generalized Anxiety Disorder',
              desc: 'Screens for anxiety disorder severity across 7 questions. Takes ~90 seconds.',
              color: '#34D399',
              questions: 7,
            },
          ].map((a) => (
            <div key={a.id} className="glass-card" style={{ padding: '2rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${a.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <ClipboardList size={24} color={a.color} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: a.color, marginBottom: '0.25rem' }}>{a.name}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)', marginBottom: '0.75rem' }}>{a.full}</div>
              <p style={{ color: 'var(--on-surface)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{a.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--on-surface-muted)', fontSize: '0.8rem' }}>{a.questions} questions</span>
                <button
                  id={`start-${a.id.toLowerCase()}-btn`}
                  onClick={() => startAssessment(a.id)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
                >
                  Begin <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {phase === 'questions' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          {/* Progress */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>{type}</span>
              <span style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
                {currentQ + 1} / {questions.length}
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 'var(--radius-full)' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(to right, var(--primary-dim), var(--primary))',
                borderRadius: 'var(--radius-full)',
                width: `${progress * 100}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {/* Question */}
          <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', marginBottom: '0.5rem' }}>
            Over the last 2 weeks, how often have you been bothered by:
          </p>
          <h2 style={{ fontSize: '1.1875rem', fontWeight: 700, marginBottom: '2rem', lineHeight: 1.4 }}>
            {questions[currentQ]}
          </h2>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem' }}>
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                style={{
                  padding: '0.875rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${answers[currentQ] === opt.value ? 'var(--primary)' : 'var(--outline)'}`,
                  background: answers[currentQ] === opt.value ? 'var(--primary-container)' : 'transparent',
                  color: answers[currentQ] === opt.value ? 'var(--primary)' : 'var(--on-surface)',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all var(--transition)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {currentQ > 0 && (
              <button onClick={() => setCurrentQ((q) => q - 1)} className="btn btn-ghost">
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {currentQ === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={answers.includes(-1) || submitting}
              >
                {submitting ? 'Submitting…' : 'Submit'} <CheckCircle2 size={16} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ((q) => q + 1)}
                className="btn btn-tonal"
                disabled={answers[currentQ] === -1}
              >
                Next <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'result' && result && (() => {
        const { label, color } = getSeverity(result.score, result.max);
        const pct = result.score / result.max;
        return (
          <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <BarChart3 size={40} color={color} style={{ margin: '0 auto 1.25rem' }} />
            <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)', marginBottom: '0.5rem' }}>{type} Score</div>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, color, marginBottom: '0.5rem' }}>{result.score}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)', marginBottom: '1.5rem' }}>out of {result.max}</div>

            <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 'var(--radius-full)', marginBottom: '0.5rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 'var(--radius-full)', transition: 'width 1s ease' }} />
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)',
              background: `${color}18`, border: `1px solid ${color}40`,
              color, fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem',
            }}>
              {label} {label === 'Minimal' ? '✅' : label === 'Mild' ? '⚠️' : '🚨'}
            </div>

            <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
              {label === 'Minimal' || label === 'Mild'
                ? 'Your score suggests manageable levels. Continue monitoring and use MindfulAI\'s tools regularly.'
                : 'Your score indicates a higher level of distress. We recommend reaching out to a mental health professional.'}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setPhase('select')} className="btn btn-primary">
                Take Another Assessment
              </button>
              <button onClick={() => startAssessment(type)} className="btn btn-ghost">
                Retake {type}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
