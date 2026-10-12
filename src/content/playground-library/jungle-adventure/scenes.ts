/* =============================================================================
 * Jungle Adventure — A1 Unit 2 Lesson 1: "Jungle Animals: Lion, Monkey, Bird"
 *
 * Second Playground A1 unit (after Welcome Town's Unit 1 "Greetings &
 * Introductions"). Reuses Welcome Town's Scene type, CharKey/CAST/VOICE_KEY,
 * and SceneRenderer verbatim — Jungle Adventure is a new WORLD, not a new
 * engine; see src/curriculum/worlds/a1Worlds.ts for the world definition and
 * src/curriculum/roadmap/a1Roadmap.ts for this unit's grammar/vocab plan.
 *
 * Scope check against playground-curriculum-engine (this unit's seeded
 * bucket, index 1): topics ['animals','actions','movement','simple_present'],
 * grammarFocus ['simple present — affirmative','can for ability'],
 * vocabularyFocus ['run','jump','fly','swim','lion','monkey','bird','fish'].
 * That's a whole UNIT's worth of grammar+vocab, not one lesson's — split
 * deliberately across the unit rather than crammed into L1 (revision note,
 * see below).
 *
 * Progressive plan across the unit (per smart-lesson-architect §12 — new
 * grammar/vocab chunks get introduced one at a time, never stacked into a
 * single line):
 *   L1 (this lesson) — the identity chunk: "I am a ___" + the 3 nouns
 *     lion/monkey/bird, taught, practiced, and assessed. "I can ___" makes
 *     one light, untaught appearance late (roleplay, scene 13) — planted
 *     future knowledge per playground-curriculum-engine's knowledge-graph
 *     model, not drilled or tested here.
 *   L2 (future) — actually TEACHES "I can ___" + run/climb/fly (guided
 *     practice, assessment), REINFORCING the same three animals from L1
 *     rather than teaching new nouns alongside new grammar at once.
 *   L3+ (future) — combine "I am a ___. I can ___." in production
 *     (roleplay/speaking), add swim/jump + fish, review/assess.
 * A first pass of this file taught name+category+ability in one breath per
 * animal ("Hello! I am Leo. I am a lion! I can run fast!") — three new
 * chunks in a single line, flagged as overloaded and corrected to the
 * identity-only version below.
 *
 * Scene 3 originally re-reviewed "Hello!" (already the review target in
 * every earlier Welcome Town lesson) — replaced with a genuine new-content
 * beat instead: the setting word itself, "jungle", which every scene in
 * this lesson actually depends on.
 *
 * Cast: Leo (lion) and Willow (bird) are the SAME established Welcome Town
 * characters — both happen to already be the exact animals this lesson
 * teaches, so no new character was needed for them. Coco the Monkey is new
 * (added to welcome-town/scenes.ts's shared CAST) — no recorded voice yet,
 * routed to the 'teacher' voice like Marigold until one exists.
 *
 * Art: 7 jungle background images under public/jungle-adventure/scenes/,
 * generated via the Gemini API directly (gemini-3-pro-image-preview, same
 * pattern as supabase/functions/_shared/googleImageClient.ts) rather than
 * Higgsfield, with Welcome Town's own bg-classroom-wide.png passed in as a
 * reference image on every call. A first pass (Higgsfield/Nano Banana,
 * no reference image) came back in a soft painterly semi-3D style —
 * gradient shading, glossy highlights, drop shadows — that didn't match
 * Welcome Town's flat cel-shaded sticker look at all. The fix wasn't a
 * better-worded style description; it was generating a single title/hero
 * shot first (Leo, Coco, and Willow together) using the Welcome Town
 * reference for style AND Leo/Willow's existing character designs, then
 * using THAT image as a second reference for the remaining 6 — locking
 * Coco's brand-new design in from her first appearance instead of letting
 * it drift scene to scene. All 7 reused across multiple scenes the same
 * way Welcome Town's own backgrounds are (e.g. the jungle-path scene backs
 * vocab-spot, choice, drag-match, AND listen-tap, all reusing the same
 * hotspot coordinates for the same three animals).
 *
 * 16 scenes. Deliberate exception to activity-pattern-library's Hard
 * Variety Rule (max 2 consecutive same-`kind` scenes): the three `meet`
 * scenes (Leo, Coco, Willow) run back-to-back-to-back by explicit design
 * choice, so all three friends are introduced as a group before the lesson
 * moves to practice activities. Everything after that run holds the normal
 * 2-in-a-row cap. Kinds used: title-card, cinematic, echo, meet, vocab-spot, choice,
 * drag-match, join-stage, listen-tap, flipbook, roleplay, hello-doors,
 * true-false, finale — matches smart-lesson-architect's canonical 10-step
 * flow (Welcome → Review → New Language → Guided Practice → Interactive
 * Practice → Story → Speaking → Assessment → Review → Home Challenge).
 * Two distinct speaking-production beats now (join-stage at scene 10,
 * roleplay at scene 13) instead of clustering all production at the end.
 * ========================================================================= */

import { CAST, VOICE_KEY, type CharKey, type Scene } from '../welcome-town/scenes';

export type { CharKey, Scene };
export { CAST, VOICE_KEY };

const J = '/jungle-adventure';
const bgTitle = `${J}/scenes/bg-jungle-title.png`;
const bgWide = `${J}/scenes/bg-jungle-wide.png`;
const bgLeoDen = `${J}/scenes/bg-jungle-leo-den.png`;
const bgCocoVines = `${J}/scenes/bg-jungle-coco-vines.png`;
const bgWillowNest = `${J}/scenes/bg-jungle-willow-nest.png`;
const bgPathAnimals = `${J}/scenes/bg-jungle-path-animals.png`;
const bgFriends = `${J}/scenes/bg-jungle-friends.png`;

// Shared hotspot coordinates for the three animals in bg-jungle-path-animals
// — reused verbatim across vocab-spot/drag-match/listen-tap so "where the
// word lives" matches "where the student already looked" (same discipline
// Welcome Town Lesson 1 uses for its classroom hotspots).
const LION_SPOT = { left: '18%', top: '68%' };
const MONKEY_SPOT = { left: '50%', top: '50%' };
const BIRD_SPOT = { left: '84%', top: '38%' };

export const LESSON_A1U2L1_TITLE = 'Jungle Animals: Lion, Monkey, Bird';
export const LESSON_A1U2L1_OBJECTIVE =
  'Name three jungle animals (lion, monkey, bird) and say "I am a ___" for each one. (The roleplay near the end plants "I can run/climb/fly" as a preview — Lesson 2 is where it is actually taught, practiced, and assessed.)';

export const LESSON_A1U2L1_SCENES: Scene[] = [
  { id: 'ja-title', kind: 'title-card', bg: bgTitle, level: 'A1', unit: 'Unit 2', lessonLabel: 'Lesson 1', title: 'Jungle Adventure: Jungle Animals!', subtitle: 'Meet Leo, Coco, and Willow in the jungle', cta: '\u{1F334} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): a quick warm-up of Unit 1 · Lesson 4 · Speak & Meet!.
    id: 'ja-recall-warmup', kind: 'recall-warmup', bg: '/jungle-adventure/scenes/bg-jungle-wide.png', who: 'pip', mode: 'click',
    fromLabel: "Unit 1 · Lesson 4 · Speak & Meet!",
    teacher: 'Warm-up from last lesson: Pip says it, the student finds the picture and says it too.',
    items: [
      { word: "nice to meet you", say: "Hello! Nice to meet you! Find it!", img: '/welcome-town/scenes/bg-express-hello-v2.png' },
      { word: "my friend", say: "This is my friend! Find it!", img: '/welcome-town/scenes/bg-express-friend-v2.png' },
      { word: "goodbye", say: "Goodbye! Find it!", img: '/welcome-town/scenes/bg-express-goodbye-v2.png' },
    ],
  },

  {
    id: 'ja-intro', kind: 'cinematic', bg: bgWide, title: 'A New Adventure', subtitle: 'Pip opens a mystery storybook', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Wow, look at this book! I wonder what wild place this is...' },
      { who: 'pip', line: 'Let’s turn the page and find out together!' },
    ],
    cta: '\u{1F392} OPEN THE BOOK!',
  },

  { id: 'ja-setting-jungle', kind: 'echo', bg: bgWide, who: 'pip', teacher: 'Shh... listen! Rustling leaves, buzzing bugs, chirping birds! We found a wild, green place. Say it with me...', word: 'Jungle!' },

  { id: 'ja-meet-leo', kind: 'meet', focus: ['lion'], bg: bgLeoDen, who: 'leo', teacher: 'Tap Leo to hear him say hello!', line: 'Hello! I am Leo. I am a lion!', repeat: 'I am a lion!' },
  { id: 'ja-meet-coco', kind: 'meet', focus: ['monkey'], bg: bgCocoVines, who: 'coco', teacher: 'Here comes a new friend! Tap Coco to say hi.', line: 'Hi! My name is Coco. I am a monkey!', repeat: 'I am a monkey!' },
  { id: 'ja-meet-willow', kind: 'meet', focus: ['bird'], bg: bgWillowNest, who: 'willow', teacher: 'Willow lives in the jungle too! Tap her to say hi.', line: 'Tweet tweet! I am Willow. I am a bird!', repeat: 'I am a bird!' },

  {
    id: 'ja-vocab-animals', kind: 'vocab-spot', bg: bgPathAnimals,
    teacher: 'Look around the jungle path! Tap each animal to learn its name.',
    items: [
      { label: 'Lion', sentence: 'This is a lion.', emoji: '\u{1F981}', ...LION_SPOT, color: '#C97A2F', who: 'leo' },
      { label: 'Monkey', sentence: 'This is a monkey.', emoji: '\u{1F412}', ...MONKEY_SPOT, color: '#8B5A2B', who: 'coco' },
      { label: 'Bird', sentence: 'This is a bird.', emoji: '\u{1F426}', ...BIRD_SPOT, color: '#4FA9E0', who: 'willow' },
    ],
  },

  {
    id: 'ja-choice-coco', kind: 'choice', bg: bgPathAnimals, who: 'pip',
    teacher: 'Listen carefully, then tap the right answer!',
    prompt: 'Coco said, "I am a monkey!" Which animal is Coco?',
    options: [
      { label: 'Lion', emoji: '\u{1F981}' },
      { label: 'Monkey', emoji: '\u{1F412}', correct: true },
      { label: 'Bird', emoji: '\u{1F426}' },
    ],
  },

  {
    id: 'ja-drag-animals', kind: 'drag-match', bg: bgPathAnimals,
    teacher: 'Listen, then drag each word onto the matching jungle animal!',
    items: [
      { label: 'Lion', color: '#C97A2F', who: 'leo', targetLeft: LION_SPOT.left, targetTop: LION_SPOT.top },
      { label: 'Monkey', color: '#8B5A2B', who: 'coco', targetLeft: MONKEY_SPOT.left, targetTop: MONKEY_SPOT.top },
      { label: 'Bird', color: '#4FA9E0', who: 'willow', targetLeft: BIRD_SPOT.left, targetTop: BIRD_SPOT.top },
    ],
  },

  {
    // Swapped from a same-label 'memory' match (redundant right after
    // drag-match — both are recognition/matching, so back-to-back they were
    // cosmetic variation, not real variety: activity-pattern-library's
    // definition of "different `kind`, same underlying task"). Researched
    // real ESL young-learner technique instead: animal-identity turn-taking
    // speaking games (teach-this.com/vocabulary/animals,
    // games4esl.com/esl-classroom-games/animal-games — "I am ___, who am
    // I?" guessing/turn-taking format). Adapted to this lesson's actual
    // controlled language (skip the riddle adjectives like "I am yellow" —
    // not taught yet) via 'join-stage', already proven in Welcome Town for
    // self-introduction turns: animals model "I am a ___", then the
    // student produces it themselves — genuine speaking production,
    // directly on-objective, not another recognition/matching rep.
    id: 'ja-join-stage', kind: 'join-stage', bg: bgFriends,
    teacher: 'Your turn! When it says YOU, pick an animal and say "I am a ___" yourself!',
    cast: ['leo', 'coco', 'willow'],
    turns: [
      { who: 'leo', line: 'I am a lion!' },
      { who: 'coco', line: 'I am a monkey!' },
      { who: 'willow', line: 'I am a bird!' },
      { who: 'student', line: 'Now YOU! Pick an animal and say "I am a ___!"' },
    ],
  },

  {
    id: 'ja-listen-tap-can', kind: 'listen-tap', bg: bgPathAnimals,
    teacher: 'Listen, then tap the animal that matches!',
    targets: [
      { label: 'Lion', ...LION_SPOT, color: '#C97A2F' },
      { label: 'Monkey', ...MONKEY_SPOT, color: '#8B5A2B' },
      { label: 'Bird', ...BIRD_SPOT, color: '#4FA9E0' },
    ],
    rounds: [
      { prompt: 'I am a lion. Hear me roar!', answerLabel: 'Lion', who: 'leo' },
      { prompt: 'I am a monkey. Hear me chatter!', answerLabel: 'Monkey', who: 'coco' },
      { prompt: 'I am a bird. Hear me tweet!', answerLabel: 'Bird', who: 'willow' },
    ],
  },

  {
    id: 'ja-storybook', kind: 'flipbook', bg: bgWide, title: 'Three Jungle Friends',
    pages: [
      { who: 'pip', img: bgWide, text: 'Welcome to the jungle! Today we meet three animal friends.' },
      { who: 'coco', img: bgCocoVines, text: 'This is Coco. Coco is a monkey!' },
      { who: 'leo', img: bgLeoDen, text: 'This is Leo. Leo is a lion!' },
      { who: 'willow', img: bgWillowNest, text: 'This is Willow. Willow is a bird!' },
      { who: 'coco', img: bgFriends, text: 'Lion, monkey, and bird — three jungle friends together!' },
    ],
    checkpoints: [
      { afterPage: 2, who: 'coco', question: 'What animal is Coco?', options: ['Monkey', 'Lion', 'Bird'], answer: 'Monkey' },
      { afterPage: 3, who: 'leo', question: 'What animal is Leo?', options: ['Bird', 'Monkey', 'Lion'], answer: 'Lion' },
    ],
  },

  {
    // By this point (scene 13 of 16) "I am a ___" has been drilled across
    // 9 prior scenes — well past the point where one small new addition
    // risks overload. Each character's well-known identity line is now
    // followed by ONE new "I can ___" line (reusing the SAME already-known
    // animals, no new nouns), matching this unit's own grammarFocus for
    // "can for ability". This is deliberately PLANTED, not taught: per
    // playground-curriculum-engine's knowledge-graph model, future
    // knowledge can surface in a story/roleplay ahead of the lesson that
    // formally teaches it. Lesson 2 owns the real guided practice and
    // assessment of "can" — nothing later in THIS lesson (hello-doors,
    // true-false) tests it, so assessment still matches what L1 actually
    // teaches.
    id: 'ja-roleplay', kind: 'roleplay', bg: bgFriends,
    teacher: 'Story time! Listen to what Leo, Coco, and Willow can do, then repeat each line.',
    cast: ['leo', 'coco', 'willow'],
    script: [
      { who: 'leo', line: 'Hello! I am Leo. I am a lion!', repeat: true },
      { who: 'leo', line: 'I can run very fast!', repeat: true },
      { who: 'coco', line: 'Hi! I am Coco. I am a monkey!', repeat: true },
      { who: 'coco', line: 'I can climb trees!', repeat: true },
      { who: 'willow', line: 'Tweet! I am Willow. I am a bird!', repeat: true },
      { who: 'willow', line: 'I can fly high!', repeat: true },
    ],
  },

  {
    id: 'ja-hello-doors', kind: 'hello-doors', bg: bgWide,
    teacher: 'Knock knock! Listen for the animal, then tap the right door!',
    cast: ['leo', 'coco', 'willow'],
    rounds: [
      { target: 'leo', prompt: 'Who says "I am a lion"?', helloLine: 'I am Leo the lion!', echoLine: 'I am a lion!' },
      { target: 'coco', prompt: 'Who says "I am a monkey"?', helloLine: 'I am Coco the monkey!', echoLine: 'I am a monkey!' },
      { target: 'willow', prompt: 'Who says "I am a bird"?', helloLine: 'I am Willow the bird!', echoLine: 'I am a bird!' },
    ],
  },

  {
    id: 'ja-true-false', kind: 'true-false', bg: bgFriends,
    teacher: 'Listen to each sentence. Is it TRUE or FALSE?',
    rounds: [
      { who: 'leo', statement: 'Leo is a lion.', isTrue: true },
      { who: 'coco', statement: 'Coco is a bird.', isTrue: false },
      { who: 'willow', statement: 'Willow is a bird.', isTrue: true },
    ],
  },

  { id: 'ja-finale', kind: 'finale', bg: bgFriends, who: 'pip', line: 'You met Leo, Coco, and Willow, and learned lion, monkey, and bird! Look for a bird outside today! ✨\u{1F334}' },
];

/* =============================================================================
 * A1 Unit 2 Lesson 2: "What Can Animals Do?" (built 2026-10-12)
 *
 * Plan (src/curriculum/roadmap/a1LessonPlans.ts, unit 2 lesson 2 — start there, not here):
 *   Objective: I can say what a jungle animal can and can't do: "A monkey can climb. It can't fly."
 *   New: climb, swing, It can't…  ·  Re-used: lion, monkey, bird, fish; run, jump, swim, fly; It can…
 *   Phonics: ch (chip, chick, lunch, bench) · Home mission: mime an animal, say what it can and can't do.
 * Story frame: Jungle Games Day — the friends race an obstacle course to the golden banana at the waterfall
 *   (new setting and plot shape vs Lesson 1's "meet the friends" path; new pictures, warm sunny daylight).
 * Practice ladder (blueprint §3g, owner 2026-10-12 "enough guided practice and free practice"):
 *   Present: action scene, "swing" word page, watch & copy, "can't" word page.
 *   Guided (teacher notes start "Guided:"): watch & copy, listen & tap, drag & match, Obstacle Run picks + "say it",
 *     quick-fire.  Free ("Free:"): Q & A stage, spin & say with own can't sentence, "What can YOU do?", Obstacle Run
 *     finale (own sentences about any friend).  Check: true / false (the plan's listening evidence, 4 of 5).
 * Research (lesson-variety-engine; mechanics only, never content): EnglishClub / British Council TeachingEnglish
 *   can / can't ability games ("Who can…?", mime and say), Cambridge Pre A1 Starters / A1 Movers listen-and-choose and
 *   "Can a … ?" tasks, Wordwall maze-chase route progress, Khan Academy Kids cause-and-effect feedback, Lingokids action
 *   games (watch and do). Better than them: the language IS the move in the Obstacle Run (a station only opens for the
 *   friend who CAN), a wrong pick is a funny visible "I can't…" instead of a red cross, flags stay on the course, and
 *   the game ends in the child's own sentences. New mechanic: `obstacle-run` (unit1/scene-components/ObstacleRunScene.tsx).
 * Safe animal facts only in generic sentences (monkey climb/swing, can't fly; fish swim, can't run; lion run, can't
 *   swing; bird fly; frog jump). First-person "I can't…" lines belong to one character, not to a species.
 * ========================================================================= */

const bgObstacle = `${J}/scenes/bg-jungle-obstacle-course.png`;
const bgActions = `${J}/scenes/bg-jungle-actions.png`;
const bgCocoSwing = `${J}/scenes/bg-jungle-coco-swing.png`;
const bgCocoCantFly = `${J}/scenes/bg-jungle-coco-cant-fly.png`;
const bgWaterfall = `${J}/scenes/bg-jungle-waterfall-party.png`;
const it = (n: string) => `/lep1/items/item-${n}.png`;
const SONG_A1U2L2 = `${J}/audio/jungle-can-song-a1u2l2.mp3?v=1`;
const SONG_A1U2L2_LYRICS: { who: CharKey; text: string }[] = [
  { who: 'coco', text: 'Climb and swing and swim and fly,' },
  { who: 'leo', text: 'Jungle friends, let’s try, let’s try!' },
  { who: 'coco', text: 'A monkey can climb, yes, it can!' },
  { who: 'willow', text: 'A monkey can’t fly, no, it can’t!' },
  { who: 'leo', text: 'A fish can swim, yes, it can!' },
  { who: 'coco', text: 'A fish can’t run, no, it can’t!' },
  { who: 'willow', text: 'A lion can run, yes, it can!' },
  { who: 'coco', text: 'A lion can’t swing, no, it can’t!' },
  { who: 'coco', text: 'Climb and swing and swim and fly,' },
  { who: 'leo', text: 'Jungle friends, let’s try, let’s try!' },
];
// take 3 (docs/songs/a1u2l2-jungle-can-scores.txt, score 0.93): line starts measured from the transcript
const SONG_A1U2L2_MS = [10460, 6120, 2400, 6170, 2400, 6420, 2200, 6360, 2180, 2590];

// the five animals on bg-jungle-actions.png (measured on a % grid of the picture)
const CLIMB_SPOT = { left: '16%', top: '33%' };
const RUN_SPOT = { left: '45%', top: '62%' };
const FLY_SPOT = { left: '67%', top: '28%' };
const JUMP_SPOT = { left: '60%', top: '77%' };
const SWIM_SPOT = { left: '82%', top: '84%' };

export const LESSON_A1U2L2_TITLE = 'What Can Animals Do?';
export const LESSON_A1U2L2_OBJECTIVE = 'I can say what a jungle animal can and can\'t do: "A monkey can climb. It can\'t fly."';

export const LESSON_A1U2L2_SCENES: Scene[] = [
  { id: 'ja2-title', kind: 'title-card', bg: bgObstacle, level: 'A1', unit: 'Unit 2', lessonLabel: 'Lesson 2', title: 'What Can Animals Do?', subtitle: 'Jungle Games Day: climb, swing, swim and fly!', cta: '\u{1F3C1} LET’S GO!' },
  {
    // Remember? (owner, 2026-10-07): Lesson 1's three animals, with the pictures Lesson 1 taught them with.
    id: 'ja2-recall-warmup', kind: 'recall-warmup', bg: bgWide, who: 'pip', mode: 'click',
    fromLabel: 'Unit 2 · Lesson 1 · Jungle Animals',
    teacher: 'Warm-up from last lesson: Pip says it, the student finds the picture and says it too.',
    items: [
      { word: 'lion', say: 'I am a lion! Find me!', img: bgLeoDen },
      { word: 'monkey', say: 'I am a monkey! Find me!', img: bgCocoVines },
      { word: 'bird', say: 'I am a bird! Find me!', img: bgWillowNest },
    ],
  },
  /* 3 Story opener */
  {
    id: 'ja2-intro', kind: 'cinematic', bg: bgObstacle, title: 'Jungle Games Day', subtitle: 'Race to the waterfall!', narrator: 'coco',
    script: [
      { who: 'coco', line: 'Today is Jungle Games Day!' },
      { who: 'leo', line: 'Look! The golden banana is at the waterfall!' },
      { who: 'willow', line: 'We can win it together. Every friend can do something different!' },
    ],
    cta: '\u{1F34C} LET’S RACE!',
  },
  /* 4 Input: the action words in one jungle picture, one arrow at a time */
  {
    id: 'ja2-vocab-actions', kind: 'vocab-spot', bg: bgActions,
    teacher: 'Look at each animal! Tap the arrow to hear what it can do.',
    items: [
      { label: 'Climb', sentence: 'A monkey can climb.', emoji: '\u{1F9D7}', ...CLIMB_SPOT, color: '#8B5A2B', who: 'coco' },
      { label: 'Run', sentence: 'A lion can run.', emoji: '\u{1F3C3}', ...RUN_SPOT, color: '#C97A2F', who: 'leo' },
      { label: 'Fly', sentence: 'A bird can fly.', emoji: '\u{1F54A}\u{FE0F}', ...FLY_SPOT, color: '#4FA9E0', who: 'willow' },
      { label: 'Jump', sentence: 'A frog can jump.', emoji: '\u{1F438}', ...JUMP_SPOT, color: '#3FA34D', who: 'pip' },
      { label: 'Swim', sentence: 'A fish can swim.', emoji: '\u{1F41F}', ...SWIM_SPOT, color: '#F08A24', who: 'mia' },
    ],
  },
  /* 5 Input: the second new word on its own page */
  {
    id: 'ja2-word-swing', kind: 'meet', look: 'word', word: 'swing', focus: ['swing'], bg: bgCocoSwing, who: 'coco', cardSide: 'right',
    teacher: 'Point to Coco on the vine. Listen, then swing your arms and say it!',
    line: 'Wheee! I can swing! A monkey can swing!', repeat: 'A monkey can swing!',
  },
  /* 6 Guided: watch and copy, one action at a time */
  {
    id: 'ja2-move', kind: 'prea1', teacher: 'Guided: watch and copy! Do each action and say the sentence.',
    scene: {
      id: 'ja2-move', kind: 'tpr-actions', mode: 'learn', bg: bgActions, who: 'leo',
      teacher: 'Guided: watch and copy! Do each action and say the sentence.',
      rounds: [
        { line: 'Climb, climb, climb! A monkey can climb!', emoji: '\u{1F9D7}' },
        { line: 'Swing, swing, swing! A monkey can swing!', emoji: '\u{1F412}', img: it('coco-swing') },
        { line: 'Run, run, run! A lion can run!', emoji: '\u{1F981}', img: it('leo-run') },
        { line: 'Fly, fly, fly! A bird can fly!', emoji: '\u{1F426}', img: it('willow-fly') },
        { line: 'Swim, swim, swim! A fish can swim!', emoji: '\u{1F41F}', img: it('fish-swim') },
        { line: 'Jump, jump, jump! A frog can jump!', emoji: '\u{1F438}', img: it('jungle-frog-jump') },
      ],
    },
  },
  /* 7 Guided: listen and tap (first game) */
  {
    id: 'ja2-who-can', kind: 'listen-tap', bg: bgActions, teacher: 'Guided: listen to "Who can…?", then tap the animal and say "A monkey can climb!"',
    targets: [
      { label: 'Monkey', ...CLIMB_SPOT, color: '#8B5A2B' },
      { label: 'Lion', ...RUN_SPOT, color: '#C97A2F' },
      { label: 'Bird', ...FLY_SPOT, color: '#4FA9E0' },
      { label: 'Frog', ...JUMP_SPOT, color: '#3FA34D' },
      { label: 'Fish', ...SWIM_SPOT, color: '#F08A24' },
    ],
    rounds: [
      { prompt: 'Who can fly?', answerLabel: 'Bird', who: 'willow' },
      { prompt: 'Who can swim?', answerLabel: 'Fish', who: 'mia' },
      { prompt: 'Who can climb?', answerLabel: 'Monkey', who: 'coco' },
      { prompt: 'Who can jump?', answerLabel: 'Frog', who: 'pip' },
      { prompt: 'Who can run?', answerLabel: 'Lion', who: 'leo' },
    ],
  },
  /* 8 The sentence page: can't (one structure, its own picture) */
  {
    id: 'ja2-word-cant', kind: 'meet', look: 'word', word: 'can’t', wordNote: '\u{1F6AB} can + not =', focus: ['can’t'], bg: bgCocoCantFly, who: 'coco', cardSide: 'right',
    teacher: 'Coco flaps her arms… nothing happens! Point to Willow (she can fly) and to Coco (she can’t). Listen, then say it with a head shake.',
    line: 'A monkey can climb. It can’t fly!', repeat: 'It can’t fly!',
  },
  /* 9 Guided: drag the word to the animal doing it */
  {
    id: 'ja2-drag-actions', kind: 'drag-match', bg: bgActions, teacher: 'Guided: drag each action word to the animal doing it, then say the sentence: "A fish can swim!"',
    items: [
      { label: 'climb', color: '#8B5A2B', who: 'coco', targetLeft: CLIMB_SPOT.left, targetTop: CLIMB_SPOT.top },
      { label: 'run', color: '#C97A2F', who: 'leo', targetLeft: RUN_SPOT.left, targetTop: RUN_SPOT.top },
      { label: 'fly', color: '#4FA9E0', who: 'willow', targetLeft: FLY_SPOT.left, targetTop: FLY_SPOT.top },
      { label: 'jump', color: '#3FA34D', who: 'pip', targetLeft: JUMP_SPOT.left, targetTop: JUMP_SPOT.top },
      { label: 'swim', color: '#F08A24', who: 'mia', targetLeft: SWIM_SPOT.left, targetTop: SWIM_SPOT.top },
    ],
  },
  /* 10 The lesson song (after the words and the first game, owner 2026-10-10) */
  {
    id: 'ja2-song', kind: 'song', bg: bgActions, title: '\u{1F3B5} Jungle Friends, Let’s Try! \u{1F3B5}',
    teacher: 'Sing and move! Thumbs up on "yes, it can", shake your head on "no, it can’t".',
    durationSeconds: 47, bigWord: 'can’t', songUrl: SONG_A1U2L2, lineDurationsMs: SONG_A1U2L2_MS, lyrics: SONG_A1U2L2_LYRICS,
  },
  /* 11 ★ Signature game: Jungle Obstacle Run (guided picks + "say it", free finale) */
  {
    id: 'ja2-obstacle-run', kind: 'prea1',
    teacher: 'Guided, then Free: send the friend who CAN pass each obstacle and say the sentence; at the end the student picks any friend and makes their own can / can’t sentences (tap ✓ for each one).',
    scene: {
      id: 'ja2-obstacle-run', kind: 'obstacle-run', bg: bgObstacle, who: 'mia',
      teacher: 'Guided, then Free: send the friend who CAN pass each obstacle and say the sentence; at the end the student picks any friend and makes their own can / can’t sentences (tap ✓ for each one).',
      friends: [
        { name: 'Leo', img: it('leo-run'), voice: 'leo', frame: 'A lion can ___. It can’t ___.' },
        { name: 'Coco', img: it('coco-swing'), voice: 'bella', frame: 'A monkey can ___. It can’t ___.' },
        { name: 'Willow', img: it('willow-fly'), voice: 'willow', frame: 'A bird can ___. It can’t ___.' },
        { name: 'Fish', img: it('fish-swim'), voice: 'pip', frame: 'A fish can ___. It can’t ___.' },
      ],
      stations: [
        { action: 'run', left: '18%', top: '64%', ask: 'The long path! Who can run fast?', options: [0, 3], answer: 0, sentence: 'A lion can run!' },
        { action: 'climb', left: '27%', top: '38%', ask: 'The tall tree! Who can climb it?', options: [3, 1, 0], answer: 1, sentence: 'A monkey can climb!' },
        { action: 'swim', left: '44%', top: '57%', ask: 'The river! Who can swim across?', options: [2, 3, 1], answer: 3, sentence: 'A fish can swim!' },
        { action: 'swing', left: '72%', top: '42%', ask: 'The big gap! Who can swing on the vines?', options: [0, 1, 3], answer: 1, sentence: 'A monkey can swing!' },
        { action: 'fly', left: '90%', top: '30%', ask: 'The top of the waterfall! Who can fly up?', options: [1, 0, 2], answer: 2, sentence: 'A bird can fly!' },
      ],
      freePrompt: 'Your turn! Pick a friend. What can it do? What can’t it do?',
      freeGoal: 3,
      doneLine: 'We got the golden banana! Super sentences!',
    },
  },
  /* 12 Free (less controlled): the teacher asks, the child answers in two sentences */
  {
    id: 'ja2-qa-stage', kind: 'join-stage', bg: bgFriends,
    teacher: 'Free: the friends ask, the student answers with TWO sentences (a can AND a can’t) — any true answer is right.',
    cast: ['coco', 'leo', 'willow'],
    turns: [
      { who: 'coco', line: 'What can a fish do?' },
      { who: 'student', line: 'A fish can swim. It can’t run!' },
      { who: 'leo', line: 'What can a monkey do?' },
      { who: 'student', line: 'A monkey can climb. It can’t fly!' },
      { who: 'willow', line: 'Your turn! Ask me: What can a bird do?' },
      { who: 'student', line: 'What can a bird do?' },
      { who: 'willow', line: 'A bird can fly!' },
    ],
  },
  /* 13 Free: spin and say (the wheel picks the animal, the child adds their own can't sentence) */
  {
    id: 'ja2-spin', kind: 'spin-wheel', bg: bgActions, title: 'Spin! What can it do?',
    teacher: 'Free: have the student spin, say the sentence, then add their own "It can’t…" sentence ("A frog can jump. It can’t fly!"). If you prefer, do the activity without the spinner.',
    items: [
      { label: 'A monkey can climb!', ...CLIMB_SPOT },
      { label: 'A lion can run!', ...RUN_SPOT },
      { label: 'A bird can fly!', ...FLY_SPOT },
      { label: 'A frog can jump!', ...JUMP_SPOT },
      { label: 'A fish can swim!', ...SWIM_SPOT },
    ],
    wheelAt: { left: '30%', top: '72%' },
  },
  /* 14 Free: personal sentence (the child's own life) */
  {
    id: 'ja2-what-can-you-do', kind: 'choice', bg: bgFriends, who: 'coco',
    teacher: 'Free: any answer is right! The student taps what they CAN do and says it, then adds one thing they can’t do: "I can swim. I can’t fly!"',
    prompt: 'What can YOU do? Tap and say it!',
    options: [
      { label: 'I can swim', emoji: '\u{1F3CA}', correct: true },
      { label: 'I can run', emoji: '\u{1F3C3}', correct: true },
      { label: 'I can climb', emoji: '\u{1F9D7}', correct: true },
      { label: 'I can jump', emoji: '\u{1F938}', correct: true },
    ],
  },
  /* 15 Phonics: ch */
  {
    id: 'ja2-blend-ch', kind: 'sound-blend', bg: bgWide, look: 'frog',
    teacher: 'Tap each lily pad and say the sound with the student (/ch/ /i/ /p/) — ch is ONE sound! Press Blend!, then find the picture.',
    rounds: [
      { word: 'chip', sounds: ['ch', 'i', 'p'], img: it('chip') },
      { word: 'chick', sounds: ['ch', 'i', 'ck'], img: it('chick') },
      { word: 'lunch', sounds: ['l', 'u', 'n', 'ch'], img: it('lunchbox') },
      { word: 'bench', sounds: ['b', 'e', 'n', 'ch'], img: it('bench') },
    ],
  },
  /* 16 Guided: quick fire */
  {
    id: 'ja2-quick-fire', kind: 'prea1', teacher: 'Guided: quick fire! Say the whole sentence before the ring runs out.',
    scene: {
      id: 'ja2-quick-fire', kind: 'rapid-recall', bg: bgActions, who: 'leo', seconds: 5,
      teacher: 'Guided: quick fire! Say the whole sentence before the ring runs out.',
      cards: [
        { img: it('fish-swim'), word: 'swim', say: 'A fish can swim.' },
        { img: it('coco-swing'), word: 'swing', say: 'A monkey can swing.' },
        { img: it('willow-fly'), word: 'fly', say: 'A bird can fly.' },
        { img: it('jungle-frog-jump'), word: 'jump', say: 'A frog can jump.' },
        { img: it('leo-run'), word: 'run', say: 'A lion can run.' },
      ],
    },
  },
  /* 17 Story payoff at the waterfall */
  {
    id: 'ja2-payoff', kind: 'cinematic', bg: bgWaterfall, title: 'We Did It!', subtitle: 'The golden banana', narrator: 'coco',
    script: [
      { who: 'coco', line: 'We did it! I can climb and swing!' },
      { who: 'leo', line: 'I can run fast. I can’t swing!' },
      { who: 'willow', line: 'I can fly! Every friend can help.' },
    ],
    cta: '\u{1F389} HOORAY!',
  },
  /* 18 Check (the plan's listening evidence: 4 of 5) */
  {
    id: 'ja2-check', kind: 'true-false', bg: bgWaterfall,
    teacher: 'Check: the student listens to each sentence and says TRUE or FALSE (aim: 4 of 5). For a false one, ask them to say the true sentence.',
    rounds: [
      { who: 'coco', statement: 'A monkey can climb.', isTrue: true },
      { who: 'leo', statement: 'A fish can run.', isTrue: false },
      { who: 'willow', statement: 'A bird can fly.', isTrue: true },
      { who: 'coco', statement: 'A monkey can fly.', isTrue: false },
      { who: 'leo', statement: 'A lion can’t swing.', isTrue: true },
    ],
  },
  /* 19 Sing-back: the child leads */
  {
    id: 'ja2-sing-back', kind: 'song', bg: bgWaterfall, title: '\u{1F3B5} Jungle Friends, Let’s Try! \u{1F3B5}',
    teacher: 'Sing-back: now the student sings the "can" lines and the teacher answers the "can’t" lines. Thumbs up, head shake!',
    durationSeconds: 47, bigWord: 'can', songUrl: SONG_A1U2L2, lineDurationsMs: SONG_A1U2L2_MS, lyrics: SONG_A1U2L2_LYRICS,
  },
  /* 20 Reflection */
  {
    id: 'ja2-favourite', kind: 'choice', bg: bgWaterfall, who: 'willow', teacher: 'Any answer is right! The student picks a favourite part and says why.',
    prompt: 'What was your favourite?',
    options: [
      { label: 'Obstacle run', emoji: '\u{1F3C1}', correct: true },
      { label: 'The song', emoji: '\u{1F3B5}', correct: true },
      { label: 'Spin and say', emoji: '\u{1F3A1}', correct: true },
      { label: 'Copy the moves', emoji: '\u{1F938}', correct: true },
    ],
  },
  /* 21 Sticker  22 Home Mission */
  {
    id: 'ja2-sticker', kind: 'prea1', teacher: 'Sticker time! First the student says the lesson sentence ("A monkey can climb. It can’t fly!"), then opens the pack.',
    scene: {
      id: 'ja2-sticker', kind: 'sticker-reward', bg: bgWaterfall, who: 'leo',
      teacher: 'Sticker time! First the student says the lesson sentence ("A monkey can climb. It can’t fly!"), then opens the pack.',
      line: 'You can say what animals can and can’t do! Here is the golden banana.',
      sticker: { img: it('banana-trophy'), label: 'Jungle Games champion!' },
    },
  },
  {
    id: 'ja2-home-mission', kind: 'prea1', teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
    scene: {
      id: 'ja2-home-mission', kind: 'home-mission', bg: bgFriends, who: 'willow',
      teacher: 'Home Mission: read the steps with the student. They do them at home with the family.',
      line: 'Your home mission!',
      parentNote: 'Today your child learned to say what animals can and can’t do: "A monkey can climb. It can’t fly." New words: climb, swing, can’t. Ask them to show you an animal and tell you about it.',
      steps: [
        { emoji: '\u{1F412}', say: 'Be an animal for your family. Move like it!' },
        { emoji: '\u{1F44D}', say: 'Say what it can do: A monkey can climb!' },
        { emoji: '\u{1F44E}', say: 'Say what it can’t do: It can’t fly!' },
      ],
    },
  },
  /* Extra time (blueprint §3b): only if there is time left */
  {
    id: 'ja2-animal-freeze', kind: 'prea1', teacher: 'Extra time: Brain break! Move like the animal, then FREEZE.',
    scene: {
      id: 'ja2-animal-freeze', kind: 'tpr-actions', mode: 'break', bg: bgObstacle, who: 'bella',
      teacher: 'Extra time: Brain break! Move like the animal, then FREEZE.',
      rounds: [
        { line: 'Swing like a monkey! Freeze!', emoji: '\u{1F412}' },
        { line: 'Fly like a bird! Freeze!', emoji: '\u{1F426}' },
        { line: 'Jump like a frog! Freeze!', emoji: '\u{1F438}' },
        { line: 'Swim like a fish! Freeze!', emoji: '\u{1F41F}' },
        { line: 'Run like a lion! Freeze!', emoji: '\u{1F981}' },
      ],
    },
  },
  {
    id: 'ja2-memory', kind: 'memory', bg: bgActions, teacher: 'Extra time: Memory! Find the pairs and say the sentence for each one: "A bird can fly!"',
    pairs: [
      { id: 'fly', label: 'fly', emoji: '\u{1F426}' },
      { id: 'swim', label: 'swim', emoji: '\u{1F41F}' },
      { id: 'run', label: 'run', emoji: '\u{1F981}' },
      { id: 'jump', label: 'jump', emoji: '\u{1F438}' },
    ],
  },
  /* Closing routine goodbye + celebration */
  {
    id: 'ja2-goodbye-song', kind: 'song', bg: bgFriends, title: '\u{1F3B5} Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: '/welcome-town/audio/goodbye-song.mp3?v=3',
    lineDurationsMs: [3600, 4120, 4020, 8322],
    lyrics: [
      { who: 'coco', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'leo', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'willow', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'coco', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },
  { id: 'ja2-finale', kind: 'finale', bg: bgWaterfall, who: 'coco', line: 'You can say what animals can and can’t do — and you blended CHIP, CHICK, LUNCH and BENCH! ✨\u{1F34C}' },
];
