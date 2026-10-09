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

// Request line: "<story key> [--beats=<id>]" (strict mode: one beat at a time).
const reqLine = (fs.readFileSync('scripts/video-gen-request.txt', 'utf8').split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#')) ?? '').split(/\s+/);
const key = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7) || reqLine[0];
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
// Anatomy + extra-motion terms from the 2026-10-04 research (video-quality-gate "Accuracy method").
const negative = story.negativePrompt ?? 'text, letters, words, subtitles, watermark, logo, extra characters, duplicated characters, missing characters, extra limbs, extra arms, extra paws, extra fingers, fused fingers, missing limbs, deformed hands, morphing, melting, flicker, dancing, waving, walking, marching, jumping, camera shake, zoom, photorealistic, 3D render, distorted faces, blurry';

async function makeClip(beat) {
  const file = path.join(story.out, `${beat.id}.mp4`);
  if (fs.existsSync(file)) { console.log(`skip ${beat.id} (exists)`); return true; }
  if (!fs.existsSync(beat.image)) { console.log(`wait ${beat.id}: picture ${beat.image} not made yet`); return false; }
  const contentType = /\.jpe?g$/i.test(beat.image) ? 'image/jpeg' : 'image/png';
  const up = await call({ action: 'upload', base64: fs.readFileSync(beat.image).toString('base64'), contentType });
  if (!up.ok || !up.j.public_url) { console.error(`upload ${beat.id} failed: ${up.status} ${JSON.stringify(up.j).slice(0, 300)}`); return false; }
  const input = { image_url: up.j.public_url, prompt: `${beat.prompt} ${style}`.trim(), duration: beat.seconds ?? story.seconds ?? 10, negative_prompt: negative };
  // Start + END frame (keyframe interpolation): the model only fills in the motion between two approved pictures,
  // so it cannot invent a different action. Kling 2.5 Turbo Pro takes the end picture as tail_image_url.
  if (beat.endImage) {
    const tail = await call({ action: 'upload', base64: fs.readFileSync(beat.endImage).toString('base64'), contentType: /\.jpe?g$/i.test(beat.endImage) ? 'image/jpeg' : 'image/png' });
    if (!tail.ok || !tail.j.public_url) { console.error(`upload end picture ${beat.id} failed: ${tail.status}`); return false; }
    input.tail_image_url = tail.j.public_url;
  }
  if (typeof story.cfgScale === 'number') input.cfg_scale = story.cfgScale;
  const est = await call({ action: 'estimate', endpoint, input });
  console.log(`${beat.id}: estimate ${JSON.stringify(est.j)}`);
  if (!est.ok) { console.error(`${beat.id}: the estimate was refused (${est.status}) — nothing ordered. If it names tail_image_url, this endpoint has no end-frame support: pick one that has.`); return false; }
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

// PROBE (estimate only, never starts a job, costs nothing): "<story> --beats=<id> --probe" asks Higgsfield for a free
// estimate on each candidate endpoint + input layout, to learn which one takes a start AND an end picture.
if (reqLine.includes('--probe')) {
  const id = (reqLine.find((a) => a.startsWith('--beats=')) ?? '').slice(8);
  const beat = story.beats.find((b) => b.id === id);
  if (!beat?.endImage) { console.error('probe needs a beat with image + endImage'); process.exit(1); }
  const upl = async (f) => (await call({ action: 'upload', base64: fs.readFileSync(f).toString('base64'), contentType: 'image/png' })).j.public_url;
  const a = await upl(beat.image); const b = await upl(beat.endImage);
  const base = { prompt: beat.prompt, duration: 5, resolution: '720p', aspect_ratio: '16:9', generate_audio: false };
  const shapes = reqLine.includes('--probe2') ? { image_only: { image_url: a }, image_end: { image_url: a, end_image_url: b }, bogus: { image_url: a, zzz_not_a_field: b }, image_last_image: { image_url: a, last_image_url: b } } : {
    image_end: { image_url: a, end_image_url: b }, image_tail: { image_url: a, tail_image_url: b },
    image_last: { image_url: a, last_frame_image_url: b }, start_end: { start_image_url: a, end_image_url: b },
    first_last: { first_frame_url: a, last_frame_url: b }, images: { image_urls: [a, b] },
    medias: { medias: [{ role: 'start_image', url: a }, { role: 'end_image', url: b }] },
  };
  const eps = reqLine.includes('--probe2') ? ['bytedance/seedance-2.5/image-to-video'] : ['bytedance/seedance-2.5/image-to-video', 'bytedance/seedance-2.5/reference-to-video', 'bytedance/seedance-2.5/omni-reference',
    'bytedance/seedance-2.5/start-end-to-video', 'bytedance/seedance-2.5/first-last-frame-to-video'];
  for (const ep of eps) for (const [name, extra] of Object.entries(shapes)) {
    const r = await call({ action: 'estimate', endpoint: ep, input: { ...base, ...extra } });
    console.log(`PROBE ${ep} ${name}: ${r.status} ${JSON.stringify(r.j).slice(0, reqLine.includes('--probe2') ? 3000 : 400)}`);
  }
  console.log('probe done — nothing was ordered');
  process.exit(0);
}

let ok = 0;
const beats = (process.argv.find((a) => a.startsWith('--beats=')) ?? reqLine.find((a) => a.startsWith('--beats=')) ?? '').slice(8).split(',').filter(Boolean);
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
