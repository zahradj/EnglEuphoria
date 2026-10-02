import type { HomeworkQuest } from './types';

const W = '/welcome-town';
const party = `${W}/scenes/bg-party-door-wide.png`;
const spr = (who: string) => `${W}/sprites/${who}-wave.png`;

/** A1 Unit 1 Lesson 1 "Hello, My Name Is…" — Pip's Party Quest. Practises
 *  only what the lesson taught: hello/hi, goodbye/bye, "What's your name?",
 *  "My name's… / I'm…", the friends' names, and the sounds s, a, t. */
export const QUEST_WELCOME_TOWN_U1L1: HomeworkQuest = {
  id: 'welcome-town-u1l1',
  title: 'Pip’s Party Quest',
  subtitle: 'Hello, My Name Is… · A1 Unit 1 · Lesson 1',
  level: 'A1',
  lessonKey: 'wt-rich-1-1',
  theme: { accent: '#FE6A2F', accent2: '#FBBF24', night: false, mapImg: party, guide: spr('pip'), walker: spr('mia') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Hello or Goodbye?', icon: '👋', intro: 'Listen. Is it hello, or goodbye?', img: party,
      rounds: [
        { line: 'Hello!', answer: 'Hello', options: [{ label: 'Hello', emoji: '🙋' }, { label: 'Goodbye', emoji: '🚪' }] },
        { line: 'Bye!', answer: 'Goodbye', options: [{ label: 'Hello', emoji: '🙋' }, { label: 'Goodbye', emoji: '🚪' }] },
        { line: 'Hi!', answer: 'Hello', options: [{ label: 'Goodbye', emoji: '🚪' }, { label: 'Hello', emoji: '🙋' }] },
        { line: 'Goodbye!', answer: 'Goodbye', options: [{ label: 'Goodbye', emoji: '🚪' }, { label: 'Hello', emoji: '🙋' }] },
      ] },
    { kind: 'picture-choice', name: 'Who Is It?', icon: spr('mia'), intro: 'Listen to the name. Tap the friend!', img: party,
      rounds: [
        { line: 'Find Mia.', answer: 'Mia', options: [{ label: 'Leo', src: spr('leo') }, { label: 'Mia', src: spr('mia') }, { label: 'Bella', src: spr('bella') }] },
        { line: 'Find Leo.', answer: 'Leo', options: [{ label: 'Leo', src: spr('leo') }, { label: 'Willow', src: spr('willow') }, { label: 'Pip', src: spr('pip') }] },
        { line: 'Find Willow.', answer: 'Willow', options: [{ label: 'Bella', src: spr('bella') }, { label: 'Mia', src: spr('mia') }, { label: 'Willow', src: spr('willow') }] },
        { line: 'Find Bella.', answer: 'Bella', options: [{ label: 'Bella', src: spr('bella') }, { label: 'Pip', src: spr('pip') }, { label: 'Leo', src: spr('leo') }] },
      ] },
    { kind: 'true-false', name: 'True or False', icon: '⚖️', intro: 'Look and listen. True or false?',
      rounds: [
        { img: party, line: 'Hello, Leo!', isTrue: true, sticker: { src: spr('leo'), x: 31, y: 80, w: 16 } },
        { img: party, line: 'Hello, Mia!', isTrue: false, sticker: { src: spr('bella'), x: 31, y: 80, w: 14 } },
        { img: party, line: 'Hi, Willow!', isTrue: true, sticker: { src: spr('willow'), x: 31, y: 80, w: 16 } },
        { img: party, line: 'Hi, Pip!', isTrue: false, sticker: { src: spr('mia'), x: 31, y: 80, w: 16 } },
      ] },
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: party, line: 'What’s your name?', extra: ['Goodbye'] },
        { img: party, line: 'My name’s Pip.', extra: ['Hello'] },
        { img: party, line: 'Hello! I’m Mia.', extra: ['Bye'] },
      ] },
    { kind: 'sound-choice', name: 'S, A, or T?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: `${W}/scenes/bg-classroom-reading-wide.png`, choices: ['S', 'A', 'T'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'sun', answer: 'S', emoji: '☀️' },
        { word: 'apple', answer: 'A', emoji: '🍎' },
        { word: 'tiger', answer: 'T', emoji: '🐯' },
        { word: 'sock', answer: 'S', emoji: '🧦' },
        { word: 'ant', answer: 'A', emoji: '🐜' },
      ] },
    { kind: 'treasure', name: 'Party Box', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the party box to open it!', img: party, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! Hello, party star! Bye-bye!' },
  ],
};
