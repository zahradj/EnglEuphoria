import type { HomeworkQuest } from './types';

const S = '/magic-castle/scenes';
const K = '/magic-castle/stickers';
const L = (n: string) => `/lep1/items/item-${n}.png`;
const TOWER = 1344 / 768;
const P1 = `${S}/bg-castle-tower-p1.png`;
const P2 = `${S}/bg-castle-tower-p2.png`;
const P3 = `${S}/bg-castle-tower-p3.png`;
const WIM = `${S}/sticker-wim.png`;
const CAT = `${S}/sticker-catcat.png`;
const PIP = L('pip-wave');
const MIA = L('mia-wave');

/**
 * Magic Castle, A1 Unit 9 Lesson 4 — "Wim's Tower Quest".
 * Practises There is / There are, between / in front of and Whose…? It's Wim's. in Wim's tower room. Harder than the
 * lesson: audio-only prompts, count-and-choose, a new reading and traps in the sentence builder. Every line is a
 * recorded clip (baked via allQuestLines) — never the browser voice (CLAUDE.md "Voice").
 */
export const QUEST_MAGIC_CASTLE_U9L4: HomeworkQuest = {
  id: 'magic-castle-u9l4',
  title: 'Wim’s Tower Quest',
  subtitle: 'Magic Castle · A1 Unit 9 · Lesson 4',
  level: 'A1',
  lessonKey: 'castle-rich-9-4',
  theme: { accent: '#f5c542', accent2: '#7c3aed', night: false, mapImg: `${S}/bg-castle-exterior.png`, guide: WIM, walker: CAT },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    {
      kind: 'tap-hotspot', name: 'Tower Room', icon: '🏰', intro: 'Listen. Tap the thing in Wim’s room.',
      img: P1, aspect: TOWER,
      spots: [
        { label: 'bed', box: { x: 38, y: 46, w: 24, h: 39 } },
        { label: 'armchair', box: { x: 78, y: 70, w: 17, h: 25 } },
        { label: 'door', box: { x: 3, y: 22, w: 18, h: 58 } },
        { label: 'fireplace', box: { x: 78, y: 15, w: 21, h: 52 } },
      ],
      rounds: [
        { target: 'bed', line: 'There is a big bed. Tap it!' },
        { target: 'door', line: 'There is one door. Tap it!' },
        { target: 'armchair', line: 'The armchair is in front of the fireplace. Tap the armchair!' },
        { target: 'fireplace', line: 'Tap the fireplace.' },
      ],
    },
    {
      kind: 'picture-choice', name: 'There Is or There Are?', icon: '🔢', intro: 'Listen. Which picture is it? Tap it.',
      img: P1,
      rounds: [
        { line: 'There are two lamps.', answer: 'two lamps', options: [{ label: 'one lamp', src: `${K}/lamp.png` }, { label: 'two lamps', src: P1 }, { label: 'a bed', src: `${K}/bed.png` }] },
        { line: 'There is a crown.', answer: 'crown', options: [{ label: 'crown', src: `${K}/crown.png` }, { label: 'ball', src: L('ball') }, { label: 'book', src: L('book') }] },
        { line: 'There is an armchair.', answer: 'armchair', options: [{ label: 'chair', src: `${K}/chair.png` }, { label: 'sofa', src: `${K}/sofa.png` }, { label: 'armchair', src: `${K}/armchair.png` }] },
        { line: 'There is a goat in a coat.', answer: 'goat', options: [{ label: 'cow', src: L('cow') }, { label: 'goat', src: L('goat') }, { label: 'coat', src: L('coat-blue') }] },
      ],
    },
    {
      kind: 'picture-choice', name: 'Whose Is It?', icon: '👑', intro: 'Listen. Whose is it? Tap the owner.',
      img: P3,
      rounds: [
        { line: 'It’s Wim’s crown.', answer: 'Wim', options: [{ label: 'Cat-cat', src: CAT }, { label: 'Wim', src: WIM }, { label: 'Mia', src: MIA }] },
        { line: 'It’s Cat-cat’s ball.', answer: 'Cat-cat', options: [{ label: 'Cat-cat', src: CAT }, { label: 'Pip', src: PIP }, { label: 'Wim', src: WIM }] },
        { line: 'It’s Pip’s hat.', answer: 'Pip', options: [{ label: 'Mia', src: MIA }, { label: 'Wim', src: WIM }, { label: 'Pip', src: PIP }] },
        { line: 'It’s Mia’s book.', answer: 'Mia', options: [{ label: 'Mia', src: MIA }, { label: 'Cat-cat', src: CAT }, { label: 'Pip', src: PIP }] },
      ],
    },
    {
      kind: 'true-false', name: 'True or False', icon: '⚖️', intro: 'Look at the picture. Listen. True or false?',
      rounds: [
        { img: P1, line: 'The bed is between the lamps.', isTrue: true },
        { img: P1, line: 'There are three windows.', isTrue: false },
        { img: P2, line: 'The crown is in front of the door.', isTrue: true },
        { img: P1, line: 'The armchair is between the windows.', isTrue: false },
        { img: P3, line: 'Cat-cat has a ball.', isTrue: true },
        { img: P2, line: 'There is a ball on the bed.', isTrue: true },
      ],
    },
    {
      kind: 'sentence-builder', name: 'Sentence Builder', icon: '🧱', intro: 'Look and listen. Build the sentence.',
      rounds: [
        { img: P1, line: 'There are two lamps.', extra: ['is', 'lamp'] },
        { img: P1, line: 'The bed is between the lamps.', extra: ['in', 'front'] },
        { img: P2, line: 'Whose crown is it?', extra: ['Where', 'are'] },
        { img: P3, line: 'It’s Cat-cat’s ball.', extra: ['Cat-cat', 'is'] },
      ],
    },
    {
      kind: 'reading', name: 'Tower Story', icon: '📖', intro: 'Read the story. Then answer the questions.', img: P3, focus: '\\bthere (is|are)\\b|\\bbetween\\b|\\bin front of\\b|\\w+’s\\b',
      sentences: [
        'Wim has a round tower room.',
        'There is a big bed between the lamps.',
        'There are two windows.',
        'Mia’s book is on the floor.',
        'Pip’s hat is in front of the door.',
        '“Whose things are these?” says Wim. “Let’s give them back!”',
      ],
      questions: [
        { q: 'How many windows are there?', options: ['One', 'Two', 'Three'], answer: 'Two' },
        { q: 'Where is the bed?', options: ['Between the lamps', 'In front of the door', 'On the floor'], answer: 'Between the lamps' },
        { q: 'Whose hat is it?', options: ['Wim’s', 'Mia’s', 'Pip’s'], answer: 'Pip’s' },
      ],
    },
    {
      kind: 'treasure', name: 'Treasure', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!',
      img: P3, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`,
      win: 'Hooray! The tower is tidy and everyone has their things. You are a room-designing wizard!',
    },
  ],
};
