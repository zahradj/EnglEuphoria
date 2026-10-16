# A1 Playground Curriculum — themed worlds (Plan B)

**Owner decision (2026-10-12):** A1 follows the **themed worlds** already seeded as lesson slots in `curriculum_lessons`
(Plan B), not the earlier all-Welcome-Town roadmap. Each unit is its own world and adventure; the lesson titles below are the
database slot titles (the curriculum engine's source of truth). To keep the language order systematic, every world carries one
clear **A1 grammar step**, one **phonics step** and **new words beyond Pre-A1**, so A1 always moves the child up from
Pre-A1 (words) to **sentences, questions and short exchanges** (Cambridge A1 Movers direction).

Earlier plan (Welcome Town only, 2026-10-09): replaced by this file; see git history. **Strengthened 2026-10-12** (owner: "fix the curriculum… make it stronger and better… and fun"): the Welcome Town draft's grammar spine (present continuous, must, weather, clothes, routines, time, past) moved into the worlds, *can* no longer repeated, and a fun layer added (§3, §4b). Game list:
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
| 1 | **Welcome Town** (built) | greet, introduce myself and a friend, say how we feel | be: I'm / He's / She's / They're…, What's your name?, How are you?, This is my friend | friend, teacher, class, tired, hungry, nice to meet you | s a t p i n review + f (as built) |
| 2 | **Jungle** | describe a jungle animal in 4 sentences (what it is, looks like, can, can't) and ask "Can it…?" | It can / can't + verb (animals), Can it…? Yes, it can / No, it can't, It's got a long tail | monkey, elephant, snake, crocodile; climb, swing; long, short, tail | ch, ck (chimp, chick, lunch, rock) |
| 3 | **Space** | count to 100 in tens, say how many, steer with directions and say what the weather is like on a planet | How many…? There are + 21-100 (tens), Go left / right / up / down, above / below, What's the weather like? It's hot / cold / windy / sunny | thirty…one hundred, rocket, star, planet, moon, astronaut; weather, hot, cold, windy, sunny, cloudy, snow | th, ng (three, thirty, ring, swing) |
| 4 | **Food Festival** | say what I like and like doing, ask a friend, offer and accept food, plan a meal | I like / I don't like + food **and + -ing** (I like cooking), Do you like…?, Would you like some…? Yes, please / No, thank you, **Let's…!** | rice, soup, salad, sandwich, chips, grapes; breakfast, lunch, dinner; cook | blends gr pl sn br (grapes, plum, snack, bread) |
| 5 | **Monster Town** | say how someone feels and why, and describe a monster's looks, family and clothes | He's / She's + feeling **because…** (chunk), He's got / She's got (looks **and family**: She's got a little brother), **He's wearing…** | scared, excited, bored, surprised; teeth, horn, tail; wear, scarf, glasses | ee, ea (green, teeth, feet, scream) |
| 6 | **Ocean** | name sea animals, say **what they are doing** and where they live, ask and answer yes/no questions | **Present continuous:** What's it doing? It's swimming / hiding, Is it a…? Yes, it is / No, it isn't, **present simple with it:** It lives in… It eats… | shark, whale, octopus, crab, turtle, starfish, shell; hide, dive | sh, wh (shark, shell, fish, whale) |
| 7 | **Hero City** | say what I can do **well**, offer help, find out what's wrong and give hero rules | I can… **well / fast** (adverbs), Can I help you? Yes, please, **What's the matter? I've got a cold / headache**, **You must / mustn't…** | help, carry, lift, fix, save; headache, cold, toothache; strong, kind | ai, ay (rain, train, play, day) |
| 8 | **Dino Valley** | compare dinosaurs and say what they **were** like long ago | **comparatives + than** and **the biggest**, **was / were, had** (past chunks: It was big. It had sharp teeth.) | dinosaur, egg, neck, claw, footprint; long ago, fast, slow | oo, ar (tooth, food, moon, large, sharp) |
| 9 | **Magic Castle** (L1-L3 built) | name rooms and furniture, say what is where and **whose** it is | There is / There are…, Where is…? It's behind / between / in front of…, **Whose…is it? It's Wim's.** | kitchen, bedroom, bathroom, hall, stairs, lamp, window | oa, ow (moat, coat, tower, crown) |
| 10 | **Gadget Lab** | give step-by-step instructions and tell a robot's day | imperatives, First… Then… Next…, **present simple routines:** Nano gets up at 7 o'clock, **What time is it?**, days of the week | button, switch, screen, wheel; o'clock, get up, go to bed, Monday-Sunday | er, ur, or + sight-word review (computer, turn, robot, for) |

**Why these steps (research, 2026-10-12).** Cambridge's Young Learners handbook names the structures A1 Movers candidates
need most: *there is/are, be, have (got), can/can't, must/mustn't and the present continuous of common action verbs*; the
Movers grammar list adds past simple (regular and irregular), comparatives and superlatives, adverbs, verb + -ing / + to,
*Let's*, *What's the matter?*, *Whose?* and *because*. The first themed-worlds draft taught *can* three times (Pre-A1 U10,
A1 U2, A1 U7) and missed present continuous, *must*, weather, clothes, routines, time and the past — exactly what the Welcome
Town draft had. The table above keeps every world and its database slots and moves those missing steps into the world where
they fit the story (dinosaurs lived **long ago** → past; sea animals **are swimming / hiding** → present continuous; heroes
**must** help and ask **What's the matter?**; a robot's **day** → routines and time).

### Grammar coverage check (every A1 Movers step has a home)

| Movers step | Unit | Recycled again in |
|---|---|---|
| be + he/she/they | 1 | 5 |
| can / can't (animals), Can it…? | 2 | 7 (people + well/fast) |
| have got (it / he / she) | 2 (it's got) · 5 (looks, family) | 6, 8 |
| there is / there are, How many? 21-100 | 3 | 9 |
| imperatives, directions | 3 (go left/right) | 10 (instructions) |
| weather | 3 | 6 (beach weather in the story) |
| like / don't like + noun + -ing, Do you like…? | 4 | 5 |
| would like, some, Let's | 4 | 7 |
| because (chunk) | 5 | 7, 8 |
| present continuous (wearing; doing) | 5 (wearing) · 6 (doing) | 7, 10 |
| present simple with he/she/it | 6 (it lives / eats) · 10 (routines) | 8 |
| adverbs well / fast | 7 | 8 |
| What's the matter? + illnesses | 7 | 10 (fix the robot) |
| must / mustn't | 7 | 10 (lab rules) |
| comparatives, superlatives | 8 | 10 |
| past: was / were, had | 8 | 10 (story: what Nano did) — full past simple in A2 |
| prepositions behind / between / in front of, Whose? | 9 | 10 |
| time, days, routines | 10 | A2 |

### Slot-title changes (applied in the database 2026-10-12, only where the old title taught a repeat)

| Slot | Old title | New title | Why |
|---|---|---|---|
| U3 L1 | Count to Ten in Space! | **Count to 100 in Space!** | 1-10 is Pre-A1 and 11-20 is A1 U1-U2 recycling; Movers counts to 100 |
| U3 L4 | Where Is It? In, On, Under! | **What's the Weather on the Planets?** | in/on/under is Pre-A1 and the Magic Castle teaches place words; weather had no home |
| U10 L2 | More Actions: Close, Wait, Fix | **Nano's Day: What Time Is It?** | routines, time and days had no home |


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
**Unit objective:** count to 100 in tens, say how many, steer a rocket with directions and give a planet weather report.
1. **Count to 100 in Space!** *(new title)* — count in tens to 100 and say how many · There are forty stars · Count & Catch ⇄ (count-balloons, tens)
2. **Left, Right, Up, Down: Space Directions** — follow and give directions · Go left / up, The moon is above the rocket · Rocket Maze ★ (steer by the direction you hear, then the child steers the teacher)
3. **Listen to the Counting Rocket Song** — listening lesson · countdown 100 → 10 in tens · Listen & Colour ⇄ (Cambridge format)
4. **What's the Weather on the Planets?** *(new title)* — say what the weather is like · It's cold and snowy on Planet Ice · Planet Weather Report ★ (the child is the TV weather reporter; packs the astronaut's bag for each planet)
5. **Storybook: The Lost Robot** — story video · directions + weather + there are
6. **Extra Practice: Number & Direction Match!** — Rapid Recall ⇄ + Stepping Stones ⇄
7. **Unit Review & Boss Test: Space Navigator!** — Boss Test

### Unit 4 · Food Festival
**Unit objective:** say what I like and like doing, ask a friend, and offer and accept food at a festival stall.
1. **Yummy Foods at the Festival** — name festival foods and meals · I have rice for lunch · Market Sort ⇄ (breakfast / lunch / dinner)
2. **More Foods: Rice, Cheese, Pizza** — say what I like and don't like **doing** · I like cooking. I don't like washing up. · Food Preference Chart ⇄ (A1: full sentences)
3. **Listen: What Do You Like to Eat?** — listening lesson · Do you like…? Yes, I do / No, I don't · Tick or Cross ⇄ (who likes what)
4. **I Like / I Don't Like!** — interview a friend, offer food · Do you like…? Would you like some…? Let's make a pizza! · Food Survey ★ (ask 4 friends, fill the chart)
5. **Storybook: Chef Cilla's Recipe** — story video · some, would you like, let's
6. **Extra Practice: Food Taste Test!** — Pip's Café ★ (serve orders) + Cookie Faces ⇄
7. **Unit Review & Boss Test: Festival Feast!** — Boss Test

### Unit 5 · Monster Town
**Unit objective:** describe a monster in 4 sentences (feeling + why, looks, family, what it's wearing).
1. **How Do You Feel? Scared, Bored, Excited!** — say how someone feels and why · She's scared because it's dark · Monster Mood Machine ★ (new feelings + because)
2. **What Do They Look Like? Tall, Short, Big, Small** — describe looks and family · She's got long hair. She's got a little brother. · Face Builder ⇄ (build what you hear)
3. **Listen to the Feelings Song** — listening lesson · Who is…? · Listen & Tap (A1, "Name That Feeling")
4. **Describe a Monster Friend!** — describe a monster in 4 sentences · He's got three eyes. He's wearing a big hat. · Monster Maker ⇄ (the child describes, the teacher builds; then swap)
5. **Storybook: Bibi's Bad Day** — story video · feelings + because
6. **Extra Practice: Feelings Charades!** — Charades ⇄ + Guess Who ★ (ask "Has he got…? Is he wearing…?")
7. **Unit Review & Boss Test: Monster Portrait!** — Boss Test
→ **A1 Halfway Check after Unit 5** (like Pre-A1 Checkpoint 1).

### Unit 6 · Ocean
**Unit objective:** say what a sea animal is doing and where it lives, and find a hidden animal by asking yes/no questions.
1. **Meet the Sea Animals: Shark, Whale** — name sea animals · It's a whale · Shape/Sound Fishing ⇄ (fish for the animal you hear)
2. **More Sea Animals: Octopus, Crab** — say what an animal **is doing** · The octopus is hiding. The crab is walking. · Live Reef ★ (a moving reef: the child says what each animal is doing to light it up)
3. **Listen: Where Do They Live?** — listening lesson · It lives in the sea. It eats fish. · Sort Basket ⇄ (sea / beach / reef)
4. **Ask and Answer: Is It a Shark?** — ask yes/no questions · Is it a…? Is it swimming? Yes, it is / No, it isn't · Secret Card ⇄ (the child asks)
5. **Storybook: The Treasure Reef** — story video · present continuous + a windy, sunny beach
6. **Extra Practice: Ocean Question Game!** — Buzzer Show ⇄ + Memory ⇄
7. **Unit Review & Boss Test: Ocean Explorer!** — Boss Test

### Unit 7 · Hero City
**Unit objective:** help a citizen: ask what's wrong, offer help, say what I can do well and give one hero rule.
1. **Superhero Powers: I Can Help!** — say what I can do **well / fast** · I can run fast. I can swim well. · Hero Trials ⇄ (A1: with well / fast)
2. **Can You Lift It? Can't and Can!** — ask a friend and compare · Can you lift it? No, I can't, but Leo can! · Can It? ⇄ (A1: people, "but … can")
3. **Listen to the Hero Helper Song** — listening lesson · hero rules: You must help. You mustn't run on the road. · Who Said It? ⇄
4. **Offer to Help: Give, Show, Tell** — find out what's wrong and help · What's the matter? I've got a headache. Can I help you? · Hero Mission ★ (citizens say what's wrong, the child picks the helper and says it)
5. **Storybook: Captain Spark Saves the Day** — story video
6. **Extra Practice: Hero Mission Match!** — Simon Says ⇄ (hero rules) + Ring Toss ⇄
7. **Unit Review & Boss Test: Super Helper!** — Boss Test

### Unit 8 · Dino Valley
**Unit objective:** compare two dinosaurs and say what one was like long ago.
1. **Dinosaur Sizes: Big and Small** — say what a dinosaur was like · It was big. It had a long neck. · Fossil Dig ★ (brush the sand, name the part, say "It had…")
2. **Fast or Slow? Long or Short?** — opposites · It was fast / slow · Odd One Out ⇄
3. **Listen to the Dinosaur Compare Song** — listening lesson · bigger than, the biggest · Tick or Cross ⇄
4. **This One Is Bigger Than That One!** — compare two things · The T-rex is bigger than… The biggest is… · See-Saw Scales ★ (say the comparison to tip the scale)
5. **Storybook: Rexi and Tilly's Race** — story video · past chunks: was, had, ran
6. **Extra Practice: Compare the Dinosaurs!** — Racing ★ (each right sentence moves your dino) + Pattern Train ⇄
7. **Unit Review & Boss Test: Dino Detective!** — Boss Test

### Unit 9 · Magic Castle *(L1-L3 built and published)*
1. **Rooms in the Castle: Kitchen, Bedroom** — name rooms (built)
2. **Castle Furniture: Bed, Lamp, Door, Window** — name furniture (built)
3. **Listen: Where Is the Magic Lamp?** — listening lesson, prepositions (built)
4. **There Is / There Are in My Room!** — describe a room and say whose things are · There are two lamps. Whose crown is it? It's Wim's. · Design My Room ★ (place furniture, then describe)
5. **Storybook: The Hidden Treasure Room** — story video
6. **Extra Practice: Find It in the Castle!** — Lift the Flap ⇄ + Memory ⇄ (Torch Hunt is already L3's game)
7. **Unit Review & Boss Test: Castle Search!** — Boss Test

### Unit 10 · Gadget Lab
**Unit objective:** give a robot 3-step instructions and tell its day with times.
1. **Cool Gadgets: Press, Turn, Open** — follow gadget instructions · Press the button, Turn the wheel · Robo-Copy ⇄ (the robot does what you say)
2. **Nano's Day: What Time Is It?** *(new title)* — tell a routine with times and days · Nano gets up at seven o'clock. On Monday he… · Clock Quest ★ (set the clock to the time you hear, then tell the child's own day)
3. **Listen: How Do I Turn It On?** — listening lesson · First… then… · Story Order ⇄ (put the steps in order)
4. **First, Then, Next: Give Instructions!** — give 3-step instructions and a lab rule · First press…, Then turn… You mustn't touch the red button! · Build-a-Bot ★ (the child gives the steps, the bot builds)
5. **Storybook: Nano the Bot's Big Invention** — story video · what Nano did (past chunks)
6. **Extra Practice: Robot Instruction Match!** — Maze Chase ★ + Rapid Recall ⇄
7. **Unit Review & Boss Test: Tech Inventor!** — Boss Test
→ **A1 Final Test after Unit 10** (moves to A2) + the A1 "Rising Star" certificate (two medals).

**Lesson plans in code:** every one of the 70 lessons above has a full plan (objective, grammar, new words, phonics, game,
evidence, fun hook, home mission) in `src/curriculum/roadmap/a1LessonPlans.ts`, synced to the database rows; the unit
buckets are in `src/curriculum/roadmap/a1Roadmap.ts`; A1 lesson rules are in `docs/playground-lesson-blueprint.md` §3g.

Every unit gets its own objective file before its lessons are built (owner, 2026-10-12): unit objective, what the child
brings from before, new vs recycled language, and a progressive "I can…" outcome + evidence for every lesson, researched
from Cambridge, Oxford and online schools. Unit 2: [`docs/a1-unit-2-jungle.md`](a1-unit-2-jungle.md).

## 4b. The fun layer — why a child wants to come back

What the research says about 6-9 year olds:
- Enjoyment drives them at this age; a feeling of progress matters more later on (Myles, primary languages research).
- The strongest motivation factors are meaningful, challenging tasks at the right level, working together, and the child's own curiosity (systematic review of young learners' motivation, SiSAL 2026).
- Choices make children work harder, and tasks that are too easy or too hard demotivate them (Cambridge English, "How to increase motivation").
- Rewards that are not tied to learning fade once they stop (same review). Lingokids, for example, gives a star only when the activity's learning goal is met.

So in A1:

| Fun mechanic | How it works | Rule that keeps it about learning |
|---|---|---|
| **The A1 Explorer Map** | One map with the 10 worlds. Each L7 ends with a 5-second teaser of the next world (a shadow, a sound, a local friend waving). | The next world opens when the Boss Test is passed (80 % per part). |
| **The Golden Compass** (story across A1) | Willow's compass breaks in the Jungle (Unit 2); one piece is hidden in each world from Unit 2 to Unit 10. The cast travels to find them, and the 9 pieces open A2. | The piece is the Boss Test reward. The story frame never replaces the lesson's goal. |
| **Explorer Passport** | One stamp per lesson, shown at the sticker page. | The stamp is earned by saying the lesson's "I can…" sentence (the objective), never for taps. |
| **Real choices** | At least 2 per lesson: which friend to help, which path, which animal to describe, your favourite. | Every choice needs the target language to make it. |
| **The child is the expert** | In every L4 the child teaches or tests the local friend (riddler, reporter, robot boss, chef). | The friend makes a mistake the child corrects in the target language. |
| **Move and sing** | A song or action break every 8-10 minutes (TPR). | The words of the break are the lesson's words. |
| **Surprise** | One "peek" moment per lesson (something hidden, a friend's running joke, a twist in the story). | It comes after the words are taught, never instead of them. |
| **My Explorer Journal** | The child's own sentences from every lesson, collected per unit for the parent report and the home mission. | Only sentences the child really said or built. |
| **Right level** | No timer on first meeting a word. Practise-again packs adapt after Boss Tests, and an optional "challenge" round is there for fast learners. | Never leaderboards, lives that block, or punishment for trying. |

The Explorer Map, Compass and Passport are platform pieces to build once (after Unit 2, on top of the existing sticker, medal and Boss Test system). Until then the sticker page and home mission carry the role.

## 5. Build order

1. **Unit 1:** publish L5-L7 (built).
2. **Units 2-10 in order**, one lesson at a time through `lesson-variety-engine` research → build → `lesson-quality-gate`;
   Unit 2 and Unit 9 reuse their built lessons.
3. **New signature games** in the order the units need them: Jungle Obstacle Run (U2), Rocket Maze + Planet Weather
   Report (U3), Food Survey + Pip's Café (U4), Guess Who (U5), Live Reef (U6), Hero Mission (U7), Fossil Dig + See-Saw
   Scales + Racing (U8), Design My Room (U9), Clock Quest + Build-a-Bot + Maze Chase (U10).
4. **Fun layer** (§4b): Explorer Map + Golden Compass + Passport after Unit 2.
5. **Slot titles:** the 3 title changes in §3 are applied in `curriculum_lessons` (2026-10-12, unpublished slots).
6. **Assessments** (full plan: [`docs/assessment/a1-assessment-plan.md`](assessment/a1-assessment-plan.md) — Lesson 7 of every unit is the evaluation lesson; A1 Halfway Check after Unit 5; A1 Final Test after Unit 10 decides Ready for A2 / Almost / Not yet) reuse the Pre-A1 system: Boss Test in every L7, A1 Halfway Check after Unit 5, A1 Final Test after
   Unit 10, Practise-again packs, parent report.

## 6. Research sources

- Cambridge English: Pre A1 Starters / A1 Movers / A2 Flyers wordlists (2018+) — https://www.cambridgeenglish.org/pl/Images/149681-yle-flyers-word-list.pdf ; Movers preparation (handbook, sample papers) — https://www.cambridgeenglish.org/gr/exams-and-tests/movers/preparation
- Kid's Box Level 1 (Cambridge, A1) sample — https://assets.cambridge.org/97813166/27334/excerpt/9781316627334_excerpt.pdf ; Oxford Discover 1 (A1, inquiry "Big Question" units) — https://eslconnexus.odoo.com/slides/55
- Online schools: Novakid (25-min 1-on-1, full immersion, TPR, games before/after in its Game World) — https://teast.co/blog/teach-english-online-novakid ; 51Talk (drag-and-drop on-screen games with the teacher) — https://en.51talk.com/articles/7-best-english-courses-for-kids/
- Apps: Lingokids / Duolingo ABC / Khan Academy Kids comparisons — https://learnenglish.life/compare/best-kids-english-apps-2026/ , https://pastory.app/articles/lingokids-vs-duolingo-abc/ ; Khan Kids "Name That Feeling" game show and feelings lessons — https://blog.khanacademy.org/khan-kids-new-lessons-help-kids-name-their-feelings/
- Classroom game platforms: Wordwall templates (Match Up, Group Sort, Whack-a-Mole, Open the Box, Maze Chase, Airplane, Random Wheel…) — https://wordwall.net/features , https://avidopenaccess.org/wp-content/uploads/2020/11/Wordwall-Tip-Sheet.pdf ; Blooket/Gimkit/Kahoot modes (Tower Defense, Gold Quest, Café, Racing, Fishing Frenzy, Floor is Lava, Team mode) — https://ditchthattextbook.com/game-show-classroom-comparing-the-big-5/ , https://triviamaker.com/blooket-vs-gimkit-vs-kahoot/
- ESL game design: Games4ESL feelings lesson — https://games4esl.com/lesson-plans/teaching-feelings-and-emotions/ ; feelings dice — https://www.eslprintables.com/printable.asp?id=144860 ; he/she/they games — https://www.teach-this.com/parts-of-speech/subject-object-pronouns ; TPR online — https://tutor.help.allright.com/en/articles/13832453-tpr-in-online-esl-teaching ; Simon Says A1 — https://twee.com/esl-lesson-plans/simon-says
- Game-based learning evidence (vocabulary gains and retention with digital games for young learners) — https://journal.unnes.ac.id/journals/eej/article/download/25770/7651/129288 , https://wej.unwir.ac.id/index.php/wej/article/view/401
- Grammar scope: Cambridge Young Learners handbook ("the structures candidates will need most frequently are there is/are, the present tense of be and have (got), can/can't and must/mustn't and the present continuous of some action verbs") — https://www.institutoivoti.com.br/idiomas/arquivos/Movers_en.pdf ; Movers grammar and structures list (past simple, comparatives/superlatives, adverbs, verb + -ing / to, Let's, Whose, because) — https://flyer.us/movers-cambridge-grammar/ , http://englishmilagrosa.blogspot.com/2015/04/grammar-and-structures-lists-for-movers.html ; wordlists 2025 — https://www.cambridgeenglish.org/Images/739104-starters-movers-flyers-word-list-2025.pdf
- Motivation of young learners: Myles (enjoyment first at age 7) — https://www.governmentevents.co.uk/wp-content/uploads/2021/03/Florence-Myles.pdf ; systematic review of factors in young learners' motivation (SiSAL 2026) — https://sisaljournal.org/archives/volume-17/march-2026/lena_nikolov/ ; Cambridge "How to increase motivation to learn English" (right level, choices, intrinsic motivation) — https://cambridgeenglish.org/learning-english/parents-and-children/how-to-support-your-child/how-to-increase-motivation-to-learn-english ; Lingokids rewards (stars only when the learning goal is met) — https://help.lingokids.com/hc/en-us/articles/18393545177874-How-does-the-reward-system-work
