---
name: academy-assessment-designer
description: >
  Design Academy assessments and quizzes that measure real acquisition without scaring teens: Remember? checks, exit
  checks, Season checkpoints (E8), Big Remix, level/placement tests, speaking and writing rubrics (CEFR-aligned), item
  writing rules, item-bank tags, scoring, mastery rules, reporting and retest cadence. Use when writing quizzes, checkpoints,
  level tests, rubrics or any "how do we know they learned it" question.
---

# Academy Assessment Designer — evidence of learning, comfortably

Principles: assess **delayed, production-based** evidence (learning != performance); keep stakes low (a **Checkpoint**, not a "test"; retry allowed; no failing grades);
make every result a **next step**; separate **progress** (inside Seasons) from **level claims** (separate level test); fair to accents and L1 backgrounds (judge intelligibility).

## Assessment types

| Type | When | Length | Content | Stakes |
|---|---|---|---|---|
| Exit check | Wrap each session | 1-2 min | can-do self-rating + 2-3 items | none |
| **Remember?** | start of each session | 5-7 min | due items, production-first, retention score | none, private |
| Daily-10 review | daily | 4 min | due items | none |
| **Season Checkpoint** (E8) | end of Season | 10-15 min inside E8 | ~60 % this Season, ~40 % earlier; all 4 skills + vocab + grammar | low; retry next day |
| Remix boss (E7) / Big Remix | every Season / every 2nd | 12 min | mixed retrieval across Seasons | low; Push optional |
| **Release** (E8) | end of Season | 7 min + rubric | a speaking and/or writing product | rubric feedback, portfolio |
| **Level check** | every 2 Seasons [RT] and at level boundaries | 35-45 min over 1-2 sittings | all skills at level; CEFR cut-scores | the only source of level claims |
| Placement | onboarding | 20-30 min adaptive | all skills, speaking sample | sets start Season |

## Item writing rules

1. **One construct per item** (don't test spelling and grammar and vocabulary at once unless tagged so).
2. **Production beats recognition**: type, say, build, rewrite, short answer. Recognition (MC) only for receptive skills (gist/detail) and placement breadth.
3. Distractors are **real learner errors** (from the Mistake Bank), plausible, length-balanced; no trick items, no "all of the above".
4. Language in the stem is **below** the tested language (>= 98 % known words).
5. Audio: recorded approved voices via `speak()`; several talkers over a test; natural pace for the level (A1 slow/clear -> C1 natural, accents within the approved set); played max 2 times.
6. Authentic-feeling contexts (chat, menu, message, announcement) not abstract sentences; school-safe topics.
7. Accept all correct alternatives; fuzzy spelling tolerance (typo != wrong) with the correct spelling shown; partial credit for multi-part answers.
8. Tag every item: `{id, skill, subskill, cefr, lexemeIds[], structureIds[], type, mode: receptive|productive, difficulty (est.), seasonId, variant 1..3}`; >= 3 variants per target for retests.
9. **Delayed items**: >= 20 % of every Checkpoint comes from >= 2 Seasons back.
10. **Mastery rule** (default [RT]): a skill/item is Mastered after correct production on >= 2 days AND a later mixed check; falls if missed after a gap.
11. **Untimed by default**; offer an opt-in "beat your best" for non-speaking items only.

## Item types by skill

- **Listening**: dictation (gapped/full), listen-and-choose picture, note-taking from a call, sequence the events, detail MC at B1+ (2 plays).
- **Reading**: scan for facts, True/False/Not-Given (B1+), headline match, order the paragraphs, short answer; C1: inference and stance.
- **Vocabulary**: type-from-picture/definition, collocation completion, word family, usage ("which sentence is natural?").
- **Grammar**: build the sentence, fix the mistake, transform (B1+), contrast pairs (only after each form is solid).
- **Speaking**: private recorded task from a prompt with 60-s planning; rubric scored by the teacher; spontaneous follow-up in live (not scored in front of the student).
- **Writing**: message/caption/email/paragraph with a checklist; rewrite step; rubric scored.
- **Pronunciation**: minimal-pair perception (several voices), stress marking, read-aloud with intelligibility rating (Lingua Franca Core priorities [K]).
- **Mediation** (B1+): relay/summarise a text or message for someone else; C1: mediate between viewpoints.
- Optional exam-format practice from A2 upward (Cambridge-style tasks as a *supplement*, never the Season's core); C1 Advanced paper formats: R&UoE 90 min, Writing 90, Listening ~40, Speaking ~15 [V - check the handbook].

## Rubrics (CEFR-aligned, 4 bands per criterion, descriptors differ per level)

Speaking: **Fluency & delivery · Accuracy · Range · Coherence · Interaction** (+ Pronunciation as intelligibility).
Writing: **Task fulfilment · Organisation/cohesion · Range · Accuracy · Register** (register from B1+).
Band words are positive ("emerging / secure / confident / flexible"). Each rubric states what to do next. Descriptors must be paraphrased from the CEFR Companion Volume 2020 (verify wording at coe.int; do not quote from memory).
Calibrate: two raters on 10 sample performances per level before launch (agreement target >= 80 % within one band [RT]).

## Level test design (separate from XP)

Adaptive-style blocks (easy -> hard until errors cluster), 4 skills + use of English, a recorded speaking sample, a writing sample.
Cut-scores per CEFR level set with anchor items and a standard-setting session; re-validate against an external reference (Cambridge placement / a sample of Cambridge-format tasks) before using the label "B1" publicly [U until done].
Retest every 2 Seasons [RT] and at each level boundary; never claim a level from in-lesson accuracy. Cambridge guided hours are guidelines only.

## Reporting

Student: can-dos ticked with evidence, retention score ("kept 7 of 9"), skill levels, Best Lines, next step. Teacher: item-level errors by category, talk-time, hints, Fading list. Parent: level, Season progress,
portfolio highlights, time estimate to the next level from the student's own pace. Never rank students against each other.

## Item bank structure

`assessment/items/<level>/<season>.json` (proposed) with the tags above; build script validates tags, variants, vocabulary level (>= 98 % known in stems), audio ids exist, duplicate detection; analytics per item
(difficulty, discrimination after >= 30 responses) to retire bad items.

## Don't

Test untaught language; use browser TTS; reward speed; show a student their score next to anyone else's; label a student with a level after a bad day (require 2 signals); put a timer on speaking; let a checkpoint block the next session.
