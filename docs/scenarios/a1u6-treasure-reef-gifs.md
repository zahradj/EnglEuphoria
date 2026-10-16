# Scenario: A1 Unit 6 story *The Treasure Reef*, pages 6-9, four Canva story GIFs

**Status: waiting for the owner's OK.** Frame B pictures are not drawn yet; the preview uses the still pages.

Owner, 2026-10-16: *"You can generate them as a GIF video."* A1 has no story videos; stories move with Canva GIFs made from the
approved story pictures, after a written scenario and the owner's OK (CLAUDE.md "A1 lessons — length and story GIFs").
Skill: `.claude/skills/kids-video-scenario`. Same method as `a1u5-bibis-bad-day-gifs.md` and `a1u2-jungle-rescue-gifs.md`.

| | |
|---|---|
| **Where** | The Reader pages of *The Treasure Reef*: `TREASURE_REEF` in `src/content/playground-library/ocean/scenes.ts` (Unit 6 Lessons 3 and 4 read pages 6-9). |
| **What** | Four story pages move: the pages redrawn on 2026-10-16 in the Playground brand shades, with Bella in them. Each becomes a short flip-book loop of 2 frames: edits of ONE story picture, exported from Canva as `gif`, re-timed with `scripts/retime-gif.py`, saved as an animated WebP that fills the page. |
| **ONE learning goal** | The child sees the action word HAPPEN while reading it (swimming, eats, big waves, No, it isn't), so the verb and the short answer are shown, not only said. |
| **Target lines** | "The friends are diving. Fish are swimming!" · "The turtle lives on the reef. It eats sea grass." · "Oh no! It is windy. The waves are big." · "Mia: Is it the chest? Shark: No, it isn't!" |
| **Rules** | Full scene, same framing as the page. No zoom, no pan, no camera move. Only the part the line names moves; nothing appears or vanishes. No on-picture text. Silent: the recorded Reader voice reads the line. Calm and child-safe: the waves rock the boat gently, the shark smiles. Everyone stays fully covered (long-sleeved swim shirts, life jackets). Playground brand shades as painted. |
| **Cost** | Canva only (picture edits and GIF export). No paid clips. |

## Beats
- **HOOK:** p6, the friends dive and the fish swim past: "Fish are swimming!"
- **MODEL:** p7, the turtle munches the sea grass while Bella watches: "It eats sea grass."
- **PROBLEM:** p8, the boat rocks on the big waves: "It is windy. The waves are big."
- **CHILD'S TURN:** p9. The Reader stops after Mia's question "Is it the chest?" so the child can answer before the shark does.
- **PAYOFF:** the shark shakes its head, "No, it isn't!", which leads straight into Lesson 4's Reef Detective game.

## Shot list (one row = one GIF)

| # | Page | Exact line (Reader) | ONE action (= the line) | Frame A → frame B | Timing | Label |
|---|---|---|---|---|---|---|
| 1 | 6 | "The friends are diving. Fish are swimming!" | the small fish around the friends swim forward | A: page 6 → B: the same picture, each small fish moved a little forward, tails the other way | 0.4 s per frame, loop | none |
| 2 | 7 | "The turtle lives on the reef. It eats sea grass." | the turtle munches: mouth open on the grass → mouth closed | A: page 7 (mouth open) → B: mouth closed, a blade of grass shorter | 0.5 s per frame, loop | none |
| 3 | 8 | "Oh no! It is windy. The waves are big." | the boat rocks on the wave: tilted left → tilted right | A: page 8 → B: the same boat and friends tilted the other way, the wave crest moved | 0.7 s per frame (slow, calm), loop | none |
| 4 | 9 | "Mia: Is it the chest? Shark: No, it isn't!" | the shark shakes its head kindly | A: page 9 → B: the shark's head turned the other way, same smile | 0.35 s per frame, 4 shakes, then 1 s still | none |

Pages that stay still: 1-5 (no new art yet; they keep the earlier pictures).

## Pictures needed
- Frame A of each GIF is the new story page in the Canva holder "EnglEuphoria Monster Town art" (DAHYA1ndgiM): p89 page 6 (MAHYIC40lsI), p90 page 7 (MAHYIc0MSSA), p91 page 8 (MAHYITZendw), page 9 still to draw (Mia, Bella, the shark and the chest).
- **New:** frame B for 4 pages, Canva edits of frame A, overlay-checked so only the named part changes.
- Export: one Canva design per GIF (frame A, frame B as pages) → `export-design gif` → `scripts/retime-gif.py` → animated WebP → `public/lep1/gifs/a1u6-story-N.webp`.

## In the lesson (only after the owner's OK)
- `TREASURE_REEF[n].img` points to the WebP for these pages; the still PNG stays as the poster and the fallback.
- Read and Match, Yes or No? and other picture tasks keep the still pictures (a moving piece would confuse the task).

## Preview (animatic)
`docs/scenarios/a1u6-treasure-reef-preview.gif` shows pages 6-9 in book order, each held for its reading time, with a corner label naming the action that will move.

## Approval
- Owner: _waiting_
