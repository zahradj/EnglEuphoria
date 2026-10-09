---
name: academy-game-ui
description: >
  UX/UI designer for Academy lessons as video games: how every Academy page and activity must look and feel (full-bleed illustrated
  scenes, characters, game mechanics, animation and game feel), grounded in research on educational game design, teen UX and
  multimedia learning, and bounded by the repo's motion, voice and picture rules. Use whenever an Academy lesson, activity or
  player screen is created or restyled, and before calling any Academy screen "done". Pairs with academy-player-ux (layout,
  comfort, tokens) and academy-activity-selector (which mechanic).
---

# Academy game UI — make every lesson feel like a game, not a worksheet

Owner rule (2026-10-09): Academy lessons are one-to-one live lessons for teens that must look and play like video games and story
games: **illustrated, animated, sometimes with motion, full-bleed.** "Dull and dry" is a failure. Research log and sources:
`docs/research/academy-game-ui.md`. Layout, comfort dock and tokens stay in `academy-player-ux`.

## 1. Principles (each tied to evidence; labels: [V] study, [P] practitioner, [T] teardown)

1. **Juice must be tied to success and stay proportionate.** In a 1,699-person CHI 2024 experiment, success-dependent feedback raised
   enjoyment and motivation, while amplifying feedback beyond that *lowered* felt competence [V]. So: a correct answer gets a short,
   clear reward (about 400 ms: sparkle, tick, small sound later); a wrong answer gets calm "Not yet — try again" with a hint, never
   a fanfare, never a penalty animation.
2. **Feedback has two jobs:** say whether it was right, and point to what to do next [P]. Every reaction carries information.
3. **Motivation = autonomy, competence, relatedness** (self-determination theory). Game elements can support or thwart each one
   depending on context [V, 2019]. Design for: *autonomy* = real choices (dial, theme emoji, pick-of-2, order of tasks);
   *competence* = visible progress against the student's own best, Word Cards collected, "Not yet" as information;
   *relatedness* = the cast reacts to the student by name. **No public rankings or leaderboards** (they demotivate the bottom
   of the board [V]; also an Academy rule).
4. **Art must serve the learning (coherence principle).** Interesting but irrelevant detail can reduce transfer [V, strongest-supported
   multimedia principle]. So the scene is the *context of the sentence* (the classroom where Sam's message lands, the phone showing
   the profile), characters show the emotion the line needs, and animation sits on the learning object (a word card flips, a tile snaps
   into the frame, a clue lights up), not on random decoration. Put text next to the thing it describes; highlight the key word.
5. **Teens are goal-oriented, give up fast, expect it to be easy** [P, NN/g]. Short text (A1: ≤ 12 words per line), one action per
   screen, big targets, instant response, obvious next step.
6. **Story and visuals attract reading** in EFL visual-novel studies [V, small samples, no isolation of illustration effect]. Use story
   scenes as the spine of the lesson; do not claim more than that.

## 2. Screen anatomy (every screen)

- **Full-bleed scene** behind everything (real Canva picture at `bg/<id>.webp`, else the drawn scene in `scenes.tsx`). No flat colour.
- **Cast in the foreground**, large (≥ 55% of stage height on phone), speaker lit, others dimmed; expression changes with the line.
- **Glass UI** over the scene (blurred translucent panels), one focal element, bottom-anchored thumb zone.
- **Title card** at the start of each run-of-show part (number, name, one-line goal), skippable, 1.5 s.
- **Reward layer** (stars/sparkles on correct), **progress** (segment bar; collectible Word Cards), **dock** (comfort controls) unchanged.
- No "placeholder:" labels on screen in production; if art is missing the drawn scene must still look finished.

## 3. Activity → game pattern (choose with academy-activity-selector, then dress it)

| Mechanic | Game metaphor | Motion (one-time, ≤ 350 ms) |
|---|---|---|
| word cards (flash) | collect-a-card | card flips on tap, glow when collected |
| sort | swipe-decide | card slides to its side |
| match | connect-the-pairs | line draws between the pair, both pop |
| build (tiles) | puzzle snap | tile flies into the slot |
| profile hotspots | detective scan | magnifier ring on the row, row flashes |
| chat | group-chat story | typing dots, message pops in |
| choice | dialogue wheel | chosen option lifts, others fade |
| dial (Chill/Normal/Push) | difficulty select | slider/badge locks in |
| record (say or type) | voice note | mic ring pulses *only while the student chooses to speak* |
| ticks | self-check | tick draws |
| end card | level complete | stars fill one by one |

## 4. Motion budget and hard limits (repo rules, not negotiable)

- **Allowed:** opacity fades, one-time slide/fade-in of UI and sprites, tile/card flips, sparkle/confetti bursts on success, expression
  swaps, glow, line-draw, calm silent *approved* image-to-video background loops (`bgVideo`, ping-ponged, still as fallback) for games.
- **Forbidden:** zoom, pan, Ken Burns or looping scale on any story picture (it shakes); characters doing new actions in generated video;
  speech or text inside generated video; browser TTS or any non-recorded voice; flashing > 3 times per second; countdown timers by default.
- **Reduced motion** (OS setting or in-player switch) turns every animation into an instant state change.
- Durations 150–350 ms (reward up to 600 ms), ease-out; never block input while animating.
- Pictures: Canva (or Gemini through the bake workflow) only — never Higgsfield for pictures. Videos: Higgsfield only, after the video gate.
- Voice stays `speak()` with approved recorded voices; if a clip is missing, stay silent.

## 5. "Dullness test" before any screen is done (all must be YES)

1. Does the screen have a scene or picture behind it and a character or object the student cares about?
2. Is there a tactile action (tap, drag, snap, flip), not just "Next"?
3. Does the first tap produce a visible reaction in under 200 ms?
4. Is feedback informative (right / not yet + next step) and proportionate?
5. Is there at most one block of text, and are key words highlighted?
6. Does motion serve the learning object and respect reduced motion?
7. Screenshots at 390 px and 1280 px look finished, not like a form.
8. Is it still comfortable: targets ≥ 44 px, readable contrast, hint and "I need a minute" available?

## 6. Process

1. Pick the mechanic (academy-activity-selector), then name its game metaphor from §3.
2. Build it in `src/academy-player/` with the scene/art slots filled (drawn scene first, real pictures queued in the art ledger).
3. Play it in a real browser, screenshot at 390 and 1280, run §5.
4. Log the research (sources, quality, limits) in the lesson's research file; run `academy-quality-gate`.
