# Scenario: A1 Unit 2 story *The Jungle Rescue*, seven Canva story GIFs

**Status: waiting for the owner's OK.** Nothing has been drawn or exported yet.

Owner, 2026-10-13: *"In A1 no need for story videos, just use GIF videos"*. When asked, the owner chose **"Scenario + preview first"**.
Skill: `.claude/skills/kids-video-scenario`. The method is the same as the approved Pre-A1 GIFs (`u10l2-swim-dance-sing-gifs.md`).

| | |
|---|---|
| **Where** | The Reader pages of *The Jungle Rescue*: `JUNGLE_RESCUE` in `src/content/playground-library/jungle-adventure/scenes.ts`. It is used in Unit 2 L1-L6 (L5 reads the whole book in three parts) and in the L7 read-aloud. |
| **What** | Seven story pages move. Each one becomes a flip-book loop of 2 frames, or 3 frames for the rescue. The frames are edits of ONE story picture, exported from Canva as `gif`, re-timed with `scripts/retime-gif.py` and saved as an animated WebP that fills the page. The other five pages stay still. |
| **ONE learning goal** | The child sees what each animal **can** and **can't** do while reading it, so "can / can't" is shown, not only said. |
| **Target lines** | "I can climb! I can swing!" · "Help! Help! I am stuck!" · "I can fly. But I am small." · "I can swim. I can't lift Kip!" · "No! Your teeth!" · "The elephant lifts Kip with its long nose." · "Lunch! Chips for all!" |
| **Rules** | Full scene, same framing as the existing page. No zoom, no pan, no camera move. Only the part the line names moves; nothing appears or vanishes. No on-picture text. Silent: the recorded Reader voice reads the line. Calm and child-safe: the crocodile smiles and opens its mouth, it never bites. Coco and Kip stay as on the page. |
| **Cost** | Canva only. No paid clips. |

## Beats
- **HOOK:** p4, Coco swings ("I can swing!").
- **PROBLEM:** p5, Kip waves for help on the rock.
- **MODEL (who can't):** p6, Willow flaps, but she is small; p7, the fish splashes, it can swim but can't lift; p8, the crocodile's teeth.
- **CHILD'S TURN:** in L5 the Reader stops after p8 for the "Who can help Kip? Why?" choice page. The child answers, then:
- **PAYOFF:** p10, the elephant lifts Kip with its long nose; p12, lunch for all.

## Shot list (one row = one GIF)

| # | Page | Exact line (Reader) | ONE action (= the line) | Frames | Timing | Label |
|---|---|---|---|---|---|---|
| 1 | 4 | "I can climb! I can swing!" | Coco swings on the vine | A: current page 4 (vine left) → B: vine and Coco swung right | 0.5 s per frame | none |
| 2 | 5 | "Kip is on a rock." / "Help! Help! I am stuck!" | Kip waves both arms | A: current page 5 (arms down) → B: arms up | 0.4 s per frame | none |
| 3 | 6 | "I can fly. But I am small. I can't help Kip." | Willow flaps her wings in the air | A: current page 6 (wings up) → B: wings down | 0.3 s per frame | none |
| 4 | 7 | "Can a fish help?" / "I can swim. I can't lift Kip!" | The fish jumps out of the water and back | A: current page 7 (fish in the water) → B: fish just above the water, a small splash | 0.45 s per frame | none |
| 5 | 8 | "I can swim! Can I help?" / "No! Your teeth!" | The crocodile opens and closes its smiling mouth | A: current page 8 (mouth closed) → B: mouth open, friendly | 0.5 s per frame | none |
| 6 | 10 | "The elephant lifts Kip with its long nose." | The elephant lifts Kip from the rock to the bank | A: trunk around Kip on the rock → B: Kip up in the air in the trunk → C: Kip on the bank | 0.7 s per frame, hold C 1.5 s, loop | none |
| 7 | 12 | "Lunch! Chips for all!" / "Thank you, friends!" | The friends lift a chip and smile | A: current page 12 → B: chips raised | 0.5 s per frame | none |

Pages that stay still: 1, 2, 3, 9, 11. Their lines are about what someone looks like, or about talking; there is no action to show.

## Pictures needed
- Frame A of each GIF is the existing story page (`/jungle-adventure/scenes/bg-jungle-rescue-N-wide.png`). For p10, frame A may need its own edit (trunk around Kip, Kip still on the rock).
- **New:** 7 frame-B pictures plus frame C for p10 (8, or 9 with the p10 frame A). They are Canva edits of the story page (holder design DAHXotocLGI, jungle reference MAHX2I_jvlg), overlay-checked so only the named part changes.
- Export: one Canva design per GIF → `export-design gif` → `scripts/retime-gif.py` → animated WebP → `public/jungle-adventure/gifs/rescue-N.webp`.

## In the lesson (only after the owner's OK)
- `JUNGLE_RESCUE[n].img` points to the WebP for these 7 pages; the Reader plays it, and the still PNG stays as the poster and the fallback.
- Tick-cross, story-order, story-gaps, jigsaw and true/false pages keep the still pictures.

## Preview (animatic)
`docs/scenarios/a1u2-jungle-rescue-preview.gif` shows the 12 pages in book order, each held for its reading time. A corner label marks the seven pages that will move ("GIF 1"…"GIF 7") and gives the action. This preview uses the existing still pictures only; the new frames are made after the OK.

## Approval
- Owner: _waiting_
