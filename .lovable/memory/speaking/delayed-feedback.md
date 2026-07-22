---
name: Delayed-Feedback Protocol for Speaking Missions
description: Cycle 5 TBLT/ESA Activate-phase rule — speaking errors are silently buffered (never interrupt the student) and surfaced as targeted grammar_sort / sentence_builder / substitution_drill in the next Study slide.
type: feature
---

# Delayed-Feedback Protocol (Cycle 5)

Code: `src/speaking-cycle5/delayedFeedback.ts`.

- API: `bufferError({ sessionId, studentId, utterance, expected, kind, rule?, vocabKey?, ts })`, `drainErrorsForStudyPhase(sessionId)`, `peekErrors`, `recommendRemediationActivity`.
- Persistence: each buffered error is also written to `mistake_repository` with `surface_at='study_phase'` (best-effort).
- Recommendation map:
  - ≥2 tense errors → `substitution_drill`
  - ≥2 word-order errors → `sentence_builder`
  - ≥1 grammar error → `grammar_sort`
  - else default `sentence_builder`
- UI rule: during a 🚀 Speaking Mission, the renderer MUST NOT surface real-time corrections. Pip shows a calm "I'm listening" indicator only.
- Locked `src/speaking/**` engine is untouched.
