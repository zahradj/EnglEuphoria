// Beta Testing & Analytics — Stage 12 + tier-6 feedback loop.
//
// Public entry points:
//   - ingestLearnerEvent(event)    : runtime event ingestion
//   - runLessonTelemetry(input)    : end-of-lesson detector sweep
//   - applyAnalyticsFeedback(...)  : maps active signals → bounded engine deltas
//   - buildAnalyticsHintPrompt(...): tier-6 prompt hint (re-exported)
//
// Tier 6 (soft, longitudinal). NEVER overrides CEFR / curriculum / age / safety.

import { detectFrustration, type FrustrationInput } from './detectors/frustration';
import { detectBoredom, type BoredomInput } from './detectors/boredom';
import { detectOverload, type OverloadInput } from './detectors/overload';
import { detectDisengagement, type DisengagementInput } from './detectors/disengagement';
import {
  detectDifficultyMismatch,
  type DifficultyMismatchInput,
} from './detectors/difficultyMismatch';
import { signalToAdaptive } from './feedback/signalToAdaptive';
import { signalToMemory } from './feedback/signalToMemory';
import { signalToSpeaking } from './feedback/signalToSpeaking';
import { signalToCoherence } from './feedback/signalToCoherence';
import type {
  LearnerSignal,
  LessonTelemetry,
  AnalyticsTuningDelta,
} from './types';
export { buildAnalyticsHintPrompt } from './promptInjector';
export type {
  LearnerSignal,
  LearnerSignalType,
  LessonTelemetry,
  LessonHotspot,
  BetaInsight,
  AnalyticsTuningDelta,
} from './types';
export { ANALYTICS_VERSION } from './types';

export interface DetectorBundle {
  frustration: FrustrationInput;
  boredom: BoredomInput;
  overload: OverloadInput;
  disengagement: DisengagementInput;
  difficulty: DifficultyMismatchInput;
}

/** End-of-lesson sweep across all detectors. */
export function runLessonTelemetry(d: DetectorBundle): LearnerSignal[] {
  const signals: LearnerSignal[] = [];
  const out = [
    detectFrustration(d.frustration),
    detectBoredom(d.boredom),
    detectOverload(d.overload),
    detectDisengagement(d.disengagement),
    detectDifficultyMismatch(d.difficulty),
  ];
  for (const s of out) if (s) signals.push(s);
  return signals;
}

export interface CurrentEngineState {
  difficultyTier: number;
  reviewIntervalDays: number;
  speakingDensityTasks: number;
  homeworkMinuteCap: number;
}

export interface FeedbackResult {
  next: CurrentEngineState;
  deltas: AnalyticsTuningDelta[];
}

/** Apply signals to current engine state with hard bounds. */
export function applyAnalyticsFeedback(
  signals: LearnerSignal[],
  current: CurrentEngineState,
): FeedbackResult {
  const deltas: AnalyticsTuningDelta[] = [];
  const a = signalToAdaptive(signals, current.difficultyTier);
  if (a.delta) deltas.push(a.delta);
  const m = signalToMemory(signals, current.reviewIntervalDays);
  if (m.delta) deltas.push(m.delta);
  const s = signalToSpeaking(signals, current.speakingDensityTasks);
  if (s.delta) deltas.push(s.delta);
  const c = signalToCoherence(signals, current.homeworkMinuteCap);
  if (c.delta) deltas.push(c.delta);
  return {
    next: {
      difficultyTier: a.newTier,
      reviewIntervalDays: m.newIntervalDays,
      speakingDensityTasks: s.newDensityTasks,
      homeworkMinuteCap: c.newMinuteCap,
    },
    deltas,
  };
}

/** Persist a single slide event (runtime ingestor). */
export async function ingestLearnerEvent(args: {
  supabase: { from: (t: string) => { insert: (rows: unknown) => Promise<{ error?: unknown }> } };
  studentId: string;
  lessonId?: string;
  slideIndex: number;
  eventType: string;
  dwellMs?: number;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const { supabase, studentId, lessonId, slideIndex, eventType, dwellMs = 0, payload = {} } = args;
  await supabase.from('lesson_slide_events').insert({
    student_id: studentId,
    lesson_id: lessonId ?? null,
    slide_index: slideIndex,
    event_type: eventType,
    dwell_ms: dwellMs,
    payload,
  });
}
