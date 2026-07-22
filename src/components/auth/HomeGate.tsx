import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLevel, getStudentDashboardRoute } from '@/hooks/useStudentLevel';
import { resolveHubRoute } from '@/lib/hubResolver';
import LandingPage from '@/pages/LandingPage';

export const HomeGate: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { studentLevel } = useStudentLevel(); // metadata-seeded, non-blocking

  // If auth is still loading after 800ms with no user surfaced, assume logged-out
  // and show the landing page. Prevents a multi-second blank spinner.
  const [bailToLanding, setBailToLanding] = useState(false);
  useEffect(() => {
    if (!authLoading) return;
    const t = setTimeout(() => setBailToLanding(true), 800);
    return () => clearTimeout(t);
  }, [authLoading]);

  if (authLoading && !bailToLanding) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground text-lg font-medium">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // If the user landed inside an interview flow in another tab, do NOT
  // hijack navigation here — the interview page owns its own routing.
  if (typeof window !== 'undefined' && sessionStorage.getItem('interview_flow_active') === '1') {
    return <LandingPage />;
  }

  const role = (user as any).role;
  if (role === 'admin') return <Navigate to="/super-admin" replace />;
  if (role === 'marketing') return <Navigate to="/marketing" replace />;
  if (role === 'content_creator') return <Navigate to="/content-creator" replace />;
  if (role === 'teacher') return <Navigate to="/teacher" replace />;
  if (role === 'parent') return <Navigate to="/parent" replace />;

  if (role === 'student') {
    // Always resolve from metadata first; falls back instantly even if DB is empty.
    if (studentLevel) return <Navigate to={getStudentDashboardRoute(studentLevel)} replace />;
    const { route } = resolveHubRoute({ metadata: (user as any).user_metadata });
    return <Navigate to={route} replace />;
  }

  return <Navigate to="/dashboard" replace />;
};
