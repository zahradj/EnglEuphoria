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
  /** what the student does in the Mission (defaults to the objective when absent) */
  mission?: string;
}

/** One planned Pre-A1 Season (P1-P3 in the lean ladder). */
export interface PreA1Season {
  id: string;
  step: 'pre-a1';
  seasonNo: number;
  title: string;
  theme: string;
  cast: readonly string[];
  canDo: readonly string[];
  /** the fixed chunk or structure of the Season (a chunk first, analysed later) */
  chunk: string;
  /** what the student makes and keeps */
  release: string;
  /** sounds taught in this Season, and cumulative sounds up to and including it */
  sounds: readonly string[];
  soundsSoFar: readonly string[];
  /** whole words that cannot be blended yet */
  sightWords: readonly string[];
  decodable: readonly string[];
  /** games from docs/academy-games-catalog.md used in the Season (no game twice in a row) */
  games: readonly string[];
  /** the video-game mechanic borrowed (docs/academy-video-game-mechanics.md) */
  videoGameMechanic: string;
  episodes: PreA1Episode[];
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
  chunk: 'My name is ___.',
  release: "The Name Wall: my name and three friends' names, read and said",
  soundsSoFar: ['s', 'a', 't', 'p'],
  games: ['listen and match', 'read and match', 'spelling puzzle', 'memory pairs', 'sound-blend slider'],
  videoGameMechanic: 'Quest log: each solved name lights a letter on the Name Wall; loot-and-craft the letters into a name',
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

const E = (no: number, type: PreA1EpisodeType, name: string, objective: string, newItems: string[], clue: string, mission?: string, letters: string[] = [], sounds: string[] = []): PreA1Episode => ({ no, type, name, objective, newItems, letters, sounds, clue, mission });

/** Pre-A1 Season P2 "First sounds" (the phone): blend three-letter words from i n m d on top of s a t p. Research: docs/research/academy-pre-a1-s02-s03-research.md. */
export const PA1_S02: PreA1Season = {
  id: 'PA1-S02',
  step: 'pre-a1',
  seasonNo: 2,
  title: 'First sounds',
  theme: 'The Phone',
  cast: ['Vee', 'Theo', 'Ava'],
  canDo: [
    'I can hear and say the sounds i, n, m, d and blend them with s, a, t, p into words such as sit, pin, map, dad.',
    'I can say and read "This is a ___." for things on a phone screen.',
    'I can read a short text of five lines and answer questions with a picture.',
  ],
  chunk: 'This is a ___.',
  release: 'My phone-screen album: six labelled things I can read and say',
  sounds: ['i', 'n', 'm', 'd'],
  soundsSoFar: ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd'],
  sightWords: ['I', 'am', 'is', 'the', 'my', 'a', 'this', 'you'],
  decodable: ['sit', 'sat', 'pin', 'pan', 'man', 'map', 'mat', 'mad', 'dad', 'did', 'dip', 'tip', 'nap', 'tin', 'pit', 'pad', 'sad', 'and', 'in', 'it', 'dim', 'Sam', 'Tim', 'Dan', 'Pam'],
  games: ['sound-blend slider', 'listen and match', 'read and match', 'odd one out', 'memory pairs', 'reader page'],
  videoGameMechanic: 'Loot and crafting: collect sound tiles and craft words; a rhythm lane for tapping the sounds in order',
  episodes: [
    E(1, 'cold-open', 'Cold Open', 'I can meet the phone screen, hear i and n, and blend in, it, pin, tin.', ['phone', 'pin', 'tin', 'map', 'This is a ___.'], 'A message arrives with its first letters missing.', 'Tap the missing sound to open the message', ['I', 'N'], ['i', 'n']),
    E(2, 'word-lab', 'Word Lab', 'I can hear m and d and blend mat, man, dad, did.', ['man', 'mat', 'dad', 'did', 'app', 'camera'], 'Two words on the screen swap their first sound.', 'Craft three words from sound tiles', ['M', 'D'], ['m', 'd']),
    E(3, 'pattern-lab', 'Pattern Lab', 'I can say This is a ___ and swap the word: This is a map. This is a pin.', ['This is a ___.', 'Is it a ___?', 'Yes, it is.', 'No, it is not.'], 'A photo caption has one word wrong.', 'Fix three captions'),
    E(4, 'on-air', 'On Air', 'I can ask and answer with Theo: Is it a map? Yes, it is. No, it is not.', ['Sorry?', 'Again, please.', 'Look!'], 'Theo sends a blurry photo; what is it?', 'Guess the blurry photo with Theo in 4 turns'),
    E(5, 'deep-dive', 'Deep Dive', 'I can read five short lines and match each to its picture.', ['and', 'in', 'on'], 'A hidden caption is written under the photo.', 'Read the five lines aloud, then match'),
    E(6, 'side-quest', 'Side Quest', 'I can choose my skin and build and read three words of my own.', [], 'Your own photo gets its caption.', 'Choose a skin and caption three photos'),
    E(7, 'remix', 'Remix', 'I can mix the eight sounds, the chunk and the sight words.', [], 'The phone shows every message at once.', 'Boss round: ten quick blends'),
    E(8, 'finale', 'Finale', 'I can make my phone-screen album: six things, each read and said.', [], 'The sender of the messages is revealed: Vee.', 'Present the album to Ava'),
  ],
};

/** Pre-A1 Season P3 "Numbers and age" (the lockers): numerals 0-20 and their words, age, and a phone number digit by digit. */
export const PA1_S03: PreA1Season = {
  id: 'PA1-S03',
  step: 'pre-a1',
  seasonNo: 3,
  title: 'Numbers and age',
  theme: 'The Lockers',
  cast: ['Ava', 'Theo', 'Vee'],
  canDo: [
    'I can read and say the numbers 0 to 20, and tell thirteen from thirty.',
    'I can say my age and ask How old are you?',
    'I can say a phone number one digit at a time and write down one I hear.',
  ],
  chunk: 'I am ___. How old are you?',
  release: 'My locker card: my name, my age, my phone number, three friends\' ages',
  sounds: [],
  soundsSoFar: ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd'],
  sightWords: ['I', 'am', 'is', 'the', 'my', 'a', 'this', 'you', 'old', 'how', 'are'],
  decodable: ['sit', 'sat', 'pin', 'map', 'dad', 'did', 'it', 'in', 'and', 'Sam', 'Tim', 'Dan', 'Pam'],
  games: ['locker code', 'listen and match', 'read and match', 'number bingo', 'speedrun vs own best'],
  videoGameMechanic: 'Locker-code puzzle (escape room) and a speedrun against your own best time (no leaderboards)',
  episodes: [
    E(1, 'cold-open', 'Cold Open', 'I can meet the lockers and read the numbers 0 to 10.', ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'number'], 'Locker 7 is open. Whose is it?', 'Open three lockers with the right number'),
    E(2, 'word-lab', 'Word Lab', 'I can read and say 11 to 20 and hear thirteen versus thirty.', ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen'], 'A code has a thirteen where thirty should be.', 'Sort teen and ty numbers'),
    E(3, 'pattern-lab', 'Pattern Lab', 'I can say my age: I am fifteen. And ask: How old are you?', ['I am ___.', 'How old are you?', 'age', 'old'], 'The card says age, but the number is missing.', 'Ask Ava and Theo their age'),
    E(4, 'on-air', 'On Air', 'I can say and write down a phone number, one digit at a time.', ['phone number', 'Say it again, please.', 'Is that ___?'], 'Vee reads a number; one digit is lost.', 'Take down a phone number from Vee in 4 turns'),
    E(5, 'deep-dive', 'Deep Dive', 'I can read a locker list: name, age, number.', ['nineteen', 'twenty', 'ten'], 'The list shows who has locker 20.', 'Read the list and answer five picture questions'),
    E(6, 'side-quest', 'Side Quest', 'I can choose my skin and make a number card of my own.', [], 'Your own locker lights up.', 'Choose a skin and fill in my card'),
    E(7, 'remix', 'Remix', 'I can mix numbers, ages, phone numbers and the sounds from Seasons 1 and 2.', [], 'Every locker opens at once.', 'Speedrun against my own best'),
    E(8, 'finale', 'Finale', 'I can make my locker card and say it to a friend.', [], 'The locker owner is revealed: Ava.', 'Present my locker card'),
  ],
};

/** The planned Pre-A1 Seasons of the lean ladder (P1-P3), in order. P1 keeps its original spec (PA1_S01) above. */
export const PA1_SEASONS: readonly PreA1Season[] = [PA1_S01, PA1_S02, PA1_S03];
