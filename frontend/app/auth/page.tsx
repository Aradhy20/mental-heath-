'use client';
import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Mail, Phone, Lock, User, Eye, EyeOff, AtSign } from 'lucide-react';
import { requestOTP, verifyOTP, signupUser, loginUser } from '@/lib/api';
import { useStore } from '@/lib/store';
import Link from 'next/link';

type Screen = 'otp' | 'signup' | 'login' | 'contact';

export default function AuthPage() {
  const router = useRouter();
  const { setUser, setToken } = useStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.cookie = 'mindful_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      localStorage.removeItem('mindfulai-store');
    }
  }, []);

  const [screen, setScreen]     = useState<Screen>('login');
  const [contact, setContact]   = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [otp, setOtp]           = useState(['','','','','','']);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showPassC, setShowPassC] = useState(false);

  // Signup form
  const [sfEmail, setSfEmail]       = useState('');
  const [sfName, setSfName]         = useState('');
  const [sfUsername, setSfUsername] = useState('');
  const [sfPass, setSfPass]         = useState('');
  const [sfPassC, setSfPassC]       = useState('');
  const [sfPhone, setSfPhone]       = useState('');

  // Login form
  const [lgEmail, setLgEmail] = useState('');
  const [lgPass, setLgPass]   = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const go = (s: Screen) => { setError(''); setScreen(s); };

  const handleOtpRequest = async () => {
    if (!contact.trim()) { setError('Please enter your email or phone.'); return; }
    setLoading(true); setError('');
    try { await requestOTP(contact.trim()); go('otp'); }
    catch (e: any) { setError(e?.response?.data?.detail || 'Could not send OTP. Try again.'); }
    finally { setLoading(false); }
  };

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter all 6 digits.'); return; }
    setLoading(true); setError('');
    try {
      const res = await verifyOTP(contact, code);
      const { user, access_token } = res.data;
      setToken(access_token);
      document.cookie = `mindful_token=${access_token}; path=/; max-age=604800; SameSite=Lax`;
      setUser({ id: user.id ?? user.user_id, name: user.name ?? user.username ?? 'User', email: user.email ?? contact, tier: user.tier ?? user.subscription_tier ?? 'free', wellnessIndex: 72 });
      router.push('/dashboard');
    } catch (e: any) { setError(e?.response?.data?.detail || 'Invalid OTP. Please retry.'); }
    finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!sfEmail || !sfUsername || !sfPass) { setError('Email, username and password are required.'); return; }
    if (sfPass !== sfPassC) { setError('Passwords do not match.'); return; }
    if (sfPass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true); setError('');
    try {
      const res = await signupUser({ email: sfEmail, username: sfUsername, password: sfPass, full_name: sfName || undefined, phone: sfPhone || undefined });
      const { user, access_token } = res.data;
      setToken(access_token);
      document.cookie = `mindful_token=${access_token}; path=/; max-age=604800; SameSite=Lax`;
      setUser({ id: user.id ?? user.user_id, name: user.name ?? sfName ?? sfUsername, email: user.email ?? sfEmail, tier: 'free', wellnessIndex: 72 });
      router.push('/dashboard');
    } catch (e: any) { setError(e?.response?.data?.detail || 'Sign up failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!lgEmail || !lgPass) { setError('Email and password are required.'); return; }
    setLoading(true); setError('');
    try {
      const res = await loginUser({ email: lgEmail, password: lgPass });
      const { user, access_token } = res.data;
      setToken(access_token);
      document.cookie = `mindful_token=${access_token}; path=/; max-age=604800; SameSite=Lax`;
      setUser({ id: user.id ?? user.user_id, name: user.name ?? user.username ?? 'User', email: user.email ?? lgEmail, tier: user.tier ?? user.subscription_tier ?? 'free', wellnessIndex: 72 });
      router.push('/dashboard');
    } catch (e: any) { setError(e?.response?.data?.detail || 'Login failed. Check your email and password.'); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%',
    background: '#FFFFFF',
    border: '1px solid rgba(124, 58, 237, 0.15)',
    borderRadius: 12,
    padding: '0.75rem 1rem',
    color: '#1E1B4B',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s',
  } as const;

  const ErrorMsg = () => error ? (
    <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      style={{ color: '#EF4444', fontSize: '0.82rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
      {error}
    </motion.p>
  ) : null;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      
      {/* Ambient Orbs */}
      <div className="aura-blob" style={{ width: 500, height: 500, background: 'rgba(124,58,237,0.08)', top: -150, right: -50 }} />
      <div className="aura-blob" style={{ width: 400, height: 400, background: 'rgba(20,184,166,0.06)', bottom: -100, left: -50 }} />

      {/* Back button */}
      <Link href="/" style={{ position: 'absolute', top: '1.5rem', left: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-muted)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#7C3AED')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-surface-muted)')}>
        ← Back
      </Link>

      {/* Main Glass Card */}
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16,1,0.3,1] }}
        style={{
          width: '100%', maxWidth: screen === 'signup' ? 490 : 430, position: 'relative', zIndex: 1,
          padding: '2.5rem 2.25rem',
          background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(124, 58, 237, 0.12)', borderRadius: '1.75rem',
          boxShadow: '0 30px 60px rgba(124, 58, 237, 0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}>

        {/* Logo and Titles */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(124,58,237,0.2)' }}>
            <Brain size={24} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>MindfulAI</h1>
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem' }}>Your AI-powered mental health companion</p>
        </div>

        {/* Demo login instructions */}
        <div style={{
          background: '#F1EEFF', border: '1px dashed rgba(124, 58, 237, 0.25)', borderRadius: 10,
          padding: '0.5rem 0.75rem', marginBottom: '1.25rem', textAlign: 'center',
          fontFamily: 'monospace', fontSize: '0.78rem', color: '#5B21B6',
        }}>
          DEMO ACCESS: demo@mindfulai.com / mindful_demo_2026
        </div>

        {/* Form Selector (Only on Login & Signup Screens) */}
        {(screen === 'login' || screen === 'signup') && (
          <div style={{ display: 'flex', background: '#F3F2FA', padding: 4, borderRadius: 12, marginBottom: '1.5rem', border: '1px solid rgba(124, 58, 237, 0.05)' }}>
            <button onClick={() => go('login')} style={{
              flex: 1, padding: '0.55rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.85rem',
              transition: 'all 0.2s',
              background: screen === 'login' ? '#7C3AED' : 'transparent',
              color: screen === 'login' ? '#FFFFFF' : '#6B7280',
              boxShadow: screen === 'login' ? '0 4px 10px rgba(124, 58, 237, 0.15)' : 'none',
            }}>
              Login
            </button>
            <button onClick={() => go('signup')} style={{
              flex: 1, padding: '0.55rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.85rem',
              transition: 'all 0.2s',
              background: screen === 'signup' ? '#7C3AED' : 'transparent',
              color: screen === 'signup' ? '#FFFFFF' : '#6B7280',
              boxShadow: screen === 'signup' ? '0 4px 10px rgba(124, 58, 237, 0.15)' : 'none',
            }}>
              Register
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ── LOGIN ── */}
          {screen === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }}>
              <div style={{ marginBottom: '0.875rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem', color: '#5A557A' }}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B8BA7' }} />
                  <input id="lg-email" type="email" placeholder="Email address" value={lgEmail} onChange={e => setLgEmail(e.target.value)} autoFocus
                    style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                    onFocus={e => { e.target.style.borderColor='#7C3AED'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.1)'; }}
                    onBlur={e =>  { e.target.style.borderColor='rgba(124,58,237,0.15)'; e.target.style.boxShadow='none'; }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem', color: '#5A557A' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B8BA7' }} />
                  <input id="lg-pass" type={showPass ? 'text' : 'password'} placeholder="Password" value={lgPass}
                    onChange={e => setLgPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                    onFocus={e => { e.target.style.borderColor='#7C3AED'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.1)'; }}
                    onBlur={e =>  { e.target.style.borderColor='rgba(124,58,237,0.15)'; e.target.style.boxShadow='none'; }}
                  />
                  <button type="button" onClick={() => setShowPass(p=>!p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B8BA7', padding: 0 }}>
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>

              <ErrorMsg />

              <button id="auth-login-btn" onClick={handleLogin} disabled={loading} className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.92rem', fontWeight: 600, background: '#7C3AED', color: 'white', borderRadius: 12, border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
                {loading ? 'Signing in…' : <>Sign In <ArrowRight size={16}/></>}
              </button>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => go('contact')} style={{ background: 'none', border: 'none', color: '#7C3AED', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                  Use one-time code (OTP) sign-in instead
                </button>
              </div>
            </motion.div>
          )}

          {/* ── SIGN UP ── */}
          {screen === 'signup' && (
            <motion.div key="signup" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                {[
                  { label: 'Full name', val: sfName,     setVal: setSfName,     ph: 'Aradhy Jain',    icon: User,    id: 'sf-name',  type: 'text' },
                  { label: 'Username',  val: sfUsername,  setVal: setSfUsername, ph: 'aradhy_j',       icon: AtSign,  id: 'sf-user',  type: 'text' },
                ].map(f => (
                  <div key={f.id}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', marginBottom: '0.35rem', color: '#5A557A' }}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <f.icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B8BA7' }} />
                      <input id={f.id} type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.setVal(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '2.25rem', fontSize: '0.84rem' }}
                        onFocus={e => { e.target.style.borderColor='#7C3AED'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.1)'; }}
                        onBlur={e =>  { e.target.style.borderColor='rgba(124,58,237,0.15)'; e.target.style.boxShadow='none'; }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {[
                { label: 'Email address *', val: sfEmail, setVal: setSfEmail, ph: 'you@example.com', icon: Mail, id: 'sf-email', type: 'email' },
                { label: 'Phone (optional)', val: sfPhone, setVal: setSfPhone, ph: '+91 98765 43210', icon: Phone, id: 'sf-phone', type: 'tel' },
              ].map(f => (
                <div key={f.id} style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', marginBottom: '0.35rem', color: '#5A557A' }}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <f.icon size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B8BA7' }} />
                    <input id={f.id} type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.setVal(e.target.value)}
                      style={{ ...inputStyle, paddingLeft: '2.25rem', fontSize: '0.84rem' }}
                      onFocus={e => { e.target.style.borderColor='#7C3AED'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.1)'; }}
                      onBlur={e =>  { e.target.style.borderColor='rgba(124,58,237,0.15)'; e.target.style.boxShadow='none'; }}
                    />
                  </div>
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Password *',       val: sfPass,  setVal: setSfPass,  id: 'sf-pass',  show: showPass,  toggle: () => setShowPass(p => !p) },
                  { label: 'Confirm password *', val: sfPassC, setVal: setSfPassC, id: 'sf-passc', show: showPassC, toggle: () => setShowPassC(p => !p) },
                ].map(f => (
                  <div key={f.id}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.78rem', marginBottom: '0.35rem', color: '#5A557A' }}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8B8BA7' }} />
                      <input id={f.id} type={f.show ? 'text' : 'password'} placeholder="••••••••" value={f.val} onChange={e => f.setVal(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '2.25rem', paddingRight: '2.5rem', fontSize: '0.84rem' }}
                        onFocus={e => { e.target.style.borderColor='#7C3AED'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.1)'; }}
                        onBlur={e =>  { e.target.style.borderColor='rgba(124,58,237,0.15)'; e.target.style.boxShadow='none'; }}
                      />
                      <button type="button" onClick={f.toggle} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B8BA7', padding: 0 }}>
                        {f.show ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <ErrorMsg />

              <button id="auth-signup-btn" onClick={handleSignup} disabled={loading} className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.9rem', fontWeight: 600, background: '#7C3AED', color: 'white', borderRadius: 12, border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                {loading ? 'Creating account…' : <>Create Account <ArrowRight size={16}/></>}
              </button>
            </motion.div>
          )}

          {/* ── OTP CONTACT ── */}
          {screen === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.15 }}>
              <div style={{ display: 'flex', background: '#F3F2FA', borderRadius: 12, padding: 4, marginBottom: '1.125rem', border: '1px solid rgba(124,58,237,0.05)' }}>
                {(['email','phone'] as const).map(t => (
                  <button key={t} onClick={() => setContactType(t)} style={{
                    flex: 1, padding: '0.5rem', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.82rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', transition: 'all 0.2s',
                    background: contactType === t ? '#7C3AED' : 'transparent',
                    color: contactType === t ? '#FFFFFF' : '#6B7280',
                    boxShadow: contactType === t ? '0 4px 10px rgba(124, 58, 237, 0.15)' : 'none',
                  }}>
                    {t === 'email' ? <Mail size={14}/> : <Phone size={14}/>} {t === 'email' ? 'Email' : 'Phone'}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.35rem', color: '#5A557A' }}>
                  {contactType === 'email' ? 'Email address' : 'Phone number'}
                </label>
                <input id="auth-contact-input" style={inputStyle} type={contactType === 'email' ? 'email' : 'tel'}
                  placeholder={contactType === 'email' ? 'you@example.com' : '+91 98765 43210'}
                  value={contact} onChange={e => setContact(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleOtpRequest()} autoFocus
                  onFocus={e => { e.target.style.borderColor='#7C3AED'; e.target.style.boxShadow='0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={e =>  { e.target.style.borderColor='rgba(124,58,237,0.15)'; e.target.style.boxShadow='none'; }}
                />
              </div>

              <ErrorMsg />

              <button id="auth-send-otp-btn" onClick={handleOtpRequest} disabled={loading} className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.92rem', fontWeight: 600, background: '#7C3AED', color: 'white', borderRadius: 12, border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                {loading ? 'Sending…' : <>Send OTP <ArrowRight size={16}/></>}
              </button>

              <button onClick={() => go('login')} style={{ background: 'none', border: 'none', color: '#8B8BA7', fontSize: '0.8rem', cursor: 'pointer', width: '100%', fontFamily: 'inherit', fontWeight: 600 }}>
                ← Back to standard login
              </button>
            </motion.div>
          )}

          {/* ── OTP VERIFY ── */}
          {screen === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}>
              <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {otp.map((digit, i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el; }} id={`otp-digit-${i}`}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)} autoFocus={i === 0}
                    style={{
                      width: '44px', height: '48px', fontSize: '1.25rem', fontWeight: 700, textAlign: 'center',
                      background: '#FFFFFF', border: '1px solid rgba(124, 58, 237, 0.15)', borderRadius: '10px',
                      color: '#1E1B4B', outline: 'none', transition: 'all 0.2s',
                      borderColor: digit ? '#7C3AED' : undefined, boxShadow: digit ? '0 0 8px rgba(124,58,237,0.15)' : undefined
                    }}
                  />
                ))}
              </div>

              <ErrorMsg />

              <button id="auth-verify-otp-btn" onClick={handleOtpVerify} disabled={loading} className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.92rem', fontWeight: 600, background: '#7C3AED', color: 'white', borderRadius: 12, border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                {loading ? 'Verifying…' : <>Verify & Sign In <ArrowRight size={16}/></>}
              </button>

              <button onClick={() => { go('contact'); setOtp(['','','','','','']); }}
                style={{ background: 'none', border: 'none', color: '#8B8BA7', fontSize: '0.8rem', cursor: 'pointer', width: '100%', fontFamily: 'inherit', fontWeight: 600 }}>
                ← Change contact info
              </button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#8B8BA7', fontSize: '0.75rem', marginTop: '1.5rem', lineHeight: 1.5 }}>
          By continuing, you agree to our <a href="#" style={{ textDecoration: 'underline', color: '#8B8BA7' }}>Terms & Privacy Policy</a>.<br />
          MindfulAI is not a substitute for professional medical care.
        </p>

      </motion.div>
    </main>
  );
}
