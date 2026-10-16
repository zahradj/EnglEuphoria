# Academy lesson creation protocol (hard rule, owner 2026-10-16)

"Recruit all the skills, the handbook and the video-game dev skills to create the lessons from now on, and search deep on the internet for the best games and video games that are actually compatible with, and align with, the lesson objectives or activities."

Applies to every Academy lesson, unit (Season) plan and new activity, created or rebuilt. Academy only (hub separation). Companion: `docs/handbook/Academy-Hub-Curriculum-and-Lesson-Handbook.pdf` (Part 10).

## 1. Load before you write

1. **Academy skills**, in order: `academy-season-system` (always first) → `academy-roadmap-architect` / `academy-learner-diagnostics` (what the student needs) → `academy-lesson-craft` (objective, criteria, exit task) → `academy-session-builder` (60-minute plan) → `academy-activity-selector` (which game) → `academy-deck-craft` → `academy-game-ui` and `academy-player-ux` (look, feel, comfort) → `academy-assessment-designer` → `academy-daily-practice` → `academy-curriculum-lesson-blueprint` → `academy-quality-gate` (before "done").
2. **The handbook** (Part 10: the combined quality bar, build order, one-to-one online design) and `docs/research/academy-expert-teaching-research.md`.
3. **Video-game development skills**, for designing and building any new or upgraded game mechanic: `game-developer` (patterns), `gdev-prototype-fast` (is it fun? keep/kill), `gdev-game-feel` and `game-animation` (juice), `gdev-game-ui-ux` (HUD and layout), and by mechanic `gdev-puzzle`, `gdev-visual-novel`, `gdev-dialogue-systems`, `gdev-card-game`, `gdev-create-game-assets`. Engine-neutral ideas are re-implemented in the Academy deck (React/TypeScript); never import another hub's code.

## 2. Deep game search (every lesson, on the internet, never from memory)

For each lesson's **objective, criteria and activities**, search for the best games and video games that fit them, then choose.

1. **Search at least three source families, at least five candidates in total:**
   - language-learning platforms and courses (Oxford, Cambridge, British Council, Duolingo, Busuu, Babbel, Lingokids, Wordwall, one-to-one platforms);
   - classroom and party games for English teachers (TeachingEnglish, ESL game collections, TEFL blogs, classic games);
   - **commercial video games and game-design writing** (genre mechanics such as detective, visual novel, boss fight, crafting, rhythm, escape room, stealth, tower defence, deckbuilder; postmortems, GDC talks, design blogs) and game-based language-learning research.
2. **Take mechanics only, never content.** Write each candidate as: name, source URL, the mechanic in one line, the cognitive job it does.
3. **Alignment test, all must be yes** (a candidate that fails is rejected and the reason logged):
   - serves a named criterion or the exit task (the traceability table), not only "fun";
   - the student **practises the target English** (says, writes, reads, hears, chooses between the target forms), not trivia, reflexes or luck;
   - the cognitive job matches the lesson stage (model, controlled, free, produce) and the level;
   - teen-appropriate, reserved and never childish; comfort rules hold (private before public, no speaking timers, no ranking, retry allowed);
   - **compatible with the player**: an existing slide kind, or a new kind that can be built, tested and timed inside the hour (prototype with `gdev-prototype-fast`);
   - one-to-one: works with a teacher and one student on a shared screen, and the teacher can wrap it up in 30 seconds.
4. **Choose and name:** the games list for the lesson, one signature game, and at least one video-game mechanic (what the student does in English). Variety rules still apply (no three same-kind in a row, new look for a repeated game).
5. **Log it** in `docs/research/academy-<lesson>-research.md` in a "Game search" table: candidates, source, mechanic, alignment result (chosen / rejected and why), verified or unverified. Add usable finds to `docs/academy-games-catalog.md` and `docs/academy-video-game-mechanics.md`.

## 3. Then, as before

Approved plan with traceability (owner approval first), build with the skills above, tests, comfort and voice audits, `academy-quality-gate`, preview, and a pilot with a real teacher and student before calling a lesson ready. Evidence labels stay honest: search summaries are "verified (summary)", not "read in full".
