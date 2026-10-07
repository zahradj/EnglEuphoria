#!/usr/bin/env node

import { execFileSync } from 'child_process';
import { basename } from 'path';

const STALE_PATTERNS = ['.bak', '.old', '.tmp', '.security-update', '.orig'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];

const findings = [];

/** Only files tracked in git (local scratch folders and build output never count). */
function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    .split('\0')
    .filter(Boolean)
    .filter((f) => !f.split('/').some((part) => EXCLUDE_DIRS.includes(part)));
}

/** Copies that are deliberate, so a shared file name is not an accident:
 *  - supabase/functions/: Deno edge functions cannot import src/, so shared code is mirrored there on purpose
 *    (speechPolicy.ts / videoPolicy.ts must stay byte-identical — CLAUDE.md, voicePolicy/videoPolicy tests);
 *  - docs/reference/: reference code kept for study, never built;
 *  - public/: static pictures and sounds (a picture named like a module is not a code copy);
 *  - generic entry names every folder may have (index.ts, README.md…). */
const DELIBERATE_PREFIXES = ['supabase/functions/', 'docs/reference/', 'public/'];
const GENERIC_NAMES = new Set(['index.ts', 'index.tsx', 'index.js', 'README.md']);

function walkDir() {
  const fileMap = new Map();
  for (const fullPath of trackedFiles()) {
    const name = basename(fullPath);
    // Check stale patterns
    if (STALE_PATTERNS.some((p) => name.endsWith(p))) {
      findings.push(`Stale file: ${fullPath}`);
    }
    // Track duplicates
    if (GENERIC_NAMES.has(name)) continue;
    if (!fileMap.has(name)) fileMap.set(name, []);
    fileMap.get(name).push(fullPath);
  }
  return fileMap;
}

console.log('🧹 Running repository hygiene check...\n');

const fileMap = walkDir();

// Check for duplicates outside src/
for (const [name, paths] of fileMap.entries()) {
  if (paths.length > 1) {
    const srcPaths = paths.filter(p => p.startsWith('src/'));
    const otherPaths = paths.filter(p => !p.startsWith('src/') && !p.startsWith('node_modules') && !DELIBERATE_PREFIXES.some((d) => p.startsWith(d)));
    
    if (srcPaths.length > 0 && otherPaths.length > 0) {
      findings.push(`Duplicate file outside src/: ${name} (${otherPaths.join(', ')})`);
    }
  }
}

if (findings.length === 0) {
  console.log('✅ No hygiene issues found');
  process.exit(0);
} else {
  console.log('❌ Found hygiene issues:\n');
  findings.forEach(f => console.log(`  - ${f}`));
  console.log(`\nTotal issues: ${findings.length}`);
  process.exit(1);
}
