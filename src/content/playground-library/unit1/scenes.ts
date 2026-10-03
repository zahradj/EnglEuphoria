import type { Character } from './audio';
import type { SpinWheelSceneData } from '../SpinWheelScene';
import type { PictureMatchSceneData } from '../PictureMatchScene';
import type { FirstSoundSceneData } from '../FirstSoundScene';
import type { LetterMatchSceneData, LetterBlocksSceneData } from '../LetterTilesScene';
import type { WhatsMissingSceneData } from '../WhatsMissingScene';
import type { SortBasketSceneData } from '../SortBasketScene';
import type { GrammarGapSceneData } from '../GrammarGapScene';

/**
 * Little Explorers Phonics — Lesson 1 "The Forest of Hellos" (H + M sounds).
 * Ported faithfully from the original 22-kind, 25-scene Lesson 1 script.
 * Only the `kind`s this lesson actually uses are typed here — the full
 * cast/critter contract from the source project's authoring framework.
 */

export type CharKey = Exclude<Character, 'teacher' | 'narrator'>;

export type BasketItem = { word: string; emoji: string; hit: boolean; img?: string };

export type Scene =
  // Universal numbered spinner activity — shared with every scene library;
  // see ../SpinWheelScene.tsx for the authoring contract.
  | SpinWheelSceneData
  // Universal word-to-picture matching activity; see ../PictureMatchScene.tsx.
  | PictureMatchSceneData
  // Alphabet & phonics games shared with every scene library; see
  // ../FirstSoundScene.tsx and ../LetterTilesScene.tsx.
  | FirstSoundSceneData
  | LetterMatchSceneData
  | LetterBlocksSceneData
  | WhatsMissingSceneData
  | SortBasketSceneData
  | GrammarGapSceneData
  | { id: string; kind: 'title-card'; bg: string; level: string; unit: string; lessonLabel: string; title: string; subtitle: string }
  | {
      id: string; kind: 'cinematic'; bg: string; title: string; subtitle: string; narrator: Character;
      script: { who: Character; line: string; emotion?: 'happy' | 'sad' | 'angry' | 'neutral' }[]; cta: string;
      /** The renderer overlays an animated walking Pip sprite on every
       *  cinematic scene except the one hardcoded id 'intro' — a duplicate,
       *  visually redundant Pip whenever the scene's own background art
       *  already draws Pip into it (most hero/parade shots do). Set true
       *  for any such scene instead of relying on that id match. */
      hidePipOverlay?: boolean;
    }
  | { id: string; kind: 'meet'; bg: string; who: CharKey; teacher: string; line: string; repeat?: string; phonics?: string; /** Vocabulary in `line` to highlight after the voice has read it. */ focus?: string[] }
  | { id: string; kind: 'sound-model'; bg: string; who: CharKey; prop?: string; letter: string; phoneme: string; sound: string; teacher: string; anchors: { word: string; emoji: string; img?: string }[] }
  | { id: string; kind: 'echo'; bg: string; who: CharKey; teacher: string; word: string; hearWord?: string }
  | {
      id: string; kind: 'basket'; bg: string; letter: string; phoneme: string; who: CharKey; teacher: string; items: BasketItem[]; goal: number;
      /** When false, dropping a correct item into the basket skips the "{phoneme}! {word}!" voice
       * line — the teacher voice already announces the same word on pickup, so on some scenes
       * (basket-h) hearing it a second time right after felt like a doubled-up audio bug. Defaults
       * to true. */
      announceOnDrop?: boolean;
    }
  | {
      id: string; kind: 'trace'; bg: string; who: CharKey; letter: string; phoneme: string; word: string; teacher: string;
      /** When false, tracing completion skips the spoken "{letter}! {phoneme} {word}!" line
       * entirely — playLetterPhonic still plays the real recorded phonic sound right after, so
       * the TTS line was pure duplicate audio on scenes like trace-h. Defaults to true. */
      speakWord?: boolean;
    }
  | { id: string; kind: 'sound-sort'; bg: string; teacher: string; targets: { letter: string; phoneme: string; who: CharKey }[]; items: { word: string; img?: string; emoji: string; letter: string }[] }
  | {
      id: string; kind: 'word-build'; bg: string; teacher: string; rounds: { word: string; blankIndex: number; answer: string; choices: string[]; img?: string; emoji: string }[];
      /** When set, docks the whole puzzle (picture, letter slots, choices)
       *  to one side of the frame instead of dead-center — for a `bg` with
       *  a character standing to one side and real open space on the
       *  other, centering the puzzle covers their face. First used by
       *  Unit 5 Lesson 1 per direct user request. Omitted (default) keeps
       *  the original centered layout existing lessons use. */
      side?: 'left' | 'right';
    }
  | {
      // Word-level counterpart to word-build: the student assembles a
      // whole sentence from its own shuffled words, tapping them in
      // order, instead of just watching/repeating a sentence that's
      // already put together. First used by Unit 5 Lesson 1 per direct
      // user request ("shuffle the words... the student must make the
      // full sentence").
      id: string; kind: 'sentence-build'; bg: string; teacher: string;
      /** img/emoji: same reasoning as word-build's own picture fields — a
       *  non-reader tapping words into order has no way to confirm WHAT
       *  sentence they're building from the (initially blank) tiles alone;
       *  a picture anchors the meaning the way it does everywhere else in
       *  this lesson. */
      rounds: { words: string[]; colors?: (string | null)[]; img?: string; emoji?: string }[];
      side?: 'left' | 'right' | 'top';
    }
  | { id: string; kind: 'who-said-it'; bg: string; teacher: string; rounds: { line: string; who: CharKey; emotion?: 'happy' | 'sad' | 'angry' | 'neutral' }[] }
  | {
      // Plays a short AI-generated clip (Higgsfield, character-referenced
      // against this app's own established art via reference Elements, so
      // it doesn't drift off-model), then transitions to a still close-up
      // of the target item with a shine/sparkle reveal — never a highlight
      // baked into or overlaid on the moving footage itself, since neither
      // AI video generation nor a hand-timed overlay can reliably track
      // exactly where an object sits at exactly what timestamp in
      // generated footage. First used by Unit 1 Lesson 5's reading strand.
      id: string; kind: 'video-story'; videoUrl: string; teacher?: string;
      revealImg: string; revealLabel: string; revealEmoji: string;
    }
  | {
      // Single very-easy comprehension question about what a preceding
      // video-story scene showed — picture + audio only, never text, since
      // Pre-A1 students can't read yet. Two or three tappable picture
      // choices, exactly one correct.
      id: string; kind: 'video-check'; bg: string; question: string;
      correctImg: string; correctLabel: string;
      distractors: { img: string; label: string }[];
    }
  | { id: string; kind: 'gather'; bg: string; teacher: string; hotspots: { who: CharKey; line: string; x: number; y: number; r: number }[]; stage: { x: number; y: number; r: number } }
  | { id: string; kind: 'memory'; bg: string; teacher: string; pairs: { id: string; label: string; emoji: string; img?: string }[] }
  | { id: string; kind: 'dash'; bg: string; teacher: string; who: CharKey; targetLetter: string; targetPhoneme: string; goal: number; seconds: number; items: { word: string; letter: string; img?: string; emoji: string }[] }
  | {
      // Two-basket catch arcade: one item falls at a time, the student taps
      // the LEFT or RIGHT basket to sort it before it lands -- a fresh
      // mechanic (not yet in the engine) combining two single-target
      // review games into one livelier round with a real decision each
      // catch, inspired by the classic "catch it in the right basket"
      // sorting-game pattern used across kids' learning apps. First used
      // by Unit 5 Lesson 1 per direct user request to replace two
      // near-identical single-target `dash` rounds.
      id: string; kind: 'catch-sort'; bg: string; teacher: string;
      left: { label: string; img?: string; emoji: string };
      right: { label: string; img?: string; emoji: string };
      items: { word: string; img?: string; emoji: string; target: 'left' | 'right' }[];
      goal: number; seconds: number;
    }
  | { id: string; kind: 'feelings'; bg: string; teacher: string; options: { label: string; emoji: string; reply: string }[] }
  | { id: string; kind: 'puzzle'; bg: string; teacher: string; rounds: { who: CharKey; img: string; hint: string; emotion?: 'happy' | 'sad' | 'angry' | 'neutral' }[] }
  | {
      /** A REAL jigsaw puzzle — interlocking tab/blank piece shapes (not
       *  plain squares), dragged from a scattered pile into their correct
       *  grid slot to reassemble one whole picture. Distinct from `puzzle`
       *  above, which is actually a "reveal squares, guess who" game with
       *  no dragging and no puzzle-shaped pieces — added per direct user
       *  request for "a real puzzle game... pieces should take the same
       *  shape as puzzle pieces". Piece paths are generated procedurally
       *  (seeded by `id` so they're stable across renders): each internal
       *  grid edge gets one random tab/blank direction shared by both
       *  neighboring pieces (opposite sign), so placed pieces interlock
       *  with no gaps/overlaps. `image` should be a square asset — the
       *  board is always rendered 1:1. */
      id: string; kind: 'jigsaw-puzzle'; bg: string; teacher: string; image: string; rows?: number; cols?: number;
    }
  | { id: string; kind: 'roleplay'; bg: string; teacher: string; cast: CharKey[]; script: { who: CharKey; line: string; repeat?: boolean }[] }
  | {
      id: string; kind: 'join-stage'; bg: string; teacher: string; cast: CharKey[];
      /** `bg` on a turn overrides the scene's own default for that turn only —
       *  lets each question show the specific object/color/shape it's asking
       *  about instead of one static wide scene for every turn.
       *  `arrow`, when set, points at the exact object the line is asking
       *  about — same bouncing-arrow visual as `color-spot` (left/top/dir),
       *  reused here so a question like "What color is it?" stays unambiguous
       *  even on a background with more than one similarly-colored object.
       *  First added for Unit 2 Lesson 1 per direct user feedback that a
       *  free-floating question over a busy scene left students unsure which
       *  object "it" referred to. */
      turns: { who: CharKey | 'student'; line: string; bg?: string; arrow?: { left: string; top: string; dir?: 'down' | 'left' | 'right' }; bubble?: 'top' | 'bottom' | 'left' | 'right' }[];
    }
  | { id: string; kind: 'hello-doors'; bg: string; teacher: string; cast: CharKey[]; rounds: { target: CharKey; prompt: string; helloLine: string; echoLine: string }[] }
  | {
      id: string; kind: 'color-friends'; bg: string; teacher: string; cast?: CharKey[];
      /** When set, colors vocabulary objects (apple/water/sun) instead of a character. */
      vocabItems?: { label: string; targetColorHex: string; targetColorName: string; outline: 'apple' | 'water' | 'sun' | 'circle' | 'square' | 'triangle' }[];
    }
  | { id: string; kind: 'alphabet-blocks'; bg: string; teacher: string; letters: string[]; tapRounds: { letter: string }[]; words: { word: string; emoji: string }[] }
  | { id: string; kind: 'alphabet-order'; bg: string; teacher: string; sequences: string[] }
  | {
      id: string; kind: 'song'; bg: string; title: string; teacher: string; songPrompt: string; songUrl?: string; durationSeconds?: number; bigWord?: string;
      lyrics: { who: CharKey; text: string; emotion?: 'happy' | 'sad' | 'angry' | 'neutral' }[];
      /** Exact per-line duration (ms), same length as `lyrics`, in playback order. When
       * present, SongScene highlights lines using these real cue points instead of
       * dividing the audio's total duration evenly by line count — real sung audio
       * doesn't pace itself evenly (intro bars, uneven line lengths, an outro), so the
       * even-division fallback drifts out of sync with what's actually being sung.
       * Generate these from the SAME per-line duration_ms values used to build the
       * song's composition_plan sections, so the UI and the audio share one source of
       * truth instead of the UI guessing. Omit for older songs generated before this
       * field existed — they keep the even-division fallback. */
      lineDurationsMs?: number[];
    }
  | { id: string; kind: 'finale'; bg: string; who: Character; line: string }
  | { id: string; kind: 'name-gate'; bg: string; teacher: string; rounds: { who: CharKey; question: string; answer: string }[] }
  | { id: string; kind: 'meet-group'; bg: string; teacher: string; askers: { who: CharKey; xPct: number; yPct: number }[]; newcomer: { who: CharKey; xPct: number; yPct: number }; question: string; answer: string; phonics?: string; showSprites?: boolean }
  | { id: string; kind: 'voice-stage'; bg: string; teacher: string; question: string; niceToMeet?: boolean; rounds: { who: CharKey; cue: string; answer: string }[] }
  | { id: string; kind: 'sound-pop'; bg: string; teacher: string; who: CharKey; goal: number; seconds: number; targets: { letter: string; phoneme: string }[]; items: { word: string; letter: string; img?: string; emoji: string }[] }
  | { id: string; kind: 'brick-crush'; bg: string; teacher: string; who: CharKey; letters: string[]; rows: number; cols: number; goal: number; seconds: number }
  | { id: string; kind: 'trophy-chest'; bg: string; teacher: string; who: CharKey; rounds: { letter: string; phoneme: string; word: string; img?: string; emoji: string; choices: string[] }[] }
  | { id: string; kind: 'friend-pop'; bg: string; teacher: string; cast: CharKey[]; rounds: { target: CharKey; prompt: string; emotion?: 'happy' | 'sad' | 'angry' | 'neutral'; sayLine?: string }[] }
  | { id: string; kind: 'feelings-tap'; bg: string; teacher: string; cast: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; label: string }[] }
  | { id: string; kind: 'feelings-wheel'; bg: string; teacher: string; slots: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; label: string }[] }
  | { id: string; kind: 'x-is-feeling'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; sentence: string }[] }
  | { id: string; kind: 'feelings-dice'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; sentence: string }[] }
  | { id: string; kind: 'feed-monsters'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; sentence: string }[] }
  | { id: string; kind: 'he-she-model'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; pronoun: 'He' | 'She'; sentence: string }[] }
  | { id: string; kind: 'he-she-sort'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; pronoun: 'He' | 'She' }[] }
  | { id: string; kind: 'he-she-say'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; pronoun: 'He' | 'She' }[] }
  | { id: string; kind: 'feeling-quiz'; bg: string; teacher: string; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; prompt: string }[] }
  | { id: string; kind: 'i-am-feeling'; bg: string; teacher: string; asker: CharKey; rounds: { emotion: 'happy' | 'sad' | 'angry'; label: string }[] }
  | { id: string; kind: 'feelings-bingo'; bg: string; teacher: string; tiles: { who: CharKey; emotion: 'happy' | 'sad' | 'angry' }[]; rounds: { who: CharKey; emotion: 'happy' | 'sad' | 'angry'; prompt: string }[] }
  | { id: string; kind: 'numbers-learn'; bg: string; who: CharKey; from: number; to: number; teacher: string }
  | { id: string; kind: 'numbers-review'; bg: string; who: CharKey; from: number; to: number; teacher: string }
  | { id: string; kind: 'candle-cake'; bg: string; who: CharKey; teacher: string; rounds: { asker: CharKey; target: number; isStudent?: boolean; prompt: string; celebrate: string }[] }
  | { id: string; kind: 'count-balloons'; bg: string; who: CharKey; total: number; teacher: string }
  | { id: string; kind: 'age-balloons'; bg: string; teacher: string; friends: { who: CharKey; age: number }[] }
  | { id: string; kind: 'age-sentence-match'; bg: string; teacher: string; friends: { who: CharKey; age: number }[] }
  | { id: string; kind: 'meet-greet'; bg: string; teacher: string; friends: { who: CharKey; age: number }[] }
  | { id: string; kind: 'age-quiz'; bg: string; teacher: string; friends: { who: CharKey; age: number }[]; studentAges: number[] }
  | {
      id: string; kind: 'flipbook'; bg: string; title: string;
      pages: { who?: CharKey; img: string; text: string }[];
      checkpoints: { afterPage: number; who?: CharKey; question: string; options: string[]; answer: string }[];
    }
  | {
      /** Pre-A1's first dedicated pre-reading activity: a printed WORD is
       *  the prompt (tap to hear it read aloud), and the student picks the
       *  matching picture from 3 choices — whole-word shape recognition,
       *  not phonetic decoding. Modeled on Cambridge Pre-A1 Starters' own
       *  wordlist picture book (picture + matching word-card flashcard
       *  pairs, explicitly meant for non-readers to "find and name words
       *  within pictures") and Oxford Phonics World's picture-matching
       *  activities, scaled down from sentence-level to single-word level
       *  for this CEFR band. Framed as reading the carnival stand signs
       *  (BALLOONS/COTTON CANDY/POPCORN) the lesson's own art already
       *  shows, so no new art was needed. Added per direct user request
       *  for a reading-readiness activity appropriate for non-readers —
       *  distinct from color-quiz (audio-led "which one is RED?", picture-
       *  only options) because here the printed word is the primary prompt. */
      id: string; kind: 'word-picture-match'; bg: string; teacher: string;
      rounds: { word: string; who?: CharKey; correctImg: string; correctLabel: string; distractors: { img: string; label: string }[] }[];
    }
  | {
      id: string; kind: 'color-model'; bg: string; teacher: string;
      items: { colorWord: string; colorHex: string; who: CharKey; exampleWord: string; exampleImg: string }[];
    }
  | { id: string; kind: 'color-sort'; bg: string; teacher: string; targets: { colorWord: string; colorHex: string; who: CharKey }[]; items: { word: string; img?: string; emoji: string; colorWord: string }[] }
  | {
      id: string; kind: 'color-quiz'; bg: string; teacher: string;
      rounds: { colorWord: string; colorHex: string; who: CharKey; correctImg: string; correctLabel: string; distractors: { img: string; label: string }[] }[];
    }
  | {
      id: string; kind: 'listen-repeat-cards'; bg: string; teacher: string;
      cards: {
        who: CharKey; sentence: string; img: string; imgLabel: string;
        /** Per-word CSS color for the sentence, aligned by index to the
         *  words `sentence.split(' ')` produces (null/undefined = default
         *  white). Lets a fixed grammar chunk keep one color across every
         *  card so the student learns to recognize it by color, not just
         *  position — e.g. "This is" always red, "my" always green, the
         *  family word itself staying the default white. First used by
         *  Unit 5 Lesson 1's sentence-practice scenes per direct user
         *  request. Existing cards omit this and render plain white. */
        wordColors?: (string | null)[];
      }[];
      /** When true, drops the big enclosing white card entirely — the
       *  word/sentence floats as its own bold drop-shadowed text directly
       *  on the full-bleed background's own empty side (no duplicate small
       *  thumbnail of a character the background already shows large),
       *  with small individual floating pill buttons for Listen/Hold &
       *  repeat instead of one boxed panel. First used by Unit 5 Lesson 1's
       *  single-word vocabulary scenes (bg is a "-solo" character portrait
       *  with real empty space to one side) per direct user request: the
       *  original boxed-card design covered/duplicated the character the
       *  background already showed. Existing lessons omit this (default
       *  false) and keep the original boxed-card look unchanged. */
      bare?: boolean;
      /** Which side of the frame is empty enough for the floating word,
       *  only used when `bare` is true. 'top' spans the word centered near
       *  the top of the frame instead of a left/right half-width column —
       *  the right shape for a background with no single clean empty side
       *  (e.g. a 3-character group shot with someone on both edges).
       *  Defaults to 'right'. */
      textSide?: 'left' | 'right' | 'top';
    }
  | {
      /** Tap the real illustrated object inside a full scene to find its
       *  color — Welcome Town's vocab-spot pattern (arrow points at it, tap
       *  reveals a flashcard), ported here for colors. New for the Unit 2
       *  Lesson 1 rebuild, where every other color activity teaches on an
       *  abstract card instead of a real scene. */
      id: string; kind: 'color-spot'; bg: string; teacher: string;
      items: { colorWord: string; colorHex: string; who: CharKey; label: string; sentence: string; left: string; top: string; dir?: 'down' | 'left' | 'right'; splashImg?: string }[];
    }
  | {
      /** Shape counterpart to color-model — same tap/hold/repeat progression
       *  (hear the shape word, repeat, hear the object word, say the
       *  sentence), but the swatch is an actual drawn shape (circle/
       *  square/triangle) instead of a color-filled circle. First used by
       *  Unit 2 Lesson 3 ("Circle, Square, Triangle!"), Unit 2's first
       *  shapes lesson — colors' own kinds are typed around colorHex and
       *  don't generalize to a shape's outline. */
      id: string; kind: 'shape-model'; bg: string; teacher: string;
      items: { shapeWord: string; shapeColor: string; who: CharKey; exampleWord: string; exampleImg: string }[];
    }
  | {
      /** Toy-noun counterpart to shape-model/color-model — same tap/hold/
       *  repeat progression (hear the toy word, repeat, then say the
       *  combined color+toy sentence), but the swatch shows the actual toy
       *  icon (already rendered in its fixed color) instead of an abstract
       *  color circle or shape outline. First used by Unit 3 Lesson 1
       *  ("Ball, Car, Doll!") to combine brand-new toy nouns with colors
       *  already mastered in Unit 2, per the progressive-combination rule. */
      id: string; kind: 'toy-model'; bg: string; teacher: string;
      /** `plural: true` renders "They are {colorWord} {toyWord}." instead
       *  of "It's a {colorWord} {toyWord}." — first used by Unit 3 Lesson
       *  2 for toy words that are naturally plural (e.g. "blocks"). */
      items: { toyWord: string; colorWord: string; colorHex: string; who: CharKey; img: string; plural?: boolean }[];
    }
  | {
      /** Drag each picture into one of two FIXED bins — "It is" (one item
       *  shown) or "They are" (several of the same item shown) — teaching
       *  singular vs. plural recognition directly, independent of any
       *  particular color or shape. First used by Unit 3 Lesson 2
       *  ("Teddy Bear, Blocks, Train!"), the unit's first plural-grammar
       *  lesson. Mixes brand-new items with earlier lessons' own already-
       *  verified single-object images for spiral review. */
      id: string; kind: 'plural-sort'; bg: string; teacher: string; who: CharKey;
      items: { word: string; img?: string; emoji: string; plural: boolean }[];
    }
  | {
      /** A row of toy-train cars, each with a different toy in its window.
       *  The train "chugs" past and covers each car in turn; one randomly
       *  stays covered, and the student must recall which toy was inside
       *  it from a set of choices — a visual working-memory game (the
       *  "missing card" mechanic), thematically built around the train
       *  toy itself. First used by Unit 3 Lesson 2. */
      id: string; kind: 'train-recall'; bg: string; teacher: string;
      cars: { word: string; img?: string; emoji: string }[];
    }
  | {
      /** Shape counterpart to color-sort. */
      id: string; kind: 'shape-sort'; bg: string; teacher: string;
      targets: { shapeWord: string; shapeColor: string; who: CharKey }[];
      items: { word: string; img?: string; emoji: string; shapeWord: string }[];
    }
  | {
      /** "I Spy" — a well-established, research-backed color-recognition
       *  game (teacher/character gives a color clue, child finds the
       *  matching object among several visible at once) — genuinely
       *  different from color-spot, which reveals targets one at a time
       *  with nothing else on screen to choose between. Every round shows
       *  ALL spots simultaneously; the "find it among distractors" tension
       *  is the whole point, matching how the real game is actually played. */
      id: string; kind: 'color-spy'; bg: string; teacher: string;
      spots: { colorWord: string; colorHex: string; label: string; left: string; top: string }[];
      clueOrder: string[];
      who: CharKey;
      /** 'a' → "I spy a circle!" (nouns such as shapes); default "I spy something red!". */
      article?: 'a';
    }
  | {
      /** "Simon Says" color-sequence memory game — press-back a growing
       *  sequence of color buttons. A different skill from every other
       *  color activity in this lesson (short-term sequence memory +
       *  color-word/color-swatch mapping under time pressure), and one of
       *  the most well-established gamified mechanics for this exact age
       *  group and skill. */
      id: string; kind: 'color-simon'; bg: string; teacher: string;
      colors: { colorWord: string; colorHex: string; who: CharKey }[];
      maxRounds: number;
    }
  | {
      /** "Magic Paint Pots" — mix two of Lesson 1's paints into a new colour,
       *  then name it to bring the round's object to life (Unit 2 Lesson 2). */
      id: string; kind: 'color-mix'; bg: string; teacher: string; who: CharKey; potImg: string;
      paints: { colorWord: string; colorHex: string }[];
      answers: { colorWord: string; colorHex: string }[];
      rounds: { a: string; b: string; result: string; resultHex: string; who: CharKey; img: string; label: string; line: string }[];
    }
  | {
      /** "Shape Builders" — build a picture piece by piece: name each empty
       *  outline's shape, then pick the piece in the colour you hear
       *  (Unit 2 Lesson 3). Piece boxes are in a 100×70 board space. */
      id: string; kind: 'shape-builder'; bg: string; teacher: string; who: CharKey;
      rounds: {
        who: CharKey; label: string; intro: string; line: string; alive: 'bounce' | 'launch' | 'wiggle';
        pieces: { shape: 'circle' | 'square' | 'triangle'; colorWord: string; colorHex: string; x: number; y: number; w: number; h: number; flip?: boolean }[];
      }[];
    }
  | {
      /** "Pip's Secret Card" — Guess Who with colours and shapes: the child
       *  asks "Is it red?" / "Is it a circle?" and Pip answers yes/no until
       *  one card is left (Unit 2 Lesson 4). `secret` indexes `cards`. */
      id: string; kind: 'secret-card'; bg: string; teacher: string; who: CharKey;
      cards: { colorWord: string; colorHex: string; shape: 'circle' | 'square' | 'triangle' }[];
      rounds: { secret: number }[];
    };

const A = '/lep1'; // public asset root

export const CAST: Record<CharKey, { name: string; img: string; emoji: string; color: string }> = {
  pip: { name: 'Pip', img: `${A}/characters/pip-hello.png`, emoji: '\u{1F98A}', color: '#FE6A2F' },
  mia: { name: 'Mia', img: `${A}/characters/mia-hello.png`, emoji: '\u{1F42D}', color: '#B85CD1' },
  bella: { name: 'Bella', img: `${A}/characters/bella-hello.png`, emoji: '\u{1F430}', color: '#E76FA5' },
  willow: { name: 'Willow', img: `${A}/characters/willow-hello.png`, emoji: '\u{1F426}', color: '#4FA9E0' },
  leo: { name: 'Leo', img: `${A}/characters/leo-hello.png`, emoji: '\u{1F981}', color: '#C97A2F' },
};

export const EMOTION_SPRITE: Record<CharKey, Record<'happy' | 'sad' | 'angry' | 'neutral', string>> = {
  pip: { happy: `${A}/characters/pip-happy.png`, sad: `${A}/characters/pip-sad.png`, angry: `${A}/characters/pip-angry.png`, neutral: `${A}/characters/pip-hello.png` },
  mia: { happy: `${A}/characters/mia-happy.png`, sad: `${A}/characters/mia-sad.png`, angry: `${A}/characters/mia-angry.png`, neutral: `${A}/characters/mia-hello.png` },
  bella: { happy: `${A}/characters/bella-happy.png`, sad: `${A}/characters/bella-sad.png`, angry: `${A}/characters/bella-angry.png`, neutral: `${A}/characters/bella-hello.png` },
  leo: { happy: `${A}/characters/leo-happy.png`, sad: `${A}/characters/leo-sad.png`, angry: `${A}/characters/leo-angry.png`, neutral: `${A}/characters/leo-hello.png` },
  willow: { happy: `${A}/characters/willow-hello.png`, sad: `${A}/characters/willow-hello.png`, angry: `${A}/characters/willow-hello.png`, neutral: `${A}/characters/willow-hello.png` },
};

export function getEmotionSprite(who: CharKey, emotion: 'happy' | 'sad' | 'angry' | 'neutral'): string {
  return EMOTION_SPRITE[who][emotion];
}

export const PROP_THEME: Record<string, { closed: string; label: string; tint: string; img?: string }> = {
  pip: { closed: '\u{1F41A}', label: 'shell', tint: '#FE6A2F', img: `${A}/items/prop-shell.png` },
  mia: { closed: '⭐', label: 'star', tint: '#FDE68A', img: `${A}/items/prop-star.png` },
  // Bella/Leo (Lesson 4, B and T) had no entry here, so PROP_THEME[scene.prop ?? scene.who] ?? PROP_THEME.pip
  // was silently falling through to Pip's shell theme from Lesson 1 for a birthday-themed lesson.
  bella: { closed: '\u{1F381}', label: 'gift', tint: '#E76FA5' },
  leo: { closed: '\u{1F381}', label: 'gift', tint: '#C97A2F' },
  // Willow (Unit 2 Lesson 2's /g/) fell through to Pip's shells too.
  willow: { closed: '\u{1FAB6}', label: 'feather', tint: '#4FA9E0' },
};

export const CHARACTER_STAGE: Record<CharKey, { side: 'left' | 'right' }> = {
  pip: { side: 'left' },
  mia: { side: 'right' },
  bella: { side: 'left' },
  willow: { side: 'right' },
  leo: { side: 'left' },
};

export const COLOR_SKETCH: Record<CharKey, string> = {
  pip: `${A}/color/color-pip.png`,
  mia: `${A}/color/color-mia.png`,
  bella: `${A}/color/color-bella.png`,
  leo: `${A}/color/color-leo.png`,
  willow: `${A}/color/color-willow.png`,
};

const bgTitleForest = `${A}/scenes/bg-title-forest.jpg`;
const bgClearing = `${A}/scenes/bg-clearing.jpg`;
const scenePipClearing = `${A}/scenes/scene-pip-clearing.jpg`;
const sceneMiaMousehole = `${A}/scenes/scene-mia-mousehole.jpg`;
const sceneBellaBigTree = `${A}/scenes/scene-bella-bigtree.jpg`;
const bgHPortal = `${A}/scenes/bg-h-portal.jpg`;
const bgMPortal = `${A}/scenes/bg-m-portal.jpg`;
const bgHBasket = `${A}/scenes/bg-h-basket.jpg`;
const bgMBasket = `${A}/scenes/bg-m-basket.jpg`;
const bgGather = `${A}/scenes/bg-gather.jpg`;
const bgGatherEmpty = `${A}/scenes/bg-gather-empty.jpg`;
// roleplay-l1 needs its own dedicated background (not bgGatherEmpty, which join-stage-l1
// still uses for its open webcam space) because RoleplayScene never renders character
// sprites — it relies entirely on the bg art to show who's "talking." Characters are
// placed at ~12/34/58% from the left to line up with RoleplayScene's own hardcoded
// speech-bubble anchor positions for pip/mia/bella.
const bgL1RoleplayFriends = `${A}/scenes/bg-l1-roleplay-friends.jpg`;
// join-stage-l1 previously used bgGatherEmpty for every turn (friend turns AND the
// student's own turn) — same bug class as roleplay-l1: JoinStageScene renders no
// friend sprite either, so pip/mia/bella's turns showed nobody. These -solo shots
// (character on the left third, right ~55% left open) follow the same convention
// every other lesson's join-stage already uses, keeping the open side clear for the
// webcam circle (default position ~82%/64%). bgGatherEmpty stays as-is for the
// student's own turn, where an empty backdrop is correct.
const bgL1PipSolo = `${A}/scenes/bg-l1-pip-solo.jpg`;
const bgL1MiaSolo = `${A}/scenes/bg-l1-mia-solo.jpg`;
const bgL1BellaSolo = `${A}/scenes/bg-l1-bella-solo.jpg`;
// Same "solo shot" convention as the three above (character on the left
// third, right side open) — Leo never got one, so his join-stage turns
// anywhere in the unit fell back to whatever the scene's default bg was
// (bgGatherEmpty in Lesson 6's case), showing nobody for his lines.
const bgLeoSolo = `${A}/scenes/bg-leo-solo.jpg`;
// Lesson 6's roleplay (cast: pip/mia/leo) had the exact same bug
// roleplay-l1 already had and was fixed for: RoleplayScene never renders
// character sprites, it relies entirely on the bg art, so bgGatherEmpty
// (a literally empty meadow) showed nobody "talking" for any line. Same
// fix pattern as bgL1RoleplayFriends, with Leo in place of Bella.
const bgL6RoleplayFriends = `${A}/scenes/bg-l6-roleplay-friends.jpg`;
// Lesson 5's l5-roleplay-recap (cast: leo/pip/mia/willow/bella) is the
// same bug once more — bgGatherEmpty, nobody painted in — but with the
// full five-friend cast, so it needs its own new composition rather than
// reusing L6's three-character shot. Characters are painted left-to-right
// in the order of RoleplayScene's own hardcoded speech-bubble x-anchors
// (pip ~12%, mia ~34%, leo ~50% via the 50% fallback, bella ~58%,
// willow ~82%) so each line's bubble lands near its speaker.
const bgL5RoleplayFriends = `${A}/scenes/bg-l5-roleplay-friends.jpg`;
// Willow's "solo shot" (character on the left third, right side open) —
// the last cast member without one. Same convention as bgL1PipSolo/
// MiaSolo/BellaSolo and bgLeoSolo; used by l5-ask-friends' Willow turn,
// which otherwise fell back to the scene's empty bgGatherEmpty default.
const bgWillowSolo = `${A}/scenes/bg-willow-solo.jpg`;
const bgHideSeek = `${A}/scenes/bg-hideseek.jpg`;
const bgMeadow = `${A}/scenes/bg-meadow.jpg`;
const bgBigTree = `${A}/scenes/bg-bigtree.jpg`;
const bgL5LeoSad = `${A}/scenes/bg-l5-leo-sad.png`;
const bgL5Search = `${A}/scenes/bg-l5-search.png`;
const bgL5FoundTree = `${A}/scenes/bg-l5-found-tree.png`;
const bgL5ReadingIntro = `${A}/scenes/bg-l5-reading-intro.png`;
const bgL5ReadingHat = `${A}/scenes/bg-l5-reading-hat.png`;
const bgL5ReadingMat = `${A}/scenes/bg-l5-reading-mat.png`;
const bgL5ReadingCelebrate = `${A}/scenes/bg-l5-reading-celebrate.png`;
const bgL5ReadingBat = `${A}/scenes/bg-l5-reading-bat.png`;
const bgGoodbyeCast = `${A}/scenes/bg-goodbye-cast.jpg`;
const bgHelloCast = `${A}/scenes/bg-hello-cast.jpg`;
const bgL6TrophyTrail = `${A}/scenes/bg-l6-trophy-trail.jpg`;
const bgL6TrophyPodium = `${A}/scenes/bg-l6-trophy-podium.jpg`;

// Illustration audit (see MEMORY.md "lesson background art quality"): these
// scenes described a specific visual moment their assigned bg didn't show
// at all — a knockable door, a birthday cake, a red apple + blue stream —
// so each got real, purpose-generated art via the project's own Gemini
// image pipeline instead of a reused generic backdrop.
const bgHelloDoorsTree = `${A}/scenes/bg-hello-doors-tree.png`;
const bgL4BellaBirthdayCake = `${A}/scenes/bg-l4-bella-birthday-cake.png`;
const bgU2L1PipBellaAppleWater = `${A}/scenes/bg-u2l1-pip-bella-apple-water.png`;

const itemHello = `${A}/items/item-hello.png`;
const itemHat = `${A}/items/item-hat.png`;
const itemMat = `${A}/items/item-mat.png`;
const itemBat = `${A}/items/item-bat.png`;
const itemHouse = `${A}/items/item-house.png`;
const itemMoon = `${A}/items/item-moon.png`;
const itemMilk = `${A}/items/item-milk.png`;
const itemMouse = `${A}/items/item-mouse.png`;

export const LESSON_1_TITLE = 'The Forest of Hellos';
export const LESSON_1_OBJECTIVE = "Greet a friend and say my name using 'Hello. My name is ___.'";

export const LESSON_1_SCENES: Scene[] = [
  { id: 'title-1', kind: 'title-card', bg: bgTitleForest, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 1', title: 'The Forest of Hellos', subtitle: 'Greetings & the /h/ and /m/ sounds' },
  {
    id: 'l1-hello-song', kind: 'song', bg: bgHelloCast, title: '\u{1F44B} Hello Song \u{1F44B}', teacher: "Warm up with Pip! Sing along and wave on every 'hello'.",
    durationSeconds: 20, bigWord: 'Hello', songUrl: `${A}/audio/hello-song.mp3?v=2`,
    lineDurationsMs: [5200, 4300, 4500, 6100],
    songPrompt: 'Cheerful upbeat kids hello song, sweet real singing with a warm teacher voice and small kids choir, ukulele plus light claps, bright and welcoming.',
    lyrics: [
      { who: 'pip', text: '\u{1F44B} Hello, hello, hello my friend!', emotion: 'happy' },
      { who: 'pip', text: '\u{1F333} Come with me, the fun begins!', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44F} Clap your hands and wave up high', emotion: 'happy' },
      { who: 'pip', text: '\u{1F495} Hello, hello, hi hi hi!', emotion: 'happy' },
    ],
  },
  {
    id: 'intro', kind: 'cinematic', bg: bgClearing, title: 'The Forest of Hellos', subtitle: 'A tiny adventure with big new friends', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hi, hi, hi! I am Pip!' },
      { who: 'pip', line: 'I lost my friends in the forest. Will you help me find them?' },
    ],
    cta: "Let's go!",
  },
  { id: 'meet-pip', kind: 'meet', focus: ['Hello'], bg: scenePipClearing, who: 'pip', teacher: 'Look! Pip is here. Tap Pip to say hello!', line: 'Hello! I am Pip!', repeat: 'Hello!', phonics: 'h' },
  {
    id: 'model-h', kind: 'sound-model', bg: bgHPortal, who: 'pip', letter: 'H', phoneme: '/h/', sound: 'huh', teacher: "Listen to Pip's sound. /h/ /h/ Hello!",
    anchors: [
      { word: 'Hello', emoji: '\u{1F44B}', img: itemHello },
      { word: 'Hat', emoji: '\u{1F3A9}', img: itemHat },
      { word: 'House', emoji: '\u{1F3E0}', img: itemHouse },
    ],
  },
  { id: 'echo-hello', kind: 'echo', bg: scenePipClearing, who: 'pip', teacher: 'Repeat after Pip: Hello! Hello! Hello!', word: 'Hello!' },
  {
    id: 'basket-h', kind: 'basket', bg: bgHBasket, letter: 'H', phoneme: '/h/', who: 'pip', teacher: "Drag the /h/ words into Pip's H basket!", goal: 3, announceOnDrop: false,
    items: [
      { word: 'hello', emoji: '\u{1F44B}', img: itemHello, hit: true },
      { word: 'hat', emoji: '\u{1F3A9}', img: itemHat, hit: true },
      { word: 'house', emoji: '\u{1F3E0}', img: itemHouse, hit: true },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, hit: false },
      { word: 'milk', emoji: '\u{1F95B}', img: itemMilk, hit: false },
    ],
  },
  { id: 'trace-h', kind: 'trace', bg: bgHPortal, who: 'pip', letter: 'H', phoneme: '/h/', word: 'Hello', speakWord: false, teacher: 'Trace the big H with your finger! /h/ /h/' },
  { id: 'meet-mia', kind: 'meet', focus: ['name'], bg: sceneMiaMousehole, who: 'mia', teacher: 'Peek! Tap Mia to meet her!', line: 'Hi! My name is Mia!', repeat: 'My name is Mia!', phonics: 'm' },
  {
    id: 'model-m', kind: 'sound-model', bg: bgMPortal, who: 'mia', letter: 'M', phoneme: '/m/', sound: 'mmm', teacher: 'Listen to Mia’s sound. /m/ /m/ Mia!',
    anchors: [
      { word: 'Mia', emoji: '\u{1F42D}', img: itemMouse },
      { word: 'Moon', emoji: '\u{1F319}', img: itemMoon },
      { word: 'Milk', emoji: '\u{1F95B}', img: itemMilk },
    ],
  },
  { id: 'trace-m', kind: 'trace', bg: bgMPortal, who: 'mia', letter: 'M', phoneme: '/m/', word: 'Mia', teacher: 'Trace the big M with your finger! /m/ /m/' },
  { id: 'echo-mia', kind: 'echo', bg: sceneMiaMousehole, who: 'mia', teacher: 'Repeat after Mia: My name is Mia!', word: 'My name is Mia!' },
  {
    id: 'basket-m', kind: 'basket', bg: bgMBasket, letter: 'M', phoneme: '/m/', who: 'mia', teacher: "Drag the /m/ words into Mia's M basket!", goal: 3,
    items: [
      { word: 'mouse', emoji: '\u{1F42D}', img: itemMouse, hit: true },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, hit: true },
      { word: 'milk', emoji: '\u{1F95B}', img: itemMilk, hit: true },
      { word: 'hat', emoji: '\u{1F3A9}', img: itemHat, hit: false },
      { word: 'house', emoji: '\u{1F3E0}', img: itemHouse, hit: false },
    ],
  },
  {
    id: 'sort-hm', kind: 'sound-sort', bg: bgClearing, teacher: 'Listen! Drag each thing to its sound — /h/ or /m/.',
    targets: [
      { letter: 'H', phoneme: '/h/', who: 'pip' },
      { letter: 'M', phoneme: '/m/', who: 'mia' },
    ],
    items: [
      { word: 'hello', emoji: '\u{1F44B}', img: itemHello, letter: 'H' },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, letter: 'M' },
      { word: 'milk', emoji: '\u{1F95B}', img: itemMilk, letter: 'M' },
      { word: 'mouse', emoji: '\u{1F42D}', img: itemMouse, letter: 'M' },
      { word: 'hat', emoji: '\u{1F3A9}', img: itemHat, letter: 'H' },
      { word: 'house', emoji: '\u{1F3E0}', img: itemHouse, letter: 'H' },
    ],
  },
  {
    id: 'word-build', kind: 'word-build', bg: bgClearing, teacher: 'Listen! Tap the missing letter to make the word.',
    rounds: [
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['H', 'M'], img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'moon', blankIndex: 0, answer: 'M', choices: ['H', 'M'], img: itemMoon, emoji: '\u{1F319}' },
      { word: 'house', blankIndex: 0, answer: 'H', choices: ['H', 'M'], img: itemHouse, emoji: '\u{1F3E0}' },
      { word: 'milk', blankIndex: 0, answer: 'M', choices: ['H', 'M'], img: itemMilk, emoji: '\u{1F95B}' },
    ],
  },
  { id: 'meet-bella', kind: 'meet', focus: ['Nice to meet you'], bg: sceneBellaBigTree, who: 'bella', teacher: 'A bunny hops over. Tap Bella to say hi!', line: 'Hello! I am Bella. Nice to meet you!', repeat: 'Nice to meet you!' },
  { id: 'echo-nice', kind: 'echo', bg: sceneBellaBigTree, who: 'bella', teacher: 'Repeat after Bella: Nice to meet you!', word: 'Nice to meet you!' },
  {
    id: 'who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Listen! Who is talking? Tap the friend.',
    rounds: [
      { line: 'Hi! My name is Mia!', who: 'mia' },
      { line: 'Hello! I am Pip!', who: 'pip' },
      { line: 'Nice to meet you! I am Bella.', who: 'bella' },
    ],
  },
  {
    id: 'l1-sound-pop-m', kind: 'sound-pop', bg: bgClearing, teacher: 'Balloon Letter Pop! Mia will call a letter. Pop only that letter!', who: 'mia', goal: 8, seconds: 45,
    targets: [
      { letter: 'M', phoneme: '/m/' },
    ],
    items: [
      { word: 'M', letter: 'M', emoji: 'M' }, { word: 'H', letter: 'H', emoji: 'H' },
    ],
  },
  {
    id: 'gather', kind: 'gather', bg: bgGather, teacher: 'All friends are here! Tap a friend to hear them. Then drag the camera to the daisy circle for YOUR turn!',
    hotspots: [
      { who: 'pip', line: 'Hello, my name is Pip. Nice to meet you.', x: 380, y: 620, r: 220 },
      { who: 'mia', line: 'Hello, my name is Mia. Nice to meet you.', x: 810, y: 640, r: 200 },
      { who: 'bella', line: 'Hello, my name is Bella. Nice to meet you.', x: 1440, y: 660, r: 230 },
    ],
    stage: { x: 1740, y: 880, r: 180 },
  },
  {
    id: 'memory', kind: 'memory', bg: bgMeadow, teacher: 'Find the pairs! Tap two cards to match them.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '\u{1F44B}', img: itemHello },
      { id: 'hat', label: 'Hat', emoji: '\u{1F3A9}', img: itemHat },
      { id: 'moon', label: 'Moon', emoji: '\u{1F319}', img: itemMoon },
      { id: 'milk', label: 'Milk', emoji: '\u{1F95B}', img: itemMilk },
    ],
  },
  {
    id: 'dash', kind: 'dash', bg: bgClearing, teacher: 'Pip Dash! Tap only the H words as they run by. Get 6 rings!', who: 'pip', targetLetter: 'H', targetPhoneme: '/h/', goal: 6, seconds: 40,
    items: [
      { word: 'hat', letter: 'H', img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'house', letter: 'H', img: itemHouse, emoji: '\u{1F3E0}' },
      { word: 'hello', letter: 'H', img: itemHello, emoji: '\u{1F44B}' },
      { word: 'moon', letter: 'M', img: itemMoon, emoji: '\u{1F319}' },
      { word: 'milk', letter: 'M', img: itemMilk, emoji: '\u{1F95B}' },
      { word: 'mouse', letter: 'M', img: itemMouse, emoji: '\u{1F42D}' },
    ],
  },
  {
    id: 'feelings', kind: 'feelings', bg: bgBigTree, teacher: 'Big tree party time! How do you feel?',
    options: [
      { label: 'Happy', emoji: '\u{1F600}', reply: 'Yay! Me too! I am happy!' },
      { label: 'Okay', emoji: '\u{1F610}', reply: 'That is okay. I am with you.' },
      { label: 'Sad', emoji: '\u{1F622}', reply: "It's okay to feel sad. I am here." },
    ],
  },
  {
    id: 'puzzle', kind: 'puzzle', bg: bgMeadow, teacher: 'Guess the friend! Tap pieces to peek, then pick who it is.',
    rounds: [
      { who: 'pip', img: CAST.pip.img, hint: 'A little fox with a warm smile.' },
      { who: 'mia', img: CAST.mia.img, hint: 'A tiny mouse who loves the moon.' },
      { who: 'bella', img: CAST.bella.img, hint: 'A soft bunny who hops in flowers.' },
    ],
  },
  {
    id: 'roleplay-l1', kind: 'roleplay', bg: bgL1RoleplayFriends, teacher: 'Story time! Listen to the friends greet each other, then repeat each line.', cast: ['pip', 'mia', 'bella'],
    script: [
      { who: 'pip', line: 'Hello! I am Pip.' },
      { who: 'mia', line: 'Hi! My name is Mia.', repeat: true },
      { who: 'bella', line: 'Hello! I am Bella. Nice to meet you!', repeat: true },
      { who: 'pip', line: 'Nice to meet you too!', repeat: true },
    ],
  },
  {
    id: 'join-stage-l1', kind: 'join-stage', bg: bgGatherEmpty, teacher: 'Your turn! When it says YOU, say your name out loud!', cast: ['pip', 'mia', 'bella'],
    turns: [
      { who: 'pip', line: 'Hello! I am Pip.', bg: bgL1PipSolo },
      { who: 'mia', line: 'Hi! My name is Mia.', bg: bgL1MiaSolo },
      { who: 'bella', line: 'Hello! I am Bella.', bg: bgL1BellaSolo },
      { who: 'student', line: 'Hello! My name is ___.' },
      { who: 'pip', line: 'Nice to meet you!', bg: bgL1PipSolo },
    ],
  },
  {
    id: 'hello-doors-l1', kind: 'hello-doors', bg: bgHelloDoorsTree, teacher: 'Knock knock! Tap the right door, then say hello to your friend!', cast: ['pip', 'mia', 'bella'],
    rounds: [
      { target: 'pip', prompt: 'Knock knock! Where is Pip?', helloLine: 'Hello! My name is Pip.', echoLine: 'Hello, Pip!' },
      { target: 'mia', prompt: 'Knock knock! Where is Mia?', helloLine: 'Hello! My name is Mia.', echoLine: 'Hello, Mia!' },
      { target: 'bella', prompt: 'Knock knock! Where is Bella?', helloLine: 'Hello! My name is Bella.', echoLine: 'Hello, Bella!' },
      { target: 'mia', prompt: 'Knock again! Find Mia!', helloLine: 'Hello! My name is Mia.', echoLine: 'Hi, Mia!' },
      { target: 'pip', prompt: 'One more! Find Pip!', helloLine: 'Hello! My name is Pip.', echoLine: 'Hi, Pip!' },
    ],
  },
  { id: 'l1-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus time! Pick a color and tap your friends to paint them!', cast: ['pip', 'mia', 'bella'] },
  {
    id: 'l1-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! First, tap the sound. Then, stack the word!', letters: ['H', 'M', 'A', 'T'],
    tapRounds: [{ letter: 'H' }, { letter: 'M' }, { letter: 'H' }, { letter: 'M' }],
    words: [
      { word: 'HAT', emoji: '\u{1F3A9}' },
      { word: 'MAT', emoji: '\u{1F7EB}' },
      { word: 'HAM', emoji: '\u{1F953}' },
    ],
  },
  { id: 'l1-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Drag the letters into ABC order!', sequences: ['ABCD', 'EFGH', 'HIJK'] },
  {
    id: 'l1-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: "Everyone waves goodbye! Sing together and wave on every 'goodbye'.",
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-u1l1.mp3`,
    lineDurationsMs: [3560, 3840, 5340, 7322],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, forest friends', emotion: 'happy' },
      { who: 'pip', text: '\u{1F333} We said hello and waved again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand, it\'s time to go', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friends! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'finale', kind: 'finale', bg: bgBigTree, who: 'pip', line: 'You did it! You made three new friends! Hello, hello, hello!' },
];

/* =========================================================================
 * Lesson 2 — "The Name Carnival" (N + W sounds, cumulative H/M/N/W review)
 * ========================================================================= */

const bgNameCarnivalTitle = `${A}/scenes/bg-name-carnival-title.jpg`;
const bgNameCarnivalGate = `${A}/scenes/bg-name-carnival-gate.jpg`;
const bgMeetWillowGroup = `${A}/scenes/bg-meet-willow-group.jpg`;
const bgNameCarnivalBridge = `${A}/scenes/bg-name-carnival-bridge.jpg`;
const bgNameCarnivalNest = `${A}/scenes/bg-name-carnival-nest.jpg`;
const bgNameMicStage = `${A}/scenes/bg-name-mic-stage.jpg`;
const bgNameCarnivalStage = `${A}/scenes/bg-name-carnival-stage.jpg`;
const bgNameCarnivalSky = `${A}/scenes/bg-name-carnival-sky.jpg`;
// The original bg-willow-meadow.jpg was pure empty garden scenery with no
// characters at all -- broken for its actual uses (l2-roleplay-meet-
// willow's 4-character cast script, and l2-finale's "You met Willow!" line)
// since RoleplayScene positions speech bubbles assuming the characters are
// actually painted into the background at those relative positions. v2
// repainted the meadow with Pip/Mia/Bella/Willow spread left-to-right, but
// per direct user feedback the characters read as too small/hard to make
// out once shrunk down inside the classroom's embedded frame -- v4 is the
// same composition shot much closer (characters ~50% of frame height
// instead of ~25%) while keeping a true full-bleed painted background (an
// intermediate close-up attempt collapsed to a plain white void behind
// them, the classic "sticker on white" failure mode -- v4 explicitly
// re-describes sky/hills/fence filling the top and sides to avoid that).
const bgWillowMeadow = `${A}/scenes/bg-willow-meadow-v4.png`;

const itemWhat = `${A}/items/item-what.png`;
const itemWater = `${A}/items/item-water.png`;
const itemWind = `${A}/items/item-wind.png`;
const itemNut = `${A}/items/item-nut.png`;
const itemNose = `${A}/items/item-nose.png`;
const itemWave = `${A}/items/item-wave.png`;
const itemName = `${A}/items/item-name.png`;

export const comicPointForward = `${A}/props/comic-point-forward.png`;

export const LESSON_2_TITLE = 'The Name Carnival';
export const LESSON_2_OBJECTIVE = 'Ask and answer "What is your name?" while reviewing H, M, N, W sounds.';

export const LESSON_2_SCENES: Scene[] = [
  { id: 'l2-title', kind: 'title-card', bg: bgNameCarnivalTitle, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 2', title: 'The Name Carnival', subtitle: 'Ask names · answer names · win name tickets' },
  {
    id: 'l2-intro', kind: 'cinematic', bg: bgNameCarnivalGate, title: 'The Carnival Gate', subtitle: 'Every booth opens with one magic question.', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Welcome to the Name Carnival!' },
      { who: 'pip', line: 'To open a booth, ask: What is your name?' },
      { who: 'bella', line: 'Then listen: My name is Bella!' },
    ],
    cta: 'Open the gate!',
  },
  {
    id: 'l2-name-gate', kind: 'name-gate', bg: bgNameCarnivalGate, teacher: 'Teacher and student: tap a booth, ask the question, then listen to the answer.',
    rounds: [
      { who: 'pip', question: 'What is your name?', answer: 'My name is Pip!' },
      { who: 'mia', question: 'What is your name?', answer: 'My name is Mia!' },
      { who: 'bella', question: 'What is your name?', answer: 'My name is Bella!' },
    ],
  },
  {
    id: 'l2-meet-willow', kind: 'meet-group', bg: bgMeetWillowGroup, teacher: 'Tap Pip, Mia, and Bella one by one. Each time, repeat: What is your name? Then Willow answers — repeat her name!',
    askers: [
      { who: 'pip', xPct: 17, yPct: 62 },
      { who: 'mia', xPct: 40, yPct: 68 },
      { who: 'bella', xPct: 55, yPct: 66 },
    ],
    newcomer: { who: 'willow', xPct: 83, yPct: 60 },
    question: 'What is your name?', answer: 'My name is Willow!', phonics: '/w/ /w/ Willow!',
  },
  {
    id: 'l2-model-w', kind: 'sound-model', bg: bgNameCarnivalBridge, who: 'pip', letter: 'W', phoneme: '/w/', sound: 'wuh', teacher: 'At the water bridge, Pip models /w/ before practice.',
    anchors: [
      { word: 'What', emoji: '❓', img: itemWhat },
      { word: 'Water', emoji: '\u{1F4A7}', img: itemWater },
      { word: 'Wind', emoji: '\u{1F4A8}', img: itemWind },
    ],
  },
  { id: 'l2-trace-w', kind: 'trace', bg: bgNameCarnivalBridge, who: 'pip', letter: 'W', phoneme: '/w/', word: 'What', teacher: 'Trace the carnival ribbon W. /w/ /w/ What!' },
  {
    id: 'l2-model-n', kind: 'sound-model', bg: bgNameCarnivalNest, who: 'mia', prop: 'nest', letter: 'N', phoneme: '/n/', sound: 'nnn', teacher: 'Mia opens the nest corner. Listen first: /n/ /n/ Nut.',
    anchors: [
      { word: 'Nut', emoji: '\u{1F330}', img: itemNut },
      { word: 'Nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png` },
      { word: 'Nose', emoji: '\u{1F443}', img: itemNose },
    ],
  },
  { id: 'l2-trace-n', kind: 'trace', bg: bgNameCarnivalNest, who: 'mia', letter: 'N', phoneme: '/n/', word: 'Nut', teacher: 'Trace the cozy N. /n/ /n/ Nut!' },
  {
    id: 'l2-student-question', kind: 'voice-stage', bg: bgNameMicStage, teacher: 'Grab the mic! Ask each friend: What is your name? Then say: Nice to meet you too!', question: 'What is your name?', niceToMeet: true,
    rounds: [
      { who: 'mia', cue: 'Ask Mia!', answer: 'My name is Mia.' },
      { who: 'bella', cue: 'Ask Bella!', answer: 'My name is Bella.' },
      { who: 'willow', cue: 'Ask Willow!', answer: 'My name is Willow.' },
    ],
  },
  {
    id: 'l2-sort-nw', kind: 'sound-sort', bg: bgNameCarnivalBridge, teacher: 'Carnival sound toss! Listen and drag to /n/ or /w/.',
    targets: [
      { letter: 'N', phoneme: '/n/', who: 'mia' },
      { letter: 'W', phoneme: '/w/', who: 'pip' },
    ],
    items: [
      { word: 'nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png`, letter: 'N' },
      { word: 'water', emoji: '\u{1F4A7}', img: itemWater, letter: 'W' },
      { word: 'wind', emoji: '\u{1F32C}️', img: itemWind, letter: 'W' },
      { word: 'wave', emoji: '\u{1F30A}', img: itemWave, letter: 'W' },
      { word: 'nose', emoji: '\u{1F443}', img: itemNose, letter: 'N' },
      { word: 'nut', emoji: '\u{1F330}', img: itemNut, letter: 'N' },
    ],
  },
  {
    id: 'l2-sort-all', kind: 'sound-sort', bg: bgNameCarnivalBridge, teacher: 'Big sound mix-up! Drag each picture to /h/, /m/, /n/ or /w/.',
    targets: [
      { letter: 'H', phoneme: '/h/', who: 'pip' },
      { letter: 'M', phoneme: '/m/', who: 'mia' },
      { letter: 'N', phoneme: '/n/', who: 'bella' },
      { letter: 'W', phoneme: '/w/', who: 'willow' },
    ],
    items: [
      { word: 'hat', emoji: '\u{1F3A9}', img: `${A}/items/item-hat.png`, letter: 'H' },
      { word: 'house', emoji: '\u{1F3E0}', img: `${A}/items/item-house.png`, letter: 'H' },
      { word: 'mouse', emoji: '\u{1F42D}', img: `${A}/items/item-mouse.png`, letter: 'M' },
      { word: 'moon', emoji: '\u{1F319}', img: `${A}/items/item-moon.png`, letter: 'M' },
      { word: 'nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png`, letter: 'N' },
      { word: 'nose', emoji: '\u{1F443}', img: itemNose, letter: 'N' },
      { word: 'water', emoji: '\u{1F4A7}', img: itemWater, letter: 'W' },
      { word: 'wave', emoji: '\u{1F30A}', img: itemWave, letter: 'W' },
    ],
  },
  { id: 'l2-brick-crush', kind: 'brick-crush', bg: bgNameCarnivalSky, teacher: 'Brick Crush! Listen to the sound, then tap every brick with that letter.', who: 'pip', letters: ['H', 'M', 'N', 'W'], rows: 6, cols: 7, goal: 18, seconds: 60 },
  {
    id: 'l2-sound-pop', kind: 'sound-pop', bg: bgNameCarnivalSky, teacher: 'Balloon Letter Pop! Willow will call a letter. Pop only the balloons with that letter.', who: 'willow', goal: 8, seconds: 45,
    targets: [
      { letter: 'H', phoneme: '/h/' },
      { letter: 'N', phoneme: '/n/' },
    ],
    items: [
      { word: 'H', letter: 'H', emoji: 'H' }, { word: 'N', letter: 'N', emoji: 'N' }, { word: 'A', letter: 'A', emoji: 'A' },
      { word: 'B', letter: 'B', emoji: 'B' }, { word: 'C', letter: 'C', emoji: 'C' }, { word: 'D', letter: 'D', emoji: 'D' },
      { word: 'E', letter: 'E', emoji: 'E' }, { word: 'F', letter: 'F', emoji: 'F' }, { word: 'G', letter: 'G', emoji: 'G' },
      { word: 'I', letter: 'I', emoji: 'I' }, { word: 'K', letter: 'K', emoji: 'K' }, { word: 'L', letter: 'L', emoji: 'L' },
      { word: 'M', letter: 'M', emoji: 'M' }, { word: 'O', letter: 'O', emoji: 'O' }, { word: 'P', letter: 'P', emoji: 'P' },
      { word: 'R', letter: 'R', emoji: 'R' }, { word: 'S', letter: 'S', emoji: 'S' }, { word: 'T', letter: 'T', emoji: 'T' },
    ],
  },
  {
    id: 'l2-grand-build', kind: 'word-build', bg: bgNameCarnivalGate, teacher: 'Grand ticket round! Choose the first sound: H, M, N, or W.',
    rounds: [
      { word: 'name', blankIndex: 0, answer: 'N', choices: ['H', 'M', 'N', 'W'], img: itemName, emoji: '\u{1F3F7}️' },
      { word: 'what', blankIndex: 0, answer: 'W', choices: ['H', 'M', 'N', 'W'], img: itemWhat, emoji: '❓' },
      { word: 'water', blankIndex: 0, answer: 'W', choices: ['H', 'M', 'N', 'W'], img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'nest', blankIndex: 0, answer: 'N', choices: ['H', 'M', 'N', 'W'], img: `${A}/items/item-nest.png`, emoji: '\u{1FAB9}' },
      { word: 'moon', blankIndex: 0, answer: 'M', choices: ['H', 'M', 'N', 'W'], img: `${A}/items/item-moon.png`, emoji: '\u{1F319}' },
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['H', 'M', 'N', 'W'], img: `${A}/items/item-hat.png`, emoji: '\u{1F3A9}' },
    ],
  },
  {
    id: 'l2-dash-carnival', kind: 'dash', bg: bgNameCarnivalStage, teacher: 'Willow Dash! Fly through the carnival and tap only W words. Get 6 rings!', who: 'willow', targetLetter: 'W', targetPhoneme: '/w/', goal: 6, seconds: 40,
    items: [
      { word: 'water', letter: 'W', img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'wind', letter: 'W', img: itemWind, emoji: '\u{1F32C}️' },
      { word: 'wave', letter: 'W', img: itemWave, emoji: '\u{1F30A}' },
      { word: 'what', letter: 'W', img: itemWhat, emoji: '❓' },
      { word: 'name', letter: 'N', img: itemName, emoji: '\u{1F3F7}️' },
      { word: 'nest', letter: 'N', img: `${A}/items/item-nest.png`, emoji: '\u{1FAB9}' },
      { word: 'hat', letter: 'H', img: `${A}/items/item-hat.png`, emoji: '\u{1F3A9}' },
      { word: 'milk', letter: 'M', img: `${A}/items/item-milk.png`, emoji: '\u{1F95B}' },
    ],
  },
  {
    id: 'l2-roleplay-meet-willow', kind: 'roleplay', bg: bgWillowMeadow, teacher: 'Story time! Pip, Mia and Bella meet Willow. Listen, then repeat after each friend.', cast: ['pip', 'mia', 'bella', 'willow'],
    script: [
      { who: 'pip', line: 'Hello!', repeat: true },
      { who: 'willow', line: 'Hello!' },
      { who: 'pip', line: 'What is your name?', repeat: true },
      { who: 'willow', line: 'My name is Willow.' },
      { who: 'willow', line: 'What is your name?' },
      { who: 'pip', line: 'My name is Pip.', repeat: true },
      { who: 'mia', line: 'My name is Mia.', repeat: true },
      { who: 'bella', line: 'My name is Bella.', repeat: true },
      { who: 'willow', line: 'Nice to meet you!' },
      { who: 'pip', line: 'Nice to meet you, Willow!', repeat: true },
      { who: 'willow', line: 'Goodbye!' },
      { who: 'pip', line: 'Goodbye, Willow! See you soon!', repeat: true },
    ],
  },
  {
    id: 'l2-join-stage', kind: 'join-stage', bg: bgNameCarnivalStage, teacher: 'Your turn on stage! Drag your camera onto the stage, then take each turn.', cast: ['pip', 'mia', 'bella', 'willow'],
    turns: [
      { who: 'pip', line: 'Hello!' },
      { who: 'student', line: 'Hello!' },
      { who: 'willow', line: 'What is your name?' },
      { who: 'student', line: 'My name is ___.' },
      { who: 'mia', line: 'Nice to meet you!' },
      { who: 'student', line: 'Nice to meet you!' },
      { who: 'bella', line: 'Goodbye!' },
      { who: 'student', line: 'Goodbye!' },
    ],
  },
  {
    id: 'l2-friend-pop', kind: 'friend-pop', bg: bgNameCarnivalSky, teacher: 'Whack-a-Friend! Tap the friend I call from the tents.', cast: ['pip', 'mia', 'bella', 'willow'],
    rounds: [
      { target: 'willow', prompt: 'Where is Willow?' },
      { target: 'mia', prompt: 'Where is Mia?' },
      { target: 'pip', prompt: 'Where is Pip?' },
      { target: 'bella', prompt: 'Where is Bella?' },
      { target: 'willow', prompt: 'Find Willow again!' },
    ],
  },
  { id: 'l2-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus round! Choose a color and paint your friends!', cast: ['pip', 'mia', 'bella', 'willow'] },
  {
    id: 'l2-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the word!', letters: ['H', 'M', 'N', 'W', 'A', 'I', 'T'],
    tapRounds: [{ letter: 'H' }, { letter: 'M' }, { letter: 'N' }, { letter: 'W' }],
    words: [
      { word: 'HAT', emoji: '\u{1F3A9}' },
      { word: 'MAN', emoji: '\u{1F9CD}' },
      { word: 'WIN', emoji: '\u{1F3C6}' },
    ],
  },
  { id: 'l2-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Drag the letters into ABC order!', sequences: ['EFGH', 'IJKL', 'MNOP'] },
  {
    id: 'l2-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to Willow and all the friends! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-u1l2.mp3`,
    lineDurationsMs: [3200, 4820, 3720, 8322],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, carnival fun', emotion: 'happy' },
      { who: 'pip', text: '\u{1F3AA} My name is Pip, what\'s your name?', emotion: 'happy' },
      { who: 'mia', text: '\u{1F39F}️ We said our names, now wave goodbye', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friends! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l2-finale', kind: 'finale', bg: bgWillowMeadow, who: 'willow', line: 'You did it! You met Willow! What is your name? My name is Willow!' },
];

/* =========================================================================
 * Lesson 3 — "The Sunshine Meadow" (S + A sounds, cumulative H/M/N/W/S/A)
 * ========================================================================= */

const itemStar = `${A}/items/prop-star.png`;
// Replaced from crude hand-coded placeholder SVGs (flat triangle-ring sun,
// blob apple, blob alligator — jarringly plain next to every other item's
// detailed illustration) with real generated art matching the rest of the
// unit's style. These 5 constants are reused across Lessons 3-6 AND every
// Unit 2 color lesson (apple=red, sun=yellow are the canonical color
// examples there), so fixing the constant fixes every occurrence at once.
const itemSun = `${A}/items/item-sun.png`;
const itemSnake = `${A}/items/item-snake.png`;
const itemApple = `${A}/items/item-apple.png`;
const itemAnt = `${A}/items/item-ant.png`;
const itemAlligator = `${A}/items/item-alligator.png`;
const itemCat = `${A}/items/item-cat.png`;
const itemSad = `${A}/items/item-sad.png`;

const bgFeelingsTitle = `${A}/scenes/bg-feelings-title.jpg`;
const bgFeelingsMeadow = `${A}/scenes/bg-feelings-meadow.jpg`;
const bgFeelingsCalm = `${A}/scenes/bg-feelings-calm.jpg`;
const bgFeelingsFair = `${A}/scenes/bg-feelings-fair.jpg`;
const bgMoodMonsters = `${A}/scenes/bg-mood-monsters.jpg`;
const bgFeelingsStory = `${A}/scenes/bg-feelings-story.jpg`;

export const LESSON_3_TITLE = 'How Are You?';
export const LESSON_3_OBJECTIVE = 'Ask and answer "How are you?", say I am / He is / She is happy, sad, or angry, while learning the /æ/ and /s/ sounds.';

export const LESSON_3_SCENES: Scene[] = [
  { id: 'l3-title', kind: 'title-card', bg: bgFeelingsTitle, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 3 · Feelings', title: 'How Are You?', subtitle: '\u{1F60A} Happy · \u{1F622} Sad · \u{1F620} Angry — today we talk about EMOTIONS!' },
  {
    id: 'l3-song', kind: 'roleplay', bg: bgFeelingsMeadow, cast: ['pip', 'mia', 'bella', 'leo'],
    teacher: "Sing along! Clap on 'happy', hug yourself on 'sad', stomp on 'angry'. Repeat each feeling with the student.",
    script: [
      { who: 'pip', line: 'How are you? How are you?' },
      { who: 'mia', line: 'I am happy — yes I am! Ha ha ha!', repeat: true },
      { who: 'pip', line: 'How are you? How are you?' },
      { who: 'bella', line: 'I am sad — boo hoo hoo.', repeat: true },
      { who: 'pip', line: 'How are you? How are you?' },
      { who: 'leo', line: 'I am angry — grrr grrr grrr!', repeat: true },
      { who: 'pip', line: 'Happy, sad, and angry too —' },
      { who: 'mia', line: 'Every feeling is okay with you!' },
    ],
  },
  {
    id: 'l3-vocab-match', kind: 'feelings-tap', bg: bgFeelingsMeadow, teacher: 'Tap each friend — a card pops up! Repeat the feeling with the student.',
    cast: [
      { who: 'pip', emotion: 'happy', label: 'Happy.' },
      { who: 'mia', emotion: 'sad', label: 'Sad.' },
      { who: 'bella', emotion: 'angry', label: 'Angry.' },
    ],
  },
  {
    id: 'l3-vocab-wheel', kind: 'feelings-wheel', bg: bgFeelingsMeadow, teacher: 'Spin the wheel! When it stops, YOU say the feeling. No hints — you name it!',
    slots: [
      { who: 'mia', emotion: 'happy', label: 'Happy' },
      { who: 'pip', emotion: 'angry', label: 'Angry' },
      { who: 'bella', emotion: 'sad', label: 'Sad' },
    ],
  },
  {
    id: 'l3-feeling-stage', kind: 'friend-pop', bg: bgFeelingsCalm, teacher: 'Say the feeling word. Student listens and taps the friend who feels that way.', cast: ['mia', 'bella', 'leo', 'pip'],
    rounds: [
      { target: 'mia', emotion: 'happy', prompt: 'Happy \u{1F60A}' },
      { target: 'pip', emotion: 'happy', prompt: 'Happy \u{1F60A}' },
      { target: 'bella', emotion: 'sad', prompt: 'Sad \u{1F622}' },
      { target: 'leo', emotion: 'angry', prompt: 'Angry \u{1F620}' },
      { target: 'mia', emotion: 'sad', prompt: 'Sad \u{1F622}' },
      { target: 'pip', emotion: 'angry', prompt: 'Angry \u{1F620}' },
    ],
  },
  {
    id: 'l3-i-am-demo', kind: 'x-is-feeling', bg: bgFeelingsMeadow, teacher: "Demonstration: 'I am ___'. Each friend models the first-person sentence. Student listens, then taps the card to repeat.",
    rounds: [
      { who: 'pip', emotion: 'happy', sentence: 'I am happy!' },
      { who: 'mia', emotion: 'sad', sentence: 'I am sad.' },
      { who: 'leo', emotion: 'angry', sentence: 'I am angry!' },
    ],
  },
  {
    id: 'l3-feelings-dice', kind: 'feelings-dice', bg: bgFeelingsMeadow, teacher: "Free practice! Roll → see the friend. Student says the full sentence alone: 'I am happy / sad / angry.' No model, no help.",
    rounds: [
      { who: 'pip', emotion: 'happy', sentence: 'I am happy!' },
      { who: 'mia', emotion: 'sad', sentence: 'I am sad.' },
      { who: 'bella', emotion: 'angry', sentence: 'I am angry!' },
      { who: 'leo', emotion: 'happy', sentence: 'I am happy!' },
      { who: 'mia', emotion: 'angry', sentence: 'I am angry!' },
      { who: 'pip', emotion: 'sad', sentence: 'I am sad.' },
    ],
  },
  {
    id: 'l3-who-feels-it', kind: 'who-said-it', bg: bgFeelingsFair, teacher: 'Tap a friend on the stage. Hear their feeling and say it with them!',
    rounds: [
      { line: 'Mia is happy.', who: 'mia', emotion: 'happy' },
      { line: 'Bella is sad.', who: 'bella', emotion: 'sad' },
      { line: 'Leo is angry.', who: 'leo', emotion: 'angry' },
      { line: 'Pip is happy.', who: 'pip', emotion: 'happy' },
    ],
  },
  {
    id: 'l3-feed-monsters', kind: 'feed-monsters', bg: bgMoodMonsters, teacher: 'Feed the Mood Monsters! Listen, then drag the friend to the monster that feels the same.',
    rounds: [
      { who: 'mia', emotion: 'happy', sentence: 'Mia is happy. Feed the happy monster!' },
      { who: 'bella', emotion: 'sad', sentence: 'Bella is sad. Feed the sad monster!' },
      { who: 'leo', emotion: 'angry', sentence: 'Leo is angry. Feed the angry monster!' },
      { who: 'pip', emotion: 'happy', sentence: 'Pip is happy. Feed the happy monster!' },
      { who: 'leo', emotion: 'sad', sentence: 'Leo is sad. Feed the sad monster!' },
      { who: 'bella', emotion: 'angry', sentence: 'Bella is angry. Feed the angry monster!' },
    ],
  },
  {
    id: 'l3-model-a', kind: 'sound-model', bg: bgFeelingsMeadow, who: 'leo', letter: 'A', phoneme: '/æ/', sound: 'aaa', teacher: 'Leo roars the short A sound. Listen first: /æ/ /æ/ apple.',
    anchors: [
      { word: 'Apple', emoji: '\u{1F34E}', img: itemApple },
      { word: 'Ant', emoji: '\u{1F41C}', img: itemAnt },
      { word: 'Cat', emoji: '\u{1F431}', img: itemCat },
    ],
  },
  { id: 'l3-trace-a', kind: 'trace', bg: bgFeelingsMeadow, who: 'leo', letter: 'A', phoneme: '/æ/', word: 'Apple', teacher: 'Trace the sunny A. /æ/ /æ/ Apple!' },
  {
    id: 'l3-model-s', kind: 'sound-model', bg: bgFeelingsMeadow, who: 'mia', letter: 'S', phoneme: '/s/', sound: 'sss', teacher: 'Mia hisses the /s/ sound. Listen: /s/ /s/ Sad.',
    anchors: [
      { word: 'Sad', emoji: '\u{1F622}', img: itemSad },
      { word: 'Sun', emoji: '☀️', img: itemSun },
      { word: 'Star', emoji: '⭐', img: itemStar },
    ],
  },
  { id: 'l3-trace-s', kind: 'trace', bg: bgFeelingsMeadow, who: 'mia', letter: 'S', phoneme: '/s/', word: 'Sun', teacher: 'Trace the wavy S. /s/ /s/ Sun!' },
  {
    id: 'l3-sort-as', kind: 'sound-sort', bg: bgFeelingsMeadow, teacher: 'Feelings sound toss! Listen and drag to /æ/ or /s/.',
    targets: [
      { letter: 'A', phoneme: '/æ/', who: 'leo' },
      { letter: 'S', phoneme: '/s/', who: 'mia' },
    ],
    items: [
      { word: 'apple', emoji: '\u{1F34E}', img: itemApple, letter: 'A' },
      { word: 'sun', emoji: '☀️', img: itemSun, letter: 'S' },
      { word: 'star', emoji: '⭐', img: itemStar, letter: 'S' },
      { word: 'sad', emoji: '\u{1F622}', img: itemSad, letter: 'S' },
      { word: 'ant', emoji: '\u{1F41C}', img: itemAnt, letter: 'A' },
      { word: 'cat', emoji: '\u{1F431}', img: itemCat, letter: 'A' },
    ],
  },
  {
    id: 'l3-sound-pop', kind: 'sound-pop', bg: bgFeelingsTitle, teacher: 'Balloon Letter Pop! Leo will call a letter. Pop only that letter!', who: 'leo', goal: 8, seconds: 45,
    targets: [
      { letter: 'A', phoneme: '/æ/' },
      { letter: 'S', phoneme: '/s/' },
    ],
    items: [
      { word: 'A', letter: 'A', emoji: 'A' },
      { word: 'S', letter: 'S', emoji: 'S' },
      { word: 'H', letter: 'H', emoji: 'H' },
      { word: 'M', letter: 'M', emoji: 'M' },
      { word: 'N', letter: 'N', emoji: 'N' },
      { word: 'W', letter: 'W', emoji: 'W' },
      { word: 'B', letter: 'B', emoji: 'B' },
      { word: 'T', letter: 'T', emoji: 'T' },
    ],
  },
  {
    id: 'l3-grand-build', kind: 'word-build', bg: bgFeelingsMeadow, teacher: 'Grand feelings round! Choose the first sound: A, S, H, or M.',
    rounds: [
      { word: 'apple', blankIndex: 0, answer: 'A', choices: ['A', 'S', 'H', 'M'], img: itemApple, emoji: '\u{1F34E}' },
      { word: 'sun', blankIndex: 0, answer: 'S', choices: ['A', 'S', 'H', 'M'], img: itemSun, emoji: '☀️' },
      { word: 'ant', blankIndex: 0, answer: 'A', choices: ['A', 'S', 'H', 'M'], img: itemAnt, emoji: '\u{1F41C}' },
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['A', 'S', 'H', 'M'], img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'moon', blankIndex: 0, answer: 'M', choices: ['A', 'S', 'H', 'M'], img: itemMoon, emoji: '\u{1F319}' },
    ],
  },
  {
    id: 'l3-x-is-feeling', kind: 'x-is-feeling', bg: bgFeelingsMeadow, teacher: 'Look and listen. Then repeat: X is happy, X is sad, X is angry.',
    rounds: [
      { who: 'mia', emotion: 'happy', sentence: 'Mia is happy.' },
      { who: 'leo', emotion: 'angry', sentence: 'Leo is angry.' },
      { who: 'bella', emotion: 'sad', sentence: 'Bella is sad.' },
      { who: 'pip', emotion: 'happy', sentence: 'Pip is happy.' },
      { who: 'leo', emotion: 'sad', sentence: 'Leo is sad.' },
      { who: 'mia', emotion: 'angry', sentence: 'Mia is angry.' },
    ],
  },
  {
    id: 'l3-he-she-model', kind: 'he-she-model', bg: bgFeelingsMeadow, teacher: "Boys are HE. Girls are SHE. Model twice: 'Mia is sad. She is sad.' Then have the student repeat both lines.",
    rounds: [
      { who: 'mia', emotion: 'sad', pronoun: 'She', sentence: 'Mia is sad. She is sad.' },
      { who: 'pip', emotion: 'happy', pronoun: 'He', sentence: 'Pip is happy. He is happy.' },
      { who: 'bella', emotion: 'happy', pronoun: 'She', sentence: 'Bella is happy. She is happy.' },
      { who: 'leo', emotion: 'angry', pronoun: 'He', sentence: 'Leo is angry. He is angry.' },
      { who: 'mia', emotion: 'happy', pronoun: 'She', sentence: 'Mia is happy. She is happy.' },
      { who: 'leo', emotion: 'sad', pronoun: 'He', sentence: 'Leo is sad. He is sad.' },
    ],
  },
  {
    id: 'l3-he-she-sort', kind: 'he-she-sort', bg: bgFeelingsMeadow, teacher: "Listen! The character says 'I am ___'. Girls go into the SHE box. Boys go into the HE box. Drag each friend to the right pronoun.",
    rounds: [
      { who: 'mia', emotion: 'sad', pronoun: 'She' },
      { who: 'pip', emotion: 'happy', pronoun: 'He' },
      { who: 'bella', emotion: 'happy', pronoun: 'She' },
      { who: 'leo', emotion: 'angry', pronoun: 'He' },
      { who: 'willow', emotion: 'happy', pronoun: 'She' },
      { who: 'leo', emotion: 'sad', pronoun: 'He' },
    ],
  },
  {
    id: 'l3-he-she-say', kind: 'he-she-say', bg: bgFeelingsMeadow, teacher: 'Look at the friend and the feeling card. Say it! Is it HE or SHE? Then tap to check.',
    rounds: [
      { who: 'mia', emotion: 'angry', pronoun: 'She' },
      { who: 'pip', emotion: 'sad', pronoun: 'He' },
      { who: 'leo', emotion: 'happy', pronoun: 'He' },
      { who: 'bella', emotion: 'sad', pronoun: 'She' },
      { who: 'leo', emotion: 'angry', pronoun: 'He' },
      { who: 'mia', emotion: 'happy', pronoun: 'She' },
    ],
  },
  {
    id: 'l3-feeling-quiz', kind: 'feeling-quiz', bg: bgFeelingsMeadow, teacher: "Emotion recognition only. Say: 'Who is happy?' — the student taps whichever friend is showing that feeling. Ignore character names.",
    rounds: [
      { who: 'pip', emotion: 'happy', prompt: 'How does Pip feel?' },
      { who: 'mia', emotion: 'sad', prompt: 'How does Mia feel?' },
      { who: 'leo', emotion: 'angry', prompt: 'How does Leo feel?' },
      { who: 'bella', emotion: 'happy', prompt: 'How does Bella feel?' },
      { who: 'mia', emotion: 'angry', prompt: 'How does Mia feel?' },
      { who: 'bella', emotion: 'sad', prompt: 'How does Bella feel?' },
    ],
  },
  {
    id: 'l3-model-how-are-you', kind: 'roleplay', bg: bgFeelingsMeadow, teacher: "Look and listen! Bella asks Pip: 'How are you?' Pip answers: 'I am happy.' Then the student repeats BOTH lines. Do the same for the sad and angry turns before the student's own turn.", cast: ['pip', 'bella'],
    script: [
      { who: 'bella', line: 'Hi, Pip! How are you?', repeat: true },
      { who: 'pip', line: 'I am happy!', repeat: true },
      { who: 'bella', line: 'Hi, Pip! How are you?', repeat: true },
      { who: 'pip', line: 'I am sad.', repeat: true },
      { who: 'bella', line: 'Hi, Pip! How are you?', repeat: true },
      { who: 'pip', line: 'I am angry!', repeat: true },
    ],
  },
  {
    id: 'l3-i-am-feeling', kind: 'i-am-feeling', bg: bgFeelingsMeadow, teacher: 'Your turn! Pip asks: How are you? Choose your feeling, then say: I am ___.', asker: 'pip',
    rounds: [
      { emotion: 'happy', label: 'Happy' },
      { emotion: 'sad', label: 'Sad' },
      { emotion: 'angry', label: 'Angry' },
      { emotion: 'happy', label: 'Happy' },
    ],
  },
  {
    id: 'l3-roleplay-feelings', kind: 'roleplay', bg: bgFeelingsStory, teacher: "Meet Leo! Only Leo introduces his name (new friend). Then Leo asks 'How are you?' to each friend. Finally Pip asks Leo — Leo says 'I am angry!' Student repeats every line.", cast: ['pip', 'mia', 'bella', 'leo'],
    script: [
      { who: 'pip', line: "Hello! What's your name?", repeat: true },
      { who: 'leo', line: 'Hello! My name is Leo.', repeat: true },
      { who: 'pip', line: 'Nice to meet you, Leo!', repeat: true },
      { who: 'leo', line: 'Hi, Mia! How are you?', repeat: true },
      { who: 'mia', line: 'I am happy!', repeat: true },
      { who: 'leo', line: 'Hi, Bella! How are you?', repeat: true },
      { who: 'bella', line: 'I am sad.', repeat: true },
      { who: 'leo', line: 'Hi, Pip! How are you?', repeat: true },
      { who: 'pip', line: 'I am happy!', repeat: true },
      { who: 'pip', line: 'And you, Leo? How are you?', repeat: true },
      { who: 'leo', line: 'I am angry! Grrr!', repeat: true },
      { who: 'mia', line: "It's okay, Leo.", repeat: true },
      { who: 'pip', line: 'Goodbye, friends!', repeat: true },
    ],
  },
  {
    id: 'l3-feelings-bingo', kind: 'feelings-bingo', bg: bgFeelingsMeadow, teacher: 'Feelings Bingo! Listen carefully, then tap the friend who feels that way!',
    tiles: [
      { who: 'pip', emotion: 'happy' },
      { who: 'mia', emotion: 'sad' },
      { who: 'bella', emotion: 'angry' },
      { who: 'leo', emotion: 'happy' },
      { who: 'pip', emotion: 'angry' },
      { who: 'mia', emotion: 'happy' },
    ],
    rounds: [
      { who: 'mia', emotion: 'sad', prompt: 'Find sad Mia!' },
      { who: 'bella', emotion: 'angry', prompt: 'Find angry Bella!' },
      { who: 'leo', emotion: 'happy', prompt: 'Find happy Leo!' },
      { who: 'pip', emotion: 'angry', prompt: 'Find angry Pip!' },
    ],
  },
  { id: 'l3-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus time! Pick a color and paint your friends!', cast: ['pip', 'mia', 'bella', 'leo'] },
  {
    id: 'l3-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the /a/ sound, then stack the word!', letters: ['A', 'H', 'M', 'T', 'S', 'D'],
    tapRounds: [{ letter: 'A' }, { letter: 'M' }, { letter: 'H' }, { letter: 'A' }],
    words: [
      { word: 'HAT', emoji: '\u{1F3A9}' },
      { word: 'MAT', emoji: '\u{1F7EB}' },
      { word: 'SAD', emoji: '\u{1F622}' },
    ],
  },
  { id: 'l3-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Put the letters in ABC order!', sequences: ['KLMN', 'MNOP', 'PQRS'] },
  {
    id: 'l3-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to your feelings friends! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-u1l3.mp3`,
    lineDurationsMs: [4340, 3580, 4860, 7282],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, how are you?', emotion: 'happy' },
      { who: 'pip', text: '\u{1F60A} Happy, sad and angry too', emotion: 'happy' },
      { who: 'mia', text: '\u{1F49B} Every feeling is okay', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friends! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l3-finale', kind: 'finale', bg: bgMeadow, who: 'leo', line: 'You did it! You met Leo and shared your feelings! How are you? I am happy!' },
];

/* =========================================================================
 * Lesson 4 — "The Big Chat Tree" (Let's Talk! — full conversation review,
 * no new letters: cumulative H/M/N/W/S/A)
 * ========================================================================= */

export const LESSON_4_TITLE = "Bella's Birthday!";
export const LESSON_4_OBJECTIVE = 'Ask and answer "How old are you?", count 1-10, and learn the /b/ and /t/ sounds.';

const bgL4Party = `${A}/scenes/bg-l4-birthday-party.jpg`;
const bgL4BellaFive = `${A}/scenes/bg-l4-bella-five.jpg`;
const bgL4MiaSix = `${A}/scenes/bg-l4-mia-six.jpg`;
const bgL4LeoSeven = `${A}/scenes/bg-l4-leo-seven.jpg`;
const bgL4WillowFour = `${A}/scenes/bg-l4-willow-four.jpg`;
const bgL4PipSix = `${A}/scenes/bg-l4-pip-six.jpg`;
const bgL4PlainParty = `${A}/scenes/bg-l4-plain-party.jpg`;
const bgL4CakeStage = `${A}/scenes/bg-l4-cake-stage.jpg`;
const bgL4PlainSky = `${A}/scenes/bg-l4-plain-sky.jpg`;
const bgL4CloudSky = `${A}/scenes/bg-l4-cloud-sky.jpg`;
const bgL4AgeFair = `${A}/scenes/bg-l4-age-fair.jpg`;
const itemBag = `${A}/items/item-bag.png`;
const itemBallL4 = `${A}/items/item-ball-kawaii.png`;
const itemBye = `${A}/items/item-bye.png`;
const itemTen = `${A}/items/item-ten.png`;
const itemToy = `${A}/items/item-toy.png`;
const itemTwo = `${A}/items/item-two.png`;

export const LESSON_4_SCENES: Scene[] = [
  { id: 'l4-title', kind: 'title-card', bg: bgL4Party, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 4 · Birthday', title: "Bella's Birthday!", subtitle: '\u{1F382} How old are you? · \u{1F44B} Goodbye! — party with Pip, Mia, Bella & Leo!' },
  { id: 'l4-arrive', kind: 'meet', focus: ['birthday'], bg: bgL4Party, who: 'pip', teacher: 'Pip runs to Bella’s party. Wave hello and repeat with Pip!', line: 'Hello, friends! Today is Bella’s birthday!', repeat: 'Hello, friends!' },
  { id: 'l4-bella-age', kind: 'meet', focus: ['five'], bg: bgL4BellaFive, who: 'bella', teacher: 'Bella is FIVE today! Repeat with Bella: I am five.', line: 'Hello! I am Bella. I am five!', repeat: 'I am five.' },
  { id: 'l4-mia-age', kind: 'meet', focus: ['six'], bg: bgL4MiaSix, who: 'mia', teacher: 'Mia is SIX! Repeat with Mia: I am six.', line: 'Hi! I am Mia. I am six!', repeat: 'I am six.' },
  { id: 'l4-leo-age', kind: 'meet', focus: ['seven'], bg: bgL4LeoSeven, who: 'leo', teacher: 'Leo is SEVEN! Repeat with Leo: I am seven.', line: 'Hi! I am Leo. I am seven!', repeat: 'I am seven.' },
  { id: 'l4-willow-age', kind: 'meet', focus: ['four'], bg: bgL4WillowFour, who: 'willow', teacher: 'Willow is FOUR! Repeat with Willow: I am four.', line: 'Hello! I am Willow. I am four!', repeat: 'I am four.' },
  { id: 'l4-pip-age', kind: 'meet', focus: ['six'], bg: bgL4PipSix, who: 'pip', teacher: 'Pip is SIX! Repeat with Pip: I am six.', line: 'Hi friends! I am Pip. I am six!', repeat: 'I am six.' },
  { id: 'l4-echo-question', kind: 'echo', bg: bgL4Party, who: 'pip', teacher: 'Say it with Pip! Point to a friend and ask the big question.', word: 'How old are you?', hearWord: 'How old are you?' },
  { id: 'l4-echo-i-am-five', kind: 'echo', bg: bgL4Party, who: 'bella', teacher: 'Bella answers. Repeat two times, then say YOUR age.', word: 'I am five.', hearWord: 'I am five.' },
  { id: 'l4-numbers-learn', kind: 'numbers-learn', bg: bgL4PlainParty, who: 'pip', from: 1, to: 10, teacher: "Let's count together! Tap each number to hear Pip say it. Press Next when the student can say them all." },
  { id: 'l4-numbers-review', kind: 'numbers-review', bg: bgL4PlainParty, who: 'pip', from: 1, to: 10, teacher: 'Number-tap game! Tap the number Pip calls out.' },
  {
    id: 'l4-age-pop', kind: 'candle-cake', bg: bgL4CakeStage, who: 'bella', teacher: 'Bella’s cake needs candles! Listen to the age, then tap the cake to add that many candles. \u{1F382}',
    rounds: [
      { asker: 'bella', target: 5, prompt: 'I am FIVE! Tap FIVE candles on my cake!', celebrate: 'Five candles! I am five!' },
      { asker: 'mia', target: 6, prompt: 'I am SIX! Tap SIX candles for Mia!', celebrate: 'Six candles! I am six!' },
      { asker: 'pip', target: 6, prompt: 'I am SIX too! Give Pip SIX candles!', celebrate: 'Six candles! I am six!' },
      { asker: 'pip', target: 0, isStudent: true, prompt: 'Your turn! How old are you? Tap your age, then put candles on YOUR cake and blow!', celebrate: 'Happy birthday to YOU!' },
    ],
  },
  { id: 'l4-count-balloons', kind: 'count-balloons', bg: bgL4PlainSky, who: 'pip', total: 10, teacher: 'Ten sticker balloons floated up! Pop them ONE by ONE and count with Pip!' },
  {
    id: 'l4-age-balloons', kind: 'age-balloons', bg: bgL4PlainSky, teacher: 'Each friend is holding balloons. Tap a friend! Count the balloons, then say: "{Name} is {number}!"',
    friends: [
      { who: 'willow', age: 3 },
      { who: 'bella', age: 5 },
      { who: 'mia', age: 6 },
      { who: 'leo', age: 7 },
    ],
  },
  {
    id: 'l4-age-sentence-match', kind: 'age-sentence-match', bg: bgL4PlainSky, teacher: 'Match each friend to their sentence! Listen, then grab and drag the card to the friend it belongs to.',
    friends: [
      { who: 'willow', age: 3 },
      { who: 'bella', age: 5 },
      { who: 'mia', age: 6 },
      { who: 'leo', age: 7 },
    ],
  },
  {
    id: 'l4-meet-greet', kind: 'meet-greet', bg: bgL4CloudSky, teacher: 'One friend at a time comes on stage. Ask their name, their age, then say nice to meet you.',
    friends: [
      { who: 'bella', age: 5 },
      { who: 'mia', age: 6 },
      { who: 'leo', age: 7 },
      { who: 'willow', age: 3 },
    ],
  },
  {
    id: 'l4-age-quiz', kind: 'age-quiz', bg: bgL4Party, teacher: 'Tap the wobbly present! Ask "How old are you?" then guess the candles. At the end — tap YOUR own age!',
    friends: [
      { who: 'bella', age: 5 },
      { who: 'mia', age: 6 },
      { who: 'leo', age: 7 },
      { who: 'willow', age: 3 },
    ],
    studentAges: [3, 4, 5, 6, 7],
  },
  {
    id: 'l4-age-mic', kind: 'join-stage', bg: bgNameMicStage, teacher: 'Live Stage! Read each teacher line out loud — the student answers into the mic, then tap the check.', cast: [],
    turns: [
      { who: 'teacher', line: 'How old are you?' },
      { who: 'student', line: 'I am ___ years old.' },
      { who: 'teacher', line: 'Wow! Nice!' },
      { who: 'student', line: 'How old are you?' },
      { who: 'teacher', line: 'I am ___ years old!' },
      { who: 'student', line: 'Nice to meet you!' },
    ],
  },
  {
    id: 'l4-birthday-song', kind: 'roleplay', bg: bgL4Party, cast: ['pip', 'mia', 'leo', 'bella'],
    teacher: 'Everyone sings to Bella! Clap on every line. At the end, a big cheer: Happy birthday, Bella!',
    script: [
      { who: 'pip', line: '\u{1F382} Happy birthday to you' },
      { who: 'mia', line: '\u{1F388} Happy birthday to you' },
      { who: 'leo', line: '\u{1F389} Happy birthday dear Bella' },
      { who: 'pip', line: '\u{1F381} Happy birthday to you!' },
      { who: 'bella', line: '\u{1F973} Yaaay! Happy birthday to me!' },
    ],
  },
  {
    id: 'l4-model-b', kind: 'sound-model', bg: bgL4Party, who: 'bella', letter: 'B', phoneme: '/b/', sound: 'buh', teacher: 'Bella bounces the /b/ sound! Listen first: /b/ /b/ Bag. /b/ /b/ Ball.',
    anchors: [
      { word: 'Bag', emoji: '\u{1F392}', img: itemBag },
      { word: 'Ball', emoji: '⚽', img: itemBallL4 },
      { word: 'Bye', emoji: '\u{1F44B}', img: itemBye },
    ],
  },
  { id: 'l4-trace-b', kind: 'trace', bg: bgL4Party, who: 'bella', letter: 'B', phoneme: '/b/', word: 'Ball', teacher: 'Trace the bouncy B. /b/ /b/ Ball!' },
  {
    id: 'l4-model-t', kind: 'sound-model', bg: bgL4Party, who: 'leo', letter: 'T', phoneme: '/t/', sound: 'tuh', teacher: 'Leo taps the /t/ sound! Listen first: /t/ /t/ Two. /t/ /t/ Ten.',
    anchors: [
      { word: 'Two', emoji: '2\u{FE0F}\u{20E3}', img: itemTwo },
      { word: 'Ten', emoji: '\u{1F51F}', img: itemTen },
      { word: 'Toy', emoji: '\u{1F9F8}', img: itemToy },
    ],
  },
  { id: 'l4-trace-t', kind: 'trace', bg: bgL4Party, who: 'leo', letter: 'T', phoneme: '/t/', word: 'Two', teacher: 'Trace the tall T. /t/ /t/ Two!' },
  {
    id: 'l4-sound-pop', kind: 'sound-pop', bg: bgL4AgeFair, teacher: 'Balloon Letter Pop! Bella will call a letter. Pop only that letter!', who: 'bella', goal: 8, seconds: 45,
    targets: [
      { letter: 'B', phoneme: '/b/' },
      { letter: 'T', phoneme: '/t/' },
    ],
    items: [
      { word: 'B', letter: 'B', emoji: 'B' },
      { word: 'T', letter: 'T', emoji: 'T' },
      { word: 'A', letter: 'A', emoji: 'A' },
      { word: 'S', letter: 'S', emoji: 'S' },
      { word: 'H', letter: 'H', emoji: 'H' },
      { word: 'M', letter: 'M', emoji: 'M' },
      { word: 'N', letter: 'N', emoji: 'N' },
      { word: 'W', letter: 'W', emoji: 'W' },
    ],
  },
  { id: 'l4-sort-bt', kind: 'brick-crush', bg: bgL4Party, teacher: 'Mega Brick Crush! All the sounds from Lessons 1–4. Listen — then smash every brick with that letter!', who: 'bella', letters: ['H', 'M', 'N', 'W', 'S', 'A', 'B', 'T'], rows: 6, cols: 7, goal: 20, seconds: 70 },
  {
    id: 'l4-grand-build', kind: 'word-build', bg: bgL4Party, teacher: 'Grand birthday round! Choose the first sound: B, T, A, S, or H.',
    rounds: [
      { word: 'ball', blankIndex: 0, answer: 'B', choices: ['B', 'T', 'A', 'S', 'H'], img: itemBallL4, emoji: '⚽' },
      { word: 'two', blankIndex: 0, answer: 'T', choices: ['B', 'T', 'A', 'S', 'H'], img: itemTwo, emoji: '2\u{FE0F}\u{20E3}' },
      { word: 'bye', blankIndex: 0, answer: 'B', choices: ['B', 'T', 'A', 'S', 'H'], img: itemBye, emoji: '\u{1F44B}' },
      { word: 'ten', blankIndex: 0, answer: 'T', choices: ['B', 'T', 'A', 'S', 'H'], img: itemTen, emoji: '\u{1F51F}' },
      { word: 'sun', blankIndex: 0, answer: 'S', choices: ['B', 'T', 'A', 'S', 'H'], img: itemSun, emoji: '☀️' },
      { word: 'hat', blankIndex: 0, answer: 'H', choices: ['B', 'T', 'A', 'S', 'H'], img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'ant', blankIndex: 0, answer: 'A', choices: ['B', 'T', 'A', 'S', 'H'], img: itemAnt, emoji: '\u{1F41C}' },
    ],
  },
  {
    id: 'l4-roleplay-birthday', kind: 'roleplay', bg: bgL4Party, teacher: 'Full birthday conversation! Characters ask, the student answers (repeat each line), then everyone wishes Bella a happy birthday.', cast: ['pip', 'mia', 'bella', 'leo'],
    script: [
      { who: 'bella', line: 'Hello! How are you?', repeat: true },
      { who: 'pip', line: 'I am happy. How are you?', repeat: true },
      { who: 'bella', line: 'I am happy too!', repeat: true },
      { who: 'mia', line: 'Hello! What is your name?', repeat: true },
      { who: 'pip', line: 'My name is Pip. What is your name?', repeat: true },
      { who: 'mia', line: 'My name is Mia!', repeat: true },
      { who: 'leo', line: 'Nice to meet you! How old are you?', repeat: true },
      { who: 'pip', line: 'I am six. How old are you?', repeat: true },
      { who: 'leo', line: 'I am seven!', repeat: true },
      { who: 'bella', line: 'Welcome to my party, friend!', repeat: true },
      { who: 'mia', line: 'We are so happy you are here!', repeat: true },
      { who: 'pip', line: 'Everybody — say it with me!', repeat: true },
      { who: 'leo', line: 'Happy birthday to Bella!', repeat: true },
      { who: 'bella', line: 'Thank you! Hip hip hooray!', repeat: true },
    ],
  },
  {
    id: 'l4-join-birthday', kind: 'join-stage', bg: bgL4Party, teacher: 'Live Stage! Read each question — the student answers into the microphone, then tap the check.', cast: [],
    turns: [
      { who: 'teacher', line: 'Hello! How are you?' },
      { who: 'student', line: 'I am happy!' },
      { who: 'teacher', line: 'What is your name?' },
      { who: 'student', line: 'My name is ___.' },
      { who: 'teacher', line: 'How old are you?' },
      { who: 'student', line: 'I am ___.' },
      { who: 'teacher', line: 'Nice to meet you!' },
      { who: 'student', line: 'Nice to meet you too!' },
    ],
  },
  { id: 'l4-color-friends', kind: 'color-friends', bg: bgMeadow, teacher: 'Bonus round! Pick a color and paint the birthday friends!', cast: ['pip', 'mia', 'bella', 'leo'] },
  {
    id: 'l4-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the birthday word!', letters: ['B', 'T', 'A', 'E', 'N', 'G'],
    tapRounds: [{ letter: 'B' }, { letter: 'T' }, { letter: 'B' }, { letter: 'T' }],
    words: [
      { word: 'BAT', emoji: '\u{1F987}' },
      { word: 'TEN', emoji: '\u{1F51F}' },
      { word: 'BAG', emoji: '\u{1F392}' },
    ],
  },
  { id: 'l4-alphabet-order', kind: 'alphabet-order', bg: bgMeadow, teacher: 'Alphabet Order! Drag the letters into ABC order!', sequences: ['OPQR', 'STUV', 'WXYZ'] },
  {
    id: 'l4-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Everyone waves goodbye! Sing together and wave on every goodbye.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-u1l4.mp3`,
    lineDurationsMs: [4360, 3700, 4120, 7882],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, birthday friends', emotion: 'happy' },
      { who: 'pip', text: '\u{1F382} Happy birthday, Bella, hooray', emotion: 'happy' },
      { who: 'mia', text: '\u{1F388} How old are you? Let\'s count and cheer', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friends! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l4-finale', kind: 'finale', bg: bgL4BellaBirthdayCake, who: 'bella', line: 'You did it! You know my age! Goodbye, friend! See you next lesson!' },
];

/* =========================================================================
 * Lesson 5 — "Leo's Lost Star" (Story Time — narrative review, cumulative
 * H/M/N/W/A/S/B/T, no new letters)
 *
 * Rebuilt the art: l5-intro/l5-story-sad, l5-search, and l5-found/
 * l5-feelings/l5-finale were all painted with either a characterless empty
 * flower meadow (bgMeadow) or bg-bigtree.jpg — a birthday-party tree with
 * lanterns and gift boxes reused from Lesson 4's party, standing in for
 * "found the lost star under a tree." Neither depicted the actual story.
 * Generated three dedicated backgrounds instead (Leo sad with Pip
 * comforting him; the four friends searching the twilight meadow; Leo
 * joyfully finding the star under a real oak tree at night) and reused
 * them across every scene sharing that beat.
 *
 * Also cut color-friends (a Unit 2 topic with no link to this unit) and
 * alphabet-order (tested T/U/V/W/X/Y, only one of which — W — this unit
 * ever taught, and duplicated alphabet-blocks right next to it), and gave
 * alphabet-blocks a fourth word (HAM) so H and M — listed in its letters
 * but never actually drilled — get exercised too.
 * ========================================================================= */

export const LESSON_5_TITLE = "Leo's Lost Star";
export const LESSON_5_OBJECTIVE = 'Follow a story that revisits every friend, question, and sound from Lessons 1-4 (greetings, names, feelings, age), then read three short sentences — "I see hat/mat/bat" — using sounds already learned.';

export const LESSON_5_SCENES: Scene[] = [
  { id: 'l5-title', kind: 'title-card', bg: bgMeadow, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 5 · Story', title: "Leo's Lost Star", subtitle: 'A story that remembers everything we have learned' },
  {
    id: 'l5-intro', kind: 'cinematic', bg: bgL5LeoSad, title: "Leo's Lost Star", subtitle: 'Leo cannot find his lucky star', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Oh no! Leo lost his lucky star. He feels sad.' },
      { who: 'pip', line: 'Let’s ask Leo how he feels, and help him find it!' },
    ],
    cta: 'Help Leo!',
  },
  {
    id: 'l5-story-sad', kind: 'roleplay', bg: bgL5LeoSad, teacher: 'Story time! Listen to Leo, then repeat each line.', cast: ['pip', 'leo'],
    script: [
      { who: 'pip', line: 'Leo, how are you?' },
      { who: 'leo', line: 'I am sad. I lost my star.', repeat: true },
      { who: 'pip', line: 'Do not worry! We will help you!', repeat: true },
    ],
  },
  {
    id: 'l5-recall-hello', kind: 'join-stage', bg: bgMeadow, teacher: 'Remember Lesson 1? Say hello to Mia the way we learned!', cast: ['mia'],
    turns: [
      { who: 'mia', line: 'Hello! My name is Mia.' },
      { who: 'student', line: 'Hello! My name is ___.' },
      { who: 'mia', line: 'Nice to meet you again! Leo lost his star — will you help?' },
      { who: 'student', line: 'Yes! We will help Leo!' },
    ],
  },
  {
    // kind changed from 'join-stage' to 'voice-stage' — activity-pattern-library's
    // Hard Variety Rule (max 2 consecutive same-kind scenes): the original had
    // FOUR join-stage scenes in a row here (recall-hello/name/ask-friends/age).
    // 'voice-stage' is also the MORE authentic choice — it's the exact mechanic
    // Lesson 2 itself used to teach "What is your name?" (see l2-student-question),
    // so reviewing it here mirrors how it was first learned, not just re-skinned.
    id: 'l5-recall-name', kind: 'voice-stage', bg: bgMeadow, teacher: 'Remember Lesson 2? Grab the mic and ask Bella!', question: 'What is your name?', niceToMeet: true,
    rounds: [{ who: 'bella', cue: 'Ask Bella!', answer: 'My name is Bella. Let’s go help Leo find his star.' }],
  },
  {
    // bg stays bgGatherEmpty as the scene-level default (correct for the
    // student's own turns — an empty backdrop for the webcam circle) —
    // each friend's turn overrides it with their own solo shot, since
    // JoinStageScene never renders a friend sprite of its own. Same fix
    // as l6-join-stage / join-stage-l1.
    id: 'l5-ask-friends', kind: 'join-stage', bg: bgGatherEmpty, teacher: 'Remember Lesson 3? Ask how everyone feels, then help Leo.', cast: ['mia', 'bella', 'willow'],
    turns: [
      { who: 'mia', line: 'How are you, Leo?', bg: bgL1MiaSolo },
      { who: 'student', line: 'I am sad. I lost my star.' },
      { who: 'bella', line: 'I am happy! Do not worry, Leo — we will find it.', bg: bgL1BellaSolo },
      { who: 'student', line: 'Thank you!' },
      { who: 'willow', line: 'I am angry we cannot find it. Let’s keep looking!', bg: bgWillowSolo },
    ],
  },
  {
    // kind changed from 'join-stage' to 'meet-greet' — same Hard Variety Rule fix
    // as l5-recall-name above, and again the more authentic choice: 'meet-greet'
    // is Lesson 4's own mechanic for "how old are you?" (see l4-meet-greet).
    id: 'l5-recall-age', kind: 'meet-greet', bg: bgMeadow, teacher: 'Remember Lesson 4? Meet Willow — ask her name, her age, then say nice to meet you!',
    friends: [{ who: 'willow', age: 3 }],
  },
  {
    id: 'l5-search', kind: 'memory', bg: bgL5Search, teacher: 'Search the meadow! Find the matching pairs to look for the star.',
    pairs: [
      { id: 'star', label: 'Star', emoji: '⭐', img: itemStar },
      { id: 'sun', label: 'Sun', emoji: '☀️', img: itemSun },
      { id: 'apple', label: 'Apple', emoji: '\u{1F34E}', img: itemApple },
      { id: 'ant', label: 'Ant', emoji: '\u{1F41C}', img: itemAnt },
    ],
  },
  {
    id: 'l5-found', kind: 'cinematic', bg: bgL5FoundTree, title: 'Found it!', subtitle: 'The star was under the big tree all along', narrator: 'leo',
    script: [
      { who: 'leo', line: 'My star! You found it! I am so happy now!' },
      { who: 'leo', line: 'Thank you, friends! How are you?' },
      { who: 'pip', line: 'We are happy too!' },
    ],
    cta: 'Yay!',
  },
  /* Reading strand — rebuilt per direct user request: the first pass used
   * word-build's letter-by-letter blending (H-A-T) plus a Higgsfield video
   * pilot, which read as too long/cluttered for one lesson. Simplified to
   * short, predictable 3-word sentences ("I see hat") via sentence-build —
   * a real early-reader technique (a fixed repeated frame with one
   * changing decodable word), reusing the exact scene kind + multi-round
   * pattern already proven in Unit 5 L1 ("build the sentence for Mom/Dad")
   * rather than a bespoke video pipeline. "A" is the unit's only taught
   * vowel, so hat/mat/bat are the full realistic set of concrete,
   * kid-friendly CVC words buildable from letters this unit actually
   * taught. Two sentence-build scenes run back to back (hat, mat) at
   * most — activity-pattern-library's Hard Variety Rule caps consecutive
   * identical `kind`s at 2 — with l5-reading-celebrate breaking the run
   * before bat.
   */
  {
    id: 'l5-reading-intro', kind: 'cinematic', bg: bgL5ReadingIntro, title: 'On the Way Home...', subtitle: 'Leo sees his things from the search', narrator: 'leo',
    script: [
      { who: 'leo', line: 'Wait! I see some of my things. Read them with me!' },
    ],
    cta: 'Let’s read!',
  },
  {
    id: 'l5-sentence-hat', kind: 'sentence-build', bg: bgL5ReadingHat, teacher: 'It’s Leo’s hat! Put the words in order.',
    rounds: [{ words: ['I', 'see', 'hat'], img: itemHat, emoji: '\u{1F3A9}' }],
  },
  {
    id: 'l5-sentence-mat', kind: 'sentence-build', bg: bgL5ReadingMat, teacher: 'A picnic mat! Put the words in order.',
    rounds: [{ words: ['I', 'see', 'mat'], emoji: '\u{1F9FA}' }],
  },
  {
    id: 'l5-reading-celebrate', kind: 'cinematic', bg: bgL5ReadingCelebrate, title: 'You read two sentences!', subtitle: 'One more thing to find', narrator: 'leo',
    script: [
      { who: 'leo', line: 'One more thing! Keep reading with me!' },
    ],
    cta: 'Keep going!',
  },
  {
    id: 'l5-sentence-bat', kind: 'sentence-build', bg: bgL5ReadingBat, teacher: 'A little bat flying home! Put the words in order.',
    rounds: [{ words: ['I', 'see', 'bat'], emoji: '\u{1F987}' }],
  },
  {
    id: 'l5-who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Listen! Who said it in our story? Tap the friend.',
    rounds: [
      { line: 'I am sad. I lost my star.', who: 'leo', emotion: 'sad' },
      { line: 'Do not worry! We will help you!', who: 'pip' },
      { line: 'Hello! My name is Mia.', who: 'mia' },
      { line: 'I am happy! Do not worry, Leo.', who: 'bella', emotion: 'happy' },
      { line: 'I am angry we cannot find it.', who: 'willow', emotion: 'angry' },
    ],
  },
  {
    // Was bgGatherEmpty (an empty meadow) — RoleplayScene paints no
    // sprites of its own, so every line's bubble floated over nobody.
    // bgL5RoleplayFriends has all five friends painted in and waving.
    id: 'l5-roleplay-recap', kind: 'roleplay', bg: bgL5RoleplayFriends, teacher: 'Retell the whole story! Listen, then repeat each line.', cast: ['leo', 'pip', 'mia', 'willow', 'bella'],
    script: [
      { who: 'leo', line: 'I lost my star. I was sad.', repeat: true },
      { who: 'mia', line: 'We said hello and asked how to help.', repeat: true },
      { who: 'pip', line: 'We looked together in the meadow.', repeat: true },
      { who: 'willow', line: 'I felt a little angry, but we did not give up!', repeat: true },
      { who: 'bella', line: 'We found the star! Now Leo is happy!', repeat: true },
    ],
  },
  {
    id: 'l5-puzzle', kind: 'puzzle', bg: bgMeadow, teacher: 'Guess the friend from the story! Tap pieces to peek.',
    rounds: [
      { who: 'leo', img: CAST.leo.img, hint: 'He was sad, then happy again.', emotion: 'sad' },
      { who: 'mia', img: CAST.mia.img, hint: 'She said hello first and asked to help.' },
      { who: 'willow', img: CAST.willow.img, hint: 'She felt a little angry but kept looking.', emotion: 'angry' },
      { who: 'bella', img: CAST.bella.img, hint: 'She found the star under the tree.', emotion: 'happy' },
    ],
  },
  {
    id: 'l5-feelings', kind: 'feelings', bg: bgL5FoundTree, teacher: 'Leo was sad, now he is happy. How do you feel?',
    options: [
      { label: 'Happy', emoji: '\u{1F600}', reply: 'Yay! Just like Leo when he found his star!' },
      { label: 'Okay', emoji: '\u{1F610}', reply: 'That is okay. Feelings can change, just like in the story.' },
      { label: 'Sad', emoji: '\u{1F622}', reply: "It's okay to feel sad, like Leo did at first. It gets better!" },
    ],
  },
  {
    id: 'l5-sort-part1', kind: 'sound-sort', bg: bgClearing, teacher: 'Lessons 1 & 2 review! Drag each picture to /h/, /m/, /n/ or /w/.',
    targets: [
      { letter: 'H', phoneme: '/h/', who: 'pip' },
      { letter: 'M', phoneme: '/m/', who: 'mia' },
      { letter: 'N', phoneme: '/n/', who: 'mia' },
      { letter: 'W', phoneme: '/w/', who: 'pip' },
    ],
    items: [
      { word: 'hat', emoji: '\u{1F3A9}', img: itemHat, letter: 'H' },
      { word: 'house', emoji: '\u{1F3E0}', img: itemHouse, letter: 'H' },
      { word: 'mouse', emoji: '\u{1F42D}', img: itemMouse, letter: 'M' },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, letter: 'M' },
      { word: 'nose', emoji: '\u{1F443}', img: itemNose, letter: 'N' },
      { word: 'nut', emoji: '\u{1F95C}', img: itemNut, letter: 'N' },
      { word: 'wave', emoji: '\u{1F30A}', img: itemWave, letter: 'W' },
      { word: 'water', emoji: '\u{1F4A7}', img: itemWater, letter: 'W' },
    ],
  },
  {
    id: 'l5-sort-part2', kind: 'sound-sort', bg: bgClearing, teacher: 'Lessons 3 & 4 review! Drag each picture to /a/, /s/, /b/ or /t/.',
    targets: [
      { letter: 'A', phoneme: '/a/', who: 'leo' },
      { letter: 'S', phoneme: '/s/', who: 'mia' },
      { letter: 'B', phoneme: '/b/', who: 'bella' },
      { letter: 'T', phoneme: '/t/', who: 'leo' },
    ],
    items: [
      { word: 'apple', emoji: '\u{1F34E}', img: itemApple, letter: 'A' },
      { word: 'ant', emoji: '\u{1F41C}', img: itemAnt, letter: 'A' },
      { word: 'star', emoji: '⭐', img: itemStar, letter: 'S' },
      { word: 'sun', emoji: '☀️', img: itemSun, letter: 'S' },
      { word: 'bag', emoji: '\u{1F392}', img: itemBag, letter: 'B' },
      { word: 'ball', emoji: '⚽', img: itemBallL4, letter: 'B' },
      { word: 'two', emoji: '2\u{FE0F}\u{20E3}', img: itemTwo, letter: 'T' },
      { word: 'toy', emoji: '\u{1F9F8}', img: itemToy, letter: 'T' },
    ],
  },
  {
    id: 'l5-word-build', kind: 'word-build', bg: bgMeadow, teacher: 'Grand review! Choose the first sound — all 8 you have learned!',
    rounds: [
      { word: 'house', blankIndex: 0, answer: 'H', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemHouse, emoji: '\u{1F3E0}' },
      { word: 'mouse', blankIndex: 0, answer: 'M', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemMouse, emoji: '\u{1F42D}' },
      { word: 'nose', blankIndex: 0, answer: 'N', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemNose, emoji: '\u{1F443}' },
      { word: 'wave', blankIndex: 0, answer: 'W', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemWave, emoji: '\u{1F30A}' },
      { word: 'ant', blankIndex: 0, answer: 'A', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemAnt, emoji: '\u{1F41C}' },
      { word: 'star', blankIndex: 0, answer: 'S', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemStar, emoji: '⭐' },
      { word: 'bag', blankIndex: 0, answer: 'B', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemBag, emoji: '\u{1F392}' },
      { word: 'two', blankIndex: 0, answer: 'T', choices: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'], img: itemTwo, emoji: '2\u{FE0F}\u{20E3}' },
    ],
  },
  {
    id: 'l5-dash', kind: 'dash', bg: bgClearing, teacher: 'Bella Dash! Tap only the S words as they run by. Get 6 rings!', who: 'bella', targetLetter: 'S', targetPhoneme: '/s/', goal: 6, seconds: 40,
    items: [
      { word: 'star', letter: 'S', img: itemStar, emoji: '⭐' },
      { word: 'sun', letter: 'S', img: itemSun, emoji: '☀️' },
      { word: 'snake', letter: 'S', img: itemSnake, emoji: '\u{1F40D}' },
      { word: 'nose', letter: 'N', img: itemNose, emoji: '\u{1F443}' },
      { word: 'water', letter: 'W', img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'hat', letter: 'H', img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'bag', letter: 'B', img: itemBag, emoji: '\u{1F392}' },
      { word: 'two', letter: 'T', img: itemTwo, emoji: '2\u{FE0F}\u{20E3}' },
    ],
  },
  {
    id: 'l5-hello-doors', kind: 'hello-doors', bg: bgHelloDoorsTree, teacher: 'Knock knock! Tap the right door, then say hello to your friend!', cast: ['pip', 'mia', 'bella', 'willow'],
    rounds: [
      { target: 'pip', prompt: 'Knock knock! Where is Pip?', helloLine: 'Hello! My name is Pip.', echoLine: 'Hello, Pip!' },
      { target: 'willow', prompt: 'Knock knock! Where is Willow?', helloLine: 'Hello! My name is Willow.', echoLine: 'Hi, Willow!' },
    ],
  },
  {
    // color-friends (teaches color vocabulary — a Unit 2 topic with no
    // link to this unit's greetings/names/feelings/age/phonics goals) and
    // alphabet-order (plain ABC sequencing, using letters T/U/V/W/X/Y —
    // only one of which, W, this unit ever actually taught) were both cut
    // here. alphabet-order also duplicated the "arrange letters" beat
    // immediately below it with no new content in between.
    //
    // Word list changed from [WAS, SAM, MAN, HAM] to the three words the
    // new reading strand above (l5-read-hat/mat/bat) just taught: WAS is
    // phonetically irregular (pronounced /wʌz/, not decodable the way this
    // unit's sounds would suggest — a bad example to stack right after
    // teaching real blending), SAM is a name with no picture/meaning to
    // anchor it, and neither MAN nor HAM fit the meadow-search story this
    // lesson is built around. HAT/MAT/BAT are the exact words just
    // decoded — this is the canonical-flow's "second, later touch" of
    // today's new content (playground-curriculum-engine's 10-step flow,
    // step 9), not a new topic.
    id: 'l5-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Alphabet Blocks! Tap the sound, then stack the words you just read!', letters: ['H', 'M', 'N', 'W', 'A', 'S', 'B', 'T'],
    tapRounds: [{ letter: 'S' }, { letter: 'A' }, { letter: 'N' }, { letter: 'W' }, { letter: 'B' }, { letter: 'T' }, { letter: 'H' }, { letter: 'M' }],
    words: [
      { word: 'HAT', emoji: '\u{1F3A9}' },
      { word: 'MAT', emoji: '\u{1F9FA}' },
      { word: 'BAT', emoji: '\u{1F987}' },
    ],
  },
  {
    id: 'l5-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-u1l5.mp3`,
    lineDurationsMs: [3320, 4760, 3700, 8282],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, shiny star', emotion: 'happy' },
      { who: 'pip', text: '\u{2B50} Leo found it under the tree', emotion: 'happy' },
      { who: 'mia', text: '\u{1F333} Wave to the star, wave to me', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friends! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l5-finale', kind: 'finale', bg: bgL5FoundTree, who: 'leo', line: 'Thank you for helping me find my star — and you read HAT, MAT, and BAT all by yourself! Tonight, find a hat at home and read it out loud!' },
];

/* =========================================================================
 * Lesson 6 — "The Trophy Trail" (Trophy Quiz — cumulative capstone review
 * across all EIGHT Unit 1 sounds — H, M, N, W, S, A, B, T — plus every
 * communicative goal; no new letters.
 *
 * Rebuilt from a version that only ever reviewed 6 of the unit's 8 taught
 * letters (Lesson 4's B/T were entirely absent from every phonics activity
 * here, despite the lesson's own finale claiming "six letter sounds" as the
 * full total) and that had drifted into redundancy: three separate timed
 * letter-tap games (sound-pop, brick-crush, dash) covering overlapping,
 * narrower letter subsets; two separate "ask a friend" games (name-gate,
 * voice-stage) testing exactly what join-stage right after them already
 * covers in one pass; two separate "arrange the alphabet" games
 * (alphabet-blocks, alphabet-order) back to back; and a word-build round
 * testing the same "identify the beginning letter" skill as trophy-chest.
 * Also cut: color-friends, which teaches color vocabulary — a Unit 2
 * ("Colors & Shapes") topic with no knowledge-graph link to this unit,
 * the exact orphan-topic mistake playground-curriculum-engine exists to
 * catch. Kept one best-in-class activity per skill instead, and gave the
 * freed-up time to actually covering B and T everywhere H/M/N/W/S/A
 * already were: a new sort-bt round, brick-crush and trophy-chest expanded
 * to all 8 letters (goal/seconds matched to Lesson 4's own already-tuned
 * 8-letter brick-crush calibration), and alphabet-blocks gained a BAT round.
 *
 * Re-validated against playground-curriculum-engine / smart-lesson-architect
 * / reading-engine's own checklists directly (not by eyeballing):
 * - Spiral-progression ratio is deliberately 0% new / 100% review, not the
 *   usual 20-30% new — the stated, deliberate reason the checklist asks
 *   for: this is the unit's terminal capstone ("Boss Battle" per smart-
 *   lesson-architect's own Gamification Intelligence section), not a
 *   normal teaching lesson.
 * - Computed pacing (not eyeballed): 20 scenes, ~935s on a perfect single
 *   pass; realistic play with retries on the two timed challenges and a
 *   young learner's pace lands around 22-25 minutes — inside the ~30
 *   minute budget with room to spare.
 * - Added a concrete real-life transfer line to the finale — the previous
 *   version was purely congratulatory, which both skills flag as
 *   insufficient on its own for a lesson's closing action.
 * ========================================================================= */

export const LESSON_6_TITLE = 'The Trophy Trail';
export const LESSON_6_OBJECTIVE = "Students can produce all 8 Unit 1 sounds, greet a friend and share their name/age, and say how they (or a friend) feel using I am / he is / she is.";

export const LESSON_6_SCENES: Scene[] = [
  { id: 'l6-title', kind: 'title-card', bg: bgL6TrophyTrail, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 6', title: 'The Trophy Trail', subtitle: 'Show what you know and win the trophy!' },
  {
    id: 'l6-intro', kind: 'cinematic', bg: bgBigTree, title: 'The Trophy Trail', subtitle: 'One last challenge before the trophy', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Trophy day! Show us everything you know!' },
      { who: 'pip', line: 'Sounds, names, feelings — you can do it all!' },
    ],
    cta: "Let's go!",
  },
  {
    id: 'l6-sort-hm', kind: 'sound-sort', bg: bgClearing, teacher: 'Round 1! Drag each picture to /h/ or /m/.',
    targets: [
      { letter: 'H', phoneme: '/h/', who: 'pip' },
      { letter: 'M', phoneme: '/m/', who: 'mia' },
    ],
    items: [
      { word: 'hello', emoji: '\u{1F44B}', img: itemHello, letter: 'H' },
      { word: 'hat', emoji: '\u{1F3A9}', img: `${A}/items/item-hat.png`, letter: 'H' },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, letter: 'M' },
      { word: 'mouse', emoji: '\u{1F42D}', img: itemMouse, letter: 'M' },
    ],
  },
  {
    id: 'l6-sort-nw', kind: 'sound-sort', bg: bgNameCarnivalBridge, teacher: 'Round 2! Drag each picture to /n/ or /w/.',
    targets: [
      { letter: 'N', phoneme: '/n/', who: 'mia' },
      { letter: 'W', phoneme: '/w/', who: 'pip' },
    ],
    items: [
      { word: 'nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png`, letter: 'N' },
      { word: 'nose', emoji: '\u{1F443}', img: itemNose, letter: 'N' },
      { word: 'water', emoji: '\u{1F4A7}', img: itemWater, letter: 'W' },
      { word: 'wave', emoji: '\u{1F30A}', img: itemWave, letter: 'W' },
    ],
  },
  {
    id: 'l6-sort-sa', kind: 'sound-sort', bg: bgHideSeek, teacher: 'Round 3! Drag each picture to /s/ or /a/.',
    targets: [
      { letter: 'S', phoneme: '/s/', who: 'bella' },
      { letter: 'A', phoneme: '/a/', who: 'willow' },
    ],
    items: [
      { word: 'sun', emoji: '☀️', img: itemSun, letter: 'S' },
      { word: 'star', emoji: '⭐', img: itemStar, letter: 'S' },
      { word: 'apple', emoji: '\u{1F34E}', img: itemApple, letter: 'A' },
      { word: 'ant', emoji: '\u{1F41C}', img: itemAnt, letter: 'A' },
    ],
  },
  {
    // NEW — Lesson 4's B/T were never reviewed anywhere in this capstone
    // before. Same sound-sort pattern as the H/M, N/W, S/A rounds above,
    // reusing Lesson 4's own B/T anchor words and images for consistency.
    id: 'l6-sort-bt', kind: 'sound-sort', bg: bgL4Party, teacher: 'Round 4! Drag each picture to /b/ or /t/.',
    targets: [
      { letter: 'B', phoneme: '/b/', who: 'bella' },
      { letter: 'T', phoneme: '/t/', who: 'leo' },
    ],
    items: [
      { word: 'ball', emoji: '⚽', img: itemBallL4, letter: 'B' },
      { word: 'bag', emoji: '\u{1F392}', img: itemBag, letter: 'B' },
      { word: 'ten', emoji: '\u{1F51F}', img: itemTen, letter: 'T' },
      { word: 'toy', emoji: '\u{1F9F8}', img: itemToy, letter: 'T' },
    ],
  },
  {
    // Covers all 8 of the unit's letters at once — goal/seconds matched to
    // Lesson 4's own already-tuned 8-letter brick-crush (l4-sort-bt above),
    // rather than this scene's old 6-letter timing, which would be
    // relatively harder now with two more letters in the mix.
    id: 'l6-brick-crush', kind: 'brick-crush', bg: bgNameCarnivalSky, teacher: 'Mega Brick Crush! All 8 sounds from this unit. Listen — then smash every brick with that letter!', who: 'pip', letters: ['H', 'M', 'N', 'W', 'S', 'A', 'B', 'T'], rows: 6, cols: 7, goal: 20, seconds: 70,
  },
  {
    id: 'l6-memory', kind: 'memory', bg: bgMeadow, teacher: 'Find the pairs! Tap two cards to match them.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '\u{1F44B}', img: itemHello },
      { id: 'nest', label: 'Nest', emoji: '\u{1FAB9}', img: `${A}/items/item-nest.png` },
      { id: 'star', label: 'Star', emoji: '⭐', img: itemStar },
      { id: 'alligator', label: 'Alligator', emoji: '\u{1F40A}', img: itemAlligator },
    ],
  },
  {
    id: 'l6-who', kind: 'who-said-it', bg: bgHideSeek, teacher: 'Final listening round! Who is talking? Tap the friend.',
    rounds: [
      { line: 'Hello! I am Pip!', who: 'pip' },
      { line: 'My name is Willow!', who: 'willow' },
      { line: 'I am happy!', who: 'mia' },
      { line: 'Nice to meet you!', who: 'bella' },
      { line: 'How are you?', who: 'leo' },
    ],
  },
  {
    id: 'l6-puzzle', kind: 'puzzle', bg: bgMeadow, teacher: 'Guess the friend! Tap pieces to peek, then pick who it is.',
    rounds: [
      { who: 'pip', img: CAST.pip.img, hint: 'A little fox with a warm smile.' },
      { who: 'willow', img: CAST.willow.img, hint: 'A friend who loves the meadow breeze.' },
      { who: 'leo', img: CAST.leo.img, hint: 'A sleepy lion with a big, warm roar.' },
    ],
  },
  {
    // name-gate (ask each friend their name) and voice-stage (ask each
    // friend how they feel) were cut here — join-stage right after this
    // already asks a friend both questions in one pass, so both scenes
    // were re-testing exactly what it covers, just split across two extra
    // screens first.
    id: 'l6-roleplay', kind: 'roleplay', bg: bgL6RoleplayFriends, teacher: 'The whole gang together! Listen, then repeat each line.', cast: ['pip', 'mia', 'leo'],
    script: [
      { who: 'pip', line: 'We did it! Trophy day!' },
      { who: 'mia', line: 'I am so happy!', repeat: true },
      { who: 'leo', line: 'Me too! We are all friends!', repeat: true },
    ],
  },
  {
    // bg stays bgGatherEmpty as the scene-level default (correct for the
    // student's own turns — an empty backdrop for the webcam circle, same
    // convention join-stage-l1 uses) — each friend's turn overrides it with
    // their own solo shot instead, since JoinStageScene never renders a
    // friend sprite of its own.
    // Refactored into one real three-question conversation (name -> age ->
    // feeling) instead of jumping straight from name to feeling with no
    // age question at all — matches this capstone's own stated objective
    // ("share their name/age") and the new l6-age-quiz round right before
    // this one, giving age a second, conversational rep here too.
    id: 'l6-join-stage', kind: 'join-stage', bg: bgGatherEmpty, teacher: 'Your final turn! Show everything you know!', cast: ['pip', 'mia', 'bella', 'willow', 'leo'],
    turns: [
      { who: 'pip', line: 'Hello! What is your name?', bg: bgL1PipSolo },
      { who: 'student', line: 'Hello! My name is ___.' },
      { who: 'leo', line: 'How old are you?', bg: bgLeoSolo },
      { who: 'student', line: 'I am ___ years old.' },
      { who: 'mia', line: 'How are you?', bg: bgL1MiaSolo },
      { who: 'student', line: 'I am happy!' },
      // Same bg repeated here (not omitted) — JoinStageScene falls back to
      // the scene's own default (bgGatherEmpty) on any turn without an
      // explicit bg, which would flash back to an empty meadow for this
      // closing line otherwise.
      { who: 'mia', line: 'Nice to meet you!', bg: bgL1MiaSolo },
      { who: 'student', line: 'Nice to meet you too!' },
    ],
  },
  {
    // NEW — this capstone's own stated objective promises reviewing
    // "greet a friend and share their name/age," but nothing anywhere in
    // it ever touched Lesson 4's age/counting content (only its B/T
    // phonics got reviewed, via l6-sort-bt above) until now. Reuses
    // Lesson 4's own age-quiz mechanic and the exact same friends/ages it
    // established (Bella 5, Mia 6, Leo 7, Willow 3), the same
    // reuse-before-inventing approach as l6-he-she-model/sort below.
    id: 'l6-age-quiz', kind: 'age-quiz', bg: bgL4Party, teacher: 'Trophy round! How old is everyone? Tap the wobbly present, then guess the candles. At the end — tap YOUR own age!',
    friends: [
      { who: 'bella', age: 5 },
      { who: 'mia', age: 6 },
      { who: 'leo', age: 7 },
      { who: 'willow', age: 3 },
    ],
    studentAges: [3, 4, 5, 6, 7],
  },
  {
    // NEW — everything above only ever reviews the first-person "I am ___"
    // pattern. Lesson 3's own objective promises "I am / He is / She is
    // happy, sad, or angry," but this capstone never once reviewed the
    // third-person half — added here reusing Lesson 3's own established
    // he-she-model + he-she-sort mechanics (modeled repeat, then real
    // drag-to-pronoun practice) rather than inventing a new one.
    id: 'l6-he-she-model', kind: 'he-she-model', bg: bgFeelingsMeadow, teacher: "Boys are HE. Girls are SHE. Model twice, then repeat both lines with the student.",
    rounds: [
      { who: 'leo', emotion: 'happy', pronoun: 'He', sentence: 'Leo is happy. He is happy.' },
      { who: 'bella', emotion: 'sad', pronoun: 'She', sentence: 'Bella is sad. She is sad.' },
      { who: 'pip', emotion: 'angry', pronoun: 'He', sentence: 'Pip is angry. He is angry.' },
      { who: 'mia', emotion: 'happy', pronoun: 'She', sentence: 'Mia is happy. She is happy.' },
    ],
  },
  {
    id: 'l6-he-she-sort', kind: 'he-she-sort', bg: bgFeelingsMeadow, teacher: "Trophy round! Listen to each friend, then drag them to the right pronoun box — HE or SHE.",
    rounds: [
      { who: 'pip', emotion: 'happy', pronoun: 'He' },
      { who: 'bella', emotion: 'sad', pronoun: 'She' },
      { who: 'leo', emotion: 'angry', pronoun: 'He' },
      { who: 'mia', emotion: 'happy', pronoun: 'She' },
      { who: 'willow', emotion: 'sad', pronoun: 'She' },
      { who: 'leo', emotion: 'happy', pronoun: 'He' },
    ],
  },
  {
    id: 'l6-feelings', kind: 'feelings', bg: bgBigTree, teacher: 'You are about to win the trophy! How do you feel?',
    options: [
      { label: 'Happy', emoji: '\u{1F600}', reply: 'Yay! You should feel proud and happy!' },
      { label: 'Okay', emoji: '\u{1F610}', reply: 'That is okay. You worked hard and did great!' },
      { label: 'Sad', emoji: '\u{1F622}', reply: "It's okay. You still earned this trophy — great job!" },
    ],
  },
  {
    // Colors was cut from this Unit 1 review — it's a Unit 2 ("Colors &
    // Shapes") topic with no knowledge-graph link to this unit's own
    // greetings/names/feelings/phonics goals, the same orphan-topic
    // mistake playground-curriculum-engine flags elsewhere in this
    // project. alphabet-order (plain ABC sequencing) was also cut —
    // unlike alphabet-blocks just below, it doesn't exercise this unit's
    // actual sound-to-letter objective, and it duplicated the
    // "arrange letters" beat right next to it with no new content
    // between them.
    id: 'l6-alphabet-blocks', kind: 'alphabet-blocks', bg: bgMeadow, teacher: 'Final Alphabet Blocks! Tap the sound, then stack the word!', letters: ['H', 'M', 'N', 'W', 'S', 'A', 'B', 'T'],
    tapRounds: [{ letter: 'H' }, { letter: 'M' }, { letter: 'S' }, { letter: 'A' }, { letter: 'B' }, { letter: 'T' }],
    words: [
      { word: 'HAS', emoji: '✨' },
      { word: 'SAM', emoji: '\u{1F9CD}' },
      { word: 'MAT', emoji: '\u{1F7EB}' },
      { word: 'BAT', emoji: '\u{1F987}' },
    ],
  },
  {
    // Expanded from 6 to all 8 of the unit's letters (adds B/T) — this now
    // fully supersedes the old l6-word-build round, which tested the exact
    // same "identify the beginning letter" skill with less content (just
    // 6 rounds, no phoneme label) than this scene already had.
    id: 'l6-trophy-chest', kind: 'trophy-chest', bg: bgGatherEmpty, who: 'pip', teacher: 'The Trophy Chest! Tap the sound you hear to unlock each treasure.',
    rounds: [
      { letter: 'H', phoneme: '/h/', word: 'house', img: itemHouse, emoji: '\u{1F3E0}', choices: ['H', 'S', 'M'] },
      { letter: 'M', phoneme: '/m/', word: 'milk', img: itemMilk, emoji: '\u{1F95B}', choices: ['M', 'W', 'N'] },
      { letter: 'N', phoneme: '/n/', word: 'nut', img: itemNut, emoji: '\u{1F95C}', choices: ['N', 'A', 'H'] },
      { letter: 'W', phoneme: '/w/', word: 'wind', img: itemWind, emoji: '\u{1F32C}️', choices: ['W', 'S', 'M'] },
      { letter: 'S', phoneme: '/s/', word: 'snake', img: itemSnake, emoji: '\u{1F40D}', choices: ['S', 'A', 'W'] },
      { letter: 'A', phoneme: '/a/', word: 'alligator', img: itemAlligator, emoji: '\u{1F40A}', choices: ['A', 'H', 'N'] },
      { letter: 'B', phoneme: '/b/', word: 'ball', img: itemBallL4, emoji: '⚽', choices: ['B', 'T', 'H'] },
      { letter: 'T', phoneme: '/t/', word: 'ten', img: itemTen, emoji: '\u{1F51F}', choices: ['T', 'B', 'N'] },
    ],
  },
  {
    // Simplified per explicit teacher feedback: the earlier "Golden Acorn
    // quest" (locked gate + number, hidden door + sound) was too complex
    // for a Pre-A1 listener. Rebuilt as one plain, linear pattern repeated
    // 3 times — meet a friend, say hello, notice how they feel, help if
    // needed — using only vocabulary already taught in this unit
    // (greetings from L1, happy/sad/angry from L3), no invented objects or
    // puzzles. Reuses each character's own existing "meet" background
    // instead of new art, since the story now maps directly onto Lesson 1's
    // original meet-the-cast scenes.
    id: 'l6-storybook', kind: 'flipbook', bg: bgGoodbyeCast, title: 'Pip and the Happy Forest Friends',
    pages: [
      { img: bgClearing, text: 'Pip is walking in the forest. Who will Pip meet today?' },
      { who: 'mia', img: sceneMiaMousehole, text: '"Hello! My name is Pip!" "Hello! My name is Mia!" Mia is happy. Pip and Mia play together.' },
      { who: 'bella', img: sceneBellaBigTree, text: '"Hello! My name is Bella." But Bella is sad. "What is wrong?" asks Pip. They help Bella. "Thank you! Now I am happy!"' },
      { who: 'leo', img: bgMoodMonsters, text: '"Hello! My name is Leo." But Leo is angry! "Why are you angry?" asks Pip. Leo tells them his problem. They help Leo. "Thank you, friends! Now I am happy!"' },
      { img: bgGoodbyeCast, text: 'Now everyone is happy together! Pip, Mia, Bella, Leo, and Willow are all friends! ✨' },
    ],
    checkpoints: [
      { afterPage: 1, who: 'mia', question: 'How does Mia feel?', options: ['Sad', 'Angry', 'Happy'], answer: 'Happy' },
      { afterPage: 2, who: 'bella', question: 'How did Bella feel before Pip helped her?', options: ['Happy', 'Sad', 'Angry'], answer: 'Sad' },
      { afterPage: 3, who: 'leo', question: 'How did Leo feel before Pip helped him?', options: ['Happy', 'Sad', 'Angry'], answer: 'Angry' },
    ],
  },
  {
    id: 'l6-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F3C6} Trophy Goodbye Song \u{1F3C6}', teacher: 'Wave goodbye and celebrate! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-u1l6.mp3`,
    lineDurationsMs: [3670, 3590, 6140, 6662],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, we won today', emotion: 'happy' },
      { who: 'pip', text: '\u{1F3C6} Trophy time, hip hip hooray', emotion: 'happy' },
      { who: 'mia', text: '\u{2B50} You learned so much, you\'re a star', emotion: 'happy' },
      { who: 'bella', text: '\u{1F496} Byeeee, friends! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l6-finale', kind: 'finale', bg: bgL6TrophyPodium, who: 'pip', line: 'You did it! You earned the Unit 1 Trophy! Hello, names, feelings, and all 8 letter sounds — you know it all! \u{1F3C6} Tonight, say hello to your family, tell them your age, and show them how you feel!' },
];

/* =========================================================================
 * Unit 2, Lesson 1 — "Red, Blue, Yellow!" (color vocabulary).
 * Same cast/world as Unit 1 (no new characters or background art exist for
 * a distinct Unit 2 world yet) — see the playground-library-lesson-builder
 * skill, section 6, for why this stays in unit1/scenes.ts despite the DB's
 * unit_number being 2. Curriculum blueprint objective for this exact slot
 * (curriculum_lessons id f05e22f7-...): identify and name red/blue/yellow —
 * no letter-sound target, purely "what color is this, and can you say it
 * back." Cast-color mapping (Bella=red, Willow=blue, Pip=yellow) kept
 * unchanged from every earlier version of this lesson, since Lesson 2
 * ("Green, Orange, Purple!") deliberately avoided reusing these three
 * colors for its own new cast assignments — changing it here would
 * contradict that already-shipped lesson.
 *
 * ===================== FULL REBUILD: "The Color Carnival" =================
 * Per direct request: full rebuild, not a patch, with a fresh theme and a
 * fresh game mix — the lesson was already solid (themed, gamified, built
 * through several earlier feedback rounds) but the user explicitly wanted
 * a different take, not a touch-up. Re-ran the quality checklist from
 * scratch rather than carrying the old build's choices forward:
 *
 * - Theme: a traveling fairground ("the Color Carnival") the three friends
 *   are visiting — Bella at a red balloon stand, Willow at a blue cotton
 *   candy cart, Pip at a yellow popcorn stand/ring-toss booth. Distinct
 *   from the old "Rainbow Meadow" setting while keeping the same cast,
 *   colors, and sentence patterns — a fresh backdrop for the same, already
 *   curriculum-correct target language, not a reason to touch the
 *   objective. Carnival games (ring toss, balloon dart, duck pond) double
 *   as natural framing for the lesson's own practice activities instead of
 *   needing invented justifications.
 * - Activity-pattern-library's Hard Variety Rule (no kind 3x in a row) is
 *   now respected by construction, not patched after the fact: the three
 *   'dash' rounds (one per color) are separated by color-quiz/color-friends
 *   instead of running back to back, and the three 'roleplay' scenes (one
 *   per color, each needing its own single-object background per the
 *   pre-reading-image rule below) are interleaved one per phonics triplet
 *   (sound-model -> trace -> roleplay for R, then Y, then B) instead of
 *   grouped at the end. 'color-sort' / 'color-quiz' / 'color-friends' /
 *   'word-build' / 'color-simon' never sit adjacent to their own kind
 *   either.
 * - One genuinely new mechanic for this lesson: 'sound-pop' ("Balloon Letter
 *   Pop!", already built for other unit1 lessons' phonics review but never
 *   used here) reinforces R/Y/B by literally popping the right balloon —
 *   a real carnival game mechanic, not a reskinned existing one.
 * - Pre-reading rule (every image IS the message, not a supporting visual
 *   next to text to fall back on) still applies throughout: each roleplay
 *   scene and each flipbook page gets its own single-object stand image
 *   (red balloon stand / blue cotton candy stand / yellow popcorn stand),
 *   never a shared busy image asked to carry two different sentences.
 * - Sentence pattern family unchanged: "It's ___," "I like ___," "I don't
 *   like ___" (negative form modeled once, on blue, exactly as before) —
 *   this was already the correct, simplified pattern; no reason to change
 *   working language just because the art changed.
 * - color-friends reuses the existing hand-coded VocabOutline silhouettes
 *   ('apple'/'sun'/'water' — generic paintable shapes, not literally
 *   fruit/sun/water-specific) rather than adding new SVG shapes, the same
 *   way Lesson 2 already reused them for leaf/orange/grapes — no new code
 *   needed for a different vocabulary set.
 * - All 11 new images generated fresh (3 single-character stand scenes, 1
 *   hero group scene, 1 plain bunting backdrop for game-mechanic scenes, 1
 *   prize-ticket booth for phonics, 1 dash arcade arena, 4 vocabulary
 *   icons), each explicitly demanding full-bleed/anti-frame/anti-sticker
 *   formatting up front — the exact failure mode the old build's art had
 *   to be regenerated for after the fact.
 * - Follow-up fixes after initial build, per direct user feedback: (1) every
 *   generated vocab/prize icon exported with a transparent background (via
 *   Canva's remove-background + transparent_background export), never white
 *   — the balloon/ring/cotton-candy/popcorn icons and the color-spot reveal
 *   card's paint-splash icon (color-spot's optional `splashImg` field,
 *   SceneRenderer.tsx) all follow this; (2) no emoji or 3D renders for
 *   vocabulary items — Ribbon/Ball/Bear/Duck, previously emoji-only anchors,
 *   got real flat-2D generated images; (3) the three color-targeted 'dash'
 *   scenes (red/blue/yellow) now each use their own dash-arena background
 *   variant with the Balloon Dart stall recolored to match that round's
 *   target color, instead of all three sharing one rainbow-balloon
 *   background — sound-pop (letter-targeted, not color-targeted) keeps the
 *   original rainbow variant, which is correct there.
 * - Research step (activity-pattern-library's Required Research Step, now
 *   also a standing project rule for this and future lessons): checked
 *   real ESL sources before/alongside this design. Cambridge-aligned young-
 *   learner color-teaching resources (teach-this.com/vocabulary/colours,
 *   games4esl.com) independently confirm this lesson's flashcard ->
 *   sort -> "I Spy" progression as standard practice, not an invented
 *   sequence. Oxford Reading Tree's own phonics title "At the Carnival"
 *   (Floppy's Phonics, Level 1) independently pairs a carnival setting with
 *   environmental/letter-sound teaching — the same carnival+phonics pairing
 *   this lesson already uses for its R/Y/B sound-model scenes.
 * - Second follow-up round, per direct user feedback on the live build:
 *   (1) the three carnival-stand backgrounds (red balloon/blue cotton
 *   candy/yellow popcorn) were regenerated decluttered — the originals had
 *   a ferris wheel, a carousel horse, and (on the red/blue stands) a SECOND
 *   cluster of differently-colored balloons/candy competing with the one
 *   the scene was actually about, which made "what color is it?" genuinely
 *   ambiguous for a non-reading Pre-A1 student. Same const, so roleplay-red/
 *   yellow/blue and the storybook pages inherit the fix automatically.
 *   (2) join-stage's three "ask" turns got a new `arrow` field (same
 *   bouncing-arrow visual as color-spot) pointing at the exact object in
 *   frame, and the questions were unified to one plain "What color is it?"
 *   instead of mixed wording ("What color is the balloon?" / "Do you like
 *   blue?") — the arrow disambiguates now, not the sentence; dropping "I
 *   like/I don't like" from join-stage isn't losing that practice from the
 *   lesson, since roleplay-blue already models it. (3) added a new scene
 *   kind, 'word-picture-match' ("Read the Sign!"), the lesson's first
 *   dedicated pre-reading activity — printed word as the prompt, tap to
 *   hear it, pick the matching picture from 3 choices. Reuses the carnival
 *   stand signage (BALLOONS/COTTON CANDY/POPCORN) already visible in the
 *   lesson's own art and the already-transparent item icons, so no new art
 *   was needed. See the type's own comment for the Cambridge/Oxford
 *   research behind it.
 * - Third follow-up round: added a controlled 'sentence-build' practice
 *   scene ("It's ___", red/blue/yellow) between the sentence-modeling pass
 *   and the free-production join-stage — there was previously a gap
 *   straight from listening/repeating to unsupported production, per
 *   direct user feedback. Also added a real 'jigsaw-puzzle' finale scene
 *   (see that type's own comment) that reassembles the lesson's hero image,
 *   with pieces scattered into side trays rather than piled on the board
 *   and a shared, enlarged board size (`PUZZLE_BOARD_SIZE` in
 *   SceneRenderer.tsx) applied to both puzzle-family scene kinds.
 * ========================================================================= */

const itemYarn = `${A}/items/item-yarn.png`;
const itemYoyo = `${A}/items/item-yoyo.png`;
// Kept (not part of the Lesson 1 rebuild below) — Lessons 4 and 6 still
// reuse this original art for their own later color-review/recap scenes.
const itemRose = `${A}/items/item-rose.png`;
const bgU2L1ColorParade = `${A}/scenes/bg-u2l1-color-parade.png`;
const bgU2L1WaterOnly = `${A}/scenes/bg-u2l1-water-only.png`;
const bgU2L1SunflowerGroup = `${A}/scenes/bg-u2l1-sunflower-group.png`;
const bgU2L1DashArena = `${A}/scenes/bg-u2l1-dash-arena.png`;
const itemBalloonRed = `${A}/items/item-balloon-red.png`;
const itemCottonCandyBlue = `${A}/items/item-cottoncandy-blue.png`;
const itemPopcornYellow = `${A}/items/item-popcorn-yellow.png`;
const itemRing = `${A}/items/item-ring.png`;
const bgU2L1CHero = `${A}/scenes/bg-u2l1c-hero.png`;
const bgU2L1CBunting = `${A}/scenes/bg-u2l1c-bunting.png`;
const bgU2L1CTickets = `${A}/scenes/bg-u2l1c-tickets.png`;
const bgU2L1CRedBalloonStand = `${A}/scenes/bg-u2l1c-red-balloon-stand.png`;
const bgU2L1CBlueCottonCandyStand = `${A}/scenes/bg-u2l1c-blue-cottoncandy-stand.png`;
const bgU2L1CYellowPopcornStand = `${A}/scenes/bg-u2l1c-yellow-popcorn-stand.png`;
const bgU2L1CDashArena = `${A}/scenes/bg-u2l1c-dash-arena.png`;
// Color-matched dash-arena variants — same stalls/layout, but the Balloon
// Dart stall's balloons are recolored to the color being practiced in that
// round, instead of the shared background's neutral rainbow mix. The
// rainbow original stays in use for sound-pop, which is letter- not
// color-targeted ("Balloon Letter Pop!"), so a mixed palette is correct there.
const bgU2L1CDashArenaRed = `${A}/scenes/bg-u2l1c-dash-arena-red.png`;
const bgU2L1CDashArenaBlue = `${A}/scenes/bg-u2l1c-dash-arena-blue.png`;
const bgU2L1CDashArenaYellow = `${A}/scenes/bg-u2l1c-dash-arena-yellow.png`;
// Color-specific paint-splash icons (transparent bg) — replace the generic
// 🎨 emoji in ColorSpotScene's reveal card, one per taught color.
const iconSplashRed = `${A}/items/item-splash-red.png`;
const iconSplashBlue = `${A}/items/item-splash-blue.png`;
const iconSplashYellow = `${A}/items/item-splash-yellow.png`;
// Real flat-2D images (transparent bg, NOT emoji, NOT 3D/photo) replacing
// the last emoji-only vocabulary items in this lesson's R/B anchors and sort/dash games.
const itemRibbonBlue = `${A}/items/item-ribbon-blue.png`;
const itemDuckYellow = `${A}/items/item-duck-yellow.png`;
const itemBall = `${A}/items/item-ball.png`;
const itemBear = `${A}/items/item-bear.png`;

export const LESSON_U2L1_TITLE = 'Red, Blue, Yellow!';
export const LESSON_U2L1_OBJECTIVE = 'Identify and name the colors red, blue, and yellow, use them in simple sentences ("It\'s red," "I like blue," "I don\'t like yellow"), and recognize the R, Y, and B letter sounds.';

export const LESSON_U2L1_SCENES: Scene[] = [
  { id: 'u2l1-title', kind: 'title-card', bg: bgU2L1CHero, level: 'Pre-A1', unit: 'Unit 2', lessonLabel: 'Lesson 1', title: 'Red, Blue, Yellow!', subtitle: 'Welcome to the Color Carnival!' },
  {
    id: 'u2l1-intro', kind: 'cinematic', bg: bgU2L1CHero, title: 'Red, Blue, Yellow!', subtitle: 'A carnival full of colors', narrator: 'pip', hidePipOverlay: true,
    script: [
      { who: 'pip', line: 'Welcome to the Color Carnival!' },
      { who: 'pip', line: 'Look! Bella has a red balloon, Willow has blue cotton candy, and I have yellow popcorn!' },
    ],
    cta: "Let's play!",
  },
  {
    id: 'u2l1-vocab-colors', kind: 'color-model', bg: bgU2L1CBunting,
    teacher: 'Look! Tap a color to hear it, say it back, learn the word, then say the sentence!',
    items: [
      { colorWord: 'RED', colorHex: '#E63946', who: 'bella', exampleWord: 'Balloon', exampleImg: itemBalloonRed },
      { colorWord: 'BLUE', colorHex: '#3B82F6', who: 'willow', exampleWord: 'Cotton Candy', exampleImg: itemCottonCandyBlue },
      { colorWord: 'YELLOW', colorHex: '#FBBF24', who: 'pip', exampleWord: 'Popcorn', exampleImg: itemPopcornYellow },
    ],
  },
  {
    // Every other activity in this lesson teaches a color on an abstract
    // card/icon — this is the one place a learner finds the color by
    // tapping the real illustrated stand inside the carnival hero scene.
    // Coordinates measured on bg-u2l1c-hero.png's own stall positions.
    id: 'u2l1-color-spot', kind: 'color-spot', bg: bgU2L1CHero,
    teacher: 'Find the colors! Tap the arrow to learn each one.',
    items: [
      { colorWord: 'RED', colorHex: '#E63946', who: 'bella', label: 'Balloon', sentence: 'The balloon is red!', left: '13%', top: '20%', splashImg: iconSplashRed },
      { colorWord: 'BLUE', colorHex: '#3B82F6', who: 'willow', label: 'Cotton Candy', sentence: 'The cotton candy is blue!', left: '55%', top: '38%', splashImg: iconSplashBlue },
      { colorWord: 'YELLOW', colorHex: '#FBBF24', who: 'pip', label: 'Popcorn', sentence: 'The popcorn is yellow!', left: '88%', top: '45%', splashImg: iconSplashYellow },
    ],
  },
  {
    // "I Spy" — one of the most established color games for this exact
    // age/skill combo, since it requires picking the right answer out of
    // several visible at once, which color-spot's one-at-a-time reveal
    // never asks for. Same hero image and coordinates as color-spot.
    id: 'u2l1-color-spy', kind: 'color-spy', bg: bgU2L1CHero, teacher: 'I Spy! Find the color I say.', who: 'pip',
    spots: [
      { colorWord: 'RED', colorHex: '#E63946', label: 'Balloon', left: '13%', top: '20%' },
      { colorWord: 'BLUE', colorHex: '#3B82F6', label: 'Cotton Candy', left: '55%', top: '38%' },
      { colorWord: 'YELLOW', colorHex: '#FBBF24', label: 'Popcorn', left: '88%', top: '45%' },
    ],
    clueOrder: ['BLUE', 'YELLOW', 'RED'],
  },
  {
    // R, Y, B each get their own sound-model+trace pair, same as every
    // other unit1 lesson, anchored to real carnival words beyond just the
    // color itself — Ring (ring-toss) and Ribbon (prize ribbon) for R,
    // matching this lesson's own carnival setting instead of generic
    // filler words. Own prize-ticket-booth backdrop (bg-u2l1c-tickets.png).
    id: 'u2l1-model-r', kind: 'sound-model', bg: bgU2L1CTickets, who: 'bella', letter: 'R', phoneme: '/r/', sound: 'rrr', teacher: 'Bella models the /r/ sound! Listen first: /r/ /r/ Red. /r/ /r/ Ring.',
    anchors: [
      { word: 'Red', emoji: '\u{1F534}', img: itemBalloonRed },
      { word: 'Ring', emoji: '\u{1F3AF}', img: itemRing },
      { word: 'Ribbon', emoji: '\u{1F380}', img: itemRibbonBlue },
    ],
  },
  { id: 'u2l1-trace-r', kind: 'trace', bg: bgU2L1CTickets, who: 'bella', letter: 'R', phoneme: '/r/', word: 'Red', teacher: 'Trace the ready R. /r/ /r/ Red!' },
  {
    // Interleaved right after R's model+trace (not grouped with the other
    // two roleplay scenes at the end) so the Hard Variety Rule's "no kind
    // 3x in a row" holds without merging three scenes that each need a
    // different single-object background into one.
    id: 'u2l1-roleplay-red', kind: 'roleplay', bg: bgU2L1CRedBalloonStand, teacher: 'Story time! Listen to Bella and Pip, then repeat.', cast: ['bella', 'pip'],
    script: [
      { who: 'bella', line: "It's red!", repeat: true },
      { who: 'pip', line: 'I like red!', repeat: true },
    ],
  },
  {
    id: 'u2l1-model-y', kind: 'sound-model', bg: bgU2L1CTickets, who: 'pip', letter: 'Y', phoneme: '/y/', sound: 'yuh', teacher: 'Pip models the /y/ sound! Listen first: /y/ /y/ Yellow. /y/ /y/ Yo-yo.',
    anchors: [
      { word: 'Yellow', emoji: '\u{1F7E1}', img: itemPopcornYellow },
      { word: 'Yo-yo', emoji: '\u{1FA80}', img: itemYoyo },
      { word: 'Yarn', emoji: '\u{1F9F6}', img: itemYarn },
    ],
  },
  { id: 'u2l1-trace-y', kind: 'trace', bg: bgU2L1CTickets, who: 'pip', letter: 'Y', phoneme: '/y/', word: 'Yellow', teacher: 'Trace the young Y. /y/ /y/ Yellow!' },
  {
    id: 'u2l1-roleplay-yellow', kind: 'roleplay', bg: bgU2L1CYellowPopcornStand, teacher: 'Now listen to Pip and Bella talk about the popcorn, then repeat.', cast: ['pip', 'bella'],
    script: [
      { who: 'pip', line: "It's yellow!", repeat: true },
      { who: 'bella', line: 'I like yellow!', repeat: true },
    ],
  },
  {
    // B already introduced in Lesson 4 (Bag/Ball/Bye), but this lesson's
    // own color-sort/dash cues still need their own model moment here, not
    // just a bare retrieval hint. Willow models it, since blue is her color.
    id: 'u2l1-model-b', kind: 'sound-model', bg: bgU2L1CTickets, who: 'willow', letter: 'B', phoneme: '/b/', sound: 'buh', teacher: 'Willow models the /b/ sound! Listen first: /b/ /b/ Blue. /b/ /b/ Ball.',
    anchors: [
      { word: 'Blue', emoji: '\u{1F535}', img: itemCottonCandyBlue },
      { word: 'Ball', emoji: '\u{26BD}', img: itemBall },
      { word: 'Bear', emoji: '\u{1F9F8}', img: itemBear },
    ],
  },
  { id: 'u2l1-trace-b', kind: 'trace', bg: bgU2L1CTickets, who: 'willow', letter: 'B', phoneme: '/b/', word: 'Blue', teacher: 'Trace the bouncy B. /b/ /b/ Blue!' },
  {
    // Also models the negative form ("I don't like ___") — a real, friendly
    // difference in preference, not a disagreement — so the lesson covers
    // all three simple patterns, not just the positive one.
    id: 'u2l1-roleplay-blue', kind: 'roleplay', bg: bgU2L1CBlueCottonCandyStand, teacher: 'Now listen to Willow and Pip talk about the cotton candy, then repeat.', cast: ['willow', 'pip'],
    script: [
      { who: 'willow', line: "It's blue!", repeat: true },
      { who: 'pip', line: "I don't like blue!", repeat: true },
    ],
  },
  {
    id: 'u2l1-sort-colors', kind: 'color-sort', bg: bgU2L1CBunting, teacher: "Listen for the sound! /r/ed, /b/lue, /y/ellow — now drag each thing to its color!",
    targets: [
      { colorWord: 'RED', colorHex: '#E63946', who: 'bella' },
      { colorWord: 'BLUE', colorHex: '#3B82F6', who: 'willow' },
      { colorWord: 'YELLOW', colorHex: '#FBBF24', who: 'pip' },
    ],
    items: [
      { word: 'balloon', emoji: '\u{1F388}', img: itemBalloonRed, colorWord: 'RED' },
      { word: 'ring', emoji: '\u{1F3AF}', img: itemRing, colorWord: 'RED' },
      { word: 'cotton candy', emoji: '\u{1F36C}', img: itemCottonCandyBlue, colorWord: 'BLUE' },
      { word: 'ribbon', emoji: '\u{1F397}️', img: itemRibbonBlue, colorWord: 'BLUE' },
      { word: 'popcorn', emoji: '\u{1F37F}', img: itemPopcornYellow, colorWord: 'YELLOW' },
      { word: 'duck', emoji: '\u{1F986}', img: itemDuckYellow, colorWord: 'YELLOW' },
    ],
  },
  {
    // Dash round 1 of 3 — separated from rounds 2 and 3 by color-quiz and
    // color-friends (Hard Variety Rule) instead of all three in a row.
    id: 'u2l1-dash-red', kind: 'dash', bg: bgU2L1CDashArenaRed, teacher: 'Bella Dash! Tap only the RED things as they run by. Get 6 rings!', who: 'bella', targetLetter: 'RED', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'balloon', letter: 'RED', img: itemBalloonRed, emoji: '\u{1F388}' },
      { word: 'ring', letter: 'RED', img: itemRing, emoji: '\u{1F3AF}' },
      { word: 'cotton candy', letter: 'BLUE', img: itemCottonCandyBlue, emoji: '\u{1F36C}' },
      { word: 'ribbon', letter: 'BLUE', img: itemRibbonBlue, emoji: '\u{1F397}️' },
      { word: 'popcorn', letter: 'YELLOW', img: itemPopcornYellow, emoji: '\u{1F37F}' },
      { word: 'duck', letter: 'YELLOW', img: itemDuckYellow, emoji: '\u{1F986}' },
    ],
  },
  {
    id: 'u2l1-color-quiz', kind: 'color-quiz', bg: bgU2L1CBunting, teacher: 'Which one is the right color? Tap it!',
    rounds: [
      { colorWord: 'RED', colorHex: '#E63946', who: 'bella', correctImg: itemBalloonRed, correctLabel: 'Balloon', distractors: [{ img: itemCottonCandyBlue, label: 'Cotton Candy' }, { img: itemPopcornYellow, label: 'Popcorn' }] },
      { colorWord: 'BLUE', colorHex: '#3B82F6', who: 'willow', correctImg: itemCottonCandyBlue, correctLabel: 'Cotton Candy', distractors: [{ img: itemBalloonRed, label: 'Balloon' }, { img: itemPopcornYellow, label: 'Popcorn' }] },
      { colorWord: 'YELLOW', colorHex: '#FBBF24', who: 'pip', correctImg: itemPopcornYellow, correctLabel: 'Popcorn', distractors: [{ img: itemBalloonRed, label: 'Balloon' }, { img: itemCottonCandyBlue, label: 'Cotton Candy' }] },
    ],
  },
  {
    // Dash round 2 of 3.
    id: 'u2l1-dash-blue', kind: 'dash', bg: bgU2L1CDashArenaBlue, teacher: 'Willow Dash! Tap only the BLUE things as they run by. Get 6 rings!', who: 'willow', targetLetter: 'BLUE', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'cotton candy', letter: 'BLUE', img: itemCottonCandyBlue, emoji: '\u{1F36C}' },
      { word: 'ribbon', letter: 'BLUE', img: itemRibbonBlue, emoji: '\u{1F397}️' },
      { word: 'popcorn', letter: 'YELLOW', img: itemPopcornYellow, emoji: '\u{1F37F}' },
      { word: 'duck', letter: 'YELLOW', img: itemDuckYellow, emoji: '\u{1F986}' },
      { word: 'balloon', letter: 'RED', img: itemBalloonRed, emoji: '\u{1F388}' },
      { word: 'ring', letter: 'RED', img: itemRing, emoji: '\u{1F3AF}' },
    ],
  },
  {
    // Colors the vocabulary objects themselves instead of a character —
    // "the balloon is red" reinforced by actually painting it red, not a
    // generic bonus round. Reuses VocabOutline's existing generic
    // silhouettes (round shapes, not literally fruit/sun/water-specific —
    // Lesson 2 already reused the same three for leaf/orange/grapes).
    // Hex values match PAINT_COLORS in ColorFriendsScene exactly so the
    // palette's suggested-swatch pulse finds and highlights the right one.
    id: 'u2l1-color-friends', kind: 'color-friends', bg: bgU2L1CBunting, teacher: 'Carnival colors! Paint each prize its real color!',
    vocabItems: [
      { label: 'Balloon', targetColorHex: '#EF4444', targetColorName: 'Red', outline: 'apple' },
      { label: 'Cotton Candy', targetColorHex: '#3B82F6', targetColorName: 'Blue', outline: 'sun' },
      { label: 'Popcorn', targetColorHex: '#FACC15', targetColorName: 'Yellow', outline: 'water' },
    ],
  },
  {
    // Dash round 3 of 3.
    id: 'u2l1-dash-yellow', kind: 'dash', bg: bgU2L1CDashArenaYellow, teacher: 'Pip Dash! Tap only the YELLOW things as they run by. Get 6 rings!', who: 'pip', targetLetter: 'YELLOW', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'popcorn', letter: 'YELLOW', img: itemPopcornYellow, emoji: '\u{1F37F}' },
      { word: 'duck', letter: 'YELLOW', img: itemDuckYellow, emoji: '\u{1F986}' },
      { word: 'balloon', letter: 'RED', img: itemBalloonRed, emoji: '\u{1F388}' },
      { word: 'ring', letter: 'RED', img: itemRing, emoji: '\u{1F3AF}' },
      { word: 'cotton candy', letter: 'BLUE', img: itemCottonCandyBlue, emoji: '\u{1F36C}' },
      { word: 'ribbon', letter: 'BLUE', img: itemRibbonBlue, emoji: '\u{1F397}️' },
    ],
  },
  {
    // Genuinely new mechanic for this lesson (not a reskin): "Balloon
    // Letter Pop!" — already built for other unit1 lessons' phonics
    // review but never used here. A real carnival balloon-pop game
    // reinforcing the R/Y/B letters just modeled, not another sort/quiz.
    id: 'u2l1-sound-pop', kind: 'sound-pop', bg: bgU2L1CDashArena, teacher: 'Balloon Letter Pop! Listen for the letter, then pop only that balloon!', who: 'bella', goal: 8, seconds: 45,
    targets: [
      { letter: 'R', phoneme: '/r/' },
      { letter: 'Y', phoneme: '/y/' },
      { letter: 'B', phoneme: '/b/' },
    ],
    items: [
      { word: 'R', letter: 'R', emoji: 'R' },
      { word: 'Y', letter: 'Y', emoji: 'Y' },
      { word: 'B', letter: 'B', emoji: 'B' },
    ],
  },
  {
    id: 'u2l1-word-build', kind: 'word-build', bg: bgU2L1CTickets, teacher: 'Listen! Tap the missing letter to make the word.',
    rounds: [
      { word: 'red', blankIndex: 0, answer: 'R', choices: ['R', 'B', 'Y'], img: itemBalloonRed, emoji: '\u{1F534}' },
      { word: 'blue', blankIndex: 0, answer: 'B', choices: ['R', 'B', 'Y'], img: itemCottonCandyBlue, emoji: '\u{1F535}' },
      { word: 'yellow', blankIndex: 0, answer: 'Y', choices: ['R', 'B', 'Y'], img: itemPopcornYellow, emoji: '\u{1F7E1}' },
    ],
  },
  {
    // "Ringmaster Says" — Simon Says color-sequence memory, a genuinely
    // different skill (short-term sequence memory + color-word/swatch
    // mapping under mild pressure) from anything else in this lesson.
    id: 'u2l1-color-simon', kind: 'color-simon', bg: bgU2L1CBunting, teacher: 'The Ringmaster says... watch, then copy the color pattern!', maxRounds: 4,
    colors: [
      { colorWord: 'RED', colorHex: '#E63946', who: 'bella' },
      { colorWord: 'BLUE', colorHex: '#3B82F6', who: 'willow' },
      { colorWord: 'YELLOW', colorHex: '#FBBF24', who: 'pip' },
    ],
  },
  {
    id: 'u2l1-who', kind: 'listen-repeat-cards', bg: bgU2L1CHero, teacher: 'Listen to each friend, then repeat!',
    cards: [
      { who: 'bella', sentence: 'The balloon is red!', img: itemBalloonRed, imgLabel: 'Balloon' },
      { who: 'willow', sentence: 'The cotton candy is blue!', img: itemCottonCandyBlue, imgLabel: 'Cotton Candy' },
      { who: 'pip', sentence: 'The popcorn is yellow!', img: itemPopcornYellow, imgLabel: 'Popcorn' },
    ],
  },
  {
    // Models all six sentences ("It's ___" for all three colors, then "I
    // like ___" for all three) as a listen-and-repeat drill, one
    // consolidated place to practice the full pattern set before
    // join-stage asks for the same sentences from memory with no model.
    id: 'u2l1-sentence-practice', kind: 'listen-repeat-cards', bg: bgU2L1CHero, teacher: 'Listen to each sentence, then repeat!',
    cards: [
      { who: 'bella', sentence: "It's red!", img: itemBalloonRed, imgLabel: 'Red' },
      { who: 'willow', sentence: "It's blue!", img: itemCottonCandyBlue, imgLabel: 'Blue' },
      { who: 'pip', sentence: "It's yellow!", img: itemPopcornYellow, imgLabel: 'Yellow' },
      { who: 'bella', sentence: 'I like red!', img: itemBalloonRed, imgLabel: 'Red' },
      { who: 'willow', sentence: 'I like blue!', img: itemCottonCandyBlue, imgLabel: 'Blue' },
      { who: 'pip', sentence: 'I like yellow!', img: itemPopcornYellow, imgLabel: 'Yellow' },
    ],
  },
  {
    // Guided/controlled practice of the exact "It's ___" sentences just
    // modeled above — per direct user request: production needs a
    // scaffolded practice step between modeling (listen-repeat-cards) and
    // free production (join-stage, no model at all). Student taps the
    // shuffled words into order rather than just listening/repeating, and
    // each tile shows the word only once placed (the pattern this kind
    // already uses elsewhere — see the 'sentence-build' type comment).
    id: 'u2l1-sentence-build', kind: 'sentence-build', bg: bgU2L1CBunting, teacher: 'The words are mixed up! Tap them in order to build the sentence.',
    rounds: [
      { words: ["It's", 'red'], colors: [null, '#E63946'], img: itemBalloonRed },
      { words: ["It's", 'blue'], colors: [null, '#3B82F6'], img: itemCottonCandyBlue },
      { words: ["It's", 'yellow'], colors: [null, '#FBBF24'], img: itemPopcornYellow },
    ],
  },
  {
    // Free production — "It's ___" with no line modeled right before it.
    // Each question shows the actual stand it's asking about (now a
    // decluttered single-object version, no ferris wheel/second balloon
    // cluster competing for attention — direct user fix), AND an arrow
    // points at the exact object, same as color-spot's pattern. Questions
    // simplified to one uniform "What color is it?" per direct user
    // request — the arrow does the disambiguating, not the wording. The
    // "I like/I don't like" negative-form practice stays covered by
    // roleplay-blue ("It's blue!"/"I don't like blue!"), so dropping it
    // here isn't losing that practice from the lesson, just de-duplicating.
    id: 'u2l1-join-stage', kind: 'join-stage', bg: bgU2L1CHero, teacher: 'Your turn! When it says YOU, say the color.', cast: ['pip', 'willow', 'bella'],
    turns: [
      { who: 'pip', line: 'What color is it?', bg: bgU2L1CRedBalloonStand, arrow: { left: '72%', top: '20%', dir: 'down' } },
      { who: 'student', line: "It's ______.", bg: bgU2L1CRedBalloonStand, arrow: { left: '72%', top: '20%', dir: 'down' } },
      { who: 'willow', line: 'What color is it?', bg: bgU2L1CBlueCottonCandyStand, arrow: { left: '49%', top: '38%', dir: 'down' } },
      { who: 'student', line: "It's ______.", bg: bgU2L1CBlueCottonCandyStand, arrow: { left: '49%', top: '38%', dir: 'down' } },
      { who: 'bella', line: 'What color is it?', bg: bgU2L1CYellowPopcornStand, arrow: { left: '27%', top: '70%', dir: 'down' } },
      { who: 'student', line: "It's ______.", bg: bgU2L1CYellowPopcornStand, arrow: { left: '27%', top: '70%', dir: 'down' } },
    ],
  },
  {
    // "A Day at the Color Carnival" — each page shows ONLY the one object
    // its sentence names; only the final capstone page shows all three
    // together, since that page is the recap.
    id: 'u2l1-storybook', kind: 'flipbook', bg: bgU2L1CHero, title: 'A Day at the Color Carnival',
    pages: [
      { who: 'bella', img: bgU2L1CRedBalloonStand, text: 'Bella found a big red balloon at the carnival!' },
      { who: 'willow', img: bgU2L1CBlueCottonCandyStand, text: 'Then Willow got some blue cotton candy.' },
      { who: 'pip', img: bgU2L1CYellowPopcornStand, text: 'Pip found yellow popcorn, too!' },
      { who: 'pip', img: bgU2L1CHero, text: 'Red, blue, yellow — what a colorful day at the carnival!' },
    ],
    checkpoints: [
      { afterPage: 0, who: 'pip', question: 'What color is the balloon?', options: ['Red', 'Blue', 'Yellow'], answer: 'Red' },
      { afterPage: 2, who: 'willow', question: 'What color is the popcorn?', options: ['Red', 'Blue', 'Yellow'], answer: 'Yellow' },
    ],
  },
  {
    // Reading-readiness activity — see the 'word-picture-match' type comment
    // for the Cambridge/Oxford research behind this. Reuses the carnival's
    // own stand signage (BALLOONS/COTTON CANDY/POPCORN) as the reading
    // target, and the already-transparent item icons as picture choices —
    // no new art needed.
    id: 'u2l1-read-signs', kind: 'word-picture-match', bg: bgU2L1CBunting, teacher: 'Read the carnival signs, then find the matching prize!',
    rounds: [
      { word: 'BALLOONS', who: 'bella', correctImg: itemBalloonRed, correctLabel: 'Balloon', distractors: [{ img: itemCottonCandyBlue, label: 'Cotton Candy' }, { img: itemPopcornYellow, label: 'Popcorn' }] },
      { word: 'COTTON CANDY', who: 'willow', correctImg: itemCottonCandyBlue, correctLabel: 'Cotton Candy', distractors: [{ img: itemBalloonRed, label: 'Balloon' }, { img: itemPopcornYellow, label: 'Popcorn' }] },
      { word: 'POPCORN', who: 'pip', correctImg: itemPopcornYellow, correctLabel: 'Popcorn', distractors: [{ img: itemBalloonRed, label: 'Balloon' }, { img: itemCottonCandyBlue, label: 'Cotton Candy' }] },
    ],
  },
  {
    // Real jigsaw finale — see the 'jigsaw-puzzle' type comment for how the
    // interlocking piece shapes are generated. Reassembles the lesson's own
    // hero image (the carnival scene shown at the very start), so finishing
    // the puzzle doubles as a visual "you explored this whole place" recap.
    id: 'u2l1-jigsaw', kind: 'jigsaw-puzzle', bg: bgU2L1CBunting, teacher: 'Drag the pieces to build the carnival picture!', image: bgU2L1CHero,
  },
  {
    id: 'u2l1-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to the Color Carnival! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3580, 4020, 4980, 7482],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'pip', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'u2l1-finale', kind: 'finale', bg: bgU2L1CHero, who: 'bella', line: 'You did it! You can name red, blue, and yellow at the Color Carnival! \u{1F3A1}' },
];

/* =============================================================================
 * Pre-A1 Unit 2, Lesson 2 — "Green, Orange, Purple!"
 *
 * The curriculum blueprint's own pre-seeded stub for this exact slot
 * (curriculum_lessons row bff2b3d6-f87a-4e7d-8b79-46b4b37eeaa3) already named
 * the topic: "Unit 2 · The Rainbow Meadow" continuing straight on from
 * Lesson 1's red/blue/yellow into green/orange/purple. This is a from-scratch
 * build, not a rebuild — but it applies every lesson learned from Lesson 1's
 * many rounds of direct feedback from the start, instead of repeating the
 * same mistakes and needing the same fixes again:
 *
 * - Cast: each new color gets its own speaker, none reused from Lesson 1's
 *   red/blue/yellow assignments (Bella/Willow/Pip) so the two lessons don't
 *   contradict each other about who "owns" which color. Willow=GREEN (she
 *   already wears a green scarf in her own sprite — a genuine, not invented,
 *   fit), Leo=ORANGE (his own mane/body are already orange-toned), Mia=PURPLE
 *   (her CAST hex #B85CD1 is already a purple). Pip stays the narrator/host
 *   and the consistent second character in every roleplay exchange, exactly
 *   as he was in Lesson 1.
 * - Objective: identify, name, and use in a simple sentence the colors
 *   green, orange, and purple — same "It's ___ / I like ___ / I don't like
 *   ___" pattern family Lesson 1 was corrected to, not the original
 *   object-specific frames that lesson started with.
 * - Phonics: ALL THREE new letters (G, O, P) get their own sound-model+trace
 *   pair from the start — Lesson 1 shipped with none at all, then needed R
 *   and Y added, then needed B added on top of that after direct feedback
 *   pointed out the gap twice. Built complete here the first time.
 * - Art: every scene that stages a specific character performing a specific
 *   action gets a dedicated, single-object image — never a shared busy
 *   image asked to cover two different sentences (Lesson 1's roleplay had to
 *   be split in two, and its flipbook's water/sunflower pages had to be
 *   regenerated, because a pre-reading learner has no way to tell which
 *   object a shared image is about). bg-u2l2-green/orange/purple-only.png
 *   are single-object from generation, not reused across mismatched pages.
 * - Every generated image explicitly demands full-bleed, anti-frame,
 *   anti-sticker formatting up front (Lesson 1's assets needed multiple
 *   regeneration rounds after coming back as framed canvases or stickers on
 *   white — several U2L2 images hit the exact same failure mode on the
 *   first attempt and were regenerated with stronger anti-frame wording
 *   before being accepted).
 * - Sentence production gets three distinct layers from the start (Lesson 1
 *   added these one at a time over several rounds): u2l1→u2l2 mirrors
 *   sentence-practice (modeled listen-and-repeat, all six sentences) →
 *   roleplay (dialogue, modeled, one color at a time) → join-stage (free
 *   production, no model). Modeled practice comes before free production.
 * - Dash covers all three colors from the start (three rounds), not one
 *   color with the other two left untested, and 'memory' — a generic
 *   icon-matching game with no real tie to color recognition — is skipped
 *   entirely rather than included and later swapped out.
 * - The dash rounds get their own dedicated, color-matched arena background
 *   (bg-u2l2-dash-arena.png, green/orange/purple flowers) instead of
 *   reusing a generic unrelated scene.
 * ========================================================================= */

const itemLeaf = `${A}/items/item-leaf.png`;
const itemOrange = `${A}/items/item-orange.png`;
const itemGrapes = `${A}/items/item-grapes.png`;
const bgU2L2ColorParade = `${A}/scenes/bg-u2l2-color-parade.png`;
const bgU2L2GreenOnly = `${A}/scenes/bg-u2l2-green-only.png`;
const bgU2L2OrangeOnly = `${A}/scenes/bg-u2l2-orange-only.png`;
const bgU2L2PurpleOnly = `${A}/scenes/bg-u2l2-purple-only.png`;
const bgU2L2SoundGarden = `${A}/scenes/bg-u2l2-sound-garden.png`;
const bgU2L2DashArena = `${A}/scenes/bg-u2l2-dash-arena.png`;

/* REBUILD (2026-10-03) per the curriculum + lesson blueprints (22-slide
 * skeleton, 6 core words, one phonics micro-moment, child asks as well as
 * answers, home mission). Replaces the first version, which had square art,
 * three new letters (G, O, P — "Owl" isn't a short-o word), a colouring game
 * on mismatched outlines (leaf in an apple outline), a "purple" balloon drawn
 * red, three dashes and three role-plays in a row, no review of Lesson 1's
 * colours, and the same goodbye song as every lesson.
 *
 * Core words: green, orange, purple (+ frog, carrot, grapes; leaf, pumpkin,
 * plum as second examples). Chunks: "What color is it?" / "It's green." /
 * "I like purple." Signature game: Magic Paint Pots (color-mix) — mix
 * Lesson 1's red/blue/yellow into the new colours and NAME the result.
 * Phonics micro-moment: /g/ (green, grapes, goat). Wide 16:9 art. */
const itemFrog = `${A}/items/item-frog.png`;
const itemCarrot = `${A}/items/item-carrot.png`;
const itemPumpkin = `${A}/items/item-pumpkin.png`;
const itemPlum = `${A}/items/item-plum.png`;
const itemPaintPot = `${A}/items/item-paint-pot-empty.png`;
const bgU2L2Meadow = `${A}/scenes/bg-u2l2-meadow-wide.png`;
const bgU2L2PaintLab = `${A}/scenes/bg-u2l2-paint-lab-wide.png`;
const bgU2L2Green = `${A}/scenes/bg-u2l2-green-wide.png`;
const bgU2L2Orange = `${A}/scenes/bg-u2l2-orange-wide.png`;
const bgU2L2Purple = `${A}/scenes/bg-u2l2-purple-wide.png`;
const GREEN = '#22C55E';
const ORANGE = '#F97316';
const PURPLE = '#A855F7';

export const LESSON_U2L2_TITLE = 'Green, Orange, Purple!';
export const LESSON_U2L2_OBJECTIVE = 'Name green, orange and purple (frog, carrot, grapes), ask and answer "What color is it?" — "It\'s green.", say "I like purple.", and mix Lesson 1\'s red, blue and yellow to make the new colours.';

export const LESSON_U2L2_SCENES: Scene[] = [
  { id: 'u2l2-title', kind: 'title-card', bg: bgU2L2Meadow, level: 'Pre-A1', unit: 'Unit 2', lessonLabel: 'Lesson 2', title: 'Green, Orange, Purple!', subtitle: 'Mix the magic paints' },

  {
    // Warm-up: the lesson's colours song (scripts/songs.json "u2l2-colors").
    id: 'u2l2-song', kind: 'song', bg: bgU2L2Meadow, title: '\u{1F3B5} The Colors Song \u{1F3B5}', teacher: 'Sing and point! Point to the frog, the carrots and the grapes.',
    durationSeconds: 20, bigWord: 'Colors', songUrl: `${A}/audio/colors-song-u2l2.mp3?v=1`,
    lineDurationsMs: [4120, 4000, 4140, 7802],
    songPrompt: 'Upbeat kids pop colours song',
    lyrics: [
      { who: 'willow', text: 'Green, green, the frog is green!', emotion: 'happy' },
      { who: 'leo', text: 'Orange, orange, the carrot is orange!', emotion: 'happy' },
      { who: 'mia', text: 'Purple, purple, the grapes are purple!', emotion: 'happy' },
      { who: 'pip', text: 'What color is it? What color is it?', emotion: 'happy' },
    ],
  },

  {
    id: 'u2l2-intro', kind: 'cinematic', bg: bgU2L2Meadow, hidePipOverlay: true, title: 'The Rainbow Meadow', subtitle: 'Three new colors are hiding here', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hello! Remember red, blue and yellow?' },
      { who: 'pip', line: 'Today we find three new colors in the meadow!' },
    ],
    cta: "Let's look!",
  },

  /* ---- Input: the three new colours on three clear objects ---- */
  {
    id: 'u2l2-vocab-colors', kind: 'color-model', bg: bgU2L2Meadow,
    teacher: 'Tap a color. Listen, say it, then say the sentence!',
    items: [
      { colorWord: 'GREEN', colorHex: GREEN, who: 'willow', exampleWord: 'Frog', exampleImg: itemFrog },
      { colorWord: 'ORANGE', colorHex: ORANGE, who: 'leo', exampleWord: 'Carrot', exampleImg: itemCarrot },
      { colorWord: 'PURPLE', colorHex: PURPLE, who: 'mia', exampleWord: 'Grapes', exampleImg: itemGrapes },
    ],
  },
  {
    id: 'u2l2-color-spot', kind: 'color-spot', bg: bgU2L2Meadow,
    teacher: 'Find the colors in the meadow! Tap each arrow.',
    items: [
      { colorWord: 'GREEN', colorHex: GREEN, who: 'willow', label: 'Frog', sentence: 'The frog is green!', left: '11%', top: '66%' },
      { colorWord: 'ORANGE', colorHex: ORANGE, who: 'leo', label: 'Carrots', sentence: 'The carrots are orange!', left: '55%', top: '72%' },
      { colorWord: 'PURPLE', colorHex: PURPLE, who: 'mia', label: 'Grapes', sentence: 'The grapes are purple!', left: '91%', top: '46%' },
    ],
  },
  {
    // The question chunk, modeled before anyone has to use it.
    id: 'u2l2-question-model', kind: 'listen-repeat-cards', bg: bgU2L2Meadow, teacher: 'Listen to the question and the answer. Then say them!',
    cards: [
      { who: 'pip', sentence: 'What color is it?', img: itemFrog, imgLabel: 'Frog' },
      { who: 'willow', sentence: "It's green!", img: itemFrog, imgLabel: 'Green' },
      { who: 'pip', sentence: 'What color is it?', img: itemCarrot, imgLabel: 'Carrot' },
      { who: 'leo', sentence: "It's orange!", img: itemCarrot, imgLabel: 'Orange' },
    ],
  },

  /* ---- Signature game ---- */
  {
    id: 'u2l2-paint-pots', kind: 'color-mix', bg: bgU2L2PaintLab, who: 'pip', potImg: itemPaintPot,
    teacher: 'Magic Paint Pots! Mix two paints, then name the new color.',
    paints: [
      { colorWord: 'RED', colorHex: '#EF4444' },
      { colorWord: 'BLUE', colorHex: '#3B82F6' },
      { colorWord: 'YELLOW', colorHex: '#FACC15' },
    ],
    answers: [
      { colorWord: 'GREEN', colorHex: GREEN },
      { colorWord: 'ORANGE', colorHex: ORANGE },
      { colorWord: 'PURPLE', colorHex: PURPLE },
    ],
    rounds: [
      { a: 'BLUE', b: 'YELLOW', result: 'GREEN', resultHex: GREEN, who: 'willow', img: itemFrog, label: 'Frog', line: 'The frog is green!' },
      { a: 'RED', b: 'YELLOW', result: 'ORANGE', resultHex: ORANGE, who: 'leo', img: itemCarrot, label: 'Carrot', line: 'The carrot is orange!' },
      { a: 'RED', b: 'BLUE', result: 'PURPLE', resultHex: PURPLE, who: 'mia', img: itemGrapes, label: 'Grapes', line: 'The grapes are purple!' },
    ],
  },

  /* ---- Controlled practice ---- */
  {
    id: 'u2l2-sort-colors', kind: 'color-sort', bg: bgU2L2Meadow, teacher: 'Listen, then drag each thing to its color!',
    targets: [
      { colorWord: 'GREEN', colorHex: GREEN, who: 'willow' },
      { colorWord: 'ORANGE', colorHex: ORANGE, who: 'leo' },
      { colorWord: 'PURPLE', colorHex: PURPLE, who: 'mia' },
    ],
    items: [
      { word: 'frog', img: itemFrog, emoji: '\u{1F438}', colorWord: 'GREEN' },
      { word: 'leaf', img: itemLeaf, emoji: '\u{1F343}', colorWord: 'GREEN' },
      { word: 'carrot', img: itemCarrot, emoji: '\u{1F955}', colorWord: 'ORANGE' },
      { word: 'pumpkin', img: itemPumpkin, emoji: '\u{1F383}', colorWord: 'ORANGE' },
      { word: 'grapes', img: itemGrapes, emoji: '\u{1F347}', colorWord: 'PURPLE' },
      { word: 'plum', img: itemPlum, emoji: '\u{1F7E3}', colorWord: 'PURPLE' },
    ],
  },

  /* ---- Phonics micro-moment: /g/ ---- */
  {
    id: 'u2l2-model-g', kind: 'sound-model', bg: bgU2L2Green, who: 'willow', letter: 'G', phoneme: '/g/', sound: 'guh',
    teacher: 'Listen to the /g/ sound. Green, grapes, goat!',
    anchors: [
      { word: 'green', emoji: '\u{1F49A}', img: itemLeaf },
      { word: 'grapes', emoji: '\u{1F347}', img: itemGrapes },
      { word: 'goat', emoji: '\u{1F410}' },
    ],
  },
  { id: 'u2l2-trace-g', kind: 'trace', bg: bgU2L2Green, who: 'willow', letter: 'G', phoneme: '/g/', word: 'green', teacher: 'Trace the big G! Say /g/ /g/ as you draw.' },

  /* ---- Games ---- */
  {
    id: 'u2l2-color-spy', kind: 'color-spy', bg: bgU2L2Meadow, who: 'pip', teacher: 'I Spy! Find the color Pip says.',
    spots: [
      { colorWord: 'GREEN', colorHex: GREEN, label: 'Frog', left: '11%', top: '74%' },
      { colorWord: 'ORANGE', colorHex: ORANGE, label: 'Carrots', left: '55%', top: '84%' },
      { colorWord: 'PURPLE', colorHex: PURPLE, label: 'Grapes', left: '91%', top: '58%' },
    ],
    clueOrder: ['PURPLE', 'GREEN', 'ORANGE'],
  },
  {
    id: 'u2l2-dash-purple', kind: 'dash', bg: bgU2L2Meadow, teacher: 'Mia Dash! Tap only the PURPLE things. Get 6!', who: 'mia', targetLetter: 'PURPLE', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'grapes', letter: 'PURPLE', img: itemGrapes, emoji: '\u{1F347}' },
      { word: 'plum', letter: 'PURPLE', img: itemPlum, emoji: '\u{1F7E3}' },
      { word: 'frog', letter: 'GREEN', img: itemFrog, emoji: '\u{1F438}' },
      { word: 'leaf', letter: 'GREEN', img: itemLeaf, emoji: '\u{1F343}' },
      { word: 'carrot', letter: 'ORANGE', img: itemCarrot, emoji: '\u{1F955}' },
      { word: 'pumpkin', letter: 'ORANGE', img: itemPumpkin, emoji: '\u{1F383}' },
    ],
  },
  {
    id: 'u2l2-color-quiz', kind: 'color-quiz', bg: bgU2L2Meadow, teacher: 'Listen! Tap the right one.',
    rounds: [
      { colorWord: 'GREEN', colorHex: GREEN, who: 'willow', correctImg: itemLeaf, correctLabel: 'Leaf', distractors: [{ img: itemPumpkin, label: 'Pumpkin' }, { img: itemPlum, label: 'Plum' }] },
      { colorWord: 'ORANGE', colorHex: ORANGE, who: 'leo', correctImg: itemPumpkin, correctLabel: 'Pumpkin', distractors: [{ img: itemPlum, label: 'Plum' }, { img: itemLeaf, label: 'Leaf' }] },
      { colorWord: 'PURPLE', colorHex: PURPLE, who: 'mia', correctImg: itemPlum, correctLabel: 'Plum', distractors: [{ img: itemLeaf, label: 'Leaf' }, { img: itemPumpkin, label: 'Pumpkin' }] },
    ],
  },

  /* ---- Speaking: the child answers, then asks ---- */
  {
    id: 'u2l2-you-answer', kind: 'join-stage', bg: bgU2L2Meadow, teacher: 'Your turn! When it says YOU, say the color.', cast: ['pip', 'willow', 'leo', 'mia'],
    turns: [
      { who: 'pip', line: 'What color is the frog?', bg: bgU2L2Green, arrow: { left: '50%', top: '42%' } },
      { who: 'student', line: "It's …", bg: bgU2L2Green, arrow: { left: '50%', top: '42%' } },
      { who: 'pip', line: 'What color is the carrot?', bg: bgU2L2Orange, arrow: { left: '38%', top: '28%' } },
      { who: 'student', line: "It's …", bg: bgU2L2Orange, arrow: { left: '38%', top: '28%' } },
      { who: 'pip', line: 'What color are the grapes?', bg: bgU2L2Purple, arrow: { left: '38%', top: '38%' } },
      { who: 'student', line: "They're …", bg: bgU2L2Purple, arrow: { left: '38%', top: '38%' } },
    ],
  },
  {
    // Role swap: now the child asks the question.
    id: 'u2l2-you-ask', kind: 'join-stage', bg: bgU2L2Meadow, teacher: 'Now YOU ask! Say: What color is it?', cast: ['willow', 'leo', 'mia'],
    turns: [
      { who: 'student', line: 'Ask Leo: What color is it?', bg: bgU2L2Orange, arrow: { left: '38%', top: '28%' } },
      { who: 'leo', line: "It's orange!", bg: bgU2L2Orange },
      { who: 'student', line: 'Ask Mia: What color is it?', bg: bgU2L2Purple, arrow: { left: '38%', top: '38%' } },
      { who: 'mia', line: "It's purple!", bg: bgU2L2Purple },
      { who: 'student', line: 'Ask your teacher: What color is it?', bg: bgU2L2Green, arrow: { left: '50%', top: '42%' } },
    ],
  },

  /* ---- Game break ---- */
  {
    id: 'u2l2-color-simon', kind: 'color-simon', bg: bgU2L2PaintLab, teacher: 'Simon says... watch, then copy the colors!', maxRounds: 4,
    colors: [
      { colorWord: 'GREEN', colorHex: GREEN, who: 'willow' },
      { colorWord: 'ORANGE', colorHex: ORANGE, who: 'leo' },
      { colorWord: 'PURPLE', colorHex: PURPLE, who: 'mia' },
    ],
  },
  {
    id: 'u2l2-memory', kind: 'memory', bg: bgU2L2Meadow, teacher: 'Find the pairs! Say the color of each one.',
    pairs: [
      { id: 'frog', label: 'Green', emoji: '\u{1F438}', img: itemFrog },
      { id: 'carrot', label: 'Orange', emoji: '\u{1F955}', img: itemCarrot },
      { id: 'grapes', label: 'Purple', emoji: '\u{1F347}', img: itemGrapes },
      { id: 'pumpkin', label: 'Orange', emoji: '\u{1F383}', img: itemPumpkin },
    ],
  },

  /* ---- Personal production ---- */
  {
    id: 'u2l2-my-color', kind: 'join-stage', bg: bgU2L2Meadow, teacher: 'What color do YOU like? Say: I like …', cast: ['mia', 'leo', 'pip'],
    turns: [
      { who: 'mia', line: 'I like purple! What color do you like?' },
      { who: 'student', line: 'I like …' },
      { who: 'leo', line: "I like orange! I don't like green." },
      { who: 'student', line: "I like … I don't like …" },
    ],
  },

  /* ---- Story payoff ---- */
  {
    id: 'u2l2-storybook', kind: 'flipbook', bg: bgU2L2Meadow, title: 'The Magic Paint Pots',
    pages: [
      { who: 'pip', img: bgU2L2PaintLab, text: 'Pip has red, blue and yellow paint.' },
      { who: 'willow', img: bgU2L2Green, text: 'Blue and yellow make green. The frog is green!' },
      { who: 'leo', img: bgU2L2Orange, text: 'Red and yellow make orange. The carrot is orange!' },
      { who: 'mia', img: bgU2L2Purple, text: 'Red and blue make purple. The grapes are purple!' },
      { who: 'pip', img: bgU2L2Meadow, text: 'Now the meadow has six colors!' },
    ],
    checkpoints: [
      { afterPage: 1, who: 'willow', question: 'What color is the frog?', options: ['Green', 'Orange', 'Purple'], answer: 'Green' },
      { afterPage: 3, who: 'mia', question: 'What color are the grapes?', options: ['Green', 'Orange', 'Purple'], answer: 'Purple' },
    ],
  },
  {
    // Reading readiness: the printed word is the prompt.
    id: 'u2l2-read-words', kind: 'word-picture-match', bg: bgU2L2Meadow, teacher: 'Read the word. Tap the picture!',
    rounds: [
      { word: 'frog', who: 'willow', correctImg: itemFrog, correctLabel: 'Frog', distractors: [{ img: itemCarrot, label: 'Carrot' }, { img: itemGrapes, label: 'Grapes' }] },
      { word: 'carrot', who: 'leo', correctImg: itemCarrot, correctLabel: 'Carrot', distractors: [{ img: itemPlum, label: 'Plum' }, { img: itemFrog, label: 'Frog' }] },
      { word: 'grapes', who: 'mia', correctImg: itemGrapes, correctLabel: 'Grapes', distractors: [{ img: itemFrog, label: 'Frog' }, { img: itemPumpkin, label: 'Pumpkin' }] },
    ],
  },

  /* ---- Rainbow parade ending (this lesson's own, not the shared goodbye song) ---- */
  { id: 'u2l2-finale', kind: 'finale', bg: bgU2L2Meadow, who: 'pip', line: 'You made green, orange and purple! Goodbye, friends!' },
];

/* =============================================================================
 * Pre-A1 Unit 2, Lesson 3 — "Circle, Square, Triangle!"
 *
 * The curriculum blueprint's own pre-seeded stub for this slot (curriculum_
 * lessons row e54f3d1e-03b5-4c77-929e-e0cfbde61216) named the topic: Unit 2
 * ("Colors & Shapes") moves from colors (Lessons 1-2) into shapes here.
 *
 * This is the unit's first SHAPE lesson, and the color-specific scene kinds
 * (color-model, color-sort, color-quiz, color-spot, color-friends) are typed
 * around colorHex/colorWord — a shape isn't a color, so they don't
 * generalize. Added two new, purpose-built kinds instead of forcing shapes
 * through a color-shaped API: 'shape-model' and 'shape-sort', direct
 * mirrors of color-model/color-sort's own proven tap-hold-repeat and
 * drag-to-target mechanics, with one real difference — the swatch IS the
 * shape (an actual drawn circle/square/triangle, not a color-filled circle
 * with a word printed on it). Skipped a shape-quiz/shape-spot/shape-friends
 * equivalent: this lesson already has 7+ distinct mechanics without them
 * (model, sort, word-build, listen-repeat, sentence-practice, dash x3,
 * join-stage, flipbook, roleplay x3), and "color the shape its real color"
 * isn't a meaningful action for teaching shape recognition the way it is
 * for teaching colors.
 *
 * - Cast: Bella=CIRCLE (ball), Mia=SQUARE (book), Leo=TRIANGLE (pizza slice)
 *   — deliberately not reusing either lesson's color assignments, so shapes
 *   and colors never contradict each other about who "owns" what. Pip stays
 *   narrator/host and the consistent second character in every roleplay.
 * - Objective: identify and name circle, square, and triangle, and use them
 *   in simple sentences — "It's a circle," "I like circles," "I don't like
 *   triangles" (the noun needs "a"/plural, unlike colors' bare adjective
 *   pattern, but stays a fixed, simple, repeatable frame).
 * - Phonics: of the three shape words' initial letters (C, S, T), only C is
 *   new — S was taught in Lesson 3, T in Lesson 4. C gets a full sound-
 *   model+trace pair; S and T get retrieval-only practice (the phonics hint
 *   in shape-sort's teacher line, word-build's letter choices), matching
 *   the exact "already-taught letter gets lighter treatment" pattern
 *   Lesson 2 used for B.
 * - Art: every scene staging a specific character doing a specific action
 *   gets its own dedicated, single-object image from the start (hero,
 *   circle/square/triangle-only, sound-garden, dash-arena) — the lesson
 *   learned from Lessons 1-2 needing multiple regeneration/fix rounds for
 *   this exact issue. Two images still needed a regeneration pass here too
 *   (the hero shot first dropped Mia entirely, then a sticker-framing
 *   issue) before being accepted — full-bleed and "all named characters
 *   present" both need to be explicitly demanded, not assumed.
 *
 * PROGRESSIVE-COMBINATION REVISION (2026-08-12): direct user correction —
 * a shape lesson that only ever drills "It's a triangle" / "I like
 * triangles" is a flat repeat of Lessons 1-2's own sentence frame, not a
 * lesson that builds on them. From u2l3-sentence-practice onward (the
 * scenes whose job is drilling the TARGET frame, not first recognition),
 * shape nouns are now combined with the color each object already shows in
 * its art into one noun phrase: red circle (the ball — solid red in
 * bg-u2l3-circle-only.png), blue square (bg-u2l3-square-only.png,
 * regenerated so all three stacked books are unambiguously blue, not the
 * original mixed blue/red/yellow stack), yellow triangle
 * (bg-u2l3-triangle-only.png, regenerated as a plain cheese slice — no
 * pepperoni/herb flecks — so its color reads as cleanly yellow). u2l3-
 * vocab-shapes, u2l3-sort-shapes, u2l3-word-build, and u2l3-who stay
 * shape-only — recognition of the new unit (shape) should still be
 * isolated before it's asked to combine with the old unit (color). This is
 * now a holistic rule, not a one-lesson fix: see the smart-lesson-architect
 * methodology memory's "Progressive combination rule".
 *
 * HARD VARIETY RULE FIX (2026-09-30): the lesson shipped with two runs of
 * 3 consecutive same-kind scenes — u2l3-dash-circle/square/triangle and
 * u2l3-roleplay-circle/square/triangle — violating activity-pattern-
 * library's "no more than 2 consecutive same-kind scenes" rule (the exact
 * class of issue that rule exists to catch, per its own Welcome Town
 * Lesson 3 case study). Fixed by inserting one palette-cleanser scene
 * into each run: u2l3-memory-shapes (between the two dash rounds, a
 * shape-matching pairs game) and u2l3-sound-pop (between the two
 * roleplay rounds, a phonics balloon-pop arcade round on the C/S/T
 * sounds) — both reuse already-established art/items (zero new asset
 * generation) and add a genuinely different skill rather than just
 * reordering the existing scenes. u2l3-sound-pop replaces an earlier
 * "guess the friend" character-portrait version of this same slot, per
 * direct user correction: this lesson's focus is shapes and colors, not
 * characters, and the correction also asked for real sound/phonics
 * reinforcement — sound-pop's own renderer already plays a recorded
 * phonic sound per target and a pop sound effect per balloon, so no new
 * audio needed either.
 * ========================================================================= */

const itemBook = `${A}/items/item-book.png`;
const itemPizza = `${A}/items/item-pizza.png`;
const bgU2L3ShapeParade = `${A}/scenes/bg-u2l3-shape-parade.png`;
const bgU2L3CircleOnly = `${A}/scenes/bg-u2l3-circle-only.png`;
const bgU2L3SquareOnly = `${A}/scenes/bg-u2l3-square-only.png`;
const bgU2L3TriangleOnly = `${A}/scenes/bg-u2l3-triangle-only.png`;
// Single-character variants (no Pip) purpose-built for u2l3-join-stage: the
// shape-owning character alone on the left third, open grass/sky on the
// right third reserved for the student's own draggable video circle —
// direct user correction that the two-character shots left no clear space
// for it and forced the circle to cover someone/something.
const bgU2L3CircleSolo = `${A}/scenes/bg-u2l3-circle-solo.png`;
const bgU2L3SquareSolo = `${A}/scenes/bg-u2l3-square-solo.png`;
const bgU2L3TriangleSolo = `${A}/scenes/bg-u2l3-triangle-solo.png`;
const bgU2L3SoundGarden = `${A}/scenes/bg-u2l3-sound-garden.png`;
const bgU2L3DashArena = `${A}/scenes/bg-u2l3-dash-arena.png`;

/* REBUILD (2026-10-03) on the same blueprints as Lesson 2 (wide art, 6 core
 * words, one phonics micro-moment, the child asks as well as answers, its own
 * song, one signature game). Replaces the first version, which had square
 * art, emoji objects, three dashes and three role-plays, the shared goodbye
 * song — and two real teaching errors: it taught "/k/ /k/ Circle" (circle
 * starts with an /s/ sound) and its C trace was checked against an H (C had
 * no outline in TraceScene).
 *
 * Core words: circle, square, triangle (+ clock, window, pizza; cookie,
 * present, flag as second examples). Chunks: "What shape is it?" / "It's a
 * circle." / "I like circles." Colours from Lessons 1-2 come back inside the
 * signature game ("A red triangle!"), which Lesson 4 builds on.
 * Signature game: Shape Builders (shape-builder) — name each shape, pick it in
 * the colour you hear, build a house, a rocket and an ice cream.
 * Phonics micro-moment: C says /k/ — clock, cat, car (words that really start
 * with /k/). Cast as before: Bella = circle, Mia = square, Leo = triangle.
 * Research: shape-collage / "make a picture with shapes" (googooenglish.com,
 * twinkl.com ESL 2D shapes), "What shape is it?" Q&A (englishclub.com,
 * "How to teach shapes to young learners": circle first — no corners). */
const itemClock = `${A}/items/item-clock.png`;
const itemWindow = `${A}/items/item-window.png`;
const itemPizzaSlice = `${A}/items/item-pizza-slice.png`;
const itemCookie = `${A}/items/item-cookie.png`;
const itemPresent = `${A}/items/item-present.png`;
const itemFlag = `${A}/items/item-flag.png`;
const itemCarC = `${A}/items/item-car.png`; // itemCar is declared further down (Unit 3)
const shapeCircle = `${A}/items/shape-circle.svg`;
const shapeSquare = `${A}/items/shape-square.svg`;
const shapeTriangle = `${A}/items/shape-triangle.svg`;
const bgU2L3Town = `${A}/scenes/bg-u2l3-town-wide.png`;
const bgU2L3Builder = `${A}/scenes/bg-u2l3-builder-wide.png`;
const bgU2L3Clock = `${A}/scenes/bg-u2l3-clock-wide.png`;
const bgU2L3Window = `${A}/scenes/bg-u2l3-window-wide.png`;
const bgU2L3Pizza = `${A}/scenes/bg-u2l3-pizza-wide.png`;
const RED = '#EF4444';
const BLUE = '#3B82F6';
const YELLOW = '#FACC15';

export const LESSON_U2L3_TITLE = 'Circle, Square, Triangle!';
export const LESSON_U2L3_OBJECTIVE = 'Name circle, square and triangle (clock, window, pizza), ask and answer "What shape is it?" — "It\'s a circle.", say "I like circles.", build pictures from shapes in the colours you hear ("A red triangle!"), and hear C say /k/ (clock, cat, car).';

export const LESSON_U2L3_SCENES: Scene[] = [
  { id: 'u2l3-title', kind: 'title-card', bg: bgU2L3Town, level: 'Pre-A1', unit: 'Unit 2', lessonLabel: 'Lesson 3', title: 'Circle, Square, Triangle!', subtitle: 'Build with shapes' },

  {
    // Warm-up: the lesson's shapes song (scripts/songs.json "u2l3-shapes").
    id: 'u2l3-song', kind: 'song', bg: bgU2L3Town, title: '\u{1F3B5} The Shapes Song \u{1F3B5}', teacher: 'Sing and draw each shape in the air with your finger!',
    durationSeconds: 20, bigWord: 'Shapes', songUrl: `${A}/audio/shapes-song-u2l3.mp3?v=1`,
    lineDurationsMs: [3600, 4000, 4100, 8362],
    songPrompt: 'Upbeat kids pop shapes song',
    lyrics: [
      { who: 'bella', text: 'Circle, circle, the clock is a circle!', emotion: 'happy' },
      { who: 'mia', text: 'Square, square, the window is a square!', emotion: 'happy' },
      { who: 'leo', text: 'Triangle, triangle, the pizza is a triangle!', emotion: 'happy' },
      { who: 'pip', text: 'What shape is it? What shape is it?', emotion: 'happy' },
    ],
  },
  {
    id: 'u2l3-intro', kind: 'cinematic', bg: bgU2L3Town, hidePipOverlay: true, title: 'Shape Town', subtitle: 'Shapes are everywhere', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hello! Remember red, blue and yellow?' },
      { who: 'pip', line: 'Look! Shapes are everywhere in our town!' },
    ],
    cta: "Let's look!",
  },

  /* ---- Input: the three shapes on three clear objects ---- */
  {
    id: 'u2l3-vocab-shapes', kind: 'shape-model', bg: bgU2L3Town,
    teacher: 'Tap a shape. Listen, say it, then say the sentence!',
    items: [
      { shapeWord: 'CIRCLE', shapeColor: RED, who: 'bella', exampleWord: 'Clock', exampleImg: itemClock },
      { shapeWord: 'SQUARE', shapeColor: BLUE, who: 'mia', exampleWord: 'Window', exampleImg: itemWindow },
      { shapeWord: 'TRIANGLE', shapeColor: YELLOW, who: 'leo', exampleWord: 'Pizza', exampleImg: itemPizzaSlice },
    ],
  },
  {
    id: 'u2l3-shape-spot', kind: 'color-spot', bg: bgU2L3Town,
    teacher: 'Find the shapes in the town! Tap each arrow.',
    items: [
      { colorWord: 'CIRCLE', colorHex: RED, who: 'bella', label: 'Clock', sentence: 'The clock is a circle!', left: '16.5%', top: '22%', splashImg: itemClock },
      { colorWord: 'SQUARE', colorHex: BLUE, who: 'mia', label: 'Window', sentence: 'The window is a square!', left: '50%', top: '42%', splashImg: itemWindow },
      { colorWord: 'TRIANGLE', colorHex: '#F59E0B', who: 'leo', label: 'Flag', sentence: 'The flag is a triangle!', left: '80%', top: '13%', splashImg: itemFlag },
    ],
  },
  {
    id: 'u2l3-question-model', kind: 'listen-repeat-cards', bg: bgU2L3Town, teacher: 'Listen to the question and the answer. Then say them!',
    cards: [
      { who: 'pip', sentence: 'What shape is it?', img: itemClock, imgLabel: 'Clock' },
      { who: 'bella', sentence: "It's a circle!", img: itemClock, imgLabel: 'Circle' },
      { who: 'pip', sentence: 'What shape is it?', img: itemWindow, imgLabel: 'Window' },
      { who: 'mia', sentence: "It's a square!", img: itemWindow, imgLabel: 'Square' },
      { who: 'pip', sentence: 'What shape is it?', img: itemPizzaSlice, imgLabel: 'Pizza' },
      { who: 'leo', sentence: "It's a triangle!", img: itemPizzaSlice, imgLabel: 'Triangle' },
    ],
  },

  /* ---- Signature game ---- */
  {
    id: 'u2l3-shape-builders', kind: 'shape-builder', bg: bgU2L3Builder, who: 'pip',
    teacher: 'Shape Builders! Name the shape, then pick the color you hear.',
    rounds: [
      {
        who: 'mia', label: 'House', intro: "Let's build a house!", line: "It's a house!", alive: 'bounce',
        pieces: [
          { shape: 'square', colorWord: 'BLUE', colorHex: BLUE, x: 32, y: 32, w: 36, h: 36 },
          { shape: 'triangle', colorWord: 'RED', colorHex: RED, x: 26, y: 6, w: 48, h: 26 },
          { shape: 'circle', colorWord: 'YELLOW', colorHex: YELLOW, x: 43, y: 41, w: 14, h: 14 },
        ],
      },
      {
        who: 'leo', label: 'Rocket', intro: "Let's build a rocket!", line: "It's a rocket!", alive: 'launch',
        pieces: [
          { shape: 'triangle', colorWord: 'PURPLE', colorHex: '#A855F7', x: 37, y: 4, w: 26, h: 22 },
          { shape: 'square', colorWord: 'ORANGE', colorHex: '#F97316', x: 37, y: 26, w: 26, h: 26 },
          { shape: 'circle', colorWord: 'BLUE', colorHex: BLUE, x: 44, y: 32, w: 12, h: 12 },
        ],
      },
      {
        who: 'bella', label: 'Ice cream', intro: "Let's build an ice cream!", line: "It's an ice cream!", alive: 'wiggle',
        pieces: [
          { shape: 'triangle', colorWord: 'ORANGE', colorHex: '#F97316', x: 38, y: 34, w: 24, h: 34, flip: true },
          { shape: 'circle', colorWord: 'GREEN', colorHex: '#22C55E', x: 35, y: 12, w: 30, h: 30 },
          { shape: 'circle', colorWord: 'RED', colorHex: RED, x: 45, y: 3, w: 10, h: 10 },
        ],
      },
    ],
  },

  /* ---- Controlled practice ---- */
  {
    id: 'u2l3-sort-shapes', kind: 'shape-sort', bg: bgU2L3Town, teacher: 'Listen, then drag each thing to its shape!',
    targets: [
      { shapeWord: 'CIRCLE', shapeColor: RED, who: 'bella' },
      { shapeWord: 'SQUARE', shapeColor: BLUE, who: 'mia' },
      { shapeWord: 'TRIANGLE', shapeColor: YELLOW, who: 'leo' },
    ],
    items: [
      { word: 'clock', img: itemClock, emoji: '\u{1F570}️', shapeWord: 'CIRCLE' },
      { word: 'cookie', img: itemCookie, emoji: '\u{1F36A}', shapeWord: 'CIRCLE' },
      { word: 'window', img: itemWindow, emoji: '\u{1FA9F}', shapeWord: 'SQUARE' },
      { word: 'present', img: itemPresent, emoji: '\u{1F381}', shapeWord: 'SQUARE' },
      { word: 'pizza', img: itemPizzaSlice, emoji: '\u{1F355}', shapeWord: 'TRIANGLE' },
      { word: 'flag', img: itemFlag, emoji: '\u{1F6A9}', shapeWord: 'TRIANGLE' },
    ],
  },

  /* ---- Phonics micro-moment: C says /k/ ---- */
  {
    id: 'u2l3-model-c', kind: 'sound-model', bg: bgU2L3Builder, who: 'bella', letter: 'C', phoneme: '/k/', sound: 'kuh',
    teacher: 'Listen to the /k/ sound. Clock, cat, car!',
    anchors: [
      { word: 'clock', emoji: '\u{1F570}️', img: itemClock },
      { word: 'cat', emoji: '\u{1F431}', img: itemCat },
      { word: 'car', emoji: '\u{1F697}', img: itemCarC },
    ],
  },
  { id: 'u2l3-trace-c', kind: 'trace', bg: bgU2L3Clock, who: 'bella', letter: 'C', phoneme: '/k/', word: 'clock', teacher: 'Trace the big C! Say /k/ /k/ as you draw.' },

  /* ---- Games ---- */
  {
    id: 'u2l3-shape-spy', kind: 'color-spy', bg: bgU2L3Town, who: 'pip', article: 'a', teacher: 'I Spy! Find the shape Pip says.',
    spots: [
      { colorWord: 'CIRCLE', colorHex: RED, label: 'The clock', left: '16.5%', top: '28%' },
      { colorWord: 'SQUARE', colorHex: BLUE, label: 'The window', left: '50%', top: '50%' },
      { colorWord: 'TRIANGLE', colorHex: '#F59E0B', label: 'The flag', left: '80%', top: '19%' },
    ],
    clueOrder: ['TRIANGLE', 'CIRCLE', 'SQUARE'],
  },
  {
    id: 'u2l3-dash-triangle', kind: 'dash', bg: bgU2L3Pizza, teacher: 'Leo Dash! Tap only the TRIANGLES. Get 6!', who: 'leo', targetLetter: 'TRIANGLE', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'pizza', letter: 'TRIANGLE', img: itemPizzaSlice, emoji: '\u{1F355}' },
      { word: 'flag', letter: 'TRIANGLE', img: itemFlag, emoji: '\u{1F6A9}' },
      { word: 'clock', letter: 'CIRCLE', img: itemClock, emoji: '\u{1F570}️' },
      { word: 'cookie', letter: 'CIRCLE', img: itemCookie, emoji: '\u{1F36A}' },
      { word: 'window', letter: 'SQUARE', img: itemWindow, emoji: '\u{1FA9F}' },
      { word: 'present', letter: 'SQUARE', img: itemPresent, emoji: '\u{1F381}' },
    ],
  },

  /* ---- Speaking: the child answers, then asks ---- */
  {
    id: 'u2l3-you-answer', kind: 'join-stage', bg: bgU2L3Town, teacher: 'Your turn! When it says YOU, say the shape.', cast: ['pip', 'bella', 'mia', 'leo'],
    turns: [
      { who: 'pip', line: 'What shape is the clock?', bg: bgU2L3Clock, arrow: { left: '40%', top: '30%' } },
      { who: 'student', line: "It's a …", bg: bgU2L3Clock, arrow: { left: '40%', top: '30%' } },
      { who: 'pip', line: 'What shape is the window?', bg: bgU2L3Window, arrow: { left: '43%', top: '46%' } },
      { who: 'student', line: "It's a …", bg: bgU2L3Window, arrow: { left: '43%', top: '46%' } },
      { who: 'pip', line: 'What shape is the pizza?', bg: bgU2L3Pizza, arrow: { left: '39%', top: '36%' } },
      { who: 'student', line: "It's a …", bg: bgU2L3Pizza, arrow: { left: '39%', top: '36%' } },
    ],
  },
  {
    id: 'u2l3-you-ask', kind: 'join-stage', bg: bgU2L3Town, teacher: 'Now YOU ask! Say: What shape is it?', cast: ['bella', 'mia', 'leo'],
    turns: [
      { who: 'student', line: 'Ask Bella: What shape is it?', bg: bgU2L3Clock, arrow: { left: '40%', top: '30%' } },
      { who: 'bella', line: "It's a circle!", bg: bgU2L3Clock, bubble: 'right' },
      { who: 'student', line: 'Ask Leo: What shape is it?', bg: bgU2L3Pizza, arrow: { left: '39%', top: '36%' } },
      { who: 'leo', line: "It's a triangle!", bg: bgU2L3Pizza, bubble: 'right' },
      { who: 'student', line: 'Ask your teacher: What shape is it?', bg: bgU2L3Window, arrow: { left: '43%', top: '46%' } },
    ],
  },

  /* ---- Game break ---- */
  {
    id: 'u2l3-memory', kind: 'memory', bg: bgU2L3Town, teacher: 'Find the pairs! Say the shape of each one.',
    pairs: [
      { id: 'clock', label: 'Circle', emoji: '\u{1F570}️', img: itemClock },
      { id: 'window', label: 'Square', emoji: '\u{1FA9F}', img: itemWindow },
      { id: 'pizza', label: 'Triangle', emoji: '\u{1F355}', img: itemPizzaSlice },
      { id: 'present', label: 'Square', emoji: '\u{1F381}', img: itemPresent },
    ],
  },

  /* ---- Personal production ---- */
  {
    id: 'u2l3-my-shape', kind: 'join-stage', bg: bgU2L3Town, teacher: 'What shape do YOU like? Say: I like …', cast: ['bella', 'leo', 'pip'],
    turns: [
      { who: 'bella', line: 'I like circles! What shape do you like?' },
      { who: 'student', line: 'I like …' },
      { who: 'leo', line: "I like triangles! I don't like squares." },
      { who: 'student', line: "I like … I don't like …" },
    ],
  },

  /* ---- Story payoff ---- */
  {
    id: 'u2l3-storybook', kind: 'flipbook', bg: bgU2L3Town, title: 'Shape Town',
    pages: [
      { who: 'pip', img: bgU2L3Town, text: 'Pip and his friends look for shapes.' },
      { who: 'bella', img: bgU2L3Clock, text: 'Bella finds a circle. It is a clock!' },
      { who: 'mia', img: bgU2L3Window, text: 'Mia finds a square. It is a window!' },
      { who: 'leo', img: bgU2L3Pizza, text: 'Leo finds a triangle. It is a pizza. Yum!' },
      { who: 'pip', img: bgU2L3Builder, text: 'Now they build a house with shapes!' },
    ],
    checkpoints: [
      { afterPage: 1, who: 'bella', question: 'What shape is the clock?', options: ['Circle', 'Square', 'Triangle'], answer: 'Circle' },
      { afterPage: 3, who: 'leo', question: 'What shape is the pizza?', options: ['Circle', 'Square', 'Triangle'], answer: 'Triangle' },
    ],
  },
  {
    id: 'u2l3-read-words', kind: 'word-picture-match', bg: bgU2L3Town, teacher: 'Read the word. Tap the shape!',
    rounds: [
      { word: 'circle', who: 'bella', correctImg: shapeCircle, correctLabel: 'Circle', distractors: [{ img: shapeSquare, label: 'Square' }, { img: shapeTriangle, label: 'Triangle' }] },
      { word: 'triangle', who: 'leo', correctImg: shapeTriangle, correctLabel: 'Triangle', distractors: [{ img: shapeCircle, label: 'Circle' }, { img: shapeSquare, label: 'Square' }] },
      { word: 'square', who: 'mia', correctImg: shapeSquare, correctLabel: 'Square', distractors: [{ img: shapeTriangle, label: 'Triangle' }, { img: shapeCircle, label: 'Circle' }] },
    ],
  },

  { id: 'u2l3-finale', kind: 'finale', bg: bgU2L3Town, who: 'pip', line: 'You found circles, squares and triangles! Goodbye, friends!' },
];

/* =============================================================================
 * Pre-A1 Unit 2, Lesson 4 — "What Color is This?"
 *
 * The curriculum blueprint's own pre-seeded stub for this slot (curriculum_
 * lessons row 41bf7e06-b267-49b6-ba40-ac640700a1af) named the topic: "What
 * Color is This?" — a question-framed title, not a new-vocabulary title like
 * Lessons 1-3 all have. Read as exactly what Unit 1's own Lesson 6 ("Trophy
 * Trail") already established as this curriculum's review-capstone pattern:
 * a lesson that deliberately teaches ZERO new vocabulary and instead mixes
 * everything already taught into harder, combined recall — this unit's own
 * "boss battle" for the six colors from Lessons 1-2, not a third new-colors
 * lesson and not a shapes lesson (the stub's own title never says "shape").
 *
 * Spiral-progression ratio is deliberately 0% new / 100% review, the same
 * stated reason Lesson 6's review used: this is a consolidation checkpoint,
 * not a normal teaching lesson.
 *
 * - No new art. Every background is reused directly from Lessons 1-2's own
 *   already-generated, already-verified-correct images — a review lesson
 *   SHOULD call back to the teaching lessons' own art, not introduce new
 *   scenery unrelated to what it's reviewing. The flipbook's six pages in
 *   particular reuse the exact single-object images (apple/water/sunflower/
 *   leaf/orange/grapes) whose semantic correctness was already fixed and
 *   verified in Lessons 1-2 — no risk of the "busy shared image" mismatch
 *   those lessons needed multiple rounds to fix, because nothing new was
 *   generated to get wrong.
 * - Every color keeps its established speaker from whichever lesson taught
 *   it (Bella=red, Willow=blue AND green, Pip=yellow, Leo=orange,
 *   Mia=purple) — a review lesson is exactly the wrong place to introduce a
 *   contradiction about who "owns" a color.
 * - color-sort and color-simon needed one real code fix to support this:
 *   both rendered their target/button row as a single non-wrapping flex
 *   row, sized for 3 items. Six items would have overflowed the screen
 *   width instead of wrapping onto a second row. Added flex-wrap (safe for
 *   every existing 3-item lesson too, since 3 items already fit one row
 *   and never trigger a wrap).
 * - color-spy stays split into two 3-spot rounds (one per lesson's own hero
 *   image) rather than trying to force six simultaneous spots onto one
 *   image — that would need a new combined hero image showing six objects
 *   at once, which is exactly the kind of new-art risk this review lesson
 *   is designed to avoid.
 * - dash's own type only supports one target color per scene instance, but
 *   the "boss" difficulty bump doesn't need a new mechanic — both review
 *   dash rounds draw their distractor pool from all six colors (not just
 *   three), which is a genuinely harder discrimination task than either
 *   teaching lesson's own dash rounds gave.
 *
 * PROGRESSIVE-COMBINATION REVISION (2026-08-12): direct user correction —
 * this review lesson only ever re-drilled colors in isolation, so it never
 * reviewed the combined "It's a yellow triangle" frame Lesson 3 (see its
 * own header note) now teaches. Added u2l4-combo-review right after
 * u2l4-who: reuses Lesson 3's own already-verified items (itemBall,
 * itemBook, itemPizza) with zero new art, same as every other scene in this
 * lesson. Also added one combined production turn to u2l4-join-stage. This
 * keeps the review's spiral shape intact — isolated color recall first
 * (u2l4-quiz through u2l4-who), THEN the harder combined recall — instead
 * of just repeating six colors a second time.
 * ========================================================================= */

/* REBUILD (2026-10-03), same blueprints as Lessons 2-3. The curriculum goal is
 * "Ask and answer about colors and shapes" (title: "What Color Is This?"), but
 * the first version never asked that question: it was pure review (two
 * dashes, two I-spies, square art, the shared goodbye song). Now the lesson is
 * built around the questions — "What color is this?", "What shape is this?",
 * "Is it red? — Yes, it is. / No, it isn't." — and the child ASKS as much as
 * answers. Words are all review (red/blue/yellow, green/orange/purple,
 * circle/square/triangle); the new language is the question frames.
 * Signature game: Pip's Secret Card (secret-card) — Guess Who with coloured
 * shapes; the child can only win by asking yes/no questions.
 * Phonics micro-moment: WH says /w/ — whale, wheel, whistle (and "what").
 * Research: Guess Who / 20 questions information-gap games for yes/no
 * questions (eslkidsgames / teach-this "Is it…?" guessing), Cambridge Pre A1
 * Starters "What colour is…?" / "Is it…?" question forms. */
const bgU2L4Party = `${A}/scenes/bg-u2l4-party-wide.png`;
const bgU2L4Secret = `${A}/scenes/bg-u2l4-secret-wide.png`;
const bgU2L4Whale = `${A}/scenes/bg-u2l4-whale-wide.png`;
const itemWhale = `${A}/items/item-whale.png`;
const itemWheel = `${A}/items/item-wheel.png`;
const itemWhistle = `${A}/items/item-whistle.png`;
const C4 = { RED: '#EF4444', BLUE: '#3B82F6', YELLOW: '#FACC15', GREEN: '#22C55E', ORANGE: '#F97316', PURPLE: '#A855F7' };

export const LESSON_U2L4_TITLE = 'What Color Is This?';
export const LESSON_U2L4_OBJECTIVE = 'Ask and answer about colours and shapes — "What color is this? — It\'s red.", "What shape is this? — It\'s a circle.", "Is it blue? — Yes, it is. / No, it isn\'t." — reviewing all six colours and three shapes, and hear WH say /w/ (whale, wheel, whistle).';

export const LESSON_U2L4_SCENES: Scene[] = [
  { id: 'u2l4-title', kind: 'title-card', bg: bgU2L4Party, level: 'Pre-A1', unit: 'Unit 2', lessonLabel: 'Lesson 4', title: 'What Color Is This?', subtitle: 'Ask and answer' },

  {
    // Warm-up: the lesson's question song (scripts/songs.json "u2l4-what-color").
    id: 'u2l4-song', kind: 'song', bg: bgU2L4Party, title: '\u{1F3B5} The Question Song \u{1F3B5}', teacher: 'Sing, point to a color, and nod for YES, shake your head for NO!',
    durationSeconds: 20, bigWord: 'Ask!', songUrl: `${A}/audio/what-color-song-u2l4.mp3?v=1`,
    songPrompt: 'Upbeat kids pop question song',
    lyrics: [
      { who: 'bella', text: "What color is this? It's red! It's red!", emotion: 'happy' },
      { who: 'mia', text: "What shape is this? It's a circle, a circle!", emotion: 'happy' },
      { who: 'willow', text: 'Is it blue? Yes, it is! Yes, it is!', emotion: 'happy' },
      { who: 'leo', text: "Is it green? No, it isn't! No, it isn't!", emotion: 'happy' },
    ],
  },
  {
    id: 'u2l4-intro', kind: 'cinematic', bg: bgU2L4Party, hidePipOverlay: true, title: 'The Question Party', subtitle: 'Colors and shapes everywhere', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hello! Remember colors and shapes?' },
      { who: 'pip', line: 'Today YOU ask the questions!' },
    ],
    cta: "Let's play!",
  },

  /* ---- Input: the question frames ---- */
  {
    id: 'u2l4-question-model', kind: 'listen-repeat-cards', bg: bgU2L4Party, teacher: 'Listen to the question and the answer. Then say them!',
    cards: [
      { who: 'pip', sentence: 'What color is this?', img: itemBalloonRed, imgLabel: 'Balloon' },
      { who: 'bella', sentence: "It's red!", img: itemBalloonRed, imgLabel: 'Red' },
      { who: 'pip', sentence: 'What shape is this?', img: itemClock, imgLabel: 'Clock' },
      { who: 'bella', sentence: "It's a circle!", img: itemClock, imgLabel: 'Circle' },
      { who: 'pip', sentence: 'Is it blue?', img: itemFrog, imgLabel: 'Frog' },
      { who: 'willow', sentence: "No, it isn't! It's green!", img: itemFrog, imgLabel: 'Green' },
      { who: 'pip', sentence: 'Is it a triangle?', img: itemPizzaSlice, imgLabel: 'Pizza' },
      { who: 'leo', sentence: 'Yes, it is!', img: itemPizzaSlice, imgLabel: 'Triangle' },
    ],
  },
  {
    id: 'u2l4-party-spot', kind: 'color-spot', bg: bgU2L4Party,
    teacher: 'What color is this? What shape is this? Tap each arrow!',
    items: [
      { colorWord: 'RED CIRCLE', colorHex: C4.RED, who: 'bella', label: 'Balloon', sentence: "It's a red circle!", left: '7%', top: '12%', splashImg: itemBalloonRed },
      { colorWord: 'GREEN SQUARE', colorHex: C4.GREEN, who: 'willow', label: 'Present', sentence: "It's a green square!", left: '49%', top: '50%', splashImg: itemPresent },
      { colorWord: 'YELLOW TRIANGLE', colorHex: '#F59E0B', who: 'leo', label: 'Flag', sentence: "It's a yellow triangle!", left: '88%', top: '12%', splashImg: itemFlag },
    ],
  },

  /* ---- Signature game ---- */
  {
    id: 'u2l4-secret-card', kind: 'secret-card', bg: bgU2L4Secret, who: 'pip',
    teacher: "Pip's Secret Card! Ask: Is it red? Is it a circle? Find Pip's card!",
    cards: [
      { colorWord: 'RED', colorHex: C4.RED, shape: 'circle' },
      { colorWord: 'BLUE', colorHex: C4.BLUE, shape: 'circle' },
      { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'triangle' },
      { colorWord: 'RED', colorHex: C4.RED, shape: 'triangle' },
      { colorWord: 'BLUE', colorHex: C4.BLUE, shape: 'square' },
      { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'square' },
    ],
    rounds: [{ secret: 4 }, { secret: 3 }, { secret: 0 }],
  },

  /* ---- Controlled practice: all six colours ---- */
  {
    id: 'u2l4-color-quiz', kind: 'color-quiz', bg: bgU2L4Party, teacher: 'Listen! Tap the right one.',
    rounds: [
      { colorWord: 'BLUE', colorHex: C4.BLUE, who: 'willow', correctImg: itemCottonCandyBlue, correctLabel: 'Cotton candy', distractors: [{ img: itemBalloonRed, label: 'Balloon' }, { img: itemPopcornYellow, label: 'Popcorn' }] },
      { colorWord: 'ORANGE', colorHex: C4.ORANGE, who: 'leo', correctImg: itemCarrot, correctLabel: 'Carrot', distractors: [{ img: itemGrapes, label: 'Grapes' }, { img: itemFrog, label: 'Frog' }] },
      { colorWord: 'PURPLE', colorHex: C4.PURPLE, who: 'mia', correctImg: itemPlum, correctLabel: 'Plum', distractors: [{ img: itemLeaf, label: 'Leaf' }, { img: itemPopcornYellow, label: 'Popcorn' }] },
    ],
  },

  /* ---- Phonics micro-moment: WH says /w/ ---- */
  {
    id: 'u2l4-model-wh', kind: 'sound-model', bg: bgU2L4Whale, who: 'willow', letter: 'Wh', phoneme: '/w/', sound: 'wuh',
    teacher: 'W and H together say /w/ — like in WHAT. Whale, wheel, whistle!',
    anchors: [
      { word: 'whale', emoji: '\u{1F433}', img: itemWhale },
      { word: 'wheel', emoji: '\u{1F6DE}', img: itemWheel },
      { word: 'whistle', emoji: '\u{1F4E2}', img: itemWhistle },
    ],
  },
  { id: 'u2l4-trace-w', kind: 'trace', bg: bgU2L4Whale, who: 'willow', letter: 'W', phoneme: '/w/', word: 'whale', teacher: 'Trace the big W! W and H say /w/ — whale!' },

  /* ---- Game: build with colours and shapes ---- */
  {
    id: 'u2l4-shape-builders', kind: 'shape-builder', bg: bgU2L3Builder, who: 'pip',
    teacher: 'Shape Builders again! Name the shape, then pick the color you hear.',
    rounds: [
      {
        who: 'bella', label: 'Clown', intro: "Let's build a clown!", line: "It's a clown!", alive: 'wiggle',
        pieces: [
          { shape: 'circle', colorWord: 'YELLOW', colorHex: C4.YELLOW, x: 32, y: 26, w: 36, h: 36 },
          { shape: 'triangle', colorWord: 'BLUE', colorHex: C4.BLUE, x: 36, y: 2, w: 28, h: 25 },
          { shape: 'circle', colorWord: 'RED', colorHex: C4.RED, x: 45, y: 40, w: 10, h: 10 },
        ],
      },
      {
        who: 'willow', label: 'Tree', intro: "Let's build a tree!", line: "It's a tree!", alive: 'bounce',
        pieces: [
          { shape: 'triangle', colorWord: 'GREEN', colorHex: C4.GREEN, x: 28, y: 6, w: 40, h: 42 },
          { shape: 'square', colorWord: 'ORANGE', colorHex: C4.ORANGE, x: 41, y: 48, w: 14, h: 14 },
          { shape: 'circle', colorWord: 'YELLOW', colorHex: C4.YELLOW, x: 76, y: 4, w: 16, h: 16 },
        ],
      },
    ],
  },

  /* ---- Speaking: the child answers, then asks ---- */
  {
    id: 'u2l4-you-answer', kind: 'join-stage', bg: bgU2L4Party, teacher: 'Your turn! Answer Pip.', cast: ['pip', 'bella', 'willow', 'leo'],
    turns: [
      { who: 'pip', line: 'What color is this?', arrow: { left: '7%', top: '12%' } },
      { who: 'student', line: "It's …", arrow: { left: '7%', top: '12%' } },
      { who: 'pip', line: 'What shape is this?', arrow: { left: '49%', top: '50%' } },
      { who: 'student', line: "It's a …", arrow: { left: '49%', top: '50%' } },
      { who: 'pip', line: 'Is it a triangle?', arrow: { left: '88%', top: '12%' } },
      { who: 'student', line: "Yes, it is! / No, it isn't!", arrow: { left: '88%', top: '12%' } },
    ],
  },
  {
    id: 'u2l4-you-ask', kind: 'join-stage', bg: bgU2L4Party, teacher: 'Now YOU ask! What color is this? Is it …?', cast: ['willow', 'mia', 'leo'],
    turns: [
      { who: 'student', line: 'Ask Willow: Is it green?', bg: bgU2L2Green, arrow: { left: '50%', top: '42%' } },
      { who: 'willow', line: 'Yes, it is!', bg: bgU2L2Green, bubble: 'right' },
      { who: 'student', line: 'Ask Mia: What color is this?', bg: bgU2L2Purple, arrow: { left: '38%', top: '38%' } },
      { who: 'mia', line: "It's purple!", bg: bgU2L2Purple, bubble: 'right' },
      { who: 'student', line: 'Ask Leo: Is it a circle?', bg: bgU2L3Pizza, arrow: { left: '39%', top: '36%' } },
      { who: 'leo', line: "No, it isn't! It's a triangle!", bg: bgU2L3Pizza, bubble: 'right' },
    ],
  },

  /* ---- Game break ---- */
  {
    id: 'u2l4-memory', kind: 'memory', bg: bgU2L4Party, teacher: 'Find the pairs! Say the color AND the shape.',
    pairs: [
      { id: 'clock', label: 'Circle', emoji: '\u{1F570}️', img: itemClock },
      { id: 'frog', label: 'Green', emoji: '\u{1F438}', img: itemFrog },
      { id: 'pizza', label: 'Triangle', emoji: '\u{1F355}', img: itemPizzaSlice },
      { id: 'grapes', label: 'Purple', emoji: '\u{1F347}', img: itemGrapes },
    ],
  },
  {
    id: 'u2l4-color-simon', kind: 'color-simon', bg: bgU2L4Party, teacher: 'Simon says... watch, then copy the colors!', maxRounds: 4,
    colors: [
      { colorWord: 'RED', colorHex: C4.RED, who: 'bella' },
      { colorWord: 'BLUE', colorHex: C4.BLUE, who: 'willow' },
      { colorWord: 'YELLOW', colorHex: C4.YELLOW, who: 'pip' },
      { colorWord: 'GREEN', colorHex: C4.GREEN, who: 'willow' },
      { colorWord: 'ORANGE', colorHex: C4.ORANGE, who: 'leo' },
      { colorWord: 'PURPLE', colorHex: C4.PURPLE, who: 'mia' },
    ],
  },

  /* ---- Real-world production: find it at home ---- */
  {
    id: 'u2l4-show-me', kind: 'join-stage', bg: bgU2L4Party, teacher: 'Find it in YOUR room! Show it on camera and say it.', cast: ['pip', 'mia'],
    turns: [
      { who: 'pip', line: 'Find something red! Show me! What color is it?' },
      { who: 'student', line: "It's red!" },
      { who: 'mia', line: 'Find something round! What shape is it?' },
      { who: 'student', line: "It's a circle!" },
    ],
  },

  /* ---- Story payoff ---- */
  {
    id: 'u2l4-storybook', kind: 'flipbook', bg: bgU2L4Party, title: "Pip's Mystery Box",
    pages: [
      { who: 'pip', img: bgU2L4Party, text: 'Pip has a mystery box. What is in it?' },
      { who: 'bella', img: bgU2L4Party, text: "Bella asks, Is it red? No, it isn't." },
      { who: 'mia', img: bgU2L4Party, text: 'Mia asks, Is it yellow? Yes, it is!' },
      { who: 'leo', img: bgU2L4Party, text: 'Leo asks, Is it a triangle? Yes, it is!' },
      { who: 'pip', img: bgU2L3Pizza, text: "It's a yellow triangle. It's pizza! Yum!" },
    ],
    checkpoints: [
      { afterPage: 1, who: 'bella', question: 'Is it red?', options: ['Yes, it is!', "No, it isn't!"], answer: "No, it isn't!" },
      { afterPage: 3, who: 'leo', question: 'What shape is it?', options: ['Circle', 'Square', 'Triangle'], answer: 'Triangle' },
    ],
  },
  {
    id: 'u2l4-read-words', kind: 'word-picture-match', bg: bgU2L4Party, teacher: 'Read the words. Tap the picture!',
    rounds: [
      { word: 'red circle', who: 'bella', correctImg: shapeCircle, correctLabel: 'Red circle', distractors: [{ img: shapeSquare, label: 'Blue square' }, { img: shapeTriangle, label: 'Yellow triangle' }] },
      { word: 'yellow triangle', who: 'leo', correctImg: shapeTriangle, correctLabel: 'Yellow triangle', distractors: [{ img: shapeCircle, label: 'Red circle' }, { img: shapeSquare, label: 'Blue square' }] },
      { word: 'blue square', who: 'willow', correctImg: shapeSquare, correctLabel: 'Blue square', distractors: [{ img: shapeTriangle, label: 'Yellow triangle' }, { img: shapeCircle, label: 'Red circle' }] },
    ],
  },

  { id: 'u2l4-finale', kind: 'finale', bg: bgU2L4Party, who: 'pip', line: 'You asked and answered! Colors and shapes! Goodbye, friends!' },
];

/* =============================================================================
 * Pre-A1 Unit 2, Lesson 5 — "The Rainbow Fish's Scales"
 *
 * The curriculum blueprint's own pre-seeded stub for this slot (curriculum_
 * lessons row e9afa996-cb01-4fa5-9bef-ef09c8e6c35e) names the topic "The
 * Rainbow Fish's Scales." Read against Unit 1's own Lesson 5 ("Leo's Lost
 * Star" — a narrative, flipbook-heavy lesson distinct from the vocab-
 * teaching lessons around it), this is this unit's STORY lesson, not a
 * fourth new-vocabulary lesson: zero new color/shape vocabulary, all six
 * colors from Lessons 1-2 reviewed inside an original narrative instead.
 *
 * Copyright note: "The Rainbow Fish" is Marcus Pfister's copyrighted
 * picture book (a fish that trades its shiny scales away for friendship).
 * This lesson uses only the generic, non-copyrightable idea — a fish with
 * rainbow-colored scales — and tells a wholly original story with a
 * different plot (a plain grey fish gains one color at a time by visiting
 * six colorful flowers around its pond), never retelling Pfister's actual
 * story. The fish is deliberately a MUTE story prop, not a new named cast
 * member — same "never invent a new speaking character" rule this project
 * has held to all session; Pip and Bella (already established, already
 * sprite-referenced) narrate and react, the fish never talks.
 *
 * Art: 7 new full-bleed, single-object images generated this session
 * (bg-u2l5-fish-grey/red/orange/yellow/green/blue/purple.png, pure-scenery
 * text-to-image, no character sprites needed since the fish isn't a named
 * character) plus the hero/cover shot (bg-u2l5-fish-pond.png, Pip + Bella
 * pointing at the finished rainbow fish, character-sprite-edited). Four of
 * the single-color fish images (grey/red/orange/yellow) came back from
 * Gemini with a picture-frame border baked in despite an explicit anti-
 * border prompt — a model quirk stronger wording didn't fix — so those
 * four were auto-cropped past the border and upscaled back to 1024x1024
 * instead of re-prompted again; green/blue/purple and the hero shot came
 * back clean on the first full-bleed attempt. The hero shot's own rainbow
 * fish went through two rounds before all six colors read as distinct,
 * separate bands (first attempt blended orange into red/yellow).
 *
 * Structure is deliberately leaner than a teaching lesson (flipbook +
 * light review + production, no drag/sort/dash mechanics) — matching the
 * established "Lesson 5 = story lesson" convention from Unit 1. No new
 * phonics either: every color word's initial letter was already taught in
 * Lessons 1-2, so this is pure spiral review inside a narrative frame.
 * ========================================================================= */

const bgU2L5FishPond = `${A}/scenes/bg-u2l5-fish-pond.png`;
const bgU2L5FishGrey = `${A}/scenes/bg-u2l5-fish-grey.png`;
const bgU2L5FishRed = `${A}/scenes/bg-u2l5-fish-red.png`;
const bgU2L5FishOrange = `${A}/scenes/bg-u2l5-fish-orange.png`;
const bgU2L5FishYellow = `${A}/scenes/bg-u2l5-fish-yellow.png`;
const bgU2L5FishGreen = `${A}/scenes/bg-u2l5-fish-green.png`;
const bgU2L5FishBlue = `${A}/scenes/bg-u2l5-fish-blue.png`;
const bgU2L5FishPurple = `${A}/scenes/bg-u2l5-fish-purple.png`;

export const LESSON_U2L5_TITLE = "The Rainbow Fish's Scales";
export const LESSON_U2L5_OBJECTIVE = 'Follow an original story about a fish who gains all six colors from Unit 2 (red, orange, yellow, green, blue, purple), reviewing "It\'s red!" / "I like red!" sentence patterns through narrative instead of drills.';

export const LESSON_U2L5_SCENES: Scene[] = [
  { id: 'u2l5-title', kind: 'title-card', bg: bgU2L5FishPond, level: 'Pre-A1', unit: 'Unit 2', lessonLabel: 'Lesson 5', title: "The Rainbow Fish's Scales", subtitle: 'A story about a very special fish' },
  {
    id: 'u2l5-intro', kind: 'cinematic', bg: bgU2L5FishPond, title: "The Rainbow Fish's Scales", subtitle: 'Pip and Bella find a new friend', narrator: 'pip', hidePipOverlay: true,
    script: [
      { who: 'pip', line: 'Look, Bella! There is a little fish in the pond!' },
      { who: 'bella', line: 'Oh! But this fish has no color at all!' },
      { who: 'pip', line: "Let's watch what happens..." },
    ],
    cta: "Let's watch!",
  },
  {
    id: 'u2l5-storybook', kind: 'flipbook', bg: bgU2L5FishPond, title: "The Rainbow Fish's Scales",
    pages: [
      { who: 'pip', img: bgU2L5FishGrey, text: 'Once there was a little fish with no color at all. It felt very sad.' },
      { who: 'pip', img: bgU2L5FishRed, text: 'The fish swam by a red flower. Its scales turned red! "It\'s red!" said the fish.' },
      { who: 'bella', img: bgU2L5FishOrange, text: 'Next, it swam by an orange flower. Its scales turned orange too! "It\'s orange!"' },
      { who: 'pip', img: bgU2L5FishYellow, text: 'Then it swam by a yellow flower. Its scales turned yellow! "It\'s yellow!"' },
      { who: 'bella', img: bgU2L5FishGreen, text: 'It swam by a green lily pad. Its scales turned green! "It\'s green!"' },
      { who: 'pip', img: bgU2L5FishBlue, text: 'It swam by a blue flower. Its scales turned blue! "It\'s blue!"' },
      { who: 'bella', img: bgU2L5FishPurple, text: 'Last, it swam by a purple flower. Its scales turned purple! "It\'s purple!"' },
      { who: 'pip', img: bgU2L5FishPond, text: 'Now the little fish has every color — red, orange, yellow, green, blue, AND purple! "You are a rainbow fish!" said Pip and Bella.' },
    ],
    checkpoints: [
      { afterPage: 1, who: 'pip', question: 'What color did the fish turn first?', options: ['Red', 'Blue', 'Green'], answer: 'Red' },
      { afterPage: 4, who: 'bella', question: 'What color was the lily pad?', options: ['Yellow', 'Green', 'Purple'], answer: 'Green' },
      { afterPage: 6, who: 'pip', question: 'What color did the fish turn last?', options: ['Orange', 'Blue', 'Purple'], answer: 'Purple' },
    ],
  },
  {
    id: 'u2l5-recap', kind: 'listen-repeat-cards', bg: bgU2L5FishPond, teacher: 'Let’s remember the rainbow fish! Listen, then repeat!',
    cards: [
      { who: 'pip', sentence: "It's red!", img: bgU2L5FishRed, imgLabel: 'Red' },
      { who: 'bella', sentence: "It's orange!", img: bgU2L5FishOrange, imgLabel: 'Orange' },
      { who: 'pip', sentence: "It's yellow!", img: bgU2L5FishYellow, imgLabel: 'Yellow' },
      { who: 'bella', sentence: "It's green!", img: bgU2L5FishGreen, imgLabel: 'Green' },
      { who: 'pip', sentence: "It's blue!", img: bgU2L5FishBlue, imgLabel: 'Blue' },
      { who: 'bella', sentence: "It's purple!", img: bgU2L5FishPurple, imgLabel: 'Purple' },
    ],
  },
  {
    id: 'u2l5-join-stage', kind: 'join-stage', bg: bgU2L5FishPond, teacher: 'Your turn! When it says YOU, tell the story.', cast: ['pip', 'bella'],
    turns: [
      { who: 'pip', line: 'What color was the fish at the start?' },
      { who: 'student', line: '______. (It had no color!)' },
      { who: 'bella', line: 'What color is the fish now?' },
      { who: 'student', line: "It's a ______ fish! (rainbow)" },
      { who: 'pip', line: 'Do you like the rainbow fish?' },
      { who: 'student', line: 'I like ______. / I don’t like ______.' },
    ],
  },
  {
    id: 'u2l5-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to the rainbow fish! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3580, 4020, 4980, 7482],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'bella', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'pip', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'u2l5-finale', kind: 'finale', bg: bgU2L5FishPond, who: 'pip', line: 'You did it! You know the whole rainbow — red, orange, yellow, green, blue, AND purple! \u{1F308}\u{1F41F}' },
];

/* =============================================================================
 * Pre-A1 Unit 2, Lesson 6 — "Color & Shape Hunt" (cumulative capstone review)
 *
 * The curriculum blueprint's own pre-seeded stub for this slot (curriculum_
 * lessons row 24e8d077-07f7-439b-a681-05ba77f4b50c) named the topic "Color &
 * Shape Hunt" — a hunt-framed title, not a new-vocabulary title, and the
 * final lesson in Unit 2. Read the same way Unit 1's own Lesson 6 ("The
 * Trophy Trail") was read: this unit's cumulative capstone, not a fourth
 * teaching lesson. Zero new vocabulary, zero new phonics, zero new art —
 * every background and item image is reused directly from Lessons 1-5's own
 * already-generated, already-verified art, same reasoning L4's own review
 * used.
 *
 * What's actually being reviewed, and why each round earns its place:
 * - All six colors (red/blue/yellow/green/orange/purple) from L1-L2 —
 *   isolated recall (u2l6-quiz, u2l6-spy-a/b, u2l6-simon, u2l6-dash-colors).
 * - All three shapes (circle/square/triangle) from L3 — isolated recall
 *   (u2l6-shape-sort, u2l6-dash-shapes).
 * - The PROGRESSIVE-COMBINATION skill L3 introduced and L4 first reviewed —
 *   color+shape fused into one noun phrase ("It's a yellow triangle") —
 *   gets its own dedicated round (u2l6-combo-cards) plus the join-stage's
 *   own combined turn, so the hunt reviews the combined skill as its own
 *   thing, not just the two halves separately. Per the smart-lesson-
 *   architect methodology's "Progressive combination rule": a capstone
 *   that never re-tests the combined form would be reviewing less than the
 *   unit actually taught.
 * - u2l6-dash-mixed is the one genuinely NEW discrimination task in this
 *   lesson (not new vocabulary — new difficulty): a single hunt pool mixing
 *   colored objects AND shaped objects together, where the target is one
 *   specific color-shape combo and every other item (wrong color OR wrong
 *   shape) is a distractor. Neither teaching lesson's own dash ever mixed
 *   colors and shapes in the same pool.
 * - u2l6-storybook is a "greatest hits" flipbook using one page per lesson
 *   (L1's parade, L2's parade, L3's parade, L5's finished rainbow fish) as
 *   a visual recap of the whole unit's journey, not new narrative content.
 *
 * LENGTH/VARIETY REVISION (2026-08-12): direct user correction — the lesson
 * needed more activities to fill its real ~30-minute classroom slot, with
 * "coloring" and "puzzle" named as ideas, and explicit license to build a
 * new mechanic if needed. Added two rounds, both genuinely new mechanics
 * for THIS unit (not reused verbatim), backed by a live web search
 * confirming shape-matching and interactive coloring are the two most
 * common effective mechanics for this exact age/topic:
 * - u2l6-memory: an 8-pair memory-match board (the `memory` kind already
 *   existed in this file's own type union from Unit 1 but had never been
 *   used anywhere in Unit 2) mixing isolated colors and combined
 *   color+shape items — reuse of an existing mechanic, new to this unit.
 * - u2l6-coloring: a real paint-with-your-finger coloring activity (the
 *   `color-friends` kind's existing vocabItems/canvas-painting mode,
 *   previously only used for apple/water/sun in u2l1-color-friends) —
 *   required one small, genuinely new code addition: `circle`/`square`/
 *   `triangle` outline shapes added to VocabOutline in SceneRenderer.tsx,
 *   so the same proven paint mechanic could color shapes instead of fruit.
 * ========================================================================= */

export const LESSON_U2L6_TITLE = 'Color & Shape Hunt';
export const LESSON_U2L6_OBJECTIVE = 'Cumulative review of every color, shape, and combined color+shape phrase from Unit 2 through a hunt-themed mix of harder, combined recall activities — no new vocabulary, pure consolidation.';

export const LESSON_U2L6_SCENES: Scene[] = [
  { id: 'u2l6-title', kind: 'title-card', bg: bgU2L3ShapeParade, level: 'Pre-A1', unit: 'Unit 2', lessonLabel: 'Lesson 6', title: 'Color & Shape Hunt', subtitle: 'The biggest hunt in the Rainbow Meadow!' },
  {
    id: 'u2l6-intro', kind: 'cinematic', bg: bgU2L3ShapeParade, title: 'Color & Shape Hunt', subtitle: 'One last hunt before we say goodbye', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Six colors, three shapes — we learned SO much in the Rainbow Meadow!' },
      { who: 'pip', line: "Let's go on one big hunt and find them all, one more time!" },
    ],
    cta: "Let's hunt!",
  },
  {
    id: 'u2l6-quiz', kind: 'color-quiz', bg: bgMeadow, teacher: 'Hunt round 1! Which one is the right color? Tap it!',
    rounds: [
      { colorWord: 'RED', colorHex: '#E63946', who: 'bella', correctImg: itemApple, correctLabel: 'Apple', distractors: [{ img: itemWater, label: 'Water' }, { img: itemOrange, label: 'Orange' }] },
      { colorWord: 'BLUE', colorHex: '#3B82F6', who: 'willow', correctImg: itemWave, correctLabel: 'Wave', distractors: [{ img: itemLeaf, label: 'Leaf' }, { img: itemGrapes, label: 'Grapes' }] },
      { colorWord: 'YELLOW', colorHex: '#FBBF24', who: 'pip', correctImg: itemSun, correctLabel: 'Sun', distractors: [{ img: itemRose, label: 'Rose' }, { img: itemMoon, label: 'Moon' }] },
      { colorWord: 'GREEN', colorHex: '#22C55E', who: 'willow', correctImg: itemLeaf, correctLabel: 'Leaf', distractors: [{ img: itemApple, label: 'Apple' }, { img: itemGrapes, label: 'Grapes' }] },
      { colorWord: 'ORANGE', colorHex: '#F97316', who: 'leo', correctImg: itemOrange, correctLabel: 'Orange', distractors: [{ img: itemSun, label: 'Sun' }, { img: itemWater, label: 'Water' }] },
      { colorWord: 'PURPLE', colorHex: '#A855F7', who: 'mia', correctImg: itemGrapes, correctLabel: 'Grapes', distractors: [{ img: itemOrange, label: 'Orange' }, { img: itemWave, label: 'Wave' }] },
    ],
  },
  {
    id: 'u2l6-shape-sort', kind: 'shape-sort', bg: bgMeadow, teacher: 'Hunt round 2! Drag each thing to its shape!',
    targets: [
      { shapeWord: 'CIRCLE', shapeColor: '#EF4444', who: 'bella' },
      { shapeWord: 'SQUARE', shapeColor: '#3B82F6', who: 'mia' },
      { shapeWord: 'TRIANGLE', shapeColor: '#F59E0B', who: 'leo' },
    ],
    items: [
      { word: 'ball', emoji: '\u{26BD}', shapeWord: 'CIRCLE' },
      { word: 'moon', emoji: '\u{1F315}', shapeWord: 'CIRCLE' },
      { word: 'book', emoji: '\u{1F4D8}', shapeWord: 'SQUARE' },
      { word: 'box', emoji: '\u{1F4E6}', shapeWord: 'SQUARE' },
      { word: 'pizza', emoji: '\u{1F355}', shapeWord: 'TRIANGLE' },
      { word: 'flag', emoji: '\u{1F6A9}', shapeWord: 'TRIANGLE' },
    ],
  },
  {
    // The combined-skill checkpoint — reviews the fused "color + shape"
    // frame L3 introduced, not colors and shapes as separate halves.
    id: 'u2l6-combo-cards', kind: 'listen-repeat-cards', bg: bgU2L3ShapeParade, teacher: 'Hunt round 3! Remember colors AND shapes together. Listen, then repeat!',
    cards: [
      { who: 'bella', sentence: "It's a red circle!", img: itemBall, imgLabel: 'Red circle' },
      { who: 'mia', sentence: "It's a blue square!", img: itemBook, imgLabel: 'Blue square' },
      { who: 'leo', sentence: "It's a yellow triangle!", img: itemPizza, imgLabel: 'Yellow triangle' },
      { who: 'bella', sentence: 'I like red circles!', img: itemBall, imgLabel: 'Red circle' },
      { who: 'mia', sentence: "I don't like blue squares!", img: itemBook, imgLabel: 'Blue square' },
      { who: 'leo', sentence: 'I like yellow triangles!', img: itemPizza, imgLabel: 'Yellow triangle' },
    ],
  },
  {
    id: 'u2l6-spy-a', kind: 'color-spy', bg: bgU2L1ColorParade, teacher: 'Hunt round 4! I Spy! Find the color I say.', who: 'pip',
    spots: [
      { colorWord: 'RED', colorHex: '#E63946', label: 'Apple', left: '22%', top: '63%' },
      { colorWord: 'BLUE', colorHex: '#3B82F6', label: 'Water', left: '47%', top: '80%' },
      { colorWord: 'YELLOW', colorHex: '#FBBF24', label: 'Sunflower', left: '81%', top: '27%' },
    ],
    clueOrder: ['BLUE', 'YELLOW', 'RED'],
  },
  {
    id: 'u2l6-spy-b', kind: 'color-spy', bg: bgU2L2ColorParade, teacher: 'Keep hunting! Find the color I say.', who: 'pip',
    spots: [
      { colorWord: 'GREEN', colorHex: '#22C55E', label: 'Leaf', left: '18%', top: '48%' },
      { colorWord: 'ORANGE', colorHex: '#F97316', label: 'Orange', left: '48%', top: '78%' },
      { colorWord: 'PURPLE', colorHex: '#A855F7', label: 'Grapes', left: '82%', top: '68%' },
    ],
    clueOrder: ['ORANGE', 'PURPLE', 'GREEN'],
  },
  {
    id: 'u2l6-word-build', kind: 'word-build', bg: bgMeadow, teacher: 'Hunt round 5! Tap the missing letter to make the word.',
    rounds: [
      { word: 'red', blankIndex: 0, answer: 'R', choices: ['R', 'B', 'Y'], img: itemApple, emoji: '\u{1F34E}' },
      { word: 'blue', blankIndex: 0, answer: 'B', choices: ['R', 'B', 'Y'], img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'yellow', blankIndex: 0, answer: 'Y', choices: ['R', 'B', 'Y'], img: itemSun, emoji: '\u{2600}️' },
      { word: 'green', blankIndex: 0, answer: 'G', choices: ['G', 'O', 'P'], img: itemLeaf, emoji: '\u{1F343}' },
      { word: 'orange', blankIndex: 0, answer: 'O', choices: ['G', 'O', 'P'], img: itemOrange, emoji: '\u{1F34A}' },
      { word: 'purple', blankIndex: 0, answer: 'P', choices: ['G', 'O', 'P'], img: itemGrapes, emoji: '\u{1F347}' },
      { word: 'circle', blankIndex: 0, answer: 'C', choices: ['C', 'S', 'T'], img: itemBall, emoji: '\u{26BD}' },
      { word: 'square', blankIndex: 0, answer: 'S', choices: ['C', 'S', 'T'], img: itemBook, emoji: '\u{1F4D8}' },
      { word: 'triangle', blankIndex: 0, answer: 'T', choices: ['C', 'S', 'T'], img: itemPizza, emoji: '\u{1F355}' },
    ],
  },
  {
    // Direct user request for more variety/length: a real memory-match
    // board mixing isolated colors (from L1-L2) with the combined
    // color+shape items (from L3) — 8 pairs = a clean 4x4 grid, and the
    // biggest single activity added to fill out the lesson's time.
    id: 'u2l6-memory', kind: 'memory', bg: bgMeadow, teacher: 'Hunt round 5b! Find the matching pairs!',
    pairs: [
      { id: 'red', label: 'Red', emoji: '\u{1F34E}', img: itemApple },
      { id: 'blue', label: 'Blue', emoji: '\u{1F4A7}', img: itemWater },
      { id: 'yellow', label: 'Yellow', emoji: '\u{2600}️', img: itemSun },
      { id: 'green', label: 'Green', emoji: '\u{1F343}', img: itemLeaf },
      { id: 'orange', label: 'Orange', emoji: '\u{1F34A}', img: itemOrange },
      { id: 'purple', label: 'Purple', emoji: '\u{1F347}', img: itemGrapes },
      { id: 'red-circle', label: 'Red circle', emoji: '\u{26BD}', img: itemBall },
      { id: 'yellow-triangle', label: 'Yellow triangle', emoji: '\u{1F355}', img: itemPizza },
    ],
  },
  {
    // Direct user request for a coloring activity: paints the three shapes
    // in the combined-skill's own colors (red circle, blue square, yellow
    // triangle), reusing the already-built color-friends canvas-painting
    // mechanic in its vocabItems mode (previously only apple/water/sun —
    // added circle/square/triangle outlines to VocabOutline for this).
    id: 'u2l6-coloring', kind: 'color-friends', bg: bgMeadow, teacher: 'Hunt round 5c! Color each shape its own special color!',
    vocabItems: [
      { label: 'Circle', targetColorHex: '#EF4444', targetColorName: 'Red', outline: 'circle' },
      { label: 'Square', targetColorHex: '#3B82F6', targetColorName: 'Blue', outline: 'square' },
      { label: 'Triangle', targetColorHex: '#FBBF24', targetColorName: 'Yellow', outline: 'triangle' },
    ],
  },
  {
    // Boss round: six colors, six rounds of growing sequence length — one
    // harder than either teaching lesson's own Simon Says AND U2L4's own
    // five-round boss version.
    id: 'u2l6-simon', kind: 'color-simon', bg: bgMeadow, teacher: 'Hunt round 6! Simon says... watch closely, then copy the pattern!', maxRounds: 6,
    colors: [
      { colorWord: 'RED', colorHex: '#E63946', who: 'bella' },
      { colorWord: 'BLUE', colorHex: '#3B82F6', who: 'willow' },
      { colorWord: 'YELLOW', colorHex: '#FBBF24', who: 'pip' },
      { colorWord: 'GREEN', colorHex: '#22C55E', who: 'willow' },
      { colorWord: 'ORANGE', colorHex: '#F97316', who: 'leo' },
      { colorWord: 'PURPLE', colorHex: '#A855F7', who: 'mia' },
    ],
  },
  {
    id: 'u2l6-dash-shapes', kind: 'dash', bg: bgU2L3DashArena, teacher: 'Hunt round 7! Tap only the TRIANGLE things as they run by. Get 6 rings!', who: 'leo', targetLetter: 'TRIANGLE', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'pizza', letter: 'TRIANGLE', emoji: '\u{1F355}' },
      { word: 'flag', letter: 'TRIANGLE', emoji: '\u{1F6A9}' },
      { word: 'ball', letter: 'CIRCLE', emoji: '\u{26BD}' },
      { word: 'moon', letter: 'CIRCLE', emoji: '\u{1F315}' },
      { word: 'book', letter: 'SQUARE', emoji: '\u{1F4D8}' },
      { word: 'box', letter: 'SQUARE', emoji: '\u{1F4E6}' },
    ],
  },
  {
    // The one genuinely new discrimination task: a single pool mixing
    // COLORED objects and SHAPED objects together — the target is one
    // specific combo (yellow things), and every wrong-color AND
    // wrong-shape item is a distractor. Neither teaching lesson's own dash
    // ever mixed colors and shapes in the same pool.
    id: 'u2l6-dash-mixed', kind: 'dash', bg: bgU2L2DashArena, teacher: 'Final hunt round! Tap only the YELLOW things as they run by — colors AND shapes are mixed together now!', who: 'pip', targetLetter: 'YELLOW', targetPhoneme: '', goal: 6, seconds: 45,
    items: [
      { word: 'sun', letter: 'YELLOW', img: itemSun, emoji: '\u{2600}️' },
      { word: 'pizza', letter: 'YELLOW', img: itemPizza, emoji: '\u{1F355}' },
      { word: 'apple', letter: 'RED', img: itemApple, emoji: '\u{1F34E}' },
      { word: 'water', letter: 'BLUE', img: itemWater, emoji: '\u{1F4A7}' },
      { word: 'leaf', letter: 'GREEN', img: itemLeaf, emoji: '\u{1F343}' },
      { word: 'grapes', letter: 'PURPLE', img: itemGrapes, emoji: '\u{1F347}' },
      { word: 'ball', letter: 'RED', img: itemBall, emoji: '\u{26BD}' },
      { word: 'book', letter: 'BLUE', img: itemBook, emoji: '\u{1F4D8}' },
    ],
  },
  {
    id: 'u2l6-who', kind: 'listen-repeat-cards', bg: bgMeadow, teacher: 'Almost done! Listen to each friend, then repeat!',
    cards: [
      { who: 'bella', sentence: 'The apple is red!', img: itemApple, imgLabel: 'Red' },
      { who: 'willow', sentence: 'The water is blue!', img: itemWater, imgLabel: 'Blue' },
      { who: 'leo', sentence: "It's a yellow triangle!", img: itemPizza, imgLabel: 'Yellow triangle' },
      { who: 'mia', sentence: "It's a blue square!", img: itemBook, imgLabel: 'Blue square' },
    ],
  },
  {
    // Each question shows the actual object it's asking about, same fix as
    // every other join-stage this session — and the final turn deliberately
    // combines color AND shape, the unit's own hardest, most-combined skill.
    id: 'u2l6-join-stage', kind: 'join-stage', bg: bgU2L3ShapeParade, teacher: 'Your final turn! Show everything you learned in the Rainbow Meadow!', cast: ['pip', 'bella', 'willow', 'leo', 'mia'],
    turns: [
      { who: 'pip', line: 'What color is the apple?', bg: bgU2L1PipBellaAppleWater },
      { who: 'student', line: "It's ______.", bg: bgU2L1PipBellaAppleWater },
      { who: 'willow', line: 'What color is the leaf?', bg: bgU2L2GreenOnly },
      { who: 'student', line: "It's ______.", bg: bgU2L2GreenOnly },
      { who: 'leo', line: 'What color and shape is the pizza?', bg: bgU2L3TriangleSolo },
      { who: 'student', line: "It's a ______ ______. (yellow triangle)", bg: bgU2L3TriangleSolo },
    ],
  },
  {
    id: 'u2l6-storybook', kind: 'flipbook', bg: bgU2L3ShapeParade, title: 'Our Rainbow Meadow Journey',
    pages: [
      { who: 'pip', img: bgU2L1ColorParade, text: 'We started with red, blue, and yellow.' },
      { who: 'willow', img: bgU2L2ColorParade, text: 'Then we found green, orange, and purple!' },
      { who: 'bella', img: bgU2L3ShapeParade, text: 'Next we learned circles, squares, and triangles.' },
      { who: 'leo', img: bgU2L3TriangleSolo, text: 'And we put colors and shapes together — like a yellow triangle!' },
      { who: 'pip', img: bgU2L5FishPond, text: 'We even met a little fish who found every color in the whole rainbow!' },
    ],
    checkpoints: [
      { afterPage: 1, who: 'willow', question: 'What color is the leaf?', options: ['Red', 'Green', 'Purple'], answer: 'Green' },
      { afterPage: 3, who: 'leo', question: 'What color and shape was the pizza?', options: ['Red circle', 'Blue square', 'Yellow triangle'], answer: 'Yellow triangle' },
    ],
  },
  {
    id: 'u2l6-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F3C6} Rainbow Meadow Goodbye Song \u{1F3C6}', teacher: 'Wave goodbye to the whole Rainbow Meadow! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3580, 4020, 4980, 7482],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'leo', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'mia', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'u2l6-finale', kind: 'finale', bg: bgU2L3ShapeParade, who: 'pip', line: 'You are a Rainbow Meadow champion! Six colors, three shapes, AND you can put them together — red circles, blue squares, yellow triangles, and everything in between! \u{1F3C6}\u{1F308}' },
];

/* =============================================================================
 * Pre-A1 Unit 3, Lesson 1 — "Ball, Car, Doll!"
 *
 * The curriculum blueprint's own pre-seeded stub for this slot (curriculum_
 * lessons row daacfe9c-f714-425c-b670-4bfa74cf4f3d) names the topic: Unit 3
 * ("Toys & Playtime") opens here with its first three toy nouns. Per the
 * generate-lesson skill's unit shape (.agents/skills/generate-lesson), this
 * is a Lesson 1 — core vocabulary, light production, Straight Arrow ESA.
 *
 * PROGRESSIVE COMBINATION FROM THE START: unlike Unit 2 Lesson 1 (which
 * taught colors in isolation, only combining with shapes three lessons
 * later), this lesson combines the brand-new toy nouns with colors already
 * mastered in Unit 2 from its very first practice round — "It's a red
 * ball," never a bare "It's a ball." The color skill needs no re-teaching;
 * only the toy nouns are new. See the smart-lesson-architect methodology's
 * "Progressive combination rule."
 *
 * - Cast: Bella=BALL (red), Willow=CAR (blue), Mia=DOLL (green) — fixed,
 *   single colors per toy (not each character's own established color
 *   ownership from Unit 2, which doesn't apply here; picked classic,
 *   maximally distinct combos). Pip stays narrator/host.
 * - Phonics: of the three toy words' initial letters (B, C, D), only D is
 *   new — B was taught in Unit 1, C in Unit 2 Lesson 3. D gets a full
 *   sound-model+trace pair; B and C get retrieval-only practice (a
 *   phonics hint in word-build's letter choices), matching the
 *   established "already-taught letter gets lighter treatment" pattern.
 * - Mechanics: added two new Scene kinds mirroring shape-model's proven
 *   tap/hold/repeat progression — 'toy-model' (teaches the toy noun, then
 *   the combined color+toy sentence). The sort round reuses 'color-sort'
 *   directly rather than adding a third new kind: it's fully generic
 *   (colorWord as a plain matching key, colorHex as the swatch fill), so
 *   setting colorWord to the toy noun (BALL/CAR/DOLL) instead of an actual
 *   color name works with zero code changes.
 * - Art: every scene needing a specific character+toy gets its own
 *   dedicated single-object image — a parade hero (all 4 cast + all 3
 *   toys), a two-character "-only" image per toy for roleplay/flipbook,
 *   and a separate one-character "-solo" image per toy (owner alone, open
 *   space on the right) for join-stage, per the U2L3 lesson learned this
 *   session: two-character images leave no clear space for the student's
 *   draggable video circle. All backgrounds needed a full-bleed retry —
 *   the first attempt for all four hero/roleplay shots rendered as a
 *   small oval rug floating on white instead of filling the canvas: fixed
 *   by explicitly describing the floor and wall as extending edge-to-edge
 *   rather than just asking for "no white space." One retry was also
 *   needed for bg-u3l1-doll-only (first attempt drew Pip twice instead of
 *   Pip+Mia) and bg-u3l1-car-solo (first attempt had a flat, windowless
 *   wall with a visual streak artifact, inconsistent with the other two
 *   solo shots).
 * ========================================================================= */

const bgU3L1ToyParade = `${A}/scenes/bg-u3l1-toy-parade.png`;
const bgU3L1BallOnly = `${A}/scenes/bg-u3l1-ball-only.png`;
const bgU3L1CarOnly = `${A}/scenes/bg-u3l1-car-only.png`;
const bgU3L1DollOnly = `${A}/scenes/bg-u3l1-doll-only.png`;
const bgU3L1BallSolo = `${A}/scenes/bg-u3l1-ball-solo.png`;
const bgU3L1CarSolo = `${A}/scenes/bg-u3l1-car-solo.png`;
const bgU3L1DollSolo = `${A}/scenes/bg-u3l1-doll-solo.png`;
const bgU3L1SoundGarden = `${A}/scenes/bg-u3l1-sound-garden.png`;
const bgU3L1DashArena = `${A}/scenes/bg-u3l1-dash-arena.png`;
const itemCar = `${A}/items/item-car.png`;
const itemDoll = `${A}/items/item-doll.png`;

export const LESSON_U3L1_TITLE = 'Ball, Car, Doll!';
export const LESSON_U3L1_OBJECTIVE = 'Identify and name the toys ball, car, and doll, combine them immediately with previously-learned colors into full noun phrases ("It\'s a red ball," "I like blue cars," "I don\'t like green dolls"), and recognize the D letter sound.';

export const LESSON_U3L1_SCENES: Scene[] = [
  { id: 'u3l1-title', kind: 'title-card', bg: bgU3L1ToyParade, level: 'Pre-A1', unit: 'Unit 3', lessonLabel: 'Lesson 1', title: 'Ball, Car, Doll!', subtitle: 'Playtime with Pip and friends' },
  {
    // Warmup hello moment, per direct user request — every lesson so far
    // opened straight into the cinematic intro with no dedicated warmup.
    // Uses 'roleplay' (spoken live via the app's own TTS voices, same as
    // every other line in the app) rather than 'song' — 'song' depends on
    // a pre-recorded audio file, and unlike goodbye-song.mp3 (which
    // already exists and is reused by every lesson), no hello-song.mp3
    // exists anywhere in this project. SongScene has no way to advance
    // past a song whose audio fails to load (the Continue button only
    // appears once the audio's onended fires), so using 'song' here would
    // have soft-locked the lesson at this very first activity. Doubles as
    // the "revision if necessary" the user also asked about: the middle
    // two lines briefly call back to Unit 2's own six colors before the
    // new toy content starts, without a whole separate review activity —
    // those colors get real practice again a moment later anyway, fused
    // into this lesson's own target sentences.
    id: 'u3l1-hello', kind: 'roleplay', bg: bgU3L1ToyParade, teacher: 'Good morning! Let’s say hello and warm up together.', cast: ['pip', 'bella', 'willow', 'mia'],
    script: [
      { who: 'pip', line: 'Hello, hello, hello my friend!', repeat: true },
      { who: 'bella', line: "Hello! Let's play again!" },
      { who: 'willow', line: 'Remember red, blue, yellow, green?', repeat: true },
      { who: 'mia', line: "Today it's toys — let's go and see!" },
    ],
  },
  {
    id: 'u3l1-intro', kind: 'cinematic', bg: bgU3L1ToyParade, title: 'Ball, Car, Doll!', subtitle: 'A playroom full of toys', narrator: 'pip', hidePipOverlay: true,
    script: [
      { who: 'pip', line: 'Look! Today we find toys, not colors or shapes!' },
      { who: 'pip', line: 'Bella has a red ball, Willow has a blue car, and Mia has a green doll!' },
    ],
    cta: "Let's play!",
  },
  {
    id: 'u3l1-vocab-toys', kind: 'toy-model', bg: bgMeadow,
    teacher: 'Look! Tap a toy to hear it, say it back, then say the sentence!',
    items: [
      { toyWord: 'BALL', colorWord: 'RED', colorHex: '#EF4444', who: 'bella', img: itemBall },
      { toyWord: 'CAR', colorWord: 'BLUE', colorHex: '#3B82F6', who: 'willow', img: itemCar },
      { toyWord: 'DOLL', colorWord: 'GREEN', colorHex: '#22C55E', who: 'mia', img: itemDoll },
    ],
  },
  {
    id: 'u3l1-model-d', kind: 'sound-model', bg: bgU3L1SoundGarden, who: 'mia', letter: 'D', phoneme: '/d/', sound: 'duh', teacher: 'Mia models the /d/ sound! Listen first: /d/ /d/ Doll. /d/ /d/ Duck.',
    anchors: [
      { word: 'Doll', emoji: '\u{1FA86}' },
      { word: 'Duck', emoji: '\u{1F986}' },
      { word: 'Dinosaur', emoji: '\u{1F995}' },
    ],
  },
  { id: 'u3l1-trace-d', kind: 'trace', bg: bgU3L1SoundGarden, who: 'mia', letter: 'D', phoneme: '/d/', word: 'Doll', teacher: 'Trace the tall D. /d/ /d/ Doll!' },
  {
    // Direct user request for genuinely new (not "copycat") mechanics,
    // backed by live research: toy-vocabulary memory-matching is one of
    // the most common, proven activities for retention at this age —
    // and the `memory` kind has never been used anywhere in Unit 2 or 3
    // before this. 8 pairs = a clean 4x4 grid.
    id: 'u3l1-memory', kind: 'memory', bg: bgMeadow, teacher: 'Memory game! Find the matching toy pairs!',
    pairs: [
      { id: 'ball', label: 'Ball', emoji: '\u{26BD}', img: itemBall },
      { id: 'car', label: 'Car', emoji: '\u{1F697}', img: itemCar },
      { id: 'doll', label: 'Doll', emoji: '\u{1FA86}', img: itemDoll },
    ],
  },
  {
    // B (Unit 1) and C (Unit 2 Lesson 3) are already-taught letters — same
    // lighter, retrieval-only treatment established for repeated letters:
    // a phonics hint here and in word-build, no full model+trace pair.
    // Reuses 'color-sort' directly (fully generic — colorWord is just a
    // matching key) rather than adding a third new scene kind for toys.
    id: 'u3l1-sort-toys', kind: 'color-sort', bg: bgMeadow, teacher: "Listen for the sound! /b/all, /c/ar, /d/oll — now drag each thing to its toy!",
    targets: [
      { colorWord: 'BALL', colorHex: '#EF4444', who: 'bella' },
      { colorWord: 'CAR', colorHex: '#3B82F6', who: 'willow' },
      { colorWord: 'DOLL', colorHex: '#22C55E', who: 'mia' },
    ],
    items: [
      { word: 'soccer ball', emoji: '\u{26BD}', colorWord: 'BALL' },
      { word: 'basketball', emoji: '\u{1F3C0}', colorWord: 'BALL' },
      { word: 'taxi', emoji: '\u{1F695}', colorWord: 'CAR' },
      { word: 'truck', emoji: '\u{1F69A}', colorWord: 'CAR' },
      { word: 'teddy bear', emoji: '\u{1F9F8}', colorWord: 'DOLL' },
      { word: 'toy figure', emoji: '\u{1FA86}', colorWord: 'DOLL' },
    ],
  },
  {
    id: 'u3l1-word-build', kind: 'word-build', bg: bgMeadow, teacher: 'Listen! Tap the missing letter to make the word.',
    rounds: [
      { word: 'ball', blankIndex: 0, answer: 'B', choices: ['B', 'C', 'D'], img: itemBall, emoji: '\u{26BD}' },
      { word: 'car', blankIndex: 0, answer: 'C', choices: ['B', 'C', 'D'], img: itemCar, emoji: '\u{1F697}' },
      { word: 'doll', blankIndex: 0, answer: 'D', choices: ['B', 'C', 'D'], img: itemDoll, emoji: '\u{1FA86}' },
    ],
  },
  {
    id: 'u3l1-who', kind: 'listen-repeat-cards', bg: bgU3L1ToyParade, teacher: 'Listen to each friend, then repeat!',
    cards: [
      { who: 'bella', sentence: 'Bella has a ball!', img: itemBall, imgLabel: 'Ball' },
      { who: 'willow', sentence: 'Willow has a car!', img: itemCar, imgLabel: 'Car' },
      { who: 'mia', sentence: 'Mia has a doll!', img: itemDoll, imgLabel: 'Doll' },
    ],
  },
  {
    // The TARGET frame for this lesson: toy + the color that object's own
    // art already shows, combined into one noun phrase from the very
    // first practice round — colors need no re-teaching, only the toy
    // nouns are new.
    id: 'u3l1-sentence-practice', kind: 'listen-repeat-cards', bg: bgU3L1ToyParade, teacher: "Now let's put color AND toy together! Listen, then repeat!",
    cards: [
      { who: 'bella', sentence: "It's a red ball!", img: itemBall, imgLabel: 'Red ball' },
      { who: 'willow', sentence: "It's a blue car!", img: itemCar, imgLabel: 'Blue car' },
      { who: 'mia', sentence: "It's a green doll!", img: itemDoll, imgLabel: 'Green doll' },
      { who: 'bella', sentence: 'I like red balls!', img: itemBall, imgLabel: 'Red ball' },
      { who: 'willow', sentence: "I don't like blue cars!", img: itemCar, imgLabel: 'Blue car' },
      { who: 'mia', sentence: 'I like green dolls!', img: itemDoll, imgLabel: 'Green doll' },
    ],
  },
  {
    id: 'u3l1-dash-ball', kind: 'dash', bg: bgU3L1DashArena, teacher: 'Bella Dash! Tap only the BALL things as they run by. Get 6 rings!', who: 'bella', targetLetter: 'BALL', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'ball', letter: 'BALL', img: itemBall, emoji: '\u{26BD}' },
      { word: 'ball', letter: 'BALL', img: itemBall, emoji: '\u{1F3C0}' },
      { word: 'car', letter: 'CAR', img: itemCar, emoji: '\u{1F697}' },
      { word: 'car', letter: 'CAR', img: itemCar, emoji: '\u{1F695}' },
      { word: 'doll', letter: 'DOLL', img: itemDoll, emoji: '\u{1FA86}' },
      { word: 'doll', letter: 'DOLL', img: itemDoll, emoji: '\u{1F9F8}' },
    ],
  },
  {
    id: 'u3l1-dash-car', kind: 'dash', bg: bgU3L1DashArena, teacher: 'Willow Dash! Tap only the CAR things as they run by. Get 6 rings!', who: 'willow', targetLetter: 'CAR', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'car', letter: 'CAR', img: itemCar, emoji: '\u{1F697}' },
      { word: 'car', letter: 'CAR', img: itemCar, emoji: '\u{1F695}' },
      { word: 'doll', letter: 'DOLL', img: itemDoll, emoji: '\u{1FA86}' },
      { word: 'doll', letter: 'DOLL', img: itemDoll, emoji: '\u{1F9F8}' },
      { word: 'ball', letter: 'BALL', img: itemBall, emoji: '\u{26BD}' },
      { word: 'ball', letter: 'BALL', img: itemBall, emoji: '\u{1F3C0}' },
    ],
  },
  {
    id: 'u3l1-dash-doll', kind: 'dash', bg: bgU3L1DashArena, teacher: 'Mia Dash! Tap only the DOLL things as they run by. Get 6 rings!', who: 'mia', targetLetter: 'DOLL', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'doll', letter: 'DOLL', img: itemDoll, emoji: '\u{1FA86}' },
      { word: 'doll', letter: 'DOLL', img: itemDoll, emoji: '\u{1F9F8}' },
      { word: 'ball', letter: 'BALL', img: itemBall, emoji: '\u{26BD}' },
      { word: 'ball', letter: 'BALL', img: itemBall, emoji: '\u{1F3C0}' },
      { word: 'car', letter: 'CAR', img: itemCar, emoji: '\u{1F697}' },
      { word: 'car', letter: 'CAR', img: itemCar, emoji: '\u{1F695}' },
    ],
  },
  {
    // Each question shows the actual object being asked about (its own
    // single-CHARACTER solo image, open space preserved for the student's
    // draggable video circle) — the fix established in U2L3/U2L4/U2L6.
    id: 'u3l1-join-stage', kind: 'join-stage', bg: bgU3L1ToyParade, teacher: 'Your turn! When it says YOU, say the color AND the toy.', cast: ['pip', 'bella', 'willow', 'mia'],
    turns: [
      { who: 'pip', line: 'What color and toy is this?', bg: bgU3L1BallSolo },
      { who: 'student', line: "It's a ______ ______. (red ball)", bg: bgU3L1BallSolo },
      { who: 'willow', line: 'Do you like blue cars?', bg: bgU3L1CarSolo },
      { who: 'student', line: 'I like ______ ______. / I don’t like ______ ______.', bg: bgU3L1CarSolo },
      { who: 'mia', line: 'What color and toy is this?', bg: bgU3L1DollSolo },
      { who: 'student', line: "It's a ______ ______. (green doll)", bg: bgU3L1DollSolo },
    ],
  },
  {
    id: 'u3l1-storybook', kind: 'flipbook', bg: bgU3L1ToyParade, title: 'Playtime with Pip and Friends',
    pages: [
      { who: 'bella', img: bgU3L1BallOnly, text: 'Bella found her favorite toy. It is a red ball!' },
      { who: 'willow', img: bgU3L1CarOnly, text: 'Willow zoomed her toy car. It is a blue car!' },
      { who: 'mia', img: bgU3L1DollOnly, text: 'Mia hugged her soft doll. It is a green doll!' },
      { who: 'pip', img: bgU3L1ToyParade, text: 'Red ball, blue car, green doll — so many toys with friends!' },
    ],
    checkpoints: [
      { afterPage: 0, who: 'bella', question: 'What color is the ball?', options: ['Red', 'Blue', 'Green'], answer: 'Red' },
      { afterPage: 2, who: 'mia', question: 'What color is the doll?', options: ['Red', 'Blue', 'Green'], answer: 'Green' },
    ],
  },
  {
    id: 'u3l1-roleplay-ball', kind: 'roleplay', bg: bgU3L1BallOnly, teacher: 'Story time! Listen to Pip and Bella, then repeat.', cast: ['pip', 'bella'],
    script: [
      { who: 'bella', line: "It's a red ball!", repeat: true },
      { who: 'pip', line: 'I like red balls!', repeat: true },
    ],
  },
  {
    id: 'u3l1-roleplay-car', kind: 'roleplay', bg: bgU3L1CarOnly, teacher: 'Now listen to them talk about the car, then repeat.', cast: ['pip', 'willow'],
    script: [
      { who: 'willow', line: "It's a blue car!", repeat: true },
      { who: 'pip', line: "I don't like blue cars!", repeat: true },
    ],
  },
  {
    id: 'u3l1-roleplay-doll', kind: 'roleplay', bg: bgU3L1DollOnly, teacher: 'Now listen to them talk about the doll, then repeat.', cast: ['pip', 'mia'],
    script: [
      { who: 'mia', line: "It's a green doll!", repeat: true },
      { who: 'pip', line: 'I like green dolls!', repeat: true },
    ],
  },
  {
    id: 'u3l1-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to the playroom! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3580, 4020, 4980, 7482],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'pip', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'u3l1-finale', kind: 'finale', bg: bgU3L1ToyParade, who: 'pip', line: 'You did it! You can name a red ball, a blue car, and a green doll! \u{1F389}\u{1F9F8}' },
];

/* =============================================================================
 * Pre-A1 Unit 3, Lesson 2 — "Teddy Bear, Blocks, Train!"
 *
 * The curriculum blueprint's own pre-seeded stub for this slot (curriculum_
 * lessons row 51785a84-2d77-4a02-b2b0-7b50f349ac38) names the topic. No new
 * phonics letter this lesson — teddy(T)/blocks(B)/train(T) were all taught
 * in Unit 1, matching the DB stub's own "review" marking — freeing the
 * whole lesson to focus on new GRAMMAR instead: singular ("It's a teddy
 * bear") vs. plural ("They are blocks"), the natural next rung after L1's
 * color+toy combination, since "blocks" is a toy that's inherently plural
 * in real usage.
 *
 * DIRECT USER REQUEST for genuine uniqueness — this lesson should not feel
 * like a copycat of Lesson 1's own activity set, and should be backed by
 * real research into what actually helps kids retain vocabulary and enjoy
 * a grammar-focused lesson. Two brand-new Scene kinds were added rather
 * than reusing L1's exact mechanic set:
 * - 'plural-sort': a two-bin drag sort ("It is" vs "They are"), directly
 *   modeled on the "toss the card in the Singular or Plural basket" game
 *   found in live research (multiple ESL-kids sources). Mixes new toys
 *   with L1's own ball/doll for spiral review of both units at once.
 * - 'train-recall': a "missing car" visual-memory game, directly modeled
 *   on the "Phonics Train" mechanic found in the same research pass (show
 *   a train of cards, remove one, ask what's missing) — a natural fit
 *   given the lesson's own train toy, not used anywhere else in this app.
 * The 'memory' kind (matching pairs) is also new to Unit 3 — it exists
 * elsewhere in this codebase (Unit 1, and Unit 2's own capstone) but had
 * never been used in any Unit 3 lesson before this one.
 * - Cast: Leo=TEDDY BEAR (brown, singular), Bella=BLOCKS (blue, plural),
 *   Willow=TRAIN (red, singular) — deliberately rotates Leo in and Mia out
 *   relative to L1's own cast (Bella/Willow/Mia), so the same three
 *   characters aren't carrying every lesson.
 * - Art: same full-bleed lesson from L1 held up (all 7 new backgrounds
 *   passed full-bleed on the first attempt), but two of the four
 *   two-character "-only" shots needed a retry for a DIFFERENT bug this
 *   time: bg-u3l2-teddy-only drew Pip twice instead of Pip+Leo, and
 *   bg-u3l2-train-only omitted Willow entirely, leaving Pip alone — both
 *   fixed by explicitly describing each character's physical differences
 *   from Pip (species, colors, body shape) rather than just naming them.
 * ========================================================================= */

const bgU3L2ToyParade = `${A}/scenes/bg-u3l2-toy-parade.png`;
const bgU3L2TeddyOnly = `${A}/scenes/bg-u3l2-teddy-only.png`;
const bgU3L2BlocksOnly = `${A}/scenes/bg-u3l2-blocks-only.png`;
const bgU3L2TrainOnly = `${A}/scenes/bg-u3l2-train-only.png`;
const bgU3L2TeddySolo = `${A}/scenes/bg-u3l2-teddy-solo.png`;
const bgU3L2BlocksSolo = `${A}/scenes/bg-u3l2-blocks-solo.png`;
const bgU3L2TrainSolo = `${A}/scenes/bg-u3l2-train-solo.png`;
const itemTeddy = `${A}/items/item-teddy.png`;
const itemBlocks = `${A}/items/item-blocks.png`;
const itemTrain = `${A}/items/item-train.png`;

export const LESSON_U3L2_TITLE = 'Teddy Bear, Blocks, Train!';
export const LESSON_U3L2_OBJECTIVE = 'Identify and name teddy bear, blocks, and train, keep combining toys with colors ("It\'s a brown teddy bear"), and introduce singular vs. plural ("It\'s a train" / "They are blocks").';

export const LESSON_U3L2_SCENES: Scene[] = [
  { id: 'u3l2-title', kind: 'title-card', bg: bgU3L2ToyParade, level: 'Pre-A1', unit: 'Unit 3', lessonLabel: 'Lesson 2', title: 'Teddy Bear, Blocks, Train!', subtitle: 'More toys, and one is many!' },
  {
    id: 'u3l2-intro', kind: 'cinematic', bg: bgU3L2ToyParade, title: 'Teddy Bear, Blocks, Train!', subtitle: 'More toys join the playroom', narrator: 'pip', hidePipOverlay: true,
    script: [
      { who: 'pip', line: 'Look! More toys today — a teddy bear, blocks, and a train!' },
      { who: 'pip', line: 'Leo has ONE teddy bear. But Bella has MANY blocks — they are blocks!' },
    ],
    cta: "Let's play!",
  },
  {
    id: 'u3l2-vocab-toys', kind: 'toy-model', bg: bgMeadow,
    teacher: 'Look! Tap a toy to hear it, say it back, then say the sentence!',
    items: [
      { toyWord: 'TEDDY BEAR', colorWord: 'BROWN', colorHex: '#92400E', who: 'leo', img: itemTeddy },
      { toyWord: 'BLOCKS', colorWord: 'BLUE', colorHex: '#3B82F6', who: 'bella', img: itemBlocks, plural: true },
      { toyWord: 'TRAIN', colorWord: 'RED', colorHex: '#EF4444', who: 'willow', img: itemTrain },
    ],
  },
  {
    // New singular/plural sort — direct research match: "toss the card in
    // the Singular or Plural basket." Mixes today's new toys with L1's own
    // ball/doll for spiral review of both lessons at once.
    id: 'u3l2-plural-sort', kind: 'plural-sort', bg: bgMeadow, who: 'pip',
    teacher: 'Is it ONE, or is it MANY? Drag each picture to "It is" or "They are"!',
    items: [
      { word: 'teddy bear', img: itemTeddy, emoji: '\u{1F9F8}', plural: false },
      { word: 'teddy bears', img: itemTeddy, emoji: '\u{1F9F8}', plural: true },
      { word: 'train', img: itemTrain, emoji: '\u{1F682}', plural: false },
      { word: 'blocks', img: itemBlocks, emoji: '\u{1F9F1}', plural: true },
      { word: 'doll', img: itemDoll, emoji: '\u{1FA86}', plural: false },
      { word: 'balls', img: itemBall, emoji: '\u{26BD}', plural: true },
    ],
  },
  {
    // New "missing car" visual-memory game, directly modeled on the
    // "Phonics Train" mechanic found in live research — a natural fit
    // given this lesson's own train toy.
    id: 'u3l2-train-recall', kind: 'train-recall', bg: bgU3L2ToyParade, teacher: 'All aboard! Watch the toy train — remember what is in each car!',
    cars: [
      { word: 'TEDDY BEAR', img: itemTeddy, emoji: '\u{1F9F8}' },
      { word: 'BLOCKS', img: itemBlocks, emoji: '\u{1F9F1}' },
      { word: 'TRAIN', img: itemTrain, emoji: '\u{1F682}' },
      { word: 'BALL', img: itemBall, emoji: '\u{26BD}' },
      { word: 'DOLL', img: itemDoll, emoji: '\u{1FA86}' },
    ],
  },
  {
    // 'memory' kind already existed in this codebase but had never been
    // used in any Unit 3 lesson — genuinely fresh mechanic for this unit.
    id: 'u3l2-memory', kind: 'memory', bg: bgMeadow, teacher: 'Find the matching pairs!',
    pairs: [
      { id: 'teddy', label: 'Teddy Bear', emoji: '\u{1F9F8}', img: itemTeddy },
      { id: 'blocks', label: 'Blocks', emoji: '\u{1F9F1}', img: itemBlocks },
      { id: 'train', label: 'Train', emoji: '\u{1F682}', img: itemTrain },
      { id: 'ball', label: 'Ball', emoji: '\u{26BD}', img: itemBall },
      { id: 'doll', label: 'Doll', emoji: '\u{1FA86}', img: itemDoll },
      { id: 'car', label: 'Car', emoji: '\u{1F697}', img: itemCar },
    ],
  },
  {
    id: 'u3l2-who', kind: 'listen-repeat-cards', bg: bgU3L2ToyParade, teacher: 'Listen to each friend, then repeat!',
    cards: [
      { who: 'leo', sentence: 'Leo has a teddy bear!', img: itemTeddy, imgLabel: 'Teddy bear' },
      { who: 'bella', sentence: 'Bella has blocks!', img: itemBlocks, imgLabel: 'Blocks' },
      { who: 'willow', sentence: 'Willow has a train!', img: itemTrain, imgLabel: 'Train' },
    ],
  },
  {
    id: 'u3l2-sentence-practice', kind: 'listen-repeat-cards', bg: bgU3L2ToyParade, teacher: "Now let's say the full sentence — one, or many!",
    cards: [
      { who: 'leo', sentence: "It's a brown teddy bear!", img: itemTeddy, imgLabel: 'Brown teddy bear' },
      { who: 'bella', sentence: 'They are blue blocks!', img: itemBlocks, imgLabel: 'Blue blocks' },
      { who: 'willow', sentence: "It's a red train!", img: itemTrain, imgLabel: 'Red train' },
      { who: 'leo', sentence: 'I like brown teddy bears!', img: itemTeddy, imgLabel: 'Brown teddy bear' },
      { who: 'bella', sentence: "I don't like blue blocks!", img: itemBlocks, imgLabel: 'Blue blocks' },
      { who: 'willow', sentence: 'I like red trains!', img: itemTrain, imgLabel: 'Red train' },
    ],
  },
  {
    id: 'u3l2-dash-teddy', kind: 'dash', bg: bgU3L1DashArena, teacher: 'Leo Dash! Tap only the TEDDY BEAR things as they run by. Get 6 rings!', who: 'leo', targetLetter: 'TEDDY', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'teddy', letter: 'TEDDY', img: itemTeddy, emoji: '\u{1F9F8}' },
      { word: 'teddy', letter: 'TEDDY', img: itemTeddy, emoji: '\u{1F9F8}' },
      { word: 'blocks', letter: 'BLOCKS', img: itemBlocks, emoji: '\u{1F9F1}' },
      { word: 'blocks', letter: 'BLOCKS', img: itemBlocks, emoji: '\u{1F9F1}' },
      { word: 'train', letter: 'TRAIN', img: itemTrain, emoji: '\u{1F682}' },
      { word: 'train', letter: 'TRAIN', img: itemTrain, emoji: '\u{1F682}' },
    ],
  },
  {
    id: 'u3l2-dash-train', kind: 'dash', bg: bgU3L1DashArena, teacher: 'Willow Dash! Tap only the TRAIN things as they run by. Get 6 rings!', who: 'willow', targetLetter: 'TRAIN', targetPhoneme: '', goal: 6, seconds: 40,
    items: [
      { word: 'train', letter: 'TRAIN', img: itemTrain, emoji: '\u{1F682}' },
      { word: 'train', letter: 'TRAIN', img: itemTrain, emoji: '\u{1F682}' },
      { word: 'teddy', letter: 'TEDDY', img: itemTeddy, emoji: '\u{1F9F8}' },
      { word: 'teddy', letter: 'TEDDY', img: itemTeddy, emoji: '\u{1F9F8}' },
      { word: 'blocks', letter: 'BLOCKS', img: itemBlocks, emoji: '\u{1F9F1}' },
      { word: 'blocks', letter: 'BLOCKS', img: itemBlocks, emoji: '\u{1F9F1}' },
    ],
  },
  {
    id: 'u3l2-join-stage', kind: 'join-stage', bg: bgU3L2ToyParade, teacher: 'Your turn! Is it ONE, or is it MANY?', cast: ['pip', 'leo', 'bella', 'willow'],
    turns: [
      { who: 'pip', line: 'What color and toy is this?', bg: bgU3L2TeddySolo },
      { who: 'student', line: "It's a ______ ______. (brown teddy bear)", bg: bgU3L2TeddySolo },
      { who: 'bella', line: 'Is it one block, or many blocks?', bg: bgU3L2BlocksSolo },
      { who: 'student', line: 'They are ______ ______. (blue blocks)', bg: bgU3L2BlocksSolo },
      { who: 'willow', line: 'What color and toy is this?', bg: bgU3L2TrainSolo },
      { who: 'student', line: "It's a ______ ______. (red train)", bg: bgU3L2TrainSolo },
    ],
  },
  {
    id: 'u3l2-storybook', kind: 'flipbook', bg: bgU3L2ToyParade, title: 'One Toy, Many Toys',
    pages: [
      { who: 'leo', img: bgU3L2TeddyOnly, text: 'Leo has one toy. It is a brown teddy bear!' },
      { who: 'bella', img: bgU3L2BlocksOnly, text: 'Bella has many toys. They are blue blocks!' },
      { who: 'willow', img: bgU3L2TrainOnly, text: 'Willow has one toy. It is a red train!' },
      { who: 'pip', img: bgU3L2ToyParade, text: 'One teddy bear, one train, but many blocks — playtime is the best with friends!' },
    ],
    checkpoints: [
      { afterPage: 1, who: 'leo', question: 'Is the teddy bear one, or many?', options: ['One', 'Many'], answer: 'One' },
      { afterPage: 2, who: 'bella', question: 'Are the blocks one, or many?', options: ['One', 'Many'], answer: 'Many' },
    ],
  },
  {
    id: 'u3l2-roleplay-teddy', kind: 'roleplay', bg: bgU3L2TeddyOnly, teacher: 'Story time! Listen to Pip and Leo, then repeat.', cast: ['pip', 'leo'],
    script: [
      { who: 'leo', line: "It's a brown teddy bear!", repeat: true },
      { who: 'pip', line: 'I like brown teddy bears!', repeat: true },
    ],
  },
  {
    id: 'u3l2-roleplay-blocks', kind: 'roleplay', bg: bgU3L2BlocksOnly, teacher: 'Now listen to them talk about the blocks, then repeat.', cast: ['pip', 'bella'],
    script: [
      { who: 'bella', line: 'They are blue blocks!', repeat: true },
      { who: 'pip', line: "I don't like blue blocks!", repeat: true },
    ],
  },
  {
    id: 'u3l2-roleplay-train', kind: 'roleplay', bg: bgU3L2TrainOnly, teacher: 'Now listen to them talk about the train, then repeat.', cast: ['pip', 'willow'],
    script: [
      { who: 'willow', line: "It's a red train!", repeat: true },
      { who: 'pip', line: 'I like red trains!', repeat: true },
    ],
  },
  {
    id: 'u3l2-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to the playroom! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3580, 4020, 4980, 7482],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'willow', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'pip', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'u3l2-finale', kind: 'finale', bg: bgU3L2ToyParade, who: 'pip', line: "You did it! You know one teddy bear, one train, AND many blocks! \u{1F389}\u{1F682}" },
];

/* =============================================================================
 * Pre-A1 Unit 5, Lesson 1 — "Mom, Dad, Me!"
 *
 * First lesson built outside Units 1-3 — the curriculum blueprint's own
 * pre-seeded stub for this slot (curriculum_lessons row
 * 95185473-8ff3-49fe-8e68-84a1265cfb56) named the topic "Mommy, Daddy, Me!";
 * both that row's title/ai_metadata.lesson_role/ai_metadata.unit_theme and
 * this unit's whole Pre-A1 stub set were renamed to "Mom, Dad, Me!" / "Mom,
 * Dad, and me" per direct user request (informal register match with this
 * same unit's own "Grandma & Grandpa" stub, not the more formal "Mother and
 * Father").
 *
 * - Grammar target: "This is my ___" to introduce an immediate family
 *   member, extended to "I love my ___" for a warm affective close —
 *   matches the A1-tier sibling lesson's own grammar_focus ("This is my...")
 *   without needing new structures beyond what's already taught.
 * - Phonics: unit_letters lists M and D for this lesson, but BOTH are
 *   already-taught letters by this point (M in Unit 1 Lesson 1, D in Unit 3
 *   Lesson 1) — matching the established "already-taught letter gets
 *   lighter, retrieval-only treatment" pattern (U3L1's own B/C, U3L2's own
 *   T), so this lesson uses 'sound-sort' + word-build phonics hints only,
 *   no full sound-model+trace pair.
 * - Cast/characters: "Mom" and "Dad" are NOT added as new CharKey/CAST
 *   entries — they never speak a scripted line themselves anywhere in this
 *   lesson (avoiding the "silent trap" risk §3 of the skill doc flags for
 *   any new Record<CharKey,...> lookup table entry). Every spoken line
 *   stays with the established cast (pip narrates about his own mom/dad in
 *   third person, "This is my mom!"; bella/willow react to meeting them);
 *   Mom and Dad appear only as painted-into-the-background art, exactly
 *   the pattern already established for objects/vocab that don't need
 *   their own voice. The student's own turn (join-stage) is the actual
 *   "This is my mom/dad" practice — about THEIR real family, not a
 *   scripted character's.
 * - Art: three new full-bleed backgrounds — bg-u5l1-family-home (all three
 *   foxes together: Mom and Dad with Pip standing between them, drawn
 *   noticeably shorter than his parents, per direct user request so the
 *   "family" concept is concrete, not just implied), bg-u5l1-mom-solo and
 *   bg-u5l1-dad-solo (each parent alone, for the progressive vocabulary
 *   scenes and roleplay/join-stage framing, matching the established
 *   "-solo" per-subject convention). Fox parents rather than a new species
 *   — Pip is already an established fox, so his mom/dad reading as the
 *   same family fits without inventing an unrelated design. The first
 *   attempt at both solo shots came back as a vignette vector-sticker
 *   (mostly white background, no scenery) — the same failure mode §9
 *   describes for tight/cozy compositions — fixed by the same
 *   restructuring fix: describing a WIDE ROOM shot with named furniture
 *   explicitly anchored to the far-left/far-right edges (bookshelf/window
 *   one lesson, armchair/plant the next) instead of asking for a "close
 *   medium portrait." The family-home group shot's first attempt also
 *   baked "PiP" text onto his shirt, violating the art contract's own "no
 *   text baked into artwork" rule — fixed by explicitly requesting a plain
 *   solid-color shirt with no text/logo/writing of any kind.
 * - Structure: per direct user request, restructured to teach vocabulary
 *   progressively — Mom, then Dad, then Me, then Family, each its OWN
 *   full-bleed scene showing only that one concept (not the combined
 *   family shot) — BEFORE any word is combined into a sentence. Only once
 *   all four words have been individually introduced do the "This is my
 *   ___" / "I love my ___" sentence scenes begin, each still scoped to one
 *   person's own solo background. This matches the lesson's own title
 *   "Mom, Dad, Me!", which names three vocabulary items, not two — the
 *   original draft only taught mom/dad and jumped straight to sentences.
 * ========================================================================= */

const bgU5L1FamilyHome = `${A}/scenes/bg-u5l1-family-home.png`;
const bgU5L1MomSolo = `${A}/scenes/bg-u5l1-mom-solo.png`;
const bgU5L1DadSolo = `${A}/scenes/bg-u5l1-dad-solo.png`;

export const LESSON_U5L1_TITLE = 'Mom, Dad, Me!';
export const LESSON_U5L1_OBJECTIVE = 'Identify and name mom and dad, use "This is my ___" to introduce a family member, and review the M and D letter sounds.';

export const LESSON_U5L1_SCENES: Scene[] = [
  { id: 'u5l1-title', kind: 'title-card', bg: bgU5L1FamilyHome, level: 'Pre-A1', unit: 'Unit 5', lessonLabel: 'Lesson 1', title: 'Mom, Dad, Me!', subtitle: "Meet Pip's family!" },
  {
    id: 'u5l1-hello', kind: 'roleplay', bg: bgU5L1FamilyHome, teacher: "Good morning! Let's say hello and warm up together.", cast: ['pip', 'bella', 'willow', 'mia'],
    script: [
      { who: 'pip', line: 'Hello, hello, hello my friend!', repeat: true },
      { who: 'bella', line: 'Hello! Remember our toys — ball, car, doll?' },
      { who: 'willow', line: "Today it's something new — Pip's family!", repeat: true },
      { who: 'mia', line: "Let's go and meet them!" },
    ],
  },
  {
    id: 'u5l1-intro', kind: 'cinematic', bg: bgU5L1FamilyHome, title: 'Mom, Dad, Me!', subtitle: "Pip's cozy home", narrator: 'pip', hidePipOverlay: true,
    script: [
      { who: 'pip', line: "Welcome to my home! Today you meet MY family!" },
      { who: 'pip', line: "Let's meet them one at a time!" },
    ],
    cta: "Let's meet them!",
  },
  {
    // Progressive vocabulary, per direct user request: one new word at a
    // time, each in its own full-bleed scene showing only that one person
    // (not the combined family shot), BEFORE any word is combined into a
    // full sentence. Mom, then Dad, then Me, then Family — matching this
    // lesson's own title "Mom, Dad, Me!" (which promises three vocabulary
    // items, not just two) plus a culminating "family" concept word.
    id: 'u5l1-vocab-mom', kind: 'listen-repeat-cards', bg: bgU5L1MomSolo, teacher: 'Listen, then repeat!', bare: true, textSide: 'right',
    cards: [{ who: 'pip', sentence: 'Mom!', img: bgU5L1MomSolo, imgLabel: 'Mom' }],
  },
  {
    id: 'u5l1-vocab-dad', kind: 'listen-repeat-cards', bg: bgU5L1DadSolo, teacher: 'Listen, then repeat!', bare: true, textSide: 'left',
    cards: [{ who: 'pip', sentence: 'Dad!', img: bgU5L1DadSolo, imgLabel: 'Dad' }],
  },
  {
    id: 'u5l1-vocab-me', kind: 'listen-repeat-cards', bg: bgU5L1FamilyHome, teacher: 'Listen, then repeat!', bare: true, textSide: 'top',
    cards: [{ who: 'pip', sentence: 'Me! I am Pip!', img: bgU5L1FamilyHome, imgLabel: 'Me' }],
  },
  {
    id: 'u5l1-vocab-family', kind: 'listen-repeat-cards', bg: bgU5L1FamilyHome, teacher: 'Listen, then repeat!', bare: true, textSide: 'top',
    cards: [{ who: 'pip', sentence: 'Family! This is my family!', img: bgU5L1FamilyHome, imgLabel: 'Family' }],
  },
  {
    // Per direct user request: removed this lesson's standalone M/D
    // sound-review page entirely (previously a drag-sort, briefly a
    // Balloon-Pop arcade round) — M and D were already taught and
    // reviewed in Unit 1 Lesson 1 and Unit 3 Lesson 1 respectively, and
    // still get real retrieval practice right here in this lesson via
    // word-build (spelling MOM/DAD letter by letter) immediately below,
    // so a dedicated isolated-letter round added nothing further.
    // The student should spell the WHOLE word,
    // not just its first letter — three rounds per word, one per letter
    // position, so by the end of the activity every letter of "mom" and
    // "dad" has been tapped in order (this system's tap-based spelling
    // mechanic, the appropriate "writing" equivalent for pre-writers who
    // can't yet free-type).
    // Split into two person-scoped scenes (bg = that person's own solo
    // portrait, matching the vocabulary scenes) rather than one scene over
    // the busy 3-person family-home shot — per direct user request, that
    // background felt crowded/distracting behind the puzzle, and the small
    // picture-in-picture thumbnail already gives all the visual context
    // this activity needs.
    id: 'u5l1-word-build-mom', kind: 'word-build', bg: bgU5L1MomSolo, teacher: "Listen! Tap each letter to spell the whole word.", side: 'right',
    rounds: [
      { word: 'mom', blankIndex: 0, answer: 'M', choices: ['M', 'D', 'B'], emoji: '\u{1F469}' },
      { word: 'mom', blankIndex: 1, answer: 'O', choices: ['O', 'A', 'E'], emoji: '\u{1F469}' },
      { word: 'mom', blankIndex: 2, answer: 'M', choices: ['M', 'D', 'N'], emoji: '\u{1F469}' },
    ],
  },
  {
    id: 'u5l1-word-build-dad', kind: 'word-build', bg: bgU5L1DadSolo, teacher: 'Now spell Dad!', side: 'left',
    rounds: [
      { word: 'dad', blankIndex: 0, answer: 'D', choices: ['D', 'M', 'B'], emoji: '\u{1F468}' },
      { word: 'dad', blankIndex: 1, answer: 'A', choices: ['A', 'O', 'E'], emoji: '\u{1F468}' },
      { word: 'dad', blankIndex: 2, answer: 'D', choices: ['D', 'M', 'N'], emoji: '\u{1F468}' },
    ],
  },
  {
    id: 'u5l1-memory', kind: 'memory', bg: bgMeadow, teacher: 'Memory game! Find the matching family pairs!',
    pairs: [
      { id: 'mom', label: 'Mom', img: bgU5L1MomSolo, emoji: '\u{1F469}' },
      { id: 'dad', label: 'Dad', img: bgU5L1DadSolo, emoji: '\u{1F468}' },
      { id: 'baby', label: 'Baby', emoji: '\u{1F476}' },
      { id: 'family', label: 'Family', img: bgU5L1FamilyHome, emoji: '\u{1F46A}' },
    ],
  },
  {
    // Now combine the vocabulary just taught into full sentences — still
    // one person per scene, matching the same "only one" rule as the
    // vocabulary scenes above, just with a fuller sentence this time.
    // Per direct user request: color-code the grammar chunks so the
    // student learns to recognize each part by color, not just position —
    // "This is"/"I love" always red, "my" always green, the family word
    // itself stays the default white (it's the one new piece each time).
    // MODEL first (listen, then repeat) — the shuffled build-it-yourself
    // exercise right after (u5l1-sentence-mom-build) is the practice step,
    // not a replacement for modeling it. Per direct user request: don't
    // drop the modeling pages when adding the shuffle exercise.
    id: 'u5l1-sentence-mom', kind: 'listen-repeat-cards', bg: bgU5L1MomSolo, teacher: "Now let's say a bigger sentence! Listen, then repeat.", bare: true, textSide: 'right',
    cards: [
      { who: 'pip', sentence: 'This is my mom!', img: bgU5L1MomSolo, imgLabel: 'Mom', wordColors: ['#EF4444', '#EF4444', '#4ADE80', null] },
      { who: 'pip', sentence: 'I love my mom!', img: bgU5L1MomSolo, imgLabel: 'Mom', wordColors: ['#EF4444', '#EF4444', '#4ADE80', null] },
    ],
  },
  {
    // Per direct user request: this is a real "making exercise" right
    // after the model above — the words are shuffled and the student
    // must tap them in order to build the sentence themselves.
    id: 'u5l1-sentence-mom-build', kind: 'sentence-build', bg: bgU5L1MomSolo, teacher: 'The words are mixed up! Tap them in order to make the sentence.', side: 'right',
    rounds: [
      { words: ['This', 'is', 'my', 'mom.'], colors: ['#EF4444', '#EF4444', '#4ADE80', null] },
    ],
  },
  {
    id: 'u5l1-sentence-dad', kind: 'listen-repeat-cards', bg: bgU5L1DadSolo, teacher: 'Now the same for Dad! Listen, then repeat.', bare: true, textSide: 'left',
    cards: [
      { who: 'pip', sentence: 'This is my dad!', img: bgU5L1DadSolo, imgLabel: 'Dad', wordColors: ['#EF4444', '#EF4444', '#4ADE80', null] },
      { who: 'pip', sentence: 'I love my dad!', img: bgU5L1DadSolo, imgLabel: 'Dad', wordColors: ['#EF4444', '#EF4444', '#4ADE80', null] },
    ],
  },
  {
    id: 'u5l1-sentence-dad-build', kind: 'sentence-build', bg: bgU5L1DadSolo, teacher: 'Now the same for Dad! Tap the words in order.', side: 'left',
    rounds: [
      { words: ['This', 'is', 'my', 'dad.'], colors: ['#EF4444', '#EF4444', '#4ADE80', null] },
    ],
  },
  {
    // Per direct user request: complete the "This is my ___" sentence set
    // with Family too, not just Mom and Dad — the student should end up
    // able to make all three sentences. No single clean empty side on the
    // 3-person family-home shot, so the sentence floats top-anchored
    // (same choice already made for the Me/Family vocabulary scenes).
    id: 'u5l1-sentence-family', kind: 'listen-repeat-cards', bg: bgU5L1FamilyHome, teacher: "Now let's say it about the whole family! Listen, then repeat.", bare: true, textSide: 'top',
    cards: [
      { who: 'pip', sentence: 'This is my family!', img: bgU5L1FamilyHome, imgLabel: 'Family', wordColors: ['#EF4444', '#EF4444', '#4ADE80', null] },
      { who: 'pip', sentence: 'I love my family!', img: bgU5L1FamilyHome, imgLabel: 'Family', wordColors: ['#EF4444', '#EF4444', '#4ADE80', null] },
    ],
  },
  {
    // Per direct user request: complete the sentence set with Family too
    // -- both "This is my family" AND "I love my family", the four
    // target sentences named directly (dad / mom / family / I love my
    // family). No single clean empty side on the 3-person family-home
    // shot, so the puzzle floats top-anchored (same choice already made
    // for the Me/Family vocabulary scenes).
    id: 'u5l1-sentence-family-build', kind: 'sentence-build', bg: bgU5L1FamilyHome, teacher: "Now let's build it about the whole family! Tap the words in order.", side: 'top',
    rounds: [
      { words: ['This', 'is', 'my', 'family.'], colors: ['#EF4444', '#EF4444', '#4ADE80', null] },
      { words: ['I', 'love', 'my', 'family.'], colors: ['#EF4444', '#EF4444', '#4ADE80', null] },
    ],
  },
  {
    // Per direct user request: replace the two near-identical single-
    // target Dash rounds (tap only MOM things, then a second nearly
    // identical round for DAD) with one livelier combined game — a fresh
    // "catch it in the right basket" mechanic (researched for inspiration:
    // https://www.splashlearn.com/blog/best-vocabulary-games-for-kids/,
    // https://www.teachstarter.com/us/teaching-resource/sorting-by-category-vocabulary-activity/)
    // where every item (mom or dad) falls one at a time and the student
    // makes a real MOM-or-DAD decision on each catch, instead of two
    // separate rounds that were each just "tap the one thing that keeps
    // showing up."
    id: 'u5l1-catch-sort', kind: 'catch-sort', bg: bgU5L1FamilyHome, teacher: 'Catch it! Which basket — Mom or Dad?', goal: 8, seconds: 45,
    left: { label: 'Mom', img: bgU5L1MomSolo, emoji: '\u{1F469}' },
    right: { label: 'Dad', img: bgU5L1DadSolo, emoji: '\u{1F468}' },
    items: [
      { word: 'mom', emoji: '\u{1F469}', target: 'left' },
      { word: 'mom', emoji: '\u{1F469}\u{200D}\u{1F467}', target: 'left' },
      { word: 'dad', emoji: '\u{1F468}', target: 'right' },
      { word: 'dad', emoji: '\u{1F468}\u{200D}\u{1F466}', target: 'right' },
    ],
  },
  {
    id: 'u5l1-storybook', kind: 'flipbook', bg: bgU5L1FamilyHome, title: "A Day With Pip's Family",
    pages: [
      { who: 'pip', img: bgU5L1FamilyHome, text: 'Pip woke up at home. Mom and Dad were making breakfast!' },
      { who: 'pip', img: bgU5L1MomSolo, text: 'This is my mom. She makes yummy pancakes!' },
      { who: 'pip', img: bgU5L1DadSolo, text: 'This is my dad. He reads me a story every night!' },
      { who: 'pip', img: bgU5L1FamilyHome, text: 'I love my mom and my dad. We are a happy family!' },
    ],
    checkpoints: [
      { afterPage: 1, who: 'pip', question: 'Who makes pancakes?', options: ['Mom', 'Dad'], answer: 'Mom' },
      { afterPage: 2, who: 'pip', question: 'Who reads a story?', options: ['Mom', 'Dad'], answer: 'Dad' },
    ],
  },
  {
    id: 'u5l1-roleplay-mom', kind: 'roleplay', bg: bgU5L1MomSolo, teacher: 'Story time! Listen to Pip and Bella, then repeat.', cast: ['pip', 'bella'],
    script: [
      { who: 'pip', line: 'This is my mom!', repeat: true },
      { who: 'bella', line: "Hi, Pip's mom! Nice to meet you!" },
    ],
  },
  {
    id: 'u5l1-roleplay-dad', kind: 'roleplay', bg: bgU5L1DadSolo, teacher: 'Now listen to Pip and Willow, then repeat.', cast: ['pip', 'willow'],
    script: [
      { who: 'pip', line: 'This is my dad!', repeat: true },
      { who: 'willow', line: "Hi, Pip's dad! Nice to meet you!" },
    ],
  },
  {
    // Per direct user request: the student should talk about THEIR OWN
    // family at the very END of the lesson, as the closing capstone --
    // moved here (was previously mid-lesson, before the storybook) so
    // this is the LAST thing the student does before the goodbye song,
    // right after meeting Mom and Dad through the storybook + roleplays.
    // Each question shows the actual parent being asked about, matching
    // the established U2/U3 "-solo" per-subject framing (open space
    // preserved for the student's draggable video circle). The student's
    // own answer here is the real "This is my ___" practice — about their
    // own family, not a scripted character's.
    id: 'u5l1-join-stage', kind: 'join-stage', bg: bgU5L1FamilyHome, teacher: 'Your turn! Who is this? Say it about YOUR family.', cast: ['pip', 'bella', 'willow'],
    turns: [
      { who: 'pip', line: 'Who is this?', bg: bgU5L1MomSolo },
      { who: 'student', line: 'This is my ______. (mom)', bg: bgU5L1MomSolo },
      { who: 'bella', line: 'And who is this?', bg: bgU5L1DadSolo },
      { who: 'student', line: 'This is my ______. (dad)', bg: bgU5L1DadSolo },
      { who: 'willow', line: 'Do you love your family?', bg: bgU5L1FamilyHome },
      { who: 'student', line: 'I love my ______! (mom / dad)', bg: bgU5L1FamilyHome },
    ],
  },
  {
    id: 'u5l1-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3580, 4020, 4980, 7482],
    songPrompt: 'Cheerful upbeat kids goodbye song, sweet real singing with a teacher voice and small kids choir, ukulele + light claps, ending with a happy Byeeee!',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'mia', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'pip', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'u5l1-finale', kind: 'finale', bg: bgU5L1FamilyHome, who: 'pip', line: 'You did it! You can say "This is my mom!" and "This is my dad!" \u{1F389}\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F466}' },
];
