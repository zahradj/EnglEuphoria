# A1 Unit 7 · Hero City — unit plan and lesson plans

Same method as Units 1-6 (`docs/a1-unit-1-welcome-town.md` … `docs/a1-unit-6-ocean.md`, all owner-approved): the
lesson blueprint (`docs/playground-lesson-blueprint.md` §3g game menu), the quality skills and fresh research
(`docs/research/playground-a1u7-research.md`). In A1 the child reads **full sentences**: **one story read a bit more each
lesson**, **phonics + a phonics game + Blend & Read + a tongue twister in every lesson**, **30-49 pages per lesson**, **no
game twice in the unit**, **no story videos** (Canva story GIFs only after a scenario and the owner's OK). Every activity
gets the **aesthetic pass** and every picture uses **only the Playground brand shades, yellow and orange**
(`PICTURE_COLOUR_LINE`, owner 2026-10-17). After new words always comes **Read and Match**, then another game.

**Status:** approved (owner, 2026-10-17: "go") — building.

## 1. Where we start

- Roadmap (`docs/a1-playground-roadmap.md`, Unit 7) and the seven lesson plans in `src/curriculum/roadmap/a1LessonPlans.ts`:
  *I can … well / fast*, *Can you…? No, I can't, but Leo can*, *You must / mustn't*, *What's the matter? I've got a
  headache. Can I help you?*, the story *Captain Spark Saves the Day*, extra practice and the Boss Test. World:
  **Superhero City** (`src/curriculum/worlds/a1Worlds.ts`, Captain Spark and Zippy the Sidekick).
- **Colour change:** the world entry lists red and navy; Playground pictures now use only yellow and orange shades, so
  Hero City is a **sunny golden city**: honey-coloured buildings, orange rooftops, golden capes, warm cream sky; only
  right/wrong feedback stays green/red.
- **Helping, not fighting.** Heroes here help people (Khan Academy Kids community-helper frame): no villains, no punches,
  nothing scary. Everyone is fully and modestly dressed (long-sleeved hero suits, capes, no tight or revealing outfits).
- What the child already has: **A1 Unit 2** *It can climb / It can't fly* (animals), **A1 Unit 3** weather, **A1 Unit 4**
  *Would you like…? Yes, please*, **A1 Unit 5** feelings and *Has he got…?*, **A1 Unit 6** *Is it…?* questions and *-ing*;
  **Pre-A1 U10** *I can run / jump / swim*. So Unit 7 revises *can* fast and spends the time on what is new: **well / fast**,
  asking a person *Can you…?*, **but … can**, **must / mustn't**, and **asking what's wrong and offering help**.
- What this plan changes from the roadmap: (1) the story runs through L1-L5 (A1 has no story videos); (2) **phonics**: L1
  **ai**, L2 **ay** (as planned), L3 gets **a_e — magic e** (*save, cape, brave, make* — hero words), L4 sorts the three
  long-a spellings; (3) the L3 listening game is not "Who said it?" (blueprint rule: L3 never uses it) — it becomes
  **Tick or Cross** and **Red Light, Green Light**.

## 2. Unit objective

**By the end of Unit 7 the child can say what they can do well, ask a friend what they can do and find the right helper,
say a hero rule, and help a citizen in English: ask what's wrong and offer help.**

> *"What's the matter?" — "I've got a headache." — "Can I help you? Sit down. I can get you some water."*

Evidence at the end: the Boss Test (5 parts, 4 of 5 each) and one hero mission the child leads from start to end.

## 3. The unit's language

| | New | Recycled |
|---|---|---|
| Ability + how | *I can run fast. I can swim well. I can't fly.* · fast, well, high, strong | *I can / can't* (U2, Pre-A1 U10) |
| Asking a person | *Can you lift it? Yes, I can. / No, I can't, but Leo can!* · lift, carry, fix, save, help | *Can it…?* (U2) |
| Rules | *You must stop. You must help. You mustn't run on the road. You mustn't shout.* · road, kind, stop, wait | *Don't…* (classroom) |
| What's wrong | *What's the matter? I've got a headache / a cold / toothache / a tummy ache.* | feelings (U5) |
| Offering help | *Can I help you? Yes, please. / No, thank you.* · *Give me…, Show me…* · water, plaster, tissue | *Would you like…?* (U4) |
| Story extras | city, tower, cape, bridge, kitten, bell | weather (U3) |
| Sight words | can't, must, matter, help, but | can, you, I, the |
| Sounds | **ai** (rain, train, paint, tail) · **ay** (play, day, say, stay) · **a_e** (save, cape, brave, make) · ai / ay / a_e sort · L5-L7 review | ee / ea (U5), oa (U6) |

All three long-a spellings use our recorded **ai** sound (`ai_01` in `unit1/audio.ts`), so no new recording is needed.

## 4. The reading strand — *Captain Spark Saves the Day* (12 pages, read a bit more each lesson)

The friends (Leo, Pip, Mia and Biscuit) follow the sixth piece of Willow's Golden Compass to **Hero City**. **Captain
Spark** (a girl, orange cape) and **Zippy** (her small golden robot helper, "it") look after the city. Today Captain
Spark has a cold and can't fly, so the friends help the city with what each of them can do well. The language is the
plot: who can do what, the rules, and asking what's wrong.

| Page | Picture | Text (decodable + sight words) | Lesson |
|---|---|---|---|
| 1 | the sunny golden city, a train on a bridge | *This is Hero City. It is a sunny day.* | L1 |
| 2 | Captain Spark waving, Zippy flying | *This is Captain Spark. She can fly fast!* | L1 |
| 3 | the friends meet her; Leo runs, Mia climbs | *Leo can run fast. Mia can climb well.* | L1 |
| 4 | a big box on the bridge, Pip trying | *Can Pip lift the box? No, he can't. But Leo can!* | L2 |
| 5 | Biscuit swims to a little boat | *Biscuit can swim well. He can save the boat.* | L2 |
| 6 | a road, a red light, Zippy holds up a hand | *Stop! You must wait. You mustn't run on the road.* | L3 |
| 7 | the friends wait, then cross with a lollipop lady | *The friends wait. They are kind and safe.* | L3 |
| 8 | Captain Spark sneezing on a bench | *What's the matter? I've got a cold.* | L4 |
| 9 | Mia gives her a tissue, Pip a cup of water | *Can I help you? Yes, please!* | L4 |
| 10 | the bell tower; a kitten at the top, the compass piece glows | *The kitten is on the tower! Who can help?* | L5 |
| 11 | Mia climbs carefully, Leo and Pip hold the ladder | *Mia can climb well. Leo and Pip help.* | L5 |
| 12 | everyone on the tower, kitten safe, compass piece in Mia's hand | *We can all be heroes! Hooray!* | L5 |

Pictures: Canva (owner rule), the Unit 1 cast + Biscuit + new cut-out stickers **Captain Spark** (waving, flying,
sneezing, pointing, cheering), **Zippy** (flying, stop-hand, happy), **citizens** with one problem each (a boy with a
headache, a grandma with a heavy bag, a girl with toothache, a man with a cold, a lost kitten, a broken bike), help items
(water, plaster, tissue, ladder, toolbox). Clothes rule: everyone fully and modestly dressed; hero suits long-sleeved and
loose, capes, boys never in a dress or skirt. Colours: only yellow and orange brand shades with natural wood and skin
tones; sky soft and muted.

## 5. Lesson by lesson

**Every lesson** (same routine as Units 1-6): title → Remember? → model (meet / echo, **I do → we do → you do**) and the
**rule stated plainly** → **Read and Match** → first game → (song after the first practice game, L3) → games → **Reader**
(new story pages) → reading game → **sound model → phonics game → Blend & Read → tongue twister** → free talk → check ·
sticker · **Pet Pal** · home mission · goodbye song · finale. 30-49 pages; every page names its objective part in the
teacher note ("Guided:" / "Free:").

### 5.1 Lesson 1 — Superhero Powers: I Can Help!

**Objective:** *I can say what I can do well: "I can run fast. I can swim well."*
**Evidence:** the child says 3 true sentences with *fast / well* about themselves.

| Part | Games |
|---|---|
| Revise (fast) | Remember? (Unit 6: sea animals + *-ing*) · *I can / can't* in one quick round |
| Model | one power per page (run fast, swim well, jump high, climb well, lift — *strong*), Captain Spark shows it · echo |
| Match | **Read and Match** (sentence ↔ hero picture) |
| Practice | **Hero Trials** (signature, hero look: say *I can run fast!* and your hero speeds through that trial) · **Power Wheel** (spin a power, say it with *fast / well*) · **Odd One Out** (which hero can't do it?) · **Draw That** (draw your own hero power; the teacher guesses *You can fly!*) |
| Reading | Reader p1-3 · reading game |
| Phonics | **ai** model · **Word Splat (ai)** · Blend & Read: *rain, train, paint* → *The train is in the rain.* · twister *Paint the train in the rain.* |
| Talk | *What can you do well?* + ask the teacher |

### 5.2 Lesson 2 — Can You Lift It? Can't and Can!

**Objective:** *I can ask a friend and compare: "Can you lift it?" "No, I can't, but Leo can!"*
**Evidence:** the child asks 3 questions and answers with *but … can*.

| Part | Games |
|---|---|
| Model | *Can you lift / carry / fix / save…?* (one page each), *Yes, I can. / No, I can't.*, then *but Leo can* |
| Match | **Read and Match** (question ↔ picture) |
| Practice | **Can It?** (signature: a job card — the child asks each hero *Can you…?* and sends the one who can, saying *No, I can't, but Leo can!*) · **Hot Badge** (pass the hero badge: *Leo, can you lift the box?*) · **Tower Pull** (lift the box: each right answer pulls the rope) · **Whisper Tube** (pass the question along) |
| Reading | Reader p4-5 · reading game |
| Phonics | **ay** model · **Letter Bubbles (ay)** · Blend & Read: *play, day, stay* · twister *Stay and play all day.* |

### 5.3 Lesson 3 — Listen to the Hero Helper Song

**Objective:** *I can understand hero rules: "You must help. You mustn't run on the road."*
**Evidence:** 4 of 5 rules understood from listening (tick or cross).

| Part | Games |
|---|---|
| Model | *You must…* / *You mustn't…* (one rule per page, the rule stated in ≤ 3 lines) |
| Song | **"The Hero Helper Song"** (new, kids-song-writer: one verse per rule, a chorus *We can help, help, help!*; one take) after the first practice game |
| Practice | **Red Light, Green Light** (signature: on the city road — *You must stop! / You must wait! / Go!*; the child moves only on the rule) · **Tick or Cross** (is the hero following the rule?) · **Must or Mustn't?** (catch-sort: catch each picture in the right net and say the rule) · **Rule Bingo** (hear the rule, stamp the picture) · **Hero Radar** (hot & cold: find the lost cape by listening) |
| Reading | Reader p6-7 · reading game |
| Phonics | **a_e magic e** (*cap → cape, mad → made*) · **Word Build** · Blend & Read: *save, brave, make* · twister *Brave Kate saves the cake.* |
| Talk | *Make one rule for your home: You must… / You mustn't…* |

### 5.4 Lesson 4 — Offer to Help: Give, Show, Tell

**Objective:** *I can find out what's wrong and help: "What's the matter?" "I've got a headache." "Can I help you?"*
**Evidence:** the child helps 4 citizens: asks, understands and offers the right help.

| Part | Games |
|---|---|
| Model | *What's the matter?* · *I've got a headache / a cold / toothache / a tummy ache* (one per page, a sticker each) · *Can I help you?* · *Give me / Show me…* |
| Practice | **Hero Mission ★ (new)** — citizens around the golden city wear a "!" bubble; the child taps one, asks *What's the matter?*, hears *I've got a cold*, picks the right help (tissue, water, plaster, a call to the doctor…) and says *Can I help you?*; the citizen smiles, thanks the child **by name**, the "!" turns into a gold star and the city lights up a little; a wrong help = the citizen says kindly *No, thank you* and says the problem again · **Roleplay** (the Hero Clinic) · **Hero Bag Go Fish** (*Have you got a plaster?*) · **Chat Chain** |
| Reading | Reader p8-9 · reading game |
| Phonics | ai / ay / a_e review · **Crossword** (long-a words) · Blend & Read · twister of the unit |

### 5.5 Lesson 5 — Storybook: Captain Spark Saves the Day

**Objective:** *I can follow a hero story and say who helped and how.*
**Evidence:** reads 4 pages alone; at the pause chooses the plan and says why (*Mia can climb well!*); retells 3 pictures.
Predict → **Reader** (the whole book, a **pause page** after p10: who can save the kitten? Leo, Mia or Biscuit — each
choice gets a reply, only one works) → **Story Order** → **Jigsaw Puzzle** (story picture) → **Who is missing?** → act it
out → phonics review (**Sound Pop**: ai, ay, a_e) → Blend & Read → twister → check · sticker · Pet Pal · home · goodbye ·
finale. Story GIFs (Canva) only after a written scenario, a preview GIF and the owner's OK.

### 5.6 Lesson 6 — Extra Practice: Hero Mission Match!

**Objective:** *I can use abilities, help and rules quickly and correctly.*
Games (different from L1-L5, accuracy before speed): **Simon Says** (hero rules: *Simon says you must jump!*) · **Quiz
Board** (Hero Jeopardy: Powers · Rules · Help) · **Dominoes** (question ↔ answer) · **Save the Balloon** · **Pass the
Parcel** · **Echo Cave** · Twister Race · Blend & Read · the child as Captain Spark, free talk with Zippy; a hero badge for
every game (achievements).

### 5.7 Lesson 7 — Boss Test: Super Helper!

| Part | Format | Pass |
|---|---|---|
| Warm-up | **Jungle Glider** as a hero flight over the city (co-op) | — |
| 1 Listening | who can do what / which rule → tap (5) | 4/5 |
| 2 Reading — yes / no | sentences about a big city picture (5) | 4/5 |
| 3 Reading — the story | 5 gaps in *Captain Spark Saves the Day* | 4/5 |
| 4 Speaking | say 2 things you can do well + help one citizen (ask, understand, offer) (5 points) | 4/5 |
| 5 Reading aloud | one story page (5) | 4/5 |
| | practise-again games, **Golden Compass piece 6**, trophy, Pet Pal, home mission, goodbye; **teaser**: a giant footprint (Dino Valley) | |

### 5.8 No game twice in the unit (and different from Unit 6's same slot)

| Lesson | Games |
|---|---|
| L1 | Hero Trials · Power Wheel · Odd One Out · Draw That · Word Splat |
| L2 | Can It? · Hot Badge · Tower Pull · Whisper Tube · Letter Bubbles |
| L3 | Red Light, Green Light · Tick or Cross · Must or Mustn't? (catch-sort) · Rule Bingo · Hero Radar (hot & cold) · Word Build |
| L4 | Hero Mission ★ · Roleplay · Hero Bag Go Fish · Chat Chain · Which help? (listen-tap) · Team Flags · Crossword |
| L5 | Story Order · Jigsaw Puzzle · Who is missing? · Sound Pop |
| L6 | Simon Says · Quiz Board · Dominoes · Save the Balloon · Pass the Parcel · Echo Cave |
| L7 | Jungle Glider (boss warm-up) |

While building, each lesson gets 30+ pages with more games from the menu, never repeating one inside the unit
(`a1LessonLength.test.ts`). Repeated routines (Read and Match, Remember?) rotate their designs. Every game is dressed in
the city (hero badges, capes, golden rooftops), never left in its default look.

### Games list and video-game mechanics
Signature games and the borrowed video-game mechanic per lesson (power-ups, squad pick, rhythm, quest givers, branching
choice, achievement badges, boss fight) are listed with sources in `docs/research/playground-a1u7-research.md`.

### Real-life transfer (home missions)

L1 tell your family one thing you can do well · L2 ask a family member 3 *Can you…?* questions · L3 make one family
rule in English · L4 ask someone at home *What's the matter?* and offer help · L5 tell the story with the pictures ·
L6 play Simon Says with hero rules · L7 show your medal and help someone today.

## 6. What has to be built (after approval)

| Item | What | How |
|---|---|---|
| Story pictures | 12 pages of *Captain Spark Saves the Day* + 3 backgrounds (golden city square, city road with lights, bell tower) | Canva (owner rule), reference: the cast |
| Stickers | Captain Spark × 5, Zippy × 3, 6 citizens with a problem, help items (water, plaster, tissue, ladder, toolbox), heroes in 5 power poses — all cut-out | Canva, cut-out |
| New game | **Hero Mission ★** (`hero-mission`: quest-giver citizens, ask → listen → choose help → offer) | code, Playground colours, calm background, game-animation pass |
| Song | "The Hero Helper Song" — kids-song-writer, one take, karaoke | song bot |
| Lessons | 7 lessons (30-49 pages), homework quests, voices (Academy ElevenLabs key); `a1LessonPlans.ts` updated for the phonics change | code + voice bot |

No paid video. Database rows unpublished until the branch is merged (Supabase needs authorization).
