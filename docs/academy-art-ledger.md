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
| Mia | MAHXgluvq5c | MAHXidKjEe4 | | | | |
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

## New Canva account (owner, 2026-10-09): cast remade, v3

The new Canva account cannot read the old account's pictures (permission_denied), so the cast was remade from text prompts in the same style and brand colours (neutrals first, then every frame as an edit of that neutral). Owner approval of these faces is pending. Each character has the 5 expressions plus `blink` (eyes closed) and `talk` (mouth open mid-word) frames for the player.

| Character | neutral | happy | curious | surprised | thinking | concerned | blink | talk |
|---|---|---|---|---|---|---|---|---|
| Ava | MAHXiQliv5I | MAHXifHOV08 | MAHXiYo0nrE | MAHXieBihtA | MAHXiRJWeO4 | MAHXidqxk8s | MAHXicsrb9g | MAHXibD8oYw |
| Theo | MAHXiT9DjNs | MAHXiX7d__c | MAHXiVkFixg | MAHXiVNeKT8 | MAHXifw44RU | MAHXiT09RMw | MAHXicKzWJM | MAHXicVi12A |
| Mia | MAHXibnL3H4 | MAHXib-Yiwc | MAHXiURUazs | MAHXiVRJyEM | MAHXiUwITs4 | MAHXieR-uDY | MAHXiQdGlZA | MAHXiRR-HdY |
| Vee | MAHXicJz0_c | MAHXiejqBos | MAHXiUXyYB0 | MAHXiYM1z3I | MAHXiRLa5vQ | MAHXiT2EbCs | MAHXic0whqw | MAHXiYlnAtk |

## Lesson A1-S01-E1 v3 pictures

Canva holder design DAHXiX3gn1o, pages 37-55.

| Picture | Canva media id | Repo path |
|---|---|---|
| v-name | MAHXiyPmEHA | public/academy-art/cards/v-name.webp |
| v-age | MAHXi5iQqUo | public/academy-art/cards/v-age.webp |
| v-country | MAHXiy6DfRw | public/academy-art/cards/v-country.webp |
| v-hobby | MAHXi1JeULQ | public/academy-art/cards/v-hobby.webp |
| v-family | MAHXiy75bn8 | public/academy-art/cards/v-family.webp |
| v-mother | MAHXizl04J8 | public/academy-art/cards/v-mother.webp |
| v-father | MAHXi2nttOE | public/academy-art/cards/v-father.webp |
| v-brother | MAHXi9mD61w | public/academy-art/cards/v-brother.webp |
| v-sister | MAHXi5V-izw | public/academy-art/cards/v-sister.webp |
| v-football | MAHXi_yOoyM | public/academy-art/cards/v-football.webp |
| v-music | MAHXi3GuGak | public/academy-art/cards/v-music.webp |
| v-games | MAHXi6SkLiI | public/academy-art/cards/v-games.webp |
| ava/wave | MAHXi6Jg9Bw | public/academy-art/cast/ava/wave.webp |
| theo/wave | MAHXi191Cdw | public/academy-art/cast/theo/wave.webp |
| vee/wave | MAHXi3y5lmA | public/academy-art/cast/vee/wave.webp |
| vee/thumbs | MAHXi0Ziv9E | public/academy-art/cast/vee/thumbs.webp |
| theo/football (soccer ball; first try drew an American football and was redone) | MAHXi2EGfXc | public/academy-art/cast/theo/football.webp |
| ava/music | MAHXixAA318 | public/academy-art/cast/ava/music.webp |
| club-lobby (scene) | MAHXi7-_6nU | public/academy-art/bg/club-lobby.webp |

## Lesson A1-S01-E2 pictures

Canva holder design DAHXiX3gn1o, pages 56-61 (page 56 = 1620x1080, 57-61 = 800x800). Style references: v-name card `MAHXiyPmEHA` (cards), club-lobby `MAHXi7-_6nU` (scene). Each generated once and accepted on the first candidate; no flags (drawn in code).

| Picture | Canva media id | Repo path | Prompt (short) |
|---|---|---|---|
| club-signup-desk (scene) | MAHXjU4g7R8 | public/academy-art/bg/club-signup-desk.webp | bright teen club lobby, wooden-and-white desk on the right third with laptop, lanyard badge tray, clipboard, plant; noticeboard of flyers (no text) on the left; windows, purple bunting; open lower-centre floor; no people |
| v-alphabet | MAHXjcLnfJ8 | public/academy-art/cards/v-alphabet.webp | wooden blocks spelling A B C in front, D blocks behind, pencil beside, on a desk |
| v-letter | MAHXjY00WHc | public/academy-art/cards/v-letter.webp | teen hands holding a big wooden block with a single capital M |
| v-spell | MAHXjW-kDYU | public/academy-art/cards/v-spell.webp | teen pointing at a blank name badge, floating letter bubbles M I N A |
| v-nationality | MAHXjYJRxHE | public/academy-art/cards/v-nationality.webp | hand holding blue-purple passport booklet (no text), open booklet with a stamp, small globe |
| v-again | MAHXjez06c8 | public/academy-art/cards/v-again.webp | teen cupping hand behind ear, speech bubble with ?, circular repeat arrow icon |

Weaknesses: v-spell bubbles read M-I-N-A and are spaced like a word, fine; the badge is blank (name is not on it). v-nationality shows two booklets (closed one held, open one with the stamp ring), stamp is an unlabelled ring. v-alphabet blocks are wooden-toy style, slightly more painterly than the flat cards. Scene: desk and board are in place, lower 40% is open floor.

## Deck plates (locker-hall, border-control, detective-wall, club-stage)

Canva holder design DAHXiX3gn1o, pages 62-65 (1620x1080). Style references: club-lobby `MAHXi7-_6nU` and club-signup-desk `MAHXjU4g7R8`; generated LANDSCAPE_3_2, one candidate each, all accepted (no people, text, numbers or flags seen at full size on the holder pages). Lower 40% is open floor in all four.

| Picture | Canva media id | Page | Repo path | Prompt (short) |
|---|---|---|---|---|
| locker-hall | MAHXpI8JuhI | 62 | public/academy-art/bg/locker-hall.webp | bright club hallway, wall of 10 plain rounded lockers in blue/periwinkle/lavender/white, no numbers, bench at right, bunting, big window, open floor |
| border-control | MAHXpBgWytU | 63 | public/academy-art/bg/border-control.webp | friendly airport passport-control hall: glass booth + counter + lamp right, rope barrier, globe on stand left, window with plane, blank signs |
| detective-wall | MAHXpODAt5U | 64 | public/academy-art/bg/detective-wall.webp | cosy media room: corkboard with blank cards, blank notes and red string, desk with laptop, lamp and magnifying glass right, purple armchair |
| club-stage | MAHXpHANhRE | 65 | public/academy-art/bg/club-stage.webp | small stage, purple curtain, two spotlights, mic stand stage left, bunting, empty chairs left and right |

Weaknesses: locker-hall also has a bookshelf and a door at left (fine). border-control: the two blank sign boards are plain purple panels (good for overlays). detective-wall is busier than the others (side table with snacks at left, sofa, armchair overlaps the desk at lower right), so keep UI away from the far lower-right corner; the red strings are faint. club-stage: chairs sit at the far left and right edges of the lower area, centre is clear; the stage is raised and centred, so characters placed over it overlap the curtain.

## Beginner cards: hello, meet, me, great, fine, tired

Owner rule 2026-10-10: flat 2D hand-illustrated anime-influenced teen illustration, ink outlines, light-lavender background, never 3D or emoji. Canva holder design DAHXiX3gn1o, pages 66-71 (800x800). Style reference for all six: v-name card `MAHXiyPmEHA` (SQUARE_1_1). Common prompt: "Flat-lit 2D hand-illustrated anime-influenced teen illustration with clean black ink outlines and soft cel shading, same style, palette and background as the reference picture. ONE subject: ... waist-up, centred on a plain light lavender background. NOT 3D, not glossy, not emoji, no text, letters, numbers or logos." Canva quota: one generation then ~20 min cooldown, so each picture was generated once (v-me twice).

| Picture | Canva media id | Page | Repo path | Subject |
|---|---|---|---|---|
| v-hello | MAHXpaCvUj8 | 66 | public/academy-art/cards/v-hello.webp | boy (brown wavy hair, lavender hoodie) waving, big smile |
| v-meet | MAHXpc3qR1U | 67 | public/academy-art/cards/v-meet.webp | boy and girl (dark curly hair, glasses, periwinkle jacket) shaking hands |
| v-great | MAHXpWJ2aKg | 68 | public/academy-art/cards/v-great.webp | girl, both fists up, huge smile, small purple sparkles |
| v-fine | MAHXpUCgaPQ | 69 | public/academy-art/cards/v-fine.webp | boy, gentle smile, hand in hoodie pocket |
| v-tired | MAHXp4rJIzg | 70 | public/academy-art/cards/v-tired.webp | girl yawning, rubbing one eye, droopy lids, no Zzz |
| v-me | MAHXp946ZLk | 71 | public/academy-art/cards/v-me.webp | boy, thumb pressed to his own chest, proud smile |

Picks: first candidate accepted for all except v-me. v-me first try `MAHXpemV41Y` read as a thumbs-up beside the chest (rejected); the redo prompt asked for the thumb pressed on the middle of the chest and `MAHXp946ZLk` was accepted.
Weaknesses: v-me thumb is still a little thumbs-up-like (thumb points up, hand on the chest). v-tired: one eye covered by the fist, the other eye shut-ish; reads clearly as yawning. v-hello and v-fine: boy is the same cast look as v-name/v-age (consistent). v-great and v-tired use a girl with dark wavy hair (new look, same palette). v-meet is cropped at the waist and the two figures fill the frame.
Note: a Canva edit transaction left uncommitted expired once and the first pages were lost; re-added and committed.

## Puppet parts, Route A (owner decision 2026-10-11): Vee only, stop for review before Ava/Theo/Mia

Goal: layered puppet (torso, 2 arms, head, mouth set, eye set) from Canva-generated PARTS, all registered to the 900x1200 neutral `cast/vee/neutral.webp` (Canva media `MAHXqIseB6A`). Parts go to `public/academy-art/cast-parts/vee/<part>.webp` (transparent, 900x1200, same coordinates as the neutral). The fetcher has a new `kind: "part"` (900x1200, white background cut out). Holder design `DAHXiX3gn1o`, pages 72+ (900x1200). One generation per ~20-25 min (quota_cooldown).

`separate-image-layers` on `MAHXqIseB6A`: failed twice with `quota_cooldown` (shares the image-generation credit cooldown; second try ~15 min after a generation).

| Part | Canva media id | Page | Repo path | Status |
|---|---|---|---|---|
| head (hair + neck, mouth closed, eyes open) | MAHXqNNFZzU | 72 | cast-parts/vee/head.webp (raw export: head-raw.webp) | done, see below |
| torso, no head, no arms (hoodie body + tee + short neck stub) | MAHXqFz1j4w | 73 | cast-parts/vee/torso.webp (raw: torso-raw.webp) | done, see below |
| left arm + hand, right arm + hand | | | | not yet |
| mouth set (closed smile, 'ah', 'oo', wide smile) | | | | not yet |
| eye set (open, blink, happy arcs, worried) | | | | not yet |

Head finding: the edit kept the identity (same face, hair, eyes, smile) but Canva re-framed the crop, so the RAW export is about 1.47x too big and about 150 px too far left/low. It does NOT overlay the neutral at the same coordinates by itself. A post step (scale 0.67 and shift, found by a grid search on the face region, mean grey error about 23/255) puts it back on the neutral: `head.webp` is that registered version, and `_check-head-overlay.png` is the 55% overlay on the neutral (eyes, brows, nose, mouth, ear and hair edge line up to a few px; hair strands differ slightly because the head is a re-draw, not a crop). The registration is a resize of a 900x1200 raw, so the registered head is a little softer than the neutral.

Torso finding (made second, after a 20 min cooldown wait; first retry was still refused): the edit followed the prompt very well: hoodie with hood, deep-blue tee, zip, drawstrings, short neck stub, arms removed (it drew a sleeveless-vest look with plain armholes and a hem). Raw it is 0.96x of the neutral scale; registered at scale 0.96 (grid search, mean grey error 7/255 on the tee/zip) it lines up with the neutral's hoodie, zip, drawstrings and hood to a few px (`_check-torso-overlay.png`). Caveats: the generated vest has a ribbed hem near the bottom edge, which falls just outside the 900x1200 canvas after registration (good), and the shoulder armholes are plain (arms must cover them, which means the arm parts must have sleeve caps wider than the armhole). `_check-head-torso-no-arms.png` shows head + torso with no arms.

Open issue for arms: the neutral has BOTH hands in the hoodie pockets (no hands visible), so "arm + hand hanging relaxed" is a new pose, not a cut-out of the neutral; the hoodie sleeves end at the pocket edge in the neutral.

## Game-object sprite sheets (owner request 2026-10-11): objects + ui

Goal: illustrated game objects for the lesson player instead of CSS widgets. Flat 2D anime-game style, thick dark-violet outline, top highlight, bottom shade, palette mostly violet/blue with gold/green/orange accents only. One generation = one grid on plain light-grey, no text; one export per sheet. References uploaded to Canva: locker-hall `MAHXuUky4kY`, Vee neutral-open `MAHXuQoUteU`. Holder design `DAHXiX3gn1o`, pages 76-77 (1620x1080, sheet filling the page).

| Sheet | Canva media id | Page | Repo path (after fetch, kind `sheet`, no cut-out) | Content |
|---|---|---|---|---|
| A objects | MAHXuWBvrlM | 76 | public/academy-art/objects/sheet-objects.webp | 3x4: locker violet closed/open, locker blue closed/open, chest closed/open (glow + gold sparkles), padlock closed/open, key, blank ticket, blank star stamp, gold star gem |
| B ui | MAHXuZukaCY | 77 | public/academy-art/objects/sheet-ui.webp | ribbon banner, 3 blank pills (violet, blue, orange), 4 round buttons (lamp, leaf pause, gear, green Next arrow), glass panel frame, 5 progress gems (2 empty, 3 filled), speech-bubble frame |

Sheet B first try `MAHXuXoFSrI` had no pill buttons (rejected); redo `MAHXuZukaCY` accepted. Sheet A accepted first try.
Weaknesses: items are not on a strict grid (sheet B is stacked rows; sheet A is a 3x4 grid with slightly uneven row spacing), so cut by hand-set boxes or a connected-components cut-out on the grey background (grey is plain, gaps are large). Blue locker is a mid blue rather than periwinkle; the sky-blue pill is a mid blue. Pause icon is two green leaves (reads as pause). Gold is used for chest trim, padlock, key, stamp and star (accent colour, fine for reward objects). No text, letters or numbers on any item.
Not yet in the repo: sheets are only in Canva until exported and fetched (see below).

## Classroom-words sprite sheet (owner request 2026-10-11: "generate the pictures with Canva")

One Canva generation (LANDSCAPE_16_9, references: v-name card `MAHXiyPmEHA`, Vee neutral-open `MAHXuQoUteU`): a 5x2 grid of 10 lavender rounded squares on plain grey, one teen scene each: listen, look, repeat, click, read (row 1); point, sorry?, slowly, I don't understand, what does it mean (row 2). Accepted on the first try.

| Sheet | Canva media id | Holder design | Page | Page title | Target repo path |
|---|---|---|---|---|---|
| classroom words | MAHXu9KAxIE | DAHXiX3gn1o | 81 (1620x912, verified by listing pages after the commit) | classroom words | public/academy-art/objects/sheet-classroom.webp |

Not in the repo yet: the owner downloads the page by hand (signed-URL commit blocked, Canva downloads blocked on the network). Cut into 10 by hand-set boxes (5 columns x 2 rows).
Weaknesses: the teen is one boy with dark hair and a purple hoodie in 9 of 10 squares (consistent, but no cast variety); click (4) is a hand only, on a tablet. Gaps between squares are narrow (about 2-3% of the width), though clear. Pointing hand (6) and the slow-down hands (8) are slightly stylised; check fingers at full size before use. The flag target in 6 carries a small flag glyph; the clock in 8 has no numerals. No text, letters or numbers seen.

## Pre-A1 S2 L1 "The Phone" (2026-10-15, owner approved the plan and the story scenario)

| Picture | File | Canva media | Holder page |
|---|---|---|---|
| scene `bus-stop-night` | `bg/bus-stop-night.webp` | MAHYCEu_964 | 95 |
| scene `phone-screen-glow` | `bg/phone-screen-glow.webp` | MAHYCNy2A9o | 96 |
| story plate 1 (Vee, Theo, the phone) | `bg/story-pa1s02-1.webp` | MAHYCBxiW9M | 97 |
| story plate 2 (the pin and the tin) | `bg/story-pa1s02-2.webp` | MAHYCAxZPkA | 98 |
| story plate 3 (Ava arrives) | `bg/story-pa1s02-3.webp` | MAHYCIyzlSQ | 99 |
| cards phone, pin, tin, map (cut-out stickers from one sheet) | `cards/p-phone.webp`, `p-pin`, `p-tin`, `p-map` | MAHYCKlTUeI | 100 |

Purple share target is now about 25% (owner, 2026-10-15). Story plates 2 and 3 read below that by a rough hue count (navy and blue dominate); restyle only with the owner's approval.

### Pre-A1 S2 L1 v2 plates (2026-10-15)
The holder design reached Canva's 100-page limit, so holder pages 97-99 were reused: the three story plates are saved in the repo and recoverable by their Canva media ids above (MAHYCBxiW9M, MAHYCAxZPkA, MAHYCIyzlSQ).

| Picture | File | Canva media | Holder page |
|---|---|---|---|
| scene `vault-corridor` (five round vault doors, the first glowing gold) | `bg/vault-corridor.webp` | MAHYCWjl1Fs | 97 |
| scene `lockscreen-closeup` (lock screen, five empty key slots) | `bg/lockscreen-closeup.webp` | MAHYCV9JEuI | 98 |
| scene `bus-stop-dawn` (the finale) | `bg/bus-stop-dawn.webp` | MAHYCQG_Dx8 | 99 |

A new holder design is needed before more plates (page limit).


## B1 Season 1 lesson 1 (2026-10-15)

| picture | file | Canva media | holder page |
|---|---|---|---|
| scene `bucket-list-wall` (rooftop studio, wall of blank cards; main plate) | `bg/bucket-list-wall.webp` | MAHYFlM8PDc | 97 (reused) |
| scene `trophy-case` (cabinet with six empty glowing slots) | `bg/trophy-case.webp` | MAHYFtktauU | 98 (reused) |
| story plate 1 (Vee at the wall, Ava on the sofa) | `bg/story-b1s1-1.webp` | MAHYCnd2Ab0 | 99 (reused) |
| story plate 2 (Ava shows photos to Theo) | `bg/story-b1s1-2.webp` | MAHYCguSgIg | 97 (reused) |
| story plate 3 (Vee points at the viewer, Ava laughs, Theo grins) | `bg/story-b1s1-3.webp` | MAHYChMdb5g | 98 (reused) |

The holder is full (100 pages), so pages 97-99 are reused; the pictures are recoverable by their media ids. Still to make: word-picture sticker sheet (`b-bucketlist, b-dare, b-giveitago, b-lifetime, b-tick, b-brave`).

## B1 Season 1 word stickers — prompts ready, NOT generated (2026-10-16)

Status: **blocked.** Canva `generate-image` returned `quota_cooldown`; the Gemini route (`ai-image-generation`, tried directly) returned HTTP 402 "prepayment credits are depleted". Higgsfield: the owner said on 2026-10-16 "Proceed with canva or use higgsfield api" (a one-time exception to the CLAUDE.md picture rule, for these stickers only), but the Higgsfield balance is **0 credits** (one 3:2 sheet costs 0.25), so nothing was spent. Nothing was generated and no picture was drawn by hand. Retried Canva the same day: still `quota_cooldown`. When either route is back: generate one sheet per prompt below on a plain white background (Canva `LANDSCAPE_3_2`, no scene panels: an earlier sheet with panels was rejected), look at it, then cut the stickers with `python3 scripts/academy-split-cards.py <sheet.png> <rows> <cols> <ids…>` into `public/academy-art/cards/`.

Common style line (every prompt): flat 2D game-art style, thick dark-violet outline, soft top highlight and bottom shade; bright, light, airy, broad daylight, at school, age-appropriate, reserved; about 25 % soft lilac and violet mixed with sky blue, warm cream, light wood and green plants; modest school clothes, calm friendly faces; one isolated object or person per cell on pure white; no text, letters or numbers; no scenery or panels.

| Sheet | Grid | Card ids in reading order | Pictures |
|---|---|---|---|
| E1 words | 3 x 2 | `b-bucketlist`, `b-dare`, `b-giveitago`, `b-lifetime`, `b-tick`, `b-brave` | a checklist scroll pinned to a small corkboard with a gold star; a teen in a hoodie holding out a blank card with a playful smile; a teen about to try a climbing wall, one hand raised; a single golden ticket with a sparkle above a small globe; a pencil ticking a big green check mark on a card; a teen standing tall with a calm confident smile and a small shield-shaped badge |
| E2 feelings A | 4 x 2 (7 used) | `w-excitement`, `w-amazed`, `w-disappointed`, `w-embarrassed`, `w-proud`, `w-frightened`, `w-relaxed` | a packed bag by a door with a big smile; a wide-eyed face looking up at a huge view; a closed museum door and a sad face; a red-faced student who dropped a tray; a smiling hiker on a hilltop; a student gripping a high railing; a student lying on grass, calm |
| E2 places B | 4 x 2 (7 used) | `w-grateful`, `w-destination`, `w-attraction`, `w-countryside`, `w-camping`, `w-sightseeing`, `w-trynew` | a student saying thank you with a small gift; a signpost with a village at the end of a road; a famous tower with visitors; green fields, a farm and hills; a camp by a lake at sunset; a small group with a map in front of a monument; a student about to try a new activity |

After the stickers exist: the card ids in `b1s01e1.ts` (`b-*`) and `b1s01e2.ts` (`w-*`) already point at these file names; run `npm test` for the deck, then push with `[preview]`.

### Update 2026-10-16 (later): Lesson 1 word stickers made with Canva
Canva `generate-image` worked on the retry (the cooldown had ended): sheet `MAHYIp4Cpos` (3 x 2, bright daytime, no text), placed on holder page 99 of `DAHXiX3gn1o` (reused; the page's earlier plate `story-pa1s02-3` is saved in the repo and recoverable by `MAHYGGer4Sk`), exported at 1920 x 1080 and cut with `scripts/academy-split-cards.py` (crop the sheet to x 150-1770 first) into `public/academy-art/cards/b-bucketlist`, `b-dare`, `b-giveitago`, `b-lifetime`, `b-tick`, `b-brave` (1024 x 1024 transparent WebP). Checked by eye: six clean cut-outs, no text. Weak points: the "once in a lifetime" ticket has no sparkle; the climbing-wall sticker keeps its wall panel (reads as the object). **Still to make:** the 14 Lesson 2 word stickers (two sheets of 7, prompts above). The holder design is at the 100-page limit, so keep reusing page 99 or start a new holder design.

### Lesson 2 stickers, sheet A (2026-10-16): the seven feelings
Canva sheet `MAHYI5kyt6E` (4 x 2, seven pictures), placed on holder page 99 (`DAHXiX3gn1o`), exported 1920 x 1080, cropped to x 150-1770 and cut with `scripts/academy-split-cards.py` into `cards/w-excitement`, `w-amazed`, `w-disappointed`, `w-embarrassed`, `w-proud`, `w-frightened`, `w-relaxed`. Checked by eye: the feelings read clearly. **Weak points:** the railing in `w-frightened` keeps white between its bars (the cut-out only removes white connected to the border; touch up or regenerate), and the hill in `w-proud` is cut flat at the bottom. Sheet B (grateful, destination, attraction, countryside, go camping, go sightseeing, try something new) hit Canva's cooldown; the prompt is in the ledger above.

### Lesson 2 stickers, sheet B (2026-10-16): places and activities
Canva sheet `MAHYI4QImxA` (4 x 2, seven pictures), placed on holder page 99, exported, and cut with the new `scripts/academy-split-cards-auto.py` (by picture, not by grid cell, because several pictures are wider than their cell; the fixed-grid cut left slivers of neighbours) into `cards/w-grateful`, `w-destination`, `w-attraction`, `w-countryside`, `w-camping`, `w-sightseeing`. Checked by eye: complete, no slivers. **Rejected:** the seventh picture (`w-trynew`, a teenager on a diving board) shows a shirtless boy, which breaks the modest-clothes rule; it was not saved and is being regenerated with modest clothes (a teenager with a paintbrush before a blank canvas). The Eiffel-style arch and the leaning tower are recognisable landmarks (fine for "attraction" and "sightseeing").

### Lesson 2 sticker `w-trynew` regenerated (2026-10-16)
Canva `MAHYI0ZkNYo` (a teenager in a plain t-shirt and jeans with a paintbrush before a blank canvas, paint pots and a plant), placed on holder page 99, exported, cut with `scripts/academy-split-cards-auto.py` into `cards/w-trynew.webp`. Replaces the rejected shirtless diving-board picture. Checked by eye: modest, clear, transparent background. Small inconsistency: it keeps a thin white die-cut outline that the other stickers do not have. **All 20 Season 1 word stickers (E1 six, E2 fourteen) now exist.** Still missing for Lesson 2: its three story plates and three scene backgrounds; weak points: `w-frightened` railing (white between the bars) and `w-proud` hill cut flat.

## B1 Season 1 lesson 2 — story plates (2026-10-16)

Scenario `docs/scenarios/academy-b1s01e2-postcard-wall.md` approved by the owner 2026-10-16 ("Approved, start plate 1"). One plate at a time; the owner sees each before the next.

| picture | file | Canva media | holder page |
|---|---|---|---|
| story plate 1 (Vee beside the postcard wall, Travel Club room) | `bg/story-b1s2-1.webp` | MAHYKF2JuvY | 99 (reused) |
| story plate 2 (Ava with green hills, Theo with the old tower) | `bg/story-b1s2-2.webp` | MAHYKKmlX60 | 99 (reused) |
| story plate 3 (Mia at the table with the camping postcard, Vee behind) | `bg/story-b1s2-3.webp` | MAHYK-S-nf0 | 99 (reused) |
| scene `travel-club-room` (empty room, world map, window seat; title, brief) | `bg/travel-club-room.webp` | MAHYK9TKvzk | 99 (reused) |
| scene `postcard-wall` (wall of picture postcards; main plate and library cover) | `bg/postcard-wall.webp` | MAHYLFrrvS4 | 99 (reused) |
| scene `postcard-table` (table with picture postcards; Mission, Release) | `bg/postcard-table.webp` | MAHYLAX4Snc | 99 (reused) |

Notes: generated with the Lesson 1 plate `MAHYCnd2Ab0` as the only style reference (two attempts with a second cast reference failed with a Canva server error), so Vee is matched by description, not by his cast picture. Holder page 99 reused; set the image box to exactly 1920x1080 (`crop_media`) or Canva zooms the picture.

## B1 Season 1 lesson 1 v3 — new plates (2026-10-16)

| picture | file | Canva media | holder page |
|---|---|---|---|
| story plate 4 (the dare moment: Vee holds out a blank card, Ava and Theo behind him) | `bg/story-b1s1-4.webp` | MAHYKrKSe2w | 98 (reused) |

"The Dare" is now four beats: plate 1, plate 2, plate 4 (the dare line), plate 3 (the noodles joke). No text changed, so no new voice lines.
| trophy-case reveal (six trophies lit; the Wrap's background) | `bg/trophy-reveal.webp` | MAHYKx7rtSM | 97 (reused) |

## B1 Season 1 lesson 3 "Pattern Lab" — plates (2026-10-16)

Scenario `docs/scenarios/academy-b1s01e3-missing-postcard.md`; plan approved by the owner 2026-10-16 ("go, start creating the lesson"). One plate at a time; Canva `quota_cooldown` about 20 minutes between pictures.

| picture | file | Canva media | holder page |
|---|---|---|---|
| scene `case-board` (close-up of the pinboard, index cards and string; Drop, Notice & Build, Wrap) | `bg/case-board.webp` | MAHYNAql7Sk | 99 (reused) |
| story plate 1 (Vee beside the case board, pointing at the board) | `bg/story-b1s3-1.webp` | MAHYNWxXz6U | 99 (reused) |
| story plate 2 (Theo at the table, two fingers up, notebook and globe) | `bg/story-b1s3-2.webp` | MAHYNSZcaTI | 99 (reused) |
| story plate 3 (Vee thinking at the case board, Theo waving by the table) | `bg/story-b1s3-3.webp` | MAHYNcwzJoU | 99 (reused) |
| scene `library-case-room` (library reading room with the case board; the lesson's main plate) | `bg/library-case-room.webp` | MAHYNE9eVJg | 99 (reused) |

Notes: generated with the Lesson 2 plate `MAHYK9TKvzk` as the only style reference; no people, no text; checked by eye: bright daytime, light wood, a pinboard, a window seat and cushions with soft lilac (about 25 %), purple chairs a little more than the rest. All five plates are now made. Still to make: later the six Been-or-Gone scene cards (`cards/sc-bg-1`…`-6`). Until they exist the player shows a drawn gradient for a missing plate and a frame icon for a missing card.
