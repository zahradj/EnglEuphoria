# Academy lesson design: analyse, research, choose, then author (owner, 2026-10-17)

"Each lesson should hold its own activities, just like the Playground... it shouldn't work on a skeleton... before scoping any lesson, search the internet first, find compatible activities, video games, games, interactive games (focus on interactive)... analyse the lesson first before you determine which technique, approach and method to use."

The fixed eight-part run of show (Check-in, Remember?, The Drop, Notice & Build, Energiser, Mission, Release, Wrap) is **retired as a frame**. It survives only as `RUN_OF_SHOW` in `lessonBlueprint.ts`, marked legacy, because the old deck player and its tests still read it. The v2 player reads none of it: a lesson declares 1-12 **acts** (`partMinutes`, summing to 60) and its own scenes.

## The process (adapted from the Playground: orient, activity purposes, pattern library, variety engine, gate)
1. **Analyse** (`LessonAnalysis` in `src/curriculum/academy/lessonDesign.ts`): objective and 1-5 "I can" criteria; what the student already knows (an Academy student met much of it at school); the gap; the skills needed (listening, reading, speaking, writing, vocabulary, grammar, pronunciation, interaction); new or partly known; level. If the objective or the student's need calls for listening or reading, the lesson gets listening or reading activities.
2. **Research the internet** for compatible activities, **interactive games first**, video-game mechanics and classroom games for each criterion (log in `docs/research/academy-<lesson>-research.md`, "Game search": >= 5 candidates, >= 3 source families, verified/unverified, 1-2 chosen per criterion; mechanics only).
3. **Choose the approach(es)** with `suggestApproaches()` as a start and your judgement as the decision: PPP for new rule-governed language, test-teach-test for half-known language, communicative / task-based when the goal is to do something in English, guided discovery for visible patterns, lexical for chunks, skills (pre / while / post) for reading and listening, genre for writing, project for showcases, game-based for motivation, sounds-first for Pre-A1. Write the choice and the reason in the plan.
4. **Write each activity's purpose** (which criterion or need it serves; an activity that serves none is cut) and pick its scene kind and look; vary from the last two lessons (`shape`, `docs/academy-lesson-shapes.md`).
5. **Author the acts** (named by the lesson, not by the template) and the scenes. Then the gates: required ingredients, variety, art check, voice, comfort, `academy-quality-gate`.

## What stays (ingredients, any order; `REQUIRED_INGREDIENTS`)
Objective with observable criteria; the need written first; research before the plan; the approach and its reason; earlier learning returns; new language modelled and any rule stated plainly before production, restated by the student; speaking is the largest share; several different interactive games each tied to a criterion; comfort, recorded voices, art checked; every activity traceable.

## Handbook
`docs/handbook/Academy-Hub-Curriculum-and-Lesson-Handbook.pdf` still describes the old eight-part run of show. Read it as background and techniques; this page overrides its lesson structure. (A PDF cannot be edited here; regenerate it from its source when one is available.)
