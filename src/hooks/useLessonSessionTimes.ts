import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SessionTimes } from '@/services/lessonTiming';

const COLS = 'teacher_joined_at, student_joined_at, teacher_last_ping_at, student_last_ping_at, ended_at';

/** The live session's joins + heartbeats for a booking (classroom_sessions is
 *  linked by booking_id on newer rows and by room_id on others). */
export function useLessonSessionTimes(bookingId: string | null | undefined) {
  return useQuery({
    queryKey: ['lesson-session-times', bookingId],
    queryFn: async (): Promise<SessionTimes | null> => {
      if (!bookingId) return null;
      const { data } = await supabase
        .from('classroom_sessions')
        .select(COLS)
        .or(`booking_id.eq.${bookingId},room_id.eq.${bookingId}`)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data as SessionTimes | null) ?? null;
    },
    enabled: !!bookingId,
    staleTime: 30_000,
  });
}
