---
name: video-quality-gate
description: >
  REQUIRED before ordering ANY generated video (Gemini Veo, Higgsfield Seedance, FAL) for EnglEuphoria lessons or games.
  FOR LESSONS ONLY (never games). A paid-generation gate: brief -> preflight -> approved still -> ONE clip -> frame-by-frame human review -> the rest.
  Covers child safety (conservative, ages 4-12), anatomy/visual-error prevention (hands, faces, limbs, text, flicker),
  silent audio, and a cost guard. Use whenever the user asks for a video, a promo, an animated clip, or a "Gemini/Higgsfield video".
---

# Video Quality Gate

The product owner's rules: **no money wasted, no mistakes (body parts, visuals), always conservative and safe for children.**
Video is expensive and unforgiving, so we prevent errors *before* generating instead of fixing them after.

**Scope: lesson videos only** (short silent intro/atmosphere clips that open a lesson). **Never generate video for games** — the owner
decided games stay interactive and un-animated by video.

## Why these rules (research summary)

- **Image-to-video beats text-to-video.** The approved still is the first frame, so the subject, style and colours are fixed;
  the prompt only describes *motion*. Re-describing the picture confuses the model (Google's Veo best practices; Veo 3.x guides).
- **Where AI video fails:** hands and fingers (extra digits), faces (morphing, odd teeth), duplicated limbs/heads, floating objects,
  background collapse, garbled on-screen text, reflections, crowds, fast or complex motion. Hands float without "points of contact".
  So: calm ambient motion, one or two cartoon subjects, no close-ups, no text, characters mostly still.
- **Children's content risk is real:** AI video is less coherent than filmed video and can slip in unsettling or inappropriate details.
  Every clip gets a human review against a fixed checklist; nothing is auto-published.
- **Negative prompts and a calm camera help** (`NEGATIVE_PROMPT`, `SAFE_SUFFIX`); short clips (<= 8 s) have fewer artifacts and cost less.

## The pipeline (each stage is a gate — do not skip, do not batch)

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

## Hard content rules (enforced by `lintVideoPrompt`, mirrored server-side)

Blocked: violence, injury/pain/crying, fear/darkness/monsters, death, romance/kissing, alcohol/smoking/drugs/gambling,
photorealistic or real people/children (cartoon only), religion/politics, other people's characters and brands,
speech/singing, on-screen text, text-only video (no start image), prompts < 40 or > 700 chars, clips > 8 s.
Characters: our own cartoon cast only, modest and friendly. Culturally conservative by default.

## Silent video (voice policy)

Every voice a student hears is a recorded, no-accent American voice (see the Voice engine in `lesson-quality-gate`). Generated video is
therefore **silent apart from soft music** — the prompt, negative prompt and review checklist all enforce it. Narration, if wanted,
is added afterwards from the recorded clips.

## Where the gate lives

- `src/lib/videoPolicy.ts` (mirrored to `supabase/functions/_shared/videoPolicy.ts`): lint, final prompt, cost, review checklist.
- `generate-playground-video` edge function runs the lint **before** it contacts Veo/FAL; a blocked prompt returns HTTP 422 and costs nothing.
- `src/content/playground-library/videoPolicy.test.ts` (deploy gate) lints every brief, checks the start image exists, enforces the mirror and "gate runs first".
- Providers: `generate-playground-video` takes `provider`: `gemini` (Veo, default), `higgsfield` (Seedance 2.5 image-to-video, silent: `generate_audio:false`) or `fal`. Keys live in Supabase secrets (`GEMINI_API_KEY`; Higgsfield `HF_CREDENTIALS` as `key-id:key-secret` — other names are tried, see `_shared/higgsfieldClient.ts`). All go through the same gate.
- Local Higgsfield / Seedance example: `scripts/higgsfield/` — it must go through steps 1-5 as well (same briefs, same lint, one clip first).

## Anti-patterns

Generating "to see what happens"; batching clips before the first is reviewed; re-rolling a bad clip without changing the brief;
text-only prompts; prompts that re-describe the still; hands/crowds/close-ups; any speech or on-screen words; skipping the checklist
because the clip "looks fine" at a glance.
