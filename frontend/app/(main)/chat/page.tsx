'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import ChatBubble from '@/components/chat-bubble';
import { Send, Trash2, Heart, Brain, AlertTriangle, MessageCircle, Zap, Info } from 'lucide-react';
import AICompanion from '@/components/ai-companion';

const MODES = [
  { key: 'SUPPORT',  label: 'Support',  icon: Heart,          color: '#818CF8', desc: 'Compassionate listening' },
  { key: 'CBT',      label: 'CBT',      icon: Brain,          color: '#34D399', desc: 'Cognitive-behavioral' },
  { key: 'COACHING', label: 'Coaching', icon: Zap,            color: '#FBBF24', desc: 'Goal-oriented growth' },
  { key: 'CRISIS',   label: 'Crisis',   icon: AlertTriangle,  color: '#F87171', desc: 'Emergency support' },
] as const;

const STARTERS = [
  "I've been feeling really overwhelmed lately…",
  "Can you help me with a breathing exercise?",
  "I'm struggling to sleep and feel anxious.",
  "I want to challenge a negative thought.",
];

export default function ChatPage() {
  const { messages, addMessage, clearMessages, chatMode, setChatMode, setCrisisActive, token, updateMessageFeedback } = useStore();
  const [input, setInput]           = useState('');
  const [streaming, setStreaming]   = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeMode = MODES.find(m => m.key === chatMode) ?? MODES[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleFeedback = async (feedbackId: string, type: 'like' | 'dislike') => {
    try {
      const msg = messages.find(m => m.feedbackId === feedbackId);
      if (!msg) return;
      updateMessageFeedback(msg.id, feedbackId, type);
      await api.post('/api/v1/chat/feedback', { feedback_id: feedbackId, feedback_type: type, response_time_ms: 0.0 });
    } catch {}
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    addMessage({ id: crypto.randomUUID(), role: 'user', content, timestamp: Date.now() });
    setInput(''); setStreaming(true); setStreamingText('');
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res  = await fetch(`${BASE}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ message: content, mode: chatMode }),
      });
      if (!res.ok) throw new Error('Stream error');
      const reader  = res.body?.getReader();
      const decoder = new TextDecoder();
      let buf = '', reply = '', emotion = '', risk = '', feedbackId = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split('\n\n'); buf = parts.pop() || '';
          for (const part of parts) {
            const t = part.trim();
            if (!t.startsWith('data: ')) continue;
            try {
              const chunk = JSON.parse(t.replace(/^data:\s*/, ''));
              if (chunk.type === 'metadata') { emotion = chunk.emotion || ''; risk = chunk.risk || ''; feedbackId = chunk.feedback_id || ''; if (chunk.risk === 'high') setCrisisActive(true); }
              else if (chunk.type === 'token') { reply += chunk.content; setStreamingText(reply); }
              else if (chunk.type === 'error') throw new Error(chunk.content);
            } catch {}
          }
        }
      }
      addMessage({ id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: Date.now(), emotion: emotion || undefined, riskLevel: risk || undefined, feedbackId: feedbackId || undefined, feedbackType: null });
      setStreamingText('');
    } catch {
      addMessage({ id: crypto.randomUUID(), role: 'assistant', content: "I'm having trouble connecting right now. Please try again.", timestamp: Date.now() });
      setStreamingText('');
    } finally { setStreaming(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"
      style={{ maxWidth: 1120, margin: '0 auto', height: 'calc(100vh - 5rem)' }}>

      {/* Main Chat Column */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem', gap: '1rem' }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', marginBottom: '0.2rem', color: 'var(--on-surface)' }}>AI Therapist</h1>
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', display: 'inline-block', boxShadow: '0 0 8px #34D399' }} />
                Online · {activeMode.desc}
              </p>
            </div>
            <button onClick={clearMessages} className="btn btn-ghost" style={{ gap: '0.375rem', fontSize: '0.8rem', flexShrink: 0 }}>
              <Trash2 size={14} /> Clear
            </button>
          </div>

          {/* Mode pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {MODES.map(mode => (
              <button key={mode.key} id={`chat-mode-${mode.key.toLowerCase()}`} onClick={() => setChatMode(mode.key)} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${chatMode === mode.key ? mode.color : 'var(--outline)'}`,
                background: chatMode === mode.key ? `${mode.color}15` : 'var(--surface-2)',
                color: chatMode === mode.key ? mode.color : 'var(--on-surface-muted)',
                fontFamily: 'inherit', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: chatMode === mode.key ? `0 0 20px ${mode.color}25` : 'none',
              }}>
                <mode.icon size={13} /> {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages window */}
        <div className="glass-card" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '0.875rem', minHeight: 0 }}>
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', padding: '2rem', textAlign: 'center' }}>
                <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: 72, height: 72, borderRadius: '50%', background: `${activeMode.color}18`, border: `1.5px solid ${activeMode.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 36px ${activeMode.color}25` }}>
                  <activeMode.icon size={30} color={activeMode.color} />
                </motion.div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.375rem', color: 'var(--on-surface)' }}>Start a conversation</p>
                  <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
                    In <strong style={{ color: activeMode.color }}>{activeMode.label}</strong> mode · {activeMode.desc}
                  </p>
                </div>
                <div style={{ display: 'grid', gap: '0.5rem', width: '100%', maxWidth: 520 }}>
                  {STARTERS.map((s, i) => (
                    <motion.button key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
                      onClick={() => sendMessage(s)} style={{
                        textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 14,
                        border: '1px solid var(--outline)', background: 'var(--surface-2)',
                        color: 'var(--on-surface-muted)', fontFamily: 'inherit', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(124,58,237,0.08)'; (e.currentTarget).style.borderColor = 'var(--primary)'; (e.currentTarget).style.color = 'var(--on-surface)'; }}
                      onMouseLeave={e => { (e.currentTarget).style.background = 'var(--surface-2)'; (e.currentTarget).style.borderColor = 'var(--outline)'; (e.currentTarget).style.color = 'var(--on-surface-muted)'; }}>
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <>
                {messages.map(msg => <ChatBubble key={msg.id} {...msg} onFeedback={handleFeedback} />)}
                {streaming && streamingText && <ChatBubble role="assistant" content={streamingText + '▌'} timestamp={Date.now()} />}
                {streaming && !streamingText && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ display: 'flex', gap: 5, padding: '0.75rem 1rem', alignSelf: 'flex-start', background: 'var(--surface-2)', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--outline)' }}>
                    {[0,1,2].map(i => (
                      <motion.div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#818CF8' }}
                        animate={{ y: [0,-6,0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }} />
                    ))}
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-end' }}>
          <textarea id="chat-input" className="input" placeholder="Type a message… (Enter to send)" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            rows={1} style={{ resize: 'none', lineHeight: 1.5, minHeight: 50, maxHeight: 130, flex: 1 }}
          />
          <motion.button type="submit" id="chat-send-btn" disabled={!input.trim() || streaming}
            whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.04 }}
            style={{
              width: 50, height: 50, borderRadius: 14, flexShrink: 0, border: 'none', cursor: 'pointer',
              background: input.trim() && !streaming ? 'linear-gradient(135deg,#7C3AED,#6366F1)' : 'var(--surface-3)',
              color: input.trim() && !streaming ? 'white' : 'var(--on-surface-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: input.trim() && !streaming ? '0 4px 16px rgba(124,58,237,0.5)' : 'none',
              transition: 'all 0.2s',
            }}>
            <Send size={18} />
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--on-surface-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
          <Info size={11} /> AI responses are not a substitute for professional medical advice.
        </p>
      </div>

      {/* Sidekick Column */}
      <div className="hidden lg:flex" style={{ flexDirection: 'column', height: '100%', justifyContent: 'flex-start', paddingTop: '3.75rem' }}>
        <AICompanion mode="chat-sidekick" size={90} />
      </div>

    </motion.div>
  );
}
