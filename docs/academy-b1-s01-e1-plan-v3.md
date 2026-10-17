# B1 Season 1 · Lesson 1 "Have You Ever…? · Cold Open" — improvement plan v3 (for owner approval)

Status: **approved by the owner 2026-10-16 ("go") and built: changes 1, 2 (no change needed), 3 (plate 4 and the trophy reveal), 4 and 5.** Lesson 1 v2 is live (PR #99). The owner chose, on 2026-10-16: (a) apply the Lesson 2 design to Lesson 1, (b) re-run the full lesson-creation protocol, (c) make it more visual and cinematic. Objective, exit task and success criteria are **unchanged** (`docs/academy-b1-s01-lesson-plan-v2.md`). Protocol: `docs/academy-lesson-creation-protocol.md`.

## 1 Gap check: Lesson 1 v2 against the Lesson 2 design and the protocol

| Lesson 2 design feature | In Lesson 1 v2? | Gap |
|---|---|---|
| Predict before listening | yes (`predict`) | none |
| Each word set followed by **two different games** | yes (6 words: match, memory) | none, but one set only |
| Rule stated, then a **contrast sort** | yes (Grammar Detective sort, `rule-trio`) | none |
| Mission Take 1, then Take 2 **with a new listener** | yes (`say-take2`, Theo) | none |
| Spoken **follow-up chain** ("Have you ever…? → When did you…?") | partly (Rapport RPG, Verb Draw) | no short practised **ask-and-follow-up drill** before the Mission |
| Energiser with a known game, voice on | partly (`wordle`, `streak`, `truths` are optional) | the Energiser is not a fixed part of the hour |
| Part cards over the scene, stories play on their own, title card | yes (shipped today) | only **3 story plates**, the Drop is the only cinematic part |
| Own look, place and signature game vs previous lesson | yes | none |
| Game search table with catalogue numbers and new finds | **retroactive only** (`academy-b1-s01-research.md` §9) | redo as a real search (§3 below) |
| Visual variety of repeated games | listen/read-match rotation exists | **Verb forms games (Forge, Triple, Streak, Wordle) all use the same pill-tile look** |

So most Lesson 2 features Lesson 1 already has; the real gaps are the five in bold or "partly".

## 2 What changes (proposal, each tied to a criterion)

1. **Ask-and-follow-up drill** (new mini-game, after the rule and before the Mission; criterion 5 and the exit task). The student answers a "Have you ever…?" card from Vee; if "yes", the next card asks a **past-simple follow-up with a time** ("When did you…?"); "no" gets "Why not?" / "Would you like to?". Reuses the `rpg` kind with a new script (no new player code). Student responses: about 8.
2. **Energiser becomes a fixed, timed part** (3 min, required, not optional): the Participle Wordle or Never Have I Ever with the six verbs (criterion 3). `partMinutes` updated.
3. **More cinematic Drop** (criterion 1): a **4th story plate** (the dare moment: Vee holds the "bucket list" card out to the viewer) and a short **"Trophy case" reveal plate** at the Wrap (the six trophies lit). Both made in Canva, one at a time, the owner sees each first; the old three plates stay.
4. **New look for the four verb-form games** so they stop looking alike (CLAUDE.md "Vary the design of a repeated game"): Forge keeps the trophy case look; **Triple Match** gets a "card table" look; **Streak** gets a "dial" look; **Wordle** gets a "keyboard wall" look. CSS and class variants only.
5. **Research file** gets the real search below, with catalogue numbers.

Not changed: the 60-minute shape, the vocabulary (six words, no new set), the rule and teach-back, Take 1 / Take 2 / Release, the voice and comfort rules.

## 3 Game search (this run, 2026-10-16; searches are summaries, "verified (summary)", not read in full)

| # | Candidate | Source family | Source | Mechanic (one line) | Alignment | Result |
|---|---|---|---|---|---|---|
| 1 | Ask-and-follow-up "Have you ever…?" | classroom game | busyteacher.org/8862 and /17772 (drill, present perfect vs past simple) | yes → switch to past-simple wh- follow-up | serves exit task; student produces both tenses; fits one-to-one; no timer | **chosen (change 1)** |
| 2 | Liar, Liar / Two Truths and a Lie (B1-B2) | classroom game | twinkl.com resource 2550763; video "Two Truths" (videohighlight) | tell experiences, partner guesses the lie | already in the lesson (`truths`, optional) | kept |
| 3 | Find someone who… | classroom game | lesson plans (EdUHK, Scribd "Experiences") | collect "yes" answers to experiences | needs a group; one-to-one weak | rejected (not one-to-one) |
| 4 | Stand up / sit down warm-up | classroom game | busyteacher | physical yes/no | not teen-reserved, no English output | rejected |
| 5 | Among Us social deduction (Kyoto Univ. thesis, 2024) | commercial video game + research | repository.kulib.kyoto-u.ac.jp (dnink01121) | deduce who lies from what they say | tied to "who has really done it"; needs a group | rejected (group) |
| 6 | Wordle-style word deduction with a definition at the end ("Deduce") | commercial game | apps.apple.com id351558195 | guess a hidden word, learn its meaning | already built (Participle Wordle) | kept as Energiser (change 2) |
| 7 | Incidental vocabulary game with narrative and role play (IJET 2013) | game-based learning research | online-journals.org/i-jet/article/view/4156 | learning inside the core mechanic plus story | supports keeping the story frame | informs change 3 |

Catalogue entries used (`docs/academy-games-catalog.md`): Hot Seat, Boss fight, Wordle, Triple Match, Two Truths (existing); the Ask-and-follow-up drill is a **new find** (add to the catalogue). Video-game mechanic for the lesson stays **dialogue RPG (Rapport)**; signature game stays **Trophy Forge**. **Limit:** no Oxford, Cambridge or British Council page came back from the search; their B1 present-perfect treatment is not verified in this run.

## 4 The hour after the change (60 min)

| Part | Min now → v3 | What changes |
|---|---|---|
| 1 Check-in | 3 → 3 | none |
| 2 Remember? | 3 → 3 | none |
| 3 The Drop | 22 → 21 | 4th plate; story unchanged otherwise |
| 4 Notice & Build | 11 → 11 | none |
| 5 Energiser | 3 → 3 | fixed and required (was optional) |
| 6 Mission | 9 → 9 | ask-and-follow-up drill added before Take 1; trimmed `rpg` goal 3 → 2 to make room |
| 7 Release | 5 → 5 | none |
| 8 Wrap | 4 → 4 | trophy-case reveal plate |
Student responses stay ≥ 80 (the drill adds about 8). Speaking and recall checks in `speaking.ts` / `recallPlan` are unaffected.

## 5 Traceability

| Change | Serves |
|---|---|
| Ask-and-follow-up drill | criterion 5 (spoken Release) and the L1 need (past simple needs a time) |
| Fixed Energiser | criterion 3 (six participles) and spacing |
| 4th plate and trophy reveal | criterion 1 (context before the words), motivation |
| Four game looks | variety rule, no new learning load |

## 6 Cost and risk
Pictures: 2 Canva plates (no video, no credits beyond Canva quota, which currently cools down for ~20 minutes between pictures). Voice: about 12 new lines (~700 characters, about $0.20); the 8 failing Lesson 2 lines show the bake can fail, so new lines may stay silent until fixed. Risk: low; the player code is CSS and a new script, tests cover the lesson.

## 7 Needs the owner's answer
Approve, or change, items 1-5 in §2. Until then nothing is built.


## Amendment 2026-10-17: new games per criterion (owner "go" on Wave 1; research: `docs/research/academy-b1-s01-games-round2-research.md`, sources unverified)
Replaces the weakest plain question screens with game encounters; the objective, the exit task, the success criteria and the 60-minute shape do not change.

| Criterion | New game (kind) | Replaces / adds | Serves |
|---|---|---|---|
| C4 choose past simple vs present perfect | **Border Desk** (`inspect`, look "post": bucket-list posts, rulebook of two rules, batches of three, approve or fix) | replaces the `glitch` multiple-choice | C4 and the write-forms task |
| C3 three forms of nine verbs | **Participle Cipher** (`cipher`: type the participle with green/yellow/grey feedback, then the chain see-saw-seen) | adds to Trophy Forge in the Energiser part | C3 |
| C5 who has done the most and why | **Who has done the most?** (`interview`, look "friends": three personas answer "Have you ever…?" in recorded voice, a notes strip, then the spoken verdict) | adds before the Mission speak scene | C5 |
Traceability: every new game names its criterion above; the Wrap, the quest objectives and the teacher checklist are unchanged. Responses stay at or above 80.
