/**
 * vocab-games slot injector — mode-aware host wiring for Academy + Success.
 *
 * Emits a single self-contained slide of type `vocab_games_slot` that the
 * lesson player renders via <VocabGamesSlot mode={mode} ... />. The engine
 * owns selection, layout, scoring, and telemetry — hosts stay untouched.
 *
 * Modes:
 *   - 'lesson' : per-lesson reinforcement (after the vocab block)
 *   - 'review' : Lesson 6 unit-review page (recycles all unit targets)
 *   - 'quiz'   : Unit-end assessment (single MCQ pass, 80% pass gate)
 *
 * Pedagogical contract (esl-game-studio G0):
 *   - Bound to a ReinforcementTarget (target words required).
 *   - No random content; the engine's selector is deterministic.
 *   - Hub caps respected inside the engine.
 */

import type { Cefr, Hub, VocabGamesMode, VocabTarget } from '@/vocab-games';

type AnySlide = Record<string, any>;

export const VOCAB_GAMES_SLOT_TYPE = 'vocab_games_slot' as const;
export const VOCAB_GAMES_SLOT_SOURCE = 'vocab_games_engine' as const;

export interface BuildSlotInput {
  hub: Hub;
  cefr: Cefr;
  targets: VocabTarget[];
  mode?: VocabGamesMode;
  passThreshold?: number;
  block?: 'vocab' | 'review' | 'quiz';
}

export function buildVocabGamesSlotSlide(input: BuildSlotInput): AnySlide | null {
  const targets = (input.targets || []).filter((t) => t?.word);
  if (targets.length < 2) return null;
  const mode: VocabGamesMode = input.mode ?? 'lesson';
  return {
    type: VOCAB_GAMES_SLOT_TYPE,
    block: input.block ?? (mode === 'quiz' ? 'quiz' : mode === 'review' ? 'review' : 'vocab'),
    mode,
    hub: input.hub,
    cefr: input.cefr,
    targets,
    passThreshold: mode === 'quiz' ? input.passThreshold ?? 0.8 : undefined,
    source: VOCAB_GAMES_SLOT_SOURCE,
    telemetry_tag: `vocab_games_${mode}`,
    reinforcement_target: {
      skill_key: mode === 'quiz' ? 'vocab_assessment' : 'vocab_retrieval',
      target_words: targets.map((t) => t.word),
    },
  };
}

function alreadyHasSlot(slides: AnySlide[], mode: VocabGamesMode): boolean {
  return slides.some(
    (s) => s?.type === VOCAB_GAMES_SLOT_TYPE && (s?.mode ?? 'lesson') === mode,
  );
}

/**
 * Append (review) or replace-tail (quiz) the vocab-games slot at the end of a
 * review-lesson or quiz-lesson slide array. Idempotent per mode.
 */
export function injectVocabGamesSlot(
  slides: AnySlide[],
  input: BuildSlotInput,
): { slides: AnySlide[]; injected: number } {
  if (!Array.isArray(slides)) return { slides, injected: 0 };
  const mode: VocabGamesMode = input.mode ?? 'lesson';
  if (alreadyHasSlot(slides, mode)) return { slides, injected: 0 };
  const slide = buildVocabGamesSlotSlide(input);
  if (!slide) return { slides, injected: 0 };
  return { slides: [...slides, slide], injected: 1 };
}

/** Type guard for renderers + observers. */
export function isVocabGamesSlotSlide(slide: unknown): boolean {
  return !!slide && typeof slide === 'object' && (slide as AnySlide).type === VOCAB_GAMES_SLOT_TYPE;
}

/**
 * Orchestrator: decide the correct vocab-games mode for a given lesson slot
 * and inject it once. Used by Academy + Success builders.
 *
 *   - lesson 1-5  → 'lesson'  (per-lesson reinforcement, hub-capped)
 *   - lesson 6    → 'review'  (unit recall over ALL unit targets)
 *   - isQuiz=true → 'quiz'    (single MCQ pass, passThreshold gate)
 *
 * Idempotent: if a slot of the resolved mode already exists, no-op.
 */
export interface ApplyVocabGamesInput extends Omit<BuildSlotInput, 'mode' | 'block'> {
  lessonNumber?: number;
  isQuiz?: boolean;
}

export function applyVocabGamesForLesson(
  slides: AnySlide[],
  input: ApplyVocabGamesInput,
): { slides: AnySlide[]; injected: number; mode: VocabGamesMode } {
  const mode: VocabGamesMode = input.isQuiz
    ? 'quiz'
    : (input.lessonNumber ?? 0) >= 6
      ? 'review'
      : 'lesson';
  const { slides: next, injected } = injectVocabGamesSlot(slides, { ...input, mode });
  return { slides: next, injected, mode };
}

/**
 * Storybook variant: after a book finishes, offer a `review`-mode vocab-games
 * slot bound to the book's target words. Returns `null` when there aren't
 * enough targets — callers should render nothing in that case.
 *
 * Storybooks never mutate their own page array; this returns a standalone slot
 * spec the reader mounts on the completion screen.
 */
export function buildStorybookVocabGamesSlot(input: {
  hub: Hub;
  cefr: Cefr;
  bookId: string;
  targets: VocabTarget[];
}): AnySlide | null {
  return buildVocabGamesSlotSlide({
    hub: input.hub,
    cefr: input.cefr,
    targets: input.targets,
    mode: 'review',
    block: 'review',
  });
}
