---
name: lesson-quality-gate
description: >
  REQUIRED final pass before presenting any Playground lesson as done —
  whether newly built or edited. Runs five specialized checks in sequence
  (Semantic, Pedagogical, Visual, Narrative, Student comfort, Voice) and only signs off when all six
  pass. Use this any time a lesson's scene array has been created or
  modified, right before telling the user the lesson is ready — it is the
  review layer, not a content generator.
---

# Lesson Quality Gate

## Purpose

Six specialized engines, one review pass. Each engine owns a distinct
failure mode; none of them substitutes for the others, and running only one
or two gives false confidence. This skill's job is to actually run all six
against the lesson's real, current scene array and art — not to assume they
already pass because the content "looks reasonable."

> Meaning always comes before interaction. A lesson must never ship an
> activity, story, illustration, or assessment unless it is semantically
> correct first — pedagogy, mechanics, and continuity are built on top of
> that foundation, not instead of it.

## The six engines

| # | Engine | Owns | Skill |
|---|---|---|---|
| 1 | **Semantic** | Does the data (label/sentence/`who`/coordinates) match what the art actually shows, scene by scene? | `semantic-learning-engine` |
| 2 | **Pedagogical** | Is the teaching effective — objective alignment, activity choice by purpose, difficulty progression, anti-duplication? | `smart-lesson-architect` (+ `playground-curriculum-engine` for whether the content belongs in this lesson slot at all) |
| 3 | **Visual** | Are hotspots/arrows/flashcards mechanically correct — one at a time, full flashcard+audio+sentence, no floating objects? | `visual-learning-engine` + `attention-engine` |
| 4 | **Narrative** | Does the sequence of scenes, taken together, tell one consistent story with real setting variety and stable character roles? | `narrative-engine` |
| 5 | **Student comfort** (top priority — the user's standing rule) | Can a student SEE every word, REACH every control and ENJOY the interaction on a normal laptop AND a phone, without scrolling to find a button, squinting, or guessing what to do? | this file, section below + `scripts/academy-comfort-audit.mjs` |
| 6 | **Voice** (standing rule: no accent, accurate pronunciation) | Does every recorded or synthesized line sound like a standard native American English speaker and say each word correctly? | this file, section below + `src/lib/speechPolicy.ts`, `voicePolicy.test.ts`, `generate-voice-cache.mjs --audit` |

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
   **Spin Wheel scenes (`spin-wheel`, or any slide whose teacher note says
   to use the classroom spinner):**
   - *Semantic:* badge `n` sits on the picture whose word is `items[n-1].label`
     — re-open the art and check every number, not a sample. Numbers are
     1..N with no gaps or repeats (the wheel is numbered 1..N).
   - *Pedagogical:* 2-8 items (4-6 ideal), all already modelled earlier in
     the lesson; used as review/production, never first exposure; not
     adjacent to another `spin-wheel`. The `teacher` note tells the teacher
     to have the student spin and say the word, and offers the no-spinner
     alternative.
   - *Visual:* the wheel (`wheelAt`, default centre, ~36% of the height)
     covers no badge and no picture; badges don't overlap each other or the
     "Spin!" banner; `emoji`/`img` only for pictures NOT already in the art.
   **Picture ↔ word match scenes (`picture-match`):**
   - *Semantic:* every `word` is exactly what its picture shows (re-open
     each `img`); words are unique; spelling matches how the lesson taught it.
   - *Pedagogical:* 2-8 items (4-6 ideal), all taught earlier in the lesson;
     `studentOnly: true` only when the teacher note really describes an
     independent self-check.
   - *Visual:* pictures read clearly at card size (no tiny or cropped art);
     the longest word fits its tile/slot without wrapping awkwardly.
5. **Narrative pass**: step back from individual scenes and read the full
   scene array top to bottom as a learner would experience it. Check setting
   variety, event order, character-role stability, and (if the lesson is
   framed as standalone) that it isn't defaulting to a different lesson's
   world out of convenience.
6. Only after all five pass, present the lesson as ready. If you had to fix
   anything, say what you found and what you changed — don't silently patch
   and move on, since the same failure mode (unreviewed drift between data
   and art) is exactly what let the bug happen in the first place.

## Engine 5 — Student comfort (the student is the priority)

The product owner's standing instruction: *prioritize the student's comfort — seeing the content well and
interacting with it well.* A lesson whose data is correct, well taught and well illustrated still FAILS if a
student cannot read it or cannot reach a control. Run this engine on the **rendered** lesson, never on the data.

**How to run it (Academy / `academy-v2` lessons):**

```bash
node scripts/academy-comfort-audit.mjs <lessonId> both
```

It plays every slide in real headless Chrome at 1280×720 and 390×844, saves a screenshot per slide and lists
`under-nav` / `offscreen-x` / `clipped` / `page-h-scroll` (BLOCKING) plus `small-target` / `needs-scroll` (notes).
Then LOOK at the screenshots (build a contact sheet) — the script cannot judge contrast or art.
Do NOT audit through the in-app preview pane when the session is not on screen: the pane is throttled, framer-motion
exit animations never finish, and you end up measuring the previous slide (this fooled the first audit of
Academy B1 U1 L1 — every slide "reported" the cover).

**Checklist (all must hold on laptop AND phone):**
1. **Legibility.** Body text ≥ 16px (18px for reading passages), dark-on-light or light-on-dark with ≥ 4.5:1
   contrast. Text never sits directly on a busy illustration — it lives in an opaque, themed frame (parchment
   "journal" card, solid cream/green board). Decorative micro-labels may be 11–12px; instructions never.
2. **Nothing hidden.** No control under the fixed Back/Next bar, none off-screen, nothing clipped, no sideways
   scroll. A control must never be reachable *only* by scrolling the card (this hid vocab cards 2–4 once).
3. **Comfortable targets.** Every tappable control ≥ 40px high (44px on touch); drop slots and draggable tiles
   big enough to hit; Reset/Hint buttons clearly visible but never overlapping a tile.
4. **Fits the stage.** Prefer content that fits the card without scrolling; if it must scroll, the scroll is
   inside a visible card and the primary action stays visible. Keep canvas boards inside the middle ~90%.
5. **Clear, calm instructions.** One short imperative per slide ("Drag each tool to the problem it solves."),
   audio for it, a hint/skip path, no timer pressure on first exposure, forgiving wrong-answer feedback.
6. **Real interaction, not just reading.** Each block has something to grab, tap, drag, build or say; games have a
   visible success state; every drag/tap activity was actually operated (drag, click, type) in the test.
7. **Frames & contrast of themed UI.** Themed frames (here: jungle parchment / moss-green) must keep text dark on
   light. The dark page theme must never reach a component that assumes light text colours (dark-on-dark
   grammar rows were invisible until `PlayAcademyLesson` wrapped card-less slide types in a light frame).

8. **It must feel like a GAME, not a slideshow** (the user's words: "a very lame PPT. Not like a game"). Screenshots of
   white cards on a picture are a slideshow. The Academy player now has a quest layer (`src/components/academy/game/QuestUi.tsx`,
   `src/lib/academy/questLevels.ts`, `src/lib/academy/sfx.ts`): every block is a named LEVEL with a goal (override per lesson via
   `content.levels[block] = {emoji,title,goal}`), a trail-map HUD, XP + answer streak, a level-intro splash, a level-cleared
   celebration (stars from accuracy, coins, confetti), floating "+XP" pops, soft synthesized sounds (mute toggle) and chunky mission
   cards with a level ribbon. Gate check: does the student always know the mission, see progress, get instant juicy feedback on every
   answer, and have something to grab/tap/drag/build in every level? Wrong answers never punish (no lives, no locks, gentle sound).
   Overlays must be skippable by tap / Enter / Space and the audit script taps through them.

9. **Original, creative, and the language IS the game** (standing rule, 2026-10-02: "it has to be a game, original and
   creative; the student is top priority — comfort, interaction, enjoyment, and the student's learning needs"). Reject any
   level whose game is a quiz wearing a costume (XP, stars and confetti around multiple choice are decoration, not design).
   Every lesson needs at least one SIGNATURE mechanic invented for its own story where **using the target language is what
   moves the game forward** — the student cannot win by guessing; they must choose, build or say the structure the lesson
   teaches, and the game reacts to what they chose. Test: "Remove the theme — is there still a real decision or a real
   sentence the student has to produce?" Also test the student's need: after the game can they do the lesson's objective
   without help, and is there a tangible artifact of their own (a log, a map, a sentence list) to be proud of? Research
   before inventing (Cambridge task formats, app patterns), but never copy a product; adapt the underlying mechanic.

**Fix at the shared component** (`AcademyDemo.tsx`, `PlayAcademyLesson.tsx`, `LivingCanvas.tsx`,
`EscapeRoomSlot.tsx`), not per lesson — comfort bugs are almost always shared-component bugs.


## Engine 6 — Voice (no accent, accurate pronunciation)

Product rule: **no voice clip may carry an accent** (target = standard native General American; change `REQUIRED_ACCENT`
in `src/lib/speechPolicy.ts` if the owner ever wants a different one) and every word must be pronounced correctly.
Applies to ALL hubs and ALL paths: client `speak()`, `scripts/generate-voice-cache.mjs`, every ElevenLabs edge function,
voice catalogs.

1. **Voice**: every character's voice id must be `approved` in `VOICE_PROFILES` (library accent label = American).
   Accented voices (British, Australian, Swedish...) are swapped by `approvedVoiceId()`; custom/unknown ids show as
   `unverified` — check them by ear or with `npm run audit:voice`.
2. **Text**: all speech goes through `normalizeForSpeech()` (digits to words, abbreviations, ALL-CAPS, "yo-yo", emoji...).
   Clips are still looked up by the ORIGINAL text. Spelled-out sounds ("sss") and /phoneme/ notation cannot be spoken
   by TTS: they must be recorded files (phonics rule).
3. **Delivery**: `safeVoiceSettings()` keeps stability >= 0.5 and style <= 0.4 (loose settings drift into odd accents);
   `languageLock()` adds `language_code: 'en'` on turbo/flash models.
4. **Run**: `npx tsx scripts/generate-voice-cache.mjs --audit` (exit 1 on any problem) and `vitest run src/content/playground-library/voicePolicy.test.ts`
   (in the deploy gate). When you re-cast a character, bump its entry in `CHARACTER_CLIP_VERSION` (client AND script) and re-bake.
5. **Limit**: tests prove policy, not sound. A human must still listen to a sample of new clips.
   The edge functions copy `src/lib/speechPolicy.ts` to `supabase/functions/_shared/` — keep them identical (a test enforces it).

## When to run this

- Every time a lesson's scene array is created from scratch.
- Every time an existing lesson's scenes, backgrounds, or vocabulary are
  edited — even a "small" wording change can silently break a semantic match
  that used to hold.
- Whenever a user reports a lesson "doesn't make sense" or "feels off" —
  that symptom almost always means one of these six checks was skipped,
  not that the lesson needs more content.

## Anti-pattern this exists to prevent

Treating "I wrote a plausible-sounding sentence and picked a background that
seemed thematically close enough" as equivalent to verifying the two
actually agree. Plausible and verified are different things; this gate only
accepts verified.
