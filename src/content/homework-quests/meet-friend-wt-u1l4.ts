import type { HomeworkQuest } from './types';

const W = '/welcome-town';
const peers = `${W}/scenes/bg-classroom-peers-v2.png`;
const play = `${W}/scenes/bg-playground-break-wide.png`;
const spr = (f: string) => `${W}/sprites/${f}.png`;

/** A1 Unit 1 Lesson 4 "Meet a Friend: Speak!" — Meet a Friend Quest.
 *  Practises a short greeting conversation: hello, "What's your name? — My name is …",
 *  "How are you? — I am fine / happy / sad", goodbye; and blending CVC words (Sound Train). */
export const QUEST_MEET_FRIEND_WT_U1L4: HomeworkQuest = {
  id: 'meet-friend-wt-u1l4',
  title: 'Meet a Friend Quest',
  subtitle: 'Meet a Friend: Speak! · A1 Unit 1 · Lesson 4',
  level: 'A1',
  lessonKey: 'wt-rich-1-4',
  theme: { accent: '#22C55E', accent2: '#F97316', night: false, mapImg: play, guide: spr('pip-wave'), walker: spr('bella-wave') },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'sentence-builder', name: 'Build It', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: play, line: 'Hi! What’s your name?', extra: ['Bye'] },
        { img: peers, line: 'My name is Leo.', extra: ['you'] },
        { img: play, line: 'How are you today?', extra: ['name'] },
        { img: peers, line: 'I am fine, thank you!', extra: ['sad'] },
      ] },
    { kind: 'reading', name: 'Read the Chat', icon: '💬', intro: 'Read the conversation. Then answer from memory!', img: peers,
      sentences: ['Hello! What’s your name?', 'Hi! My name is Leo.', 'How are you, Leo?', 'I am fine, thank you!', 'Goodbye, Leo!', 'Goodbye! See you!'],
      questions: [
        { q: 'What is the friend’s name?', options: ['Leo', 'Mia', 'Bella'], answer: 'Leo' },
        { q: 'How is Leo?', options: ['Sad', 'Fine', 'Tired'], answer: 'Fine' },
        { q: 'What do they say at the end?', options: ['Hello!', 'Goodbye!', 'I am seven.'], answer: 'Goodbye!' },
      ] },
    { kind: 'true-false', name: 'How Are You?', icon: '😊', intro: 'Look and listen. True or false?',
      rounds: [
        { img: play, line: 'I am happy!', isTrue: true, sticker: { src: spr('pip-happy-v2'), x: 50, y: 96, w: 18 } },
        { img: play, line: 'I am happy!', isTrue: false, sticker: { src: spr('mia-sad-v2'), x: 50, y: 96, w: 18 } },
        { img: play, line: 'I am sad.', isTrue: true, sticker: { src: spr('mia-sad-v2'), x: 50, y: 96, w: 18 } },
      ] },
    { kind: 'sound-blend', name: 'Sound Train', icon: '🚂', intro: 'Tap each sound. Then blend them and find the picture!', img: `${W}/scenes/bg-classroom-reading-wide.png`, voice: 'pip',
      rounds: [{ word: 'dog', picture: '/lep1/items/item-dog.png' }, { word: 'bed', picture: '/lep1/items/item-bed.png' }, { word: 'bag', picture: '/lep1/items/item-bag.png' }, { word: 'fan', picture: '/lep1/items/item-fan.png' }] },
    { kind: 'treasure', name: 'Friend Box', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the box to open it!', img: play, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win: 'You did it! You can chat with a friend!' },
  ],
};
