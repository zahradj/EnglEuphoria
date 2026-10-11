#!/usr/bin/env node
/**
 * Academy cast idle clips, Higgsfield API (owner, 2026-10-11: "API"). Academy-only; the Playground story script is untouched.
 *
 *   node scripts/academy-clip.mjs vee-idle            # dry run: checks the gate, prints the request, spends nothing
 *   node --env-file=scripts/higgsfield/.env.local scripts/academy-clip.mjs vee-idle --go
 *
 * Credentials: HF_CREDENTIALS="key-id:key-secret" in scripts/higgsfield/.env.local (git-ignored, entered by the owner locally;
 * never printed). STRICT MODE (CLAUDE.md "Video generation"): refuses unless the beat's `ownerApproved` is true, <= 5 s, start picture
 * exists; ONE clip per run; the clip is reviewed frame by frame with the owner before any other.
 * NOTE: written without a key, so the model id and the input shape are UNVERIFIED; the dry run prints exactly what will be sent
 * and the first --go run is the test. If the API rejects the shape, fix `model` / `input` below (nothing is billed for a rejected request).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { checkStory } from './check-storyboard.mjs';

const key = process.argv[2];
const go = process.argv.includes('--go');
const all = JSON.parse(fs.readFileSync('scripts/academy-clips.json', 'utf8'));
const clip = all[key];
if (!clip) { console.error(`No clip "${key}" in scripts/academy-clips.json`); process.exit(1); }
const beat = clip.beats[0];

const bad = checkStory({ beats: [beat] });
if (bad.length) {
  console.error('STRICT MODE: refusing to generate.');
  bad.forEach((b) => b.errs.forEach((e) => console.error(`  ${b.id}: ${e}`)));
  process.exit(1);
}
const file = path.join(clip.out, `${beat.id}.mp4`);
if (fs.existsSync(file)) { console.log(`${file} already exists; review it before ordering another.`); process.exit(0); }

const prompt = `${beat.prompt} ${clip.style}`.trim();
const input = { prompt, negative_prompt: clip.negative, duration: beat.seconds, image_url: '<uploaded start picture url>' };
console.log(`Model: ${clip.model}\nStart picture: ${beat.image}\nRequest input: ${JSON.stringify(input, null, 2)}`);
if (!go) { console.log('\nDRY RUN: nothing was uploaded or ordered. Add --go to order ONE clip.'); process.exit(0); }

const credentials = process.env.HF_CREDENTIALS;
if (!credentials || !credentials.includes(':')) { console.error('HF_CREDENTIALS missing (key-id:key-secret in scripts/higgsfield/.env.local).'); process.exit(2); }
const require = createRequire(path.resolve('scripts/higgsfield/package.json'));
const { config, higgsfield } = await import(require.resolve('@higgsfield/client/v2'));
config({ credentials });
const { HiggsfieldClient } = await import(require.resolve('@higgsfield/client'));
void HiggsfieldClient;
const bytes = fs.readFileSync(beat.image);
const uploader = new (await import(require.resolve('@higgsfield/client'))).HiggsfieldClient({ credentials });
input.image_url = await uploader.uploadImage(bytes, 'webp');
const result = await higgsfield.subscribe(clip.model, { input, withPolling: true });
const url = result.video?.url;
if (String(result.status) !== 'completed' || !url) { console.error(`Not completed: status ${result.status}`); process.exit(1); }
fs.mkdirSync(clip.out, { recursive: true });
fs.writeFileSync(file, Buffer.from(await (await fetch(url)).arrayBuffer()));
console.log(`Saved ${file}. Review it frame by frame with the owner (video-quality-gate) before ordering another.`);
