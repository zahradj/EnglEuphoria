import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const studio = `${S}/bg-u4l1-dance-class-wide.png`;
const body = `${S}/bg-u4l1-leo-body-wide.png`;

/** Pre-A1 Unit 4 Lesson 1 "Head, Shoulders, Knees, Toes!" — Dance Class Quest.
 *  Practises head, shoulders, knees, toes, "Touch your …!", "It's my head!"
 *  and E /e/ (egg, elephant). */
export const QUEST_DANCE_CLASS_U4L1: HomeworkQuest = {
  id: 'dance-class-u4l1',
  title: 'Dance Class Quest',
  subtitle: 'Head, Shoulders, Knees, Toes! · Pre-A1 Unit 4 · Lesson 1',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-4-1',
  theme: { accent: '#DB2777', accent2: '#0EA5E9', night: false, mapImg: studio, guide: `${C}/leo-happy.png`, walker: `${C}/pip-happy.png` },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'tap-hotspot', name: 'Touch on Leo', icon: '🦁', intro: 'Listen. Tap it on Leo!', img: body, aspect: 1376 / 768,
      spots: [
        { label: 'head', box: { x: 34, y: 4, w: 28, h: 38 } },
        { label: 'shoulders', box: { x: 32, y: 43, w: 30, h: 12 } },
        { label: 'knees', box: { x: 36, y: 69, w: 24, h: 13 } },
        { label: 'toes', box: { x: 35, y: 86, w: 26, h: 13 } },
      ],
      rounds: [
        { target: 'head', line: 'Touch your head!' },
        { target: 'knees', line: 'Touch your knees!' },
        { target: 'shoulders', line: 'Touch your shoulders!' },
        { target: 'toes', line: 'Touch your toes!' },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u4l1-leo-head-wide.png`, line: "It's my head!", isTrue: true },
        { img: `${S}/bg-u4l1-leo-knees-wide.png`, line: 'Touch your shoulders!', isTrue: false },
        { img: `${S}/bg-u4l1-leo-toes-wide.png`, line: 'Touch your toes!', isTrue: true },
        { img: `${S}/bg-u4l1-leo-shoulders-wide.png`, line: 'Touch your knees!', isTrue: false },
      ] },
    { kind: 'picture-choice', name: 'Body Cards', icon: '🃏', intro: 'Listen. Tap the right picture!', img: studio,
      rounds: [
        { line: 'Shoulders!', answer: 'Shoulders', options: [{ label: 'Head', src: `${I}/item-card-head.png` }, { label: 'Shoulders', src: `${I}/item-card-shoulders.png` }, { label: 'Toes', src: `${I}/item-card-toes.png` }] },
        { line: 'Toes!', answer: 'Toes', options: [{ label: 'Toes', src: `${I}/item-card-toes.png` }, { label: 'Knees', src: `${I}/item-card-knees.png` }, { label: 'Head', src: `${I}/item-card-head.png` }] },
        { line: 'Knees!', answer: 'Knees', options: [{ label: 'Shoulders', src: `${I}/item-card-shoulders.png` }, { label: 'Head', src: `${I}/item-card-head.png` }, { label: 'Knees', src: `${I}/item-card-knees.png` }] },
      ] },
    { kind: 'sound-choice', name: 'E, H, or T?', icon: '🥚', intro: 'Listen to the word. Which sound does it start with?', img: studio, choices: ['E', 'H', 'T'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'egg', answer: 'E', picture: `${I}/item-egg.png` },
        { word: 'head', answer: 'H', picture: `${I}/item-card-head.png` },
        { word: 'elephant', answer: 'E', picture: `${I}/item-elephant.png` },
        { word: 'toes', answer: 'T', picture: `${I}/item-card-toes.png` },
      ] },
    { kind: 'treasure', name: 'Dance Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: studio, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! Head, shoulders, knees and toes! Great dancing!' },
  ],
};
