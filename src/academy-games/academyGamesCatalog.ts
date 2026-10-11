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
  {
    id: 'sound-lab',
    title: 'Sound Lab',
    tagline: 'Train your ears to hear the sounds that change a word: ship or sheep, pack or back, ban or van, think or sink. Crack four locks, in three voices.',
    skill: 'Pronunciation · Listening',
    levels: ['A1', 'A2', 'B1'],
    minutes: '15–20 min',
    gradient: 'linear-gradient(135deg,#134e4a 0%,#0e7490 50%,#1e3a8a 100%)',
    cover: '/academy/games/sound-lab-cover.jpg',
    method: 'Ears first: listen in three voices → pick the word you hear → same or different? → say it (private, never scored).',
    howToPlay: [
      'Listen: hear the two sounds of the lock in three different voices.',
      'Pick the pin: hear one word and choose which word it was.',
      'Same or different? Hear two words and decide if they are the same word.',
      'Say it: record yourself and compare with the model. Your voice stays on your device and is never scored.',
    ],
  },
  {
    id: 'twister-lab',
    title: 'Twister Lab',
    tagline: 'Tongue twisters, step by step: hear them chunk by chunk, build them, spell them from memory, then record yourself three ways. Clear first, fast later.',
    skill: 'Pronunciation · Spelling',
    levels: ['A1', 'A2', 'B1'],
    minutes: '15–20 min',
    gradient: 'linear-gradient(135deg,#831843 0%,#be185d 50%,#f59e0b 100%)',
    cover: '/academy/games/twister-lab-cover.jpg',
    method: 'Hear it in chunks → build it → write it from memory and fix the spelling → say it slowly, normally, then faster (private, never scored).',
    howToPlay: [
      'Listen: hear the twister slowly, chunk by chunk, then at speed, in two voices.',
      'Build it: tap the chunks in the right order.',
      'Spell it: type the twister from memory. You see every word checked, with the letters to fix.',
      'Say it: record three takes and listen to yourself. Your voice stays on your device and is never scored.',
    ],
  },
  {
    id: 'time-hop',
    title: 'Time Hop',
    tagline: 'Hop between present and past. Learn every verb as a pair (go – went), the four rules for regular verbs, and the time words that tell you which form to use.',
    skill: 'Grammar · Verbs',
    levels: ['A1', 'A2'],
    minutes: '15–20 min',
    gradient: 'linear-gradient(135deg,#312e81 0%,#4338ca 50%,#0891b2 100%)',
    cover: '/academy/games/time-hop-cover.jpg',
    method: 'Learn as pairs → learn the -ed spelling rules → read the time word → type it from memory in both directions → come back tomorrow (spaced review).',
    howToPlay: [
      'Twin Match: match each present word with its past twin (go – went).',
      'Past Rules: choose the right spelling of regular verbs (walked, liked, studied, stopped).',
      'Time Gate: "every day" or "yesterday"? Choose the form the time word asks for.',
      'Recall: type the past from the present, and the present from the past. Slips come back in the Memory Vault.',
    ],
  },
  {
    id: 'sign-me-up',
    title: 'Sign Me Up · full lesson',
    tagline: 'Season 1 · the whole 60-minute A1 lesson as a story game: meet Vee, numbers 1–100, nationalities, classroom words, a sign-up mission and a voice note. Recorded voices.',
    skill: 'Full lesson · Speaking · Numbers',
    levels: ['A1'],
    minutes: '60 min',
    gradient: 'linear-gradient(135deg,#2e1065 0%,#6d28d9 55%,#38bdf8 100%)',
    cover: '/academy-art/bg/phone-profile-closeup.webp',
    method: 'Remember → words → model → play (lockers, flags, detective) → Mission with Take 1 and Take 2 → Release → Wrap.',
    howToPlay: [
      'Play it with your teacher in class (share your screen) or on your own.',
      'Press Next when a part is finished. Hint and "I need a minute" are always there.',
      'Tap the speaker to hear any line again.',
    ],
  },
  {
    id: 'sign-me-up-homework',
    title: 'Sign Me Up · homework quest',
    tagline: 'Five chests to open over three weeks: numbers, nationalities, classroom words and a big check. Short games, a few minutes a day.',
    skill: 'Homework · Review',
    levels: ['A1'],
    minutes: '5–10 min a day',
    gradient: 'linear-gradient(135deg,#1e1b4b 0%,#7c3aed 55%,#fbbf24 120%)',
    cover: '/academy-art/bg/phone-profile-closeup.webp',
    method: 'Spaced review: each chest unlocks on a later day (day 1, 3, 7, 10, 21).',
    howToPlay: ['Open a chest when it unlocks.', 'Play the short games.', 'Earn stars; come back for the next chest.'],
  },
];

export const getAcademyGame = (id: string | undefined) => ACADEMY_GAMES.find((g) => g.id === id);
