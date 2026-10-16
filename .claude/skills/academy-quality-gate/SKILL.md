---
name: academy-quality-gate
description: >
  REQUIRED final pass before reporting any Academy roadmap, Season, session plan, Daily-10 pack, assessment or player screen
  as done. Runs twelve ordered checks (science, level/CEFR, sequencing, variety, comfort, fun, theme/story, voice,
  assessment validity, progression, safety, claims) and produces a pass/fail report. Use right before telling the owner it is ready.
---

# Academy Quality Gate

Run in order; fix and re-run from the failing check. Output the report format at the end. A "pass" needs evidence (cite file/line/item ids), not a feeling.
Related repo gates still apply to shipped code: `lesson-quality-gate` (comfort audit script, voice policy tests), `lessonVariety` checks, `npx tsc --noEmit`.

| # | Check | Pass criteria | How to verify |
|---|---|---|---|
| 1 | **Science** | Every segment names the technique it implements; Remember? present and production-first; spacing by calendar days; Take 1 -> feedback -> Take 2; noticing before the rule, rule <= 3 lines; new vocab not interleaved; shadowing used only for prosody; HVPT uses several approved voices | read the plan against `docs/academy-learning-science.md` §2-3 |
| 2 | **Level / CEFR** | Items and structures from verified lists with sources noted; <= 14 new items per session, Season budget met; input >= 95 % known words (stem of items >= 98 %); can-dos CEFR-referenced | counts + source notes; unverified items flagged `[U]` |
| 3 | **Sequencing and progressive stack** | No slide/item requires language not yet introduced (input -> vocab -> notice -> practice -> produce); E7/E8 contain no new language; core productive words only E2/E6 (receptive/chunks may enter E1/E4/E5), structures only E3/E6 | walk every slide asking "has the student met every word and pattern here?" (words taught on their own page, language modelled by the cast, BEFORE any game asks for it); and check lesson n reuses language from ALL lessons 1..n-1 of the unit (`buildsOn`), not only the previous one |
| 4 | **Variety** | <= 2 same-kind in a row; not the same mechanic in the same segment as last session; >= 12 distinct mechanics per Season; >= 1 new/upgraded mechanic with >= 3 benchmarks researched; skins swap content only | list mechanics per session; compare with previous |
| 5 | **Comfort** (top priority) | comfort dock present; dial and Chill track defined; no visible timers by default; no public ranking/elimination; private-before-public recordings; feedback wording friendly; legible at 360 px and 1440 px; targets >= 44 px | UX checklist + `scripts/academy-comfort-audit.mjs` when code exists |
| 5b | **Vocabulary games** | after EVERY vocabulary introduction there are TWO different memorising games (drag-match, flip-memory, number games) before anything new; budgeted in the minutes | slide order vs rule test |
| 5c | **Modelling and the rule** | the teacher models the new language and the Mission task first (I do, we do, you do); the rule is stated in <= 3 lines BEFORE the practice and repeated by the student; the Wrap has a teach-back (owner, 2026-10-13) | slide/plan order: model -> rule -> games -> teach-back |
| 5d | **Pre-A1 reading-first** (owner 2026-10-15) | a Pre-A1 lesson activates prior knowledge (I know it / New to me), blends and spells, reads decodable lines AND a short message (a `passage`: listen, read, keep words), plays a word-bank game built from the kept words, and its vocabulary comes from the reading; teen content only | `pa1s02e1.test.tsx`, `lockLesson.test.tsx` (Reading-first), `docs/academy-pre-a1-reading-first.md` |
| 6 | **Fun** | >= 5 fun ingredients per session named and actually present (surprise Drop, skin, clue, expert flip, Release, humour, boss, Word Card, music, running joke); an Energiser; not a slideshow | ingredient list vs content |
| 7 | **Theme / story / cast** | only Academy cast-vault characters (Vee, Ava, Theo, Mia), none invented, each in line with their vault traits and visual blueprint; one theme; 8 clues each unlocked by that episode's language; finale pays off using the student's Release; cast consistent; school-safe; no mascots | read the arc end to end |
| 8 | **Voice** | all heard audio via recorded approved voices / `speak()`; no `speechSynthesis`; accurate pronunciation; silent if a clip is missing | grep + `voicePolicy.test.ts` / audit script |
| 9 | **Assessment validity** | each can-do is assessed; items production-weighted; one construct per item; distractors from real errors; delayed items >= 20 %; rubric per criterion; untimed default; retry allowed | read the checkpoint + rubric |
| 10 | **Progression** | recycle_from set (~30 % of E1 items from previous two Seasons); every item meets >= 8 varied encounters in >= 3 skills across the level; spiral structures; Big Remix every 2nd Season; level check at boundaries | roadmap validator output |
| 11 | **Safety / privacy** | recordings consent + indicator; no personal-data disclosure forced ("pass"/alias allowed); chat limited/logged; topics school-safe; data minimised | review flows |
| 12 | **Claims** | no unsupported efficacy claims; no CEFR promise by date; evidence labels kept ([V]/[K]/[RT]/[U]); guided hours described as guidelines | grep for "proven", "guaranteed", level promises |

## Report format

```
ACADEMY GATE - <artifact id> - <date>
1 Science      PASS|FAIL  <evidence / fix>
...
12 Claims      PASS|FAIL
Blocking issues: <list>   Open questions for the owner: <list>   Unverified facts: <list>
```
"Done" is allowed only with 12/12 PASS or explicitly owner-accepted exceptions listed in the report.

## Owner-facing summary rule

Report faithfully: what was verified, what was not (web sources, sizing assumptions, thresholds not yet piloted), and what remains to build. Never say "ready" for something that has not run in front of a student.

## Research and games check (owner rule 2026-10-14, CLAUDE.md "Research for every unit and every lesson")
Fail the unit/lesson if: (1) no `docs/research/academy-<unit-or-lesson>-research.md` with dated sources (Oxford, Cambridge, British Council, Pearson GSE, apps/platforms) and verified/unverified marks; (2) no games list from `docs/academy-games-catalog.md`; (3) no video-game mechanic from `docs/academy-video-game-mechanics.md` named with what the student does in English.

## Lesson plan check (owner rule 2026-10-14, CLAUDE.md "A lesson plan comes before every lesson")
Fail if: no approved plan from `docs/academy-lesson-plan-template.md`; the plan is not one-to-one and exactly 60 minutes; no response counts / practice ladder / error loop / mastery check (>= 80 student responses per hour); no traceability table (every activity -> objective or student need); no games from the catalogue (incl. section 13) or no video-game mechanic.

## Speaking check (owner rule 2026-10-14)
Fail a plan with student talk or speaking minutes below the level's targets in `src/curriculum/academy/speaking.ts` (`speakingProblems`), a lesson that never reaches its ladder step, no spoken Mission/Release, or no voice note in the Daily 10 (`docs/academy-speaking-practice.md`).

## Recall and spacing check (owner rule 2026-10-14)
Fail a plan or lesson with no Remember? list taken from `recallPlan`, no progress line (builds on / unlocks), or a Daily 10 that ignores the spacing calendar (`docs/academy-recall-spacing-progression.md`).

## Checklist check (owner rule 2026-10-14)
Fail a lesson whose success criteria are not 1-5 observable "I can ..." lines the teacher can mark in `LessonChecklistPanel`, or a Season whose final lesson has no unit assessment (six strands + Release rubric) feeding the lesson report (`docs/academy-lesson-checklist.md`).

## Game search and skills check (owner rule 2026-10-16)
Fail a lesson or unit if: (1) its research file has no "Game search" table with >= 5 candidates from >= 3 source families (language platforms, classroom games, commercial video games / game-design writing), each with source, mechanic, alignment result and verified/unverified mark; (2) a chosen game fails the alignment test in `docs/academy-lesson-creation-protocol.md` (serves a named criterion, practises the target English, fits stage and level, teen-appropriate and comfortable, buildable in the player and the hour); (3) the lesson was made without the protocol's skills, the handbook (Part 10) and, for a new mechanic, the game-dev skills (`gdev-prototype-fast`, `gdev-game-feel`, `game-animation`, `gdev-game-ui-ux`).
