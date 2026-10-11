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
    lesson: 1,
    title: 'Sign Me Up',
    blurb: 'Meet Vee, join the club: numbers 1–100, nationalities, classroom words, a sign-up mission and a voice note.',
    level: 'A1',
    minutes: 60,
    cover: '/academy-art/bg/club-signup-desk.webp',
    gradient: 'linear-gradient(135deg,#2e1065 0%,#6d28d9 55%,#38bdf8 100%)',
    homework: { title: 'Sign Me Up · homework quest', blurb: 'Five chests over three weeks: numbers, nationalities, classroom words and a big check.' },
    parts: 8,
  },
];

export const getAcademyDeckLesson = (id: string | undefined) => ACADEMY_DECK_LESSONS.find((l) => l.id === id);
