// Authoring shape for Season outlines. Ids, recycling, Big Remix and level-check flags are computed in index.ts
// so they cannot drift out of sync with the order of the roadmap.
import type { StructureInfo } from './structureLevels';

export interface RawStructure {
  /** key into STRUCTURES */
  id: string;
  /** a later sub-use of an already-taught structure, e.g. 'future arrangements' */
  use?: string;
}

/** One episode's chapter of the Season theme (academy-season-arc skill): a sub-question INSIDE the theme, and the ONE difficulty that rises at this step. */
export interface RawChapter {
  title: string;
  question: string;
  step: string;
}

export interface RawSeason {
  title: string;
  theme: string;
  hook: string;
  release: string;
  /** "I can ..." CEFR-referenced, observable in the Release or checkpoint (1-4) */
  canDo: string[];
  functions: string[];
  /** first = introduced in Pattern Lab (E3); second (optional) = introduced in Side Quest (E6) */
  structures: (string | RawStructure)[];
  lexicalFields: string[];
  /** new items (words + chunks) for the whole Season */
  items: number;
  pron: string[];
  /** B1+ only */
  mediation?: string;
  /** skin ids from SKIN_LIBRARY (3-6) */
  skins: string[];
  /** optional: the eight chapters E1-E8 (academy-season-arc); required once a Season has one, exactly 8 */
  chapters?: RawChapter[];
  /** the one question the whole Season lets the student answer in English (the Release answers it) */
  essentialQuestion?: string;
  notes?: string;
}

export type { StructureInfo };
