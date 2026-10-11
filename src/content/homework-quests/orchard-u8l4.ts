import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const orchard = `${S}/bg-u8l4-orchard-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 8 Lesson 4 "I Like Apples!" — Orchard Quest.
 *  Practises "I like …", "Do you like …? Yes, I do!" and the sounds A and B. */
export const QUEST_ORCHARD_U8L4: HomeworkQuest = {
  id: 'orchard-u8l4',
  title: 'Orchard Quest',
  subtitle: 'I Like Apples! · Pre-A1 Unit 8 · Lesson 4',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-8-4',
  theme: { accent: '#B91C1C', accent2: '#F59E0B', night: false, mapImg: orchard, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'What Do They Like?', icon: '🍎', intro: 'Listen. What does the friend like?', img: orchard,
      rounds: [
        { line: 'I like apples!', answer: 'apples', options: [{ label: 'bananas', src: it('banana') }, { label: 'apples', src: it('apple') }, { label: 'pizza', src: it('pizza-slice') }] },
        { line: 'I like bananas!', answer: 'bananas', options: [{ label: 'bananas', src: it('banana') }, { label: 'cake', src: it('cake') }, { label: 'apples', src: it('apple') }] },
        { line: 'I like ice cream!', answer: 'ice cream', options: [{ label: 'bread', src: it('bread') }, { label: 'pizza', src: it('pizza-slice') }, { label: 'ice cream', src: it('ice-cream') }] },
      ] },
    { kind: 'sound-choice', name: 'A or B?', icon: '🔤', intro: 'Listen to the word. Does it start with A or B?', img: orchard, choices: ['A', 'B'], phonics: true,
      rounds: [
        { word: 'apple', answer: 'A', picture: it('apple') },
        { word: 'banana', answer: 'B', picture: it('banana') },
        { word: 'ant', answer: 'A', picture: it('ant') },
        { word: 'bread', answer: 'B', picture: it('bread') },
      ] },
    { kind: 'sentence-builder', name: 'Say It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: orchard, line: 'I like apples!', extra: ['bananas'] },
        { img: orchard, line: 'Do you like pizza?', extra: ['cake'] },
      ] },
    { kind: 'treasure', name: 'Orchard Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: orchard, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'I like apples! Yes, I do!' },
  ],
};
