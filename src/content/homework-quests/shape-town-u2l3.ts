import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const town = `${S}/bg-u2l3-town-wide.png`;

/** Pre-A1 Unit 2 Lesson 3 "Circle, Square, Triangle!" — Shape Town Quest.
 *  Practises only what the lesson taught: circle, square, triangle (clock,
 *  window, pizza, cookie, present, flag), "What shape is it? — It's a
 *  circle.", "I like circles.", and C saying /k/. */
export const QUEST_SHAPE_TOWN_U2L3: HomeworkQuest = {
  id: 'shape-town-u2l3',
  title: 'Shape Town Quest',
  subtitle: 'Circle, Square, Triangle! · Pre-A1 Unit 2 · Lesson 3',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-2-3',
  theme: { accent: '#3B82F6', accent2: '#EF4444', night: false, mapImg: town, guide: `${C}/pip-hello.png`, walker: `${C}/bella-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Find the Shape', icon: '🔺', intro: 'Listen. Tap the right shape!', img: town,
      rounds: [
        { line: 'Find a circle.', answer: 'Clock', options: [{ label: 'Window', src: `${I}/item-window.png` }, { label: 'Clock', src: `${I}/item-clock.png` }, { label: 'Pizza', src: `${I}/item-pizza-slice.png` }] },
        { line: 'Find a square.', answer: 'Present', options: [{ label: 'Present', src: `${I}/item-present.png` }, { label: 'Flag', src: `${I}/item-flag.png` }, { label: 'Cookie', src: `${I}/item-cookie.png` }] },
        { line: 'Find a triangle.', answer: 'Flag', options: [{ label: 'Cookie', src: `${I}/item-cookie.png` }, { label: 'Window', src: `${I}/item-window.png` }, { label: 'Flag', src: `${I}/item-flag.png` }] },
        { line: 'Find a circle.', answer: 'Cookie', options: [{ label: 'Pizza', src: `${I}/item-pizza-slice.png` }, { label: 'Cookie', src: `${I}/item-cookie.png` }, { label: 'Present', src: `${I}/item-present.png` }] },
      ] },
    { kind: 'true-false', name: 'True or False', icon: '⚖️', intro: 'Look and listen. True or false?',
      rounds: [
        { img: `${S}/bg-u2l3-clock-wide.png`, line: 'The clock is a circle.', isTrue: true },
        { img: `${S}/bg-u2l3-window-wide.png`, line: 'The window is a triangle.', isTrue: false },
        { img: `${S}/bg-u2l3-pizza-wide.png`, line: 'The pizza is a triangle.', isTrue: true },
        { img: `${S}/bg-u2l3-clock-wide.png`, line: 'The clock is a square.', isTrue: false },
      ] },
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: `${S}/bg-u2l3-clock-wide.png`, line: 'What shape is it?', extra: ['color'] },
        { img: `${S}/bg-u2l3-clock-wide.png`, line: 'It’s a circle.', extra: ['square'] },
        { img: `${S}/bg-u2l3-pizza-wide.png`, line: 'I like triangles.', extra: ['circle'] },
      ] },
    { kind: 'sound-choice', name: 'C, G, or R?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: town, choices: ['C', 'G', 'R'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'clock', answer: 'C', picture: `${I}/item-clock.png` },
        { word: 'green', answer: 'G', picture: `${I}/item-leaf.png` },
        { word: 'cat', answer: 'C', picture: `${I}/item-cat.png` },
        { word: 'red', answer: 'R', emoji: '🔴' },
        { word: 'car', answer: 'C', picture: `${I}/item-car.png` },
      ] },
    { kind: 'treasure', name: 'Shape Box', icon: `${K}/chest-closed.png`, intro: 'Tap the box to open it!', img: town, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! Circle, square, triangle! Great building!' },
  ],
};
