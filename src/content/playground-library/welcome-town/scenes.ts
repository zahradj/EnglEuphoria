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
const bgReading = `${W}/scenes/bg-classroom-reading.png`;
const bgFixtures = `${W}/scenes/bg-classroom-fixtures.png`;
const bgPeople = `${W}/scenes/bg-classroom-people.png`;
const bgSupplies = `${W}/scenes/bg-classroom-supplies.png`;
const bgExpressHello = `${W}/scenes/bg-express-hello.png`;
const bgExpressGoodbye = `${W}/scenes/bg-express-goodbye.png`;
const bgExpressFriend = `${W}/scenes/bg-express-friend.png`;
const bgFeelings = `${W}/scenes/bg-classroom-feelings.png`;
const bgPrepIn = `${W}/scenes/bg-prep-in.png`;
const bgPrepOn = `${W}/scenes/bg-prep-on.png`;
const bgPrepNextTo = `${W}/scenes/bg-prep-next-to.png`;
const bgSupplies2 = `${W}/scenes/bg-classroom-supplies2.png`;
const bgPeers = `${W}/scenes/bg-classroom-peers.png`;

export type Scene =
  | { id: string; kind: 'title-card'; bg: string; level: string; unit: string; lessonLabel: string; title: string; subtitle: string; cta?: string }
  | { id: string; kind: 'cinematic'; bg: string; title: string; subtitle: string; narrator: CharKey; script: { who: CharKey; line: string }[]; cta: string }
  | { id: string; kind: 'meet'; bg: string; who: CharKey; teacher: string; line: string; repeat: string }
  | { id: string; kind: 'echo'; bg: string; who: CharKey; teacher: string; word: string }
  | { id: string; kind: 'memory'; bg: string; teacher: string; pairs: { id: string; label: string; emoji: string }[] }
  | { id: string; kind: 'drag-match'; bg: string; teacher: string; items: { label: string; color: string; targetLeft: string; targetTop: string; who?: CharKey }[]; showBlanks?: boolean; pointTo?: { who: CharKey; left: string; top: string; dir?: 'down' | 'left' | 'right' }[] }
  | { id: string; kind: 'vocab-spot'; bg: string; teacher: string; items: { label: string; sentence: string; emoji: string; left: string; top: string; color: string; dir?: 'down' | 'left' | 'right'; who?: CharKey }[] }
  | { id: string; kind: 'choice'; bg: string; who: CharKey; teacher: string; prompt: string; options: { label: string; emoji: string; correct?: boolean }[]; pointTo?: { who: CharKey; left: string; top: string; dir?: 'down' | 'left' | 'right' }[] }
  // Listen-and-tap-in-the-scene: unlike `vocab-spot` (one guided arrow at a
  // time, no wrong answer possible) every real object/character already
  // painted in `bg` is a live hotspot at once, so a spoken line genuinely
  // has to be matched against the right one — a recognition-based
  // listening check (research: ESL listening games for young learners
  // favor "tap the object in the picture" over a text-button menu, since
  // it tests the same comprehension without turning into a reading task).
  // `targets` are the fixed positions of every real thing on screen the
  // student can tap (reused verbatim from that same bg's own vocab-spot/
  // drag-match hotspot coordinates elsewhere in this file); each round in
  // `rounds` plays one spoken line and names which target answers it.
  | { id: string; kind: 'listen-tap'; bg: string; teacher: string; targets: { label: string; left: string; top: string; color: string }[]; rounds: { prompt: string; answerLabel: string; who?: CharKey }[] }
  // A spoken statement, judged True or False — a third, genuinely different
  // listening-check modality from `choice` (pick from 3 text buttons) and
  // `listen-tap` (tap a real object in the scene): a fast binary call, no
  // scene-hotspot dependency at all, so it can freely mix content from
  // different backgrounds/topics in one scene. Named explicitly in
  // smart-lesson-architect's own "Recognition / noticing" activity family
  // and grounded by dedicated research (see the scene using it below).
  | { id: string; kind: 'true-false'; bg: string; teacher: string; rounds: { who: CharKey; statement: string; isTrue: boolean }[] }
  // A vertical Never->Sometimes->Usually->Always scale (a real, established ESL
  // technique for frequency adverbs — students place/rate a habit's frequency
  // on a ladder rather than picking from a flat list) that a round's routine
  // action gets tapped onto. Distinct from `choice` (unordered options) because
  // the four answers have a real ordered relationship the visual should show.
  | { id: string; kind: 'frequency-ladder'; bg: string; who: CharKey; teacher: string; rounds: { action: string; emoji: string; answer: 'never' | 'sometimes' | 'usually' | 'always'; line: string }[] }
  // Drag-to-bin sort with THREE bins (He / She / They) — one or two
  // characters (a `who` pair for the group rounds) drop onto the pronoun
  // that describes them. Reuses the interaction pattern already proven in
  // unit1's he-she-sort (drag a character onto a labeled box), extended
  // with a third bin and pair support so "they" gets real practice instead
  // of only he/she.
  | { id: string; kind: 'pronoun-sort'; bg: string; teacher: string; rounds: { who: CharKey | [CharKey, CharKey]; img: string | [string, string]; emotion: string; answer: 'He' | 'She' | 'They' }[] }
  | { id: string; kind: 'roleplay'; bg: string; teacher: string; cast: CharKey[]; script: { who: CharKey; line: string; repeat?: boolean }[] }
  | { id: string; kind: 'join-stage'; bg: string; teacher: string; cast: CharKey[]; turns: { who: CharKey | 'student'; line: string }[] }
  | { id: string; kind: 'hello-doors'; bg: string; teacher: string; cast: CharKey[]; rounds: { target: CharKey; prompt: string; helloLine: string; echoLine: string }[] }
  | { id: string; kind: 'flipbook'; bg: string; title: string; pages: { who?: CharKey; img: string; text: string }[]; checkpoints: { afterPage: number; who: CharKey; question: string; options: string[]; answer: string }[] }
  | {
      id: string; kind: 'song'; bg: string; title: string; teacher: string; songUrl?: string; durationSeconds?: number; bigWord?: string; lyrics: { who: CharKey; text: string }[];
      /** Exact per-line duration (ms), same length as `lyrics`. See unit1/scenes.ts's
       * own `song` type for the full rationale — even-dividing the audio's total
       * duration by line count drifts out of sync with real sung pacing. Omit for
       * songs generated before this field existed. */
      lineDurationsMs?: number[];
    }
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
    // Per direct user report: "mixed up between the teacher and the
    // student" -- the label/who/emoji pairing was swapped relative to
    // where the two characters actually stand in bg-classroom-people.png
    // (Pip the fox is on the LEFT, Miss Marigold the owl is on the
    // RIGHT), so the "Teacher" hotspot sat on Pip and "Student" sat on
    // Marigold. left/top are unchanged (they correctly mark each
    // character's real position) -- only the word/emoji/color/who
    // attached to each position were fixed.
    id: 'wt-vocab-people', kind: 'vocab-spot', bg: bgPeople,
    teacher: 'Look around! Tap the arrow to learn a classroom word.',
    items: [
      { label: 'Student', sentence: 'This is the student.', emoji: '\u{1F98A}', left: '26%', top: '42%', color: '#FE6A2F', who: 'pip' },
      { label: 'Teacher', sentence: 'This is the teacher.', emoji: '\u{1F989}', left: '68%', top: '48%', color: '#8ECAE6', who: 'marigold' },
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
      { label: 'Student', color: '#FE6A2F', who: 'pip', targetLeft: '26%', targetTop: '42%' },
      { label: 'Teacher', color: '#8ECAE6', who: 'marigold', targetLeft: '68%', targetTop: '48%' },
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
    // Per direct user request: this page's vocabulary should be ONLY
    // "friend" -- dropped "teacher" (already its own word on wt-vocab-
    // people). The art (bg-express-friend.png) shows Mia and Bella
    // hugging with hearts -- no Miss Marigold in it at all -- so `who`
    // was also wrong (voiced as Marigold, who isn't even pictured);
    // switched to Mia, who is.
    id: 'wt-vocab-friend', kind: 'meet', bg: bgExpressFriend, who: 'mia',
    teacher: 'Tap Mia to learn a new word: friend!',
    line: 'Bella is my friend! Mia, Bella, Willow, and Leo are all Pip’s new friends!', repeat: 'My friend!',
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
    // Per direct user request: replaced the old cubby-guessing game here
    // (no real vocabulary content -- Mia and Leo are already introduced
    // by name in wt-roleplay/wt-join-stage above) with real school/
    // classroom vocabulary: Desk, Chair, Bag -- distinct from
    // wt-vocab-room's Door/Board/Window, same 2-3-hotspot pattern.
    // Per direct user request, renamed from "Backpack" to the simpler
    // "Bag" project-wide (this scene's own art still shows a backpack --
    // a backpack IS a bag, so the simpler word is still an accurate label
    // for the same object, not a mismatch with the art).
    id: 'wt-vocab-supplies', kind: 'vocab-spot', bg: bgSupplies,
    teacher: 'A new part of the room! Tap the arrow to learn a school word.',
    items: [
      { label: 'Desk', sentence: 'This is my desk.', emoji: '\u{1F34E}', left: '20%', top: '58%', color: '#F59E0B' },
      { label: 'Chair', sentence: 'This is my chair.', emoji: '\u{1FA91}', left: '55%', top: '62%', color: '#22C55E' },
      { label: 'Bag', sentence: 'This is my bag.', emoji: '\u{1F392}', left: '85%', top: '62%', color: '#16A34A' },
    ],
  },
  {
    // The practice/review step right after, matching the exact Scene →
    // Discovery → PRACTICE pattern wt-vocab-people/wt-vocab-room already
    // use — per direct user request for "an exercise for the student to
    // remember the vocabulary." Target coordinates match wt-vocab-
    // supplies' own hotspots one-for-one.
    id: 'wt-drag-supplies', kind: 'drag-match', bg: bgSupplies, teacher: 'Listen, then drag each word onto the matching thing in the room!',
    items: [
      { label: 'Desk', color: '#F59E0B', targetLeft: '20%', targetTop: '58%' },
      { label: 'Chair', color: '#22C55E', targetLeft: '55%', targetTop: '62%' },
      { label: 'Bag', color: '#16A34A', targetLeft: '85%', targetTop: '62%' },
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
export const LESSON_2_OBJECTIVE = 'Part 1: Ask and answer "How are you?", name a feeling (happy, sad, tired, angry, hungry), and use He, She and They to say how a friend feels — plus three new school-supplies words (book, pencil, pen) and a first listen at classroom-description language ("There is...", "next to", "on"), heard and repeated once, not yet formally taught. Part 2: Learn the sounds P, I, N and read three more real words.';

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
      { label: 'Happy', sentence: 'Pip is happy.', emoji: '\u{1F60A}', left: '14%', top: '58%', color: '#FE6A2F', who: 'pip' },
      { label: 'Tired', sentence: 'Leo is tired.', emoji: '\u{1F62A}', left: '33%', top: '60%', color: '#C97A2F', who: 'leo' },
      { label: 'Sad', sentence: 'Mia is sad.', emoji: '\u{1F622}', left: '52%', top: '64%', color: '#B85CD1', who: 'mia' },
      { label: 'Angry', sentence: 'Bella is angry.', emoji: '\u{1F620}', left: '71%', top: '62%', color: '#E76FA5', who: 'bella' },
      { label: 'Hungry', sentence: 'Willow is hungry.', emoji: '\u{1F924}', left: '90%', top: '64%', color: '#4FA9E0', who: 'willow' },
    ],
  },

  {
    // Practice step right after discovery — target coordinates match
    // wt2-vocab-feelings' own hotspots one-for-one, same as Lesson 1's
    // drag-match scenes.
    id: 'wt2-drag-feelings', kind: 'drag-match', bg: bgFeelings, teacher: 'Listen, then drag each word onto the friend who feels that way!',
    items: [
      { label: 'Happy', color: '#FE6A2F', who: 'pip', targetLeft: '14%', targetTop: '58%' },
      { label: 'Tired', color: '#C97A2F', who: 'leo', targetLeft: '33%', targetTop: '60%' },
      { label: 'Sad', color: '#B85CD1', who: 'mia', targetLeft: '52%', targetTop: '64%' },
      { label: 'Angry', color: '#E76FA5', who: 'bella', targetLeft: '71%', targetTop: '62%' },
      { label: 'Hungry', color: '#4FA9E0', who: 'willow', targetLeft: '90%', targetTop: '64%' },
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
      { label: 'Hungry', emoji: '\u{1F924}' },
    ],
  },

  /* --- New words: He, She, They — built directly on the five feelings
   * just taught, never re-teaching the feeling words themselves, only the
   * new grammar operating on them. Model (roleplay) -> practice (a real
   * drag-to-bin sort game, not another choice scene) -> produce (join-stage). */
  {
    id: 'wt2-pronoun-model', kind: 'roleplay', bg: bgFeelings, teacher: 'New words! Listen to Miss Marigold, then repeat.', cast: ['marigold'],
    script: [
      { who: 'marigold', line: 'Look at Pip! He is happy.', repeat: true },
      { who: 'marigold', line: 'Look at Mia! She is sad.', repeat: true },
      { who: 'marigold', line: 'Look at Leo and Willow! They are tired and hungry.', repeat: true },
    ],
  },
  {
    // Individual rounds use the established boy/girl split (matching
    // unit1's own he/she gender table): Pip and Leo -> He; Mia, Bella and
    // Willow -> She. The two pair rounds are the only "They" practice —
    // built from character pairs already modeled together above and in
    // the vocab section, not a new grouping.
    id: 'wt2-pronoun-sort', kind: 'pronoun-sort', bg: bgFeelings, teacher: 'Drag each friend to He, She, or They!',
    rounds: [
      { who: 'pip', img: `${W}/sprites/pip-happy.png`, emotion: 'happy', answer: 'He' },
      { who: 'mia', img: `${W}/sprites/mia-sad.png`, emotion: 'sad', answer: 'She' },
      { who: 'leo', img: `${W}/sprites/leo-tired.png`, emotion: 'tired', answer: 'He' },
      { who: 'bella', img: `${W}/sprites/bella-angry.png`, emotion: 'angry', answer: 'She' },
      { who: 'willow', img: `${W}/sprites/willow-hungry.png`, emotion: 'hungry', answer: 'She' },
      { who: ['leo', 'willow'], img: [`${W}/sprites/leo-tired.png`, `${W}/sprites/willow-hungry.png`], emotion: 'tired and hungry', answer: 'They' },
      { who: ['pip', 'mia'], img: [`${W}/sprites/pip-happy.png`, `${W}/sprites/mia-sad.png`], emotion: 'happy and sad', answer: 'They' },
    ],
  },
  {
    id: 'wt2-pronoun-join', kind: 'join-stage', bg: bgFeelings, teacher: 'Your turn! Point to a friend and say He or She!', cast: ['pip', 'mia', 'marigold'],
    turns: [
      { who: 'marigold', line: 'Point to a friend. Is your friend a boy or a girl?' },
      { who: 'student', line: 'He is ______. / She is ______.' },
      { who: 'pip', line: 'Great practice!' },
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
  // Per direct user request: a revision of Lesson 1's classroom vocabulary
  // (desk/chair/bag already taught there) plus new school-supplies words —
  // book, pencil, pen (3 items, per this file's own established "2-3
  // hotspots per scene" cognitive-load rule, not the 5+ a single crammed
  // scene would need to cover everything at once). Same dedicated-image,
  // Discovery → Practice pattern every other vocab-spot/drag-match pair in
  // this file already uses. Placed before the preposition scenes below so
  // "book" is already-known vocabulary by the time "The book is IN the
  // bag" plays, not a brand-new word inside a grammar-focused sentence.
  {
    id: 'wt2-vocab-supplies2', kind: 'vocab-spot', bg: bgSupplies2,
    teacher: 'Remember desk and chair? Now learn three new school words!',
    items: [
      { label: 'Book', sentence: 'This is my book.', emoji: '\u{1F4D6}', left: '39%', top: '58%', color: '#2563EB' },
      { label: 'Pencil', sentence: 'This is my pencil.', emoji: '\u{270F}\u{FE0F}', left: '53%', top: '58%', color: '#F59E0B' },
      { label: 'Pen', sentence: 'This is my pen.', emoji: '\u{1F58A}\u{FE0F}', left: '61%', top: '55%', color: '#0EA5E9' },
    ],
  },
  {
    id: 'wt2-drag-supplies2', kind: 'drag-match', bg: bgSupplies2, teacher: 'Listen, then drag each word onto the matching thing on the desk!',
    items: [
      { label: 'Book', color: '#2563EB', targetLeft: '39%', targetTop: '58%' },
      { label: 'Pencil', color: '#F59E0B', targetLeft: '53%', targetTop: '58%' },
      { label: 'Pen', color: '#0EA5E9', targetLeft: '61%', targetTop: '55%' },
    ],
  },
  {
    id: 'wt2-class-puzzle', kind: 'jigsaw-puzzle', bg: bgFeelings, teacher: 'Puzzle game! Drag the pieces to put the picture back together!',
    image: bgFeelings, rows: 2, cols: 3,
  },

  // Per direct user request to make the unit feel more progressive/
  // cumulative toward real production by its end -- checked against the
  // full A1 roadmap (all 10 units) via playground-curriculum-engine first,
  // not just guessed. Finding: "There is/There are" is already Unit 3's
  // own core grammar target (reinforced across 4 of its 7 lessons, paired
  // meaningfully with counting) and "in/on/next to" isn't seeded anywhere
  // in the roadmap yet -- formally teaching either here would either waste
  // Unit 3's teaching moment or introduce an orphan structure nothing
  // later reinforces. So: a light, chunk-level exposure only (hear it,
  // repeat it once -- no drilling, no quiz, nothing assessed) -- not a
  // new taught/assessed grammar target. The real compounding capstone
  // (light, non-formal PRODUCTION of this same pattern, layered onto
  // everything Unit 1 has taught) is planned for Lesson 6/7 once built;
  // formal teaching of both structures still belongs to Unit 3 and a
  // future unit respectively.
  //
  // Per direct follow-up correction: an earlier draft crammed "in", "on",
  // AND "next to" into a single narrated scene sharing one background --
  // too much at once with nothing to anchor each preposition individually.
  // Now confirmed as a standing project-wide rule (see smart-lesson-
  // architect's Vocabulary logic, extended to grammar chunks): one new
  // concept per scene, each with its own dedicated, purpose-built image
  // that makes that one concept visually unambiguous -- the same
  // single-concept-per-scene discipline every other `meet`/`vocab-spot`
  // scene in this file already follows.
  {
    id: 'wt2-prep-in', kind: 'meet', bg: bgPrepIn, who: 'pip',
    teacher: 'Tap Pip to hear a new word!',
    line: 'Look! The book is IN the bag.', repeat: 'In the bag!',
  },
  {
    id: 'wt2-prep-on', kind: 'meet', bg: bgPrepOn, who: 'mia',
    teacher: 'Tap Mia to hear a new word!',
    line: 'Look! The apple is ON the desk.', repeat: 'On the desk!',
  },
  {
    id: 'wt2-prep-next-to', kind: 'meet', bg: bgPrepNextTo, who: 'leo',
    teacher: 'Tap Leo to hear a new word!',
    line: 'Look! The chair is NEXT TO the desk.', repeat: 'Next to the desk!',
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

/* =============================================================================
 * A1 Unit 1, Lesson 3: "Listen & Greet!"
 *
 * Per this project's own seeded curriculum blueprint (queried directly from
 * curriculum_lessons before writing a single scene, per generate-lesson's
 * §3/§4): title "Listen & Greet!", objective "Students will be able to
 * identify greetings and introductions in short audio." Sits between
 * Lesson 2 (the second vocab+phonics double lesson) and Lesson 4 "Speak &
 * Meet!" (the seeded blueprint's own productive counterpart) — so this
 * lesson stays deliberately receptive: no new vocabulary, no new phonics,
 * no new art (per Gate D — every bg below is reused verbatim from Lessons
 * 1-2's own already-verified assets). It's a listening-comprehension
 * consolidation of everything taught so far (hello/name/age, feelings,
 * teacher/student, classroom + school vocabulary), not a re-teach: every
 * round below is an in-character short line to LISTEN to and identify —
 * not a "which word means X" vocabulary drill — matching the blueprint's
 * own "identify... in short audio" framing. Production stays light (one
 * small join-stage) since Lesson 4 owns the real speaking practice for
 * this same content.
 *
 * Revision note: the first draft of this lesson ran nine near-identical
 * `choice` (tap-a-text-button) scenes back to back for this middle
 * section. Per direct user feedback that it felt repetitive/low quality,
 * and per web research into ESL listening-game design for young learners
 * (recognition-based "tap the object in the picture" mechanics read
 * better for this exact skill than a flat multiple-choice quiz — see
 * e.g. https://www.teach-this.com/esl-games/listening-games and
 * https://www.teachingexpertise.com/classroom-ideas/esl-listening-activity/),
 * most of that block is now a new `listen-tap` scene kind: every real
 * object/character already painted in a background becomes a live
 * hotspot at once (not one guided arrow, not a text menu), and a spoken
 * line has to be matched against the right one. Two plain `choice`
 * scenes remain deliberately (the greeting opener, and age — which has
 * no physical object to tap), and hello-doors still owns name-listening.
 * ========================================================================= */

export const LESSON_3_TITLE = 'Listen & Greet!';
export const LESSON_3_OBJECTIVE = 'Listen carefully to short greetings and introductions from Welcome Town School and show you understand — a listening review of everything from Lessons 1 and 2, no new words.';

export const LESSON_3_SCENES: Scene[] = [
  { id: 'wt3-title', kind: 'title-card', bg: bgWide, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 3', title: 'Listen & Greet!', subtitle: 'Put on your listening ears!', cta: '👂 LET’S LISTEN!' },

  {
    id: 'wt3-intro', kind: 'cinematic', bg: bgCircle, title: 'Listening Time!', subtitle: 'Miss Marigold has a game for the class', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome back, class! Today we play a listening game.' },
      { who: 'marigold', line: 'Listen carefully to each friend, then choose the right answer!' },
      { who: 'pip', line: 'I love listening games! Let’s go!' },
    ],
    cta: '👂 LET’S LISTEN!',
  },

  // Round 1: greeting -- exactly what wt-roleplay modeled in Lesson 1, now
  // tested as pure listening identification. Kept as a `choice` scene
  // deliberately (not every round in this lesson needs to become
  // listen-tap below -- one plain multiple-choice opener is real variety
  // in itself right after the all-choice run this replaced).
  {
    id: 'wt3-choice-hello', kind: 'choice', bg: bgCircle, who: 'marigold', teacher: 'Listen carefully, then tap what Miss Marigold is doing!',
    prompt: 'Hello! Welcome to our class!',
    options: [
      { label: 'Saying hello', emoji: '👋', correct: true },
      { label: 'Saying goodbye', emoji: '👋' },
      { label: 'Asking a question', emoji: '❓' },
    ],
  },
  // Age has no physical object in any bg to tap (unlike feelings/people/
  // room/supplies below, all real painted things or characters) -- stays
  // a `choice` scene for that reason, not because it's the default.
  {
    id: 'wt3-choice-age', kind: 'choice', bg: bgDoor, who: 'pip', teacher: 'Listen carefully, then tap what Pip is telling you!',
    prompt: 'I am seven years old.',
    options: [
      { label: 'His age', emoji: '🎂', correct: true },
      { label: 'His name', emoji: '🏷️' },
      { label: 'Goodbye', emoji: '👋' },
    ],
  },

  // Revives hello-doors — declared in the Scene union with a working
  // renderer but not actually used by any shipped lesson yet (Lesson 1's
  // own cubby-guessing round using this exact mechanic was replaced with
  // real vocabulary per direct user request earlier this project) — a
  // genuine fit here since this lesson's whole point is listen-for-the-
  // name-then-respond, not carrying vocabulary content of its own. Also
  // covers name-listening on its own, so a separate wt3-choice-name round
  // (the original draft had one) would have been pure repetition of this
  // same beat in a flatter format -- dropped in favor of this real game.
  {
    id: 'wt3-hello-doors', kind: 'hello-doors', bg: bgDoor, teacher: 'Knock knock! Listen for the name, then tap the right door!', cast: ['mia', 'leo', 'bella', 'willow'],
    rounds: [
      { target: 'mia', prompt: 'Knock knock! Who is it?', helloLine: 'Hello! My name is Mia.', echoLine: 'Hello, Mia!' },
      { target: 'leo', prompt: 'Knock again! Who is it?', helloLine: 'Hello! My name is Leo.', echoLine: 'Hello, Leo!' },
      { target: 'bella', prompt: 'One more! Who is it?', helloLine: 'Hello! My name is Bella.', echoLine: 'Hello, Bella!' },
      { target: 'willow', prompt: 'Last one! Who is it?', helloLine: 'Hello! My name is Willow.', echoLine: 'Hello, Willow!' },
    ],
  },

  // --- From here down: listen-tap and true-false, not choice. Per direct
  // feedback that the original nine near-identical choice-menu scenes in a
  // row felt repetitive/low quality, and per web research into ESL
  // listening-game design for young learners (recognition-based "tap the
  // object in the picture" mechanics, e.g. Guess-the-Object/Listen-and-
  // point, read better than a flat text-button quiz for this exact skill)
  // — every target below is a real character or object already painted in
  // that bg, reusing the exact hotspot coordinates this file's own
  // vocab-spot/drag-match scenes for that same bg already established, so
  // "where to look" is never new information, only "which one did I just
  // hear". Capped at 2 consecutive listen-tap scenes (feelings, people) per
  // the Hard Variety Rule — see the true-false scene below for why room +
  // supplies content switched mechanics instead of extending this run.

  // Feelings listening review (Lesson 2 content) — targets/coords match
  // wt2-vocab-feelings' own hotspots for mia/leo/willow.
  {
    id: 'wt3-listen-tap-feelings', kind: 'listen-tap', bg: bgFeelings, teacher: 'Listen, then tap the friend who feels that way!',
    targets: [
      { label: 'Mia', left: '52%', top: '64%', color: '#B85CD1' },
      { label: 'Leo', left: '33%', top: '60%', color: '#C97A2F' },
      { label: 'Willow', left: '90%', top: '64%', color: '#4FA9E0' },
    ],
    rounds: [
      { prompt: 'I am sad today.', answerLabel: 'Mia', who: 'mia' },
      { prompt: 'I am so tired.', answerLabel: 'Leo', who: 'leo' },
    ],
  },

  // Teacher / student listening review (Lesson 1 content) — coords match
  // wt-vocab-people's own hotspots for pip/marigold.
  {
    id: 'wt3-listen-tap-people', kind: 'listen-tap', bg: bgPeople, teacher: 'Listen, then tap who is talking!',
    targets: [
      { label: 'Student', left: '26%', top: '42%', color: '#FE6A2F' },
      { label: 'Teacher', left: '68%', top: '48%', color: '#8ECAE6' },
    ],
    rounds: [
      { prompt: 'I am your teacher.', answerLabel: 'Teacher', who: 'marigold' },
      { prompt: 'This is the student.', answerLabel: 'Student', who: 'marigold' },
    ],
  },

  // Classroom + school-supplies listening review (Lesson 1 content), as
  // True/False rather than a third and fourth listen-tap scene in a row.
  // Per activity-pattern-library's Hard Variety Rule (no more than 2
  // consecutive same-kind scenes) -- the first cut of this lesson ran
  // FOUR listen-tap scenes back to back (feelings/people/room/supplies),
  // the same shape of mistake the original nine-choice-scenes run was,
  // just with a newer mechanic. Researched before redesigning:
  // englishcurrent.com/speaking/true-false-guessing-game-activity-esl and
  // teach-this.com/esl-games/listening-games both name True/False as a
  // proven, fast, genuinely different listening-check format for young
  // learners (a binary judgment call, not a search-the-scene or pick-a-
  // button task) -- also explicitly listed in smart-lesson-architect's own
  // "Recognition / noticing" activity family. Since True/False doesn't
  // depend on scene hotspots, one scene freely reviews BOTH room fixtures
  // and school supplies together instead of needing a separate scene per
  // background.
  {
    id: 'wt3-true-false', kind: 'true-false', bg: bgSupplies, teacher: 'Listen to each sentence. Is it TRUE or FALSE?',
    rounds: [
      { who: 'marigold', statement: 'This is called a board.', isTrue: true },
      { who: 'marigold', statement: 'A bag is a chair.', isTrue: false },
      { who: 'pip', statement: 'I carry my books in my bag.', isTrue: true },
      { who: 'pip', statement: 'I sleep in my chair.', isTrue: false },
    ],
  },

  // Cumulative listening-review memory match — every word tested above.
  {
    id: 'wt3-memory', kind: 'memory', bg: bgCircle, teacher: 'Match the matching pairs! Everything we listened to today.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '👋' },
      { id: 'name', label: 'Name', emoji: '🏷️' },
      { id: 'age', label: 'Age', emoji: '🎂' },
      { id: 'happy', label: 'Happy', emoji: '😊' },
      { id: 'friend', label: 'Friend', emoji: '🤝' },
      { id: 'teacher', label: 'Teacher', emoji: '🦉' },
    ],
  },

  // One light production capstone (Gate A bias, not a hard gate) -- kept
  // small since Lesson 4 "Speak & Meet!" owns the real speaking practice
  // for this exact content.
  {
    id: 'wt3-join-stage', kind: 'join-stage', bg: bgCircle, teacher: 'Your turn! Listen, then say hello back!', cast: ['marigold', 'pip'],
    turns: [
      { who: 'marigold', line: 'Hello! What is your name?' },
      { who: 'student', line: 'Hello! My name is ______.' },
      { who: 'pip', line: 'Great listening today!' },
    ],
  },

  {
    id: 'wt3-class-puzzle', kind: 'jigsaw-puzzle', bg: bgWide, teacher: 'Great listening! Drag the pieces to reveal the class picture!',
    image: bgWide, rows: 2, cols: 3,
  },

  {
    id: 'wt3-goodbye-song', kind: 'song', bg: bgExpressGoodbye, title: '🎵 Welcome Town School Goodbye Song 🎵', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3`,
    lyrics: [
      { who: 'marigold', text: '👋 Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '👋 Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '🏫 Welcome Town School is happy today' },
      { who: 'pip', text: '💖 Byeeee, friends! See you soon!' },
    ],
  },

  { id: 'wt3-finale', kind: 'finale', bg: bgWide, who: 'pip', line: 'You listened carefully to hello, names, ages, feelings, friends, and your teacher — great job! ✨👂' },
];

/* =============================================================================
 * A1 Unit 1, Lesson 4: "Speak & Meet!"
 *
 * Per this project's own seeded curriculum blueprint (queried directly from
 * curriculum_lessons before writing a single scene, per generate-lesson's
 * §3/§4): title "Speak & Meet!", objective "Students will be able to greet
 * and introduce themselves to a partner," skill_focus "Speaking",
 * communication_goal "Have a simple greeting conversation," phonics_focus
 * "/f/ (friend)". This is the productive counterpart Lesson 3 explicitly
 * deferred to — Lesson 3 stayed receptive-only; this lesson is where all of
 * it (hello, name, how-are-you, friend/teacher) finally gets said out loud
 * in one real back-and-forth, not drilled as isolated vocabulary again.
 * Per playground-curriculum-engine's progressive-combination rule, this
 * lesson's roleplay/join-stage scenes deliberately COMBINE Lesson 1's
 * hello+name and Lesson 2's how-are-you into a single conversation, and add
 * one genuinely new grammar move on top: introducing a THIRD person
 * ("This is my friend, ___") rather than only ever talking about yourself
 * — sourced from real ESL classroom practice (a partner-interview-then-
 * introduce technique, see sources below), and a natural fit since
 * "friend" is already-known vocabulary from Lesson 1 that this lesson's
 * own phonics slot (/f/) is already anchored to.
 *
 * Two scene kinds get real use here for the first time in the Welcome Town
 * family: `echo` (declared in the Scene union with a working renderer,
 * never actually used by a shipped lesson — a genuine fit for this
 * lesson's quick single-word "hold and say it" speaking reps, a different
 * rhythm from `meet`'s longer modeled monologue) and the shared goodbye
 * song / storybook conventions stay exactly as established, EXCEPT no
 * flipbook here — the blueprint's own Lesson 5 ("Storybook: New Friends at
 * the Park") is the unit's dedicated storybook slot; adding one here too
 * would step on that lesson's own reason to exist.
 *
 * Web research consulted before designing the speaking activities (per
 * standing direction to research fresh mechanics rather than default to
 * the same shape every lesson):
 *   https://www.teach-this.com/functional-language/introductions
 *   https://games4esl.com/greetings-and-introductions-esl-games/
 * Continues the phonics-through-reading track from Lesson 2's P/I/N with
 * one new sound, F — the blueprint's own phonics_focus for this slot —
 * landing on a small delightful capstone: Pip himself is a fox, so
 * "F is for Fox" doubles as a callback to the lesson's own mascot, the
 * same trick Lesson 2's "read PIP" capstone used.
 * ========================================================================= */

export const LESSON_4_TITLE = 'Speak & Meet!';
export const LESSON_4_OBJECTIVE = 'Part 1: Greet a partner and introduce yourself AND a friend, combining everything from Lessons 1-3 into one real conversation. Part 2: Learn the sound F and read three more real words.';

export const LESSON_4_SCENES: Scene[] = [
  { id: 'wt4-title', kind: 'title-card', bg: bgWide, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 4', title: 'Speak & Meet!', subtitle: 'Say hello and meet a new friend!', cta: '🗣️ LET’S TALK!' },

  {
    id: 'wt4-intro', kind: 'cinematic', bg: bgCircle, title: 'Time to Talk!', subtitle: 'Today you have a real conversation', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome back, class! Today we practice something new.' },
      { who: 'marigold', line: 'You will meet a partner and have a real conversation!' },
      { who: 'pip', line: 'I love talking to my friends! Let’s go!' },
    ],
    cta: '🗣️ LET’S TALK!',
  },

  {
    id: 'wt4-meet-model', kind: 'meet', bg: bgExpressHello, who: 'marigold',
    teacher: 'Tap Miss Marigold to hear a full greeting!',
    line: 'Watch me! Hello! My name is Miss Marigold. Nice to meet you!', repeat: 'Nice to meet you!',
  },
  {
    // First real use of `echo` in the Welcome Town family — see the file
    // banner above. A quick single-word speaking rep, deliberately shorter
    // than `meet`'s full modeled line, right after that longer model.
    id: 'wt4-echo-hello', kind: 'echo', bg: bgExpressHello, who: 'pip', teacher: 'Now you try! Hold the button and say it with Pip!', word: 'Hello!',
  },

  {
    // Combines Lesson 1's hello+name and Lesson 2's how-are-you into ONE
    // conversation (progressive combination, not a re-teach of either).
    // Per lesson-quality-gate's Semantic pass: bg-classroom-circle.png (used
    // by every other roleplay/join-stage scene in this file) only paints
    // Pip and Miss Marigold -- RoleplayScene's bubbleLeft anchor map has a
    // real position for those two specifically and silently defaults
    // everyone else to dead-center, so Leo speaking on that background
    // would float a speech bubble over empty space with no character
    // there. Fixed with a dedicated new asset (bg-classroom-peers.png,
    // Pip left / Leo right, facing each other) instead of reusing
    // bg-classroom-circle -- see the matching `leo` anchor added to
    // RoleplayScene's bubbleLeft map in SceneRenderer.tsx.
    id: 'wt4-roleplay', kind: 'roleplay', bg: bgPeers, teacher: 'A real conversation! Listen to Pip and Leo, then repeat each line.', cast: ['pip', 'leo'],
    script: [
      { who: 'pip', line: 'Hello! My name is Pip.', repeat: true },
      { who: 'leo', line: 'Hi Pip! My name is Leo.', repeat: true },
      { who: 'pip', line: 'Nice to meet you, Leo!', repeat: true },
      { who: 'leo', line: 'Nice to meet you too! How are you today?', repeat: true },
      { who: 'pip', line: 'I am happy! How are you?', repeat: true },
      { who: 'leo', line: 'I am fine, thank you!' },
    ],
  },
  {
    id: 'wt4-echo-friend', kind: 'echo', bg: bgExpressFriend, who: 'mia', teacher: 'Say it with Mia! Hold and say it!', word: 'Friend!',
  },

  {
    // Produce, same combined pattern the roleplay above just modeled.
    id: 'wt4-join-stage-intro', kind: 'join-stage', bg: bgCircle, teacher: 'Your turn! Say hello, your name, and how you feel!', cast: ['marigold', 'leo'],
    turns: [
      { who: 'marigold', line: 'Hello! What is your name?' },
      { who: 'student', line: 'Hello! My name is ______.' },
      { who: 'leo', line: 'Nice to meet you! How are you?' },
      { who: 'student', line: 'I am ______. Nice to meet you too!' },
      { who: 'marigold', line: 'Wonderful! You had a real conversation!' },
    ],
  },
  {
    // The lesson's one genuinely new grammar move: introducing someone
    // ELSE ("This is my friend, ___"), not only yourself — see the file
    // banner's note on the partner-interview-then-introduce technique.
    id: 'wt4-join-stage-partner', kind: 'join-stage', bg: bgCircle, teacher: 'Now introduce a FRIEND! Point to someone and say their name!', cast: ['pip', 'bella'],
    turns: [
      { who: 'pip', line: 'This is my friend, Bella!' },
      { who: 'student', line: 'Hello, Bella! Nice to meet you!' },
      { who: 'bella', line: 'Hello! Nice to meet you too!' },
      { who: 'pip', line: 'Now you try! Point to a friend and introduce them!' },
      { who: 'student', line: 'This is my friend, ______!' },
    ],
  },

  {
    id: 'wt4-memory', kind: 'memory', bg: bgCircle, teacher: 'Match the matching pairs! Everything you said today.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '👋' },
      { id: 'goodbye', label: 'Goodbye', emoji: '👋' },
      { id: 'name', label: 'Name', emoji: '🏷️' },
      { id: 'friend', label: 'Friend', emoji: '🤝' },
      { id: 'nice', label: 'Nice to meet you', emoji: '🤗' },
    ],
  },

  {
    id: 'wt4-break', kind: 'title-card', bg: bgWide, level: 'A1', unit: 'Unit 1', lessonLabel: 'Break Time', title: 'Great Job!', subtitle: 'Stretch, get some water, then come back for Part 2!', cta: '🤸 I’m Ready!',
  },

  /* =========================== Part 2: Reading ===========================
   * Continues straight from Lesson 2's P/I/N — one new sound, F, per the
   * blueprint's own phonics_focus for this slot. */

  { id: 'wt4-part2-title', kind: 'title-card', bg: bgReading, level: 'A1', unit: 'Unit 1', lessonLabel: 'Part 2', title: 'Reading Time!', subtitle: 'One new sound — /f/ — then read real words!', cta: '📖 LET’S READ!' },

  {
    id: 'wt4-model-f', kind: 'sound-model', bg: bgReading, who: 'pip', letter: 'F', phoneme: '/f/', sound: 'fff',
    teacher: 'A brand-new sound! /f/ /f/ Fox! Just like me!',
    anchors: [
      { word: 'fan', emoji: '🪭' },
      { word: 'fish', emoji: '🐟' },
      { word: 'fox', emoji: '🦊' },
    ],
  },
  { id: 'wt4-trace-f', kind: 'trace', bg: bgReading, who: 'pip', letter: 'F', phoneme: '/f/', word: 'fox', teacher: 'Trace the letter F! Say /f/ /f/ /f/ as you draw.' },

  {
    id: 'wt4-word-build', kind: 'word-build', bg: bgReading, teacher: 'You know a new sound! Now read three more real words!',
    rounds: [
      { word: 'FAN', blankIndex: 0, answer: 'F', choices: ['F', 'S', 'P'], emoji: '🪭' },
      { word: 'FIN', blankIndex: 0, answer: 'F', choices: ['F', 'P', 'T'], emoji: '🐟' },
      { word: 'SIP', blankIndex: 0, answer: 'S', choices: ['S', 'F', 'P'], emoji: '🥤' },
    ],
  },

  {
    id: 'wt4-letter-hunt', kind: 'letter-game', bg: bgReading, who: 'marigold', mode: 'name',
    teacher: 'Alphabet game! Find the letter I say.',
    rounds: [
      { letter: 'F', choices: ['F', 'P', 'T'] },
      { letter: 'A', choices: ['A', 'O', 'E'] },
      { letter: 'N', choices: ['N', 'M', 'H'] },
    ],
  },
  {
    id: 'wt4-sound-hunt', kind: 'letter-game', bg: bgReading, who: 'pip', mode: 'sound',
    teacher: 'Sound game! Listen, then tap the letter that makes that sound.',
    rounds: [
      { letter: 'F', phoneme: '/f/', choices: ['F', 'S', 'P'] },
      { letter: 'A', phoneme: '/æ/', choices: ['A', 'I', 'O'] },
      { letter: 'N', phoneme: '/n/', choices: ['N', 'M', 'D'] },
    ],
  },
  {
    id: 'wt4-class-puzzle', kind: 'jigsaw-puzzle', bg: bgWide, teacher: 'Puzzle game! Drag the pieces to put the class picture back together!',
    image: bgWide, rows: 2, cols: 3,
  },

  {
    id: 'wt4-goodbye-song', kind: 'song', bg: bgExpressGoodbye, title: '🎵 Welcome Town School Goodbye Song 🎵', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3`,
    lyrics: [
      { who: 'marigold', text: '👋 Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '👋 Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '🏫 Welcome Town School is happy today' },
      { who: 'pip', text: '💖 Byeeee, friends! See you soon!' },
    ],
  },

  { id: 'wt4-finale', kind: 'finale', bg: bgWide, who: 'pip', line: 'You met a partner, had a real conversation, and learned a new sound — F is for friend, and F is for Fox, just like me! ✨🗣️' },
];
