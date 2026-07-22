import type { LearnerSignal } from '../types';

export interface BoredomInput {
  avg_slide_dwell_ms: number;
  cohort_p20_dwell_ms: number;
  skip_forward_count: number;
  media_replay_count: number;
  media_present_count: number;
}

export function detectBoredom(i: BoredomInput): LearnerSignal | null {
  const evidence: Array<Record<string, unknown>> = [];
  let severity = 0;

  if (i.cohort_p20_dwell_ms > 0 && i.avg_slide_dwell_ms < i.cohort_p20_dwell_ms) {
    severity += 0.35;
    evidence.push({ k: 'low_dwell', v: i.avg_slide_dwell_ms });
  }
  if (i.skip_forward_count >= 3) {
    severity += 0.35;
    evidence.push({ k: 'skip_forward', v: i.skip_forward_count });
  }
  if (i.media_present_count >= 2 && i.media_replay_count === 0) {
    severity += 0.2;
    evidence.push({ k: 'zero_replay', v: i.media_present_count });
  }

  if (severity < 0.35) return null;
  return { type: 'boredom', severity: Math.min(1, severity), evidence };
}
