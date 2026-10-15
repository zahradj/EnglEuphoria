// Pre-A1 Season P2 "First sounds", Episode 1 "Cold Open" (the Phone), as a game deck on the Pre-A1 run of show (5/10/8/10/8/8/6/5).
// v3 (owner 2026-10-15, docs/academy-pre-a1-reading-first.md): reading-first. Activate what the student knows (sort), blend, read a message (passage) and keep words for the word bank, then play the bank.
// v2 (owner 2026-10-15, docs/academy-pre-a1-s02-e1-v2-plan.md): "Unlock the Lost Phone": five locks (Ears, Blend, Read, Say, Message), a key HUD, a vault door after each lock, a boss duel at Lock 4, a lesson clock for the teacher.
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
  'I read short lines and a message, and kept words for my word bank.',
  'I said “This is a ___.” for a picture.',
  'I taught the rule back: slide the sounds, then say the word.',
];

const L = (text: string): TeachArt => ({ type: 'letters', text });
const card = (id: string, label: string): TeachArt => ({ type: 'card', id, label });
const who = (w: CastName, pos: 'left' | 'right' | 'center', expr: 'happy' | 'wave' | 'thumbs' | 'neutral' = 'happy') => ({ who: w, pos, expr });
const PH = 'bus-stop-night';
const GLOW = 'phone-screen-glow';
const LOCKSCREEN = 'lockscreen-closeup';
const VAULT = 'vault-corridor';
const DAWN = 'bus-stop-dawn';
const PIN = card('p-pin', 'a pin');
const TIN = card('p-tin', 'a tin');
const PHONE = card('p-phone', 'a phone');
const MAP = card('p-map', 'a map');

export const PA1_S02_E1: DeckScript = {
  lessonId: 'PA1-S02-E1',
  level: 'Pre-A1',
  shape: 'pre-a1',
  title: 'First sounds · Cold Open',
  locks: ['Ears', 'Blend', 'Read', 'Say', 'Message'],
  clock: true,
  // the required pages fill exactly the hour (reading-first: 11 min Read with the message and the word bank, 8 min Remember?, 5 min Learn more, 9 min Mission with the boss lock); the dashed pages are extra practice the teacher can add or skip
  partMinutes: [5, 8, 8, 10, 11, 5, 9, 4],
  objective: OBJECTIVE,
  criteria: CRITERIA,
  cast: ['Vee', 'Theo', 'Ava'],
  taughtSounds: ['s', 'a', 't', 'p', 'i', 'n'],
  sightWords: ['i', 'am', 'is', 'the', 'my', 'a', 'this', 'phone', 'map', 'name', 'hello', 'ava', 'theo', 'vee'],
  partGoals: [
    'Meet the lost phone and pick how you feel',
    'Remember the sounds s, a, t, p',
    'A lost phone with five locks',
    'Locks 1 and 2: hear i and n, then blend them',
    'Lock 3: read lines and a message, keep words',
    'Get ready for Lock 4: point and say',
    'Lock 4: say “This is a ___.” to open it',
    'Lock 5: read the message and teach the rule back',
  ],
  slides: [
    // ---------- 0 · Check-in: a lost phone with five locks ----------
    { id: 'title', kind: 'title', part: 0, bg: LOCKSCREEN, actors: [who('Vee', 'center', 'wave')], heading: 'First sounds', sub: 'The Phone · lesson 1' },
    { id: 'badge', kind: 'badge', part: 0, bg: GLOW, actors: [who('Theo', 'right', 'wave')], trains: [4], prompt: 'Theo found a lost phone. Put your name on its screen.', starter: 'My name is', ages: [13, 14, 15, 16, 17, 18], hints: ['Type only your name.'] },
    {
      id: 'activate', kind: 'sort', part: 0, bg: LOCKSCREEN, actors: [who('Vee', 'right')], trains: [3],
      prompt: 'What do you already know? Tap a word, then tap a box. There is no wrong answer.',
      save: 'known',
      bins: [{ id: 'know', label: 'I know it', template: '{w}. I know it.' }, { id: 'new', label: 'New to me', template: '{w}. New to me.' }],
      items: [{ id: 'phone', art: PHONE, word: 'phone' }, { id: 'map', art: MAP, word: 'map' }, { id: 'pin', art: PIN, word: 'pin' }, { id: 'tin', art: TIN, word: 'tin' }],
      hints: ['Tap a word. Then choose a box. Both boxes are fine.'],
    },
    {
      id: 'warm', kind: 'hearpick', part: 0, optional: true, bg: LOCKSCREEN, actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Warm up your ears! Which letter do you hear?',
      rounds: [{ say: 'S', options: ['S', 'T', 'P'], answer: 'S' }, { say: 'P', options: ['A', 'P', 'T'], answer: 'P' }, { say: 'A', options: ['S', 'A', 'P'], answer: 'A' }, { say: 'T', options: ['T', 'S', 'A'], answer: 'T' }],
      hints: ['Listen, then look for the same letter.'],
    },
    {
      id: 'feel', kind: 'convo', part: 0, bg: PH, actors: [who('Theo', 'right')], trains: [4],
      prompt: 'Pick how you feel. Tap a picture.', me: 'Ava', meLabel: 'You', after: 'Thanks! Now look at the phone.',
      steps: [{ ask: 'Hello, {name}! How are you?', pic: card('v-fine', 'feeling fine'), options: [{ text: 'I am great!', pic: card('v-great', 'feeling great'), ok: true }, { text: 'I am fine.', pic: card('v-fine', 'feeling fine'), ok: true }, { text: 'I am tired.', pic: card('v-tired', 'feeling tired'), ok: true }] }],
      hints: ['There is no wrong answer. Choose how you feel.'],
    },
    {
      id: 'brief', kind: 'brief', part: 0, bg: LOCKSCREEN, actors: [who('Vee', 'left')],
      say: 'Hi! We found a lost phone. It has five locks. Every sound you learn opens one.', heading: 'Your phone card',
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
    { id: 'rem-spell', kind: 'spell', part: 1, optional: true, bg: 'classroom-evening', actors: [who('Theo', 'right')], trains: [2], prompt: 'Spell TAP. Tap the letters in order.', target: 'TAP', hints: ['Listen to each sound: t, a, p.'] },
    {
      id: 'rem-recall', kind: 'hearpick', part: 1, bg: 'club-lobby', actors: [who('Theo', 'right')], trains: [1, 4],
      // built from the spaced recall plan (recallPlan): what is DUE from Season 1, one item per earlier lesson in turn
      prompt: 'Remember? Which one do you hear? Tap it.',
      rounds: recallRounds(PRE_A1_RECALL_NODES, 'PA1-S02-E1', 5, MAX_REMEMBER_ITEMS_PRE_A1),
      hints: ['Listen, then look for the same words.'],
    },

    // ---------- 2 · The Drop: the lost phone ----------
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
      prompt: 'Theo shows you things from the phone. Choose what you say.', me: 'Ava', meLabel: 'You', after: 'Great! Now the sounds that open the locks.',
      steps: [
        { ask: 'Look!', pic: PIN, options: [{ text: 'This is a pin.', ok: true }, { text: 'This is a tin.', hint: 'Look again. It is a pin.' }] },
        { ask: 'And this?', pic: TIN, options: [{ text: 'This is a tin.', ok: true }, { text: 'This is a pin.', hint: 'Look again. It is a tin.' }] },
        { ask: 'And this?', pic: PHONE, options: [{ text: 'This is a phone.', ok: true }, { text: 'This is a map.', hint: 'Look again. It is a phone.' }] },
      ],
      hints: ['Look at the picture. Choose the sentence that fits.'],
    },
    {
      id: 'drop-explore', kind: 'explore', part: 2, optional: true, bg: PH, actors: [], trains: [4],
      prompt: 'Search the bus stop. Tap every glowing thing.',
      spots: [
        { id: 'phone', x: 22, y: 70, art: PHONE, who: 'Vee', line: 'This is a phone.', label: 'On the bench' },
        { id: 'pin', x: 46, y: 74, art: PIN, who: 'Theo', line: 'This is a pin.', label: 'On the floor' },
        { id: 'tin', x: 68, y: 72, art: TIN, who: 'Theo', line: 'This is a tin.', label: 'By the lamp' },
        { id: 'map', x: 86, y: 66, art: MAP, who: 'Ava', line: 'This is a map.', label: 'On the wall' },
      ],
    },

    // ---------- 3 · Learn: Lock 1 (Ears) and Lock 2 (Blend) ----------
    {
      id: 'rule-slide', kind: 'rule', part: 3, lock: 1, bg: VAULT, actors: [who('Vee', 'left')], trains: [2, 5],
      title: 'The rule: sounds go together',
      lines: [
        { rule: 'Sounds go together: i + n = in.', say: 'Sounds go together. i and n make in.', example: 'i, n, in' },
        { rule: 'Slide the sounds. Then say the word.', say: 'Slide the sounds. Then say the word.', example: 'p-i-n → pin' },
      ],
    },
    {
      id: 'teach-in', kind: 'teach', part: 3, lock: 1, bg: VAULT, actors: [who('Vee', 'left')], trains: [1], title: 'The sounds i and n',
      pages: [
        { word: 'i', art: L('i'), meaning: 'the sound in pin and it', example: 'i, i, pin.', clue: 'Say it short: i.' },
        { word: 'n', art: L('n'), meaning: 'the sound in pin and tin', example: 'n, n, tin.', clue: 'Put your tongue behind your teeth: n.' },
      ],
      hints: ['Listen to each sound. Say it after the guide.'],
    },
    {
      id: 'lock-ears', kind: 'rhythm', part: 3, lock: 1, bg: VAULT, actors: [who('Vee', 'right')], trains: [1],
      prompt: 'Lock 1 · Ears. Listen. Tap the word to set each pin.',
      rounds: [
        { say: 'in', options: ['in', 'an', 'at'], answer: 'in' },
        { say: 'it', options: ['at', 'it', 'in'], answer: 'it' },
        { say: 'tin', options: ['tan', 'tin', 'tip'], answer: 'tin' },
        { say: 'pin', options: ['pan', 'pit', 'pin'], answer: 'pin' },
        { say: 'sit', options: ['sat', 'sit', 'sip'], answer: 'sit' },
      ],
      hints: ['Listen to the middle sound: i or a.'],
    },
    { id: 'vault-1', kind: 'vault', part: 3, lock: 1, bg: VAULT, actors: [who('Theo', 'right', 'thumbs')], line: 'Lock 1 is open!', reward: 'Key 1 of 5 · Ears' },
    {
      id: 'blend-in', kind: 'blend', part: 3, lock: 2, bg: VAULT, actors: [who('Vee', 'right')], trains: [2],
      prompt: 'Lock 2 · Blend. Slide the sounds together. What is the word?',
      rounds: [{ letters: ['i', 'n'], word: 'in' }, { letters: ['i', 't'], word: 'it' }, { letters: ['p', 'i', 'n'], word: 'pin', art: PIN }, { letters: ['t', 'i', 'n'], word: 'tin', art: TIN }],
      hints: ['Drag the slider, or tap “Blend it”.'],
    },
    { id: 'spell-pin', kind: 'spell', part: 3, lock: 2, bg: VAULT, actors: [who('Theo', 'right')], trains: [2], prompt: 'Spell PIN. Tap the letters in order.', target: 'PIN', hints: ['Listen to each sound: p, i, n.'] },
    { id: 'vault-2', kind: 'vault', part: 3, lock: 2, bg: VAULT, actors: [who('Vee', 'left', 'thumbs')], line: 'Lock 2 is open!', reward: 'Key 2 of 5 · Blend' },

    // ---------- 4 · Read: Lock 3 ----------
    {
      id: 'read-1', kind: 'reader', part: 4, lock: 3, bg: LOCKSCREEN, actors: [who('Vee', 'left')], trains: [3],
      prompt: 'Lock 3 · Read. Read the line. Which picture is it? Tap a word to hear it.',
      lines: [{ text: 'It is a pin.', art: PIN }, { text: 'It is a tin.', art: TIN }, { text: 'It is a phone.', art: PHONE }, { text: 'It is a map.', art: MAP }],
      hints: ['Tap a word to hear it. Then pick the picture.'],
    },
    {
      id: 'msg-theo', kind: 'passage', part: 4, lock: 3, bg: LOCKSCREEN, actors: [who('Theo', 'right')], trains: [3],
      prompt: 'A message from Theo. Listen, read it, then keep the words you want.',
      from: 'Theo', bank: 'bank', keep: 3,
      lines: ['I am Theo.', 'It is a pin.', 'It is in a tin.', 'It is a map.'],
      keepFrom: ['pin', 'tin', 'map', 'in', 'it', 'is'],
      hints: ['Tap any word to hear it. Then choose the words you want to remember.'],
    },
    {
      id: 'bank-match', kind: 'match', part: 4, lock: 3, bg: LOCKSCREEN, actors: [who('Vee', 'right')], trains: [3], mode: 'listen',
      prompt: 'Your word bank. Listen. Tap the word you hear.',
      pairs: [{ word: 'pin', art: L('PIN') }, { word: 'tin', art: L('TIN') }, { word: 'map', art: L('MAP') }, { word: 'in', art: L('IN') }],
      hints: ['Listen to the word, then look for it in your word bank.'],
    },
    {
      id: 'read-hear', kind: 'hearpick', part: 4, lock: 3, bg: LOCKSCREEN, actors: [who('Theo', 'right')], trains: [2],
      prompt: 'Which word do you hear? Tap it.',
      rounds: [{ say: 'pin', options: ['pin', 'tin', 'in'], answer: 'pin' }, { say: 'in', options: ['it', 'in', 'tin'], answer: 'in' }, { say: 'tin', options: ['pin', 'tin', 'it'], answer: 'tin' }],
      hints: ['Listen, then read the words.'],
    },
    {
      id: 'read-2', kind: 'reader', part: 4, optional: true, lock: 3, bg: LOCKSCREEN, actors: [who('Vee', 'left')], trains: [3],
      prompt: 'One more page. Read the line. Which picture is it?',
      lines: [{ text: 'It is a tin.', art: TIN }, { text: 'It is a pin.', art: PIN }, { text: 'It is a map.', art: MAP }],
      hints: ['Tap a word to hear it. Then pick the picture.'],
    },
    { id: 'vault-3', kind: 'vault', part: 4, lock: 3, bg: VAULT, actors: [who('Ava', 'right', 'thumbs')], line: 'Lock 3 is open!', reward: 'Key 3 of 5 · Read' },

    // ---------- 5 · Learn more: get ready for Lock 4 ----------
    {
      id: 'rule-this', kind: 'rule', part: 5, lock: 4, bg: VAULT, actors: [who('Theo', 'right')], trains: [4, 5],
      title: 'The rule: point and say',
      lines: [{ rule: 'Point and say: This is a ___.', say: 'Point and say. This is a, and the word.', example: 'This is a phone.' }],
    },
    {
      id: 'teach-this', kind: 'teach', part: 5, lock: 4, bg: VAULT, actors: [who('Theo', 'right')], trains: [4], title: 'This is a …',
      pages: [
        { word: 'phone', art: PHONE, meaning: 'you call and text with it', example: 'This is a phone.', clue: 'Say the whole word: phone.' },
        { word: 'map', art: MAP, meaning: 'a picture of a place', example: 'This is a map.', clue: 'Say the whole word: map.' },
        { word: 'This is a pin.', art: PIN, meaning: 'point at it and say what it is', example: 'This is a tin.', clue: 'Change the last word.' },
      ],
      hints: ['Point and say. This is a … and the word.'],
    },
    {
      id: 'match-this', kind: 'match', part: 5, lock: 4, bg: VAULT, actors: [who('Vee', 'right')], trains: [4], mode: 'listen',
      prompt: 'Listen. Tap the picture for what you hear.',
      pairs: [{ word: 'This is a phone.', art: PHONE }, { word: 'This is a pin.', art: PIN }, { word: 'This is a map.', art: MAP }, { word: 'This is a tin.', art: TIN }],
      hints: ['Listen to the line, then look for its picture.'],
    },
    {
      id: 'hear-this', kind: 'hearpick', part: 5, optional: true, lock: 4, bg: VAULT, actors: [who('Theo', 'right')], trains: [4],
      prompt: 'Which line do you hear? Tap it.',
      rounds: [{ say: 'This is a pin.', options: ['This is a pin.', 'This is a tin.', 'This is a map.'], answer: 'This is a pin.' }, { say: 'This is a phone.', options: ['This is a map.', 'This is a phone.', 'This is a tin.'], answer: 'This is a phone.' }, { say: 'This is a tin.', options: ['This is a tin.', 'This is a pin.', 'This is a phone.'], answer: 'This is a tin.' }],
      hints: ['Listen to the last word.'],
    },
    {
      id: 'build-this', kind: 'build', part: 5, optional: true, lock: 4, bg: VAULT, actors: [who('Ava', 'left')], trains: [4],
      prompt: 'Build the sentence. Tap the words in the right order.',
      rounds: [{ cue: 'Say what it is.', target: 'This is a pin.', extra: ['it', 'tin'] }, { cue: 'Say what it is.', target: 'This is a phone.', extra: ['map', 'am'] }],
      hints: ['Start with This. Then the picture word.'],
    },

    // ---------- 6 · Mission: Lock 4 (Say it to open it) and Lock 5 (the message) ----------
    { id: 'dial', kind: 'dial', part: 6, lock: 4, bg: VAULT, actors: [who('Vee', 'right', 'thumbs')], prompt: 'Mission time! How much help do you want?' },
    {
      id: 'say-take1', kind: 'say', part: 6, lock: 4, bg: PH, actors: [who('Theo', 'right', 'wave')], trains: [4], open: true,
      prompt: 'Take 1 · Theo sends two photos. Say what each one is.',
      model: 'This is a pin. This is a tin.',
      byDial: { chill: 'This is a pin.', normal: 'This is a pin. This is a tin.', push: 'This is a pin. This is a tin. This is a phone.' },
      hints: ['Read it slowly, then say it.'],
    },
    {
      id: 'fade', kind: 'fade', part: 6, optional: true, lock: 4, bg: 'club-lobby', actors: [who('Theo', 'left'), who('Ava', 'right')], trains: [4],
      prompt: 'Feedback time! Say the lines again, with less help each round, before the boss lock.',
      lines: [
        { who: 'Theo', text: 'This is a pin.', keys: ['pin'] },
        { who: 'Ava', text: 'This is a tin.', keys: ['tin'] },
        { who: 'Theo', text: 'This is a phone.', keys: ['phone'] },
      ],
    },
    {
      id: 'lock-duel', kind: 'duel', part: 6, lock: 4, bg: VAULT, actors: [who('Theo', 'right')], trains: [4],
      prompt: 'Lock 4 · Say it to open it. Choose the word, then say the sentence.',
      frame: 'This is a ___.',
      rounds: [
        { art: PIN, options: ['pin', 'tin', 'map'], answer: 'pin' },
        { art: PHONE, options: ['map', 'phone', 'pin'], answer: 'phone' },
        { art: TIN, options: ['tin', 'pin', 'phone'], answer: 'tin' },
        { art: MAP, options: ['phone', 'tin', 'map'], answer: 'map' },
      ],
      hints: ['Look at the picture. Which word is it?'],
    },
    {
      id: 'say-take2', kind: 'say', part: 6, lock: 4, bg: PH, actors: [who('Theo', 'right')], trains: [3, 4], open: true,
      prompt: 'Take 2 · Say what each photo is: a pin, a tin, a map.',
      model: 'This is a pin. This is a tin. This is a map.',
      hints: ['Point and say. This is a … and the word.'],
    },
    { id: 'vault-4', kind: 'vault', part: 6, lock: 4, bg: VAULT, actors: [who('Theo', 'left', 'thumbs')], line: 'Lock 4 is open!', reward: 'Key 4 of 5 · Say' },

    {
      id: 'message', kind: 'reader', part: 6, lock: 5, bg: DAWN, actors: [who('Ava', 'left')], trains: [2, 3],
      prompt: 'Lock 5 · The message. Read it. Which picture is it?',
      lines: [{ text: 'It is a pin.', art: PIN }, { text: 'It is a tin.', art: TIN }],
      hints: ['Tap a word to hear it. Then pick the picture.'],
    },
    { id: 'vault-5', kind: 'vault', part: 6, lock: 5, bg: DAWN, actors: [who('Ava', 'left', 'thumbs')], line: 'Lock 5 is open! The phone is unlocked.', reward: 'Key 5 of 5 · Message' },

    // ---------- 7 · Wrap: teach the rule back, the phone is unlocked ----------
    {
      id: 'teach-back', kind: 'build', part: 7, lock: 5, bg: DAWN, actors: [who('Vee', 'right')], trains: [5],
      prompt: 'Teach Vee the rule. Tap the words in the right order, then say it out loud.',
      rounds: [{ cue: 'The rule: slide the sounds.', target: 'Slide the sounds. Then say the word.', extra: ['pin', 'phone'] }],
      hints: ['Say the rule, then show it with pin: p-i-n, pin.'],
    },
    {
      id: 'wrap', kind: 'wrap', part: 7, lock: 5, bg: DAWN, actors: [who('Vee', 'left', 'thumbs')], heading: 'The phone is unlocked!', ticks: CRITERIA,
      homework: 'Daily 10: blend in, it, pin and tin, and say “This is a pin.” in a voice note. Not yet is okay!',
      clue: 'Clue 1 of 8: A new message arrives. Its first letters are missing again. Who sent it?',
    },
  ],
};
