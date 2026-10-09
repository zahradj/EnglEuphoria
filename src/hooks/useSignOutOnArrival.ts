import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * A sign-up page starts from a clean slate: if someone ARRIVES already signed in, sign them out.
 *
 * This must happen once, on arrival, and never again. It used to re-run whenever `user` appeared, so the
 * account this very page had just created was signed out a moment later — before the family's children
 * could be added ("Invalid session") and before the dashboard could load (bounced back to /login).
 */
export function useSignOutOnArrival(user: unknown, loading: boolean) {
  const checked = useRef(false);
  useEffect(() => {
    if (loading || checked.current) return;
    checked.current = true; // decided once, from whoever was signed in when the page opened
    if (user) supabase.auth.signOut().catch(() => undefined);
  }, [loading, user]);
}
