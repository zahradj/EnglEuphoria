import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const picnic = `${S}/bg-u8l1-picnic-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 8 Lesson 1 "Apple, Banana, Milk!" — Picnic Quest.
 *  Practises apple, banana, milk ("It's an apple!") and "Can I have …, please?". */
export const QUEST_PICNIC_U8L1: HomeworkQuest = {
  id: 'picnic-u8l1',
  title: 'Picnic Quest',
  subtitle: 'Apple, Banana, Milk! · Pre-A1 Unit 8 · Lesson 1',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-8-1',
  theme: { accent: '#DC2626', accent2: '#F59E0B', night: false, mapImg: picnic, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Can I Have…?', icon: '🧺', intro: 'Listen to Pip. Which food does he want?', img: picnic,
      rounds: [
        { line: 'Can I have a banana, please?', answer: 'banana', options: [{ label: 'apple', src: it('apple') }, { label: 'banana', src: it('banana') }, { label: 'milk', src: it('milk') }] },
        { line: 'Can I have milk, please?', answer: 'milk', options: [{ label: 'milk', src: it('milk') }, { label: 'apple', src: it('apple') }, { label: 'banana', src: it('banana') }] },
        { line: 'Can I have an apple, please?', answer: 'apple', options: [{ label: 'banana', src: it('banana') }, { label: 'milk', src: it('milk') }, { label: 'apple', src: it('apple') }] },
      ] },
    { kind: 'true-false', name: 'Is It Right?', icon: '🍎', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: picnic, line: "It's an apple!", isTrue: true, sticker: { src: it('apple'), x: 50, y: 92, w: 18 } },
        { img: picnic, line: "It's milk!", isTrue: false, sticker: { src: it('banana'), x: 50, y: 92, w: 18 } },
        { img: picnic, line: "It's milk!", isTrue: true, sticker: { src: it('milk'), x: 50, y: 92, w: 16 } },
      ] },
    { kind: 'treasure', name: 'Picnic Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the basket prize to open it!', img: picnic, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Apple, banana, milk! Yum!' },
  ],
};
