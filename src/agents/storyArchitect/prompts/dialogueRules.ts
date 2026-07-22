// Dialogue contract — CEFR register + function-word allowlist.

import type { Cefr } from "../contract";

const CEFR_REGISTER: Record<Cefr, string> = {
  "Pre-A1": "3–6 word lines. Subject + be + noun/adjective. No past tense.",
  "A1": "5–8 word lines. Present simple, have, there is/are. No subordination.",
  "A2": "8–12 word lines. Past simple + and/but/then/finally allowed.",
  "B1": "12–18 word lines. Past continuous + because/although/while allowed.",
  "B2": "Mixed tenses incl. past perfect, modals of deduction, idioms.",
  "C1": "Sophisticated cohesion, inversion, nuanced lexis.",
};

export function dialogueRules(cefr: Cefr, vocab: string[]): string {
  const register = CEFR_REGISTER[cefr] ?? CEFR_REGISTER["A1"];
  return [
    "DIALOGUE RULES (every dialogue line MUST satisfy):",
    `  • CEFR register (${cefr}): ${register}`,
    `  • Reuse target vocabulary naturally: ${vocab.join(", ") || "(none specified)"}`,
    "  • Sentences MUST be grammatical — function words (a, an, the, is, are,",
    "    my, your, I, you, to, in, on, for, and, but) are always allowed.",
    "  • Each line maps to ONE character from the cast (speaker = exact name).",
    "  • Add a short emotion tag per line (happy / curious / proud / etc.).",
  ].join("\n");
}
