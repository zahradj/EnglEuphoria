# Scenario: A1 Unit 1 story *Leo's First Day*, six Canva story GIFs

**Status: waiting for the owner's OK.** Nothing has been drawn or exported yet.

Owner, 2026-10-13: *"In A1 no need for story videos, just use GIF videos"*. When asked, the owner chose **"Scenario + preview first"**.
Skill: `.claude/skills/kids-video-scenario`. The method is the same as the approved Pre-A1 GIFs (`u10l2-swim-dance-sing-gifs.md`).

| | |
|---|---|
| **Where** | The Reader pages of *Leo's First Day*: `LEO_STORY` in `src/content/playground-library/welcome-town/scenes.ts`. It is used in Unit 1 L1-L5 (L5 reads the whole book) and in the L7 read-aloud. |
| **What** | Six story pages move. Each one becomes a short flip-book loop: 2 frames, or 3 for the hold-and-loop. The frames are edits of ONE story picture, exported from Canva as `gif`, re-timed with `scripts/retime-gif.py` and saved as an animated WebP that fills the page. The other five pages stay still. |
| **ONE learning goal** | The child sees the story line HAPPEN while they read it: the action on the page is exactly the sentence they read. |
| **Target lines** | "Hello! My name is Pip." · "I am sad. My red cap is lost." · "No, no! That is my red hat!" · "Look! The cap is on the cat!" · "I am happy now!" · "Goodbye, friends!" |
| **Rules** | Full scene, same framing as the existing page. No zoom, no pan, no camera move. Only the part the line names moves; nothing appears or vanishes. No on-picture text. Silent: the recorded Reader voice reads the line. Cast as on the page (Pip and Leo are boys: no dresses). |
| **Cost** | Canva only (picture edits and GIF export). No paid clips. |

## Beats
- **HOOK:** p2, Pip waves hello.
- **MODEL:** the problem (p4, Leo is sad) and the wrong cap (p8, Willow shakes her head).
- **CHILD'S TURN:** p9. The cat's tail swishes while the cap wiggles; the Reader pauses on "Look!" so the child can point and say where the cap is.
- **PAYOFF:** p10, Leo jumps happily, and p11, everyone waves goodbye.

## Shot list (one row = one GIF)

| # | Page | Exact line (Reader) | ONE action (= the line) | Frame A → frame B (→ C) | Timing | Label |
|---|---|---|---|---|---|---|
| 1 | 2 | "Hello! My name is Pip. What's your name?" | Pip waves one hand | A: the current page 2 (hand up, left) → B: the same picture with the hand tilted right | 0.4 s per frame, loop | none (the Reader highlights the words) |
| 2 | 4 | "I am sad. My red cap is lost." | Leo lowers his head and wipes one eye | A: current page 4 → B: head lower, paw at the eye | 0.6 s per frame (slow = sad) | none |
| 3 | 8 | "No, no! That is my red hat!" | Willow shakes her head | A: current page 8, head turned left → B: head turned right | 0.35 s, 4 swings, then 1 s still | none |
| 4 | 9 | "Look! The cap is on the cat!" | The cat swishes its tail; the cap on its head tilts | A: current page 9 → B: tail up, cap tilted | 0.5 s per frame | none |
| 5 | 10 | "My cap! Thank you, friends! I am happy now!" | Leo jumps with the cap on | A: current page 10 (feet on the ground) → B: Leo in the air, the same pose | 0.45 s per frame | none |
| 6 | 11 | "Goodbye, Leo! See you tomorrow!" / "Goodbye, friends!" | Leo and Pip wave goodbye | A: current page 11 → B: both hands tilted the other way | 0.4 s per frame | none |

Pages that stay still: 1, 3, 5, 6, 7. Their lines are about who someone is, or about talking; there is no action to show.

## Pictures needed
- Frame A of each GIF is the existing story page (`/welcome-town/scenes/bg-leo-story-N-wide.png`).
- **New:** frame B for 6 pages, made as Canva edits of frame A (same base picture, overlay-checked so only the named part changes). That is 6 pictures, made in the holder design DAHXotocLGI with cast reference MAHX1XNos4k.
- Export: one Canva design per GIF (frame A, frame B as pages) → `export-design gif` → `scripts/retime-gif.py` → animated WebP → `public/welcome-town/gifs/leo-story-N.webp`.

## In the lesson (only after the owner's OK)
- `LEO_STORY[n].img` points to the WebP for these 6 pages; the Reader shows it with a plain `<img>`, so the loop plays.
- The still PNG stays as the poster and the fallback.
- Tick-cross, story-order and jigsaw pages keep the still pictures, because a moving piece would confuse the task.

## Preview (animatic)
`docs/scenarios/a1u1-leos-first-day-preview.gif` shows the 11 pages in book order, each held for its reading time. A corner label marks the six pages that will move ("GIF 1"…"GIF 6") and gives the action. This preview uses the existing still pictures only; the frame B drawings are made after the OK.

## Approval
- Owner: _waiting_
