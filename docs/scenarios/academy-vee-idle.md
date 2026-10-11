# Scenario: Vee idle loop (Academy puppet test) — DRAFT, awaiting owner's written approval

Hub: Academy only. Skill: `kids-video-scenario` shape, `video-quality-gate` strict mode (owner rule 2026-10-04) applied to a teen cast.

- **Learning goal:** none directly. This clip makes the Academy cast feel alive on every screen (idle motion) so lessons look like a game; it carries no words.
- **Why one clip first:** to see whether image-to-video keeps Vee's face, hoodie and colours stable. If it does, the other three characters follow, one clip at a time.

## Shot list (ONE row)

| # | Line | ONE action | Camera | Start / end picture | Label | Seconds |
|---|---|---|---|---|---|---|
| 1 | (none, silent) | Vee stands relaxed and breathes slowly, tilts his head very slightly, then returns to the starting pose | steady, front, no zoom, no pan | start = end = `public/academy-art/cast/vee/neutral.webp` (approved cast picture; hands stay in the pockets) | none | 5 |

## Prompt (motion only, 31 words)
`Vee stands relaxed and breathes slowly, tilts his head very slightly, then returns to the starting pose. The camera stays steady.`
Style suffix (Academy, not the Playground storybook one): `Same 2D anime-style illustration, exactly the same character, face, hoodie and colours as the start image. Calm, slow, gentle motion. Steady camera. Silent: no sound, no speech, no text.`

## Safety and accuracy
Hands stay hidden (no finger risk); no props; no text; teen-appropriate; silent. Preflight (`npm run audit:video`) = OK to generate; one `warn` for "blinks", so blinking was removed from the prompt. Cost: shown by the estimate step before any spend; the clip is made only with `--go` after the estimate.

## Review (frame by frame, with the owner)
Face and hair identical to the neutral, no morphing; hoodie, zip, colours unchanged; hands still in pockets; head returns to the start pose (loops); no text or artefacts; silent. One failed item = reject, do not re-roll blindly.

## Owner approval
`ownerApproved` is `false` in `scripts/academy-clips.json` until the owner writes yes for row 1.
