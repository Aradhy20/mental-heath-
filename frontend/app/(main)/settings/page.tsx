"use client";

import { useState } from 'react';
import {
  User, Shield, Bell, Database, CreditCard, LogOut,
  ChevronRight, ExternalLink, Moon, Sun, Palette,
  Lock, Download, Trash2, HelpCircle, Check,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import { updateProfile } from '@/lib/api';

const SECTIONS = [
  {
    title: 'Account',
    icon: User,
    color: '#818CF8',
    items: ['Personal Information', 'Email Preferences', 'Profile Picture'],
  },
  {
    title: 'Privacy & Security',
    icon: Shield,
    color: '#34D399',
    items: ['Session Management', 'Two-Factor Auth', 'Data Encryption'],
  },
  {
    title: 'Notifications',
    icon: Bell,
    color: '#FBBF24',
    items: ['Daily Check-in Reminders', 'Mood Alerts', 'Weekly Reports'],
  },
  {
    title: 'Data & Storage',
    icon: Database,
    color: '#C084FC',
    items: ['Export My Data (GDPR)', 'AI Memory Context', 'Clear Chat History'],
  },
];

export default function SettingsPage() {
  const { user, setUser, logout } = useStore();
  const { theme, setTheme } = useTheme();
  const [saved, setSaved] = useState(false);

  // Edit Profile States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleOpenEditModal = () => {
    setFullName(user?.name || '');
    setUsername(user?.username || '');
    setEmail(user?.email || '');
    setPhone(user?.phone || '');
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await updateProfile({
        full_name: fullName,
        username,
        email,
        phone: phone || undefined
      });
      if (res.data && res.data.user) {
        setUser({
          ...user!,
          name: res.data.user.full_name || user!.name,
          username: res.data.user.username || user!.username,
          email: res.data.user.email || user!.email,
          phone: res.data.user.phone || user!.phone,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Error updating profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="page-enter" style={{ maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2rem)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Settings</h1>
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.9375rem' }}>Manage your account, privacy, and preferences.</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.375rem', fontWeight: 800, color: 'white',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>
            {(user?.name || 'G')[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.125rem' }}>{user?.name || 'Guest User'}</h2>
            <p style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.125rem' }}>
              {user?.tier === 'pro' ? '⭐ MindfulAI Pro' : '🆓 Free Tier'}
            </p>
            <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.78rem' }}>{user?.email || '—'}</p>
          </div>
        </div>
        <button onClick={handleOpenEditModal} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
          Edit Profile
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '480px', padding: '2rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '1.5rem' }}>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-muted)', marginBottom: '0.375rem' }}>Full Name</label>
                <input className="input" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-muted)', marginBottom: '0.375rem' }}>Username</label>
                <input className="input" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-muted)', marginBottom: '0.375rem' }}>Email</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-muted)', marginBottom: '0.375rem' }}>Phone Number</label>
                <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" />
              </div>

              <div style={{ display: 'flex', justifyItems: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating} style={{ flex: 1 }}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appearance Card */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(192,132,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Palette size={16} color="#C084FC" />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Appearance</h3>
        </div>

        <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Choose your preferred theme.</p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { value: 'dark',   label: 'Dark',   icon: Moon,  desc: 'Easy on the eyes' },
            { value: 'light',  label: 'Light',  icon: Sun,   desc: 'Bright & clear' },
            { value: 'system', label: 'System', icon: Palette, desc: 'Follow OS preference' },
          ].map((t) => {
            const active = theme === t.value;
            return (
              <button key={t.value} onClick={() => setTheme(t.value)} style={{
                flex: 1, minWidth: 120, padding: '1rem', borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${active ? 'var(--primary)' : 'var(--outline)'}`,
                background: active ? 'var(--primary-container)' : 'var(--surface-2)',
                cursor: 'pointer', textAlign: 'center', transition: 'all var(--transition)',
                fontFamily: 'inherit',
              }}>
                <t.icon size={20} color={active ? 'var(--primary)' : 'var(--on-surface-muted)'} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: active ? 'var(--primary)' : 'var(--on-surface)', marginBottom: '0.125rem' }}>{t.label}</p>
                <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)' }}>{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {SECTIONS.map((section) => (
          <div key={section.title} className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.125rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${section.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <section.icon size={16} color={section.color} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--on-surface)' }}>{section.title}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
              {section.items.map((item) => (
                <button key={item} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.625rem 0.5rem', borderRadius: 'var(--radius-sm)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--on-surface-muted)', fontFamily: 'inherit', fontSize: '0.875rem',
                  transition: 'all var(--transition)', textAlign: 'left',
                }}
                  onMouseEnter={(e) => { (e.currentTarget).style.background = 'var(--surface-2)'; (e.currentTarget).style.color = 'var(--on-surface)'; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.background = 'none'; (e.currentTarget).style.color = 'var(--on-surface-muted)'; }}
                >
                  {item}
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderTop: '1px solid var(--outline)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--on-surface-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <HelpCircle size={13} /> Help & Support <ExternalLink size={11} />
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'var(--on-surface-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Lock size={13} /> Privacy Policy <ExternalLink size={11} />
          </button>
        </div>
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1.125rem', borderRadius: 'var(--radius-md)',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          color: 'var(--error)', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          transition: 'all var(--transition)',
        }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}
