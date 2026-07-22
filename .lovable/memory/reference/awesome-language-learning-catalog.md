---
name: awesome-language-learning catalog
description: Curated OSS language-learning projects (Vuizur/awesome-language-learning) to mine for mechanics before inventing new ones. Consult this before designing a new engine.
type: reference
---
Source: https://github.com/Vuizur/awesome-language-learning

Categories the AI Agents' brain should mine (in this priority for our stack):

1. **Language Learning Games** — LibreLingo (Duolingo-clone flow), Game2Text (in-game text lookup) → mechanic ideas for VocabGamesSlot, ArcadeGame.
2. **Anki / SRS** — FSRS4Anki (optimized SM-2 successor), vocabsieve, tatoeba-to-anki → feed src/memory/ (SM-2+) and src/games/intelligence/spacedReviewPuller.ts. Consider FSRS as an upgrade path.
3. **Learning With Texts (LinQ-like)** — Lute, lwt, trunk → reader UX patterns for Story Engine / storybook viewer (click-to-lookup, known-word tracking).
4. **Frequency Lists** — wordfreq (44 langs) → deterministic distractor selection in ESL Game Studio (pick distractors within ±1 frequency band of target).
5. **Dictionary Data** — wiktextract, Ultimate Dictionary API, Proficiency → short-definition fallback for vocab cards when AI generation fails.
6. **NLP / STT / TTS** — LibreTranslate, wordnet-as-a-service → server-side helpers for grammar tagging + odd-one-out semantic reasoning.
7. **Reader Programs** — KOReader, WordDumb → simplified-definition overlay pattern for Playground reading passages.

Rules for the agent:
- Before inventing a new engine, check this catalog + Khan Exercises + KhanQuest for prior art. Cite source repo in `qa.notes`.
- Never copy code — copy the *pattern*. Our runtime is React/TS + Gemini direct only.
- For SRS math: consider FSRS4Anki over vanilla SM-2 when memory retention accuracy matters more than simplicity.
- For distractor selection: use frequency bands (wordfreq) instead of random picks — closer band = harder distractor.
