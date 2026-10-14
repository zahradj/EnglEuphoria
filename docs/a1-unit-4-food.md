# A1 Unit 4 · Food Festival — unit plan and lesson plans

Same method as Units 1-3 (`docs/a1-unit-1-welcome-town.md`, `docs/a1-unit-2-jungle.md`, `docs/a1-unit-3-space.md`, all
owner-approved): the lesson blueprint (`docs/playground-lesson-blueprint.md` §3g game menu), the quality skills and fresh
research. In A1 the child reads **full sentences**: **one story read a bit more each lesson**, **phonics + a phonics
game + Blend & Read + a tongue twister in every lesson**, **30-49 pages per lesson**, **no game twice in the unit**,
**no story videos** (Canva story GIFs only after a scenario and the owner's OK).

**Status:** approved (owner, 2026-10-13: "next") — **built 2026-10-13** (`src/content/playground-library/food-festival/scenes.ts`,
format `food-rich`, routes `/playground-scene/food-lesson-1..7`, homework `src/content/homework-quests/food-festival-a1-u4.ts`).

### Changes made while building (for the owner)

- **Phonics games:** the games that check only the FIRST letter (Letter Monsters, Sound Mole) cannot check a blend
  (gr = g + r), so each lesson uses a game that names the sound: L1 **Sound Sort** (gr / br), L2 **Word Build** (pl),
  L3 **Brick Crush** (sn / st / sp), L4 **Treasure Chest** (fr / fl / gr / pl), L5 **Sound Pick**. Blends play our own
  recorded single sounds one after the other (g, then r) — no new recording.
- **L4:** Go Fish ("Have you got…?") does not fit food, so L4 has **Food Bingo**, **Food Dominoes**, **Tic-Tac-Toe** and
  **Word Splat** (polite words) beside Food Survey ★ and Build a Pizza.
- **More games so every lesson has 30 pages** (none twice in the unit): L1 Feed Pip, Shadow Match, Food Memory; L2 Spin
  & Say, Red Light Green Light (kitchen jobs), Balloon Match, jigsaw; L3 Echo Cave, Musical Plates, Whisper Tube, Pico's
  Glider; L5 Story Stones, Team Flags, Story Quiz Board; L6 Catch the Answer, First Sound, Word Blocks, Treasure Map,
  Cake Tower, Treasure Chests, Bridge, Pass the Present.
- **Song:** "Do You Like…?" take 1 (score 0.97, every line heard) — please listen once.
- **Chef Cilla and Pico** speak with the teacher voice for now (like Coco, Nova and Beep).

## 1. Where we start

- Roadmap (`docs/a1-playground-roadmap.md`, Unit 4) and the seven lesson plans in `src/curriculum/roadmap/a1LessonPlans.ts`
  exist: meals, likes + *-ing*, *Do you like…?*, *Would you like some…?*, *Let's…!*, the story *Chef Cilla's Recipe*,
  Pip's Café, the Boss Test. The world is **Food Festival** (`src/curriculum/worlds/a1Worlds.ts`: Chef Cilla and Pico
  the Mouse, a food market with stalls and lanterns, "restaurant role play").
- Nothing of Unit 4 is built. Units 1-3 are built to the full A1 standard; Unit 4 follows them.
- What this plan changes from the roadmap: (1) the story runs through L1-L5 (the roadmap had it only in L5, as a video —
  A1 has no story videos); (2) a sound for every lesson (the roadmap had blends only in L1, L2, L7); (3) L2's title
  becomes *I Like Cooking!* (the roadmap title "More Foods: Rice, Cheese, Pizza" does not match its objective, likes +
  *-ing*).

## 2. Unit objective

**By the end of Unit 4 the child can name festival foods and meals, say what they like and like doing, ask a friend
*Do you like…?*, offer food (*Would you like some…? — Yes, please / No, thank you*), suggest *Let's…!* and read
*Chef Cilla's Recipe*.**

> *"I have soup for lunch. I like cooking, but I don't like washing up. Do you like pizza? Would you like some grapes?
> Yes, please! Let's make a pizza!"*

Evidence at the end: the Boss Test (5 parts, 4 of 5 each) and a café talk: order a meal, offer two things, answer
*Do you like…?* about yourself.

### Research — what we take (mechanics only) and how we make it better

| Source | What it does | We take | Better |
|---|---|---|---|
| Cambridge A1 Movers word list ([2018 list](https://www.cambridgeenglish.org/Images/351850-a1-movers-word-list-2018.pdf), [picture book](https://www.cambridgeenglish.org/Images/199238-young-learners-movers-word-list-picture-book.pdf)) | food and drink words, meals (breakfast / lunch / dinner) at Movers level | the word list and the level | every word is in the story and in a game the child wins with it |
| Classroom restaurant role plays: [eslactive Classroom Restaurant](https://eslactive.com/?p=9528), [games4esl Ordering Food](https://games4esl.com/esl-powerpoint-lessons/ordering-food-at-a-restaurant-powerpoint/), [Boggle's World restaurants](https://bogglesworldesl.com/survival_travel_english/restaurants.htm), [Twinkl "What would you like?" (A1)](https://www.twinkl.com/resource/esl-what-would-you-like-activity-sheet-kids-a1-t-e-1747654924) | menu, waiter ↔ customer cards, "What would you like? — I'd like…, please", a "special of the day" twist | the waiter / customer swap, the menu, the twist card | the customers are our characters with recorded voices; the child is the waiter AND the customer; the twists are funny ("Some soup — but no carrots!") and the child must listen for them (Festival Café ★) |
| Likes / dislikes surveys: [teach-this Likes & Dislikes](https://teach-this.com/functional-language/likes-dislikes), [ESL Kid Stuff likes / favourites](https://eslkidstuff.com/esl-kids-worksheets/likes-dislikes-favorites-preferences-worksheets-for-esl-kids/), [games4esl Food lesson](https://games4esl.com/lesson-plans/food/), [Language Advisor "Find someone who"](https://languageadvisor.net/find-someone-who/) | "Do you like…?" survey grids, find-someone-who, flip-your-card bingo | the survey grid and the report afterwards | the friends answer in their own voices; the child ASKS (speaking) before the answer comes; at the end the child reports in the third person (*Mia likes soup. Leo doesn't like salad.*) (Food Survey ★) |
| Kids' cooking apps: [Lingokids food & cooking](https://lingokids.com/?p=15686), [Kids Cooking Game](https://apps.appfollow.io/ios/kids-cooking-game-2-year-olds/6744245985?country=lu), [The Cooking Games for Kids](https://apps.apple.com/us/app/%D0%B4%D0%B5%D1%82%D1%81%D0%BA%D0%B0%D1%8F-%D0%BA%D1%83%D1%85%D0%BD%D1%8F-%D0%B8%D0%B3%D1%80%D1%8B-%D0%B4%D0%BB%D1%8F-%D0%B4%D0%B5%D1%82%D0%B5%D0%B9/id6448904459) | build a pizza / salad step by step, ingredients named | build-a-dish with named ingredients | the recipe is READ (A1 reading), each step is a sentence, and the dish goes to a character who says if they like it |
| Initial-blend phonics games: [123 Homeschool 4 Me blends](https://123homeschool4me.com/beginning-sound-matching-lego-game_2/), [TeachSimple blends games](https://teachsimple.com/product/consonant-blends-phonic-games), [TES blend flashcards](https://www.tes.com/teaching-resource/initial-blends-flashcards-123-printable-phonics-word-cards-colour-coded-13238471) | match picture ↔ blend, missing-blend cards, bingo / snap | blend matching and the missing blend | blends are blended from our OWN recorded single sounds (g + r), then read in a food sentence |

### What the child brings

- Pre-A1 Unit 8 (food: apple, banana, milk, bread, water, juice, pizza, cake, ice cream; *I like… / I don't like…*;
  *Can I have…, please?*).
- A1 Units 1-3: full sentences, *How many…? There are…*, *Where is…?*, *It's…*, numbers to 100, the weather.
So Unit 4 is a step up: meals, *-ing* after *like*, the polite offer *Would you like some…?* and *Let's…!*.

## 3. The unit's language

| | New | Recycled |
|---|---|---|
| Food | rice, soup, salad, sandwich, chips, grapes, cheese, pasta | apple, banana, bread, milk, juice, water, pizza, cake |
| Meals | breakfast, lunch, dinner; *I have … for lunch.* | — |
| Doing | cooking, eating, washing up, baking | I like / I don't like |
| Grammar | *Do you like…? Yes, I do. / No, I don't.* · *Would you like some…? Yes, please. / No, thank you.* · *Let's…!* · *some* · *He / She likes…* | *There are…*, *Where is…?* |
| Sight words | some, would, do, don't, let's, please | like, have, for |
| Sounds | **gr** (grapes, green, grab) · **pl** (plum, plate, play) · **sn** (snack, snail, snow) · **fr** (frog, fruit, fry) · L5-L7 review | th, -ing, u, o (Unit 3) |

All blends are blended from our recorded single sounds (`public/lep1/audio/letters/phon-g.ogg` + `phon-r.ogg`), so no new
recording is needed (`docs/phonics-sounds-to-record.md`).

## 4. The reading strand — *Chef Cilla's Recipe* (12 pages, read a bit more each lesson)

Leo, Pip, Mia and Biscuit visit the **Food Festival**. **Chef Cilla** (a girl chef) wants to make a giant pizza for
everyone, but the cheese is gone. **Pico the Mouse** took it — he is hungry! The friends offer him food until he gets
what he likes; he gives the cheese back, and everyone eats together. The language is the plot: *Do you like…? Would you
like some…? No, thank you. Yes, please! Let's…!*

| Page | Picture | Text (decodable + sight words) | Lesson |
|---|---|---|---|
| 1 | the festival: stalls and lanterns | *Look! The Food Festival! There are a lot of stalls.* | L1 |
| 2 | Chef Cilla at her stall | *Cilla: Hello! I am Chef Cilla. I like cooking!* | L1 |
| 3 | the empty pizza dough | *Cilla: Let's make a big pizza for the festival!* | L1 |
| 4 | the empty cheese box | *Cilla: Oh no! Where is the cheese?* | L2 |
| 5 | Biscuit sniffs a trail of crumbs | *Look! Little crumbs. Biscuit can help!* | L2 |
| 6 | Pico under a table with the cheese | *It is Pico the Mouse! He has the cheese.* | L3 |
| 7 | Leo offers grapes | *Leo: Would you like some grapes, Pico? Pico: No, thank you.* | L3 |
| 8 | Mia offers bread | *Mia: Would you like some bread? Pico: No, thank you.* | L4 |
| 9 | Pip asks | *Pip: Do you like pizza, Pico? Pico: Yes, I do! I like pizza!* | L4 |
| 10 | Cilla smiles | *Cilla: Would you like some pizza? Pico: Yes, please!* | L5 |
| 11 | Pico gives back the cheese | *Pico: Here is the cheese. Cilla: Thank you, Pico!* | L5 |
| 12 | everyone at a long table | *Let's eat! Yum! We all like pizza!* | L5 |

Pictures: Canva (owner rule), the Unit 1 cast + Biscuit + new cut-out stickers **Chef Cilla** (a girl chef) and
**Pico the Mouse**, same style as *The Lost Robot*. Clothes rule: Leo and Pip wear aprons and chef hats, never a dress.

## 5. Lesson by lesson

**Every lesson** (same routine as Units 1-3): title → Remember? → model (meet / echo) → first game → (song after the first
practice game) → games → brain break → **Reader** (new story pages) → reading game → **sound model → phonics game →
Blend & Read → tongue twister** → free talk → check · sticker · **Pet Pal** · home mission · goodbye song · finale.
30-49 pages; every page names its objective part in the teacher note.

### 5.1 Lesson 1 — Yummy Foods at the Festival

**Objective:** *I can name festival foods and say what I have for my meals: "I have soup for lunch."*
**Evidence:** the child sorts 6 foods into meals and says 2 meal sentences about themselves.

| Part | Games |
|---|---|
| Model | food words (two small sets), meals (breakfast / lunch / dinner), *I have … for lunch* (meet + echo) |
| Practice | **Market Sort** (sort-basket: breakfast / lunch / dinner baskets) · **Mystery Bag** (feel the shape, say the food) · **Food Memory** (food ↔ word) |
| Reading | Reader p1-3 · **Read & Match** (picture-match) |
| Phonics | **gr** model · **Letter Monsters (gr / g / r)** · Blend & Read (Train): *grab, grin, grip* · twister *Green grapes grow, grab a grape!* |
| Talk | *What do you have for breakfast?* |

### 5.2 Lesson 2 — I Like Cooking!

**Objective:** *I can say what I like and don't like doing: "I like cooking. I don't like washing up."*
**Evidence:** 3 like / don't like sentences, one with *-ing* about the child.

| Part | Games |
|---|---|
| Practice | **Food Preference Chart** (A1: full sentences, the child's own row) · **Kitchen Charades** (draw-guess or mime: *cooking, eating, washing up, baking*) · **Thumbs Up or Down** (swipe each card: *I like… / I don't like…*) |
| Reading | Reader p4-5 · **Read & Drag** |
| Phonics | **pl** model · **Sound Mole (pl)** · Blend & Read (Slide): *plum, plan, plop* · twister *Plum on a plate, please!* |

### 5.3 Lesson 3 — Listen: Do You Like…? (song)

**Objective:** *I can understand "Do you like…?" and answer "Yes, I do / No, I don't", and say who likes what.*
**Evidence:** Tick or Cross 4 of 5 from the song and dialogues; answers 3 questions about themselves.

| Part | Games |
|---|---|
| Song | **"Do You Like…?"** (new, kids-song-writer: question-and-answer verses, *Yes, I do! No, I don't!* chorus) after the first practice game |
| Practice | **Tick or Cross** (who likes what) · **Hot Plate** (hot-coconut: pass the plate, where it stops answer *Do you like…?*) · **Listen & Tap** (who likes soup? tap the friend) |
| Reading | Reader p6-7 · **Read & Check** |
| Phonics | **sn** model · **Word Build** (snack, snap, snip) · Blend & Read (Gumball) · twister *Snails snack on snacks.* |

### 5.4 Lesson 4 — I Like / I Don't Like! (interview + offer)

**Objective:** *I can interview a friend and offer food: "Do you like soup?" "Would you like some grapes?" "Let's make a pizza!"*
**Evidence:** the child asks 4 friends, fills the chart, reports 2 sentences (*Mia likes soup.*) and makes one offer.

| Part | Games |
|---|---|
| Practice | **Food Survey ★ (new)** — a festival reporter's clipboard: the child ASKS each friend *Do you like…?* (speaking), the friend answers in their own voice, the child ticks the chart; then reports in the third person · **Build a Pizza** (read the recipe steps, put the toppings on, Pico says if he likes it) · **Food Bingo** (sticker-bingo: hear *Mia likes soup*, stamp it) |
| Reading | Reader p8-9 · **Sentence Build** |
| Phonics | **fr** model · **Brick Crush (fr / f / r)** · Blend & Read (Frog): *frog, fret, from* · twister *Fred fries fresh fish.* |

### 5.5 Lesson 5 — Storybook: Chef Cilla's Recipe

**Objective:** *I can read "Chef Cilla's Recipe" with help and say what Pico likes and what the friends offer him.*
**Evidence:** reads 4 pages alone; at the pause offers Pico the right food (*Would you like some pizza?*).
Predict → **Reader** (the whole book, a **pause page** before p10: the child offers Pico food) → **Treasure Radar**
(find the cheese) → **Story Order** → **Picture Crossword** (story words) → act it out → phonics review (**Sound Pick**:
gr, pl, sn, fr) → Blend & Read → twister of the unit → check · sticker · Pet Pal · home · goodbye · finale.
Story GIFs (Canva) only after a written scenario, a preview GIF and the owner's OK.

### 5.6 Lesson 6 — Festival Café (extra practice)

**Objective:** *I can order and offer food quickly and politely.*
Games (different from L1-L5): **Festival Café ★ (new)** — the child is the waiter: customers order with a funny twist
(*Some soup, please — but no carrots!*), the child builds the tray and SAYS the offer (*Would you like some juice?*);
then swaps and orders from Cilla · **Cookie Faces** (decorate cookies as asked) · **Rapid Recall** · **Save the
Balloon** (spell *soup, rice, cake*) · **Treasure Chests** · Twister Race · Blend & Read · free talk with Pico.

### 5.7 Lesson 7 — Boss Test: Festival Feast!

| Part | Format | Pass |
|---|---|---|
| Warm-up | **Food Race** (answer race) | — |
| 1 Listening | who likes what / which meal / what they would like → tap (5) | 4/5 |
| 2 Reading — yes / no | sentences about a big festival picture (5) | 4/5 |
| 3 Reading — the story | 5 gaps in *Chef Cilla's Recipe* | 4/5 |
| 4 Speaking | order a meal, offer two things, answer *Do you like…?* about yourself (5 points) | 4/5 |
| 5 Reading aloud | one story page (5) | 4/5 |
| | practise-again games, Golden Compass piece 3, trophy, Pet Pal, home mission, goodbye | |

### 5.8 No game twice in the unit (and different from Unit 3's same slot)

| Lesson | Games |
|---|---|
| L1 | Market Sort · Mystery Bag · Food Memory · Read & Match · Sound Sort (gr / br) |
| L2 | Like Chart · Kitchen Charades · Spin & Say · Read & Drag · Word Build (pl) |
| L3 | Tick or Cross · Hot Plate · Listen & Tap · Yes or No? · Brick Crush (sn) |
| L4 | Food Survey ★ · Build a Pizza · Food Bingo · Sentence Build · Treasure Chest (fr) |
| L5 | Treasure Radar · Story Order · Picture Crossword · Sound Pick |
| L6 | Festival Café ★ · Cookie Faces · Rapid Recall · Save the Balloon · Treasure Chests |
| L7 | Food Race (boss warm-up) |

While building, each lesson gets 30+ pages with more games from the menu, never repeating one inside the unit (the
`a1LessonLength.test.ts` check).

### Real-life transfer (home missions)

L1 say what you have for each meal · L2 tell your family what you like doing at home · L3 sing the song and ask "Do you
like…?" · L4 do a food survey at home · L5 read the story to your family · L6 play café at home · L7 show your medal
and offer someone a snack in English.

## 6. What has to be built (after approval)

| Item | What | How |
|---|---|---|
| Story pictures | 12 pages of *Chef Cilla's Recipe* + 2 festival backgrounds (market, café counter) | Canva (owner rule), reference: the cast |
| Stickers | Chef Cilla, Pico the Mouse, rice, soup, salad, sandwich, chips, pasta, plate (cut-out, no white background) | Canva, cut-out |
| New games | **Food Survey ★** (`food-survey`), **Festival Café ★** (`festival-cafe`, the A1 upgrade of `cafe-order`: twists, offers, role swap), **Build a Pizza** (`build-dish`: read the step, add the topping) | code |
| Song | "Do You Like…?" — kids-song-writer, one take, karaoke | song bot |
| Lessons | 7 lessons (30-49 pages), homework quests, voices, plans in `a1LessonPlans.ts` updated | code + voice bot |

No paid video. Database rows after the branch is merged (like Units 1-3).

**Approval:** owner, 2026-10-13: "next"
