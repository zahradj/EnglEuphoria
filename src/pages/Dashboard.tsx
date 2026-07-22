import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentLevel, getStudentDashboardRoute } from '@/hooks/useStudentLevel';
import { resolveHubRoute } from '@/lib/hubResolver';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { studentLevel, onboardingCompleted, loading: studentLoading, refetch } = useStudentLevel();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const autoHealAttemptedRef = useRef(false);

  // Hard escape hatch — if nothing resolves in 4s, route from metadata.
  // CRITICAL: Always check role BEFORE hub assignment. A teacher must NEVER
  // be routed to a student hub even if they have a hub_type in metadata.
  useEffect(() => {
    const hardTimeout = setTimeout(() => {
      if (!redirectPath && user) {
        const cachedRole = typeof window !== 'undefined'
          ? sessionStorage.getItem('auth_resolved_role')
          : null;
        const role = (user as any).role || cachedRole || (user as any).user_metadata?.role;
        if (role === 'admin') { setRedirectPath('/super-admin'); return; }
        if (role === 'marketing') { setRedirectPath('/marketing'); return; }
        if (role === 'teacher') { setRedirectPath('/teacher'); return; }
        if (role === 'content_creator') { setRedirectPath('/content-creator'); return; }
        if (role === 'parent') { setRedirectPath('/parent'); return; }
        if (role === 'applicant' || (user as any).user_metadata?.interview_guest) {
          const interviewId = (user as any).user_metadata?.interview_id;
          setRedirectPath(interviewId ? `/interview/${interviewId}` : '/teach-with-us');
          return;
        }

        const { route, source } = resolveHubRoute({ metadata: (user as any).user_metadata });
        console.warn(`⏱️ [Dashboard] 4s timeout — routing from ${source} →`, route);
        toast.warning("We couldn't verify your hub from the database.", {
          description: 'Redirecting you to your default dashboard.',
          duration: 4000,
        });
        setRedirectPath(route);
      }
    }, 4000);
    return () => clearTimeout(hardTimeout);
  }, [user, redirectPath]);

  useEffect(() => {
    if (redirectPath) return;
    if (authLoading) return;

    if (!user) {
      setRedirectPath('/login');
      return;
    }

    const cachedRole = typeof window !== 'undefined'
      ? sessionStorage.getItem('auth_resolved_role')
      : null;
    const userRole = (user as any).role || cachedRole || (user as any).user_metadata?.role;
    console.log('[AUTH ROUTE] Dashboard router resolving role', { userRole, cachedRole, path: window.location.pathname });

    if (!userRole) {
      return;
    }


    if (userRole === 'admin') { setRedirectPath('/super-admin'); return; }
    if (userRole === 'marketing') { setRedirectPath('/marketing'); return; }
    if (userRole === 'teacher') { setRedirectPath('/teacher'); return; }
    if (userRole === 'content_creator') { setRedirectPath('/content-creator'); return; }
    if (userRole === 'parent') { setRedirectPath('/parent'); return; }
    // Interview applicants (guest sessions) must never land in a student hub.
    if (userRole === 'applicant' || (user as any).user_metadata?.interview_guest) {
      const interviewId = (user as any).user_metadata?.interview_id;
      setRedirectPath(interviewId ? `/interview/${interviewId}` : '/teach-with-us');
      return;
    }


    if (userRole === 'student') {
      // Wait until hub resolution settles before enforcing a destination.
      if (studentLoading) {
        return;
      }

      if (studentLevel) {
        if (!studentLoading && !onboardingCompleted) {
          // Background heal — mark onboarding complete so we don't re-prompt.
          supabase
            .from('student_profiles')
            .update({ onboarding_completed: true })
            .eq('user_id', user.id)
            .then(({ error }) => {
              if (error) console.error('🔴 [Dashboard] auto-complete onboarding failed:', error);
            });
        }
        setRedirectPath(getStudentDashboardRoute(studentLevel));
        return;
      }

      // Last-resort: pure metadata + background heal.
      const { route, level, source } = resolveHubRoute({ metadata: (user as any).user_metadata });
      if (!autoHealAttemptedRef.current) {
        autoHealAttemptedRef.current = true;
        supabase.from('student_profiles').upsert(
          { user_id: user.id, student_level: level, onboarding_completed: false },
          { onConflict: 'user_id' }
        ).then(({ error }) => {
          if (error) console.error('🔴 [Dashboard] background heal failed:', error);
          else {
            refetch();
          }
        });
      }
      setRedirectPath(route);
      return;
    }

    // Unknown role fallback — DO NOT auto-drop into a student hub.
    // Send to /login so the user can re-authenticate and re-resolve their role.
    setRedirectPath('/login?reason=role_unknown');
  }, [user, authLoading, studentLevel, studentLoading, onboardingCompleted, redirectPath, refetch]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-foreground text-lg font-medium">
          {authLoading ? 'Loading your dashboard...' : 'Verifying your access...'}
        </p>
        <p className="text-muted-foreground text-sm mt-2">Preparing your personalized experience</p>
      </div>
    </div>
  );
};

export default Dashboard;
