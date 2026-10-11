---
name: academy-lesson-craft
description: How to design an Academy lesson that WORKS: one clear objective the student can actually reach and show by the end, built backwards from an exit task, with every screen serving a named criterion. Use BEFORE writing any Academy lesson script or session plan, and again before reporting it done. Owner rule 2026-10-09: "clear objectives that the student can actually reach at the end. Practical." Pairs with academy-session-builder (the hour), academy-activity-selector (which mechanic) and academy-quality-gate (the final check).
---

# Academy lesson craft — objective first, practical, reachable

Written after the first A1-S01-E1 build was rejected (2026-10-09): *"It doesn't serve any purpose and doesn't serve any objectives."* A lesson is not a sequence of nice screens. It is a **route from what the student can do now to one thing they can do at the end**, with proof.

## 1. The objective (write it before anything else)

An objective is **one observable performance**, in a realistic situation, at the student's level.

- Form: **"By the end I can ___ (to ___), using ___."** One verb the teacher can see or hear: say, ask, answer, choose, write, read-and-find. Never "understand", "know", "learn about".
- Source: the CEFR / NCSSFL-ACTFL can-do for the level (A1: introduce yourself, give name/age/country, ask and answer simple personal questions; a *rehearsed*, short statement is A1). Quote the descriptor in the spec.
- **Success criteria**: 3–5 checkable items, written as "I did X" in the student's words (they become the Wrap tick-list and the teacher rubric). Each is true/false from the evidence, no judgement words like "well".
- **Exit task** = the one final performance that proves the objective (the Release). Same task, same frames, same level of help the student gets in real life — **no model on screen at the end** (a private first try with the model hidden; the model returns only on "Show me").
- **Reach test**: could a student who did every screen honestly, with no teacher help, perform the exit task now? If any language in the exit task was never taught *and* practised in the lesson, the objective is not reachable: cut the task or add the teaching. The hardest line of the exit task is the one to check first.
- **Practical test**: would a real person need this tomorrow (a new club, a pen-friend, a teacher, an online profile)? If not, change the situation, not the level.

## 2. Build backwards (backward design)

1. Objective + criteria + exit task + rubric (above).
2. **Language inventory**: list every word, chunk and question the exit task needs. That list, and only that list (≤ 12–14 new items at A1), is what the lesson teaches. Anything else is gloss, not teaching.
3. **Route** (one stage per need; each stage names the criterion it serves):
   1. **Meet** the items: picture + meaning + one example (meaning before form; a student who knows nothing must be able to guess from the picture).
   2. **See them used**: a short model conversation (6–10 short lines) in a full-page scene, read line by line.
   3. **Understand**: one quick check that the story was understood (who/what), not a trick question.
   4. **Practise controlled**: match word↔picture, word↔meaning; complete the conversation from a word bank; put the words/lines in order. Errors are cheap here and give a hint, never a score.
   5. **Memorise the pattern**: read-and-repeat, then the same lines with key words hidden, then only the first word. Fading support is the point.
   6. **Transfer**: role-play the same conversation with swapped details (Take 1, feedback, Take 2).
   7. **Produce** (the exit task, private first) and **check** against the criteria.
4. **Purpose line per screen**: every screen/activity carries `trains: <criterion #>`. **A screen with no criterion is deleted.** (No "which word fits?" for its own sake.) Each criterion needs ≥ 3 encounters in different modes, the last one being production.
5. **Sequencing law**: nothing is asked that has not been shown. A frame is modelled → noticed → practised → produced, in that order.

## 3. What makes a lesson usable by a real teen

- **Meaning is never hidden**: every new word has a picture and a one-line meaning. If a word cannot be pictured, give a tap-to-gloss and a short example, and keep it out of the must-know list.
- **Chunks first at A1**: teach "My name is ___", "I am ___", "I am from ___", "I like ___" as whole frames with one slot to swap; grammar explanation stays ≤ 3 lines and comes after use.
- **Small sets**: 3–4 new items per set (working memory); check each set before the next.
- **Output ladder**: repeat → substitute → answer → ask. Stay inside what the level allows; the student must say each target sentence at least 3 times before the exit task.
- **Personal and safe**: the student gives their own facts, an alias is always allowed, nothing is recorded or public, type-instead-of-speak is always there. Wrong tries get a friendly hint.
- **The scene carries the language**: the story is acted by the cast in a full-page scene (poses, expressions, bubbles next to the speaker); the picture shows the meaning (a wave for "Hi", a ball for "football").
- **Honest evidence**: end with can-do ticks tied to the criteria and a short "what we did well / one thing to try" for the teacher. Never XP as proof of learning.

## 4. Checks before you say "done" (all must pass; fail = fix the lesson, never the check)

1. The objective is one observable performance with 3–5 criteria and an exit task, quoted from a can-do descriptor.
2. **Alignment matrix** (put it in the spec and in a test): rows = criteria, columns = screens; every criterion has ≥ 3 screens, the last is production; every screen has a criterion.
3. **Exit-task coverage test**: every word/frame the exit task needs appears in the taught list AND was practised (matched/completed/said) at least 3 times; nothing in the exit task is untaught.
4. **Cold-exit trial**: play the lesson with the validators' "honest student" (always-first-try-correct and always-wrong-then-hint), then run the exit task from the saved answers; the card must be produced with no model visible.
5. Minutes: estimated screen time inside the blueprint's run of show (a test already exists).
6. 95 % known-word rule for every text (this lesson's taught items + closed-class words + tap-to-gloss).
7. A teacher can read the evidence (criteria ticked, hints used, "I said it" count) in one glance.
8. Voice/picture rules of the repo (recorded voices only, Canva pictures, no browser TTS).

## 5. Research behind this (see docs/research/academy-lesson-craft-research.md; limits stated there)

CEFR/ACTFL can-do statements as objectives (observable tasks); backward design (outcome → evidence → activities); presentation-practice-production versus task-based teaching: evidence is mixed and thin for beginners, so use **PPP-style scaffolding with a task at the end** at A1; verbatim repetition/recitation helps beginners build formulaic chunks (short-term evidence); product models: ABA English (film → listen/read/repeat → write), Busuu (listen-and-repeat/shadowing), Babbel (dialogue turn-taking), Duolingo (picture match, tap-to-build, speaking from lesson one), Cambridge/Oxford A1 books (match greetings to pictures → complete conversations → role-play → write about yourself).

## 6. Spec template (copy into docs/academy-<id>-spec.md)

```
Objective: By the end I can ___ .   Descriptor: <CEFR/ACTFL line>
Criteria: 1 ___  2 ___  3 ___  (each "I did X")
Exit task (Release): ___ (model hidden; private first; type-or-say)
Language inventory: words [...] frames [...] questions [...]
Route: stage -> screens -> criterion served -> minutes
Alignment matrix: criteria x screens (>= 3 each, last = production)
Evidence the teacher sees: ___
Research: >= 3 benchmarks, mechanic taken, how this beats it, limits
```
