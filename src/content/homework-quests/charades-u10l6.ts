import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const G = '/lep1/gifs';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const room = `${S}/bg-u10l6-games-night-empty-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 10 Lesson 6 "Action Charades" — Games Night Quest (unit review).
 *  Practises the nine action words, "Who can …?" with he / she / it, the unit's sounds, and blending. */
export const QUEST_CHARADES_U10L6: HomeworkQuest = {
  id: 'charades-u10l6',
  title: 'Games Night Quest',
  subtitle: 'Action Charades · Pre-A1 Unit 10 · Lesson 6',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-10-6',
  theme: { accent: '#7C3AED', accent2: '#F59E0B', night: true, mapImg: room, guide: `${C}/mia-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'mia', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Guess the Action', icon: '🎩', intro: 'Listen. Which picture is it?', img: room,
      rounds: [
        { line: 'Swim!', answer: 'swim', options: [{ label: 'run', src: `${G}/u10l1-run.webp` }, { label: 'swim', src: `${G}/u10l2-swim.webp` }, { label: 'sing', src: `${G}/u10l2-sing.webp` }] },
        { line: 'Sleep!', answer: 'sleep', options: [{ label: 'sleep', src: it('leo-sleep') }, { label: 'dance', src: `${G}/u10l2-dance.webp` }, { label: 'jump', src: `${G}/u10l1-jump.webp` }] },
        { line: 'Clap!', answer: 'clap', options: [{ label: 'walk', src: `${G}/u10l1-walk.webp` }, { label: 'play', src: it('mia-play') }, { label: 'clap', src: it('pip-clap') }] },
        { line: 'Dance!', answer: 'dance', options: [{ label: 'sing', src: `${G}/u10l2-sing.webp` }, { label: 'dance', src: `${G}/u10l2-dance.webp` }, { label: 'swim', src: `${G}/u10l2-swim.webp` }] },
      ] },
    { kind: 'picture-choice', name: 'Who Can?', icon: '🔔', intro: 'Listen. Who can do it?', img: room,
      rounds: [
        { line: 'It can fly!', answer: 'bird', options: [{ label: 'Leo', src: it('leo-wave') }, { label: 'bird', src: it('bird-fly') }, { label: 'fish', src: it('goldfish') }] },
        { line: 'She can dance!', answer: 'Mia', options: [{ label: 'Mia', src: it('mia-wave') }, { label: 'Pip', src: it('pip-wave') }, { label: 'frog', src: it('frog-happy') }] },
        { line: 'He can sing!', answer: 'Leo', options: [{ label: 'Mia', src: it('mia-wave') }, { label: 'bear', src: it('bear-bruno') }, { label: 'Leo', src: it('leo-wave') }] },
      ] },
    { kind: 'sound-choice', name: 'R, D or B?', icon: '🔤', intro: 'Listen to the word. What sound does it start with?', img: room, choices: ['R', 'D', 'B'], phonics: true,
      rounds: [
        { word: 'rabbit', answer: 'R', picture: it('rabbit') },
        { word: 'drum', answer: 'D', picture: it('drum') },
        { word: 'bat', answer: 'B', picture: it('bat') },
        { word: 'robot', answer: 'R', picture: it('robot') },
      ] },
    { kind: 'sound-blend', name: 'Sound Train', icon: '🚂', intro: 'Tap each sound. Then blend them and find the picture!', img: room, voice: 'pip',
      rounds: [{ word: 'log', picture: it('log') }, { word: 'jam', picture: it('jam') }, { word: 'jet', picture: it('jet') }, { word: 'bin', picture: it('bin') }] },
    { kind: 'treasure', name: 'Games Night Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: room, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You can do it all! You are a charades star!' },
  ],
};
