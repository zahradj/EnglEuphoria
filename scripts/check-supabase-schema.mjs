#!/usr/bin/env node
/**
 * Catches the exact bug class found in production this session: code that
 * queries a Supabase table (or writes an enum value) that doesn't actually
 * exist in the real database. Wiring the Database generic onto the
 * supabase client (src/integrations/supabase/client.ts) doesn't catch this
 * on its own — this project's tsconfig has "strict": false, and TypeScript
 * silently widens .from()'s table-name type to `string` when strict mode
 * is off, so an invalid table name compiles clean. This script does the
 * same check types.ts *would* enforce under strict mode, without needing
 * to flip that project-wide setting (which would surface a large number of
 * unrelated pre-existing errors in a codebase this size — not something to
 * do unilaterally).
 *
 * Run: node scripts/check-supabase-schema.mjs
 * Exits non-zero (and lists every offending call site) if any src/ file
 * references a table name that isn't in the generated schema.
 *
 * Source of truth: src/integrations/supabase/types.ts, which is generated
 * directly from the live database (via the Supabase CLI / dashboard "Generate
 * types" action) — re-generate that file periodically so this check doesn't
 * itself go stale against schema changes made outside this repo.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TYPES_PATH = path.join(ROOT, 'src/integrations/supabase/types.ts');
const SRC_DIR = path.join(ROOT, 'src');

function extractRealTables(typesSrc) {
  const tablesStart = typesSrc.indexOf('\n    Tables: {');
  const tablesEnd = typesSrc.indexOf('\n    Views: {', tablesStart);
  if (tablesStart === -1 || tablesEnd === -1) {
    throw new Error('Could not locate the Tables: { ... } block in types.ts — has its shape changed?');
  }
  const block = typesSrc.slice(tablesStart, tablesEnd);
  const names = new Set();
  for (const m of block.matchAll(/^      (\w+): \{$/gm)) names.add(m[1]);
  return names;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

function findTableRefs(files) {
  const hits = [];
  const pattern = /\.from\((['"])([a-zA-Z_][a-zA-Z0-9_]*)\1\)/g;
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      pattern.lastIndex = 0;
      let m;
      while ((m = pattern.exec(lines[i]))) {
        hits.push({ file: path.relative(ROOT, file), line: i + 1, table: m[2] });
      }
    }
  }
  return hits;
}

const typesSrc = readFileSync(TYPES_PATH, 'utf8');
const realTables = extractRealTables(typesSrc);
const files = walk(SRC_DIR);
const hits = findTableRefs(files);

const offenders = hits.filter((h) => !realTables.has(h.table));

// Drop false positives from supabase.storage.from('bucket-name') — Storage
// buckets aren't in the Tables schema and aren't bugs.
const filtered = offenders.filter((h) => {
  const text = readFileSync(path.join(ROOT, h.file), 'utf8').split('\n')[h.line - 1] || '';
  return !text.includes('.storage.from(');
});

if (filtered.length === 0) {
  console.log(`✓ Checked ${hits.length} .from() call sites across ${files.length} files — all reference real tables (${realTables.size} in schema).`);
  process.exit(0);
}

console.error(`✗ Found ${filtered.length} .from() call site(s) referencing a table that does not exist in the real schema:\n`);
for (const h of filtered) {
  console.error(`  ${h.file}:${h.line}  ->  '${h.table}'`);
}
console.error(`\nEither the table name is wrong (check for a similarly-named real table) or types.ts is stale (re-generate it from the live database).`);
process.exit(1);
