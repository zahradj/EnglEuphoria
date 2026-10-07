import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const pic = (n: string) => `${S}/bg-u5l5-${n}-wide.png`;

/** Pre-A1 Unit 5 Lesson 5 "Just Me and My Dad" — Day with Dad Quest.
 *  Practises "We play ball / feed the ducks / eat ice cream / read a book",
 *  the order of the story and the D sound. */
export const QUEST_DAY_WITH_DAD_U5L5: HomeworkQuest = {
  id: 'day-with-dad-u5l5',
  title: 'Day with Dad Quest',
  subtitle: 'Just Me and My Dad · Pre-A1 Unit 5 · Lesson 5',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-5-5',
  theme: { accent: '#0EA5E9', accent2: '#F59E0B', night: false, mapImg: pic('gate-a'), guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'What Do We Do?', icon: '🦆', intro: 'Listen. Tap the right picture!', img: pic('ducks-a'),
      rounds: [
        { line: 'We feed the ducks!', answer: 'ducks', options: [{ label: 'ball', src: pic('ball-c') }, { label: 'ducks', src: pic('ducks-c') }, { label: 'book', src: pic('book-b') }] },
        { line: 'We eat ice cream!', answer: 'ice cream', options: [{ label: 'ice cream', src: pic('icecream-b') }, { label: 'ducks', src: pic('ducks-c') }, { label: 'ball', src: pic('ball-c') }] },
        { line: 'We read a book!', answer: 'book', options: [{ label: 'ball', src: pic('ball-c') }, { label: 'ice cream', src: pic('icecream-b') }, { label: 'book', src: pic('book-b') }] },
        { line: 'We play ball!', answer: 'ball', options: [{ label: 'book', src: pic('book-b') }, { label: 'ball', src: pic('ball-c') }, { label: 'ducks', src: pic('ducks-c') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: pic('ball-c'), line: 'We play ball!', isTrue: true },
        { img: pic('book-b'), line: 'We feed the ducks!', isTrue: false },
        { img: pic('hug-b'), line: 'I love you, Dad!', isTrue: true },
        { img: pic('icecream-b'), line: 'We read a book!', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'D or B?', icon: '🚪', intro: 'Listen to the word. Which sound does it start with?', img: pic('home'), choices: ['D', 'B'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'dog', answer: 'D', picture: `${I}/item-dog.png` },
        { word: 'ball', answer: 'B', picture: `${I}/item-ball-red.png` },
        { word: 'duck', answer: 'D', picture: `${I}/item-duck-yellow.png` },
        { word: 'book', answer: 'B', picture: `${I}/item-book.png` },
        { word: 'door', answer: 'D', picture: `${I}/item-door.png` },
      ] },
    { kind: 'treasure', name: 'Bedtime Box', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: pic('night'), closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! Just me and my dad — the best day! I love you, Dad!' },
  ],
};
