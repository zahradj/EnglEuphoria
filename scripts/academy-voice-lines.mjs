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
import { SIGN_ME_UP } from '../src/academy-deck/lessons/signMeUp.ts';
import { PA1_S01_E1 } from '../src/academy-deck/lessons/pa1s01e1.ts';
import { PA1_S02_E1 } from '../src/academy-deck/lessons/pa1s02e1.ts';
import { B1_S01_E1 } from '../src/academy-deck/lessons/b1s01e1.ts';
import { B1_S01_E2 } from '../src/academy-deck/lessons/b1s01e2.ts';
import { B1_S01_E3 } from '../src/academy-deck/lessons/b1s01e3.ts';
import { SIGN_ME_UP_2 } from '../src/academy-deck/lessons/signMeUp2.ts';
import { applyLane } from '../src/academy-deck/lanes.ts';
import { PATTERN_LAB } from '../src/academy-deck/lessons/patternLab.ts';
import { FREE_TIME_CLUB_1 } from '../src/academy-deck/lessons/freeTimeClub1.ts';
import { FREE_TIME_CLUB_2 } from '../src/academy-deck/lessons/freeTimeClub2.ts';
import { SIGN_ME_UP_QUEST } from '../src/academy-deck/homework/signMeUpQuest.ts';
import { slideLines, ALPHABET } from '../src/academy-deck/spoken.ts';
import { ACADEMY_VOICES } from '../src/academy-deck/voices.ts';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'academy-voice-lines.json');

const decks = [
  { name: SIGN_ME_UP.lessonId, slides: SIGN_ME_UP.slides },
  // sample 2: every lane's version of every slide
  { name: `${SIGN_ME_UP_2.lessonId} sample 2`, slides: SIGN_ME_UP_2.slides.flatMap((s) => ['core', 'start', 'stretch'].map((l) => applyLane(s, l))) },
  { name: PATTERN_LAB.lessonId, slides: PATTERN_LAB.slides },
  { name: FREE_TIME_CLUB_1.lessonId, slides: FREE_TIME_CLUB_1.slides },
  { name: FREE_TIME_CLUB_2.lessonId, slides: FREE_TIME_CLUB_2.slides },
  { name: PA1_S01_E1.lessonId, slides: PA1_S01_E1.slides },
  { name: PA1_S02_E1.lessonId, slides: PA1_S02_E1.slides },
  { name: B1_S01_E1.lessonId, slides: B1_S01_E1.slides },
  { name: B1_S01_E2.lessonId, slides: B1_S01_E2.slides },
  { name: B1_S01_E3.lessonId, slides: B1_S01_E3.slides },
  { name: `${SIGN_ME_UP.lessonId} homework`, slides: SIGN_ME_UP_QUEST.flatMap((c) => c.slides) },
];

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
