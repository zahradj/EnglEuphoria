/* =============================================================================
 * Welcome Town — A2 Unit 1 Lesson 1: "My Day"
 *
 * The Playground Hub's first A2-tier lesson. No A2 roadmap existed anywhere
 * in this project before this file (checked src/curriculum/roadmap and
 * src/curriculum/worlds — both explicitly comment "Future passes will add
 * A2/B1/B2/C1"; the curriculum_lessons DB table has zero A2 rows). This is
 * a from-scratch design, not an implementation of a pre-seeded plan.
 *
 * Design decisions, per playground-curriculum-engine / reading-engine:
 * - Cast: same established characters (Pip, Mia, Bella, Willow, Leo, Miss
 *   Marigold) — the character bible's own hard rule is "never invent a new
 *   character." But per direct feedback, this lesson is deliberately
 *   STANDALONE/independent from the Welcome Town School classroom world —
 *   it does not default to reusing that world's own settings just because
 *   they already exist. Pip narrates and hosts his own day (intro's
 *   narrator is `pip`, not `marigold`); Miss Marigold appears only where
 *   the story actually puts her (dropping Pip at school, a next-morning
 *   recap chat) rather than framing every scene as another classroom lesson.
 * - Topic: "My Day" (daily routines, present simple action verbs: wake up,
 *   brush teeth, eat breakfast, walk to school, play, read, sleep). NOT a
 *   repeat of A1 Unit 1's "Hello/name/age/feelings" — A2 needs its own
 *   genuinely new grammar step (action-verb present simple, not just "I am
 *   ___" copula sentences) rather than re-teaching greetings a tier up.
 * - Feelings grammar: A1 already owns first-person "I am happy/sad/tired/
 *   angry" (Welcome Town Lesson 2). A2's genuinely new step on that same
 *   thread is third-person copula — "he is / she is / they are" — plus two
 *   new feelings (hungry, thirsty) introduced where the story actually
 *   motivates them (hungry at breakfast, thirsty after playing at recess),
 *   not dropped in as an unrelated vocabulary list. "They are" is taught at
 *   the playground specifically because that's the one background in this
 *   lesson with more than one character in it — the grammar point needs a
 *   real plural referent, not an invented one.
 * - Method: varies teaching approach by what the vocabulary actually is,
 *   per semantic-learning-engine's category table — action verbs (brush
 *   teeth, walk, wake up) get TPR-style "now YOU do it" framing in the
 *   teacher line, not just tap-and-look, per direct feedback that different
 *   objectives call for different pedagogical approaches rather than one
 *   mechanical template repeated every scene.
 * - Reading (Part 2): reading-engine's A2 row is "reading fluency — longer
 *   texts, silent e, long vowels, story reading, comprehension," explicitly
 *   NOT letter-sound discovery (that's Pre-A1/A1's job, already owned).
 *   Part 2 teaches the silent-e pattern (cap->cape, kit->kite, hop->hope)
 *   building directly on A1's own CVC short-vowel words, then a short
 *   reading passage with comprehension checkpoints — never re-teaching a
 *   single letter sound from scratch.
 * - Art — rebuilt after two rounds of direct feedback, applying
 *   semantic-learning-engine and narrative-engine (both new skills this
 *   lesson's bugs motivated writing):
 *     1. The first pass reused bg-classroom-reading.png (Miss Marigold's
 *        classroom reading nook) for "read"/"sleep," on the assumption it
 *        already showed Pip reading. It doesn't — that art shows Marigold
 *        holding the book while Pip just listens, with Bella (unlabeled)
 *        asleep nearby. The data said `who: 'pip'` for "Read"; the art
 *        disagreed. Fixed by generating bg-a2-bedroom-night.png (Pip
 *        himself reading in his own bed) and bg-a2-bedroom-asleep.png (Pip
 *        himself actually asleep) — each hotspot now points at art that
 *        genuinely shows the named character performing that exact action.
 *     2. The first pass also leaned on the existing Welcome-Town classroom
 *        assets (bgCircle, bgDoor, bgReading) for most non-routine scenes,
 *        which read as "a classroom lesson with a thin daily-routine skin"
 *        rather than an independent story spanning a real day. Fixed by
 *        generating bg-a2-bathroom.png, bg-a2-kitchen.png, and
 *        bg-a2-street.png so the story's own claimed settings (bathroom,
 *        kitchen, the walk to school) actually exist as art, and by cutting
 *        bgCircle entirely — the one narratively real classroom beat
 *        (arriving at school) now carries bgDoor's only two uses.
 *     3. Adding "thirsty" (he is/she is/they are pass) first reused
 *        bg-a2-kitchen.png — the breakfast image — which shows a cereal
 *        bowl in morning light and contradicts "after playing, I am
 *        thirsty." Fixed by generating bg-a2-thirsty.png: Pip drinking from
 *        a water bottle on the playground grass, backpack beside him, so
 *        the art actually shows the stated action in the stated setting.
 * - He is/She is/They are gets three activity layers after the initial
 *   model+check (per direct feedback that eliciting alone isn't practice):
 *   a join-stage free-production round (no model line right there to lean
 *   on), three choice rounds where the student has to recall/recognize a
 *   feeling from earlier art rather than one just named out loud, and two
 *   drag-match "sentence builder" rounds (word tiles dragged into order —
 *   reusing drag-match's existing mechanic with the target slots laid out
 *   as a sentence strip instead of pinned to characters). None of this
 *   needed a new scene kind or new art — every round reuses bgKitchen,
 *   bgThirsty, or bgPlayground, already-verified-correct images.
 *   The sentence-builder rounds pass showBlanks: true (a new optional
 *   drag-match field, added to welcome-town/scenes.ts + SceneRenderer.tsx)
 *   because drag-match's default "no visible target hint" behavior — the
 *   right call for vocab matching, where the hint would just hand the
 *   student the answer — left a sentence-builder with nothing but floating
 *   words and no visible blanks to fill, so the activity read as unclear
 *   rather than as "build a sentence." showBlanks renders a dashed blank
 *   box at each target position from the start, which vocab-matching
 *   drag-match scenes (a2u1-drag-play) don't set and so keep their
 *   original recall-based behavior unchanged.
 * ========================================================================= */

import type { Scene, CharKey } from '../welcome-town/scenes';
export { CAST, VOICE_KEY } from '../welcome-town/scenes';
export type { CharKey } from '../welcome-town/scenes';

const W = '/welcome-town';

const bgWide = `${W}/scenes/bg-classroom-wide.png`;
const bgDoor = `${W}/scenes/bg-classroom-door.png`;
const bgExpressGoodbye = `${W}/scenes/bg-express-goodbye.png`;
const bgMorning = `${W}/scenes/bg-a2-morning.png`;
const bgPlayground = `${W}/scenes/bg-a2-playground.png`;
const bgBathroom = `${W}/scenes/bg-a2-bathroom.png`;
const bgKitchen = `${W}/scenes/bg-a2-kitchen.png`;
const bgStreet = `${W}/scenes/bg-a2-street.png`;
const bgBedroomNight = `${W}/scenes/bg-a2-bedroom-night.png`;
const bgBedroomAsleep = `${W}/scenes/bg-a2-bedroom-asleep.png`;
const bgThirsty = `${W}/scenes/bg-a2-thirsty.png`;

export const LESSON_A2U1L1_TITLE = 'My Day';
export const LESSON_A2U1L1_OBJECTIVE = 'Part 1: Describe a daily routine using present simple ("I wake up, I brush my teeth, I eat breakfast, I walk to school, I play, I read, I sleep"), name a feeling including hungry and thirsty, and use he is / she is / they are to say how someone else feels. Part 2: Read the silent-e pattern (cap -> cape, kit -> kite) and a short story.';

export const LESSON_A2U1L1_SCENES: Scene[] = [
  { id: 'a2u1-title', kind: 'title-card', bg: bgMorning, level: 'A2', unit: 'Unit 1', lessonLabel: 'Lesson 1', title: 'My Day', subtitle: 'Follow Pip from morning to night', cta: '\u{1F31E} LET’S GO!' },

  {
    // Pip hosts his own standalone lesson (narrator: pip, not marigold) —
    // this is his day, told by him, not another classroom announcement.
    id: 'a2u1-intro', kind: 'cinematic', bg: bgMorning, title: 'My Day', subtitle: 'Come see what I do every day!', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hi! I am Pip. Let me show you my whole day!' },
      { who: 'pip', line: 'From waking up... all the way to going to sleep. Ready?' },
    ],
    cta: '\u{1F31E} LET’S GO!',
  },

  {
    id: 'a2u1-meet-wakeup', kind: 'meet', bg: bgMorning, who: 'pip',
    teacher: 'Tap Pip to see how his day starts! Then stretch your arms like you just woke up too.',
    line: 'Every morning, I wake up! Good morning!', repeat: 'I wake up.',
  },

  {
    // TPR framing for an action verb, per semantic-learning-engine's own
    // category table (Action -> mime/TPR, not just tap-and-look) and the
    // user's own preference for varying teaching method by objective, not
    // defaulting to one mechanical template.
    id: 'a2u1-meet-brushteeth', kind: 'meet', bg: bgBathroom, who: 'pip',
    teacher: 'Tap Pip, then show me — brush your teeth up and down, up and down!',
    line: 'Every morning, I brush my teeth!', repeat: 'I brush my teeth.',
  },

  {
    id: 'a2u1-meet-breakfast', kind: 'meet', bg: bgKitchen, who: 'pip',
    teacher: 'Tap Pip, then rub your tummy and say "Yum, yum!"',
    line: 'I am hungry! So I eat my breakfast. Yum, yum!', repeat: 'I am hungry.',
  },

  {
    id: 'a2u1-meet-walk', kind: 'meet', bg: bgStreet, who: 'pip',
    teacher: 'Tap Pip, then march in place like YOU are walking to school!',
    line: 'I put on my backpack, and I walk to school!', repeat: 'I walk to school.',
  },

  {
    // Single, narratively-justified use of the classroom door — this is
    // the one moment in the story that actually happens there (arriving
    // at school), plus a quick, naturally-anchored A1 recall instead of a
    // separate floating circle-time recap scene.
    id: 'a2u1-arrive', kind: 'roleplay', bg: bgDoor, teacher: 'Pip arrives at school! Listen, then repeat each line.', cast: ['marigold', 'pip'],
    script: [
      { who: 'marigold', line: 'Good morning, Pip! How are you?', repeat: true },
      { who: 'pip', line: 'I am happy! I am ready to learn.', repeat: true },
    ],
  },

  {
    id: 'a2u1-vocab-play', kind: 'vocab-spot', bg: bgPlayground,
    teacher: 'Recess time! Tap the arrow to learn what each friend is doing.',
    items: [
      { label: 'Slide', sentence: 'Mia goes down the slide.', emoji: '\u{1F6DD}', left: '15%', top: '48%', color: '#B85CD1', who: 'mia' },
      { label: 'Play', sentence: 'Pip plays and runs.', emoji: '\u{1F3C3}', left: '48%', top: '58%', color: '#FE6A2F', who: 'pip' },
      { label: 'Swing', sentence: 'Leo swings high.', emoji: '\u{1F389}', left: '85%', top: '52%', color: '#C97A2F', who: 'leo' },
    ],
  },
  {
    id: 'a2u1-drag-play', kind: 'drag-match', bg: bgPlayground, teacher: 'Listen, then drag each word to the right friend!',
    items: [
      { label: 'Slide', color: '#B85CD1', who: 'mia', targetLeft: '15%', targetTop: '48%' },
      { label: 'Play', color: '#FE6A2F', who: 'pip', targetLeft: '48%', targetTop: '58%' },
      { label: 'Swing', color: '#C97A2F', who: 'leo', targetLeft: '85%', targetTop: '52%' },
    ],
  },

  {
    // "Thirsty" lands here rather than being invented out of nowhere —
    // running around at recess is exactly when a child would genuinely
    // feel thirsty, so the vocabulary has a real narrative reason to show
    // up at this point in the day, not just because a slot was open.
    // Semantic fix: this used to reuse bgKitchen (the breakfast image —
    // cereal bowl, morning light), which contradicts "after playing" and
    // doesn't show drinking at all. Generated bg-a2-thirsty.png instead:
    // Pip sitting on the playground grass, drinking from a water bottle,
    // with a sweat drop and his backpack beside him — same playground
    // setting the recess scenes just used, actually showing the action.
    id: 'a2u1-meet-thirsty', kind: 'meet', bg: bgThirsty, who: 'pip',
    teacher: 'Tap Pip, then pretend to drink from a cup!',
    line: 'After playing, I am thirsty! I drink some water.', repeat: 'I am thirsty.',
  },

  {
    // NEW grammar: he is / she is / they are + feeling. A1 already taught
    // first-person "I am happy/sad/tired/angry" — this is A2's natural next
    // step on the same grammar thread (third person, singular and plural),
    // not an unrelated topic. Reuses bg-a2-playground.png, which already
    // has Pip, Mia, and Leo together — the one image in this whole lesson
    // that can actually show a "they" for "they are."
    id: 'a2u1-hesheare-model', kind: 'roleplay', bg: bgPlayground, teacher: 'Look at everyone at the playground! Listen, then repeat each line.', cast: ['marigold', 'pip', 'mia', 'leo'],
    script: [
      { who: 'marigold', line: 'Look at Pip. He is happy!', repeat: true },
      { who: 'marigold', line: 'Look at Mia. She is happy too!', repeat: true },
      { who: 'marigold', line: 'Look at Pip, Mia, and Leo. They are happy!', repeat: true },
    ],
  },
  {
    id: 'a2u1-hesheare-choice', kind: 'choice', bg: bgPlayground, who: 'marigold', teacher: 'Listen carefully, then tap the right word!',
    prompt: 'Pip and Mia are playing together. ______ are happy.',
    options: [
      { label: 'They', emoji: '\u{1F60A}', correct: true },
      { label: 'He', emoji: '\u{1F60A}' },
      { label: 'She', emoji: '\u{1F60A}' },
    ],
  },

  {
    // Free practice: modeled (roleplay) and checked (choice) both come with
    // a model line right there to lean on. This is the independent-
    // production step — join-stage's own established pattern (student turns
    // with no correctness gate, per a2u1-join-stage below) fits exactly
    // because the student has to produce "He is / She is / They are" from
    // memory, not pick it out of a list. Reuses bgPlayground: same three
    // friends, no new art needed.
    id: 'a2u1-hesheare-practice', kind: 'join-stage', bg: bgPlayground, teacher: 'Your turn! Finish each sentence about your friends.', cast: ['pip', 'mia', 'leo'],
    turns: [
      { who: 'pip', line: 'Look at Mia on the slide!' },
      { who: 'student', line: '______ happy!' },
      { who: 'pip', line: 'Now look at Leo on the swing!' },
      { who: 'student', line: '______ happy!' },
      { who: 'pip', line: 'Now look at all three of us together!' },
      { who: 'student', line: '______ happy!' },
    ],
  },

  {
    // Guess-the-feeling round 1 of 3 — the student has to recall/recognize
    // a feeling from the art itself, not just repeat one that was just
    // named. Reuses bgKitchen (breakfast: cereal bowl, morning light,
    // already anchors "hungry" earlier in this lesson) rather than
    // inventing a new multi-character emotion-guessing image.
    id: 'a2u1-guess-feeling-kitchen', kind: 'choice', bg: bgKitchen, who: 'marigold', teacher: 'Think back to Pip’s morning. Guess how he feels!',
    prompt: 'Look at Pip at breakfast. How does he feel?',
    options: [
      { label: 'Hungry', emoji: '\u{1F35E}', correct: true },
      { label: 'Sleepy', emoji: '\u{1F634}' },
      { label: 'Cold', emoji: '\u{1F976}' },
    ],
  },
  {
    // Guess-the-feeling round 2 of 3 — bg-a2-thirsty.png (generated earlier
    // this session specifically because the old kitchen-reuse didn't show
    // "thirsty" at all).
    id: 'a2u1-guess-feeling-thirsty', kind: 'choice', bg: bgThirsty, who: 'marigold', teacher: 'Think back to recess. Guess how Pip feels!',
    prompt: 'Look at Pip after playing. How does he feel?',
    options: [
      { label: 'Thirsty', emoji: '\u{1F964}', correct: true },
      { label: 'Angry', emoji: '\u{1F620}' },
      { label: 'Cold', emoji: '\u{1F976}' },
    ],
  },
  {
    // Guess-the-feeling round 3 of 3 — pairs the feeling-recognition task
    // with today's new grammar (the correct pronoun for a group is "they").
    id: 'a2u1-guess-feeling-playground', kind: 'choice', bg: bgPlayground, who: 'marigold', teacher: 'Look at everyone at the playground. Guess how they feel!',
    prompt: 'Look at Pip, Mia, and Leo together. How do they feel?',
    options: [
      { label: 'Happy', emoji: '\u{1F604}', correct: true },
      { label: 'Sad', emoji: '\u{1F622}' },
      { label: 'Tired', emoji: '\u{1F62A}' },
    ],
  },

  {
    // Sentence builder 1 of 2 — reuses drag-match exactly as already built
    // (word tiles dragged to fixed positions), just with the three target
    // slots laid out left-to-right as a sentence strip instead of pinned to
    // characters in the art. "He" ties to Leo (the boy at the swing in this
    // same bgPlayground image), so tapping a tile plays in his voice.
    // pointTo reuses the exact left/top already verified for Leo by the
    // vocab-spot/drag-match items earlier in this lesson (a2u1-vocab-play) —
    // "he" is otherwise ambiguous with three characters on screen at once.
    // Sentence strip sits high (top: 20%) and tight (38/50/62%) so it
    // reads as one compact sentence bar under the teacher banner, not
    // three words scattered loosely across the middle of the scene.
    id: 'a2u1-sentence-builder-he', kind: 'drag-match', bg: bgPlayground, showBlanks: true, pointTo: [{ who: 'leo', left: '85%', top: '52%' }], teacher: 'Drag the words into the empty boxes to build the sentence: He is happy.',
    items: [
      { label: 'He', color: '#C97A2F', who: 'leo', targetLeft: '38%', targetTop: '20%' },
      { label: 'is', color: '#C97A2F', who: 'leo', targetLeft: '50%', targetTop: '20%' },
      { label: 'happy', color: '#C97A2F', who: 'leo', targetLeft: '62%', targetTop: '20%' },
    ],
  },
  {
    // Sentence builder 2 of 2 — "They are" for the group, narrated in
    // Pip's voice since he is the one telling the group's own story.
    // "They" needs all three arrows — a group pronoun is exactly the case
    // where a single arrow wouldn't be enough to make the referent evident.
    // Same high, tight sentence-strip layout as a2u1-sentence-builder-he.
    id: 'a2u1-sentence-builder-they', kind: 'drag-match', bg: bgPlayground, showBlanks: true, pointTo: [{ who: 'mia', left: '15%', top: '48%' }, { who: 'pip', left: '48%', top: '58%' }, { who: 'leo', left: '85%', top: '52%' }], teacher: 'Drag the words into the empty boxes to build the sentence: They are happy.',
    items: [
      { label: 'They', color: '#FE6A2F', who: 'pip', targetLeft: '38%', targetTop: '20%' },
      { label: 'are', color: '#FE6A2F', who: 'pip', targetLeft: '50%', targetTop: '20%' },
      { label: 'happy', color: '#FE6A2F', who: 'pip', targetLeft: '62%', targetTop: '20%' },
    ],
  },

  {
    // Semantic fix: bg-a2-bedroom-night.png genuinely shows Pip himself
    // reading (not a reused classroom image where the teacher holds the
    // book) — "who: pip" now actually matches what's drawn.
    id: 'a2u1-meet-read', kind: 'meet', bg: bgBedroomNight, who: 'pip',
    teacher: 'Tap Pip to hear what he does before bed.',
    line: 'At night, I read my favorite book.', repeat: 'I read a book.',
  },
  {
    // Semantic fix: "sleep" now points at dedicated art of Pip actually
    // asleep, not a generic unlabeled rabbit in someone else's scene.
    id: 'a2u1-meet-sleep', kind: 'meet', bg: bgBedroomAsleep, who: 'pip',
    teacher: 'Tap Pip, then close your eyes like YOU are falling asleep too!',
    line: 'Then I close my eyes. I sleep. Good night!', repeat: 'I sleep.',
  },

  {
    id: 'a2u1-roleplay', kind: 'roleplay', bg: bgDoor, teacher: 'The next morning, Miss Marigold asks about Pip’s day. Listen, then repeat each line.', cast: ['marigold', 'pip'],
    script: [
      { who: 'marigold', line: 'What do you do in the morning, Pip?', repeat: true },
      { who: 'pip', line: 'I wake up. I brush my teeth. Then I eat breakfast.', repeat: true },
      { who: 'marigold', line: 'What do you do at recess?', repeat: true },
      { who: 'pip', line: 'I play! I run and slide.', repeat: true },
      { who: 'marigold', line: 'What do you do at night?', repeat: true },
      { who: 'pip', line: 'I read a book. Then I sleep.', repeat: true },
    ],
  },

  {
    // Bedtime chat instead of a second classroom circle scene — Pip has
    // just told his own story, now he invites the student to share theirs.
    id: 'a2u1-join-stage', kind: 'join-stage', bg: bgBedroomNight, teacher: 'Your turn! When it says YOU, say what YOU do.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'What do you do in the morning?' },
      { who: 'student', line: 'I wake up. I ______.' },
      { who: 'pip', line: 'What do you do at recess?' },
      { who: 'student', line: 'I ______.' },
      { who: 'pip', line: 'Great! Every day is an adventure.' },
    ],
  },

  {
    id: 'a2u1-choice', kind: 'choice', bg: bgBedroomAsleep, who: 'pip', teacher: 'Listen carefully, then tap the right answer!',
    prompt: 'Which word means SLEEP?',
    options: [
      { label: 'Sleep', emoji: '\u{1F634}', correct: true },
      { label: 'Play', emoji: '\u{1F3C3}' },
      { label: 'Read', emoji: '\u{1F4D6}' },
    ],
  },

  {
    id: 'a2u1-storybook', kind: 'flipbook', bg: bgWide, title: "A Day with Pip",
    pages: [
      { who: 'pip', img: bgMorning, text: 'It is morning. Pip wakes up. "Good morning!"' },
      { who: 'pip', img: bgBathroom, text: 'Pip brushes his teeth. Scrub, scrub, scrub!' },
      { who: 'pip', img: bgKitchen, text: 'Pip eats breakfast. Yum, yum!' },
      { who: 'pip', img: bgStreet, text: 'Pip puts on his backpack and walks to school.' },
      { who: 'pip', img: bgPlayground, text: 'At recess, Pip plays with his friends. He runs and slides!' },
      { who: 'pip', img: bgBedroomNight, text: 'At night, Pip reads his favorite book.' },
      { who: 'pip', img: bgBedroomAsleep, text: 'Then he closes his eyes and sleeps. Good night, Pip!' },
    ],
    checkpoints: [
      { afterPage: 0, who: 'pip', question: 'What does Pip do first?', options: ['He sleeps', 'He wakes up', 'He plays'], answer: 'He wakes up' },
      { afterPage: 4, who: 'pip', question: 'What does Pip do at recess?', options: ['He reads', 'He sleeps', 'He plays'], answer: 'He plays' },
    ],
  },

  {
    id: 'a2u1-break', kind: 'title-card', bg: bgWide, level: 'A2', unit: 'Unit 1', lessonLabel: 'Break Time', title: 'Great Job!', subtitle: 'Stretch, get some water, then come back for Part 2!', cta: '\u{1F938} I’m Ready!',
  },

  /* =========================== Part 2: Reading — The Magic E =========================
   * A2's own reading-fluency stage per reading-engine (silent e, long
   * vowels) — builds directly on A1's short-vowel CVC words (SAT, PIN,
   * SIT) rather than reteaching any letter sound from scratch. */

  { id: 'a2u1-part2-title', kind: 'title-card', bg: bgBedroomNight, level: 'A2', unit: 'Unit 1', lessonLabel: 'Part 2', title: 'Reading Time! The Magic E', subtitle: 'One little letter changes the whole word', cta: '\u{1F4D6} LET’S READ!' },

  {
    id: 'a2u1-magic-e-intro', kind: 'cinematic', bg: bgBedroomNight, title: 'The Magic E', subtitle: 'Watch what happens when E jumps to the end', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Look at the word "cap." Short a, like in apple.' },
      { who: 'marigold', line: 'Now add a magic E to the end: "cape"! The A says its own name!' },
    ],
    cta: 'Try it!',
  },
  {
    id: 'a2u1-wordbuild-cape', kind: 'word-build', bg: bgBedroomNight, teacher: 'Add the magic E! Turn "cap" into "cape."',
    rounds: [
      { word: 'CAPE', blankIndex: 3, answer: 'E', choices: ['E', 'A', 'O'], emoji: '\u{1F9B8}' },
    ],
  },
  {
    id: 'a2u1-wordbuild-kite', kind: 'word-build', bg: bgBedroomNight, teacher: 'Add the magic E! Turn "kit" into "kite."',
    rounds: [
      { word: 'KITE', blankIndex: 3, answer: 'E', choices: ['E', 'I', 'U'], emoji: '\u{1FA81}' },
    ],
  },
  {
    id: 'a2u1-wordbuild-hope', kind: 'word-build', bg: bgBedroomNight, teacher: 'Add the magic E! Turn "hop" into "hope."',
    rounds: [
      { word: 'HOPE', blankIndex: 3, answer: 'E', choices: ['E', 'O', 'A'], emoji: '\u{1F31F}' },
    ],
  },

  {
    id: 'a2u1-reading-story', kind: 'flipbook', bg: bgPlayground, title: "Leo's New Kite",
    pages: [
      { who: 'leo', img: bgPlayground, text: 'Leo has a new kite. He hopes it will fly high.' },
      { who: 'leo', img: bgPlayground, text: 'Leo runs across the playground with his kite.' },
      { who: 'leo', img: bgPlayground, text: 'The kite flies up, up, up! Leo is so happy.' },
      { who: 'leo', img: bgPlayground, text: '"I hope we fly my kite again tomorrow!" says Leo.' },
    ],
    checkpoints: [
      { afterPage: 0, who: 'leo', question: 'What is new?', options: ['A book', 'A kite', 'A bike'], answer: 'A kite' },
      { afterPage: 2, who: 'leo', question: 'How does Leo feel when the kite flies?', options: ['Sad', 'Happy', 'Tired'], answer: 'Happy' },
    ],
  },

  {
    id: 'a2u1-review-choice', kind: 'choice', bg: bgBedroomNight, who: 'marigold', teacher: 'Listen carefully, then tap the word with the magic E sound!',
    prompt: 'Which word has the magic E sound?',
    options: [
      { label: 'Kite', emoji: '\u{1FA81}', correct: true },
      { label: 'Sit', emoji: '\u{1FA91}' },
      { label: 'Sat', emoji: '\u{1FA91}' },
    ],
  },

  {
    id: 'a2u1-goodbye-song', kind: 'song', bg: bgExpressGoodbye, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
    durationSeconds: 20, bigWord: 'Goodbye',
    songUrl: `${W}/audio/goodbye-song.mp3`,
    lyrics: [
      { who: 'marigold', text: '\u{1F44B} Goodbye, goodbye, my new friend' },
      { who: 'pip', text: '\u{1F44B} Goodbye, goodbye, see you again' },
      { who: 'marigold', text: '\u{1F3EB} Welcome Town School is happy today' },
      { who: 'pip', text: '\u{1F496} Byeeee, friends! See you soon!' },
    ],
  },

  {
    id: 'a2u1-finale', kind: 'finale', bg: bgWide, who: 'pip',
    line: 'You did it! You can talk about your whole day, and you read words with the magic E! \u{1F3C6} Tonight, tell your family what you do every morning — and try reading a magic-E word together!',
  },
];
