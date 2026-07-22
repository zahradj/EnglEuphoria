---
name: Cambridge YLE Alignment + Phonics Pseudowords
description: Cycle 5 read-only overlay mapping CEFR Pre-A1/A1/A2 to Cambridge Starters/Movers/Flyers can-do statements with a 1–5 shield reward (YleShieldBadge); phonics pseudoword catalog for decoding-only probes that mirror the Phonics Screening Check.
type: feature
---

# Cambridge YLE Alignment + Phonics Pseudowords (Cycle 5)

Code: `src/curriculum-standards/cambridgeYLE.ts`, `src/curriculum-standards/phonicsPseudowords.ts`, `src/components/playground/YleShieldBadge.tsx`.

- CEFR → YLE map: Pre-A1=Starters, A1=Movers, A2=Flyers. (No C1+ mapping — Cambridge YLE stops at Flyers.)
- Skills per exam: `Listening`, `Speaking`, `ReadingWriting` — each with a binding can-do statement and a 1–5 shield target.
- Shields: `masteryToShields(0..100) → 0..5`; rendered by `YleShieldBadge` on the Playground dashboard and parent report.
- Phonics pseudowords (`PHONICS_PSEUDOWORDS`): pattern-keyed legal nonsense words (e.g. `silent_e → vope, mide`) plus real distractors. `buildDecodingProbe(pattern)` returns a deterministic 3-item probe (2 pseudowords + 1 real word) for use in Playground phonics activity wrappers.
- Overlay is READ-ONLY — does not mutate locked phonics or curriculum engines.
