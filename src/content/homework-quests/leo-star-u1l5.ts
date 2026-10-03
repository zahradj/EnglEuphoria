import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const meadow = `${S}/bg-l5-empty-wide.png`;

/** Pre-A1 Unit 1 Lesson 5 "Leo's Lost Star" — Star Search Quest.
 *  Practises only what the lesson taught: the search words (hat, mat, bag,
 *  bat, ant, star), "Is it under the …?", how Leo feels, and the sounds
 *  H M B S. Heard and answered with pictures (no reading). */
export const QUEST_LEO_STAR_U1L5: HomeworkQuest = {
  id: 'leo-star-u1l5',
  title: 'Star Search Quest',
  subtitle: "Leo's Lost Star · Pre-A1 Unit 1 · Lesson 5",
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-1-5',
  theme: { accent: '#F59E0B', accent2: '#8B5CF6', night: true, mapImg: meadow, guide: `${C}/leo-hello.png`, walker: `${C}/pip-hello.png` },
  voice: 'leo',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Find It', icon: '🔎', intro: 'Listen. Tap the right picture!', img: meadow,
      rounds: [
        { line: 'Find the hat.', answer: 'Hat', options: [{ label: 'Bag', src: `${I}/item-bag.png` }, { label: 'Hat', src: `${I}/item-hat.png` }, { label: 'Mat', src: `${I}/item-mat.png` }] },
        { line: 'Find the bat.', answer: 'Bat', options: [{ label: 'Bat', src: `${I}/item-bat.png` }, { label: 'Ant', src: `${I}/item-ant.png` }, { label: 'Star', src: `${I}/item-star-gold.png` }] },
        { line: 'Find the star.', answer: 'Star', options: [{ label: 'Hat', src: `${I}/item-hat.png` }, { label: 'Nut', src: `${I}/item-nut.png` }, { label: 'Star', src: `${I}/item-star-gold.png` }] },
        { line: 'Find the ant.', answer: 'Ant', options: [{ label: 'Ant', src: `${I}/item-ant.png` }, { label: 'Bat', src: `${I}/item-bat.png` }, { label: 'Mat', src: `${I}/item-mat.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-l5-sad-wide.png`, line: 'Leo is sad.', isTrue: true },
        { img: `${S}/bg-l5-hat-wide.png`, line: 'Under the hat is a star.', isTrue: false },
        { img: `${S}/bg-l5-mat-wide.png`, line: 'Under the mat is an ant.', isTrue: true },
        { img: `${S}/bg-l5-found-wide.png`, line: 'Leo is sad.', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'H, M, or B?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: meadow, choices: ['H', 'M', 'B'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'hat', answer: 'H', picture: `${I}/item-hat.png` },
        { word: 'mat', answer: 'M', picture: `${I}/item-mat.png` },
        { word: 'bat', answer: 'B', picture: `${I}/item-bat.png` },
        { word: 'bag', answer: 'B', picture: `${I}/item-bag.png` },
        { word: 'moon', answer: 'M', picture: `${I}/item-moon.png` },
      ] },
    { kind: 'treasure', name: "Leo's Box", icon: `${K}/chest-closed.png`, intro: 'Tap the box. Is the star in it?', img: meadow, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Yes! Here it is! You found the star!' },
  ],
};
