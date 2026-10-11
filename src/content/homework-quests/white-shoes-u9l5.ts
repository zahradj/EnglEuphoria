import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const page = (n: number) => `${S}/bg-u9l5-story-${n}-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 9 Lesson 5 "Pip's White Shoes" — Shoe Story Quest.
 *  Practises "My shoes are red / blue / brown / white!" from the story and the sound W. */
export const QUEST_WHITE_SHOES_U9L5: HomeworkQuest = {
  id: 'white-shoes-u9l5',
  title: 'Shoe Story Quest',
  subtitle: "Pip's White Shoes · Pre-A1 Unit 9 · Lesson 5",
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-9-5',
  theme: { accent: '#2563EB', accent2: '#F97316', night: false, mapImg: page(1), guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Which Shoes?', icon: '👟', intro: 'Listen. Which picture is it?', img: page(1),
      rounds: [
        { line: 'My shoes are red!', answer: 'red shoes', options: [{ label: 'white shoes', src: page(1) }, { label: 'red shoes', src: page(3) }, { label: 'blue shoes', src: page(5) }] },
        { line: 'My shoes are blue!', answer: 'blue shoes', options: [{ label: 'blue shoes', src: page(5) }, { label: 'brown shoes', src: page(7) }, { label: 'red shoes', src: page(3) }] },
        { line: 'My shoes are brown!', answer: 'brown shoes', options: [{ label: 'red shoes', src: page(3) }, { label: 'white shoes', src: page(1) }, { label: 'brown shoes', src: page(7) }] },
        { line: 'My shoes are white again!', answer: 'white again', options: [{ label: 'brown shoes', src: page(7) }, { label: 'white again', src: page(8) }, { label: 'blue shoes', src: page(5) }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '✅', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: page(3), line: 'His shoes are red.', isTrue: true },
        { img: page(5), line: 'His shoes are brown.', isTrue: false },
        { img: page(1), line: 'His shoes are white.', isTrue: true },
      ] },
    { kind: 'sound-choice', name: 'W or S?', icon: '🔤', intro: 'Listen to the word. Does it start with W or S?', img: page(1), choices: ['W', 'S'], phonics: true,
      rounds: [
        { word: 'water', answer: 'W', picture: it('water') },
        { word: 'socks', answer: 'S', picture: it('socks-red') },
        { word: 'window', answer: 'W', picture: it('window') },
        { word: 'sun', answer: 'S', picture: it('sun') },
      ] },
    { kind: 'treasure', name: 'Story Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: page(9), closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Squish, splat, splash! I like my shoes!' },
  ],
};
