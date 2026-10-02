#!/usr/bin/env node
/**
 * Pronunciation audit run (GitHub Actions: .github/workflows/voice-audit.yml).
 *   1. manifest of every baked clip (generate-voice-cache.mjs --manifest)
 *   2. transcribe each clip with the temporary `voice-audit` edge function
 *      (ElevenLabs Scribe), retrying rate-limited ones
 *   3. compare transcript vs intended text (voice-audit-compare.mjs)
 * Writes docs/voice-audit/{transcripts.json,report.json}.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const FN = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/functions/v1/voice-audit';
const ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjb3hweXpvcWp2bXV1eWd2bG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTcxMzMsImV4cCI6MjA2NTUzMzEzM30.qWD7MJ3O7xrH2KBzIfPqGvVXigVaamR6DMVOW3rnO7s';
const TOKEN = process.env.AUDIT_TOKEN;
const OUT = 'docs/voice-audit';
fs.mkdirSync(OUT, { recursive: true });

execFileSync('npx', ['-y', 'tsx', 'scripts/generate-voice-cache.mjs', `--manifest=${OUT}/manifest.json`], { stdio: 'inherit' });
const manifest = JSON.parse(fs.readFileSync(`${OUT}/manifest.json`, 'utf8'));
const files = [...new Set(manifest.filter((c) => c.exists).map((c) => c.file))];

const transcripts = new Map();
// Re-runs only transcribe clips that are new since the last report (a fixed
// line gets a new clip file name); earlier transcripts are kept.
if (fs.existsSync(`${OUT}/transcripts.json`)) {
  for (const t of JSON.parse(fs.readFileSync(`${OUT}/transcripts.json`, 'utf8'))) if (files.includes(t.file)) transcripts.set(t.file, t.text);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(batch) {
  const res = await fetch(FN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ token: TOKEN, files: batch }),
  });
  if (!res.ok) throw new Error(`voice-audit ${res.status}: ${await res.text()}`);
  return (await res.json()).results ?? [];
}

let pending = files.filter((f) => !transcripts.has(f));
console.log(`${pending.length} clips to transcribe (${transcripts.size} already done).`);
for (let pass = 0; pass < 4 && pending.length; pass++) {
  const failed = [];
  for (let i = 0; i < pending.length; i += 20) {
    const batch = pending.slice(i, i + 20);
    try {
      for (const r of await run(batch)) {
        if (typeof r.text === 'string') transcripts.set(r.file, r.text);
        else failed.push(r.file);
      }
    } catch (e) {
      console.warn(String(e));
      failed.push(...batch);
    }
    console.log(`pass ${pass + 1}: ${Math.min(i + 20, pending.length)}/${pending.length}`);
    await sleep(pass === 0 ? 300 : 3000);
  }
  pending = failed;
}
console.log(`Transcribed ${transcripts.size}/${files.length}; untranscribed ${pending.length}`);

fs.writeFileSync(`${OUT}/transcripts.json`, JSON.stringify([...transcripts].map(([file, text]) => ({ file, text })), null, 1));
const report = execFileSync('node', ['scripts/voice-audit-compare.mjs', `${OUT}/manifest.json`, `${OUT}/transcripts.json`]).toString();
fs.writeFileSync(`${OUT}/report.json`, report);
fs.writeFileSync(`${OUT}/untranscribed.json`, JSON.stringify(pending));
console.log(`Flagged ${JSON.parse(report).length} clips.`);
