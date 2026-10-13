import type { HomeworkQuest } from './types';

const J = '/jungle-adventure/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const rescue = (n: number) => `${J}/bg-jungle-rescue-${n}-wide.png`;
const A = { elephant: it('elephant'), snake: it('snake'), crocodile: it('alligator'), monkey: it('coco-cheer'), frog: it('frog'), bird: it('bird'), lion: it('lion'), fish: it('fish') };

/** A1 Jungle Adventure Unit 2 Lesson 4 "Talk About Animals!" — Jungle Expert Quest.
 *  Practises describing an animal in 4 sentences ("It's got a long tail. It can swim."), "Has it got…?" and the sh sound. */
export const QUEST_JUNGLE_EXPERT_A1_U2L4: HomeworkQuest = {
  id: 'jungle-expert-a1-u2l4',
  title: 'Jungle Expert Quest',
  subtitle: 'Talk About Animals! · A1 Unit 2 · Lesson 4',
  level: 'A1',
  lessonKey: 'jungle-rich-2-4',
  theme: { accent: '#16A34A', accent2: '#F59E0B', night: false, mapImg: rescue(10), guide: '/lep1/characters/leo-happy.png', walker: '/lep1/characters/willow-hello.png' },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Is It?', icon: '🔍', intro: 'Listen. Which animal is it? Tap it!', img: `${J}/bg-jungle-wide.png`,
      rounds: [
        { line: 'It’s got a long nose. It’s big and grey.', answer: 'elephant', options: [{ label: 'elephant', src: A.elephant }, { label: 'lion', src: A.lion }, { label: 'frog', src: A.frog }] },
        { line: 'It’s got a long tail. It can swim.', answer: 'crocodile', options: [{ label: 'bird', src: A.bird }, { label: 'crocodile', src: A.crocodile }, { label: 'monkey', src: A.monkey }] },
        { line: 'It’s small and green. It can jump.', answer: 'frog', options: [{ label: 'snake', src: A.snake }, { label: 'fish', src: A.fish }, { label: 'frog', src: A.frog }] },
      ] },
    { kind: 'reading', name: 'Expert Card', icon: '📖', intro: 'Read the expert card. Then answer from memory!', img: rescue(8), focus: 'sh',
      sentences: ['It’s a crocodile.', 'It’s big and green.', 'It’s got a long tail.', 'It can swim.', 'It can’t fly.'],
      questions: [
        { q: 'What is it?', options: ['an elephant', 'a crocodile', 'a frog'], answer: 'a crocodile' },
        { q: 'Can it fly?', options: ['Yes, it can.', 'No, it can’t.'], answer: 'No, it can’t.' },
        { q: 'What colour is it?', options: ['grey', 'green', 'yellow'], answer: 'green' },
      ] },
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: A.elephant, line: 'It’s got a long nose.', extra: ['tail'] },
        { img: A.elephant, line: 'It’s big and grey.', extra: ['small'] },
        { img: A.crocodile, line: 'Has it got a long tail?', extra: ['nose'] },
      ] },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🐠', intro: 'Tap each sound, then Blend! sh is one sound.', img: `${J}/bg-jungle-wide.png`,
      rounds: [
        { word: 'fish', sounds: ['f', 'i', 'sh'], picture: it('fish') },
        { word: 'ship', sounds: ['sh', 'i', 'p'], picture: it('ship') },
        { word: 'shell', sounds: ['sh', 'e', 'll'], picture: it('shell') },
      ] },
    { kind: 'twister', name: 'Splash Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: `${J}/bg-jungle-waterfall-party.png`, line: 'Shy fish swish and splash.', seconds: 40, focus: 'sh', sayIt: 'Now say it slow, faster, and at jungle speed!' },
    { kind: 'treasure', name: 'Golden Banana', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img: `${J}/bg-jungle-friends.png`, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! You are a jungle expert!' },
  ],
};
