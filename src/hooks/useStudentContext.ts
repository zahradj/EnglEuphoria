import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StudentContext {
  studentName: string;
  level: string;
  cefrLevel: string;
  lastMistake: string;
  interests: string[];
  mistakeHistory: Array<{ error_type: string; word?: string }>;
  summary: string;
}

export const useStudentContext = (studentId: string | undefined) => {
  const [context, setContext] = useState<StudentContext | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;

    const fetchContext = async () => {
      setLoading(true);
      try {
        const [profileResult, userResult] = await Promise.all([
          supabase
            .from('student_profiles')
            .select('student_level, mistake_history, interests, cefr_level')
            .eq('user_id', studentId)
            .single(),
          supabase
            .from('users')
            .select('full_name')
            .eq('id', studentId)
            .single()
        ]);

        const profile = profileResult.data;
        const user = userResult.data;
        const name = user?.full_name || 'Student';
        const level = profile?.student_level || 'unknown';
        const cefrLevel = profile?.cefr_level || 'A1';
        const interests: string[] = Array.isArray(profile?.interests) ? profile.interests : [];

        // Extract mistake history (full array for AI weak-points analysis)
        const mistakeHistory: Array<{ error_type: string; word?: string }> = 
          Array.isArray(profile?.mistake_history) ? profile.mistake_history as Array<{ error_type: string; word?: string }> : [];

        // Extract last mistake for summary
        let lastMistake = 'None recorded';
        if (mistakeHistory.length > 0) {
          const last = mistakeHistory[mistakeHistory.length - 1];
          lastMistake = last?.error_type
            ? `${last.error_type}${last.word ? ` (${last.word})` : ''}`
            : 'Recent errors logged';
        }

        const trackLabel = level === 'playground' ? 'Playground' : level === 'academy' ? 'Academy' : 'Professional';
        const summary = `Reminder: ${name} is in the ${trackLabel} track${lastMistake !== 'None recorded' ? ` and struggled with '${lastMistake}' yesterday` : ''}.`;

        setContext({
          studentName: name,
          level,
          cefrLevel,
          lastMistake,
          interests,
          mistakeHistory,
          summary
        });
      } catch (err) {
        console.error('Failed to fetch student context:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, [studentId]);

  return { context, loading };
};
