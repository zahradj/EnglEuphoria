# Academy A1 — anime/manga series plan + production method

Status: DRAFT for owner approval (2026-10-05). Nothing below has been built, drawn or written to the database.

## 1. Decisions

- **Academy starts at A1.** Pre-A1 Academy (70 empty stub rows, 1 built) is hidden/archived, not deleted. A short "bridge" (alphabet, spelling your name, numbers 0-20) opens A1 Unit 1 for true beginners. Pre-A1 stays a Playground (kids) level.
- **Look and story frame: original anime/manga.** Teens 11-18. No existing series, characters, logos or catch-phrases. One recurring cast, one "episode" per lesson.
- **Rules carried over from CLAUDE.md:** pictures Canva only; recorded American voices only (no browser TTS); single full-illustration story pages (multi-panel comic layouts were rejected before); update the pre-seeded slot row, never insert; keep `is_published=false` until merged; vary activities/scenes/themes from the previous lesson and the same slot of the previous unit; fixes go in shared components.

## 2. The combined production line (one lesson = one pass through all of this)

| Step | What happens | Source of truth |
|---|---|---|
| 1. Slot fit | Read the slot row + both blueprints; reconcile them; confirm the content belongs in this slot | `playground-curriculum-engine`, `curriculum_lessons.ai_metadata.blueprint_ref` |
| 2. Objective -> design | Objective, micro-skills, activity choice by purpose, progressive combination (reuse earlier patterns, add one new) | `smart-lesson-architect`, `generate-lesson`, `activity-pattern-library` |
| 3. Research | >= 3 benchmarks for the skill; take the mechanic, never the content; write "better than" for each | `lesson-variety-engine` (log in the lesson file) |
| 4. Episode script | Title card, cold open, story pages, cliff-hanger line, "next episode" teaser. Exact line -> picture -> action | this doc, section 4 |
| 5. Art | Canva generate-image with uploaded reference sheets for the cast; remove-background for stickers; owner sees the base pictures first | `docs/canva-art-pipeline.md` |
| 6. Slides | ~30-36 slides, ~60 min, in the Academy slide format (intro, poll, story_page, vocab_deck, grammar_pattern, scene_dialogue, find_in_scene_game, sentence_builder, role_play, speaking_task, expedition/escape/custom game, reflection, lesson_summary) | `src/pages/academy-scene/PlayAcademyLesson.tsx` |
| 7. Voice | Bake every spoken line with the approved American voices | `scripts/generate-voice-cache.mjs`, `speechPolicy.ts` |
| 8. Write | UPDATE the slot row (`content.slides`, real title, `contentFormat`), unpublished; back up anything it replaces | project memory: slot convention |
| 9. Gates | Semantic, pedagogical, visual, narrative, **student comfort** (real headless Chrome, laptop + phone), voice, variety. Then hand the owner the preview link | `lesson-quality-gate`, `scripts/academy-comfort-audit.mjs`, `scripts/academy-player-smoke.mjs` |

Series-level rule: each of the 10 A1 units is a **story arc** and each lesson an **episode** (L1 core, L2 vocab, L3 reading, L4 speaking, L5 storybook episode, L6 extra practice, L7 boss test = "season finale"). Every lesson gets a new signature mechanic (do not reuse the B1 "Labyrinth Expedition").

## 3. Research findings (what we borrow, and how we beat it)

Search was run 2026-10-05. Results were mostly aggregator and teacher-resource pages, so treat the claims as directional, not as quotes from the textbooks.

| Benchmark | Mechanic seen | Our "better than" |
|---|---|---|
| Cambridge A1 materials ([Cambridge excerpt](https://assets.cambridge.org/97811076/90592/excerpt/9781107690592_excerpt.pdf), [Cathoven A1 listening](https://www.cathoven.com/english-teaching-resources/listening/a1-elementary/how-to-introduce-yourself-in-english-a1/)) | Controlled Q&A: name, age, country, likes; listen-then-answer | Same Q&A, but spoken by a character who reacts, inside a story, with the student's own card as the answer key |
| Oxford Discover L1 ([OUP](https://elt.oup.com/catalogue/items/global/young_learners/oxford_discover_second_edition/oxford_discover_second_edition_level_1/)) | Unit 1 = verb "to be" + introducing people, then write about a partner | Primary-age tone is wrong for 11-18; ours is a teen "new school" story and the written output is a shareable character card |
| Manga/anime in ESL ([TESOL Journal, Cho 2024](https://onlinelibrary.wiley.com/doi/full/10.1002/tesj.764), [ESL with Alan](https://eslwithalan.blogspot.com/2025/08/japanese-anime-and-manga-powerful-esl.html)) | Character analysis, dialogue role-play, comics as vocabulary vehicle | Original cast so there is no copyright problem, and every episode drives one target structure |
| Speaking games ([Twinkl A1](https://www.twinkl.com/resource/esl-my-name-is-ppt-speaking-game-kids-a1-t-e-1728033644)) | Spin-the-wheel question games | Replace luck with a mission: the student must pass a "name check" at the school gate |

## 4. Series bible (A1) — proposal

- **Series:** "Starline Academy" (working title). A modern school where the student is the **new transfer student**. Each unit's theme from the existing blueprint becomes the arc (U1 profiles/online identity, U2 rooms/gadgets...).
- **Cast = the existing Academy Cast Vault (owner decision 2026-10-05, replaces my first invented cast):** use `cast_vault_characters` (hub `academy`) and the 2026-10-03 flat-vector Academy art, never new faces.
  - **Ava** — warm, curious, asks lots of questions (wavy shoulder-length brown hair, grey tee). Opens conversations.
  - **Theo** — easygoing, a good listener (short curly dark hair, light denim jacket).
  - **Mia** — high ponytail, glasses, orange zip hoodie; recurring conversation lead.
  - **Vee** — direct, upbeat peer mentor (16-19); replaces the "Sensei" role.
  - **Nova** — the Academy owl mascot (cool teen owl with headphones); the hint-giver / name-tag scanner (replaces my "Pip" robot, which is a Playground name anyway).
  - **You** — the transfer student (avatar picked by the student).
- **Style = the vault style, unchanged:** crisp black ink outlines, soft cel shading, warm lighting, full-bleed storybook illustration, no frame. The *anime/manga feel* comes from the presentation layer, not from redrawing the cast: episode title cards, speed-line/sparkle/sweat-drop effects, bold sound-word overlays, dramatic zoom-free cross-fades, "next episode" teasers, manga-style speech plates. (Stills never zoom or pan.)
- **Story pages:** single full illustration with a speech-bubble dialogue plate, never a multi-panel grid.
- **Art pipeline:** upload the vault avatars (`avatar_url` rows above, `public/avatars/academy/*-v2.webp`) to Canva as reference images, then generate each scene with those references so faces stay identical. Owner sees the first scene before more are made. The earlier invented-cast Canva sheet (`MAHXK-joIjU`) is discarded.

## 5. Pilot: A1 · Unit 1 · Lesson 1 — "Episode 1: My Name Is…"

Slot id `1e72652f-24a6-4978-880b-c511b9ec8a30`. Blueprint: introduce yourself with *I am / My name is*; ask someone's name; words hello, goodbye, name, I, you, am, is, my; sounds /m/ /n/. The slot says 30 min; the project target is ~60, so the pilot adds *What's your name? / Nice to meet you*, spelling a name, and numbers 0-10 (bridge).

Slide outline (about 30):
1. **Title card** "Episode 1: Transfer Student" (anime title screen) + "I can introduce myself."
2. **Poll:** first day at a new school, what do you feel most? (nervous / excited / sleepy...)
3-5. **Story pages:** Kai meets you at the gate, Pip scans the name tag, Mira shouts "Hello!". True/false check.
6-8. **Vocabulary decks** (hello, goodbye, name, nice to meet you, how are you) with pictures + audio; image match.
9. **Alphabet bridge:** hear and spell the name tags (letter sounds are file-only audio).
10. **Scene dialogue** (gate scene) then **conversation_fill**.
11-12. **Grammar:** colour-decode "I am Kai. My name is Kai." -> pattern table -> error detection.
13-18. **Practice:** sentence_builder (speech-bubble words), fill_blank, matching question/answer, listening ("Which name tag?"), /m/ /n/ sound challenge.
19. **Signature game — "Name Tag Studio":** design your own manga transfer-student card (pick avatar, type name, record/say "Hello, my name is…"); Pip checks it; card is saved to the student's profile and reused in later units. (New mechanic; not an expedition.)
20. **Find in scene:** locate name tags in the classroom picture.
21-22. **Role-play:** "Gate check" with Sensei Rin; speaking task with a partner (pairs, teacher live).
23. **Reflection** + **lesson summary** + "Next episode" teaser (L2 "Meet My Friends!").

## 6. Open questions for the owner

1. Approve the series name/cast, or give me your own names and I will use them.
2. Approve the pilot outline above so I can write the full slide script and request the cast reference sheets from Canva (you review the base pictures before any slide art).
3. Confirm archiving the Pre-A1 Academy stubs (I will first check which screens read those rows).
