import { supabase } from '@/integrations/supabase/client';
import type { Hub } from './types';

export interface ExtraPracticeOutcome {
  domain: string;
  failedTags: string[];
  assigned: boolean;
  reason?: string;
}

/**
 * Runs the automatic per-domain Extra Practice check for one just-finished
 * lesson: server-side, via the `assign-extra-practice` edge function, which
 * evaluates this booking's quiz_responses against Novakid's per-domain rule
 * and auto-assigns a matching pre-authored practice lesson for every domain
 * that triggers.
 *
 * MUST go through the edge function rather than writing to
 * remedial_lessons/scheduled_lessons directly from here: this is called
 * from the TEACHER's session right after they end the lesson
 * (LessonWrapUpDialog), but remedial_lessons' RLS insert policy requires
 * auth.uid() = student_id — a client-side insert as the teacher would be
 * silently rejected. The edge function runs with the service-role key,
 * after verifying the caller actually teaches this booking.
 *
 * Deployed under the function name `generate-lesson-content` — that slot
 * held a fully dead lesson generator (zero live callers, already returning
 * HTTP 410 to everyone) and was repurposed per direct user approval rather
 * than requesting a Supabase plan/billing change for a new function slot.
 * The name is stale; the body is this feature.
 *
 * Never throws: any failure here should not block closing out the lesson
 * report, so callers can fire this without awaiting if they don't need the
 * outcome list.
 */
export async function evaluateAndAssignExtraPractice(args: {
  bookingId: string;
  studentId: string;
  hub: Hub;
}): Promise<ExtraPracticeOutcome[]> {
  if (args.hub !== 'academy') return [];

  try {
    const { data, error } = await supabase.functions.invoke('generate-lesson-content', {
      body: { bookingId: args.bookingId, studentId: args.studentId, hub: args.hub },
    });
    if (error) throw error;
    return (data as { outcomes?: ExtraPracticeOutcome[] })?.outcomes ?? [];
  } catch (e) {
    console.warn('[evaluateAndAssignExtraPractice] skipped:', (e as Error).message);
    return [];
  }
}
