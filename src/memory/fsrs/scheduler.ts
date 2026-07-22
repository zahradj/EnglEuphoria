// FSRS-5 scheduler. Pure TS. No I/O.
// Drop-in replacement for SM-2 scheduling logic. Preserves MemoryItem shape and
// stores algorithm state in `item.fsrs_state` (jsonb column on memory_items).
//
// Confidence rating 1..5 maps to FSRS rating:
//   1 = Again (forgot)
//   2 = Hard
//   3 = Good
//   4 = Easy
//   5 = Perfect (treated as Easy with bonus stability)

import type { MemoryItem } from '../types';
import {
  FSRS_W,
  FSRS_REQUEST_RETENTION,
  FSRS_MAX_INTERVAL_DAYS,
  FSRS_DECAY,
  FSRS_FACTOR,
} from './parameters';

export type FsrsRating = 1 | 2 | 3 | 4 | 5;

export interface FsrsState {
  stability: number;       // S — days until R drops to request_retention
  difficulty: number;      // D — 1..10 (FSRS uses 1..10)
  last_review: string;     // ISO
  due: string;             // ISO
  reps: number;
  lapses: number;
  reviewed_at_state?: 'new' | 'learning' | 'review' | 'relearning';
}

export interface FsrsReviewInput {
  rating: FsrsRating;
  now?: Date;
  speakingUsed?: boolean;
}

export interface FsrsReviewResult {
  state: FsrsState;
  intervalDays: number;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function initStability(rating: FsrsRating): number {
  // FSRS w[0..3] — initial stability by first rating
  const r = Math.min(4, Math.max(1, rating === 5 ? 4 : rating));
  return Math.max(0.1, FSRS_W[r - 1]);
}

function initDifficulty(rating: FsrsRating): number {
  const r = Math.min(4, Math.max(1, rating === 5 ? 4 : rating));
  const d = FSRS_W[4] - Math.exp(FSRS_W[5] * (r - 1)) + 1;
  return clamp(d, 1, 10);
}

function nextDifficulty(d: number, rating: FsrsRating): number {
  const r = Math.min(4, Math.max(1, rating === 5 ? 4 : rating));
  const delta = -FSRS_W[6] * (r - 3);
  const next = d + delta * ((10 - d) / 9);
  // Mean reversion toward initDifficulty(4)
  const target = initDifficulty(4);
  const reverted = FSRS_W[7] * target + (1 - FSRS_W[7]) * next;
  return clamp(reverted, 1, 10);
}

function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FSRS_FACTOR * elapsedDays) / stability, FSRS_DECAY);
}

function nextRecallStability(d: number, s: number, r: number, rating: FsrsRating): number {
  const hardPenalty = rating === 2 ? FSRS_W[15] : 1;
  const easyBonus = rating === 4 || rating === 5 ? FSRS_W[16] : 1;
  const inc =
    1 +
    Math.exp(FSRS_W[8]) *
      (11 - d) *
      Math.pow(s, -FSRS_W[9]) *
      (Math.exp((1 - r) * FSRS_W[10]) - 1) *
      hardPenalty *
      easyBonus;
  return Math.max(0.1, s * inc);
}

function nextForgetStability(d: number, s: number, r: number): number {
  return Math.max(
    0.1,
    FSRS_W[11] * Math.pow(d, -FSRS_W[12]) * (Math.pow(s + 1, FSRS_W[13]) - 1) * Math.exp((1 - r) * FSRS_W[14]),
  );
}

function intervalFromStability(s: number, requestRetention = FSRS_REQUEST_RETENTION): number {
  const interval = (s / FSRS_FACTOR) * (Math.pow(requestRetention, 1 / FSRS_DECAY) - 1);
  return clamp(Math.round(interval), 1, FSRS_MAX_INTERVAL_DAYS);
}

/** Run FSRS-5 step given a prior state (or null for new). Returns new state. */
export function fsrsReview(prior: FsrsState | null, input: FsrsReviewInput): FsrsReviewResult {
  const now = input.now ?? new Date();
  const rating = input.rating;

  if (!prior) {
    const s0 = initStability(rating);
    const d0 = initDifficulty(rating);
    const sBonus = input.speakingUsed ? s0 * 1.1 : s0;
    const interval = rating === 1 ? 1 : intervalFromStability(sBonus);
    return {
      intervalDays: interval,
      state: {
        stability: sBonus,
        difficulty: d0,
        last_review: now.toISOString(),
        due: new Date(now.getTime() + interval * 86400000).toISOString(),
        reps: 1,
        lapses: rating === 1 ? 1 : 0,
        reviewed_at_state: rating === 1 ? 'relearning' : 'learning',
      },
    };
  }

  const elapsedDays = Math.max(
    0,
    (now.getTime() - new Date(prior.last_review).getTime()) / 86400000,
  );
  const r = retrievability(elapsedDays, prior.stability);
  const d = nextDifficulty(prior.difficulty, rating);

  let s: number;
  let lapses = prior.lapses;
  if (rating === 1) {
    s = nextForgetStability(d, prior.stability, r);
    lapses += 1;
  } else {
    s = nextRecallStability(d, prior.stability, r, rating);
    if (input.speakingUsed) s *= 1.05;
  }

  const interval = rating === 1 ? 1 : intervalFromStability(s);

  return {
    intervalDays: interval,
    state: {
      stability: s,
      difficulty: d,
      last_review: now.toISOString(),
      due: new Date(now.getTime() + interval * 86400000).toISOString(),
      reps: prior.reps + 1,
      lapses,
      reviewed_at_state: rating === 1 ? 'relearning' : 'review',
    },
  };
}

/** Apply FSRS to a MemoryItem; returns updated item with fsrs_state attached and SM-2 fields kept in sync. */
export function scheduleFsrs(
  item: MemoryItem & { fsrs_state?: FsrsState | null },
  rating: FsrsRating,
  opts: { now?: Date; speakingUsed?: boolean } = {},
): MemoryItem & { fsrs_state: FsrsState } {
  const result = fsrsReview(item.fsrs_state ?? null, {
    rating,
    now: opts.now,
    speakingUsed: opts.speakingUsed,
  });
  const now = opts.now ?? new Date();
  const decay = new Date(now.getTime() + result.intervalDays * 2.5 * 86400000);
  return {
    ...item,
    fsrs_state: result.state,
    interval_days: result.intervalDays,
    repetitions: result.state.reps,
    ease_factor: round(2.0 + (result.state.stability / 30), 3), // surrogate for legacy SM-2 consumers
    last_seen_at: now.toISOString(),
    next_due_at: result.state.due,
    predicted_decay_at: decay.toISOString(),
    forgetting_risk: clamp(1 - retrievability(result.intervalDays, result.state.stability), 0, 1),
  };
}

function round(n: number, p: number) {
  const m = Math.pow(10, p);
  return Math.round(n * m) / m;
}

/** Confidence rating UI (1..5 face buttons) → FsrsRating. Identity, but explicit. */
export function confidenceToRating(confidence: 1 | 2 | 3 | 4 | 5): FsrsRating {
  return confidence;
}
