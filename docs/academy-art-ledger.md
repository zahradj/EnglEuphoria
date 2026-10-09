# Academy cast art — ledger (Canva, owner-approved style 2026-10-08)

Pictures: Canva only. Style: semi-realistic illustration, black ink outlines, soft cel-shading, plain light-grey background,
one front-facing waist-up portrait per picture (3:4). Brand colours: purple / bluish-purple (owner, 2026-10-08).
Expressions are edits of each character's neutral base: happy, curious, surprised, thinking, concerned.
Canva rate-limits image generation ("quota_cooldown"): make ONE picture, wait ~20 min, retry.

| Character | neutral | happy | curious | surprised | thinking | concerned |
|---|---|---|---|---|---|---|
| Vee | MAHXdW0wNyY | MAHXdUGuoxM | MAHXdkQRIm4 (weak tilt, may redo) | MAHXdlzhwvw | MAHXdhihuTI | MAHXdvfubSE |
| Ava | MAHXdq0tQjs | MAHXd6yfO84 | MAHXdyOvQhs | MAHXeD4yFDk | MAHXeY49NZk | MAHXeRxpygM |
| Theo | MAHXeduj9U8 | MAHXenWsjKA | MAHXekG2UjU | MAHXevsFPks | MAHXe2rbkFk | MAHXe62oBDI |
| Mia | MAHXfPqxgrA | MAHXfMriuaU | MAHXfek-iZI | MAHXffmSLvk | MAHXfnXiPuE | MAHXfrn12Rs |

Not yet in the repo: export from Canva and fetch per `docs/canva-art-pipeline.md` to `cast/<name>/<expression>.webp`.

## Brand-colour pass (owner, 2026-10-09): clothes in shades of blue and purple

Vee is already purple (above). Ava, Theo and Mia keep face, hair, skin, glasses, pose and style; ONLY the clothes change:

| Character | New clothes |
|---|---|
| Ava | soft lavender-periwinkle tee (about #a78bfa) with the small indigo heart; jeans stay |
| Theo | cobalt-blue denim-style jacket (about #3b5bdb) over a deep indigo tee (about #4338ca) so the white logo shows |
| Mia | violet hoodie (about #7c3aed) over a cobalt-blue tee (about #2563eb); backpack straps stay dark |
| Vee (owner OK'd one redo, 2026-10-09) | keep the indigo-violet hoodie; the white tee becomes a deep blue (about #1e3a8a) so the white logo shows |

Order: recolour each NEUTRAL base first (edit of the old base), owner checks, then redo the 5 expressions as edits of the new base.
Canva rate limit: one picture, then ~25 min wait.

| Character | neutral v2 | happy v2 | curious v2 | surprised v2 | thinking v2 | concerned v2 |
|---|---|---|---|---|---|---|
| Ava | MAHXgPkDg5c | MAHXg3yFc5M | MAHXg5Bo_1Q | MAHXhOYN5Fo | MAHXhFhrXYQ | MAHXhXILyGA |
| Theo | MAHXgZZzylw | MAHXhTooCqc | MAHXhq0-K-A | MAHXiOXE3Lk | MAHXiKsyVeQ | MAHXibquoNA |
| Mia | MAHXgluvq5c | | | | | |
| Vee | MAHXgs-3g1I | | | | | |

## Logo on the tee: DROPPED (owner, 2026-10-09: "you can drop adding the logo")

No logo overlay will be added; the pictures are used as they are. (The darker tees and Ava's small chest heart stay as generated.)

Vee redo: owner approved ONE redo of Vee (darker tee). Base = edit of MAHXdW0wNyY (purple hoodie base); then his 5 expressions as edits of the new Vee base.

## Scenes and animation frames queue (owner, 2026-10-09: "generate animated images with the characters ... and generate scenes"; lesson screens too dark)

Canva makes stills only. Animation is done by the player from Canva stills (blink, talk, expression cross-fades, entrances, effects); no Canva motion and no new Higgsfield video without the video gate.

Order (one picture per ~25 min, Canva rate limit): 1) scenes, 2) the remaining v2 expressions, 3) animation frames, 4) vocabulary cards.

| Priority | Picture | Where it goes | Prompt notes | Canva media id |
|---|---|---|---|---|
| 1 | scene `classroom-morning` | `bg/classroom-morning.webp` | empty bright modern classroom, morning sun, window with skyline, whiteboard with abstract scribbles (no letters), desks, plant; purple/indigo/blue accents; no people, no text; landscape 3:2 with the centre kept open for characters | MAHXhjLIIDQ |
| 1 | scene `classroom-evening` | `bg/classroom-evening.webp` | same room, warm sunset light, still bright, not dark MAHXh-RWdNU (edit of the morning room) |
| 1 | scene `phone-profile-closeup` | `bg/phone-profile-closeup.webp` | giant phone with a plain profile screen (grey avatar, bars, no readable text), purple/blue glow, bright MAHXhzixLUw |
| 3 | `blink` per character (4) | `cast/<name>/blink.webp` | edit of the v2 NEUTRAL: eyes closed, everything else identical (used on neutral and happy only) | |
| 3 | `talk` per character (4) | `cast/<name>/talk.webp` | edit of the v2 NEUTRAL: mouth open mid-word, everything else identical | |
| 4 | 14 vocabulary cards | `cards/card-<word>.webp` | one friendly illustrated picture per word, same style | |

The player already uses `blink.webp` and `talk.webp` when present and falls back to the drawn placeholder animation when not.
