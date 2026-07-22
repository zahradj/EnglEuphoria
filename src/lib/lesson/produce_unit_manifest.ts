// src/lib/lesson/produce_unit_manifest.ts
// Single source-of-truth manifest for the Produce unit.
// Encodes Pre-A1 caps, conversational greeting wrapper, OSASCOMP frame,
// dynamic vocab counts (2–6), and topic-locked brain-break assets.

export interface PhonicsConfig {
  letter: string;
  sound: string;
  words: string[]; // local graphics: src/assets/phonics/<word>.png
}

export interface LessonConfig {
  lesson_number: number;
  title: string;
  hasGreetingWrapper: boolean;
  greet_chunks?: string[];
  vocab: string[];          // 2..6 words
  sentence_frame: string;   // OSASCOMP-safe; no metalanguage
  phonic: PhonicsConfig;
  phases: string[];         // 9–10 phases
}

export interface UnitConfig {
  unit_id: string;
  unit_title: string;
  primary_color: string;
  accent_color: string;
  container_theme: string;       // basket | cage | net | fridge
  brain_break_emojis: string[];  // topic-locked tokens
  lessons: Record<string, LessonConfig>;
}

export const COMPLETE_PRODUCE_UNIT: UnitConfig = {
  unit_id: "produce",
  unit_title: "Fruits & Vegetables",
  primary_color: "#FE6A2F",
  accent_color: "#FEFBDD",
  container_theme: "basket",
  brain_break_emojis: ["🍎", "🥕", "🍓", "🥦"],
  lessons: {
    l1_intro: {
      lesson_number: 1,
      title: "Look at Me! 👋",
      hasGreetingWrapper: true,
      greet_chunks: ["Hello!", "How are you?", "I am fine, thank you!"],
      vocab: ["apple", "banana", "carrot"],
      sentence_frame: "It is a/an [noun].",
      phonic: { letter: "a", sound: "/æ/", words: ["apple", "arrow", "axe"] },
      phases: [
        "GREETING", "VOCABULARY", "QUIET_MATCH", "MODELING", "CONTROLLED_OUT",
        "PHONICS", "FREE_OUT", "SPELLING", "CHANT", "COOL_DOWN",
      ],
    },
    l2_expansion: {
      lesson_number: 2,
      title: "The Big Watermelon 🍉",
      hasGreetingWrapper: false,
      vocab: ["strawberry", "broccoli", "lemon", "watermelon", "pumpkin", "cucumber"],
      sentence_frame: "It is a [size] [color] [noun].",
      phonic: { letter: "w", sound: "/w/", words: ["watermelon", "window", "web"] },
      phases: [
        "VOCABULARY", "QUIET_MATCH", "MODELING", "CONTROLLED_OUT", "PHONICS",
        "FREE_OUT", "SPELLING", "CHANT", "BRAIN_BREAK", "COOL_DOWN",
      ],
    },
  },
};
