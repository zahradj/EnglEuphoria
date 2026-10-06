import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const park = `${S}/bg-u3l3-park-wide.png`;

/** Pre-A1 Unit 3 Lesson 3 "What Do You Like to Play?" — Kite Park Quest.
 *  Practises kite, robot, plane, "Do you like kites? — Yes, I do! / No, I
 *  don't.", the park story (Pip's kite in the tree) and K /k/. */
export const QUEST_KITE_PARK_U3L3: HomeworkQuest = {
  id: 'kite-park-u3l3',
  title: 'Kite Park Quest',
  subtitle: 'What Do You Like to Play? · Pre-A1 Unit 3 · Lesson 3',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-3-3',
  theme: { accent: '#0EA5E9', accent2: '#EF4444', night: false, mapImg: park, guide: `${C}/pip-happy.png`, walker: `${C}/willow-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Kite, Robot, Plane', icon: '🪁', intro: 'Listen. Tap the toy!', img: park,
      rounds: [
        { line: "It's a kite!", answer: 'Kite', options: [{ label: 'Robot', src: `${I}/item-robot.png` }, { label: 'Kite', src: `${I}/item-kite.png` }, { label: 'Plane', src: `${I}/item-plane.png` }] },
        { line: 'Do you like robots? Yes, I do!', answer: 'Robot', options: [{ label: 'Robot', src: `${I}/item-robot.png` }, { label: 'Ball', src: `${I}/item-ball-red.png` }, { label: 'Kite', src: `${I}/item-kite.png` }] },
        { line: "It's a plane!", answer: 'Plane', options: [{ label: 'Kite', src: `${I}/item-kite.png` }, { label: 'Teddy bear', src: `${I}/item-teddy.png` }, { label: 'Plane', src: `${I}/item-plane.png` }] },
      ] },
    { kind: 'tap-hotspot', name: 'In the Park', icon: '🌳', intro: 'Listen. Find it in the park!', img: park, aspect: 1376 / 768,
      spots: [
        { label: 'kite', box: { x: 20, y: 10, w: 20, h: 30 } },
        { label: 'robot', box: { x: 39, y: 47, w: 10, h: 30 } },
        { label: 'plane', box: { x: 50, y: 52, w: 10, h: 14 } },
      ],
      rounds: [
        { target: 'robot', line: 'Find the robot.' },
        { target: 'kite', line: 'Find the kite.' },
        { target: 'plane', line: 'Find the plane.' },
      ] },
    { kind: 'true-false', name: 'The Kite Story', icon: '📖', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u3l3-kite-wide.png`, line: 'Pip flies his kite.', isTrue: true },
        { img: `${S}/bg-u3l3-stuck-wide.png`, line: 'The kite is in the tree!', isTrue: true },
        { img: `${S}/bg-u3l3-robot-wide.png`, line: "It's a plane!", isTrue: false },
        { img: `${S}/bg-u3l3-together-wide.png`, line: "Let's play together!", isTrue: true },
      ] },
    { kind: 'sound-choice', name: 'K, R, or P?', icon: '🔑', intro: 'Listen to the word. Which sound does it start with?', img: park, choices: ['K', 'R', 'P'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'kite', answer: 'K', picture: `${I}/item-kite.png` },
        { word: 'robot', answer: 'R', picture: `${I}/item-robot.png` },
        { word: 'key', answer: 'K', picture: `${I}/item-key.png` },
        { word: 'plane', answer: 'P', picture: `${I}/item-plane.png` },
        { word: 'kangaroo', answer: 'K', picture: `${I}/item-kangaroo.png` },
      ] },
    { kind: 'treasure', name: 'Park Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: `${S}/bg-u3l3-together-wide.png`, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: "You did it! Let's play! Do you like kites? Yes, I do!" },
  ],
};
