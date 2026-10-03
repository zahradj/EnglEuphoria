# Universal Playground Lesson Blueprint

**Audience:** Content creators, teachers, curriculum reviewers
**Hub:** Playground (Kids, ages 4–9)
**Format:** 1-on-1 online · 30 minutes · 22 slides
**Status:** Canonical — every Playground lesson inherits this contract.

---

## 1. Fixed Contract (hard-locked)

| Field | Value |
|---|---|
| Hub | `playground` |
| Duration | 30 minutes |
| Slide count | 22 |
| CEFR range | Pre-A1 → B1 (matrix-enforced) |
| Speaking density floor | ≥ 40% of lesson time |
| Target vocab cap | 6–8 words, each recycled ≥ 4× |
| Grammar | Implicit only — no rule slides, no metalanguage |
| Reading register | Concrete, ≤ 6-word definitions, no abstract nouns |
| Story spine | 1 recurring character + Pip mascot (continuity validator on) |
| Phonics | 1 micro-moment per lesson (Playground-only standalone) |
| Mastery gate | ≥ 80% on key interactive slides → Vault sticker |
| Leaderboards | ❌ Forbidden |
| Visual style | Flat 2.0 + Claymorphism vault stickers |

---

## 2. Pedagogical Principles

1. **TPR first** — movement before speech lowers anxiety.
2. **Story spine** — one character carries every slide (+40% recall).
3. **i+1 input** — only 6 new words, recycled multiple ways.
4. **Multi-sensory loop** — see → hear → mimic → move → speak → play.
5. **Micro-wins every ≤ 90 s** — XP, sticker, Pip cheer.
6. **Speaking > teacher talk** — child speaks more than the teacher.
7. **Exit on a high** — celebration slide, never a quiz.
8. **Compassionate failure** — 2 streak-freeze tokens, no game-over.

---

## 3. Universal 22-Slide Skeleton

```text
#  Stage          Purpose                          Activity type
─────────────────────────────────────────────────────────────────────
1  Hook           Warm-up song (TPR actions)       sing_along
2  Hook           Pip greeting + question          speaking_cued
3  Context        Story opener (character)         story_slide
4  Input          Vocab Vault reveal (6 words)     vocab_cards
5  Input          Echo mimic (mic on)              pronunciation_mimic
6  Discovery      Reveal game (image → word)       listen_and_match
7  Controlled     Drag & match (character helps)   drag_drop
8  Controlled     Implicit grammar model           dialogue_model
9  Controlled     Spinner choice → say sentence    spinning_wheel
10 Communicative  Teacher Q → child A              speaking_guided
11 Communicative  Role-swap (child asks)           speaking_roleplay
12 Game break     Memory match                     matching_pairs
13 Production     Personal choice + sentence       speaking_production
14 Pronunciation  Phonics micro-moment             phonics_drill
15 Recall         Quick-fire flashcards (3 s)      rapid_recall
16 Story          Story payoff (character)         story_slide
17 Cool-down      Sing-back (child leads)          sing_along
18 Reflection     "Show me your favorite"          personalization
19 Achievement    Vault sticker unlock             reward_slide
20 Mission        Home Mission (real-world)        homework_task
21 Celebration    Confetti + XP tally              celebration
22 Closing        Routine goodbye                  closing
```

**Totals:** 9 speaking moments (~41%) · 5 mini-games · 6 words × 5 exposures · grammar implicit.

---

## 3a. Story lessons get REAL video (hard rule, Pre-A1)

**Lesson 5 of every Pre-A1 unit is the story lesson, and its story MUST be a
real animated video** — characters that actually move, talk and act out the
story (generated video clips: image-to-video / text-to-video), cut together
with the narration. A slideshow of still pictures with zoom/pan ("Ken Burns")
is **not** acceptable for Lesson 5; it is only a temporary fallback while the
real clips are being generated, and the lesson is not "done" until they are.

| Requirement | Detail |
|---|---|
| Which lessons | Lesson 5 of every Pre-A1 unit (the storybook slot of the unit arc) |
| What | One clip per story beat (≈ 5-8 s each, 6-8 beats), real motion: walking, giving, swimming, opening, laughing |
| Consistency | Every clip starts from the lesson's own approved story picture (image-to-video), so characters look exactly like the Playground cast |
| Content | Matches the story line for that beat word for word (semantic check against the narration); no text in the frame |
| Audio | The clip's own sound is muted; narration = the recorded character voices (`speak()`), never generated speech, never browser TTS |
| Format | One stitched MP4 (H.264, faststart) + WebM fallback in `public/lep1/video/`, with `atSec` marking where each beat starts; picture-answer questions pause it |
| Fallback | If a clip cannot be generated yet, that beat may use the still picture — the lesson is flagged "video pending" and must be finished before it goes live |

Other lessons may keep picture-films (`story-video` built from stills) for
short story openers and payoffs; Lesson 5 may not.

---

## 3b. Extra Time — brain breaks & bonus activities (every lesson)

A 30-minute class rarely runs exactly to plan: a confident child finishes
early, a shy one needs a break. **Every lesson ends with an optional
"Extra time" block, placed after the Home Mission and before the goodbye**,
that the teacher can use or skip (Next skips it; nothing in it is new):

| Slot | What | Scene kind | Time |
|---|---|---|---|
| E1 | **Brain Break** — stand up and move: stretch, jump like a ball, drive the train, "Freeze!" (5-8 moves) | `tpr-actions` with `mode: 'break'` | 1-2 min |
| E2 | **Bonus game** — a favourite game of the lesson again with new rounds (Mystery Bag, Torch Hunt, Odd One Out, Spin…) | any game kind, `teacher` note starts "Extra time:" | 2-4 min |
| E3 | **Bonus game 2** — a different mechanic from E2 (memory, quick-fire cards, pattern train…) | any game kind | 2-4 min |

Rules:
- A brain break is also allowed mid-lesson after a long sitting stretch
  (blueprint "low attention day" knob) — same `tpr-actions` break mode.
- Bonus games use only words already taught in this lesson or earlier.
- The Variety Rule still applies: no more than 2 of the same kind in a row,
  counting the extra block.
- The finale (celebration) and goodbye song come after the extra block, so
  the lesson always **exits on a high**.

---

## 3c. Slide → scene kind map (Pre-A1 scene lessons)

How each skeleton slide is built with the real scene kinds (see
`.claude/skills/activity-pattern-library`):

| # | Stage | Scene kinds |
|---|---|---|
| 1 | Warm-up song (TPR) | `song` |
| 2 | Pip greeting + question | `cinematic` |
| 3 | Story opener | `story-video` (a narrated film — non-readers) |
| 4 | Vocab reveal | `toy-model` / `color-model` / `shape-model` |
| 5 | Echo + move | `tpr-actions` (Move & Say) or `listen-repeat-cards` |
| 6 | Reveal game | `mystery-bag`, `shape-torch`, `color-spy` |
| 7 | Drag & match | `color-sort`, `shape-sort`, `plural-sort` |
| 8 | Implicit grammar model | `listen-repeat-cards` (one picture per chunk) |
| 9 | Spinner → sentence | `spin-wheel` |
| 10-11 | Q→A, role swap | `join-stage` |
| 12 | Memory match | `memory`, `train-recall` |
| 13 | Personal choice | `join-stage` with a real object, `secret-card` |
| 14 | Phonics micro-moment | `sound-model` + `trace` or `dash` |
| 15 | Quick-fire flashcards (3 s) | `rapid-recall` |
| 16 | Story payoff | `story-video` (part 2) |
| 17-18 | Sing-back / show your favourite | `song`, `join-stage` |
| 19 | Sticker unlock | `sticker-reward` (Sticker Book, kept across lessons) |
| 20 | Home Mission | `home-mission` (picture steps + parent note) |
| E1-E3 | Extra time | `tpr-actions` break + 2 bonus games |
| 21-22 | Celebration, goodbye | `song`, `finale` |

**Pre-A1 = non-readers:** every prompt is spoken; answers are pictures, taps,
actions or speech; printed text is a small caption for the adult (≤ 5 words).

**Look & feel:** Playground orange `#FE6A2F` + cream, large rounded "clay"
cards (puffy highlight, bottom lip, soft deep shadow — `CLAY_CARD` /
`CLAY_BUTTON` in `unit1/scene-components/shared.tsx`), cards on the open side
of the picture (never over the character), ≥ 80 px tap targets, wide 16:9 art.

**Research behind the 2026-10 additions:** Khan Academy Kids (guide
characters, collectible rewards → Sticker Book), Novakid / Oxford *Toy Team*
and *Everybody Up* (TPR + songs → Move & Say, brain breaks), Cambridge Pre A1
Starters (picture-based tasks, tick-or-cross, listen-and-colour), ESL toy
lessons (feely box → Mystery Bag; "What are these? — They're bears" → one vs
many), 2025-26 kids' app design (claymorphism, custom illustration).

---

## 4. Built-in Learning Loops

- **Multi-sensory cycle per concept:** see → hear → mimic → move → speak → play
- **SM-2+ recall ladder:** input → drag → spinner → match → production (5 exposures ≥ retention threshold)
- **Spiral hook:** last story beat seeds next lesson's opener (interleaving)
- **Micro-win cadence:** reward signal every ≤ 90 s
- **Pip reactions:** cheer, dance, surprise — never during speaking tasks

---

## 5. Differentiation Knobs (teacher live)

| Learner profile | Adjustment |
|---|---|
| Shy / new | Skip slide 11 role-swap, double slide 7 drag rounds |
| Advanced (A1+) | Unlock bonus *"I like ___ but I don't like ___"* slide |
| Age 4–5 | Drop slides 14 (phonics) + 18 (reflection), extend song |
| Low attention day | Pip offers a 10 s stretch break (no XP loss) |

---

## 6. Engine Routing (enforced by orchestrator)

```text
Planner → Governance → Adaptive → Grammar (implicit profile) →
Pronunciation (PG phonics) → Memory → Speaking (PG floor 40%) →
Gamification (no leaderboard) → Coherence (homework ≤ 10 min) →
Arcade (≤ 3 games / 8 min) → QA → Stabilization → Publish
```

Code contract: `HUB_PLANNING_PROFILES.playground` in `src/planning/hubProfiles.ts`.

---

## 7. Success Criteria (auto-tracked)

- ✅ ≥ 80% accuracy on slides 7 + 12 → Vault sticker unlocks
- ✅ ≥ 3 spontaneous utterances captured in slides 10–13
- ✅ Speaking-time ratio ≥ 40%
- ✅ Exit emotion = 😄 (Pip poll)

---

## 8. Reference Instance — "Leo's Jungle Breakfast"

| Field | Value |
|---|---|
| CEFR | Pre-A1 |
| Character | Leo the Lion + Pip |
| Theme | Jungle breakfast |
| Target vocab (6) | banana, apple, milk, bread, egg, cookie |
| Communication goal | Name 6 foods · *I like / I don't like ___* · *Do you like ___?* |
| Grammar (implicit) | Present simple *like* (+/−/?) |
| Phonics micro | /b/ → banana, bread |
| Home Mission | "Tell mum/dad 3 foods you like in English" |
| Spiral hook → next lesson | Leo's lunchbox → drinks theme |

**To generate this lesson:** open the Unified Lesson Generator at `/content-creator/unified-generator`, select `Hub = Playground`, `CEFR = Pre-A1`, paste the fields above, and run. The orchestrator will produce a draft in `curriculum_lessons` (unpublished) ready for teacher review.
