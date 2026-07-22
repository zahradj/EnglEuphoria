// Confidence model — bravery > correctness.
// Confidence rises with voluntary attempts, especially at higher rungs.

import type { SpeakingRung } from './types';

const RUNG_WEIGHT: Record<SpeakingRung, number> = {
  repetition: 0.2,
  cued: 0.4,
  guided: 0.6,
  free: 0.85,
  spontaneous: 1.0,
};

export interface ConfidenceInputs {
  voluntary_attempts_7d: number;
  retry_rate: number;             // 0..1
  bravery_count_7d: number;
  silence_ratio: number;          // 0..1
  current_rung: SpeakingRung;
}

function clamp(n: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, n));
}

export function computeConfidence(input: ConfidenceInputs): number {
  const attemptsScore = clamp(input.voluntary_attempts_7d / 14);
  const braveryScore = clamp(input.bravery_count_7d / 10);
  const silencePenalty = clamp(input.silence_ratio);
  const rungBoost = RUNG_WEIGHT[input.current_rung];
  const retryBoost = clamp(input.retry_rate);

  const score =
    0.35 * attemptsScore +
    0.25 * braveryScore +
    0.15 * retryBoost +
    0.25 * rungBoost -
    0.15 * silencePenalty;

  return clamp(score);
}
