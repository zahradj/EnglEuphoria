import type { SpinWheelSceneData } from '../SpinWheelScene';
import type { PictureMatchSceneData } from '../PictureMatchScene';
import type { RecallWarmupSceneData } from '../RecallWarmupScene';
import type { FirstSoundSceneData } from '../FirstSoundScene';
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
      rounds: { words: string[]; colors?: (string | null)[]; img?: string; emoji?: string }[];
      side?: 'left' | 'right' | 'top';
    }
  | {
      /** Tongue twister: hear it once, then say it three times — slow,
       *  faster, magic speed — while a wand bounces word by word at that
       *  pace. `focus` letters are glowing in the text. */
      id: string; kind: 'tongue-twister'; bg: string; who: CharKey; teacher: string; line: string; focus: string;
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
export const LESSON_1_OBJECTIVE = "Say hello and goodbye, ask \"What's your name?\", answer \"My name's… / I'm…\", and spell your name.";

/** Welcome Town School is all set in the classroom, so its characters speak on the chalkboard plate. */
const classroomLook = (scenes: Scene[]): Scene[] =>
  scenes.map((sc) => (sc.kind === 'meet' && !sc.look ? { ...sc, look: 'chalk' as const } : sc));

export const LESSON_1_SCENES: Scene[] = classroomLook([
  { id: 'wt-title', kind: 'title-card', bg: bgL1Class, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 1', title: 'Hello, My Name Is…', subtitle: 'Say hello, ask a name, and spell your name', cta: '\u{1F44B} LET’S GO!' },

  {
    // Warm-up: the unit's Hello Song (scripts/songs.json "wt-hello"). Wave on
    // "hello", point to yourself on "say your name".
    id: 'wt-hello-song', kind: 'song', bg: bgL1Class, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Wave and sing! Point to you when we say “name”.',
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

  /* ---- Present: hello / hi, then the name question ---- */
  { id: 'wt-meet-marigold', kind: 'meet', focus: ['Hello'], bg: bgL1Hello, who: 'marigold', cardSide: 'right', teacher: 'Tap Miss Marigold. Then wave and say hello!', line: 'Hello, class! I’m Miss Marigold.', repeat: 'Hello!' },
  { id: 'wt-meet-pip', kind: 'meet', focus: ['name'], bg: bgL1Hello, who: 'pip', cardSide: 'left', teacher: 'Tap Pip. Then say hi!', line: 'Hi! My name’s Pip. What’s your name?', repeat: 'Hi!' },
  {
    id: 'wt-echo-question', kind: 'echo', bg: bgL1Peers, who: 'pip', textSide: 'top',
    teacher: 'Listen and say it with Pip!', word: 'What’s your name?',
  },
  {
    // Model dialogue: the whole L1 exchange, including goodbye/bye.
    id: 'wt-roleplay-names', kind: 'roleplay', bg: bgL1Peers, teacher: 'Listen to Pip and Leo. Say each line after them!', cast: ['leo', 'pip'],
    script: [
      { who: 'leo', line: 'Hi! I’m Leo. What’s your name?', repeat: true },
      { who: 'pip', line: 'Hello, Leo! My name’s Pip.', repeat: true },
      { who: 'leo', line: 'Goodbye, Pip!', repeat: true },
      { who: 'pip', line: 'Bye, Leo!', repeat: true },
    ],
  },
  { id: 'wt-goodbye-pip', kind: 'meet', focus: ['Goodbye'], bg: bgL1Goodbye, who: 'pip', cardSide: 'right', teacher: 'Pip is going home. Tap him, then wave and say goodbye!', line: 'Goodbye, Miss Marigold! Bye!', repeat: 'Goodbye!' },

  /* ---- Practice: hello or goodbye? ---- */
  {
    id: 'wt-choice-arrive', kind: 'choice', bg: bgL1Hello, who: 'marigold', teacher: 'Pip comes in. What does he say?',
    prompt: 'Pip comes in. What does he say?',
    options: [
      { label: 'Hello', emoji: '\u{1F64B}', correct: true },
      { label: 'Goodbye', emoji: '\u{1F6AA}' },
    ],
  },
  {
    id: 'wt-choice-leave', kind: 'choice', bg: bgL1Goodbye, who: 'marigold', teacher: 'Pip goes home. What does he say?',
    prompt: 'Pip goes home. What does he say?',
    options: [
      { label: 'Hi', emoji: '\u{1F64B}' },
      { label: 'Bye', emoji: '\u{1F6AA}', correct: true },
    ],
  },

  /* ---- Signature game: Pip's Welcome Party ---- */
  {
    id: 'wt-party-intro', kind: 'cinematic', bg: bgL1Party, title: 'Pip’s Welcome Party', subtitle: 'New friends are at the door!', narrator: 'marigold',
    script: [
      { who: 'pip', line: 'It’s a party! New friends are at the door.' },
      { who: 'marigold', line: 'Say hello and ask their names. Then the door opens!' },
    ],
    cta: '\u{1F389} PARTY TIME!',
  },
  {
    id: 'wt-welcome-party', kind: 'welcome-party', bg: bgL1Party, host: 'pip', door: PARTY_DOOR,
    teacher: 'Say the line out loud, then tap it to open the door!',
    rounds: [
      {
        guest: 'mia', sprite: spr('mia'), mode: 'greet', knock: 'Knock, knock!',
        options: [{ line: 'Hello! What’s your name?', correct: true }, { line: 'Goodbye! Bye!' }],
        reply: 'Hi! My name’s Mia.', names: ['Mia', 'Bella', 'Leo'],
      },
      {
        guest: 'bella', sprite: spr('bella'), mode: 'greet', knock: 'Knock, knock! Hello!',
        options: [{ line: 'Bye!' }, { line: 'Hi! What’s your name?', correct: true }],
        reply: 'Hello! I’m Bella.', names: ['Willow', 'Bella', 'Mia'],
      },
      {
        guest: 'leo', sprite: spr('leo'), mode: 'answer', knock: 'Hi! I’m Leo. What’s your name?',
        options: [{ line: 'Goodbye!' }, { line: 'My name’s Pip.', correct: true }, { line: 'What’s your name?' }],
        reply: 'Hello, Pip!', names: [],
      },
      {
        guest: 'willow', sprite: spr('willow'), mode: 'greet', knock: 'Knock, knock!',
        options: [{ line: 'Hello! What’s your name?', correct: true }, { line: 'My name’s Willow.' }, { line: 'Goodbye!' }],
        reply: 'Hi! My name’s Willow.', names: ['Leo', 'Willow', 'Bella'],
      },
    ],
  },

  /* ---- Role swap: the child answers AND asks ---- */
  {
    id: 'wt-your-turn', kind: 'join-stage', bg: bgL1Circle, teacher: 'Your turn! When it says YOU, say it out loud.', cast: ['pip', 'marigold'],
    turns: [
      { who: 'pip', line: 'Hi! What’s your name?' },
      { who: 'student', line: 'Hello! My name’s …' },
      { who: 'pip', line: 'Now you ask me!' },
      { who: 'student', line: 'What’s your name?' },
      { who: 'pip', line: 'My name’s Pip!' },
      { who: 'marigold', line: 'Now ask your teacher!' },
      { who: 'student', line: 'What’s your name?' },
    ],
  },

  /* ---- Spelling a name (A–Z) ---- */
  {
    id: 'wt-letter-hunt', kind: 'letter-game', bg: bgL1Reading, who: 'marigold', mode: 'name',
    teacher: 'Alphabet game! Find the letter you hear.',
    rounds: [
      { letter: 'P', choices: ['P', 'B', 'D'] },
      { letter: 'B', choices: ['D', 'B', 'P'] },
      { letter: 'L', choices: ['I', 'T', 'L'] },
    ],
  },
  {
    id: 'wt-name-badge', kind: 'name-badge', bg: bgL1Party, who: 'marigold',
    teacher: 'Listen to the letters. Tap them in order!',
    rounds: [
      { name: 'Pip', sprite: spr('pip'), choices: ['A', 'P', 'T', 'I'] },
      { name: 'Mia', sprite: spr('mia'), choices: ['N', 'A', 'M', 'I'] },
      { name: 'Leo', sprite: spr('leo'), choices: ['O', 'L', 'A', 'E'] },
    ],
  },

  /* ---- Phonics micro-moment: s-a-t ---- */
  {
    id: 'wt-sound-hunt', kind: 'letter-game', bg: bgL1Reading, who: 'marigold', mode: 'sound',
    teacher: 'Sound game! Listen, then tap the letter that makes that sound.',
    rounds: [
      { letter: 'S', phoneme: '/s/', choices: ['S', 'M', 'B'] },
      { letter: 'A', phoneme: '/æ/', choices: ['O', 'A', 'I'] },
      { letter: 'T', phoneme: '/t/', choices: ['D', 'P', 'T'] },
    ],
  },
  {
    id: 'wt-word-build-sat', kind: 'word-build', bg: bgL1Reading, teacher: 'Find the missing sound. Then read the word: sat!',
    rounds: [
      { word: 'sat', blankIndex: 0, answer: 's', choices: ['s', 'm', 't'], emoji: '\u{1FA91}' },
      { word: 'sat', blankIndex: 2, answer: 't', choices: ['p', 't', 'n'], emoji: '\u{1FA91}' },
    ],
  },

  /* ---- Review ---- */
  {
    id: 'wt-memory-words', kind: 'memory', bg: bgL1Circle, teacher: 'Find the pairs! Say each word when you see it.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '\u{1F64B}' },
      { id: 'goodbye', label: 'Goodbye', emoji: '\u{1F6AA}' },
      { id: 'name', label: 'Name', emoji: '\u{1F3F7}\u{FE0F}' },
      { id: 'party', label: 'Party', emoji: '\u{1F389}' },
    ],
  },

  /* ---- Goodbye (this lesson's own ending) ---- */
  { id: 'wt-goodbye-class', kind: 'meet', focus: ['Goodbye'], bg: bgL1Goodbye, who: 'marigold', cardSide: 'left', teacher: 'Time to go! Wave and say goodbye to Miss Marigold.', line: 'Goodbye, everyone! Bye-bye!', repeat: 'Goodbye!' },

  { id: 'wt-finale', kind: 'finale', bg: bgL1Class, who: 'pip', line: 'You said hello, asked names, and made your own name badge! Bye-bye!' },
]);

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

export const LESSON_2_SCENES: Scene[] = classroomLook([
  { id: 'wt2-title', kind: 'title-card', bg: bgWideW, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 2', title: 'How Are You?', subtitle: 'Say hello, then share how you feel today', cta: '\u{1F392} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): a quick warm-up of Lesson 1 · Hello, My Name Is….
    id: 'wt2-recall-warmup', kind: 'recall-warmup', bg: '/welcome-town/scenes/bg-classroom-circle-wide.png', who: 'pip', mode: 'click',
    fromLabel: "Lesson 1 · Hello, My Name Is…",
    teacher: 'Warm-up from last lesson: Pip says it, the student finds the picture and says it too.',
    items: [
      { word: "hello", say: "Find hello!", img: '/welcome-town/scenes/bg-express-hello-v2.png' },
      { word: "goodbye", say: "Find goodbye!", img: '/welcome-town/scenes/bg-express-goodbye-wide.png' },
    ],
  },

  {
    id: 'wt2-intro', kind: 'cinematic', bg: bgCircleW, title: 'Back to Welcome Town School', subtitle: 'A quick hello before today’s lesson', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome back, class! Let’s remember what we learned.' },
      { who: 'pip', line: 'Hello! My name is Pip. I am 7 years old!' },
      { who: 'marigold', line: 'Great job! Today we learn something new.' },
    ],
    cta: '\u{1F392} LET’S GO!',
  },

  {
    id: 'wt2-howareyou', kind: 'meet', focus: ['fine'], bg: bgCircleW, who: 'marigold',
    teacher: 'Tap Miss Marigold to hear a new question!',
    line: 'How are you today? I am fine, thank you!', repeat: 'I am fine, thank you!',
  },

  /* --- Progressive vocabulary intro, one word at a time — same pattern as
   * Pre-A1 Unit 5 Lesson 1 Part A's Mom/Dad/Me/Family sequence: each new
   * word gets its OWN full-bleed scene showing only that one character
   * expressing that one feeling, BEFORE any word is combined into the
   * five-hotspot group scene below. */
  {
    // Character composed into the LEFT third of bg-vocab-pip-happy.png —
    // cards dock right, onto the empty side.
    id: 'wt2-vocab-pip-happy', kind: 'meet', look: 'word', focus: ['happy'], bg: bgVocabPipHappyW, who: 'pip', cardSide: 'right',
    teacher: 'Listen, then repeat!', line: 'Pip is happy!', repeat: 'Happy!',
  },
  {
    // Character composed into the RIGHT third of bg-vocab-leo-tired.png —
    // cards dock left.
    id: 'wt2-vocab-leo-tired', kind: 'meet', look: 'word', focus: ['tired'], bg: bgVocabLeoTiredW, who: 'leo', cardSide: 'left',
    teacher: 'Listen, then repeat!', line: 'Leo is tired!', repeat: 'Tired!',
  },
  {
    id: 'wt2-vocab-mia-sad', kind: 'meet', look: 'word', focus: ['sad'], bg: bgVocabMiaSadW, who: 'mia', cardSide: 'right',
    teacher: 'Listen, then repeat!', line: 'Mia is sad!', repeat: 'Sad!',
  },
  {
    id: 'wt2-vocab-bella-angry', kind: 'meet', look: 'word', focus: ['angry'], bg: bgVocabBellaAngryW, who: 'bella', cardSide: 'left',
    teacher: 'Listen, then repeat!', line: 'Bella is angry!', repeat: 'Angry!',
  },
  {
    id: 'wt2-vocab-willow-hungry', kind: 'meet', look: 'word', focus: ['hungry'], bg: bgVocabWillowHungryW, who: 'willow', cardSide: 'right',
    teacher: 'Listen, then repeat!', line: 'Willow is hungry!', repeat: 'Hungry!',
  },

  {
    // A dedicated scene purpose-built for this hotspot quartet — four
    // classmates each visibly showing one feeling through pose and
    // expression alone, evenly spaced, per visual-learning-engine's own
    // rule that a vocab-spot scene needs its target words large, clean,
    // and unambiguous rather than borrowed from an unrelated narrative
    // scene.
    id: 'wt2-vocab-feelings', kind: 'vocab-spot', bg: bgFeelingsW,
    teacher: 'Look at each friend! Tap the arrow to learn how they feel.',
    items: [
      { label: 'Happy', sentence: 'Pip is happy.', emoji: '\u{1F60A}', left: '29.8%', top: '54.5%', color: '#FE6A2F', who: 'pip' },
      { label: 'Tired', sentence: 'Leo is tired.', emoji: '\u{1F62A}', left: '40.4%', top: '55.6%', color: '#C97A2F', who: 'leo' },
      { label: 'Sad', sentence: 'Mia is sad.', emoji: '\u{1F622}', left: '51.1%', top: '57.9%', color: '#B85CD1', who: 'mia' },
      { label: 'Angry', sentence: 'Bella is angry.', emoji: '\u{1F620}', left: '61.8%', top: '56.8%', color: '#E76FA5', who: 'bella' },
      { label: 'Hungry', sentence: 'Willow is hungry.', emoji: '\u{1F924}', left: '72.5%', top: '57.9%', color: '#4FA9E0', who: 'willow' },
    ],
  },

  {
    // Practice step right after discovery — target coordinates match
    // wt2-vocab-feelings' own hotspots one-for-one, same as Lesson 1's
    // drag-match scenes.
    id: 'wt2-drag-feelings', kind: 'drag-match', bg: bgFeelingsW, teacher: 'Listen, then drag each word onto the friend who feels that way!',
    items: [
      { label: 'Happy', color: '#FE6A2F', who: 'pip', targetLeft: '29.8%', targetTop: '54.5%' },
      { label: 'Tired', color: '#C97A2F', who: 'leo', targetLeft: '40.4%', targetTop: '55.6%' },
      { label: 'Sad', color: '#B85CD1', who: 'mia', targetLeft: '51.1%', targetTop: '57.9%' },
      { label: 'Angry', color: '#E76FA5', who: 'bella', targetLeft: '61.8%', targetTop: '56.8%' },
      { label: 'Hungry', color: '#4FA9E0', who: 'willow', targetLeft: '72.5%', targetTop: '57.9%' },
    ],
  },

  {
    // Extra retrieval-practice round so the five feelings words actually
    // get memorized, not just recognized-once — a genuinely different
    // mechanic from the vocab-spot/drag-match pair just above (matching
    // the Hard Variety Rule), same `memory` shape already proven by
    // wt-memory-words (Lesson 1) and wt3-memory (Lesson 3).
    id: 'wt2-feelings-memory', kind: 'memory', bg: bgFeelingsW, teacher: 'Memory game! Find the matching feelings pairs!',
    pairs: [
      { id: 'happy', label: 'Happy', emoji: '\u{1F60A}' },
      { id: 'tired', label: 'Tired', emoji: '\u{1F62A}' },
      { id: 'sad', label: 'Sad', emoji: '\u{1F622}' },
      { id: 'angry', label: 'Angry', emoji: '\u{1F620}' },
      { id: 'hungry', label: 'Hungry', emoji: '\u{1F924}' },
    ],
  },

  {
    id: 'wt2-roleplay', kind: 'roleplay', bg: bgCircleW, teacher: 'Story time! Listen to Pip and Miss Marigold, then repeat each line.', cast: ['pip', 'marigold'],
    script: [
      { who: 'marigold', line: 'How are you today, Pip?', repeat: true },
      { who: 'pip', line: 'I am happy! How are you?', repeat: true },
      { who: 'marigold', line: 'I am fine, thank you!', repeat: true },
    ],
  },

  {
    id: 'wt2-join-stage', kind: 'join-stage', bg: bgCircleW, teacher: 'Your turn! When it says YOU, say how you feel out loud!', cast: ['pip', 'marigold', 'leo'],
    turns: [
      { who: 'marigold', line: 'How are you today?' },
      { who: 'student', line: 'I am ______.' },
      { who: 'pip', line: 'Thanks for sharing!' },
      { who: 'leo', line: 'I am happy you are here!' },
    ],
  },

  {
    // Refactored from a static 4-button "Which word means HAPPY?" MCQ into
    // a real tap-the-friend-in-the-scene listening game — research backs
    // this as more engaging than a flat multiple-choice quiz for young
    // learners (ESL Kids Games' "touch the correct picture" pattern; see
    // https://www.eslkidsgames.com/online-esl-games). Reuses bgFeelings'
    // own established hotspot coordinates verbatim (same ones wt2-vocab-
    // feelings/wt2-drag-feelings already use) — no new art needed, and
    // now covers three feelings in one game instead of just one.
    id: 'wt2-choice', kind: 'listen-tap', bg: bgFeelingsW, teacher: 'Listen, then tap the right friend!',
    targets: [
      { label: 'Happy', left: '29.8%', top: '54.5%', color: '#FE6A2F' },
      { label: 'Tired', left: '40.4%', top: '55.6%', color: '#C97A2F' },
      { label: 'Sad', left: '51.1%', top: '57.9%', color: '#B85CD1' },
      { label: 'Angry', left: '61.8%', top: '56.8%', color: '#E76FA5' },
      { label: 'Hungry', left: '72.5%', top: '57.9%', color: '#4FA9E0' },
    ],
    rounds: [
      { prompt: 'Who is happy?', answerLabel: 'Happy', who: 'pip' },
      { prompt: 'Who is sad?', answerLabel: 'Sad', who: 'mia' },
      { prompt: 'Who is angry?', answerLabel: 'Angry', who: 'bella' },
    ],
  },

  /* --- He / She concept primer — a simple, concrete "boy = He, girl = She"
   * anchor BEFORE any sentence work touches pronouns, using two characters
   * already established in this lesson (Pip, Mia) rather than inventing new
   * unnamed children. This is deliberately simple/visual; the full
   * He/She/They sort-and-produce sequence right below still does the real
   * teaching — this just gives students a concrete first foothold. */
  /* Boy -> he, girl -> she, boy + girl -> they (owner 2026-10-09: "How would the student know if it is a boy or a
   * girl? ... a boy plus a girl equals they. They are happy."). One idea per page, word on the open side of the picture. */
  {
    id: 'wt2-boy-pip', kind: 'meet', look: 'word', word: 'boy', wordNote: '\u{1F466}', focus: ['boy'], bg: bgHeIntroPipW, who: 'pip', cardSide: 'right',
    teacher: 'Listen, then repeat! Point to Pip: a boy.', line: 'This is Pip. Pip is a boy. He is a boy!', repeat: 'A boy!',
  },
  {
    id: 'wt2-he-pip', kind: 'meet', look: 'word', word: 'He', wordNote: '\u{1F466} =', focus: ['He'], bg: bgVocabPipHappyW, who: 'pip', cardSide: 'right',
    teacher: 'A boy = HE. Listen, then repeat!', line: 'He is happy!', repeat: 'He is happy!',
  },
  {
    id: 'wt2-girl-mia', kind: 'meet', look: 'word', word: 'girl', wordNote: '\u{1F467}', focus: ['girl'], bg: bgHeIntroMiaW, who: 'mia', cardSide: 'left',
    teacher: 'Listen, then repeat! Point to Mia: a girl.', line: 'This is Mia. Mia is a girl. She is a girl!', repeat: 'A girl!',
  },
  {
    id: 'wt2-she-mia', kind: 'meet', look: 'word', word: 'She', wordNote: '\u{1F467} =', focus: ['She'], bg: bgHeIntroMiaW, who: 'mia', cardSide: 'left',
    teacher: 'A girl = SHE. Listen, then repeat!', line: 'She is happy!', repeat: 'She is happy!',
  },
  {
    id: 'wt2-they-pip-mia', kind: 'meet', look: 'word', word: 'They', wordNote: '\u{1F466} + \u{1F467} =', focus: ['They'], bg: bgHeSheTogetherW, who: 'pip',
    teacher: 'A boy + a girl = THEY. Listen, then repeat!', line: 'A boy and a girl. They are happy!', repeat: 'They are happy!',
  },
  {
    // Refactored from a second solo tap-and-repeat "meet" scene into a real
    // game: research on teaching he/she to young learners consistently
    // points to a physical "touch the right one when I call it" mechanic
    // (the "Wall Touch Game" / "Speed Card Practice" pattern — see
    // https://eslkidstuff.com/esl-lesson-plans-for-esl-kids-teachers/subject-pronouns-lesson-plan/
    // and https://numberdyslexia.com/pronoun-activities/), digitally
    // adapted via the same listen-tap mechanic already proven above.
    // Mia still gets introduced here — the very first round names her
    // directly — just inside a game instead of a passive tap-once card.
    id: 'wt2-heshe-together', kind: 'listen-tap', bg: bgHeSheTogetherW, teacher: 'Listen, then tap the right friend!',
    targets: [
      { label: 'Pip', left: '37.6%', top: '52.8%', color: '#FE6A2F' },
      { label: 'Mia', left: '62.4%', top: '52.8%', color: '#B85CD1' },
    ],
    rounds: [
      { prompt: 'This is Mia. Tap Mia — She is a girl!', answerLabel: 'Mia', who: 'mia' },
      { prompt: 'Tap He — the boy!', answerLabel: 'Pip', who: 'pip' },
      { prompt: 'Tap She — the girl!', answerLabel: 'Mia', who: 'mia' },
      { prompt: 'Tap He!', answerLabel: 'Pip', who: 'pip' },
    ],
  },
  {
    // Quick generalization check with two DIFFERENT characters than the
    // ones just modeled, reusing their existing vocab-scene art (no new
    // images needed) — confirms He/She isn't just memorized for Pip/Mia.
    id: 'wt2-heshe-check-leo', kind: 'choice', bg: bgVocabLeoTiredW, who: 'leo', teacher: 'Look at Leo. Is Leo a boy or a girl?',
    prompt: 'Leo is a boy. We say...',
    options: [
      { label: 'He', emoji: '\u{1F466}', correct: true },
      { label: 'She', emoji: '\u{1F467}' },
    ],
  },
  {
    id: 'wt2-heshe-check-bella', kind: 'choice', bg: bgVocabBellaAngryW, who: 'bella', teacher: 'Look at Bella. Is Bella a boy or a girl?',
    prompt: 'Bella is a girl. We say...',
    options: [
      { label: 'She', emoji: '\u{1F467}', correct: true },
      { label: 'He', emoji: '\u{1F466}' },
    ],
  },

  /* --- New words: He, She, They — built directly on the five feelings
   * just taught, never re-teaching the feeling words themselves, only the
   * new grammar operating on them. Model (roleplay) -> practice (a real
   * drag-to-bin sort game, not another choice scene) -> produce (join-stage). */
  {
    id: 'wt2-pronoun-model', kind: 'roleplay', bg: bgFeelingsW, teacher: 'New words! Listen to Miss Marigold, then repeat.', cast: ['marigold'],
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
    id: 'wt2-pronoun-sort', kind: 'pronoun-sort', bg: bgFeelingsW, teacher: 'Drag each friend to He, She, or They!',
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
    id: 'wt2-pronoun-join', kind: 'join-stage', bg: bgFeelingsW, teacher: 'Your turn! Point to a friend and say He or She!', cast: ['pip', 'mia', 'marigold'],
    turns: [
      { who: 'marigold', line: 'Point to a friend. Is your friend a boy or a girl?' },
      { who: 'student', line: 'He is ______. / She is ______.' },
      { who: 'pip', line: 'Great practice!' },
    ],
  },

  {
    id: 'wt2-storybook', kind: 'flipbook', bg: bgWideW, title: "Pip's Tired Day",
    pages: [
      { who: 'pip', img: `${W}/scenes/bg-story-pip-tired.png`, text: 'Pip feels tired today. "I am so tired!"' },
      { who: 'mia', img: `${W}/scenes/bg-story-mia-checks-pip.png`, text: 'Mia asks, "Are you okay, Pip?"' },
      { who: 'pip', img: `${W}/scenes/bg-story-pip-rests-plays.png`, text: 'Pip rests, then plays with his friends.' },
      { img: `${W}/scenes/bg-story-pip-happy-friends.png`, text: 'Now Pip feels happy again! ✨' },
    ],
    checkpoints: [
      { afterPage: 0, who: 'pip', question: 'How does Pip feel at first?', options: ['Happy', 'Tired', 'Angry'], answer: 'Tired' },
      { afterPage: 2, who: 'mia', question: 'How does Pip feel at the end?', options: ['Sad', 'Happy', 'Tired'], answer: 'Happy' },
    ],
  },

  {
    // A natural pause point, same as Lesson 1 — the Part 1/Part 2 seam.
    id: 'wt2-break', kind: 'title-card', bg: bgWideW, level: 'A1', unit: 'Unit 1', lessonLabel: 'Break Time', title: 'Great Job!', subtitle: 'Stretch, get some water, then come back for Part 2!', cta: '\u{1F938} I’m Ready!',
  },

  /* =========================== Part 2: Reading Review =========================
   * Continues straight from Lesson 1's S/A/T — reviews nothing from scratch,
   * per reading-engine's own progression table for A1 (review-through-
   * reading, not first-time letter discovery). */

  { id: 'wt2-part2-title', kind: 'title-card', bg: bgReadingW, level: 'A1', unit: 'Unit 1', lessonLabel: 'Part 2', title: 'Reading Time!', subtitle: 'You know S, A, T — now learn P, I, N!', cta: '\u{1F4D6} LET’S READ!' },

  {
    id: 'wt2-model-p', kind: 'sound-model', bg: bgReadingW, who: 'pip', letter: 'P', phoneme: '/p/', sound: 'puh',
    teacher: 'A brand-new sound! /p/ /p/ Pig!',
    anchors: [
      { word: 'pig', emoji: '\u{1F437}' },
      { word: 'pen', emoji: '\u{1F58A}\u{FE0F}' },
      { word: 'pan', emoji: '\u{1F373}' },
    ],
  },
  { id: 'wt2-trace-p', kind: 'trace', bg: bgReadingW, who: 'pip', letter: 'P', phoneme: '/p/', word: 'pig', teacher: 'Trace the letter P! Say /p/ /p/ /p/ as you draw.' },

  {
    id: 'wt2-model-i', kind: 'sound-model', bg: bgReadingW, who: 'marigold', letter: 'I', phoneme: '/\u{026A}/', sound: 'ih',
    teacher: 'A brand-new sound! /i/ /i/ Ink!',
    anchors: [
      { word: 'ink', emoji: '\u{1F58B}\u{FE0F}' },
      { word: 'igloo', emoji: '\u{1F9CA}', img: '/lep1/alphabet/item-igloo.png' },
      { word: 'insect', emoji: '\u{1F41B}' },
    ],
  },
  { id: 'wt2-trace-i', kind: 'trace', bg: bgReadingW, who: 'marigold', letter: 'I', phoneme: '/\u{026A}/', word: 'ink', teacher: 'Trace the letter I! Say /i/ /i/ /i/ as you draw.' },

  {
    id: 'wt2-model-n', kind: 'sound-model', bg: bgReadingW, who: 'pip', letter: 'N', phoneme: '/n/', sound: 'nnn',
    teacher: 'A brand-new sound! /n/ /n/ Nut!',
    anchors: [
      { word: 'nut', emoji: '\u{1F95C}', img: '/lep1/items/item-nut.png' },
      { word: 'net', emoji: '\u{1F945}' },
      { word: 'nose', emoji: '\u{1F443}', img: '/lep1/items/item-nose.png' },
    ],
  },
  { id: 'wt2-trace-n', kind: 'trace', bg: bgReadingW, who: 'pip', letter: 'N', phoneme: '/n/', word: 'nut', teacher: 'Trace the letter N! Say /n/ /n/ /n/ as you draw.' },

  {
    id: 'wt2-word-build', kind: 'word-build', bg: bgReadingW, teacher: 'You know 6 sounds now! Read three more real words!',
    rounds: [
      { word: 'SIT', blankIndex: 1, answer: 'I', choices: ['I', 'O', 'U'], emoji: '\u{1FA91}' },
      { word: 'PIN', blankIndex: 0, answer: 'P', choices: ['P', 'B', 'D'], emoji: '\u{1F4CC}' },
      { word: 'PIP', blankIndex: 2, answer: 'P', choices: ['P', 'B', 'D'], emoji: '\u{1F98A}' },
    ],
  },

  {
    id: 'wt2-letter-hunt', kind: 'letter-game', bg: bgReadingW, who: 'marigold', mode: 'name',
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
    id: 'wt2-vocab-supplies2', kind: 'vocab-spot', bg: bgSupplies2W,
    teacher: 'Remember desk and chair? Now learn three new school words!',
    items: [
      { label: 'Book', sentence: 'This is my book.', emoji: '\u{1F4D6}', left: '44.7%', top: '60.5%', color: '#2563EB' },
      { label: 'Pencil', sentence: 'This is my pencil.', emoji: '\u{270F}\u{FE0F}', left: '51.1%', top: '56%', color: '#F59E0B' },
      { label: 'Pen', sentence: 'This is my pen.', emoji: '\u{1F58A}\u{FE0F}', left: '55.8%', top: '56.6%', color: '#0EA5E9' },
    ],
  },
  {
    id: 'wt2-drag-supplies2', kind: 'drag-match', bg: bgSupplies2W, teacher: 'Listen, then drag each word onto the matching thing on the desk!',
    items: [
      { label: 'Book', color: '#2563EB', targetLeft: '44.7%', targetTop: '60.5%' },
      { label: 'Pencil', color: '#F59E0B', targetLeft: '51.1%', targetTop: '56%' },
      { label: 'Pen', color: '#0EA5E9', targetLeft: '55.8%', targetTop: '56.6%' },
    ],
  },
  {
    id: 'wt2-class-puzzle', kind: 'jigsaw-puzzle', bg: bgFeelingsW, teacher: 'Puzzle game! Drag the pieces to put the picture back together!',
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
    id: 'wt2-prep-in', kind: 'meet', focus: ['IN'], bg: bgPrepInW, who: 'pip',
    teacher: 'Tap Pip to hear a new word!',
    line: 'Look! The book is IN the bag.', repeat: 'In the bag!',
  },
  {
    id: 'wt2-prep-on', kind: 'meet', focus: ['ON'], bg: bgPrepOnW, who: 'mia',
    teacher: 'Tap Mia to hear a new word!',
    line: 'Look! The apple is ON the desk.', repeat: 'On the desk!',
  },
  {
    id: 'wt2-prep-next-to', kind: 'meet', focus: ['NEXT TO'], bg: bgPrepNextToW, who: 'leo',
    teacher: 'Tap Leo to hear a new word!',
    line: 'Look! The chair is NEXT TO the desk.', repeat: 'Next to the desk!',
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

  { id: 'wt2-finale', kind: 'finale', bg: bgWideW, who: 'pip', line: 'You said how you feel, and read three more real words — SIT, PIN, and PIP! ✨\u{1F3C6}' },
]);

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

export const LESSON_3_SCENES: Scene[] = classroomLook([
  { id: 'wt3-title', kind: 'title-card', bg: bgWide, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 3', title: 'Listen & Greet!', subtitle: 'Put on your listening ears!', cta: '👂 LET’S LISTEN!' },
  {
    // Remember? (owner, 2026-10-07): a quick warm-up of Lesson 2 · How Are You?.
    id: 'wt3-recall-warmup', kind: 'recall-warmup', bg: '/welcome-town/scenes/bg-classroom-circle-wide.png', who: 'pip', mode: 'click',
    fromLabel: "Lesson 2 · How Are You?",
    teacher: 'Warm-up from last lesson: Pip says it, the student finds the picture and says it too.',
    items: [
      { word: "happy", say: "Who is happy?", img: '/welcome-town/scenes/bg-vocab-pip-happy-wide.png' },
      { word: "sad", say: "Who is sad?", img: '/welcome-town/scenes/bg-vocab-mia-sad-wide.png' },
      { word: "tired", say: "Who is tired?", img: '/welcome-town/scenes/bg-vocab-leo-tired-wide.png' },
      { word: "angry", say: "Who is angry?", img: '/welcome-town/scenes/bg-vocab-bella-angry-wide.png' },
    ],
  },

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
    songUrl: `${W}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '👋 Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '👋 Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '🏫 Welcome Town School is happy today' },
      { who: 'pip', text: '💖 Byeeee, friends! See you soon!' },
    ],
  },

  { id: 'wt3-finale', kind: 'finale', bg: bgWide, who: 'pip', line: 'You listened carefully to hello, names, ages, feelings, friends, and your teacher — great job! ✨👂' },
]);

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

export const LESSON_4_SCENES: Scene[] = classroomLook([
  { id: 'wt4-title', kind: 'title-card', bg: bgWideV2, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 4', title: 'Speak & Meet!', subtitle: 'Say hello and meet a new friend!', cta: '🗣️ LET’S TALK!' },
  {
    // Remember? (owner, 2026-10-07): a quick warm-up of Lesson 3 · Listen & Greet!.
    id: 'wt4-recall-warmup', kind: 'recall-warmup', bg: '/welcome-town/scenes/bg-classroom-circle-v2.png', who: 'pip', mode: 'click',
    fromLabel: "Lesson 3 · Listen & Greet!",
    teacher: 'Warm-up from last lesson: Pip says it, the student finds the picture and says it too.',
    items: [
      { word: "Mia", say: "I am sad today. Who is it?", img: '/welcome-town/scenes/bg-vocab-mia-sad-wide.png' },
      { word: "Leo", say: "I am so tired. Who is it?", img: '/welcome-town/scenes/bg-vocab-leo-tired-wide.png' },
      { word: "Bella", say: "I am angry! Who is it?", img: '/welcome-town/scenes/bg-vocab-bella-angry-wide.png' },
    ],
  },

  {
    id: 'wt4-intro', kind: 'cinematic', bg: bgCircleV2, title: 'Time to Talk!', subtitle: 'Today you have a real conversation', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome back, class! Today we practice something new.' },
      { who: 'marigold', line: 'You will meet a partner and have a real conversation!' },
      { who: 'pip', line: 'I love talking to my friends! Let’s go!' },
    ],
    cta: '🗣️ LET’S TALK!',
  },

  {
    id: 'wt4-meet-model', kind: 'meet', focus: ['Nice to meet you'], bg: bgExpressHelloV2, who: 'marigold',
    teacher: 'Tap Miss Marigold to hear a full greeting!',
    line: 'Watch me! Hello! My name is Miss Marigold. Nice to meet you!', repeat: 'Nice to meet you!',
  },
  {
    // First real use of `echo` in the Welcome Town family — see the file
    // banner above. A quick single-word speaking rep, deliberately shorter
    // than `meet`'s full modeled line, right after that longer model.
    id: 'wt4-echo-hello', kind: 'echo', bg: bgExpressHelloV2, who: 'pip', textSide: 'top', teacher: 'Now you try! Hold the button and say it with Pip!', word: 'Hello!',
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
    id: 'wt4-roleplay', kind: 'roleplay', bg: bgPeersV2, teacher: 'A real conversation! Listen to Pip and Leo, then repeat each line.', cast: ['pip', 'leo'],
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
    id: 'wt4-echo-friend', kind: 'echo', bg: bgExpressFriendV2, who: 'mia', textSide: 'top', teacher: 'Say it with Mia! Hold and say it!', word: 'Friend!',
  },

  {
    // Produce, same combined pattern the roleplay above just modeled.
    id: 'wt4-join-stage-intro', kind: 'join-stage', bg: bgCircleV2, teacher: 'Your turn! Say hello, your name, and how you feel!', cast: ['marigold', 'leo'],
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
    id: 'wt4-join-stage-partner', kind: 'join-stage', bg: bgCircleV2, teacher: 'Now introduce a FRIEND! Point to someone and say their name!', cast: ['pip', 'bella'],
    turns: [
      { who: 'pip', line: 'This is my friend, Bella!' },
      { who: 'student', line: 'Hello, Bella! Nice to meet you!' },
      { who: 'bella', line: 'Hello! Nice to meet you too!' },
      { who: 'pip', line: 'Now you try! Point to a friend and introduce them!' },
      { who: 'student', line: 'This is my friend, ______!' },
    ],
  },

  {
    id: 'wt4-memory', kind: 'memory', bg: bgCircleV2, teacher: 'Match the matching pairs! Everything you said today.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '👋' },
      { id: 'goodbye', label: 'Goodbye', emoji: '👋' },
      { id: 'name', label: 'Name', emoji: '🏷️' },
      { id: 'friend', label: 'Friend', emoji: '🤝' },
      { id: 'nice', label: 'Nice to meet you', emoji: '🤗' },
    ],
  },

  {
    id: 'wt4-break', kind: 'title-card', bg: bgWideV2, level: 'A1', unit: 'Unit 1', lessonLabel: 'Break Time', title: 'Great Job!', subtitle: 'Stretch, get some water, then come back for Part 2!', cta: '🤸 I’m Ready!',
  },

  /* =========================== Part 2: Reading ===========================
   * Continues straight from Lesson 2's P/I/N — one new sound, F, per the
   * blueprint's own phonics_focus for this slot. */

  { id: 'wt4-part2-title', kind: 'title-card', bg: bgReadingV2, level: 'A1', unit: 'Unit 1', lessonLabel: 'Part 2', title: 'Reading Time!', subtitle: 'One new sound — /f/ — then read real words!', cta: '📖 LET’S READ!' },

  {
    id: 'wt4-model-f', kind: 'sound-model', bg: bgReadingV2, who: 'pip', letter: 'F', phoneme: '/f/', sound: 'fff',
    teacher: 'A brand-new sound! /f/ /f/ Fox! Just like me!',
    anchors: [
      { word: 'fan', emoji: '🪭' },
      { word: 'fish', emoji: '🐟', img: '/lep1/alphabet/item-fish.png' },
      { word: 'fox', emoji: '🦊' },
    ],
  },
  { id: 'wt4-trace-f', kind: 'trace', bg: bgReadingV2, who: 'pip', letter: 'F', phoneme: '/f/', word: 'fox', teacher: 'Trace the letter F! Say /f/ /f/ /f/ as you draw.' },

  {
    id: 'wt4-word-build', kind: 'word-build', bg: bgReadingV2, teacher: 'You know a new sound! Now read three more real words!',
    rounds: [
      { word: 'FAN', blankIndex: 0, answer: 'F', choices: ['F', 'S', 'P'], emoji: '🪭' },
      { word: 'FIN', blankIndex: 0, answer: 'F', choices: ['F', 'P', 'T'], emoji: '🐟' },
      { word: 'SIP', blankIndex: 0, answer: 'S', choices: ['S', 'F', 'P'], emoji: '🥤' },
    ],
  },

  {
    id: 'wt4-letter-hunt', kind: 'letter-game', bg: bgReadingV2, who: 'marigold', mode: 'name',
    teacher: 'Alphabet game! Find the letter I say.',
    rounds: [
      { letter: 'F', choices: ['F', 'P', 'T'] },
      { letter: 'A', choices: ['A', 'O', 'E'] },
      { letter: 'N', choices: ['N', 'M', 'H'] },
    ],
  },
  {
    id: 'wt4-sound-hunt', kind: 'letter-game', bg: bgReadingV2, who: 'pip', mode: 'sound',
    teacher: 'Sound game! Listen, then tap the letter that makes that sound.',
    rounds: [
      { letter: 'F', phoneme: '/f/', choices: ['F', 'S', 'P'] },
      { letter: 'A', phoneme: '/æ/', choices: ['A', 'I', 'O'] },
      { letter: 'N', phoneme: '/n/', choices: ['N', 'M', 'D'] },
    ],
  },
  {
    id: 'wt4-class-puzzle', kind: 'jigsaw-puzzle', bg: bgWideV2, teacher: 'Puzzle game! Drag the pieces to put the class picture back together!',
    image: bgWideV2, rows: 2, cols: 3,
  },

  {
    id: 'wt4-goodbye-song', kind: 'song', bg: bgExpressGoodbyeV2, title: '🎵 Welcome Town School Goodbye Song 🎵', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3?v=3`,
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'marigold', text: '👋 Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '👋 Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '🏫 Welcome Town School is happy today' },
      { who: 'pip', text: '💖 Byeeee, friends! See you soon!' },
    ],
  },

  { id: 'wt4-finale', kind: 'finale', bg: bgWideV2, who: 'pip', line: 'You met a partner, had a real conversation, and learned a new sound — F is for friend, and F is for Fox, just like me! ✨🗣️' },
]);
