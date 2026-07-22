// Storybook Creator — unified data model.
// Pure TypeScript. Safe to import from edge functions.

import type { Hub, Cefr } from '@/governance/types';

export type StorybookStatus = 'draft' | 'published' | 'archived';

export type StorybookPageType =
  | 'narration'
  | 'dialogue'
  | 'illustration'
  | 'interaction'
  | 'reflection'
  | 'vocab_spotlight'
  | 'speaking_checkpoint'
  | 'comprehension';

export type LibraryStatus = 'locked' | 'unlocked' | 'reading' | 'completed' | 'favorite';
export type ReadingSessionMode = 'solo' | 'classroom';

export interface VisualBlueprint {
  appearance?: string;        // "small fox with sky-blue scarf and amber eyes"
  outfit?: string;
  age_range?: string;
  species?: string;
  signature_pose?: string;
  palette?: string[];         // hex/HSL hints
  style_notes?: string;
}

export interface CastVaultCharacter {
  id: string;
  hub: Hub;
  name: string;
  role: string;
  personality_traits: Record<string, unknown>;
  visual_blueprint: VisualBlueprint;
  voice_id: string | null;
  avatar_url: string | null;
  signature_traits: string[];
  is_shared: boolean;
  created_by: string;
}

export interface StorybookCharacterBinding {
  character_id: string;
  role_in_story: string;
  arc_notes?: string;
}

export interface InlineVocab {
  word: string;
  definition: string;
  pronunciation_ipa?: string;
  audio_url?: string;
}

export interface NarrationContent {
  text: string;              // 1-4 sentences for a real book page
  narrator?: string;         // narrator id or character_id
}

export interface DialogueContent {
  lines: Array<{ character_id: string; text: string; emotion?: string }>;
}

export interface IllustrationContent {
  caption?: string;
  alt: string;
}

export interface ComprehensionContent {
  question: string;
  options: string[];
  correct_index: number;
  kind?: 'literal' | 'inference' | 'vocab_in_context';
}

export interface SpeakingCheckpointContent {
  prompt: string;
  rung: 'repetition' | 'cued' | 'guided' | 'free' | 'spontaneous';
  target_phrase?: string;
}

export interface VocabSpotlightContent {
  word: string;
  definition: string;
  example: string;
  pronunciation_ipa?: string;
}

export interface ReflectionContent {
  prompt: string;
  style: 'emotional' | 'metacognitive';
}

export interface InteractionContent {
  kind: 'tap_to_reveal' | 'sequence' | 'find_word' | 'match';
  payload: Record<string, unknown>;
}

export type StorybookPageContent =
  | { type: 'narration'; data: NarrationContent }
  | { type: 'dialogue'; data: DialogueContent }
  | { type: 'illustration'; data: IllustrationContent }
  | { type: 'comprehension'; data: ComprehensionContent }
  | { type: 'speaking_checkpoint'; data: SpeakingCheckpointContent }
  | { type: 'vocab_spotlight'; data: VocabSpotlightContent }
  | { type: 'reflection'; data: ReflectionContent }
  | { type: 'interaction'; data: InteractionContent };

export interface StorybookPage {
  id?: string;
  chapter_id?: string;
  order_index: number;
  page_type: StorybookPageType;
  content: StorybookPageContent;
  illustration_url?: string | null;
  audio_url?: string | null;
  interactive_data?: Record<string, unknown> | null;
  vocab_inline: InlineVocab[];
}

export interface StorybookChapter {
  id?: string;
  order_index: number;
  title: string;
  summary?: string;
  learning_objective?: string;
  audio_url?: string | null;
  pages: StorybookPage[];
}

export interface StoryArc {
  title: string;
  hook: string;
  rising_action: string;
  climax: string;
  resolution: string;
  emotional_journey: string;
  themes: string[];
}

export interface AudioLayer {
  narrator_voice_id?: string;
  per_character: Record<string, string>; // character_id -> elevenlabs voice_id
  hub_register: 'expressive_playful' | 'modern_emotional' | 'natural_professional';
}

export interface AdaptiveState {
  reading_density?: 'low' | 'medium' | 'high';
  vocab_density?: number; // 0..1
  scaffolding?: 'high' | 'medium' | 'low';
  sentence_length_target?: number;
}

export interface Storybook {
  id?: string;
  title: string;
  hub: Hub;
  cefr_level: Cefr;
  unit_id?: string | null;
  status: StorybookStatus;
  published: boolean;
  cover_image_url?: string | null;
  story_arc: StoryArc;
  vocabulary_targets: string[];
  grammar_targets: string[];
  communication_goals: string[];
  audio_layer: AudioLayer;
  adaptive_state: AdaptiveState;
  qa_report?: Record<string, unknown> | null;
  created_by?: string;
  characters: StorybookCharacterBinding[];
  chapters: StorybookChapter[];
}

// === Engine I/O ===

export interface StorybookBrief {
  title?: string;
  hub: Hub;
  cefr: Cefr;
  unit_id?: string;
  theme?: string;
  setting?: string;
  vocabulary_targets?: string[];
  grammar_targets?: string[];
  communication_goals?: string[];
  story_type?: string;        // bedtime, mystery, workplace, etc.
  chapter_count?: number;     // default per hub
  pages_per_chapter?: number; // default per hub
}

export interface RunStorybookGenerationInput {
  brief: StorybookBrief;
  cast: CastVaultCharacter[];        // selected characters (must be ≥1)
  studentId?: string;                 // optional — enables continuity
  createdBy: string;
  withIllustrations?: boolean;        // default true
  withAudio?: boolean;                // default false (expensive)
}

export interface RunStorybookGenerationResult {
  book: Storybook;
  bookId: string;
  verdict: 'publish' | 'repair' | 'block' | 'draft';
  warnings: string[];
  durationMs: number;
}

// === Continuity ===

export interface StoryContinuityState {
  student_id: string;
  hub: Hub;
  recurring_characters: Array<{ character_id: string; name: string; last_seen_book_id?: string }>;
  world_state: Record<string, unknown>;
  last_emotional_beat?: { summary: string; emotion: string; at: string };
  story_history: Array<{ book_id: string; title: string; completed_at: string }>;
}

// === Reading sessions ===

export interface ReadingSessionInput {
  bookId: string;
  studentId: string;
  mode: ReadingSessionMode;
}

export interface PageEvent {
  pageId: string;
  type: 'page_view' | 'page_complete' | 'vocab_lookup' | 'speaking_attempt' | 'comprehension_attempt';
  payload?: Record<string, unknown>;
}
