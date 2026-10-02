import type { FirstSoundSceneData } from './FirstSoundScene';
import type { LetterBlocksSceneData, LetterMatchSceneData } from './LetterTilesScene';

/**
 * The Playground GAMES catalog. Right now it holds ONE game — the Alphabet
 * Express — a four-stop journey that strings the shared alphabet / phonics
 * scenes together (see reusableActivities.ts for the scene kinds themselves).
 * It is shown in the Games section of the Playground Library (creators + public
 * mirror) and on the student's own dashboard, from this one list.
 *
 * To add another game: add an entry with its own `stages`.
 */
export type GameScene = FirstSoundSceneData | LetterBlocksSceneData | LetterMatchSceneData;

export interface GameStage {
  id: string;
  /** Short place name on the journey map, e.g. "Letter Station". */
  station: string;
  title: string;
  blurb: string;
  /** Picture on the journey map. */
  art: string;
  /** How many things must be right (for the star rating). */
  units: number;
  scene: GameScene;
}

export interface LibraryGame {
  id: string;
  title: string;
  tagline: string;
  skill: string;
  levels: string[];
  /** Rough play time shown on the card. */
  minutes: string;
  gradient: string;
  /** 16:9 cover illustration: card banner and the title screen. */
  cover: string;
  /** Illustrations shown on the card. */
  art: string[];
  howToPlay: string[];
  stages: GameStage[];
}

const I = '/lep1/items';
const A = '/lep1/alphabet';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const LIBRARY_GAMES: LibraryGame[] = [
  {
    id: 'alphabet-express',
    title: 'Alphabet Express',
    tagline: 'Ride the train through four stops: learn the letters, match big and small, hear the sounds, and catch the first sound of words!',
    skill: 'Alphabet & Phonics',
    levels: ['Pre-A1', 'A1'],
    minutes: '12–18 min',
    gradient: 'linear-gradient(135deg,#3B82F6 0%,#8B5CF6 55%,#EC4899 100%)',
    cover: '/lep1/games/alphabet-express-cover.jpg',
    art: [`${I}/item-apple.png`, `${A}/item-zebra.png`, `${I}/item-moon.png`, `${I}/item-cat.png`],
    howToPlay: [
      'Every stop begins with a short tour: tap the letters to see them and hear them.',
      'Then play the stop. Drag, tap or catch the right answer. Wrong answers are okay: try again!',
      'Finish a stop to earn up to 3 stars and open the next stop.',
      'Reach the end of the line for your Alphabet Express star rating.',
    ],
    stages: [
      {
        id: 'letter-station',
        station: 'Letter Station',
        title: 'Alphabet Train',
        blurb: 'See every letter with its picture, then put the whole alphabet in order, A to Z.',
        art: `${I}/item-apple.png`,
        units: 26,
        scene: {
          id: 'express-letter-station',
          kind: 'letter-blocks',
          mode: 'letters',
          teacher: 'Visit every station, then couple the whole alphabet in order, A to Z.',
          rounds: [{ blocks: ALPHABET }],
        },
      },
      {
        id: 'letter-homes',
        station: 'Home Town',
        title: 'Letter Homes',
        blurb: 'Take each small letter home to its big letter.',
        art: `${I}/item-house.png`,
        units: 6,
        scene: {
          id: 'express-letter-homes',
          kind: 'letter-match',
          teacher: 'Take each small letter home to its big letter.',
          letters: ['A', 'D', 'M', 'P', 'S', 'T'],
        },
      },
      {
        id: 'sound-station',
        station: 'Sound Station',
        title: 'Sound Train',
        blurb: 'Hear the 26 letter sounds, then put them in ABC order.',
        art: `${A}/item-igloo.png`,
        units: 26,
        scene: {
          id: 'express-sound-station',
          kind: 'letter-blocks',
          mode: 'sounds',
          teacher: 'Listen to each letter sound, then couple the cars in ABC order.',
          rounds: [{ blocks: ALPHABET.map((l) => l.toLowerCase()) }],
        },
      },
      {
        id: 'fishing-bay',
        station: 'Fishing Bay',
        title: 'First Sound Fishing',
        blurb: 'Hear the word, then catch the fish with its first letter!',
        art: `${I}/item-moon.png`,
        units: 6,
        scene: {
          id: 'express-fishing-bay',
          kind: 'first-sound',
          teacher: 'Say the word with the student, then let them pick the first letter.',
          rounds: [
            { word: 'moon', letter: 'M', choices: ['M', 'H', 'S'], img: `${I}/item-moon.png` },
            { word: 'hat', letter: 'H', choices: ['H', 'M', 'T'], img: `${I}/item-hat.png` },
            { word: 'cat', letter: 'C', choices: ['C', 'S', 'M'], img: `${I}/item-cat.png` },
            { word: 'sun', letter: 'S', choices: ['S', 'C', 'H'], img: `${I}/item-sun.png` },
            { word: 'apple', letter: 'A', choices: ['A', 'M', 'T'], img: `${I}/item-apple.png` },
            { word: 'ball', letter: 'B', choices: ['B', 'S', 'M'], img: `${I}/item-ball.png` },
          ],
        },
      },
    ],
  },
];

export function getLibraryGame(id: string | undefined): LibraryGame | undefined {
  return LIBRARY_GAMES.find((g) => g.id === id);
}

/** 3 stars = (almost) flawless, 2 = a few slips, 1 = finished. */
export function starsFor(mistakes: number, units: number): 1 | 2 | 3 {
  if (mistakes <= Math.floor(units * 0.05)) return 3;
  if (mistakes <= Math.ceil(units * 0.3)) return 2;
  return 1;
}
