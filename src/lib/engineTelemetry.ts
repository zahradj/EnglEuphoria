/**
 * Language Engine Slot telemetry helper.
 *
 * Fire-and-forget bridge to the intelligence-observer edge function.
 * Mirrors emitVocabArcComplete but tagged as `language_engine_*` so the
 * teacher digest + Unit Progress Report can surface engine performance
 * alongside vocab games without conflating the two channels.
 */

import type { LanguageEngineSlotType } from './engineSlotInjector';

export const LANGUAGE_ENGINE_TELEMETRY_SOURCE = 'language_engine_studio' as const;

export interface EngineCompleteEvent {
  engineType: LanguageEngineSlotType;
  mode: 'lesson' | 'review' | 'quiz';
  target_words: string[];
  attempts: number;
  correct: number;
  accuracy: number; // 0..100
  duration_ms: number;
  lessonId?: string;
  hub?: 'playground' | 'academy' | 'success';
  cefr?: string;
}

export function emitLanguageEngineComplete(event: EngineCompleteEvent): void {
  try {
    // Reuse the vocab-arc telemetry channel to avoid a second POST path.
    // Observer routes by `telemetry_tag` prefix.
    import('@/lib/vocabArcTelemetry')
      .then(({ emitVocabArcComplete }) => {
        emitVocabArcComplete({
          telemetry_tag: `language_engine_${event.engineType.replace('_slot', '')}_${event.mode}`,
          skill_key:
            event.engineType === 'story_engine_slot'
              ? 'narrative_choice'
              : event.engineType === 'escape_room_slot'
                ? 'problem_solving'
                : event.engineType === 'detective_mystery_slot'
                  ? 'inference'
                  : 'visual_matching',
          target_words: event.target_words,
          attempts: event.attempts,
          correct: event.correct,
          accuracy: Math.round(event.accuracy),
          duration_ms: event.duration_ms,
          source: LANGUAGE_ENGINE_TELEMETRY_SOURCE,
        });
      })
      .catch(() => {});
  } catch {
    /* noop */
  }
}
