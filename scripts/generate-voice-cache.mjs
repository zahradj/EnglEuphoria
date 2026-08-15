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
  basket: (s) => (s.announceOnDrop === false ? [] : (s.items ?? []).filter((it) => it.hit).map((it) => [s.who, it.word])),
  // The phoneme-sound line in both of these is now playLetterPhonic() (a
  // real recorded file, no ElevenLabs call at all) — only the fixed win
  // line (voice varies by scene.who) still needs pre-generating here.
  'sound-pop': (s) => [[s.who, 'Perfect ears! You popped the sounds!']],
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
  // frequency-ladder's per-round reveal line (r.line) is verbatim; the
  // "How often do you {action}?" prompt is a template and stays live.
  'frequency-ladder': (s) => (s.rounds ?? []).map((r) => [s.who, r.line]),
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
