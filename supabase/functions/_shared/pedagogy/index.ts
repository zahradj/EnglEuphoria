/**
 * Cycle 3 — Global Pedagogy Engine
 * ---------------------------------
 * Single source of truth for Hub × CEFR × Theme rules consumed by the
 * curriculum / unit / lesson generation edge functions. Importing this
 * module guarantees all three stages emit the same hard guardrails so
 * no stage can drift (e.g. A1 Playground accidentally producing C1
 * history themes).
 *
 * Gatekeeper: this file is consumed by AI generators only. It does NOT
 * touch Cycle 1 Onboarding / Placement Test code.
 */

// ───────────────── Types ─────────────────

export type Hub = "playground" | "academy" | "success";
export type Cefr =
  | "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface HubProfile {
  hub: Hub;
  ageBand: string;
  tone: string;
  allowedCharacters: string[];
  bannedRegister: string[];
  sentenceCap: string;
  visualStyle: string;
}

export interface CefrProfile {
  level: Cefr;
  allowedGrammar: string[];   // canonical grammar slugs
  forbiddenGrammar: string[]; // grammar slugs that must NOT appear
  allowAbstractThemes: boolean;
  sentenceComplexity: string;
}

export interface UnitLock {
  theme: string;
  target_grammar: string;
  target_vocabulary_pool: string[];
}

// ───────────────── Hub profiles ─────────────────

export const HUB_PROFILES: Record<Hub, HubProfile> = {
  playground: {
    hub: "playground",
    ageBand: "Ages 4–8",
    tone: "warm, playful, gamified, song-friendly, big celebrations",
    allowedCharacters: [
      "anthropomorphic animals (Pip the Fox, Bea the Bear, Lulu the Bunny)",
      "friendly toys, magical objects, simple nature (sun, tree, river)",
    ],
    bannedRegister: [
      "workplace scenarios", "dating", "politics", "war", "violence",
      "alcohol", "academic essays", "corporate jargon", "medical procedures",
    ],
    sentenceCap: "≤ 6 words per sentence, one clause only",
    visualStyle: "bright primary colors, flat 2D, oversized friendly characters",
  },
  academy: {
    hub: "academy",
    ageBand: "Ages 9–17",
    tone: "modern, identity-driven, socially relevant, light challenge",
    allowedCharacters: [
      "teen peers, classmates, siblings, sports teammates, music/gaming creators",
    ],
    bannedRegister: [
      "child-only characters (talking toys, cartoon animals as protagonists)",
      "corporate workplace scenarios", "retirement planning", "adult dating",
      "alcohol", "graphic violence",
    ],
    sentenceCap: "natural teen English, 1–2 clauses per sentence",
    visualStyle: "vibrant teen aesthetic, social-feed inspired, dynamic",
  },
  success: {
    hub: "success",
    ageBand: "Ages 18+",
    tone: "professional, confident, respectful, life-fluency oriented",
    allowedCharacters: [
      "adult professionals, travelers, students, parents, patients, customers",
    ],
    bannedRegister: [
      "childish framing", "cartoon animal protagonists", "school playground scenarios",
      "babyish vocabulary",
    ],
    sentenceCap: "natural adult English, multi-clause permitted",
    visualStyle: "clean, premium, modern photography or editorial illustration",
  },
};

// ───────────────── CEFR profiles ─────────────────

export const CEFR_PROFILES: Record<Cefr, CefrProfile> = {
  "Pre-A1": {
    level: "Pre-A1",
    allowedGrammar: [
      "present_simple_be", "this_is", "i_have", "color_naming",
      "number_counting", "imperative_basic",
    ],
    forbiddenGrammar: [
      "past_simple", "future", "perfect_tenses", "conditionals", "modals",
      "passive_voice", "reported_speech", "relative_clauses",
    ],
    allowAbstractThemes: false,
    sentenceComplexity: "single-clause, ≤5 words",
  },
  A1: {
    level: "A1",
    allowedGrammar: [
      "present_simple_affirmative", "present_simple_negative",
      "present_simple_question", "present_continuous_basic",
      "i_have_got", "there_is_there_are", "imperative",
    ],
    forbiddenGrammar: [
      "past_perfect", "future_perfect", "third_conditional", "passive_voice",
      "reported_speech", "subjunctive", "inversion",
    ],
    allowAbstractThemes: false,
    sentenceComplexity: "single-clause, simple",
  },
  A2: {
    level: "A2",
    allowedGrammar: [
      "present_simple", "present_continuous", "past_simple_regular",
      "past_simple_irregular_common", "going_to_future", "can_could_basic",
      "comparatives_basic",
    ],
    forbiddenGrammar: [
      "past_perfect", "future_perfect", "third_conditional", "subjunctive",
      "inversion", "cleft_sentences",
    ],
    allowAbstractThemes: false,
    sentenceComplexity: "1–2 clauses, simple connectors (and, but, because)",
  },
  B1: {
    level: "B1",
    allowedGrammar: [
      "present_perfect", "past_continuous", "first_conditional",
      "second_conditional", "modal_verbs", "phrasal_verbs_common",
      "reported_speech_basic",
    ],
    forbiddenGrammar: ["inversion", "cleft_sentences", "subjunctive_advanced"],
    allowAbstractThemes: true,
    sentenceComplexity: "multi-clause, varied connectors",
  },
  B2: {
    level: "B2",
    allowedGrammar: [
      "all_conditionals", "passive_voice", "reported_speech",
      "relative_clauses", "perfect_continuous", "modals_of_deduction",
    ],
    forbiddenGrammar: [],
    allowAbstractThemes: true,
    sentenceComplexity: "complex, idiomatic",
  },
  C1: {
    level: "C1",
    allowedGrammar: [
      "inversion", "cleft_sentences", "advanced_modals", "subjunctive",
      "hedging", "discourse_markers",
    ],
    forbiddenGrammar: [],
    allowAbstractThemes: true,
    sentenceComplexity: "sophisticated, register-aware",
  },
  C2: {
    level: "C2",
    allowedGrammar: ["any"],
    forbiddenGrammar: [],
    allowAbstractThemes: true,
    sentenceComplexity: "native-like, nuanced",
  },
};

// ───────────────── Theme Matrix ─────────────────
// Each cell lists ALLOWED themes for the (hub, cefr) pair. The lesson
// generator MUST pick from these. Forbidden lexicon is shared across the
// matrix so the same word triggers a rejection wherever it appears.

const PLAYGROUND_BEGINNER_THEMES = [
  "Greetings & Names", "Family & Pets", "Colors & Numbers",
  "Favorite Foods", "Toys & Playground Games", "Clothes & Weather",
  "Body & Feelings", "Daily Routine (wake, eat, play)",
  "Farm & Zoo Animals", "My Room & House",
];

const ACADEMY_TEEN_THEMES_BEGINNER = [
  "Meeting Classmates", "Hobbies & Free Time",
  "Music & Streaming", "Sports & Teams", "School Day",
  "Foods I Like", "Family & Friends", "My Neighborhood",
  "Gaming & Apps", "Weekend Plans",
];

const ACADEMY_TEEN_THEMES_INTERMEDIATE = [
  "Friendships & Social Life", "School Projects",
  "Music Festivals & Concerts", "Travel with Family",
  "Sports & Fitness", "Social Media & Online Life",
  "Future Studies", "Hobbies & Side Projects",
  "Healthy Habits", "Local Environment",
];

const ACADEMY_TEEN_THEMES_ADVANCED = [
  "Identity & Belonging", "Climate & Activism",
  "Career Exploration", "Digital Citizenship",
  "Cultural Differences", "Mental Wellbeing",
  "News & Media Literacy", "Innovation & Startups",
];

const SUCCESS_ADULT_THEMES_BEGINNER = [
  "Introducing Yourself at Work", "Travel & Airport Basics",
  "Restaurants & Ordering", "Shopping & Money",
  "Hotel Check-in", "Asking for Directions",
  "Daily Routine at Home & Work", "Family & Weekend Plans",
];

const SUCCESS_ADULT_THEMES_INTERMEDIATE = [
  "Workplace Meetings", "Business Travel",
  "Healthcare & Doctor Visits", "University & Studying Abroad",
  "Banking & Finances", "Renting an Apartment",
  "Customer Service", "Networking Events",
];

const SUCCESS_ADULT_THEMES_ADVANCED = [
  "Negotiation & Diplomacy", "Leadership & Management",
  "Public Speaking & Presentations", "Cross-Cultural Communication",
  "Career Transitions", "Project Management",
  "Industry Analysis", "Academic Research Discussion",
];

export const THEME_MATRIX: Record<Hub, Partial<Record<Cefr, string[]>>> = {
  playground: {
    "Pre-A1": PLAYGROUND_BEGINNER_THEMES,
    "A1": PLAYGROUND_BEGINNER_THEMES,
    "A2": PLAYGROUND_BEGINNER_THEMES,
    "B1": [
      ...PLAYGROUND_BEGINNER_THEMES,
      "Adventures with My Friends", "Helping at Home",
      "Outdoor Nature Hikes", "Science Experiments for Kids",
    ],
  },
  academy: {
    "Pre-A1": ACADEMY_TEEN_THEMES_BEGINNER,
    "A1": ACADEMY_TEEN_THEMES_BEGINNER,
    "A2": ACADEMY_TEEN_THEMES_BEGINNER,
    "B1": ACADEMY_TEEN_THEMES_INTERMEDIATE,
    "B2": ACADEMY_TEEN_THEMES_INTERMEDIATE,
    "C1": ACADEMY_TEEN_THEMES_ADVANCED,
  },
  success: {
    "Pre-A1": SUCCESS_ADULT_THEMES_BEGINNER,
    "A1": SUCCESS_ADULT_THEMES_BEGINNER,
    "A2": SUCCESS_ADULT_THEMES_BEGINNER,
    "B1": SUCCESS_ADULT_THEMES_INTERMEDIATE,
    "B2": SUCCESS_ADULT_THEMES_INTERMEDIATE,
    "C1": SUCCESS_ADULT_THEMES_ADVANCED,
  },
};

// Hard forbidden lexicon for beginner levels (A1/A2 across all hubs).
// Word-boundary matched, case-insensitive.
export const FORBIDDEN_BEGINNER_TERMS = [
  "revolution", "revolutions", "gladiator", "gladiators",
  "emperor", "emperors", "empire", "empires",
  "war", "wars", "warfare", "battle", "battles",
  "conflict", "conflicts", "colonialism", "colonial",
  "industrialization", "industrial revolution",
  "pandemic", "pandemics", "geopolitics", "geopolitical",
  "philosophy", "philosophical", "ethics", "ethical",
  "civilization", "civilizations", "ancient",
  "dynasty", "dynasties", "regime", "regimes",
  "ideology", "ideologies",
];

// Additional terms blocked at B1/B2 (only blocked when found inside
// content explicitly targeted at <=B2 — C1/C2 may discuss freely).
export const FORBIDDEN_INTERMEDIATE_TERMS = [
  "geopolitical", "epistemology", "phenomenology",
  "neoliberalism", "hegemony",
];

// ───────────────── Validators ─────────────────

export function normalizeCefr(input?: string | null): Cefr | null {
  if (!input) return null;
  const v = String(input).trim().toUpperCase().replace(/\s+/g, "");
  if (v === "PRE-A1" || v === "PREA1" || v === "A0") return "Pre-A1";
  if (["A1", "A2", "B1", "B2", "C1", "C2"].includes(v)) return v as Cefr;
  return null;
}

export function normalizeHub(input?: string | null): Hub | null {
  if (!input) return null;
  const v = String(input).trim().toLowerCase();
  if (v === "playground" || v === "kids") return "playground";
  if (v === "academy" || v === "teen" || v === "teens") return "academy";
  if (v === "success" || v === "adult" || v === "adults" || v === "professional") return "success";
  return null;
}

function buildForbiddenRegex(terms: string[]): RegExp {
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`\\b(${escaped.join("|")})\\b`, "i");
}

const RX_FORBIDDEN_BEGINNER = buildForbiddenRegex(FORBIDDEN_BEGINNER_TERMS);
const RX_FORBIDDEN_INTERMEDIATE = buildForbiddenRegex(FORBIDDEN_INTERMEDIATE_TERMS);

export interface ForbiddenHit {
  term: string;
  sample: string;
  path: string;
}

function walkStrings(value: unknown, path: string, out: (s: string, p: string) => void): void {
  if (value == null) return;
  if (typeof value === "string") { out(value, path); return; }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkStrings(v, `${path}[${i}]`, out));
    return;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      walkStrings(v, path ? `${path}.${k}` : k, out);
    }
  }
}

export function findForbiddenThemeHit(payload: unknown, cefr: Cefr): ForbiddenHit | null {
  const rx =
    cefr === "Pre-A1" || cefr === "A1" || cefr === "A2"
      ? RX_FORBIDDEN_BEGINNER
      : cefr === "B1" || cefr === "B2"
        ? RX_FORBIDDEN_INTERMEDIATE
        : null;
  if (!rx) return null;
  let hit: ForbiddenHit | null = null;
  walkStrings(payload, "", (s, p) => {
    if (hit) return;
    const m = rx.exec(s);
    if (m) hit = { term: m[1], sample: s.slice(0, 160), path: p };
  });
  return hit;
}

export function findForbiddenGrammarHit(target_grammar: string, cefr: Cefr): string | null {
  const profile = CEFR_PROFILES[cefr];
  if (!profile) return null;
  if (profile.allowedGrammar.includes("any")) return null;
  const slug = target_grammar.trim().toLowerCase();
  if (profile.forbiddenGrammar.some((g) => slug.includes(g))) return slug;
  // Soft: if it's not in allowedGrammar, also reject so unit-lock is strict.
  if (!profile.allowedGrammar.some((g) => slug.includes(g))) return slug;
  return null;
}

export interface UnitLockValidation {
  ok: boolean;
  code?: "GRAMMAR_ABOVE_CEFR" | "VOCAB_POOL_SIZE" | "THEME_NOT_IN_MATRIX" | "FORBIDDEN_TERM";
  detail?: string;
}

export function validateUnitLock(
  unit: Partial<UnitLock> & { hub?: string; cefr?: string; theme?: string },
  hub: Hub,
  cefr: Cefr,
): UnitLockValidation {
  if (!unit.theme) return { ok: false, code: "THEME_NOT_IN_MATRIX", detail: "Theme is empty." };

  const allowedThemes = THEME_MATRIX[hub]?.[cefr] ?? [];
  if (allowedThemes.length && !allowedThemes.includes(unit.theme)) {
    return {
      ok: false,
      code: "THEME_NOT_IN_MATRIX",
      detail: `Theme "${unit.theme}" is not in THEME_MATRIX[${hub}][${cefr}]. Allowed: ${allowedThemes.join(" | ")}`,
    };
  }
  if (!unit.target_grammar) {
    return { ok: false, code: "GRAMMAR_ABOVE_CEFR", detail: "target_grammar is empty." };
  }
  const grammarHit = findForbiddenGrammarHit(unit.target_grammar, cefr);
  if (grammarHit) {
    return {
      ok: false,
      code: "GRAMMAR_ABOVE_CEFR",
      detail: `Grammar "${unit.target_grammar}" is not allowed at ${cefr}. Allowed: ${CEFR_PROFILES[cefr].allowedGrammar.join(", ")}`,
    };
  }
  const pool = unit.target_vocabulary_pool ?? [];
  if (pool.length < 5 || pool.length > 10) {
    return {
      ok: false,
      code: "VOCAB_POOL_SIZE",
      detail: `target_vocabulary_pool must have 5-10 items, got ${pool.length}.`,
    };
  }
  const themeHit = findForbiddenThemeHit({ theme: unit.theme, pool }, cefr);
  if (themeHit) {
    return {
      ok: false,
      code: "FORBIDDEN_TERM",
      detail: `Forbidden term "${themeHit.term}" at ${cefr} in path ${themeHit.path}.`,
    };
  }
  return { ok: true };
}

// ───────────────── Prompt builders ─────────────────

export function buildHubCefrPreamble(hub: Hub, cefr: Cefr): string {
  const h = HUB_PROFILES[hub];
  const c = CEFR_PROFILES[cefr];
  const themes = THEME_MATRIX[hub]?.[cefr] ?? [];

  return `🛡 GLOBAL PEDAGOGY ENGINE — HARD CONTRACT (do not violate)

DEMOGRAPHIC HUB: ${h.hub.toUpperCase()} (${h.ageBand})
- Tone: ${h.tone}
- Allowed characters: ${h.allowedCharacters.join("; ")}
- Banned register: ${h.bannedRegister.join("; ")}
- Sentence cap: ${h.sentenceCap}
- Visual style: ${h.visualStyle}

CEFR LEVEL: ${c.level}
- Allowed grammar: ${c.allowedGrammar.join(", ")}
- Forbidden grammar: ${c.forbiddenGrammar.length ? c.forbiddenGrammar.join(", ") : "(none)"}
- Abstract themes allowed: ${c.allowAbstractThemes ? "yes" : "NO — concrete, immediate, personal themes only"}
- Sentence complexity: ${c.sentenceComplexity}

ALLOWED THEMES (pick from this list ONLY):
${themes.length ? themes.map((t) => `  • ${t}`).join("\n") : "  (no restriction — open theme)"}

UNIVERSAL BANS:
- Never use these terms when targeting beginners (Pre-A1/A1/A2):
  ${FORBIDDEN_BEGINNER_TERMS.join(", ")}
- Each unit in a curriculum MUST use a DIFFERENT theme — no chronological history arc, no repeated themes.
- Never mismatch register to age band (no workplace stories for Playground; no cartoon animal protagonists for Success).`;
}

export function buildUnitLockBlock(hub: Hub, cefr: Cefr, lock: UnitLock): string {
  return `🔒 UNIT LOCK — CRITICAL HAND-OFF (do not deviate)
You are building a lesson for the ${hub.toUpperCase()} demographic at the ${cefr} level.
Your topic is STRICTLY: ${lock.theme}.
You may ONLY teach the grammar rule: ${lock.target_grammar}.
You MUST use these specific words (and only introduce ≤2 supporting words beyond them):
  ${lock.target_vocabulary_pool.map((w) => `"${w}"`).join(", ")}
Do not hallucinate outside topics, characters, registers, or grammar.`;
}

// ───────────────── Slot-Filling helpers (Cycle 3 hardening) ─────────────────
// Convert the LLM from a "theme inventor" into a strict "theme formatter".
// The server pre-assigns every unit's theme + grammar from the matrix BEFORE
// the model is called, then force-overwrites any drift after generation.

export interface AssignedSlot {
  unitNumber: number;
  theme: string;
  target_grammar: string;
}

/**
 * Deterministically slice THEME_MATRIX[hub][cefr] into a numbered ordered list
 * of unit slots. Themes rotate without immediate repetition; grammar is
 * round-robined through the CEFR profile's allowed grammar so each unit gets
 * a distinct rule when possible. Pure function — no randomness.
 */
export function assignThemesForUnits(
  hub: Hub,
  cefr: Cefr,
  unitCount: number,
): AssignedSlot[] {
  const themes = THEME_MATRIX[hub]?.[cefr] ?? [];
  const grammarPool = (CEFR_PROFILES[cefr]?.allowedGrammar ?? []).filter(
    (g) => g !== "any",
  );
  const slots: AssignedSlot[] = [];
  for (let i = 0; i < Math.max(1, unitCount); i++) {
    const theme = themes.length ? themes[i % themes.length] : `Unit ${i + 1}`;
    const grammar = grammarPool.length
      ? grammarPool[i % grammarPool.length]
      : "present_simple_affirmative";
    slots.push({ unitNumber: i + 1, theme, target_grammar: grammar });
  }
  return slots;
}

/**
 * Formatter system prompt. Downgrades the LLM from "designer" to "formatter".
 * Pair with buildHubCefrPreamble() above it and the pre-assigned slot list in
 * the user prompt.
 */
export function buildFormatterSystemPrompt(hub: Hub, cefr: Cefr): string {
  return `🧰 ROLE: ESL CURRICULUM FORMATTER (not inventor)
You are formatting a curriculum for the ${hub.toUpperCase()} hub at CEFR ${cefr}.
The server has already chosen the exact Unit Themes and target grammar. Your
ONLY job is to fill in prose: titles, descriptions, learning objectives,
weekly breakdowns, materials, and teacher notes — built AROUND the assigned
theme and grammar.

HARD RULES:
- DO NOT invent new themes, characters, or grammar rules.
- DO NOT replace a pre-assigned theme with a synonym or "improvement".
- DO NOT reorder units.
- If you cannot satisfy a slot, return an empty description rather than
  swapping the theme. The server will reject any drift.`;
}

/**
 * Build a "PRE-ASSIGNED UNITS" block for the user prompt. Caller passes this
 * to the LLM so it knows the exact, immutable theme + grammar for every unit.
 */
export function buildPreAssignedUnitsBlock(slots: AssignedSlot[]): string {
  const lines = slots.map(
    (s) => `  • Unit ${s.unitNumber}: theme="${s.theme}", target_grammar="${s.target_grammar}"`,
  );
  return `📌 PRE-ASSIGNED UNITS (immutable — do not invent, rename, reorder, or swap):
${lines.join("\n")}

For each unit above, return an entry at the SAME index with the SAME unitNumber,
SAME theme, SAME target_grammar. Only add prose (description, objectives,
weekly breakdown, materials, teacher notes).`;
}

/**
 * Force-overwrite curriculum-critical fields on an LLM-produced unit with the
 * server-assigned slot values. The LLM may only contribute prose fields.
 */
export function enforceAssignedTheme<T extends Record<string, unknown>>(
  unitFromLLM: T | null | undefined,
  assigned: AssignedSlot,
  cefr: Cefr,
): T {
  const base = (unitFromLLM && typeof unitFromLLM === "object" ? unitFromLLM : {}) as T;
  return {
    ...base,
    unitNumber: assigned.unitNumber,
    title: assigned.theme,
    theme: assigned.theme,
    target_grammar: assigned.target_grammar,
    cefrLevel: cefr,
  } as T;
}

/**
 * Overwrite drift in a generated lesson against its parent unit lock.
 * Returns { lesson, drift[] } so callers can log what was corrected.
 */
export function overwriteLessonDrift<T extends Record<string, unknown>>(
  lesson: T | null | undefined,
  lock: UnitLock,
): { lesson: T; drift: string[] } {
  const base = (lesson && typeof lesson === "object" ? lesson : {}) as Record<string, unknown>;
  const drift: string[] = [];
  if (base.topic && String(base.topic).trim() && String(base.topic) !== lock.theme) {
    drift.push(`topic:"${base.topic}"→"${lock.theme}"`);
  }
  if (
    base.grammar_focus &&
    String(base.grammar_focus).trim() &&
    !String(base.grammar_focus).toLowerCase().includes(lock.target_grammar.toLowerCase())
  ) {
    drift.push(`grammar_focus:"${base.grammar_focus}"→"${lock.target_grammar}"`);
  }
  const out: Record<string, unknown> = {
    ...base,
    topic: lock.theme,
    grammar_focus: lock.target_grammar,
  };
  if (!Array.isArray(base.vocabulary_set) || (base.vocabulary_set as unknown[]).length === 0) {
    out.vocabulary_set = lock.target_vocabulary_pool;
    drift.push("vocabulary_set:empty→pool");
  }
  return { lesson: out as T, drift };
}
