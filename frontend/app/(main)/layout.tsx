'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import AppSidebar from '@/components/app-sidebar';
import CrisisGuard from '@/components/crisis-guard';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useStore();

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--on-surface-muted)' }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CrisisGuard />
      <AppSidebar />
      <div className="app-main" style={{ padding: '2rem 1.5rem', paddingBottom: '5rem' }}>
        {children}
      </div>
    </>
  );
}
