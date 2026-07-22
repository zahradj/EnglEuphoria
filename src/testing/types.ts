// Lesson Testing & Validation — shared types
export type Hub = 'playground' | 'academy' | 'success';
export type CEFR = 'pre-a1' | 'a1' | 'a2' | 'b1' | 'b2' | 'c1';
export type LessonKind =
  | 'true_beginner'
  | 'speaking_heavy'
  | 'phonics'
  | 'grammar'
  | 'review'
  | 'standard';

export type TestVerdictLevel = 'pass' | 'warn' | 'fail';
export type Severity = 'info' | 'warn' | 'error';

export type FailureCategory =
  | 'repetitive_pattern'
  | 'duplicate_vocab'
  | 'disconnected_context'
  | 'grammar_overload'
  | 'weak_speaking'
  | 'poor_scaffolding'
  | 'unrealistic_dialogue'
  | 'robotic_flow'
  | 'cefr_compliance'
  | 'age_appropriateness'
  | 'vocabulary_accuracy'
  | 'grammar_correctness'
  | 'pronunciation_consistency'
  | 'activity_diversity'
  | 'contextual_coherence'
  | 'emotional_safety'
  | 'json_integrity'
  | 'adaptive_stability';

export interface TestCase {
  hub: Hub;
  cefr: CEFR;
  kind: LessonKind;
  unitId?: string;
  lessonId?: string;
  /** Free-form theme override for the synthetic blueprint */
  theme?: string;
}

export interface DetectorFailure {
  detector: string;
  category: FailureCategory;
  severity: Severity;
  slideIndex?: number;
  evidence?: unknown;
  message: string;
}

export interface TestRunResult {
  testCase: TestCase;
  lessonId?: string;
  blueprintHash?: string;
  qaVerdict?: 'publish' | 'repair' | 'block' | null;
  stabVerdict?: 'publish' | 'repair' | 'block' | null;
  detectorFailures: DetectorFailure[];
  overallVerdict: TestVerdictLevel;
  durationMs: number;
  generatedLesson?: unknown;
  error?: string;
}

export interface TestSuiteOptions {
  runLabel?: string;
  cases?: TestCase[];
  /** Persist results to Supabase tables */
  persist?: boolean;
  /** Stop after N failures (debug) */
  failFastAfter?: number;
}

export interface TestSuiteResult {
  runLabel: string;
  totalCases: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  results: TestRunResult[];
  startedAt: string;
  finishedAt: string;
}
