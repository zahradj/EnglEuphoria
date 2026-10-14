# Academy experience design — what is best for the student (expert decisions, 2026-10-14)

Owner (2026-10-14): "Be an expert of the Academy hub with all its rules and concepts and decide what is best for the student: context, environment, layout, everything. Use full scene plates in pages and in stories. I want creativity and fun, not repetition." (The last sentence of the owner's message was cut off; this page answers the whole brief.)
Sources: the Academy rules (CLAUDE.md, `academy-season-system`, `academy-player-ux`, `academy-game-ui`), the Academy blueprints (`src/curriculum/academy/`), a read-only survey of the Playground curriculum and lesson blueprints (`docs/playground-lesson-blueprint.md`, `docs/a1-playground-roadmap.md`, `lessonVariety.ts`), and the web research in `docs/research/academy-lesson-sequencing.md` and `academy-a1s03-v2-research.md`. Hub separation holds: ideas are re-implemented in Academy files, never imported; nothing childish (no mascots, pets, stickers, hearts).

## 1. Who the student is and what they feel
A 13-18-year-old, alone with one teacher on a screen, who already met hello and numbers at school and is afraid of looking silly. They stay if the hour feels like a **series they are in** (a story, a place, a crew), they leave if it feels like a worksheet or **the same thing again**. So every lesson must give: a reason to care (a story question), a new place to be, a win within 90 seconds, a real choice, one surprise, and an exit on a high. No public ranking, no lives, no countdown; a wrong answer is named back kindly.

## 2. The arc of one 60-minute lesson (adapted from the Playground's 22-slide skeleton)
| Moment | What the student feels | Design |
|---|---|---|
| Cold open (0-5) | "What happened?" | A story hook as a full scene plate or a phone message, not a form to fill in |
| Remember? (5-12) | "I know this" (a quick win) | Old language in a NEW mechanic and place (hunt, sort, chat), never the same game as before |
| The Drop (12-22) | "I'm inside the scene" | Story told as 3-5 full scene plates, then the scene becomes the game (Explore) |
| Notice & Build (22-32) | "Oh, I get the rule" | Model (I do) -> the rule stated in 3 lines -> two different games per word set |
| Energiser (32-36) | "My opinion counts" | Free practice with choice (Sort), zero stakes |
| Mission (36-48) | "I can do it" | Teacher model, Take 1, feedback, Take 2, in the story's place |
| Release (48-55) | "I made something" | A product (poster, voice note, card) the student owns |
| Wrap (55-60) | "I want the next episode" | Teach-back, can-do ticks, the next clue (a cliffhanger) |
Micro-wins at least every 90 seconds; at least two real choices that need the target language; one surprise after the words are taught; a calm break every 8-10 minutes; rewards only for using English.

## 3. Environment: full scene plates everywhere
- **Every page is a full-bleed scene plate** (a painted place), not a panel on a flat colour. The panel is glass and small; the place is the star.
- **Every story is a sequence of full scene plates** with the cast painted in (Canva, 16:9, cast references, ~35 % purple): 3-5 plates per story, one idea per plate, subtitles on the calm side, cross-fade only (never zoom or pan). Pictures come after a written scenario (`docs/scenarios/`).
- **A new place per lesson**: each lesson names its setting and look in a profile; the next lesson may not reuse them (fair at dusk, rooftop studio, night market, train platform, school roof, café…). A Season has a world with a signature palette and a recurring clue object (serial story), but each episode visits a new corner of it.
- **Time and weather change the mood** (dusk, rain, morning), so places never feel like the same room.

## 4. Layout (teens, laptop first)
Characters large and visible (never covered), the panel opposite the character, the strip and dock slim, the player always laid out left to right (lesson content is English). XP and combo as small pills; subtitles as film captions; one clear thing to do per screen; the comfort dock always there (hint, minute, easier, calm, sounds).

## 5. Variety is a gate, not a wish (adapted from the Playground's `lessonVariety.ts`)
Each Academy lesson registers a **profile**: settings (plates), look, story frame, signature game, game kinds. The deploy test fails when a lesson: repeats a setting or plate of the previous lesson, uses the same game kind three times in a row, has fewer than five distinct non-routine game kinds, or opens with the pattern the Season's first lessons used (badge-convo, brief card, who-said, border booth, padlock, find-the-wrong-line). Old lessons are listed as grandfathered until they are rebuilt.

## 6. What every lesson record carries (adapted from the Playground's per-lesson plans)
Objective ("I can…"), **signature game** (needs the new language to win), **fun hook** (a choice, a surprise, or the student-as-expert moment), **evidence** (what proves the can-do), **home mission**, story frame, setting. Source of truth is the plan; the deck follows the plan.

## 7. Adaptations from the Playground, ranked, and status
| # | Idea (Playground source) | Academy version | Status |
|---|---|---|---|
| 1 | Painted scene per slide with cross-fade (`PlayWelcomeTownLesson`) | Plate cross-fade, full-scene pages | Built (2026-10-14) |
| 2 | Gems/hearts HUD and sound effects | XP + combo pill, synthesized sound bank, no hearts | Built |
| 3 | Story films as stills with cross-fades (`make-stills-film.py`, `FlipbookScene`) | Story slide: full scene plates, subtitles, spoken lines | Built; E1 uses it |
| 4 | Signature game per lesson, funHook | Fields on the plan; E1: Explore (the fair is the game) | Plan data in A1 S3 |
| 5 | `LESSON_PROFILE` + variety gate | Academy profiles and gate | Built (A1 S3 and S1) |
| 6 | Research log with ≥3 sources and "better than" | Per-lesson research note (already required) | In place |
| 7 | Fog-of-war world map | Season path in the library (done / current / classified next) | Not built |
| 8 | Boss test and per-part 80 % result | Season checkpoint screen with per-skill bars and a retry pack | Not built |
| 9 | Collectible reward (stickers) | Season album of Word Cards (teen look) | Not built |
| 10 | Skinnable shell (quest skin) | Explorer 13-15 / Studio 16-18 token sets | Not built |
