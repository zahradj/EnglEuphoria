// Lesson Planning Engine — shared types.
// Pure TS. Runs BEFORE activity generation.
// Output feeds governance + Gemini generation prompts.

import type { Cefr, Hub, LessonState } from '@/governance/types';

export type EmotionalTone =
  | 'playful' | 'mysterious' | 'adventurous' | 'cozy'
  | 'energetic' | 'reflective' | 'professional' | 'inspiring';

export type InteractionStyle =
  | 'story-driven' | 'identity-driven' | 'task-based'
  | 'inquiry' | 'roleplay' | 'simulation';

export type PedagogicalStage =
  | 'hook'
  | 'context'
  | 'input'
  | 'discovery'
  | 'controlled'
  | 'communicative'
  | 'production'
  | 'reflection';

export type Modality =
  | 'reading' | 'listening' | 'speaking' | 'writing'
  | 'thinking' | 'collaboration' | 'reflection';

export interface LessonBlueprint {
  hub: Hub;
  cefr_level: Cefr;
  lesson_title: string;
  theme: string;
  grammar_focus: string[];
  target_vocab: string[];
  communication_goal: string;
  speaking_goal: string;
  reading_goal: string;
  lesson_duration: string; // e.g. '30min'
  emotional_tone: EmotionalTone;
  interaction_style: InteractionStyle;
  review_targets: string[];
  /** Backdrop world override (e.g. "Space", "Kitchen"). Threaded into
   * `state.theme.setting` so every governance-anchored prompt (including
   * image_prompt builders + themeEngine) binds visuals to this world. */
  unit_theme?: string;
  /** Human-friendly scene phrase (e.g. "in a deep-space rocket"). */
  scene_phrase?: string;
}

export interface PedagogicalStageSpec {
  stage: PedagogicalStage;
  slide_count: number;
  why: string;             // pedagogical reason — used in prompts
  modalities: Modality[];
  expected_outputs: string[];
}

export type PedagogicalFlowMap = PedagogicalStageSpec[];

export interface CognitiveLoadPlan {
  max_consecutive_receptive: number;
  max_consecutive_same_modality: number;
  speaking_every_n_slides: number;
  grammar_explanation_budget_slides: number; // hard cap
  difficulty_curve: Array<'warmup' | 'rising' | 'peak' | 'cooldown'>;
}

export interface CommunicationObjective {
  goal: string;            // "describe interrupted past actions"
  real_world_use: string;  // "telling a friend what you were doing when something happened"
  success_criteria: string[];
}

export interface VocabRecyclingPlan {
  word: string;
  appearances: PedagogicalStage[]; // each target word must appear in >= 3 stages
}

export interface InteractionDistribution {
  // Sum should ~ slide_count. Engine validates balance.
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
  thinking: number;
  collaboration: number;
  reflection: number;
}

export interface LessonPlan {
  blueprint: LessonBlueprint;
  lesson_state: LessonState;
  flow_map: PedagogicalFlowMap;
  cognitive_load: CognitiveLoadPlan;
  communication: CommunicationObjective;
  vocab_recycling: VocabRecyclingPlan[];
  interaction_distribution: InteractionDistribution;
  generated_at: string;
  planner_version: string;
}

export type PlanIssueSeverity = 'error' | 'warning';
export interface PlanValidationIssue {
  code: string;
  severity: PlanIssueSeverity;
  message: string;
  field?: string;
}

export interface PlanValidationReport {
  passed: boolean;
  errors: PlanValidationIssue[];
  warnings: PlanValidationIssue[];
}
