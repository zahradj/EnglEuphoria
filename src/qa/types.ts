// Content Quality Control & AI Safety System — shared types

export type QASeverity = 'block' | 'warn' | 'info';

export type QADomain =
  | 'academic'
  | 'cefr'
  | 'age'
  | 'safety'
  | 'language'
  | 'activity'
  | 'narrative'
  | 'structural'
  | 'hallucination'
  | 'duplicate';

export type QAVerdict = 'publish' | 'repair' | 'block';

export interface QALocator {
  slideId?: string;
  activityId?: string;
  path?: string;
}

export interface QAIssue {
  code: string;
  domain: QADomain;
  severity: QASeverity;
  message: string;
  locator?: QALocator;
  suggestion?: string;
  auto_repairable: boolean;
}

export interface QADomainScore {
  score: number;     // 0-100
  passing: boolean;
}

export interface QAReport {
  verdict: QAVerdict;
  issues: QAIssue[];
  scorecard: Record<QADomain, QADomainScore>;
  generated_at: string;
  content_hash: string;
}

// ----------------------------------------------------------------
// Inputs to validators
// ----------------------------------------------------------------

export type Hub = 'Playground' | 'Academy' | 'Success';
export type CEFR = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface QAActivity {
  id: string;
  type: string;
  purpose?: string;
  stage?: string;
  modalities?: string[];
  target_vocab_used?: string[];
  grammar_targets_used?: string[];
  narrative_anchor?: {
    characters?: string[];
    setting?: string;
    scene?: string;
  };
  content?: any;
}

export interface QASlide {
  id: string;
  kind: string;             // warmup | prime | mimic | practice | produce | cool_off | etc
  title?: string;
  body_text?: string;
  activities?: QAActivity[];
  grammar_explanation?: string;
  examples?: string[];
}

export interface QALesson {
  id?: string;
  hub: Hub;
  cefr: CEFR;
  unit_id?: string;
  title?: string;
  communication_objective?: string;
  slides: QASlide[];
  /** Playground only — drives the lesson-kind contract validator. */
  lesson_kind?: 'discovery' | 'expansion' | 'extension' | 'practice' | 'storybook' | 'review' | 'mastery_quiz';
  /** Media planner output, attached pre-publish. */
  media_plan?: { storybook_style?: string | null } & Record<string, unknown>;
  /** Unit backdrop world (e.g. "deep space"). Threaded from the coherence engine. */
  unit_theme?: string;
  /** Scene phrase like "in a deep-space rocket". */
  scene_phrase?: string;
  /**
   * Lesson-level metadata declared by the planner (ESA blueprint, chunk targets).
   * Required for Playground per Wave 2 (see `PG_ESA_SHAPE_UNDECLARED` / `PG_CHUNKS_UNDECLARED`).
   */
  meta?: {
    esa_shape?: 'straight_arrow' | 'boomerang' | 'patchwork';
    chunk_targets?: number;
    [k: string]: unknown;
  };
}

export interface QAContextInput {
  lesson: QALesson;
  plan?: any;       // optional planner output for cross-checks
  state?: any;      // optional governance state for cross-checks
}
