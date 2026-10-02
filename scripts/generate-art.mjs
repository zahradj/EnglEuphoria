#!/usr/bin/env node
/**
 * Generates lesson/homework art listed in scripts/art-targets.json through
 * the platform's own `ai-image-generation` edge function (Gemini, with the
 * lesson's existing art passed as a reference image so new pictures match
 * its style). Skips any target whose file already exists — delete a file to
 * regenerate it. Runs in CI (.github/workflows/bake-art.yml), which then cuts
 * `sticker: true` images out of their white background.
 *
 * Usage: node scripts/generate-art.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co';
const ANON_KEY = fs.readFileSync(new URL('./generate-voice-cache.mjs', import.meta.url), 'utf8').match(/ANON_KEY\s*=\s*\n?\s*'([^']+)'/)?.[1];
const targets = JSON.parse(fs.readFileSync(new URL('./art-targets.json', import.meta.url), 'utf8'));

let made = 0, failed = 0;
const madeFiles = [];
for (const t of targets) {
  if (fs.existsSync(t.out)) { console.log(`= exists ${t.out}`); continue; }
  const referenceImages = (t.refs ?? []).map((p) => ({ mimeType: 'image/png', data: fs.readFileSync(p).toString('base64') }));
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-image-generation`, {
        method: 'POST',
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: t.prompt, style: 'cartoon', referenceImages, postProcess: false }),
      });
      const body = await res.json();
      if (!res.ok || !body.imageUrl) throw new Error(`${res.status} ${body.error ?? ''} ${body.details ?? ''}`);
      let buf;
      if (body.imageUrl.startsWith('data:')) buf = Buffer.from(body.imageUrl.split(',')[1], 'base64');
      else buf = Buffer.from(await (await fetch(body.imageUrl)).arrayBuffer());
      fs.mkdirSync(path.dirname(t.out), { recursive: true });
      fs.writeFileSync(t.out, buf);
      console.log(`+ ${t.out} (${buf.length}B)`);
      made++; ok = true; madeFiles.push(t.out);
    } catch (e) {
      console.warn(`! ${t.out} attempt ${attempt}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
  if (!ok) failed++;
}
// Wide versions of square art: the original is pasted back exactly into
// the centre afterwards (scripts/outpaint-composite.py), so only the
// extended sides are new.
fs.writeFileSync('art-outpaint.txt', targets.filter((t) => t.outpaintFrom && madeFiles.includes(t.out)).map((t) => `${t.out}\t${t.outpaintFrom}`).join('\n'));
fs.writeFileSync('art-stickers.txt', targets.filter((t) => t.sticker).map((t) => t.out).join('\n'));
console.log(`Done. made ${made}, failed ${failed}`);
if (failed) process.exitCode = 1;
