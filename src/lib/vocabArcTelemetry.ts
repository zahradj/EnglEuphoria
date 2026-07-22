/**
 * Vocab Arc Telemetry (senior-ai-edtech-architect + esl-game-studio)
 *
 * Bridge between the vocab-gamification arc renderers
 * (VocabImageMatchSlide / MatchingSlide, plus any Playground/Success renderers)
 * and the intelligence observer.
 *
 * Renderers dispatch a `CustomEvent('vocab-arc:complete', { detail })` on
 * `window` when the whole board is solved. Any player that owns a student
 * session subscribes and routes into `handleObservationEvent()`
 * (activity_complete → student_mastery).
 *
 * Zero-cost when nothing subscribes.
 */

import { ACADEMY_VOCAB_GAMIFICATION_SOURCE } from './academyVocabGamification';
import { SUCCESS_VOCAB_GAMIFICATION_SOURCE } from './successVocabGamification';

export const PLAYGROUND_VOCAB_GAMIFICATION_SOURCE = 'playground_vocab_gamification' as const;
export const VOCAB_GAMES_ENGINE_SOURCE = 'vocab_games_engine' as const;
export const LANGUAGE_ENGINE_STUDIO_SOURCE = 'language_engine_studio' as const;

export type VocabArcSource =
  | typeof ACADEMY_VOCAB_GAMIFICATION_SOURCE
  | typeof SUCCESS_VOCAB_GAMIFICATION_SOURCE
  | typeof PLAYGROUND_VOCAB_GAMIFICATION_SOURCE
  | typeof VOCAB_GAMES_ENGINE_SOURCE
  | typeof LANGUAGE_ENGINE_STUDIO_SOURCE;

export const VOCAB_ARC_SOURCES: readonly VocabArcSource[] = [
  ACADEMY_VOCAB_GAMIFICATION_SOURCE,
  SUCCESS_VOCAB_GAMIFICATION_SOURCE,
  PLAYGROUND_VOCAB_GAMIFICATION_SOURCE,
  VOCAB_GAMES_ENGINE_SOURCE,
  LANGUAGE_ENGINE_STUDIO_SOURCE,
];

export function isVocabArcSource(v: unknown): v is VocabArcSource {
  return typeof v === 'string' && (VOCAB_ARC_SOURCES as readonly string[]).includes(v);
}

export type VocabArcCompletePayload = {
  telemetry_tag: string;
  skill_key: string;
  target_words: string[];
  attempts: number;
  correct: number;
  accuracy: number; // 0–100
  duration_ms: number;
  source: VocabArcSource;
};

export const VOCAB_ARC_COMPLETE_EVENT = 'vocab-arc:complete';

export function emitVocabArcComplete(
  payload: Omit<VocabArcCompletePayload, 'source'> & { source?: VocabArcSource },
): void {
  if (typeof window === 'undefined') return;
  try {
    const ev = new CustomEvent<VocabArcCompletePayload>(VOCAB_ARC_COMPLETE_EVENT, {
      detail: { ...payload, source: payload.source ?? ACADEMY_VOCAB_GAMIFICATION_SOURCE },
    });
    window.dispatchEvent(ev);
  } catch {
    /* best-effort */
  }
}
