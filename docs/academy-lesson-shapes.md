# Academy lesson shapes: a different loop for every lesson (owner, 2026-10-17)

"The same pattern is repeating in each lesson. Nothing special... vary the activity, not the same each lesson." Research and audit: `docs/research/academy-lesson-variety-research-2026-10-17.md` (sources unverified).

A **shape** is what the student does, in what order, and why. A new setting or a new game on the same shape still feels the same, so every lesson picks ONE shape, declares it (`LessonScript.shape`), and may not use the shape of the two lessons before it. `src/academy-player-v2/__tests__/lessonShape.test.ts` also fails a lesson whose opening, transitions or tail copy the previous lesson (grandfathered: B1-S01 E1-E4, which share the old skeleton and are on the reshape list below).

Rules that stay in every shape (placed inside it, not as the frame): Remember? (production-first), the teacher models then states the rule (≤ 3 lines) before production games, speaking is the biggest share, recorded voices, art check, comfort (no timers, no ranking), new words → matching → another game.

| id | Shape | The loop | Different from the old skeleton because | Scenes |
|---|---|---|---|---|
| `ppp` | Presentation-practice-production (the old default) | story → notice → rule → practice → production | it IS the old skeleton: use at most once a Season | existing |
| `escape` | **Escape chain** | a locked space; each lock is a different puzzle; every solved lock gives a code piece; the last door opens | no warm-up block; the story is the lesson; locks replace "pages" | `lock` + any puzzle scene |
| `story` | **Branching story** (interactive fiction / visual novel) | read a scene, choose or say what the character does, consequences change the next scene | the whole hour is one story with state | `onair`-style dialogue, `rapport`, story flags |
| `run` | **Roguelike run** | floors of encounters, collect phrase cards, build a deck, a shop that teaches the rule, a boss | a deck persists across the lesson; failure restarts a floor, not the lesson | boss, forge, cards (new) |
| `cafe` | **Café / tycoon** | customers arrive with orders, the student serves them in English, earns, upgrades | service loop, transactional language, no "story first" | orders (new) |
| `show` | **Game show** | rounds with different formats (Jeopardy-style, Trust No One, Top Cards, wager) | each round is a different mini-format, host and audience | boss, choice, cipher |
| `studio` | **Studio production** | make a thing for an audience: a radio show, a newspaper page, a podcast, a trailer | the product is the exit task | `onair`, `redpen`, write |
| `ttt` | **Test-teach-test** | a cold task first, teach what failed, retry the task and compare | starts with the task, the rule is the middle | any |
| `discovery` | **Guided discovery** | evidence → the student writes the rule → compare with the rule | the student states the rule first | sort, inspect |
| `table` | **Dice and story table** (one-to-one) | roll to choose the next beat; picture storytelling; Would You Survive? outcomes | player-driven, low prep, speaking-heavy | dice (new), speak |
| `survival` | **Survival and ranking** | scenarios, rank and defend, desert island | opinion and reasons, no right answer to click | rank (new) |
| `gap` | **Information gap duo** | teacher and student each see half the picture and must talk to complete it | two-sided, speaking by necessity | finder, interview |

## Assignment for B1 Season 1 (chapter by chapter)
| Lesson | Shape now | Shape to reshape to / next |
|---|---|---|
| E1 Cold Open | `ppp` (old skeleton, Trophy Forge loot) | keep; it is the Season opener |
| E2 Word Lab | `ppp` (grandfathered) | reshape to `cafe` or `ttt` (words as orders) |
| E3 Pattern Lab | `discovery`-ish but built on `ppp` (grandfathered) | reshape opening: cold open at the case board |
| E4 On Air | `studio` on the `ppp` opening (grandfathered) | reshape opening: go live first, teach in the break |
| **E5 Deep Dive** | **`escape`** (this lesson, built 2026-10-17) | — |
| E6 My kind of adventure | `story` (free choice, branching) | planned |
| E7 Remix | `run` (roguelike run with a boss) | planned |
| E8 Release | `studio` or `show` | planned |

## How a lesson opens (not the same ten minutes)
Pick one: **in the middle of the action** (the door locks), **a challenge first** (try it cold), **a voice message** from a cast member, **a mystery object**, **a decision**. Never again `lobby, speak, choice, build, speak, comic, choice`.
