import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const garden = `${S}/bg-u8l5-garden-empty-wide.png`;
const page = (n: number) => `${S}/bg-u8l5-story-${n}-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 8 Lesson 5 "The Very Hungry Caterpillar" — Caterpillar Quest.
 *  Re-tells the story at home: what the caterpillar likes, caterpillar → butterfly, and the sounds C and B. */
export const QUEST_CATERPILLAR_U8L5: HomeworkQuest = {
  id: 'caterpillar-u8l5',
  title: 'Caterpillar Quest',
  subtitle: 'The Very Hungry Caterpillar · Pre-A1 Unit 8 · Lesson 5',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-8-5',
  theme: { accent: '#65A30D', accent2: '#F59E0B', night: false, mapImg: garden, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Munch, munch!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'What Does It Like?', icon: '🐛', intro: 'Listen. What does the caterpillar like?', img: garden,
      rounds: [
        { line: 'I like apples!', answer: 'apples', options: [{ label: 'apples', src: it('apple') }, { label: 'bread', src: it('bread') }, { label: 'cake', src: it('cake') }] },
        { line: 'I like bread!', answer: 'bread', options: [{ label: 'cake', src: it('cake') }, { label: 'bread', src: it('bread') }, { label: 'apples', src: it('apple') }] },
        { line: 'I like cake!', answer: 'cake', options: [{ label: 'apples', src: it('apple') }, { label: 'bread', src: it('bread') }, { label: 'cake', src: it('cake') }] },
      ] },
    { kind: 'true-false', name: 'The Story', icon: '📖', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: page(3), line: 'The caterpillar likes apples.', isTrue: true },
        { img: page(4), line: 'The caterpillar is on a cake.', isTrue: false },
        { img: page(8), line: "It's a butterfly.", isTrue: true },
      ] },
    { kind: 'sound-choice', name: 'C or B?', icon: '🔤', intro: 'Listen to the word. Does it start with C or B?', img: garden, choices: ['C', 'B'], phonics: true,
      rounds: [
        { word: 'caterpillar', answer: 'C', picture: it('caterpillar') },
        { word: 'butterfly', answer: 'B', picture: it('butterfly') },
        { word: 'cake', answer: 'C', picture: it('cake') },
        { word: 'bread', answer: 'B', picture: it('bread') },
      ] },
    { kind: 'treasure', name: 'Butterfly Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: page(9), closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Munch, munch! Now I am a butterfly!' },
  ],
};
