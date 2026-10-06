import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const home = `${S}/bg-u5l1-family-home.png`;
const mom = `${S}/bg-u5l1-mom-solo.png`;
const dad = `${S}/bg-u5l1-dad-solo.png`;

/** Pre-A1 Unit 5 Lesson 1 "Mom, Dad, Me!" — Family Home Quest.
 *  Practises mom, dad, me, family, "This is my mom!", "I love my dad!" and
 *  the M and D sounds. */
export const QUEST_FAMILY_HOME_U5L1: HomeworkQuest = {
  id: 'family-home-u5l1',
  title: 'Family Home Quest',
  subtitle: 'Mom, Dad, Me! · Pre-A1 Unit 5 · Lesson 1',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-5-1',
  theme: { accent: '#F97316', accent2: '#EC4899', night: false, mapImg: `${S}/bg-meadow.jpg`, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Is It?', icon: '🏠', intro: 'Listen. Tap the right picture!', img: `${S}/bg-meadow.jpg`,
      rounds: [
        { line: 'This is my mom!', answer: 'Mom', options: [{ label: 'Dad', src: dad }, { label: 'Mom', src: mom }, { label: 'Family', src: home }] },
        { line: 'This is my dad!', answer: 'Dad', options: [{ label: 'Dad', src: dad }, { label: 'Family', src: home }, { label: 'Mom', src: mom }] },
        { line: 'This is my family!', answer: 'Family', options: [{ label: 'Mom', src: mom }, { label: 'Dad', src: dad }, { label: 'Family', src: home }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: mom, aspect: 1, line: 'This is my dad!', isTrue: false },
        { img: dad, aspect: 1, line: 'This is my dad!', isTrue: true },
        { img: home, aspect: 1, line: 'This is my family!', isTrue: true },
        { img: mom, aspect: 1, line: 'I love my mom!', isTrue: true },
      ] },
    { kind: 'sound-choice', name: 'M or D?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: `${S}/bg-meadow.jpg`, choices: ['M', 'D'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'mom', answer: 'M', picture: mom },
        { word: 'dad', answer: 'D', picture: dad },
        { word: 'moon', answer: 'M', picture: `${I}/item-moon.png` },
        { word: 'dog', answer: 'D', picture: `${I}/item-dog.png` },
        { word: 'milk', answer: 'M', picture: `${I}/item-milk.png` },
      ] },
    { kind: 'treasure', name: 'Family Chest', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: `${S}/bg-meadow.jpg`, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! I love my family!' },
  ],
};
