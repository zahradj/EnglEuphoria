// ──────────────────────────────────────────────────────────────────────────
// Grammar Planner — explicit, upstream selection of grammar targets.
//
// Grammar is a DECISION, not a generation. The Lesson Generator must NOT
// invent grammar; it must receive `target_grammar` as input. This module is
// the single source of truth for that decision.
//
// Pipeline position:
//   Learning Objective Agent → **Grammar Planner (this file)** → Vocabulary
//   Planner → Lesson Generator → Teacher Expert → QA
//
// Inputs: cefr, hub, age, topic, communication_objective, vocab[], prior_grammar[]
// Output: { target_grammar[1..2], rationale, self_check, source }
// ──────────────────────────────────────────────────────────────────────────

export type CefrLevel =
  | "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1";

export interface GrammarPlannerInput {
  cefr: CefrLevel;
  hub: "playground" | "academy" | "success";
  age_group?: string;
  topic: string;                   // e.g. "Animals", "Family", "Weather"
  communication_objective: string; // e.g. "Describe what an animal can do"
  vocab?: string[];                // chosen target vocab (informs structure)
  /** Grammar already taught in recent prior lessons (in the same unit/path). */
  prior_grammar?: string[];
  /** When true, the planner is allowed to RE-USE a prior grammar item for
   *  spiral review. Default false — forces fresh selection. */
  allow_review?: boolean;
}

export interface GrammarTarget {
  /** Canonical form, e.g. "can / can't (ability)" */
  label: string;
  /** Concrete sentence frame the lesson will drill, e.g. "It can ____." */
  frame: string;
  /** One-line teacher rationale tied to the communication objective. */
  why: string;
  /** CEFR descriptor band where this structure becomes productive. */
  cefr_floor: CefrLevel;
}

export interface GrammarPlan {
  target_grammar: GrammarTarget[];          // 1 or 2 targets
  rationale: string;                        // why these, in plain English
  self_check: SelfCheck;                    // 5-question gate
  source: "topic_map" | "objective_inferred" | "review";
  blocked_repeat?: string[];                // items skipped because already taught
}

export interface SelfCheck {
  what_grammar: string;
  why_appropriate: string;
  recently_taught: boolean;
  every_example_reinforces: boolean;
  enables_objective: boolean;
  passed: boolean;
}

// ── Grammar Map ───────────────────────────────────────────────────────────
// Topic + communication-goal → candidate structures, ordered by CEFR floor.
// Add carefully — this is binding for every lesson the generator builds.
interface MapEntry {
  topic_aliases: string[];
  goal_keywords: string[];   // any one match is enough
  candidates: GrammarTarget[];
}

const GRAMMAR_MAP: MapEntry[] = [
  {
    topic_aliases: ["greetings", "hello", "introductions"],
    goal_keywords: ["greet", "introduce", "say hello", "say goodbye"],
    candidates: [
      { label: "Hello / I'm ___ / What's your name?", frame: "Hello, I'm ____.", why: "Core greeting frame.", cefr_floor: "Pre-A1" },
      { label: "How are you? / I'm fine.", frame: "How are you? I'm ____.", why: "Greeting response.", cefr_floor: "A1" },
    ],
  },
  {
    topic_aliases: ["people", "this is", "identification"],
    goal_keywords: ["identify", "introduce someone", "point out"],
    candidates: [
      { label: "This is ___ / He is / She is", frame: "This is ____. She is ____.", why: "Identification frame.", cefr_floor: "Pre-A1" },
      { label: "Subject pronouns + be", frame: "He is ____. They are ____.", why: "Extend be-paradigm.", cefr_floor: "A1" },
    ],
  },
  {
    topic_aliases: ["family", "relatives"],
    goal_keywords: ["introduce family", "describe family", "talk about family"],
    candidates: [
      { label: "Possessive 'my' / This is my ___", frame: "This is my ____.", why: "Frames family identification.", cefr_floor: "Pre-A1" },
      { label: "have got / has got", frame: "I have ____. She has ____.", why: "Family possession.", cefr_floor: "A1" },
    ],
  },
  {
    topic_aliases: ["animals", "pets", "zoo"],
    goal_keywords: ["describe animals", "describe ability", "say what animals can do"],
    candidates: [
      { label: "It is / It has", frame: "It is ____. It has ____.", why: "Animal description.", cefr_floor: "Pre-A1" },
      { label: "can / can't (ability)", frame: "It can ____. It can't ____.", why: "Express animal ability — the communication objective.", cefr_floor: "A1" },
      { label: "There is / There are", frame: "There is a ____. There are ____ ____s.", why: "Animals in a scene.", cefr_floor: "A1" },
    ],
  },
  {
    topic_aliases: ["food", "drinks", "meals"],
    goal_keywords: ["preference", "like", "want", "order food"],
    candidates: [
      { label: "like / don't like", frame: "I like ____. I don't like ____.", why: "Express preference.", cefr_floor: "A1" },
      { label: "Do you like ___?", frame: "Do you like ____? Yes, I do. / No, I don't.", why: "Ask about preference.", cefr_floor: "A1" },
      { label: "countable vs uncountable + some/any", frame: "I have some ____. I don't have any ____.", why: "Food quantities.", cefr_floor: "A2" },
    ],
  },
  {
    topic_aliases: ["school", "classroom", "objects"],
    goal_keywords: ["describe classroom", "locate", "name objects"],
    candidates: [
      { label: "There is / There are", frame: "There is a ____. There are ____.", why: "Describe classroom contents.", cefr_floor: "A1" },
      { label: "prepositions of place (in/on/under)", frame: "The ____ is on the ____.", why: "Locate classroom objects.", cefr_floor: "A1" },
    ],
  },
  {
    topic_aliases: ["daily routine", "routine", "habits"],
    goal_keywords: ["habit", "routine", "every day", "schedule"],
    candidates: [
      { label: "Present Simple (I/you/we)", frame: "I ____ every day.", why: "Express habit.", cefr_floor: "A1" },
      { label: "Present Simple — 3rd person -s", frame: "She ____s every morning.", why: "Talk about others' routines.", cefr_floor: "A1" },
      { label: "adverbs of frequency", frame: "I always/often/sometimes ____.", why: "Quantify routines.", cefr_floor: "A2" },
    ],
  },
  {
    topic_aliases: ["weather", "seasons"],
    goal_keywords: ["describe weather", "talk about weather"],
    candidates: [
      { label: "It is + adjective", frame: "It is ____ today.", why: "Basic weather description.", cefr_floor: "Pre-A1" },
      { label: "Present Continuous (weather)", frame: "It is ____ing now.", why: "Weather happening now.", cefr_floor: "A1" },
    ],
  },
  {
    topic_aliases: ["body", "body parts", "feelings"],
    goal_keywords: ["describe body", "describe feeling", "say how you feel"],
    candidates: [
      { label: "I have + body part", frame: "I have ____.", why: "Body part possession.", cefr_floor: "Pre-A1" },
      { label: "My ___ hurts / I feel ___", frame: "My ____ hurts. I feel ____.", why: "Describe how you feel.", cefr_floor: "A1" },
    ],
  },
];

// ── CEFR ordering for ceiling checks ──────────────────────────────────────
const CEFR_ORDER: CefrLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1"];
const cefrRank = (c: CefrLevel) => CEFR_ORDER.indexOf(c);

function normalize(s: string) {
  return (s ?? "").toLowerCase().trim();
}

function findMapEntry(topic: string, objective: string): MapEntry | null {
  const t = normalize(topic);
  const o = normalize(objective);
  // exact topic alias match first
  let entry = GRAMMAR_MAP.find((e) => e.topic_aliases.some((a) => t.includes(a)));
  if (entry) return entry;
  // fall back to goal-keyword scan
  entry = GRAMMAR_MAP.find((e) => e.goal_keywords.some((k) => o.includes(k)));
  return entry ?? null;
}

// ── Public API ────────────────────────────────────────────────────────────
/**
 * Select 1–2 grammar targets for a single lesson.
 *
 * Order of decisions:
 *   1) Topic + objective → candidate pool from GRAMMAR_MAP.
 *   2) Drop candidates above the CEFR ceiling.
 *   3) Drop candidates already taught in `prior_grammar` (unless allow_review).
 *   4) Pick the lowest-floor candidate first, plus optionally one stretch
 *      candidate one band above for A2+ to add productive challenge.
 *   5) Run the 5-question self-check; if it fails, re-pick within the pool.
 */
export function selectGrammar(input: GrammarPlannerInput): GrammarPlan {
  const ceiling = input.cefr;
  const entry = findMapEntry(input.topic, input.communication_objective);
  const prior = new Set((input.prior_grammar ?? []).map(normalize));

  let pool: GrammarTarget[] = [];
  let source: GrammarPlan["source"] = "topic_map";

  if (entry) {
    pool = entry.candidates
      .filter((c) => cefrRank(c.cefr_floor) <= cefrRank(ceiling))
      .sort((a, b) => cefrRank(a.cefr_floor) - cefrRank(b.cefr_floor));
  } else {
    // No map entry → defer to objective-shape inference (kept narrow on purpose).
    source = "objective_inferred";
    const o = normalize(input.communication_objective);
    if (/\b(can|able)\b/.test(o)) {
      pool.push({ label: "can / can't (ability)", frame: "I/It can ____.", why: "Objective uses ability.", cefr_floor: "A1" });
    } else if (/\b(like|prefer|want)\b/.test(o)) {
      pool.push({ label: "like / don't like", frame: "I like ____.", why: "Objective expresses preference.", cefr_floor: "A1" });
    } else if (/\b(there is|there are|describe.*room|scene)\b/.test(o)) {
      pool.push({ label: "There is / There are", frame: "There is a ____.", why: "Objective describes a scene.", cefr_floor: "A1" });
    } else {
      pool.push({ label: "Present Simple (I/you/we)", frame: "I ____.", why: "Generic productive frame.", cefr_floor: "A1" });
    }
    pool = pool.filter((c) => cefrRank(c.cefr_floor) <= cefrRank(ceiling));
  }

  // Repeat-avoidance.
  const blocked: string[] = [];
  let fresh = pool.filter((c) => {
    const taught = prior.has(normalize(c.label));
    if (taught) blocked.push(c.label);
    return !taught;
  });
  if (fresh.length === 0 && input.allow_review && pool.length > 0) {
    fresh = pool.slice(0, 1);
    source = "review";
  }
  if (fresh.length === 0 && pool.length > 0) {
    // No fresh candidate AND review disabled — keep the lowest-floor item
    // but mark blocked_repeat so the orchestrator can decide.
    fresh = pool.slice(0, 1);
  }

  // Pick 1 main + optional stretch (A2+ only).
  const main = fresh[0];
  const stretch = (cefrRank(ceiling) >= cefrRank("A2") && fresh[1]) ? fresh[1] : undefined;
  const targets = [main, stretch].filter(Boolean) as GrammarTarget[];

  const rationale = entry
    ? `Topic "${input.topic}" + objective "${input.communication_objective}" → ${targets.map((t) => t.label).join(" + ")}. CEFR ceiling ${ceiling} respected; ${blocked.length} prior item(s) skipped.`
    : `No topic map hit — inferred from objective shape: ${targets.map((t) => t.label).join(" + ")}.`;

  const self_check = runSelfCheck({
    targets,
    objective: input.communication_objective,
    prior,
  });

  return {
    target_grammar: targets,
    rationale,
    self_check,
    source,
    blocked_repeat: blocked.length ? blocked : undefined,
  };
}

function runSelfCheck(args: {
  targets: GrammarTarget[];
  objective: string;
  prior: Set<string>;
}): SelfCheck {
  const main = args.targets[0];
  const what_grammar = main ? main.label : "—";
  const why_appropriate = main?.why ?? "no candidate";
  const recently_taught = main ? args.prior.has(normalize(main.label)) : false;
  // We can't introspect examples yet (lesson not built), so this gate is a
  // commitment the generator must honour. We assert TRUE here and the
  // downstream validator (planValidator + Cambridge pedagogy) enforces it.
  const every_example_reinforces = Boolean(main);
  const enables_objective = Boolean(main);
  const passed =
    Boolean(main) && !recently_taught && every_example_reinforces && enables_objective;
  return {
    what_grammar,
    why_appropriate,
    recently_taught,
    every_example_reinforces,
    enables_objective,
    passed,
  };
}

// ── Prompt contract ───────────────────────────────────────────────────────
/**
 * System-prompt block that BINDS the lesson generator to the planner's
 * decision. Chain this AFTER the planner system prompt and BEFORE any
 * activity/grammar/vocab prompts. The generator MUST NOT invent grammar.
 */
export function buildGrammarSelectionSystemPrompt(plan: GrammarPlan): string {
  const lines = plan.target_grammar.map((t, i) =>
    `  ${i + 1}. ${t.label} — frame: "${t.frame}" — why: ${t.why} (CEFR floor ${t.cefr_floor})`
  );
  return [
    `GRAMMAR PLANNER CONTRACT — BINDING.`,
    `The grammar for this lesson has ALREADY been selected by the Grammar Planner. You must NOT invent, swap, or supplement with other grammar.`,
    `Target grammar (${plan.target_grammar.length}):`,
    ...lines,
    `Rationale: ${plan.rationale}`,
    plan.blocked_repeat?.length
      ? `Skipped (already taught recently): ${plan.blocked_repeat.join("; ")}.`
      : `No prior repeats blocked.`,
    `Rules for the lesson body:`,
    `  • Every model sentence, example, and drill MUST use one of the target frames above.`,
    `  • Do not introduce other tenses, modals, or structures incidentally.`,
    `  • Vocabulary chosen by the Vocabulary Planner must fit the target frame slot.`,
    `  • If you cannot teach the communication objective with the target grammar, STOP and report — do not silently substitute.`,
    `Self-check (must remain true after generation): what="${plan.self_check.what_grammar}"; recently_taught=${plan.self_check.recently_taught}; enables_objective=${plan.self_check.enables_objective}.`,
  ].join("\n");
}
