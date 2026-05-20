'use client';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { useStore } from '@/lib/store';
import { sendChatMessage, api } from '@/lib/api';
import ChatBubble from '@/components/chat-bubble';
import {
  Send, Mic, MicOff, Trash2, ChevronDown, Zap,
  Heart, Brain, AlertTriangle, MessageCircle,
} from 'lucide-react';

const MODES = [
  { key: 'SUPPORT',  label: 'Support',  icon: Heart,         color: '#818CF8', desc: 'Compassionate listening' },
  { key: 'CBT',      label: 'CBT',      icon: Brain,         color: '#34D399', desc: 'Cognitive-behavioral tools' },
  { key: 'COACHING', label: 'Coaching', icon: Zap,           color: '#FBBF24', desc: 'Goal-oriented growth' },
  { key: 'CRISIS',   label: 'Crisis',   icon: AlertTriangle, color: '#F87171', desc: 'Immediate safety support' },
] as const;

const STARTERS = [
  "I've been feeling really overwhelmed lately…",
  "Can you help me with a breathing exercise?",
  "I'm struggling to sleep and feel anxious.",
  "I want to challenge a negative thought.",
];

export default function ChatPage() {
  const {
    messages,
    addMessage,
    clearMessages,
    chatMode,
    setChatMode,
    setCrisisActive,
    token,
    updateMessageFeedback,
  } = useStore();
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleFeedback = async (feedbackId: string, type: 'like' | 'dislike') => {
    try {
      const msg = messages.find((m) => m.feedbackId === feedbackId);
      if (!msg) return;

      // Update feedback type locally in state
      updateMessageFeedback(msg.id, feedbackId, type);

      // POST to backend chat feedback endpoint
      await api.post('/api/v1/chat/feedback', {
        feedback_id: feedbackId,
        feedback_type: type,
        response_time_ms: 0.0,
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput('');
    setStreaming(true);
    setStreamingText('');

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${BASE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: content, mode: chatMode })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      let replyText = '';
      let emotion = '';
      let riskLevel = '';
      let feedbackId = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';
          
          for (const part of parts) {
            const trimmedPart = part.trim();
            if (trimmedPart.startsWith('data: ')) {
              const jsonStr = trimmedPart.replace(/^data:\s*/, '').trim();
              try {
                const chunk = JSON.parse(jsonStr);
                if (chunk.type === 'metadata') {
                  emotion = chunk.emotion || '';
                  riskLevel = chunk.risk || '';
                  feedbackId = chunk.feedback_id || '';
                  if (chunk.risk === 'high') {
                    setCrisisActive(true);
                  }
                } else if (chunk.type === 'token') {
                  replyText += chunk.content;
                  setStreamingText(replyText);
                } else if (chunk.type === 'error') {
                  throw new Error(chunk.content);
                }
              } catch (e) {
                console.error('Error parsing SSE chunk:', e);
              }
            }
          }
        }
      }

      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: replyText,
        timestamp: Date.now(),
        emotion: emotion || undefined,
        riskLevel: riskLevel || undefined,
        feedbackId: feedbackId || undefined,
        feedbackType: null
      });
      setStreamingText('');
    } catch (err) {
      console.error(err);
      addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now(),
      });
      setStreamingText('');
    } finally {
      setStreaming(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h1 className="headline-md">AI Copilot</h1>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>Real-time mental wellness support</p>
          </div>
          <button
            onClick={clearMessages}
            className="btn btn-ghost"
            style={{ gap: '0.375rem', fontSize: '0.8rem' }}
            title="Clear conversation"
          >
            <Trash2 size={15} /> Clear
          </button>
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {MODES.map((mode) => {
            const active = chatMode === mode.key;
            return (
              <button
                key={mode.key}
                id={`chat-mode-${mode.key.toLowerCase()}`}
                onClick={() => setChatMode(mode.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.4rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${active ? mode.color : 'var(--outline)'}`,
                  background: active ? `${mode.color}18` : 'transparent',
                  color: active ? mode.color : 'var(--on-surface-muted)',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: '0.8125rem',
                  cursor: 'pointer', transition: 'all var(--transition)',
                  boxShadow: active ? `0 0 12px ${mode.color}30` : 'none',
                }}
              >
                <mode.icon size={14} />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div
        className="glass-card"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1rem',
          minHeight: 0,
        }}
      >
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(99,102,241,0.4)',
            }}>
              <MessageCircle size={28} color="white" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Start a conversation</p>
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>Choose a starter below or type your own.</p>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem', width: '100%', maxWidth: 480 }}>
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="btn btn-ghost"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.875rem', padding: '0.625rem 1rem' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} {...msg} onFeedback={handleFeedback} />
            ))}
            {streaming && streamingText && (
              <ChatBubble
                role="assistant"
                content={streamingText + '▌'}
                timestamp={Date.now()}
              />
            )}
            {streaming && !streamingText && (
              <div style={{ display: 'flex', gap: '4px', padding: '0.75rem 1rem', alignSelf: 'flex-start' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--primary)',
                      animation: `aura-float 1.2s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={inputRef}
            id="chat-input"
            className="input"
            placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{ resize: 'none', paddingRight: '3rem', lineHeight: 1.5, minHeight: 48, maxHeight: 120 }}
          />
        </div>
        <button
          type="submit"
          id="chat-send-btn"
          className="btn btn-primary"
          disabled={!input.trim() || streaming}
          style={{ padding: '0.75rem', flexShrink: 0 }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
