import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const map = `${S}/bg-u2l6-map-wide.png`;

/** Pre-A1 Unit 2 Lesson 6 "Color & Shape Hunt" — Rainbow Treasure Quest.
 *  The unit's review: six colours, three shapes, "a red circle", the
 *  treasure story, and C / WH / SH. Heard and answered with pictures. */
export const QUEST_TREASURE_HUNT_U2L6: HomeworkQuest = {
  id: 'treasure-hunt-u2l6',
  title: 'Rainbow Treasure Quest',
  subtitle: 'Color & Shape Hunt · Pre-A1 Unit 2 · Lesson 6',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-2-6',
  theme: { accent: '#F59E0B', accent2: '#22C55E', night: false, mapImg: map, guide: `${C}/pip-hello.png`, walker: `${C}/leo-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Find It', icon: '🔎', intro: 'Listen. Tap the right one!', img: map,
      rounds: [
        { line: 'Find something green.', answer: 'Frog', options: [{ label: 'Frog', src: `${I}/item-frog.png` }, { label: 'Carrot', src: `${I}/item-carrot.png` }, { label: 'Grapes', src: `${I}/item-grapes.png` }] },
        { line: 'Find a circle.', answer: 'Clock', options: [{ label: 'Window', src: `${I}/item-window.png` }, { label: 'Clock', src: `${I}/item-clock.png` }, { label: 'Flag', src: `${I}/item-flag.png` }] },
        { line: 'Find something orange.', answer: 'Carrot', options: [{ label: 'Leaf', src: `${I}/item-leaf.png` }, { label: 'Grapes', src: `${I}/item-grapes.png` }, { label: 'Carrot', src: `${I}/item-carrot.png` }] },
        { line: 'Find a square.', answer: 'Present', options: [{ label: 'Present', src: `${I}/item-present.png` }, { label: 'Cookie', src: `${I}/item-cookie.png` }, { label: 'Pizza', src: `${I}/item-pizza-slice.png` }] },
        { line: 'Find a triangle.', answer: 'Flag', options: [{ label: 'Ball', src: `${I}/item-ball.png` }, { label: 'Flag', src: `${I}/item-flag.png` }, { label: 'Window', src: `${I}/item-window.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u2l6-garden-wide.png`, line: 'Bella finds a red circle.', isTrue: true },
        { img: `${S}/bg-u2l6-beach-wide.png`, line: 'Willow finds a yellow triangle.', isTrue: false },
        { img: `${S}/bg-u2l6-cave-wide.png`, line: 'Leo finds a yellow triangle.', isTrue: true },
        { img: `${S}/bg-u2l6-rainbow-wide.png`, line: 'There is a fish in the chest.', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'C, Wh, or Sh?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: map, choices: ['C', 'Wh', 'Sh'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'car', answer: 'C', picture: `${I}/item-car.png` },
        { word: 'wheel', answer: 'Wh', picture: `${I}/item-wheel.png` },
        { word: 'ship', answer: 'Sh', picture: `${I}/item-ship.png` },
        { word: 'clock', answer: 'C', picture: `${I}/item-clock.png` },
        { word: 'shell', answer: 'Sh', picture: `${I}/item-shell.png` },
      ] },
    { kind: 'treasure', name: 'Rainbow Treasure', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: map, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You found the Rainbow Treasure! You are a color and shape champion!' },
  ],
};
