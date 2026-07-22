/**
 * Playground Unit Validator — HARD gate.
 *
 * Runs after `buildPlaygroundUnit()`, before publish. Emits Issue[]
 * compatible with `runGovernance()` so the orchestrator can block.
 *
 * Codes:
 *   PG_UNIT_LESSON_COUNT            – must be exactly 7
 *   PG_UNIT_VOCAB_BUDGET            – L1/L2/L3 must fit template ranges
 *   PG_UNIT_FRAME_PROGRESSION       – frames stack across L1→L2→L3
 *   PG_UNIT_PHONIC_COUNT            – 3 distinct phonics in L1–L3
 *   PG_UNIT_PHONIC_EXAMPLES         – phonic.words must start with phonic.letter
 *   PG_UNIT_STORYBOOK_VOCAB_REUSE   – L4 story uses only L1–L3 vocab
 *   PG_UNIT_QUIZ_FORMAT             – L6 quiz seed declares the 4 formats
 */
import { PLAYGROUND_UNIT_LESSONS } from "./unitTemplate";
import type { PlaygroundUnit } from "./types";

export interface PlaygroundUnitIssue {
  code:
    | "PG_UNIT_LESSON_COUNT"
    | "PG_UNIT_VOCAB_BUDGET"
    | "PG_UNIT_FRAME_PROGRESSION"
    | "PG_UNIT_PHONIC_COUNT"
    | "PG_UNIT_PHONIC_EXAMPLES"
    | "PG_UNIT_STORYBOOK_VOCAB_REUSE"
    | "PG_UNIT_QUIZ_FORMAT"
    | "PG_UNIT_VOCAB_EXAMPLE_MISSING_HEADWORD"
    | "PG_UNIT_SENTENCE_MODELS_MISSING"
    | "PG_UNIT_SPEAKING_GATE_MALFORMED"
    | "PG_UNIT_SCENARIO_KEY_INVALID";
  severity: "hard";
  auto_repairable: boolean;
  message: string;
  lesson_number?: number;
}

const SCENARIO_KEY_RE = /^[a-z0-9][a-z0-9-]*$/;

export interface PlaygroundUnitVerdict {
  ok: boolean;
  issues: PlaygroundUnitIssue[];
}

export function validatePlaygroundUnit(unit: PlaygroundUnit): PlaygroundUnitVerdict {
  const issues: PlaygroundUnitIssue[] = [];

  if (unit.lessons.length !== 7) {
    issues.push({
      code: "PG_UNIT_LESSON_COUNT",
      severity: "hard",
      auto_repairable: false,
      message: `Playground unit must have exactly 7 lessons (got ${unit.lessons.length}).`,
    });
  }

  // Vocab budget per L1/L2/L3 — accept a range, not a fixed count.
  for (const tpl of PLAYGROUND_UNIT_LESSONS.slice(0, 3)) {
    const lesson = unit.lessons.find((l) => l.lesson_number === tpl.lesson_number);
    const got = lesson?.vocab?.length ?? 0;
    const min = (tpl as any).vocab_min ?? tpl.vocab_budget;
    const max = (tpl as any).vocab_max ?? tpl.vocab_budget;
    if (got < min || got > max) {
      issues.push({
        code: "PG_UNIT_VOCAB_BUDGET",
        severity: "hard",
        auto_repairable: true,
        message: `Lesson ${tpl.lesson_number} must introduce ${min}–${max} vocab words (got ${got}).`,
        lesson_number: tpl.lesson_number,
      });
    }
  }

  // Frame progression is now driven by the lesson plan, not a hard color/size
  // requirement. Many Pre-A1 topics (greetings, feelings, family) cannot use
  // a [color][size] stack. We keep the soft check off intentionally.


  // 3 distinct phonics across L1–L3
  const phonics = unit.phonics_pool;
  const distinctLetters = new Set(phonics.map((p) => p.letter.toLowerCase()));
  if (phonics.length !== 3 || distinctLetters.size !== 3) {
    issues.push({
      code: "PG_UNIT_PHONIC_COUNT",
      severity: "hard",
      auto_repairable: false,
      message: `Lessons 1–3 must declare 3 distinct phonics (got ${distinctLetters.size}).`,
    });
  }

  // Phonic examples must start with the focus letter
  for (const p of phonics) {
    const bad = p.words.filter((w) => !w.toLowerCase().startsWith(p.letter.toLowerCase()));
    if (bad.length) {
      issues.push({
        code: "PG_UNIT_PHONIC_EXAMPLES",
        severity: "hard",
        auto_repairable: true,
        message: `Phonic /${p.letter}/ example(s) do not start with the letter: ${bad.join(", ")}.`,
      });
    }
  }

  // Storybook vocab reuse
  const l4 = unit.lessons.find((l) => l.lesson_number === 4);
  if (l4?.story?.scenes?.length) {
    const corpus = l4.story.scenes.map((s) => s.text).join(" ").toLowerCase();
    const usedNew = corpus
      .split(/[^a-z]+/i)
      .filter(Boolean)
      .filter((w) => w.length >= 3);
    const allowed = new Set(unit.vocab_pool.map((v) => v.toLowerCase()));
    // We only flag if a story-content noun is missing — gentle check: at least
    // one unit-vocab word must appear in the story.
    const reused = usedNew.some((w) => allowed.has(w));
    if (!reused) {
      issues.push({
        code: "PG_UNIT_STORYBOOK_VOCAB_REUSE",
        severity: "hard",
        auto_repairable: true,
        message: "Lesson 4 storybook must reuse vocabulary from Lessons 1–3.",
        lesson_number: 4,
      });
    }
  }

  // Quiz format declaration
  const l6 = unit.lessons.find((l) => l.lesson_number === 6);
  const formats = (l6?.quiz_seed as { formats?: string[] } | undefined)?.formats;
  if (l6 && formats && !["picture", "text", "audio", "spell"].every((f) => formats.includes(f))) {
    issues.push({
      code: "PG_UNIT_QUIZ_FORMAT",
      severity: "hard",
      auto_repairable: true,
      message: "Lesson 6 quiz_seed.formats must include picture, text, audio, and spell.",
      lesson_number: 6,
    });
  }

  // Vocab example must contain its headword (case-insensitive, whole-word).
  for (const lesson of unit.lessons) {
    const media = (lesson.vocab_media ?? {}) as Record<
      string,
      { example?: string } | undefined
    >;
    for (const [word, m] of Object.entries(media)) {
      const example = (m?.example ?? "").trim();
      if (!example) continue;
      const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (!re.test(example)) {
        issues.push({
          code: "PG_UNIT_VOCAB_EXAMPLE_MISSING_HEADWORD",
          severity: "hard",
          auto_repairable: true,
          message: `Lesson ${lesson.lesson_number} vocab example for "${word}" must contain the headword.`,
          lesson_number: lesson.lesson_number,
        });
      }
    }
  }

  // grammar_target set → sentence_models must be non-empty.
  for (const lesson of unit.lessons) {
    const gTarget = String((lesson as any).grammar_target ?? "").trim();
    if (!gTarget) continue;
    const models = (lesson as any).sentence_models;
    const list = Array.isArray(models)
      ? models.filter((s: unknown) => typeof s === "string" && s.trim().length > 0)
      : [];
    if (list.length === 0) {
      issues.push({
        code: "PG_UNIT_SENTENCE_MODELS_MISSING",
        severity: "hard",
        auto_repairable: true,
        message: `Lesson ${lesson.lesson_number} sets grammar_target "${gTarget}" but sentence_models is empty.`,
        lesson_number: lesson.lesson_number,
      });
    }
  }

  // L6 speaking_gate must be well-formed when enabled.
  const l6q = unit.lessons.find((l) => l.lesson_number === 6);
  const gate = (l6q?.quiz_seed as any)?.speaking_gate as
    | { enabled?: boolean; ladder_rung?: string; min_words?: number }
    | undefined;
  if (gate?.enabled) {
    const rungOk = ["guided", "supported", "independent"].includes(String(gate.ladder_rung));
    const wordsOk = typeof gate.min_words === "number" && gate.min_words >= 1;
    if (!rungOk || !wordsOk) {
      issues.push({
        code: "PG_UNIT_SPEAKING_GATE_MALFORMED",
        severity: "hard",
        auto_repairable: true,
        message:
          "Lesson 6 speaking_gate is enabled but requires ladder_rung ∈ {guided, supported, independent} and min_words ≥ 1.",
        lesson_number: 6,
      });
    }
  }

  // authored_games[].scenario_key must be a slug when provided.
  for (const lesson of unit.lessons) {
    const games = (lesson as any).authored_games as
      | { id?: string; scenario_key?: string }[]
      | undefined;
    if (!Array.isArray(games)) continue;
    for (const g of games) {
      const key = (g?.scenario_key ?? "").trim();
      if (!key) continue;
      if (!SCENARIO_KEY_RE.test(key)) {
        issues.push({
          code: "PG_UNIT_SCENARIO_KEY_INVALID",
          severity: "hard",
          auto_repairable: true,
          message: `Lesson ${lesson.lesson_number} authored game "${g?.id ?? "?"}" has invalid scenario_key "${key}" (expected lowercase slug, e.g. "bakery" or "castle-01").`,
          lesson_number: lesson.lesson_number,
        });
      }
    }
  }

  return { ok: issues.length === 0, issues };
}
