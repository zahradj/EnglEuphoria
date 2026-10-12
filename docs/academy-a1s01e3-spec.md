# A1-S01-E3 "Fake or Real?" (Pattern Lab) — lesson spec

Built with `academy-lesson-craft` (objective first), `academy-deck-craft`, `academy-session-builder`, `academy-activity-selector`, `academy-game-ui`.
Script: `src/academy-deck/lessons/patternLab.ts`. New games: `src/academy-deck/slides/pattern.tsx`. Tests: `src/academy-deck/__tests__/patternLab.test.tsx`. Research: `docs/research/academy-a1s01e3-research.md`.
Status: built and tested, **not approved by the owner**. Voices are baked by `.github/workflows/academy-voice.yml` after the push (interim voices).

## 1. Blueprint facts kept (A1-S01-E3, Pattern Lab; `buildLessonBlueprint`)
60 minutes: Check-in 5 · Remember? 7 · The Drop 10 · Notice & Build 10 · Energiser 4 · Mission 12 · Release 7 · Wrap 5. Cast Vee, Ava, Theo.
Stack "L3 = L1 + L2 + new": 10 new chunks, structure **be (am / is / are): statements, questions, negatives**. Mission = guided question-and-answer / sentence-building duel; Release = write 3-5 sentences with the pattern; clue 3 of 8 ("building a correct sentence with the pattern").
Remember? recalls lessons 1-2 (name, age, country, nationality, spelling).

## 2. Objective (academy-lesson-craft)
**By the end I can use am, is and are to say who I and other people are, say what is not true, and ask and answer a yes / no question, to check a profile.**
CEFR A1: uses simple statements and yes / no questions about personal details (name, age, nationality). Practical: online profiles, forms, "Is this you?" checks, a pen-friend.

## 3. Success criteria (the Wrap tick-list)
1. I said who I am: I am 14. I am from Brazil.
2. I said who someone else is: She is Italian. He is from Spain.
3. I said what is not true: I am not Spanish. She is not 15.
4. I asked a yes / no question: Are you 14? Is she Italian?
5. I answered a yes / no question: Yes, I am. No, he is not.

## 4. Exit task (Release, model hidden, typed)
Five rows, each checked against accepted shapes (contractions "I'm", "isn't" accepted): a sentence about me; about a friend (she / he); one thing that is NOT true about me; one NOT true about the friend; a question with its short answer ("Is she Italian? Yes, she is."). The model returns only on "Show me" (counted in `exitPeeked`). Not-yet gets the row hint, never a score.
Reach test: every form (I am, you are, she / he is, am not, is not, Are you…?, Is she / he…?, short answers) is practised on ≥ 3 earlier slides (tested).

## 5. Language inventory
- 10 chunks (blueprint): I am 14. · You are Italian. · She is from Italy. · He is Spanish. · I am not Spanish. · She is not 15. · Are you 14? · Yes, I am. · Is he Spanish? · No, he is not.
- Recycled (lessons 1-2): names, ages, Spain / Italy / Brazil / France / Japan / USA and their nationalities, spelling your name.
- Glossed, not taught: profile, fake, real, true, detective.

## 6. Route and alignment
| Part (min) | Slides (game) | Trains |
|---|---|---|
| Check-in (5) | title · brief · badge · check-in chat (convo) | 1 |
| Remember? (7) | who said it · border control · spell your name | 1 |
| The Drop (10) | teach am / is / are · **model: Ava and Theo check the fake profile (10 lines)** · who said it · teach not + questions + short answers | 1-5 |
| Notice & Build (10) | **be pick** · **sentence build** · find the wrong lines · answer Theo (convo) · **fact-check the card** | 1-5 |
| Energiser (4) | memory: flag ↔ sentence | 1, 2 |
| Mission (12) | dial · Ava texts you (phone chat) · **sentence duel (build)** · Take 1 · feedback fade · Take 2 | 1-5 |
| Release (7) | **write the profile check (5 rows, model hidden)** | 1-5 |
| Wrap (5) | 5 can-do ticks · homework · clue 3 | 1-5 |

Tests (all in `patternLab.test.tsx`): blueprint read, 8 parts in order, no neighbouring same game, ≥ 12 games (20), each criterion ≥ 3 slides and the last is production, minutes per part 60-115 %, form coverage ≥ 3 practice slides each, 95 % known words, cold exit (typed samples pass with the model hidden), write shapes, play-throughs of the four new games.

## 7. New mechanics (rule: add or upgrade ≥ 1) and variety vs lessons 1-2
- **Be pick** (am / is / are for a person, in statements, negatives and questions): targets the commonest A1 error, wrong form for the subject ("He are").
- **Sentence build** (word-bank tiles, wrong forms as distractors): sentence building like Duolingo, with grammar-specific distractors and a cue that is a fact, not a translation.
- **Fact-check** (is each sentence true on a profile card? if not, which sentence fixes it?): the lesson's story and the negatives: "not" is needed to tell the truth.
- **Write** (typed sentences, pattern-checked): the exit task.
Different from lessons 1-2: story (detective fact-check, case file #3), scene (detective wall), mechanics (grammar games, writing).

## 8. Known gaps (not hidden)
- Interim voices (not the teen voices the owner will design); spoken checks of "am / is / are" are listening-only until then.
- Writing is checked by shape (regular expressions), not by understanding: a creative correct sentence outside the shapes gets a hint (the teacher decides). It cannot check facts about the student.
- No homework quest yet for this lesson (Daily 10 is planned in `academy-daily-practice`).
- No new Canva pictures: existing plates (detective wall, phone profile, lobby, stage, border, classroom) and drawn flags / travellers are reused; the "fake profile" has no dedicated picture yet.
- Owner approval and the Academy hand-off rule are pending. Live two-device sync is not wired.


## Refactor 2026-10-12 (owner: lesson 2, level A1 first)

- **Cast canon now matches lesson 1:** Ava is 13 and Spanish; Theo is 15 and Italian; Vee holds France. The fake profile copies Theo's facts ("She is 15. She is Italian."); the clue asks "Who is 15 and Italian? Theo!". Only the blueprint cast appears (Vee, Ava, Theo), also in the pictures.
- **Vocabulary rule:** after each word set two different games. am / is / are: `bepick` + `memory-be` (character and sentence pairs). not, questions, short answers: `build-1` + `findwrong`. Further practice: `whosaid-check`, `bepick-2` (not and questions), `answers`, `factcheck`.
- **Order:** The Drop = teach-be, bepick, memory-be, model-fake, teach-not; Notice & Build = build-1, findwrong, whosaid-check, bepick-2, answers, factcheck.
- Border control now uses cast characters with flags (no flat travellers); the Brazil round was dropped because Mia is not in this lesson's cast.
- Matching boards use the scattered-picture layout (lesson 1 round 4).
