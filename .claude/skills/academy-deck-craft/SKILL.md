---
name: academy-deck-craft
description: How to author an Academy lesson as a GAME DECK (src/academy-deck): a deck of slides, each a full scene plate plus ONE interactive game, data-driven like PowerPoint. Use when creating or editing any Academy deck lesson or adding a new slide game. Pairs with academy-lesson-craft (objective first), academy-activity-selector (which mechanic), academy-game-ui (look and feel) and academy-quality-gate (final check). Owner rule 2026-10-10: lessons must not feel like autopilot "read and repeat".
---

# Academy deck craft — a lesson is a deck of games

Owner (2026-10-10): lessons "look like autopilot, repeating". Make a PPTX-style deck: full scene plates and interactive games. Full description: `docs/academy-deck-player.md`.

## Method (in this order)

1. **academy-lesson-craft first**: one objective, 3–5 criteria, the exit task, the language inventory (blueprint items), the route. Never start from slides.
2. **Frame it as a mission** with a visible reward (stamps, keys, a case file, a clue). The language is the tool the student uses to win (a number word opens a locker; a nationality stamps a passport), not a thing to repeat.
3. **One slide = one scene plate + ONE game + one criterion.** Pick the game by the cognitive job (academy-activity-selector); never the same game on neighbouring slides; aim for 12+ different games.
4. **Play, then say.** A pattern is first *played* (dialogue wheel, phone chat, border control), then rehearsed once with fading help (`fade`), then produced with the model hidden (`say`). Saying aloud is at most 2 slides per lesson, never every line.
5. **Hints are content**: write a `hints` pair per slide and a specific hint for every wrong choice in `convo`.
6. **Plates**: reuse an existing plate or order a new one from Canva (pictures Canva only; never Higgsfield). Keep the lower 40 % and the sides open for the panel and the cast.
7. **Check**: `npx vitest run src/academy-deck`, play it in a real browser at 390 and 1440 px (walker in scratchpad: solve every slide), then `academy-quality-gate`.

## Adding a game

A game is a React component `XView({slide})` using `useDeck()` (`done`, `right`, `wrong`, `award`, `vars`, `seed`), a typed slide in `types.ts`, a case in `SlideView` (Deck.tsx), CSS under `ad-`, and a test in `deck.test.tsx`. Rules: finishes with `done()` exactly when solved; wrong = "Not yet" + a hint (never a penalty, never elimination); no timers except a short animation delay; works by tap/click as well as drag; no zoom/pan of pictures; no browser TTS.

## Don't

Put 15 read-and-repeat lines in a row; reuse a game on the next slide; hide the meaning of a word; ask for language not yet met; make the lesson depend on voices that do not exist yet (say so instead).
