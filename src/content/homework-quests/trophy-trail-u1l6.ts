import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const trail = `${S}/bg-l6-trophy-trail.jpg`;

/** Pre-A1 Unit 1 Lesson 6 "The Trophy Trail" — Trophy Trail Quest (unit
 *  review). Practises all 8 Unit 1 sounds (H M W N A S B T), names, ages and
 *  feelings with I am / he is / she is. */
export const QUEST_TROPHY_TRAIL_U1L6: HomeworkQuest = {
  id: 'trophy-trail-u1l6',
  title: 'Trophy Trail Quest',
  subtitle: 'The Trophy Trail · Pre-A1 Unit 1 · Lesson 6',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-1-6',
  theme: { accent: '#EAB308', accent2: '#16A34A', night: false, mapImg: trail, guide: `${C}/pip-happy.png`, walker: `${C}/leo-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'sound-choice', name: 'Sound Path 1', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: trail, choices: ['H', 'M', 'W', 'N'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'house', answer: 'H', picture: `${I}/item-house.png` },
        { word: 'milk', answer: 'M', picture: `${I}/item-milk.png` },
        { word: 'wind', answer: 'W', picture: `${I}/item-wind.png` },
        { word: 'nut', answer: 'N', picture: `${I}/item-nut.png` },
      ] },
    { kind: 'sound-choice', name: 'Sound Path 2', icon: '⭐', intro: 'Listen to the word. Which sound does it start with?', img: trail, choices: ['A', 'S', 'B', 'T'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'ant', answer: 'A', picture: `${I}/item-ant.png` },
        { word: 'sun', answer: 'S', picture: `${I}/item-sun.png` },
        { word: 'bag', answer: 'B', picture: `${I}/item-bag.png` },
        { word: 'toy', answer: 'T', picture: `${I}/item-toy.png` },
      ] },
    { kind: 'picture-choice', name: 'He or She?', icon: '😊', intro: 'Listen. Tap the right friend!', img: trail,
      rounds: [
        { line: 'She is sad.', answer: 'Sad Mia', options: [{ label: 'Sad Mia', src: `${C}/mia-sad.png` }, { label: 'Happy Leo', src: `${C}/leo-happy.png` }, { label: 'Angry Pip', src: `${C}/pip-angry.png` }] },
        { line: 'He is happy.', answer: 'Happy Leo', options: [{ label: 'Sad Bella', src: `${C}/bella-sad.png` }, { label: 'Happy Leo', src: `${C}/leo-happy.png` }, { label: 'Angry Mia', src: `${C}/mia-angry.png` }] },
        { line: 'He is angry.', answer: 'Angry Pip', options: [{ label: 'Happy Bella', src: `${C}/bella-happy.png` }, { label: 'Sad Mia', src: `${C}/mia-sad.png` }, { label: 'Angry Pip', src: `${C}/pip-angry.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-l4-bella-five.jpg`, line: 'Bella is five.', isTrue: true },
        { img: `${S}/bg-l1-mia-solo.jpg`, line: 'Hello! My name is Mia.', isTrue: true },
        { img: `${S}/bg-l4-leo-seven.jpg`, line: 'Leo is six.', isTrue: false },
        { img: `${S}/bg-l1-pip-solo.jpg`, line: 'Hello! My name is Bella.', isTrue: false },
      ] },
    { kind: 'treasure', name: 'Trophy Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to win the trophy!', img: `${S}/bg-l6-trophy-podium.jpg`, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! You won the Unit 1 trophy! Hooray!' },
  ],
};
