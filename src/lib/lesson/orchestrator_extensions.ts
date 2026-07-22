// src/lib/lesson/orchestrator_extensions.ts
// Extended Unit Orchestrator: Storybook tiers, spelling scramble guard,
// quiz distractor (OSASCOMP) guard. Runs before route data parsing.

export interface StorybookTier {
  whoFrame: string;
  whereFrame: string;
  whatFrame: string;
  modelAnswer: string;
}

export interface StorybookOrchestration {
  hasSignedStoryOpener: boolean; // Must be index 0
  slots: readonly ["WHO", "WHERE", "WHAT"];
  tiers: {
    A2: StorybookTier;
    B1: StorybookTier;
    B2: StorybookTier;
  };
}

export interface QuizQuestionValidation {
  id: string;
  type: "picture" | "text" | "audio" | "spell";
  correctAnswer: string;
  distractors: string[];
}

export interface BrainBreakTopicLock {
  unitId: string;
  theme: string;
  allowedEmoji: string[];
  bannedEmoji: string[];
}

/**
 * 🔒 ZERO-MISTAKE SECURITY POLICIES
 * Executed by the Orchestrator before parsing route data files.
 */
export class PlaygroundSecurityOfficer {
  /** 1. Storybook Lesson 4 tier integrity (A2/B1/B2 scaling). */
  static validateStorybookTiers(config: StorybookOrchestration): void {
    if (!config.hasSignedStoryOpener) {
      throw new Error(
        "[ORCHESTRATOR ERROR]: Storybook lessons must place SignedStory at Phase Index 0."
      );
    }

    const b1 = config.tiers.B1.modelAnswer.toLowerCase();
    if (!b1.includes("and") && !b1.includes("because")) {
      throw new Error(
        "[PEDAGOGICAL ERROR]: B1 story model answers must contain connectors ('and' / 'because')."
      );
    }

    const b2 = config.tiers.B2.modelAnswer.toLowerCase();
    const hasSequencing =
      b2.includes("first") || b2.includes("then") || b2.includes("finally");
    if (!hasSequencing) {
      throw new Error(
        "[PEDAGOGICAL ERROR]: B2 retells require structural sequence markers ('first', 'then', 'finally')."
      );
    }
  }

  /** 2. Spelling scramble must never accidentally equal the target word. */
  static validateSpellingScramble(word: string, scrambled: string[]): void {
    const combined = scrambled.join("").toLowerCase();
    if (combined === word.toLowerCase()) {
      throw new Error(
        `[ALGORITHM ERROR]: Scrambled letters for '${word}' match the target solution layout.`
      );
    }
  }

  /** 3. Quiz must include intentionally reversed adjective-order distractors. */
  static validateQuizGrammarDistractors(question: QuizQuestionValidation): void {
    if (question.type === "text" && question.correctAnswer.includes("small orange")) {
      const hasReversed = question.distractors.some((d) => d.includes("orange small"));
      if (!hasReversed) {
        throw new Error(
          `[QUIZ ERROR]: Question ${question.id} lacks a reversed-order adjective distractor.`
        );
      }
    }
  }

  /** 4. Brain-break emoji tokens must stay within their unit's theme. */
  static validateBrainBreakTopicLock(lock: BrainBreakTopicLock, emojisInUse: string[]): void {
    const leaks = emojisInUse.filter((e) => lock.bannedEmoji.includes(e));
    if (leaks.length > 0) {
      throw new Error(
        `[TOPIC LOCK ERROR]: Unit '${lock.unitId}' (${lock.theme}) leaked off-theme emoji: ${leaks.join(", ")}.`
      );
    }
    const stray = emojisInUse.filter((e) => !lock.allowedEmoji.includes(e));
    if (stray.length > 0) {
      throw new Error(
        `[TOPIC LOCK ERROR]: Unit '${lock.unitId}' uses unapproved emoji tokens: ${stray.join(", ")}.`
      );
    }
  }
}
