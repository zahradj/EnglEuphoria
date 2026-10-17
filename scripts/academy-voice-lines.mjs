#!/usr/bin/env node
/**
 * Academy voice lines: walks the deck scripts and writes every line a cast member SAYS to scripts/academy-voice-lines.json
 * ([{ who, text }], deduped by who+text). Nothing is invented: the lines come from src/academy-deck/spoken.ts, which reads the slide data.
 * Lines with a variable ({name}) or a blank (___) cannot be pre-recorded and are left out (listed in "skipped").
 *
 *   npx tsx scripts/academy-voice-lines.mjs
 *
 * Voices: src/academy-deck/voices.ts (interim until the owner designs teen voices). Bake: node scripts/bake-academy-voice.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACADEMY_VOICES } from '../src/academy-deck/voices.ts';
import { scriptIds, loadScript } from '../src/academy-player-v2/lessonScripts.ts';
import { spokenLines } from '../src/academy-player-v2/engine/spokenLines.ts';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'academy-voice-lines.json');

// Lines come from the player v2 scenes (each scene module's spoken()), for every lesson registered in src/academy-player-v2/lessonScripts.ts.
const ids = scriptIds();
if (ids.length === 0) {
  console.log('No lessons registered: keeping the existing', OUT);
  process.exit(0);
}
const seen = new Map();
for (const id of ids) {
  for (const l of spokenLines(await loadScript(id))) {
    if (!ACADEMY_VOICES[l.who]) throw new Error(`No voice for ${l.who} (src/academy-deck/voices.ts)`);
    seen.set(`${l.who}::${l.text}`, { who: l.who, text: l.text });
  }
}
// keep the clips already baked (lines of other lessons) and add the new ones
let old = [];
try { old = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { /* first run */ }
for (const l of old) { const k = `${l.who}::${l.text}`; if (!seen.has(k)) seen.set(k, l); }
const lines = [...seen.values()];
fs.writeFileSync(OUT, JSON.stringify(lines, null, 2) + '\n');
const per = {};
for (const l of lines) per[l.who] = (per[l.who] || 0) + 1;
console.log(`${lines.length} lines -> ${path.relative(process.cwd(), OUT)}  (${Object.entries(per).map(([w, n]) => `${w} ${n}`).join(', ')})`);
