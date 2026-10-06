import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const party = `${S}/bg-l4-birthday-party.jpg`;

/** Pre-A1 Unit 1 Lesson 4 "Bella's Birthday!" — Birthday Party Quest.
 *  Practises "How old are you? — I am five.", numbers to 10, the friends at
 *  the party, and B /b/ (bag, ball, bye) and T /t/ (two, ten, toy). */
export const QUEST_BIRTHDAY_U1L4: HomeworkQuest = {
  id: 'birthday-u1l4',
  title: 'Birthday Party Quest',
  subtitle: 'Bella’s Birthday! · Pre-A1 Unit 1 · Lesson 4',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-1-4',
  theme: { accent: '#EC4899', accent2: '#FACC15', night: false, mapImg: party, guide: `${C}/bella-birthday.png`, walker: `${C}/pip-birthday.png` },
  voice: 'teacher',
  praise: { voice: 'bella', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'tap-hotspot', name: 'Find a Friend', icon: '🎈', intro: 'Listen. Tap the friend at the party!', img: party, aspect: 1376 / 768,
      spots: [
        { label: 'Pip', box: { x: 3, y: 14, w: 23, h: 80 } },
        { label: 'Willow', box: { x: 27, y: 6, w: 17, h: 30 } },
        { label: 'Mia', box: { x: 27, y: 45, w: 13, h: 48 } },
        { label: 'Bella', box: { x: 53, y: 30, w: 15, h: 62 } },
        { label: 'Leo', box: { x: 70, y: 14, w: 26, h: 80 } },
      ],
      rounds: [
        { target: 'Bella', line: 'Find Bella. It is her birthday!' },
        { target: 'Leo', line: 'Find Leo.' },
        { target: 'Mia', line: 'Find Mia.' },
        { target: 'Willow', line: 'Find Willow.' },
      ] },
    { kind: 'true-false', name: 'How Old?', icon: '🎂', intro: 'Look at the number. Listen. Is it true?',
      rounds: [
        { img: `${S}/bg-l4-bella-five.jpg`, line: 'I am five.', isTrue: true },
        { img: `${S}/bg-l4-mia-six.jpg`, line: 'I am seven.', isTrue: false },
        { img: `${S}/bg-l4-leo-seven.jpg`, line: 'I am seven.', isTrue: true },
        { img: `${S}/bg-l4-willow-four.jpg`, line: 'I am six.', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'B or T?', icon: '🎁', intro: 'Listen to the word. Which sound does it start with?', img: party, choices: ['B', 'T'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'bag', answer: 'B', picture: `${I}/item-bag.png` },
        { word: 'ten', answer: 'T', picture: `${I}/item-ten.png` },
        { word: 'ball', answer: 'B', picture: `${I}/item-ball-kawaii.png` },
        { word: 'toy', answer: 'T', picture: `${I}/item-toy.png` },
        { word: 'two', answer: 'T', picture: `${I}/item-two.png` },
      ] },
    { kind: 'treasure', name: 'Gift Box', icon: `${K}/chest-closed.png`, intro: 'Tap the gift box to open it!', img: party, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! Happy birthday, Bella! How old are you?' },
  ],
};
