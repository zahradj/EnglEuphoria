# Scenario: A1 Unit 7 story *Captain Spark Saves the Day*, seven Canva story GIFs

**Status: waiting for the owner's OK.** Nothing has been drawn or exported yet.

Owner, 2026-10-13: *"In A1 no need for story videos, just use GIF videos"*. Skill: `.claude/skills/kids-video-scenario`. The method is the same as the Jungle Rescue and Treasure Reef GIFs (`a1u2-jungle-rescue-gifs.md`, `a1u6-treasure-reef-gifs.md`).

| | |
|---|---|
| **Where** | The Reader pages of *Captain Spark Saves the Day*: `SPARK_STORY` in `src/content/playground-library/hero-city/scenes.ts`. It is used in Unit 7 L1-L4 (in parts), L5 reads the whole book, and L7 has the read-aloud. |
| **What** | Seven story pages move. Each becomes a flip-book loop of 2 frames, or 3 frames for the rescue. The frames are Canva edits of ONE story picture, exported from Canva as `gif`, re-timed with `scripts/retime-gif.py` and saved as an animated WebP that fills the page. The other five pages stay still. |
| **ONE learning goal** | The child sees each hero's **can** (and Pip's **can't**) and the **rules** (*must wait / mustn't run*) happen while reading them, so the grammar is shown, not only said. |
| **Target lines** | "She can fly fast!" · "Leo can run fast. Mia can climb well." · "Can Pip lift the box? No, he can't. But Leo can!" · "Biscuit can swim well. He can save the boat." · "Stop! You must wait. You mustn't run on the road." · "The friends wait. They are kind and safe." · "Mia can climb well. Leo and Pip help." |
| **Rules** | Full scene, same framing as the existing page. No zoom, no pan, no camera move. Only the part the line names moves; nothing appears or vanishes. No on-picture text. Silent: the recorded Reader voice reads the line. Calm and child-safe: everyone stays on the pavement until the light is green; the kitten is never in danger. Characters stay as on the page, fully covered. Full colour, as on the page. |
| **Cost** | Canva only. No paid clips. |

## Beats
- **HOOK:** p2, Captain Spark flies over Hero City ("She can fly fast!").
- **MODEL (powers):** p3, Leo runs and Mia climbs; p4, Pip can't lift the box, but Leo can; p5, Biscuit swims and pushes the boat.
- **RULES:** p6, red light, Spark's "stop" hand, the friends wait; p7, green light, they cross slowly.
- **CHILD'S TURN:** in L5 the Reader stops after p10 ("The kitten is on the tower! Who can help?") for the choice page. The child answers, then:
- **PAYOFF:** p11, Mia climbs the ladder and holds the kitten while Leo steadies it and Pip holds the blanket.

## Shot list (one row = one GIF)

| # | Page | Exact line (Reader) | ONE action (= the line) | Frames | Timing | Label |
|---|---|---|---|---|---|---|
| 1 | 2 | "This is Captain Spark. She can fly fast!" | Spark's cape streams and her arm reaches forward | A: current page 2 → B: cape higher, arm stretched further, speed lines brighter (she stays in the same place; no move across the sky) | 0.35 s per frame | none |
| 2 | 3 | "Leo can run fast. Mia can climb well." | Leo's legs swap mid-run; Mia reaches up to the next hold | A: current page 3 → B: Leo's other leg forward, Mia's other hand up | 0.4 s per frame | none |
| 3 | 4 | "Can Pip lift the box? No, he can't. But Leo can!" | Pip pulls and the box stays; Leo lifts his box up | A: current page 4 → B: Pip leaning back pulling (box unmoved), Leo's box a little higher | 0.6 s per frame | none |
| 4 | 5 | "Biscuit can swim well. He can save the boat." | Biscuit paddles and the boat bobs toward the bank | A: current page 5 → B: paws in the other position, a small splash, boat tilted | 0.45 s per frame | none |
| 5 | 6 | "Stop! You must wait. You mustn't run on the road." | The red light glows; Spark's hand is up; the friends stand still | A: current page 6 → B: red light brighter, Spark's palm slightly forward | 0.6 s per frame | none |
| 6 | 7 | "The friends wait. They are kind and safe." | The friends step across the zebra crossing on green | A: current page 7 → B: the other foot forward for each friend (they stay in the same place on the crossing) | 0.5 s per frame | none |
| 7 | 11 | "Mia can climb well. Leo and Pip help." | Mia lifts the kitten from the ledge; Leo holds the ladder; Pip holds the blanket | A: Mia on the ladder reaching → B: Mia's hand at the kitten → C: Mia holding the kitten safely | 0.7 s per frame, hold C 1.5 s, loop | none |

Pages that stay still: 1, 8, 9, 10, 12. Their lines are about the weather, talking ("What's the matter?" / "Can I help you?") or a cheer; the talk is the teaching point there, not an action.

## Pictures needed
- Frame A of each GIF is the existing story page (`/lep1/scenes/bg-a1u7-story-N-wide.png`). For p11, frame A needs its own edit (Mia's hand still reaching).
- **New:** 7 frame-B pictures, plus frames A and C for p11 (9 in all). They are Canva edits of the story page (holder design DAHYRv-e1QQ, story pages are its pages 1-12), overlay-checked so only the named part changes.
- Export: one Canva design per GIF → `export-design gif` → `scripts/retime-gif.py` → animated WebP → `public/lep1/gifs/spark-N.webp`.

## In the lesson (only after the owner's OK)
- `SPARK_STORY[n].img` points to the WebP for these 7 pages. The Reader plays it, and the still PNG stays as the poster and the fallback.
- Read-and-match, true/false, story-order and jigsaw pages keep the still pictures.

## Preview (animatic)
`docs/scenarios/a1u7-captain-spark-preview.gif` shows the 12 pages in book order, each held for its reading time. A corner label marks the seven pages that will move ("GIF 1"…"GIF 7") and gives the action. This preview uses the existing still pictures only; the new frames are made after the OK.

## Approval
- Owner: _waiting_
