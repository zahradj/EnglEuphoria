/* =============================================================================
 * Welcome Town — A1 Unit 1 Lesson 1: "Hello, Class!"
 *
 * This is the Playground Hub's first A1-tier lesson (distinct from the
 * existing Pre-A1 "Little Explorers Phonics" curriculum in
 * ../unit1/scenes.ts — that content is explicitly Pre-A1 per its own
 * title-card `level` field and the playground-library-lesson-builder
 * skill's canonical curriculum map; A1 is the next tier up).
 *
 * Content grounded in the app's own already-wired A1 curriculum plan rather
 * than invented from scratch (src/curriculum/roadmap/a1Roadmap.ts bucket 0
 * "Hello, Class!": greetings/introductions/classroom/colors vocab; grammar
 * "be" affirmative; goal "Greet someone and say my name") plus a deliberate
 * extension past that bucket's original scope, per direct instruction: the
 * lesson is split into two parts —
 *   Part 1 (Vocabulary): greetings, self-introduction, colors — the
 *     original scope, told through a new Welcome Town story.
 *   Part 2 (Phonics + CVC reading): the three sounds S, A, T (the classic
 *     first phonics trio — with them alone a real, decodable CVC word
 *     exists: SAT), taught via the same sound-model/trace mechanics as the
 *     Pre-A1 curriculum, then blended into reading practice.
 *
 * Cast: Pip is the SAME character students already know from the Pre-A1
 * lessons (../unit1/scenes.ts) — same name, same voice key ('pip' in
 * audio.ts), same color (#FE6A2F) — carried forward into A1 rather than
 * replaced by a new lookalike, so the character is a throughline across
 * tiers. Mayor Marigold is new to this tier, voiced through the existing
 * generic 'teacher' key (she plays that role, so no new audio.ts key is
 * needed — the voice pipeline is keyed by role/name, not by visual design).
 *
 * Art: every character image here is a transparent-background sticker
 * cutout (`*-sticker.png`) — safe to float over ANY background without a
 * visible box. For the two "conversation" scenes where both characters
 * talk face to face (roleplay, join-stage), the art style contract's own
 * rule applies instead: characters are painted directly into the
 * background art, standing on the ground with real contact shadows, not
 * layered cutouts — see `bg-together.png`.
 *
 * New cast (Pip + Mayor Marigold together) needed its own module rather
 * than folding into unit1/scenes.ts: SceneRenderer.tsx there imports CAST/
 * PROP_THEME/etc. directly from that module, coupling every scene kind to
 * the Pre-A1 fox-and-friends roster specifically, not to "Unit 1" as a
 * concept — see that skill's §6.
 * ========================================================================= */

const W = '/welcome-town';

export type CharKey = 'pip' | 'marigold';
/** Which existing audio.ts voice each of this world's characters speaks
 * through — reusing established voices rather than adding new ones. */
export const VOICE_KEY: Record<CharKey, 'pip' | 'teacher'> = {
  pip: 'pip',
  marigold: 'teacher',
};

export const CAST: Record<CharKey, { name: string; img: string; emoji: string; color: string }> = {
  // Same character, same voice, same color as the Pre-A1 Pip in
  // ../unit1/scenes.ts — only the portrait is a fresh transparent sticker
  // cutout (the Pre-A1 asset has a baked-in playground background, fine for
  // its own framed-card uses there but wrong for floating over other art).
  pip: { name: 'Pip', img: `${W}/characters/pip-sticker.png`, emoji: '\u{1F98A}', color: '#FE6A2F' },
  marigold: { name: 'Mayor Marigold', img: `${W}/characters/marigold-sticker.png`, emoji: '\u{1F3E1}', color: '#8ECAE6' },
};

const bgTitle = `${W}/scenes/bg-title.png`;
const bgStreet = `${W}/scenes/bg-street.png`;
const bgSchoolhouse = `${W}/scenes/bg-schoolhouse.png`;
const bgBalloons = `${W}/scenes/bg-balloons.png`;
const bgDoors = `${W}/scenes/bg-doors.png`;
/** Pip and Mayor Marigold painted directly into the Welcome Town street,
 * both feet-on-the-ground — used only for the two face-to-face
 * "conversation" scenes (roleplay, join-stage), per the art style
 * contract's "never a pasted cut-out" rule for scenes where characters
 * talk to each other in place. */
const bgTogether = `${W}/scenes/bg-together.png`;

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
export const LESSON_1_OBJECTIVE = "Part 1: Greet a new friend and share your name (\"Hello! My name is ___.\"). Part 2: Learn the sounds S, A, T and read your first word.";

export const LESSON_1_SCENES: Scene[] = [
  { id: 'wt-title', kind: 'title-card', bg: bgTitle, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 1', title: 'Welcome Town: Hello, Class!', subtitle: 'Say hello, share your name, and read your first word' },

  {
    id: 'wt-intro', kind: 'cinematic', bg: bgTitle, title: 'Welcome Town', subtitle: 'A brand-new town, full of brand-new friends', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome, everyone! Today is a very special day.' },
      { who: 'marigold', line: 'A new friend just arrived in Welcome Town. Let’s go say hello!' },
    ],
    cta: '\u{1F3AE} LET’S GO!',
  },

  { id: 'wt-meet-marigold', kind: 'meet', bg: bgTitle, who: 'marigold', teacher: 'Tap Mayor Marigold to hear her say hello!', line: 'Hello! I am Mayor Marigold. Welcome to our town!', repeat: 'Hello!' },
  { id: 'wt-echo-hello', kind: 'echo', bg: bgTitle, who: 'marigold', teacher: 'Repeat after Mayor Marigold: Hello! Hello! Hello!', word: 'Hello!' },

  { id: 'wt-meet-pip', kind: 'meet', bg: bgStreet, who: 'pip', teacher: 'A familiar friend runs over. Tap Pip to say hi!', line: 'Hi! My name is Pip.', repeat: 'My name is Pip.' },
  { id: 'wt-echo-name', kind: 'echo', bg: bgStreet, who: 'pip', teacher: 'Repeat after Pip: My name is Pip.', word: 'My name is Pip.' },

  {
    id: 'wt-vocab-friend', kind: 'meet', bg: bgStreet, who: 'marigold',
    teacher: 'Tap Mayor Marigold to learn a new word: friend!',
    line: 'Pip is my friend! Do you want to be my friend too?', repeat: 'My friend!',
  },
  {
    id: 'wt-vocab-teacher', kind: 'meet', bg: bgSchoolhouse, who: 'marigold',
    teacher: 'Tap Mayor Marigold to learn a new word: teacher!',
    line: 'I am your teacher today. Hello, class!', repeat: 'Hello, teacher!',
  },

  {
    id: 'wt-memory-words', kind: 'memory', bg: bgStreet, teacher: 'Match the matching pairs! Hello, goodbye, name, friend, teacher.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '\u{1F44B}' },
      { id: 'goodbye', label: 'Goodbye', emoji: '\u{1F44B}' },
      { id: 'name', label: 'Name', emoji: '\u{1F3F7}️' },
      { id: 'friend', label: 'Friend', emoji: '\u{1F91D}' },
      { id: 'teacher', label: 'Teacher', emoji: '\u{1F469}‍\u{1F3EB}' },
    ],
  },

  {
    id: 'wt-choice-hello', kind: 'choice', bg: bgStreet, who: 'pip', teacher: 'Listen carefully, then tap the right answer!',
    prompt: 'Which word means HELLO?',
    options: [
      { label: 'Hello', emoji: '\u{1F44B}', correct: true },
      { label: 'Goodbye', emoji: '\u{1F44B}' },
      { label: 'Friend', emoji: '\u{1F91D}' },
    ],
  },

  {
    id: 'wt-colors-balloons', kind: 'meet', bg: bgBalloons, who: 'marigold',
    teacher: 'Look up! Tap Mayor Marigold to name the balloon colors.',
    line: 'Look at the balloons! Red, blue, and yellow!', repeat: 'Red, blue, yellow!',
  },
  {
    id: 'wt-choice-red', kind: 'choice', bg: bgBalloons, who: 'marigold', teacher: 'Which balloon is RED?',
    prompt: 'Tap the RED balloon!',
    options: [
      { label: 'Red', emoji: '\u{1F534}', correct: true },
      { label: 'Blue', emoji: '\u{1F535}' },
      { label: 'Yellow', emoji: '\u{1F7E1}' },
    ],
  },
  {
    id: 'wt-choice-blue', kind: 'choice', bg: bgBalloons, who: 'marigold', teacher: 'Which balloon is BLUE?',
    prompt: 'Tap the BLUE balloon!',
    options: [
      { label: 'Yellow', emoji: '\u{1F7E1}' },
      { label: 'Blue', emoji: '\u{1F535}', correct: true },
      { label: 'Red', emoji: '\u{1F534}' },
    ],
  },

  {
    id: 'wt-roleplay', kind: 'roleplay', bg: bgTogether, teacher: 'Story time! Listen to Pip and Mayor Marigold, then repeat each line.', cast: ['pip', 'marigold'],
    script: [
      { who: 'marigold', line: 'Hello! My name is Mayor Marigold.', repeat: true },
      { who: 'pip', line: 'Hello! My name is Pip.', repeat: true },
      { who: 'marigold', line: 'Nice to meet you, Pip!', repeat: true },
      { who: 'pip', line: 'Nice to meet you too!', repeat: true },
    ],
  },

  {
    id: 'wt-join-stage', kind: 'join-stage', bg: bgTogether, teacher: 'Your turn! When it says YOU, say your own name out loud!', cast: ['pip', 'marigold'],
    turns: [
      { who: 'marigold', line: 'Hello! What is your name?' },
      { who: 'student', line: 'Hello! My name is ______.' },
      { who: 'pip', line: 'Nice to meet you! Welcome to Welcome Town!' },
    ],
  },

  {
    id: 'wt-hello-doors', kind: 'hello-doors', bg: bgDoors, teacher: 'Knock knock! Tap the right door, then say hello to your new friend!', cast: ['pip', 'marigold'],
    rounds: [
      { target: 'pip', prompt: 'Knock knock! Where is Pip?', helloLine: 'Hi! My name is Pip.', echoLine: 'Hello, Pip!' },
      { target: 'marigold', prompt: 'Knock knock! Where is Mayor Marigold?', helloLine: 'Hello! I am Mayor Marigold.', echoLine: 'Hello, Mayor Marigold!' },
    ],
  },

  {
    id: 'wt-storybook', kind: 'flipbook', bg: bgTitle, title: "Pip's First Day in Welcome Town",
    pages: [
      { img: bgTitle, text: "It is Pip's first day in Welcome Town. Pip feels a little shy." },
      { who: 'pip', img: bgStreet, text: 'Pip sees a new friend. "Hello! My name is Pip."' },
      { who: 'marigold', img: bgStreet, text: '"Hello, Pip! My name is Mayor Marigold. Welcome to our town!"' },
      { who: 'pip', img: bgSchoolhouse, text: 'Now Pip is not shy anymore. Pip has a new friend!' },
      { img: bgTitle, text: 'Everyone in Welcome Town says hello! ✨' },
    ],
    checkpoints: [
      { afterPage: 1, who: 'pip', question: 'How does Pip feel at first?', options: ['Happy', 'Shy', 'Angry'], answer: 'Shy' },
      { afterPage: 3, who: 'marigold', question: "What is Pip's new friend's name?", options: ['Mayor Marigold', 'Mia', 'Bella'], answer: 'Mayor Marigold' },
    ],
  },

  { id: 'wt-vocab-goodbye', kind: 'meet', bg: bgSchoolhouse, who: 'marigold', teacher: 'Tap Mayor Marigold to learn a new word: goodbye!', line: 'It is time to go. Goodbye, class!', repeat: 'Goodbye!' },

  {
    id: 'wt-goodbye-song', kind: 'song', bg: bgSchoolhouse, title: '\u{1F3B5} Welcome Town Goodbye Song \u{1F3B5}', teacher: 'Wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3`,
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3E0} Welcome Town is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friend! See you soon!' },
    ],
  },

  /* =========================== Part 2: Phonics + CVC =========================
   * The classic S-A-T starting trio — with just these three sounds, one real
   * decodable CVC word already exists (SAT), so the very first phonics
   * lesson can end with an actual reading win, not just isolated sounds.
   * Kept inside Welcome Town (schoolhouse) rather than a generic backdrop,
   * per direct instruction to keep every scene grounded in the town. */

  { id: 'wt-part2-title', kind: 'title-card', bg: bgSchoolhouse, level: 'A1', unit: 'Unit 1', lessonLabel: 'Part 2', title: 'Reading Time!', subtitle: 'Learn new sounds and read your first word', cta: '\u{1F4D6} LET’S READ!' },

  {
    id: 'wt-model-s', kind: 'sound-model', bg: bgSchoolhouse, who: 'marigold', letter: 'S', phoneme: '/s/', sound: 'sss',
    teacher: "Listen to Mayor Marigold's sound. /s/ /s/ Snake!",
    anchors: [
      { word: 'sun', emoji: '\u{2600}\u{FE0F}' },
      { word: 'sock', emoji: '\u{1F9E6}' },
      { word: 'snake', emoji: '\u{1F40D}' },
    ],
  },
  { id: 'wt-trace-s', kind: 'trace', bg: bgSchoolhouse, who: 'marigold', letter: 'S', phoneme: '/s/', word: 'sun', teacher: 'Trace the letter S! Say /s/ /s/ /s/ as you draw.' },

  {
    id: 'wt-model-a', kind: 'sound-model', bg: bgSchoolhouse, who: 'pip', letter: 'A', phoneme: '/æ/', sound: 'aaa',
    teacher: "Listen to Pip's sound. /a/ /a/ Apple!",
    anchors: [
      { word: 'apple', emoji: '\u{1F34E}' },
      { word: 'ant', emoji: '\u{1F41C}' },
      { word: 'alligator', emoji: '\u{1F40A}' },
    ],
  },
  { id: 'wt-trace-a', kind: 'trace', bg: bgSchoolhouse, who: 'pip', letter: 'A', phoneme: '/æ/', word: 'apple', teacher: 'Trace the letter A! Say /a/ /a/ /a/ as you draw.' },

  {
    id: 'wt-model-t', kind: 'sound-model', bg: bgSchoolhouse, who: 'marigold', letter: 'T', phoneme: '/t/', sound: 'tuh',
    teacher: "Listen to Mayor Marigold's sound. /t/ /t/ Top!",
    anchors: [
      { word: 'top', emoji: '\u{1F3A9}' },
      { word: 'ten', emoji: '\u{1F51F}' },
      { word: 'tiger', emoji: '\u{1F42F}' },
    ],
  },
  { id: 'wt-trace-t', kind: 'trace', bg: bgSchoolhouse, who: 'marigold', letter: 'T', phoneme: '/t/', word: 'top', teacher: 'Trace the letter T! Say /t/ /t/ /t/ as you draw.' },

  {
    id: 'wt-word-build-sat', kind: 'word-build', bg: bgSchoolhouse, teacher: 'You know all 3 sounds! Now read your first word: S-A-T, SAT!',
    rounds: [
      { word: 'SAT', blankIndex: 0, answer: 'S', choices: ['S', 'M', 'B'], emoji: '\u{1FA91}' },
      { word: 'SAT', blankIndex: 2, answer: 'T', choices: ['T', 'P', 'N'], emoji: '\u{1FA91}' },
    ],
  },

  { id: 'wt-finale', kind: 'finale', bg: bgTitle, who: 'pip', line: 'You said hello, shared your name, learned S, A, T — and read the word SAT! ✨\u{1F3C6}' },
];
