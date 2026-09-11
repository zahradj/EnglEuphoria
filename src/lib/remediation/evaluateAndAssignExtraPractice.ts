import { supabase } from '@/integrations/supabase/client';
import { evaluateDomainCompetencies } from './evaluateDomainCompetencies';
import { assignExtraPractice } from './assignExtraPractice';
import type { Hub } from './types';

export interface ExtraPracticeOutcome {
  domain: string;
  failedTags: string[];
  assigned: boolean;
  reason?: string;
}

/**
 * Runs the automatic per-domain Extra Practice check for one just-finished
 * lesson: pulls this booking's quiz_responses, groups them by domain
 * (grammar:/reading:/speaking:/...), applies Novakid's rule per domain
 * (evaluateDomainCompetencies.ts), and auto-assigns a matching pre-authored
 * practice lesson for every domain that triggers (assignExtraPractice.ts).
 *
 * Call this AFTER a lesson/booking has actually ended — it's read-only
 * against quiz_responses up to that point, so calling it earlier would just
 * see a partial answer set. Never throws: any failure here should not block
 * closing out the lesson report, so callers can fire this without awaiting
 * if they don't need the outcome list.
 */
export async function evaluateAndAssignExtraPractice(args: {
  bookingId: string;
  studentId: string;
  hub: Hub;
}): Promise<ExtraPracticeOutcome[]> {
  // Only Academy has a real, live auto-graded quiz signal today — see the
  // remediation plan doc for why Success/Playground are out of scope.
  if (args.hub !== 'academy') return [];

  try {
    const { data: session } = await supabase
      .from('classroom_sessions')
      .select('id, lesson_id')
      .eq('booking_id', args.bookingId)
      .maybeSingle();
    if (!session?.id) return [];

    const { data: responses } = await supabase
      .from('quiz_responses')
      .select('is_correct, skill_tag')
      .eq('session_id', session.id)
      .eq('student_id', args.studentId);
    if (!responses?.length) return [];

    const domainResults = evaluateDomainCompetencies(
      responses.map((r) => ({ skillTag: r.skill_tag, isCorrect: r.is_correct })),
    );

    const outcomes: ExtraPracticeOutcome[] = [];
    for (const result of domainResults) {
      if (!result.shouldAssign) continue;
      const assignment = await assignExtraPractice({
        studentId: args.studentId,
        domain: result.domain,
        failedTags: result.failedTags.map((tag) => `${result.domain}:${tag}`),
        hub: args.hub,
        sourceLessonId: session.lesson_id,
      });
      outcomes.push({
        domain: result.domain,
        failedTags: result.failedTags,
        assigned: assignment.assigned,
        reason: assignment.assigned ? undefined : assignment.reason,
      });
    }
    return outcomes;
  } catch (e) {
    console.warn('[evaluateAndAssignExtraPractice] skipped:', (e as Error).message);
    return [];
  }
}
