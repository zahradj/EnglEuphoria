# A1 Playground Roadmap — Welcome Town

**Owner request (2026-10-09):** "Start from lesson one. Use the curriculum blueprint and the lesson blueprint … the quality skill …
create a list of activities that can be used in level A1 … deep research (Oxford, Cambridge, online English schools, learning
apps, fun games, video games) … create a roadmap for level A1 Playground. You can use some of the Pre-A1 as well."
"The activity should be gamified and interactive. Create a list of every possible activity that can be used."

Companion file: [`docs/a1-activity-library.md`](a1-activity-library.md) — every gamified activity, its status and where it fits.

---

## 1. Who and what

| | |
|---|---|
| Learners | ages 6-9 who finished Pre-A1 (or placed at A1); 1-on-1 online, 30 min, 22 pages (`docs/playground-lesson-blueprint.md`) |
| World | **Welcome Town** — school, park, shops, homes. Cast: Pip (fox, boy), Mia (mouse, girl), Leo (lion, boy), Bella (bunny, girl), Willow (bird, girl), Miss Marigold (owl, teacher) |
| Exit level | Cambridge **A1 Movers** language (bridge from Pre A1 Starters); the child can talk about self, family, school, home, animals, food, clothes, weather, daily routine and town in short sentences, ask and answer simple questions, read short sentences |
| What changes from Pre-A1 | words → **sentences and questions**; listening for detail; first reading of sentences; phonics moves to blends and digraphs; the child **asks** as well as answers; every lesson ends in a real mini-conversation |

## 2. Design rules (from the blueprint, the quality gate and the research)

1. **One goal per lesson** (curriculum engine: no orphan topics) — written as "I can …". Everything on the 22 pages serves it.
2. **Unit arc of 7 lessons** (same as Pre-A1): L1-L3 new language, L4 put it together (conversation), **L5 story as a real video**
   (scenario first, `kids-video-scenario`), L6 extra practice games, L7 boss review + sticker.
3. **22-page skeleton** (blueprint §3) with the A1 upgrade: the input pages use the **word page** look (character on one side,
   word big on the open side, no plate — owner 2026-10-09) and a **sentence** page after the word pages.
4. **Remember? warm-up** on page 2 of every lesson after the first (`RecallWarmupScene`).
5. **Games, not worksheets** (owner): every practice page is a game with a goal, instant feedback, a win state and juice
   (`game-animation`). At least 1 **signature game** per lesson where using the target language moves the game.
6. **Variety rule**: no game kind twice in a unit (blueprint §3d) and never 3 of the same kind in a row; vary settings and themes
   (`lesson-variety-engine`; register `LESSON_PROFILE` + `RESEARCH_LOG`).
7. **Speaking ≥ 40 %**: a speaking page at least every 3 pages; L4 and L7 end in a free mini-conversation.
8. **Phonics strand** every lesson (A1 continues from Pre-A1 letters): blends → digraphs → long vowels → sight words; one reading
   page of sentences per lesson.
9. **Voices**: recorded character voices only (`speak()` + audio-cache); songs written with `kids-song-writer`.
10. **Quality gate** before "done": `lesson-quality-gate` (semantic, pedagogical, visual, narrative, comfort, voice).

## 3. The 10 units (70 lessons)

Grammar follows the Cambridge young-learners progression (Starters structures first, then Movers: have got, can, there is/are,
present continuous, like + -ing, would like, prepositions, comparatives, present simple routines, time, Let's). Words come from the
official Cambridge Starters/Movers wordlists. Each unit recycles Pre-A1 words of the same theme, then adds the A1 language.

| Unit | Theme (setting) | Can-do goal of the unit | Key A1 language | Phonics |
|---|---|---|---|---|
| 1 | **Hello, Welcome Town!** (school, playground) | greet, introduce myself and a friend, say how I feel and my age | Hello/Hi, My name is…, What's your name?, How are you? I'm happy/tired…, He/She/They + is/are, How old are you? I'm 7, This is my friend | s a t p i n (review) + m d |
| 2 | **At School** (classroom, library) | name school things, say what's mine, follow class instructions | What's this? It's a…, These are…, my/your, in/on/under, Open/Close/Sit down…, Can I have a…? | g o c k, ck |
| 3 | **Family & Friends** (homes, park) | describe my family and people | I've got a brother, He's got…, Mia's mum ('s), tall/short/young/old, hair/eyes | e u r h b |
| 4 | **Me and My Body** (gym, doctor) | talk about my body and what I can do; say what's wrong | I can jump/swim, I can't…, Can you…? Yes, I can, What's the matter? I've got a headache | f ff l ll ss, blends st/sp |
| 5 | **Animals Everywhere** (zoo, farm, pet shop) | describe animals and where they live | There is a… / There are…, How many…?, It can fly, big/bigger, It's got four legs | sh ch, blends fr/fl |
| 6 | **Food & Picnics** (café, market, picnic) | say what I like, order food | I like / I don't like, Do you like…?, Would you like…? Yes, please, some, How much…? | th ng, ai ee |
| 7 | **Home Sweet Home** (house, garden) | describe my home and find things | There's a bed in my bedroom, Where's the cat? behind/next to/in front of/between | oa ie igh |
| 8 | **Clothes & Weather** (wardrobe, seasons) | say what people are wearing and what the weather is like | She's wearing…, What are you wearing?, It's sunny/raining, Put on your coat! | oo ow ar |
| 9 | **My Day** (home, school, clock tower) | tell my daily routine and the time | I get up at 7 o'clock, What time is it?, Monday-Sunday, every day, before/after | or ur ou oi |
| 10 | **Out in Town** (streets, shops, park, bus) | find places, talk about hobbies, make plans | Where's the park? Go straight, turn left, What are you doing? I'm playing…, I like swimming, Let's…! | er air ear, sight-word review |

## 4. Lesson-by-lesson map

Format: **Title** — I can … · key language · signature game (★ = new game to build, ⇄ = port a Pre-A1 game to A1)

### Unit 1 · Hello, Welcome Town!  *(L1-L4 built; L2 being rebuilt to the blueprint)*
1. **Hello, My Name Is…** — greet and say my name · Hello, My name is…, What's your name? · Welcome Party door game (built)
2. **How Are You?** — say how I and others feel · How are you? I'm happy/tired/sad/angry/hungry; He/She is…, They are… · Feelings
   spinner "He is happy!" ⇄ + Name That Feeling (Khan Kids) listen-tap
3. **How Old Are You?** — say my age, count to 20 · How old are you? I'm 7, numbers 11-20 · Birthday Candle Cake ⇄ (candle-cake) to 20
4. **This Is My Friend** — introduce a friend · This is my friend…, He's 8, Nice to meet you · Hello Doors escape (built)
5. **Story: New Friends at the Park** — follow a story, retell 3 lines · story video with pause questions (`story-video`) ⇄
6. **Greeting Games** — use all Unit 1 language fast · Buzzer Show quiz ⇄ + Bingo ⇄
7. **Boss: Meet & Greet** — hold a 6-line conversation · Boss Battle ★ (each right answer = a hit on the Grumpy Cloud)

### Unit 2 · At School
1. **Pencil, Book, Bag!** — name school things · What's this? It's a pencil · Mystery Bag ⇄ (feel and guess)
2. **These Are My Crayons** — singular/plural, my/your · These are…, my/your · Sort Basket ⇄ (this/these bins)
3. **Where's My Pencil?** — find things in/on/under · Where's…? It's in/on/under… · Torch Hunt (built) + Place-it (built)
4. **Can I Have a Ruler?** — ask politely in class · Can I have a…? Here you are · Pip's Classroom Shop ★ (serve the order)
5. **Story: The Lost Lunchbox** (video)
6. **Classroom Games** — Simon Says instructions ⇄ (simon-touch) + Whack-a-word ⇄ (peek-pop)
7. **Boss: School Champion** — Treasure Map quest ★ (stations across the school)

### Unit 3 · Family & Friends
1. **I've Got a Brother** — have got family · I've got…, Have you got…? · Family Photo ⇄ (photo-snap)
2. **Mia's Mum** — possessive 's · This is Mia's mum · Who's Missing? ⇄ (whos-missing)
3. **Tall, Short, Young, Old** — describe people · He's tall, She's got long hair · Guess Who ★ (secret-card upgrade: ask "Has she got…?")
4. **My Best Friend** — describe a friend in 3 sentences · Face Builder ⇄ (build the face you hear, then describe)
5. **Story: Grandpa's Glasses** (video)
6. **Family Games** — Family Tree drag ⇄ + Memory ⇄
7. **Boss: Family Quiz Show** — Jeopardy Board ★

### Unit 4 · Me and My Body
1. **Head, Hands, Feet** — body + have got · I've got two hands · Monster Maker ⇄ (build from spoken description)
2. **I Can Jump!** — can/can't abilities · I can jump, I can't fly · Robo-Copy ⇄ (robot does what you say)
3. **Can You Swim?** — ask about abilities · Can you…? Yes, I can / No, I can't · Obstacle Course ★ (say the action to pass each obstacle)
4. **What's the Matter?** — say what's wrong · I've got a headache/tummy ache · Doctor Pip ★ (patients tell you, you choose the cure)
5. **Story: The Big Race** (video)
6. **Action Games** — Simon Says ⇄ + Body Stack ⇄
7. **Boss: Sports Day** — Racing ★ (each right sentence moves your runner)

### Unit 5 · Animals Everywhere
1. **At the Zoo** — name zoo animals · It's a giraffe, It's big/tall · Claw Machine ⇄
2. **There Are Three Lions** — there is/are + numbers · There is a…, There are… · Count & Catch ⇄ (count-balloons)
3. **It Can Fly!** — what animals can do · It can swim, It's got wings · Animal Riddle ⇄ (listen and guess)
4. **Bigger and Smaller** — compare animals · An elephant is bigger than a mouse · See-Saw Scales ★
5. **Story: Leo Lost at the Zoo** (video)
6. **Animal Games** — Shadow Match ⇄ + Feed the Animals ⇄ (duck-feed)
7. **Boss: Safari Rescue** — Escape Room ★ (four doors, one puzzle each)

### Unit 6 · Food & Picnics
1. **Fruit and Vegetables** — food words · I like apples · Market Sort ⇄ (catch-sort fruit/veg)
2. **Do You Like…?** — ask and answer likes · Do you like…? Yes I do / No I don't · Food Survey ★ (interview 4 friends, fill the chart)
3. **Would You Like Some Juice?** — offer and accept · Would you like…? Yes, please / No, thank you · Pip's Café ★ (serve orders, Blooket Café style)
4. **My Lunchbox** — describe my meal · I've got some bread and some cheese · Lunchbox Builder ★
5. **Story: The Picnic Ants** (video)
6. **Food Games** — Cookie Faces ⇄ + Brick Crush ⇄
7. **Boss: Masterchef** — order-and-cook timer game ★

### Unit 7 · Home Sweet Home
1. **Rooms** — rooms of a house · This is the kitchen · House Builder ⇄
2. **There's a Bed in My Bedroom** — furniture + there is · There's a sofa in the living room · Whose Room? ⇄
3. **Where's the Cat?** — behind/next to/in front of/between · House Hide ⇄ (find the cat by listening)
4. **My Dream House** — describe my home · Design My Room ★ (place furniture, then describe)
5. **Story: The Noisy House** (video)
6. **Home Games** — Moving Day ⇄ + Tidy Up ⇄
7. **Boss: Hide and Seek Champion** — Lamp/Torch Hunt in a dark house ⇄

### Unit 8 · Clothes & Weather
1. **T-shirt, Jeans, Shoes** — clothes · It's a red T-shirt · Dress-Up Doll ★ (dress as you hear)
2. **She's Wearing…** — present continuous wear · She's wearing a hat · Spot the Difference ★ (two pictures, say what's different)
3. **What's the Weather Like?** — weather · It's sunny/raining/snowing · Weather Wheel ⇄ (spin-wheel)
4. **Put On Your Coat!** — dress for the weather · Put on…, Take off… · Weather Dress-Up ★ (weather changes, dress Pip in time)
5. **Story: Pip's Windy Day** (video)
6. **Fashion Games** — Odd One Out ⇄ + Ring Toss ⇄
7. **Boss: Fashion Show** — catwalk show + quiz ★

### Unit 9 · My Day
1. **Get Up, Wash, Eat** — routine verbs · I get up, I brush my teeth · Story Order ⇄ (put the day in order)
2. **What Time Is It?** — o'clock · It's 7 o'clock · Clock Tower ★ (turn the hands to the time you hear)
3. **Monday to Sunday** — days + activities · On Monday I play football · Week Planner ★
4. **My Day** — tell my routine · I get up at 7. Then I… · Daily Diary comic ★ (build a 4-panel comic and read it)
5. **Story: Pip's Busy Day** (video)
6. **Day Games** — Train Recall ⇄ + Pattern Train ⇄
7. **Boss: Beat the Clock** — timed rapid recall ⇄ (rapid-recall)

### Unit 10 · Out in Town
1. **Park, Shop, School** — places · Where's the park? It's next to the shop · Town Map ⇄ (draw-path)
2. **Go Straight, Turn Left** — directions · Go straight, turn left/right · Maze Chase ★ (steer by directions)
3. **What Are You Doing?** — present continuous hobbies · I'm playing football · Charades ★ (act/guess)
4. **Let's Go to the Park!** — make plans · Let's…! Good idea! · Plan the Day ★ (choose and agree)
5. **Story: The Town Treasure Hunt** (video)
6. **Town Games** — Stepping Stones ⇄ + Dash runner ⇄
7. **Boss: A1 Graduation Quest** — Treasure Map across Welcome Town ★ + A1 certificate

## 5. Build order (what makes the most lessons playable soonest)

1. **Unit 1 L1-L7** (L1-L4 exist): rebuild L2 to the blueprint (in progress), build L5 story video scenario, L6-L7.
2. **Port the top 12 Pre-A1 games** to the A1 renderer as universal scenes (like `spin-wheel`, `picture-match`, `recall-warmup`):
   mystery-bag, sort-basket, simon-touch, peek-pop (whack-a-word), buzzer-show, bingo, claw-machine, story-order, rapid-recall,
   memory upgrade, face-builder, monster-maker. Each gets an A1 content mode (sentences, questions).
3. **Build 6 new signature games** that many units reuse: Boss Battle, Treasure Map quest, Pip's Shop/Café (order game),
   Guess Who (ask questions), Spot the Difference, Maze Chase (directions/arcade).
4. Then units 2-10 in order, each lesson through `lesson-variety-engine` research + `lesson-quality-gate`.

## 6. Research sources

- Cambridge English: Pre A1 Starters / A1 Movers / A2 Flyers wordlists (2018+) — https://www.cambridgeenglish.org/pl/Images/149681-yle-flyers-word-list.pdf ; Movers preparation (handbook, sample papers) — https://www.cambridgeenglish.org/gr/exams-and-tests/movers/preparation
- Kid's Box Level 1 (Cambridge, A1) sample — https://assets.cambridge.org/97813166/27334/excerpt/9781316627334_excerpt.pdf ; Oxford Discover 1 (A1, inquiry "Big Question" units) — https://eslconnexus.odoo.com/slides/55
- Online schools: Novakid (25-min 1-on-1, full immersion, TPR, games before/after in its Game World) — https://teast.co/blog/teach-english-online-novakid ; 51Talk (drag-and-drop on-screen games with the teacher) — https://en.51talk.com/articles/7-best-english-courses-for-kids/
- Apps: Lingokids / Duolingo ABC / Khan Academy Kids comparisons — https://learnenglish.life/compare/best-kids-english-apps-2026/ , https://pastory.app/articles/lingokids-vs-duolingo-abc/ ; Khan Kids "Name That Feeling" game show and feelings lessons — https://blog.khanacademy.org/khan-kids-new-lessons-help-kids-name-their-feelings/
- Classroom game platforms: Wordwall templates (Match Up, Group Sort, Whack-a-Mole, Open the Box, Maze Chase, Airplane, Random Wheel…) — https://wordwall.net/features , https://avidopenaccess.org/wp-content/uploads/2020/11/Wordwall-Tip-Sheet.pdf ; Blooket/Gimkit/Kahoot modes (Tower Defense, Gold Quest, Café, Racing, Fishing Frenzy, Floor is Lava, Team mode) — https://ditchthattextbook.com/game-show-classroom-comparing-the-big-5/ , https://triviamaker.com/blooket-vs-gimkit-vs-kahoot/
- ESL game design: Games4ESL feelings lesson — https://games4esl.com/lesson-plans/teaching-feelings-and-emotions/ ; feelings dice — https://www.eslprintables.com/printable.asp?id=144860 ; he/she/they games — https://www.teach-this.com/parts-of-speech/subject-object-pronouns ; TPR online — https://tutor.help.allright.com/en/articles/13832453-tpr-in-online-esl-teaching ; Simon Says A1 — https://twee.com/esl-lesson-plans/simon-says
- Game-based learning evidence (vocabulary gains and retention with digital games for young learners) — https://journal.unnes.ac.id/journals/eej/article/download/25770/7651/129288 , https://wej.unwir.ac.id/index.php/wej/article/view/401
