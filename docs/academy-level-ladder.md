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

## 5. Scale: the platform is growing (research and measurements, 2026-10-12)
What other platforms do (limited, from search): Lingoda covers A1-C1 with CEFR labels and a certificate after each 50 classes ([Lingoda](https://www.lingoda.com/en/english-learn-by-level/)); Novakid uses its own age-appropriate level names aligned to CEFR and covers Pre-A1 to B1 for children ([Novakid](https://www.novakidschool.com/blog/novakid-curriculum-aligned-with-cefr-levels/)); Pearson's Global Scale of English keeps a fine numeric scale (10-90) and maps course books onto it, with free learning objectives per audience (young learners, adult, professional) ([Pearson GSE](https://pearson.com/english/about/gse/learning-objectives.html)); Duolingo maps its test score bands to CEFR with an outside validation ([Duolingo](https://blog.englishtest.duolingo.com/duolingo-test-aligned-with-cefr)). Could not confirm: EF level details, Duolingo course unit counts. Licence note: the CEFR can-do statements belong to the Council of Europe (permission needed to republish), so our can-dos must be our own wording.

What our own repo says about growth (measured today):
| Risk | Today | At 608 lessons | Advice |
|---|---|---|---|
| **Lesson production** | 3 hand-built deck lessons, each took many review rounds | 600+ lessons cannot be hand-built | build the map for all steps, but produce lessons in slices (Pre-A1 + A1 first); make a lesson mostly **data**: season spec -> deck generator using episode templates + the game menu + lanes, then human review and the quality gate |
| **Audio files** | 427 clips = 13 MB in `public/academy-audio/` (in git) | roughly 80,000+ clips, about 2-3 GB | move audio to object storage / CDN (not git); **one manifest per lesson**, loaded on demand (today `manifest.json` is one file loaded whole by `loadManifest`) |
| **Roadmap in code** | 1,220 lines of TS in `levels/*.ts`, tests that assert 70 Seasons / 560 sessions | levels are hard-coded and every change breaks totals | one **ordered step list** with stable ids; tests check invariants (ordered, no gaps, every step has Seasons), not totals; later move the roadmap to data/DB |
| **Lesson registry** | hand-listed `ACADEMY_DECK_LESSONS` | hundreds of entries | generate the registry from lesson files / DB; library already groups level -> season -> lesson |
| **Choice overload** | 5 level tabs | 11 steps | students see a simple label ("A1", "A1 Upper") and the next lesson; the full ladder is for teachers/creators |
| **Placement** | none yet | 11 steps cannot be told apart by a 5-minute test (Busuu's placement is about 5 minutes, [Busuu](https://help.busuu.com/hc/en-us/articles/16526383831569-What-is-a-Placement-Test)) | placement picks the CEFR level; the step inside it comes from the first lessons (lane + results) |

Two different axes, do not mix them: the **ladder** says where the student is in the curriculum (Pre-A1 ... C1 Upper); the **lane** (Start / Core / Stretch) says how hard one lesson is for this student today.

## 6. My recommendation
1. **Yes to the ladder, as one Pre-A1 and an Upper for every level** (not a Pre for every level; it duplicates the previous Upper). Show the CEFR label plus "Upper"; call A1 Upper and C1 Upper ours, never an exam claim.
2. **Make it data, not code, now** (cheap, and it is what lets the platform grow): an ordered step list with stable ids (`pre-a1`, `a1`, `a1-upper`, ...) and display labels in one file; roadmap tests check invariants instead of 70 / 560.
3. **Build in slices, level by level, as you said:** Pre-A1 and A1 first (96 sessions of Seasons, with A1 Upper outlined); leave A2 and above as outlines until A1 has real students and data. Do not decide the A2+ splits now.
4. **Fix the scaling risks before the lesson count grows:** audio out of git and manifests per lesson (do this before Pre-A1 lessons are baked); a lesson generator for the repeated episode shapes.
5. **Placement and lanes:** keep lanes inside lessons; add a short placement later, to choose the CEFR level only.

## 7. Decisions needed
1. Approve the ladder (one Pre-A1, then core + Upper for every level)?
2. Approve doing the data-driven step list first (small change, no content), then Pre-A1?
3. Approve moving audio out of git and splitting manifests per lesson before more voices are baked?
