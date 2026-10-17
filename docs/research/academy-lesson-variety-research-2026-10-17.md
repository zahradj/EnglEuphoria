# Research: varying the shape of lessons, not just their skin (2026-10-17)

Owner (2026-10-17): "The same pattern is repeating in each lesson. Nothing special... You have to vary the activity, not the same each lesson. This is going to be boring." Tools: WebSearch only, so **every source is UNVERIFIED** (snippets, not pages read). Mechanics and structures only, never content.

## The audit (our own lessons, `src/academy-player-v2/lessons/*.ts`)
All five B1 Season 1 lessons use the **same skeleton**: `lobby → speak → (choice/build) → speak → comic → choice → … → model → rule → games → speak → write → speak/wrap`. E3, E4 and E5 open with the identical run `lobby speak choice|build speak comic choice`; 5 of 5 put the comic at scene 5; 5 of 5 end `write … wrap`; 35-43 % of scene-to-scene transitions are shared between E2, E3, E4 (E2/E4 = 0.43). A new game or a new setting on the same skeleton still *feels* the same.

## Sources and what was taken
| # | Source (family) | Taken | Limits |
|---|---|---|---|
| 1 | ontesol.com "ESL lesson planning frameworks", the Willis Task-Based Learning pages, TKT study guides (language teaching) | four different lesson frameworks: **PPP** (teacher-led, accuracy → fluency), **task-based** (pre-task → task cycle: do, plan, report → language focus after), **Test-Teach-Test** (try first, teach what failed, retry), **guided discovery** (infer the rule). Our lessons are all PPP-shaped | notes and study guides, not primary Willis / Ellis |
| 2 | Twinkl, Engblocks, Amerilingua, lessonplanned.co.uk (one-to-one ESL) | one-to-one activities we have not used: **dice story** (roll to pick the next story beat), **Would You Survive?** (choose, see the outcome), **Desert Island** (rank and defend one item), **picture storytelling** (invent the story behind a photo), **Top Cards** (comparatives by playing cards), sit beside the student to look at visuals together, do not fill silence | product pages; no outcomes data; one small dice-story study |
| 3 | Twinkl B1 escape rooms, a University of Valencia murder-story escape room, Tes (escape rooms) | an **escape-room chain**: each lock is a different language puzzle, the last gives a code; clues can train speaking, listening, reading and writing; 20-30 min | listings and an abstract; no digital lock design |
| 4 | LingoRogue, LexiRogue, an Illinois thesis on interactive fiction, a Debrecen choice-based game case study (video games) | **roguelike deck-building** (build a deck of phrase cards, run floors, boss), **interactive fiction / text adventure** (all four skills, choices change the story), **visual novel** (dialogue + choices) | blogs and theses; tower defence found no language-learning source |
| 5 | Blooket, Gimkit, Kahoot comparison posts (classroom game platforms) | many different loops on the same content: Tower Defense, Gold Quest (collect and steal), Café (serve orders), Factory (upgrade), Racing, Fishing, Trust No One, Don't Look Down, Floor Is Lava, Jeopardy-style; wrong answers come back later (spaced) | vendor blogs; mode lists differ |
| 6 | Duolingo Max pages and reviews (language app) | **roleplay with feedback afterwards** (everyday scenes, accuracy and complexity feedback), **video call** with a character who picks up the topic from the last lesson | no lesson-content variety there ("the same content for every learner") |

## Conclusions that change how we build
1. **Vary the loop, not the picture.** A lesson is defined by its *shape* (what the student does in what order and why), so each lesson declares a `shape` and must differ from the previous lessons. Catalogue: `docs/academy-lesson-shapes.md`.
2. **Vary the frame**: PPP (our default), task-first (test-teach-test), guided discovery, task cycle (do → plan → report), escape chain, branching story, roguelike run, café / tycoon, game show, studio production, survival / ranking, dice story.
3. **Vary the opening**: the first ten minutes must not be `lobby, speak, choice, build, speak, comic, choice` again (a cold open in the middle of the action, a challenge first, a voice message, a locked door).
4. **A guard in code**: `lessonShape.test.ts` measures opening and transition overlap between consecutive lessons and fails a new lesson that repeats the previous skeleton.
5. Rules that stay: Remember?, model before rule, rule before production games, a speaking-heavy hour, voice, art check. They are placed *inside* the chosen shape instead of fixing the shape.
