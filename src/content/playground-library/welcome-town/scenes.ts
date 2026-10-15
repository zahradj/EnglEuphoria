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

export type CharKey = 'pip' | 'marigold' | 'mia' | 'bella' | 'willow' | 'leo' | 'coco' | 'wim' | 'catcat' | 'nova' | 'beep' | 'cilla' | 'pico' | 'bibi' | 'glob' | 'coral' | 'bub';

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
  // Unit 3 (Space Mission): Captain Nova and Beep the Robot — no own recorded voice yet, like Coco.
  nova: 'teacher',
  beep: 'teacher',
  // Unit 4 (Food Festival): Chef Cilla and Pico the Mouse — teacher voice until they have their own recorded voices.
  cilla: 'teacher',
  pico: 'teacher',
  // Unit 5 (Monster Town): Bibi the Tiny Monster (a girl) and Professor Glob — teacher voice until they have their own.
  bibi: 'teacher',
  glob: 'teacher',
  // Unit 6 (Ocean): Coral the Mermaid (a girl) and Bub the Octopus (a shy boy) — teacher voice until they have their own.
  coral: 'teacher',
  bub: 'teacher',
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
  nova: { name: 'Captain Nova', emoji: '\u{1F469}\u{200D}\u{1F680}', color: '#6366F1' },
  beep: { name: 'Beep', emoji: '\u{1F916}', color: '#64748B' },
  cilla: { name: 'Chef Cilla', emoji: '\u{1F469}\u{200D}\u{1F373}', color: '#E63946' },
  pico: { name: 'Pico', emoji: '\u{1F42D}', color: '#94A3B8' },
  bibi: { name: 'Bibi', emoji: '\u{1F47E}', color: '#8B5CF6' },
  glob: { name: 'Professor Glob', emoji: '\u{1F9D0}', color: '#14B8A6' },
  coral: { name: 'Coral', emoji: '\u{1F9DC}\u{200D}\u{2640}\u{FE0F}', color: '#0EA5E9' },
  bub: { name: 'Bub', emoji: '\u{1F419}', color: '#8B5CF6' },
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
      /** look 'word': the big word (default focus[0]) and an optional small line above it (e.g. "👦 + 👧 ="). */ word?: string; wordNote?: string; /** One word at a time (owner 2026-10-14): wordNote first ("👦 a boy"), then the word pops ("He"), then the line. */ oneAtATime?: boolean }
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
      /** Where the matched word shows (default targetTop) — e.g. on a character's body when targetTop is its feet. */ labelTop?: string;
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
      pages: ReaderPage[];
      /** Speed reading / read-aloud pages: no picture questions. */ noChecks?: boolean;
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
  | {
      /** Sticker Bingo (StickerBingoScene.tsx, classic Bingo redesigned): a 3×3 card of pictures. The voice says a
       *  SENTENCE (`cells[i].say`); the child stamps that picture with a sticker. `calls` = cell indexes in calling order
       *  (each line of three that fills glows "Bingo!"); the card is won when every call is stamped. */
      id: string; kind: 'sticker-bingo'; bg: string; teacher: string; title: string; who: CharKey;
      cells: { label: string; img: string; say: string }[]; calls: number[]; doneLine: string;
    }
  | {
      /** Tic-Tac-Toe Duel (TicTacToeScene.tsx, classic noughts & crosses redesigned): the child vs a friend (`who`,
       *  token `opponentImg`). To claim a square the child answers its question; then the friend takes a square (the
       *  friend never completes a line, so the child can always win). Three in a row wins; a full board starts a new one. */
      id: string; kind: 'tic-tac-toe'; bg: string; teacher: string; title: string; who: CharKey; opponentImg: string;
      squares: { ask: string; choices: string[]; answer: number; img?: string }[]; doneLine: string;
    }
  | {
      /** Pass the Present (PassParcelScene.tsx, classic pass-the-parcel redesigned): a present wrapped in one layer per
       *  round. Each right answer tears one layer off; inside the last layer is the `prize` sticker. No timer, no "out". */
      id: string; kind: 'pass-parcel'; bg: string; teacher: string; title: string; who: CharKey;
      rounds: { ask: string; choices: string[]; answer: number; img?: string }[];
      prize: { img: string; label: string }; doneLine: string;
    }
  | {
      /** I Spy (ISpyScene.tsx, the classic "I spy with my little eye" redesigned): a painted scene seen through
       *  binoculars. The voice gives a clue (`clue`, e.g. "I spy something small and green!"); the child moves the
       *  binoculars (drag, or tap to jump them) until the thing (`spot`, % of the picture, r = radius in % of width) is in
       *  the lenses, it lights up, and the answer (`answer`) is said and repeated by the child. */
      id: string; kind: 'i-spy'; bg: string; teacher: string; who: CharKey;
      /** Cut-out sticker of the clue-giver holding binoculars; the clue then appears in their speech bubble. */
      guide?: string;
      rounds: { clue: string; spot: { left: number; top: number; r: number }; answer: string }[]; doneLine: string;
    }
  | {
      /** Save the Balloon (SaveBalloonScene.tsx, classic hangman redesigned — nobody is ever in danger): Pip's hot-air
       *  balloon must float over the hill. Each round the child spells `word` (picture `img`, clue `sentence` said first)
       *  by tapping letter tiles; every right letter lights the burner and the balloon rises; a wrong letter only puffs
       *  a little smoke and the balloon dips — try again. `extra` = distractor letters (default: 3 from the word's
       *  neighbours). The finished word is read in its sentence. */
      id: string; kind: 'save-balloon'; bg: string; teacher: string; title: string; who: CharKey; balloonImg?: string;
      rounds: { word: string; img: string; sentence: string; extra?: string[] }[]; doneLine: string;
    }
  | {
      /** Sentence Dominoes (DominoesScene.tsx, classic dominoes redesigned): the chain starts with a picture tile
       *  (`start`). Each next domino = [sentence | picture]: the child picks, from the tiles in hand, the one whose
       *  SENTENCE matches the picture at the end of the chain; it snaps on and its picture becomes the new end.
       *  `steps[i].text` describes the picture before it (start for i = 0). */
      id: string; kind: 'dominoes'; bg: string; teacher: string; title: string; who: CharKey;
      start: { img: string; label: string }; steps: { text: string; img: string; label: string }[]; doneLine: string;
    }
  | {
      /** Go Fish! (GoFishScene.tsx, the card game redesigned): picture cards; every card is in the game exactly twice.
       *  The child asks the friend "Have you got a frog?" — "Yes! Here you are." (a pair) or "No! Go fish!" (draw from
       *  the pond). Then the friend asks and the child answers Yes / No truthfully. The game ends when the child's hand
       *  is empty. `cards` = the picture set; hands and `pond` list card labels in order (no pairs dealt). */
      id: string; kind: 'go-fish'; bg: string; teacher: string; title: string; who: CharKey; friendImg: string;
      cards: { label: string; img: string; article?: string }[];
      childHand: string[]; friendHand: string[]; pond: string[]; doneLine: string;
    }
  | {
      /** Hot Coconut (HotCoconutScene.tsx, classic hot potato redesigned — no forfeits, nobody is out): the friends
       *  sit in a circle with a seat for the child; a coconut hops from seat to seat to a drum beat and stops. Whoever
       *  holds it gets the round's question; the child answers (for themself or to help the friend). `stops[i]` = the
       *  seat index (0 = the child) where round i stops. */
      id: string; kind: 'hot-coconut'; bg: string; teacher: string; title: string; who: CharKey; coconutImg?: string;
      seats: { name: string; img: string }[];
      rounds: { ask: string; choices: string[]; answer: number; stop: number }[]; doneLine: string;
    }
  | {
      /** Quiz Board (QuizBoardScene.tsx, Jeopardy / Baamboozle board redesigned): columns = categories, rows = 100 /
       *  200 / 300 points. The child picks a tile, it flips to its question; a right answer scores the points (a wrong
       *  one only says "Try again!"). The `boom` tile ([column, row]) is a surprise that doubles its points. */
      id: string; kind: 'quiz-board'; bg: string; teacher: string; title: string; who: CharKey;
      categories: { name: string; emoji: string; tiles: { ask: string; choices: string[]; answer: number; img?: string }[] }[];
      boom?: [number, number]; doneLine: string;
    }
  | {
      /** Treasure Chests (ChestQuestScene.tsx, Blooket Gold Quest without stealing): every right answer lets the
       *  child open one of three chests; `rounds[i].prizes` are what the three chests hold (coins, "×2", a sticker).
       *  Coins drop into the class jar; the jar target is `goal` coins. */
      id: string; kind: 'chest-quest'; bg: string; teacher: string; title: string; who: CharKey; goal: number;
      rounds: { ask: string; choices: string[]; answer: number; img?: string; prizes: [string, string, string] }[]; doneLine: string;
    }
  | {
      /** Rising River (RisingRiverScene.tsx, Gimkit "The Floor is Lava" made cooperative and gentle): the friends wait
       *  on a rock; every right answer lays one plank of the bridge; a wrong answer lets the river rise a little (only
       *  wet feet — nobody falls). When the bridge is complete the friends walk across. */
      id: string; kind: 'rising-river'; bg: string; teacher: string; title: string; who: CharKey;
      friends: string[]; rounds: { ask: string; choices: string[]; answer: number; img?: string }[]; doneLine: string;
    }
  | {
      /** Build the Town (WorldBuilderScene.tsx, Blooket Factory / Crazy Kingdom redesigned): an empty place; every
       *  right answer drops one piece (house, tree, slide…) onto its spot with a bounce and says it ("A house!").
       *  `pieces` x/y = foot of the piece in % of the picture, size = width %. Round i places pieces[i]. */
      id: string; kind: 'world-builder'; bg: string; teacher: string; title: string; who: CharKey;
      pieces: { label: string; img: string; x: number; y: number; size: number }[];
      rounds: { ask: string; choices: string[]; answer: number; img?: string }[]; doneLine: string;
    }
  | {
      /** Draw That (DrawGuessScene.tsx, Pictionary / Gimkit "Draw That" redesigned): one player draws on a shared
       *  canvas (strokes sync live), the other guesses from the picture options and SAYS it ("It's a frog!").
       *  `drawer` per round: 'student' or 'teacher'; in a live class only the drawer's screen shows the secret. */
      id: string; kind: 'draw-guess'; bg: string; teacher: string; title: string; who: CharKey;
      rounds: { drawer: 'student' | 'teacher'; secret: number; options: { label: string; img: string; say: string }[];
        /** A ready-made doodle of the secret (SVG path data, 1000×600 paper): drawn stroke by stroke on the teacher's turn. */
        doodle?: string[] }[]; doneLine: string;
    }
  | {
      /** Echo Cave (EchoCaveScene.tsx, Marco Polo / blind man's buff redesigned): a dark cave with `tunnels` openings
       *  (3). A friend calls from one tunnel — the voice is panned left / centre / right — and the child taps where the
       *  voice came from; a lantern shows the friend and the child greets them. `at` = tunnel index. */
      id: string; kind: 'echo-cave'; bg: string; teacher: string; title: string; who: CharKey;
      rounds: { voice: CharKey; img: string; line: string; at: number; reply: string }[]; doneLine: string;
    }
  | {
      /** Treasure Islands (GridHuntScene.tsx, battleship redesigned): a sea grid (columns A-D, rows 1-4). Each right
       *  answer earns a shot: the child SAYS the square ("B3!") and taps it — a splash or a treasure. `treasures` are
       *  the squares to find ("B3"); questions repeat until every treasure is found. */
      id: string; kind: 'grid-hunt'; bg: string; teacher: string; title: string; who: CharKey;
      treasures: string[]; rounds: { ask: string; choices: string[]; answer: number; img?: string }[]; doneLine: string;
    }
  | { id: string; kind: 'musical-islands'; bg: string; teacher: string; title: string; who: CharKey; music: string;
      /** players hop between the four coloured lily pads while the music plays; each round `at` = pad of each player,
       *  `pad` = the pad asked about ("Who is on the red lily pad?"). */
      players: { label: string; img: string }[]; rounds: { at: number[]; pad: number; ask: string; say: string }[]; doneLine: string;
      /** What the four pads are called in the voice lines (default 'lily pad'; Ocean: 'island'). */ padWord?: string; }
  | { id: string; kind: 'red-green'; bg: string; teacher: string; title: string; who: CharKey; runner: string;
      cards: { label: string; img?: string }[];
      /** green: tap `cards[answer]` and the runner moves `steps`; red: freeze (don't tap) until it turns green. */
      rounds: { light: 'green' | 'red'; say: string; answer?: number; steps?: number }[]; doneLine: string; }
  | { id: string; kind: 'letter-bubbles'; bg: string; teacher: string; title: string; who: CharKey;
      words: { word: string; img: string; say: string }[]; doneLine: string; }
  | { id: string; kind: 'crossword'; bg: string; teacher: string; title: string; who: CharKey;
      words: { word: string; img: string; say: string }[]; doneLine: string; }
  | { id: string; kind: 'flag-race'; bg: string; teacher: string; title: string; who: CharKey;
      /** turns alternate: even = the child answers, odd = the teacher answers (the child asks). First flag up the hill wins. */
      rounds: { ask: string; choices: string[]; answer: number }[]; doneLine: string; }
  | { id: string; kind: 'balloon-match'; bg: string; teacher: string; title: string; who: CharKey;
      pairs: { text: string; img: string; label: string }[]; doneLine: string; }
  | { id: string; kind: 'pet-pal'; bg: string; teacher: string; title: string; who: CharKey;
      pet: { name: string; img: string };
      /** what the pet got in earlier lessons (shown on its shelf; the pet is bigger for each) */
      earlier: { label: string; img: string }[];
      rounds: { line: string; choices: { label: string; img: string }[]; answer: number; say: string }[]; doneLine: string; }
  | { id: string; kind: 'rocket-maze'; bg: string; teacher: string; title: string; who: CharKey; rocketImg: string;
      /** A star map grid (cols × rows). 'listen' missions: the voice gives `route` one step at a time, the child taps it;
       *  'steer' missions: the child gives the orders aloud and presses the arrows. `rocks` are blocked squares. */
      cols: number; rows: number;
      missions: { mode: 'listen' | 'steer'; intro: string; start: [number, number]; target: [number, number]; targetImg: string; targetLabel: string; route?: ('up' | 'down' | 'left' | 'right')[]; rocks?: [number, number][]; win: string }[];
      doneLine: string; }
  | { id: string; kind: 'weather-report'; bg: string; teacher: string; title: string; who: CharKey;
      /** Up to 4 planets (2 × 2 map); `weather` lists icon keys. Then the child reads each `report`, then packs the bag. */
      planets: { name: string; img: string; weather: string[]; forecast: string; report: string }[];
      icons: { key: string; label: string; img: string }[];
      bag: { planet: number; line: string; choices: { label: string; img: string }[]; answer: number; say: string }[];
      doneLine: string; }
  | { id: string; kind: 'food-survey'; bg: string; teacher: string; title: string; who: CharKey;
      /** A chart friends × foods; `answers[f][c]` = does friend f like food c. The child asks every box, then reads
       *  the chart for each `reports` card and picks likes / doesn't like. */
      friends: { name: string; who: CharKey; img: string }[]; foods: { label: string; img: string }[];
      answers: boolean[][]; reports: { friend: number; food: number }[]; doneLine: string; }
  | { id: string; kind: 'reef-detective'; bg: string; teacher: string; title: string; who: CharKey; whoName: string;
      /** ★ Reef Detective (A1 U6L4, docs/a1-unit-6-ocean.md §6.4): the child asks yes/no questions (size / doing / name keys,
       *  reefDetectiveRules.ts) about `secret`; answers pin to a clue board and the suspects that don't fit are crossed out.
       *  Part 2: the child hides one and `helper` asks `hideAsks`; the child answers Yes, it is / No, it isn't. */
      helper: CharKey; helperName: string; intro: string;
      suspects: { name: string; img: string; doing: string; size: 'big' | 'small' }[]; secret: number; hideAsks: string[]; doneLine: string; }
  | { id: string; kind: 'live-reef'; bg: string; teacher: string; title: string; who: CharKey;
      /** ★ Live Reef (A1 U6L2, docs/a1-unit-6-ocean.md §6.2): a reef in soft fog. Each round one animal peeks out at its
       *  `spots` place (left/top/size in % of the screen); the voice asks "What's the crab doing?" (reefAsk). The child
       *  picks the action from `choices`, the whole sentence appears ("The crab is walking." — reefSentence), the child
       *  SAYS it and taps 🎤 — and that part of the reef lights up and stays alive. A wrong action: the animal shrugs and
       *  the voice says REEF_WRONG. Done when every animal is lit. */
      spots: { name: string; img: string; left: number; top: number; size: number; plural?: boolean }[];
      rounds: { spot: number; doing: string; choices: string[] }[]; doneLine: string; }
  | { id: string; kind: 'mood-machine'; bg: string; teacher: string; title: string; who: CharKey;
      /** ★ Monster Mood Machine (A1 U5L1, docs/a1-unit-5-monster-town.md §5.1): pull the lever, a REASON picture comes out
       *  of the hatch ("because it's dark"); the child picks the feeling that fits (`choices` index `feelings`), the
       *  monster's face changes, and the child SAYS the whole sentence (moodSentence in moodRules.ts). */
      monster: { name: string; img: string }; feelings: { feeling: string; img: string }[];
      /** The lab owner (Professor Glob), shown by the machine while the child pulls the lever. */
      host?: { name: string; img: string };
      rounds: { reason: string; img: string; feeling: number; choices: number[] }[]; doneLine: string; }
  | { id: string; kind: 'monster-builder'; bg: string; teacher: string; title: string; who: CharKey;
      /** ★ Monster Builder (A1 U5L2, docs/a1-unit-5-monster-town.md §5.2): a blank monster body; the child hears
       *  "She's got three eyes and long horns." and builds it from the part trays (eyes 1-3, horns, mouth), then taps
       *  Check — every part must match the sentence. `body` sticker is square; parts sit at % of it. */
      body: string; eye: string; horns: { label: string; img: string }[]; mouths: { label: string; img: string }[];
      rounds: { line: string; eyes: 1 | 2 | 3; horns: number; mouth: number; name: string }[]; doneLine: string; }
  | { id: string; kind: 'guess-who'; bg: string; teacher: string; title: string; who: CharKey;
      /** ★ Guess Who (A1 U5L6, docs/a1-unit-5-monster-town.md §5.6): 8 monsters behind doors, built from the Monster
       *  Builder parts (`hue` recolours the body; `color` is its colour word). Part 1: the child asks `questions` (each a
       *  `test`; the friend says `yes` / `no` about the `secret` monster) and the doors that don't fit close; the child
       *  names the last one. Part 2: the child picks a monster and answers the friend's `hideAsks` Yes / No. */
      body: string; eye: string; horns: { label: string; img: string }[]; mouths: { label: string; img: string }[];
      wear: { word: string; img: string; on: 'head' | 'face' | 'neck' | 'feet' }[];
      monsters: { name: string; eyes: 1 | 2 | 3; horns: number; mouth: number; wears: number[]; hue: number; color: string }[];
      questions: { ask: string; yes: string; no: string; test: { eyes?: 1 | 2 | 3; horns?: number; mouth?: number; wear?: number; color?: string } }[];
      secret: number;
      hideAsks: { ask: string; test: { eyes?: 1 | 2 | 3; horns?: number; mouth?: number; wear?: number; color?: string } }[];
      doneLine: string; }
  | { id: string; kind: 'feelings-meter'; bg: string; teacher: string; title: string; who: CharKey;
      /** ★ Feelings Meter (A1 U5L5, docs/a1-unit-5-monster-town.md §5.5): the story character's day as an emotion graph.
       *  `feelings` = the rows, top (feels best) to bottom (feels worst); `points` = the story moments left to right.
       *  For each moment the child taps the face on the side, a dot lands in that column and the line joins the dots;
       *  then the sentence (`line`, with because) is read and said. */
      feelings: { label: string; img: string }[];
      points: { img: string; feeling: number; line: string }[];
      doneLine: string; }
  | { id: string; kind: 'monster-mixup'; bg: string; teacher: string; title: string; who: CharKey;
      /** ★ Monster Mix-Up (A1 U5L4, docs/a1-unit-5-monster-town.md §5.4 "Monster Maker"): Bibi describes a monster
       *  (`line`, 2-3 sentences: has got + is wearing), the machine builds it — with ONE mistake (`mistake`). The child
       *  taps the wrong part on the monster, picks the right one from the tray, the monster is fixed and the child says
       *  `say` ("No! He's wearing a hat!"). `wear[i].on` = where it sits on the body. Boys never wear a dress. */
      body: string; eye: string; horns: { label: string; img: string }[]; mouths: { label: string; img: string }[];
      wear: { word: string; img: string; on: 'head' | 'face' | 'neck' | 'feet' }[];
      rounds: {
        line: string; name: string; eyes: 1 | 2 | 3; horns: number; mouth: number; wears: number[];
        /** What the machine got wrong: `shown` = the wrong value it built (eye count, horns / mouth index, or for
         *  `wear` the wrong item worn in place of `wears[slot]`). */
        mistake: { part: 'eyes' | 'horns' | 'mouth' | 'wear'; shown: number; slot?: number };
        say: string;
      }[];
      doneLine: string; }
  | { id: string; kind: 'festival-cafe'; bg: string; teacher: string; title: string; who: CharKey;
      /** `order` = menu indexes the tray must hold exactly; `offer` = the polite offer the child then SAYS (its item is
       *  added to the tray when the customer says "Yes, please!"). */
      menu: { label: string; img: string }[];
      rounds: { customer: CharKey; customerImg: string; line: string; order: number[]; reply: string; offer?: { line: string; item: number } }[];
      doneLine: string; }
  | { id: string; kind: 'build-dish'; bg: string; teacher: string; title: string; who: CharKey;
      /** `steps[i].topping` = the toppings index that step names; the eater tastes the dish at the end. */
      toppings: { label: string; img: string }[]; steps: { text: string; topping: number }[];
      eater: { who: CharKey; img: string; line: string }; doneLine: string; }
  /** ★ Design My Room (A1 U9L4, docs/a1-unit-9-lesson-4.md): stickers go to spots in an empty room (a framed picture above the shelf). `listen` = Wim says
   *  where each thing goes (rounds); `free` = the child places `pick` things anywhere, then describes the room. Spots are % of
   *  the room picture (bottom-centre of the sticker), `w` is % of its width; `where` is the place phrase. */
  | {
      id: string; kind: 'design-room'; bg: string; who: CharKey; teacher: string; title: string; mode: 'listen' | 'free';
      things: { label: string; img: string; w: number }[];
      spots: { where: string; left: number; top: number }[];
      rounds?: { line: string; thing: number; spot: number }[];
      pick?: number; doneLine: string;
    }
  /** Lost Property Box (A1 U9L4): things pop out of a box one by one ("Whose crown is it?"); the child gives each to its
   *  owner, who keeps it; then "It's Wim's crown." */
  | {
      id: string; kind: 'lost-property'; bg: string; who: CharKey; teacher: string; title: string; boxImg?: string;
      owners: { name: string; who: CharKey; img: string }[];
      items: { label: string; img: string; owner: number }[]; doneLine: string;
    }
  | { id: string; kind: 'hot-cold'; bg: string; teacher: string; title: string; who: CharKey;
      /** The picture hides at (x, y) % of the 16:9 art; the child searches by tapping, the voice says Cold / Warm / Hot. */
      rounds: { label: string; img: string; x: number; y: number; find: string; say: string }[]; doneLine: string; }
  | { id: string; kind: 'whisper-tube'; bg: string; teacher: string; title: string; who: CharKey;
      /** `from` whispers `said` down the tube, `to` hears `heard` (one word changed); the child taps the wrong word and fixes it. */
      rounds: { from: CharKey; to: CharKey; fromImg: string; toImg: string; said: string; heard: string; choices?: string[] }[]; doneLine: string; }
  | { id: string; kind: 'glider'; bg: string; teacher: string; title: string; who: CharKey; pilot: string;
      rounds: { ask: string; choices: { label: string; img?: string }[]; answer: number; say?: string }[]; doneLine: string; }
  | { id: string; kind: 'tower-pull'; bg: string; teacher: string; title: string; who: CharKey;
      rounds: { ask: string; choices: string[]; answer: number; img?: string }[]; doneLine: string; }
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
      /** Magic Mirror (AnswerMirrorScene.tsx, A1 U1 L2): the mirror shows "you" with a feeling, Pip asks "How are you?",
       *  the child picks the answer bubble (`answers[rounds[n].answer]`) and says it. `who` per round = the answer voice. */
      id: string; kind: 'answer-mirror'; bg: string; teacher: string; title: string; who: CharKey; askerImg: string; mirrorNote: string;
      answers: { feeling: string; img: string; line: string }[];
      rounds: { who: CharKey; answer: number; choices: number[] }[]; doneLine: string;
    }
  | {
      /** Feelings Camera (FeelingsCameraScene.tsx, A1 U1 L2): a photo of a friend, "How is Mia?" — the child builds
       *  "She is hungry." (He/She, then the feeling) and says it; the photo goes into the album. */
      id: string; kind: 'feelings-camera'; bg: string; teacher: string; title: string; who: CharKey;
      friends: { name: string; img: string; pronoun: 'He' | 'She'; feeling: string }[];
      feelings: { feeling: string; img: string }[]; doneLine: string;
    }
  | {
      /** Feelings Runner (FeelingsRunnerScene.tsx, A1 U1 L2 video game): friends run towards Pip in three lanes; the
       *  sentence ("She is hungry!") decides which one to tap; caught friends join the team (`team` = their pictures). */
      id: string; kind: 'feelings-runner'; bg: string; teacher: string; title: string; who: CharKey; runner: string; team: string[];
      rounds: { ask: string; choices: { img: string; sentence: string }[]; answer: number }[]; doneLine: string;
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
const I1 = (n: string) => `/lep1/items/item-${n}.png`;
const bgParkEmpty = '/lep1/scenes/bg-u3l3-park-empty-wide.png';
const bgPartyEmpty = '/lep1/scenes/bg-u8l3-party-empty-wide.png';
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
/** A picture question after a story page (owner 2026-10-14: a question after every scene, like the Pre-A1 films):
 *  asked once the child has read the page; `options` are pictures with their words (A1 reads). */
export type ReaderCheck = { who?: CharKey; question: string; answer: string; options: { label: string; img?: string }[] };
export type ReaderPage = { img: string; lines: { who?: CharKey; text: string }[]; check?: ReaderCheck };
export const LEO_STORY: ReaderPage[] = [
  { img: leoStory(1), lines: [{ text: 'This is Leo. Leo is new in Welcome Town.' }], check: { who: 'pip', question: 'Who is new in Welcome Town?', answer: 'Leo', options: [{ label: 'Leo', img: spr('leo') }, { label: 'Pip', img: spr('pip') }, { label: 'Mia', img: spr('mia') }] } },
  { img: leoStory(2), lines: [{ who: 'pip', text: 'Hello! My name is Pip. What’s your name?' }], check: { who: 'mia', question: 'Who says hello to Leo?', answer: 'Pip', options: [{ label: 'Bella', img: spr('bella') }, { label: 'Pip', img: spr('pip') }, { label: 'Willow', img: spr('willow') }] } },
  { img: leoStory(3), lines: [{ who: 'leo', text: 'Hi, Pip! My name is Leo.' }], check: { who: 'pip', question: 'What is his name?', answer: 'Leo', options: [{ label: 'Pip', img: spr('pip') }, { label: 'Leo', img: spr('leo') }, { label: 'Mia', img: spr('mia') }] } },
  { img: leoStory(4), lines: [{ who: 'pip', text: 'How are you, Leo?' }, { who: 'leo', text: 'I am sad. My red cap is lost.' }], check: { who: 'pip', question: 'What is lost?', answer: 'A red cap', options: [{ label: 'A red cap', img: '/lep1/items/item-cap.png' }, { label: 'A hat', img: '/lep1/items/item-hat.png' }, { label: 'A ball', img: '/lep1/items/item-ball.png' }] } },
  { img: leoStory(5), lines: [{ who: 'pip', text: 'Come on, Leo! Let’s find it!' }], check: { who: 'leo', question: 'Who helps Leo?', answer: 'Pip', options: [{ label: 'Mia', img: spr('mia') }, { label: 'Pip', img: spr('pip') }, { label: 'Bella', img: spr('bella') }] } },
  { img: leoStory(6), lines: [{ who: 'pip', text: 'Mia, this is my friend Leo.' }, { who: 'mia', text: 'Hello, Leo! Nice to meet you.' }], check: { who: 'pip', question: 'Who meets Leo?', answer: 'Mia', options: [{ label: 'Mia', img: spr('mia') }, { label: 'Willow', img: spr('willow') }, { label: 'Bella', img: spr('bella') }] } },
  { img: leoStory(7), lines: [{ who: 'bella', text: 'Hi, Leo! I’m Bella. Look! A red cap!' }], check: { who: 'pip', question: 'What does Bella see?', answer: 'A red cap', options: [{ label: 'A ball', img: '/lep1/items/item-ball.png' }, { label: 'A cat', img: '/lep1/items/item-cat.png' }, { label: 'A red cap', img: '/lep1/items/item-cap.png' }] } },
  { img: leoStory(8), lines: [{ who: 'willow', text: 'No, no! That is my red hat!' }], check: { who: 'pip', question: 'Whose hat is it?', answer: 'Willow', options: [{ label: 'Bella', img: spr('bella') }, { label: 'Willow', img: spr('willow') }, { label: 'Leo', img: spr('leo') }] } },
  { img: leoStory(9), lines: [{ who: 'mia', text: 'Look! The cap is on the cat!' }], check: { who: 'pip', question: 'Where is the cap?', answer: 'On the cat', options: [{ label: 'On the cat', img: '/lep1/items/item-cat.png' }, { label: 'On the hat', img: '/lep1/items/item-hat.png' }, { label: 'In the box', img: '/lep1/items/item-toybox.png' }] } },
  { img: leoStory(10), lines: [{ who: 'leo', text: 'My cap! Thank you, friends! I am happy now!' }], check: { who: 'pip', question: 'How is Leo now?', answer: 'Happy', options: [{ label: 'Sad' }, { label: 'Happy' }, { label: 'Angry' }] } },
  { img: leoStory(11), lines: [{ who: 'pip', text: 'Goodbye, Leo! See you tomorrow!' }, { who: 'leo', text: 'Goodbye, friends!' }], check: { who: 'pip', question: 'What do they say?', answer: 'Goodbye!', options: [{ label: 'Hello!' }, { label: 'Thank you!' }, { label: 'Goodbye!' }] } },
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
  { id: 'wt-echo-goodbye', kind: 'echo', bg: bgL1Goodbye, who: 'pip', textSide: 'top', teacher: 'Guided: wave and say it with Pip — loud, then quiet.', word: 'Goodbye! See you!' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'wt-name-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps it, then the picture), then reads it aloud.',
    items: [
      { word: 'My name is Pip.', img: spr('pip') },
      { word: 'My name is Mia.', img: spr('mia') },
      { word: 'My name is Leo.', img: spr('leo') },
      { word: 'My name is Bella.', img: spr('bella') },
    ],
    bg: bgL1Goodbye,
  },
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
  {
    id: 'wt-hello-doors', kind: 'hello-doors', bg: bgL1Class, teacher: 'Guided: Knock, knock! Listen, tap the door of the friend, then say hello and their name.', cast: ['mia', 'bella', 'leo', 'willow'],
    rounds: [
      { target: 'mia', prompt: 'Knock, knock! Where is Mia?', helloLine: 'Hello! My name is Mia.', echoLine: 'Hello, Mia!' },
      { target: 'leo', prompt: 'Knock, knock! Where is Leo?', helloLine: 'Hi! My name is Leo.', echoLine: 'Hi, Leo!' },
      { target: 'willow', prompt: 'Knock, knock! Where is Willow?', helloLine: 'Hello! My name is Willow.', echoLine: 'Hello, Willow!' },
      { target: 'bella', prompt: 'Knock, knock! Where is Bella?', helloLine: 'Hi! My name is Bella.', echoLine: 'Hi, Bella!' },
    ],
  },
  {
    id: 'wt-echo-cave', kind: 'echo-cave', bg: '/lep1/scenes/bg-u2l6-cave-empty-wide.png', who: 'pip', title: 'Echo Cave: who is calling?',
    teacher: 'Game: a friend calls from a tunnel — left, middle or right (speakers or headphones help). The student listens, taps the tunnel and says hello back: Hello, Mia!',
    rounds: [
      { voice: 'mia', img: spr('mia'), at: 0, line: 'Hello! My name is Mia!', reply: 'You found me! Hello!' },
      { voice: 'leo', img: spr('leo'), at: 2, line: 'Hi! My name is Leo!', reply: 'You found me! Hi!' },
      { voice: 'bella', img: spr('bella'), at: 1, line: 'Hello! I’m Bella! What’s your name?', reply: 'Nice to meet you!' },
      { voice: 'willow', img: spr('willow'), at: 0, line: 'Goodbye! My name is Willow!', reply: 'You found me! Goodbye!' },
    ],
    doneLine: 'You found all your friends!',
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
    id: 'wt-musical-islands', kind: 'musical-islands', bg: '/lep1/scenes/bg-game-pond-wide.png', who: 'pip', music: '/lep1/audio/hello-song.mp3', title: 'Musical Islands',
    teacher: 'Game: press the music — the friends hop between the lily pads. When it stops, listen: Who is on the red lily pad? The student taps the friend and says the name. Nobody is out!',
    players: [{ label: 'Pip', img: spr('pip') }, { label: 'Mia', img: spr('mia') }, { label: 'Leo', img: spr('leo') }, { label: 'Bella', img: spr('bella') }],
    rounds: [
      { at: [0, 1, 2, 3], pad: 1, ask: 'Who is on the blue lily pad?', say: 'Mia! It’s Mia.' },
      { at: [2, 3, 0, 1], pad: 2, ask: 'Who is on the yellow lily pad?', say: 'Pip! It’s Pip.' },
      { at: [1, 0, 3, 2], pad: 3, ask: 'Who is on the green lily pad?', say: 'Leo! It’s Leo.' },
      { at: [2, 1, 3, 0], pad: 0, ask: 'Who is on the red lily pad?', say: 'Bella! It’s Bella.' },
    ],
    doneLine: 'Great listening! Everybody is still in the game!',
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
    id: 'wt-read-match', kind: 'picture-match', look: 'chalk', prompt: 'Read and match',
    teacher: 'Reading: the student reads each sentence and drags it under its picture, then reads it aloud.',
    items: [
      { word: 'Leo is new.', img: leoStory(1) },
      { word: 'Hello! What’s your name?', img: leoStory(2) },
      { word: 'Goodbye, Leo!', img: leoStory(11) },
    ],
    bg: bgL1Circle,
  },
  {
    id: 'wt-build-name', kind: 'sentence-build', bg: bgL1Reading, teacher: 'Reading: put the words of the story in order, then read the sentence.',
    rounds: [
      { words: ['My', 'name', 'is', 'Pip.'], emoji: '\u{1F98A}' },
      { words: ['What’s', 'your', 'name?'], emoji: '\u{2753}' },
      { words: ['Hi,', 'Pip!', 'My', 'name', 'is', 'Leo.'], emoji: '\u{1F981}' },
    ],
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
  {
    id: 'wt-answer-2', kind: 'join-stage', bg: bgL1Peers, teacher: 'Free: a new class friend (the teacher) says hello. The student answers and asks the name.', cast: ['marigold', 'pip'],
    turns: [
      { who: 'marigold', line: 'Hi! I’m new here.' },
      { who: 'student', line: 'Hello! What’s your name?' },
      { who: 'marigold', line: 'My name is Sam. What’s your name?' },
      { who: 'student', line: 'My name is … Nice to meet you, Sam!' },
      { who: 'marigold', line: 'Goodbye! See you!' },
      { who: 'student', line: 'Goodbye, Sam!' },
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
    id: 'wt-pet-pal', kind: 'pet-pal', bg: bgParkEmpty, who: 'pip', title: 'Pet Pal: Biscuit',
    teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
    pet: { name: 'Biscuit', img: '/lep1/items/item-dog.png' },
    earlier: [],
    rounds: [{ line: 'Hello! I’m Biscuit! I want a star!', choices: [{ label: 'cake', img: '/lep1/items/item-cake.png' }, { label: 'star', img: '/lep1/items/item-star-gold.png' }, { label: 'present', img: '/lep1/items/item-gift.png' }], answer: 1, say: 'A star for Biscuit! Hello, Biscuit!' }],
    doneLine: 'Biscuit is so happy! See you next time!',
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
  /* Extra time (blueprint §3b) — only if there is time left */
  {
    id: 'wt-flip-hello', kind: 'prea1', teacher: 'Extra time: Flip & Say! Flip a card and say the line to that friend (🔊 = the model).',
    scene: {
      id: 'wt-flip-hello', kind: 'flip-say', bg: bgL1Class, who: 'pip', title: 'Flip a card and say it!',
      teacher: 'Flip a card. Say hello or goodbye!',
      cards: [
        { label: 'Mia', img: spr('mia'), say: 'Hello, Mia!' },
        { label: 'Leo', img: spr('leo'), say: 'Hi, Leo! What’s your name?' },
        { label: 'Bella', img: spr('bella'), say: 'Goodbye, Bella!' },
        { label: 'Willow', img: spr('willow'), say: 'Hello! My name is …' },
        { label: 'Pip', img: spr('pip'), say: 'Hi, Pip! See you!' },
        { label: 'Miss Marigold', img: spr('marigold'), say: 'Goodbye, Miss Marigold!' },
      ],
      doneLine: 'All the cards are gold! Great greetings!',
    },
  },
  {
    id: 'wt-friend-pop', kind: 'prea1', teacher: 'Extra time: Whack-a-Friend! Listen, tap the friend who pops up, and say hello.',
    scene: {
      id: 'wt-friend-pop', kind: 'friend-pop', bg: bgL1Class, teacher: 'Tap the friend I call — then say hello!', cast: ['pip', 'mia', 'bella', 'willow'],
      rounds: [
        { target: 'bella', prompt: 'Where is Bella?', sayLine: 'Hello, Bella!' },
        { target: 'pip', prompt: 'Where is Pip?', sayLine: 'Hi, Pip!' },
        { target: 'willow', prompt: 'Where is Willow?', sayLine: 'Hello, Willow!' },
        { target: 'mia', prompt: 'Where is Mia?', sayLine: 'Hi, Mia!' },
      ],
    },
  },
  {
    id: 'wt-brain-break-2', kind: 'prea1', teacher: 'Extra time: brain break — wave, bow and high-five with Pip.',
    scene: {
      id: 'wt-brain-break-2', kind: 'tpr-actions', mode: 'break', bg: bgL1Circle, who: 'pip', teacher: 'Move with Pip!',
      rounds: [
        { line: 'Wave and say: Hello!', emoji: '\u{1F44B}' },
        { line: 'Bow and say: Nice to meet you!', emoji: '\u{1F647}' },
        { line: 'High five and say: Hi!', emoji: '\u{1F64C}' },
        { line: 'Walk to the door and say: Goodbye!', emoji: '\u{1F6AA}' },
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
  /* WARM-UP */
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

  /* PRESENT 1 — the feelings + read and match */
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
    // Owner 2026-10-14: after the feelings words, a matching game (A1 = read and match) — the whole friend is the target.
    id: 'wt2-feelings-match', kind: 'drag-match', bg: bgFeelingsW, teacher: 'Guided: read and match! Drag each word onto the friend who feels that way — anywhere on the friend. Say it: I am tired!',
    items: [
      { label: 'Hungry', color: '#4FA9E0', who: 'willow', targetLeft: '72%', targetTop: '82%', labelTop: '72%', targetWidth: '11%', targetHeight: '27%' },
      { label: 'Angry', color: '#E76FA5', who: 'bella', targetLeft: '62%', targetTop: '82%', labelTop: '66%', targetWidth: '8.5%', targetHeight: '40%' },
      { label: 'Sad', color: '#B85CD1', who: 'mia', targetLeft: '52.5%', targetTop: '82%', labelTop: '72%', targetWidth: '11%', targetHeight: '29%' },
      { label: 'Happy', color: '#FE6A2F', who: 'pip', targetLeft: '30.5%', targetTop: '79%', labelTop: '64%', targetWidth: '12%', targetHeight: '37%' },
      { label: 'Tired', color: '#C97A2F', who: 'leo', targetLeft: '41.8%', targetTop: '81%', labelTop: '64%', targetWidth: '11%', targetHeight: '43%' },
    ],
  },

  /* PRESENT 1b — How are you? I am … */
  {
    id: 'wt2-howareyou', kind: 'meet', focus: ['How are you'], bg: bgCircleW, who: 'marigold',
    teacher: 'Present: listen to the question and the answer. Then say it: I am fine, thank you!',
    line: 'How are you today? I am fine, thank you!', repeat: 'How are you?',
  },
  { id: 'wt2-echo-howareyou', kind: 'echo', bg: bgCircleW, who: 'pip', textSide: 'top', teacher: 'Guided: say the question with Pip.', word: 'How are you?' },
  {
    // Owner 2026-10-14 (replaces "She is tired" echo): the student ANSWERS "How are you?" — I am tired. I am happy. I am angry.
    id: 'wt2-how-are-you', kind: 'answer-mirror', bg: bgCircleW, who: 'pip', askerImg: spr('pip'),
    title: 'Magic Mirror: How are you?', mirrorNote: 'This is you!',
    teacher: 'Guided: the mirror shows the student with a feeling. Pip asks "How are you?" — the student taps the answer that matches the face and SAYS it: I am tired.',
    answers: [
      { feeling: 'happy', img: feelSpr('pip-happy'), line: 'I am happy.' },
      { feeling: 'tired', img: feelSpr('leo-tired'), line: 'I am tired.' },
      { feeling: 'sad', img: feelSpr('mia-sad'), line: 'I am sad.' },
      { feeling: 'angry', img: feelSpr('bella-angry'), line: 'I am angry.' },
      { feeling: 'hungry', img: feelSpr('willow-hungry'), line: 'I am hungry.' },
    ],
    rounds: [
      { who: 'leo', answer: 1, choices: [0, 1, 3] },
      { who: 'pip', answer: 0, choices: [2, 4, 0] },
      { who: 'bella', answer: 3, choices: [3, 1, 2] },
      { who: 'mia', answer: 2, choices: [0, 2, 4] },
      { who: 'willow', answer: 4, choices: [4, 3, 1] },
    ],
    doneLine: 'Great answers! Now you can say how you are!',
  },

  /* CONTROLLED PRACTICE 1 — I am … */
  {
    id: 'wt2-glider', kind: 'glider', bg: bgParkEmpty, who: 'pip', pilot: spr('pip'), title: 'Pip’s Glider: how do you feel?',
    teacher: 'Game: listen to the sentence and tap the cloud with the right face — Pip flies into it. The student says the sentence too.',
    rounds: [
      { ask: 'I am tired.', choices: [{ label: 'happy', img: feelSpr('pip-happy') }, { label: 'tired', img: feelSpr('leo-tired') }, { label: 'angry', img: feelSpr('bella-angry') }], answer: 1, say: 'Tired! I am tired.' },
      { ask: 'I am happy!', choices: [{ label: 'sad', img: feelSpr('mia-sad') }, { label: 'hungry', img: feelSpr('willow-hungry') }, { label: 'happy', img: feelSpr('pip-happy') }], answer: 2, say: 'Happy! I am happy!' },
      { ask: 'I am sad.', choices: [{ label: 'sad', img: feelSpr('mia-sad') }, { label: 'angry', img: feelSpr('bella-angry') }, { label: 'tired', img: feelSpr('leo-tired') }], answer: 0, say: 'Sad! I am sad.' },
      { ask: 'I am hungry!', choices: [{ label: 'tired', img: feelSpr('leo-tired') }, { label: 'hungry', img: feelSpr('willow-hungry') }, { label: 'happy', img: feelSpr('pip-happy') }], answer: 1, say: 'Hungry! I am hungry!' },
      { ask: 'I am angry!', choices: [{ label: 'happy', img: feelSpr('pip-happy') }, { label: 'sad', img: feelSpr('mia-sad') }, { label: 'angry', img: feelSpr('bella-angry') }], answer: 2, say: 'Angry! I am angry!' },
    ],
    doneLine: 'Super flying! You know your feelings!',
  },
  {
    id: 'wt2-feelings-mirror', kind: 'listen-tap', bg: bgFeelingsW, teacher: 'Guided: listen — "I am hungry." Tap the hungry friend, then say it: I am hungry!',
    targets: [
      { label: 'Happy', left: '29.8%', top: '54.5%', color: '#FE6A2F' },
      { label: 'Tired', left: '40.4%', top: '55.6%', color: '#C97A2F' },
      { label: 'Sad', left: '51.1%', top: '57.9%', color: '#B85CD1' },
      { label: 'Angry', left: '61.8%', top: '56.8%', color: '#E76FA5' },
      { label: 'Hungry', left: '72.5%', top: '57.9%', color: '#4FA9E0' },
    ],
    rounds: [
      { prompt: 'I am hungry.', answerLabel: 'Hungry', who: 'willow' },
      { prompt: 'I am tired.', answerLabel: 'Tired', who: 'leo' },
      { prompt: 'I am sad.', answerLabel: 'Sad', who: 'mia' },
      { prompt: 'I am happy.', answerLabel: 'Happy', who: 'pip' },
      { prompt: 'I am angry.', answerLabel: 'Angry', who: 'bella' },
    ],
  },
  {
    id: 'wt2-draw-that', kind: 'draw-guess', bg: bgL1Class, who: 'pip', title: 'Draw That! How does it feel?',
    teacher: 'Game: take turns. The drawer sees a secret feeling and draws the face (no words!); the other one taps the picture and says it: Happy! A happy face! In a live class each screen shows only its own role.',
    rounds: [
      { drawer: 'teacher', secret: 0, options: [
        { label: 'happy', img: feelSpr('pip-happy'), say: 'Happy! A happy face!' },
        { label: 'sad', img: feelSpr('mia-sad'), say: 'Sad! A sad face!' },
        { label: 'angry', img: feelSpr('bella-angry'), say: 'Angry! An angry face!' },
        { label: 'tired', img: feelSpr('leo-tired'), say: 'Tired! A tired face!' },
      ], doodle: ['M 300 300 a 200 200 0 1 0 400 0 a 200 200 0 1 0 -400 0', 'M 410 250 Q 440 215 470 250', 'M 530 250 Q 560 215 590 250', 'M 395 340 Q 500 450 605 340'] },
      { drawer: 'student', secret: 1, options: [
        { label: 'happy', img: feelSpr('pip-happy'), say: 'Happy! A happy face!' },
        { label: 'sad', img: feelSpr('mia-sad'), say: 'Sad! A sad face!' },
        { label: 'angry', img: feelSpr('bella-angry'), say: 'Angry! An angry face!' },
        { label: 'tired', img: feelSpr('leo-tired'), say: 'Tired! A tired face!' },
      ] },
      { drawer: 'teacher', secret: 3, options: [
        { label: 'happy', img: feelSpr('pip-happy'), say: 'Happy! A happy face!' },
        { label: 'sad', img: feelSpr('mia-sad'), say: 'Sad! A sad face!' },
        { label: 'angry', img: feelSpr('bella-angry'), say: 'Angry! An angry face!' },
        { label: 'tired', img: feelSpr('leo-tired'), say: 'Tired! A tired face!' },
      ], doodle: ['M 300 300 a 200 200 0 1 0 400 0 a 200 200 0 1 0 -400 0', 'M 405 255 Q 440 280 475 255', 'M 525 255 Q 560 280 595 255', 'M 480 385 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0', 'M 720 120 L 780 120 L 720 180 L 780 180', 'M 800 60 L 840 60 L 800 100 L 840 100'] },
      { drawer: 'student', secret: 2, options: [
        { label: 'happy', img: feelSpr('pip-happy'), say: 'Happy! A happy face!' },
        { label: 'sad', img: feelSpr('mia-sad'), say: 'Sad! A sad face!' },
        { label: 'angry', img: feelSpr('bella-angry'), say: 'Angry! An angry face!' },
        { label: 'tired', img: feelSpr('leo-tired'), say: 'Tired! A tired face!' },
      ] },
    ],
    doneLine: 'Great drawing! Great guessing!',
  },

  /* PRESENT 2 — He is … / She is … / They are … (one picture each) */
  {
    // Owner 2026-10-14: page 9 split — one picture per word: He …
    id: 'wt2-he', kind: 'meet', look: 'word', oneAtATime: true, cardSide: 'right', word: 'He', wordNote: '\u{1F466} a boy', focus: ['He'], bg: bgHeIntroPipW, who: 'pip',
    teacher: 'Present: point to Pip — a boy. Then "he". He is happy! The student says it.',
    line: 'Pip is a boy. He is happy!', repeat: 'He is happy!',
  },
  {
    id: 'wt2-she', kind: 'meet', look: 'word', oneAtATime: true, cardSide: 'left', word: 'She', wordNote: '\u{1F467} a girl', focus: ['She'], bg: bgHeIntroMiaW, who: 'mia',
    teacher: 'Present: point to Mia — a girl. Then "she". She is happy! The student says it.',
    line: 'Mia is a girl. She is happy!', repeat: 'She is happy!',
  },
  {
    id: 'wt2-they', kind: 'meet', look: 'word', oneAtATime: true, word: 'They', wordNote: 'Pip + Mia', focus: ['They'], bg: bgHeSheTogetherW, who: 'pip',
    teacher: 'Present: point to Pip and Mia together — two friends = they. They are happy! The student says it.',
    line: 'Pip and Mia. They are happy!', repeat: 'They are happy!',
  },

  /* CONTROLLED PRACTICE 2 — He / She is … */
  {
    id: 'wt2-he-she-say', kind: 'prea1', teacher: 'Guided: look at the friend and say the sentence with He or She: He is happy. She is sad.',
    scene: {
      id: 'wt2-he-she-say', kind: 'he-she-say', bg: bgCircleW, teacher: 'He or she? Say it!',
      rounds: [
        { who: 'pip', emotion: 'happy', pronoun: 'He' },
        { who: 'mia', emotion: 'sad', pronoun: 'She' },
        { who: 'leo', emotion: 'angry', pronoun: 'He' },
        { who: 'bella', emotion: 'happy', pronoun: 'She' },
      ],
    },
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
  {
    // Owner 2026-10-14 (replaces the feelings wheel): the student SAYS "He is tired. She is happy." — builds it, then says it.
    id: 'wt2-feelings-camera', kind: 'feelings-camera', bg: '/lep1/scenes/bg-u3l4-room-empty-wide.png', who: 'pip', title: 'Feelings Camera: He or She?',
    teacher: 'Guided: click! A photo of a friend. Pip asks "How is Mia?" — the student taps He or She, then the feeling, and SAYS the sentence: She is sad.',
    friends: [
      { name: 'Leo', img: feelSpr('leo-tired'), pronoun: 'He', feeling: 'tired' },
      { name: 'Mia', img: feelSpr('mia-sad'), pronoun: 'She', feeling: 'sad' },
      { name: 'Pip', img: feelSpr('pip-happy'), pronoun: 'He', feeling: 'happy' },
      { name: 'Willow', img: feelSpr('willow-hungry'), pronoun: 'She', feeling: 'hungry' },
      { name: 'Bella', img: feelSpr('bella-angry'), pronoun: 'She', feeling: 'angry' },
    ],
    feelings: [
      { feeling: 'happy', img: feelSpr('pip-happy') },
      { feeling: 'tired', img: feelSpr('leo-tired') },
      { feeling: 'sad', img: feelSpr('mia-sad') },
      { feeling: 'angry', img: feelSpr('bella-angry') },
      { feeling: 'hungry', img: feelSpr('willow-hungry') },
    ],
    doneLine: 'Look at our album! You can say how your friends feel!',
  },
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
    // Owner 2026-10-14 ("remove all of the brain breaks … replace it with a video game"): Feelings Runner.
    id: 'wt2-feelings-runner', kind: 'feelings-runner', bg: bgParkEmpty, who: 'pip', runner: spr('pip'),
    title: 'Feelings Runner: catch the friend!',
    teacher: 'Game: friends run towards Pip. Listen — "She is hungry!" — and tap that friend; they join Pip’s team. A wrong friend says their own sentence. The student says each sentence too.',
    team: [feelSpr('leo-tired'), feelSpr('willow-hungry'), feelSpr('mia-sad'), feelSpr('bella-angry')],
    rounds: [
      { ask: 'He is tired!', answer: 1, choices: [{ img: feelSpr('mia-sad'), sentence: 'She is sad!' }, { img: feelSpr('leo-tired'), sentence: 'He is tired!' }, { img: feelSpr('willow-hungry'), sentence: 'She is hungry!' }] },
      { ask: 'She is hungry!', answer: 2, choices: [{ img: feelSpr('bella-angry'), sentence: 'She is angry!' }, { img: feelSpr('mia-sad'), sentence: 'She is sad!' }, { img: feelSpr('willow-hungry'), sentence: 'She is hungry!' }] },
      { ask: 'She is sad!', answer: 0, choices: [{ img: feelSpr('mia-sad'), sentence: 'She is sad!' }, { img: feelSpr('bella-angry'), sentence: 'She is angry!' }, { img: feelSpr('leo-tired'), sentence: 'He is tired!' }] },
      { ask: 'She is angry!', answer: 1, choices: [{ img: feelSpr('willow-hungry'), sentence: 'She is hungry!' }, { img: feelSpr('bella-angry'), sentence: 'She is angry!' }, { img: feelSpr('mia-sad'), sentence: 'She is sad!' }] },
    ],
    doneLine: 'The whole team is running with Pip! Great listening!',
  },

  /* READING — Leo’s story */
  {
    id: 'wt2-reader', kind: 'reader', bg: bgL1Reading, title: 'Leo’s First Day', doneLine: 'Poor Leo! Where is his red cap? Find out next time!',
    teacher: 'Reading: page 3 again, then the new pages. Listen while the words light up, then the student reads Leo’s line: I am sad.',
    pages: LEO_STORY.slice(2, 5),
  },
  {
    id: 'wt2-reveal', kind: 'prea1', teacher: 'Reading: Tile Reveal! Who is hiding — and how does the friend feel? Guess early, then read the sentence.',
    scene: {
      id: 'wt2-reveal', kind: 'tile-reveal', bg: bgCircleW, who: 'pip',
      teacher: 'Who is it? How is the friend?',
      rounds: [
        { img: feelSpr('leo-tired'), word: 'tired', line: 'He is tired!', options: [{ label: 'tired', img: feelSpr('leo-tired') }, { label: 'happy', img: feelSpr('pip-happy') }, { label: 'hungry', img: feelSpr('willow-hungry') }] },
        { img: feelSpr('willow-hungry'), word: 'hungry', line: 'She is hungry!', options: [{ label: 'sad', img: feelSpr('mia-sad') }, { label: 'hungry', img: feelSpr('willow-hungry') }, { label: 'angry', img: feelSpr('bella-angry') }] },
        { img: feelSpr('bella-angry'), word: 'angry', line: 'She is angry!', options: [{ label: 'tired', img: feelSpr('leo-tired') }, { label: 'happy', img: feelSpr('pip-happy') }, { label: 'angry', img: feelSpr('bella-angry') }] },
      ],
    },
  },

  /* PHONICS — the sound → Sound Pop → spelling → Blend & Read → tongue twister */
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
    id: 'wt2-balloon', kind: 'save-balloon', bg: bgParkEmpty, who: 'pip', balloonImg: spr('pip'), title: 'Save the Balloon! Spell the word!',
    teacher: 'Reading: listen to the sentence, look at the picture — tap the letters to spell the word. Every right letter lifts Pip’s balloon over the hill!',
    rounds: [
      { word: 'cat', img: I1('cat'), sentence: 'Look! A cat!' },
      { word: 'sad', img: feelSpr('mia-sad'), sentence: 'She is sad.' },
      { word: 'hat', img: I1('hat-green'), sentence: 'My hat is green.' },
      { word: 'bag', img: I1('bag'), sentence: 'This is my bag.' },
    ],
    doneLine: 'The balloon is over the hill! Super spelling!',
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

  /* PRODUCE — real answers about me and my friends */
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
    id: 'wt2-answer-2', kind: 'join-stage', bg: bgFeelingsW, teacher: 'Free: Pip asks about the friends in the picture — the student answers with He is / She is, then asks Pip “How are you?”.', cast: ['pip', 'marigold'],
    turns: [
      { who: 'pip', line: 'Look at Leo. How is he?' },
      { who: 'student', line: 'He is tired.' },
      { who: 'pip', line: 'And Willow? How is she?' },
      { who: 'student', line: 'She is hungry. How are you, Pip?' },
      { who: 'pip', line: 'I am happy! Thank you!' },
    ],
  },

  /* CHECK AND GOODBYE */
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
    id: 'wt2-pet-pal', kind: 'pet-pal', bg: bgParkEmpty, who: 'pip', title: 'Pet Pal: Biscuit',
    teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
    pet: { name: 'Biscuit', img: '/lep1/items/item-dog.png' },
    earlier: [{ label: 'star', img: '/lep1/items/item-star-gold.png' }],
    rounds: [{ line: 'I’m hungry! I want an apple!', choices: [{ label: 'apple', img: '/lep1/items/item-apple.png' }, { label: 'present', img: '/lep1/items/item-gift.png' }, { label: 'green hat', img: '/lep1/items/item-hat-green.png' }], answer: 0, say: 'An apple! Now Biscuit is happy!' }],
    doneLine: 'Biscuit is so happy! See you next time!',
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

  /* EXTRA TIME */
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
    id: 'wt2-quick-feelings', kind: 'prea1', teacher: 'Extra time: quick fire! Say the whole sentence before the ring runs out.',
    scene: {
      id: 'wt2-quick-feelings', kind: 'rapid-recall', bg: bgFeelingsW, who: 'pip', seconds: 5,
      teacher: 'Say it before the ring runs out!',
      cards: [
        { img: feelSpr('pip-happy'), word: 'happy', say: 'He is happy.' },
        { img: feelSpr('mia-sad'), word: 'sad', say: 'She is sad.' },
        { img: feelSpr('leo-tired'), word: 'tired', say: 'He is tired.' },
        { img: feelSpr('willow-hungry'), word: 'hungry', say: 'She is hungry.' },
        { img: feelSpr('bella-angry'), word: 'angry', say: 'She is angry.' },
      ],
    },
  },
  {
    // Owner 2026-10-14: no brain breaks — I Spy (binoculars) with the lesson's sentences instead.
    id: 'wt2-i-spy', kind: 'i-spy', bg: bgFeelingsW, who: 'pip',
    teacher: 'Extra time (Guided): I Spy! Pip gives a clue — the student moves the binoculars to the friend and says the sentence: He is tired.',
    rounds: [
      { clue: 'I spy a friend who is tired.', spot: { left: 41.8, top: 60, r: 6 }, answer: 'Leo! He is tired.' },
      { clue: 'I spy a friend who is hungry.', spot: { left: 72, top: 70, r: 5 }, answer: 'Willow! She is hungry.' },
      { clue: 'I spy a friend who is angry.', spot: { left: 62, top: 63, r: 4.5 }, answer: 'Bella! She is angry.' },
      { clue: 'I spy a friend who is happy.', spot: { left: 30.5, top: 60, r: 6 }, answer: 'Pip! He is happy.' },
    ],
    doneLine: 'You spied them all!',
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
  /* WARM-UP */
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
  /* PRESENT 1 — numbers 1-20 */
  {
    id: 'wt3-numbers-1-10', kind: 'prea1', teacher: 'Present: count 1 to 10 with Pip — tap each number, say it, show it with your fingers.',
    scene: { id: 'wt3-numbers-1-10', kind: 'numbers-learn', bg: bgL1Party, who: 'pip', from: 1, to: 10, teacher: 'Tap each number, listen and say it. Show it with your fingers!' },
  },
  {
    id: 'wt3-numbers-11-20', kind: 'prea1', teacher: 'Present: the new numbers 11 to 20. Stretch and clap the end: four-TEEN! Then twenty.',
    scene: { id: 'wt3-numbers-11-20', kind: 'numbers-learn', bg: bgL1Party, who: 'mia', from: 11, to: 20, teacher: 'New numbers! Tap each one, listen and say it: eleven, twelve, thirteen…' },
  },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'wt3-number-match', kind: 'picture-match', look: 'cards', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each word and drags it under its picture (or taps the word, then the picture), then reads it aloud.',
    items: [
      { word: 'eleven', emoji: '11' },
      { word: 'thirteen', emoji: '13' },
      { word: 'fifteen', emoji: '15' },
      { word: 'sixteen', emoji: '16' },
      { word: 'eighteen', emoji: '18' },
      { word: 'twenty', emoji: '20' },
    ],
    bg: bgL1Party,
  },
  /* CONTROLLED PRACTICE 1 — hear, find and say the numbers */
  {
    id: 'wt3-number-tap', kind: 'prea1', teacher: 'Guided: Number Tap! Pip says a number from 1 to 20 — tap it and say it.',
    scene: { id: 'wt3-number-tap', kind: 'numbers-review', bg: bgL1Party, who: 'pip', from: 1, to: 20, teacher: 'Tap the number Pip says!' },
  },
  {
    id: 'wt3-count-balloons', kind: 'prea1', teacher: 'Guided: count to 20! Pop the balloons one by one and count with Pip.',
    scene: { id: 'wt3-count-balloons', kind: 'count-balloons', bg: '/lep1/scenes/bg-l4-plain-sky.jpg', who: 'pip', total: 20, teacher: 'Twenty balloons! Pop them one by one and count with Pip!' },
  },
  {
    id: 'wt3-number-train', kind: 'prea1', teacher: 'Guided: look at the number train — say each number — then one car is empty. Which number is missing?',
    scene: {
        id: 'wt3-number-train', kind: 'train-recall', bg: bgL1Circle, teacher: 'Guided: look at the number train — say each number — then one car is empty. Which number is missing?',
      question: 'Choo choo! One car is empty. Which number is missing?',
      cars: [
        { word: 'TWELVE', emoji: '1\u{FE0F}\u{20E3}2\u{FE0F}\u{20E3}' },
        { word: 'FIFTEEN', emoji: '1\u{FE0F}\u{20E3}5\u{FE0F}\u{20E3}' },
        { word: 'EIGHTEEN', emoji: '1\u{FE0F}\u{20E3}8\u{FE0F}\u{20E3}' },
        { word: 'TWENTY', emoji: '2\u{FE0F}\u{20E3}0\u{FE0F}\u{20E3}' },
      ],
    },
  },
  {
    id: 'wt3-red-green', kind: 'red-green', bg: bgParkEmpty, who: 'pip', runner: spr('pip'), title: 'Red Light, Green Light!',
    teacher: 'Listening race: on green, the student taps the number they hear and Pip runs that many steps. On red — freeze! Do not tap until it turns green.',
    cards: [{ label: '2' }, { label: '3' }, { label: '4' }, { label: '5' }],
    rounds: [
      { light: 'green', say: 'Green light! Three steps!', answer: 1, steps: 3 },
      { light: 'red', say: 'Red light! Stop!' },
      { light: 'green', say: 'Green light! Two steps!', answer: 0, steps: 2 },
      { light: 'green', say: 'Green light! Four steps!', answer: 2, steps: 4 },
      { light: 'red', say: 'Red light! Freeze!' },
      { light: 'green', say: 'Green light! Five steps!', answer: 3, steps: 5 },
    ],
    doneLine: 'Pip is at the flag! Great listening!',
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
  /* PRESENT 2 — How old are you? I am seven. */
  { id: 'wt3-how-old', kind: 'meet', focus: ['How old'], bg: leoStory(3), who: 'leo', cardSide: 'left', teacher: 'Present: listen to Leo. Show seven fingers and say: I am seven!', line: 'How old are you? I am seven!', repeat: 'I am seven!' },
  { id: 'wt3-birthday', kind: 'meet', focus: ['birthday'], bg: '/lep1/scenes/bg-l4-birthday-party.jpg', who: 'mia', cardSide: 'left', teacher: 'Present: a birthday! Point to the cake. Today Mia is six.', line: 'It’s my birthday! I am six today!', repeat: 'Happy birthday!' },
  { id: 'wt3-echo', kind: 'echo', bg: bgL1Peers, who: 'pip', textSide: 'top', teacher: 'Guided: say the question with Pip.', word: 'How old are you?' },
  { id: 'wt3-echo-age', kind: 'echo', bg: bgL1Circle, who: 'leo', textSide: 'top', teacher: 'Guided: answer like Leo — a whole sentence, loud and proud.', word: 'I am seven years old.' },
  /* CONTROLLED PRACTICE 2 — ages in sentences */
  {
    id: 'wt3-age-balloons', kind: 'prea1', teacher: 'Guided: tap a friend, count their birthday balloons, then say: Mia is six!',
    scene: {
      id: 'wt3-age-balloons', kind: 'age-balloons', bg: '/lep1/scenes/bg-l4-plain-sky.jpg', teacher: 'Tap a friend! Count the balloons, then say: Mia is six!',
      friends: [{ who: 'mia', age: 6 }, { who: 'leo', age: 7 }, { who: 'pip', age: 8 }, { who: 'bella', age: 9 }],
    },
  },
  {
    id: 'wt3-candle-cake', kind: 'prea1', teacher: 'Guided: listen to the age, tap that many candles, then say it: She is six!',
    scene: {
      id: 'wt3-candle-cake', kind: 'candle-cake', bg: '/lep1/scenes/bg-l4-cake-stage.jpg', who: 'mia', teacher: 'Listen to the age, then put that many candles on the cake!',
      rounds: [
        { asker: 'mia', target: 6, prompt: 'I am six! Put six candles on my cake!', celebrate: 'Six candles! Mia is six!' },
        { asker: 'leo', target: 7, prompt: 'I am seven! Put seven candles on my cake!', celebrate: 'Seven candles! Leo is seven!' },
        { asker: 'pip', target: 8, prompt: 'I am eight! Put eight candles on my cake!', celebrate: 'Eight candles! Pip is eight!' },
        { asker: 'pip', target: 0, isStudent: true, prompt: 'Your turn! How old are you? Put your candles on the cake and blow!', celebrate: 'Happy birthday to you!' },
      ],
    },
  },
  {
    id: 'wt3-age-match', kind: 'prea1', teacher: 'Reading: read each sentence and drag it to the right friend. Then read it aloud.',
    scene: {
      id: 'wt3-age-match', kind: 'age-sentence-match', bg: '/lep1/scenes/bg-l4-plain-sky.jpg', teacher: 'Read the sentence and drag it to the friend!',
      friends: [{ who: 'mia', age: 6 }, { who: 'leo', age: 7 }, { who: 'pip', age: 8 }],
    },
  },
  /* READING — Leo’s story */
  {
    id: 'wt3-reader', kind: 'reader', bg: bgL1Reading, title: 'Leo’s First Day: How old are you?', doneLine: 'Leo is seven and Pip is eight. Next time: Leo’s red cap!',
    teacher: 'Reading: listen while the words light up, then the student reads Leo’s and Pip’s lines.',
    pages: [
      { img: leoStory(3), lines: [{ who: 'pip', text: 'How old are you, Leo?' }, { who: 'leo', text: 'I am seven. How old are you?' }] },
      { img: leoStory(2), lines: [{ who: 'pip', text: 'I am eight!' }, { who: 'leo', text: 'Eight? Wow!' }] },
    ],
  },
  /* PHONICS — the sound → Sound Mole → Blend & Read → tongue twister */
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
  {
    id: 'wt3-count-break-2', kind: 'prea1', teacher: 'Brain break: count and move — up to twenty!',
    scene: {
      id: 'wt3-count-break-2', kind: 'tpr-actions', mode: 'break', bg: bgL1Circle, who: 'mia', teacher: 'Count and move!',
      rounds: [
        { line: 'Clap eleven times! One, two, three…', emoji: '\u{1F44F}' },
        { line: 'Stamp fifteen times!', emoji: '\u{1F9B6}' },
        { line: 'Jump and count to twenty!', emoji: '\u{1F998}' },
        { line: 'Show me your age with your fingers!', emoji: '\u{1F590}\u{FE0F}' },
      ],
    },
  },
  /* FREE PRACTICE — the student asks and answers in games */
  {
    id: 'wt3-age-quiz', kind: 'prea1', teacher: 'Free: tap a wobbly present and ASK “How old are you?” — then guess the friend’s age. At the end, tap your own age and say it.',
    scene: {
      id: 'wt3-age-quiz', kind: 'age-quiz', bg: '/lep1/scenes/bg-l4-birthday-party.jpg', teacher: 'Ask “How old are you?” and guess!',
      friends: [
        { who: 'mia', age: 6 },
        { who: 'leo', age: 7 },
        { who: 'pip', age: 8 },
        { who: 'bella', age: 9 },
      ],
      studentAges: [5, 6, 7, 8, 9, 10],
    },
  },
  {
    id: 'wt3-treasure-islands', kind: 'grid-hunt', bg: '/lep1/scenes/bg-u10l2-beach-empty-wide.png', who: 'pip', title: 'Treasure Islands',
    teacher: 'Game: answer to earn a dive. The student says a square — B three! — and taps it. Splash or treasure? Find all three treasures.',
    treasures: ['B2', 'D3', 'A4'],
    rounds: [
      { ask: 'What comes after twelve?', choices: ['eleven', 'thirteen', 'twenty'], answer: 1 },
      { ask: 'How old are you?', choices: ['I’m fine, thank you.', 'I’m seven years old.', 'My name is Pip.'], answer: 1 },
      { ask: 'What comes before eleven?', choices: ['twelve', 'ten', 'seventeen'], answer: 1 },
      { ask: 'Ten candles! How old is Pip?', choices: ['He’s ten.', 'He’s two.', 'He’s twelve.'], answer: 0 },
      { ask: 'What comes after fifteen?', choices: ['fourteen', 'sixteen', 'sixty'], answer: 1 },
      { ask: 'What comes before twenty?', choices: ['nineteen', 'eighteen', 'twelve'], answer: 0 },
      { ask: 'What comes after seventeen?', choices: ['eighteen', 'seventy', 'sixteen'], answer: 0 },
      { ask: 'How old is Mia? She’s …', choices: ['eight years old.', 'eight name.', 'eight fine.'], answer: 0 },
    ],
    doneLine: 'You found all the treasure!',
  },
  /* PRODUCE — real answers, the birthday interview */
  {
    id: 'wt3-your-age', kind: 'join-stage', bg: bgL1Circle, teacher: 'Free: Miss Marigold asks — the student answers with their real age, then asks her.', cast: ['marigold', 'pip'],
    turns: [
      { who: 'marigold', line: 'Hello! How old are you?' },
      { who: 'student', line: 'I am … How old are you?' },
      { who: 'marigold', line: 'I am fifty! Ha ha! How old is Pip?' },
      { who: 'student', line: 'He is eight!' },
    ],
  },
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
  /* CHECK AND GOODBYE */
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
    id: 'wt3-pet-pal', kind: 'pet-pal', bg: bgParkEmpty, who: 'pip', title: 'Pet Pal: Biscuit',
    teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
    pet: { name: 'Biscuit', img: '/lep1/items/item-dog.png' },
    earlier: [{ label: 'star', img: '/lep1/items/item-star-gold.png' }, { label: 'apple', img: '/lep1/items/item-apple.png' }],
    rounds: [{ line: 'It’s my birthday! I’m two! I want a cake!', choices: [{ label: 'cookie', img: '/lep1/items/item-cookie.png' }, { label: 'cake', img: '/lep1/items/item-cake.png' }, { label: 'apple', img: '/lep1/items/item-apple.png' }], answer: 1, say: 'A birthday cake! Happy birthday, Biscuit!' }],
    doneLine: 'Biscuit is so happy! See you next time!',
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
  /* EXTRA TIME */
  {
    id: 'wt3-age-buzzer', kind: 'prea1', teacher: 'Extra time: Age Buzzer Show! Listen to the question, buzz the right friend, then say the sentence.',
    scene: {
      id: 'wt3-age-buzzer', kind: 'buzzer-show', bg: bgL1Stage, who: 'pip',
      teacher: 'Who is it? Press the right buzzer, then say it!',
      intro: 'How old are they? Press the buzzer!',
      podiums: [{ x: 22.8, y: 72.5, by: 55.5 }, { x: 49.5, y: 72.5, by: 55.5 }, { x: 76.3, y: 72.5, by: 55.5 }],
      faces: [
        { label: 'Mia', name: 'Mia', img: spr('mia') },
        { label: 'Leo', name: 'Leo', img: spr('leo') },
        { label: 'Pip', name: 'Pip', img: spr('pip') },
        { label: 'Bella', name: 'Bella', img: spr('bella') },
      ],
      rounds: [
        { faces: [0, 1, 2], answer: 1, line: 'Who is seven?', reply: 'Yes! Leo is seven!', say: 'Leo is seven.' },
        { faces: [3, 2, 0], answer: 2, line: 'Who is six?', reply: 'Yes! Mia is six!', say: 'Mia is six.' },
        { faces: [1, 3, 2], answer: 1, line: 'Who is nine?', reply: 'Yes! Bella is nine!', say: 'Bella is nine.' },
        { faces: [2, 0, 3], answer: 0, line: 'Who is eight?', reply: 'Yes! Pip is eight!', say: 'Pip is eight.' },
      ],
      doneLine: 'Age champion!',
    },
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
  { id: 'wt4-this-is-she', kind: 'meet', focus: ['This is my friend'], bg: leoStory(6), who: 'leo', cardSide: 'left', teacher: 'Present: a girl friend — This is my friend Bella. She is nine.', line: 'Pip, this is my friend Bella. She is nine.', repeat: 'This is my friend Bella.' },
  { id: 'wt4-echo', kind: 'echo', bg: bgL1Peers, who: 'leo', textSide: 'top', teacher: 'Guided: the answer — say it with Leo.', word: 'Nice to meet you, too!' },
  { id: 'wt4-echo-friend', kind: 'echo', bg: bgL1Peers, who: 'pip', textSide: 'top', teacher: 'Guided: point to a friend and say it with Pip.', word: 'This is my friend.' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'wt4-friend-match', kind: 'picture-match', look: 'frames', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps it, then the picture), then reads it aloud.',
    items: [
      { word: 'This is my friend Leo.', img: spr('leo') },
      { word: 'This is my friend Mia.', img: spr('mia') },
      { word: 'This is my friend Bella.', img: spr('bella') },
      { word: 'This is my friend Willow.', img: spr('willow') },
    ],
    bg: bgL1Peers,
  },
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
    id: 'wt4-photo', kind: 'prea1', teacher: 'Guided: Friends Photo! Pip introduces a friend; the student taps that friend to take the photo and says: This is my friend …! The friends swap places — listen to the name.',
    scene: {
      id: 'wt4-photo', kind: 'photo-snap', bg: bgParkEmpty, who: 'pip',
      teacher: 'Listen! Take a photo of the friend Pip says.',
      spots: [
        { x: 16, y: 86, size: 15 },
        { x: 38, y: 74, size: 13 },
        { x: 62, y: 76, size: 13 },
        { x: 84, y: 88, size: 15 },
      ],
      animals: [
        { label: 'Leo', img: spr('leo'), say: 'This is my friend Leo!' },
        { label: 'Mia', img: spr('mia'), say: 'This is my friend Mia!' },
        { label: 'Bella', img: spr('bella'), say: 'This is my friend Bella!' },
        { label: 'Willow', img: spr('willow'), say: 'This is my friend Willow!' },
      ],
      rounds: [
        { target: 1, line: 'Snap! Take a photo of Mia!', place: [0, 1, 2, 3] },
        { target: 0, line: 'Now take a photo of Leo!', place: [3, 2, 1, 0] },
        { target: 3, line: 'Now Willow!', place: [1, 3, 0, 2] },
        { target: 2, line: 'And Bella! Snap!', place: [2, 0, 3, 1] },
      ],
      doneLine: 'Great photos! These are my friends!',
    },
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
    id: 'wt4-hide-seek', kind: 'prea1', teacher: 'Free: hide and seek! The student ASKS "Is it Mia?" at each hiding place, then taps to look. Leo is hiding somewhere — when they find him: This is my friend Leo!',
    scene: {
      id: 'wt4-hide-seek', kind: 'lift-flap', bg: bgParkEmpty, who: 'pip', guided: true, whatPrompt: 'Who is it?',
      teacher: 'Where is Leo? Ask at each place, then look!',
      question: 'Where is my friend Leo?',
      notYet: 'Not yet! Look in the other places first!',
      spots: [
        { x: 16, y: 74, size: 17, ask: 'Is it Leo?', reveal: 'No! This is Mia!', cover: { img: '/lep1/items/item-bench.png', label: 'bench' }, under: { img: spr('mia'), label: 'Mia' } },
        { x: 40, y: 72, size: 14, ask: 'Is it Leo?', reveal: 'No! This is Bella!', cover: { img: '/lep1/items/item-gift.png', label: 'present' }, under: { img: spr('bella'), label: 'Bella' } },
        { x: 62, y: 76, size: 16, ask: 'Is it Leo?', reveal: 'No! This is Willow!', cover: { img: '/lep1/items/item-slide.png', label: 'slide' }, under: { img: spr('willow'), label: 'Willow' } },
        { x: 86, y: 62, size: 14, ask: 'Is it Leo?', reveal: 'Yes! This is my friend Leo!', target: true, under: { img: spr('leo'), label: 'Leo' } },
      ],
    },
  },
  {
    id: 'wt4-whisper-tube', kind: 'whisper-tube', bg: bgParkEmpty, who: 'pip', title: 'Whisper Tube',
    teacher: 'Listening game: a friend whispers a sentence down the tube; the other friend gets ONE word wrong. The student taps the wrong word, picks the right one and says the whole sentence.',
    rounds: [
      { from: 'pip', to: 'mia', fromImg: spr('pip'), toImg: spr('mia'), said: 'This is Leo. He is my friend.', heard: 'This is Leo. He is my fish.', choices: ['frog'] },
      { from: 'mia', to: 'bella', fromImg: spr('mia'), toImg: spr('bella'), said: 'Nice to meet you!', heard: 'Nice to eat you!', choices: ['seat'] },
      { from: 'bella', to: 'willow', fromImg: spr('bella'), toImg: spr('willow'), said: 'She is seven years old.', heard: 'She is seven pears old.', choices: ['bears'] },
      { from: 'willow', to: 'leo', fromImg: spr('willow'), toImg: spr('leo'), said: 'How are you, Pip?', heard: 'How are you, Pig?', choices: ['Leo'] },
    ],
    doneLine: 'Great listening! No more mix-ups!',
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
    id: 'wt4-dominoes', kind: 'dominoes', bg: bgL1Class, who: 'pip', title: 'Friend Dominoes!',
    teacher: 'Reading: look at the friend at the end of the chain — find the domino that introduces them, read it aloud and play it.',
    start: { img: spr('leo'), label: 'Leo' },
    steps: [
      { text: 'This is Leo. He is seven.', img: spr('mia'), label: 'Mia' },
      { text: 'This is Mia. She is six.', img: spr('bella'), label: 'Bella' },
      { text: 'This is Bella. She is nine.', img: spr('pip'), label: 'Pip' },
      { text: 'This is Pip. He is eight.', img: spr('willow'), label: 'Willow' },
      { text: 'This is Willow. Nice to meet you!', img: I1('gift'), label: 'present' },
    ],
    doneLine: 'The chain is finished! You know all the friends!',
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
  {
    id: 'wt4-draw-path', kind: 'prea1', teacher: 'Guided: listen and draw! Draw a line from Pip to the friend he says. Pip walks the line and introduces them.',
    scene: {
      id: 'wt4-draw-path', kind: 'draw-path', bg: bgPartyEmpty, who: 'pip', walker: 'pip',
      teacher: 'Draw a line from Pip to the friend he says!',
      start: { x: 8, y: 88 },
      spots: [
        { label: 'Mia', img: spr('mia'), x: 30, y: 52, size: 10 },
        { label: 'Leo', img: spr('leo'), x: 52, y: 60, size: 10 },
        { label: 'Bella', img: spr('bella'), x: 72, y: 54, size: 10 },
        { label: 'Willow', img: spr('willow'), x: 88, y: 80, size: 10 },
      ],
      rounds: [
        { line: 'Take Pip to his friend Bella!', target: 2, reply: 'Hello, Bella! This is my friend Pip!' },
        { line: 'Now take Pip to Leo!', target: 1, reply: 'Hi, Leo! Nice to meet you!' },
        { line: 'Now take Pip to Willow!', target: 3, reply: 'Hello, Willow! Nice to meet you!' },
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
  {
    id: 'wt4-balloon-match', kind: 'balloon-match', bg: bgParkEmpty, who: 'pip', title: 'Balloon Match: who is it?',
    teacher: 'Reading game: the student reads a balloon (tap it to hear it), then taps the friend it belongs to. The balloon floats down and pops!',
    pairs: [
      { text: 'This is Mia.', img: spr('mia'), label: 'Mia' },
      { text: 'This is Leo.', img: spr('leo'), label: 'Leo' },
      { text: 'This is Bella.', img: spr('bella'), label: 'Bella' },
      { text: 'This is Pip.', img: spr('pip'), label: 'Pip' },
    ],
    doneLine: 'Pop, pop! You can read their names!',
  },
  { id: 'wt4-jigsaw', kind: 'jigsaw-puzzle', bg: bgL1Reading, teacher: 'Build the story picture — then tell it!', image: leoStory(6), rows: 2, cols: 3 },
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
  {
    id: 'wt4-letter-bubbles', kind: 'letter-bubbles', bg: bgParkEmpty, who: 'pip', title: 'Letter Bubbles: F words',
    teacher: 'Spelling game: look at the picture, then pop the bubbles in order to spell the word. Say the word at the end.',
    words: [
      { word: 'fox', img: spr('pip'), say: 'Fox! Pip is a fox.' },
      { word: 'fish', img: I1('fish'), say: 'Fish! It’s a fish.' },
      { word: 'friend', img: spr('mia'), say: 'Friend! This is my friend.' },
    ],
    doneLine: 'Pop, pop, pop! You can spell!',
  },
  { id: 'wt4-twister', kind: 'tongue-twister', look: 'town', speeds: 2, bg: bgL1Reading, who: 'willow', focus: 'f', teacher: 'Reading: quick reading! Listen to Willow, then say it slow, then faster.', line: 'Fun Fred finds a frog.' },
  {
    id: 'wt4-meet-teacher', kind: 'join-stage', bg: bgL1Class, teacher: 'Free: the student introduces Pip to Miss Marigold, the new teacher.', cast: ['pip', 'marigold'],
    turns: [
      { who: 'pip', line: 'Who is that? I don’t know her!' },
      { who: 'student', line: 'Miss Marigold, this is my friend Pip.' },
      { who: 'marigold', line: 'Hello, Pip! Nice to meet you!' },
      { who: 'pip', line: 'Nice to meet you, too!' },
      { who: 'student', line: 'He is eight. He is happy!' },
    ],
  },
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
    id: 'wt4-pet-pal', kind: 'pet-pal', bg: bgParkEmpty, who: 'pip', title: 'Pet Pal: Biscuit',
    teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
    pet: { name: 'Biscuit', img: '/lep1/items/item-dog.png' },
    earlier: [{ label: 'star', img: '/lep1/items/item-star-gold.png' }, { label: 'apple', img: '/lep1/items/item-apple.png' }, { label: 'cake', img: '/lep1/items/item-cake.png' }],
    rounds: [{ line: 'This is my friend! We want a ball!', choices: [{ label: 'ball', img: '/lep1/items/item-ball-red.png' }, { label: 'balloon', img: '/lep1/items/item-balloon-red.png' }, { label: 'banana', img: '/lep1/items/item-banana.png' }], answer: 0, say: 'A ball! Nice to meet you!' }],
    doneLine: 'Biscuit is so happy! See you next time!',
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
    id: 'wt4-break-2', kind: 'prea1', teacher: 'Brain break: a friends dance with Pip.',
    scene: {
      id: 'wt4-break-2', kind: 'tpr-actions', mode: 'break', bg: bgL1Party, who: 'pip', teacher: 'Dance with your friends!',
      rounds: [
        { line: 'Clap two times for your friend!', emoji: '\u{1F44F}' },
        { line: 'Give a high five: Nice to meet you!', emoji: '\u{1F64C}' },
        { line: 'Turn around and wave: Hello, friends!', emoji: '\u{1F44B}' },
      ],
    },
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
  { id: 'wt5-echo-lost', kind: 'echo', bg: leoStory(4), who: 'leo', textSide: 'top', teacher: 'Guided: say it with Leo — a sad face, a sad voice.', word: 'My red cap is lost!' },
  { id: 'wt5-sight-words', kind: 'vocab-spot', bg: leoStory(9), teacher: 'Present: the last story words. Tap each arrow, listen and read the word.',
    items: [
      { label: 'Look!', sentence: 'Look! The cap is on the cat!', emoji: '\u{1F440}', left: '18%', top: '30%', color: '#B85CD1', who: 'mia' },
      { label: 'the', sentence: 'The cap is on the cat.', emoji: '\u{1F9E2}', left: '45%', top: '40%', color: '#FE6A2F', who: 'pip' },
      { label: 'now', sentence: 'I am happy now!', emoji: '\u{1F60A}', left: '62%', top: '30%', color: '#C97A2F', who: 'leo' },
      { label: 'see you', sentence: 'See you tomorrow!', emoji: '\u{1F44B}', left: '82%', top: '35%', color: '#4FA9E0', who: 'pip' },
    ],
  },
  { id: 'wt5-thank-you', kind: 'meet', focus: ['Thank you'], bg: leoStory(10), who: 'leo', cardSide: 'left', teacher: 'Present: when friends help, we say Thank you! Hands on the heart and say it.', line: 'My cap! Thank you, friends!', repeat: 'Thank you!' },
  // Owner 2026-10-13/14: after the words, Read and Match (A1), then the next game.
  {
    id: 'wt5-story-match', kind: 'picture-match', look: 'polaroids', prompt: 'Read and match',
    teacher: 'Read and match: the student reads each sentence and drags it under its picture (or taps it, then the picture), then reads it aloud.',
    items: [
      { word: 'My red cap is lost!', img: leoStory(4), crop: { x: 0, y: 0, w: 100, h: 100 }, imgAspect: 16 / 9 },
      { word: 'Look! The cap!', img: leoStory(9), crop: { x: 0, y: 0, w: 100, h: 100 }, imgAspect: 16 / 9 },
      { word: 'My cap! Thank you, friends!', img: leoStory(10), crop: { x: 0, y: 0, w: 100, h: 100 }, imgAspect: 16 / 9 },
    ],
    bg: bgL1Peers,
  },
  /* Reading: the whole book */
  {
    id: 'wt5-book', kind: 'reader', bg: bgL1Reading, title: 'Leo’s First Day', doneLine: 'Where is the red cap? Let’s guess — then read on!',
    teacher: 'Reading: the book, part 1. Listen and follow the light on every page; the student reads the pages they know on their own.',
    pages: LEO_STORY.slice(0, 6),
  },
  {
    id: 'wt5-guess', kind: 'choice', bg: leoStory(6), who: 'pip', prompt: 'Who has Leo’s red cap? Guess!',
    teacher: 'Guided: stop and guess before page 7! Every guess is fine — the student says: I think … has the cap! Then read on and check.',
    options: [
      { label: 'Bella', emoji: '\u{1F430}', correct: true },
      { label: 'Willow', emoji: '\u{1F426}', correct: true },
      { label: 'the cat', emoji: '\u{1F431}', correct: true },
    ],
  },
  {
    id: 'wt5-book-2', kind: 'reader', bg: bgL1Reading, title: 'Leo’s First Day', doneLine: 'The end! Leo found his cap — and new friends!',
    teacher: 'Reading: part 2 — was your guess right? Listen, then the student reads Mia’s and Leo’s lines.',
    pages: LEO_STORY.slice(6),
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
    id: 'wt5-whos-missing', kind: 'prea1', teacher: 'Guided: the story friends on the photo wall — lights off! Who is missing? Say: Bella is missing!',
    scene: {
      id: 'wt5-whos-missing', kind: 'whos-missing', bg: leoStory(10), who: 'pip',
      teacher: 'Look at the story friends. Lights off! Who is missing?',
      faces: [
        { label: 'Leo', name: 'Leo', img: spr('leo'), at: [50, 26] as [number, number], w: 78, aspect: 419 / 538 },
        { label: 'Mia', name: 'Mia', img: spr('mia'), at: [50, 26] as [number, number], w: 78, aspect: 500 / 579 },
        { label: 'Bella', name: 'Bella', img: spr('bella'), at: [50, 36] as [number, number], w: 90, aspect: 353 / 646 },
        { label: 'Willow', name: 'Willow', img: spr('willow'), at: [50, 26] as [number, number], w: 78, aspect: 492 / 617 },
        { label: 'Pip', name: 'Pip', img: spr('pip'), at: [50, 26] as [number, number], w: 78, aspect: 441 / 581 },
      ],
      rounds: [
        { wall: [0, 1, 2], missing: 2, options: [2, 3, 4] },
        { wall: [4, 0, 3, 1], missing: 0, options: [1, 0, 2] },
        { wall: [2, 3, 1, 4], missing: 3, options: [3, 4, 0] },
      ],
      doneLine: 'Everyone is back! Hello, friends!',
    },
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
    id: 'wt5-crossword', kind: 'crossword', bg: bgL1Reading, who: 'pip', title: 'Picture Crossword',
    teacher: 'Spelling game: tap a picture, then tap the letters to fill its squares. Crossing letters help! Say each word when it is done.',
    words: [
      { word: 'cap', img: I1('cap'), say: 'Cap! Leo’s red cap.' },
      { word: 'red', img: I1('balloon-red'), say: 'Red! The cap is red.' },
      { word: 'sad', img: feelSpr('mia-sad'), say: 'Sad! Mia is sad.' },
      { word: 'happy', img: feelSpr('pip-happy'), say: 'Happy! Pip is happy.' },
      { word: 'teacher', img: spr('marigold'), say: 'Teacher! Miss Marigold is our teacher.' },
    ],
    doneLine: 'You did the whole crossword!',
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
    id: 'wt5-cap-radar', kind: 'hot-cold', bg: bgL1Class, who: 'pip', title: 'Treasure Radar: where is it?',
    teacher: 'Warm-up game: something is hidden in the classroom. The student taps to search and listens — Cold! Warm! Hot! When it pops out, they say the sentence.',
    rounds: [
      { label: 'red cap', img: I1('cap'), x: 24, y: 47, find: 'Where is Leo’s red cap? Find it!', say: 'Here it is! It’s Leo’s red cap!' },
      { label: 'book', img: I1('book'), x: 90, y: 72, find: 'Where is the book? Find it!', say: 'Here it is! It’s a book!' },
      { label: 'bag', img: I1('bag'), x: 7, y: 80, find: 'Where is Leo’s bag? Find it!', say: 'Here it is! It’s Leo’s bag!' },
    ],
    doneLine: 'You found everything! Thank you!',
  },
  {
    id: 'wt5-mystery-bag', kind: 'prea1', teacher: 'Guided: What is in the bag? Look at the shape — tap it — then say it with its colour: It’s a red cap!',
    scene: {
      id: 'wt5-mystery-bag', kind: 'mystery-bag', bg: bgL1Reading, who: 'leo',
      question: 'What is in the bag?', doneText: 'You found all the story things!',
      teacher: 'Look at the shape. What is in the bag? Tap it and say it!',
      rounds: [
        { img: I1('cap'), toyWord: 'CAP', colorWord: 'RED', colorHex: '#E53935', options: [{ toyWord: 'CAP', img: I1('cap') }, { toyWord: 'CAT', img: I1('cat') }, { toyWord: 'FAN', img: I1('fan') }] },
        { img: I1('cat'), toyWord: 'CAT', colorWord: 'ORANGE', colorHex: '#FB8C00', options: [{ toyWord: 'HAT', img: I1('hat-green') }, { toyWord: 'CAT', img: I1('cat') }, { toyWord: 'CAP', img: I1('cap') }] },
        { img: I1('book'), toyWord: 'BOOK', colorWord: 'BLUE', colorHex: '#1E88E5', options: [{ toyWord: 'CAT', img: I1('cat') }, { toyWord: 'SUN', img: I1('sun') }, { toyWord: 'BOOK', img: I1('book') }] },
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
  {
    id: 'wt5-retell', kind: 'join-stage', bg: leoStory(9), teacher: 'Free: the student tells the story to Pip with the pictures — first, then, at the end. Help with one word at a time.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'I missed the story! Who is new?' },
      { who: 'student', line: 'Leo is new. He is sad. His red cap is lost.' },
      { who: 'pip', line: 'Oh no! And then?' },
      { who: 'student', line: 'Bella says: Look! A red cap! But it’s Willow’s hat.' },
      { who: 'pip', line: 'Where is the cap?' },
      { who: 'student', line: 'The cap is on the cat! Leo is happy now.' },
    ],
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
  { id: 'wt5-echo-thanks', kind: 'echo', bg: leoStory(10), who: 'leo', textSide: 'top', teacher: 'Guided: say it with Leo — a happy face, a happy voice!', word: 'Thank you! I am happy now!' },
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
    id: 'wt5-pet-pal', kind: 'pet-pal', bg: bgParkEmpty, who: 'pip', title: 'Pet Pal: Biscuit',
    teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
    pet: { name: 'Biscuit', img: '/lep1/items/item-dog.png' },
    earlier: [{ label: 'star', img: '/lep1/items/item-star-gold.png' }, { label: 'apple', img: '/lep1/items/item-apple.png' }, { label: 'cake', img: '/lep1/items/item-cake.png' }, { label: 'ball', img: '/lep1/items/item-ball-red.png' }],
    rounds: [{ line: 'Leo’s cap is red. I want a hat, please!', choices: [{ label: 'star', img: '/lep1/items/item-star-gold.png' }, { label: 'hat', img: '/lep1/items/item-hat.png' }, { label: 'trophy', img: '/lep1/items/item-banana-trophy.png' }], answer: 1, say: 'A hat! Thank you!' }],
    doneLine: 'Biscuit is so happy! See you next time!',
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
    id: 'wt5-act-break', kind: 'prea1', teacher: 'Brain break: act the story with your body — sad, look, find, happy!',
    scene: {
      id: 'wt5-act-break', kind: 'tpr-actions', mode: 'break', bg: leoStory(5), who: 'leo', teacher: 'Act the story!',
      rounds: [
        { line: 'Be sad like Leo: My cap is lost!', emoji: '\u{1F622}' },
        { line: 'Look up and look down: Where is it?', emoji: '\u{1F440}' },
        { line: 'Point: Look! The cap is on the cat!', emoji: '\u{1F449}' },
        { line: 'Jump and smile: I am happy now!', emoji: '\u{1F604}' },
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
  { id: 'wt6-meet-coco', kind: 'meet', focus: ['Let’s play'], bg: bgL1Stage, who: 'pip', cardSide: 'left', teacher: 'Present: it’s Game Day! Today we play with everything from Unit 1 — and at the end a new friend, Coco, wants to meet the student.', line: 'It’s Game Day! Ready? Let’s play!', repeat: 'Let’s play!' },
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
    id: 'wt6-bingo', kind: 'sticker-bingo', bg: bgL1Stage, who: 'pip', title: 'Sticker Bingo! Listen and stamp!',
    teacher: 'Guided: Pip says a sentence — the student stamps the picture, then says the sentence too. Three in a row: Bingo!',
    cells: [
      { label: 'happy', img: feelSpr('pip-happy'), say: 'He is happy.' },
      { label: 'sad', img: feelSpr('mia-sad'), say: 'She is sad.' },
      { label: 'tired', img: feelSpr('leo-tired'), say: 'He is tired.' },
      { label: 'cap', img: I1('cap'), say: 'Leo’s cap is red.' },
      { label: 'ten', img: I1('ten'), say: 'I am ten.' },
      { label: 'hungry', img: feelSpr('willow-hungry'), say: 'She is hungry.' },
      { label: 'cat', img: I1('cat'), say: 'The cap is on the cat.' },
      { label: 'angry', img: feelSpr('bella-angry'), say: 'She is angry.' },
      { label: 'cake', img: I1('cake'), say: 'Happy birthday! I am seven.' },
    ],
    calls: [4, 1, 7, 0, 2, 6, 5],
    doneLine: 'Bingo! You stamped them all!',
  },
  {
    id: 'wt6-shadows', kind: 'prea1', teacher: 'Guided: Who is it? Drag each friend onto their shadow, then introduce them: This is Leo. He is seven.',
    scene: {
      id: 'wt6-shadows', kind: 'shadow-match', bg: bgParkEmpty, who: 'pip',
      teacher: 'Drag each friend to the shadow. Then say: This is …!',
      items: [
        { label: 'Leo', img: spr('leo'), line: 'This is Leo. He is seven.' },
        { label: 'Mia', img: spr('mia'), line: 'This is Mia. She is six.' },
        { label: 'Bella', img: spr('bella'), line: 'This is Bella. She is nine.' },
        { label: 'Willow', img: spr('willow'), line: 'This is Willow. She is happy.' },
        { label: 'Pip', img: spr('pip'), line: 'This is Pip. He is eight.' },
      ],
    },
  },
  { id: 'wt6-echo-quick', kind: 'echo', bg: bgL1Stage, who: 'pip', textSide: 'top', teacher: 'Guided: Game Day voice! Say the questions with Pip — slow, then fast.', word: 'How are you? How old are you?' },
  {
    id: 'wt6-coconut', kind: 'hot-coconut', bg: bgParkEmpty, who: 'pip', title: 'Hot Coconut! Pass it — then answer!',
    teacher: 'Free: tap Pass! — the coconut hops around the circle. Where it stops, the student answers: for themself, or to help a friend. Full sentences!',
    seats: [
      { name: 'You', img: '' },
      { name: 'Mia', img: spr('mia') },
      { name: 'Leo', img: spr('leo') },
      { name: 'Bella', img: spr('bella') },
      { name: 'Willow', img: spr('willow') },
      { name: 'Pip', img: spr('pip') },
    ],
    rounds: [
      { ask: 'How old are you?', choices: ['I am six.', 'I am happy.'], answer: 0, stop: 1 },
      { ask: 'What’s your name?', choices: ['Nice to meet you!', 'My name is …'], answer: 1, stop: 0 },
      { ask: 'How are you?', choices: ['I am fine, thank you.', 'Goodbye!'], answer: 0, stop: 4 },
      { ask: 'Who is this? Point to a friend!', choices: ['This is my friend.', 'I am eight.'], answer: 0, stop: 2 },
      { ask: 'Goodbye!', choices: ['Goodbye! See you!', 'How old are you?'], answer: 0, stop: 0 },
    ],
    doneLine: 'Great passing! Great answers!',
  },
  {
    id: 'wt6-quiz-board', kind: 'quiz-board', bg: bgL1Stage, who: 'marigold', title: 'The Welcome Town Quiz Board!',
    teacher: 'Free: the student picks any tile — harder questions are worth more. Read or answer, then say it aloud. One tile is a BOOM tile: double points!',
    categories: [
      { name: 'Hello', emoji: '\u{1F44B}', tiles: [{ ask: 'What’s your name?', choices: ['My name is Pip.', 'I am six.'], answer: 0 }, { ask: 'Goodbye, Leo!', choices: ['Hello!', 'See you tomorrow!'], answer: 1 }, { ask: 'This is my friend Mia.', choices: ['Nice to meet you!', 'I am tired.'], answer: 0 }] },
      { name: 'Feelings', emoji: '\u{1F60A}', tiles: [{ ask: 'How is she?', choices: ['She is sad.', 'He is happy.'], answer: 0, img: feelSpr('mia-sad') }, { ask: 'How is he?', choices: ['He is hungry.', 'He is tired.'], answer: 1, img: feelSpr('leo-tired') }, { ask: 'How are you?', choices: ['I am fine, thank you.', 'My name is Bella.'], answer: 0 }] },
      { name: 'Numbers', emoji: '\u{1F522}', tiles: [{ ask: 'What number is it?', choices: ['ten', 'six'], answer: 0, img: I1('ten') }, { ask: 'Eighteen, nineteen …', choices: ['twelve', 'twenty'], answer: 1 }, { ask: 'How old is Bella?', choices: ['She is nine.', 'She is sad.'], answer: 0, img: spr('bella') }] },
      { name: 'Story', emoji: '\u{1F4D6}', tiles: [{ ask: 'Who is new?', choices: ['Leo', 'Pip'], answer: 0, img: leoStory(1) }, { ask: 'Where is the cap?', choices: ['On the cat!', 'On the bed!'], answer: 0, img: leoStory(9) }, { ask: 'Whose red hat is it?', choices: ['Willow’s hat', 'Leo’s hat'], answer: 0, img: leoStory(8) }] },
    ],
    boom: [2, 1],
    doneLine: 'The board is finished! Quiz champion!',
  },
  {
    id: 'wt6-build-town', kind: 'world-builder', bg: bgParkEmpty, who: 'pip', title: 'Build Welcome Town!',
    teacher: 'Guided: every right answer builds a piece of Welcome Town. Say the answer aloud — then name the new piece!',
    pieces: [
      { label: 'house', img: I1('house'), x: 24, y: 62, size: 18 },
      { label: 'slide', img: I1('slide'), x: 46, y: 66, size: 14 },
      { label: 'bench', img: I1('bench'), x: 64, y: 70, size: 12 },
      { label: 'lamp', img: I1('lamp'), x: 37, y: 62, size: 6 },
      { label: 'flag', img: I1('flag'), x: 56, y: 50, size: 6 },
      { label: 'rainbow', img: I1('rainbow'), x: 42, y: 32, size: 26 },
    ],
    rounds: [{ ask: 'Hello! What’s your name?', choices: ['My name is …', 'I am seven.'], answer: 0 },
      { ask: 'How are you?', choices: ['I am happy.', 'Goodbye!'], answer: 0 },
      { ask: 'How old are you?', choices: ['Nice to meet you!', 'I am … years old.'], answer: 1 },
      { ask: 'This is my friend Leo.', choices: ['See you!', 'Nice to meet you, Leo!'], answer: 1 },
      { ask: 'Is Leo sad?', choices: ['Yes, he is sad.', 'She is nine.'], answer: 0, img: feelSpr('leo-tired') },
      { ask: 'Goodbye!', choices: ['Goodbye! See you tomorrow!', 'What’s your name?'], answer: 0 }],
    doneLine: 'Look! We built Welcome Town! Hooray!',
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
    id: 'wt6-sort', kind: 'sort-basket', bg: bgL1Circle, title: 'Question or answer?',
    teacher: 'Reading: read each card aloud — is it a question (the voice goes up) or an answer? Put it in the right basket.',
    baskets: [{ label: 'Question ?', emoji: '\u{2753}' }, { label: 'Answer', emoji: '\u{1F4AC}' }],
    items: [
      { word: 'What’s your name?', emoji: '\u{1F3F7}\u{FE0F}', basket: 0 },
      { word: 'I am seven.', emoji: '\u{1F382}', basket: 1 },
      { word: 'How are you?', emoji: '\u{1F60A}', basket: 0 },
      { word: 'My name is Mia.', emoji: '\u{1F42D}', basket: 1 },
      { word: 'How old are you?', emoji: '\u{1F522}', basket: 0 },
      { word: 'I am happy.', emoji: '\u{1F604}', basket: 1 },
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
    id: 'wt6-letter-blocks', kind: 'letter-blocks', bg: bgL1Reading, mode: 'sounds', model: false,
    prompt: 'Build the word — sound by sound!',
    teacher: 'Reading: listen, put the sound blocks in order, blend them and read the word: c-a-p, cap!',
    rounds: [
      { blocks: ['c', 'a', 'p'], word: 'cap', img: I1('cap') },
      { blocks: ['h', 'e', 'n'], word: 'hen', img: I1('hen') },
      { blocks: ['f', 'i', 'sh'], word: 'fish', img: I1('fish') },
      { blocks: ['t', 'o', 'p'], word: 'top', img: I1('top') },
    ],
  },
  {
    id: 'wt6-twister-race', kind: 'tongue-twister', look: 'town', speeds: 3, bg: bgL1Reading, who: 'pip', focus: '',
    teacher: 'Reading: the Twister Race! Read all four — slow, faster, then super fast!',
    line: 'Happy Hen hops. Sad Sam sits. Ten tiny teddies. Fun Fred finds a frog.',
    lines: ['Happy Hen hops.', 'Sad Sam sits.', 'Ten tiny teddies.', 'Fun Fred finds a frog.'],
  },
  {
    id: 'wt6-speed-read', kind: 'reader', noChecks: true, bg: bgL1Reading, title: 'Speed Reading: Leo’s First Day', doneLine: 'Wow! Fast and clear — super reading!',
    teacher: 'Reading: Game Day speed read! The student reads pages 1-4 on their own (🔊 only for help) — then once more, faster.',
    pages: LEO_STORY.slice(0, 4),
  },
  {
    id: 'wt6-odd', kind: 'prea1', teacher: 'Reading: which one is different? Say the words, listen to the first sound — tap the odd one and say why.',
    scene: {
      id: 'wt6-odd', kind: 'odd-one-out', bg: bgPartyEmpty, who: 'willow',
      teacher: 'Say the words. Which one starts with a different sound?',
      rounds: [
        { items: [{ label: 'cap', img: I1('cap') }, { label: 'cat', img: I1('cat') }, { label: 'hat', img: I1('hat-green') }, { label: 'car', img: I1('car') }], odd: 2, line: 'Hat! Hat starts with H. Cap, cat and car start with C.' },
        { items: [{ label: 'fish', img: I1('fish') }, { label: 'sun', img: I1('sun') }, { label: 'fan', img: I1('fan') }, { label: 'frog', img: I1('frog') }], odd: 1, line: 'Sun! Sun starts with S. Fish, fan and frog start with F.' },
        { items: [{ label: 'ten', img: I1('ten') }, { label: 'top', img: I1('top') }, { label: 'teddy', img: I1('teddy') }, { label: 'hen', img: I1('hen') }], odd: 3, line: 'Hen! Hen starts with H. Ten, top and teddy start with T.' },
      ],
    },
  },
  {
    id: 'wt6-wobbly-tower', kind: 'tower-pull', bg: bgPartyEmpty, who: 'pip', title: 'Wobbly Tower',
    teacher: 'Game: the student picks a block and answers its question. Right — the block slides out and goes on top. Wrong — the tower wobbles, try again. It never falls!',
    rounds: [
      { ask: 'What’s your name?', choices: ['My name is Pip.', 'I am fine.', 'Goodbye!'], answer: 0 },
      { ask: 'How are you?', choices: ['I am seven.', 'I am happy!', 'This is Mia.'], answer: 1 },
      { ask: 'How old are you?', choices: ['I am tired.', 'Nice to meet you!', 'I’m eight years old.'], answer: 2 },
      { ask: 'This is Mia. … ?', choices: ['Nice to meet you!', 'How old are you?', 'Goodbye, Mia!'], answer: 0 },
      { ask: 'What comes after fourteen?', choices: ['fifteen', 'forty', 'thirteen'], answer: 0 },
      { ask: 'Leo’s cap is lost. He is …', choices: ['happy.', 'sad.', 'hungry.'], answer: 1 },
      { ask: 'Bella finds the cap. Leo says …', choices: ['Thank you!', 'I am angry!', 'Hello, Leo!'], answer: 0 },
      { ask: 'It’s time to go home. Say …', choices: ['Hello!', 'Goodbye!', 'How are you?'], answer: 1 },
    ],
    doneLine: 'Look! Our tower is so tall! Well done!',
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
    id: 'wt6-letter-match', kind: 'letter-match', bg: bgL1Reading, letters: ['P', 'L', 'M', 'B', 'W'],
    prompt: 'Match the big and small letters — then say a friend’s name!',
    teacher: 'Reading: match each capital letter to its small letter. P is for Pip, L for Leo, M for Mia, B for Bella, W for Willow — names start with a capital letter!',
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
    id: 'wt6-trials', kind: 'prea1', teacher: 'Guided: the Game Day Trials! Three skills — read it, answer it, find it. Win all the badges to get the champion medal.',
    scene: {
      id: 'wt6-trials', kind: 'hero-trials', bg: bgL1Stage, who: 'pip',
      teacher: 'Win the three badges: read it, answer it, find it!',
      hero: { img: spr('pip'), name: 'Pip' }, medal: '\u{1F3C6}',
      skills: [{ key: 'read', label: 'Read it', icon: '\u{1F4D6}' }, { key: 'answer', label: 'Answer it', icon: '\u{1F4AC}' }, { key: 'find', label: 'Find it', icon: '\u{1F50D}' }],
      items: [
        { skill: 'read', ask: 'Read and find: She is sad.', reply: 'Yes! She is sad.', options: [{ label: 'sad', img: feelSpr('mia-sad') }, { label: 'happy', img: feelSpr('pip-happy') }, { label: 'tired', img: feelSpr('leo-tired') }], answer: 0 },
        { skill: 'read', ask: 'Read and find: He is tired.', reply: 'Yes! He is tired.', options: [{ label: 'angry', img: feelSpr('bella-angry') }, { label: 'tired', img: feelSpr('leo-tired') }, { label: 'sad', img: feelSpr('mia-sad') }], answer: 1 },
        { skill: 'answer', ask: 'What’s your name?', reply: 'My name is Pip!', options: [{ label: 'a', text: 'I am six.' }, { label: 'b', text: 'Goodbye!' }, { label: 'c', text: 'My name is Pip.' }], answer: 2 },
        { skill: 'answer', ask: 'Nice to meet you!', reply: 'Nice to meet you, too!', options: [{ label: 'a', text: 'Nice to meet you, too!' }, { label: 'b', text: 'I am sad.' }, { label: 'c', text: 'How old are you?' }], answer: 0 },
        { skill: 'find', ask: 'Find Leo’s red cap!', reply: 'The red cap!', options: [{ label: 'hat', img: I1('hat-green') }, { label: 'cat', img: I1('cat') }, { label: 'cap', img: I1('cap') }], answer: 2 },
        { skill: 'find', ask: 'Find Mia!', reply: 'This is Mia!', options: [{ label: 'Mia', img: spr('mia') }, { label: 'Bella', img: spr('bella') }, { label: 'Leo', img: spr('leo') }], answer: 0 },
      ],
      doneLine: 'Three badges! You are the Game Day champion!',
    },
  },
  {
    id: 'wt6-team-flags', kind: 'flag-race', bg: bgParkEmpty, who: 'pip', title: 'Team Flags: you vs your teacher',
    teacher: 'Team game, student vs teacher: turns take it in turns. On the student’s turn they answer; on the teacher’s turn the student READS the question to the teacher and the teacher answers. Each right answer moves your flag up your hill. Nobody slides back.',
    rounds: [
      { ask: 'What’s your name?', choices: ['My name is …', 'I am fine.'], answer: 0 },
      { ask: 'How are you?', choices: ['I am six.', 'I am happy!'], answer: 1 },
      { ask: 'How old are you?', choices: ['I am … years old.', 'Goodbye!'], answer: 0 },
      { ask: 'Is Leo sad?', choices: ['Yes, he is.', 'Hello, Leo!'], answer: 0 },
      { ask: 'This is Bella. Say …', choices: ['Nice to meet you!', 'I am hungry.'], answer: 0 },
      { ask: 'What comes after nine?', choices: ['ten', 'eight'], answer: 0 },
      { ask: 'Say goodbye!', choices: ['Hello!', 'Goodbye! See you!'], answer: 1 },
      { ask: 'How is Mia?', choices: ['She is happy.', 'She is seven pears.'], answer: 0 },
      { ask: 'What is it? 🧢', choices: ['It’s a cap.', 'It’s a cat.'], answer: 0 },
    ],
    doneLine: 'Your flag is on the top! What a team game!',
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
  {
    id: 'wt6-quiz-show', kind: 'join-stage', bg: bgL1Stage, teacher: 'Free: swap! Now the STUDENT is the quiz master and asks Pip the questions. Pip answers.', cast: ['pip'],
    turns: [
      { who: 'student', line: 'Hello, Pip! How are you?' },
      { who: 'pip', line: 'I am happy! It’s Game Day!' },
      { who: 'student', line: 'How old are you?' },
      { who: 'pip', line: 'I am eight. And you?' },
      { who: 'student', line: 'I am … years old.' },
    ],
  },
  {
    id: 'wt6-tic-tac-toe', kind: 'tic-tac-toe', bg: bgL1Stage, who: 'pip', opponentImg: spr('pip'), title: 'Tic-Tac-Toe with Pip!',
    teacher: 'Free: the student plays Pip. Tap a square, answer its question — a star! Three stars in a row wins. Say every answer aloud.',
    squares: [
      { ask: 'How are you?', choices: ['I am happy.', 'I am seven.'], answer: 0 },
      { ask: 'What’s your name?', choices: ['Goodbye!', 'My name is Leo.'], answer: 1 },
      { ask: 'How old are you?', choices: ['I am eight.', 'I am sad.'], answer: 0 },
      { ask: 'This is my friend Mia.', choices: ['See you!', 'Nice to meet you!'], answer: 1 },
      { ask: 'Goodbye, Pip!', choices: ['Goodbye! See you!', 'How are you?'], answer: 0 },
      { ask: 'Is she sad?', choices: ['He is tired.', 'Yes, she is sad.'], answer: 1, img: feelSpr('mia-sad') },
      { ask: 'How many? Count!', choices: ['Ten!', 'Six!'], answer: 0, img: I1('ten') },
      { ask: 'Where is the cap?', choices: ['It’s on the cat!', 'It’s a hat.'], answer: 0, img: I1('cat') },
      { ask: 'Hello! I’m new.', choices: ['Hello! What’s your name?', 'I am hungry.'], answer: 0 },
    ],
    doneLine: 'Three in a row! You win, champion!',
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
  { id: 'wt6-echo-bye', kind: 'echo', bg: bgL1Circle, who: 'coco', textSide: 'top', teacher: 'Guided: say it with Coco — wave!', word: 'See you tomorrow, Coco!' },
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
    id: 'wt6-pet-pal', kind: 'pet-pal', bg: bgParkEmpty, who: 'pip', title: 'Pet Pal: Biscuit',
    teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
    pet: { name: 'Biscuit', img: '/lep1/items/item-dog.png' },
    earlier: [{ label: 'star', img: '/lep1/items/item-star-gold.png' }, { label: 'apple', img: '/lep1/items/item-apple.png' }, { label: 'cake', img: '/lep1/items/item-cake.png' }, { label: 'ball', img: '/lep1/items/item-ball-red.png' }, { label: 'hat', img: '/lep1/items/item-hat.png' }],
    rounds: [{ line: 'It’s Game Day! I want a present!', choices: [{ label: 'present', img: '/lep1/items/item-gift.png' }, { label: 'ball', img: '/lep1/items/item-ball-red.png' }, { label: 'medal', img: '/lep1/items/item-hero-medal.png' }], answer: 0, say: 'A present! Let’s play!' }],
    doneLine: 'Biscuit is so happy! See you next time!',
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
    id: 'wt6-interview-leo', kind: 'join-stage', bg: bgL1Circle, teacher: 'Extra time (Free): the student interviews Leo — any questions from Unit 1. Leo answers.', cast: ['leo'],
    turns: [
      { who: 'student', line: 'Hello, Leo! How are you?' },
      { who: 'leo', line: 'I am happy now! I have my cap!' },
      { who: 'student', line: 'How old are you?' },
      { who: 'leo', line: 'I am seven.' },
      { who: 'student', line: 'Who is your friend?' },
      { who: 'leo', line: 'Pip is my friend. And you!' },
    ],
  },
  {
    id: 'wt6-break-2', kind: 'prea1', teacher: 'Brain break: the Game Day victory dance!',
    scene: {
      id: 'wt6-break-2', kind: 'tpr-actions', mode: 'break', bg: bgL1Stage, who: 'pip', teacher: 'Victory dance!',
      rounds: [
        { line: 'Hands up! We are champions!', emoji: '\u{1F64C}' },
        { line: 'Spin around and count to five!', emoji: '\u{1F483}' },
        { line: 'High five a friend: Nice to meet you!', emoji: '\u{1F91A}' },
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
  {
    id: 'wt7-p1b-numbers', kind: 'prea1', teacher: 'Part 1b — Listening: numbers (5). Miss Marigold says a number from 1 to 20 — the student taps it. Pass: 4 of 5.',
    scene: { id: 'wt7-p1b-numbers', kind: 'numbers-review', bg: bgL1Class, who: 'pip', from: 1, to: 20, teacher: 'Listen and tap the number!' },
  },
  { id: 'wt7-can-2', kind: 'meet', focus: ['feel'], bg: bgFeelingsW, who: 'mia', cardSide: 'left', teacher: 'Can-do: the student says how they feel and asks back — tick it.', line: 'I can say how I feel and ask: How are you?', repeat: 'I am happy. How are you?' },
  { id: 'wt7-can-3', kind: 'meet', focus: ['old'], bg: leoStory(3), who: 'leo', cardSide: 'left', teacher: 'Can-do: the student counts to 20 and says their age — tick it.', line: 'I can count to twenty and say: I am seven years old!', repeat: 'I am … years old.' },
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
  {
    id: 'wt7-p2b-spell', kind: 'name-badge', bg: bgL1Party, who: 'marigold',
    teacher: 'Part 2b — Spell the names (3). Pass: 2 of 3.',
    rounds: [
      { name: 'Bella', sprite: spr('bella'), choices: ['L', 'B', 'A', 'E'] },
      { name: 'Willow', sprite: spr('willow'), choices: ['O', 'W', 'L', 'I'] },
      { name: 'Leo', sprite: spr('leo'), choices: ['E', 'O', 'L', 'A'] },
    ],
  },
  {
    id: 'wt7-p2c-tick', kind: 'prea1', teacher: 'Part 2c — Reading sentences (5). Read the sentence, look at the picture — tick or cross? Pass: 4 of 5.',
    scene: {
      id: 'wt7-p2c-tick', kind: 'tick-cross', bg: bgL1Reading, who: 'pip', teacher: 'Read and look. Yes or no?',
      rounds: [
        { img: feelSpr('leo-tired'), sentence: 'He is tired.', isTrue: true },
        { img: feelSpr('mia-sad'), sentence: 'She is happy.', isTrue: false },
        { img: spr('bella'), sentence: 'Her name is Bella.', isTrue: true },
        { img: I1('ten'), sentence: 'It is six.', isTrue: false },
        { img: feelSpr('willow-hungry'), sentence: 'She is hungry.', isTrue: true },
      ],
    },
  },
  { id: 'wt7-can-1', kind: 'meet', focus: ['hello'], bg: bgL1Hello, who: 'pip', cardSide: 'left', teacher: 'Can-do: the student says it — tick it on the Unit 1 can-do card.', line: 'I can say hello, my name and goodbye!', repeat: 'Hello! My name is …' },
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
  {
    id: 'wt7-break', kind: 'prea1', teacher: 'Brain break between the parts: stretch with Pip.',
    scene: {
      id: 'wt7-break', kind: 'tpr-actions', mode: 'break', bg: bgL1Circle, who: 'pip', teacher: 'Stretch with Pip!',
      rounds: [
        { line: 'Stretch up high: I am tired!', emoji: '\u{1F971}' },
        { line: 'Shake it out: I am happy!', emoji: '\u{1F604}' },
        { line: 'Count to five and breathe!', emoji: '\u{1F590}\u{FE0F}' },
      ],
    },
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
  {
    id: 'wt7-p4b-interview', kind: 'join-stage', bg: bgL1Peers, teacher: 'Part 4b — Asking (4 points: one for each question asked in full). The STUDENT asks Mia; Mia answers. Pass: 3 of 4.', cast: ['mia'],
    turns: [
      { who: 'student', line: 'Hello! What’s your name?' },
      { who: 'mia', line: 'My name is Mia.' },
      { who: 'student', line: 'How are you, Mia?' },
      { who: 'mia', line: 'I am happy, thank you!' },
      { who: 'student', line: 'How old are you?' },
      { who: 'mia', line: 'I am six.' },
      { who: 'student', line: 'Nice to meet you! Goodbye!' },
    ],
  },
  /* Part 5 — Reading aloud */
  {
    id: 'wt7-p5-read-aloud', kind: 'reader', bg: bgL1Reading, title: 'Part 5 — Read it aloud!', doneLine: 'You read it all by yourself!',
    teacher: 'Part 5 — Reading aloud (5 points: every word read, then fluency). Skip the listening: tap "My turn to read" at once. Pass: 4 of 5.',
    pages: [LEO_STORY[5], LEO_STORY[9]],
  },
  { id: 'wt7-can-4', kind: 'meet', focus: ['friend'], bg: leoStory(7), who: 'bella', cardSide: 'left', teacher: 'Can-do: the student introduces a friend and reads a story page — tick it.', line: 'I can say: This is my friend. And I can read the story!', repeat: 'This is my friend …' },
  { id: 'wt7-echo-champ', kind: 'echo', bg: bgL1Class, who: 'pip', textSide: 'top', teacher: 'Say it proudly with Pip!', word: 'I can do it! Unit 1 champion!' },
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
    id: 'wt7-pet-pal', kind: 'pet-pal', bg: bgParkEmpty, who: 'pip', title: 'Pet Pal: Biscuit',
    teacher: 'Routine (1 minute): Biscuit the puppy says what he wants. The student listens, taps it and says it. It goes on his shelf and he grows — the shelf keeps everything from earlier lessons.',
    pet: { name: 'Biscuit', img: '/lep1/items/item-dog.png' },
    earlier: [{ label: 'star', img: '/lep1/items/item-star-gold.png' }, { label: 'apple', img: '/lep1/items/item-apple.png' }, { label: 'cake', img: '/lep1/items/item-cake.png' }, { label: 'ball', img: '/lep1/items/item-ball-red.png' }, { label: 'hat', img: '/lep1/items/item-hat.png' }, { label: 'present', img: '/lep1/items/item-gift.png' }],
    rounds: [{ line: 'You are a champion! I want a medal too!', choices: [{ label: 'banana', img: '/lep1/items/item-banana.png' }, { label: 'medal', img: '/lep1/items/item-hero-medal.png' }, { label: 'milk', img: '/lep1/items/item-milk.png' }], answer: 1, say: 'A medal! Well done, Biscuit!' }],
    doneLine: 'Biscuit is so happy! See you next time!',
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
  /* Practise again — for any part below the pass mark, or as extra time */
  {
    id: 'wt7-pa-match', kind: 'picture-match', look: 'cards', prompt: 'Practise again: read and match',
    teacher: 'Practise again (Part 2/3): read each sentence and drag it under its picture.',
    items: [
      { word: 'I am sad. My red cap is lost.', img: leoStory(4) },
      { word: 'Mia, this is my friend Leo.', img: leoStory(6) },
      { word: 'Look! The cap is on the cat!', img: leoStory(9) },
      { word: 'Goodbye, friends!', img: leoStory(11) },
    ],
    bg: bgL1Circle,
  },
  {
    id: 'wt7-pa-splat', kind: 'word-splat', bg: bgL1Reading, who: 'pip', title: 'Practise again: Word Splat!',
    teacher: 'Practise again (reading): Pip says a word — splat it and read it.',
    words: ['name', 'how', 'old', 'friend', 'this', 'my', 'you', 'are', 'see', 'look'],
    rounds: ['name', 'old', 'friend', 'how', 'this', 'see'],
    doneLine: 'Splat! Super reading!',
  },
  {
    id: 'wt7-pa-build', kind: 'sentence-build', bg: bgL1Reading, teacher: 'Practise again (Part 3): put the words in order, then read the sentence.',
    rounds: [
      { words: ['How', 'old', 'are', 'you?'], emoji: '\u{1F382}' },
      { words: ['This', 'is', 'my', 'friend', 'Mia.'], emoji: '\u{1F42D}' },
      { words: ['I', 'am', 'happy', 'now!'], emoji: '\u{1F604}' },
    ],
  },
  {
    id: 'wt7-pa-memory', kind: 'memory', bg: bgL1Circle, teacher: 'Practise again (Part 4): find each question and its answer — read both aloud.',
    pairs: [
      { id: 'how', label: 'How are you?', match: 'I am tired.', emoji: '\u{1F971}' },
      { id: 'old', label: 'How old are you?', match: 'I am nine.', emoji: '\u{1F522}' },
      { id: 'meet', label: 'Nice to meet you!', match: 'Nice to meet you, too!', emoji: '\u{1F91D}' },
      { id: 'bye', label: 'Goodbye, Bella!', match: 'Goodbye! See you!', emoji: '\u{1F44B}' },
    ],
  },
  {
    id: 'wt7-pa-chat', kind: 'chat-chain', bg: bgL1Circle, partner: 'willow', title: 'Practise again: chat with Willow',
    intro: 'Hello! Let’s talk!',
    teacher: 'Practise again (Part 4): Willow talks, the student picks the reply that fits and SAYS it, then taps “I said it”.',
    turns: [
      { who: 'willow', line: 'Hello! How are you?' },
      { who: 'student', line: 'I am fine, thank you. How are you?', wrong: ['I am seven.', 'My name is Pip.'] },
      { who: 'willow', line: 'I am hungry! How old are you?' },
      { who: 'student', line: 'I am … years old.', wrong: ['Goodbye!', 'This is my friend.'] },
      { who: 'willow', line: 'Who is this?' },
      { who: 'student', line: 'This is my friend Leo.', wrong: ['I am sad.', 'How are you?'] },
    ],
  },
  {
    id: 'wt7-pa-quick', kind: 'prea1', teacher: 'Practise again (speaking): quick fire! Say the whole sentence before the ring runs out.',
    scene: {
      id: 'wt7-pa-quick', kind: 'rapid-recall', bg: bgL1Stage, who: 'pip', seconds: 6,
      teacher: 'Say it before the ring runs out!',
      cards: [
        { img: spr('leo'), word: 'Leo', say: 'This is Leo. He is seven.' },
        { img: spr('mia'), word: 'Mia', say: 'This is Mia. She is six.' },
        { img: feelSpr('bella-angry'), word: 'angry', say: 'She is angry.' },
        { img: I1('ten'), word: 'ten', say: 'Ten!' },
        { img: spr('pip'), word: 'Pip', say: 'His name is Pip. He is eight.' },
      ],
    },
  },
  {
    id: 'wt7-pa-parcel', kind: 'pass-parcel', bg: bgL1Party, who: 'pip', title: 'Pass the Present!',
    teacher: 'Practise again (all parts): every right answer tears one layer off the present. What is inside?',
    rounds: [
      { ask: 'How are you?', choices: ['I am fine, thank you.', 'I am eight.', 'My name is Mia.'], answer: 0 },
      { ask: 'What’s your name?', choices: ['Nice to meet you!', 'My name is Bella.', 'See you!'], answer: 1 },
      { ask: 'How old are you?', choices: ['I am tired.', 'Goodbye!', 'I am nine.'], answer: 2 },
      { ask: 'This is my friend Leo.', choices: ['Nice to meet you, Leo!', 'I am hungry.', 'How are you?'], answer: 0 },
      { ask: 'Where is Leo’s cap?', choices: ['It’s on the cat!', 'It’s on the bed!', 'It’s a hat!'], answer: 0, img: leoStory(9) },
    ],
    prize: { img: feelSpr('pip-happy'), label: 'Super friend sticker' },
    doneLine: 'You opened the present! Super friend!',
  },
  {
    id: 'wt7-pa-chests', kind: 'chest-quest', bg: bgL1Party, who: 'pip', title: 'Treasure Chests!', goal: 60,
    teacher: 'Practise again: every right answer opens a chest — coins fill the class jar. Can we reach 60 coins?',
    rounds: [
      { ask: 'How old are you?', choices: ['I am … years old.', 'I am sad.'], answer: 0, prizes: ['10', '20', '⭐'] },
      { ask: 'She is …', choices: ['happy', 'hungry'], answer: 1, img: feelSpr('willow-hungry'), prizes: ['20', '10', '×2'] },
      { ask: 'What’s your name?', choices: ['My name is …', 'See you!'], answer: 0, prizes: ['×2', '20', '10'] },
      { ask: 'Nice to meet you!', choices: ['Nice to meet you, too!', 'I am ten.'], answer: 0, prizes: ['10', '⭐', '20'] },
    ],
    doneLine: 'Look at the jar! Super answers!',
  },
  {
    id: 'wt7-pa-river', kind: 'rising-river', bg: bgParkEmpty, who: 'pip', title: 'Build the bridge home!',
    teacher: 'Practise again (together!): every right answer lays a plank. A wrong answer — the water rises a little. Get the friends home!',
    friends: [spr('mia'), spr('leo'), spr('bella')],
    rounds: [
      { ask: 'Hello! How are you?', choices: ['I am fine, thank you.', 'I am eight.'], answer: 0 },
      { ask: 'What’s your name?', choices: ['Goodbye!', 'My name is …'], answer: 1 },
      { ask: 'How many? Count!', choices: ['ten', 'six'], answer: 0, img: I1('ten') },
      { ask: 'Who is this?', choices: ['This is Mia.', 'This is Leo.'], answer: 0, img: spr('mia') },
      { ask: 'Goodbye, friends!', choices: ['Goodbye! See you!', 'How old are you?'], answer: 0 },
    ],
    doneLine: 'The friends are home! Great teamwork!',
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
