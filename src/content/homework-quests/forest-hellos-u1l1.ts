import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const forest = `${S}/bg-clearing.jpg`;

/** Pre-A1 Unit 1 Lesson 1 "The Forest of Hellos" — Hello Forest Quest.
 *  Practises only what the lesson taught: "Hello! My name is …", the
 *  friends' names, and H /h/ and M /m/ (hello, hat, house; mouse, moon, milk). */
export const QUEST_FOREST_HELLOS_U1L1: HomeworkQuest = {
  id: 'forest-hellos-u1l1',
  title: 'Hello Forest Quest',
  subtitle: 'The Forest of Hellos · Pre-A1 Unit 1 · Lesson 1',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-1-1',
  theme: { accent: '#16A34A', accent2: '#F97316', night: false, mapImg: forest, guide: `${C}/pip-hello.png`, walker: `${C}/mia-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Says Hello?', icon: '👋', intro: 'Listen. Tap the friend!', img: forest,
      rounds: [
        { line: 'Hello! My name is Pip.', answer: 'Pip', options: [{ label: 'Mia', src: `${C}/mia-hello.png` }, { label: 'Pip', src: `${C}/pip-hello.png` }, { label: 'Bella', src: `${C}/bella-hello.png` }] },
        { line: 'Hello! My name is Mia.', answer: 'Mia', options: [{ label: 'Mia', src: `${C}/mia-hello.png` }, { label: 'Leo', src: `${C}/leo-hello.png` }, { label: 'Pip', src: `${C}/pip-hello.png` }] },
        { line: 'Hello! My name is Bella.', answer: 'Bella', options: [{ label: 'Pip', src: `${C}/pip-hello.png` }, { label: 'Mia', src: `${C}/mia-hello.png` }, { label: 'Bella', src: `${C}/bella-hello.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-l1-pip-solo.jpg`, line: 'Hello! My name is Pip.', isTrue: true },
        { img: `${S}/bg-l1-mia-solo.jpg`, line: 'Hello! My name is Bella.', isTrue: false },
        { img: `${S}/bg-l1-bella-solo.jpg`, line: 'Hello! My name is Bella.', isTrue: true },
        { img: `${S}/bg-l1-pip-solo.jpg`, line: 'Hello! My name is Mia.', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'H or M?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: forest, choices: ['H', 'M'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'hat', answer: 'H', picture: `${I}/item-hat.png` },
        { word: 'moon', answer: 'M', picture: `${I}/item-moon.png` },
        { word: 'house', answer: 'H', picture: `${I}/item-house.png` },
        { word: 'milk', answer: 'M', picture: `${I}/item-milk.png` },
        { word: 'mouse', answer: 'M', picture: `${I}/item-mouse.png` },
      ] },
    { kind: 'treasure', name: 'Forest Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: forest, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! Hello, friend! Great listening!' },
  ],
};
