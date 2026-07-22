/**
 * Cycle 3 Adaptive Routing — shared remediation types.
 */

export type RemedialKind = 'unit' | 'micro';
export type Hub = 'playground' | 'academy' | 'professional';

/**
 * Result payload emitted by the Unit Quiz (Lesson 6 mastery quiz).
 * `passed_tags` / `failed_tags` are skill_tag identifiers (e.g.
 * `grammar_present_simple`, `vocab_food`) aggregated across every quiz item.
 */
export interface QuizResultPayload {
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  passed_tags: string[];
  failed_tags: string[];
}

/** Per-question result fed into the aggregator. */
export interface QuizItemResult {
  skill_tag: string;
  correct: boolean;
}

/** Request body sent to the `generate-lesson-content` edge function in remedial mode. */
export interface RemedialGenerationRequest {
  is_remedial: true;
  kind: RemedialKind;
  failed_tags: string[];
  source_lesson_id?: string;
  hub: Hub;
  cefr_level?: string;
}

/** Row shape for the `remedial_lessons` table (subset). */
export interface RemedialLessonRow {
  id: string;
  student_id: string;
  source_lesson_id: string | null;
  generated_lesson_id: string | null;
  retest_lesson_id: string | null;
  kind: RemedialKind;
  failed_tags: string[];
  attempt_number: number;
  status: 'pending' | 'completed' | 'exhausted';
  hub: string | null;
  created_at: string;
  completed_at: string | null;
}
