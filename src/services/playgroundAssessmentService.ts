import { supabase } from '@/integrations/supabase/client';

/**
 * Saves a Playground test result (Pre-A1 Final Test, Checkpoint, unit Boss Test) — owner-approved plan
 * docs/assessment/prea1-assessment-plan.md. Called from the TEACHER's screen at the end of the test.
 *
 * The decision never changes a student's level by itself: when the teacher ticks "send the level request",
 * the existing `request_level_change` RPC is used (teacher request → admin approval), exactly like the
 * teacher's own Level change dialog.
 */
export type AssessmentSection = { key: string; label: string; correct: number; total: number; stars: number };
export type AssessmentItem = { section: string; ask: string; answer: string; chosen: string | null; correct: boolean };
export type AssessmentRubric = { prompt: string; score: number };

export type SaveAssessmentInput = {
  bookingId: string;
  testKey: string;
  level: string;
  sections: AssessmentSection[];
  items: AssessmentItem[];
  rubric: AssessmentRubric[];
  starsTotal: number;
  starsMax: number;
  decision: string;
  note?: string;
  /** When set, also files a level change request (e.g. Pre-A1 → A1) for the admin to approve. */
  requestLevel?: { level: string; reason: string };
  /** "Practise again" packs (homework quests) to send the student, one per weak part. */
  practise?: { questId: string; title: string }[];
};

export async function saveAssessmentResult(input: SaveAssessmentInput): Promise<{ ok: true; requestId: string | null; homeworkSent: number } | { ok: false; error: string }> {
  try {
    const { data: auth } = await supabase.auth.getUser();
    const me = auth?.user?.id;
    if (!me) return { ok: false, error: 'Please sign in as the teacher to save the result.' };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { data: booking, error: bErr } = await db.from('class_bookings').select('student_id, teacher_id').eq('id', input.bookingId).maybeSingle();
    if (bErr) throw bErr;
    if (!booking?.student_id) return { ok: false, error: 'This class has no student linked, so the result cannot be saved.' };

    let requestId: string | null = null;
    if (input.requestLevel) {
      const { data, error } = await db.rpc('request_level_change', {
        p_student: booking.student_id,
        p_level: input.requestLevel.level,
        p_start_unit: 1,
        p_marks: {},
        p_reason: input.requestLevel.reason,
        p_booking: input.bookingId,
      });
      if (error) throw error;
      requestId = (data as string | null) ?? null;
    }

    const { error } = await db.from('playground_assessment_results').insert({
      student_id: booking.student_id,
      teacher_id: me,
      booking_id: input.bookingId,
      test_key: input.testKey,
      level: input.level,
      sections: input.sections,
      items: input.items,
      rubric: input.rubric,
      stars_total: input.starsTotal,
      stars_max: input.starsMax,
      decision: input.decision,
      teacher_note: input.note?.trim() || null,
      level_request_id: requestId,
    });
    if (error) throw error;

    // Practise again packs → the student's Homework (same shape as the lesson quests: content {type:'quest', questId}).
    let homeworkSent = 0;
    const due = new Date(Date.now() + 14 * 24 * 3600_000).toISOString();
    for (const p of input.practise ?? []) {
      const { data: hw, error: hErr } = await db.from('homework_assignments').insert({
        teacher_id: me,
        lesson_id: null,
        title: p.title.slice(0, 60),
        description: `Practise again after the ${input.testKey} test.`,
        instructions: 'Play the Homework Quest and collect the stars!',
        content: { type: 'quest', questId: p.questId },
        source: 'assessment-practise',
        status: 'active',
        points: 10,
        due_date: due,
      }).select('id').single();
      if (hErr) throw hErr;
      const { error: lErr } = await db.from('homework_assignment_students').insert({ assignment_id: hw.id, student_id: booking.student_id });
      if (lErr) throw lErr;
      homeworkSent++;
    }
    return { ok: true, requestId, homeworkSent };
  } catch (e) {
    const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e);
    return { ok: false, error: msg };
  }
}
