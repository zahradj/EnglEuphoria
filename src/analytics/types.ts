// Beta Testing & Analytics — public types.
// Stage 12. Tier 6 (soft, longitudinal). Never overrides CEFR/curriculum/age/safety.

import type { Hub, Cefr } from '@/governance/types';

export type LearnerSignalType =
  | 'frustration'
  | 'boredom'
  | 'overload'
  | 'disengagement'
  | 'too_hard'
  | 'too_easy';

export interface LearnerSignal {
  type: LearnerSignalType;
  severity: number; // 0..1
  evidence: Array<Record<string, unknown>>;
  source_lesson_id?: string;
  decay_at?: string;
}

export interface LessonTelemetry {
  studentId: string;
  hub: Hub;
  cefr?: Cefr;
  lessonId: string;
  completion: number;            // 0..1
  speaking_participation: number; // 0..1
  homework_completion: number;    // 0..1
  game_engagement: number;        // 0..1
  review_effectiveness: number;   // 0..1
  vocab_mastery_velocity: number;
  pronunciation_growth: number;
  fluency_progression: number;
  avg_slide_dwell_ms: number;
  drop_off_slide?: number;
  accuracy_running: number;       // 0..1
  session_minutes: number;
  recordedAt: string;
}

export interface LessonHotspot {
  lesson_id: string;
  scope: { hub: Hub; cefr?: Cefr; unit?: string };
  completion_p50: number;
  drop_off_slide_top?: number;
  drop_off_concentration: number; // 0..1
  top_signals: LearnerSignalType[];
  flag: 'healthy' | 'watch' | 'critical';
  sample_size: number;
}

export interface BetaInsight {
  scope: { hub?: Hub; cefr?: Cefr; unit?: string; lesson_id?: string };
  metric: string;
  p50: number;
  p90: number;
  sample_size: number;
  flag?: 'healthy' | 'watch' | 'critical';
  details?: Record<string, unknown>;
  computed_at: string;
}

export interface AnalyticsTuningDelta {
  engine: 'adaptive' | 'memory' | 'speaking' | 'coherence' | 'stabilization';
  field: string;
  before: number | string;
  after: number | string;
  reason: string;
  bounded: true;
}

export const ANALYTICS_VERSION = '1.0.0' as const;
