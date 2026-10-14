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

export const LESSON_PROFILES: LessonProfile[] = [
  {
    id: 'free-time-club-1', setting: 'the school Club Fair at dusk', mainPlate: 'fair-night', look: 'purple dusk, string lights, five stalls', frame: 'mystery: who took Ava’s poster?',
    signature: 'explore', funHook: 'walk the fair and tap each stall to hear what they like; sort your own hobbies with no wrong answer',
    evidence: 'the student says “I like ___. I love ___.” to Ava with their name (Take 2 and the voice note)', homeMission: 'send Ava one voice note: I like ___. I love ___.',
  },
  {
    id: 'free-time-club-2', previous: 'free-time-club-1', setting: 'the club stage', mainPlate: 'club-stage', look: 'stage curtains, warm spotlight', frame: 'mystery clue 2: the hobby wall',
    signature: 'match', funHook: 'many matching games, hobby card for Ava', evidence: 'the student writes and says: I play ___, I go ___, I like ___', homeMission: 'send Ava one voice note: I play ___. I go ___. I like ___.',
    grandfathered: 'Hobby Wall still uses the Season 1 opening and games; rebuild it in the Missing Poster style (new setting, new games, story plates).',
  },
  {
    id: 'last-weekend-1', setting: 'the school weekend gallery at golden hour', mainPlate: 'weekend-gallery', look: 'golden-hour corridor, photos on strings, fairy lights', frame: 'memory mystery: where was Ava last weekend?',
    signature: 'explore', funHook: 'walk the photo wall and tap each photo to hear where Ava was; sort the places you were at',
    evidence: 'the student says and writes “I think Ava was at the ___. I was at the ___.” (Take 2, write, voice note)', homeMission: 'send Ava one voice note: I think you were at the ___.',
  },
  { id: 'sign-me-up', setting: 'the club sign-up desk', mainPlate: 'club-signup-desk', look: 'club lobby', frame: 'sign up', signature: 'padlock', funHook: 'padlock code', evidence: 'sign-up card', homeMission: 'homework quest', grandfathered: 'Season 1 lesson built before the variety gate.' },
  { id: 'sign-me-up-2', setting: 'the club sign-up desk', mainPlate: 'club-signup-desk', look: 'club lobby', frame: 'sign up (three lanes)', signature: 'padlock', funHook: 'lanes', evidence: 'sign-up card', homeMission: 'voice note', grandfathered: 'Season 1 sample built before the variety gate.' },
  { id: 'fake-or-real', setting: 'the detective wall', mainPlate: 'detective-wall', look: 'detective wall', frame: 'detective', signature: 'factcheck', funHook: 'fact-check a profile', evidence: 'written profile check', homeMission: 'write three sentences', grandfathered: 'Season 1 lesson built before the variety gate.' },
  { id: 'pa1-s01-e1', setting: 'the Name Wall', mainPlate: 'name-wall', look: 'name wall', frame: 'letters', signature: 'reader', funHook: 'read names', evidence: 'says hello and name', homeMission: 'say hello to one person', grandfathered: 'Pre-A1 lesson built before the variety gate.' },
];

/** Slide kinds that are part of every lesson's spine and do not count as "games". */
export const ROUTINE_KINDS = ['title', 'brief', 'badge', 'dial', 'wrap', 'say', 'fade', 'teach', 'model', 'rule', 'story'] as const;
/** The Season 1 opening and its repeated games: a gated lesson may not use them (owner: every lesson felt like lesson one of unit one). */
export const SEASON1_PATTERN = ['whosaid', 'border', 'padlock', 'findwrong', 'factcheck', 'card', 'numwall', 'lockers'] as const;
