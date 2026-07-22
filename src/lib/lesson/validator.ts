// src/lib/lesson/validator.ts
// Compile-time pipeline validator. Runs at module import so any drift in the
// manifest (lexical caps, OSASCOMP order, greeting wrapper, metalanguage,
// truncated phase timeline) throws before lesson routes can render.

import { COMPLETE_PRODUCE_UNIT, type UnitConfig } from "./produce_unit_manifest";

export interface ComputedLayout {
  gridColsClass: string;
  expectedSortingCapacity: number;
  memoryMatchTotalCards: number;
}

const METALANGUAGE = [
  "copula", "pronoun", "adjective", "article", "singular", "plural",
];

export class CurriculumQualityOfficer {
  /** Comprehensive linguistic + architectural audit. */
  static auditAndOrchestrate(unit: UnitConfig): Record<string, ComputedLayout> {
    const layoutMap: Record<string, ComputedLayout> = {};

    for (const [key, lesson] of Object.entries(unit.lessons)) {
      const vocabCount = lesson.vocab.length;

      // 1. Pre-A1 dynamic lexical boundary (2–6).
      if (vocabCount < 2 || vocabCount > 6) {
        throw new Error(
          `[LEXICAL ERROR]: Lesson ${lesson.lesson_number} vocab length (${vocabCount}) outside 2–6.`,
        );
      }

      // 2. Onboarding greeting wrapper required on lesson 1.
      if (lesson.lesson_number === 1 && !lesson.hasGreetingWrapper) {
        throw new Error(
          `[COMPLIANCE ERROR]: Lesson 1 must initialize with a conversational greeting routine.`,
        );
      }

      // 3. OSASCOMP — [size] must precede [color].
      const frame = lesson.sentence_frame.toLowerCase();
      if (frame.includes("[color]") && frame.includes("[size]")) {
        if (frame.indexOf("[color]") < frame.indexOf("[size]")) {
          throw new Error(
            `[GRAMMAR ERROR]: Adjective order violation in Lesson ${lesson.lesson_number}. [size] must precede [color].`,
          );
        }
      }

      // 4. No abstract metalanguage in the sentence frame.
      if (METALANGUAGE.some((kw) => frame.includes(kw))) {
        throw new Error(
          `[PEDAGOGICAL ERROR]: Abstract grammar metalanguage in Lesson ${lesson.lesson_number}.`,
        );
      }

      // 5. Full 9–10 phase timeline.
      if (lesson.phases.length < 9) {
        throw new Error(
          `[ARCHITECTURAL ERROR]: Lesson ${lesson.lesson_number} timeline truncated (${lesson.phases.length} phases).`,
        );
      }

      // Responsive grid scaling based on vocab dimensions.
      let gridColsClass = "grid-cols-3";
      if (vocabCount === 2) gridColsClass = "grid-cols-2";
      else if (vocabCount === 4) gridColsClass = "grid-cols-2 sm:grid-cols-4";
      else if (vocabCount >= 5) gridColsClass = "grid-cols-3 sm:grid-cols-6";

      layoutMap[key] = {
        gridColsClass,
        expectedSortingCapacity: vocabCount,
        memoryMatchTotalCards: vocabCount * 2,
      };
    }

    return layoutMap;
  }
}

// Run baseline audit at import time.
export const PRODUCE_LAYOUT_MAP =
  CurriculumQualityOfficer.auditAndOrchestrate(COMPLETE_PRODUCE_UNIT);
