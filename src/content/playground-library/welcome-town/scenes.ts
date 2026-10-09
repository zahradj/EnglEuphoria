import type { Scene as PreA1Scene } from '../unit1/scenes';
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
  | {
      /** Feelings Survey (A1 ★ "Find Someone Who"): pick a friend, ask "How are you, <name>?", hear the answer,
       *  tap the matching face on the clipboard; the host reads the chart back. `img` = neutral picture shown
       *  until the row is filled (`feelImg` after). See scene-components/FeelingsSurveyScene.tsx. */
      id: string; kind: 'feelings-survey'; bg: string; teacher: string; who: CharKey; title: string; intro: string;
      friends: { who: CharKey; name: string; feeling: string; img: string; feelImg?: string }[];
      faces: { feeling: string; emoji: string; color: string }[];
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
export const LESSON_1_OBJECTIVE = "Say hello and goodbye, ask \"What's your name?\", answer \"My name's… / I'm…\", and spell your name.";

/** Welcome Town School is all set in the classroom, so its characters speak on the chalkboard plate. */
const classroomLook = (scenes: Scene[]): Scene[] =>
  scenes.map((sc) => (sc.kind === 'meet' && !sc.look ? { ...sc, look: 'chalk' as const } : sc));

// Word pages (A1 word look, owner 2026-10-09): a character on one side, the word big on the open side.
const bgL1WordHello = `${W}/scenes/bg-vocab-pip-happy-wide.png`;
const bgL1WordName = `${W}/scenes/bg-heshe-intro-mia-wide.png`;
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

export const LESSON_1_SCENES: Scene[] = classroomLook([
  { id: 'wt-title', kind: 'title-card', bg: bgL1Class, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 1', title: 'Hello, My Name Is…', subtitle: 'Say hello, ask a name, and spell your name', cta: '\u{1F44B} LET’S GO!' },

  {
    // Warm-up: the unit's Hello Song (scripts/songs.json "wt-hello"). Wave on
    // "hello", point to yourself on "say your name". (First lesson: no Remember? page.)
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

  /* ---- Present: one word page per chunk ---- */
  { id: 'wt-word-hello', kind: 'meet', look: 'word', word: 'Hello!', wordNote: '\u{1F44B}', focus: ['Hello', 'Hi'], bg: bgL1WordHello, who: 'pip', cardSide: 'right', teacher: 'Tap Pip. Wave and say hello!', line: 'Hello! Hi! I’m Pip.', repeat: 'Hello!' },
  { id: 'wt-word-name', kind: 'meet', look: 'word', word: 'name', wordNote: '\u{1F3F7}\u{FE0F}', focus: ['name'], bg: bgL1WordName, who: 'mia', cardSide: 'left', teacher: 'Tap Mia. Point to you and say: My name is …', line: 'My name is Mia.', repeat: 'My name is Mia.' },
  {
    id: 'wt-echo-question', kind: 'echo', bg: bgL1Peers, who: 'pip', textSide: 'top',
    teacher: 'Listen and say it with Pip!', word: 'What’s your name?',
  },
  { id: 'wt-word-goodbye', kind: 'meet', look: 'word', word: 'Goodbye!', wordNote: '\u{1F44B}', focus: ['Goodbye', 'Bye'], bg: bgL1WordGoodbye, who: 'pip', cardSide: 'left', teacher: 'Pip is going home. Tap him, then wave and say goodbye!', line: 'Goodbye, Miss Marigold! Bye!', repeat: 'Goodbye!' },

  /* ---- Move & Say (Pre-A1 TPR game): the body learns the chunks ---- */
  {
    id: 'wt-move-say', kind: 'prea1', teacher: 'Stand up! Do the action and say it with Pip.',
    scene: {
      id: 'wt-move-say', kind: 'tpr-actions', bg: bgL1Peers, who: 'pip', teacher: 'Stand up! Do the action and say it with Pip.',
      rounds: [
        { line: 'Wave and say: Hello!', emoji: '\u{1F44B}' },
        { line: 'Point to you and say: My name is …', emoji: '\u{1F449}' },
        { line: 'Shake hands and say: Hi!', emoji: '\u{1F91D}' },
        { line: 'Wave goodbye and say: Bye!', emoji: '\u{1F64B}' },
      ],
    },
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

  /* ---- Listen for the name (Pre-A1 Buzzer Show) ---- */
  {
    id: 'wt-name-buzzer', kind: 'prea1', teacher: 'Buzzer Show! Pip says a name. The student presses the buzzer under that friend, then says hello to them.',
    scene: {
      id: 'wt-name-buzzer', kind: 'buzzer-show', bg: bgL1Stage, who: 'pip',
      teacher: 'Buzzer Show! Pip says a name. The student presses the buzzer under that friend, then says hello to them.',
      intro: 'Listen to the name. Then press the right buzzer!',
      podiums: [{ x: 22.8, y: 72.5, by: 55.5 }, { x: 49.5, y: 72.5, by: 55.5 }, { x: 76.3, y: 72.5, by: 55.5 }],
      faces: L1_FACES,
      rounds: [
        { faces: [1, 2, 0], answer: 1, line: 'Where is Leo?', reply: 'Yes! His name is Leo!', say: 'Hello, Leo!' },
        { faces: [3, 1, 4], answer: 0, line: 'Where is Bella?', reply: 'Yes! Her name is Bella!', say: 'Hi, Bella!' },
        { faces: [2, 4, 1], answer: 2, line: 'Where is Mia?', reply: 'Yes! Her name is Mia!', say: 'Hello, Mia!' },
        { faces: [0, 3, 4], answer: 2, line: 'Where is Willow?', reply: 'Yes! Her name is Willow!', say: 'Hi, Willow!' },
      ],
      doneLine: 'You know all the names! Super!',
    },
  },

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

  /* ---- Spin and greet: say hello to the friend on the number ---- */
  {
    id: 'wt-spin-greet', kind: 'spin-wheel', bg: bgL1Class, title: 'Spin and say hello!',
    teacher: 'Have the student spin the wheel and say hello to the friend on that number ("Hello, Mia!"). If you prefer, do the activity without the spinner.',
    items: [
      { label: 'Hello, Pip!', left: '23%', top: '50%' },
      { label: 'Hello, Mia!', left: '34%', top: '50%' },
      { label: 'Hello, Bella!', left: '46%', top: '52%' },
      { label: 'Hello, Willow!', left: '63%', top: '52%' },
      { label: 'Hello, Leo!', left: '78%', top: '50%' },
      { label: 'Hello, Miss Marigold!', left: '50%', top: '14%' },
    ],
    wheelAt: { left: '84%', top: '24%' },
  },

  /* ---- Review game ---- */
  {
    id: 'wt-memory-words', kind: 'memory', bg: bgL1Circle, teacher: 'Find the pairs! Say each word when you see it.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '\u{1F64B}' },
      { id: 'goodbye', label: 'Goodbye', emoji: '\u{1F6AA}' },
      { id: 'name', label: 'Name', emoji: '\u{1F3F7}\u{FE0F}' },
      { id: 'party', label: 'Party', emoji: '\u{1F389}' },
    ],
  },

  /* ---- Spelling a name (A–Z) ---- */
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

  /* ---- Quick-fire recall (Pre-A1 Rapid Recall) ---- */
  {
    id: 'wt-quick-fire', kind: 'prea1', teacher: 'Quick fire! Say it before the ring runs out.',
    scene: {
      id: 'wt-quick-fire', kind: 'rapid-recall', bg: bgL1Class, who: 'pip', seconds: 3,
      teacher: 'Quick fire! Say it before the ring runs out.',
      cards: [
        { img: `${W}/sprites/pip-happy.png`, word: 'Hello!' },
        { img: spr('mia'), word: 'Mia', say: 'Her name is Mia.' },
        { img: spr('leo'), word: 'Leo', say: 'His name is Leo.' },
        { img: spr('bella'), word: 'Bella', say: 'Her name is Bella.' },
        { img: spr('willow'), word: 'Willow', say: 'Her name is Willow.' },
      ],
    },
  },

  /* ---- Sticker + Home Mission (Pre-A1 blueprint slides 19-20) ---- */
  {
    id: 'wt-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts Pip in their Sticker Book.',
    scene: {
      id: 'wt-sticker', kind: 'sticker-reward', bg: bgL1Party, who: 'pip', teacher: 'Sticker time! The student opens the pack and puts Pip in their Sticker Book.',
      line: 'You can say hello and ask a name! Here is your sticker.',
      sticker: { img: spr('pip'), label: 'Hello, Pip!' },
    },
  },
  {
    id: 'wt-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt-home-mission', kind: 'home-mission', bg: bgL1Class, who: 'pip',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned "Hello!", "Goodbye!", "What’s your name?" and "My name is …". Let them greet you and ask your name.',
      steps: [
        { emoji: '\u{1F44B}', say: 'Say hello to your family.' },
        { emoji: '\u{2753}', say: 'Ask: What’s your name?' },
        { emoji: '\u{1F3F7}\u{FE0F}', say: 'Say: My name is …' },
      ],
    },
  },

  /* ---- Extra time: brain break ---- */
  {
    id: 'wt-brain-break', kind: 'prea1', teacher: 'Extra time: brain break! Stand up and move with Pip.',
    scene: {
      id: 'wt-brain-break', kind: 'tpr-actions', mode: 'break', bg: bgL1Circle, who: 'pip',
      teacher: 'Extra time: brain break! Stand up and move with Pip.',
      rounds: [
        { line: 'Stretch up high!', emoji: '\u{1F64C}' },
        { line: 'Jump, jump, jump!', emoji: '\u{1F998}' },
        { line: 'Wave to a friend!', emoji: '\u{1F44B}' },
        { line: 'Freeze!', emoji: '\u{1F9CA}' },
      ],
    },
  },

  /* ---- Goodbye (this lesson's own ending) ---- */
  { id: 'wt-goodbye-class', kind: 'meet', focus: ['Goodbye'], bg: bgL1Goodbye, who: 'marigold', cardSide: 'left', teacher: 'Time to go! Wave and say goodbye to Miss Marigold.', line: 'Goodbye, everyone! Bye-bye!', repeat: 'Goodbye!' },

  { id: 'wt-finale', kind: 'finale', bg: bgL1Class, who: 'pip', line: 'You said hello, asked names, and spelled names! Bye-bye!' },
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
export const LESSON_2_OBJECTIVE = 'Ask and answer "How are you?" (I am happy / tired / sad / angry / hungry), say how a friend feels with He is / She is / They are, and learn the sounds P, I, N to read SIT, PIN and PIP.';

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
// -v2 = regenerated 2026-10-09 (Gemini, the wave sprite as reference): solid fills, whole bowl, no ground shadow.
const feelSpr = (name: string) => `${W}/sprites/${name}.png`; // TODO: -v2 once regenerated (Gemini credits ran out 2026-10-09)
// Spinner badges sit above each friend's head on bg-classroom-feelings-wide.png (Pip, Leo, Mia, Bella, Willow).

export const LESSON_2_SCENES: Scene[] = classroomLook([
  { id: 'wt2-title', kind: 'title-card', bg: bgWideW, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 2', title: 'How Are You?', subtitle: 'Say how you feel, and how your friends feel', cta: '\u{1F392} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): a quick warm-up of Lesson 1 · Hello, My Name Is….
    id: 'wt2-recall-warmup', kind: 'recall-warmup', bg: '/welcome-town/scenes/bg-classroom-circle-wide.png', who: 'pip', mode: 'click',
    fromLabel: "Lesson 1 · Hello, My Name Is…",
    teacher: 'Warm-up from last lesson: Pip says it, the student finds the picture and says it too.',
    items: [
      { word: "hello", say: "Find hello!", img: '/welcome-town/scenes/bg-vocab-pip-happy-wide.png' },
      { word: "goodbye", say: "Find goodbye!", img: '/welcome-town/scenes/bg-classroom-door-wide.png' },
      { word: "name", say: "Find: My name is Mia!", img: '/welcome-town/scenes/bg-heshe-intro-mia-wide.png' },
    ],
  },

  {
    id: 'wt2-intro', kind: 'cinematic', bg: bgCircleW, title: 'Back to Welcome Town School', subtitle: 'A new question today', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome back, class! Hello, Pip!' },
      { who: 'pip', line: 'Hello, Miss Marigold! My name is Pip.' },
      { who: 'marigold', line: 'Today we learn a new question: How are you?' },
    ],
    cta: '\u{1F392} LET’S GO!',
  },

  {
    id: 'wt2-howareyou', kind: 'meet', focus: ['How are you'], bg: bgCircleW, who: 'marigold',
    teacher: 'Tap Miss Marigold to hear the new question!',
    line: 'How are you today? I am fine, thank you!', repeat: 'How are you?',
  },
  {
    id: 'wt2-echo-howareyou', kind: 'echo', bg: bgCircleW, who: 'pip', textSide: 'top',
    teacher: 'Listen and say it with Pip!', word: 'How are you?',
  },

  /* --- Feelings: one word page per feeling (character on one side, the word big on the open side),
   * a quick game after every two pages. Each friend answers "How are you?" with "I am …". */
  {
    id: 'wt2-vocab-pip-happy', kind: 'meet', look: 'word', focus: ['happy'], bg: bgVocabPipHappyW, who: 'pip', cardSide: 'right',
    teacher: 'Smile and say it with Pip!', line: 'I am happy!', repeat: 'Happy!',
  },
  {
    id: 'wt2-vocab-leo-tired', kind: 'meet', look: 'word', focus: ['tired'], bg: bgVocabLeoTiredW, who: 'leo', cardSide: 'left',
    teacher: 'Yawn and say it with Leo!', line: 'I am tired!', repeat: 'Tired!',
  },
  {
    id: 'wt2-quick-tired', kind: 'choice', bg: bgVocabLeoTiredW, who: 'leo', teacher: 'Leo yawns. Which word is it?',
    prompt: 'Yawn! I am…',
    options: [
      { label: 'Happy', emoji: '\u{1F60A}' },
      { label: 'Tired', emoji: '\u{1F62A}', correct: true },
    ],
  },
  {
    id: 'wt2-vocab-mia-sad', kind: 'meet', look: 'word', focus: ['sad'], bg: bgVocabMiaSadW, who: 'mia', cardSide: 'right',
    teacher: 'Make a sad face and say it with Mia!', line: 'I am sad!', repeat: 'Sad!',
  },
  {
    id: 'wt2-vocab-bella-angry', kind: 'meet', look: 'word', focus: ['angry'], bg: bgVocabBellaAngryW, who: 'bella', cardSide: 'left',
    teacher: 'Make an angry face and say it with Bella!', line: 'I am angry!', repeat: 'Angry!',
  },
  {
    id: 'wt2-quick-angry', kind: 'choice', bg: bgVocabBellaAngryW, who: 'bella', teacher: 'Bella folds her arms. Which word is it?',
    prompt: 'Grrr! I am…',
    options: [
      { label: 'Sad', emoji: '\u{1F622}' },
      { label: 'Angry', emoji: '\u{1F620}', correct: true },
    ],
  },
  {
    id: 'wt2-vocab-willow-hungry', kind: 'meet', look: 'word', focus: ['hungry'], bg: bgVocabWillowHungryW, who: 'willow', cardSide: 'right',
    teacher: 'Rub your tummy and say it with Willow!', line: 'I am hungry!', repeat: 'Hungry!',
  },

  /* --- Move & Say (Pre-A1 TPR game): the body shows each feeling ---- */
  {
    id: 'wt2-move-say', kind: 'prea1', teacher: 'Stand up! Do the face or the action and say the sentence with Pip.',
    scene: {
      id: 'wt2-move-say', kind: 'tpr-actions', bg: '/lep1/scenes/bg-u3l4-room-empty-wide.png', who: 'pip', teacher: 'Stand up! Do the face or the action and say the sentence with Pip.',
      rounds: [
        { line: 'Smile big! I am happy!', emoji: '\u{1F60A}', img: feelSpr('pip-happy') },
        { line: 'Yawn and stretch! I am tired!', emoji: '\u{1F62A}', img: feelSpr('leo-tired') },
        { line: 'Make a sad face! I am sad!', emoji: '\u{1F622}', img: feelSpr('mia-sad') },
        { line: 'Stamp your feet! I am angry!', emoji: '\u{1F620}', img: feelSpr('bella-angry') },
        { line: 'Rub your tummy! I am hungry!', emoji: '\u{1F924}', img: feelSpr('willow-hungry') },
      ],
    },
  },

  {
    id: 'wt2-vocab-feelings', kind: 'vocab-spot', bg: bgFeelingsW,
    teacher: 'Look at each friend! Tap the arrow to hear how they feel.',
    items: [
      { label: 'Happy', sentence: 'I am happy.', emoji: '\u{1F60A}', left: '29.8%', top: '54.5%', color: '#FE6A2F', who: 'pip' },
      { label: 'Tired', sentence: 'I am tired.', emoji: '\u{1F62A}', left: '40.4%', top: '55.6%', color: '#C97A2F', who: 'leo' },
      { label: 'Sad', sentence: 'I am sad.', emoji: '\u{1F622}', left: '51.1%', top: '57.9%', color: '#B85CD1', who: 'mia' },
      { label: 'Angry', sentence: 'I am angry.', emoji: '\u{1F620}', left: '61.8%', top: '56.8%', color: '#E76FA5', who: 'bella' },
      { label: 'Hungry', sentence: 'I am hungry.', emoji: '\u{1F924}', left: '72.5%', top: '57.9%', color: '#4FA9E0', who: 'willow' },
    ],
  },
  {
    // Name That Feeling (Khan Academy Kids pattern, roadmap): hear the question, tap the friend.
    id: 'wt2-choice', kind: 'listen-tap', bg: bgFeelingsW, teacher: 'Listen, then tap the right friend!',
    targets: [
      { label: 'Happy', left: '29.8%', top: '54.5%', color: '#FE6A2F' },
      { label: 'Tired', left: '40.4%', top: '55.6%', color: '#C97A2F' },
      { label: 'Sad', left: '51.1%', top: '57.9%', color: '#B85CD1' },
      { label: 'Angry', left: '61.8%', top: '56.8%', color: '#E76FA5' },
      { label: 'Hungry', left: '72.5%', top: '57.9%', color: '#4FA9E0' },
    ],
    rounds: [
      { prompt: 'Who is hungry?', answerLabel: 'Hungry', who: 'willow' },
      { prompt: 'Who is sad?', answerLabel: 'Sad', who: 'mia' },
      { prompt: 'Who is tired?', answerLabel: 'Tired', who: 'leo' },
      { prompt: 'Who is angry?', answerLabel: 'Angry', who: 'bella' },
      { prompt: 'Who is happy?', answerLabel: 'Happy', who: 'pip' },
    ],
  },

  {
    // Feelings Survey (owner 2026-10-09: "use a new game from the game list that serves the objective"):
    // the child ASKS each friend "How are you?" and fills the chart from the answer they HEAR.
    // Feelings deliberately differ from the word pages (Leo is hungry here, not tired) so it is listening, not memory.
    id: 'wt2-feelings-survey', kind: 'feelings-survey', bg: bgCircleW, who: 'pip',
    title: 'Pip’s Feelings Survey',
    intro: 'Let’s ask our friends: How are you? Tap a friend!',
    teacher: 'Feelings Survey: the student taps a friend and ASKS out loud "How are you, Leo?", then taps "I asked!". The friend answers; the student taps that face on the chart. At the end Pip reads the chart.',
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
    id: 'wt2-join-stage', kind: 'join-stage', bg: bgCircleW, teacher: 'Your turn! When it says YOU, say how you feel, then ask back.', cast: ['pip', 'marigold'],
    turns: [
      { who: 'marigold', line: 'How are you today?' },
      { who: 'student', line: 'I am … !' },
      { who: 'pip', line: 'Now ask me!' },
      { who: 'student', line: 'How are you, Pip?' },
      { who: 'pip', line: 'I am happy!' },
    ],
  },
  {
    id: 'wt2-feelings-memory', kind: 'memory', bg: bgFeelingsW, teacher: 'Memory game! Find the pairs and say each feeling!',
    pairs: [
      { id: 'happy', label: 'Happy', emoji: '\u{1F60A}' },
      { id: 'tired', label: 'Tired', emoji: '\u{1F62A}' },
      { id: 'sad', label: 'Sad', emoji: '\u{1F622}' },
      { id: 'angry', label: 'Angry', emoji: '\u{1F620}' },
      { id: 'hungry', label: 'Hungry', emoji: '\u{1F924}' },
    ],
  },

  {
    // Feelings Freeze (Brain Break, game list): dance, then freeze with the face Pip calls — movement for a 6-9 year
    // old after ~15 minutes of sitting, and one more listen-and-show round of all five feelings.
    id: 'wt2-feelings-freeze', kind: 'prea1', teacher: 'Brain break! Dance, then FREEZE with the face Pip says.',
    scene: {
      id: 'wt2-feelings-freeze', kind: 'tpr-actions', mode: 'break', bg: '/lep1/scenes/bg-u3l4-room-empty-wide.png', who: 'pip',
      teacher: 'Brain break! Dance, then FREEZE with the face Pip says.',
      rounds: [
        { line: 'Dance, dance! Freeze! Show me happy!', emoji: '\u{1F60A}' },
        { line: 'Dance, dance! Freeze! Show me tired!', emoji: '\u{1F62A}' },
        { line: 'Dance, dance! Freeze! Show me angry!', emoji: '\u{1F620}' },
        { line: 'Dance, dance! Freeze! Show me sad!', emoji: '\u{1F622}' },
        { line: 'Dance, dance! Freeze! Show me hungry!', emoji: '\u{1F924}' },
      ],
    },
  },

  /* Boy -> he, girl -> she, boy + girl -> they (owner 2026-10-09: "How would the student know if it is a boy or a
   * girl? ... a boy plus a girl equals they. They are happy."). One idea per page, a check after each pair. */
  {
    id: 'wt2-boy-pip', kind: 'meet', look: 'word', word: 'boy', wordNote: '\u{1F466}', focus: ['boy'], bg: bgHeIntroPipW, who: 'pip', cardSide: 'right',
    teacher: 'Listen, then repeat! Point to Pip: a boy.', line: 'This is Pip. Pip is a boy. He is a boy!', repeat: 'A boy!',
  },
  {
    id: 'wt2-he-pip', kind: 'meet', look: 'word', word: 'He', wordNote: '\u{1F466} =', focus: ['He'], bg: bgVocabPipHappyW, who: 'pip', cardSide: 'right',
    teacher: 'A boy = HE. Listen, then repeat!', line: 'He is happy!', repeat: 'He is happy!',
  },
  {
    id: 'wt2-heshe-check-leo', kind: 'choice', bg: bgVocabLeoTiredW, who: 'leo', teacher: 'Look at Leo. Leo is a boy. He or she?',
    prompt: 'Leo is a boy. … is tired.',
    options: [
      { label: 'He', emoji: '\u{1F466}', correct: true },
      { label: 'She', emoji: '\u{1F467}' },
    ],
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
    id: 'wt2-heshe-check-bella', kind: 'choice', bg: bgVocabBellaAngryW, who: 'bella', teacher: 'Look at Bella. Bella is a girl. He or she?',
    prompt: 'Bella is a girl. … is angry.',
    options: [
      { label: 'She', emoji: '\u{1F467}', correct: true },
      { label: 'He', emoji: '\u{1F466}' },
    ],
  },
  {
    id: 'wt2-they-pip-mia', kind: 'meet', look: 'word', word: 'They', wordNote: '\u{1F466} + \u{1F467} =', focus: ['They'], bg: bgHeSheTogetherW, who: 'pip',
    teacher: 'A boy + a girl = THEY. Listen, then repeat!', line: 'A boy and a girl. They are happy!', repeat: 'They are happy!',
  },
  {
    id: 'wt2-heshe-together', kind: 'listen-tap', bg: bgHeSheTogetherW, teacher: 'Listen, then tap the right friend!',
    targets: [
      { label: 'Pip', left: '37.6%', top: '52.8%', color: '#FE6A2F' },
      { label: 'Mia', left: '62.4%', top: '52.8%', color: '#B85CD1' },
    ],
    rounds: [
      { prompt: 'Tap He — the boy!', answerLabel: 'Pip', who: 'pip' },
      { prompt: 'Tap She — the girl!', answerLabel: 'Mia', who: 'mia' },
      { prompt: 'Tap She!', answerLabel: 'Mia', who: 'mia' },
      { prompt: 'Tap He!', answerLabel: 'Pip', who: 'pip' },
    ],
  },
  {
    // Boys (Pip, Leo) -> He; girls (Mia, Bella, Willow) -> She; two friends together -> They.
    id: 'wt2-pronoun-sort', kind: 'pronoun-sort', bg: bgFeelingsW, teacher: 'Drag each friend to He, She, or They!',
    rounds: [
      { who: 'pip', img: feelSpr('pip-happy'), emotion: 'happy', answer: 'He' },
      { who: 'mia', img: feelSpr('mia-sad'), emotion: 'sad', answer: 'She' },
      { who: 'leo', img: feelSpr('leo-tired'), emotion: 'tired', answer: 'He' },
      { who: 'bella', img: feelSpr('bella-angry'), emotion: 'angry', answer: 'She' },
      { who: 'willow', img: feelSpr('willow-hungry'), emotion: 'hungry', answer: 'She' },
      { who: ['leo', 'willow'], img: [feelSpr('leo-tired'), feelSpr('willow-hungry')], emotion: 'tired and hungry', answer: 'They' },
      { who: ['pip', 'mia'], img: [feelSpr('pip-happy'), feelSpr('mia-sad')], emotion: 'happy and sad', answer: 'They' },
    ],
  },
  {
    // Claw Machine (game list): listen for the feeling, grab that friend, then say it with He / She.
    id: 'wt2-feelings-claw', kind: 'prea1', teacher: 'Feelings Grabber! Listen to Pip, move the claw to the right friend and press the red button. Then say: He is … / She is …',
    scene: {
      id: 'wt2-feelings-claw', kind: 'claw-machine', bg: '/lep1/scenes/bg-u3l6-claw-machine-wide.png', who: 'pip', clawImg: '/lep1/items/item-claw.png',
      teacher: 'Feelings Grabber! Listen to Pip, move the claw to the right friend and press the red button. Then say: He is … / She is …',
      glass: { x: 49, y: 43, w: 50, h: 52 },
      toys: [
        { label: 'Pip', img: feelSpr('pip-happy'), x: 12, size: 9 },
        { label: 'Mia', img: feelSpr('mia-sad'), x: 31, size: 9 },
        { label: 'Leo', img: feelSpr('leo-tired'), x: 50, size: 9 },
        { label: 'Willow', img: feelSpr('willow-hungry'), x: 69, size: 9 },
        { label: 'Bella', img: feelSpr('bella-angry'), x: 88, size: 9 },
      ],
      rounds: [
        { target: 3, line: 'Get the friend who is hungry!', reply: 'Willow! She is hungry!' },
        { target: 2, line: 'Get the friend who is tired!', reply: 'Leo! He is tired!' },
        { target: 4, line: 'Get the friend who is angry!', reply: 'Bella! She is angry!' },
        { target: 0, line: 'Get the friend who is happy!', reply: 'Pip! He is happy!' },
      ],
    },
  },
  {
    // Feelings spinner (roadmap): the wheel picks a friend, the child says the whole sentence.
    id: 'wt2-spin-feelings', kind: 'spin-wheel', bg: bgFeelingsW, title: 'Spin! How is your friend?',
    teacher: 'Have the student spin the wheel and say how that friend feels: "He is happy!" / "She is sad!". If you prefer, do the activity without the spinner.',
    items: [
      { label: 'He is happy!', left: '31%', top: '40%' },
      { label: 'He is tired!', left: '42%', top: '36%' },
      { label: 'She is sad!', left: '52%', top: '51%' },
      { label: 'She is angry!', left: '62%', top: '40%' },
      { label: 'She is hungry!', left: '72%', top: '52%' },
    ],
    wheelAt: { left: '16%', top: '26%' },
  },

  {
    // Tile Reveal (Wordwall "Image quiz", game list): a friend hides under tiles; guess early and say the sentence.
    id: 'wt2-who-hiding', kind: 'prea1', teacher: 'Who is hiding? Tiles pop off one by one. Guess early, tap the friend, then say: "It’s Mia! She is sad!"',
    scene: {
      id: 'wt2-who-hiding', kind: 'tile-reveal', bg: bgFeelingsW, who: 'pip',
      teacher: 'Who is hiding? Tiles pop off one by one. Guess early, tap the friend, then say: "It’s Mia! She is sad!"',
      rounds: [
        { img: feelSpr('mia-sad'), word: 'Mia', line: 'It’s Mia! She is sad!', options: [{ label: 'Bella', img: feelSpr('bella-angry') }, { label: 'Mia', img: feelSpr('mia-sad') }, { label: 'Leo', img: feelSpr('leo-tired') }] },
        { img: feelSpr('leo-tired'), word: 'Leo', line: 'It’s Leo! He is tired!', options: [{ label: 'Leo', img: feelSpr('leo-tired') }, { label: 'Pip', img: feelSpr('pip-happy') }, { label: 'Willow', img: feelSpr('willow-hungry') }] },
        { img: feelSpr('bella-angry'), word: 'Bella', line: 'It’s Bella! She is angry!', options: [{ label: 'Mia', img: feelSpr('mia-sad') }, { label: 'Willow', img: feelSpr('willow-hungry') }, { label: 'Bella', img: feelSpr('bella-angry') }] },
      ],
    },
  },
  {
    id: 'wt2-storybook', kind: 'flipbook', bg: bgWideW, title: "Pip's Tired Day",
    pages: [
      { who: 'pip', img: `${W}/scenes/bg-story-pip-tired.png`, text: 'Pip feels tired today. "I am so tired!"' },
      { who: 'mia', img: `${W}/scenes/bg-story-mia-checks-pip.png`, text: 'Mia asks, "How are you, Pip?"' },
      { who: 'pip', img: `${W}/scenes/bg-story-pip-rests-plays.png`, text: 'Pip rests, then plays with his friends.' },
      { img: `${W}/scenes/bg-story-pip-happy-friends.png`, text: 'Now Pip is happy! They are all happy!' },
    ],
    checkpoints: [
      { afterPage: 0, who: 'pip', question: 'How is Pip at first?', options: ['Happy', 'Tired', 'Angry'], answer: 'Tired' },
      { afterPage: 3, who: 'mia', question: 'How is Pip at the end?', options: ['Sad', 'Happy', 'Tired'], answer: 'Happy' },
    ],
  },

  {
    // Picture <-> sentence match (game list, universal): the first READING of the lesson's sentences, as a calm self-check.
    id: 'wt2-read-match', kind: 'picture-match', bg: bgCircleW, studentOnly: true,
    prompt: 'Read and match!',
    teacher: 'Auto-evaluation slide. The student reads each sentence and drags it under the right picture, without help from the teacher.',
    items: [
      { word: 'He is happy.', img: feelSpr('pip-happy') },
      { word: 'She is sad.', img: feelSpr('mia-sad') },
      { word: 'He is tired.', img: feelSpr('leo-tired') },
      { word: 'She is hungry.', img: feelSpr('willow-hungry') },
    ],
  },

  /* --- Phonics: P, I, N (after S, A, T in Lesson 1), then read real words ---- */
  {
    id: 'wt2-model-p', kind: 'sound-model', bg: bgReadingW, who: 'pip', letter: 'P', phoneme: '/p/', sound: 'puh',
    teacher: 'A new sound! /p/ /p/ Pig!',
    anchors: [
      { word: 'pig', emoji: '\u{1F437}' },
      { word: 'pen', emoji: '\u{1F58A}\u{FE0F}' },
      { word: 'pan', emoji: '\u{1F373}' },
    ],
  },
  { id: 'wt2-trace-p', kind: 'trace', bg: bgReadingW, who: 'pip', letter: 'P', phoneme: '/p/', word: 'pig', teacher: 'Trace the letter P! Say /p/ /p/ /p/ as you draw.' },
  {
    id: 'wt2-model-i', kind: 'sound-model', bg: bgReadingW, who: 'marigold', letter: 'I', phoneme: '/\u{026A}/', sound: 'ih',
    teacher: 'A new sound! /i/ /i/ Ink!',
    anchors: [
      { word: 'ink', emoji: '\u{1F58B}\u{FE0F}' },
      { word: 'igloo', emoji: '\u{1F9CA}', img: '/lep1/alphabet/item-igloo.png' },
      { word: 'insect', emoji: '\u{1F41B}' },
    ],
  },
  {
    id: 'wt2-model-n', kind: 'sound-model', bg: bgReadingW, who: 'pip', letter: 'N', phoneme: '/n/', sound: 'nnn',
    teacher: 'A new sound! /n/ /n/ Nut!',
    anchors: [
      { word: 'nut', emoji: '\u{1F95C}', img: '/lep1/items/item-nut.png' },
      { word: 'net', emoji: '\u{1F945}' },
      { word: 'nose', emoji: '\u{1F443}', img: '/lep1/items/item-nose.png' },
    ],
  },
  {
    id: 'wt2-word-build', kind: 'word-build', bg: bgReadingW, teacher: 'You know 6 sounds now! Read three more real words!',
    rounds: [
      { word: 'SIT', blankIndex: 1, answer: 'I', choices: ['I', 'O', 'U'], emoji: '\u{1FA91}' },
      { word: 'PIN', blankIndex: 0, answer: 'P', choices: ['P', 'B', 'D'], emoji: '\u{1F4CC}' },
      { word: 'PIP', blankIndex: 2, answer: 'P', choices: ['P', 'B', 'D'], emoji: '\u{1F98A}' },
    ],
  },

  /* --- Quick fire, sticker, home mission (Pre-A1 games) ---- */
  {
    id: 'wt2-quick-fire', kind: 'prea1', teacher: 'Quick fire! Say the sentence before the ring runs out.',
    scene: {
      id: 'wt2-quick-fire', kind: 'rapid-recall', bg: bgCircleW, who: 'pip', seconds: 4,
      teacher: 'Quick fire! Say the sentence before the ring runs out.',
      cards: [
        { img: feelSpr('mia-sad'), word: 'sad', say: 'She is sad.' },
        { img: feelSpr('pip-happy'), word: 'happy', say: 'He is happy.' },
        { img: feelSpr('willow-hungry'), word: 'hungry', say: 'She is hungry.' },
        { img: feelSpr('leo-tired'), word: 'tired', say: 'He is tired.' },
        { img: feelSpr('bella-angry'), word: 'angry', say: 'She is angry.' },
      ],
    },
  },
  {
    id: 'wt2-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts happy Pip in their Sticker Book.',
    scene: {
      id: 'wt2-sticker', kind: 'sticker-reward', bg: bgWideW, who: 'pip', teacher: 'Sticker time! The student opens the pack and puts happy Pip in their Sticker Book.',
      line: 'You can say how you feel! Here is your sticker.',
      sticker: { img: feelSpr('pip-happy'), label: 'I am happy!' },
    },
  },
  {
    id: 'wt2-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt2-home-mission', kind: 'home-mission', bg: bgCircleW, who: 'pip',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned "How are you?", "I am happy / tired / sad / angry / hungry" and "He is… / She is… / They are…". Ask them how they feel, and let them ask you.',
      steps: [
        { emoji: '\u{2753}', say: 'Ask your family: How are you?' },
        { emoji: '\u{1F60A}', say: 'Say how you feel: I am happy!' },
        { emoji: '\u{1F46B}', say: 'Say how they feel: He is tired!' },
      ],
    },
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

  { id: 'wt2-finale', kind: 'finale', bg: bgWideW, who: 'pip', line: 'You can say how you feel and how your friends feel, and you read SIT, PIN and PIP! ✨\u{1F3C6}' },
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
