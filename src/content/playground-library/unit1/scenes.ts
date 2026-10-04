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
      id: string; kind: 'basket'; bg: string; bgVideo?: string; letter: string; phoneme: string; who: CharKey; teacher: string; items: BasketItem[]; goal: number;
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
      id: string; kind: 'jigsaw-puzzle'; bg: string; bgVideo?: string; teacher: string; image: string; rows?: number; cols?: number;
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
      items: { word: string; img?: string; emoji: string; plural: boolean; group?: boolean }[];
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
    }
  | {
      /** Cambridge Starters "Listen and colour": "Color the big circle red!" —
       *  pick the paint, tap the shape. Items live in a 100×62 board. */
      id: string; kind: 'listen-colour'; bg: string; teacher: string; who: CharKey;
      items: { id: string; shape: 'circle' | 'square' | 'triangle'; size: 'big' | 'small'; x: number; y: number; w: number; h: number; flip?: boolean }[];
      rounds: { item: string; colorWord: string }[];
      /** 'fish' draws Shelly's body behind the shapes (her scales). */
      backdrop?: 'fish';
    }
  | {
      /** "Shape Fishing": "Catch a blue triangle!" — tap the fish carrying it.
       *  `targets` index `fish`, one catch per round. */
      id: string; kind: 'shape-fishing'; bg: string; teacher: string; who: CharKey;
      fish: { colorWord: string; colorHex: string; shape: 'circle' | 'square' | 'triangle' }[];
      targets: number[];
    }
  | {
      /** "What comes next?" — finish a colour/shape pattern train. */
      id: string; kind: 'pattern-train'; bg: string; bgVideo?: string; teacher: string; who: CharKey;
      /** A wagon carries a coloured shape, or a picture (`img` + `word`, e.g. a toy: "A kite!"). */
      rounds: {
        pattern: PatternCar[];
        answer: PatternCar;
        options: PatternCar[];
      }[];
    }
  | {
      /** Cambridge Starters "Look and read — tick or cross": picture + sentence, ✓ / ✗. */
      id: string; kind: 'tick-cross'; bg: string; teacher: string; who: CharKey;
      rounds: { img: string; sentence: string; isTrue: boolean }[];
    }
  | {
      /** Jumbled story pictures → put them in order → the story is told back. */
      id: string; kind: 'story-order'; bg: string; teacher: string; who: CharKey;
      frames: { img: string; caption: string; who?: CharKey }[];
    }
  | {
      /** The story as an animated, narrated cartoon (no reading needed): each
       *  page moves (Ken Burns + effects) while the character tells it, then
       *  auto-advances; picture-answer questions pause it. */
      id: string; kind: 'story-video'; bg: string; teacher: string; title: string;
      /** A real MP4 of the story (rendered from the pages). When set, it plays
       *  instead of the animated pictures; `atSec` marks where each page starts. */
      videoUrl?: string;
      pages: { img: string; line: string; who: CharKey; motion?: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right'; fx?: 'bubbles' | 'sparkles' | 'tear' | 'hearts'; holdMs?: number; atSec?: number }[];
      checkpoints: { afterPage: number; who: CharKey; question: string; answer: string; options: { label: string; img?: string; colorHex?: string; shape?: 'circle' | 'square' | 'triangle' }[] }[];
      /** Small caption for the adult (default on). */
      captions?: boolean;
    }
  | {
      /** "Which one is different?" — four pictures, three share a colour or a
       *  shape; tap the odd one and hear why (Unit 2 Lesson 6). `odd` indexes
       *  `items`; an item is a coloured shape or a picture. */
      id: string; kind: 'odd-one-out'; bg: string; teacher: string; who: CharKey;
      rounds: { items: { label: string; shape?: 'circle' | 'square' | 'triangle'; colorHex?: string; img?: string }[]; odd: number; line: string }[];
    }
  | {
      /** Torch hunt in the dark cave: "Find a green triangle!" — shine the
       *  torch, tap the gem (Unit 2 Lesson 6). Gems are % of a 16:9 stage
       *  (x/y = centre, size = width); `targets` index `gems`. */
      id: string; kind: 'shape-torch'; bg: string; teacher: string; who: CharKey;
      gems: { colorWord: string; colorHex: string; shape: 'circle' | 'square' | 'triangle'; x: number; y: number; size: number }[];
      targets: number[];
    }
  | {
      /** "The Mystery Bag" — a toy's silhouette peeks out of a bag; tap which
       *  toy it is, then it jumps out in colour ("It's a red ball!") and the
       *  child says it (Unit 3 Lesson 1). */
      id: string; kind: 'mystery-bag'; bg: string; teacher: string; who: CharKey;
      rounds: { img: string; toyWord: string; colorWord: string; colorHex: string; options: { toyWord: string; img: string }[] }[];
    }
  | {
      /** "Move & Say" (TPR) — say an action with the new word, the child does
       *  it while a ring counts down, then a star. `mode: 'break'` = extra-time
       *  brain break (stretch, dance, freeze). Blueprint slides 1/5 + extra time. */
      id: string; kind: 'tpr-actions'; bg: string; teacher: string; who: CharKey; mode?: 'learn' | 'break';
      rounds: { line: string; emoji: string; img?: string; seconds?: number }[];
    }
  | {
      /** Quick-fire flashcards (blueprint slide 15): a picture, a 3-second
       *  ring to say it, then the word is shown and spoken. */
      id: string; kind: 'rapid-recall'; bg: string; teacher: string; who: CharKey; seconds?: number;
      cards: { img: string; word: string; say?: string }[];
    }
  | {
      /** Sticker Book reward (blueprint slide 19): open a pack, keep the
       *  lesson's sticker in a book that remembers earlier lessons' stickers. */
      id: string; kind: 'sticker-reward'; bg: string; teacher: string; who: CharKey; line: string;
      sticker: { img: string; label: string };
    }
  | {
      /** Home Mission (blueprint slide 20): 2-3 picture steps to do with the
       *  family, read aloud, plus a short note for the parent. */
      id: string; kind: 'home-mission'; bg: string; teacher: string; who: CharKey; line: string; parentNote: string;
      steps: { emoji: string; img?: string; say?: string }[];
    }
  | {
      /** "Where's the star?" — lift-the-flap search (Where's Spot? pattern):
       *  tap a hiding place, hear "Is it under the hat?", the cover flips up:
       *  "No! It's a bat!". The `target` spot opens only after all the others.
       *  x/y = centre in % of the scene, size = width %. A spot without a
       *  `cover` is a place painted in the picture (e.g. the tree). */
      id: string; kind: 'lift-flap'; bg: string; teacher: string; who: CharKey; question: string; notYet: string;
      spots: { x: number; y: number; size: number; ask: string; reveal: string; target?: boolean; cover?: { img: string; label: string }; under: { img: string; label: string } }[];
    }
  | {
      /** Draw Path (Lingokids "Draw Path", 2026): the voice names a thing
       *  ("Take Pip to the purple circle!"); the child draws a line with a
       *  finger from the character to it, and the character walks the line.
       *  `spots` are things placed on the picture (x/y = centre %, size = width %). */
      id: string; kind: 'draw-path'; bg: string; bgVideo?: string; teacher: string; who: CharKey; walker: CharKey;
      start: { x: number; y: number };
      spots: (Thing & { x: number; y: number; size: number })[];
      rounds: { line: string; target: number; reply: string }[];
    }
  | {
      /** Image Reveal (Wordwall "Image quiz"): a hidden picture uncovers tile
       *  by tile; the child guesses early by tapping one of the answer
       *  pictures and says it. Fewer tiles gone = more stars. */
      id: string; kind: 'tile-reveal'; bg: string; bgVideo?: string; teacher: string; who: CharKey;
      rounds: { img: string; word: string; line: string; options: Thing[] }[];
    }
  | {
      /** Shadow Match (Khan Academy Kids-style shadow puzzles): drag each
       *  coloured picture onto its dark shadow (or tap it, then the shadow);
       *  it snaps in and is named ("It's a clock. It's a circle!"). */
      id: string; kind: 'shadow-match'; bg: string; bgVideo?: string; teacher: string; who: CharKey;
      items: (Thing & { line: string })[];
    }
  | {
      /** Stepping Stones (the classic floor game "jump on the red circle!"):
       *  the character crosses a river; each round three stones float ahead
       *  and the voice names one. Tap it and the character hops on; the
       *  wrong one wobbles and sinks back. `bgVideo` (all four newer games) =
       *  a seamless looping clip of `bg` — the living game world. */
      id: string; kind: 'stepping-stones'; bg: string; bgVideo?: string;
      /** true when `bg` already paints the river (no drawn river); `stoneImg` = stone sticker. */
      riverPainted?: boolean; stoneImg?: string; teacher: string; who: CharKey; walker: CharKey;
      rounds: { line: string; options: Thing[]; answer: number; reply: string }[];
      goal: { img: string; label: string; line: string };
    };

/** One pattern-train wagon: a coloured shape, or a picture with its word. */
export type PatternCar = { colorWord: string; colorHex: string; shape: 'circle' | 'square' | 'triangle'; img?: string; word?: string };

/** A picture or a coloured shape — what the newer games show. */
export type Thing = { label: string; img?: string; shape?: 'circle' | 'square' | 'triangle'; colorHex?: string };

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
 * Lesson 5 — "Leo's Lost Star" (the unit's story lesson)
 *
 * RECREATED (2026-10-03) on the Universal Playground Lesson Blueprint
 * (docs/playground-lesson-blueprint.md): 22-slide arc + Extra time, story as
 * a REAL animated film (§3a, Higgsfield image-to-video, 8 beats in two parts),
 * no reading (the old version had word-order reading tasks), new consistent
 * wide art (the old art drew Bella pink and extra characters).
 *
 * Unit 1 language, all recycled through the story: "Hello! My name is …",
 * "What is your name?", "How are you? — I am sad/happy/angry", "He is sad",
 * "How old are you?", and the unit's sounds H M N W A S B T (hat, mat, bag,
 * bat, ant, nut, star, tree).
 *
 * Research behind the design (mechanics only, no copied content):
 * - Pre / while / post story stages, prediction from the cover, pauses for a
 *   repeated phrase and gestures, then sequencing, retelling and drama
 *   (Cambridge "Storytelling online with young learners", Cambridge Storyfun /
 *   World of Fun, British Council "Storytelling in young learner classes").
 * - Lift-the-flap picture books (Eric Hill's "Where's Spot?"): a predictable
 *   refrain — "Is it under the hat? No! It's a bat!" — becomes the signature
 *   game `lift-flap`.
 * - Lost-toy picture books (Knuffle Bunny) for the emotional arc: sad → help
 *   from friends → happy.
 * Film: public/lep1/video/leo-story-u1l5-a/-b (scripts/story-videos.json
 * "u1l5-leo"; clips via the higgsfield-video edge function).
 * ========================================================================= */

const bgL5Play = `${A}/scenes/bg-l5-play-wide.png`;
const bgL5Wind = `${A}/scenes/bg-l5-wind-wide.png`;
const bgL5SadW = `${A}/scenes/bg-l5-sad-wide.png`;
const bgL5Friends = `${A}/scenes/bg-l5-friends-wide.png`;
const bgL5HatW = `${A}/scenes/bg-l5-hat-wide.png`;
const bgL5MatW = `${A}/scenes/bg-l5-mat-wide.png`;
const bgL5Glow = `${A}/scenes/bg-l5-glow-wide.png`;
const bgL5FoundW = `${A}/scenes/bg-l5-found-wide.png`;
const bgL5Empty = `${A}/scenes/bg-l5-empty-wide.png`;
const itemStarGold = `${A}/items/item-star-gold.png`;
const itemTree = `${A}/items/item-tree.png`;

export const LESSON_5_TITLE = "Leo's Lost Star";
export const LESSON_5_OBJECTIVE = 'Follow and retell an animated story (Leo loses his star; his friends say hello and help him look; "Is it under the hat? No! It\'s a bat!"; he is sad, then happy), using all of Unit 1 — hello and names, "How are you? — I am sad/happy", "He is happy", "How old are you?" — and the sounds H M N W A S B T. No reading: listen, move, tap and speak.';

export const LESSON_5_SCENES: Scene[] = [
  { id: 'l5-title', kind: 'title-card', bg: bgL5Play, level: 'Pre-A1', unit: 'Unit 1', lessonLabel: 'Lesson 5 · Story', title: "Leo's Lost Star", subtitle: 'A story with all our friends' },

  /* 1-3 Hook, greeting, story part 1 (pre-story prediction → film) */
  {
    id: 'l5-hello-song', kind: 'song', bg: bgHelloCast, title: '\u{1F44B} Hello Song \u{1F44B}', teacher: 'Stand up! Sing, clap and wave on every "hello".',
    durationSeconds: 20, bigWord: 'Hello', songUrl: `${A}/audio/hello-song.mp3?v=2`,
    lineDurationsMs: [5200, 4300, 4500, 6100],
    songPrompt: 'Cheerful upbeat kids hello song',
    lyrics: [
      { who: 'pip', text: '\u{1F44B} Hello, hello, hello my friend!', emotion: 'happy' },
      { who: 'pip', text: '\u{1F333} Come with me, the fun begins!', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44F} Clap your hands and wave up high', emotion: 'happy' },
      { who: 'pip', text: '\u{1F495} Hello, hello, hi hi hi!', emotion: 'happy' },
    ],
  },
  {
    // Pre-story: look at the "cover" and guess (prediction).
    id: 'l5-intro', kind: 'cinematic', bg: bgL5Play, hidePipOverlay: true, title: "Leo's Lost Star", subtitle: 'Look! What does Leo have?', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hello! How are you today?' },
      { who: 'pip', line: 'Look! This is Leo. What does he have? A star! Let\'s watch.' },
    ],
    cta: 'Watch the story',
  },
  {
    id: 'l5-story-a', kind: 'story-video', bg: bgL5Play, videoUrl: `${A}/video/leo-story-u1l5-a.mp4?v=1`, title: "Leo's Lost Star — part 1",
    teacher: 'Watch together. Make a sad face and a wave with the characters; answer the picture questions.',
    pages: [
      { img: bgL5Play, who: 'pip', line: 'This is Leo. He has a shiny star. He is happy!', motion: 'zoom-in', fx: 'sparkles', atSec: 0 },
      { img: bgL5Wind, who: 'pip', line: 'Whoosh! The wind blows. Oh no! Where is the star?', motion: 'pan-right', atSec: 8 },
      { img: bgL5SadW, who: 'leo', line: 'I am sad. I lost my star.', motion: 'zoom-in', fx: 'tear', atSec: 16 },
      { img: bgL5Friends, who: 'mia', line: 'Hello, Leo! My name is Mia. We can help you!', motion: 'zoom-out', fx: 'hearts', atSec: 24 },
    ],
    checkpoints: [
      { afterPage: 2, who: 'pip', question: 'How is Leo?', answer: 'Sad', options: [{ label: 'Happy', img: getEmotionSprite('leo', 'happy') }, { label: 'Sad', img: getEmotionSprite('leo', 'sad') }, { label: 'Angry', img: getEmotionSprite('leo', 'angry') }] },
    ],
  },

  /* 4-6 Story language, move, signature game */
  {
    id: 'l5-story-words', kind: 'listen-repeat-cards', bg: bgL5Empty, teacher: 'The words of the story. Listen, then say them with the face and the action!',
    cards: [
      { who: 'leo', sentence: 'I am sad.', img: getEmotionSprite('leo', 'sad'), imgLabel: '😢' },
      { who: 'leo', sentence: 'Where is my star?', img: itemStarGold, imgLabel: '⭐❓' },
      { who: 'bella', sentence: 'Is it under the hat?', img: itemHat, imgLabel: '🎩' },
      { who: 'bella', sentence: "No! It's a bat!", img: itemBat, imgLabel: '🦇' },
      { who: 'leo', sentence: 'I am happy! Thank you!', img: getEmotionSprite('leo', 'happy'), imgLabel: '😀' },
    ],
  },
  {
    id: 'l5-move-say', kind: 'tpr-actions', bg: bgL5Empty, who: 'pip',
    teacher: 'Act the story! Do each action and say it.',
    rounds: [
      { line: 'Wave hello to Leo!', emoji: '\u{1F44B}' },
      { line: 'Blow like the wind! Whoosh!', emoji: '\u{1F32C}️' },
      { line: 'Make a sad face!', emoji: '\u{1F622}' },
      { line: 'Look under the hat!', emoji: '\u{1F440}', img: itemHat },
      { line: 'Jump! You are happy!', emoji: '\u{1F929}' },
    ],
  },
  {
    // Signature game: the story's search as a lift-the-flap book.
    id: 'l5-where-star', kind: 'lift-flap', bg: bgL5Empty, who: 'leo',
    teacher: "Where's the star? The child asks each question (\"Is it under the hat?\") and taps to look.",
    question: 'Where is my star?',
    notYet: 'Not yet! Look under the other things first!',
    spots: [
      { x: 14, y: 70, size: 15, ask: 'Is it under the hat?', reveal: "No! It's a bat!", cover: { img: itemHat, label: 'hat' }, under: { img: itemBat, label: 'bat' } },
      { x: 36, y: 78, size: 17, ask: 'Is it under the mat?', reveal: "No! It's an ant!", cover: { img: itemMat, label: 'mat' }, under: { img: itemAnt, label: 'ant' } },
      { x: 57, y: 70, size: 14, ask: 'Is it in the bag?', reveal: "No! It's a nut!", cover: { img: itemBag, label: 'bag' }, under: { img: itemNut, label: 'nut' } },
      { x: 84, y: 66, size: 16, ask: 'Is it under the tree?', reveal: 'Yes! Here it is! My star!', target: true, under: { img: itemStarGold, label: 'star' } },
    ],
  },

  /* 7-9 Controlled practice */
  {
    id: 'l5-sort-sounds', kind: 'sound-sort', bg: bgL5Empty, teacher: 'The things from the search! Drag each picture to its sound.',
    targets: [
      { letter: 'H', phoneme: '/h/', who: 'pip' },
      { letter: 'M', phoneme: '/m/', who: 'mia' },
      { letter: 'B', phoneme: '/b/', who: 'bella' },
      { letter: 'S', phoneme: '/s/', who: 'leo' },
    ],
    items: [
      { word: 'hat', emoji: '\u{1F3A9}', img: itemHat, letter: 'H' },
      { word: 'house', emoji: '\u{1F3E0}', img: itemHouse, letter: 'H' },
      { word: 'mat', emoji: '\u{1F9FA}', img: itemMat, letter: 'M' },
      { word: 'moon', emoji: '\u{1F319}', img: itemMoon, letter: 'M' },
      { word: 'bat', emoji: '\u{1F987}', img: itemBat, letter: 'B' },
      { word: 'bag', emoji: '\u{1F392}', img: itemBag, letter: 'B' },
      { word: 'star', emoji: '⭐', img: itemStarGold, letter: 'S' },
      { word: 'sun', emoji: '☀️', img: itemSun, letter: 'S' },
    ],
  },
  {
    // Implicit grammar: I am → He is / She is, with the story's feelings.
    id: 'l5-he-is', kind: 'x-is-feeling', bg: bgL5Empty, teacher: 'How are they? Listen and say: "He is sad." "She is happy."',
    rounds: [
      { who: 'leo', emotion: 'sad', sentence: 'He is sad.' },
      { who: 'mia', emotion: 'happy', sentence: 'She is happy.' },
      { who: 'pip', emotion: 'angry', sentence: 'He is angry.' },
      { who: 'leo', emotion: 'happy', sentence: 'He is happy!' },
    ],
  },
  {
    // Badges on the five friends painted on bg-l5-friends-wide (checked against the art).
    id: 'l5-spin', kind: 'spin-wheel', bg: bgL5Friends, title: '',
    teacher: 'Have the student spin and say: "Hello! It\'s Mia!" (or "This is Mia. She is happy."). Or tap a number.',
    items: [
      { label: "Hello! It's Pip!", left: '19%', top: '41%' },
      { label: "Hello! It's Mia!", left: '34%', top: '48%' },
      { label: "Hello! It's Bella!", left: '48%', top: '40%' },
      { label: "Hello! It's Willow!", left: '63%', top: '49%' },
      { label: "Hello! It's Leo!", left: '77%', top: '43%' },
    ],
    wheelAt: { left: '33%', top: '25%' },
  },

  /* 10-13 Communicative + game break + personal */
  {
    id: 'l5-leo-asks', kind: 'join-stage', bg: bgL5SadW, teacher: 'Leo asks you questions. Answer him!', cast: ['leo', 'pip'],
    turns: [
      { who: 'leo', line: 'Hello! What is your name?', bubble: 'right' },
      { who: 'student', line: 'Hello! My name is … !', bubble: 'right' },
      { who: 'leo', line: 'How are you?', bubble: 'right' },
      { who: 'student', line: 'I am happy! / I am sad.', bubble: 'right' },
      { who: 'leo', line: 'How old are you?', bubble: 'right' },
      { who: 'student', line: 'I am … !', bubble: 'right' },
    ],
  },
  {
    id: 'l5-you-ask', kind: 'join-stage', bg: bgL5SadW, teacher: 'Swap! Now YOU ask Leo. Be kind — he is sad.', cast: ['leo'],
    turns: [
      { who: 'student', line: 'Ask Leo: How are you?', bubble: 'right' },
      { who: 'leo', line: 'I am sad. I lost my star.', bubble: 'right' },
      { who: 'student', line: 'Say: We can help you!', bubble: 'right' },
      { who: 'leo', line: 'Thank you!', bubble: 'right' },
    ],
  },
  {
    id: 'l5-memory', kind: 'memory', bg: bgL5Empty, teacher: 'Find the pairs from the search! Say each one.',
    pairs: [
      { id: 'star', label: 'Star', emoji: '⭐', img: itemStarGold },
      { id: 'hat', label: 'Hat', emoji: '\u{1F3A9}', img: itemHat },
      { id: 'bat', label: 'Bat', emoji: '\u{1F987}', img: itemBat },
      { id: 'mat', label: 'Mat', emoji: '\u{1F9FA}', img: itemMat },
      { id: 'ant', label: 'Ant', emoji: '\u{1F41C}', img: itemAnt },
      { id: 'bag', label: 'Bag', emoji: '\u{1F392}', img: itemBag },
    ],
  },
  {
    id: 'l5-feelings', kind: 'feelings', bg: bgL5FoundW, teacher: 'Leo was sad, now he is happy. How are YOU today? Tap and say it.',
    options: [
      { label: 'Happy', emoji: '\u{1F600}', reply: 'I am happy too! Just like Leo!' },
      { label: 'Sad', emoji: '\u{1F622}', reply: "It's okay to be sad. Your friends can help, like Leo's friends!" },
      { label: 'Angry', emoji: '\u{1F620}', reply: "It's okay. Take a big breath with me." },
    ],
  },

  /* 14-16 Phonics, quick-fire, story part 2 */
  {
    id: 'l5-dash', kind: 'dash', bg: bgL5Empty, teacher: 'Bella Dash! Tap only the B words: bat, bag, ball. Get 6!', who: 'bella', targetLetter: 'B', targetPhoneme: '/b/', goal: 6, seconds: 40,
    items: [
      { word: 'bat', letter: 'B', img: itemBat, emoji: '\u{1F987}' },
      { word: 'bag', letter: 'B', img: itemBag, emoji: '\u{1F392}' },
      { word: 'ball', letter: 'B', img: itemBallL4, emoji: '⚽' },
      { word: 'hat', letter: 'H', img: itemHat, emoji: '\u{1F3A9}' },
      { word: 'mat', letter: 'M', img: itemMat, emoji: '\u{1F9FA}' },
      { word: 'star', letter: 'S', img: itemStarGold, emoji: '⭐' },
      { word: 'ant', letter: 'A', img: itemAnt, emoji: '\u{1F41C}' },
    ],
  },
  {
    id: 'l5-quick-fire', kind: 'rapid-recall', bg: bgL5Empty, who: 'pip', seconds: 3,
    teacher: 'Quick-fire! Say each picture before the ring runs out.',
    cards: [
      { img: itemStarGold, word: 'Star' },
      { img: itemHat, word: 'Hat' },
      { img: itemBat, word: 'Bat' },
      { img: itemMat, word: 'Mat' },
      { img: getEmotionSprite('leo', 'sad'), word: 'Sad', say: 'He is sad.' },
      { img: getEmotionSprite('leo', 'happy'), word: 'Happy', say: 'He is happy!' },
    ],
  },
  {
    id: 'l5-story-b', kind: 'story-video', bg: bgL5Glow, videoUrl: `${A}/video/leo-story-u1l5-b.mp4?v=1`, title: "Leo's Lost Star — part 2",
    teacher: 'The search! Say the refrain with the friends: "Is it under the hat? No!"',
    pages: [
      { img: bgL5HatW, who: 'bella', line: "Is it under the hat? No! It's a bat!", motion: 'pan-right', atSec: 0 },
      { img: bgL5MatW, who: 'mia', line: "Is it under the mat? No! It's an ant!", motion: 'pan-left', atSec: 8 },
      { img: bgL5Glow, who: 'willow', line: 'Look! Under the tree!', motion: 'zoom-in', fx: 'sparkles', atSec: 16 },
      { img: bgL5FoundW, who: 'leo', line: 'My star! I am happy! Thank you, friends!', motion: 'zoom-out', fx: 'hearts', atSec: 24 },
    ],
    checkpoints: [
      { afterPage: 0, who: 'bella', question: 'What is under the hat?', answer: 'A bat', options: [{ label: 'A star', img: itemStarGold }, { label: 'A bat', img: itemBat }, { label: 'An ant', img: itemAnt }] },
      { afterPage: 2, who: 'willow', question: 'Where is the star?', answer: 'Under the tree', options: [{ label: 'Under the hat', img: itemHat }, { label: 'Under the tree', img: itemTree }, { label: 'In the bag', img: itemBag }] },
    ],
  },

  /* 17-20 Post-story: order, check, sticker, home mission */
  {
    id: 'l5-story-order', kind: 'story-order', bg: bgL5Empty, who: 'pip', teacher: 'Put the story in order, then tell it: first, then, then, at the end!',
    frames: [
      { img: bgL5Wind, caption: 'The wind blows the star away.', who: 'pip' },
      { img: bgL5SadW, caption: 'Leo is sad.', who: 'leo' },
      { img: bgL5HatW, caption: "Is it under the hat? No! It's a bat!", who: 'bella' },
      { img: bgL5FoundW, caption: 'The star! Leo is happy!', who: 'leo' },
    ],
  },
  {
    id: 'l5-tick-cross', kind: 'tick-cross', bg: bgL5Empty, who: 'pip', teacher: 'Listen. Is it right? Tap ✔ or ✘.',
    rounds: [
      { img: bgL5Play, sentence: 'Leo has a star.', isTrue: true },
      { img: bgL5SadW, sentence: 'Leo is happy.', isTrue: false },
      { img: bgL5HatW, sentence: 'There is a bat under the hat.', isTrue: true },
      { img: bgL5MatW, sentence: 'There is a star under the mat.', isTrue: false },
      { img: bgL5FoundW, sentence: 'Leo is happy at the end.', isTrue: true },
    ],
  },
  {
    id: 'l5-sticker', kind: 'sticker-reward', bg: bgL5FoundW, who: 'leo', teacher: 'Sticker time! The child opens the pack and puts Leo\'s star in their Sticker Book.',
    line: 'You found my star! Here is a star sticker for you!', sticker: { img: itemStarGold, label: 'Star' },
  },
  {
    id: 'l5-home-mission', kind: 'home-mission', bg: bgL5Empty, who: 'leo',
    teacher: 'Home Mission: read the parent note and show the picture steps.',
    line: 'Your mission: hide a toy at home. Your family looks for it. Ask: Is it under the hat? Is it in the bag?',
    parentNote: 'Play hide-and-find with one toy: your child hides it and asks "Is it under the ___?"; you answer "No!" or "Yes! Here it is!". Then swap.',
    steps: [
      { emoji: '\u{1F648}', img: itemStarGold, say: 'Hide' },
      { emoji: '❓', img: itemHat, say: 'Ask' },
      { emoji: '\u{1F389}', say: 'Here it is!' },
    ],
  },

  /* Extra time (blueprint §3b): use if there are minutes left; Next skips. */
  {
    id: 'l5-brain-break', kind: 'tpr-actions', mode: 'break', bg: bgL5Empty, who: 'pip',
    teacher: 'Extra time — Brain Break! Stand up and move together. Skip with Next if there is no time.',
    rounds: [
      { line: 'Twinkle like a star!', emoji: '✨' },
      { line: 'Flap like a bat!', emoji: '\u{1F987}' },
      { line: 'Roar like Leo!', emoji: '\u{1F981}' },
      { line: 'Hop like Bella!', emoji: '\u{1F430}' },
      { line: 'Freeze!', emoji: '\u{1F976}', seconds: 3 },
    ],
  },
  {
    id: 'l5-who', kind: 'who-said-it', bg: bgL5Friends, teacher: 'Extra time — Who said it in the story? Listen and tap the friend.',
    rounds: [
      { line: 'I am sad. I lost my star.', who: 'leo', emotion: 'sad' },
      { line: 'Hello, Leo! My name is Mia.', who: 'mia' },
      { line: "Is it under the hat? No! It's a bat!", who: 'bella' },
      { line: 'Look! Under the tree!', who: 'willow' },
    ],
  },
  {
    id: 'l5-hello-doors', kind: 'hello-doors', bg: bgHelloDoorsTree, teacher: 'Extra time — Knock knock! Tap the right door, then say hello to your friend!', cast: ['pip', 'mia', 'bella', 'willow'],
    rounds: [
      { target: 'bella', prompt: 'Knock knock! Where is Bella?', helloLine: 'Hello! My name is Bella.', echoLine: 'Hello, Bella!' },
      { target: 'willow', prompt: 'Knock knock! Where is Willow?', helloLine: 'Hello! My name is Willow.', echoLine: 'Hi, Willow!' },
    ],
  },

  /* 21-22 Closing */
  {
    id: 'l5-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to Leo! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3580, 4020, 4980, 7482],
    songPrompt: 'Cheerful upbeat kids goodbye song',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'leo', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'mia', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'l5-finale', kind: 'finale', bg: bgL5FoundW, who: 'leo', line: 'Thank you for helping me find my star! I was sad, and now I am happy. Goodbye, friend!' },
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
    // Warm-up: the Colors Song from Lesson 2 (it ends "What color is it?", this
    // lesson's question). The lesson's own Question Song is in scripts/songs.json
    // ("u2l4-what-color") but not generated yet (music credits ran out on
    // 2026-10-03); switch songUrl/lyrics back to it once it is baked.
    id: 'u2l4-song', kind: 'song', bg: bgU2L4Party, title: '\u{1F3B5} The Colors Song \u{1F3B5}', teacher: 'Sing and point! On "What color is it?" point to something and answer.',
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
      { colorWord: 'RED CIRCLE', colorHex: C4.RED, who: 'bella', label: 'Balloon', sentence: "It's a red circle!", left: '7%', top: '22%', splashImg: itemBalloonRed },
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
    // Cambridge Pre A1 Starters Listening Part 5 "Listen and colour", as a game.
    id: 'u2l4-listen-colour', kind: 'listen-colour', bg: bgU2L4Party, who: 'pip',
    teacher: 'Listen and color! Pick the paint, then tap the shape. Big or small?',
    items: [
      { id: 'bigCircle', shape: 'circle', size: 'big', x: 4, y: 4, w: 26, h: 26 },
      { id: 'smallSquare', shape: 'square', size: 'small', x: 8, y: 44, w: 12, h: 12 },
      { id: 'bigTriangle', shape: 'triangle', size: 'big', x: 34, y: 4, w: 28, h: 30 },
      { id: 'smallCircle', shape: 'circle', size: 'small', x: 40, y: 44, w: 12, h: 12 },
      { id: 'bigSquare', shape: 'square', size: 'big', x: 62, y: 30, w: 28, h: 28 },
      { id: 'smallTriangle', shape: 'triangle', size: 'small', x: 76, y: 4, w: 14, h: 14 },
    ],
    rounds: [
      { item: 'bigCircle', colorWord: 'RED' },
      { item: 'smallTriangle', colorWord: 'GREEN' },
      { item: 'bigSquare', colorWord: 'BLUE' },
      { item: 'smallCircle', colorWord: 'YELLOW' },
      { item: 'bigTriangle', colorWord: 'PURPLE' },
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
      { who: 'pip', line: 'What color is this?', arrow: { left: '7%', top: '22%' } },
      { who: 'student', line: "It's …", arrow: { left: '7%', top: '22%' } },
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
    // The ESL "go fishing" game: catch the fish with the shape you hear.
    id: 'u2l4-shape-fishing', kind: 'shape-fishing', bg: bgU2L4Whale, who: 'willow',
    teacher: 'Shape Fishing! Listen and catch the right fish.',
    fish: [
      { colorWord: 'RED', colorHex: C4.RED, shape: 'circle' },
      { colorWord: 'BLUE', colorHex: C4.BLUE, shape: 'triangle' },
      { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'square' },
      { colorWord: 'GREEN', colorHex: C4.GREEN, shape: 'circle' },
      { colorWord: 'BLUE', colorHex: C4.BLUE, shape: 'square' },
      { colorWord: 'RED', colorHex: C4.RED, shape: 'triangle' },
      { colorWord: 'PURPLE', colorHex: C4.PURPLE, shape: 'circle' },
      { colorWord: 'ORANGE', colorHex: C4.ORANGE, shape: 'triangle' },
    ],
    targets: [1, 3, 5, 2, 6],
  },
  {
    // Pattern completion (Khan Academy Kids-style colour/shape patterns).
    id: 'u2l4-pattern-train', kind: 'pattern-train', bg: bgU2L4Party, who: 'pip',
    teacher: 'What comes next? Say it, then tap it!',
    rounds: [
      {
        pattern: [{ colorWord: 'RED', colorHex: C4.RED, shape: 'circle' }, { colorWord: 'BLUE', colorHex: C4.BLUE, shape: 'square' }, { colorWord: 'RED', colorHex: C4.RED, shape: 'circle' }, { colorWord: 'BLUE', colorHex: C4.BLUE, shape: 'square' }],
        answer: { colorWord: 'RED', colorHex: C4.RED, shape: 'circle' },
        options: [{ colorWord: 'BLUE', colorHex: C4.BLUE, shape: 'square' }, { colorWord: 'RED', colorHex: C4.RED, shape: 'circle' }, { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'triangle' }],
      },
      {
        pattern: [{ colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'triangle' }, { colorWord: 'GREEN', colorHex: C4.GREEN, shape: 'triangle' }, { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'triangle' }, { colorWord: 'GREEN', colorHex: C4.GREEN, shape: 'triangle' }],
        answer: { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'triangle' },
        options: [{ colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'circle' }, { colorWord: 'GREEN', colorHex: C4.GREEN, shape: 'triangle' }, { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'triangle' }],
      },
      {
        pattern: [{ colorWord: 'RED', colorHex: C4.RED, shape: 'circle' }, { colorWord: 'BLUE', colorHex: C4.BLUE, shape: 'square' }, { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'triangle' }, { colorWord: 'RED', colorHex: C4.RED, shape: 'circle' }, { colorWord: 'BLUE', colorHex: C4.BLUE, shape: 'square' }],
        answer: { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'triangle' },
        options: [{ colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'triangle' }, { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'square' }, { colorWord: 'RED', colorHex: C4.RED, shape: 'circle' }],
      },
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

/* REBUILD (2026-10-03) as a full story lesson (pre-story → story → post-story),
 * replacing a 6-scene version on square art with the shared goodbye song.
 * Original story (not the published "Rainbow Fish" book): Shelly, a little
 * gray fish, is sad; Pip's friends sail by on their SHIP and give her colored
 * SCALES — a red circle, a blue square, a yellow triangle… — until she is a
 * rainbow fish, and she shares one with a sad little crab. Unit 2's colours
 * and shapes in a story (curriculum: "Colors and shapes in a story", SH).
 * Story chunks: "I want colors!" · "What color do you want? — I want red,
 * please!" · "Here you are!" · "Thank you!"
 * Shape: pre-story (key chunks, SH sound) → while-story (flipbook with
 * spoken check questions) → post-story (Cambridge Starters tick-or-cross,
 * jumbled-picture retell, colour Shelly's scales, role-play as Shelly, the
 * child gives scales, retell questions, read the words). Research: pre/
 * while/post storytelling and jumbled-picture retelling for young EFL
 * learners (Cambridge ELT blog "Storytelling online with young learners";
 * Kids Club English "How to use stories"), Cambridge Pre A1 Starters R&W
 * Part 1 (tick or cross). */
const bgU2L5Sea = `${A}/scenes/bg-u2l5-sea-wide.png`;
const bgU2L5Sad = `${A}/scenes/bg-u2l5-shelly-sad-wide.png`;
const bgU2L5Red = `${A}/scenes/bg-u2l5-shelly-red-wide.png`;
const bgU2L5Blue = `${A}/scenes/bg-u2l5-shelly-blue-wide.png`;
const bgU2L5Yellow = `${A}/scenes/bg-u2l5-shelly-yellow-wide.png`;
const bgU2L5Green = `${A}/scenes/bg-u2l5-shelly-green-wide.png`;
const bgU2L5Orange = `${A}/scenes/bg-u2l5-shelly-orange-wide.png`;
const bgU2L5Rainbow = `${A}/scenes/bg-u2l5-shelly-rainbow-wide.png`;
const bgU2L5Crab = `${A}/scenes/bg-u2l5-crab-wide.png`;
const itemShip = `${A}/items/item-ship.png`;
const itemShoe = `${A}/items/item-shoe.png`;
const itemShell = `${A}/items/item-shell.png`;
const itemShelly = `${A}/items/item-shelly.png`;

export const LESSON_U2L5_TITLE = "The Rainbow Fish's Scales";
export const LESSON_U2L5_OBJECTIVE = 'Follow a story about Shelly, a gray fish who gets colored scales (a red circle, a blue square, a yellow triangle…); understand and retell it with pictures; use "What color do you want? — I want red, please!", "Here you are!" and "Thank you!"; hear SH (ship, shell, shoe, fish).';

export const LESSON_U2L5_SCENES: Scene[] = [
  { id: 'u2l5-title', kind: 'title-card', bg: bgU2L5Sea, level: 'Pre-A1', unit: 'Unit 2', lessonLabel: 'Lesson 5', title: "The Rainbow Fish's Scales", subtitle: "Shelly's story" },

  {
    // Warm-up: Shelly's song (scripts/songs.json "u2l5-shelly"; chant until the music is made).
    id: 'u2l5-song', kind: 'song', bg: bgU2L5Sea, title: "\u{1F3B5} Shelly's Song \u{1F3B5}", teacher: 'Sing and swim like a fish! Show the shapes with your hands.',
    durationSeconds: 28, bigWord: 'Shelly', songUrl: `${A}/audio/shelly-song-u2l5.mp3?v=1`,
    lineDurationsMs: [7830, 4760, 4410, 11447],
    songPrompt: 'Upbeat kids pop story song',
    lyrics: [
      { who: 'pip', text: 'Shelly, Shelly, little gray fish!', emotion: 'happy' },
      { who: 'bella', text: 'A red circle, a blue square, a yellow triangle!', emotion: 'happy' },
      { who: 'willow', text: 'Green and orange and purple too!', emotion: 'happy' },
      { who: 'mia', text: 'Shelly is a rainbow fish!', emotion: 'happy' },
    ],
  },
  {
    id: 'u2l5-intro', kind: 'cinematic', bg: bgU2L5Sea, hidePipOverlay: true, title: "Shelly's Story", subtitle: 'A little fish in the big blue sea', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Look! A little gray fish!' },
      { who: 'bella', line: 'Her name is Shelly. She looks sad.' },
    ],
    cta: "Let's help!",
  },

  /* ---- Pre-story: the words and chunks of the story ---- */
  {
    id: 'u2l5-story-words', kind: 'listen-repeat-cards', bg: bgU2L5Sea, teacher: 'These words are in the story. Listen, then say them!',
    cards: [
      { who: 'pip', sentence: "It's a ship!", img: itemShip, imgLabel: 'Ship' },
      { who: 'pip', sentence: 'This is Shelly. She is a fish.', img: bgU2L5Sad, imgLabel: 'Fish' },
      { who: 'mia', sentence: 'I want colors!', img: bgU2L5Sad, imgLabel: 'I want…' },
      { who: 'bella', sentence: 'Here you are!', img: bgU2L5Red, imgLabel: 'Here you are' },
      { who: 'willow', sentence: 'Thank you!', img: bgU2L5Crab, imgLabel: 'Thank you' },
    ],
  },
  {
    id: 'u2l5-model-sh', kind: 'sound-model', bg: bgU2L5Sea, who: 'mia', letter: 'Sh', phoneme: '/sh/', sound: 'shh',
    teacher: 'S and H together say /sh/ — like Shelly! Ship, shell, shoe!',
    anchors: [
      { word: 'ship', emoji: '\u{1F6A2}', img: itemShip },
      { word: 'shell', emoji: '\u{1F41A}', img: itemShell },
      { word: 'shoe', emoji: '\u{1F45F}', img: itemShoe },
    ],
  },
  { id: 'u2l5-trace-s', kind: 'trace', bg: bgU2L5Sea, who: 'mia', letter: 'S', phoneme: '/sh/', word: 'ship', teacher: 'Trace the S! S and H say /sh/ — ship!' },

  /* ---- The story ---- */
  {
    // The story as an animated, narrated cartoon: Pre-A1 children can't read
    // yet, so nothing here needs reading (answers are pictures).
    id: 'u2l5-story-video', kind: 'story-video', bg: bgU2L5Sea, videoUrl: `${A}/video/shelly-story-u2l5.mp4?v=4`, title: "Shelly's Scales",
    teacher: 'Press play and watch together. Point and repeat key words; answer the picture questions.',
    pages: [
      { img: bgU2L5Sea, who: 'pip', line: 'This is Shelly. Shelly is a little fish.', motion: 'zoom-in', fx: 'bubbles' , atSec: 0 },
      { img: bgU2L5Sad, who: 'pip', line: 'Shelly is gray. She is sad. I want colors!', motion: 'zoom-in', fx: 'tear' , atSec: 8 },
      { img: bgU2L5Red, who: 'bella', line: 'Bella says, Here you are! A red circle!', motion: 'pan-right', fx: 'sparkles' , atSec: 16 },
      { img: bgU2L5Blue, who: 'mia', line: 'Mia gives Shelly a blue square.', motion: 'pan-left', fx: 'sparkles' , atSec: 24 },
      { img: bgU2L5Yellow, who: 'leo', line: 'Leo gives Shelly a yellow triangle.', motion: 'pan-right', fx: 'sparkles' , atSec: 32 },
      { img: bgU2L5Green, who: 'pip', line: 'Pip gives Shelly a green circle.', motion: 'pan-right', fx: 'sparkles' , atSec: 40 },
      { img: bgU2L5Orange, who: 'willow', line: 'Willow gives Shelly an orange square and a purple triangle.', motion: 'pan-left', fx: 'sparkles' , atSec: 48 },
      { img: bgU2L5Rainbow, who: 'willow', line: 'Now Shelly has six colors! She is a rainbow fish!', motion: 'zoom-out', fx: 'sparkles' , atSec: 56 },
      { img: bgU2L5Crab, who: 'pip', line: 'A little crab is gray and sad. Shelly gives him a purple circle.', motion: 'zoom-in', fx: 'bubbles' , atSec: 64 },
      { img: bgU2L5Crab, who: 'willow', line: 'Thank you, Shelly! Now they are friends.', motion: 'zoom-out', fx: 'hearts' , atSec: 72 },
    ],
    checkpoints: [
      { afterPage: 1, who: 'pip', question: 'What color is Shelly?', answer: 'Gray', options: [{ label: 'Red', colorHex: '#EF4444' }, { label: 'Gray', colorHex: '#9CA3AF' }, { label: 'Blue', colorHex: '#3B82F6' }] },
      { afterPage: 4, who: 'leo', question: 'What shape is the yellow scale?', answer: 'Triangle', options: [{ label: 'Circle', shape: 'circle', colorHex: '#FACC15' }, { label: 'Square', shape: 'square', colorHex: '#FACC15' }, { label: 'Triangle', shape: 'triangle', colorHex: '#FACC15' }] },
      { afterPage: 5, who: 'pip', question: 'What color is the circle from Pip?', answer: 'Green', options: [{ label: 'Red', shape: 'circle', colorHex: '#EF4444' }, { label: 'Green', shape: 'circle', colorHex: '#22C55E' }, { label: 'Blue', shape: 'circle', colorHex: '#3B82F6' }] },
      { afterPage: 8, who: 'pip', question: 'What does Shelly give the crab?', answer: 'A purple circle', options: [{ label: 'A red square', shape: 'square', colorHex: '#EF4444' }, { label: 'A purple circle', shape: 'circle', colorHex: '#A855F7' }, { label: 'A blue triangle', shape: 'triangle', colorHex: '#3B82F6' }] },
    ],
  },

  /* ---- Post-story: check, order, retell ---- */
  {
    id: 'u2l5-tick-cross', kind: 'tick-cross', bg: bgU2L5Sea, who: 'pip', teacher: 'Listen. Is it right? Tap ✔ or ✘.',
    rounds: [
      { img: bgU2L5Sad, sentence: 'Shelly is gray.', isTrue: true },
      { img: bgU2L5Red, sentence: 'Bella gives Shelly a blue square.', isTrue: false },
      { img: bgU2L5Yellow, sentence: 'Leo gives Shelly a yellow triangle.', isTrue: true },
      { img: bgU2L5Rainbow, sentence: 'Shelly is sad.', isTrue: false },
      { img: bgU2L5Crab, sentence: 'Shelly gives the crab a purple circle.', isTrue: true },
    ],
  },
  {
    id: 'u2l5-story-order', kind: 'story-order', bg: bgU2L5Sea, who: 'pip', teacher: 'Put the story in order! What happens first?',
    frames: [
      { img: bgU2L5Sad, caption: 'Shelly is gray and sad.', who: 'pip' },
      { img: bgU2L5Red, caption: 'Bella gives her a red circle.', who: 'bella' },
      { img: bgU2L5Rainbow, caption: 'Shelly is a rainbow fish!', who: 'willow' },
      { img: bgU2L5Crab, caption: 'Shelly gives the crab a purple circle.', who: 'pip' },
    ],
  },
  {
    id: 'u2l5-color-shelly', kind: 'listen-colour', bg: bgU2L5Sea, who: 'bella', backdrop: 'fish',
    teacher: "Color Shelly's scales! Listen: big or small? Which shape? Which color?",
    items: [
      { id: 'bigCircle', shape: 'circle', size: 'big', x: 20, y: 12, w: 18, h: 18 },
      { id: 'smallTriangle', shape: 'triangle', size: 'small', x: 44, y: 8, w: 10, h: 10 },
      { id: 'bigSquare', shape: 'square', size: 'big', x: 44, y: 24, w: 16, h: 16 },
      { id: 'smallCircle', shape: 'circle', size: 'small', x: 68, y: 14, w: 9, h: 9 },
      { id: 'bigTriangle', shape: 'triangle', size: 'big', x: 64, y: 30, w: 18, h: 18 },
      { id: 'smallSquare', shape: 'square', size: 'small', x: 26, y: 38, w: 9, h: 9 },
    ],
    rounds: [
      { item: 'bigCircle', colorWord: 'RED' },
      { item: 'bigSquare', colorWord: 'BLUE' },
      { item: 'bigTriangle', colorWord: 'YELLOW' },
      { item: 'smallCircle', colorWord: 'GREEN' },
      { item: 'smallTriangle', colorWord: 'ORANGE' },
      { item: 'smallSquare', colorWord: 'PURPLE' },
    ],
  },

  /* ---- Speaking: be Shelly, then be the giver ---- */
  {
    id: 'u2l5-be-shelly', kind: 'join-stage', bg: bgU2L5Sea, teacher: 'You are Shelly! Ask for a color, then say thank you.', cast: ['bella', 'mia'],
    turns: [
      { who: 'bella', line: 'Hello, Shelly! What color do you want?', bg: bgU2L5Red, bubble: 'right' },
      { who: 'student', line: 'I want red, please!', bg: bgU2L5Red, bubble: 'right' },
      { who: 'bella', line: 'Here you are! A red circle!', bg: bgU2L5Red, bubble: 'right' },
      { who: 'student', line: 'Thank you!', bg: bgU2L5Red, bubble: 'right' },
      { who: 'mia', line: 'What color do you want?', bg: bgU2L5Blue, bubble: 'right' },
      { who: 'student', line: 'I want …, please!', bg: bgU2L5Blue, bubble: 'right' },
    ],
  },
  {
    id: 'u2l5-you-give', kind: 'join-stage', bg: bgU2L5Sea, teacher: 'Now YOU give the scales! Ask, then say: Here you are!', cast: ['leo', 'willow'],
    turns: [
      { who: 'student', line: 'Ask Leo: What color do you want?', bg: bgU2L5Yellow, bubble: 'right' },
      { who: 'leo', line: 'I want yellow, please!', bg: bgU2L5Yellow, bubble: 'right' },
      { who: 'student', line: 'Here you are!', bg: bgU2L5Yellow, bubble: 'right' },
      { who: 'leo', line: 'Thank you!', bg: bgU2L5Yellow, bubble: 'right' },
      { who: 'student', line: 'Ask your teacher: What color do you want?' },
    ],
  },

  /* ---- Games ---- */
  {
    id: 'u2l5-sh-dash', kind: 'dash', bg: bgU2L5Sea, teacher: 'Mia Dash! Tap only the /sh/ words. Get 6!', who: 'mia', targetLetter: 'SH', targetPhoneme: '/sh/', goal: 6, seconds: 40,
    items: [
      { word: 'ship', letter: 'SH', img: itemShip, emoji: '\u{1F6A2}' },
      { word: 'shell', letter: 'SH', img: itemShell, emoji: '\u{1F41A}' },
      { word: 'shoe', letter: 'SH', img: itemShoe, emoji: '\u{1F45F}' },
      { word: 'clock', letter: 'C', img: itemClock, emoji: '\u{1F570}️' },
      { word: 'whale', letter: 'WH', img: itemWhale, emoji: '\u{1F433}' },
      { word: 'frog', letter: 'F', img: itemFrog, emoji: '\u{1F438}' },
    ],
  },
  {
    id: 'u2l5-memory', kind: 'memory', bg: bgU2L5Sea, teacher: 'Find the pairs! Say each word.',
    pairs: [
      { id: 'ship', label: 'Ship', emoji: '\u{1F6A2}', img: itemShip },
      { id: 'shell', label: 'Shell', emoji: '\u{1F41A}', img: itemShell },
      { id: 'shoe', label: 'Shoe', emoji: '\u{1F45F}', img: itemShoe },
      { id: 'fish', label: 'Fish', emoji: '\u{1F41F}', img: itemShelly },
    ],
  },
  {
    id: 'u2l5-retell', kind: 'join-stage', bg: bgU2L5Sea, teacher: 'Tell the story! Answer Pip.', cast: ['pip', 'bella'],
    turns: [
      { who: 'pip', line: 'What color is Shelly at the start?', bg: bgU2L5Sad, bubble: 'left' },
      { who: 'student', line: 'She is gray.', bg: bgU2L5Sad, bubble: 'left' },
      { who: 'pip', line: 'What is Shelly at the end?', bg: bgU2L5Rainbow, bubble: 'right' },
      { who: 'student', line: 'She is a rainbow fish!', bg: bgU2L5Rainbow, bubble: 'right' },
      { who: 'bella', line: 'What color scale do YOU want?' },
      { who: 'student', line: 'I want a … …, please!' },
    ],
  },
  {
    // Listening game in Shelly's sea (replaces reading words: the children can't read yet).
    id: 'u2l5-scale-fishing', kind: 'shape-fishing', bg: bgU2L5Sea, who: 'mia',
    teacher: "Catch Shelly's scales! Listen: which color and shape?",
    fish: [
      { colorWord: 'RED', colorHex: '#EF4444', shape: 'circle' },
      { colorWord: 'BLUE', colorHex: '#3B82F6', shape: 'square' },
      { colorWord: 'YELLOW', colorHex: '#FACC15', shape: 'triangle' },
      { colorWord: 'GREEN', colorHex: '#22C55E', shape: 'circle' },
      { colorWord: 'PURPLE', colorHex: '#A855F7', shape: 'circle' },
      { colorWord: 'ORANGE', colorHex: '#F97316', shape: 'square' },
      { colorWord: 'BLUE', colorHex: '#3B82F6', shape: 'triangle' },
      { colorWord: 'RED', colorHex: '#EF4444', shape: 'square' },
    ],
    targets: [0, 1, 2, 4, 6],
  },

  { id: 'u2l5-finale', kind: 'finale', bg: bgU2L5Rainbow, who: 'pip', line: 'Shelly is a rainbow fish! Share and be kind. Goodbye, friends!' },
];

/* =============================================================================
 * Pre-A1 Unit 2, Lesson 6 — "Color & Shape Hunt" (the unit's review lesson)
 *
 * REBUILD (2026-10-03), replacing a version that leaned on reading (fill in
 * the first letter of "yellow", text-only flipbook pages, written answers):
 * Pre-A1 children can't read yet, so every task here is heard and answered
 * with pictures, taps or speech. No new words: all six colours (L1-L2), the
 * three shapes (L3), "What color/shape is it? — It's a red circle." and
 * "Is it…?" (L4), "I want…, please / Here you are" (L5), and the unit's
 * sounds C, WH, SH (L3-L5).
 *
 * Frame: a treasure hunt. Pip finds a map; the friends find a red circle, a
 * blue square and a yellow triangle (garden, beach, dark cave); the three
 * shapes open the treasure chest — a rainbow. The story is a short narrated
 * film (story-video), and every game after it is a stop on the hunt.
 *
 * Mechanics (activity-pattern-library; none of L5's dominant kinds repeated
 * back to back): two new kinds, researched —
 *  - odd-one-out: "Which one is different?" (Khan Academy Kids / Lingokids
 *    sorting, the classic preschool odd-one-out) — grouping by colour/shape.
 *  - shape-torch: torch hunt in a dark cave ("flashlight I-spy" pattern from
 *    kids' hidden-object apps; the A1 Magic Castle torch-hunt, made picture-
 *    only) — "Find a green triangle!".
 * plus review kinds at a higher difficulty: story order + "say it" cards
 * after the film, colour quiz, Lesson 2's paint pots, shape sort, secret
 * card with all six colours, the treasure train (patterns), six-colour Simon,
 * circle/square catch, shape builder (new pictures), I Spy in Shape Town, a
 * real-world show-and-tell, and the treasure chest of the unit's sounds.
 * 21 scenes ≈ 32-38 minutes (extended on request: a full 30-minute class).
 * Art: 7 new wide pictures (bg-u2l6-*), story film rendered from them
 * (public/lep1/video/treasure-story-u2l6.mp4/.webm, 6 s per page, 1 s fades).
 * ========================================================================= */

const bgU2L6Map = `${A}/scenes/bg-u2l6-map-wide.png`;
const bgU2L6Garden = `${A}/scenes/bg-u2l6-garden-wide.png`;
const bgU2L6Beach = `${A}/scenes/bg-u2l6-beach-wide.png`;
const bgU2L6Cave = `${A}/scenes/bg-u2l6-cave-wide.png`;
const bgU2L6CaveEmpty = `${A}/scenes/bg-u2l6-cave-empty-wide.png`;
const bgU2L6Chest = `${A}/scenes/bg-u2l6-chest-wide.png`;
const bgU2L6Rainbow = `${A}/scenes/bg-u2l6-rainbow-wide.png`;
const itemRainbow = `${A}/items/item-rainbow.png`;
const itemGemRedCircle = `${A}/items/item-gem-red-circle.png`;
const itemGemBlueSquare = `${A}/items/item-gem-blue-square.png`;
const itemGemYellowTriangle = `${A}/items/item-gem-yellow-triangle.png`;
const itemGemGreenTriangle = `${A}/items/item-gem-green-triangle.png`;
const itemGemPurpleCircle = `${A}/items/item-gem-purple-circle.png`;
const itemGemOrangeSquare = `${A}/items/item-gem-orange-square.png`;
const itemMedalRainbow = `${A}/items/item-medal-rainbow.png`;
const bgU2L6Gems = `${A}/scenes/bg-u2l6-gems-wide.png`;
const bgU2L6River = `${A}/scenes/bg-u2l6-river-wide.png`;
const itemStone = `${A}/items/item-stone.png`;
/** Seamless looping clips of the game pictures (Higgsfield, ping-pong looped) — the living game worlds. */
const loopU2L6 = (name: string) => `${A}/video/loops/u2l6-${name}.mp4`;

export const LESSON_U2L6_TITLE = 'Color & Shape Hunt';
export const LESSON_U2L6_OBJECTIVE = 'Review the whole unit on a treasure hunt, with no reading: name all six colours and three shapes, find "a green triangle" by listening, say "It\'s a red circle.", ask "Is it…?", group things by colour and shape, find real things at home ("Show me something red!"), and hear C, WH and SH.';

export const LESSON_U2L6_SCENES: Scene[] = [
  { id: 'u2l6-title', kind: 'title-card', bg: bgU2L6Map, level: 'Pre-A1', unit: 'Unit 2', lessonLabel: 'Lesson 6 · Review', title: 'Color & Shape Hunt', subtitle: 'The Rainbow Treasure' },
  {
    // Warm-up: the unit's colours song again (Lesson 2's recording).
    id: 'u2l6-song', kind: 'song', bg: bgU2L2Meadow, title: '\u{1F3B5} The Colors Song \u{1F3B5}', teacher: 'Sing and point! Find something green, orange and purple in the room.',
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
    // Slide 2: Pip greets and asks a question the child can already answer.
    id: 'u2l6-intro', kind: 'cinematic', bg: bgU2L6Map, hidePipOverlay: true, title: 'The Rainbow Treasure', subtitle: 'A treasure map!', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hello! How are you today? What color do you like?' },
      { who: 'pip', line: 'Look! A treasure map!' },
      { who: 'bella', line: 'A circle, a square, a triangle… Let\'s go on a hunt!' },
    ],
    cta: "Let's hunt!",
  },

  /* ---- The story (film, no reading) ---- */
  {
    id: 'u2l6-story-video', kind: 'story-video', bg: bgU2L6Map, videoUrl: `${A}/video/treasure-story-u2l6.mp4?v=1`, title: 'The Rainbow Treasure',
    teacher: 'Press play and watch together. Point to each shape and say its color; answer the picture questions.',
    pages: [
      { img: bgU2L6Map, who: 'pip', line: 'Look! Pip has a treasure map. Let\'s go on a hunt!', motion: 'zoom-in', fx: 'sparkles', atSec: 0 },
      { img: bgU2L6Garden, who: 'bella', line: 'Bella finds a red circle in the flowers!', motion: 'pan-right', fx: 'sparkles', atSec: 5 },
      { img: bgU2L6Beach, who: 'willow', line: 'Willow finds a blue square in the sand!', motion: 'pan-left', fx: 'sparkles', atSec: 10 },
      { img: bgU2L6Cave, who: 'leo', line: 'It\'s dark! Leo finds a yellow triangle!', motion: 'zoom-in', fx: 'sparkles', atSec: 15 },
      { img: bgU2L6Chest, who: 'mia', line: 'A circle, a square, a triangle. Mia puts them in the chest!', motion: 'pan-right', fx: 'sparkles', atSec: 20 },
      { img: bgU2L6Rainbow, who: 'pip', line: 'The chest opens. It\'s a rainbow!', motion: 'zoom-out', fx: 'sparkles', atSec: 25 },
      { img: bgU2L6Rainbow, who: 'willow', line: 'Red, orange, yellow, green, blue, purple! Hooray!', motion: 'zoom-in', fx: 'hearts', atSec: 30 },
    ],
    checkpoints: [
      { afterPage: 1, who: 'bella', question: 'What does Bella find?', answer: 'A red circle', options: [{ label: 'A red circle', shape: 'circle', colorHex: C4.RED }, { label: 'A green square', shape: 'square', colorHex: C4.GREEN }, { label: 'A blue triangle', shape: 'triangle', colorHex: C4.BLUE }] },
      { afterPage: 3, who: 'leo', question: 'What shape does Leo find?', answer: 'Triangle', options: [{ label: 'Circle', shape: 'circle', colorHex: C4.YELLOW }, { label: 'Square', shape: 'square', colorHex: C4.YELLOW }, { label: 'Triangle', shape: 'triangle', colorHex: C4.YELLOW }] },
      { afterPage: 5, who: 'pip', question: 'What is in the chest?', answer: 'A rainbow', options: [{ label: 'A rainbow', img: itemRainbow }, { label: 'A fish', img: itemShelly }, { label: 'A pizza', img: itemPizza }] },
    ],
  },
  {
    // Slide 5: Move & Say (TPR, Oxford Toy Team / Everybody Up routine) — every
    // colour and shape word gets an action before the games start.
    id: 'u2l6-move-say', kind: 'tpr-actions', bg: bgU2L6Map, who: 'pip',
    teacher: 'Stand up! Say the action with Pip, then do it before the ring runs out.',
    rounds: [
      { line: 'Draw a big circle in the air!', emoji: '\u{2B55}', img: itemGemRedCircle },
      { line: 'Make a square with your hands!', emoji: '\u{1F7E6}', img: itemGemBlueSquare },
      { line: 'Make a triangle with your arms!', emoji: '\u{1F53A}', img: itemGemYellowTriangle },
      { line: 'Touch something red!', emoji: '\u{1F534}' },
      { line: 'Jump like a green frog!', emoji: '\u{1F438}', img: itemFrog },
      { line: 'Point to something blue!', emoji: '\u{1F449}' },
    ],
  },

  /* ---- Stop 1: the dark cave — listen and find ---- */
  {
    // NEW: torch hunt — listen for colour AND shape, in the dark.
    id: 'u2l6-torch', kind: 'shape-torch', bg: bgU2L6CaveEmpty, who: 'leo',
    teacher: "It's dark in the cave! Move the torch. Find the gem Leo says.",
    gems: [
      { colorWord: 'GREEN', colorHex: C4.GREEN, shape: 'triangle', x: 18, y: 30, size: 9 },
      { colorWord: 'RED', colorHex: C4.RED, shape: 'circle', x: 40, y: 22, size: 8 },
      { colorWord: 'BLUE', colorHex: C4.BLUE, shape: 'square', x: 66, y: 28, size: 8 },
      { colorWord: 'PURPLE', colorHex: C4.PURPLE, shape: 'circle', x: 84, y: 46, size: 8 },
      { colorWord: 'ORANGE', colorHex: C4.ORANGE, shape: 'square', x: 28, y: 62, size: 8 },
      { colorWord: 'YELLOW', colorHex: C4.YELLOW, shape: 'triangle', x: 54, y: 52, size: 9 },
      { colorWord: 'RED', colorHex: C4.RED, shape: 'triangle', x: 74, y: 68, size: 8 },
      { colorWord: 'GREEN', colorHex: C4.GREEN, shape: 'circle', x: 12, y: 74, size: 7 },
    ],
    targets: [0, 2, 5, 3, 4],
  },

  /* ---- Stop 2: the beach — shapes ---- */
  {
    // NEW (2026-10): Shadow Match — recognise the SHAPE from the outline alone.
    id: 'u2l6-shadows', kind: 'shadow-match', bg: bgU2L6Beach, bgVideo: loopU2L6('beach'), who: 'willow',
    teacher: 'Hunt stop 2! Drag each thing onto its shadow (or tap it, then the shadow). Say the shape!',
    items: [
      { label: 'clock', img: itemClock, line: "It's a clock. It's a circle!" },
      { label: 'window', img: itemWindow, line: "It's a window. It's a square!" },
      { label: 'pizza', img: itemPizzaSlice, line: "It's pizza. It's a triangle!" },
      { label: 'present', img: itemPresent, line: "It's a present. It's a square!" },
      { label: 'flag', img: itemFlag, line: "It's a flag. It's a triangle!" },
      { label: 'cookie', img: itemCookie, line: "It's a cookie. It's a circle!" },
    ],
  },
  {
    id: 'u2l6-say-it', kind: 'listen-repeat-cards', bg: bgU2L6Map, teacher: 'Say it like the friends in the story! Listen, then repeat.',
    cards: [
      { who: 'bella', sentence: "It's a red circle!", img: itemGemRedCircle, imgLabel: 'Red circle' },
      { who: 'willow', sentence: "It's a blue square!", img: itemGemBlueSquare, imgLabel: 'Blue square' },
      { who: 'leo', sentence: "It's a yellow triangle!", img: itemGemYellowTriangle, imgLabel: 'Yellow triangle' },
      { who: 'pip', sentence: "It's a rainbow!", img: itemRainbow, imgLabel: 'Rainbow' },
    ],
  },
  {
    // Slide 9: spinner → sentence. Badges sit just above the six gems painted in bg-u2l6-gems-wide (checked against the art).
    id: 'u2l6-spin', kind: 'spin-wheel', bg: bgU2L6Gems, title: '',
    teacher: 'Have the student spin and say the gem: "It\'s a red circle!" Or tap a number.',
    items: [
      { label: "It's a red circle!", left: '13.5%', top: '58%' },
      { label: "It's an orange square!", left: '28.5%', top: '58%' },
      { label: "It's a yellow triangle!", left: '43%', top: '58%' },
      { label: "It's a green circle!", left: '57%', top: '58%' },
      { label: "It's a blue square!", left: '71.5%', top: '58%' },
      { label: "It's a purple triangle!", left: '85.5%', top: '58%' },
    ],
    wheelAt: { left: '50%', top: '28%' },
  },
  {
    // Slide 10: teacher question → child answer, on the gems from the hunt.
    id: 'u2l6-what-is-it', kind: 'join-stage', bg: bgU2L6Gems, teacher: 'Pip asks about the gems. Point to a gem and answer!', cast: ['pip', 'willow'],
    turns: [
      { who: 'pip', line: 'Look at this gem! What color is it?', bubble: 'right' },
      { who: 'student', line: "It's green!", bubble: 'right' },
      { who: 'willow', line: 'What shape is it?', bubble: 'right' },
      { who: 'student', line: "It's a circle!", bubble: 'right' },
      { who: 'pip', line: 'Is it a green circle?', bubble: 'right' },
      { who: 'student', line: "Yes! It's a green circle!", bubble: 'right' },
    ],
  },
  {
    // Slide 11: role swap — now the child ASKS (Lesson 4 taught "Is it…?").
    id: 'u2l6-you-ask', kind: 'join-stage', bg: bgU2L6Gems, teacher: 'Swap! Now the student asks Pip about a gem.', cast: ['pip'],
    turns: [
      { who: 'student', line: 'Ask Pip: What color is it?', bubble: 'right' },
      { who: 'pip', line: "It's purple!", bubble: 'right' },
      { who: 'student', line: 'Ask Pip: Is it a triangle?', bubble: 'right' },
      { who: 'pip', line: "Yes! It's a purple triangle!", bubble: 'right' },
    ],
  },

  /* ---- Stop 3: the garden — colours ---- */
  {
    // NEW (2026-10): Image Reveal — guess the picture before all the tiles are gone.
    id: 'u2l6-reveal', kind: 'tile-reveal', bg: bgU2L6Garden, bgVideo: loopU2L6('garden'), who: 'bella',
    teacher: 'What is it? Tiles pop off one by one — guess early and say it with its color!',
    rounds: [
      { img: itemFrog, word: 'frog', line: "It's a green frog!", options: [{ label: 'leaf', img: itemLeaf }, { label: 'frog', img: itemFrog }, { label: 'apple', img: itemApple }] },
      { img: itemCarrot, word: 'carrot', line: "It's an orange carrot!", options: [{ label: 'carrot', img: itemCarrot }, { label: 'pumpkin', img: itemPumpkin }, { label: 'sun', img: itemSun }] },
      { img: itemGrapes, word: 'grapes', line: 'They are purple grapes!', options: [{ label: 'plum', img: itemPlum }, { label: 'water', img: itemWater }, { label: 'grapes', img: itemGrapes }] },
      { img: itemRainbow, word: 'rainbow', line: "It's a rainbow!", options: [{ label: 'rainbow', img: itemRainbow }, { label: 'clock', img: itemClock }, { label: 'frog', img: itemFrog }] },
    ],
  },
  {
    // NEW: which one is different? Grouping by colour, then by shape.
    id: 'u2l6-odd-one-out', kind: 'odd-one-out', bg: bgU2L6Garden, who: 'bella',
    teacher: 'Which one is different? Tap it, then say why: "It\'s blue!"',
    rounds: [
      { items: [{ label: 'red circle', shape: 'circle', colorHex: C4.RED }, { label: 'red circle', shape: 'circle', colorHex: C4.RED }, { label: 'blue circle', shape: 'circle', colorHex: C4.BLUE }, { label: 'red circle', shape: 'circle', colorHex: C4.RED }], odd: 2, line: "It's blue! The others are red." },
      { items: [{ label: 'yellow square', shape: 'square', colorHex: C4.YELLOW }, { label: 'yellow triangle', shape: 'triangle', colorHex: C4.YELLOW }, { label: 'yellow triangle', shape: 'triangle', colorHex: C4.YELLOW }, { label: 'yellow triangle', shape: 'triangle', colorHex: C4.YELLOW }], odd: 0, line: "It's a square! The others are triangles." },
      { items: [{ label: 'apple', img: itemApple }, { label: 'rose', img: itemRose }, { label: 'leaf', img: itemLeaf }, { label: 'red balloon', img: itemBalloonRed }], odd: 2, line: "The leaf is green! The others are red." },
      { items: [{ label: 'green square', shape: 'square', colorHex: C4.GREEN }, { label: 'green square', shape: 'square', colorHex: C4.GREEN }, { label: 'green square', shape: 'square', colorHex: C4.GREEN }, { label: 'purple square', shape: 'square', colorHex: C4.PURPLE }], odd: 3, line: "It's purple! The others are green." },
      { items: [{ label: 'clock', img: itemClock }, { label: 'window', img: itemWindow }, { label: 'cookie', img: itemCookie }, { label: 'ball', img: itemBall }], odd: 1, line: "The window is a square! The others are circles." },
    ],
  },
  {
    // The unit's sounds open the last treasure: C (L3), WH (L4), SH (L5).
    id: 'u2l6-treasure-sounds', kind: 'trophy-chest', bg: bgMeadow, who: 'pip', teacher: 'Open the treasure! Listen to the sound, then tap the picture word that starts with it.',
    rounds: [
      { letter: 'C', phoneme: '/k/', word: 'clock', img: itemClock, emoji: '\u{1F570}️', choices: ['C', 'WH', 'SH'] },
      { letter: 'WH', phoneme: '/w/', word: 'whale', img: itemWhale, emoji: '\u{1F433}', choices: ['C', 'WH', 'SH'] },
      { letter: 'SH', phoneme: '/sh/', word: 'ship', img: itemShip, emoji: '\u{1F6A2}', choices: ['C', 'WH', 'SH'] },
      { letter: 'C', phoneme: '/k/', word: 'car', img: itemCarC, emoji: '\u{1F697}', choices: ['C', 'WH', 'SH'] },
      { letter: 'SH', phoneme: '/sh/', word: 'shell', img: itemShell, emoji: '\u{1F41A}', choices: ['C', 'WH', 'SH'] },
      { letter: 'WH', phoneme: '/w/', word: 'wheel', img: itemWheel, emoji: '\u{1F6DE}', choices: ['C', 'WH', 'SH'] },
    ],
  },

  /* ---- Stop 4: the treasure chest ---- */
  {
    // NEW (2026-10): Stepping Stones — listen, then hop across the river.
    id: 'u2l6-stones', kind: 'stepping-stones', bg: bgU2L6River, bgVideo: loopU2L6('river'), riverPainted: true, stoneImg: itemStone, who: 'pip', walker: 'pip',
    teacher: 'Help Pip cross the river! Listen and tap the stone. Say it as Pip jumps!',
    rounds: [
      { line: 'Jump on the purple circle!', answer: 1, reply: 'A purple circle! Hop!', options: [{ label: 'purple square', shape: 'square', colorHex: C4.PURPLE }, { label: 'purple circle', shape: 'circle', colorHex: C4.PURPLE }, { label: 'red circle', shape: 'circle', colorHex: C4.RED }] },
      { line: 'Jump on the green triangle!', answer: 0, reply: 'A green triangle! Hop!', options: [{ label: 'green triangle', shape: 'triangle', colorHex: C4.GREEN }, { label: 'green circle', shape: 'circle', colorHex: C4.GREEN }, { label: 'yellow triangle', shape: 'triangle', colorHex: C4.YELLOW }] },
      { line: 'Jump on the orange square!', answer: 2, reply: 'An orange square! Hop!', options: [{ label: 'blue square', shape: 'square', colorHex: C4.BLUE }, { label: 'orange triangle', shape: 'triangle', colorHex: C4.ORANGE }, { label: 'orange square', shape: 'square', colorHex: C4.ORANGE }] },
      { line: 'Jump on the blue circle!', answer: 1, reply: 'A blue circle! Hop!', options: [{ label: 'blue triangle', shape: 'triangle', colorHex: C4.BLUE }, { label: 'blue circle', shape: 'circle', colorHex: C4.BLUE }, { label: 'purple circle', shape: 'circle', colorHex: C4.PURPLE }] },
    ],
    goal: { img: `${A}/stickers/chest-open.png`, label: 'treasure chest', line: 'Pip is over the river! Hooray, the treasure!' },
  },
  {
    // NEW (2026-10): Draw Path (Lingokids) — listen, then draw Leo's way to the gem.
    id: 'u2l6-draw-path', kind: 'draw-path', bg: bgMeadow, bgVideo: loopU2L6('meadow'), who: 'leo', walker: 'leo',
    teacher: 'Listen and draw! Draw a line from Leo to the gem he says. Leo walks your line.',
    start: { x: 9, y: 84 },
    spots: [
      { label: 'purple circle', img: itemGemPurpleCircle, x: 30, y: 60, size: 9 },
      { label: 'green triangle', img: itemGemGreenTriangle, x: 50, y: 84, size: 9 },
      { label: 'orange square', img: itemGemOrangeSquare, x: 66, y: 58, size: 9 },
      { label: 'red circle', img: itemGemRedCircle, x: 86, y: 78, size: 9 },
      { label: 'blue square', img: itemGemBlueSquare, x: 46, y: 66, size: 8 },
    ],
    rounds: [
      { line: 'Take Leo to the purple circle!', target: 0, reply: "It's a purple circle!" },
      { line: 'Now take Leo to the orange square!', target: 2, reply: "It's an orange square!" },
      { line: 'Now the red circle!', target: 3, reply: "It's a red circle!" },
    ],
  },
  {
    id: 'u2l6-builders', kind: 'shape-builder', bg: bgU2L3Builder, who: 'pip',
    teacher: 'Build with the treasure shapes! Name the shape, then pick the color you hear.',
    rounds: [
      {
        who: 'mia', label: 'Robot', intro: "Let's build a robot!", line: "It's a robot!", alive: 'wiggle',
        pieces: [
          { shape: 'square', colorWord: 'BLUE', colorHex: C4.BLUE, x: 34, y: 30, w: 30, h: 30 },
          { shape: 'square', colorWord: 'ORANGE', colorHex: C4.ORANGE, x: 39, y: 8, w: 20, h: 20 },
          { shape: 'circle', colorWord: 'YELLOW', colorHex: C4.YELLOW, x: 43, y: 36, w: 12, h: 12 },
          { shape: 'triangle', colorWord: 'RED', colorHex: C4.RED, x: 43, y: 0, w: 12, h: 9 },
        ],
      },
      {
        who: 'willow', label: 'Boat', intro: "Let's build a boat!", line: "It's a boat!", alive: 'bounce',
        pieces: [
          { shape: 'square', colorWord: 'RED', colorHex: C4.RED, x: 26, y: 48, w: 44, h: 14 },
          { shape: 'triangle', colorWord: 'PURPLE', colorHex: C4.PURPLE, x: 40, y: 10, w: 26, h: 36 },
          { shape: 'circle', colorWord: 'GREEN', colorHex: C4.GREEN, x: 76, y: 4, w: 14, h: 14 },
        ],
      },
    ],
  },

  /* ---- Out of the screen, then the story told back ---- */
  {
    id: 'u2l6-show-me', kind: 'join-stage', bg: bgU2L6Rainbow, teacher: 'Show and tell! Find real things at home, show them, and answer.', cast: ['pip', 'bella', 'leo'],
    turns: [
      { who: 'pip', line: 'Find something red! Show me!', bubble: 'right' },
      { who: 'student', line: "It's red! (show it)", bubble: 'right' },
      { who: 'bella', line: 'Find something round, a circle! What shape is it?', bubble: 'right' },
      { who: 'student', line: "It's a circle!", bubble: 'right' },
      { who: 'leo', line: 'What color do you like?', bubble: 'right' },
      { who: 'student', line: 'I like …!', bubble: 'right' },
    ],
  },
  {
    // After the film: put the hunt in order, and it is told back.
    id: 'u2l6-story-order', kind: 'story-order', bg: bgU2L6Map, who: 'pip', teacher: 'Put the treasure hunt in order! What happens first?',
    frames: [
      { img: bgU2L6Garden, caption: 'Bella finds a red circle.', who: 'bella' },
      { img: bgU2L6Beach, caption: 'Willow finds a blue square.', who: 'willow' },
      { img: bgU2L6Cave, caption: 'Leo finds a yellow triangle.', who: 'leo' },
      { img: bgU2L6Rainbow, caption: 'The chest opens. A rainbow!', who: 'pip' },
    ],
  },
  {
    // Slide 19: the unit is finished — the champion medal goes into the Sticker Book.
    id: 'u2l6-sticker', kind: 'sticker-reward', bg: bgU2L6Rainbow, who: 'pip',
    teacher: 'Sticker time! The child opens the pack and puts the Color & Shape Champion medal in their Sticker Book.',
    line: 'You found the Rainbow Treasure! Here is a champion medal for you!', sticker: { img: itemMedalRainbow, label: 'Champion medal' },
  },
  {
    // Slide 20: Home Mission — a colour and shape scavenger hunt at home
    // (the classic preschool scavenger hunt, done with the family and shown on camera next class).
    id: 'u2l6-home-mission', kind: 'home-mission', bg: bgU2L6Map, who: 'pip',
    teacher: 'Home Mission: read the parent note and show the picture steps.',
    line: 'Your mission: a treasure hunt at home! Find something red, something round, and something square. Show me next time!',
    parentNote: 'Go on a colour and shape hunt at home: help your child find something red, a circle (a plate, a clock) and a square (a book, a window). Each time ask "What color is it?" / "What shape is it?" and let them answer "It\'s red!" / "It\'s a circle!".',
    steps: [
      { emoji: '\u{1F534}', img: itemApple, say: 'Something red' },
      { emoji: '\u{2B55}', img: itemClock, say: 'A circle' },
      { emoji: '\u{1F7E6}', img: itemWindow, say: 'A square' },
    ],
  },
  /* Extra time (blueprint §3b): use if there are minutes left; Next skips. */
  {
    id: 'u2l6-brain-break', kind: 'tpr-actions', mode: 'break', bg: bgU2L6Rainbow, who: 'pip',
    teacher: 'Extra time: Brain Break! Stand up and move with Pip.',
    rounds: [
      { line: 'Roll like a red ball!', emoji: '\u{1F534}' },
      { line: 'Hop like a green frog!', emoji: '\u{1F438}' },
      { line: 'Swim like a blue fish!', emoji: '\u{1F41F}' },
      { line: 'Shine like a yellow sun!', emoji: '\u{2600}\u{FE0F}' },
      { line: 'Freeze!', emoji: '\u{1F976}', seconds: 3 },
    ],
  },
  {
    // Extra time E2: Stepping Stones again with Bella and new stones.
    id: 'u2l6-stones-2', kind: 'stepping-stones', bg: bgU2L6River, bgVideo: loopU2L6('river'), riverPainted: true, stoneImg: itemStone, who: 'bella', walker: 'bella',
    teacher: 'Extra time: Help Bella cross the river! Listen and tap the stone.',
    rounds: [
      { line: 'Jump on the red square!', answer: 2, reply: 'A red square! Hop!', options: [{ label: 'red circle', shape: 'circle', colorHex: C4.RED }, { label: 'blue square', shape: 'square', colorHex: C4.BLUE }, { label: 'red square', shape: 'square', colorHex: C4.RED }] },
      { line: 'Jump on the yellow circle!', answer: 0, reply: 'A yellow circle! Hop!', options: [{ label: 'yellow circle', shape: 'circle', colorHex: C4.YELLOW }, { label: 'yellow triangle', shape: 'triangle', colorHex: C4.YELLOW }, { label: 'green circle', shape: 'circle', colorHex: C4.GREEN }] },
      { line: 'Jump on the purple triangle!', answer: 1, reply: 'A purple triangle! Hop!', options: [{ label: 'orange triangle', shape: 'triangle', colorHex: C4.ORANGE }, { label: 'purple triangle', shape: 'triangle', colorHex: C4.PURPLE }, { label: 'purple square', shape: 'square', colorHex: C4.PURPLE }] },
    ],
    goal: { img: itemRainbow, label: 'rainbow', line: 'Bella is over the river! A rainbow!' },
  },
  {
    // Extra time E3: Image Reveal with new pictures.
    id: 'u2l6-reveal-2', kind: 'tile-reveal', bg: bgU2L6Garden, bgVideo: loopU2L6('garden'), who: 'willow',
    teacher: 'Extra time: What is it? Guess early and say it with its color!',
    rounds: [
      { img: itemApple, word: 'apple', line: "It's a red apple!", options: [{ label: 'apple', img: itemApple }, { label: 'balloon', img: itemBalloonRed }, { label: 'carrot', img: itemCarrot }] },
      { img: itemSun, word: 'sun', line: "It's a yellow sun!", options: [{ label: 'cookie', img: itemCookie }, { label: 'sun', img: itemSun }, { label: 'pumpkin', img: itemPumpkin }] },
      { img: itemWater, word: 'water', line: "It's blue water!", options: [{ label: 'grapes', img: itemGrapes }, { label: 'leaf', img: itemLeaf }, { label: 'water', img: itemWater }] },
    ],
  },
  {
    id: 'u2l6-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F3C6} Rainbow Goodbye Song \u{1F3C6}', teacher: 'You finished the unit! Wave goodbye and sing together.',
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
  { id: 'u2l6-finale', kind: 'finale', bg: bgU2L6Rainbow, who: 'pip', line: 'You found the Rainbow Treasure! Six colors and three shapes. You are a color and shape champion!' },
];

/* =============================================================================
 * Pre-A1 Unit 3, Lesson 1 — "Ball, Car, Doll!" (Toys & Playtime opens)
 *
 * REBUILD (2026-10-03) to the Unit 2 standard, replacing a version with
 * reading tasks (fill the first letter, text-only flipbook) and runs of
 * three identical games in a row (three dashes, three role-plays).
 * Pre-A1 children can't read: everything is heard, tapped, built or said.
 *
 * Target language: ball, car, doll + a colour from Unit 2 straight away
 * ("It's a red ball!"), "I like … / I don't like …", "What's in the bag?",
 * Unit 2 Lesson 5's "I want …, please. — Here you are! — Thank you!" again
 * in a toy shop, and D says /d/ (doll, dog, duck, door). B and C were taught
 * earlier and are only heard again.
 * Cast: Bella = red ball, Willow = blue car, Mia = green doll; Pip hosts.
 *
 * Frame: Pip's playroom and toy box. A short film ("Pip's Toy Box") shows the
 * three toys coming out of the box; the toy shop at the end puts the words to
 * use. Signature game: the Mystery Bag (ESL "feely bag": guess the toy from
 * its silhouette, then say it with its colour). Shape Builders from Unit 2
 * become a toy workshop (build a car from shapes).
 * Art: 8 new wide pictures (bg-u3l1-*-wide) + single-colour toy stickers;
 * film public/lep1/video/toybox-story-u3l1.mp4/.webm.
 * ========================================================================= */

const bgU3L1DashArena = `${A}/scenes/bg-u3l1-dash-arena.png`;
const itemCar = `${A}/items/item-car.png`;
const itemDoll = `${A}/items/item-doll.png`;
const bgU3L1Playroom = `${A}/scenes/bg-u3l1-playroom-wide.png`;
const bgU3L1Toybox = `${A}/scenes/bg-u3l1-toybox-wide.png`;
const bgU3L1Ball = `${A}/scenes/bg-u3l1-ball-wide.png`;
const bgU3L1Car = `${A}/scenes/bg-u3l1-car-wide.png`;
const bgU3L1Doll = `${A}/scenes/bg-u3l1-doll-wide.png`;
const bgU3L1Play = `${A}/scenes/bg-u3l1-play-wide.png`;
const bgU3L1Shop = `${A}/scenes/bg-u3l1-shop-wide.png`;
const bgU3L1Shelf = `${A}/scenes/bg-u3l1-shelf-wide.png`;
const bgU3L1Room = `${A}/scenes/bg-u3l1-room-empty-wide.png`;
const itemBallRed = `${A}/items/item-ball-red.png`;
const itemBallBlue = `${A}/items/item-ball-blue.png`;
const itemBallYellow = `${A}/items/item-ball-yellow.png`;
const itemCarRed = `${A}/items/item-car-red.png`;
const itemCarGreen = `${A}/items/item-car-green.png`;
const itemDollPurple = `${A}/items/item-doll-purple.png`;
const itemDollYellow = `${A}/items/item-doll-yellow.png`;
const itemDog = `${A}/items/item-dog.png`;
const itemDoor = `${A}/items/item-door.png`;
const itemDuck = `${A}/items/item-duck-yellow.png`;

export const LESSON_U3L1_TITLE = 'Ball, Car, Doll!';
export const LESSON_U3L1_OBJECTIVE = 'Name the toys ball, car and doll with a colour ("It\'s a red ball!"), say what you like ("I like blue cars! I don\'t like dolls!"), ask for a toy in a shop ("I want a red ball, please!"), and hear D say /d/ (doll, dog, duck, door) — all by listening, tapping and speaking, no reading.';

const bagOptions = [
  { toyWord: 'BALL', img: itemBallRed },
  { toyWord: 'CAR', img: itemCar },
  { toyWord: 'DOLL', img: itemDoll },
];

export const LESSON_U3L1_SCENES: Scene[] = [
  { id: 'u3l1-title', kind: 'title-card', bg: bgU3L1Playroom, level: 'Pre-A1', unit: 'Unit 3', lessonLabel: 'Lesson 1', title: 'Ball, Car, Doll!', subtitle: "Pip's Toy Box" },

  {
    id: 'u3l1-hello-song', kind: 'song', bg: bgHelloCast, title: '\u{1F44B} Hello Song \u{1F44B}', teacher: 'A new unit! Warm up with Pip: sing and wave on every "hello".',
    durationSeconds: 20, bigWord: 'Hello', songUrl: `${A}/audio/hello-song.mp3?v=2`,
    lineDurationsMs: [5200, 4300, 4500, 6100],
    songPrompt: 'Cheerful upbeat kids hello song',
    lyrics: [
      { who: 'pip', text: '\u{1F44B} Hello, hello, hello my friend!', emotion: 'happy' },
      { who: 'pip', text: '\u{1F333} Come with me, the fun begins!', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44F} Clap your hands and wave up high', emotion: 'happy' },
      { who: 'pip', text: '\u{1F495} Hello, hello, hi hi hi!', emotion: 'happy' },
    ],
  },
  {
    id: 'u3l1-intro', kind: 'cinematic', bg: bgU3L1Toybox, hidePipOverlay: true, title: "Pip's Toy Box", subtitle: 'What is inside?', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Welcome to my playroom!' },
      { who: 'pip', line: "Look! My toy box! What's inside? Let's see!" },
    ],
    cta: 'Open it!',
  },

  /* ---- New words ---- */
  {
    id: 'u3l1-vocab-toys', kind: 'toy-model', bg: bgU3L1Room,
    teacher: 'Tap a toy to hear it, say it back, then say the color too: "It\'s a red ball!"',
    items: [
      { toyWord: 'BALL', colorWord: 'RED', colorHex: C4.RED, who: 'bella', img: itemBallRed },
      { toyWord: 'CAR', colorWord: 'BLUE', colorHex: C4.BLUE, who: 'willow', img: itemCar },
      { toyWord: 'DOLL', colorWord: 'GREEN', colorHex: C4.GREEN, who: 'mia', img: itemDoll },
    ],
  },
  {
    // The story as a short film: the toys come out of the box.
    id: 'u3l1-story-video', kind: 'story-video', bg: bgU3L1Toybox, videoUrl: `${A}/video/toybox-story-u3l1.mp4?v=1`, title: "Pip's Toy Box",
    teacher: 'Watch together. Say each toy with the friends; answer the picture questions.',
    pages: [
      { img: bgU3L1Toybox, who: 'pip', line: "What's in the toy box? Let's see!", motion: 'zoom-in', fx: 'sparkles', atSec: 0 },
      { img: bgU3L1Ball, who: 'bella', line: "A ball! It's a red ball!", motion: 'pan-right', fx: 'sparkles', atSec: 5 },
      { img: bgU3L1Car, who: 'willow', line: "A car! It's a blue car!", motion: 'pan-left', fx: 'sparkles', atSec: 10 },
      { img: bgU3L1Doll, who: 'mia', line: "A doll! It's a green doll!", motion: 'pan-right', fx: 'hearts', atSec: 15 },
      { img: bgU3L1Play, who: 'pip', line: "Let's play! I like toys!", motion: 'zoom-out', fx: 'sparkles', atSec: 20 },
    ],
    checkpoints: [
      { afterPage: 1, who: 'bella', question: 'What color is the ball?', answer: 'Red', options: [{ label: 'Blue', colorHex: C4.BLUE }, { label: 'Red', colorHex: C4.RED }, { label: 'Yellow', colorHex: C4.YELLOW }] },
      { afterPage: 3, who: 'mia', question: 'What does Mia have?', answer: 'A doll', options: [{ label: 'A car', img: itemCar }, { label: 'A ball', img: itemBallRed }, { label: 'A doll', img: itemDoll }] },
    ],
  },
  {
    // Signature game: guess the toy from its silhouette, then say it with its colour.
    id: 'u3l1-mystery-bag', kind: 'mystery-bag', bg: bgU3L1Toybox, who: 'pip',
    teacher: "The Mystery Bag! Look at the shape. What's in the bag? Tap it, then say it with its color.",
    rounds: [
      { img: itemBallRed, toyWord: 'BALL', colorWord: 'RED', colorHex: C4.RED, options: bagOptions },
      { img: itemCar, toyWord: 'CAR', colorWord: 'BLUE', colorHex: C4.BLUE, options: bagOptions },
      { img: itemDoll, toyWord: 'DOLL', colorWord: 'GREEN', colorHex: C4.GREEN, options: bagOptions },
      { img: itemBallYellow, toyWord: 'BALL', colorWord: 'YELLOW', colorHex: C4.YELLOW, options: bagOptions },
      { img: itemDollPurple, toyWord: 'DOLL', colorWord: 'PURPLE', colorHex: C4.PURPLE, options: bagOptions },
      { img: itemCarRed, toyWord: 'CAR', colorWord: 'RED', colorHex: C4.RED, options: bagOptions },
    ],
  },
  {
    id: 'u3l1-i-like', kind: 'listen-repeat-cards', bg: bgU3L1Play, teacher: 'What do the friends like? Listen, then say it. Show thumbs up or down!',
    cards: [
      { who: 'bella', sentence: 'I like red balls!', img: itemBallRed, imgLabel: 'Red ball \u{1F44D}' },
      { who: 'willow', sentence: 'I like blue cars!', img: itemCar, imgLabel: 'Blue car \u{1F44D}' },
      { who: 'mia', sentence: 'I like dolls!', img: itemDoll, imgLabel: 'Doll \u{1F44D}' },
      { who: 'leo', sentence: "I don't like dolls!", img: itemDollYellow, imgLabel: 'Doll \u{1F44E}' },
    ],
  },

  /* ---- The sound: D ---- */
  {
    id: 'u3l1-model-d', kind: 'sound-model', bg: bgU3L1Room, who: 'mia', letter: 'D', phoneme: '/d/', sound: 'duh',
    teacher: 'D says /d/ — like doll! Doll, dog, duck!',
    anchors: [
      { word: 'doll', emoji: '\u{1FA86}', img: itemDoll },
      { word: 'dog', emoji: '\u{1F436}', img: itemDog },
      { word: 'duck', emoji: '\u{1F986}', img: itemDuck },
    ],
  },
  { id: 'u3l1-trace-d', kind: 'trace', bg: bgU3L1Room, who: 'mia', letter: 'D', phoneme: '/d/', word: 'doll', teacher: 'Trace the D! /d/ /d/ doll!' },

  /* ---- Practice games ---- */
  {
    id: 'u3l1-sort-toys', kind: 'color-sort', bg: bgU3L1Room, teacher: 'Tidy up! Put each toy in its box: balls, cars, dolls. Say each one!',
    targets: [
      { colorWord: 'BALL', colorHex: C4.RED, who: 'bella' },
      { colorWord: 'CAR', colorHex: C4.BLUE, who: 'willow' },
      { colorWord: 'DOLL', colorHex: C4.GREEN, who: 'mia' },
    ],
    items: [
      { word: 'ball', img: itemBallBlue, emoji: '\u{26BD}', colorWord: 'BALL' },
      { word: 'car', img: itemCarGreen, emoji: '\u{1F697}', colorWord: 'CAR' },
      { word: 'doll', img: itemDollPurple, emoji: '\u{1FA86}', colorWord: 'DOLL' },
      { word: 'ball', img: itemBallYellow, emoji: '\u{26BD}', colorWord: 'BALL' },
      { word: 'car', img: itemCarRed, emoji: '\u{1F697}', colorWord: 'CAR' },
      { word: 'doll', img: itemDollYellow, emoji: '\u{1FA86}', colorWord: 'DOLL' },
    ],
  },
  {
    id: 'u3l1-odd-one-out', kind: 'odd-one-out', bg: bgU3L1Ball, who: 'bella',
    teacher: 'Which one is different? Tap it, then say why.',
    rounds: [
      { items: [{ label: 'red ball', img: itemBallRed }, { label: 'blue ball', img: itemBallBlue }, { label: 'red car', img: itemCarRed }, { label: 'yellow ball', img: itemBallYellow }], odd: 2, line: "It's a car! The others are balls." },
      { items: [{ label: 'green doll', img: itemDoll }, { label: 'blue ball', img: itemBallBlue }, { label: 'purple doll', img: itemDollPurple }, { label: 'yellow doll', img: itemDollYellow }], odd: 1, line: "It's a ball! The others are dolls." },
      { items: [{ label: 'red car', img: itemCarRed }, { label: 'red ball', img: itemBallRed }, { label: 'blue car', img: itemCar }, { label: 'red balloon', img: itemBalloonRed }], odd: 2, line: "It's blue! The others are red." },
      { items: [{ label: 'blue car', img: itemCar }, { label: 'green car', img: itemCarGreen }, { label: 'purple doll', img: itemDollPurple }, { label: 'red car', img: itemCarRed }], odd: 2, line: "It's a doll! The others are cars." },
    ],
  },
  {
    // Badges sit on the toys painted on bg-u3l1-shelf-wide (checked against the art).
    id: 'u3l1-spin', kind: 'spin-wheel', bg: bgU3L1Shelf, title: 'Spin and say!',
    teacher: 'Have the student spin the wheel and say the toy with its color: "It\'s a red ball!" If you prefer, tap a number instead.',
    items: [
      { label: "It's a red ball!", left: '24.5%', top: '15%' },
      { label: "It's a blue car!", left: '50%', top: '17%' },
      { label: "It's a green doll!", left: '76%', top: '15%' },
      { label: "It's a yellow ball!", left: '24.5%', top: '43%' },
      { label: "It's a purple doll!", left: '50%', top: '42%' },
      { label: "It's an orange car!", left: '76%', top: '45%' },
    ],
    // The wheel sits on the bottom shelf (its toys aren't used here), clear of every badge.
    wheelAt: { left: '50%', top: '83%' },
  },
  {
    id: 'u3l1-dash-d', kind: 'dash', bg: bgU3L1DashArena, teacher: 'Mia Dash! Tap only the /d/ words: doll, dog, duck, door. Get 6!', who: 'mia', targetLetter: 'D', targetPhoneme: '/d/', goal: 6, seconds: 40,
    items: [
      { word: 'doll', letter: 'D', img: itemDoll, emoji: '\u{1FA86}' },
      { word: 'dog', letter: 'D', img: itemDog, emoji: '\u{1F436}' },
      { word: 'duck', letter: 'D', img: itemDuck, emoji: '\u{1F986}' },
      { word: 'door', letter: 'D', img: itemDoor, emoji: '\u{1F6AA}' },
      { word: 'ball', letter: 'B', img: itemBallRed, emoji: '\u{26BD}' },
      { word: 'car', letter: 'C', img: itemCar, emoji: '\u{1F697}' },
      { word: 'cat', letter: 'C', img: itemCat, emoji: '\u{1F431}' },
    ],
  },
  {
    // Unit 2's Shape Builders as a toy workshop.
    id: 'u3l1-toy-workshop', kind: 'shape-builder', bg: bgU2L3Builder, who: 'pip',
    teacher: 'The toy workshop! Build a toy: name each shape, then pick the color you hear.',
    rounds: [
      {
        who: 'willow', label: 'Car', intro: "Let's build a car!", line: "It's a car!", alive: 'bounce',
        pieces: [
          { shape: 'square', colorWord: 'BLUE', colorHex: C4.BLUE, x: 18, y: 28, w: 58, h: 18 },
          { shape: 'square', colorWord: 'YELLOW', colorHex: C4.YELLOW, x: 32, y: 12, w: 28, h: 16 },
          { shape: 'circle', colorWord: 'RED', colorHex: C4.RED, x: 22, y: 42, w: 16, h: 16 },
          { shape: 'circle', colorWord: 'RED', colorHex: C4.RED, x: 56, y: 42, w: 16, h: 16 },
        ],
      },
      {
        who: 'mia', label: 'Doll', intro: "Let's build a doll!", line: "It's a doll!", alive: 'wiggle',
        pieces: [
          { shape: 'circle', colorWord: 'ORANGE', colorHex: C4.ORANGE, x: 40, y: 4, w: 18, h: 18 },
          { shape: 'triangle', colorWord: 'PURPLE', colorHex: C4.PURPLE, x: 30, y: 22, w: 38, h: 36 },
        ],
      },
    ],
  },
  {
    id: 'u3l1-my-toy', kind: 'join-stage', bg: bgU3L1Play, teacher: 'Show a real toy from home! Answer Pip.', cast: ['pip', 'bella', 'willow'],
    turns: [
      { who: 'pip', line: 'Show me a toy! What is it?', bubble: 'right' },
      { who: 'student', line: "It's a … ! (show it)", bubble: 'right' },
      { who: 'bella', line: 'What color is it?', bubble: 'right' },
      { who: 'student', line: "It's … !", bubble: 'right' },
      { who: 'willow', line: 'Do you like cars?', bubble: 'right' },
      { who: 'student', line: "I like cars! / I don't like cars!", bubble: 'right' },
    ],
  },
  {
    id: 'u3l1-memory', kind: 'memory', bg: bgU3L1Room, teacher: 'Find the pairs! Say each one: "A red ball!"',
    pairs: [
      { id: 'ball', label: 'Red ball', emoji: '\u{26BD}', img: itemBallRed },
      { id: 'car', label: 'Blue car', emoji: '\u{1F697}', img: itemCar },
      { id: 'doll', label: 'Green doll', emoji: '\u{1FA86}', img: itemDoll },
      { id: 'dog', label: 'Dog', emoji: '\u{1F436}', img: itemDog },
      { id: 'duck', label: 'Duck', emoji: '\u{1F986}', img: itemDuck },
      { id: 'door', label: 'Door', emoji: '\u{1F6AA}', img: itemDoor },
    ],
  },
  {
    // Unit 2 Lesson 5's "I want …, please" in a new place: the toy shop.
    id: 'u3l1-toy-shop', kind: 'join-stage', bg: bgU3L1Shop, teacher: 'The toy shop! Pip sells toys. Ask for a toy with its color, then say thank you.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'Hello! Welcome to my toy shop! What do you want?', bubble: 'right' },
      { who: 'student', line: 'I want a red ball, please!', bubble: 'right' },
      { who: 'pip', line: 'Here you are! A red ball!', bubble: 'right' },
      { who: 'student', line: 'Thank you!', bubble: 'right' },
      { who: 'pip', line: 'What color car do you want?', bubble: 'right' },
      { who: 'student', line: 'I want a … car, please!', bubble: 'right' },
    ],
  },

  {
    id: 'u3l1-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to the toys! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3580, 4020, 4980, 7482],
    songPrompt: 'Cheerful upbeat kids goodbye song',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'leo', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'mia', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'u3l1-finale', kind: 'finale', bg: bgU3L1Play, who: 'pip', line: 'A red ball, a blue car, a green doll. You know the toys! Bye bye!' },
];

/* =============================================================================
 * Pre-A1 Unit 3, Lesson 2 — "Teddy Bear, Blocks, Train!" (Leo's Birthday)
 *
 * REBUILD (2026-10-03) as the flagship of the Universal Playground Lesson
 * Blueprint (docs/playground-lesson-blueprint.md): the 22-slide arc plus the
 * Extra-time block (brain break + 2 bonus games). Replaces a version with a
 * text storybook and runs of identical games (three role-plays in a row).
 * Pre-A1 = non-readers: every prompt is spoken, every answer is a picture,
 * an action or speech.
 *
 * Target language (6 words, each met 5+ times): teddy bear, blocks, train
 * (new) + ball, car, doll (Lesson 1). Implicit grammar: ONE or MANY —
 * "It's a train!" / "They are blocks!" / "What is it? — What are they?".
 * Phonics micro-moment: T (teddy, train, ten), taught in Unit 1.
 * Story spine: Leo's birthday — three presents (film 1), then the party where
 * everyone plays with them (film 2). Cast: Leo = teddy bear, Bella = blocks,
 * Willow = train.
 *
 * Research behind the new pieces (mechanics only): Khan Academy Kids
 * (collectibles → Sticker Book), Oxford Toy Team / Everybody Up and Novakid
 * (TPR → Move & Say, brain break), ESL toy lessons (feely box → Mystery Bag;
 * "What are these? — They're bears" → one vs many), the blueprint's quick-fire
 * flashcards and Home Mission. Look: clay cards (shared CLAY_CARD).
 * Art: 6 wide pictures (bg-u3l2-*-wide) + "many" stickers; two films.
 * ========================================================================= */

const itemTeddy = `${A}/items/item-teddy.png`;
const itemBlocks = `${A}/items/item-blocks.png`;
const itemTrain = `${A}/items/item-train.png`;
const bgU3L2Party = `${A}/scenes/bg-u3l2-party-wide.png`;
const bgU3L2Teddy = `${A}/scenes/bg-u3l2-teddy-wide.png`;
const bgU3L2Blocks = `${A}/scenes/bg-u3l2-blocks-wide.png`;
const bgU3L2Train = `${A}/scenes/bg-u3l2-train-wide.png`;
const bgU3L2Cake = `${A}/scenes/bg-u3l2-cake-wide.png`;
const bgU3L2Shelf = `${A}/scenes/bg-u3l2-shelf-wide.png`;
const itemTeddies = `${A}/items/item-teddies.png`;
const itemTrains = `${A}/items/item-trains.png`;
const itemBalls = `${A}/items/item-balls.png`;
const itemCars = `${A}/items/item-cars.png`;
const itemDolls = `${A}/items/item-dolls.png`;

export const LESSON_U3L2_TITLE = 'Teddy Bear, Blocks, Train!';
export const LESSON_U3L2_OBJECTIVE = 'Name teddy bear, blocks and train (and recycle ball, car, doll), tell ONE from MANY — "It\'s a train!" / "They are blocks!" — ask "What is it? / What are they?", hear T (teddy, train, ten), and take the words home in a Home Mission — all by listening, moving, tapping and speaking.';

const bagToys = [
  { toyWord: 'TRAIN', img: itemTrain },
  { toyWord: 'BALL', img: itemBallRed },
  { toyWord: 'CAR', img: itemCar },
  { toyWord: 'DOLL', img: itemDoll },
];

export const LESSON_U3L2_SCENES: Scene[] = [
  { id: 'u3l2-title', kind: 'title-card', bg: bgU3L2Party, level: 'Pre-A1', unit: 'Unit 3', lessonLabel: 'Lesson 2', title: 'Teddy Bear, Blocks, Train!', subtitle: "Leo's Birthday" },

  /* 1-3 Hook + story opener */
  {
    id: 'u3l2-hello-song', kind: 'song', bg: bgHelloCast, title: '\u{1F44B} Hello Song \u{1F44B}', teacher: 'Stand up! Sing, clap and wave on every "hello".',
    durationSeconds: 20, bigWord: 'Hello', songUrl: `${A}/audio/hello-song.mp3?v=2`,
    lineDurationsMs: [5200, 4300, 4500, 6100],
    songPrompt: 'Cheerful upbeat kids hello song',
    lyrics: [
      { who: 'pip', text: '\u{1F44B} Hello, hello, hello my friend!', emotion: 'happy' },
      { who: 'pip', text: '\u{1F333} Come with me, the fun begins!', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44F} Clap your hands and wave up high', emotion: 'happy' },
      { who: 'pip', text: '\u{1F495} Hello, hello, hi hi hi!', emotion: 'happy' },
    ],
  },
  {
    id: 'u3l2-intro', kind: 'cinematic', bg: bgU3L2Party, hidePipOverlay: true, title: "Leo's Birthday", subtitle: 'Three presents!', narrator: 'leo',
    script: [
      { who: 'leo', line: "Hello! It's my birthday today!" },
      { who: 'pip', line: "Look! Three presents! What's inside?" },
    ],
    cta: "Let's see!",
  },
  {
    id: 'u3l2-story-presents', kind: 'story-video', bg: bgU3L2Party, videoUrl: `${A}/video/presents-story-u3l2.mp4?v=1`, title: "Leo's Presents",
    teacher: 'Watch together. Say each present with Leo; answer the picture questions.',
    pages: [
      { img: bgU3L2Party, who: 'leo', line: "It's my birthday! Look, three presents!", motion: 'zoom-in', fx: 'sparkles', atSec: 0 },
      { img: bgU3L2Teddy, who: 'leo', line: "A teddy bear! It's a teddy bear!", motion: 'pan-right', fx: 'hearts', atSec: 5 },
      { img: bgU3L2Blocks, who: 'bella', line: 'Blocks! They are blocks!', motion: 'pan-left', fx: 'sparkles', atSec: 10 },
      { img: bgU3L2Train, who: 'willow', line: "A train! It's a train! Choo choo!", motion: 'pan-right', fx: 'sparkles', atSec: 15 },
    ],
    checkpoints: [
      { afterPage: 1, who: 'leo', question: 'What is it?', answer: 'A teddy bear', options: [{ label: 'A ball', img: itemBallRed }, { label: 'A teddy bear', img: itemTeddy }, { label: 'A car', img: itemCar }] },
      { afterPage: 2, who: 'bella', question: 'What are they?', answer: 'Blocks', options: [{ label: 'Blocks', img: itemBlocks }, { label: 'Dolls', img: itemDolls }, { label: 'Cars', img: itemCars }] },
    ],
  },

  /* 4-6 Input: words, move & say, reveal game */
  {
    id: 'u3l2-vocab-toys', kind: 'toy-model', bg: bgU3L1Room,
    teacher: 'Tap a present to hear it, then say it: "It\'s a teddy bear!"',
    items: [
      { toyWord: 'TEDDY BEAR', colorWord: 'BROWN', colorHex: '#92400E', who: 'leo', img: itemTeddy },
      { toyWord: 'BLOCKS', colorWord: 'BLUE', colorHex: C4.BLUE, who: 'bella', img: itemBlocks, plural: true },
      { toyWord: 'TRAIN', colorWord: 'RED', colorHex: C4.RED, who: 'willow', img: itemTrain },
    ],
  },
  {
    id: 'u3l2-move-say', kind: 'tpr-actions', bg: bgU3L1Room, who: 'leo',
    teacher: 'Move and say! Do each action with the child and say the toy.',
    rounds: [
      { line: 'Hug the teddy bear!', emoji: '\u{1F917}', img: itemTeddy },
      { line: 'Build the blocks!', emoji: '\u{1F64C}', img: itemBlocks },
      { line: 'Drive the train! Choo choo!', emoji: '\u{1F682}', img: itemTrain },
      { line: 'Bounce the ball!', emoji: '\u{1F3C0}', img: itemBallRed },
      { line: 'Rock the doll!', emoji: '\u{1F476}', img: itemDoll },
    ],
  },
  {
    id: 'u3l2-mystery-bag', kind: 'mystery-bag', bg: bgU3L1Toybox, who: 'pip',
    teacher: "The Mystery Bag is back! What's in the bag? Tap it, then say it with its color.",
    rounds: [
      { img: itemTrain, toyWord: 'TRAIN', colorWord: 'RED', colorHex: C4.RED, options: bagToys },
      { img: itemBallYellow, toyWord: 'BALL', colorWord: 'YELLOW', colorHex: C4.YELLOW, options: bagToys },
      { img: itemCarGreen, toyWord: 'CAR', colorWord: 'GREEN', colorHex: C4.GREEN, options: bagToys },
      { img: itemDollPurple, toyWord: 'DOLL', colorWord: 'PURPLE', colorHex: C4.PURPLE, options: bagToys },
    ],
  },

  /* 7-9 Controlled practice: one or many */
  {
    // Implicit grammar model: each card is ONE picture for ONE chunk.
    id: 'u3l2-one-many', kind: 'listen-repeat-cards', bg: bgU3L2Cake, teacher: 'One or many? Listen, show one finger or two hands, and repeat!',
    cards: [
      { who: 'leo', sentence: "It's a teddy bear!", img: itemTeddy, imgLabel: '☝️ One' },
      { who: 'leo', sentence: 'They are teddy bears!', img: itemTeddies, imgLabel: '🙌 Many' },
      { who: 'willow', sentence: "It's a train!", img: itemTrain, imgLabel: '☝️ One' },
      { who: 'willow', sentence: 'They are trains!', img: itemTrains, imgLabel: '🙌 Many' },
      { who: 'bella', sentence: 'They are blocks!', img: itemBlocks, imgLabel: '🙌 Many' },
    ],
  },
  {
    id: 'u3l2-plural-sort', kind: 'plural-sort', bg: bgU3L1Room, who: 'pip',
    teacher: 'One or many? Drag each picture: one finger (It is) or two hands (They are).',
    items: [
      { word: 'teddy bear', img: itemTeddy, emoji: '\u{1F9F8}', plural: false },
      { word: 'teddy bears', img: itemTeddies, emoji: '\u{1F9F8}', plural: true, group: true },
      { word: 'train', img: itemTrain, emoji: '\u{1F682}', plural: false },
      { word: 'trains', img: itemTrains, emoji: '\u{1F682}', plural: true, group: true },
      { word: 'blocks', img: itemBlocks, emoji: '\u{1F9F1}', plural: true, group: true },
      { word: 'car', img: itemCar, emoji: '\u{1F697}', plural: false },
      { word: 'cars', img: itemCars, emoji: '\u{1F697}', plural: true, group: true },
      { word: 'balls', img: itemBalls, emoji: '\u{26BD}', plural: true, group: true },
    ],
  },
  {
    // Badges on the toys painted on bg-u3l2-shelf-wide (checked against the art).
    id: 'u3l2-spin', kind: 'spin-wheel', bg: bgU3L2Shelf, title: '',
    teacher: 'Have the student spin and say ONE or MANY: "It\'s a train!" / "They are teddy bears!" Or tap a number.',
    items: [
      { label: "It's a teddy bear!", left: '13%', top: '47%' },
      { label: 'They are teddy bears!', left: '39%', top: '47%' },
      { label: "It's a train!", left: '69%', top: '47%' },
      { label: 'They are blocks!', left: '14%', top: '84%' },
      { label: "It's a ball!", left: '45%', top: '84%' },
      { label: 'They are balls!', left: '69%', top: '84%' },
    ],
    // Wheel on the plain wall above the shelf, clear of the badges.
    wheelAt: { left: '50%', top: '20%' },
  },

  /* 10-13 Communicative + game break */
  {
    id: 'u3l2-leo-asks', kind: 'join-stage', bg: bgU3L2Teddy, teacher: 'Leo asks about his presents. Answer him!', cast: ['leo', 'bella', 'willow'],
    turns: [
      { who: 'leo', line: 'What is it?', bg: bgU3L2Teddy, bubble: 'right' },
      { who: 'student', line: "It's a teddy bear!", bg: bgU3L2Teddy, bubble: 'right' },
      { who: 'bella', line: 'What are they?', bg: bgU3L2Blocks, bubble: 'right' },
      { who: 'student', line: 'They are blocks!', bg: bgU3L2Blocks, bubble: 'right' },
      { who: 'willow', line: 'What is it?', bg: bgU3L2Train, bubble: 'right' },
      { who: 'student', line: "It's a train!", bg: bgU3L2Train, bubble: 'right' },
    ],
  },
  {
    id: 'u3l2-you-ask', kind: 'join-stage', bg: bgU3L2Party, teacher: 'Swap! Now YOU ask Leo. Point and ask: What is it? What are they?', cast: ['leo'],
    turns: [
      { who: 'student', line: 'Ask Leo: What are they?', bg: bgU3L2Blocks, bubble: 'right' },
      { who: 'leo', line: 'They are blocks!', bg: bgU3L2Blocks, bubble: 'right' },
      { who: 'student', line: 'Ask Leo: What is it?', bg: bgU3L2Train, bubble: 'right' },
      { who: 'leo', line: "It's a train! Choo choo!", bg: bgU3L2Train, bubble: 'right' },
    ],
  },
  {
    id: 'u3l2-memory', kind: 'memory', bg: bgU3L1Room, teacher: 'Find the pairs! Say one or many: "They are trains!"',
    pairs: [
      { id: 'teddy', label: 'Teddy bear', emoji: '\u{1F9F8}', img: itemTeddy },
      { id: 'teddies', label: 'Teddy bears', emoji: '\u{1F9F8}', img: itemTeddies },
      { id: 'train', label: 'Train', emoji: '\u{1F682}', img: itemTrain },
      { id: 'trains', label: 'Trains', emoji: '\u{1F682}', img: itemTrains },
      { id: 'blocks', label: 'Blocks', emoji: '\u{1F9F1}', img: itemBlocks },
      { id: 'balls', label: 'Balls', emoji: '\u{26BD}', img: itemBalls },
    ],
  },
  {
    id: 'u3l2-train-recall', kind: 'train-recall', bg: bgU3L1Room, teacher: "All aboard Willow's train! Remember the toy in each car.",
    cars: [
      { word: 'TEDDY BEAR', img: itemTeddy, emoji: '\u{1F9F8}' },
      { word: 'BLOCKS', img: itemBlocks, emoji: '\u{1F9F1}' },
      { word: 'BALL', img: itemBallRed, emoji: '\u{26BD}' },
      { word: 'CAR', img: itemCar, emoji: '\u{1F697}' },
      { word: 'DOLL', img: itemDoll, emoji: '\u{1FA86}' },
    ],
  },

  /* 14-16 Phonics, quick-fire, story payoff */
  {
    id: 'u3l2-model-t', kind: 'sound-model', bg: bgU3L1Room, who: 'leo', letter: 'T', phoneme: '/t/', sound: 'tuh',
    teacher: 'T says /t/ — teddy, train, ten!',
    anchors: [
      { word: 'teddy', emoji: '\u{1F9F8}', img: itemTeddy },
      { word: 'train', emoji: '\u{1F682}', img: itemTrain },
      { word: 'ten', emoji: '\u{1F51F}', img: itemTen },
    ],
  },
  {
    id: 'u3l2-quick-fire', kind: 'rapid-recall', bg: bgU3L1Room, who: 'pip', seconds: 3,
    teacher: 'Quick-fire! Say each picture before the ring runs out.',
    cards: [
      { img: itemTeddy, word: 'Teddy bear', say: "It's a teddy bear!" },
      { img: itemBlocks, word: 'Blocks', say: 'They are blocks!' },
      { img: itemTrain, word: 'Train', say: "It's a train!" },
      { img: itemBalls, word: 'Balls', say: 'They are balls!' },
      { img: itemCar, word: 'Car', say: "It's a car!" },
      { img: itemDolls, word: 'Dolls', say: 'They are dolls!' },
    ],
  },
  {
    id: 'u3l2-story-party', kind: 'story-video', bg: bgU3L2Cake, videoUrl: `${A}/video/party-story-u3l2.mp4?v=1`, title: "Leo's Party",
    teacher: 'The story ends! Watch, say the toys, answer the questions.',
    pages: [
      { img: bgU3L2Cake, who: 'pip', line: "Happy birthday, Leo! Let's play!", motion: 'zoom-in', fx: 'sparkles', atSec: 0 },
      { img: bgU3L2Blocks, who: 'bella', line: 'Bella builds a big tower. They are blocks!', motion: 'pan-right', fx: 'sparkles', atSec: 5 },
      { img: bgU3L2Train, who: 'willow', line: 'The train goes round and round. Choo choo!', motion: 'pan-left', fx: 'sparkles', atSec: 10 },
      { img: bgU3L2Teddy, who: 'leo', line: "Leo loves his teddy bear. It's a teddy bear!", motion: 'zoom-in', fx: 'hearts', atSec: 15 },
      { img: bgU3L2Cake, who: 'leo', line: 'Thank you, friends! I love my presents!', motion: 'zoom-out', fx: 'hearts', atSec: 20 },
    ],
    checkpoints: [
      { afterPage: 1, who: 'bella', question: 'What are they?', answer: 'Blocks', options: [{ label: 'Teddy bears', img: itemTeddies }, { label: 'Blocks', img: itemBlocks }, { label: 'Trains', img: itemTrains }] },
      { afterPage: 3, who: 'leo', question: 'What does Leo love?', answer: 'His teddy bear', options: [{ label: 'His teddy bear', img: itemTeddy }, { label: 'A ball', img: itemBallRed }, { label: 'A doll', img: itemDoll }] },
    ],
  },

  /* 17-20 Check, personal, reward, home mission */
  {
    id: 'u3l2-odd-one-out', kind: 'odd-one-out', bg: bgU3L2Train, who: 'willow',
    teacher: 'Which one is different? Tap it and say it.',
    rounds: [
      { items: [{ label: 'teddy bears', img: itemTeddies }, { label: 'trains', img: itemTrains }, { label: 'one train', img: itemTrain }, { label: 'balls', img: itemBalls }], odd: 2, line: "It's a train! Just one!" },
      { items: [{ label: 'teddy bear', img: itemTeddy }, { label: 'cars', img: itemCars }, { label: 'ball', img: itemBallRed }, { label: 'doll', img: itemDoll }], odd: 1, line: 'They are cars! Many cars!' },
      { items: [{ label: 'teddy bear', img: itemTeddy }, { label: 'dog', img: itemDog }, { label: 'train', img: itemTrain }, { label: 'blocks', img: itemBlocks }], odd: 1, line: "It's a dog! The others are toys." },
    ],
  },
  {
    id: 'u3l2-show-me', kind: 'join-stage', bg: bgU3L2Cake, teacher: 'Show and tell with real toys from home! One toy, then many toys.', cast: ['pip', 'leo'],
    turns: [
      { who: 'pip', line: 'Show me one toy! What is it?', bubble: 'right' },
      { who: 'student', line: "It's a … ! (show it)", bubble: 'right' },
      { who: 'leo', line: 'Show me many toys! What are they?', bubble: 'right' },
      { who: 'student', line: 'They are … !', bubble: 'right' },
      { who: 'leo', line: 'Do you like teddy bears?', bubble: 'right' },
      { who: 'student', line: 'I like teddy bears! / I like …!', bubble: 'right' },
    ],
  },
  {
    id: 'u3l2-sticker', kind: 'sticker-reward', bg: bgU3L2Party, who: 'leo', teacher: 'Sticker time! The child opens the pack and puts the sticker in their Sticker Book.',
    line: 'You earned a teddy bear sticker! Well done!', sticker: { img: itemTeddy, label: 'Teddy bear' },
  },
  {
    id: 'u3l2-home-mission', kind: 'home-mission', bg: bgU3L1Room, who: 'leo',
    teacher: 'Home Mission: read the parent note and show the picture steps.',
    line: 'Your mission: find your toys at home. Show your family. Say: It\'s a teddy bear! They are blocks!',
    parentNote: 'Ask your child to show you one toy, then many toys, and to name them in English: "It\'s a train!" / "They are cars!"',
    steps: [
      { emoji: '\u{1F50D}', img: itemTeddy, say: 'Find' },
      { emoji: '\u{1F3E0}', say: 'Show' },
      { emoji: '\u{1F5E3}️', img: itemBlocks, say: 'Say it!' },
    ],
  },

  /* Extra time (blueprint §3b): use if there are minutes left; Next skips. */
  {
    id: 'u3l2-brain-break', kind: 'tpr-actions', mode: 'break', bg: bgU3L1Room, who: 'pip',
    teacher: 'Extra time — Brain Break! Stand up and move together. Skip with Next if there is no time.',
    rounds: [
      { line: 'Stand up and stretch!', emoji: '\u{1F646}' },
      { line: 'Jump like a ball!', emoji: '\u{1F3C0}' },
      { line: 'Walk like a robot!', emoji: '\u{1F916}' },
      { line: 'Choo choo like a train!', emoji: '\u{1F682}' },
      { line: 'Hug yourself like a teddy bear!', emoji: '\u{1F917}' },
      { line: 'Freeze!', emoji: '\u{1F976}', seconds: 3 },
    ],
  },
  {
    id: 'u3l2-bonus-builder', kind: 'shape-builder', bg: bgU2L3Builder, who: 'pip',
    teacher: 'Extra time — Build a train! Name each shape, then pick the color you hear.',
    rounds: [
      {
        who: 'willow', label: 'Train', intro: "Let's build a train!", line: "It's a train! Choo choo!", alive: 'bounce',
        pieces: [
          { shape: 'square', colorWord: 'RED', colorHex: C4.RED, x: 8, y: 20, w: 28, h: 30 },
          { shape: 'triangle', colorWord: 'YELLOW', colorHex: C4.YELLOW, x: 12, y: 4, w: 12, h: 16 },
          { shape: 'square', colorWord: 'BLUE', colorHex: C4.BLUE, x: 40, y: 28, w: 22, h: 22 },
          { shape: 'square', colorWord: 'GREEN', colorHex: C4.GREEN, x: 66, y: 28, w: 22, h: 22 },
          { shape: 'circle', colorWord: 'PURPLE', colorHex: C4.PURPLE, x: 14, y: 48, w: 14, h: 14 },
        ],
      },
    ],
  },
  {
    id: 'u3l2-bonus-catch', kind: 'catch-sort', bg: bgU3L2Party, teacher: 'Extra time — Catch it! One toy or many toys? Say it as you catch it!', goal: 8, seconds: 45,
    left: { label: 'One', emoji: '☝️' },
    right: { label: 'Many', emoji: '\u{1F64C}' },
    items: [
      { word: 'teddy bear', img: itemTeddy, emoji: '\u{1F9F8}', target: 'left' },
      { word: 'train', img: itemTrain, emoji: '\u{1F682}', target: 'left' },
      { word: 'car', img: itemCar, emoji: '\u{1F697}', target: 'left' },
      { word: 'teddy bears', img: itemTeddies, emoji: '\u{1F9F8}', target: 'right' },
      { word: 'blocks', img: itemBlocks, emoji: '\u{1F9F1}', target: 'right' },
      { word: 'balls', img: itemBalls, emoji: '\u{26BD}', target: 'right' },
    ],
  },

  /* 21-22 Closing */
  {
    id: 'u3l2-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye to Leo! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: `${A}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3580, 4020, 4980, 7482],
    songPrompt: 'Cheerful upbeat kids goodbye song',
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'leo', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'mia', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  },
  { id: 'u3l2-finale', kind: 'finale', bg: bgU3L2Cake, who: 'leo', line: 'A teddy bear, blocks and a train. One or many, you know them! Thank you for my party!' },
];

/* ===================== Pre-A1 Unit 3 · Lesson 3 — What Do You Like to Play? =====================
 * Toys & Playtime (3/6). New toys kite, robot, plane (Cambridge Pre A1 Starters
 * word list), the question "Do you like…? — Yes, I do! / No, I don't." (Lesson 1
 * taught "I like / I don't like"), "Let's play!", and K /k/ (kite, key,
 * kangaroo, king). Lesson-3 "make & build" game set (blueprint §3d): jigsaw,
 * pattern train, basket, brick crush — all with the game-animation kit. */
const bgU3L3Park = `${A}/scenes/bg-u3l3-park-wide.png`;
const bgU3L3Kite = `${A}/scenes/bg-u3l3-kite-wide.png`;
const bgU3L3Robot = `${A}/scenes/bg-u3l3-robot-wide.png`;
const bgU3L3Plane = `${A}/scenes/bg-u3l3-plane-wide.png`;
const bgU3L3Stuck = `${A}/scenes/bg-u3l3-stuck-wide.png`;
const bgU3L3Together = `${A}/scenes/bg-u3l3-together-wide.png`;
const bgU3L3ParkEmpty = `${A}/scenes/bg-u3l3-park-empty-wide.png`;
const bgU3L3Workshop = `${A}/scenes/bg-u3l3-workshop-wide.png`;
const itemKite = `${A}/items/item-kite.png`;
const itemRobot = `${A}/items/item-robot.png`;
const itemPlane = `${A}/items/item-plane.png`;
const itemKey = `${A}/items/item-key.png`;
const itemKangaroo = `${A}/items/item-kangaroo.png`;
const itemKitten = `${A}/items/item-kitten.png`;
/** Living game worlds (Higgsfield loops, ping-ponged) — see game-animation skill. */
const loopU3L3 = (name: string) => `${A}/video/loops/u3l3-${name}.mp4`;
const K_KITE = { colorWord: 'RED', colorHex: '#EF4444', shape: 'circle' as const, img: itemKite, word: 'kite' };
const K_ROBOT = { colorWord: 'GRAY', colorHex: '#9CA3AF', shape: 'square' as const, img: itemRobot, word: 'robot' };
const K_PLANE = { colorWord: 'BLUE', colorHex: '#3B82F6', shape: 'triangle' as const, img: itemPlane, word: 'plane' };
const K_BALL = { colorWord: 'RED', colorHex: '#EF4444', shape: 'circle' as const, img: itemBallRed, word: 'ball' };
const K_TEDDY = { colorWord: 'BROWN', colorHex: '#92400E', shape: 'circle' as const, img: itemTeddy, word: 'teddy bear' };

export const LESSON_U3L3_TITLE = 'What Do You Like to Play?';
export const LESSON_U3L3_OBJECTIVE = 'Name three new toys — kite, robot, plane — ask and answer "Do you like kites? — Yes, I do! / No, I don\'t.", invite a friend with "Let\'s play!", follow a short park story (Pip\'s kite gets stuck in a tree), and hear K say /k/ (kite, key, kangaroo, kitten) — by listening, moving, building, tapping and speaking, no reading.';

export const LESSON_U3L3_SCENES: Scene[] = [
  { id: 'u3l3-title', kind: 'title-card', bg: bgU3L3Park, level: 'Pre-A1', unit: 'Unit 3', lessonLabel: 'Lesson 3', title: 'What Do You Like to Play?', subtitle: 'A day in the park' },

  /* 1-3 Hook + story opener */
  {
    id: 'u3l3-hello-song', kind: 'song', bg: bgHelloCast, title: '\u{1F44B} Hello Song \u{1F44B}', teacher: 'Stand up! Sing, clap and wave on every "hello".',
    durationSeconds: 20, bigWord: 'Hello', songUrl: `${A}/audio/hello-song.mp3?v=2`,
    lineDurationsMs: [5200, 4300, 4500, 6100],
    songPrompt: 'Cheerful upbeat kids hello song',
    lyrics: [
      { who: 'pip', text: '\u{1F44B} Hello, hello, hello my friend!', emotion: 'happy' },
      { who: 'pip', text: '\u{1F333} Come with me, the fun begins!', emotion: 'happy' },
      { who: 'pip', text: '\u{1F44F} Clap your hands and wave up high', emotion: 'happy' },
      { who: 'pip', text: '\u{1F495} Hello, hello, hi hi hi!', emotion: 'happy' },
    ],
  },
  {
    id: 'u3l3-intro', kind: 'cinematic', bg: bgU3L3Park, hidePipOverlay: true, title: 'A Day in the Park', subtitle: 'Do you like toys?', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hello! How are you today? Do you like toys?' },
      { who: 'leo', line: "Me too! Let's go to the park. Let's play!" },
    ],
    cta: "Let's play!",
  },
  {
    // Slide 3: the story opener — a still-picture film (no zoom), new toys in context.
    id: 'u3l3-story-park', kind: 'story-video', bg: bgU3L3Park, videoUrl: `${A}/video/kite-story-u3l3-a.mp4?v=1`, title: 'In the Park',
    teacher: 'Press play and watch together. Point to each toy and say it.',
    pages: [
      { img: bgU3L3Park, who: 'pip', line: "The friends are in the park. Let's play!", atSec: 0 },
      { img: bgU3L3Kite, who: 'pip', line: 'Pip has a kite. I like my red kite!', atSec: 5 },
      { img: bgU3L3Robot, who: 'leo', line: 'Leo has a robot. I like robots!', atSec: 10 },
      { img: bgU3L3Plane, who: 'mia', line: 'Mia has a plane. Whoosh! It flies!', atSec: 15 },
    ],
    checkpoints: [
      { afterPage: 1, who: 'pip', question: 'What does Pip have?', answer: 'A kite', options: [{ label: 'A robot', img: itemRobot }, { label: 'A kite', img: itemKite }, { label: 'A plane', img: itemPlane }] },
      { afterPage: 3, who: 'mia', question: 'What does Mia have?', answer: 'A plane', options: [{ label: 'A plane', img: itemPlane }, { label: 'A ball', img: itemBallRed }, { label: 'A kite', img: itemKite }] },
    ],
  },

  /* 4-5 New words + move */
  {
    id: 'u3l3-words', kind: 'listen-repeat-cards', bg: bgU3L3ParkEmpty, teacher: 'Three new toys! Listen, then say each one with the action.',
    cards: [
      { who: 'pip', sentence: "It's a kite!", img: itemKite, imgLabel: 'Kite' },
      { who: 'leo', sentence: "It's a robot!", img: itemRobot, imgLabel: 'Robot' },
      { who: 'mia', sentence: "It's a plane!", img: itemPlane, imgLabel: 'Plane' },
    ],
  },
  {
    id: 'u3l3-move-say', kind: 'tpr-actions', bg: bgU3L3ParkEmpty, who: 'pip',
    teacher: 'Stand up! Say it with Pip, then do it before the ring runs out.',
    rounds: [
      { line: 'Fly like a plane!', emoji: '\u{2708}\u{FE0F}', img: itemPlane },
      { line: 'Walk like a robot!', emoji: '\u{1F916}', img: itemRobot },
      { line: 'Run and fly your kite!', emoji: '\u{1FA81}', img: itemKite },
      { line: 'Clap if you like robots!', emoji: '\u{1F44F}' },
      { line: "Jump and say: Let's play!", emoji: '\u{1F929}' },
    ],
  },

  /* 6-7 Build (Lesson-3 "make & build" set) */
  {
    id: 'u3l3-build-robot', kind: 'jigsaw-puzzle', bg: bgU3L3Workshop, bgVideo: loopU3L3('workshop'), teacher: 'Build the robot! Drag each piece to its place.',
    image: itemRobot, rows: 3, cols: 3,
  },

  /* 8-11 The question: Do you like…? */
  {
    id: 'u3l3-do-you-like', kind: 'listen-repeat-cards', bg: bgU3L3Park, teacher: 'Ask and answer! Nod for "Yes, I do!", shake your head for "No, I don\'t."',
    cards: [
      { who: 'pip', sentence: 'Do you like kites? Yes, I do!', img: itemKite, imgLabel: 'Yes, I do!' },
      { who: 'leo', sentence: 'Do you like robots? Yes, I do!', img: itemRobot, imgLabel: 'Yes, I do!' },
      { who: 'bella', sentence: "Do you like planes? No, I don't.", img: itemPlane, imgLabel: "No, I don't." },
    ],
  },
  {
    // Slide 9: badges on the friends and toys painted in bg-u3l3-park-wide (checked against the art).
    id: 'u3l3-spin', kind: 'spin-wheel', bg: bgU3L3Park, title: '',
    teacher: 'Have the student spin and say the toy: "It\'s a kite!" Then ask: "Do you like kites?" Or tap a number.',
    items: [
      { label: "It's a kite!", left: '30%', top: '25%' },
      { label: "It's a robot!", left: '45%', top: '55%' },
      { label: "It's a plane!", left: '56%', top: '51%' },
    ],
    wheelAt: { left: '50%', top: '28%' },
  },
  {
    id: 'u3l3-leo-asks', kind: 'join-stage', bg: bgU3L3Robot, teacher: 'Leo asks you. Answer him: "Yes, I do!" or "No, I don\'t."', cast: ['leo'],
    turns: [
      { who: 'leo', line: 'Hello! Do you like robots?', bubble: 'right' },
      { who: 'student', line: "Yes, I do! / No, I don't.", bubble: 'right' },
      { who: 'leo', line: 'Do you like kites?', bubble: 'right' },
      { who: 'student', line: "Yes, I do! / No, I don't.", bubble: 'right' },
      { who: 'leo', line: "Let's play!", bubble: 'right' },
    ],
  },
  {
    id: 'u3l3-you-ask', kind: 'join-stage', bg: bgU3L3Plane, teacher: 'Swap! Now the student asks Mia.', cast: ['mia'],
    turns: [
      { who: 'student', line: 'Ask Mia: Do you like planes?', bubble: 'right' },
      { who: 'mia', line: 'Yes, I do! I like my blue plane!', bubble: 'right' },
      { who: 'student', line: 'Ask Mia: Do you like robots?', bubble: 'right' },
      { who: 'mia', line: "No, I don't. I like planes!", bubble: 'right' },
    ],
  },

  /* 12 Game break: what comes next? */
  {
    id: 'u3l3-toy-train', kind: 'pattern-train', bg: bgU3L3ParkEmpty, bgVideo: loopU3L3('park'), who: 'leo',
    teacher: 'The toy train! What comes next? Say it, then tap it!',
    rounds: [
      { pattern: [K_KITE, K_ROBOT, K_KITE, K_ROBOT], answer: K_KITE, options: [K_PLANE, K_KITE, K_ROBOT] },
      { pattern: [K_PLANE, K_PLANE, K_KITE, K_PLANE, K_PLANE], answer: K_KITE, options: [K_KITE, K_ROBOT, K_PLANE] },
      { pattern: [K_ROBOT, K_PLANE, K_KITE, K_ROBOT, K_PLANE], answer: K_KITE, options: [K_ROBOT, K_BALL, K_KITE] },
    ],
  },

  /* 13-16 Phonics: K says /k/ */
  {
    id: 'u3l3-model-k', kind: 'sound-model', bg: bgU3L3ParkEmpty, who: 'pip', letter: 'K', phoneme: '/k/', sound: 'kuh',
    teacher: 'K says /k/ — kite, key, kangaroo!',
    anchors: [
      { word: 'kite', emoji: '\u{1FA81}', img: itemKite },
      { word: 'key', emoji: '\u{1F511}', img: itemKey },
      { word: 'kangaroo', emoji: '\u{1F998}', img: itemKangaroo },
    ],
  },
  { id: 'u3l3-trace-k', kind: 'trace', bg: bgU3L3ParkEmpty, who: 'pip', letter: 'K', phoneme: '/k/', word: 'kite', speakWord: false, teacher: 'Trace the big K with your finger! /k/ /k/ kite!' },
  {
    id: 'u3l3-basket-k', kind: 'basket', bg: bgU3L3ParkEmpty, bgVideo: loopU3L3('park'), letter: 'K', phoneme: '/k/', who: 'pip',
    teacher: "Drag the /k/ words into Pip's K basket! Kite, key…", goal: 4,
    items: [
      { word: 'kite', emoji: '\u{1FA81}', hit: true, img: itemKite },
      { word: 'key', emoji: '\u{1F511}', hit: true, img: itemKey },
      { word: 'kangaroo', emoji: '\u{1F998}', hit: true, img: itemKangaroo },
      { word: 'kitten', emoji: '\u{1F431}', hit: true, img: itemKitten },
      { word: 'robot', emoji: '\u{1F916}', hit: false, img: itemRobot },
      { word: 'plane', emoji: '\u{2708}\u{FE0F}', hit: false, img: itemPlane },
      { word: 'ball', emoji: '\u{26BD}', hit: false, img: itemBallRed },
    ],
  },
  { id: 'u3l3-brick-crush', kind: 'brick-crush', bg: bgU3L3ParkEmpty, teacher: 'Brick Crush! Listen to the sound, then tap every brick with that letter.', who: 'pip', letters: ['K', 'T', 'D', 'B'], rows: 4, cols: 6, goal: 12, seconds: 60 },

  /* 17-19 Story payoff, retell, personal */
  {
    id: 'u3l3-story-tree', kind: 'story-video', bg: bgU3L3Stuck, videoUrl: `${A}/video/kite-story-u3l3-b.mp4?v=1`, title: 'The Kite in the Tree',
    teacher: 'Press play. Is Pip happy or sad? Who helps?',
    pages: [
      { img: bgU3L3Stuck, who: 'pip', line: 'Oh no! My kite is in the tree!', atSec: 0 },
      { img: bgU3L3Stuck, who: 'willow', line: "Don't be sad, Pip. I can help!", atSec: 5 },
      { img: bgU3L3Together, who: 'pip', line: "Here is my kite! Thank you, Willow! Let's play together!", atSec: 10 },
      { img: bgU3L3Together, who: 'leo', line: 'Do you like to play? Yes, we do!', atSec: 15 },
    ],
    checkpoints: [
      { afterPage: 0, who: 'pip', question: 'Where is the kite?', answer: 'In the tree', options: [{ label: 'In the tree', img: itemTree }, { label: 'On the robot', img: itemRobot }, { label: 'In the plane', img: itemPlane }] },
      { afterPage: 1, who: 'willow', question: 'Who helps Pip?', answer: 'Willow', options: [{ label: 'Leo', img: CAST.leo.img }, { label: 'Willow', img: CAST.willow.img }, { label: 'Mia', img: CAST.mia.img }] },
    ],
  },
  {
    id: 'u3l3-story-order', kind: 'story-order', bg: bgU3L3ParkEmpty, who: 'pip', teacher: 'Put the story in order, then tell it: first, then, then, at the end!',
    frames: [
      { img: bgU3L3Kite, caption: 'Pip flies his kite.', who: 'pip' },
      { img: bgU3L3Stuck, caption: 'The kite is in the tree!', who: 'pip' },
      { img: bgU3L3Stuck, caption: 'Willow helps.', who: 'willow' },
      { img: bgU3L3Together, caption: "Let's play together!", who: 'leo' },
    ],
  },
  {
    id: 'u3l3-show-me', kind: 'join-stage', bg: bgU3L3Together, teacher: 'Show and tell with a real toy from home!', cast: ['pip', 'bella'],
    turns: [
      { who: 'pip', line: 'What do you like to play with? Show me!', bubble: 'right' },
      { who: 'student', line: 'I like my … ! (show it)', bubble: 'right' },
      { who: 'bella', line: 'Wow! Do you like kites?', bubble: 'right' },
      { who: 'student', line: "Yes, I do! / No, I don't.", bubble: 'right' },
    ],
  },

  /* 19-20 Sticker + Home Mission */
  {
    id: 'u3l3-sticker', kind: 'sticker-reward', bg: bgU3L3Together, who: 'pip', teacher: 'Sticker time! The child opens the pack and puts the kite sticker in their Sticker Book.',
    line: 'You helped me find my kite! Here is a kite sticker for you!', sticker: { img: itemKite, label: 'Kite' },
  },
  {
    id: 'u3l3-home-mission', kind: 'home-mission', bg: bgU3L3ParkEmpty, who: 'pip',
    teacher: 'Home Mission: read the parent note and show the picture steps.',
    line: 'Your mission: ask your family "Do you like kites?" Then play with your favourite toy together!',
    parentNote: 'Your child will ask you "Do you like kites / robots / planes?" — answer "Yes, I do!" or "No, I don\'t." Then ask them back, and play with one toy together saying "Let\'s play!".',
    steps: [
      { emoji: '\u{2753}', img: itemKite, say: 'Ask' },
      { emoji: '\u{1F44D}', say: 'Yes, I do!' },
      { emoji: '\u{1F3AE}', img: itemRobot, say: "Let's play!" },
    ],
  },

  /* Extra time (blueprint §3b): use if there are minutes left; Next skips. */
  {
    id: 'u3l3-brain-break', kind: 'tpr-actions', mode: 'break', bg: bgU3L3Together, who: 'pip',
    teacher: 'Extra time: Brain Break! Stand up and move with Pip.',
    rounds: [
      { line: 'Spin like a robot!', emoji: '\u{1F916}' },
      { line: 'Fly high like a kite!', emoji: '\u{1FA81}' },
      { line: 'Hop like a kangaroo!', emoji: '\u{1F998}' },
      { line: 'Zoom like a plane!', emoji: '\u{2708}\u{FE0F}' },
      { line: 'Freeze!', emoji: '\u{1F976}', seconds: 3 },
    ],
  },
  {
    id: 'u3l3-build-plane', kind: 'jigsaw-puzzle', bg: bgU3L3Workshop, bgVideo: loopU3L3('workshop'), teacher: 'Extra time: Build the plane! Drag each piece to its place.',
    image: itemPlane, rows: 3, cols: 3,
  },
  {
    id: 'u3l3-toy-train-2', kind: 'pattern-train', bg: bgU3L3ParkEmpty, bgVideo: loopU3L3('park'), who: 'mia',
    teacher: 'Extra time: Mia\'s toy train! What comes next?',
    rounds: [
      { pattern: [K_BALL, K_TEDDY, K_BALL, K_TEDDY], answer: K_BALL, options: [K_TEDDY, K_BALL, K_PLANE] },
      { pattern: [K_PLANE, K_KITE, K_ROBOT, K_PLANE, K_KITE], answer: K_ROBOT, options: [K_ROBOT, K_KITE, K_TEDDY] },
    ],
  },

  /* 21-22 Goodbye */
  {
    id: 'u3l3-goodbye-song', kind: 'song', bg: bgGoodbyeCast, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye! Sing along together.',
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
  { id: 'u3l3-finale', kind: 'finale', bg: bgU3L3Together, who: 'pip', line: "A kite, a robot and a plane! Do you like to play? Yes, we do! Thank you for helping me. Goodbye, friend!" },
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
