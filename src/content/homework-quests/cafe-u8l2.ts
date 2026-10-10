import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const cafe = `${S}/bg-u8l2-cafe-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 8 Lesson 2 "Bread, Water, Juice!" — Café Quest.
 *  Practises bread, water, juice and ordering politely ("Juice, please!"). */
export const QUEST_CAFE_U8L2: HomeworkQuest = {
  id: 'cafe-u8l2',
  title: 'Café Quest',
  subtitle: 'Bread, Water, Juice! · Pre-A1 Unit 8 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-8-2',
  theme: { accent: '#B45309', accent2: '#F97316', night: false, mapImg: cafe, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'The Order', icon: '🛎️', intro: 'Listen to the order. What does the friend want?', img: cafe,
      rounds: [
        { line: 'Juice, please!', answer: 'juice', options: [{ label: 'bread', src: it('bread') }, { label: 'juice', src: it('juice') }, { label: 'water', src: it('water-glass') }] },
        { line: 'Water, please!', answer: 'water', options: [{ label: 'water', src: it('water-glass') }, { label: 'juice', src: it('juice') }, { label: 'bread', src: it('bread') }] },
        { line: 'Bread, please!', answer: 'bread', options: [{ label: 'juice', src: it('juice') }, { label: 'water', src: it('water-glass') }, { label: 'bread', src: it('bread') }] },
      ] },
    { kind: 'true-false', name: 'Is It Right?', icon: '🍞', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: cafe, line: "It's juice!", isTrue: true, sticker: { src: it('juice'), x: 50, y: 92, w: 16 } },
        { img: cafe, line: "It's water!", isTrue: false, sticker: { src: it('bread'), x: 50, y: 92, w: 18 } },
        { img: cafe, line: "It's bread!", isTrue: true, sticker: { src: it('bread'), x: 50, y: 92, w: 18 } },
      ] },
    { kind: 'treasure', name: 'Café Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: cafe, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Bread, water, juice! Thank you!' },
  ],
};
