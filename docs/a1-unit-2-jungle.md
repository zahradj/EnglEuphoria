# A1 Unit 2 · Jungle Adventure — new unit plan and lesson plans

Same method as Unit 1 (`docs/a1-unit-1-welcome-town.md`, owner-approved 2026-10-12): the video-game list, the expert
teacher, the lesson blueprint (`docs/playground-lesson-blueprint.md` §3g), the quality skills, research (Cambridge, Oxford,
apps). In A1 the child reads **full sentences**, so the unit has **one story** read a bit more each lesson, **phonics +
a blending game + Blend & Read + a tongue twister in every lesson**, and **no game twice in the unit**.

**Status:** approved (owner, 2026-10-13: "Ok") — built 2026-10-13 (all 7 lessons; database rows after merge: scripts/sql/a1-unit2-after-merge.sql).

## 1. What is wrong with Unit 2 today (audit of the built lessons)

| Lesson | Built? | Problem |
|---|---|---|
| L1 Jungle Animals: Lion, Monkey, Bird | yes (17 pages) | only 3 animals and "I am a lion" (Pre-A1 level); a **"Who says…?"** page and a "pick any animal" page (both removed in Unit 1); no reading, no phonics, no blending, no twister |
| L2 What Can Animals Do? | yes (32 pages) | the Obstacle Run ★ and the song are good; **32 pages** (max 25); two `choice` pages; no story page to read |
| L3-L7 | no | planned only |

Nothing links the lessons: no story, no reading that grows. Unit 1 now ends with Leo's story — Unit 2 continues it.

## 2. Unit objective

**By the end of Unit 2 the child can describe a jungle animal in 4 sentences — what it is, what it looks like, what it can
and can't do — ask "Can it…?", answer "Yes, it can / No, it can't", and read the story *The Jungle Rescue*.**

> *"It's a crocodile. It's big and green. It's got a long tail. It can swim. It can't climb. — Can it fly? No, it can't!"*

Evidence at the end: the Boss Test (5 parts, 4 of 5 each) and a 4-sentence animal description + one question.

### Research — what we take (mechanics only) and how we make it better

| Source | What it does | We take | Better |
|---|---|---|---|
| Cambridge Pre A1 Starters word list ([pdf](https://www.cambridgeenglish.org/images/351849-pre-a1-starters-word-list-2018.pdf)) + Starters coursebook ([toc](https://assets.cambridge.org/97810090/63692/toc/9781009063692_toc.pdf)) | animal words (crocodile, elephant, monkey, snake, frog…); *can* for ability: *I can swim / He can't sing / Can you…? Yes / No* | the word list and the can/can't/Can…? pattern | every sentence is in a story the child reads |
| Oxford Floppy's Phonics Decoding Practice ([Level 1+ ck](https://backstory.london/products/9781382030366)) and *Rainforest Orchestra* ([Level 5](https://toppsta.com/books/details/871299/oxford-reading-tree-floppys-phonics-decoding-practice-oxford-level-5-rainforest-orchestra)) | blend the new sounds into words, then phrases, then short sentences; rainforest animals | sound → words → phrases → sentences, the jungle setting | the blended word flies into a line of our own story (Blend & Read) |
| "What Am I?" riddle cards ([TES](https://www.tes.com/en-us/teaching-resource/what-am-i-animal-card-game-13353461), [games4esl](https://games4esl.com/esl-classroom-games/animal-games/), [BusyTeacher](https://m.busyteacher.org/15674-young-learners-top-10-guessing-games.html)) | read a 3-4 clue riddle (*I am… I have… I can…*), guess the animal | the clue frame | the child is the riddle-maker and Coco guesses wrong on purpose (the child corrects her) |
| Cambridge Young Learners can-do statements ([Starters/Movers digital](https://cambridgeenglish.org/es/Images/722674-can-do-statements-for-pre-a1-starters-digital-and-a1-movers-digital.pdf), [YL can-do](https://www.cambridgeenglish.org/images/461492-young-learners-can-do-statements-.pdf), [YL handbook 2024](https://www.cambridgeenglish.org/es/Images/young-learners-handbook-2024.pdf)) | Starters: "CAN name familiar … animals", "CAN give very basic descriptions … colour, size"; Movers adds short exchanges | names first (L1), then looks (L1/L4), then question-and-answer (L3-L4) | each step is a game the child wins with the sentence |
| Cambridge *Kid's Box 1*, wild-animals unit ([TB unit 7](https://f.eba.gov.tr/ing-soru-bankasi/cambridge-01/Kid-s-Box-2nd-edition-1/69412/resources/recursos_pdfs/unidad_7/kb1_tb_u7.pdf), [3rd ed. contents](https://assets.cambridge.org/97811088/15574/toc/9781108815574_toc.pdf)) | name wild animals, recycle big/small/long/short, then describe and ask | name → describe → ask | the description is built in a story and a riddle game |
| British Council TeachingEnglish ([Grade 2 can/can't](https://africa.teachingenglish.org.uk/sites/default/files/activities_-_grade_2_-_unit_4_-_can_cant.pdf)), [ESL Kid Stuff](https://eslkidstuff.com/lesson-plans-full-course-level-4/things-we-can-and-cant-do/) | animals mimed for *A ___ can / can't ___*; *Can you…? Yes, I can* | mime + say (L2), the question (L3) | a friend who can't really tries and flops (Obstacle Run) |
| Lingokids / Khan Academy Kids animal play, Blooket racing, Wordwall | short games, a living world, right answers move you forward | game feel, progress you can see | the language decides each move (a wrong animal tries and can't) |

### What the child brings (from Pre-A1 and Unit 1)

- Animals: dog, cat, bird, cow, pig, sheep, horse, duck, chicken, fish (Pre-A1 Unit 7); lion, bear, frog.
- Actions + *can*: run, jump, walk, swim, dance, sing, clap, fly; *I can… / I can't…*, *he/she/it can* (Pre-A1 Unit 10).
- Size and body: big / small, head, eyes, legs, arms (Pre-A1 Unit 4).
- A1 Unit 1: *He/She is…*, *This is my friend…*, *Is it a…?*, numbers 1-20, and reading short sentences (Leo's story).

So Unit 2 is a spiral step up: new jungle animals, climb / swing, *can't* and questions with *it*, and joining sentences
into a description (about 25 % new in each lesson).

(This plan replaces the earlier draft of the unit objective, commit 8258f0b9 / 163ecbf8; its research is kept above.)

## 3. The unit's language

| | New | Recycled from Unit 1 |
|---|---|---|
| Animals | monkey, elephant, snake, crocodile, frog (+ lion, bird, fish known) | — |
| Actions | climb, swing, run, jump, swim, fly, walk | — |
| Looks | big, small, long, short, green, grey; *a long tail*, *a long nose* (trunk) | colours, numbers 1-20 |
| Grammar | *It's a…*; *It's big.*; *It can / can't…*; *Can it…? Yes, it can. / No, it can't.*; *It's got a long tail.* | *He is / She is*, *This is my friend*, *How are you?* |
| Sight words | it, can, can't, got, look, help, they | the, is, my, this, look |
| Sounds | short **i** (big, it, swim, Kip) · **ch** (chimp, chips, lunch) · **ck** (rock, stuck, quick, Kip) · **sh** (fish, splash, she) | h, a, t, f, c |

## 4. The reading strand — *The Jungle Rescue* (12 pages, read a bit more each lesson)

Leo and Pip (Unit 1) visit Coco in the jungle. Coco's little brother **Kip** is stuck on a rock in the river. Who can help?
Each friend tries; the language *can / can't* is the plot.

| Page | Picture | Text (decodable words + sight words) | Lesson |
|---|---|---|---|
| 1 | Leo and Pip arrive at the jungle | *Look! The jungle! It is big and green.* | L1 |
| 2 | Coco swings down | *Coco: Hi, Leo! Hi, Pip! I am Coco. I am a monkey.* | L1 |
| 3 | jungle animals by the river | *Look! A snake. It is long. An elephant. It is big.* | L1 |
| 4 | Coco climbs, Pip claps | *Coco: I can climb! I can swing! Pip: I can't climb!* | L2 |
| 5 | Kip on a rock in the river, sad | *Kip: Help! Help! I am stuck on a rock!* | L2 |
| 6 | Willow flies over | *Willow: I can fly. But I am small. I can't help Kip.* | L3 |
| 7 | a fish in the water | *Pip: Can a fish help? Fish: I can swim. I can't lift Kip!* | L3 |
| 8 | the crocodile smiles (friendly) | *Croc: I can swim! Can I help? Kip: No! Your teeth!* | L4 |
| 9 | the elephant walks in | *Elephant: I am big. I can walk in the river.* | L4 |
| 10 | trunk lifts Kip | *The elephant lifts Kip with its long nose.* | L5 |
| 11 | Kip hugs Coco | *Kip: Thank you! Coco: Thank you, Elephant!* | L5 |
| 12 | everyone eats chips at lunch | *Lunch! Chips for all! Kip is quick on the rock now.* | L5 |

Pictures: Canva (owner rule), the Unit 1 cast + Coco + new cut-out stickers (Kip, crocodile, elephant), same style as
*Leo's First Day*. The crocodile is friendly (child-safe).

## 5. Lesson by lesson

**Every lesson** (same routine as Unit 1): title → Remember? → words / sentences (model) → first game → the song →
games → brain break → **the Reader** (new story pages) → reading game → **sound model → a phonics game (different each
lesson) → Blend & Read → tongue twister** → free talk → check · sticker · home mission · goodbye song · finale.
Max 25 pages. Every page names its objective part in the teacher note.

### 5.1 Lesson 1 — Jungle Animals (rebuild)

**Objective:** *I can name 8 jungle animals and say what they look like: "It's an elephant. It's big and grey."*
**Evidence:** Safari Snap — the child photographs the animal described and says two sentences about it; reads pages 1-3.

| # | Page | What the child does | Stage |
|---|---|---|---|
| 1-2 | Title · Remember? (Unit 1: Leo, Pip — *This is my friend…*) | listen and click | G |
| 3-6 | Meet the animals (two pages of 4, pictures + sentence) · echo | listen, say *It's a monkey.* | P |
| 7 | **Big, small, long, short** (vocab-spot on a jungle scene) | tap, hear *The snake is long.* | P |
| 8 | **Shadow Match** (animal outlines) | listen, find the shadow | G |
| 9 | Jungle song (the built song, first verse only) | sing | G |
| 10 | **Safari Snap ★** (photo-snap: the jeep drives, *"It's big and grey!"* → snap the elephant) | listen, snap, say it | G/F |
| 11 | Brain break: move like the animals | — | — |
| 12-13 | **Reader** pages 1-3 · **Read & Match** (sentence ↔ picture) | read | R |
| 14-17 | **/i/** sound model · **Brick Crush (i)** · Blend & Read (Sound Train): *big, it, Kip* | sound, smash the i bricks, blend, read the sentence | R |
| 18 | Twister: *Big Kip is in it.* (slow, normal) | R |
| 19 | Free talk: *Which animal do you like? What is it like?* | F |
| 20-24 | Check · sticker · home mission (draw an animal, say 2 sentences) · goodbye song · finale | |

### 5.2 Lesson 2 — What Can Animals Do? (trim to ≤ 25)

**Objective:** *I can say what an animal can and can't do: "A monkey can climb. It can't fly."*
**Evidence:** the Obstacle Run ★ — the child sends the friend who CAN pass and says one *can* + one *can't* sentence.
Keep: actions (vocab-spot + TPR), Obstacle Run ★, the can/can't song, Blend & Read. Remove: the two `choice` pages, the
second song, one cinematic and the repeated TPR (32 → 24). Add: **Reader** pages 4-5, **Read & Drag** (*can / can't*
sentences onto the pictures), **ch** sound model + **Sound Pop (ch)**, twister *Chip the chimp chews chips.*

### 5.3 Lesson 3 — Can It…? (listening + questions)

**Objective:** *I can ask "Can it…?" and answer "Yes, it can. / No, it can't."*
**Evidence:** Who Can? buzzer — the child answers 4 of 5, then asks the teacher 2 questions.

| # | Page | What the child does | Stage |
|---|---|---|---|
| 1-2 | Title · Remember? (*A monkey can climb.* → click) | | G |
| 3-4 | Model: *Can it fly? No, it can't!* (Willow and the fish, story pictures) · echo | listen, say | P |
| 5 | **Can It?** (the can-it game: the animal tries the action; *Yes, it can!* / *No, it can't!*) | answer | G |
| 6 | **New song: "Ask Them!"** (kids-song-writer, one take, karaoke) | sing | G |
| 7 | **Who Can? Buzzer** (*Who can swim?* → buzz the animal) | listen, buzz, say | G |
| 8 | **Flip & Ask** (flip a card, the child ASKS *Can a frog jump?*, the teacher answers) | ask | F |
| 9 | Brain break: *Can you jump? Yes, I can!* | | — |
| 10-11 | **Reader** pages 5-7 · **Read & Check** (tick or cross, the page picture + a sentence) | read | R |
| 12-15 | **ck** sound model · **Word Build (ck / ch / sh endings)** · Blend & Read (Slide): *duck, rock, chick* | sound, build, blend, read | R |
| 16 | Twister: *A duck on a rock eats a snack.* | R |
| 17 | Free talk: interview Coco (*Can you swim? Can you fly?*) | F |
| 18-22 | Check · sticker · home mission · goodbye · finale | |

### 5.4 Lesson 4 — Talk About Animals! (speaking, the child is the expert)

**Objective:** *I can describe an animal in 4 sentences and ask "Can it…?"*
**Evidence:** Animal Riddle ★ — the child gives a 4-clue riddle; Coco guesses wrong, the child corrects her.

| # | Page | What the child does | Stage |
|---|---|---|---|
| 1-2 | Title · Remember? (*Can it fly?* → click yes/no animal) | | G |
| 3-4 | Model: *It's got a long tail / a long nose.* (meet) · echo | | P |
| 5 | **Animal Riddle ★** (Coco gives clues → the child guesses; then roles swap) | read / say | G/F |
| 6 | Song: "Can It Fly?" (sing-back: the child sings Coco's lines) | | G |
| 7 | **Field Guide ★** (new `field-guide`: the child builds each animal's 4-sentence card — size, colour, can, can't — every word checked against the real animal, then reads the card) | build, read, say | G/F |
| 8 | Brain break: *Make a long neck! Make a long tail!* | | — |
| 9-10 | **Reader** pages 8-9 · **Sentence Build** (4-word sentences from the page) | read, build | R |
| 11-14 | **sh** sound model · **Sound Mole (sh)** · Blend & Read (Gumball): *fish, ship, shop* | sound, whack, blend, read | R |
| 15 | Twister: *Shy fish swish and splash.* | R |
| 16 | Free: describe your favourite animal, the teacher guesses | F |
| 17-21 | Check · sticker · home mission · goodbye · finale | |

### 5.5 Lesson 5 — Storybook: The Jungle Rescue

**Objective:** *I can read "The Jungle Rescue" with help and say who can help and why.*
**Evidence:** reads 4 pages alone, answers *Who can help? Why?* at the pause (*The elephant. It is big. It can walk in the river.*).
Pages: predict (*Who can help Kip?*) → **Reader**: the whole book with a **pause page** before page 9 (the child chooses
who helps; a wrong friend says why they can't) → **Rescue Map** (draw-path: lead the elephant to Kip, reading the signs) →
song → **Odd One Out** (*Which friend can't help?*) → act it out (the child is the elephant)
→ phonics review (all 4 sounds, **Sound Pick**) → Blend & Read (Train): *Kip, stuck, chips* → twister of the unit →
check · sticker · home · goodbye · finale. A stills film of the book needs a scenario approved first — not in this plan.

### 5.6 Lesson 6 — Jungle Game Day (extra practice)

**Objective:** *I can use all the Unit 2 language quickly and read its sentences fast.*
Different games from Unit 1's Game Day (variety rule, same slot): **River Crossing ★** (stepping-stones: hop only on the
stone with the true sentence — *A fish can swim.*), **Jungle Charades** (the child acts, the teacher guesses; then the
reverse), **Memory: animal ↔ description** (*It's got a long nose.* ↔ elephant), **Twister Race** (the unit's four),
**Tile Reveal** (a picture under tiles; each tile is a question to answer), **Feed the animals** (read *The monkey
likes bananas*-style labels — only Unit 2 words), Blend & Read, free talk with Kip, check · sticker · home · goodbye · finale.

### 5.7 Lesson 7 — Boss Test: Jungle Explorer! (evaluation)

| Part | Format | Pass |
|---|---|---|
| Warm-up | **Raft Race** (the answer race with a jungle river look) | — |
| 1 Listening | hear *"It's got a long tail. It can swim."* → tap the animal (5) | 4/5 |
| 2 Reading — yes / no | sentences about a big jungle picture (5) | 4/5 |
| 3 Reading — the story | 5 gaps in *The Jungle Rescue* | 4/5 |
| 4 Speaking | describe two animals (4 sentences each) + ask one *Can it…?* question (5 points) | 4/5 |
| 5 Reading aloud | one story page, rated (5) | 4/5 |
| | practise-again note, Golden Compass piece 1, trophy, home mission, goodbye | |

### 5.8 No game twice in the unit

| Game | Lesson |
|---|---|
| Shadow Match · Safari Snap ★ · Brick Crush (i) · Read & Match | L1 |
| Obstacle Run ★ · Read & Drag · Sound Pop (ch) | L2 |
| Can It? · Who Can? Buzzer · Flip & Ask · Read & Check (tick-cross) · Word Build (ck) | L3 |
| Animal Riddle ★ · Field Guide ★ · Sentence Build · Sound Mole (sh) | L4 |
| Rescue Map ★ · Odd One Out · Sound Pick | L5 |
| River Crossing ★ · Charades · Memory (animal ↔ description) · Tile Reveal · Feed the animals | L6 |
| Raft Race (boss warm-up) | L7 |

Blend & Read worlds: L1 Train, L2 Frog (built), L3 Slide, L4 Gumball, L5 Train, L6 Frog (no world twice in a row). Tongue twisters follow the ladder (§6 of the Unit 1 plan): Unit 2 = one sound, 5-7 words, slow + normal.

### Real-life transfer (home missions)

L1 draw an animal and say 2 sentences · L2 mime an animal: what it can and can't do · L3 sing the song and ask a grown-up
"Can it…?" · L4 describe your favourite animal in 4 sentences · L5 read the story to your family · L6 play charades with a
sibling · L7 show your medal and describe an animal.

## 6. What has to be built (after approval)

| Item | What | Cost |
|---|---|---|
| Story pictures | 12 pages of *The Jungle Rescue* (Canva), new cut-out stickers: Kip (little monkey), crocodile, elephant with trunk | Canva |
| Song | "Can It Fly?" — written to the beat (kids-song-writer), one take from the song bot | song bot |
| Raft Race look | a river look for the answer race | code |
| Lessons | L1 + L2 rebuilt, L3-L7 built, plans in `a1LessonPlans.ts`, voices baked | code + voice bot |

No paid video. Database rows: synced after the branch is merged (like Unit 1).

**Approval:** owner, 2026-10-13: "Ok"
