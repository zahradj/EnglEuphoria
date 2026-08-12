/* =============================================================================
 * Welcome Town — A1 Unit 1 Lesson 1: "Hello, Class!"
 *
 * This is the Playground Hub's first A1-tier lesson (distinct from the
 * existing Pre-A1 "Little Explorers Phonics" curriculum in
 * ../unit1/scenes.ts — that content is explicitly Pre-A1 per its own
 * title-card `level` field; A1 is the next tier up).
 *
 * Direct instruction this revision implements:
 *   - Every character appears painted directly into a full-bleed classroom
 *     background — no floating sticker/mascot images anywhere. A scene that
 *     needs to show who's speaking either (a) has that character already
 *     painted into its `bg`, with an invisible tap-zone over the general
 *     area (the `meet` scene pattern — see SceneRenderer.tsx), or (b) is a
 *     game mechanic that reveals a name/emoji badge rather than a body
 *     illustration (hello-doors).
 *   - The whole lesson is set in one school building (Welcome Town School),
 *     not a town street — different rooms/moments (classroom door, circle
 *     time, a reading nook, cubby doors) for visual variety per the art
 *     style contract's "characters painted into the background, never a
 *     pasted cut-out" rule.
 *   - Story: Pip (same fox from the Pre-A1 curriculum — same name, voice,
 *     color) is the new student; Miss Marigold is the teacher; Mia, Bella,
 *     Willow, and Leo (also carried forward from Pre-A1) are the established
 *     classmates who welcome him as an ensemble — visible throughout and
 *     given a couple of spoken cameo lines (roleplay, join-stage,
 *     hello-doors), without each needing a dedicated full "meet" sequence,
 *     per the pacing budget below.
 *   - Two parts in one lesson: Part 1 (greetings + self-intro only) and
 *     Part 2 (phonics S/A/T + first CVC word, SAT) — phonics-alongside-topic
 *     is an established, correct Pre-A1 pairing per playground-curriculum-
 *     engine's case study. Colors was cut from this lesson entirely per that
 *     same skill: it's a Unit 2 ("Colors & Shapes") topic per this project's
 *     own seeded A1 roadmap, with no knowledge-graph link to greetings —
 *     grafting it onto Lesson 1 was the exact "orphan topic" mistake that
 *     skill's validation checklist exists to catch. See
 *     .agents/skills/playground-curriculum-engine/SKILL.md.
 *
 * Pacing check against playground-library-lesson-builder's §12 budget
 * (title+cinematic ~1.5min; "say it out loud" reps meet/echo/roleplay/
 * join-stage budgeted 3-5 across a lesson — this lesson runs slightly over
 * that at 6, deliberately, since two of the original meet+echo pairs were
 * collapsed into one meet each — the meet scene's own hold-to-repeat step
 * already IS the repeat practice, so a separate echo scene right after
 * teaching the identical line is redundant repetition, not extra learning;
 * 1-3min per mini-game; 2-4min per new letter's sound-model+trace pair):
 * estimated total ≈ 26-28 minutes now that colors (~5min) is removed.
 * ========================================================================= */

const W = '/welcome-town';

export type CharKey = 'pip' | 'marigold' | 'mia' | 'bella' | 'willow' | 'leo';

/** Every one of these maps onto an audio.ts voice already built for that
 *  exact character (pip/mia/bella/willow/leo are the same characters as the
 *  Pre-A1 curriculum, reusing their established voices) — Marigold plays a
 *  teacher role, so she uses the existing generic 'teacher' key. */
export const VOICE_KEY: Record<CharKey, 'pip' | 'mia' | 'bella' | 'willow' | 'leo' | 'teacher'> = {
  pip: 'pip',
  marigold: 'teacher',
  mia: 'mia',
  bella: 'bella',
  willow: 'willow',
  leo: 'leo',
};

/** No `img` field — every character appears painted directly into a scene's
 *  `bg`, never as a standalone floating image (see the file banner above). */
export const CAST: Record<CharKey, { name: string; emoji: string; color: string }> = {
  pip: { name: 'Pip', emoji: '\u{1F98A}', color: '#FE6A2F' },
  marigold: { name: 'Miss Marigold', emoji: '\u{1F989}', color: '#8ECAE6' },
  mia: { name: 'Mia', emoji: '\u{1F42D}', color: '#B85CD1' },
  bella: { name: 'Bella', emoji: '\u{1F430}', color: '#E76FA5' },
  willow: { name: 'Willow', emoji: '\u{1F426}', color: '#4FA9E0' },
  leo: { name: 'Leo', emoji: '\u{1F981}', color: '#C97A2F' },
};

const bgWide = `${W}/scenes/bg-classroom-wide.png`;
const bgDoor = `${W}/scenes/bg-classroom-door.png`;
const bgCircle = `${W}/scenes/bg-classroom-circle.png`;
const bgCubbies = `${W}/scenes/bg-cubbies.png`;
const bgReading = `${W}/scenes/bg-classroom-reading.png`;
const bgFixtures = `${W}/scenes/bg-classroom-fixtures.png`;
const bgPeople = `${W}/scenes/bg-classroom-people.png`;
const bgExpressHello = `${W}/scenes/bg-express-hello.png`;
const bgExpressGoodbye = `${W}/scenes/bg-express-goodbye.png`;
const bgExpressFriend = `${W}/scenes/bg-express-friend.png`;
const bgFeelings = `${W}/scenes/bg-classroom-feelings.png`;

export type Scene =
  | { id: string; kind: 'title-card'; bg: string; level: string; unit: string; lessonLabel: string; title: string; subtitle: string; cta?: string }
  | { id: string; kind: 'cinematic'; bg: string; title: string; subtitle: string; narrator: CharKey; script: { who: CharKey; line: string }[]; cta: string }
  | { id: string; kind: 'meet'; bg: string; who: CharKey; teacher: string; line: string; repeat: string }
  | { id: string; kind: 'echo'; bg: string; who: CharKey; teacher: string; word: string }
  | { id: string; kind: 'memory'; bg: string; teacher: string; pairs: { id: string; label: string; emoji: string }[] }
  | { id: string; kind: 'drag-match'; bg: string; teacher: string; items: { label: string; color: string; targetLeft: string; targetTop: string; who?: CharKey }[]; showBlanks?: boolean; pointTo?: { who: CharKey; left: string; top: string; dir?: 'down' | 'left' | 'right' }[] }
  | { id: string; kind: 'vocab-spot'; bg: string; teacher: string; items: { label: string; sentence: string; emoji: string; left: string; top: string; color: string; dir?: 'down' | 'left' | 'right'; who?: CharKey }[] }
  | { id: string; kind: 'choice'; bg: string; who: CharKey; teacher: string; prompt: string; options: { label: string; emoji: string; correct?: boolean }[]; pointTo?: { who: CharKey; left: string; top: string; dir?: 'down' | 'left' | 'right' }[] }
  | { id: string; kind: 'roleplay'; bg: string; teacher: string; cast: CharKey[]; script: { who: CharKey; line: string; repeat?: boolean }[] }
  | { id: string; kind: 'join-stage'; bg: string; teacher: string; cast: CharKey[]; turns: { who: CharKey | 'student'; line: string }[] }
  | { id: string; kind: 'hello-doors'; bg: string; teacher: string; cast: CharKey[]; rounds: { target: CharKey; prompt: string; helloLine: string; echoLine: string }[] }
  | { id: string; kind: 'flipbook'; bg: string; title: string; pages: { who?: CharKey; img: string; text: string }[]; checkpoints: { afterPage: number; who: CharKey; question: string; options: string[]; answer: string }[] }
  | { id: string; kind: 'song'; bg: string; title: string; teacher: string; songUrl?: string; durationSeconds?: number; bigWord?: string; lyrics: { who: CharKey; text: string }[] }
  | { id: string; kind: 'sound-model'; bg: string; who: CharKey; letter: string; phoneme: string; sound: string; teacher: string; anchors: { word: string; emoji: string; img?: string }[] }
  | { id: string; kind: 'trace'; bg: string; who: CharKey; letter: string; phoneme: string; word: string; teacher: string }
  | { id: string; kind: 'word-build'; bg: string; teacher: string; rounds: { word: string; blankIndex: number; answer: string; choices: string[]; img?: string; emoji: string }[] }
  | { id: string; kind: 'letter-game'; bg: string; who: CharKey; teacher: string; mode: 'name' | 'sound'; rounds: { letter: string; phoneme?: string; choices: string[] }[] }
  | { id: string; kind: 'jigsaw-puzzle'; bg: string; teacher: string; image: string; rows: number; cols: number }
  | { id: string; kind: 'finale'; bg: string; who: CharKey; line: string };

export const LESSON_1_TITLE = 'Hello, Class!';
export const LESSON_1_OBJECTIVE = "Part 1: Greet your new class and share your name (\"Hello! My name is ___.\"). Part 2: Learn the sounds S, A, T and read your first word.";

export const LESSON_1_SCENES: Scene[] = [
  { id: 'wt-title', kind: 'title-card', bg: bgWide, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 1', title: 'Welcome Town School: Hello, Class!', subtitle: 'Meet the class, say your name, and read your first word' },

  {
    id: 'wt-intro', kind: 'cinematic', bg: bgDoor, title: 'Welcome Town School', subtitle: 'A new friend joins the class today', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Good morning, class! Today is a very special day.' },
      { who: 'marigold', line: 'We have a new friend joining us. Let’s all say hello!' },
    ],
    cta: '\u{1F392} LET’S GO!',
  },

  { id: 'wt-meet-marigold', kind: 'meet', bg: bgExpressHello, who: 'marigold', teacher: 'Tap Miss Marigold to hear her say hello!', line: 'Hello! I am Miss Marigold, your teacher. Welcome to our class!', repeat: 'Hello!' },
  { id: 'wt-meet-pip', kind: 'meet', bg: bgDoor, who: 'pip', teacher: 'Here comes Pip! Tap him to say hi.', line: 'Hi! My name is Pip. I am 7 years old. I am new here!', repeat: 'My name is Pip.' },

  {
    // 2-3 hotspots per scene, not 5 — per attention-engine's own cognitive-
    // load rule, and direct feedback. Each vocab-spot scene gets its own
    // dedicated, purpose-built background (never reused from a narrative
    // scene) so every target word is large, clean, and unambiguous.
    id: 'wt-vocab-people', kind: 'vocab-spot', bg: bgPeople,
    teacher: 'Look around! Tap the arrow to learn a classroom word.',
    items: [
      { label: 'Teacher', sentence: 'This is the teacher.', emoji: '\u{1F989}', left: '26%', top: '42%', color: '#8ECAE6', who: 'marigold' },
      { label: 'Student', sentence: 'This is the student.', emoji: '\u{1F98A}', left: '68%', top: '48%', color: '#FE6A2F', who: 'pip' },
    ],
  },
  {
    // A dedicated scene purpose-built for this hotspot trio (not reused
    // from the arrival/door narrative scene) — Door, Board, and Window are
    // each large, clean, and evenly spaced here.
    id: 'wt-vocab-room', kind: 'vocab-spot', bg: bgFixtures,
    teacher: 'Now find these things in the room!',
    items: [
      { label: 'Door', sentence: 'This is the door.', emoji: '\u{1F6AA}', left: '16%', top: '48%', color: '#8B5CF6' },
      { label: 'Board', sentence: 'This is the board.', emoji: '\u{1F4CB}', left: '49%', top: '49%', color: '#22C55E' },
      { label: 'Window', sentence: 'This is the window.', emoji: '\u{1FA9F}', left: '81%', top: '47%', color: '#06B6D4' },
    ],
  },

  {
    // The "Practice" step right after vocabulary discovery (per visual-
    // learning-engine's Scene → Discovery → Flashcards → PRACTICE flow) —
    // listen-and-drag: tap a token to hear its word, then drag it onto that
    // exact object in the same full-bleed scene it was just discovered in.
    // Target coordinates deliberately match wt-vocab-people's own hotspots
    // one-for-one, so "drop zone" and "where the word lives" are the same
    // point the learner already looked at.
    id: 'wt-drag-people', kind: 'drag-match', bg: bgPeople, teacher: 'Listen, then drag each word onto the matching classroom member!',
    items: [
      { label: 'Teacher', color: '#8ECAE6', who: 'marigold', targetLeft: '26%', targetTop: '42%' },
      { label: 'Student', color: '#FE6A2F', who: 'pip', targetLeft: '68%', targetTop: '48%' },
    ],
  },
  {
    id: 'wt-drag-room', kind: 'drag-match', bg: bgFixtures, teacher: 'Listen, then drag each word onto the matching thing in the room!',
    items: [
      { label: 'Door', color: '#8B5CF6', targetLeft: '16%', targetTop: '48%' },
      { label: 'Board', color: '#22C55E', targetLeft: '49%', targetTop: '49%' },
      { label: 'Window', color: '#06B6D4', targetLeft: '81%', targetTop: '47%' },
    ],
  },

  {
    id: 'wt-vocab-friend-teacher', kind: 'meet', bg: bgExpressFriend, who: 'marigold',
    teacher: 'Tap Miss Marigold to learn two new words: friend and teacher!',
    line: 'Mia, Bella, Willow, and Leo are Pip’s new friends — and I am your teacher!', repeat: 'My friend! My teacher!',
  },

  {
    id: 'wt-memory-words', kind: 'memory', bg: bgCircle, teacher: 'Match the matching pairs! Hello, goodbye, name, friend, teacher.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '\u{1F44B}' },
      { id: 'goodbye', label: 'Goodbye', emoji: '\u{1F44B}' },
      { id: 'name', label: 'Name', emoji: '\u{1F3F7}️' },
      { id: 'friend', label: 'Friend', emoji: '\u{1F91D}' },
      { id: 'teacher', label: 'Teacher', emoji: '\u{1F469}‍\u{1F3EB}' },
    ],
  },

  {
    id: 'wt-choice-hello', kind: 'choice', bg: bgCircle, who: 'pip', teacher: 'Listen carefully, then tap the right answer!',
    prompt: 'Which word means HELLO?',
    options: [
      { label: 'Hello', emoji: '\u{1F44B}', correct: true },
      { label: 'Goodbye', emoji: '\u{1F44B}' },
      { label: 'Friend', emoji: '\u{1F91D}' },
    ],
  },

  {
    id: 'wt-roleplay', kind: 'roleplay', bg: bgCircle, teacher: 'Story time! Listen to Pip and Miss Marigold, then repeat each line.', cast: ['pip', 'marigold', 'mia'],
    script: [
      { who: 'marigold', line: 'Hello! My name is Miss Marigold.', repeat: true },
      { who: 'pip', line: 'Hello! My name is Pip.', repeat: true },
      { who: 'marigold', line: 'How old are you, Pip?', repeat: true },
      { who: 'pip', line: 'I am 7 years old.', repeat: true },
      { who: 'marigold', line: 'Nice to meet you, Pip!', repeat: true },
      { who: 'pip', line: 'Nice to meet you too!', repeat: true },
      { who: 'mia', line: 'Welcome to our class, Pip!' },
    ],
  },

  {
    id: 'wt-join-stage', kind: 'join-stage', bg: bgCircle, teacher: 'Your turn! When it says YOU, say your own name and age out loud!', cast: ['pip', 'marigold', 'leo'],
    turns: [
      { who: 'marigold', line: 'Hello! What is your name?' },
      { who: 'student', line: 'Hello! My name is ______.' },
      { who: 'pip', line: 'How old are you?' },
      { who: 'student', line: 'I am ______ years old.' },
      { who: 'marigold', line: 'Nice to meet you! Welcome to our class!' },
      { who: 'leo', line: 'We are so happy you are here!' },
    ],
  },

  {
    id: 'wt-hello-doors', kind: 'hello-doors', bg: bgCubbies, teacher: 'Knock knock! Tap the right cubby to meet a classmate!', cast: ['mia', 'leo'],
    rounds: [
      { target: 'mia', prompt: 'Knock knock! Which cubby is Mia’s?', helloLine: 'Hi! I am Mia! Welcome to our class!', echoLine: 'Hello, Mia!' },
      { target: 'leo', prompt: 'Knock knock! Which cubby is Leo’s?', helloLine: 'Hey there! I am Leo!', echoLine: 'Hello, Leo!' },
    ],
  },

  {
    id: 'wt-storybook', kind: 'flipbook', bg: bgWide, title: "Pip's First Day at Welcome Town School",
    pages: [
      { img: bgDoor, text: "It is Pip's first day at school. Pip feels a little shy." },
      { who: 'pip', img: bgDoor, text: 'Pip meets the teacher. "Hello! My name is Pip."' },
      { who: 'marigold', img: bgCircle, text: '"Hello, Pip! Welcome to our class!"' },
      { img: bgWide, text: 'Now Pip is not shy anymore. Pip has new friends! ✨' },
    ],
    checkpoints: [
      { afterPage: 0, who: 'pip', question: 'How does Pip feel at first?', options: ['Happy', 'Shy', 'Angry'], answer: 'Shy' },
      { afterPage: 2, who: 'marigold', question: 'Who welcomes Pip to the class?', options: ['Miss Marigold', 'Mia', 'Bella'], answer: 'Miss Marigold' },
    ],
  },

  /* =========================== Part 2: Reading Review =========================
   * A1 per reading-engine's own progression table assumes Pre-A1's letter-
   * sound discovery is already done — this is framed as REVIEW-through-
   * reading ("remember this sound? now read it in a word"), not first-time
   * discovery, and spends more of its time on actual decoding (two real
   * words: SAT and AT) than on re-teaching individual sounds. See
   * .agents/skills/reading-engine/SKILL.md. */

  {
    // A natural pause point for a young A1 learner — the lesson runs
    // ~28-32 minutes end to end with no other seam this clean to split on.
    // Reuses the title-card scene kind (title + subtitle + CTA over a full-
    // bleed bg) rather than a new scene kind, since a break screen is
    // structurally identical to a section title — just break-themed copy.
    id: 'wt-break', kind: 'title-card', bg: bgWide, level: 'A1', unit: 'Unit 1', lessonLabel: 'Break Time', title: 'Great Job!', subtitle: 'Stretch, get some water, then come back for Part 2!', cta: '\u{1F938} I’m Ready!',
  },

  { id: 'wt-part2-title', kind: 'title-card', bg: bgReading, level: 'A1', unit: 'Unit 1', lessonLabel: 'Part 2', title: 'Reading Time!', subtitle: 'Remember your sounds — then read two real words', cta: '\u{1F4D6} LET’S READ!' },

  {
    id: 'wt-model-s', kind: 'sound-model', bg: bgReading, who: 'marigold', letter: 'S', phoneme: '/s/', sound: 'sss',
    teacher: "Remember this sound? /s/ /s/ Snake!",
    anchors: [
      { word: 'sun', emoji: '\u{2600}️' },
      { word: 'sock', emoji: '\u{1F9E6}' },
      { word: 'snake', emoji: '\u{1F40D}' },
    ],
  },
  { id: 'wt-trace-s', kind: 'trace', bg: bgReading, who: 'marigold', letter: 'S', phoneme: '/s/', word: 'sun', teacher: 'Trace the letter S! Say /s/ /s/ /s/ as you draw.' },

  {
    id: 'wt-model-a', kind: 'sound-model', bg: bgReading, who: 'pip', letter: 'A', phoneme: '/æ/', sound: 'aaa',
    teacher: "Remember this sound? /a/ /a/ Apple!",
    anchors: [
      { word: 'apple', emoji: '\u{1F34E}' },
      { word: 'ant', emoji: '\u{1F41C}' },
      { word: 'alligator', emoji: '\u{1F40A}' },
    ],
  },
  { id: 'wt-trace-a', kind: 'trace', bg: bgReading, who: 'pip', letter: 'A', phoneme: '/æ/', word: 'apple', teacher: 'Trace the letter A! Say /a/ /a/ /a/ as you draw.' },

  {
    id: 'wt-model-t', kind: 'sound-model', bg: bgReading, who: 'marigold', letter: 'T', phoneme: '/t/', sound: 'tuh',
    teacher: "Remember this sound? /t/ /t/ Top!",
    anchors: [
      { word: 'top', emoji: '\u{1F3A9}' },
      { word: 'ten', emoji: '\u{1F51F}' },
      { word: 'tiger', emoji: '\u{1F42F}' },
    ],
  },
  { id: 'wt-trace-t', kind: 'trace', bg: bgReading, who: 'marigold', letter: 'T', phoneme: '/t/', word: 'top', teacher: 'Trace the letter T! Say /t/ /t/ /t/ as you draw.' },

  {
    id: 'wt-word-build-sat', kind: 'word-build', bg: bgReading, teacher: 'You know all 3 sounds! Now read two real words: SAT and AT!',
    rounds: [
      { word: 'SAT', blankIndex: 0, answer: 'S', choices: ['S', 'M', 'B'], emoji: '\u{1FA91}' },
      { word: 'SAT', blankIndex: 2, answer: 'T', choices: ['T', 'P', 'N'], emoji: '\u{1FA91}' },
      { word: 'AT', blankIndex: 0, answer: 'A', choices: ['A', 'I', 'O'], emoji: '\u{1F4CD}' },
    ],
  },

  /* ===================== End-of-lesson review games =====================
   * Three retrieval-practice mini-games reviewing this lesson's own S/A/T
   * sounds and classmates — no new vocabulary, per playground-curriculum-
   * engine's spiral-review principle (this is consolidation, not a new
   * teaching beat), right before the finale. */

  {
    id: 'wt-letter-hunt', kind: 'letter-game', bg: bgReading, who: 'pip', mode: 'name',
    teacher: 'Alphabet game! Find the letter I say.',
    rounds: [
      { letter: 'S', choices: ['S', 'H', 'E'] },
      { letter: 'A', choices: ['A', 'O', 'U'] },
      { letter: 'T', choices: ['T', 'L', 'F'] },
    ],
  },
  {
    id: 'wt-sound-hunt', kind: 'letter-game', bg: bgReading, who: 'marigold', mode: 'sound',
    teacher: 'Sound game! Listen, then tap the letter that makes that sound.',
    rounds: [
      { letter: 'S', phoneme: '/s/', choices: ['S', 'M', 'B'] },
      { letter: 'A', phoneme: '/æ/', choices: ['A', 'I', 'O'] },
      { letter: 'T', phoneme: '/t/', choices: ['T', 'D', 'P'] },
    ],
  },
  {
    id: 'wt-class-puzzle', kind: 'jigsaw-puzzle', bg: bgWide, teacher: 'Puzzle game! Drag the pieces to put the class picture back together!',
    image: bgWide, rows: 2, cols: 3,
  },

  {
    // Moved to the very end of the lesson (was right after the storybook,
    // mid-Part-1) — "goodbye" now plays as the actual closing beat, right
    // before the finale screen, instead of a mid-lesson song ahead of Part
    // 2's phonics content.
    id: 'wt-goodbye-song', kind: 'song', bg: bgExpressGoodbye, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3`,
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },

  { id: 'wt-finale', kind: 'finale', bg: bgWide, who: 'pip', line: 'You said hello, met your new class, and read two real words — SAT and AT! ✨\u{1F3C6}' },
];

/* =============================================================================
 * A1 Unit 1, Lesson 2: "How Are You?"
 *
 * Same "Greetings & Introductions" unit as Lesson 1 (per this project's own
 * seeded curriculum roadmap) — spiral review of hello/name/age (~20% of
 * runtime, via a quick recall beat, not a re-teach) plus the unit's next new
 * beat: "How are you?" and feelings vocabulary (happy/sad/tired/angry).
 * This exact "Hello" → "How are you?" sequencing is already validated by
 * this project's own Pre-A1 roadmap (Unit 1 Lesson 3 is literally titled
 * "How Are You?") — A1 covers the same real-world beat a tier higher: full
 * question-and-answer practice, not just isolated vocabulary.
 *
 * Part 2 continues the phonics-through-reading progression from S/A/T to
 * P/I/N — the next three letters in the classic synthetic-phonics "satpin"
 * order, chosen because it's the smallest extension that unlocks a real
 * batch of new decodable words (sit, pin, tip, tap, nap, sat) while reusing
 * every sound already taught. The word-build payoff is reading "PIP" — the
 * lesson's own mascot's name — as a deliberate, delightful capstone in the
 * same spirit as Lesson 1's "SAT"/"AT".
 * ========================================================================= */

export const LESSON_2_TITLE = 'How Are You?';
export const LESSON_2_OBJECTIVE = 'Part 1: Ask and answer "How are you?" and name a feeling (happy, sad, tired, angry). Part 2: Learn the sounds P, I, N and read three more real words.';

export const LESSON_2_SCENES: Scene[] = [
  { id: 'wt2-title', kind: 'title-card', bg: bgWide, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 2', title: 'How Are You?', subtitle: 'Say hello, then share how you feel today', cta: '\u{1F392} LET’S GO!' },

  {
    id: 'wt2-intro', kind: 'cinematic', bg: bgCircle, title: 'Back to Welcome Town School', subtitle: 'A quick hello before today’s lesson', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome back, class! Let’s remember what we learned.' },
      { who: 'pip', line: 'Hello! My name is Pip. I am 7 years old!' },
      { who: 'marigold', line: 'Great job! Today we learn something new.' },
    ],
    cta: '\u{1F392} LET’S GO!',
  },

  {
    id: 'wt2-howareyou', kind: 'meet', bg: bgCircle, who: 'marigold',
    teacher: 'Tap Miss Marigold to hear a new question!',
    line: 'How are you today? I am fine, thank you!', repeat: 'I am fine, thank you!',
  },

  {
    // A dedicated scene purpose-built for this hotspot quartet — four
    // classmates each visibly showing one feeling through pose and
    // expression alone, evenly spaced, per visual-learning-engine's own
    // rule that a vocab-spot scene needs its target words large, clean,
    // and unambiguous rather than borrowed from an unrelated narrative
    // scene.
    id: 'wt2-vocab-feelings', kind: 'vocab-spot', bg: bgFeelings,
    teacher: 'Look at each friend! Tap the arrow to learn how they feel.',
    items: [
      { label: 'Happy', sentence: 'Pip is happy.', emoji: '\u{1F60A}', left: '17%', top: '55%', color: '#FE6A2F', who: 'pip' },
      { label: 'Sad', sentence: 'Mia is sad.', emoji: '\u{1F622}', left: '40%', top: '62%', color: '#B85CD1', who: 'mia' },
      { label: 'Tired', sentence: 'Leo is tired.', emoji: '\u{1F62A}', left: '63%', top: '58%', color: '#C97A2F' },
      { label: 'Angry', sentence: 'Bella is angry.', emoji: '\u{1F620}', left: '86%', top: '55%', color: '#E76FA5' },
    ],
  },

  {
    // Practice step right after discovery — target coordinates match
    // wt2-vocab-feelings' own hotspots one-for-one, same as Lesson 1's
    // drag-match scenes.
    id: 'wt2-drag-feelings', kind: 'drag-match', bg: bgFeelings, teacher: 'Listen, then drag each word onto the friend who feels that way!',
    items: [
      { label: 'Happy', color: '#FE6A2F', who: 'pip', targetLeft: '17%', targetTop: '55%' },
      { label: 'Sad', color: '#B85CD1', who: 'mia', targetLeft: '40%', targetTop: '62%' },
      { label: 'Tired', color: '#C97A2F', targetLeft: '63%', targetTop: '58%' },
      { label: 'Angry', color: '#E76FA5', targetLeft: '86%', targetTop: '55%' },
    ],
  },

  {
    id: 'wt2-roleplay', kind: 'roleplay', bg: bgCircle, teacher: 'Story time! Listen to Pip and Miss Marigold, then repeat each line.', cast: ['pip', 'marigold'],
    script: [
      { who: 'marigold', line: 'How are you today, Pip?', repeat: true },
      { who: 'pip', line: 'I am happy! How are you?', repeat: true },
      { who: 'marigold', line: 'I am fine, thank you!', repeat: true },
    ],
  },

  {
    id: 'wt2-join-stage', kind: 'join-stage', bg: bgCircle, teacher: 'Your turn! When it says YOU, say how you feel out loud!', cast: ['pip', 'marigold', 'leo'],
    turns: [
      { who: 'marigold', line: 'How are you today?' },
      { who: 'student', line: 'I am ______.' },
      { who: 'pip', line: 'Thanks for sharing!' },
      { who: 'leo', line: 'I am happy you are here!' },
    ],
  },

  {
    id: 'wt2-choice', kind: 'choice', bg: bgFeelings, who: 'pip', teacher: 'Listen carefully, then tap the right answer!',
    prompt: 'Which word means HAPPY?',
    options: [
      { label: 'Happy', emoji: '\u{1F60A}', correct: true },
      { label: 'Sad', emoji: '\u{1F622}' },
      { label: 'Tired', emoji: '\u{1F62A}' },
    ],
  },

  {
    id: 'wt2-storybook', kind: 'flipbook', bg: bgWide, title: "Pip's Tired Day",
    pages: [
      { who: 'pip', img: bgFeelings, text: 'Pip feels tired today. "I am so tired!"' },
      { who: 'mia', img: bgCircle, text: 'Mia asks, "Are you okay, Pip?"' },
      { who: 'pip', img: bgCircle, text: 'Pip rests, then plays with his friends.' },
      { img: bgWide, text: 'Now Pip feels happy again! ✨' },
    ],
    checkpoints: [
      { afterPage: 0, who: 'pip', question: 'How does Pip feel at first?', options: ['Happy', 'Tired', 'Angry'], answer: 'Tired' },
      { afterPage: 2, who: 'mia', question: 'How does Pip feel at the end?', options: ['Sad', 'Happy', 'Tired'], answer: 'Happy' },
    ],
  },

  {
    // A natural pause point, same as Lesson 1 — the Part 1/Part 2 seam.
    id: 'wt2-break', kind: 'title-card', bg: bgWide, level: 'A1', unit: 'Unit 1', lessonLabel: 'Break Time', title: 'Great Job!', subtitle: 'Stretch, get some water, then come back for Part 2!', cta: '\u{1F938} I’m Ready!',
  },

  /* =========================== Part 2: Reading Review =========================
   * Continues straight from Lesson 1's S/A/T — reviews nothing from scratch,
   * per reading-engine's own progression table for A1 (review-through-
   * reading, not first-time letter discovery). */

  { id: 'wt2-part2-title', kind: 'title-card', bg: bgReading, level: 'A1', unit: 'Unit 1', lessonLabel: 'Part 2', title: 'Reading Time!', subtitle: 'You know S, A, T — now learn P, I, N!', cta: '\u{1F4D6} LET’S READ!' },

  {
    id: 'wt2-model-p', kind: 'sound-model', bg: bgReading, who: 'pip', letter: 'P', phoneme: '/p/', sound: 'puh',
    teacher: 'A brand-new sound! /p/ /p/ Pig!',
    anchors: [
      { word: 'pig', emoji: '\u{1F437}' },
      { word: 'pen', emoji: '\u{1F58A}\u{FE0F}' },
      { word: 'pan', emoji: '\u{1F373}' },
    ],
  },
  { id: 'wt2-trace-p', kind: 'trace', bg: bgReading, who: 'pip', letter: 'P', phoneme: '/p/', word: 'pig', teacher: 'Trace the letter P! Say /p/ /p/ /p/ as you draw.' },

  {
    id: 'wt2-model-i', kind: 'sound-model', bg: bgReading, who: 'marigold', letter: 'I', phoneme: '/\u{026A}/', sound: 'ih',
    teacher: 'A brand-new sound! /i/ /i/ Ink!',
    anchors: [
      { word: 'ink', emoji: '\u{1F58B}\u{FE0F}' },
      { word: 'igloo', emoji: '\u{1F9CA}' },
      { word: 'insect', emoji: '\u{1F41B}' },
    ],
  },
  { id: 'wt2-trace-i', kind: 'trace', bg: bgReading, who: 'marigold', letter: 'I', phoneme: '/\u{026A}/', word: 'ink', teacher: 'Trace the letter I! Say /i/ /i/ /i/ as you draw.' },

  {
    id: 'wt2-model-n', kind: 'sound-model', bg: bgReading, who: 'pip', letter: 'N', phoneme: '/n/', sound: 'nnn',
    teacher: 'A brand-new sound! /n/ /n/ Nut!',
    anchors: [
      { word: 'nut', emoji: '\u{1F95C}' },
      { word: 'net', emoji: '\u{1F945}' },
      { word: 'nose', emoji: '\u{1F443}' },
    ],
  },
  { id: 'wt2-trace-n', kind: 'trace', bg: bgReading, who: 'pip', letter: 'N', phoneme: '/n/', word: 'nut', teacher: 'Trace the letter N! Say /n/ /n/ /n/ as you draw.' },

  {
    id: 'wt2-word-build', kind: 'word-build', bg: bgReading, teacher: 'You know 6 sounds now! Read three more real words!',
    rounds: [
      { word: 'SIT', blankIndex: 1, answer: 'I', choices: ['I', 'O', 'U'], emoji: '\u{1FA91}' },
      { word: 'PIN', blankIndex: 0, answer: 'P', choices: ['P', 'B', 'D'], emoji: '\u{1F4CC}' },
      { word: 'PIP', blankIndex: 2, answer: 'P', choices: ['P', 'B', 'D'], emoji: '\u{1F98A}' },
    ],
  },

  {
    id: 'wt2-letter-hunt', kind: 'letter-game', bg: bgReading, who: 'marigold', mode: 'name',
    teacher: 'Alphabet game! Find the letter I say.',
    rounds: [
      { letter: 'P', choices: ['P', 'B', 'D'] },
      { letter: 'I', choices: ['I', 'L', 'U'] },
      { letter: 'N', choices: ['N', 'M', 'H'] },
    ],
  },
  {
    id: 'wt2-class-puzzle', kind: 'jigsaw-puzzle', bg: bgFeelings, teacher: 'Puzzle game! Drag the pieces to put the picture back together!',
    image: bgFeelings, rows: 2, cols: 3,
  },

  {
    id: 'wt2-goodbye-song', kind: 'song', bg: bgExpressGoodbye, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3`,
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },

  { id: 'wt2-finale', kind: 'finale', bg: bgWide, who: 'pip', line: 'You said how you feel, and read three more real words — SIT, PIN, and PIP! ✨\u{1F3C6}' },
];
