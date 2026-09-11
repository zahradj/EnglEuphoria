/**
 * Cycle 3 Adaptive Routing — shared remediation types.
 */

export type RemedialKind = 'unit' | 'micro' | 'competency';
export type Hub = 'playground' | 'academy' | 'professional';

/**
 * A single quiz answer tagged with a domain-prefixed competency, e.g.
 * `grammar:present_perfect`, `reading:main_idea`, `speaking:fluency` — the
 * same `domain:specific` convention `useLiveClassroom.ts`'s `Struggle.skill_tag`
 * already uses. Untagged answers (`skillTag` null/undefined) are ignored by
 * domain aggregation — old quiz content keeps working, it just doesn't
 * contribute a competency signal until authored with a tag.
 */
export interface TaggedQuizAnswer {
  skillTag: string | null | undefined;
  isCorrect: boolean;
}

/** One competency domain's automatic-remediation verdict for a single lesson. */
export interface DomainCompetencyResult {
  /** The domain prefix, e.g. 'grammar', 'reading', 'speaking'. */
  domain: string;
  /** Distinct competency tags seen in this domain this lesson. */
  totalTags: string[];
  /** Distinct competency tags with at least one wrong answer. */
  failedTags: string[];
  /** Whether this domain's rule was triggered — see evaluateDomainCompetencies.ts for the exact thresholds. */
  shouldAssign: boolean;
}

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
