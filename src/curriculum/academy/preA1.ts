// Pre-A1 Season P1 "Hello, letters" (the Name Wall): the Season spec as data, read by the lesson tests (owner 2026-10-12).
// Plan, theme and research: docs/academy-pre-a1-s01-spec.md, docs/research/academy-pre-a1-s01-research.md. The Pre-A1 step has no Seasons in the roadmap code yet
// (ladder.ts: plannedTitles), so this module holds the Season until AcademyLevel gets a 'Pre-A1' member. Imports nothing outside src/curriculum/academy/.
export type PreA1EpisodeType = 'cold-open' | 'word-lab' | 'pattern-lab' | 'on-air' | 'deep-dive' | 'side-quest' | 'remix' | 'finale';

export interface PreA1Episode {
  no: number;
  type: PreA1EpisodeType;
  name: string;
  objective: string;
  /** new words / chunks (at most 8 per session, Pre-A1 rule) */
  newItems: string[];
  /** letter NAMES met in this episode */
  letters: string[];
  /** letter SOUNDS met in this episode (blending) */
  sounds: string[];
  clue: string;
}

export const PRE_A1_MAX_NEW_ITEMS = 8;

export const PA1_S01 = {
  id: 'PA1-S01',
  step: 'pre-a1',
  seasonNo: 1,
  title: 'Hello, letters',
  theme: 'The Name Wall',
  cast: ['Vee', 'Ava', 'Theo'] as const,
  canDo: [
    'I can say hello and say my name: Hello! My name is ___.',
    'I can say the names of the letters in my name and spell it.',
    'I can hear and say the sounds s, a, t, p and blend them into words.',
    'I can read a short line of 3-5 words and match it to a picture.',
  ],
  /** sounds taught in this Season, in order, and the whole words (sight words) */
  sounds: ['s', 'a', 't', 'p'],
  sightWords: ['I', 'am', 'is', 'the', 'my'],
  decodable: ['at', 'as', 'sat', 'pat', 'tap', 'sap', 'pats', 'taps', 'spat', 'past'],
  episodes: [
    { no: 1, type: 'cold-open', name: 'Cold Open', objective: 'I can meet the Name Wall, say hello and my name, and hear the letters A to G.', newItems: ['hello', 'hi', 'bye', 'My name is', 'I am'], letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], sounds: [], clue: 'The wall flashes the letter A. Whose name starts with A? Ava!' },
    { no: 2, type: 'word-lab', name: 'Word Lab', objective: 'I can say yes and no, name a boy, a girl and a friend, and hear s and a.', newItems: ['yes', 'no', 'boy', 'girl', 'friend'], letters: ['H', 'I', 'J', 'K', 'L', 'M', 'N'], sounds: ['s', 'a'], clue: 'A name on the wall is missing its vowel.' },
    { no: 3, type: 'pattern-lab', name: 'Pattern Lab', objective: 'I can spell my name, hear t and p, and blend at, sat, pat, tap.', newItems: ['thanks', 'please', 'How do you spell it?'], letters: ['O', 'P', 'Q', 'R', 'S', 'T'], sounds: ['t', 'p'], clue: 'One name is mixed up: T-A-P.' },
    { no: 4, type: 'on-air', name: 'On Air', objective: 'I can say a short hello dialogue with Theo: hello, my name is, how do you spell it, thanks.', newItems: ['Nice to meet you.', 'Me too.', 'Sorry?'], letters: ['U', 'V', 'W', 'X', 'Y', 'Z'], sounds: [], clue: 'Theo\'s name appears backwards on the wall.' },
    { no: 5, type: 'deep-dive', name: 'Deep Dive', objective: 'I can read a first text of five short lines and match each line to its picture.', newItems: ['the', 'is', 'a'], letters: [], sounds: [], clue: 'A hidden sentence is written on the wall.' },
    { no: 6, type: 'side-quest', name: 'Side Quest', objective: 'I can choose my skin and read and build my own name and a friend\'s name.', newItems: [], letters: [], sounds: [], clue: 'Your own name lights up on the wall.' },
    { no: 7, type: 'remix', name: 'Remix', objective: 'I can mix letters, sounds, hello chunks and four decodable words.', newItems: [], letters: [], sounds: [], clue: 'The wall asks for three names.' },
    { no: 8, type: 'finale', name: 'Finale', objective: 'I can build the Name Wall: my name and three friends\' names, and say Hello! My name is ___.', newItems: [], letters: [], sounds: [], clue: 'The wall shows who wrote the names: Vee.' },
  ] as PreA1Episode[],
} as const;
