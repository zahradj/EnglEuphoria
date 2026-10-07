import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { clearStoredReferralCode, getStoredReferralCode } from '@/lib/referralCode';

/**
 * Once per signed-in student: links them to the friend whose referral link they used (the code kept
 * in the browser, else the one saved in their sign-up). claim_referral refuses anything unsafe, so
 * this can run on every dashboard load; a failure is ignored (it must never get in the student's way).
 */
export function useClaimReferral(userId: string | null | undefined): void {
  useEffect(() => {
    if (!userId) return;
    const flag = `engl_ref_claimed_${userId}`;
    try { if (sessionStorage.getItem(flag)) return; } catch { /* storage can be unavailable */ }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await (supabase as any).rpc('claim_referral', { p_code: getStoredReferralCode() });
        if (cancelled) return;
        try { sessionStorage.setItem(flag, '1'); } catch { /* ignore */ }
        // Linked, or nothing more to do with this code: forget it.
        if (typeof data === 'string' && data !== 'not_signed_in') clearStoredReferralCode();
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [userId]);
}
