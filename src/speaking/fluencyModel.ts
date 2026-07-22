// Fluency model — converts raw speaking signals into a fluency score.
// Inputs come from speaking_attempts aggregates + intelligence.speaking_confidence.

import type { FluencyMetrics, SpeakingRung } from './types';

export interface FluencyInputs {
  wpm_avg?: number;             // words per minute
  hesitation_ratio?: number;    // 0..1
  mean_length_utterance?: number; // words
  voluntary_attempts_7d?: number;
  growth_trend?: 'up' | 'flat' | 'down';
  prior_rung?: SpeakingRung;
}

// CEFR-anchored target ranges (rough).
const TARGET_WPM = { min: 60, ideal: 110, max: 160 };
const TARGET_MLU = { min: 4, ideal: 8, max: 14 };

function clamp(n: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, n));
}

export function computeFluency(input: FluencyInputs): FluencyMetrics {
  const wpm = input.wpm_avg ?? 0;
  const hes = input.hesitation_ratio ?? 0.5;
  const mlu = input.mean_length_utterance ?? 0;

  const wpmScore = wpm <= 0
    ? 0
    : wpm < TARGET_WPM.ideal
      ? (wpm - TARGET_WPM.min) / (TARGET_WPM.ideal - TARGET_WPM.min)
      : 1 - Math.min(1, (wpm - TARGET_WPM.ideal) / (TARGET_WPM.max - TARGET_WPM.ideal));
  const mluScore = mlu <= 0
    ? 0
    : Math.min(1, (mlu - TARGET_MLU.min) / (TARGET_MLU.ideal - TARGET_MLU.min));
  const hesScore = 1 - clamp(hes);

  const fluency = clamp(0.45 * wpmScore + 0.35 * hesScore + 0.20 * mluScore);
  const trend = input.growth_trend ?? 'flat';

  // Connected-speech score is a proxy: rewards higher MLU + lower hesitation.
  const connected = clamp(0.6 * mluScore + 0.4 * hesScore);

  return {
    fluency_score: fluency,
    confidence_score: 0, // filled by confidenceModel
    mean_length_utterance: mlu,
    hesitation_ratio: clamp(hes),
    connected_speech_score: connected,
    rung: input.prior_rung ?? 'repetition',
    trend,
  };
}
