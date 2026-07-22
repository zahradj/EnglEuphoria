import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useStudentStreak() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['student-streak', user?.id],
    enabled: !!user?.id,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('student_learning_streaks')
        .select('current_streak, longest_streak, last_activity_date')
        .eq('student_id', user!.id)
        .eq('streak_type', 'daily')
        .maybeSingle();
      return data ?? { current_streak: 0, longest_streak: 0, last_activity_date: null };
    },
  });
}
