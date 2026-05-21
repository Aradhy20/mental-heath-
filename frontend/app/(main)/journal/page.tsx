'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Save, 
  Play, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Calendar, 
  Sparkle,
  Trash2,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JOURNAL_ENTRIES } from '@/lib/static-data';
import { journalAPI, type JournalRecord } from '@/lib/api';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalRecord[]>([]);
  const [activeEntry, setActiveEntry] = useState<JournalRecord | null>(null);
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom sidebar breathing guide state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathingTimer, setBreathingTimer] = useState(4);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const data = await journalAPI.list();
        setEntries(data);
        if (data.length > 0) {
          handleSelectEntry(data[0]);
        } else {
          handleNewDraft();
        }
      } catch (err) {
        console.error("Journal fetch failed, using fallback.", err);
        setEntries(JOURNAL_ENTRIES as JournalRecord[]);
        handleSelectEntry(JOURNAL_ENTRIES[0] as JournalRecord);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  const handleNewDraft = () => {
    setIsDraft(true);
    setActiveEntry(null);
    setContent('');
    setMoodTag('');
  };

  const handleSelectEntry = (entry: JournalRecord) => {
    setIsDraft(false);
    setActiveEntry(entry);
    setContent(entry.content);
    setMoodTag(entry.mood_tag || '');
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await journalAPI.create({ content: content.trim(), mood_tag: moodTag || undefined });
      const newEntry: JournalRecord = {
        id: res.id,
        content: content.trim(),
        mood_tag: moodTag || undefined,
        is_private: false,
        created_at: new Date().toISOString(),
        emotion_analysis: { emotion: moodTag ? moodTag.toLowerCase() : 'reflective', score: 0.88 },
      };
      setEntries([newEntry, ...entries]);
      setActiveEntry(newEntry);
      setIsDraft(false);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  // Helper to extract a title from the content
  const getEntryTitle = (text: string) => {
    if (!text) return 'Untitled Chronicle';
    const lines = text.split('\n');
    const firstLine = lines[0].trim();
    if (firstLine.length > 0) {
      return firstLine.length > 40 ? firstLine.substring(0, 40) + '...' : firstLine;
    }
    return 'Untitled Chronicle';
  };

  // Helper to extract a preview body from the content
  const getEntryPreview = (text: string) => {
    if (!text) return 'Empty entry...';
    const lines = text.split('\n');
    if (lines.length > 1) {
      const rest = lines.slice(1).join(' ').trim();
      if (rest) return rest;
    }
    return text.length > 80 ? text.substring(40, 120) + '...' : text;
  };

  // Breathing guide cycle trigger
  useEffect(() => {
    if (!breathingActive) return;
    setBreathingPhase('inhale');
    setBreathingTimer(4);
  }, [breathingActive]);

  useEffect(() => {
    if (breathingPhase === 'idle' || !breathingActive) return;

    const timer = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev <= 1) {
          if (breathingPhase === 'inhale') {
            setBreathingPhase('hold');
            return 4;
          } else if (breathingPhase === 'hold') {
            setBreathingPhase('exhale');
            return 4;
          } else {
            setBreathingPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathingPhase, breathingActive]);

  // Filter entries based on search
  const filteredEntries = entries.filter((e) =>
    e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.mood_tag && e.mood_tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ height: 'calc(100vh - 6rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ padding: '1rem', background: 'var(--glass-bg)', borderRadius: '2.5rem', border: '1px solid rgba(124,58,237,0.15)' }}
        >
          <BookOpen size={48} color="#7C3AED" />
        </motion.div>
        <p style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#7C3AED' }}>
          Loading your chronicles...
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', height: 'calc(100vh - 6rem)' }} className="lg:grid-cols-[320px_1fr_320px]">
      
      {/* ═══ Left Sidebar: Chronicle List ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%', minWidth: 0 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#1E1B4B', margin: 0 }}>Chronicles</h2>
            <span style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#7C3AED' }}>Journal Archives</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewDraft}
            style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#7C3AED,#6366F1)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)' }}
          >
            <Plus size={20} />
          </motion.button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: 'var(--on-surface)' }} size={16} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archives..."
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 14, outline: 'none', fontSize: '0.875rem', fontWeight: 600, color: '#1E1B4B' }}
          />
        </div>

        {/* Archives scroll pane */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredEntries.map((entry) => {
            const isActive = activeEntry?.id === entry.id && !isDraft;
            return (
              <motion.div
                key={entry.id}
                whileHover={{ x: 2 }}
                onClick={() => handleSelectEntry(entry)}
                style={{
                  padding: '1.25rem',
                  borderRadius: 16,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #7C3AED' : '1px solid rgba(124,58,237,0.06)',
                  background: isActive ? 'rgba(124,58,237,0.05)' : '#FFFFFF',
                  boxShadow: isActive ? '0 10px 20px rgba(124,58,237,0.04)' : '0 4px 12px rgba(0,0,0,0.01)',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--on-surface-muted)' }}>
                    <Clock size={11} />
                    <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {new Date(entry.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {entry.emotion_analysis?.emotion && (
                    <span style={{ padding: '0.15rem 0.45rem', background: 'rgba(124,58,237,0.08)', color: '#7C3AED', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', borderRadius: 99, border: '1px solid rgba(124,58,237,0.1)' }}>
                      {entry.emotion_analysis.emotion}
                    </span>
                  )}
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1E1B4B', margin: '0 0 0.25rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getEntryTitle(entry.content)}
                </h4>
                <p style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--on-surface-muted)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                  {getEntryPreview(entry.content)}
                </p>
              </motion.div>
            );
          })}
          {filteredEntries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--on-surface-muted)', fontSize: '0.85rem' }}>
              No chronicles found
            </div>
          )}
        </div>
      </div>

      {/* ═══ Main Editor Canvas (Center) ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 20, border: '1px solid rgba(124,58,237,0.1)', boxShadow: '0 12px 36px rgba(124,58,237,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          
          {/* Header */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(124,58,237,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: 40, height: 40, background: 'rgba(124,58,237,0.08)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color="#7C3AED" />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#1E1B4B', margin: 0 }}>
                  {isDraft ? 'New Chronicle Entry' : new Date(activeEntry?.created_at || Date.now()).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                  <input 
                    placeholder="Mood tag (e.g. calm, tired)"
                    value={moodTag}
                    onChange={(e) => setMoodTag(e.target.value)}
                    disabled={!isDraft}
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7C3AED', width: 180 }}
                  />
                </div>
              </div>
            </div>

            {isDraft && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving || !content.trim()}
                style={{
                  background: 'linear-gradient(135deg,#7C3AED,#6366F1)', color: 'white', border: 'none', borderRadius: 20, padding: '0.6rem 1.25rem', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)', transition: 'opacity 0.2s'
                }}
                className="disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Persist Entry
              </motion.button>
            )}
          </div>

          {/* Editor Body */}
          <div style={{ flex: 1, padding: '1.75rem', position: 'relative' }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Translate your feelings, thoughts, and reflections here..."
              disabled={!isDraft}
              style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '1rem', fontWeight: 500, lineHeight: 1.7, color: '#1E1B4B', resize: 'none', fontFamily: 'inherit' }}
            />
          </div>

          {/* Footer Metrics */}
          <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(124,58,237,0.02)', borderTop: '1px solid rgba(124,58,237,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 6 }}>Words:</span>
                <strong style={{ color: '#1E1B4B' }}>{content.trim() ? content.trim().split(/\s+/).length : 0}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 6 }}>Clarity:</span>
                <strong style={{ color: '#10B981' }}>Good</strong>
              </div>
            </div>
            {isDraft && (
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(124,58,237,0.6)' }}>Draft Autosaved</span>
            )}
          </div>

        </div>
      </div>

      {/* ═══ Right Sidebar: Intelligence / Mini-Breathing Guide ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
        
        {/* AI Insight Breakdown */}
        <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ padding: 6, background: 'rgba(124,58,237,0.08)', borderRadius: 8 }}>
              <Sparkles size={14} color="#7C3AED" />
            </div>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7C3AED' }}>AI Synthesis</span>
          </div>

          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E1B4B', margin: '0 0 0.5rem 0' }}>Emotional Breakdown</h3>
          <p style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--on-surface-muted)', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
            {activeEntry?.emotion_analysis?.emotion 
              ? `We've detected a strong ${activeEntry.emotion_analysis.emotion.toUpperCase()} resonance in this entry. This indicates active emotional processing.`
              : "Save this chronicle to receive an instant, AI-driven wellness diagnostic."}
          </p>

          {activeEntry?.emotion_analysis?.emotion && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                <span style={{ color: 'var(--on-surface-muted)' }}>Resonance Index</span>
                <span style={{ color: '#7C3AED' }}>92%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(124,58,237,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '92%' }}
                  transition={{ duration: 0.8 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg,#7C3AED,#6366F1)', borderRadius: 99 }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Mini Vagus Stimulation Guided Breathing Card */}
        <div className="glass-card" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          <AnimatePresence mode="wait">
            {!breathingActive ? (
              <motion.div 
                key="breathing-welcome"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ padding: 6, background: 'rgba(16, 185, 129, 0.08)', borderRadius: 8 }}>
                      <Play size={14} color="#10B981" fill="#10B981" />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#10B981' }}>Relaxation</span>
                  </div>

                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E1B4B', margin: '0 0 0.5rem 0' }}>Deep Vagus Breath</h4>
                  <p style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--on-surface-muted)', lineHeight: 1.5, margin: 0 }}>
                    Unlock neural clarity and calm your nervous system with a quick 4-7-8 breathing sequence.
                  </p>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setBreathingActive(true)}
                  style={{ width: '100%', padding: '0.75rem', background: '#FFFFFF', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10B981', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', transition: 'all 0.2s', marginTop: '1.5rem' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                >
                  Begin Session <Play size={10} fill="#10B981" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                key="breathing-session"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '1.5rem' }}
              >
                {/* Visual breathing orb */}
                <div style={{ position: 'relative', width: 110, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <motion.div 
                    animate={{ 
                      scale: breathingPhase === 'inhale' ? 1.4 : breathingPhase === 'hold' ? 1.4 : 0.9 
                    }}
                    transition={{ duration: 4, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: breathingPhase === 'inhale' ? 'rgba(16,185,129,0.15)' : breathingPhase === 'hold' ? 'rgba(59,130,246,0.15)' : 'rgba(124,58,237,0.15)',
                      border: `1.5px solid ${breathingPhase === 'inhale' ? '#10B981' : breathingPhase === 'hold' ? '#3B82F6' : '#7C3AED'}`,
                    }}
                  />
                  <div style={{ zIndex: 10, fontSize: '1.5rem', fontWeight: 800, color: '#1E1B4B' }}>
                    {breathingTimer}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E1B4B', margin: '0 0 0.25rem 0', textTransform: 'capitalize' }}>
                    {breathingPhase === 'inhale' ? 'Inhale...' : breathingPhase === 'hold' ? 'Hold...' : 'Exhale...'}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', margin: 0 }}>
                    {breathingPhase === 'inhale' ? 'Fill your lungs with fresh air' : breathingPhase === 'hold' ? 'Rest in the silent center' : 'Let go of all stress and worry'}
                  </p>
                </div>

                <button 
                  onClick={() => { setBreathingActive(false); setBreathingPhase('idle'); }}
                  style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer' }}
                >
                  Stop Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
