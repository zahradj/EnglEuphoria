# EnglEuphoria — project rules

## Age bands (owner, 2026-10-12)

- **Playground: ages 4–12. Academy: ages 13–18.** An Academy student has already met hello, numbers and countries at school, so A1 lessons revise fast and spend the time on what school did not teach; they are never childish.

## Hub separation (hard rule — owner, 2026-10-08)

- The **Playground, Academy and Success each own their own curriculum blueprint, lesson blueprint, skills and docs.** Never edit, import or reuse another hub's.
- Academy work lives only in `src/curriculum/academy/`, `.claude/skills/academy-*`, `docs/academy-*` (see `docs/hub-separation.md`). Do not touch the Playground, and do not read or change the legacy Academy rows in the database.

## Academy pictures are light, daytime, school, reserved (hard rule — owner, 2026-10-15)

- "Regenerate the background images, make them light, not very dark; at school, during the day; all images age-appropriate and reserved." Every Academy background and story picture: **bright daytime school** (classroom, corridor, club room, library), big sunny windows, light wood, natural varied colour (no purple quota, see the colour rule below); no night, dusk, neon or gloomy scenes; modest school clothes; calm, reserved actions. Put "bright, light, airy, broad daylight, at school, age-appropriate, reserved" in every picture prompt. Existing dark plates are replaced one at a time. Details: `.claude/skills/academy-game-ui`.

## Art check and quality check on every picture (hard rule — owner, 2026-10-17)

- "Same as the Playground, there should be art check and quality check. Make sure all generated images are compatible with the content, every limb is well generated, and no strange or bizarre things." Every picture a lesson shows (plates, story plates, cards, cast) is **looked at, zoomed on hands, faces, feet and held objects**, compared with the cast references (same person on every plate), and matched to the lesson content, BEFORE the lesson ships. Anything with a wrong limb, extra or missing finger, melted object, odd text, or a character that changed face/hair/skin is regenerated (one picture at a time, owner sees it first) — never shipped "because it is close".
- Record every review in `src/academy-player-v2/artReview.ts` (content note, anatomy ok/redo, cast consistent/inconsistent, date). `npx tsx scripts/academy-art-sheet.mjs <lesson id>` lists the pictures and builds a contact sheet to look at. `artReview.test.ts` (deploy gate) fails for a lesson that uses a missing, unreviewed or `redo` picture, or a comic plate that is not 16:9. `academy-quality-gate` check 13.

## Voice (hard rule)

- **Never use the browser's built-in text-to-speech** (`window.speechSynthesis`, `SpeechSynthesisUtterance`) for anything a student or teacher hears — not in the app, not in prototypes or mock-ups, not as a fallback. Device voices have the wrong accent and were rejected by the product owner.
- Speak through `speak()` in `src/content/playground-library/unit1/audio.ts` (recorded character voices: pre-made clips in `public/audio-cache/`, then the server-cached `elevenlabs-tts` edge function).
- If a clip can't be loaded, stay silent — never switch to another voice.
- `src/lib/noBrowserVoice.ts` (installed in `src/main.tsx`) reroutes any leftover `speechSynthesis` call to the recorded voices. Don't remove it.
- Mock-ups/artifacts that need audio must embed recorded clips (e.g. files from `public/audio-cache/`, baked with `scripts/generate-voice-cache.mjs`), never browser TTS.

## Voice quality (hard rule, all hubs)

- **No accent, accurate pronunciation.** Every voice a student or teacher hears must be a standard native American English voice, saying each word correctly.
- Policy lives in `src/lib/speechPolicy.ts` (mirrored byte-identically in `supabase/functions/_shared/speechPolicy.ts`): approved voices, `approvedVoiceId()`, `normalizeForSpeech()`, `safeVoiceSettings()`, `languageLock()`.
- Any new TTS call, edge function, catalog voice or bake script MUST use it; `voicePolicy.test.ts` (deploy gate) fails otherwise. Audit: `npx tsx scripts/generate-voice-cache.mjs --audit`. See the Voice engine in `.claude/skills/lesson-quality-gate`.

## Video generation (hard rule — it costs money and is for children)

- **Never order a generated video (Veo/Gemini, Higgsfield/Seedance, FAL) before the gate passes.** Follow `.claude/skills/video-quality-gate`: brief in `videoBriefs.ts` -> `npm run audit:video` clean -> user-approved start image -> **ONE clip only** -> frame-by-frame review with the user -> only then more clips.
- **Strict mode (owner, 2026-10-04):** no story clip is ordered until its written storyboard row (exact line → ONE matching action → prompt, ≤ 5 s) is approved by the owner in writing (`ownerApproved`); `scripts/check-storyboard.mjs` must say READY; one clip per run. Any mismatch wastes credits — be strict. Accuracy method (research 2026-10-04): each clip goes between two owner-approved Canva key pictures (`image` → `endImage`, made as edits of one base picture and overlay-checked), and every clip is screened with `scripts/review-clip.py` before the frame-by-frame review.
- Image-to-video only, calm ambient motion, cartoon cast only, silent (no speech/text), <= 8 s, conservative and child-safe. `lintVideoPrompt` in `src/lib/videoPolicy.ts` is enforced server-side; do not bypass it.
- Higgsfield credentials: only in `scripts/higgsfield/.env.local` (git-ignored), entered by the user locally. Never ask for them in chat, never read, print or commit them.
- **Games: background loops only** (owner, 2026-10-04: games should feel like an animated video game). A game may use a short, silent, calm image-to-video loop of a game picture the owner has seen (`bgVideo`, ping-ponged by `scripts/make-game-loops.py`, still picture as fallback). Never characters doing new actions, never speech or text. Everything else in a game is live UI motion (`unit1/scene-components/gameFx.tsx`).
- **Never zoom or pan a still picture** (no Ken Burns / `zoompan` / CSS scale loops on story pictures): it shakes. Stills hold still and cross-fade (`scripts/make-stills-film.py`).

## Scenario first (hard rule — owner, 2026-10-04)

- **Every video** (story film, demonstration, song video, stills film, AI clip) starts with a written scenario in `docs/scenarios/` following `.claude/skills/kids-video-scenario`: one learning goal, beats, a shot list (exact line → ONE action → camera → start/end picture → label → pause), pictures needed, cost. The owner approves it in writing before any picture is made or clip ordered. A film that teaches comes BEFORE the game that uses it.

## Demonstration pages (hard rule — owner, 2026-10-04: "way better, keep it as a skill")

- Every "watch and copy" page (body parts, actions, TPR, point-to) follows `.claude/skills/kids-demo-video`: ONE character, full body, front view, one picture per spoken line, the word added by us with a line to the exact spot (`scripts/label-video.py`), stills film first; AI motion only via strict mode with start + end key pictures.

## Lesson hand-off — every finished lesson goes to the Playground Library (hard rule — owner, 2026-10-04)

- When a lesson is built or rebuilt, before reporting it done:
  1. Its `curriculum_lessons` row (Supabase, `ai_metadata->>'hub' = 'playground'`, unit/lesson number) gets the real title (no "· Coming Soon") and `ai_metadata.contentFormat = 'lep1-rich'`, so the content-creator Playground Library shows it as **▶ Ready**. Keep `is_published = false` until the branch is merged into `main` (students must not reach a page the live site doesn't have yet).
  2. Push with `[preview]` in the commit message (one preview build of the work branch, see `scripts/vercel-ignore.sh`).
  3. Give the owner the preview links: `<preview>/playground-library` (the library) and `<preview>/playground-scene/unit-<U>-lesson-<L>` (the lesson).

## Media generators (hard rule — owner, 2026-10-04)

- **Pictures: Canva only** (Canva `generate-image`, reference images uploaded to Canva for character consistency; `remove-background` for stickers). **Never generate pictures with Higgsfield** — not backgrounds, not stickers, not "just this once".
- **Gemini is allowed for pictures too** (owner, 2026-10-06: "yes, enable Gemini for picture"): the platform's `ai-image-generation` function through `scripts/art-targets.json` + `.github/workflows/bake-art.yml`, with an approved picture as the reference for character consistency. Still never Higgsfield for pictures.
- **Videos: Higgsfield (AI image-to-video) or Canva (owner, 2026-10-11: "yes" — Canva GIF and MP4).** Higgsfield for AI motion clips (story clips, game background loops — image-to-video from a Canva/approved picture). Canva for animated GIF/MP4 made from our own approved Canva pictures (flip-book of poses, word cards popping in, picture-to-picture sequences): build the frames as pages of a Canva design and export `gif` or `mp4` (`export-design`), then fetch through the art bot like any picture.
- **Canva GIFs/videos follow the scenario rule too** (owner, 2026-10-11): write the scenario (`docs/scenarios/`), and where possible show it to the owner as a quick preview GIF (the animatic) before it goes into a lesson; nothing ships without the owner's OK. No zoom/pan on stills, no on-picture text except our labels.
- **No purple quota in pictures** (owner, 2026-10-17: "remove the purple colour focus in image generators, it's too much"; replaces the 25 % / 35 % / 60-70 % purple rules of 2026-10-11 to 10-15). Do NOT put a purple share in any picture prompt. Scenes use a natural, varied daylight palette (warm cream, oak wood, sky blue and teal, green plants, a few warm accents); purple appears only where it belongs to a character (the cast's own clothes from the references) or a small prop, never as wall panels, floors and furniture by default. Purple stays the colour of the player UI. Details: `docs/academy-art-bible.md` §4. Existing pictures stay unless the owner asks; new and regenerated ones follow this rule.
- `scripts/generate-art.mjs` refuses the Higgsfield image path; the `higgsfield-video` edge function only allows video endpoints.
- How to get a Canva picture into the repo (holder design, export, fetch bot): `docs/canva-art-pipeline.md`.
- **No white backgrounds on pictures — everything is a cut-out sticker** (owner, 2026-10-12: "images without white background like stickers, it's the rule"). Every object, character and pose a child sees (items, characters, GIF/animation frames) has a transparent background: stickers via `scripts/split-sticker-sheet.py` / `cutout-stickers.py`, animated loops as cut-out animated WebP (white removed frame by frame, `public/lep1/gifs/*.webp`), never a picture sitting in a white box. Full scene backgrounds are the only pictures that fill their frame.

## Vary every lesson — research, then beat the best apps (hard rule — owner, 2026-10-04)

- Every new lesson: research >= 3 benchmarks (Khan Academy Kids, Lingokids, LingoAce, VIPKid, Novakid, Duolingo ABC, Oxford, Cambridge, Wordwall...) for its skill, take the mechanic (never content), make it better, and add or upgrade >= 1 mechanic.
- Vary activities, look, scenes (settings) and themes (story frame) from the previous lesson and from the same slot of the previous unit. Follow `.claude/skills/lesson-variety-engine`; register `LESSON_PROFILE` + `RESEARCH_LOG` in `src/content/playground-library/lessonVariety.ts`. `lessonVariety.test.ts` (deploy gate) fails otherwise — fix the lesson, never the check.

## Remember? warm-up (hard rule — owner, 2026-10-07)

- Universal: Pre-A1 and the A1/A2 worlds (Welcome Town, Magic Castle, Jungle), one shared component `src/content/playground-library/RecallWarmupScene.tsx`; blueprint §3f, quality gate check.
- Every Playground lesson after the very first opens (right after the title / hello song) with ONE `recall-warmup` scene: a quick "Remember?" of the lesson before, 3-5 of its words with their pictures, Pip says each word and the child finds it — no reading.
- Vary the look: `mode: 'click'` (listen and click, three pictures) for colours and scene pictures; `mode: 'shadow'` (listen and match the shadow) only for sticker pictures with clearly different outlines.
- `recallWarmup.test.ts` (deploy gate) fails if a lesson has none. It is a routine scene, not one of the lesson's games.

## Lesson song placement (hard rule — owner, 2026-10-10)

- The lesson's own song is **not** at the start of a Playground lesson. Order: title → Remember? warm-up → intro → (story) → the words (listen and say) → a first practice game → **the song** → more games. The child sings words they already know. (The shared hello/goodbye songs are not lesson songs.)

## Academy lessons — how every one is created (hard rule — owner, 2026-10-09)

Whenever the owner says "create a lesson" / "proceed with creating the lesson", or whenever you create or rebuild an Academy lesson:

1. **Start from the Academy blueprints**, never from memory: the roadmap/curriculum blueprint (`src/curriculum/academy/levels/`, `types.ts`) and the lesson blueprint (`buildLessonBlueprint` / `ACADEMY_LESSON_BLUEPRINTS`: objective, cast, run of show, Mission, Release, clue, supports). The lesson's tests must read the blueprint.
2. **Use the Academy skills and lists**: `academy-season-system`, `academy-session-builder`, `academy-activity-selector` (+ the 171-game catalogue `docs/academy-games-catalog.md`), `academy-assessment-designer` where there is a check, and run `academy-quality-gate` before reporting done.
3. **Research the internet again for every lesson** (it is a one-to-one live lesson for teens): Oxford, Cambridge, British Council, Duolingo, Busuu and other English apps and one-to-one platforms. Take mechanics, never content; log sources, quality and limits in `docs/research/academy-<lesson>-research.md`.
4. **Be creative and visual, not dry.** The player must look like a game or a film, not a worksheet: full-bleed scenes and pictures on every screen, large characters, cinematic transitions between parts, rich reactions. A lesson that is plain text on a flat background is not done.
5. **Design like an education UX/UI designer and game designer** (skill `.claude/skills/academy-game-ui`, research `docs/research/academy-game-ui.md`): every page and activity is built like a video game or story game — illustrated, animated, with motion where it helps — and must pass its "dullness test". Motion rules still hold: UI motion, sparkles, card flips, expression swaps and approved silent background loops are fine; never zoom/pan/loop-scale a story picture, never browser voices.
6. Fill the hour (the blueprint's run of show), keep the cast to the blueprint's cast, and keep all other Academy rules (hub separation, voice, comfort).

## Create lessons with all the skills, the handbook and the game-dev skills, and search deep for games (hard rule — owner, 2026-10-16)

- "Recruit all of the skills and the handbook, also the video-games dev skill, to create the lessons from now on; search deep in the internet for the best games and video games that are actually compatible and align with the lesson objectives or activities."
- Every Academy lesson, unit and new activity follows `docs/academy-lesson-creation-protocol.md`: load the Academy skills in order, the handbook (`docs/handbook/`, Part 10) and the video-game development skills (`game-developer`, `gdev-prototype-fast`, `gdev-game-feel`, `game-animation`, `gdev-game-ui-ux`, and by mechanic `gdev-puzzle`, `gdev-visual-novel`, `gdev-dialogue-systems`, `gdev-card-game`).
- **Start from the 171-game catalogue** (`docs/academy-games-catalog.md`, owner 2026-10-16: "also from the 171 games list"): shortlist its entries by the lesson's cognitive jobs, reuse what exists in the repo, and name which games come from the catalogue (by number) and which are new finds.
- **Deep game search, every lesson:** ≥ 5 candidates from ≥ 3 source families (language platforms, classroom games, commercial video games and game-design writing), mechanics only. A game is chosen only if it passes the alignment test (serves a named criterion, the student practises the target English, fits the stage and level, teen-appropriate and comfortable, buildable in the player and the hour). Log candidates, sources and rejections in the lesson's research file ("Game search" table). A lesson without it is not done (`academy-quality-gate`).

## Every lesson researches compatible games; every game is illustrated and animated top-notch (hard rule — owner, 2026-10-17)

- "In each lesson there should be a research of the compatible games that could be used to make the lesson more fun and high quality. The animation and the illustration of the games should be top-notch, high quality. No flat images." — and "not just one game: there could be multiple games according to the objective of the activity."
- **Game research in every lesson.** Before a lesson is built or rebuilt, search the internet (Oxford, Cambridge, British Council, English-learning sites and apps, classic and commercial video games, game-design and language-learning research) for games compatible with **each success criterion** of the lesson, and log them in the lesson's research file under a "Game search" heading: ≥ 5 candidates from ≥ 3 source families per lesson, sources marked verified or unverified (never claim a page was read when only a search snippet was), mechanics only, a verdict for each, and **one to two chosen games per criterion**. A lesson uses several games, each tied to a named criterion; a game that serves no criterion is cut. `gameQuality.test.ts` (deploy gate) fails a registered lesson whose research file has no "Game search" section.
- **Top-notch look and motion, no flat images.** Every game is a scene of a painted, illustrated place with the cast or sticker pieces in it: a full-bleed daylight plate behind it (never a flat colour or a plain white box), cut-out sticker pictures for pieces and cards, depth (shadows, layered panels, light), characters that react, and rich game feel: pop-in, burst and floating "+" text on a right answer, a gentle wobble on a wrong one, idle motion, smooth transitions between rounds, and a reward moment at the end. Calm mode turns the motion down, never the illustration. Never zoom or pan a still story picture (see the video rules); the motion is UI motion.
- **Type-check the player with `npm run typecheck:academy-player`** (the root `tsc -p .` checks no files; `tsconfig.academy-player.json` checks `src/academy-player-v2`).
- Every new or restyled game gets the aesthetic pass above, screenshots at laptop and phone width, the art check (`artReview.ts`), and the "dullness test" in `.claude/skills/academy-game-ui` before it is called done. `gameQuality.test.ts` fails a scene with no illustrated plate and a lesson with fewer than 4 different plates. `academy-quality-gate` check 14.

## Research for every unit and every lesson, and a games + video-games list (hard rule — owner, 2026-10-14)

- **Whenever a unit (Season) or a lesson is created or rebuilt — in any hub — research first, on the internet, never from memory:** Oxford, Cambridge (English Profile, Empower, Prepare), British Council / LearnEnglish, Pearson GSE, Council of Europe CEFR, and English-learning websites, apps and platforms (Duolingo, Busuu, Lingokids, Khan Academy Kids, Wordwall, one-to-one platforms…). Take mechanics, structure and sequencing, **never content**. Log the sources (URL, what was taken, quality, limits, verified/unverified) in `docs/research/<hub>-<unit-or-lesson>-research.md`. A unit or lesson with no research file is not done.
- **Unit research** also checks: level and grammar placement against the English Grammar Profile / GSE, vocabulary against the English Vocabulary Profile, topics against what the benchmark courses teach at that level, and the typical difficulties of our students' home languages (ar, es, fr, tr, it).
- **Every unit and lesson carries a games list and a video-games list** so students "have a blast": the games chosen from the catalogue (Academy: `docs/academy-games-catalog.md`) **plus at least one mechanic borrowed from a video game** (Academy: `docs/academy-video-game-mechanics.md` — quest log, boss fight, loot, crafting, escape room, rhythm, stealth, tower defence, detective board…). Name the borrowed mechanic, what the student does in English, and the signature game for the lesson. Extend those lists with newly researched games; never reuse content, never childish for the Academy, always within the voice, motion and comfort rules above.
- `academy-quality-gate` checks both (research file present with sources; games and video-game mechanics named) before a unit or lesson is reported done.

## A lesson plan comes before every lesson (hard rule — owner, 2026-10-14)

- **No lesson (deck, scenes, art, audio) is made before its written lesson plan exists and the owner approves it.** Academy: `docs/academy-<season>-spec.md` (or the Season's plan doc), from `docs/academy-lesson-plan-template.md`. The plan is one-to-one (teacher + one student), exactly 60 minutes, and has: (1) the **student's need** (who, what they already know, L1 difficulties, comfort) and the **objective** with an exit task and success criteria, built backwards; (2) **internet research** for compatible activities, scenarios and mechanics (Oxford, Cambridge, British Council, apps, platforms, classic games), logged with sources in `docs/research/`; (3) **intensive, gamified practice** — a minute-by-minute table with teacher/student columns, response counts (target ≥ 80 student responses per hour), a practice ladder, an error-return loop and a mastery check; (4) games from `docs/academy-games-catalog.md` (including the classic and retro games added 2026-10-14) and a video-game mechanic from `docs/academy-video-game-mechanics.md`; (5) a **traceability check**: every activity names the objective or need it serves — an activity that serves neither is cut.
- **Every lesson reminds the student of earlier learning on a spaced schedule** (owner, 2026-10-14: "remind the students about previous knowledge… add spacing… add progression"): the Remember? comes from `recallPlan` (items return 1, 2, 4, 8 and 16 teaching lessons later, patterns too, plus the teacher's error log), the Daily 10 follows days 1, 3, 7, 14, 30, Remix/Finale bring the Season back, and every lesson shows builds-on / unlocks. Details: `docs/academy-recall-spacing-progression.md`.
- **Speaking practice is the largest share of every lesson** (owner, 2026-10-14: "speaking practice is very, very important"): targets per level in `src/curriculum/academy/speaking.ts` (student talk 40–65 %, 12–25 explicit speaking minutes, a speaking ladder shadow → repeat → controlled → guided → free, voice notes between lessons, a spoken Release). The other skills feed it. Details: `docs/academy-speaking-practice.md`.
- **Every lesson has a teacher checklist, part of the lesson report** (owner, 2026-10-14): after each lesson the teacher marks the lesson's goals (Nailed it / Almost / Needs more practice), the speaking step reached, up to three recurring errors and comfort; after a unit's last lesson the final assessment is marked on six strands and the Release rubric, with a verdict (nailed / ready / needs more practice / repeat). Both go into the report the family reads. Rules: `src/curriculum/academy/checklist.ts`; details: `docs/academy-lesson-checklist.md`.
- Extend the games list whenever research finds a usable game (classic party games, arcade, board games, video games), mechanics only.
- `academy-quality-gate` fails a lesson with no approved plan or with a plan that fails the traceability check.

## Pre-A1 is reading-first: activate, blend, read, bank the words (hard rule — owner, 2026-10-15)

- "The youngest student is 13, so they have previous knowledge; it just needs to be activated. Pre-A1 is extensive reading and knowing the sounds: they learn how to read, know the sounds, and remember words from the reading, so we use vocabulary from the reading."
- Every Pre-A1 lesson has, in order: (1) **activate** what the student already knows (a private "I know it / New to me" check, no wrong answers); (2) **sounds and blending** (hear, blend, spell the same words); (3) **reading**: decodable lines AND a short real-looking message (chat, caption, lock screen) using taught sounds plus sight words, read twice (listen, then read), words tappable; (4) a **word bank**: the words the student keeps from the reading, practised the same lesson (listen and match with word tiles) and returned on the spaced schedule (Remember?, Daily 10). New vocabulary items come from the lesson's reading, never from a word list the student has not read.
- Teen/adult content only (never childish). Research and limits: `docs/research/academy-pre-a1-reading-research.md`; design note: `docs/academy-pre-a1-reading-first.md`. Checked in `academy-quality-gate` and `pa1s02e1.test.tsx` (a passage with a word bank).

## Modelling and the rule — every Academy lesson (hard rule — owner, 2026-10-13)

- "The modelling in the lesson is very important. Stating the rule is extremely important." Every Academy lesson: (1) the teacher **models** new language and the Mission task first (I do → we do → you do) before the student tries; (2) the **rule is stated plainly** (≤ 3 lines, an example each, read aloud, student repeats) BEFORE the practice games, even in E1 and for chunks; (3) the student **restates it** at the end (teach-back). A lesson plan or deck without a model step and a stated rule is not done. Checked in `academy-quality-gate` and `academy-session-builder`.

## Full scene plates, stories as plates, no repetition (hard rule — owner, 2026-10-14)

- **Every Academy page is a full-bleed scene plate** (a painted place with the cast in it or around it), not a panel on a flat colour; panels are small and glass. **Every story is told as a sequence of full scene plates** (3-5 per story, Canva, 16:9, cast references, natural palette, `story` slide kind, subtitles + recorded voices, cross-fade only, never zoom/pan), written as a scenario in `docs/scenarios/` first.
- "I don't want the same thing repeated; be creative and original; make the student happy, having fun, interacting, never bored." Every lesson has its own place, look, story frame, **signature game** and fun hook, registered in `src/academy-deck/lessonProfiles.ts`; `lessonVariety.test.ts` (deploy gate) fails an un-grandfathered lesson that reuses the previous lesson's main scene, the Season 1 opening/games, three same games in a row, or has fewer than five different games. Design decisions (context, environment, layout, rewards) follow `docs/academy-experience-design.md` ("be the Academy expert and decide what is best for the student").
- Adapt ideas from the Playground **by reading and re-implementing in Academy files only** (hub separation); nothing childish (no mascots, pets, stickers, hearts).

## Languages — every page is translated (hard rule — owner, 2026-10-09); the Academy lesson player is English only (owner, 2026-10-17)

- **Exception (owner, 2026-10-17: "the lesson is strictly English, no other" and "remove the Arabic translation"):** the Academy lesson player (`src/academy-player-v2`) and everything inside it (buttons, instructions, messages, quest screens) is **English only and left-to-right**, whatever language the rest of the app is in. It has English keys only (`src/translations/english/academyPlayer.ts`; the other five dictionaries have none) and always renders through its own English i18n instance (`LessonPlayer.tsx`). Do not add other languages to it. Everything outside the player (login, dashboard, library, parent pages) keeps the rule below.

- **Every new or edited page a student, parent or visitor sees is built with `t()` and translated into all six languages** (en, es, fr, ar, tr, it) — never hard-coded English. Put keys in `src/translations/<lang>/<area>.ts` (see `authUi.ts` for the pattern: `au.*` keys, English text as the `t()` default) and wire them into each language's `index.ts`; the parity test (`src/translations/authUi.test.ts`, copy it for a new area) fails if a language is missing a key or a `{{placeholder}}`.
- **English is the main language** and the fallback. A visitor sees their region's language by default (URL prefix → saved region → geo-IP → browser language, `src/lib/marketRegion.ts` + `LocaleContext`); **a language they pick themselves always wins** (`src/lib/languageChoice.ts` — call `markLanguagePicked()` wherever a language is chosen; never let the region override it).
- Students switch language any time from the globe in the dashboard header (`LanguageSwitcher`, saved to `users.preferred_language`, applied on every device by `useStudentLanguageSync`).
- Layout must work right-to-left (Arabic): use logical classes (`ps-/pe-/start-/end-/text-start`), flip direction arrows with `rtl:rotate-180`.
- Lesson content stays English (it is what is being taught); the chrome, instructions, buttons and messages around it are translated.

## Clothes and characters (hard rule — owner, 2026-10-11)

- **Don't dress male characters in girls' clothes.** Pip and Leo are boys: never a dress or a skirt on them — not in a lesson game, a homework level, a picture, a mock-up or a song line. Dress-up games give a boy no dress piece (it isn't on his rail); a dress is worn only by a girl (Mia, Bella, Willow) or shown as a thing (laundry, a shop). Lines to the child stay neutral (no "twirl in your dress"). `src/content/homework-quests/noDressForBoys.test.ts` fails otherwise.

## Words → matching → a game (hard rule — owner, 2026-10-13)

- **Every time new words are shown, a matching activity follows**: Pre-A1 = **listen and match** (`listen-match`, sounds only, no written words); A1 = **read and match** (`picture-match`). Then **another game** with the same words, so they stick. Blueprint §3f+.

## Vary the design of a repeated game (hard rule — owner, 2026-10-14)

- "Change the design of the games to prevent repetition — make it a rule." A game that comes in many lessons (Listen and Match, Read and Match, Remember?…) must have **several designs** (`look` / `mode`), and a lesson's design must **differ from the lesson right before it and from the same lesson of the unit before**. Listen and Match has four (`cards`, `balloons`, `doors`, `lilypads`) and Read and Match has four (`cards`, `frames`, `polaroids`, `chalk`), both rotated by unit + lesson; `listenMatchVariety.test.ts` and `readMatchVariety.test.ts` (deploy gate) fail otherwise — add a design or change the rotation, never the check. Blueprint §3f+.

## Aesthetic pass on every activity (hard rule — owner, 2026-10-14)

- "Whenever you create an activity, work on its aesthetic look." Every new activity gets a design pass before it is done: **colour combinations** (a harmonious palette from the lesson's picture, never random primaries; no purple quota in pictures), **look** (painted/sticker pieces, depth and shadows, no flat white boxes), **layout** (one clear focus, generous spacing, nothing cramped or covering the picture's key part), **icons** (consistent, meaningful, large enough), and **game feel** (`.claude/skills/game-animation`: pop-in, burst + "+⭐" on a right answer, gentle wrong, a character that reacts, a reward moment).
- **A repeated activity gets new designs** (see "Vary the design of a repeated game"), and each design gets the same aesthetic pass "as much as possible".
- **Busy pictures behind floating pieces:** when pieces float over a detailed scene picture, the picture is calmed with `CalmBg` (`unit1/scene-components/gameFx.tsx`: soft blur, a little desaturation and a light veil) so the pieces are the clearest, brightest things on screen; small pieces also get a light backing (chip, bubble, card). `calmBackground.test.ts` (deploy gate) keeps the games that need it on it — add a new floating-pieces game to its list.

## A1 lessons — length and story GIFs (hard rule — owner, 2026-10-13)

- **Every A1 lesson has 30-49 pages** ("A1 lessons can be from 30 to 49 pages"): real practice, not padding — and still no game twice in a unit. `a1LessonLength.test.ts` (deploy gate) fails otherwise.
- **No story videos in A1** ("just use GIF videos"): stories use Canva GIFs of the approved story pictures, made only after the written scenario, a preview GIF and the owner's OK.
