# Academy lesson player v2 — redesign from zero: plan for approval (2026-10-17)

> **Owner request (2026-10-17):** "remove the lessons created, clean up. Also remove the player created, and create a new one compatible to the new update. Clean up the lesson player and refactor it from zero. Redesign everything."
> **Status 2026-10-17: Phase 0 and 1 done** (local tag `academy-player-v1` = commit `3aa46765025cc9eff4d734a10a45764328537495`, which stays in this branch's history; the remote refused to accept the tag push, so recover with `git checkout 3aa46765025cc9eff4d734a10a45764328537495 -- src/academy-deck`; the last commit with the old lessons and player; the 11 lessons, the Sign Me Up homework app and game wiring, the lesson-bound tests, the registry entries and the voice-line generator inputs are removed; the old player core `Deck.tsx`, `slides/` and css are still in place until Phase 5). Next: Phase 2 mockups for approval.
> **Answers given:** delete **all Academy deck lessons**; the new player is built around **the Season arc and chapters**, **comic story scenes**, and keeps **saved progress, Mistake Bank and the voice rules**; **plan first, then build**. **Nothing has been deleted yet.**
> Academy only (hub separation). Skills to load when building: `academy-game-ui`, `academy-player-ux`, `academy-deck-craft`, `academy-season-arc`, `gdev-game-ui-ux`, `gdev-game-feel`, `game-animation`, `gdev-visual-novel`, `gdev-dialogue-systems`, and `academy-quality-gate` at the end.

## 1. What exists today (inventory)

| Part | Where | Size | Fate |
|---|---|---|---|
| Player core: `Deck.tsx`, `Stage.tsx`, `ctx.tsx`, `types.ts`, `spoken.ts`, `audio.ts`, `mistakeBank.ts`, `scene.css`, `deck.css` | `src/academy-deck/` | ~4,000 lines | **Replace** (new `src/academy-player-v2/`) |
| 30 slide views (`slides/*.tsx`: story, board, forge, lock, pattern, games, ...) | `src/academy-deck/slides/` | ~4,500 lines | **Replace**; rebuild only the kinds the new lessons need |
| 11 lesson scripts (Pre-A1 S1/S2 L1, Sign Me Up 1/2, Fake or Real, Free Time Club 1/2, B1 S1 L1-L3) | `src/academy-deck/lessons/` | ~3,400 lines | **Delete** (owner choice: all) |
| Lesson registry, profiles, scripts, variety gate | `lessonRegistry.ts`, `lessonProfiles.ts`, `lessonScripts.ts`, `lessonVariety.test.ts` | | **Delete the entries**, keep the mechanism small (registry shape) |
| 32 tests | `src/academy-deck/__tests__/` | | Delete with their subjects; keep the ones for what stays |
| Library, level tabs, lobby pages | `library/`, `pages/` | | **Keep the pages**, rewire to the new registry (empty until lessons are rebuilt: the "planned slots" view already handles this) |
| Practice store, checklist log, Daily 10, homework, teacher panels | `practiceStore.ts`, `classroom/checklistLog.ts`, `Daily10Banner`, `homework/`, `teacher/` | | **Keep** (not the player); homework app and Daily 10 keep working |
| Live classroom bridge | `classroom/EmbeddedAcademyDeckLesson.tsx` (teacher owns the slide index; student follows; DOM-path replay of clicks) | 193 lines | **Keep the contract** (props and handle: `goNext`, `goBack`, `goToIndex`, `setInteractionUnlocked`, `onNavState`), reimplement on the new player |
| Outside consumers | `MainStage`, `LibraryDrawer`, `TeacherLessonLibrary`, `MyLessonsTab`, `LessonWrapUpDialog`, `FeedbackReportDialog`, `TeacherClassroom`, `App.tsx` routes, `classroomLessonResolver`, `academy-games/signMeUp/*` | ~12 files | Rewire; `academy-games/signMeUp` (uses the old Sign Me Up deck) is removed with the lessons |
| Pictures and recorded voice clips | `public/academy-art/`, `public/audio-cache/`, voice scripts | | **Keep** (not requested); prune the voice-line lists of deleted lessons later |
| Curriculum data (roadmap, arcs, GSE, L1 watch, blueprints) | `src/curriculum/academy/` | | **Untouched**: the new player reads it |

**Recovery:** before deleting, tag the current commit `academy-player-v1` and keep the branch; the merged code is also in `main` history. No database rows are touched (the legacy Academy rows stay as they are).

## 2. What the new player is (design)

**Principles:** (1) a lesson is a *chapter of a Season*; the player is built around the blueprint (objective, chapter, big question, the 60-minute run of show in 8 parts); (2) story first: comic scenes carry the context; (3) one clean engine, small pluggable slide kinds, no 700-line component; (4) comfort and voice rules are part of the engine, not bolted on; (5) every screen is a bright daytime school plate with ~25 % purple (art rules).

### 2.1 Architecture (`src/academy-player-v2/`)
- `model/` : `LessonScript` v2 = `{ blueprintId, parts[8], scenes[] }`; each scene has a `kind`, `part`, `trains` (criteria), `plate`, `cast`; a typed registry of kinds. The blueprint's chapter, big question and exit task are read from `src/curriculum/academy`, never copied.
- `engine/` : a small reducer/state machine (`useLessonEngine`): current scene, history, results, mistakes, pause/resume, part timing. Pure and testable; the UI never owns lesson logic.
- `services/` : `voice` (only `speak()` and the recorded clips; silent if missing; no browser voice), `progress` (resume per lesson), `mistakeBank`, `practice` (writes to the existing practice store), `sync` (classroom bridge).
- `shell/` : layout (plate, HUD, part strip with 8 segments, comfort dock, minute card, More menu), theme tokens (Explorer 13-15 / Studio 16-18), Calm mode, keyboard map, focus order.
- `scenes/` : one folder per kind, each with a view, a spoken-lines function and a test.
- `i18n` : all player chrome through `t()` from the start (project rule: six languages, English default and fallback); lesson content stays English.

### 2.2 Scene kinds, in build order (only what a lesson needs; each ships with tests)
1. **Lobby**: "Chapter N of 8", the chapter sub-question and the Season's big question, the mission (can-do lines), the crew, the quest path (8 parts).
2. **Comic scene** (core): plate + narration caption + speech bubbles placed on empty space (per-beat `spots`), typed text, shout and sfx, halftone wipe; listen-first mode; Calm mode.
3. **Model**: the teacher models the new language and the Mission first (I do, we do, you do).
4. **Rule**: stated plainly (≤ 3 lines, example each, read aloud), then the student restates it.
5. **Choice / Match / Sort** (one parameterised game family with 3-4 looks, rotated per lesson).
6. **Build** (order words, fill gaps, evidence builder).
7. **Speak**: listen, repeat, record privately, replay (voice note), the speaking ladder.
8. **Check** (mastery, Take 1 -> feedback -> Take 2) and **Wrap** (teach-back, clue unlock, Mistake Bank, the chapter's open question handed to the next lesson).
Later kinds (Case Board, Trophy Forge, Pattern Lab, Dialogue RPG, locks, rhythm) are re-added only when a rebuilt lesson needs them.

### 2.3 Look and feel
Full-bleed bright school plates, large cast, glass panels kept small, ink-framed comic panels, chapter-led lobby, game-feel layer (pop-in, burst on right, gentle wrong, character reaction, reward moment), 8-part strip, no zoom/pan on stills, cross-fade only. Mockup first (a static preview of Lobby, Comic scene, one game, Wrap at 1280x720 and 390x844) for approval **before** the code.

### 2.4 Compatibility
- Classroom: same props and handle as `EmbeddedAcademyDeckLesson`; teacher owns the scene index; student follows; clicks replayed by DOM path (kept as is); activity log and checklist writes unchanged.
- Practice store, checklist log, Daily 10, homework, teacher panels: unchanged APIs.
- Library and registry: same `AcademyDeckLesson` shape (id, level, season, episode, title, cover) so `LibraryDrawer`, `TeacherLessonLibrary`, `MyLessonsTab` keep compiling; empty lists show the existing "planned" slots.

### 2.5 Video-game development concept, taken from the Playground player (owner 2026-10-17: "use the video game development concept from the Playground hub player")
Read in `src/content/playground-library/unit1/` (`SceneRenderer.tsx`, `scene-components/gameFx.tsx`, `BrickCrushScene.tsx`, `ClawMachineScene.tsx`, `DashScene.tsx`, `sfx.ts`, `masteryTracker.ts`) and re-implemented in `src/academy-player-v2/` only (hub separation: **read and re-implement, never import**). What is taken, and how it is made teen-appropriate:

| Playground concept | Academy version |
|---|---|
| **Scene contract**: each game is a component with `{ scene, onNext, onWin(gem), onLose }` and a small phase machine `intro -> play -> win/lose` | Same contract for every game kind: `{ scene, ctx, onDone(result) }`, result = `{ won, score, mistakes[], gem? }`; one phase machine hook `useGamePhases()` (intro, play, win, lose, retry) shared by all kinds |
| **Scene registry** (`SceneRenderer` maps `kind` to component, validated by `sceneValidator`) | Typed registry `SCENES: Record<Kind, SceneModule>`; each module exports `view`, `validate(scene)`, `spoken(scene)`, `trains`; a validator test rejects unknown kinds and missing fields |
| **Game loop state**: score, combo, misses/lives, timer, flash hit/miss | `useGameState()`: score, combo (x2, x3), lives or misses, optional timer (**off by default; never a visible countdown unless the student turns it on**: comfort rule), flash states |
| **Game-feel kit** (`gameFx.tsx`): `useBursts`, `Bursts`, `FloatText` (+1), `useShake`, `idleFloat`, `Hopper` (squash and stretch), `LivingBg`, `CalmBg` | Re-implemented: bursts (sparks, not emoji), floating "+10", soft shake (off in Calm mode), idle float on pieces, squash/stretch on cast reactions; `CalmBg` rule kept (pieces over a busy plate get the calmed plate: owner 2026-10-14) |
| **Sound design** (`sfx.ts`: pop, click, match, wrong, reveal, gem, ring, whoop) | A small recorded-clip sfx bank (no synthesized speech, no browser voice); mute control in the comfort dock |
| **Rewards**: gems per scene, mastery tracker (`masteryTracker`, micro-checks per sound), stars | Teen version: **XP and a quiet rank**, a "gem" per clean win, the **Mistake Bank**, mastery per target item (New -> Learning -> Known -> Secure -> Fading, as in `academy-learner-diagnostics`); no mascots, stickers or hearts |
| **Arcade mechanics** (brick-crush, claw machine, dash, catch-sort, spin wheel, maze, memory, jigsaw) | Academy versions chosen by the lesson's job from `docs/academy-video-game-mechanics.md` (quest log, boss fight, loot, crafting, escape room, rhythm, detective board, dialogue RPG); each is a **game kind in the registry** with the same contract, built one at a time when a lesson needs it |
| **Crash isolation** (`SceneCrashGuard`) | Every scene mounts inside an error boundary with a "skip and note it" fallback, so one broken game never ends a live class |
| **Live sync** (`useSyncedSceneState`, `ActivitySync`, DOM-path replay) | The same classroom bridge contract (section 2.4); game state that must match on both screens lives in a seeded, synced reducer |
| **Mini-game feel rules** (owner: "an animation video game, the design of the games is very flat") | Every game must pass the "dullness test" of `academy-game-ui`: motion on correct, gentle wrong, character reaction, a reward moment |

**Engine implication:** the lesson engine (2.1) is the "game manager"; each scene is a mini-game with its own loop but the same lifecycle, scoring and effects services. This is why the engine gets `useGamePhases`, `useGameState`, `fx/` (bursts, float text, shake, idle float), `sfx/` and `rewards/` as shared modules from phase 3.

## 3. Phases (each ends green: tsc, lint, tests, screenshots)
0. Safety: tag `academy-player-v1`; new branch off `main`.
1. **Remove**: delete the 11 lessons, their registry entries, profiles, variety test, the Sign Me Up game wiring and their tests; stub the registry so the app compiles. Show the owner the diff summary.
2. **Design approval**: static mockups of the four screens.
3. **Engine + shell** (no scenes yet) with tests; classroom bridge on the new engine.
4. **Scenes 1-8** one by one, each with a test, a spoken-lines function and screenshots.
5. **Integrate**: library, routes, classroom, homework link, wrap-up panels; remove the old player (`Deck.tsx`, `slides/`, css).
6. **Proof lesson**: rebuild **one** lesson on the new player (B1-S01-E1, by the Academy lesson protocol: approved plan, research, games list) to prove the player; the other lessons are rebuilt later.
7. Quality gate (`academy-quality-gate`), comfort audit, accessibility pass, owner preview links.

## 4. Risks and what I need from the owner
- **Live impact:** the old lessons are on `main` and the live site. They disappear for students when this branch is merged; the Academy library will show only planned slots until lessons are rebuilt. **Merge only when you say so.**
- **Size:** about 12,000 lines go. A rebuilt player with the eight scene kinds is realistically several sessions of work; I will report at each phase.
- **Classroom regression:** the live-class bridge is the riskiest part; it gets its own tests (teacher/student index sync, replay of clicks).
- **Questions:** (a) player chrome in six languages from the start (project rule) or English only for now? (b) keep the homework app and Daily 10 untouched until the new player is done? (c) is B1-S01-E1 the right proof lesson? (d) OK to tag and delete once you approve this plan?

## 5. Phase 2 mockups (2026-10-17, for approval)
Static HTML + screenshots in `docs/academy-player-v2-mockups/` (`mockup.html?screen=lobby|comic|game|wrap`; no audio, no scripts beyond filling the page; pictures are the existing Academy plates, cast and cards). Four screens at laptop (1280x720) and phone (390x844): Lobby, Comic scene, Game ("Been or gone?" sort), Wrap.
Design decisions shown:
- **HUD (all screens):** Academy chip with the lesson id, a "Chapter N of 8 · title" pill, an XP bar, and the 8-part strip (widths = minutes; current part gold). Comfort dock: Hint, I need a minute, More. Bottom bar: Back, scene dots, one primary action (warm orange "Start", violet "Next").
- **Lobby:** big title over a bright plate, crew portraits, a chapter card (sub-question + the Season's big question), the mission as a checklist, the quest path in 8 chips.
- **Comic scene:** ink-framed full plate; narration box and bubbles placed on empty space only (never over a face); the previous line dimmed; sound word; **on a phone the picture shows whole on top and the dialogue stacks below** (no cropping of characters).
- **Game:** the plate is calmed behind floating pieces; one evidence card tilted in the middle, two labelled bins; score, **combo x3**, **tries** (three teal pips, not hearts), floating "+10" and sparks, a cast reaction in the corner; no countdown.
- **Wrap:** chapter complete, XP and a gem, the rule said back, the Mistake Bank, the unlocked clue, and the next chapter's question.
Colours: ink #1b1038, violet #6d46e6, lilac tint, cream, gold for "now", teal for correct/tries, orange for the one big action; plates stay light daytime with about 25 % purple.
