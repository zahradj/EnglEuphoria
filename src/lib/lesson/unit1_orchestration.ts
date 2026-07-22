import { type UnitManifest, validateUnitOrchestrator } from "./orchestrator";

export const MY_FRIENDS_UNIT: UnitManifest = {
  unit_id: "people",
  unit_title: "My Family & Friends",
  cefrTarget: "Pre-A1",
  primaryColor: "#FE6A2F",
  accentColor: "#FEFBDD",
  containerTheme: "house",
  brainBreakEmojis: ["👋", "🏡", "🍼", "🧸"],
  lessons: {
    l1_intro: {
      lesson_number: 1,
      title: "Look at Me! 👋",
      hasGreetingWrapper: true,
      vocab: ["Hello!", "boy", "girl"],
      sentenceFrame: "This is a [noun].",
      phonic: { letter: "b", sound: "/b/", words: ["boy", "ball", "book"] },
      phases: [
        "GREETING",
        "VOCABULARY",
        "QUIET_GAME",
        "MODELING",
        "CONTROLLED_OUTPUT",
        "PHONICS",
        "FREE_OUTPUT",
        "SPELLING",
        "CHANT",
        "COOL_DOWN",
      ],
    },
    l2_expansion: {
      lesson_number: 2,
      title: "He and She 🏡",
      hasGreetingWrapper: false,
      vocab: ["man", "woman"],
      sentenceFrame: "This is a [noun]. He/She is [size] and [color].",
      phonic: { letter: "m", sound: "/m/", words: ["man", "moon", "mouse"] },
      phases: [
        "VOCABULARY",
        "QUIET_GAME",
        "MODELING",
        "CONTROLLED_OUTPUT",
        "PHONICS",
        "FREE_OUTPUT",
        "SPELLING",
        "CHANT",
        "BRAIN_BREAK",
        "COOL_DOWN",
      ],
    },
  },
};

// Compile-time gate — throws on any violation before code-gen runs.
validateUnitOrchestrator(MY_FRIENDS_UNIT);
