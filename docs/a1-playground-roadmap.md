# A1 Playground Curriculum — themed worlds (Plan B)

**Owner decision (2026-10-12):** A1 follows the **themed worlds** already seeded as lesson slots in `curriculum_lessons`
(Plan B), not the earlier all-Welcome-Town roadmap. Each unit is its own world and adventure; the lesson titles below are the
database slot titles (the curriculum engine's source of truth). To keep the language order systematic, every world carries one
clear **A1 grammar step**, one **phonics step** and **new words beyond Pre-A1**, so A1 always moves the child up from
Pre-A1 (words) to **sentences, questions and short exchanges** (Cambridge A1 Movers direction).

Earlier plan (Welcome Town only, 2026-10-09): replaced by this file; see git history. Game list:
[`docs/a1-activity-library.md`](a1-activity-library.md) — every A1, universal and Pre-A1 game (Pre-A1 games run in A1 lessons
as `kind: 'prea1'`).

---

## 1. Who and what

| | |
|---|---|
| Learners | ages 6-9 who passed the Pre-A1 Final Test (or placed at A1); 1-on-1 online, 30 min, 22 pages (`docs/playground-lesson-blueprint.md`) |
| Worlds | U1 Welcome Town · U2 Jungle · U3 Space · U4 Food Festival · U5 Monster Town · U6 Ocean · U7 Hero City · U8 Dino Valley · U9 Magic Castle · U10 Gadget Lab |
| Cast | Pip (fox, boy), Mia (mouse, girl), Leo (lion, boy), Bella (bunny, girl), Willow (bird, girl), Miss Marigold (owl, teacher) travel to every world; each world adds 1-2 local friends (built: Coco the monkey in the Jungle, Wim in the Magic Castle). Boys never wear a dress or skirt. |
| Exit level | A1 (Cambridge Movers language): talk about self, animals, food, feelings, people, places, abilities and routines in short sentences; ask and answer simple questions; read short sentences; follow and give simple instructions |
| What changes from Pre-A1 | words → **sentences and questions**; listening for detail; first reading of sentences; phonics moves from letters and CVC blends to **digraphs, blends and vowel teams**; the child **asks** as well as answers; every unit ends in a real mini-conversation |

## 2. Design rules (from the blueprint, the quality gate and the research)

**Any Pre-A1 game can be used in an A1 lesson** (owner: "you can use also the same games from the pre-A"): write it as
`{ id, kind: 'prea1', teacher, scene: <a Pre-A1 scene> }` in a Welcome Town lesson. The Pre-A1 renderer plays it, live-class
sync uses the Pre-A1 sync list (`prea1SyncKinds.ts`) and the voice bake reads its lines with the Pre-A1 extractors. Pre-A1
games speak with the Pre-A1 voices (pip, mia, leo, bella, willow, teacher), not `marigold`.

1. **One goal per lesson** (curriculum engine: no orphan topics) — written as "I can …". Everything on the 22 pages serves it.
2. **Unit arc of 7 lessons** (same as Pre-A1): L1-L3 new language, L4 put it together (conversation), **L5 story as a real video**
   (scenario first, `kids-video-scenario`), L6 extra practice games, L7 boss review + sticker.
3. **22-page skeleton** (blueprint §3) — ONE slide per slot (one vocabulary-reveal slide, one phonics slide; slots 13 personal sentence, 17 sing-back and 18 favourite are required), extras only after slot 20 — with the A1 upgrade: the input pages use the **word page** look (character on one side,
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

Each unit has the same 7-lesson arc as the database slots: **L1-L2 new language · L3 listening lesson around the unit song ·
L4 speaking (put it together) · L5 story video (scenario first) · L6 extra-practice games · L7 Boss Test** (level-test `unit`
mode, 80 % per part, Practise-again packs — same system as Pre-A1).

| Unit | World | Can-do goal of the unit | New A1 grammar step | Key words (beyond Pre-A1) | Phonics |
|---|---|---|---|---|---|
| 1 | **Welcome Town** (built) | greet, introduce myself and a friend, say how we feel | My name is…, What's your name?, How are you?, He/She is…, They are…, This is my friend | friend, teacher, class, tired, hungry, nice to meet you | s a t p i n review + f (as built) |
| 2 | **Jungle** | name jungle animals and say what they can do | It's a…, It can / can't + verb, Can it…? Yes, it can / No, it can't | monkey, parrot, snake, tiger, crocodile, elephant; climb, swing, swim, fly, run, jump | ch, ck (chimp, cheetah, snack, rock) |
| 3 | **Space** | count to 20, say how many, give directions and say where things are | How many…? There is / There are + numbers 11-20, Go left/right/up/down, in/on/under/next to | eleven-twenty, rocket, star, planet, moon, robot, astronaut | th, ng (three, thirteen, ring, swing) |
| 4 | **Food Festival** | say what I like, ask a friend, offer and accept food | I like / I don't like…, Do you like…? Yes, I do / No, I don't, Would you like some…? Yes, please / No, thank you | rice, cheese, soup, chicken, salad, sandwich, chips, grapes | consonant blends gr pl sn br (grapes, plum, snack, bread) |
| 5 | **Monster Town** | say how I and others feel and describe what someone looks like | I'm / He's / She's + feeling (tired, scared, excited, bored), He's got / She's got + big/small/long/short + eyes/hair/teeth, tall/short | scared, excited, bored, surprised; teeth, hair, horn, tail | ee, ea (green, teeth, feet, scream) |
| 6 | **Ocean** | name sea animals, say where they live, ask and answer yes/no questions | Is it a…? Yes, it is / No, it isn't, It lives in/on…, Where does it live? (chunk) | shark, whale, octopus, crab, turtle, starfish, shell, reef | sh, wh (shark, shell, fish, whale) |
| 7 | **Hero City** | say what I can and can't do, ask for and offer help | I can / I can't (people), Can you…?, Can I help you? Yes, please, Give/Show/Tell me… | help, carry, lift, fix, save, push, pull; strong, kind | ai, ay (rain, train, play, day) |
| 8 | **Dino Valley** | compare two things by size, speed and length | big/small, fast/slow, long/short → bigger/smaller/faster/slower/longer + than | dinosaur, egg, tail, neck, claw, footprint | oo, ar (tooth, food, moon, large, sharp) |
| 9 | **Magic Castle** (L1-L3 built) | name rooms and furniture, say what is where | There is / There are…, Where is…? It's in/on/under/behind/next to… | kitchen, bedroom, bathroom, hall, stairs, lamp, window, door | oa, ow (moat, coat, tower, crown) |
| 10 | **Gadget Lab** | follow and give step-by-step instructions | Press/Turn/Open/Close/Wait…, First…, Then…, Next…, How do I…? (chunk) | button, switch, screen, wheel, gadget; press, turn, open, close, fix | er, ur, or + sight-word review (computer, turn, robot, for) |

## 4. Lesson-by-lesson map

Format: **slot title** — I can … · key language · signature game (A1 = built in Welcome Town renderer, U = universal,
⇄ = Pre-A1 game used as `kind: 'prea1'`, ★ = new game to build). Remember? warm-up on page 2 of every lesson; song after the
words and the first game; Boss Tests mirror the Pre-A1 ones.

### Unit 1 · Welcome Town *(all 7 built — L1-L4 published; L5-L7 built, waiting to publish)*
1. **Hello, My Name Is...** — greet and say my name · Hello, My name is…, What's your name? · Welcome Party doors (A1)
2. **Saying 'How Are You?'** — say how I and friends feel · How are you? I'm…, He/She is…, They are… · Feelings Survey (A1)
3. **Listen to the Greetings Song** — listening lesson · who sings each line, build the lines · song karaoke (A1)
4. **Meet a Friend: Speak!** — introduce a friend · This is my friend…, Nice to meet you · Hello Doors (A1)
5. **Storybook: The Playground Friends** — follow a story and answer · story video with pause questions
6. **Extra Practice: Greeting Game!** — use all Unit 1 language fast · Buzzer Show ⇄ + Bingo ⇄
7. **Unit Review & Boss Test: Say Hello!** — hold a 6-line conversation · Boss Test

### Unit 2 · Jungle *(L1 built — unit objective and full outcomes: [`docs/a1-unit-2-jungle.md`](a1-unit-2-jungle.md))*
**Unit objective:** describe a jungle animal in 4 sentences (what it is, what it looks like, what it can and can't do) and
ask and answer "Can it…?".
1. **Jungle Animals: Lion, Monkey, Bird** — name 3 jungle animals · I am a… / It's a… (built)
2. **What Can Animals Do?** — say what an animal can and can't do · A monkey can climb. It can't fly. · Jungle Obstacle Run ★
3. **Listen to the Jungle Animal Song** — understand "Can it…?" and answer; meet elephant, snake, crocodile in the song · Who Can? buzzer ⇄
4. **Talk About Animals!** — describe an animal in 3-4 sentences (big/small, long/short) and ask one question · Animal Riddle ⇄ (child is the riddler)
5. **Storybook: The Jungle Rescue** — follow the story and answer questions · story video
6. **Extra Practice: Animal Action Match!** — use everything quickly · Charades ⇄ + Peek-Pop ⇄
7. **Unit Review & Boss Test: Jungle Explorer!** — describe two animals and ask one question · Boss Test

### Unit 3 · Space
1. **Count to Ten in Space!** — count 1-20 and say how many · How many stars? There are twelve · Count & Catch ⇄ (count-balloons, to 20)
2. **Left, Right, Up, Down: Space Directions** — follow directions · Go left / right / up / down · Rocket Maze ★ (steer by the direction you hear, Wordwall Maze Chase style)
3. **Listen to the Counting Rocket Song** — listening lesson · countdown 20 → 1 · Listen & Colour ⇄ (Cambridge format)
4. **Where Is It? In, On, Under!** — say where things are · It's on the moon, next to the rocket · Torch Hunt (A1) in a dark spaceship
5. **Storybook: The Lost Robot** — story video · directions + there are
6. **Extra Practice: Number & Direction Match!** — Rapid Recall ⇄ + Stepping Stones ⇄
7. **Unit Review & Boss Test: Space Navigator!** — Boss Test

### Unit 4 · Food Festival
1. **Yummy Foods at the Festival** — name festival foods · I like rice · Market Sort ⇄ (catch-sort)
2. **More Foods: Rice, Cheese, Pizza** — say what I don't like · I don't like cheese · Food Preference Chart ⇄ (A1: full sentences)
3. **Listen: What Do You Like to Eat?** — listening lesson · Do you like…? Yes, I do / No, I don't · Tick or Cross ⇄ (who likes what)
4. **I Like / I Don't Like!** — interview a friend · Do you like…? + Would you like some…? · Food Survey ★ (ask 4 friends, fill the chart)
5. **Storybook: Chef Cilla's Recipe** — story video · some, would you like
6. **Extra Practice: Food Taste Test!** — Pip's Café ★ (serve orders) + Cookie Faces ⇄
7. **Unit Review & Boss Test: Festival Feast!** — Boss Test

### Unit 5 · Monster Town
1. **How Do You Feel? Happy, Sad, Tired** — say how I and others feel · I'm scared, He's excited · Feelings Wheel ⇄ (new feelings)
2. **What Do They Look Like? Tall, Short, Big, Small** — describe looks · She's got long hair, He's tall · Face Builder ⇄ (build what you hear)
3. **Listen to the Feelings Song** — listening lesson · Who is…? · Listen & Tap (A1, "Name That Feeling")
4. **Describe a Monster Friend!** — describe a monster in 3 sentences · He's got… He's… · Monster Maker ⇄ (child describes, teacher builds)
5. **Storybook: Bibi's Bad Day** — story video · feelings + because (chunk)
6. **Extra Practice: Feelings Charades!** — Charades ⇄ + Guess Who ★ (ask "Has he got…?")
7. **Unit Review & Boss Test: Monster Portrait!** — Boss Test
→ **A1 Halfway Check after Unit 5** (like Pre-A1 Checkpoint 1).

### Unit 6 · Ocean
1. **Meet the Sea Animals: Shark, Whale** — name sea animals · It's a whale · Shape/Sound Fishing ⇄ (fish for the animal you hear)
2. **More Sea Animals: Octopus, Crab** — describe sea animals · It's got eight legs · Tile Reveal ⇄ (guess early)
3. **Listen: Where Do They Live?** — listening lesson · It lives in the sea / on the beach · Sort Basket ⇄ (sea / beach / reef)
4. **Ask and Answer: Is It a Shark?** — ask yes/no questions · Is it a…? Yes, it is / No, it isn't · Secret Card ⇄ (child asks)
5. **Storybook: The Treasure Reef** — story video
6. **Extra Practice: Ocean Question Game!** — Buzzer Show ⇄ + Memory ⇄
7. **Unit Review & Boss Test: Ocean Explorer!** — Boss Test

### Unit 7 · Hero City
1. **Superhero Powers: I Can Help!** — say what I can do · I can carry, I can fix · Hero Trials ⇄ (built for Pre-A1 U10L7)
2. **Can You Lift It? Can't and Can!** — ask about abilities · Can you lift it? No, I can't · Can It? ⇄ (built, A1 sentences)
3. **Listen to the Hero Helper Song** — listening lesson · Who can help? · Who Said It? ⇄
4. **Offer to Help: Give, Show, Tell** — offer and ask for help · Can I help you? Yes, please. Give me the… · Hero Mission ★ (people ask, you choose the helper and say it)
5. **Storybook: Captain Spark Saves the Day** — story video
6. **Extra Practice: Hero Mission Match!** — Simon Says ⇄ + Ring Toss ⇄
7. **Unit Review & Boss Test: Super Helper!** — Boss Test

### Unit 8 · Dino Valley
1. **Dinosaur Sizes: Big and Small** — describe dinosaurs · It's big, It's got a long neck · Part Peek ⇄
2. **Fast or Slow? Long or Short?** — opposites · It's fast / slow · Odd One Out ⇄
3. **Listen to the Dinosaur Compare Song** — listening lesson · bigger than · Tick or Cross ⇄
4. **This One Is Bigger Than That One!** — compare two things · The T-rex is bigger than… · See-Saw Scales ★ (say the comparison to tip the scale)
5. **Storybook: Rexi and Tilly's Race** — story video
6. **Extra Practice: Compare the Dinosaurs!** — Racing ★ (each right sentence moves your dino) + Pattern Train ⇄
7. **Unit Review & Boss Test: Dino Detective!** — Boss Test

### Unit 9 · Magic Castle *(L1-L3 built and published)*
1. **Rooms in the Castle: Kitchen, Bedroom** — name rooms (built)
2. **Castle Furniture: Bed, Lamp, Door, Window** — name furniture (built)
3. **Listen: Where Is the Magic Lamp?** — listening lesson, prepositions (built)
4. **There Is / There Are in My Room!** — describe a room · There's a bed, There are two lamps · Design My Room ★ (place furniture, then describe)
5. **Storybook: The Hidden Treasure Room** — story video
6. **Extra Practice: Find It in the Castle!** — Torch Hunt (A1) + Lift the Flap ⇄
7. **Unit Review & Boss Test: Castle Search!** — Boss Test

### Unit 10 · Gadget Lab
1. **Cool Gadgets: Press, Turn, Open** — follow gadget instructions · Press the button, Turn the wheel · Robo-Copy ⇄ (the robot does what you say)
2. **More Actions: Close, Wait, Fix** — more instructions · Close the door, Wait! · Simon Says ⇄ (A1: two-step)
3. **Listen: How Do I Turn It On?** — listening lesson · First… then… · Story Order ⇄ (put the steps in order)
4. **First, Then, Next: Give Instructions!** — give 3-step instructions · First press…, Then turn…, Next… · Build-a-Bot ★ (child gives the steps, the bot builds)
5. **Storybook: Nano the Bot's Big Invention** — story video
6. **Extra Practice: Robot Instruction Match!** — Maze Chase ★ + Rapid Recall ⇄
7. **Unit Review & Boss Test: Tech Inventor!** — Boss Test
→ **A1 Final Test after Unit 10** (moves to A2) + the A1 "Rising Star" certificate (two medals).

Every unit gets its own objective file before its lessons are built (owner, 2026-10-12): unit objective, what the child
brings from before, new vs recycled language, and a progressive "I can…" outcome + evidence for every lesson, researched
from Cambridge, Oxford and online schools. Unit 2: [`docs/a1-unit-2-jungle.md`](a1-unit-2-jungle.md).

## 5. Build order

1. **Unit 1:** publish L5-L7 (built).
2. **Units 2-10 in order**, one lesson at a time through `lesson-variety-engine` research → build → `lesson-quality-gate`;
   Unit 2 and Unit 9 reuse their built lessons.
3. **New signature games** in the order the units need them: Jungle Obstacle Run (U2), Rocket Maze (U3), Food Survey +
   Pip's Café (U4), Guess Who (U5), Hero Mission (U7), See-Saw Scales + Racing (U8), Design My Room (U9), Build-a-Bot +
   Maze Chase (U10).
4. **Assessments** reuse the Pre-A1 system: Boss Test in every L7, A1 Halfway Check after Unit 5, A1 Final Test after
   Unit 10, Practise-again packs, parent report.

## 6. Research sources

- Cambridge English: Pre A1 Starters / A1 Movers / A2 Flyers wordlists (2018+) — https://www.cambridgeenglish.org/pl/Images/149681-yle-flyers-word-list.pdf ; Movers preparation (handbook, sample papers) — https://www.cambridgeenglish.org/gr/exams-and-tests/movers/preparation
- Kid's Box Level 1 (Cambridge, A1) sample — https://assets.cambridge.org/97813166/27334/excerpt/9781316627334_excerpt.pdf ; Oxford Discover 1 (A1, inquiry "Big Question" units) — https://eslconnexus.odoo.com/slides/55
- Online schools: Novakid (25-min 1-on-1, full immersion, TPR, games before/after in its Game World) — https://teast.co/blog/teach-english-online-novakid ; 51Talk (drag-and-drop on-screen games with the teacher) — https://en.51talk.com/articles/7-best-english-courses-for-kids/
- Apps: Lingokids / Duolingo ABC / Khan Academy Kids comparisons — https://learnenglish.life/compare/best-kids-english-apps-2026/ , https://pastory.app/articles/lingokids-vs-duolingo-abc/ ; Khan Kids "Name That Feeling" game show and feelings lessons — https://blog.khanacademy.org/khan-kids-new-lessons-help-kids-name-their-feelings/
- Classroom game platforms: Wordwall templates (Match Up, Group Sort, Whack-a-Mole, Open the Box, Maze Chase, Airplane, Random Wheel…) — https://wordwall.net/features , https://avidopenaccess.org/wp-content/uploads/2020/11/Wordwall-Tip-Sheet.pdf ; Blooket/Gimkit/Kahoot modes (Tower Defense, Gold Quest, Café, Racing, Fishing Frenzy, Floor is Lava, Team mode) — https://ditchthattextbook.com/game-show-classroom-comparing-the-big-5/ , https://triviamaker.com/blooket-vs-gimkit-vs-kahoot/
- ESL game design: Games4ESL feelings lesson — https://games4esl.com/lesson-plans/teaching-feelings-and-emotions/ ; feelings dice — https://www.eslprintables.com/printable.asp?id=144860 ; he/she/they games — https://www.teach-this.com/parts-of-speech/subject-object-pronouns ; TPR online — https://tutor.help.allright.com/en/articles/13832453-tpr-in-online-esl-teaching ; Simon Says A1 — https://twee.com/esl-lesson-plans/simon-says
- Game-based learning evidence (vocabulary gains and retention with digital games for young learners) — https://journal.unnes.ac.id/journals/eej/article/download/25770/7651/129288 , https://wej.unwir.ac.id/index.php/wej/article/view/401
