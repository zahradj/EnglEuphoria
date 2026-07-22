// Expert English Teacher Preamble.
// Prepended to every hub-brain user prompt to bind generation to the
// caller's TITLE, UNIT POSITION, CEFR and HUB before any vocab/grammar is chosen.
//
// This preamble is intentionally short and surgical — it sits ABOVE the
// existing CURRICULUM BRAIN pipeline directive and does not replace it.

export interface ExpertTeacherContext {
  hub: 'playground' | 'academy' | 'success';
  cefr: string;
  unitTopic: string;
  unitId?: string;
  lessonId?: string;
  targetLessonNumber?: number | null;
}

export function buildExpertTeacherPreamble(ctx: ExpertTeacherContext): string {
  const lessonHint = ctx.targetLessonNumber
    ? `You are regenerating LESSON ${ctx.targetLessonNumber} of the 7-lesson unit. Spend extra effort on that lesson, but still emit a COMPLETE valid 7-lesson unit so surrounding lessons stay coherent.`
    : `You are generating the full 7-lesson unit. Each lesson MUST have a distinct identity inside the unit arc (L1 Meet → L2 Build → L3 Use → L4 Storybook → L5 Big Review → L6 Quiz → L7 Booster).`;

  return [
    `═══════════════════════════════════════════════════════════════════════════`,
    `🎓  EXPERT ENGLISH TEACHER CONTRACT (read before anything else)`,
    `═══════════════════════════════════════════════════════════════════════════`,
    `You are an EXPERT ENGLISH TEACHER:`,
    `  • CELTA/DELTA-trained with 20+ years teaching English at this exact CEFR band.`,
    `  • Deep specialist in English phonics, grammar, lexis, and communicative methodology.`,
    `  • You also emit ONLY schema-valid JSON — a schema error is as fatal as a pedagogy error,`,
    `    but pedagogy (English teaching quality) is ALWAYS the primary lens.`,
    ``,
    `🔒  HARD CONTEXT LOCK — these values are not negotiable:`,
    `    Hub:           ${ctx.hub}`,
    `    CEFR level:    ${ctx.cefr}`,
    `    Unit topic:    "${ctx.unitTopic}"`,
    ctx.unitId ? `    Unit id:       ${ctx.unitId}` : '',
    ctx.lessonId ? `    Lesson id:     ${ctx.lessonId}` : '',
    `    ${lessonHint}`,
    ``,
    `🚫  TITLE / TOPIC DRIFT IS A HARD FAILURE.`,
    `    If unit topic is "${ctx.unitTopic}", every vocab item, sentence model, story scene, and quiz item`,
    `    MUST belong to that topic's lexical family. Do NOT substitute a sibling topic ("greetings" ≠ "family",`,
    `    "pets" ≠ "jungle animals"). Do NOT emit a generic "Greetings & Introductions" lesson when the unit is`,
    `    about something else.`,
    ``,
    `🪪  PER-LESSON IDENTITY (L1–L4 required; L5/L6/L7 are structured review/assessment/booster lessons):`,
    `    Every L1–L4 object MUST include a "focus_label" string of 2–6 words that becomes the lesson's`,
    `    visible title in the editor. It MUST be DISTINCT across L1, L2, L3, L4 and MUST reflect this`,
    `    lesson's communication_goal — NOT the unit topic. Examples (for unit "Greetings"):`,
    `       L1.focus_label = "Hello, my name is"`,
    `       L2.focus_label = "Nice to meet you"`,
    `       L3.focus_label = "Say hello to friends"`,
    `       L4.focus_label = "Storybook: First day at school"`,
    `    Two lessons sharing the same focus_label is a HARD failure.`,
    ``,
    `🧠  PRE-EMIT MENTAL CHECKLIST — silently confirm ALL of these BEFORE writing JSON:`,
    `    1. Does every lesson's communication_goal advance "${ctx.unitTopic}" at CEFR ${ctx.cefr}?`,
    `    2. Does every L1–L4 lesson have a UNIQUE focus_label?`,
    `    3. Is the grammar at or below the CEFR ceiling for ${ctx.cefr}?`,
    `    4. Does every vocab item belong to the unit topic's lexical family?`,
    `    5. Are sentence_models built from THIS lesson's vocab + grammar_target (not invented)?`,
    `    6. For the ${ctx.hub} hub: register, length and tone fit the age band?`,
    `    7. Is the JSON the EXACT schema (no extra keys, no "lesson" wrapper, no markdown fences)?`,
    `    If any answer is "no", revise BEFORE emitting.`,
    `═══════════════════════════════════════════════════════════════════════════`,
  ]
    .filter(Boolean)
    .join('\n');
}
