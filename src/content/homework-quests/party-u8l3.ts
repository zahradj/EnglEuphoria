import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const party = `${S}/bg-u8l3-party-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 8 Lesson 3 "Pizza, Cake, Ice Cream!" — Party Quest.
 *  Practises pizza, cake, ice cream, asking politely ("Ice cream, please!") and the sound /p/. */
export const QUEST_PARTY_U8L3: HomeworkQuest = {
  id: 'party-u8l3',
  title: 'Party Quest',
  subtitle: 'Pizza, Cake, Ice Cream! · Pre-A1 Unit 8 · Lesson 3',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-8-3',
  theme: { accent: '#DC2626', accent2: '#F59E0B', night: false, mapImg: party, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Yummy!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Party Food', icon: '🎉', intro: 'Listen. Which food does the friend want?', img: party,
      rounds: [
        { line: 'Ice cream, please!', answer: 'ice cream', options: [{ label: 'pizza', src: it('pizza-slice') }, { label: 'ice cream', src: it('ice-cream') }, { label: 'cake', src: it('cake') }] },
        { line: 'Pizza, please!', answer: 'pizza', options: [{ label: 'pizza', src: it('pizza-slice') }, { label: 'cake', src: it('cake') }, { label: 'bread', src: it('bread') }] },
        { line: 'Cake, please!', answer: 'cake', options: [{ label: 'ice cream', src: it('ice-cream') }, { label: 'juice', src: it('juice') }, { label: 'cake', src: it('cake') }] },
      ] },
    { kind: 'true-false', name: 'Yummy or Not?', icon: '🍕', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: party, line: "It's pizza!", isTrue: true, sticker: { src: it('pizza-slice'), x: 50, y: 92, w: 16 } },
        { img: party, line: "It's cake!", isTrue: false, sticker: { src: it('ice-cream'), x: 50, y: 92, w: 14 } },
        { img: party, line: "It's ice cream!", isTrue: true, sticker: { src: it('ice-cream'), x: 50, y: 92, w: 14 } },
      ] },
    { kind: 'sound-choice', name: 'Starts with P?', icon: '🅿️', intro: 'Listen to the word. Does it start with P?', img: party, choices: ['P', 'C'], phonics: true,
      rounds: [
        { word: 'pizza', answer: 'P', picture: it('pizza-slice') },
        { word: 'cake', answer: 'C', picture: it('cake') },
        { word: 'pig', answer: 'P', picture: it('pig') },
      ] },
    { kind: 'treasure', name: 'Party Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: party, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Pizza, cake, ice cream! Yummy!' },
  ],
};
