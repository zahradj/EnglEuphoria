// Authoring shape for Season outlines. Ids, recycling, Big Remix and level-check flags are computed in index.ts
// so they cannot drift out of sync with the order of the roadmap.
import type { StructureInfo } from './structureLevels';

export interface RawStructure {
  /** key into STRUCTURES */
  id: string;
  /** a later sub-use of an already-taught structure, e.g. 'future arrangements' */
  use?: string;
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
  notes?: string;
}

export type { StructureInfo };
