import type { AchievementUnlock, Hub } from '../types';
import { ACHIEVEMENT_CATALOG, getAchievementsForHub } from './achievementCatalog';
import { resolveTier, isTierUpgrade } from './tierResolver';

export interface EvaluatorSignals {
  masteryCount?: number;
  speakingSessions?: number;
  streakDays?: number;
  missionsCompleted?: number;
  reviewsPassed?: number;
}

export interface PriorUnlock {
  achievementId: string;
  tier: AchievementUnlock['tier'];
}

/**
 * Evaluate all achievements for a hub against fresh signals.
 * Returns ONLY new unlocks or tier upgrades.
 */
export function evaluateAchievements(
  hub: Hub,
  signals: EvaluatorSignals,
  prior: PriorUnlock[],
): AchievementUnlock[] {
  const priorMap = new Map(prior.map((p) => [p.achievementId, p.tier]));
  const out: AchievementUnlock[] = [];

  for (const def of getAchievementsForHub(hub)) {
    let value = 0;
    switch (def.unlockCondition.kind) {
      case 'mastery_count': value = signals.masteryCount ?? 0; break;
      case 'speaking_sessions': value = signals.speakingSessions ?? 0; break;
      case 'streak_days': value = signals.streakDays ?? 0; break;
      case 'missions_completed': value = signals.missionsCompleted ?? 0; break;
      case 'reviews_passed': value = signals.reviewsPassed ?? 0; break;
    }
    const newTier = resolveTier(def, value);
    const prevTier = priorMap.get(def.id) ?? null;
    if (isTierUpgrade(prevTier, newTier) && newTier) {
      out.push({
        achievementId: def.id,
        tier: newTier,
        evidence: { kind: def.unlockCondition.kind, value },
        unlockedAt: new Date().toISOString(),
      });
    }
  }
  return out;
}

export { ACHIEVEMENT_CATALOG };
