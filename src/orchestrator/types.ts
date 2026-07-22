// Master Curriculum Orchestration Engine — shared types.
// Pure TS. No React, no Supabase. Safe to import from edge functions.

import type { Cefr, Hub, LessonState } from '@/governance/types';
import type { LessonPlan } from '@/planning/types';
import type { AdaptationContext } from '@/adaptive/types';
import type { PronunciationRunResult } from '@/pronunciation/pronunciationRunner';
import type { RunGamificationResult } from '@/gamification/types';
import type { ActivitySpec, ActivityAIClient } from '@/activities/types';

export const ORCHESTRATOR_VERSION = '1.0.0';

export type PipelineStageName =
  | 'curriculum_selection'
  | 'blueprint_creation'
  | 'lesson_state'
  | 'flow_planning'
  | 'activity_generation'
  | 'pronunciation_injection'
  | 'adaptive_personalization'
  | 'gamification_layering'
  | 'quality_validation'
  | 'publish_gate';

export type StageStatus = 'ok' | 'warning' | 'error' | 'skipped';

export interface StageReport {
  stage: PipelineStageName;
  status: StageStatus;
  durationMs: number;
  notes?: string[];
  error?: string;
}

export interface LessonContextMeta {
  stateHash: string;
  generatedAt: string;
  orchestratorVersion: string;
  promptChainHash: string;
}

export interface LessonContext {
  hub: Hub;
  cefr: Cefr;
  lessonState: LessonState;
  plan: LessonPlan;
  /** Explicit upstream grammar decision (1–2 targets). Generator must obey. */
  grammarPlan?: import('@/planning/grammarPlanner').GrammarPlan;
  adaptive: AdaptationContext;
  pronunciation: PronunciationRunResult;
  gamification: RunGamificationResult;
  activities: ActivitySpec[];
  qa?: any; // QAReport from src/qa
  meta: LessonContextMeta;
}

export type QAVerdict = 'publish' | 'repair' | 'block';

export interface OrchestrationResult {
  context: LessonContext;
  stageReports: StageReport[];
  verdict: QAVerdict;
  passed: boolean;
  conflicts: ConflictResolutionLog[];
  grammarPackage?: import('@/grammar').GrammarPackage | null;
  memoryDecision?: import('@/memory').MemoryDecision | null;
  speakingDecision?: import('@/speaking').SpeakingDecision | null;
  coherenceDecision?: import('@/coherence').CoherenceDecision | null;
  arcadeDecision?: import('@/arcade').ArcadeDecision | null;
  videoLessonSpec?: import('@/video').VideoLessonSpec | null;
}


// === Conflict / priority types ===

export type PriorityTier =
  | 'cefr'
  | 'curriculum'
  | 'educational'
  | 'age'
  | 'communication'
  | 'adaptive'
  | 'gamification'
  | 'ui';

export interface EngineProposal<T = unknown> {
  source:
    | 'planner'
    | 'governance'
    | 'adaptive'
    | 'pronunciation'
    | 'activities'
    | 'gamification'
    | 'qa'
    | 'ui';
  tier: PriorityTier;
  field: string;
  proposedValue: T;
  rationale: string;
  hard?: boolean; // hard = non-overridable for that tier
}

export interface ConflictResolutionLog {
  field: string;
  winningSource: EngineProposal['source'];
  winningTier: PriorityTier;
  losers: Array<{ source: EngineProposal['source']; tier: PriorityTier; rationale: string }>;
  resolvedAt: string;
}

// === Orchestrator input ===

export interface OrchestrationInput {
  hub: Hub;
  cefr: Cefr;
  unitId: string;
  lessonId: string;
  studentId?: string;
  blueprintOverrides?: Partial<{
    lesson_title: string;
    theme: string;
    grammar_focus: string[];
    target_vocab: string[];
    communication_goal: string;
    review_targets: string[];
  }>;
  ai: ActivityAIClient;
  // Optional: pre-fetched personalization payloads (else defaults used)
  learnerProfile?: any;
  mastery?: any[];
  errors?: any[];
  engagement?: any;
  motivationProfile?: any;
  // NEW: Educational Intelligence Layer. When supplied, the pipeline uses
  // this unified brain to feed adaptive/planner/grammar with real data and
  // to drive narrative continuity + micro-remediation.
  intelligence?: import('@/intelligence/types').LearnerIntelligence;
  // Review & Memory Optimization System — pre-fetched memory_items rows.
  // When supplied (with `intelligence`), the pipeline runs the memory engine
  // and injects review directives into the prompt chain.
  memoryItems?: import('@/memory/types').MemoryItem[];
  // Beta Testing & Analytics — active learner signals (tier 6, soft).
  // When supplied, prepend buildAnalyticsHintPrompt(signals) at tier 6.
  analyticsSignals?: import('@/analytics/types').LearnerSignal[];
  // Cycle 5 — 3-Brain Architecture. When set, hard-overrides `hub` and
  // signals downstream engines that the lesson is locked to this hub.
  // The brain edge functions (generate-{playground,academy,success}) set
  // this so context cannot leak between hubs.
  hubLock?: Hub;
  // Cycle 5 — Brain persona prompts. Strings prepended to the prompt chain
  // BEFORE planner/governance. Used by the brain edge functions to inject
  // their hardcoded hub-specific rulebook at the top of the chain.
  prependPrompts?: string[];
  /** Playground only — the L1–L7 lesson kind in the unit's 7-lesson arc. */
  lessonKind?: import('@/planning/playgroundUnitTemplates').PlaygroundLessonKind;
  /** Optional unit theme for media prompts. */
  unitTheme?: string;
  /** Optional per-learner storybook art-style preference. */
  storybookStylePref?: import('@/storybook/artStyle').StorybookArtStyle | null;
  /**
   * Optional Lesson Critic runner. When supplied, the orchestrator calls it
   * AFTER stabilization and folds its verdict into the publish gate.
   * Caller owns the Gemini call (aiFetch direct, never Lovable Gateway).
   */
  criticRunner?: (
    lesson: import('@/qa/types').QALesson,
  ) => Promise<import('@/qa/judges/lessonCritic').LessonCriticResult | undefined>;
  /**
   * Stabilization → Coherence handshake (tier 6 soft). When the previous
   * lesson logged a `hub_drift` signal in `curriculum_stabilization_signals`,
   * the caller passes `priorHubDrift: true` so coherence demotes off-hub
   * mastery_gap / memory_due reinforcement targets by 0.2. Never overrides
   * CEFR / curriculum / age / safety.
   */
  priorHubDrift?: boolean;
  /**
   * Teacher-authored homework (Playground Creator). When supplied, the
   * coherence engine pins these tasks into the HomeworkPack instead of
   * generating one. Validated against lesson vocab/grammar + hub caps.
   */
  authoredHomework?: import('@/coherence').AuthoredHomeworkInput;
  /**
   * Teacher-authored game rounds (Playground Creator). When supplied, the
   * coherence engine pins these into the GamePack instead of generating one.
   */
  authoredGames?: import('@/coherence').AuthoredGamePackInput;
  /**
   * Video Lesson track (Phase 3 wiring). When true AND `videoLessonInput` is
   * supplied, the pipeline runs `runVideoLesson()` at stage 8.5 and attaches
   * the returned spec to `OrchestrationResult.videoLessonSpec`. Feature-flag
   * off by default — set true from the creator toggle.
   */
  videoLessonEnabled?: boolean;
  videoLessonInput?: Omit<
    import('@/video').VideoLessonInput,
    'targets'
  > & {
    /** Optional override; else pulled from coherence targets. */
    targets?: import('@/coherence/types').ReinforcementTarget[];
  };
  /**
   * 8-Brain Expert Architect result. When supplied, the orchestrator
   * threads it onto `qaLesson.meta.architect` so the Architect Pipeline
   * validator can hard-gate publish on hall-of-fame / emotional beats /
   * signed stages / Never-rules.
   */
  architect?: import('@/architect/types').ArchitectResult;
}


export interface OrchestrationMediaPlan {
  hub: 'playground' | 'academy' | 'success';
  storybook_style: string | null;
  totals: Record<string, number>;
  assets: Array<{ id: string; kind: string; prompt: string }>;
}

// === Real-time adaptation signals ===

export type AdaptationSignalType =
  | 'activity_complete'
  | 'speaking_attempt'
  | 'mistake'
  | 'idle'
  | 'request_help';

export interface AdaptationSignal {
  type: AdaptationSignalType;
  studentId: string;
  lessonId: string;
  activityId?: string;
  payload: Record<string, unknown>;
  at: string;
}

export interface LessonContextPatch {
  difficultyDelta?: number;          // bounded by CEFR cap
  scaffoldingBoost?: number;         // 0..2
  vocabRepeatBoost?: number;         // extra appearances for target word(s)
  pacingHint?: 'slow_down' | 'maintain' | 'accelerate';
  notes?: string[];
}

// === Feedback-to-curriculum ===

export type FeedbackSignalType =
  | 'lesson_completed'
  | 'milestone_quiz_score'
  | 'mistake_pattern'
  | 'vocab_struggle'
  | 'speaking_breakthrough';

export interface FeedbackSignal {
  studentId: string;
  lessonId: string;
  type: FeedbackSignalType;
  payload: Record<string, unknown>;
  at: string;
}
