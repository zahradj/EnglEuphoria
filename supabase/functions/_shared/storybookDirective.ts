// Storybook Brain — Narrative-First Directive
// ----------------------------------------------------------------------------
// Forces the AI to write a REAL story (character → goal → problem → attempts →
// resolution) instead of cramming target vocabulary into a flat sentence list.
// Vocabulary appears BECAUSE the story requires it, never the other way around.
//
// Pipeline (must be obeyed):
//   Communication Goal → Story Goal → Vocabulary (in service of the story)
//   → Grammar (CEFR-graded) → Activities
//
// Output: a binding system directive prepended to every brain prompt that
// produces story/reading content (Playground L4 storybook, Academy/Success
// reading passages, etc.).

const CEFR_STORY_REGISTER: Record<string, string> = {
  "Pre-A1":
    'Max-style labels. 3–6 word sentences. Subject + be + noun/adjective. Example: "This is Max. This is a dog. The dog is happy."',
  "A1":
    'Present simple, "have", "there is/are". 5–8 word sentences. Example: "Max has a dog. The dog runs in the park. Max plays with his dog."',
  "A2":
    'Past simple + simple connectors (and, but, then, finally). 8–12 word sentences. Example: "Max lost his dog yesterday. He looked for it in the park. Finally, he found it near a tree."',
  "B1":
    'Past simple + past continuous + because/although/while. 12–18 word sentences with subordination. Example: "Max was worried because his dog had disappeared. He searched the neighborhood and asked several people for help."',
  "B2":
    'Mixed tenses incl. past perfect, passive, modals of deduction, complex subordination. Example: "Although Max initially believed his dog had simply wandered away, he eventually realized that it had become trapped inside an abandoned building."',
  "C1":
    'Sophisticated cohesion, inversion, nuanced lexis, idiom, hypothetical reasoning. Literary register acceptable.',
};

export function buildStorybookDirective(
  topic: string,
  cefr: string,
  communicationGoal: string,
  vocabFocus: ReadonlyArray<string>,
  grammarFocus: ReadonlyArray<string>,
): string {
  const register = CEFR_STORY_REGISTER[cefr] ?? CEFR_STORY_REGISTER["A1"];
  const vocabLine = vocabFocus.length
    ? vocabFocus.join(", ")
    : "(derive naturally from the story goal — do NOT pad)";
  const grammarLine = grammarFocus.length
    ? grammarFocus.join(", ")
    : "(CEFR-appropriate structures required by the story situation)";

  return [
    "STORYBOOK BRAIN — NARRATIVE-FIRST DIRECTIVE (HARD)",
    "==================================================",
    "You are NOT a vocabulary-exercise generator. You are an expert children's",
    "story writer and graded-reader specialist. The story is the HEART of the",
    "lesson — vocabulary appears because the story requires it, never because",
    "the system is trying to stuff target words into the text.",
    "",
    "BINDING PIPELINE (do not invert):",
    "  Communication Goal → Story Goal → Vocabulary → Grammar → Activities",
    "FORBIDDEN inverse pipeline:",
    "  Vocabulary → Grammar → Story-as-afterthought",
    "",
    `Topic: ${topic}`,
    `CEFR: ${cefr}`,
    `Communication goal: ${communicationGoal}`,
    `Target vocabulary: ${vocabLine}`,
    `Target grammar: ${grammarLine}`,
    "",
    "EVERY STORY MUST CONTAIN:",
    "  1. A named main character.",
    "  2. A clear goal OR problem (something the character wants/needs).",
    "  3. A sequence of meaningful events (attempts, obstacles).",
    "  4. A resolution (problem solved, goal reached, lesson learned).",
    "  5. Natural, repeated use of target vocabulary — IN CONTEXT.",
    "  6. Grammar that the situation genuinely requires (no shoehorning).",
    "",
    "BANNED PATTERNS:",
    "  • Flat vocabulary lists disguised as story (\"Max sees a tiger. Max sees",
    "    a fish. Max sees a bird.\") — REJECTED.",
    "  • No conflict / no problem / no resolution — REJECTED.",
    "  • Grammar that does not arise from the story situation — REJECTED.",
    "  • Same difficulty for every CEFR — REJECTED.",
    "",
    `CEFR READING REGISTER (${cefr}):`,
    `  ${register}`,
    "",
    "PRE-PUBLISH STORY QUALITY CHECK (all must be YES; if any NO → regenerate):",
    "  [ ] Beginning establishes character and setting?",
    "  [ ] Clear problem or goal introduced?",
    "  [ ] Middle shows meaningful attempts/events?",
    "  [ ] Satisfying ending / resolution?",
    "  [ ] Vocabulary used naturally (not forced)?",
    "  [ ] Grammar matches CEFR register above?",
    "  [ ] Would a child want to know what happens next?",
    "",
    "If you generate a story that fails any check, you MUST rewrite it before",
    "returning. Vocabulary-list-pretending-to-be-a-story is a hard failure.",
    "",
  ].join("\n");
}
