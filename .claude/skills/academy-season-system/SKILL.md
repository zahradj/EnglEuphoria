---
name: academy-season-system
description: >
  REQUIRED FIRST for ANY Academy-hub work (ages 11-18, A1 -> C1, one-on-one 60-minute live lessons): designing a roadmap,
  Season, Episode, Live Session, Daily 10 practice, homework, quiz/assessment, player screen, or reviewing any of them.
  The master rules of the owner-approved "Season System": Level -> Season (= unit = 8 sessions) -> Episode -> 60-minute
  Live Session run of show; themed story worlds; fun ingredients; spaced "Remember?"; Daily 10; comfort first; scientific
  techniques built in. Routes to the other academy-* skills. Use before smart-lesson-architect / generate-lesson for Academy.
---

# Academy Season System — the master rules

Owner-approved 2026-10-08 (Season = unit = 8 sessions: yes; C1 added; spacing, last-time recap, homework and a gamified
10-minute daily practice: yes). Full text: `docs/academy-lesson-system.md`. Science: `docs/academy-learning-science.md`.
Games: `docs/academy-games-catalog.md`. Evidence base: `docs/research/academy-lesson-design.md`, `docs/research/academy-teen-games.md`.
If a doc and this skill disagree, the **owner's latest message wins**, then the docs, then this file; flag the conflict.

## The facts every Academy output must respect

- **One-on-one, live, 60 minutes**, teacher + ONE student, shared interactive stage + teacher video. Plus a solo **Daily 10**.
- **Ages 11-18.** Two looks on one layout: Explorer (11-13) and Studio (14-18). Never childish, never mascots/stickers
  (Academy prompt ban); teen idiom: quests, unlocks, Word Cards, drops.
- **Levels A1 -> A2 -> B1 -> B2 -> C1.** Approved sizing: **A1 10, A2 12, B1 16, B2 16, C1 16 Seasons = 70 Seasons**
  (sessions 80 / 96 / 128 / 128 / 128 = **560**). Recompute from the doc table if you change anything.
- **Comfort is the top priority** (owner). Fun is mandatory. Units are **themed**.
- **Sessions per week vary (1, 2 or 3).** Roadmaps are counted in sessions. All spacing uses **calendar days since last seen**.
- **Nothing is built yet** as of 2026-10-08: the Academy player is solo-only (`PlayAcademyLesson` `roomId`/`role` inert);
  `cefrRoadmap.ts` returns an empty scaffold for Academy. Do not write as if the live mode or roadmap data exists.

## Structure

| Layer | Size | Notes |
|---|---|---|
| Level | A1..C1 | each ends with a level check (separate from XP) |
| **Season** (= unit) | **8 sessions**, one theme, one story arc, one Release | 1-2 structures, 60-90 new items, 3-6 skins |
| Episode | E1 Cold Open · E2 Word Lab · E3 Pattern Lab · E4 On Air · E5 Deep Dive · E6 Side Quest · E7 Remix · E8 Finale | core productive words only in E2/E6 (receptive items/functional chunks may enter E1/E4/E5), new structure only in E3/E6, **zero new language in E7/E8**; <= 14 new items per session (<= 84 per Season) |
| Live Session | 60 min | Check-in 5 · Remember? 7 · The Drop 10 · Notice & Build 10 · Energiser 4 · Mission 12 · Release 7 · Wrap 5 |

Core (never skipped, 45 min): Remember?, Drop, Notice & Build, Mission, Release, Wrap. Flex (15): Check-in, Energiser, Take 2, extra practice.
Every 2nd Season: E7 is a **Big Remix** (two Seasons). C1 shape: supports off, Language Lab (E3), seminar/pitch (E4), mediation every Season.

## Non-negotiables

1. **Remember? opens every session** (last-time recap card + retrieval of due items, production first). Spacing by calendar days.
2. **Never ask for language not yet introduced** (input -> vocabulary -> notice -> practice -> produce).
3. **Every Season ends in a Release** (the student makes something in English) and a mixed checkpoint (E8).
4. **Every session has a Mission with Take 1 -> feedback -> Take 2** and a **difficulty dial** (Chill / Normal / Push) chosen by the student.
5. **Comfort dock always present**: Hint (tiered), Slow down/Repeat, "I need a minute", private rehearsal, type-instead-of-speak, emoji, camera options, Easier/Same/Harder, pick-of-2.
6. **No public ranking, no elimination, no visible countdown by default, no forced camera/voice.** Wording is "Not yet - try again".
7. **Fun**: >= 5 fun ingredients per session (surprise Drop, student skin, story clue, expert flip, Release, humour, boss, Word Card, music, reactions, running joke).
8. **Variety**: <= 2 same-kind in a row; never the same mechanic in the same segment two sessions running; >= 12 distinct mechanics per Season; >= 1 new or upgraded mechanic per Season, researched against >= 3 benchmarks (project rule).
9. **Voice rule (CLAUDE.md hard rule)**: all heard audio via `speak()`/recorded approved American voices; never `speechSynthesis`; multi-talker listening uses several approved voices; silent if a clip is missing.
10. **Progress is honest**: delayed, production-based evidence; level claims only from a separate level test; never XP/streak as proof of learning.
11. **Science is built in, not decorative**: every segment names the technique it implements (see science doc); no unsupported claims.
12. **Safety**: recording only with guardian consent and a visible indicator; no public profiles/location; chat lesson-only; school-safe topics (no graphic violence, partisan politics, explicit content).
13. **Personalise by interest ("My World" skins)** but keep the language spine identical across skins.
14. **Teacher-in-the-loop**: the teacher sees the plan, talk-time, hint/minute counts and can switch to the Chill track; the student never sees the plan drawer.
15. **Quality gate before "done"**: run `academy-quality-gate`.

## Which skill when

| Task | Skill |
|---|---|
| Build the CEFR roadmap / a Season spec (theme, story, words, structures, Release) | `academy-roadmap-architect` |
| Turn an Episode into a 60-minute session plan with teacher script | `academy-session-builder` |
| Pick the right game/activity for a segment, theme, objective and student | `academy-activity-selector` |
| Decide what a student needs more practice in; plan next session / Daily 10 | `academy-learner-diagnostics` |
| Daily 10, homework, last-time recap, gamified self-practice | `academy-daily-practice` |
| Quizzes, checkpoints, level tests, rubrics, item bank | `academy-assessment-designer` |
| Layout, tokens, comfort dock, live-mode behaviour, gamification presentation | `academy-player-ux` |
| Final check before reporting done | `academy-quality-gate` |

Also still apply (repo skills): `activity-pattern-library` (what components exist), `game-animation` (juice), `classroom-sync-robustness` (live sync),
`lesson-variety-engine` (research log), `kids-video-scenario`/`video-quality-gate` (any video; Academy teens still need a written scenario first).

## Open items (ask the owner, don't assume)

- Academy hand-off rule: CLAUDE.md's "Lesson hand-off" is written for the Playground Library; confirm the Academy equivalent before reporting a lesson "ready".
- "My World" skin content cost (3-6 per episode); Daily 10 first-release scope (minimal version recommended: due reviews + voice note + recap card).
- Real Academy slot titles in `curriculum_lessons` (Supabase was unreachable on 2026-10-08): query the FULL blueprint (no unit filter) before naming or re-theming any Season.
