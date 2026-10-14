import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const track = `${S}/bg-u10l1-track-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 10 Lesson 1 "Run, Jump, Walk!" — Sports Day Quest.
 *  Practises run, jump, walk and the sounds R and J. */
export const QUEST_SPORTS_DAY_U10L1: HomeworkQuest = {
  id: 'sports-day-u10l1',
  title: 'Sports Day Quest',
  subtitle: 'Run, Jump, Walk! · Pre-A1 Unit 10 · Lesson 1',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-10-1',
  theme: { accent: '#EF4444', accent2: '#22C55E', night: false, mapImg: track, guide: `${C}/leo-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'leo', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Coach Says', icon: '🏃', intro: 'Listen to the coach. Which move is it?', img: track,
      rounds: [
        { line: 'Jump!', answer: 'jump', options: [{ label: 'run', src: it('pip-run') }, { label: 'jump', src: it('pip-jump') }, { label: 'walk', src: it('pip-walk') }] },
        { line: 'Walk!', answer: 'walk', options: [{ label: 'walk', src: it('pip-walk') }, { label: 'run', src: it('pip-run') }, { label: 'jump', src: it('pip-jump') }] },
        { line: 'Run!', answer: 'run', options: [{ label: 'jump', src: it('pip-jump') }, { label: 'walk', src: it('pip-walk') }, { label: 'run', src: it('pip-run') }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '✅', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: track, line: 'Pip runs.', isTrue: true, sticker: { src: it('pip-run'), x: 50, y: 92, w: 18 } },
        { img: track, line: 'Pip walks.', isTrue: false, sticker: { src: it('pip-jump'), x: 50, y: 92, w: 18 } },
        { img: track, line: 'Pip jumps.', isTrue: true, sticker: { src: it('pip-jump'), x: 50, y: 92, w: 18 } },
      ] },
    { kind: 'sound-choice', name: 'R or J?', icon: '🔤', intro: 'Listen to the word. Does it start with R or J?', img: track, choices: ['R', 'J'], phonics: true,
      rounds: [
        { word: 'run', answer: 'R', picture: it('pip-run') },
        { word: 'jump', answer: 'J', picture: it('pip-jump') },
        { word: 'rabbit', answer: 'R', picture: it('rabbit') },
        { word: 'jam', answer: 'J', picture: it('jam') },
      ] },
    { kind: 'treasure', name: 'Gold Medal', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: track, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'Run, jump, walk! You win the gold medal!' },
  ],
};
