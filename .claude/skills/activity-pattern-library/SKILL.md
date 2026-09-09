---
name: activity-pattern-library
description: >
  REQUIRED lookup before finalizing which activities/mechanics go into any
  lesson, in any hub (Playground, Academy, Success). Grounds
  smart-lesson-architect's abstract activity-selection table in the concrete,
  actually-implemented mechanic catalog for each hub — its table names
  generic archetypes (Flashcards, Wheel, Escape Room) that don't all
  literally exist as buildable `kind`s in this codebase; this skill lists
  what really does. Also the enforcement point for two rules that were
  skipped the last time a lesson shipped without them: (1) don't run more
  than 2 consecutive scenes/rounds of the identical mechanic, (2) research
  trending mechanics from real external apps before defaulting to a
  familiar shape. Use this AFTER smart-lesson-architect has picked
  per-micro-skill purposes, BEFORE generate-lesson's registration checklist.
---

# Activity Pattern Library

## Why this skill exists

A1 Welcome Town Lesson 3 ("Listen & Greet!") originally shipped with **nine
near-identical `choice` scenes in a row** — each just a row of text buttons,
same shape, different words. `smart-lesson-architect` already has an
"Anti-Duplication" section and a validation line ("No activity is repetitive
or redundant with another in the same lesson") that should have caught this
— but it wasn't consulted while building that lesson, and even if it had
been, its activity-selection table names generic archetypes ("Picture
Choice", "Wheel", "Escape Game") that aren't a 1:1 match for this codebase's
real `kind`s, so there was no concrete list to check against or rotate
through. The fix that shipped (commit `203d5a09`) replaced most of that
block with a new `listen-tap` mechanic, researched from real ESL
listening-game design rather than invented from scratch.

This skill is the missing concrete layer: an actually-verified inventory of
every mechanic that exists in this codebase today, tagged by pedagogical
purpose, so "what are my options for a controlled-practice beat in
Playground A1" has a real, checkable answer — plus the two rules that make
the anti-duplication principle mechanically enforceable instead of a vague
"try not to repeat yourself."

## How this fits with the other lesson-design skills

```
playground-curriculum-engine   →  WHAT this lesson teaches (scope, sequencing)
smart-lesson-architect          →  the PURPOSE breakdown per micro-skill
                                    (intro / controlled practice / production / review)
activity-pattern-library (here) →  which REAL mechanic fills each purpose slot,
                                    checked against the Variety Rule + Research Step
generate-lesson                 →  registers whatever you picked as real code
```

Run this skill after the purpose breakdown is decided and before you write a
single scene. For each purpose slot: look up real candidates below for the
target hub → check what the immediately-adjacent lesson(s) in the same unit
already leaned on (don't repeat their dominant 2-3 kinds) → apply the
Variety Rule → if nothing fits, do the Research Step.

## Hard Variety Rule (mechanical, not just "avoid repetition")

1. **No more than 2 consecutive scenes/rounds of the identical `kind`** in
   one lesson. This is a hard cap, checkable by literally reading the
   `kind` field down the scene array — the exact check that would have
   caught Lesson 3's original nine-in-a-row `choice` run automatically.
2. **A lesson should draw from at least 3-4 different purpose categories**
   below (see the tables), not just one purpose's mechanics repeated with
   different vocabulary.
3. **Across a unit**, don't let two lessons in a row share the same
   dominant 2-3 kinds — `playground-curriculum-engine`'s "Activity
   selection at the curriculum level" section owns this at unit scope;
   this skill owns it within one lesson.
4. Before calling a lesson done, literally list its scenes' `kind` values
   in order and eyeball-check rules 1-2. This takes under a minute and is
   the single check that was skipped when Lesson 3 first shipped.

## Required Research Step

Run this whenever either is true: (a) the target purpose has only 1-2
existing options below, or (b) you haven't researched this specific skill
focus (listening / speaking / a grammar pattern / phonics) recently and
suspect the existing options are getting stale/repetitive across lessons.

Do 1-2 targeted web searches for how real, popular kids/ESL products teach
that exact skill — vary which source you hit, don't always reach for the
same one:

- Mechanic ideas for young learners: `teach-this.com/esl-games`,
  `games4esl.com`, `teachingexpertise.com/classroom-ideas`,
  `eslkidslab.com`, `busyteacher.org`
- Trending app/product patterns worth studying for interaction design (not
  content): Duolingo, Lingokids, Khan Academy Kids, ABCmouse, Kahoot,
  Quizlet, Wordwall

Extract the underlying **mechanic**, not any copyrighted content, then
either (a) match it to an existing `kind` below, or (b) if genuinely new,
propose it as a new `kind` through `generate-lesson`'s registration
checklist, and cite the source in a code comment. Precedent/format to copy:
the `listen-tap` kind (commit `203d5a09`, cites
`teach-this.com/esl-games/listening-games`) and the third-person
"introduce a friend" pattern added to Lesson 4's join-stage (commit
`20517b28`, cites `teach-this.com/functional-language/introductions`).

## Playground hub — Pre-A1 (`src/content/playground-library/unit1/scenes.ts`)

~45 real, already-implemented `kind`s (verified by grep this session, not
guessed) — grouped by purpose. If a purpose row below has few entries and a
new Pre-A1 lesson needs it, that's exactly when to run the Research Step.

| Purpose | `kind`s |
|---|---|
| **Discovery / model** (new content, teacher-led, first exposure) | `meet`, `meet-group`, `meet-greet`, `name-gate`, `sound-model`, `color-model`, `shape-model`, `toy-model`, `numbers-learn`, `he-she-model`, `listen-repeat-cards` |
| **Controlled / recognition practice** (low-risk, guided) | `echo`, `trace`, `sound-sort`, `color-sort`, `shape-sort`, `plural-sort`, `he-she-sort`, `color-spot`, `color-spy`, `alphabet-order`, `alphabet-blocks`, `basket`, `count-balloons`, `age-balloons` |
| **Interactive game practice** (student-led, real stakes, game-feel) | `word-build`, `sentence-build`, `dash`, `catch-sort`, `sound-pop`, `brick-crush`, `gather`, `memory`, `puzzle`, `hello-doors`, `friend-pop`, `feed-monsters`, `color-simon`, `train-recall`, `feelings-dice`, `feelings-wheel`, `x-is-feeling`, `i-am-feeling`, `age-sentence-match`, `who-said-it` |
| **Speaking production** | `roleplay`, `join-stage`, `voice-stage`, `he-she-say` |
| **Story** | `flipbook` |
| **Review / assessment / boss** | `trophy-chest`, `feelings-bingo`, `age-quiz`, `color-quiz`, `feeling-quiz` (plus any of the interactive-practice kinds above, re-run at higher difficulty with no new content) |
| **Structural / closing** (not gem-eligible, don't count for variety) | `title-card`, `cinematic`, `song`, `finale`, `feelings` (a vocab-reveal scene, not a game) |

Note: `feelings-bingo` already exists and has shipped in an earlier Pre-A1
unit — a user rejection of "Family Bingo" for Unit 5 Lesson 1 earlier this
project was about that *specific lesson's* bingo concept, not a blanket ban
on the bingo mechanic; don't over-generalize a one-lesson rejection into an
avoid-forever rule for a `kind` that's otherwise fine elsewhere.

## Playground hub — A1/A2 Welcome Town (`.../welcome-town/scenes.ts`, `.../welcome-town-a2/scenes.ts`)

A separate, smaller `Scene` type union from Pre-A1's (different file,
different renderer — don't assume a Pre-A1 `kind` exists here or vice
versa). ~23 `kind`s as of the true-false addition below:

| Purpose | `kind`s |
|---|---|
| **Discovery / model** | `meet`, `sound-model` |
| **Controlled / recognition practice** | `echo`, `trace`, `vocab-spot`, `drag-match`, `frequency-ladder`, `pronoun-sort`, `true-false` |
| **Interactive game practice** | `choice`, `listen-tap`, `memory`, `word-build`, `letter-game`, `jigsaw-puzzle`, `hello-doors` |
| **Speaking production** | `roleplay`, `join-stage` |
| **Story** | `flipbook` |
| **Structural / closing** | `title-card`, `cinematic`, `song`, `finale` |

`listen-tap`/`true-false` (added commits `203d5a09` and the follow-up
correction below) and reviving `echo`/`hello-doors` into real use (commits
`203d5a09`, `20517b28`) are the concrete precedent for "the catalog
already has an underused option — check here before inventing a new
`kind`, and check the Research Step before defaulting to `choice` again."

**Known existing defect, flagged for a future session (not fixed by
writing this skill):** `welcome-town-a2/scenes.ts`'s own Unit 1 Lesson 1
repeats the same "several `choice` scenes in a row" pattern already fixed
in A1 Lesson 3 (four back-to-back around the file's own lines ~222-279,
verified by grep this session). Apply the Variety Rule there the next time
that lesson is touched.

**Self-correction worth internalizing:** the very first pass of applying
this Hard Variety Rule to Lesson 3 (`203d5a09`) fixed the nine-`choice`-
in-a-row problem by introducing `listen-tap` — but then chained FOUR
`listen-tap` scenes back to back (feelings/people/room/supplies), the
identical shape of mistake with a newer mechanic. Caught and fixed in a
follow-up pass by literally listing the lesson's `kind` sequence in order
(rule 4 above) and finding the run — introducing `true-false` for
room+supplies content instead of a third and fourth `listen-tap`. Lesson:
running the Variety Rule check once, right after picking a promising new
mechanic, is not enough — a fresh mechanic can get over-relied on just as
easily as an old one. Re-check the full `kind` sequence after every
editing pass, not just once at the start of the design.

## Academy / Success hub — Arcade + vocab-games

Not a `Scene[]` file — a cross-hub catalog + component system:

- **`src/arcade/gameRegistry.ts`** — the real, hub/CEFR-gated catalog (24
  entries as of this writing), each tagged with `skill_focus`, `hub_allow`,
  and a `category` that doubles as a purpose tag: `foundational`
  (`matching_pairs`, `drag_drop_sort`, `sentence_builder`, `spelling_race`,
  `phonics_challenge`, `listening_hunt`, `song_chant`, `timeline_race`,
  `alphabet_blocks_order`, `letter_sounds_blocks`, `phonics_word_blocks`,
  `alphabet_arcade`), `communication` (`roleplay_mission`,
  `pronunciation_quest`, `fluency_round`, `story_continuation`,
  `debate_battle`, `business_sim`), `review` (`memory_quest`,
  `grammar_boss`, `vocab_boss_round`, `vocab_tournament`,
  `fluency_streak`), `social` (`team_mission`, `classroom_battle`,
  `leaderboard_event`, `coop_challenge`).
- **`src/coherence/hubProfiles.ts`** — the actual per-hub homework/game
  caps and declared `game_catalog` (Playground: `WordRush`, `SoundMatch`,
  `MemoryGrid`, `BossRound`; Academy adds `GrammarSprint`, `DialogueDash`,
  `MeaningMaze`, `FluencyArcade`; Success drops `WordRush`/`SoundMatch`).
  Of these, `WordRush.tsx`, `SoundMatch.tsx`, `MemoryGrid.tsx`,
  `MeaningMaze.tsx`, `BossRound.tsx`, and `RescueRound.tsx` have real
  component files under `src/vocab-games/games/`; `GrammarSprint`,
  `DialogueDash`, `FluencyArcade` are declared in the profile but were not
  independently verified as implemented components this session — check
  before assuming they render.
- **`esl-game-studio` skill** (`.agents/skills/esl-game-studio/`) — the
  design methodology for generating NEW games into this system (8-agent
  spec-writing pipeline, hub caps, anti-patterns). Use that skill, not this
  one, when the task is actually building a new Academy/Success game;
  use this skill's tables to know what already exists first.

## Worked example of applying the Variety Rule (what should have happened for Lesson 3)

Purpose breakdown for "listen and identify greetings/intros" (all
`listen-tap`/`choice`-purpose, i.e. controlled/recognition practice and
interactive game practice): greeting, name, age, feelings ×2,
teacher/student, room vocab ×2, supplies vocab. That's 9 items all in the
same purpose category — a real signal to split across *multiple*
mechanics from that category (`choice`, `listen-tap`, `hello-doors`) rather
than picking one and running it 9 times, which is exactly the redesign
`203d5a09` applied after the fact. Doing this check at design time, before
writing any scene, is the entire point of consulting this skill first.
