'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, MessageCircle, MapPin, ClipboardList,
  Brain, LogOut, Camera, BookOpen, BarChart3, Shield,
  Gamepad2, Zap, Settings,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { ThemeToggle } from './theme-toggle';

const NAV_MAIN = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/chat',         label: 'AI Therapist', icon: MessageCircle },
  { href: '/journal',      label: 'Journal',      icon: BookOpen },
  { href: '/insights',     label: 'Insights',     icon: BarChart3 },
  { href: '/assessments',  label: 'Assessments',  icon: ClipboardList },
];

const NAV_TOOLS = [
  { href: '/multimodal',   label: 'Multimodal',   icon: Camera },
  { href: '/resilience',   label: 'Resilience',   icon: Shield },
  { href: '/games',        label: 'Games',        icon: Gamepad2 },
  { href: '/nearby',       label: 'Nearby',       icon: MapPin },
];

const NAV_BOTTOM = [
  { href: '/settings',     label: 'Settings',     icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useStore();

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => (
    <Link
      key={href}
      href={href}
      className={`sidebar-link${isActive(href) ? ' active' : ''}`}
    >
      <Icon size={17} />
      {label}
    </Link>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.75rem', padding: '0 0.5rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.45)', flexShrink: 0,
          }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--on-surface)' }}>MindfulAI</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)', letterSpacing: '0.04em' }}>Wellness Copilot</div>
          </div>
        </div>

        {/* Main Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {NAV_MAIN.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>

        {/* Tools Section */}
        <div style={{ margin: '1rem 0 0.25rem', padding: '0 0.5rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--on-surface-muted)' }}>
            Tools
          </span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {NAV_TOOLS.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom Section */}
        <div style={{ borderTop: '1px solid var(--outline)', paddingTop: '0.875rem', marginTop: '0.875rem' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.75rem' }}>
            {NAV_BOTTOM.map((item) => <NavLink key={item.href} {...item} />)}
          </nav>

          {/* User Row */}
          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.5rem', marginBottom: '0.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-2)',
            }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: 'white',
              }}>
                {(user.name || user.username || 'G')[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || user.username || 'Guest'}
                </div>
                <div style={{ color: 'var(--on-surface-muted)', fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.tier || 'Free'}
                </div>
              </div>
              {/* Theme toggle inline */}
              <ThemeToggle />
            </div>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            className="sidebar-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav — most-used items only */}
      <nav className="mobile-nav">
        {[...NAV_MAIN.slice(0, 4), { href: '/settings', label: 'Settings', icon: Settings }].map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
              padding: '0.5rem 0.625rem',
              color: active ? 'var(--primary)' : 'var(--on-surface-muted)',
              textDecoration: 'none', fontSize: '0.62rem', fontWeight: 600,
              borderRadius: 'var(--radius-sm)', transition: 'color var(--transition)',
            }}>
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
