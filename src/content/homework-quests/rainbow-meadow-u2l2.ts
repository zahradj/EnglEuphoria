import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const meadow = `${S}/bg-u2l2-meadow-wide.png`;

/** Pre-A1 Unit 2 Lesson 2 "Green, Orange, Purple!" — Pip's Paint Pot Quest.
 *  Practises only what the lesson taught: green, orange, purple (frog,
 *  carrot, grapes, leaf, pumpkin, plum), "What color is it? — It's green.",
 *  "I like purple.", and the /g/ sound. */
export const QUEST_RAINBOW_MEADOW_U2L2: HomeworkQuest = {
  id: 'rainbow-meadow-u2l2',
  title: 'Pip’s Paint Pot Quest',
  subtitle: 'Green, Orange, Purple! · Pre-A1 Unit 2 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-2-2',
  theme: { accent: '#22C55E', accent2: '#A855F7', night: false, mapImg: meadow, guide: `${C}/pip-hello.png`, walker: `${C}/mia-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Find the Color', icon: '🎨', intro: 'Listen. Tap the right color!', img: meadow,
      rounds: [
        { line: 'Find green.', answer: 'Frog', options: [{ label: 'Carrot', src: `${I}/item-carrot.png` }, { label: 'Frog', src: `${I}/item-frog.png` }, { label: 'Grapes', src: `${I}/item-grapes.png` }] },
        { line: 'Find orange.', answer: 'Pumpkin', options: [{ label: 'Pumpkin', src: `${I}/item-pumpkin.png` }, { label: 'Plum', src: `${I}/item-plum.png` }, { label: 'Leaf', src: `${I}/item-leaf.png` }] },
        { line: 'Find purple.', answer: 'Plum', options: [{ label: 'Leaf', src: `${I}/item-leaf.png` }, { label: 'Carrot', src: `${I}/item-carrot.png` }, { label: 'Plum', src: `${I}/item-plum.png` }] },
        { line: 'Find green.', answer: 'Leaf', options: [{ label: 'Grapes', src: `${I}/item-grapes.png` }, { label: 'Leaf', src: `${I}/item-leaf.png` }, { label: 'Pumpkin', src: `${I}/item-pumpkin.png` }] },
      ] },
    { kind: 'true-false', name: 'True or False', icon: '⚖️', intro: 'Look and listen. True or false?',
      rounds: [
        { img: `${S}/bg-u2l2-green-wide.png`, line: 'The frog is green.', isTrue: true },
        { img: `${S}/bg-u2l2-orange-wide.png`, line: 'The carrot is purple.', isTrue: false },
        { img: `${S}/bg-u2l2-purple-wide.png`, line: 'The grapes are purple.', isTrue: true },
        { img: `${S}/bg-u2l2-green-wide.png`, line: 'The frog is orange.', isTrue: false },
      ] },
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: `${S}/bg-u2l2-green-wide.png`, line: 'What color is it?', extra: ['frog'] },
        { img: `${S}/bg-u2l2-green-wide.png`, line: 'It’s green.', extra: ['red'] },
        { img: `${S}/bg-u2l2-purple-wide.png`, line: 'I like purple.', extra: ['orange'] },
      ] },
    { kind: 'sound-choice', name: 'G, R, or B?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: meadow, choices: ['G', 'R', 'B'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'green', answer: 'G', picture: `${I}/item-leaf.png` },
        { word: 'red', answer: 'R', emoji: '🔴' },
        { word: 'grapes', answer: 'G', picture: `${I}/item-grapes.png` },
        { word: 'blue', answer: 'B', emoji: '🔵' },
        { word: 'goat', answer: 'G', emoji: '🐐' },
      ] },
    { kind: 'treasure', name: 'Paint Box', icon: `${K}/chest-closed.png`, intro: 'Tap the paint box to open it!', img: meadow, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! Green, orange, purple! Great painting!' },
  ],
};
