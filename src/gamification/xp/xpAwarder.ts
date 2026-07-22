import type { XPActionType, XPEvent, RewardDensity } from '../types';
import { XP_BASE, MULTIPLIER_BOUNDS } from './xpRules';
import { checkAntiFarming } from './antiFarmingGuards';

interface AwardInput {
  action: XPActionType;
  studentId: string;
  refId?: string;
  reason?: string;
  signals?: {
    effort?: number;
    masteryRising?: boolean;
    braveryLevel?: 0 | 1 | 2 | 3;
    streakDays?: number;
    qualityOk?: boolean;          // false => passive click / shallow engagement
    todayActionCount?: number;
  };
  rewardDensity?: RewardDensity;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Pure award resolver — no DB. The result is what the
 * `award-xp` edge function (or test) should persist.
 *
 * Anti-farming rules:
 *  - qualityOk=false → 0 XP (passive engagement)
 *  - rate cap exceeded → 0 XP (still pedagogically tracked elsewhere)
 *  - rewardDensity scales final XP (low: 0.7, medium: 1.0, high: 1.2)
 */
export function resolveXPAward(input: AwardInput): XPEvent {
  const base = XP_BASE[input.action] ?? 0;
  const signals = input.signals ?? {};

  const farming = checkAntiFarming({
    action: input.action,
    todayActionCount: signals.todayActionCount ?? 0,
    qualityOk: signals.qualityOk !== false,
  });

  if (farming.blocked) {
    return {
      action: input.action,
      baseXP: base,
      multipliers: {},
      finalXP: 0,
      refId: input.refId,
      reason: `blocked:${farming.reason}`,
    };
  }

  const effort = clamp(signals.effort ?? 1, MULTIPLIER_BOUNDS.effort.min, MULTIPLIER_BOUNDS.effort.max);
  const mastery = signals.masteryRising
    ? MULTIPLIER_BOUNDS.mastery.max
    : MULTIPLIER_BOUNDS.mastery.min;
  const bravery = clamp(
    1 + (signals.braveryLevel ?? 0) * 0.15,
    MULTIPLIER_BOUNDS.bravery.min,
    MULTIPLIER_BOUNDS.bravery.max,
  );
  const consistency = clamp(
    1 + Math.min(signals.streakDays ?? 0, 14) * 0.015,
    MULTIPLIER_BOUNDS.consistency.min,
    MULTIPLIER_BOUNDS.consistency.max,
  );

  const densityFactor =
    input.rewardDensity === 'low' ? 0.7 : input.rewardDensity === 'high' ? 1.2 : 1.0;

  const finalXP = Math.round(base * effort * mastery * bravery * consistency * densityFactor);

  return {
    action: input.action,
    baseXP: base,
    multipliers: { effort, mastery, bravery, consistency },
    finalXP,
    refId: input.refId,
    reason: input.reason,
  };
}
