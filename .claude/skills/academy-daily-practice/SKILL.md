---
name: academy-daily-practice
description: >
  Design the Academy "Daily 10" (a gamified, well-presented 10-minute solo practice between live lessons), homework, the
  last-time recap card, and self-practice activities students can do alone: composition algorithm, spacing by calendar days,
  solo-playable mechanics per skill, teen-safe gamification (quests, Word Cards, streak freezes, no leaderboards),
  presentation/animation spec, homework rules by sessions-per-week. Use whenever building self-practice, homework or
  anything that reminds the student what was done last time.
---

# Academy Daily Practice — where acquisition actually happens

One live hour a week cannot space practice. The Daily 10 + homework carry the spacing, retrieval and input. The owner called homework
and the recap "very important" and asked for a **gamified, well presented, well made** 10 minutes.

## The 10 minutes (default shape)

| Min | Part | Purpose / technique | Notes |
|---|---|---|---|
| 0:00-0:30 | **Last Time card** | reminder of what we did (3 bullets), Best Line, "today's mission" | generated from the last SessionPlan; tap to start |
| 0:30-4:30 | **Due Reviews** | retrieval + spacing; 8-12 items, production first | Mistake Bank first, then Fading, then due; feedback after each |
| 4:30-7:30 | **Mini-game** | enjoyment + retrieval/use in a new form | chosen by `academy-activity-selector` (solo list below); rotates daily |
| 7:30-9:00 | **Skill snack** | input: graded listening OR reading OR dictation (rotates) | the "Library": ~95-98 % known words; tracks words read/minutes heard |
| 9:00-9:30 | **Voice note** | output; private rehearsal -> listen -> send/retry | Mon-Fri prompt tied to the Season; teacher can listen (consent) |
| 9:30-10:00 | **Highlights** | retention score, items "fixed", Word Cards earned, tomorrow's teaser | no guilt; shows delayed accuracy, not just today's |

If a student has only 5 minutes: Last Time + Due Reviews + Highlights ("Quick 5"). Always resumable, offline-tolerant, mobile-first.

## Composition algorithm

1. Pull **due items** by calendar day (see diagnostics: same session -> +1 -> +3 -> +7 -> +21 -> +60; miss -> +1). Cap 12; if more, prefer Mistake Bank > Fading > earliest due; carry the rest.
2. Weight by `NeedsReport` flags (e.g. +3 grammar items if a structure < 60 %).
3. Add **new-to-solo** items only from the Season word list already taught in a live session (never untaught language).
4. Pick the mini-game via the selector (solo, auto-marked, Low comfort, not the same as yesterday, matches the day's skill rotation).
5. Pick the snack: rotate L / R / dictation; level-appropriate; record words read.
6. Build the voice prompt from the Season (e.g. "Order your favourite snack in 3 sentences").
7. Log everything with timestamps (for spacing and for the dashboard).

## Pace by sessions per week (1, 2 or 3)

| Sessions/week | Recommended Daily 10 | Recap card | Notes |
|---|---|---|---|
| 1 | 4-5 days/week | essential, richer (5 bullets) | live Remember? is 7-10 min because the last session is 7 days old |
| 2 | 3-4 days/week | standard | |
| 3 | 2-3 days/week | short | gaps are short; stretch intervals |
Never block progress on completion; the live lesson adapts to what was/wasn't practised.

## Homework (distinct from Daily 10; assigned by the teacher or generated)

- **Mission homework** (<= 15 min, optional choice of 2): prepare the Release draft, read the graded text, record a retell, collect 3 examples from their own world (photos/screens).
- **Auto homework**: generated from needs (e.g. error-hunt pack on the structure that fell).
- Always tied to the next session ("bring this and we'll use it in the Mission"); the Last Time card for the next session shows it.
- Max 2 items per week at 1 session/week, 3 at 2-3. No homework as punishment; late work is welcomed back.

## Self-practice activity design rules (how to create more of them)

1. Generate from the Season item/structure lists - never from outside the taught set.
2. **Auto-markable** with fuzzy matching for spelling (reuse `src/utils/fuzzyAnswerEvaluator.ts`), accept alternative correct answers, show the corrected form, never red-X buzzers.
3. Item types (production first): type-from-picture, type-from-audio (dictation), build-the-sentence, cloze with typing, fix-the-mistake, match, odd-one-out, connections, order-the-dialogue, minimal-pair listening (several recorded voices), stress dots, short answer to a graded text.
4. One construct per item; 3 variants per target (for later retests); items tagged id/skill/CEFR/lexeme/structure.
5. Speaking: record -> compare with the model -> self-rate with a checklist -> (optional) send to the teacher. No automatic scoring claims until validated.
6. Writing: micro-writing (2-3 sentences) with a checklist and a rewrite step; teacher feedback arrives next live session.
7. Sessions <= 3 min per game; no timers by default (opt-in "beat your best").

## Solo-playable mechanics (from the catalogue)

Wordle-style (81), Spelling Bee (82), Connections (4), Odd One Out (3), Picture Match Memory (6), Tile-matching (98), Sentence Builder (17), Error Hunt (18),
Gap-fill Heist (20), Boss Battle with an AI/teacher-free boss (94), Roguelike Deck (95), Card Collection (96), Dictation Run (80), Song Gap-fill (43),
Minimal Pair Ears (47), Sound Sorting (91), Stress Dots (88), Listen & Drag (40), Podcast Detective (46), Interactive Fiction (33), Visual Novel (34), Chat Message Sim (71),
Mad Libs (70), Six-Word Story (75), Caption This (76), Crossword (84), Brain dump (97), Can-Do Self-Check (142). Mechanics needing a person (Taboo, Codenames, Alibi...) stay live.

## Gamification (teen-safe, evidence-aware)

- **Quests**: a Daily Quest ("2 reviews fixed + 1 voice note") and a **Season Quest map** (8 episodes, clue unlocked per episode) - progress tied to learning actions.
- **Word Cards**: each Secure item becomes a collectable card (art style on-brand, non-childish); private collection; rarity from *retention*, not luck - **no loot boxes, no gacha, no chance mechanics**.
- **Streak**: daily goal separate from the streak; Streak Freezes; weekend pass; "streak paused" not "streak lost"; no guilt push notifications. (Duolingo's own tests: separating goal from streak and adding freezes helped retention [V, relative].)
- **XP** = consistency, never rank. **No public leaderboards.** Optional private personal bests and a shared "Season goal" with the teacher.
- Rewards celebrate **fixing a mistake** and **delayed recall** ("You remembered 8 of 9 from last week"), not speed.
- Evidence note: gamification effect g ~ 0.46 mostly non-language; badges/leaderboards raised interest, not performance [V]. Treat as motivation, not learning proof.

## Presentation spec ("well made")

Follow `academy-player-ux` for tokens and `game-animation` for juice. Required: a clear entry screen (Last Time card with the teacher's avatar/note), a progress strip with 5 segments, one task per screen,
tactile feedback (spring/squash on correct, soft shake + "Not yet" on wrong, never harsh), short recorded-sound cues with mute, reduced-motion respect, phone-first thumb zones, dark-first with light option,
Explorer/Studio themes, a satisfying Highlights screen (retention ring, cards earned, tomorrow's teaser), and zero loading dead-ends (preload next item and audio).

## Data it must emit

`dailyLog{studentId, date, partsDone[], itemsReviewed[{id, correct, hints, mode}], minutes, voiceNoteId?, textWordsRead, audioSeconds}` -> feeds `academy-learner-diagnostics`, the teacher dashboard and the next Last Time card.

## Don't

Show a leaderboard; punish missed days; gate live lessons on completion; teach new language solo that wasn't introduced live; use browser TTS (use recorded voices via `speak()`); count a rushed correct answer as learning (report delayed accuracy).
