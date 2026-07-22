import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStudentHubTheme } from '@/hooks/useStudentHubTheme';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'profileCompletionBannerDismissedAt';

/**
 * Lazy Profile Completion banner — sits at the top of the dashboard / My Path
 * and nudges the student to complete their profile (avatar, phone) for 50 XP.
 *
 * Hides itself when:
 *  • the student already has both an avatar AND a phone number, OR
 *  • the student dismissed it (persisted in localStorage + student_profiles).
 */
export function ProfileCompletionBanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useStudentHubTheme();
  const [hidden, setHidden] = useState(true);


  useEffect(() => {
    if (!user?.id) return;

    // Local fast-path: respect a recent dismissal without a network round-trip.
    if (typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY)) {
      setHidden(true);
      return;
    }

    let cancelled = false;
    (async () => {
      const [{ data: u }, { data: sp }] = await Promise.all([
        supabase.from('users').select('avatar_url, phone').eq('id', user.id).maybeSingle(),
        supabase
          .from('student_profiles')
          .select('profile_completion_dismissed_at, placement_test_completed_at')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      const completed = Boolean(u?.avatar_url) && Boolean(u?.phone);
      const dismissed = Boolean(sp?.profile_completion_dismissed_at);
      // Hide for newly-assessed students — the dashboard should feel
      // "ready to go" right after the placement test, not nag them.
      const justAssessed = Boolean(sp?.placement_test_completed_at);
      setHidden(completed || dismissed || justAssessed);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (hidden) return null;

  const dismiss = async () => {
    setHidden(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    }
    if (user?.id) {
      await supabase
        .from('student_profiles')
        .update({ profile_completion_dismissed_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }
  };

  return (
    <div
      role="region"
      aria-label="Profile completion reward"
      className={cn(
        'relative mb-4 overflow-hidden rounded-2xl border p-4 backdrop-blur-sm',
        theme.panelBorder,
        theme.headerGradient,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className={cn('rounded-xl p-2', theme.accentSoftBg, theme.accentText)}>
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Complete your profile to earn 50 XP
            </p>
            <p className="text-xs text-muted-foreground">
              Add an avatar and phone number — takes less than a minute.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/settings')}
            className={cn('rounded-full', theme.buttonPrimary)}
          >
            Complete profile
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={dismiss}
            aria-label="Dismiss"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfileCompletionBanner;
