// Willingness-to-Communicate (WTC) + L2 Anxiety multimodal tracker — Cycle 5.
// Pure types. No engine dependencies.

export type VolumeBand = 'inaudible' | 'soft' | 'normal' | 'strong';
export type PostureBand = 'closed' | 'neutral' | 'open';
export type AnxietyLevel = 'low' | 'medium' | 'high';
export type WTCRecommendation =
  | 'continue'
  | 'shorten_task'
  | 'switch_to_game'
  | 'invite_pip_support';

export interface WTCSignal {
  recordedAt: string;
  volume: VolumeBand;
  gazeRatio: number;       // 0..1 — proportion of last window with eye contact
  posture: PostureBand;
  gestureRate: number;     // gestures per 10s, normalized 0..1
  facialNegativity: number; // 0..1 (frown/tension)
}

export interface WTCState {
  wtcScore: number;        // 0..1 — higher = more willing to communicate
  anxietyLevel: AnxietyLevel;
  recommendation: WTCRecommendation;
  triggeredAt?: string;
  reason?: string;
}

export interface AnxietyTrigger {
  type: 'low_volume_persistent' | 'gaze_avoidance' | 'closed_posture' | 'negative_affect';
  severity: number; // 0..1
  durationMs: number;
}

export const WTC_VERSION = '1.0.0' as const;
