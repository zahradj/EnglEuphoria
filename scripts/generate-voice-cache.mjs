#!/usr/bin/env node
/**
 * Pre-generates static voice clips for lesson dialogue that is spoken
 * VERBATIM from scene data (no runtime template/derivation), so the app
 * stops depending on a live ElevenLabs call for that dialogue at play-time.
 * See the plan this implements: fuzzy-hugging-rossum.md.
 *
 * Usage:
 *   npx tsx scripts/generate-voice-cache.mjs --lesson=LESSON_1_SCENES   # pilot: one lesson
 *   npx tsx scripts/generate-voice-cache.mjs                            # full run, all lessons
 *
 * `--lesson=<EXPORT_NAME>` limits generation to one lesson's exported scene
 * array (e.g. `LESSON_1_SCENES`). Scene `id`s in this codebase do NOT
 * follow a consistent per-lesson prefix/suffix (Lesson 1 alone has
 * "meet-pip", "hello-doors-l1", "l1-color-friends" side by side), so the
 * export name — not the scene id — is the only reliable way to scope a run
 * to one lesson. Omit the flag to cover every scene in every
 * LESSON_*_SCENES export.
 *
 * Only the scene kinds listed in EXTRACTORS below are covered — these are
 * the kinds confirmed (by reading the actual SceneRenderer.tsx call sites,
 * not guessed from field names) to speak a scene-data field as-is. Kinds
 * that build their spoken text from a template or helper function at
 * render time (trace, basket, color/shape/toy-model sentence-builders,
 * numbers/phoneme derivations, quiz result lines, etc.) are deliberately
 * NOT covered here — pre-generating those safely needs that derivation
 * logic extracted into a shared module first (tracked as a follow-up), so
 * a pre-baked clip can never silently drift from what the renderer actually
 * says. Anything not covered here keeps using the existing live-generation
 * + IndexedDB fallback in unit1/audio.ts, unchanged.
 *
 * Currently wired for the unit1 (Pre-A1) engine only, matching the pilot's
 * scope. welcome-town / welcome-town-a2's own scene kinds (vocab-spot,
 * drag-match, choice, frequency-ladder, letter-game, ...) need the same
 * read-the-actual-renderer verification before being added here — see
 * task "Run full voice-cache generation across all lessons".
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as unit1Scenes from '../src/content/playground-library/unit1/scenes.ts';

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

/** Literal strings baked directly into SceneRenderer.tsx (not scene data),
 *  reused across many scenes — safe to pre-generate once regardless of
 *  which lesson triggers the run. */
const FIXED_LINES = [
  ['pip', 'Awesome voice! Great job!'],
  ['pip', 'Amazing! Great voice!'],
  ['teacher', 'Amazing! All sounds sorted!'],
];

const CAST = unit1Scenes.CAST;

/** Per-kind extractors, verified against the actual `safeSpeak`/`cueSpeak`
 *  call sites in unit1/SceneRenderer.tsx (not inferred from field names).
 *  Returns an array of [character, text] pairs for one scene instance. */
const EXTRACTORS = {
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
};

function collectPairs(lessonFilter) {
  const seen = new Map(); // cacheKey -> [character, text]
  const add = (character, text) => {
    if (!character || !text) return;
    if (!VOICE_ID[character]) { console.warn(`  ! unknown character "${character}", skipping: ${text}`); return; }
    seen.set(cacheKey(character, text), [character, text]);
  };

  for (const [character, text] of FIXED_LINES) add(character, text);

  const sceneArrayNames = Object.keys(unit1Scenes).filter((k) => /^LESSON_.*_SCENES$/.test(k));
  for (const name of sceneArrayNames) {
    if (lessonFilter && name !== lessonFilter) continue;
    const scenes = unit1Scenes[name];
    if (!Array.isArray(scenes)) continue;
    for (const scene of scenes) {
      const extractor = EXTRACTORS[scene.kind];
      if (!extractor) continue;
      for (const [character, text] of extractor(scene)) add(character, text);
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
