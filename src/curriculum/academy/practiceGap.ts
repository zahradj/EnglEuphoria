// Practice gaps (owner 2026-10-14: "students sometimes don't remember what they learned before... the lack of practice. How can we manage that?").
// Spacing (recall.ts) assumes the student practises on schedule. When they do not, this decides how the next lesson changes: how many new items,
// how long Remember? runs, and whether to replay earlier lessons. Pure; Academy-only. Thresholds are design choices [target], to tune with real data.
// Tone rule: never shame; "Not yet" wording, comfort first (CLAUDE.md).

/** What the system knows about a student before a lesson. All optional: missing data counts as on track. */
export interface PracticeSignals {
  /** days since the last finished lesson (0 when the lessons are on schedule) */
  daysSinceLastLesson?: number;
  /** finished Daily 10 sessions over the last 14 days, as a share of the ones scheduled (0-1) */
  daily10Rate?: number;
  /** share of Remember? items answered right without a hint in the last lesson (0-1) */
  rememberAccuracy?: number;
  /** consecutive booked lessons that were missed */
  missedInRow?: number;
}

export type GapMode = 'on-track' | 'refresh' | 'rewind' | 'restart';

export interface GapDecision {
  mode: GapMode;
  /** most new items the lesson may introduce (normal cap: 14; Pre-A1: 8) */
  newItemCap: number;
  /** minutes of the lesson given to Remember? (normal 10) */
  rememberMinutes: number;
  /** earlier lessons to replay instead of teaching new language (rewind/restart) */
  replayLessons: number;
  /** a 5-minute placement-style re-check before anything else (restart) */
  recheck: boolean;
  /** items overdue on the schedule come back first, before the scheduled ones */
  overdueFirst: boolean;
  /** what the student is told: kind, never shaming */
  message: string;
  /** why this mode was chosen (shown to the teacher) */
  reasons: string[];
}

/** Minimum healthy dose per week (design target): 2 lessons + 3 Daily 10 sessions, about 90 minutes. Below it, nudges and mini Daily 10s start. */
export const WEEKLY_DOSE = { lessons: 2, daily10: 3, minutes: 90 } as const;

export function decideForGap(sig: PracticeSignals, preA1 = false): GapDecision {
  const days = sig.daysSinceLastLesson ?? 0;
  const rate = sig.daily10Rate ?? 1;
  const acc = sig.rememberAccuracy ?? 1;
  const missed = sig.missedInRow ?? 0;
  const baseCap = preA1 ? 8 : 14;
  const reasons: string[] = [];

  if (days > 30 || (acc < 0.4 && rate < 0.3)) {
    if (days > 30) reasons.push(`${days} days since the last lesson`);
    if (acc < 0.4) reasons.push('very low recall in the last lesson');
    return { mode: 'restart', newItemCap: 0, rememberMinutes: 20, replayLessons: 4, recheck: true, overdueFirst: true, message: 'Welcome back! Let us warm up and see what you still know. It is okay if some things are not yet there.', reasons };
  }
  if (days > 14 || missed >= 3 || acc < 0.5) {
    if (days > 14) reasons.push(`${days} days since the last lesson`);
    if (missed >= 3) reasons.push(`${missed} lessons missed in a row`);
    if (acc < 0.5) reasons.push('recall under 50 % in the last lesson');
    return { mode: 'rewind', newItemCap: 0, rememberMinutes: 15, replayLessons: 2, recheck: false, overdueFirst: true, message: 'Let us replay the last two lessons first, then move on together.', reasons };
  }
  if (days > 7 || rate < 0.5 || acc < 0.7 || missed >= 1) {
    if (days > 7) reasons.push(`${days} days since the last lesson`);
    if (rate < 0.5) reasons.push('Daily 10 under half done');
    if (acc < 0.7) reasons.push('recall under 70 % in the last lesson');
    if (missed >= 1) reasons.push('a lesson was missed');
    return { mode: 'refresh', newItemCap: Math.min(preA1 ? 5 : 8, baseCap), rememberMinutes: 15, replayLessons: 0, recheck: false, overdueFirst: true, message: 'A longer warm-up today: your brain keeps what it uses. A little practice each day helps.', reasons };
  }
  return { mode: 'on-track', newItemCap: baseCap, rememberMinutes: 10, replayLessons: 0, recheck: false, overdueFirst: false, message: 'Great rhythm! Let us build on what you know.', reasons: ['practice is on schedule'] };
}

/** Between lessons: how to nudge a student who is below the weekly dose. Kind, small, and never a streak penalty (streak freezes exist). */
export function nudgeFor(dailyDoneThisWeek: number): { size: 'normal' | 'mini' | 'rescue'; minutes: number; message: string } {
  if (dailyDoneThisWeek >= WEEKLY_DOSE.daily10) return { size: 'normal', minutes: 10, message: 'Daily 10 is ready when you are.' };
  if (dailyDoneThisWeek >= 1) return { size: 'mini', minutes: 5, message: 'Just 5 minutes today: three quick rounds to keep your words fresh.' };
  return { size: 'rescue', minutes: 5, message: 'Welcome back! A 5-minute warm-up with words you already know.' };
}
