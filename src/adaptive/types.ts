// Adaptive Learning & Mastery System — shared types

export type Hub = 'Playground' | 'Academy' | 'Success';
export type CEFR = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type SkillDomain =
  | 'grammar'
  | 'vocabulary'
  | 'pronunciation'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'fluency'
  | 'communication_goal';

export type Trend = 'rising' | 'stable' | 'declining';
export type ReviewPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SkillMasteryRecord {
  skill_domain: SkillDomain;
  skill_key: string;
  mastery: number;       // 0-100
  confidence: number;    // 0-100
  trend: Trend;
  review_priority: ReviewPriority;
  exposures: number;
  communicative_uses: number;
  last_seen?: string;
}

export interface LearnerProfile {
  student_id: string;
  hub: Hub;
  cefr_level: CEFR;
  strengths: string[];
  weaknesses: string[];
  engagement_style: 'interactive' | 'reflective' | 'kinesthetic' | 'visual' | 'auditory';
  preferred_pacing: 'slow' | 'moderate' | 'fast';
  anxiety_level: 'low' | 'moderate' | 'high';
  pronunciation_challenges: string[];
  notes?: string;
}

export interface DifficultyProfile {
  sentence_length_cap: number;
  scaffolding_level: 'minimal' | 'guided' | 'heavy';
  support_density: number;        // 0-1
  challenge_tier: 1 | 2 | 3 | 4;  // 1=easiest, 4=extension
  reading_complexity: 'simplified' | 'standard' | 'enriched';
}

export interface ReviewQueueItem {
  item_type: 'vocab' | 'grammar' | 'pronunciation';
  item_key: string;
  priority: number;
  due_at: string;
}

export interface EngagementState {
  confidence: number;       // 0-100
  motivation: number;       // 0-100
  frustration_risk: number; // 0-100
  speaking_turn_ratio: number;
  completion_rate: number;
  hesitation_latency_ms: number;
}

export type SpeakingTier =
  | 'sentence_starters'
  | 'guided_frames'
  | 'open_communication'
  | 'debate_improv';

export interface SpeakingSupport {
  tier: SpeakingTier;
  starters: string[];
  frames: string[];
  hype: string[];
}

export interface ErrorPattern {
  pattern_key: string;
  category:
    | 'omission'
    | 'substitution'
    | 'overgeneralization'
    | 'l1_interference'
    | 'pronunciation_substitution'
    | 'word_stress';
  frequency: number;
  recency_days: number;
  severity: 'low' | 'medium' | 'high';
  recommended_support: string[];
}

export interface AdaptationContext {
  profile: LearnerProfile;
  mastery: SkillMasteryRecord[];
  difficulty: DifficultyProfile;
  review_queue: ReviewQueueItem[];
  engagement: EngagementState;
  speaking: SpeakingSupport;
  errors: ErrorPattern[];
  adjustments: string[];          // human-readable rationale lines
  generated_at: string;
}

export interface AdaptationValidationIssue {
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface AdaptationValidationReport {
  ok: boolean;
  issues: AdaptationValidationIssue[];
}
