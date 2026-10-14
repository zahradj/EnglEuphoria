import type { HomeworkQuest } from './types';

const W = '/welcome-town';
const room = `${W}/scenes/bg-classroom-wide.png`;
const spr = (f: string) => `${W}/sprites/${f}.png`;

/** A1 Unit 1 Lesson 3 "Listen to the Greetings" — Listening Game Quest.
 *  Listening only: hello / goodbye / a question, names, ages, feelings, and
 *  teacher / student. */
export const QUEST_LISTEN_GREET_WT_U1L3: HomeworkQuest = {
  id: 'listen-greet-wt-u1l3',
  title: 'Listening Game Quest',
  subtitle: 'Listen to the Greetings Song · A1 Unit 1 · Lesson 3',
  level: 'A1',
  lessonKey: 'wt-rich-1-3',
  theme: { accent: '#0EA5E9', accent2: '#F59E0B', night: false, mapImg: `${W}/scenes/bg-classroom-door.png`, guide: spr('marigold-wave'), walker: spr('pip-wave') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Hello, Bye, or Question?', icon: '👂', intro: 'Listen. Is it hello, goodbye, or a question?', img: room,
      rounds: [
        { line: 'Hello! Welcome to our class!', answer: 'Hello', options: [{ label: 'Hello', emoji: '👋' }, { label: 'Goodbye', emoji: '🚪' }, { label: 'Question', emoji: '❓' }] },
        { line: 'What is your name?', answer: 'Question', options: [{ label: 'Goodbye', emoji: '🚪' }, { label: 'Question', emoji: '❓' }, { label: 'Hello', emoji: '👋' }] },
        { line: 'Goodbye! See you again!', answer: 'Goodbye', options: [{ label: 'Question', emoji: '❓' }, { label: 'Hello', emoji: '👋' }, { label: 'Goodbye', emoji: '🚪' }] },
        { line: 'How are you today?', answer: 'Question', options: [{ label: 'Hello', emoji: '👋' }, { label: 'Question', emoji: '❓' }, { label: 'Goodbye', emoji: '🚪' }] },
      ] },
    { kind: 'picture-choice', name: 'Who Feels It?', icon: '😴', intro: 'Listen to the friend. Tap who is talking!', img: room,
      rounds: [
        { line: 'I am sad today.', answer: 'Mia', options: [{ label: 'Mia', src: spr('mia-sad') }, { label: 'Pip', src: spr('pip-happy') }, { label: 'Leo', src: spr('leo-tired') }] },
        { line: 'I am so tired.', answer: 'Leo', options: [{ label: 'Bella', src: spr('bella-angry') }, { label: 'Leo', src: spr('leo-tired') }, { label: 'Willow', src: spr('willow-hungry') }] },
        { line: 'I am hungry!', answer: 'Willow', options: [{ label: 'Pip', src: spr('pip-happy') }, { label: 'Mia', src: spr('mia-sad') }, { label: 'Willow', src: spr('willow-hungry') }] },
      ] },
    { kind: 'true-false', name: 'Teacher or Student?', icon: '🦉', intro: 'Look and listen. True or false?',
      rounds: [
        { img: `${W}/scenes/bg-classroom-people.png`, line: 'I am your teacher.', isTrue: true, sticker: { src: spr('marigold-wave'), x: 78, y: 96, w: 20 } },
        { img: `${W}/scenes/bg-classroom-people.png`, line: 'I am your teacher.', isTrue: false, sticker: { src: spr('pip-wave'), x: 78, y: 96, w: 18 } },
        { img: `${W}/scenes/bg-express-goodbye.png`, line: 'Goodbye!', isTrue: true },
        { img: `${W}/scenes/bg-express-hello-v2.png`, line: 'Goodbye!', isTrue: false },
      ] },
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: room, line: 'Hello! What is your name?', extra: ['Bye'] },
        { img: room, line: 'I am seven years old.', extra: ['sad'] },
        { img: room, line: 'This is the student.', extra: ['teacher'] },
      ] },
    { kind: 'sound-blend', name: 'Sound Train', icon: '🚂', intro: 'Tap each sound. Then blend them and find the picture!', img: `${W}/scenes/bg-classroom-reading-wide.png`, voice: 'pip',
      rounds: [{ word: 'sun', picture: '/lep1/items/item-sun.png' }, { word: 'hen', picture: '/lep1/items/item-hen.png' }, { word: 'pig', picture: '/lep1/items/item-pig.png' }, { word: 'cat', picture: '/lep1/items/item-cat.png' }] },
    { kind: 'treasure', name: 'Listening Box', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the box to open it!', img: room, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! Great listening today!' },
  ],
};
