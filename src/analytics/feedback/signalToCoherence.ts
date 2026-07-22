import type { LearnerSignal, AnalyticsTuningDelta } from '../types';

/** Homework minute cap ±20% based on overload/too-easy. */
export function signalToCoherence(
  signals: LearnerSignal[],
  currentMinuteCap: number,
): { newMinuteCap: number; delta?: AnalyticsTuningDelta } {
  if (signals.some((s) => s.type === 'overload' || s.type === 'too_hard')) {
    const next = Math.max(5, Math.round(currentMinuteCap * 0.8));
    return next === currentMinuteCap
      ? { newMinuteCap: next }
      : {
          newMinuteCap: next,
          delta: {
            engine: 'coherence',
            field: 'homework_minute_cap',
            before: currentMinuteCap,
            after: next,
            reason: 'overload → reduce homework load',
            bounded: true,
          },
        };
  }
  if (signals.some((s) => s.type === 'too_easy')) {
    const next = Math.round(currentMinuteCap * 1.2);
    return {
      newMinuteCap: next,
      delta: {
        engine: 'coherence',
        field: 'homework_minute_cap',
        before: currentMinuteCap,
        after: next,
        reason: 'too_easy → expand homework load',
        bounded: true,
      },
    };
  }
  return { newMinuteCap: currentMinuteCap };
}
