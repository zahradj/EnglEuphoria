// Playground curriculum, Pre-A1 → B2 — the whole ladder in one place (owner 2026-10-15: "create the full curriculum of
// the playground from pre-A to B2, all of the units and lessons").
//
// Pre-A1 and A1 are already built / planned elsewhere and are only summarised here (their sources stay the truth):
//   Pre-A1 — src/content/playground-library/unit1/scenes.ts (LESSON_*_TITLE), src/planning/prea1Blueprint.ts
//   A1     — src/curriculum/roadmap/a1LessonPlans.ts, docs/a1-playground-roadmap.md
// A2, B1 and B2 are NEW here (status: draft for the owner's approval — no lesson is built before its unit plan is
// approved, CLAUDE.md "A lesson plan comes before every lesson").
//
// Every level: 10 units × 7 lessons, the same unit arc as A1 (L1-L2 new language · L3 listening + unit song · L4 speaking ·
// L5 story · L6 extra-practice games · L7 Boss Test). Every unit is its own world; no world repeats across levels.
// Research (mechanics, levels and grammar placement only, never content): docs/research/playground-curriculum-research.md.
// Rendered for reading: docs/playground-curriculum-prea1-b2.md (npx tsx scripts/render-playground-curriculum.ts).

import { A1_LESSON_PLANS } from './a1LessonPlans';

export type PlaygroundLevel = 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2';

export interface LevelProfile {
  level: PlaygroundLevel;
  ages: string;
  lessonLength: string;
  exam: string;                 // the Cambridge exam the level points at (format, not content)
  gse: string;                  // Pearson Global Scale of English range (approx.)
  exit: string;                 // what the child can do at the end of the level
  literacyStrand: string;       // phonics → spelling → word building
  writingStrand: string;
  status: string;
}

export interface CurriculumLesson {
  lesson: number;               // 1-7
  title: string;
  objective: string;            // "I can …"
}

export interface CurriculumUnit {
  level: PlaygroundLevel;
  unit: number;                 // 1-10
  world: string;                // the unit's world / adventure
  goal: string;                 // the unit can-do
  grammar: string[];            // the new structures
  vocabulary: string[];         // the new word sets
  literacy: string;             // sound / spelling / word-building step
  writing: string;              // the unit's writing task (A2+)
  speakingTask: string;         // the L4 / L7 real conversation
  lessons: CurriculumLesson[];
}

/** The unit arc every level shares (A1 roadmap §3). */
export const UNIT_ARC = [
  'L1 new language (part 1)',
  'L2 new language (part 2)',
  'L3 listening + the unit song',
  'L4 speaking — the child is the expert',
  'L5 story (Pre-A1: film; A1+: story pages / GIFs after a scenario)',
  'L6 extra-practice games',
  'L7 Boss Test (80 % per part, Practise-again packs)',
] as const;

export const LEVELS: LevelProfile[] = [
  {
    level: 'Pre-A1', ages: '4-6', lessonLength: '30 min, 22-25 pages', exam: 'Cambridge Pre A1 Starters (format)', gse: '10-21',
    exit: 'understands and says single words and chunks about self, colours, toys, body, family, home, animals, food, clothes and actions; follows simple instructions; recognises letters and blends CVC words',
    literacyStrand: 'letters and sounds (s a t p i n …), CVC blending, first sight words — no reading required to play',
    writingStrand: 'tracing letters only', status: 'built (10 units)',
  },
  {
    level: 'A1', ages: '6-9', lessonLength: '30 min, 30-49 pages', exam: 'Cambridge A1 Movers (format)', gse: '22-29',
    exit: 'talks about self, animals, food, feelings, places, abilities and routines in short sentences; asks and answers simple questions; reads short sentences and a 12-page story per unit',
    literacyStrand: 'digraphs, blends and vowel teams (ch, ck, th, ng, sh, wh, ee, oa, ai, oo, ar, er …) + Blend & Read + tongue twisters',
    writingStrand: 'copy and complete a sentence; label pictures', status: 'building (Units 1-6 in progress)',
  },
  {
    level: 'A2', ages: '8-10', lessonLength: '45 min, 35-49 pages', exam: 'Cambridge A2 Flyers / A2 Key for Schools (format)', gse: '30-42',
    exit: 'describes routines, past events, plans and experiences; compares, gives directions and simple advice; reads a 2-page story; writes a 30-40-word message',
    literacyStrand: 'long vowels and spelling patterns (split e, igh, ow/ou, -ed endings, -er/-est, silent letters)',
    writingStrand: 'short message, postcard, diary entry (30-40 words)', status: 'draft — needs the owner\'s OK',
  },
  {
    level: 'B1', ages: '9-11', lessonLength: '45 min, 35-49 pages', exam: 'Cambridge B1 Preliminary for Schools (format)', gse: '43-58',
    exit: 'tells a story with background and events, explains how things work, talks about experiences and the future, imagines, reports what people said; reads a short chapter; writes an email or story of about 100 words',
    literacyStrand: 'word building: prefixes (un-, re-, dis-), suffixes (-ful, -less, -er, -ly), word families, sentence stress',
    writingStrand: 'email, story, review (80-100 words)', status: 'draft — needs the owner\'s OK',
  },
  {
    level: 'B2', ages: '10-12', lessonLength: '45 min, 35-49 pages', exam: 'Cambridge B2 First for Schools (format; content stays child-safe)', gse: '59-75',
    exit: 'tells complex stories, speculates about past and future, argues a view politely, reports and summarises, handles wishes and hypotheses; reads a longer chapter; writes an article or story of 120-150 words',
    literacyStrand: 'word formation (-tion, -ment, -ness, -ous, -able), collocations, phrasal verbs, intonation for meaning',
    writingStrand: 'article, story, opinion essay, review (120-150 words)', status: 'draft — needs the owner\'s OK',
  },
];

/** Short helper: seven lessons in arc order. */
const L = (...pairs: [string, string][]): CurriculumLesson[] => pairs.map(([title, objective], i) => ({ lesson: i + 1, title, objective }));

/* ============================== PRE-A1 (built — summary) ============================== */
const PRE_A1: CurriculumUnit[] = [
  { level: 'Pre-A1', unit: 1, world: 'The Forest of Hellos', goal: 'say hello, my name and how I feel', grammar: ['Hello! I\'m …', 'How are you? I\'m happy.'], vocabulary: ['hello, goodbye', 'happy, sad', 'numbers 1-5'], literacy: 's a t p (see the lessons)', writing: '—', speakingTask: 'greet a friend and say my name',
    lessons: L(['The Forest of Hellos', 'I can say hello and goodbye.'], ['The Name Carnival', 'I can say my name.'], ['How Are You?', 'I can say how I feel.'], ['Bella\'s Birthday!', 'I can count to 5 and say how old I am.'], ['Leo\'s Lost Star', 'I can follow a short story.'], ['The Trophy Trail', 'I can use my hello words in games.'], ['Boss Test: Hello Hero', 'I can show what I learned.']) },
  { level: 'Pre-A1', unit: 2, world: 'Rainbow Land', goal: 'name colours and shapes', grammar: ['It\'s red.', 'What colour is it?'], vocabulary: ['red, blue, yellow, green, orange, purple', 'circle, square, triangle'], literacy: 'letter sounds (see the lessons)', writing: '—', speakingTask: 'say the colour and shape of things',
    lessons: L(['Red, Blue, Yellow!', 'I can name 3 colours.'], ['Green, Orange, Purple!', 'I can name 3 more colours.'], ['Circle, Square, Triangle!', 'I can name 3 shapes.'], ['What Color Is This?', 'I can ask and answer about colours.'], ['The Rainbow Fish\'s Scales', 'I can follow a colour story.'], ['Color & Shape Hunt', 'I can find colours and shapes.'], ['Boss Test: Rainbow Hero', 'I can show what I learned.']) },
  { level: 'Pre-A1', unit: 3, world: 'The Toy Room', goal: 'name toys and say what I like', grammar: ['It\'s a ball.', 'I like …'], vocabulary: ['ball, car, doll, teddy, blocks, train'], literacy: 'letter sounds (see the lessons)', writing: '—', speakingTask: 'show and tell my favourite toy',
    lessons: L(['Ball, Car, Doll!', 'I can name 3 toys.'], ['Teddy Bear, Blocks, Train!', 'I can name 3 more toys.'], ['What Do You Like to Play?', 'I can say what I like to play.'], ['My Favorite Toy', 'I can show and tell my toy.'], ['Tidy Up Time!', 'I can say where toys go: in, on, under.'], ['The Toy Fair', 'I can use toy words in games.'], ['Boss Test: Toy Hero', 'I can show what I learned.']) },
  { level: 'Pre-A1', unit: 4, world: 'Body Gym', goal: 'name body parts and move', grammar: ['Touch your …', 'I have two …'], vocabulary: ['head, shoulders, knees, toes', 'eyes, ears, mouth, nose', 'hands, feet, arms'], literacy: 'B (see the lessons)', writing: '—', speakingTask: 'play Simon Says',
    lessons: L(['Head, Shoulders, Knees, Toes!', 'I can name body parts.'], ['Eyes, Ears, Mouth, Nose!', 'I can name my face.'], ['Hands, Fingers, Feet, Arms!', 'I can name more body parts.'], ['My Big Body!', 'I can say I have …'], ['From Head to Toe', 'I can follow a body story.'], ['Simon Says Body Parts', 'I can follow body instructions.'], ['Boss Test: Body Hero', 'I can show what I learned.']) },
  { level: 'Pre-A1', unit: 5, world: 'Family Home', goal: 'name family members', grammar: ['This is my mom.', 'He\'s / She\'s …'], vocabulary: ['mom, dad, brother, sister, baby, grandma, grandpa'], literacy: 'G, D (see the lessons)', writing: '—', speakingTask: 'show my family tree',
    lessons: L(['Mom, Dad, Me!', 'I can name my mom and dad.'], ['Brother, Sister, Baby!', 'I can name more family.'], ['Grandma & Grandpa!', 'I can name my grandparents.'], ['My Family Tree', 'I can say who is in my family.'], ['Just Me and My Dad', 'I can follow a family story.'], ['Family Match-Up', 'I can use family words in games.'], ['Boss Test: Family Hero', 'I can show what I learned.']) },
  { level: 'Pre-A1', unit: 6, world: 'My House', goal: 'name rooms and furniture', grammar: ['It\'s in the kitchen.', 'Where\'s …?'], vocabulary: ['kitchen, bedroom, bathroom', 'table, chair, bed'], literacy: 'K, CH (see the lessons)', writing: '—', speakingTask: 'give a house tour',
    lessons: L(['Kitchen, Bedroom, Bathroom!', 'I can name rooms.'], ['Table, Chair, Bed!', 'I can name furniture.'], ['In My House', 'I can say what is in each room.'], ['My House', 'I can show and tell my house.'], ['Where\'s My House?', 'I can follow a house story.'], ['My House Game', 'I can use house words in games.'], ['Boss Test: House Hero', 'I can show what I learned.']) },
  { level: 'Pre-A1', unit: 7, world: 'Grandpa\'s Farm', goal: 'name animals and their sounds', grammar: ['It\'s a cow.', 'What animal is this?'], vocabulary: ['dog, cat, bird', 'cow, pig, sheep', 'horse, chicken, duck'], literacy: 'letter sounds (see the lessons)', writing: '—', speakingTask: 'guess the animal from its sound',
    lessons: L(['Dog, Cat, Bird!', 'I can name pets.'], ['Cow, Pig, Sheep!', 'I can name farm animals.'], ['Horse, Chicken, Duck!', 'I can name more farm animals.'], ['What Animal is This?', 'I can ask and answer about animals.'], ['Grandpa\'s Farm', 'I can follow a farm story and song.'], ['Animal Sounds Game', 'I can use animal words in games.'], ['Boss Test: Animal Hero', 'I can show what I learned.']) },
  { level: 'Pre-A1', unit: 8, world: 'The Picnic', goal: 'name food and say what I like', grammar: ['I like apples.', 'I don\'t like …'], vocabulary: ['apple, banana, milk', 'bread, water, juice', 'pizza, cake, ice cream'], literacy: 'letter sounds (see the lessons)', writing: '—', speakingTask: 'make a food preference chart',
    lessons: L(['Apple, Banana, Milk!', 'I can name food.'], ['Bread, Water, Juice!', 'I can name more food and drink.'], ['Pizza, Cake, Ice Cream!', 'I can name party food.'], ['I Like Apples!', 'I can say what I like.'], ['The Very Hungry Caterpillar', 'I can follow a food story.'], ['Food Preference Chart', 'I can ask a friend what they like.'], ['Boss Test: Food Hero', 'I can show what I learned.']) },
  { level: 'Pre-A1', unit: 9, world: 'The Dress-Up Shop', goal: 'name clothes and say what I\'m wearing', grammar: ['I\'m wearing …'], vocabulary: ['shirt, pants, dress', 'shoes, hat, socks', 'coat, skirt, T-shirt'], literacy: 'letter sounds (see the lessons)', writing: '—', speakingTask: 'dress up and say what I\'m wearing',
    lessons: L(['Shirt, Pants, Dress!', 'I can name clothes.'], ['Shoes, Hat, Socks!', 'I can name more clothes.'], ['Coat, Skirt, T-shirt!', 'I can name more clothes.'], ['What Are You Wearing?', 'I can say what I\'m wearing.'], ['Pip\'s White Shoes', 'I can follow a clothes story.'], ['Dress Up Game', 'I can use clothes words in games.'], ['Boss Test: Fashion Hero', 'I can show what I learned.']) },
  { level: 'Pre-A1', unit: 10, world: 'Action Camp', goal: 'say actions and what I can do', grammar: ['I can jump.', 'I can\'t fly.'], vocabulary: ['run, jump, walk', 'swim, dance, sing', 'clap, play, sleep'], literacy: 'R, J, C, B (see the lessons)', writing: '—', speakingTask: 'show what I can and can\'t do',
    lessons: L(['Run, Jump, Walk!', 'I can say actions.'], ['Swim, Dance, Sing!', 'I can say more actions.'], ['Clap, Play, Sleep!', 'I can say more actions.'], ['What Can You Do?', 'I can say what I can and can\'t do.'], ['Pip\'s Bear Hunt', 'I can follow an action story.'], ['Action Charades', 'I can act and guess actions.'], ['Action Hero', 'I can show what I learned (the Pre-A1 Final Test).']) },
];

/* ============================== A1 (planned — titles from a1LessonPlans.ts) ============================== */
const A1_WORLDS: [string, string, string[], string][] = [
  ['Welcome Town', 'greet, introduce myself and a friend, say how we feel', ['be: I\'m / He\'s / She\'s / They\'re', 'What\'s your name? How are you?', 'This is my friend'], 's a t p i n + f'],
  ['Jungle', 'describe a jungle animal and ask "Can it…?"', ['It can / can\'t + verb', 'Can it…? Yes, it can.', 'It\'s got a long tail'], 'ch, ck'],
  ['Space', 'count to 100, give directions, say the weather', ['How many…? There are + 21-100', 'Go left / right / up / down', 'What\'s the weather like?'], 'th, ng'],
  ['Food Festival', 'say what I like and like doing, offer and accept food', ['I like / don\'t like + -ing', 'Do you like…?', 'Would you like some…?', 'Let\'s…!'], 'gr pl sn br'],
  ['Monster Town', 'say how someone feels and why, describe looks and clothes', ['He\'s scared because…', 'She\'s got…', 'He\'s wearing…'], 'ee, ea'],
  ['Ocean', 'say what sea animals are doing and where they live; ask yes/no questions', ['present continuous', 'Is it a…? Yes, it is.', 'It lives in… It eats…'], 'wh, oa, sh at the end'],
  ['Hero City', 'say what I can do well, offer help, give rules', ['I can… well / fast', 'Can I help you?', 'What\'s the matter?', 'You must / mustn\'t'], 'ai, ay'],
  ['Dino Valley', 'compare dinosaurs and say what they were like', ['comparatives + than, the biggest', 'was / were, had'], 'oo, ar'],
  ['Magic Castle', 'say what is where and whose it is', ['There is / are', 'behind / between / in front of', 'Whose…? It\'s Wim\'s.'], 'oa, ow'],
  ['Gadget Lab', 'give step-by-step instructions and tell a robot\'s day', ['imperatives, First… Then…', 'present simple routines', 'What time is it?'], 'er, ur, or'],
];
const A1: CurriculumUnit[] = A1_WORLDS.map(([world, goal, grammar, literacy], i) => {
  const plans = A1_LESSON_PLANS.filter((p) => p.unit === i + 1).sort((a, b) => a.lesson - b.lesson);
  return {
    level: 'A1', unit: i + 1, world, goal, grammar, literacy,
    vocabulary: [...new Set(plans.flatMap((p) => p.newVocabulary))],
    writing: 'copy and complete a sentence', speakingTask: 'a mini-conversation in L4 and L7',
    lessons: plans.map((p) => ({ lesson: p.lesson, title: p.title, objective: p.objective })),
  };
});

/* ============================== A2 (new) ============================== */
const A2: CurriculumUnit[] = [
  {
    level: 'A2', unit: 1, world: 'Welcome Town, a year later', goal: 'describe my day and my week and tell what I did yesterday',
    grammar: ['present simple + always / usually / sometimes / never', 'past simple: regular -ed and common irregular verbs', 'yesterday, last…, ago'],
    vocabulary: ['daily routines', 'days, weekend', 'irregular verbs: woke, ate, went, saw, had'],
    literacy: 'split e (cap → cape), ay, ee; -ed said /t/ /d/ /ɪd/', writing: 'my diary for one day (30 words)', speakingTask: 'interview a friend: What do you do on Saturdays? What did you do yesterday?',
    lessons: L(['My Day', 'I can describe my day in the present simple.'], ['My Week', 'I can say how often I do things.'], ['Yesterday', 'I can say what I did yesterday.'], ['Interview: A Day in Your Life', 'I can ask and answer about routines and yesterday.'], ['Story: Pip\'s Busy Saturday', 'I can read and retell a story in the past.'], ['Extra Practice: Diary Detectives', 'I can use routines and the past in games.'], ['Boss Test: Day Planner', 'I can show what I learned.']),
  },
  {
    level: 'A2', unit: 2, world: 'Pirate Island', goal: 'tell a short adventure in the past, with what was happening',
    grammar: ['past simple questions: Did you…? Where did…?', 'past continuous: was / were + -ing', 'when + past simple (We were sailing when the storm started.)'],
    vocabulary: ['ship, island, map, treasure, storm, wave, captain, parrot', 'sail, dig, find, lose, climb'],
    literacy: 'igh, y as /aɪ/ (night, light, sky, fly)', writing: 'a captain\'s log (30-40 words)', speakingTask: 'tell your crew what happened last night',
    lessons: L(['All Aboard: Pirate Words', 'I can name things on a pirate adventure and say what we did.'], ['Did You Find It?', 'I can ask and answer past questions.'], ['Listen: The Storm Song', 'I can understand what was happening when something happened.'], ['What Were You Doing?', 'I can say what I was doing at a time in the past.'], ['Story: The Parrot\'s Secret Map', 'I can read an adventure story and order the events.'], ['Extra Practice: Treasure Hunt Games', 'I can use past forms in games.'], ['Boss Test: Pirate Captain', 'I can show what I learned.']),
  },
  {
    level: 'A2', unit: 3, world: 'Weather Station', goal: 'talk about seasons, dates and plans, and predict the weather',
    grammar: ['be going to for plans', 'will / won\'t for predictions', 'ordinal numbers and dates (on the 5th of May)'],
    vocabulary: ['months, seasons', 'weather: foggy, stormy, rainbow, temperature', 'holiday plans'],
    literacy: 'ow / ou (snow, cloud), ar / or (March, storm)', writing: 'a weather report or plan for the weekend (35 words)', speakingTask: 'be the TV weather presenter and plan a trip',
    lessons: L(['Months and Seasons', 'I can say the months, seasons and dates.'], ['I\'m Going to…: My Plans', 'I can talk about my plans.'], ['Listen: The Four Seasons Song', 'I can understand weather forecasts.'], ['Tomorrow It Will Rain!', 'I can predict the weather.'], ['Story: The Rainbow Machine', 'I can read a story and find the dates and plans.'], ['Extra Practice: Forecast Fun', 'I can use dates, plans and predictions in games.'], ['Boss Test: Weather Reporter', 'I can show what I learned.']),
  },
  {
    level: 'A2', unit: 4, world: 'Sports Camp', goal: 'compare people and sports, say how I do things and what I have to do',
    grammar: ['comparatives and superlatives (+ irregular good / better / best)', 'adverbs of manner (quickly, carefully, well)', 'have to / don\'t have to'],
    vocabulary: ['sports and equipment', 'win, lose, score, team, race', 'fast, strong, careful'],
    literacy: '-er / -est spelling (bigger, happiest), -ly', writing: 'a sports day report (35 words)', speakingTask: 'explain the rules of a game',
    lessons: L(['Let\'s Play: Sports Words', 'I can name sports and say what I like playing.'], ['Faster, Higher, the Best!', 'I can compare people and things.'], ['Listen: The Sports Day Cheer', 'I can understand results and comparisons.'], ['You Have to Kick the Ball!', 'I can explain rules with have to / don\'t have to.'], ['Story: The Slowest Runner Wins', 'I can read a story and say how characters did things.'], ['Extra Practice: Camp Olympics', 'I can use comparisons and adverbs in games.'], ['Boss Test: Camp Champion', 'I can show what I learned.']),
  },
  {
    level: 'A2', unit: 5, world: 'The Market', goal: 'shop, ask prices and quantities, and order food politely',
    grammar: ['countable / uncountable nouns, some / any', 'How much / How many…?', 'Would you like…? I\'d like…, Can I have…?'],
    vocabulary: ['shops and food containers (a bottle of, a packet of)', 'money and prices', 'a lot of, a few, a little'],
    literacy: 'soft c and g (price, juice, orange)', writing: 'a shopping list and a note to a friend (30 words)', speakingTask: 'be the shopkeeper and the customer',
    lessons: L(['At the Market: Food and Shops', 'I can name shops and food containers.'], ['Some, Any, How Much?', 'I can ask how much and how many.'], ['Listen: The Market Song', 'I can understand prices and orders.'], ['I\'d Like Some Apples, Please', 'I can buy things politely.'], ['Story: The Lost Purse', 'I can read a story and follow the shopping.'], ['Extra Practice: Market Day', 'I can use shopping language in games.'], ['Boss Test: Super Shopper', 'I can show what I learned.']),
  },
  {
    level: 'A2', unit: 6, world: 'City Explorer', goal: 'find my way, give directions and describe a town',
    grammar: ['prepositions of movement (along, across, past, through)', 'imperatives for directions', 'there was / there were'],
    vocabulary: ['places in town', 'map words: corner, bridge, traffic lights', 'transport'],
    literacy: 'air / are / ear (chair, square, bear)', writing: 'directions to my house (35 words)', speakingTask: 'guide a tourist on a map',
    lessons: L(['Places in Town', 'I can name places in a town.'], ['Go Past the Park!', 'I can follow and give directions.'], ['Listen: Where Are We Going?', 'I can follow directions I hear.'], ['Excuse Me, Where Is…?', 'I can ask for and give directions.'], ['Story: Lost in the Big City', 'I can read a story and trace the route.'], ['Extra Practice: Map Missions', 'I can use town and direction words in games.'], ['Boss Test: City Guide', 'I can show what I learned.']),
  },
  {
    level: 'A2', unit: 7, world: 'Rainforest Rangers', goal: 'say what happens if…, give advice and talk about nature',
    grammar: ['zero conditional (If you heat ice, it melts.)', 'first conditional (If it rains, we\'ll stay inside.)', 'should / shouldn\'t for advice'],
    vocabulary: ['rainforest animals and plants', 'nature: river, waterfall, leaf, seed', 'recycle, protect, plant'],
    literacy: 'ur / ir / er (turtle, bird, river)', writing: 'a ranger poster: 3 rules (35 words)', speakingTask: 'advise a new ranger',
    lessons: L(['Into the Rainforest', 'I can name rainforest animals and plants.'], ['If It Rains…', 'I can say what happens if…'], ['Listen: The Ranger\'s Song', 'I can understand advice and rules.'], ['You Should Protect the Trees', 'I can give advice with should.'], ['Story: The Seed That Saved the Forest', 'I can read a story and say what will happen next.'], ['Extra Practice: Ranger Missions', 'I can use if-sentences and advice in games.'], ['Boss Test: Head Ranger', 'I can show what I learned.']),
  },
  {
    level: 'A2', unit: 8, world: 'Museum at Night', goal: 'ask and answer about the past and describe life long ago',
    grammar: ['Wh- questions in the past (When / Why / How did…?)', 'subject and object questions (Who opened the box? / What did he open?)', 'could / couldn\'t for past ability'],
    vocabulary: ['museum and history words: king, queen, castle, knight, mummy, statue', 'old, ancient, modern'],
    literacy: 'kn, wr, mb silent letters (knight, write, climb)', writing: 'a museum label for an object (30 words)', speakingTask: 'interview a museum statue that comes alive',
    lessons: L(['At the Museum', 'I can name museum objects and say how old they are.'], ['When Did They Live?', 'I can ask past Wh- questions.'], ['Listen: The Night Guard\'s Tour', 'I can understand a tour about the past.'], ['Who Took the Crown?', 'I can ask subject and object questions.'], ['Story: The Statue Who Woke Up', 'I can read a story and say what people could do long ago.'], ['Extra Practice: Museum Mysteries', 'I can use past questions in games.'], ['Boss Test: Museum Detective', 'I can show what I learned.']),
  },
  {
    level: 'A2', unit: 9, world: 'Holiday Adventures', goal: 'talk about experiences and things I have done',
    grammar: ['present perfect: Have you ever…? I\'ve never…', 'been to / gone to', 'already / yet / just'],
    vocabulary: ['holiday places and activities', 'travel: suitcase, ticket, passport, airport', 'past participles'],
    literacy: 'oy / oi, aw / au (enjoy, coin, saw, August)', writing: 'a postcard from my holiday (40 words)', speakingTask: 'Find someone who… — ask about experiences',
    lessons: L(['Pack Your Suitcase!', 'I can name travel things and holiday places.'], ['Have You Ever…?', 'I can ask and answer about experiences.'], ['Listen: The Travel Song', 'I can understand what people have done.'], ['I\'ve Already Packed!', 'I can say what I have already done or not yet.'], ['Story: The Postcard Puzzle', 'I can read postcards and find where people have been.'], ['Extra Practice: Around-the-World Games', 'I can use experience language in games.'], ['Boss Test: World Traveller', 'I can show what I learned.']),
  },
  {
    level: 'A2', unit: 10, world: 'Show Time: The School Play', goal: 'tell a story in order and put on a short show',
    grammar: ['linking words: first, then, after that, finally, because, so, but', 'possessive pronouns (mine, yours, hers)', 'Could you…? / Can I…? requests'],
    vocabulary: ['theatre: stage, costume, script, audience', 'feelings: nervous, proud', 'review all A2'],
    literacy: 'review of A2 patterns + reading aloud with expression', writing: 'a short story or play scene (40 words)', speakingTask: 'perform and present the show',
    lessons: L(['Behind the Stage', 'I can name theatre words and say whose things are whose.'], ['First, Then, Finally', 'I can tell a story in the right order.'], ['Listen: The Show Song', 'I can follow a story told in steps.'], ['Could You Help Me, Please?', 'I can make polite requests and give reasons.'], ['Story: The Night of the Show', 'I can read a playscript and act a part.'], ['Extra Practice: Rehearsal Games', 'I can use the whole A2 level in games.'], ['A2 Final Test: Star of the Show', 'I can show I am ready for B1.']),
  },
];

/* ============================== B1 (new) ============================== */
const B1: CurriculumUnit[] = [
  {
    level: 'B1', unit: 1, world: 'Detective Agency', goal: 'tell what happened and work out who did it',
    grammar: ['past continuous vs past simple (when / while)', 'must / might / can\'t be (present deduction)', 'clue language: It looks like…'],
    vocabulary: ['crime-free mysteries: clue, suspect, witness, footprint, alibi', 'describing people'],
    literacy: 'prefixes un-, dis- (unlock, disappear)', writing: 'a detective report (80 words)', speakingTask: 'question the suspects and explain your answer',
    lessons: L(['The Case of the Missing Cake', 'I can describe what was happening at the time of a mystery.'], ['It Must Be the Cat!', 'I can make deductions with must, might and can\'t.'], ['Listen: The Witness', 'I can pick out key facts from a witness story.'], ['Interview the Suspects', 'I can ask and answer about past events in detail.'], ['Story: The Clock Tower Mystery', 'I can follow a mystery chapter and spot clues.'], ['Extra Practice: Case Files', 'I can use narrative tenses and deduction in games.'], ['Boss Test: Chief Detective', 'I can show what I learned.']),
  },
  {
    level: 'B1', unit: 2, world: 'Inventors\' Workshop', goal: 'explain how things are made and how they work',
    grammar: ['present simple passive (It is made of… / It is used for…)', 'past simple passive (It was invented in…)', 'purpose: to… / so that…'],
    vocabulary: ['materials: metal, plastic, glass, wood, wool', 'inventions and machines', 'verbs: build, design, power'],
    literacy: 'suffixes -er / -or (inventor, designer)', writing: 'a product description (80 words)', speakingTask: 'pitch your invention to the judges',
    lessons: L(['What Is It Made Of?', 'I can say what things are made of and used for.'], ['It Was Invented in…', 'I can talk about inventions with the past passive.'], ['Listen: The Inventors\' Podcast', 'I can understand a short talk about an invention.'], ['Pitch Your Invention!', 'I can explain how my invention works and why it is useful.'], ['Story: The Robot Who Wanted to Paint', 'I can read a chapter and explain how a machine works.'], ['Extra Practice: Workshop Challenge', 'I can use the passive and purpose in games.'], ['Boss Test: Master Inventor', 'I can show what I learned.']),
  },
  {
    level: 'B1', unit: 3, world: 'Eco Heroes', goal: 'talk about the future of our planet and what we can do',
    grammar: ['will / going to / may / might for the future', 'first conditional with unless', 'too much / too many / not enough'],
    vocabulary: ['environment: pollution, plastic, energy, recycle, wildlife', 'actions: reduce, reuse, save, switch off'],
    literacy: 'suffixes -ful / -less (careful, useless)', writing: 'an eco-club email (80 words)', speakingTask: 'plan a green week for your school',
    lessons: L(['Our Planet in Trouble', 'I can describe environmental problems.'], ['It Might Be Too Late…', 'I can predict the future with will, may and might.'], ['Listen: The Eco Radio Show', 'I can understand a radio report about the planet.'], ['Unless We Act…', 'I can say what will happen if we do or don\'t act.'], ['Story: The Island of Plastic', 'I can read a story and give my opinion about it.'], ['Extra Practice: Green Missions', 'I can use future forms in games.'], ['Boss Test: Planet Protector', 'I can show what I learned.']),
  },
  {
    level: 'B1', unit: 4, world: 'Around the World', goal: 'talk about countries, cultures and my experiences',
    grammar: ['present perfect vs past simple', 'for / since', 'How long have you…?'],
    vocabulary: ['countries, nationalities, languages', 'culture: festival, tradition, food, landmark'],
    literacy: 'nationality suffixes -ish, -ese, -ian', writing: 'a travel blog post (90 words)', speakingTask: 'compare a festival in your country with one abroad',
    lessons: L(['Countries and Cultures', 'I can talk about countries, nationalities and languages.'], ['I\'ve Been There! (When?)', 'I can choose the present perfect or the past simple.'], ['Listen: Kids Around the World', 'I can understand children describing their countries.'], ['How Long Have You Lived Here?', 'I can ask and answer with for and since.'], ['Story: The Festival of Lights', 'I can read about a festival and compare it with mine.'], ['Extra Practice: World Quiz', 'I can use experience language in games.'], ['Boss Test: Global Explorer', 'I can show what I learned.']),
  },
  {
    level: 'B1', unit: 5, world: 'Junior Chef Academy', goal: 'follow and give recipes and talk about healthy food',
    grammar: ['quantifiers: a few, a little, plenty of, too much', 'sequencing instructions', 'should / ought to / had better'],
    vocabulary: ['cooking verbs: chop, boil, fry, mix, bake', 'ingredients, tastes, healthy eating'],
    literacy: 'word families (cook, cooker, cooking)', writing: 'a recipe card (80 words)', speakingTask: 'run a cooking show',
    lessons: L(['In the Kitchen', 'I can name ingredients and cooking actions.'], ['A Little or a Few?', 'I can use quantifiers correctly.'], ['Listen: The Cooking Show', 'I can follow spoken instructions.'], ['You\'d Better Wash Your Hands!', 'I can give advice about healthy food and safety.'], ['Story: The Cake Disaster', 'I can read a story and explain what went wrong.'], ['Extra Practice: Kitchen Challenge', 'I can use food language in games.'], ['Boss Test: Head Chef', 'I can show what I learned.']),
  },
  {
    level: 'B1', unit: 6, world: 'Animal Rescue Centre', goal: 'describe animals and people in detail',
    grammar: ['defining relative clauses: who / which / that / where', 'adjective order', 'so / such… that'],
    vocabulary: ['wild animals, habitats, body parts', 'jobs at the rescue centre: vet, keeper, volunteer'],
    literacy: 'compound words (rainforest, sunlight)', writing: 'an animal fact file (90 words)', speakingTask: 'describe an animal so your partner can guess it',
    lessons: L(['Meet the Rescue Team', 'I can describe people\'s jobs and animals\' habitats.'], ['The Animal Which…', 'I can describe with relative clauses.'], ['Listen: A Day at the Rescue Centre', 'I can understand detailed descriptions.'], ['Guess My Animal!', 'I can give clear descriptions so others can guess.'], ['Story: The Orphan Elephant', 'I can read a story and describe the characters.'], ['Extra Practice: Rescue Missions', 'I can use relative clauses in games.'], ['Boss Test: Rescue Ranger', 'I can show what I learned.']),
  },
  {
    level: 'B1', unit: 7, world: 'Space Station', goal: 'talk about life in space and things that have been going on',
    grammar: ['present perfect continuous (I\'ve been training for…)', 'have to / must / don\'t have to (rules)', 'question tags (It\'s amazing, isn\'t it?)'],
    vocabulary: ['space life: gravity, oxygen, mission, astronaut, orbit', 'daily routines in space'],
    literacy: 'prefix re- and over- / under-', writing: 'an astronaut\'s blog (90 words)', speakingTask: 'interview an astronaut',
    lessons: L(['Welcome Aboard', 'I can describe life on a space station.'], ['We\'ve Been Floating for Hours!', 'I can talk about actions that have been going on.'], ['Listen: Mission Control', 'I can understand instructions and rules.'], ['Space Rules, Aren\'t They?', 'I can check facts with question tags.'], ['Story: Lost in Orbit', 'I can read a chapter and explain the problem and solution.'], ['Extra Practice: Space Training', 'I can use these forms in games.'], ['Boss Test: Mission Commander', 'I can show what I learned.']),
  },
  {
    level: 'B1', unit: 8, world: 'Dream Jobs Fair', goal: 'talk about jobs, dreams and imaginary situations',
    grammar: ['second conditional (If I were…, I would…)', 'would like to / want to / hope to', 'gerund vs infinitive after common verbs'],
    vocabulary: ['jobs and workplaces', 'skills and qualities: patient, creative, brave'],
    literacy: 'suffixes -ist, -ian (artist, musician)', writing: 'a letter to my future self (90 words)', speakingTask: 'interview for a dream job',
    lessons: L(['Jobs Fair', 'I can describe jobs and the skills they need.'], ['If I Were a Pilot…', 'I can imagine situations with the second conditional.'], ['Listen: Meet the Workers', 'I can understand people talking about their work.'], ['My Dream Job Interview', 'I can talk about my dreams and abilities.'], ['Story: The Girl Who Wanted to Fly', 'I can read a story and talk about the characters\' dreams.'], ['Extra Practice: Job Match', 'I can use conditionals and verb patterns in games.'], ['Boss Test: Career Star', 'I can show what I learned.']),
  },
  {
    level: 'B1', unit: 9, world: 'Time Machine', goal: 'compare the past with now and tell stories in order',
    grammar: ['used to / didn\'t use to', 'past perfect (had + past participle)', 'before / after / by the time'],
    vocabulary: ['history and technology then and now', 'time words: century, ancient, nowadays'],
    literacy: 'past participle spelling, irregular verb families', writing: 'a story with a twist (100 words)', speakingTask: 'compare life 100 years ago with today',
    lessons: L(['Then and Now', 'I can compare life in the past with today.'], ['People Used to…', 'I can talk about past habits with used to.'], ['Listen: Grandma\'s Story', 'I can follow a story told about the past.'], ['Before the Machine Had Landed…', 'I can tell events in order with the past perfect.'], ['Story: The Boy from 1920', 'I can read a time-travel chapter and order the events.'], ['Extra Practice: Time Travel Games', 'I can use past forms in games.'], ['Boss Test: Time Traveller', 'I can show what I learned.']),
  },
  {
    level: 'B1', unit: 10, world: 'Kids\' News Studio', goal: 'report news and what people said, and present a report',
    grammar: ['reported speech (say / tell, tense back-shift)', 'reported questions', 'embedded questions (Can you tell me where…?)'],
    vocabulary: ['news and media: headline, interview, reporter, article', 'reporting verbs: ask, explain, promise'],
    literacy: 'review of B1 word building + headline style', writing: 'a news article (100 words)', speakingTask: 'present the evening news',
    lessons: L(['Breaking News!', 'I can understand and write headlines.'], ['She Said That…', 'I can report what people said.'], ['Listen: The Interview', 'I can understand an interview and report it.'], ['Can You Tell Me Why…?', 'I can ask polite embedded questions.'], ['Story: The Scoop', 'I can read a news story and retell it.'], ['Extra Practice: Newsroom Games', 'I can use the whole B1 level in games.'], ['B1 Final Test: News Anchor', 'I can show I am ready for B2.']),
  },
];

/* ============================== B2 (new) ============================== */
const B2: CurriculumUnit[] = [
  {
    level: 'B2', unit: 1, world: 'Spy Academy', goal: 'tell complex stories with background and earlier events',
    grammar: ['narrative tenses: past perfect simple and continuous', 'as / as soon as / by the time / until', 'adverbs for storytelling (suddenly, eventually)'],
    vocabulary: ['secret codes, gadgets, mission, disguise, escape', 'feelings in stories'],
    literacy: 'word formation: -tion / -sion', writing: 'a mission story (120 words)', speakingTask: 'debrief a mission to the head of the academy',
    lessons: L(['Welcome to Spy Academy', 'I can describe a scene and what had happened before.'], ['They Had Been Waiting for Hours', 'I can use the past perfect continuous.'], ['Listen: The Secret Message', 'I can follow a complex spoken story.'], ['Mission Debrief', 'I can tell a story with clear time order.'], ['Story: The Vanishing Code', 'I can read a longer chapter and infer meaning.'], ['Extra Practice: Code Breakers', 'I can use narrative tenses in games.'], ['Boss Test: Master Spy', 'I can show what I learned.']),
  },
  {
    level: 'B2', unit: 2, world: 'Future City 2050', goal: 'speculate about the future and what will have happened',
    grammar: ['future continuous (This time next year I\'ll be…)', 'future perfect (By 2050 we\'ll have…)', 'likely / bound to / due to'],
    vocabulary: ['technology, transport, cities, energy of the future'],
    literacy: 'prefixes over-, under-, mis-, auto-', writing: 'an article about our city in 2050 (130 words)', speakingTask: 'present your future city design',
    lessons: L(['Welcome to 2050', 'I can describe a future city.'], ['This Time Next Year…', 'I can talk about actions in progress in the future.'], ['Listen: The Future Podcast', 'I can understand predictions and opinions.'], ['By 2050 We Will Have…', 'I can say what will be finished by a time.'], ['Story: The Last Car in the City', 'I can read a story and discuss its ideas.'], ['Extra Practice: City Builders', 'I can use future forms in games.'], ['Boss Test: Future Planner', 'I can show what I learned.']),
  },
  {
    level: 'B2', unit: 3, world: 'Lost Kingdom Expedition', goal: 'work out what happened in the past from evidence',
    grammar: ['modals of past deduction: must have / might have / can\'t have', 'should have / shouldn\'t have', 'It seems / It appears that…'],
    vocabulary: ['archaeology: ruins, artefact, tomb, temple, explorer', 'describing evidence'],
    literacy: 'word formation: -ment / -ness', writing: 'an expedition report (130 words)', speakingTask: 'explain a mystery from the clues',
    lessons: L(['The Lost Kingdom', 'I can describe ancient places and finds.'], ['They Must Have Left in a Hurry', 'I can make deductions about the past.'], ['Listen: The Explorer\'s Diary', 'I can infer what happened from what I hear.'], ['We Should Have Brought a Map!', 'I can talk about past mistakes.'], ['Story: The Temple of Echoes', 'I can read a chapter and justify my conclusions.'], ['Extra Practice: Expedition Puzzles', 'I can use past modals in games.'], ['Boss Test: Chief Explorer', 'I can show what I learned.']),
  },
  {
    level: 'B2', unit: 4, world: 'Young Scientists\' Lab', goal: 'describe experiments and processes precisely',
    grammar: ['passives in all tenses', 'causative: have / get something done', 'reduced relative clauses'],
    vocabulary: ['science: experiment, result, hypothesis, measure, observe'],
    literacy: 'word formation: -ous / -al / -ic', writing: 'a lab report (130 words)', speakingTask: 'present an experiment to the science fair',
    lessons: L(['In the Lab', 'I can describe equipment and experiments.'], ['It Has Been Tested', 'I can use the passive in different tenses.'], ['Listen: The Science Fair', 'I can follow a description of a process.'], ['We Had It Checked', 'I can use have / get something done.'], ['Story: The Experiment That Went Wrong', 'I can read a chapter and explain cause and effect.'], ['Extra Practice: Lab Challenges', 'I can use the passive in games.'], ['Boss Test: Head Scientist', 'I can show what I learned.']),
  },
  {
    level: 'B2', unit: 5, world: 'The Great Debate Club', goal: 'give and defend my opinion politely',
    grammar: ['contrast: although / however / despite / whereas', 'opinion and agreement language', 'discourse markers: firstly, on the other hand, to sum up'],
    vocabulary: ['school and kid-safe topics: homework, uniforms, pets, screen time'],
    literacy: 'collocations (make a decision, take part)', writing: 'an opinion essay (140 words)', speakingTask: 'a friendly class debate',
    lessons: L(['Let\'s Debate!', 'I can give my opinion with reasons.'], ['Although…, However…', 'I can show contrast between ideas.'], ['Listen: Two Sides of the Story', 'I can identify different opinions.'], ['I See Your Point, But…', 'I can agree and disagree politely.'], ['Story: The Vote', 'I can read an argument and judge its reasons.'], ['Extra Practice: Debate Games', 'I can use linking words in games.'], ['Boss Test: Debate Champion', 'I can show what I learned.']),
  },
  {
    level: 'B2', unit: 6, world: 'Film Studio', goal: 'report conversations and retell films',
    grammar: ['reported speech: statements, questions and commands', 'reporting verbs (suggest, warn, deny, admit)', 'verb patterns after reporting verbs'],
    vocabulary: ['film: director, scene, plot, character, soundtrack, review'],
    literacy: 'phrasal verbs with turn, give, come', writing: 'a film review (140 words)', speakingTask: 'pitch and retell a film',
    lessons: L(['Lights, Camera, Action!', 'I can talk about films and how they are made.'], ['The Director Told Us to…', 'I can report questions and commands.'], ['Listen: Behind the Scenes', 'I can understand interviews about a film.'], ['She Suggested Filming at Night', 'I can use reporting verbs.'], ['Story: The Missing Reel', 'I can read a script and retell it in reported speech.'], ['Extra Practice: Studio Games', 'I can use reported speech in games.'], ['Boss Test: Film Director', 'I can show what I learned.']),
  },
  {
    level: 'B2', unit: 7, world: 'Wishing Island', goal: 'talk about wishes, regrets and imaginary pasts',
    grammar: ['wish / if only (present and past)', 'third conditional', 'mixed conditionals'],
    vocabulary: ['feelings and choices: regret, decision, chance, luck'],
    literacy: 'word formation: -able / -ible, negative prefixes', writing: 'a story ending with a wish (140 words)', speakingTask: 'discuss choices and what might have happened',
    lessons: L(['The Wishing Well', 'I can talk about wishes for now.'], ['If Only I Had…', 'I can talk about regrets.'], ['Listen: Three Wishes', 'I can understand hypothetical stories.'], ['If We Had Known…', 'I can use the third conditional.'], ['Story: The Island of Second Chances', 'I can read a story and discuss other endings.'], ['Extra Practice: Wish Games', 'I can use wishes and conditionals in games.'], ['Boss Test: Island Hero', 'I can show what I learned.']),
  },
  {
    level: 'B2', unit: 8, world: 'Museum of Myths', goal: 'describe in detail and add extra information',
    grammar: ['non-defining relative clauses', 'participle clauses (Hidden in the cave, the dragon…)', 'emphasis: It was… that…'],
    vocabulary: ['myths and legends: creature, hero, quest, legend, ancient'],
    literacy: 'synonyms and register (big → enormous)', writing: 'a legend in my own words (150 words)', speakingTask: 'guide visitors round the myths museum',
    lessons: L(['Creatures of Legend', 'I can describe mythical creatures in detail.'], ['The Dragon, Which Lived…', 'I can add information with non-defining clauses.'], ['Listen: The Storyteller', 'I can follow a traditional story told aloud.'], ['Museum Guide', 'I can present information clearly and vividly.'], ['Story: The Phoenix Feather', 'I can read a legend and analyse its message.'], ['Extra Practice: Myth Games', 'I can use complex sentences in games.'], ['Boss Test: Legend Keeper', 'I can show what I learned.']),
  },
  {
    level: 'B2', unit: 9, world: 'Digital World', goal: 'talk about technology and staying safe online',
    grammar: ['gerunds and infinitives (remember to / remember -ing, stop to / stop -ing)', 'phrasal verbs for technology (log in, set up, back up)', 'need -ing / need to'],
    vocabulary: ['technology and online safety: password, privacy, screen time, kindness online'],
    literacy: 'compound nouns and phrasal verbs', writing: 'an online safety guide for younger children (140 words)', speakingTask: 'give advice to a younger student about the internet',
    lessons: L(['Our Digital Lives', 'I can talk about how I use technology.'], ['Remember to Log Out!', 'I can use verb + -ing and verb + to correctly.'], ['Listen: The Tech Help Desk', 'I can follow instructions and advice.'], ['Stay Safe, Be Kind', 'I can give advice about being safe and kind online.'], ['Story: The Game That Wouldn\'t Stop', 'I can read a story and discuss its lesson.'], ['Extra Practice: Tech Quests', 'I can use verb patterns in games.'], ['Boss Test: Digital Hero', 'I can show what I learned.']),
  },
  {
    level: 'B2', unit: 10, world: 'The Grand Festival', goal: 'plan and present a project using the whole level',
    grammar: ['review of B2 tenses, modals and conditionals', 'presentation language', 'summarising'],
    vocabulary: ['events, planning, teamwork'],
    literacy: 'review of word formation for the Final Test', writing: 'a festival article or report (150 words)', speakingTask: 'present the festival plan as a team leader',
    lessons: L(['Planning the Festival', 'I can plan an event and assign roles.'], ['What Went Well, What Could Be Better', 'I can evaluate and suggest improvements.'], ['Listen: The Festival Radio', 'I can understand announcements and interviews.'], ['My Festival Presentation', 'I can give a short structured presentation.'], ['Story: The Festival Under the Stars', 'I can read a long chapter and summarise it.'], ['Extra Practice: Festival Challenges', 'I can use the whole B2 level in games.'], ['B2 Final Test: Festival Star', 'I can show what I learned at B2.']),
  },
];

export const PLAYGROUND_CURRICULUM: Record<PlaygroundLevel, CurriculumUnit[]> = {
  'Pre-A1': PRE_A1, A1, A2, B1, B2,
};
