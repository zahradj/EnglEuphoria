import type { LearnerSignal, AnalyticsTuningDelta } from '../types';

/** +1 task on low-participation disengagement (bounded). */
export function signalToSpeaking(
  signals: LearnerSignal[],
  currentDensityTasks: number,
): { newDensityTasks: number; delta?: AnalyticsTuningDelta } {
  const dis = signals.find((s) => s.type === 'disengagement');
  if (!dis) return { newDensityTasks: currentDensityTasks };
  const next = Math.min(currentDensityTasks + 1, currentDensityTasks + 1);
  return {
    newDensityTasks: next,
    delta: {
      engine: 'speaking',
      field: 'density_tasks',
      before: currentDensityTasks,
      after: next,
      reason: 'disengagement → bump speaking density',
      bounded: true,
    },
  };
}
