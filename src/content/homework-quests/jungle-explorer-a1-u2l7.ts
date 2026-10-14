import type { HomeworkQuest } from './types';

const J = '/jungle-adventure/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const rescue = (n: number) => `${J}/bg-jungle-rescue-${n}-wide.png`;
const A = { elephant: it('elephant'), snake: it('snake'), crocodile: it('alligator'), monkey: it('coco-cheer'), frog: it('frog'), bird: it('bird'), lion: it('lion'), fish: it('fish') };

/** A1 Jungle Adventure Unit 2 Lesson 7 "Boss Test: Jungle Explorer!" — practice for the unit test. */
export const QUEST_JUNGLE_EXPLORER_A1_U2L7: HomeworkQuest = {
  id: 'jungle-explorer-a1-u2l7',
  title: 'Jungle Explorer Boss Quest',
  subtitle: 'Boss Test: Jungle Explorer! · A1 Unit 2 · Lesson 7',
  level: 'A1',
  lessonKey: 'jungle-rich-2-7',
  theme: { accent: '#16A34A', accent2: '#F59E0B', night: false, mapImg: `${J}/bg-jungle-title.png`, guide: '/lep1/characters/leo-happy.png', walker: '/lep1/characters/willow-hello.png' },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Listen', icon: '👂', intro: 'Listen. Tap the animal!', img: `${J}/bg-jungle-wide.png`,
      rounds: [
        { line: 'It’s long and green. It can’t walk.', answer: 'snake', options: [{ label: 'snake', src: A.snake }, { label: 'frog', src: A.frog }, { label: 'crocodile', src: A.crocodile }] },
        { line: 'It’s got a long nose. It can lift Kip.', answer: 'elephant', options: [{ label: 'lion', src: A.lion }, { label: 'elephant', src: A.elephant }, { label: 'bird', src: A.bird }] },
        { line: 'It’s small. It can fly.', answer: 'bird', options: [{ label: 'fish', src: A.fish }, { label: 'monkey', src: A.monkey }, { label: 'bird', src: A.bird }] },
      ] },
    { kind: 'reading', name: 'Read', icon: '📖', intro: 'Read the story page. Then answer from memory!', img: rescue(10),
      sentences: ['I am big. I can walk in the river.', 'The elephant lifts Kip with its long nose.', 'Thank you, Elephant!'],
      questions: [
        { q: 'Who is big?', options: ['Kip', 'the elephant', 'the bird'], answer: 'the elephant' },
        { q: 'How does the elephant lift Kip?', options: ['with its long nose', 'with its tail', 'with its teeth'], answer: 'with its long nose' },
      ] },
    { kind: 'true-false', name: 'True or False', icon: '⚖️', intro: 'Look and listen. True or false?',
      rounds: [
        { img: A.fish, aspect: 1, line: 'A fish can’t fly.', isTrue: true },
        { img: A.monkey, aspect: 1, line: 'A monkey can’t climb.', isTrue: false },
        { img: A.snake, aspect: 1, line: 'It’s got a long tail.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Build', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: A.bird, line: 'Can it fly?', extra: ['swim'] },
        { img: A.crocodile, line: 'It’s got a long tail.', extra: ['nose'] },
        { img: A.fish, line: 'I can swim!', extra: ['fly'] },
      ] },
    { kind: 'twister', name: 'Boss Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: rescue(5), line: 'Big Kip sits on a big rock.', seconds: 40, focus: 'i', sayIt: 'Now say it slow, faster, and at jungle speed!' },
    { kind: 'treasure', name: 'Golden Banana', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img: rescue(12), closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! You are a Jungle Explorer!' },
  ],
};
