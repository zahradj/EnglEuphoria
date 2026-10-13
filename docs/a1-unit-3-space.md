# A1 Unit 3 · Space Mission — unit plan and lesson plans

Same method as Units 1 and 2 (`docs/a1-unit-1-welcome-town.md`, `docs/a1-unit-2-jungle.md`, both owner-approved): the
lesson blueprint (`docs/playground-lesson-blueprint.md` §3g game menu), the quality skills, research (Cambridge, coding /
TPR games, ESL weather games, number games). In A1 the child reads **full sentences**: the unit has **one story read a
bit more each lesson**, **phonics + a phonics game + Blend & Read + a tongue twister in every lesson**, **30-49 pages per
lesson**, **no game twice in the unit**, and **no story videos** (Canva story GIFs only after a scenario and the owner's OK).

**Status:** approved (owner, 2026-10-13: "go") — **built 2026-10-13** (`src/content/playground-library/space-mission/scenes.ts`,
format `space-rich`, routes `/playground-scene/space-lesson-1..7`, homework `src/content/homework-quests/space-mission-a1-u3.ts`).

### Changes made while building (for the owner)

- **Lesson 2 sound:** ng on its own has no recording of our own yet (`docs/phonics-sounds-to-record.md`), so Lesson 2
  teaches the **-ing** chunk (ring, wing, swing) with our recorded *ing* clip, and its phonics game is **Sound Sort**
  (ing / th / sh) instead of Sound Mole (Sound Mole only works with first sounds).
- **Lesson 1 sound:** th as in *three, thumb, thin, bath* (unvoiced) — voiced th (*this, that*) is not recorded yet.
- **Lesson 6:** "Lava Planet" became **River Crossing on Planet Sun** (the stepping-stones game draws water).
- **Extra games so every lesson has 30+ pages** (none twice in the unit): L1 Memory, Star Splat, Tic-Tac-Toe, jigsaw;
  L2 I Spy, Red Light Green Light (orders), Where is…? listen & tap; L3 Team Flags, Pass the Present, Listen & check;
  L4 Ice Tower, Go Fish (weather cards); L5 Story Quiz Board; L6 Catch the Answer, Hot Moon, Treasure Chests, Ice Bridge.
- **Counting in tens:** the number games got a `step` (10) so the child taps / pops 10, 20 … 100; number cards are
  drawn in code (no picture files).
- **Song:** "Counting Rocket" take 1 (best score 0.83; the scorer cannot hear sung numbers, so please listen once).
- **Captain Nova and Beep** speak with the teacher voice for now (like Coco), until they get their own recorded voices.

## 1. Where we start

- Roadmap (`docs/a1-playground-roadmap.md`, Unit 3) and the seven lesson plans in `src/curriculum/roadmap/a1LessonPlans.ts`
  exist: counting in tens to 100, directions, the Counting Rocket song, planet weather, *The Lost Robot*, extra practice,
  Boss Test. The world is **Space Mission** (`a1Worlds.ts`: Captain Nova and Beep the Robot).
- Nothing of Unit 3 is built. Units 1-2 are built to the full A1 standard; Unit 3 follows them.
- What this plan changes from the roadmap: (1) one story, *The Lost Robot*, runs through L1-L5 (the roadmap had it only in
  L5); (2) L3 also teaches the questions *How many…? / Where is…?* (a listening lesson with nothing new is too thin for
  30+ pages); (3) a sound for every lesson (the roadmap left L3, L5, L6 empty).

## 2. Unit objective

**By the end of Unit 3 the child can count in tens to 100 and say how many, follow and give directions (left, right, up,
down, above, below), ask and answer *How many…?* and *Where is…?*, give a short planet weather report, and read
*The Lost Robot*.**

> *"There are forty stars. Go up! Go left! The moon is above the rocket. It's cold and snowy on Planet Ice."*

Evidence at the end: the Boss Test (5 parts, 4 of 5 each) and a mission talk: count a group, steer the teacher's rocket in
3 steps, give a 3-sentence weather report.

### Research — what we take (mechanics only) and how we make it better

| Source | What it does | We take | Better |
|---|---|---|---|
| Cambridge A1 Movers word list ([picture book](https://www.cambridgeenglish.org/Images/199238-young-learners-movers-word-list-picture-book.pdf)) | numbers to 100, *left / right*, *above / below*, weather words | the word list and the level (Movers numbers 21-100) | every word is in our story and a game the child wins with it |
| Coding-for-kids grid lessons: [Science North Grade 1 coding](https://schools.sciencenorth.ca/sites/default/files/inline-files/SN%20Lesson%20Plan%20-%20Coding%20%28Grade%201%29.pdf), [Bee-Bots lesson sequence](https://www.digitaltechnologieshub.edu.au/media/cxsnlwuq/buzzing-with-bee-bots_lesson-sequence.docx), [Coding Ireland 5×5 grid](https://www.codingireland.ie/ViewLesson/grid-masters-exploring-the-5x5-adventure-9483/2631) | a "programmer" gives *move two squares up / turn left*; a "robot" follows; "Robot Statues" listening game | programmer ↔ robot roles, step-by-step commands on a grid | the child hears the command (no arrows to read), then swaps roles and steers the teacher — speaking, not only clicking (Rocket Maze ★) |
| ESL weather games: [teach-this weather](https://teach-this.com/vocabulary/weather), [games4esl weather lesson](https://games4esl.com/lesson-plans/hows-the-weather/), [ESL Kid Stuff weather](https://eslkidstuff.com/lesson-plans-full-course-level-2/weather/), [BusyTeacher 5 weather games](https://www.busyteacher.org/6200-5-fun-games-that-teach-the-weather.html), [British Council](https://www.teachingenglish.org.uk/comment/204485) | information-gap weather maps, mime the weather, Four Corners, weather reports | the weather map + report + mime | the child is the TV weather reporter for planets and packs the astronaut's bag: the weather word decides what goes in (Planet Weather Report ★) |
| Counting by tens: [Boom Learning tens deck](https://wow.boomlearning.com/deck/XuXgXFXtnqBR4mEQi), [ArtsWA counting to 100](https://www.arts.wa.gov/wp-content/uploads/2021/05/Counting-to-100_ArtsWA-Mini-Lesson.pdf), [Elephango skip counting by tens](https://www.elephango.com/index.cfm/pg/k12learning/lcid/11694/Skip_Counting_by_Tens), [SplashLearn skip counting](https://www.splashlearn.com/math/skip-counting-games-for-2nd-graders) | count groups of ten, songs and objects, number lines | groups of ten you can see, a counting song | the count is spoken English (*There are forty stars.*), and the countdown launches the rocket |
| Cambridge Starters/Movers listening ("listen and colour", "listen and draw lines") | follow spoken detail | Listen & Colour (already built) | used with space pictures and our numbers / positions |

### What the child brings

- Numbers 1-20, *How old are you?* (A1 Unit 1); colours, big / small; *It's…*, *It can…*, *It's got…* (A1 Unit 2).
- From Pre-A1: up / down in songs, *in / on / under* (Pre-A1 Unit 3), weather-free (weather is new).
So Unit 3 is a step up: big numbers, position words and the first "report" (three sentences about one thing).

## 3. The unit's language

| | New | Recycled |
|---|---|---|
| Numbers | twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred | 1-20 |
| Space | star, moon, rocket, planet, robot, astronaut | — |
| Directions | left, right, up, down, above, below; *Go left. Go up.* | in, on, under |
| Weather | hot, cold, sunny, windy, cloudy, snowy, rainy; *It's hot and sunny.* | big, small, colours |
| Grammar | *How many…? There are…*; *Where is…? It's above / below the…*; *What's the weather like? It's…* | *It's…*, *It can…* |
| Sight words | there, are, where, what, go, here | it, is, the, look |
| Sounds | **th** (three, thirty, this) · **ng** (ring, wing, bang) · short **u** (up, sun, run) · short **o** (hot, pop, Bop) | i, ch, ck, sh (Unit 2) |

## 4. The reading strand — *The Lost Robot* (12 pages, read a bit more each lesson)

Leo, Pip and **Biscuit** (the puppy from Pet Pal) visit **Captain Nova** at her space station. Her robot **Beep** is lost.
To find him they count stars, follow directions from planet to planet and check the weather on each one — the language is
the plot. Biscuit finds Beep in the snow; a countdown flies everyone home.

| Page | Picture | Text (decodable + sight words) | Lesson |
|---|---|---|---|
| 1 | Leo, Pip, Biscuit at the station window | *Look! The stars! There are a lot of stars.* | L1 |
| 2 | Captain Nova waves | *Nova: Hello! I am Captain Nova. This is my rocket.* | L1 |
| 3 | stars in groups of ten | *Count the stars! Ten, twenty, thirty, forty!* | L1 |
| 4 | an empty robot box | *Nova: Oh no! Where is Beep? Beep is my robot. He is lost!* | L2 |
| 5 | the star map | *Go up! Go left! The moon is above the rocket.* | L2 |
| 6 | Planet Sun | *It is hot and sunny. Beep is not here.* | L3 |
| 7 | Planet Wind | *It is windy! Up, up goes Biscuit's hat!* | L3 |
| 8 | Planet Ice | *It is cold and snowy. Look! Little tracks.* | L4 |
| 9 | the tracks go down a hill | *Beep, beep! It is below us. Go down! Go right!* | L4 |
| 10 | Beep in the snow | *Beep: I am cold. I am lost!* | L5 |
| 11 | Biscuit licks Beep | *Biscuit finds Beep! Thank you, Biscuit!* | L5 |
| 12 | the rocket takes off | *Ten, nine, eight… Go! Up, up, up! Beep is home.* | L5 |

Pictures: Canva (owner rule), the Unit 1 cast + Biscuit (existing cut-out sticker) + new cut-out stickers **Captain Nova**
(a girl astronaut) and **Beep** (a small friendly robot); same style as *Leo's First Day* and *The Jungle Rescue*.
Clothes rule: Leo and Pip wear space suits like Nova's (no dresses on boys).

## 5. Lesson by lesson

**Every lesson** (same routine as Units 1-2): title → Remember? → model (meet / echo) → first game → (song after the first
practice game) → games → brain break → **Reader** (new story pages) → reading game → **sound model → phonics game →
Blend & Read → tongue twister** → free talk → check · sticker · **Pet Pal** · home mission · goodbye song · finale.
30-49 pages; every page names its objective part in the teacher note.

### 5.1 Lesson 1 — Count to 100 in Space!

**Objective:** *I can count in tens to 100 and say how many: "There are forty stars."*
**Evidence:** the child counts 3 groups of stars in tens and answers *How many?* with a sentence.

| Part | Pages | Games |
|---|---|---|
| Model | tens 10-100 (numbers-learn), *There are…* (meet + echo) | — |
| Practice | **Count & Catch** (count-balloons, groups of ten) · **Space Bingo** (sticker-bingo: hear *sixty*, cover 60) · **Number Rockets** (dominoes: *There are thirty stars.* ↔ the picture) | 3 |
| Reading | Reader p1-3 · **Read & Match** (picture-match) | 1 |
| Phonics | **th** model · **Letter Monsters (th)** · Blend & Read (Train): *this, that, thin* · twister *Three thin stars think.* | 1 |
| Talk | *How many … in your room?* (join-stage) | |

### 5.2 Lesson 2 — Left, Right, Up, Down: Space Directions

**Objective:** *I can follow and give directions: "Go left. Go up. The moon is above the rocket."*
**Evidence:** the child steers the rocket, then gives the teacher 2-step directions (Rocket Maze ★).

| Part | Games |
|---|---|
| Practice | **Rocket Maze ★ (new)** — a star map grid; hear *Go up! Go left!* and the rocket moves; then the child gives the commands and the teacher's rocket follows (programmer ↔ robot) · **Echo Cave** (a voice calls from the left / middle / right: *It's on the left!*) · **Jungle Glider → Space Glider** (glider: *Go up!* — the child steers to the cloud/planet with the right picture) · **Above or Below?** (drag-match: *The moon is above the rocket.*) |
| Reading | Reader p4-5 · **Read & Drag** (sentence → picture) |
| Phonics | **ng** model · **Sound Mole (ng)** · Blend & Read (Slide): *ring, wing, bang* · twister *The king's ring goes bang.* |

### 5.3 Lesson 3 — Listen to the Counting Rocket Song (+ *How many…? / Where is…?*)

**Objective:** *I can understand numbers and positions when I hear them, and ask "How many…?" and "Where is…?"*
**Evidence:** Listen & Colour 4 of 5; asks the teacher 2 questions.

| Part | Games |
|---|---|
| Song | **"Counting Rocket"** (new, kids-song-writer: countdown in tens 100 → 10, *up, up, up*) after the first practice game |
| Practice | **Listen & Colour** (Cambridge format, space picture) · **Musical Planets** (musical-islands: friends hop between planets; *How many friends are on the red planet? There are two.*) · **Whisper Tube** (one number or position mixed up: *forty* → *fourteen*) |
| Reading | Reader p6-7 · **Read & Check** (tick or cross) |
| Phonics | short **u** model · **Word Build** (up, sun, run, bug) · Blend & Read (Gumball) · twister *Run up, little pup, run up!* |
| Talk | the child asks Nova *How many…? Where is…?* |

### 5.4 Lesson 4 — What's the Weather on the Planets?

**Objective:** *I can say what the weather is like: "It's cold and snowy on Planet Ice."*
**Evidence:** a 3-sentence weather report for one planet (Planet Weather Report ★).

| Part | Games |
|---|---|
| Practice | **Planet Weather Report ★ (new)** — the child is the TV weather reporter: drag weather stickers onto the planet map as they are heard, then read the report on camera; then pack the astronaut's bag (coat for snowy, sunglasses for sunny — the weather word decides) · **Draw That** (draw the weather, the other guesses) · **Balloon Match** (weather sentence ↔ planet) · weather mime brain break |
| Reading | Reader p8-9 · **Sentence Build** |
| Phonics | short **o** model · **Brick Crush (o)** · Blend & Read (Frog): *hot, pop, fog* · twister *A hot pot on a hot top.* |

### 5.5 Lesson 5 — Storybook: The Lost Robot

**Objective:** *I can read "The Lost Robot" with help and say where Beep was and what the weather was like.*
**Evidence:** reads 4 pages alone; at the pause gives the directions that bring Beep home.
Predict → **Reader** (the whole book, a **pause page** before p10: the child gives the directions) → **Treasure Radar** (hot-cold:
find Beep in the snow — *Cold! Warm! Hot!*) → **Story Order** → **Picture Crossword** (story words) → act it out →
phonics review (**Sound Pick**: th, ng, u, o) → Blend & Read (Train) → twister of the unit → check · sticker · Pet Pal ·
home · goodbye · finale. Story GIFs (Canva) only after a written scenario, a preview GIF and the owner's OK.

### 5.6 Lesson 6 — Space Game Day (extra practice)

**Objective:** *I can use numbers, directions and weather words quickly.*
Games (different from the Unit 2 Game Day): **Lava Planet** (stepping-stones: hop only on the stone with the true sentence),
**Star Map** (grid-hunt: answer, then fire at *B three*), **Rapid Recall**, **Save the Astronaut** (save-balloon spelling),
**Space Quiz** (letter-bubbles: spell *moon, star, ten*), Twister Race, Blend & Read, free talk with Beep, check · sticker ·
Pet Pal · home · goodbye · finale.

### 5.7 Lesson 7 — Boss Test: Space Navigator!

| Part | Format | Pass |
|---|---|---|
| Warm-up | **Rocket Race** (answer race, space look) | — |
| 1 Listening | hear a number / a direction / a weather → tap (5) | 4/5 |
| 2 Reading — yes / no | sentences about a big space picture (5) | 4/5 |
| 3 Reading — the story | 5 gaps in *The Lost Robot* | 4/5 |
| 4 Speaking | count a group, steer the rocket in 3 steps, a 3-sentence weather report (5 points) | 4/5 |
| 5 Reading aloud | one story page (5) | 4/5 |
| | practise-again note, Golden Compass piece 2, trophy, Pet Pal, home mission, goodbye | |

### 5.8 No game twice in the unit

| Lesson | Games |
|---|---|
| L1 | Count & Catch · Space Bingo · Number Rockets (dominoes) · Read & Match · Letter Monsters (th) |
| L2 | Rocket Maze ★ · Echo Cave · Space Glider · Above or Below? (drag-match) · Read & Drag · Sound Mole (ng) |
| L3 | Listen & Colour · Musical Planets · Whisper Tube · Read & Check · Word Build (u) |
| L4 | Planet Weather Report ★ · Draw That · Balloon Match · Sentence Build · Brick Crush (o) |
| L5 | Treasure Radar · Story Order · Picture Crossword · Sound Pick |
| L6 | Lava Planet · Star Map · Rapid Recall · Save the Astronaut · Space Quiz (letter-bubbles) |
| L7 | Rocket Race (boss warm-up) |

Each lesson also keeps the new A1 games varied against Unit 2's same slot (the variety check in `lessonVariety.ts`).

### Real-life transfer (home missions)

L1 count things at home in tens (pasta, coins) · L2 guide a family member to a hidden toy · L3 sing the countdown song · L4
tell your family today's weather · L5 read the story to your family · L6 play the direction game · L7 show your medal and
count to 100 in tens.

## 6. What has to be built (after approval)

| Item | What | How |
|---|---|---|
| Story pictures | 12 pages of *The Lost Robot* + space backgrounds (station, star map, Planet Sun / Wind / Ice) | Canva (owner rule), reference: the cast |
| Stickers | Captain Nova, Beep the Robot, weather icons, astronaut bag items (coat, sunglasses, umbrella, hat) | Canva, cut-out (no white background) |
| New games | **Rocket Maze ★** (`rocket-maze`), **Planet Weather Report ★** (`weather-report`) | code |
| Song | "Counting Rocket" — kids-song-writer, one take, karaoke | song bot |
| Lessons | 7 lessons (30-49 pages), homework quests, voices, plans in `a1LessonPlans.ts` updated | code + voice bot |

No paid video. Database rows after the branch is merged (like Units 1-2).

**Approval:** owner, 2026-10-13: "go"
