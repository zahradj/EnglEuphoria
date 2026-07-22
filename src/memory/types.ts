// Review & Memory Optimization System — shared types.
// Pure TS. No React, no Supabase. Safe to import from edge functions.

import type { Hub, Cefr } from '@/governance/types';

export type SkillKind =
  | 'vocab'
  | 'grammar'
  | 'phonics'
  | 'pronunciation'
  | 'speaking_pattern'
  | 'communication_function';

export type RecallLevel = 1 | 2 | 3 | 4 | 5;
// 1 Recognition, 2 Recall, 3 Guided production, 4 Semi-controlled, 5 Spontaneous

export type InjectionSlot =
  | 'warmup'
  | 'exit_ticket'
  | 'homework'
  | 'game'
  | 'speaking_task'
  | 'micro_drill'
  | 'story_callback'
  | 'challenge_mission';

export interface MemoryItem {
  id?: string;
  student_id: string;
  hub: Hub;
  cefr?: Cefr;
  skill_kind: SkillKind;
  skill_key: string;
  memory_strength: number;        // 0..1
  active_mastery: number;         // 0..1
  passive_mastery: number;        // 0..1
  speaking_retention: number;     // 0..1
  pronunciation_retention: number;
  // SM-2
  ease_factor: number;            // ~1.3..2.8
  interval_days: number;
  repetitions: number;
  last_seen_at?: string;
  next_due_at?: string;
  predicted_decay_at?: string;
  forgetting_risk: number;        // 0..1
  recall_level: RecallLevel;
  spiral_stage: number;
  last_context?: Record<string, unknown>;
}

export interface ReviewQueueEntry {
  item: MemoryItem;
  priority: number;               // 0..1, higher = more urgent
  rationale: string[];
  must_be_spoken: boolean;
  target_recall_level: RecallLevel;
  spiral_escalation?: { fromStage: number; toStage: number; newContext: string };
}

export interface MemoryMicroRepair {
  kind: 'pronunciation_replay' | 'mini_grammar_fix' | 'quick_speaking_repair' | 'vocab_flash';
  target: string;
  duration_s: number;
  prompt: string;
  reason: string;
}

export interface MemoryInjectionPlan {
  // For each slot, a small list of review entries pre-seeded for the planner.
  slots: Partial<Record<InjectionSlot, ReviewQueueEntry[]>>;
  totalReviewCount: number;
  reviewDensity: number;          // 0..1 portion of lesson devoted to review
  interleavingMix: SkillKind[];
}

export interface MemoryHeatmap {
  strong: string[];
  fragile: string[];
  forgotten: string[];
  speaking_weak: string[];
  pronunciation_unstable: string[];
  inactive_vocab: string[];
  generatedAt: string;
}

export interface MemoryDecision {
  review_queue: ReviewQueueEntry[];
  microRepairs: MemoryMicroRepair[];
  injectionPlan: MemoryInjectionPlan;
  heatmap: MemoryHeatmap;
  systemPromptHint: string;       // short narrative summary used by promptInjector
  meta: { generatedAt: string; version: '1.0.0'; hub: Hub };
}

export const MEMORY_VERSION = '1.0.0' as const;
