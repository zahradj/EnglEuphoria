// Academy roadmap v2 — types.
// Owner-approved Season System (2026-10-08): Level -> Season (= unit = 8 sessions) -> Episode -> 60-minute Live Session.
// Self-contained on purpose: nothing here imports from, or changes, the Playground curriculum files.
// Rules and rationale: .claude/skills/academy-season-system, docs/academy-lesson-system.md.

export type AcademyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type EpisodeType =
  | 'cold-open' // E1 hook + context text, gist only
  | 'word-lab' // E2 vocabulary + pronunciation
  | 'pattern-lab' // E3 grammar noticing (C1: Language Lab)
  | 'on-air' // E4 real-life exchange (C1: seminar / pitch)
  | 'deep-dive' // E5 longer text + short written piece
  | 'side-quest' // E6 student's pick, integrated, light new language
  | 'remix' // E7 consolidation, ZERO new language
  | 'finale'; // E8 peer task + Release + checkpoint, ZERO new language

/** Fixed order of the eight sessions in every Season. */
export const EPISODE_ORDER: readonly EpisodeType[] = [
  'cold-open',
  'word-lab',
  'pattern-lab',
  'on-air',
  'deep-dive',
  'side-quest',
  'remix',
  'finale',
] as const;

export type SkillKey = 'listening' | 'reading' | 'speaking' | 'writing' | 'vocabulary' | 'grammar' | 'pronunciation' | 'mediation';

/** How sure we are that a placement matches the published standard. Never hide an [U]. */
export type Confidence = 'verified' | 'known' | 'rule-of-thumb' | 'unverified';

export interface StructureRef {
  /** stable id, e.g. 'present-simple-3rd-person' */
  id: string;
  label: string;
  /** Sub-use taught in this Season (a structure can return later with a new use). */
  use?: string;
  /** Which episode introduces it: only E3 or E6 may. */
  introducedIn: 'pattern-lab' | 'side-quest';
  confidence: Confidence;
}

export interface SkinRef {
  id: string; // 'football', 'gaming', 'music', 'anime', 'art', 'tech', 'animals', 'food', 'travel', 'fashion', 'science'
  /** Only what changes; the language spine is identical across skins. */
  swaps: string;
}

export interface SeasonOutline {
  /** 'A1-S01' */
  id: string;
  level: AcademyLevel;
  /** 1-based inside the level */
  no: number;
  title: string;
  theme: string;
  /** one-line story hook with a cast member (Vee, Ava, Theo, Mia) */
  hook: string;
  /** the thing the student makes in English and keeps in the portfolio */
  release: string;
  /** <= 4, "I can ..." paraphrased from CEFR / CEFR Companion Volume descriptors for this level */
  canDo: string[];
  /** communicative functions practised (e.g. 'introducing yourself', 'asking for things') */
  functions: string[];
  /** 1-2 grammar structures introduced in this Season (E3, optionally E6) */
  structures: StructureRef[];
  /** lexical fields (topics) the new items come from; concrete item lists are filled from verified word lists */
  lexicalFields: string[];
  /** budget of NEW items (words + chunks) for the whole Season */
  newItemBudget: number;
  /** 1-2 pronunciation priorities (intelligibility first) */
  pronunciation: string[];
  /** mediation task for the Season (B1+: required; A2: optional) */
  mediation?: string;
  /** seasons whose items recycle into E1 (previous two) */
  recycleFrom: string[];
  /** 3-6 "My World" topic skins */
  skins: SkinRef[];
  /** Every 2nd Season: E7 is a Big Remix covering this Season and the previous one */
  bigRemix: boolean;
  /** true when the Season is a level-boundary check Season (E8 includes the level check) */
  levelCheck: boolean;
  /** review notes for the owner / verification status */
  notes?: string;
}

export interface LevelPlan {
  level: AcademyLevel;
  seasons: SeasonOutline[];
  /** target cumulative taught items at the END of this level (words + chunks) */
  cumulativeItemTarget: number;
  /** Cambridge cumulative guided learning hours at the end of the level, for the record */
  cambridgeCumulativeHours?: string;
}

/** Approved sizing (owner, 2026-10-08): seasons per level. 8 sessions each = 560 sessions A1 -> C1. */
export const SEASONS_PER_LEVEL: Record<AcademyLevel, number> = { A1: 10, A2: 12, B1: 16, B2: 16, C1: 16 };
export const SESSIONS_PER_SEASON = 8;
