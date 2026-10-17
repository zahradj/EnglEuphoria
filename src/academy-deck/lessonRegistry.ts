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

/** Every Academy lesson was removed on 2026-10-17 for the player v2 rebuild (docs/academy-player-v2-plan.md); rebuilt lessons are added here (id = blueprint id, script in src/academy-player-v2/lessons). */
export const ACADEMY_DECK_LESSONS: AcademyDeckLesson[] = [
  {
    id: 'B1-S01-E1',
    season: 1,
    lesson: 1,
    title: 'Have You Ever...? · Cold Open',
    blurb: 'B1: Vee dares you to make a bucket list. Hear the story, learn six words, choose between the past simple and the present perfect, and say who has done the most.',
    level: 'B1',
    minutes: 60,
    cover: '/academy-art/bg/bucket-list-wall.webp',
    gradient: 'linear-gradient(135deg,#36207c 0%,#8161e6 55%,#fbbf24 100%)',
    homework: null,
    parts: 8,
  },
];

/** Blueprint id of each deck lesson (src/curriculum/academy). The library numbers lessons in the order they were built (Sign Me Up = Lesson 1, Fake or Real? = Lesson 2); the blueprint episodes are E2 and E3. */
export const ACADEMY_DECK_BLUEPRINT_IDS: Record<string, string> = { 'B1-S01-E1': 'B1-S01-E1' };

export const getAcademyDeckLesson = (id: string | undefined) => ACADEMY_DECK_LESSONS.find((l) => l.id === id);
