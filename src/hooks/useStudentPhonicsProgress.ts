import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MasteryLevel } from '@/data/phonemeMap';

export interface PhonicsProgressEntry {
  id: string;
  phoneme: string;
  mastery_level: MasteryLevel;
  mastered_at: string | null;
  lesson_id: string | null;
}

export function useStudentPhonicsProgress() {
  const { user } = useAuth();

  return useQuery<PhonicsProgressEntry[]>({
    queryKey: ['student-phonics-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('student_phonics_progress')
        .select('id, phoneme, mastery_level, mastered_at, lesson_id')
        .eq('student_id', user.id);
      if (error) throw error;
      return (data || []) as PhonicsProgressEntry[];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });
}
