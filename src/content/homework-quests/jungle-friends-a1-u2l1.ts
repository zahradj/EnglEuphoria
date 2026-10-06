import type { HomeworkQuest } from './types';

const J = '/jungle-adventure/scenes';
const friends = `${J}/bg-jungle-friends.png`;

/** A1 Jungle Adventure Unit 2 Lesson 1 "Jungle Animals" — Jungle Friends Quest.
 *  Practises lion, monkey, bird, "I am a …!", "This is a …", Coco / Leo /
 *  Willow and what they can do (run, climb, fly). */
export const QUEST_JUNGLE_FRIENDS_A1_U2L1: HomeworkQuest = {
  id: 'jungle-friends-a1-u2l1',
  title: 'Jungle Friends Quest',
  subtitle: 'Jungle Animals: Lion, Monkey, Bird · A1 Unit 2 · Lesson 1',
  level: 'A1',
  lessonKey: 'jungle-rich-2-1',
  theme: { accent: '#16A34A', accent2: '#F59E0B', night: false, mapImg: `${J}/bg-jungle-wide.png`, guide: '/lep1/characters/leo-happy.png', walker: '/lep1/characters/willow-hello.png' },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'tap-hotspot', name: 'Find the Animal', icon: '🌴', intro: 'Listen. Find the animal!', img: friends, aspect: 1376 / 768,
      spots: [
        { label: 'monkey', box: { x: 27, y: 30, w: 13, h: 68 } },
        { label: 'lion', box: { x: 41, y: 18, w: 15, h: 80 } },
        { label: 'bird', box: { x: 57, y: 28, w: 15, h: 36 } },
      ],
      rounds: [
        { target: 'lion', line: 'Find the lion.' },
        { target: 'bird', line: 'Find the bird.' },
        { target: 'monkey', line: 'Find the monkey.' },
      ] },
    { kind: 'picture-choice', name: 'Who Can Do It?', icon: '🐒', intro: 'Listen. Who is it? Tap the animal!', img: `${J}/bg-jungle-wide.png`,
      rounds: [
        { line: 'I can climb trees!', answer: 'Monkey', options: [{ label: 'Lion', src: `${J}/bg-jungle-leo-den.png` }, { label: 'Monkey', src: `${J}/bg-jungle-coco-vines.png` }, { label: 'Bird', src: `${J}/bg-jungle-willow-nest.png` }] },
        { line: 'I can fly high!', answer: 'Bird', options: [{ label: 'Bird', src: `${J}/bg-jungle-willow-nest.png` }, { label: 'Lion', src: `${J}/bg-jungle-leo-den.png` }, { label: 'Monkey', src: `${J}/bg-jungle-coco-vines.png` }] },
        { line: 'I can run very fast!', answer: 'Lion', options: [{ label: 'Monkey', src: `${J}/bg-jungle-coco-vines.png` }, { label: 'Bird', src: `${J}/bg-jungle-willow-nest.png` }, { label: 'Lion', src: `${J}/bg-jungle-leo-den.png` }] },
      ] },
    { kind: 'true-false', name: 'True or False', icon: '⚖️', intro: 'Look and listen. True or false?',
      rounds: [
        { img: `${J}/bg-jungle-leo-den.png`, line: 'This is a lion.', isTrue: true },
        { img: `${J}/bg-jungle-coco-vines.png`, line: 'I am a bird!', isTrue: false },
        { img: `${J}/bg-jungle-willow-nest.png`, line: 'I am a bird!', isTrue: true },
        { img: `${J}/bg-jungle-coco-vines.png`, line: 'Hi! My name is Coco. I am a monkey!', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: `${J}/bg-jungle-leo-den.png`, line: 'I am a lion.', extra: ['bird'] },
        { img: `${J}/bg-jungle-coco-vines.png`, line: 'This is a monkey.', extra: ['lion'] },
        { img: friends, line: 'Three jungle friends!', extra: ['sad'] },
      ] },
    { kind: 'treasure', name: 'Jungle Chest', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img: friends, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! Lion, monkey and bird — three jungle friends!' },
  ],
};
