/**
 * Slide "Block" Templates — pre-built slide groups creators can drop in.
 *
 * Each template returns an array of slides (untyped here so both Playground
 * and Academy creators can share the registry — each hub passes its own
 * `make` factory to instantiate). The shape returned must match the hub's
 * native Slide union.
 */

export type TemplateKind = 'playground' | 'academy' | 'success';

export interface SlideTemplate<TSlide = any> {
  id: string;
  hub: TemplateKind;
  label: string;
  description: string;
  emoji: string;
  /** Tag used to group templates in the picker */
  category: 'Warm-Up' | 'Vocabulary' | 'Grammar' | 'Practice' | 'Speaking' | 'Cool-Off' | 'Full Unit';
  /** Build slides — receives the hub's makeSlide so we don't duplicate defaults. */
  build: (make: (type: string) => TSlide) => TSlide[];
}

/* ============================================================
   PLAYGROUND TEMPLATES (Kids — short, visual, gamified)
   ============================================================ */
export const PLAYGROUND_TEMPLATES: SlideTemplate[] = [
  {
    id: 'pg-warmup-hello',
    hub: 'playground',
    label: 'Hello Warm-Up',
    description: 'Friendly intro + quick tap-the-picture warm-up.',
    emoji: '👋',
    category: 'Warm-Up',
    build: (make) => [
      { ...make('intro'), title: '👋 Hello, friends!', text: "Let's start our adventure!" },
      { ...make('multiple'), question: 'Tap the SUN ☀️', options: ['☀️ sun', '🌙 moon', '⭐ star'], answer: '☀️ sun' },
    ],
  },
  {
    id: 'pg-vocab-3words',
    hub: 'playground',
    label: '3-Word Vocabulary Set',
    description: 'Intro + 3 vocabulary multiple-choice slides.',
    emoji: '📚',
    category: 'Vocabulary',
    build: (make) => [
      { ...make('intro'), title: '📚 New Words!', text: "Let's learn 3 new words." },
      { ...make('multiple'), question: 'What is this? 🐶', options: ['dog', 'cat', 'fish'], answer: 'dog' },
      { ...make('multiple'), question: 'What is this? 🍎', options: ['apple', 'banana', 'orange'], answer: 'apple' },
      { ...make('multiple'), question: 'What is this? 🚗', options: ['car', 'bus', 'bike'], answer: 'car' },
    ],
  },
  {
    id: 'pg-mimic-drag',
    hub: 'playground',
    label: 'Drag & Match Mini-Drill',
    description: 'Drag-and-drop word + matching pairs.',
    emoji: '🖱️',
    category: 'Practice',
    build: (make) => [
      { ...make('drag'), instruction: 'Drag the word onto the picture', word: 'APPLE' },
      { ...make('match'), instruction: 'Match the word to the picture' },
    ],
  },
  {
    id: 'pg-cooloff-draw',
    hub: 'playground',
    label: 'Cool-Off & Celebrate',
    description: 'Drawing prompt + goodbye intro.',
    emoji: '🎨',
    category: 'Cool-Off',
    build: (make) => [
      { ...make('draw'), prompt: 'Draw your favourite animal!' },
      { ...make('intro'), title: '🎉 Great job!', text: 'See you next time!' },
    ],
  },
  {
    id: 'pg-full-unit',
    hub: 'playground',
    label: 'Full 6-Slide Mini-Unit',
    description: 'Hello → 2 vocab → drag → draw → goodbye.',
    emoji: '⭐',
    category: 'Full Unit',
    build: (make) => [
      { ...make('intro'), title: '👋 Hello!', text: "Today's adventure begins!" },
      { ...make('multiple'), question: 'What is this? 🐱', options: ['cat', 'dog', 'fish'], answer: 'cat' },
      { ...make('truefalse'), statement: 'A cat says MEOW 🐱', answer: true },
      { ...make('drag'), instruction: 'Drag the word onto the picture', word: 'CAT' },
      { ...make('draw'), prompt: 'Draw a happy cat!' },
      { ...make('intro'), title: '🎉 Bye!', text: 'You did it!' },
    ],
  },
  {
    id: 'pg-game-bubble-pop',
    hub: 'playground',
    label: '🫧 Bubble Pop Game',
    description: 'Underwater arcade mini-game — tap the correct words.',
    emoji: '🫧',
    category: 'Practice',
    build: (make) => [
      {
        ...make('multiple'),
        question: '🫧 Pop the FRUITS!',
        options: ['🍎 apple', '🐶 dog', '🍌 banana', '🚗 car', '🍇 grape'],
        answer: '🍎 apple',
        game_background: 'ocean',
      },
    ],
  },
  {
    id: 'pg-game-space-quiz',
    hub: 'playground',
    label: '🚀 Space Arcade Quiz',
    description: 'Cosmic background + quick-fire quiz with confetti rewards.',
    emoji: '🚀',
    category: 'Practice',
    build: (make) => [
      { ...make('intro'), title: '🚀 Blast Off!', text: "Ready for the space quiz?", game_background: 'space' },
      { ...make('multiple'), question: 'What colour is the SUN? ☀️', options: ['yellow', 'blue', 'green'], answer: 'yellow', game_background: 'space' },
      { ...make('truefalse'), statement: 'The moon is made of cheese 🧀', answer: false, game_background: 'space' },
    ],
  },
];

/* ============================================================
   ACADEMY TEMPLATES (Teens/Adults — longer, communicative)
   ============================================================ */
export const ACADEMY_TEMPLATES: SlideTemplate[] = [
  {
    id: 'ac-warmup-opinion',
    hub: 'academy',
    label: 'Opinion Warm-Up',
    description: 'Open question + opinion prompt to engage students.',
    emoji: '💭',
    category: 'Warm-Up',
    build: (make) => [
      { ...make('question'), prompt: 'What did you do this weekend?' },
      { ...make('opinion'), prompt: 'Do you prefer mornings or evenings? Why?' },
    ],
  },
  {
    id: 'ac-vocab-set',
    hub: 'academy',
    label: 'Vocabulary Set (3 + matching)',
    description: '3 vocab slides + a matching activity.',
    emoji: '📖',
    category: 'Vocabulary',
    build: (make) => [
      { ...make('vocab'), word: 'reliable', definition: 'can be trusted', example: 'She is a reliable friend.' },
      { ...make('vocab'), word: 'efficient', definition: 'works well without waste', example: 'This is an efficient method.' },
      { ...make('vocab'), word: 'curious', definition: 'eager to learn', example: 'Children are naturally curious.' },
      { ...make('matching'), prompt: 'Match the words to their meanings.' },
    ],
  },
  {
    id: 'ac-grammar-mini',
    hub: 'academy',
    label: 'Grammar Mini-Lesson',
    description: 'Pattern → error detection → correction.',
    emoji: '📝',
    category: 'Grammar',
    build: (make) => [
      { ...make('grammar_pattern'), title: 'Present Simple — 3rd person', rule: 'Add -s for he/she/it.' },
      { ...make('error_detection'), prompt: 'Tap the wrong word.', sentence: 'She go to school.', wrongIndex: 1 },
      { ...make('correction'), prompt: 'Fix the sentence.', wrong: 'He don\'t like coffee.', answer: "He doesn't like coffee." },
    ],
  },
  {
    id: 'ac-practice-cluster',
    hub: 'academy',
    label: 'Practice Cluster',
    description: 'MCQ → fill-the-blank → sentence builder.',
    emoji: '🎯',
    category: 'Practice',
    build: (make) => [
      { ...make('multiple'), question: 'Which is correct?', options: ['She go', 'She goes', 'She going'], answer: 'She goes' },
      { ...make('fill_blank'), prompt: 'Complete the sentence.', before: 'He', after: 'to school every day.', answer: 'goes' },
      { ...make('sentence_builder'), prompt: 'Order the words.' },
    ],
  },
  {
    id: 'ac-speaking',
    hub: 'academy',
    label: 'Speaking Task + Reflection',
    description: 'Speaking task with starters + reflection.',
    emoji: '🎤',
    category: 'Speaking',
    build: (make) => [
      { ...make('speaking_task'), prompt: 'Describe your daily routine.', starters: ['I usually…', 'After that, I…', 'In the evening, I…'] },
      { ...make('reflection'), prompt: 'What was the easiest part of today\'s lesson?' },
    ],
  },
  {
    id: 'ac-full-unit',
    hub: 'academy',
    label: 'Full 8-Slide Lesson',
    description: 'Warm-up → vocab → reading → grammar → practice → speaking.',
    emoji: '⭐',
    category: 'Full Unit',
    build: (make) => [
      { ...make('intro'), title: 'Today\'s Lesson', subtitle: 'Daily routines' },
      { ...make('question'), prompt: 'What time do you usually wake up?' },
      { ...make('vocab'), word: 'routine', definition: 'a usual sequence of actions', example: 'My morning routine is simple.' },
      { ...make('reading_passage'), title: 'A Typical Day', passage: 'Anna wakes up at 7 AM…' },
      { ...make('grammar_pattern'), title: 'Present Simple', rule: 'Use for habits and routines.' },
      { ...make('multiple'), question: 'Which is a routine verb?', options: ['eat', 'exploded', 'forgot'], answer: 'eat' },
      { ...make('speaking_task'), prompt: 'Tell your partner about your routine.', starters: ['I usually…', 'Then I…'] },
      { ...make('reflection'), prompt: 'What did you learn today?' },
    ],
  },
];

export function getTemplatesForHub(hub: TemplateKind): SlideTemplate[] {
  return hub === 'playground' ? PLAYGROUND_TEMPLATES : ACADEMY_TEMPLATES;
}
