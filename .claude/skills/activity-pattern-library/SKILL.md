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
| **Controlled / recognition practice** (low-risk, guided) | `listen-colour`, `picture-match`, `echo`, `trace`, `sound-sort`, `color-sort`, `shape-sort`, `plural-sort`, `he-she-sort`, `color-spot`, `color-spy`, `alphabet-order`, `alphabet-blocks`, `basket`, `count-balloons`, `age-balloons` |
| **Interactive game practice** (student-led, real stakes, game-feel) | `word-build`, `sentence-build`, `dash`, `catch-sort`, `sound-pop`, `brick-crush`, `gather`, `memory`, `puzzle`, `hello-doors`, `friend-pop`, `feed-monsters`, `color-monsters` (Colour Monsters: a monster asks by voice for food of its colour — U2L2), `color-simon`, `train-recall`, `odd-one-out`, `shape-torch`, `feelings-dice`, `feelings-wheel`, `x-is-feeling`, `i-am-feeling`, `age-sentence-match`, `who-said-it`, `color-mix`, `shape-builder`, `shape-fishing`, `pattern-train` |
| **Speaking production** | `roleplay`, `join-stage`, `voice-stage`, `he-she-say`, `spin-wheel`, `secret-card` (child asks yes/no questions) |
| **Story** | `story-video` (animated, narrated, picture questions — preferred for Pre-A1 non-readers), `flipbook` (text pages; needs an adult to read), `story-order` (jumbled pictures → retell), `tick-cross` (listen: true or false?) |
| **Review / assessment / boss** | `trophy-chest`, `feelings-bingo`, `age-quiz`, `color-quiz`, `feeling-quiz` (plus any of the interactive-practice kinds above, re-run at higher difficulty with no new content) |
| **Structural / closing** (not gem-eligible, don't count for variety) | `title-card`, `cinematic`, `song`, `finale`, `feelings` (a vocab-reveal scene, not a game) |

Note: `feelings-bingo` already exists and has shipped in an earlier Pre-A1
unit — a user rejection of "Family Bingo" for Unit 5 Lesson 1 earlier this
project was about that *specific lesson's* bingo concept, not a blanket ban
on the bingo mechanic; don't over-generalize a one-lesson rejection into an
avoid-forever rule for a `kind` that's otherwise fine elsewhere.

### Researched Pre-A1 mechanics (Oct 2026, Unit 2 Lessons 2-4)

| Mechanic | Source | Kind | Trains |
|---|---|---|---|
| Mix two paints, name the new colour | colour-mixing play (Lingokids / preschool art) | `color-mix` | new colour words as the result of an action |
| Build a picture from shapes (name shape, pick colour heard) | shape-collage house, "Let's make shape art" (googooenglish, twinkl) | `shape-builder` | shape words + colour listening |
| Guess Who with coloured shapes | information-gap guessing games | `secret-card` | the child ASKS "Is it red?" / "Is it a circle?" |
| Listen and colour (big/small + shape + colour) | Cambridge Pre A1 Starters Listening Part 5 | `listen-colour` | detailed listening, exam format |
| Go fishing for the shape you hear | classroom magnet-fishing game, shape fishing apps | `shape-fishing` | colour+shape listening, arcade feel |
| What comes next? pattern train | Khan Academy Kids pattern/sorting activities | `pattern-train` | logic + saying the answer |
| Story as an animated film (no reading) | pre/while/post storytelling for very young learners (Cambridge ELT blog) | `story-video` | following a story by listening; picture-answer checks |
| Tick or cross | Cambridge Pre A1 Starters R&W Part 1 (listening-first for non-readers) | `tick-cross` | comprehension |
| Jumbled pictures → retell | storytelling retell research (Kids Club English) | `story-order` | sequence + retell |
| Which one is different? (odd one out) | Khan Academy Kids / Lingokids sorting, preschool odd-one-out | `odd-one-out` | grouping by colour/shape, saying why |
| Torch hunt in the dark (picture-only) | "flashlight I spy" hidden-object apps; A1 Magic Castle `torch-hunt` | `shape-torch` | colour+shape listening, exploration |
| Mystery / feely bag | ESL "feel the toy in the box" (eslkidstuff toys lesson) | `mystery-bag` | noun from its shape, then colour + noun |
| Move & Say (TPR) + Brain Break | Oxford *Toy Team* / *Everybody Up*, Novakid TPR | `tpr-actions` (`mode: 'break'` for extra time) | word ↔ action, movement first |
| Quick-fire flashcards (3 s) | blueprint slide 15; flash-card warm-ups in every YL course | `rapid-recall` | fast retrieval |
| Sticker Book reward | Khan Academy Kids collectibles, sticker charts | `sticker-reward` | motivation (effort, not score) |
| Home Mission | Novakid / Oxford home-link tasks | `home-mission` | transfer to real life with family |

**Pre-A1 Lesson 5 (story lesson) = real animated video**, never a stills slideshow — see `docs/playground-lesson-blueprint.md` §3a.

**Every lesson ends with an Extra-time block** (brain break + 2 bonus games) — see `docs/playground-lesson-blueprint.md` §3b.

### Games by lesson slot (owner's rule, 2026-10-03 — blueprint §3d)

Each lesson NUMBER owns its signature games (`SLOT_GAMES` + `checkSlotGames()` in
`unit1/sceneValidator.ts`); inside a unit a child never meets the same game twice.
L1 mystery-bag · picture-match · memory · sound-pop · rapid-recall · hello-doors |
L2 listen-colour · catch-sort · feed-monsters · color-monsters · dash · train-recall · friend-pop |
L3 puzzle · basket · jigsaw-puzzle · brick-crush · pattern-train · word-build |
L4 secret-card · sound-sort · color-simon · gather · shape-fishing · alphabet-order |
L5 lift-flap · tick-cross · who-said-it · alphabet-blocks · tidy-up · peek-pop |
L6 shape-torch · shadow-match · draw-path · trophy-chest · tile-reveal · stepping-stones · odd-one-out · claw-machine · ring-toss.
Run `checkSlotGames(slot, scenes)` before calling a lesson done.

### Researched Pre-A1 mechanics (Oct 2026, round 2 — "every lesson feels the same")

| Mechanic | Source | Kind | Trains |
|---|---|---|---|
| Draw a line from the character to the thing you hear; it walks the line | Lingokids "Draw Path" (2026) | `draw-path` | listening for colour + shape, fine motor |
| Picture uncovers tile by tile; guess early from a part | Wordwall "Image quiz" template | `tile-reveal` | noticing colour/shape, saying the word |
| Drag each coloured picture onto its dark shadow | Khan Academy Kids shadow puzzles / preschool shadow cards | `shadow-match` | shape recognition from outline |
| Cross the river: tap the stone the voice names, the character hops | classroom stepping-stones floor game, app river levels | `stepping-stones` | listening + forward progress |
| Tidy Up: put the toy the voice names in / on / under its place (drag or tap-tap); tidied toys stay | Lingokids × Toy Story "pack the box" (2026), Lingokids clean-up activities, Cambridge Starters Listening Part 4 | `tidy-up` (L5) |
| Peekaboo Toys: toys peek out of the box / onto the bed / from under the chair; tap the one in the place you hear | ESL hide-and-seek "where is the toy?", Lingokids prepositions | `peek-pop` (L5) |
| Toy Grabber: steer a claw to the toy the voice names ("Get the blue ball!"), press the button; never slips | claw-machine kids apps (Yateland), fairground toy grabbers | `claw-machine` (L6) |
| Ring Toss: tap the prize to throw a spinning ring; rings stay on the pegs (also for sounds: "the P word") | fairground ring toss, Wordwall one-tap review | `ring-toss` (L6) |

**Every game must pass the `game-animation` skill's juice audit** (living world, springs, squash & stretch, bursts, gentle wrong, celebration) — a correct but flat game fails.

**Pre-A1 children cannot read.** Never make reading the only way into a task: speak every prompt, give picture answers, keep printed text as a small caption for the adult.

## Playground hub — A1/A2 Welcome Town (`.../welcome-town/scenes.ts`, `.../welcome-town-a2/scenes.ts`)

A separate, smaller `Scene` type union from Pre-A1's (different file,
different renderer — don't assume a Pre-A1 `kind` exists here or vice
versa). ~23 `kind`s as of the true-false addition below:

| Purpose | `kind`s |
|---|---|
| **Discovery / model** | `meet`, `sound-model` |
| **Controlled / recognition practice** | `echo`, `trace`, `vocab-spot`, `drag-match`, `frequency-ladder`, `pronoun-sort`, `true-false`, `picture-match` |
| **Interactive game practice** | `choice`, `listen-tap`, `memory`, `word-build`, `letter-game`, `jigsaw-puzzle`, `hello-doors` |
| **Speaking production** | `roleplay`, `join-stage`, `spin-wheel` |
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

## Universal — the Spin Wheel (`spin-wheel`, every Playground scene library)

One numbered spinner is shared by the whole platform
(`src/components/classroom/shared/SpinWheel.tsx`): segments 1..N clockwise
with N at the top, the reference palette (periwinkle, slate, cyan, coral,
graphite, light blue), a centre SPIN button and +/− for the segment count.
It appears in two places, and both look and behave identically:

1. **The classroom tool** (teacher dock → Tools → Spin Wheel). Opens over
   *any* slide or scene; the teacher sets N with +/−; teacher OR student
   presses SPIN; the landed number is identical on both screens. Use it when
   a slide already shows numbered pictures ("Spin! 1-6") — no special
   scene needed, just number the pictures 1..N consecutively.
2. **The `spin-wheel` lesson activity** (`src/content/playground-library/
   SpinWheelScene.tsx`, registered in both the Pre-A1 and the A1/A2
   renderers). A background picture with numbered yellow badges placed on
   things in the art, plus the wheel. SPIN lands on a number → that badge
   lights up → the student says the word (🔊 models and reveals it). Tapping
   a badge picks it directly — the "do it without the spinner" route. A
   round covers every number once (the wheel prefers unpractised numbers);
   the gem is awarded when every picture has been said. Fully synced
   (`REAL_SYNC_KINDS`), so a missed message is recovered by the catch-up
   handshake.

**Purpose:** speaking production / retrieval of a small known set (4-6
items is the sweet spot; 2-8 allowed). It's a *review* mechanic — use it
after the words were modelled (`meet`, `vocab-spot`, `flipbook`…), never
as first exposure. Counts as its own mechanic for the Variety Rule; don't
place two `spin-wheel` scenes back to back.

**Authoring contract:**

```ts
{
  id: 'u3-spin-actions', kind: 'spin-wheel', bg: bgSkyPlayground,
  title: 'Spin!',            // '' when the background art already has a banner
  teacher: 'Have the student spin the wheel and say the word that matches the number. If you prefer, do the activity without the spinner.',
  items: [                   // badge n = items[n-1]; % positions on bg
    { label: 'jump', left: '78%', top: '44%' },
    { label: 'run',  left: '62%', top: '82%' },
    { label: 'swim', left: '30%', top: '30%', emoji: '🏊' }, // emoji/img only if NOT painted in bg
  ],
  wheelAt: { left: '50%', top: '55%' }, // optional; keep it clear of every badge
}
```

- Badge numbers are the item order — keep the picture ↔ number ↔ `label`
  mapping exact (the quality gate checks it against the art).
- `label` is exactly the target word/phrase the student should say.

## Universal — Picture ↔ word match (`picture-match`, every Playground scene library)

`src/content/playground-library/PictureMatchScene.tsx`, registered in both
the Pre-A1 and the A1/A2 renderers, fully synced (`REAL_SYNC_KINDS`). The
classic matching slide, picture-first: big picture cards in a 2-row grid,
each card shaped to its own picture (whole room/object visible, never
cropped or letterboxed) with an empty slot strip under it, and the word
pills (shuffled — identically on both screens) along the bottom. The student drags a word into the slot under its picture, or taps
the word then the slot (easier on tablets). Right = snaps in + spoken;
wrong = shake, back to the middle (costs a heart). Gem when all are matched.

**Purpose:** controlled practice / self-check of known words (recognition +
reading). Not first exposure. 4-6 items ideal (2-8 allowed); the words must
be unique. Counts as its own mechanic for the Variety Rule.

**`studentOnly: true` — auto-evaluation slides.** Any scene can set it (the
lesson players support it generically): the student gets the floor without
a teacher unlock, their "Watching your teacher" lock is hidden, and the
teacher's copy becomes a live, non-interactive view with a "Student is
doing this on their own" badge. Use it for self-check slides whose teacher
note says the student works "independently, without help from the teacher".

```ts
{
  id: 'u5-food-match', kind: 'picture-match',
  prompt: 'Match the words to the pictures',   // optional banner
  studentOnly: true,                           // auto-evaluation slide
  teacher: 'Auto-evaluation slide. The student does the exercise independently, without help from the teacher.',
  items: [                                     // grid order: first row, then second row
    { word: 'muffins', img: imgMuffins },      // img preferred; emoji fallback
    // Part of an existing background: crop = % window of the image
    // { word: 'kitchen', img: bgRooms, crop: { x: 5.5, y: 17, w: 46.5, h: 69 } },
    { word: 'bread',   img: imgBread },
    { word: 'cheese',  emoji: '🧀' },
  ],
  bg: bgKitchen,                               // optional; default soft sky→pink gradient
}
```

Reusable activities are listed (with paste-ready examples) in
`src/content/playground-library/reusableActivities.ts`, shown on the
`/activity-catalog` page — add every new shared activity there too.

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

### Researched Academy mechanics (Oct 2026, Academy B1 U1 L1 — mechanics only, no copied content)

Run the Required Research Step before inventing anything; these were found and used, reuse them:

| Mechanic | Source | Built as | Trains |
|---|---|---|---|
| Collaborative decision task: pairs choose N of M items, *suggest / agree / disagree politely / justify* | Cambridge English B1 Preliminary (for Schools) Speaking Part 3 — cambridgeenglish.org "B1 Preliminary for Schools Speaking Part 3" PDF | `speaking_task` "Final mission — decide together" with negotiation starters | functional language + the target grammar under real communicative pressure; matches the exam format teens will meet |
| Sentence-matching race (problem → solution sentence) | teach-this.com/grammar/adverbial-clauses | `matching` slide, full sentences on the right | meaning of connectors in context |
| "Card + connector, 30 seconds" sentence challenge | teach-this.com/grammar/adverbial-clauses | partner `speaking_task` "Gear Card Challenge" (hint always allowed — no stress) | spontaneous controlled production |
| Mixed-puzzle escape room, one puzzle type per door | eslteacher365.com/esl-escape-room, twinkl ESL escape-room blog | `escape_room_slot` (unscramble / cloze / order / riddle) | retrieval across skills |
| Picture → situation drag ("which tool solves this problem?") | own design from the above | `canvas_game` with image tiles dragged onto problem cards | links vocabulary to purpose before the grammar is named |

Academy kinds worth knowing (all render in `PlayAcademyLesson`): `canvas_game` (drag text/images onto slots),
`find_in_scene_game` (tap objects inside a painted scene), `escape_room_slot`, `matching`, `vocab_image_match`,
`picture_match_game`, `conversation_fill`, `sentence_builder`, `story_page`, `role_play`, `sound_challenge_game`.
Student-comfort rules for all of them: see `lesson-quality-gate` → Engine 5.

### Signature mechanic — `expedition_game` (original, Academy; language-as-mechanic)

`src/components/academy/game/ExpeditionGame.tsx`, slide `{type:'expedition_game', slots, items[], dangers[]}`. Plan a limited
backpack against a forecast of dangers (a real decision; some tools are plausible decoys), then beat each danger by BUILDING
the justification sentence from chips (`We took <tool> <link> <purpose>`); wrong grammar gets the exact rule, wrong meaning
gets a meaning hint; the student ends with their own Expedition Log (stars + read-aloud). Reuse the SHAPE for any
"choose, then justify in the target structure" objective by swapping `items`/`dangers`/`phrases` (each danger lists 4
phrases: base-form ok, clause-form ok, two wrong-meaning). Only the link set (`to / in order to / so that`) is hard-wired for
purpose clauses — fork the component for another structure (e.g. first conditional: link = if…will). Rule 9 of
`lesson-quality-gate` explains why every lesson needs one signature mechanic like this.

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

## A1 roadmap and activity library (owner 2026-10-09)

The A1 Playground (Welcome Town) plan lives in `docs/a1-playground-roadmap.md` (10 units x 7 lessons, can-do goals, key
language, phonics, signature game per lesson). Every gamified activity we can use at A1 (built A1, universal, Pre-A1 games to
port with an A1 mode, and new researched games) is in `docs/a1-activity-library.md`. Owner: "you can also use the same games
from the Pre-A1". Check both before choosing activities for any A1 lesson.
