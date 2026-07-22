// Vocabulary Image Architect — contract.
// One agent per call returns a structured image plan + rendered URL
// for a single vocabulary item, theme-aware and cast-aware.

export type VocabPOS = "noun" | "verb" | "adjective" | "phrase" | "greeting" | "other";

export interface VocabImageInput {
  word: string;
  hub: "playground" | "academy" | "success";
  cefr: string;
  /** Lesson theme, e.g. "farm animals", "vegetables", "family". */
  theme?: string;
  /** Optional locked theme backdrop (forest, farm, kitchen, etc.). */
  backdrop?: string;
  /** POS hint — if absent the agent infers it. */
  pos?: VocabPOS;
  /** Optional cast member to feature (auto-injected for verbs/greetings). */
  castMember?: {
    name: string;
    species?: string;
    look_book?: string;
  };
  /** Optional second cast member for dialogue/greeting scenes. */
  partner?: {
    name: string;
    species?: string;
    look_book?: string;
  };
  /** Visual style key understood by generate-playground-images. */
  style?: string;
}

export interface VocabImagePlan {
  word: string;
  pos: VocabPOS;
  theme_backdrop: string;
  composition: string;          // 1-sentence framing
  image_prompt: string;         // full rendered prompt for Nano Banana
  uses_cast: boolean;
  cast_names: string[];
  style: string;
}

export interface VocabImageResult {
  plan: VocabImagePlan;
  url: string | null;
  cached: boolean;
  durationMs: number;
}
