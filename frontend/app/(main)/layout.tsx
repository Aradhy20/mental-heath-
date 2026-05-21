'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import AppSidebar from '@/components/app-sidebar';
import CrisisGuard from '@/components/crisis-guard';
import AICompanion from '@/components/ai-companion';

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useStore();
  const [hydrated, setHydrated] = useState(false);

  // Set hydrated to true when Zustand state is loaded on the client
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace('/auth');
    }
  }, [user, hydrated, router]);

  if (!hydrated || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#090d16' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2), transparent)' }} />
          <p style={{ color: 'var(--on-surface-muted)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em' }}>HYDRATING SECURE SESSION...</p>
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
      <AICompanion mode="floating" />
    </>
  );
}
