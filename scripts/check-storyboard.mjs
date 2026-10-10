// Strict storyboard check for story clips (owner, 2026-10-04: "Don't generate any videos before you're sure of the motion
// and everything. Be strict with Higgsfield. Any mistake and I don't want wasted credits.")
//
// A clip is ordered ONLY when its beat in scripts/story-videos.json passes every rule below. generate-story-video.mjs runs this
// before it uploads anything or spends a credit; `node scripts/check-storyboard.mjs <story key>` runs it by hand.
//
// Each beat must carry:
//   line           the exact words the student hears over this clip (from the lesson's story page)
//   action         ONE movement, in plain words, that IS the line (e.g. "both paws rest on top of their heads and stay there")
//   bodyWords      the target words of the line that the action must show (e.g. ["head"]); every one must appear in `action` and `prompt`
//   leader         who leads/does it, and that name must be in `prompt` (e.g. "Willow")
//   ownerApproved  true ONLY after the owner has read the written storyboard (line + action + prompt) and said yes — never set it yourself
//   seconds        <= 5 (short clips = fewer mistakes, fewer credits)
//   endImage       the approved picture of the pose the clip must END in (start + end frame: the model only fills in
//                  the motion between two pictures, so it cannot invent another action) — OR holdPose: true when the
//                  start picture already shows the action and the clip only adds a breath/blink.
//
// The prompt must describe that one action and nothing else: extra moves (dancing, waving, clapping, swinging…) are refused unless the
// line itself asks for them, and so are crowds of actions ("then", "and then", lists of moves).
import fs from 'node:fs';

const EXTRA_MOVES = ['dance', 'dancing', 'wave', 'waves', 'waving', 'clap', 'claps', 'clapping', 'swing', 'swinging', 'sway', 'sways', 'swaying', 'jump', 'jumps', 'jumping', 'spin', 'spins', 'spinning', 'run', 'runs', 'running', 'hug', 'hugs', 'bounce', 'bouncing', 'wiggle', 'wiggling', 'shake', 'shaking', 'hop', 'hopping', 'twirl'];
const SEQUENCE = /\b(then|and then|after that|next|again|repeatedly|several|many moves)\b/i;
const MAX_SECONDS = 5;
const MAX_PROMPT_WORDS = 50; // image-to-video prompts describe motion only (Kling guides: ~15-40 words); long prompts re-describe the picture

export function checkBeat(beat) {
  const errs = [];
  if (beat.loop) {
    // Game background loop: no words, but the same approval and length rules.
    if (beat.ownerApproved !== true) errs.push('the owner has not approved this loop (ownerApproved: true is set only after a written yes)');
    if (!(beat.seconds > 0 && beat.seconds <= MAX_SECONDS)) errs.push(`seconds must be 1-${MAX_SECONDS}`);
    if (beat.image && !fs.existsSync(beat.image)) errs.push(`start picture missing: ${beat.image}`);
    return errs;
  }
  const need = (k) => { if (beat[k] === undefined || beat[k] === '' || (Array.isArray(beat[k]) && !beat[k].length)) errs.push(`missing "${k}"`); };
  ['line', 'action', 'bodyWords', 'leader', 'prompt', 'image'].forEach(need);
  if (beat.ownerApproved !== true) errs.push('the owner has not approved this storyboard (ownerApproved: true is set only after a written yes)');
  const secs = beat.seconds ?? 0;
  if (!secs || secs > MAX_SECONDS) errs.push(`seconds must be 1-${MAX_SECONDS} (got ${secs || 'none'})`);
  const prompt = String(beat.prompt ?? '').toLowerCase();
  const line = String(beat.line ?? '').toLowerCase();
  const action = String(beat.action ?? '').toLowerCase();
  for (const w of beat.bodyWords ?? []) {
    const ww = String(w).toLowerCase();
    if (!line.includes(ww)) errs.push(`"${w}" is not in the line — the clip must show what the student hears`);
    if (!action.includes(ww)) errs.push(`"${w}" is not in the action`);
    if (!prompt.includes(ww)) errs.push(`"${w}" is not in the prompt`);
  }
  if (beat.leader && !prompt.includes(String(beat.leader).toLowerCase())) errs.push(`the leader "${beat.leader}" is not named in the prompt`);
  // allowedMoves: a move the owner asked to SEE although the line does not name it (owner, 2026-10-09: "everything
  // moves" — e.g. the hug at "Welcome home!"). It must also be the row's action, and the row still needs ownerApproved.
  const allowed = new Set((beat.allowedMoves ?? []).map((m) => String(m).toLowerCase()));
  for (const m of EXTRA_MOVES) {
    const re = new RegExp(`\\b${m}\\b`, 'i');
    if (allowed.has(m) && re.test(action)) continue;
    if (re.test(prompt) && !re.test(line)) errs.push(`extra move "${m}" in the prompt but not in the line`);
  }
  if (SEQUENCE.test(beat.prompt ?? '')) errs.push('the prompt chains several moves ("then/next/again…"): one clip = one action');
  if (beat.image && !fs.existsSync(beat.image)) errs.push(`start picture missing: ${beat.image}`);
  if (!beat.endImage && beat.holdPose !== true) errs.push('no endImage: give the approved picture of the final pose (start + end frame), or holdPose: true if the start picture already shows the action');
  if (beat.endImage && !fs.existsSync(beat.endImage)) errs.push(`end picture missing: ${beat.endImage}`);
  if (beat.endImage && beat.endImage === beat.image) errs.push('endImage is the same picture as image: use holdPose: true instead');
  const words = String(beat.prompt ?? '').trim().split(/\s+/).filter(Boolean).length;
  if (words > MAX_PROMPT_WORDS) errs.push(`prompt has ${words} words (max ${MAX_PROMPT_WORDS}): describe the motion only, not the picture`);
  return errs;
}

export function checkStory(story) {
  const out = [];
  for (const b of story.beats ?? []) {
    if (b.rejected) continue; // a reviewed-and-rejected clip is never re-ordered
    const errs = checkBeat(b);
    if (errs.length) out.push({ id: b.id, errs });
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const key = process.argv[2];
  const all = JSON.parse(fs.readFileSync('scripts/story-videos.json', 'utf8'));
  const story = all[key];
  if (!story) { console.error(`No story "${key}"`); process.exit(1); }
  const bad = checkStory(story);
  for (const b of story.beats) {
    const r = bad.find((x) => x.id === b.id);
    console.log(`${b.rejected ? 'REJECTED' : r ? 'NOT READY' : 'READY'}  ${b.id}  "${b.line ?? ''}"`);
    r?.errs.forEach((e) => console.log(`   - ${e}`));
  }
  process.exit(bad.length ? 1 : 0);
}
