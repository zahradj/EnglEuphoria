import type { LearnerSignal } from '../types';

export interface OverloadInput {
  avg_slide_dwell_ms: number;
  cohort_p90_dwell_ms: number;
  accuracy_recent: number;     // 0..1
  accuracy_running: number;    // 0..1
}

export function detectOverload(i: OverloadInput): LearnerSignal | null {
  const evidence: Array<Record<string, unknown>> = [];
  const dwellOver = i.cohort_p90_dwell_ms > 0 && i.avg_slide_dwell_ms > i.cohort_p90_dwell_ms;
  const accDrop = i.accuracy_running - i.accuracy_recent;
  if (!dwellOver || accDrop < 0.2) return null;
  evidence.push({ k: 'dwell_over_p90', v: i.avg_slide_dwell_ms });
  evidence.push({ k: 'accuracy_drop_pp', v: Math.round(accDrop * 100) });
  return {
    type: 'overload',
    severity: Math.min(1, 0.4 + accDrop),
    evidence,
  };
}
