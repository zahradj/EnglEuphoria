# Academy Pre-A1 curriculum — proposal (2026-10-12)

Owner request: a Pre-A1 curriculum for students with no English at all, focused on **reading and vocabulary**, slower than A1. Academy = ages 13-18 (Playground = 4-12). **Status (2026-10-14): the lean ladder (Pre-A1 Lite = Seasons P1-P3) is in `src/curriculum/academy/preA1.ts` (P1 with a built lesson, P2-P3 planned with 8 episodes each); P4-P6 (the Full ladder) are still only this proposal.**

## 1. Who and why
- Teen (13-18) with no English. They may read another script (Arabic) or a Latin script with different sound rules (Spanish, French, Italian, Turkish), so the first job is **letters and sounds**, not words.
- Not childish: no nursery songs, no cartoon animals. Teen worlds (club, phone, school, city) with the same cast.
- A1 lesson 1 ("Sign Me Up") assumes the student has met hello, numbers and countries at school. Pre-A1 is where a student with no school English gets there.

## 2. Principles (slower on purpose)
- **8 new items per session at most** (A1: 14). Every item meets **4+ varied encounters over 3+ sessions** (picture, sound, text, game, later recall).
- **Reading is in every session**: a short decodable text (letters taught so far + sight words), read aloud by the guide first, then by the student. Writing only copy-spelling and typing known words.
- **Two different memorising games after every vocabulary set** (the Academy rule) plus one retrieval warm-up at the start of the next session.
- One structure per Season, taught as a fixed **chunk** first ("My name is…"), analysed later.
- Home-language hint on, 0.8x audio, pictures on every word, no timers, "Not yet" wording.
- Comfort first: private rehearsal, type-instead-of-speak stay on.

## 3. Shape of a Pre-A1 session (60 minutes)
| Part | Min | Job |
|---|---|---|
| Check-in | 5 | feeling, goal, no new language |
| Remember? | 10 | retrieval of the last two sessions (longer than A1's 7) |
| The Drop | 8 | picture story or scene, meaning first |
| Learn set 1 | 10 | up to 4 items: teach + 2 different games |
| Read | 8 | decodable text: guide reads, student reads, tap-to-hear any word |
| Learn set 2 | 8 | up to 4 items: teach + 2 different games |
| Mission | 6 | say or tap a chunk with Theo/Ava (Take 1, feedback, Take 2 short) |
| Wrap | 5 | can-dos, Daily 10, next clue |

## 3b. Blending first, and age-appropriate (owner 2026-10-12: "focus more on blending, reading and vocabulary; it has to be age-appropriate")
- **Blending is the spine of the level.** Every session has a blending routine of 3-5 minutes inside the Read part: see the letters, hear each sound, slide them together (s-i-t -> sit), then read the word, then read it in a line. Sound set grows by about 3 per Season; words are decodable from the sounds taught so far. Sight words (I, a, is, the, my, you...) are taught as whole words, a few at a time, because they cannot be blended.
- **Vocabulary is chosen to be read, not only seen:** words that can be blended now and matter to a teenager come first (cap, bag, bus, van, pen, map, phone, tap, pin, hat, sun, red, bed). Words that cannot be blended yet (phone, school) are taught as whole-word pictures and read as sight words.
- **Age-appropriate decodables:** teen scenes, no childish stories. Example lines: "Sam has a van. Tim has a cap." / "Dan sits on a bus." / "Mia has a pen. It is red." Cast: Vee, Ava, Theo (plus Mia in the Pre-A1 level if the owner adds her to the vault). Topics: phone, bus, bag, cap, music, football, friends. No nursery rhymes, no animal-mascot readers, no baby voices.
- **Look:** Studio-style text, real teen scenes (the club desk, the bus stop, the school gate), clean illustrated word cards; the blend slider is a game-like control (letters slide together with a click sound), not a worksheet.
- **Check:** every reading page is tested against the sounds taught (a decodability test: every word is blendable or a taught sight word).

## 4. Seasons (6 Seasons x 8 sessions = 48 sessions, about 24 weeks at 2 a week)
Target by the end: about 220 words, the alphabet names and about 25 letter-sound patterns, and the ability to read a 5-sentence profile. Lists are first drafts for the roadmap architect to check against the A1 Season 1 items.

| # | Season (theme) | Reading focus | Vocabulary (about) | Chunk / structure |
|---|---|---|---|---|
| P1 | **Hello, letters** (club desk) | alphabet names A-Z, own name, sound of the first letters | 20: hello, name, me, you, yes, no, hi, bye, boy, girl, friend... | My name is ___. |
| P2 | **First sounds** (phone) | s a t p i n m d: blend 3-letter words, sight words I / a / is / the / my | 30: sit, tap, pin, man, dad... + 8 sight words | This is a ___. |
| P3 | **Numbers and age** (lockers) | numerals 0-20 <-> words, teen numbers 13-18 (thir-TEEN vs THIR-ty), digits one by one (phone number) | 25: 0-20, age, old, phone, number | I am ___. How old are you? |
| P4 | **My things** (school bag) | next sound set (o u e c k r h b...), read captions and labels | 40 nouns: school and home | It is a / an ___. a vs an |
| P5 | **People and places** (world map) | read 3-sentence texts | 40: family, countries, nationalities | I am from ___. I am ___. |
| P6 | **My day** (city) | read 5-sentence texts, tap-to-hear | 50: routine verbs, days, o'clock | I like ___. I go to ___. + Pre-A1 check |

Exit task of the level: read a 5-sentence profile of a cast member and answer 5 questions; say 5 sentences about yourself. Pass = move to A1 Season 1 (where "Sign Me Up" becomes a revision lesson).

## 5. How it fits the roadmap
- A new level before A1 ("Pre-A1", 6 Seasons, 48 sessions, about 220 words) would change the roadmap totals (A1 10, A2 12, B1 16, B2 16, C1 16 = 70 Seasons / 560 sessions becomes 76 / 608) and the validators and tests that assert those totals. That is a code change in `src/curriculum/academy` (types, `levels/`, `validateRoadmap`, blueprint, tests) and needs the owner's OK first.
- Placement: a 5-minute adaptive check plus the student's own choice; the lane idea from Sample 2 can be reused (a student who starts at A1 and struggles is offered Pre-A1).
- New mechanics to build for reading: tap-to-hear text, sound-blend slider (s-i-t -> sit), word-to-picture reading match, decodable reader page. These are not in the player yet.

## 6. Research (2026-10-12) and its limits
- Starter-level (Pre-A1) readers use a phonics page plus a sight-word page for the same story ([Ladybird Readers Starter](https://www.ladybirdeducation.co.uk/?p=10622)); the series targets ages 4-7, so the method may transfer but the stories will not. No teen Pre-A1 reader or published first-100-words list was found.
- Course sizes for Starters-level prep vary a lot by source (200-436 words in third-party listings; no official Cambridge count found); Oxford Phonics World levels list 75-100+ words per level in its app ([Oxford Phonics World](https://www.oupjapan.co.jp/en/node/63878)). So the 220-word target is our own judgement.
- Earlier sources: oral-first, chunks, recycling, TPR ([TEFL.net](https://www.tefl.net/elt/articles/teacher-technique/teaching-absolute-beginners/), [EBC TEFL](https://www.ebcteflcourse.com/what-to-teach-english-beginners/)); too many new words overloads beginners ([Teaching Vocabulary to ELLs](https://wiki.uep.edu.py/Download_PDFS/TzbQ1z/701170/Teaching%20Vocabulary%20To%20English%20Language%20Learners.pdf)).

## 7. Decisions needed
1. Add Pre-A1 to the roadmap code (6 Seasons / 48 sessions)? Or keep it as a docs-only plan until A1 is finished?
2. Build the reading mechanics (tap-to-hear text, sound blend, decodable reader) before the first Pre-A1 lesson?
3. Does the first Pre-A1 lesson follow "Hello, letters" (P1, session 1)?
