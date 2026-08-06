---
name: visual-learning-engine
description: >
  Use when a lesson should teach vocabulary by pointing at labeled hotspots
  inside one reused illustrated scene, rather than a sequence of separate
  flashcard/vocab scenes. Applies whenever the user asks for vocabulary
  "shown in the scene," an "arrow pointing at" something, or a lesson that
  should feel like exploring one place instead of flipping cards. Sits
  alongside smart-lesson-architect (which still decides the lesson's overall
  activity sequence) and playground-curriculum-engine (which still decides
  whether this vocabulary belongs in this lesson at all) — this skill only
  covers the specific "one scene, many hotspots" mechanic and its data shape
  in this codebase.
---

# Visual Learning Engine

## Core principle

**Scene → Vocabulary Discovery → Flashcard → Practice → Story → Speaking →
Assessment.** The illustrated scene itself is the primary learning asset —
vocabulary lives naturally inside one master scene (a classroom, a park,
whatever the lesson's location already is) rather than being taught through
a series of disconnected flashcard scenes. Reuse that same scene across
multiple beats of the lesson (discovery, then a later review/quiz over the
same art) instead of generating a new background per activity.

## Hotspot rules

Every vocabulary item needs, at minimum:

- A unique id
- Coordinates within the scene (as CSS-percentage `left`/`top`, anchored to
  where that object/character actually sits in the art — re-check the actual
  generated image's composition before picking numbers, don't guess blind)
- An arrow/pointer marking that spot visually (a bouncing pin, not a static
  dot) so a non-reading learner can find it without instructions
- A flashcard shown on tap: the word, an icon/emoji, and ideally the actual
  object glimpsed in the art it's pointing at
- Audio of the word (and see below — the example sentence too)
- **An example sentence**, not just the bare word — "This is the teacher,"
  not only "Teacher." A bare word teaches vocabulary; a sentence also models
  the grammar pattern learners will need to actually use it.

No floating objects: everything the learner is asked to find must already
be visibly, legibly present in the scene's own illustration — this skill
never invents an invisible hotspot for something not actually drawn there.

## This codebase's implementation

Scene kind `vocab-spot` (see `welcome-town/scenes.ts` / `SceneRenderer.tsx`
for the concrete shape): one background, one teacher-facing instruction, and
an `items` array of `{ label, sentence, emoji, left, top, who? }`. Tapping an
item's pin speaks the example sentence (falling back to the audio pipeline's
generic `'teacher'` voice, or a specific `who` when the hotspot IS a
character already in the cast), reveals a flashcard, and marks that item
found; the scene completes when every item has been found. This is a
sibling of `meet` (tap-the-character-in-the-background) and `hello-doors`
(tap-to-reveal-a-badge) — same "no separate floating sprite, the background
carries the content" philosophy as the rest of this world, just generalized
to N labeled spots instead of one character or a set of doors.

## Where vocabulary choices come from

Don't invent a vocabulary list from scratch or from a generic template's
example set — a template's sample list (e.g. "school, classroom, teacher,
friend, desk, chair, book, pencil") is a *category* suggestion, not a
prescription for this specific lesson. Cross-check `playground-curriculum-
engine`'s knowledge graph first: does this word set belong in *this* lesson
slot, or does it belong to a different unit? And only pick words that are
actually, clearly drawn in the specific background you're using — don't add
a hotspot for "book" if no book is visible in that particular illustration.

## Character rules

Same correction as `playground-curriculum-engine`: any reference document's
"core cast" is only as good as whether it matches this project's *actual*
cast. Verify names/roles against `src/content/playground-library/*/scenes.ts`
before writing a hotspot's `who` field or a flashcard's speaker — don't
carry over a generic template's character names unchecked.

## Quality checklist

- [ ] One coherent scene, reused rather than regenerated per hotspot
- [ ] Every hotspot's word is actually, visibly present in that scene's art
- [ ] No floating objects — nothing pointed at that isn't drawn in the scene
- [ ] Objective alignment — checked against the curriculum engine, not assumed
- [ ] Every hotspot has a flashcard, audio, and an example sentence, not just
      the bare word
- [ ] The scene supports listening (audio on tap) and can support a later
      review beat reusing the same art
