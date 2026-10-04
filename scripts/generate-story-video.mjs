#!/usr/bin/env node
/**
 * Real story video for Pre-A1 Lesson 5 (docs/playground-lesson-blueprint.md §3a).
 * Generator: HIGGSFIELD ONLY (owner's rule, 2026-10-03).
 *
 * Reads scripts/story-videos.json, takes the story named in
 * scripts/video-gen-request.txt, and for every beat: uploads the lesson's own
 * story picture to Higgsfield, starts an image-to-video request (default
 * Kling 2.5 Turbo Pro) with the beat's motion prompt, polls until it is
 * completed, and saves <out>/<beat id>.mp4. Existing clips are skipped, so a
 * re-run only fills gaps. Stitching + narration timing happens afterwards.
 *
 * Env: HF_PROXY_URL, HF_PROXY_TOKEN (the higgsfield-video edge function,
 * which holds the Higgsfield key as a Supabase secret).
 */
import fs from 'node:fs';
import path from 'node:path';
import { checkStory } from './check-storyboard.mjs';

const PROXY = process.env.HF_PROXY_URL;
const TOKEN = process.env.HF_PROXY_TOKEN;
if (!PROXY || !TOKEN) { console.error('HF_PROXY_URL / HF_PROXY_TOKEN missing'); process.exit(1); }

const key = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7)
  || fs.readFileSync('scripts/video-gen-request.txt', 'utf8').split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#'));
const all = JSON.parse(fs.readFileSync('scripts/story-videos.json', 'utf8'));
const story = all[key];
if (!story) { console.error(`No story "${key}" in scripts/story-videos.json`); process.exit(1); }
fs.mkdirSync(story.out, { recursive: true });

const endpoint = story.endpoint ?? 'kling-video/v2.5-turbo/pro/image-to-video';
const call = async (body) => {
  const r = await fetch(PROXY, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-song-token': TOKEN }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, j };
};
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const style = story.style ?? '';
const negative = story.negativePrompt ?? 'text, letters, words, subtitles, watermark, logo, extra characters, duplicated characters, photorealistic, 3D render, distorted faces, blurry';

async function makeClip(beat) {
  const file = path.join(story.out, `${beat.id}.mp4`);
  if (fs.existsSync(file)) { console.log(`skip ${beat.id} (exists)`); return true; }
  if (!fs.existsSync(beat.image)) { console.log(`wait ${beat.id}: picture ${beat.image} not made yet`); return false; }
  const contentType = /\.jpe?g$/i.test(beat.image) ? 'image/jpeg' : 'image/png';
  const up = await call({ action: 'upload', base64: fs.readFileSync(beat.image).toString('base64'), contentType });
  if (!up.ok || !up.j.public_url) { console.error(`upload ${beat.id} failed: ${up.status} ${JSON.stringify(up.j).slice(0, 300)}`); return false; }
  const input = { image_url: up.j.public_url, prompt: `${beat.prompt} ${style}`.trim(), duration: beat.seconds ?? story.seconds ?? 10, negative_prompt: negative };
  const est = await call({ action: 'estimate', endpoint, input });
  console.log(`${beat.id}: estimate ${JSON.stringify(est.j)}`);
  const st = await call({ action: 'start', endpoint, input, idempotencyKey: `${key}-${beat.id}-${Date.now()}` });
  const id = st.j.request_id;
  if (!st.ok || !id) { console.error(`start ${beat.id} failed: ${st.status} ${JSON.stringify(st.j).slice(0, 400)}`); return false; }
  console.log(`started ${beat.id}: ${id}`);
  for (let i = 0; i < 90; i++) {
    await sleep(10000);
    const s = await call({ action: 'status', request_id: id });
    const status = s.j.status;
    if (status === 'completed') {
      const url = s.j.video?.url ?? s.j.output?.video?.url;
      if (!url) { console.error(`${beat.id}: completed without video url ${JSON.stringify(s.j).slice(0, 300)}`); return false; }
      const v = await fetch(url);
      if (!v.ok) { console.error(`${beat.id}: download ${v.status}`); return false; }
      fs.writeFileSync(file, Buffer.from(await v.arrayBuffer()));
      console.log(`saved ${file} (${fs.statSync(file).size} bytes)`);
      return true;
    }
    if (status === 'failed' || status === 'nsfw' || status === 'canceled') { console.error(`${beat.id}: ${status} ${JSON.stringify(s.j).slice(0, 300)}`); return false; }
  }
  console.error(`${beat.id}: timed out`);
  return false;
}

let ok = 0;
const beats = (process.argv.find((a) => a.startsWith('--beats=')) ?? '').slice(8).split(',').filter(Boolean);
const wanted = (beats.length ? story.beats.filter((b) => beats.includes(b.id)) : story.beats).filter((b) => !b.rejected);

// STRICT MODE (owner, 2026-10-04): nothing is uploaded or paid for unless every wanted beat passes the storyboard check
// (exact line, one matching action, owner's written approval, <= 5 s), and only ONE new clip is made per run.
const bad = checkStory({ beats: wanted });
if (bad.length) {
  console.error('STRICT MODE: refusing to generate — fix the storyboard and get the owner\'s approval first:');
  bad.forEach((b) => b.errs.forEach((e) => console.error(`  ${b.id}: ${e}`)));
  process.exit(1);
}
const missing = wanted.filter((b) => !fs.existsSync(path.join(story.out, `${b.id}.mp4`)));
if (missing.length > 1) {
  console.error(`STRICT MODE: ${missing.length} new clips requested — only ONE clip per run, reviewed before the next. Use --beats=<id>.`);
  process.exit(1);
}
const todo = missing;
for (let i = 0; i < todo.length; i += 3) {
  const res = await Promise.all(todo.slice(i, i + 3).map(makeClip));
  ok += res.filter(Boolean).length;
}
console.log(`${ok}/${todo.length} clips ready for ${key}`);
if (ok === 0 && todo.some((b) => fs.existsSync(b.image))) process.exit(1);
