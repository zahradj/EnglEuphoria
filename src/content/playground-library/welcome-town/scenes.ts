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
 *     time, a colors corner, a reading nook, cubby doors) for visual variety
 *     per the art style contract's "characters painted into the background,
 *     never a pasted cut-out" rule.
 *   - Story: Pip (same fox from the Pre-A1 curriculum — same name, voice,
 *     color) is the new student; Miss Marigold is the teacher; Mia, Bella,
 *     Willow, and Leo (also carried forward from Pre-A1) are the established
 *     classmates who welcome him as an ensemble — visible throughout and
 *     given a couple of spoken cameo lines (roleplay, join-stage,
 *     hello-doors), without each needing a dedicated full "meet" sequence,
 *     per the pacing budget below.
 *   - Two parts in one lesson: Part 1 (greetings, self-intro, colors) and
 *     Part 2 (phonics S/A/T + first CVC word, SAT).
 *
 * Pacing check against the skill's own §12 budget (title+cinematic ~1.5min;
 * "say it out loud" reps meet/echo/roleplay/join-stage budgeted 3-5 across
 * a lesson — this lesson covers more ground than a single-strand Pre-A1
 * lesson so runs slightly over that at 6, deliberately, since two of the
 * original meet+echo pairs were collapsed into one meet each — the meet
 * scene's own hold-to-repeat step already IS the repeat practice, so a
 * separate echo scene right after teaching the identical line is redundant
 * repetition, not extra learning; 1-3min per mini-game; 2-4min per new
 * letter's sound-model+trace pair): estimated total ≈ 30-33 minutes.
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
  marigold: { name: 'Miss Marigold', emoji: '\u{1F34E}', color: '#8ECAE6' },
  mia: { name: 'Mia', emoji: '\u{1F42D}', color: '#B85CD1' },
  bella: { name: 'Bella', emoji: '\u{1F430}', color: '#E76FA5' },
  willow: { name: 'Willow', emoji: '\u{1F426}', color: '#4FA9E0' },
  leo: { name: 'Leo', emoji: '\u{1F981}', color: '#C97A2F' },
};

const bgWide = `${W}/scenes/bg-classroom-wide.png`;
const bgDoor = `${W}/scenes/bg-classroom-door.png`;
const bgCircle = `${W}/scenes/bg-classroom-circle.png`;
const bgColors = `${W}/scenes/bg-classroom-colors.png`;
const bgCubbies = `${W}/scenes/bg-cubbies.png`;
const bgReading = `${W}/scenes/bg-classroom-reading.png`;

export type Scene =
  | { id: string; kind: 'title-card'; bg: string; level: string; unit: string; lessonLabel: string; title: string; subtitle: string; cta?: string }
  | { id: string; kind: 'cinematic'; bg: string; title: string; subtitle: string; narrator: CharKey; script: { who: CharKey; line: string }[]; cta: string }
  | { id: string; kind: 'meet'; bg: string; who: CharKey; teacher: string; line: string; repeat: string }
  | { id: string; kind: 'echo'; bg: string; who: CharKey; teacher: string; word: string }
  | { id: string; kind: 'memory'; bg: string; teacher: string; pairs: { id: string; label: string; emoji: string }[] }
  | { id: string; kind: 'choice'; bg: string; who: CharKey; teacher: string; prompt: string; options: { label: string; emoji: string; correct?: boolean }[] }
  | { id: string; kind: 'roleplay'; bg: string; teacher: string; cast: CharKey[]; script: { who: CharKey; line: string; repeat?: boolean }[] }
  | { id: string; kind: 'join-stage'; bg: string; teacher: string; cast: CharKey[]; turns: { who: CharKey | 'student'; line: string }[] }
  | { id: string; kind: 'hello-doors'; bg: string; teacher: string; cast: CharKey[]; rounds: { target: CharKey; prompt: string; helloLine: string; echoLine: string }[] }
  | { id: string; kind: 'flipbook'; bg: string; title: string; pages: { who?: CharKey; img: string; text: string }[]; checkpoints: { afterPage: number; who: CharKey; question: string; options: string[]; answer: string }[] }
  | { id: string; kind: 'song'; bg: string; title: string; teacher: string; songUrl?: string; durationSeconds?: number; bigWord?: string; lyrics: { who: CharKey; text: string }[] }
  | { id: string; kind: 'sound-model'; bg: string; who: CharKey; letter: string; phoneme: string; sound: string; teacher: string; anchors: { word: string; emoji: string; img?: string }[] }
  | { id: string; kind: 'trace'; bg: string; who: CharKey; letter: string; phoneme: string; word: string; teacher: string }
  | { id: string; kind: 'word-build'; bg: string; teacher: string; rounds: { word: string; blankIndex: number; answer: string; choices: string[]; img?: string; emoji: string }[] }
  | { id: string; kind: 'finale'; bg: string; who: CharKey; line: string };

export const LESSON_1_TITLE = 'Hello, Class!';
export const LESSON_1_OBJECTIVE = "Part 1: Greet your new class and share your name (\"Hello! My name is ___.\"), plus 3 colors. Part 2: Learn the sounds S, A, T and read your first word.";

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

  { id: 'wt-meet-marigold', kind: 'meet', bg: bgDoor, who: 'marigold', teacher: 'Tap Miss Marigold to hear her say hello!', line: 'Hello! I am Miss Marigold, your teacher. Welcome to our class!', repeat: 'Hello!' },
  { id: 'wt-meet-pip', kind: 'meet', bg: bgDoor, who: 'pip', teacher: 'Here comes Pip! Tap him to say hi.', line: 'Hi! My name is Pip. I am new here!', repeat: 'My name is Pip.' },

  {
    id: 'wt-vocab-friend-teacher', kind: 'meet', bg: bgCircle, who: 'marigold',
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
    id: 'wt-colors-balloons', kind: 'meet', bg: bgColors, who: 'marigold',
    teacher: 'Look up! Tap Miss Marigold to name the balloon colors.',
    line: 'Look at the balloons! Red, blue, and yellow!', repeat: 'Red, blue, yellow!',
  },
  {
    id: 'wt-choice-red', kind: 'choice', bg: bgColors, who: 'marigold', teacher: 'Which balloon is RED?',
    prompt: 'Tap the RED balloon!',
    options: [
      { label: 'Red', emoji: '\u{1F534}', correct: true },
      { label: 'Blue', emoji: '\u{1F535}' },
      { label: 'Yellow', emoji: '\u{1F7E1}' },
    ],
  },

  {
    id: 'wt-roleplay', kind: 'roleplay', bg: bgCircle, teacher: 'Story time! Listen to Pip and Miss Marigold, then repeat each line.', cast: ['pip', 'marigold', 'mia'],
    script: [
      { who: 'marigold', line: 'Hello! My name is Miss Marigold.', repeat: true },
      { who: 'pip', line: 'Hello! My name is Pip.', repeat: true },
      { who: 'marigold', line: 'Nice to meet you, Pip!', repeat: true },
      { who: 'pip', line: 'Nice to meet you too!', repeat: true },
      { who: 'mia', line: 'Welcome to our class, Pip!' },
    ],
  },

  {
    id: 'wt-join-stage', kind: 'join-stage', bg: bgCircle, teacher: 'Your turn! When it says YOU, say your own name out loud!', cast: ['pip', 'marigold', 'leo'],
    turns: [
      { who: 'marigold', line: 'Hello! What is your name?' },
      { who: 'student', line: 'Hello! My name is ______.' },
      { who: 'pip', line: 'Nice to meet you! Welcome to our class!' },
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

  {
    id: 'wt-goodbye-song', kind: 'song', bg: bgWide, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3`,
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },

  /* =========================== Part 2: Phonics + CVC =========================
   * The classic S-A-T starting trio — with just these three sounds, one real
   * decodable CVC word already exists (SAT), so the very first phonics
   * lesson can end with an actual reading win, not just isolated sounds. */

  { id: 'wt-part2-title', kind: 'title-card', bg: bgReading, level: 'A1', unit: 'Unit 1', lessonLabel: 'Part 2', title: 'Reading Time!', subtitle: 'Learn new sounds and read your first word', cta: '\u{1F4D6} LET’S READ!' },

  {
    id: 'wt-model-s', kind: 'sound-model', bg: bgReading, who: 'marigold', letter: 'S', phoneme: '/s/', sound: 'sss',
    teacher: "Listen to Miss Marigold's sound. /s/ /s/ Snake!",
    anchors: [
      { word: 'sun', emoji: '\u{2600}️' },
      { word: 'sock', emoji: '\u{1F9E6}' },
      { word: 'snake', emoji: '\u{1F40D}' },
    ],
  },
  { id: 'wt-trace-s', kind: 'trace', bg: bgReading, who: 'marigold', letter: 'S', phoneme: '/s/', word: 'sun', teacher: 'Trace the letter S! Say /s/ /s/ /s/ as you draw.' },

  {
    id: 'wt-model-a', kind: 'sound-model', bg: bgReading, who: 'pip', letter: 'A', phoneme: '/æ/', sound: 'aaa',
    teacher: "Listen to Pip's sound. /a/ /a/ Apple!",
    anchors: [
      { word: 'apple', emoji: '\u{1F34E}' },
      { word: 'ant', emoji: '\u{1F41C}' },
      { word: 'alligator', emoji: '\u{1F40A}' },
    ],
  },
  { id: 'wt-trace-a', kind: 'trace', bg: bgReading, who: 'pip', letter: 'A', phoneme: '/æ/', word: 'apple', teacher: 'Trace the letter A! Say /a/ /a/ /a/ as you draw.' },

  {
    id: 'wt-model-t', kind: 'sound-model', bg: bgReading, who: 'marigold', letter: 'T', phoneme: '/t/', sound: 'tuh',
    teacher: "Listen to Miss Marigold's sound. /t/ /t/ Top!",
    anchors: [
      { word: 'top', emoji: '\u{1F3A9}' },
      { word: 'ten', emoji: '\u{1F51F}' },
      { word: 'tiger', emoji: '\u{1F42F}' },
    ],
  },
  { id: 'wt-trace-t', kind: 'trace', bg: bgReading, who: 'marigold', letter: 'T', phoneme: '/t/', word: 'top', teacher: 'Trace the letter T! Say /t/ /t/ /t/ as you draw.' },

  {
    id: 'wt-word-build-sat', kind: 'word-build', bg: bgReading, teacher: 'You know all 3 sounds! Now read your first word: S-A-T, SAT!',
    rounds: [
      { word: 'SAT', blankIndex: 0, answer: 'S', choices: ['S', 'M', 'B'], emoji: '\u{1FA91}' },
      { word: 'SAT', blankIndex: 2, answer: 'T', choices: ['T', 'P', 'N'], emoji: '\u{1FA91}' },
    ],
  },

  { id: 'wt-finale', kind: 'finale', bg: bgWide, who: 'pip', line: 'You said hello, met your new class, learned S, A, T — and read the word SAT! ✨\u{1F3C6}' },
];
