/**
 * Academy deck lessons that are playable in the Academy hub: the student's My Lessons tab and the content
 * creator's Academy Library both read this list. Data only (no React). Lesson text stays English.
 */
export interface AcademyDeckLesson {
  /** URL id: /academy-lesson/<id> */
  id: string;
  season: number;
  lesson: number;
  title: string;
  /** one line for the card */
  blurb: string;
  level: string;
  minutes: number;
  /** picture behind the card */
  cover: string;
  gradient: string;
  /** the Daily 10 homework quest that goes with it, played at /academy-lesson/<id>/homework */
  homework: { title: string; blurb: string } | null;
  /** how many parts / slides, for the creator's library card */
  parts: number;
}

/** Empty on purpose: every Academy deck lesson was removed on 2026-10-17 for the player v2 rebuild (docs/academy-player-v2-plan.md). Rebuilt lessons are added here. */
export const ACADEMY_DECK_LESSONS: AcademyDeckLesson[] = [];

/** Blueprint id of each deck lesson (src/curriculum/academy). The library numbers lessons in the order they were built (Sign Me Up = Lesson 1, Fake or Real? = Lesson 2); the blueprint episodes are E2 and E3. */
export const ACADEMY_DECK_BLUEPRINT_IDS: Record<string, string> = {};

export const getAcademyDeckLesson = (id: string | undefined) => ACADEMY_DECK_LESSONS.find((l) => l.id === id);
