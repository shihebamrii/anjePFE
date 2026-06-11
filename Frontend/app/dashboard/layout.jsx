'use client';

// Import custom authentication context
import { useAuth } from '@/context/AuthContext';
// Import router hooks for handling client-side navigation redirects
import { useRouter } from 'next/navigation';
// Import React effect lifecycle hook
import { useEffect } from 'react';
// Import layout components (Sidebar on left, Topbar on top)
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
// Import UI helper displaying loading screen
import { LoadingPage } from '@/components/ui/loading';

// Dashboard layout wrapping all sub-dashboard views (admin, chef, teacher, student, partner)
export default function DashboardLayout({ children }) {
  // Extract user details, loading and authenticated state status
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Route protection gatekeeper: redirects unlogged guests to login page once loading is done
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Display fullscreen loader component if checking auth status is still in progress
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-slate-950">
        <LoadingPage message="Chargement de votre espace..." />
      </div>
    );
  }

  // Prevent flashing private page content before routing redirection runs
  if (!isAuthenticated) return null;

  return (
    // Dashboard main frame container
    <div className="min-h-screen bg-surface dark:bg-slate-950">
      {/* Left Sidebar */}
      <Sidebar />
      {/* Main Content Area: adjusts left margin dynamically based on sidebar width CSS variable */}
      <div className="lg:ml-[var(--sidebar-current-width)] transition-all duration-300 min-h-screen">
        {/* Top Navbar */}
        <Topbar />
        {/* Center content container panel */}
        <main className="p-5 md:p-8 max-w-[1360px] mx-auto">
          {/* Animated wrapper page context */}
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
