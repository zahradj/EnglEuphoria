import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const G = '/lep1/gifs';
const beach = `${S}/bg-u10l2-beach-empty-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;
const swim = `${G}/u10l2-swim.gif`;
const dance = `${G}/u10l2-dance.gif`;
const sing = `${G}/u10l2-sing.gif`;

/** Pre-A1 Unit 10 Lesson 2 "Swim, Dance, Sing!" — Beach Party Quest.
 *  Practises swim, dance, sing, "I can …", the sounds S and I, and blending i-words. */
export const QUEST_BEACH_PARTY_U10L2: HomeworkQuest = {
  id: 'beach-party-u10l2',
  title: 'Beach Party Quest',
  subtitle: 'Swim, Dance, Sing! · Pre-A1 Unit 10 · Lesson 2',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-10-2',
  theme: { accent: '#0EA5E9', accent2: '#F59E0B', night: false, mapImg: beach, guide: `${C}/mia-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'mia', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'What Can They Do?', icon: '🏖️', intro: 'Listen. Which one is it?', img: beach,
      rounds: [
        { line: 'I can dance!', answer: 'dance', options: [{ label: 'swim', src: swim }, { label: 'dance', src: dance }, { label: 'sing', src: sing }] },
        { line: 'I can swim!', answer: 'swim', options: [{ label: 'sing', src: sing }, { label: 'swim', src: swim }, { label: 'dance', src: dance }] },
        { line: 'I can sing!', answer: 'sing', options: [{ label: 'dance', src: dance }, { label: 'sing', src: sing }, { label: 'swim', src: swim }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '✅', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: beach, line: 'Pip can swim.', isTrue: true, sticker: { src: swim, x: 50, y: 86, w: 26 } },
        { img: beach, line: 'Leo can dance.', isTrue: false, sticker: { src: sing, x: 50, y: 86, w: 26 } },
        { img: beach, line: 'Mia can dance.', isTrue: true, sticker: { src: dance, x: 50, y: 86, w: 26 } },
      ] },
    { kind: 'sound-choice', name: 'S or I?', icon: '🔤', intro: 'Listen to the word. Does it start with S or I?', img: beach, choices: ['S', 'I'], phonics: true,
      rounds: [
        { word: 'sun', answer: 'S', picture: it('sun') },
        { word: 'igloo', answer: 'I', picture: it('igloo') },
        { word: 'snake', answer: 'S', picture: it('snake') },
        { word: 'insect', answer: 'I', picture: it('insect') },
      ] },
    { kind: 'sound-blend', name: 'Sound Train', icon: '🚂', intro: 'Tap each sound. Then blend them and find the picture!', img: beach, voice: 'pip',
      rounds: [{ word: 'pig', picture: it('pig') }, { word: 'pin', picture: it('pin') }, { word: 'bin', picture: it('bin') }, { word: 'wig', picture: it('wig') }] },
    { kind: 'treasure', name: 'Party Box', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: beach, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Swim, dance, sing! You are a beach party star!' },
  ],
};
