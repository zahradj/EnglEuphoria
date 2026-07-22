/**
 * Reusable "Greetings & Introductions" pedagogy pattern.
 *
 * Pre-A1 L1 (and any future intro-style lesson) inherits this 9-step
 * teach/learn flow. The orchestrator can call `applyGreetingsPattern()`
 * to enrich a lesson's pages with the correct dialogue, roleplay cast,
 * and TPR cues — without changing the locked phase_ids.
 *
 * Teaching logic (I do → We do → You do → Produce → Phonics → Exit-high):
 *   1. Hook            — Pip waves and greets the child.
 *   2. Model            — Pip + Bella demo the adjacency pair 3×.
 *   3. Guided           — Substitution table on `My name is ___`.
 *   4. Drag-match       — word ↔ gesture image (Hello↔wave, etc.).
 *   5. Roleplay         — child greets 3 cast members in sequence.
 *   6. Phonics micro    — /h/ in hello / hi / hand.
 *   7. Spelling trace   — lowercase 'h'.
 *   8. Exit celebration — Pip waves goodbye + sticker.
 */

export const GREETINGS_PATTERN = {
  id: "greetings_intro_v1",
  applies_to: ["greetings", "introductions", "hello", "my name is"],
  cast: ["Pip the Fox", "Bella the Bunny", "Charlie the Chick"],
  adjacency_pairs: [
    { open: "Hello!", close: "Hi!" },
    { open: "My name is ___.", close: "Nice to meet you!" },
    { open: "Goodbye!", close: "Bye bye!" },
  ],
  tpr_cues: {
    Hello: "wave hand",
    Hi: "wave hand",
    Goodbye: "wave hand away",
    "My name is": "point to own chest",
    "Nice to meet you": "handshake mime",
  } as Record<string, string>,
  phonic: { letter: "h", sound: "/h/", words: ["hello", "hi", "hand"] },
  exit_line: "Goodbye! See you next lesson!",
} as const;

export type GreetingsPattern = typeof GREETINGS_PATTERN;

export function isGreetingsLesson(input: {
  vocab?: string[];
  communication_goal?: string | null;
  topic?: string | null;
}): boolean {
  const hay = [
    ...(input.vocab || []),
    input.communication_goal || "",
    input.topic || "",
  ]
    .join(" ")
    .toLowerCase();
  return GREETINGS_PATTERN.applies_to.some((k) => hay.includes(k));
}
