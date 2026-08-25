---
name: unified-lesson-quality-and-safety
description: >
  REQUIRED before building, extending, or reviewing any lesson in the
  unified cross-hub engine (Academy/Success — src/unified-lessons,
  src/components/unified-player: PresentationSection, ActivitySection,
  SlideFrame, NavFooter, SpeakingActivities). Covers hard rules learned from
  real bugs found while building the Academy Pre-A1 "Who Am I?" flagship
  lesson: a stalled Framer Motion transition that silently broke card
  navigation, a phonics-audio safety rule, a CSS percentage-height trap, a
  character-name consistency bug, and the pedagogical patterns (story
  spiral-reinforcement, hear-then-repeat gating, one-pattern-per-page) that
  made the lesson actually teach well. Use this whenever asked to create a
  new unified lesson, add/replace an activity, restyle a moment, or when a
  lesson "feels off," a transition silently doesn't work, or text is hard to
  read against an image.
---

# Unified Lesson Quality & Safety

Standards for the unified PPP+activity lesson engine (Academy/Success —
**not** Playground's separate Scene[] system; see
`playground-library-lesson-builder` for that one). Distilled from building
and repeatedly fixing the Academy Pre-A1 flagship lesson
(`unified_lessons` id `21c6d729-e0a7-43a6-bf33-af740e514eb0`) — every rule
here maps to a real bug or a real user correction, not a hypothetical.

## The rendering model, in one paragraph

Every moment renders as a **SlideFrame**: a 16:9 PowerPoint-style frame.
With an `image`, the picture fills the whole frame edge-to-edge (a "full
bleed" picture-slide layout) with the title/kicker overlaid at top (scrim +
drop-shadow for legibility) and any `children` floating as an opaque
caption card near the bottom. Without an image, it's a solid accent-color
title bar over a plain content area. `flexHeight` drops the fixed
aspect-ratio for content whose size varies a lot (game boards, memory
grids) — same visual language, natural height instead of clipping/scrolling
inside a fixed box. Presentation moments (`PresentationSection.tsx`) use
this for intro/vocab/phonics/story/summary; activity moments
(`ActivitySection.tsx`) use it for games, always with `flexHeight`.

## Hard rules (each one is a real bug that shipped and got caught)

1. **Isolated phonics sounds play a file or nothing — never live TTS.** A
   live ElevenLabs engine reading a raw phoneme in isolation mispronounces
   it unpredictably, teaching the wrong sound. `PhonicsHearButton` in
   `PresentationSection.tsx` enforces this: it plays a literal `<audio>`
   from `block.audio` and renders **nothing** (no button at all) if that
   field is empty — it must never fall back to `usePlaygroundAudio`'s
   `playVoice`. Every other text block (words, sentences, story lines) *is*
   allowed to use the cache-with-live-fallback `HearButton`/`playVoice` —
   this restriction is specific to isolated sounds.

2. **Don't use `AnimatePresence mode="wait"` for a simple card swap.** It
   stalled in this codebase: the index state advanced correctly (confirmed
   via `console.trace` instrumentation) but the exiting card's animation
   never resolved, so the new card silently never mounted — buttons
   appeared to do nothing. Fix: a plain enter-only `motion.div` with no
   `AnimatePresence` wrapper at all (`initial`+`animate`, no `exit`) — the
   same pattern `StorybookSlide`'s page-turn already uses successfully. If
   you need an exit animation, prove it advances through 3+ states before
   trusting it — a state-updates-but-DOM-doesn't-move bug is invisible in a
   code read and only shows up by actually clicking through.

3. **A `flex items-center justify-center` wrapper breaks percentage
   heights in its children.** That pattern gives its child a shrink-to-fit
   (undefined) height, so a grandchild's `max-h-[55%]` resolves against
   nothing and the image renders at full intrinsic size, overflowing and
   getting clipped — looks like "the image is cropped/cut off" with no
   console error. `SlideFrame`'s fix: the wrapper stretches
   (`h-full w-full`, no centering), and each slide's own content centers
   itself explicitly inside that real height. If a contained image looks
   wrong, check for a centering wrapper sitting between it and any
   ancestor with a real height.

4. **Carousel/deck arrows overlay the card, they don't flank it.** Arrows
   placed beside a `max-w-3xl` card need extra viewport width beyond the
   card's own width and silently overflow off-screen on standard viewports
   — the deck becomes unusable with no visible error (this is what "I
   can't see a button to go to the next card" turned out to be). Position
   nav arrows `absolute` inside a `relative` wrapper matching the card's
   own footprint instead.

5. **Keep `SlideFrame`/deck max-width at `max-w-3xl`, not wider.**
   `max-w-4xl` clipped horizontally on an 800px-wide viewport (a common
   preview/embed width) — text and arrows ran off the visible edge with no
   scrollbar to reveal it.

6. **Character names must match verbatim everywhere they appear.** A
   classmate was "Maya" in one hotspot activity and "Mia" in the story and
   a later assessment question — three separate authored strings that
   should have been one identity. Before shipping, grep every character
   name used anywhere in the lesson's `moments` JSON and confirm one
   spelling per person across every block that mentions them (vocab
   examples, hotspot labels, story text, assessment questions, role-play
   character fields).

7. **Every text block needs an audio affordance — true Pre-A1 beginners
   cannot reliably decode written English.** A page of vocabulary or story
   text with no way to hear it isn't accessible on its own. This is why
   every `BlockView` case wires a `HearButton`/`PhonicsHearButton` even
   for plain-looking definition/example text — don't add a new block type
   without one.

8. **Check `playground-games.tsx` for an existing component before
   building a new activity type.** `tap_order` (tap words/items in the
   correct sequence — doubles as a sentence-builder) and `word_builder`
   (auto-scrambled letters, tap tiles in order to spell a target word,
   optional `show_sounds` for phonics reinforcement) already existed,
   fully built, with zero lines of new game logic needed — they just had
   no dispatch case in `ActivitySection.tsx`'s `ActivityView` switch. Read
   that file's exports before assuming a requested interaction ("scramble
   the letters", "put the words in order") needs a new component.

## Character identity — use the cast vault, don't invent a face each time

Academy's mentor is **Vee**, Success's is **Sol** — both rows already exist
in `cast_vault_characters` (`is_shared: true`, keyed by `hub`) with a real
`visual_blueprint` (outfit, palette, age range, "illustrated semi-realistic
proportions, not a talking animal"). Before generating any image meant to
represent the host character:

```sql
select id, name, hub, avatar_url, visual_blueprint
from cast_vault_characters where hub = '<hub>' or is_shared = true;
```

If `avatar_url` is null, generate one **from that row's `visual_blueprint`**
(palette, outfit, age range) so it's actually consistent with the defined
identity, then `UPDATE cast_vault_characters SET avatar_url = ...` so it
persists for every future lesson — not just a one-off generated for this
page. Use that real avatar anywhere the lesson's own text names the
character (e.g. a vocab card whose definition says "Example: My name is
Vee" should show Vee, not an anonymous generated teen).

## Pedagogical patterns that made this lesson actually work

- **Model → isolate → drill, in that order.** Show the full natural
  utterance first (the host modeling "Hello! My name is Vee."), *then*
  break it into the isolated grammar point, *then* drill it — not the
  reverse. Applies at both the lesson level (a self-intro modeling moment
  before the formal I-am/You-are grammar section) and the sentence level.
- **Listen-and-repeat drills should quote the actual story, not generic
  isolated phrases.** Reframing echo prompts as "Sam says this when he
  meets someone new... 'Hello! I am Sam.'" (verbatim from the story moment
  later in the same lesson, with character attribution) turns a bare drill
  into a preview the student will *recognize* when they reach the real
  story — spiral reinforcement, not two disconnected activities that
  happen to share grammar.
- **A story is a listen-and-repeat exercise, not a read-along.** Gate
  "Next page" behind hear-then-repeat confirmation (🔊 then 🗣️, same
  pattern as the standalone Listen & Repeat game) rather than leaving it
  always-available — otherwise "read the story" quietly becomes "skip
  through text a non-reader can't parse."
- **One new grammar/vocab pattern per page.** Don't introduce "I am" and
  "You are" and a question form on the same slide — each moment should
  have one clear teaching point, even if multiple slides revisit it from
  different angles (model, drill, game, story, test).
- **Reorder phonics earlier if the lesson leans on reading later.** Sound
  instruction that arrives *after* the story/reading-check moments it's
  supposed to support is backwards — move it right after the initial
  self-intro modeling so the decoding tool exists before it's needed.
- **Tie phonics examples to the lesson's own vocabulary**, not arbitrary
  words — `/h/` uses "hello, how" (both real lesson words), not "hat, hen."
  One standard exception: a universally recognizable phonics anchor image
  (e.g. "apple" for short-a) is fine to add alongside the lesson-specific
  examples, not instead of them.
- **Reward-moment summaries must describe what the student actually did**,
  not what an earlier draft had them do. When an activity gets replaced,
  grep the reward/summary bullets for stale references to the old one —
  this is an easy one to forget and it shipped wrong at least once here.

## Verifying changes — a real gotcha with this browser tool

Long automated click-loops fired via `javascript_exec` (`for` loops with
`await sleep(...)`) can keep running in the background after the tool call
"returns," and can survive across `navigate` calls in the same tab/session
— producing a misleading symptom where the lesson appears to auto-advance
several pages with no user input. Before concluding there's a real
auto-advance bug: fully restart the browser process
(`preview_stop`+`preview_start`, not just `navigate`) to get a guaranteed
clean JS context, then verify with single deliberate steps
(`read_page` → click one `ref` → `get_page_text`) rather than another long
loop. If the symptom disappears on a clean process, it was tool-side
contamination, not app state — this happened repeatedly in this session
and wasted significant time before being traced with
`console.trace`-based instrumentation proving the actual state transitions
were clean.

## Content-editing mechanics (Supabase `unified_lessons.moments`)

- Always use PostgreSQL dollar-quoting (`$tag$...$tag$`) for JSON string
  literals — apostrophes in authored copy ("let's", "someone's") will
  break plain-quoted SQL otherwise.
- Prefer **targeted `jsonb_set` on the specific moment/block path** over
  rewriting the whole `moments` array when only a few moments change —
  smaller diff, far less risk of a transcription slip corrupting untouched
  content. Reserve a full-array rewrite for genuine reordering (use
  `jsonb_object_agg` keyed by moment id + a `WITH ORDINALITY` unnest of
  the desired id order — see git history for the working pattern).
- **Verify every write with a follow-up `SELECT`** of exactly the
  path(s) you changed before moving on — don't assume the `UPDATE`'s empty
  result set means success without checking the actual stored value.

## Before calling a lesson done

1. `npx tsc --noEmit -p .` after any component change.
2. Full click-through from moment 1 to "Lesson complete" on a **freshly
   restarted** browser process — no auto-advance drift, no stalled
   transitions.
3. Read every generated character name, definition, and question across
   the whole `moments` JSON in one pass — catch spelling/attribution
   mismatches before a user does.
4. Confirm every phonics block either has a real `audio` file or renders
   with no hear button — never a live-TTS fallback.
5. Confirm the reward/summary moment's bullets match what the lesson
   *currently* contains, not an earlier draft.
6. Check console for errors beyond the known-safe pre-existing 401s from
   the anonymous-session audio-cache check.
