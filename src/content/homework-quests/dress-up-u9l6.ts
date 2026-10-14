import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const room = `${S}/bg-u9l6-playroom-wide.png`;
const roomEmpty = `${S}/bg-u9l6-playroom-empty-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;
// Boys (Pip, Leo) never wear a dress (owner, 2026-10-11): they have no dress piece, so the dress isn't on their rail.
const fitted = (who: string, pieces = ['hat', 'socks', 'shoes', 'shirt', 'pants']) => Object.fromEntries(pieces.map((k) => [k, `/lep1/dressup/${who}/${k}.png`]));

/** Pre-A1 Unit 9 Lesson 6 "Dress Up Game" — Dress-Up Party Quest (unit review).
 *  Reviews the clothes of the unit, "I'm wearing …" and the sounds D, T, P, W. */
export const QUEST_DRESS_UP_U9L6: HomeworkQuest = {
  id: 'dress-up-u9l6',
  title: 'Dress-Up Party Quest',
  subtitle: 'Dress Up Game · Pre-A1 Unit 9 · Lesson 6',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-9-6',
  theme: { accent: '#8B5CF6', accent2: '#F59E0B', night: false, mapImg: room, guide: `${C}/mia-happy.png`, walker: `${C}/mia-hello.png` },
  voice: 'teacher',
  praise: { voice: 'mia', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'dress-up', name: 'Dress Up!', icon: '👗', intro: 'Help your friends dress up! Listen, and put it on.', img: roomEmpty,
      wardrobe: [
        { id: 'hat', label: 'hat', src: it('hat-green'), z: 6 },
        { id: 'socks', label: 'socks', src: it('socks-red'), z: 1 },
        { id: 'shoes', label: 'shoes', src: it('shoes-blue'), z: 4 },
        { id: 'shirt', label: 'shirt', src: it('shirt-red'), z: 5 },
        { id: 'pants', label: 'pants', src: it('pants-blue'), z: 3 },
        { id: 'dress', label: 'dress', src: it('dress-yellow'), z: 5 },
      ],
      friends: [
        { who: 'mia', name: 'Mia', img: `${C}/mia-hello.png`, layers: fitted('mia', ['hat', 'socks', 'shoes', 'shirt', 'pants', 'dress']) },
        { who: 'leo', name: 'Leo', img: `${C}/leo-hello.png`, layers: fitted('leo') },
      ],
      rounds: [
        { friend: 0, item: 'dress', line: 'Put on my yellow dress, please!', reply: "I'm wearing a yellow dress!" },
        { friend: 0, item: 'shoes', line: 'Now my blue shoes!', reply: "I'm wearing blue shoes!" },
        { friend: 0, item: 'hat', line: 'And my green hat!', reply: 'Dress, shoes, hat! I am ready!' },
        { friend: 1, item: 'shirt', line: 'Put on my red shirt, please!', reply: "I'm wearing a red shirt!" },
        { friend: 1, item: 'pants', line: 'Now my blue pants!', reply: "I'm wearing blue pants!" },
        { friend: 1, item: 'hat', line: 'And a hat, please!', reply: 'Look at me! Roar!' },
      ],
      wrongLine: 'No, not the {item}! Listen again.',
      doneLine: "We are ready for the dress-up party!" },
    { kind: 'picture-choice', name: 'What Is It?', icon: '🧥', intro: 'Listen. Which one is it?', img: room,
      rounds: [
        { line: 'A coat!', answer: 'coat', options: [{ label: 'coat', src: it('coat-blue') }, { label: 'skirt', src: it('skirt-pink') }, { label: 'hat', src: it('hat-green') }] },
        { line: 'A skirt!', answer: 'skirt', options: [{ label: 'T-shirt', src: it('tshirt-yellow') }, { label: 'skirt', src: it('skirt-pink') }, { label: 'socks', src: it('socks-red') }] },
        { line: 'A T-shirt!', answer: 'T-shirt', options: [{ label: 'dress', src: it('dress-yellow') }, { label: 'coat', src: it('coat-blue') }, { label: 'T-shirt', src: it('tshirt-yellow') }] },
      ] },
    { kind: 'sound-choice', name: 'P or D?', icon: '🔤', intro: 'Listen to the word. Does it start with P or D?', img: room, choices: ['P', 'D'], phonics: true,
      rounds: [
        { word: 'pants', answer: 'P', picture: it('pants-blue') },
        { word: 'dress', answer: 'D', picture: it('dress-yellow') },
        { word: 'pig', answer: 'P', picture: it('pig') },
        { word: 'dog', answer: 'D', picture: it('dog') },
      ] },
    { kind: 'treasure', name: 'Party Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: room, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You finished the clothes unit! Dress up, dress up!' },
  ],
};
