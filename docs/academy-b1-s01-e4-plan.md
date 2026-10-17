# B1 Season 1 · Lesson 4 "Ask and React · On Air": story, game and player concept + lesson plan (for owner approval)

Status: **draft, nothing built.** Story-first (owner 2026-10-17: focus on the lesson player, the video-game concept and the story concept). No scenes, pictures or audio until the owner approves this plan and the scenario (§9). Blueprint: `on-air` in `src/curriculum/academy/lessonBlueprint.ts` (speaking, chunks, role-play, Release = record the dialogue, clue = completing the dialogue with the right phrases). Season: `docs/academy-b1-s01-spec.md` (chapter 4 "Ask and react: How do I ask about someone else's experiences and show interest?"). Research and game search: `docs/research/academy-b1-s01-e4-research.md` (all sources unverified).

## 1 The story (one idea)
**Club FM, live on Friday.** The postcard case is closed (E3: Theo copied the stamp for his own list). Vee runs the lunchtime radio booth and gives the student the **host chair for the first time**. The guests are the Club: Mia and Theo are shy on air and answer in one word ("Yes." "Rome."). The silence on the show is **dead air**. The host's job is not to know the answers but to **react and ask**, so the guest opens up. Payoff: Mia's live "Two Truths and a Lie" has a lie, the host catches it with a follow-up, and the true thing Mia admits ("I have never flown, but I want to") becomes the hook for E5 (whose list is longest?).
Chapter question: *How do I show interest and keep someone talking?* Open question handed to E5: *what do the details of a longer text tell me?* (Mia's list).
Stakes are tiny and warm: nobody is accused, nobody fails; a quiet show is just a show waiting for a good question.

## 2 The video-game concept: "On Air"
A **dialogue-tree radio interview** (visual-novel / Oxenfree family) where the *guest* is the game state:
- **The guest's face is the meter.** Mia/Theo expressions (closed, curious, lit up) and posture change after each host line. No number, no bar, no timer (research: bars turn talk into score-chasing; timed options frustrate). A small "ON AIR" light and VU needle ripple with the student's own voice.
- **Three kinds of host cards:** React (Really? Wow! No way!), Ask (When did you go? What was it like?), Share (Me too. I haven't, but...). A dead-end reply (Oh. OK.) simply gets a one-word answer; a keeping-going reply gets a full story line from the guest. The student *hears* the difference.
- **Mic mute = "I need a minute"** (free, private rehearsal, never penalised).
- **Deduction layer** (from E3's board): the live Two Truths round lets the host note each claim on a small notepad and pin the one that breaks (a finished time with "never", etc.).
- **Reward:** the show ends with the **highlight reel**: the student's best lines (typed or recorded) replayed as the episode clip, the Release.
Learning link: every card is real English the student then says aloud; the game never rewards speed or clicking.

## 3 What the player needs (new work, in `src/academy-player-v2/` only) — BUILT 2026-10-17, lesson still waits for approval
1. **Story state.** `LessonState.story`: small flags/counters set by scene results (`onDone({..., story:{caughtLie:true}})`) and read by later scenes, so cast lines and plates can react ("You caught it!"). Validated by `validateScript`.
2. **Chapter cards / "Previously on…".** The lobby builds a recap from the previous lesson's recorded outcomes (E3 case closed, trophies) and opens the chapter title card with the chapter question.
3. **`onair` scene kind** (dialogue tree with an expressive guest, the card families above, mute button, voice-level ripple, calm mode without motion but with all illustration).
4. **Expression swaps for the cast** (`Cast` already supports poses; add the guest mood set: closed / curious / lit-up) driven by `useReactor`.
5. **Highlight reel.** A `reel` list in the story state collects the student's chosen lines; Wrap and Release replay them with the recorded voices of the cast reacting. Local only, nothing uploaded (consent rule).
6. Tests: story-state reducer test, `onair` validate/spoken tests, response-count floor, art-review entries, `gameQuality`.

## 4 Student, objective, criteria
Same student as E1-E3 (B1, one-to-one, ar/es/fr/tr/it). They can build "Have you ever…?" sentences (E3) but **answer in one word and never ask back**. L1 watch: Arabic/French/Italian speakers often skip the follow-up in short answers; the surprise intonation is flat in several L1s [U].
**Objective:** I can react to what someone says, ask two follow-up questions with the past simple, and keep a short exchange going.
**Exit task (Release):** record a 6-line host dialogue (react, ask, share, ask, react, close) with a guest, model hidden.
**Success criteria:**
1. I can react to news with a fitting reaction (Really? Wow! That sounds…).
2. I can ask a follow-up question about the detail (When / Where / Who / What was it like?) in the past simple.
3. I can answer a "Have you ever…?" with Yes, I have + a detail, or No, I haven't, but….
4. I can use surprise intonation on a reaction.
5. I can run a short interview and say which statement was the lie, and why.
**New items (chunks ≤ 8):** Really? · No way! · That sounds (great/scary) · What was it like? · When did you go? · Who did you go with? · Me too. / I haven't, but I'd like to. · How did you feel? No new words otherwise.

## 5 The hour (60 min; parts 3 / 5 / 20 / 12 / 3 / 8 / 5 / 4)
| Min | Part | What happens | Page / game | Resp. | Serves |
|---|---|---|---|---|---|
| 0-3 | Check-in | "Previously on…" recap (E3 outcomes), then a quick Never Have I Ever from `recallPlan` | Lobby + recall | 6 | recall |
| 3-8 | The Drop | 3 comic plates in the Club FM booth: Vee hands over the host chair, Mia answers in one word, dead air. Two taps: what did Mia say / how does the show feel? | Story (comic) | 3 | context |
| 8-14 | Notice | **Rejoinder Sort:** hear 8 replies to "I've been to Japan"; sort *dead-end* (Oh. Yes.) from *keeps going* (Really? When did you go?). Then name the three jobs: react, ask, share | Sort (reuse `sort`) | 10 | crit 1-3 |
| 14-20 | Model + rule | I do (teacher + Vee host a mini show), we do (build one together); rule in ≤ 3 lines: (1) React first. (2) Ask about the detail in the past simple. (3) Share or keep going. Student repeats, then explains it back | Model + Rule | 6 | crit 1-3 |
| 20-34 | Practice | (a) **Reaction Radar:** pick the reply that fits (choice); (b) **Question Forge:** build the follow-up from blocks (build); (c) **Surprise lane:** tap the stressed syllable in "Re-ALLY?" "No WAY!" (beats); (d) **Mini On Air:** short guided interview, Mia, frames on screen | choice / build / beats / onair (guided) | 24 | crit 1-4 |
| 34-39 | Energiser | Own-best fluency: 10 prompts, answer in one breath, no timer shown | Flash | 10 | crit 3 |
| 39-47 | **Mission: Live On Air** | Take 1: Mia's Two Truths and a Lie, the student hosts, reacts, asks, pins the lie. Feedback. Take 2: Theo, frames hidden (Push: three follow-ups). Chill: frames on. Story state records "caughtLie" | `onair` (signature) + notepad | 14 | crit 2, 5 |
| 47-52 | Release | Record the 6-line dialogue; model hidden | Speak + highlight reel | 6 | crit 1-5 |
| 52-56 | Wrap | Highlight reel plays, teach-back of the rule, clue 4 unlocks, E5 teaser (Mia's list), honest stars, teacher checklist | Wrap | 3 | all |
| 56-60 | Buffer | re-do the weakest set or a second guest | - | - | - |
Responses ≈ 82 (target ≥ 80). Speaking minutes ≈ 25 (B1 target ≥ 20; student talk ≥ 55 %): the whole Mission, Release and the Energiser are spoken.

## 6 Games and variety
Catalogue: **50** Two Truths and a Lie (signature), **44** Spot the Lie, **169** Never Have I Ever (recall). New finds: Rejoinder Sort, Reaction Radar, Question Forge, On Air dialogue tree, Surprise lane. Video-game mechanic: dialogue tree with an expressive guest + deduction notepad. Not repeated from E1-E3: Hot Seat, Trophy Forge, Glitch Hunt, Participle Wordle, Detective Board, Alibi, Mood Postcards.

## 7 Look
Place: **Club FM booth**, bright daytime: a glass-fronted lunchtime radio booth in the school, big sunny window onto the courtyard, light wood desk, two mics with foam covers, a mixing desk, cream sound panels and lilac panels (about 25 % purple), plants, a small ON AIR light (soft amber, not neon). Modest school clothes, calm actions. Three plates (comic) + the booth plate for the game; guest portraits in three moods. Aesthetic pass: painted/sticker mic, headphones and cards with depth, burst and "+" on a good question, the guest "lights up" on a kept-going reply, reward moment = highlight reel. All pictures pass the art check (limbs, same Mia/Theo, content fit) before the lesson ships; new Canva pictures one at a time.

## 8 Traceability
| Activity | Criterion / need |
|---|---|
| Recall, Never Have I Ever | recall; need: answer beyond one word |
| Story | context for 1-3 |
| Rejoinder Sort | 1, 2, 3 (guided discovery) |
| Model, rule, teach-back | 1-3, rule stated |
| Reaction Radar | 1 |
| Question Forge | 2 |
| Surprise lane | 4 |
| Mini On Air, Live On Air | 2, 3, 5 |
| Energiser | 3 (fluency) |
| Release, highlight reel | 1-5 (exit task) |

## 9 Scenario for the three plates (to be approved)
Plates only, cross-fade, no zoom or pan; bright daytime school. (1) The booth: Vee gestures to the empty host chair, a mic, ON AIR light off. Vee: "Today you are the host. Our guests are shy, so ask good questions." (2) Mia in the guest chair, hands folded, a mic in front of her. Mia: "Yes." (3) The booth with an empty desk and the ON AIR light on, Vee covering her mouth with a hand. Vee: "Dead air! Quick, say something." Pictures: `booth-plate`, `story-b1s4-1..3`, Mia/Theo mood sets, mic/headphone/reaction-card stickers (Canva, one at a time, owner sees each). No video.

## 10 Decisions for the owner
1. Approve the story (Club FM, dead air, Mia's lie) or change the frame.
2. Approve the no-bar, no-timer guest-face meter and the highlight reel.
3. Approve building the player pieces in §3 first (story state, chapter cards, `onair`) and **then** the lesson on them.

## 11 Player pieces built (2026-10-17)
- **Story state:** `SceneResult.story` / `.reel` are merged by the reducer (`EngineState.story`, `.reel`), saved with the resume point, passed to scenes in `summary`. **Chapter memory** (`services/chapterMemory.ts`) keeps only the flags between lessons (no student text). `LessonScript.previously` feeds the lobby's **"Previously on…"** card (beats with a flag show when the flag was set; beats with none always show, so a new device still gets a recap); `validateScript` rejects a missing lesson.
- **`onair` scene** (`scenes/onair/`): look `show` (react / ask / share / dead-end cards, the guest's face and halo warm, no bar, no timer, every card has a recorded model by the producer) and look `twotruths` (claims, follow-up questions, a notepad that never highlights the tell, pin the lie, say why). Logic and validators in `onairLogic.ts`; a sample in `onairDemo.ts` (preview `?demo=onair`). Uses the existing reviewed portraits (neutral, curious, happy, surprised, thinking): no new cast art.
- **Highlight reel** in the Wrap: the lines the student chose or said, replayed with the cast's recorded voices (the student's own lines are theirs to read aloud).
- **Bug found and fixed on the way:** the player read every scene's whole `spoken()` list aloud on entry (Rapport requested 13 clips, including replies to options not yet chosen). Scenes already voice themselves, so the entry sequence was removed (`LessonPlayer.tsx`); a regression test guards it.
- Still to do for the lesson: write the E4 deck on these pieces, make the booth plate and story plates (Canva, owner sees each), bake the voices, art review, then the lesson itself needs your approval of §10.
