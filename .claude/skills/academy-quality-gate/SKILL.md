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
| 3 | **Sequencing and progressive stack** | No slide/item requires language not yet introduced (input -> vocab -> notice -> practice -> produce); E7/E8 contain no new language; core productive words only E2/E6 (receptive/chunks may enter E1/E4/E5), structures only E3/E6 | walk every slide asking "has the student met every word and pattern here?"; and check lesson n reuses language from ALL lessons 1..n-1 of the unit (`buildsOn`), not only the previous one |
| 4 | **Variety** | <= 2 same-kind in a row; not the same mechanic in the same segment as last session; >= 12 distinct mechanics per Season; >= 1 new/upgraded mechanic with >= 3 benchmarks researched; skins swap content only | list mechanics per session; compare with previous |
| 5 | **Comfort** (top priority) | comfort dock present; dial and Chill track defined; no visible timers by default; no public ranking/elimination; private-before-public recordings; feedback wording friendly; legible at 360 px and 1440 px; targets >= 44 px | UX checklist + `scripts/academy-comfort-audit.mjs` when code exists |
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
