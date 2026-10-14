# Academy Deck — the game-deck lesson player (owner request 2026-10-10)

> Owner: "All of the lessons look like autopilot, repeating. Keep this player aside. Let's create a PPTX-style player with games: full scene plates and interactive games."
> The line-by-line player (`src/academy-player/`) is kept untouched. The deck lives in `src/academy-deck/` (Academy only; it reuses only the Academy's drawn flags/number cards from `academy-player/drawn.tsx`).

## What it is

A lesson is a **deck of slides**. Each slide = a **full-bleed scene plate** (Canva picture, `bg/<id>.webp`) + the cast + **ONE game**. The student plays the language (open the locker, set the padlock, stamp the passport, build the reply) instead of reading a line and repeating it. Authoring is **data, like PowerPoint**: a lesson file is an array of typed slides (`lessons/signMeUp.ts`), no scripting.

| Slide kind | Game | Used for |
|---|---|---|
| `title`, `brief` | cinematic title; mission card (flip 3 face-down stamp cards) | start, goal |
| `badge` | type your name on a name badge | check-in |
| `whosaid` | drag speech bubbles to the speaker | recall of last lesson |
| `lockers` | Locker Pop: read a number word, open that locker | numbers |
| `numtrain` | drag number words onto numbered carriages | numbers |
| `padlock` | escape-room code: the clue is in words, set the dials | numbers → reward |
| `convo` | dialogue wheel: choose what the character says (wrong choice = its own hint) | conversation pattern |
| `spell` | letter tiles onto a name badge (look-alike distractors) | spelling |
| `findwrong` | detective: tap the spelling mistakes in a fake profile | spelling, story clue |
| `border` | border control: drag the traveller onto the right nationality passport | nationality |
| `memory` | flip-and-match (flag ↔ word), no timer, no penalty | nationality |
| `phonechat` | text conversation, build the reply from word tiles | patterns in use |
| `fade` | rehearsal in three rounds with less and less help | say it by heart |
| `card` | fill the sign-up card with a model, press Print | exit prep |
| `say` | say/type it with the model hidden ("Show me" counted) | exit task |
| `wrap` | stamps earned, can-do ticks (yes / almost / not yet), homework, clue card | close |

## Why it is more reliable than the old player

- **No hidden state machine.** The deck stores only: slide number, solved flags, the student's answers (`vars`), stamps, counts of right / wrong / hints / skips. Each game keeps its own local state and tells the deck one thing: `done()`.
- **Every slide sits in an error boundary**: a game that throws shows "This game hit a snag — Try again / Skip", never a frozen lesson (tested).
- **Always a way on:** Back, Hint (two tiers per slide), "I need a minute", "Skip this slide" (counted for the teacher), Calm mode (no animation). No timers, no ranking, wrong = "Not yet — look again" with a specific hint.
- Drag games also work by **tap, tap** and by keyboard/screen reader (a click on a chip selects it, a click on the target places it).
- Live class ready: `Deck` accepts a controlled `slide` + `onSlide` (the teacher moves the class) and `onFinish({vars, stats, stamps})` for the teacher's evidence. Not wired into the classroom yet.

## Rules for every deck lesson (checked by tests in `__tests__/deck.test.tsx`)

1. One objective, 3–5 criteria; every game slide `trains` a criterion; each criterion ≥ 3 slides and the last is production (`say` / `fade`).
2. **No two neighbouring slides use the same game**; ≥ 12 different games per lesson.
3. Cast only Vee / Ava / Theo / Mia, only from the lesson's blueprint cast. Pictures Canva only (plates and cast); flags, number cards and badges are drawn in code. Never browser TTS (a test greps for it). Voices: none yet (silent).
4. Hubs stay separate: nothing from the Playground or Success.

## Status

- `A1-S01-E2 "Sign Me Up"` is the first deck (18 slides, 14 different games). It uses the plates `club-signup-desk`, `locker-hall`, `border-control`, `detective-wall`, `club-stage`, `club-lobby`.
- Not approved by the owner. Not in the lesson registry or the classroom yet. No recorded voices (so no listening games for letters/numbers). Lesson 1 and the old player are unchanged.
- Run it: `src/academy-deck/preview/main.tsx` (artifact); tests: `npx vitest run src/academy-deck`.
