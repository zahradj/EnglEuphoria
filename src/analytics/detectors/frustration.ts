// Frustration detector — pure, deterministic.
// Triggers on consecutive fails, retry-spam, abandoned speaking.

import type { LearnerSignal } from '../types';

export interface FrustrationInput {
  consecutive_fails_same_target: number;
  retry_intervals_ms: number[]; // intervals between attempts
  abandoned_speaking_tasks: number;
}

export function detectFrustration(i: FrustrationInput): LearnerSignal | null {
  const evidence: Array<Record<string, unknown>> = [];
  let severity = 0;

  if (i.consecutive_fails_same_target >= 3) {
    severity += 0.4;
    evidence.push({ k: 'consecutive_fails', v: i.consecutive_fails_same_target });
  }
  const fast = i.retry_intervals_ms.filter((x) => x < 2000).length;
  if (fast >= 3) {
    severity += 0.3;
    evidence.push({ k: 'retry_spam', v: fast });
  }
  if (i.abandoned_speaking_tasks >= 1) {
    severity += 0.3;
    evidence.push({ k: 'abandoned_speaking', v: i.abandoned_speaking_tasks });
  }

  if (severity < 0.3) return null;
  return {
    type: 'frustration',
    severity: Math.min(1, severity),
    evidence,
  };
}
