# Academy Art Bible (DRAFT — not approved by the owner)

Method: `gs-art-bible` (Claude Code Game Studios, installed 2026-10-11 as `.claude/skills/gs-*`) applied to the Academy hub only. Existing rules still bind: Canva pictures only, no browser voice, no zoom or pan of stills, no emoji, no 3D-look pictures, teens 11–18, comfort first (`academy-game-ui`, `academy-player-ux`).
Nothing here is built until the owner approves it. Status of each section: DRAFT.

## 1. Visual identity statement

**One-line rule:** *"A cosy club after school: lilac accents, glowing violet magic, warm wood and green plants, and teens who look back at you."*
Supporting principles:
1. **Everything the student touches is an illustrated object, not a UI widget.** Chests, lockers, tickets, stamps, badges, keys are drawn pictures with a rim light and a contact shadow. CSS gradients are only a fallback.
2. **One light, one glow.** Warm window light from the upper right; violet magic glow marks what is interactive; gold marks reward. Nothing else glows.
3. **The cast is always alive** (breathes, blinks, reacts); the scene is calm (light and dust move, the picture never zooms or pans).

## 2. Mood and atmosphere by state

| State | Mood | Light | Energy |
|---|---|---|---|
| Arrival / title | warm welcome | golden window light, soft haze | gentle |
| Learn (teach, model) | curious, focused | clear daylight, dimmed edges | measured |
| Play (games) | playful tension, no pressure | scene dimmed 30%, violet glow on the play object | lively |
| Reward | joyful | gold burst, confetti, warm flash | peak, 1 s |
| Wrong try | calm, supportive | soft orange edge, no red, no shake of the scene | low |
| Wrap | proud, quiet | evening lilac | slow |

## 3. Shape language

- **Characters:** soft anime silhouettes, readable at thumbnail size; each cast member has one signature colour (Vee sky blue, Ava violet, Theo green, Mia orange) used on a prop or trim.
- **Objects:** fat rounded rectangles, thick dark-violet outline (4 px at 800 px), a bright top highlight, a flat darker underside. Corners never sharp.
- **UI:** the same grammar as objects — chunky pills and tickets, never thin outlined boxes.
- **Hero vs support:** the play object is 2× larger than anything around it and is the only thing with a glow.

## 4. Colour system — SUPERSEDED 2026-10-17: the owner removed the purple quota from picture prompts ("too much"). Pictures use a natural varied daylight palette; purple only on characters' own clothes, small props and the player UI. The table below is the old purple-led system, kept for history. (older note: 2026-10-11; changed 2026-10-15 to 25% (was 35% from 2026-10-12): "35% purple, in the background images and all generated images, from now on")

**Rule (supersedes the 60-70% purple rule of 2026-10-11):** about **25% of everything on screen is purple**, mixed with blue and warm, natural colours so the scenes are not one colour. It applies from now on to every background image and every generated image (Canva, Gemini). Skin and hair keep natural colours. The UI kit (ribbons, keys, buttons) stays violet; it is a small share of a scene.

| Role | Share | Colours |
|---|---|---|
| Purple | about 25% | lilac `#ede9fe`, violet `#8b5cf6`, royal `#6d28d9`, deep `#2e1065` |
| Blue / teal | 15-20% | sky `#7dd3fc`, azure `#38bdf8`, teal `#14b8a6`, indigo `#4f46e5` |
| Warm neutrals | 20-25% | cream `#fef3c7`, sand `#e7d5b3`, oak wood `#c8955b`, soft coral `#fda4af` |
| Greens | 5-10% | plants and leaves `#4ade80`, `#16a34a` |
| White / black | 5-10% | white for highlights and text on dark; near-black `#0b0720` for outlines and shadows |
| Accents | 3-5% total | gold `#fbbf24` reward, green `#4ade80` correct, orange `#fb923c` not-yet (never red) |

**Prompt line for every generated image (SUPERSEDED 2026-10-17, do not use):** "Colour balance: about 25% purple, mixed with blue/teal, warm cream and wood tones and green plants; not a monochrome purple room." Check the result by eye (purple should read as a third, not as the whole picture) before it is used.
**Existing pictures** made under the old 60-70% rule (the 9 scene plates and the cast clothes of the pending brand-colour pass) are restyled one at a time, each approved by the owner first.
Colour is never the only signal: right = tick + glow, not-yet = arrow + soft shake of the object, locked = padlock.

## 5. Character direction

Existing cast stays (Vee, Ava, Theo, Mia). To animate properly the owner must approve **one** route: (A) Canva-generated parts per character (head+hair, torso, each arm, mouth set, eye set); (B) a few extra full-body poses (point, count on fingers, thumbs up, shrug) per character plus the current head/body puppet. Route A gives real arm and mouth motion; B is cheaper. The Canva layer-split test (`MAHXqIseB6A`) was blocked by quota and is queued.

## 6. Environment direction

Each scene gets **three layers** so light can move between them without moving the picture: back plate (existing Canva), mid props (a few drawn objects the lesson uses), and a foreground frame (plant, table edge) that overlaps the cast. Animated light (rays, dust, window glints) sits on top. Scenes used: lobby, signup desk, locker hall, border control, detective wall, stage.

## 7. UI / HUD visual direction

- **HUD:** top-left task ribbon (illustrated banner), top-right counters (gold star gem, found/total), bottom: a row of round illustrated buttons (hint = lightbulb lamp, "I need a minute" = pause leaf, more = gear), Next = a glowing green arrow key.
- **Typography:** one rounded heavy display face for titles and numbers, one clean sans for sentences; A1 text ≤ 12 words per line.
- **Icons:** illustrated, filled, outlined in deep violet — the existing drawn `Icon` set is a placeholder to be redrawn in this style.
- **Animation feel (UI):** anticipation → overshoot → settle, 150–350 ms; squash on press; reward stack only on success; everything stops in Calm mode.

## 8. Asset standards

- Format WebP, transparent where needed; objects 512 px tall, cast 1200 px tall, plates 1920×1080; names `academy-art/<group>/<id>.webp`; ledger entry in `docs/academy-art-ledger.md`.
- Generator: Canva only (reference = approved picture). Video loops: Higgsfield only, owner-approved, one clip at a time.

## Asset list for the vertical slice (proposed, needs approval before any Canva order)

One slice, one lesson part, done properly: **"Locker Pop" + "Find the numbers" + the Check-in chat**.
1. UI kit sheet: ribbon banner, gold star gem, three round control buttons, green Next key, key buttons (violet / blue / orange), padlock, ticket.
2. Object sprites: open and closed locker (×5 colours), number cards 1–10, stamp, chest (closed / open), sparkle star.
3. Foreground frames for lobby and locker hall (plants, bench edge) so cast stand *behind* something.
4. Character route A or B (owner decides).

## Open decisions for the owner

1. Identity statement approved? (palette decided 2026-10-11, §4).
2. Character route A (parts) or B (extra poses) (§5).
3. Approve the asset list so Canva orders can start (one at a time, ledger entry each).
