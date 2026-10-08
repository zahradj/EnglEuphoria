import type { HomeworkQuest } from './types';

const W = '/welcome-town/scenes';
const spr = (f: string) => `/welcome-town/sprites/${f}.png`;

/** A2 Unit 1 Lesson 2 "My Week" — Pip's Week Quest.
 *  Practises the days of the week, always / usually / sometimes / never,
 *  the weekend, and the ay sound (day, play, stay). */
export const QUEST_MY_WEEK_A2_U1L2: HomeworkQuest = {
  id: 'my-week-a2-u1l2',
  title: 'Pip’s Week Quest',
  subtitle: 'My Week · A2 Unit 1 · Lesson 2',
  level: 'A2',
  lessonKey: 'wt-a2-rich-1-2',
  theme: { accent: '#8B5CF6', accent2: '#F59E0B', night: false, mapImg: `${W}/bg-a2-calendar.png`, guide: spr('pip-happy'), walker: spr('pip-wave') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'sentence-builder', name: 'My Week', icon: '📅', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: `${W}/bg-a2-street.png`, line: 'On Monday, I go to school.', extra: ['Sunday'] },
        { img: `${W}/bg-a2-weekend.png`, line: 'On Saturday, I fly my kite.', extra: ['never'] },
        { img: `${W}/bg-a2-bathroom.png`, line: 'I always brush my teeth!', extra: ['never'] },
        { img: `${W}/bg-a2-calendar.png`, line: 'I never go to school on Sunday!', extra: ['always'] },
      ] },
    { kind: 'reading', name: 'Pip’s Busy Week', icon: '📖', intro: 'Read the story. Then answer from memory!', img: `${W}/bg-a2-calendar.png`,
      sentences: ['On Monday, Pip walks to school. He always says hello to his friends.', 'On Tuesday, Pip plays soccer with Leo. He usually wins!', 'On Wednesday, Pip reads a new book.', 'On Friday, Pip is very happy. It is pizza night!', 'On Saturday, Pip flies his kite. No school today!', 'On Sunday, Pip rests at home with his family.'],
      questions: [
        { q: 'What does Pip do on Tuesday?', options: ['He plays soccer', 'He reads a book', 'He flies his kite'], answer: 'He plays soccer' },
        { q: 'When is pizza night?', options: ['Monday', 'Friday', 'Sunday'], answer: 'Friday' },
        { q: 'Why is there no school on Saturday?', options: ['It is the weekend', 'Pip is sick', 'It is Monday'], answer: 'It is the weekend' },
      ] },
    { kind: 'true-false', name: 'True or False', icon: '⚖️', intro: 'Look and listen. True or false?',
      rounds: [
        { img: `${W}/bg-a2-weekend.png`, line: 'On Saturday, Pip flies his kite.', isTrue: true },
        { img: `${W}/bg-a2-street.png`, line: 'On Sunday, Pip walks to school.', isTrue: false },
        { img: `${W}/bg-a2-bathroom.png`, line: 'Pip always brushes his teeth.', isTrue: true },
      ] },
    { kind: 'sound-choice', name: 'The AY Sound', icon: '🔤', intro: 'Listen to the word. Which sound is in it?', img: `${W}/bg-a2-playground.png`, choices: ['ay', 'a', 'i'],
      rounds: [
        { word: 'day', answer: 'ay', emoji: '☀️' },
        { word: 'cat', answer: 'a', emoji: '🐱' },
        { word: 'play', answer: 'ay', emoji: '⚽' },
        { word: 'kite', answer: 'i', emoji: '🪁' },
        { word: 'stay', answer: 'ay', emoji: '🏠' },
      ] },
    { kind: 'treasure', name: 'Week Box', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the box to open it!', img: `${W}/bg-a2-weekend.png`, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! Every week is a fun week!' },
  ],
};
