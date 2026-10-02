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
