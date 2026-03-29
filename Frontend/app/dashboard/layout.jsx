'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { LoadingPage } from '@/components/ui/loading';

export default function DashboardLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-slate-950">
        <LoadingPage message="Chargement de votre espace..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950">
      <Sidebar />
      <div className="lg:ml-[var(--sidebar-current-width)] transition-all duration-300 min-h-screen">
        <Topbar />
        <main className="p-5 md:p-8 max-w-[1360px] mx-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
