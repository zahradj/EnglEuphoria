// Reads the signed-in student's CEFR level from public.users.
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type CefrLevel = 'pre-a1' | 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' | null;

export function useStudentCefr(): { cefr: CefrLevel; loading: boolean } {
  const { user } = useAuth();
  const [cefr, setCefr] = useState<CefrLevel>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let cancel = false;
    (async () => {
      const { data } = await (supabase as any)
        .from('users')
        .select('cefr_level')
        .eq('id', user.id)
        .maybeSingle();
      if (!cancel) {
        const raw = (data?.cefr_level ?? '').toString().toLowerCase().trim();
        setCefr((raw || null) as CefrLevel);
        setLoading(false);
      }
    })().catch(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [user?.id]);

  return { cefr, loading };
}

/** True for A1/A2 (and pre-A1) — they get audio auto-played on each page flip. */
export function isBeginnerCefr(cefr: CefrLevel): boolean {
  if (!cefr) return false;
  return cefr === 'pre-a1' || cefr === 'a1' || cefr === 'a2';
}
