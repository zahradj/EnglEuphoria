# Lesson 1 "Sign Me Up" (A1-S01-E2) — evaluation and rewritten lesson plan

Owner request 2026-10-12: the lesson looks too difficult for the audience, the audience is unclear, the structure is off. Rewrite the plan so it is easier to absorb, understand, acquire and interact with, for Pre-A1, A1 and post-A1 students. **Status: proposal, not approved by the owner. Nothing in the player has been changed yet.**

## 1. Evaluation (what is wrong, with numbers)

| Finding | Evidence |
|---|---|
| **Far too much new language.** The blueprint says 14 new items (one…ten, Spain, Spanish, Italy, Italian). The built lesson teaches about 40: 6 classroom words, 4 help phrases, one…ten, counting 1-100, hundreds 200-900 and "four hundred twenty-seven", 4 countries + 4 nationalities, 4 spelling phrases, 26 letter names, plus 5 chat frames. | `src/academy-deck/lessons/signMeUp.ts`: 7 teach pages, 42 slides. |
| **Too long.** About 70 minutes of play on paper, held at 60 only by timing allowances added round after round. | `deck.test.tsx` ALLOWANCE and the 71-minute cap. |
| **Wrong difficulty for a first A1 lesson.** Hundreds and 3-digit numbers are not A1 lesson 1 (the Season can-do is "spell my name and read a short profile"). Counting 1-100 appears in Remember? before it was ever taught. Reading load is high (long prompts, 3-4-line clues). | slides `count-revise`, `numwall`, `teach-hundreds`, `numtrain`, `padlock`. |
| **Structure is off.** Teaching is spread over every part, so no part does its job: the Check-in teaches 6 words; Remember? teaches help phrases and counting; The Drop teaches numbers and nations; Notice & Build teaches hundreds and spelling; the story (model-signup) comes in the middle of word sets instead of giving meaning first. | part tags in the slide list. |
| **One difficulty for everyone.** A pre-A1 student meets the same 3-choice sentences, typing and 3-digit numbers as a post-A1 one; a post-A1 student waits through pictures. There is no way in or out except the comfort "Easier / Same / Harder" lever, and the lesson content does not change with it. | no lane concept in `src/academy-deck`. |
| **Audience unclear.** Written for "ages 11-18, A1" without saying who is really in the seat: a true beginner, a "false beginner" who knows words but not sentences, or a student who can already say sentences. | spec §1-2 never names a start level. |

Research (2026-10-12, limited): the Council of Europe Companion Volume adds a **Pre-A1** level and enriches A1 ([CoE CEFR page](https://www.coe.int/en/web/education/-/common-european-framework-of-reference-for-languages-learning-teaching-assessment-14)); the descriptor text itself could not be retrieved, so the three lanes below are our own design, not CEFR quotes — check against the Companion Volume PDF before using the labels in public. Too many new words at once overloads beginners and chunking helps ([Teaching Vocabulary to English Language Learners](https://wiki.uep.edu.py/Download_PDFS/TzbQ1z/701170/Teaching%20Vocabulary%20To%20English%20Language%20Learners.pdf); a secondary summary of Nation gives about 3-5 new items per lesson for young learners — not verified at source; a small [adaptive chunking study](https://nhsjs.com/?p=32936) found adaptive set sizes beat fixed 10-word blocks on immediate recall only). Tiered tasks from the same material with common objectives and fading scaffolds are standard differentiation ([HLT Magazine](https://www.hltmag.co.uk/dec25/differentiating-instruction-for-young-learners), [Springer 2023](https://link.springer.com/doi/10.1186/s40468-023-00223-7)). No source compared Pre-A1/A1/post-A1 app lanes directly.

## 2. Who the lesson is for (decision)

One lesson, **three lanes** with the same story, same objective, same 14 core items and the same exit task. The student (or teacher) picks a lane at the start and can change it any time; the lesson also offers a change after two misses in a row ("Want an easier one?") or three quick wins ("Want a harder one?").

| Lane | Who | What changes |
|---|---|---|
| **Start** (pre-A1) | knows almost no English; may not read yet in English | pictures + sound first, 2 choices, whole sentences given as tiles to tap, 1-5 before 6-10, numbers one digit at a time, home-language hint on, nothing is typed, 0.8x audio |
| **Core** (A1) | knows some words, not sentences | the 14 items, 3 choices, sentence tiles with one extra tile, spelling with letter tiles, digit codes (4-2-7) |
| **Stretch** (post-A1) | can already say sentences | same items plus: teens and tens (11, 20, 30…100), two more nationalities (Brazil, France), type answers instead of tiles, spell a name from hearing it, "four hundred twenty-seven" as a bonus code, ask Theo two questions |

## 3. Scope after the rewrite

**New items for everyone (the blueprint's 14):** one, two, three, four, five, six, seven, eight, nine, ten, Spain, Spanish, Italy, Italian.
**Frames (reused from lesson 1 or chunks, not new words):** My name is ___. · I am ___. · I am from ___. · I am ___ (nationality). · How do you spell it? A-V-A. · Sorry, can you say it again?
**Moved out of the 60 minutes:**
- Classroom words (Listen, Look, Repeat, Click, Read, Point) and help phrases → a separate **Class Kit** (5-minute one-time onboarding card before the first lesson; it also serves as the lane picker). Not a lesson, not graded.
- Counting 1-100, hundreds, "four hundred twenty-seven" → **Stretch lane only**, and the numbers Side Quest of a later lesson.
- Brazil, France → Stretch lane only.
- 26 letter names → only the letters of the student's name and A-V-A / T-H-E-O are heard; the full alphabet is a later lesson.

## 4. New structure (60 minutes; every part does one job)

| Part | Min | Job (nothing else) | Slides (lane notes) |
|---|---|---|---|
| Check-in | 5 | Feel safe, choose the lane, name badge, see today's goal. **No new language.** | title · goal card with the 5 can-dos as pictures · lane picker (3 picture cards, teacher can set it) · name badge + age |
| Remember? | 7 | Wake up lesson 1 only: hello, my name is, I am 13. | who-said-it chat (Start: tap the speaker; Core: drag bubbles; Stretch: type the missing word) · greet Theo (say it) |
| The Drop | 10 | **Story first, then the first word set.** Meaning before language. | story "Sign me up": Ava and Theo, 8 lines, picture-led, each line heard then read (Start: pictures only, line by line) · understanding check (3 pictures) · **numbers 1-5**: teach (5 pages) + 2 games |
| Notice & Build | 10 | Practise and extend, one small set at a time. | **numbers 6-10**: teach + 2 games · **Spain / Spanish / Italy / Italian**: teach (2 pages with a character holding the flag) + 2 games · spell it (A-V-A, then your name) |
| Energiser | 4 | One calm game, no teaching. | Locker Pop (1-5 / 1-10 / Stretch: 10-100 by tens) |
| Mission | 12 | Use it with Theo. Dial, Take 1, feedback, Take 2. | dial · padlock code (Start: one digit 7 · Core: 4-2-7 digit by digit · Stretch: "four hundred twenty-seven") · Take 1 role-play at the desk (name, spell, where from) · feedback (fade) · Take 2 (Theo is fast: ask again) |
| Release | 7 | Show what you can do, model hidden. | sign-up card (lane changes how much is typed) · exit voice note |
| Wrap | 5 | Tick can-dos, homework, next clue. | 5 ticks · "spell your name to one friend" · clue 2 |

**Two games after every word set** (vocabulary rule, `VOCAB_GAME_MENU`): numbers 1-5 → drag-match + flip-memory; numbers 6-10 → Locker Pop + flip-memory; nations → drag-match + flip-memory. Spelling is practised by the spell game, not a word set.
**Time:** teach 0.4 min per page, games 1-2 min each: Drop about 10, Notice & Build about 10, no allowances needed (target: the whole lesson ≤ 60 on the same estimator).

## 5. What each lane sees in the main activities

| Activity | Start | Core | Stretch |
|---|---|---|---|
| Teach pages | picture + sound, example sentence read aloud, clue hidden | picture + sound + example + clue | + a second example and a "your turn" |
| Drag-match | 3 pictures, scattered, big | 5 pictures | 6-8 pictures + words are heard, not shown (listen mode) |
| Flip-memory | 3 pairs | 4-5 pairs | 6 pairs, say the word after each find |
| Locker Pop | 1-5, 3 rounds | 1-10, 3 rounds | 10-100 by tens, 4 rounds |
| Spell it | tiles for A-V-A, 2 extra letters off | name badge tiles + 2 decoys | no tiles: type what you hear |
| Role-play | Theo asks, student taps the answer tile, then says it | student builds the sentence, then says it | student answers, then asks Theo 2 questions |
| Sign-up card | pick from pictures | build with tiles | type |

## 6. Success criteria and exit task (unchanged in meaning)

Can-dos: I spelled my name. · I said my number (one…ten). · I said my country and nationality (Spain/Spanish or Italy/Italian, or my own with the list). · I said my name and age. · I asked for help: "Sorry, can you say it again?" Exit task: the sign-up card + voice note with the model hidden; Start lane is accepted with tiles + a spoken sentence, Stretch with typed text.

## 7. What to build (if approved)

1. Lane picker slide and a `lane` setting in the deck context (`useDeck().lane`, saved with the student, teacher override). Slides read `lane` for rounds, choices and typing.
2. Rewrite `signMeUp.ts` to the new slide list (about 26 slides, down from 42); move Class Kit to its own small deck; hundreds and 1-100 go to Stretch variants or a later lesson.
3. Update the lesson-1 tests (time estimator without allowances, lane checks, rule test), the spec, the library minutes, voice lines.
4. Keep what works: the scatter board, bearers with flags, flip-memory, Locker Pop, spell game, phone chat.

## 8. Decisions for the owner

1. Approve cutting the lesson to the blueprint's 14 items (classroom words and help phrases to a Class Kit; hundreds and 1-100 to Stretch/later)?
2. Approve three lanes (Start / Core / Stretch) with a picture picker and an automatic offer to change?
3. Labels: show "Pre-A1 / A1 / Post-A1" to the student, or friendlier names (Start / Core / Stretch)? (Suggested: friendly names to students, CEFR labels to teachers.)
4. Should the Class Kit exist as its own short card, or be dropped (teacher explains the buttons)?
