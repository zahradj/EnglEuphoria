import type { StreakKind, StreakState } from '../types';

interface ResolveStreakInput {
  kind: StreakKind;
  current: number;
  longest: number;
  lastActivityDate: string | null;     // ISO date (yyyy-mm-dd)
  freezesRemaining: number;
  todayHasActivity: boolean;
  today: string;                        // yyyy-mm-dd
}

/**
 * Compassionate streak logic:
 *  - Same-day → no change.
 *  - Yesterday → +1.
 *  - 2 days gap → consume 1 freeze if available (streak preserved at current).
 *  - >2 days OR no freezes → "broken_compassionately": current resets to 1
 *    (if today has activity) but we never punish XP, never block content.
 */
export function resolveStreak(input: ResolveStreakInput): StreakState {
  const last = input.lastActivityDate;
  let current = input.current;
  let freezes = input.freezesRemaining;
  let status: StreakState['status'] = 'active';

  if (!input.todayHasActivity) {
    // No new activity. Just compute the at-risk flag for UI.
    if (last) {
      const diff = dayDiff(input.today, last);
      if (diff >= 1) status = 'at_risk';
    }
    return {
      kind: input.kind,
      current,
      longest: input.longest,
      lastActivityDate: last,
      freezesRemaining: freezes,
      status,
    };
  }

  if (!last) {
    current = 1;
  } else {
    const diff = dayDiff(input.today, last);
    if (diff === 0) {
      // already counted today
    } else if (diff === 1) {
      current = current + 1;
    } else if (diff === 2 && freezes > 0) {
      freezes -= 1;
      status = 'frozen';
      // current preserved + 1 for today
      current = current + 1;
    } else {
      current = 1;
      status = 'broken_compassionately';
    }
  }

  return {
    kind: input.kind,
    current,
    longest: Math.max(input.longest, current),
    lastActivityDate: input.today,
    freezesRemaining: freezes,
    status,
  };
}

function dayDiff(a: string, b: string): number {
  const ms = new Date(a).getTime() - new Date(b).getTime();
  return Math.round(ms / 86400000);
}
