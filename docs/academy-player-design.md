# Academy lesson player — how to present and execute the lesson (research + design)

Status: **design, 2026-10-08.** Built first version: `src/academy-player/` (see §9). Companion to `docs/academy-lesson-system.md` (Seasons, run of show) and `.claude/skills/academy-player-ux` (layout, comfort).
**Evidence labels:** **[V]** seen in a search result (usually an abstract or a secondary summary) · **[K]** background knowledge, not re-checked · **[RT]** rule of thumb / design judgement · **[U]** unverified.
**Honest limit:** the evidence for visual novels, comics and story apps in language learning is thin (mostly small studies); the teen-taste data comes from surveys, not from tests of this product. Everything here is a well-grounded hypothesis to test in the pilot with real 11–18 learners.

---

## 1. What teens find entertaining (and what is risky)

- **They live in short video, games, chat and anime-style media.** Pew 2024: roughly three-quarters of US teens use YouTube daily, about 60 % TikTok, about 55 % Snapchat [V]. Ofcom 2025: 89 % of UK 3–17s game and 66 % watch livestreams [V]. A Crunchyroll/NRG study (commissioned by an interested party) says nearly 60 % of 13–17s are anime fans [V, treat with caution]. Animation is increasingly preferred among 10–24s [V].
- **"Gamer" is a gendered identity.** Almost all teens play games, but 62 % of boys vs 17 % of girls call themselves gamers [V, older Pew summary]. So **no hard-core-gamer look as the default**; offer gaming as one *skin* among several.
- **Cringe is a real risk.** 81 % of 13–17s agree that "what's cool for one brand can be cringey for another"; forced slang and meme-chasing are rejected, authenticity beats tactics [V, YPulse]. Design rule: **natural, slightly dry, competent characters; no slang the team wouldn't say aloud.**
- **Age split (inference [K/RT]):** 11–13 lean to YouTube, Roblox/Minecraft-style play and group chats and hate looking babyish; 14–18 want autonomy, identity and privacy and distrust adult-made "youth" design. Hence two themes on one layout (Explorer / Studio).

### Formats that work for this audience, and how we adapt them

| Format | Why it engages | Our adaptation |
|---|---|---|
| **Visual-novel scene** (full-bleed art, 1–2 character sprites with expressions, bottom dialogue box, tap to advance, choices, backlog) | character attachment, low-stakes choices, steady rhythm | voiced lines, short boxes, language-testing choices, replay line, backlog "what they said" |
| **Manga / webtoon panels** (panels, speech bubbles, vertical scroll) | quick context inference; native to anime fans | 3–6 panels per beat, bubble ≤ 8–10 words at A1, one tappable key word per panel |
| **Chat story** (message bubbles, typing dots, quick replies) | native teen format; real functional English | in-app cast only (never real contacts), fixed pace, quick-reply chips, no infinite scroll |
| **Game HUD / quest log / boss / collection** | progress, mastery, collection | one HUD item at a time, Word Cards earned by recall (no chance, no gacha), private progress, boss = retryable task |
| **Detective / escape room** | curiosity, unlock-by-skill | missing-item mysteries only, clue unlocked by a language task, always-available hint |
| **Short puzzle bursts** (Wordle, Connections) | 60–90-second wins | solo bursts in Energiser and Daily 10, no timer by default |

### Evidence that these formats help learning (be modest)

- Game-based language learning: small-to-medium effects (d ≈ 0.50 between-group, Dixon et al. 2022); some meta-analyses report much larger numbers that are probably inflated by publication bias [V].
- Comics/graphic novels in EFL: promising for vocabulary and comprehension, but no pooled meta-analysis and mostly small studies [V]. Visual novels: one small study, no control group [V]. Commercial story apps (Duolingo Stories, Lingopie, etc.): no independent effectiveness research found [V, absent].
- **So we adopt these formats for engagement and context, not because they are proven to teach better.** We protect learning with the multimedia rules below and measure in the pilot.

## 2. Presentation rules from multimedia learning (Mayer) applied to the player [V for the principles; mapping = design inference]

1. **Coherence:** no decorative art; every picture must carry meaning (the story art shows the target item). Decorative particles never overlap a task.
2. **Signalling:** highlight only the target word/form; one colour = one job.
3. **Spatial contiguity:** the label sits next to / on the thing it names.
4. **Temporal contiguity:** audio and its picture appear together.
5. **Modality:** audio with picture; keep on-screen text short.
6. **Redundancy:** do not show the full narration as text for *new* vocabulary unless the student turns captions on (captions are a student option and help listening [V, Montero Perez 2013, secondary]).
7. **Segmenting:** learner-paced chunks (tap to advance, replay), never an autoplay run.
8. **Pre-training:** teach 2–3 key words before the clip or text.
9. **Personalisation and voice:** conversational "you", warm human (recorded) voice — also our hard rule: never browser text-to-speech.
10. **Image:** a speaking face is not reliably better [V]; show the character when the *interaction* needs it (role-play, reaction), not as decoration.
- **Working memory:** show vocabulary in **sets of 3–4** (central store ≈ 3–5 chunks, Cowan) [V]; do not show 14 items on one screen.

## 3. What goes where: segment × format (the run of show)

| Segment | Default presentation | Notes |
|---|---|---|
| **Check-in** | character speaks to the student (stage scene, 1 line) + emoji energy dial + 3 quick questions | little text; personalisation principle |
| **Remember?** | **retrieval-first**: Last-Time card (3–5 items), then the student produces the answer (type / say / pick from pictures) before seeing it; mix older items | no passive flip-and-look [V, Rowland 2014] |
| **The Drop** | A1–A2: **stage scene** (VN) or 3–6 **comic panels**; A2–C1: also **chat story** or captioned clip; B2–C1: text/audio with inline gloss | gist check after; pre-teach 2–3 words |
| **Notice & Build: vocabulary** | per level (§4) | sets of 3–4 |
| **Notice & Build: grammar** | **notice board**: examples taken from the Drop with the form highlighted → student finds the pattern → ≤ 3-line rule → 2 controlled mechanics; substitution grid for patterns | visual enhancement effect is small (d ≈ 0.22) [V]: it supports, not replaces, the rule |
| **Energiser** | game board (Wordle-like, connections, odd-one-out, match, sentence build) | live UI motion only; no timer by default |
| **Mission** | **role-play stage**: the cast character on screen, chunk prompts (3–4) for private rehearsal, then the live exchange; Take 2 reuses the prompts | feedback names 1–2 points |
| **Release** | **creation template** + record booth (private first) | student chooses output |
| **Wrap** | I-can ticks with the lesson's own pictures, Best Line, Season map (clue collected), next teaser | end on a win |

**Daily 10 (solo):** Last-Time card → due reviews → mini-game → skill snack → voice note → Highlights; 6–8 segments, each 60–90 s, segmented progress bar (Stories-style), stop-anywhere with progress saved.

## 4. Presenting vocabulary, by level

Evidence is mixed on context vs word cards (Webb 2007/2008; Nation) [V, secondary] — so we **combine**: meet the word in context, then retrieve it from a card, then use it.

| Level | Meet it | Practise it |
|---|---|---|
| **A1** | picture + audio + word on one card, **3–4 per set**; or tappable objects in a small scene; word shown inside a short chunk ("a red bag") | tap-to-hear, drag-to-picture, type from picture; L1 hidden unless asked |
| **A2** | inside a short dialogue or comic strip with tap-to-gloss; then 3–4 words pulled onto cards | retrieval by picture or sentence cue; sentence builder |
| **B1** | from the Drop text/clip; tap gloss + collocation pair + one-line example | type it / use it in a sentence; spaced cards in Daily 10 |
| **B2** | short text with inline glosses; learner-made sentences; collocation and register | gapped-sentence cards (no picture) |
| **C1** | long authentic-style text/audio; monolingual definition | paraphrase / use in speech; extensive-reading target |

The **keyword method** is not used (mixed evidence, no meta-analysis found) [V]. Dyslexia-branded fonts show no benefit [V]: use a plain sans, no italics, ≥ 16 px (18 at A1–A2 / 11–13), adjustable size and spacing.

## 5. Art, motion and sound direction

**Cast first, no mascots.** The four Academy characters (Vee, Ava, Theo, Mia) come from the cast vault; their art follows the vault `visual_blueprint` (semi-realistic illustrated teens, crisp black ink outlines, soft cel-shading, warm natural light, full-bleed storybook illustration, no photo border). Each needs **4–6 expressions** (neutral, happy, curious, surprised, thinking, concerned) as separate transparent images, plus a speaking-mouth variant if desired.
**Pictures:** Canva or Gemini only (project rule). Backgrounds are **full-bleed in two asset sets** (landscape 16:9 and portrait 9:16 or 4:5) with faces and text kept inside a central safe zone. WebP, ≈ 150–250 KB per background and 60–120 KB per sprite [K/RT].
**Stills hold still (project hard rule).** No zoom, pan, Ken Burns, parallax or CSS scale loops on any picture — **including sprites**. (One researcher suggested a 1–2 % "breathing" scale on sprites; **we reject that** because of the owner's rule.) Life comes from: expression cross-fades, a speaking/blink image swap, text reveal, UI motion, and — only where the owner has approved the picture — a short silent ambient video loop with a **visible pause button** (WCAG 2.2.2 requires it for motion over 5 s [V, secondary]).
**Motion language:** 150–250 ms eases, opacity cross-fades between scenes, small spring pops for feedback; no flashing; `prefers-reduced-motion` honoured at runtime.
**Typography and colour:** Explorer (11–13) brighter, more colour; Studio (14–18) dark-first, low-chroma with one saturated accent; clean sans; contrast ≥ 4.5:1. Both from theme tokens, learner-switchable.
**Sound:** pre-recorded character voice clips only (never `speechSynthesis`); if a clip is missing the player stays **silent**. A first-tap "start" gate unlocks audio on mobile (autoplay policy) [V, secondary]; tactile low-key UI sounds with one-tap mute; every sound has a visual equivalent.
**Writing the dialogue:** natural, slightly dry, never slang-chasing; A1 boxes ≤ 2 lines and ≤ 12 words, A2–B1 ≤ 20 words; every line voiced with a replay button; a choice every 60–90 s in story segments and at least half of the choices test language.

## 6. Engine and data model

- **A small custom engine, not Ink/Ren'Py.** Our content is mostly linear and teacher-paced (8 segments); we need plain-JSON state for live sync, games and widgets. Keep an adapter door open for Ink if heavy branching is ever wanted.
- **Script = typed array of beats** (`say`, `show`, `hide`, `bg`, `choice`, `jump`, `panel`, `chat`, `widget`, `sfx`, `loop`, `set`, `if`) with labels. **Position = `(sceneId, beatIndex, vars, seed, rev)`** — that one object is the save file, the sync snapshot and the rewind point.
- **Pure reducer `step(state, event)`**, seeded RNG (no `Math.random` in scenes), backlog derived from visited `say` beats.
- **Live sync (one-on-one):** single authority (teacher by default). The other side sends *intents*, the authority applies and broadcasts events with a `rev` and writes periodic snapshots; on reconnect fetch the latest snapshot and compare `rev` (Supabase Broadcast is not replayed after a disconnect [V, secondary]). No WebRTC. **Hub separation:** the Academy builds its own sync layer; it does not import the Playground's `useSyncedState`/`activitySync`.
- **Performance:** animate only opacity/transform; preload scene N+1 (`img.decode()` before cross-fade); ≤ 2 backgrounds mounted; one scene JSON per segment (lazy).
- **Mobile:** `svh` units with fallback; `viewport-fit=cover` for safe areas; do not force orientation (offer a "rotate for a bigger stage" hint); touch targets 44–48 px.

## 7. Accessibility and comfort checklist

Dialogue box `role="log"`/`aria-live="polite"`, real `<button>` choices, `alt` from the script, full text always in the DOM (typewriter skippable; "show all text" option); text-size and spacing controls; captions option; reduced-motion; pause for any ambient loop; no timers by default; nothing hover-only; sans-serif, no italics; contrast 4.5:1; comfort dock always visible (hint, slow, repeat, "I need a minute", private rehearsal, type instead of speak, easier/harder, camera options).

## 8. Testing

Engine unit tests (pure reducer, seeded RNG, rewind, sync determinism); a **script validator** (labels exist, every `say` has text and a voice clip id or is marked silent, every background/sprite id exists, expressions exist, A1 line limits, alt text present, no `speechSynthesis`, known cast only); component tests; Playwright screenshots (390×844, 844×390, 1440×900) with the preinstalled Chromium; two-client sync simulation with dropped/reordered events.

## 9. What exists now and what comes next

**Built (first version, Academy-only, `src/academy-player/`):** script types, pure engine with seeded RNG and rewind, script validator, theme tokens (Explorer/Studio), full-bleed stage with cross-fading backgrounds and character sprites (placeholder art until Canva pictures exist), dialogue box (typewriter with skip, replay, backlog), language-testing choices, flash deck (sets of 3–4), chat story, comic panels, run-of-show strip, comfort dock, and a real sample lesson script for A1-S01 Cold Open written with the Academy cast and the Season's items. A standalone preview page (`academy-player-preview.html`) runs it without touching the main app.
**Not built yet:** live teacher/student sync, recording booth, notice board and game widgets, Last-Time/Remember? screen, Daily 10 shell, the real art (Canva pictures per `docs/canva-art-pipeline.md`) and recorded voice clips (needs voices assigned to the cast — none set in the vault).
**Open decisions for the owner:** voices for Vee, Ava, Theo and Mia; Mia's personality; whether the preview should get a route in the main app; art style approval for the cast expression sets.

## Claims we will not make

That story/VN/comic formats are proven to teach better; that captions or context always beat word cards; that any set size or segment length is optimal for teens; that game-effect sizes of 0.7–1.6 are reliable; that narrative transportation (a persuasion finding) proves retention gains; that dyslexia fonts help.

## Sources (search-surfaced)

Pew Research, *Teens, Social Media and Technology 2024*; Ofcom Children's media lives 2025; Common Sense Media census; YPulse Gen Z reports; Crunchyroll/NRG (Kidscreen); Dixon, Dixon & Jordan 2022 (Language Learning & Technology); Chen, Tseng & Hsiao 2018 (BJET); Montero Perez et al. 2013 (System); Lee & Huang 2008 (SSLA); Webb 2007/2008; Nation 2013; Mayer, *Multimedia Learning* (personalisation, voice, image principles); Cowan 2001; Rowland 2014; Toda et al. 2018 (gamification); dyslexia fonts (PMC7188700, Edutopia); WCAG 2.2 SC 2.2.2 and 2.5.8; Playwright docs; Supabase Realtime docs (secondary).
