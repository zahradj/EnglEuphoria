import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const camp = `${S}/bg-u10l3-camp-empty-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 10 Lesson 3 "Clap, Play, Sleep!" — Camp-Out Quest.
 *  Practises clap, play, sleep, following "Mia, play!", the sound L, and blending lid and log. */
export const QUEST_CAMP_OUT_U10L3: HomeworkQuest = {
  id: 'camp-out-u10l3',
  title: 'Camp-Out Quest',
  subtitle: 'Clap, Play, Sleep! · Pre-A1 Unit 10 · Lesson 3',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-10-3',
  theme: { accent: '#7C3AED', accent2: '#F97316', night: true, mapImg: camp, guide: `${C}/pip-hello.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Campfire Says', icon: '🔥', intro: 'Listen. Which one is it?', img: camp,
      rounds: [
        { line: 'Mia, play!', answer: 'play', options: [{ label: 'clap', src: it('mia-clap') }, { label: 'play', src: it('mia-play') }, { label: 'sleep', src: it('mia-sleep') }] },
        { line: 'Leo, sleep!', answer: 'sleep', options: [{ label: 'sleep', src: it('leo-sleep') }, { label: 'play', src: it('leo-play') }, { label: 'clap', src: it('leo-clap') }] },
        { line: 'Pip, clap!', answer: 'clap', options: [{ label: 'play', src: it('pip-play') }, { label: 'clap', src: it('pip-clap') }, { label: 'sleep', src: it('pip-sleep') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '✅', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: camp, line: 'Leo is sleeping.', isTrue: true, sticker: { src: it('leo-sleep'), x: 50, y: 88, w: 30 } },
        { img: camp, line: 'Mia claps.', isTrue: false, sticker: { src: it('mia-play'), x: 50, y: 88, w: 24 } },
        { img: camp, line: 'Pip claps.', isTrue: true, sticker: { src: it('pip-clap'), x: 50, y: 88, w: 24 } },
      ] },
    { kind: 'sound-choice', name: 'L or S?', icon: '🔤', intro: 'Listen to the word. Does it start with L or S?', img: camp, choices: ['L', 'S'], phonics: true,
      rounds: [
        { word: 'lion', answer: 'L', picture: it('lion') },
        { word: 'sun', answer: 'S', picture: it('sun') },
        { word: 'lemon', answer: 'L', picture: it('lemon') },
        { word: 'snake', answer: 'S', picture: it('snake') },
      ] },
    { kind: 'sound-blend', name: 'Sound Train', icon: '🚂', intro: 'Tap each sound. Then blend them and find the picture!', img: camp, voice: 'pip',
      rounds: [{ word: 'lid', picture: it('lid') }, { word: 'log', picture: it('log') }, { word: 'pin', picture: it('pin') }, { word: 'wig', picture: it('wig') }] },
    { kind: 'treasure', name: 'Goodnight Box', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: camp, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Clap, play, sleep! Goodnight, camp star!' },
  ],
};
