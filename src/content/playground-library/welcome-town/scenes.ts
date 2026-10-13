import type { Scene as PreA1Scene } from '../unit1/scenes';
import type { SpinWheelSceneData } from '../SpinWheelScene';
import type { PictureMatchSceneData } from '../PictureMatchScene';
import type { RecallWarmupSceneData } from '../RecallWarmupScene';
import type { FirstSoundSceneData } from '../FirstSoundScene';
import type { SoundBlendSceneData } from '../SoundBlendScene';
import type { LetterMatchSceneData, LetterBlocksSceneData } from '../LetterTilesScene';
import type { WhatsMissingSceneData } from '../WhatsMissingScene';
import type { SortBasketSceneData } from '../SortBasketScene';
import type { GrammarGapSceneData } from '../GrammarGapScene';
import type { ColorPlaySceneData } from '../ColorPlayScene';
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

export type CharKey = 'pip' | 'marigold' | 'mia' | 'bella' | 'willow' | 'leo' | 'coco' | 'wim' | 'catcat';

/** Every one of these maps onto an audio.ts voice already built for that
 *  exact character (pip/mia/bella/willow/leo are the same characters as the
 *  Pre-A1 curriculum, reusing their established voices) — Marigold plays a
 *  teacher role, so she uses the existing generic 'teacher' key. Coco (Unit
 *  2, Jungle Adventure), Wim, and Cat-cat (Unit 9, Magic Castle) are new
 *  characters with no dedicated recorded voice yet — routed to 'teacher'
 *  like Marigold until one exists, rather than silently reusing an
 *  established character's voice for a different one. */
export const VOICE_KEY: Record<CharKey, 'pip' | 'mia' | 'bella' | 'willow' | 'leo' | 'teacher'> = {
  pip: 'pip',
  marigold: 'teacher',
  mia: 'mia',
  bella: 'bella',
  willow: 'willow',
  leo: 'leo',
  coco: 'teacher',
  wim: 'teacher',
  catcat: 'teacher',
};

/** No `img` field — every character appears painted directly into a scene's
 *  `bg`, never as a standalone floating image (see the file banner above).
 *  Coco the Monkey is Unit 2's (Jungle Adventure) new character — see
 *  ../jungle-adventure/scenes.ts. Wim (a young castle wizard) and Cat-cat
 *  (his familiar) are Unit 9's (Magic Castle) new characters — the world's
 *  own designed mascots per src/curriculum/worlds/a1Worlds.ts, not
 *  invented ones — see ../magic-castle/scenes.ts. */
export const CAST: Record<CharKey, { name: string; emoji: string; color: string }> = {
  pip: { name: 'Pip', emoji: '\u{1F98A}', color: '#FE6A2F' },
  marigold: { name: 'Miss Marigold', emoji: '\u{1F989}', color: '#8ECAE6' },
  mia: { name: 'Mia', emoji: '\u{1F42D}', color: '#B85CD1' },
  bella: { name: 'Bella', emoji: '\u{1F430}', color: '#E76FA5' },
  willow: { name: 'Willow', emoji: '\u{1F426}', color: '#4FA9E0' },
  leo: { name: 'Leo', emoji: '\u{1F981}', color: '#C97A2F' },
  coco: { name: 'Coco', emoji: '\u{1F412}', color: '#8B5A2B' },
  wim: { name: 'Wim', emoji: '\u{1F9D9}', color: '#4A4E69' },
  catcat: { name: 'Cat-cat', emoji: '\u{1F431}', color: '#9A8C98' },
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
const bgVocabPipHappy = `${W}/scenes/bg-vocab-pip-happy.png`;
const bgVocabLeoTired = `${W}/scenes/bg-vocab-leo-tired.png`;
const bgVocabMiaSad = `${W}/scenes/bg-vocab-mia-sad.png`;
const bgVocabBellaAngry = `${W}/scenes/bg-vocab-bella-angry.png`;
const bgVocabWillowHungry = `${W}/scenes/bg-vocab-willow-hungry.png`;
const bgHeIntroPip = `${W}/scenes/bg-heshe-intro-pip.png`;
const bgHeSheTogether = `${W}/scenes/bg-heshe-together.png`;
const bgPrepIn = `${W}/scenes/bg-prep-in.png`;
const bgPrepOn = `${W}/scenes/bg-prep-on.png`;
const bgPrepNextTo = `${W}/scenes/bg-prep-next-to.png`;
const bgSupplies2 = `${W}/scenes/bg-classroom-supplies2.png`;
const bgPeers = `${W}/scenes/bg-classroom-peers.png`;

// Lesson 4-only "-v2" chibi-corrected background set. Per direct user
// report + a real side-by-side comparison against Pre-A1's bg-hello-
// cast.jpg: every background above was generated under the OLD art-style
// contract (before playground-library-lesson-builder §11 was expanded to
// explicitly require chibi/toddler proportions), so its characters read
// distinctly older than Pre-A1's. Per direct user decision at the time,
// only the style guide was fixed going forward, leaving Lessons 1-3's
// already-shipped art untouched -- these -v2 assets are Lesson 4's own
// dedicated regeneration under the corrected contract, deliberately NOT
// repointing the shared consts above (which would silently also change
// Lessons 1-3's look). If Lessons 1-3 are ever redone the same way, give
// them their own -v2 set the same way rather than retargeting these.
const bgWideV2 = `${W}/scenes/bg-classroom-wide-v2.png`;
const bgCircleV2 = `${W}/scenes/bg-classroom-circle-v2.png`;
const bgExpressHelloV2 = `${W}/scenes/bg-express-hello-v2.png`;
const bgPeersV2 = `${W}/scenes/bg-classroom-peers-v2.png`;
const bgExpressFriendV2 = `${W}/scenes/bg-express-friend-v2.png`;
const bgReadingV2 = `${W}/scenes/bg-classroom-reading-v2.png`;
const bgExpressGoodbyeV2 = `${W}/scenes/bg-express-goodbye-v2.png`;

export type Scene =
  // Any Pre-A1 game, played inside an A1/A2 lesson (owner: "you can use the same games from the pre-A").
  // Rendered by the Pre-A1 SceneRenderer; `teacher` is shown by the A1 renderer's tip.
  | { id: string; kind: 'prea1'; teacher?: string; scene: PreA1Scene }
  // Universal numbered spinner activity — shared with every scene library;
  // see ../SpinWheelScene.tsx for the authoring contract.
  | SpinWheelSceneData
  // Universal word-to-picture matching activity; see ../PictureMatchScene.tsx.
  | PictureMatchSceneData
  // Universal "Remember?" warm-up of the lesson before; see ../RecallWarmupScene.tsx.
  | RecallWarmupSceneData
  // Alphabet & phonics games shared with every scene library; see
  // ../FirstSoundScene.tsx and ../LetterTilesScene.tsx.
  | FirstSoundSceneData
  // Universal phonics slide (blueprint slot 14): blend the sounds on the Sound Train; see ../SoundBlendScene.tsx.
  | SoundBlendSceneData
  | LetterMatchSceneData
  | LetterBlocksSceneData
  | WhatsMissingSceneData
  | SortBasketSceneData
  | GrammarGapSceneData
  | ColorPlaySceneData
  /** `look: 'card'` — calm cream-card styling (Magic Castle Lesson 2) instead
   *  of the big hopping 3D title; same content, same behaviour. */
  | { id: string; kind: 'title-card'; bg: string; level: string; unit: string; lessonLabel: string; title: string; subtitle: string; cta?: string; look?: 'card' }
  | { id: string; kind: 'cinematic'; bg: string; title: string; subtitle: string; narrator: CharKey; script: { who: CharKey; line: string }[]; cta: string; look?: 'card' }
  // `cardSide` lets the teacher-instruction/repeat cards dock to whichever
  // side of the full-bleed `bg` was left empty for them (the character is
  // composed into the opposite side) instead of floating centered over the
  // character's face — omit for the default centered layout.
  | { id: string; kind: 'meet'; bg: string; who: CharKey; teacher: string; line: string; repeat: string; cardSide?: 'left' | 'right'; /** Dialogue-plate look: 'chalk' for classroom scenes, default 'paper'. 'word' = vocabulary page: no
       *  plate — the word (big) and the line sit right on the picture's open side (owner 2026-10-09: "remove that green box"). */ look?: 'paper' | 'chalk' | 'word'; /** Vocabulary in `line` to highlight after the voice has read it. */ focus?: string[];
      /** look 'word': the big word (default focus[0]) and an optional small line above it (e.g. "👦 + 👧 ="). */ word?: string; wordNote?: string }
  | {
      id: string; kind: 'echo'; bg: string; who: CharKey; teacher: string; word: string;
      /** Which side of the frame is empty enough for the big bare word —
       *  same convention as listen-repeat-cards' own bare/textSide (see
       *  that scene's comment for the full reasoning: student clarity
       *  first — the word must be large enough to actually read AND never
       *  overlap the important part of the image, e.g. a character's
       *  face). 'top' suits a background with no single clean empty side
       *  (the subject roughly centered). Defaults to 'right'. */
      textSide?: 'left' | 'right' | 'top';
      /** Per-word color for a modeling SENTENCE (not a single vocabulary
       *  word) — same convention and reasoning as listen-repeat-cards'
       *  own wordColors: a fixed grammar chunk ("is in the") keeps one
       *  consistent color across every scene that uses it so the student
       *  learns to recognize the pattern by color, not just position or
       *  memorization, while the actual taught word (e.g. the room name)
       *  gets its own distinct color. Aligned by index to
       *  `word.split(' ')`; null/omitted stays the default white.
       *  Required for every scene whose `word` is a full sentence, not a
       *  single word — color coding is how a student parses sentence
       *  structure at a glance, not optional polish. */
      wordColors?: (string | null)[];
    }
  | {
      id: string; kind: 'memory'; bg: string; teacher: string;
      pairs: {
        id: string; label: string; emoji: string;
        /** When set, this pair's two cards are DIFFERENT instead of
         *  identical — one shows the WORD (reading practice), the other
         *  shows this picture (meaning/recognition), so the student
         *  matches a word to its picture instead of two identical emoji.
         *  `crop`/`imgAspect` reuse the same convention as picture-match's
         *  `PictureMatchItem`, so an existing scene image can be reused
         *  without generating a new standalone picture. Omit for the
         *  original identical-emoji-pair behavior. */
        img?: string;
        crop?: { x: number; y: number; w: number; h: number };
        imgAspect?: number;
        /** Question ↔ answer pairs: the second card shows this text instead (e.g. label "How are you?", match "I am fine."). */
        match?: string;
      }[];
    }
  | { id: string; kind: 'drag-match'; bg: string; teacher: string; items: {
      label: string; color: string; targetLeft: string; targetTop: string;
      /** Optional real footprint of the target object, as percentages of
       *  the scene (same convention as targetLeft/targetTop). When set,
       *  a drop is scored against a rectangle of this size around the
       *  target point instead of the default fixed-radius circle — a
       *  wide, short object (a table) needs a wide, short hit area, not
       *  a circle sized to fit a person-shaped character. Per direct
       *  request after a table drop kept missing near its edges: "it
       *  should match with any space that the table is in." Omit for
       *  anything roughly circular/character-shaped, where the circular
       *  fallback already covers the whole illustration comfortably. */
      targetWidth?: string; targetHeight?: string;
      who?: CharKey;
    }[]; showBlanks?: boolean; pointTo?: { who: CharKey; left: string; top: string; dir?: 'down' | 'left' | 'right' }[] }
  /** Live teacher-driven placement, matching a real competitor pattern the
   *  user pointed to directly (a house-cutaway slide where the teacher
   *  freely drags a character between rooms while quizzing the student out
   *  loud — no in-app scoring at all, the teacher IS the check). Each
   *  sticker starts at its own position and can be re-dragged anywhere, any
   *  number of times — there is no "correct" zone, no quiz phase, nothing
   *  to grade. Deliberately left OUT of REAL_SYNC_KINDS/no `sync` prop,
   *  same as drag-match — see PlayWelcomeTownLesson.tsx's REAL_SYNC_KINDS
   *  comment: it relies on the generic DOM pointer-event tap/drag mirror
   *  instead of the structured ActivitySync channel, which is what makes a
   *  continuous drag gesture sync live between teacher and student at all
   *  today. */
  | { id: string; kind: 'drag-sticker'; bg: string; teacher: string; stickers: { who: CharKey; stickerImg: string; startLeft: string; startTop: string }[] }
  | {
      id: string; kind: 'vocab-spot'; bg: string; teacher: string;
      items: {
        label: string; sentence: string; emoji: string; left: string; top: string; color: string; dir?: 'down' | 'left' | 'right'; who?: CharKey;
        /** An illustrated picture card shown in place of the usual
         *  arrow-points-at-the-photo presentation — for introducing a
         *  word that ISN'T literally drawn in `bg` (e.g. an abstract
         *  concept like a preposition), where there's nothing real in
         *  the background to point an arrow at. When set, VocabSpotScene
         *  shows this image as a centered, bordered card at left/top
         *  instead of the arrow + bare-word-on-photo flow; everything
         *  else (tap to hear, replay, dismiss, step counter) is
         *  unchanged. Omit for the standard point-at-the-real-thing
         *  version of this activity. */
        img?: string;
      }[];
    }
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
  | { id: string; kind: 'listen-tap'; bg: string; teacher: string; targets: {
      label: string; left: string; top: string; color: string;
      /** Real clickable region around the target, as percentages of the
       *  scene (same convention as targetWidth/targetHeight on
       *  drag-match). The resting hit-zone is invisible by design (see
       *  ListenTapScene), so without this a student has to blind-guess a
       *  small ~88px circle around `left`/`top` — reported live as
       *  "clicking, clicking, clicking... they don't know what to
       *  click." Set this whenever the target represents a whole real
       *  area of the background (a room in a house cutaway, a zone of a
       *  wider scene) so the ENTIRE area is clickable, not just its
       *  center point. Omit for a small/precise target (a single
       *  character or object) where the default fixed hit-zone is
       *  already an easy, unambiguous tap. */
      hitWidth?: string; hitHeight?: string;
      /** An always-visible illustrated picture card for this target,
       *  instead of the default invisible hotspot. Use this when the
       *  targets themselves ARE the thing being taught (e.g. one picture
       *  each for "under"/"on"/"in") rather than real objects already
       *  sitting in a photographic scene — there's no "real photo" to
       *  avoid spoiling by showing a marker early, so the normal
       *  invisible-until-tapped convention (see ListenTapScene) doesn't
       *  apply. Omit for the standard find-the-real-object-in-the-scene
       *  version of this activity. */
      img?: string;
    }[]; rounds: {
      prompt: string; answerLabel: string; who?: CharKey;
      /** A real character sticker (transparent-background PNG, matching
       *  drag-sticker's own art convention) shown on a correct tap
       *  instead of the generic CAST-emoji badge — cleaner and more
       *  presentable per direct request. Optional: most characters don't
       *  have a dedicated sticker asset yet, so omitting it keeps the
       *  emoji-badge fallback working exactly as before. Only supply
       *  this when a real sticker image already exists for `who`. */
      stickerImg?: string;
    }[] }
  // A spoken statement, judged True or False — a third, genuinely different
  // listening-check modality from `choice` (pick from 3 text buttons) and
  // `listen-tap` (tap a real object in the scene): a fast binary call, no
  // scene-hotspot dependency at all, so it can freely mix content from
  // different backgrounds/topics in one scene. Named explicitly in
  // smart-lesson-architect's own "Recognition / noticing" activity family
  // and grounded by dedicated research (see the scene using it below).
  | { id: string; kind: 'true-false'; bg: string; teacher: string; rounds: { who: CharKey; statement: string; isTrue: boolean }[];
      /** Reading version (Cambridge Starters R&W Part 2): a big picture to look at, sentences to READ (not spoken; 🔊 = help). */
      img?: string; read?: boolean }
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
  | {
      id: string; kind: 'flipbook'; bg: string; title: string;
      pages: {
        who?: CharKey; img: string; text: string;
        /** Pin the caption frame to a side of the picture. Normally omitted: the player
         *  looks at the picture and puts the frame where it has calm space (captionPlacement.ts). */
        textPos?: 'top' | 'bottom' | 'left' | 'right';
        /** Dedicated art for the manga layout's smaller "reaction" panel —
         * a close-up of the speaking character, generated per page rather
         * than reused room art, so the second panel isn't just a flat
         * color badge. Optional: older/un-illustrated flipbook pages fall
         * back to the plain color+emoji accent panel in FlipbookScene. */
        img2?: string;
        /** Render this page as a single full-bleed "splash" panel instead
         * of the usual multi-section manga layout — reserved for a
         * climax/reveal beat (per real manga/comics convention: panel size
         * and whether it's cut up at all signals importance, and chopping
         * the emotional high point into the same small sections as every
         * other beat undersells it instead of landing it). */
        splash?: boolean;
      }[];
      checkpoints: { afterPage: number; who: CharKey; question: string; options: string[]; answer: string }[];
    }
  | {
      id: string; kind: 'song'; bg: string; title: string; teacher: string; songUrl?: string; durationSeconds?: number; bigWord?: string; lyrics: { who: CharKey; text: string }[];
      /** Exact per-line duration (ms), same length as `lyrics`. See unit1/scenes.ts's
       * own `song` type for the full rationale — even-dividing the audio's total
       * duration by line count drifts out of sync with real sung pacing. Omit for
       * songs generated before this field existed. */
      lineDurationsMs?: number[];
    }
  | { id: string; kind: 'sound-model'; bg: string; who: CharKey; letter: string; phoneme: string; sound: string; teacher: string; /** Where the letter card sits: 'center' (words scattered left AND right of it — the default) or 'left' / 'right' (words floating on the OPPOSITE side). */ soundSide?: 'center' | 'left' | 'right'; anchors: { word: string; emoji: string; img?: string }[]; /** Wizard/magic styling (night-sky glow + sparkles). */ magic?: boolean }
  | { id: string; kind: 'trace'; bg: string; who: CharKey; letter: string; phoneme: string; word: string; teacher: string }
  | {
      id: string; kind: 'word-build'; bg: string; teacher: string; magic?: boolean;
      /** `tiles` splits the word into sound tiles (e.g. ['ch','i','p']) so a
       *  digraph can be one blank; blankIndex then indexes `tiles`. */
      rounds: { word: string; blankIndex: number; answer: string; choices: string[]; img?: string; emoji: string; tiles?: string[] }[];
    }
  | {
      // Ported from unit1's sentence-build (same shape/mechanic): tap
      // shuffled word tiles back into order to build a full sentence,
      // rather than just hearing/repeating one already assembled. Added
      // for Magic Castle Lesson 2's "There is a ___ in the bedroom"
      // pattern, which previously had no guided-practice step between
      // mc2-model (hears the model sentence once) and mc2-join-stage
      // (free speaking production) — mc2-drag-words only matches single
      // words to objects, not the full sentence.
      id: string; kind: 'sentence-build'; bg: string; teacher: string;
      /** img/emoji: a non-reader tapping words into order has no way to
       *  confirm WHAT sentence they're building from the (initially
       *  blank) tiles alone — a picture anchors the meaning. */
      /** extra: trap words mixed into the tiles (a wrong word to leave out, like the homework Build It). */
      rounds: { words: string[]; colors?: (string | null)[]; img?: string; emoji?: string; extra?: string[] }[];
      side?: 'left' | 'right' | 'top';
      /** listen: Pip says the sentence first (and on 🔊), the child builds what they heard. */
      listen?: boolean;
    }
  | {
      /** Tongue twister: hear it once, then say it three times — slow,
       *  faster, magic speed — while a wand bounces word by word at that
       *  pace. `focus` letters are glowing in the text. */
      id: string; kind: 'tongue-twister'; bg: string; who: CharKey; teacher: string; line: string; focus: string;
      /** A1 tongue-twister ladder: 2 speeds in Units 1-3, 3 later (default 3). `look: 'town'` = no wizard dressing. */
      speeds?: number; look?: 'town';
      /** Twister Race: the twisters of the unit, one per row (`line` = all of them, in order). */
      lines?: string[];
    }
  | {
      /** The Reader (ReaderScene.tsx): the unit's serial story, read-along then the child reads; `lines` of a page are
       *  spoken in their speaker's voice, every word tappable. */
      id: string; kind: 'reader'; bg: string; title: string; teacher: string; doneLine: string;
      pages: { img: string; lines: { who?: CharKey; text: string }[] }[];
    }
  | {
      /** Read & Do (ReadDoScene.tsx, A1 U1L6): an instruction card to READ (not spoken; 🔊 = help), e.g. "Give Leo the
       *  red cap." The child taps `things[thing]` then the friend `cast[to]` (no `thing` = just tap the friend, e.g.
       *  "Wave to Mia."). Given things stay with the friend; the friend says `reply`. */
      id: string; kind: 'read-do'; bg: string; teacher: string; title: string; cast: CharKey[];
      things: { label: string; img: string }[];
      rounds: { text: string; thing?: number; to: number; reply: string }[];
      doneLine: string;
    }
  | {
      /** Answer Race (AnswerRaceScene.tsx): a question (`ask`, spoken unless `read`), three answer cards; each right
       *  answer moves the racer one step to the finish. `look: 'gates'` = Pip runs through answer gates (L6 Catch the
       *  answer), `'race'` = a car race (L7 Boss warm-up, Blooket racing mechanic). */
      id: string; kind: 'answer-race'; bg: string; teacher: string; title: string; look: 'gates' | 'race' | 'raft'; who: CharKey;
      racer: string; rounds: { ask: string; choices: string[]; answer: number; read?: boolean }[]; doneLine: string;
    }
  | {
      /** Field Guide (FieldGuideScene.tsx, A1 U2L4): build an animal's 4-sentence card — each `lines` frame has one ___ gap;
       *  pick the right word from `options` (a wrong one: the animal says `no`), then the child reads the card aloud. */
      id: string; kind: 'field-guide'; bg: string; teacher: string; title: string; who: CharKey;
      animals: { name: string; img: string; lines: { frame: string; options: string[]; answer: string; no?: string }[] }[];
      doneLine: string;
    }
  | {
      /** Word Splat (WordSplatScene.tsx): sight words float as paint blobs; the voice says one, the child splats it
       *  (it stays painted) and reads it. `rounds` = the words called, in order (each must be in `words`). */
      id: string; kind: 'word-splat'; bg: string; teacher: string; title: string; who: CharKey;
      words: string[]; rounds: string[]; doneLine: string;
    }
  | { id: string; kind: 'letter-game'; bg: string; who: CharKey; teacher: string; mode: 'name' | 'sound'; rounds: { letter: string; phoneme?: string; choices: string[] }[] }
  | { id: string; kind: 'jigsaw-puzzle'; bg: string; teacher: string; image: string; rows: number; cols: number }
  /** `cast`: the friends shown on the finale card (defaults to Welcome Town's
   *  class); `look: 'card'` = cream-card styling. */
  /** Move-it preposition game (see WhereGames.tsx). Positions are % of a
   *  16:9 stage: left = centre x, top = the FOOT (where it stands). `width`
   *  is % of the stage width. `behind: true` draws the item under the
   *  furniture sticker, so "behind"/"under" really look hidden. */
  | {
      id: string; kind: 'place-it'; bg: string; who: CharKey; teacher: string; mode: 'learn' | 'listen';
      item: { label: string; img: string; width: number; height?: number; homeLeft?: number; homeTop?: number };
      anchor: { label: string; img: string; left: number; top: number; width: number };
      box?: { label: string; img: string; left: number; top: number; width: number };
      spots: { prep: 'in' | 'on' | 'under' | 'next to' | 'behind'; left: number; top: number; behind?: boolean; scale?: number }[];
      startAt?: 'in' | 'on' | 'under' | 'next to' | 'behind';
      learnLines?: Partial<Record<'in' | 'on' | 'under' | 'next to' | 'behind', string>>;
      rounds?: { prep: 'in' | 'on' | 'under' | 'next to' | 'behind'; line: string; answer?: string }[];
    }
  /** Torch hunt in a dark room (see WhereGames.tsx): find the hidden thing
   *  (spot = % of the 16:9 picture, r = radius in % of width), then pick
   *  the sentence that says where it is. */
  | {
      id: string; kind: 'torch-hunt'; bg: string; who: CharKey; teacher: string; ask?: string;
      rounds: { bg: string; spot: { left: number; top: number; r: number }; question?: string; answer: string; options: string[] }[];
    }
  /** "Where is the ___?" — "It's in the ___." on a castle cutaway (see
   *  WhereGames.tsx): rooms are % boxes, `at` is where the thing is drawn
   *  (for the found glow), `stickers` adds things not painted in `bg`. */
  | {
      id: string; kind: 'where-castle'; bg: string; teacher: string; asker: CharKey; answerer: CharKey; askerName?: string;
      rooms: { room: string; box: { x: number; y: number; w: number; h: number } }[];
      stickers?: { img: string; left: number; top: number; width: number }[];
      rounds: { item: string; img: string; room: string; at: { left: number; top: number } }[];
    }
  | {
      /** Guests knock; the right greeting / answer opens the door (A1 U1 L1). */
      id: string; kind: 'welcome-party'; bg: string; teacher: string; host: CharKey;
      /** Doorway box in % of the stage (left/top/width/height). */
      door: { left: number; top: number; width: number; height: number };
      rounds: {
        guest: CharKey; sprite: string; knock: string; mode: 'greet' | 'answer';
        options: { line: string; correct?: boolean }[]; reply: string; names: string[];
      }[];
    }
  | {
      /** Spell names with recorded letter names, then build your own badge. */
      id: string; kind: 'name-badge'; bg: string; teacher: string; who: CharKey;
      rounds: { name: string; sprite?: string; choices: string[] }[];
    }
  | {
      /** Feelings Survey (A1 ★ "Find Someone Who"): pick a friend, ask "How are you, <name>?", hear the answer,
       *  tap the matching face on the clipboard; the host reads the chart back. `img` = neutral picture shown
       *  until the row is filled (`feelImg` after). See scene-components/FeelingsSurveyScene.tsx. */
      id: string; kind: 'feelings-survey'; bg: string; teacher: string; who: CharKey; title: string; intro: string;
      friends: { who: CharKey; name: string; feeling: string; img: string; feelImg?: string }[];
      faces: { feeling: string; emoji: string; color: string }[];
    }
  | {
      /** Chat Chain (A1 U1 L4): a friend speaks, the child picks the reply that fits (the `wrong` lines answer a
       *  different question) and says it; the turns build one whole conversation that replays at the end.
       *  See scene-components/ChatChainScene.tsx. */
      id: string; kind: 'chat-chain'; bg: string; teacher: string; partner: CharKey; title: string; intro: string;
      turns: ({ who: CharKey; line: string } | { who: 'student'; line: string; wrong: string[] })[];
    }
  | { id: string; kind: 'finale'; bg: string; who: CharKey; line: string; cast?: CharKey[]; look?: 'card' };

/* =============================================================================
 * A1 Unit 1, Lesson 1: "Hello, My Name Is…" (rebuilt 2026-10-02)
 *
 * Unit plan: Unit 1 "Greetings & Introductions", 7 lessons (Cambridge Pre A1
 * Starters: greetings, "What's your name?", spelling a name). L1 teaches ONLY:
 * hello, hi, goodbye, bye, name · "What's your name?" · "My name's… / I'm…" ·
 * spelling a name with the alphabet. Classroom objects, feelings, age and
 * "friend/teacher" moved to their own lessons/units (they were used here
 * before being taught).
 *
 * Signature game: Pip's Welcome Party (welcome-party): a guest only comes in
 * when the child says/chooses the right line. Then Name Badge (name-badge):
 * names are spelled with the RECORDED letter-name clips, and the child builds
 * their own badge. Role swap: the child asks the name (wt-your-turn). One
 * phonics micro-moment: /s/ /a/ /t/ → read "sat". Ends with a goodbye scene
 * (not the old song + jigsaw every lesson used).
 *
 * Rebuilt again 2026-10-09 to the A1 roadmap (docs/a1-playground-roadmap.md) and the 22-page blueprint:
 * word pages (Hello! / name / Goodbye!: character on one side, word big on the open side), then Pre-A1 games
 * played inside the A1 lesson (kind 'prea1'): Move & Say, Name Buzzer Show, Quick fire, sticker, home mission
 * and a brain break; plus a spin-and-greet wheel. First lesson of the level, so no Remember? page.
 * All art is wide 16:9.
 * ========================================================================== */
const bgL1Class = `${W}/scenes/bg-classroom-wide-wide.png`;
const bgL1Circle = `${W}/scenes/bg-classroom-circle-wide.png`;
const bgL1Hello = `${W}/scenes/bg-express-hello-v2.png`;
const bgL1Peers = `${W}/scenes/bg-classroom-peers-v2.png`;
const bgL1Goodbye = `${W}/scenes/bg-express-goodbye-wide.png`;
const bgL1Party = `${W}/scenes/bg-party-door-wide.png`;
const bgL1Reading = `${W}/scenes/bg-classroom-reading-wide.png`;
const spr = (who: CharKey) => `${W}/sprites/${who}-wave.png`;
/** The party door on bg-party-door-wide.png (percent of the 1376×768 art). */
const PARTY_DOOR = { left: 21.4, top: 17, width: 19.8, height: 63 };

export const LESSON_1_TITLE = 'Hello, My Name Is…';
export const LESSON_1_OBJECTIVE = 'I can say hello and goodbye, say my name and ask "What’s your name?" — and read the first pages of Leo’s story.';

/** Welcome Town School is all set in the classroom, so its characters speak on the chalkboard plate. */
const classroomLook = (scenes: Scene[]): Scene[] =>
  scenes.map((sc) => (sc.kind === 'meet' && !sc.look ? { ...sc, look: 'chalk' as const } : sc));

// Word pages (A1 word look, owner 2026-10-09): a character on one side, the word big on the open side.
const bgL1WordHello = `${W}/scenes/bg-vocab-pip-happy-wide.png`;
// Pip (backpack on) waves in the doorway next to Miss Marigold; bg-classroom-door.png on a 16:9 canvas of its own plain orange.
const bgL1WordGoodbye = `${W}/scenes/bg-classroom-door-wide.png`;
// Pre-A1 games played in this lesson (kind 'prea1'): the quiz-show stage has three empty buzzer podiums.
const bgL1Stage = '/lep1/scenes/bg-u5l6-stage-wide.png';
const L1_FACES = [
  { label: 'Pip', name: 'Pip', img: spr('pip') },
  { label: 'Mia', name: 'Mia', img: spr('mia') },
  { label: 'Leo', name: 'Leo', img: spr('leo') },
  { label: 'Bella', name: 'Bella', img: spr('bella') },
  { label: 'Willow', name: 'Willow', img: spr('willow') },
];

/* Leo's First Day — the Unit 1 serial story (docs/a1-unit-1-welcome-town.md §4): one picture per page, read a bit
 * more each lesson in the Reader. Canva art, cast from public/welcome-town/refs/cast-ref.png. */
export const leoStory = (n: number) => `${W}/scenes/bg-leo-story-${n}-wide.png`;
export const LEO_STORY: { img: string; lines: { who?: CharKey; text: string }[] }[] = [
  { img: leoStory(1), lines: [{ text: 'This is Leo. Leo is new in Welcome Town.' }] },
  { img: leoStory(2), lines: [{ who: 'pip', text: 'Hello! My name is Pip. What’s your name?' }] },
  { img: leoStory(3), lines: [{ who: 'leo', text: 'Hi, Pip! My name is Leo.' }] },
  { img: leoStory(4), lines: [{ who: 'pip', text: 'How are you, Leo?' }, { who: 'leo', text: 'I am sad. My red cap is lost.' }] },
  { img: leoStory(5), lines: [{ who: 'pip', text: 'Come on, Leo! Let’s find it!' }] },
  { img: leoStory(6), lines: [{ who: 'pip', text: 'Mia, this is my friend Leo.' }, { who: 'mia', text: 'Hello, Leo! Nice to meet you.' }] },
  { img: leoStory(7), lines: [{ who: 'bella', text: 'Hi, Leo! I’m Bella. Look! A red cap!' }] },
  { img: leoStory(8), lines: [{ who: 'willow', text: 'No, no! That is my red hat!' }] },
  { img: leoStory(9), lines: [{ who: 'mia', text: 'Look! The cap is on the cat!' }] },
  { img: leoStory(10), lines: [{ who: 'leo', text: 'My cap! Thank you, friends! I am happy now!' }] },
  { img: leoStory(11), lines: [{ who: 'pip', text: 'Goodbye, Leo! See you tomorrow!' }, { who: 'leo', text: 'Goodbye, friends!' }] },
];

/* Rebuilt 2026-10-12 to the approved Unit 1 plan (docs/a1-unit-1-welcome-town.md §5.1; owner: "some activities don't
 * make sense … every activity should serve the objective … in A1 they need to read full sentences, focus on the
 * story"). Objective: I can say hello and goodbye, say my name and ask "What's your name?" — and read the first pages
 * of Leo's story. Every page names its stage (Guided / Free / Reading) in the teacher note. */
export const LESSON_1_SCENES: Scene[] = classroomLook([
  { id: 'wt-title', kind: 'title-card', bg: leoStory(1), level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 1', title: 'Hello, My Name Is…', subtitle: 'Say hello, ask a name — and read Leo’s story!', cta: '\u{1F44B} LET’S GO!' },
  /* Present: the words, then the sentence */
  { id: 'wt-word-hello', kind: 'meet', look: 'word', word: 'Hello!', focus: ['Hello'], bg: bgL1WordHello, who: 'pip', teacher: 'Present: wave and say "Hello!"', line: 'Hello! Hi!', repeat: 'Hello!' },
  { id: 'wt-word-goodbye', kind: 'meet', look: 'word', word: 'Goodbye!', focus: ['Goodbye'], bg: bgL1WordGoodbye, who: 'pip', teacher: 'Present: when we go, we say "Goodbye!" Wave and say it.', line: 'Goodbye! Bye-bye!', repeat: 'Goodbye!' },
  { id: 'wt-sentence-name', kind: 'meet', focus: ['name'], bg: bgL1Hello, who: 'pip', cardSide: 'left', teacher: 'Present: listen to Pip. Then say: My name is … (your name!)', line: 'My name is Pip. What’s your name?', repeat: 'My name is …' },
  { id: 'wt-echo-question', kind: 'echo', bg: bgL1Peers, who: 'pip', textSide: 'top', teacher: 'Guided: say the question with Pip — the voice goes up at the end.', word: 'What’s your name?' },
  /* Guided: when do we say hello / goodbye? */
  {
    id: 'wt-hello-goodbye-sort', kind: 'prea1', teacher: 'Guided: Hello or Goodbye? A friend arrives → catch it in Hello!; a friend leaves → Goodbye! Say it as you catch it.',
    scene: {
      id: 'wt-hello-goodbye-sort', kind: 'catch-sort', bg: bgL1Class, goal: 6, seconds: 45,
      teacher: 'Hello or Goodbye? Catch it in the right basket and say it!',
      left: { label: 'Hello!', emoji: '\u{1F44B}' }, right: { label: 'Goodbye!', emoji: '\u{1F6AA}' },
      items: [
        { word: 'Leo comes in.', emoji: '\u{1F981}', target: 'left' },
        { word: 'I go home now.', emoji: '\u{1F3E0}', target: 'right' },
        { word: 'Good morning, class!', emoji: '\u{1F305}', target: 'left' },
        { word: 'The bus is here. Bye!', emoji: '\u{1F68C}', target: 'right' },
        { word: 'A new friend!', emoji: '\u{1F91D}', target: 'left' },
        { word: 'See you tomorrow!', emoji: '\u{1F319}', target: 'right' },
      ],
    },
  },
  /* The lesson's song: after the words and a first game (CLAUDE.md) */
  {
    id: 'wt-hello-song', kind: 'song', bg: bgL1Class, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Guided: sing and do it — wave on "hello", point to yourself on "name".',
    durationSeconds: 20, bigWord: 'Hello',
    songUrl: `${W}/audio/hello-song.mp3?v=1`,
    lineDurationsMs: [3640, 4120, 4320, 7982],
    lyrics: [
      { who: 'marigold', text: 'Hello, hello, hello to you!' },
      { who: 'pip', text: 'Hi, hi, hi! And hi to you!' },
      { who: 'marigold', text: 'What’s your name? What’s your name?' },
      { who: 'pip', text: 'Say your name! Say your name!' },
    ],
  },
  /* Guided: names — spell them on the name tags, then say "My name is …" */
  {
    id: 'wt-name-badge', kind: 'name-badge', bg: bgL1Party, who: 'marigold',
    teacher: 'Guided: listen to the letters and tap them in order. Then the student says "My name is …" with their own name.',
    rounds: [
      { name: 'Pip', sprite: spr('pip'), choices: ['A', 'P', 'T', 'I'] },
      { name: 'Leo', sprite: spr('leo'), choices: ['O', 'L', 'A', 'E'] },
      { name: 'Mia', sprite: spr('mia'), choices: ['N', 'A', 'M', 'I'] },
    ],
  },
  /* Free: the signature game — greet and ask to open each door */
  {
    id: 'wt-welcome-party', kind: 'welcome-party', bg: bgL1Party, host: 'pip', door: PARTY_DOOR,
    teacher: 'Free: the student SAYS the line out loud, then taps it to open the door. The guest answers.',
    rounds: [
      {
        guest: 'leo', sprite: spr('leo'), mode: 'greet', knock: 'Knock, knock!',
        options: [{ line: 'Hello! What’s your name?', correct: true }, { line: 'Goodbye! Bye!' }],
        reply: 'Hi! My name is Leo. I am new!', names: ['Leo', 'Bella', 'Mia'],
      },
      {
        guest: 'bella', sprite: spr('bella'), mode: 'greet', knock: 'Knock, knock! Hello!',
        options: [{ line: 'Bye!' }, { line: 'Hi! What’s your name?', correct: true }],
        reply: 'Hello! I’m Bella.', names: ['Willow', 'Bella', 'Mia'],
      },
      {
        guest: 'mia', sprite: spr('mia'), mode: 'answer', knock: 'Hi! I’m Mia. What’s your name?',
        options: [{ line: 'Goodbye!' }, { line: 'My name is Pip.', correct: true }, { line: 'What’s your name?' }],
        reply: 'Hello, Pip!', names: [],
      },
      {
        guest: 'willow', sprite: spr('willow'), mode: 'greet', knock: 'Knock, knock!',
        options: [{ line: 'Hello! What’s your name?', correct: true }, { line: 'My name is Willow.' }, { line: 'Goodbye!' }],
        reply: 'Hi! My name is Willow.', names: ['Leo', 'Willow', 'Bella'],
      },
    ],
  },
  /* Free: the teacher asks, then the child asks */
  {
    id: 'wt-answer', kind: 'join-stage', bg: bgL1Circle, teacher: 'Free: Miss Marigold asks, the student answers in a whole sentence — then the student asks her.', cast: ['marigold', 'pip'],
    turns: [
      { who: 'marigold', line: 'Hello! What’s your name?' },
      { who: 'student', line: 'Hello! My name is … What’s your name?' },
      { who: 'marigold', line: 'My name is Miss Marigold.' },
      { who: 'student', line: 'Goodbye, Miss Marigold!' },
    ],
  },
  {
    id: 'wt-brain-break', kind: 'prea1', teacher: 'Brain break: stand up and move with Pip.',
    scene: {
      id: 'wt-brain-break', kind: 'tpr-actions', mode: 'break', bg: bgL1Circle, who: 'pip', teacher: 'Brain break: stand up and move with Pip.',
      rounds: [
        { line: 'Wave and say: Hello!', emoji: '\u{1F44B}' },
        { line: 'Point to you and say: My name is …', emoji: '\u{1F449}' },
        { line: 'Jump, jump, jump!', emoji: '\u{1F998}' },
        { line: 'Wave goodbye and say: Bye!', emoji: '\u{1F64B}' },
      ],
    },
  },
  /* Reading: the first pages of Leo's story */
  {
    id: 'wt-reader', kind: 'reader', bg: bgL1Reading, title: 'Leo’s First Day', doneLine: 'Leo has a new friend! What happens next? Find out next time!',
    teacher: 'Reading: listen while the words light up, then the student reads the page (tap a word for help). Tap "Read it!" to turn the page.',
    pages: LEO_STORY.slice(0, 3),
  },
  {
    id: 'wt-read-match', kind: 'picture-match', prompt: 'Read and match',
    teacher: 'Reading: the student reads each sentence and drags it under its picture, then reads it aloud.',
    items: [
      { word: 'Leo is new.', img: leoStory(1) },
      { word: 'Hello! What’s your name?', img: leoStory(2) },
      { word: 'Goodbye, Leo!', img: leoStory(11) },
    ],
    bg: bgL1Circle,
  },
  /* Phonics (owner 2026-10-12: "don't forget phonic sounds, phonic games, blending games"): hear the sound → a
   * phonics game → Blend & Read → tongue twister. */
  {
    id: 'wt-sound-h', kind: 'sound-model', bg: bgL1Reading, who: 'pip', letter: 'H', phoneme: '/h/', sound: 'h', soundSide: 'center',
    teacher: 'Present: /h/ is a little puff of air — feel it on your hand! Find the /h/ words.',
    anchors: [
      { word: 'hello', emoji: '\u{1F44B}', img: spr('pip') },
      { word: 'hat', emoji: '\u{1F3A9}', img: '/lep1/items/item-hat.png' },
      { word: 'hen', emoji: '\u{1F414}', img: '/lep1/items/item-hen.png' },
      { word: 'house', emoji: '\u{1F3E0}', img: '/lep1/items/item-house.png' },
    ],
  },
  {
    id: 'wt-first-sound', kind: 'first-sound', bg: bgL1Reading, prompt: 'Catch the fish with the first sound!',
    teacher: 'Guided: hear the word, catch the fish with its first sound (the recorded sound plays). Is it /h/?',
    rounds: [
      { word: 'hat', letter: 'h', choices: ['h', 's', 'm'], img: '/lep1/items/item-hat.png' },
      { word: 'sun', letter: 's', choices: ['h', 's', 'p'], img: '/lep1/items/item-sun.png' },
      { word: 'hen', letter: 'h', choices: ['p', 'h', 'm'], img: '/lep1/items/item-hen.png' },
      { word: 'pig', letter: 'p', choices: ['h', 'm', 'p'], img: '/lep1/items/item-pig.png' },
      { word: 'house', letter: 'h', choices: ['s', 'h', 'p'], img: '/lep1/items/item-house.png' },
    ],
  },
  {
    id: 'wt-blend', kind: 'sound-blend', bg: bgL1Reading, look: 'frog',
    teacher: 'Reading: tap each sound (/h/ /i/), blend, find the picture — then the word jumps into a sentence and the student reads it.',
    rounds: [
      { word: 'hi', img: spr('leo'), sentence: 'Hi! I am Leo.' },
      { word: 'hen', img: '/lep1/items/item-hen.png', sentence: 'Hello, hen!' },
      { word: 'hat', img: '/lep1/items/item-hat.png', sentence: 'The hat is red.' },
    ],
  },
  { id: 'wt-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgL1Reading, who: 'pip', focus: 'h', teacher: 'Reading: quick reading! Listen to Pip, then say it slow, then faster.', line: 'Happy Hen hops.' },
  /* Free: the whole mini-conversation with a new friend */
  {
    id: 'wt-meet-leo', kind: 'roleplay', bg: leoStory(3), teacher: 'Free: the student is Pip and meets Leo. Say each of Pip’s lines — then swap and be Leo.', cast: ['pip', 'leo'],
    script: [
      { who: 'pip', line: 'Hello! My name is Pip. What’s your name?', repeat: true },
      { who: 'leo', line: 'Hi, Pip! My name is Leo.', repeat: true },
      { who: 'pip', line: 'Goodbye, Leo!', repeat: true },
      { who: 'leo', line: 'Goodbye, Pip!', repeat: true },
    ],
  },
  /* Check: the objective in the child's own words */
  { id: 'wt-i-can', kind: 'meet', focus: ['name'], bg: bgL1Circle, who: 'marigold', cardSide: 'left', teacher: 'Check: say it and get your passport stamp!', line: 'I can say hello and goodbye. I can ask: What’s your name?', repeat: 'I can say hello!' },
  {
    id: 'wt-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts Pip in their Sticker Book.',
    scene: {
      id: 'wt-sticker', kind: 'sticker-reward', bg: bgL1Party, who: 'pip', teacher: 'Sticker time! The student opens the pack and puts Pip in their Sticker Book.',
      line: 'You can say hello, ask a name and read Leo’s story! Here is your sticker.',
      sticker: { img: spr('pip'), label: 'Hello, Pip!' },
    },
  },
  {
    id: 'wt-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt-home-mission', kind: 'home-mission', bg: bgL1Class, who: 'pip',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned "Hello!", "Goodbye!", "What’s your name?" and "My name is …", and read the first pages of the story "Leo’s First Day". Let them greet you, ask your name and read you the story.',
      steps: [
        { emoji: '\u{1F44B}', say: 'Say hello and your name to two people.' },
        { emoji: '\u{2753}', say: 'Ask them: What’s your name?' },
        { emoji: '\u{1F4D6}', say: 'Read them Leo’s story.' },
      ],
    },
  },
  /* Extra time: the party maze — names + a greeting */
  {
    id: 'wt-party-maze', kind: 'prea1', teacher: 'Extra time (Guided): take Pip through the garden to the friend you hear, then say hello to them.',
    scene: {
      id: 'wt-party-maze', kind: 'picture-maze', bg: bgL1Party, who: 'pip', walker: spr('pip'), title: 'Find the friend! Say hello!', layout: 0,
      teacher: 'Take Pip to the friend you hear, then say hello to them.',
      items: [
        { label: 'Bella', img: spr('bella'), say: 'Hello, Bella!' },
        { label: 'Mia', img: spr('mia'), say: 'Hello, Mia!' },
        { label: 'Leo', img: spr('leo'), say: 'Hello, Leo!' },
      ],
      rounds: [2, 0, 1], doneLine: 'You said hello to all your friends!',
    },
  },
  {
    id: 'wt-goodbye-song', kind: 'song', bg: bgL1Goodbye, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'wt-finale', kind: 'finale', bg: leoStory(3), who: 'pip', line: 'You said hello, asked names and read Leo’s story! Bye-bye!' },
]);

/* =============================================================================
 * A1 Unit 1, Lesson 2: "How Are You?" (rebuilt 2026-10-09 to docs/a1-playground-roadmap.md)
 *
 * One goal: I can say how I feel and how my friends feel. How are you? → I am happy / tired / sad /
 * angry / hungry → boy = he, girl = she, boy + girl = they → He is… / She is… / They are….
 * Word pages (character on one side, word big on the open side) with a quick check after every two;
 * Move & Say, Quick fire, sticker and home mission are Pre-A1 games played inside the lesson ('prea1');
 * signature: the feelings spinner ("She is sad!") and Name That Feeling (listen-tap).
 * Phonics: P, I, N after Lesson 1's S, A, T → read SIT, PIN, PIP.
 * School supplies and in/on/next to moved out (they are Unit 2 language in the roadmap).
 * ========================================================================= */

export const LESSON_2_TITLE = 'How Are You?';
export const LESSON_2_OBJECTIVE = 'I can ask "How are you?", say how I feel and say how a friend feels: "I am tired. She is happy."';

/** A1 Unit 1 Lesson 2 uses 16:9 widenings of its square art (the
 *  original sits untouched in the centre; see scripts/outpaint-composite.py)
 *  so nothing is cropped off the top and bottom any more. */
const bgWideW = `${W}/scenes/bg-classroom-wide-wide.png`;
const bgCircleW = `${W}/scenes/bg-classroom-circle-wide.png`;
const bgVocabPipHappyW = `${W}/scenes/bg-vocab-pip-happy-wide.png`;
const bgVocabLeoTiredW = `${W}/scenes/bg-vocab-leo-tired-wide.png`;
const bgVocabMiaSadW = `${W}/scenes/bg-vocab-mia-sad-wide.png`;
const bgVocabBellaAngryW = `${W}/scenes/bg-vocab-bella-angry-wide.png`;
const bgVocabWillowHungryW = `${W}/scenes/bg-vocab-willow-hungry-wide.png`;
const bgFeelingsW = `${W}/scenes/bg-classroom-feelings-wide.png`;
const bgHeIntroPipW = `${W}/scenes/bg-heshe-intro-pip-wide.png`;
const bgHeSheTogetherW = `${W}/scenes/bg-heshe-together-wide.png`;
// Mia alone on the right, open wall on the left (bg-heshe-intro-mia.png widened 2026-10-09: wall + mirrored window half).
const bgHeIntroMiaW = `${W}/scenes/bg-heshe-intro-mia-wide.png`;
const bgReadingW = `${W}/scenes/bg-classroom-reading-wide.png`;
const bgSupplies2W = `${W}/scenes/bg-classroom-supplies2-wide.png`;
const bgPrepInW = `${W}/scenes/bg-prep-in-wide.png`;
const bgPrepOnW = `${W}/scenes/bg-prep-on-wide.png`;
const bgPrepNextToW = `${W}/scenes/bg-prep-next-to-wide.png`;
const bgExpressGoodbyeW = `${W}/scenes/bg-express-goodbye-wide.png`;

/** Feelings sprites (one per friend), used by the sort, quick-fire and sticker pages. */
// -v2 = regenerated 2026-10-09 in Canva (the wave sprite as reference): solid fills, whole bowl, no ground shadow.
const feelSpr = (name: string) => `${W}/sprites/${name}-v2.png`;
// Spinner badges sit above each friend's head on bg-classroom-feelings-wide.png (Pip, Leo, Mia, Bella, Willow).

/* Rebuilt 2026-10-12 to the approved Unit 1 plan (docs/a1-unit-1-welcome-town.md §5.2). Objective: I can ask
 * "How are you?", say how I feel and say how a friend feels ("I am tired. She is happy."). Reading: Leo's First Day
 * pages 3-5. Phonics: /a/ → Sound Pop → Blend & Read (Slide) → "Sad Sam sits." */
export const LESSON_2_SCENES: Scene[] = classroomLook([
  { id: 'wt2-title', kind: 'title-card', bg: leoStory(4), level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 2', title: 'How Are You?', subtitle: 'Say how you feel — and how your friends feel', cta: '\u{1F392} LET’S GO!' },
  {
    id: 'wt2-recall-warmup', kind: 'recall-warmup', bg: bgCircleW, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 1 · Hello, My Name Is…',
    teacher: 'Guided: Pip says a sentence from last lesson, the student finds the picture and says the sentence too.',
    items: [
      { word: 'hello', say: 'Find: Hello! What’s your name?', img: leoStory(2) },
      { word: 'new', say: 'Find: Leo is new.', img: leoStory(1) },
      { word: 'goodbye', say: 'Find: Goodbye, Leo!', img: leoStory(11) },
    ],
  },
  /* Present */
  {
    id: 'wt2-vocab-feelings', kind: 'vocab-spot', bg: bgFeelingsW,
    teacher: 'Present: tap each arrow, hear how the friend feels, make the face and say it.',
    items: [
      { label: 'Happy', sentence: 'I am happy.', emoji: '\u{1F60A}', left: '29.8%', top: '54.5%', color: '#FE6A2F', who: 'pip' },
      { label: 'Tired', sentence: 'I am tired.', emoji: '\u{1F62A}', left: '40.4%', top: '55.6%', color: '#C97A2F', who: 'leo' },
      { label: 'Sad', sentence: 'I am sad.', emoji: '\u{1F622}', left: '51.1%', top: '57.9%', color: '#B85CD1', who: 'mia' },
      { label: 'Angry', sentence: 'I am angry.', emoji: '\u{1F620}', left: '61.8%', top: '56.8%', color: '#E76FA5', who: 'bella' },
      { label: 'Hungry', sentence: 'I am hungry.', emoji: '\u{1F924}', left: '72.5%', top: '57.9%', color: '#4FA9E0', who: 'willow' },
    ],
  },
  {
    id: 'wt2-howareyou', kind: 'meet', focus: ['How are you'], bg: bgCircleW, who: 'marigold',
    teacher: 'Present: listen to the question and the answer. Then say it: I am fine, thank you!',
    line: 'How are you today? I am fine, thank you!', repeat: 'How are you?',
  },
  {
    id: 'wt2-he-she', kind: 'meet', look: 'word', word: 'He / She', wordNote: '\u{1F466} boy = he · \u{1F467} girl = she', focus: ['He', 'She'], bg: bgHeSheTogetherW, who: 'pip',
    teacher: 'Present: point to Pip — he! Point to Mia — she! Say it.',
    line: 'He is happy. She is happy. They are happy!', repeat: 'She is happy!',
  },
  { id: 'wt2-echo-howareyou', kind: 'echo', bg: bgCircleW, who: 'pip', textSide: 'top', teacher: 'Guided: say the question with Pip.', word: 'How are you?' },
  /* Guided */
  {
    id: 'wt2-feelings-mirror', kind: 'listen-tap', bg: bgFeelingsW, teacher: 'Guided: listen — how does the friend feel? Tap them, then say it: I am hungry!',
    targets: [
      { label: 'Happy', left: '29.8%', top: '54.5%', color: '#FE6A2F' },
      { label: 'Tired', left: '40.4%', top: '55.6%', color: '#C97A2F' },
      { label: 'Sad', left: '51.1%', top: '57.9%', color: '#B85CD1' },
      { label: 'Angry', left: '61.8%', top: '56.8%', color: '#E76FA5' },
      { label: 'Hungry', left: '72.5%', top: '57.9%', color: '#4FA9E0' },
    ],
    rounds: [
      { prompt: 'I want my lunch! I am …', answerLabel: 'Hungry', who: 'willow' },
      { prompt: 'Yawn! I want my bed! I am …', answerLabel: 'Tired', who: 'leo' },
      { prompt: 'Oh no! My cap is lost! I am …', answerLabel: 'Sad', who: 'mia' },
      { prompt: 'Hooray! A party! I am …', answerLabel: 'Happy', who: 'pip' },
      { prompt: 'Grr! My tower fell down! I am …', answerLabel: 'Angry', who: 'bella' },
    ],
  },
  {
    id: 'wt2-feelings-claw', kind: 'prea1', teacher: 'Guided: Feelings Grabber! Listen, grab the right friend, then say: He is … / She is …',
    scene: {
      id: 'wt2-feelings-claw', kind: 'claw-machine', bg: '/lep1/scenes/bg-u3l6-claw-machine-wide.png', who: 'pip', clawImg: '/lep1/items/item-claw.png',
      teacher: 'Listen, grab the right friend, then say: He is … / She is …',
      glass: { x: 49, y: 43, w: 50, h: 52 },
      toys: [
        { label: 'Pip', img: feelSpr('pip-happy'), x: 12, size: 9 },
        { label: 'Mia', img: feelSpr('mia-sad'), x: 31, size: 9 },
        { label: 'Leo', img: feelSpr('leo-tired'), x: 50, size: 9 },
        { label: 'Willow', img: feelSpr('willow-hungry'), x: 69, size: 9 },
        { label: 'Bella', img: feelSpr('bella-angry'), x: 88, size: 9 },
      ],
      rounds: [
        { target: 2, line: 'Get the friend who is tired!', reply: 'Leo! He is tired!' },
        { target: 3, line: 'Get the friend who is hungry!', reply: 'Willow! She is hungry!' },
        { target: 0, line: 'Get the friend who is happy!', reply: 'Pip! He is happy!' },
        { target: 1, line: 'Get the friend who is sad!', reply: 'Mia! She is sad!' },
      ],
    },
  },
  /* The lesson song after the words + a first game */
  {
    id: 'wt2-hello-song', kind: 'song', bg: bgL1Class, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Guided: sing and show — wave on hello, point to yourself on name. Then ask: How are you?',
    durationSeconds: 20, bigWord: 'Hello',
    songUrl: `${W}/audio/hello-song.mp3?v=1`,
    lineDurationsMs: [3640, 4120, 4320, 7982],
    lyrics: [
      { who: 'marigold', text: 'Hello, hello, hello to you!' },
      { who: 'pip', text: 'Hi, hi, hi! And hi to you!' },
      { who: 'marigold', text: 'What’s your name? What’s your name?' },
      { who: 'pip', text: 'Say your name! Say your name!' },
    ],
  },
  /* Free */
  {
    id: 'wt2-feelings-survey', kind: 'feelings-survey', bg: bgCircleW, who: 'pip',
    title: 'Pip’s Feelings Survey',
    intro: 'Let’s ask our friends: How are you? Tap a friend!',
    teacher: 'Free: the student taps a friend and ASKS out loud "How are you, Leo?", then taps "I asked!". The friend answers; the student marks the face. At the end the student says one: "Leo is hungry."',
    friends: [
      { who: 'leo', name: 'Leo', feeling: 'hungry', img: spr('leo') },
      { who: 'mia', name: 'Mia', feeling: 'happy', img: spr('mia') },
      { who: 'bella', name: 'Bella', feeling: 'tired', img: spr('bella') },
      { who: 'willow', name: 'Willow', feeling: 'sad', img: spr('willow') },
    ],
    faces: [
      { feeling: 'happy', emoji: '\u{1F60A}', color: '#FE6A2F' },
      { feeling: 'tired', emoji: '\u{1F62A}', color: '#C97A2F' },
      { feeling: 'sad', emoji: '\u{1F622}', color: '#B85CD1' },
      { feeling: 'angry', emoji: '\u{1F620}', color: '#E76FA5' },
      { feeling: 'hungry', emoji: '\u{1F924}', color: '#4FA9E0' },
    ],
  },
  {
    id: 'wt2-answer', kind: 'join-stage', bg: bgCircleW, teacher: 'Free: how does the student really feel today? Then they ask the teacher, and tell how Pip is.', cast: ['marigold', 'pip'],
    turns: [
      { who: 'marigold', line: 'How are you today?' },
      { who: 'student', line: 'I am … today. How are you?' },
      { who: 'marigold', line: 'I am happy, thank you! How is Pip?' },
      { who: 'student', line: 'He is …' },
    ],
  },
  {
    id: 'wt2-feelings-freeze', kind: 'prea1', teacher: 'Brain break: dance, then FREEZE with the face Pip says.',
    scene: {
      id: 'wt2-feelings-freeze', kind: 'tpr-actions', mode: 'break', bg: '/lep1/scenes/bg-u3l4-room-empty-wide.png', who: 'pip',
      teacher: 'Dance, then FREEZE with the face Pip says.',
      rounds: [
        { line: 'Dance, dance! Freeze! Show me happy!', emoji: '\u{1F60A}' },
        { line: 'Dance, dance! Freeze! Show me tired!', emoji: '\u{1F62A}' },
        { line: 'Dance, dance! Freeze! Show me sad!', emoji: '\u{1F622}' },
        { line: 'Dance, dance! Freeze! Show me hungry!', emoji: '\u{1F924}' },
      ],
    },
  },
  /* Reading */
  {
    id: 'wt2-reader', kind: 'reader', bg: bgL1Reading, title: 'Leo’s First Day', doneLine: 'Poor Leo! Where is his red cap? Find out next time!',
    teacher: 'Reading: page 3 again, then the new pages. Listen while the words light up, then the student reads Leo’s line: I am sad.',
    pages: LEO_STORY.slice(2, 5),
  },
  {
    id: 'wt2-read-drag', kind: 'drag-match', bg: bgFeelingsW, teacher: 'Reading: read each sentence and drag it onto the friend. Then read it aloud.',
    items: [
      { label: 'He is happy.', color: '#FE6A2F', who: 'pip', targetLeft: '29.8%', targetTop: '54.5%' },
      { label: 'He is tired.', color: '#C97A2F', who: 'leo', targetLeft: '40.4%', targetTop: '55.6%' },
      { label: 'She is sad.', color: '#B85CD1', who: 'mia', targetLeft: '51.1%', targetTop: '57.9%' },
      { label: 'She is angry.', color: '#E76FA5', who: 'bella', targetLeft: '61.8%', targetTop: '56.8%' },
      { label: 'She is hungry.', color: '#4FA9E0', who: 'willow', targetLeft: '72.5%', targetTop: '57.9%' },
    ],
  },
  /* Phonics: the sound → a phonics game → Blend & Read → tongue twister */
  {
    id: 'wt2-sound-a', kind: 'sound-model', bg: bgL1Reading, who: 'mia', letter: 'A', phoneme: '/a/', sound: 'a', soundSide: 'center',
    teacher: 'Present: /a/ — open your mouth wide like for an apple! Find the /a/ words.',
    anchors: [
      { word: 'apple', emoji: '\u{1F34E}', img: '/lep1/items/item-apple.png' },
      { word: 'ant', emoji: '\u{1F41C}', img: '/lep1/items/item-ant.png' },
      { word: 'cat', emoji: '\u{1F431}', img: '/lep1/items/item-cat.png' },
      { word: 'sad', emoji: '\u{1F622}', img: feelSpr('mia-sad') },
    ],
  },
  {
    id: 'wt2-sound-pop', kind: 'prea1', teacher: 'Guided: Sound Pop! Mia says /a/ — pop only the A balloons and say a word with /a/: apple, ant, cat.',
    scene: {
      id: 'wt2-sound-pop', kind: 'sound-pop', bg: bgL1Reading, who: 'mia', goal: 5, seconds: 45,
      teacher: 'Pop only the A balloons! /a/ like apple!',
      targets: [{ letter: 'A', phoneme: '/a/' }],
      items: [
        { word: 'apple', letter: 'A', img: '/lep1/items/item-apple.png', emoji: '\u{1F34E}' },
        { word: 'ant', letter: 'A', img: '/lep1/items/item-ant.png', emoji: '\u{1F41C}' },
        { word: 'alligator', letter: 'A', img: '/lep1/items/item-alligator.png', emoji: '\u{1F40A}' },
        { word: 'dog', letter: 'D', img: '/lep1/items/item-dog.png', emoji: '\u{1F436}' },
        { word: 'sun', letter: 'S', img: '/lep1/items/item-sun.png', emoji: '\u{2600}\u{FE0F}' },
        { word: 'fish', letter: 'F', img: '/lep1/items/item-fish.png', emoji: '\u{1F41F}' },
      ],
    },
  },
  {
    id: 'wt2-blend', kind: 'sound-blend', bg: bgL1Reading, look: 'slide',
    teacher: 'Reading: say each sound, blend, find the picture — then read the sentence from Leo’s story.',
    rounds: [
      { word: 'sad', img: feelSpr('mia-sad'), sentence: 'Leo is sad.' },
      { word: 'cap', img: '/lep1/items/item-cap.png', sentence: 'My red cap is lost.' },
      { word: 'cat', img: '/lep1/items/item-cat.png', sentence: 'Look at the cat!' },
    ],
  },
  { id: 'wt2-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgL1Reading, who: 'mia', focus: 's|a', teacher: 'Reading: quick reading! Listen to Mia, then say it slow, then faster.', line: 'Sad Sam sits.' },
  /* Check + close */
  { id: 'wt2-i-can', kind: 'meet', focus: ['How are you'], bg: bgCircleW, who: 'marigold', cardSide: 'left', teacher: 'Check: say it and get your passport stamp!', line: 'I can ask: How are you? I can say: I am happy. She is tired.', repeat: 'How are you?' },
  {
    id: 'wt2-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts happy Pip in their Sticker Book.',
    scene: {
      id: 'wt2-sticker', kind: 'sticker-reward', bg: bgWideW, who: 'pip', teacher: 'Sticker time! The student opens the pack and puts happy Pip in their Sticker Book.',
      line: 'You can ask how friends are — and say how they feel! Here is your sticker.',
      sticker: { img: feelSpr('pip-happy'), label: 'I am happy!' },
    },
  },
  {
    id: 'wt2-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt2-home-mission', kind: 'home-mission', bg: bgCircleW, who: 'pip',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned "How are you?", "I am happy / tired / sad / hungry" and "He is… / She is…", and read pages 3-5 of "Leo’s First Day". Ask them how they feel, and let them ask you.',
      steps: [
        { emoji: '\u{2753}', say: 'Ask three people: How are you?' },
        { emoji: '\u{1F58D}\u{FE0F}', say: 'Draw their faces: happy, tired, sad…' },
        { emoji: '\u{1F4D6}', say: 'Read Leo’s story to them.' },
      ],
    },
  },
  {
    id: 'wt2-pronoun-sort', kind: 'pronoun-sort', bg: bgFeelingsW, teacher: 'Extra time (Guided): drag each friend to He, She or They — then say it: She is sad!',
    rounds: [
      { who: 'pip', img: feelSpr('pip-happy'), emotion: 'happy', answer: 'He' },
      { who: 'mia', img: feelSpr('mia-sad'), emotion: 'sad', answer: 'She' },
      { who: 'leo', img: feelSpr('leo-tired'), emotion: 'tired', answer: 'He' },
      { who: 'bella', img: feelSpr('bella-angry'), emotion: 'angry', answer: 'She' },
      { who: 'willow', img: feelSpr('willow-hungry'), emotion: 'hungry', answer: 'She' },
      { who: ['pip', 'mia'], img: [feelSpr('pip-happy'), feelSpr('mia-sad')], emotion: 'happy and sad', answer: 'They' },
    ],
  },
  {
    id: 'wt2-goodbye-song', kind: 'song', bg: bgExpressGoodbyeW, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'wt2-finale', kind: 'finale', bg: leoStory(5), who: 'pip', line: 'You can ask "How are you?" and say how friends feel — and you read Leo’s story! ✨\u{1F3C6}' },
]);

/* =============================================================================
 * A1 Unit 1, Lesson 3: "Listen to the Greetings Song" (curriculum slot; rebuilt 2026-10-10)
 *
 * Curriculum (curriculum_lessons, A1 U1 L3): the unit's LISTENING lesson. No new words: the greetings of
 * Lessons 1-2 come back inside a song, and the child listens for detail (who sings which line), builds and
 * answers the lines, then leads the song. Follows the 22-slide lesson blueprint slot by slot (see the slot
 * comments); extras at the end are optional. Phonics: a tongue twister reviewing s a t p i n.
 * * ========================================================================= */

export const LESSON_3_TITLE = 'How Old Are You? Numbers 1-20';
export const LESSON_3_OBJECTIVE = 'I can count and say the numbers 1-20, ask "How old are you?" and say my age: "I am seven."';



/* Rebuilt 2026-10-12 (owner: "add numbers from 1 to 20 … as far as the students say their age … first modeling, then
 * memorising the numbers, then the practice in which they practise how old they are"). docs/a1-unit-1-welcome-town.md §5.3.
 * A MODEL (1-10, 11-20, How old are you? I am seven.) → B MEMORISE (Number Tap, count the balloons to 20) → C AGE
 * (Birthday Balloons, Age Match, answer + ask) → reading, phonics (/t/ ten), free interview. */
export const LESSON_3_SCENES: Scene[] = classroomLook([
  { id: 'wt3-title', kind: 'title-card', bg: bgL1Party, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 3', title: 'How Old Are You?', subtitle: 'Count to 20 — and say how old you are!', cta: '\u{1F382} LET’S GO!' },
  {
    id: 'wt3-recall-warmup', kind: 'recall-warmup', bg: bgCircleW, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 2 · How Are You?',
    teacher: 'Guided: Pip says how a friend feels, the student finds the picture and says it too.',
    items: [
      { word: 'sad', say: 'Find: She is sad!', img: feelSpr('mia-sad') },
      { word: 'tired', say: 'Find: He is tired!', img: feelSpr('leo-tired') },
      { word: 'hungry', say: 'Find: She is hungry!', img: feelSpr('willow-hungry') },
    ],
  },
  /* A — MODELING */
  {
    id: 'wt3-numbers-1-10', kind: 'prea1', teacher: 'Present: count 1 to 10 with Pip — tap each number, say it, show it with your fingers.',
    scene: { id: 'wt3-numbers-1-10', kind: 'numbers-learn', bg: bgL1Party, who: 'pip', from: 1, to: 10, teacher: 'Tap each number, listen and say it. Show it with your fingers!' },
  },
  {
    id: 'wt3-numbers-11-20', kind: 'prea1', teacher: 'Present: the new numbers 11 to 20. Stretch and clap the end: four-TEEN! Then twenty.',
    scene: { id: 'wt3-numbers-11-20', kind: 'numbers-learn', bg: bgL1Party, who: 'mia', from: 11, to: 20, teacher: 'New numbers! Tap each one, listen and say it: eleven, twelve, thirteen…' },
  },
  { id: 'wt3-how-old', kind: 'meet', focus: ['How old'], bg: leoStory(3), who: 'leo', cardSide: 'left', teacher: 'Present: listen to Leo. Show seven fingers and say: I am seven!', line: 'How old are you? I am seven!', repeat: 'I am seven!' },
  { id: 'wt3-echo', kind: 'echo', bg: bgL1Peers, who: 'pip', textSide: 'top', teacher: 'Guided: say the question with Pip.', word: 'How old are you?' },
  /* B — MEMORISE THE NUMBERS */
  {
    id: 'wt3-number-tap', kind: 'prea1', teacher: 'Guided: Number Tap! Pip says a number from 1 to 20 — tap it and say it.',
    scene: { id: 'wt3-number-tap', kind: 'numbers-review', bg: bgL1Party, who: 'pip', from: 1, to: 20, teacher: 'Tap the number Pip says!' },
  },
  {
    id: 'wt3-count-balloons', kind: 'prea1', teacher: 'Guided: count to 20! Pop the balloons one by one and count with Pip.',
    scene: { id: 'wt3-count-balloons', kind: 'count-balloons', bg: '/lep1/scenes/bg-l4-plain-sky.jpg', who: 'pip', total: 20, teacher: 'Twenty balloons! Pop them one by one and count with Pip!' },
  },
  {
    id: 'wt3-count-jump', kind: 'prea1', teacher: 'Brain break: count and move with Pip!',
    scene: {
      id: 'wt3-count-jump', kind: 'tpr-actions', mode: 'break', bg: bgL1Circle, who: 'pip', teacher: 'Count and move with Pip!',
      rounds: [
        { line: 'Jump and count: one, two, three, four, five!', emoji: '\u{1F998}' },
        { line: 'Clap and count: six, seven, eight, nine, ten!', emoji: '\u{1F44F}' },
        { line: 'Stamp and count: eleven, twelve, thirteen, fourteen, fifteen!', emoji: '\u{1F463}' },
        { line: 'Stretch and count: sixteen, seventeen, eighteen, nineteen, twenty!', emoji: '\u{1F64C}' },
      ],
    },
  },
  /* C — PRACTISE: HOW OLD ARE YOU? */
  {
    id: 'wt3-age-balloons', kind: 'prea1', teacher: 'Guided: tap a friend, count their birthday balloons, then say: Mia is six!',
    scene: {
      id: 'wt3-age-balloons', kind: 'age-balloons', bg: '/lep1/scenes/bg-l4-plain-sky.jpg', teacher: 'Tap a friend! Count the balloons, then say: Mia is six!',
      friends: [{ who: 'mia', age: 6 }, { who: 'leo', age: 7 }, { who: 'pip', age: 8 }, { who: 'bella', age: 9 }],
    },
  },
  {
    id: 'wt3-age-match', kind: 'prea1', teacher: 'Reading: read each sentence and drag it to the right friend. Then read it aloud.',
    scene: {
      id: 'wt3-age-match', kind: 'age-sentence-match', bg: '/lep1/scenes/bg-l4-plain-sky.jpg', teacher: 'Read the sentence and drag it to the friend!',
      friends: [{ who: 'mia', age: 6 }, { who: 'leo', age: 7 }, { who: 'pip', age: 8 }],
    },
  },
  {
    id: 'wt3-your-age', kind: 'join-stage', bg: bgL1Circle, teacher: 'Free: Miss Marigold asks — the student answers with their real age, then asks her.', cast: ['marigold', 'pip'],
    turns: [
      { who: 'marigold', line: 'Hello! How old are you?' },
      { who: 'student', line: 'I am … How old are you?' },
      { who: 'marigold', line: 'I am fifty! Ha ha! How old is Pip?' },
      { who: 'student', line: 'He is eight!' },
    ],
  },
  /* Reading */
  {
    id: 'wt3-reader', kind: 'reader', bg: bgL1Reading, title: 'Leo’s First Day: How old are you?', doneLine: 'Leo is seven and Pip is eight. Next time: Leo’s red cap!',
    teacher: 'Reading: listen while the words light up, then the student reads Leo’s and Pip’s lines.',
    pages: [
      { img: leoStory(3), lines: [{ who: 'pip', text: 'How old are you, Leo?' }, { who: 'leo', text: 'I am seven. How old are you?' }] },
      { img: leoStory(2), lines: [{ who: 'pip', text: 'I am eight!' }, { who: 'leo', text: 'Eight? Wow!' }] },
    ],
  },
  /* Phonics: the sound → Sound Mole → Blend & Read → tongue twister */
  {
    id: 'wt3-sound-t', kind: 'sound-model', bg: bgL1Reading, who: 'leo', letter: 'T', phoneme: '/t/', sound: 't', soundSide: 'center',
    teacher: 'Present: /t/ — tap your tongue behind your teeth! Ten, two, teddy, top. Find the /t/ words.',
    anchors: [
      { word: 'ten', emoji: '\u{1F51F}', img: '/lep1/items/item-ten.png' },
      { word: 'two', emoji: '2\u{FE0F}\u{20E3}', img: '/lep1/items/item-two.png' },
      { word: 'teddy', emoji: '\u{1F9F8}', img: '/lep1/items/item-teddy.png' },
      { word: 'top', emoji: '\u{1F9F8}', img: '/lep1/items/item-top.png' },
    ],
  },
  {
    id: 'wt3-sound-mole', kind: 'prea1', teacher: 'Guided: Sound Moles! Hear /t/, bonk every mole whose picture starts with /t/ and say it.',
    scene: {
      id: 'wt3-sound-mole', kind: 'sound-mole', bg: bgL1Reading, who: 'leo', teacher: 'Hear the sound, then bonk every mole whose picture starts with it!',
      rounds: [
        { letter: 't', pictures: [{ word: 'ten', img: '/lep1/items/item-ten.png' }, { word: 'teddy', img: '/lep1/items/item-teddy.png' }, { word: 'top', img: '/lep1/items/item-top.png' }, { word: 'hat', img: '/lep1/items/item-hat.png' }, { word: 'sun', img: '/lep1/items/item-sun.png' }] },
      ],
    },
  },
  {
    id: 'wt3-blend', kind: 'sound-blend', bg: bgL1Reading, look: 'gumball',
    teacher: 'Reading: say each sound, blend, find the picture — then read the age sentence.',
    rounds: [
      { word: 'ten', img: '/lep1/items/item-ten.png', sentence: 'I am ten.' },
      { word: 'top', img: '/lep1/items/item-top.png', sentence: 'The top is red.' },
      { word: 'two', sounds: ['t', 'oo'], img: '/lep1/items/item-two.png', sentence: 'Two friends say hello.' },
    ],
  },
  { id: 'wt3-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgL1Reading, who: 'leo', focus: 't', teacher: 'Reading: quick reading! Listen to Leo, then say it slow, then faster.', line: 'Ten tiny teddies.' },
  /* Free: the birthday interview */
  {
    id: 'wt3-interview', kind: 'join-stage', bg: bgL1Party, teacher: 'Free: the student interviews Pip — name and age — then tells the teacher about him.', cast: ['pip', 'marigold'],
    turns: [
      { who: 'student', line: 'Hello! What’s your name?' },
      { who: 'pip', line: 'My name is Pip.' },
      { who: 'student', line: 'How old are you?' },
      { who: 'pip', line: 'I am eight!' },
      { who: 'student', line: 'This is Pip. He is eight.' },
    ],
  },
  { id: 'wt3-i-can', kind: 'meet', focus: ['How old'], bg: bgL1Circle, who: 'marigold', cardSide: 'left', teacher: 'Check: count to 20, then say it and get your passport stamp!', line: 'I can count to twenty. I can ask: How old are you? I am …', repeat: 'How old are you?' },
  {
    id: 'wt3-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the birthday sticker in their Sticker Book.',
    scene: {
      id: 'wt3-sticker', kind: 'sticker-reward', bg: bgL1Party, who: 'pip', teacher: 'Sticker time!',
      line: 'You can count to twenty and say how old you are! Here is your sticker.',
      sticker: { img: '/lep1/items/item-ten.png', label: 'I can count!' },
    },
  },
  {
    id: 'wt3-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt3-home-mission', kind: 'home-mission', bg: bgL1Class, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned the numbers 1-20 and "How old are you? — I am seven." Count to 20 together and let them ask your age.',
      steps: [
        { emoji: '\u{1F522}', say: 'Count to twenty with your family.' },
        { emoji: '\u{2753}', say: 'Ask three people: How old are you?' },
        { emoji: '\u{1F382}', say: 'Say: I am … (your age!)' },
      ],
    },
  },
  {
    id: 'wt3-quick-numbers', kind: 'prea1', teacher: 'Extra time (Guided): Number Tap again, faster! Tap 11 to 20 as Pip says them.',
    scene: { id: 'wt3-quick-numbers', kind: 'numbers-review', bg: bgL1Circle, who: 'mia', from: 11, to: 20, teacher: 'Tap the number Mia says!' },
  },
  {
    id: 'wt3-goodbye-song', kind: 'song', bg: bgL1Goodbye, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'wt3-finale', kind: 'finale', bg: bgL1Party, who: 'pip', line: 'You counted to twenty and said how old you are! ✨\u{1F382}' },
]);


/* =============================================================================
 * A1 Unit 1, Lesson 4: "Meet a Friend: Speak!" (curriculum slot; rebuilt 2026-10-10)
 *
 * Curriculum (curriculum_lessons, A1 U1 L4): the unit's SPEAKING lesson. Objective: have a short greeting
 * conversation (greet a classmate and ask how they are). Language: hello / hi / goodbye, "What's your name?
 * - My name is …", "How are you? - I am fine / happy / sad". No new grammar: everything from Lessons 1-3
 * comes together in ONE conversation the child says out loud, turn by turn.
 * Story frame (new setting after L3's concert): break time on the school playground — Pip goes round the
 * playground and talks to his friends; then a new friend, Bella, arrives, and the child has the whole chat.
 * Follows the 22-slide lesson blueprint slot by slot (see the slot comments); extras at the end are optional.
 * Research (mechanics only): Duolingo "complete the chat" + Stories, Novakid / LingoAce speech-bubble replies,
 * Cambridge Pre A1 Starters / A1 Movers speaking "ask and answer", Lingokids role-play. Signature mechanic:
 * Chat Chain (scene-components/ChatChainScene.tsx). Phonics: Blend It! review (dog, bed, bag, fan).
 * ========================================================================= */

export const LESSON_4_TITLE = 'This Is My Friend!';
export const LESSON_4_OBJECTIVE = 'I can introduce a friend — "This is my friend Leo." — answer "Nice to meet you!" and hold a 6-line conversation.';

const bgPlay = `${W}/scenes/bg-playground-break-wide.png`;

/* Rebuilt 2026-10-12 to the approved Unit 1 plan (docs/a1-unit-1-welcome-town.md §5.4): the speaking lesson, the
 * child is the expert. Objective: I can introduce a friend — "This is my friend Leo." — answer "Nice to meet you!" and
 * hold a 6-line conversation. Reading: Leo's First Day pages 5-8. Phonics: /f/ → Letter Monsters → Blend & Read (train)
 * → "Fun Fred finds a frog." */
export const LESSON_4_SCENES: Scene[] = classroomLook([
  { id: 'wt4-title', kind: 'title-card', bg: leoStory(6), level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 4', title: 'This Is My Friend!', subtitle: 'Introduce a friend and say: Nice to meet you!', cta: '\u{1F91D} LET’S GO!' },
  {
    id: 'wt4-recall-warmup', kind: 'recall-warmup', bg: bgL1Party, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Lesson 3 · How Old Are You?',
    // Owner 2026-10-12: "Find ten is too easy … add characters and audio: his name is Leo and he is seven, her name is
    // Mia and she is six … the student hears and clicks on the character" — names + he/she + age in one listening task.
    teacher: 'Guided: listen — who is it? Click the friend, then say it too: His name is Leo. He is seven!',
    items: [
      { word: 'Leo', say: 'His name is Leo. He is seven years old.', img: spr('leo') },
      { word: 'Mia', say: 'Her name is Mia. She is six years old.', img: spr('mia') },
      { word: 'Pip', say: 'His name is Pip. He is eight years old.', img: spr('pip') },
      { word: 'Bella', say: 'Her name is Bella. She is nine years old.', img: spr('bella') },
    ],
  },
  /* Present */
  { id: 'wt4-this-is', kind: 'meet', focus: ['This is my friend'], bg: leoStory(6), who: 'pip', cardSide: 'left', teacher: 'Present: open your hand towards the friend and say: This is my friend Leo.', line: 'Mia, this is my friend Leo.', repeat: 'This is my friend Leo.' },
  { id: 'wt4-nice', kind: 'meet', focus: ['Nice to meet you'], bg: leoStory(6), who: 'mia', cardSide: 'right', teacher: 'Present: shake hands and say: Nice to meet you!', line: 'Hello, Leo! Nice to meet you.', repeat: 'Nice to meet you!' },
  { id: 'wt4-echo', kind: 'echo', bg: bgL1Peers, who: 'leo', textSide: 'top', teacher: 'Guided: the answer — say it with Leo.', word: 'Nice to meet you, too!' },
  /* Guided */
  {
    id: 'wt4-chat-chain', kind: 'chat-chain', bg: bgL1Circle, partner: 'bella', title: 'Chat with Bella',
    intro: 'Hi! Let’s talk!',
    teacher: 'Guided: Bella talks, the student picks the reply that fits and SAYS it out loud, then taps “I said it”.',
    turns: [
      { who: 'bella', line: 'Hello! What’s your name?' },
      { who: 'student', line: 'My name is … What’s your name?', wrong: ['I am sad.', 'Goodbye!'] },
      { who: 'bella', line: 'My name is Bella. Nice to meet you!' },
      { who: 'student', line: 'Nice to meet you, too!', wrong: ['How old are you?', 'See you!'] },
      { who: 'bella', line: 'How old are you?' },
      { who: 'student', line: 'I am … How old are you?', wrong: ['My name is Bella.', 'Hello!'] },
      { who: 'bella', line: 'I am nine! Oh, the bell! Goodbye!' },
      { who: 'student', line: 'Goodbye, Bella! See you!', wrong: ['I am happy.', 'What’s your name?'] },
    ],
  },
  {
    id: 'wt4-sing-back', kind: 'song', bg: bgL1Class, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Guided: now the student leads the song and the teacher answers — then add a line: This is my friend …!',
    durationSeconds: 20, bigWord: 'Hello',
    songUrl: `${W}/audio/hello-song.mp3?v=1`,
    lineDurationsMs: [3640, 4120, 4320, 7982],
    lyrics: [
      { who: 'marigold', text: 'Hello, hello, hello to you!' },
      { who: 'pip', text: 'Hi, hi, hi! And hi to you!' },
      { who: 'marigold', text: 'What’s your name? What’s your name?' },
      { who: 'pip', text: 'Say your name! Say your name!' },
    ],
  },
  /* Free: the signature game and the child-is-the-expert moment */
  {
    id: 'wt4-guess-friend', kind: 'prea1', teacher: 'Free: Guess My Friend! The student ASKS "Is it yellow?" / "Is it Leo?" until one friend is left — then introduces them: This is my friend Leo!',
    scene: {
      id: 'wt4-guess-friend', kind: 'secret-card', bg: bgL1Circle, who: 'pip',
      teacher: 'Ask Pip! Is it yellow? Is it Leo? Then say: This is my friend …!',
      cards: [
        { colorWord: 'Yellow', colorHex: '#F5C542', shape: 'circle', img: spr('leo'), word: 'Leo', person: true },
        { colorWord: 'Gray', colorHex: '#9CA3AF', shape: 'circle', img: spr('mia'), word: 'Mia', person: true },
        { colorWord: 'White', colorHex: '#F3F4F6', shape: 'circle', img: spr('bella'), word: 'Bella', person: true },
        { colorWord: 'Blue', colorHex: '#60A5FA', shape: 'circle', img: spr('willow'), word: 'Willow', person: true },
        { colorWord: 'Orange', colorHex: '#FE6A2F', shape: 'circle', img: spr('pip'), word: 'Pip', person: true },
      ],
      rounds: [{ secret: 0 }, { secret: 3 }],
    },
  },
  {
    id: 'wt4-expert', kind: 'join-stage', bg: leoStory(6), teacher: 'Free: the student is the expert! Pip mixes up the names — the student corrects him and introduces everyone.', cast: ['pip', 'mia'],
    turns: [
      { who: 'pip', line: 'Look! This is my friend Bella!' },
      { who: 'student', line: 'No, Pip! This is Mia!' },
      { who: 'pip', line: 'Oops! Thank you! And who is this?' },
      { who: 'student', line: 'This is my friend Leo. He is seven.' },
      { who: 'mia', line: 'Nice to meet you, Leo!' },
    ],
  },
  {
    id: 'wt4-move-break', kind: 'prea1', teacher: 'Brain break: wave, shake hands and move with Pip.',
    scene: {
      id: 'wt4-move-break', kind: 'tpr-actions', mode: 'break', bg: bgL1Circle, who: 'pip', teacher: 'Wave, shake hands and move with Pip!',
      rounds: [
        { line: 'Wave and say: Hello!', emoji: '\u{1F44B}' },
        { line: 'Shake hands and say: Nice to meet you!', emoji: '\u{1F91D}' },
        { line: 'Point to a friend and say: This is my friend!', emoji: '\u{1F449}' },
        { line: 'Jump and say: Goodbye!', emoji: '\u{1F998}' },
      ],
    },
  },
  /* Reading */
  {
    id: 'wt4-reader', kind: 'reader', bg: bgL1Reading, title: 'Leo’s First Day', doneLine: 'A red hat, not a cap! Where is Leo’s cap? Find out in the storybook!',
    teacher: 'Reading: page 5 again, then the new pages. Listen while the words light up, then the student reads Mia’s and Bella’s lines.',
    pages: LEO_STORY.slice(4, 8),
  },
  {
    id: 'wt4-read-choose', kind: 'grammar-gap', bg: bgL1Reading, title: 'Read and Choose',
    teacher: 'Reading: read the sentence from the story and choose the missing word. Then read it all.',
    rounds: [
      { before: 'Mia,', after: 'is my friend Leo.', choices: ['this', 'he'], answer: 'this', img: leoStory(6) },
      { before: 'Hello, Leo! Nice to', after: 'you.', choices: ['meet', 'eat'], answer: 'meet', img: leoStory(6) },
      { before: 'Look! A red', after: '!', choices: ['cap', 'cat'], answer: 'cap', img: leoStory(7) },
      { before: 'No, no! That is my red', after: '!', choices: ['hat', 'cap'], answer: 'hat', img: leoStory(8) },
    ],
  },
  /* Phonics: the sound → Letter Monsters → Blend & Read → tongue twister */
  {
    id: 'wt4-sound-f', kind: 'sound-model', bg: bgL1Reading, who: 'willow', letter: 'F', phoneme: '/f/', sound: 'f', soundSide: 'center',
    teacher: 'Present: /f/ — top teeth on your lip and blow! Fish, fan, frog, feather. Find the /f/ words.',
    anchors: [
      { word: 'fish', emoji: '\u{1F41F}', img: '/lep1/items/item-fish.png' },
      { word: 'fan', emoji: '\u{1FAAD}', img: '/lep1/items/item-fan.png' },
      { word: 'frog', emoji: '\u{1F438}', img: '/lep1/items/item-frog.png' },
      { word: 'feather', emoji: '\u{1FAB6}', img: '/lep1/items/item-feather.png' },
    ],
  },
  {
    id: 'wt4-letter-monsters', kind: 'prea1', teacher: 'Guided: Hungry Letter Monsters! Feed each picture to the monster with its first sound — f, h or t — and say it.',
    scene: {
      id: 'wt4-letter-monsters', kind: 'letter-monsters', bg: bgL1Reading, who: 'willow', teacher: 'Feed each picture to the monster with its first sound!',
      monsters: [{ letter: 'f', color: '#22c55e' }, { letter: 'h', color: '#f97316' }, { letter: 't', color: '#8b5cf6' }],
      cards: [
        { word: 'fish', img: '/lep1/items/item-fish.png' }, { word: 'hat', img: '/lep1/items/item-hat.png' },
        { word: 'ten', img: '/lep1/items/item-ten.png' }, { word: 'frog', img: '/lep1/items/item-frog.png' },
        { word: 'hen', img: '/lep1/items/item-hen.png' }, { word: 'top', img: '/lep1/items/item-top.png' },
      ],
    },
  },
  {
    id: 'wt4-blend', kind: 'sound-blend', bg: bgL1Reading,
    teacher: 'Reading: say each sound, blend, find the picture — then read the sentence.',
    rounds: [
      { word: 'fan', img: '/lep1/items/item-fan.png', sentence: 'Pip has a red fan.' },
      { word: 'sun', img: '/lep1/items/item-sun.png', sentence: 'It is fun in the sun!' },
      { word: 'fish', sounds: ['f', 'i', 'sh'], img: '/lep1/items/item-fish.png', sentence: 'Look! A fish!' },
    ],
  },
  { id: 'wt4-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgL1Reading, who: 'willow', focus: 'f', teacher: 'Reading: quick reading! Listen to Willow, then say it slow, then faster.', line: 'Fun Fred finds a frog.' },
  /* Free: the unit conversation */
  {
    id: 'wt4-conversation', kind: 'join-stage', bg: bgL1Circle, teacher: 'Free: the 6-line conversation with the teacher — hello, name, how are you, this is my friend, nice to meet you, goodbye.', cast: ['marigold', 'leo'],
    turns: [
      { who: 'marigold', line: 'Hello! What’s your name?' },
      { who: 'student', line: 'Hello! My name is … What’s your name?' },
      { who: 'marigold', line: 'I’m Miss Marigold. How are you?' },
      { who: 'student', line: 'I am … This is my friend Leo.' },
      { who: 'leo', line: 'Hi! Nice to meet you!' },
      { who: 'student', line: 'Nice to meet you, too! Goodbye!' },
    ],
  },
  { id: 'wt4-i-can', kind: 'meet', focus: ['This is my friend'], bg: bgL1Circle, who: 'marigold', cardSide: 'left', teacher: 'Check: say it and get your passport stamp!', line: 'I can say: This is my friend Leo. Nice to meet you!', repeat: 'This is my friend!' },
  {
    id: 'wt4-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the friends sticker in their Sticker Book.',
    scene: {
      id: 'wt4-sticker', kind: 'sticker-reward', bg: bgL1Party, who: 'pip', teacher: 'Sticker time!',
      line: 'You can introduce your friends! Here is your sticker.',
      sticker: { img: spr('leo'), label: 'This is my friend!' },
    },
  },
  {
    id: 'wt4-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt4-home-mission', kind: 'home-mission', bg: bgL1Class, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to introduce someone: "This is my friend … / This is my mum." and "Nice to meet you!", and read pages 5-8 of "Leo’s First Day".',
      steps: [
        { emoji: '\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467}', say: 'Introduce your family to a toy: This is my mum.' },
        { emoji: '\u{1F91D}', say: 'Shake hands: Nice to meet you!' },
        { emoji: '\u{1F4D6}', say: 'Read Leo’s story to your family.' },
      ],
    },
  },
  {
    id: 'wt4-pass-the-ball', kind: 'spin-wheel', bg: bgFeelingsW, title: 'Spin and ask!',
    teacher: 'Extra time (Free): Pass the ball! Spin — ask that friend the question on the number, then answer for them.',
    items: [
      { label: 'Pip, what’s your name?', left: '31%', top: '40%' },
      { label: 'Leo, how old are you?', left: '42%', top: '36%' },
      { label: 'Mia, how are you?', left: '52%', top: '51%' },
      { label: 'Bella, how old are you?', left: '62%', top: '40%' },
      { label: 'Willow, how are you?', left: '72%', top: '52%' },
    ],
    wheelAt: { left: '16%', top: '26%' },
  },
  {
    id: 'wt4-goodbye-song', kind: 'song', bg: bgL1Goodbye, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'wt4-finale', kind: 'finale', bg: leoStory(8), who: 'pip', line: 'You can introduce your friends and say: Nice to meet you! \u{1F91D}' },
]);

/* =============================================================================
 * A1 Unit 1, Lesson 5: "Storybook: The Playground Friends" (curriculum storybook slot; built 2026-10-10)
 *
 * Curriculum: follow a simple story that uses the unit's greetings (hello, what's your name?, how are you?,
 * I am sad / happy, goodbye). Six Canva pages in the Welcome Town style: Pip arrives at the playground,
 * meets Mia on the slide, finds Leo sad on the swing, cheers him up, meets the new girl Bella at the
 * sandbox and says goodbye at sunset. Before the book the child predicts and meets the story lines;
 * after it they order the pictures, check true/false, act the story out and play Pip themself.
 * ========================================================================= */

export const LESSON_5_TITLE = 'Storybook: Leo’s First Day';
export const LESSON_5_OBJECTIVE = 'I can read the story "Leo’s First Day" with help, answer questions about it and act it out.';

const story5 = (n: number) => `${W}/scenes/bg-wt5-story-${n}-wide.png`;

/* Rebuilt 2026-10-12 to the approved Unit 1 plan (docs/a1-unit-1-welcome-town.md §5.5): the storybook lesson.
 * Objective: I can read the story "Leo's First Day" with help, answer questions about it and act it out.
 * (The stills film of the book follows once its scenario is approved — CLAUDE.md "scenario first".) */
const I1 = (n: string) => `/lep1/items/item-${n}.png`;
export const LESSON_5_SCENES: Scene[] = classroomLook([
  { id: 'wt5-title', kind: 'title-card', bg: leoStory(10), level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 5', title: 'Storybook: Leo’s First Day', subtitle: 'Read the whole story — where is Leo’s red cap?', cta: '\u{1F4D6} LET’S READ!' },
  {
    id: 'wt5-recall-warmup', kind: 'recall-warmup', bg: bgL1Circle, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 4 · This Is My Friend!',
    teacher: 'Guided: Pip says a line, the student finds the picture and introduces the friend: This is my friend Mia!',
    items: [
      { word: 'Mia', say: 'Find: This is my friend Mia!', img: spr('mia') },
      { word: 'Leo', say: 'Find: This is my friend Leo!', img: spr('leo') },
      { word: 'Bella', say: 'Find: This is my friend Bella!', img: spr('bella') },
    ],
  },
  { id: 'wt5-predict', kind: 'meet', focus: ['cap'], bg: leoStory(4), who: 'leo', cardSide: 'left', teacher: 'Present: Leo’s cap is lost! Where is it? Let the student guess before reading: Is it in the tree? On the slide?', line: 'My red cap is lost! Where is it?', repeat: 'Where is it?' },
  { id: 'wt5-sight-words', kind: 'vocab-spot', bg: leoStory(9), teacher: 'Present: the last story words. Tap each arrow, listen and read the word.',
    items: [
      { label: 'Look!', sentence: 'Look! The cap is on the cat!', emoji: '\u{1F440}', left: '18%', top: '30%', color: '#B85CD1', who: 'mia' },
      { label: 'the', sentence: 'The cap is on the cat.', emoji: '\u{1F9E2}', left: '45%', top: '40%', color: '#FE6A2F', who: 'pip' },
      { label: 'now', sentence: 'I am happy now!', emoji: '\u{1F60A}', left: '62%', top: '30%', color: '#C97A2F', who: 'leo' },
      { label: 'see you', sentence: 'See you tomorrow!', emoji: '\u{1F44B}', left: '82%', top: '35%', color: '#4FA9E0', who: 'pip' },
    ],
  },
  /* Reading: the whole book */
  {
    id: 'wt5-book', kind: 'reader', bg: bgL1Reading, title: 'Leo’s First Day', doneLine: 'The end! Leo found his cap — and new friends!',
    teacher: 'Reading: the whole book. Listen and follow the light on every page; the student reads the pages they know (1-8) on their own.',
    pages: LEO_STORY,
  },
  /* Guided: understand the story */
  {
    id: 'wt5-wheres-the-cap', kind: 'whats-missing', bg: bgL1Reading, title: 'Where’s the cap?',
    teacher: 'Guided: look at the things, one hides — say what is missing: The cap is missing!',
    rounds: [
      { items: [{ word: 'cap', img: I1('cap') }, { word: 'cat', img: I1('cat') }, { word: 'hat', img: I1('hat') }, { word: 'fan', img: I1('fan') }], missing: 0 },
      { items: [{ word: 'cat', img: I1('cat') }, { word: 'cap', img: I1('cap') }, { word: 'sun', img: I1('sun') }, { word: 'ten', img: I1('ten') }], missing: 0 },
    ],
  },
  {
    id: 'wt5-story-order', kind: 'prea1', teacher: 'Guided: put the story pictures in order, then tell it: first, then, then, at the end!',
    scene: {
      id: 'wt5-story-order', kind: 'story-order', bg: leoStory(9), who: 'pip', teacher: 'Put the pictures in order, then tell the story!',
      frames: [
        { img: leoStory(2), caption: 'Hello! My name is Pip.', who: 'pip' },
        { img: leoStory(4), caption: 'I am sad. My red cap is lost.', who: 'leo' },
        { img: leoStory(6), caption: 'Mia, this is my friend Leo.', who: 'pip' },
        { img: leoStory(9), caption: 'Look! The cap is on the cat!', who: 'mia' },
        { img: leoStory(11), caption: 'Goodbye, friends!', who: 'leo' },
      ],
    },
  },
  {
    id: 'wt5-goodbye-sing', kind: 'song', bg: leoStory(11), title: '\u{1F3B5} The Goodbye Song \u{1F3B5}', teacher: 'Guided: the story ends with goodbye — sing it with the friends and wave to Leo!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  {
    id: 'wt5-read-check', kind: 'prea1', teacher: 'Reading: read the sentence, look at the picture — tick or cross? (Cambridge Starters "look and read")',
    scene: {
      id: 'wt5-read-check', kind: 'tick-cross', bg: bgL1Reading, who: 'pip', teacher: 'Read and look. Yes or no?',
      rounds: [
        { img: leoStory(1), sentence: 'Leo is new in Welcome Town.', isTrue: true },
        { img: leoStory(4), sentence: 'Leo is happy.', isTrue: false },
        { img: leoStory(8), sentence: 'Willow has a red hat.', isTrue: true },
        { img: leoStory(9), sentence: 'The cap is on the bed.', isTrue: false },
        { img: leoStory(10), sentence: 'Leo is happy now.', isTrue: true },
      ],
    },
  },
  {
    id: 'wt5-act-out', kind: 'roleplay', bg: leoStory(2), teacher: 'Free: act it out! The student is Pip, then Leo. Say the lines with the face and the voice.', cast: ['pip', 'leo'],
    script: [
      { who: 'pip', line: 'Hello! My name is Pip. What’s your name?', repeat: true },
      { who: 'leo', line: 'Hi, Pip! My name is Leo.', repeat: true },
      { who: 'pip', line: 'How are you, Leo?', repeat: true },
      { who: 'leo', line: 'I am sad. My red cap is lost.', repeat: true },
      { who: 'pip', line: 'Come on, Leo! Let’s find it!', repeat: true },
    ],
  },
  {
    id: 'wt5-cap-hunt', kind: 'prea1', teacher: 'Brain break: find the cap! Do the actions with Pip.',
    scene: {
      id: 'wt5-cap-hunt', kind: 'tpr-actions', mode: 'break', bg: leoStory(5), who: 'pip', teacher: 'Find the cap! Do it with Pip.',
      rounds: [
        { line: 'Look up! Is it in the tree?', emoji: '\u{1F333}' },
        { line: 'Look down! Is it on the slide?', emoji: '\u{1F6DD}' },
        { line: 'Tiptoe to the sandpit!', emoji: '\u{1F463}' },
        { line: 'Look! The cap is on the cat! Jump!', emoji: '\u{1F431}' },
      ],
    },
  },
  /* Phonics: /k/ → Sound Fish → blend a whole sentence → twister review */
  {
    id: 'wt5-sound-c', kind: 'sound-model', bg: bgL1Reading, who: 'mia', letter: 'C', phoneme: '/k/', sound: 'c', soundSide: 'center',
    teacher: 'Present: /k/ — a little click at the back of your mouth! Cap, cat, car, cake.',
    anchors: [
      { word: 'cap', emoji: '\u{1F9E2}', img: I1('cap') },
      { word: 'cat', emoji: '\u{1F431}', img: I1('cat') },
      { word: 'car', emoji: '\u{1F697}', img: I1('car') },
      { word: 'cake', emoji: '\u{1F370}', img: I1('cake') },
    ],
  },
  {
    id: 'wt5-sound-fish', kind: 'prea1', teacher: 'Guided: Sound Fishing! Hear /k/ and catch every fish whose picture starts with it.',
    scene: {
      id: 'wt5-sound-fish', kind: 'sound-fish', bg: bgL1Reading, who: 'mia', teacher: 'Catch the fish that start with the sound!',
      rounds: [
        { letter: 'c', fish: [{ word: 'cap', img: I1('cap') }, { word: 'cat', img: I1('cat') }, { word: 'car', img: I1('car') }, { word: 'hat', img: I1('hat') }, { word: 'fan', img: I1('fan') }] },
      ],
    },
  },
  {
    id: 'wt5-blend', kind: 'sound-blend', bg: bgL1Reading, look: 'frog',
    teacher: 'Reading: blend each word of the sentence — then read the whole sentence fast!',
    rounds: [
      { word: 'cap', img: I1('cap'), sentence: 'The cap is on the cat.' },
      { word: 'cat', img: I1('cat'), sentence: 'Look! The cat has the cap!' },
      { word: 'red', img: I1('cap'), sentence: 'Leo’s cap is red.' },
    ],
  },
  { id: 'wt5-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgL1Reading, who: 'mia', focus: 'c', teacher: 'Reading: quick reading! Listen to Mia, then say it slow, then faster.', line: 'Cool cat, cool cap.' },
  /* Free: my ending */
  {
    id: 'wt5-my-ending', kind: 'join-stage', bg: leoStory(10), teacher: 'Free: what does Leo say to the cat — and to Willow? The student makes up a new line.', cast: ['leo', 'pip'],
    turns: [
      { who: 'pip', line: 'Look, Leo! The cat has your cap! What do you say?' },
      { who: 'student', line: 'Hello, cat! My cap, please!' },
      { who: 'pip', line: 'And what do you say to Willow?' },
      { who: 'student', line: 'Willow, nice hat! Goodbye!' },
    ],
  },
  { id: 'wt5-i-can', kind: 'meet', focus: ['read'], bg: bgL1Circle, who: 'marigold', cardSide: 'left', teacher: 'Check: say it and get your passport stamp!', line: 'I can read the story Leo’s First Day!', repeat: 'I can read!' },
  {
    id: 'wt5-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the story sticker in their Sticker Book.',
    scene: {
      id: 'wt5-sticker', kind: 'sticker-reward', bg: leoStory(10), who: 'leo', teacher: 'Sticker time!',
      line: 'You read the whole story! Here is your sticker.',
      sticker: { img: I1('cap'), label: 'Leo’s red cap' },
    },
  },
  {
    id: 'wt5-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt5-home-mission', kind: 'home-mission', bg: bgL1Class, who: 'leo',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child read the whole story "Leo’s First Day". Let them read it to you — help with one word at a time.',
      steps: [
        { emoji: '\u{1F4D6}', say: 'Read the story to your family.' },
        { emoji: '\u{1F9E2}', say: 'Hide a cap or a hat. Ask: Where is it?' },
        { emoji: '\u{1F3AD}', say: 'Act it out: you are Pip, they are Leo!' },
      ],
    },
  },
  {
    id: 'wt5-goodbye-song', kind: 'song', bg: bgL1Goodbye, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'wt5-finale', kind: 'finale', bg: leoStory(11), who: 'leo', line: 'You read the whole story! Goodbye, friends! \u{1F4D6}' },
]);

/* =============================================================================
 * A1 Unit 1, Lesson 6: "Game Day!" (extra practice; rebuilt 2026-10-12 to docs/a1-unit-1-welcome-town.md §5.6)
 *
 * No new language: quick, accurate use of everything in Unit 1 and fast reading of its sentences. Every game is new in
 * the unit (§5.8): Word Board ★ (each square a sentence to read or a question to answer), Memory question ↔ answer,
 * Catch the answer (answer gates), Word Splat (sight words), the Twister Race (all four twisters), Read & Do (new),
 * Feelings Dice, then Blend & Read and a free chat with a new friend, Coco.
 * ========================================================================= */

export const LESSON_6_TITLE = 'Extra Practice: Game Day!';
export const LESSON_6_OBJECTIVE = 'I can use all the Unit 1 language quickly — hello, names, "How are you?", "How old are you?", "This is my friend" — and read its sentences fast.';

export const LESSON_6_SCENES: Scene[] = classroomLook([
  { id: 'wt6-title', kind: 'title-card', bg: bgL1Stage, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 6', title: 'Game Day!', subtitle: 'Play, read and race with everything from Unit 1', cta: '\u{1F3AE} LET’S PLAY!' },
  {
    id: 'wt6-recall-warmup', kind: 'recall-warmup', bg: bgL1Circle, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Lesson 5 · Storybook: Leo’s First Day',
    teacher: 'Guided: Pip reads a line from the story — the student finds the picture, then reads the line too.',
    items: [
      { word: 'cat', say: 'Look! The cap is on the cat!', img: leoStory(9) },
      { word: 'hat', say: 'No, no! That is my red hat!', img: leoStory(8) },
      { word: 'friend', say: 'Mia, this is my friend Leo.', img: leoStory(6) },
      { word: 'goodbye', say: 'Goodbye, Leo! See you tomorrow!', img: leoStory(11) },
    ],
  },
  /* Word Board ★ — the signature: every square is a sentence to read or a question to answer */
  {
    id: 'wt6-board', kind: 'prea1', teacher: 'Guided: Word Board! Roll, hop, read the sentence on the square aloud — or answer its question. Ladders go up, slides go down.',
    scene: {
      id: 'wt6-board', kind: 'word-board', bg: bgL1Stage, who: 'pip', walker: spr('pip'), title: 'Word Board! Roll, read and answer!',
      teacher: 'Roll, read the square aloud or answer its question, then tap "I said it!".',
      ask: 'Read it, or answer it!',
      words: [
        { label: 'hello', img: spr('pip'), text: 'Hello! My name is Pip.', say: 'Hello! My name is Pip.' },
        { label: 'name', img: spr('bella'), text: 'What’s your name?', say: 'What’s your name?' },
        { label: 'sad', img: feelSpr('mia-sad'), text: 'She is sad.', say: 'She is sad.' },
        { label: 'old', img: spr('leo'), text: 'How old are you?', say: 'How old are you?' },
        { label: 'friend', img: spr('mia'), text: 'This is my friend Mia.', say: 'This is my friend Mia.' },
        { label: 'how', img: feelSpr('pip-happy'), text: 'How are you?', say: 'How are you?' },
        { label: 'tired', img: feelSpr('leo-tired'), text: 'He is tired.', say: 'He is tired.' },
        { label: 'cap', img: I1('cap'), text: 'Leo’s cap is red.', say: 'Leo’s cap is red.' },
        { label: 'bye', img: spr('willow'), text: 'Goodbye! See you!', say: 'Goodbye! See you!' },
      ],
      doneLine: 'You reached the trophy! Super reading!',
    },
  },
  {
    id: 'wt6-memory', kind: 'memory', bg: bgL1Circle, teacher: 'Reading: find a question and its answer. Read both aloud!',
    pairs: [
      { id: 'name', label: 'What’s your name?', match: 'My name is Leo.', emoji: '\u{1F3F7}\u{FE0F}' },
      { id: 'how', label: 'How are you?', match: 'I am fine, thank you.', emoji: '\u{1F60A}' },
      { id: 'old', label: 'How old are you?', match: 'I am seven.', emoji: '\u{1F382}' },
      { id: 'friend', label: 'This is my friend Mia.', match: 'Nice to meet you!', emoji: '\u{1F91D}' },
      { id: 'bye', label: 'Goodbye!', match: 'See you tomorrow!', emoji: '\u{1F44B}' },
    ],
  },
  {
    id: 'wt6-catch', kind: 'answer-race', look: 'gates', bg: bgL1Class, who: 'pip', racer: I1('pip-run'),
    title: 'Catch the answer! Run through the right gate!',
    teacher: 'Guided: Pip asks — the student taps the gate with the right answer, then says it.',
    rounds: [
      { ask: 'How are you?', choices: ['I am happy.', 'I am seven.', 'My name is Pip.'], answer: 0 },
      { ask: 'What’s your name?', choices: ['I am fine.', 'My name is Leo.', 'Nice to meet you!'], answer: 1 },
      { ask: 'How old are you?', choices: ['Goodbye!', 'This is Mia.', 'I am eight.'], answer: 2 },
      { ask: 'This is my friend Bella.', choices: ['See you!', 'Nice to meet you!', 'I am tired.'], answer: 1 },
      { ask: 'Goodbye, Leo!', choices: ['Goodbye! See you!', 'How are you?', 'I am ten.'], answer: 0 },
    ],
    doneLine: 'You caught every answer!',
  },
  {
    id: 'wt6-hello-song', kind: 'song', bg: bgL1Stage, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Game Day song: wave and sing!',
    durationSeconds: 20, bigWord: 'Hello',
    songUrl: `${W}/audio/hello-song.mp3?v=1`,
    lineDurationsMs: [3640, 4120, 4320, 7982],
    lyrics: [
      { who: 'marigold', text: 'Hello, hello, hello to you!' },
      { who: 'pip', text: 'Hi, hi, hi! And hi to you!' },
      { who: 'marigold', text: 'What’s your name? What’s your name?' },
      { who: 'pip', text: 'Say your name! Say your name!' },
    ],
  },
  {
    id: 'wt6-splat', kind: 'word-splat', bg: bgL1Reading, who: 'mia', title: 'Word Splat! Listen and splat the word!',
    teacher: 'Reading: Mia says a word — the student splats it and reads it aloud.',
    words: ['my', 'is', 'the', 'this', 'you', 'are', 'how', 'look', 'now', 'see'],
    rounds: ['my', 'is', 'this', 'the', 'you', 'look', 'are', 'now'],
    doneLine: 'Splat! You can read them all!',
  },
  {
    id: 'wt6-twister-race', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgL1Reading, who: 'pip', focus: '',
    teacher: 'Reading: the Twister Race! Read all four — slow, faster, then super fast!',
    line: 'Happy Hen hops. Sad Sam sits. Ten tiny teddies. Fun Fred finds a frog.',
    lines: ['Happy Hen hops.', 'Sad Sam sits.', 'Ten tiny teddies.', 'Fun Fred finds a frog.'],
  },
  {
    id: 'wt6-read-do', kind: 'read-do', bg: bgL1Party, title: 'Read and do!', cast: ['leo', 'mia', 'bella', 'willow'],
    teacher: 'Reading: the student reads the card (🔊 is only for help), taps the thing, then the friend. "Wave" and "Say goodbye": they do it too!',
    things: [
      { label: 'red cap', img: I1('cap') },
      { label: 'green hat', img: I1('hat-green') },
      { label: 'blue ball', img: I1('ball-blue') },
      { label: 'book', img: I1('book') },
    ],
    rounds: [
      { text: 'Give Leo the red cap.', thing: 0, to: 0, reply: 'My cap! Thank you!' },
      { text: 'Wave to Mia.', to: 1, reply: 'Hi! How are you?' },
      { text: 'Give Willow the green hat.', thing: 1, to: 3, reply: 'A green hat! Thank you!' },
      { text: 'Give Bella the blue ball.', thing: 2, to: 2, reply: 'Thank you! I am happy!' },
      { text: 'Give Mia the book.', thing: 3, to: 1, reply: 'A book! Thank you!' },
      { text: 'Say goodbye to Leo.', to: 0, reply: 'Goodbye! See you tomorrow!' },
    ],
    doneLine: 'You read it and you did it! Super reader!',
  },
  {
    id: 'wt6-dice', kind: 'prea1', teacher: 'Free: roll — the student says how the friend feels (He is … / She is …), then asks the teacher "How are you?" and listens.',
    scene: {
      id: 'wt6-dice', kind: 'feelings-dice', bg: bgFeelingsW,
      teacher: 'Roll! Say how the friend feels — then ask your teacher: How are you?',
      rounds: [
        { who: 'pip', emotion: 'happy', sentence: 'He is happy! How are you?' },
        { who: 'mia', emotion: 'sad', sentence: 'She is sad. How are you?' },
        { who: 'bella', emotion: 'angry', sentence: 'She is angry! How are you?' },
        { who: 'leo', emotion: 'sad', sentence: 'He is sad. How are you?' },
        { who: 'willow', emotion: 'happy', sentence: 'She is happy! How are you?' },
      ],
    },
  },
  {
    id: 'wt6-break', kind: 'prea1', teacher: 'Brain break: count, wave and move with Pip.',
    scene: {
      id: 'wt6-break', kind: 'tpr-actions', mode: 'break', bg: bgL1Circle, who: 'pip', teacher: 'Count, wave and move with Pip!',
      rounds: [
        { line: 'Jump and count to ten!', emoji: '\u{1F998}' },
        { line: 'Wave and say: Hello, friends!', emoji: '\u{1F44B}' },
        { line: 'Show me happy! Now show me tired!', emoji: '\u{1F60A}' },
        { line: 'Shake hands and say: Nice to meet you!', emoji: '\u{1F91D}' },
      ],
    },
  },
  {
    id: 'wt6-blend', kind: 'sound-blend', bg: bgL1Reading, look: 'gumball',
    teacher: 'Reading: the Blend & Read challenge — blend the word, then read the whole sentence from the story.',
    rounds: [
      { word: 'pip', img: I1('pip-wave'), sentence: 'Hello! My name is Pip.' },
      { word: 'hen', img: I1('hen'), sentence: 'Happy Hen hops.' },
      { word: 'ten', img: I1('ten'), sentence: 'Ten tiny teddies.' },
    ],
  },
  /* Free: a new friend */
  {
    id: 'wt6-new-friend', kind: 'join-stage', bg: bgL1Circle, teacher: 'Free: Coco is new at school (the teacher plays Coco). The student does it all: hello, name, how are you, age, a friend, goodbye.', cast: ['coco', 'pip'],
    turns: [
      { who: 'coco', line: 'Hello! I am new here. My name is Coco. What’s your name?' },
      { who: 'student', line: 'Hello, Coco! My name is …' },
      { who: 'coco', line: 'How are you? How old are you?' },
      { who: 'student', line: 'I am … I am … years old.' },
      { who: 'coco', line: 'Look! Who is this?' },
      { who: 'student', line: 'This is my friend Pip!' },
      { who: 'coco', line: 'Nice to meet you, Pip! Goodbye!' },
      { who: 'student', line: 'Goodbye, Coco! See you!' },
    ],
  },
  { id: 'wt6-i-can', kind: 'meet', focus: ['fast'], bg: bgL1Circle, who: 'marigold', cardSide: 'left', teacher: 'Check: say it and get your passport stamp!', line: 'I can talk, read and answer fast!', repeat: 'I can do it fast!' },
  {
    id: 'wt6-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Game Day sticker in their Sticker Book.',
    scene: {
      id: 'wt6-sticker', kind: 'sticker-reward', bg: bgL1Stage, who: 'pip', teacher: 'Sticker time!',
      line: 'You won Game Day! Here is your sticker.',
      sticker: { img: feelSpr('pip-happy'), label: 'Game Day champion' },
    },
  },
  {
    id: 'wt6-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt6-home-mission', kind: 'home-mission', bg: bgL1Stage, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Today your child played Game Day: reading sentences fast and answering questions. Play "Question Ping-Pong": one asks ("How are you?", "How old are you?", "What’s your name?"), the other answers fast.',
      steps: [
        { emoji: '\u{1F3D3}', say: 'Play Question Ping-Pong with your family.' },
        { emoji: '\u{1F445}', say: 'Say a tongue twister three times, fast!' },
        { emoji: '\u{1F4D6}', say: 'Read a page of Leo’s story to someone.' },
      ],
    },
  },
  {
    id: 'wt6-goodbye-song', kind: 'song', bg: bgExpressGoodbyeW, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'wt6-finale', kind: 'finale', bg: bgL1Stage, who: 'pip', line: 'Game Day champion! You can talk, read and answer fast. Great job!' },
]);

/* =============================================================================
 * A1 Unit 1, Lesson 7: "Boss Test: Say Hello!" (unit evaluation; rebuilt 2026-10-12 to docs/a1-unit-1-welcome-town.md §5.7)
 *
 * Warm-up: the Answer Race (Blooket racing — each right answer moves the car). Then five parts, each checking one skill
 * with Cambridge Pre A1/A1 formats: 1 listening (hear "She is sad." → tap), 2 reading yes/no about a picture (Starters
 * R&W Part 2), 3 the story with gaps (Starters R&W Part 4), 4 speaking (the 6-line conversation, rated), 5 reading a story
 * page aloud (rated). Pass = 4 of 5 in each part; any part below → practise it again (teacher note).
 * ========================================================================= */

export const LESSON_7_TITLE = 'Unit Review & Boss Test: Say Hello!';
export const LESSON_7_OBJECTIVE = 'I can show everything from Unit 1: listen, read sentences and the story, talk with a friend and read a page aloud.';

export const LESSON_7_SCENES: Scene[] = classroomLook([
  { id: 'wt7-title', kind: 'title-card', bg: bgL1Class, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 7', title: 'Boss Test: Say Hello!', subtitle: 'Miss Marigold’s Unit 1 Challenge', cta: '\u{1F3C6} I’M READY!' },
  {
    id: 'wt7-recall-warmup', kind: 'recall-warmup', bg: bgL1Party, who: 'pip', mode: 'click', listen: true,
    fromLabel: 'Lesson 6 · Game Day!',
    teacher: 'Guided: listen — find the thing from Read & Do, then say who has it: Leo has the red cap!',
    items: [
      { word: 'cap', say: 'Find the red cap!', img: I1('cap') },
      { word: 'hat', say: 'Find the green hat!', img: I1('hat-green') },
      { word: 'ball', say: 'Find the blue ball!', img: I1('ball-blue') },
      { word: 'book', say: 'Find the book!', img: I1('book') },
    ],
  },
  {
    id: 'wt7-intro', kind: 'cinematic', bg: bgL1Class, title: 'The Boss Test', subtitle: 'A race, then five parts', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome to the Unit 1 Challenge!' },
      { who: 'marigold', line: 'Listen, read, read the story, talk and read aloud!' },
      { who: 'pip', line: 'First, a race! Let’s go!' },
    ],
    cta: '\u{1F3CE}\u{FE0F} RACE!',
  },
  {
    id: 'wt7-race', kind: 'answer-race', look: 'race', bg: bgL1Class, who: 'pip', racer: I1('car-red'),
    title: 'The Answer Race! Every right answer moves your car!',
    teacher: 'Warm-up: the student answers — every right answer moves the red car. The last two cards are read, not heard.',
    rounds: [
      { ask: 'How old are you?', choices: ['I am seven.', 'I am happy.', 'My name is Mia.'], answer: 0 },
      { ask: 'What’s your name?', choices: ['Nice to meet you!', 'My name is Bella.', 'I am ten.'], answer: 1 },
      { ask: 'Eighteen, nineteen …', choices: ['eleven', 'twelve', 'twenty'], answer: 2 },
      { ask: 'How are you?', choices: ['I am fine, thank you.', 'Goodbye!', 'I am eight.'], answer: 0, read: true },
      { ask: 'This is my friend Pip.', choices: ['See you!', 'Nice to meet you, Pip!', 'I am tired.'], answer: 1, read: true },
    ],
    doneLine: 'You won the race! Now the Boss Test!',
  },
  /* Part 1 — Listening */
  {
    id: 'wt7-p1-listen', kind: 'listen-tap', bg: bgFeelingsW, teacher: 'Part 1 — Listening (5). Listen and tap the friend. Pass: 4 of 5. The student works alone.',
    targets: [
      { label: 'Happy', left: '29.8%', top: '54.5%', color: '#FE6A2F' },
      { label: 'Tired', left: '40.4%', top: '55.6%', color: '#C97A2F' },
      { label: 'Sad', left: '51.1%', top: '57.9%', color: '#B85CD1' },
      { label: 'Angry', left: '61.8%', top: '56.8%', color: '#E76FA5' },
      { label: 'Hungry', left: '72.5%', top: '57.9%', color: '#4FA9E0' },
    ],
    rounds: [
      { prompt: 'He is tired.', answerLabel: 'Tired', who: 'marigold' },
      { prompt: 'She is angry.', answerLabel: 'Angry', who: 'marigold' },
      { prompt: 'He is happy.', answerLabel: 'Happy', who: 'marigold' },
      { prompt: 'She is hungry.', answerLabel: 'Hungry', who: 'marigold' },
      { prompt: 'She is sad.', answerLabel: 'Sad', who: 'marigold' },
    ],
  },
  /* Part 2 — Reading: yes or no? */
  {
    id: 'wt7-p2-read', kind: 'true-false', bg: bgL1Reading, img: leoStory(6), read: true,
    teacher: 'Part 2 — Reading (5). Look at the picture. Read: yes or no? Pass: 4 of 5.',
    rounds: [
      { who: 'marigold', statement: 'Leo is happy.', isTrue: true },
      { who: 'marigold', statement: 'Mia is sad.', isTrue: false },
      { who: 'marigold', statement: 'Leo has a red cap.', isTrue: false },
      { who: 'marigold', statement: 'Mia is happy.', isTrue: true },
      { who: 'marigold', statement: 'Pip is tired.', isTrue: false },
    ],
  },
  /* Part 3 — Reading: the story */
  {
    id: 'wt7-p3-story', kind: 'grammar-gap', bg: bgL1Reading, title: 'Part 3 — The story',
    teacher: 'Part 3 — Reading the story (5). Read and choose the missing word. Pass: 4 of 5.',
    rounds: [
      { before: 'Hello! My', after: 'is Pip.', choices: ['name', 'cap'], answer: 'name', img: leoStory(2) },
      { before: 'How', after: 'you, Leo?', choices: ['is', 'are'], answer: 'are', img: leoStory(4) },
      { before: 'I am sad. My red', after: 'is lost.', choices: ['cap', 'cat'], answer: 'cap', img: leoStory(4) },
      { before: 'Look! The cap is on the', after: '!', choices: ['hat', 'cat'], answer: 'cat', img: leoStory(9) },
      { before: 'Goodbye, Leo! See you', after: '!', choices: ['tomorrow', 'fine'], answer: 'tomorrow', img: leoStory(11) },
    ],
  },
  /* Part 4 — Speaking */
  {
    id: 'wt7-p4-speak', kind: 'join-stage', bg: bgL1Circle, teacher: 'Part 4 — Speaking (5 points: one for each student line said in a whole sentence, one for a clear goodbye). Pass: 4 of 5.', cast: ['marigold', 'leo'],
    turns: [
      { who: 'marigold', line: 'Hello! What’s your name?' },
      { who: 'student', line: 'Hello! My name is … What’s your name?' },
      { who: 'marigold', line: 'I’m Miss Marigold. How are you? How old are you?' },
      { who: 'student', line: 'I am … I am … years old.' },
      { who: 'marigold', line: 'Who is this?' },
      { who: 'student', line: 'This is my friend Leo.' },
      { who: 'leo', line: 'Hi! Nice to meet you!' },
      { who: 'student', line: 'Nice to meet you, too! Goodbye!' },
    ],
  },
  /* Part 5 — Reading aloud */
  {
    id: 'wt7-p5-read-aloud', kind: 'reader', bg: bgL1Reading, title: 'Part 5 — Read it aloud!', doneLine: 'You read it all by yourself!',
    teacher: 'Part 5 — Reading aloud (5 points: every word read, then fluency). Skip the listening: tap "My turn to read" at once. Pass: 4 of 5.',
    pages: [LEO_STORY[5], LEO_STORY[9]],
  },
  { id: 'wt7-i-can', kind: 'meet', focus: ['Unit 1'], bg: bgL1Class, who: 'marigold', cardSide: 'left', teacher: 'Check: any part below 4 of 5? Play it again next lesson (Practise again). Then the trophy!', line: 'I can show everything from Unit 1!', repeat: 'I can do it!' },
  {
    id: 'wt7-sticker', kind: 'prea1', teacher: 'The Unit 1 trophy! The student opens the pack and puts the trophy sticker in their Sticker Book.',
    scene: {
      id: 'wt7-sticker', kind: 'sticker-reward', bg: bgL1Class, who: 'pip', teacher: 'The Unit 1 trophy!',
      line: 'You passed the Boss Test! Here is your Unit 1 trophy.',
      sticker: { img: feelSpr('pip-happy'), label: 'Unit 1 champion' },
    },
  },
  {
    id: 'wt7-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt7-home-mission', kind: 'home-mission', bg: bgL1Class, who: 'pip',
      teacher: 'Home Mission: read the steps with the student.',
      line: 'Your home mission!',
      parentNote: 'Your child finished Unit 1: greetings, feelings, numbers 1-20, age, introducing a friend, and reading the story "Leo’s First Day". Let them introduce themself and a family member to a toy, then read you the story.',
      steps: [
        { emoji: '\u{1F44B}', say: 'Say hello, your name and your age to a toy.' },
        { emoji: '\u{1F91D}', say: 'Say: This is my friend …' },
        { emoji: '\u{1F3C6}', say: 'Read Leo’s story and show your trophy!' },
      ],
    },
  },
  {
    id: 'wt7-goodbye-song', kind: 'song', bg: bgExpressGoodbyeW, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'wt7-finale', kind: 'finale', bg: bgL1Class, who: 'pip', line: 'You finished Unit 1! You can talk, read the story and make friends. Champion!' },
]);
