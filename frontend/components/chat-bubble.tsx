'use client';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface BubbleProps {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  emotion?: string;
  riskLevel?: string;
  feedbackId?: string;
  feedbackType?: 'like' | 'dislike' | null;
  onFeedback?: (feedbackId: string, type: 'like' | 'dislike') => void;
}

const emotionColors: Record<string, string> = {
  happy:   '#34D399',
  sad:     '#818CF8',
  anxious: '#FBBF24',
  angry:   '#F87171',
  neutral: '#8b8ba8',
};

export default function ChatBubble({
  role,
  content,
  timestamp,
  emotion,
  riskLevel,
  feedbackId,
  feedbackType,
  onFeedback,
}: BubbleProps) {
  const isUser = role === 'user';
  const emotionColor = emotion ? emotionColors[emotion] ?? '#8b8ba8' : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: '0.25rem',
      }}
    >
      {/* Emotion / risk badge on AI messages */}
      {!isUser && (emotion || riskLevel) && (
        <div style={{ display: 'flex', gap: '0.375rem', paddingLeft: '0.5rem' }}>
          {emotion && (
            <span
              className="badge"
              style={{
                background: `${emotionColor}20`,
                color: emotionColor ?? undefined,
                fontSize: '0.7rem',
              }}
            >
              {emotion}
            </span>
          )}
          {riskLevel && riskLevel !== 'low' && (
            <span
              className={`badge badge-${riskLevel === 'high' ? 'error' : 'warning'}`}
              style={{ fontSize: '0.7rem' }}
            >
              {riskLevel} risk
            </span>
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={isUser ? 'bubble-user' : 'bubble-ai'}
        style={{
          position: 'relative',
          ...(emotionColor && !isUser
            ? { borderLeft: `3px solid ${emotionColor}` }
            : {}),
        }}
      >
        <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {content}
        </p>
      </div>

      {/* Timestamp & Feedback Action Buttons */}
      {!isUser && feedbackId ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem', marginTop: '0.15rem' }}>
          {timestamp && (
            <span style={{ color: 'var(--on-surface-muted)', fontSize: '0.7rem' }}>
              {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span style={{ color: 'var(--outline-strong)', fontSize: '0.7rem' }}>•</span>
          <button
            type="button"
            onClick={() => onFeedback?.(feedbackId, 'like')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: feedbackType === 'like' ? 'var(--secondary)' : 'var(--on-surface-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              borderRadius: '4px',
              transition: 'transform var(--transition), color var(--transition)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
            title="Helpful"
          >
            <ThumbsUp size={13} fill={feedbackType === 'like' ? 'var(--secondary)' : 'none'} />
          </button>
          <button
            type="button"
            onClick={() => onFeedback?.(feedbackId, 'dislike')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: feedbackType === 'dislike' ? 'var(--error)' : 'var(--on-surface-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              borderRadius: '4px',
              transition: 'transform var(--transition), color var(--transition)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
            title="Not helpful"
          >
            <ThumbsDown size={13} fill={feedbackType === 'dislike' ? 'var(--error)' : 'none'} />
          </button>
        </div>
      ) : (
        timestamp && (
          <span style={{ color: 'var(--on-surface-muted)', fontSize: '0.7rem', padding: '0 0.5rem' }}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )
      )}
    </div>
  );
}
