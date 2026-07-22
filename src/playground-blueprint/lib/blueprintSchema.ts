// Tier 2 — rigid, strongly-typed schema for new Playground units.
// Generators MUST emit objects that satisfy `PlaygroundUnitConfig`.

export type PhaseKind =
  | "Vocabulary" | "Modeling" | "QuietGame" | "ControlledOutput"
  | "Phonics" | "FreeOutput" | "Spelling" | "VocalRepetition"
  | "BrainBreak" | "CoolDown" | "SignedStory";

export interface PhaseDef {
  phase_index: number;
  kind: PhaseKind;
  component: string;
  assets_required?: string[];
  letter?: string;
  sound?: string;
  bitmap_illustrations?: string[];
  game_selection?: string[];
  mapped_emojis?: string[];
}

export interface SentenceStructure {
  frame: string;           // e.g. "It is a [size] [color] [fruit]"
  example_correct: string; // e.g. "It is a big red apple"
  invalid_hallucination_check: string; // e.g. "It is a red big apple"
}

export interface PlaygroundUnitConfig {
  unit_topic: string;
  cefr_target: "Pre-A1" | "Pre-A1/A1" | "A1" | "A1/A2" | "A2" | "B1";
  lesson_number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  sentence_structures: SentenceStructure;
  phases: PhaseDef[]; // length 9 or 10
}

export const REQUIRED_PHASE_ORDER: PhaseKind[] = [
  "Vocabulary", "Modeling", "QuietGame", "ControlledOutput", "Phonics",
  "FreeOutput", "Spelling", "VocalRepetition", "BrainBreak", "CoolDown",
];

export const TOPIC_EMOJI_LOCK: Record<string, string[]> = {
  pets:   ["🦴", "🐾", "🥩"],
  jungle: ["🦋", "🐛", "🪲"],
  ocean:  ["🐟", "🐠", "🦐"],
  fruits: ["🍎", "🥕", "🍓", "🥦"],
};
