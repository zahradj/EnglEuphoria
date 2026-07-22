import type { XPActionType } from '../types';
import { XP_DAILY_CAP } from './xpRules';

export interface FarmingCheckInput {
  action: XPActionType;
  todayActionCount: number;
  qualityOk: boolean;
}

export interface FarmingCheckResult {
  blocked: boolean;
  reason?: 'rate_cap' | 'passive_click' | 'shallow_engagement';
}

/**
 * Hard guard rails to prevent XP farming:
 *  - Passive clicks / shallow engagement (qualityOk=false) → blocked
 *  - Daily rate caps per action → blocked
 *
 * Pedagogy still tracks the underlying interaction; only XP is gated.
 */
export function checkAntiFarming(input: FarmingCheckInput): FarmingCheckResult {
  if (!input.qualityOk) return { blocked: true, reason: 'passive_click' };
  const cap = XP_DAILY_CAP[input.action];
  if (cap !== undefined && input.todayActionCount >= cap) {
    return { blocked: true, reason: 'rate_cap' };
  }
  return { blocked: false };
}
