import type { LearnerSignal, AnalyticsTuningDelta } from '../types';

/** Shorten review intervals on too-hard, lengthen on too-easy. Bounded ±25%. */
export function signalToMemory(
  signals: LearnerSignal[],
  baseIntervalDays: number,
): { newIntervalDays: number; delta?: AnalyticsTuningDelta } {
  const hard = signals.some((s) => s.type === 'too_hard' || s.type === 'overload');
  const easy = signals.some((s) => s.type === 'too_easy');
  if (hard) {
    const next = Math.max(1, Math.round(baseIntervalDays * 0.75));
    return next === baseIntervalDays
      ? { newIntervalDays: next }
      : {
          newIntervalDays: next,
          delta: {
            engine: 'memory',
            field: 'review_interval_days',
            before: baseIntervalDays,
            after: next,
            reason: 'too_hard → shorten',
            bounded: true,
          },
        };
  }
  if (easy) {
    const next = Math.round(baseIntervalDays * 1.25);
    return next === baseIntervalDays
      ? { newIntervalDays: next }
      : {
          newIntervalDays: next,
          delta: {
            engine: 'memory',
            field: 'review_interval_days',
            before: baseIntervalDays,
            after: next,
            reason: 'too_easy → lengthen',
            bounded: true,
          },
        };
  }
  return { newIntervalDays: baseIntervalDays };
}
