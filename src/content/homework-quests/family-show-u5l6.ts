import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const stage = `${S}/bg-u5l6-stage-wide.png`;
const host = `${S}/bg-u5l6-host-wide.png`;
const fam = (n: string) => `${I}/item-family-${n}.png`;

/** Pre-A1 Unit 5 Lesson 6 "Family Match-Up" — Family Game Show Quest.
 *  Reviews the whole family with "Who is this? This is my…", the unit's
 *  stories and the unit's sounds (M, D, S, G, B). */
export const QUEST_FAMILY_SHOW_U5L6: HomeworkQuest = {
  id: 'family-show-u5l6',
  title: 'Family Game Show Quest',
  subtitle: 'Family Match-Up · Pre-A1 Unit 5 · Lesson 6',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-5-6',
  theme: { accent: '#A855F7', accent2: '#F59E0B', night: false, mapImg: stage, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Right answer!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Is This?', icon: '🎤', intro: 'Listen. Tap the right family member!', img: host,
      rounds: [
        { line: 'This is my grandpa!', answer: 'grandpa', options: [{ label: 'grandpa', src: fam('grandpa') }, { label: 'dad', src: fam('dad') }, { label: 'brother', src: fam('brother') }] },
        { line: 'This is my sister!', answer: 'sister', options: [{ label: 'mom', src: fam('mom') }, { label: 'baby', src: fam('baby') }, { label: 'sister', src: fam('sister') }] },
        { line: 'This is my brother!', answer: 'brother', options: [{ label: 'brother', src: fam('brother') }, { label: 'grandma', src: fam('grandma') }, { label: 'sister', src: fam('sister') }] },
        { line: 'This is the baby!', answer: 'baby', options: [{ label: 'grandpa', src: fam('grandpa') }, { label: 'baby', src: fam('baby') }, { label: 'dad', src: fam('dad') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u5l3-kitchen-wide.png`, line: 'Grandma bakes cookies!', isTrue: true },
        { img: `${S}/bg-u5l5-ball-c-wide.png`, line: 'Pip reads a book with Dad!', isTrue: false },
        { img: `${S}/bg-u5l4-picnic-wide.png`, line: 'This is my family!', isTrue: true },
        { img: `${S}/bg-u5l5-ducks-b-wide.png`, line: 'We eat ice cream!', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🔔', intro: 'Listen to the word. Which sound does it start with?', img: stage, choices: ['M', 'D', 'G'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'mom', answer: 'M', picture: fam('mom') },
        { word: 'dad', answer: 'D', picture: fam('dad') },
        { word: 'grandma', answer: 'G', picture: fam('grandma') },
        { word: 'duck', answer: 'D', picture: `${I}/item-duck-yellow.png` },
        { word: 'milk', answer: 'M', picture: `${I}/item-milk.png` },
      ] },
    { kind: 'treasure', name: 'Champion Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: host, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You are the Family Match-Up champion! This is my family!' },
  ],
};
