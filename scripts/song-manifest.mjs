#!/usr/bin/env node
/**
 * Integrity manifest for the lesson song recordings listed in scripts/songs.json.
 *
 *   node scripts/song-manifest.mjs           # verify: exit 1 if any song is missing/changed
 *   node scripts/song-manifest.mjs --write   # (re)record sha256 + size after an INTENTIONAL change
 *
 * Songs are static, committed assets (never generated at play time). The manifest
 * pins each file's sha256, so an accidental overwrite, truncated download or
 * half-finished regeneration fails `npm test` (songAssets.test.ts) instead of
 * silently shipping wrong audio. Only run --write after you verified the new take
 * with scripts/verify-song.py and updated the scene lyrics/lineDurationsMs.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const songs = JSON.parse(fs.readFileSync(path.join(root, 'scripts/songs.json'), 'utf8'));
const manifestPath = path.join(root, 'scripts/song-manifest.json');
const write = process.argv.includes('--write');

const current = {};
for (const [key, song] of Object.entries(songs)) {
  const file = path.join(root, song.publicPath);
  if (!fs.existsSync(file)) { current[key] = null; continue; }
  const buf = fs.readFileSync(file);
  current[key] = { path: song.publicPath, bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
}

if (write) {
  const missing = Object.entries(current).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) { console.error(`Refusing to write: missing files for ${missing.join(', ')}`); process.exit(1); }
  fs.writeFileSync(manifestPath, JSON.stringify(current, null, 2) + '\n');
  console.log(`Wrote ${Object.keys(current).length} entries to scripts/song-manifest.json`);
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let bad = 0;
for (const [key, now] of Object.entries(current)) {
  const want = manifest[key];
  if (!now) { console.error(`MISSING  ${key}`); bad++; }
  else if (!want) { console.error(`UNPINNED ${key} (run with --write after verifying)`); bad++; }
  else if (want.sha256 !== now.sha256) { console.error(`CHANGED  ${key} (${now.path})`); bad++; }
}
console.log(bad ? `${bad} problem(s)` : `All ${Object.keys(current).length} songs match the manifest.`);
process.exit(bad ? 1 : 0);
