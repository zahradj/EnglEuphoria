// Video preflight — run BEFORE paying for any generated video:  npm run audit:video
//   npm run audit:video -- --prompt "The flowers sway gently..." --image /lep1/games/x.jpg   (check one prompt)
// Exit code 1 = at least one problem: do not generate. Prints the cost estimate and the human review checklist.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VIDEO_BRIEFS } from '../src/content/playground-library/videoBriefs.ts';
import { REVIEW_CHECKLIST, VIDEO_STAGES, estimateClipCostUsd, finalVideoPrompt, lintVideoPrompt, MAX_CLIP_SECONDS } from '../src/lib/videoPolicy.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODEL = 'veo-3.0-fast-generate-001';
const args = process.argv.slice(2);
const arg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

let problems = 0;
const show = (issues) => issues.forEach((i) => console.log(`      ${i.level === 'block' ? 'BLOCK' : 'warn '} [${i.code}] ${i.message}${i.match ? ` (“${i.match}”)` : ''}`));

console.log('\n=== VIDEO PREFLIGHT ===\n');
VIDEO_STAGES.forEach((s) => console.log('  ' + s));

if (arg('--prompt')) {
  const lint = lintVideoPrompt(arg('--prompt'), { hasStartImage: !!arg('--image'), seconds: Number(arg('--seconds') || 8) });
  console.log(`\nPrompt: ${lint.ok ? 'OK to generate' : 'BLOCKED — do not generate'}`);
  show(lint.issues);
  if (lint.ok) console.log(`\nWhat the model will receive:\n  ${finalVideoPrompt(arg('--prompt'))}`);
  process.exit(lint.ok ? 0 : 1);
}

let total = 0;
for (const b of VIDEO_BRIEFS) {
  console.log(`\n• ${b.id}  [${b.lesson}]  status: ${b.status}`);
  const lint = lintVideoPrompt(b.motion, { hasStartImage: !!b.startImage, seconds: b.seconds });
  const imageOk = fs.existsSync(path.join(ROOT, 'public', b.startImage.replace(/^\//, '')));
  if (!imageOk) { console.log(`      BLOCK start image missing on disk: ${b.startImage}`); problems++; }
  if (!b.stillApproved) { console.log('      BLOCK the start image has not been approved by the user'); problems++; }
  if (!lint.ok) problems += lint.issues.filter((i) => i.level === 'block').length;
  show(lint.issues);
  const cost = estimateClipCostUsd(MODEL, b.seconds);
  total += cost;
  console.log(`      ${lint.ok && imageOk && b.stillApproved ? 'ready' : 'NOT READY (waiting for approval or fixes)'} · ${b.seconds}s (max ${MAX_CLIP_SECONDS}s) · ~$${cost.toFixed(2)} for one clip`);
}

console.log(`\nIf every brief were generated: ~$${total.toFixed(2)} (estimate; check Google's current Veo pricing). Order ONE clip first.`);
console.log('\nHuman review checklist — every clip, frame by frame, before it is used or another is ordered:');
REVIEW_CHECKLIST.forEach((c) => console.log(`  [ ] ${c.check}`));
console.log(problems ? `\n${problems} problem(s): fix them before generating.` : '\nPreflight clean. Next: order ONE clip, then review it with the checklist.');
process.exit(problems ? 1 : 0);
