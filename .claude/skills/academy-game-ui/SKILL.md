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

## 7. Alive characters and game-screen anatomy (added 2026-10-10 after owner: "not a well designed animated video game")

A game screen is **layers, each with its own motion, driven by one state**, not a picture with a card on it.

1. **Character state machine** (`Character` in `src/academy-deck/Stage.tsx`): states `idle | speaking | happy | concerned`. Idle = body breathe + head nod/tilt on a separate beat + blink. Speaking = mouth swap (neutral <-> talk picture) plus a small head bob, only while a line plays. Happy = jump, glad face. Concerned = flinch, worried face (falls back to neutral, never to happy). One component owns all of it; slides only send the state.
2. **Spotlight and ground**: every character stands on a soft contact shadow and a coloured rim/spot light so they sit *in* the scene.
3. **HUD corners**: top-left task banner, top-right counters (stars/found), bottom controls; world objects stay tappable and glow like pickups.
4. **Buttons**: chunky, bevelled, glossy, with squash on press and a stretch-pop on success (anticipation, overshoot, settle).
5. **Reward stack on success only**: +1 pop, sparkles, character cheer, edge glow. Wrong = flinch + soft hint, no fanfare.
6. **Scene lights**: moving god-rays, drifting bokeh, window shimmer on top of the still (never zoom or pan the still itself).
7. **Entrances**: panels spring in, options stagger, characters walk in from their side; a slide change is a small transition, not a cut.
8. **Honest limit**: flat expression pictures cannot do real lip-sync or arm movement. Real animated characters need either layered art (Canva `separate-image-layers`, a Rive/Spine rig) or approved Higgsfield loops through the video gate. Ask the owner before ordering either.

## "Night" theme for B1 and up (owner 2026-10-15)

The default Academy look (pastel lavender, white panels, purple ribbon titles) reads young and unfinished at B1. A lesson sets `theme: 'night'` on its `DeckScript` for: deep indigo and teal, one gold accent, dark glass panels, plain headings (no ribbons), clean glass answer tiles (no gold ovals), the teacher's lesson clock as a slim pill in the bottom bar (never a card over the lesson). While a plate is missing, the fallback is a deep-night gradient, never pastel. CSS: `.ad-root[data-theme='night']` in `src/academy-deck/deck.css`. Check every slide kind of the lesson in the real player (screenshots) before reporting it done; new slide kinds must be styled for the night theme too.

## The "scene" player theme — the default look (owner 2026-10-15: "it looks very bad; study the Playground player; use something similar")

Studied the Playground player (read only, hub separation): the **painted scene fills the whole screen and carries the look**; the task is **one white instruction pill**; the game sits on **frosted glass** or straight on the scene; the chrome is a few **floating pills** (back, counter, next, a small HUD, level chips); a big outlined title on the start screen; big, bright, rounded pieces. Academy re-implementation in `src/academy-deck/scene.css` (theme `scene`, default; `night` stays available).
- **Scene first**: every page is a full-bleed plate (`public/academy-art/bg/<id>.webp`); a soft violet shade top and bottom keeps pills readable; while a plate is missing, a dusk gradient stands in. A lesson with no real plates looks unfinished: make them (Canva) before calling it done.
- **Chrome (all floating pills)**: top-left Academy mark + level/season/episode and the numbered part; top-centre level and XP; top-right Hint / I need a minute / More; the teacher's clock under the mark; bottom-left Back; bottom-centre counter and page dots; bottom-right Say it (teal) and Next (violet gradient, glows when ready).
- **The task**: the instruction is a white pill (violet text, 20-22 px), the activity below it on frosted glass (`bare` panels sit directly on the scene); one tile style for every choice (white, rounded, a solid "button" shadow, lifts on hover, presses down, gold ring when held).
- **Lobby (first page)**: big white title with a violet outline, the crew, "Start the mission", and two glass cards (your mission, the quest).
- Add new slide styles under `.ad-root[data-theme='scene']` with the tokens (`--violet`, `--teal`, `--gold`, `--ink`, `--glass`, `--pill`); no new hard-coded colours.

### The hub is presented in the player (owner 2026-10-15: "the player does not present the Academy hub; it is boring")
- **Top bar**: Academy mark + wordmark with the lesson's level, season and episode (`B1 · S1 · E1`), the numbered part you are in, a Level / rank + XP bar (`src/academy-deck/hub.ts`: Newcomer → Master; 10 XP per right answer, 15 per line said aloud), and the segmented progress bar along the bar's bottom edge.
- **Lobby**: the first page of every lesson (`slides/lobby.tsx`, set `hub: false` on a script to keep the plain title): hub, season and episode, the lesson title, the crew with portraits (Vee = host), "Your mission" (the "I can" goals) and the quest path (the 8 parts). Like a game's start screen.
- **Part cleared**: each part card shows "Part N cleared" with 1–3 honest stars from first-try accuracy so far.
- **Life**: pages rise in, tiles pop in one after another, a right answer glows, characters carry a name tag (teal while speaking), pressing a tile feels pressed. All stops under reduced motion / calm mode.

- **Light, daytime, school (owner 2026-10-15: "regenerate the backgrounds light, not dark; at school, during the day; age-appropriate and reserved")**: every Academy plate is a bright daytime school place (classroom, hallway with lockers, club room, library), sunny windows, light wood, white walls, about 25 % soft purple; **never night, dusk, neon or dark scenes** (they were rejected). Characters wear modest school clothes and do calm things (stand, sit at a desk, hold a card). Prompt line: "bright, light, airy, broad daylight, school, age-appropriate, reserved". Old dark plates (`vault-corridor`, `bus-stop-night`, `fair-night`, `bus-stop-dawn`, `lockscreen-closeup`, `phone-screen-glow`, `name-wall`, `story-fair-*`, `story-pa1s02-*`) are replaced one at a time with the owner's approval; the player's veil is white, not dark.


## Game feel standard 2026-10-17 (research-backed; ADDITIVE, nothing above is relaxed)

Owner rule in `CLAUDE.md`: every lesson researches compatible games, and every game is **illustrated and animated top-notch** (see "Create lessons with all the skills… search deep for games" and "Academy pictures are light, daytime, school, reserved"). Research log: `docs/research/game-dev-skills-research-2026-10-17.md`. The numbers, easing tokens, CSS `linear()` springs, juice checklist, juice budget, wrong-answer rules, accessibility and anti-pattern lists are in `.claude/skills/game-animation/SKILL.md` sections 10-16 (shared craft); this section binds them to the Academy. Evidence tags: **[S]** search snippet (page not opened), **[R]** repo rule, **[J]** judgement.

1. **Shared effects object.** Every Academy game scene receives an `fx` object (in the academy-player-v2 code, never imported from the Playground) with at least: `fx.burst(x, y, kind)` (sparkle / ring / confetti, <= 14 particles), `fx.float(x, y, label)` (a "+1" or a Word Card flying up), `fx.shake(target)` (the **piece** wobbles +-6 px; never the camera), `fx.sound(id)` (recorded cues only), `fx.reaction(state)` (maps to the `Character` states idle | speaking | happy | concerned). Games call `fx` on events; they never create particles themselves. One place to tune timing, to cap bursts (<= 3 alive) and to test.
2. **Calm mode disables motion at the source, keeps the art.** When the OS reduced-motion setting or the in-player Calm switch is on, `fx` returns no-ops (or a <= 150 ms fade); scenes still show the full painted plate, the state change (check, glow, lock) and the recorded voices. Do not hide pictures or swap to a plain layout in Calm mode. All existing rules stay: opacity fades and one-time UI motion only, no zoom/pan of story pictures, no flashing > 3 per second, no countdown timers by default.
3. **Proportion (kept from section 1 and tightened).** Success-dependent, short feedback: tick + glow within 100 ms, burst 400-600 ms, next task enabled by ~600 ms. Per-lesson celebration is the only long moment (<= 3 s, skippable).
4. **Wrong answers for teens** follow `game-animation` section 13: explain, show the model once, amber (not red) with an icon and text, soft low cue or silence, retry with hint levels, "Show me" free, queue for Remember? after 3 misses. No shame, no buzzer, no red flash, no lost stars, no error counters visible. Tone is a calm coach, never childish.
5. **Decorative motion must be ignorable.** Ambient motion (dust in sunlight, drifting cloud, window shimmer) is low-contrast, slow (>= 4 s), at the edges, and never within 80 px of the language target. Instructive motion (a cue ring on the key word, a card flip that reveals the answer) is allowed [S: seductive-details meta-analysis, interesting-but-irrelevant content lowers learning; effect on animation is weaker but real].
6. **Top-notch illustration checklist** (before any game is "done"): bright daytime school plate calmed behind pieces (`CalmBg`-style blur + light veil); pieces are cut-out stickers with a soft shadow, no white boxes; ~25 % purple in lilac accents mixed with teal, cream wood and green; one expression set per cast member, same face on every plate (art check recorded in `artReview.ts`); hands, faces and held objects zoomed and checked. Pictures: Canva or Gemini through the bake workflow only.
7. **Teen register.** Adult-leaning, reserved, clean: card-based layouts, personalisation (theme, emoji, pick-of-2), concise text, neutral coach voice. No mascots, pets, stickers-as-hearts, baby fonts or "yay!" burst on trivial steps. Teen-specific evidence is thin (agency blogs) [S], so confirm with the owner and the live student.
8. **Anti-patterns** (reject): timers that punish, public leaderboards, loot-box randomness, fake urgency or streak guilt, motion-only or colour-only information, animation that hides the target or delays the next task by more than ~600 ms (full list in `game-animation` section 15).
9. **Extra dullness-test items** (add to section 5): (9) is `fx` the only source of particles/shake/sound in this game? (10) does Calm mode keep the art and the state change? (11) is the language target never covered by an effect? (12) does a wrong answer teach (model shown) instead of only signalling failure?
10. **Reviewing a game screen**: capture frames at the moments of press, hit, burst and settle (Playwright at 390 and 1280) and look at them; run the juice checklist (`game-animation` section 11) and the Academy art check.
