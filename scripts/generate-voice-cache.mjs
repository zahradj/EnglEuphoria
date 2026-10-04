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
import * as magicCastleScenes from '../src/content/playground-library/magic-castle/scenes.ts';
import { homeworkA1U9L1Lines } from '../src/content/playground-library/magic-castle/homework.ts';
import { allQuestLines } from '../src/content/homework-quests/registry.ts';
import { placementLines } from '../src/components/placement/placementLines.ts';

// The kids' picture placement defaults live in a module that imports the browser Supabase client; load it
// defensively so a Node-side import problem can never stop the rest of the placement lines from baking.
let KIDS_PLACEMENT_DEFAULTS = null;
try {
  ({ DEFAULT_PLAYGROUND_CONTENT: KIDS_PLACEMENT_DEFAULTS } = await import('../src/placement/hubContent.ts'));
} catch (e) {
  console.warn(`  ! kids placement defaults not loaded (${e.message}); only the question-bank placement lines will be baked.`);
}
import { spokenText } from '../src/content/playground-library/unit1/spokenText.ts';
import { LIBRARY_GAMES } from '../src/content/playground-library/gamesCatalog.ts';
import { artFor } from '../src/content/playground-library/alphabetArt.ts';
import { VOICE_PROFILES, approvedVoiceId, isShortLine, normalizeForSpeech, SHORT_LINE_CLIP_VERSION, unresolvedSpeechRisks, voiceStatus } from '../src/lib/speechPolicy.ts';

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
  mia: 'cgSgspJ2msm6clMCkdW9', // Jessica (American) — was Lily (British)
  bella: 'XrExE9yKIg1WjnnlVkGX',
  willow: 'piTKgcLEGmPE4e6mEKli',
  leo: 'TX3LPaxmHKxFdv7VOQHJ', // Liam (American) — was Mimi (Swedish)
  teacher: 'jsCqWAovK2LkecY7zXl4',
  narrator: 'jsCqWAovK2LkecY7zXl4',
};

// Mirrors unit1/audio.ts's key() + CHARACTER_CLIP_VERSION.
const KEY_VERSION = 'v11';
const CHARACTER_CLIP_VERSION = { mia: 'v12', leo: 'v12' };
function cacheKey(character, text) {
  // Mirrors audio.ts key(): short lines are recorded English-locked (v13s).
  if (isShortLine(text)) return `${character}::${SHORT_LINE_CLIP_VERSION}::${text}`;
  return `${character}::${CHARACTER_CLIP_VERSION[character] ?? KEY_VERSION}::${text}`;
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
  // Mirrors ColorModelScene.tsx: plural nouns take "are".
  const w = exampleWord.toLowerCase();
  return `The ${w} ${/[^s]s$/.test(w) ? 'are' : 'is'} ${colorWord.toLowerCase()}.`;
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
  'trophy-chest': (s) => [[s.who, 'Find this sound!'], ...(s.rounds ?? []).map((r) => [s.who, r.word])],
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
  flipbook: (s) => [
    ...(s.pages ?? []).map((p) => [p.who ?? 'teacher', p.text]),
    ...(s.checkpoints ?? []).map((c) => [c.who ?? 'teacher', c.question]),
  ],
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
  'color-quiz': (s) => (s.rounds ?? []).flatMap((r) => [[r.who, `Which one is ${r.colorWord}?`], [r.who, `Yes! The ${r.correctLabel.toLowerCase()} ${/[^s]s$/.test(r.correctLabel.toLowerCase()) ? 'are' : 'is'} ${r.colorWord.toLowerCase()}!`]]),
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
  // Mirrors PluralSortScene.tsx (pluralLine for every correct drop).
  'plural-sort': (s) => [[s.who, 'Amazing! One or many, you know them all!'], [s.who, 'It is'], [s.who, 'They are'], ...(s.items ?? []).flatMap((it) => [
    [s.who, it.word],
    [s.who, it.plural ? `They are ${it.word}!` : `It's ${/^[aeiou]/i.test(it.word) ? 'an' : 'a'} ${it.word}!`],
  ])],
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
    ...(s.clueOrder ?? []).map((clue) => [s.who, s.article ? `I spy a ${clue.toLowerCase()}!` : `I spy something ${clue.toLowerCase()}!`]),
    ...(s.spots ?? []).map((sp) => [s.who, `Yes! ${sp.label}!`]),
  ],
  'color-simon': (s) => (s.colors ?? []).map((c) => [c.who, c.colorWord]),
  // WordPictureMatchScene.tsx: says the word, then "Yes! <word>!" (had no extractor).
  'word-picture-match': (s) => (s.rounds ?? []).flatMap((r) => [[r.who ?? 'pip', r.word], [r.who ?? 'pip', `Yes! ${r.word}!`]]),
  // Mirror ListenColourScene / ShapeFishingScene / PatternTrainScene line helpers.
  'listen-colour': (s) => (s.rounds ?? []).flatMap((r) => {
    const it = (s.items ?? []).find((i) => i.id === r.item);
    return it ? [[s.who, `Color the ${it.size} ${it.shape} ${r.colorWord.toLowerCase()}!`], [s.who, `Yes! The ${it.size} ${it.shape} is ${r.colorWord.toLowerCase()}!`]] : [];
  }),
  'shape-fishing': (s) => (s.targets ?? []).map((i) => s.fish?.[i]).filter(Boolean).flatMap((f) => [
    [s.who, `Catch a ${f.colorWord.toLowerCase()} ${f.shape}!`], [s.who, `You caught a ${f.colorWord.toLowerCase()} ${f.shape}!`],
  ]),
  'pattern-train': (s) => [
    [s.who, 'What comes next?'],
    ...(s.rounds ?? []).map((r) => { const c = r.answer.word ? r.answer.word.toLowerCase() : `${r.answer.colorWord.toLowerCase()} ${r.answer.shape}`; return [s.who, `Yes! ${/^[aeiou]/.test(c) ? 'An' : 'A'} ${c}!`]; }),
  ],
  'tick-cross': (s) => [[s.who, "That's right!"], ...(s.rounds ?? []).map((r) => [s.who, r.sentence])],
  'story-video': (s) => [
    ...(s.pages ?? []).map((p) => [p.who, p.line]),
    ...(s.checkpoints ?? []).flatMap((c) => [[c.who, c.question], [c.who, `Yes! ${c.answer}!`]]),
  ],
  'story-order': (s) => (s.frames ?? []).map((f) => [f.who ?? s.who, f.caption]),
  // Mirror TprActionsScene / RapidRecallScene / StickerRewardScene / HomeMissionScene line helpers.
  'tpr-actions': (s) => (s.rounds ?? []).map((r) => [s.who, r.line]),
  'rapid-recall': (s) => (s.cards ?? []).map((c) => [s.who, c.say ?? c.word]),
  'sticker-reward': (s) => [[s.who, 'You earned a sticker!'], [s.who, s.line]],
  'home-mission': (s) => [[s.who, s.line], [s.who, 'Mission accepted!']],
  // Mirrors LiftFlapScene.tsx's liftFlapLines().
  'lift-flap': (s) => [[s.who, s.question], [s.who, s.notYet], ...(s.spots ?? []).flatMap((p) => [[s.who, p.ask], [s.who, p.reveal]])],
  // Mirrors DrawPathScene.tsx's drawPathLines().
  'draw-path': (s) => [...(s.rounds ?? []).flatMap((r) => [[s.who, r.line], [s.who, r.reply]]), [s.who, `Start at ${({ pip: 'Pip', mia: 'Mia', bella: 'Bella', willow: 'Willow', leo: 'Leo' })[s.walker] ?? s.walker}!`]],
  // Mirrors TileRevealScene.tsx's tileRevealLines().
  'tile-reveal': (s) => [[s.who, 'What is it?'], ...(s.rounds ?? []).map((r) => [s.who, r.line])],
  // Mirrors ShadowMatchScene.tsx's shadowMatchLines().
  'shadow-match': (s) => [[s.who, 'Find the shadow!'], ...(s.items ?? []).map((it) => [s.who, it.line])],
  // Mirrors SteppingStonesScene.tsx's steppingStonesLines().
  'stepping-stones': (s) => [...(s.rounds ?? []).flatMap((r) => [[s.who, r.line], [s.who, r.reply]]), [s.who, s.goal?.line]],
  // Mirrors MysteryBagScene.tsx's mysteryBagLines().
  'mystery-bag': (s) => {
    const art = (w) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
    return [[s.who, "What's in the bag?"], ...(s.rounds ?? []).flatMap((r) => [
      [s.who, `It's ${art(r.toyWord)} ${r.toyWord.toLowerCase()}!`],
      [s.who, `It's ${art(r.colorWord)} ${r.colorWord.toLowerCase()} ${r.toyWord.toLowerCase()}!`],
    ])];
  },
  // Mirrors OddOneOutScene.tsx's oddOneOutLines().
  'odd-one-out': (s) => [[s.who, 'Which one is different?'], ...(s.rounds ?? []).map((r) => [s.who, r.line])],
  // Mirrors ShapeTorchScene.tsx's shapeTorchLines() (find / found / "That's a … ." for every gem).
  'shape-torch': (s) => {
    const art = (w) => (/^[aeiou]/i.test(w) ? 'an' : 'a');
    const t = (s.targets ?? []).map((i) => s.gems?.[i]).filter(Boolean).flatMap((g) => [
      [s.who, `Find ${art(g.colorWord)} ${g.colorWord.toLowerCase()} ${g.shape}!`],
      [s.who, `Yes! ${art(g.colorWord) === 'an' ? 'An' : 'A'} ${g.colorWord.toLowerCase()} ${g.shape}!`],
    ]);
    return [...t, ...(s.gems ?? []).map((g) => [s.who, `That's ${art(g.colorWord)} ${g.colorWord.toLowerCase()} ${g.shape}.`])];
  },
  // Mirrors SecretCardScene.tsx's secretCardLines().
  'secret-card': (s) => [
    [s.who, 'I have a secret card. Ask me!'], [s.who, 'Yes, it is!'], [s.who, "No, it isn't!"],
    ...(s.rounds ?? []).map((r) => s.cards?.[r.secret]).filter(Boolean).map((c) => {
      const parts = c.word ? [c.size, c.colorWord.toLowerCase(), c.word.toLowerCase()].filter(Boolean).join(' ') : `${c.colorWord.toLowerCase()} ${c.shape}`;
      return [s.who, `You found it! It's ${/^[aeiou]/i.test(parts) ? 'an' : 'a'} ${parts}!`];
    }),
  ],
  // Mirrors ShapeBuilderScene.tsx's shapeBuilderLines().
  'shape-builder': (s) => [
    [s.who, 'What shape is it?'],
    ...(s.rounds ?? []).flatMap((r) => [
      [r.who, r.intro],
      [r.who, r.line],
      ...(r.pieces ?? []).flatMap((p) => [[s.who, `It's a ${p.shape}!`], [s.who, `${/^[aeiou]/i.test(p.colorWord) ? 'An' : 'A'} ${p.colorWord.toLowerCase()} ${p.shape}!`]]),
    ]),
  ],
  // Mirrors ColorMixScene.tsx's colorMixLines().
  'color-mix': (s) => [
    [s.who, 'What color is it?'],
    ...(s.rounds ?? []).flatMap((r) => [
      [s.who, `Mix ${r.a.toLowerCase()} and ${r.b.toLowerCase()}!`],
      [s.who, `It's ${r.result.toLowerCase()}!`],
      [r.who, r.line],
    ]),
  ],
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
    out.push([s.who, 'Yes! The portal is open!']);
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
  // Mirrors WelcomePartyScene.tsx's welcomePartyLines().
  'welcome-party': (s) => (s.rounds ?? []).flatMap((r) => [
    [r.guest, r.knock],
    [r.guest, r.reply],
    ...(r.options ?? []).filter((o) => o.correct).map((o) => [s.host, o.line]),
    ...(r.mode === 'greet' ? [[s.host, `Welcome, ${wtScenes.CAST[r.guest]?.name ?? r.guest}!`]] : []),
  ]),
  // Mirrors NameBadgeScene.tsx's nameBadgeLines(); letters are recorded clips.
  'name-badge': (s) => [
    ...(s.rounds ?? []).map((r) => [s.who, `How do you spell ${r.name}?`]),
    [s.who, 'Now make your name badge!'],
    [s.who, 'Great! Now say: My name is…'],
  ],
  flipbook: (s) => (s.pages ?? []).map((p) => [p.who ?? 'teacher', p.text]),
  'sound-model': (s) => (s.anchors ?? []).map((a) => [s.who, a.word]),
  // Simplified the same way as unit1's trace — see UNIT1_EXTRACTORS comment.
  trace: (s) => [[s.who, s.word]],
  'word-build': (s) => (s.rounds ?? []).map((r) => ['pip', r.word]),
  finale: (s) => (s.line ? [[s.who, s.line]] : []),
  'tongue-twister': (s) => [[s.who, s.line]],
  // Verified against welcome-town/SceneRenderer.tsx call sites.
  'listen-tap': (s) => (s.rounds ?? []).flatMap((r) => [[r.who ?? 'marigold', r.prompt], [r.who ?? 'marigold', `Yes! ${r.answerLabel}!`]]),
  'true-false': (s) => (s.rounds ?? []).map((r) => [r.who, r.statement]),
  'spin-wheel': (s) => (s.items ?? []).map((it) => ['teacher', it.label]),
  'picture-match': (s) => (s.items ?? []).map((it) => ['teacher', it.word]),
  // welcome-town/WhereGames.tsx — every line those games can say.
  'place-it': (s) => s.mode === 'learn'
    ? (s.spots ?? []).map((sp) => [s.who, s.learnLines?.[sp.prep] ?? `The ${s.item.label} is ${sp.prep} the ${s.anchor.label}.`])
    : (s.rounds ?? []).flatMap((r) => [[s.who, r.line], [s.who, r.answer ?? `Yes! The ${s.item.label} is ${r.prep} the ${s.anchor.label}.`]]),
  'where-castle': (s) => (s.rounds ?? []).flatMap((r) => [[s.asker, `Where is the ${r.item}?`], [s.answerer, `It’s in the ${r.room}.`]]),
  'torch-hunt': (s) => [[s.who, s.ask ?? 'Where is the lamp? Find it with your torch!'], ...(s.rounds ?? []).flatMap((r) => [[s.who, r.question ?? 'Where is the lamp?'], [s.who, r.answer]])],
  // The reveal line (r.line) is verbatim; the "How often do you {action}?"
  // prompt is a template, but s.rounds[].action is scene-authored (not
  // open-ended user input) and always spoken by a fixed 'teacher' voice, so
  // it's just as enumerable/safe as any other bounded template here.
  'frequency-ladder': (s) => (s.rounds ?? []).flatMap((r) => [['teacher', `How often do you ${r.action}?`], [s.who, r.line]]),
  // Mirrors PronounSortScene's derivation exactly: speaker is the pair's
  // first character for a "they" round; "I am {emotion}." vs "We are
  // {emotion}." and the is/are agreement on the confirmation line both
  // depend on whether `who` is a single character or a pair.
  'pronoun-sort': (s) => (s.rounds ?? []).flatMap((r) => {
    const isPair = Array.isArray(r.who);
    const speaker = isPair ? r.who[0] : r.who;
    const sayLine = isPair ? `We are ${r.emotion}.` : `I am ${r.emotion}.`;
    const verb = r.answer === 'They' ? 'are' : 'is';
    return [[speaker, sayLine], [speaker, `Yes! ${r.answer} ${verb} ${r.emotion}!`]];
  }),
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
    out.push([s.who, 'Great job!']);
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
  // Magic Castle (A1 Unit 9) plays through welcome-town's renderer too.
  { scenesModule: magicCastleScenes, extractors: WT_EXTRACTORS, resolveWho: (who) => wtScenes.VOICE_KEY[who] ?? who },
];

/** Homework games: every line they can say, already as (voice, text). */
const HOMEWORK_LINES = [...homeworkA1U9L1Lines(), ...allQuestLines()];

/** Playground GAMES (Alphabet Express, Magic Show…): every picture-word the games say, always by the 'teacher'
 *  voice (scenes call safeSpeak(word, 'teacher')). Mirrors FirstSoundScene / WhatsMissingScene / LetterTilesScene. */
function gameLines() {
  const words = new Set();
  for (const game of LIBRARY_GAMES) {
    for (const stage of game.stages) {
      const scene = stage.scene;
      if (scene.kind === 'first-sound') scene.rounds.forEach((r) => words.add(r.word));
      if (scene.kind === 'whats-missing') scene.rounds.forEach((r) => r.items.forEach((i) => words.add(i.word)));
      if (scene.kind === 'grammar-gap') {
        (scene.examples || []).forEach((e) => words.add(e));
        scene.rounds.forEach((r) => words.add([r.before, r.answer, r.after].map((p) => (p || '').trim()).filter(Boolean).join(' ')));
      }
      if (scene.kind === 'sort-basket') { scene.baskets.forEach((b) => words.add(b.label)); scene.items.forEach((i) => words.add(i.word)); }
      if (scene.kind === 'letter-blocks') scene.rounds.forEach((r) => {
        if (r.word) words.add(r.word);
        else r.blocks.forEach((b) => { const art = artFor(b); if (art) words.add(art.word); });
      });
    }
  }
  return [...words].map((w) => ['teacher', w]);
}

function collectPairs(lessonFilter) {
  const seen = new Map(); // cacheKey -> [character, text]
  const add = (character, raw) => {
    // Same text the app sends (spokenText.ts), so both land on one clip file.
    const text = raw ? spokenText(raw) : '';
    if (!character || !text) return;
    if (!VOICE_ID[character]) { console.warn(`  ! unknown character "${character}", skipping: ${text}`); return; }
    seen.set(cacheKey(character, text), [character, text]);
  };

  for (const [character, text] of FIXED_LINES) add(character, text);
  if (!lessonFilter || lessonFilter === 'HOMEWORK') for (const [character, text] of HOMEWORK_LINES) add(character, text);
  if (!lessonFilter || lessonFilter === 'GAMES') for (const [character, text] of gameLines()) add(character, text);
  // Placement tests play these saved files and never generate speech live (see placementAudio.ts).
  if (!lessonFilter || lessonFilter === 'PLACEMENT') for (const [character, text] of placementLines(KIDS_PLACEMENT_DEFAULTS)) add(character, text);

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
        // Speech policy: the CLEANED text, in an APPROVED (no-accent) voice. The clip filename still derives from the original text.
        body: JSON.stringify({ text: normalizeForSpeech(text), voiceId: approvedVoiceId(voiceId) }),
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

/** Quality audit ("Voice" engine): no accent, accurate pronunciation. Exit code 1 = something to fix. */
function audit(pairs) {
  let problems = 0;
  console.log('\n=== VOICE AUDIT ===\n');
  console.log('Characters -> voice -> accent status');
  for (const [character, id] of Object.entries(VOICE_ID)) {
    const profile = VOICE_PROFILES.find((v) => v.id === id);
    const status = voiceStatus(id);
    const mark = status === 'approved' ? 'OK ' : 'BAD';
    if (status !== 'approved') problems++;
    console.log(`  ${mark} ${character.padEnd(9)} ${profile ? profile.name : id}  (${profile ? profile.accent : 'unknown'}, ${status})`);
  }
  const perChar = {};
  let baked = 0, missing = 0;
  for (const [character, text] of pairs) {
    perChar[character] = (perChar[character] || 0) + 1;
    if (fs.existsSync(path.join(OUT_DIR, `${cacheFileName(character, text)}.mp3`))) baked++; else missing++;
  }
  console.log(`\nLines: ${pairs.length}  (baked ${baked}, still to bake ${missing})`);
  console.log('  per character:', Object.entries(perChar).map(([c, n]) => `${c} ${n}`).join(', '));
  const risky = [];
  for (const [character, text] of pairs) {
    const risks = unresolvedSpeechRisks(text);
    if (risks.length) risky.push({ character, text, risks });
  }
  console.log(`\nPronunciation risks that cleanup cannot fix (a human must reword, or the sound must be a recorded file): ${risky.length}`);
  for (const r of risky.slice(0, 60)) console.log(`  [${r.character}] "${r.text}"  ->  ${r.risks.map((x) => `${x.code}:${x.match}`).join(', ')}`);
  if (risky.length > 60) console.log(`  ... and ${risky.length - 60} more`);
  problems += risky.length;
  const changed = pairs.filter(([, t]) => normalizeForSpeech(t) !== t).length;
  console.log(`\nLines whose spoken text is cleaned up before synthesis (numbers, caps, abbreviations, hyphens...): ${changed}`);
  console.log(problems ? `\n${problems} problem(s) found.` : '\nAll clear.');
  return problems ? 1 : 0;
}

async function main() {
  const lessonArg = process.argv.find((a) => a.startsWith('--lesson='));
  const lessonFilter = lessonArg ? lessonArg.slice('--lesson='.length) : null;

  const pairs = collectPairs(lessonFilter);
  console.log(`${lessonFilter ? `Scoped to "${lessonFilter}"` : 'Full run'}: ${pairs.length} unique (character, text) pairs.`);

  if (process.argv.includes('--audit')) {
    process.exitCode = audit(pairs);
    return;
  }

  // --manifest=<file>: write every (voice, text, clip file) as JSON — used
  // by scripts/voice-audit.mjs to transcribe the clips and compare them
  // with the text they were meant to say.
  const manifestArg = process.argv.find((a) => a.startsWith('--manifest='));
  if (manifestArg) {
    const out = pairs.map(([character, text]) => {
      const file = `${cacheFileName(character, text)}.mp3`;
      return { character, text, synth: normalizeForSpeech(text), file, exists: fs.existsSync(path.join(OUT_DIR, file)) };
    });
    fs.writeFileSync(manifestArg.slice('--manifest='.length), JSON.stringify(out, null, 2));
    console.log(`Wrote manifest of ${out.length} clips (${out.filter((c) => c.exists).length} on disk).`);
    return;
  }

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
