import type { HomeworkQuest } from './types';

const W = '/welcome-town';
const stage = '/lep1/scenes/bg-u5l6-stage-wide.png';
const cls = `${W}/scenes/bg-classroom-peers-v2.png`;
const spr = (f: string) => `${W}/sprites/${f}.png`;

/** A1 Unit 1 Lesson 6 "Extra Practice: Greeting Game!" — Greeting Game Quest.
 *  Quick home games with all the unit's greetings: who says it, how are you, build the question. */
export const QUEST_GREETING_GAME_WT_U1L6: HomeworkQuest = {
  id: 'greeting-game-wt-u1l6',
  title: 'Greeting Game Quest',
  subtitle: 'Greeting Game! · A1 Unit 1 · Lesson 6',
  level: 'A1',
  lessonKey: 'wt-rich-1-6',
  theme: { accent: '#8B5CF6', accent2: '#F97316', night: false, mapImg: stage, guide: spr('pip-wave'), walker: spr('willow-wave') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Says It?', icon: '🔔', intro: 'Listen. Who is talking? Tap the friend!', img: stage,
      rounds: [
        { line: 'Hello! My name is Willow.', answer: 'Willow', options: [{ label: 'Willow', src: spr('willow-wave') }, { label: 'Leo', src: spr('leo-wave') }, { label: 'Mia', src: spr('mia-wave') }] },
        { line: 'Hi! My name is Bella.', answer: 'Bella', options: [{ label: 'Pip', src: spr('pip-wave') }, { label: 'Bella', src: spr('bella-wave') }, { label: 'Willow', src: spr('willow-wave') }] },
        { line: 'Hello! I am Leo.', answer: 'Leo', options: [{ label: 'Mia', src: spr('mia-wave') }, { label: 'Bella', src: spr('bella-wave') }, { label: 'Leo', src: spr('leo-wave') }] },
      ] },
    { kind: 'true-false', name: 'How Are You?', icon: '😊', intro: 'Look and listen. True or false?',
      rounds: [
        { img: cls, line: 'I am sad.', isTrue: true, sticker: { src: spr('mia-sad-v2'), x: 50, y: 96, w: 18 } },
        { img: cls, line: 'I am sad.', isTrue: false, sticker: { src: spr('pip-happy-v2'), x: 50, y: 96, w: 18 } },
        { img: cls, line: 'I am happy!', isTrue: true, sticker: { src: spr('pip-happy-v2'), x: 50, y: 96, w: 18 } },
      ] },
    { kind: 'sentence-builder', name: 'Quick Build', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: cls, line: 'What’s your name?', extra: ['you'] },
        { img: cls, line: 'How are you?', extra: ['name'] },
        { img: cls, line: 'I am fine, thank you!', extra: ['Bye'] },
        { img: cls, line: 'Goodbye! See you!', extra: ['Hi'] },
      ] },
    { kind: 'treasure', name: 'Trophy Box', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the box to open it!', img: stage, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'Game Day champion! Great greetings!' },
  ],
};
