// The Academy level ladder as DATA (owner decision 2026-10-12: "lean ladder now, an option for the full ladder later").
// A step is a stretch of Seasons of one CEFR level (core or "Upper"), or the planned Pre-A1 step that has no Seasons in the roadmap data yet.
// Moving between the lean and the full ladder is changing ACTIVE_LADDER_PROFILE (or passing a profile); no lesson is touched.
// Rationale, sources and workload: docs/academy-ladder-plan.md and docs/academy-level-ladder.md. Imports nothing outside src/curriculum/academy/.
import { SESSIONS_PER_SEASON, type AcademyLevel } from './types';

export type LadderStage = 'pre' | 'core' | 'upper';
export type LadderProfileId = 'lean' | 'full';

export interface LadderStep {
  /** stable id: lessons and students may refer to it */
  id: string;
  /** what students and teachers see */
  label: string;
  /** the CEFR level this step belongs to ('Pre-A1' is the Companion Volume's entry level) */
  cefr: 'Pre-A1' | AcademyLevel;
  stage: LadderStage;
  /** roadmap level and the Seasons (by number, inclusive) this step covers; null for the planned Pre-A1 step */
  level: AcademyLevel | null;
  seasons: [number, number] | null;
  /** Seasons that still have to be written (Pre-A1 only) */
  plannedSeasons: number;
  /** working titles of the planned Seasons (docs/academy-pre-a1-curriculum.md), one per planned Season */
  plannedTitles: string[];
  /** true when the label is an official CEFR Companion Volume level; A1 Upper and C1 Upper are our own labels */
  officialCefr: boolean;
  /** which run of show lessons of this step follow: the standard one (RUN_OF_SHOW) or the slower Pre-A1 one (PRE_A1_RUN_OF_SHOW) */
  runOfShow: 'standard' | 'pre-a1';
}

/** Seasons per CEFR level in the approved roadmap (src/curriculum/academy/levels). */
const SEASONS_PER_LEVEL: Record<AcademyLevel, number> = { A1: 10, A2: 12, B1: 16, B2: 16, C1: 16 };
// SESSIONS_PER_SEASON (8) is exported from ./types; imported here, not re-exported, so `export *` in index.ts stays unambiguous.

/** Working titles of the Pre-A1 Seasons (first 3 = Pre-A1 Lite). */
export const PRE_A1_SEASON_TITLES = ['Hello, letters', 'First sounds', 'Numbers and age', 'My things', 'People and places', 'My day'];

const step = (id: string, label: string, cefr: LadderStep['cefr'], stage: LadderStage, level: AcademyLevel | null, seasons: [number, number] | null, plannedSeasons: number, officialCefr: boolean): LadderStep => ({ id, label, cefr, stage, level, seasons, plannedSeasons, plannedTitles: PRE_A1_SEASON_TITLES.slice(0, level === null ? plannedSeasons : 0), officialCefr, runOfShow: stage === 'pre' ? 'pre-a1' : 'standard' });

/**
 * lean (active): Pre-A1 Lite (3 Seasons to write), A1 split into A1 (Seasons 1-6) and A1 Upper (7-10), the other levels unsplit until A1 has real students and data.
 * full: Pre-A1 Full (6 Seasons) and every level split into core + Upper (halves of the existing Seasons).
 */
export const LADDER_PROFILES: Record<LadderProfileId, LadderStep[]> = {
  lean: [
    step('pre-a1', 'Pre-A1', 'Pre-A1', 'pre', null, null, 3, true),
    step('a1', 'A1', 'A1', 'core', 'A1', [1, 6], 0, true),
    step('a1-upper', 'A1 Upper', 'A1', 'upper', 'A1', [7, 10], 0, false),
    step('a2', 'A2', 'A2', 'core', 'A2', [1, 12], 0, true),
    step('b1', 'B1', 'B1', 'core', 'B1', [1, 16], 0, true),
    step('b2', 'B2', 'B2', 'core', 'B2', [1, 16], 0, true),
    step('c1', 'C1', 'C1', 'core', 'C1', [1, 16], 0, true),
  ],
  full: [
    step('pre-a1', 'Pre-A1', 'Pre-A1', 'pre', null, null, 6, true),
    step('a1', 'A1', 'A1', 'core', 'A1', [1, 6], 0, true),
    step('a1-upper', 'A1 Upper', 'A1', 'upper', 'A1', [7, 10], 0, false),
    step('a2', 'A2', 'A2', 'core', 'A2', [1, 6], 0, true),
    step('a2-upper', 'A2 Upper', 'A2', 'upper', 'A2', [7, 12], 0, true),
    step('b1', 'B1', 'B1', 'core', 'B1', [1, 8], 0, true),
    step('b1-upper', 'B1 Upper', 'B1', 'upper', 'B1', [9, 16], 0, true),
    step('b2', 'B2', 'B2', 'core', 'B2', [1, 8], 0, true),
    step('b2-upper', 'B2 Upper', 'B2', 'upper', 'B2', [9, 16], 0, true),
    step('c1', 'C1', 'C1', 'core', 'C1', [1, 8], 0, true),
    step('c1-upper', 'C1 Upper', 'C1', 'upper', 'C1', [9, 16], 0, false),
  ],
};

/** The ladder in use. Change to 'full' to switch every consumer to the full ladder. */
export const ACTIVE_LADDER_PROFILE: LadderProfileId = 'lean';

export const ladderSteps = (profile: LadderProfileId = ACTIVE_LADDER_PROFILE): LadderStep[] => LADDER_PROFILES[profile];
export const getLadderStep = (id: string, profile: LadderProfileId = ACTIVE_LADDER_PROFILE): LadderStep | undefined => ladderSteps(profile).find((s) => s.id === id);

/** The step a roadmap Season (level + number) belongs to. */
export function stepOfSeason(level: AcademyLevel, seasonNo: number, profile: LadderProfileId = ACTIVE_LADDER_PROFILE): LadderStep | undefined {
  return ladderSteps(profile).find((s) => s.level === level && s.seasons && seasonNo >= s.seasons[0] && seasonNo <= s.seasons[1]);
}

/** Seasons and sessions of a step (existing roadmap Seasons plus Seasons still to be written). */
export function stepSize(s: LadderStep): { seasons: number; sessions: number } {
  const seasons = (s.seasons ? s.seasons[1] - s.seasons[0] + 1 : 0) + s.plannedSeasons;
  return { seasons, sessions: seasons * SESSIONS_PER_SEASON };
}

export const ladderTotals = (profile: LadderProfileId = ACTIVE_LADDER_PROFILE) => {
  const sizes = ladderSteps(profile).map(stepSize);
  return { steps: sizes.length, seasons: sizes.reduce((a, b) => a + b.seasons, 0), sessions: sizes.reduce((a, b) => a + b.sessions, 0) };
};

export const ROADMAP_SEASONS_PER_LEVEL = SEASONS_PER_LEVEL;
