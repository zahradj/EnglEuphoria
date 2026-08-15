#!/usr/bin/env node
/**
 * Pre-generates static voice clips for lesson dialogue that is spoken
 * VERBATIM from scene data (no runtime template/derivation), so the app
 * stops depending on a live ElevenLabs call for that dialogue at play-time.
 * See the plan this implements: fuzzy-hugging-rossum.md.
 *
 * Usage:
 *   npx tsx scripts/generate-voice-cache.mjs --lesson=LESSON_1_SCENES   # pilot: one lesson (matches by export name across ALL engines below)
 *   npx tsx scripts/generate-voice-cache.mjs                            # full run, every engine, every lesson
 *
 * `--lesson=<EXPORT_NAME>` limits generation to one lesson's exported scene
 * array (e.g. `LESSON_1_SCENES`). Scene `id`s in this codebase do NOT
 * follow a consistent per-lesson prefix/suffix, so the export name — not the
 * scene id — is the only reliable way to scope a run to one lesson. Note
 * unit1 and welcome-town both export a `LESSON_1_SCENES`/`LESSON_2_SCENES`
 * (different lessons, same name, different module) — `--lesson=` matches
 * the name in EVERY engine, so scope with that in mind. Omit the flag to
 * cover every scene in every engine's `LESSON_*_SCENES` export.
 *
 * Only the scene kinds listed in each engine's EXTRACTORS below are
 * covered — these are the kinds confirmed (by reading the actual
 * SceneRenderer.tsx call sites, not guessed from field names) to speak a
 * scene-data field as-is. Kinds that build their spoken text from a
 * template or helper function at render time (trace's OLD "letter! phoneme
 * word!" line before it was simplified, basket's OLD phoneme-prefixed
 * announcement, color/shape/toy-model sentence-builders, numbers
 * derivations, quiz result lines, letter-game's "Find the letter X!",
 * frequency-ladder's "How often do you...?", choice's "Yes! {label}!",
 * etc.) are deliberately NOT covered here — pre-generating those safely
 * needs that derivation logic extracted into a shared module first (tracked
 * as a follow-up), so a pre-baked clip can never silently drift from what
 * the renderer actually says. Anything not covered here keeps using the
 * existing live-generation + IndexedDB fallback in unit1/audio.ts,
 * unchanged — including welcome-town, which imports and shares that exact
 * same module (confirmed: `../unit1/audio` import in
 * welcome-town/SceneRenderer.tsx), so its static-cache-first check applies
 * to every engine below with zero extra wiring.
 *
 * Engines covered: unit1 (Pre-A1), welcome-town (A1), welcome-town-a2 (A2).
 * welcome-town-a2 has no renderer of its own — its lessons play through
 * welcome-town/SceneRenderer.tsx and share its Scene type/CAST/VOICE_KEY,
 * so it reuses WT_EXTRACTORS and WT's character-key mapping below.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as unit1Scenes from '../src/content/playground-library/unit1/scenes.ts';
import * as wtScenes from '../src/content/playground-library/welcome-town/scenes.ts';
import * as wtA2Scenes from '../src/content/playground-library/welcome-town-a2/scenes.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'audio-cache');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SUPABASE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s';

// Mirrors unit1/audio.ts's VOICE_ID — keep in sync. A voice re-cast there
// (see that file's version-history comment on `key()`) needs the same
// change here, plus bumping KEY_VERSION below so stale static clips 404
// and fall back to live regeneration instead of playing the old voice.
const VOICE_ID = {
  pip: 'MF3mGyEYCl7XYWbV9V6O',
  mia: 'pFZP5JQG7iQjIQuC4Bku',
  bella: 'XrExE9yKIg1WjnnlVkGX',
  willow: 'piTKgcLEGmPE4e6mEKli',
  leo: 'zrHiDhphv9ZnVXBqCLjz',
  teacher: 'jsCqWAovK2LkecY7zXl4',
  narrator: 'jsCqWAovK2LkecY7zXl4',
};

// Mirrors unit1/audio.ts's key()'s version tag.
const KEY_VERSION = 'v11';
function cacheKey(character, text) {
  return `${character}::${KEY_VERSION}::${text}`;
}

// FNV-1a — byte-for-byte identical to audio.ts's fnv1a(). Must stay in sync
// so the runtime and this script land on the same filename for a clip.
function fnv1a(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
function cacheFileName(character, text) {
  return fnv1a(cacheKey(character, text));
}

/** Literal strings baked directly into a SceneRenderer.tsx (not scene data)
 *  under a FIXED voice regardless of which scene triggers them — safe to
 *  pre-generate once regardless of which lesson triggers the run. Lines
 *  whose voice varies by scene (e.g. sound-pop's win line, spoken by
 *  whichever character that scene's `who` is) are NOT listed here — they're
 *  extracted per-scene by UNIT1_EXTRACTORS instead so every voice variant
 *  actually used gets baked. */
const FIXED_LINES = [
  ['pip', 'Awesome voice! Great job!'],
  ['pip', 'Amazing! Great voice!'],
  ['teacher', 'Amazing! All sounds sorted!'],
  ['teacher', "Nice try! Let's pop more next time."],
  ['teacher', 'Amazing! Brick crush champion!'],
  ['teacher', 'Great try!'],
];

const CAST = unit1Scenes.CAST;

/** Small helpers that mirror shared derivation logic in
 *  unit1/SceneRenderer.tsx byte-for-byte — these produce spoken text from a
 *  template/lookup rather than a raw scene field, but the template itself
 *  and every possible input are fully known ahead of time, so the result is
 *  exactly as safe to pre-generate as a verbatim field. Keep each one in
 *  sync with its renderer counterpart; a mismatch here bakes an audio clip
 *  that says something different from what the app actually displays. */
const NUMBER_WORDS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];
function numberSpeech(n) {
  const w = NUMBER_WORDS[n - 1];
  return w ? w.charAt(0) + w.slice(1).toLowerCase() : String(n);
}
function buildColorSentence(colorWord, exampleWord) {
  return `The ${exampleWord.toLowerCase()} is ${colorWord.toLowerCase()}.`;
}
function buildShapeSentence(shapeWord, exampleWord) {
  return `The ${exampleWord.toLowerCase()} is a ${shapeWord.toLowerCase()}.`;
}
function buildToySentence(colorWord, toyWord, plural) {
  if (plural) return `They are ${colorWord.toLowerCase()} ${toyWord.toLowerCase()}.`;
  return `It's a ${colorWord.toLowerCase()} ${toyWord.toLowerCase()}.`;
}
const FRIEND_POP_GENDER = { bella: 'she', mia: 'she', willow: 'she', leo: 'he', pip: 'he' };
function friendPopEmotion(prompt, explicit) {
  if (explicit) return explicit;
  if (/(angry|grrr|mad)/i.test(prompt)) return 'angry';
  if (/sad/i.test(prompt)) return 'sad';
  if (/happy/i.test(prompt)) return 'happy';
  return 'neutral';
}
const castName = (who) => CAST[who]?.name ?? who;

/** Per-kind extractors for the unit1 (Pre-A1) engine, verified against the
 *  actual `safeSpeak`/`cueSpeak` call sites in unit1/SceneRenderer.tsx (not
 *  inferred from field names). Returns an array of [character, text] pairs
 *  for one scene instance. */
const UNIT1_EXTRACTORS = {
  cinematic: (s) => (s.script ?? []).map((l) => [l.who, l.line]),
  meet: (s) => {
    const out = [[s.who, s.line]];
    if (s.repeat) out.push([s.who, s.repeat]);
    return out;
  },
  'sound-model': (s) => (s.anchors ?? []).map((a) => [s.who, a.word]),
  echo: (s) => [[s.who, s.hearWord ?? s.word]],
  'sound-sort': (s) =>
    (s.items ?? []).map((it) => {
      const speaker = (s.targets ?? []).find((t) => t.letter === it.letter)?.who ?? 'pip';
      return [speaker, it.word];
    }),
  'word-build': (s) => (s.rounds ?? []).map((r) => ['pip', r.word]),
  gather: (s) => (s.hotspots ?? []).map((h) => [h.who, h.line]),
  memory: (s) => (s.pairs ?? []).map((p) => ['teacher', p.label]),
  dash: (s) => (s.items ?? []).map((it) => [s.who, it.word]),
  roleplay: (s) => (s.script ?? []).map((l) => [l.who, l.line]),
  'who-said-it': (s) => (s.rounds ?? []).map((r) => [r.who, r.line]),
  feelings: (s) => (s.options ?? []).map((o) => {
    const label = o.label.toLowerCase();
    const voice = label.includes('happy') ? 'mia' : label.includes('sad') ? 'bella' : 'pip';
    return [voice, o.reply];
  }),
  'color-friends': (s) => {
    const out = [];
    if (s.vocabItems?.length) {
      s.vocabItems.forEach((v, idx) => {
        if (idx > 0) out.push(['teacher', `${v.label}!`]);
        out.push(['pip', `Yes! The ${v.label.toLowerCase()} is ${v.targetColorName.toLowerCase()}!`]);
      });
    } else {
      (s.cast ?? []).forEach((who, idx) => { if (idx > 0) out.push([who, `${castName(who)}!`]); });
    }
    return out;
  },
  'name-gate': (s) => {
    const out = (s.rounds ?? []).flatMap((r) => [['teacher', r.question], [r.who, r.answer]]);
    if ((s.rounds ?? []).length) out.push(['pip', 'What is your name?']);
    return out;
  },
  'meet-group': (s) => [[s.askers?.[0]?.who ?? 'teacher', s.question], ['teacher', s.question], [s.newcomer.who, s.answer], ['teacher', s.answer]],
  'voice-stage': (s) => {
    const out = [['teacher', s.question]];
    for (const r of s.rounds ?? []) {
      out.push([r.who, r.answer]);
      out.push([r.who, 'Yes! My name!']);
      if (s.niceToMeet) out.push([r.who, 'Nice to meet you!']);
    }
    return out;
  },
  'sound-pop': (s) => [[s.who, 'Perfect ears! You popped the sounds!']],
  'trophy-chest': (s) => (s.rounds ?? []).flatMap((r) => [[s.who, `Find the ${r.letter} sound!`], [s.who, r.word]]),
  'friend-pop': (s) => (s.rounds ?? []).flatMap((r) => {
    const helloMode = !!r.sayLine && /hello|hi\b/i.test(r.sayLine);
    const pronounMode = !helloMode && /^\s*(he|she)\b/i.test(r.prompt);
    const roundEmo = friendPopEmotion(r.prompt, r.emotion);
    const line = helloMode
      ? (r.sayLine ?? `Hello, ${castName(r.target)}!`)
      : pronounMode
        ? `${FRIEND_POP_GENDER[r.target] === 'he' ? 'He' : 'She'} is ${roundEmo}!`
        : `${castName(r.target)} is ${roundEmo}!`;
    return [[r.target, r.prompt], [r.target, line]];
  }),
  'feelings-tap': (s) => (s.cast ?? []).map((c) => [c.who, c.label]),
  'feelings-wheel': (s) => (s.slots ?? []).map((sl) => [sl.who, sl.label]),
  'x-is-feeling': (s) => (s.rounds ?? []).map((r) => [r.who, r.sentence]),
  'he-she-model': (s) => (s.rounds ?? []).map((r) => [r.who, r.sentence]),
  'feed-monsters': (s) => (s.rounds ?? []).map((r) => [r.who, r.sentence]),
  'he-she-sort': (s) => (s.rounds ?? []).flatMap((r) => [[r.who, `I am ${r.emotion}.`], [r.who, `Yes! ${r.pronoun} is ${r.emotion}.`]]),
  'feeling-quiz': (s) => (s.rounds ?? []).flatMap((r) => [['teacher', r.prompt], [r.who, `${castName(r.who)} is ${r.emotion}!`]]),
  'feelings-dice': (s) => (s.rounds ?? []).map((r) => [r.who ?? 'teacher', r.sentence]),
  'he-she-say': (s) => (s.rounds ?? []).map((r) => [r.who ?? 'teacher', `${r.pronoun} is ${r.emotion}.`]),
  'i-am-feeling': (s) => {
    const out = (s.rounds ?? []).map((r) => ['teacher', `I am ${r.label.toLowerCase()}!`]);
    out.push([s.asker, 'How are you?']);
    return out;
  },
  'feelings-bingo': (s) => [
    ...(s.rounds ?? []).map((r) => ['teacher', r.prompt]),
    ...(s.tiles ?? []).map((t) => [t.who, `Yes! ${castName(t.who)} is ${t.emotion}!`]),
  ],
  'numbers-learn': (s) => { const out = []; for (let n = s.from; n <= s.to; n++) out.push([s.who, numberSpeech(n)]); return out; },
  'numbers-review': (s) => { const out = []; for (let n = s.from; n <= s.to; n++) out.push([s.who, numberSpeech(n)]); return out; },
  'count-balloons': (s) => { const out = []; for (let n = 1; n <= s.total; n++) out.push([s.who, numberSpeech(n)]); return out; },
  'candle-cake': (s) => (s.rounds ?? []).flatMap((r) => [[r.asker, r.prompt], [r.asker, r.celebrate]]),
  'age-balloons': (s) => (s.friends ?? []).map((f) => [f.who, `${castName(f.who)} is ${f.age}!`]),
  'age-sentence-match': (s) => (s.friends ?? []).map((f) => [f.who, `${castName(f.who)} is ${f.age}!`]),
  'meet-greet': (s) => (s.friends ?? []).flatMap((f) => [
    ['teacher', "What's your name?"],
    [f.who, `My name is ${castName(f.who)}.`],
    ['teacher', 'How old are you?'],
    [f.who, `I am ${f.age}.`],
    ['teacher', 'Nice to meet you!'],
  ]),
  'age-quiz': (s) => {
    const out = [['teacher', 'What is your age?']];
    for (const f of s.friends ?? []) {
      out.push(['teacher', `How old is ${castName(f.who)}? \u{1F382}`]);
      for (const age of s.studentAges ?? []) out.push([f.who, `${castName(f.who)} is ${age}!`]);
    }
    for (const age of s.studentAges ?? []) out.push(['teacher', `I am ${age}!`]);
    return out;
  },
  flipbook: (s) => (s.pages ?? []).map((p) => [p.who ?? 'teacher', p.text]),
  'color-model': (s) => {
    const out = (s.items ?? []).flatMap((it) => [
      [it.who, it.colorWord], [it.who, it.exampleWord], [it.who, buildColorSentence(it.colorWord, it.exampleWord)],
    ]);
    out.push(['pip', `Wonderful! ${(s.items ?? []).map((it) => buildColorSentence(it.colorWord, it.exampleWord)).join(' ')}`]);
    return out;
  },
  'color-sort': (s) => [
    ['teacher', 'Amazing! All colors sorted!'],
    ...(s.items ?? []).map((it) => [(s.targets ?? []).find((t) => t.colorWord === it.colorWord)?.who ?? 'pip', it.word]),
    ...(s.targets ?? []).map((t) => [t.who, t.colorWord]),
  ],
  'color-quiz': (s) => (s.rounds ?? []).flatMap((r) => [[r.who, `Which one is ${r.colorWord}?`], [r.who, `Yes! ${r.correctLabel} is ${r.colorWord}!`]]),
  'listen-repeat-cards': (s) => (s.cards ?? []).map((c) => [c.who, c.sentence]),
  'color-spot': (s) => (s.items ?? []).flatMap((it) => [[it.who, it.colorWord], [it.who, it.sentence]]),
  'shape-model': (s) => {
    const out = (s.items ?? []).flatMap((it) => [
      [it.who, it.shapeWord], [it.who, it.exampleWord], [it.who, buildShapeSentence(it.shapeWord, it.exampleWord)],
    ]);
    out.push(['pip', `Wonderful! ${(s.items ?? []).map((it) => buildShapeSentence(it.shapeWord, it.exampleWord)).join(' ')}`]);
    return out;
  },
  'toy-model': (s) => {
    const out = (s.items ?? []).flatMap((it) => [
      [it.who, it.toyWord], [it.who, buildToySentence(it.colorWord, it.toyWord, it.plural)],
    ]);
    out.push(['pip', `Wonderful! ${(s.items ?? []).map((it) => buildToySentence(it.colorWord, it.toyWord, it.plural)).join(' ')}`]);
    return out;
  },
  'plural-sort': (s) => [['teacher', 'Amazing! One or many, you know them all!'], ...(s.items ?? []).map((it) => [s.who, it.word])],
  'train-recall': (s) => [
    ...(s.cars ?? []).map((c) => ['pip', c.word]),
    ['pip', "Choo choo! One car is empty. Which toy is missing?"],
    ...(s.cars ?? []).map((c) => ['pip', `Yes! It's the ${c.word.toLowerCase()}!`]),
  ],
  'shape-sort': (s) => [
    ['teacher', 'Amazing! All shapes sorted!'],
    ...(s.items ?? []).map((it) => [(s.targets ?? []).find((t) => t.shapeWord === it.shapeWord)?.who ?? 'pip', it.word]),
    ...(s.targets ?? []).map((t) => [t.who, t.shapeWord]),
  ],
  'color-spy': (s) => [
    ...(s.clueOrder ?? []).map((clue) => [s.who, `I spy something ${clue.toLowerCase()}!`]),
    ...(s.spots ?? []).map((sp) => [s.who, `Yes! ${sp.label}!`]),
  ],
  'color-simon': (s) => (s.colors ?? []).map((c) => [c.who, c.colorWord]),
  'join-stage': (s) => (s.turns ?? []).filter((t) => t.who !== 'student').map((t) => [t.who, t.line]),
  'hello-doors': (s) => {
    const out = (s.cast ?? []).map((who) => [who, CAST[who]?.name ?? who]);
    for (const r of s.rounds ?? []) {
      out.push([r.target, r.prompt]);
      out.push([r.target, r.helloLine]);
      out.push([r.target, r.echoLine]);
    }
    return out;
  },
  'alphabet-blocks': (s) => (s.words ?? []).map((w) => ['pip', w.word]),
  finale: (s) => (s.line ? [[s.who, s.line]] : []),
  // Simplified to just the real word after both were fixed to route the
  // isolated letter/phoneme sound through the real phonics-master recording
  // (playLetterPhonic) instead of speaking "letter! phoneme word!" text to
  // ElevenLabs — see SceneRenderer.tsx. The word itself is still a live
  // ElevenLabs call and is safe to pre-generate.
  trace: (s) => (s.speakWord === false ? [] : [[s.who, s.word]]),
  // Three distinct call sites, not just the drop announcement: every item
  // (correct or not) gets a 'teacher' pickup announcement; only correct
  // (hit) items get a scene.who drop announcement, gated by
  // announceOnDrop; and a fixed "portal open" line fires once on goal.
  basket: (s) => {
    const out = (s.items ?? []).map((it) => ['teacher', it.word]);
    if (s.announceOnDrop !== false) for (const it of s.items ?? []) if (it.hit) out.push([s.who, it.word]);
    out.push([s.who, `Yes! The ${s.letter} portal is open!`]);
    return out;
  },
};

/** Per-kind extractors for the welcome-town (A1) engine and welcome-town-a2
 *  (A2, shares the same renderer/Scene type/CAST/VOICE_KEY — see this
 *  file's header). Verified against welcome-town/SceneRenderer.tsx's actual
 *  call sites. Character keys here are the story's CharKey (e.g.
 *  'marigold') and must be normalized through `voiceOf` before use — see
 *  `resolveWho` below. */
const WT_EXTRACTORS = {
  cinematic: (s) => (s.script ?? []).map((l) => [l.who, l.line]),
  meet: (s) => {
    const out = [[s.who, s.line]];
    if (s.repeat) out.push([s.who, s.repeat]);
    return out;
  },
  'vocab-spot': (s) => (s.items ?? []).flatMap((it) => [
    [it.who ?? 'teacher', it.label],
    [it.who ?? 'teacher', it.sentence],
  ]),
  echo: (s) => [[s.who, s.word]],
  memory: (s) => (s.pairs ?? []).map((p) => ['teacher', p.label]),
  'drag-match': (s) => (s.items ?? []).map((it) => [it.who ?? 'teacher', it.label]),
  roleplay: (s) => (s.script ?? []).map((l) => [l.who, l.line]),
  'join-stage': (s) => (s.turns ?? []).filter((t) => t.who !== 'student').map((t) => [t.who, t.line]),
  'hello-doors': (s) => {
    const out = (s.cast ?? []).map((who) => [who, CAST[who]?.name ?? who]);
    for (const r of s.rounds ?? []) {
      out.push([r.target, r.prompt]);
      out.push([r.target, r.helloLine]);
      out.push([r.target, r.echoLine]);
    }
    return out;
  },
  flipbook: (s) => (s.pages ?? []).map((p) => [p.who ?? 'teacher', p.text]),
  'sound-model': (s) => (s.anchors ?? []).map((a) => [s.who, a.word]),
  // Simplified the same way as unit1's trace — see UNIT1_EXTRACTORS comment.
  trace: (s) => [[s.who, s.word]],
  'word-build': (s) => (s.rounds ?? []).map((r) => ['pip', r.word]),
  finale: (s) => (s.line ? [[s.who, s.line]] : []),
  // The reveal line (r.line) is verbatim; the "How often do you {action}?"
  // prompt is a template, but s.rounds[].action is scene-authored (not
  // open-ended user input) and always spoken by a fixed 'teacher' voice, so
  // it's just as enumerable/safe as any other bounded template here.
  'frequency-ladder': (s) => (s.rounds ?? []).flatMap((r) => [['teacher', `How often do you ${r.action}?`], [s.who, r.line]]),
  // Only the CORRECT option's label ever reaches the "Yes! {label}!" line
  // (pick() returns early on a wrong tap before that call) — see ChoiceScene.
  choice: (s) => {
    const out = [[s.who, s.prompt]];
    for (const opt of s.options ?? []) if (opt.correct) out.push([s.who, `Yes! ${opt.label}!`]);
    return out;
  },
  // mode:'sound' rounds route through playLetterPhonic (a real recorded
  // file already, out of scope here); only mode:'letter' rounds speak the
  // template line via ElevenLabs. The "Great job!" line always does.
  'letter-game': (s) => (s.rounds ?? []).flatMap((r) => {
    const out = [];
    if (s.mode !== 'sound') out.push([s.who, `Find the letter ${r.letter}!`]);
    out.push([s.who, `${r.letter}! Great job!`]);
    return out;
  }),
};

/** unit1's CharKey IS the shared audio Character type already — no mapping
 *  needed. welcome-town's CharKey (adds 'marigold') maps through its own
 *  VOICE_KEY table to the same shared Character roles (voiceOf() in
 *  SceneRenderer.tsx does the same at runtime) — see scenes.ts for why this
 *  is a fixed, tiny table rather than something to infer. */
const ENGINES = [
  { scenesModule: unit1Scenes, extractors: UNIT1_EXTRACTORS, resolveWho: (who) => who },
  { scenesModule: wtScenes, extractors: WT_EXTRACTORS, resolveWho: (who) => wtScenes.VOICE_KEY[who] ?? who },
  { scenesModule: wtA2Scenes, extractors: WT_EXTRACTORS, resolveWho: (who) => wtScenes.VOICE_KEY[who] ?? who },
];

function collectPairs(lessonFilter) {
  const seen = new Map(); // cacheKey -> [character, text]
  const add = (character, text) => {
    if (!character || !text) return;
    if (!VOICE_ID[character]) { console.warn(`  ! unknown character "${character}", skipping: ${text}`); return; }
    seen.set(cacheKey(character, text), [character, text]);
  };

  for (const [character, text] of FIXED_LINES) add(character, text);

  for (const { scenesModule, extractors, resolveWho } of ENGINES) {
    const sceneArrayNames = Object.keys(scenesModule).filter((k) => /^LESSON_.*_SCENES$/.test(k));
    for (const name of sceneArrayNames) {
      if (lessonFilter && name !== lessonFilter) continue;
      const scenes = scenesModule[name];
      if (!Array.isArray(scenes)) continue;
      for (const scene of scenes) {
        const extractor = extractors[scene.kind];
        if (!extractor) continue;
        for (const [who, text] of extractor(scene)) add(resolveWho(who), text);
      }
    }
  }
  return [...seen.values()];
}

async function generateClip(character, text) {
  const voiceId = VOICE_ID[character];
  const ATTEMPTS = 3;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      if (attempt > 0) await sleep(500 * attempt);
      const res = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: 'POST',
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });
      if (!res.ok) throw new Error(`tts ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) throw new Error('empty response');
      return buf;
    } catch (err) {
      if (attempt === ATTEMPTS - 1) throw err;
    }
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const lessonArg = process.argv.find((a) => a.startsWith('--lesson='));
  const lessonFilter = lessonArg ? lessonArg.slice('--lesson='.length) : null;

  const pairs = collectPairs(lessonFilter);
  console.log(`${lessonFilter ? `Scoped to "${lessonFilter}"` : 'Full run'}: ${pairs.length} unique (character, text) pairs.`);

  if (process.argv.includes('--dry')) {
    for (const [character, text] of pairs) console.log(`  [${character}] "${text}"`);
    return;
  }

  let generated = 0, cached = 0, failed = 0, bytes = 0;
  for (const [character, text] of pairs) {
    const file = path.join(OUT_DIR, `${cacheFileName(character, text)}.mp3`);
    if (fs.existsSync(file)) { cached++; continue; }
    try {
      const buf = await generateClip(character, text);
      fs.writeFileSync(file, buf);
      bytes += buf.length;
      generated++;
      console.log(`  + [${character}] "${text}" -> ${path.basename(file)} (${buf.length}B)`);
      await sleep(200);
    } catch (err) {
      failed++;
      console.error(`  ! FAILED [${character}] "${text}": ${err.message}`);
    }
  }

  console.log(`\nDone. Generated ${generated}, already cached ${cached}, failed ${failed}. Wrote ${(bytes / 1024).toFixed(1)} KB.`);
  if (failed > 0) process.exitCode = 1;
}

main();
