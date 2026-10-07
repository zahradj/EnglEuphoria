// Lints the whole repo and fails only on NEW lint errors.
//
// Why this exists: `eslint .` reports ~4,700 old errors (mostly `no-explicit-any`) in ~950 files
// written before the rules were enforced, so CI's "Run linter" step was red on every branch,
// main included, and stopped the type-check and tests from running at all. Fixing them in one
// sweep would touch live pages blindly. Like scripts/typecheck-classroom.mjs, this check knows
// the old errors (scripts/lint-baseline.json: "file :: rule" -> count) and fails only when a
// change adds one. Warnings never fail.
//
//   node scripts/lint-baseline.mjs            # check (npm run lint, CI)
//   node scripts/lint-baseline.mjs --update   # re-record the baseline after fixing old errors
import { ESLint } from 'eslint';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const BASELINE = 'scripts/lint-baseline.json';
const eslint = new ESLint();
const results = await eslint.lintFiles(['.']);

// Count errors per file and rule (no line numbers, so edits elsewhere in a file don't churn it).
const found = {};
for (const r of results) {
  const file = path.relative(process.cwd(), r.filePath).split(path.sep).join('/');
  for (const m of r.messages) {
    if (m.severity !== 2) continue;
    const key = `${file} :: ${m.ruleId ?? 'parse-error'}`;
    found[key] = (found[key] ?? 0) + 1;
  }
}
const sorted = Object.fromEntries(Object.entries(found).sort(([a], [b]) => a.localeCompare(b)));
const total = (o) => Object.values(o).reduce((a, b) => a + b, 0);

if (process.argv.includes('--update')) {
  writeFileSync(BASELINE, JSON.stringify(sorted, null, 1) + '\n');
  console.log(`Lint baseline updated: ${total(sorted)} known error(s).`);
  process.exit(0);
}

const known = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {};
const fresh = Object.entries(sorted).filter(([k, n]) => n > (known[k] ?? 0));

if (fresh.length) {
  const formatter = await eslint.loadFormatter('stylish');
  const freshFiles = new Set(fresh.map(([k]) => k.split(' :: ')[0]));
  const shown = results
    .filter((r) => freshFiles.has(path.relative(process.cwd(), r.filePath).split(path.sep).join('/')))
    .map((r) => ({ ...r, messages: r.messages.filter((m) => m.severity === 2) }));
  console.error(await formatter.format(shown));
  console.error(`\n✖ NEW lint error(s) (beyond ${BASELINE}):`);
  for (const [k, n] of fresh) console.error(`  ${k}: ${n} (was ${known[k] ?? 0})`);
  console.error('\nFix them (do not add them to the baseline).');
  process.exit(1);
}
const fixed = total(known) - total(sorted);
console.log(`✓ Lint: no new errors (${total(known)} older known error(s)${fixed > 0 ? `, ${fixed} now fixed — run with --update to drop them` : ''}).`);
