import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useMasteryTracker() {
  const { user } = useAuth();

  const trackMastery = useCallback(
    async (itemKey: string, passed: boolean, itemType = 'vocabulary', hub = 'academy') => {
      if (!user?.id || !itemKey) return;
      await supabase.rpc('upsert_mastery', {
        p_user_id: user.id,
        p_item_key: itemKey,
        p_item_type: itemType,
        p_hub: hub,
        p_passed: passed,
      });
    },
    [user?.id],
  );

  return { trackMastery };
}
