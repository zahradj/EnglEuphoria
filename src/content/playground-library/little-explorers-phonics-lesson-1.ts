import type { Scene } from '@/components/playground-scene/ScenePlayer';

/**
 * Little Explorers Phonics — Pre-A1 — Unit 1 — Lesson 1
 * "Hello! My name is Pip."
 *
 * Ported faithfully from the source curriculum design
 * (unit-01-greetings.json, lesson_number: 1). Every scene below maps to
 * one authored activity from that JSON — nothing invented beyond what
 * was designed, except where the /m/ phonics content only has a trace
 * step (no separate hunt) per the original script.
 */
export const LESSON_1_TITLE = 'Hello! My name is Pip.';
export const LESSON_1_OBJECTIVE = "Greet a friend and say my name using 'Hello. My name is ___.'";

export const LESSON_1_SCENES: Scene[] = [
  // Title card
  {
    id: 'title',
    kind: 'intro',
    background: '/scenes/bg-title-forest.jpg',
    title: 'The Forest of Hellos',
    subtitle: 'Greetings & the /h/ and /m/ sounds',
    characters: [
      { who: 'pip', emotion: 'happy', waving: true, x: 40, y: 78, size: 200 },
      { who: 'mia', emotion: 'happy', x: 55, y: 82, size: 130 },
      { who: 'bella', emotion: 'happy', x: 68, y: 76, size: 160 },
    ],
    ctaLabel: 'Start Lesson →',
  },

  // 1. storybook (warm_up) — "Listen! Pip meets his friends." (3 tap scenes)
  {
    id: 'story-1',
    kind: 'dialogue',
    background: '/scenes/scene-pip-clearing.jpg',
    speaker: 'Pip',
    line: 'Hello! I am Pip.',
    characters: [{ who: 'pip', emotion: 'happy', talking: true, waving: true, x: 50, y: 60, size: 240 }],
  },
  {
    id: 'story-2',
    kind: 'dialogue',
    background: '/scenes/scene-mia-mousehole.jpg',
    speaker: 'Mia',
    line: 'Hello! My name is Mia.',
    characters: [{ who: 'mia', emotion: 'happy', talking: true, x: 50, y: 65, size: 200 }],
  },
  {
    id: 'story-3',
    kind: 'dialogue',
    background: '/scenes/bg-title-forest.jpg',
    speaker: 'Pip & Mia',
    line: 'Hello, friends!',
    characters: [
      { who: 'pip', emotion: 'happy', talking: true, x: 40, y: 68, size: 180 },
      { who: 'mia', emotion: 'happy', talking: true, x: 60, y: 70, size: 140 },
    ],
  },

  // 2. echo (presentation) — "Say it with Pip!" word: Hello
  {
    id: 'echo-hello',
    kind: 'dialogue',
    background: '/scenes/scene-pip-clearing.jpg',
    speaker: 'Say it with Pip!',
    line: 'Wave and say: Hello!',
    characters: [{ who: 'pip', emotion: 'happy', talking: true, waving: true, x: 50, y: 60, size: 240 }],
    ctaLabel: 'I said it! →',
  },

  // 3. shadowing (presentation) — "Copy Pip exactly." sentence
  {
    id: 'shadow-hello',
    kind: 'dialogue',
    background: '/scenes/scene-pip-clearing.jpg',
    speaker: 'Copy Pip exactly',
    line: 'Hello. My name is Pip.',
    characters: [{ who: 'pip', emotion: 'happy', talking: true, x: 50, y: 60, size: 240 }],
    ctaLabel: 'I copied it! →',
  },

  // 4. phonics_hunt (phonics) — /h/ like hello — hello,hat,sun,house,ball
  {
    id: 'hunt-h',
    kind: 'sound_quest',
    background: '/scenes/bg-title-forest.jpg',
    letter: 'H',
    phoneme: '/h/ /h/',
    prompt: 'Tap pictures that start with /h/ like hello!',
    goal: 3,
    targets: [
      { id: 'hello', emoji: '👋', label: 'hello', x: 18, y: 42, isMatch: true },
      { id: 'hat', emoji: '🎩', label: 'hat', x: 34, y: 58, isMatch: true },
      { id: 'sun', emoji: '☀️', label: 'sun', x: 50, y: 40, isMatch: false },
      { id: 'house', emoji: '🏠', label: 'house', x: 66, y: 55, isMatch: true },
      { id: 'ball', emoji: '⚽', label: 'ball', x: 82, y: 45, isMatch: false },
    ],
  },

  // 5. trace (phonics) — Trace H
  {
    id: 'trace-h',
    kind: 'trace',
    background: '/scenes/bg-title-forest.jpg',
    letter: 'H',
    phoneme: '/h/',
    prompt: 'Trace H and say /h/.',
  },

  // 6. sound_discrim (phonics) — Same sound at the start? hello vs hat
  {
    id: 'discrim-h',
    kind: 'exit_ticket',
    background: '/scenes/bg-title-forest.jpg',
    prompt: 'Same sound at the start? "hello" and "hat"',
    options: [
      { label: 'Same', emoji: '✅', correct: true },
      { label: 'Different', emoji: '❌' },
    ],
  },

  // 7. trace (phonics) — Trace M like Mia
  {
    id: 'trace-m',
    kind: 'trace',
    background: '/scenes/scene-mia-mousehole.jpg',
    letter: 'M',
    phoneme: '/m/',
    prompt: 'Trace M and say /m/ like Mia.',
  },

  // 8. listen_match (controlled_practice) — "Hello, my name is Mia."
  {
    id: 'listen-match',
    kind: 'drag_match',
    background: '/scenes/scene-mia-mousehole.jpg',
    letter: '🔊',
    prompt: 'Listen and tap the friend who says it: "Hello, my name is Mia."',
    items: [
      { id: 'mia', emoji: '🐭', label: 'Mia', isMatch: true },
      { id: 'pip', emoji: '🦊', label: 'Pip', isMatch: false },
      { id: 'bella', emoji: '🐰', label: 'Bella', isMatch: false },
    ],
  },

  // 9. role_play (semi_controlled) — "You are Pip! Greet Mia."
  {
    id: 'roleplay',
    kind: 'dialogue',
    background: '/scenes/scene-mia-mousehole.jpg',
    speaker: 'You are Pip! Greet Mia.',
    line: 'Hello! My name is Pip. Hello, Mia!',
    characters: [
      { who: 'pip', emotion: 'happy', talking: true, waving: true, x: 35, y: 65, size: 180 },
      { who: 'mia', emotion: 'happy', x: 65, y: 68, size: 150 },
    ],
    ctaLabel: 'I said my lines! →',
  },

  // 10. describe_picture (production) — "Tell Pip your name!"
  {
    id: 'describe',
    kind: 'dialogue',
    background: '/scenes/scene-pip-clearing.jpg',
    speaker: 'Tell Pip your name!',
    line: 'Hello. My name is ___.',
    characters: [{ who: 'pip', emotion: 'happy', talking: true, waving: true, x: 50, y: 60, size: 240 }],
    ctaLabel: 'I told him! →',
  },

  // 11. stretch_break (brain_break) — wave hands, 20s
  {
    id: 'stretch',
    kind: 'dialogue',
    background: '/scenes/bg-title-forest.jpg',
    speaker: '🎉 Brain Break!',
    line: "Wave your hands high, low, and say 'Hello!'",
    characters: [
      { who: 'pip', emotion: 'happy', waving: true, x: 35, y: 68, size: 180 },
      { who: 'bella', emotion: 'happy', waving: true, x: 65, y: 70, size: 160 },
    ],
    ctaLabel: "Done! →",
  },

  // 12. exit_ticket (closing)
  {
    id: 'exit',
    kind: 'exit_ticket',
    background: '/scenes/bg-title-forest.jpg',
    prompt: 'How do we say hi to a friend?',
    options: [
      { label: 'Hello!', emoji: '👋', correct: true },
      { label: 'Bye!', emoji: '👋' },
      { label: 'Shh!', emoji: '🤫' },
    ],
  },
];
