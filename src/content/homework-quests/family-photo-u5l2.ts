import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const yard = `${S}/bg-u5l2-yard-wide.png`;
const garden = `${S}/bg-u5l2-garden-wide.png`;
const brother = `${S}/bg-u5l2-brother-wide.png`;
const sister = `${S}/bg-u5l2-sister-wide.png`;
const baby = `${S}/bg-u5l2-baby-wide.png`;

/** Pre-A1 Unit 5 Lesson 2 "Brother, Sister, Baby!" — Family Photo Quest.
 *  Practises brother, sister, baby, "This is my sister!", biggest / smallest
 *  and the S sound. */
export const QUEST_FAMILY_PHOTO_U5L2: HomeworkQuest = {
  id: 'family-photo-u5l2',
  title: 'Family Photo Quest',
  subtitle: 'Brother, Sister, Baby! · Pre-A1 Unit 5 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-5-2',
  theme: { accent: '#0EA5E9', accent2: '#F59E0B', night: false, mapImg: yard, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'tap-hotspot', name: 'Find My Family', icon: '📷', intro: 'Listen. Tap the right one in the picture!', img: yard, aspect: 1376 / 768,
      spots: [
        { label: 'brother', box: { x: 20, y: 6, w: 19, h: 84 } },
        { label: 'Pip', box: { x: 40, y: 38, w: 15, h: 52 } },
        { label: 'sister', box: { x: 55, y: 42, w: 14, h: 48 } },
        { label: 'baby', box: { x: 70, y: 61, w: 14, h: 33 } },
      ],
      rounds: [
        { target: 'sister', line: 'This is my sister!' },
        { target: 'baby', line: 'This is the baby!' },
        { target: 'brother', line: 'This is my brother!' },
        { target: 'Pip', line: 'This is me, Pip!' },
      ] },
    { kind: 'picture-choice', name: 'Who Is It?', icon: '👨‍👩‍👧‍👦', intro: 'Listen. Tap the right picture!', img: yard,
      rounds: [
        { line: 'Brother!', answer: 'brother', options: [{ label: 'sister', src: sister }, { label: 'brother', src: brother }, { label: 'baby', src: baby }] },
        { line: 'Baby!', answer: 'baby', options: [{ label: 'baby', src: baby }, { label: 'sister', src: sister }, { label: 'brother', src: brother }] },
        { line: 'Sister!', answer: 'sister', options: [{ label: 'brother', src: brother }, { label: 'baby', src: baby }, { label: 'sister', src: sister }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: baby, line: 'This is the baby!', isTrue: true },
        { img: sister, line: 'This is my brother!', isTrue: false },
        { img: brother, line: 'My brother is big!', isTrue: true },
        { img: baby, line: 'The baby is big!', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'S or B?', icon: '🐍', intro: 'Listen to the word. Which sound does it start with?', img: garden, choices: ['S', 'B'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'sister', answer: 'S', picture: `${I}/item-family-sister.png` },
        { word: 'baby', answer: 'B', picture: `${I}/item-family-baby.png` },
        { word: 'sun', answer: 'S', picture: `${I}/item-sun.png` },
        { word: 'brother', answer: 'B', picture: `${I}/item-family-brother.png` },
        { word: 'snake', answer: 'S', picture: `${I}/item-snake.png` },
      ] },
    { kind: 'treasure', name: 'Photo Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: yard, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! This is my family! Click!' },
  ],
};
