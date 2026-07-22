/**
 * Shared shape for the Lesson Blueprint exchanged between
 * `generate-blueprint` (edge) → BlueprintReview (UI) → `generate-ppp-slides` (edge).
 */
export interface BlueprintVocabItem {
  word: string;
  definition: string;
  example: string;
}

/** Three target audiences. Drives prompts, safety bouncer, CEFR floor/ceiling, UI theme. */
export type TargetHub = 'Playground' | 'Academy' | 'Success';

/** Three scientifically-grounded pedagogical frameworks the AI picks between. */
export type PedagogicalFramework = 'Discovery' | 'TaskBased' | 'Immersion';

/** Canonical lesson phases. The blueprint's `phases` array selects an ordered subset of these. */
export type LessonPhase =
  | 'Vocabulary'
  | 'Reading'
  | 'Comprehension'
  | 'Grammar'
  | 'Speaking'
  | 'Writing';

/** Default phase sequence per framework. Used when the user overrides the AI's choice in the UI. */
export const FRAMEWORK_DEFAULTS: Record<PedagogicalFramework, LessonPhase[]> = {
  // Discovery (Inductive): hook → reading → guess the rule → grammar → vocab → production
  Discovery: ['Reading', 'Comprehension', 'Grammar', 'Vocabulary', 'Speaking', 'Writing'],
  // Task-Based: try & fail → vocab toolbox → grammar strategy → succeed
  TaskBased: ['Speaking', 'Vocabulary', 'Grammar', 'Reading', 'Comprehension', 'Writing'],
  // Classic Immersion: visual vocab → story → comprehension → guided speaking
  Immersion: ['Vocabulary', 'Reading', 'Comprehension', 'Speaking', 'Grammar', 'Writing'],
};

export const FRAMEWORK_LABELS: Record<PedagogicalFramework, string> = {
  Discovery: 'The Discovery Model (Inductive)',
  TaskBased: 'The Task-Based Model (TBL)',
  Immersion: 'The Classic Immersion Model',
};

export const FRAMEWORK_BLURBS: Record<PedagogicalFramework, string> = {
  Discovery:
    'Best for tricky grammar. Students meet the structure in context, then puzzle out the rule before formal explanation.',
  TaskBased:
    'Best for adult/professional learners. Students attempt a real-world task, fail productively, then learn the language tools to succeed.',
  Immersion:
    'Best for young learners and beginners. Visual vocabulary first, then story, comprehension and guided production.',
};

export interface BlueprintVideoStrategy {
  /** Highly specific YouTube search query the AI wants to embed. */
  youtube_query: string;
  /** Phase (must be one of `phases[]`) where the video slide must be inserted. */
  target_phase: LessonPhase;
  /** Optional rationale shown in the BlueprintReview UI. */
  rationale?: string;
}

/** Regional spelling/vocab variant. Default: American English. */
export type LanguageVariant = 'American English' | 'British English' | 'Global/Neutral';

/** Aesthetic appended to every image_prompt in the generated deck. */
export type VisualTheme =
  | '3D Animation'
  | 'Anime/Manga'
  | 'Watercolor'
  | 'Professional/Realistic';

export const LANGUAGE_VARIANT_OPTIONS: LanguageVariant[] = [
  'American English',
  'British English',
  'Global/Neutral',
];

export const VISUAL_THEME_OPTIONS: VisualTheme[] = [
  'Professional/Realistic',
  '3D Animation',
  'Anime/Manga',
  'Watercolor',
];

export const DEFAULT_LANGUAGE_VARIANT: LanguageVariant = 'American English';
export const DEFAULT_VISUAL_THEME: VisualTheme = 'Professional/Realistic';

/** Aesthetic phrase appended to every generated image_prompt. */
export const VISUAL_THEME_PROMPT_SUFFIX: Record<VisualTheme, string> = {
  '3D Animation':
    ', rendered in vibrant Pixar-style 3D animation, soft global illumination, cinematic lighting, clean vector edges, family-friendly',
  'Anime/Manga':
    ', rendered in modern Japanese anime / manga style, crisp ink line art, cel-shaded coloring, expressive character design',
  'Watercolor':
    ', painted in soft watercolor illustration style, gentle pastel washes, visible paper texture, hand-painted feel',
  'Professional/Realistic':
    ', professional editorial illustration with realistic proportions, clean modern composition, high-quality stock-photo-grade lighting',
};

export interface LessonBlueprint {
  lesson_title: string;
  target_vocabulary: BlueprintVocabItem[];
  target_grammar_rule: string;
  grammar_explanation: string;
  reading_passage_summary: string;
  final_speaking_mission: string;
  /** Hub the lesson targets — drives every downstream prompt. Optional for backwards compat. */
  target_hub?: TargetHub;
  /** AI-selected pedagogical framework (with teacher override). */
  pedagogical_framework?: PedagogicalFramework;
  /** Short rationale explaining the AI's framework choice. */
  framework_rationale?: string;
  /** Ordered phase sequence the slide generator MUST follow. */
  phases?: LessonPhase[];
  /** AI-curated YouTube clip plan (query + which phase to insert it in). */
  video_strategy?: BlueprintVideoStrategy;
  /** SWBAT — single-sentence functional learning objective. */
  learning_objective?: string;
  /** Production-stage final task that proves mastery (roleplay, debate, free speak…). */
  final_output_task?: string;
  /** Regional spelling/vocab variant. Defaults to American English. */
  language_variant?: LanguageVariant;
  /** Aesthetic appended to every image prompt. */
  visual_theme?: VisualTheme;
}

export const isBlueprintReady = (b: LessonBlueprint | null): b is LessonBlueprint => {
  if (!b) return false;
  return (
    !!b.target_grammar_rule.trim() &&
    !!b.reading_passage_summary.trim() &&
    !!b.final_speaking_mission.trim() &&
    Array.isArray(b.target_vocabulary) &&
    b.target_vocabulary.filter((v) => v.word.trim()).length >= 3
  );
};
