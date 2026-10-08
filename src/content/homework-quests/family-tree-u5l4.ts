import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const picnic = `${S}/bg-u5l4-picnic-wide.png`;
const tree = `${S}/bg-u5l4-tree-wide.png`;

/** Pre-A1 Unit 5 Lesson 4 "My Family Tree" — Family Tree Quest.
 *  Practises "This is my grandma / grandpa / mom / dad / sister / baby",
 *  the generations of a family tree and the TH sound. */
export const QUEST_FAMILY_TREE_U5L4: HomeworkQuest = {
  id: 'family-tree-u5l4',
  title: 'Family Tree Quest',
  subtitle: 'My Family Tree · Pre-A1 Unit 5 · Lesson 4',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-5-4',
  theme: { accent: '#16A34A', accent2: '#F97316', night: false, mapImg: tree, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Great job!', 'Well done!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: 'Who Is It?', icon: '👪', intro: 'Listen. Tap the right picture!', img: picnic,
      rounds: [
        { line: 'This is my grandma!', answer: 'grandma', options: [{ label: 'grandma', src: `${I}/item-family-grandma.png` }, { label: 'mom', src: `${I}/item-family-mom.png` }, { label: 'baby', src: `${I}/item-family-baby.png` }] },
        { line: 'This is my dad!', answer: 'dad', options: [{ label: 'grandpa', src: `${I}/item-family-grandpa.png` }, { label: 'sister', src: `${I}/item-family-sister.png` }, { label: 'dad', src: `${I}/item-family-dad.png` }] },
        { line: 'This is my sister!', answer: 'sister', options: [{ label: 'sister', src: `${I}/item-family-sister.png` }, { label: 'brother', src: `${I}/item-family-brother.png` }, { label: 'grandma', src: `${I}/item-family-grandma.png` }] },
        { line: 'This is my grandpa!', answer: 'grandpa', options: [{ label: 'dad', src: `${I}/item-family-dad.png` }, { label: 'grandpa', src: `${I}/item-family-grandpa.png` }, { label: 'baby', src: `${I}/item-family-baby.png` }] },
      ] },
    { kind: 'true-false', name: 'Yes or No?', icon: '⚖️', intro: 'Look and listen. Is it true?',
      rounds: [
        { img: `${S}/bg-u5l3-grandma-wide.png`, line: 'This is my grandma!', isTrue: true },
        { img: `${S}/bg-u5l2-baby-wide.png`, line: 'This is my grandpa!', isTrue: false },
        { img: picnic, line: 'This is my family!', isTrue: true },
        { img: `${S}/bg-u5l2-sister-wide.png`, line: 'This is my brother!', isTrue: false },
      ] },
    { kind: 'sound-choice', name: 'TH or S?', icon: '👍', intro: 'Listen to the word. Which sound does it start with?', img: tree, choices: ['TH', 'S'], phonics: true, voice: 'pip',
      rounds: [
        { word: 'thumb', answer: 'TH', picture: `${I}/item-thumb.png` },
        { word: 'sun', answer: 'S', picture: `${I}/item-sun.png` },
        { word: 'three', answer: 'TH', picture: `${I}/item-three.png` },
        { word: 'snake', answer: 'S', picture: `${I}/item-snake.png` },
        { word: 'thunder', answer: 'TH', picture: `${I}/item-thunder.png` },
      ] },
    { kind: 'treasure', name: 'Picnic Basket', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: picnic, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You did it! This is my family tree! I love my family!' },
  ],
};
