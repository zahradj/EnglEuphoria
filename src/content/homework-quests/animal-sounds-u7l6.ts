import type { HomeworkQuest } from './types';

const S = '/lep1/scenes';
const I = '/lep1/items';
const C = '/lep1/characters';
const K = '/lep1/stickers';
const night = `${S}/bg-u7l6-night-farm-wide.png`;
const it = (n: string) => `${I}/item-${n}.png`;

/** Pre-A1 Unit 7 Lesson 6 "Animal Sounds Game" — Night Farm Quest.
 *  Reviews the whole unit by sound: hear the animal → "It's a cow!". */
export const QUEST_ANIMAL_SOUNDS_U7L6: HomeworkQuest = {
  id: 'animal-sounds-u7l6',
  title: 'Night Farm Quest',
  subtitle: 'Animal Sounds Game · Pre-A1 Unit 7 · Lesson 6',
  level: 'Pre-A1',
  lessonKey: 'lep1-rich-7-6',
  theme: { accent: '#4338CA', accent2: '#F59E0B', night: true, mapImg: night, guide: `${C}/pip-happy.png`, walker: `${C}/pip-hello.png` },
  voice: 'teacher',
  praise: { voice: 'pip', lines: ['Yes! Well done!', 'Great job!', 'Wow, perfect!'], tryAgain: 'Try again!' },
  levels: [
    { kind: 'picture-choice', name: "Who's There?", icon: '🔊', intro: 'Listen to the sound. What animal is this?', img: night,
      rounds: [
        { line: 'Neigh! Neigh! What animal is this?', answer: 'horse', options: [{ label: 'horse', src: it('horse') }, { label: 'cat', src: it('cat') }, { label: 'pig', src: it('pig') }] },
        { line: 'Woof! Woof! What animal is this?', answer: 'dog', options: [{ label: 'duck', src: it('farm-duck') }, { label: 'dog', src: it('dog') }, { label: 'sheep', src: it('sheep') }] },
        { line: 'Cluck! Cluck! What animal is this?', answer: 'chicken', options: [{ label: 'cow', src: it('cow') }, { label: 'bird', src: it('bird') }, { label: 'chicken', src: it('hen') }] },
        { line: 'Meow! Meow! What animal is this?', answer: 'cat', options: [{ label: 'cat', src: it('cat') }, { label: 'dog', src: it('dog') }, { label: 'horse', src: it('horse') }] },
      ] },
    { kind: 'true-false', name: 'Is It Right?', icon: '🌙', intro: 'Look and listen. Is it right?',
      rounds: [
        { img: night, line: "Baa! Baa! It's a sheep!", isTrue: true, sticker: { src: it('sheep'), x: 50, y: 92, w: 20 } },
        { img: night, line: "Quack! Quack! It's a cow!", isTrue: false, sticker: { src: it('farm-duck'), x: 50, y: 92, w: 18 } },
        { img: night, line: "Tweet! Tweet! It's a bird!", isTrue: true, sticker: { src: it('bird'), x: 50, y: 92, w: 16 } },
      ] },
    { kind: 'treasure', name: 'Farm Prize', icon: `${K}/chest-closed.png`, intro: 'Tap the chest to open it!', img: night, closed: `${K}/chest-closed.png`, open: `${K}/chest-open.png`, win: 'You know every animal by its sound! Good night, farm!' },
  ],
};
