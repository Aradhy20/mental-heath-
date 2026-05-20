'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageCircle,
  MapPin,
  ClipboardList,
  Brain,
  LogOut,
  Menu,
  X,
  Camera,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { useState } from 'react';

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/chat',         label: 'Copilot',      icon: MessageCircle },
  { href: '/face-tracker', label: 'Face Tracker', icon: Camera },
  { href: '/nearby',       label: 'Nearby',       icon: MapPin },
  { href: '/assessments',  label: 'Assessments',  icon: ClipboardList },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.5)',
          }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--on-surface)' }}>MindfulAI</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>Wellness Copilot</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} className={`sidebar-link${active ? ' active' : ''}`}>
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ borderTop: '1px solid var(--outline)', paddingTop: '1rem', marginTop: '1rem' }}>
          {user && (
            <div style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</div>
              <div style={{ color: 'var(--on-surface-muted)', fontSize: '0.75rem' }}>{user.email}</div>
            </div>
          )}
          <button
            onClick={logout}
            className="sidebar-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                padding: '0.5rem 0.75rem',
                color: active ? 'var(--primary)' : 'var(--on-surface-muted)',
                textDecoration: 'none', fontSize: '0.65rem', fontWeight: 600,
                borderRadius: 'var(--radius-sm)', transition: 'color var(--transition)',
              }}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
