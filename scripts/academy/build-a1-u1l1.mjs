#!/usr/bin/env node
/**
 * Academy A1 · Unit 1 · Lesson 1 — "Episode 1: My Name Is…"  (slot id 1e72652f-24a6-4978-880b-c511b9ec8a30)
 *
 * Builds the lesson `content` JSON for the Academy player (src/pages/academy-scene/PlayAcademyLesson.tsx).
 * It does NOT touch the database: it writes scripts/academy/out/a1-u1l1.content.json, which is then reviewed
 * and written to the slot row (UPDATE, never insert, is_published stays false until the branch is merged).
 *
 *   node scripts/academy/build-a1-u1l1.mjs
 *
 * Art: pictures are made in Canva from the Academy Cast Vault avatars (Ava, Theo, Mia, Vee, Nova) and listed in
 * scripts/academy/a1-u1l1.art.json ({ "cover": url, "gate": url, "classroom": url, "blocks": {warmup: url, ...},
 * "items": {hello: url, ...} }). Missing art is simply left out, so the lesson stays valid while art is pending.
 *
 * Pacing target: 60 minutes (CLAUDE.md / owner, 2026-10-05). Minutes per slide are in PACING below and are checked.
 *
 * RESEARCH LOG (2026-10-05, v2 — owner asked to rebuild with real benchmarks; take the mechanic, never the content):
 *  - VIPKid  — "I do / we do / you do" + a reward every 2-3 min -> each phrase: model (story/dialogue), guided (builder/fill), solo
 *              (Name Tag Studio, Reply Quest); XP/stars/level splash give the reward beat. Better: rewards are earned by use of language.
 *  - Lingokids / LingoAce — story characters, stars/badges -> one continuous cast (Ava, Theo, Vee, Nova) and star ratings per game.
 *  - Cambridge A1 (Starters/Movers speaking + listening) — name & spelling questions, listen-and-write names -> spell-the-tags match,
 *              Gate Guard (hear a name, check the written one), role-play "examiner" questions. Better: spelling is tested by ear AND eye.
 *  - Oxford / Headway-style Unit 1 — "I am / My name is / What's your name? / Nice to meet you" PPP -> same target chunks, teen setting.
 *  - Gimkit / Blooket — streaks, currency, power-ups -> streak flame + stars (no punishing timers). Better: no luck, only accuracy.
 *  - Papers, Please — speed + precision at a checkpoint -> GATE GUARD (new mechanic).
 *  - Visual novels (language-learning research) — branching replies + a character who visibly reacts -> REPLY QUEST (new mechanic).
 *  - Duolingo — gentle wrong-answer feedback, character reactions -> violet "try again" states, mood badge on the character.
 *
 * Scope note (curriculum engine): L1 owns "I am / you are / My name is / What's your name? / Nice to meet you"
 * + spelling a name. Age and numbers belong to L4 ("say their name and age"), so they are NOT taught here.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const artFile = path.join(here, 'a1-u1l1.art.json');
const art = fs.existsSync(artFile) ? JSON.parse(fs.readFileSync(artFile, 'utf8')) : {};
const img = (k) => art.items?.[k];
const withArt = (obj, key, value) => (value ? { ...obj, [key]: value } : obj);

// Cast = existing Academy Cast Vault (cast_vault_characters, hub academy). Do not invent new faces.
const CAST = {
  ava: { id: 'ava', name: 'Ava' },
  theo: { id: 'theo', name: 'Theo' },
  mia: { id: 'mia', name: 'Mia' },
  vee: { id: 'vee', name: 'Vee' },
  nova: { id: 'nova', name: 'Nova' },
};

const slides = [];
const PACING = []; // [label, minutes]
const add = (minutes, label, slide) => {
  slides.push(slide);
  PACING.push([label, minutes]);
};

// ───────────────────────── WARM-UP · "Episode Start" (≈ 8 min) ─────────────────────────
add(1, 'title card', withArt({
  type: 'intro', block: 'warmup', level: 'A1',
  title: 'Episode 1: My Name Is…',
  subtitle: 'I can say hello and tell people my name.',
  unit_title: 'Personal Identity & Online Profiles', unit_number: 1, lesson_number: 1,
}, 'image_url', art.cover));

add(1, 'poll', {
  type: 'poll', block: 'warmup',
  prompt: 'First day at a new school. How do you feel?',
  options: [
    { label: 'Nervous', pct: 38 }, { label: 'Excited', pct: 31 },
    { label: 'Shy', pct: 21 }, { label: 'Ready!', pct: 10 },
  ],
});

add(1.5, 'story 1', withArt({
  type: 'story_page', block: 'warmup', title: 'The New Student',
  passage: 'It is your first day at Starline Academy. You are at the gate. A girl waves. "Hello! I am Ava," she says. "What is your name?" You are a little shy. Then a small owl flies over your head. It is Nova!',
  highlight_words: [
    { word: 'Hello', color: '#b45309', emoji: '👋' },
    { word: 'Ava', color: '#4f46e5', emoji: '😊' },
    { word: 'name', color: '#0d9488', emoji: '🏷️' },
    { word: 'Nova', color: '#7c3aed', emoji: '🦉' },
  ],
}, 'bg_image_url', art.gate));

add(1.5, 'story 2', withArt({
  type: 'story_page', block: 'warmup', title: 'Name Check!',
  passage: '"Beep! Name check," says Nova. "Who are you?" You say your name. "Nice to meet you!" says Ava. A boy walks over. "Hi, I am Theo," he says. "Welcome to Starline!" Now you are not shy. You are happy!',
  highlight_words: [
    { word: 'Nice to meet you', color: '#15803d', emoji: '🤝' },
    { word: 'Theo', color: '#b45309', emoji: '😎' },
    { word: 'Welcome', color: '#4f46e5', emoji: '🌟' },
  ],
}, 'bg_image_url', art.gate));

add(1.5, 'story check', {
  type: 'truefalse', block: 'warmup',
  items: [
    { statement: 'Ava says "Hello!" at the gate.', answer: true },
    { statement: 'The new student is at home.', answer: false },
    { statement: 'Nova is a small owl.', answer: true },
    { statement: 'The boy at the gate is called Ava.', answer: false },
  ],
});

// ───────────────────────── VOCAB · "Name Tag Check" (≈ 10 min) ─────────────────────────
add(2, 'vocab 1', {
  type: 'vocab_deck', block: 'vocab', title: 'Say Hello',
  cards: [
    withArt({ word: 'hello', definition: 'what you say when you meet someone.', example: 'Hello! I am Ava.' }, 'image_url', img('hello')),
    withArt({ word: 'goodbye', definition: 'what you say when you leave.', example: 'Goodbye, Theo! See you tomorrow.' }, 'image_url', img('goodbye')),
    withArt({ word: 'name', definition: 'the word people use for you.', example: 'My name is Mia.' }, 'image_url', img('name')),
    withArt({ word: 'name tag', definition: 'a small card with your name on it.', example: 'My name tag says "Theo".' }, 'image_url', img('nametag')),
  ],
});

add(1.5, 'vocab image match', {
  type: 'vocab_image_match', block: 'vocab', prompt: 'Match each word to its picture.',
  pairs: ['hello', 'goodbye', 'name', 'nametag']
    .filter((k) => img(k))
    .map((k) => ({ word: k === 'nametag' ? 'name tag' : k, image_url: img(k) })),
});

add(2, 'vocab 2', {
  type: 'vocab_deck', block: 'vocab', title: 'Little Words, Big Meaning',
  cards: [
    { word: 'I', definition: 'the word for ME.', example: 'I am Ava.' },
    { word: 'you', definition: 'the word for the person I talk to.', example: 'You are new here.' },
    { word: 'my', definition: 'belongs to me.', example: 'My name is Theo.' },
    { word: 'your', definition: 'belongs to you.', example: 'What is your name?' },
    { word: 'Nice to meet you!', definition: 'what you say after you hear a new name.', example: 'Hi, I am Mia. — Nice to meet you!' },
  ],
});

add(2, 'spell the tags', {
  type: 'matching', block: 'vocab',
  prompt: 'Nova reads the name tags letter by letter. Match the letters to the name.',
  pairs: [
    { left: 'A – V – A', right: 'Ava' },
    { left: 'T – H – E – O', right: 'Theo' },
    { left: 'M – I – A', right: 'Mia' },
    { left: 'V – E – E', right: 'Vee' },
    { left: 'N – O – V – A', right: 'Nova' },
  ],
});

// (No find-in-scene slide: the classroom name tags are blank, so "find Ava's tag" would not match the picture.)

// ───────────────────────── READING / LISTENING · "Hallway Chatter" (≈ 10 min) ─────────────────────────
add(3, 'gate dialogue', withArt({
  type: 'scene_dialogue', block: 'reading', title: 'At the Gate',
  cast: [{ ...CAST.ava, anchor_left: '30%' }, { ...CAST.theo, anchor_left: '72%' }],
  lines: [
    { speaker: 'ava', text: 'Hello! I am Ava. What is your name?' },
    { speaker: 'theo', text: 'Hi, Ava! My name is Theo. Nice to meet you!' },
    { speaker: 'ava', text: 'Nice to meet you, Theo! You are in my class.' },
    { speaker: 'theo', text: 'Yes! Look, there is a new student. Say hello!' },
    { speaker: 'ava', text: 'Hello! What is your name?' },
  ],
}, 'bg_image_url', art.gate));

add(2, 'listening', {
  type: 'listening', block: 'reading',
  prompt: 'You get a voice message from a mentor. Listen: what is the mentor\'s name?',
  transcript: 'Hello! My name is Vee. I am your mentor at Starline Academy. Welcome! What is your name? Nice to meet you!',
});

add(1.5, 'listening check', {
  type: 'multiple', block: 'reading',
  items: [
    { question: 'What is the mentor\'s name?', options: ['Vee', 'Ava', 'Mia'], answer: 'Vee' },
    { question: 'Vee says: "I am your ___."', options: ['friend', 'mentor', 'owl'], answer: 'mentor' },
    { question: 'Vee asks: "What is your ___?"', options: ['name', 'bag', 'class'], answer: 'name' },
  ],
});

add(2, 'profile reading', {
  type: 'reading_passage', block: 'reading', title: 'Ava\'s Student Profile',
  passage: 'Name: Ava. Hello! My name is Ava. I am a student at Starline Academy. Theo is my friend. Mia is my friend too. Nova is our owl. Welcome to my profile!',
});

add(1, 'profile check', {
  type: 'truefalse', block: 'reading',
  items: [
    { statement: 'Her name is Ava.', answer: true },
    { statement: 'Theo is her friend.', answer: true },
    { statement: 'Nova is a student.', answer: false },
  ],
});

// ───────────────────────── GRAMMAR · "Code Breaker" (≈ 8 min) ─────────────────────────
add(2, 'decode', {
  type: 'grammar_color_decode', block: 'grammar',
  title: 'I am Ava.',
  rule: 'I am = my name. You are = the other person. Say your name: I am … or My name is …',
  chunks: [{ role: 'subject', text: 'I' }, { role: 'verb', text: 'am' }, { role: 'name', text: 'Ava' }],
  variants: [
    { chunks: [{ role: 'subject', text: 'My name' }, { role: 'verb', text: 'is' }, { role: 'name', text: 'Theo' }] },
    { chunks: [{ role: 'subject', text: 'You' }, { role: 'verb', text: 'are' }, { role: 'name', text: 'new here' }] },
  ],
});

add(2, 'pattern table', {
  type: 'grammar_pattern', block: 'grammar', title: 'Say it three ways',
  rows: [
    { a: 'I am', b: 'Mia.' },
    { a: 'My name is', b: 'Theo.' },
    { a: 'What is your name?', b: 'My name is Vee.' },
  ],
  rule: 'I am + name. My name is + name. To ask: What is your name? Say "I\'m" for "I am" when you talk fast.',
});

add(2, 'spot the mistake', {
  type: 'error_detection', block: 'grammar', prompt: 'Tap the word that makes each sentence wrong.',
  items: [
    { sentence: 'I is Ava.', wrongIndex: 1 },
    { sentence: 'My name am Theo.', wrongIndex: 2 },
    { sentence: 'You is new here.', wrongIndex: 1 },
    { sentence: 'What is you name?', wrongIndex: 2 },
  ],
});

add(1.5, 'choose', {
  type: 'multiple', block: 'grammar',
  items: [
    { question: 'Hello! I ___ Mia.', options: ['am', 'is', 'are'], answer: 'am' },
    { question: 'You ___ new here.', options: ['am', 'is', 'are'], answer: 'are' },
    { question: 'My name ___ Theo.', options: ['am', 'is', 'are'], answer: 'is' },
    { question: 'What is ___ name?', options: ['you', 'your', 'I'], answer: 'your' },
  ],
});

// ───────────────────────── PRACTICE · "Training Arc" (≈ 12 min) ─────────────────────────
add(2, 'sentence builder', {
  type: 'sentence_builder', block: 'practice', prompt: 'Put the words in order.',
  items: [
    { words: ['am', 'I', 'Ava', 'Hello!'], answer: ['Hello!', 'I', 'am', 'Ava'] },
    { words: ['is', 'name', 'My', 'Theo'], answer: ['My', 'name', 'is', 'Theo'] },
    { words: ['your', 'is', 'What', 'name?'], answer: ['What', 'is', 'your', 'name?'] },
    { words: ['meet', 'to', 'Nice', 'you!'], answer: ['Nice', 'to', 'meet', 'you!'] },
  ],
});

add(1.5, 'fill blank', {
  type: 'fill_blank', block: 'practice', prompt: 'Choose am, is or are.',
  items: [
    { before: 'I', answer: 'am', after: 'Vee.' },
    { before: 'My name', answer: 'is', after: 'Nova.' },
    { before: 'You', answer: 'are', after: 'in my class.' },
    { before: 'I', answer: 'am', after: 'a new student.' },
  ],
});

add(2, 'sounds m / n', {
  type: 'sound_challenge_game', block: 'practice',
  items: [
    { statement: '"Mia" starts with the sound /m/.', answer: true },
    { statement: '"Name" starts with the sound /m/.', answer: false },
    { statement: '"Nova" starts with the sound /n/.', answer: true },
    { statement: '"My" and "name" start with the same sound.', answer: false },
    { statement: '"Nice" and "Nova" start with the same sound.', answer: true },
    { statement: '"Meet" starts with the sound /n/.', answer: false },
  ],
});


// Gate Guard (NEW signature mechanic #2): a "Papers, Please"-style checkpoint — hear the visitor's name, read the tag,
// LET IN or NAME DESK. The right answer is derived from the spoken line + the tag (src/lib/academy/gateGuard.ts).
const GATE_ROUNDS = [
  { visitor: 'theo', says: 'Hi! I am Theo.', tag: 'Theo', ok: true },
  { visitor: 'ava', says: 'Hello! My name is Ava.', tag: 'Eva', ok: false },
  { visitor: 'mia', says: 'I am Mia.', tag: 'Mia', ok: true },
  { visitor: 'vee', says: 'Hello! I am Vee.', tag: 'Vea', ok: false },
  { visitor: 'theo', says: 'My name is Theo.', tag: 'Thea', ok: false },
  { visitor: 'ava', says: 'I am Ava.', tag: 'Ava', ok: true },
  { visitor: 'mia', says: 'My name is Mia.', tag: 'Mina', ok: false },
  { visitor: 'vee', says: 'I am Vee.', tag: 'Vee', ok: true },
];
add(5, 'Gate Guard', {
  type: 'gate_guard', block: 'practice', title: 'Gate Guard',
  intro: 'Nova needs a helper at the gate! Read the visitor’s name tag. Is it the same name you hear?',
  rounds: GATE_ROUNDS,
  nova_lines: { ok: 'Scan OK! Welcome to Starline!', done: 'Gate duty complete!' },
});

// ───────────────────────── INTERACTIVE · "Name Tag Studio" signature mechanic (≈ 6 min) ─────────────────────────
// NEW slide type `name_tag_studio` (component to be built in src/components/academy/game/NameTagStudio.tsx):
// the student designs a manga-style transfer-student card (pick avatar + colour, type their name), Nova "scans"
// it and checks the spelling, the student says "Hello! My name is …" and the card is saved to their profile
// so later A1 episodes reuse it. Pure live UI + recorded Nova lines; no AI-generated face of the student.
add(6, 'Name Tag Studio', {
  type: 'name_tag_studio', block: 'interactive', title: 'Name Tag Studio',
  intro: 'Make your own name tag for Starline Academy. Nova will scan it!',
  avatars: ['ava', 'theo', 'vee'], // Mia's vault picture is a scene with a background, not a cut-out like the others
  steps: [
    { id: 'avatar', prompt: 'Choose your avatar.' },
    { id: 'name', prompt: 'Type your name.', checkSpelling: true },
    { id: 'say', prompt: 'Say: "Hello! My name is …"', model: 'Hello! My name is {name}.' },
    { id: 'scan', prompt: 'Nova scans your tag…' },
  ],
  nova_lines: {
    ok: 'Scan complete! Welcome to Starline Academy!',
    retry: 'Beep. Check the letters of your name again.',
  },
  save_to_profile: true,
});

// ───────────────────────── SPEAKING · "Season Premiere" (≈ 8 min) ─────────────────────────
// Reply Quest (NEW signature mechanic #3): a visual-novel conversation. Pick the best reply; Ava reacts; a friendship meter
// fills. "…" in a reply is filled with the name the student made in Name Tag Studio.
add(4, 'Reply Quest', {
  type: 'reply_quest', block: 'speaking', title: 'Talk to Ava', character: 'ava',
  turns: [
    { npc: 'Hello! I am Ava. What is your name?', replies: [
      { text: 'Hello! I am …', ok: true, react: 'Nice! Welcome to Starline!' },
      { text: 'Goodbye!', react: 'Hmm… we just met!' },
      { text: 'Thank you.', react: 'Hmm, I asked your name.' } ] },
    { npc: 'Nice to meet you!', replies: [
      { text: 'Nice to meet you, too!', ok: true, react: 'Great! You are so friendly.' },
      { text: 'My name is Ava.', react: 'That is MY name!' },
      { text: 'Goodbye!', react: 'Not yet! We just said hello.' } ] },
    { npc: 'Sorry, one more time. What is your name?', replies: [
      { text: 'My name is …', ok: true, react: 'Got it! I will remember.' },
      { text: 'Nice to meet you!', react: 'Yes! But what is your NAME?' },
      { text: 'Goodbye!', react: 'Wait! First tell me your name.' } ] },
    { npc: 'Oh no, I am late for class. Goodbye!', replies: [
      { text: 'Goodbye! See you tomorrow!', ok: true, react: 'See you in class!' },
      { text: 'Hello! I am …', react: 'We already said hello. Now it is goodbye!' },
      { text: 'What is your name?', react: 'I am Ava! Now it is time to say goodbye.' } ] },
  ],
  done_line: 'Ava says: “See you in class!”',
});

add(4, 'gate check role-play', withArt({
  type: 'role_play', block: 'speaking', title: 'Gate Check',
  characters: [
    {
      id: 'ava', name: 'Ava',
      lineA: 'Hello! I am Ava. What is your name?',
      hintsA: ['Hello! I am …', 'Hi, Ava! My name is …'],
      lineC: 'Nice to meet you! Goodbye for now. See you in class!',
      hintsC: ['Nice to meet you, Ava!', 'Goodbye! See you in class!'],
      closing: 'Great! You are ready for class.',
    },
    {
      id: 'vee', name: 'Vee',
      lineA: 'Hi! My name is Vee. I am your mentor. What is your name?',
      hintsA: ['Hello, Vee! I am …', 'Hi! My name is …'],
      lineC: 'Nice to meet you. Welcome to Starline Academy!',
      hintsC: ['Nice to meet you, Vee!', 'Thank you!'],
      closing: 'Perfect. See you tomorrow!',
    },
  ].map((c) => withArt(c, 'bg_image_url', art.gate)),
}, 'bg_image_url', art.gate));

add(4, 'partner mission', {
  type: 'speaking_task', block: 'speaking',
  prompt: 'Final mission: meet THREE new classmates. Say hello, ask their name and say nice to meet you. Then say goodbye. Take turns with your partner.',
  starters: [
    'Hello! I am …', 'What is your name?', 'My name is …',
    'Nice to meet you!', 'Goodbye! See you tomorrow!',
  ],
});

add(1, 'reflection', {
  type: 'reflection', block: 'speaking',
  prompt: 'How easy was it to say hello and tell people your name today?',
});

add(1, 'summary', {
  type: 'lesson_summary', block: 'speaking', title: 'Episode 1 Complete!',
  takeaway: 'You can now say hello, tell people your name with "I am…" and "My name is…", and ask "What is your name?". Next episode: Meet My Friends!',
  vocab_recap: ['hello', 'goodbye', 'name', 'name tag', 'I', 'you', 'my', 'your', 'Nice to meet you!'],
  grammar_recap: 'I am + name · My name is + name · You are + … · What is your name?',
});

// ───────────────────────── LEVELS (block headings in the player) ─────────────────────────
const levels = {
  warmup: { title: 'Episode Start', emoji: '🎬', goal: 'Meet Ava, Theo and Nova on your first day.', ican: 'understand a short story about meeting new people.' },
  vocab: { title: 'Name Tag Check', emoji: '🏷️', goal: 'Learn the words for saying hello and names.', ican: 'say hello, goodbye and name words.' },
  reading: { title: 'Hallway Chatter', emoji: '💬', goal: 'Listen and read how students introduce themselves.', ican: 'understand short introductions.' },
  grammar: { title: 'Code Breaker', emoji: '🔓', goal: 'Crack the pattern: I am… / My name is…', ican: 'use I am, you are and My name is.' },
  practice: { title: 'Training Arc', emoji: '⚔️', goal: 'Build sentences, then guard the gate: match every name tag.', ican: 'build sentences and recognise names I hear.' },
  interactive: { title: 'Name Tag Studio', emoji: '🪪', goal: 'Design your own student name tag and let Nova scan it.', ican: 'make and say my own introduction.' },
  speaking: { title: 'Season Premiere', emoji: '🎤', goal: 'Chat with Ava, then meet new classmates.', ican: 'introduce myself, reply in a conversation and ask someone\'s name.' },
};

const content = { hub: 'academy', levels, slides, homework_missions: [] };
if (art.blocks) content.blockImages = art.blocks;

// ───────────────────────── CHECKS ─────────────────────────
const nameIn = (t) => (t.match(/(?:\bI am|\bI['’]m|\bmy name is|\bmy name['’]s)\s+([A-Za-z]+)/i) || [])[1];
for (const [i, r] of GATE_ROUNDS.entries()) {
  const want = !!nameIn(r.says) && nameIn(r.says).toLowerCase() === r.tag.toLowerCase();
  if (want !== r.ok) { console.error(`✗ gate round ${i + 1}: ok=${r.ok} but "${r.says}" vs tag "${r.tag}"`); process.exitCode = 1; }
}
const total = PACING.reduce((s, [, m]) => s + m, 0);
const types = new Set(slides.map((s) => s.type));
console.log(`Slides: ${slides.length}   estimated minutes: ${total}   distinct slide types: ${types.size}`);
if (total < 55 || total > 65) {
  console.error(`✗ Pacing ${total} min is outside the 55–65 minute window (lessons are one hour).`);
  process.exitCode = 1;
}
for (const s of slides) {
  if (!s.type || !s.block) { console.error('✗ slide without type/block', s); process.exitCode = 1; }
  if (s.type === 'vocab_image_match' && s.pairs.length < 3) {
    console.warn('! vocab_image_match has <3 pictures yet (art pending) — slide will be dropped at publish time.');
  }
}

const outDir = path.join(here, 'out');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'a1-u1l1.content.json'), JSON.stringify(content, null, 2));
console.log('Wrote scripts/academy/out/a1-u1l1.content.json');
