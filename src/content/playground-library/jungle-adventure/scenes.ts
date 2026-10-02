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
