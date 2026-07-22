// Feedback-to-Curriculum Loop.
// Post-lesson signals → curriculum/review/motivation updates.
// Pure (no Supabase here); callers persist the returned mutations.

import type { FeedbackSignal } from './types';
import { runLongitudinalAnalysis, type LongitudinalInput } from '@/stabilization/longitudinal';
import type { CurriculumStabilizationSignal } from '@/stabilization/types';

export type CurriculumMutationKind =
  | 'unlock_next_unit'
  | 'enqueue_review'
  | 'flag_vocab_recycle'
  | 'trigger_reinforcement_lesson'
  | 'update_motivation_signal'
  | 'celebrate_speaking_breakthrough';

export interface CurriculumMutation {
  kind: CurriculumMutationKind;
  studentId: string;
  lessonId?: string;
  payload: Record<string, unknown>;
  rationale: string;
}

const MILESTONE_PASS_THRESHOLD = 80; // matches mem://curriculum/mastery-milestone-gate

export function processFeedback(signals: FeedbackSignal[]): CurriculumMutation[] {
  const out: CurriculumMutation[] = [];

  for (const s of signals) {
    switch (s.type) {
      case 'milestone_quiz_score': {
        const score = Number(s.payload?.score ?? 0);
        if (score >= MILESTONE_PASS_THRESHOLD) {
          out.push({
            kind: 'unlock_next_unit',
            studentId: s.studentId,
            lessonId: s.lessonId,
            payload: { score },
            rationale: `Milestone score ${score} ≥ ${MILESTONE_PASS_THRESHOLD}`,
          });
        } else {
          out.push({
            kind: 'trigger_reinforcement_lesson',
            studentId: s.studentId,
            lessonId: s.lessonId,
            payload: { score },
            rationale: `Milestone score ${score} below pass threshold`,
          });
        }
        break;
      }

      case 'mistake_pattern':
        out.push({
          kind: 'enqueue_review',
          studentId: s.studentId,
          payload: s.payload,
          rationale: 'Repeated mistake pattern detected',
        });
        break;

      case 'vocab_struggle':
        out.push({
          kind: 'flag_vocab_recycle',
          studentId: s.studentId,
          payload: s.payload,
          rationale: 'Vocab item below mastery threshold',
        });
        break;

      case 'speaking_breakthrough':
        out.push({
          kind: 'celebrate_speaking_breakthrough',
          studentId: s.studentId,
          payload: s.payload,
          rationale: 'Speaking confidence jump',
        });
        out.push({
          kind: 'update_motivation_signal',
          studentId: s.studentId,
          payload: { speakingParticipation: 'up' },
          rationale: 'Speaking breakthrough updates motivation profile',
        });
        break;

      case 'lesson_completed':
        out.push({
          kind: 'update_motivation_signal',
          studentId: s.studentId,
          lessonId: s.lessonId,
          payload: s.payload,
          rationale: 'Lesson completion telemetry',
        });
        break;
    }
  }

  return out;
}

/**
 * Run longitudinal stabilization analysis on a student's recent lessons.
 * Returns signals to be persisted into `curriculum_stabilization_signals`
 * and consumed by the NEXT `runLessonGeneration()` call (soft tier 6).
 */
export function processLongitudinal(input: LongitudinalInput): CurriculumStabilizationSignal[] {
  return runLongitudinalAnalysis(input);
}
