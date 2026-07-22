import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Reads the Academy coin balance for the current student from the
 * `academy_coin_balances` view. Refetches when window regains focus or
 * the `academy:coins-updated` event fires.
 */
export function useAcademyCoinBalance() {
  const { user } = useAuth();
  const [coins, setCoins] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setCoins(0);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('academy_coin_balances' as any)
      .select('coins')
      .eq('student_id', user.id)
      .maybeSingle();
    setCoins(((data as any)?.coins as number) ?? 0);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('academy:coins-updated', onUpdate);
    window.addEventListener('focus', onUpdate);
    return () => {
      window.removeEventListener('academy:coins-updated', onUpdate);
      window.removeEventListener('focus', onUpdate);
    };
  }, [refresh]);

  return { coins, loading, refresh };
}
