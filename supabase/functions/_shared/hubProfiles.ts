// Shared edge-function helpers: hub-aware system-prompt blocks + framework defaults.
// Imported by generate-blueprint, generate-ppp-slides, fetch-web-source.
// Keep this file dependency-free (Deno-safe).

export type TargetHub = "Playground" | "Academy" | "Success";
export type PedagogicalFramework = "Discovery" | "TaskBased" | "Immersion";
export type LessonPhase =
  | "Vocabulary"
  | "Reading"
  | "Comprehension"
  | "Grammar"
  | "Speaking"
  | "Writing";

export const FRAMEWORK_DEFAULTS: Record<PedagogicalFramework, LessonPhase[]> = {
  Discovery: ["Reading", "Comprehension", "Grammar", "Vocabulary", "Speaking", "Writing"],
  TaskBased: ["Speaking", "Vocabulary", "Grammar", "Reading", "Comprehension", "Writing"],
  Immersion: ["Vocabulary", "Reading", "Comprehension", "Speaking", "Grammar", "Writing"],
};

const FRAMEWORK_GUIDE = `
THREE PEDAGOGICAL FRAMEWORKS — analyze the topic + source + hub, then pick exactly ONE:

A) "Discovery" (Inductive). BEST FOR: tricky grammar that's easier discovered in context than
   pre-taught (irregular pasts, conditionals, tense contrast). Path:
   Reading → Comprehension → Grammar (puzzle the rule out) → Vocabulary → Speaking → Writing.

B) "TaskBased" (TBL). BEST FOR: adult/professional learners (Success hub) and any topic that
   maps to a real-world performance (write an email, run a meeting, negotiate, present). Path:
   Speaking (impossible task — try & fail) → Vocabulary (toolbox) → Grammar (strategy) →
   Reading (model text) → Comprehension → Writing (succeed at the task).

C) "Immersion" (Classic). BEST FOR: young learners (Playground hub) and pure beginners. Path:
   Vocabulary (visual) → Reading (story) → Comprehension → Speaking (guided) → Grammar → Writing.

Choose the framework that best fits the LEARNER (hub), the TOPIC, and the SOURCE MATERIAL —
not a default. Provide a 1-sentence "framework_rationale" naming the deciding factor.`;

export interface HubProfile {
  /** Source-finding rules to inject into autonomous-source-finder + blueprint prompts. */
  sourceRule: string;
  /** Safety bouncer rules to enforce on any text headed into the blueprint generator. */
  bouncerRule: string;
  /** Pedagogy block for the blueprint + slide generators. */
  pedagogyRule: string;
  /** Hub-specific AI PERSONA — identity, audience, tone, vocabulary register. */
  personaPrompt: string;
  /** Hub-specific recommended slide blueprint emphasis (slide_type guidance). */
  blueprintTemplate: string;
  /** Soft CEFR floor — used when the caller sends an unusable level. */
  cefrFloor: string;
  /** Soft CEFR ceiling — used when the caller sends an unusable level. */
  cefrCeiling: string;
  /** Default framework when the model can't decide. */
  defaultFramework: PedagogicalFramework;
}

const PROFILES: Record<TargetHub, HubProfile> = {
  Playground: {
    sourceRule:
      "SOURCE RULE — PLAYGROUND (ages 4–11): Use ONLY highly visual, simple, factual topics " +
      "(animals, space, weather, daily routines, food, family, body parts, colours, numbers). " +
      "No abstract or complex themes. Prefer single-concept articles with concrete nouns.",
    bouncerRule:
      "SAFETY — COPPA / MAX. ZERO violence, weapons, scary monsters, death, religion, politics, " +
      "romance, body image, advertising, social-media references. Tone must be gentle, warm, " +
      "playful, encouraging. If the source contains ANY of the forbidden categories, REJECT it.",
    pedagogyRule:
      "PEDAGOGY — PLAYGROUND: Pre-A1 to A2 only. Use 4–7 word sentences. Repeat each target word " +
      "at least 3 times across the lesson. Lean heavily on `flashcard` and `drag_and_match` with " +
      "image thumbnails (set left_thumbnail_keyword + right_thumbnail_keyword on every pair). " +
      "Mascot scripts in 1st person, exclamatory and warm. Final mission MUST be sing/say/show, " +
      "never write a paragraph. Keep `requires_audio` = true on most slides for pronunciation.",
    personaPrompt:
      "AI PERSONA — PLAYGROUND: You are a warm, playful kids' English coach. " +
      "Audience: young learners (ages 4–11). Tone: gentle, exclamatory, mascot-led, never sarcastic. " +
      "Vocabulary register: high-frequency concrete nouns, action verbs, simple adjectives. " +
      "Speak in short, joyful sentences. Use 1st-person mascot voice for instructions.",
    blueprintTemplate:
      "RECOMMENDED SLIDE EMPHASIS — PLAYGROUND (within the mandatory 6-phase 20–25 slide structure): " +
      "Open with a `mascot_speech` welcome → `flashcard` vocabulary intros (image-rich) → " +
      "`drag_and_match` with left/right thumbnail keywords → short `mascot_speech` storybook reading → " +
      "`multiple_choice` comprehension → final `mascot_speech` sing/say/show mission. " +
      "AVOID: grammar tables, business case studies, long writing tasks.",
    cefrFloor: "Pre-A1",
    cefrCeiling: "A2",
    defaultFramework: "Immersion",
  },
  Academy: {
    sourceRule:
      "SOURCE RULE — ACADEMY (ages 13–17): Engaging, teen-appropriate topics — technology, " +
      "sports, history, age-appropriate pop culture, science, environment, study skills. " +
      "Avoid heavy news, geopolitics, adult themes.",
    bouncerRule:
      "SAFETY — PG-13. Neutral and factual. NO graphic violence, drugs, alcohol, gambling, " +
      "explicit romance, polarising politics, religion, conspiracy content, hate speech, body- " +
      "image triggers, or self-harm references. Reject anything that wouldn't pass a school filter.",
    pedagogyRule:
      "PEDAGOGY — ACADEMY: A2 to B2. Contextual reading first, explicit grammar second. " +
      "Mix `multiple_choice`, `fill_in_the_gaps`, `drag_and_match`. Speaking prompts should be " +
      "discussion / opinion / problem-solving. Final mission can be a short paragraph, voice note, " +
      "or roleplay. Tone: smart, peer-respecting, never childish, never preachy.",
    personaPrompt:
      "AI PERSONA — ACADEMY: You are an engaging ESL teacher. " +
      "Audience: teens and young adults (ages 13–20). Tone: encouraging, relatable, smart-but-not-childish, " +
      "peer-respecting. Vocabulary register: contemporary everyday English, idiomatic but school-safe, " +
      "discussion-driven. Avoid baby talk and avoid dense corporate jargon.",
    blueprintTemplate:
      "RECOMMENDED SLIDE EMPHASIS — ACADEMY (within the mandatory 6-phase 20–25 slide structure): " +
      "Open with a hook `hero_media` or `mascot_speech` → `vocab_list` (renders as a 3D flip grid) → " +
      "`mascot_speech` storybook scene reading → `match_halves` or `drag_and_match` matching game → " +
      "`fill_in_blanks` with 4–5 sentences → `quiz_mcq` comprehension → `role_play` discussion as final boss. " +
      "AVOID: childish mascot exclamations, corporate negotiation scripts.",
    cefrFloor: "A2",
    cefrCeiling: "B2",
    defaultFramework: "Discovery",
  },
  Success: {
    sourceRule:
      "SOURCE RULE — SUCCESS (adults / professionals): Source from professional blogs, business " +
      "news, travel guides, productivity / leadership / tech / finance articles. Real-world " +
      "scenarios are required — meetings, emails, negotiations, presentations, interviews, travel.",
    bouncerRule:
      "SAFETY — PROFESSIONAL. Neutral, workplace-appropriate. Avoid highly polarising politics, " +
      "religion, hate speech, explicit content. Real business scenarios (layoffs, salary " +
      "negotiation, conflict at work, market downturns) ARE permitted when handled professionally.",
    pedagogyRule:
      "PEDAGOGY — SUCCESS: B1 to C1. Use complex grammar (perfect tenses, conditionals, modals " +
      "of speculation), business idioms, collocations, hedging language. Final mission MUST be a " +
      "professional production task: draft an email, deliver a 60-second pitch, run a 1-minute " +
      "negotiation, write a LinkedIn post, present a recommendation. Tone: respectful, peer-to-peer, " +
      "concise. No childish language, no emoji-heavy mascot scripts.",
    personaPrompt:
      "AI PERSONA — SUCCESS: You are a high-level Corporate Communications Coach. " +
      "Audience: working business professionals (ages 22+). Tone: authoritative, polished, peer-to-peer, " +
      "concise. Vocabulary register: advanced business idioms, negotiation language, management terminology, " +
      "hedging and diplomatic softeners (would, might, could, perhaps), executive summaries. " +
      "Speak as a coach to a colleague — never as a teacher to a child.",
    blueprintTemplate:
      "RECOMMENDED SLIDE EMPHASIS — SUCCESS (within the mandatory 6-phase 20–25 slide structure): " +
      "Open with a `hero_media` title slide → `vocab_list` Executive Summary of key terms → " +
      "`grammar_explanation` rendered as a structured grammar table → `mascot_speech` Business Case Study " +
      "in split-layout reading → `quiz_mcq` analysis questions → `role_play` Roleplay Prompt → " +
      "`real_world_task` final production (draft an email, deliver a pitch, run a negotiation). " +
      "AVOID: childish mascots, sing-along missions, simple flashcard drills.",
    cefrFloor: "B1",
    cefrCeiling: "C1",
    defaultFramework: "TaskBased",
  },
};

/** Normalise free-form hub input to one of the three canonical hubs. */
export function normalizeHub(raw: unknown): TargetHub {
  const v = String(raw ?? "").trim().toLowerCase();
  if (v === "playground" || v === "kids" || v === "kid") return "Playground";
  if (v === "success" || v === "professional" || v === "pro" || v === "adults" || v === "adult") {
    return "Success";
  }
  return "Academy";
}

export function getHubProfile(hub: TargetHub): HubProfile {
  return PROFILES[hub];
}

/** Build the per-hub PERSONA + recommended blueprint block (used by both generators). */
export function buildHubPersonaBlock(hub: TargetHub): string {
  const p = PROFILES[hub];
  return `
═══════════════════════════════════════════════════════
HUB AI PERSONA — ${hub.toUpperCase()}
═══════════════════════════════════════════════════════
${p.personaPrompt}

${p.blueprintTemplate}`.trim();
}

/** System-prompt block for the BLUEPRINT generator — covers source, pedagogy, framework picker. */
export function buildBlueprintHubBlock(hub: TargetHub, cefr_level: string): string {
  const p = PROFILES[hub];
  return `
${buildHubPersonaBlock(hub)}

═══════════════════════════════════════════════════════
TARGET HUB: ${hub.toUpperCase()}  (CEFR window ${p.cefrFloor}–${p.cefrCeiling})
═══════════════════════════════════════════════════════
${p.sourceRule}

${p.bouncerRule}

${p.pedagogyRule}

Caller-supplied CEFR: ${cefr_level}. If this is outside ${p.cefrFloor}–${p.cefrCeiling},
clamp internally — never produce content above ${p.cefrCeiling} or below ${p.cefrFloor} for this hub.

${FRAMEWORK_GUIDE}`.trim();
}

/** System-prompt block for the SLIDE generator — pedagogy + tone only (no framework picker). */
export function buildSlideHubBlock(hub: TargetHub, cefr_level: string): string {
  const p = PROFILES[hub];
  return `
${buildHubPersonaBlock(hub)}

═══════════════════════════════════════════════════════
TARGET HUB: ${hub.toUpperCase()}  (CEFR window ${p.cefrFloor}–${p.cefrCeiling})
═══════════════════════════════════════════════════════
${p.pedagogyRule}

Caller-supplied CEFR: ${cefr_level}. Clamp to ${p.cefrFloor}–${p.cefrCeiling} for this hub.

SCHEMA INTEGRITY: The hub persona changes the CONTENT and slide_type emphasis only. You MUST still emit the same JSON shape (slide_type, interactive_data, lesson_phase, target_skills, requires_audio) defined in the main system prompt — the frontend renderer parses one schema across all hubs.`.trim();
}

/** Build the dynamic phase-sequence block for the slide generator from a blueprint.phases array. */
export function buildPhaseSequenceBlock(
  phases: LessonPhase[],
  framework: PedagogicalFramework | undefined,
): string {
  const ordered = phases.map((p, i) => `  ${i + 1}. ${p}`).join("\n");
  const allPhases = ["Vocabulary", "Reading", "Comprehension", "Grammar", "Speaking", "Writing"];
  const missing = allPhases.filter((p) => !phases.includes(p as LessonPhase));
  return `
═══════════════════════════════════════════════════════
DYNAMIC PHASE SEQUENCE${framework ? ` — ${framework} framework` : ""}
═══════════════════════════════════════════════════════
Build the deck in this EXACT phase order. Every slide MUST be tagged with "lesson_phase".
${ordered}
${missing.length ? `Phases NOT in this lesson (do not produce slides tagged with these): ${missing.join(", ")}.` : "All six phases are required."}
The first slide of each phase introduces it; consecutive slides within a phase are allowed.
Total slide count remains 20–25.`.trim();
}

export function isFramework(v: unknown): v is PedagogicalFramework {
  return v === "Discovery" || v === "TaskBased" || v === "Immersion";
}

export function isPhase(v: unknown): v is LessonPhase {
  return (
    v === "Vocabulary" ||
    v === "Reading" ||
    v === "Comprehension" ||
    v === "Grammar" ||
    v === "Speaking" ||
    v === "Writing"
  );
}
