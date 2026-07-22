// Expert Lesson Architect — public types.
// Pure TS. Safe to import from both client and edge.

import type { Hub, Cefr } from '@/governance/types';

export interface ArchitectSeed {
  title?: string;
  theme?: string;
  grammarFocus?: string[];
  targetVocab?: string[];
  communicationGoal?: string;
  reviewTargets?: string[];
}

export interface ArchitectContextBundle {
  hubProfile?: unknown;
  priorLessons?: Array<{ title: string; grammar?: string[]; vocab?: string[]; theme?: string }>;
  intelligenceSummary?: string;
  governanceConstraints?: {
    blockedGrammar?: string[];
    forbiddenVocab?: string[];
    cefrCeiling?: string;
  };
  activityCatalog?: string[];
  memoryDue?: string[];
  analyticsHints?: string[];
}

export interface ArchitectInput {
  hub: Hub;
  cefr: Cefr;
  lessonRef: string;
  studentId?: string;
  seed: ArchitectSeed;
  context?: ArchitectContextBundle;
  /** Optional pre-composed expert brain prompt. If omitted, the client
   *  auto-composes one from hub × cefr (and optional completedUnits). */
  brainPrompt?: string;
  /** Used by the Playground Novakid map to suggest the next unit. */
  completedUnits?: number;
}

export interface ArchitectCriticFinding {
  lens: 'pedagogy' | 'hub_identity' | 'adaptive';
  severity: 'block' | 'warn';
  code: string;
  message: string;
  suggestion?: string;
}

export interface ArchitectOverrides {
  lesson_title: string;
  theme: string;
  grammar_focus: string[];
  target_vocab: string[];
  communication_goal: string;
  review_targets: string[];
}

export interface ArchitectPipelineStage {
  stage: string;
  decision: string;
  evidence?: string;
  signed_by?: string;
}

export interface ArchitectPersonaTrace {
  persona: string;
  decision: string;
  evidence?: string;
}

export interface ArchitectHallOfFame {
  scores: Array<{ id: string; score_0_to_5: number; evidence: string }>;
  total: number;
  verdict: 'hall_of_fame' | 'improve';
  improve_target?: string;
}

export interface ArchitectReview {
  pass: boolean;
  checks: Array<{ id: string; pass: boolean; evidence: string }>;
  blocker?: string;
}

export interface ArchitectResult {
  status: 'ok' | 'repaired' | 'fallback';
  passes: number;
  overrides: ArchitectOverrides;
  rationale: string;
  hub_identity_signature: string;
  critic_findings: ArchitectCriticFinding[];
  model_calls: Array<{ phase: string; model: string; ms: number; ok: boolean }>;
  duration_ms: number;
  // ── 8-brain pipeline outputs (may be absent on fallback) ──
  pipeline_trace?: ArchitectPipelineStage[];
  personas_trace?: ArchitectPersonaTrace[];
  design_workflow?: Record<string, unknown> | null;
  learning_journey_map?: Record<string, string[]> | null;
  emotional_beats?: Record<string, { slide_index: number; description: string }> | null;
  hall_of_fame?: ArchitectHallOfFame | null;
  review?: ArchitectReview | null;
}
