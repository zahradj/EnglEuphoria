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

Order: recolour each NEUTRAL base first (edit of the old base), owner checks, then redo the 5 expressions as edits of the new base.
Canva rate limit: one picture, then ~25 min wait.

| Character | neutral v2 | happy v2 | curious v2 | surprised v2 | thinking v2 | concerned v2 |
|---|---|---|---|---|---|---|
| Ava | MAHXgPkDg5c | | | | | |
| Theo | | | | | | |
| Mia | | | | | | |

## Logo on the tee (owner, 2026-10-09: "do what's in white")

Use the WHITE round "e" emblem (`src/assets/logo-white.png`, 500x500 RGBA, mark bbox 59..440) as a small chest emblem on each character's tee.
Placed by script at repo-export time (exact pixels, not redrawn by Canva). The white mark needs a mid/dark tee to be visible:
Ava lavender OK, Mia cobalt OK, Theo deep indigo (changed from pale lilac), Vee's tee is still WHITE -> open question (darken Vee's tee = 6 extra pictures, or put the emblem on his purple hoodie).
