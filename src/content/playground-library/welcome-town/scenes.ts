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
  /* 1 Warm-up song (TPR) */
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
  /* 2 Pip greeting + question */
  { id: 'wt-pip-greets', kind: 'meet', focus: ['name'], bg: bgL1Hello, who: 'pip', cardSide: 'left', teacher: 'Tap Pip. Wave, then answer his question!', line: 'Hi! I’m Pip. What’s your name?', repeat: 'Hi!' },
  /* 3 Story opener */
  {
    id: 'wt-story-open', kind: 'cinematic', bg: bgL1Class, title: 'Pip’s First Day', subtitle: 'A new school, new friends!', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Welcome to Welcome Town School!' },
      { who: 'pip', line: 'It’s my first day. I want to meet new friends!' },
    ],
    cta: '\u{1F392} LET’S GO!',
  },
  /* 4 Vocabulary reveal: the six chunks on one page, one arrow at a time */
  {
    id: 'wt-vocab', kind: 'vocab-spot', bg: bgL1Class, teacher: 'Tap each arrow. Listen, then say it with the friend!',
    items: [
      { label: 'Hello!', sentence: 'Hello, class!', emoji: '\u{1F44B}', left: '50%', top: '22%', color: '#8ECAE6', who: 'marigold' },
      { label: 'Hi!', sentence: 'Hi! I’m Pip.', emoji: '\u{1F64B}', left: '23%', top: '62%', color: '#FE6A2F', who: 'pip' },
      { label: 'name', sentence: 'My name is Mia.', emoji: '\u{1F3F7}\u{FE0F}', left: '34%', top: '64%', color: '#B85CD1', who: 'mia' },
      { label: 'What’s your name?', sentence: 'What’s your name?', emoji: '\u{2753}', left: '78%', top: '62%', color: '#C97A2F', who: 'leo' },
      { label: 'Goodbye!', sentence: 'Goodbye, Pip!', emoji: '\u{1F44B}', left: '46%', top: '66%', color: '#E76FA5', who: 'bella' },
      { label: 'Bye!', sentence: 'Bye-bye!', emoji: '\u{1F64B}', left: '63%', top: '64%', color: '#4FA9E0', who: 'willow' },
    ],
  },
  /* 5 Echo mimic */
  {
    id: 'wt-echo-question', kind: 'echo', bg: bgL1Peers, who: 'pip', textSide: 'top',
    teacher: 'Listen and say it with Pip!', word: 'What’s your name?',
  },
  /* 6 Reveal game: listen to the name, find the friend */
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
  /* 7 Drag & match */
  {
    id: 'wt-match', kind: 'picture-match', prompt: 'Match the words to the pictures',
    teacher: 'Drag each word under its picture, or tap the word and then the slot.',
    items: [
      { word: 'Hello!', img: bgL1WordHello },
      { word: 'Goodbye!', img: bgL1WordGoodbye },
      { word: 'Mia', img: spr('mia') },
      { word: 'Leo', img: spr('leo') },
    ],
    bg: bgL1Circle,
  },
  /* 8 Implicit grammar model (dialogue) */
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
  /* 9 Spinner -> say a sentence */
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
  /* 10 Teacher asks, child answers */
  {
    id: 'wt-answer', kind: 'join-stage', bg: bgL1Circle, teacher: 'Pip asks. The student answers with a whole sentence.', cast: ['pip', 'marigold'],
    turns: [
      { who: 'pip', line: 'Hi! What’s your name?' },
      { who: 'student', line: 'Hello! My name is …' },
      { who: 'marigold', line: 'Goodbye! See you tomorrow!' },
      { who: 'student', line: 'Goodbye! Bye!' },
    ],
  },
  /* 11 Role swap: the child asks (signature game: Pip's Welcome Party) */
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
  /* 12 Game break: memory */
  {
    id: 'wt-memory-words', kind: 'memory', bg: bgL1Circle, teacher: 'Find the pairs! Say each word when you see it.',
    pairs: [
      { id: 'hello', label: 'Hello', emoji: '\u{1F64B}' },
      { id: 'goodbye', label: 'Goodbye', emoji: '\u{1F6AA}' },
      { id: 'name', label: 'Name', emoji: '\u{1F3F7}\u{FE0F}' },
      { id: 'party', label: 'Party', emoji: '\u{1F389}' },
    ],
  },
  /* 13 Personal production: the child's own name badge, then "My name is …" */
  {
    id: 'wt-name-badge', kind: 'name-badge', bg: bgL1Party, who: 'marigold',
    teacher: 'Listen to the letters. Tap them in order!',
    rounds: [
      { name: 'Pip', sprite: spr('pip'), choices: ['A', 'P', 'T', 'I'] },
      { name: 'Mia', sprite: spr('mia'), choices: ['N', 'A', 'M', 'I'] },
      { name: 'Leo', sprite: spr('leo'), choices: ['O', 'L', 'A', 'E'] },
    ],
  },
  /* 14 Phonics micro-moment */
  {
    // Universal phonics slide (blueprint slot 14): Blend It! — say each sound, blend, find the picture.
    id: 'wt-blend', kind: 'sound-blend', bg: bgL1Reading,
    teacher: 'Tap each car and say the sound with the student (/h/ /a/ /t/), press Blend!, then find the picture. All -at words!',
    rounds: [
      { word: 'hat', img: '/lep1/items/item-hat.png' },
      { word: 'cat', img: '/lep1/items/item-cat.png' },
      { word: 'mat', img: '/lep1/items/item-mat.png' },
      { word: 'bat', img: '/lep1/items/item-bat.png' },
    ],
  },
  /* 15 Quick-fire recall */
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
  /* 16 Story payoff */
  {
    id: 'wt-story-end', kind: 'cinematic', bg: bgL1Goodbye, title: 'New Friends!', subtitle: 'The end of Pip’s first day', narrator: 'marigold',
    script: [
      { who: 'pip', line: 'I have new friends: Mia, Leo, Bella and Willow!' },
      { who: 'marigold', line: 'Time to go home. Goodbye, Pip!' },
      { who: 'pip', line: 'Goodbye, Miss Marigold! Bye!' },
    ],
    cta: '\u{1F44B} BYE!',
  },
  /* 17 Sing-back: the child leads */
  {
    // Warm-up: the unit's Hello Song (scripts/songs.json "wt-hello"). Wave on
    // "hello", point to yourself on "say your name". (First lesson: no Remember? page.)
    id: 'wt-sing-back', kind: 'song', bg: bgL1Class, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Sing-back: now the student leads the song and the teacher answers. Wave on hello, point on name!',
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
  /* 18 Reflection: show me your favourite */
  {
    id: 'wt-favourite', kind: 'choice', bg: bgL1Circle, who: 'pip', teacher: 'Any answer is right! The student picks a favourite and says it: "My favourite is Hello!"',
    prompt: 'What is your favourite word today?',
    options: [
      { label: 'Hello', emoji: '\u{1F44B}', correct: true },
      { label: 'Hi', emoji: '\u{1F64B}', correct: true },
      { label: 'name', emoji: '\u{1F3F7}\u{FE0F}', correct: true },
      { label: 'Goodbye', emoji: '\u{1F6AA}', correct: true },
    ],
  },
  /* 19 Sticker  20 Home Mission */
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
  /* Extra time (blueprint §3b): only if there is time left */
  {
    id: 'wt-move-say', kind: 'prea1', teacher: 'Extra time: Stand up! Do the action and say it with Pip.',
    scene: {
      id: 'wt-move-say', kind: 'tpr-actions', bg: bgL1Peers, who: 'pip', teacher: 'Extra time: Stand up! Do the action and say it with Pip.',
      rounds: [
        { line: 'Wave and say: Hello!', emoji: '\u{1F44B}' },
        { line: 'Point to you and say: My name is …', emoji: '\u{1F449}' },
        { line: 'Shake hands and say: Hi!', emoji: '\u{1F91D}' },
        { line: 'Wave goodbye and say: Bye!', emoji: '\u{1F64B}' },
      ],
    },
  },
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
  /* 21 Closing routine goodbye  22 Celebration */
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
// -v2 = regenerated 2026-10-09 in Canva (the wave sprite as reference): solid fills, whole bowl, no ground shadow.
const feelSpr = (name: string) => `${W}/sprites/${name}-v2.png`;
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
  /* 1 Warm-up song (TPR) */
  {
    // Warm-up: the unit's Hello Song (scripts/songs.json "wt-hello"). Wave on
    // "hello", point to yourself on "say your name". (First lesson: no Remember? page.)
    id: 'wt2-hello-song', kind: 'song', bg: bgL1Class, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Wave and sing! Point to you when we say “name”.',
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
  /* 2 Greeting + the new question */
  {
    id: 'wt2-howareyou', kind: 'meet', focus: ['How are you'], bg: bgCircleW, who: 'marigold',
    teacher: 'Tap Miss Marigold to hear the new question!',
    line: 'How are you today? I am fine, thank you!', repeat: 'How are you?',
  },
  /* 3 Story opener */
  {
    id: 'wt2-story-open', kind: 'cinematic', bg: bgCircleW, title: 'Pip Is Tired', subtitle: 'How is Pip today?', narrator: 'marigold',
    script: [
      { who: 'pip', line: 'Yawn! I am so tired today.' },
      { who: 'mia', line: 'Oh, Pip! How are you?' },
      { who: 'marigold', line: 'Today we learn to say how we feel.' },
    ],
    cta: '\u{1F60A} LET’S GO!',
  },
  /* 4 Vocabulary reveal: five feelings on one page */
  {
    // Second introduction of the five feelings (owner 2026-10-09): all friends together, one arrow at a time.
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
  /* 5 Echo mimic */
  {
    id: 'wt2-echo-howareyou', kind: 'echo', bg: bgCircleW, who: 'pip', textSide: 'top',
    teacher: 'Listen and say it with Pip!', word: 'How are you?',
  },
  /* 6 Reveal game: Name That Feeling */
  {
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
  /* 7 Drag & match */
  {
    // Owner 2026-10-09 ("also activity like this"): drag each word onto the friend — right after the arrow page,
    // same hotspot coordinates as wt2-vocab-feelings.
    id: 'wt2-drag-feelings', kind: 'drag-match', bg: bgFeelingsW, teacher: 'Listen, then drag each word onto the friend who feels that way!',
    items: [
      { label: 'Happy', color: '#FE6A2F', who: 'pip', targetLeft: '29.8%', targetTop: '54.5%' },
      { label: 'Tired', color: '#C97A2F', who: 'leo', targetLeft: '40.4%', targetTop: '55.6%' },
      { label: 'Sad', color: '#B85CD1', who: 'mia', targetLeft: '51.1%', targetTop: '57.9%' },
      { label: 'Angry', color: '#E76FA5', who: 'bella', targetLeft: '61.8%', targetTop: '56.8%' },
      { label: 'Hungry', color: '#4FA9E0', who: 'willow', targetLeft: '72.5%', targetTop: '57.9%' },
    ],
  },
  /* 8 Implicit grammar model: boy = he, girl = she, boy + girl = they (owner 2026-10-09), on one page */
  {
    id: 'wt2-he-she-they', kind: 'meet', look: 'word', word: 'They', wordNote: '\u{1F466} he + \u{1F467} she =', focus: ['He', 'She'], bg: bgHeSheTogetherW, who: 'pip',
    teacher: 'Point to Pip (a boy: HE), to Mia (a girl: SHE), then to both (THEY). Listen, then repeat.',
    line: 'He is happy. She is happy. They are happy!', repeat: 'They are happy!',
  },
  /* 9 Spinner -> say a sentence */
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
  /* 10 Teacher asks, child answers */
  {
    id: 'wt2-answer', kind: 'join-stage', bg: bgCircleW, teacher: 'Miss Marigold asks. The student answers with a whole sentence.', cast: ['marigold', 'pip'],
    turns: [
      { who: 'marigold', line: 'How are you today?' },
      { who: 'student', line: 'I am … !' },
      { who: 'pip', line: 'How is Leo?' },
      { who: 'student', line: 'He is tired!' },
    ],
  },
  /* 11 Role swap: the child asks (signature game: Feelings Survey) */
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
  /* 12 Game break: memory */
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
  /* 13 Personal production */
  {
    id: 'wt2-my-feeling', kind: 'choice', bg: bgCircleW, who: 'marigold', teacher: 'Any answer is right! The student taps how they really feel and says it: "I am happy!"',
    prompt: 'How are YOU today? Tap and say it!',
    options: [
      { label: 'I am happy', emoji: '\u{1F60A}', correct: true },
      { label: 'I am tired', emoji: '\u{1F62A}', correct: true },
      { label: 'I am hungry', emoji: '\u{1F924}', correct: true },
      { label: 'I am fine', emoji: '\u{1F642}', correct: true },
    ],
  },
  /* 14 Phonics micro-moment */
  {
    // Universal phonics slide (blueprint slot 14): Blend It! — say each sound, blend, find the picture.
    id: 'wt2-blend', kind: 'sound-blend', bg: bgL1Reading,
    teacher: 'Tap each car and say the sound with the student (/p/ /i/ /g/), press Blend!, then find the picture.',
    rounds: [
      { word: 'pig', img: '/lep1/items/item-pig.png' },
      { word: 'nut', img: '/lep1/items/item-nut.png' },
      { word: 'ten', img: '/lep1/items/item-ten.png' },
      { word: 'fan', img: '/lep1/items/item-fan.png' },
    ],
  },
  /* 15 Quick-fire recall */
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
  /* 16 Story payoff */
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
  /* 17 Sing-back: the child leads */
  {
    // Warm-up: the unit's Hello Song (scripts/songs.json "wt-hello"). Wave on
    // "hello", point to yourself on "say your name". (First lesson: no Remember? page.)
    id: 'wt2-sing-back', kind: 'song', bg: bgL1Class, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Sing-back: now the student leads the song and the teacher answers. Wave on hello, point on name!',
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
  /* 18 Reflection */
  {
    id: 'wt2-favourite', kind: 'choice', bg: bgCircleW, who: 'pip', teacher: 'Any answer is right! The student picks a favourite game and says why it was fun.',
    prompt: 'Which game was your favourite?',
    options: [
      { label: 'Survey', emoji: '\u{1F4CB}', correct: true },
      { label: 'Spinner', emoji: '\u{1F3A1}', correct: true },
      { label: 'Memory', emoji: '\u{1F9E0}', correct: true },
      { label: 'Story', emoji: '\u{1F4D6}', correct: true },
    ],
  },
  /* 19 Sticker  20 Home Mission */
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
  /* Extra time (blueprint §3b): only if there is time left */
  {
    // Feelings Freeze (Brain Break, game list): dance, then freeze with the face Pip calls — movement for a 6-9 year
    // old after ~15 minutes of sitting, and one more listen-and-show round of all five feelings.
    id: 'wt2-feelings-freeze', kind: 'prea1', teacher: 'Extra time: Brain break! Dance, then FREEZE with the face Pip says.',
    scene: {
      id: 'wt2-feelings-freeze', kind: 'tpr-actions', mode: 'break', bg: '/lep1/scenes/bg-u3l4-room-empty-wide.png', who: 'pip',
      teacher: 'Extra time: Brain break! Dance, then FREEZE with the face Pip says.',
      rounds: [
        { line: 'Dance, dance! Freeze! Show me happy!', emoji: '\u{1F60A}' },
        { line: 'Dance, dance! Freeze! Show me tired!', emoji: '\u{1F62A}' },
        { line: 'Dance, dance! Freeze! Show me angry!', emoji: '\u{1F620}' },
        { line: 'Dance, dance! Freeze! Show me sad!', emoji: '\u{1F622}' },
        { line: 'Dance, dance! Freeze! Show me hungry!', emoji: '\u{1F924}' },
      ],
    },
  },
  {
    // Boys (Pip, Leo) -> He; girls (Mia, Bella, Willow) -> She; two friends together -> They.
    id: 'wt2-pronoun-sort', kind: 'pronoun-sort', bg: bgFeelingsW, teacher: 'Extra time: Drag each friend to He, She, or They!',
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
    id: 'wt2-feelings-claw', kind: 'prea1', teacher: 'Extra time: Feelings Grabber! Listen to Pip, move the claw to the right friend and press the red button. Then say: He is … / She is …',
    scene: {
      id: 'wt2-feelings-claw', kind: 'claw-machine', bg: '/lep1/scenes/bg-u3l6-claw-machine-wide.png', who: 'pip', clawImg: '/lep1/items/item-claw.png',
      teacher: 'Extra time: Feelings Grabber! Listen to Pip, move the claw to the right friend and press the red button. Then say: He is … / She is …',
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
  /* 21 Closing routine goodbye  22 Celebration */
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
 * A1 Unit 1, Lesson 3: "Listen to the Greetings Song" (curriculum slot; rebuilt 2026-10-10)
 *
 * Curriculum (curriculum_lessons, A1 U1 L3): the unit's LISTENING lesson. No new words: the greetings of
 * Lessons 1-2 come back inside a song, and the child listens for detail (who sings which line), builds and
 * answers the lines, then leads the song. Follows the 22-slide lesson blueprint slot by slot (see the slot
 * comments); extras at the end are optional. Phonics: a tongue twister reviewing s a t p i n.
 * * ========================================================================= */

export const LESSON_3_TITLE = 'Listen to the Greetings Song';
export const LESSON_3_OBJECTIVE = 'Listen to the Greetings Song and say who sings each line (hello, what\'s your name?, how are you?, goodbye), answer and ask its questions, and sing it yourself.';



export const LESSON_3_SCENES: Scene[] = classroomLook([
  { id: 'wt3-title', kind: 'title-card', bg: bgL1Class, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 3', title: 'Listen to the Greetings Song', subtitle: 'Listen, find who sings it, and sing it yourself', cta: '\u{1F3B5} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 2 · How Are You? — sticker pictures, so the shadow look.
    id: 'wt3-recall-warmup', kind: 'recall-warmup', bg: bgL1Circle, who: 'pip', mode: 'shadow',
    fromLabel: 'Lesson 2 · How Are You?',
    teacher: 'Warm-up from last lesson: Pip says a feeling, the student finds its shadow and says "I am happy!".',
    items: [
      { word: 'happy', say: 'Find happy!', img: feelSpr('pip-happy') },
      { word: 'tired', say: 'Find tired!', img: feelSpr('leo-tired') },
      { word: 'sad', say: 'Find sad!', img: feelSpr('mia-sad') },
      { word: 'hungry', say: 'Find hungry!', img: feelSpr('willow-hungry') },
    ],
  },
  /* 1 Warm-up song (TPR) */
  {
    // Warm-up: the unit's Hello Song (scripts/songs.json "wt-hello"). Wave on
    // "hello", point to yourself on "say your name". (First lesson: no Remember? page.)
    id: 'wt3-hello-song', kind: 'song', bg: bgL1Class, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Wave and sing! Point to you when we say “name”.',
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
  { id: 'wt3-pip-greets', kind: 'meet', focus: ['songs'], bg: bgL1Peers, who: 'pip', cardSide: 'left', teacher: 'Tap Pip. Answer: "I am happy! Yes, I like songs!"', line: 'Hello! How are you? Do you like songs?', repeat: 'I like songs!' },
  /* 3 Story opener */
  {
    id: 'wt3-story-open', kind: 'cinematic', bg: bgL1Class, title: 'The School Concert', subtitle: 'Everybody sings the Greetings Song!', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Today is our school concert!' },
      { who: 'pip', line: 'We sing the Greetings Song. Every friend sings one line!' },
      { who: 'marigold', line: 'Listen carefully. Who sings each line?' },
    ],
    cta: '\u{1F3A4} LISTEN!',
  },
  /* 4 Vocabulary reveal: each friend's line of the song, one arrow at a time */
  {
    id: 'wt3-song-lines', kind: 'vocab-spot', bg: bgL1Class, teacher: 'Tap each arrow. Listen to the friend’s line, then say it.',
    items: [
      { label: 'Hello!', sentence: 'Hello, hello, hello to you!', emoji: '\u{1F44B}', left: '50%', top: '22%', color: '#8ECAE6', who: 'marigold' },
      { label: 'Hi!', sentence: 'Hi, hi, hi! And hi to you!', emoji: '\u{1F64B}', left: '23%', top: '62%', color: '#FE6A2F', who: 'pip' },
      { label: 'What’s your name?', sentence: 'What’s your name? What’s your name?', emoji: '\u{2753}', left: '34%', top: '64%', color: '#B85CD1', who: 'mia' },
      { label: 'How are you?', sentence: 'How are you? How are you?', emoji: '\u{1F60A}', left: '78%', top: '62%', color: '#C97A2F', who: 'leo' },
      { label: 'Goodbye!', sentence: 'Goodbye, goodbye, my new friend!', emoji: '\u{1F44B}', left: '46%', top: '66%', color: '#E76FA5', who: 'bella' },
      { label: 'See you!', sentence: 'See you again!', emoji: '\u{1F31F}', left: '63%', top: '64%', color: '#4FA9E0', who: 'willow' },
    ],
  },
  /* 5 Echo mimic */
  { id: 'wt3-echo', kind: 'echo', bg: bgL1Peers, who: 'pip', textSide: 'top', teacher: 'Listen and sing it with Pip!', word: 'Hello to you!' },
  /* 6 Reveal game: who sings it? (listening for detail) */
  {
    id: 'wt3-who-sings', kind: 'listen-tap', bg: bgL1Class, teacher: 'Listen to the line. Who sings it? Tap the friend!',
    targets: [
      { label: 'Pip', left: '22%', top: '72%', color: '#FE6A2F' },
      { label: 'Mia', left: '33%', top: '74%', color: '#B85CD1' },
      { label: 'Bella', left: '45%', top: '76%', color: '#E76FA5' },
      { label: 'Willow', left: '62%', top: '74%', color: '#4FA9E0' },
      { label: 'Leo', left: '78%', top: '72%', color: '#C97A2F' },
    ],
    rounds: [
      { prompt: 'What’s your name? What’s your name?', answerLabel: 'Mia', who: 'mia' },
      { prompt: 'How are you? How are you?', answerLabel: 'Leo', who: 'leo' },
      { prompt: 'Goodbye, goodbye, my new friend!', answerLabel: 'Bella', who: 'bella' },
      { prompt: 'Hi, hi, hi! And hi to you!', answerLabel: 'Pip', who: 'pip' },
    ],
  },
  /* 7 Drag & match: put the song line together */
  {
    id: 'wt3-build-lines', kind: 'sentence-build', bg: bgL1Reading, teacher: 'Drag the words into order to make the song line. Then sing it!',
    rounds: [
      { words: ['Hello', 'to', 'you!'], emoji: '\u{1F44B}' },
      { words: ['What’s', 'your', 'name?'], emoji: '\u{2753}' },
      { words: ['How', 'are', 'you?'], emoji: '\u{1F60A}' },
      { words: ['See', 'you', 'again!'], emoji: '\u{1F31F}' },
    ],
  },
  /* 8 Implicit grammar model: the song as a conversation */
  {
    id: 'wt3-song-talk', kind: 'roleplay', bg: bgL1Peers, teacher: 'The song is a real conversation! Listen to Pip and Leo, then say each line after them.', cast: ['pip', 'leo'],
    script: [
      { who: 'pip', line: 'Hello, Leo! How are you?', repeat: true },
      { who: 'leo', line: 'I am happy! What’s your name?', repeat: true },
      { who: 'pip', line: 'My name is Pip. Goodbye, Leo!', repeat: true },
      { who: 'leo', line: 'Bye, Pip! See you again!', repeat: true },
    ],
  },
  /* 9 Spinner -> sing a line to the friend */
  {
    id: 'wt3-spin-sing', kind: 'spin-wheel', bg: bgL1Class, title: 'Spin and sing!',
    teacher: 'Have the student spin and sing that friend’s line of the song. If you prefer, do the activity without the spinner.',
    items: [
      { label: 'Hi, hi, hi! And hi to you!', left: '23%', top: '50%' },
      { label: 'What’s your name?', left: '34%', top: '50%' },
      { label: 'Goodbye, my new friend!', left: '46%', top: '52%' },
      { label: 'See you again!', left: '63%', top: '52%' },
      { label: 'How are you?', left: '78%', top: '50%' },
      { label: 'Hello, hello to you!', left: '50%', top: '14%' },
    ],
    wheelAt: { left: '84%', top: '24%' },
  },
  /* 10 Teacher asks, child answers (in song lines) */
  {
    id: 'wt3-answer', kind: 'join-stage', bg: bgL1Circle, teacher: 'Pip sings a line; the student answers in a whole sentence.', cast: ['pip', 'marigold'],
    turns: [
      { who: 'pip', line: 'Hello, hello! How are you?' },
      { who: 'student', line: 'I am … ! Thank you!' },
      { who: 'marigold', line: 'What’s your name? What’s your name?' },
      { who: 'student', line: 'My name is … !' },
    ],
  },
  /* 11 Role swap: the child asks */
  {
    id: 'wt3-ask', kind: 'join-stage', bg: bgL1Peers, teacher: 'Now the student sings the questions to Pip and Leo.', cast: ['pip', 'leo'],
    turns: [
      { who: 'student', line: 'Hello, Pip! How are you?' },
      { who: 'pip', line: 'I am happy!' },
      { who: 'student', line: 'What’s your name?' },
      { who: 'leo', line: 'My name is Leo!' },
      { who: 'student', line: 'Goodbye! See you again!' },
    ],
  },
  /* 12 Game break: memory (line <-> picture) */
  {
    id: 'wt3-memory', kind: 'memory', bg: bgL1Circle, teacher: 'Memory! Find the pairs and sing each line when you see it.',
    pairs: [
      { id: 'hello', label: 'Hello to you!', emoji: '\u{1F44B}' },
      { id: 'name', label: 'What’s your name?', emoji: '\u{1F3F7}\u{FE0F}' },
      { id: 'how', label: 'How are you?', emoji: '\u{1F60A}' },
      { id: 'again', label: 'See you again!', emoji: '\u{1F31F}' },
    ],
  },
  /* 13 Personal production */
  {
    id: 'wt3-my-line', kind: 'choice', bg: bgL1Circle, who: 'pip', teacher: 'Any answer is right! The student picks a line and sings it to the teacher, with their own name.',
    prompt: 'Which line will YOU sing to your teacher?',
    options: [
      { label: 'Hello to you!', emoji: '\u{1F44B}', correct: true },
      { label: 'How are you?', emoji: '\u{1F60A}', correct: true },
      { label: 'My name is …', emoji: '\u{1F3F7}\u{FE0F}', correct: true },
      { label: 'See you again!', emoji: '\u{1F31F}', correct: true },
    ],
  },
  /* 14 Phonics micro-moment (review s a t p i n) */
  {
    // Universal phonics slide (blueprint slot 14): Blend It! — say each sound, blend, find the picture.
    id: 'wt3-blend', kind: 'sound-blend', bg: bgL1Reading,
    teacher: 'Tap each car and say the sound with the student (/s/ /u/ /n/), press Blend!, then find the picture.',
    rounds: [
      { word: 'sun', img: '/lep1/items/item-sun.png' },
      { word: 'hen', img: '/lep1/items/item-hen.png' },
      { word: 'pig', img: '/lep1/items/item-pig.png' },
      { word: 'cat', img: '/lep1/items/item-cat.png' },
    ],
  },
  /* 15 Quick-fire recall */
  {
    id: 'wt3-quick-fire', kind: 'prea1', teacher: 'Quick fire! Say the line before the ring runs out.',
    scene: {
      id: 'wt3-quick-fire', kind: 'rapid-recall', bg: bgL1Class, who: 'pip', seconds: 4,
      teacher: 'Quick fire! Say the line before the ring runs out.',
      cards: [
        { img: feelSpr('pip-happy'), word: 'Hello!', say: 'Hello to you!' },
        { img: spr('mia'), word: 'What’s your name?' },
        { img: feelSpr('leo-tired'), word: 'How are you?' },
        { img: spr('bella'), word: 'Goodbye!', say: 'Goodbye, my new friend!' },
      ],
    },
  },
  /* 16 Story payoff */
  {
    id: 'wt3-story-end', kind: 'cinematic', bg: bgL1Class, title: 'Bravo!', subtitle: 'The concert was great', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Bravo, everyone! What a great song!' },
      { who: 'pip', line: 'We sang hello, how are you and goodbye!' },
      { who: 'marigold', line: 'Now YOU lead the song!' },
    ],
    cta: '\u{1F3A4} MY TURN!',
  },
  /* 17 Sing-back: the child leads */
  {
    // Warm-up: the unit's Hello Song (scripts/songs.json "wt-hello"). Wave on
    // "hello", point to yourself on "say your name". (First lesson: no Remember? page.)
    id: 'wt3-sing-back', kind: 'song', bg: bgL1Class, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Sing-back: now the student leads the song and the teacher answers. Wave on hello, point on name!',
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
  /* 18 Reflection */
  {
    id: 'wt3-favourite', kind: 'choice', bg: bgL1Circle, who: 'pip', teacher: 'Any answer is right! The student picks a favourite line and sings it once more.',
    prompt: 'Which line of the song is your favourite?',
    options: [
      { label: 'Hello to you!', emoji: '\u{1F44B}', correct: true },
      { label: 'What’s your name?', emoji: '\u{2753}', correct: true },
      { label: 'How are you?', emoji: '\u{1F60A}', correct: true },
      { label: 'See you again!', emoji: '\u{1F31F}', correct: true },
    ],
  },
  /* 19 Sticker  20 Home Mission */
  {
    id: 'wt3-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the singing sticker in their Sticker Book.',
    scene: {
      id: 'wt3-sticker', kind: 'sticker-reward', bg: bgL1Class, who: 'pip', teacher: 'Sticker time! The student opens the pack and puts the singing sticker in their Sticker Book.',
      line: 'You can listen and sing the Greetings Song! Here is your sticker.',
      sticker: { img: feelSpr('pip-happy'), label: 'Hello to you!' },
    },
  },
  {
    id: 'wt3-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt3-home-mission', kind: 'home-mission', bg: bgL1Class, who: 'pip',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Today your child listened to and sang the Greetings Song (hello, what’s your name?, how are you?, goodbye). Let them sing it for you and answer their questions.',
      steps: [
        { emoji: '\u{1F3B5}', say: 'Sing the Greetings Song for your family.' },
        { emoji: '\u{2753}', say: 'Ask: How are you? What’s your name?' },
        { emoji: '\u{1F44B}', say: 'Say: See you again!' },
      ],
    },
  },
  /* Extra time (blueprint §3b): only if there is time left */
  { id: 'wt3-twister', kind: 'tongue-twister', bg: bgL1Reading, who: 'pip', focus: 'p|i|n|s|t', teacher: 'Extra time: listen to Pip’s tongue twister. Say it slow, then faster!', line: 'Pip sits. Pip taps. Pip spins a pin!' },
  {
    id: 'wt3-true-false', kind: 'true-false', bg: bgL1Class, teacher: 'Extra time: listen. Is it true or false? Tap the right answer.',
    rounds: [
      { who: 'mia', statement: 'Mia sings: What’s your name?', isTrue: true },
      { who: 'leo', statement: 'Leo sings: Goodbye, my new friend!', isTrue: false },
      { who: 'willow', statement: 'Willow sings: See you again!', isTrue: true },
    ],
  },
  {
    id: 'wt3-dance-break', kind: 'prea1', teacher: 'Extra time: brain break! Dance and freeze with Pip.',
    scene: {
      id: 'wt3-dance-break', kind: 'tpr-actions', mode: 'break', bg: '/lep1/scenes/bg-u3l4-room-empty-wide.png', who: 'pip',
      teacher: 'Extra time: brain break! Dance and freeze with Pip.',
      rounds: [
        { line: 'Dance and wave hello!', emoji: '\u{1F44B}' },
        { line: 'Clap to the song!', emoji: '\u{1F44F}' },
        { line: 'Jump and sing: hi, hi, hi!', emoji: '\u{1F998}' },
        { line: 'Freeze!', emoji: '\u{1F9CA}' },
      ],
    },
  },
  /* 21 Closing routine goodbye  22 Celebration */
  {
    id: 'wt3-goodbye-song', kind: 'song', bg: bgExpressGoodbyeW, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
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
  { id: 'wt3-finale', kind: 'finale', bg: bgL1Class, who: 'pip', line: 'You listened to the Greetings Song, found who sang each line, and sang it yourself! See you again!' },
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

export const LESSON_4_TITLE = 'Meet a Friend: Speak!';
export const LESSON_4_OBJECTIVE = 'Have a short greeting conversation: say hello, ask and answer "What\'s your name?" and "How are you?" (I am fine / happy / sad), and say goodbye.';

const bgPlay = `${W}/scenes/bg-playground-break-wide.png`;

export const LESSON_4_SCENES: Scene[] = classroomLook([
  { id: 'wt4-title', kind: 'title-card', bg: bgPlay, level: 'A1', unit: 'Unit 1', lessonLabel: 'Lesson 4', title: 'Meet a Friend: Speak!', subtitle: 'Say hello and have a real chat', cta: '\u{1F5E3}\u{FE0F} LET’S TALK!' },
  {
    // Remember? (owner, 2026-10-07): a quick warm-up of Lesson 3 · Listen to the Greetings Song.
    id: 'wt4-recall-warmup', kind: 'recall-warmup', bg: bgL1Circle, who: 'pip', mode: 'click',
    fromLabel: 'Lesson 3 · Listen to the Greetings Song',
    teacher: 'Warm-up from last lesson: Pip sings a line of the Greetings Song, the student finds who sang it and sings it too.',
    items: [
      { word: 'Mia', say: 'Who sings: What’s your name?', img: spr('mia') },
      { word: 'Leo', say: 'Who sings: How are you?', img: spr('leo') },
      { word: 'Bella', say: 'Who sings: Goodbye, my new friend?', img: spr('bella') },
    ],
  },
  /* 1 Warm-up song (TPR) */
  {
    id: 'wt4-hello-song', kind: 'song', bg: bgPlay, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Wave and sing! Point to you when we say “name”.',
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
  { id: 'wt4-pip-greets', kind: 'meet', focus: ['How are you'], bg: bgL1Peers, who: 'pip', cardSide: 'left', teacher: 'Tap Pip. Answer him: "I am fine, thank you!"', line: 'Hi! It is break time! How are you?', repeat: 'I am fine, thank you!' },
  /* 3 Story opener */
  {
    id: 'wt4-story-open', kind: 'cinematic', bg: bgPlay, title: 'Break Time!', subtitle: 'Pip talks to his friends on the playground', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'It is break time at Welcome Town School!' },
      { who: 'pip', line: 'Look! Mia is on the slide and Leo is on the swing.' },
      { who: 'pip', line: 'I want to talk to my friends!' },
      { who: 'marigold', line: 'Listen. What does Pip say?' },
    ],
    cta: '\u{1F442} LISTEN!',
  },
  /* 4 Vocabulary reveal: the chat lines on the playground, one arrow at a time */
  {
    id: 'wt4-chat-lines', kind: 'vocab-spot', bg: bgPlay, teacher: 'Tap each arrow. Listen to the line, then say it.',
    items: [
      { label: 'Hello!', sentence: 'Hello, Mia! Hello, Leo!', emoji: '\u{1F44B}', left: '43%', top: '66%', color: '#FE6A2F', who: 'pip' },
      { label: 'How are you?', sentence: 'How are you, Mia?', emoji: '\u{2753}', left: '53%', top: '50%', color: '#FE6A2F', who: 'pip' },
      { label: 'I am happy.', sentence: 'I am happy, thank you!', emoji: '\u{1F60A}', left: '13%', top: '34%', color: '#B85CD1', who: 'mia' },
      { label: 'I am fine.', sentence: 'I am fine, thank you!', emoji: '\u{1F44D}', left: '85%', top: '48%', color: '#C97A2F', who: 'leo' },
      { label: 'What’s your name?', sentence: 'What’s your name?', emoji: '\u{1F3F7}\u{FE0F}', left: '84%', top: '72%', color: '#C97A2F', who: 'leo' },
      { label: 'Goodbye!', sentence: 'Goodbye! See you!', emoji: '\u{1F44B}', left: '64%', top: '68%', color: '#FE6A2F', who: 'pip' },
    ],
  },
  /* 5 Echo mimic */
  { id: 'wt4-echo', kind: 'echo', bg: bgL1Peers, who: 'leo', textSide: 'top', teacher: 'Listen to Leo, then say it with him!', word: 'I am fine, thank you!' },
  /* 6 Reveal game: who says it? */
  {
    id: 'wt4-who-says', kind: 'prea1', teacher: 'Listen! Who says it? Tap the friend when they pop up.',
    scene: {
      id: 'wt4-who-says', kind: 'friend-pop', bg: '/lep1/scenes/bg-name-carnival-sky.jpg', teacher: 'Listen! Who says it? Tap the friend when they pop up.', cast: ['pip', 'mia', 'leo', 'bella'],
      rounds: [
        { target: 'leo', prompt: 'Who says: I am fine?', emotion: 'neutral', sayLine: 'I am fine, thank you!' },
        { target: 'mia', prompt: 'Who says: I am happy?', emotion: 'happy', sayLine: 'I am happy!' },
        { target: 'bella', prompt: 'Who says: I am sad?', emotion: 'sad', sayLine: 'I am sad.' },
        { target: 'pip', prompt: 'Who says: Hello, my name is Pip?', emotion: 'happy', sayLine: 'Hello! My name is Pip.' },
      ],
    },
  },
  /* 7 Drag & match: name tags on the friends */
  {
    id: 'wt4-name-tags', kind: 'drag-match', bg: bgFeelingsW, teacher: 'Read the name tag and drag it onto the friend. Then say it: "My name is Leo!"',
    items: [
      { label: 'My name is Pip.', color: '#FE6A2F', who: 'pip', targetLeft: '29.8%', targetTop: '54.5%' },
      { label: 'My name is Leo.', color: '#C97A2F', who: 'leo', targetLeft: '40.4%', targetTop: '55.6%' },
      { label: 'My name is Mia.', color: '#B85CD1', who: 'mia', targetLeft: '51.1%', targetTop: '57.9%' },
      { label: 'My name is Bella.', color: '#E76FA5', who: 'bella', targetLeft: '61.8%', targetTop: '56.8%' },
      { label: 'My name is Willow.', color: '#4FA9E0', who: 'willow', targetLeft: '72.5%', targetTop: '57.9%' },
    ],
  },
  /* 8 Implicit grammar model: the whole conversation */
  {
    id: 'wt4-model-chat', kind: 'roleplay', bg: bgL1Peers, teacher: 'A whole conversation! Listen to Pip and Leo, then say each line after them.', cast: ['pip', 'leo'],
    script: [
      { who: 'pip', line: 'Hello! What’s your name?', repeat: true },
      { who: 'leo', line: 'Hi! My name is Leo.', repeat: true },
      { who: 'pip', line: 'How are you, Leo?', repeat: true },
      { who: 'leo', line: 'I am fine, thank you!', repeat: true },
      { who: 'pip', line: 'Goodbye, Leo!', repeat: true },
      { who: 'leo', line: 'Goodbye! See you!', repeat: true },
    ],
  },
  /* 9 Spinner -> greet that friend */
  {
    id: 'wt4-spin-greet', kind: 'spin-wheel', bg: bgPlay, title: 'Spin and say hello!',
    teacher: 'Have the student spin, then greet that friend and ask: "Hello, Mia! How are you?" If you prefer, do the activity without the spinner.',
    items: [
      { label: 'Hello, Mia! How are you?', left: '13%', top: '22%' },
      { label: 'Hi, Pip! How are you?', left: '53%', top: '40%' },
      { label: 'Hello, Leo! How are you?', left: '86%', top: '30%' },
    ],
    wheelAt: { left: '36%', top: '30%' },
  },
  /* 10 Teacher asks, child answers */
  {
    id: 'wt4-answer', kind: 'join-stage', bg: bgL1Circle, teacher: 'Miss Marigold asks; the student answers in a whole sentence.', cast: ['marigold', 'pip'],
    turns: [
      { who: 'marigold', line: 'Hello! What’s your name?' },
      { who: 'student', line: 'My name is … !' },
      { who: 'marigold', line: 'How are you today?' },
      { who: 'student', line: 'I am … , thank you!' },
      { who: 'pip', line: 'Goodbye! See you!' },
      { who: 'student', line: 'Goodbye!' },
    ],
  },
  /* 11 Role swap: the child asks (grab the mic) */
  {
    id: 'wt4-ask', kind: 'prea1', teacher: 'Grab the mic! The student asks each friend: How are you? Then listens to the answer.',
    scene: {
      id: 'wt4-ask', kind: 'voice-stage', bg: '/lep1/scenes/bg-name-mic-stage.jpg', teacher: 'Grab the mic! The student asks each friend: How are you? Then listens to the answer.', question: 'How are you?',
      rounds: [
        { who: 'mia', cue: 'Ask Mia!', answer: 'I am happy, thank you!' },
        { who: 'leo', cue: 'Ask Leo!', answer: 'I am fine, thank you!' },
        { who: 'bella', cue: 'Ask Bella!', answer: 'I am sad.' },
      ],
    },
  },
  /* 12 Game break: Chat Chain — the whole conversation with a new friend */
  {
    id: 'wt4-chat-chain', kind: 'chat-chain', bg: bgL1Circle, partner: 'bella', title: 'Chat with Bella',
    intro: 'Hi! Let’s talk!',
    teacher: 'Chat Chain: Bella talks, the student picks the reply that fits and SAYS it out loud, then taps “I said it”. At the end, play the whole chat.',
    turns: [
      { who: 'bella', line: 'Hello!' },
      { who: 'student', line: 'Hi! What’s your name?', wrong: ['I am sad.', 'Goodbye!'] },
      { who: 'bella', line: 'My name is Bella. What’s your name?' },
      { who: 'student', line: 'My name is …', wrong: ['How are you?', 'See you!'] },
      { who: 'bella', line: 'Nice to meet you! How are you?' },
      { who: 'student', line: 'I am fine, thank you!', wrong: ['My name is Bella.', 'Hello!'] },
      { who: 'bella', line: 'Oh, the bell! Goodbye!' },
      { who: 'student', line: 'Goodbye, Bella! See you!', wrong: ['I am happy.', 'What’s your name?'] },
    ],
  },
  /* 13 Personal production */
  {
    id: 'wt4-how-are-you', kind: 'choice', bg: bgL1Circle, who: 'pip', teacher: 'Any answer is right! The student picks how they feel today and says it: "I am fine, thank you!"',
    prompt: 'How are YOU today?',
    options: [
      { label: 'I am fine.', emoji: '\u{1F44D}', correct: true },
      { label: 'I am happy.', emoji: '\u{1F60A}', correct: true },
      { label: 'I am sad.', emoji: '\u{1F622}', correct: true },
      { label: 'I am tired.', emoji: '\u{1F634}', correct: true },
    ],
  },
  /* 14 Phonics micro-moment: Blend It! */
  {
    id: 'wt4-blend', kind: 'sound-blend', bg: bgL1Reading,
    teacher: 'Tap each car and say the sound with the student (/d/ /o/ /g/), press Blend!, then find the picture.',
    rounds: [
      { word: 'dog', img: '/lep1/items/item-dog.png' },
      { word: 'bed', img: '/lep1/items/item-bed.png' },
      { word: 'bag', img: '/lep1/items/item-bag.png' },
      { word: 'fan', img: '/lep1/items/item-fan.png' },
    ],
  },
  /* 15 Quick-fire recall */
  {
    id: 'wt4-quick-fire', kind: 'prea1', teacher: 'Quick fire! Say the answer before the ring runs out.',
    scene: {
      id: 'wt4-quick-fire', kind: 'rapid-recall', bg: bgPlay, who: 'pip', seconds: 4,
      teacher: 'Quick fire! Say the answer before the ring runs out.',
      cards: [
        { img: feelSpr('pip-happy'), word: 'I am happy.' },
        { img: feelSpr('mia-sad'), word: 'I am sad.' },
        { img: spr('leo'), word: 'My name is Leo.' },
        { img: spr('bella'), word: 'Goodbye!', say: 'Goodbye! See you!' },
      ],
    },
  },
  /* 16 Story payoff */
  {
    id: 'wt4-story-end', kind: 'cinematic', bg: bgPlay, title: 'Ding, ding!', subtitle: 'Break time is over', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Ding, ding! Break time is over!' },
      { who: 'pip', line: 'I talked to Mia, Leo and Bella. Now Bella is my friend!' },
      { who: 'marigold', line: 'Well done! You can have a real chat, too!' },
    ],
    cta: '\u{1F3A4} MY TURN!',
  },
  /* 17 Sing-back: the child leads */
  {
    id: 'wt4-sing-back', kind: 'song', bg: bgPlay, title: '\u{1F3B5} The Hello Song \u{1F3B5}', teacher: 'Sing-back: now the student leads the song and the teacher answers. Wave on hello, point on name!',
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
  /* 18 Reflection */
  {
    id: 'wt4-favourite', kind: 'choice', bg: bgPlay, who: 'pip', teacher: 'Any answer is right! The student picks a friend and says hello to them once more.',
    prompt: 'Who do you want to talk to next?',
    options: [
      { label: 'Mia', emoji: '\u{1F42D}', correct: true },
      { label: 'Leo', emoji: '\u{1F981}', correct: true },
      { label: 'Bella', emoji: '\u{1F430}', correct: true },
      { label: 'Willow', emoji: '\u{1F426}', correct: true },
    ],
  },
  /* 19 Sticker  20 Home Mission */
  {
    id: 'wt4-sticker', kind: 'prea1', teacher: 'Sticker time! The student opens the pack and puts the chat sticker in their Sticker Book.',
    scene: {
      id: 'wt4-sticker', kind: 'sticker-reward', bg: bgPlay, who: 'pip', teacher: 'Sticker time! The student opens the pack and puts the chat sticker in their Sticker Book.',
      line: 'You can have a real chat with a friend! Here is your sticker.',
      sticker: { img: spr('bella'), label: 'Hello, friend!' },
    },
  },
  {
    id: 'wt4-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'wt4-home-mission', kind: 'home-mission', bg: bgPlay, who: 'pip',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Today your child practised a short conversation: hello, what’s your name?, how are you? (I am fine / happy / sad) and goodbye. Have the chat with them.',
      steps: [
        { emoji: '\u{1F44B}', say: 'Say hello to someone in your family.' },
        { emoji: '\u{2753}', say: 'Ask: How are you?' },
        { emoji: '\u{1F44D}', say: 'Answer: I am fine, thank you!' },
      ],
    },
  },
  /* Extra time (blueprint §3b): only if there is time left */
  {
    id: 'wt4-memory', kind: 'memory', bg: bgL1Circle, teacher: 'Extra time: Memory! Find the question and its answer. Say both when you find a pair.',
    pairs: [
      { id: 'hello', label: 'Hello!', emoji: '\u{1F44B}' },
      { id: 'name', label: 'My name is …', emoji: '\u{1F3F7}\u{FE0F}' },
      { id: 'fine', label: 'I am fine.', emoji: '\u{1F44D}' },
      { id: 'bye', label: 'Goodbye!', emoji: '\u{1F31F}' },
    ],
  },
  {
    id: 'wt4-true-false', kind: 'true-false', bg: bgPlay, teacher: 'Extra time: listen. Is it true or false? Tap the right answer.',
    rounds: [
      { who: 'leo', statement: 'Leo is on the swing.', isTrue: true },
      { who: 'mia', statement: 'Mia is on the swing.', isTrue: false },
      { who: 'pip', statement: 'Pip says hello to his friends.', isTrue: true },
    ],
  },
  {
    id: 'wt4-move-break', kind: 'prea1', teacher: 'Extra time: brain break! Do it with Pip.',
    scene: {
      id: 'wt4-move-break', kind: 'tpr-actions', mode: 'break', bg: '/lep1/scenes/bg-u3l4-room-empty-wide.png', who: 'pip',
      teacher: 'Extra time: brain break! Do it with Pip.',
      rounds: [
        { line: 'Wave and say hello!', emoji: '\u{1F44B}' },
        { line: 'Shake hands with a friend!', emoji: '\u{1F91D}' },
        { line: 'Run to the swing!', emoji: '\u{1F3C3}' },
        { line: 'Freeze!', emoji: '\u{1F9CA}' },
      ],
    },
  },
  /* 21 Closing routine goodbye  22 Celebration */
  {
    id: 'wt4-goodbye-song', kind: 'song', bg: bgExpressGoodbyeW, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
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
  { id: 'wt4-finale', kind: 'finale', bg: bgPlay, who: 'pip', line: 'You said hello, asked “What’s your name?” and “How are you?”, and had a real chat with Bella! See you!' },
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
