# Academy unit (Season) structure — four skills + grammar + vocabulary (proposal, 2026-10-14)

**Status: proposal for owner approval.** Builds on the existing Season (8 one-to-one 60-minute lessons, `docs/academy-lesson-system.md`). Evidence base: `docs/academy-learning-science.md` and `docs/research/academy-curriculum-teen-sla-and-l1-gaps.md` (search-based; several claims unverified there). Numbers marked [target] are design goals, not measured results.

## 1. Principle
One unit = one communicative goal (the Release) reached through **vocabulary → grammar → the four skills → a product**, with the **same items met many times, in different ways, spread over days**. Fast acquisition comes from repeated, varied, spaced retrieval and output with feedback, not from more input.

## 2. The skills × language matrix (headline focus per lesson; every lesson still touches all four skills)
| Lesson | Headline | Vocabulary | Grammar | Listening | Speaking | Reading | Writing |
|---|---|---|---|---|---|---|---|
| E1 Cold Open | context + gist | meet ~12 words (receptive) | none (recycle) | **gist** from story | react, predict | context text | one-line reply |
| E2 Word Lab | vocabulary + sound | **core words, productive** | none | words in context | **repeat, say, pronounce** | word cards | type the words |
| E3 Pattern Lab | grammar | chunks tied to the pattern | **notice → rule → drill → free** | spot the pattern | **controlled → free sentences** | text with the pattern | write 3 sentences |
| E4 On Air | real exchange | functional chunks | pattern in use | **listen for detail** | **interaction (role-play)** | script | message |
| E5 Deep Dive | longer text | receptive words from text | pattern in text | listen to the text | retell | **longer text** | **short written piece** |
| E6 Side Quest | student's pick | light new language, student's skin | second pattern (optional) | integrated | integrated | integrated | integrated; **mediation / school / exam lane** |
| E7 Remix | retrieval | all unit words | all unit patterns | mixed | mixed | mixed | mixed (zero new language) |
| E8 Finale | product + check | — | — | checkpoint | **Release (spoken)** | checkpoint | **Release (written)**; checkpoint scores per strand |

## 3. A lesson's inner structure (60 min, all four skills in every lesson)
Remember? (retrieval of the last two lessons) → Drop (listening/reading input, gist) → Learn set 1 (teach with I do / we do / you do, rule stated) → intensive gamified practice (≥ 80 responses; practice ladder; error-return loop) → Read/Listen (text) → Learn set 2 → Mission (speak or write the product) → Wrap (teach-back, Daily 10). Teacher talk ≤ 40 %.

## 4. Acquisition levers built into every unit
1. **Spaced retrieval:** Remember? every lesson; Daily 10 on days 1, 3, 7; items return in the next two units.
2. **Many encounters, many ways:** each item met ≥ 6 times in 4 modes (hear, say, build/spell, read, match, use) inside the lesson; ≥ 10 times in 7 days with the Daily 10 [target].
3. **Output with feedback:** every lesson ends in the student producing language (Mission), one thing done well + one to try, then Take 2.
4. **Interleaving:** old and new items and patterns mixed in practice; blocks only for the first few items.
5. **Chunks first, rule stated plainly, teach-back** (CLAUDE.md modelling rule).
6. **Small new load:** ≤ 14 new items per lesson (Pre-A1: 8); E7 and E8 add nothing.
7. **Error-return loop and mastery check** (move on at ~80 % with ≤ 1 hint, else the easier track).
8. **Gamified practice** from the 168-game catalogue plus a video-game mechanic, no leaderboards.
9. **Skills ledger:** across the unit each skill gets its target share (level frames in `src/curriculum/academy/levelFrames.ts`); a test fails a unit where a skill falls below its floor.

## 5. Unit rhythm and measurement
- 2 lessons a week = 4 weeks per unit; Daily 10 between lessons (10 min, split by skill).
- E8 checkpoint reports **six strands** (listening, speaking, reading, writing, vocabulary, grammar) so the parent and teacher see which one lags; a lagging strand gets extra Daily 10 time and a focus in the next unit's E1/E7.
- Unit success = Release produced + checkpoint at target + the unit's items "Known" in the item tracker (`academy-learner-diagnostics`).

## 6. What would change in the repo if approved
1. Add `skillFocus` (per lesson: headline skill + the four touchpoints) to the Season data and the lesson blueprint, and a validator for the skills ledger.
2. Make the six-strand checkpoint report part of E8's blueprint and the parent report.
3. Add the matrix above to `docs/academy-lesson-plan-template.md` (step 4) so every lesson plan states its four-skill touchpoints.
4. Regenerate `docs/academy-curriculum/*.md` with a per-Season matrix.

## 7. Decisions for the owner
1. Keep the 8-lesson Season and the E1–E8 roles, adding the matrix and the skills-ledger test?
2. Is the headline per lesson right (e.g. E5 reading + writing, E4 speaking + listening)?
3. Is a six-strand checkpoint report what parents and teachers should see?
