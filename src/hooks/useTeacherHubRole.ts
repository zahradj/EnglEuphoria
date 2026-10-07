import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type HubRole =
  | 'playground_specialist'
  | 'academy_mentor'
  | 'success_mentor'
  | 'academy_success_mentor'
  | null;

export type HubKind = 'playground' | 'academy' | 'professional';

/** One hub a teacher can teach (a teacher may hold several). */
export type TeachableHub = 'playground' | 'academy' | 'success';

const normalizeHubKey = (h: string): TeachableHub | null => {
  const v = String(h ?? '').toLowerCase();
  if (v.includes('playground') || v === 'kids') return 'playground';
  if (v.includes('success') || v.includes('professional') || v.startsWith('adult')) return 'success';
  if (v.includes('academy') || v.startsWith('teen')) return 'academy';
  return null;
};

/**
 * Single source of truth for a teacher's hub assignment.
 * Returns the raw hub_role plus a normalized hub kind and the
 * allowed slot durations for that hub.
 *
   * - Playground specialists: 30-minute slots (a student's one-hour lesson is two back-to-back 30s)
   * - Academy / Success / Combined: 60-minute slots by default AND 30-minute slots, so students
   *   of every hub can book a 30-minute (1 credit) or a 60-minute (2 credits) lesson
 */
export const useTeacherHubRole = (teacherId: string | undefined) => {
  const [hubRole, setHubRole] = useState<HubRole>(null);
  // Every hub the teacher is assigned. When the admin ticked two or more hubs this is
  // the source of truth (isMultiHub); otherwise it just mirrors the single hub_role.
  const [hubs, setHubs] = useState<TeachableHub[]>([]);
  const [isMultiHub, setIsMultiHub] = useState(false);
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
        const explicit = Array.from(new Set(assigned.map(normalizeHubKey).filter(Boolean) as TeachableHub[]));
        const fromRole: TeachableHub[] =
          derived === 'playground_specialist' ? ['playground']
          : derived === 'success_mentor' ? ['success']
          : derived === 'academy_success_mentor' ? ['academy', 'success']
          : derived === 'academy_mentor' ? ['academy'] : [];
        setHubs(explicit.length ? explicit : fromRole);
        setIsMultiHub(explicit.length >= 2);
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

  // One credit = 30 minutes in every hub, so every hub offers 30- and 60-minute lessons.
  // Playground teachers open 30-minute slots only (an hour = two back-to-back 30s);
  // Academy / Success teachers open 60-minute slots (default) or 30-minute slots.
  const allowedDurations: (30 | 60)[] = isMultiHub
    ? (hubs.some((h) => h !== 'playground') ? (hubs.includes('playground') ? [30, 60] : [60, 30]) : [30])
    : isPlayground ? [30] : [60, 30];

  return { hubRole, hubKind, allowedDurations, isPlayground, loading, hubs, isMultiHub };
};
