// B1-S01-E1 "Have You Ever...? · Cold Open" (Experiences and bucket lists), as a game deck on the standard run of show (5/7/10/10/4/12/7/5, re-split for this lesson).
// Plan (approved "go" 2026-10-15): docs/academy-b1-s01-spec.md. Scenario and text (owner approval pending for the plates and the voices): docs/scenarios/academy-b1s01e1-bucket-list.md.
// Research: docs/research/academy-b1-s01-research.md. Blueprint: ACADEMY_LESSON_BLUEPRINTS id B1-S01-E1 (objective unchanged; 12 receptive items: 6 words + 6 past participles).
// Student need: an A2 student who wants to revise the past simple, the present perfect and the verb trios. The present perfect is ACTIVATED here (rule in E3): trio check, text, noticing, Trophy Forge, trio streak.
// Pictures are placeholders (frames, letter tiles) until the owner approves the scenario and the Canva art is made; voices are baked after the text is approved.
import type { CastName, DeckScript, TeachArt } from '../types';
import { ACADEMY_RECALL_NODES, MAX_REMEMBER_ITEMS } from '../../curriculum/academy';
import { recallRounds } from '../recallSlides';

export const OBJECTIVE = 'By the end I can understand the main idea of the bucket-list story, say the three forms of ten verbs, tell “when” from “up to now”, and say who has done the most.';
export const CRITERIA = [
  'I can say what the story is mainly about, in my own words.',
  'I understood the six new words: bucket list, dare, give it a go, once in a lifetime, tick it off, brave.',
  'I can say the three forms of ten verbs: base, past simple, past participle.',
  'I can tell a “when” sentence (past simple) from an “up to now” sentence (have + past participle).',
  'I can predict who has done the most and say why, in one or two sentences.',
];
/** The 12 receptive items of the blueprint: 6 words and collocations, and 6 past participles of verbs the student already knows in the past simple. */
export const ITEMS = ['bucket list', 'dare', 'give it a go', 'once in a lifetime', 'tick it off', 'brave', 'been', 'gone', 'seen', 'eaten', 'taken', 'flown'];
/** The six trios worked in the Forge (the new participles) and the four revised in the streak. */
export const TRIOS: [string, string, string][] = [['go', 'went', 'gone'], ['be', 'was', 'been'], ['see', 'saw', 'seen'], ['eat', 'ate', 'eaten'], ['take', 'took', 'taken'], ['fly', 'flew', 'flown']];
export const REVISED: [string, string, string][] = [['do', 'did', 'done'], ['make', 'made', 'made'], ['write', 'wrote', 'written'], ['win', 'won', 'won']];

const ALL_TRIOS = [...TRIOS, ...REVISED];
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

export const B1_S01_E1: DeckScript = {
  lessonId: 'B1-S01-E1',
  level: 'B1',
  title: 'Have You Ever...? · Cold Open',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Ava', 'Theo', 'Mia'],
  clock: true,
  theme: 'night',
  // the required pages fill the hour: a long Drop (the story, six word pages, two memorising games, the gist), no wasted Energiser
  partMinutes: [5, 7, 15, 10, 4, 10, 5, 4],
  partGoals: [
    'Meet the bucket-list wall and check which verb trios you know',
    'Wake up your past simple',
    'Hear the dare, learn six words, find the gist',
    'The three forms of a verb: past simple and “up to now”',
    'A quick streak: say the other two forms',
    'Who has done the most? Predict it',
    'Tell me what you think of the dare',
    'Say the rule back and see what you can do',
  ],
  slides: [
    // ---------- 0 · Check-in ----------
    { id: 'title', kind: 'title', part: 0, bg: WALL, actors: [who('Vee', 'center', 'wave')], heading: 'Have you ever…?', sub: 'Experiences and bucket lists · lesson 1' },
    {
      id: 'feel', kind: 'convo', part: 0, bg: WALL, actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Pick how you feel. Tap a picture.', me: 'Ava', meLabel: 'You', after: 'Thanks! Now a quick check of your verbs.',
      steps: [{ ask: 'Hi! How are you today?', pic: card('v-fine', 'feeling fine'), options: [{ text: 'I am great!', pic: card('v-great', 'feeling great'), ok: true }, { text: 'I am fine.', pic: card('v-fine', 'feeling fine'), ok: true }, { text: 'I am tired.', pic: card('v-tired', 'feeling tired'), ok: true }] }],
      hints: ['There is no wrong answer. Choose how you feel.'],
    },
    {
      id: 'trio-check', kind: 'sort', part: 0, bg: WALL, actors: [], trains: [3], save: 'trioKnown',
      prompt: 'Which verbs do you know? Tap a verb, then a box. No wrong answer.',
      bins: [{ id: 'all', label: 'I know all three forms', template: '{w}. I know all three.' }, { id: 'two', label: 'I know one or two', template: '{w}. I know one or two.' }, { id: 'new', label: 'New to me', template: '{w}. New to me.' }],
      items: TRIOS.map((t) => ({ id: t[0], word: t[0] })),
      hints: ['Tap a verb. Then choose a box. All three boxes are fine.'],
    },
    {
      id: 'warm-verbs', kind: 'hearpick', part: 0, optional: true, bg: WALL, actors: [who('Theo', 'right')], trains: [3],
      prompt: 'Warm up your ears! Which verb do you hear?',
      rounds: [{ say: 'went', options: ['go', 'went', 'gone'], answer: 'went' }, { say: 'seen', options: ['seen', 'saw', 'see'], answer: 'seen' }, { say: 'ate', options: ['eaten', 'eat', 'ate'], answer: 'ate' }],
      hints: ['Listen to the ending of the word.'],
    },
    {
      id: 'brief', kind: 'brief', part: 0, bg: WALL, actors: [who('Vee', 'left')],
      say: 'Hi! I have a dare for you: a bucket list. Today you hear it, learn six new words, check your verb forms, and tell me who has done the most.', heading: 'Your mission card',
      stamps: [{ id: 'story', icon: 'chat', label: 'Hear the dare' }, { id: 'forms', icon: 'abc', label: 'Three forms' }, { id: 'predict', icon: 'idcard', label: 'Who has done most?' }],
    },

    // ---------- 1 · Remember? (from the spaced recall plan, then the past simple in production) ----------
    {
      id: 'rem-recall', kind: 'hearpick', part: 1, bg: WALL, actors: [who('Ava', 'right')], trains: [1],
      prompt: 'Remember? Which one do you hear? Tap it.',
      rounds: recallRounds(ACADEMY_RECALL_NODES, 'B1-S01-E1', 5, MAX_REMEMBER_ITEMS),
      hints: ['Listen, then look for the same words.'],
    },
    {
      id: 'rem-build', kind: 'build', part: 1, bg: WALL, actors: [who('Vee', 'left')], trains: [4],
      prompt: 'Build the sentence about last weekend. Tap the words in order.',
      rounds: [{ cue: 'Say where you went.', target: 'I went to the park.', extra: ['gone', 'go'] }, { cue: 'Say what you ate.', target: 'We ate pizza.', extra: ['eaten', 'eat'] }],
      hints: ['Last weekend is finished: use the past simple.'],
    },
    {
      id: 'rem-say', kind: 'say', part: 1, bg: WALL, actors: [who('Ava', 'right')], trains: [4], open: true,
      prompt: 'Say two sentences about last weekend. Use went, saw or ate.',
      model: 'I went to a party. I saw my friends.',
      hints: ['Start with: Last weekend I …'],
    },

    // ---------- 2 · The Drop: the dare, six words, two memory games, the gist ----------
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
      id: 'teach-words', kind: 'teach', part: 2, bg: WALL, actors: [who('Vee', 'left')], trains: [2], title: 'Six words from the dare',
      pages: [
        { word: 'bucket list', art: BUCKET, meaning: 'a list of things you want to do in your life', example: 'My bucket list has ten things on it.', clue: 'Say it as one word group: bucket list.' },
        { word: 'dare', art: DARE, meaning: 'to ask someone to do something difficult or scary', example: 'Vee dares us to make a list.', clue: 'It rhymes with “care”.' },
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
      pairs: [{ art: BUCKET, text: 'bucket list' }, { art: DARE, text: 'dare' }, { art: GO, text: 'give it a go' }, { art: TICK, text: 'tick it off' }, { art: BRAVE, text: 'brave' }],
      hints: ['Remember where you saw each picture.'],
    },
    {
      id: 'spot-lie', kind: 'hearpick', part: 2, bg: WALL, actors: [who('Theo', 'right')], trains: [1],
      prompt: 'Spot the lie! Listen to each sentence about the story. Is it true or false?',
      rounds: [
        { say: 'Vee has finished her bucket list.', options: ['True', 'False'], answer: 'False' },
        { say: 'Ava has flown across the world twice.', options: ['True', 'False'], answer: 'True' },
        { say: 'Theo has never taken a photo.', options: ['True', 'False'], answer: 'False' },
      ],
      hints: ['Think about the story. Who said it?'],
    },
    {
      id: 'gist', kind: 'say', part: 2, bg: WALL, actors: [who('Ava', 'right')], trains: [1], open: true,
      prompt: 'Clue 1: What is Vee’s dare, and who sounds the bravest? Say it in your own words.',
      model: 'Vee dares everyone to make a bucket list. Ava sounds brave.',
      hints: ['Start with: Vee dares …'],
    },

    // ---------- 3 · Notice & Build: the three forms, when / up to now, the Trophy Forge ----------
    {
      id: 'rule-trio', kind: 'rule', part: 3, bg: WALL, actors: [who('Vee', 'left')], trains: [3, 4],
      title: 'Remember: three forms',
      lines: [
        { rule: 'Every verb has three forms: base, past simple, past participle.', say: 'Every verb has three forms. Base, past simple and past participle.', example: 'go, went, gone' },
        { rule: 'Past simple: when it happened.', say: 'Past simple tells you when it happened.', example: 'I went to Spain last summer.' },
        { rule: 'Have + past participle: an experience up to now.', say: 'Have and the past participle tell you about an experience up to now.', example: 'I have been to Spain.' },
      ],
    },
    {
      id: 'detective', kind: 'sort', part: 3, bg: WALL, actors: [], trains: [4],
      prompt: 'Grammar Detective! When it happened, or up to now? Tap a sentence, then a box.',
      bins: [{ id: 'when', label: 'When it happened (past simple)', template: '{w}' }, { id: 'now', label: 'Up to now (have + past participle)', template: '{w}' }],
      items: [
        { id: 's1', word: 'I went to Spain last summer.' },
        { id: 's2', word: 'I have never been in the ocean.' },
        { id: 's3', word: 'We ate pizza every day.' },
        { id: 's4', word: 'I have seen a hundred videos.' },
        { id: 's5', word: 'We took hundreds of photos.' },
        { id: 's6', word: 'You have flown across the world twice.' },
      ],
      hints: ['Is there a finished time (last summer, every day)? Then it is past simple.'],
    },
    {
      id: 'forge', kind: 'forge', part: 3, bg: CASE, actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Trophy Forge! Forge the three forms of each verb, in order. Then say them.',
      rounds: TRIOS.map((t) => ({ forms: t })),
      hints: ['Base form first, then past simple, then past participle.'],
    },

    {
      id: 'trio-memory', kind: 'memory', part: 3, optional: true, bg: CASE, actors: [who('Ava', 'right')], trains: [3],
      prompt: 'Verb Trio Memory! Match each base form with its other two forms. Say the pair, then say a sentence.',
      pairs: TRIOS.slice(0, 5).map((t) => ({ art: L(t[0]), text: `${t[1]}, ${t[2]}` })),
      hints: ['Think: base, past simple, past participle.'],
    },

    // ---------- 4 · Energiser: the trio streak and the mastery check ----------
    {
      id: 'streak', kind: 'streak', part: 4, bg: CASE, actors: [who('Theo', 'right')], trains: [3], save: 'trioScore',
      prompt: 'Trio streak! Listen to the verb. Choose the past simple, then the past participle. Beat your own best.',
      rounds: ALL_TRIOS.map((t, i) => streakRound(t, i)),
      hints: ['Past simple first. Then the past participle.'],
    },

    // ---------- 5 · Mission: predict who has done the most ----------
    { id: 'dial', kind: 'dial', part: 5, bg: WALL, actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'cards', kind: 'explore', part: 5, bg: WALL, actors: [], trains: [5],
      prompt: 'Four people, four lists. Tap each card on the wall to hear it.',
      spots: [
        { id: 'mia', x: 18, y: 56, art: L('Mia'), who: 'Mia', line: 'I have never been on a plane. I have never eaten sushi.', label: 'Mia’s card' },
        { id: 'theo', x: 40, y: 50, art: L('Theo'), who: 'Theo', line: 'I have taken a photo in every country. I have never tried surfing.', label: 'Theo’s card' },
        { id: 'ava', x: 62, y: 54, art: L('Ava'), who: 'Ava', line: 'I have flown across the world twice. I have eaten spicy noodles.', label: 'Ava’s card' },
        { id: 'vee', x: 82, y: 50, art: L('Vee'), who: 'Vee', line: 'I have seen a hundred surf videos. I have never been in the ocean.', label: 'Vee’s card' },
      ],
    },
    {
      id: 'model-task', kind: 'model', part: 5, bg: WALL, actors: [who('Vee', 'left'), who('Ava', 'right')], trains: [5],
      title: 'Watch Vee predict',
      lines: [
        { who: 'Vee', text: 'I think Ava has done the most.' },
        { who: 'Ava', text: 'Why?' },
        { who: 'Vee', text: 'She has flown across the world twice, and she has eaten spicy noodles.' },
      ],
      closing: 'Now YOU predict. Who has done the most, and why?',
    },
    {
      id: 'say-take1', kind: 'say', part: 5, bg: WALL, actors: [who('Vee', 'right')], trains: [5], open: true,
      prompt: 'Take 1 · Who has done the most? Say who, and why.',
      model: 'I think … has done the most. He or she has …',
      byDial: { chill: 'I think … has done the most.', normal: 'I think … has done the most. He or she has …', push: 'I think … has done the most. He or she has … But … has never …' },
      hints: ['Choose one person. Say one thing they have done.'],
    },
    {
      id: 'fade', kind: 'fade', part: 5, optional: true, bg: WALL, actors: [who('Vee', 'left'), who('Ava', 'right')], trains: [5],
      prompt: 'Feedback time! Say the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Vee', text: 'I think Ava has done the most.', keys: ['Ava', 'most'] },
        { who: 'Ava', text: 'She has flown across the world twice.', keys: ['flown', 'twice'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 5, bg: WALL, actors: [who('Vee', 'right')], trains: [5], open: true,
      prompt: 'Take 2 · Say it again, with your reason.',
      model: 'I think Ava has done the most. She has flown across the world twice.',
      hints: ['Use have or has, and the past participle.'],
    },

    // ---------- 6 · Release ----------
    {
      id: 'my-list', kind: 'sort', part: 6, bg: WALL, actors: [], trains: [5],
      prompt: 'Your own bucket list. Tap a thing, then a box. There is no wrong answer.',
      bins: [{ id: 'want', label: 'I want to do it', template: '{w}. I want to do it.' }, { id: 'done', label: 'I have done it', template: '{w}. I have done it.' }, { id: 'no', label: 'Not for me', template: '{w}. Not for me.' }],
      items: [{ id: 'surf', word: 'surf' }, { id: 'fly', word: 'fly across the world' }, { id: 'noodles', word: 'eat spicy noodles' }],
      hints: ['Tap a thing. Then choose a box. All three boxes are fine.'],
    },
    {
      id: 'say-release', kind: 'say', part: 6, bg: WALL, actors: [who('Ava', 'right')], trains: [1, 5], open: true,
      prompt: 'Release: say what you think of Vee’s dare, and one thing you want to do once in a lifetime. (Record it privately first, then share if you want.)',
      model: 'I think the dare is fun, but a little scary. I want to give surfing a go.',
      hints: ['Two sentences: what you think, then I want to …'],
    },

    // ---------- 7 · Wrap ----------
    {
      id: 'teach-back', kind: 'build', part: 7, bg: WALL, actors: [who('Vee', 'right')], trains: [3],
      prompt: 'Teach Vee the rule. Tap the words in the right order, then say it out loud.',
      rounds: [{ cue: 'The three forms.', target: 'Every verb has three forms.', extra: ['two', 'four'] }],
      hints: ['Say the rule, then show it with go, went, gone.'],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: CASE, actors: [who('Vee', 'left', 'thumbs')], heading: 'Your trophies are on the board!', ticks: CRITERIA,
      homework: 'Daily 10: say the three forms of ten verbs, and record a voice note with three sentences about things you have done. Not yet is okay!',
      clue: 'Clue 1 of 8: Vee has hidden a card with a mystery experience on the wall. Who has done it?',
    },
  ],
};
