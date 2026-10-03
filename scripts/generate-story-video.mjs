#!/usr/bin/env node
/**
 * Real story video for Pre-A1 Lesson 5 (docs/playground-lesson-blueprint.md §3a).
 *
 * Reads scripts/story-videos.json, takes the story named in
 * scripts/video-gen-request.txt, and for every beat sends the lesson's own
 * story picture + a motion prompt to Veo (image-to-video) through the
 * token-gated video-proxy edge function. Each finished clip is saved to
 * <out>/<beat id>.mp4 (existing clips are skipped, so a re-run only fills
 * gaps). Stitching + narration timing is done afterwards (ffmpeg).
 *
 * Env: VIDEO_PROXY_URL, VIDEO_PROXY_TOKEN.
 *
 * RETIRED for new clips: the owner's rule (2026-10-03) is Higgsfield only for
 * video generation. The beat list in scripts/story-videos.json is still the
 * source of truth for prompts; generate with Higgsfield image-to-video.
 */
import fs from 'node:fs';
import path from 'node:path';

const PROXY = process.env.VIDEO_PROXY_URL;
const TOKEN = process.env.VIDEO_PROXY_TOKEN;
if (!PROXY || !TOKEN) { console.error('VIDEO_PROXY_URL / VIDEO_PROXY_TOKEN missing'); process.exit(1); }

const key = (process.argv.find((a) => a.startsWith('--only=')) ?? '').slice(7)
  || fs.readFileSync('scripts/video-gen-request.txt', 'utf8').split('\n').map((l) => l.trim()).find((l) => l && !l.startsWith('#'));
const all = JSON.parse(fs.readFileSync('scripts/story-videos.json', 'utf8'));
const story = all[key];
if (!story) { console.error(`No story "${key}" in scripts/story-videos.json`); process.exit(1); }
fs.mkdirSync(story.out, { recursive: true });

const call = async (body) => {
  const r = await fetch(PROXY, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-song-token': TOKEN }, body: JSON.stringify(body) });
  return r;
};
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const style = story.style ?? '';
const negative = story.negativePrompt ?? 'text, letters, words, subtitles, watermark, logo, extra characters, duplicated characters, photorealistic, 3D render, distorted faces';

async function makeClip(beat) {
  const file = path.join(story.out, `${beat.id}.mp4`);
  if (fs.existsSync(file)) { console.log(`skip ${beat.id} (exists)`); return true; }
  const img = fs.readFileSync(beat.image);
  const mimeType = beat.image.endsWith('.jpg') || beat.image.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
  for (let attempt = 1; attempt <= 2; attempt++) {
    const start = await call({ action: 'start', model: story.model, prompt: `${beat.prompt} ${style}`.trim(), image: { base64: img.toString('base64'), mimeType }, durationSeconds: beat.seconds ?? story.seconds ?? 8, negativePrompt: negative });
    const sj = await start.json().catch(() => ({}));
    if (!start.ok || !sj.name) { console.error(`start ${beat.id} failed: ${start.status} ${JSON.stringify(sj).slice(0, 300)}`); await sleep(20000); continue; }
    console.log(`started ${beat.id}: ${sj.name}`);
    for (let i = 0; i < 60; i++) {
      await sleep(10000);
      const p = await call({ action: 'poll', name: sj.name });
      const pj = await p.json().catch(() => ({}));
      if (!pj.done) continue;
      if (pj.error || !pj.uri) { console.error(`clip ${beat.id} failed: ${pj.error}`); break; }
      const v = await call({ action: 'fetch', uri: pj.uri });
      if (!v.ok) { console.error(`fetch ${beat.id} failed: ${v.status}`); break; }
      fs.writeFileSync(file, Buffer.from(await v.arrayBuffer()));
      console.log(`saved ${file} (${fs.statSync(file).size} bytes)`);
      return true;
    }
  }
  return false;
}

let ok = 0;
// A few at a time: Veo jobs run in parallel on Google's side.
const beats = story.beats;
for (let i = 0; i < beats.length; i += 3) {
  const res = await Promise.all(beats.slice(i, i + 3).map(makeClip));
  ok += res.filter(Boolean).length;
}
console.log(`${ok}/${beats.length} clips ready for ${key}`);
if (ok === 0) process.exit(1);
