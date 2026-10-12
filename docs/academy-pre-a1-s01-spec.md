# Pre-A1 Season P1 "Hello, letters" — Season plan (2026-10-12)

Owner: "go" on the first Pre-A1 Lite Season. Follows `academy-roadmap-architect` (Season spec) and `docs/academy-pre-a1-curriculum.md`. Ages 13-18, zero English, reading, blending and vocabulary, slower. **Status: approved by the owner (all four decisions, 2026-10-12). Engineering step done: run of show per ladder step, blend / hear-and-pick / reader slides and the decodability test (§6 items 1-3); the P1 lessons, letter-sound recordings and art are not built yet. Not checked against the database (Supabase not queried); the Pre-A1 step has no Seasons in the roadmap data yet (`ladder.ts`, plannedTitles).**

## 1. Season at a glance
| | |
|---|---|
| Id / step | `PA1-S01`, step `pre-a1` (Lite: Seasons P1-P3) |
| Theme | **The Name Wall**: a teen music-club lobby has a big blank wall; every member's name lights up in letters. Setting: club lobby + wall (new plates; the club desk of A1 S1 is not reused as the main scene) |
| Cast | Vee (mentor), Ava, Theo (Mia only if added to the vault; none of them speaks beyond the lesson lines) |
| Hook | The wall lights up, but the letters are jumbled and the names are wrong. Vee: "Let's fix the wall. Every letter you learn lights one up." |
| Release | **Name Wall**: the student builds and reads their own name and three friends' names on the wall, and says "Hello! My name is ___." |
| Reading | 4 sounds (s, a, t, p), blending to words, a 5-line decodable text, the student's own name |
| Level | Pre-A1: zero English; the student may read another script (Arabic) or a Latin script with different sounds |

## 2. Can-dos (our own wording; not CEFR text)
1. I can say hello and say my name: "Hello! My name is ___." (listen and say)
2. I can say the names of the letters in my name and spell it (tiles).
3. I can hear and say the sounds s, a, t, p and blend them into words: at, sat, pat, tap.
4. I can read a short line of 3-5 words that uses those sounds (and I, am, is, the) and match it to a picture.

## 3. Language spine (small on purpose)
- **22 words/chunks, 26 letter names, 4 sounds, 5 sight words.** At most **8 new items per session**.
- **Chunks (productive):** hello, hi, bye, My name is ___., I am ___., yes, no, thanks, please, How do you spell it?, Nice to meet you., Me too., Sorry?
- **Words (receptive then productive):** boy, girl, friend (spoken and pictured; read as whole words only when decodable).
- **Letter names:** A-Z in four groups across E1-E4 (7, 7, 6, 6), by ear and by picture; capitals first, lower case from E3.
- **Sounds and blending:** E2 s, a; E3 t, p. Decodable words (10): at, as, sat, pat, tap, sap, pats, taps, spat, past. Pat is a name (Pat sat. Tap, Pat, tap.).
- **Sight words (5):** I, am, is, the, my (taught whole, not blended; `am` before /m/ is taught).
- **Pronunciation focus:** clear initial sounds /s/ /t/ /p/ (aspiration of /p/ and /t/ for Arabic and Spanish speakers), short /a/ (cat), letter names A, E, I as vowel names (ay, ee, eye); minimal pairs: sat/sit later (P2), pat/bat later; now: tap/top is not used (o not taught).
- **Structure:** none analysed; "My name is ___" and "I am ___" are chunks (no grammar talk).
- **Recycling:** P1 is the first Season; E7 mixes all earlier items; the Daily 10 recycles letters and sounds at 1, 3, 7 days.

## 4. Eight episodes (60 minutes each; shape = Pre-A1 session, see §6)
| Ep | Type | Objective (I can ...) | New items (<= 8) | Letters / sounds | Games after each word set (menu) |
|---|---|---|---|---|---|
| E1 | Cold Open | meet the Name Wall; say hello and my name | hello, hi, bye, My name is, I am (5) | letter names A-G | drag-match (word cards), flip memory |
| E2 | Word Lab | say yes/no, boy/girl/friend; hear s and a; blend "as" | yes, no, boy, girl, friend (5) + sounds s, a (2) | H-N; /s/ /a/ | listen-and-pick, flip memory; blend slider warm-up |
| E3 | Pattern Lab | spell my name; hear t and p; blend at, sat, pat, tap | thanks, please, How do you spell it? (3) + t, p (2) | O-T; /t/ /p/ | spelling rebuild, flip memory; blend and read |
| E4 | On Air | say a short dialogue with Theo (hello, name, spell, thanks) | Nice to meet you, Me too, Sorry? (3) | U-Z; review | role-play with tiles, sentence build |
| E5 | Deep Dive | read the first text, 5 short lines, and match lines to pictures | the, is, a (3, receptive) | review of all sounds | read-and-match, find the word |
| E6 | Side Quest | choose my skin; read and build my name and a friend's name | none new (student's own name) | own-name letters | name builder, memory with my letters |
| E7 | Remix | mixed review: letters, sounds, chunks, 4 decodable words | 0 | all | category sort (sounds), Kim's game |
| E8 | Finale | **Release:** build the Name Wall, then the checkpoint | 0 | all | Name Wall; checkpoint |

Clues (one per episode, each unlocked by using that episode's language): 1 the wall flashes a first letter; 2 a name is missing its vowel; 3 a mixed-up name "TAP"; 4 Theo's name appears backwards; 5 a hidden sentence on the wall; 6 your own name lights up; 7 the wall asks for three names; 8 the wall shows who wrote the names: Vee.

## 5. Release, checkpoint, Daily 10
- **Release rubric (Pre-A1 descriptors):** accuracy (letters and sounds), reading (blends the 4 sounds), speaking (name and hello, intelligible), interaction (responds to Theo), independence (hints used). Before/after sample: the first-day recording of "My name is ___" against the E8 recording.
- **Checkpoint (E8, about 60 % this Season, 40 % blank for the first Season; later Seasons mix earlier items):** hear-and-pick 6 letter names; 4 sound-to-letter; read-and-match 4 words; build own name; say name and hello. Production-weighted; no timer; "Not yet" wording.
- **Daily 10 seeds:** letter-name hear-and-pick, sound-to-letter, flip memory, blend slider, one decodable text (the E5 text) with tap-to-hear, one voice note ("Hello! My name is ___."). Spaced at 1, 3, 7 days.
- **Skins (3):** music (instruments on the wall), football (team names), art (colours of letters). Only pictures and the friend names change; sounds, words and tasks stay.

## 6. What has to exist before the first lesson (engineering and art)
1. **Pre-A1 run of show.** The player and blueprint use the A1 run of show (5/7/10/10/4/12/7/5; `PARTS`). Pre-A1 needs its own (5 / 10 / 8 / 10 / 8 / 8 / 6 / 5 from the proposal): make the run of show a property of the ladder step, with the deck tests reading it.
2. **Reading mechanics (new slide kinds):** tap-to-hear letters and words; **blend slider** (letters slide together with a click: s-a-t -> sat); **decodable reader page** (lines with tap-to-hear, picture match); **hear-and-pick letters**. Existing: spelling tiles (`spell`), flip memory, drag-match, listen-and-pick.
3. **Decodability test:** every word on a reading page is either blendable from the sounds taught so far or a taught sight word (test fails otherwise).
4. **Audio:** letter names (26, exists), letter SOUNDS (4, need baking: policy voice, careful phoneme recordings, no "suh"), chunks and decodable words. Per-lesson manifests first (`docs/academy-level-ladder.md` §5).
5. **Art (Canva only):** club lobby + Name Wall plates, letter tiles in the club style, ~12 picture cards (boy, girl, friend, hello...). Cut-out stickers on transparent backgrounds. Scenario/animatic rule applies if any GIF/video is made.
6. **Blueprint:** a `PA1-S01` Season in the roadmap code (outline: items, structures none, skins, release) and the lesson blueprints; roadmap totals then become lean 584 sessions (`ladderTotals`).

## 7. Why s a t p (research summary; see docs/research/academy-pre-a1-s01-research.md)
Letters and Sounds and Jolly Phonics both start with a small set of frequent, easy-to-say sounds so blending can begin at once; s a t p gives at, as, sat, pat, tap, sap at four letters. The evidence for adolescent non-literate learners is thin (case studies, one programme report); the decodable-text approach is also contested for early readers. So: systematic but short, adult/teen-relevant text, the learner's own name as the first text (Language Experience), and a check against real students before P2.

## 8. Decisions for the owner
1. Approve the theme "The Name Wall" and the cast (no Mia unless added to the vault)?
2. Approve sounds s, a, t, p in P1 (then i, n, m, d in P2)? (This replaces the earlier P2 line "s a t p i n m d".)
3. Approve making the run of show a property of the ladder step (engineering first)?
4. Approve building the reading mechanics before writing the P1 lessons?


## 9. Engineering done (2026-10-12)
- **Run of show per ladder step:** `LadderStep.runOfShow` ('standard' | 'pre-a1'); `PRE_A1_RUN_OF_SHOW` (5/10/8/10/8/8/6/5, Read part) in the blueprint; the deck has `PRE_A1_PARTS`, `DeckScript.shape` and `partsOf()`; a test keeps the deck and the blueprint equal.
- **New slide kinds** (`src/academy-deck/slides/reading.tsx`): `blend` (slider and "Blend it": letters slide together into the word), `hearpick` (hear a letter or word, pick the tile), `reader` (tap any word to hear it, match each line to its picture).
- **Decodability test** (`src/academy-deck/decodable.ts`): `DeckScript.taughtSounds` and `sightWords`; `decodabilityProblems(script)` fails a deck whose reading text is not blendable from the sounds taught or a taught whole word.
- **Letter SOUND clips** use the key `sound <letter>` and stay silent until the owner approves recordings (never another voice).
- Still to do: the PA1-S01 Season in the roadmap code, the 8 lessons, club lobby and Name Wall art, 4 letter-sound recordings, per-lesson audio manifests, pictures for the reader page.
