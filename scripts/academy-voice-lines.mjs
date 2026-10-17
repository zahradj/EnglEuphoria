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
import { slideLines, ALPHABET } from '../src/academy-deck/spoken.ts';
import { ACADEMY_VOICES } from '../src/academy-deck/voices.ts';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'academy-voice-lines.json');

// All lessons were removed on 2026-10-17 for the player v2 rebuild (docs/academy-player-v2-plan.md). Register each rebuilt lesson's script here.
// While the list is empty the script leaves scripts/academy-voice-lines.json (the clips already baked) untouched.
const decks = [];

if (decks.length === 0) {
  console.log('No lessons registered: keeping the existing', OUT);
  process.exit(0);
}
const seen = new Map();
for (const d of decks) {
  for (const s of d.slides) {
    for (const l of slideLines(s)) {
      if (!ACADEMY_VOICES[l.who]) throw new Error(`No voice for ${l.who} (src/academy-deck/voices.ts)`);
      const k = `${l.who}::${l.text}`;
      if (!seen.has(k)) seen.set(k, { who: l.who, text: l.text });
    }
  }
}
// letter names for the spelling game (the student's own name can use any letter)
if (decks.some((d) => d.slides.some((s) => s.kind === 'spell'))) for (const l of ALPHABET) seen.set(`Vee::${l}`, { who: 'Vee', text: l });
const lines = [...seen.values()];
fs.writeFileSync(OUT, JSON.stringify(lines, null, 2) + '\n');
const per = {};
for (const l of lines) per[l.who] = (per[l.who] || 0) + 1;
console.log(`${lines.length} lines -> ${path.relative(process.cwd(), OUT)}  (${Object.entries(per).map(([w, n]) => `${w} ${n}`).join(', ')})`);
