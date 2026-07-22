import type { EngagementState } from '../types';

export interface EngagementSignals {
  speaking_turn_ratio?: number;
  hesitation_latency_ms?: number;
  retry_rate?: number;
  completion_rate?: number;
  challenge_acceptance_rate?: number;
}

export function scoreEngagement(s: EngagementSignals): EngagementState {
  const speaking = s.speaking_turn_ratio ?? 0.5;
  const hesitation = s.hesitation_latency_ms ?? 1500;
  const retry = s.retry_rate ?? 0.2;
  const completion = s.completion_rate ?? 0.7;
  const challenge = s.challenge_acceptance_rate ?? 0.5;

  const confidence = clamp(
    100 - retry * 80 - Math.min(50, hesitation / 50) + speaking * 30,
    0,
    100,
  );
  const motivation = clamp(challenge * 70 + completion * 30, 0, 100);
  const frustration_risk = clamp(retry * 100 + (1 - completion) * 60 - speaking * 20, 0, 100);

  return {
    confidence: round(confidence),
    motivation: round(motivation),
    frustration_risk: round(frustration_risk),
    speaking_turn_ratio: speaking,
    completion_rate: completion,
    hesitation_latency_ms: hesitation,
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function round(n: number) {
  return Math.round(n * 10) / 10;
}
