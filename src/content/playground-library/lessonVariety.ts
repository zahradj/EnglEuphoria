/**
 * Lesson Variety Engine (owner's standing rule, 2026-10-04: "In every next
 * lesson vary the activities, the look, the scenes and the themes — research
 * Khan Academy Kids, Lingokids, LingoAce, VIPKid, Oxford, Cambridge and the
 * top apps, and do better than them. Avoid boring the student.")
 *
 * Every new Playground lesson registers two things here and must pass
 * `checkLessonVariety` (run by lessonVariety.test.ts, part of the deploy gate):
 *
 *  1. LESSON_PROFILE  — its settings (where it happens) and its theme/look.
 *  2. RESEARCH_LOG    — the research done for it: at least 3 sources from the
 *     benchmark list, the mechanic(s) taken from them, and what we did BETTER.
 *
 * The check compares the lesson with the lesson right before it AND with the
 * same lesson slot of the previous unit (the one a child played a few weeks
 * ago), so games, pictures, settings and look keep changing.
 * Method and benchmark list: .claude/skills/lesson-variety-engine/SKILL.md.
 */
import type { Scene } from './unit1/scenes';

/** The shared lesson spine: routine kinds every lesson may repeat (hello, story, songs, rewards…). */
export const ROUTINE_KINDS: ReadonlySet<string> = new Set([
  'title-card', 'song', 'cinematic', 'recall-warmup', 'story-video', 'story-order', 'listen-repeat-cards', 'tpr-actions',
  'join-stage', 'spin-wheel', 'sound-model', 'trace', 'echo', 'sticker-reward', 'home-mission', 'finale',
  // Blend It! is in every lesson on purpose (blueprint slot 14, owner 2026-10-11: start reading by blending).
  'sound-blend',
  // Extra practice (owner 2026-10-12: "create extra practice … the maximum pages could be 25"): three review mechanics that
  // rotate across lessons so neighbours differ (Word Board, Home Hunt, Flip & Say) — part of the spine, not a lesson's games.
  'word-board', 'home-hunt', 'flip-say', 'picture-maze',
  // Pet Pal: a short collecting moment after the sticker reward in every A1 lesson (Biscuit the puppy grows across units).
  'pet-pal',
]);

/** Apps, schools and exam boards to research before every lesson (rotate; never only one). */
export const BENCHMARKS = [
  'Khan Academy Kids', 'Lingokids', 'LingoAce', 'VIPKid', 'Novakid', 'Duolingo ABC', 'ABCmouse',
  'Oxford (Owl / Discover / Phonics World)', 'Cambridge (Pre A1 Starters / ELT)', 'Wordwall', 'Kahoot', 'Sesame Workshop',
] as const;

export type LessonProfile = {
  /** Where the lesson's pictures happen (e.g. 'bedroom', 'beach'). Must differ from the previous lesson's. */
  settings: string[];
  /** One-line theme + visual look (palette, time of day, mood). */
  look: string;
};

export type ResearchEntry = {
  /** Benchmarks studied for this lesson (≥ 3, from BENCHMARKS or a named school/app). */
  sources: string[];
  /** Mechanics taken from them (the underlying idea, never copied content). */
  mechanics: string[];
  /** What this lesson does better than the benchmark (≥ 1 concrete point). */
  betterThan: string[];
};

/** Lessons from here on must have a profile + research entry (older lessons are grandfathered). */
export const VARIETY_ENFORCED_FROM = { unit: 3, lesson: 4 };
/** Built before the rule (rebuild them to the rule when they are next touched). */
export const GRANDFATHERED: readonly string[] = ['5-1'];

/** Level tests (owner-approved assessment plan 2026-10-12, docs/assessment/prea1-assessment-plan.md): a test lesson is
 *  deliberately ONE calm test activity, not a varied game lesson, so the variety rules don't apply to it. Only lessons
 *  whose scenes are routine kinds + one `level-test` may be listed here. */
export const ASSESSMENT_LESSONS: readonly string[] = ['1-7', '2-7', '3-7', '4-7', '5-7', '6-7', '7-7', '8-7', '9-7', '5-8', '10-8'];

export const LESSON_PROFILE: Record<string, LessonProfile> = {
  '2-2': { settings: ['art studio', 'fruit market', 'meadow'], look: "Pip's sunny paint studio indoors, a striped market stall, the rainbow meadow; colour-mixing mission" },
  '2-3': { settings: ['town street', 'builder yard'], look: 'sunny Shape Town street with a clock tower, a house and a flag; a grassy builder yard where the friends build with shapes' },
  '3-3': { settings: ['workshop', 'park'], look: 'sunny outdoor park, kites in a blue sky' },
  '3-4': { settings: ['classroom', 'garden pool'], look: 'Show and Tell circle on the rainbow rug; summer garden with a paddling pool' },
  '4-1': { settings: ['dance studio'], look: 'bright dance studio in morning sun: mirror, barre and colourful mats; a dance class with Coach Willow' },
  '4-2': { settings: ['kitchen'], look: 'cozy sunny breakfast kitchen with pancakes and fruit; top-down plate where Pip and Mia make pancake faces' },
  '4-4': { settings: ['flower garden'], look: 'bright flower garden with big friendly mushrooms; Pip meets Bo, a round sky-blue three-eyed monster; code-drawn monsters on an empty lawn' },
  '4-5': { settings: ['animal park'], look: 'sunny animal park with a blue pond and tall trees; a tiger, a monkey, an elephant and a seal each show one move, Pip copies; a leafy bush to peek through' },
  '10-7': { settings: ['hero academy training ground'], look: "a sunny outdoor hero academy in the park: a round wooden stage with a big golden star, flags with lightning bolts, a little winners' podium, hoops and cones on the grass; Pip, Mia and Leo in red, purple and blue hero capes in proud hero poses; the Boss Test is a hero power bar with Pip flying along it, picture and letter trial cards, and the golden hero medal with a result board" },
  '10-6': { settings: ['living-room games night'], look: "a cosy evening games night in the friends' living room: a purple-and-gold striped magic top hat full of paper cards on a little stool, a green sofa with cushions, a round orange rug, a warm standing lamp, fairy lights and paper bunting, a starry purple sky in the window; Pip pulls a charades card from the hat while Mia and Leo laugh on the sofa; Action Charades plays on a little velvet-curtain stage, plus the Buzzer Show stage and the ring-toss stall from earlier units" },
  '10-5': { settings: ['tall-grass meadow', 'stepping-stone stream', 'little river', 'green hill', 'bear cave'], look: "our own bear-hunt story as a stills film: the friends with a paper map at a garden gate, walking through tall grass, a green frog jumping over stepping stones in a stream (Pip jumps too), an orange fish in a little river (Mia swims too), a blue bird over a round green hill (Leo runs up), a cosy cave where Bruno, a round smiling brown bear, sleeps on autumn leaves by glowing mushrooms, wakes and dances with everybody at sunset; the games walk an empty forest trail with a bush, a hollow log, a lily pond and the cave" },
  '10-4': { settings: ['circus big top'], look: "the friends' circus inside a red-and-yellow striped big top: a round ring with a red rim on a sandy floor, bunting, warm spotlights, balloons and a striped podium; Leo is the ringmaster in a little red top hat, Pip jumps high and Mia dances on the podium; in Can It? the animals come into the empty ring one by one and really do the action (or comically flop)" },
  '10-3': { settings: ['garden camp-out at dusk'], look: "a cosy garden camp-out from dusk to night: an orange tent with fairy lights, a little campfire in a ring of stones, a log bench, a purple-blue starry sky with a crescent moon and fireflies; Pip claps by the fire, Mia plays with a red ball and Leo sleeps on his sleeping bag at the tent; in Campfire Says the sky darkens and the stars come out as the friends fall asleep" },
  '10-2': { settings: ['sunny beach', 'beach talent-show stage'], look: "a summer beach party: golden sand, a calm turquoise sea, palm trees, beach umbrellas and a beach ball, a little wooden beach stage with bunting; Pip swims in the sea, Mia dances on the sand and Leo sings on the stage with a toy microphone; the Beach Talent Show is a wooden stage with warm lights, red velvet curtains and a glowing paper screen where the next act's moving shadow plays" },
  '10-1': { settings: ['park sports-day track'], look: "sports day in a sunny green park: a curvy red running track with white lane lines, low wooden logs and a hay bale as hurdles, triangle bunting and a finish ribbon; Pip runs, Mia jumps the log and Coach Leo cheers with a whistle; the empty track becomes the Obstacle Run with code-drawn lane stripes streaming past" },
  '9-6': { settings: ['playroom dress-up corner'], look: "a cosy playroom dress-up corner on a rainy afternoon: a big wooden-framed standing mirror, a low clothes rail with hangers, an open wooden dress-up trunk, a round purple rug, rain on the window and warm lamp light; Pip in a green hat, Mia twirling in a yellow dress and Leo pulling on a blue coat; the empty corner becomes the Dress-Up Studio with a clothes rail and paint pots" },
  '9-5': { settings: ['sunny garden', 'picnic hill', 'farmyard after rain'], look: "a walk through the unit's places as a stills film: Pip in a red T-shirt, blue pants and brand-new white sneakers in a sunny garden, squishing red apples under the apple tree on the picnic hill, stepping into a spilled pot of blue paint on the path, stomping in a brown mud puddle in the farmyard after rain, and splashing in a clear rain puddle; the garden becomes the Shoe Painter game with paint pots and a big magnifier on his shoes" },
  '9-4': { settings: ['garden fashion show stage'], look: "a garden fashion show on a sunny afternoon: a wooden stage with a pink curtain, a row of warm stage lights and a little catwalk, bunting and fairy lights in green trees, flower pots and colourful chairs for the audience; Pip, Mia and Leo stand in the spotlights really wearing the clothes (fitted layers), and the camera flashes when the child finds the friend" },
  '9-3': { settings: ['clothes shop'], look: "Bella's little clothes shop on a sunny day: clothes rails with coats, skirts and T-shirts, wooden shelves, a round mirror, a shop window with sunshine and a green door; Bella the bunny smiles behind her wooden counter with a cash register; friends hop in through the door to buy, and the bought piece flies into a paper shopping bag" },
  '9-2': { settings: ['snowy front hallway'], look: "a cosy front hallway on a snowy winter morning: snow falling past the window and the glass front door, wooden coat hooks on a pale yellow wall, a little bench and a striped rug; Pip in a green knitted hat, red socks and blue shoes waves by the door; the empty hall becomes the Put It On! game where the child dresses Pip, Mia and Leo" },
  '9-1': { settings: ['backyard laundry day'], look: "laundry day in Pip's sunny backyard: green grass, a wooden fence and flowers, a long washing line between two wooden poles with a red shirt, blue pants and a yellow dress on wooden pegs, Pip holding up the shirt by a wicker basket; the empty line becomes the Washing Line game where the clothes swing in the breeze" },
  '8-6': { settings: ['school dining hall'], look: "lunchtime in a bright school dining hall: big sunny windows, the four friends at a long table with green trays of the unit's food (pizza, apples, bananas, ice cream, bread), and a big empty green chalkboard on the back wall that becomes the class food chart" },
  '8-5': { settings: ['spring flower garden', 'story places of the unit'], look: "a sunny spring flower garden with big green leaves, colourful flowers and a curvy path, where a little round green caterpillar peeks out; the story film visits the unit's places (the picnic blanket, Pip's café counter, the party table) with the caterpillar munching one food at each, then an evening orchard with a hanging cocoon and a bright morning with a green-and-yellow butterfly; Pip waves at the end" },
  '8-4': { settings: ['autumn apple orchard'], look: "a sunny autumn apple orchard: trees heavy with red apples, golden leaves on the grass, a long wooden table where the four friends each hold up the food they like (Pip an apple, Mia a banana, Leo pizza, Bella ice cream); the empty orchard with a wooden counter and a little smoothie cart becomes the Smoothie Bar with a big code-drawn blender" },
  '8-3': { settings: ['park party food truck'], look: "a summer party in a green park: a bright red-and-yellow food truck with a striped awning, a big round pizza, a pink birthday cake with candles and three ice-cream cones on its counter, Pip in a white chef hat waving from the window; bunting, balloons and a wooden picnic table; a moving grey belt carries the party food past the table" },
  '8-2': { settings: ['bakery café'], look: "Pip's little bakery café on a sunny morning: a wooden counter with baskets of bread loaves, a glass jug of orange juice and a jug of water, a chalkboard with a drawn loaf and cup, round wooden tables with green-cushioned chairs by a big window with flower boxes; Pip in a small white apron behind the counter, friends come to the table to order" },
  '8-1': { settings: ['picnic hill'], look: "a picnic on a sunny green spring hill: a big red-and-white checkered blanket, an open wicker basket, a shady apple tree full of red apples, a little blue stream and yellow flowers; Pip sits on the blanket with an apple, a banana and a glass of milk" },
  '7-6': { settings: ['farm at night'], look: "Grandpa's farm at night under a big full moon and stars: the red barn with its door half open and a lantern glowing, a round haystack, a little red chicken coop, a big tree with a hollow, a blue water trough and a pond with reeds; the farm is dark and the child's torch beam finds the hiding animals, then the farm lights come on" },
  '7-5': { settings: ['barn at sunrise', 'farm gate'], look: "Grandpa's farm on a misty early morning: a big red barn with four white stall doors in a row at sunrise, Grandpa fox in a straw farmer hat and blue overalls with Pip; the doors open one by one (cow, pig, sheep, duck) and the animals gather in the golden yard" },
  '7-4': { settings: ['farm fair'], look: "the fair comes to the farm on a bright day: red-and-white striped tents, bunting flags, hay bales, prize rosettes on the fence and a big yellow-and-white striped hook-a-duck pool in the middle; Pip and the animals of the unit at the fair; a red-curtained show tent for the riddles" },
  '7-3': { settings: ['duck pond and bridge'], look: "the far side of the farm on a golden afternoon: a blue duck pond with lily pads and a little arched wooden bridge, a wooden stable and a red chicken coop, tall reeds and orange evening light; Pip with a brown horse, a white hen and a white farm duck" },
  '7-2': { settings: ['farmyard after rain'], look: "a sunny farmyard just after a little rain: a big red barn, a wooden fence, green hills and a rainbow, brown mud puddles and a blue water trough with a bucket and sponge; Pip with a black-and-white cow, a pink pig and a fluffy sheep" },
  '7-1': { settings: ['pet shop'], look: "a sunny little pet shop: cream walls, a big window, wooden shelves of pet toys and food, a round dog bed, a cat basket with a blue cushion and a golden bird cage; Pip waves with a brown puppy, an orange kitten and a blue bird; the empty shop becomes the Pet Photo studio" },
  '6-6': { settings: ['games-night living room'], look: "games night at Pip's house: the whole fox family (Grandma, brother, Dad, sister, baby) around a round coffee table playing a board game, warm lamp light, a starry night window and a red sofa; a snake board path of house pictures drawn in code" },
  '6-5': { settings: ['autumn sunset street', 'park at sunset', "Pip's evening bedroom"], look: "golden autumn sunset: a park with falling orange leaves, then Pip's new street of three look-alike cream houses whose only difference is the door (blue, yellow with a cat in the window, red with a big orange tree), close-ups at each door, Mom's hug in the warm doorway and Pip's lamp-lit bedroom" },
  '6-4': { settings: ['street of coloured houses', 'empty lilac bedroom'], look: "Open House Day: a sunny little street of three small houses (red, blue, yellow) with stone paths and white fences, then one empty lilac bedroom with white stars and a round window, furnished three ways in different colours for each friend (Mia, Bella, Leo)" },
  '6-3': { settings: ['empty dollhouse', 'family evening at home'], look: "Pip's house opened like a dollhouse, first completely empty (bare rooms, sunny day) for the child to furnish, then on a cosy lamp-lit evening with the whole fox family each in a room: the baby asleep, sister brushing teeth, Mom cooking, Dad reading with Pip on the sofa" },
  '6-2': { settings: ['moving-day street', 'empty new room'], look: "moving day: a blue moving truck full of boxes outside Pip's family's new house on a sunny street, then a bright, empty new room (pale walls, wooden floor, a big window) that fills up with furniture piece by piece" },
  '6-1': { settings: ['house front garden', 'dollhouse rooms'], look: "Pip's own cream house with a red roof and a round green door on a sunny morning, then the same house opened like a dollhouse: four warm rooms (blue bedroom, tiled bathroom, green kitchen, orange living room); lights off and on for hide and seek" },
  '5-6': { settings: ['game-show stage'], look: "a bright children's TV game-show stage: purple curtain, warm spotlights, three podiums with big red buzzers; Pip is the host with a microphone and the whole fox family claps in the front row" },
  '5-5': { settings: ['duck pond', 'home at night'], look: "a sunny park with a duck pond, a bench and an ice-cream cone, then Pip's warm living room and bedroom at night; just Pip and Dad (green cardigan), four little ducks; a story told as a flip-book film" },
  '5-4': { settings: ['hilltop oak'], look: "a sunny green hill with one giant oak tree: the whole fox family (Grandma, Grandpa, Mom, Dad, brother, Pip, sister, baby) at a picnic under it; the empty oak with three branch levels becomes the family tree" },
  '5-3': { settings: ['cottage'], look: "Grandma and Grandpa's cozy cottage: a red sofa by the fireplace, a warm kitchen on baking day, a garden with a little wooden gate; Grandma (grey bun, glasses, lavender cardigan) and Grandpa (moustache, glasses, flat cap)" },
  '5-2': { settings: ['backyard'], look: "sunny backyard of Pip's home: wooden fence, a tree swing, a picnic blanket; family photo day with Pip's big brother, little sister and the baby" },
  '4-6': { settings: ['space station'], look: 'bright pastel space station with round star windows and a ringed planet; Pip and Mia play Simon Says with Robo, a silver robot drawn in code' },
  '4-3': { settings: ['beach'], look: 'sunny beach day: golden sand, blue sea, sandcastle and umbrella; top-down wet sand for prints; Bella and Leo' },
  '3-6': { settings: ['toy fair'], look: 'outdoor fair: sunny day with striped tents, then a golden evening with string lights' },
  '3-5': { settings: ['bedroom'], look: 'cozy bedroom in warm afternoon light; tidy-up mission with a surprise kitten' },
};

export const RESEARCH_LOG: Record<string, ResearchEntry> = {
  '2-2': {
    sources: ['Lingokids', 'Khan Academy Kids', 'Cambridge (Pre A1 Starters / ELT)', '7ESL / TinyTap "Feed the colour monster"'],
    mechanics: [
      'Lingokids "Mixing Colors" audiobook + colour games → Magic Paint Pots inside a painting story',
      'classroom / 7ESL "Feed the colour monster" → Colour Monsters (the monster ASKS by voice)',
      'catch-in-the-right-basket colour sort (Khan Academy Kids sorting) → Catch it! at the market',
    ],
    betterThan: [
      'the colour is only HEARD (no printed word), and a wrong food is named back ("The carrot is orange!") so every mistake teaches',
      'the monsters ask in turn: the child must listen to WHO is hungry and WHAT colour',
      'eaten food stays on each monster\'s plate (permanence); the story film labels each colour with a line to the thing',
    ],
  },
  '2-3': {
    sources: [
      'Cambridge (Pre A1 Starters / ELT: listen and put it in the picture; "Which is correct?" picture choice)',
      'Oxford (Numicon feely bag) + British Council LearnEnglish Kids "Mystery bag game"',
      'Duolingo ABC / Khan Academy Kids (finger tracing; shape recognition in Logic+)',
      'Lingokids (shapes games; "7 ways to teach shapes") and Novakid shape games',
      'englishclub / eslkidstuff (TPR shapes: draw in the air, make shapes with the body)',
    ],
    mechanics: [
      'finger tracing (Duolingo ABC, Khan Academy Kids) + Cambridge "put it in the picture" → Magic Pencil: trace the shape and it comes alive in Shape Town',
      'the feely / mystery bag (Oxford Numicon, British Council) → What\'s Peeking?: only an edge or a corner shows; guess the shape',
      'the toddler shape-sorter toy + Cambridge colour-and-object listening → Shape Sorter: "Put in the blue square!"',
      'bubble / balloon pop (Lingokids, Wordwall) → calm Bubble Pop: pop only the shape you hear',
    ],
    betterThan: [
      'tracing is not a worksheet: every finished shape becomes a thing that stays (the sun, a present, a pizza, a ball), so the child paints a whole picture',
      'in What\'s Peeking? a wrong guess makes the shape peek out a little more — every miss is a clue, never a loss',
      'the sorter has two blocks of each shape, so the colour must be HEARD too (recycling Lessons 1-2); a wrong block is named back',
      'calm by design: no clock anywhere, bubbles wait on the spot, the right answer glows after two misses; no reading pages (the old timed Shape Dash, text storybook and "Read the word" are gone)',
    ],
  },
  '3-4': {
    sources: ['Cambridge (Pre A1 Starters / ELT)', 'Wordwall', 'Lingokids'],
    mechanics: ['Guess Who information gap (child asks yes/no questions)', 'magnet fishing for the word you hear'],
    betterThan: ['toys float and bob in a living pool instead of a static grid', 'big/small pairs force listening to the size word, not just the toy'],
  },
  '3-5': {
    sources: ['Lingokids', 'Cambridge (Pre A1 Starters / ELT)', 'Khan Academy Kids', 'VIPKid', 'Novakid'],
    mechanics: [
      'Lingokids × Toy Story "pack the box with toys" → Tidy Up (put the toy in / on / under)',
      'ESL hide-and-seek "where is the toy?" → Peekaboo Toys',
      'Cambridge Starters Listening Part 4: prepositions while listening',
    ],
    betterThan: [
      'the same toy peeks from two places at once, so the child must hear the PLACE word (apps only check the noun)',
      'tidied toys stay where the child put them: the room visibly gets tidier (permanence), with arcs and squash',
      'drag OR tap-tap, never a timer, wrong answers wobble back gently',
    ],
  },
  '3-6': {
    sources: ['Toy-grabber apps (Yateland "Claw Machine Games for kids")', 'Wordwall', 'Khan Academy Kids', 'Duolingo ABC'],
    mechanics: [
      'claw machine (toy grabber) → Toy Grabber: steer the claw to the toy the voice names',
      'fairground ring toss with Wordwall-style one-tap review → Ring Toss (toys, then Unit 3 sounds)',
      'end-of-unit review loop (Khan Academy Kids mastery, Duolingo ABC review) → every Unit 3 skill replayed in one story world',
    ],
    betterThan: [
      'our claw never slips: luck never decides, only choosing the toy the words describe wins (claw apps are random)',
      'the colour decides: two balls and two cars, so "the blue ball" must be heard, not just "ball"',
      'rings stay on the pegs and prizes pile up on a shelf (permanence); wrong throws bounce back gently',
    ],
  },
  '4-1': {
    sources: ['Lingokids', 'Body-parts kids apps (tap / place the part)', 'games4esl / tefl.net classroom games', 'Cambridge (Pre A1 Starters / ELT)'],
    mechanics: [
      'classroom Simon Says → Simon Says Touch on Leo\'s painted body',
      'apps\' "assemble the body" (place each part) → Stack the Friend: rebuild Leo from head to toes',
      'the Head, Shoulders, Knees and Toes action song, slow then fast (teachingexpertise / eslkidstuff)',
    ],
    betterThan: [
      'the whole sentence decides, not just the noun: without "Simon says" the right move is to wait (apps only check the tap)',
      'the friend comes alive when rebuilt — he bounces and thanks you, a story reason to listen',
      'every part is touched on the child\'s own body too (TPR) before it is tapped on screen',
    ],
  },
  '4-2': {
    sources: ['Lingokids (face-parts games, Face Scramble)', 'TinyTap (parts of the face)', 'Genki English ("Make a face" song)', 'Face Maker drag-and-drop game (englishflashgames)', 'Cambridge (Pre A1 Starters body & face)'],
    mechanics: [
      'apps\' "put the features back on the face" → Pancake Faces: tap WHERE each fruit part goes on a plain pancake',
      'the classroom "Point to your …!" routine → the child gives the order to Mia (role swap)',
      'face-parts action songs → our own Eyes, Ears, Mouth and Nose song, sung while pointing',
    ],
    betterThan: [
      'no picture of the part to match: the spoken word alone tells the child where to tap (the apps show the piece)',
      'a wrong place is named back ("Not there! That\'s for the nose!"), so every mistake teaches a word',
      'the finished pancake comes alive and smiles, and the same game returns with a new order for Mia',
    ],
  },
  '4-4': {
    sources: ['Cambridge (Pre A1 Starters / ELT: listen and colour / draw the monster)', 'Lingokids (build-a-character body games)', 'Khan Academy Kids (tap-to-count)', 'Duolingo ABC (count and choose)', '"Go Away, Big Green Monster!" picture book (a face built part by part)'],
    mechanics: [
      'Cambridge "listen and draw the monster" + build-a-character apps → Monster Maker: the monster says "I have three eyes!" and the child picks the part it hears',
      'tap-to-count (Khan Academy Kids, Duolingo ABC) → How Many?: tap each eye to count it out loud, then choose the number',
      'the "Go Away, Big Green Monster!" reveal → a friendly monster, Bo, the class meets and compares bodies with',
    ],
    betterThan: [
      'the NUMBER and the SIZE decide the part (one / two / three eyes, big / small feet) — apps only ask for the part',
      'counting ends in a real sentence the child hears and says ("I have three eyes!"), and the number choice only opens after everything is counted (no guessing)',
      'calm by design: no clock, a wrong part is named back ("That\'s two eyes! Try again!") and the right one glows after two misses',
    ],
  },
  '4-5': {
    sources: ['Eric Carle "From Head to Toe" (call-and-response movement book: "Can you do it?" — "I can do it!")', 'Lingokids (action / animal games)', 'Cambridge (Pre A1 Starters listen and point; look and guess)', 'Khan Academy Kids (hide-and-reveal, calm self-paced)', 'Sesame Workshop (model → copy, pause for the child)'],
    mechanics: [
      'the movement-book call and response → a stills film where each animal shows ONE move, Pip asks "Can you do it?", pauses, then copies it',
      'listen and point → Who Can Do It?: hear the move, tap the animal, then do the move and say "I can do it!"',
      'the peekaboo "Whose tail is it?" pattern → Whose Is It?: one body part peeks out of a bush, tap the animal, the bush slides away',
    ],
    betterThan: [
      'the child must understand the verb AND the body part to find the animal, then PRODUCES the move and the sentence — the screen waits for the child, never a clock',
      'the clue in Whose Is It? is one of the unit\'s body words, so naming the part and the animal go together, and the reveal recalls the story move',
      'wrong picks are named back with that animal\'s own move ("No, the seal claps her hands!"), and the right one glows after two tries',
    ],
  },
  '10-7': {
    sources: ['Cambridge (Pre A1 Starters listening: listen and tick the picture, one answer each)', 'Duolingo / Lingokids (unit checkpoints: a short mixed test that ends in a reward)', 'Khan Academy Kids (mastery stars per skill)', 'Kahoot (results screen)', 'Wordwall (memory and odd-one-out review games)'],
    mechanics: [
      'unit checkpoint → Hero Trials: one-try spoken trials for each skill (actions, can / can\'t, he / she / it, sounds) with a hero power bar',
      'results screen → a board with stars PER SKILL and the words to practise again (evidence for the teacher, a medal for the child)',
      'warm review before the test: memory pairs of the actions, odd-one-out with can / can\'t, the unit song; the sounds again in the Hero Treasure',
    ],
    betterThan: [
      'the result is broken down by skill, so the teacher sees exactly what to practise (not one score)',
      'it stays calm for a 4-6 year old: spoken questions, picture-only answers, no clock, 🔊 replays as often as needed',
      'a miss still teaches: the right card glows and the full answer is said ("Good try! A fish can\'t walk. It can swim!")',
    ],
  },
  '10-6': {
    sources: ['classroom charades / "guess the action" (games4esl, teach-this)', 'Lingokids / Khan Academy Kids ("guess what I am doing" reveals)', 'Cambridge (Pre A1 Starters: actions, "Can you …?", "Who can …?")', 'Kahoot (answer early, more points — here without a fail state)', 'Wordwall (quiz-show buzzer and ring-toss review games)'],
    mechanics: [
      'charades → Action Charades: a friend acts behind a curtain that opens bit by bit, the child guesses from three spoken words (earlier = more stars); then the child gets a card and acts it out',
      'quiz show → Who Can? Buzzer Show: "Who can fly?" — buzz the bird, say "It can fly!" (he / she / it from Lesson 5)',
      'fair game → Action Toss on the action pictures; the unit\'s sounds in Sound Fishing',
    ],
    betterThan: [
      'guessing early is the child\'s own choice (the curtain keeps opening, no clock, no losing), so confident children are rewarded and shy ones still get the full picture',
      'every answer is said back as a full sentence with the right pronoun ("She can dance!"), joining the unit\'s verbs with Lesson 5\'s he / she / it',
      'role swap: the child also PRODUCES the action with their body on "Your turn!", and the teacher can play the guesser',
    ],
  },
  '10-5': {
    sources: ['Cambridge (Pre A1 Starters listening: listen and point to the person)', 'Lingokids / Khan Academy Kids ("who is it?" picture taps, lift-the-flap searches)', 'Duolingo ABC (instant feedback on taps)', 'the classroom bear-hunt chant walk (a path of places, actions on the way)', 'Sesame Workshop / Blue\'s Clues (the planned pause: "What can it do?")'],
    mechanics: [
      'listen and point to the person → Bear Hunt Trail: Bella says "She can swim!" and the child taps WHO (Pip, Mia, Leo, the animal or all three); that one does the action and the trail moves on',
      'lift-the-flap search → "Where is the bear?": the child asks "Is it in the bush?" and finds animals that say what they can do, the bear last',
      'the story film with labels for he / she / it / they and a planned 4-second pause on the sleeping bear; tick or cross and story order on the film\'s pictures',
    ],
    betterThan: [
      'the choice IS the pronoun: he = a boy (either boy is right), she = Mia, it = an animal, they = everybody, so one and many, boy and girl, friend and animal are contrasted at every stop',
      'the answer is shown, not just marked: the one who can jumps into the middle and really jumps, swims, flies, runs or sleeps',
      'a wrong tap explains the word ("She is a girl! Listen: She can swim!") and the right one glows after two misses — no clock, no lives',
    ],
  },
  '10-4': {
    sources: ['Cambridge (Pre A1 Starters: "Can a … ?" yes/no; "Can you …? Yes, I can")', 'Lingokids (silly true-or-false animal questions)', 'Khan Academy Kids (yes / no comprehension)', 'the classroom ability game "Can a fish fly?"', 'Duolingo ABC (instant feedback on taps)'],
    mechanics: [
      'yes/no ability questions → Can It?: "Can a fish walk?" thumbs up / down, and the animal really does it or tries and flops',
      'riddles → can / can\'t clues ("It can swim. It can\'t walk.") to guess the animal',
      '"Can you …?" talk about the child, then the child asks Leo; the sounds C and B in a sort and Sound Moles',
    ],
    betterThan: [
      'the answer is SHOWN as cause and effect: a right "yes" makes the animal perform, a wrong "yes" makes it try and comically flop, so "can" and "can\'t" are seen, not just heard',
      'after every "can\'t" the animal shows what it CAN do, so each round models both forms ("No, it can\'t walk. It can swim!")',
      'no penalty: a wrong answer turns into the funniest moment, then the right button glows',
    ],
  },
  '10-3': {
    sources: ['Simon Says / classroom TPR (follow a spoken command)', 'Cambridge (Pre A1 Starters listening: names + actions)', 'Khan Academy Kids (follow the instructions)', 'Lingokids (bedtime routine games)', 'Wordwall (what comes next? pattern)'],
    mechanics: [
      'Simon Says → Campfire Says: the host calls WHO and WHAT ("Mia, play with the ball!"), the child picks that friend\'s action picture and the friend does it',
      'what comes next? → a pattern train of action pictures (clap, sleep, clap, sleep, …)',
      'a jigsaw of the camp picture, then "Pip claps! Mia plays! Leo sleeps!"; the sound L in Sound Fishing; blending lid and log',
    ],
    betterThan: [
      'two pieces of meaning in one call (the name AND the verb): the child must listen for both, and the action pictures are of that friend only',
      'real cause and effect in the world: clap sparkles, a bouncing ball, "zzz" while sleeping, and the sky turns to night as more friends sleep',
      'the last round "Everybody, sleep!" ends the game as a calm goodnight; wrong picks are named back and the right one glows after two tries',
    ],
  },
  '10-2': {
    sources: ['Lingokids (action games: watch and do)', 'Khan Academy Kids (guess the picture from a clue)', 'shadow-puppet theatre / Duolingo ABC-style silhouette guess', 'Cambridge (Pre A1 Starters: "Can you …? Yes, I can")', 'Wordwall (missing-word train / what is missing?)'],
    mechanics: [
      'silhouette guessing → Beach Talent Show: the act\'s moving shadow plays behind a glowing screen, the child taps the act, the screen rolls up and the friend says "I can dance!"',
      'what-is-missing memory → the party train carries the action GIFs, one car empties, the child says the missing action',
      '"Can you …?" talk → "What can you do?" "I can swim!"; first sounds S/D/I in Sandy Dash and Letter Monsters, i-words to blend',
    ],
    betterThan: [
      'the clue is the MOVEMENT itself (a moving shadow of the real action), not a still picture, so the child recognises the verb, not a costume',
      'every reveal ends in the target sentence "I can …" in the friend\'s voice, then the child says it: the game leads straight to speaking',
      'anticipation and payoff like a real show (drum-roll tremble, the screen rolls up, spotlights, the beach audience claps); a wrong ticket costs nothing and the right one glows after two tries',
    ],
  },
  '10-1': {
    sources: ['endless-runner games (Subway Surfers / Temple Run: one tap = one move)', 'the PE warm-up "Run! Jump! Walk! Stop!"', 'Cambridge (Pre A1 Starters: listen and do)', 'Wordwall image quiz / Khan Academy Kids action cards'],
    mechanics: [
      'endless runner → Obstacle Run: the coach calls the move for the obstacle ahead ("A log! Jump!"), the child taps the action and the runner does it',
      'TPR first: the child does every action with Coach Leo before the game; quick-fire "say it and do it" cards',
      'image reveal (what is Pip doing?), role swap: the child is the coach; first sounds R and J in Balloon Letter Pop',
    ],
    betterThan: [
      'the action word decides the move — a log can be jumped one time and walked round another — so the child listens, not just looks',
      'the move is visible and physical: a squash-and-stretch jump arc, a slow tiptoe past the little duck, speed lines running from the bee',
      'calm pace and no fail state: a wrong move is named back ("Not walk! Listen again.") and the right one glows after two tries',
    ],
  },
  '9-6': {
    sources: ['Toca Boca / Lingokids dress-up (pick a piece, change its colour)', 'Cambridge (Pre A1 Starters listening: "listen and colour")', 'the classroom paper-doll dress-up game', 'Khan Academy Kids "make your own" creation pages'],
    mechanics: [
      'dress-up + listen and colour → Dress-Up Studio: a friend asks for a piece AND a colour ("A blue hat, please!"), the child taps the piece then the paint, and it lands on the friend in that colour',
      'free creation with language back: the child dresses Pip any way, takes a photo, and Pip says what he is wearing piece by piece',
      'unit review: odd one out (wear or eat?), memory pairs, ask and answer "What are you wearing?", Brick Crush with D, T, P, W',
    ],
    betterThan: [
      'every request has two things to listen for (piece + colour), and every piece can be any of five colours, so guessing is not enough',
      'the clothes really sit on the friend\'s body (fitted layers, recoloured), and the child\'s own outfit is described back in full English',
      'no clock; a wrong choice gets "Oops! Listen again." and the right piece and colour glow after two tries; boys never get a dress',
    ],
  },
  '9-5': {
    sources: ['picture-book read-alongs for young learners (repeated line + colour change on each page)', 'Cambridge (Pre A1 Starters listening: "listen and colour")', 'Toca Boca / Lingokids colouring play', 'Blue\'s Clues pause (question, wait, answer)'],
    mechanics: [
      'stills story film with a planned pause: "What colour are Pip\'s shoes now?" … "Brown!"',
      'listen and colour → Shoe Painter: Pip asks "Paint my shoes red, please!", the paint flies onto his shoes in a magnifier and he says "My shoes are red!"',
      'true or false on the story pictures, story order, who said it (voices), ask and answer "What colour are your shoes?"; first sound W in a W / S sort',
    ],
    betterThan: [
      'our own story built on one repeated sentence ("My shoes are …!") that changes only by the colour, so the child predicts and joins in',
      'the colour change is the game\'s reward: the shoes really turn the colour (close-up magnifier), then Pip says the full sentence',
      'no clock and no reading; a wrong pot is named back ("No, not blue! Listen again."), the right one glows after two tries; the rain washes the shoes white like in the story',
    ],
  },
  '9-4': {
    sources: ['"Guess Who?" (attributes → who)', 'Cambridge (Pre A1 Starters listening: "Look at the picture, listen and point")', 'the classroom "I\'m wearing…" description game', 'Toca Boca / Lingokids dress-up shows'],
    mechanics: [
      'Guess Who + dress-up → Who Am I? Fashion Show: three friends really wear outfits; one says "I\'m wearing a green hat and a red shirt! Who am I?" and the child taps them',
      'riddles behind the stage curtain ("You wear it on your head.") and Guess Who with clothes cards ("Is it a hat?")',
      'ask and answer "What are you wearing?" about the child\'s own clothes; first sound P (pants) in Balloon Letter Pop with D and T',
    ],
    betterThan: [
      'every clue joins two pieces and the friends share some of them, so the child must hold both in mind: one word alone is never enough',
      'the friends really wear the clothes (fitted layers on their own bodies), outfits change with a twirl each round, and the found friend struts into the spotlight with a camera flash',
      'the sentence is heard in each friend\'s own voice and then said by the child about their own clothes; a wrong friend says "Not me! Listen again.", the right one glows after two tries; no clock',
    ],
  },
  '9-3': {
    sources: ['Toca Boca Store / Lingokids shopping play ("customers ask, you serve")', 'Cambridge (Pre A1 Starters: listen and colour / point — colour + clothes word)', 'the classroom shop role-play ("A red coat, please!")', 'Kim\'s game / Wordwall "What is missing?"'],
    mechanics: [
      'pretend shop → Shop Till: a friend asks "A red coat, please!" (colour + word), the child sends the right piece into the bag, the till rings',
      'Kim\'s game → What is missing? on the shop window (lights off, one piece gone)',
      'jigsaw of the shop, then say what you see; first sounds T (T-shirt) and C (coat) in Brick Crush',
    ],
    betterThan: [
      'every order joins two things to listen for (colour + word), and two of each piece are on the rack, so guessing the word alone is not enough',
      'the result is visible and physical: the piece flies into the bag, coins fill up, the customer hops out happy',
      'each customer is a friend speaking in their own voice; a wrong piece is named back ("No, not the blue coat!"), the right one glows after two tries; no clock',
    ],
  },
  '9-2': {
    sources: ['Toca Boca / Lingokids / Khan Academy Kids dress-up ("dress the character for the weather")', 'Cambridge (Pre A1 Starters: listen and point; clothes)', 'TPR "Put on your hat!" classroom routine', 'Wordwall group sort (head or feet)'],
    mechanics: [
      'dress-up → Put It On!: Pip, Mia and Leo each ask in their own voice ("Put on my red socks, please!") and the piece lands where it is worn (head, feet) on the friend who asked',
      'group sort → catch it: on your head or on your feet?; size line of shoes big → small; first sounds H and S',
      'ask and answer about colours: "What colour is your hat?"',
    ],
    betterThan: [
      'each piece goes where it is worn on the friend who asked, so the child listens for WHO and WHAT and learns where it belongs; socks go on under the shoes',
      'the catch sort is by meaning (head or feet), not by picture match',
      'no clock; a wrong piece is named back ("No, not the shoes! Listen again.") and the right one glows after two tries',
    ],
  },
  '9-1': {
    sources: ['Lingokids / Toca Boca dress-up and "hang it up" play', 'Cambridge (Pre A1 Starters: listen and point / colour; clothes and colours)', 'classroom washing-line flashcard game', 'Khan Academy Kids memory and sorting'],
    mechanics: [
      'washing-line flashcards → Washing Line: Pip asks "Where is my red shirt?" and the child pegs that piece on the line, where it swings in the breeze',
      'the Mystery Bag shape guess ("It\'s a yellow dress!"), clothes memory pairs, quick-fire recall and the sound D',
      'ask and answer: "What is this? It\'s a red shirt!"',
    ],
    betterThan: [
      'every request joins the new word to a colour the child already knows ("the red shirt"), so Unit 2 comes back in Unit 9',
      'each right answer adds to a line of clothes that stays (permanence) and the line dances in the wind at the end',
      'no clock, a wrong piece is named back ("No, not the dress! Listen again.") and the right one glows after two tries',
    ],
  },
  '8-6': {
    sources: ['early-years maths "people graphs" / favourite-food pictograph', 'Cambridge (Pre A1 Starters: listen and tick; food words review)', 'Wordwall group sort and "whack" games', 'Khan Academy Kids sorting and counting'],
    mechanics: [
      'people graph → Like Chart: each friend says "I like pizza!", the child puts their face in that column, Pip reads the chart ("Three friends like pizza!") and the child adds their own star',
      'group sort → odd one out (eat or drink?), a hidden-food tile reveal, and a sound ring toss with the unit\'s first sounds P, J, M, B',
      'review talk: "What do you like to eat? And to drink?"',
    ],
    betterThan: [
      'every sort is a heard sentence from a friend, and the result is a real chart the child can read (which food most friends like)',
      'the child\'s own choice goes on the chart last, so the review ends with them saying what THEY like',
      'no clock; a wrong column is answered by the friend ("No! I like pizza!") and the right one glows after two tries',
    ],
  },
  '8-5': {
    sources: ['Sesame Workshop (model, repeat, then the child says it; story with a planned pause)', 'Blue\'s Clues "pause" (ask, wait, then answer)', 'Khan Academy Kids / Lingokids "feed the character" and the classic grow-longer arcade game', 'Oxford Owl / Cambridge (picture story, retell in order; true or false)'],
    mechanics: [
      'picture story with a planned pause → our own stills film: the caterpillar visits the unit\'s places and says "I like …!", Pip asks "What does it like?" and waits 4 s',
      'feed the character + grow longer → Caterpillar Crawl: the caterpillar says "I like bananas!", the child taps it, the caterpillar crawls over, eats it and grows a segment, and at the end becomes the butterfly',
      'lift the leaf ("Where is the caterpillar?"), tick or cross about the story, story order, letter blocks C and B, and the child plays the caterpillar',
    ],
    betterThan: [
      'the story recycles the whole unit (picnic, café, party, orchard), so the new sentence "I like …" is heard with food the child already knows',
      'the song comes after the story, the words and the first game (owner, 2026-10-10), so the child sings words they know',
      'the growing caterpillar is a visible count of right answers and its ending is the story\'s own ending; no clock, a wrong food is named back',
    ],
  },
  '8-4': {
    sources: ['Toca Kitchen / Lingokids cooking play (put things in, see what you made)', 'Cambridge (Pre A1 Starters: listen and tick two things; "I like …" answers)', 'Sesame Workshop (model the sentence with every character, then the child says it)', 'Super Simple Songs "Do You Like…?" style ask-and-answer'],
    mechanics: [
      'cooking play → Smoothie Bar: a friend says "I like bananas and milk!", the child puts those in the blender, blends, and the smoothie takes their colour',
      'tap-each-character model → Who likes what?: four friends at the orchard table each say "I like …", then the camera turns to the child',
      'Guess Who with food cards ("Is it a banana?") and an A / B sound sort; ask-and-answer "Do you like …? Yes, I do!" both ways',
    ],
    betterThan: [
      'the order IS the lesson sentence ("I like …"), heard first from every friend, then built by the child into something they can see (the smoothie colour)',
      'the child picks one or two things, checks, then blends: a wrong mix is poured out with the line said again, and the right fruit glows after two tries',
      'no clock and no reading; the child also asks Pip "Do you like pizza?", so the question goes both ways',
    ],
  },
  '8-3': {
    sources: ['conveyor-belt / food-factory play in kids\' apps (Toca Kitchen, Lingokids food games)', 'Wordwall whack-a-mole (tap the right one as it passes)', 'Cambridge (Pre A1 Starters: listen and find; food words)', 'Khan Academy Kids pattern activities (what comes next?)'],
    mechanics: [
      'conveyor belt + whack-a-mole → Party Belt: a friend asks "Ice cream, please!" and the child taps that food as it rides past on the food truck\'s belt',
      'what comes next? → the party food train; letter bricks for the unit\'s first sounds P, C, B, J; the P basket',
      'role swap at the truck window: the child offers "Pizza, cake or ice cream?" and serves Pip',
    ],
    betterThan: [
      'the wanted food is only HEARD (nothing printed on the belt), and the earlier unit food rides along, so the three new words are picked out of the whole unit',
      'the belt never stops and every food comes round again: no fail state, no clock; a wrong grab is named back ("No, that\'s cake!") and the right one glows after two tries',
      'every friend asks politely and answers "Yummy! I like ice cream!", the language the child uses again in the role swap and the home mission',
    ],
  },
  '8-2': {
    sources: ['Lingokids and Toca-style café / shop role play (take an order and serve it)', 'Cambridge (Pre A1 Starters listening: listen and tick two things; food and drink words)', 'classroom "restaurant" role play with picture menus', 'Wordwall group sort (eat or drink)'],
    mechanics: [
      'café role play → Café Order: a friend orders one thing, then two ("Bread and water, please!"); the child taps them onto the tray and rings the bell to serve',
      'group sort → Eat or drink? catch-and-sort, the café food train (what is missing?) and first sounds B, W, J',
      'role swap: the child is the waiter and asks "What do you want?"',
    ],
    betterThan: [
      'orders grow from one to two things, so the child holds a whole spoken order in mind, then builds it themself (choose, check, serve) instead of tapping one picture',
      'a wrong tray comes back with the order said again, so the child simply listens again; the right food glows after two tries',
      'calm by design: no clock, every friend asks politely and thanks the child, and the waiter phrases are used again in the role swap',
    ],
  },
  '8-1': {
    sources: ['Lingokids and Khan Academy Kids "feed the character" play (give the food the character asks for)', 'Cambridge (Pre A1 Starters: listen and give / point; food words)', 'classroom pretend-picnic role play (Super Simple "Do you like…?" style)', 'Sesame Workshop (model the polite request, then let the child say it)'],
    mechanics: [
      'feed the character → Feed Pip: Pip asks "Can I have a banana, please?", the child gives the right food from the picnic blanket and it flies to Pip, who munches and thanks them',
      'quick-look recall of the three foods, picnic memory pairs and a letter-balloon pop for A, B, M',
      'role swap: the child asks Pip politely for a food',
    ],
    betterThan: [
      'the request is a whole polite sentence ("Can I have a banana, please?") that the child then uses themself in the role swap',
      'a wrong food is handed back with its name ("No, thank you! That\'s an apple."), so a mistake is more listening, never a buzzer',
      'calm by design: no clock, Pip\'s tummy fills a heart per food and the right food glows after two tries',
    ],
  },
  '7-6': {
    sources: ['Lingokids and Khan Academy Kids hide-and-seek / flashlight hidden-object play', '"Where\'s Spot?" lift-the-flap hide and seek (find the hiding animal)', 'Cambridge (Pre A1 Starters listening: listen and find; animal words)', 'Wordwall-style one-tap review games (claw grabber, stepping stones)'],
    mechanics: [
      'flashlight hidden-object → Night Sounds: a sound in the dark ("Moo! Moo! Who\'s there?"), the child says the animal, then moves the torch to find it; one tap shines, the next picks',
      'shadow matching on the barn wall, stepping stones called by an animal sound, and the Animal Grabber called by a sound',
      'role swap: the child makes the sound and Pip guesses',
    ],
    betterThan: [
      'sound first, word second, picture last: the child must turn the sound into the word before seeing anything (apps show the picture first)',
      'a wrong animal answers with its own sound ("That\'s a pig. Oink!"), so every mistake is more listening, never a buzzer',
      'calm by design: no clock, the farm lights come on at the end and all nine animals of the unit are there',
    ],
  },
  '7-5': {
    sources: ['the traditional song "Old MacDonald Had a Farm" (public domain: an animal and its sound per verse)', 'Sesame Workshop / Blue\'s Clues (model, then a planned pause for the child to answer)', 'Super Simple / Lingokids song-choice play (the child picks the next verse)', 'Cambridge (Pre A1 Starters: look and answer yes / no; story order)'],
    mechanics: [
      'the song as a story → a stills film "Grandpa\'s Noisy Barn": a sound behind each barn door, "What animal is this?", a pause, then the door opens',
      'song-choice → My Farm Song: the child is the farmer, chooses an animal, it hops onto the farm and Pip sings its verse; the child sings it back',
      'story order, "Who\'s behind the door?" (ask at each door), tick or cross, and feed the ducks with the story\'s pictures',
    ],
    betterThan: [
      'the child hears the SOUND first and must produce the animal word ("It\'s a cow!") before the door opens, three times with a pause',
      'in My Farm Song the child chooses and then sings the verse (animal word + sound) instead of only watching a song video; the farm they built stays on screen',
      'the film, the games and the homework all use the same barn and doors, so the child retells one story many ways; no clock',
    ],
  },
  '7-4': {
    sources: ['"Guess the animal" riddle cards and I-spy clue games (games4esl, British Council LearnEnglish Kids)', 'Cambridge (Pre A1 Starters listening: understand short descriptions; ask and answer yes / no)', 'Khan Academy Kids (calm listen-and-choose)', 'fairground hook-a-duck (a real game children know)'],
    mechanics: [
      'riddle cards → Animal Riddles: an animal hides behind the show-tent curtain, Pip gives clues one by one ("It says moo." "It is big." "It is black and white.") and the child answers "What animal is this?" after any clue',
      'hook-a-duck at the fair: toy animals float in the pool, "Catch the duck!"; Pip\'s Secret Card with animal cards ("Is it a cow?"); a D / C / H sound sort',
      'the child asks Pip "What animal is this?" and makes a sound for Pip to guess',
    ],
    betterThan: [
      'the clues use only words the child knows (sounds, big / small, colours), so a whole sentence — not one word — finds the animal',
      'the child chooses when to answer: more clues mean more help, never a penalty; every wrong pick names an animal ("No! It isn\'t the pig.")',
      'all nine animals of the unit are reviewed in one lesson, and the child also asks the question, not only answers it',
    ],
  },
  '7-3': {
    sources: ['Cambridge (Pre A1 Starters Listening: follow a short spoken instruction)', 'classic "follow the order" memory games (Simon / listen-and-sequence, games4esl)', 'Khan Academy Kids (sequencing activities, calm self-paced)', 'Lingokids / Super Simple farm songs (animal + sound)'],
    mechanics: [
      'listen-and-sequence → Animal Parade: Pip says "First the horse, then the duck!", the child taps the animals in that order, they line up on the bridge and march across making their sounds',
      'H basket (horse, hat, house, hand vs duck, chicken), first-letter build, a jigsaw of the duck pond',
      '"Now YOU make the parade!" — the child calls an order for Pip',
    ],
    betterThan: [
      'the child holds two or three NEW words in order (listening span), not just one word; the parade they build moves and makes the sounds',
      'a wrong order costs nothing: the bridge empties and Pip says the order again; three rounds grow from two animals to three',
      'the child then becomes the caller ("First the duck, then the horse!"), turning listening into speaking',
    ],
  },
  '7-2': {
    sources: ['Toca Boca / Lingokids pet-care "wash and groom" play', 'Khan Academy Kids (calm listen-and-do tasks, animal sounds)', 'Cambridge (Pre A1 Starters Listening: listen and point to the animal)', 'Lingokids / Super Simple farm-animal songs (animal + sound)'],
    mechanics: [
      'wash-and-groom play → Farm Wash: every animal is muddy after the rain, Pip says "Wash the pig!", the child scrubs that animal clean with three taps and Pip says "It\'s a pig! Oink!"',
      'big-to-small line-up of the farm animals (cow, sheep, pig, chick), the farm train "who is missing?", first-sound pick /k/ /p/ /sh/',
      '"Which farm animal do you like?" with the animal sound',
    ],
    betterThan: [
      'the action is the answer: the child must hear the WORD to know which animal to scrub; a wrong animal is named back and stays muddy',
      'the farm changes from muddy to clean as the child plays, so progress is a picture, not a score',
      'calm by design: no clock, three gentle taps per animal, the right one glows after two tries',
    ],
  },
  '7-1': {
    sources: ['photo-safari / "snap the animal" kids apps (camera listening hunts)', 'Khan Academy Kids (calm listen-and-find, animal sounds)', 'Cambridge (Pre A1 Starters Listening: listen and point to the animal)', 'Lingokids (animals and their sounds songs)', 'feely bag / mystery bag (games4esl "What\'s in the bag?")'],
    mechanics: [
      'camera listening hunt → Pet Photo: Pip says "Take a photo of the bird!", the pets swap places each round, the child taps the right one and its photo drops into an album',
      'mystery bag reused for pets: a dark shadow peeks out, the child names the pet, then says it with its colour ("It\'s a blue bird!")',
      'animal moves (TPR), pet memory pairs, a D / C / B balloon pop and "Which pet do you like?"',
    ],
    betterThan: [
      'the pets move between rounds, so the child must understand the word, not remember a place; a wrong pet says its own name and sound, so every tap teaches',
      'the album the child fills stays on screen and every photo can be tapped to hear the word again — a thing the child made',
      'calm by design: no clock, nothing to lose, the right pet glows after two tries',
    ],
  },
  '6-6': {
    sources: ['classic ESL board games (roll the dice, move, speak on the square — games4esl / teach-this board games)', 'Cambridge (Pre A1 Starters Speaking: answer short questions about a picture)', 'Duolingo ABC / Khan Academy Kids (path-style progress map, calm self-paced)', 'Lingokids ("My House" review games: odd one out, picture reveal)'],
    mechanics: [
      'roll-and-speak board game → My House Board Game: tap the dice, Pip hops along a path of unit pictures and asks a question on the square ("What colour is the bed?"); the child answers aloud, then Pip says it',
      'odd one out with rooms vs things and colours, a room hiding under tiles (guess early), a K / CH / B / S sound chest',
      'the child shows their own house ("This is my bedroom. My bed is blue!") and a home house-tour mission',
    ],
    betterThan: [
      'every square asks for a whole answer ("The bed is red!", "No, it isn\'t! The door is blue.") instead of one word, so the board reviews rooms, furniture, colours AND the story question',
      'no snakes, no losing, no clock: the dice numbers are set so every class lands on a good mix of squares and always reaches HOME in a few rolls',
      'the board is made of the pictures the child learned this unit, so finishing it is a visible "I know my whole house" moment',
    ],
  },
  '6-5': {
    sources: ['"Is this my house?" lost-and-found picture books (a little animal tries the wrong homes before the right one)', 'Cambridge (Pre A1 Starters: look and answer yes / no; listen and point)', 'Lingokids / Khan Academy Kids (hide-and-seek, yes-no listening checks, calm self-paced)', 'Sesame Workshop / Blue\'s Clues (model, then a planned pause for the child to answer)'],
    mechanics: [
      'the lost-and-found picture book → a stills film "Where\'s My House?": Pip asks "Is this my house?" at three doors, a pause lets the child answer before Pip does',
      'yes / no picture questions → Is This My House?: a friend says "My house has a red door!", an arrow stops at a door and the child answers "No, it isn\'t!" / "Yes, it is!"',
      'story retell (story order), tick or cross on the story pictures, "Which door?" colour quiz with the story\'s doors, and hide-and-seek on the street ("Is it behind the tree?")',
    ],
    betterThan: [
      'the child PRODUCES the story\'s two answers ("Yes, it is!" / "No, it isn\'t!") instead of only tapping a picture, and the same door is right for one friend and wrong for another, so the clue sentence decides',
      'a wrong answer is explained with the colour ("Look! The door is blue. No, it isn\'t!"), the friend waves from their open door and stays there; no clock',
      'the film, the games and the homework all use the same street and doors, so the child retells one story many ways',
    ],
  },
  '6-4': {
    sources: ['Cambridge (Pre A1 Starters Listening Part 1: listen and draw lines from each name to the person described; Part 4 listen and colour)', 'Lingokids ("In My Bedroom" topics; read and colour the bedroom)', 'Guess Who (Hasbro) information game (one clue is not enough)', 'Khan Academy Kids (calm listen-and-find picture tasks)', 'classroom show and tell'],
    mechanics: [
      'Starters Part 1 (match a name to the one described) + Guess Who → Whose Room?: three bedrooms with the same things in different colours; a friend says "My bed is red and my chair is blue!" and the child finds the only room that fits both clues',
      'Starters Part 4 colour words on furniture → Secret Card with coloured beds, chairs and sofas: the child asks "Is it a bed?" "Is it red?"',
      'show and tell → the child shows their own bedroom: "This is my bedroom. My bed is blue!"; I Spy on a street of coloured houses; a B / S sound sort (bed, sofa)',
    ],
    betterThan: [
      'no room can be found from one word: two rooms share each colour, so the child must understand the WHOLE show-and-tell sentence (thing + colour, twice) — the apps check one word',
      'a wrong room is named back with what is different ("No! That chair is yellow!"), so every mistake is another colour sentence; the right room glows after two tries, no clock',
      'each friend pops into their room and stays there, and the child then says whose room it is, so the game ends with all three friends at home and the child ready to show their own room',
    ],
  },
  '6-3': {
    sources: ['Toca Boca / Lingokids (build and decorate a house: put each thing in a room)', 'Cambridge (Pre A1 Starters listen and draw a line; "Where is…?" picture questions)', 'Khan Academy Kids (calm two-step listening tasks)', 'Wordwall (jigsaw / picture puzzles)'],
    mechanics: [
      'house decorating → House Builder: "Put the bed in the bedroom!" — the child picks the thing on the tray, then the room, and it stays there',
      '"Where is…?" picture questions → the family evening picture: "Where is Mom? Mom is in the kitchen!" (Unit 5 family + Unit 6 rooms)',
      'a furniture pattern train, a jigsaw of the family evening and a first-sound check (B, K, S, T)',
    ],
    betterThan: [
      'one sentence carries TWO words the child must understand — the thing AND the room — so the game checks the whole sentence, not one word',
      'the house the child furnishes stays furnished, and the child says the whole sentence ("The bed is in the bedroom!") after every move',
      'calm by design: a wrong thing or room is named back, the right one glows after two tries, no clock',
    ],
  },
  '6-2': {
    sources: ['Toca Boca-style room decorating (drag furniture into a room)', 'Lingokids (house and furniture words, listen and place)', 'Khan Academy Kids (calm listening tasks)', 'Cambridge (Pre A1 Starters listen and draw a line: put the thing where it goes)'],
    mechanics: [
      'room decorating → Moving Day: Pip asks "Bring the bed, please!", the child taps that piece on the moving truck and it flies to its place in the empty new room',
      'kim\'s-game memory → the moving truck version of the missing-car train: which box is empty?',
      'a CH / K catch sort (chair, cheese, chick vs. key, kite, kitten) that brings back last lesson\'s K',
    ],
    betterThan: [
      'nothing on screen names the piece — the spoken word alone picks it — and the room the child furnishes stays furnished, so the game ends with the child\'s own finished room',
      'every piece is named twice: Pip says it, then the child says "It\'s a sofa!" on the microphone before the next box comes',
      'calm by design: a wrong piece is named back ("No, that\'s the chair!"), the right one glows after two tries, no clock',
    ],
  },
  '6-1': {
    sources: ['Lingokids (house and rooms play; explore-the-house hide and seek)', 'Toca Boca-style dollhouse apps (open the house, visit each room)', 'Khan Academy Kids (calm "find it" listening)', 'Cambridge (Pre A1 Starters listen and point on a house picture)', 'classroom hide-and-seek "Where\'s the teddy?" (games4esl)'],
    mechanics: [
      'explore-the-house hide and seek → Where\'s Pip?: every room is dark, Pip calls "I\'m in the kitchen! Find me!", the child taps the room, the light clicks on and Pip pops up',
      'dollhouse visiting → the house opened like a dollhouse is the picture for the words, the spinner, the song and the home tour',
      'Move & Say room actions (cook, sleep, wash, watch TV) and memory pairs of the rooms',
    ],
    betterThan: [
      'all rooms are dark, so only the room WORD finds Pip — no guessing from the picture — and the child answers with the whole phrase "In the kitchen!"',
      'a wrong room lights up empty and is named back ("No, that\'s the bathroom!"), teaching the word it opened; the right room glows after two tries, no clock',
      'the same dollhouse picture carries the whole lesson (cards, game, spinner, home tour), so every room looks the same everywhere and the child builds one mental map of the house',
    ],
  },
  '5-6': {
    sources: ['family TV quiz-show format (buzzer + podiums; the format only, no content)', 'Khan Academy Kids (shadow puzzles)', 'Wordwall (image quiz: a picture uncovers tile by tile)', 'Cambridge (Pre A1 Starters listen and point; "Who is this?")'],
    mechanics: [
      'the quiz-show buzzer round → Family Buzzer Show: Pip asks a question from the unit\'s stories, the child buzzes the right family member, then says "This is my grandma!"',
      'shadow puzzles → Family Match-Up: each family sticker onto its shadow, named as it lands',
      'image quiz → Who\'s hiding?: a family member uncovers tile by tile, guess early and say it',
    ],
    betterThan: [
      'the quiz questions are the unit\'s own story moments (cookies with Grandma, ball with Dad, the family tree), so answering retells the whole unit, then the child says the full sentence',
      'one contestant and no clock: nobody races anybody, a wrong buzzer is named back ("No, that\'s Grandpa!") and the right one glows after two tries',
      'the sounds review unlocks family members (M mom, D dad, S sister, G grandma, B baby), so phonics and the unit words meet',
    ],
  },
  '5-5': {
    sources: ['"Just Me and My Dad"-style family-day picture books (one shared activity per page, read aloud)', 'Khan Academy Kids / Lingokids ("listen and feed" play, calm story retell)', 'Cambridge (Pre A1 Starters listen and point; look and tick)', 'Sesame Workshop (model → pause → answer)'],
    mechanics: [
      'the family-day picture book → a stills film "My Day with Dad": two pictures per action flip like a cartoon, karaoke action words, "What do we do?" with a pause for the child',
      'listen-and-feed play → Feed the Ducks: each duck carries a photo of the story, Pip says the story sentence, the child feeds that duck',
      'peekaboo lift-the-flap books → Hide and Seek with Dad: "Is he behind the door?" — a D word (dog, doll, duck) pops out until Dad is found',
    ],
    betterThan: [
      'every game answer is a whole sentence from the story ("We read a book!"), so the child retells the story while playing, with the story\'s own pictures',
      'the film asks the child before Pip answers (planned pause), then the games check the same four sentences by listening (ducks, tick or cross) and by order (story order)',
      'calm by design: wrong ducks are named back ("No, that\'s the book!"), the right duck glows after two tries, no clock',
    ],
  },
  '5-4': {
    sources: ['Lingokids / Khan Academy Kids (family sticker books, calm build play)', 'classroom "my family tree" craft (teach-this, twinkl family units)', 'Guess Who (Hasbro) information-gap questions', 'Cambridge (Pre A1 Starters "This is my…" introductions)'],
    mechanics: [
      'family-tree craft + sticker book → My Family Tree: hang each photo on the right branch by generation, then say "This is my grandma!"',
      'Guess Who → Secret Card with people: the child asks "Is it big?" then "Is it Grandma?"',
      'memory pairs of the family stickers, and a TH / S sound sort (thumb, three, thread)',
    ],
    betterThan: [
      'the child BUILDS the tree one generation at a time, so "family tree" means something, and names every photo twice (Pip, then the child on the microphone)',
      'Secret Card asks real questions about people (big / small, then the name) instead of colours and shapes — the information gap makes the question necessary',
      'calm by design: a wrong branch is named back ("Not there! Grandma goes at the top!"), the right branch glows after two tries, no clock',
    ],
  },
  '5-3': {
    sources: ['Lingokids / Toca Kitchen (cook-and-serve pretend play)', 'teach-this.com and games4esl ("What\'s missing?" / Kim\'s game)', 'Khan Academy Kids (calm, self-paced build and memory play)', 'Cambridge (Pre A1 Starters listen and point)'],
    mechanics: [
      'cook-and-serve play + listen and point → Grandma\'s Cookies: "Let\'s make a Grandpa cookie!" — pick the face icing, bake it, it joins the family plate',
      '"What\'s missing?" memory game → Who\'s Missing?: Grandma\'s photo wall, lights off, one photo is gone — name who is missing',
      'the big hug picture as a jigsaw, and Grandma\'s G basket for /g/ things',
    ],
    betterThan: [
      'the family word alone picks the cookie face (no word on screen first), and every cookie baked stays on the plate as a family the child built',
      'in Who\'s Missing? the child turns the lights off when ready — no clock — and answers with a family word they say back; the empty frame glows after two tries',
      'calm by design: a wrong face is named back ("No, that\'s Grandma!") and nothing is lost for trying',
    ],
  },
  '5-2': {
    sources: ['Khan Academy Kids (camera / photo reward, calm self-paced)', 'Lingokids (family & sticker-album games)', 'Montessori (size seriation: biggest to smallest)', 'Cambridge (Pre A1 Starters listen and point)', 'classroom show-and-tell with a family photo'],
    mechanics: [
      'camera rewards + listen and point → Family Photo: "Take a photo of my sister!" — snap that person in the family picture, a polaroid slides out',
      'Montessori size seriation → Line Up!: line the family up from the biggest to the smallest for the photo',
      'family-photo show-and-tell → the child tells Pip "This is my brother" about their own family',
    ],
    betterThan: [
      'no word on screen in Family Photo: the spoken family word alone finds the person, and every photo stays on the string as a keepsake',
      'Line Up! makes each step a family word the child hears and repeats ("My big brother!"), and recycles big / small from Unit 4',
      'calm by design: no clock, a wrong pick is named back ("That\'s my brother!") and the right one glows after two tries',
    ],
  },
  '4-6': {
    sources: ['Simon electronic memory game (watch the lights, repeat the order)', 'games4esl (Simon Says / "Touch your …" TPR)', 'Cambridge (Pre A1 Starters listen and point)', 'Lingokids (Draw Path)', 'Wordwall (odd one out)', 'Khan Academy Kids (calm, self-paced)'],
    mechanics: [
      'the Simon memory game + classroom Simon Says → Robo Says: Robo lights a chain of body parts, the child touches them in the same order',
      'Lingokids Draw Path → draw a line from Pip to the body part Mia names',
      'Wordwall odd one out → face or body? three are on the face, tap the one that is not',
    ],
    betterThan: [
      'the spoken body words are what the child remembers (Simon uses colours and beeps), and every part is named again when tapped',
      'a wrong tap names the part touched ("Oops! Robo\'s ears!") and replays the chain; the next part glows after two misses — no clock, no lives',
      'the child then becomes Simon and gives the orders (role swap), on the screen and at home',
    ],
  },
  '4-3': {
    sources: ['Classroom handprint / footprint art (preschool body-parts activity)', 'Lingokids (body-parts games)', 'Khan Academy Kids (calm, self-paced; a result that stays)', 'Cambridge (Pre A1 Starters listening: put the picture in the right place)', 'Sesame Workshop touch-tablet best practices (no clocks, deliberate actions)'],
    mechanics: [
      'handprint / footprint art → Sand Prints: hear "Press your foot in the sand!", choose the body part, the print stays in the sand',
      'Cambridge "listen and place" → the print lands on the beach picture the child is making',
      'peekaboo reveal → "Whose hands?": peek at a friend from earlier lessons and say who it is',
    ],
    betterThan: [
      'the spoken word alone decides which body part to press (apps match picture to picture)',
      'the prints stay: by the end the sand is a picture the child made',
      'calm by design: no clock, nothing moving, a wrong part is named back and the right one glows after two tries',
    ],
  },

};

export type VarietyIssue = { code: string; message: string };

const games = (scenes: readonly Pick<Scene, 'kind'>[]) => new Set(scenes.map((s) => s.kind).filter((k) => !ROUTINE_KINDS.has(k)));
/** Main pictures (lesson-specific art), ignoring the shared hello/goodbye cast pictures. */
const pictures = (scenes: readonly Scene[]) =>
  new Set(scenes.map((s) => (s as { bg?: string }).bg).filter((b): b is string => !!b && !/bg-(hello|goodbye)-cast/.test(b)));

export function checkLessonVariety(
  key: string,
  scenes: readonly Scene[],
  prev?: { key: string; scenes: readonly Scene[] },
  sameSlotLastUnit?: { key: string; scenes: readonly Scene[] },
): VarietyIssue[] {
  const out: VarietyIssue[] = [];
  // 1. Never more than 2 of the same kind in a row.
  for (let i = 2; i < scenes.length; i++) {
    if (scenes[i].kind === scenes[i - 1].kind && scenes[i].kind === scenes[i - 2].kind) {
      out.push({ code: 'same-kind-run', message: `three "${scenes[i].kind}" scenes in a row (${scenes[i - 2].id} … ${scenes[i].id})` });
    }
  }
  // 2. Enough different games inside the lesson.
  const g = games(scenes);
  if (g.size < 4) out.push({ code: 'few-games', message: `only ${g.size} different game kinds (need ≥ 4 besides the routine spine)` });
  // 3. No game from the lesson right before.
  if (prev) {
    const rep = [...g].filter((k) => games(prev.scenes).has(k));
    if (rep.length) out.push({ code: 'game-from-previous-lesson', message: `${rep.join(', ')} already used in ${prev.key}` });
    const pics = [...pictures(scenes)].filter((p) => pictures(prev.scenes).has(p));
    if (pics.length) out.push({ code: 'picture-from-previous-lesson', message: `pictures reused from ${prev.key}: ${pics.join(', ')}` });
    const a = LESSON_PROFILE[key]?.settings ?? [];
    const b = LESSON_PROFILE[prev.key]?.settings ?? [];
    const same = a.filter((x) => b.includes(x));
    if (same.length) out.push({ code: 'same-setting', message: `setting "${same.join(', ')}" also used by ${prev.key}` });
  }
  // 4. The same slot of the previous unit: at least half of the games must be new to the child.
  if (sameSlotLastUnit) {
    const old = games(sameSlotLastUnit.scenes);
    const rep = [...g].filter((k) => old.has(k));
    if (g.size && rep.length * 2 > g.size) out.push({ code: 'stale-slot', message: `${rep.length}/${g.size} games repeat ${sameSlotLastUnit.key} (${rep.join(', ')}); swap or upgrade them` });
  }
  // 5. Profile + research registered.
  const p = LESSON_PROFILE[key];
  if (!p || !p.settings.length || !p.look) out.push({ code: 'no-profile', message: 'add LESSON_PROFILE (settings + look)' });
  const r = RESEARCH_LOG[key];
  if (!r) out.push({ code: 'no-research', message: 'add RESEARCH_LOG: ≥ 3 benchmark sources, mechanics, betterThan' });
  else {
    if (r.sources.length < 3) out.push({ code: 'thin-research', message: `only ${r.sources.length} sources (need ≥ 3)` });
    if (!r.mechanics.length || !r.betterThan.length) out.push({ code: 'no-better', message: 'name the mechanics taken and what we do better' });
  }
  return out;
}
