/**
 * Playground knowledge checks — one per unit, used in the Prior knowledge
 * checklist (trial lesson, level change requests) so every teacher places
 * students the same way.
 *
 * Built from the curriculum blueprint (unit + lesson titles in
 * curriculum_lessons) and, for A1, the roadmap in
 * src/curriculum/roadmap/a1Roadmap.ts. Probes are spoken by the teacher
 * (point at something on screen / in the room, mime, or ask); they only
 * use words from that unit's lessons.
 *
 * Scoring (same everywhere): 3/3 quickly and without help = Knows it,
 * 1–2 or with help = Partly, 0 = Not yet. Work through the units in order
 * and stop at the first one that isn't "Knows it".
 */

export interface KnowledgeProbe {
  /** What the teacher says or does. */
  ask: string;
  /** What counts as correct. */
  expect: string;
}

export interface UnitKnowledgeCheck {
  canDo: string[];
  probes: KnowledgeProbe[];
}

/** level → unit number → check */
export type LevelKnowledgeChecks = Record<string, Record<number, UnitKnowledgeCheck>>;

export const PLAYGROUND_KNOWLEDGE_CHECKS: LevelKnowledgeChecks = {
  'Pre-A1': {
    1: {
      canDo: ['Says hello and goodbye', 'Says their name: "My name is…"', 'Answers "How are you?"'],
      probes: [
        { ask: 'Wave and say "Hello!"', expect: '"Hello!" / "Hi!" back' },
        { ask: '"What\'s your name?"', expect: '"My name is …" (or "I\'m …")' },
        { ask: '"How are you?"', expect: '"I\'m fine / happy / good"' },
      ],
    },
    2: {
      canDo: ['Names 6 colours', 'Names circle, square, triangle', 'Answers "What colour is this?"'],
      probes: [
        { ask: 'Point at something red, then blue: "What colour?"', expect: '"Red", "blue"' },
        { ask: 'Point at green, orange or purple: "What colour?"', expect: 'Correct colour name' },
        { ask: 'Draw a circle and a triangle: "What shape?"', expect: '"Circle", "triangle"' },
      ],
    },
    3: {
      canDo: ['Names 6 toys (ball, car, doll, teddy bear, blocks, train)', 'Says "I like…" about a toy'],
      probes: [
        { ask: 'Show a ball, a car, a doll: "What is it?"', expect: '"A ball", "a car", "a doll"' },
        { ask: 'Show a teddy bear or a train: "What is it?"', expect: '"Teddy (bear)", "train"' },
        { ask: '"What do you like to play with?"', expect: '"I like …" + a toy' },
      ],
    },
    4: {
      canDo: ['Names head, shoulders, knees, toes', 'Names eyes, ears, mouth, nose', 'Points to body parts when asked'],
      probes: [
        { ask: '"Touch your head… your knees… your toes!"', expect: 'Touches each one' },
        { ask: 'Point at your eyes and nose: "What\'s this?"', expect: '"Eyes", "nose"' },
        { ask: 'Hold up your hand and point at your feet', expect: '"Hand(s)", "feet"' },
      ],
    },
    5: {
      canDo: ['Names family members (mom, dad, brother, sister, baby, grandma, grandpa)', 'Says who is in their family'],
      probes: [
        { ask: 'Show a family picture: "Who is this?" (mom / dad)', expect: '"Mom", "Dad"' },
        { ask: 'Point at brother, sister or baby', expect: 'Correct word' },
        { ask: '"Who is in your family?"', expect: 'Names 2+ family members' },
      ],
    },
    6: {
      canDo: ['Names rooms (kitchen, bedroom, bathroom)', 'Names table, chair, bed', 'Says where something is in the house'],
      probes: [
        { ask: 'Show a kitchen and a bedroom: "What room?"', expect: '"Kitchen", "bedroom"' },
        { ask: 'Point at a table, a chair, a bed', expect: 'Correct words' },
        { ask: '"Where do you sleep?"', expect: '"(In my) bedroom" / "bed"' },
      ],
    },
    7: {
      canDo: ['Names pets (dog, cat, bird)', 'Names farm animals (cow, pig, sheep, horse, chicken, duck)', 'Makes / matches animal sounds'],
      probes: [
        { ask: 'Show a dog, a cat, a bird: "What animal?"', expect: '"Dog", "cat", "bird"' },
        { ask: 'Show a cow, a pig, a horse', expect: 'Correct words' },
        { ask: '"What does a cow say? A duck?"', expect: '"Moo", "quack"' },
      ],
    },
    8: {
      canDo: ['Names foods and drinks (apple, banana, milk, bread, water, juice, pizza, cake)', 'Says "I like…" / "I don\'t like…"'],
      probes: [
        { ask: 'Show an apple, a banana, milk: "What is it?"', expect: 'Correct words' },
        { ask: 'Show pizza, cake, juice', expect: 'Correct words' },
        { ask: '"Do you like apples?"', expect: '"Yes, I like…" / "No, I don\'t…"' },
      ],
    },
    9: {
      canDo: ['Names clothes (shirt, pants, dress, shoes, hat, socks, coat, skirt, T-shirt)', 'Says what they are wearing'],
      probes: [
        { ask: 'Point at a shirt and shoes: "What\'s this?"', expect: '"Shirt", "shoes"' },
        { ask: 'Show a hat, socks, a coat', expect: 'Correct words' },
        { ask: '"What are you wearing?"', expect: 'Names 2+ clothes ("a T-shirt…")' },
      ],
    },
    10: {
      canDo: ['Names actions (run, jump, walk, swim, dance, sing, clap, sleep)', 'Answers "What can you do?" with "I can…"'],
      probes: [
        { ask: 'Mime running and jumping: "What am I doing?"', expect: '"Run", "jump"' },
        { ask: '"Clap! Dance!" (give the command)', expect: 'Does the action' },
        { ask: '"What can you do?"', expect: '"I can …" + an action' },
      ],
    },
  },

  A1: {
    1: {
      canDo: ['Greets and says goodbye correctly', 'Introduces self in a full sentence', 'Asks and answers "How are you?"'],
      probes: [
        { ask: '"Hi! I\'m [name]. What\'s your name?"', expect: '"My name is …" (full sentence)' },
        { ask: '"How are you today?"', expect: '"I\'m fine, thank you" (+ "And you?")' },
        { ask: '"Introduce yourself to a new friend."', expect: 'Hello + name (+ age / a detail)' },
      ],
    },
    2: {
      canDo: ['Names jungle animals (lion, monkey, bird…)', 'Says what animals can do: "It can run / fly / swim"'],
      probes: [
        { ask: 'Show a lion, a monkey, a bird', expect: 'Correct words' },
        { ask: '"What can a bird do?"', expect: '"It can fly"' },
        { ask: '"Can a lion swim? What can it do?"', expect: 'Yes/no + "It can run / jump…"' },
      ],
    },
    3: {
      canDo: ['Counts 1–20', 'Uses left / right / up / down', 'Uses in / on / under'],
      probes: [
        { ask: '"Count from 1 to 15."', expect: 'Counts without mistakes' },
        { ask: '"Point left! Point up!"', expect: 'Correct directions' },
        { ask: 'Put a pen on / under something: "Where is the pen?"', expect: '"On / under the …"' },
      ],
    },
    4: {
      canDo: ['Names 6+ foods', 'Says "I like… / I don\'t like…"', 'Asks "What do you like to eat?"'],
      probes: [
        { ask: 'Show rice, cheese, pizza, bread', expect: 'Names 3+' },
        { ask: '"Do you like cheese?"', expect: '"Yes, I do / No, I don\'t like…"' },
        { ask: '"Ask me what I like to eat."', expect: '"What do you like (to eat)?"' },
      ],
    },
    5: {
      canDo: ['Uses 4 feelings (happy, sad, angry, tired)', 'Describes people: tall, short, big, small', 'Describes someone in 2–3 sentences'],
      probes: [
        { ask: 'Make a sad face: "How do I feel?"', expect: '"You are sad"' },
        { ask: '"How do you feel today?"', expect: '"I\'m …" (feeling word)' },
        { ask: 'Show a person: "Tell me about him / her."', expect: '2 sentences: "He is tall. He is happy."' },
      ],
    },
    6: {
      canDo: ['Names sea animals (shark, whale, octopus, crab)', 'Asks yes/no questions: "Is it a…?"', 'Asks and answers "Where does it live?"'],
      probes: [
        { ask: 'Show a shark and an octopus', expect: 'Correct words' },
        { ask: 'Hide a picture: "Ask me about it."', expect: '"Is it a …?"' },
        { ask: '"Where does a whale live?"', expect: '"In the sea / ocean"' },
      ],
    },
    7: {
      canDo: ['Uses can / can\'t', 'Offers help: "Can I help you?"', 'Uses give / show / tell + me / you'],
      probes: [
        { ask: '"Can you swim? Can you fly?"', expect: '"Yes, I can / No, I can\'t"' },
        { ask: 'Pretend to carry a heavy box', expect: '"Can I help (you)?"' },
        { ask: '"Ask me for the pencil."', expect: '"Give me the pencil, please"' },
      ],
    },
    8: {
      canDo: ['Compares two things: bigger, smaller, faster…', 'Uses "than"', 'Uses 5+ size / speed adjectives'],
      probes: [
        { ask: 'Show an elephant and a mouse: "Which is big?"', expect: '"The elephant is bigger (than the mouse)"' },
        { ask: '"Is a car faster than a bike?"', expect: '"Yes, a car is faster (than a bike)"' },
        { ask: '"Say the opposite: long… fast… old…"', expect: '"Short", "slow", "young"' },
      ],
    },
    9: {
      canDo: ['Names rooms and furniture (kitchen, bedroom, bed, lamp, door, window…)', 'Asks and answers "Where is…?"', 'Uses in / on / under / next to / behind'],
      probes: [
        { ask: 'Show a bedroom: "What can you see?"', expect: 'Names 3+ things (bed, lamp, window…)' },
        { ask: '"Where is the lamp?" (picture)', expect: '"It\'s on / next to the …"' },
        { ask: '"Ask me where my book is."', expect: '"Where is your book?"' },
      ],
    },
    10: {
      canDo: ['Uses action verbs: press, turn, open, close, wait', 'Gives 3-step instructions with first / then / next'],
      probes: [
        { ask: 'Mime pressing a button and opening a door', expect: '"Press", "open"' },
        { ask: '"Tell me how to turn on the TV."', expect: '"Press the button" (simple instruction)' },
        { ask: '"How do you make a sandwich? 3 steps."', expect: '"First…, then…, next…"' },
      ],
    },
  },

  A2: {
    1: {
      canDo: ['Describes a daily routine (get up, have breakfast, go to school…)', 'Uses days of the week', 'Says what they did yesterday'],
      probes: [
        { ask: '"What do you do in the morning?"', expect: '"I get up, I have breakfast…" (2+ actions)' },
        { ask: '"What do you do on Saturday?"', expect: 'Day + activity' },
        { ask: '"What did you do yesterday?"', expect: 'One past sentence ("I played…")' },
      ],
    },
    2: {
      canDo: ['Uses present continuous: "I\'m reading"', 'Asks "What are you doing?"', 'Describes the weather now'],
      probes: [
        { ask: 'Mime eating: "What am I doing?"', expect: '"You are eating"' },
        { ask: 'Show a picture: "What are they doing?"', expect: '"They are playing / running…"' },
        { ask: '"What\'s the weather like now?"', expect: '"It\'s sunny / raining…"' },
      ],
    },
    3: {
      canDo: ['Uses past simple: went, played, saw…', 'Tells a short story with first / then / after that'],
      probes: [
        { ask: '"Where did you go last weekend?"', expect: '"I went to…"' },
        { ask: '"What did you do there?"', expect: 'Past verb ("I played / saw / ate…")' },
        { ask: '"Tell me about your day: first… then…"', expect: '2–3 linked past sentences' },
      ],
    },
    4: {
      canDo: ['Uses comparatives (bigger, faster)', 'Uses superlatives (the fastest, the biggest)', 'Compares 3 things'],
      probes: [
        { ask: '"Which is bigger, a cat or a horse?"', expect: '"A horse is bigger (than a cat)"' },
        { ask: '"What\'s the fastest animal?"', expect: '"The cheetah / … is the fastest"' },
        { ask: 'Show 3 things: "Compare them."', expect: 'One comparative + one superlative' },
      ],
    },
    5: {
      canDo: ['Uses "going to" for plans', 'Says what they want to be: "I want to be a…"'],
      probes: [
        { ask: '"What are you going to do this weekend?"', expect: '"I\'m going to …"' },
        { ask: '"What do you want to be when you grow up?"', expect: '"I want to be a …"' },
        { ask: '"Ask me about my plans."', expect: '"What are you going to do…?"' },
      ],
    },
    6: {
      canDo: ['Asks "How much is it?" and says prices', 'Uses this / that / these / those', 'Buys something in a role-play'],
      probes: [
        { ask: 'Hold up a pen: "Ask me the price."', expect: '"How much is it / this?"' },
        { ask: 'Point near and far: "This or that?"', expect: '"This pen / that book" (correct choice)' },
        { ask: 'Role-play a shop: "Hello, can I help you?"', expect: '"I\'d like… / Can I have…, please?"' },
      ],
    },
    7: {
      canDo: ['Says how they feel (headache, sick, tired)', 'Gives advice with "should / shouldn\'t"'],
      probes: [
        { ask: 'Touch your head and look sad: "What\'s wrong?"', expect: '"You have a headache"' },
        { ask: '"I\'m tired. What should I do?"', expect: '"You should rest / sleep"' },
        { ask: '"I ate too much cake. Advice?"', expect: '"You shouldn\'t eat…"' },
      ],
    },
    8: {
      canDo: ['Names places in town (bank, park, library…)', 'Gives directions: turn left / right, go straight', 'Asks "How do I get to…?"'],
      probes: [
        { ask: '"Where do you buy books? Borrow books?"', expect: '"Bookshop", "library"' },
        { ask: 'Show a simple map: "How do I get to the park?"', expect: '"Go straight, turn left…"' },
        { ask: '"Ask me the way to the bank."', expect: '"How do I get to the bank?"' },
      ],
    },
    9: {
      canDo: ['Names the 4 seasons and weather', 'Gives reasons with "because"'],
      probes: [
        { ask: '"What are the four seasons?"', expect: 'Spring, summer, autumn/fall, winter' },
        { ask: '"What\'s the weather like in winter?"', expect: '"It\'s cold / snowy…"' },
        { ask: '"What\'s your favourite season? Why?"', expect: '"… because …"' },
      ],
    },
    10: {
      canDo: ['Talks about the past year and memories', 'Mixes past, present and future in short talk'],
      probes: [
        { ask: '"What did you learn this year?"', expect: '"I learned…" (past)' },
        { ask: '"What\'s your favourite memory?"', expect: '2 past sentences' },
        { ask: '"What are you going to do next year?"', expect: '"I\'m going to…"' },
      ],
    },
  },
};
