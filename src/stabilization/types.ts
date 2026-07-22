// Educational Stabilization Engine — types.
// Pure TS. No React / Supabase. Safe to import from edge functions.

import type { LessonContext } from '@/orchestrator/types';

export type StabilizationVerdict = 'pass' | 'repair' | 'block';

export type ValidatorName =
  | 'coherence'
  | 'flow'
  | 'cognitiveLoad'
  | 'activityBalance'
  | 'speakingIntegration'
  | 'retention';

export interface StabilizationIssue {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  field?: string;
  repairHint?: RepairOpKind;
}

export interface ValidatorResult {
  validator: ValidatorName;
  verdict: StabilizationVerdict;
  issues: StabilizationIssue[];
  metrics: Record<string, number | string | boolean>;
}

export type RepairOpKind =
  | 'resequence_activities'
  | 'inject_reflection'
  | 'swap_repetitive_activity'
  | 'compress_instructions'
  | 'add_recycling_slot'
  | 'add_speaking_opportunity';

export interface RepairOp {
  kind: RepairOpKind;
  appliedAt: string;
  before: string;
  after: string;
  reason: string;
}

export interface StabilizationReport {
  finalVerdict: StabilizationVerdict;
  validators: ValidatorResult[];
  repairsApplied: RepairOp[];
  passes: number;
  startedAt: string;
  finishedAt: string;
}

export interface StabilizationRunInput {
  ctx: LessonContext;
  maxRepairPasses?: number; // default 2
}

export interface StabilizationRunOutput {
  ctx: LessonContext;
  report: StabilizationReport;
}

// === Longitudinal ===

export type StabilizationSignalType =
  | 'skill_imbalance'
  | 'activity_fatigue'
  | 'learner_fatigue'
  | 'hub_drift';

export interface CurriculumStabilizationSignal {
  studentId: string;
  signalType: StabilizationSignalType;
  payload: Record<string, unknown>;
  createdAt: string;
}
