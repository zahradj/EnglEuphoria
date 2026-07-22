/**
 * Per-lesson quality score derived from real student telemetry.
 * Surfaced in the Creator Hub; lessons below threshold auto-flag for regen.
 *
 * Inputs (already captured): lesson_slide_events, learner_signals, speech_attempts.
 * Pure function — caller fetches rows and passes them in.
 */

export interface LessonTelemetryInput {
  lessonId: string;
  totalSessions: number;
  completedSessions: number;
  avgReplayCount: number;          // per slide
  speakingAttempts: number;
  speakingSuccesses: number;
  frustrationSignals: number;
  boredomSignals: number;
}

export interface LessonQualityScore {
  lessonId: string;
  score: number;            // 0–100
  band: 'excellent' | 'good' | 'review' | 'regenerate';
  signals: {
    completion_rate: number;
    replay_rate: number;
    speaking_density: number;
    frustration_rate: number;
    boredom_rate: number;
  };
  flagged: boolean;
}

const THRESHOLDS = { regenerate: 50, review: 70, good: 85 } as const;

export function computeLessonQualityScore(t: LessonTelemetryInput): LessonQualityScore {
  const safe = Math.max(1, t.totalSessions);
  const completion = t.completedSessions / safe;
  const replay = Math.min(1, t.avgReplayCount / 3); // 3+ replays/slide = high
  const speaking = t.speakingAttempts === 0 ? 0 : t.speakingSuccesses / t.speakingAttempts;
  const frustration = t.frustrationSignals / safe;
  const boredom = t.boredomSignals / safe;

  // Weighted: completion 35, speaking 25, replay 15 (positive engagement),
  // negative penalties: frustration 15, boredom 10.
  const raw =
    completion * 35 +
    speaking * 25 +
    replay * 15 +
    (1 - Math.min(1, frustration * 2)) * 15 +
    (1 - Math.min(1, boredom * 2)) * 10;

  const score = Math.round(Math.max(0, Math.min(100, raw)));
  const band: LessonQualityScore['band'] =
    score >= THRESHOLDS.good ? 'excellent'
    : score >= THRESHOLDS.review ? 'good'
    : score >= THRESHOLDS.regenerate ? 'review'
    : 'regenerate';

  return {
    lessonId: t.lessonId,
    score,
    band,
    flagged: band === 'regenerate' || band === 'review',
    signals: {
      completion_rate: round(completion),
      replay_rate: round(replay),
      speaking_density: round(speaking),
      frustration_rate: round(frustration),
      boredom_rate: round(boredom),
    },
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
