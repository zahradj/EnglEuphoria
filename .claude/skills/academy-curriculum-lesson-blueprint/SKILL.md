---
name: academy-curriculum-lesson-blueprint
description: One-page master reference for the Academy hub (ages 13-18, Pre-A1 to C1, one-to-one 60-minute lessons): the 8-episode Season stack, the 60-minute Run of Show, the pedagogical rules and gates, the 171-game catalogue and video-game mechanics, and an optional JSON shape for a lesson plan. Use when planning or reviewing an Academy Season, episode or lesson plan, or when someone asks "what is the Academy structure / rule for X". Pairs with academy-season-system (read that first), academy-lesson-craft, academy-session-builder and academy-quality-gate. Academy only: never use the Playground or Success blueprints.
---

# Academy curriculum and lesson blueprint (reference)

Compiled 2026-10-16 from the code (`src/curriculum/academy`), the lesson decks (`src/academy-deck`) and the documents in `docs/academy-*`. Where this page and the code disagree, **the code wins**. A printable version with the full tables is the "Academy Hub Curriculum and Lesson Handbook" PDF.

## 0. Where things live (hard rules)

- **Skills:** `.claude/skills/<name>/SKILL.md` (a folder with front matter), names starting `academy-`.
- **Hub separation:** Academy code lives in `src/curriculum/academy/` (80 Seasons in `levels/a1.ts` to `c1.ts`, plus `lessonBlueprint.ts`, `speaking.ts`, `checklist.ts`...). It imports nothing from the Playground or Success; `src/curriculum/academy/__tests__/isolation.test.ts` fails on any import that leaves the folder. The lesson decks are `src/academy-deck/` (data-driven slides, registry in `lessonRegistry.ts`). Never edit, import or reuse another hub's blueprint, skills or docs, and never touch the legacy Academy rows in the database (`CLAUDE.md`, `docs/hub-separation.md`).
- **Order of work:** the lesson plan comes first and the owner approves it in writing (`docs/academy-<season>-spec.md`, from `docs/academy-lesson-plan-template.md`); only then art, audio and the deck. Research is logged in `docs/research/academy-<lesson>-research.md` with sources; mechanics are borrowed, never content.

## 1. Structure and size

Level -> Season (= unit, 8 sessions) -> Episode -> 60-minute live session. **80 Seasons / 640 sessions** from A1 to C1 (A1 12, A2 14, B1 18, B2 18, C1 18), plus 5 planned Pre-A1 Seasons. Lesson `n` of a Season reuses lessons `1..n-1` (`buildsOn.stack`, "L3 = L1 + L2 + new"). Every lesson names what it builds on and what it unlocks (prior, current, future knowledge).

| Episode | Focus | New language | Job |
|---|---|---|---|
| E1 Cold Open | listening and reading (gist) | receptive items only (share of the Season budget; B1-S01 has 12) | story hook and context, no forced production of new language |
| E2 Word Lab | vocabulary, pronunciation | core words or chunks | words on their own pages, then two different memorising games per word set |
| E3 Pattern Lab | grammar, writing | one core structure (E3 or E6 only) | inductive noticing, a plain rule of at most 3 lines, controlled games |
| E4 On Air | functional speaking | functional chunks | real-life exchange reusing E2 + E3 |
| E5 Deep Dive | reading, writing | receptive words of a longer text | longer graded text or clip, a short written piece with a rewrite |
| E6 Side Quest | integrated, student's choice | light new language | Exam Lane, School English bridge or an interest skin |
| E7 Remix | spaced consolidation | **none** | mixed retrieval, confusable contrasts interleaved, boss fight |
| E8 Finale | spoken and written product | **none** | peer-style task, the Release, six-strand checkpoint |

**Hard cap:** `MAX_ITEMS_PER_SESSION = 14` new items; at most 8 in Pre-A1; 0 in E7 and E8. Placement of every structure and item must be checked against the English Grammar Profile / Vocabulary Profile and GSE (never invent a placement; mark unverified ones `[U]`).

## 2. The 60-minute Run of Show

The standard split (`RUN_OF_SHOW` in `lessonBlueprint.ts`) is **51 core + 9 flex minutes**:

| # | Stage | Min | Core | What happens |
|---|---|---|---|---|
| 1 | Check-in | 5 | flex | picture mood check (never emoji), 2-3 easy questions, today's mission and 3-5 success criteria |
| 2 | Remember? | 7 | core | starts with the student's **own error list (Mistake Bank)**, then the items that are due from `recallPlan` (items return 1, 2, 4, 8 and 16 teaching lessons later; the Daily 10 follows days 1, 3, 7, 14, 30); 8-12 items, at least 60% production, feedback on every item |
| 3 | The Drop | 10 | core | meaning-first input; every new word met on its own page BEFORE any game; the cast **model** the language (I do) |
| 4 | Notice & Build | 10 | core | guided discovery (we do), the **rule stated plainly in at most 3 lines**, controlled games |
| 5 | Energiser | 4 | flex | zero-stakes game, no timer, no public score |
| 6 | Mission | 12 | core | help dial (Chill / Normal / Push) -> Take 1 -> specific feedback -> Take 2 in the same lesson |
| 7 | Release | 7 | core | un-scaffolded exit product, model hidden, recorded privately first, then saved |
| 8 | Wrap | 5 | core | honest can-do ticks, log up to 3 recurring errors for the next Mistake Bank, assign the Daily 10, reveal the clue; **teach-back** of the rule |

**Flexible split.** A lesson may re-split the hour when its content needs it (B1-S01-E1 uses 3 / 3 / 20 / 13 / 3 / 9 / 5 / 4 for a story, listening, reading and cloze). Do **not** assume core stays 51: that lesson has 54 core and 6 flex. What the tests require is: the minutes add to **60**; each required part fills 70-125% of its minutes; optional pages (dashed, the teacher's menu) stay within the lesson's limit. Pre-A1 has its own run of show (`PRE_A1_RUN_OF_SHOW`, reading-first).

**Modelling first (owner rule).** I do -> we do -> you do. The teacher models new language and the Mission task before the student tries; the rule is stated before the practice games; the student restates it at the end (teach-back).

**Speaking is the largest share.** Speaking ladder: Shadow -> Repeat -> Controlled -> Guided -> Free. Student-talk floors (`SPEAKING_TARGETS`): Pre-A1 40%, A1 45%, A2 50%, B1 55%, B2 60%, C1 65%; speaking minutes 12-25 and a minimum number of speaking tasks; B1+ must reach the Free step. Teacher talk at most 40% is a **target, not coded**. At least **80 student responses per hour**.

**Encounters (target, not a proven rule).** Aim for every new item to be met **at least 4 times, in at least 3 modes (hear, read, say, write)** inside the lesson, then returned on the spaced schedule (Remember?, Daily 10). Six encounters is a stretch goal. The project's own research (`docs/academy-learning-science.md`, `docs/academy-effective-lesson-plan.md`) finds **no magic number**, so never present "6 per lesson" as a fact; count encounters in the lesson tests if you want it enforced.

## 3. Cast, look and voice

Vee (mentor), Ava, Theo, Mia only; no invented characters, no mascots, pets, stickers or hearts (Pip is a Playground character and must not appear). Every Academy picture is **bright daytime school**, light, reserved and age-appropriate, about 25% purple, full-bleed scene plates, objects as cut-out stickers (no white boxes). Voices are recorded American voices through `speak()`; never the browser's speech synthesis; if a clip is missing, stay silent. Pictures: Canva (or Gemini through the art workflow), never Higgsfield. Chrome text is translated into en, es, fr, ar, tr, it with `t()`.

## 4. Games and video-game mechanics

The catalogue is `docs/academy-games-catalog.md` (**171** entries) and the mechanics list is `docs/academy-video-game-mechanics.md`. Every Season and lesson carries a games list and a video-game-mechanic list (name the mechanic, what the student does in English, and the signature game).

Mechanics in use: boss fight (Break the Clock), dialogue RPG / visual novel (Rapport, The Dare), detective board and bug hunt (Grammar Detective, Glitch Hunt), crafting and loot (Trophy Forge), match-3 (Triple Match), quiz ladder with lifelines (Hot Seat), word puzzle (Participle Wordle), collectible card draw and talk show (Verb Draw), deduction and bluffing (Codenames Duet, Two Truths and a Lie).

**Comfort:** no public leaderboards or rank-shaming, no timers on speaking, co-op and personal-best only, private before public, no forced on-camera charades.

**Gates (deploy tests):** never the same game kind three times in a row; at least five different game kinds; every lesson has its own scene, main plate, story frame and signature game registered in `src/academy-deck/lessonProfiles.ts`, and `lessonVariety.test.ts` fails a lesson that reuses the previous lesson's main scene; after every vocabulary introduction, a matching game and then a second, different game; a repeated game uses a different design from the lesson before.

## 5. Optional JSON shape for a lesson plan (proposal, not implemented)

Real lessons are decks (`src/academy-deck/lessons/*.ts`). If a plan needs a data form first, use this shape: `unit_meta` (hub, cefr_level, season and episode number, episode type, theme, target talk-time, target structure and chunks), `knowledge_bridge` (prior, current, future), and eight `run_of_show` stages (stage number and name, minutes, activity type, content). **Take the structure and item budget from the Season's `SeasonOutline`, never invent them.** The sample below uses the real A2-S03 "Gadget Wars" structure (comparatives and superlatives); item counts and wording have not been through the validators.

```json
{
  "unit_meta": { "hub": "academy", "cefr_level": "a2", "season": "A2-S03", "episode_number": 3, "episode_type": "pattern-lab",
    "theme": "Gadget Wars: comparing technology", "target_talk_time_pct": 50,
    "target_structure": "comparatives and superlatives (from the Season outline)",
    "target_chunks": ["It's faster than...", "It's much more expensive.", "The best one is...", "Which is better?"] },
  "knowledge_bridge": { "prior_knowledge": "A2-S01/S02 past tense stories; E1-E2 gadget words",
    "current_knowledge": "one structure: comparative adjectives (-er, more ... than) with short, regular adjectives first",
    "future_knowledge": "E4 On Air: persuade a friend which gadget to buy; E6 superlatives in a review" },
  "run_of_show": [
    { "stage_number": 1, "stage_name": "Check-in", "minutes": 5, "activity_type": "intro", "content": { "mission": "Choose the better gadget and say why", "success_criteria": ["Say one comparison with -er or more ... than", "Give one reason"] } },
    { "stage_number": 2, "stage_name": "Remember?", "minutes": 7, "activity_type": "quiz_ladder", "content": { "mistake_bank_items": ["more fast -> faster"], "due_items": ["screen", "battery", "price"] } },
    { "stage_number": 3, "stage_name": "The Drop", "minutes": 10, "activity_type": "story_plates", "content": { "cast": ["Vee", "Theo"], "plates": 3, "modelled_lines": ["Theo: This phone is faster than mine.", "Vee: But mine is cheaper."] } },
    { "stage_number": 4, "stage_name": "Notice & Build", "minutes": 10, "activity_type": "detective_board", "content": { "rule_max_3_lines": ["Short adjective: add -er (fast -> faster).", "Long adjective: more + adjective (more expensive).", "Then use than: faster than my phone."], "games": ["Grammar Detective", "Break the Clock"] } },
    { "stage_number": 5, "stage_name": "Energiser", "minutes": 4, "activity_type": "word_puzzle", "content": { "game": "Wordle", "no_timer": true } },
    { "stage_number": 6, "stage_name": "Mission", "minutes": 12, "activity_type": "roleplay", "content": { "dial": ["Chill", "Normal", "Push"], "take_1": "Compare two gadgets with Theo", "feedback": "one specific fix", "take_2": "Do it again with the fix" } },
    { "stage_number": 7, "stage_name": "Release", "minutes": 7, "activity_type": "portfolio_product", "content": { "product": "three-sentence gadget comparison", "model_hidden": true, "private_first": true } },
    { "stage_number": 8, "stage_name": "Wrap", "minutes": 5, "activity_type": "metacognition", "content": { "can_do_ticks": true, "log_errors_max": 3, "daily_10": "A2-S03 E3 pack", "teach_back": "state the rule in your own words" } }
  ]
}
```

## 6. Before you call an Academy lesson or plan done

Run `academy-quality-gate` (12 checks). Also confirm: approved plan with a traceability table (every activity serves an objective or a student need); research file with sources; games and video-game mechanic named; model step and stated rule before practice; speaking targets met; teacher checklist of 1-5 observable can-dos; `npm run lint`, `node scripts/typecheck-classroom.mjs`, and the Academy tests pass; voice audit clean (`node scripts/bake-academy-voice.mjs --audit`); the library hand-off and preview rules in `CLAUDE.md`.
