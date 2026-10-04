---
name: video-quality-gate
description: >
  REQUIRED before ordering ANY generated video (Gemini Veo, Higgsfield Seedance, FAL) for EnglEuphoria lessons or games.
  Lessons get the full gate; games only short silent ambient background loops (owner, 2026-10-04). A paid-generation gate: brief -> preflight -> approved still -> ONE clip -> frame-by-frame human review -> the rest.
  Covers child safety (conservative, ages 4-12), anatomy/visual-error prevention (hands, faces, limbs, text, flicker),
  silent audio, and a cost guard. Use whenever the user asks for a video, a promo, an animated clip, or a "Gemini/Higgsfield video".
---

# Video Quality Gate

The product owner's rules: **no money wasted, no mistakes (body parts, visuals), always conservative and safe for children.**
Video is expensive and unforgiving, so we prevent errors *before* generating instead of fixing them after.

**Scope: lesson videos** (short silent intro/atmosphere clips and Lesson-5 story films). **Games** (owner, 2026-10-04: "I need like an
animation video game — the games are very flat"): only a short, silent, calm **background loop** of a game picture the owner has seen
(`bgVideo`; `scripts/make-game-loops.py` ping-pongs it; the still stays as fallback). No new character actions, no speech, no text; all
other game motion is live UI (`gameFx.tsx`). Same child-safety and cost rules: one clip first, look at it before ordering more.

## Why these rules (research summary)

- **Image-to-video beats text-to-video.** The approved still is the first frame, so the subject, style and colours are fixed;
  the prompt only describes *motion*. Re-describing the picture confuses the model (Google's Veo best practices; Veo 3.x guides).
- **Where AI video fails:** hands and fingers (extra digits), faces (morphing, odd teeth), duplicated limbs/heads, floating objects,
  background collapse, garbled on-screen text, reflections, crowds, fast or complex motion. Hands float without "points of contact".
  So: calm ambient motion, one or two cartoon subjects, no close-ups, no text, characters mostly still.
- **Children's content risk is real:** AI video is less coherent than filmed video and can slip in unsettling or inappropriate details.
  Every clip gets a human review against a fixed checklist; nothing is auto-published.
- **Negative prompts and a calm camera help** (`NEGATIVE_PROMPT`, `SAFE_SUFFIX`); short clips (<= 8 s) have fewer artifacts and cost less.

## STRICT MODE for story clips (owner, 2026-10-04 — "be strict with Higgsfield; any mistake and I don't want wasted credits")

The first U4L1 clip was rejected: it danced and waved, never showed "shoulders", and the coach did not lead — the picture did not
match the words. So, for every story clip, before ANY credit is spent:
1. **Write the storyboard row** in `scripts/story-videos.json`: `line` (exact words the student hears over the clip), `bodyWords`
   (the target words the clip must show), ONE `action` that is the line, `leader`, `prompt` (that one action only — no dancing,
   waving, clapping, swaying… unless the line says it; no "then/next/again" chains), `seconds` ≤ 5, start picture the owner has seen.
2. **Show the owner the written rows** (line → action → prompt, start picture). `ownerApproved: true` is set ONLY after the owner's
   written yes for that row — never by Claude on its own.
3. `node scripts/check-storyboard.mjs <story>` must say READY. `generate-story-video.mjs` runs the same check and **refuses** to
   upload or pay otherwise, and makes **one new clip per run** (`--beats=<id>`).
4. Review the clip frame by frame against its line; mismatch = `rejected: true` + a `review` note (never re-ordered as is).



1. **Brief** — add an entry to `src/content/playground-library/videoBriefs.ts`: one learning purpose, one approved start image
   (an existing LESSON background the user has seen, e.g. `public/lep1/scenes/`), `motion` only (sparkles, sway, drifting clouds, gentle camera push), <= 8 s.
2. **Preflight** — `npm run audit:video` (or `-- --prompt "..." --image /path.jpg`). Must show **no BLOCK issues**. Read every `warn`
   (hands, close-up, crowd, fast motion, reflection, face detail) and either rewrite the motion or accept it knowingly.
   It also prints the cost estimate (check Google's / Higgsfield's current pricing; `VEO_USD_PER_SECOND` is an estimate).
3. **Still approved** — the user has seen the start image (`stillApproved: true`). Never animate art the user hasn't seen.
4. **ONE clip** — order a single clip of the first `ready` brief. Never batch before the first clip is reviewed.
5. **Human review** — go through `REVIEW_CHECKLIST` (`src/lib/videoPolicy.ts`) **frame by frame, with the user**: hands, faces, bodies,
   identity, objects, background, text, motion, audio, age-appropriateness, teaching accuracy, modesty. One failed item = reject and
   fix the brief (do not just re-roll: re-rolling burns money).
6. **Then the rest** — one brief at a time, each reviewed. Only the user sets a brief to `clip-approved`.

## ACCURACY METHOD — keyframes, not words (research 2026-10-04, owner: "accurate without any mistakes")

Why the first two U4L1 clips failed: the model got ONE picture plus words and had to invent the action, so it improvised
(dancing, waving, paws beside the head). Research (Kling/Higgsfield guides, AI-video QA guides, children's-media research) says:
control the motion with **pictures at both ends**, keep prompts to motion only, and screen every clip with numbers before eyes.

1. **Key pictures first (Canva, free).** For every line, the pose the line names is a Canva picture the owner approves.
   Make them as a CHAIN OF EDITS of one base picture ("keep everything identical, only move the paws to …", reference = the
   previous key picture). Same framing, light, characters, spots on the floor; only the moving body parts differ.
   **Precision and camera angle (owner, 2026-10-04: "precision and angles are very important, especially for kids").**
   Every key picture of one story uses the SAME camera: front view, child's eye level, whole bodies including feet in frame,
   no tilt, no close-up, no camera move inside a clip ("the camera stays steady"). Choose the angle that SHOWS the target body
   part: the paw must visibly TOUCH it (contact, not hovering near it), seen from the front, never hidden behind another
   character or cropped by the frame. Each character keeps exactly two arms/two legs, the same props (scarf, bow, whistle)
   and the same floor spot in every key picture. A key picture that fails any of this is remade before approval.
   **One character per clip, framed for copying (owner, 2026-10-04: "one character at a time … zoomed in so we can see the
   character full body, and the student will follow").** A demonstration clip shows ONE character, centred, front view, whole
   body from head to feet filling ~3/4 of the frame height with a little floor below — close enough to see every paw and
   joint, never cropped. Group shots only as still pictures. Pick a character whose anatomy matches the words (a lion or fox
   for shoulders/knees/toes, not a bird with wings). Fewer characters = fewer paws and faces for the model to get wrong.
2. **Overlay check (free).** Blend each pair 50/50 (start/end). Anything doubled except the moving paws/bodies = the model will
   slide or morph it → remake the picture before any credit is spent. A character missing from one picture = remake.
3. **Start + END frame clip.** `image` = pose before the line, `endImage` = pose the line names (Kling 2.5 Turbo Pro
   `tail_image_url`). The model only fills in the motion between two approved pictures, so it cannot invent another action.
   Chain the song: neutral → head → shoulders → knees → toes; the end picture of one clip is the start picture of the next,
   so the clips join into one take. (`holdPose: true` instead of `endImage` only when the start picture already shows the
   action and the clip adds just a breath/blink.)
4. **Prompt = motion only**, ≤ 50 words (guides: 15–40): who moves, what moves, where it ends, "nobody moves their feet",
   "the camera stays steady". Never re-describe the picture. No smiles/faces words (faces drift), no "then" chains.
   The default negative prompt lists the known failures: extra/missing limbs, extra/fused fingers, morphing, flicker,
   dancing, waving, walking, jumping, camera shake, zoom, extra or missing characters.
5. **Calm pacing for 4–7-year-olds.** Slow, continuous movement, no cuts inside a clip, ≤ 5 s (fast-paced video measurably
   hurts preschoolers' attention/executive function; slow-paced does not — systematic review, BMC Psychology 2024).
6. **Screen with numbers, then review by eye.** `python3 scripts/review-clip.py <story> <beat>` writes a contact sheet
   (start picture, a frame every 0.25 s, end picture, motion strip) and flags: START MATCH (did it start from our picture),
   POSE (measured only where start and end pictures differ — did it reach the pose the line names), MOTION (too much
   movement = dancing/marching), SPIKES (a jump/morph/new limb at that moment). Tested on the rejected 02-head: POSE 0.43
   and MOTION 10.7 → both flagged. Then a person checks every frame (QA guides: step at 0.25×, find the FIRST bad frame,
   count fingers/paws per character, ears, eyes, scarf/bow/whistle still there, nobody added or lost) — and watches once
   at normal speed.
7. **One clip, one review, then the next** (unchanged). A clip that fails is `rejected` with a note; fix the PICTURES or
   prompt before the next try — never re-roll the same request.

`check-storyboard.mjs` enforces 3–4 (endImage or holdPose, both pictures exist, ≤ 50 words); `generate-story-video.mjs` sends
`tail_image_url`, stops if the free estimate is refused, and uses the anatomy negative prompt.

Sources: Kling 2.5 Turbo prompt guides (veed.io/learn/kling-2-5-turbo-prompts, atlabs.ai, app.klingai.com image-to-video guide),
Higgsfield on Kling start/end frames (higgsfield.ai/blog/Kling-2.6-Technical-Overview…), Kling API `tail_image_url` / `cfg_scale`
(fal.ai Kling API docs, docs.comfy.org Kling node), start/end-frame guides (dreamina.capcut.com, morphic.com keyframes),
artifact QA (lollipop.im/blog/fixing-ai-video-artifacts, kling.ai/blog/fix-ai-video-drift-consistency-guide,
aeliavision.com/bad-anatomy-guide), preschool pacing (BMC Psychology 2024 systematic review, PMC11044375),
kids' AI video practice (carlaeng.substack.com: one subject, one clear action per scene; PedaCo dual gatekeeping, arXiv 2608.19812;
YouTube Kids quality principles).

## Hard content rules (enforced by `lintVideoPrompt`, mirrored server-side)

Blocked: violence, injury/pain/crying, fear/darkness/monsters, death, romance/kissing, alcohol/smoking/drugs/gambling,
photorealistic or real people/children (cartoon only), religion/politics, other people's characters and brands,
speech/singing, on-screen text, text-only video (no start image), prompts < 40 or > 700 chars, clips > 8 s.
Characters: our own cartoon cast only, modest and friendly. Culturally conservative by default.

## Sound (decided 2026-10-03)

The owner allows ElevenLabs or Gemini voice for sound. Generated clips stay silent (`generate_audio:false` / negative prompt); any
narration or sound is added afterwards. **Speech must use ElevenLabs through `speechPolicy.ts`** (approved no-accent American voices,
baked clips, `npm run audit:voice`). Gemini TTS voices cannot be checked against the accent policy, so do not use them for speech
unless the owner listens and approves each voice first; Gemini/ElevenLabs may be used for non-speech sound (soft music, ambience).

## Silent video (voice policy)

Every voice a student hears is a recorded, no-accent American voice (see the Voice engine in `lesson-quality-gate`). Generated video is
therefore **silent apart from soft music** — the prompt, negative prompt and review checklist all enforce it. Narration, if wanted,
is added afterwards from the recorded clips.

## Where the gate lives

- `src/lib/videoPolicy.ts` (mirrored to `supabase/functions/_shared/videoPolicy.ts`): lint, final prompt, cost, review checklist.
- `generate-playground-video` edge function runs the lint **before** it contacts Veo/FAL; a blocked prompt returns HTTP 422 and costs nothing.
- `src/content/playground-library/videoPolicy.test.ts` (deploy gate) lints every brief, checks the start image exists, enforces the mirror and "gate runs first".
- Providers: `generate-playground-video` takes `provider`: `gemini` (Veo, default), `higgsfield` (Seedance 2.5 image-to-video, silent: `generate_audio:false`) or `fal`. Keys live in Supabase secrets (`GEMINI_API_KEY`; Higgsfield `HF_CREDENTIALS` as `key-id:key-secret` — other names are tried, see `_shared/higgsfieldClient.ts`). All go through the same gate.
- Admin page `/admin/video-briefs` (src/pages/admin/VideoBriefs.tsx): shows each brief's preflight + cost + checklist and orders ONE clip with Higgsfield; disabled unless the brief is `ready` and has no clip yet.
- Local Higgsfield / Seedance example: `scripts/higgsfield/` — it must go through steps 1-5 as well (same briefs, same lint, one clip first).

## Anti-patterns

Generating "to see what happens"; batching clips before the first is reviewed; re-rolling a bad clip without changing the brief;
text-only prompts; prompts that re-describe the still; hands/crowds/close-ups; any speech or on-screen words; skipping the checklist
because the clip "looks fine" at a glance.
