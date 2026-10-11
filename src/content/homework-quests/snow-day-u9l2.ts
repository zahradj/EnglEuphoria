import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const hall = `${S}/bg-u9l2-hall-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;
const hallEmpty = `${S}/bg-u9l2-hall-empty-wide.png`;
/** The friend's fitted clothes (scripts/dressup-layers.py), one full-size layer per piece. */
const fitted = (who: string) => Object.fromEntries(['hat', 'socks', 'shoes', 'shirt', 'pants', 'dress'].map((k) => [k, `/lep1/dressup/${who}/${k}.png`]));

/** Pre-A1 Unit 9 Lesson 2 "Shoes, Hat, Socks!" — Snow Day Quest.
 *  Practises hat, socks, shoes, "on my head / on my feet" and the sounds H and S. Level 1 is the Dress Up
 *  game: Pip, Mia and Leo ask for their clothes and really wear them (fitted layers). */
export const QUEST_SNOW_DAY_U9L2: HomeworkQuest = {
  id: 'snow-day-u9l2',
  title: 'Snow Day Quest',
  subtitle: 'Shoes, Hat, Socks! · Pre-A1 Unit 9 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-9-2',
  theme: { accent: '#0EA5E9', accent2: '#22C55E', night: false, mapImg: hall, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png`,
    // The snowy village: Pip's cottage (Dress Up), the snowman (Head or Feet?), the sled hill (H or S?), the chest under the big pine.
    map: { img: `${S}/map-u9l2-snow-village-wide.png`, ambient: 'snow',
      stops: [[21, 77], [47, 79], [57, 41], [79, 31]],
      trail: [[21, 77], [29, 84], [38, 87], [47, 79], [56, 67], [63, 57], [67, 48], [62, 43], [57, 41], [66, 43], [74, 41], [81, 34], [79, 31]] } },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'dress-up', name: 'Dress Up!', icon: '🧢', intro: 'Help your friends get ready for the snow! Listen, and put it on.', img: hallEmpty,
      wardrobe: [
        { id: 'hat', label: 'hat', src: it('hat-green'), z: 6 },
        { id: 'socks', label: 'socks', src: it('socks-red'), z: 1 },
        { id: 'shoes', label: 'shoes', src: it('shoes-blue'), z: 4 },
        { id: 'shirt', label: 'shirt', src: it('shirt-red'), z: 5 },
        { id: 'pants', label: 'pants', src: it('pants-blue'), z: 3 },
        { id: 'dress', label: 'dress', src: it('dress-yellow'), z: 5 },
      ],
      friends: [
        { who: 'pip', name: 'Pip', img: `${C}/pip-hello.png`, layers: fitted('pip') },
        { who: 'mia', name: 'Mia', img: `${C}/mia-hello.png`, layers: fitted('mia') },
        { who: 'leo', name: 'Leo', img: `${C}/leo-hello.png`, layers: fitted('leo') },
      ],
      rounds: [
        { friend: 0, item: 'hat', line: 'Put on my green hat!', reply: 'Yes! My hat is on my head!' },
        { friend: 0, item: 'socks', line: 'Put on my socks, please!', reply: 'My socks are on my feet!' },
        { friend: 0, item: 'shoes', line: 'And my shoes!', reply: 'Hat, socks, shoes! I am ready!' },
        { friend: 1, item: 'socks', line: 'Put on my red socks, please!', reply: 'Thank you! My socks are on my feet!' },
        { friend: 1, item: 'shoes', line: 'Now put on my blue shoes!', reply: 'Yes! My shoes are on!' },
        { friend: 1, item: 'hat', line: 'And my hat, please!', reply: 'My hat is on my head!' },
        { friend: 2, item: 'hat', line: 'I want a hat, too! Put on my hat!', reply: 'My hat is on my head! Roar!' },
        { friend: 2, item: 'shoes', line: 'Now my shoes, please!', reply: 'My shoes are on! Thank you!' },
      ],
      wrongLine: 'No, not the {item}! Listen again.',
      doneLine: "We are ready! Let's play in the snow!" },
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
