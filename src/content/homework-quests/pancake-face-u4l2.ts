import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const kitchen = `${S}/bg-u4l2-kitchen-wide.png`;
const face = `${S}/bg-u4l2-mia-face-wide.png`;

/** Pre-A1 Unit 4 Lesson 2 "Eyes, Ears, Mouth, Nose!" — Pancake Kitchen Quest.
 *  Practises eyes, ears, mouth, nose, "Point to your …!" / "Touch your …!",
 *  the pancake story and N /n/ (nest, nut, nose). */
export const QUEST_PANCAKE_FACE_U4L2: HomeworkQuest = {
  id: 'pancake-face-u4l2',
  title: 'Pancake Kitchen Quest',
  subtitle: 'Eyes, Ears, Mouth, Nose! · Pre-A1 Unit 4 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-4-2',
  theme: { accent: '#F59E0B', accent2: '#8B5CF6', night: false, mapImg: kitchen, guide: `${C}/mia-happy.png`, walker: `${C}/pip-happy.png` },
  voice: 'teacher',
  praise: { voice: 'mia', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'tap-hotspot', name: 'Point on Mia', icon: '🐭', intro: 'Listen. Tap it on Mia!', img: face, aspect: 1376 / 768,
      spots: [
        { label: 'ears', box: { x: 14, y: 5, w: 20, h: 46 } },
        { label: 'eyes', box: { x: 37, y: 50, w: 19, h: 12 } },
        { label: 'nose', box: { x: 49, y: 62, w: 9, h: 9 } },
        { label: 'mouth', box: { x: 44, y: 72, w: 14, h: 13 } },
      ],
      rounds: [
        { target: 'nose', line: 'Point to your nose!' },
        { target: 'eyes', line: 'Point to your eyes!' },
        { target: 'mouth', line: 'Point to your mouth!' },
        { target: 'ears', line: 'Touch your ears!' },
      ] },
    { kind: 'picture-choice', name: 'Face Cards', icon: '🃏', intro: 'Listen. Tap the right picture!', img: kitchen,
      rounds: [
        { line: 'Eyes!', answer: 'Eyes', options: [{ label: 'Ears', src: `${I}/item-card-ears.png` }, { label: 'Eyes', src: `${I}/item-card-eyes.png` }, { label: 'Mouth', src: `${I}/item-card-mouth.png` }] },
        { line: 'Mouth!', answer: 'Mouth', options: [{ label: 'Mouth', src: `${I}/item-card-mouth.png` }, { label: 'Nose', src: `${I}/item-card-nose.png` }, { label: 'Eyes', src: `${I}/item-card-eyes.png` }] },
        { line: 'Ears!', answer: 'Ears', options: [{ label: 'Nose', src: `${I}/item-card-nose.png` }, { label: 'Eyes', src: `${I}/item-card-eyes.png` }, { label: 'Ears', src: `${I}/item-card-ears.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u4l2-mia-eyes-wide.png`, line: 'Point to your eyes!', isTrue: true },
        { img: `${S}/bg-u4l2-mia-ears-wide.png`, line: 'Touch your nose!', isTrue: false },
        { img: `${S}/bg-u4l2-mia-mouth-wide.png`, line: 'Point to your mouth!', isTrue: true },
        { img: `${S}/bg-u4l2-pancake-face-wide.png`, line: 'A plain pancake. No face!', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'N, E, or T?', icon: '🪺', intro: 'Listen to the word. Which sound does it start with?', img: kitchen, choices: ['N', 'E', 'T'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'nest', answer: 'N', picture: `${I}/item-nest.png` },
        { word: 'egg', answer: 'E', picture: `${I}/item-egg.png` },
        { word: 'nut', answer: 'N', picture: `${I}/item-nut.png` },
        { word: 'ten', answer: 'T', picture: `${I}/item-ten.png` },
        { word: 'nose', answer: 'N', picture: `${I}/item-card-nose.png` },
      ] },
    { kind: 'treasure', name: 'Pancake Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: `${S}/bg-u4l2-pancake-face-wide.png`, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! Eyes, ears, a nose and a mouth! Yummy!' },
  ],
};
