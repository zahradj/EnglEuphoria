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
    id: 'pa1-s01-e1',
    season: 1,
    lesson: 1,
    title: 'Hello, letters · Cold Open',
    blurb: 'Pre-A1: meet the Name Wall, say hello and your name, hear the letters A to G, read three names. Slower, with reading.',
    level: 'Pre-A1',
    minutes: 60,
    cover: '/academy-art/bg/name-wall.webp',
    gradient: 'linear-gradient(135deg,#312e81 0%,#7c3aed 55%,#f59e0b 100%)',
    homework: null,
    parts: 8,
  },
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
  {
    id: 'sign-me-up-2',
    season: 1,
    lesson: 1,
    title: 'Sign Me Up · Sample 2',
    blurb: 'The rewrite: the same sign-up mission with only 14 new words, two games after every word set, and three lanes (Start, Core, Stretch) you can switch any time.',
    level: 'A1',
    minutes: 60,
    cover: '/academy-art/bg/club-signup-desk.webp',
    gradient: 'linear-gradient(135deg,#0f172a 0%,#4338ca 50%,#22d3ee 100%)',
    homework: null,
    parts: 8,
  },
  {
    id: 'fake-or-real',
    season: 1,
    lesson: 2,
    title: 'Fake or Real?',
    blurb: 'Check a fake profile with Ava and Theo: say who is who with am, is and are, say what is not true, and ask and answer yes / no questions.',
    level: 'A1',
    minutes: 60,
    cover: '/academy-art/bg/detective-wall.webp',
    gradient: 'linear-gradient(135deg,#1e1b4b 0%,#4f46e5 50%,#a78bfa 100%)',
    homework: null,
    parts: 8,
  },
  {
    id: 'free-time-club-1',
    season: 3,
    lesson: 1,
    title: 'Club Fair · Cold Open',
    blurb: 'Free Time Club: watch the Club Fair story, meet the hobby words, learn the rule I like… and I love…, and tell Theo which club you would join.',
    level: 'A1',
    minutes: 60,
    cover: '/academy-art/bg/club-lobby.webp',
    gradient: 'linear-gradient(135deg,#2e1065 0%,#7c3aed 50%,#14b8a6 100%)',
    homework: null,
    parts: 8,
  },
  {
    id: 'free-time-club-2',
    season: 3,
    lesson: 2,
    title: 'Hobby Wall · Word Lab',
    blurb: 'Free Time Club: 14 hobby words with pictures, the rule play / go / like + -ing, many matching games, and your own hobby card for Ava.',
    level: 'A1',
    minutes: 60,
    cover: '/academy-art/bg/club-stage.webp',
    gradient: 'linear-gradient(135deg,#1e1b4b 0%,#6d28d9 50%,#14b8a6 100%)',
    homework: null,
    parts: 8,
  },
  {
    id: 'last-weekend-1',
    season: 1,
    lesson: 1,
    title: 'The Photo Wall · Cold Open',
    blurb: 'Last Weekend: Ava has 20 photos and no memory of the weekend. Walk the photo wall, meet the place and event words, learn the rule for the past (was, were, -ed) and tell Theo your guess.',
    level: 'A2',
    minutes: 60,
    cover: '/academy-art/bg/weekend-gallery.webp',
    gradient: 'linear-gradient(135deg,#2e1065 0%,#7c3aed 50%,#14b8a6 100%)',
    homework: null,
    parts: 8,
  },
];

/** Blueprint id of each deck lesson (src/curriculum/academy). The library numbers lessons in the order they were built (Sign Me Up = Lesson 1, Fake or Real? = Lesson 2); the blueprint episodes are E2 and E3. */
export const ACADEMY_DECK_BLUEPRINT_IDS: Record<string, string> = { 'pa1-s01-e1': 'PA1-S01-E1', 'sign-me-up': 'A1-S01-E2', 'sign-me-up-2': 'A1-S01-E2', 'fake-or-real': 'A1-S01-E3', 'free-time-club-1': 'A1-S03-E1', 'free-time-club-2': 'A1-S03-E2', 'last-weekend-1': 'A2-S01-E1' };

export const getAcademyDeckLesson = (id: string | undefined) => ACADEMY_DECK_LESSONS.find((l) => l.id === id);
