import type { QAReport } from './types';

export interface ExternalEngineVerdict {
  engine: string; // 'stabilization' | 'grammar' | 'speaking' | 'phonics' | ...
  passed: boolean;
  blockers?: string[]; // issue codes
}

export interface PublishDecision {
  allowed: boolean;
  reason: string;
  next_action: 'publish' | 'repair' | 'block';
  repair_codes: string[];
  blocking_engines: string[];
}

/**
 * HARD validator codes: any one of these forces `block` regardless of
 * auto_repairable flag, judge verdict, or aggregate score. These are the
 * non-negotiable Cambridge/safety/schema gates.
 */
export const HARD_BLOCK_CODES: ReadonlySet<string> = new Set([
  // Safety
  'SAFETY_UNSAFE_PHRASE',
  'SAFETY_SPEAKING_TASK_RED_FLAG',
  // Structural / schema integrity
  'STRUCT_MISSING_REQUIRED_TYPE',
  'JSON_PLACEHOLDER_LEAK',
  'JSON_TRUNCATED_VALUE',
  'JSON_ACTIVITY_EMPTY_CONTENT',
  // Image / multi-answer schema
  'IMAGE_URL_PROMPT_LEAK',
  'MULTI_ANSWER_SCHEMA_INVALID',
  // Vocab pedagogy
  'VOCAB_USED_BEFORE_INTRODUCTION',
  'VOCAB_EXAMPLE_MISSING_HEADWORD',
  // Hallucination
  'HALLUC_FAIL',
  'HALLUC_CLAIM_INACCURATE',
  // V7 visual contract
  'INTRO_IMAGE_OFF_TOPIC',
  // 8-brain Architect pipeline
  'ARCHITECT_HALL_OF_FAME_FAIL',
  'ARCHITECT_HALL_OF_FAME_MISSING',
  'ARCHITECT_EMOTIONAL_BEAT_MISSING',
  'ARCHITECT_PIPELINE_UNSIGNED',
  'ARCHITECT_NEVER_RULE_GRAMMAR',
  'ARCHITECT_NEVER_RULE_PG_VOCAB',
  'ARCHITECT_NEVER_RULE_STORY_PROBLEM',
  'ARCHITECT_NEVER_RULE_MECHANIC_REPEAT',
  'ARCHITECT_REVIEW_FAIL',
]);


export function isHardBlocked(report: QAReport): string[] {
  return report.issues
    .filter((i) => i.severity === 'block' && HARD_BLOCK_CODES.has(i.code))
    .map((i) => i.code);
}

/**
 * Maps a QAReport (+ optional external engine verdicts) to a publish decision.
 * Any HARD blocker from any engine forces publish=false. This is the single
 * gate the orchestrator must call before writing `curriculum_lessons.published = true`.
 */
export function decidePublish(
  report: QAReport,
  externals: ExternalEngineVerdict[] = [],
): PublishDecision {
  const failingExternals = externals.filter((e) => !e.passed);
  const hardCodes = isHardBlocked(report);

  // HARD codes always block, even if marked auto_repairable elsewhere.
  if (hardCodes.length > 0) {
    return {
      allowed: false,
      reason: `Hard publish gate violated: ${hardCodes.join(', ')}.`,
      next_action: 'block',
      repair_codes: hardCodes,
      blocking_engines: failingExternals.map((e) => e.engine),
    };
  }

  if (report.verdict === 'publish' && failingExternals.length === 0) {
    return {
      allowed: true,
      reason: 'All QA validators and downstream engines passed.',
      next_action: 'publish',
      repair_codes: [],
      blocking_engines: [],
    };
  }

  const repair_codes = [
    ...report.issues.filter((i) => i.severity === 'block' && i.auto_repairable).map((i) => i.code),
    ...failingExternals.flatMap((e) => e.blockers ?? []),
  ];
  const blocking_engines = failingExternals.map((e) => e.engine);

  const unrepairable = report.issues.some(
    (i) => i.severity === 'block' && !i.auto_repairable,
  );
  if (report.verdict === 'block' || unrepairable) {
    return {
      allowed: false,
      reason: 'Lesson has non-repairable blocking issues (safety/hallucination/structural or downstream engine).',
      next_action: 'block',
      repair_codes,
      blocking_engines,
    };
  }

  if (report.verdict === 'repair' || failingExternals.length > 0) {
    return {
      allowed: false,
      reason: 'Lesson has repairable blocking issues across QA or downstream engines.',
      next_action: 'repair',
      repair_codes,
      blocking_engines,
    };
  }

  return {
    allowed: true,
    reason: 'All QA validators passed.',
    next_action: 'publish',
    repair_codes: [],
    blocking_engines: [],
  };
}
