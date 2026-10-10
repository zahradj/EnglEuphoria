import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const hall = `${S}/bg-u9l2-hall-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 9 Lesson 2 "Shoes, Hat, Socks!" — Snow Day Quest.
 *  Practises hat, socks, shoes, "on my head / on my feet" and the sounds H and S. */
export const QUEST_SNOW_DAY_U9L2: HomeworkQuest = {
  id: 'snow-day-u9l2',
  title: 'Snow Day Quest',
  subtitle: 'Shoes, Hat, Socks! · Pre-A1 Unit 9 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-9-2',
  theme: { accent: '#0EA5E9', accent2: '#22C55E', night: false, mapImg: hall, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Get Ready', icon: '🧢', intro: 'Listen. What does Pip want?', img: hall,
      rounds: [
        { line: 'Put on my green hat!', answer: 'hat', options: [{ label: 'hat', src: it('hat-green') }, { label: 'socks', src: it('socks-red') }, { label: 'shoes', src: it('shoes-blue') }] },
        { line: 'Put on my red socks!', answer: 'socks', options: [{ label: 'shoes', src: it('shoes-blue') }, { label: 'socks', src: it('socks-red') }, { label: 'hat', src: it('hat-green') }] },
        { line: 'Put on my blue shoes!', answer: 'shoes', options: [{ label: 'hat', src: it('hat-green') }, { label: 'shirt', src: it('shirt-red') }, { label: 'shoes', src: it('shoes-blue') }] },
      ] },
    { kind: 'true-false', name: 'Head or Feet?', icon: '👣', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: hall, line: 'A hat goes on your head.', isTrue: true, sticker: { src: it('hat-green'), x: 50, y: 92, w: 16 } },
        { img: hall, line: 'Socks go on your head.', isTrue: false, sticker: { src: it('socks-red'), x: 50, y: 92, w: 16 } },
        { img: hall, line: 'Shoes go on your feet.', isTrue: true, sticker: { src: it('shoes-blue'), x: 50, y: 92, w: 16 } },
      ] },
    { kind: 'sound-choice', name: 'H or S?', icon: '🔤', intro: 'Listen to the word. Does it start with H or S?', img: hall, choices: ['H', 'S'], phonics: true,
      rounds: [
        { word: 'hat', answer: 'H', picture: it('hat-green') },
        { word: 'socks', answer: 'S', picture: it('socks-red') },
        { word: 'sun', answer: 'S', picture: it('sun') },
        { word: 'horse', answer: 'H', picture: it('horse') },
      ] },
    { kind: 'treasure', name: 'Snow Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: hall, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: "Hat, socks, shoes! Let's play in the snow!" },
  ],
};
