---
name: lesson-quality-gate
description: >
  REQUIRED final pass before presenting any Playground lesson as done —
  whether newly built or edited. Runs four specialized checks in sequence
  (Semantic, Pedagogical, Visual, Narrative) and only signs off when all four
  pass. Use this any time a lesson's scene array has been created or
  modified, right before telling the user the lesson is ready — it is the
  review layer, not a content generator.
---

# Lesson Quality Gate

## Purpose

Four specialized engines, one review pass. Each engine owns a distinct
failure mode; none of them substitutes for the others, and running only one
or two gives false confidence. This skill's job is to actually run all four
against the lesson's real, current scene array and art — not to assume they
already pass because the content "looks reasonable."

> Meaning always comes before interaction. A lesson must never ship an
> activity, story, illustration, or assessment unless it is semantically
> correct first — pedagogy, mechanics, and continuity are built on top of
> that foundation, not instead of it.

## The four engines

| # | Engine | Owns | Skill |
|---|---|---|---|
| 1 | **Semantic** | Does the data (label/sentence/`who`/coordinates) match what the art actually shows, scene by scene? | `semantic-learning-engine` |
| 2 | **Pedagogical** | Is the teaching effective — objective alignment, activity choice by purpose, difficulty progression, anti-duplication? | `smart-lesson-architect` (+ `playground-curriculum-engine` for whether the content belongs in this lesson slot at all) |
| 3 | **Visual** | Are hotspots/arrows/flashcards mechanically correct — one at a time, full flashcard+audio+sentence, no floating objects? | `visual-learning-engine` + `attention-engine` |
| 4 | **Narrative** | Does the sequence of scenes, taken together, tell one consistent story with real setting variety and stable character roles? | `narrative-engine` |

Run them in this order. Each later engine assumes the earlier ones already
passed — don't skip ahead. If an earlier engine fails, fix it and re-run
from that point; a downstream engine's pass/fail is meaningless if the
upstream data it's reading is already wrong.

## Procedure

1. **Re-open every background image the lesson actually references** — not
   from memory of the generation prompt, from the current file on disk.
   This is the single most-skipped step and the direct cause of the
   read/sleep-mismatch bug this whole quality layer was built in response
   to.
2. **Semantic pass**: for every scene with a `who`, `sentence`, `label`, or
   hotspot coordinates, verify against the re-opened art. Fix mismatches by
   deciding which side (data or art) is actually right for the lesson's
   intent, then correcting the other.
3. **Pedagogical pass**: confirm objective, activity purpose, progression,
   and anti-duplication per `smart-lesson-architect`'s own checklist. Confirm
   the content belongs in this lesson's slot per `playground-curriculum-
   engine` (no orphan topics grafted on).
4. **Visual pass**: for every `vocab-spot`/hotspot-style scene, confirm the
   attention-engine's one-hotspot-at-a-time rule and the visual-learning-
   engine's flashcard/audio/sentence completeness.
5. **Narrative pass**: step back from individual scenes and read the full
   scene array top to bottom as a learner would experience it. Check setting
   variety, event order, character-role stability, and (if the lesson is
   framed as standalone) that it isn't defaulting to a different lesson's
   world out of convenience.
6. Only after all four pass, present the lesson as ready. If you had to fix
   anything, say what you found and what you changed — don't silently patch
   and move on, since the same failure mode (unreviewed drift between data
   and art) is exactly what let the bug happen in the first place.

## When to run this

- Every time a lesson's scene array is created from scratch.
- Every time an existing lesson's scenes, backgrounds, or vocabulary are
  edited — even a "small" wording change can silently break a semantic match
  that used to hold.
- Whenever a user reports a lesson "doesn't make sense" or "feels off" —
  that symptom almost always means one of these four checks was skipped,
  not that the lesson needs more content.

## Anti-pattern this exists to prevent

Treating "I wrote a plausible-sounding sentence and picked a background that
seemed thematically close enough" as equivalent to verifying the two
actually agree. Plausible and verified are different things; this gate only
accepts verified.
