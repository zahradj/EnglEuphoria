// Intelligent Activity Generation — shared types.
// Pure TS. Consumes LessonPlan (planner) + LessonState (governance).

import type { Cefr, Hub, LessonState } from '@/governance/types';
import type {
  LessonPlan,
  Modality,
  PedagogicalStage,
} from '@/planning/types';

export type ActivityPurpose =
  | 'hook'
  | 'input'
  | 'discovery'
  | 'controlled'
  | 'communicative'
  | 'production'
  | 'reflection'
  | 'review';

export type ActivityType =
  | 'warmup'
  | 'poll'
  | 'opinion'
  | 'matching'
  | 'drag_drop'
  | 'fill_blank'
  | 'sentence_builder'
  | 'pronunciation'
  | 'reading'
  | 'listening'
  | 'roleplay'
  | 'debate'
  | 'speaking_mission'
  | 'storytelling'
  | 'collaborative'
  | 'reflection'
  | 'retrieval'
  | 'review_challenge'
  // ── Phonics & Trace (Phase 3, Playground-first) ──
  | 'trace_letter'
  | 'trace_word'
  | 'phoneme_tap'
  | 'blend_builder'
  | 'rhyme_match'
  | 'cvc_builder'
  | 'sound_hunt'
  | 'decode_the_word'
  // ── Listening-first additions (Phase 3 prep for Phase 4) ──
  | 'listen_and_match'
  | 'audio_to_image_match'
  | 'sound_discrimination'
  | 'echo_repetition'
  // ── Phase 4 listening-first additions ──
  | 'listening_hunt'
  | 'audio_sequence'
  | 'dictation_builder'
  | 'pronunciation_tap'
  | 'minimal_pairs'
  // ── Phase 5 visual grammar + drill additions ──
  | 'grammar_color_builder'
  | 'timeline_drag'
  | 'tense_transform'
  | 'substitution_drill'
  | 'rapid_fire_drill'
  | 'grammar_sort'
  | 'sentence_expansion'
  | 'chunk_builder'
  // ── Phase 7 premium expansion (phonics, interaction, story) ──
  | 'syllable_clap'
  | 'onset_rime_builder'
  | 'drag_the_letters'
  | 'missing_sound'
  | 'phonics_bingo'
  | 'tap_the_grapheme'
  | 'sound_sorting'
  | 'beginning_sound'
  | 'ending_sound'
  | 'sequencing'
  | 'evidence_hunt'
  | 'dialogue_completion'
  | 'story_reconstruction'
  | 'hotspot'
  | 'branching_choice'
  | 'interactive_story'
  // ── Multi-item vocabulary matching board (whole vocab set on one page) ──
  | 'vocab_match_board'
  // ── Unified Phonics System (Hear → See → Say → Do, hub-skinned) ──
  | 'phonics_card'
  | 'phoneme_isolation'
  | 'blending_animation'
  | 'minimal_pair_tap'
  | 'grapheme_hunt'
  | 'decoding_probe';

export type CognitiveLoad = 'low' | 'medium' | 'high';

export interface NarrativeAnchor {
  characters: string[];
  setting: string;
  scene: string;
}

export interface ActivitySpec {
  id: string;
  type: ActivityType;
  purpose: ActivityPurpose;
  stage: PedagogicalStage;
  modalities: Modality[];
  target_vocab_used: string[];
  grammar_targets_used: string[];
  narrative_anchor: NarrativeAnchor;
  content: any; // type-specific payload (matches existing renderers)
  estimated_load: CognitiveLoad;
}

export interface ActivityCatalogEntry {
  type: ActivityType;
  modalities: Modality[];
  fits_stages: PedagogicalStage[];
  fits_purposes: ActivityPurpose[];
  min_cefr: Cefr;
  max_cefr: Cefr;
  hub_fit: Record<Hub, number>; // 0..1
  load: CognitiveLoad;
  productive: boolean; // produces language (vs receptive)
  description: string;
}

export interface IntelligenceHint {
  /** Mastery vector: 0..1 per skill tag (vocab, grammar, listening, speaking, reading, writing, pronunciation). */
  mastery?: Partial<Record<'vocab' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing' | 'pronunciation', number>>;
  /** Memory: number of vocab items due for review now. */
  memory_due_count?: number;
  /** Speaking confidence 0..1. <0.5 → boost low-rung speaking types. */
  speaking_confidence?: number;
  /** Last few error pattern tags surfaced by intelligence layer. */
  recent_error_tags?: string[];
  /** Engagement 0..1. <0.5 → boost playful/visual types. */
  engagement?: number;
}

export interface GenerationContext {
  plan: LessonPlan;
  state: LessonState;
  previous: ActivitySpec[];
  vocabAppearances: Record<string, number>;
  /** Optional learner intelligence — when present, selector scores types toward learner needs. */
  intelligence?: IntelligenceHint;
}

export type ActivityIssueSeverity = 'error' | 'warning';

export interface ActivityIssue {
  code: string;
  severity: ActivityIssueSeverity;
  message: string;
  activityId?: string;
  field?: string;
}

export interface ActivityValidationReport {
  passed: boolean;
  errors: ActivityIssue[];
  warnings: ActivityIssue[];
}

export interface ActivityGenerationResult {
  activities: ActivitySpec[];
  perActivity: ActivityValidationReport[];
  coherence: ActivityValidationReport;
  passed: boolean;
}

/** Callback for delegating Gemini calls to the host runtime (edge fn / browser). */
export type ActivityAIClient = (args: {
  systemPrompt: string;
  userPrompt: string;
}) => Promise<string>;
