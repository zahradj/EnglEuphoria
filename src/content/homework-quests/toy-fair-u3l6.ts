import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const prizes = `${S}/bg-u3l6-prizes-wide.png`;

/** Pre-A1 Unit 3 Lesson 6 "The Toy Fair" — Toy Fair Quest (unit review).
 *  Practises every Unit 3 toy with its colour ("the blue car"), "I want the
 *  …, please!", the fair story and D, T, K, P, O at the start of words. */
export const QUEST_TOY_FAIR_U3L6: HomeworkQuest = {
  id: 'toy-fair-u3l6',
  title: 'Toy Fair Quest',
  subtitle: 'The Toy Fair · Pre-A1 Unit 3 · Lesson 6',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-3-6',
  theme: { accent: '#E11D48', accent2: '#2563EB', night: false, mapImg: `${S}/bg-u3l6-fair-wide.png`, guide: `${C}/leo-happy.png`, walker: `${C}/bella-happy.png` },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Pick a Prize', icon: '🎡', intro: 'Listen. Tap the prize!', img: prizes,
      rounds: [
        { line: 'I want the blue car, please!', answer: 'Blue car', options: [{ label: 'Red car', src: `${I}/item-car-red.png` }, { label: 'Blue car', src: `${I}/item-car.png` }, { label: 'Green car', src: `${I}/item-car-green.png` }] },
        { line: 'I want the red ball, please!', answer: 'Red ball', options: [{ label: 'Red ball', src: `${I}/item-ball-red.png` }, { label: 'Blue ball', src: `${I}/item-ball-blue.png` }, { label: 'Yellow ball', src: `${I}/item-ball-yellow.png` }] },
        { line: 'I want the purple doll, please!', answer: 'Purple doll', options: [{ label: 'Green doll', src: `${I}/item-doll.png` }, { label: 'Yellow doll', src: `${I}/item-doll-yellow.png` }, { label: 'Purple doll', src: `${I}/item-doll-purple.png` }] },
      ] },
    { kind: 'tap-hotspot', name: 'Prize Table', icon: '🏆', intro: 'Listen. Find the prize on the table!', img: prizes, aspect: 1376 / 768,
      spots: [
        { label: 'ball', box: { x: 14, y: 57, w: 14, h: 30 } },
        { label: 'doll', box: { x: 30, y: 61, w: 12, h: 30 } },
        { label: 'robot', box: { x: 42, y: 54, w: 9, h: 30 } },
        { label: 'kite', box: { x: 51, y: 54, w: 13, h: 32 } },
        { label: 'car', box: { x: 71, y: 68, w: 16, h: 28 } },
      ],
      rounds: [
        { target: 'robot', line: 'I want the robot, please!' },
        { target: 'kite', line: 'I want the kite, please!' },
        { target: 'car', line: 'I want the blue car, please!' },
        { target: 'doll', line: 'I want the doll, please!' },
      ] },
    { kind: 'true-false', name: 'The Fair Story', icon: '📖', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u3l6-fair-wide.png`, line: 'The friends go to the Toy Fair.', isTrue: true },
        { img: `${S}/bg-u3l6-leo-claw-wide.png`, line: 'Leo wins a kite.', isTrue: false },
        { img: `${S}/bg-u3l6-bella-ring-wide.png`, line: 'Bella wins a kite.', isTrue: true },
        { img: prizes, line: 'Everyone has a prize!', isTrue: true },
      ] },
    { kind: 'sound-choice', name: 'Sound Ring Toss', icon: '🎯', intro: 'Listen to the word. Which sound does it start with?', img: `${S}/bg-u3l6-ring-toss-wide.png`, choices: ['D', 'T', 'K', 'P'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'doll', answer: 'D', picture: `${I}/item-doll.png` },
        { word: 'train', answer: 'T', picture: `${I}/item-train.png` },
        { word: 'kite', answer: 'K', picture: `${I}/item-kite.png` },
        { word: 'pizza', answer: 'P', picture: `${I}/item-pizza.png` },
        { word: 'dog', answer: 'D', picture: `${I}/item-dog.png` },
      ] },
    { kind: 'treasure', name: 'Grand Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest for the grand prize!', img: prizes, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! You won the grand prize! Toy Fair star!' },
  ],
};
