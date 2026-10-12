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
    }
  | {
      /** The Reader (ReaderScene.tsx): the unit's serial story, read-along then the child reads; `lines` of a page are
       *  spoken in their speaker's voice, every word tappable. */
      id: string; kind: 'reader'; bg: string; title: string; teacher: string; doneLine: string;
      pages: { img: string; lines: { who?: CharKey; text: string }[] }[];
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
    id: 'wt4-recall-warmup', kind: 'recall-warmup', bg: bgL1Party, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 3 · How Old Are You?',
    teacher: 'Guided: Pip says a number, the student finds it and says: I am …!',
    items: [
      { word: 'ten', say: 'Find ten!', img: '/lep1/items/item-ten.png' },
      { word: 'two', say: 'Find two!', img: '/lep1/items/item-two.png' },
      { word: 'three', say: 'Find three!', img: '/lep1/items/item-three.png' },
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

export const LESSON_5_TITLE = 'Storybook: The Playground Friends';
export const LESSON_5_OBJECTIVE = 'Follow a short picture story that uses the unit\'s greetings ("Hello! What\'s your name?", "How are you?", "I am sad / happy", "Goodbye!"), put its pictures in order, say who says each line, and act it out as Pip.';

const story5 = (n: number) => `${W}/scenes/bg-wt5-story-${n}-wide.png`;

export const LESSON_5_SCENES: Scene[] = classroomLook([
  { id: 'wt5-title', kind: 'title-card', bg: story5(6), level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 5', title: 'The Playground Friends', subtitle: 'A storybook', cta: '\u{1F4D6} LET’S READ!' },
  {
    // Remember? (owner, 2026-10-07): a quick warm-up of Lesson 4 · Meet a Friend: Speak!
    id: 'wt5-recall-warmup', kind: 'recall-warmup', bg: bgL1Circle, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 4 · Meet a Friend: Speak!',
    teacher: 'Warm-up from last lesson: Pip says a line from the chat, the student finds who said it and says it too.',
    items: [
      { word: 'Bella', say: 'Who said: My name is Bella?', img: spr('bella') },
      { word: 'Leo', say: 'Who said: I am fine, thank you?', img: spr('leo') },
      { word: 'Mia', say: 'Who said: I am happy?', img: spr('mia') },
    ],
  },
  /* 1 Warm-up song */
  {
    id: 'wt5-hello-song', kind: 'song', bg: bgL1Class, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Wave and sing! Point to you when we say “name”.',
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
  /* 2 Pip greeting + question */
  { id: 'wt5-pip-greets', kind: 'meet', focus: ['story'], bg: story5(1), who: 'pip', cardSide: 'right', teacher: 'Tap Pip. Answer him: "Yes, I do!"', line: 'Hello! I have a story for you. Do you like stories?', repeat: 'Yes, I do!' },
  /* 3 Story opener: predict */
  {
    id: 'wt5-predict', kind: 'cinematic', bg: story5(1), title: 'The Playground Friends', subtitle: 'What will happen?', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Look! Pip is at the playground.' },
      { who: 'marigold', line: 'Who will he meet? What will they say?' },
      { who: 'pip', line: 'Let’s read and find out!' },
    ],
    cta: '\u{1F440} LET’S SEE!',
  },
  /* 4 Story lines: meet the friends before the book, one arrow at a time */
  {
    id: 'wt5-story-lines', kind: 'vocab-spot', bg: story5(5), teacher: 'Tap each arrow. Listen to the friend’s line from the story, then say it.',
    items: [
      { label: 'What’s your name?', sentence: 'Hello! What’s your name?', emoji: '\u{1F44B}', left: '52%', top: '40%', color: '#FE6A2F', who: 'pip' },
      { label: 'My name is Bella.', sentence: 'My name is Bella.', emoji: '\u{1F430}', left: '25%', top: '42%', color: '#E76FA5', who: 'bella' },
      { label: 'Nice to meet you!', sentence: 'Nice to meet you, Bella!', emoji: '\u{1F91D}', left: '67%', top: '55%', color: '#B85CD1', who: 'mia' },
      { label: 'Let’s play!', sentence: 'Let’s play together!', emoji: '\u{1F938}', left: '84%', top: '45%', color: '#C97A2F', who: 'leo' },
    ],
  },
  /* 5 Echo */
  { id: 'wt5-echo', kind: 'echo', bg: story5(4), who: 'leo', textSide: 'top', teacher: 'Say it with Leo! Hold and say it.', word: 'Let’s play!' },
  /* 6-7 The storybook (with check questions) */
  {
    id: 'wt5-storybook', kind: 'flipbook', bg: bgL1Reading, title: 'The Playground Friends',
    pages: [
      { who: 'pip', img: story5(1), text: 'Pip goes to the playground. "Hello!"' },
      { who: 'mia', img: story5(2), text: 'Mia is on the slide. "Hi, Pip! I am happy!"' },
      { who: 'pip', img: story5(3), text: 'Leo is on the swing. "How are you, Leo?" "I am sad."' },
      { who: 'leo', img: story5(4), text: '"Let’s play!" Now Leo is happy!' },
      { who: 'bella', img: story5(5), text: '"Hello! What’s your name?" "My name is Bella."' },
      { img: story5(6), text: '"Goodbye, friends! See you tomorrow!"' },
    ],
    checkpoints: [
      { afterPage: 2, who: 'leo', question: 'How is Leo on the swing?', options: ['Happy', 'Sad', 'Hungry'], answer: 'Sad' },
      { afterPage: 4, who: 'bella', question: 'What is her name?', options: ['Mia', 'Willow', 'Bella'], answer: 'Bella' },
    ],
  },
  /* 8 Story order (pictures, no reading needed) */
  {
    id: 'wt5-story-order', kind: 'prea1', teacher: 'Put the story pictures in order, then tell the story: first, then, then, at the end!',
    scene: {
      id: 'wt5-story-order', kind: 'story-order', bg: story5(6), who: 'pip', teacher: 'Put the story pictures in order, then tell the story: first, then, then, at the end!',
      frames: [
        { img: story5(1), caption: 'Pip goes to the playground. Hello!', who: 'pip' },
        { img: story5(3), caption: 'Leo is sad.', who: 'leo' },
        { img: story5(4), caption: 'They play. Leo is happy!', who: 'leo' },
        { img: story5(6), caption: 'Goodbye, friends!', who: 'pip' },
      ],
    },
  },
  /* 9 True or false */
  {
    id: 'wt5-true-false', kind: 'true-false', bg: story5(4), teacher: 'Listen to the sentence about the story. Is it true or false?',
    rounds: [
      { who: 'mia', statement: 'Mia is on the slide.', isTrue: true },
      { who: 'leo', statement: 'Leo is happy at first.', isTrue: false },
      { who: 'bella', statement: 'The new friend’s name is Bella.', isTrue: true },
      { who: 'pip', statement: 'Pip says goodbye in the morning.', isTrue: false },
    ],
  },
  /* 10 Act it out: Pip and Leo */
  {
    id: 'wt5-act-out', kind: 'roleplay', bg: story5(3), teacher: 'Act out the story! Listen to Pip and Leo, then say each line after them.', cast: ['pip', 'leo'],
    script: [
      { who: 'pip', line: 'Hello, Leo! How are you?', repeat: true },
      { who: 'leo', line: 'I am sad.', repeat: true },
      { who: 'pip', line: 'Let’s play!', repeat: true },
      { who: 'leo', line: 'Yes! Now I am happy!', repeat: true },
    ],
  },
  /* 11 Who says it? */
  {
    id: 'wt5-who-said', kind: 'prea1', teacher: 'Listen to a line from the story. Who is talking? Tap the friend.',
    scene: {
      id: 'wt5-who-said', kind: 'who-said-it', bg: story5(6), teacher: 'Listen to a line from the story. Who is talking? Tap the friend.',
      rounds: [
        { line: 'Hi, Pip! I am happy!', who: 'mia' },
        { line: 'I am sad.', who: 'leo', emotion: 'sad' },
        { line: 'My name is Bella.', who: 'bella' },
        { line: 'Let’s play!', who: 'pip' },
      ],
    },
  },
  /* 12 You are Pip */
  {
    id: 'wt5-you-are-pip', kind: 'join-stage', bg: story5(5), teacher: 'The student is Pip now and meets Bella. Say each line with a whole sentence.', cast: ['bella', 'mia'],
    turns: [
      { who: 'student', line: 'Hello! What’s your name?' },
      { who: 'bella', line: 'My name is Bella. What’s your name?' },
      { who: 'student', line: 'My name is … ! How are you?' },
      { who: 'bella', line: 'I am happy! Let’s play!' },
      { who: 'student', line: 'Goodbye, Bella! See you tomorrow!' },
    ],
  },
  /* 13 Reflection */
  {
    id: 'wt5-favourite', kind: 'choice', bg: story5(6), who: 'pip', teacher: 'Any answer is right! The student picks a favourite friend from the story and says hello to them.',
    prompt: 'Who is your favourite friend in the story?',
    options: [
      { label: 'Pip', emoji: '\u{1F98A}', correct: true },
      { label: 'Mia', emoji: '\u{1F42D}', correct: true },
      { label: 'Leo', emoji: '\u{1F981}', correct: true },
      { label: 'Bella', emoji: '\u{1F430}', correct: true },
    ],
  },
  /* 14 Phonics: Blend It! */
  {
    id: 'wt5-blend', kind: 'sound-blend', bg: bgL1Reading,
    teacher: 'Tap each car and say the sound with the student (/s/ /a/ /d/), press Blend!, then find the picture. "Sad" is from the story!',
    rounds: [
      { word: 'sad', img: '/lep1/items/item-sad.png' },
      { word: 'ant', img: '/lep1/items/item-ant.png' },
      { word: 'yak', img: '/lep1/items/item-yak.png' },
      { word: 'egg', sounds: ['e', 'g'], img: '/lep1/items/item-egg.png' },
    ],
  },
  /* 15 Sticker + 16 Home mission */
  {
    id: 'wt5-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the story sticker in their Sticker Book.',
    scene: {
      id: 'wt5-sticker', kind: 'sticker-reward', bg: story5(6), who: 'pip', teacher: 'Sticker time! The student opens the pack and puts the story sticker in their Sticker Book.',
      line: 'You read the whole story! Here is your sticker.',
      sticker: { img: spr('leo'), label: 'Story reader' },
    },
  },
  {
    id: 'wt5-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt5-home-mission', kind: 'home-mission', bg: story5(6), who: 'pip',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Today your child read "The Playground Friends": Pip meets Mia, cheers up Leo and meets Bella. Ask your child to tell you the story with the pictures and the greetings.',
      steps: [
        { emoji: '\u{1F4D6}', say: 'Tell the story to your family.' },
        { emoji: '\u{1F981}', say: 'Say: How are you, Leo? I am sad.' },
        { emoji: '\u{1F44B}', say: 'Say: Goodbye, friends!' },
      ],
    },
  },
  /* Extra time */
  {
    id: 'wt5-move-break', kind: 'prea1', teacher: 'Extra time: brain break! Play at the playground with Pip.',
    scene: {
      id: 'wt5-move-break', kind: 'tpr-actions', mode: 'break', bg: story5(4), who: 'pip',
      teacher: 'Extra time: brain break! Play at the playground with Pip.',
      rounds: [
        { line: 'Go down the slide! Wheee!', emoji: '\u{1F6DD}' },
        { line: 'Swing high on the swing!', emoji: '\u{1F3A0}' },
        { line: 'Dig in the sandbox!', emoji: '\u{1F3D6}\u{FE0F}' },
        { line: 'Wave goodbye!', emoji: '\u{1F44B}' },
      ],
    },
  },
  /* Goodbye + celebration */
  {
    id: 'wt5-goodbye-song', kind: 'song', bg: bgExpressGoodbyeW, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
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
  { id: 'wt5-finale', kind: 'finale', bg: story5(6), who: 'pip', line: 'You read The Playground Friends! Hello, how are you, goodbye: you know them all! See you tomorrow!' },
]);

/* =============================================================================
 * A1 Unit 1, Lesson 6: "Extra Practice: Greeting Game!" (curriculum extra-practice slot; built 2026-10-10)
 *
 * Game Day on the Welcome Town School stage: no new language, only quick recall and use of the unit's
 * greetings, in a run of short, different games — buzzer show, listen and tap, build the line, memory
 * (question <-> answer), a chat with Willow, the spinner and quick fire. Every game ends in the child
 * SAYING the phrase.
 * ========================================================================= */

export const LESSON_6_TITLE = 'Extra Practice: Greeting Game!';
export const LESSON_6_OBJECTIVE = 'Quickly recall and use the greetings of Unit 1 — hello / hi, goodbye, "What\'s your name? My name is …", "How are you? I am …" — in a run of short games, saying each phrase aloud.';

export const LESSON_6_SCENES: Scene[] = classroomLook([
  { id: 'wt6-title', kind: 'title-card', bg: bgL1Stage, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 6', title: 'Greeting Game!', subtitle: 'Game Day at Welcome Town School', cta: '\u{1F3AE} LET’S PLAY!' },
  {
    // Remember? (owner, 2026-10-07): a quick warm-up of Lesson 5 · The Playground Friends.
    id: 'wt6-recall-warmup', kind: 'recall-warmup', bg: bgL1Circle, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 5 · The Playground Friends',
    teacher: 'Warm-up from the story: Pip says a part of the story, the student finds the picture.',
    items: [
      { word: 'slide', say: 'Find Mia on the slide!', img: story5(2) },
      { word: 'swing', say: 'Find Leo on the swing!', img: story5(3) },
      { word: 'Bella', say: 'Find the new friend, Bella!', img: story5(5) },
    ],
  },
  {
    id: 'wt6-hello-song', kind: 'song', bg: bgL1Stage, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Game Day warm-up: wave and sing!',
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
    id: 'wt6-intro', kind: 'cinematic', bg: bgL1Stage, title: 'Game Day!', subtitle: 'Six greeting games', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome to Game Day!' },
      { who: 'pip', line: 'Let’s play greeting games! Say hello, ask, answer and say goodbye!' },
    ],
    cta: '\u{1F3AE} START!',
  },
  /* Game 1: buzzer show — who says it? */
  {
    id: 'wt6-buzzer', kind: 'prea1', teacher: 'Buzzer Show! Pip says a line. The student presses the buzzer under the friend who says it, then says the line too.',
    scene: {
      id: 'wt6-buzzer', kind: 'buzzer-show', bg: bgL1Stage, who: 'pip',
      teacher: 'Buzzer Show! Pip says a line. The student presses the buzzer under the friend who says it, then says the line too.',
      intro: 'Listen! Who says it? Press the right buzzer!',
      podiums: [{ x: 22.8, y: 72.5, by: 55.5 }, { x: 49.5, y: 72.5, by: 55.5 }, { x: 76.3, y: 72.5, by: 55.5 }],
      faces: L1_FACES,
      rounds: [
        { faces: [3, 2, 1], answer: 0, line: 'Who says: My name is Bella?', reply: 'Yes! Bella says it!', say: 'My name is Bella.' },
        { faces: [1, 2, 0], answer: 1, line: 'Who says: I am sad?', reply: 'Yes! Leo was sad!', say: 'I am sad.' },
        { faces: [0, 4, 1], answer: 2, line: 'Who says: Hi, Pip! I am happy?', reply: 'Yes! Mia says it!', say: 'Hi, Pip! I am happy!' },
      ],
      doneLine: 'Great listening!',
    },
  },
  /* Game 2: listen and tap */
  {
    id: 'wt6-listen-tap', kind: 'listen-tap', bg: bgL1Class, teacher: 'Listen. Who is it? Tap the friend, then say hello to them!',
    targets: [
      { label: 'Pip', left: '22%', top: '72%', color: '#FE6A2F' },
      { label: 'Mia', left: '33%', top: '74%', color: '#B85CD1' },
      { label: 'Bella', left: '45%', top: '76%', color: '#E76FA5' },
      { label: 'Willow', left: '62%', top: '74%', color: '#4FA9E0' },
      { label: 'Leo', left: '78%', top: '72%', color: '#C97A2F' },
    ],
    rounds: [
      { prompt: 'Hello! My name is Willow.', answerLabel: 'Willow', who: 'willow' },
      { prompt: 'Hi! My name is Leo.', answerLabel: 'Leo', who: 'leo' },
      { prompt: 'Hello! I am Mia.', answerLabel: 'Mia', who: 'mia' },
    ],
  },
  /* Game 3: build the line */
  {
    id: 'wt6-build', kind: 'sentence-build', bg: bgL1Reading, teacher: 'Drag the words into order. Then say the whole line!',
    rounds: [
      { words: ['What’s', 'your', 'name?'], emoji: '\u{2753}' },
      { words: ['My', 'name', 'is', 'Pip.'], emoji: '\u{1F98A}' },
      { words: ['How', 'are', 'you?'], emoji: '\u{1F60A}' },
      { words: ['I', 'am', 'fine.'], emoji: '\u{1F44D}' },
    ],
  },
  /* Game 4: memory — question and answer */
  {
    id: 'wt6-memory', kind: 'memory', bg: bgL1Circle, teacher: 'Memory! Find the pairs and say each line when you see it.',
    pairs: [
      { id: 'hello', label: 'Hello!', emoji: '\u{1F44B}' },
      { id: 'name', label: 'My name is …', emoji: '\u{1F3F7}\u{FE0F}' },
      { id: 'fine', label: 'I am fine.', emoji: '\u{1F44D}' },
      { id: 'happy', label: 'I am happy.', emoji: '\u{1F60A}' },
      { id: 'bye', label: 'Goodbye!', emoji: '\u{1F31F}' },
    ],
  },
  /* Game 5: chat with Willow */
  {
    id: 'wt6-chat', kind: 'chat-chain', bg: bgL1Circle, partner: 'willow', title: 'Chat with Willow',
    intro: 'Hi! Let’s talk!',
    teacher: 'Chat Chain: Willow talks, the student picks the reply that fits and SAYS it, then taps “I said it”.',
    turns: [
      { who: 'willow', line: 'Hi! How are you?' },
      { who: 'student', line: 'I am happy, thank you!', wrong: ['My name is Willow.', 'Goodbye!'] },
      { who: 'willow', line: 'What’s your name?' },
      { who: 'student', line: 'My name is …', wrong: ['How are you?', 'I am sad.'] },
      { who: 'willow', line: 'Nice to meet you! Goodbye!' },
      { who: 'student', line: 'Goodbye, Willow!', wrong: ['Hello!', 'I am fine.'] },
    ],
  },
  /* Game 6: spinner — say it */
  {
    id: 'wt6-spin', kind: 'spin-wheel', bg: bgL1Class, title: 'Spin and say it!',
    teacher: 'Have the student spin and greet that friend: "Hello, Mia! How are you?" If you prefer, do the activity without the spinner.',
    items: [
      { label: 'Hello, Pip! How are you?', left: '23%', top: '50%' },
      { label: 'Hi, Mia! What’s your name?', left: '34%', top: '50%' },
      { label: 'Hello, Bella! How are you?', left: '46%', top: '52%' },
      { label: 'Goodbye, Willow!', left: '63%', top: '52%' },
      { label: 'Hi, Leo! How are you?', left: '78%', top: '50%' },
    ],
    wheelAt: { left: '84%', top: '24%' },
  },
  /* Game 7: quick fire */
  {
    id: 'wt6-quick-fire', kind: 'prea1', teacher: 'Quick fire! Say it before the ring runs out.',
    scene: {
      id: 'wt6-quick-fire', kind: 'rapid-recall', bg: bgL1Stage, who: 'pip', seconds: 4,
      teacher: 'Quick fire! Say it before the ring runs out.',
      cards: [
        { img: spr('pip'), word: 'Hello!' },
        { img: feelSpr('mia-sad'), word: 'I am sad.' },
        { img: feelSpr('pip-happy'), word: 'I am happy.' },
        { img: spr('bella'), word: 'My name is Bella.' },
        { img: bgL1WordGoodbye, word: 'Goodbye!' },
      ],
    },
  },
  {
    id: 'wt6-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the Game Day sticker in their Sticker Book.',
    scene: {
      id: 'wt6-sticker', kind: 'sticker-reward', bg: bgL1Stage, who: 'pip', teacher: 'Sticker time! The student opens the pack and puts the Game Day sticker in their Sticker Book.',
      line: 'You won Game Day! Here is your sticker.',
      sticker: { img: feelSpr('pip-happy'), label: 'Greeting champion' },
    },
  },
  {
    id: 'wt6-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt6-home-mission', kind: 'home-mission', bg: bgL1Stage, who: 'pip',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Today your child played greeting games. Play "Greeting Ping-Pong" at home: one says a line ("Hello!", "How are you?", "What\'s your name?") and the other answers fast.',
      steps: [
        { emoji: '\u{1F3D3}', say: 'Play Greeting Ping-Pong with your family.' },
        { emoji: '\u{2753}', say: 'Ask: How are you? What’s your name?' },
        { emoji: '\u{1F44B}', say: 'Say: Goodbye! See you!' },
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
  { id: 'wt6-finale', kind: 'finale', bg: bgL1Stage, who: 'pip', line: 'Game Day champion! You can say hello, ask, answer and say goodbye. Great job!' },
]);

/* =============================================================================
 * A1 Unit 1, Lesson 7: "Unit Review & Boss Test: Say Hello!" (curriculum unit-review slot; built 2026-10-10)
 *
 * The Boss Test: Miss Marigold's Greeting Challenge, five levels that check each skill of the unit on its
 * own — listening (who is it?), reading (match the words), word order (build the question), speaking
 * (a whole chat with Leo) and spelling a name — then the child introduces themself to the class and gets
 * the Unit 1 certificate. The child does the checks on their own (studentOnly) where it is a self-check.
 * ========================================================================= */

export const LESSON_7_TITLE = 'Unit Review & Boss Test: Say Hello!';
export const LESSON_7_OBJECTIVE = 'Show everything from Unit 1: understand and say hello / goodbye, ask and answer "What\'s your name?" and "How are you?", build the questions, spell a name and introduce yourself — in a five-level Boss Test.';

export const LESSON_7_SCENES: Scene[] = classroomLook([
  { id: 'wt7-title', kind: 'title-card', bg: bgL1Class, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 7', title: 'Boss Test: Say Hello!', subtitle: 'Miss Marigold’s Greeting Challenge', cta: '\u{1F3C6} I’M READY!' },
  {
    // Remember? (owner, 2026-10-07): a quick warm-up of Lesson 6 · Greeting Game!
    id: 'wt7-recall-warmup', kind: 'recall-warmup', bg: bgL1Circle, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 6 · Greeting Game!',
    teacher: 'Warm-up from Game Day: Pip says a line, the student finds the friend who says it.',
    items: [
      { word: 'Willow', say: 'Who says: Hello! My name is Willow?', img: spr('willow') },
      { word: 'Leo', say: 'Who says: Hi! My name is Leo?', img: spr('leo') },
      { word: 'Bella', say: 'Who says: My name is Bella?', img: spr('bella') },
    ],
  },
  {
    id: 'wt7-intro', kind: 'cinematic', bg: bgL1Class, title: 'The Boss Test', subtitle: 'Five levels', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome to the Greeting Challenge!' },
      { who: 'marigold', line: 'Five levels. Listen, read, build, talk and spell!' },
      { who: 'pip', line: 'You can do it! Let’s go!' },
    ],
    cta: '\u{1F3C6} LEVEL 1!',
  },
  /* Level 1: listening */
  {
    id: 'wt7-l1-listen', kind: 'listen-tap', bg: bgL1Class, teacher: 'Level 1 — Listening. The student listens and taps the friend, alone.',
    targets: [
      { label: 'Pip', left: '22%', top: '72%', color: '#FE6A2F' },
      { label: 'Mia', left: '33%', top: '74%', color: '#B85CD1' },
      { label: 'Bella', left: '45%', top: '76%', color: '#E76FA5' },
      { label: 'Willow', left: '62%', top: '74%', color: '#4FA9E0' },
      { label: 'Leo', left: '78%', top: '72%', color: '#C97A2F' },
    ],
    rounds: [
      { prompt: 'Hi! I am Bella. How are you?', answerLabel: 'Bella', who: 'bella' },
      { prompt: 'Hello! My name is Pip.', answerLabel: 'Pip', who: 'pip' },
      { prompt: 'I am fine, thank you! I am Leo.', answerLabel: 'Leo', who: 'leo' },
      { prompt: 'Goodbye! I am Willow.', answerLabel: 'Willow', who: 'willow' },
    ],
  },
  /* Level 2: reading (self-check) */
  {
    id: 'wt7-l2-read', kind: 'picture-match', prompt: 'Level 2 — Match the words to the pictures',
    studentOnly: true,
    teacher: 'Level 2 — Reading. Auto-evaluation slide: the student does it alone, without help from the teacher.',
    items: [
      { word: 'Hello!', img: bgL1WordHello },
      { word: 'Goodbye!', img: bgL1WordGoodbye },
      { word: 'I am sad.', img: feelSpr('mia-sad') },
      { word: 'I am happy.', img: feelSpr('pip-happy') },
    ],
    bg: bgL1Circle,
  },
  /* Level 3: word order */
  {
    id: 'wt7-l3-build', kind: 'sentence-build', bg: bgL1Reading, teacher: 'Level 3 — Build it. The student puts the words in order, then says the line.',
    rounds: [
      { words: ['Hello!', 'My', 'name', 'is', 'Mia.'], emoji: '\u{1F42D}' },
      { words: ['How', 'are', 'you', 'today?'], emoji: '\u{2753}' },
      { words: ['I', 'am', 'happy,', 'thank', 'you!'], emoji: '\u{1F60A}' },
    ],
  },
  /* Level 4: speaking — a whole chat */
  {
    id: 'wt7-l4-chat', kind: 'chat-chain', bg: bgL1Peers, partner: 'leo', title: 'Level 4 — Chat with Leo',
    intro: 'Level four! Let’s talk!',
    teacher: 'Level 4 — Speaking. The student picks the reply that fits and SAYS it out loud before tapping “I said it”. Listen for whole sentences.',
    turns: [
      { who: 'leo', line: 'Hello!' },
      { who: 'student', line: 'Hi! What’s your name?', wrong: ['I am fine.', 'Goodbye!'] },
      { who: 'leo', line: 'My name is Leo. What’s your name?' },
      { who: 'student', line: 'My name is …', wrong: ['How are you?', 'I am sad.'] },
      { who: 'leo', line: 'How are you?' },
      { who: 'student', line: 'I am fine, thank you! How are you?', wrong: ['My name is Leo.', 'Hello!'] },
      { who: 'leo', line: 'I am happy! Goodbye!' },
      { who: 'student', line: 'Goodbye, Leo! See you!', wrong: ['Nice to meet you!', 'What’s your name?'] },
    ],
  },
  /* Level 5: spelling */
  {
    id: 'wt7-l5-spell', kind: 'name-badge', bg: bgL1Party, who: 'marigold',
    teacher: 'Level 5 — Spelling. Listen to the letters and tap them in order.',
    rounds: [
      { name: 'Leo', sprite: spr('leo'), choices: ['O', 'E', 'L', 'A'] },
      { name: 'Bella', sprite: spr('bella'), choices: ['A', 'L', 'B', 'E'] },
    ],
  },
  /* Final: introduce yourself to the class */
  {
    id: 'wt7-final', kind: 'join-stage', bg: bgL1Circle, teacher: 'Final round! The student introduces themself to the whole class in whole sentences.', cast: ['marigold', 'pip'],
    turns: [
      { who: 'marigold', line: 'Hello! Tell the class about you!' },
      { who: 'student', line: 'Hello, everyone! My name is … .' },
      { who: 'pip', line: 'How are you today?' },
      { who: 'student', line: 'I am … , thank you!' },
      { who: 'marigold', line: 'Wonderful! Say goodbye to the class!' },
      { who: 'student', line: 'Goodbye, everyone! See you!' },
    ],
  },
  {
    id: 'wt7-sticker', kind: 'prea1', teacher: 'The Unit 1 trophy! The student opens the pack and puts the trophy sticker in their Sticker Book.',
    scene: {
      id: 'wt7-sticker', kind: 'sticker-reward', bg: bgL1Class, who: 'pip', teacher: 'The Unit 1 trophy! The student opens the pack and puts the trophy sticker in their Sticker Book.',
      line: 'You passed the Boss Test! Here is your Unit 1 trophy.',
      sticker: { img: feelSpr('pip-happy'), label: 'Unit 1 champion' },
    },
  },
  {
    id: 'wt7-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt7-home-mission', kind: 'home-mission', bg: bgL1Class, who: 'pip',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Your child finished Unit 1 (greetings and introductions). Let them introduce themself to a family member or a toy: hello, name, how are you, goodbye.',
      steps: [
        { emoji: '\u{1F44B}', say: 'Say hello to someone at home.' },
        { emoji: '\u{1F3F7}\u{FE0F}', say: 'Say: My name is …' },
        { emoji: '\u{1F3C6}', say: 'Show your trophy!' },
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
  { id: 'wt7-finale', kind: 'finale', bg: bgL1Class, who: 'pip', line: 'You finished Unit 1! You can say hello, ask names, ask how are you and say goodbye. Champion!' },
]);
