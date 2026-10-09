import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyCredits } from '@/hooks/useFamilyCredits';
import type { FamilyChildProfile } from '@/lib/familyBuddy';
import type { FamilyLearner } from '@/components/parent/FamilyPackList';

export interface FamilyLearnerView extends FamilyLearner {
  profile?: FamilyChildProfile;
}

/**
 * The signed-in parent's children (name, hub, buddy) and each one's unused lessons. Same query keys as the
 * family dashboard, so opening the lessons page from the dashboard reuses what is already loaded.
 */
export function useFamilyLearners() {
  const { user } = useAuth();

  const students = useQuery({
    queryKey: ['parent-students', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_parent_relationships')
        .select(`
          id,
          student_id,
          relationship_type,
          is_primary_contact,
          can_view_progress,
          can_book_lessons,
          can_communicate_teachers,
          student:users!student_parent_relationships_student_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('parent_id', user!.id);
      if (error) throw error;
      return (data || []).map((item: any) => ({
        id: item.id,
        student_id: item.student_id,
        relationship_type: item.relationship_type,
        is_primary_contact: item.is_primary_contact,
        can_view_progress: item.can_view_progress,
        can_book_lessons: item.can_book_lessons,
        can_communicate_teachers: item.can_communicate_teachers,
        student: Array.isArray(item.student) ? item.student[0] : item.student,
      }));
    },
  });

  const rows = (students.data ?? []).filter((s: any) => s.student);
  const ids = (students.data ?? []).map((s: any) => s.student_id as string);

  const profiles = useQuery<Record<string, FamilyChildProfile>>({
    queryKey: ['parent-student-profiles', user?.id, ids.join(',')],
    enabled: !!user?.id && ids.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('user_id, hub_type, age, companion_id')
        .in('user_id', ids);
      if (error) throw error;
      const map: Record<string, FamilyChildProfile> = {};
      (data ?? []).forEach((p: any) => {
        map[p.user_id] = { hub: p.hub_type ?? null, age: p.age ?? null, companionId: p.companion_id ?? null };
      });
      return map;
    },
  });

  const credits = useFamilyCredits(ids, user?.id);

  const learners: FamilyLearnerView[] = rows.map((s: any) => {
    const profile = profiles.data?.[s.student_id];
    const hub = profile?.hub;
    return {
      studentId: s.student_id,
      name: s.student.full_name as string,
      hub: hub === 'academy' || hub === 'professional' ? hub : 'playground',
      profile,
    };
  });

  return {
    learners,
    credits: credits.data ?? ({} as Record<string, number>),
    isLoading: students.isLoading,
  };
}
