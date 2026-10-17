---
name: academy-season-arc
description: >
  Design or audit the arc of one Academy Season: ONE theme with an essential question, the Release as the performance task, and
  eight episodes that are each a related, progressive chapter of that theme (one sub-question, one complexity step, one open
  question handed to the next episode). Use when creating or rebuilding a Season or any of its 8 episodes, when the owner says
  "the season theme should be one and the episodes related, progressive and systematic", or before writing a Season/lesson plan.
  Run academy-season-system first; pairs with academy-roadmap-architect (the data), academy-lesson-craft (one lesson) and academy-quality-gate.
---

# Academy Season Arc — one theme, eight related, progressive chapters

Owner rule (2026-10-16): "the season theme should be one, and the episodes should be related to this. But they should be progressive and systematic." Research and limits: `docs/research/academy-season-theme-arc-research.md`. Academy only (hub separation).

## What already guarantees "systematic" (do not rebuild)
`lessonBlueprint.ts` + `validateRoadmap.ts`: eight fixed episode types, a cumulative stack (L1, L1+L2+new, ... L8 no new language), item counts continuous and ending at the Season budget, structure only in E3 (optionally E6), clues 1-8 in order, recycle from the previous Seasons. Tests: `seasonThemes.test.ts`, `seasonArc.test.ts`. Never weaken them.

## Global since 2026-10-16
Every Season (A1-C1, 80) carries `essentialQuestion` + 8 `chapters` (`levels/*.ts` may write them by hand, as B1-S01 does; otherwise `seasonArc.ts` derives them from the Season's own theme, fields, functions, structure and Release). `validateRoadmap` fails a Season without them; the lesson lobby shows "Chapter N of 8" and the library lists them. **Derived chapters are a floor, not the goal:** rewrite them by hand (like B1-S01) when you build or rebuild a Season; the derived wording is mechanical. Pre-A1 Seasons (a different structure, `preA1.ts`) have a theme but no chapters yet.

## What this skill adds: related and progressive
1. **Theme promise (one line) and essential question.** Theme = the single world. Essential question = what the student can answer in English at the end, e.g. "What have I done and what do I want to do?" The Release answers it. If you cannot state it in one line, the theme is two themes.
2. **Backwards:** Release first, then the Finale checks it, then each episode earns one piece of it.
3. **Chapter table (write it in the Season spec, `docs/academy-<season>-spec.md`):** for each of E1-E8:
   | E | Chapter title (a sub-question INSIDE the theme) | Piece of the essential question it answers | New language (only what this chapter needs) | Complexity step (ONE dimension up) | Story beat / clue | Open question handed to E+1 |
   Default chapter arc: E1 meet the theme (gist, curiosity) → E2 name it (thematic words) → E3 say it (the pattern, in the theme's situations) → E4 use it with another person (functional exchange) → E5 find more in it (longer text, detail) → E6 choose your own angle (skin) → E7 test it (Remix, known language only) → E8 show it (Release).
4. **Progressive = one complexity dimension per step** (Robinson's task complexity): e.g. recognise → controlled → guided → free with planning time → longer or more reasoning (more elements, less planning, more steps, less scaffolding). Never raise two at once. The Release is the most complex task of the Season.
5. **Related = every episode's objective, Mission and Release line use the theme's situations.** A chapter that could sit in any Season is a failed chapter.
6. **Thematic, not semantic sets.** Teach words that go together in a situation (a trip: *ticket, delay, souvenir*); do not put several same-category words or near-synonyms in one lesson (all feeling adjectives together, *big/large/huge*); split the confusable ones across lessons and test them apart.
7. **Open loop:** each episode ends with a question the next one answers (the clue). A motivation device only; make no learning claim.
8. **Four strands across the eight:** meaning-focused input (E1, E5), output (E4, E6, E8), language focus (E2, E3), fluency on known language (E7, E8). The Mission and Release use language from ALL earlier episodes (`buildsOn`), and a share from earlier Seasons (`recycleFrom`) so a theme never becomes a silo.
9. **Real talk leaves the word list:** every Mission allows the student's own words and a "how do I say..." from the teacher; the word list is a floor.

## Procedure
1. Read the Season in `src/curriculum/academy/levels/<level>.ts` and its blueprints; run `npx vitest run src/curriculum/academy/__tests__/seasonArc.test.ts`.
2. Write the one-line theme promise and the essential question; check the Release answers it.
3. Fill the chapter table; check the checklist below.
4. Hand the table to `academy-session-builder` / `academy-lesson-craft` for each lesson; each lesson's plan names its chapter, complexity step and the open question it inherits and hands on.
5. Report with the gate (`academy-quality-gate`, check 7 "Theme / story / cast" and 3 "Sequencing"), citing the table.

## Checklist (all must be yes)
- [ ] One theme, one essential question, the Release answers it.
- [ ] Eight distinct chapter titles, each a sub-question inside the theme, none interchangeable with another Season's.
- [ ] Each chapter names the piece of the essential question it answers.
- [ ] Exactly one complexity dimension rises per step; the Release is the hardest task; E7/E8 add no new language.
- [ ] New language per chapter is thematic and not a same-category set; confusable items are in different lessons.
- [ ] Each episode hands a question to the next; clue 1-8 matches.
- [ ] Mission and Release reuse language from all earlier episodes and some from earlier Seasons.
- [ ] Open space for the student's own words in every Mission.

## Honest limits
No controlled study shows chaptered arcs beat a plain template, nor that spiral sequencing helps L2 learners (descriptive only). Treat the arc as a reasoned design; confirm with a pilot student and the teacher checklist data. Semantic-clustering effects are mixed.
