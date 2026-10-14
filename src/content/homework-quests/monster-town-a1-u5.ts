import type { HomeworkQuest } from './types';

/* A1 Monster Town (Unit 5) homework quests, one per lesson — the same level kinds as the Unit 2-4 quests. */

const S = '/lep1/scenes';
const it = (n: string) => `/lep1/items/item-${n}.png`;
const page = (n: number) => `${S}/bg-a1u5-story-${n}-wide.png`;
const street = `${S}/bg-a1u5-street-wide.png`;
const lab = `${S}/bg-a1u5-lab-wide.png`;
const theme = (mapImg: string) => ({ accent: '#8B5CF6', accent2: '#14B8A6', night: false, mapImg, guide: '/lep1/characters/pip-happy.png', walker: '/lep1/characters/mia-hello.png' });
const praise = { voice: 'pip' as const, lines: ['Yes! Great job!', 'Monster-tastic!', 'Wow, perfect!'], tryAgain: 'Try again!' };
const chest = (win: string, img = street) => ({ kind: 'treasure' as const, name: 'Monster Chest', icon: '/lep1/stickers/chest-closed.png', intro: 'Tap the chest to open it!', img, closed: '/lep1/stickers/chest-closed.png', open: '/lep1/stickers/chest-open.png', win });

/** Lesson 1 "How Do You Feel? Scared, Bored, Excited!" */
export const QUEST_MONSTER_FEELINGS_A1_U5L1: HomeworkQuest = {
  id: 'monster-feelings-a1-u5l1', title: 'Monster Feelings Quest', subtitle: 'How Do You Feel? · A1 Unit 5 · Lesson 1', level: 'A1', lessonKey: 'monster-rich-5-1',
  theme: theme(page(1)), voice: 'teacher', praise,
  levels: [
    { kind: 'picture-choice', name: 'Bibi’s Faces', icon: '👾', intro: 'Listen. Tap Bibi’s face!', img: street,
      rounds: [
        { line: 'She’s scared.', answer: 'scared', options: [{ label: 'scared', src: it('bibi-scared') }, { label: 'happy', src: it('bibi-happy') }, { label: 'bored', src: it('bibi-bored') }] },
        { line: 'She’s excited!', answer: 'excited', options: [{ label: 'sad', src: it('bibi-sad') }, { label: 'excited', src: it('bibi-excited') }, { label: 'tired', src: it('bibi-tired') }] },
        { line: 'She’s surprised!', answer: 'surprised', options: [{ label: 'angry', src: it('bibi-angry') }, { label: 'scared', src: it('bibi-scared') }, { label: 'surprised', src: it('bibi-surprised') }] },
        { line: 'She’s bored.', answer: 'bored', options: [{ label: 'bored', src: it('bibi-bored') }, { label: 'excited', src: it('bibi-excited') }, { label: 'happy', src: it('bibi-happy') }] },
      ] },
    { kind: 'true-false', name: 'Why?', icon: '❓', intro: 'Look and listen. True or false?',
      rounds: [
        { img: `${S}/bg-a1u5-why-dark-wide.png`, aspect: 16 / 9, line: 'It’s dark. Bibi is scared.', isTrue: true },
        { img: `${S}/bg-a1u5-why-party-wide.png`, aspect: 16 / 9, line: 'It’s a party. Bibi is bored.', isTrue: false },
        { img: `${S}/bg-a1u5-why-present-wide.png`, aspect: 16 / 9, line: 'A big present! Bibi is surprised.', isTrue: true },
      ] },
    { kind: 'sentence-builder', name: 'Because…', icon: '🧱', intro: 'Listen. Build what you hear!',
      rounds: [
        { img: it('bibi-scared'), line: 'She is scared because it is dark.', extra: ['happy'] },
        { img: it('bibi-tired'), line: 'She is tired because it is early.', extra: ['party'] },
      ] },
    { kind: 'reading', name: 'The Story', icon: '📖', intro: 'Read the story. Then answer from memory!', img: page(3),
      sentences: ['This is Monster Town. Look! A tiny monster.', 'This is Bibi. Bibi is tired because it is early.', 'It is dark. Bibi is scared!'],
      questions: [
        { q: 'Who is the tiny monster?', options: ['Bibi', 'Pip', 'Leo'], answer: 'Bibi' },
        { q: 'Why is Bibi tired?', options: ['It is early.', 'It is a party.', 'It is hot.'], answer: 'It is early.' },
      ] },
    { kind: 'twister', name: 'Bee Twister', icon: '🌀', intro: 'Build my tongue twister before the sand runs out!', img: lab, line: 'Three green bees see sheep.', seconds: 45, focus: 'ee', sayIt: 'Now say it slow, then faster!' },
    { kind: 'sound-blend', name: 'Blend It!', icon: '🧱', intro: 'Tap each sound, then Blend!', img: lab,
      rounds: [
        { word: 'bee', sounds: ['b', 'ee'], picture: it('bee') },
        { word: 'sheep', sounds: ['sh', 'ee', 'p'], picture: it('sheep') },
      ] },
    chest('You did it! Feelings expert!'),
  ],
};
