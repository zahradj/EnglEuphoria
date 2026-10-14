#!/usr/bin/env node
/**
 * Bakes the Academy cast's recorded voice clips (public/academy-audio/<fnv1a(who::text)>.mp3 + manifest.json "who::text" -> file)
 * for every line in scripts/academy-voice-lines.json that has no clip yet, through the elevenlabs-tts edge function
 * (same call as scripts/generate-voice-cache.mjs generateClip). Voices: src/academy-deck/voices.ts (approved American voices only).
 *
 *   node scripts/bake-academy-voice.mjs --audit   # counts, estimated cost, speech risks; no API call, no key needed
 *   BAKE_SERVICE_KEY=... npx tsx scripts/bake-academy-voice.mjs   # record the missing clips (key is only sent to our own function, never printed)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACADEMY_VOICES } from '../src/academy-deck/voices.ts';
import { speechText } from '../src/academy-deck/spoken.ts';
import { approvedVoiceId, normalizeForSpeech, safeVoiceSettings, languageLock, DEFAULT_TTS_MODEL, unresolvedSpeechRisks, voiceStatus } from '../src/lib/speechPolicy.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const LINES = path.join(here, 'academy-voice-lines.json');
const OUT_DIR = path.join(here, '..', 'public', 'academy-audio');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');
const SUPABASE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co';
// public anon key of the project (same as scripts/generate-voice-cache.mjs); the secret is BAKE_SERVICE_KEY
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s';

// FNV-1a, same function as generate-voice-cache.mjs
function fnv1a(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
const keyOf = (l) => `${l.who}::${l.text}`;
const fileOf = (l) => `${fnv1a(keyOf(l))}.mp3`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const lines = JSON.parse(fs.readFileSync(LINES, 'utf8'));
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
const have = (l) => fs.existsSync(path.join(OUT_DIR, fileOf(l)));
const todo = lines.filter((l) => !have(l));

function audit() {
  let problems = 0;
  console.log('\n=== ACADEMY VOICE AUDIT ===\n');
  for (const [who, id] of Object.entries(ACADEMY_VOICES)) {
    const st = voiceStatus(id);
    if (st !== 'approved') problems++;
    console.log(`  ${st === 'approved' ? 'OK ' : 'BAD'} ${who.padEnd(5)} ${id} (${st})`);
  }
  const names = new Set(lines.map(fileOf));
  if (names.size !== lines.length) { problems++; console.log('  BAD filename collision between two lines'); }
  const per = {};
  for (const l of lines) {
    per[l.who] = per[l.who] || { n: 0, chars: 0 };
    per[l.who].n++;
    per[l.who].chars += normalizeForSpeech(speechText(l.text)).length;
  }
  console.log(`\nLines: ${lines.length}  (baked ${lines.length - todo.length}, still to bake ${todo.length})`);
  for (const [w, v] of Object.entries(per)) console.log(`  ${w.padEnd(5)} ${String(v.n).padStart(3)} lines  ${String(v.chars).padStart(5)} characters`);
  const total = Object.values(per).reduce((a, v) => a + v.chars, 0);
  const left = todo.reduce((a, l) => a + normalizeForSpeech(speechText(l.text)).length, 0);
  console.log(`\nCharacters: ${total} total, ${left} still to bake (ElevenLabs bills 1 credit per character; about $${((left / 1000) * 0.3).toFixed(2)} at $0.30 per 1,000 characters).`);
  const risky = lines.map((l) => ({ l, r: unresolvedSpeechRisks(speechText(l.text)) })).filter((x) => x.r.length);
  console.log(`\nPronunciation risks that cleanup cannot fix: ${risky.length}`);
  for (const x of risky) console.log(`  [${x.l.who}] "${x.l.text}" -> ${x.r.map((y) => `${y.code}:${y.match}`).join(', ')}`);
  problems += risky.length;
  const changed = lines.filter((l) => normalizeForSpeech(l.text) !== l.text).length;
  console.log(`Lines cleaned up before synthesis (numbers, caps, hyphens...): ${changed}`);
  console.log(problems ? `\n${problems} problem(s) found.` : '\nAll clear.');
  return problems ? 1 : 0;
}

async function generateClip(l) {
  const key = process.env.BAKE_SERVICE_KEY;
  if (!key) throw new Error('Set BAKE_SERVICE_KEY (Supabase service_role key) to record clips');
  const voiceId = approvedVoiceId(ACADEMY_VOICES[l.who]);
  const settings = safeVoiceSettings({ stability: 0.6, similarity_boost: 0.8, style: 0.2 });
  void settings; // the elevenlabs-tts function applies safeVoiceSettings server-side; kept here so the policy helpers are the only path
  void languageLock(DEFAULT_TTS_MODEL);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt) await sleep(500 * attempt);
      const res = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: 'POST',
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: normalizeForSpeech(speechText(l.text)), voiceId }),
      });
      if (!res.ok) throw new Error(`tts ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) throw new Error('empty response');
      return buf;
    } catch (e) {
      if (attempt === 2) throw e;
    }
  }
}

if (process.argv.includes('--audit')) process.exit(audit());

if (audit() !== 0) {
  console.error('\nFix the problems above before baking.');
  process.exit(1);
}
fs.mkdirSync(OUT_DIR, { recursive: true });
let made = 0;
let failed = 0;
for (const l of lines) {
  if (have(l)) { manifest[keyOf(l)] = fileOf(l); continue; }
  try {
    fs.writeFileSync(path.join(OUT_DIR, fileOf(l)), await generateClip(l));
    manifest[keyOf(l)] = fileOf(l);
    made++;
    console.log(`  + ${l.who}: ${l.text}`);
  } catch (e) {
    failed++;
    console.error(`  ! ${l.who}: ${l.text} (${e.message})`);
  }
}
fs.writeFileSync(MANIFEST, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n');
console.log(`\nRecorded ${made} new clip(s), ${failed} failed. Manifest: ${Object.keys(manifest).length} lines.`);
process.exit(failed ? 1 : 0);
