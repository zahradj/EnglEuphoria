# Scenario: A1 Unit 6 Lesson 7, page 5, Rising Tide game, painted and animated with Canva

**Status: requested by the owner (2026-10-16: "Animation looks very flat, so use Canva to generate well animated
illustrations"). Built pieces go into the lesson only after the owner sees the preview and says OK.**

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

## Approval
- Owner: requested 2026-10-16 ("use Canva to generate well animated illustrations").
- Owner OK on the preview: _pending_
