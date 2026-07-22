// WTC fusion engine. Combines volume, gaze, posture, gesture, and facial signals
// into a single WTCState with an AI-driven recommendation for the teacher.
//
// Pure synchronous function; the React hook owns the sampling loop.

import type { AnxietyLevel, WTCRecommendation, WTCSignal, WTCState } from './types';

export interface FuseInput {
  signal: WTCSignal;
  negativeStreakMs: number; // how long ≥2 negative signals have persisted
}

const NEGATIVE_PERSIST_MS = 10_000;

export function fuseWTC({ signal, negativeStreakMs }: FuseInput): WTCState {
  const volScore =
    signal.volume === 'strong' ? 1 :
    signal.volume === 'normal' ? 0.8 :
    signal.volume === 'soft' ? 0.35 : 0.05;
  const gazeScore = signal.gazeRatio;
  const postureScore =
    signal.posture === 'open' ? 1 : signal.posture === 'neutral' ? 0.6 : 0.2;
  const gestureScore = 0.4 + 0.6 * signal.gestureRate; // any gestures help
  const affectScore = 1 - signal.facialNegativity;

  const wtcScore =
    0.30 * volScore +
    0.25 * gazeScore +
    0.20 * postureScore +
    0.10 * gestureScore +
    0.15 * affectScore;

  const anxietyLevel: AnxietyLevel =
    wtcScore < 0.35 ? 'high' : wtcScore < 0.6 ? 'medium' : 'low';

  let recommendation: WTCRecommendation = 'continue';
  let reason: string | undefined;

  const negatives: string[] = [];
  if (volScore < 0.4) negatives.push('low_volume');
  if (gazeScore < 0.35) negatives.push('gaze_avoidance');
  if (postureScore < 0.4) negatives.push('closed_posture');
  if (signal.facialNegativity > 0.6) negatives.push('negative_affect');

  if (anxietyLevel === 'high' && negativeStreakMs >= NEGATIVE_PERSIST_MS) {
    recommendation = negatives.includes('low_volume') ? 'switch_to_game' : 'shorten_task';
    reason = `Persistent anxiety signals: ${negatives.join(', ')}`;
  } else if (anxietyLevel === 'medium' && negatives.length >= 2) {
    recommendation = 'invite_pip_support';
    reason = `Two soft signals: ${negatives.join(', ')}`;
  }

  return {
    wtcScore: round(wtcScore, 3),
    anxietyLevel,
    recommendation,
    triggeredAt: recommendation === 'continue' ? undefined : new Date().toISOString(),
    reason,
  };
}

export function countNegatives(s: WTCSignal): number {
  let n = 0;
  if (s.volume === 'inaudible' || s.volume === 'soft') n++;
  if (s.gazeRatio < 0.35) n++;
  if (s.posture === 'closed') n++;
  if (s.facialNegativity > 0.6) n++;
  return n;
}

function round(n: number, p: number) {
  const m = Math.pow(10, p);
  return Math.round(n * m) / m;
}
