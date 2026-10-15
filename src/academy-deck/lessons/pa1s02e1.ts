// Pre-A1 Season P2 "First sounds", Episode 1 "Cold Open" (the Phone), as a game deck on the Pre-A1 run of show (5/10/8/10/8/8/6/5).
// Season spec: src/curriculum/academy/preA1.ts (PA1_S02) and lesson plan docs/academy-pre-a1-s02-spec.md. Research: docs/research/academy-pa1s02e1-research.md.
// New items (<= 8): phone, pin, tin, map, "This is a ___." + sounds /i/ /n/. Rules stated plainly before the practice; the student teaches the rule back (Wrap).
// Pictures are placeholders (cards and letter tiles) until the owner approves the scenario and the Canva art is made; /i/ and /n/ clips stay silent until recorded.
import type { CastName, DeckScript, TeachArt } from '../types';
import { PRE_A1_RECALL_NODES, MAX_REMEMBER_ITEMS_PRE_A1 } from '../../curriculum/academy';
import { recallRounds } from '../recallSlides';

export const OBJECTIVE = 'By the end I can hear and say the sounds i and n, blend in, it, pin and tin, and say “This is a pin.”';
export const CRITERIA = [
  'I heard and said the sounds i and n.',
  'I blended in, it, pin and tin.',
  'I read two short lines: It is a pin. It is a tin.',
  'I said “This is a ___.” for a picture.',
  'I taught the rule back: slide the sounds, then say the word.',
];

const L = (text: string): TeachArt => ({ type: 'letters', text });
const card = (id: string, label: string): TeachArt => ({ type: 'card', id, label });
const who = (w: CastName, pos: 'left' | 'right' | 'center', expr: 'happy' | 'wave' | 'thumbs' | 'neutral' = 'happy') => ({ who: w, pos, expr });
const PH = 'bus-stop-night';
const GLOW = 'phone-screen-glow';
const PIN = card('p-pin', 'a pin');
const TIN = card('p-tin', 'a tin');
const PHONE = card('p-phone', 'a phone');
const MAP = card('p-map', 'a map');

export const PA1_S02_E1: DeckScript = {
  lessonId: 'PA1-S02-E1',
  level: 'Pre-A1',
  shape: 'pre-a1',
  title: 'First sounds · Cold Open',
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Theo', 'Ava'],
  taughtSounds: ['s', 'a', 't', 'p', 'i', 'n'],
  sightWords: ['i', 'am', 'is', 'the', 'my', 'a', 'this', 'phone', 'map', 'name', 'hello', 'ava', 'theo', 'vee'],
  partGoals: [
    'Meet the phone and pick how you feel',
    'Remember the sounds s, a, t, p',
    'A message arrives with letters missing',
    'Learn the sounds i and n and blend them',
    'Read two short lines',
    'Say “This is a ___.” for a picture',
    'Tell Theo what the picture is',
    'Teach the rule back',
  ],
  slides: [
    // ---------- 0 · Check-in ----------
    { id: 'title', kind: 'title', part: 0, bg: PH, actors: [who('Vee', 'center', 'wave')], heading: 'First sounds', sub: 'The Phone · lesson 1' },
    { id: 'badge', kind: 'badge', part: 0, bg: GLOW, actors: [who('Theo', 'right', 'wave')], trains: [4], prompt: 'Theo sends you a message. Put your name on it.', starter: 'My name is', ages: [13, 14, 15, 16, 17, 18], hints: ['Type only your name.'] },
    {
      id: 'warm', kind: 'hearpick', part: 0, bg: 'club-lobby', actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Warm up your ears! Which letter do you hear?',
      rounds: [{ say: 'S', options: ['S', 'T', 'P'], answer: 'S' }, { say: 'P', options: ['A', 'P', 'T'], answer: 'P' }, { say: 'A', options: ['S', 'A', 'P'], answer: 'A' }, { say: 'T', options: ['T', 'S', 'A'], answer: 'T' }],
      hints: ['Listen, then look for the same letter.'],
    },
    {
      id: 'feel', kind: 'convo', part: 0, bg: PH, actors: [who('Theo', 'right')], trains: [4],
      prompt: 'Pick how you feel. Tap a picture.', me: 'Ava', meLabel: 'You', after: 'Thanks! Now check the phone.',
      steps: [{ ask: 'Hello, {name}! How are you?', pic: card('v-fine', 'feeling fine'), options: [{ text: 'I am great!', pic: card('v-great', 'feeling great'), ok: true }, { text: 'I am fine.', pic: card('v-fine', 'feeling fine'), ok: true }, { text: 'I am tired.', pic: card('v-tired', 'feeling tired'), ok: true }] }],
      hints: ['There is no wrong answer. Choose how you feel.'],
    },
    {
      id: 'brief', kind: 'brief', part: 0, bg: PH, actors: [who('Vee', 'left')],
      say: 'Hi! A message came, but its letters are missing. Every sound you learn brings one back.', heading: 'Your phone card',
      stamps: [{ id: 'sounds', icon: 'abc', label: 'Learn i and n' }, { id: 'blend', icon: 'chat', label: 'Blend words' }, { id: 'say', icon: 'idcard', label: 'Say what it is' }],
    },

    // ---------- 1 · Remember? ----------
    {
      id: 'rem-match', kind: 'match', part: 1, bg: 'classroom-evening', actors: [who('Vee', 'right')], trains: [1], mode: 'listen',
      prompt: 'Remember? Listen. Tap the word for what you hear.',
      pairs: [{ word: 'sat', art: L('SAT') }, { word: 'tap', art: L('TAP') }, { word: 'at', art: L('AT') }],
      hints: ['Listen to the word, then look for it.'],
    },
    {
      id: 'rem-mem', kind: 'memory', part: 1, bg: 'classroom-evening', actors: [who('Vee', 'left')], trains: [1],
      prompt: 'Memory! Match each big letter with its small letter.',
      pairs: [{ art: L('S'), text: 's' }, { art: L('A'), text: 'a' }, { art: L('T'), text: 't' }, { art: L('P'), text: 'p' }],
      hints: ['A big letter and a small letter are the same letter.'],
    },
    {
      id: 'rem-blend', kind: 'blend', part: 1, bg: 'classroom-evening', actors: [who('Vee', 'right')], trains: [2],
      prompt: 'Slide the sounds together. What is the word?',
      rounds: [{ letters: ['s', 'a', 't'], word: 'sat' }, { letters: ['t', 'a', 'p'], word: 'tap' }, { letters: ['a', 't'], word: 'at' }],
      hints: ['Drag the slider, or tap “Blend it”.'],
    },
    {
      id: 'rem-recall', kind: 'hearpick', part: 1, bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [1, 4],
      // built from the spaced recall plan (recallPlan): what is DUE from Season 1, one item per earlier lesson in turn
      prompt: 'Remember? Which one do you hear? Tap it.',
      rounds: recallRounds(PRE_A1_RECALL_NODES, 'PA1-S02-E1', 5, MAX_REMEMBER_ITEMS_PRE_A1),
      hints: ['Listen, then look for the same words.'],
    },

    // ---------- 2 · The Drop ----------
    {
      id: 'story-open', kind: 'story', part: 2, stage: 'context', bg: PH, trains: [4], title: 'The Message',
      beats: [
        { plate: 'story-pa1s02-1', lines: [{ who: 'Vee', text: 'Look! A message!' }, { who: 'Theo', text: 'The letters are missing!' }] },
        { plate: 'story-pa1s02-2', lines: [{ who: 'Theo', text: 'This is a pin.' }, { who: 'Vee', text: 'This is a tin.' }] },
        { plate: 'story-pa1s02-3', lines: [{ who: 'Ava', text: 'I can help. Every sound brings a letter back.' }, { who: 'Vee', text: "Let's learn two sounds." }] },
      ],
    },
    {
      id: 'model-drop', kind: 'model', part: 2, bg: PH, actors: [who('Vee', 'left'), who('Theo', 'right')], trains: [3, 4],
      title: 'Watch Vee and Theo say what things are',
      lines: [
        { who: 'Theo', text: 'This is a pin.', pic: PIN },
        { who: 'Vee', text: 'This is a tin.', pic: TIN },
        { who: 'Theo', text: 'Now we can read it!' },
      ],
      closing: 'Now YOU help them.',
    },
    {
      id: 'drop-match', kind: 'match', part: 2, bg: PH, actors: [who('Vee', 'right')], trains: [4], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'phone', art: PHONE }, { word: 'pin', art: PIN }, { word: 'tin', art: TIN }, { word: 'map', art: MAP }],
      hints: ['Listen to the word, then look for its picture.'],
    },
    {
      id: 'drop-convo', kind: 'convo', part: 2, bg: PH, actors: [who('Theo', 'right')], trains: [4],
      prompt: 'Theo shows you things from the message. Choose what you say.', me: 'Ava', meLabel: 'You', after: 'Great! Now the sounds that bring the letters back.',
      steps: [
        { ask: 'Look!', pic: PIN, options: [{ text: 'This is a pin.', ok: true }, { text: 'This is a tin.', hint: 'Look again. It is a pin.' }] },
        { ask: 'And this?', pic: TIN, options: [{ text: 'This is a tin.', ok: true }, { text: 'This is a pin.', hint: 'Look again. It is a tin.' }] },
        { ask: 'And this?', pic: PHONE, options: [{ text: 'This is a phone.', ok: true }, { text: 'This is a map.', hint: 'Look again. It is a phone.' }] },
      ],
      hints: ['Look at the picture. Choose the sentence that fits.'],
    },
    // ---------- 3 · Learn set 1: the sounds i and n ----------
    {
      id: 'rule-slide', kind: 'rule', part: 3, bg: PH, actors: [who('Vee', 'left')], trains: [2, 5],
      title: 'The rule: sounds go together',
      lines: [
        { rule: 'Sounds go together: i + n = in.', say: 'Sounds go together. i and n make in.', example: 'i, n, in' },
        { rule: 'Slide the sounds. Then say the word.', say: 'Slide the sounds. Then say the word.', example: 'p-i-n → pin' },
      ],
    },
    {
      id: 'teach-in', kind: 'teach', part: 3, bg: PH, actors: [who('Vee', 'left')], trains: [1], title: 'The sounds i and n',
      pages: [
        { word: 'i', art: L('i'), meaning: 'the sound in pin and it', example: 'i, i, pin.', clue: 'Say it short: i.' },
        { word: 'n', art: L('n'), meaning: 'the sound in pin and tin', example: 'n, n, tin.', clue: 'Put your tongue behind your teeth: n.' },
      ],
      hints: ['Listen to each sound. Say it after the guide.'],
    },
    {
      id: 'hear-in', kind: 'hearpick', part: 3, bg: PH, actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Which sound do you hear? Tap it.',
      rounds: [{ say: 'i', options: ['i', 'a', 'n'], answer: 'i' }, { say: 'n', options: ['n', 'i', 't'], answer: 'n' }, { say: 'a', options: ['a', 'i', 's'], answer: 'a' }, { say: 'n', options: ['s', 'a', 'n'], answer: 'n' }],
      hints: ['Listen. i is short, like in pin.'],
    },
    {
      id: 'blend-in', kind: 'blend', part: 3, bg: 'locker-hall', actors: [who('Vee', 'right')], trains: [2],
      prompt: 'Slide the sounds together. What is the word?',
      rounds: [{ letters: ['i', 'n'], word: 'in' }, { letters: ['i', 't'], word: 'it' }, { letters: ['p', 'i', 'n'], word: 'pin', art: PIN }, { letters: ['t', 'i', 'n'], word: 'tin', art: TIN }],
      hints: ['Drag the slider, or tap “Blend it”.'],
    },
    {
      id: 'mem-in', kind: 'memory', part: 3, bg: 'locker-hall', actors: [who('Vee', 'left')], trains: [1],
      prompt: 'Memory! Match each big letter with its small letter.',
      pairs: [{ art: L('I'), text: 'i' }, { art: L('N'), text: 'n' }, { art: L('P'), text: 'p' }, { art: L('T'), text: 't' }],
      hints: ['A big letter and a small letter are the same letter.'],
    },
    { id: 'spell-pin', kind: 'spell', part: 3, bg: PH, actors: [who('Theo', 'right')], trains: [2], prompt: 'Spell PIN. Tap the letters in order.', target: 'PIN', hints: ['Listen to each sound: p, i, n.'] },

    // ---------- 4 · Read ----------
    {
      id: 'read-1', kind: 'reader', part: 4, bg: 'classroom-evening', actors: [who('Vee', 'left')], trains: [3],
      prompt: 'Read the line. Which picture is it? Tap a word to hear it.',
      lines: [{ text: 'It is a pin.', art: PIN }, { text: 'It is a tin.', art: TIN }, { text: 'It is a phone.', art: PHONE }, { text: 'It is a map.', art: MAP }],
      hints: ['Tap a word to hear it. Then pick the picture.'],
    },
    {
      id: 'read-hear', kind: 'hearpick', part: 4, bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [2],
      prompt: 'Which word do you hear? Tap it.',
      rounds: [{ say: 'pin', options: ['pin', 'tin', 'in'], answer: 'pin' }, { say: 'in', options: ['it', 'in', 'tin'], answer: 'in' }, { say: 'tin', options: ['pin', 'tin', 'it'], answer: 'tin' }],
      hints: ['Listen, then read the words.'],
    },
    {
      id: 'read-2', kind: 'reader', part: 4, bg: 'classroom-evening', actors: [who('Vee', 'left')], trains: [3],
      prompt: 'One more page. Read the line. Which picture is it?',
      lines: [{ text: 'It is a tin.', art: TIN }, { text: 'It is a pin.', art: PIN }, { text: 'It is a map.', art: MAP }],
      hints: ['Tap a word to hear it. Then pick the picture.'],
    },

    // ---------- 5 · Learn set 2: This is a ___ ----------
    {
      id: 'rule-this', kind: 'rule', part: 5, bg: PH, actors: [who('Theo', 'right')], trains: [4, 5],
      title: 'The rule: point and say',
      lines: [{ rule: 'Point and say: This is a ___.', say: 'Point and say. This is a, and the word.', example: 'This is a phone.' }],
    },
    {
      id: 'teach-this', kind: 'teach', part: 5, bg: PH, actors: [who('Theo', 'right')], trains: [4], title: 'This is a …',
      pages: [
        { word: 'phone', art: PHONE, meaning: 'you call and text with it', example: 'This is a phone.', clue: 'Say the whole word: phone.' },
        { word: 'map', art: MAP, meaning: 'a picture of a place', example: 'This is a map.', clue: 'Say the whole word: map.' },
        { word: 'This is a pin.', art: PIN, meaning: 'point at it and say what it is', example: 'This is a tin.', clue: 'Change the last word.' },
      ],
      hints: ['Point and say. This is a … and the word.'],
    },
    {
      id: 'match-this', kind: 'match', part: 5, bg: PH, actors: [who('Vee', 'right')], trains: [4], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'This is a phone.', art: PHONE }, { word: 'This is a pin.', art: PIN }, { word: 'This is a map.', art: MAP }, { word: 'This is a tin.', art: TIN }],
      hints: ['Listen to the line, then look for its picture.'],
    },
    {
      id: 'mem-this', kind: 'memory', part: 5, bg: 'locker-hall', actors: [who('Vee', 'left')], trains: [4],
      prompt: 'Memory! Find each picture and its word.',
      pairs: [{ art: PHONE, text: 'phone' }, { art: MAP, text: 'map' }, { art: PIN, text: 'pin' }, { art: TIN, text: 'tin' }],
      hints: ['Remember where you saw each picture.'],
    },
    {
      id: 'build-this', kind: 'build', part: 5, bg: PH, actors: [who('Ava', 'left')], trains: [4],
      prompt: 'Build the sentence. Tap the words in the right order.',
      rounds: [{ cue: 'Say what it is.', target: 'This is a pin.', extra: ['it', 'tin'] }, { cue: 'Say what it is.', target: 'This is a phone.', extra: ['map', 'am'] }],
      hints: ['Start with This. Then the picture word.'],
    },

    // ---------- 6 · Mission ----------
    { id: 'dial', kind: 'dial', part: 6, bg: PH, actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'say-take1', kind: 'say', part: 6, bg: PH, actors: [who('Theo', 'right', 'wave')], trains: [4], open: true,
      prompt: 'Take 1 · Theo sends two photos. Say what each one is.',
      model: 'This is a pin. This is a tin.',
      byDial: { chill: 'This is a pin.', normal: 'This is a pin. This is a tin.', push: 'This is a pin. This is a tin. This is a phone.' },
      hints: ['Read it slowly, then say it.'],
    },
    {
      id: 'fade', kind: 'fade', part: 6, bg: 'club-lobby', actors: [who('Theo', 'left'), who('Ava', 'right')], trains: [4],
      prompt: 'Feedback time! Say the lines again, with less help each round, before Take 2.',
      lines: [
        { who: 'Theo', text: 'This is a pin.', keys: ['pin'] },
        { who: 'Ava', text: 'This is a tin.', keys: ['tin'] },
        { who: 'Theo', text: 'This is a phone.', keys: ['phone'] },
      ],
    },
    {
      id: 'say-take2', kind: 'say', part: 6, bg: PH, actors: [who('Theo', 'right')], trains: [3, 4], open: true,
      prompt: 'Take 2 · Say what each photo is: a pin, a tin, a map.',
      model: 'This is a pin. This is a tin. This is a map.',
      hints: ['Point and say. This is a … and the word.'],
    },

    // ---------- 7 · Wrap ----------
    {
      id: 'teach-back', kind: 'build', part: 7, bg: PH, actors: [who('Vee', 'right')], trains: [5],
      prompt: 'Teach Vee the rule. Tap the words in the right order, then say it out loud.',
      rounds: [{ cue: 'The rule: slide the sounds.', target: 'Slide the sounds. Then say the word.', extra: ['pin', 'phone'] }],
      hints: ['Say the rule, then show it with pin: p-i-n, pin.'],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, bg: PH, actors: [who('Vee', 'left', 'thumbs')], heading: 'The message is back!', ticks: CRITERIA,
      homework: 'Daily 10: blend in, it, pin and tin, and say “This is a pin.” in a voice note. Not yet is okay!',
      clue: 'Clue 1 of 8: A new message arrives. Its first letters are missing again. Who sent it?',
    },
  ],
};
