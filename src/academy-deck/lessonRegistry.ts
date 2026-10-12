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

export const ACADEMY_DECK_LESSONS: AcademyDeckLesson[] = [
  {
    id: 'sign-me-up',
    season: 1,
    lesson: 2,
    title: 'Sign Me Up',
    blurb: 'Meet Vee, join the club: numbers 1–100, nationalities, classroom words, a sign-up mission and a voice note.',
    level: 'A1',
    minutes: 60,
    cover: '/academy-art/bg/club-signup-desk.webp',
    gradient: 'linear-gradient(135deg,#2e1065 0%,#6d28d9 55%,#38bdf8 100%)',
    homework: { title: 'Sign Me Up · homework quest', blurb: 'Five chests over three weeks: numbers, nationalities, classroom words and a big check.' },
    parts: 8,
  },
  {
    id: 'fake-or-real',
    season: 1,
    lesson: 3,
    title: 'Fake or Real?',
    blurb: 'Check a fake profile with Ava and Theo: say who is who with am, is and are, say what is not true, and ask and answer yes / no questions.',
    level: 'A1',
    minutes: 60,
    cover: '/academy-art/bg/detective-wall.webp',
    gradient: 'linear-gradient(135deg,#1e1b4b 0%,#4f46e5 50%,#a78bfa 100%)',
    homework: null,
    parts: 8,
  },
];

/** Blueprint id of each deck lesson (src/curriculum/academy): Season 1 episode = lesson number. */
export const ACADEMY_DECK_BLUEPRINT_IDS: Record<string, string> = { 'sign-me-up': 'A1-S01-E2', 'fake-or-real': 'A1-S01-E3' };

export const getAcademyDeckLesson = (id: string | undefined) => ACADEMY_DECK_LESSONS.find((l) => l.id === id);
