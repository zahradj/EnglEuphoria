import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const fair = `${S}/bg-u7l4-fair-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 7 Lesson 4 "What Animal is This?" — Farm Fair Quest.
 *  Reviews all nine animals: names from clues, sounds, and first sounds D / C / H. */
export const QUEST_FARM_FAIR_U7L4: HomeworkQuest = {
  id: 'farm-fair-u7l4',
  title: 'Farm Fair Quest',
  subtitle: 'What Animal is This? · Pre-A1 Unit 7 · Lesson 4',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-7-4',
  theme: { accent: '#DC2626', accent2: '#2563EB', night: false, mapImg: fair, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Animal Riddles', icon: '🤔', intro: 'Listen to the clue. What animal is this?', img: fair,
      rounds: [
        { line: 'It says moo. It is big.', answer: 'cow', options: [{ label: 'pig', src: it('pig') }, { label: 'cow', src: it('cow') }, { label: 'dog', src: it('dog') }] },
        { line: 'It says quack. It is small.', answer: 'duck', options: [{ label: 'duck', src: it('farm-duck') }, { label: 'horse', src: it('horse') }, { label: 'cat', src: it('cat') }] },
        { line: 'It says neigh. It is brown.', answer: 'horse', options: [{ label: 'sheep', src: it('sheep') }, { label: 'bird', src: it('bird') }, { label: 'horse', src: it('horse') }] },
      ] },
    { kind: 'picture-choice', name: 'What Animal is This?', icon: '🐾', intro: 'Listen. Tap the right animal!', img: fair,
      rounds: [
        { line: "It's a sheep!", answer: 'sheep', options: [{ label: 'sheep', src: it('sheep') }, { label: 'chicken', src: it('hen') }, { label: 'pig', src: it('pig') }] },
        { line: "It's a bird!", answer: 'bird', options: [{ label: 'duck', src: it('farm-duck') }, { label: 'bird', src: it('bird') }, { label: 'cat', src: it('cat') }] },
        { line: "It's a chicken!", answer: 'chicken', options: [{ label: 'dog', src: it('dog') }, { label: 'cow', src: it('cow') }, { label: 'chicken', src: it('hen') }] },
      ] },
    { kind: 'sound-choice', name: 'First Sounds', icon: '🔤', intro: 'Listen to the word. Which sound does it start with?', img: fair, choices: ['D', 'C', 'H'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'dog', answer: 'D', picture: it('dog') },
        { word: 'cow', answer: 'C', picture: it('cow') },
        { word: 'horse', answer: 'H', picture: it('horse') },
        { word: 'duck', answer: 'D', picture: it('farm-duck') },
      ] },
    { kind: 'treasure', name: 'Fair Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: fair, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'What animal is this? You know them all! Hooray!' },
  ],
};
