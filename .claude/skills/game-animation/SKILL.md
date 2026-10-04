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
