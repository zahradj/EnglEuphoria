import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const garden = `${S}/bg-u4l4-garden-wide.png`;

/** Pre-A1 Unit 4 Lesson 4 "My Big Body!" — Monster Garden Quest.
 *  Practises "I have two eyes / ten fingers / big feet", Bo the three-eyed
 *  monster, big / small, and B /b/ (ball, bag, bear, book). */
export const QUEST_MONSTER_GARDEN_U4L4: HomeworkQuest = {
  id: 'monster-garden-u4l4',
  title: 'Monster Garden Quest',
  subtitle: 'My Big Body! · Pre-A1 Unit 4 · Lesson 4',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-4-4',
  theme: { accent: '#38BDF8', accent2: '#F97316', night: false, mapImg: garden, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Says It?', icon: '👀', intro: 'Listen. Tap the right picture!', img: garden,
      rounds: [
        { line: 'I have two eyes!', answer: 'Pip eyes', options: [{ label: 'Bo eyes', src: `${S}/bg-u4l4-bo-eyes-wide.png` }, { label: 'Pip eyes', src: `${S}/bg-u4l4-pip-eyes-wide.png` }, { label: 'Bo feet', src: `${S}/bg-u4l4-bo-feet-wide.png` }] },
        { line: 'I have big feet!', answer: 'Bo feet', options: [{ label: 'Bo feet', src: `${S}/bg-u4l4-bo-feet-wide.png` }, { label: 'Pip fingers', src: `${S}/bg-u4l4-pip-fingers-wide.png` }, { label: 'Pip eyes', src: `${S}/bg-u4l4-pip-eyes-wide.png` }] },
        { line: 'I have ten fingers!', answer: 'Pip fingers', options: [{ label: 'Pip eyes', src: `${S}/bg-u4l4-pip-eyes-wide.png` }, { label: 'Bo eyes', src: `${S}/bg-u4l4-bo-eyes-wide.png` }, { label: 'Pip fingers', src: `${S}/bg-u4l4-pip-fingers-wide.png` }] },
        { line: 'I have three eyes!', answer: 'Bo eyes', options: [{ label: 'Bo eyes', src: `${S}/bg-u4l4-bo-eyes-wide.png` }, { label: 'Bo feet', src: `${S}/bg-u4l4-bo-feet-wide.png` }, { label: 'Pip eyes', src: `${S}/bg-u4l4-pip-eyes-wide.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u4l4-bo-eyes-wide.png`, line: 'Bo has three eyes!', isTrue: true },
        { img: `${S}/bg-u4l4-bo-feet-wide.png`, line: 'Bo has small feet!', isTrue: false },
        { img: `${S}/bg-u4l4-pip-eyes-wide.png`, line: 'Pip has two eyes!', isTrue: true },
        { img: `${S}/bg-u4l4-pip-fingers-wide.png`, line: 'Pip has three fingers!', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'B or F?', icon: '🐻', intro: 'Listen to the word. Which sound does it start with?', img: garden, choices: ['B', 'F'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'ball', answer: 'B', picture: `${I}/item-ball-red.png` },
        { word: 'fish', answer: 'F', picture: `${I}/item-fish.png` },
        { word: 'bear', answer: 'B', picture: `${I}/item-bear.png` },
        { word: 'fan', answer: 'F', picture: `${I}/item-fan.png` },
        { word: 'book', answer: 'B', picture: `${I}/item-book.png` },
      ] },
    { kind: 'treasure', name: 'Monster Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: garden, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! I have two eyes! Bo has three eyes! Bye, Bo!' },
  ],
};
