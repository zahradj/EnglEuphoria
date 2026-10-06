import type { HomeworkQuest } from './types';

const W = '/welcome-town';
const room = `${W}/scenes/bg-classroom-feelings-wide.png`;
const spr = (f: string) => `${W}/sprites/${f}.png`;

/** A1 Unit 1 Lesson 2 "Saying 'How Are You?'" — Feelings Class Quest.
 *  Practises "How are you today? — I am fine, thank you!", happy / tired /
 *  sad / angry / hungry with he / she, and the sounds p, i, n. */
export const QUEST_FEELINGS_CLASS_WT_U1L2: HomeworkQuest = {
  id: 'feelings-class-wt-u1l2',
  title: 'Feelings Class Quest',
  subtitle: 'How Are You? · A1 Unit 1 · Lesson 2',
  level: 'A1',
  lessonKey: 'wt-rich-1-2',
  theme: { accent: '#F97316', accent2: '#3B82F6', night: false, mapImg: room, guide: spr('pip-happy'), walker: spr('mia-wave') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'How Do They Feel?', icon: '😊', intro: 'Listen. Tap the friend!', img: room,
      rounds: [
        { line: 'Leo is tired.', answer: 'Leo', options: [{ label: 'Pip', src: spr('pip-happy') }, { label: 'Leo', src: spr('leo-tired') }, { label: 'Mia', src: spr('mia-sad') }] },
        { line: 'Willow is hungry.', answer: 'Willow', options: [{ label: 'Willow', src: spr('willow-hungry') }, { label: 'Bella', src: spr('bella-angry') }, { label: 'Leo', src: spr('leo-tired') }] },
        { line: 'She is sad.', answer: 'Mia', options: [{ label: 'Bella', src: spr('bella-angry') }, { label: 'Pip', src: spr('pip-happy') }, { label: 'Mia', src: spr('mia-sad') }] },
        { line: 'He is happy.', answer: 'Pip', options: [{ label: 'Pip', src: spr('pip-happy') }, { label: 'Willow', src: spr('willow-hungry') }, { label: 'Mia', src: spr('mia-sad') }] },
      ] },
    { kind: 'true-false', name: 'True or False', icon: '⚖️', intro: 'Look and listen. True or false?',
      rounds: [
        { img: `${W}/scenes/bg-vocab-pip-happy-wide.png`, line: 'Pip is happy.', isTrue: true },
        { img: `${W}/scenes/bg-vocab-mia-sad-wide.png`, line: 'Mia is angry.', isTrue: false },
        { img: `${W}/scenes/bg-vocab-leo-tired-wide.png`, line: 'He is tired.', isTrue: true },
        { img: `${W}/scenes/bg-vocab-willow-hungry-wide.png`, line: 'Willow is sad.', isTrue: false },
      ] },
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: room, line: 'How are you today?', extra: ['name'] },
        { img: room, line: 'I am fine, thank you!', extra: ['sad'] },
        { img: `${W}/scenes/bg-vocab-mia-sad-wide.png`, line: 'She is sad.', extra: ['He'] },
      ] },
    { kind: 'sound-choice', name: 'P, I, or N?', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: `${W}/scenes/bg-classroom-reading-wide.png`, choices: ['P', 'I', 'N'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'pig', answer: 'P', emoji: '🐷' },
        { word: 'igloo', answer: 'I', emoji: '🧊' },
        { word: 'nut', answer: 'N', emoji: '🥜' },
        { word: 'pen', answer: 'P', emoji: '🖊️' },
        { word: 'insect', answer: 'I', emoji: '🐞' },
        { word: 'net', answer: 'N', emoji: '🥅' },
      ] },
    { kind: 'treasure', name: 'Class Box', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the box to open it!', img: room, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! How are you? I am happy!' },
  ],
};
