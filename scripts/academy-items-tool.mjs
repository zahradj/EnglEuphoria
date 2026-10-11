#!/usr/bin/env node
// Academy item bank tool (Academy-only). Works without installing the project's dependencies: it copies src/curriculum/academy
// to a temp folder, adds .ts extensions to relative imports, and runs the TypeScript with Node's built-in type stripping.
//
//   node scripts/academy-items-tool.mjs spec A1        # per-Season brief: lexical fields, structures, functions, exact item counts per episode
//   node scripts/academy-items-tool.mjs check A1       # validate one level's item lists (use "all" for every level)
//   node scripts/academy-items-tool.mjs coverage       # how much of the reference list each level's Seasons cover (needs ACADEMY_OXFORD_JSON)
//
// Optional private reference: ACADEMY_OXFORD_JSON=/path/to/oxford_levels.json  ({ "headword": "A1" | ... }).
// It is built locally from the public Oxford 3000/5000 lists and is NOT stored in the repo.
// ACADEMY_TOOL_TMP overrides the temp folder.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import os from 'node:os';

const repo = resolve(new URL('..', import.meta.url).pathname);
const tmp = process.env.ACADEMY_TOOL_TMP || join(os.tmpdir(), 'academy-tool');
const [cmd = 'check', arg = 'all'] = process.argv.slice(2);

rmSync(tmp, { recursive: true, force: true });
mkdirSync(join(tmp, 'academy'), { recursive: true });
cpSync(join(repo, 'src/curriculum/academy'), join(tmp, 'academy'), { recursive: true, filter: (s) => !s.includes('__tests__') });

function walk(d) {
  return readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') ? [p] : [];
  });
}
for (const f of walk(join(tmp, 'academy'))) {
  let t = readFileSync(f, 'utf8');
  t = t.replace(/(from\s+')(\.{1,2}(?:\/[^']*)?)(')/g, (_m, a, spec, c) => {
    if (spec.endsWith('.ts')) return a + spec + c;
    const isDir = existsSync(join(f, '..', spec)) && statSync(join(f, '..', spec)).isDirectory();
    return a + (isDir ? spec + '/index.ts' : spec + '.ts') + c;
  });
  writeFileSync(f, t);
}

const oxfordPath = process.env.ACADEMY_OXFORD_JSON;
const entry = `
import { readFileSync } from 'node:fs';
import { ACADEMY_SEASONS, ACADEMY_ITEMS, validateItems, expectedCounts, coverageByLevel } from './academy/index.ts';
const cmd = ${JSON.stringify(cmd)}; const arg = ${JSON.stringify(arg)};
const oxford = ${oxfordPath ? `JSON.parse(readFileSync(${JSON.stringify(oxfordPath)}, 'utf8'))` : 'undefined'};
const seasons = arg === 'all' ? ACADEMY_SEASONS : ACADEMY_SEASONS.filter((s) => s.level === arg.toUpperCase());
if (cmd === 'spec') {
  for (const s of seasons) {
    console.log('== ' + s.id + ' ' + s.title + ' (' + s.level + ') budget ' + s.newItemBudget);
    console.log('theme: ' + s.theme + '\\nlexical fields: ' + s.lexicalFields.join('; '));
    console.log('functions: ' + s.functions.join('; ') + '\\nstructures: ' + s.structures.map((x) => x.label + ' [' + x.introducedIn + ']').join(' | '));
    console.log('counts: ' + JSON.stringify(expectedCounts(s)));
  }
} else if (cmd === 'coverage') {
  if (!oxford) { console.log('Set ACADEMY_OXFORD_JSON to run coverage.'); process.exit(0); }
  console.log(JSON.stringify(coverageByLevel(ACADEMY_SEASONS, ACADEMY_ITEMS, oxford), null, 1));
} else {
  const issues = validateItems(seasons, ACADEMY_ITEMS, oxford);
  const errs = issues.filter((i) => i.severity === 'error'); const warns = issues.filter((i) => i.severity === 'warn');
  errs.slice(0, 200).forEach((e) => console.log('ERROR ' + (e.seasonId ?? '') + ' ' + e.code + ': ' + e.message));
  if (errs.length > 200) console.log('... ' + (errs.length - 200) + ' more errors');
  warns.slice(0, 60).forEach((e) => console.log('warn  ' + (e.seasonId ?? '') + ' ' + e.code + ': ' + e.message));
  console.log((oxford ? 'Oxford reference ON. ' : 'Oxford reference OFF (structural checks only). ') + seasons.length + ' Seasons checked: ' + errs.length + ' errors, ' + warns.length + ' warnings.');
  process.exit(errs.length ? 1 : 0);
}
`;
writeFileSync(join(tmp, 'run.ts'), entry);
const r = spawnSync('node', ['--experimental-strip-types', '--no-warnings', join(tmp, 'run.ts')], { stdio: 'inherit' });
process.exit(r.status ?? 1);
