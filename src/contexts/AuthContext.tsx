
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { sanitizeText, rateLimiter } from '@/utils/security';
import { toast } from 'sonner';
import { detectMarketRegion } from '@/lib/marketRegion';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** True while the canonical user (profile + role) is still being fetched
   * in the background after the initial sync fallback. Route guards should
   * treat this like `loading` to avoid redirecting on a stale fallback role. */
  roleHydrating: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updateUserProfile: (updates: { full_name?: string; role?: string }) => Promise<{ error: any }>;
  refreshUser: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleHydrating, setRoleHydrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured] = useState(true); // Always configured in Engleuphoria deployments
  const initializedRef = useRef(false);
  const signInRedirectRef = useRef(false); // Track if SIGNED_IN redirect is in progress
  const initialFetchDoneRef = useRef(false); // Track when initial auth fetch completes

  const AUTH_FLOW_PREFIX = '[AUTH FLOW]';
  const ROLE_PRIORITY = ['admin', 'marketing', 'content_creator', 'teacher', 'parent', 'student'];

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        Promise.resolve(promise),
        new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
        }),
      ]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  // SECURITY: Roles MUST come from user_roles table only.
  // When a user has multiple roles, prioritize: admin > content_creator > teacher > student
  const fetchUserRoleFromDatabase = async (userId: string): Promise<string | null> => {
    try {
      console.log(`${AUTH_FLOW_PREFIX} STEP 2: Fetching roles for user`, userId);
      // Use .select() (NOT .maybeSingle()) to handle users with multiple roles
      const { data, error } = await withTimeout(
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId),
        2500,
        'user_roles role fetch'
      );

      console.log(`${AUTH_FLOW_PREFIX} STEP 3: Role query returned`, {
        count: Array.isArray(data) ? data.length : null,
        data,
        error,
      });

      if (data === null && error === null) {
        console.warn(`${AUTH_FLOW_PREFIX} RLS CHECK: user_roles returned data:null and error:null for`, userId);
        return null;
      }

      if (error) {
        console.warn(`${AUTH_FLOW_PREFIX} RLS CHECK: user_roles read failed`, error);
        return null;
      }

      if (!error && data && data.length > 0) {
        // Priority order: admin > content_creator > teacher > parent > student
        const userRoles = data.map((r: any) => r.role);

        for (const role of ROLE_PRIORITY) {
          if (userRoles.includes(role)) {
            console.log(`${AUTH_FLOW_PREFIX} STEP 3B: Resolved role from user_roles`, role);
            return role;
          }
        }

        return userRoles[0] ?? null;
      }

      // Fallback: check users.role column for legacy users missing user_roles rows
      const { data: userData, error: userError } = await withTimeout(
        supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .maybeSingle(),
        2500,
        'users legacy role fetch'
      );

      if (userData === null && userError === null) {
        console.warn(`${AUTH_FLOW_PREFIX} RLS CHECK: users legacy role returned data:null and error:null for`, userId);
      } else if (userError) {
        console.warn(`${AUTH_FLOW_PREFIX} RLS CHECK: users legacy role read failed`, userError);
      }

      if (userData?.role) {
        console.log(`${AUTH_FLOW_PREFIX} STEP 3C: Resolved legacy role from users.role`, userData.role);
      }

      return userData?.role || null;
    } catch (error) {
      console.warn(`${AUTH_FLOW_PREFIX} STEP 3D: Role resolution failed/timeout`, error);
      return null;
    }
  };

  // Function to fetch user data from database (parallelized profile + role)
  const fetchUserFromDatabase = async (authUser: any): Promise<User | null> => {
    try {
      const userId = authUser.id;
      console.log(`${AUTH_FLOW_PREFIX} STEP 4: Fetching profile for user`, userId);
      const [profileRes, role] = await Promise.all([
        withTimeout(
          supabase.from('users').select('*').eq('id', userId).maybeSingle(),
          2500,
          'users profile fetch'
        ),
        fetchUserRoleFromDatabase(userId),
      ]);

      console.log(`${AUTH_FLOW_PREFIX} STEP 5: Profile data received`, {
        data: profileRes.data,
        error: profileRes.error,
        role,
      });

      if (profileRes.data === null && profileRes.error === null) {
        console.warn(`${AUTH_FLOW_PREFIX} RLS CHECK: users profile returned data:null and error:null for`, userId);
        return null;
      }

      if (profileRes.error) {
        console.warn(`${AUTH_FLOW_PREFIX} RLS CHECK: users profile read failed, will use auth metadata`, profileRes.error);
        return null;
      }

      return {
        ...(authUser as any),
        ...(profileRes.data as any),
        user_metadata: authUser.user_metadata || {},
        app_metadata: authUser.app_metadata || {},
        role: role ?? 'student',
      } as any;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  // Auto-heal: ensure users + user_roles rows exist for authenticated user
  const autoHealUserRows = async (authUser: any) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();

      // Interview guest sessions must NEVER be auto-healed into the students table.
      // They get role='applicant' from the edge function and must stay that way so
      // they don't end up routed to the playground/placement-test on refresh.
      const isInterviewGuest = authUser.user_metadata?.interview_guest === true;
      if (isInterviewGuest) return;

      if (!existingUser) {
        const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
        const role = authUser.user_metadata?.role || 'student';
        
        const { error: upsertErr } = await supabase.from('users').upsert({
          id: authUser.id,
          email: authUser.email,
          full_name: fullName,
          role: role,
          market_region: detectMarketRegion(),
        } as any, { onConflict: 'id' });
        if (upsertErr) console.error('Auto-heal users upsert failed:', upsertErr);

        try {
          await supabase.rpc('ensure_user_role', { p_user_id: authUser.id, p_role: role });
        } catch (e) { console.error('Auto-heal user_roles RPC failed:', e); }
        
        return;
      }

      // User exists — check user_roles
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id);

      if (!existingRoles || existingRoles.length === 0) {
        const role = authUser.user_metadata?.role || 'student';
        try {
          await supabase.rpc('ensure_user_role', { p_user_id: authUser.id, p_role: role });
          console.warn('🔧 Auto-healed missing user_roles for:', authUser.email);
        } catch (e) { console.error('Auto-heal user_roles RPC failed:', e); }
      }

    } catch (err) {
      console.error('Auto-heal error (non-fatal):', err);
    }
  };

  // Synchronous fallback user from auth metadata. Does NOT block on DB role fetch —
  // the canonical role is fetched in the background by the caller and merged in.
  const createFallbackUserSync = (authUser: any): User => {
    const fallbackName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split('@')[0] ||
      'User';

    // Prefer the role we just resolved at sign-in (sessionStorage cache) over
    // user_metadata.role, because metadata only reflects the *signup* role and
    // misses additional roles (e.g. content_creator added later). Without this,
    // ProtectedRoute briefly sees the wrong role on first render after redirect
    // and bounces the user back to /login?reason=access_denied.
    const cachedRole =
      typeof window !== 'undefined'
        ? (sessionStorage.getItem('auth_resolved_role') ||
           localStorage.getItem('auth_resolved_role'))
        : null;
    // Interview guests are applicants — never let them fall back to 'student'.
    const isInterviewGuest = authUser.user_metadata?.interview_guest === true;
    const metadataRole = isInterviewGuest
      ? 'applicant'
      : (cachedRole || authUser.user_metadata?.role || 'student');


    return {
      id: authUser.id,
      email: authUser.email || '',
      full_name: fallbackName,
      role: metadataRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_metadata: authUser.user_metadata || {},
      app_metadata: authUser.app_metadata || {},
    } as any;
  };

  // Function to refresh user state (not used in production)
  const refreshUser = () => {
    // Only for compatibility - no demo mode in production
  };

  const hydrateUserInBackground = (authUser: any, label: string) => {
    console.log(`${AUTH_FLOW_PREFIX} HYDRATE: starting background hydration`, { label, userId: authUser?.id });
    setRoleHydrating(true);
    setTimeout(() => {
      Promise.resolve()
        .then(() => fetchUserFromDatabase(authUser))
        .then((dbUser) => {
          if (dbUser) {
            const cachedRole = sessionStorage.getItem('auth_resolved_role');
            const canonicalRole = (dbUser as any).role;
            console.log(`${AUTH_FLOW_PREFIX} HYDRATE: canonical user loaded`, { label, role: canonicalRole, cachedRole });
            setUser(dbUser);
            // Persist canonical role for the rest of the session so subsequent
            // SIGNED_IN events (token refresh, tab focus) don't bounce the user
            // back to /dashboard while the role re-resolves.
            if (canonicalRole) {
              try { sessionStorage.setItem('auth_resolved_role', canonicalRole); } catch {}
              try { localStorage.setItem('auth_resolved_role', canonicalRole); } catch {}
            }
          } else {
            console.warn(`${AUTH_FLOW_PREFIX} HYDRATE: no canonical user; keeping fallback`, { label });
          }
        })
        .catch((err) => console.error(`${AUTH_FLOW_PREFIX} HYDRATE: background user fetch failed`, err))
        .finally(() => setRoleHydrating(false));
    }, 0);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Prevent double initialization
      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        setError(null);
        
        if (!isConfigured) {
          setError('Supabase not configured. Please check your environment setup.');
          setLoading(false);
          return;
        }

        // Set up auth state listener FIRST
        // This listener handles ONGOING auth changes (login/logout events)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!mounted) return;
            
            console.info(`${AUTH_FLOW_PREFIX} EVENT: Auth state changed`, { event, hasSession: !!currentSession });
            
            // INITIAL_SESSION is handled by getSession() below — skip the listener
            // to prevent double state updates that cause flickering
            if (event === 'INITIAL_SESSION') {
              return;
            }
            
            if (event === 'SIGNED_IN' && (sessionStorage.getItem('auth_redirect_done') || signInRedirectRef.current)) {
              console.log(`${AUTH_FLOW_PREFIX} EVENT: SIGNED_IN handled by signIn redirect; skipping listener state mutation`);
              return;
            }

            // Inside the interview magic-link flow the page issues its own
            // guest sign-in. Do NOT let the SIGNED_IN listener swap users /
            // trigger hydration that could re-route the tab away from
            // /interview/:token.
            if (event === 'SIGNED_IN' && typeof window !== 'undefined' && sessionStorage.getItem('interview_flow_active') === '1') {
              console.log(`${AUTH_FLOW_PREFIX} EVENT: SIGNED_IN suppressed — interview_flow_active (session+user set, hydration skipped)`);
              setSession(currentSession);
              if (currentSession?.user) {
                // Critical: still populate `user` so protected routes like
                // /live-classroom/:sessionId don't bounce the guest to /login.
                // We only skip the background hydration that would re-route.
                setUser(createFallbackUserSync(currentSession.user));
              }
              setLoading(false);
              return;
            }

            setSession(currentSession);
            
            if (currentSession?.user) {
              const fallbackUser = createFallbackUserSync(currentSession.user);
              setUser(fallbackUser);
              setLoading(false);

              if (event !== 'TOKEN_REFRESHED') {
                hydrateUserInBackground(currentSession.user, `auth-event:${event}`);
              }
            } else {
              setUser(null);
              setLoading(false);
            }
          }
        );

        // THEN get initial session, but race against a 1.5s timeout so a
        // stalled auth network call can't freeze boot. The onAuthStateChange
        // listener will catch up if the real session arrives later.
        const sessionRace = Promise.race([
          supabase.auth.getSession().then((r) => r.data.session),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
        ]);
        const initialSession = await sessionRace;
        console.log(`${AUTH_FLOW_PREFIX} INIT: getSession race finished`, { hasSession: !!initialSession });

        if (mounted) {
          setSession(initialSession);

          if (initialSession?.user) {
            // Show fallback user (auth metadata) immediately so we don't block
            // render on a slow DB fetch. Real DB user swaps in below.
            const fallback = createFallbackUserSync(initialSession.user);
            if (mounted) setUser(fallback);
            initialFetchDoneRef.current = true;
            setLoading(false);

            // Background: fetch the real DB user and replace silently.
            hydrateUserInBackground(initialSession.user, 'initial-session');
          } else {
            setUser(null);
            initialFetchDoneRef.current = true;
            setLoading(false);
          }
        }

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
        
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError('Failed to initialize authentication');
          setLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();
     
    // Safety timeout with session recovery
    // Reduced from 10s to 6s — faster fallback with role recovery
    const timeout = setTimeout(async () => {
      if (signInRedirectRef.current) {
        return;
      }
      if (initialFetchDoneRef.current) {
        return;
      }
      if (mounted && loading) {
        console.warn('Auth initialization timeout (6s) - forcing loading = false with fallback role');
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession?.user && mounted) {
            const fallback = createFallbackUserSync(currentSession.user);
            setUser(fallback);
          }
        } catch (e) {
          console.error('Session recovery failed:', e);
        }
        if (mounted) setLoading(false);
      }
    }, 6000);

    return () => {
      mounted = false;
      initializedRef.current = false; // Allow re-init on StrictMode remount
      clearTimeout(timeout);
      if (cleanup instanceof Promise) {
        cleanup.then(cleanupFn => cleanupFn?.());
      }
    };
  }, [isConfigured]);

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    if (!isConfigured) {
      return { data: null, error: new Error('Supabase not configured. Please check your environment setup.') };
    }

    // Rate limiting check
    const clientKey = `signup_${email}`;
    if (!rateLimiter.isAllowed(clientKey, 3, 60000)) {
      const error = new Error('Too many signup attempts. Please try again later.');
      setError(error.message);
      toast.error(error.message);
      return { data: null, error };
    }

    try {
      setError(null);
      
      // Input sanitization
      const sanitizedEmail = sanitizeText(email);
      const sanitizedUserData = {
        ...userData,
        role: userData.role ? sanitizeText(userData.role) : 'student'
      };
      
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: sanitizedUserData
        }
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
      } else if (data.user) {
        // Notify admins about new registration
        try {
          const userNameForNotify = (sanitizedUserData as any).full_name || sanitizedEmail.split('@')[0];
          await supabase.functions.invoke('notify-admin-new-registration', {
            body: {
              name: userNameForNotify,
              email: sanitizedEmail,
              role: sanitizedUserData.role || 'student',
              registeredAt: new Date().toISOString()
            }
          });
        } catch (notifyError) {
          console.warn('Failed to notify admins:', notifyError);
          // Don't fail signup if notification fails
        }
      }

      return { data, error };
    } catch (error: any) {
      const errorMessage = 'Sign up failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log(`${AUTH_FLOW_PREFIX} STEP 1: signIn called`, { email });
    if (!isConfigured) {
      return { data: null, error: new Error('Supabase not configured. Please check your environment setup.') };
    }

    // Rate limiting check
    const clientKey = `signin_${email}`;
    if (!rateLimiter.isAllowed(clientKey, 5, 300000)) {
      const error = new Error('Too many login attempts. Please try again later.');
      setError(error.message);
      toast.error(error.message);
      return { data: null, error };
    }

    try {
      setError(null);
      
      // Mark the email/password sign-in as owner of the redirect before Supabase
      // emits SIGNED_IN, so the listener cannot write a stale metadata role.
      signInRedirectRef.current = true;
      sessionStorage.setItem('auth_redirect_done', 'true');

      // Input sanitization
      const sanitizedEmail = sanitizeText(email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      console.log(`${AUTH_FLOW_PREFIX} STEP 1B: Supabase auth response`, {
        hasUser: !!data.user,
        hasSession: !!data.session,
        error,
      });
      
      if (error) {
        signInRedirectRef.current = false;
        sessionStorage.removeItem('auth_redirect_done');
        const status = (error as any)?.status ?? 0;
        const raw = (error.message || '').trim();
        const friendly = raw
          || (status >= 500
            ? 'Authentication service is temporarily unavailable. Please try again in a moment.'
            : 'Invalid email or password.');
        setError(friendly);
        toast.error(friendly);
        return { data: null, error: { ...(error as any), message: friendly } };
      } else if (data.user) {
        console.log(`${AUTH_FLOW_PREFIX} STEP 1C: Supabase auth success`, {
          userId: data.user.id,
          session: !!data.session,
        });
        // Reset rate limiter on successful login
        rateLimiter.reset(clientKey);

        // Resolve role from user_roles. We intentionally do NOT race this with
        // a short timeout: a slow DB roundtrip was causing content_creator /
        // teacher accounts (whose user_metadata.role is still the legacy
        // signup default of "student") to be routed into the Playground
        // placement flow. fetchUserRoleFromDatabase already enforces a 2.5s
        // per-query cap internally.
        const metadataRole = (data.user as any).user_metadata?.role;
        let resolvedRole: string | null = null;
        try {
          resolvedRole = await fetchUserRoleFromDatabase(data.user.id);
        } catch (roleError) {
          console.warn(`${AUTH_FLOW_PREFIX} STEP 3E: signIn role fetch failed`, roleError);
          resolvedRole = null;
        }
        // Trust DB over metadata. A stale "student" metadata value is the
        // exact source of the misroute bug, so when DB is silent prefer a
        // non-student metadata role; otherwise fall through to /dashboard.
        const finalRole =
          resolvedRole
          || (metadataRole && metadataRole !== 'student' ? metadataRole : null)
          || metadataRole
          || 'student';
        console.log(`${AUTH_FLOW_PREFIX} STEP 4: Final role resolved`, {
          resolvedRole,
          metadataRole,
          finalRole,
        });

        // Fire-and-forget auto-heal so missing rows don't block the redirect.
        autoHealUserRows(data.user).catch((e) =>
          console.warn('Background auto-heal failed (non-fatal):', e)
        );

        let redirectPath = '/dashboard';
        if (finalRole === 'admin') {
          redirectPath = '/super-admin';
        } else if (finalRole === 'marketing') {
          redirectPath = '/marketing';
        } else if (finalRole === 'content_creator') {
          redirectPath = '/content-creator';
        } else if (finalRole === 'teacher') {
          redirectPath = '/teacher';
        } else if (finalRole === 'parent') {
          redirectPath = '/parent';
        } else if (finalRole === 'student' && resolvedRole === 'student') {
          // Only auto-route into a student hub when the DB CONFIRMED student.
          // If we only "guessed" student from metadata, send to /dashboard
          // so it can re-resolve instead of misrouting non-students into
          // /playground (the source of the placement-test hallucination).
          const hubType =
            (data.user as any).user_metadata?.hub_type ||
            'playground';
          redirectPath = hubType === 'academy' ? '/academy'
            : hubType === 'professional' ? '/hub'
            : '/playground';
        }

        setSession(data.session ?? null);
        setUser({ ...(data.user as any), role: finalRole } as any);
        sessionStorage.setItem('auth_redirect_done', 'true');
        sessionStorage.setItem('auth_resolved_role', finalRole);
        try { localStorage.setItem('auth_resolved_role', finalRole); } catch {}
        console.log(`${AUTH_FLOW_PREFIX} STEP 5: Redirecting to`, redirectPath);
        window.location.href = redirectPath;
      }
      
      return { data, error };
    } catch (error: any) {
      signInRedirectRef.current = false;
      sessionStorage.removeItem('auth_redirect_done');
      const errorMessage = (error?.message && String(error.message).trim()) || 'Sign in failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  };

  const updateUserProfile = async (updates: { full_name?: string; role?: string }) => {
    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    try {
      // Sanitize inputs
      const sanitizedUpdates = {
        ...updates,
        full_name: updates.full_name ? sanitizeText(updates.full_name) : undefined
      };

      const { error } = await supabase
        .from('users')
        .update(sanitizedUpdates)
        .eq('id', user.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Profile updated successfully');
      }

      return { error };
    } catch (error: any) {
      const errorMessage = 'Failed to update profile';
      toast.error(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      return { data: null, error: new Error('Supabase not configured. Please check your environment setup.') };
    }

    // Rate limiting check
    const clientKey = `reset_${email}`;
    if (!rateLimiter.isAllowed(clientKey, 3, 600000)) {
      const error = new Error('Too many password reset attempts. Please try again later.');
      setError(error.message);
      toast.error(error.message);
      return { data: null, error };
    }

    try {
      setError(null);
      
      // Input sanitization
      const sanitizedEmail = sanitizeText(email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `https://engleuphoria.com/reset-password`
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
      }
      
      return { data: null, error };
    } catch (error: any) {
      const errorMessage = 'Password reset failed';
      setError(errorMessage);
      toast.error(errorMessage);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      
      if (!isConfigured) {
        console.error('❌ Supabase not configured for logout');
        setError('Supabase not configured. Please check your environment setup.');
        return { error: new Error('Supabase not configured') };
      }

      // Clear redirect flag so next login can redirect again
      sessionStorage.removeItem('auth_redirect_done');
      sessionStorage.removeItem('auth_resolved_role');
      try { localStorage.removeItem('auth_resolved_role'); } catch {}
      // Clear user state immediately
      setUser(null);
      setSession(null);
      
      // Use 'local' scope so a missing/expired server session doesn't fail the flow.
      // The user is logged out client-side regardless.
      const { error } = await supabase.auth.signOut({ scope: 'local' });

      if (error) {
        const msg = (error as any)?.message?.toLowerCase?.() || '';
        const code = (error as any)?.code || (error as any)?.status;
        const isAlreadyGone =
          code === 'session_not_found' ||
          code === 403 ||
          msg.includes('session') && (msg.includes('not found') || msg.includes('missing') || msg.includes('expired'));

        if (isAlreadyGone) {
        } else {
          console.error('❌ Logout error:', error);
          // Don't block redirect — still proceed to home
        }
      } else {
      }
      
      // Force redirect to home page using location.replace for complete reload
      window.location.replace('/');
      
      return { error };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      setError('Sign out failed');
      // Force redirect even on error
      window.location.replace('/');
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      roleHydrating,
      isConfigured,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateUserProfile,
      refreshUser,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
