import type { FirstSoundSceneData } from './FirstSoundScene';
import type { LetterBlocksSceneData, LetterMatchSceneData } from './LetterTilesScene';
import type { SortBasket, SortBasketSceneData, SortItem } from './SortBasketScene';
import type { WhatsMissingItem, WhatsMissingRound, WhatsMissingSceneData } from './WhatsMissingScene';

/**
 * The Playground GAMES catalog. Right now it holds ONE game — the Alphabet
 * Express — a four-stop journey that strings the shared alphabet / phonics
 * scenes together (see reusableActivities.ts for the scene kinds themselves).
 * It is shown in the Games section of the Playground Library (creators + public
 * mirror) and on the student's own dashboard, from this one list.
 *
 * To add another game: add an entry with its own `stages`.
 */
export type GameScene = FirstSoundSceneData | LetterBlocksSceneData | LetterMatchSceneData | WhatsMissingSceneData | SortBasketSceneData;

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

/* ------------------------------------------------------------------ Magic Show */

const it = (word: string, file: string): WhatsMissingItem => ({ word, img: `/lep1/items/${file}` });

const TOYS = [it('ball', 'item-ball.png'), it('teddy', 'item-teddy.png'), it('doll', 'item-doll.png'), it('car', 'item-car.png'), it('train', 'item-train.png'), it('blocks', 'item-blocks.png')];
const FOOD = [it('apple', 'item-apple.png'), it('orange', 'item-orange.png'), it('grapes', 'item-grapes.png'), it('pizza', 'item-pizza.png'), it('popcorn', 'item-popcorn-yellow.png'), it('milk', 'item-milk.png')];
const ANIMALS = [it('cat', 'item-cat.png'), it('duck', 'item-duck-yellow.png'), it('bear', 'item-bear.png'), it('turtle', 'item-turtle.svg'), it('snake', 'item-snake.png'), it('butterfly', 'item-butterfly.svg')];
const THINGS = [it('book', 'item-book.png'), it('hat', 'item-hat.png'), it('bag', 'item-bag.png'), it('ring', 'item-ring.png'), it('rose', 'item-rose.png'), it('tree', 'item-tree.svg')];

/** Each trick shows a few pictures from the pool; `miss` is the position (within the shown set) that vanishes.
 *  The sets grow from 3 to 5 pictures so every stop gets a little harder. */
function tricks(pool: WhatsMissingItem[], plan: { set: number[]; miss: number }[]): WhatsMissingRound[] {
  return plan.map((p) => ({ items: p.set.map((i) => pool[i]), missing: p.miss }));
}
const PLAN_A = [{ set: [0, 1, 2], miss: 1 }, { set: [3, 4, 5], miss: 0 }, { set: [0, 2, 3, 4], miss: 3 }, { set: [1, 2, 3, 4, 5], miss: 2 }];
const PLAN_B = [{ set: [0, 1, 2], miss: 2 }, { set: [2, 3, 4], miss: 0 }, { set: [0, 1, 4, 5], miss: 1 }, { set: [0, 1, 2, 3, 5], miss: 4 }];

/* ------------------------------------------------------------------ Market Sort */

const sb = (word: string, file: string, basket: number): SortItem => ({ word, img: `/lep1/items/${file}`, basket });
const TOYS_BASKET: SortBasket = { label: 'toys', emoji: '🧸' };
const FOOD_BASKET: SortBasket = { label: 'food', emoji: '🍎' };
const ANIMAL_BASKET: SortBasket = { label: 'animals', emoji: '🐾' };
const THING_BASKET: SortBasket = { label: 'things', emoji: '🎒' };

function marketSort(): LibraryGame {
  const stop = (id: string, station: string, title: string, blurb: string, baskets: SortBasket[], items: SortItem[]): GameStage => ({
    id,
    station,
    title,
    blurb,
    art: items[0].img!,
    units: items.length,
    scene: { id: `market-${id}`, kind: 'sort-basket', teacher: `Name each picture with the student, then let them tap the right basket (${baskets.map((b) => b.label).join(' or ')}).`, title: station, bg: '/lep1/games/market-sort-cover.jpg', baskets, items },
  });
  return {
    id: 'market-sort',
    title: 'Market Sort',
    tagline: 'Customers are waiting! Sort every picture into the right basket: toys, food, animals and things.',
    skill: 'Vocabulary & Categories',
    levels: ['Pre-A1', 'A1'],
    minutes: '8–12 min',
    gradient: 'linear-gradient(135deg,#16A34A 0%,#84CC16 50%,#F59E0B 100%)',
    cover: '/lep1/games/market-sort-cover.jpg',
    art: [`/lep1/items/item-teddy.png`, `/lep1/items/item-pizza.png`, `/lep1/items/item-duck-yellow.png`, `/lep1/items/item-book.png`],
    howToPlay: [
      'Listen to the names of the baskets.',
      'A picture arrives on the counter and you hear its name.',
      'Tap the basket where it belongs. Wrong? That is okay: try again!',
      'Sort every picture at each stop to earn your stars.',
    ],
    stages: [
      stop('toy-or-food', 'Toys or Food', 'Market Sort: Toys & Food', 'Is it a toy, or is it food?', [TOYS_BASKET, FOOD_BASKET], [
        sb('ball', 'item-ball.png', 0), sb('apple', 'item-apple.png', 1), sb('teddy', 'item-teddy.png', 0), sb('pizza', 'item-pizza.png', 1),
        sb('car', 'item-car.png', 0), sb('milk', 'item-milk.png', 1), sb('doll', 'item-doll.png', 0), sb('grapes', 'item-grapes.png', 1),
      ]),
      stop('animal-or-thing', 'Animals or Things', 'Market Sort: Animals & Things', 'Is it an animal, or is it a thing?', [ANIMAL_BASKET, THING_BASKET], [
        sb('cat', 'item-cat.png', 0), sb('book', 'item-book.png', 1), sb('duck', 'item-duck-yellow.png', 0), sb('bag', 'item-bag.png', 1),
        sb('bear', 'item-bear.png', 0), sb('hat', 'item-hat.png', 1), sb('snake', 'item-snake.png', 0), sb('ring', 'item-ring.png', 1),
      ]),
      stop('three-baskets', 'Three Baskets', 'Market Sort: Three Baskets', 'Toys, food or animals? Now there are three baskets!', [TOYS_BASKET, FOOD_BASKET, ANIMAL_BASKET], [
        sb('train', 'item-train.png', 0), sb('orange', 'item-orange.png', 1), sb('mouse', 'item-mouse.png', 2), sb('blocks', 'item-blocks.png', 0),
        sb('popcorn', 'item-popcorn-yellow.png', 1), sb('cat', 'item-cat.png', 2), sb('ball', 'item-ball.png', 0), sb('apple', 'item-apple.png', 1), sb('bear', 'item-bear.png', 2),
      ]),
      stop('market-day', 'Market Day', 'Market Sort: Market Day', 'The big market! Toys, animals or things?', [TOYS_BASKET, ANIMAL_BASKET, THING_BASKET], [
        sb('teddy', 'item-teddy.png', 0), sb('duck', 'item-duck-yellow.png', 1), sb('hat', 'item-hat.png', 2), sb('doll', 'item-doll.png', 0),
        sb('snake', 'item-snake.png', 1), sb('bag', 'item-bag.png', 2), sb('car', 'item-car.png', 0), sb('mouse', 'item-mouse.png', 1), sb('book', 'item-book.png', 2), sb('ring', 'item-ring.png', 2),
      ]),
    ],
  };
}

function magicShow(): LibraryGame {
  const stop = (id: string, station: string, title: string, blurb: string, pool: WhatsMissingItem[], plan: typeof PLAN_A): GameStage => ({
    id,
    station,
    title,
    blurb,
    art: pool[0].img!,
    units: plan.length,
    scene: { id: `magic-${id}`, kind: 'whats-missing', teacher: `Say the ${station.toLowerCase()} words together, press Hide, then let the student find what vanished.`, title: station, bg: '/lep1/games/magic-show-cover.jpg', rounds: tricks(pool, plan) },
  });
  return {
    id: 'magic-show',
    title: 'Magic Show',
    tagline: "Watch the curtains close. One thing vanishes! Can you remember what's missing?",
    skill: 'Memory & Vocabulary',
    levels: ['Pre-A1', 'A1'],
    minutes: '8–12 min',
    gradient: 'linear-gradient(135deg,#6D28D9 0%,#C026D3 55%,#F59E0B 100%)',
    cover: '/lep1/games/magic-show-cover.jpg',
    art: [`/lep1/items/item-ball.png`, `/lep1/items/item-teddy.png`, `/lep1/items/item-apple.png`, `/lep1/items/item-cat.png`],
    howToPlay: [
      'Listen to each word and look at every picture.',
      'Press "Hide!" and watch the curtains close. One picture vanishes!',
      'When the curtains open, tap the picture that is missing.',
      'Finish four tricks at every stop to earn your stars.',
    ],
    stages: [
      stop('toy-box', 'Toy Box', 'Magic Show: Toys', 'Toys on the stage. Which one disappears?', TOYS, PLAN_A),
      stop('fruit-stand', 'Fruit Stand', 'Magic Show: Food', 'Yummy things on the stage. Which one disappears?', FOOD, PLAN_B),
      stop('animal-park', 'Animal Park', 'Magic Show: Animals', 'Animal friends on the stage. Which one disappears?', ANIMALS, PLAN_A),
      stop('treasure-chest', 'Treasure Chest', 'Magic Show: Things', 'Treasures on the stage. Which one disappears?', THINGS, PLAN_B),
    ],
  };
}

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
  magicShow(),
  marketSort(),
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
