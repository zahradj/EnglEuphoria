// Type-checks the live-classroom code (the lesson players, every scene, MainStage).
//
// Why this exists: the root tsconfig.json has `"files": []`, so `tsc -p .` /
// `npm run typecheck` check NOTHING. A full `tsc -p tsconfig.app.json` takes ~7 minutes
// and has old errors. This scoped check takes ~20s and fails only on NEW errors —
// anything not listed in scripts/typecheck-classroom.baseline.txt.
//
//   node scripts/typecheck-classroom.mjs            # check (CI + Vercel build)
//   node scripts/typecheck-classroom.mjs --update   # re-record the baseline after fixing old errors
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const BASELINE = 'scripts/typecheck-classroom.baseline.txt';
const run = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit', '-p', 'tsconfig.classroom.json'], { encoding: 'utf8' });
const out = `${run.stdout ?? ''}${run.stderr ?? ''}`;

// "path(12,3): error TS2322: message" -> "path :: TS2322 :: message" (no line/col, so edits above don't churn it)
const found = [...new Set(
  out.split(/\r?\n/)
    .map((l) => l.match(/^(.+?)\(\d+,\d+\): error (TS\d+): (.*)$/))
    .filter(Boolean)
    .map((m) => `${m[1].split('\\').join('/')} :: ${m[2]} :: ${m[3].slice(0, 110)}`),
)].sort();

if (process.argv.includes('--update')) {
  writeFileSync(BASELINE, found.join('\n') + '\n');
  console.log(`Baseline updated: ${found.length} known error(s).`);
  process.exit(0);
}

if (!found.length && run.status !== 0) {
  console.error(out);
  console.error('tsc failed without a parseable type error (config or crash).');
  process.exit(1);
}

const known = new Set(existsSync(BASELINE) ? readFileSync(BASELINE, 'utf8').split('\n').filter(Boolean) : []);
const fresh = found.filter((e) => !known.has(e));
const fixed = [...known].filter((e) => !found.includes(e));

if (fresh.length) {
  console.error(`\n✖ ${fresh.length} NEW type error(s) in the live-classroom code:\n`);
  for (const e of fresh) console.error('  ' + e);
  console.error('\nFix them (do not add them to the baseline).');
  process.exit(1);
}
console.log(`✓ Classroom type-check: no new errors (${known.size} older known error(s)${fixed.length ? `, ${fixed.length} now fixed — run with --update to drop them` : ''}).`);
