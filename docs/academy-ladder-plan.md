# Academy ladder: deep research and a plan that is not too much work (2026-10-12)

Owner: "do a deep research from different sources, create a plan, tell me; creating pre-A / A / upper-A is a lot of work." **Status: proposal for discussion; no code changed.** Builds on `docs/academy-level-ladder.md` and `docs/academy-pre-a1-curriculum.md`.

## 1. The most important finding: "Upper" is almost free, Pre-A1 is the expensive part
- Today's roadmap already has 70 Seasons / 560 sessions. An **Upper step adds no lessons**: it is a *boundary* inside the Seasons we already have (for example A1 has 10 Seasons: the first 6 are A1, the last 4 are A1 Upper). The work is a label, a place in the library, a short step check and a slightly lighter support setting.
- **Pre-A1 is new content**: reading and blending mechanics that do not exist in the player, and 24-48 new sessions. That is where the work is, so that is where to be careful.

## 2. Sources (different kinds), what they say, and how reliable
| Question | Source | Finding | Reliability |
|---|---|---|---|
| Are there official in-between levels? | [CoE CEFR Companion Volume 2020](https://rm.coe.int/common-european-framework-of-reference-for-languages-learning-teaching/16809ea0d4), [TEFL Today](https://tefltoday.org/knowledge-base/cefr/2020-companion-volume-guide) | Pre-A1 is official; plus levels A2+, B1+, B2+ are official; no A1+ or C1+ | high (primary) |
| How do publishers handle finer steps? | [Pearson GSE mapping booklets](https://www.pearsoncanadaschool.com/content/dam/websites/pearson-canada-school/assets/documents/literacy/nik/1-NIK-I-Can-Read-Mapping-Booklet.pdf), [GSE learning objectives](https://pearson.com/english/about/gse/learning-objectives.html) | a fine numeric scale (10-90); course books overlap two CEFR levels (Pre-A1/A1, A1/A2...) | high (publisher), a commercial scale |
| How do online schools label levels? | [Lingoda](https://www.lingoda.com/en/english-learn-by-level/), [Novakid](https://www.novakidschool.com/blog/novakid-curriculum-aligned-with-cefr-levels/) | Lingoda: plain CEFR A1-C1; Novakid: own age-friendly names mapped to CEFR, Pre-A1 to B1 | medium (marketing pages) |
| How long does each level take? | [Cambridge guided learning hours](https://support.cambridgeenglish.org/hc/en-gb/articles/202838506-Guided-learning-hours) and school/blog summaries ([English Express](https://www.englishexpress.com.sg/articles/cefr-hours-per-level-english/), [Migaku](https://migaku.com/blog/language-fun/how-long-to-learn-english)) | cumulative: A1 90-100, A2 180-200, B1 350-400, B2 500-600, C1 700-800 h; A1 to A2 quoted anywhere from 150 to 300 h; no official Pre-A1 figure | Cambridge high, blogs low; huge variation |
| How big is the vocabulary per level? | [Cambridge English Vocabulary Profile](https://textinspector.com/help/lexis-evp/), [A2 Key list](https://www.cambridgeenglish.org/tr/Images/506886-a2-key-2020-vocabulary-list.pdf) | a level is assigned to each word meaning (A1-B2); rough sizes seen in one uncited blog: A1 ~500, A2 1,000-1,500 | EVP high; the counts low |
| How long does it take to build interactive lessons? | [Chapman Alliance via Learning Reframed / Leading Learning](https://www.leadinglearning.com/cost-to-create-e-learning) | 2010 survey: about 79 h per finished hour (basic), 184 h (interactive), 217-716 h (advanced simulations) | medium, old, but the best public benchmark |
| Do finer levels or milestones keep students? | practitioner blogs (e.g. [Migaku goals](https://migaku.com/blog/language-fun/language-learning-goals-setting)) | "smaller milestones help"; **no study tested sub-levels against dropout**; streak numbers come from a vendor, unverified | low |
| Teen-specific ladder? | [Cambridge Pre A1 Starters / A1 Movers / A2 Flyers picture book](https://www.cambridgeenglish.org/Images/starters-word-list-picture-book.pdf) | Cambridge's own young-learner route uses only three steps (Pre A1, A1, A2) | high but for ages 6-12 |

What I could not find: any evidence that "pre / level / upper" for every level improves learning; Cambridge's own Pre-A1 hours; Duolingo/EF course unit counts. So the ladder is a design decision, not a research result.

## 3. Workload, honestly
Chapman's interactive benchmark (184 h per finished hour) would make 608 hand-built hours about 112,000 hours; that is not our situation, because our lessons are data on a shared player, but it shows the order of magnitude of the risk. Our own experience: each of the three lessons needed many review rounds. Planning assumption (a judgement, not a measurement): **about 10-20 working hours per lesson** once a generator and templates exist, much more before.

| Piece | New lessons | Other work | Size |
|---|---|---|---|
| Upper labels (data-driven step list, library tabs, step checks) | 0 | config + UI + tests | small |
| Pre-A1 "Lite" (3 Seasons, 24 sessions, about 100 words, blending and reading) | 24 | reading mechanics (tap-to-hear text, blend slider, decodable reader), decodability test | medium-large |
| Pre-A1 "Full" (6 Seasons, 48 sessions, about 220 words) | 48 | same | large |
| Finish A1 (10 Seasons) | 77 more (3 exist: lessons 1-2 + sample) | generator, audio storage, per-lesson manifests | the real bulk |
| A2 to C1 | 528 | placement, level tests, generator at scale | later, not now |

## 4. Three options
**Option 1: Keep CEFR only, no Pre-A1.** A1 to C1 as today; zero-knowledge students use the A1 "Start" lane. Cheapest, but it cannot teach reading from scratch, which is the gap you raised.
**Option 2: Full ladder** (Pre-A1 Full + every Upper). 608 sessions. Most complete, most work, and the long ladder is mostly outlines for years.
**Option 3 (my recommendation): Lean ladder, built in order.**
1. **Now (small):** make the ladder a data-driven step list with stable ids (`pre-a1`, `a1`, `a1-upper`, `a2`, ...). Marking Upper costs no lessons. Roadmap tests stop asserting 70/560 and check invariants. Show "Upper" only to teachers and creators at first.
2. **Then Pre-A1 Lite** (3 Seasons, 24 sessions) as the first new content, with the reading mechanics; grow it to 6 Seasons only if the first students need it.
3. **Then finish A1 (core + Upper)** with a lesson generator and templates, plus audio in object storage and per-lesson manifests (needed before the voice files grow).
4. **A2 and up stay outlines** until A1 has real students, data and a placement test. Do not decide their splits now.
Why: you get the structure you wanted (Pre-A1, level, Upper) at almost no content cost, spend the real effort on the part with a real gap (reading from zero), and keep every later decision open.

## 5. Risks and how the plan handles them
- Students see too many labels: only teachers/creators see the full ladder at first.
- Overlap of levels (Pearson shows adjacent levels overlap): steps are a guide; a student can move up or down; no "level claim" without the level test (project rule).
- Pre-A1 Lite may be too short: the plan grows it from 3 to 6 Seasons when real students need it.
- Audio and registry growth: moved out of git and generated before volume grows (see `docs/academy-level-ladder.md` §5).
- Licence: write our own can-do statements; do not copy CEFR or GSE text.

## 6. Decisions for the owner
1. Option 3 (lean ladder)? Or Option 1 / Option 2?
2. Pre-A1 Lite first (24 sessions), growing to 6 Seasons later?
3. Show "Upper" to teachers/creators only at first?
4. OK to start with the data-driven step list (no content) before any new lesson?
