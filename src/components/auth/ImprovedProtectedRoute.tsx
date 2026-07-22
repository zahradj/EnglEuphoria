import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDevBypass } from '@/hooks/useDevBypass';
import { DevBypassWrapper } from './DevBypassWrapper';
import { useStudentLevel, StudentLevel } from '@/hooks/useStudentLevel';

interface ImprovedProtectedRouteProps {
  children: React.ReactNode;
  /** Required role, or an array of allowed roles (any-of). */
  requiredRole?: string | string[];
  requiredStudentLevel?: StudentLevel;
  requireOnboarding?: boolean;
  redirectTo?: string;
}

export const ImprovedProtectedRoute: React.FC<ImprovedProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredStudentLevel,
  requireOnboarding = false,
  redirectTo = '/login' 
}) => {
  const navigate = useNavigate();
  const { user, loading, roleHydrating, error } = useAuth();
  const { isDevBypassActive, bypassRole } = useDevBypass();
  const { studentLevel, onboardingCompleted, loading: studentLoading } = useStudentLevel();
  const [roleLoadTimeout, setRoleLoadTimeout] = useState(false);
  const timeoutTriggeredRef = useRef(false);
  const cachedRole = typeof window !== 'undefined'
    ? (sessionStorage.getItem('auth_resolved_role') ||
       localStorage.getItem('auth_resolved_role'))
    : null;
  const userRole = (user as any)?.role || cachedRole || (user as any)?.user_metadata?.role || null;

  useEffect(() => {
    console.log('[AUTH ROUTE] Guard state', {
      path: window.location.pathname,
      requiredRole,
      userRole,
      loading,
      hasUser: !!user,
      studentLoading,
    });
  }, [requiredRole, userRole, loading, user, studentLoading]);

  // Timeout for role loading - fall back to metadata role instead of blocking
  useEffect(() => {
    if (user && !(user as any).role && requiredRole && requiredRole !== 'any' && !timeoutTriggeredRef.current) {
      const timeout = setTimeout(() => {
        if (!timeoutTriggeredRef.current) {
          timeoutTriggeredRef.current = true;
          // Use ONLY the cached resolved role. Never guess from user_metadata —
          // interview guests carry role='applicant' there which would mismatch
          // any requiredRole guard and bounce them into the wrong hub.
          const fallbackRole = cachedRole;
          console.warn('⏱️ Role verification timeout - falling back to:', fallbackRole);

          setRoleLoadTimeout(true);
        }
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [user, requiredRole, cachedRole]);

  // DEV BYPASS - Only in development mode with query param
  if (isDevBypassActive && bypassRole) {
    console.warn('⚠️ DEV BYPASS ACTIVE - This should never appear in production');
    return <DevBypassWrapper role={bypassRole}>{children}</DevBypassWrapper>;
  }

  // Show loading spinner while auth itself is being determined.
  // We intentionally do NOT block on student profile loading — useStudentLevel
  // is metadata-seeded and non-blocking, so routing decisions can proceed.
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground text-lg font-medium">Loading your dashboard...</p>
          <p className="text-muted-foreground text-sm mt-2">Please wait while we set things up</p>
        </div>
      </div>
    );
  }

  // Show error state if authentication failed
  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-foreground mb-2">Authentication Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={() => navigate('/login')} 
              variant="outline"
              className="w-full"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if no user
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Normalize required roles to an array for any-of matching.
  const allowedRoles: string[] | null =
    requiredRole && requiredRole !== 'any'
      ? Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      : null;
  const roleMatches = (r: string | null | undefined) =>
    !!r && (allowedRoles ? allowedRoles.includes(r) : true);

  // If role is required but not yet loaded, show loading spinner
  if (allowedRoles && !userRole && !roleLoadTimeout) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground text-lg font-medium">Verifying your access...</p>
          <p className="text-muted-foreground text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // If role verification timed out but we have a fallback role, let them through
  // Only redirect to login if there's genuinely no session.
  // SECURITY: NEVER grant access based purely on user_metadata.role — that value
  // is the (stale) signup role and is a known misroute footgun. Only trust the
  // sessionStorage cache (which was written from a confirmed DB read).
  if (allowedRoles && !userRole && roleLoadTimeout) {
    const fallbackRole = cachedRole; // explicitly drop user_metadata.role here
    console.warn('⏱️ Role timeout fallback to:', fallbackRole);
    if (fallbackRole && roleMatches(fallbackRole)) {
      return <>{children}</>;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Check role if required
  if (allowedRoles && !roleMatches(userRole)) {
    if (roleMatches(cachedRole)) {
      console.warn('[AUTH ROUTE] Cached role matches required role; allowing pending canonical hydration', {
        path: window.location.pathname,
        requiredRole,
        userRole,
        cachedRole,
        userId: user.id,
      });
      return <>{children}</>;
    }

    // Canonical role is still being fetched in the background — show the
    // loading spinner instead of redirecting. This prevents a brief mismatch
    // (e.g. stale fallback 'student' while user_roles resolves 'content_creator')
    // from bouncing the user to /dashboard and unmounting the destination.
    if (roleHydrating) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-foreground text-lg font-medium">Verifying your access...</p>
            <p className="text-muted-foreground text-sm mt-2">Please wait a moment</p>
          </div>
        </div>
      );
    }

    console.warn('[AUTH ROUTE] Access denied; routing authenticated user to dashboard router', {
      path: window.location.pathname,
      requiredRole,
      userRole,
      userId: user.id,
    });
    return <Navigate to="/dashboard" replace />;
  }

  // Check student level if required (for student-specific routes)
  if (requiredStudentLevel && userRole === 'student') {
    if (studentLoading) {
      return (
        <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-foreground text-lg font-medium">Loading your dashboard...</p>
            <p className="text-muted-foreground text-sm mt-2">Confirming your hub access</p>
          </div>
        </div>
      );
    }

    if (studentLevel !== requiredStudentLevel) {
      // Redirect to the smart dashboard router which will handle proper routing
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check if onboarding is required and not completed
  if (requireOnboarding && userRole === 'student' && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
