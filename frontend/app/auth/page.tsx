'use client';
import { useState, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, ArrowRight, Phone, Mail } from 'lucide-react';
import { requestOTP, verifyOTP } from '@/lib/api';
import { useStore } from '@/lib/store';

type Step = 'contact' | 'otp';

export default function AuthPage() {
  const router = useRouter();
  const { setUser, setToken } = useStore();

  const [step, setStep] = useState<Step>('contact');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleContactSubmit = async () => {
    if (!contact.trim()) { setError('Please enter your email or phone.'); return; }
    setLoading(true);
    setError('');
    try {
      await requestOTP(contact.trim());
      setStep('otp');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPSubmit = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the 6-digit code.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await verifyOTP(contact, code);
      const { user, access_token } = res.data;
      setToken(access_token);
      setUser({
        id: user.id,
        name: user.name || 'User',
        email: user.email || contact,
        tier: user.tier || 'free',
        wellnessIndex: user.wellness_index || 72,
      });
      router.push('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Aura */}
      <div className="aura-blob" style={{ width: 400, height: 400, background: 'rgba(99,102,241,0.12)', top: -100, right: -100 }} />
      <div className="aura-blob" style={{ width: 300, height: 300, background: 'rgba(52,211,153,0.08)', bottom: -60, left: -60, animationDelay: '4s' }} />

      <div
        className="glass-card page-enter"
        style={{ width: '100%', maxWidth: 440, padding: '2.5rem', position: 'relative', zIndex: 1 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 24px rgba(99,102,241,0.5)',
          }}>
            <Brain size={26} color="white" />
          </div>
          <h1 className="headline-md" style={{ marginBottom: '0.375rem' }}>Welcome to MindfulAI</h1>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.9rem' }}>
            {step === 'contact' ? 'Sign in or create your account' : `Enter the 6-digit code sent to ${contact}`}
          </p>
        </div>

        {step === 'contact' ? (
          <>
            {/* Contact type toggle */}
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: 4, marginBottom: '1.25rem' }}>
              {(['email', 'phone'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setContactType(t)}
                  style={{
                    flex: 1, padding: '0.5rem',
                    borderRadius: 'calc(var(--radius-md) - 2px)',
                    border: 'none', cursor: 'pointer',
                    background: contactType === t ? 'var(--primary-container)' : 'transparent',
                    color: contactType === t ? 'var(--primary)' : 'var(--on-surface-muted)',
                    fontFamily: 'inherit', fontWeight: 600, fontSize: '0.875rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                    transition: 'all var(--transition)',
                  }}
                >
                  {t === 'email' ? <Mail size={15} /> : <Phone size={15} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {contactType === 'email' ? 'Email address' : 'Phone number'}
              </label>
              <input
                id="auth-contact-input"
                className="input"
                type={contactType === 'email' ? 'email' : 'tel'}
                placeholder={contactType === 'email' ? 'you@example.com' : '+91 98765 43210'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleContactSubmit()}
                autoFocus
              />
            </div>

            {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

            <button
              id="auth-send-otp-btn"
              onClick={handleContactSubmit}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send OTP'} {!loading && <ArrowRight size={17} />}
            </button>
          </>
        ) : (
          <>
            {/* OTP inputs */}
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  id={`otp-digit-${i}`}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(i, e.target.value)}
                  onKeyDown={(e) => handleOTPKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

            <button
              id="auth-verify-otp-btn"
              onClick={handleOTPSubmit}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginBottom: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Verifying…' : 'Verify & Sign In'} {!loading && <ArrowRight size={17} />}
            </button>

            <button
              onClick={() => { setStep('contact'); setOtp(['','','','','','']); setError(''); }}
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              ← Change contact
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.75rem', marginTop: '1.5rem', lineHeight: 1.5 }}>
          By continuing, you agree to our Terms of Service. <br />
          MindfulAI is not a substitute for professional therapy.
        </p>
      </div>
    </main>
  );
}
