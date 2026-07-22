/**
 * Vocab Arc Observer (senior-ai-edtech-architect + esl-game-studio)
 *
 * Step 3 of the Academy vocab-gamification loop: subscribe to
 * `vocab-arc:complete` window events dispatched by the injected renderers
 * (VocabImageMatchSlide / MatchingSlide) and route them into the
 * intelligence observer (`handleObservationEvent`) so `student_mastery`,
 * SM-2+ scheduling, and `/admin/beta-analytics` retention lift can see the
 * arc's contribution.
 *
 * One global listener per app — subsequent inits are no-ops.
 * Resolves `studentId` lazily via supabase auth; anonymous / demo sessions
 * are ignored (no writes).
 */

import { supabase } from '@/integrations/supabase/client';
import { handleObservationEvent } from '@/intelligence/observer/eventHandlers';
import type { Hub } from '@/governance/types';
import { VOCAB_ARC_COMPLETE_EVENT, type VocabArcCompletePayload } from './vocabArcTelemetry';

let installed = false;

interface InitOptions {
  /** Default hub if not resolvable from context. Academy is the arc's home hub. */
  defaultHub?: Hub;
  /** Optional resolver for current lessonId (e.g. from router). */
  getLessonId?: () => string | undefined;
  /** Optional resolver for current hub (overrides defaultHub). */
  getHub?: () => Hub | undefined;
}

export function installVocabArcObserver(opts: InitOptions = {}): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const defaultHub: Hub = opts.defaultHub ?? 'academy';

  window.addEventListener(VOCAB_ARC_COMPLETE_EVENT, async (evt: Event) => {
    const detail = (evt as CustomEvent<VocabArcCompletePayload>).detail;
    if (!detail || !detail.skill_key) return;
    try {
      const { data } = await supabase.auth.getUser();
      const studentId = data?.user?.id;
      if (!studentId) return; // anonymous / demo → skip write path
      await handleObservationEvent({
        type: 'activity_complete',
        studentId,
        hub: opts.getHub?.() ?? defaultHub,
        lessonId: opts.getLessonId?.(),
        payload: {
          skill: detail.skill_key,
          accuracy: detail.accuracy,
          item_type: 'vocab',
          hub: opts.getHub?.() ?? defaultHub,
          source: detail.source,
          telemetry_tag: detail.telemetry_tag,
          target_words: detail.target_words,
          attempts: detail.attempts,
          correct: detail.correct,
          duration_ms: detail.duration_ms,
        },
        at: new Date().toISOString(),
      });
      // Persist a raw event for the `/admin/beta-analytics` Vocab Arc Lift tile.
      try {
        await (supabase as any).from('analytics_events').insert({
          event_type: 'vocab_arc_complete',
          user_id: studentId,
          event_data: {
            hub: opts.getHub?.() ?? defaultHub,
            lesson_id: opts.getLessonId?.() ?? null,
            skill_key: detail.skill_key,
            telemetry_tag: detail.telemetry_tag,
            target_words: detail.target_words,
            accuracy: detail.accuracy,
            attempts: detail.attempts,
            correct: detail.correct,
            duration_ms: detail.duration_ms,
            source: detail.source,
          },
        });
      } catch { /* telemetry only */ }
    } catch {
      /* best-effort — telemetry must never break the lesson */
    }
  });

  // Boss Round outcomes — persist a lightweight row so the teacher report card
  // and beta-analytics can chart boss win rate over time.
  window.addEventListener('vocab-arc:boss-complete', async (evt: Event) => {
    try {
      const detail: any = (evt as CustomEvent).detail ?? {};
      const { data } = await supabase.auth.getUser();
      const studentId = data?.user?.id;
      if (!studentId) return;
      await (supabase as any).from('analytics_events').insert({
        event_type: 'vocab_boss_complete',
        user_id: studentId,
        event_data: {
          hub: detail.hub ?? opts.getHub?.() ?? defaultHub,
          cefr: detail.cefr ?? null,
          lesson_id: detail.lessonId ?? opts.getLessonId?.() ?? null,
          unit_id: detail.unitId ?? null,
          correct: detail.correct ?? 0,
          total: detail.total ?? 0,
          ms_elapsed: detail.ms_elapsed ?? 0,
          victory: !!detail.victory,
        },
      });
    } catch { /* telemetry only */ }
  });
}
