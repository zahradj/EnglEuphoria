// Speaking & Fluency Optimization Engine — types.
// Pure TS. Safe to import from edge functions.

import type { Hub, Cefr } from '@/governance/types';

export type SpeakingRung =
  | 'repetition'
  | 'cued'
  | 'guided'
  | 'free'
  | 'spontaneous';

export type SpeakingTaskType =
  | 'chant'
  | 'shadowing'
  | 'repetition_drill'
  | 'sentence_completion'
  | 'picture_talk'
  | 'roleplay'
  | 'opinion_exchange'
  | 'storytelling'
  | 'discussion'
  | 'meeting_sim'
  | 'presentation_chunk'
  | 'professional_smalltalk'
  // ── Phase 4 speaking-first output additions ──
  | 'echo_repetition'
  | 'self_record'
  | 'pronunciation_attempt'
  | 'timed_fluency_round'
  | 'storytelling_chain'
  | 'interview_mode'
  | 'debate_battle';

export type SkillKind = 'grammar' | 'vocab' | 'function' | 'phoneme';

export interface FluencyMetrics {
  fluency_score: number;           // 0..1
  confidence_score: number;        // 0..1
  mean_length_utterance: number;   // words
  hesitation_ratio: number;        // 0..1
  connected_speech_score: number;  // 0..1
  rung: SpeakingRung;
  trend: 'up' | 'flat' | 'down';
}

export interface SpeakingState {
  hub: Hub;
  cefr: Cefr;
  metrics: FluencyMetrics;
  recent_task_types: SpeakingTaskType[];
  recent_scenarios: string[];
  bravery_count_7d: number;
}

export interface SpeakingTaskSpec {
  task_type: SpeakingTaskType;
  rung: SpeakingRung;
  scenario_key: string;
  target_skills: Array<{ kind: SkillKind; key: string }>;
  connected_speech_targets?: string[];   // e.g. ['linking_C+V', 'weak_to']
  pronunciation_focus?: string[];        // phonemes inherited from pron engine
  duration_seconds: number;
  bravery_eligible: boolean;             // higher-rung attempts always bravery-eligible
  prompt: string;                        // student-facing prompt seed
  rubric_hint?: string;                  // hint for grader/AI
}

export interface SpeakingDecision {
  required_tasks: SpeakingTaskSpec[];
  density_floor: number;          // min ratio of speaking activities
  next_rung: SpeakingRung;        // ladder target
  bravery_policy: 'reward_attempt' | 'reward_success' | 'reward_growth';
  notes: string[];
}

export interface SpeakingValidationIssue {
  code: string;
  severity: 'hard' | 'soft';
  message: string;
}

export interface SpeakingValidationReport {
  verdict: 'pass' | 'repair' | 'block';
  issues: SpeakingValidationIssue[];
  speaking_density_observed: number;
  spontaneous_count_observed: number;
}

export const SPEAKING_VERSION = '1.0.0' as const;
