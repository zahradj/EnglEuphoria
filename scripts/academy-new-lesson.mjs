// Scaffolds a new Academy lesson from its blueprint (lesson file, research stub, plan stub) and prints the checklist. Never overwrites a file.
//   npx tsx scripts/academy-new-lesson.mjs B1-S01-E4 [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACADEMY_LESSON_BLUEPRINTS } from '../src/curriculum/academy/index.ts';
import { scaffoldLesson } from '../src/academy-player-v2/tools/scaffold.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
const dry = process.argv.includes('--dry');
const bp = ACADEMY_LESSON_BLUEPRINTS.find((b) => b.id === id);
if (!bp) { console.error(`No blueprint ${id}. Ids look like B1-S01-E4 (src/curriculum/academy).`); process.exit(2); }
const s = scaffoldLesson(bp);
let clash = false;
for (const f of s.files) {
  const abs = path.join(ROOT, f.path);
  if (fs.existsSync(abs)) { console.error(`EXISTS  ${f.path} (not overwritten)`); clash = true; continue; }
  console.log(`${dry ? 'would write' : 'write'}  ${f.path}`);
  if (!dry) { fs.mkdirSync(path.dirname(abs), { recursive: true }); fs.writeFileSync(abs, f.content); }
}
console.log('\nRegister when the lesson is valid:\n' + s.registration + '\n\nChecklist:\n' + s.checklist.join('\n'));
process.exit(clash ? 1 : 0);
