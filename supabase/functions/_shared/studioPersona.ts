// Shared "Expert Pedagogue / Game Designer" persona for Creator Studio AI calls.
// Inject into Gemini systemInstruction so every Studio button speaks with one voice.

const CEFR_RULES: Record<string, string> = {
  A1: "Absolute Beginner — present simple only, max 5-word sentences, ultra-concrete vocabulary, lots of repetition.",
  A2: "Elementary — present/past simple, present continuous, 'going to' future, daily-life vocabulary.",
  B1: "Intermediate — all past tenses, present perfect, first conditional, modals (should/must/might), opinions and plans.",
  B2: "Upper-Intermediate — all conditionals, passive, reported speech, abstract topics, collocations and phrasal verbs.",
  C1: "Advanced — inversion, cleft sentences, hedging, idioms, register shifts, academic and professional language.",
  C2: "Mastery — nuanced register, literary devices, sophisticated argumentation.",
};

export type StudioRole = "pedagogue" | "game-designer" | "rewriter";

export interface StudioContext {
  role: StudioRole;
  cefr?: string;
  ageGroup?: string;            // "kids" | "teens" | "adults"
  hub?: string;                 // "playground" | "academy" | "success"
  targetGrammar?: string;       // e.g. "past simple", "second conditional"
  outputContract?: string;      // freeform: "Return JSON: { items: string[] }"
  previousTopics?: string[];    // anti-repetition list
}

const ROLE_HEADER: Record<StudioRole, string> = {
  pedagogue:
    "You are an Expert ESL Pedagogue. Every output is classroom-ready, observably scaffolded, and matches the learner's CEFR level exactly.",
  "game-designer":
    "You are an Expert ESL Game Designer. You craft short, joyful, replayable language games with clear win states and instant feedback.",
  rewriter:
    "You are an Expert ESL Editor. You rewrite text to match a target CEFR level without changing the underlying meaning. Never add new ideas.",
};

export function buildStudioSystemPrompt(ctx: StudioContext): string {
  const cefr = (ctx.cefr || "").toUpperCase();
  const cefrLine = cefr && CEFR_RULES[cefr]
    ? `CEFR LEVEL CONSTRAINT: ${cefr} — ${CEFR_RULES[cefr]}`
    : "";
  const ageLine = ctx.ageGroup ? `AGE GROUP: ${ctx.ageGroup}` : "";
  const hubLine = ctx.hub ? `HUB: ${ctx.hub}` : "";
  const grammarLine = ctx.targetGrammar
    ? `TARGET GRAMMAR / FOCUS: ${ctx.targetGrammar}`
    : "";

  const antiLiteral =
    "CRITICAL — ANTI-LITERAL RULE: Hub names (Playground, Academy, Success) describe age and proficiency only. Never write literal lessons about playgrounds, schools, or workplaces unless the user explicitly asks.";

  const antiRepetition = ctx.previousTopics && ctx.previousTopics.length > 0
    ? `ANTI-REPETITION — ABSOLUTELY FORBIDDEN: Do not reuse any of these recent themes/storylines/vocabulary: ${JSON.stringify(ctx.previousTopics)}. Every output must be 100% original.`
    : "";

  const contract = ctx.outputContract
    ? `OUTPUT CONTRACT: ${ctx.outputContract}`
    : "";

  return [
    ROLE_HEADER[ctx.role],
    cefrLine,
    ageLine,
    hubLine,
    grammarLine,
    antiLiteral,
    antiRepetition,
    contract,
  ].filter(Boolean).join("\n\n");
}
