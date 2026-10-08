# EnglEuphoria — project rules

## Hub separation (hard rule — owner, 2026-10-08)

- The **Playground, Academy and Success each own their own curriculum blueprint, lesson blueprint, skills and docs.** Never edit, import or reuse another hub's.
- Academy work lives only in `src/curriculum/academy/`, `.claude/skills/academy-*`, `docs/academy-*` (see `docs/hub-separation.md`). Do not touch the Playground, and do not read or change the legacy Academy rows in the database.

## Voice (hard rule)

- **Never use the browser's built-in text-to-speech** (`window.speechSynthesis`, `SpeechSynthesisUtterance`) for anything a student or teacher hears — not in the app, not in prototypes or mock-ups, not as a fallback. Device voices have the wrong accent and were rejected by the product owner.
- Speak through `speak()` in `src/content/playground-library/unit1/audio.ts` (recorded character voices: pre-made clips in `public/audio-cache/`, then the server-cached `elevenlabs-tts` edge function).
- If a clip can't be loaded, stay silent — never switch to another voice.
- `src/lib/noBrowserVoice.ts` (installed in `src/main.tsx`) reroutes any leftover `speechSynthesis` call to the recorded voices. Don't remove it.
- Mock-ups/artifacts that need audio must embed recorded clips (e.g. files from `public/audio-cache/`, baked with `scripts/generate-voice-cache.mjs`), never browser TTS.

## Voice quality (hard rule, all hubs)

- **No accent, accurate pronunciation.** Every voice a student or teacher hears must be a standard native American English voice, saying each word correctly.
- Policy lives in `src/lib/speechPolicy.ts` (mirrored byte-identically in `supabase/functions/_shared/speechPolicy.ts`): approved voices, `approvedVoiceId()`, `normalizeForSpeech()`, `safeVoiceSettings()`, `languageLock()`.
- Any new TTS call, edge function, catalog voice or bake script MUST use it; `voicePolicy.test.ts` (deploy gate) fails otherwise. Audit: `npx tsx scripts/generate-voice-cache.mjs --audit`. See the Voice engine in `.claude/skills/lesson-quality-gate`.

## Video generation (hard rule — it costs money and is for children)

- **Never order a generated video (Veo/Gemini, Higgsfield/Seedance, FAL) before the gate passes.** Follow `.claude/skills/video-quality-gate`: brief in `videoBriefs.ts` -> `npm run audit:video` clean -> user-approved start image -> **ONE clip only** -> frame-by-frame review with the user -> only then more clips.
- **Strict mode (owner, 2026-10-04):** no story clip is ordered until its written storyboard row (exact line → ONE matching action → prompt, ≤ 5 s) is approved by the owner in writing (`ownerApproved`); `scripts/check-storyboard.mjs` must say READY; one clip per run. Any mismatch wastes credits — be strict. Accuracy method (research 2026-10-04): each clip goes between two owner-approved Canva key pictures (`image` → `endImage`, made as edits of one base picture and overlay-checked), and every clip is screened with `scripts/review-clip.py` before the frame-by-frame review.
- Image-to-video only, calm ambient motion, cartoon cast only, silent (no speech/text), <= 8 s, conservative and child-safe. `lintVideoPrompt` in `src/lib/videoPolicy.ts` is enforced server-side; do not bypass it.
- Higgsfield credentials: only in `scripts/higgsfield/.env.local` (git-ignored), entered by the user locally. Never ask for them in chat, never read, print or commit them.
- **Games: background loops only** (owner, 2026-10-04: games should feel like an animated video game). A game may use a short, silent, calm image-to-video loop of a game picture the owner has seen (`bgVideo`, ping-ponged by `scripts/make-game-loops.py`, still picture as fallback). Never characters doing new actions, never speech or text. Everything else in a game is live UI motion (`unit1/scene-components/gameFx.tsx`).
- **Never zoom or pan a still picture** (no Ken Burns / `zoompan` / CSS scale loops on story pictures): it shakes. Stills hold still and cross-fade (`scripts/make-stills-film.py`).

## Scenario first (hard rule — owner, 2026-10-04)

- **Every video** (story film, demonstration, song video, stills film, AI clip) starts with a written scenario in `docs/scenarios/` following `.claude/skills/kids-video-scenario`: one learning goal, beats, a shot list (exact line → ONE action → camera → start/end picture → label → pause), pictures needed, cost. The owner approves it in writing before any picture is made or clip ordered. A film that teaches comes BEFORE the game that uses it.

## Demonstration pages (hard rule — owner, 2026-10-04: "way better, keep it as a skill")

- Every "watch and copy" page (body parts, actions, TPR, point-to) follows `.claude/skills/kids-demo-video`: ONE character, full body, front view, one picture per spoken line, the word added by us with a line to the exact spot (`scripts/label-video.py`), stills film first; AI motion only via strict mode with start + end key pictures.

## Lesson hand-off — every finished lesson goes to the Playground Library (hard rule — owner, 2026-10-04)

- When a lesson is built or rebuilt, before reporting it done:
  1. Its `curriculum_lessons` row (Supabase, `ai_metadata->>'hub' = 'playground'`, unit/lesson number) gets the real title (no "· Coming Soon") and `ai_metadata.contentFormat = 'lep1-rich'`, so the content-creator Playground Library shows it as **▶ Ready**. Keep `is_published = false` until the branch is merged into `main` (students must not reach a page the live site doesn't have yet).
  2. Push with `[preview]` in the commit message (one preview build of the work branch, see `scripts/vercel-ignore.sh`).
  3. Give the owner the preview links: `<preview>/playground-library` (the library) and `<preview>/playground-scene/unit-<U>-lesson-<L>` (the lesson).

## Media generators (hard rule — owner, 2026-10-04)

- **Pictures: Canva only** (Canva `generate-image`, reference images uploaded to Canva for character consistency; `remove-background` for stickers). **Never generate pictures with Higgsfield** — not backgrounds, not stickers, not "just this once".
- **Gemini is allowed for pictures too** (owner, 2026-10-06: "yes, enable Gemini for picture"): the platform's `ai-image-generation` function through `scripts/art-targets.json` + `.github/workflows/bake-art.yml`, with an approved picture as the reference for character consistency. Still never Higgsfield for pictures.
- **Videos: Higgsfield only** (story clips, game background loops — image-to-video from a Canva/approved picture).
- `scripts/generate-art.mjs` refuses the Higgsfield image path; the `higgsfield-video` edge function only allows video endpoints.
- How to get a Canva picture into the repo (holder design, export, fetch bot): `docs/canva-art-pipeline.md`.

## Vary every lesson — research, then beat the best apps (hard rule — owner, 2026-10-04)

- Every new lesson: research >= 3 benchmarks (Khan Academy Kids, Lingokids, LingoAce, VIPKid, Novakid, Duolingo ABC, Oxford, Cambridge, Wordwall...) for its skill, take the mechanic (never content), make it better, and add or upgrade >= 1 mechanic.
- Vary activities, look, scenes (settings) and themes (story frame) from the previous lesson and from the same slot of the previous unit. Follow `.claude/skills/lesson-variety-engine`; register `LESSON_PROFILE` + `RESEARCH_LOG` in `src/content/playground-library/lessonVariety.ts`. `lessonVariety.test.ts` (deploy gate) fails otherwise — fix the lesson, never the check.

## Remember? warm-up (hard rule — owner, 2026-10-07)

- Universal: Pre-A1 and the A1/A2 worlds (Welcome Town, Magic Castle, Jungle), one shared component `src/content/playground-library/RecallWarmupScene.tsx`; blueprint §3f, quality gate check.
- Every Playground lesson after the very first opens (right after the title / hello song) with ONE `recall-warmup` scene: a quick "Remember?" of the lesson before, 3-5 of its words with their pictures, Pip says each word and the child finds it — no reading.
- Vary the look: `mode: 'click'` (listen and click, three pictures) for colours and scene pictures; `mode: 'shadow'` (listen and match the shadow) only for sticker pictures with clearly different outlines.
- `recallWarmup.test.ts` (deploy gate) fails if a lesson has none. It is a routine scene, not one of the lesson's games.
