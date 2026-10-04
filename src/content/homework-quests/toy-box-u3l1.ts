import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const room = `${S}/bg-u3l1-playroom-wide.png`;

/** Pre-A1 Unit 3 Lesson 1 "Ball, Car, Doll!" — Toy Box Quest.
 *  Practises only what the lesson taught: ball, car, doll with a colour,
 *  "I like …", and D saying /d/. Heard and answered with pictures. */
export const QUEST_TOY_BOX_U3L1: HomeworkQuest = {
  id: 'toy-box-u3l1',
  title: 'Toy Box Quest',
  subtitle: 'Ball, Car, Doll! · Pre-A1 Unit 3 · Lesson 1',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-3-1',
  theme: { accent: '#EF4444', accent2: '#3B82F6', night: false, mapImg: room, guide: `${C}/pip-hello.png`, walker: `${C}/bella-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Find It', icon: '🔎', intro: 'Listen. Tap the right toy!', img: room,
      rounds: [
        { line: 'Find the red ball.', answer: 'Red ball', options: [{ label: 'Blue ball', src: `${I}/item-ball-blue.png` }, { label: 'Red ball', src: `${I}/item-ball-red.png` }, { label: 'Red car', src: `${I}/item-car-red.png` }] },
        { line: 'Find the blue car.', answer: 'Blue car', options: [{ label: 'Blue car', src: `${I}/item-car.png` }, { label: 'Green car', src: `${I}/item-car-green.png` }, { label: 'Blue ball', src: `${I}/item-ball-blue.png` }] },
        { line: 'Find the doll.', answer: 'Doll', options: [{ label: 'Ball', src: `${I}/item-ball-yellow.png` }, { label: 'Car', src: `${I}/item-car-red.png` }, { label: 'Doll', src: `${I}/item-doll.png` }] },
        { line: 'Find the purple doll.', answer: 'Purple doll', options: [{ label: 'Purple doll', src: `${I}/item-doll-purple.png` }, { label: 'Yellow doll', src: `${I}/item-doll-yellow.png` }, { label: 'Green doll', src: `${I}/item-doll.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u3l1-ball-wide.png`, line: "It's a red ball.", isTrue: true },
        { img: `${S}/bg-u3l1-car-wide.png`, line: "It's a green car.", isTrue: false },
        { img: `${S}/bg-u3l1-doll-wide.png`, line: "It's a doll.", isTrue: true },
        { img: `${S}/bg-u3l1-ball-wide.png`, line: "It's a car.", isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'D, B, or C?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: room, choices: ['D', 'B', 'C'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'doll', answer: 'D', picture: `${I}/item-doll.png` },
        { word: 'ball', answer: 'B', picture: `${I}/item-ball-red.png` },
        { word: 'dog', answer: 'D', picture: `${I}/item-dog.png` },
        { word: 'car', answer: 'C', picture: `${I}/item-car.png` },
        { word: 'duck', answer: 'D', picture: `${I}/item-duck-yellow.png` },
      ] },
    { kind: 'treasure', name: 'Toy Box', icon: `${K}/chest-closed.png`, intro: 'Tap the toy box to open it!', img: room, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! A red ball, a blue car, a green doll!' },
  ],
};
