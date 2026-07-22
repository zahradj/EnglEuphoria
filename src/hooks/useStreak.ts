import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useStreak() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    const { data } = await supabase
      .from('user_stats')
      .select('current_streak')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) setStreak(data.current_streak ?? 0);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchStreak(); }, [fetchStreak]);

  const bumpStreak = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.rpc('upsert_streak', { p_user_id: user.id });
    if (data && typeof data === 'object' && 'streak' in (data as any)) {
      setStreak((data as any).streak);
    } else {
      await fetchStreak();
    }
  }, [user?.id, fetchStreak]);

  return { streak, loading, bumpStreak };
}
