// Lists every picture a homework quest refers to that does not exist in /public (a missing one shows as a broken image).
//   npx tsx scripts/check-homework-art.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as registry from '../src/content/homework-quests/registry.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const quests = Object.values(registry.HOMEWORK_QUESTS);
const seen = new Map();
const walk = (node, where) => {
  if (typeof node === 'string') {
    if (/^\/[^\s]+\.(png|jpe?g|webp|svg|gif)$/i.test(node)) seen.set(node, where);
  } else if (Array.isArray(node)) node.forEach((n, i) => walk(n, `${where}[${i}]`));
  else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, `${where}.${k}`);
};
quests.forEach((q, i) => walk(q, q.id ?? q.title ?? `quest${i}`));
let missing = 0;
for (const [p, where] of seen) {
  if (!fs.existsSync(path.join(ROOT, 'public', p))) { missing++; console.log(`MISSING ${p}   (${where})`); }
}
console.log(`\n${seen.size} pictures checked, ${missing} missing.`);
process.exit(missing ? 1 : 0);
