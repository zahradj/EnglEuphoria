// src/lib/lesson/registry.ts
// Single source-of-truth for all curriculum-specific units.
// Add/change a topic here only — the polymorphic route /playground/:unitId/:lessonId
// renders it automatically without touching any UI files.

import type { UnitConfig } from "./produce_unit_manifest";

export const CURRICULUM_REGISTRY: Record<string, UnitConfig> = {
  // 🍏 Unit Track A: Produce
  produce: {
    unit_id: "produce",
    unit_title: "Fruits & Vegetables",
    primary_color: "#FE6A2F",
    accent_color: "#FEFBDD",
    container_theme: "basket",
    brain_break_emojis: ["🍎", "🥕", "🍓", "🥦"],
    lessons: {
      "1": {
        lesson_number: 1,
        title: "Look at Me! 👋",
        hasGreetingWrapper: true,
        greet_chunks: ["Hello!", "How are you?", "I am fine, thank you!"],
        vocab: ["apple", "banana", "carrot"],
        sentence_frame: "It is a/an [noun].",
        phonic: { letter: "a", sound: "/æ/", words: ["apple", "arrow", "axe"] },
        phases: [
          "GREETING", "VOCABULARY", "QUIET_MATCH", "MODELING",
          "CONTROLLED_OUT", "PHONICS", "CHANT", "COOL_DOWN",
        ],
      },
    },
  },

  // 🎨 Colors Track
  colors: {
    unit_id: "colors",
    unit_title: "Magic Colors",
    primary_color: "#9333EA",
    accent_color: "#FAE8FF",
    container_theme: "palette",
    brain_break_emojis: ["🎨", "🖌️", "🖍️", "🌈"],
    lessons: {
      "1": {
        lesson_number: 1,
        title: "The Red Balloon 🎈",
        hasGreetingWrapper: true,
        greet_chunks: ["Hello!", "Welcome to color world!"],
        vocab: ["red", "blue", "yellow"],
        sentence_frame: "It is [color].",
        phonic: { letter: "r", sound: "/r/", words: ["red", "rainbow", "ring"] },
        phases: [
          "GREETING", "VOCABULARY", "QUIET_MATCH", "MODELING",
          "CONTROLLED_OUT", "PHONICS", "CHANT", "BRAIN_BREAK", "COOL_DOWN",
        ],
      },
    },
  },

  // ☔ Weather Track
  weather: {
    unit_id: "weather",
    unit_title: "Our Weather",
    primary_color: "#0EA5E9",
    accent_color: "#F0F9FF",
    container_theme: "sky",
    brain_break_emojis: ["☀️", "🌧️", "⚡", "🌈"],
    lessons: {
      "1": {
        lesson_number: 1,
        title: "Sunny Day ☀️",
        hasGreetingWrapper: true,
        greet_chunks: ["Good morning!", "Look at the sky!"],
        vocab: ["sunny", "rainy", "cloudy"],
        sentence_frame: "The sky is [noun].",
        phonic: { letter: "s", sound: "/s/", words: ["sun", "snake", "star"] },
        phases: [
          "GREETING", "VOCABULARY", "QUIET_MATCH", "MODELING",
          "CONTROLLED_OUT", "PHONICS", "CHANT", "BRAIN_BREAK", "COOL_DOWN",
        ],
      },
    },
  },
};
