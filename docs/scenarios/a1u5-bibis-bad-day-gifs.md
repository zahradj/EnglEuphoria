# Scenario: A1 Unit 5 story *Bibi's Bad Day*, pages 1-3, three Canva story GIFs

**Status: waiting for the owner's OK.** Nothing has been drawn or exported yet.

Owner, 2026-10-14: *"You can use GIFs, video GIFs."* A1 has no story videos; stories move with Canva GIFs made from the
approved story pictures, after a written scenario and the owner's OK (CLAUDE.md "A1 lessons — length and story GIFs").
Skill: `.claude/skills/kids-video-scenario`. Same method as `a1u1-leos-first-day-gifs.md` and `a1u2-jungle-rescue-gifs.md`.

| | |
|---|---|
| **Where** | The Reader pages of *Bibi's Bad Day*: `BIBI_BAD_DAY` in `src/content/playground-library/monster-town/scenes.ts` (Unit 5 Lesson 1 reads pages 1-3; later lessons read on). |
| **What** | Three story pages move. Each becomes a short flip-book loop of 2 frames: edits of ONE story picture, exported from Canva as `gif`, re-timed with `scripts/retime-gif.py`, saved as a cut-to-frame animated WebP that fills the page. |
| **ONE learning goal** | The child sees the feeling HAPPEN while reading it: Bibi's body shows exactly the feeling word on the page (tired, scared). |
| **Target lines** | "This is Monster Town. Look! A tiny monster." · "This is Bibi. Bibi is tired because it is early." · "It is dark. Bibi is scared!" |
| **Rules** | Full scene, same framing as the page. No zoom, no pan, no camera move. Only the part the line names moves; nothing appears or vanishes. No on-picture text. Silent: the recorded Reader voice reads the line. Bibi is a girl (pink bow), ~35 % purple palette as painted. |
| **Cost** | Canva only (picture edits and GIF export). No paid clips. |

## Beats
- **HOOK:** p1, the tiny monster in the square waves — "Look! A tiny monster."
- **MODEL:** p2, Bibi yawns and stretches — *tired* shown with the whole body, *because it is early* shown by the sunrise in the window.
- **CHILD'S TURN:** p3. Bibi trembles; the Reader pauses after "It is dark." so the child can say how she feels before the word is read.
- **PAYOFF:** the Reader's picture question ("Why is Bibi scared?") — the child answers "It is dark."

## Shot list (one row = one GIF)

| # | Page | Exact line (Reader) | ONE action (= the line) | Frame A → frame B | Timing | Label |
|---|---|---|---|---|---|---|
| 1 | 1 | "This is Monster Town. Look! A tiny monster." | the tiny monster in the middle of the square waves one hand | A: current page 1 → B: the same picture, her hand tilted the other way | 0.45 s per frame, loop | none |
| 2 | 2 | "This is Bibi. Bibi is tired because it is early." | Bibi yawns: mouth wide → mouth closed, arms stay up | A: current page 2 (yawning) → B: mouth closed, eyes still shut | 0.8 s per frame (slow = tired) | none |
| 3 | 3 | "It is dark. Bibi is scared!" | Bibi trembles (a small shake, paws at her mouth) | A: current page 3 → B: Bibi shifted a tiny bit, shake lines on the other side | 0.15 s per frame, 6 shakes, then 1 s still | none |

## Pictures needed
- Frame A of each GIF is the existing story page (`public/lep1/scenes/bg-a1u5-story-N-wide.png`).
- **New:** frame B for 3 pages, made as Canva edits of frame A (same base picture, overlay-checked so only the named part changes), in the holder design "EnglEuphoria Monster Town art" (DAHYA1ndgiM).
- Export: one Canva design per GIF (frame A, frame B as pages) → `export-design gif` → `scripts/retime-gif.py` → animated WebP → `public/lep1/gifs/a1u5-story-N.webp`.

## In the lesson (only after the owner's OK)
- `BIBI_BAD_DAY[n].img` points to the WebP for these pages; the still PNG stays as the poster and the fallback.
- Read and Match, Yes or No? and other picture tasks keep the still pictures (a moving piece would confuse the task).

## Preview (animatic)
`docs/scenarios/a1u5-bibis-bad-day-preview.gif` shows the 3 pages in book order, each held for its reading time, a corner label naming the action.

## Approval
- Owner: _waiting_
