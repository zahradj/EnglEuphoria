import type { HomeworkQuest } from './types';

const W = '/welcome-town';
const peers = `${W}/scenes/bg-classroom-peers-v2.png`;
const spr = (f: string) => `${W}/sprites/${f}.png`;

/** A1 Unit 1 Lesson 4 "Meet a Friend: Speak!" — Meet a Friend Quest.
 *  Practises "Nice to meet you! — Nice to meet you too!", "How are you?",
 *  "This is my friend, …!", and the sounds f and s. */
export const QUEST_MEET_FRIEND_WT_U1L4: HomeworkQuest = {
  id: 'meet-friend-wt-u1l4',
  title: 'Meet a Friend Quest',
  subtitle: 'Speak & Meet! · A1 Unit 1 · Lesson 4',
  level: 'A1',
  lessonKey: 'wt-rich-1-4',
  theme: { accent: '#22C55E', accent2: '#F97316', night: false, mapImg: peers, guide: spr('pip-wave'), walker: spr('leo-wave') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: peers, line: 'Nice to meet you!', extra: ['Bye'] },
        { img: `${W}/scenes/bg-express-friend-v2.png`, line: 'This is my friend, Bella!', extra: ['teacher'] },
        { img: peers, line: 'How are you today?', extra: ['name'] },
      ] },
    { kind: 'reading', name: 'Read the Chat', icon: '💬', intro: 'Read the conversation. Then answer from memory!', img: peers,
      sentences: ['Hello! My name is Pip.', 'Hi Pip! My name is Leo.', 'Nice to meet you, Leo!', 'Nice to meet you too! How are you today?', 'I am happy! How are you?', 'I am fine, thank you!'],
      questions: [
        { q: 'What is the new friend’s name?', options: ['Leo', 'Mia', 'Bella'], answer: 'Leo' },
        { q: 'How is Pip?', options: ['Sad', 'Happy', 'Tired'], answer: 'Happy' },
        { q: 'What does Leo say after “Nice to meet you, Leo!”?', options: ['Goodbye!', 'Nice to meet you too!', 'I am seven.'], answer: 'Nice to meet you too!' },
      ] },
    { kind: 'true-false', name: 'This Is My Friend', icon: '🤝', intro: 'Look and listen. True or false?',
      rounds: [
        { img: peers, line: 'This is my friend, Leo!', isTrue: true, sticker: { src: spr('leo-wave'), x: 50, y: 96, w: 18 } },
        { img: peers, line: 'This is my friend, Mia!', isTrue: false, sticker: { src: spr('bella-angry'), x: 50, y: 96, w: 16 } },
        { img: peers, line: 'This is my friend, Willow!', isTrue: true, sticker: { src: spr('willow-wave'), x: 50, y: 96, w: 18 } },
      ] },
    { kind: 'sound-choice', name: 'F or S?', icon: '🦊', intro: 'Listen to the word. Which sound does it start with?', img: `${W}/scenes/bg-classroom-reading-v2.png`, choices: ['F', 'S'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'fox', answer: 'F', emoji: '🦊' },
        { word: 'sun', answer: 'S', emoji: '☀️' },
        { word: 'fish', answer: 'F', emoji: '🐟' },
        { word: 'sock', answer: 'S', emoji: '🧦' },
        { word: 'fan', answer: 'F', emoji: '🪭' },
      ] },
    { kind: 'treasure', name: 'Friend Box', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the box to open it!', img: peers, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! Nice to meet you, friend!' },
  ],
};
