// Advanced AI Features — Game Intelligence Layer, unified entry point.
//
//   runGameIntelligence({ ctx, currentTier, scaffold, sessionStats })
//     → GameIntelligenceDecision { items, difficulty, prompt_hint, trace }
//
// This is the ONE call any game runner makes to receive:
//   • adaptive difficulty (bumped ±1 vs current tier)
//   • an ordered item list mixing target / recycled errors / spaced review
//   • personalized context annotations
//   • a prompt fragment to chain after buildArcadeSystemPrompt()
//
// Composition order inside the returned `items` array (deterministic):
//   1. Recycled errors (up to `ERROR_QUOTA` of round_size)
//   2. Spaced review     (up to `REVIEW_QUOTA` of round_size)
//   3. Fresh target items (fills the remainder — supplied by caller via `baseline`)
// Then personalizer annotates all items with interest context.

import { adjustDifficulty } from './difficultyAdapter';
import { recycleErrors } from './errorRecycler';
import { pullSpacedReview } from './spacedReviewPuller';
import { personalizeItems } from './personalizer';
import { buildGameIntelligencePrompt } from './promptInjector';
import type {
  DifficultyTier,
  GameIntelligenceContext,
  GameIntelligenceDecision,
  GameItem,
  GameSessionStats,
} from './types';

export * from './types';
export { buildGameIntelligencePrompt };

const ERROR_QUOTA = 0.35;   // up to 35% of round is recycled errors
const REVIEW_QUOTA = 0.25;  // up to 25% is spaced review

export interface RunGameIntelligenceArgs {
  ctx: GameIntelligenceContext;
  /** Current tier the game is about to render at (before adaptation). */
  currentTier: DifficultyTier;
  /** Current scaffolding level in the UI. */
  scaffold: 0 | 1 | 2;
  /** Live session stats — pass `emptyStats()` for cold-start rounds. */
  sessionStats: GameSessionStats;
  /** Fresh target items supplied by the game (e.g. lesson vocab / grammar prompts). */
  baseline: GameItem[];
}

export function runGameIntelligence(args: RunGameIntelligenceArgs): GameIntelligenceDecision {
  const { ctx, currentTier, scaffold, sessionStats, baseline } = args;
  const size = Math.max(1, ctx.round_size);

  const errorSlots = Math.floor(size * ERROR_QUOTA);
  const reviewSlots = Math.floor(size * REVIEW_QUOTA);

  const errors = errorSlots > 0
    ? recycleErrors(ctx.intelligence.error_patterns, sessionStats, errorSlots)
    : [];
  const review = reviewSlots > 0
    ? pullSpacedReview(ctx.intelligence.review_priority, reviewSlots)
    : [];

  // De-dup by payload so we never test the same word twice.
  const seen = new Set<string>();
  const dedup = (items: GameItem[]) => items.filter((it) => {
    const k = it.payload.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const composed: GameItem[] = [
    ...dedup(errors),
    ...dedup(review),
    ...dedup(baseline.map((b) => ({ ...b, provenance: b.provenance ?? 'target' as const }))),
  ].slice(0, size);

  const { items, interestsUsed } = personalizeItems(composed, ctx.intelligence);

  const difficulty = adjustDifficulty(currentTier, scaffold, sessionStats);

  const trace = {
    from_target: items.filter((i) => i.provenance === 'target').length,
    from_error_recycle: items.filter((i) => i.provenance === 'error_recycle').length,
    from_spaced_review: items.filter((i) => i.provenance === 'spaced_review').length,
    from_interest_swap: items.filter((i) => i.provenance === 'interest_swap').length,
    from_baseline: items.filter((i) => i.provenance === 'baseline').length,
    interests_used: interestsUsed,
    error_ids_used: items.filter((i) => i.provenance === 'error_recycle').map((i) => i.id),
    review_keys_used: items.filter((i) => i.provenance === 'spaced_review').map((i) => i.id),
  };

  const decision: GameIntelligenceDecision = {
    items,
    difficulty,
    prompt_hint: '',
    trace,
  };
  decision.prompt_hint = buildGameIntelligencePrompt(decision);
  return decision;
}

export function emptyStats(): GameSessionStats {
  return { attempts: 0, correct: 0, streak: 0, window: [], session_errors: [] };
}

/**
 * Fold a single observation into the running session stats.
 * Callers keep the returned value in React state (or in-memory in edge fn).
 */
export function foldObservation(
  stats: GameSessionStats,
  evt:
    | { type: 'correct'; response_ms?: number }
    | { type: 'wrong'; payload: string; expected: string; response_ms?: number }
    | { type: 'skip' },
): GameSessionStats {
  if (evt.type === 'skip') {
    return { ...stats, attempts: stats.attempts + 1, streak: 0, window: [...stats.window, false].slice(-20) };
  }
  if (evt.type === 'correct') {
    const nextCorrect = stats.correct + 1;
    const nextAttempts = stats.attempts + 1;
    const avg = evt.response_ms != null
      ? Math.round(((stats.avg_response_ms ?? evt.response_ms) * (nextCorrect - 1) + evt.response_ms) / nextCorrect)
      : stats.avg_response_ms;
    return {
      ...stats,
      correct: nextCorrect,
      attempts: nextAttempts,
      streak: stats.streak + 1,
      window: [...stats.window, true].slice(-20),
      avg_response_ms: avg,
    };
  }
  return {
    ...stats,
    attempts: stats.attempts + 1,
    streak: 0,
    window: [...stats.window, false].slice(-20),
    session_errors: [
      ...stats.session_errors,
      { payload: evt.payload, expected: evt.expected, at: new Date().toISOString() },
    ].slice(-20),
  };
}
