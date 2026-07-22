import { supabase } from '@/integrations/supabase/client';

/**
 * Persist the chosen companion to the student's profile.
 * The `companion_id` column is a free-form text key from `src/constants/companions.ts`.
 */
export async function saveStudentCompanion(userId: string, companionId: string): Promise<void> {
  const { error } = await supabase
    .from('student_profiles')
    // companion_id was added via migration; cast keeps TS happy until types regenerate.
    .update({ companion_id: companionId } as any)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function fetchStudentCompanionId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('companion_id' as any)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return null;
  return ((data as any)?.companion_id as string | null) ?? null;
}
