# Twister Lab (Academy game) — design note

Owner request (2026-10-10): a tongue-twister game with recordings and spelling correction, **no AI, everything registered, nothing live**.

## What "registered, not live" means here
- Every twister, chunk, tip and spelling tip is data in `src/academy-games/twisterLab/twisterData.ts`.
- Every spoken line is a pre-baked static clip (`public/audio-cache/`, two approved American voices: `teacher`, `leo`). `twisterData.test.ts` fails if any line has no clip on disk. If a clip is missing the game stays silent.
- No speech recognition, no scoring of the student's voice, no AI. The student's recordings live only in the browser tab (`useRecorder`), are played back there and are revoked on close. A test checks nothing is fetched.
- Spelling correction is a fixed algorithm (`spellCheck.ts`): word alignment by dynamic programming, then per-word status ok / spelling (with the letters to fix marked) / wrong word / missing, plus extra words. Same input, same answer.

## Method (classic tongue-twister teaching)
1. Hear it in chunks and at speed, with the trained sound highlighted and one mouth tip.
2. Build it from chunks (chunking lowers load before speed).
3. Write it from memory and fix the spelling (retrieval, then immediate correction).
4. Say it slowly, at a normal pace, then faster; compare with the model by ear. Clear beats fast.

Stars come from slips in steps 2 and 3 only; speaking is never graded.
