import type { HomeworkQuest } from './types';

const J = '/jungle-adventure/scenes';
const actions = `${J}/bg-jungle-actions.png`;
const it = (n: string) => `/lep1/items/item-${n}.png`;

/** A1 Jungle Adventure Unit 2 Lesson 2 "What Can Animals Do?" — Jungle Games Quest.
 *  Practises climb, swing, run, fly, swim, jump, "A monkey can climb." and "It can't fly.", and the ch sound. */
export const QUEST_JUNGLE_GAMES_A1_U2L2: HomeworkQuest = {
  id: 'jungle-games-a1-u2l2',
  title: 'Jungle Games Quest',
  subtitle: 'What Can Animals Do? · A1 Unit 2 · Lesson 2',
  level: 'A1',
  lessonKey: 'jungle-rich-2-2',
  theme: { accent: '#16A34A', accent2: '#F59E0B', night: false, mapImg: `${J}/bg-jungle-obstacle-course.png`, guide: '/lep1/characters/leo-happy.png', walker: '/lep1/characters/willow-hello.png' },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'tap-hotspot', name: 'Who Can Do It?', icon: '🌴', intro: 'Listen. Tap the animal!', img: actions, aspect: 1376 / 768,
      spots: [
        { label: 'monkey', box: { x: 8, y: 14, w: 17, h: 38 } },
        { label: 'lion', box: { x: 32, y: 42, w: 24, h: 40 } },
        { label: 'bird', box: { x: 59, y: 18, w: 15, h: 22 } },
        { label: 'frog', box: { x: 54, y: 66, w: 12, h: 22 } },
        { label: 'fish', box: { x: 76, y: 74, w: 13, h: 19 } },
      ],
      rounds: [
        { target: 'bird', line: 'Who can fly?' },
        { target: 'monkey', line: 'Who can climb?' },
        { target: 'fish', line: 'Who can swim?' },
        { target: 'frog', line: 'Who can jump?' },
        { target: 'lion', line: 'Who can run?' },
      ] },
    { kind: 'true-false', name: 'Can or Can’t?', icon: '👍', intro: 'Look and listen. True or false?',
      rounds: [
        { img: `${J}/bg-jungle-coco-swing.png`, line: 'A monkey can swing.', isTrue: true },
        { img: `${J}/bg-jungle-coco-cant-fly.png`, line: 'A monkey can fly.', isTrue: false },
        { img: it('fish-swim'), aspect: 1, line: 'A fish can run.', isTrue: false },
        { img: it('willow-fly'), aspect: 1, line: 'A bird can fly.', isTrue: true },
        { img: it('leo-run'), aspect: 1, line: 'A lion can’t swing.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: `${J}/bg-jungle-coco-cant-fly.png`, line: 'A monkey can climb.', extra: ['fly'] },
        { img: `${J}/bg-jungle-coco-cant-fly.png`, line: 'It can’t fly.', extra: ['can'] },
        { img: actions, line: 'A fish can swim.', extra: ['run'] },
      ] },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🐸', intro: 'Tap each sound, then Blend! ch is one sound.', img: `${J}/bg-jungle-wide.png`,
      rounds: [
        { word: 'chip', sounds: ['ch', 'i', 'p'], picture: it('chip') },
        { word: 'chick', sounds: ['ch', 'i', 'ck'], picture: it('chick') },
        { word: 'bench', sounds: ['b', 'e', 'n', 'ch'], picture: it('bench') },
      ] },
    { kind: 'treasure', name: 'Golden Banana', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img: `${J}/bg-jungle-waterfall-party.png`, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! A monkey can climb. It can’t fly!' },
  ],
};
