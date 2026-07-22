/**
 * 🔒 Unit Orchestrator — immutable pedagogical audit engine.
 * Validates a UnitManifest against the Playground brain rules
 * (lexical cap, greeting wrapper, OSASCOMP, phase count) BEFORE
 * any lesson code or content is generated.
 */

export type CEFRLevel = "Pre-A1" | "A1" | "A2";

export interface PhonicsConfig {
  letter: string;
  sound: string;
  /** Local bitmap path: src/assets/phonics/<word>.png */
  words: string[];
}

export interface LessonManifest {
  lesson_number: number;
  title: string;
  /** Pre-A1 L1 MUST be true — drills "Hello!" chunks before vocab. */
  hasGreetingWrapper: boolean;
  /** Bound by age-appropriate lexical caps (L1=3, L2/L3=2). */
  vocab: string[];
  /** Evaluated against OSASCOMP: [size] precedes [color]. */
  sentenceFrame: string;
  phonic: PhonicsConfig;
  /** 9–10 phase sequence (GREETING, VOCABULARY, …, COOL_DOWN). */
  phases: string[];
}

export interface UnitManifest {
  unit_id: string;
  unit_title: string;
  cefrTarget: CEFRLevel;
  primaryColor: string;
  accentColor: string;
  /** Topic container token: cage, net, basket, fridge, house, … */
  containerTheme: string;
  /** Topic-locked emoji asset tokens. */
  brainBreakEmojis: string[];
  lessons: Record<string, LessonManifest>;
}

const LEXICAL_CAP: Record<number, number> = { 1: 3, 2: 2, 3: 2 };

export function validateUnitOrchestrator(unit: UnitManifest): void {
  for (const lesson of Object.values(unit.lessons)) {
    const n = lesson.lesson_number;

    // Rule 1 — Strict lexical cap (Pre-A1 default 3 / 2 / 2).
    if (unit.cefrTarget === "Pre-A1") {
      const cap = LEXICAL_CAP[n] ?? 3;
      if (lesson.vocab.length > cap) {
        throw new Error(
          `[LEXICAL ERROR]: Lesson ${n} has ${lesson.vocab.length} vocab; cap is ${cap}.`,
        );
      }
    }

    // Rule 2 — Mandatory Pre-A1 greeting wrapper on L1.
    if (unit.cefrTarget === "Pre-A1" && n === 1 && !lesson.hasGreetingWrapper) {
      throw new Error(
        `[COMPLIANCE ERROR]: Pre-A1 Lesson 1 must initialize with a greeting routine.`,
      );
    }

    // Rule 3 — OSASCOMP: [size] must precede [color] in frames.
    const frame = lesson.sentenceFrame.toLowerCase();
    if (frame.includes("[color]") && frame.includes("[size]")) {
      if (frame.indexOf("[color]") < frame.indexOf("[size]")) {
        throw new Error(
          `[GRAMMAR ERROR]: Lesson ${n} adjective order — [size] must precede [color].`,
        );
      }
    }

    // Rule 4 — 9–10 phase sequence (no merged / truncated lessons).
    if (lesson.phases.length < 9 || lesson.phases.length > 10) {
      throw new Error(
        `[ARCHITECTURAL ERROR]: Lesson ${n} has ${lesson.phases.length} phases (need 9–10).`,
      );
    }
  }

  // eslint-disable-next-line no-console
  console.log(`✨ Unit "${unit.unit_id}" passed orchestrator validation.`);
}
