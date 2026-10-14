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
    // Themed worlds + A1 Movers grammar spine (2026-10-12): src/curriculum/roadmap/a1Roadmap.ts, a1LessonPlans.ts.
    1: {
      canDo: ['Greets and says goodbye correctly', 'Introduces self and a friend in full sentences', 'Asks and answers "How are you?" about self and others'],
      probes: [
        { ask: '"Hi! I\'m [name]. What\'s your name?"', expect: '"My name is …" (full sentence)' },
        { ask: '"How are you today? How is your friend?"', expect: '"I\'m …" + "He\'s / She\'s …"' },
        { ask: '"Introduce your friend to me."', expect: '"This is my friend …" (+ "Nice to meet you")' },
      ],
    },
    2: {
      canDo: ['Names jungle animals (monkey, elephant, snake, crocodile…)', 'Says what an animal can and can\'t do', 'Asks and answers "Can it…?"', 'Describes an animal in 4 sentences'],
      probes: [
        { ask: '"What can a monkey do? What can\'t it do?"', expect: '"It can climb. It can\'t fly."' },
        { ask: '"Ask me about a snake."', expect: '"Can it …?"' },
        { ask: '"Tell me about an elephant."', expect: '4 sentences: what it is, looks like, can, can\'t' },
      ],
    },
    3: {
      canDo: ['Counts in tens to 100 and answers "How many?"', 'Follows and gives directions (left, right, up, down, above, below)', 'Says what the weather is like'],
      probes: [
        { ask: '"Count in tens to 100."', expect: 'Ten, twenty… one hundred' },
        { ask: '"Tell me how to get to the door."', expect: '"Go left / right / up…" (2 steps)' },
        { ask: '"What\'s the weather like today?"', expect: '"It\'s sunny / cold / windy…"' },
      ],
    },
    4: {
      canDo: ['Says what they like and like doing (+ -ing)', 'Asks "Do you like…?"', 'Offers and accepts food politely'],
      probes: [
        { ask: '"What do you like doing?"', expect: '"I like cooking / swimming…"' },
        { ask: '"Ask me about soup."', expect: '"Do you like soup?"' },
        { ask: 'Hold out a snack: "…"', expect: '"Would you like some …?" / "Yes, please"' },
      ],
    },
    5: {
      canDo: ['Says how someone feels and why (because)', 'Describes looks and family with has got', 'Says what someone is wearing'],
      probes: [
        { ask: 'Show a scared face: "How does he feel? Why?"', expect: '"He\'s scared because …"' },
        { ask: '"Tell me about your family."', expect: '"I\'ve got a brother. He\'s got short hair."' },
        { ask: '"What am I wearing?"', expect: '"You\'re wearing a …"' },
      ],
    },
    6: {
      canDo: ['Names sea animals', 'Says what an animal is doing (present continuous)', 'Says where it lives / what it eats', 'Asks yes/no questions: "Is it a…?"'],
      probes: [
        { ask: 'Show an octopus hiding: "What\'s it doing?"', expect: '"It\'s hiding"' },
        { ask: '"Where does a crab live?"', expect: '"It lives on the beach / in the sea"' },
        { ask: 'Hide a picture: "Ask me about it."', expect: '"Is it a …? Is it swimming?"' },
      ],
    },
    7: {
      canDo: ['Says what they can do well / fast', 'Asks "What\'s the matter?" and offers help', 'Gives rules with must / mustn\'t'],
      probes: [
        { ask: '"What can you do well?"', expect: '"I can swim well / run fast"' },
        { ask: 'Hold your head: "Ooh!"', expect: '"What\'s the matter?" (+ "Can I help you?")' },
        { ask: '"Tell me a rule for the road."', expect: '"You must … / You mustn\'t …"' },
      ],
    },
    8: {
      canDo: ['Compares two things (bigger, faster… than)', 'Says which is the biggest / fastest', 'Says what something was like (was / had)'],
      probes: [
        { ask: 'Show an elephant and a mouse', expect: '"The elephant is bigger than the mouse"' },
        { ask: 'Show 3 animals: "Which is the fastest?"', expect: '"The … is the fastest"' },
        { ask: '"Tell me about a T-rex."', expect: '"It was big. It had sharp teeth."' },
      ],
    },
    9: {
      canDo: ['Names rooms and furniture', 'Says what is where (there is / are + place words)', 'Asks and answers "Whose…?"'],
      probes: [
        { ask: 'Show a bedroom: "What\'s in the room?"', expect: '"There\'s a bed. There are two lamps."' },
        { ask: '"Where is the lamp?" (picture)', expect: '"It\'s next to / behind / between …"' },
        { ask: 'Point to a toy: "Whose is it?"', expect: '"It\'s …\'s"' },
      ],
    },
    10: {
      canDo: ['Gives 3-step instructions with first / then / next', 'Tells the time (o\'clock) and the days', 'Describes a daily routine'],
      probes: [
        { ask: '"Tell me how to make a sandwich."', expect: '"First…, then…, next…"' },
        { ask: 'Show a clock at 7:00: "What time is it?"', expect: '"It\'s seven o\'clock"' },
        { ask: '"What do you do in the morning?"', expect: '"I get up at … I have breakfast…"' },
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
