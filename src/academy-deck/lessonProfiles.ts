// Academy lesson profiles and the variety gate (owner 2026-10-14: "I don't want the same thing repeated; be creative and original").
// Adapted from the Playground's LESSON_PROFILE idea (docs/academy-experience-design.md §5); Academy-only, nothing imported from the Playground.
// Each lesson names its place, look, story frame, signature game, fun hook, evidence and home mission. `lessonVariety.test.ts` (deploy gate) checks the rules below.
export interface LessonProfile {
  /** library id (src/academy-deck/lessonRegistry.ts) */
  id: string;
  /** the lesson before it in the same Season (its main plate and openings must differ) */
  previous?: string;
  /** the named place the lesson happens in and the picture ids that carry it */
  setting: string;
  mainPlate: string;
  look: string;
  /** story frame: mystery, heist, pitch night, road trip, escape room, studio session… */
  frame: string;
  /** the game that needs the new language to win (a slide kind used in the deck) */
  signature: string;
  funHook: string;
  evidence: string;
  homeMission: string;
  /** an older lesson that does not meet the gate yet: the reason and what rebuilds it. Remove the entry when the lesson is rebuilt. */
  grandfathered?: string;
}

/** Empty on purpose: all lessons were removed on 2026-10-17 for the player v2 rebuild. Each rebuilt lesson registers its profile here. */
export const LESSON_PROFILES: LessonProfile[] = [];

/** Slide kinds that are part of every lesson's spine and do not count as "games". */
export const ROUTINE_KINDS = ['title', 'brief', 'badge', 'dial', 'wrap', 'say', 'fade', 'teach', 'model', 'rule', 'story'] as const;
/** The Season 1 opening and its repeated games: a gated lesson may not use them (owner: every lesson felt like lesson one of unit one). */
export const SEASON1_PATTERN = ['whosaid', 'border', 'padlock', 'findwrong', 'factcheck', 'card', 'numwall', 'lockers'] as const;
