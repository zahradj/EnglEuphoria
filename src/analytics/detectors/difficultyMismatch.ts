import type { LearnerSignal } from '../types';

export interface DifficultyMismatchInput {
  recent_activity_accuracy: number[]; // 0..1 each
  avg_slide_dwell_ms: number;
  cohort_p25_dwell_ms: number;
}

export function detectDifficultyMismatch(i: DifficultyMismatchInput): LearnerSignal | null {
  const recent = i.recent_activity_accuracy.slice(-3);
  if (recent.length >= 3 && recent.every((a) => a < 0.5)) {
    return {
      type: 'too_hard',
      severity: 0.7,
      evidence: [{ k: 'recent_acc', v: recent }],
    };
  }
  const avgAcc = recent.length ? recent.reduce((s, x) => s + x, 0) / recent.length : 0;
  const dwellLow = i.cohort_p25_dwell_ms > 0 && i.avg_slide_dwell_ms < i.cohort_p25_dwell_ms;
  if (avgAcc > 0.95 && dwellLow) {
    return {
      type: 'too_easy',
      severity: 0.6,
      evidence: [{ k: 'avg_acc', v: avgAcc }, { k: 'low_dwell', v: i.avg_slide_dwell_ms }],
    };
  }
  return null;
}
