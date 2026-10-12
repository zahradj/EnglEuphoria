# Academy level ladder: Pre-A1, level, Upper (proposal, 2026-10-12)

Owner question: can every level have a "pre", the level, and an "upper" step (pre-A1, A1, A1 upper, ...)? **Status: proposal. Nothing in the roadmap code is changed.**

## 1. What the research says (and does not)
- The CEFR Companion Volume (2020) adds **Pre-A1** and defines **plus levels**: the descriptors distinguish "criterion levels" (A2) from "plus levels" (A2+, also written A2.2); the official plus levels are **A2+, B1+, B2+**. I found **no official A1+ or C1+**; they are used by publishers but are not Council of Europe levels ([CoE Companion Volume](https://rm.coe.int/common-european-framework-of-reference-for-languages-learning-teaching/16809ea0d4), [TEFL Today guide](https://tefltoday.org/knowledge-base/cefr/2020-companion-volume-guide)).
- Publishers already work with finer steps: Pearson's Global Scale of English (10-90) splits CEFR levels into narrow bands and its course books overlap neighbouring levels (for example Level 1 = Pre-A1/A1, GSE 19-29; Level 2 = A1/A2, GSE 27-34) ([Pearson mapping booklets](https://www.pearsoncanadaschool.com/content/dam/websites/pearson-canada-school/assets/documents/literacy/nik/1-NIK-I-Can-Read-Mapping-Booklet.pdf)). Ranges overlap, so a step is a guide, not a hard wall.
- Cambridge's guided-learning-hour guide is cumulative from a complete beginner: about A1 90-100, A2 180-200, B1 350-400, B2 500-600, C1 700-800 hours; Cambridge publishes **no Pre-A1 hour figure**, and says these are guidelines ([Cambridge helpdesk](https://support.cambridgeenglish.org/hc/en-gb/articles/202838506-Guided-learning-hours)).
- Not found: a source that recommends a "pre / level / upper" triple for every level, or any evidence that students learn better with that labelling. This is a design choice, not a research finding.

## 2. The catch: "Pre-B1" is the same place as "A2 Upper"
A "pre" step of every level overlaps the "upper" step of the level before it (Pre-A2 = A1 upper). Keeping both would put two names on one stage. So the clean ladder has **one Pre (at the start) and an Upper for every level**:

| Step | CEFR meaning | Label we show |
|---|---|---|
| 1 | Pre-A1 (official) | Pre-A1 |
| 2 | A1 | A1 |
| 3 | A1+ (not official, ours) | A1 Upper |
| 4 | A2 | A2 |
| 5 | A2+ (official) | A2 Upper |
| 6 | B1 | B1 |
| 7 | B1+ (official) | B1 Upper |
| 8 | B2 | B2 |
| 9 | B2+ (official) | B2 Upper |
| 10 | C1 | C1 |
| 11 | C1+ (not official, ours) | C1 Upper |

"Upper" means the bridge: the student can do the level's tasks and starts the next level's. The label shows the CEFR level plus our word; we never claim an exam level from it. Level claims still come only from the separate level test (project rule).

## 3. Sizes: split the existing seasons, add only Pre-A1
The roadmap today has A1 10, A2 12, B1 16, B2 16, C1 16 Seasons (70 Seasons, 560 sessions of 8 per Season). Splitting each level in two halves keeps the totals; only Pre-A1 is new (6 Seasons, 48 sessions, see `docs/academy-pre-a1-curriculum.md`).

| Step | Seasons | Sessions | Cumulative sessions |
|---|---|---|---|
| Pre-A1 | 6 (new) | 48 | 48 |
| A1 | 6 | 48 | 96 |
| A1 Upper | 4 | 32 | 128 |
| A2 | 6 | 48 | 176 |
| A2 Upper | 6 | 48 | 224 |
| B1 | 8 | 64 | 288 |
| B1 Upper | 8 | 64 | 352 |
| B2 | 8 | 64 | 416 |
| B2 Upper | 8 | 64 | 480 |
| C1 | 8 | 64 | 544 |
| C1 Upper | 8 | 64 | 608 |

Sanity check against Cambridge's cumulative hours (1 session = 1 hour of live lesson; the Daily 10 adds roughly 10 minutes a day on top): end of A1 Upper 128 (A1 90-100, A2 starts later: fine, slower on purpose for teens), end of A2 Upper 224 (A2 180-200), end of B1 Upper 352 (B1 350-400), end of B2 Upper 480 (B2 500-600, slightly under), end of C1 Upper 608 (C1 700-800, under by about 100; the Daily 10 and extensive reading make up part of it). Treat as rough.

## 4. What would change in the code
- `AcademyLevel` gets `'Pre-A1'`; every Season gets a `stage: 'core' | 'upper'` (Pre-A1 has only core).
- Level checks: a short **step check** at the end of each Upper step; the full level test stays at the end of the Upper step of each CEFR level.
- The library groups by CEFR level with two tabs inside (core / upper); Pre-A1 first.
- Tests that assert 70 Seasons / 560 sessions are updated to 76 / 608; the lesson blueprint's level-specific supports (hints, speed, speaking ladder) get an "upper" setting that fades the supports a little further than the core step.
- Season sizes: A1 Upper is 4 Seasons (not 5) because A1 is 10 Seasons; this keeps the existing A1 Seasons as they are.

## 5. My recommendation
Yes, but with one Pre (Pre-A1) and an Upper for every level, not a Pre for every level. Call the steps "Pre-A1, A1, A1 Upper, A2, ...". Treat A1 Upper and C1 Upper as our own labels. Build it level by level, as the owner said, starting with A1: Pre-A1 first, then split the current 10 A1 Seasons into A1 (6) and A1 Upper (4).

## 6. Decisions needed
1. Approve the ladder (one Pre-A1, then core + Upper for every level)?
2. Approve splitting the current A1 into A1 (6 Seasons) and A1 Upper (4 Seasons)?
3. Show "Upper" to students, or only in the teacher/creator views?
