export type Difficulty = "pre-a1" | "standard" | "challenge";

export const LEVEL_META: Record<Difficulty, { label: string; emoji: string; tagline: string; short: string }> = {
  "pre-a1": {
    label: "Pre-A1 — Easy Mode",
    emoji: "🌱",
    tagline: "Tiny steps. Lots of pictures. Super friendly questions.",
    short: "Easy",
  },
  standard: {
    label: "Standard — A1 to A2",
    emoji: "⭐",
    tagline: "The classic adventure. Balanced and fun.",
    short: "Standard",
  },
  challenge: {
    label: "Challenge — B1 to B2",
    emoji: "🚀",
    tagline: "Trickier vocab, longer reading, harder grammar.",
    short: "Challenge",
  },
};
