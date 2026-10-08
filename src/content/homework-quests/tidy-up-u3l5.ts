import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const messy = `${S}/bg-u3l5-messy-wide.png`;

/** Pre-A1 Unit 3 Lesson 5 "Tidy Up Time!" — Tidy Room Quest.
 *  Practises in / on / under ("The ball is in the box.", "Where is the teddy?
 *  — It's on the bed!"), the tidy-up story and O /o/ (octopus). */
export const QUEST_TIDY_UP_U3L5: HomeworkQuest = {
  id: 'tidy-up-u3l5',
  title: 'Tidy Room Quest',
  subtitle: 'Tidy Up Time! · Pre-A1 Unit 3 · Lesson 5',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-3-5',
  theme: { accent: '#14B8A6', accent2: '#F43F5E', night: false, mapImg: messy, guide: `${C}/mia-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'mia', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'tap-hotspot', name: 'Messy Room', icon: '🧹', intro: 'The room is messy! Listen. Find the toy!', img: messy, aspect: 1376 / 768,
      spots: [
        { label: 'ball', box: { x: 9, y: 58, w: 15, h: 28 } },
        { label: 'teddy', box: { x: 21, y: 60, w: 14, h: 30 } },
        { label: 'car', box: { x: 36, y: 72, w: 16, h: 24 } },
        { label: 'robot', box: { x: 79, y: 64, w: 16, h: 30 } },
      ],
      rounds: [
        { target: 'teddy', line: 'Where is the teddy? Tap it!' },
        { target: 'car', line: 'Where is the car? Tap it!' },
        { target: 'ball', line: 'Where is the ball? Tap it!' },
        { target: 'robot', line: 'Where is the robot? Tap it!' },
      ] },
    { kind: 'picture-choice', name: 'In, On, Under', icon: '📦', intro: 'Listen. Tap the right picture!', img: messy,
      rounds: [
        { line: 'The ball is in the box.', answer: 'In', options: [{ label: 'In', src: `${S}/bg-u3l5-ball-box-wide.png` }, { label: 'On', src: `${S}/bg-u3l5-teddy-bed-wide.png` }, { label: 'Under', src: `${S}/bg-u3l5-car-chair-wide.png` }] },
        { line: 'The car is under the chair.', answer: 'Under', options: [{ label: 'On', src: `${S}/bg-u3l5-teddy-bed-wide.png` }, { label: 'Under', src: `${S}/bg-u3l5-car-chair-wide.png` }, { label: 'In', src: `${S}/bg-u3l5-ball-box-wide.png` }] },
        { line: 'The teddy is on the bed.', answer: 'On', options: [{ label: 'Under', src: `${S}/bg-u3l5-car-chair-wide.png` }, { label: 'In', src: `${S}/bg-u3l5-ball-box-wide.png` }, { label: 'On', src: `${S}/bg-u3l5-teddy-bed-wide.png` }] },
      ] },
    { kind: 'true-false', name: 'Tidy Up!', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u3l5-ball-box-wide.png`, line: 'The ball is in the box.', isTrue: true },
        { img: `${S}/bg-u3l5-teddy-bed-wide.png`, line: 'The teddy is under the bed.', isTrue: false },
        { img: `${S}/bg-u3l5-car-chair-wide.png`, line: 'The car is under the chair.', isTrue: true },
        { img: `${S}/bg-u3l5-kitten-wide.png`, line: 'The kitten is in the box!', isTrue: true },
      ] },
    { kind: 'sound-choice', name: 'O, K, or P?', icon: '🐙', intro: 'Listen to the word. Which sound does it start with?', img: messy, choices: ['O', 'K', 'P'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'octopus', answer: 'O', picture: `${I}/item-octopus.png` },
        { word: 'kitten', answer: 'K', picture: `${I}/item-kitten.png` },
        { word: 'plane', answer: 'P', picture: `${I}/item-plane.png` },
        { word: 'kite', answer: 'K', picture: `${I}/item-kite.png` },
      ] },
    { kind: 'treasure', name: 'Toy Box', icon: `${K}/chest-closed.png`, intro: 'Tap the toy box to open it!', img: `${S}/bg-u3l5-room-empty-wide.png`, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! The room is tidy! Great job!' },
  ],
};
