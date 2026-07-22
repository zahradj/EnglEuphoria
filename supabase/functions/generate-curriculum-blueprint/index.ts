// 4-Skills ESL Curriculum Blueprint Generator
// Outputs: { curriculum_title, units: [{ unit_title, theme, lessons: [{ lesson_id, title, skill_focus, learning_objective }] }] }
// Migrated off Lovable AI — calls Google Gemini directly via GEMINI_API_KEY.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CEFR_RULES: Record<string, string> = {
  "Pre-A1": "Pre-literate beginner — single words and 2–3 word chunks ONLY. Only physical, here-and-now nouns (objects in the room, food, family, body, animals). No abstract concepts whatsoever.",
  A1: "Absolute Beginner — present simple only, max 5-word sentences, ultra-concrete survival vocabulary, lots of repetition. NO abstract, historical, scientific, or academic themes.",
  A2: "Elementary — present/past simple, present continuous, 'going to' future, daily-life vocabulary. Still concrete and personal; no abstract/academic/historical themes.",
  B1: "Intermediate — all past tenses, present perfect, first conditional, modals (should/must/might), opinions and plans.",
  B2: "Upper-Intermediate — all conditionals, passive, reported speech, abstract topics, collocations and phrasal verbs.",
  C1: "Advanced — inversion, cleft sentences, hedging, idioms, register shifts, academic and professional language.",
};

const SKILL_ROTATION = ["Grammar", "Vocabulary", "Reading/Listening", "Speaking"];
const VALID_SKILLS = ["Grammar", "Vocabulary", "Reading/Listening", "Speaking", "Review"];

// ── Beginner-band hard rules (Pre-A1 / A1 / A2) ─────────────────────────
const BEGINNER_LEVELS = new Set(["Pre-A1", "A1", "A2"]);
const isBeginner = (cefr: string) => BEGINNER_LEVELS.has(String(cefr));

// Themes that are categorically forbidden for Pre-A1/A1/A2 regardless of age.
const BANNED_BEGINNER_THEME_REGEX =
  /\b(rome|roman|pyramid|egypt|industrial revolution|world war|wwi|wwii|space (exploration|travel|mission)|astronomy|astronaut|cosmos|philosoph|democracy|empire|ancient|medieval|renaissance|cyberpunk|dystopi|ethics|politics|economy|economic|society|civilization|revolution|napoleon|caesar|dragon|magic|wizard|superhero)\b/i;

// Mandatory pedagogical ladder for any beginner blueprint.
const BEGINNER_UNIT_1 = "Introductions and Greetings";
const BEGINNER_UNIT_2 = "Everyday Objects and Numbers";

// ── 7-Lesson "Unit Anatomy" contract ────────────────────────────────────
// Whenever lessons_per_unit === 7, the unit MUST follow this exact shape.
// L5 = Storybook, L6 = Extra Practice, L7 = Unit Review & Boss Test.
const UNIT_ANATOMY_LESSONS = 7;
type LessonType = "core" | "storybook" | "extra_practice" | "unit_review";

// ── Dynamic Scope & Sequence: theme genre pools by CEFR band ────────────
// Hub names are NOT themes — these pools force diverse, age-appropriate
// genres regardless of which hub the user is generating for.
// Beginner pools are concrete + survival-based, split by age, to keep
// Pre-A1/A1/A2 learners out of abstract/historical/academic territory.
const BEGINNER_POOL_KIDS = [
  "My Toys and Pets", "Food I Like", "My Family",
  "Colors and Numbers", "My Body",
];
const BEGINNER_POOL_TEENS = [
  "My Smartphone and Apps", "My Favorite Sports", "Clothes and Shopping",
  "Ordering at a Café", "Getting Around the City",
];
const BEGINNER_POOL_ADULTS = [
  "Ordering at a Café", "At the Supermarket", "Getting Around the City",
  "My Job and Daily Routine", "Travel and Directions",
];

const GENRE_POOLS: Record<string, string[]> = {
  intermediate: [
    "Detective Mystery", "Time Travel", "Sports Championship",
    "Jungle Survival", "Teen Drama",
  ],
  advanced: [
    "Business Negotiation", "Sci-Fi Cyberpunk", "Ethical Dilemma",
    "Global Tech Startup", "Historical Documentary",
  ],
};

function ageBucket(age: string): "kids" | "teens" | "adults" {
  const a = String(age || "").toLowerCase();
  if (a.includes("kid") || a.includes("child") || a.includes("playground")) return "kids";
  if (a.includes("teen") || a.includes("academy")) return "teens";
  return "adults";
}

function beginnerPool(age: string): string[] {
  const b = ageBucket(age);
  if (b === "kids") return BEGINNER_POOL_KIDS;
  if (b === "teens") return BEGINNER_POOL_TEENS;
  return BEGINNER_POOL_ADULTS;
}

function bandForCefr(cefr: string): "beginner" | "intermediate" | "advanced" {
  if (isBeginner(cefr)) return "beginner";
  if (cefr === "B1") return "intermediate";
  return "advanced"; // B2, C1, C2
}

function pickGenre(cefr: string, age: string): string {
  const pool =
    bandForCefr(cefr) === "beginner"
      ? beginnerPool(age)
      : GENRE_POOLS[bandForCefr(cefr)];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── A1 Foundational Matrices (Playground / Academy / Success) ───────────
// Hardcoded 10-unit sequences for A1 beginners per hub. Bans the AI from
// inventing overarching themes ("Space Adventure", "Jungle Safari", etc.)
// and forces a standard, age-appropriate foundational General English course.
const A1_PLAYGROUND_FOUNDATIONAL_UNITS = [
  "Greetings & Introductions",
  "Colors & Shapes",
  "Numbers (1-10) & Counting",
  "My Body & Face",
  "My Family",
  "Toys & Playtime",
  "Pets & Farm Animals",
  "Food & Drink (I like / I don't like)",
  "Clothes",
  "Action Verbs (Run, Jump, Swim)",
];
const A1_PLAYGROUND_FOUNDATIONAL_TITLE =
  "A1 Playground — Foundational General English";

const A1_ACADEMY_FOUNDATIONAL_UNITS = [
  "Personal Identity & Online Profiles",
  "My Room & Gadgets",
  "School Life & Subjects",
  "Family & Friends",
  "Daily Routine & Chores",
  "Free Time & Hobbies",
  "Food & Cafes",
  "Places in Town & Hanging Out",
  "Clothes & Shopping",
  "Weekend Plans",
];
const A1_ACADEMY_FOUNDATIONAL_TITLE =
  "A1 Academy — Foundational Teen English";

const A1_SUCCESS_FOUNDATIONAL_UNITS = [
  "Professional Introductions & Networking",
  "At the Office / Workplace",
  "Daily Schedule & Commute",
  "Corporate Contacts & Colleagues",
  "Business Travel & Airport",
  "Hotels & Accommodation",
  "Business Lunches & Dining",
  "Directions & City Navigation",
  "Small Talk & Weather",
  "Making Appointments",
];
const A1_SUCCESS_FOUNDATIONAL_TITLE =
  "A1 Success — Foundational Adult English";

// ── Pre-A1 Foundational Matrices (NEW) ──────────────────────────────────
// Pre-A1 = pre-literate. Topics are ULTRA-concrete, single-word friendly,
// phonics-driven. No abstract themes, no full sentences expected at output.
const PRE_A1_PLAYGROUND_FOUNDATIONAL_UNITS = [
  "Hello & My Name",
  "Colors",
  "Numbers 1–5",
  "My Face (eyes, nose, mouth)",
  "Family (mum, dad)",
  "Animals (cat, dog, fish)",
  "Food (apple, banana, milk)",
  "Toys (ball, car, doll)",
  "Action Words (jump, run, sit)",
  "Weather (sun, rain)",
];
const PRE_A1_PLAYGROUND_FOUNDATIONAL_TITLE =
  "Pre-A1 Playground — Pre-Literacy English (Phonics + Single Words)";

const PRE_A1_ACADEMY_FOUNDATIONAL_UNITS = [
  "Hello & Names",
  "Numbers 1–10",
  "Colors & Shapes",
  "Classroom Objects",
  "Family Members",
  "Food & Drink Basics",
  "Clothes Basics",
  "Daily Actions (eat, sleep, study)",
  "Places (home, school, park)",
  "Greetings & Polite Words",
];
const PRE_A1_ACADEMY_FOUNDATIONAL_TITLE =
  "Pre-A1 Academy — Pre-Literacy Teen English";

const PRE_A1_SUCCESS_FOUNDATIONAL_UNITS = [
  "Greetings & Personal Names",
  "Numbers 1–10",
  "Days of the Week",
  "Colors & Common Objects",
  "Food & Drink Basics",
  "Money & Prices (basic)",
  "Family Words",
  "Workplace Objects",
  "Directions Basics (here, there)",
  "Polite Words (please, thank you, sorry)",
];
const PRE_A1_SUCCESS_FOUNDATIONAL_TITLE =
  "Pre-A1 Success — Pre-Literacy Adult Survival English";

type FoundationalConfig =
  | {
      active: true;
      cefr: "Pre-A1" | "A1";
      hub: "playground" | "academy" | "success";
      hubLabel: string;
      learnerDescriptor: string;
      units: readonly string[];
      curriculumTitle: string;
    }
  | { active: false };

function resolveFoundational(
  cefr: string,
  hub: string,
  hasTheme: boolean,
): FoundationalConfig {
  if (hasTheme) return { active: false };
  const level = String(cefr);
  const isA1 = level === "A1";
  const isPreA1 = level === "Pre-A1";
  if (!isA1 && !isPreA1) return { active: false };
  const h = String(hub).toLowerCase();
  if (h === "playground") {
    return {
      active: true,
      cefr: isPreA1 ? "Pre-A1" : "A1",
      hub: "playground",
      hubLabel: "Playground",
      learnerDescriptor: isPreA1
        ? "pre-literate young children (ages 4–6) — single words and 2–3 word chunks only, phonics-driven"
        : "young absolute beginners (kids)",
      units: isPreA1
        ? PRE_A1_PLAYGROUND_FOUNDATIONAL_UNITS
        : A1_PLAYGROUND_FOUNDATIONAL_UNITS,
      curriculumTitle: isPreA1
        ? PRE_A1_PLAYGROUND_FOUNDATIONAL_TITLE
        : A1_PLAYGROUND_FOUNDATIONAL_TITLE,
    };
  }
  if (h === "academy") {
    return {
      active: true,
      cefr: isPreA1 ? "Pre-A1" : "A1",
      hub: "academy",
      hubLabel: "Academy",
      learnerDescriptor: isPreA1
        ? "pre-literate teen learners — single words and 2–3 word chunks only, phonics-driven"
        : "young teen learners starting English from scratch",
      units: isPreA1
        ? PRE_A1_ACADEMY_FOUNDATIONAL_UNITS
        : A1_ACADEMY_FOUNDATIONAL_UNITS,
      curriculumTitle: isPreA1
        ? PRE_A1_ACADEMY_FOUNDATIONAL_TITLE
        : A1_ACADEMY_FOUNDATIONAL_TITLE,
    };
  }
  if (h === "success") {
    return {
      active: true,
      cefr: isPreA1 ? "Pre-A1" : "A1",
      hub: "success",
      hubLabel: "Success",
      learnerDescriptor: isPreA1
        ? "pre-literate adult learners — single words and 2–3 word chunks only, survival vocabulary"
        : "adult learners — focus on survival English and professional basics",
      units: isPreA1
        ? PRE_A1_SUCCESS_FOUNDATIONAL_UNITS
        : A1_SUCCESS_FOUNDATIONAL_UNITS,
      curriculumTitle: isPreA1
        ? PRE_A1_SUCCESS_FOUNDATIONAL_TITLE
        : A1_SUCCESS_FOUNDATIONAL_TITLE,
    };
  }
  return { active: false };
}

// Tiny UUIDv4 generator (no external deps)
function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      cefr_level = "A2",
      age_group = "teens",
      unit_count = 4,
      lessons_per_unit = 4,
      theme_hint = "",
      hub = "academy",
      previous_topics = [],
    } = body;

    let safeUnits = Math.max(1, Math.min(10, Number(unit_count) || 4));
    const safeLessons = Math.max(2, Math.min(8, Number(lessons_per_unit) || 4));
    const cefrRule = CEFR_RULES[cefr_level] || CEFR_RULES.A2;
    const variationSeed = Math.random().toString(36).slice(2, 10);

    const cleanTheme = String(theme_hint || "").trim();
    const hasTheme = cleanTheme.length > 0;

    // ── Foundational A1 Override (Playground / Academy / Success) ───────
    // When the user picks A1 + a supported hub with no custom theme, lock
    // the generator into the hardcoded 10-unit matrix for that hub. The
    // AI becomes a slot-filler: it cannot invent unit topics or themes.
    const foundationalConfig = resolveFoundational(cefr_level, hub, hasTheme);
    if (foundationalConfig.active) {
      safeUnits = 10;
    }

    // Phase 2: Dynamic theme genre — only when user did NOT supply a theme
    // AND we are not in a foundational A1 lockdown.
    const chosenGenre =
      hasTheme || foundationalConfig.active ? null : pickGenre(cefr_level, age_group);

    // Phase 3: Anti-repetition — sanitize previous_topics input.
    const prevTopics: string[] = Array.isArray(previous_topics)
      ? previous_topics.map((t: any) => String(t || "").trim()).filter(Boolean).slice(0, 10)
      : [];

    // Pre-A1 has a dedicated pre-literacy pedagogy block. Without this the
    // model collapses Pre-A1 into A1-style "It is a cat." sentences.
    const preA1PedagogyBlock = foundationalConfig.active && foundationalConfig.cefr === "Pre-A1"
      ? `
PRE-A1 PRE-LITERACY PEDAGOGY (HARD, NON-NEGOTIABLE):
- Learners CANNOT read or write yet. All input is audio + image.
- Vocabulary is SINGLE WORDS or 2–3 word chunks ONLY. NEVER full sentences.
  Allowed shapes: "cat", "red", "a cat", "I like", "hello", "thank you".
  FORBIDDEN: "It is a cat.", "The cat is red.", complete SVO sentences.
- Grammar is implicit only — no rules, no conjugation, no "be / have got" lessons.
- Phonics is MANDATORY in every Playground lesson (1–3 grapheme/phoneme links).
- No reading passages, no writing tasks, no spelling. Drag-the-picture only.
- Speaking = repeat-after-mascot + point-and-say. No production beyond chunks.
- Lesson activity types restricted to: listen-and-point, tap-the-picture, match-sound-to-image, sing-along chant, color-and-trace, repeat-after-me.
- Communication goal must be a single tappable behavior ("Tap the cat.", "Say 'red'.").
`
      : "";

    const foundationalSystemPrompt = foundationalConfig.active
      ? `You are an ESL Curriculum Director generating a foundational ${foundationalConfig.cefr} ${foundationalConfig.hubLabel} General English course for ${foundationalConfig.learnerDescriptor}.

CEFR LEVEL CONSTRAINT: ${foundationalConfig.cefr} — ${cefrRule}
AGE GROUP: ${age_group}
HUB: ${foundationalConfig.hub}
${preA1PedagogyBlock}
CRITICAL — CEFR OVERRIDES AGE: Regardless of age group, ${foundationalConfig.cefr} learners can ONLY handle physical, immediate, survival-based topics. STRICTLY FORBIDDEN themes: history (Ancient Rome, Pyramids, World Wars, Industrial Revolution), science (space exploration, astronomy, biology), philosophy, politics, global events, fantasy (magic, superheroes, dragons), abstract concepts.

CRITICAL: DO NOT create an overarching story, theme, or concept for the curriculum. Do NOT make it a "Space Adventure", "Jungle Safari", or any other fictional/historical theme. It must be a standard, foundational General English course. Each unit MUST be a completely different, unrelated everyday topic.

Your ONLY job is to take the 10 topics provided by the system and format them into the JSON array, writing a short, practical description for each and generating the appropriate ${foundationalConfig.cefr} vocabulary/grammar targets. Do NOT create an overarching fictional theme or story. Do NOT invent your own unit topics. Do NOT merge, rename, reorder, or thematically link them.

MANDATORY UNIT SEQUENCE (use each entry verbatim as BOTH unit_title AND theme, in this exact order):
${foundationalConfig.units.map((u, i) => ` ${i + 1}. ${u}`).join("\n")}

For each unit, generate ${safeLessons} lessons:
- Skill rotation order: ${SKILL_ROTATION.join(" → ")}.
- The FINAL lesson of EVERY unit MUST have skill_focus = "Review".
- Lesson titles must be specific, vivid, and age-appropriate for ${foundationalConfig.cefr} ${foundationalConfig.hubLabel} learners.
- Each objective must be one concrete observable outcome ("Students will be able to...").
- Vocabulary and grammar MUST stay strictly inside the unit's own topic — no cross-topic blending.
- curriculum_title MUST be exactly: "${foundationalConfig.curriculumTitle}".

VOCABULARY SIMPLICITY: only the 1000 most common English nouns and verbs. NO compound nouns (e.g. 'skyscraper', 'breakthrough'). NO advanced adjectives (e.g. 'magnificent', 'controversial'). NO Latinate abstractions.

PER-LESSON STRUCTURED BLUEPRINT — MANDATORY:
- communication_goal: ONE sentence describing the real-world task (concrete, observable).
- grammar_focus: ${foundationalConfig.cefr === "Pre-A1"
        ? `array of 0–1 IMPLICIT chunks only ("I like", "this is", "can you?"). NEVER a grammar rule name. Empty array is acceptable.`
        : `array of 1–2 ${foundationalConfig.cefr} structures (be, have got, present simple, can, like + noun, there is/are, this/that/these/those).`}
- vocabulary_focus: array of ${foundationalConfig.cefr === "Pre-A1"
        ? `4–6 SINGLE-WORD items`
        : `6–${foundationalConfig.hub === "playground" ? 8 : foundationalConfig.hub === "academy" ? 14 : 16} ultra-concrete ${foundationalConfig.cefr} items`} drawn from the unit topic ONLY.
- pronunciation_focus: array of 1–3 sounds/patterns tied to the vocabulary_focus.
- phonics_focus: array of ${foundationalConfig.cefr === "Pre-A1" && foundationalConfig.hub === "playground"
        ? `1–3 phoneme/grapheme correspondences (MANDATORY for Pre-A1 Playground)`
        : foundationalConfig.hub === "playground"
          ? `0–3 phoneme/grapheme correspondences appropriate for ${foundationalConfig.cefr} Playground`
          : "0 (empty array)"}.
- review_targets: array of titles from EARLIER lessons in the same unit (empty for lesson 1).
- game_targets: array of 1–3 items from vocabulary_focus for mini-games.
- homework_targets: array of 1–3 items from vocabulary_focus for at-home reinforcement.
- story_arc: ONE short sentence about THIS unit's topic (no overarching narrative).

Return STRICT JSON only.`
      : "";

    // Beginner constraints prepended to the standard prompt when the user
    // supplied a custom theme but the level is Pre-A1/A1/A2.
    const beginnerConstraintsBlock = isBeginner(cefr_level)
      ? `
BEGINNER HARD CONSTRAINTS (${cefr_level}) — NON-NEGOTIABLE:
1. CEFR OVERRIDES AGE. Regardless of age group, themes for Pre-A1/A1/A2 MUST be physical, immediate, and survival-based.
2. STRICTLY FORBIDDEN THEMES: history (Ancient Rome, Pyramids, World Wars, Industrial Revolution, Napoleon, Caesar, medieval, renaissance), science (space exploration, astronomy, biology, cosmos), philosophy, politics, economy, global events, fantasy (magic, superheroes, dragons, wizards), abstract concepts (ethics, society, civilization, democracy).
3. ALLOWED THEME FAMILIES ONLY: greetings, family, home, food & drink, clothes, shopping, café/restaurant, transport & directions, weather, hobbies & sports, smartphones & apps, daily routine, jobs, body & health, pets, school basics.
4. VOCABULARY SIMPLICITY: only the 1000 most common English nouns and verbs. NO compound nouns ('skyscraper', 'breakthrough'). NO advanced adjectives ('magnificent', 'controversial'). NO Latinate abstractions.
5. MANDATORY UNIT LADDER (overrides anything else, including any user theme hint):
   - Unit 1 MUST be exactly "${BEGINNER_UNIT_1}".
   - Unit 2 MUST be exactly "${BEGINNER_UNIT_2}".
   - Subsequent units progress concretely from there (objects → food → home → routines, etc.).
6. If the user's theme hint conflicts with rules 1–5, you MUST reinterpret it as a concrete, survival-based sub-topic (e.g. "history" → "My Family's Old Photos"; "space" → "Day and Night Weather").
`
      : "";

    // ── 7-Lesson "Unit Anatomy" prompt block ────────────────────────────
    const unitAnatomyBlock =
      safeLessons === UNIT_ANATOMY_LESSONS
        ? `
UNIT ANATOMY — STRICT (exactly 7 lessons per unit, NON-NEGOTIABLE):
  L1: skill_focus="Grammar",            lesson_type="core"
  L2: skill_focus="Vocabulary",         lesson_type="core"
  L3: skill_focus="Reading/Listening",  lesson_type="core"
  L4: skill_focus="Speaking",           lesson_type="core"
  L5: skill_focus="Reading/Listening",  lesson_type="storybook"        — Storybook / Real-world Application (title MUST start with "Storybook:")
  L6: skill_focus="Review",             lesson_type="extra_practice"   — title MUST start with "Extra Practice"; interactive review games
  L7: skill_focus="Review",             lesson_type="unit_review"      — title MUST start with "Unit Review & Boss Test"

The lessons array MUST contain exactly 7 objects in this order. Missing L5, L6, or L7 is a HARD failure. Do NOT collapse, merge, or skip any lesson.
`
        : "";

    // CEFR-overrides-age reinforcement (user-mandated wording).
    const cefrOverrideBlock = isBeginner(cefr_level)
      ? `
CEFR-OVERRIDES-AGE (HARD RULE): The CEFR level dictates the complexity of the vocabulary and theme. Do NOT generate abstract, historical, or academic themes for Pre-A1, A1, or A2 students, regardless of age. For Pre-A1 & A1 themes MUST be physical, immediate, and survival-based (e.g. "My Smartphone", "Ordering Food", "My Hobbies"). STRICTLY BAN: "Ancient Rome", "Industrial Revolution", "Pyramids", "World Wars", "Space Exploration", "Philosophy", any dynasty/era/empire/revolution.
`
      : "";



    const standardSystemPrompt = `You are an elite ESL Curriculum Director and Expert Pedagogue. Generate a progressive, high-energy 4-skills English curriculum.${cefrOverrideBlock}${beginnerConstraintsBlock}${unitAnatomyBlock}

CEFR LEVEL CONSTRAINT: ${cefr_level} — ${cefrRule}
AGE GROUP: ${age_group}
HUB: ${hub}

CRITICAL — ANTI-LITERAL RULE:
The hub names (Playground, Academy, Success) indicate AGE and PROFICIENCY LEVEL only.
DO NOT generate literal lessons about playgrounds, schools, academies, or workplaces
unless the user's Core Theme explicitly requests them. Themes must be diverse, vivid,
imaginative, and unrelated to the hub's name.

THEME RULE:
- If a Core Theme is provided, base every unit around it and progress logically across units.
- If a Required Lesson Genre is provided below, you MUST build all units inside that genre,
  inventing distinct sub-themes per unit (still avoid the hub-name literal trap).
- Themes must progress logically across units (sub-topic → sub-topic, never repeating).

REQUIREMENTS:
1. Every unit MUST have a single engaging central theme.
2. Within each unit, lessons MUST systematically rotate through skill focuses in order: Grammar → Vocabulary → Reading/Listening → Speaking.
3. CRITICAL — Spaced repetition: the FINAL lesson of EVERY unit MUST have skill_focus = "Review". No exceptions.
4. Lesson titles must be specific, vivid, and age-appropriate (more mature as CEFR rises).
5. Each objective must be a single concrete observable outcome ("Students will be able to...").
6. Variation seed: ${variationSeed} — use this to differ from past outputs.

PER-LESSON STRUCTURED BLUEPRINT — MANDATORY:
Every lesson MUST include these structured fields (the downstream Unified Lesson Generator depends on them):
- communication_goal: ONE sentence describing the real-world task students will accomplish (derived from objective; concrete, observable).
- grammar_focus: array of 1–2 specific grammar structures appropriate to the CEFR level.
- vocabulary_focus: array of 6–${hub === "playground" ? 8 : hub === "academy" ? 14 : 16} target vocabulary items tied to the unit theme. Hub vocab cap: Playground 8, Academy 14, Success 16. Stay within cap.
- pronunciation_focus: array of 1–3 sounds/patterns relevant to the vocabulary_focus and CEFR level.
- phonics_focus: array of 0–3 phoneme/grapheme correspondences (only for Playground hub at Pre-A1/A1/A2; leave empty otherwise).
- review_targets: array of titles from EARLIER lessons in the same unit whose vocabulary/grammar will be recycled (empty for lesson 1).
- game_targets: array of 1–3 vocabulary items (drawn from vocabulary_focus) suitable for interactive mini-games.
- homework_targets: array of 1–3 vocabulary items (drawn from vocabulary_focus) suitable for at-home reinforcement.
- story_arc: ONE short sentence tying this lesson to the unit's narrative arc.

${prevTopics.length > 0 ? `ANTI-REPETITION — ABSOLUTELY FORBIDDEN:
You MUST NOT reuse any of the following themes, primary vocabulary, storylines, or settings
from the user's recent lessons: ${JSON.stringify(prevTopics)}.
Every unit theme and lesson title must be 100% original and semantically distinct from
that list. Do not paraphrase, swap synonyms, or relocate the same plot.` : ""}

Return STRICT JSON only.`;

    // Curriculum Brain — bind grammar progression to the same matrix the lesson
    // generator (hub-brain) uses, so the blueprint and downstream lessons agree
    // on Topic×CEFR grammar pairings (no "Pre-A1 + present continuous" drift).
    const { GRAMMAR_MATRIX } = await import("../_shared/grammarMatrix.ts");
    const grammarHintsBlock = (() => {
      const lines = GRAMMAR_MATRIX
        .map((spec) => {
          const items = (spec.grammarByCefr as Record<string, string[] | undefined>)[cefr_level];
          if (!items?.length) return null;
          return `  • ${spec.keywords[0]} → goal: ${spec.communicationGoal} | grammar: ${items.join(" | ")}`;
        })
        .filter(Boolean) as string[];
      if (!lines.length) return "";
      return `\n\nGRAMMAR PROGRESSION MATRIX (binding for ${cefr_level} — pick a grammar entry that matches each unit's theme; do not invent grammar outside this band):\n${lines.join("\n")}\n`;
    })();

    const systemPrompt =
      (foundationalConfig.active ? foundationalSystemPrompt : standardSystemPrompt) +
      // Always append anatomy block when applicable (works for both paths).
      (foundationalConfig.active ? unitAnatomyBlock : "") +
      grammarHintsBlock;

    const anatomyUserHint =
      safeLessons === UNIT_ANATOMY_LESSONS
        ? `\n- UNIT ANATOMY (mandatory): L1 Grammar · L2 Vocabulary · L3 Reading/Listening · L4 Speaking · L5 Storybook (lesson_type="storybook") · L6 "Extra Practice" (lesson_type="extra_practice", skill_focus="Review") · L7 "Unit Review & Boss Test" (lesson_type="unit_review", skill_focus="Review"). The lessons array MUST contain exactly 7 objects.`
        : `\n- Skill rotation for non-review lessons: ${SKILL_ROTATION.join(" → ")} (LAST lesson MUST be "Review")`;

    const userPrompt = foundationalConfig.active
      ? `Generate the foundational ${foundationalConfig.cefr} ${foundationalConfig.hubLabel} blueprint NOW using the 10 mandatory units above, in the exact order listed. Use each unit's name verbatim as both unit_title and theme. Produce ${safeLessons} lessons per unit.${anatomyUserHint} Return ONLY the JSON object.`
      : `Generate a curriculum with:
- ${safeUnits} units
- ${safeLessons} lessons per unit${anatomyUserHint}
${hasTheme
  ? `- Core theme/topic (user-supplied, mandatory): "${cleanTheme}"`
  : `- Required Lesson Genre (auto-selected for this CEFR band): "${chosenGenre}"
- No user theme was provided — invent vivid sub-themes inside the "${chosenGenre}" genre.`}

Return ONLY the JSON object.`;


    // Gemini responseSchema — note: NO `additionalProperties` (unsupported by Gemini API).
    const responseSchema = {
      type: "object",
      properties: {
        curriculum_title: { type: "string" },
        units: {
          type: "array",
          items: {
            type: "object",
            properties: {
              unit_number: { type: "integer" },
              unit_title: { type: "string" },
              theme: { type: "string" },
              lessons: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    lesson_number: { type: "integer" },
                    title: { type: "string" },
                    skill_focus: {
                      type: "string",
                      enum: ["Grammar", "Vocabulary", "Reading/Listening", "Speaking", "Review"],
                    },
                    objective: { type: "string" },
                    communication_goal: { type: "string" },
                    grammar_focus: { type: "array", items: { type: "string" } },
                    vocabulary_focus: { type: "array", items: { type: "string" } },
                    pronunciation_focus: { type: "array", items: { type: "string" } },
                    phonics_focus: { type: "array", items: { type: "string" } },
                    review_targets: { type: "array", items: { type: "string" } },
                    game_targets: { type: "array", items: { type: "string" } },
                    homework_targets: { type: "array", items: { type: "string" } },
                    story_arc: { type: "string" },
                    story_goal: { type: "string" },
                    lesson_type: {
                      type: "string",
                      enum: ["core", "storybook", "extra_practice", "unit_review"],
                    },
                  },
                  required: [
                    "lesson_number",
                    "title",
                    "skill_focus",
                    "objective",
                    "communication_goal",
                    "grammar_focus",
                    "vocabulary_focus",
                  ],
                },

              },
            },
            required: ["unit_number", "unit_title", "theme", "lessons"],
          },
        },
      },
      required: ["curriculum_title", "units"],
    };

    const buildRequestBody = (compact: boolean) =>
      JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: compact
                ? systemPrompt +
                  "\n\nCOMPACT MODE: Keep every string under 90 characters. Limit vocabulary_focus to 6 items, grammar_focus to 1 item, pronunciation_focus to 1 item, review_targets to 2 items. Omit story_arc."
                : systemPrompt,
            },
          ],
        },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.85,
          maxOutputTokens: 32768,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

    const TRANSIENT = new Set([429, 500, 502, 503, 504]);
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    async function callGemini(model: string, body: string): Promise<{ ok: true; data: any } | { ok: false; status: number; text: string }> {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const delays = [1500, 3000, 6000];
      let lastStatus = 0;
      let lastText = "";
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
          if (r.ok) return { ok: true, data: await r.json() };
          lastStatus = r.status;
          lastText = await r.text();
          console.error(`Gemini ${model} attempt ${attempt + 1} → ${r.status}`, lastText.slice(0, 200));
          if (!TRANSIENT.has(r.status)) return { ok: false, status: r.status, text: lastText };
        } catch (e) {
          lastStatus = 0;
          lastText = String(e);
          console.error(`Gemini ${model} attempt ${attempt + 1} threw:`, e);
        }
        if (attempt < 2) await sleep(delays[attempt] + Math.floor(Math.random() * 400));
      }
      return { ok: false, status: lastStatus, text: lastText };
    }

    let geminiResult = await callGemini("gemini-2.5-flash", buildRequestBody(false));
    if (!geminiResult.ok && TRANSIENT.has(geminiResult.status)) {
      console.warn("Primary model exhausted, falling back to gemini-2.5-pro");
      geminiResult = await callGemini("gemini-2.5-pro", buildRequestBody(false));
    }
    if (!geminiResult.ok && TRANSIENT.has(geminiResult.status)) {
      console.warn("gemini-2.5-pro also overloaded, last-resort retry on gemini-2.5-flash (compact)");
      geminiResult = await callGemini("gemini-2.5-flash", buildRequestBody(true));
    }

    if (!geminiResult.ok) {
      const isOverload = TRANSIENT.has(geminiResult.status);
      if (isOverload) {
        // Graceful payload — HTTP 200 so the client's handleAIResponse shows
        // the friendly amber "AI overloaded — Retry" toast instead of throwing.
        return new Response(
          JSON.stringify({
            error: true,
            message: "The AI curriculum engine is overloaded. Please retry in ~10 seconds.",
          }),
          { status: 200, headers: { ...CORS, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: "AI generation failed.", details: geminiResult.text.slice(0, 500) }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    let j = geminiResult.data;
    let candidate = j?.candidates?.[0];
    let finishReason = candidate?.finishReason;
    let rawText = (candidate?.content?.parts?.[0]?.text || "").trim();

    if (finishReason && finishReason !== "STOP") {
      console.error("Gemini finishReason non-STOP:", finishReason, "text length:", rawText.length);
    }

    const tryParse = (s: string): any | null => {
      try { return JSON.parse(s); } catch { return null; }
    };
    let parsed: any = tryParse(rawText);

    // Retry once in compact mode when AI ran out of tokens or returned invalid JSON.
    if ((!parsed || finishReason === "MAX_TOKENS") && (finishReason === "MAX_TOKENS" || !parsed)) {
      console.warn("Retrying generate-curriculum-blueprint in COMPACT mode (finishReason=", finishReason, ")");
      const retry = await callGemini("gemini-2.5-flash", buildRequestBody(true));
      if (retry.ok) {
        j = retry.data;
        candidate = j?.candidates?.[0];
        finishReason = candidate?.finishReason;
        rawText = (candidate?.content?.parts?.[0]?.text || "").trim();
        parsed = tryParse(rawText);
      }
    }

    if (!parsed) {
      console.error("Failed to parse Gemini JSON after retry. finishReason:", finishReason, "len:", rawText.length, rawText.slice(0, 500));
      const hint =
        finishReason === "MAX_TOKENS"
          ? "AI response was cut off (token limit). Try fewer units/lessons."
          : "AI returned invalid JSON. Please retry.";
      return new Response(
        JSON.stringify({ error: hint, finishReason, raw: rawText.slice(0, 1000) }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    // Lightweight runtime validation (tool-calling already enforces shape;
    // this guards against missing top-level keys).
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.units)) {
      return new Response(
        JSON.stringify({ error: "Blueprint missing 'units' array." }),
        { status: 502, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    // Normalize a skill string to one of VALID_SKILLS
    const normalizeSkill = (raw: string): string => {
      const v = (raw || "").toLowerCase();
      if (v.startsWith("rev")) return "Review";
      if (v.startsWith("gram")) return "Grammar";
      if (v.startsWith("voc")) return "Vocabulary";
      if (v.startsWith("speak") || v.startsWith("role")) return "Speaking";
      if (v.includes("read") || v.includes("listen")) return "Reading/Listening";
      return "";
    };

    const VOCAB_CAP: Record<string, number> = { playground: 8, academy: 14, success: 16 };
    const vocabCap = VOCAB_CAP[String(hub).toLowerCase()] ?? 14;

    const asStrArr = (v: any, cap = 32): string[] =>
      Array.isArray(v)
        ? v
            .map((x) => String(x || "").trim())
            .filter(Boolean)
            .slice(0, cap)
        : [];

    // ── Foundational guard (defense in depth) ───────────────────────────
    // Even if Gemini drifts and renames/merges units or invents a theme,
    // overwrite unit_title + theme with the hardcoded matrix and pad any
    // missing units so the user always gets exactly 10 in the right order.
    if (foundationalConfig.active) {
      const matrix = foundationalConfig.units;
      const drafted: any[] = Array.isArray(parsed.units) ? parsed.units.slice(0, 10) : [];
      while (drafted.length < 10) drafted.push({ lessons: [] });
      parsed.units = drafted.map((u: any, i: number) => ({
        ...u,
        unit_title: matrix[i],
        theme: matrix[i],
      }));
      parsed.curriculum_title = foundationalConfig.curriculumTitle;
    }

    // ── Beginner guard (Pre-A1 / A1 / A2, custom-theme path) ────────────
    // Force the pedagogical ladder (Unit 1/Unit 2) and swap any unit whose
    // title/theme matches the banned-theme regex with the next unused entry
    // from the age-appropriate concrete pool.
    if (!foundationalConfig.active && isBeginner(cefr_level) && Array.isArray(parsed.units)) {
      const pool = beginnerPool(age_group);
      const usedTitles = new Set<string>();
      const pickReplacement = (): string => {
        for (const candidate of pool) {
          if (!usedTitles.has(candidate.toLowerCase())) {
            usedTitles.add(candidate.toLowerCase());
            return candidate;
          }
        }
        return pool[Math.floor(Math.random() * pool.length)];
      };

      parsed.units = parsed.units.map((u: any, i: number) => {
        let title = String(u?.unit_title || "").trim();
        let theme = String(u?.theme || "").trim();

        // Mandatory ladder: Unit 1 + Unit 2 are hard-locked.
        if (i === 0) {
          title = BEGINNER_UNIT_1;
          theme = BEGINNER_UNIT_1;
        } else if (i === 1) {
          title = BEGINNER_UNIT_2;
          theme = BEGINNER_UNIT_2;
        } else if (
          BANNED_BEGINNER_THEME_REGEX.test(title) ||
          BANNED_BEGINNER_THEME_REGEX.test(theme)
        ) {
          const replacement = pickReplacement();
          title = replacement;
          theme = replacement;
        }
        usedTitles.add(title.toLowerCase());

        // Scrub banned terms out of individual lesson titles too.
        const lessons = Array.isArray(u?.lessons)
          ? u.lessons.map((l: any) => {
              const lt = String(l?.title || "");
              if (BANNED_BEGINNER_THEME_REGEX.test(lt)) {
                return { ...l, title: `${theme} — Practice` };
              }
              return l;
            })
          : u?.lessons;

        return { ...u, unit_title: title, theme, lessons };
      });
    }



    // ── Unit Anatomy guard (7-lesson contract) ──────────────────────────
    // Pad any under-delivered units up to safeLessons so L6 / L7 never go
    // missing, and force the canonical lesson_type for L5/L6/L7 when the
    // user asked for exactly 7.
    const anatomyOn = safeLessons === UNIT_ANATOMY_LESSONS;
    if (Array.isArray(parsed.units)) {
      parsed.units = parsed.units.map((u: any) => {
        const themeStr = String(u?.theme || u?.unit_title || "this unit").trim() || "this unit";
        const existing: any[] = Array.isArray(u?.lessons) ? u.lessons.slice(0, safeLessons) : [];
        while (existing.length < safeLessons) {
          existing.push({ title: "", skill_focus: "", objective: "" });
        }
        if (anatomyOn) {
          // L5 — Storybook
          existing[4] = {
            ...existing[4],
            lesson_type: "storybook",
            skill_focus: "Reading/Listening",
            title: String(existing[4]?.title || "").trim() || `Storybook: ${themeStr}`,
          };
          if (!/^storybook[:\s]/i.test(String(existing[4].title))) {
            existing[4].title = `Storybook: ${existing[4].title}`;
          }
          // L6 — Extra Practice
          existing[5] = {
            ...existing[5],
            lesson_type: "extra_practice",
            skill_focus: "Review",
            title: String(existing[5]?.title || "").trim() || `Extra Practice — ${themeStr}`,
          };
          if (!/^extra practice/i.test(String(existing[5].title))) {
            existing[5].title = `Extra Practice — ${themeStr}`;
          }
          // L7 — Unit Review & Boss Test
          existing[6] = {
            ...existing[6],
            lesson_type: "unit_review",
            skill_focus: "Review",
            title: String(existing[6]?.title || "").trim() || `Unit Review & Boss Test — ${themeStr}`,
          };
          if (!/^unit review/i.test(String(existing[6].title))) {
            existing[6].title = `Unit Review & Boss Test — ${themeStr}`;
          }
        }
        return { ...u, lessons: existing };
      });
    }

    // Inject UUIDs, numbering, enforce skill rotation, Review-last rule,
    // and pass through the enriched structured-blueprint fields with caps.
    const units = (parsed.units || []).slice(0, safeUnits).map((u: any, uIdx: number) => {
      const rawLessons = (u.lessons || []).slice(0, safeLessons);
      const unitTitlesSoFar: string[] = [];
      const lessons = rawLessons.map((l: any, idx: number) => {
        // Derive lesson_type — anatomy mode forces L5/L6/L7 roles.
        let lesson_type: LessonType = (l.lesson_type as LessonType) || "core";
        if (anatomyOn) {
          if (idx === 4) lesson_type = "storybook";
          else if (idx === 5) lesson_type = "extra_practice";
          else if (idx === 6) lesson_type = "unit_review";
          else lesson_type = "core";
        }

        const isLast = idx === rawLessons.length - 1;
        let skill_focus: string;
        if (lesson_type === "extra_practice" || lesson_type === "unit_review") {
          skill_focus = "Review";
        } else if (lesson_type === "storybook") {
          skill_focus = "Reading/Listening";
        } else if (!anatomyOn && isLast) {
          skill_focus = "Review";
        } else {
          const expectedSkill = SKILL_ROTATION[idx % SKILL_ROTATION.length];
          const aiSkill = normalizeSkill(String(l.skill_focus || ""));
          skill_focus =
            aiSkill && aiSkill !== "Review" && VALID_SKILLS.includes(aiSkill)
              ? aiSkill
              : expectedSkill;
        }
        const objective = String(l.objective || l.learning_objective || "");
        const title = String(l.title || `Lesson ${idx + 1}`);
        const vocabulary_focus = asStrArr(l.vocabulary_focus, vocabCap);
        const review_targets =
          asStrArr(l.review_targets, 8).length > 0
            ? asStrArr(l.review_targets, 8)
            : unitTitlesSoFar.slice(); // default: every prior lesson in unit
        const game_targets = asStrArr(l.game_targets, 3);
        const homework_targets = asStrArr(l.homework_targets, 3);

        // ── Deterministic fallbacks so blueprint is never empty ──
        const themeWord = String(u.theme || u.unit_title || "everyday english")
          .replace(/[^\w\s]/g, "").trim().toLowerCase();
        const fallbackVocab = themeWord
          ? themeWord.split(/\s+/).slice(0, 3)
          : ["hello", "thank you", "please"];
        const grammarByCefr: Record<string, string> = {
          "Pre-A1": "be (am/is/are)", A1: "present simple", A2: "past simple",
          B1: "present perfect", B2: "passive voice", C1: "inversion", C2: "cleft sentences",
        };
        let grammar_focus = asStrArr(l.grammar_focus, 4);
        if (grammar_focus.length === 0) {
          grammar_focus = [grammarByCefr[cefr_level] || "present simple"];
        }
        let vocabulary_focus_final = vocabulary_focus;
        if (vocabulary_focus_final.length === 0) {
          vocabulary_focus_final = fallbackVocab;
        }
        let communication_goal = String(l.communication_goal || objective || "").trim();
        if (!communication_goal) {
          communication_goal = `Use ${grammar_focus[0]} to talk about ${themeWord || "everyday situations"}.`;
        }

        const enriched = {
          lesson_id: uuid(),
          lesson_number: idx + 1,
          title,
          skill_focus,
          objective: objective || communication_goal,
          learning_objective: objective || communication_goal,
          communication_goal,
          grammar_focus,
          vocabulary_focus: vocabulary_focus_final,
          pronunciation_focus: asStrArr(l.pronunciation_focus, 4),
          phonics_focus:
            String(hub).toLowerCase() === "playground"
              ? asStrArr(l.phonics_focus, 4)
              : [],
          review_targets,
          adaptive_profile: {
            difficulty_tier: 3,
            scaffolding_boost: 0,
            pacing_hint: "maintain",
          },
          story_state: {
            theme: String(u.theme || "General English"),
            arc: String(l.story_arc || `Unit ${uIdx + 1} · Lesson ${idx + 1}`),
            characters: [],
          },
          game_targets: game_targets.length ? game_targets : vocabulary_focus_final.slice(0, 3),
          homework_targets: homework_targets.length ? homework_targets : vocabulary_focus_final.slice(0, 3),
          lesson_type,
        };
        unitTitlesSoFar.push(title);
        return enriched;
      });
      return {
        unit_number: uIdx + 1,
        unit_title: String(u.unit_title || `Unit ${uIdx + 1}`),
        theme: String(u.theme || "General English"),
        lessons,
      };
    });

    return new Response(
      JSON.stringify({
        curriculum_title: String(parsed.curriculum_title || "English Curriculum"),
        cefr_level,
        age_group,
        hub,
        chosen_genre: chosenGenre,
        previous_topics_count: prevTopics.length,
        units,
      }),
      { status: 200, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error", details: String(err) }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
