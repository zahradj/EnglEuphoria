import { supabase } from '@/integrations/supabase/client';

export interface EndLessonResult {
  already_completed: boolean;
  booking_id: string;
  earning_id?: string;
  completion_id?: string;
  teacher_amount?: number;
  platform_amount?: number;
  currency?: string;
  rate?: number;
}

/**
 * Single source of truth for ending a lesson.
 * Calls the `end_lesson` SQL RPC which atomically:
 *   - flips the booking to 'completed'
 *   - closes the classroom_sessions row
 *   - writes a lesson_completions row
 *   - credits teacher_earnings (per-teacher rate or 40% default)
 *   - adds an 'available' entry to teacher_payouts_ledger
 *   - bumps teacher_performance_metrics
 *
 * Idempotent: re-calling on a completed booking returns the existing earning
 * with `already_completed: true` — never double-credits.
 */
export async function endLesson(bookingId: string): Promise<EndLessonResult> {
  if (!bookingId) throw new Error('bookingId is required');

  const { data, error } = await supabase.rpc('end_lesson', { p_booking_id: bookingId });
  if (error) throw error;
  return data as EndLessonResult;
}
