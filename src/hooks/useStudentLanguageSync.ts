import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import i18n from '@/lib/i18n';

/**
 * Hydrates i18n with the language stored on the user's profile
 * (`public.users.preferred_language`). Runs once per auth session.
 *
 * Server-stored value beats localStorage so a student gets the same
 * language across browsers/devices after they pick it during onboarding.
 */
export function useStudentLanguageSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('users')
        .select('preferred_language')
        .eq('id', user.id)
        .maybeSingle();

      if (cancelled || error || !data?.preferred_language) return;

      const stored = data.preferred_language;
      if (i18n.language?.substring(0, 2) !== stored) {
        i18n.changeLanguage(stored);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);
}
