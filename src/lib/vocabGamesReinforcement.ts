/**
 * Reinforcement wiring for failed vocab quizzes.
 *
 * Listens for `vocab-arc:quiz-failed` events (dispatched by VocabGamesSlot when
 * a quiz-mode run scores below passThreshold) and queues a lightweight
 * remedial lesson row so the student sees ExtraPracticeCard on the dashboard.
 *
 * Idempotent per (student, lessonId): a duplicate quiz-fail within 6 hours
 * updates the existing row's `weak_words` instead of stacking rows.
 *
 * Follows the senior-ai-edtech-architect contract:
 * - No AI generation here; remediation content is materialized by the
 *   existing reinforcement generator observing `remedial_lessons` inserts.
 * - Uses supabase RLS (authenticated user); no service_role client-side.
 */

import { supabase } from '@/integrations/supabase/client';

type QuizFailedDetail = {
  lessonId?: string;
  hub?: 'playground' | 'academy' | 'success';
  cefr?: string;
  missedWords?: string[];
  accuracy?: number;
};

let installed = false;

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

async function handleQuizFailed(detail: QuizFailedDetail) {
  const userId = await currentUserId();
  if (!userId) return;
  const missed = (detail.missedWords ?? []).filter(Boolean).slice(0, 20);
  if (missed.length === 0) return;

  const lessonId = detail.lessonId ?? null;
  const sixHoursAgoIso = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  try {
    const { data: existing } = await supabase
      .from('remedial_lessons')
      .select('id, weak_words:metadata')
      .eq('student_id', userId)
      .gte('created_at', sixHoursAgoIso)
      .limit(1);

    if (existing && existing.length > 0) {
      const row = existing[0] as { id: string };
      await supabase
        .from('remedial_lessons')
        .update({
          metadata: {
            weak_words: missed,
            source: 'vocab-games:quiz-failed',
            accuracy: detail.accuracy ?? null,
            hub: detail.hub ?? null,
            cefr: detail.cefr ?? null,
            lesson_id: lessonId,
          },
        })
        .eq('id', row.id);
      return;
    }

    await supabase.from('remedial_lessons').insert({
      student_id: userId,
      status: 'pending',
      reason: 'vocab_quiz_failed',
      metadata: {
        weak_words: missed,
        source: 'vocab-games:quiz-failed',
        accuracy: detail.accuracy ?? null,
        hub: detail.hub ?? null,
        cefr: detail.cefr ?? null,
        lesson_id: lessonId,
      },
    } as never);
  } catch (err) {
    // Non-fatal — reinforcement is a soft-tier signal.
    if (typeof console !== 'undefined') {
      console.warn('[vocab-games] reinforcement queue failed', err);
    }
  }
}

/** Idempotent installer. Call once from the app root. */
export function installVocabGamesReinforcement() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('vocab-arc:quiz-failed', (e: Event) => {
    const detail = (e as CustomEvent<QuizFailedDetail>).detail ?? {};
    void handleQuizFailed(detail);
  });
}
