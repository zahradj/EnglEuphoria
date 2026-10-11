import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const dining = `${S}/bg-u8l6-dining-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 8 Lesson 6 "Food Preference Chart" — Food Review Quest (unit review).
 *  All the unit's food and drink, "I like …", eat or drink, and the first sounds. */
export const QUEST_FOOD_CHART_U8L6: HomeworkQuest = {
  id: 'food-chart-u8l6',
  title: 'Food Review Quest',
  subtitle: 'Food Preference Chart · Pre-A1 Unit 8 · Lesson 6',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-8-6',
  theme: { accent: '#16A34A', accent2: '#F97316', night: false, mapImg: dining, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Yummy!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Likes What?', icon: '📊', intro: 'Listen. What does the friend like?', img: dining,
      rounds: [
        { line: 'I like pizza!', answer: 'pizza', options: [{ label: 'pizza', src: it('pizza-slice') }, { label: 'apples', src: it('apple') }, { label: 'milk', src: it('milk') }] },
        { line: 'I like bananas!', answer: 'bananas', options: [{ label: 'bread', src: it('bread') }, { label: 'bananas', src: it('banana') }, { label: 'cake', src: it('cake') }] },
        { line: 'I like juice!', answer: 'juice', options: [{ label: 'ice cream', src: it('ice-cream') }, { label: 'water', src: it('water-glass') }, { label: 'juice', src: it('juice') }] },
      ] },
    { kind: 'true-false', name: 'Eat or Drink?', icon: '🥤', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: dining, line: 'We drink milk.', isTrue: true, sticker: { src: it('milk'), x: 50, y: 92, w: 14 } },
        { img: dining, line: 'We drink bread.', isTrue: false, sticker: { src: it('bread'), x: 50, y: 92, w: 16 } },
        { img: dining, line: 'We eat cake.', isTrue: true, sticker: { src: it('cake'), x: 50, y: 92, w: 16 } },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🔤', intro: 'Listen to the word. What sound does it start with?', img: dining, choices: ['P', 'B', 'J', 'M'], phonics: true,
      rounds: [
        { word: 'pizza', answer: 'P', picture: it('pizza-slice') },
        { word: 'juice', answer: 'J', picture: it('juice') },
        { word: 'milk', answer: 'M', picture: it('milk') },
        { word: 'banana', answer: 'B', picture: it('banana') },
      ] },
    { kind: 'treasure', name: 'Food Trophy', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: dining, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You know all the food! Yummy!' },
  ],
};
