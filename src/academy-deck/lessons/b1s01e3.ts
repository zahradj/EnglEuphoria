// B1-S01-E3 "Have You Ever...? · Pattern Lab" (present perfect: experience, ever / never / been), as a game deck on the run of show (3/5/12/19/3/9/5/4, re-split for this lesson).
// Plan (owner "go" 2026-10-16): docs/academy-b1-s01-e3-plan.md. Research and game search: docs/research/academy-b1-s01-e3-research.md. Scenario: docs/scenarios/academy-b1s01e3-missing-postcard.md.
// Blueprint: ACADEMY_LESSON_BLUEPRINTS id B1-S01-E3 (8 chunks, ONE structure; the cast is Vee and Theo). Builds on E1 (the participles, "when" vs "up to now") and E2 (the 14 words).
// Task first, rule after (guided discovery): the Case Board sort comes BEFORE the three-line rule. The past simple appears only as the follow-up (When did you go?).
// Pictures are placeholders (a drawn gradient, frames) until the art is made; voices are baked after the text is approved.
import type { DeckScript, TeachArt } from '../types';
import { card, who } from './kit';
import { ACADEMY_RECALL_NODES, MAX_REMEMBER_ITEMS } from '../../curriculum/academy';
import { recallRounds } from '../recallSlides';

export const OBJECTIVE = 'By the end I can ask and answer “Have you ever …?”, say “I have / I have never …” with the right participle, use been and gone correctly, and follow with a past simple question or sentence (when / where): in a question round and in five sentences of my own.';
export const CRITERIA = [
  'I can build a correct “I have / I have never + participle” sentence from the parts.',
  'I can ask “Have you ever + participle …?” and answer “Yes, I have.” or “No, I haven’t.”',
  'I can choose been or gone for a short scene and say why.',
  'I can tell an “up to now” sentence from a “finished time” sentence and follow an experience with a past simple question (When did you …?).',
  'I can write and say five sentences of my own about my experiences with the pattern.',
];
/** the eight chunks of the lesson (blueprint: 8 chunks, one structure) */
export const ITEMS = ['I have + participle', 'I have never + participle', 'Have you ever + participle …?', 'Yes, I have. / No, I haven’t.', 'He / She has been', 'He / She has gone', 'once / twice', 'When did you …?'];

const LIB = 'library-case-room';
const BOARD = 'case-board';
const CLASSROOM = 'classroom-morning';
const WALL = 'detective-wall'; // the existing detective-wall plate: the Alibi interrogation
const HALL = 'locker-hall'; // bright school corridor for the Release pages
const scene = (n: number, label: string): TeachArt => card(`sc-bg-${n}`, label);

/** the eight evidence cards of the Detective Board: finished time (when) or up to now (experience)? */
export const WHEN_CARDS = [
  { id: 'e1', text: 'I have been to Rome twice.', bin: 'now', why: 'have + been, and no time is said: an experience up to now.' },
  { id: 'e2', text: 'I went to Lisbon last summer.', bin: 'when', why: '“Last summer” is a finished time, so it is the past simple.' },
  { id: 'e3', text: 'Have you ever flown in a plane?', bin: 'now', why: '“Ever” asks about your whole life up to now.' },
  { id: 'e4', text: 'Ava flew home in July.', bin: 'when', why: '“In July” is a finished time.' },
  { id: 'e5', text: 'She has never eaten sushi.', bin: 'now', why: '“Never” means not once, up to now.' },
  { id: 'e6', text: 'They took the bus yesterday.', bin: 'when', why: '“Yesterday” is a finished time.' },
  { id: 'e7', text: 'We have seen the sea.', bin: 'now', why: 'have + seen, no time: an experience.' },
  { id: 'e8', text: 'He ate sushi two years ago.', bin: 'when', why: '“Two years ago” is a finished time.' },
] as const;
/** Been or Gone? scene cards (a picture and a line with a blank) */
export const BEEN_GONE = [
  { id: 'b1', text: 'Theo has ___ to the library. (He is back at his desk.)', say: 'Theo has been to the library.', bin: 'been', why: 'He came back, so: been.', art: scene(1, 'Theo back at his desk with a library book') },
  { id: 'b2', text: 'Theo has ___ to the library. (His desk is empty.)', say: 'Theo has gone to the library.', bin: 'gone', why: 'He is still there, so: gone.', art: scene(2, 'an empty desk and Theo’s bag missing') },
  { id: 'b3', text: 'Have you ever ___ to Paris?', say: 'Have you ever been to Paris?', bin: 'been', why: 'With ever we say been.', art: scene(3, 'a student pointing at Paris on a map') },
  { id: 'b4', text: 'Vee has ___ to the canteen. (Her coat is on the hook.)', say: 'Vee has gone to the canteen.', bin: 'gone', why: 'She is not here now, so: gone.', art: scene(4, 'an empty seat and a coat on a hook') },
  { id: 'b5', text: 'I have ___ to the sea twice.', say: 'I have been to the sea twice.', bin: 'been', why: 'A past experience that is over: been.', art: scene(5, 'a class photo at the sea') },
  { id: 'b6', text: 'The librarian has ___ home. (The door is closed.)', say: 'The librarian has gone home.', bin: 'gone', why: 'She is not here now, so: gone.', art: scene(6, 'a closed library door sign') },
] as const;

export const B1_S01_E3: DeckScript = {
  lessonId: 'B1-S01-E3',
  level: 'B1',
  title: 'Have You Ever...? · Pattern Lab',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Theo'],
  clock: true,
  theme: 'scene',
  // a grammar lesson: find the pattern first, the rule in three lines, controlled practice, then the Alibi mission and five sentences of your own
  partMinutes: [3, 5, 12, 19, 3, 9, 5, 4],
  partGoals: [
    'Tell me something you have done',
    'Wake up your bucket-list words',
    'The postcard is missing: read the evidence',
    'The rule, then build, ask and choose',
    'Quick-fire: which answer fits?',
    'Question the suspect: catch the contradiction',
    'Write and say five sentences of your own',
    'Say the rule back and close the case',
  ],
  slides: [
    // ---------- 0 · Check-in ----------
    { id: 'title', kind: 'title', part: 0, bg: LIB, actors: [who('Vee', 'center', 'wave')], heading: 'Pattern Lab', sub: 'The Missing Postcard · lesson 3' },
    {
      id: 'lead-in', kind: 'say', part: 0, stage: 'review', bg: LIB, actors: [who('Vee', 'right')], trains: [2], open: true,
      prompt: 'Warm-up talk. Tell me one thing you have done that most people have not. One or two sentences, any words you have.',
      model: 'I have swum with a dolphin. I think most people have not!',
      hints: ['Start with “I have …” and the third form of the verb.'],
    },
    {
      id: 'brief', kind: 'brief', part: 0, bg: LIB, actors: [who('Vee', 'left')],
      say: 'My Lisbon postcard is missing from the wall! You are the club detective today: read the evidence, find the pattern, then question the suspect.', heading: 'Your case file',
      stamps: [{ id: 'read', icon: 'chat', label: 'Read the evidence' }, { id: 'pattern', icon: 'abc', label: 'Find the pattern' }, { id: 'question', icon: 'idcard', label: 'Question the suspect' }],
    },

    // ---------- 1 · Remember? ----------
    {
      id: 'rem-recall', kind: 'hearpick', part: 1, stage: 'review', bg: CLASSROOM, actors: [who('Theo', 'right')], trains: [1],
      prompt: 'Remember? Which one do you hear? Tap it.',
      rounds: recallRounds(ACADEMY_RECALL_NODES, 'B1-S01-E3', 6, MAX_REMEMBER_ITEMS),
      hints: ['Listen, then look for the same words.'],
    },
    {
      id: 'rem-never', kind: 'build', part: 1, stage: 'review', bg: CLASSROOM, actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Never Have I Ever! Build a sentence about something you have never done, then say it out loud. Vee says “me too” if she has not either.',
      rounds: [
        { cue: 'Never flown, with “flown”.', target: 'I have never flown in a plane.', extra: ['fly', 'flew'] },
        { cue: 'Never eaten, with “eaten”.', target: 'I have never eaten octopus.', extra: ['eat', 'ate'] },
      ],
      hints: ['I have never + the past participle: flown, eaten, seen, taken, been, gone.'],
    },

    // ---------- 2 · The Drop: the case, then the evidence (task first, rule after) ----------
    {
      id: 'predict', kind: 'say', part: 2, stage: 'context', bg: LIB, actors: [who('Vee', 'right')], trains: [4], open: true,
      prompt: 'Before you listen: a postcard has disappeared from the club wall. Who do you think took it, and why? Guess in one sentence.',
      model: 'I think a club member took it because they liked the picture.',
      hints: ['There is no wrong answer. A guess helps you listen for the right words.'],
      note: 'Predict step. Do not correct the guess; the story shows who and why.',
    },
    {
      id: 'story-case', kind: 'story', part: 2, stage: 'context', listenFirst: true, look: 'comic', bg: LIB, trains: [2, 4], title: 'The Missing Postcard',
      beats: [
        { plate: 'story-b1s3-1', caption: "Vee's Lisbon postcard is missing from the club's case board.", side: { Vee: 'right' }, capAt: { x: 2, y: 82, w: 36 }, spots: { Vee: { x: 42, y: 50, w: 50 } }, lines: [
          { who: 'Vee', text: 'Stop! My Lisbon postcard is gone from the wall. It was pinned right here this morning.', shout: true, sfx: 'GONE!' },
          { who: 'Vee', text: 'Detective, I need your help. I have a board of evidence. Please read it carefully.' },
        ] },
        { plate: 'story-b1s3-2', caption: 'Theo tells us where he has been. Listen for the pattern.', side: { Theo: 'right', Vee: 'left' }, capAt: { x: 3, y: 4, w: 44 }, spots: { Vee: { x: 3, y: 16, w: 44 }, Theo: { x: 3, y: 38, w: 44 } }, lines: [
          { who: 'Theo', text: 'I have never been to Lisbon. I have been to Rome twice, but never to Portugal.' },
          { who: 'Vee', text: 'Hmm. Some sentences say when something happened. Others say what you have done in your life.', sfx: 'Hmm…' },
        ] },
        { plate: 'story-b1s3-3', caption: 'Vee wants the evidence sorted: when it happened, or up to now?', side: { Theo: 'right', Vee: 'left' }, capAt: { x: 34, y: 3, w: 28 }, spots: { Vee: { x: 34, y: 18, w: 28 }, Theo: { x: 34, y: 42, w: 28 } }, lines: [
          { who: 'Theo', text: 'I will wait over here. I am sure I have never taken a postcard!' },
          { who: 'Vee', text: 'Let us see. Which cards say when, and which say something about your life up to now?' },
        ] },
      ],
    },
    {
      id: 'listen-q', kind: 'hearpick', part: 2, stage: 'context', bg: LIB, actors: [who('Vee', 'right')], trains: [2, 4],
      prompt: 'Listening check. Listen to each question about the story (the text is hidden), then choose the best answer.',
      rounds: [
        { say: 'What is missing from the wall?', options: ['The Lisbon postcard.', 'The world map.', 'Theo’s notebook.'], answer: 'The Lisbon postcard.' },
        { say: 'Has Theo been to Rome?', options: ['Yes, twice.', 'No, never.', 'Yes, last summer.'], answer: 'Yes, twice.' },
        { say: 'Has Theo been to Lisbon, he says?', options: ['No, never.', 'Yes, once.', 'Yes, twice.'], answer: 'No, never.' },
      ],
      hints: ['Listen again with the speaker button. Think about what Theo said.'],
      note: 'Reflect: was your guess close? Which sentences told you something about life up to now?',
    },
    {
      id: 'board-when', kind: 'board', look: 'case', part: 2, stage: 'context', bg: BOARD, actors: [who('Vee', 'left')], trains: [4, 1],
      prompt: 'Detective Board. Read each evidence card and pin it: does it say WHEN something happened, or what someone has done UP TO NOW?',
      bins: [
        { id: 'when', icon: 'lock', label: 'A finished time (when)', hint: 'Look for a time word: last summer, in July, yesterday, two years ago.' },
        { id: 'now', icon: 'bolt', label: 'Up to now (experience)', hint: 'No finished time here. Look for have / has, ever or never.' },
      ],
      cards: WHEN_CARDS.map((c) => ({ ...c })),
      hints: ['Find the time word. If there is one that is finished, it is a “when” card.', 'No time word, and have / has + a participle? Then it is an experience up to now.'],
      note: 'Guided discovery: ask what the “up to now” cards have in common before the rule is stated. Do not tell.',
    },

    // ---------- 3 · Notice & Build: model, the rule, then build, ask and choose ----------
    {
      id: 'model-pattern', kind: 'model', part: 3, stage: 'model', bg: BOARD, actors: [who('Vee', 'left'), who('Theo', 'right')], trains: [1, 2],
      title: 'Watch Vee build the pattern',
      lines: [
        { who: 'Vee', text: 'Watch me. I have the parts: have, never, been, to, Lisbon. I have never been to Lisbon.' },
        { who: 'Theo', text: 'Now a question for me. Have you ever been to Rome?' },
        { who: 'Vee', text: 'Yes, I have. I went last summer, with my family.' },
      ],
      closing: 'First the experience with have. Then the details, when and where, in the past simple. Now YOU build the evidence.',
    },
    {
      id: 'rule-pattern', kind: 'rule', part: 3, stage: 'rule', bg: BOARD, actors: [who('Vee', 'right')], trains: [1, 2, 3, 4],
      title: 'The rule',
      lines: [
        { rule: 'Have or has + a past participle tells an experience up to now, with no finished time.', say: 'Have or has plus a past participle tells an experience up to now, with no finished time.', example: 'I have flown. She has never eaten sushi.' },
        { rule: 'Never means not once. Ever, in a question, means at any time in your life.', say: 'Never means not once. Ever, in a question, means at any time in your life.', example: 'Have you ever flown in a plane? Yes, I have. No, I haven’t.' },
        { rule: 'Been means went and came back. Gone means went and is still there. For the details, when and where, use the past simple.', say: 'Been means went and came back. Gone means went and is still there. For the details, when and where, use the past simple.', example: 'I have been to Lisbon. I went last summer.' },
      ],
    },
    {
      id: 'build-evidence', kind: 'build', part: 3, stage: 'controlled', bg: BOARD, actors: [who('Theo', 'right')], trains: [1],
      prompt: 'Evidence Builder. Build each statement from the pieces, then say it out loud.',
      rounds: [
        { cue: 'Theo says he has not been to Rome… no: he HAS. Say it with twice.', target: 'I have been to Rome twice.', extra: ['went', 'be'], hint: 'I have + been, and twice at the end.' },
        { cue: 'Vee has never tried sushi.', target: 'She has never eaten sushi.', extra: ['have', 'ate'], hint: 'She has (not have) + never + eaten.' },
        { cue: 'Ask about flying in a plane.', target: 'Have you ever flown in a plane?', extra: ['flew', 'fly'], hint: 'Have you ever + flown.' },
        { cue: 'We saw the sea (up to now).', target: 'We have seen the sea.', extra: ['saw', 'see'], hint: 'have + seen.' },
        { cue: 'Theo is at the library now, not back yet.', target: 'Theo has gone to the library.', extra: ['been', 'go'], hint: 'Still there: has gone.' },
      ],
    },
    {
      id: 'board-been', kind: 'board', look: 'scenes', part: 3, stage: 'controlled', bg: BOARD, actors: [who('Vee', 'left')], trains: [3],
      prompt: 'Been or Gone? Read the scene, then pin the missing word: did the person come back (been) or are they still there (gone)?',
      bins: [
        { id: 'been', icon: 'check', label: 'been', hint: 'Been = went and came back. With ever, always been.' },
        { id: 'gone', icon: 'skip', label: 'gone', hint: 'Gone = went and is still there (not here now).' },
      ],
      cards: BEEN_GONE.map((c) => ({ ...c })),
      hints: ['Is the person here now? If they are back, say been. If they are still away, say gone.'],
    },
    {
      id: 'build-ask', kind: 'build', part: 3, stage: 'controlled', bg: BOARD, actors: [who('Vee', 'right')], trains: [2, 4],
      prompt: 'Question Forge. Build the question you will ask a suspect, then the answer, and say them out loud.',
      rounds: [
        { cue: 'Ask if someone has ever been to Lisbon.', target: 'Have you ever been to Lisbon?', extra: ['went', 'did'], hint: 'Have you ever + been.' },
        { cue: 'Answer yes, short.', target: 'Yes, I have.', extra: ['did', 'am'], hint: 'Yes, I have. Short and complete.' },
        { cue: 'Ask when they went.', target: 'When did you go?', extra: ['have', 'gone'], hint: 'The details use the past simple: When did you go?' },
      ],
    },

    {
      id: 'report-cloze', kind: 'cloze', part: 3, stage: 'controlled', bg: BOARD, actors: [who('Vee', 'right')], trains: [3, 4],
      prompt: 'Finish the detective report with the words from today: tap a word, then a gap.',
      title: 'The detective report',
      paragraphs: [
        'Theo says he has [[never]] visited Lisbon. Vee has [[gone]] to the canteen, so she is not here now.',
        'I asked him whether he has [[ever]] been to Portugal. He said “Once.” Then I asked, “When [[did]] you go?” and he answered, “I [[went]] last summer.”',
      ],
      gapHints: { never: 'not once', gone: 'went and is still there', ever: 'at any time in your life', did: 'the helper for a past simple question', went: 'the past simple of go' },
    },

    // ---------- 4 · Energiser ----------
    {
      id: 'quickfire', kind: 'hearpick', part: 4, stage: 'controlled', bg: CLASSROOM, actors: [who('Theo', 'right')], trains: [2],
      prompt: 'Quick-fire! Listen to each question (the text is hidden) and tap the answer that fits.',
      rounds: [
        { say: 'Have you ever flown in a plane?', options: ['Yes, I have.', 'Yes, I fly.', 'Yes, I did flew.'], answer: 'Yes, I have.' },
        { say: 'Have you ever been to Rome?', options: ['No, I haven’t.', 'No, I don’t.', 'No, I wasn’t.'], answer: 'No, I haven’t.' },
        { say: 'Has Theo ever eaten sushi?', options: ['Yes, he has.', 'Yes, he have.', 'Yes, he is.'], answer: 'Yes, he has.' },
        { say: 'Have they ever seen the sea?', options: ['Yes, they have.', 'Yes, they has.', 'Yes, they did seen.'], answer: 'Yes, they have.' },
      ],
      hints: ['Answer with the same helper: have → Yes, I have. has → Yes, he has.'],
    },

    // ---------- 5 · Mission: question the suspect (Alibi) ----------
    { id: 'dial', kind: 'dial', part: 5, bg: LIB, actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'model-task', kind: 'model', part: 5, stage: 'model', bg: LIB, actors: [who('Vee', 'left'), who('Theo', 'right')], trains: [2, 4],
      title: 'Watch the detective question a suspect',
      lines: [
        { who: 'Vee', text: 'Theo, have you ever been to Lisbon?' },
        { who: 'Theo', text: 'No, never. I have been to Rome twice.' },
        { who: 'Vee', text: 'Have you ever been to Portugal?' },
        { who: 'Theo', text: 'Hmm. Once.' },
        { who: 'Vee', text: 'When did you go?' },
        { who: 'Theo', text: 'I went last summer.' },
        { who: 'Vee', text: 'Aha! You said never, but you went last summer!' },
      ],
      closing: 'You found the contradiction with a question and a follow-up. Now YOU are the detective.',
    },
    {
      id: 'alibi', kind: 'rpg', part: 5, stage: 'controlled', bg: WALL, actors: [who('Theo', 'right')], trains: [2, 4], npc: 'Theo', goal: 4, meter: 'Evidence',
      prompt: 'Alibi! You are the detective. Theo is the suspect. Choose the best question each time and catch the contradiction.',
      scenes: [
        { say: 'I have never been to Lisbon. I have been to Rome twice.', options: [
          { text: 'Have you ever been to Portugal?', score: 2, reply: 'Hmm. Once. A long time ago.', note: 'A natural question with have you ever + been.' },
          { text: 'Did you ever go to Portugal?', score: 0, reply: 'Um, what do you mean?', note: 'For life experience use have you ever, not did you ever.' },
          { text: 'You have been to Lisbon last year?', score: 0, reply: 'That is a strange question.', note: 'Do not mix have with a finished time.' },
        ] },
        { say: 'Once. A long time ago. It was nothing special.', options: [
          { text: 'When did you go?', score: 2, reply: 'I went last summer. With my family.', note: 'The details use the past simple: When did you go?' },
          { text: 'When have you been?', score: 0, reply: 'Eh? Say that again.', note: 'Ask about a finished time with the past simple.' },
          { text: 'Where do you go?', score: 1, reply: 'Different places.', note: 'This asks about habit, not about the one trip.' },
        ] },
        { say: 'I went last summer. With my family. But I have never taken a postcard!', options: [
          { text: 'You said you had never been, but you went last summer!', score: 2, reply: 'Okay, okay. I took the postcard to copy the stamp. I am sorry, Vee!', note: 'You caught the contradiction.' },
          { text: 'Have you ever taken a postcard?', score: 1, reply: 'No, never! Well… only today.', note: 'Good question, but the contradiction is about the trip.' },
          { text: 'Where have you gone?', score: 0, reply: 'Many places.', note: 'Gone means still there. Use been, or the past simple for details.' },
        ] },
      ],
      hints: ['Ask Have you ever …? first, then When did you …? for the details.'],
    },
    {
      id: 'say-take1', kind: 'say', part: 5, stage: 'free', bg: LIB, actors: [who('Theo', 'right')], trains: [2, 4], open: true,
      prompt: 'Take 1 · Question me like a detective. Ask me three “Have you ever …?” questions, and a “When did you …?” follow-up to each yes. About a minute.',
      model: 'Have you ever flown in a plane? Yes, I have. When did you fly? I flew last year.',
      byDial: { chill: 'Have you ever ___? When did you ___?', normal: 'Have you ever ___? … When did you ___? Where did you go?', push: 'Catch me in a contradiction: ask three questions and find the one answer that does not fit.' },
      hints: ['Two steps: the experience with have you ever, then the details with the past simple.'],
    },
    {
      id: 'fade', kind: 'fade', part: 5, stage: 'free', optional: true, bg: LIB, actors: [who('Vee', 'left'), who('Theo', 'right')], trains: [2],
      prompt: 'Feedback time! Say the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Vee', text: 'Have you ever been to Portugal?', keys: ['ever', 'been'] },
        { who: 'Vee', text: 'When did you go?', keys: ['when', 'go'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 5, stage: 'free', bg: LIB, actors: [who('Vee', 'right')], trains: [2, 4, 5], open: true,
      prompt: 'Take 2 · A new suspect! Vee is the suspect now. Use the fixes, question her, and find out one true thing she has done and when.',
      model: 'Have you ever eaten snails? Yes, I have. When did you eat them? I ate them in France, two years ago.',
      hints: ['Use the fixes we noticed. The experience first, then the past simple with a time.'],
      note: 'Take 2 changes the listener: play Vee and give a true answer with a finished time. Not every suspect lies.',
    },

    // ---------- 6 · Release: my five sentences (private first) ----------
    {
      id: 'my-sentences', kind: 'write', part: 6, stage: 'produce', bg: HALL, actors: [who('Theo', 'right')], trains: [1, 5],
      prompt: 'Write three sentences about YOUR life: an experience with never, an experience with been, and a story with a finished time.',
      rows: [
        { label: 'Something you have never done.', frame: 'I have never …', accept: ['\\bi(’|\')?ve never\\b|\\bi have never\\b|\\bnever\\b.*\\b(been|seen|eaten|flown|gone|taken|tried|done)\\b'], hint: 'I have never + a past participle.', sample: 'I have never flown in a plane.' },
        { label: 'A place you have been to.', frame: 'I have been to …', accept: ['\\b(i(’|\')?ve|i have) been\\b'], hint: 'I have been to + a place.', sample: 'I have been to the mountains twice.' },
        { label: 'A story with a finished time.', frame: 'I went … last … / I … in …', accept: ['\\b(last|ago|yesterday|in \\d{4}|in (january|february|march|april|may|june|july|august|september|october|november|december))\\b'], hint: 'A finished time: last summer, two years ago, in July.', sample: 'I went to the mountains last winter.' },
      ],
    },
    {
      id: 'say-release', kind: 'say', part: 6, stage: 'produce', bg: HALL, actors: [who('Vee', 'right')], trains: [2, 5],
      prompt: 'Release: say your sentences out loud, privately first, then ask me one “Have you ever …?” question about something I might have done. About 40 seconds.',
      model: 'I have never flown in a plane. I have been to the mountains twice. I went last winter. Have you ever been to the mountains?',
      hints: ['Three steps: never, been, then the story with a time. End with a question for me.'],
    },

    // ---------- 7 · Wrap ----------
    {
      id: 'teach-back', kind: 'build', part: 7, stage: 'produce', bg: BOARD, actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Teach Vee the rule. Tap the words in the right order, then say it out loud.',
      rounds: [{ cue: 'The first line of the rule, in one sentence.', target: 'Have plus a participle tells an experience up to now.', extra: ['yesterday', 'went'] }],
      hints: ['Say the rule, then show it with: I have flown.'],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: LIB, actors: [who('Vee', 'left', 'thumbs')], heading: 'Case closed! The postcard is back on the wall.', ticks: CRITERIA,
      homework: 'Daily 10: build five sentences with have and never, choose been or gone for three scenes, then record a voice note: three things you have done and one thing you have never done. Not yet is okay!',
      clue: 'Clue 3 of 8: Theo copied the stamp, and the stamp has a date and a place. Where was the postcard sent from, and when?',
    },
  ],
};
