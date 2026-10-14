import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const G = '/lep1/gifs';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const academy = `${S}/bg-u10l7-hero-academy-empty-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 10 Lesson 7 "Action Hero" — Hero Quest (after the Boss Test).
 *  Practises the whole unit once more: actions, can / can't, he / she / it, sounds, and blending. */
export const QUEST_HERO_U10L7: HomeworkQuest = {
  id: 'hero-u10l7',
  title: 'Hero Quest',
  subtitle: 'Action Hero · Pre-A1 Unit 10 · Lesson 7',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-10-7',
  theme: { accent: '#DC2626', accent2: '#FACC15', night: false, mapImg: academy, guide: `${C}/leo-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Well done, hero!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Hero Actions', icon: '🦸', intro: 'Listen. Which picture is it?', img: academy,
      rounds: [
        { line: 'Jump!', answer: 'jump', options: [{ label: 'jump', src: `${G}/u10l1-jump.webp` }, { label: 'sing', src: `${G}/u10l2-sing.webp` }, { label: 'sleep', src: it('leo-sleep') }] },
        { line: 'Swim!', answer: 'swim', options: [{ label: 'walk', src: `${G}/u10l1-walk.webp` }, { label: 'swim', src: `${G}/u10l2-swim.webp` }, { label: 'clap', src: it('pip-clap') }] },
        { line: 'Play!', answer: 'play', options: [{ label: 'dance', src: `${G}/u10l2-dance.webp` }, { label: 'run', src: `${G}/u10l1-run.webp` }, { label: 'play', src: it('mia-play') }] },
      ] },
    { kind: 'true-false', name: 'Can It?', icon: '👍', intro: 'Listen. Yes or no?',
      rounds: [
        { img: academy, line: 'A bird can fly.', isTrue: true, sticker: { src: it('bird-fly'), x: 50, y: 70, w: 26 } },
        { img: academy, line: 'A fish can walk.', isTrue: false, sticker: { src: it('goldfish'), x: 50, y: 70, w: 26 } },
        { img: academy, line: 'A frog can jump.', isTrue: true, sticker: { src: it('frog-happy'), x: 50, y: 70, w: 26 } },
      ] },
    { kind: 'picture-choice', name: 'Who Is It?', icon: '🙋', intro: 'Listen. Who is it?', img: academy,
      rounds: [
        { line: 'She can dance!', answer: 'Mia', options: [{ label: 'Pip', src: it('pip-wave') }, { label: 'Mia', src: it('mia-wave') }, { label: 'bear', src: it('bear-bruno') }] },
        { line: 'It can sleep!', answer: 'bear', options: [{ label: 'Leo', src: it('leo-wave') }, { label: 'bear', src: it('bear-bruno') }, { label: 'Mia', src: it('mia-wave') }] },
        { line: 'He can sing!', answer: 'Leo', options: [{ label: 'Leo', src: it('leo-wave') }, { label: 'fish', src: it('goldfish') }, { label: 'Mia', src: it('mia-wave') }] },
      ] },
    { kind: 'sound-blend', name: 'Sound Train', icon: '🚂', intro: 'Tap each sound. Then blend them and find the picture!', img: academy, voice: 'pip',
      rounds: [{ word: 'pig', picture: it('pig') }, { word: 'pin', picture: it('pin') }, { word: 'wig', picture: it('wig') }, { word: 'lid', picture: it('lid') }] },
    { kind: 'treasure', name: 'Hero Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: academy, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You are an Action Hero! You finished Unit 10!' },
  ],
};
