/**
 * EnglEuphoria Playground Game Runtime — engine types.
 * Pure data contracts. ZERO Phaser imports allowed in this file.
 *
 * Hierarchy (mandated): Lesson → Moments → Scenes → Blocks.
 * Flat "slide" / "page" concepts MUST NOT leak into runtime APIs.
 */

export type BlockType =
  | 'intro'
  | 'phonics_focus'
  | 'vocab_solo'
  | 'multiple_choice'
  | 'drag_and_drop'
  | 'match'
  | 'fill_in_blank'
  | 'storybook'
  | 'lesson_summary';

export type SceneKind =
  | 'IntroScene'
  | 'PhonicsScene'
  | 'VocabScene'
  | 'QuizScene'
  | 'DragScene'
  | 'MatchScene'
  | 'FillBlankScene'
  | 'StoryScene'
  | 'EndScene';

export type MomentKind =
  | 'intro_moment'
  | 'discovery_moment'
  | 'practice_moment'
  | 'story_moment'
  | 'challenge_moment'
  | 'reward_moment';

export interface IntroBlock {
  type: 'intro';
  title: string;
  subtitle?: string;
  mascot?: string;
  /** Small label shown above the title, e.g. "Unit 1 · Lesson 1". */
  kicker?: string;
  /**
   * Optional full-bleed hero image reflecting the lesson topic (generated
   * via the generate-slide-image edge function into the lesson-assets
   * bucket). Purely additive — the Phaser scene planner (scenePlanner.ts)
   * only reads title/subtitle/mascot from IntroBlock, so this new optional
   * field is invisible to that path and never breaks it.
   */
  heroImageUrl?: string;
}
export interface PhonicsBlock {
  type: 'phonics_focus';
  sound: string;
  examples: string[];
  audio?: string;
  /** Optional anchor picture for the sound (e.g. an apple for "a") — Pre-A1
   * beginners can't decode the sound from letters alone, so a picture
   * anchor matters as much as it does for vocab_solo. */
  image?: string;
  /**
   * Each example word as its own illustrated, individually-tappable card
   * (picture + a "hear this word" audio) surrounding the central sound
   * badge, instead of `examples` rendering as plain text chips. Optional
   * and additive — `examples` stays the source of truth for the word list
   * itself; this only adds pictures. 4-6 entries is the natural range for
   * one phonics focus (enough variety without overwhelming a beginner).
   */
  examplePictures?: { word: string; image?: string }[];
}
export interface VocabBlock {
  type: 'vocab_solo';
  word: string;
  definition: string;
  image?: string;
  audio?: string;
}
export interface MultipleChoiceBlock {
  type: 'multiple_choice';
  question: string;
  options: string[];
  answerIndex: number;
}
export interface DragAndDropBlock {
  type: 'drag_and_drop';
  prompt: string;
  items: { id: string; label: string }[];
  targets: { id: string; label: string; accepts: string }[];
}
export interface MatchBlock {
  type: 'match';
  prompt: string;
  pairs: { left: string; right: string }[];
}
export interface FillInBlankBlock {
  type: 'fill_in_blank';
  sentence: string;
  options: string[];
  answer: string;
}
export interface StorybookBlock {
  type: 'storybook';
  title: string;
  pages: {
    text: string;
    image?: string;
    /**
     * Who says this line. Present -> the page renders as one line of a
     * speech-bubble conversation (Playground's own story-scene pattern:
     * one full-bleed bubble at a time, alternating sides by speaker).
     * Omitted -> legacy narrator-style page (a single centered text card),
     * so existing authored content with no speaker keeps working.
     */
    speaker?: string;
    /**
     * Words inside `text` to highlight in the vocabulary color and make
     * tappable — tapping pops a small card with the definition and a
     * "hear it" replay, for a second listen-and-repeat on just that word.
     */
    vocab?: { word: string; definition: string }[];
  }[];
}
export interface LessonSummaryBlock {
  type: 'lesson_summary';
  title: string;
  bullets: string[];
}

export type LessonBlock =
  | IntroBlock
  | PhonicsBlock
  | VocabBlock
  | MultipleChoiceBlock
  | DragAndDropBlock
  | MatchBlock
  | FillInBlankBlock
  | StorybookBlock
  | LessonSummaryBlock;

export interface LessonMoment {
  id: string;
  kind: MomentKind;
  title?: string;
  blocks: LessonBlock[];
}

export interface LessonJSON {
  id: string;
  title: string;
  cefr: string;
  hub: 'playground' | 'academy' | 'success';
  /** Canonical hierarchy. Always present after validation. */
  moments: LessonMoment[];
  /** @deprecated Legacy flat shape — auto-wrapped into a single moment list by the schema. */
  blocks?: LessonBlock[];
}

/** Block → scene data shapes (what scenes actually receive). */
export type IntroData = Omit<IntroBlock, 'type'>;
export type PhonicsData = Omit<PhonicsBlock, 'type'>;
export type VocabData = Omit<VocabBlock, 'type'>;
export type QuizData = Omit<MultipleChoiceBlock, 'type'>;
export type DragData = Omit<DragAndDropBlock, 'type'>;
export type MatchData = Omit<MatchBlock, 'type'>;
export type FillBlankData = Omit<FillInBlankBlock, 'type'>;
export type StoryData = Omit<StorybookBlock, 'type'>;
export type EndData = Omit<LessonSummaryBlock, 'type'>;

export type SceneData =
  | IntroData
  | PhonicsData
  | VocabData
  | QuizData
  | DragData
  | MatchData
  | FillBlankData
  | StoryData
  | EndData;

export interface SceneConfig<T extends SceneData = SceneData> {
  kind: SceneKind;
  /** 0-based index across the whole lesson (monotonic). */
  index: number;
  /** total scene count across all moments, for HUD progress. */
  total: number;
  /** moment this scene belongs to. */
  momentKind: MomentKind;
  momentId: string;
  data: T;
}

export interface CompiledMoment {
  id: string;
  kind: MomentKind;
  title?: string;
  scenes: SceneConfig[];
}

export interface CompiledLesson {
  lessonId: string;
  title: string;
  cefr: string;
  hub: LessonJSON['hub'];
  moments: CompiledMoment[];
  /** Derived flat view across all moments. Read-only convenience. */
  sequence: SceneConfig[];
}

export interface SceneResult {
  index: number;
  kind: SceneKind;
  momentKind?: MomentKind;
  momentId?: string;
  correct?: boolean;
  score?: number;
  payload?: Record<string, unknown>;
}

/** Block → Scene class name map (1:1, single source of truth). */
export const BLOCK_TO_SCENE: Record<BlockType, SceneKind> = {
  intro: 'IntroScene',
  phonics_focus: 'PhonicsScene',
  vocab_solo: 'VocabScene',
  multiple_choice: 'QuizScene',
  drag_and_drop: 'DragScene',
  match: 'MatchScene',
  fill_in_blank: 'FillBlankScene',
  storybook: 'StoryScene',
  lesson_summary: 'EndScene',
};

/** Display labels (no "slide"/"page" wording — these are emotional beats). */
export const MOMENT_LABELS: Record<MomentKind, string> = {
  intro_moment: 'Welcome',
  discovery_moment: 'Discovery',
  practice_moment: 'Practice',
  story_moment: 'Story',
  challenge_moment: 'Challenge',
  reward_moment: 'Reward',
};

export const MOMENT_ORDER: MomentKind[] = [
  'intro_moment',
  'discovery_moment',
  'practice_moment',
  'challenge_moment',
  'story_moment',
  'reward_moment',
];
