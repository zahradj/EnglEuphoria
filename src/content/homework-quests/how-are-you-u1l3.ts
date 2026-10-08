import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const meadow = `${S}/bg-feelings-meadow.jpg`;

/** Pre-A1 Unit 1 Lesson 3 "How Are You?" — Feelings Meadow Quest.
 *  Practises happy / sad / angry with I am / he is / she is, and A /æ/
 *  (apple, ant, cat) and S /s/ (sad, sun, star). */
export const QUEST_HOW_ARE_YOU_U1L3: HomeworkQuest = {
  id: 'how-are-you-u1l3',
  title: 'Feelings Meadow Quest',
  subtitle: 'How Are You? · Pre-A1 Unit 1 · Lesson 3',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-1-3',
  theme: { accent: '#EC4899', accent2: '#22C55E', night: false, mapImg: meadow, guide: `${C}/pip-happy.png`, walker: `${C}/bella-happy.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'How Do They Feel?', icon: '😊', intro: 'Listen. Tap the right face!', img: meadow,
      rounds: [
        { line: 'He is happy.', answer: 'Happy Pip', options: [{ label: 'Happy Pip', src: `${C}/pip-happy.png` }, { label: 'Sad Pip', src: `${C}/pip-sad.png` }, { label: 'Angry Pip', src: `${C}/pip-angry.png` }] },
        { line: 'She is sad.', answer: 'Sad Bella', options: [{ label: 'Happy Bella', src: `${C}/bella-happy.png` }, { label: 'Angry Bella', src: `${C}/bella-angry.png` }, { label: 'Sad Bella', src: `${C}/bella-sad.png` }] },
        { line: 'He is angry.', answer: 'Angry Leo', options: [{ label: 'Angry Leo', src: `${C}/leo-angry.png` }, { label: 'Happy Leo', src: `${C}/leo-happy.png` }, { label: 'Sad Leo', src: `${C}/leo-sad.png` }] },
        { line: 'She is happy.', answer: 'Happy Mia', options: [{ label: 'Sad Mia', src: `${C}/mia-sad.png` }, { label: 'Happy Mia', src: `${C}/mia-happy.png` }, { label: 'Angry Mia', src: `${C}/mia-angry.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: meadow, line: 'I am happy!', isTrue: true, sticker: { src: `${C}/mia-happy.png`, x: 50, y: 92, w: 20 } },
        { img: meadow, line: 'I am sad.', isTrue: false, sticker: { src: `${C}/leo-happy.png`, x: 50, y: 92, w: 20 } },
        { img: meadow, line: 'I am angry!', isTrue: true, sticker: { src: `${C}/pip-angry.png`, x: 50, y: 92, w: 20 } },
        { img: meadow, line: 'I am happy!', isTrue: false, sticker: { src: `${C}/bella-sad.png`, x: 50, y: 92, w: 20 } },
      ] },
    { kind: 'sound-choice', name: 'A or S?', icon: '🍎', intro: 'Listen to the word. Which sound does it start with?', img: meadow, choices: ['A', 'S'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'apple', answer: 'A', picture: `${I}/item-apple.png` },
        { word: 'sun', answer: 'S', picture: `${I}/item-sun.png` },
        { word: 'ant', answer: 'A', picture: `${I}/item-ant.png` },
        { word: 'star', answer: 'S', picture: `${I}/prop-star.png` },
        { word: 'sad', answer: 'S', picture: `${I}/item-sad.png` },
      ] },
    { kind: 'treasure', name: 'Happy Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: meadow, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! How are you? I am happy!' },
  ],
};
