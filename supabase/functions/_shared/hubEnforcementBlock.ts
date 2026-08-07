// Hub + CEFR + Blueprint enforcement directives appended to every
// lesson-generation system prompt. Keeps each generated lesson consistent
// with its hub register, CEFR ceiling/floor and the approved blueprint.
//
// Deno-safe — no imports outside the standard runtime.

export type EnforcementHub = "playground" | "academy" | "success";

export interface EnforcementBlueprintInput {
  target_vocabulary?: string[] | unknown;
  vocabulary?: string[] | unknown;
  grammar_focus?: string | unknown;
  grammar?: string | unknown;
  target_phonics?: unknown;
  learning_objective?: string | unknown;
  final_output_task?: string | unknown;
  reading_passage_summary?: string | unknown;
  final_speaking_mission?: string | unknown;
}

/** Per-hub CEFR window the generator is allowed to operate within. */
const HUB_CEFR_WINDOW: Record<EnforcementHub, { floor: string; ceiling: string; register: string; ageBand: string; lessonMinutes: number; slideTarget: string }> = {
  playground: {
    floor: "Pre-A1",
    ceiling: "B1",
    register: "warm, mascot-led, exclamatory, concrete nouns + simple action verbs only",
    ageBand: "ages 4–11",
    lessonMinutes: 30,
    slideTarget: "≈17 slides (Pre-A1: 9–11 slides)",
  },
  academy: {
    floor: "Pre-A1",
    ceiling: "C1",
    register: "teen-modern, culturally inclusive, energetic but not childish — skews toward tweens (mostly 10-13), so avoid dating/romance or mature themes",
    ageBand: "ages 10–17 (mostly 10–13)",
    lessonMinutes: 60,
    slideTarget: "35–45 slides — vocab and grammar each need presentation PLUS their own repeated retrieval AND production practice (≥4 vocab rounds including 1 usage/production round, ≥6 grammar drills escalating in difficulty) before the shared integration/free-practice blocks",
  },
  success: {
    floor: "Pre-A1",
    ceiling: "C1",
    register: "adult-professional, business-appropriate, NEVER childish or teen-slang",
    ageBand: "ages 18+",
    lessonMinutes: 60,
    slideTarget: "26–30 slides",
  },
};

/** CEFR sentence-length / lexical-range guidance fed back into the model. */
const CEFR_SENTENCE_RULES: Record<string, string> = {
  "pre-a1": "Single words or 2-3 word chunks. NO grammar rules. NO connectors. Repeat every target word at least 3×.",
  "a1": "4–7 word sentences. Present simple + present continuous only. ~500-word lexis.",
  "a2": "5–10 word sentences. Add past simple + going-to. ~1000-word lexis. Linkers: and / but / because.",
  "b1": "10–15 word sentences. All present + past + future basic. ~2000-word lexis. Linkers: so / however / when.",
  "b2": "15–22 word sentences. Conditionals, passives, modal nuance. ~4000-word lexis. Discourse markers OK.",
  "c1": "Complex multi-clause sentences. Idiom, hedging, register shifts. ~8000-word lexis. Cohesion across paragraphs.",
};

function asArray(x: unknown): string[] {
  return Array.isArray(x) ? x.filter((v) => typeof v === "string" && v.trim().length > 0).map(String) : [];
}

function asString(x: unknown): string {
  return typeof x === "string" ? x.trim() : "";
}

/**
 * Build the strict enforcement block. Appended verbatim to each hub
 * system prompt so the model sees one final, non-negotiable contract
 * AFTER the persona / schema / pedagogy blocks.
 */
export function buildHubEnforcementBlock(
  hub: EnforcementHub,
  cefr: string,
  blueprint?: EnforcementBlueprintInput | null,
): string {
  const window = HUB_CEFR_WINDOW[hub];
  const cefrKey = String(cefr || "").trim().toLowerCase();
  const sentenceRule = CEFR_SENTENCE_RULES[cefrKey] || CEFR_SENTENCE_RULES["a2"];

  const vocab = asArray(blueprint?.target_vocabulary).length
    ? asArray(blueprint?.target_vocabulary)
    : asArray(blueprint?.vocabulary);
  const grammar = asString(blueprint?.grammar_focus) || asString(blueprint?.grammar);
  const phonicsRaw = blueprint?.target_phonics;
  const phonics =
    typeof phonicsRaw === "string"
      ? phonicsRaw.trim()
      : (phonicsRaw && typeof phonicsRaw === "object" && (phonicsRaw as any).focus)
        ? String((phonicsRaw as any).focus).trim()
        : "";
  const objective = asString(blueprint?.learning_objective);
  const finalTask = asString(blueprint?.final_output_task);
  const readingSummary = asString(blueprint?.reading_passage_summary);
  const speakingMission = asString(blueprint?.final_speaking_mission);

  const blueprintLines: string[] = [];
  if (vocab.length) blueprintLines.push(`• TARGET VOCAB (exact, do NOT substitute): ${JSON.stringify(vocab)}`);
  if (grammar) blueprintLines.push(`• TARGET GRAMMAR (must drive practice + speaking): "${grammar}"`);
  if (phonics) blueprintLines.push(`• TARGET PHONICS: "${phonics}"`);
  if (objective) blueprintLines.push(`• LEARNING OBJECTIVE (must be observable in final slide): "${objective}"`);
  if (finalTask) blueprintLines.push(`• FINAL OUTPUT TASK: "${finalTask}"`);
  if (readingSummary) blueprintLines.push(`• READING PASSAGE SUMMARY (ground truth): "${readingSummary}"`);
  if (speakingMission) blueprintLines.push(`• FINAL SPEAKING MISSION: "${speakingMission}"`);

  const blueprintSection = blueprintLines.length
    ? `\nAPPROVED BLUEPRINT — TREAT AS IMMUTABLE GROUND TRUTH:\n${blueprintLines.join("\n")}`
    : "\nAPPROVED BLUEPRINT — none supplied; infer from topic but stay within CEFR window.";

  return `

╔═══ HUB + CEFR + BLUEPRINT ENFORCEMENT (FINAL CONTRACT — OVERRIDES ANY EARLIER INSTRUCTION) ═══╗

HUB: ${hub.toUpperCase()} (${window.ageBand}) — ${window.lessonMinutes}-minute lesson, ${window.slideTarget}
CEFR WINDOW: floor=${window.floor}, ceiling=${window.ceiling}. Caller requested: ${cefr || "(unset)"}.
REGISTER: ${window.register}
CEFR SENTENCE RULE (${cefr || "?"}): ${sentenceRule}
${blueprintSection}

HARD CONSTRAINTS (violating ANY one of these = invalid output, will be rejected):
 1. Every learner-facing sentence MUST obey the CEFR SENTENCE RULE above.
 2. Do NOT introduce vocabulary outside the TARGET VOCAB list except common function words.
 3. Do NOT teach a grammar pattern other than the TARGET GRAMMAR. You may RECYCLE earlier patterns.
 4. The lesson MUST land the LEARNING OBJECTIVE — the final slide must let a learner demonstrate it.
 5. Register MUST stay on-hub for all 100% of slides — no cross-hub bleed (no baby-talk in Success, no business jargon in Playground, no childish copy in Academy/Success).
 6. Every target vocab word MUST appear in the lesson at least 3 times across different slides.
 7. Reading passages, dialogues, and examples MUST stay topic-bound — no off-theme filler.
 8. Image prompts MUST be ≤25 words, ≤2 style descriptors, and consistent with the hub visual style.

SELF-CHECK BEFORE EMITTING JSON:
 a. Count target vocab usages — every word ≥3.
 b. Confirm slide count is inside the hub target band.
 c. Confirm sentence length p95 ≤ CEFR ceiling.
 d. Confirm final slide demonstrates the objective.
If any check fails, REWRITE before responding. Return RAW JSON ONLY.

╚═══════════════════════════════════════════════════════════════════════════════════════════╝
`;
}
