import type { HomeworkQuest } from './types';

const J = '/jungle-adventure/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const rescue = (n: number) => `${J}/bg-jungle-rescue-${n}-wide.png`;
const A = { elephant: it('elephant'), snake: it('snake'), crocodile: it('alligator'), monkey: it('coco-cheer'), frog: it('frog'), bird: it('bird'), lion: it('lion'), fish: it('fish') };

/** A1 Jungle Adventure Unit 2 Lesson 3 "Can It…?" — Help Kip Quest.
 *  Practises "Can it…?" / "Yes, it can." / "No, it can't.", the story start and the ck sound. */
export const QUEST_HELP_KIP_A1_U2L3: HomeworkQuest = {
  id: 'help-kip-a1-u2l3',
  title: 'Help Kip Quest',
  subtitle: 'Can It…? · A1 Unit 2 · Lesson 3',
  level: 'A1',
  lessonKey: 'jungle-rich-2-3',
  theme: { accent: '#16A34A', accent2: '#F59E0B', night: false, mapImg: rescue(5), guide: '/lep1/characters/leo-happy.png', walker: '/lep1/characters/willow-hello.png' },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Can Help?', icon: '🙋', intro: 'Listen. Who is it? Tap the animal!', img: `${J}/bg-jungle-wide.png`,
      rounds: [
        { line: 'Can it fly? Yes, it can.', answer: 'bird', options: [{ label: 'fish', src: A.fish }, { label: 'bird', src: A.bird }, { label: 'snake', src: A.snake }] },
        { line: 'Can it swim? Yes, it can. It can’t walk.', answer: 'fish', options: [{ label: 'fish', src: A.fish }, { label: 'lion', src: A.lion }, { label: 'monkey', src: A.monkey }] },
        { line: 'Can it climb? Yes, it can!', answer: 'monkey', options: [{ label: 'elephant', src: A.elephant }, { label: 'frog', src: A.frog }, { label: 'monkey', src: A.monkey }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '👍', intro: 'Look and listen. True or false?',
      rounds: [
        { img: A.snake, aspect: 1, line: 'A snake can’t fly.', isTrue: true },
        { img: A.fish, aspect: 1, line: 'A fish can swim.', isTrue: true },
        { img: A.elephant, aspect: 1, line: 'An elephant can fly.', isTrue: false },
        { img: A.bird, aspect: 1, line: 'A bird can’t fly.', isTrue: false },
        { img: rescue(6), line: 'The bird can’t help Kip.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Ask and Answer', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: A.fish, line: 'Can it swim?', extra: ['fly'] },
        { img: A.fish, line: 'Yes, it can.', extra: ['can’t'] },
        { img: A.snake, line: 'No, it can’t.', extra: ['can'] },
      ] },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🦆', intro: 'Tap each sound, then Blend! ck is one sound.', img: `${J}/bg-jungle-wide.png`,
      rounds: [
        { word: 'duck', sounds: ['d', 'u', 'ck'], picture: it('duck-yellow') },
        { word: 'rock', sounds: ['r', 'o', 'ck'], picture: it('stone') },
        { word: 'chick', sounds: ['ch', 'i', 'ck'], picture: it('chick') },
      ] },
    { kind: 'twister', name: 'Rock Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: rescue(5), line: 'A duck on a rock eats a snack.', seconds: 40, focus: 'ck', sayIt: 'Now say it slow, faster, and at jungle speed!' },
    { kind: 'treasure', name: 'Golden Banana', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img: `${J}/bg-jungle-waterfall-party.png`, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! Can it swim? Yes, it can!' },
  ],
};
