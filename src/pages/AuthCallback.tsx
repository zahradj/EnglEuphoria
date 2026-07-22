import { detectMarketRegion } from '@/lib/marketRegion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('Confirming your account...');

  useEffect(() => {
    let mounted = true;
    let timeout: ReturnType<typeof setTimeout>;

    const handleCallback = async () => {
      try {
        // Step 1: Get or establish session
        let session = (await supabase.auth.getSession()).data.session;

        // If no session yet, try extracting tokens from URL hash (email confirmation flow)
        if (!session) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            session = data.session;
          }
        }

        // If still no session, wait for Supabase auth state change (magic link, etc.)
        if (!session) {
          if (mounted) setStatusMessage('Verifying your credentials...');
          
          const sessionFromListener = await new Promise<typeof session>((resolve) => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
              if (event === 'SIGNED_IN' && s) {
                subscription.unsubscribe();
                resolve(s);
              }
            });
            // Timeout after 8 seconds
            timeout = setTimeout(() => {
              subscription.unsubscribe();
              resolve(null);
            }, 8000);
          });
          session = sessionFromListener;
        }

        if (!session?.user) {
          console.error('Auth callback: No session established');
          navigate('/login', { replace: true });
          return;
        }

        if (mounted) setStatusMessage('Preparing your personalized experience...');

        const userId = session.user.id;

        // Step 2: Auto-heal — ensure student_profiles exists
        // The DB trigger should have created it, but let's verify
        const { data: profile } = await supabase
          .from('student_profiles')
          .select('student_level')
          .eq('user_id', userId)
          .maybeSingle();

        if (!profile) {
          // Trigger missed — create student_profiles from auth metadata
          const hubType = session.user.user_metadata?.hub_type || 'playground';
          const resolvedLevel = hubType === 'academy' ? 'academy'
            : (hubType === 'professional' || hubType === 'success') ? 'professional'
            : 'playground';

          await supabase.from('student_profiles').upsert(
            { user_id: userId, student_level: resolvedLevel, onboarding_completed: false },
            { onConflict: 'user_id' }
          );
          
        }

        // Step 3: Also ensure users row exists (belt + suspenders)
        const { data: userRow } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (!userRow) {
          const fullName = session.user.user_metadata?.full_name 
            || session.user.email?.split('@')[0] 
            || 'Student';
          await supabase.from('users').upsert({
            id: userId,
            email: session.user.email,
            full_name: fullName,
            role: session.user.user_metadata?.role || 'student',
            market_region: detectMarketRegion(),
          } as any, { onConflict: 'id' });
        }

        // Step 4: Direct hub-based redirect — bypass /dashboard smart router
        if (mounted) {
          // SECURITY: trust user_roles (DB), not user_metadata.role. Metadata
          // reflects the original signup role and stays stale when a user is
          // promoted (e.g. student → teacher / content_creator), causing a
          // post-email-confirm redirect to the wrong hub.
          const ROLE_PRIORITY = ['admin', 'content_creator', 'teacher', 'parent', 'student'];
          let dbRole: string | null = null;
          try {
            const { data: rolesData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', userId);
            if (rolesData && rolesData.length > 0) {
              const roles = rolesData.map((r: any) => r.role);
              dbRole = ROLE_PRIORITY.find((r) => roles.includes(r)) || roles[0] || null;
            }
          } catch (e) {
            console.warn('[AuthCallback] user_roles fetch failed; falling back to metadata', e);
          }
          const userRole = dbRole || session.user.user_metadata?.role || 'student';
          if (userRole === 'teacher') {
            navigate('/teacher', { replace: true });
          } else if (userRole === 'admin') {
            navigate('/super-admin', { replace: true });
          } else if (userRole === 'content_creator') {
            navigate('/content-creator', { replace: true });
          } else if (userRole === 'parent') {
            navigate('/parent', { replace: true });
          } else {
            // Student: resolve via shared resolver (metadata-first, DB-confirmed).
            const { resolveHubRoute } = await import('@/lib/hubResolver');
            const { data: freshProfile } = await supabase
              .from('student_profiles')
              .select('student_level')
              .eq('user_id', userId)
              .maybeSingle();
            const { route } = resolveHubRoute({
              metadata: session.user.user_metadata,
              dbStudentLevel: freshProfile?.student_level,
            });
            navigate(route, { replace: true });
          }
        }
      } catch (err) {
        console.error('Auth callback unexpected error:', err);
        if (mounted) {
          navigate('/login', { replace: true });
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6B21A8] via-[#FE6A2F] to-[#059669] blur-xl opacity-30 animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-[#6B21A8] mx-auto relative" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-1">EnglEuphoria</h2>
          <p className="text-gray-500 text-sm">{statusMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
