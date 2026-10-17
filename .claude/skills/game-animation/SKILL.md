---
name: game-animation
description: >
  REQUIRED when building or restyling ANY interactive game/activity in any hub (Playground scenes, Academy/Success arcade
  games) — how to make it feel like a well-animated video game, not flat cards ("game feel" / "juice"). Concrete timings,
  easing, squash & stretch, anticipation, hit-stop, particles, living worlds, character life, reward moments, kid-safe
  feedback, performance and accessibility, mapped to this repo's kit (unit1/scene-components/gameFx.tsx, framer-motion).
  Use before writing a game component, when the owner says a game looks "flat", "stiff", "boring", "not animated", and as
  the final juice audit before calling a game done.
---

# Game Animation — make every game feel alive

Owner's words (2026-10-03/04): *"the design of the games is very flat… I need like an animation video game… well animated,
looking good, interactive, attractive, and fun."* A game whose logic is right but which moves like a slideshow FAILS.

## 1. What "game feel" is (the research, in one paragraph)

Game feel ("juice") is the layer of small, exaggerated feedback that turns each input into a satisfying event: easing,
squash & stretch, anticipation, particles, impact pauses, screen motion, sound and reactions. The canonical demo is Martin
Jonasson & Petri Purho's *Juice it or lose it* (2012): the same Breakout clone becomes delightful only by adding tweening,
squash/stretch, particles, shake, colour and sound. Jan Willem Nijman's *The Art of Screenshake* (Vlambeer) adds impact
pauses ("sleep" ~0.1-0.2 s), permanence (debris stays), camera kick, and bigger-than-life feedback. Disney's 12 principles
supply the motion grammar (squash & stretch, anticipation, arcs, ease-in/out, follow-through, secondary action, timing,
exaggeration, appeal). Duolingo-style apps add **living characters**: idle blinks/breathing, reactions to every answer,
driven by a state machine (Rive). For young children (Sesame Workshop, 50+ studies) feedback must be **immediate,
encouraging and incremental**, motion must serve the task (no distracting extra animation), and targets must be big and
forgiving.

## 2. The ten rules (check every game against all ten)

1. **Nothing appears or disappears instantly.** Everything enters with a spring/ease-out and leaves with an ease-in.
   Entry 250-450 ms (spring stiffness 220-320, damping 14-20), exit 150-300 ms. Stagger groups 60-120 ms per item.
2. **Squash & stretch on every impact.** Landing: scaleY 0.78 → 1.15 → 0.9 → 1 with scaleX mirrored (volume preserved),
   ~0.2-0.75 s total, pivot at the feet (`transformOrigin: 50% 100%`). Tap on a button/piece: 0.9 on press, spring back to 1.05 → 1.
3. **Anticipation before big actions.** A crouch (scaleY 0.8) before a hop, a dip before a button springs, a wind-up before
   a throw — 80-150 ms. It tells the child "something is about to happen".
4. **Move in arcs, not straight lines.** Jumps follow a parabola (left/top keyframes with a peak), thrown items curve,
   collected items fly up-and-over to the counter.
5. **Ease, never linear** (except constant loops like water/conveyor). Ease-out for arrivals, ease-in for exits,
   ease-in-out inside the frame. Springs (`type: 'spring'`) for anything the child moved.
6. **Impact moments get a beat.** On a correct answer: a 60-90 ms hit-stop (freeze/hold), then the burst (12-20 particles,
   600-1100 ms, with gravity), a ring shockwave (scale 0.2 → 2.6, fade), a rising "+⭐" label, and the success sound.
   Cap hit-stop at ~120 ms (beyond that it reads as lag).
7. **The world is alive while nobody touches it.** Living background loop (water flows, flowers sway, character blinks), idle
   float on pieces (y ±6-8 px, rotate ±2°, 2-3 s, staggered), characters breathe (scaleY 1 → 1.035, 2.4 s) and blink.
   Secondary action: butterflies, bubbles, sparkles, clouds drifting.
8. **Characters react to the child.** Every answer gets a character reaction: happy hop / cheer on right, a gentle "hmm"
   head-tilt on wrong, a celebration at the end. The character faces the direction it moves (scaleX ±1).
9. **Wrong is gentle, never punishing** (young learners disengage from negative signals). A soft wobble of the piece or a
   small screen nudge (≤ 10 px, ~450 ms), a "boop" sound, the piece springs back — then encourage. No red flashes, no loud buzzers,
   no losing progress, no explosions on a wrong answer.
10. **Reward is a moment, not a line of text.** End of a game = confetti + character celebration + stars counting up one by one
    (each with a pop + sound, 150-250 ms apart) + a bouncing "Next" button that arrives last (delay 0.6-1.2 s).

## 3. Kid-specific constraints (Pre-A1, ages 4-9)

- Targets ≥ 80 px (Playground), generous hit areas (accept slightly-outside taps), ≥ 24 px between targets.
- Tap first; drag only with a tap-tap alternative; no pinch, no flick, no long-press.
- One focus at a time: the thing to act on is the most animated/bright thing on screen; everything else is calmer.
  Animation must point at the task (Sesame: avoid animated hotspots that distract from learning).
- Spoken prompt + visible pulse on the next action (ring ping 1.2-1.8 s loop, a bobbing 👆 hint on the first round).
- Feedback within 100 ms of the tap (sound + motion), the spoken line follows.
- No flashing > 3 Hz, no strobe, no full-screen shake. Respect `prefers-reduced-motion` (drop shake/bursts, keep fades).
- Never zoom or pan still pictures (owner: it "shakes"). Real movement = real animation (Higgsfield loops/clips) or UI springs.

## 4. Living worlds (backgrounds)

- Every game scene gets `bgVideo`: a 5 s Higgsfield image-to-video clip of the game picture (calm ambient motion, camera
  locked, nothing new appears, characters stay put), ping-ponged into a seamless ~1 MB loop by
  `scripts/make-game-loops.py`; `LivingBg` plays it muted/looped over the still poster (fallback = still).
  Rules in CLAUDE.md / video-quality-gate: silent, calm, art the owner has seen, one clip first.
- Game pieces are **painted art** (made with **Canva** — never Higgsfield for pictures; sticker cut-outs), never plain CSS boxes: stones, chests, gems,
  rivers, shelves. CSS only for UI chrome (pills, buttons, rings).
- Depth: ground shadows under everything that floats or jumps (blurred ellipse, scaleX pulse), drop-shadows on stickers,
  slight parallax (foreground pieces move more than background).

## 5. The kit (use it; extend it; don't re-invent per game)

`src/content/playground-library/unit1/scene-components/gameFx.tsx` (framer-motion):

| Piece | Use for |
|---|---|
| `LivingBg({img, video})` | the looping living world behind the game |
| `useBursts()` + `<Bursts/>` | `fire(x%, y%, 'stars' \| 'splash' \| 'sparkle' \| 'confetti')` on every success / landing / collect |
| `Hopper` | a character that breathes, hops in an arc with squash & stretch, faces its direction; `walking` mode bobs |
| `useShake()` | gentle wrong-answer nudge (auto-off with reduced motion) |
| `FloatText` | rising "+⭐ purple circle" labels |
| `idleFloat(i)` | staggered idle float for pieces and answer cards |

Patterns already in use (copy them): Stepping Stones (bobbing stones + ripples, hop + splash), Draw Path (rainbow trail +
sparkles, walk along the line, gem flies up when collected), Shadow Match (lift-and-tilt drag following velocity, snap pop
+ burst), Image Reveal (3D tile flips, spinning rays on success).

Recipes:
```tsx
// Spring entrance, staggered
<motion.div initial={{ scale: 0, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 260, damping: 15, delay: i * 0.08 }} />
// Press feel on any tappable piece
<motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }} />
// Landing squash (pivot at feet)
controls.start({ scaleY: [1, 0.78, 1.18, 0.86, 1], scaleX: [1, 1.18, 0.88, 1.12, 1], transition: { duration: 0.6 } })
// Arc jump
animate={{ left: [`${x0}%`, `${(x0 + x1) / 2}%`, `${x1}%`], top: [`${y0}%`, `${Math.min(y0, y1) - 15}%`, `${y1}%`] }}
transition={{ duration: 0.7, times: [0, 0.5, 1], ease: ['easeOut', 'easeIn'] }}
// Collect: fly up and vanish (inside <AnimatePresence>)
exit={{ scale: [1, 1.6, 0], y: -120, opacity: [1, 1, 0], transition: { duration: 0.8 } }}
```
Gotchas learned here: an element with `initial` but no `animate` stays at its initial value (Draw Path gems were invisible);
keep hop state in a `useState` with a timeout so a re-render mid-jump doesn't cut it; Playwright needs `force: true` on
pieces that never stop bobbing.

## 5b. The aesthetic pass (owner 2026-10-14: a hard rule for every activity)

Before a game is done, design all five, then check the screenshot at 1280×720 and 390×844:
1. **Colour combinations** — take 3-4 colours from the lesson picture (one accent for "tap me", one for "right"
   = emerald, soft tints for cards); never default white-on-white or random primaries; keep text ≥ 4.5:1 contrast.
2. **Look** — pieces are painted art or stickers with depth: a 3D lip (`0 0.9vh 0 <darker>`), soft drop shadow,
   rounded shapes, a slight tilt for playfulness; no flat white boxes standing in for objects.
3. **Layout** — one focus; pieces never cover the picture's key part; even spacing; instructions on a readable pill.
4. **Icons** — one family, meaningful, ≥ 40 px; speakers, ticks and stars look the same in every game.
5. **Legibility over busy pictures** — if pieces float over a detailed scene, render the picture with
   `CalmBg` (`strong` for small or spread pieces) and give small pieces a light chip/bubble backing. Never leave
   a dark item on a dark area or a busy item on a busy area (Train Recall carrots on carrot crates: fixed this way).
6. **Repeated activity = new designs**, each through this same pass (Listen and Match: cards/balloons/doors/lily pads;
   Read and Match: cards/frames/polaroids/chalk).

## 6. Characters (next level)

- Now: sticker sprites + `Hopper` (breathe, hop, face direction) + emotion sprites (`getEmotionSprite`) swapped on reactions.
- Next (Duolingo approach): a **Rive** character per cast member with a state machine — states idle (blink every 2-6 s,
  random), talk (mouth shapes synced to the recorded clip), happy, think, cheer, sad-but-encouraging; inputs fired from game
  events (`@rive-app/react-canvas`: `useRive` + `useStateMachineInput(rive, 'SM', 'correct').fire()`). Rive files are tiny and
  run at 60-120 fps; Lottie is for fixed "play once" loops only. Adopt per character when the art is ready; keep the
  sticker fallback.
- Heavy particle / many-sprite games (catch, fishing, arcade) may move to **PixiJS** canvas; UI games stay in framer-motion.

## 7. Sound pairs with motion

Every visible event has a sound (`sfx.pop` tap, `sfx.match` correct, `sfx.gem` reward, soft `sfx.wrong`), triggered on the
same frame as the motion, short (< 400 ms), never harsh. Speech always via the recorded voices (`speak`/`cueSpeak`) — never
browser TTS. Motion still works with sound off.

## 8. Performance

Animate only `transform` and `opacity` (framer-motion `x/y/scale/rotate`); never animate width/height/top-left in tight
loops except short keyframed hops. Keep particle counts ≤ 20 per burst and ≤ 3 bursts alive. One looping video per scene,
≤ 1.5 MB, `playsInline muted`. Test at 1280×720 and 390×844; 60 fps on a mid laptop.

## 9. Juice audit (run before calling a game done — all must be YES)

1. Does every piece enter and leave with motion (no pops in/out)?
2. Is the world alive with no input (loop bg or idle motion + secondary action)?
3. Does every tap respond within 100 ms with motion + sound?
4. Does a right answer get impact (hit-stop/burst/ring/label/sound) and a character reaction?
5. Is a wrong answer gentle (wobble + soft sound + encouragement), never punishing?
6. Do jumps/throws move in arcs with squash & stretch and a ground shadow?
7. Is the next action obvious (pulse/hint), and is it the most animated thing?
8. Is the end a celebration (confetti, stars counting up, character cheer, Next button last)?
9. Are pieces painted art (no flat CSS boxes standing in for objects)?
10. Reduced motion respected, no flashing, no zoom/pan on stills, transform/opacity only?

Screenshot proof: capture mid-action frames (drag, hop apex, landing, burst) in Playwright and look at them — a still
"after" screenshot cannot prove the motion.

## Sources

Jonasson & Purho, *Juice it or lose it* (2012) · Nijman, *The Art of Screenshake* (Vlambeer) · Disney's 12 principles applied to
games (gamedeveloper.com) · hit-stop timing guides (35-120 ms) · Duolingo × Rive character state machines · Sesame Workshop,
*Best Practices: Designing Touch Tablet Experiences for Preschoolers* · TIDRC framework (IDC 2019) · Rive vs Lottie (2026).


---

# Additions 2026-10-17 (fresh research; log: `docs/research/game-dev-skills-research-2026-10-17.md`)

Evidence tags: **[S]** = seen in a web-search snippet, source page not opened (treat as a starting point); **[R]** = repo/owner rule (binding); **[J]** = engineering judgement or computed value, tune by playtest. Nothing below is tagged "verified": WebFetch was unavailable, so no page was read in full.

## 10. Timing and easing cheat sheet (learning-game defaults; teen Academy and kid Playground)

Define once as CSS tokens and reuse (`:root { --ease-out: cubic-bezier(0.2, 0, 0, 1); --ease-std: cubic-bezier(0.4, 0, 0.2, 1); --ease-back: cubic-bezier(0.34, 1.56, 0.64, 1); }`). `--ease-std` is the Material standard curve [S]; the other two are [J].

| Moment | Onset | Duration | Easing / recipe | Notes |
|---|---|---|---|---|
| Press / pick-up | 0 ms (same frame) | 80-120 ms | `--ease-out`; scale 1 -> 0.94 (press) or 1.06 (lift) + shadow grows | direct manipulation must feel instant: under 100 ms is the "I did it" threshold [S, Nielsen/Swink] |
| Drag follow | 0 ms | none | no easing, element follows the pointer 1:1 | add tilt from velocity (max 6 deg) only on the inner sprite |
| Drop / snap into slot | <= 100 ms | 160-220 ms | `--ease-back` or spring `linear()` below; tiny dust/ring burst | slot highlights on hover so the target is known before release |
| Pop-in (card, option, panel) | stagger 50-90 ms | 220-320 ms | scale 0.85 -> 1, opacity 0 -> 1, `--ease-back` | exits ~75% of the enter time, `--ease-std` [S] |
| Correct answer | tick + glow <= 100 ms | burst 400-600 ms, label rises 500 ms | scale 1 -> 1.08 -> 1; 10-14 particles; recorded "good" voice or soft chime | next task must be enabled by ~600 ms (see budget, section 12) |
| Wrong answer (gentle) | <= 100 ms | 250-350 ms | wobble +-6 px / +-2 deg, `ease-in-out`, piece springs back; hint line fades in at ~300 ms | no red, no buzzer, no screen shake (section 13) |
| Combo / streak step | with the correct burst | 160 ms | counter pops 1 -> 1.15 -> 1; at most once per answer | never chain a second full burst |
| Reward count-up (stars, XP) | after burst | 120-200 ms per item, total <= 1200 ms | each item: pop + tick sound, pitch up a semitone | always skippable; the Next button arrives last |
| Screen / part transition | on Next | 250-400 ms | cross-fade (+ 12 px slide for UI only); stills only cross-fade [R] | never zoom/pan a story picture [R] |
| Hit-stop (celebration only) | on correct | 60-90 ms, cap 120 ms | hold the burst's first frame; do not block input | research on 3D action games found 100-200 ms best for strong hits, tutorials say 50-100 ms; learning games stay at the low end [S, J] |

**Spring easing in pure CSS (`linear()`)**: supported in Chrome/Edge 113, Firefox 112, Safari 17.2 [S]; give a `cubic-bezier` fallback first (`transition: transform 280ms var(--ease-back); transition-timing-function: linear(...)` in an `@supports` block or simply declare the fallback line before the `linear()` line, unknown values are dropped). Computed damped springs (settle in one duration, tune 380-520 ms) [J]:

```css
/* soft pop: overshoots ~12%, for pop-in and snap */
--spring-soft:   linear(0, 0.268, 0.708, 1.011, 1.122, 1.108, 1.053, 1.007, 0.987, 0.985, 0.991, 0.998, 1.001, 1.002, 1.001, 1.001, 1);
/* snappy: overshoots ~20%, for correct-answer pop and button release */
--spring-snappy: linear(0, 0.492, 1.07, 1.2, 1.077, 0.974, 0.962, 0.989, 1.007, 1.007, 1.001, 0.998, 0.999, 1, 1, 1, 1);
.tile--in { animation: pop 420ms var(--spring-soft) both; }
@keyframes pop { from { transform: scale(0.8); opacity: 0 } to { transform: scale(1); opacity: 1 } }
```
Overshoot above 1 is fine for `transform`; never apply a spring to `opacity` (values above 1 are clamped, it only looks late). In framer-motion keep `type: 'spring'` (stiffness 220-320, damping 14-20, section 2) and use `linear()` only for plain CSS/DOM games with no motion library.

**Anticipation and follow-through** (Disney principles; no official UI spec found, so numbers are [J]): wind-up 80-120 ms in the opposite direction (scale 0.92, y +2 px) before a big action; follow-through = a second, smaller overshoot 60-100 ms after the main settle (the 2nd lobe of the spring above). Use on the single focal object only.

## 11. Juice checklist per interaction (run top to bottom; stop adding when it reads)

For every tap, drag or answer, write one line per row in the game's PR or lesson note:

1. **Input**: hit area >= 44 px (section 14), accepts near-misses, works with tap and with tap-tap, keyboard (Enter/Space) too.
2. **Feedback <= 100 ms**: motion and/or sound start in the same frame as the input [S, R].
3. **Sound**: one short layered cue (<= 400 ms). Keep 3-5 variants of any sound that repeats and randomise pitch +-5 % (0.95-1.05) so it does not fatigue [S]. UI cues quiet and tonal. Speech only through `speak()` with the approved recorded voices [R]; silence if a clip is missing.
4. **Particles**: <= 14 per burst, <= 3 bursts alive, 400-600 ms, from the object (not the screen centre).
5. **Character reaction**: expression swap or small hop (one state change, not a new animation set).
6. **State change**: the object visibly becomes "done" (lock, glow, check) so the result is readable after the motion ends, motion-free.
7. **Reward**: proportionate to the event. Per answer: tick + small glow. Per set: stars. Per lesson: the full celebration. Amplifying beyond success-dependent feedback lowered felt competence in a 1,699-person study (see academy-game-ui section 1) [S].

## 12. Juice budget for LEARNING games (what keeps animation from costing learning)

- The **language target** (word, sentence, picture) is never covered, blurred, spun or hidden by a burst, shake or transition. Particles originate beside it, not over it.
- **No decorative motion may delay the next task by more than ~600 ms** from the moment the answer is judged [J]; every celebration is cancellable by the next tap.
- **Decorative vs instructive**: motion that points at the learning object (cue, highlight, flip that reveals the answer) is instructive; ambient motion (drifting dust, swaying plants, bokeh) is decorative and must be **ignorable**: low contrast, slow (>= 4 s loops), at the edges, never within 80 px of the target, never the most animated thing on screen [S: seductive-details meta-analysis, 58 studies, 7,500+ learners, interesting-but-irrelevant material lowered scores, and decorative-but-relevant animation lowered recall vs a still; effect weaker and less consistent for animation specifically].
- **One focus**: at any moment exactly one element is the brightest/most animated (the next action). A burst may briefly take focus, then returns it.
- **Cue, do not narrate**: ring-ping or glow on the relevant part helps; extra moving parts do not [S, cueing reduces extraneous load].
- **Budget numbers [J]**: <= 1 looping decorative animation per 400x400 px region, <= 3 simultaneous moving things besides the focus, <= 2 sounds layered per event, celebration <= 1.2 s per answer set, <= 3 s per lesson end (skippable).
- When in doubt delete the effect and keep the state change; playtest "does the child still read the word?"

## 13. Wrong-answer feedback, especially for teens (13-18)

Rules: **explain, never shame**; **no red buzzer, no cartoon fail sound, no lost points**; always a retry path. Evidence: research on immediate vs delayed corrective feedback in second-language learning shows no clear winner, so give the information instantly and let the student choose when to retry [S, 2023 systematic review]; a mismatch with the learner's level raises anxiety [S].

1. Say what is wrong in plain words and show the right model once: "Not yet - we say *she goes*, not *she go*." Highlight only the differing part.
2. Visual (this supersedes the small screen nudge in rule 9 for Academy teens; Playground may keep it): the piece wobbles +-6 px for ~300 ms and returns; border turns warm amber (not red; never colour-only, add an icon and text, section 14); no screen shake.
3. Sound: a single soft low "boop" (<= 250 ms), quiet; or silence. Never a buzzer.
4. Retry: the same item stays, hint level 1 (first letter / audio replay) after the first miss, level 2 (show model) after the second; "Show me" is always available and costs no stars.
5. After 3 misses on one item, quietly queue it for the spaced Remember? and move on ("We will come back to this"); never trap the student.
6. Teens: no childish praise or pity ("Oops, silly!"); neutral coach tone ("Almost. Try the verb again."). No public display of errors, no counters of mistakes on screen.
7. Count the miss for the teacher's error log, not for the student's score.

## 14. Performance and accessibility (web / DOM / React)

- **Compositor-only**: animate `transform` and `opacity` only; they run off the main thread, other properties can jank on low-end phones [S, web.dev]. Layout moves (reorder, shuffle) use **FLIP** (First-Last-Invert-Play): measure, apply the inverse `transform`, then play to identity [S, Paul Lewis]; in React use `layout` in framer-motion or measure in `useLayoutEffect`.
- **`will-change: transform`** only on elements about to animate, remove it after (layers cost memory; overuse hurts) [S, web.dev]. Never on every card in a list.
- **Frame budget**: 16.7 ms at 60 fps; a frame that exceeds it is skipped [S]. Test on a throttled CPU (4x) and a real mid phone; keep DOM nodes animating at once under ~60.
- **Web Animations API** (`el.animate()`) for imperative effects: returns an `Animation` with `cancel()`, `finish()` and a `finished` promise that rejects on cancel (catch it); after finishing call `commitStyles()` then `cancel()` rather than `fill: 'forwards'` forever [S, MDN]. Default easing is `linear` and durations are in ms, unlike CSS defaults.
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` and the in-player Calm switch turn translation/scale/shake/particles into instant state changes or short fades (<= 150 ms) [S, WCAG 2.3.3 AAA animation from interactions; R, academy rule]. Keep the art and the state change; remove the motion at the source (academy-game-ui, Game feel standard).
- **Flashes**: nothing flashes more than 3 times per second (WCAG 2.3.1 Level A) [S]; no full-screen white/red flashes, no strobing sparkles; bursts are short fades.
- **Targets**: >= 44 x 44 CSS px with >= 8 px gaps (WCAG 2.5.8 AA minimum is 24 px, 2.5.5 AAA is 44 px, Apple 44 pt, Material 48 dp) [S]; the hit area may be bigger than the sprite (padding, pseudo-element).
- **Contrast** >= 4.5:1 for text, 3:1 for icons and borders; text over pictures sits on a pill/veil, never directly on busy art.
- **No motion-only or colour-only information**: right/wrong/selected is also an icon + text + shape change; Wordle added a high-contrast/colour-blind mode because colour-only feedback excluded players [S].
- **Keyboard and focus**: every tap action also reachable by keyboard with a visible focus ring; `aria-live="polite"` for feedback text.
- **Audio**: all motion works with sound off, all sounds optional; never the browser TTS [R].

## 15. Educational game UX anti-patterns (reject in review)

1. Timers that punish (countdowns that end the round or remove stars); a timer is opt-in, never default [R]. Speed pressure harms retrieval for anxious learners [J].
2. Public leaderboards or rankings: they motivate the top and demotivate the bottom; evidence from several small studies, relative or personal-best displays are the only acceptable form [S, R].
3. Loot-box style randomness or variable-ratio "mystery" rewards tied to answers; rewards are predictable and earned [S: manipulative design patterns are common in children's apps].
4. Fake urgency ("only 2 minutes left!", expiring streak guilt, a sad mascot when the student leaves) [S].
5. Streak guilt: streak freezes and "welcome back" instead of loss messaging [R, academy-daily-practice].
6. Childish mascots, baby fonts, pastel candy UI, "yay good job!" for teens [J; teen design sources are agency blogs, no study found].
7. Animation that hides the target, delays the next task or can not be skipped (section 12).
8. Red/green-only status; tiny targets; text-only answers with no audio.
9. Rewards for clicking rather than for learning (points for any tap, XP for time-on-screen).
10. Dark scenes, neon and gloom in Academy art [R].

## 16. Top-notch illustration (how the art supports juice)

- **Layered depth without parallax**: back plate (calmed with `CalmBg`: soft blur, slight desaturation, light veil) -> game pieces -> UI pills. Depth comes from shadows and size, not camera movement [R].
- **Stickers**: cut-out, transparent background, thin light outline, soft contact shadow (blur 8-14 px, 25 % opacity) + a 3D lip on pieces; never a picture in a white box [R].
- **Soft light veil** (white 20-35 %) behind small pieces so they are the brightest things; busy scene never competes with the target.
- **Palette**: 3-4 colours from the lesson picture; about **25 % purple** in Academy pictures mixed with teal/blue, cream/wood and green [R]; accent for "tap me", emerald for "right", amber for "not yet".
- **Character expression sets**: every cast member has at least neutral, talking, happy, thinking/concerned, surprised, with the same face, hair and skin in all (art check, `artReview.ts`) [R]; a reaction is a swap plus a small hop, not new art per line.
- **Clean-edge check** at 2x zoom on hands, faces, held objects before anything ships [R].
