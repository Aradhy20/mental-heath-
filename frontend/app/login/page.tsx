'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Smartphone, ArrowRight, Loader2, KeyRound, ShieldCheck, Lock } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.login);

  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [otpMode, setOtpMode] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState(1); // Step 1: Request, Step 2: Verify
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State
  const [emailData, setEmailData] = useState({ email: '', password: '' });
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await authAPI.login(emailData);
      setAuth(response.data.user, response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = otpMode === 'email' ? { email: contact } : { phone: contact };
      const response = await authAPI.requestOTP(payload);

      if (response.data.debug_otp) {
        // keep debug behavior for phones if needed, or remove for prod
        console.log('Debug OTP:', response.data.debug_otp);
      }
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to send OTP to ${contact}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = otpMode === 'email'
        ? { email: contact, otp }
        : { phone: contact, otp };

      const response = await authAPI.verifyOTP(payload);
      setAuth(response.data.user, response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#0A0A0F]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-purple-500/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Choose your preferred login method.</p>
          </div>

          {/* Login Type Switcher */}
          <div className="flex p-1 bg-white/5 rounded-xl mb-8 border border-white/5">
            <button
              onClick={() => { setLoginMode('password'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${loginMode === 'password' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
            >
              <Lock size={16} /> Password
            </button>
            <button
              onClick={() => { setLoginMode('otp'); setStep(1); setError(''); setContact(''); setOtp(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${loginMode === 'otp' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
            >
              <KeyRound size={16} /> OTP Code
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-6 rounded-lg border bg-red-500/10 border-red-500/20 text-red-400 text-xs text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {loginMode === 'password' ? (
              <motion.form
                key="password-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handlePasswordLogin}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" size={18} />
                      <input
                        type="email"
                        placeholder="identity@protocol.com"
                        value={emailData.email}
                        onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-4 rounded-2xl glass-input focus:outline-none text-sm bg-white/5 border border-white/5 focus:border-purple-500/50 transition-all text-white placeholder-gray-600"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" size={18} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={emailData.password}
                        onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                        className="w-full pl-11 pr-4 py-4 rounded-2xl glass-input focus:outline-none text-sm bg-white/5 border border-white/5 focus:border-purple-500/50 transition-all text-white placeholder-gray-600"
                        required
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                    }`}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'LOGIN SECURELY'}
                  <ArrowRight size={18} />
                </button>
              </motion.form>
            ) : (
              <div className="space-y-6">
                {/* OTP Sub-Mode Switcher */}
                <div className="flex gap-4 mb-4 justify-center text-xs">
                  <button
                    onClick={() => { setOtpMode('email'); setContact(''); }}
                    className={`pb-1 border-b-2 transition-all ${otpMode === 'email' ? 'border-purple-500 text-white font-bold' : 'border-transparent text-gray-500'}`}
                  >
                    Via Email
                  </button>
                  <button
                    onClick={() => { setOtpMode('phone'); setContact(''); }}
                    className={`pb-1 border-b-2 transition-all ${otpMode === 'phone' ? 'border-purple-500 text-white font-bold' : 'border-transparent text-gray-500'}`}
                  >
                    Via SMS
                  </button>
                </div>

                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={step === 1 ? handleRequestOTP : handleVerifyOTP}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {step === 1 ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                          {otpMode === 'email' ? 'Email Address' : 'Phone Number'}
                        </label>
                        <div className="relative group">
                          {otpMode === 'email' ? (
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-400 transition-colors" size={18} />
                          ) : (
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-400 transition-colors" size={18} />
                          )}

                          <input
                            type={otpMode === 'email' ? 'email' : 'tel'}
                            placeholder={otpMode === 'email' ? 'identity@protocol.com' : '+1 (555) 000-0000'}
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 rounded-2xl glass-input focus:outline-none text-sm bg-white/5 border border-white/5 focus:border-purple-500/50 transition-all text-white placeholder-gray-600"
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                          Verification Code
                        </label>
                        <div className="relative group">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-400 transition-colors" size={18} />
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-11 pr-4 py-4 rounded-2xl glass-input focus:outline-none text-sm bg-white/5 border border-white/5 focus:border-emerald-500/50 transition-all text-white placeholder-gray-600 tracking-widest font-mono"
                            required
                            maxLength={6}
                            autoFocus
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-[10px] text-gray-400 hover:text-white transition-colors ml-1"
                        >
                          ← Change {otpMode === 'email' ? 'email' : 'number'}
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                      }`}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        {step === 1 ? 'SEND CODE' : 'VERIFY & ENTER'}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </motion.form>
              </div>
            )}
          </AnimatePresence>

          <div className="mt-10 text-center border-t border-white/5 pt-6">
            <p className="text-xs text-gray-500 mb-2">New to the platform?</p>
            <Link href="/register" className="inline-block px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all border border-white/5">
              CREATE SECURE ACCOUNT
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
