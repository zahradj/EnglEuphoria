---
name: attention-engine
description: >
  Governs how many things a learner is asked to look at, at once, inside any
  visual-learning-engine `vocab-spot`-style scene. Use together with
  visual-learning-engine whenever building or reviewing a hotspot-based
  vocabulary scene — this is the rule that keeps it from overwhelming a
  young learner by showing every hotspot simultaneously.
---

# Attention Engine

## The one rule this skill exists to enforce

**Never activate more than one hotspot at a time**, even though the full
scene (with every object the lesson will eventually teach) is visible from
the very first frame. The scene is static and complete; the *interaction*
is strictly sequential.

## Sequence

1. Show the full scene immediately — nothing is hidden or grayed out.
2. Exactly one arrow is on screen, pointing at the current word's hotspot.
3. Learner taps it → arrow's target plays audio + opens a flashcard (word,
   icon, example sentence).
4. Learner closes the flashcard → that arrow disappears, and this
   *automatically* advances to the next word — closing the flashcard is the
   only action needed, there's no separate "next" step.
5. The next arrow appears at its own hotspot. Repeat until every word in the
   scene's list has been taught.
6. Only then does the scene's own "Next" (to leave this scene) appear.

## Why this matters enough to be its own rule

`visual-learning-engine` could technically be implemented by drawing every
hotspot's arrow at once and letting the learner tap them in any order — the
data shape wouldn't need to change. But for the actual target age band
(4-10, many at Pre-A1/A1), showing 5-7 simultaneous arrows across one image
splits attention across the whole scene instead of building one word at a
time, which is worse for retention even though it "shows more content
sooner." This skill is the enforcement of "cognitive load: never introduce
more than one new vocabulary item simultaneously" as a hard interaction
constraint, not just a content-pacing guideline.

## Implementation in this codebase

`VocabSpotScene` (`welcome-town/SceneRenderer.tsx`) tracks a single `step`
index rather than a `Set` of found items — only `scene.items[step]` ever
renders an arrow or is tappable; everything before it is implicitly done,
everything after it doesn't exist yet as far as the DOM is concerned.
Closing the flashcard (`dismiss()`) both hides the card and increments
`step` in the same action — there is deliberately no separate "next" click
between finishing one word and the next arrow appearing.

## Validation

- [ ] At most one arrow/hotspot is interactive at any moment
- [ ] At most one flashcard is ever open at once
- [ ] Closing a flashcard advances automatically — no extra tap required
- [ ] Progress reads as "N of Total," not a checklist of many active items
- [ ] Teaching order matches the lesson's actual objective sequencing (check
      against `playground-curriculum-engine`), not just left-to-right
      reading order across the image
