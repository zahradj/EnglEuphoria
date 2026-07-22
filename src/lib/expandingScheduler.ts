// Expanding-interval SRS scheduler for grammar rules & abstract concepts.
// Doubling ladder (1, 2, 4, 8, 16, 32, 60-day cap). Wrong answers reset the streak.
//
// This sits *outside* the locked src/memory/* engine and is consumed only by
// src/lib/srs.ts for item_type === 'grammar_rule' | 'abstract_concept'.
// Vocab keeps its existing FSRS / SM-2+ path.

export interface ExpandingInput {
  currentStreak: number; // consecutive successes prior to this attempt
  stars: 0 | 1 | 2 | 3;
}

export interface ExpandingOutput {
  nextStreak: number;
  intervalDays: number;
  nextReviewAt: string;
}

const LADDER = [1, 2, 4, 8, 16, 32, 60] as const;
const MAX_DAYS = 60;

export function scheduleExpanding(
  { currentStreak, stars }: ExpandingInput,
  now: Date = new Date(),
): ExpandingOutput {
  let nextStreak: number;
  let intervalDays: number;

  if (stars >= 2) {
    nextStreak = currentStreak + 1;
    const idx = Math.min(nextStreak - 1, LADDER.length - 1);
    intervalDays = LADDER[Math.max(0, idx)];
  } else if (stars === 1) {
    // partial success — hold streak, short interval
    nextStreak = Math.max(0, currentStreak);
    intervalDays = 1;
  } else {
    // fail — reset
    nextStreak = 0;
    intervalDays = 0;
  }

  intervalDays = Math.min(MAX_DAYS, intervalDays);
  const next = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return {
    nextStreak,
    intervalDays,
    nextReviewAt: next.toISOString(),
  };
}
