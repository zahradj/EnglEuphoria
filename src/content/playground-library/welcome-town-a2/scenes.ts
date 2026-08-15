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
const bgCalendar = `${W}/scenes/bg-a2-calendar.png`;
const bgWeekend = `${W}/scenes/bg-a2-weekend.png`;

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

/* =============================================================================
 * Welcome Town — A2 Unit 1 Lesson 2: "My Week"
 *
 * Progressive-combination rule applied directly: this lesson does not repeat
 * L1's daily-routine verbs or he/she/they-are grammar in isolation — it
 * teaches two genuinely new things (days of the week; frequency adverbs
 * always/usually/sometimes/never) and immediately fuses the new grammar with
 * L1's own routine verbs ("I ALWAYS wake up early," "I NEVER go to school on
 * Sunday") rather than practicing them side by side as unrelated sentences.
 * Same standalone-story convention as L1: Pip narrates his own week; Miss
 * Marigold appears only for the frequency-adverb model exchange (mirroring
 * exactly how L1 used her only for the he/she/they-are model), not as a
 * default classroom frame.
 *
 * Vocabulary: days of the week (Monday-Sunday), weekday/weekend as a real
 * concept (not just seven isolated words), reusing L1's own routine verbs
 * (wake up, brush teeth, play, read, go to school) as the content the new
 * frequency grammar operates on.
 *
 * New mechanic: `frequency-ladder` (added to scenes.ts + SceneRenderer.tsx).
 * Researched rather than invented from nothing — a vertical never-at-the-
 * bottom/always-at-the-top scale is a real, established ESL technique for
 * teaching frequency adverbs (as opposed to a flat multiple-choice list,
 * which doesn't show that the four answers are actually ordered against
 * each other). `choice` already existed and could have technically hosted
 * a "which word fits" round, but it can't express that ordering visually,
 * which is the entire pedagogical point of teaching frequency on a scale.
 *
 * Art: two new full-bleed backgrounds (bg-a2-calendar.png, bg-a2-
 * weekend.png), both generated against the existing bg-a2-morning.png /
 * bg-a2-playground.png as style + Pip-design references, matching L1's own
 * process rather than reusing an off-model asset from a different world.
 * Everything else reuses L1's already-verified-correct art (bgPlayground,
 * bgKitchen, bgStreet, bgBedroomNight, bgWide, bgExpressGoodbye) — the same
 * "no new asset unless the story genuinely needs one" discipline L1 used.
 *
 * Reading (Part 2): the long-vowel 'ay' spelling (day, play, stay) is the
 * next step on A2's own silent-e/long-vowel reading-fluency arc from L1,
 * and is thematically bridged from Part 1's own vocabulary ("day" is
 * literally the week's own unit word), not an unrelated phonics topic
 * bolted on. The review-choice round deliberately includes "kite" as a
 * distractor so students have to tell 'ay' apart from L1's own silent-e
 * long-A spelling, not just recognize "a word that sounds long."
 * ========================================================================= */

export const LESSON_A2U1L2_TITLE = 'My Week';
export const LESSON_A2U1L2_OBJECTIVE = 'Part 1: Name the days of the week, tell weekdays from the weekend, and use always / usually / sometimes / never with daily-routine verbs to describe a weekly pattern ("I always wake up early. I never go to school on Sunday."). Part 2: Read the long-vowel "ay" pattern (day, play, stay) and a short story.';

const A2U1L2_DAYS: { label: string; sentence: string; emoji: string; left: string }[] = [
  { label: 'Monday', sentence: 'On Monday, I go to school.', emoji: '\u{1F3EB}', left: '24%' },
  { label: 'Tuesday', sentence: 'On Tuesday, I play soccer.', emoji: '\u{26BD}', left: '33%' },
  { label: 'Wednesday', sentence: 'On Wednesday, I read a new book.', emoji: '\u{1F4D6}', left: '42%' },
  { label: 'Thursday', sentence: 'On Thursday, I visit my friend Leo.', emoji: '\u{1F917}', left: '51%' },
  { label: 'Friday', sentence: 'On Friday, I am so happy — the weekend is close!', emoji: '\u{1F600}', left: '60%' },
  { label: 'Saturday', sentence: 'On Saturday, I fly my kite all day.', emoji: '\u{1FA81}', left: '69%' },
  { label: 'Sunday', sentence: 'On Sunday, I rest at home with my family.', emoji: '\u{1F3E0}', left: '78%' },
];

export const LESSON_A2U1L2_SCENES: Scene[] = [
  { id: 'a2u1l2-title', kind: 'title-card', bg: bgCalendar, level: 'A2', unit: 'Unit 1', lessonLabel: 'Lesson 2', title: 'My Week', subtitle: 'Every day is a new adventure!', cta: '\u{1F4C5} LET’S GO!' },

  {
    id: 'a2u1l2-intro', kind: 'cinematic', bg: bgCalendar, title: 'My Week', subtitle: 'Come see my whole week!', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hi! I am Pip. Do you know all the days of the week?' },
      { who: 'pip', line: 'Every day is different! Let’s look at my whole week together.' },
    ],
    cta: '\u{1F4C5} LET’S GO!',
  },

  {
    id: 'a2u1l2-vocab-days', kind: 'vocab-spot', bg: bgCalendar,
    teacher: 'Tap each day on my calendar to learn its name!',
    items: A2U1L2_DAYS.map((d) => ({ label: d.label, sentence: d.sentence, emoji: d.emoji, left: d.left, top: '42%', color: '#FE6A2F', who: 'pip' as const })),
  },

  {
    // Deliberately NOT re-using the same left% as a2u1l2-vocab-days above —
    // if the blanks sat on the exact calendar columns the student just
    // tapped, this would test position-memory, not day-sequence knowledge.
    // A neutral sentence-strip row (same showBlanks convention L1's
    // sentence-builders used) tests the actual target: which day comes
    // first, second, third...
    id: 'a2u1l2-day-order', kind: 'drag-match', bg: bgCalendar, showBlanks: true, teacher: 'Drag the days into order — which day comes first?',
    items: A2U1L2_DAYS.map((d, i) => ({
      label: d.label,
      color: i % 2 === 0 ? '#FE6A2F' : '#B85CD1',
      who: 'pip' as const,
      targetLeft: ['10%', '23%', '37%', '50%', '63%', '77%', '90%'][i],
      targetTop: '18%',
    })),
  },

  {
    // New grammar model — mirrors L1's a2u1-hesheare-model exactly (Marigold
    // elicits, Pip answers, each line repeated), just for always/usually/
    // sometimes/never fused directly onto L1's own routine verbs instead of
    // introducing new ones.
    id: 'a2u1l2-model-frequency', kind: 'roleplay', bg: bgCalendar, teacher: 'Listen to Pip talk about his week, then repeat each line.', cast: ['marigold', 'pip'],
    script: [
      { who: 'marigold', line: 'Pip, what do you ALWAYS do in the morning?', repeat: true },
      { who: 'pip', line: 'I always wake up and brush my teeth!', repeat: true },
      { who: 'marigold', line: 'What do you USUALLY do after school?', repeat: true },
      { who: 'pip', line: 'I usually play with my friends.', repeat: true },
      { who: 'marigold', line: 'Do you SOMETIMES eat pizza?', repeat: true },
      { who: 'pip', line: 'Yes! I sometimes eat pizza on Friday.', repeat: true },
      { who: 'marigold', line: 'Do you ever go to school on Sunday?', repeat: true },
      { who: 'pip', line: 'No! I NEVER go to school on Sunday. It is the weekend!', repeat: true },
    ],
  },

  {
    id: 'a2u1l2-choice-frequency', kind: 'choice', bg: bgCalendar, who: 'marigold', teacher: 'Listen carefully, then tap the right word!',
    prompt: 'Which word means EVERY single day — 100% of the time?',
    options: [
      { label: 'Always', emoji: '\u{1F4AF}', correct: true },
      { label: 'Sometimes', emoji: '\u{1F937}' },
      { label: 'Never', emoji: '\u{274C}' },
    ],
  },

  {
    // The core combination point: L1's own routine verbs (wake up, brush
    // teeth, read, play, go to school), each placed on the frequency scale
    // that IS this lesson's new grammar — not a fresh, unrelated vocabulary
    // list standing next to the old one.
    id: 'a2u1l2-ladder', kind: 'frequency-ladder', bg: bgWeekend, who: 'pip', teacher: 'Tap the rung that matches Pip’s week!',
    rounds: [
      { action: 'wake up early', emoji: '\u{23F0}', answer: 'always', line: 'I always wake up early!' },
      { action: 'brush your teeth', emoji: '\u{1FAA5}', answer: 'always', line: 'I always brush my teeth!' },
      { action: 'read before bed', emoji: '\u{1F4D6}', answer: 'usually', line: 'I usually read before bed.' },
      { action: 'play soccer on Saturday', emoji: '\u{26BD}', answer: 'sometimes', line: 'I sometimes play soccer on Saturday.' },
      { action: 'go to school on Sunday', emoji: '\u{1F3EB}', answer: 'never', line: 'I never go to school on Sunday!' },
    ],
  },

  {
    id: 'a2u1l2-weekend-choice', kind: 'choice', bg: bgWeekend, who: 'pip', teacher: 'Listen, then tap the right answer!',
    prompt: 'No school today! Which day is part of the WEEKEND?',
    options: [
      { label: 'Saturday', emoji: '\u{1F389}', correct: true },
      { label: 'Monday', emoji: '\u{1F3EB}' },
      { label: 'Wednesday', emoji: '\u{1F3EB}' },
    ],
  },

  {
    id: 'a2u1l2-join-stage', kind: 'join-stage', bg: bgWeekend, teacher: 'Your turn! Answer with always, usually, sometimes, or never.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'How often do you play outside?' },
      { who: 'student', line: 'I ______ play outside.' },
      { who: 'pip', line: 'How often do you read a book?' },
      { who: 'student', line: 'I ______ read a book.' },
      { who: 'pip', line: 'Great! Every week is a fun week.' },
    ],
  },

  {
    id: 'a2u1l2-storybook', kind: 'flipbook', bg: bgWide, title: 'Pip’s Busy Week',
    pages: [
      { who: 'pip', img: bgStreet, text: 'On Monday, Pip walks to school. He always says hello to his friends.' },
      { who: 'pip', img: bgPlayground, text: 'On Tuesday, Pip plays soccer with Leo. He usually wins!' },
      { who: 'pip', img: bgBedroomNight, text: 'On Wednesday, Pip reads a new book. He loves story time.' },
      { who: 'pip', img: bgPlayground, text: 'On Thursday, Pip visits Leo. They laugh and play together.' },
      { who: 'pip', img: bgKitchen, text: 'On Friday, Pip is very happy — pizza night! Tomorrow is Saturday.' },
      { who: 'pip', img: bgWeekend, text: 'On Saturday, Pip flies his kite all afternoon. No school today!' },
      { who: 'pip', img: bgWeekend, text: 'On Sunday, Pip rests at home with his family. Good night, week!' },
    ],
    checkpoints: [
      { afterPage: 1, who: 'pip', question: 'What does Pip do on Tuesday?', options: ['He reads', 'He plays soccer', 'He sleeps'], answer: 'He plays soccer' },
      { afterPage: 5, who: 'pip', question: 'Why does Pip fly his kite on Saturday?', options: ['He has school', 'It is the weekend', 'He is tired'], answer: 'It is the weekend' },
    ],
  },

  { id: 'a2u1l2-break', kind: 'title-card', bg: bgWide, level: 'A2', unit: 'Unit 1', lessonLabel: 'Break Time', title: 'Great Job!', subtitle: 'Stretch, get some water, then come back for Part 2!', cta: '\u{1F938} I’m Ready!' },

  /* =========================== Part 2: Reading — Day, Play, Stay =========
   * The 'ay' long-vowel spelling — the next step on A2's own long-vowel
   * reading-fluency arc from L1's silent-e (cap->cape), bridged thematically
   * from this lesson's own "day" vocabulary rather than an unrelated
   * phonics topic. */

  { id: 'a2u1l2-part2-title', kind: 'title-card', bg: bgBedroomNight, level: 'A2', unit: 'Unit 1', lessonLabel: 'Part 2', title: 'Reading Time! Day, Play, Stay', subtitle: 'Two letters, one long sound', cta: '\u{1F4D6} LET’S READ!' },

  {
    id: 'a2u1l2-ay-intro', kind: 'cinematic', bg: bgBedroomNight, title: 'The AY Sound', subtitle: 'Two letters that make one long sound', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Look at the word “day.” Two letters, A and Y, together make one long A sound!' },
      { who: 'marigold', line: 'Listen: d-ay, day! Now try “play” and “stay” — same “ay” sound!' },
    ],
    cta: 'Try it!',
  },
  {
    id: 'a2u1l2-wordbuild-day', kind: 'word-build', bg: bgBedroomNight, teacher: 'Complete the word: D_Y',
    rounds: [{ word: 'DAY', blankIndex: 1, answer: 'A', choices: ['A', 'E', 'U'], emoji: '\u{2600}\u{FE0F}' }],
  },
  {
    id: 'a2u1l2-wordbuild-play', kind: 'word-build', bg: bgBedroomNight, teacher: 'Complete the word: PL_Y',
    rounds: [{ word: 'PLAY', blankIndex: 2, answer: 'A', choices: ['A', 'O', 'I'], emoji: '\u{26BD}' }],
  },
  {
    id: 'a2u1l2-wordbuild-stay', kind: 'word-build', bg: bgBedroomNight, teacher: 'Complete the word: ST_Y',
    rounds: [{ word: 'STAY', blankIndex: 2, answer: 'A', choices: ['A', 'E', 'O'], emoji: '\u{1F3E0}' }],
  },

  {
    id: 'a2u1l2-reading-story', kind: 'flipbook', bg: bgWeekend, title: 'Mia’s Sunny Day',
    pages: [
      { who: 'mia', img: bgWeekend, text: 'It is Saturday. Mia wants to play all day.' },
      { who: 'mia', img: bgWeekend, text: '“Let’s stay outside and play!” says Mia.' },
      { who: 'mia', img: bgPlayground, text: 'Mia and her friends play and play. What a fun day!' },
      { who: 'mia', img: bgWeekend, text: '“I hope every day can be like today!” says Mia.' },
    ],
    checkpoints: [
      { afterPage: 0, who: 'mia', question: 'What day is it in the story?', options: ['Monday', 'Saturday', 'Wednesday'], answer: 'Saturday' },
      { afterPage: 2, who: 'mia', question: 'What do Mia and her friends do?', options: ['They sleep', 'They play', 'They read'], answer: 'They play' },
    ],
  },

  {
    // "Kite" is a deliberate distractor, not a random wrong answer — it
    // tests whether the student can tell today's "ay" spelling apart from
    // L1's own silent-e long-A/I spelling, not just "a word that sounds
    // long."
    id: 'a2u1l2-review-choice', kind: 'choice', bg: bgBedroomNight, who: 'marigold', teacher: 'Listen carefully, then tap the word with the “ay” sound!',
    prompt: 'Which word has the long A “ay” sound?',
    options: [
      { label: 'Play', emoji: '\u{26BD}', correct: true },
      { label: 'Cat', emoji: '\u{1F408}' },
      { label: 'Kite', emoji: '\u{1FA81}' },
    ],
  },

  {
    id: 'a2u1l2-goodbye-song', kind: 'song', bg: bgExpressGoodbye, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
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
    id: 'a2u1l2-finale', kind: 'finale', bg: bgWide, who: 'pip',
    line: 'You did it! You know the days of the week, and you can say how often you do things! \u{1F3C6} Tonight, tell your family what you ALWAYS do every week — and try reading an “ay” word together!',
  },
];

/* =============================================================================
 * Welcome Town — A2 Unit 1 Lesson 3: "Yesterday"
 *
 * Third rung on the same present-simple -> present+frequency -> PAST SIMPLE
 * tense ladder: L1 taught daily-routine present simple in isolation, L2
 * fused it with frequency adverbs, L3 fuses the exact same verb set again
 * with the unit's first past-tense grammar — never re-teaching "wake up /
 * brush teeth / play / read / sleep" as vocabulary, only ever as the
 * content the new grammar operates on. Genuinely new content: past simple
 * (regular -ed vs. irregular forms) and "yesterday" as a time marker.
 *
 * Deliberately reuses L1's own art wholesale rather than generating
 * anything new — bgMorning, bgBathroom, bgKitchen, bgStreet, bgPlayground,
 * bgBedroomNight, bgBedroomAsleep are the exact same images the "My Day"
 * storybook used. That's not corner-cutting: the whole lesson's premise is
 * Pip looking back at a day that already happened, so retelling it over
 * the identical pictures — now in past tense — is the more honest choice
 * than painting a second, different-looking "yesterday."
 *
 * No new scene kind this lesson, on purpose — L2 already added
 * frequency-ladder; reaching for a new mechanic every single lesson would
 * turn "unique" into "gimmicky." Regular-vs-irregular is taught the same
 * way L1 taught its three-round "guess the feeling" sequence: consecutive
 * `choice` scenes, each anchored on the routine's own established image
 * (bgStreet for "walked," bgKitchen for "ate"), which is the actual novel
 * part — using the pictures the student already associates with each verb
 * as the retrieval cue, not a flashcard word floating on nothing.
 *
 * Part 2 continues the long-vowel reading arc L1 (silent e) and L2 (ay)
 * built: "ee" (see, tree, sleep) — bridged from this lesson's own "slept"
 * vocabulary. The review-choice round now has to tell THREE spelling
 * patterns apart (silent-e, ay, ee), one distractor per prior lesson, so
 * it actually reviews the whole arc instead of only this lesson's slice.
 * ========================================================================= */

export const LESSON_A2U1L3_TITLE = 'Yesterday';
export const LESSON_A2U1L3_OBJECTIVE = 'Part 1: Talk about the past using past simple with daily-routine verbs, telling regular -ed verbs (walked, played) apart from irregular ones (woke up, ate, slept), and use "yesterday" as a time marker. Part 2: Read the long-vowel "ee" pattern (see, tree, sleep) and a short story.';

export const LESSON_A2U1L3_SCENES: Scene[] = [
  { id: 'a2u1l3-title', kind: 'title-card', bg: bgMorning, level: 'A2', unit: 'Unit 1', lessonLabel: 'Lesson 3', title: 'Yesterday', subtitle: 'Let’s remember what already happened!', cta: '\u{23EA} LET’S GO!' },

  {
    id: 'a2u1l3-intro', kind: 'cinematic', bg: bgMorning, title: 'Yesterday', subtitle: 'A day that already happened', narrator: 'pip',
    script: [
      { who: 'pip', line: 'Hi! Do you remember my day? Today I want to tell you about YESTERDAY!' },
      { who: 'pip', line: 'Yesterday is a day that already happened. Let’s remember it together!' },
    ],
    cta: '\u{23EA} LET’S GO!',
  },

  {
    // New grammar model — same Marigold-elicits/Pip-answers/each-line-
    // repeated shape as L1's and L2's own model roleplays, this time
    // eliciting past forms of L1's own routine verbs instead of new ones.
    id: 'a2u1l3-model-past', kind: 'roleplay', bg: bgMorning, teacher: 'Listen to Pip remember yesterday, then repeat each line.', cast: ['marigold', 'pip'],
    script: [
      { who: 'marigold', line: 'Pip, what did you do yesterday morning?', repeat: true },
      { who: 'pip', line: 'Yesterday, I woke up and I brushed my teeth!', repeat: true },
      { who: 'marigold', line: 'Did you walk to school?', repeat: true },
      { who: 'pip', line: 'Yes! I walked to school, and I played with my friends.', repeat: true },
      { who: 'marigold', line: 'What did you do at night?', repeat: true },
      { who: 'pip', line: 'I read a book, and then I slept!', repeat: true },
    ],
  },

  {
    id: 'a2u1l3-choice-tense', kind: 'choice', bg: bgMorning, who: 'marigold', teacher: 'Listen carefully, then tap the right word!',
    prompt: 'Which word means it already happened — YESTERDAY?',
    options: [
      { label: 'Walked', emoji: '\u{1F45F}', correct: true },
      { label: 'Walk', emoji: '\u{1F6B6}' },
      { label: 'Walking', emoji: '\u{1F3C3}' },
    ],
  },

  {
    // Four consecutive choice rounds (mirrors L1's own "guess the feeling"
    // sequence) — each anchored on the exact background L1 already taught
    // that verb against, so the picture itself is the retrieval cue for
    // regular vs. irregular, not a bare word.
    id: 'a2u1l3-reg-walked', kind: 'choice', bg: bgStreet, who: 'marigold', teacher: 'Listen, then tap the right answer!',
    prompt: '“Walked” — is this REGULAR (-ed) or IRREGULAR?',
    options: [
      { label: 'Regular', emoji: '\u{2705}', correct: true },
      { label: 'Irregular', emoji: '\u{2753}' },
    ],
  },
  {
    id: 'a2u1l3-irr-wokeup', kind: 'choice', bg: bgMorning, who: 'marigold', teacher: 'Listen, then tap the right answer!',
    prompt: '“Woke up” — is this REGULAR (-ed) or IRREGULAR?',
    options: [
      { label: 'Irregular', emoji: '\u{2753}', correct: true },
      { label: 'Regular', emoji: '\u{2705}' },
    ],
  },
  {
    id: 'a2u1l3-reg-played', kind: 'choice', bg: bgPlayground, who: 'marigold', teacher: 'Listen, then tap the right answer!',
    prompt: '“Played” — is this REGULAR (-ed) or IRREGULAR?',
    options: [
      { label: 'Regular', emoji: '\u{2705}', correct: true },
      { label: 'Irregular', emoji: '\u{2753}' },
    ],
  },
  {
    id: 'a2u1l3-irr-ate', kind: 'choice', bg: bgKitchen, who: 'marigold', teacher: 'Listen, then tap the right answer!',
    prompt: '“Ate” — is this REGULAR (-ed) or IRREGULAR?',
    options: [
      { label: 'Irregular', emoji: '\u{2753}', correct: true },
      { label: 'Regular', emoji: '\u{2705}' },
    ],
  },

  {
    id: 'a2u1l3-sentence-walked', kind: 'drag-match', bg: bgStreet, showBlanks: true, teacher: 'Drag the words to build the sentence: Yesterday, I walked to school.',
    items: [
      { label: 'Yesterday', color: '#FE6A2F', who: 'pip', targetLeft: '25%', targetTop: '20%' },
      { label: 'I walked', color: '#FE6A2F', who: 'pip', targetLeft: '50%', targetTop: '20%' },
      { label: 'to school', color: '#FE6A2F', who: 'pip', targetLeft: '75%', targetTop: '20%' },
    ],
  },
  {
    id: 'a2u1l3-sentence-slept', kind: 'drag-match', bg: bgBedroomAsleep, showBlanks: true, teacher: 'Drag the words to build the sentence: Last night, I slept well.',
    items: [
      { label: 'Last night', color: '#B85CD1', who: 'pip', targetLeft: '25%', targetTop: '20%' },
      { label: 'I slept', color: '#B85CD1', who: 'pip', targetLeft: '50%', targetTop: '20%' },
      { label: 'well', color: '#B85CD1', who: 'pip', targetLeft: '75%', targetTop: '20%' },
    ],
  },

  {
    id: 'a2u1l3-join-stage', kind: 'join-stage', bg: bgBedroomNight, teacher: 'Your turn! Tell me about yesterday.', cast: ['pip'],
    turns: [
      { who: 'pip', line: 'What did you eat yesterday?' },
      { who: 'student', line: 'Yesterday, I ate ______.' },
      { who: 'pip', line: 'What did you play yesterday?' },
      { who: 'student', line: 'Yesterday, I played ______.' },
      { who: 'pip', line: 'Great! Now you can talk about yesterday!' },
    ],
  },

  {
    id: 'a2u1l3-storybook', kind: 'flipbook', bg: bgWide, title: 'Pip’s Yesterday',
    pages: [
      { who: 'pip', img: bgMorning, text: 'Yesterday morning, Pip woke up and stretched.' },
      { who: 'pip', img: bgBathroom, text: 'He brushed his teeth. Scrub, scrub, scrub!' },
      { who: 'pip', img: bgKitchen, text: 'He ate his breakfast. Yum, yum!' },
      { who: 'pip', img: bgStreet, text: 'He walked to school with his backpack.' },
      { who: 'pip', img: bgPlayground, text: 'At recess, he played with Mia and Leo.' },
      { who: 'pip', img: bgBedroomNight, text: 'At night, he read his favorite book.' },
      { who: 'pip', img: bgBedroomAsleep, text: 'Then he slept. What a busy yesterday!' },
    ],
    checkpoints: [
      { afterPage: 2, who: 'pip', question: 'What did Pip eat?', options: ['Breakfast', 'Dinner', 'Nothing'], answer: 'Breakfast' },
      { afterPage: 4, who: 'pip', question: 'Who did Pip play with?', options: ['No one', 'Mia and Leo', 'Miss Marigold'], answer: 'Mia and Leo' },
    ],
  },

  { id: 'a2u1l3-break', kind: 'title-card', bg: bgWide, level: 'A2', unit: 'Unit 1', lessonLabel: 'Break Time', title: 'Great Job!', subtitle: 'Stretch, get some water, then come back for Part 2!', cta: '\u{1F938} I’m Ready!' },

  /* =========================== Part 2: Reading — See, Tree, Sleep ========
   * The long-vowel 'ee' spelling — the next step on A2's reading-fluency
   * arc after L1's silent-e and L2's 'ay', bridged from this lesson's own
   * "slept" vocabulary rather than an unrelated phonics topic. */

  { id: 'a2u1l3-part2-title', kind: 'title-card', bg: bgBedroomNight, level: 'A2', unit: 'Unit 1', lessonLabel: 'Part 2', title: 'Reading Time! See, Tree, Sleep', subtitle: 'Two letters, one long sound', cta: '\u{1F4D6} LET’S READ!' },

  {
    id: 'a2u1l3-ee-intro', kind: 'cinematic', bg: bgBedroomNight, title: 'The EE Sound', subtitle: 'Two letters that make one long sound', narrator: 'marigold',
    script: [
      { who: 'marigold', line: 'Look at the word “see.” Two letters, E and E, together make one long E sound!' },
      { who: 'marigold', line: 'Listen: s-ee, see! Now try “tree” and “sleep” — same “ee” sound!' },
    ],
    cta: 'Try it!',
  },
  {
    id: 'a2u1l3-wordbuild-see', kind: 'word-build', bg: bgBedroomNight, teacher: 'Complete the word: S_E',
    rounds: [{ word: 'SEE', blankIndex: 1, answer: 'E', choices: ['E', 'A', 'O'], emoji: '\u{1F440}' }],
  },
  {
    id: 'a2u1l3-wordbuild-tree', kind: 'word-build', bg: bgBedroomNight, teacher: 'Complete the word: TR_E',
    rounds: [{ word: 'TREE', blankIndex: 2, answer: 'E', choices: ['E', 'A', 'I'], emoji: '\u{1F333}' }],
  },
  {
    id: 'a2u1l3-wordbuild-sleep', kind: 'word-build', bg: bgBedroomNight, teacher: 'Complete the word: SL_P',
    rounds: [{ word: 'SLEEP', blankIndex: 3, answer: 'E', choices: ['E', 'A', 'O'], emoji: '\u{1F634}' }],
  },

  {
    id: 'a2u1l3-reading-story', kind: 'flipbook', bg: bgPlayground, title: 'Leo Climbs a Tree',
    pages: [
      { who: 'leo', img: bgPlayground, text: 'Leo sees a big, tall tree.' },
      { who: 'leo', img: bgPlayground, text: '“I want to climb the tree!” says Leo.' },
      { who: 'leo', img: bgPlayground, text: 'Leo climbs up and looks at everything. What a great day!' },
      { who: 'leo', img: bgBedroomAsleep, text: 'After playing, Leo is tired. He wants to sleep.' },
    ],
    checkpoints: [
      { afterPage: 0, who: 'leo', question: 'What does Leo see?', options: ['A book', 'A tree', 'A kite'], answer: 'A tree' },
      { afterPage: 2, who: 'leo', question: 'What does Leo do in the tree?', options: ['He sleeps', 'He climbs and looks around', 'He eats'], answer: 'He climbs and looks around' },
    ],
  },

  {
    // Three distractors, one per prior lesson's own long-vowel spelling
    // (L1 silent-e, L2 ay) plus a plain short vowel — this reviews the
    // whole reading arc, not just today's slice of it.
    id: 'a2u1l3-review-choice', kind: 'choice', bg: bgBedroomNight, who: 'marigold', teacher: 'Listen carefully, then tap the word with the “ee” sound!',
    prompt: 'Which word has the long E “ee” sound?',
    options: [
      { label: 'Tree', emoji: '\u{1F333}', correct: true },
      { label: 'Play', emoji: '\u{26BD}' },
      { label: 'Kite', emoji: '\u{1FA81}' },
    ],
  },

  {
    id: 'a2u1l3-goodbye-song', kind: 'song', bg: bgExpressGoodbye, title: '\u{1F3B5} Welcome Town School Goodbye Song \u{1F3B5}', teacher: 'It’s time to go — wave goodbye and sing along together!',
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
    id: 'a2u1l3-finale', kind: 'finale', bg: bgWide, who: 'pip',
    line: 'You did it! You can talk about YESTERDAY, and you know regular and irregular verbs! \u{1F3C6} Tonight, tell your family what you did yesterday — and try reading an “ee” word together!',
  },
];
