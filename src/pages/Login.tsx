import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { AuthPageLayout } from '@/components/auth/AuthPageLayout';
import { SimpleAuthForm } from '@/components/auth/SimpleAuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { HeroThemeProvider } from '@/contexts/HeroThemeContext';
import { resolveHubRoute } from '@/lib/hubResolver';
import { toast } from 'sonner';

const Login = () => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (searchParams.get('reason') === 'access_denied') {
      toast.error('Access Denied', {
        description: "You don't have permission to access that page.",
        duration: 5000,
      });
    }
  }, [searchParams]);

  // Redirect immediately on user presence using role with metadata fallback.
  useEffect(() => {
    if (loading || !user || redirectedRef.current) return;

    const signInRedirectInFlight =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('auth_redirect_done') === 'true' &&
      !!sessionStorage.getItem('auth_resolved_role');

    if (signInRedirectInFlight) {
      console.log('[AUTH ROUTE] Login redirect skipped; signIn owns the redirect');
      return;
    }

    const role =
      (user as any).role ||
      (user as any).user_metadata?.role ||
      'student';

    const doRedirect = (path: string) => {
      redirectedRef.current = true;
      navigate(path, { replace: true });
    };

    if (role === 'admin') doRedirect('/super-admin');
    else if (role === 'marketing') doRedirect('/marketing');
    else if (role === 'content_creator') doRedirect('/content-creator');
    else if (role === 'teacher') doRedirect('/teacher');
    else if (role === 'parent') doRedirect('/parent');
    else if (role === 'student') {
      const { route } = resolveHubRoute({ metadata: (user as any).user_metadata });
      doRedirect(route);
    } else {
      doRedirect('/dashboard');
    }
  }, [loading, user, navigate]);

  // Only show the spinner while auth itself is initializing. Once `user` is set,
  // the redirect effect above takes over — no role-verification gate.
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center max-w-md px-6">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground text-lg font-medium">Loading...</p>
          <p className="text-muted-foreground text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <HeroThemeProvider>
      <AuthPageLayout
        title="Welcome Back"
        subtitle="Sign in to continue your learning journey"
        icon={LogIn}
        variant="default"
      >
        <SimpleAuthForm mode="login" />
      </AuthPageLayout>
    </HeroThemeProvider>
  );
};

export default Login;
