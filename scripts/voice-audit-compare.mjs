#!/usr/bin/env node
/**
 * Pronunciation audit — compares what each baked voice clip SAYS (a
 * speech-to-text transcript) with the text it was MEANT to say.
 *
 *   1. node --import tsx scripts/generate-voice-cache.mjs --manifest=manifest.json
 *   2. transcribe the clips (one-off: the voice-audit edge function, 2026-10-02)
 *      into transcripts.json: [{ file, text }]
 *   3. node scripts/voice-audit-compare.mjs manifest.json transcripts.json > report.json
 *
 * A clip is flagged when the word-level difference is real — numbers,
 * contractions, punctuation, casing and spelled-out letters are normalised
 * first so "I'm" vs "I am", "7" vs "seven" or "S!" vs "Ess" don't count.
 */
import fs from 'node:fs';

const [manifestPath, transcriptsPath] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const transcripts = new Map(JSON.parse(fs.readFileSync(transcriptsPath, 'utf8')).map((t) => [t.file, t.text]));

const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const CONTRACTIONS = {
  "i'm": 'i am', "you're": 'you are', "it's": 'it is', "that's": 'that is', "let's": 'let us', "what's": 'what is',
  "he's": 'he is', "she's": 'she is', "we're": 'we are', "they're": 'they are', "don't": 'do not', "can't": 'can not',
  "isn't": 'is not', "aren't": 'are not', "where's": 'where is', "here's": 'here is', "there's": 'there is', "name's": 'name is',
  "i'll": 'i will', "you'll": 'you will', "we'll": 'we will', "doesn't": 'does not', "didn't": 'did not', 'cannot': 'can not',
};

function norm(s) {
  let t = String(s ?? '').toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[\u{1F300}-\u{1FAFF}☀-➿️‍]/gu, ' ')
    .replace(/_{2,}/g, ' ');
  t = t.replace(/\b\d+\b/g, (d) => NUM[+d] ?? d);
  for (const [k, v] of Object.entries(CONTRACTIONS)) t = t.replaceAll(k, v);
  t = t.replace(/[^a-z' ]+/g, ' ').replace(/'/g, '');
  return t.split(/\s+/).filter(Boolean);
}

// Word-level edit distance with the aligned diff.
function diff(a, b) {
  const n = a.length, m = b.length;
  const d = Array.from({ length: n + 1 }, (_, i) => [i, ...Array(m).fill(0)]);
  for (let j = 1; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  const ops = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      if (a[i - 1] !== b[j - 1]) ops.push(`"${a[i - 1]}"→"${b[j - 1]}"`);
      i--; j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { ops.push(`missing "${a[i - 1]}"`); i--; }
    else { ops.push(`extra "${b[j - 1]}"`); j--; }
  }
  return { distance: d[n][m], ops: ops.reverse() };
}

const out = [];
for (const c of manifest) {
  if (!c.exists || !transcripts.has(c.file)) continue;
  const want = norm(c.text), got = norm(transcripts.get(c.file));
  const { distance, ops } = diff(want, got);
  const rate = want.length ? distance / want.length : (got.length ? 1 : 0);
  if (distance > 0) out.push({ file: c.file, voice: c.character, text: c.text, heard: transcripts.get(c.file), distance, rate: +rate.toFixed(2), ops });
}
out.sort((x, y) => y.rate - x.rate || y.distance - x.distance);
console.log(JSON.stringify(out, null, 2));
