/**
 * The Academy hub's built-in games (they ship with the app, no teacher publishing step): shown in the student's
 * Game Library when the student is in the Academy hub, and playable from there. Data only (no React), so the
 * voice-baking script, the tests and the library can all read it.
 */
export interface AcademyGame {
  id: string;
  title: string;
  tagline: string;
  skill: string;
  levels: string[];
  minutes: string;
  /** CSS gradient behind the cover. */
  gradient: string;
  /** 16:9 cover picture. */
  cover: string;
  /** The memory method the game is built on, in one line. */
  method: string;
  howToPlay: string[];
}

export const ACADEMY_GAMES: AcademyGame[] = [
  {
    id: 'verb-forge',
    title: 'Verb Forge',
    tagline: 'Forge the three forms of regular and irregular verbs: base, past simple and past participle. Remember them faster with families, recall and a Memory Vault.',
    skill: 'Grammar · Irregular verbs',
    levels: ['A2', 'B1'],
    minutes: '12–18 min',
    gradient: 'linear-gradient(135deg,#4c1d95 0%,#9333ea 45%,#ea580c 100%)',
    cover: '/academy/games/verb-forge-cover.jpg',
    method: 'Group by family → hear it → type it from memory → use it in a sentence → come back tomorrow (spaced review).',
    howToPlay: [
      'Pattern Forge: look at the three forms and name the pattern (A–A–A, A–B–B, A–B–C, A–B–A or regular).',
      'Family Forge: learn verbs in sound families such as sing–sang–sung.',
      'Memory Forge: type the forms from memory. Slips go to the Memory Vault and come back later.',
      'Sentence Forge: choose the form that fits the sentence (past time or "have").',
    ],
  },
];

export const getAcademyGame = (id: string | undefined) => ACADEMY_GAMES.find((g) => g.id === id);
