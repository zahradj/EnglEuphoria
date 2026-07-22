// Educational Intelligence Layer — unified learner brain types.
// Pure TS. Safe to import from edge functions.

import type { Hub, Cefr } from '@/governance/types';

export type SkillKey =
  | 'grammar'
  | 'vocabulary'
  | 'speaking'
  | 'pronunciation'
  | 'listening'
  | 'reading'
  | 'writing'
  | 'communication';

export interface MasteryVector {
  skill: string;                 // e.g. "Past Simple", "family vocab"
  recognition: number;           // 0..100
  recall: number;
  guided_production: number;
  spontaneous_production: number;
  fluency_consistency: number;
  confidence: number;
  exposures: number;
  last_seen?: string;
}

export type ErrorCategory =
  | 'tense'
  | 'article'
  | 'preposition'
  | 'agreement'
  | 'word_order'
  | 'pronunciation'
  | 'vocab_choice'
  | 'spelling'
  | 'other';

export interface ErrorPattern {
  id: string;
  category: ErrorCategory;
  surface: string;              // student's wrong form
  target: string;               // correct form
  frequency: number;
  persistence_days: number;
  classification: 'careless' | 'developmental' | 'mastery_gap';
  last_seen: string;
}

export type SpeakingTier = 'shy' | 'emerging' | 'confident' | 'fluent';

export interface SpeakingConfidence {
  tier: SpeakingTier;
  voluntary_attempts_7d: number;
  retry_rate: number;            // 0..1
  hesitation_avg_ms: number;
  avg_sentence_words: number;
  silence_ratio: number;         // 0..1
  growth_trend: 'up' | 'flat' | 'down';
}

export interface PronunciationState {
  per_phoneme: Record<string, { accuracy: number; trend: 'up' | 'flat' | 'down' }>;
  focus_targets: string[];
  last_score?: number;
}

export interface ReviewItem {
  item_type: string;             // 'grammar' | 'vocab' | 'phoneme' | ...
  item_key: string;
  due_at: string;
  priority: number;
}

export interface EngagementSignals {
  attention_score: number;       // 0..100
  fatigue_score: number;
  momentum: 'high' | 'medium' | 'low';
  recent_idle_count: number;
}

export interface CommunicationProgress {
  current_objective?: string;
  outcomes_met: number;
  outcomes_total: number;
  real_world_tasks_completed: number;
}

export interface AdaptiveSupport {
  current_difficulty_tier: number;     // 1..5
  scaffolding_boost: number;           // 0..2
  pacing_hint: 'slow_down' | 'maintain' | 'accelerate';
  vocab_repeat_boost: number;
}

export interface NarrativeCharacter {
  id: string;
  name: string;
  role: string;                       // friend, mentor, sibling, pet, etc.
  traits: string[];
  hub: Hub;
}

export interface NarrativeState {
  active_characters: NarrativeCharacter[];
  current_arc?: {
    title: string;
    beats_completed: number;
    beats_total: number;
    location?: string;
  };
  last_beat?: {
    summary: string;
    emotion: string;
    at: string;
  };
}

export interface LearnerProfileLite {
  studentId: string;
  hub: Hub;
  cefr: Cefr;
  age_band?: 'kids' | 'teens' | 'adults';
  interests?: string[];
}

export interface ReinforcementState {
  last_homework_completion?: string;
  homework_streak: number;
  game_engagement: number;          // 0..1
  homework_completion_rate: number; // 0..1
  reinforcement_coverage: number;   // 0..1
  weak_target_keys: string[];
}

export interface LearnerIntelligence {
  learner_profile: LearnerProfileLite;
  mastery_map: Record<string, MasteryVector>;       // keyed by mastery_key
  error_patterns: ErrorPattern[];
  speaking_confidence: SpeakingConfidence;
  pronunciation_state: PronunciationState;
  review_priority: ReviewItem[];
  engagement_state: EngagementSignals;
  communication_progress: CommunicationProgress;
  adaptive_support: AdaptiveSupport;
  narrative_state: NarrativeState;
  quality_history: Array<{ lessonId: string; score: number; at: string }>;
  reinforcement_state?: ReinforcementState;
  /** Beta Testing & Analytics — active (non-decayed) learner signals. Tier 6 (soft). */
  learner_signals?: import('@/analytics/types').LearnerSignal[];
  meta: { assembledAt: string; version: '1.0.0'; source: 'live' | 'cache' };
}

export const INTELLIGENCE_VERSION = '1.0.0' as const;

/* ============================================================
 * Micro-remediation contract
 * ============================================================ */

export type MicroRepairKind =
  | 'pronunciation_replay'
  | 'mini_grammar_fix'
  | 'irregular_verb_flash'
  | 'quick_speaking_repair';

export interface MicroRepair {
  kind: MicroRepairKind;
  target: string;             // e.g. "didn't played", "/θ/"
  duration_s: number;         // ≤ 30
  prompt: string;
  reason: string;             // why this repair triggered
}

/* ============================================================
 * Observation events
 * ============================================================ */

export type ObservationEventType =
  | 'activity_complete'
  | 'speaking_attempt'
  | 'mistake'
  | 'idle'
  | 'voluntary_speak'
  | 'lesson_complete';

export interface ObservationEvent<T = Record<string, unknown>> {
  type: ObservationEventType;
  studentId: string;
  hub: Hub;
  lessonId?: string;
  slideId?: string;
  payload: T;
  at: string;
}
