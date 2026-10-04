# EnglEuphoria — project rules

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
- Image-to-video only, calm ambient motion, cartoon cast only, silent (no speech/text), <= 8 s, conservative and child-safe. `lintVideoPrompt` in `src/lib/videoPolicy.ts` is enforced server-side; do not bypass it.
- Higgsfield credentials: only in `scripts/higgsfield/.env.local` (git-ignored), entered by the user locally. Never ask for them in chat, never read, print or commit them.
- **Games: background loops only** (owner, 2026-10-04: games should feel like an animated video game). A game may use a short, silent, calm image-to-video loop of a game picture the owner has seen (`bgVideo`, ping-ponged by `scripts/make-game-loops.py`, still picture as fallback). Never characters doing new actions, never speech or text. Everything else in a game is live UI motion (`unit1/scene-components/gameFx.tsx`).
- **Never zoom or pan a still picture** (no Ken Burns / `zoompan` / CSS scale loops on story pictures): it shakes. Stills hold still and cross-fade (`scripts/make-stills-film.py`).
