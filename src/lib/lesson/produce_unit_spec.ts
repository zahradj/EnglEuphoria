// src/lib/lesson/produce_unit_spec.ts
// Master orchestration card mapping Storybook Tiers, Quiz Distractors,
// and Brain-Break topic locks. Runs validators at module-load so any drift
// throws before lesson route files are emitted.

import {
  PlaygroundSecurityOfficer,
  type StorybookOrchestration,
  type QuizQuestionValidation,
  type BrainBreakTopicLock,
} from "./orchestrator_extensions";

export const PRODUCE_STORYBOOK_SPEC: StorybookOrchestration = {
  hasSignedStoryOpener: true,
  slots: ["WHO", "WHERE", "WHAT"],
  tiers: {
    A2: {
      whoFrame: "It is a [animal].",
      whereFrame: "They go to the [habitat].",
      whatFrame: "The animal is [feeling].",
      modelAnswer: "It is a cat and a dog. They go to the garden.",
    },
    B1: {
      whoFrame: "This is my friend [name] and...",
      whereFrame: "They go to the [habitat] because...",
      whatFrame: "They see a [size] [color] [noun] and...",
      modelAnswer:
        "They go to the jungle and they feel excited because everything is new.",
    },
    B2: {
      whoFrame: "First, introduce the characters...",
      whereFrame: "Then, describe the setting using sensory details...",
      whatFrame: "Finally, explain the cause-and-effect resolution...",
      modelAnswer:
        "First, Cat and Dog enter the grand jungle. Then, they spot a small green frog hopping past. Finally, they feel happy because they solved the map puzzle together.",
    },
  },
};

export const PRODUCE_QUIZ_SPEC: QuizQuestionValidation[] = [
  {
    id: "q_adjective_order",
    type: "text",
    correctAnswer: "It is a small orange fish.",
    distractors: [
      "It is an orange small fish.", // ❌ catches OSASCOMP violations
      "It is small orange fish.",
      "It is an small orange fish.",
    ],
  },
];

export const PRODUCE_BRAIN_BREAK_LOCKS: Record<string, BrainBreakTopicLock> = {
  pets: {
    unitId: "pets",
    theme: "Pets",
    allowedEmoji: ["🐶", "🐱", "🐰", "🐹", "🐦", "🐠"],
    bannedEmoji: ["🦈", "🐙", "🦒", "🦁", "🐊"],
  },
  ocean: {
    unitId: "ocean",
    theme: "Ocean",
    allowedEmoji: ["🐠", "🐟", "🐙", "🦀", "🦈", "🐳", "🐬"],
    bannedEmoji: ["🐶", "🐱", "🦒", "🦁"],
  },
  jungle: {
    unitId: "jungle",
    theme: "Jungle",
    allowedEmoji: ["🦁", "🐯", "🐵", "🦒", "🐍", "🦜"],
    bannedEmoji: ["🐠", "🐙", "🦈", "🐶", "🐱"],
  },
};

// ─── Programmatic audit (runs at import time) ────────────────────────────────
PlaygroundSecurityOfficer.validateStorybookTiers(PRODUCE_STORYBOOK_SPEC);
PlaygroundSecurityOfficer.validateQuizGrammarDistractors(PRODUCE_QUIZ_SPEC[0]);
PlaygroundSecurityOfficer.validateSpellingScramble("apple", ["p", "l", "p", "a", "e"]);
