/**
 * The reusable-activity vault: concrete, already-built lesson activities
 * (scene `kind`s shared by every Playground scene library) that can be
 * dropped into any lesson with a different vocabulary set or background.
 * Shown on the /activity-catalog page; the full authoring rules live in
 * .claude/skills/activity-pattern-library.
 *
 * Add an entry here whenever a new shared activity is built, with an example
 * that is valid to paste straight into a lesson's scene array.
 */
export interface ReusableActivity {
  kind: string;
  name: string;
  /** Where the component lives. */
  file: string;
  purpose: string;
  howItWorks: string;
  /** Paste-ready scene object (swap the vocabulary / pictures). */
  example: Record<string, unknown>;
}

export const REUSABLE_ACTIVITIES: ReusableActivity[] = [
  {
    kind: 'picture-match',
    name: 'Picture ↔ word match',
    file: 'src/content/playground-library/PictureMatchScene.tsx',
    purpose: 'Controlled practice / self-check of 2-8 known words (vocabulary recognition + reading).',
    howItWorks:
      'Picture cards with an empty slot in two side columns, word tiles in the middle. The student drags a word into '
      + 'the slot under its picture (or taps the word, then the slot). Right = snaps in and is spoken; wrong = shakes '
      + 'back. With studentOnly the student works alone and the teacher watches live (auto-evaluation slide).',
    example: {
      id: 'u5-food-match',
      kind: 'picture-match',
      prompt: 'Match the words to the pictures',
      studentOnly: true,
      teacher:
        'Auto-evaluation slide. The student does the exercise independently, without help from the teacher. '
        + "Dragging is switched off on the teacher's screen — watch and praise at the end.",
      items: [
        { word: 'muffins', emoji: '🧁' },
        { word: 'bread', emoji: '🍞' },
        { word: 'yoghurt', emoji: '🥛' },
        { word: 'cheese', emoji: '🧀' },
        { word: 'butter', emoji: '🧈' },
        { word: 'eggs', emoji: '🥚' },
      ],
    },
  },
  {
    kind: 'spin-wheel',
    name: 'Spin the wheel',
    file: 'src/content/playground-library/SpinWheelScene.tsx',
    purpose: 'Speaking production / retrieval review of 2-8 known words.',
    howItWorks:
      'Picture scene with numbered badges plus the shared numbered spinner. SPIN lands on a number, that badge '
      + 'lights up, the student says the word (🔊 models it). Tapping a badge is the no-spinner route.',
    example: {
      id: 'u3-spin-actions',
      kind: 'spin-wheel',
      bg: '<background image import>',
      title: 'Spin!',
      teacher:
        'Have the student spin the wheel and say the word that matches the number. '
        + 'If you prefer, do the activity without the spinner.',
      items: [
        { label: 'jump', left: '78%', top: '44%' },
        { label: 'run', left: '62%', top: '82%' },
        { label: 'swim', left: '30%', top: '30%' },
      ],
    },
  },
  {
    kind: 'first-sound',
    name: 'First Sound Fishing',
    file: 'src/content/playground-library/FirstSoundScene.tsx',
    purpose: "Phonics: hear a picture's word and pick the letter it STARTS with (beginning-sound recognition).",
    howItWorks:
      "Underwater scene: a picture floats in a bubble and its word is spoken; the student catches the fish wearing the first "
      + "letter (2-4 fish). A right catch plays the letter's recorded sound (file-only, no TTS), then the word again, and the "
      + "missing first letter drops into the word sign. A wrong fish swims off, costs no heart, the word is repeated, and after "
      + "two misses the right fish glows. Any letters per round, so it fits any phonics focus.",
    example: {
      id: 'u1-first-sound',
      kind: 'first-sound',
      teacher: 'Say the word with the student, then let them pick the first letter.',
      rounds: [
        { word: 'moon', letter: 'M', choices: ['M', 'H', 'S'], img: '<picture import>' },
        { word: 'hat', letter: 'H', choices: ['H', 'M', 'T'], img: '<picture import>' },
      ],
    },
  },
  {
    kind: 'letter-match',
    name: 'Letter Homes (big & small letters)',
    file: 'src/content/playground-library/LetterTilesScene.tsx',
    purpose: 'Alphabet: match capital letters to their small letters (2-6 letters).',
    howItWorks:
      "Each capital letter lives in a house; the student drags (or taps, then taps the door) the small letter home. "
      + "Each match plays the recorded letter NAME. No penalty for a wrong drop.",
    example: {
      id: 'u1-letter-homes',
      kind: 'letter-match',
      teacher: 'Take each small letter home to its big letter.',
      letters: ['A', 'B', 'M', 'S'],
    },
  },
  {
    kind: 'letter-blocks',
    name: 'Alphabet Train / Sound Train',
    file: 'src/content/playground-library/LetterTilesScene.tsx',
    purpose: 'Alphabet / phonics sequencing: couple train cars in ABC order, or letter SOUNDS in order — up to the whole alphabet (26).',
    howItWorks:
      "MODEL FIRST: when every block has an illustration (alphabetArt.ts) the game opens with the illustrated Alphabet "
      + "Station (letter + picture + \"A is for apple\", spoken, with an A-Z strip) BEFORE the ordering; `model: false` skips it. "
      + "Then the student drags (or taps car, then slot) cars into numbered track slots. mode \"letters\": tapping says the "
      + "letter name. mode \"sounds\": tapping plays the recorded sound; give a `word` (+ picture) to order a word's sounds, "
      + "or omit it to order the 26 letter sounds a-z. Short rows are read out / blended at the end; 26-car rows skip the read-out.",
    example: {
      id: 'u1-alphabet-train',
      kind: 'letter-blocks',
      mode: 'letters',
      teacher: 'Visit every station, then couple the whole alphabet in order, A to Z.',
      rounds: [{ blocks: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') }],
    },
  },
  {
    kind: 'whats-missing',
    name: "Magic Show (What's missing?)",
    file: 'src/content/playground-library/WhatsMissingScene.tsx',
    purpose: 'Vocabulary + memory: say the words, remember 3-6 pictures, then spot the one that vanished.',
    howItWorks:
      "A magician's stage shows the pictures. Round 1 says every word aloud (model first); the student presses Hide, the curtains "
      + "close, one picture vanishes in a puff of stars and the curtains open. The student taps the missing one. A right pick brings it back "
      + "and says the word; a wrong pick wobbles (no hearts) and after two the right one glows. Fully synced; safe on the student mirror.",
    example: {
      id: 'u1-magic-show',
      kind: 'whats-missing',
      teacher: 'Say the words with the student, press Hide, then let them find what is missing.',
      rounds: [
        { items: [{ word: 'ball', img: '<picture import>' }, { word: 'teddy', img: '<picture import>' }, { word: 'doll', img: '<picture import>' }], missing: 1 },
      ],
    },
  },
  {
    kind: 'sort-basket',
    name: 'Market Sort (sort into baskets)',
    file: 'src/content/playground-library/SortBasketScene.tsx',
    purpose: 'Vocabulary + categories: name each picture, then tap the basket it belongs in (toys / food / animals…).',
    howItWorks:
      'A market stall with 2-3 baskets. The baskets are named aloud first (model first); then one picture at a time arrives on the counter '
      + 'and is named. The student taps its basket. A right pick drops it in (the basket keeps count); a wrong pick wobbles (no hearts) and after two '
      + 'the right basket glows. Taps, not drags, so it works with the smart pen. Fully synced; safe on the student mirror.',
    example: {
      id: 'u1-market-sort',
      kind: 'sort-basket',
      teacher: 'Name each picture with the student, then let them tap the right basket.',
      baskets: [{ label: 'toys', emoji: '🧸' }, { label: 'food', emoji: '🍎' }],
      items: [{ word: 'ball', img: '<picture import>', basket: 0 }, { word: 'apple', img: '<picture import>', basket: 1 }],
    },
  },
  {
    kind: 'grammar-gap',
    name: 'Grammar Garden (fill the gap)',
    file: 'src/content/playground-library/GrammarGapScene.tsx',
    purpose: 'Grammar: choose the correct form for the gap (a/an, is/are, singular/plural, am/is/are).',
    howItWorks:
      'A wooden sign shows a sentence with one gap and, when useful, a picture repeated count times (so one cat / two cats is seen). '
      + 'Worked examples are read aloud first (model first). The student taps the flower with the right word; it blooms into the gap and the whole sentence '
      + 'is read aloud. A wrong pick wobbles (no hearts) and after two the right flower glows. Taps, not drags. Fully synced; safe on the student mirror.',
    example: {
      id: 'u1-grammar-garden',
      kind: 'grammar-gap',
      teacher: 'Read the examples with the student, then let them pick the flower that fits.',
      examples: ['a ball', 'an apple'],
      rule: 'Use an before a, e, i, o, u.',
      rounds: [{ before: 'This is', after: 'ball.', choices: ['a', 'an'], answer: 'a', img: '<picture import>' }],
    },
  },
  {
    kind: 'color-play',
    name: 'Color Splash (pick / paint / mix / hunt)',
    file: 'src/content/playground-library/ColorPlayScene.tsx',
    purpose: 'Colours: match a colour word to its paint, paint a picture from what you hear (Cambridge listen-and-colour), mix two colours, find the shape of a colour.',
    howItWorks:
      'One scene, four modes. Model first: every colour of the stop is said aloud as its pot lights up. pick: hear a colour, tap that paint pot. paint: "Paint the balloon blue." and the outline fills with colour. '
      + 'mix: "What do yellow and blue make?" and the answer pot appears in the new colour. hunt: "Find the red apple." Shapes are drawn in SVG, so a colour is always exactly the colour named. '
      + 'Each solved round adds a small painting to the art show. Wrong picks wobble (no hearts); after two the right one glows. Fully synced, shared play, safe on the student mirror.',
    example: {
      id: 'u1-color-splash',
      kind: 'color-play',
      teacher: 'Say the colours with the student, then let them paint.',
      mode: 'paint',
      intro: ['red', 'blue'],
      rounds: [{ shape: 'balloon', answer: 'blue', options: ['blue', 'red'] }],
    },
  },
];
