// Academy item bank — types. Items are the words and chunks a Season introduces, one list per episode.
// Our own picks, level-related by rule: every item's CEFR level must not exceed its Season's level (see validateItems.ts).
// Self-contained: imports only from inside src/curriculum/academy/.
import type { AcademyLevel } from './types';

/** p = productive (the student must say/write it), r = receptive (the student must understand it). */
export type ItemMode = 'p' | 'r';
/** w = single word (headword, no spaces) · c = chunk (multi-word phrase, collocation, phrasal verb, functional phrase). */
export type ItemKind = 'w' | 'c';

/** [text, CEFR level of the item, mode, kind] */
export type ItemSeed = [text: string, level: AcademyLevel, mode: ItemMode, kind: ItemKind];

/**
 * New items per introducing episode. Counts must equal the Season's allocation (allocateItems in lessonBlueprint.ts).
 * E1 receptive words from the story · E2 core productive words · E3 chunks tied to the Season's structure ·
 * E4 functional chunks for the real-life exchange · E5 receptive words/collocations from the longer text · E6 core productive (student's skin).
 * E7 (Remix) and E8 (Finale) introduce nothing.
 */
export interface SeasonItems {
  E1: ItemSeed[];
  E2: ItemSeed[];
  E3: ItemSeed[];
  E4: ItemSeed[];
  E5: ItemSeed[];
  E6: ItemSeed[];
}

export const INTRODUCING_EPISODE_KEYS = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'] as const;
export type IntroducingEpisodeKey = (typeof INTRODUCING_EPISODE_KEYS)[number];
