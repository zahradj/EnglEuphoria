import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const laundry = `${S}/bg-u9l1-laundry-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 9 Lesson 1 "Shirt, Pants, Dress!" — Laundry Quest.
 *  Practises shirt, pants, dress with colours and the sound D. */
export const QUEST_LAUNDRY_U9L1: HomeworkQuest = {
  id: 'laundry-u9l1',
  title: 'Laundry Quest',
  subtitle: 'Shirt, Pants, Dress! · Pre-A1 Unit 9 · Lesson 1',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-9-1',
  theme: { accent: '#2563EB', accent2: '#EF4444', night: false, mapImg: laundry, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Find It', icon: '👕', intro: 'Listen. Tap the clothes!', img: laundry,
      rounds: [
        { line: 'Where is the red shirt?', answer: 'shirt', options: [{ label: 'shirt', src: it('shirt-red') }, { label: 'pants', src: it('pants-blue') }, { label: 'dress', src: it('dress-yellow') }] },
        { line: 'Where is the yellow dress?', answer: 'dress', options: [{ label: 'pants', src: it('pants-blue') }, { label: 'dress', src: it('dress-yellow') }, { label: 'shirt', src: it('shirt-red') }] },
        { line: 'Where are the blue pants?', answer: 'pants', options: [{ label: 'dress', src: it('dress-yellow') }, { label: 'shirt', src: it('shirt-red') }, { label: 'pants', src: it('pants-blue') }] },
      ] },
    { kind: 'true-false', name: 'Right Colour?', icon: '🎨', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: laundry, line: 'A red shirt.', isTrue: true, sticker: { src: it('shirt-red'), x: 50, y: 92, w: 16 } },
        { img: laundry, line: 'A red dress.', isTrue: false, sticker: { src: it('dress-yellow'), x: 50, y: 92, w: 16 } },
        { img: laundry, line: 'Blue pants.', isTrue: true, sticker: { src: it('pants-blue'), x: 50, y: 92, w: 16 } },
      ] },
    { kind: 'sound-choice', name: 'D or P?', icon: '🔤', intro: 'Listen to the word. Does it start with D or P?', img: laundry, choices: ['D', 'P'], phonics: true,
      rounds: [
        { word: 'dress', answer: 'D', picture: it('dress-yellow') },
        { word: 'pants', answer: 'P', picture: it('pants-blue') },
        { word: 'dog', answer: 'D', picture: it('dog') },
      ] },
    { kind: 'treasure', name: 'Laundry Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: laundry, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Shirt, pants, dress! Hooray!' },
  ],
};
