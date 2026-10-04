#!/usr/bin/env node
/**
 * Generates lesson/homework art listed in scripts/art-targets.json through
 * the platform's own `ai-image-generation` edge function (Gemini, with the
 * lesson's existing art passed as a reference image so new pictures match
 * its style). Skips any target whose file already exists — delete a file to
 * regenerate it. Runs in CI (.github/workflows/bake-art.yml), which then cuts
 * `sticker: true` images out of their white background.
 *
 * With HF_PROXY_URL + HF_PROXY_TOKEN set (bake-art.yml sets them) the
 * pictures are made with HIGGSFIELD instead (Grok Image 2.0 through the
 * higgsfield-video edge function, refs uploaded as image references, up to 10).
 * Its output is converted to PNG in CI (art-made.txt).
 *
 * Usage: node scripts/generate-art.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const SUPABASE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co';
const ANON_KEY = fs.readFileSync(new URL('./generate-voice-cache.mjs', import.meta.url), 'utf8').match(/ANON_KEY\s*=\s*\n?\s*'([^']+)'/)?.[1];
const targets = JSON.parse(fs.readFileSync(new URL('./art-targets.json', import.meta.url), 'utf8'));

const HF_PROXY = process.env.HF_PROXY_URL;
const HF_TOKEN = process.env.HF_PROXY_TOKEN;
const HF_ENDPOINT = 'xai/grok-imagine-image-2.0';
const hf = async (body) => {
  const r = await fetch(HF_PROXY, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-song-token': HF_TOKEN }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, j };
};
const refUrls = new Map();
async function hfRef(p) {
  if (!refUrls.has(p)) {
    const contentType = /\.jpe?g$/i.test(p) ? 'image/jpeg' : 'image/png';
    const up = await hf({ action: 'upload', base64: fs.readFileSync(p).toString('base64'), contentType });
    if (!up.ok || !up.j.public_url) throw new Error(`upload ${p}: ${up.status} ${JSON.stringify(up.j).slice(0, 200)}`);
    refUrls.set(p, up.j.public_url);
  }
  return refUrls.get(p);
}
/** One picture with Higgsfield: start, poll, download. */
async function hfImage(t) {
  const image_urls = [];
  for (const p of (t.refs ?? []).slice(0, 10)) image_urls.push(await hfRef(p));
  const input = { prompt: t.prompt, image_urls, aspect_ratio: t.aspect ?? (t.sticker ? '1:1' : '16:9'), resolution: '2k', quality: 'medium' };
  const st = await hf({ action: 'start', endpoint: HF_ENDPOINT, input, idempotencyKey: `${t.out}-${Date.now()}` });
  const id = st.j.request_id;
  if (!st.ok || !id) throw new Error(`start ${st.status} ${JSON.stringify(st.j).slice(0, 300)}`);
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const s = await hf({ action: 'status', request_id: id });
    const status = s.j.status;
    if (status === 'completed') {
      const url = s.j.images?.[0]?.url ?? s.j.image?.url ?? s.j.output?.images?.[0]?.url;
      if (!url) throw new Error(`completed without url ${JSON.stringify(s.j).slice(0, 300)}`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`download ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    }
    if (status === 'failed' || status === 'nsfw' || status === 'canceled') throw new Error(`${status} ${JSON.stringify(s.j).slice(0, 300)}`);
  }
  throw new Error('timed out');
}

let made = 0, failed = 0;
const madeFiles = [];
async function makeOne(t) {
  if (fs.existsSync(t.out)) return;
  let ok = false;
  for (let attempt = 1; attempt <= 2 && !ok; attempt++) {
    try {
      const buf = await hfImage(t);
      fs.mkdirSync(path.dirname(t.out), { recursive: true });
      fs.writeFileSync(t.out, buf);
      console.log(`+ ${t.out} (${buf.length}B, Higgsfield)`);
      made++; ok = true; madeFiles.push(t.out);
    } catch (e) {
      console.warn(`! ${t.out} attempt ${attempt}: ${e.message}`);
    }
  }
  if (!ok) failed++;
}
if (HF_PROXY && HF_TOKEN) {
  const todo = targets.filter((t) => !fs.existsSync(t.out));
  console.log(`Higgsfield: ${todo.length} pictures to make`);
  // Targets that use another missing target as a reference wait for it.
  const waves = [];
  const pending = new Set(todo.map((t) => t.out));
  let left = todo;
  while (left.length) {
    const ready = left.filter((t) => !(t.refs ?? []).some((r) => pending.has(r) && r !== t.out));
    const wave = ready.length ? ready : left;
    waves.push(wave);
    wave.forEach((t) => pending.delete(t.out));
    left = left.filter((t) => !wave.includes(t));
  }
  for (const wave of waves) for (let i = 0; i < wave.length; i += 4) await Promise.all(wave.slice(i, i + 4).map(makeOne));
}

for (const t of HF_PROXY && HF_TOKEN ? [] : targets) {
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
fs.writeFileSync('art-made.txt', madeFiles.join('\n'));
fs.writeFileSync('art-stickers.txt', targets.filter((t) => t.sticker).map((t) => t.out).join('\n'));
console.log(`Done. made ${made}, failed ${failed}`);
if (failed) process.exitCode = 1;
