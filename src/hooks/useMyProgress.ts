import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfWeek } from '@/lib/progress/progressMath';

export interface RecentWin {
  lessonId: string;
  title: string | null;
  completedAt: string | null;
}

export interface MyProgressData {
  lessonsThisWeek: number;
  recent: RecentWin[];
  goalText: string | null;
}

/**
 * What the "My Progress" page needs beyond the skill map: lessons finished this week, the last few
 * finished lessons ("recent wins") and the weekly goal the student wrote. Everything is read from
 * existing tables; any failure just yields an empty value so the page still renders.
 */
export function useMyProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-progress', user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async (): Promise<MyProgressData> => {
      const uid = user!.id;
      const weekStart = startOfWeek(new Date()).toISOString();
      const [weekRes, recentRes, profileRes] = await Promise.all([
        supabase
          .from('student_lesson_progress')
          .select('lesson_id')
          .eq('user_id', uid)
          .eq('status', 'completed')
          .gte('completed_at', weekStart),
        supabase
          .from('student_lesson_progress')
          .select('lesson_id, completed_at, curriculum_lessons(title)')
          .eq('user_id', uid)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(5),
        supabase.from('student_profiles').select('weekly_goal').eq('user_id', uid).maybeSingle(),
      ]);

      const weekIds = new Set(((weekRes.data ?? []) as Array<{ lesson_id: string }>).map((r) => r.lesson_id));
      const recent: RecentWin[] = ((recentRes.data ?? []) as Array<{ lesson_id: string; completed_at: string | null; curriculum_lessons?: { title?: string | null } | null }>).map((r) => ({
        lessonId: r.lesson_id,
        title: r.curriculum_lessons?.title ?? null,
        completedAt: r.completed_at,
      }));
      const goalText = ((profileRes.data as { weekly_goal?: string | null } | null)?.weekly_goal ?? null) || null;
      return { lessonsThisWeek: weekIds.size, recent, goalText };
    },
  });
}
