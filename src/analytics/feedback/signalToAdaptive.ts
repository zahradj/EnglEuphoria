// Feedback: signal → adaptive (bounded ±1 tier).

import type { LearnerSignal, AnalyticsTuningDelta } from '../types';

export function signalToAdaptive(
  signals: LearnerSignal[],
  currentTier: number,
): { newTier: number; delta?: AnalyticsTuningDelta } {
  const tooHard = signals.find((s) => s.type === 'too_hard' || s.type === 'overload');
  const tooEasy = signals.find((s) => s.type === 'too_easy');
  if (tooHard) {
    const newTier = Math.max(1, currentTier - 1);
    if (newTier === currentTier) return { newTier };
    return {
      newTier,
      delta: {
        engine: 'adaptive',
        field: 'difficulty_tier',
        before: currentTier,
        after: newTier,
        reason: `signal:${tooHard.type} severity=${tooHard.severity.toFixed(2)}`,
        bounded: true,
      },
    };
  }
  if (tooEasy) {
    const newTier = Math.min(5, currentTier + 1);
    if (newTier === currentTier) return { newTier };
    return {
      newTier,
      delta: {
        engine: 'adaptive',
        field: 'difficulty_tier',
        before: currentTier,
        after: newTier,
        reason: `signal:too_easy severity=${tooEasy.severity.toFixed(2)}`,
        bounded: true,
      },
    };
  }
  return { newTier: currentTier };
}
