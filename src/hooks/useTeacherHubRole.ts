import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type HubRole =
  | 'playground_specialist'
  | 'academy_mentor'
  | 'success_mentor'
  | 'academy_success_mentor'
  | null;

export type HubKind = 'playground' | 'academy' | 'professional';

/**
 * Single source of truth for a teacher's hub assignment.
 * Returns the raw hub_role plus a normalized hub kind and the
 * allowed slot durations for that hub.
 *
   * - Playground specialists: 30-minute slots only
   * - Academy / Success / Combined: 60-minute slots only
 */
export const useTeacherHubRole = (teacherId: string | undefined) => {
  const [hubRole, setHubRole] = useState<HubRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!teacherId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('teacher_profiles')
        .select('hub_role, assigned_hubs')
        .eq('user_id', teacherId)
        .maybeSingle();
      if (!cancelled) {
        const assigned: string[] = Array.isArray((data as any)?.assigned_hubs)
          ? (data as any).assigned_hubs
          : [];
        let derived: HubRole = ((data as any)?.hub_role ?? null) as HubRole;
        if (assigned.length) {
          const has = (k: string) => assigned.includes(k);
          derived = has('academy') && has('success')
            ? 'academy_success_mentor'
            : has('academy')
              ? 'academy_mentor'
              : has('success')
                ? 'success_mentor'
                : has('playground')
                  ? 'playground_specialist'
                  : derived;
        }
        setHubRole(derived);
        setLoading(false);
      }
    };
    load();

    // Listen for cross-tab/admin updates so the teacher dashboard reflects
    // hub changes without a manual refresh.
    if (!teacherId) return;
    const channel = supabase
      .channel(`teacher-hub-${teacherId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'teacher_profiles', filter: `user_id=eq.${teacherId}` },
        () => { void load(); },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [teacherId]);

  const isPlayground = hubRole === 'playground_specialist';
  const hubKind: HubKind = isPlayground
    ? 'playground'
    : hubRole === 'success_mentor'
      ? 'professional'
      : 'academy';

  const allowedDurations: (30 | 60)[] = isPlayground ? [30] : [60];

  return { hubRole, hubKind, allowedDurations, isPlayground, loading };
};
