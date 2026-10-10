import type { HomeworkQuest } from './types';

const W = '/welcome-town';
const cls = `${W}/scenes/bg-classroom-wide.png`;
const peers = `${W}/scenes/bg-classroom-peers-v2.png`;
const spr = (f: string) => `${W}/sprites/${f}.png`;

/** A1 Unit 1 Lesson 7 "Unit Review & Boss Test: Say Hello!" — Unit 1 Review Quest.
 *  One level per skill of the unit: listen, read, build, and the trophy. */
export const QUEST_BOSS_TEST_WT_U1L7: HomeworkQuest = {
  id: 'boss-test-wt-u1l7',
  title: 'Unit 1 Review Quest',
  subtitle: 'Boss Test: Say Hello! · A1 Unit 1 · Lesson 7',
  level: 'A1',
  lessonKey: 'wt-rich-1-7',
  theme: { accent: '#EAB308', accent2: '#EF4444', night: false, mapImg: cls, guide: spr('pip-wave'), walker: spr('mia-wave') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Listen', icon: '👂', intro: 'Listen. Tap the friend!', img: cls,
      rounds: [
        { line: 'I am fine, thank you! I am Leo.', answer: 'Leo', options: [{ label: 'Leo', src: spr('leo-wave') }, { label: 'Pip', src: spr('pip-wave') }, { label: 'Bella', src: spr('bella-wave') }] },
        { line: 'Goodbye! I am Willow.', answer: 'Willow', options: [{ label: 'Mia', src: spr('mia-wave') }, { label: 'Willow', src: spr('willow-wave') }, { label: 'Leo', src: spr('leo-wave') }] },
      ] },
    { kind: 'reading', name: 'Read', icon: '📖', intro: 'Read the chat. Then answer from memory!', img: peers,
      sentences: ['Hello! What’s your name?', 'My name is Mia. What’s your name?', 'My name is Pip. How are you?', 'I am happy, thank you!', 'Goodbye, Mia!'],
      questions: [
        { q: 'What is the girl’s name?', options: ['Bella', 'Mia', 'Willow'], answer: 'Mia' },
        { q: 'How is Mia?', options: ['Happy', 'Sad', 'Fine'], answer: 'Happy' },
      ] },
    { kind: 'sentence-builder', name: 'Build', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: peers, line: 'Hello! My name is Mia.', extra: ['you'] },
        { img: peers, line: 'How are you today?', extra: ['name'] },
        { img: peers, line: 'I am happy, thank you!', extra: ['Bye'] },
      ] },
    { kind: 'treasure', name: 'Unit 1 Trophy', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the box to open it!', img: cls, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You finished Unit 1! Champion!' },
  ],
};
