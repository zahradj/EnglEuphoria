import type { HomeworkQuest } from './types';

const J = '/jungle-adventure/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const rescue = (n: number) => `${J}/bg-jungle-rescue-${n}-wide.png`;
const A = { elephant: it('elephant'), snake: it('snake'), crocodile: it('alligator'), monkey: it('coco-cheer'), frog: it('frog'), bird: it('bird'), lion: it('lion'), fish: it('fish') };

/** A1 Jungle Adventure Unit 2 Lesson 6 "Jungle Game Day!" — fast review quest of all Unit 2 language. */
export const QUEST_JUNGLE_GAME_DAY_A1_U2L6: HomeworkQuest = {
  id: 'jungle-game-day-a1-u2l6',
  title: 'Jungle Game Day Quest',
  subtitle: 'Jungle Game Day! · A1 Unit 2 · Lesson 6',
  level: 'A1',
  lessonKey: 'jungle-rich-2-6',
  theme: { accent: '#16A34A', accent2: '#F59E0B', night: false, mapImg: `${J}/bg-jungle-obstacle-course.png`, guide: '/lep1/characters/leo-happy.png', walker: '/lep1/characters/willow-hello.png' },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Quick Ears', icon: '👂', intro: 'Listen. Tap the animal fast!', img: `${J}/bg-jungle-waterfall-party.png`,
      rounds: [
        { line: 'It’s big and yellow. It can run fast.', answer: 'lion', options: [{ label: 'lion', src: A.lion }, { label: 'frog', src: A.frog }, { label: 'fish', src: A.fish }] },
        { line: 'It’s small and blue. It can fly.', answer: 'bird', options: [{ label: 'snake', src: A.snake }, { label: 'bird', src: A.bird }, { label: 'elephant', src: A.elephant }] },
        { line: 'It can swing. It can climb.', answer: 'monkey', options: [{ label: 'fish', src: A.fish }, { label: 'crocodile', src: A.crocodile }, { label: 'monkey', src: A.monkey }] },
      ] },
    { kind: 'true-false', name: 'Can or Can’t?', icon: '👍', intro: 'Look and listen. True or false?',
      rounds: [
        { img: A.lion, aspect: 1, line: 'A lion can run fast.', isTrue: true },
        { img: A.frog, aspect: 1, line: 'A frog can’t jump.', isTrue: false },
        { img: A.crocodile, aspect: 1, line: 'It’s got a long tail.', isTrue: true },
        { img: A.elephant, aspect: 1, line: 'It’s small and green.', isTrue: false },
      ] },
    { kind: 'twister', name: 'Chip Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: `${J}/bg-jungle-coco-swing.png`, line: 'Chip the chimp chews chips.', seconds: 40, focus: 'ch', sayIt: 'Now say it slow, faster, and at jungle speed!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🐥', intro: 'Tap each sound, then Blend!', img: `${J}/bg-jungle-wide.png`,
      rounds: [
        { word: 'chick', sounds: ['ch', 'i', 'ck'], picture: it('chick') },
        { word: 'fish', sounds: ['f', 'i', 'sh'], picture: it('fish') },
        { word: 'big', sounds: ['b', 'i', 'g'], picture: it('elephant') },
      ] },
    { kind: 'sentence-builder', name: 'Build It Fast', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: A.lion, line: 'Can a lion run?', extra: ['swim'] },
        { img: A.bird, line: 'It’s small and blue.', extra: ['big'] },
        { img: A.snake, line: 'It can’t walk.', extra: ['can'] },
      ] },
    { kind: 'treasure', name: 'Golden Banana', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img: `${J}/bg-jungle-waterfall-party.png`, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! Jungle Game Day champion!' },
  ],
};
