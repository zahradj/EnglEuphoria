# Scenario: A1 Unit 6 Lesson 7, page 5, Rising Tide game, painted and animated with Canva

**Status: built on the work branch 2026-10-16 (preview build only, not live); waiting for the owner's OK on the preview
`docs/scenarios/a1u6-rising-tide-preview.gif`. Requested by the owner (2026-10-16: "Animation looks very flat, so use
Canva to generate well animated illustrations").**

Rules followed: CLAUDE.md "Media generators" (pictures and GIF frames from Canva only, Playground brand shades,
cut-out stickers, Canva GIFs follow the scenario rule) and "Games: background loops only" (a game may move its
background picture in a calm, silent loop; never characters doing new actions, never text). No zoom and no pan on
any picture: only the named part moves inside a fixed frame.

| | |
|---|---|
| **Where** | `oc7-tide` (`rising-river`, `look: 'tide'`) in `LESSON_A1U6L7_SCENES`, `src/content/playground-library/ocean/scenes.ts`; drawn by `TideStage` in `welcome-town/scene-components/RisingRiverScene.tsx`. |
| **ONE goal** | The warm-up of the Boss Test feels like a real seaside game: the child answers, a plank lands and the pier grows toward a living, moving sea. A miss lets the tide come up the posts (gentle pressure, no fall). |
| **Language** | Unchanged: the five Unit 6 questions on the card ("What is it? It is big. It lives in the sea." …). The pictures never show words. |
| **Cost** | Canva only (generate-image, separate-image-layers, GIF export). No paid clips. |

## The pieces (all Canva, Playground brand shades)

| # | Piece | Picture (Canva) | How it moves | Frames / file |
|---|---|---|---|---|
| 1 | **Seaside background** | wide painted beach: sand dune with shells left, calm turquoise sea, sky, sun, clouds; no people, no pier, no boat | the sea's foam lines roll in and out (a layer of the same picture shifted a few pixels); everything else holds still | 3 frames ping-pong, 0.6 s each → `public/lep1/gifs/a1u6-tide-bg.webp` (still PNG = poster and fallback) |
| 2 | **Sailboat** (cut-out) | wooden boat, cream sail, orange flag | flag and sail flutter (2 Canva frames: flag left / flag right); the game bobs it on the waves | 2 frames, 0.35 s → `a1u6-tide-boat.webp` |
| 3 | **Seagull** (cut-out) | white seagull, side view | wings up / wings down (2 Canva frames); the game glides it across the sky | 2 frames, 0.3 s → `a1u6-tide-gull.webp` |
| 4 | **Pier plank** (cut-out) | one wooden plank, two nails | still picture; the game drops it in with a bounce and a splash | `public/lep1/stickers/tide-plank.png` |
| 5 | **Pier post** (cut-out) | wooden post with a rope | still picture; the tide marks are drawn by the game | `public/lep1/stickers/tide-post.png` |
| 6 | **Wave band** (cut-out) | a long band of painted waves with white foam crests | the game raises it when the tide comes in (a miss) and rocks it gently | `public/lep1/stickers/tide-waves.png` |

Characters stay the existing approved hero stickers (Pip, Mia, Leo in capes, fully covered); they hop in place and
walk the pier at the end (live UI motion, as now). No new character poses are generated.

## Shot list (what the child sees, in order)

| # | Moment | What moves | Time |
|---|---|---|---|
| 1 | Page opens | sea foam rolls (background loop), gull glides across, boat flag flutters and the boat bobs | loop |
| 2 | Pip asks the question (card) | nothing new; the scene keeps its calm loop | — |
| 3 | Right answer | a painted plank drops onto the next pair of posts, bounces, a white splash; counter +1 | 0.8 s |
| 4 | Wrong answer | the wave band rises one step up the posts; "The tide is coming in!" bubble; the friends hop (wet feet) | 0.6 s |
| 5 | Last plank | the friends walk the pier to the boat; confetti; "Everybody is on the boat!" | 2.6 s |

## Preview before it goes in
`docs/scenarios/a1u6-rising-tide-preview.gif`: the painted page with the moving pieces, as the child will see it.

## What was made (2026-10-16)
| Piece | Canva | File |
|---|---|---|
| Seaside background | media MAHYNVqogYI, holder DAHYA1ndgiM p98 | `public/lep1/scenes/bg-a1u6-tide-wide.png` |
| Sticker sheet (boat, gull, plank, post, waves) | media MAHYNYwtfSE, p99, cut with an object splitter | `public/lep1/stickers/tide-{boat,gull,plank,post,waves}.png` |
| Gull wings-down frame | media MAHYNW_CWsc (edit of the sheet's gull), p100 | with the wings-up gull, aligned at the beak: `public/lep1/gifs/a1u6-tide-gull.webp` (0.26 s / 0.22 s) |

Changes from the plan: the background holds completely still (no foam loop): the two painted wave bands rolling past at
different speeds give the sea its motion, and they rise with the tide. The boat rocks as one piece (no separate flag
frames). Everything else as in the shot list.

## Version 2 (2026-10-17): the painted pier, built in stages, on a moving sea
Owner (2026-10-16): "the water is moving and the bridge is up … create the bridge more illustrated and better animated,
not flat."

| Piece | Canva | How it was made | File |
|---|---|---|---|
| Painted pier | pier scene, design DAHYNk4zo3Q (pier layer media MAHYNvntiQs) | exported with and without the pier layer; the difference is the pier's exact outline, so the pier is cut out with its own posts, ropes and painted splashes | `public/lep1/stickers/tide-pier-{1..5}.png` (five sections, near to far, cut between posts) |
| Moving sea | the seaside background (MAHYNVqogYI) | 16 frames of the same painted sea, each row nudged a few pixels (ripples that grow toward the front); sand, sky and frame never move | `public/lep1/gifs/a1u6-tide-sea.webp` (0.12 s per frame, loops) |

How the page plays now:
- The whole pier waits as a pale ghost, so the child sees what they are building.
- A right answer drops the next painted section onto its posts with a bounce and a white splash (5 answers = 5 sections).
- A wrong answer: the painted wave band rolls in along the water line and climbs the posts a step (at most 3 steps, never
  over the deck); the boat floats up with it; the friends hop. "The tide is coming in!" shows at the bottom.
- The last section: the friends walk the pier to the boat, getting smaller with distance; confetti.
- The question card now sits in the sky, so the pier is never hidden.
- The boat stays the approved Canva sticker: cutting the pier scene's own boat failed (its sail blends into the clouds).
- No zoom and no pan anywhere; reduced-motion users get the still sea.

Preview (the real page, recorded in the browser): `docs/scenarios/a1u6-rising-tide-preview.gif`.

## Approval
- Owner: requested 2026-10-16 ("use Canva to generate well animated illustrations").
- Owner OK on the preview: _pending_
