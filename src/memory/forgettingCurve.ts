// Forgetting curve prediction (Ebbinghaus-inspired).
// retention(t) = exp(-t / stability), stability scales with ease_factor and reps.

import type { MemoryItem } from './types';

export function predictRetention(item: MemoryItem, now = new Date()): number {
  if (!item.last_seen_at) return 0;
  const t = (now.getTime() - new Date(item.last_seen_at).getTime()) / (24 * 60 * 60 * 1000);
  const stability = Math.max(0.5, item.ease_factor * Math.max(1, item.repetitions));
  return Math.exp(-t / stability);
}

export function computeForgettingRisk(item: MemoryItem, now = new Date()): number {
  const retention = predictRetention(item, now);
  // Risk grows fast once retention < 0.7
  const risk = 1 - retention;
  // Speaking-fragile items + low recall_level inflate risk
  const speakingPenalty = (1 - (item.speaking_retention ?? 0)) * 0.15;
  const recallPenalty = (5 - item.recall_level) / 5 * 0.1;
  return clamp01(risk + speakingPenalty + recallPenalty);
}

export function isProactiveReviewDue(item: MemoryItem, now = new Date(), threshold = 0.35): boolean {
  return computeForgettingRisk(item, now) >= threshold;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}
