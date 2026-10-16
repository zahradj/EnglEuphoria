# Universal Playground Lesson Blueprint

**Audience:** Content creators, teachers, curriculum reviewers
**Hub:** Playground (Kids, ages 4–9)
**Format:** 1-on-1 online · 30 minutes · 22 slides
**Status:** Canonical — every Playground lesson inherits this contract.

---

## 1. Fixed Contract (hard-locked)

| Field | Value |
|---|---|
| Hub | `playground` |
| Duration | 30 minutes |
| Slide count | 22 |
| CEFR range | Pre-A1 → B1 (matrix-enforced) |
| Speaking density floor | ≥ 40% of lesson time |
| Target vocab cap | 6–8 words, each recycled ≥ 4× |
| Grammar | Implicit only — no rule slides, no metalanguage |
| Reading register | Concrete, ≤ 6-word definitions, no abstract nouns |
| Story spine | 1 recurring character + Pip mascot (continuity validator on) |
| Phonics | 1 micro-moment per lesson (Playground-only standalone) |
| Mastery gate | ≥ 80% on key interactive slides → Vault sticker |
| Leaderboards | ❌ Forbidden |
| Visual style | Flat 2.0 + Claymorphism vault stickers |

---

## 2. Pedagogical Principles

1. **TPR first** — movement before speech lowers anxiety.
2. **Story spine** — one character carries every slide (+40% recall).
3. **i+1 input** — only 6 new words, recycled multiple ways.
4. **Multi-sensory loop** — see → hear → mimic → move → speak → play.
5. **Micro-wins every ≤ 90 s** — XP, sticker, Pip cheer.
6. **Speaking > teacher talk** — child speaks more than the teacher.
7. **Exit on a high** — celebration slide, never a quiz.
8. **Compassionate failure** — 2 streak-freeze tokens, no game-over.

---

## 3. Universal 22-Slide Skeleton

```text
#  Stage          Purpose                          Activity type
─────────────────────────────────────────────────────────────────────
1  Hook           Warm-up song (TPR actions)       sing_along
2  Hook           Pip greeting + question          speaking_cued
3  Context        Story opener (character)         story_slide
4  Input          Vocab Vault reveal (6 words)     vocab_cards
5  Input          Echo mimic (mic on)              pronunciation_mimic
6  Discovery      Reveal game (image → word)       listen_and_match
7  Controlled     Drag & match (character helps)   drag_drop
8  Controlled     Implicit grammar model           dialogue_model
9  Controlled     Spinner choice → say sentence    spinning_wheel
10 Communicative  Teacher Q → child A              speaking_guided
11 Communicative  Role-swap (child asks)           speaking_roleplay
12 Game break     Memory match                     matching_pairs
13 Production     Personal choice + sentence       speaking_production
14 Pronunciation  Phonics micro-moment             phonics_drill
15 Recall         Quick-fire flashcards (3 s)      rapid_recall
16 Story          Story payoff (character)         story_slide
17 Cool-down      Sing-back (child leads)          sing_along
18 Reflection     "Show me your favorite"          personalization
19 Achievement    Vault sticker unlock             reward_slide
20 Mission        Home Mission (real-world)        homework_task
21 Celebration    Confetti + XP tally              celebration
22 Closing        Routine goodbye                  closing
```

**Totals:** 9 speaking moments (~41%) · 5 mini-games · 6 words × 5 exposures · grammar implicit.

---

## 3a. Story lessons get REAL video (hard rule, Pre-A1)

**Lesson 5 of every Pre-A1 unit is the story lesson, and its story MUST be a
real animated video** — characters that actually move, talk and act out the
story (generated video clips: image-to-video / text-to-video), cut together
with the narration. A slideshow of still pictures with zoom/pan ("Ken Burns")
is **not** acceptable for Lesson 5; it is only a temporary fallback while the
real clips are being generated, and the lesson is not "done" until they are.

| Requirement | Detail |
|---|---|
| Which lessons | Lesson 5 of every Pre-A1 unit (the storybook slot of the unit arc) |
| What | One clip per story beat (≈ 5-8 s each, 6-8 beats), real motion: walking, giving, swimming, opening, laughing |
| Consistency | Every clip starts from the lesson's own approved story picture (image-to-video), so characters look exactly like the Playground cast |
| Content | Matches the story line for that beat word for word (semantic check against the narration); no text in the frame |
| Audio | The clip's own sound is muted; narration = the recorded character voices (`speak()`), never generated speech, never browser TTS |
| Format | One stitched MP4 (H.264, faststart) + WebM fallback in `public/lep1/video/`, with `atSec` marking where each beat starts; picture-answer questions pause it |
| Fallback | If a clip cannot be generated yet, that beat may use the still picture — the lesson is flagged "video pending" and must be finished before it goes live |
| Generator | **Higgsfield only** (owner's rule, 2026-10-03) — image-to-video from the story picture through the Higgsfield tools/API. No other video service (Veo, fal, PixVerse…) for new clips. Clips already made before this rule stay. |

Other lessons may keep picture-films (`story-video` built from stills) for
short story openers and payoffs; Lesson 5 may not.

**Demonstration pages ("watch and copy": body parts, actions, TPR, point-to) — every lesson**
(owner-approved standard, U4L1 page 4, 2026-10-04): follow `.claude/skills/kids-demo-video`. ONE character, full body,
front view, one picture per spoken line (Canva edits of one base picture), the target word added by us with a line to the
exact spot (`scripts/label-video.py`; both sides for pairs), stills film first; AI motion only through strict mode with
start + end key pictures.

---

## 3b. Extra Time — brain breaks & bonus activities (every lesson)

A 30-minute class rarely runs exactly to plan: a confident child finishes
early, a shy one needs a break. **Every lesson ends with an optional
"Extra time" block, placed after the Home Mission and before the goodbye**,
that the teacher can use or skip (Next skips it; nothing in it is new):

| Slot | What | Scene kind | Time |
|---|---|---|---|
| E1 | **Brain Break** — stand up and move: stretch, jump like a ball, drive the train, "Freeze!" (5-8 moves) | `tpr-actions` with `mode: 'break'` | 1-2 min |
| E2 | **Bonus game** — a favourite game of the lesson again with new rounds (Mystery Bag, Torch Hunt, Odd One Out, Spin…) | any game kind, `teacher` note starts "Extra time:" | 2-4 min |
| E3 | **Bonus game 2** — a different mechanic from E2 (memory, quick-fire cards, pattern train…) | any game kind | 2-4 min |

Rules:
- A brain break is also allowed mid-lesson after a long sitting stretch
  (blueprint "low attention day" knob) — same `tpr-actions` break mode.
- Bonus games use only words already taught in this lesson or earlier.
- The Variety Rule still applies: no more than 2 of the same kind in a row,
  counting the extra block.

### 3b+. Extra practice block — every lesson has 22-25 pages (owner, 2026-10-12)

Owner: *"17 pages are not enough for 30-minute classes … use the games list and create extra practice … the maximum
pages could be 25"* and *"there is no goodbye song at the end"*. So:

- **Every lesson (not the 6-page tests) has about 20 pages and never more than 25.** A lesson that is shorter gets an
  **extra practice block before the sticker** (part of the lesson, not optional), written in
  `src/content/playground-library/unit1/extraPractice.ts` (`EXTRA_PRACTICE['U-L']`); teacher notes start "Extra practice:".
- **No game twice in a unit** (owner, 2026-10-12: "don't repeat the games in the same unit, be smart on how to use them
  and when"): an extra-practice game is used once per unit and never repeats a game a lesson of that unit already has
  (`pictureMaze.test.ts` checks it). Pick by purpose:

| Lesson | Purpose | Extra practice that fits |
|---|---|---|
| L1-L3 new words | listen, notice, recognise | Picture Maze (`picture-maze`), Stepping Stones, Image Reveal, Shadow Match, Catch & Sort, Pattern Train, Quick Fire, What's Missing? |
| L4 sentence frame | say the sentence, ask | Flip & Say (`flip-say`), role-play, Secret Card, Spin & Say |
| L5 story | take the words home | Home Hunt (`home-hunt`) |
| L6 unit review | recall the whole unit | Word Board (`word-board`), Odd One Out, Memory Train |

  Long games (Word Board, Home Hunt, Picture Maze: 3-5 minutes each) fill time better than extra pages.
- Words: only this lesson and the lessons before it in the unit; the lesson's own pictures and its empty backgrounds.
- **Every lesson ends with a goodbye song** before the finale (the shared Pre-A1 goodbye song, `goodbyeSong()`), the
  unit tests and level tests too.
- Research (mechanics only): Abridge Academy "Top five interactive games for online teaching" (snakes & ladders review
  board), Twinkl "Vocabulary games for online ESL students" (home scavenger hunt), JALT "Using Wordwall warm-up and
  review activities" (flip tiles, speaking cards, random wheel).
- The finale (celebration) and goodbye song come after the extra block, so
  the lesson always **exits on a high**.

---

## 3c. Slide → scene kind map (Pre-A1 scene lessons)

How each skeleton slide is built with the real scene kinds (see
`.claude/skills/activity-pattern-library`):

| # | Stage | Scene kinds |
|---|---|---|
| 1 | Warm-up song (TPR) | `song` |
| 2 | Pip greeting + question | `cinematic` |
| 3 | Story opener | `story-video` (a narrated film — non-readers) |
| 4 | Vocab reveal | `toy-model` / `color-model` / `shape-model` |
| 5 | Echo + move | `tpr-actions` (Move & Say) or `listen-repeat-cards` |
| 6 | Reveal game | `mystery-bag`, `shape-torch`, `color-spy` |
| 7 | Drag & match | `color-sort`, `shape-sort`, `plural-sort` |
| 8 | Implicit grammar model | `listen-repeat-cards` (one picture per chunk) |
| 9 | Spinner → sentence | `spin-wheel` |
| 10-11 | Q→A, role swap | `join-stage` |
| 12 | Memory match | `memory`, `train-recall` |
| 13 | Personal choice | `join-stage` with a real object, `secret-card` |
| 14 | Phonics micro-moment | **`sound-blend` (Blend It! / Sound Train) — universal, every Playground lesson (owner 2026-10-10)**: tap each sound (recorded letter sounds), Blend!, find the picture. Pre-A1 may add `sound-model` + `trace`/`dash` before it. Pre-A1 starts blending at Unit 1 Lesson 4 with words of taught sounds only (`scripts/plan-blend-rollout.py`) |
| 15 | Quick-fire flashcards (3 s) | `rapid-recall` |
| 16 | Story payoff | `story-video` (part 2) |
| 17-18 | Sing-back / show your favourite | `song`, `join-stage` |
| 19 | Sticker unlock | `sticker-reward` (Sticker Book, kept across lessons) |
| 20 | Home Mission | `home-mission` (picture steps + parent note) |
| E1-E3 | Extra time | `tpr-actions` break + 2 bonus games |
| 21-22 | Celebration, goodbye | `song`, `finale` |

**Pre-A1 = non-readers:** every prompt is spoken; answers are pictures, taps,
actions or speech; printed text is a small caption for the adult (≤ 5 words).

**Look & feel:** Playground orange `#FE6A2F` + cream, large rounded "clay"
cards (puffy highlight, bottom lip, soft deep shadow — `CLAY_CARD` /
`CLAY_BUTTON` in `unit1/scene-components/shared.tsx`), cards on the open side
of the picture (never over the character), ≥ 80 px tap targets, wide 16:9 art.

**Game feel — an animated video game, not flat cards (owner, 2026-10-03):** full method, numbers and the 10-point juice audit in `.claude/skills/game-animation`.
- **Living world:** each game scene gets a seamless looping clip of its own
  picture (`bgVideo`; Higgsfield image-to-video → `scripts/make-game-loops.py`
  ping-pongs it, ~1 MB): water flows, flowers sway, the character blinks. The
  still picture stays as the poster/fallback.
- **Painted game pieces,** never plain CSS boxes: river, stones, chests, gems
  are illustrated art used as stickers. **Pictures are made with Canva only;
  Higgsfield is for video only** (owner, 2026-10-04).
- **Motion with physics** (`unit1/scene-components/gameFx.tsx`, framer-motion):
  characters breathe when idle and hop in an arc with squash & stretch
  (`Hopper`); pieces spring in, float idly (`idleFloat`), lift and tilt when
  dragged; every right answer bursts (stars / splash / confetti — `useBursts`);
  a wrong answer wobbles the screen softly (`useShake`) — never a punishment.
- Respect reduced motion; nothing flashes; the still game must stay playable.
- **Never zoom or pan a still picture** (no Ken Burns, no ffmpeg `zoompan`, no CSS
  scale/translate loops on story pictures) — owner, 2026-10-03: it shakes. Stills
  hold perfectly still and cross-fade (`scripts/make-stills-film.py`); real
  movement comes only from real animation (Higgsfield clips, living loops).

**Research behind the 2026-10 additions:** Khan Academy Kids (guide
characters, collectible rewards → Sticker Book), Novakid / Oxford *Toy Team*
and *Everybody Up* (TPR + songs → Move & Say, brain breaks), Cambridge Pre A1
Starters (picture-based tasks, tick-or-cross, listen-and-colour), ESL toy
lessons (feely box → Mystery Bag; "What are these? — They're bears" → one vs
many), 2025-26 kids' app design (claymorphism, custom illustration).

## 3d. Games by lesson slot — no game twice in a unit (hard rule, Pre-A1)

Owner's rule (2026-10-03): *"each lesson is kind of boring — lesson one in
each unit, lesson two in each unit has a different activity."* Every lesson
NUMBER owns its own signature games. Lesson 1 of every unit uses the Lesson-1
set (with that unit's words), Lesson 2 the Lesson-2 set, and so on — so inside
one unit a child never meets the same game twice, and each lesson number
feels different. The map lives in code (`SLOT_GAMES` in
`unit1/sceneValidator.ts`); `checkSlotGames()` flags a game borrowed from
another slot.

| Slot | Feel | Reveal (6) | Match / sort (7) | Game break (12) | Phonics game (14) | Recall (15) | Extra-time favourite |
|---|---|---|---|---|---|---|---|
| L1 | Meet the words | `mystery-bag` | `picture-match` | `memory` | `sound-pop` | `rapid-recall` | `hello-doors` |
| L2 | More words, sort them | `listen-colour` | `catch-sort` | `feed-monsters`, `color-monsters` | `dash` | `train-recall` | `friend-pop` |
| L3 | Make & build | `puzzle` | `basket` | `jigsaw-puzzle` | `brick-crush` | `pattern-train` | `word-build` |
| L4 | Ask & answer | `secret-card` | `sound-sort` | `color-simon` | `gather` | `shape-fishing` | `alphabet-order` |
| L5 | Story (real video) | `lift-flap`, `peek-pop` | `tick-cross`, `tidy-up` | `who-said-it` | `alphabet-blocks` | `story-order` | — |
| L6 | Review hunt | `shape-torch`, `claw-machine` | `shadow-match` | `draw-path`, `ring-toss` | `trophy-chest` | `tile-reveal` | `stepping-stones`, `odd-one-out` |

- **Shared by every lesson** (the routine children rely on, not "games"):
  `title-card`, `song`, `cinematic`, `story-video`, `story-order` (after any
  film), `listen-repeat-cards`, `tpr-actions` (Move & Say, brain break),
  `join-stage`, `spin-wheel`, `sound-model`, `trace`, `echo`,
  `sticker-reward`, `home-mission`, `finale`.
- **Topic kinds** (`color-*`, `shape-model`/`shape-sort`/`shape-builder`,
  `toy-model`, `feelings-*`, `age-*`, `he-she-*`, `numbers-*`,
  `plural-sort`, `x-is-feeling`…) go in the lesson that teaches that topic,
  at most **2 lessons per unit**.
- Extra time replays the slot's own games with NEW rounds (E2/E3), never a
  game from another slot.
- New mechanics (2026-10 research: Lingokids *Draw Path*, Wordwall *Image
  quiz*, Khan Academy Kids shadow puzzles, the stepping-stones floor game)
  join a slot that is short of games, so the set keeps growing.

## 3e. Vary everything, every lesson — research, then beat the best apps (hard rule, all hubs)

Owner's standing rule (2026-10-04): *"In every next lesson vary the activities,
the look, the scenes and the themes. Search the internet — Khan Academy,
Oxford, Cambridge, LingoAce, Lingokids, VIPKid and the top apps and online
schools — and create better than them. Avoid boring the student."*

Every lesson, before it is designed (skill: `.claude/skills/lesson-variety-engine`):
1. **Research ≥ 3 benchmarks** for the lesson's skill (Khan Academy Kids,
   Lingokids, LingoAce, VIPKid, Novakid, Duolingo ABC, ABCmouse, Oxford,
   Cambridge, Wordwall…), rotating them. Take the mechanic, never the content.
2. **Do better** — one "better than" line per borrowed mechanic (the language
   is the win condition, permanence, story continuity, live-class sync,
   tap-tap alternatives, juice audit).
3. **Add or upgrade ≥ 1 mechanic** per lesson (new kinds join a slot in §3d,
   so each slot's set keeps growing and units stop repeating each other).
4. **Vary at four levels** — enforced in code by `checkLessonVariety`
   (`src/content/playground-library/lessonVariety.ts`, test in the deploy gate):
   - activities: ≥ 4 games besides the routine spine, none from the previous
     lesson, ≤ 50 % repeated from the same slot of the previous unit, never 3
     of a kind in a row;
   - look: new pictures (none reused from the previous lesson), its own light /
     palette / mood;
   - scenes: a setting the previous lesson did not use;
   - theme: a new story frame / mission (show and tell, tidy-up, treasure hunt,
     rescue, party, journey…), not the plot shape of the previous two lessons.
5. **Register** `LESSON_PROFILE` (settings + look) and `RESEARCH_LOG`
   (sources, mechanics, betterThan) for the lesson, and report the research to
   the owner with links.

## 3f. "Remember?" warm-up — every lesson recalls the one before (hard rule, all Playground worlds)

Owner's rule (2026-10-07): *"In each lesson add a reminder of what the student
has done in the previous one — listen and match, listen and click, a pre-K
activity — just to memorise. Make it universal."*

- Every lesson after the first of its track opens — right after the title /
  hello song, before the new words — with ONE `recall-warmup` scene
  (`src/content/playground-library/RecallWarmupScene.tsx`, registered in the
  Pre-A1 renderer AND the A1/A2 Welcome Town / Magic Castle / Jungle renderer).
- 2-5 words of the lesson before, each with the picture that lesson taught it
  with. Pip says it (`say`: "Find the brother!", "Who is happy?", "I wake up!
  Find it!"), the child finds it — no reading, no clock, a wrong tap is just
  "Try again!", the right picture glows after two misses.
- Two looks, so it never feels the same:
  - `mode: 'click'` — **listen and click**: three pictures per turn. Use it for
    colours, scene pictures and anything with look-alike outlines.
  - `mode: 'shadow'` — **listen and match the shadow**: every sticker is a
    silhouette, the one you hear fills in with colour. Stickers only, and only
    when the outlines are clearly different (never mom vs dad).
- It is a routine scene (`ROUTINE_KINDS`), not one of the lesson's games, so it
  never counts against the variety rules.
- Enforced by `src/content/playground-library/recallWarmup.test.ts` (deploy
  gate). A1/A2 lessons whose opener was already an authored review game
  (Magic Castle `mc2-review-rooms`, `mc3-warmup-match`) are listed there.

## 3f+. Words → matching → a game (hard rule, all Playground lessons — owner, 2026-10-13)

"Each time after illustrating vocabulary, there should be a matching activity … For the pre-A, listen and match. For
A1, read and match … after the matching, another activity or another game to remember the words fully."

- Right after every page that shows new words (`listen-repeat-cards`, `meet`, `vocab-spot`…) comes a **matching page**:
  - **Pre-A1: Listen and Match** (`listen-match`) — only sounds, no written words: coloured speakers play "A bat!",
    the child taps a speaker, then its picture. The matched speaker stays on the picture.
  - **A1: Read and Match** (`picture-match`) — the written words go under their pictures.
- Then **one more game with the same words** (any game of the lesson's slot) before the lesson moves on.
- `listen-match` is a routine kind (`ROUTINE_KINDS`), so it may come in every lesson.
- **The matching game changes its design** (owner 2026-10-14: "change the design of the games to prevent repetition —
  make it a rule"): `listen-match` has four looks — `cards` (picture grid), `balloons` (pictures float on balloons),
  `doors` (a row of doors, the right one swings open), `lilypads` (pictures on a pond) — assigned by (unit + lesson) mod 4,
  so a lesson never shares its look with the lesson before or with the same lesson of the previous unit
  (`listenMatchVariety.test.ts`, deploy gate). Any game used in many lessons follows the same rule: several designs,
  rotated.
- **The A1 Read and Match changes its design too**: `picture-match` has four looks — `cards`, `frames` (framed
  pictures on a wall, brass name plates, wooden word tags), `polaroids` (taped photos, sticky-note words), `chalk`
  (chalkboard tiles) — by (unit + lesson) mod 4; a second one in the same lesson takes the next look
  (`readMatchVariety.test.ts`, deploy gate).
- **A1: the Read and Match comes right after the opening words** (owner 2026-10-13, applied 2026-10-14 to A1 Units
  1-4 Lessons 1-5 and Unit 9 Lesson 4): words lessons match words or sentences to stickers, story lessons match story
  sentences to the story pictures. Checked in `readMatchVariety.test.ts` (a matching page within the first 15 pages).
- **Pre-A1: every lesson that teaches words on a listen-repeat-cards page has a Listen and Match** (checked in
  `listenMatchVariety.test.ts`). A full scene picture fills its frame in every design, so it is never shown tiny.
  A `crop` on an item shows only the part of a scene picture that carries the word (Leo's pose in U4L1, Pip's shoes
  in U9L5, the toy and its place in U3L5). Story phrases are matched to their story moments (U2L5
  "Here you are!" = the boat, U6L5 "No, it isn't!" = the blue and the yellow door). Every Pre-A1 word lesson now has one.
- **Aesthetic pass on every activity** (owner 2026-10-14): colours, look, layout, icons and game feel are designed, not
  left at defaults; floating pieces over a busy picture sit on `CalmBg` (blurred, veiled picture) — see CLAUDE.md
  "Aesthetic pass on every activity" and `.claude/skills/game-animation` §5b.
- First lesson built this way: Pre-A1 U1L5 (story words → Listen and Match → Wind Catch → the film).

## 3g. A1 lessons — themed worlds, the plan first, sentences and questions (all A1 lessons)

Owner (2026-10-12): A1 is ten themed worlds (Welcome Town, Jungle, Space, Food Festival, Monster Town, Ocean, Hero City,
Dino Valley, Magic Castle, Gadget Lab), strengthened with the A1 Movers grammar spine and a fun layer
(`docs/a1-playground-roadmap.md`). Every A1 lesson keeps the 22-slide skeleton above and adds these rules.

**Start from the lesson plan, never from memory.** Each of the 70 slots has a plan in
`src/curriculum/roadmap/a1LessonPlans.ts` (`getA1LessonPlan(unit, lesson)`): the "I can…" objective, grammar, new words
(3-6), recycled language, phonics, signature game, evidence, fun hook and home mission. The unit's goal and grammar step are
in `a1Roadmap.ts`; the unit's own objective file (e.g. `docs/a1-unit-2-jungle.md`) gives the progression. The database row
(`curriculum_lessons`: description + `ai_metadata.blueprint_ref`) is synced from the same file
(`scripts/a1-lesson-plans-sql.ts`). If a lesson needs to change, change the plan first, then the lesson.

**What A1 adds to the 22 slides (Pre-A1 → A1 = words → sentences and questions):**

| Slot | Pre-A1 | A1 upgrade |
|---|---|---|
| 2 | Pip greeting | **Remember?** warm-up of the lesson before (§3f) |
| 4-5 | word cards, echo | **word pages** (character on one side, the word big on the open side) — one word per page, then echo |
| 8 | implicit grammar model | **the sentence page**: one new structure per page, with its own picture that shows exactly that sentence ("A monkey can climb. It can't fly."). No rule, no grammar words |
| 9-10 | spinner, teacher asks | answers are **full sentences**; the teacher accepts a short answer, then models the full one |
| 11 | role-swap (optional) | **the child asks** — required in A1 (A1 = asking as well as answering) |
| 13 | personal choice | a **personal sentence** about the child's own life |
| 14 | phonics micro-moment | digraph / blend / vowel team of the plan + **read one short sentence** with it |
| song | — | the lesson's song comes **after the words and a first game** (CLAUDE.md), never at the start |
| 16 | story payoff | the payoff uses the lesson's sentence |
| 19 | Vault sticker | sticker **+ Explorer Passport stamp**, earned by saying the lesson's "I can…" sentence |
| 20 | Home Mission | the plan's home mission (a real-life use of the sentence) |

**Enough guided practice, then free practice (owner, 2026-10-12: "make sure that the student practises enough guided
practice and free practice").** Every A1 lesson climbs the same ladder, and no step is skipped:

| Stage | What the child does | Slots | Minimum |
|---|---|---|---|
| Present | hears and sees the new words / the sentence (word pages, sentence page, watch & copy) | 3-5, 8 | — |
| **Guided practice** (controlled) | uses the language **with support**: a model to copy, choices to pick from, a sentence frame to fill ("A ___ can ___."), drag / match / listen-and-tap, chorus and echo; the answer is fixed and the game checks it | 6-9, the first game, the song | **3 activities** (≈ 8-10 min), at least one where the child says the full sentence |
| **Free practice** (less controlled → free) | uses the language **without the model**: own sentences about own life (slot 13), describing a picture or animal in their own words, asking the teacher questions (slot 11), choosing and explaining, role-play, the "child is the expert" moment; more than one right answer | 10-13, 16, the signature game's last round | **2 activities** (≈ 6-8 min), each ending in the child's own spoken sentences |
| Check | the lesson's evidence page from its plan (what proves the objective) | before the sticker | 1 |

The teacher note on each scene says which stage it is (`teacher` starts with "Guided:" or "Free:"), and the lesson-quality
gate counts them. A lesson whose only speaking is repeating is not done.

**Lesson 7 is the evaluation lesson** (the unit Boss Test, `docs/assessment/a1-assessment-plan.md`): review games first,
then the Boss Test (words, sentences, reading & sounds, speaking rated by the teacher, 80 % per part), then the compass piece,
the teaser of the next world and the sticker. After Unit 5 comes the **A1 Halfway Check** and after Unit 10 the **A1 Final
Test**, which decides whether the child is ready for A2 (teacher confirms, admin approves the level change).

**The unit arc decides the lesson type** (same in every world):

| Lesson | Type | What changes |
|---|---|---|
| L1, L2 | new language | 3-6 new words + one new structure; the signature game must need the new language to win |
| L3 | listening | built around the unit song: no new grammar, listening for detail (Cambridge format tasks: listen & colour, yes / no, question → answer). **Never "who said it?"** — naming the cartoon who spoke trains nothing (owner, 2026-10-12) |
| L4 | speaking | **the child is the expert**: the child describes / asks / instructs, the world's local friend makes a mistake the child corrects; ends in a free mini-conversation |
| L5 | story | the whole book in the Reader + **story GIFs** (Canva GIF loops of the story pictures — no story videos in A1, owner 2026-10-13; scenario + preview GIF + owner OK first), pause questions, retell |
| L6 | extra practice | two games, accuracy over speed, everything recycled |
| L7 | Boss Test | 80 % per part, Practise-again pack; a **Golden Compass piece** (Units 2-10) and a 5-second **teaser** of the next world |

**Length (owner, 2026-10-13: "A1 lessons can be from 30 to 49 pages"):** every A1 lesson has **30-49 pages**. The extra
pages are real teaching, never padding: one model page per new word or chunk (one idea per page), echo pages, more
guided and free practice, reading games, speaking stages, brain breaks and an Extra-time block — and still **no game
twice in a unit** (the Boss Test may reuse formats). Checked by `a1LessonLength.test.ts`.

**No story videos in A1 (owner, 2026-10-13: "In A1 no need for story videos, just use GIF videos"):** A1 stories use
Canva GIFs made from the approved story pictures (flip-book of poses, picture-to-picture), never generated video. Every
GIF follows the scenario rule: written scenario (`docs/scenarios/`) → quick preview GIF → owner OK → into the lesson.

**Fun layer in every A1 lesson** (research in the roadmap §4b): at least **2 real choices** that need the target language
(which friend, which path, which animal), **1 surprise** after the words are taught, a move or song break every 8-10
minutes, and rewards only for using English (never for taps). No leaderboards, no lives that block, no timer on first
meeting a word.

**A1 reads sentences, not just CVC words — the story is the spine (owner, 2026-10-12).** Every A1 unit has one serial
story (Unit 1: *Leo's First Day*, `docs/a1-unit-1-welcome-town.md`). Each lesson reads its episode in the **Reader**
(read-along, words light up, then the child reads; tap a word for help); L5 reads the whole book. Sight words come 3-4 per
lesson. **Blend & Read** (every lesson): the blending words come from the story and the blended word flies into a story
sentence that the child reads. **Tongue twister** (every lesson, after Blend & Read) on the lesson's sound, following the
A1 ladder (easy in Unit 1 → contrast twisters, fast and timed in Unit 10; ladder in the Unit 1 doc §6).
**Every page must name the part of the objective it trains**; pages with no language goal ("any answer is right — my
favourite…") are not used.

**Games:** any Pre-A1 game can run in an A1 lesson as `{ kind: 'prea1', scene: … }`; A1-only games live in the Welcome Town
renderer. No signature game twice in a unit (`a1LessonPlans.test.ts` checks the plans; `lessonVariety` checks the lessons).

**A1 game menu — where each game goes (owner, 2026-10-13: "extend the games list … old ones with modern designs").**
Full list with sources: `docs/a1-activity-library.md` (§10 built since, §11 classic games redesigned, §12 platform
mechanics). Pick from this menu by slot and lesson type; ✓ = built (can go in a lesson now), ★ = to build (only after it
is built, tested and screenshot-checked). Classic games keep their mechanic but get the modern look: painted Canva set,
cut-out stickers, juicy UI motion (`game-animation`), recorded voices, nobody "out", no scary or unkind original (⚠️ rows
in §11). Still no game twice in a unit.

| Slot | Best for | Games (✓ built · ★ to build) |
|---|---|---|
| Warm-up / discovery | L1-L5 openers after Remember? | ✓ Mystery Bag · ✓ Tile Reveal · ✓ Lift the Flap · ✓ What's / Who's Missing (Kim's Game) · ✓ I Spy binoculars (`i-spy`) · ✓ Treasure Radar (`hot-cold`, hot and cold) |
| Listening for detail | L1-L3 | ✓ Listen & Tap · ✓ Tick or Cross · ✓ Draw the Path · ✓ Photo Snap · ✓ Sticker Bingo (`sticker-bingo`) · ✓ Musical Islands (`musical-islands`) · ✓ Whisper Tube (`whisper-tube`, telephone) · ✓ Echo Cave (`echo-cave`, find the voice: left/middle/right) |
| Guided practice | L1-L4 | ✓ Catch & Sort · ✓ Shadow Match · ✓ Picture Maze · ✓ Claw Machine · ✓ Read & Do · ✓ Field Guide · ✓ Sentence Dominoes (`dominoes`) · ✓ Balloon Match (`balloon-match`) · ✓ Jungle Glider (`glider`, Wordwall Airplane) |
| Free speaking | L2-L4, L6 | ✓ Secret Card (20 questions) · ✓ Chat Chain · ✓ Flip & Say · ✓ Charades · ✓ Go Fish! (`go-fish`) · ✓ Hot Coconut (`hot-coconut`, hot potato) · ✓ Draw That (`draw-guess`, Pictionary on a shared canvas) |
| Phonics / reading | every lesson | ✓ Letter Blocks · ✓ Word Splat · ✓ Letter Monsters / Moles / Fishing · ✓ Letter Game · ✓ Save the Balloon (`save-balloon`, hangman ⚠️) · ✓ Letter Bubbles (`letter-bubbles`, anagram) · ✓ Picture Crossword (`crossword`) |
| Game break / arcade | any | ✓ Obstacle Run · ✓ Brick Crush · ✓ Stepping Stones · ✓ Number Hop (stepping-stones look) · ✓ Red Light, Green Light (`red-green`) |
| Review / L6 Game Day | L6 | ✓ Word Board (snakes & ladders) · ✓ Answer Race · ✓ Hero Trials · ✓ Tic-Tac-Toe Duel (`tic-tac-toe`) · ✓ Pass the Present (`pass-parcel`) · ✓ Wobbly Tower (`tower-pull`, Jenga) · ✓ Treasure Chests (`chest-quest`) · ✓ Team Flags (`flag-race`) |
| Boss Test / unit frame | L7 | ✓ Answer Race · ✓ Hero Trials · ✓ Jungle Jeopardy (`quiz-board`) · ✓ Rising River (`rising-river`, floor is lava, co-op) · ✓ Treasure Islands (`grid-hunt`, battleship A-D × 1-4; first placed in L3/L4 practice) · ✓ Build the Town (`world-builder`; keeping it across lessons is still to build) |
| Extra time | any | ✓ Home Hunt · ✓ brain breaks · ✓ Pet Pal (`pet-pal`, routine after the sticker reward in every lesson; Biscuit's shelf grows across the units) |

**A1 checklist (before "done", with `lesson-quality-gate`):**
- [ ] the lesson matches its plan (objective, grammar, words, game, evidence, home mission)
- [ ] one structure per sentence page, each with its own matching picture
- [ ] the child answers in full sentences AND asks at least one question
- [ ] at least 3 guided-practice and 2 free-practice activities, marked "Guided:" / "Free:" in the teacher notes
- [ ] Remember? warm-up, song after the words + first game, sticker + passport stamp, home mission
- [ ] 2 choices + 1 surprise; L4 has the child-is-expert moment; L7 has the compass piece and the teaser
- [ ] DB row: real title, `contentFormat`, unpublished until merged (lesson hand-off rule)

---

## 4. Built-in Learning Loops

- **Multi-sensory cycle per concept:** see → hear → mimic → move → speak → play
- **SM-2+ recall ladder:** input → drag → spinner → match → production (5 exposures ≥ retention threshold)
- **Spiral hook:** last story beat seeds next lesson's opener (interleaving)
- **Micro-win cadence:** reward signal every ≤ 90 s
- **Pip reactions:** cheer, dance, surprise — never during speaking tasks

---

## 5. Differentiation Knobs (teacher live)

| Learner profile | Adjustment |
|---|---|
| Shy / new | Skip slide 11 role-swap, double slide 7 drag rounds |
| Advanced (A1+) | Unlock bonus *"I like ___ but I don't like ___"* slide; in A1 lessons, the optional "challenge" round (one more sentence, no hints) |
| A1 child who can't read yet | Every A1 prompt is spoken; the reading sentence on slot 14 is read together (finger under the words), never a gate |
| Age 4–5 | Drop slides 14 (phonics) + 18 (reflection), extend song |
| Low attention day | Pip offers a 10 s stretch break (no XP loss) |

---

## 6. Engine Routing (enforced by orchestrator)

```text
Planner → Governance → Adaptive → Grammar (implicit profile) →
Pronunciation (PG phonics) → Memory → Speaking (PG floor 40%) →
Gamification (no leaderboard) → Coherence (homework ≤ 10 min) →
Arcade (≤ 3 games / 8 min) → QA → Stabilization → Publish
```

Code contract: `HUB_PLANNING_PROFILES.playground` in `src/planning/hubProfiles.ts`.

---

## 7. Success Criteria (auto-tracked)

- ✅ ≥ 80% accuracy on slides 7 + 12 → Vault sticker unlocks
- ✅ ≥ 3 spontaneous utterances captured in slides 10–13
- ✅ Speaking-time ratio ≥ 40%
- ✅ Exit emotion = 😄 (Pip poll)

---

## 8. Reference Instance — "Leo's Jungle Breakfast"

| Field | Value |
|---|---|
| CEFR | Pre-A1 |
| Character | Leo the Lion + Pip |
| Theme | Jungle breakfast |
| Target vocab (6) | banana, apple, milk, bread, egg, cookie |
| Communication goal | Name 6 foods · *I like / I don't like ___* · *Do you like ___?* |
| Grammar (implicit) | Present simple *like* (+/−/?) |
| Phonics micro | /b/ → banana, bread |
| Home Mission | "Tell mum/dad 3 foods you like in English" |
| Spiral hook → next lesson | Leo's lunchbox → drinks theme |

**To generate this lesson:** open the Unified Lesson Generator at `/content-creator/unified-generator`, select `Hub = Playground`, `CEFR = Pre-A1`, paste the fields above, and run. The orchestrator will produce a draft in `curriculum_lessons` (unpublished) ready for teacher review.
