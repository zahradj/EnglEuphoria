// Conservative per-CEFR linguistic caps. Tune with linguist input later.
// Used by cefrEngine.

import type { Cefr, Hub } from '../types';

export interface CefrCaps {
  maxSentenceWords: number;
  maxClausesPerSentence: number;
  maxSyllablesPerWord: number;
  allowAbstract: boolean;
  bannedConstructs: string[]; // fingerprint ids from blockedGrammarPatterns
}

export const CEFR_CAPS: Record<Cefr, CefrCaps> = {
  'Pre-A1': {
    maxSentenceWords: 5,
    maxClausesPerSentence: 1,
    maxSyllablesPerWord: 2,
    allowAbstract: false,
    bannedConstructs: [
      'Passive Voice', 'Present Perfect', 'Present Perfect Continuous',
      'Past Perfect', 'Past Perfect Continuous', 'Past Continuous',
      'Future Perfect', 'Future Perfect Continuous',
      'Second Conditional', 'Third Conditional', 'Mixed Conditional',
      'Subjunctive', 'Inversion', 'Reported Speech Backshift',
      'Causative Have', 'Modal Perfect', 'Relative Clauses',
    ],
  },
  A1: {
    maxSentenceWords: 8,
    maxClausesPerSentence: 1,
    maxSyllablesPerWord: 3,
    allowAbstract: false,
    bannedConstructs: [
      'Passive Voice', 'Present Perfect Continuous',
      'Past Perfect', 'Past Perfect Continuous',
      'Future Perfect', 'Future Perfect Continuous',
      'Second Conditional', 'Third Conditional', 'Mixed Conditional',
      'Subjunctive', 'Inversion', 'Reported Speech Backshift',
      'Causative Have', 'Modal Perfect',
    ],
  },
  A2: {
    maxSentenceWords: 12,
    maxClausesPerSentence: 2,
    maxSyllablesPerWord: 4,
    allowAbstract: false,
    bannedConstructs: [
      'Past Perfect Continuous', 'Future Perfect', 'Future Perfect Continuous',
      'Third Conditional', 'Mixed Conditional',
      'Subjunctive', 'Inversion', 'Causative Have',
    ],
  },
  B1: {
    maxSentenceWords: 18,
    maxClausesPerSentence: 3,
    maxSyllablesPerWord: 5,
    allowAbstract: true,
    bannedConstructs: [
      'Future Perfect Continuous', 'Mixed Conditional', 'Subjunctive', 'Inversion',
    ],
  },
  B2: {
    maxSentenceWords: 25,
    maxClausesPerSentence: 4,
    maxSyllablesPerWord: 6,
    allowAbstract: true,
    bannedConstructs: ['Mixed Conditional'],
  },
  C1: {
    maxSentenceWords: 35,
    maxClausesPerSentence: 5,
    maxSyllablesPerWord: 8,
    allowAbstract: true,
    bannedConstructs: [],
  },
};

/** Hub-specific register restrictions (independent of CEFR). */
export const HUB_BANNED_REGISTERS: Record<Hub, string[]> = {
  playground: ['corporate', 'exam-prep', 'business', 'workplace'],
  academy:    ['corporate', 'boardroom', 'nursery'],
  success:    ['cartoon', 'nursery', 'toys', 'teen-slang'],
};

/** Playground caps stay tighter even at upper CEFRs. */
export function effectiveCaps(cefr: Cefr, hub: Hub): CefrCaps {
  const base = CEFR_CAPS[cefr];
  if (hub === 'playground') {
    return {
      ...base,
      maxSentenceWords: Math.min(base.maxSentenceWords, 10),
      maxClausesPerSentence: Math.min(base.maxClausesPerSentence, 2),
      allowAbstract: false,
    };
  }
  return base;
}
