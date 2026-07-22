// StoryPlan contract — the binding output every Hub Story Architect must return.
// Consumed by storybook generator, L4 lesson derivePages, and ACE orchestrator.

export type Hub = "playground" | "academy" | "success";
export type Cefr = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1";

export interface StoryCharacter {
  name: string;
  role: "lead" | "co-lead" | "support" | "narrator";
  species?: string;
  voice_id: string;          // ElevenLabs voice key
  bubble: { outline: string; fill: string };
  look_book: string;         // locked physical descriptor
}

export interface StoryBackdrop {
  world: string;             // overarching world, e.g. "Pip & Bella's village"
  setting: string;           // default setting, e.g. "sunny school playground"
  time_of_day: string;       // "morning"
  mood: string;              // "bright, friendly"
  /** Backdrops may evolve per beat (indoor/outdoor, new location in same world). */
  locked?: boolean;
}

export interface StoryCharacterBlocking {
  character: string;         // character name
  position: string;          // "front-left", "center", "back-right"
  pose: string;              // "waving", "kneeling to pick up apple"
  movement?: string;         // "walking toward Bella", "jumping"
  emotion?: string;          // "excited", "shy"
}

export interface StoryDialogueLine {
  speaker: string;           // character name
  line: string;              // graded sentence
  emotion?: string;          // "happy", "curious"
}

export interface StoryBeat {
  id: string;
  beat_label: string;        // Meet / Try / Twist / Win / Resolution
  /** Per-beat setting override (same world). Falls back to backdrop.setting. */
  setting_variation?: string;
  /** Where each on-stage character stands and how they move this beat. */
  blocking: StoryCharacterBlocking[];
  narration: string;         // CEFR-graded prose
  dialogue: StoryDialogueLine[];
  illustration_prompt: string; // backdrop + look-book + bubbles baked in
  target_vocab_used: string[];
  target_grammar_used: string[];
}

/** Cover / front page for warm-up image and storybook lesson opener. */
export interface StoryCover {
  title: string;              // displayable title, e.g. "Hello, Friend!"
  subtitle?: string;
  tagline?: string;           // 1-line hook
  illustration_prompt: string; // full hero illustration prompt (title baked in)
  show_title_on_image: boolean;
}

export interface StoryAudioLine {
  beat_id: string;
  line_idx: number;
  voice: string;
  text: string;
  cache_key: string;         // stable hash for tts-cache
}

export interface StoryPlan {
  hub: Hub;
  cefr: Cefr;
  title: string;
  logline: string;           // 1-sentence pitch
  moral: string;             // what the learner walks away with
  backdrop: StoryBackdrop;
  cover: StoryCover;
  characters: StoryCharacter[];
  beats: StoryBeat[];
  audio_plan: StoryAudioLine[];
  comprehension_qs: { q: string; options: string[]; answer: string }[];
  retell_prompts: string[];
  generated_at: string;      // ISO timestamp
  agent_version: string;     // "story-architect@1"
}

export interface StoryArchitectInput {
  hub: Hub;
  cefr: Cefr;
  lesson: {
    id?: string;
    lesson_number?: number;
    title?: string;
    focus_label?: string;
    communication_goal?: string;
    grammar_target?: string;
    vocab: string[];
    review_targets?: string[];
    unit_theme?: string;
    scene_phrase?: string;
  };
  cast: Array<{
    name: string;
    species?: string;
    voice_id: string;
    look_book?: string;
    bubble?: { outline: string; fill: string };
  }>;
  knobs?: {
    beat_count?: number;     // PG=3, AC=5, SU=5-7
    include_audio?: boolean; // default true
  };
}
