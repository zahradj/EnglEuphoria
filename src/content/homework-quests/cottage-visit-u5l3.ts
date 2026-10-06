import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const living = `${S}/bg-u5l3-living-wide.png`;
const garden = `${S}/bg-u5l3-garden-wide.png`;
const grandma = `${S}/bg-u5l3-grandma-wide.png`;
const grandpa = `${S}/bg-u5l3-grandpa-wide.png`;
const hug = `${S}/bg-u5l3-hug-wide.png`;

/** Pre-A1 Unit 5 Lesson 3 "Grandma & Grandpa!" — Cottage Visit Quest.
 *  Practises grandma, grandpa, "This is my grandma!", "Hello, Grandpa!" and
 *  the G sound. */
export const QUEST_COTTAGE_VISIT_U5L3: HomeworkQuest = {
  id: 'cottage-visit-u5l3',
  title: 'Cottage Visit Quest',
  subtitle: 'Grandma & Grandpa! · Pre-A1 Unit 5 · Lesson 3',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-5-3',
  theme: { accent: '#A855F7', accent2: '#F59E0B', night: false, mapImg: garden, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'tap-hotspot', name: 'Who Is It?', icon: '🛋️', intro: 'Listen. Tap the right one in the picture!', img: living, aspect: 1376 / 768,
      spots: [
        { label: 'grandma', box: { x: 18, y: 18, w: 24, h: 70 } },
        { label: 'Pip', box: { x: 42, y: 30, w: 16, h: 62 } },
        { label: 'grandpa', box: { x: 58, y: 15, w: 24, h: 73 } },
      ],
      rounds: [
        { target: 'grandpa', line: 'This is my grandpa!' },
        { target: 'grandma', line: 'This is my grandma!' },
        { target: 'Pip', line: 'This is me, Pip!' },
      ] },
    { kind: 'picture-choice', name: 'Hello!', icon: '👋', intro: 'Listen. Tap the right picture!', img: living,
      rounds: [
        { line: 'Hello, Grandma!', answer: 'grandma', options: [{ label: 'grandpa', src: grandpa }, { label: 'grandma', src: grandma }, { label: 'hug', src: hug }] },
        { line: 'Hello, Grandpa!', answer: 'grandpa', options: [{ label: 'grandpa', src: grandpa }, { label: 'hug', src: hug }, { label: 'grandma', src: grandma }] },
        { line: 'Big hug!', answer: 'hug', options: [{ label: 'grandma', src: grandma }, { label: 'grandpa', src: grandpa }, { label: 'hug', src: hug }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: grandma, line: 'This is my grandma!', isTrue: true },
        { img: grandpa, line: 'This is my grandma!', isTrue: false },
        { img: grandpa, line: 'This is my grandpa!', isTrue: true },
        { img: hug, line: 'I love my grandma and grandpa!', isTrue: true },
      ] },
    { kind: 'sound-choice', name: 'G or S?', icon: '🎁', intro: 'Listen to the word. Which sound does it start with?', img: garden, choices: ['G', 'S'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'gift', answer: 'G', picture: `${I}/item-gift.png` },
        { word: 'sun', answer: 'S', picture: `${I}/item-sun.png` },
        { word: 'goat', answer: 'G', picture: `${I}/item-goat.png` },
        { word: 'snake', answer: 'S', picture: `${I}/item-snake.png` },
        { word: 'guitar', answer: 'G', picture: `${I}/item-guitar.png` },
      ] },
    { kind: 'treasure', name: "Grandma's Chest", icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: garden, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! I love my grandma and grandpa! Big hug!' },
  ],
};
