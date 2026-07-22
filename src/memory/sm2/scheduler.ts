// SM-2+ spaced repetition scheduler.
// Updates ease_factor, interval, repetitions, next_due_at on each review.

import type { MemoryItem } from '../types';

export interface SM2Update {
  quality: number; // 0..5
  speakingUsed?: boolean;
  errorFrequency?: number; // 0..1
  recallStrength?: number; // 0..1
}

const MIN_EF = 1.3;
const MAX_EF = 2.8;
const MAX_INTERVAL = 180;

/** Classic SM-2 with modifiers: speaking use boosts retention, errors shorten intervals. */
export function scheduleNext(item: MemoryItem, u: SM2Update, now = new Date()): MemoryItem {
  let ef = item.ease_factor || 2.5;
  let reps = item.repetitions || 0;
  let interval = item.interval_days || 1;

  const q = Math.max(0, Math.min(5, u.quality));

  if (q < 3) {
    reps = 0;
    interval = 1;
  } else {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(interval * ef);
  }

  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (u.speakingUsed) ef += 0.05;
  if (u.errorFrequency && u.errorFrequency > 0.4) ef -= 0.1;
  ef = Math.max(MIN_EF, Math.min(MAX_EF, ef));

  interval = Math.max(1, Math.min(MAX_INTERVAL, interval));

  const next = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  // Predicted decay = ~2.5× interval (Ebbinghaus tail)
  const decay = new Date(now.getTime() + interval * 2.5 * 24 * 60 * 60 * 1000);

  return {
    ...item,
    ease_factor: round(ef, 3),
    interval_days: interval,
    repetitions: reps,
    last_seen_at: now.toISOString(),
    next_due_at: next.toISOString(),
    predicted_decay_at: decay.toISOString(),
  };
}

function round(n: number, p: number) {
  const m = Math.pow(10, p);
  return Math.round(n * m) / m;
}
