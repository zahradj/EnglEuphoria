import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * True when this learner belongs to a family account (a parent has approved the link), so the
 * lessons are bought from the family dashboard. Students may read their own relationship rows.
 */
export function useFamilyMembership(studentId: string | null | undefined): boolean {
  const [isMember, setIsMember] = useState(false);
  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    (async () => {
      try {
        const { count } = await supabase
          .from('student_parent_relationships')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', studentId)
          .not('approved_at', 'is', null);
        if (!cancelled) setIsMember((count ?? 0) > 0);
      } catch {
        if (!cancelled) setIsMember(false);
      }
    })();
    return () => { cancelled = true; };
  }, [studentId]);
  return isMember;
}
