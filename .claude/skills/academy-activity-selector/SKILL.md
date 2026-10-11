---
name: academy-activity-selector
description: >
  Choose the right game or activity for an Academy segment: by purpose (what the learner must retrieve/produce), theme and
  topic, objective, CEFR level, the student's needs and comfort, and variety. Gives the decision procedure, scoring rubric,
  purpose->mechanic and theme->mechanic tables, level ladder and a worked example. Use whenever a session, Daily-10 pack or
  quiz needs activities, or when a lesson feels repetitive. Catalogue: docs/academy-games-catalog.md (148 games).
---

# Academy Activity Selector — the right mechanic, not just a fun one

A game earns its minutes only if it makes the learner **retrieve or produce the target language** (or notice it) in a way the
objective needs, at the right difficulty, comfortably. Fun is a multiplier, never the reason.

Inputs: `segment`, `episodeType`, `objective` (+ target item/structure ids), `skill`, `cefr`, `theme`, `skin`, `studentProfile`
(needs from `academy-learner-diagnostics`, comfort preference, interests), `recentMechanics` (last 3 sessions + this session so far),
`availability` (exists in player / to build), `mode` (live with teacher | solo Daily 10).

## Procedure

1. **Name the cognitive job** of the segment (table A). If you cannot, the activity is decoration - drop it.
2. **Filter by hard constraints**: CEFR range; comfort (shy / anxious -> Low only, Push is opt-in and never first; speaking under a timer never);
   mode (solo needs auto-marking); voice rule (heard audio via recorded approved voices); no elimination/public ranking.
3. **Variety filter**: not the same *kind* as the previous 2 in this session; not the one used in the same segment last session; keep >= 12 distinct per Season;
   reserve one slot per Season for a **new or upgraded** mechanic (research >= 3 benchmarks and register per `lesson-variety-engine`).
4. **Score** the survivors (0-14):
   - Purpose fit 0-3 · Theme/skin fit 0-2 · Need boost 0-3 (matches a flagged weakness) · Level fit 0-2 · Fun/teen appeal 0-2 · Feasibility 0-1 (exists = 1) · Variety bonus 0-1.
5. **Offer two** (top two with different feels) when the segment allows choice (autonomy); the student picks; log both.
6. **Specify adaptation** for 1:1 (teacher vs student, student vs own best, co-op vs the game, student-as-expert) and the difficulty dial.
7. **Record why** (one line) in the SessionPlan - reviewers check it.

## A. Cognitive job -> mechanics (examples from the catalogue; numbers = catalogue ids)

| Job | Best mechanics | Avoid |
|---|---|---|
| Recall words (retrieval) | type-the-word from picture/audio (13, 6), Wordle-style (81), spaced deck (13), brain dump (97), Memory Palace (100) | multiple-choice only |
| Deep word knowledge (use) | Taboo-lite (1), Word Association (9), Collocation Builder (10), Word Family Tree (16), Shop/Cafe sims (12, 123), Codenames Duet (2) | gap-fill alone |
| Notice a pattern | Grammar Detective (19), Error Hunt (18), Tense Timeline (21), Preposition Maps (28) | rule lecture first |
| Practise form (controlled) | Sentence Builder (17), Transform (27), Gap-fill Heist (20), Conditionals Chain (24), Question Roulette (29) | long drills > 5 min |
| Gist & detail reading | Jigsaw Text (30), Scavenger Hunt (31), T/F/Not-Given (32), Interactive Fiction (33), Visual Novel (34), Detective Case File (117) | reading aloud as the only task |
| Decode listening | Listen & Drag (40), Dictation (80), Dictogloss (41, B1+), Song Gap-fill (43), Map Direction Follower (45), Podcast Detective (46) | browser TTS |
| Pronunciation | Minimal Pair Ears (47) + Bingo (87), Sound Sorting (91), Stress Dots (88), Echo/Shadowing (89), Tongue-twister ladder (86) | scoring shame |
| Spoken interaction | Info Gap (60), Role-play Cards (55), Mystery Object Box (125), 20 Questions (51), Guess Who (23), Alibi (61, B1+) | cold debate without prep |
| Fluency | Just-a-Minute (57), Story Dice (69), Photo Story-Talk (58), Take 2 / 4-3-2 style repeat | correcting mid-sentence |
| Opinion & argument | Opinion Line (66), Would You Rather (25), Survival Ranking (64), Debate Duel (56, B1+) | forced sides with no planning time |
| Writing | Chat Message Sim (71), Caption This (76), Sentence Expander (74), Six-Word Story (75), Review Writer (77), Postcard/Email (73) | blank page |
| Create the Release | Comic (103), Meme (104), Vlog script (105), Podcast (106), Menu Designer (112), Itinerary (114), Digital Avatar & Bio (109) | public by default |
| Review / boss | Boss Battle (94), Roguelike Deck (95), Card Collection (96), Quiz Show (92) solo, Tile-matching (98), Escape Room (116) | leaderboards, elimination |
| Reset attention | Would You Rather (140), Wordle (81), Charades w/ describe option (52), Song Opener (138), Riddle (139) | long energisers |
| Reflect | Can-Do Self-Check (142), Three Things (141), Highlight & Challenge (143), Exit Emoji (148) | forced sharing |

## B. Theme / skin -> mechanic affinities (use as a tiebreaker)

| Theme family | Strong fits |
|---|---|
| Mystery / crime / spy / history | Detective Case File, Escape Room, Alibi, Mystery Object Box, Time Traveller Quest, Spy Briefing |
| Food / cafe / shopping / money | Cafe/Shop Tycoon, Menu Designer, Role-play Cards, Survival Ranking (budget), Photo Scavenger Hunt |
| Travel / town / directions | Lost in a City, Map Direction Follower, Treasure Map, Itinerary Planner, Preposition Maps |
| Tech / gaming / AI | Roguelike Deck, Boss Battle, Tower Defense, Design-a-Game, Podcast Host, Codenames Duet |
| Music / art / media | Song Gap-fill, Playlist Curator, Caption This, Comic, Meme, Podcast |
| Sport / health / body | Charades (describe alt.), Hot Seat, Tense Timeline (my week), Debate Duel (fair play), Role-play (doctor) |
| Identity / school / friends | Digital Avatar & Bio, Visual Novel, Chat Message Sim, Two Truths, Interview the Expert, Opinion Line |
| Nature / science / environment | Read & Do, Survival Crafting, Podcast Detective, Fast-Facts Skimming, Problem-Solving Survival |
| Debate / society / ethics (B2-C1) | Debate Duel, Opinion Line, Dictogloss, Journalism Lab (News Bulletin), Seminar, T/F/Not-Given |

## C. Level ladder (support fades; same mechanic family, harder form)

A1: tap/drag/type with pictures, frames, free hints, 0.8x audio. A2: sentence-level builders, half frames, short role-plays.
B1: task-first (Mission before rule), collocations, short debates, mediation starts. B2: student-led tasks, summarising, opinion defence, authentic text.
C1: register/precision tasks, seminar, pitch, mediation, dictogloss, extensive-reading targets.

## D. Student-need overrides (from diagnostics)

| Flag | Prefer | Also |
|---|---|---|
| Low retention of words | production retrieval + varied-context use (Collocation, Taboo-lite) | add 3 items to Daily 10 |
| Grammar errors persist | Pattern re-notice (19, 18) then builder, contrasts only after each is solid | schedule +1/+3 day grammar items |
| Weak listening decoding | Dictation, Minimal Pair, Dictogloss (B1+) | graded audio in Daily 10 |
| Low talk-time / anxious | Chat Sim, Visual Novel, Opinion Line, private voice notes, Reverse Teacher | planning time on; Chill track first |
| Fluent but inaccurate | Take 2 with accuracy constraint, Error Hunt, delayed feedback | |
| Accurate but halting | Just-a-Minute, Story Dice, shorter prep, 4-3-2 style repeats | measure per student |
| Reading plateau (B2+) | Extensive reading target, Fast-Facts Skimming, collocation noticing | |

## E. Worked example

A1 Season 4 "Cafe Night", E3 Pattern Lab, objective "I can ask for things with some/any and countable/uncountable"; student is shy, likes football.
Job: notice -> controlled use. Candidates: Grammar Detective (19, 3/3 purpose), Cafe/Shop Tycoon (123, theme 2), Sentence Builder (17), Error Hunt (18).
Pick for Notice: **Grammar Detective** on 4 football-snack-bar menu sentences (skin). Build slot offers **Sentence Builder** (own-best streak, Low comfort) or **Cafe Tycoon order sim** (teacher is customer);
student picks. Energiser: Wordle-style on cafe words. Mission (Normal): Role-play at the snack bar. Chill track: Chat Message Sim ordering by text.
Variety check: previous session used Escape Room + Role-play, so this one avoids both. Logged reasons.

## F. Solo (Daily 10) selection extras

Only mechanics that auto-mark or self-compare; <= 3 minutes each; no waiting for a teacher; cap time pressure; every game ends with a retrieval summary. See `academy-daily-practice`.
