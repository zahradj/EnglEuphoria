import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Companion,
  getCompanionById,
  getDefaultCompanionForHub,
} from '@/constants/companions';
import { fetchStudentCompanionId } from '@/services/companionService';

/**
 * Resolve the student's active companion. Falls back to a hub-appropriate
 * default if no companion has been chosen.
 */
export function useActiveCompanion(): { companion: Companion; loading: boolean } {
  const { user } = useAuth();
  const [companionId, setCompanionId] = useState<string | null>(null);
  const [hub, setHub] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await supabase
          .from('student_profiles')
          .select('companion_id, hub_type' as any)
          .eq('user_id', user.id)
          .maybeSingle();
        if (cancelled) return;
        setCompanionId(((data as any)?.companion_id as string | null) ?? null);
        setHub(((data as any)?.hub_type as string | null) ?? null);
      } catch {
        if (!cancelled) {
          const id = await fetchStudentCompanionId(user.id);
          if (!cancelled) setCompanionId(id);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const chosen = getCompanionById(companionId);
  const companion = chosen ?? getDefaultCompanionForHub(hub ?? 'playground');
  return { companion, loading };
}
