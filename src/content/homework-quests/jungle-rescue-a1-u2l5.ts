import type { HomeworkQuest } from './types';

const J = '/jungle-adventure/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const rescue = (n: number) => `${J}/bg-jungle-rescue-${n}-wide.png`;
const A = { elephant: it('elephant'), snake: it('snake'), crocodile: it('alligator'), monkey: it('coco-cheer'), frog: it('frog'), bird: it('bird'), lion: it('lion'), fish: it('fish') };

/** A1 Jungle Adventure Unit 2 Lesson 5 "The Jungle Rescue" — reading quest.
 *  Re-reads the story, checks who can help Kip and why, and blends story words. */
export const QUEST_JUNGLE_RESCUE_A1_U2L5: HomeworkQuest = {
  id: 'jungle-rescue-a1-u2l5',
  title: 'Jungle Rescue Quest',
  subtitle: 'The Jungle Rescue · A1 Unit 2 · Lesson 5',
  level: 'A1',
  lessonKey: 'jungle-rich-2-5',
  theme: { accent: '#16A34A', accent2: '#F59E0B', night: false, mapImg: rescue(1), guide: '/lep1/characters/leo-happy.png', walker: '/lep1/characters/willow-hello.png' },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: rescue(5),
      sentences: ['Kip is on a rock.', 'Help! Help! I am stuck!', 'The bird is small. It can’t help Kip.', 'The fish can’t lift Kip.', 'The elephant is big.', 'It lifts Kip with its long nose.'],
      questions: [
        { q: 'Where is Kip?', options: ['on a rock', 'in a tree', 'in a boat'], answer: 'on a rock' },
        { q: 'Who helps Kip?', options: ['the bird', 'the elephant', 'the fish'], answer: 'the elephant' },
        { q: 'Why can’t the bird help?', options: ['It is small.', 'It is green.', 'It is sad.'], answer: 'It is small.' },
      ] },
    { kind: 'true-false', name: 'Story Check', icon: '✅', intro: 'Look at the story picture. True or false?',
      rounds: [
        { img: rescue(5), line: 'Kip is on a rock.', isTrue: true },
        { img: rescue(6), line: 'The bird can lift Kip.', isTrue: false },
        { img: rescue(10), line: 'The elephant lifts Kip.', isTrue: true },
        { img: rescue(1), line: 'The jungle is small and blue.', isTrue: false },
      ] },
    { kind: 'picture-choice', name: 'Who Said It?', icon: '💬', intro: 'Listen. Who said it? Tap!', img: rescue(7),
      rounds: [
        { line: 'I can fly. But I am small.', answer: 'bird', options: [{ label: 'bird', src: A.bird }, { label: 'fish', src: A.fish }, { label: 'elephant', src: A.elephant }] },
        { line: 'I can swim. I can’t lift Kip!', answer: 'fish', options: [{ label: 'lion', src: A.lion }, { label: 'fish', src: A.fish }, { label: 'bird', src: A.bird }] },
        { line: 'I am big. I can walk in the river.', answer: 'elephant', options: [{ label: 'monkey', src: A.monkey }, { label: 'fish', src: A.fish }, { label: 'elephant', src: A.elephant }] },
      ] },
    { kind: 'sentence-builder', name: 'Story Words', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: rescue(5), line: 'Kip is on a rock.', extra: ['river'] },
        { img: rescue(10), line: 'The elephant lifts Kip.', extra: ['bird'] },
        { img: rescue(12), line: 'Thank you, friends!', extra: ['Hello'] },
      ] },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🐘', intro: 'Tap each sound, then Blend!', img: `${J}/bg-jungle-wide.png`,
      rounds: [
        { word: 'big', sounds: ['b', 'i', 'g'], picture: it('elephant') },
        { word: 'swim', sounds: ['s', 'w', 'i', 'm'], picture: it('fish-swim') },
        { word: 'chip', sounds: ['ch', 'i', 'p'], picture: it('chip') },
      ] },
    { kind: 'treasure', name: 'Golden Banana', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img: rescue(12), closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! Thank you, Elephant! Thank you, friends!' },
  ],
};
