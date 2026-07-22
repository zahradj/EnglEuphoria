#!/usr/bin/env node

import { readdir, stat } from 'fs/promises';
import { join, basename } from 'path';

const STALE_PATTERNS = ['.bak', '.old', '.tmp', '.security-update', '.orig'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'build'];

const findings = [];

async function walkDir(dir, fileMap = new Map()) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        await walkDir(fullPath, fileMap);
      }
    } else {
      // Check stale patterns
      if (STALE_PATTERNS.some(p => entry.name.endsWith(p))) {
        findings.push(`Stale file: ${fullPath}`);
      }
      
      // Track duplicates
      const name = basename(entry.name);
      if (!fileMap.has(name)) {
        fileMap.set(name, []);
      }
      fileMap.get(name).push(fullPath);
    }
  }
  
  return fileMap;
}

console.log('🧹 Running repository hygiene check...\n');

const fileMap = await walkDir('.');

// Check for duplicates outside src/
for (const [name, paths] of fileMap.entries()) {
  if (paths.length > 1) {
    const srcPaths = paths.filter(p => p.startsWith('src/'));
    const otherPaths = paths.filter(p => !p.startsWith('src/') && !p.startsWith('node_modules'));
    
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
