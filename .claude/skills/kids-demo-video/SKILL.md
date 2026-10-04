---
name: kids-demo-video
description: >
  REQUIRED whenever a Playground lesson shows a child what to DO or to POINT AT (body parts, actions, TPR commands, "touch
  your…", "point to…", "show me…", feelings faces, prepositions, any "watch and copy" page) in a story-video, cinematic or
  demonstration film. The owner-approved standard (U4L1 page 4, 2026-10-04: "this one is much better, way better — keep it
  as a skill and use it in next lessons"): ONE character, full body, front view, one picture per spoken line, the word
  with a line to the exact spot, stills film first, real AI motion only through strict mode with start+end key pictures.
  Use with video-quality-gate (paid video rules) and lesson-quality-gate.
---

# Kids Demo Video — the "watch Leo and copy" standard

Approved by the owner on U4L1 "Head, Shoulders, Knees, Toes!" page 4 after two rejected group clips. A young child must be
able to SEE exactly what to copy and READ/HEAR the word at the same moment. Everything here is free (Canva + our scripts);
only the optional AI motion step costs money and goes through `video-quality-gate` strict mode.

## The standard (every demonstration page)

1. **One character per shot.** Never a group for a demonstration (groups = too small, too many paws/faces to get wrong).
   Pick the cast member whose anatomy matches the words: Leo (lion) or Pip (fox) for body parts and actions; not Willow
   (a bird has wings, no clear shoulders/knees). Other characters may speak the line (voice-over), one character SHOWS it.
2. **Framing and angle.** Front view, child's eye level, character centred, WHOLE body from top of head to feet with a
   little floor below, filling ~3/4 of the frame height. Same camera in every picture of the sequence. Choose the angle
   that SHOWS the target (a toe-touch from the front hides the toes → find a pose/angle where the contact is visible).
3. **One picture per spoken line, showing exactly that line.** The paw visibly TOUCHES the part (contact, not hovering).
   Exactly two arms/two legs, same props (scarf, bow) in every picture. Song order = page order.
4. **Make the pictures as a chain of Canva EDITS of one base picture** (reference = base, "keep EVERYTHING identical …
   only move the arms to …"). Base first: the character standing relaxed, arms down. Then one edit per pose.
   Check each at 600 px in the holder design (`DAHXATpO_n4`); remake anything imprecise. Then the free overlay check
   (blend each consecutive pair 50/50): only the moving limbs may double; anything else doubled = remake.
5. **Label every target word ourselves** with `scripts/label-video.py`: the word in a white rounded pill (Outfit Bold,
   app ink colour), an orange line with a dot ON the part; paired parts (shoulders, knees, eyes, ears, hands, feet) get
   one line to EACH side. Label sits on empty wall/floor, never over the face; it fades in when the line is spoken and out
   before the next. Never let an AI model write words (it garbles letters).
6. **Stills film first** (`scripts/make-stills-film.py`, cross-fades, never zoom/pan), then labels, then wire it as the
   page's `videoUrl` with `pages[].atSec` matching the line timings. Show the owner the labelled draft (send the mp4 + a
   contact sheet of one frame per line). This alone was what the owner called "way better".
7. **Optional real motion (paid):** only after the owner approves the stills. Storyboard rows in
   `scripts/story-videos.json`: `image` = pose before the line, `endImage` = pose of the line (the clips chain:
   stand → head → shoulders → knees …), one character, motion-only prompt ≤ 50 words, `labels` copied from the film,
   `ownerApproved` only after a written yes, ONE clip per run, `scripts/review-clip.py` screen + frame-by-frame review,
   then `label-video.py` on the approved clip. Full rules: `video-quality-gate` (STRICT MODE + ACCURACY METHOD).

## Recipe (copy for the next lesson)

```bash
# 1. Canva (free): base picture of ONE character, full body, front view, in the lesson's setting; then edits per pose.
# 2. Bot: scripts/canva-art-request.json → public/lep1/scenes/bg-u<U>l<L>-<char>-<pose>-wide.png (check names are new!)
# 3. Overlay check (blend consecutive pairs), fix any drift.
python3 scripts/make-stills-film.py /tmp/p '[["bg-…-stand-wide.png",0],["bg-…-head-wide.png",1.5],["bg-…-shoulders-wide.png",5]]'
python3 scripts/label-video.py /tmp/p.mp4 public/lep1/video/<story>-a \
  '[{"word":"head","at":[50,9],"label":[76,16],"from":2.3,"to":5},
    {"word":"shoulders","at":[[41,42],[59,42]],"label":[50,90],"from":5.8,"to":8.5}]'
# 4. Grab one frame per label (ffmpeg -ss) → contact sheet → check every dot sits ON the part. Adjust "at" and re-run.
# 5. scenes.ts: videoUrl `${A}/video/<story>-a.mp4?v=<n+1>`, pages[].img = the pose pictures, atSec = label start - ~0.8 s.
```

Label coordinates are % of the frame; find them on the 1376×768 picture (dot on the touching paw/joint). Typical times:
picture changes ~0.8 s before the word, label shows while the line is heard (≥ 2.5 s), ≥ 0.5 s gap between labels.

## Quality checklist (all must pass before showing the owner)

- [ ] one character, full body incl. feet, centred, same camera in every picture
- [ ] each picture shows exactly its line; contact visible; 2 arms/2 legs; props unchanged
- [ ] overlay check: only the moving limbs differ
- [ ] every target word labelled, spelled as taught, dots ON the part (both sides for pairs), label never over the face
- [ ] stills cross-fade, no zoom/pan; labels fade, never flash
- [ ] page `atSec` matches the film; tests + `typecheck:classroom` pass

## Known hard poses (learned on U4L1)

- **Shoulders:** say "paw on TOP of the shoulder, next to the mane, above the chest" — otherwise Canva draws a "muscle" pose.
- **Toes:** front view hides the toes; side view makes a fox stand on four legs. Next to try: a SITTING toe-touch (legs
  straight on the mat, paws on toes), front or 3/4 view. Until solved, the toes page stays a still picture.

## Related
`video-quality-gate` (paid video rules) · `lesson-quality-gate` (final pass) · `game-animation` (games are separate:
background loops only) · `docs/canva-art-pipeline.md` (getting Canva pictures into the repo).
