// B1-S01-E1 "Have You Ever...? · Cold Open" (Experiences and bucket lists), as a game deck on the standard run of show (5/7/10/10/4/12/7/5, re-split for this lesson).
// Plan (approved "go" 2026-10-15): docs/academy-b1-s01-spec.md. Scenario and text (owner approval pending for the plates and the voices): docs/scenarios/academy-b1s01e1-bucket-list.md.
// Research: docs/research/academy-b1-s01-research.md. Blueprint: ACADEMY_LESSON_BLUEPRINTS id B1-S01-E1 (objective unchanged; 12 receptive items: 6 words + 6 past participles).
// Student need: an A2 student who wants to revise the past simple, the present perfect and the verb trios. The present perfect is ACTIVATED here (rule in E3): trio check, text, noticing, Trophy Forge, trio streak.
// Pictures are placeholders (frames, letter tiles) until the owner approves the scenario and the Canva art is made; voices are baked after the text is approved.
import type { CastName, DeckScript, TeachArt } from '../types';
import { ACADEMY_RECALL_NODES, MAX_REMEMBER_ITEMS } from '../../curriculum/academy';
import { recallRounds } from '../recallSlides';

export const OBJECTIVE = 'By the end I can follow the main idea and the detail of a short blog post about bucket lists, say the three forms of nine verbs, choose between the past simple and the present perfect, and write and say a short account of what I have done, with reasons.';
export const CRITERIA = [
  'I can follow a short blog post and answer questions about its main idea, its detail and what is not said.',
  'I understood the six new words: bucket list, dare, give it a go, once in a lifetime, tick it off, brave.',
  'I can say the three forms of nine verbs: base, past simple, past participle.',
  'I can choose between the past simple (a finished time) and the present perfect (an experience up to now), and write a question, an answer and a follow-up.',
  'I can speak for about a minute: say who has done the most and why, and write three sentences about my own list.',
];
export const ITEMS = ['bucket list', 'dare', 'give it a go', 'once in a lifetime', 'tick it off', 'brave', 'been', 'gone', 'seen', 'eaten', 'taken', 'flown'];
/** The six trios worked in the Forge (the new participles) and the four revised in the streak. */
export const TRIOS: [string, string, string][] = [['go', 'went', 'gone'], ['be', 'was', 'been'], ['see', 'saw', 'seen'], ['eat', 'ate', 'eaten'], ['take', 'took', 'taken'], ['fly', 'flew', 'flown']];
export const REVISED: [string, string, string][] = [['do', 'did', 'done'], ['make', 'made', 'made'], ['write', 'wrote', 'written'], ['win', 'won', 'won']];
/** Four harder trios: the vowel changes that B1 learners still mix up. */
export const HARD: [string, string, string][] = [['drive', 'drove', 'driven'], ['choose', 'chose', 'chosen'], ['begin', 'began', 'begun'], ['speak', 'spoke', 'spoken']];

const ALL_TRIOS = [...TRIOS, ...HARD, ...REVISED];
/** A streak round: wrong choices are real forms of other verbs or of the same verb (never a made-up word), so a miss teaches something: the past simple is offered the participle or the base form; the participle is offered the past or the base form. */
export function streakRound(t: [string, string, string], i: number): { forms: [string, string, string]; pastOptions: string[]; partOptions: string[] } {
  const other = ALL_TRIOS[(i + 3) % ALL_TRIOS.length];
  const uniq = (xs: string[], not: string[]) => xs.filter((x, k) => !not.includes(x) && xs.indexOf(x) === k);
  return {
    forms: t,
    pastOptions: uniq([t[2], t[0], other[1]], [t[1]]).slice(0, 2),
    partOptions: uniq([t[1], t[0], other[2]], [t[2]]).slice(0, 2),
  };
}
const L = (text: string): TeachArt => ({ type: 'letters', text });
const card = (id: string, label: string): TeachArt => ({ type: 'card', id, label });
const who = (w: CastName, pos: 'left' | 'right' | 'center', expr: 'happy' | 'wave' | 'thumbs' | 'neutral' = 'happy') => ({ who: w, pos, expr });
const WALL = 'bucket-list-wall';
const CASE = 'trophy-case';
const BUCKET = card('b-bucketlist', 'a bucket list on a wall');
const DARE = card('b-dare', 'a friend daring you');
const GO = card('b-giveitago', 'giving something a go');
const LIFETIME = card('b-lifetime', 'once in a lifetime');
const TICK = card('b-tick', 'ticking a card off');
const BRAVE = card('b-brave', 'a brave person');

/** Ava's blog post: the reading text (about 190 words, B1). It reuses the six words and the present perfect / past simple contrast. */
export const BLOG: string[] = [
  'Last month my cousin dared me to write a bucket list, and I laughed. Honestly, I thought bucket lists were only for grown-ups.',
  'Then I counted what I have already done. I have flown across the world twice, I have slept in a tent in the rain, and I have eaten insects in Thailand. Last summer I went to Spain, and I even gave paragliding a go.',
  'The strange thing is that I have never felt brave. Brave people are not afraid, I used to think, but I was terrified before every one of those things. Now I believe it is the opposite: you are brave when you do it anyway.',
  'So this term I am going to tick off three more things, and one of them is a once in a lifetime trip. I have never tried surfing, and I have never performed on a stage.',
  'If you have a dare for yourself, write it down. You will probably regret the things you did not try more than the things you did.',
];

export const B1_S01_E1: DeckScript = {
  lessonId: 'B1-S01-E1',
  level: 'B1',
  title: 'Have You Ever...? · Cold Open',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo', 'Mia'],
  clock: true,
  theme: 'scene',
  // an integrated-skills lesson (listen, read, notice, write, speak): the long part is the Drop, where the student listens to a dialogue and reads a blog post
  partMinutes: [4, 5, 23, 10, 2, 7, 5, 4],
  partGoals: [
    'Talk about yourself and your experiences',
    'Wake up your past simple',
    'Listen to the dare, read Ava’s post, and answer the questions',
    'Notice “when” and “up to now”, then the rule',
    'A quick streak on harder verbs',
    'Who has done the most? Say it with reasons',
    'Write three sentences and tell me your own list',
    'Say the rule back and see what you can do',
  ],
  slides: [
    // ---------- 0 · Check-in: speaking first (activate), then the verb check ----------
    { id: 'title', kind: 'title', part: 0, bg: WALL, actors: [who('Vee', 'center', 'wave')], heading: 'Have you ever…?', sub: 'Experiences and bucket lists · lesson 1' },
    {
      id: 'lead-in', kind: 'say', part: 0, bg: WALL, actors: [who('Vee', 'right')], trains: [5],
      prompt: 'Warm-up talk. Tell me one exciting thing you did in the last year, and one thing you have never done but would love to try. About 30 seconds.',
      model: 'Last year I went camping with my cousins and we swam in a lake. I have never been to a concert, but I would love to go to one.',
      hints: ['Two parts: something you did, then something you have never done.'],
    },
    {
      id: 'trio-check', kind: 'sort', part: 0, optional: true, bg: WALL, actors: [], trains: [3], save: 'trioKnown',
      prompt: 'Which verbs do you know? Tap a verb, then a box. No wrong answer.',
      bins: [{ id: 'all', label: 'I know all three forms', template: '{w}. I know all three.' }, { id: 'two', label: 'I know one or two', template: '{w}. I know one or two.' }, { id: 'new', label: 'New to me', template: '{w}. New to me.' }],
      items: TRIOS.map((t) => ({ id: t[0], word: t[0] })),
      hints: ['Tap a verb. Then choose a box. All three boxes are fine.'],
    },
    {
      id: 'brief', kind: 'brief', part: 0, bg: WALL, actors: [who('Vee', 'left')],
      say: 'Today you listen to a dare, read a blog post, work out when to use the past simple and when to use have and the past participle, then write and tell me about your own list.', heading: 'Your mission card',
      stamps: [{ id: 'story', icon: 'chat', label: 'Listen and read' }, { id: 'forms', icon: 'abc', label: 'Choose the tense' }, { id: 'predict', icon: 'idcard', label: 'Write and speak' }],
    },

    // ---------- 1 · Remember? (spaced recall, then past simple in writing) ----------
    {
      id: 'rem-recall', kind: 'hearpick', part: 1, bg: WALL, actors: [who('Ava', 'right')], trains: [1],
      prompt: 'Remember? Which one do you hear? Tap it.',
      rounds: recallRounds(ACADEMY_RECALL_NODES, 'B1-S01-E1', 3, MAX_REMEMBER_ITEMS),
      hints: ['Listen, then look for the same words.'],
    },
    {
      id: 'rem-write', kind: 'write', part: 1, bg: WALL, actors: [who('Vee', 'left')], trains: [4],
      prompt: 'Write two full sentences about last weekend in the past simple. Add a detail to each (where, who or why).',
      rows: [
        { label: 'What did you do, and where?', frame: 'Last weekend I …', accept: ['\\b(went|visited|played|stayed|watched|met|saw|ate|took|made|studied|cooked|cleaned|had|did|bought|spent|walked|practised|practiced)\\b'], hint: 'Last weekend is finished, so use the past simple (went, played, saw …).', sample: 'Last weekend I went to my cousin’s house because it was her birthday.' },
        { label: 'What did you eat or buy?', frame: 'We …', accept: ['\\b(ate|bought|cooked|had|drank|made|ordered|shared)\\b'], hint: 'Use ate, bought, had, cooked or drank.', sample: 'We ate pizza on the balcony and we shared a huge cake.' },
      ],
    },

    // ---------- 2 · The Drop: LISTEN to the dare, learn the words, READ Ava's post ----------
    {
      id: 'story-dare', kind: 'story', part: 2, stage: 'context', bg: WALL, trains: [1], title: 'The Dare',
      beats: [
        { plate: 'story-b1s1-1', lines: [
          { who: 'Vee', text: 'Okay, listen. I have a dare for everyone. We all make a bucket list this term, and we tick it off before the break.' },
          { who: 'Vee', text: 'A bucket list is a list of things you want to do once in a lifetime.' },
          { who: 'Vee', text: 'Mine is ready. Number one: give surfing a go. I have never been in the ocean, but I have seen a hundred videos.' },
        ] },
        { plate: 'story-b1s1-2', lines: [
          { who: 'Ava', text: 'That is brave, Vee. I have been to the beach, but I have never tried surfing.' },
          { who: 'Ava', text: 'Last summer I went to Spain with my cousin. We ate pizza every day, and we took hundreds of photos.' },
          { who: 'Theo', text: 'Ava, you have flown across the world twice, and you say you are not brave?' },
          { who: 'Ava', text: 'Flying is easy, Theo. Falling off a surfboard is the scary part.' },
          { who: 'Theo', text: 'I have taken a photo in every country I have visited. That is my record.' },
        ] },
        { plate: 'story-b1s1-3', lines: [
          { who: 'Vee', text: 'So here is the dare: three things you have done, and three things you want to do. Who has gone the furthest? Who has eaten the strangest thing?' },
          { who: 'Ava', text: 'Wait. Have you ever eaten spicy noodles?' },
          { who: 'Vee', text: 'Ha! That is number two on my list.' },
        ] },
      ],
    },
    {
      id: 'listen-detail', kind: 'hearpick', part: 2, bg: WALL, actors: [who('Theo', 'right')], trains: [1],
      prompt: 'Listening check. Listen to each question about the dialogue, then choose the best answer.',
      rounds: [
        { say: 'What is the dare?', options: ['Make a bucket list and tick it off before the break.', 'Learn to surf before the break.', 'Take a photo in every country.'], answer: 'Make a bucket list and tick it off before the break.' },
        { say: 'Why does Ava say that flying is easy?', options: ['She has flown many times, so it feels normal to her.', 'She is afraid of planes.', 'She has never been on a plane.'], answer: 'She has flown many times, so it feels normal to her.' },
        { say: 'What can you guess about Theo?', options: ['He loves travelling and taking photos.', 'He is afraid to fly.', 'He has never left his country.'], answer: 'He loves travelling and taking photos.' },
      ],
      hints: ['Think about what each person said, not only the words.'],
    },
    {
      id: 'teach-words', kind: 'teach', part: 2, bg: WALL, actors: [who('Vee', 'left')], trains: [2], title: 'Six words from the dare',
      pages: [
        { word: 'bucket list', art: BUCKET, meaning: 'a list of things you want to do in your life', example: 'My bucket list has ten things on it.', clue: 'Say it as one word group: bucket list.' },
        { word: 'dare', art: DARE, meaning: 'to ask someone to do something difficult or scary', example: 'My cousin dared me to write a list.', clue: 'It rhymes with “care”.' },
        { word: 'give it a go', art: GO, meaning: 'to try something', example: 'I want to give surfing a go.', clue: 'The same as: try it.' },
        { word: 'once in a lifetime', art: LIFETIME, meaning: 'something that happens only one time in your life', example: 'A trip to Japan is once in a lifetime.', clue: 'Four words, one idea.' },
        { word: 'tick it off', art: TICK, meaning: 'to mark a thing on a list as done', example: 'I tick it off when I do it.', clue: 'You can also say: cross it off.' },
        { word: 'brave', art: BRAVE, meaning: 'not afraid when something is scary or hard', example: 'Ava is brave: she has flown across the world.', clue: 'The opposite of scared.' },
      ],
      hints: ['Listen to each word. Say it after the guide.'],
    },
    {
      id: 'match-words', kind: 'match', part: 2, bg: WALL, actors: [who('Ava', 'right')], trains: [2], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'bucket list', art: BUCKET }, { word: 'dare', art: DARE }, { word: 'give it a go', art: GO }, { word: 'once in a lifetime', art: LIFETIME }, { word: 'tick it off', art: TICK }, { word: 'brave', art: BRAVE }],
      hints: ['Listen to the words, then look for the picture.'],
    },
    {
      id: 'mem-words', kind: 'memory', part: 2, bg: WALL, actors: [who('Vee', 'left')], trains: [2],
      prompt: 'Memory! Match each picture with its words.',
      pairs: [{ art: BUCKET, text: 'bucket list' }, { art: GO, text: 'give it a go' }, { art: BRAVE, text: 'brave' }],
      hints: ['Remember where you saw each picture.'],
    },
    {
      id: 'blog', kind: 'passage', part: 2, bg: WALL, actors: [], trains: [1, 2],
      prompt: 'Now read Ava’s blog post. Listen, read it yourself, then keep the words you want for your word bank.',
      from: 'Ava', lines: BLOG, bank: 'wordBank', keep: 3,
      keepFrom: ['terrified', 'opposite', 'regret', 'insects', 'honestly', 'performed'],
      hints: ['You do not need every word. Read for the main idea first.'],
    },
    {
      id: 'blog-q', kind: 'readq', part: 2, bg: WALL, actors: [], trains: [1],
      prompt: 'Reading questions. Choose the best answer. The text stays on the screen.',
      title: 'Why I stopped saying no', from: 'Ava', paragraphs: BLOG,
      questions: [
        { type: 'gist', q: 'What is the main idea of Ava’s post?', options: ['You are brave when you do something even though you are afraid.', 'Everyone should learn to surf this term.', 'Ava has never been afraid of anything.', 'Bucket lists are only for grown-ups.'], answer: 'You are brave when you do something even though you are afraid.', why: 'Paragraph 3: “you are brave when you do it anyway”.' },
        { type: 'detail', q: 'What has Ava already done?', options: ['Flown across the world twice and eaten insects in Thailand.', 'Tried surfing and performed on a stage.', 'Written a bucket list with ten things.', 'Never left her country.'], answer: 'Flown across the world twice and eaten insects in Thailand.', why: 'Paragraph 2 lists what she has done.' },
        { type: 'inference', q: 'How did Ava probably feel when her cousin first dared her?', options: ['Unsure: she did not think a bucket list was for her.', 'Excited: she wrote the list at once.', 'Angry with her cousin.', 'Scared of flying.'], answer: 'Unsure: she did not think a bucket list was for her.', why: 'She laughed and thought they were only for grown-ups. The text does not say this directly: you work it out.' },
        { type: 'word', q: 'What does “regret” mean in the last paragraph?', options: ['Feel sad about something you did or did not do.', 'Be afraid to try something new.', 'Forget something important.', 'Be proud of yourself.'], answer: 'Feel sad about something you did or did not do.', why: 'You regret the things you did not try: you feel sorry you missed them.' },
      ],
    },
    {
      id: 'gist', kind: 'say', part: 2, bg: WALL, actors: [who('Ava', 'right')], trains: [1, 5], open: true,
      prompt: 'Retell it. In two or three sentences, say what Ava’s post is about, and say if you agree that “you are brave when you do it anyway”.',
      model: 'Ava’s post is about being brave. She says people are brave when they do something even though they are scared. I agree, because I felt nervous before my first presentation, but I did it.',
      hints: ['Start with: Ava’s post is about …'],
    },

    // ---------- 3 · Notice & Build: find it in the text, the rule, the three forms, write it ----------
    {
      id: 'detective', kind: 'sort', part: 3, bg: WALL, actors: [], trains: [4],
      prompt: 'Grammar Detective. These sentences come from the post and the dialogue. Is the time finished and stated, or is it an experience up to now? Tap a sentence, then a box.',
      bins: [{ id: 'when', label: 'A finished time (past simple)', template: '{w}' }, { id: 'now', label: 'Up to now, no time (have + past participle)', template: '{w}' }],
      items: [
        { id: 's1', word: 'Last summer I went to Spain.' },
        { id: 's2', word: 'I have flown across the world twice.' },
        { id: 's3', word: 'Last month my cousin dared me.' },
        { id: 's4', word: 'I have never tried surfing.' },
        { id: 's5', word: 'We took hundreds of photos in Spain.' },
        { id: 's6', word: 'I have eaten insects in Thailand.' },
      ],
      hints: ['Is there a finished time (last summer, last month, in Spain)? Then it is past simple.'],
    },
    {
      id: 'rule-trio', kind: 'rule', part: 3, bg: WALL, actors: [who('Vee', 'left')], trains: [3, 4],
      title: 'The rule',
      lines: [
        { rule: 'Every verb has three forms: base, past simple, past participle.', say: 'Every verb has three forms. Base, past simple and past participle.', example: 'go, went, gone' },
        { rule: 'Past simple: a finished time, so we say when.', say: 'Past simple is for a finished time, so we say when.', example: 'I went to Spain last summer.' },
        { rule: 'Have + past participle: an experience up to now, no time.', say: 'Have and the past participle is for an experience up to now, with no time.', example: 'I have been to Spain.' },
      ],
    },
    {
      id: 'write-forms', kind: 'write', part: 3, bg: WALL, actors: [who('Theo', 'right')], trains: [4],
      prompt: 'Your turn to use the rule. Write a question, an answer and a follow-up.',
      rows: [
        { label: 'Ask a friend about travel (ever + be).', frame: 'Have you ever …?', accept: ['^have you ever been (to|in) .+'], hint: 'Have you ever + been to + a place.', sample: 'Have you ever been to Japan?' },
        { label: 'Answer for yourself with never (eat).', frame: 'I have never …', accept: ["^i (have never|haven't ever|have not ever) eaten .+", "^i've never eaten .+"], hint: 'I have never + eaten + something.', sample: 'I have never eaten octopus.' },
        { label: 'Ask a follow-up about the past (when / where / what).', frame: 'When did you …?', accept: ['^(when|where|what|who|why|how) did (you|he|she|they) \\w+'], hint: 'The follow-up is a finished time: Where did you go?', sample: 'Where did you go?' },
      ],
    },
    {
      id: 'forge', kind: 'forge', part: 3, bg: CASE, actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Trophy Forge! Forge the three forms of each verb, in order. Then say them.',
      rounds: [TRIOS[0], TRIOS[1], TRIOS[3], TRIOS[5]].map((t) => ({ forms: t })),
      hints: ['Base form first, then past simple, then past participle.'],
    },
    {
      id: 'trio-memory', kind: 'memory', part: 3, optional: true, bg: CASE, actors: [who('Ava', 'right')], trains: [3],
      prompt: 'Verb Trio Memory! Match each base form with its other two forms. Say the pair, then say a sentence.',
      pairs: TRIOS.slice(0, 5).map((t) => ({ art: L(t[0]), text: `${t[1]}, ${t[2]}` })),
      hints: ['Think: base, past simple, past participle.'],
    },

    // ---------- 4 · Energiser: the trio streak (harder verbs included) ----------
    {
      id: 'streak', kind: 'streak', part: 4, bg: CASE, actors: [who('Theo', 'right')], trains: [3], save: 'trioScore',
      prompt: 'Trio streak! Listen to the verb. Choose the past simple, then the past participle. Beat your own best.',
      rounds: [...HARD, TRIOS[4]].map((t, i) => streakRound(t, i)),
      hints: ['Past simple first. Then the past participle.'],
    },

    // ---------- 5 · Mission: who has done the most? Argue it with reasons ----------
    { id: 'dial', kind: 'dial', part: 5, bg: WALL, actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'cards', kind: 'explore', part: 5, bg: WALL, actors: [], trains: [5],
      prompt: 'Four people, four lists. Tap each card on the wall to hear it, then decide who has done the most.',
      spots: [
        { id: 'mia', x: 18, y: 56, art: L('Mia'), who: 'Mia', line: 'I have never been on a plane, but I have crossed three countries by train. I have never eaten sushi.', label: 'Mia’s card' },
        { id: 'theo', x: 40, y: 50, art: L('Theo'), who: 'Theo', line: 'I have taken a photo in every country I have visited, but I have never tried surfing.', label: 'Theo’s card' },
        { id: 'ava', x: 62, y: 54, art: L('Ava'), who: 'Ava', line: 'I have flown across the world twice, and I have eaten spicy noodles three times.', label: 'Ava’s card' },
        { id: 'vee', x: 82, y: 50, art: L('Vee'), who: 'Vee', line: 'I have watched a hundred surf videos, but I have never been in the ocean.', label: 'Vee’s card' },
      ],
    },
    {
      id: 'model-task', kind: 'model', part: 5, bg: WALL, actors: [who('Vee', 'left'), who('Ava', 'right')], trains: [5],
      title: 'Watch Vee argue it',
      lines: [
        { who: 'Vee', text: 'I would say Ava has done the most. She has flown across the world twice, and she has even eaten spicy noodles.' },
        { who: 'Ava', text: 'But Theo has visited more countries than I have.' },
        { who: 'Vee', text: 'That is true. On the other hand, he has never tried surfing, so it is a close call.' },
      ],
      closing: 'Now YOU decide. Give your answer, two reasons, and one point against it.',
    },
    {
      id: 'say-take1', kind: 'say', part: 5, bg: WALL, actors: [who('Vee', 'right')], trains: [5], open: true,
      prompt: 'Take 1 · Who has done the most? Give your answer and your reasons. About a minute.',
      model: 'I would say … has done the most. He or she has … and … On the other hand, …',
      byDial: { chill: 'I think … has done the most. He or she has …', normal: 'I would say … has done the most. He or she has … and …', push: 'I would say … has done the most. He or she has … and … On the other hand, … has never …' },
      hints: ['Choose one person. Give two things they have done. Then one thing against.'],
    },
    {
      id: 'fade', kind: 'fade', part: 5, optional: true, bg: WALL, actors: [who('Vee', 'left'), who('Ava', 'right')], trains: [5],
      prompt: 'Feedback time! Say the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Vee', text: 'I would say Ava has done the most.', keys: ['Ava', 'most'] },
        { who: 'Ava', text: 'She has flown across the world twice.', keys: ['flown', 'twice'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 5, bg: WALL, actors: [who('Vee', 'right')], trains: [5], open: true,
      prompt: 'Take 2 · Say it again, better: fix what we noticed, and add a point against your answer.',
      model: 'I would say Ava has done the most. She has flown across the world twice, and she has eaten spicy noodles. On the other hand, Theo has visited more countries.',
      hints: ['Use have or has with the past participle. Add: on the other hand …'],
    },

    // ---------- 6 · Release: write it, then tell it ----------
    {
      id: 'my-list', kind: 'write', part: 6, bg: WALL, actors: [who('Mia', 'right')], trains: [4, 5],
      prompt: 'Write about your own list: one thing you have done, when it happened, and one dare for yourself.',
      rows: [
        { label: 'Something you have done (no time).', frame: 'I have …', accept: ["^i (have|ve|'ve) \\w+ .+"], hint: 'I have + past participle (been, seen, eaten, tried …).', sample: 'I have been to a music festival.' },
        { label: 'When it happened (past simple, finished time).', frame: 'It was … / I … last …', accept: ['\\b(was|were|went|did|saw|ate|took|had|met|visited|last|ago|in \\d{4}|yesterday)\\b'], hint: 'Use a finished time: last summer, two years ago, in 2023.', sample: 'I went last summer with my brother.' },
        { label: 'Something you want to do, and why.', frame: 'I would love to … because …', accept: ["\\bi (want|would love|'d love|hope|plan) to .+", '\\bbecause\\b'], hint: 'I would love to + verb, because + reason.', sample: 'I would love to give surfing a go because it looks fun.' },
      ],
    },
    {
      id: 'say-release', kind: 'say', part: 6, bg: WALL, actors: [who('Ava', 'right')], trains: [1, 5], open: true,
      prompt: 'Release: tell me your list out loud, with a follow-up story about one thing you have done. About a minute. (Record it privately first, then share if you want.)',
      model: 'I have been to a music festival. I went last summer with my brother, and we camped for three days. I would love to give surfing a go because it looks fun, but I am a little scared.',
      hints: ['Three steps: what you have done, when and what happened, what you want to do.'],
    },

    // ---------- 7 · Wrap ----------
    {
      id: 'teach-back', kind: 'build', part: 7, bg: WALL, actors: [who('Vee', 'right')], trains: [4],
      prompt: 'Teach Vee the rule. Tap the words in the right order, then say it out loud.',
      rounds: [{ cue: 'Present perfect, in one sentence.', target: 'We use the present perfect for an experience up to now.', extra: ['finished', 'time'] }],
      hints: ['Say the rule, then show it with: I have been to Spain.'],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: CASE, actors: [who('Vee', 'left', 'thumbs')], heading: 'Your trophies are on the board!', ticks: CRITERIA,
      homework: 'Daily 10: say the three forms of ten verbs, then record a voice note: three things you have done (with when) and one dare for yourself. Not yet is okay!',
      clue: 'Clue 1 of 8: Vee has hidden a card with a mystery experience on the wall. Who has done it?',
    },
  ],
};
