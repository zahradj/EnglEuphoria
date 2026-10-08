import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const shelf = `${S}/bg-u3l2-shelf-wide.png`;

/** Pre-A1 Unit 3 Lesson 2 "Teddy Bear, Blocks, Train!" — Toy Shelf Quest.
 *  Practises teddy bear, blocks, train (+ ball), ONE or MANY — "It's a train!"
 *  / "They are trains!" — and T /t/ (teddy, train, ten). */
export const QUEST_TOY_SHELF_U3L2: HomeworkQuest = {
  id: 'toy-shelf-u3l2',
  title: 'Toy Shelf Quest',
  subtitle: 'Teddy Bear, Blocks, Train! · Pre-A1 Unit 3 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-3-2',
  theme: { accent: '#2563EB', accent2: '#F97316', night: false, mapImg: `${S}/bg-u3l2-party-wide.png`, guide: `${C}/pip-hello.png`, walker: `${C}/mia-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'One or Many?', icon: '🧸', intro: 'Listen. One, or many? Tap the picture!', img: shelf,
      rounds: [
        { line: "It's a teddy bear!", answer: 'Teddy bear', options: [{ label: 'Teddy bears', src: `${I}/item-teddies.png` }, { label: 'Teddy bear', src: `${I}/item-teddy.png` }, { label: 'Train', src: `${I}/item-train.png` }] },
        { line: 'They are trains!', answer: 'Trains', options: [{ label: 'Train', src: `${I}/item-train.png` }, { label: 'Blocks', src: `${I}/item-blocks.png` }, { label: 'Trains', src: `${I}/item-trains.png` }] },
        { line: 'They are teddy bears!', answer: 'Teddy bears', options: [{ label: 'Teddy bears', src: `${I}/item-teddies.png` }, { label: 'Teddy bear', src: `${I}/item-teddy.png` }, { label: 'Balls', src: `${I}/item-balls.png` }] },
        { line: "It's a train!", answer: 'Train', options: [{ label: 'Trains', src: `${I}/item-trains.png` }, { label: 'Train', src: `${I}/item-train.png` }, { label: 'Teddy bear', src: `${I}/item-teddy.png` }] },
      ] },
    { kind: 'tap-hotspot', name: 'The Toy Shelf', icon: '🚂', intro: 'Listen. Find it on the shelf!', img: shelf, aspect: 1376 / 768,
      spots: [
        { label: 'teddy', box: { x: 4, y: 30, w: 18, h: 32 } },
        { label: 'teddies', box: { x: 29, y: 30, w: 20, h: 32 } },
        { label: 'train', box: { x: 58, y: 30, w: 22, h: 32 } },
        { label: 'blocks', box: { x: 4, y: 68, w: 20, h: 30 } },
        { label: 'ball', box: { x: 36, y: 68, w: 18, h: 30 } },
        { label: 'balls', box: { x: 59, y: 68, w: 21, h: 30 } },
      ],
      rounds: [
        { target: 'train', line: "Find the train. It's a train!" },
        { target: 'blocks', line: 'Find the blocks. They are blocks!' },
        { target: 'teddies', line: 'Find the teddy bears. They are teddy bears!' },
        { target: 'ball', line: "Find the ball. It's a ball!" },
      ] },
    { kind: 'sound-choice', name: 'T, B, or D?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: shelf, choices: ['T', 'B', 'D'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'teddy', answer: 'T', picture: `${I}/item-teddy.png` },
        { word: 'ball', answer: 'B', picture: `${I}/item-ball-red.png` },
        { word: 'train', answer: 'T', picture: `${I}/item-train.png` },
        { word: 'doll', answer: 'D', picture: `${I}/item-doll.png` },
        { word: 'ten', answer: 'T', picture: `${I}/item-ten.png` },
      ] },
    { kind: 'treasure', name: 'Toy Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the toy chest to open it!', img: shelf, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! A teddy bear, blocks and a train!' },
  ],
};
