# A1 assessment plan — evaluation lessons, checks and the exam that decides who moves on

**Status: draft for the owner (2026-10-12).** Owner: *"Don't forget the last lesson, which is the evaluation, and assessments
and exams to determine whether the student is ready or not to move forward."* Built on the approved Pre-A1 plan
(`docs/assessment/prea1-assessment-plan.md`) and the same engine (`level-test` scene, `levelTestScoring.ts`,
`playground_assessment_results`, Practise-again packs, parent report, `level_change_requests`), stepped up to A1.

## 1. What changes from Pre-A1 (research)

| Source | Finding | What we do at A1 |
|---|---|---|
| Cambridge A1 Movers test format (cambridgeenglish.org, test format page) | Listening 5 parts / 25 questions; Reading & Writing 6 parts / 35 questions; Speaking 4 parts (find the differences, tell a picture story, odd one out + why, personal questions); each skill reported in 1–5 shields | 5 sections instead of 4: **reading and writing** is added (A1 children read and write short sentences), and speaking adds a **picture story** and **asking a question** |
| Cambridge Young Learners handbook — structures Movers candidates need most: there is/are, be, have (got), can/can't, must/mustn't, present continuous | The grammar a test may check | Every test item names the lesson and the grammar step it comes from (`a1LessonPlans.ts`) |
| CEFR A1 descriptors (Council of Europe, Companion Volume; young-learner descriptors 7–10) | A1 = can ask and answer simple questions, describe people and places in simple sentences, understand slow clear speech | Speaking must include the child **asking** and a **4-sentence description**; listening uses full sentences and short dialogues |
| Mastery learning (Bloom; Slavin review) | ~80 % bar, frequent short checks, corrective work different from the first teaching | Same 80 % per part at every Boss Test; Practise-again packs use new games, not the same lesson again |
| British Council / TeachingEnglish, assessing young learners | Short, game-like, picture-based, low anxiety | Same calm rules as Pre-A1 (one question at a time, 🔊 replays, no clock, no lives, never "failed" for the child) |

## 2. Where the assessments go

```
U1 → U2 → U3 → U4 → U5 ──► A1 HALFWAY CHECK "Explorer Halfway"      (Units 1-5)
 (every unit ends with its Lesson 7 Boss Test = the evaluation lesson)
U6 → U7 → U8 → U9 → U10 ──► A1 FINAL TEST "Rising Star"  ──► A2       (all of A1)
```

| Layer | When | Length | Job | Result |
|---|---|---|---|---|
| Lesson checks (formative) | every lesson | in the lesson | Remember? warm-up, the lesson's evidence page (from its plan), the passport stamp sentence | the teacher sees it; nothing stored |
| **Unit Boss Test** = Lesson 7, the unit's evaluation lesson | end of every unit | ~10 min test inside the 30 min lesson (review games before it) | did this unit stick? | 1–5 stars per part; **Unit mastered** (every part 4+) or **Practise again** (pack for every part under 4, re-checked in the next unit's Remember? warm-ups); Golden Compass piece either way (the child is never stopped) |
| **A1 Halfway Check "Explorer Halfway"** | after Unit 5, its own lesson (U5 · L8) | 20–25 min | is the A1 foundation (be, can, there is/are, like, have got, feelings + because) solid enough for Units 6–10? | **Go on** / **Go on with support** / **Review first** |
| **A1 Final Test "Rising Star"** | after Unit 10, its own lesson (U10 · L8) | 25–30 min | ready for A2? | **Ready for A2** / **Almost ready** / **Not yet** → teacher confirms → level change request (A1 → A2) → admin approves |

## 3. The sections (all A1 tests)

1. **Listening — words and phrases** (find the picture: "Find the octopus that is hiding!").
2. **Listening — sentences and short dialogues** (tick or cross, who said it, listen and colour/draw a line — Movers style).
3. **Reading and writing** (new at A1): read a sentence and choose the picture; yes/no about a picture; choose the right word
   for a gap ("A monkey ___ climb." can / can't); write one missing word from a word bank (no free spelling yet).
4. **Sounds and reading** (the unit's phonics: digraphs, blends, vowel teams — read the word, pick the picture).
5. **Speaking** — rated live by the teacher, 0–3 per prompt:
   0 no answer · 1 words with help · 2 a short sentence alone · 3 full sentences, or a question asked correctly.
   Prompts (Movers-style, from what was taught): describe a picture in 3–4 sentences · a 3-picture story (Halfway/Final) ·
   **ask the teacher a question** ("Can it…?", "Is it…?", "Do you like…?", "What's the matter?") · personal questions.

Unit Boss Tests use 4 sections (words, sentences, reading/sounds together, speaking) and only that unit's language plus one
recycled item from an earlier unit. Halfway and Final use all 5.

**Stars** (same as Pre-A1): 90–100 % = 5, 80–89 % = 4, 65–79 % = 3, 50–64 % = 2, under 50 % = 1. Speaking: average rubric × 5 / 3.

## 4. Decisions

### Unit Boss Test (every Lesson 7)
- **Unit mastered** — every part 4+ stars.
- **Practise again** — any part under 4: go on to the next unit, the Practise-again homework pack for that part (new games),
  and those words come back in the next lessons' Remember? warm-ups; the teacher re-checks them at the next Boss Test.
- Two Boss Tests in a row with the same part under 3 stars → the teacher is prompted to add a review lesson.

### A1 Halfway Check (after Unit 5)
- Listening — words (8), Listening — sentences (8), Reading & writing (8), Sounds (6), Speaking (4 prompts: describe a jungle
  animal in 4 sentences · ask one "Can it…?" question · weather report or how many · describe a monster friend: feeling +
  because, has got, wearing).
- **Go on** — every section 3+ stars and 17+ of 25 in all.
- **Go on with support** — one section at 2 (or 14–16 in all): continue to Unit 6 with that skill's pack for 2 weeks, re-check
  in the Unit 6 Boss Test.
- **Review first** — two or more sections at 2 or less (or under 14): 2 review lessons on the weakest units, then a short
  re-check (missed items, new order, new pictures).

### A1 Final Test (after Unit 10, A1 → A2)
- Listening — words (10), Listening — sentences and dialogues (10), Reading & writing (10), Sounds & reading (6),
  Speaking (5 prompts: picture description · 3-picture story with "was / had" and present continuous · ask two questions ·
  give 3-step instructions · personal questions about my day with times).
- **Ready for A2** — every section 3+ stars, both Listening sections and Speaking 4+, and 20+ of 25 in all.
- **Almost ready** — every section 3+ but under 20 in all, or one section at 2: a 2–3 lesson bridge (weak skill + an A2
  Lesson 1 preview), then the missed part again.
- **Not yet** — two or more sections at 2 or less: stay in A1, review cycle of the weakest units (packs + review lessons),
  re-test in 3–4 weeks.
- The test never moves the child by itself: the teacher confirms, the level change request (A1 → A2, start Unit 1) goes to
  the admin with the section stars, as for Pre-A1.

## 5. The child's experience
- The evaluation lesson is a game day, not an exam room: review games first, then the Boss Test as the world's final
  challenge (Jungle: "the Explorer Trial"), then the Golden Compass piece, the teaser of the next world and the sticker.
- Never a score word or "failed" for the child; the stars, decision and Save button are for the teacher; the parent gets the
  short translated report (6 languages) with what to practise at home.

## 6. What to build
1. `levelTestScoring.ts`: level-aware decisions and texts (A1: "Ready for A2", Halfway "Continue to Unit 6"), 5-section
   thresholds (Halfway 17/14 of 25, Final 20 of 25) — done in code with tests (2026-10-12).
2. The `level-test` scene for A1 lessons (runs as `kind: 'prea1'` inside the A1 player, like every Pre-A1 game) + a
   **reading-and-writing** item type (read and choose / choose the word for the gap).
3. Unit Boss Tests: one per unit, built with that unit's Lesson 7.
4. Halfway Check and Final Test: two new slots (U5 · L8 and U10 · L8) like Pre-A1, built when Units 5 and 10 are done.
5. Practise-again packs for each A1 unit part (homework quests).

## Sources
- Cambridge English, A1 Movers test format: https://www.cambridgeenglish.org/exams-and-tests/movers/test-format/
- Cambridge Young Learners handbook (Movers structures): https://www.institutoivoti.com.br/idiomas/arquivos/Movers_en.pdf
- Council of Europe, CEFR Companion Volume: https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2018/1680787989 ;
  young learners descriptors ages 7–10: https://rm.coe.int/16808b1688
- Mastery learning and the Pre-A1 sources: `docs/assessment/prea1-assessment-plan.md`
