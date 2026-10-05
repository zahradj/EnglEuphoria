---
name: kids-video-scenario
description: >
  REQUIRED before ANY video for a child — a story film, a demonstration, a song video, a stills film or a paid AI clip.
  Owner's rule (2026-10-04): "whenever you create a video, you have to create a scenario first." Write the scenario
  (learning goal → beats → shot list with the exact words, ONE action, camera, start/end picture, labels, pauses,
  timing), get the owner's written OK, then make pictures → stills animatic → (optional) AI motion one clip at a time.
  Research-based: Sesame Workshop CTW model, Blue's Clues pause, educational-video scripting, AI shot lists.
  Works with kids-demo-video (watch-and-copy pages) and video-quality-gate (paid clips).
---

# Kids Video Scenario — no video without a scenario

Owner, 2026-10-04: *"Whenever you create a video, you have to create a scenario first. Study this, do research, make it a
skill."* Two clips were wasted before this rule because the motion was improvised from a prompt. The scenario is where
every mistake is caught **for free**: words, order, actions, angles, pictures, labels and timing are fixed on paper, the
owner approves them, and only then is anything drawn or generated.

## What the research says (and how we use it)

| Source | Finding | Our rule |
|---|---|---|
| Sesame Workshop "CTW model" (Lesser; *Children and Television: Lessons from Sesame Street*) | Every segment is planned from a curriculum goal by writers + educators + researchers, then tested with children | Scenario starts from ONE lesson goal and names the target words; the owner (educator) approves before production |
| Sesame Street: modelling + repetition; speech rate fell from 175 to 139 words/min over 26 years | Children imitate what they see; repetition is a teaching tool, not padding | Each target word is heard ≥ 3 times and shown being DONE; narration ≤ 130 words/min |
| Blue's Clues "pause" (Santomero; Crawley et al.) — every episode field-tested | A planned pause (≈ 4 beats) gives a young child time to think and answer aloud; a child voice then gives the answer | Every video has ≥ 1 PAUSE shot: a question, ~3-4 s of silence on a still, then the answer |
| Educational video scripting guides (Teachers Institute, Vyond, educationalvoice.co.uk, SERC storyboards) | One main idea per video; hook → body → wrap-up; read the script aloud for timing; finish the storyboard before production | Beats: HOOK → MODEL → CHILD'S TURN (pause) → PAYOFF; read every line aloud with a stopwatch |
| AI video shot lists (paintbrush.gg storyboard guide, Boords/Storyboarder) | Each storyboard panel = one motion clip; number shots with angle, action, duration | Shot list table below; one shot = one action = one clip ≤ 5 s |
| Preschool pacing research (BMC Psychology 2024 review) | Fast-paced video hurts young children's attention; slow-paced does not | Calm, continuous motion; no cuts inside a shot; ≤ 6 shots per minute |

## The scenario (write it in `docs/scenarios/<lesson>-<film>.md`)

1. **Header** — lesson, page, film title, length target, characters, setting, the ONE learning goal ("the child can say
   which two colours make green"), target words.
2. **Beats** (one line each): HOOK (why we watch) → MODEL (a character shows it, step by step) → CHILD'S TURN (question +
   pause + answer) → PAYOFF (the result, praise, link to the next activity).
3. **Shot list** — one row per shot:

| # | Time | Who speaks | Exact line (what the child hears) | ONE action on screen (= the line) | Camera | Start picture → end picture | Label (word + where) | Pause? |
|---|---|---|---|---|---|---|---|---|

   Rules for every row:
   - The action shows exactly what the line says, nothing more (no dancing, waving, extra moves).
   - ONE character does the action; full body; front view, eye level; same camera for the whole film
     (kids-demo-video). Pick the angle that shows the action (a pour seen from the front, a toe-touch from the side).
   - Every object the line names is in the picture and visible (both paint jars for "blue and yellow").
   - Nothing appears or disappears between start and end picture unless the line says so (a jug that vanishes = remake).
   - ≤ 5 s per shot; ≤ 12 words per line; the target word in the line AND as a label.
4. **Pictures needed** — list each key picture (new Canva picture or edit of a base picture, never Higgsfield) and
   whether it exists.
5. **Cost** — number of paid clips × price, or "stills only (free)".
6. **Owner approval** — the owner reads the scenario and says yes in writing → record it in the doc
   (`Approved: <date>, "<owner's words>"`). Paid clips also need `ownerApproved` per row in `scripts/story-videos.json`.

## Production order (never skip a step)

1. Scenario → owner OK.
2. Key pictures (Canva) → overlay check → owner sees them.
3. **Animatic**: stills film of the shot list with the real timing and labels (`make-stills-film.py` + `label-video.py`).
   This goes into the lesson right away (it already teaches).
4. Optional motion: one clip per shot, start + end picture, strict mode, `review-clip.py`, frame-by-frame review, then
   the next clip. Approved clips replace their stills in the film.

## Checklist before showing the owner a scenario

- [ ] one learning goal; target words heard ≥ 3 times; at least one pause shot with the answer after it
- [ ] every row: line ↔ action ↔ picture ↔ label agree word for word
- [ ] page order in the lesson: the film TEACHES before the game that USES it (owner, U2L2: "they have to learn and then
      they will start")
- [ ] no on-screen words except our labels; silent clips, voices added from recorded clips
- [ ] cost stated; nothing ordered

Example: `docs/scenarios/u2l2-magic-mix.md`.

## Related
`kids-demo-video` (watch-and-copy framing, labels) · `video-quality-gate` (paid clips, strict mode, accuracy method) ·
`lesson-quality-gate` (final pass) · `smart-lesson-architect` (where the film sits in the lesson).

Sources: sesameworkshop.org, en.wikipedia.org/wiki/Children_and_Television:_Lessons_from_Sesame_Street,
doi.org/10.2466/pms.99.1.354-360 (Sesame pace study), en.wikipedia.org/wiki/Interactive_television_(narrative_technique)
(Blue's Clues pause), teachers.institute (script & storyboard for educational videos), vyond.com/blog/how-to-create-
animated-educational-videos, serc.carleton.edu/NAGTWorkshops/video/storyboarding.html, paintbrush.gg/blog/how-to-storyboard-ai-video,
PMC11044375 (preschool pacing review).
