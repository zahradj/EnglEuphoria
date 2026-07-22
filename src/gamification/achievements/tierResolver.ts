import type { AchievementDefinition, AchievementTier } from '../types';

export function resolveTier(
  def: AchievementDefinition,
  value: number,
): AchievementTier | null {
  const t = def.unlockCondition.threshold;
  if (value >= t.platinum) return 'platinum';
  if (value >= t.gold) return 'gold';
  if (value >= t.silver) return 'silver';
  if (value >= t.bronze) return 'bronze';
  return null;
}

export const TIER_ORDER: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum'];

export function isTierUpgrade(prev: AchievementTier | null, next: AchievementTier | null) {
  if (!next) return false;
  if (!prev) return true;
  return TIER_ORDER.indexOf(next) > TIER_ORDER.indexOf(prev);
}
