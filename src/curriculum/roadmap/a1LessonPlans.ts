// A1 Playground lesson plans — one plan per database slot (10 units × 7 lessons).
//
// Source of truth for every A1 lesson's objective, language, game, evidence and home mission (owner 2026-10-12:
// "update the curriculum… and also the lesson plans"). Built from the unit buckets in ./a1Roadmap.ts and the
// themed-worlds plan in docs/a1-playground-roadmap.md. The `curriculum_lessons` rows (description +
// ai_metadata.blueprint_ref + grammar_pattern + vocabulary_list + phonics_focus) are synced from this file
// with scripts/a1-lesson-plans-sql.mjs; a1LessonPlans.test.ts keeps it consistent with the buckets.
//
// Unit arc (same in every unit): L1-L2 new language · L3 listening lesson around the unit song · L4 speaking (the
// child is the expert) · L5 story GIFs (no story videos in A1, owner 2026-10-13) · L6 extra-practice games · L7 Boss Test. Every lesson follows the 22-page
// Playground lesson blueprint (docs/playground-lesson-blueprint.md, §3g for A1).

export type A1LessonType = 'core' | 'storybook' | 'extra_practice' | 'unit_review';
export type A1SkillFocus = 'Grammar' | 'Vocabulary' | 'Reading/Listening' | 'Speaking' | 'Review';

export interface A1LessonPlan {
  unit: number;
  lesson: number;
  title: string;               // = curriculum_lessons.title
  lessonType: A1LessonType;
  skillFocus: A1SkillFocus;
  objective: string;           // "I can …" (shown to the teacher, the child and the parent)
  grammarFocus: string[];      // new or practised structures
  newVocabulary: string[];     // words new in this lesson (3-6 for L1/L2)
  reviewTargets: string[];     // recycled language
  phonicsFocus: string[];
  communicationGoal: string;   // the real-life use
  signatureGame: string;       // ★ new game · ⇄ Pre-A1 game as kind 'prea1' · (A1) built A1 game
  evidence: string;            // what proves the objective
  funHook: string;             // the choice / surprise / "child is the expert" moment (roadmap §4b)
  homeMission: string;
  built?: boolean;             // the lesson is already built (plan describes what shipped)
}

const TYPE: Record<number, [A1LessonType, A1SkillFocus]> = {
  1: ['core', 'Grammar'], 2: ['core', 'Vocabulary'], 3: ['core', 'Reading/Listening'], 4: ['core', 'Speaking'],
  5: ['storybook', 'Reading/Listening'], 6: ['extra_practice', 'Review'], 7: ['unit_review', 'Review'],
};

type PlanInput = Omit<A1LessonPlan, 'unit' | 'lesson' | 'title' | 'lessonType' | 'skillFocus'>;
const p = (unit: number, lesson: number, title: string, rest: PlanInput): A1LessonPlan => ({
  unit, lesson, title, lessonType: TYPE[lesson][0], skillFocus: TYPE[lesson][1], ...rest,
});

export const A1_LESSON_PLANS: A1LessonPlan[] = [
  // ── Unit 1 · Welcome Town — re-planned 2026-10-12 (docs/a1-unit-1-welcome-town.md, waiting for approval; the built
  //    lessons are rebuilt from these plans). Reading strand: the story "Leo's First Day", read a bit more each lesson.
  p(1, 1, 'Hello, My Name Is...', {
    objective: 'I can say hello and goodbye, say my name and ask "What\'s your name?" — and read the first pages of Leo\'s story.',
    grammarFocus: ['My name is…', 'What\'s your name?'], newVocabulary: ['hello', 'hi', 'goodbye', 'name'],
    reviewTargets: [], phonicsFocus: ['h: hi, hop, hat → "Hi! I am Pip."', 'sight words: I, my, name, is', 'twister: Happy Hen hops.'],
    communicationGoal: 'Greet someone new, say my name and ask theirs.',
    signatureGame: 'Welcome Party (A1): say the line to open the door', evidence: 'The child greets two arriving friends and asks their names in full sentences; reads story pages 1-3 aloud.',
    funHook: 'Doors open on surprise guests; the child chooses who to greet first.', homeMission: 'Say hello and your name to two people at home and read them pages 1-3.',
  }),
  p(1, 2, 'Saying \'How Are You?\'', {
    objective: 'I can ask "How are you?", say how I feel and say how a friend feels: "I am tired. She is happy."',
    grammarFocus: ['How are you? I am…', 'He is / She is…'], newVocabulary: ['fine', 'happy', 'sad', 'tired', 'hungry'],
    reviewTargets: ['My name is…', 'hello / goodbye'], phonicsFocus: ['short a: sad, mad, had → "Leo is sad."', 'sight words: how, are, you, am', 'twister: Sad Sam sits.'],
    communicationGoal: 'Ask friends how they are and tell someone how a friend feels.',
    signatureGame: 'Feelings Survey (A1): ask 4 friends, report one', evidence: 'The child asks 4 friends "How are you?" and reports one ("She is tired."); reads pages 4-5.',
    funHook: 'Situations make the feeling ("I have no lunch!" → hungry); a claw grabs the friend who is tired.', homeMission: 'Ask three people "How are you?" and draw their faces.',
  }),
  p(1, 3, 'How Old Are You? Numbers 1-20', {
    // Owner 2026-10-12: "add numbers from 1 to 20 … as far as the students say their age … start with modeling, then
    // memorising the numbers, then the practice in which they practise how old they are."
    objective: 'I can count and say the numbers 1-20, ask "How old are you?" and say my age: "I am seven."',
    grammarFocus: ['How old are you? I am…', 'He / She is + number'], newVocabulary: ['eleven … twenty', 'How old are you?', 'birthday'],
    reviewTargets: ['numbers 1-10', 'He is / She is…', 'What\'s your name?'], phonicsFocus: ['number words: six, ten → "Bella is six." / "I am ten."', 'twister: Six silly snakes.'],
    communicationGoal: 'Ask and tell age, the second personal question after the name (Cambridge Starters Speaking Part 4).',
    signatureGame: 'Birthday Balloons + Number Stepping Stones (model → memorise → age practice)', evidence: 'The child says 1-20 in order and 5 random numbers, answers "How old are you?" in a full sentence and asks two friends.',
    funHook: 'Birthday buzzer: guess each friend\'s age; the child interviews Pip.', homeMission: 'Ask three family members "How old are you?" and count to 20 with them.',
  }),
  p(1, 4, 'This Is My Friend!', {
    objective: 'I can introduce a friend — "This is my friend Leo." — answer "Nice to meet you!" and hold a 6-line conversation.',
    grammarFocus: ['This is my friend…', 'Nice to meet you (too)'], newVocabulary: ['friend', 'nice to meet you', 'come in'],
    reviewTargets: ['How are you?', 'He is / She is…', 'My name is…'], phonicsFocus: ['f / short u: fun, run, sun → "Come on! It is fun!"', 'sight words: this, friend, nice, meet', 'twister: Fun Fred finds a frog.'],
    communicationGoal: 'Introduce a friend to someone new and have a short conversation.',
    signatureGame: 'Guess My Friend (secret-card): ask, find, introduce; Welcome Song', evidence: 'The child introduces two friends and holds a 6-line conversation with the teacher; reads pages 6-8.',
    funHook: 'The child is the expert: Pip introduces the wrong friend and the child corrects him; Willow\'s red hat surprise.', homeMission: 'Introduce a family member to a toy: "This is my mum."',
  }),
  p(1, 5, 'Storybook: Leo\'s First Day', {
    objective: 'I can read the story "Leo\'s First Day" with help, answer questions about it and act it out.',
    grammarFocus: ['all Unit 1 lines in the story'], newVocabulary: [], reviewTargets: ['hello', 'friend', 'feelings', 'cap, cat, red'],
    phonicsFocus: ['blend a whole sentence: The cap is on the cat.', 'sight words: the, look, now, see'],
    communicationGoal: 'Read and understand a short story about meeting friends.',
    signatureGame: 'Story GIFs (Canva, scenario first) + Reader: the whole book', evidence: 'The child reads 4 pages alone, answers 4 yes/no questions and acts out pages 2-4 as Pip.',
    funHook: 'Where is the cap? The child predicts, and it is on the cat!', homeMission: 'Read the book to your family.',
  }),
  p(1, 6, 'Extra Practice: Game Day!', {
    objective: 'I can use all the Unit 1 language quickly and correctly, and read its sentences fast.',
    grammarFocus: ['My name is…', 'How are you?', 'This is my friend…'], newVocabulary: [], reviewTargets: ['all Unit 1'],
    phonicsFocus: ['sight-word speed reading', 'Twister Race: all four Unit 1 twisters'],
    communicationGoal: 'Greet, ask and introduce without thinking; read the unit sentences fast.',
    signatureGame: 'Word Board race (read the square, answer the question)', evidence: 'Accuracy on the board race (not speed) and the Read & Do sentences.',
    funHook: 'Board race with ladders and slides; a puppet friend arrives for a free chat.', homeMission: 'Play the greeting game with a family member.',
  }),
  p(1, 7, 'Unit Review & Boss Test: Say Hello!', {
    objective: 'I can hold a 6-line conversation (greet, name, how are you, introduce a friend, goodbye) and read the Unit 1 story sentences.',
    grammarFocus: ['all Unit 1'], newVocabulary: [], reviewTargets: ['all Unit 1'], phonicsFocus: ['Unit 1 sounds', 'read a story page aloud'],
    communicationGoal: 'Meet someone new and talk for a minute; read a short story page.',
    signatureGame: 'Boss Test (listening, reading yes/no, story gaps, speaking, reading aloud)', evidence: 'Boss Test, 80 % in every part.',
    funHook: 'Racing warm-up; teaser: a jungle sound and a monkey tail at the end (the Golden Compass story starts in Unit 2).', homeMission: 'Show your medal and introduce yourself.',
  }),

  // ── Unit 2 · Jungle ───────────────────────────────────────────────────────────────────────────────
  p(2, 1, 'Jungle Animals', {
    built: true,
    objective: 'I can name 8 jungle animals and say what they look like: "It\'s an elephant. It\'s big and grey."',
    grammarFocus: ['It\'s a / an…', 'It\'s big / small / long + colour'], newVocabulary: ['elephant', 'snake', 'crocodile', 'monkey', 'frog', 'big', 'small', 'long'],
    reviewTargets: ['lion', 'bird', 'fish', 'colours', 'This is my friend…'],
    phonicsFocus: ['short i (insect, ink, igloo → big, pig, zip)', 'twister: Six big pigs sit still.'],
    communicationGoal: 'Name the animals I see and say what they look like.',
    signatureGame: '★ Safari Snap (listen to the looks, take the photo)', evidence: 'Safari Snap: the child photographs the animal described and says two sentences about it; reads story pages 1-3.',
    funHook: 'The last photo rounds give only the looks ("It\'s small and blue!").', homeMission: 'Draw a jungle animal and say two sentences about it.',
  }),
  p(2, 2, 'What Can Animals Do?', {
    objective: 'I can say what a jungle animal can and can\'t do: "A monkey can climb. It can\'t fly."',
    grammarFocus: ['It can + verb', 'It can\'t + verb'], newVocabulary: ['climb', 'swing', 'can\'t'],
    reviewTargets: ['lion', 'monkey', 'bird', 'fish', 'run', 'jump', 'swim', 'fly', 'big / small / long'], phonicsFocus: ['ch (chips, chick, cheese, chair → chip, chick, lunch)', 'twister: Chip the chimp chews chips.'],
    communicationGoal: 'Say what an animal can and can\'t do.',
    signatureGame: '★ Jungle Obstacle Run', evidence: 'The child passes each obstacle by naming the action, then says one can and one can\'t sentence about an animal.',
    funHook: 'A wrong friend tries the obstacle and says "I can\'t climb!"; the child picks who goes next.',
    homeMission: 'Mime an animal for your family and say what it can and can\'t do.',
  }),
  p(2, 3, 'Can It…?', {
    built: true,
    objective: 'I can ask "Can it…?" and answer "Yes, it can. / No, it can\'t." — about the elephant, the snake, the crocodile and friends.',
    grammarFocus: ['Can it…? Yes, it can. / No, it can\'t.', 'Can you…? Yes, I can. / No, I can\'t.'], newVocabulary: ['Can it…?', 'Yes, it can', 'No, it can\'t'],
    reviewTargets: ['all Unit 2 animals', 'It can / can\'t…', 'big / small / long'], phonicsFocus: ['ck at the end (duck, clock, socks, chick → duck, rock, chick)', 'twister: A duck on a rock eats a snack.'],
    communicationGoal: 'Ask about an animal and answer questions about it.',
    signatureGame: 'Can It? + Who Can? buzzer + Flip & Ask (the child asks)', evidence: 'Who Can? buzzer 4 of 5; the child asks the teacher 2 questions (Flip & Ask, interview with Coco); reads pages 5-7.',
    funHook: 'The animal really tries — and flops when it can\'t.', homeMission: 'Ask a grown-up three "Can it…?" questions and sing "Ask Them!".',
  }),
  p(2, 4, 'Talk About Animals!', {
    built: true,
    objective: 'I can describe an animal in 4 sentences — "It\'s a crocodile. It\'s big and green. It can swim. It can\'t fly." — and ask "Can it…?".',
    grammarFocus: ['It\'s big / small / long + colour', 'It\'s got a long tail / nose', 'It can / can\'t…', 'Can it…?'], newVocabulary: ['tail', 'nose', 'It\'s got'],
    reviewTargets: ['all Unit 2 animals and actions'], phonicsFocus: ['sh (ship, shell, sheep, shoe → fish, ship, shell)', 'twister: Shy fish swish and splash.'],
    communicationGoal: 'Describe an animal so someone can guess it.',
    signatureGame: '★ Animal Riddle + ★ Field Guide (the child builds and reads a 4-sentence card)', evidence: 'The Field Guide cards read aloud; a 4-clue riddle + one question; reads pages 7-9.',
    funHook: 'The child is the expert: Coco says wrong things and the child corrects her.', homeMission: 'Give your family an animal riddle with four clues.',
  }),
  p(2, 5, 'Storybook: The Jungle Rescue', {
    built: true,
    objective: 'I can read "The Jungle Rescue" with help and say who can help Kip and why: "The elephant. It is big. It can walk in the river."',
    grammarFocus: ['It can / can\'t…', 'Can it…?', 'It\'s big / small'], newVocabulary: ['help', 'river', 'rock'], reviewTargets: ['all Unit 2'],
    phonicsFocus: ['review i, ch, sh (Sound Pick)', 'twister: Big Kip sits on a big rock.'], communicationGoal: 'Read a short story about animals helping and retell it.',
    signatureGame: 'Story GIFs (Canva, scenario first) + Reader: the whole book with a "Who can help?" pause + Rescue Map', evidence: 'The child chooses at the pause and retells why (6-line retell); reads the book with help.',
    funHook: 'The child chooses who helps Kip — and acts out the elephant.', homeMission: 'Read the book to your family and ask "Who can help Kip?".',
  }),
  p(2, 6, 'Extra Practice: Jungle Game Day!', {
    built: true,
    objective: 'I can use all the Unit 2 language quickly — animals, looks, can / can\'t, "Can it…?" — and read its sentences fast.',
    grammarFocus: ['It can / can\'t…', 'Can it…?', 'It\'s got…'], newVocabulary: [], reviewTargets: ['all Unit 2'],
    phonicsFocus: ['Twister Race: the four Unit 2 twisters', 'Blend & Read: big, chick, fish'], communicationGoal: 'Talk about animals without thinking.',
    signatureGame: '★ River Crossing + Charades ⇄ + Tile Reveal', evidence: 'Accuracy in the games (not speed) and the free chat with Kip.',
    funHook: 'Cross the river to the golden banana; the child acts, the teacher guesses.', homeMission: 'Play animal charades at home.',
  }),
  p(2, 7, 'Unit Review & Boss Test: Jungle Explorer!', {
    built: true,
    objective: 'I can show everything from Unit 2: describe two animals, ask "Can it…?", understand descriptions and read the story.',
    grammarFocus: ['all Unit 2'], newVocabulary: [], reviewTargets: ['all Unit 2'], phonicsFocus: ['i, ch, ck, sh', 'read a story page aloud'],
    communicationGoal: 'Talk about animals with a friend; read a short story page.',
    signatureGame: 'Boss Test (listening, reading yes/no, story gaps, speaking, reading aloud)', evidence: 'Boss Test, 80 % in every part.',
    funHook: 'Raft Race warm-up; Golden Compass piece 1 at the end; teaser: next stop, space!', homeMission: 'Show your trophy and describe two animals.',
  }),

  // ── Unit 3 · Space ────────────────────────────────────────────────────────────────────────────────
  p(3, 1, 'Count to 100 in Space!', {
    built: true,
    objective: 'I can count in tens to 100 and say how many: "There are forty stars."',
    grammarFocus: ['How many…? There are…'], newVocabulary: ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'one hundred', 'star', 'moon', 'rocket', 'planet', 'robot'],
    reviewTargets: ['numbers 1-20'], phonicsFocus: ['th (three, thumb, thin, bath)', 'Blend & Read: thin, bath, thick', 'twister: Three thin stars think.'],
    communicationGoal: 'Count big groups and say how many.',
    signatureGame: 'Count & Catch (tens) + Space Bingo + Number Rockets', evidence: 'The child counts 3 groups in tens and answers "How many?" in a sentence.',
    funHook: 'Captain Nova\'s station: star balloons worth ten each.', homeMission: 'Count things at home in tens (pasta, coins).',
  }),
  p(3, 2, 'Left, Right, Up, Down: Space Directions', {
    built: true,
    objective: 'I can follow and give directions: "Go left. Go up. The moon is above the rocket."',
    grammarFocus: ['Go left / right / up / down', 'above / below', 'on the left / right'], newVocabulary: ['left', 'right', 'up', 'down', 'above', 'below', 'lost'],
    reviewTargets: ['There are…'], phonicsFocus: ['-ing (ring, wing, swing) — ng on its own is not recorded yet', 'Blend & Read: ring, wing, swing', 'twister: The king\'s ring goes ding.'],
    communicationGoal: 'Guide someone with directions.',
    signatureGame: '★ Rocket Maze', evidence: 'The child steers the rocket and then gives the teacher 2-step directions.',
    funHook: 'The child becomes mission control and steers the teacher.', homeMission: 'Guide a family member to a hidden toy: left, right, up, down.',
  }),
  p(3, 3, 'The Counting Rocket Song', {
    built: true,
    objective: 'I can understand numbers and positions when I hear them, and ask "How many…?" and "Where is…?"',
    grammarFocus: ['How many…? There are…', 'Where is…? It\'s above / below / on the left…'], newVocabulary: [], reviewTargets: ['tens to 100', 'directions'],
    phonicsFocus: ['short u (sun, nut, run)', 'Blend & Read: up, sun, run', 'twister: Run up, little pup, run up!'], communicationGoal: 'Understand numbers and positions; ask two questions.',
    signatureGame: 'Listen & Colour (Cambridge format) + the Counting Rocket song', evidence: 'Listen & Colour 4 of 5; the child asks the teacher 2 questions.',
    funHook: 'Musical Pads and the Space Radio mix-ups.', homeMission: 'Sing the countdown song; ask "How many…?" at home.',
  }),
  p(3, 4, 'What\'s the Weather on the Planets?', {
    built: true,
    objective: 'I can say what the weather is like: "It\'s cold and snowy on Planet Ice."',
    grammarFocus: ['What\'s the weather like?', 'It\'s hot / cold / sunny / windy / cloudy / rainy / snowy'], newVocabulary: ['weather', 'hot', 'cold', 'sunny', 'windy', 'cloudy', 'rainy', 'snowy', 'scarf', 'sunglasses', 'umbrella'],
    reviewTargets: ['There are…', 'above / below'], phonicsFocus: ['short o (octopus, pot, mop)', 'Blend & Read: hot, pot, mop', 'twister: A hot pot on a hot top.'],
    communicationGoal: 'Talk about the weather.',
    signatureGame: '★ Planet Weather Report', evidence: 'The child gives a 3-sentence weather report for one planet.',
    funHook: 'The child is the TV weather reporter and packs the astronaut\'s bag.', homeMission: 'Tell your family today\'s weather.',
  }),
  p(3, 5, 'Storybook: The Lost Robot', {
    built: true,
    objective: 'I can read "The Lost Robot" with help and say where Beep was and what the weather was like.',
    grammarFocus: ['directions', 'weather', 'There are…'], newVocabulary: ['finds', 'tracks'], reviewTargets: ['all Unit 3'],
    phonicsFocus: ['review th, -ing, u, o (Sound Pick)'], communicationGoal: 'Read and retell a space story.',
    signatureGame: 'Story GIFs (Canva, scenario first, after the owner\'s OK) + Reader with a pause (the child gives the directions) + Treasure Radar', evidence: 'Reads 4 pages alone; retells where Beep was and the weather.',
    funHook: 'The child gives the directions that bring the robot home.', homeMission: 'Read the story to your family.',
  }),
  p(3, 6, 'Extra Practice: Space Game Day', {
    built: true,
    objective: 'I can use numbers, directions and weather words quickly.',
    grammarFocus: ['all Unit 3'], newVocabulary: [], reviewTargets: ['all Unit 3'], phonicsFocus: ['Twister Race: the four Unit 3 twisters'],
    communicationGoal: 'Use the space words without thinking.',
    signatureGame: 'River Crossing + Star Map + Rapid Recall + Save the Astronaut', evidence: 'Accuracy in the games (not speed).',
    funHook: 'The Space Games: six games, one champion.', homeMission: 'Play the robot direction game at home.',
  }),
  p(3, 7, 'Unit Review & Boss Test: Space Navigator!', {
    built: true,
    objective: 'I can count in tens, give directions and give a weather report.',
    grammarFocus: ['all Unit 3'], newVocabulary: [], reviewTargets: ['all Unit 3'], phonicsFocus: ['th, -ing, u (word blocks)', 'read a story page aloud'],
    communicationGoal: 'Navigate a space mission in English.',
    signatureGame: 'Boss Test (listening, reading yes/no, story gaps, speaking: count + steer + weather report, reading aloud)', evidence: 'Boss Test, 80 % in every part.',
    funHook: 'Rocket Race warm-up; Golden Compass piece 2 + teaser: festival music and a smell of pizza.', homeMission: 'Show your medal and count to 100 in tens.',
  }),

  // ── Unit 4 · Food Festival ────────────────────────────────────────────────────────────────────────
  p(4, 1, 'Yummy Foods at the Festival', {
    built: true,
    objective: 'I can name festival foods and say what I have for my meals: "I have soup for lunch."',
    grammarFocus: ['I have … for breakfast / lunch / dinner'], newVocabulary: ['rice', 'soup', 'salad', 'sandwich', 'chips', 'pasta', 'cheese', 'grapes', 'breakfast', 'lunch', 'dinner'],
    reviewTargets: ['Pre-A1 food words', 'Can I have…, please?'], phonicsFocus: ['gr / br (grapes, grandma, bread)', 'Blend & Read: grab, grin, brick', 'twister: Green grapes, great grapes, grab a grape!'],
    communicationGoal: 'Talk about my meals.',
    signatureGame: 'Market Sort (sentences into breakfast / lunch / dinner) + Feed Pip', evidence: 'The child sorts 6 meal sentences and says 2 meal sentences about themselves.',
    funHook: 'Arriving at the Food Festival with Chef Cilla.', homeMission: 'Say what you have for each meal.',
  }),
  p(4, 2, 'I Like Cooking!', {
    built: true,
    objective: 'I can say what I like and don\'t like doing: "I like cooking. I don\'t like washing up."',
    grammarFocus: ['I like / don\'t like + -ing'], newVocabulary: ['cooking', 'eating', 'baking', 'washing up'],
    reviewTargets: ['I like / don\'t like + food'], phonicsFocus: ['pl (plum, plate, plane)', 'Blend & Read: plum, plan, clap', 'twister: Plum on a plate, please!'],
    communicationGoal: 'Say what I enjoy doing.',
    signatureGame: 'Like Chart (A1: doing words) + Kitchen Charades', evidence: 'The child says 3 like / don\'t like sentences, one with -ing.',
    funHook: 'Red Light, Green Light kitchen jobs.', homeMission: 'Help in the kitchen and say what you like doing.',
  }),
  p(4, 3, 'Listen: Do You Like…?', {
    built: true,
    objective: 'I can understand "Do you like…?" and answer "Yes, I do / No, I don\'t", and say who likes what.',
    grammarFocus: ['Do you like…? Yes, I do / No, I don\'t'], newVocabulary: [], reviewTargets: ['festival foods', 'like + -ing'],
    phonicsFocus: ['sn (snake, snow, snack)', 'Blend & Read: snack, sniff, swim', 'twister: Snails snack on snacks.'], communicationGoal: 'Understand what people like; answer about myself.',
    signatureGame: 'Tick or Cross (who likes what) + the "Do You Like…?" song', evidence: '4 of 5 correct ticks; answers 3 questions about themselves.',
    funHook: 'Hot Plate and Pico\'s Glider.', homeMission: 'Sing the song and ask "Do you like…?" at home.',
  }),
  p(4, 4, 'I Like / I Don\'t Like!', {
    built: true,
    objective: 'I can interview a friend and offer food: "Do you like soup?" "Would you like some grapes?" "Let\'s make a pizza!"',
    grammarFocus: ['Do you like…?', 'Would you like some…? Yes, please / No, thank you', 'Let\'s…!', 'He / She likes…'], newVocabulary: ['some', 'please', 'thank you', 'let\'s'],
    reviewTargets: ['I like / don\'t like'], phonicsFocus: ['fr (frog, friend, fruit)', 'Blend & Read: frog, flag, drum', 'twister: Fred fries fresh fish.'],
    communicationGoal: 'Ask a friend about food and offer something.',
    signatureGame: '★ Food Survey + Build a Pizza', evidence: 'The child asks 3 friends, fills the chart, reports 2 sentences and makes one offer.',
    funHook: 'The child is the festival reporter with a clipboard.', homeMission: 'Ask your family "Do you like…?" and fill the chart.',
  }),
  p(4, 5, 'Storybook: Chef Cilla\'s Recipe', {
    built: true,
    objective: 'I can read "Chef Cilla\'s Recipe" with help and say what Pico likes and what the friends offer him.',
    grammarFocus: ['Would you like…?', 'some', 'Let\'s…'], newVocabulary: ['crumbs'], reviewTargets: ['all Unit 4'],
    phonicsFocus: ['review gr, pl, sn, fr (Sound Pick)'], communicationGoal: 'Read and retell a story about cooking together.',
    signatureGame: 'Story GIFs (Canva, scenario first, after the owner\'s OK) + Reader with a pause (the child offers Pico food)', evidence: 'Reads 4 pages alone; retells what Pico liked and was offered.',
    funHook: 'The child chooses what to offer Pico.', homeMission: 'Read the story to your family.',
  }),
  p(4, 6, 'Extra Practice: Festival Café', {
    built: true,
    objective: 'I can order and offer food quickly and politely.',
    grammarFocus: ['all Unit 4'], newVocabulary: [], reviewTargets: ['all Unit 4'], phonicsFocus: ['Twister Race: the four Unit 4 twisters'],
    communicationGoal: 'Order food in a café.',
    signatureGame: '★ Festival Café + Cookie Faces', evidence: 'The child serves 5 orders correctly and says the offers.',
    funHook: 'Customers order with funny twists.', homeMission: 'Play café at home.',
  }),
  p(4, 7, 'Unit Review & Boss Test: Festival Feast!', {
    built: true,
    objective: 'I can say what I like, ask a friend and offer food.',
    grammarFocus: ['all Unit 4'], newVocabulary: [], reviewTargets: ['all Unit 4'], phonicsFocus: ['gr, pl, sn, fr (word blocks)', 'read a story page aloud'],
    communicationGoal: 'Plan a feast with a friend.',
    signatureGame: 'Boss Test (listening, reading yes/no, story gaps, speaking: order + offer + answer, reading aloud)', evidence: 'Boss Test, 80 % in every part.',
    funHook: 'Food Race warm-up; Golden Compass piece 3 + teaser: a friendly monster roar.', homeMission: 'Show your medal and offer someone a snack in English.',
  }),

  // ── Unit 5 · Monster Town ─────────────────────────────────────────────────────────────────────────
  p(5, 1, 'How Do You Feel? Scared, Bored, Excited!', {
    objective: 'I can say how someone feels and why: "He\'s scared because it\'s dark."',
    grammarFocus: ['He\'s / She\'s + feeling', 'because… (chunk)'], newVocabulary: ['scared', 'excited', 'bored', 'surprised', 'because'],
    reviewTargets: ['happy', 'sad', 'tired', 'How are you?'], phonicsFocus: ['ee (green, feet, sleep)'],
    communicationGoal: 'Say how someone feels and why.',
    signatureGame: 'Feelings Wheel ⇄ (new feelings + because)', evidence: 'The child says 3 feeling sentences, 2 with because.',
    funHook: 'Monsters change faces when the child names the feeling.', homeMission: 'Tell your family how you feel today and why.',
  }),
  p(5, 2, 'What Do They Look Like? Tall, Short, Big, Small', {
    objective: 'I can describe looks and family: "She\'s got long hair. She\'s got a little brother."',
    grammarFocus: ['He\'s / She\'s got…', 'He\'s / She\'s tall / short'], newVocabulary: ['teeth', 'horn', 'tall', 'brother', 'sister'],
    reviewTargets: ['big', 'small', 'long', 'short', 'eyes', 'hair'], phonicsFocus: ['ea (eat, tea, scream)'],
    communicationGoal: 'Describe what someone looks like and who is in their family.',
    signatureGame: 'Face Builder ⇄ (build what you hear)', evidence: 'The child builds 3 monster faces from listening and describes one.',
    funHook: 'Silly monster families with three eyes and long horns.', homeMission: 'Describe a family member in 2 sentences.',
  }),
  p(5, 3, 'Listen to the Feelings Song', {
    objective: 'I can understand feelings and descriptions in a song.',
    grammarFocus: ['Who is…?', 'He\'s / She\'s…'], newVocabulary: [], reviewTargets: ['feelings', 'has got'],
    phonicsFocus: [], communicationGoal: 'Understand descriptions of people.',
    signatureGame: 'Listen & Tap (A1, "Name That Feeling")', evidence: '4 of 5 correct taps.',
    funHook: 'Make the face of each feeling while you sing.', homeMission: 'Sing the feelings song with faces.',
  }),
  p(5, 4, 'Describe a Monster Friend!', {
    objective: 'I can describe a monster in 4 sentences: "He\'s got three eyes. He\'s wearing a big hat. He\'s happy because…"',
    grammarFocus: ['He\'s / She\'s wearing…', 'has got', 'feeling + because'], newVocabulary: ['wear', 'wearing', 'scarf', 'glasses', 'boots'],
    reviewTargets: ['clothes from Pre-A1', 'feelings'], phonicsFocus: ['ee / ea review'],
    communicationGoal: 'Describe a person or character so someone can draw it.',
    signatureGame: 'Monster Maker ⇄ (the child describes, the teacher builds; then swap)', evidence: 'A 4-sentence description the teacher can build.',
    funHook: 'The child is the expert: the teacher builds it wrong on purpose and the child corrects it.', homeMission: 'Draw a monster and describe it in 4 sentences.',
  }),
  p(5, 5, 'Storybook: Bibi\'s Bad Day', {
    objective: 'I can follow a story and say how Bibi feels and why.',
    grammarFocus: ['feeling + because', 'wearing'], newVocabulary: [], reviewTargets: ['all Unit 5'],
    phonicsFocus: [], communicationGoal: 'Understand feelings in a story.',
    signatureGame: 'Story GIFs (Canva, scenario first) + Reader with pause questions', evidence: 'Pause questions + retell 3 pictures.',
    funHook: 'The child chooses how to cheer Bibi up.', homeMission: 'Tell the story and say how Bibi felt.',
  }),
  p(5, 6, 'Extra Practice: Feelings Charades!', {
    objective: 'I can ask and answer about looks, clothes and feelings quickly.',
    grammarFocus: ['Has he got…?', 'Is he wearing…?'], newVocabulary: [], reviewTargets: ['all Unit 5'], phonicsFocus: [],
    communicationGoal: 'Find a person by asking questions.',
    signatureGame: 'Charades ⇄ + ★ Guess Who', evidence: 'The child finds the hidden monster with 4 questions or fewer.',
    funHook: 'Mystery monster behind the curtain.', homeMission: 'Play Guess Who with family photos.',
  }),
  p(5, 7, 'Unit Review & Boss Test: Monster Portrait!', {
    objective: 'I can describe a monster in 4 sentences and ask 2 questions about another.',
    grammarFocus: ['all Unit 5'], newVocabulary: [], reviewTargets: ['all Units 1-5'], phonicsFocus: ['ee, ea'],
    communicationGoal: 'Describe people and characters.',
    signatureGame: 'Boss Test + A1 Halfway Check', evidence: 'Boss Test, 80 % in every part; Halfway Check report to parents.',
    funHook: 'Golden Compass piece 4 + teaser: waves and a whale song.', homeMission: 'Show your medal and describe a friend.',
  }),

  // ── Unit 6 · Ocean ────────────────────────────────────────────────────────────────────────────────
  p(6, 1, 'Meet the Sea Animals: Shark, Whale', {
    objective: 'I can name sea animals: "It\'s a whale. It\'s a turtle."',
    grammarFocus: ['It\'s a…', 'They\'re…'], newVocabulary: ['shark', 'whale', 'turtle', 'starfish', 'shell'],
    reviewTargets: ['fish', 'big / small', 'It\'s got…'], phonicsFocus: ['sh (shark, shell, fish)'],
    communicationGoal: 'Name the sea animals I see.',
    signatureGame: 'Shape/Sound Fishing ⇄ (fish for the animal you hear)', evidence: 'The child catches and names 5 animals.',
    funHook: 'The child chooses where to dive.', homeMission: 'Find a sea animal in a book or on TV and name it.',
  }),
  p(6, 2, 'More Sea Animals: Octopus, Crab', {
    objective: 'I can say what a sea animal is doing: "The octopus is hiding. The crab is walking."',
    grammarFocus: ['What\'s it doing? It\'s + -ing'], newVocabulary: ['octopus', 'crab', 'hiding', 'diving'],
    reviewTargets: ['swim', 'eat', 'jump', 'He\'s wearing… (-ing)'], phonicsFocus: ['wh (whale, white, wheel)'],
    communicationGoal: 'Say what someone is doing right now.',
    signatureGame: '★ Live Reef', evidence: 'The child lights up 5 animals by saying what each one is doing.',
    funHook: 'The reef moves; animals peek out when the child says the action.', homeMission: 'Say what 3 people at home are doing now.',
  }),
  p(6, 3, 'Listen: Where Do They Live?', {
    objective: 'I can understand where animals live and what they eat: "It lives in the sea. It eats fish."',
    grammarFocus: ['It lives in / on…', 'It eats…'], newVocabulary: ['live', 'beach', 'reef'], reviewTargets: ['sea animals', '-ing'],
    phonicsFocus: [], communicationGoal: 'Understand facts about animals.',
    signatureGame: 'Sort Basket ⇄ (sea / beach / reef)', evidence: '4 of 5 correct from listening.',
    funHook: 'Animals swim home when sorted right.', homeMission: 'Sing the ocean song.',
  }),
  p(6, 4, 'Ask and Answer: Is It a Shark?', {
    objective: 'I can find a hidden animal by asking: "Is it a crab? Is it swimming?" "Yes, it is / No, it isn\'t."',
    grammarFocus: ['Is it a…?', 'Is it + -ing?', 'Yes, it is / No, it isn\'t'], newVocabulary: [],
    reviewTargets: ['all sea animals', 'It lives…'], phonicsFocus: ['sh / wh review'],
    communicationGoal: 'Ask yes/no questions to find something out.',
    signatureGame: 'Secret Card ⇄ (the child asks)', evidence: 'The child finds the secret animal with 3 or 4 questions.',
    funHook: 'The child hides an animal and the teacher must ask.', homeMission: 'Play "Is it a…?" with a hidden toy.',
  }),
  p(6, 5, 'Storybook: The Treasure Reef', {
    objective: 'I can follow a story and say what the animals are doing and what the weather is like.',
    grammarFocus: ['-ing', 'weather'], newVocabulary: [], reviewTargets: ['all Unit 6', 'weather (Unit 3)'],
    phonicsFocus: [], communicationGoal: 'Understand an ocean adventure.',
    signatureGame: 'Story GIFs (Canva, scenario first) + Reader with pause questions', evidence: 'Pause questions + retell 3 pictures.',
    funHook: 'The child spots the treasure before the friends.', homeMission: 'Tell the story with the pictures.',
  }),
  p(6, 6, 'Extra Practice: Ocean Question Game!', {
    objective: 'I can ask and answer questions about sea animals quickly.',
    grammarFocus: ['all Unit 6'], newVocabulary: [], reviewTargets: ['all Unit 6'], phonicsFocus: [],
    communicationGoal: 'Use the ocean language without thinking.',
    signatureGame: 'Buzzer Show ⇄ + Memory ⇄', evidence: 'Accuracy in the games (not speed).',
    funHook: 'Pearls collected for every right question.', homeMission: 'Play memory with sea animal cards.',
  }),
  p(6, 7, 'Unit Review & Boss Test: Ocean Explorer!', {
    objective: 'I can say what sea animals are doing, where they live, and ask yes/no questions.',
    grammarFocus: ['all Unit 6'], newVocabulary: [], reviewTargets: ['all Unit 6'], phonicsFocus: ['sh, wh'],
    communicationGoal: 'Explore and report.',
    signatureGame: 'Boss Test', evidence: 'Boss Test, 80 % in every part.',
    funHook: 'Golden Compass piece 5 + teaser: a hero cape flying past.', homeMission: 'Show your medal and say what someone is doing.',
  }),

  // ── Unit 7 · Hero City ────────────────────────────────────────────────────────────────────────────
  p(7, 1, 'Superhero Powers: I Can Help!', {
    objective: 'I can say what I can do well: "I can run fast. I can swim well."',
    grammarFocus: ['I can… well / fast'], newVocabulary: ['well', 'fast', 'help', 'carry', 'lift'],
    reviewTargets: ['can / can\'t (Unit 2)'], phonicsFocus: ['ai (rain, train, paint)'],
    communicationGoal: 'Say what I am good at.',
    signatureGame: 'Hero Trials ⇄ (A1: with well / fast)', evidence: 'The child says 3 sentences with well / fast about themselves.',
    funHook: 'The child designs their own hero power.', homeMission: 'Tell your family one thing you can do well.',
  }),
  p(7, 2, 'Can You Lift It? Can\'t and Can!', {
    objective: 'I can ask a friend and compare: "Can you lift it?" "No, I can\'t, but Leo can!"',
    grammarFocus: ['Can you…? Yes, I can / No, I can\'t', '…, but he / she can'], newVocabulary: ['fix', 'save', 'strong', 'but'],
    reviewTargets: ['I can… well / fast'], phonicsFocus: ['ay (play, day, say)'],
    communicationGoal: 'Ask people what they can do and find the right helper.',
    signatureGame: 'Can It? ⇄ (A1: people, "but … can")', evidence: 'The child asks 3 questions and answers with "but … can".',
    funHook: 'The child picks which hero to send.', homeMission: 'Ask a family member 3 "Can you…?" questions.',
  }),
  p(7, 3, 'Listen to the Hero Helper Song', {
    objective: 'I can understand hero rules: "You must help. You mustn\'t run on the road."',
    grammarFocus: ['You must / mustn\'t…'], newVocabulary: ['must', 'mustn\'t', 'road', 'kind'],
    reviewTargets: ['Can you…?'], phonicsFocus: ['a_e magic e (cape, cake, save, brave)'],
    communicationGoal: 'Understand rules.',
    signatureGame: 'Red Light, Green Light ⇄ (hero rules on the city road) + the Hero Helper Song', evidence: '4 of 5 rules understood from listening (Rule Bingo, Tick or Cross).',
    funHook: 'The child adds a rule of their own to the song.', homeMission: 'Make one family rule in English.',
  }),
  p(7, 4, 'Offer to Help: Give, Show, Tell', {
    objective: 'I can find out what\'s wrong and help: "What\'s the matter?" "I\'ve got a headache." "Can I help you?"',
    grammarFocus: ['What\'s the matter? I\'ve got a…', 'Can I help you? Yes, please', 'Give / show me…'], newVocabulary: ['headache', 'cold', 'toothache', 'matter'],
    reviewTargets: ['Would you like…? (Unit 4)', 'must'], phonicsFocus: ['long a: ai / ay / a_e sort'],
    communicationGoal: 'Ask what\'s wrong and offer help.',
    signatureGame: '★ Hero Mission', evidence: 'The child helps 4 citizens: asks, understands and offers the right help.',
    funHook: 'The child is the city\'s hero; citizens thank them by name.', homeMission: 'Ask someone at home "What\'s the matter?" and offer help.',
  }),
  p(7, 5, 'Storybook: Captain Spark Saves the Day', {
    objective: 'I can follow a hero story and say who helped and how.',
    grammarFocus: ['can well / fast', 'must', 'What\'s the matter?'], newVocabulary: [], reviewTargets: ['all Unit 7'],
    phonicsFocus: [], communicationGoal: 'Understand a story about helping.',
    signatureGame: 'Story GIFs (Canva, scenario first) + Reader with pause questions', evidence: 'Pause questions + retell 3 pictures.',
    funHook: 'The child chooses Captain Spark\'s plan.', homeMission: 'Tell the story with the pictures.',
  }),
  p(7, 6, 'Extra Practice: Hero Mission Match!', {
    objective: 'I can use abilities, help and rules quickly.',
    grammarFocus: ['all Unit 7'], newVocabulary: [], reviewTargets: ['all Unit 7'], phonicsFocus: [],
    communicationGoal: 'Use the hero language without thinking.',
    signatureGame: 'Simon Says ⇄ (hero rules) + Ring Toss ⇄', evidence: 'Accuracy in the games (not speed).',
    funHook: 'Hero badge collection.', homeMission: 'Play Simon Says with hero rules.',
  }),
  p(7, 7, 'Unit Review & Boss Test: Super Helper!', {
    objective: 'I can help a citizen: ask what\'s wrong, offer help, say what I can do well and give a rule.',
    grammarFocus: ['all Unit 7'], newVocabulary: [], reviewTargets: ['all Unit 7'], phonicsFocus: ['ai, ay'],
    communicationGoal: 'Help someone in English.',
    signatureGame: 'Boss Test', evidence: 'Boss Test, 80 % in every part.',
    funHook: 'Golden Compass piece 6 + teaser: a giant footprint.', homeMission: 'Show your medal and help someone today.',
  }),

  // ── Unit 8 · Dino Valley ──────────────────────────────────────────────────────────────────────────
  p(8, 1, 'Dinosaur Sizes: Big and Small', {
    objective: 'I can say what a dinosaur was like long ago: "It was big. It had a long neck."',
    grammarFocus: ['It was…', 'It had…'], newVocabulary: ['dinosaur', 'neck', 'claw', 'long ago', 'was', 'had'],
    reviewTargets: ['It\'s got… (Unit 2)', 'big / small / long / short'], phonicsFocus: ['oo (tooth, food, moon)'],
    communicationGoal: 'Talk about things in the past.',
    signatureGame: '★ Fossil Dig', evidence: 'The child digs 4 fossils and says "It had…" for each.',
    funHook: 'The child chooses where to dig.', homeMission: 'Tell a grown-up about a dinosaur: "It was… It had…"',
  }),
  p(8, 2, 'Fast or Slow? Long or Short?', {
    objective: 'I can use opposites to describe dinosaurs: "It was fast. That one was slow."',
    grammarFocus: ['was / were + adjective'], newVocabulary: ['slow', 'sharp', 'egg', 'footprint', 'were'],
    reviewTargets: ['fast', 'long', 'short', 'well / fast (Unit 7)'], phonicsFocus: ['ar (large, sharp, far)'],
    communicationGoal: 'Describe with opposites.',
    signatureGame: 'Odd One Out ⇄', evidence: 'The child finds and explains 4 odd ones out.',
    funHook: 'A dinosaur egg cracks after each right answer.', homeMission: 'Find 3 opposite pairs at home.',
  }),
  p(8, 3, 'Listen to the Dinosaur Compare Song', {
    objective: 'I can understand comparisons in a song: "bigger than", "the biggest".',
    grammarFocus: ['…-er than', 'the …-est'], newVocabulary: ['bigger', 'smaller', 'faster', 'biggest', 'than'],
    reviewTargets: ['was / had'], phonicsFocus: [],
    communicationGoal: 'Understand comparisons when I hear them.',
    signatureGame: 'Tick or Cross ⇄', evidence: '4 of 5 correct from the song.',
    funHook: 'Stomp to the beat on the biggest dinosaur.', homeMission: 'Sing the dinosaur song.',
  }),
  p(8, 4, 'This One Is Bigger Than That One!', {
    objective: 'I can compare two things and pick the biggest: "The T-rex is bigger than the raptor. The biggest is…"',
    grammarFocus: ['…-er than', 'the …-est'], newVocabulary: ['longer', 'slower', 'longest'], reviewTargets: ['all adjectives'],
    phonicsFocus: ['oo / ar review'], communicationGoal: 'Compare things.',
    signatureGame: '★ See-Saw Scales', evidence: 'The child tips the scale with 4 correct comparisons and one superlative.',
    funHook: 'The child is the dinosaur scientist and corrects a wrong museum sign.', homeMission: 'Compare two family members\' shoes.',
  }),
  p(8, 5, 'Storybook: Rexi and Tilly\'s Race', {
    objective: 'I can follow a race story and say who was faster and what happened.',
    grammarFocus: ['comparatives', 'was / had / ran (past chunks)'], newVocabulary: [], reviewTargets: ['all Unit 8'],
    phonicsFocus: [], communicationGoal: 'Understand a story told in the past.',
    signatureGame: 'Story GIFs (Canva, scenario first) + Reader with pause questions', evidence: 'Pause questions + retell 3 pictures.',
    funHook: 'The child predicts the winner.', homeMission: 'Tell the story with the pictures.',
  }),
  p(8, 6, 'Extra Practice: Compare the Dinosaurs!', {
    objective: 'I can compare and describe quickly.',
    grammarFocus: ['all Unit 8'], newVocabulary: [], reviewTargets: ['all Unit 8'], phonicsFocus: [],
    communicationGoal: 'Use comparisons without thinking.',
    signatureGame: '★ Racing + Pattern Train ⇄', evidence: 'Each right sentence moves the dino; accuracy, not speed.',
    funHook: 'The child picks their racing dinosaur.', homeMission: 'Play "Which is bigger?" at home.',
  }),
  p(8, 7, 'Unit Review & Boss Test: Dino Detective!', {
    objective: 'I can compare two dinosaurs and say what one was like long ago.',
    grammarFocus: ['all Unit 8'], newVocabulary: [], reviewTargets: ['all Unit 8'], phonicsFocus: ['oo, ar'],
    communicationGoal: 'Describe and compare.',
    signatureGame: 'Boss Test', evidence: 'Boss Test, 80 % in every part.',
    funHook: 'Golden Compass piece 7 + teaser: a castle door creaks open.', homeMission: 'Show your medal and compare two animals.',
  }),

  // ── Unit 9 · Magic Castle (L1-L4 built) ───────────────────────────────────────────────────────────
  p(9, 1, 'Rooms in the Castle: Kitchen, Bedroom', {
    built: true,
    objective: 'I can name rooms and say "There is a… in the kitchen."',
    grammarFocus: ['There is a…'], newVocabulary: ['kitchen', 'bedroom', 'table', 'chair'],
    reviewTargets: ['in / on'], phonicsFocus: ['ch (as built; Unit 2 introduced it, castle reviews it)'],
    communicationGoal: 'Name the rooms of a home.',
    signatureGame: 'Castle room tour: vocab-spot + listen-tap (A1, built)', evidence: 'The child names the rooms and says one there is sentence.',
    funHook: 'Wim opens a new castle room each time.', homeMission: 'Name the rooms in your home.',
  }),
  p(9, 2, 'Castle Furniture: Bed, Lamp, Door, Window', {
    built: true,
    objective: 'I can name furniture and say what is in a room.',
    grammarFocus: ['There is / There are…'], newVocabulary: ['bed', 'lamp', 'door', 'window'],
    reviewTargets: ['rooms', 'There is…'], phonicsFocus: ['l, w (lamp, window — as built)'],
    communicationGoal: 'Say what is in a room.',
    signatureGame: 'Spin & Say + word-build (A1, built)', evidence: 'The child names the furniture in 2 rooms.',
    funHook: 'Magic furniture appears when named.', homeMission: 'Say what is in your bedroom.',
  }),
  p(9, 3, 'Listen: Where Is the Magic Lamp?', {
    built: true,
    objective: 'I can understand where things are: "It\'s next to the bed. It\'s behind the door."',
    grammarFocus: ['Where is…? It\'s next to / behind…'], newVocabulary: ['next to', 'behind'],
    reviewTargets: ['rooms', 'furniture', 'in / on / under'], phonicsFocus: [],
    communicationGoal: 'Find things from what I hear.',
    signatureGame: 'Torch Hunt + Place-it (A1, built)', evidence: 'The child finds 4 of 5 things from listening.',
    funHook: 'The magic lamp keeps moving.', homeMission: 'Hide a toy and tell a grown-up where it is.',
  }),
  p(9, 4, 'There Is / There Are in My Room!', {
    built: true,
    objective: 'I can describe a room and say whose things are: "There are two lamps. Whose crown is it? It\'s Wim\'s."',
    grammarFocus: ['There is / There are…', 'between / in front of', 'Whose… is it? It\'s …\'s'], newVocabulary: ['between', 'in front of', 'whose', 'crown'],
    reviewTargets: ['How many… (Unit 3)', 'next to / behind'], phonicsFocus: ['oa, ow (coat, goat, boat · cow, crown, tower)'],
    communicationGoal: 'Describe my room and talk about whose things are.',
    signatureGame: '★ Design My Room (listen + free) + Lost Property Box', evidence: 'The child places 5 things and describes the room in 4 sentences.',
    funHook: 'The child designs their own castle room and Wim mixes up whose things are.', homeMission: 'Describe your room in 4 sentences.',
  }),
  p(9, 5, 'Storybook: The Hidden Treasure Room', {
    objective: 'I can follow a story and say where the treasure is and whose it is.',
    grammarFocus: ['there is / are', 'place words', 'Whose?'], newVocabulary: [], reviewTargets: ['all Unit 9'],
    phonicsFocus: [], communicationGoal: 'Understand a treasure-hunt story.',
    signatureGame: 'Story GIFs (Canva, scenario first) + Reader with pause questions', evidence: 'Pause questions + retell 3 pictures.',
    funHook: 'The child reads the map before the friends.', homeMission: 'Tell the story with the pictures.',
  }),
  p(9, 6, 'Extra Practice: Find It in the Castle!', {
    objective: 'I can say where things are quickly.',
    grammarFocus: ['all Unit 9'], newVocabulary: [], reviewTargets: ['all Unit 9'], phonicsFocus: [],
    communicationGoal: 'Use place words without thinking.',
    signatureGame: 'Lift the Flap ⇄ + Memory ⇄', evidence: 'Accuracy in the games (not speed).',
    funHook: 'Secret flaps hide the castle cat.', homeMission: 'Play hide-and-find with a toy.',
  }),
  p(9, 7, 'Unit Review & Boss Test: Castle Search!', {
    objective: 'I can describe a room, say where things are and whose they are.',
    grammarFocus: ['all Unit 9'], newVocabulary: [], reviewTargets: ['all Unit 9'], phonicsFocus: ['oa, ow'],
    communicationGoal: 'Describe a home.',
    signatureGame: 'Boss Test', evidence: 'Boss Test, 80 % in every part.',
    funHook: 'Golden Compass piece 8 + teaser: beeps from a robot lab.', homeMission: 'Show your medal and describe your home.',
  }),

  // ── Unit 10 · Gadget Lab ──────────────────────────────────────────────────────────────────────────
  p(10, 1, 'Cool Gadgets: Press, Turn, Open', {
    objective: 'I can follow gadget instructions: "Press the button. Turn the wheel."',
    grammarFocus: ['imperatives: Press / Turn / Open / Close…'], newVocabulary: ['press', 'turn', 'button', 'switch', 'wheel'],
    reviewTargets: ['Go left / right (Unit 3)', 'open / close'], phonicsFocus: ['er (computer, under, river)'],
    communicationGoal: 'Follow instructions.',
    signatureGame: 'Robo-Copy ⇄ (the robot does what you say)', evidence: 'The child follows 5 instructions and gives 2.',
    funHook: 'The robot does silly things with a wrong instruction.', homeMission: 'Give a family member 2 instructions.',
  }),
  p(10, 2, 'Nano\'s Day: What Time Is It?', {
    objective: 'I can tell a day with times: "Nano gets up at seven o\'clock. On Monday he goes to school."',
    grammarFocus: ['present simple routines (he / she gets up…)', 'What time is it? It\'s … o\'clock', 'on Monday…'], newVocabulary: ['o\'clock', 'get up', 'go to bed', 'Monday', 'Saturday'],
    reviewTargets: ['It lives / eats (Unit 6)', 'numbers'], phonicsFocus: ['ur (turn, Thursday, purple)'],
    communicationGoal: 'Talk about my day and the time.',
    signatureGame: '★ Clock Quest', evidence: 'The child sets 4 clocks from listening and says 3 sentences about their own day.',
    funHook: 'The child plans the robot\'s perfect Saturday.', homeMission: 'Tell your family 3 things you do and when.',
  }),
  p(10, 3, 'Listen: How Do I Turn It On?', {
    objective: 'I can understand steps in order: "First… then… next…"',
    grammarFocus: ['First… Then… Next…'], newVocabulary: ['first', 'then', 'next'], reviewTargets: ['instructions', 'times'],
    phonicsFocus: [], communicationGoal: 'Understand steps in the right order.',
    signatureGame: 'Story Order ⇄ (put the steps in order)', evidence: '4 of 5 step sequences in the right order.',
    funHook: 'The gadget only works if the steps are right.', homeMission: 'Sing the gadget song.',
  }),
  p(10, 4, 'First, Then, Next: Give Instructions!', {
    objective: 'I can give 3-step instructions and a lab rule: "First press… Then turn… You mustn\'t touch the red button!"',
    grammarFocus: ['First… Then… Next…', 'You must / mustn\'t (Unit 7)'], newVocabulary: ['fix', 'build'],
    reviewTargets: ['imperatives', 'must / mustn\'t'], phonicsFocus: ['or (for, robot, sport)'],
    communicationGoal: 'Tell someone how to do something.',
    signatureGame: '★ Build-a-Bot', evidence: 'The child gives 3-step instructions the bot follows correctly.',
    funHook: 'The child is the chief inventor; the bot builds exactly what it hears.', homeMission: 'Explain how to make a sandwich in 3 steps.',
  }),
  p(10, 5, 'Storybook: Nano the Bot\'s Big Invention', {
    objective: 'I can follow a story and say what Nano did, step by step.',
    grammarFocus: ['first / then / next', 'was / had (Unit 8)'], newVocabulary: [], reviewTargets: ['all Unit 10'],
    phonicsFocus: [], communicationGoal: 'Understand an invention story.',
    signatureGame: 'Story GIFs (Canva, scenario first) + Reader with pause questions', evidence: 'Pause questions + retell 3 pictures.',
    funHook: 'The child names Nano\'s invention.', homeMission: 'Tell the story with the pictures.',
  }),
  p(10, 6, 'Extra Practice: Robot Instruction Match!', {
    objective: 'I can give and follow instructions quickly.',
    grammarFocus: ['all Unit 10'], newVocabulary: [], reviewTargets: ['all Unit 10'], phonicsFocus: [],
    communicationGoal: 'Use instructions without thinking.',
    signatureGame: '★ Maze Chase + Rapid Recall ⇄', evidence: 'Accuracy in the games (not speed).',
    funHook: 'The child races the robot through the maze.', homeMission: 'Play robot instructions at home.',
  }),
  p(10, 7, 'Unit Review & Boss Test: Tech Inventor!', {
    objective: 'I can give 3-step instructions, tell the time and tell a robot\'s day.',
    grammarFocus: ['all Unit 10'], newVocabulary: [], reviewTargets: ['all A1'], phonicsFocus: ['er, ur, or + sight words'],
    communicationGoal: 'Show everything I learned in A1.',
    signatureGame: 'Boss Test + A1 Final Test', evidence: 'Boss Test, 80 % in every part; A1 Final Test moves the child to A2.',
    funHook: 'Golden Compass piece 9, the last one: the compass opens A2. Rising Star certificate (two medals).', homeMission: 'Show your certificate and tell your family your day in English.',
  }),
];

export function getA1LessonPlan(unit: number, lesson: number): A1LessonPlan | undefined {
  return A1_LESSON_PLANS.find((x) => x.unit === unit && x.lesson === lesson);
}
