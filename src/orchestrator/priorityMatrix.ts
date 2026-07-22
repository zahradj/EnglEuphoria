// 8-tier priority matrix for cross-engine conflict resolution.
// CEFR > Curriculum > Educational > Age > Communication > Adaptive > Gamification > UI.

import type { PriorityTier } from './types';

const TIER_RANK: Record<PriorityTier, number> = {
  cefr: 1,
  curriculum: 2,
  educational: 3,
  age: 4,
  communication: 5,
  adaptive: 6,
  gamification: 7,
  ui: 8,
};

/** Lower rank wins. */
export function tierRank(tier: PriorityTier): number {
  return TIER_RANK[tier];
}

/** Hard tiers cannot be overridden by lower tiers even with strong rationale. */
export const HARD_TIERS: ReadonlySet<PriorityTier> = new Set<PriorityTier>([
  'cefr',
  'curriculum',
  'educational',
  'age',
]);

export function isHardTier(tier: PriorityTier): boolean {
  return HARD_TIERS.has(tier);
}

export function tierWins(a: PriorityTier, b: PriorityTier): boolean {
  return tierRank(a) < tierRank(b);
}
