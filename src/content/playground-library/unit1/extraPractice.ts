import type { CharKey, Scene } from './scenes';

/* =============================================================================
 * Extra practice for the Pre-A1 lessons (owner, 2026-10-12): "the last lessons are just 17 pages and I don't think 17
 * pages are enough for 30-minute classes … use the games list and create extra practice for the student. Be creative.
 * Search the internet for any reference or inspiration … the maximum pages could be 25."
 *
 * Every lesson under 22 pages gets a practice block (placed before the sticker, so it is part of the lesson, not an
 * optional extra) and comes to 22-23 pages (never more than 25):
 *   - rotating review games built for this (lessonVariety ROUTINE_KINDS, so neighbours can share them):
 *       Word Board (snakes & ladders: roll, say the picture), Home Hunt (find / show / do it at home), Flip & Say
 *       (speaking cards), Spin & Say (the universal numbered wheel with this lesson's pictures);
 *   - one or two listening games from the lesson's own slot list (SLOT_GAMES), filled with this lesson's words.
 * Inspiration (mechanics only): snakes & ladders one-to-one review (Abridge Academy, "Top five interactive games for
 * online teaching"), the scavenger hunt (Twinkl, "Vocabulary games for online ESL students"), Wordwall flip tiles /
 * speaking cards / random wheel (JALT "Using Wordwall warm-up and review activities").
 * Words come only from the lesson and the lessons before it in the unit (recycling); pictures are this lesson's own.
 * ========================================================================= */

type W = { label: string; img: string; say: string };
const I = (n: string) => `/lep1/items/item-${n}.png`;
const G = (n: string) => `/lep1/gifs/${n}.webp`;
const BG = (n: string) => `/lep1/scenes/bg-${n}-wide.png`;
const P = (u: string, n: number) => `/lep1/scenes/bg-${u}-story-${n}-wide.png`;
const C = (n: string) => `/lep1/characters/${n}.png`;
const w = (label: string, img: string, say: string): W => ({ label, img, say });

type Hunt = { img: string; label: string; ask: string; found: string };
type Extra =
  | 'board' | 'hunt' | 'flip' | 'spin'
  | { kind: 'rapid' } | { kind: 'memory' } | { kind: 'tile' } | { kind: 'shadow' } | { kind: 'jigsaw' }
  | { kind: 'pattern' } | { kind: 'train'; question: string } | { kind: 'secret' }
  | { kind: 'sort'; left: { label: string; img: string }; right: { label: string; img: string }; items: (W & { target: 'left' | 'right' })[] }
  | { kind: 'roleplay'; cast: CharKey[]; script: { who: CharKey; line: string; repeat?: boolean }[] };

interface Plan {
  who: CharKey; bg: string; walker: string; bank: W[]; extras: Extra[];
  hunt?: Hunt[]; board?: { title: string; ask?: string; done: string }; flip?: string;
}

const SPIN_AT = [['20%', '30%'], ['50%', '24%'], ['80%', '30%'], ['20%', '74%'], ['80%', '74%'], ['50%', '84%']] as const;

function build(key: string, p: Plan): Scene[] {
  const [u, l] = key.split('-');
  const id = (s: string) => `u${u}l${l}-xp-${s}`;
  const T = (s: string) => `Extra practice: ${s}`;
  const out: Scene[] = [];
  const bank = p.bank;
  const things = bank.map((b) => ({ label: b.label, img: b.img }));
  for (const e of p.extras) {
    if (e === 'board') out.push({
      id: id('board'), kind: 'word-board', bg: p.bg, who: p.who, walker: p.walker, title: p.board?.title ?? 'Word Board! Roll and say!',
      teacher: T('Word Board! The student rolls, the walker hops, and the student SAYS the picture they land on (🔊 = the model), then taps "I said it!". Ladders go up, the slide goes down — more words to say!'),
      words: bank, ask: p.board?.ask, doneLine: p.board?.done ?? 'You did it! Super talking!',
    });
    else if (e === 'hunt' && p.hunt) out.push({
      id: id('hunt'), kind: 'home-hunt', bg: p.bg, who: p.who, title: 'Home Hunt!',
      teacher: T('Home Hunt! Read the mission, press Go! The student runs, finds or does it at home, shows it to the camera and says the word. Tap "Found it!" (no hurry — the timer never fails).'),
      rounds: p.hunt, doneLine: 'Great hunting! You found them all!',
    });
    else if (e === 'flip') out.push({
      id: id('flip'), kind: 'flip-say', bg: p.bg, who: p.who, title: p.flip ?? 'Flip a card and say it!',
      teacher: T('Flip & Say! The student picks any card, it flips, and they say the sentence (🔊 = the model). Tap "I said it!" — the card turns gold.'),
      cards: bank.slice(0, 6), doneLine: 'All the cards are gold! Well done!',
    });
    else if (e === 'spin') out.push({
      id: id('spin'), kind: 'spin-wheel', bg: p.bg, title: 'Spin and say!',
      teacher: T('Have the student spin the wheel and say the sentence for that picture. If you prefer, do the activity without the spinner.'),
      items: bank.slice(0, 6).map((b, i) => ({ label: b.say, img: b.img, left: SPIN_AT[i][0], top: SPIN_AT[i][1] })),
      wheelAt: { left: '50%', top: '52%' },
    } as Scene);
    else if (typeof e === 'object' && e.kind === 'rapid') out.push({
      id: id('rapid'), kind: 'rapid-recall', bg: p.bg, who: p.who, seconds: 4,
      teacher: T('Quick fire! Say it before the ring runs out.'), cards: bank.map((b) => ({ img: b.img, word: b.label, say: b.say })),
    });
    else if (typeof e === 'object' && e.kind === 'memory') out.push({
      id: id('memory'), kind: 'memory', bg: p.bg, teacher: T('Memory! Find the pairs and say each one.'),
      pairs: bank.slice(0, 5).map((b) => ({ id: b.label, label: b.label, emoji: '', img: b.img })),
    });
    else if (typeof e === 'object' && e.kind === 'tile') out.push({
      id: id('tile'), kind: 'tile-reveal', bg: p.bg, who: p.who,
      teacher: T('Image Reveal! The picture uncovers bit by bit — the student guesses early, taps the answer and says it.'),
      rounds: bank.slice(0, 4).map((b, i) => ({ img: b.img, word: b.label, line: b.say, options: [things[i], things[(i + 1) % things.length], things[(i + 2) % things.length]] })),
    });
    else if (typeof e === 'object' && e.kind === 'shadow') out.push({
      id: id('shadow'), kind: 'shadow-match', bg: p.bg, who: p.who,
      teacher: T('Shadow Match! Drag (or tap-tap) each picture onto its shadow and say it.'),
      items: bank.slice(0, 5).map((b) => ({ label: b.label, img: b.img, line: b.say })),
    });
    else if (typeof e === 'object' && e.kind === 'jigsaw') out.push({
      id: id('jigsaw'), kind: 'jigsaw-puzzle', bg: p.bg, teacher: T('Puzzle! Put the picture together, then say everything you can see in it.'), image: p.bg, rows: 2, cols: 3,
    });
    else if (typeof e === 'object' && e.kind === 'pattern') {
      const car = (b: W) => ({ colorWord: '', colorHex: '#ffffff', shape: 'circle' as const, img: b.img, word: b.label });
      const [a, b, c] = [bank[0], bank[1], bank[2]];
      out.push({
        id: id('pattern'), kind: 'pattern-train', bg: p.bg, who: p.who,
        teacher: T('What comes next? The student says the pattern out loud, then picks the next wagon.'),
        rounds: [
          { pattern: [car(a), car(b), car(a), car(b)], answer: car(a), options: [car(a), car(b), car(c)] },
          { pattern: [car(b), car(c), car(b), car(c)], answer: car(b), options: [car(c), car(a), car(b)] },
          { pattern: [car(a), car(a), car(c), car(a), car(a)], answer: car(c), options: [car(b), car(c), car(a)] },
        ],
      });
    } else if (typeof e === 'object' && e.kind === 'train') out.push({
      id: id('train'), kind: 'train-recall', bg: p.bg, teacher: T('Memory Train! Look at the wagons, they go into the tunnel — what was on the train? Say them all!'),
      question: e.question, cars: bank.slice(0, 4).map((b) => ({ word: b.label, img: b.img, emoji: '' })),
    });
    else if (typeof e === 'object' && e.kind === 'secret') out.push({
      id: id('secret'), kind: 'secret-card', bg: p.bg, who: p.who,
      teacher: T('Secret card! The student ASKS "Is it a …?" until they find the hidden picture.'),
      cards: bank.slice(0, 6).map((b) => ({ colorWord: '', colorHex: '#ffffff', shape: 'circle' as const, img: b.img, word: b.label })),
      rounds: [{ secret: 2 }, { secret: 0 }],
    });
    else if (typeof e === 'object' && e.kind === 'sort') out.push({
      id: id('sort'), kind: 'catch-sort', bg: p.bg, teacher: T('Catch and sort! Tap the right basket before it lands, and say it.'),
      left: { ...e.left, emoji: '' }, right: { ...e.right, emoji: '' },
      items: e.items.map((it) => ({ word: it.label, img: it.img, emoji: '', target: it.target })), goal: Math.min(6, e.items.length), seconds: 6,
    });
    else if (typeof e === 'object' && e.kind === 'roleplay') out.push({
      id: id('roleplay'), kind: 'roleplay', bg: p.bg, teacher: T('Act it out! Listen to each line, then say it with the friends.'), cast: e.cast, script: e.script,
    });
  }
  return out;
}

/* ---------- the lessons ---------- */
const farmAnimals = [w('cow', I('cow'), "It's a cow! Moo!"), w('pig', I('pig'), "It's a pig! Oink!"), w('sheep', I('sheep'), "It's a sheep! Baa!")];
const pets = [w('dog', I('dog'), "It's a dog! Woof!"), w('cat', I('cat'), "It's a cat! Meow!"), w('bird', I('bird'), "It's a bird! Tweet!")];
const pondAnimals = [w('horse', I('horse'), "It's a horse! Neigh!"), w('chicken', I('hen'), "It's a chicken! Cluck!"), w('duck', I('farm-duck'), "It's a duck! Quack!")];
const rooms = [w('kitchen', I('room-kitchen'), 'This is the kitchen.'), w('bedroom', I('room-bedroom'), 'This is the bedroom.'), w('bathroom', I('room-bathroom'), 'This is the bathroom.'), w('living room', I('room-living-room'), 'This is the living room.')];
const furniture = [w('table', I('table'), "It's a table!"), w('chair', I('chair'), "It's a chair!"), w('bed', I('bed'), "It's a bed!"), w('sofa', I('sofa'), "It's a sofa!")];

const PLANS: Record<string, Plan> = {
  '2-5': {
    who: 'mia', bg: BG('u2l5-sea'), walker: C('mia-happy'),
    bank: [w('ship', I('ship'), "It's a ship!"), w('shell', I('shell'), "It's a shell!"), w('shoe', I('shoe'), "It's a shoe!"), w('whale', I('whale'), "It's a whale!"), w('fish', I('shelly'), "It's a fish!"), w('wheel', I('wheel'), "It's a wheel!")],
    extras: ['board', 'flip'],
  },
  '5-6': {
    who: 'pip', bg: BG('u5l6-stage'), walker: C('pip-happy'),
    bank: [w('grandma', I('family-grandma'), 'This is my grandma!'), w('grandpa', I('family-grandpa'), 'This is my grandpa!'), w('mom', I('family-mom'), 'This is my mom!'), w('dad', I('family-dad'), 'This is my dad!'), w('brother', I('family-brother'), 'This is my brother!'), w('sister', I('family-sister'), 'This is my sister!'), w('baby', I('family-baby'), 'This is the baby!')],
    extras: ['board', 'hunt'],
    hunt: [
      { img: I('bear'), label: 'teddy', ask: 'Find a soft toy! Show me!', found: 'So soft! Say: teddy!' },
      { img: I('shoe'), label: 'big shoe', ask: 'Find a BIG shoe at home!', found: 'A big shoe! Great!' },
      { img: I('family-mom'), label: 'photo', ask: 'Find a photo of your family!', found: 'Who is this? Say: This is my …!' },
      { img: I('family-pip'), label: 'wave', ask: 'Wave to someone at home!', found: 'Hello, family! Great!' },
    ],
  },
  '6-1': {
    who: 'pip', bg: BG('u6l1-dollhouse'), walker: C('pip-happy'),
    bank: [...rooms, w('house', I('house'), 'This is my house!')],
    extras: ['hunt', 'flip'],
    hunt: [
      { img: I('room-kitchen'), label: 'kitchen', ask: 'Find something from the kitchen: a cup or a spoon!', found: 'From the kitchen! Super!' },
      { img: I('room-bedroom'), label: 'bedroom', ask: 'Find something from your bedroom: a pillow or a teddy!', found: 'From the bedroom! Great!' },
      { img: I('room-bathroom'), label: 'bathroom', ask: 'Find something from the bathroom: a towel!', found: 'From the bathroom! Well done!' },
      { img: I('room-living-room'), label: 'living room', ask: 'Find a cushion from the living room!', found: 'From the living room! Yes!' },
    ],
  },
  '6-2': {
    who: 'mia', bg: BG('u6l2-room-empty'), walker: C('mia-happy'),
    bank: [...furniture, w('kitchen', I('room-kitchen'), 'This is the kitchen.'), w('bedroom', I('room-bedroom'), 'This is the bedroom.')],
    extras: ['board', 'hunt'],
    hunt: [
      { img: I('table'), label: 'table', ask: 'Touch a table! Say: table!', found: 'A table! Super!' },
      { img: I('chair'), label: 'chair', ask: 'Sit on a chair! Say: chair!', found: 'A chair! Great!' },
      { img: I('bed'), label: 'bed', ask: 'Find a pillow from your bed!', found: 'From the bed! Well done!' },
      { img: I('sofa'), label: 'sofa', ask: 'Find a cushion from the sofa!', found: 'From the sofa! Yes!' },
    ],
  },
  '6-3': {
    who: 'leo', bg: BG('u6l3-house-empty'), walker: C('leo-happy'),
    bank: [w('bed', I('bed'), 'The bed is in the bedroom.'), w('table', I('table'), 'The table is in the kitchen.'), w('sofa', I('sofa'), 'The sofa is in the living room.'), w('chair', I('chair'), 'The chair is in the kitchen.'), w('bedroom', I('room-bedroom'), 'This is the bedroom.'), w('kitchen', I('room-kitchen'), 'This is the kitchen.')],
    extras: ['flip', 'hunt'],
    hunt: [
      { img: I('table'), label: 'table', ask: 'Touch a table! Say: table!', found: 'A table! Super!' },
      { img: I('chair'), label: 'chair', ask: 'Sit on a chair! Say: chair!', found: 'A chair! Well done!' },
      { img: I('bed'), label: 'bed', ask: 'Show me a pillow from your bed!', found: 'From the bed! Great!' },
      { img: I('door'), label: 'door', ask: 'Find a door! Knock, knock!', found: 'Knock, knock! A door!' },
    ],
  },
  '6-4': {
    who: 'bella', bg: BG('u6l4-bedroom-empty'), walker: C('bella-happy'),
    bank: [w('red bed', I('bed-red'), 'My bed is red!'), w('blue chair', I('chair-blue'), 'My chair is blue!'), w('green sofa', I('sofa-green'), 'My sofa is green!'), w('green bed', I('bed-green'), 'My bed is green!'), w('yellow chair', I('chair-yellow'), 'My chair is yellow!'), w('blue sofa', I('sofa-blue'), 'My sofa is blue!')],
    extras: ['board', 'flip', 'hunt'],
    hunt: [
      { img: I('bed-red'), label: 'red', ask: 'Find something RED in your house!', found: 'It is red! Super!' },
      { img: I('chair-blue'), label: 'blue', ask: 'Find something BLUE!', found: 'It is blue! Great!' },
      { img: I('sofa-green'), label: 'green', ask: 'Find something GREEN!', found: 'It is green! Well done!' },
      { img: I('chair-yellow'), label: 'yellow', ask: 'Find something YELLOW!', found: 'It is yellow! Yes!' },
    ],
  },
  '6-5': {
    who: 'pip', bg: BG('u6l5-street'), walker: C('pip-happy'),
    bank: [w('red door', I('u6l5-door-red'), "It's a red door!"), w('blue door', I('u6l5-door-blue'), "It's a blue door!"), w('yellow door', I('u6l5-door-yellow'), "It's a yellow door!"), w('red bed', I('bed-red'), "It's a red bed!"), w('blue chair', I('chair-blue'), "It's a blue chair!"), w('green sofa', I('sofa-green'), "It's a green sofa!")],
    extras: ['flip', 'board', 'spin'],
  },
  '6-6': {
    who: 'mia', bg: BG('u6l6-gamenight'), walker: C('mia-happy'),
    bank: [w('table', I('table'), "It's a table!"), w('chair', I('chair'), "It's a chair!"), w('sofa', I('sofa'), "It's a sofa!"), w('bed', I('bed'), "It's a bed!"), w('door', I('door'), "It's a door!"), w('kitchen', I('room-kitchen'), "It's the kitchen!")],
    extras: [{ kind: 'shadow' }, 'board', 'hunt', 'flip'],
    hunt: [
      { img: I('room-kitchen'), label: 'kitchen', ask: 'Find a spoon from the kitchen!', found: 'A spoon! From the kitchen!' },
      { img: I('chair'), label: 'chair', ask: 'Point to a chair! Say: It\'s a chair!', found: 'It\'s a chair! Super!' },
      { img: I('bed-red'), label: 'red', ask: 'Find something red at home!', found: 'It is red! Great!' },
      { img: I('house'), label: 'house', ask: 'Draw a house in the air with your finger!', found: 'What a house! Well done!' },
    ],
  },
  '7-1': {
    who: 'pip', bg: BG('u7l1-petshop-empty'), walker: C('pip-happy'),
    bank: pets,
    extras: ['board', 'hunt', 'flip', 'spin'],
    hunt: [
      { img: I('dog'), label: 'dog', ask: 'Find a toy animal at home!', found: 'What is it? Say it!' },
      { img: I('dog'), label: 'dog', ask: 'Be a dog! Woof, woof!', found: 'Woof! A dog! Super!' },
      { img: I('cat'), label: 'cat', ask: 'Be a cat! Meow!', found: 'Meow! A cat! Great!' },
      { img: I('bird'), label: 'bird', ask: 'Be a bird! Flap your wings! Tweet!', found: 'Tweet! A bird! Yes!' },
    ],
  },
  '7-2': {
    who: 'mia', bg: BG('u7l2-farm-empty'), walker: C('mia-happy'),
    bank: [...farmAnimals, ...pets],
    extras: ['board', 'hunt', 'flip', 'spin'],
    hunt: [
      { img: I('cow'), label: 'cow', ask: 'Be a cow! Moo!', found: 'Moo! A cow! Super!' },
      { img: I('pig'), label: 'pig', ask: 'Be a pig! Oink!', found: 'Oink! A pig! Great!' },
      { img: I('sheep'), label: 'sheep', ask: 'Find something soft and white, like a sheep!', found: 'Soft like a sheep! Baa!' },
      { img: I('dog'), label: 'toy', ask: 'Find a toy animal! Farm or pet?', found: 'Say what it is!' },
    ],
  },
  '7-3': {
    who: 'leo', bg: BG('u7l3-pond-empty'), walker: C('leo-happy'),
    bank: [...pondAnimals, ...farmAnimals],
    extras: ['board', 'hunt', 'flip', 'spin'],
    hunt: [
      { img: I('horse'), label: 'horse', ask: 'Gallop like a horse! Neigh!', found: 'Neigh! A horse! Super!' },
      { img: I('hen'), label: 'chicken', ask: 'Flap like a chicken! Cluck, cluck!', found: 'Cluck! A chicken! Great!' },
      { img: I('farm-duck'), label: 'duck', ask: 'Waddle like a duck! Quack!', found: 'Quack! A duck! Yes!' },
      { img: I('cow'), label: 'cow', ask: 'Find a toy animal and say what it is!', found: 'What is it? Say it!' },
    ],
  },
  '7-4': {
    who: 'pip', bg: BG('u7l4-fair-empty'), walker: C('pip-happy'),
    bank: [w('cow', I('cow'), "What animal is this? It's a cow!"), w('cat', I('cat'), "What animal is this? It's a cat!"), w('horse', I('horse'), "What animal is this? It's a horse!"), w('dog', I('dog'), "What animal is this? It's a dog!"), w('pig', I('pig'), "What animal is this? It's a pig!"), w('duck', I('farm-duck'), "What animal is this? It's a duck!")],
    extras: [{ kind: 'rapid' }, 'board', 'hunt', 'flip', 'spin'],
    board: { title: 'Animal Board! Roll and ask!', ask: 'What animal is this?', done: 'You know all the animals!' },
    hunt: [
      { img: I('cat'), label: 'animal', ask: 'Find a toy animal! What animal is it?', found: 'Say: It\'s a …!' },
      { img: I('horse'), label: 'horse', ask: 'Act like a horse! Neigh!', found: 'Neigh! A horse!' },
      { img: I('pig'), label: 'pig', ask: 'Act like a pig! Oink!', found: 'Oink! A pig!' },
      { img: I('farm-duck'), label: 'duck', ask: 'Act like a duck! Quack!', found: 'Quack! A duck!' },
    ],
  },
  '7-5': {
    who: 'mia', bg: BG('u7l5-yard'), walker: C('mia-happy'),
    bank: [w('cow', I('cow'), "Moo! Moo! It's a cow!"), w('pig', I('pig'), "Oink! Oink! It's a pig!"), w('sheep', I('sheep'), "Baa! Baa! It's a sheep!"), w('duck', I('farm-duck'), "Quack! Quack! It's a duck!"), w('horse', I('horse'), "Neigh! It's a horse!"), w('dog', I('dog'), "Woof! It's a dog!")],
    extras: ['board', 'flip', 'hunt'],
    hunt: [
      { img: I('cow'), label: 'cow', ask: 'Moo like a cow, really loud!', found: 'Moo! Super cow!' },
      { img: I('sheep'), label: 'sheep', ask: 'Baa like a sheep, really soft!', found: 'Baa! Great sheep!' },
      { img: I('pig'), label: 'pig', ask: 'Find something pink at home!', found: 'Pink like a pig! Oink!' },
      { img: I('farm-duck'), label: 'duck', ask: 'Find something yellow at home!', found: 'Yellow like a duck! Quack!' },
    ],
  },
  '7-6': {
    who: 'leo', bg: BG('u7l6-night-farm'), walker: C('leo-happy'),
    bank: [w('cow', I('cow'), "Moo! It's a cow!"), w('horse', I('horse'), "Neigh! It's a horse!"), w('chicken', I('hen'), "Cluck! It's a chicken!"), w('cat', I('cat'), "Meow! It's a cat!"), w('dog', I('dog'), "Woof! It's a dog!"), w('sheep', I('sheep'), "Baa! It's a sheep!")],
    extras: [{ kind: 'tile' }, 'board', 'spin', 'hunt'],
    board: { title: 'Animal Sounds Board!', ask: 'What does it say? Say it!', done: 'You are an animal sounds champion!' },
    hunt: [
      { img: I('cow'), label: 'cow', ask: 'Make a cow sound!', found: 'Moo! Great!' },
      { img: I('cat'), label: 'cat', ask: 'Make a cat sound!', found: 'Meow! Great!' },
      { img: I('dog'), label: 'dog', ask: 'Make a dog sound!', found: 'Woof! Great!' },
      { img: I('hen'), label: 'chicken', ask: 'Make a chicken sound!', found: 'Cluck! Great!' },
    ],
  },
  '8-1': {
    who: 'pip', bg: BG('u8l1-picnic-empty'), walker: C('pip-happy'),
    bank: [w('apple', I('apple'), "It's an apple!"), w('banana', I('banana'), "It's a banana!"), w('milk', I('milk'), "It's milk!"), w('cow', I('cow'), "It's a cow!"), w('cat', I('cat'), "It's a cat!"), w('duck', I('farm-duck'), "It's a duck!")],
    extras: ['board', 'hunt', 'flip', 'spin'],
    hunt: [
      { img: I('apple'), label: 'apple', ask: 'Find an apple, or something red you can eat!', found: 'Yummy! Say: apple!' },
      { img: I('banana'), label: 'banana', ask: 'Find something yellow you can eat!', found: 'Yellow! Banana? Great!' },
      { img: I('milk'), label: 'milk', ask: 'Find a cup for milk!', found: 'A cup for milk! Super!' },
      { img: I('banana'), label: 'banana', ask: 'Peel a pretend banana! Yum!', found: 'Yum, yum! Banana!' },
    ],
  },
  '8-2': {
    who: 'mia', bg: BG('u8l2-cafe-empty'), walker: C('mia-happy'),
    bank: [w('bread', I('bread'), "It's bread!"), w('water', I('water-glass'), "It's water!"), w('juice', I('juice'), "It's juice!"), w('apple', I('apple'), "It's an apple!"), w('banana', I('banana'), "It's a banana!"), w('milk', I('milk'), "It's milk!")],
    extras: ['board', 'hunt', 'flip', 'spin'],
    hunt: [
      { img: I('water-glass'), label: 'water', ask: 'Find a glass or a cup for water!', found: 'Water, please! Super!' },
      { img: I('bread'), label: 'bread', ask: 'Find something you eat for breakfast!', found: 'Yummy! What is it? Say it!' },
      { img: I('juice'), label: 'juice', ask: 'Pretend to drink juice! Slurp!', found: 'Mmm, juice! Great!' },
      { img: I('apple'), label: 'fruit', ask: 'Find a fruit at home!', found: 'Yummy! What is it? Say it!' },
    ],
  },
  '8-3': {
    who: 'leo', bg: BG('u8l3-party-empty'), walker: C('leo-happy'),
    bank: [w('pizza', I('pizza-slice'), "It's pizza!"), w('cake', I('cake'), "It's cake!"), w('ice cream', I('ice-cream'), "It's ice cream!"), w('bread', I('bread'), "It's bread!"), w('juice', I('juice'), "It's juice!"), w('water', I('water-glass'), "It's water!")],
    extras: ['board', 'flip', 'spin'],
  },
  '8-4': {
    who: 'bella', bg: BG('u8l4-orchard-empty'), walker: C('bella-happy'),
    bank: [w('apples', I('apple'), 'I like apples!'), w('bananas', I('banana'), 'I like bananas!'), w('oranges', I('orange'), 'I like oranges!'), w('grapes', I('grapes'), 'I like grapes!'), w('milk', I('milk'), 'I like milk!'), w('cake', I('cake'), 'I like cake!')],
    extras: ['board', 'hunt', 'flip', 'spin', { kind: 'roleplay', cast: ['bella', 'leo'], script: [
      { who: 'bella', line: 'I like apples!', repeat: true }, { who: 'leo', line: 'I like bananas!', repeat: true },
      { who: 'bella', line: 'I like grapes!', repeat: true }, { who: 'leo', line: 'I like oranges!', repeat: true },
    ] }],
    flip: 'Flip a card! Say: I like …!',
    hunt: [
      { img: I('apple'), label: 'fruit', ask: 'Find a fruit you like!', found: 'Say: I like …!' },
      { img: I('orange'), label: 'orange', ask: 'Find something orange!', found: 'Orange! Great!' },
      { img: I('grapes'), label: 'grapes', ask: 'Find something green or purple!', found: 'Like grapes! Super!' },
      { img: I('cake'), label: 'cake', ask: 'Show me your favourite food — or draw it in the air!', found: 'Say: I like …! Yum!' },
    ],
  },
  '8-5': {
    who: 'pip', bg: BG('u8l5-garden-empty'), walker: C('pip-happy'),
    bank: [w('caterpillar', I('caterpillar'), "It's a caterpillar!"), w('apples', I('apple'), 'I like apples!'), w('bread', I('bread'), 'I like bread!'), w('cake', I('cake'), 'I like cake!'), w('butterfly', I('butterfly'), "It's a butterfly!"), w('leaf', I('leaf'), "It's a leaf!")],
    extras: ['board', 'hunt', 'spin'],
    hunt: [
      { img: I('caterpillar'), label: 'caterpillar', ask: 'Wiggle like a caterpillar!', found: 'Wiggle, wiggle! Super!' },
      { img: I('leaf'), label: 'leaf', ask: 'Find something green, like a leaf!', found: 'Green! Great!' },
      { img: I('apple'), label: 'apple', ask: 'Find a food the caterpillar likes!', found: 'Munch, munch! Say: I like …!' },
      { img: I('butterfly'), label: 'butterfly', ask: 'Fly like a butterfly!', found: 'A beautiful butterfly!' },
    ],
  },
  '8-6': {
    who: 'mia', bg: BG('u8l6-dining'), walker: C('mia-happy'),
    bank: [w('apple', I('apple'), "It's an apple!"), w('banana', I('banana'), "It's a banana!"), w('bread', I('bread'), "It's bread!"), w('pizza', I('pizza-slice'), "It's pizza!"), w('ice cream', I('ice-cream'), "It's ice cream!"), w('juice', I('juice'), "It's juice!")],
    extras: [{ kind: 'shadow' }, 'board', 'flip', 'hunt'],
    hunt: [
      { img: I('apple'), label: 'apple', ask: 'Find something you can eat!', found: 'Yummy! What is it?' },
      { img: I('juice'), label: 'juice', ask: 'Find something you can drink from!', found: 'A cup! Super!' },
      { img: I('pizza-slice'), label: 'pizza', ask: 'Draw a pizza in the air!', found: 'What a pizza! Yum!' },
      { img: I('ice-cream'), label: 'ice cream', ask: 'Pretend to lick an ice cream!', found: 'Mmm! Cold and yummy!' },
    ],
  },
  '9-1': {
    who: 'bella', bg: BG('u9l1-laundry-empty'), walker: C('bella-happy'),
    bank: [w('shirt', I('shirt-red'), "It's a shirt! A red shirt!"), w('pants', I('pants-blue'), 'Pants! Blue pants!'), w('dress', I('dress-yellow'), "It's a dress! A yellow dress!"), w('shoes', I('shoes-blue'), 'Shoes! Blue shoes!')],
    extras: ['board', 'hunt', 'flip'],
    hunt: [
      { img: I('shirt-red'), label: 'shirt', ask: 'Find a shirt! What colour is it?', found: 'A shirt! Say the colour!' },
      { img: I('pants-blue'), label: 'pants', ask: 'Find some pants!', found: 'Pants! Great!' },
      { img: I('socks-red'), label: 'socks', ask: 'Find a sock!', found: 'A sock! Super!' },
      { img: I('shirt-red'), label: 'red', ask: 'Find something red to wear!', found: 'Red! Well done!' },
    ],
  },
  '9-2': {
    who: 'mia', bg: BG('u9l2-hall-empty'), walker: C('mia-happy'),
    bank: [w('hat', I('hat-green'), "It's a hat! A green hat!"), w('socks', I('socks-red'), 'Socks! Red socks!'), w('shoes', I('shoes-blue'), 'Shoes! Blue shoes!'), w('shirt', I('shirt-red'), "It's a shirt!"), w('pants', I('pants-blue'), 'Pants!'), w('dress', I('dress-yellow'), "It's a dress!")],
    extras: [{ kind: 'shadow' }, 'board', 'hunt', 'flip', 'spin'],
    hunt: [
      { img: I('hat-green'), label: 'hat', ask: 'Find a hat! Put it on!', found: 'A hat! Super!' },
      { img: I('socks-red'), label: 'socks', ask: 'Show me your socks!', found: 'Socks! Great!' },
      { img: I('shoes-blue'), label: 'shoes', ask: 'Find your shoes!', found: 'Shoes! Well done!' },
      { img: I('hat-green'), label: 'head', ask: 'Touch your head — a hat goes here!', found: 'On your head! Yes!' },
    ],
  },
  '9-3': {
    who: 'leo', bg: BG('u9l3-shop'), walker: C('leo-happy'),
    bank: [w('coat', I('coat-blue'), "It's a coat! A blue coat!"), w('skirt', I('skirt-pink'), "It's a skirt! A pink skirt!"), w('T-shirt', I('tshirt-yellow'), "It's a T-shirt! A yellow T-shirt!"), w('hat', I('hat-green'), "It's a hat!"), w('socks', I('socks-red'), 'Socks!'), w('shoes', I('shoes-blue'), 'Shoes!')],
    extras: [{ kind: 'pattern' }, 'board', 'flip', 'hunt'],
    hunt: [
      { img: I('coat-blue'), label: 'coat', ask: 'Find a coat or a jacket!', found: 'A coat! Super!' },
      { img: I('tshirt-yellow'), label: 'T-shirt', ask: 'Find a T-shirt!', found: 'A T-shirt! Great!' },
      { img: I('skirt-pink'), label: 'pink', ask: 'Find something pink!', found: 'Pink! Well done!' },
      { img: I('coat-blue'), label: 'zip', ask: 'Pretend to put on a coat! Zip!', found: 'Zip! Warm and cosy!' },
    ],
  },
  '9-4': {
    who: 'bella', bg: BG('u9l4-stage'), walker: C('bella-happy'),
    bank: [w('yellow dress', I('dress-yellow'), "I'm wearing a yellow dress!"), w('green hat', I('hat-green'), "I'm wearing a green hat!"), w('red shirt', I('shirt-red'), "I'm wearing a red shirt!"), w('blue shoes', I('shoes-blue'), "I'm wearing blue shoes!"), w('red socks', I('socks-red'), "I'm wearing red socks!"), w('blue coat', I('coat-blue'), "I'm wearing a blue coat!")],
    extras: ['board', 'hunt', 'flip', 'spin'],
    flip: 'Flip a card! Say: I\'m wearing …!',
    hunt: [
      { img: I('shirt-red'), label: 'wearing', ask: 'Look at your clothes! Say: I\'m wearing …!', found: 'Great sentence!' },
      { img: I('hat-green'), label: 'hat', ask: 'Put on a hat or a cap!', found: 'Say: I\'m wearing a hat!' },
      { img: I('socks-red'), label: 'socks', ask: 'Show me your socks! What colour?', found: 'Say: I\'m wearing … socks!' },
      { img: I('coat-blue'), label: 'coat', ask: 'Put on a coat or a jacket!', found: 'Say: I\'m wearing a coat!' },
    ],
  },
  '9-5': {
    who: 'pip', bg: BG('u9l5-garden-empty'), walker: C('pip-happy'),
    bank: [w('red', I('socks-red'), 'My socks are red!'), w('blue', I('shoes-blue'), 'My shoes are blue!'), w('green', I('hat-green'), 'My hat is green!'), w('yellow', I('dress-yellow'), 'The dress is yellow!'), w('white', P('u9l5', 1), 'My shoes are white!'), w('brown', P('u9l5', 7), 'My shoes are brown!')],
    extras: ['board', 'flip', 'hunt'],
    hunt: [
      { img: I('shoes-blue'), label: 'shoes', ask: 'Find your shoes! What colour are they?', found: 'Say: My shoes are …!' },
      { img: P('u9l5', 1), label: 'white', ask: 'Find something white!', found: 'White! Great!' },
      { img: P('u9l5', 3), label: 'red', ask: 'Find something red!', found: 'Red! Super!' },
      { img: P('u9l5', 1), label: 'walk', ask: 'Walk in your shoes! Step, step!', found: 'Step, step! Well done!' },
    ],
  },
  '9-6': {
    who: 'mia', bg: BG('u9l6-playroom-empty'), walker: C('mia-happy'),
    bank: [w('hat', I('hat-green'), "It's a hat!"), w('coat', I('coat-blue'), "It's a coat!"), w('dress', I('dress-yellow'), "It's a dress!"), w('skirt', I('skirt-pink'), "It's a skirt!"), w('shoes', I('shoes-blue'), 'They are shoes!'), w('socks', I('socks-red'), 'They are socks!')],
    extras: [{ kind: 'shadow' }, 'board', 'hunt', 'flip', 'spin'],
    hunt: [
      { img: I('hat-green'), label: 'hat', ask: 'Find something to wear on your head!', found: 'On your head! Super!' },
      { img: I('shoes-blue'), label: 'shoes', ask: 'Find something to wear on your feet!', found: 'On your feet! Great!' },
      { img: I('coat-blue'), label: 'coat', ask: 'Find something warm to wear!', found: 'Warm and cosy! Well done!' },
      { img: I('dress-yellow'), label: 'colour', ask: 'Find clothes in your favourite colour!', found: 'What colour? Say it!' },
    ],
  },
  '10-1': {
    who: 'pip', bg: BG('u10l1-track-empty'), walker: C('pip-happy'),
    bank: [w('run', I('pip-run'), 'Run! I run fast!'), w('jump', I('pip-jump'), 'Jump! I jump high!'), w('walk', I('pip-walk'), 'Walk! I walk slowly.'), w('hat', I('hat-green'), "It's a hat!"), w('coat', I('coat-blue'), "It's a coat!")],
    extras: ['board', 'hunt', 'flip', 'spin'],
    hunt: [
      { img: I('pip-run'), label: 'run', ask: 'Run on the spot! Fast, fast!', found: 'Say: I run fast!' },
      { img: I('pip-jump'), label: 'jump', ask: 'Jump three times! One, two, three!', found: 'Say: I jump high!' },
      { img: I('pip-walk'), label: 'walk', ask: 'Walk slowly to the door and back!', found: 'Say: I walk slowly!' },
      { img: I('shoes-blue'), label: 'shoes', ask: 'Find your running shoes!', found: 'Ready to run! Great!' },
    ],
  },
  '10-2': {
    who: 'mia', bg: BG('u10l2-beach-empty'), walker: C('mia-happy'),
    bank: [w('swim', G('u10l2-swim'), 'Swim! I can swim!'), w('dance', G('u10l2-dance'), 'Dance! I can dance!'), w('sing', G('u10l2-sing'), 'Sing! I can sing!'), w('run', I('pip-run'), 'Run! I can run!'), w('jump', I('pip-jump'), 'Jump! I can jump!'), w('walk', I('pip-walk'), 'Walk! I can walk!')],
    extras: [{ kind: 'sort', left: { label: 'on the stage', img: G('u10l2-dance') }, right: { label: 'in the water', img: G('u10l2-swim') }, items: [
      { ...w('dance', G('u10l2-dance'), 'I can dance!'), target: 'left' }, { ...w('swim', G('u10l2-swim'), 'I can swim!'), target: 'right' },
      { ...w('sing', G('u10l2-sing'), 'I can sing!'), target: 'left' }, { ...w('fish', I('fish'), "It's a fish!"), target: 'right' },
      { ...w('drum', I('drum'), "It's a drum!"), target: 'left' }, { ...w('whale', I('whale'), "It's a whale!"), target: 'right' },
    ] }, 'board', 'flip', 'spin'],
  },
  '10-3': {
    who: 'leo', bg: BG('u10l3-camp-empty'), walker: C('leo-happy'),
    bank: [w('clap', I('leo-clap'), 'Clap! I clap my hands!'), w('play', I('leo-play'), 'Play! I play with my ball!'), w('sleep', I('leo-sleep'), 'Sleep! Shh, I sleep.'), w('swim', G('u10l2-swim'), 'I can swim!'), w('dance', G('u10l2-dance'), 'I can dance!'), w('sing', G('u10l2-sing'), 'I can sing!')],
    extras: ['board', 'hunt', 'flip', 'spin'],
    hunt: [
      { img: I('leo-clap'), label: 'clap', ask: 'Clap your hands five times!', found: 'Say: I clap my hands!' },
      { img: I('leo-play'), label: 'ball', ask: 'Find a ball or a toy to play with!', found: 'Say: I play with my ball!' },
      { img: I('leo-sleep'), label: 'pillow', ask: 'Find a pillow! Pretend to sleep! Shh!', found: 'Shh… wake up! Great!' },
      { img: G('u10l2-dance'), label: 'dance', ask: 'Dance! Then freeze!', found: 'Say: I can dance!' },
    ],
  },
  '10-4': {
    who: 'pip', bg: BG('u10l4-circus-empty'), walker: C('pip-happy'),
    bank: [w('fish', I('fish'), 'Can a fish swim? Yes, it can!'), w('bird', I('bird'), 'Can a bird fly? Yes, it can!'), w('frog', I('frog'), 'Can a frog jump? Yes, it can!'), w('dog', I('dog'), 'Can a dog run? Yes, it can!'), w('snake', I('snake'), "Can a snake fly? No, it can't!"), w('cat', I('cat'), 'Can a cat jump? Yes, it can!')],
    extras: [{ kind: 'secret' }, 'board', 'hunt', 'flip', 'spin'],
    hunt: [
      { img: G('u10l2-swim'), label: 'swim', ask: 'Can you swim? Show me!', found: 'Say: Yes, I can! or No, I can\'t!' },
      { img: I('pip-jump'), label: 'jump', ask: 'Can you jump? Jump!', found: 'Say: Yes, I can!' },
      { img: I('bird'), label: 'fly', ask: 'Can you fly? Try! Flap!', found: 'Say: No, I can\'t! Ha ha!' },
      { img: G('u10l2-dance'), label: 'dance', ask: 'Can you dance? Show me!', found: 'Say: Yes, I can!' },
    ],
  },
  '10-5': {
    who: 'mia', bg: BG('u10l5-trail-empty'), walker: C('mia-happy'),
    bank: [w('he', P('u10l5', 4), 'He can jump!'), w('she', P('u10l5', 6), 'She can swim!'), w('it', P('u10l5', 7), 'It can fly!'), w('they', P('u10l5', 2), 'They can walk!'), w('frog', P('u10l5', 3), 'It can jump!'), w('fish', P('u10l5', 5), 'It can swim!')],
    extras: ['board', 'flip', 'spin'],
  },
  '10-6': {
    who: 'leo', bg: BG('u10l6-games-night-empty'), walker: C('leo-happy'),
    bank: [w('run', G('u10l1-run'), 'I can run!'), w('swim', G('u10l2-swim'), 'I can swim!'), w('dance', G('u10l2-dance'), 'I can dance!'), w('sing', G('u10l2-sing'), 'I can sing!'), w('sleep', I('leo-sleep'), 'I can sleep!'), w('jump', G('u10l1-jump'), 'I can jump!')],
    extras: [{ kind: 'tile' }, { kind: 'shadow' }, 'board', 'hunt', 'flip'],
    hunt: [
      { img: G('u10l1-run'), label: 'run', ask: 'Run on the spot!', found: 'Say: I can run!' },
      { img: G('u10l2-sing'), label: 'sing', ask: 'Sing a song! La, la, la!', found: 'Say: I can sing!' },
      { img: I('leo-sleep'), label: 'sleep', ask: 'Pretend to sleep! Snore!', found: 'Say: I can sleep!' },
      { img: G('u10l1-jump'), label: 'jump', ask: 'Jump like a frog!', found: 'Say: I can jump!' },
    ],
  },
  '10-7': {
    who: 'pip', bg: BG('u10l7-hero-academy-empty'), walker: C('pip-happy'),
    bank: [w('I', G('u10l1-run'), 'I can run!'), w('he', G('u10l1-jump'), 'He can jump!'), w('she', G('u10l2-dance'), 'She can dance!'), w('it', I('bird-fly'), 'It can fly!'), w('swim', G('u10l2-swim'), 'I can swim!'), w('sleep', I('leo-sleep'), 'He can sleep!')],
    extras: ['board', 'hunt', 'flip', 'spin', { kind: 'roleplay', cast: ['pip', 'mia', 'leo'], script: [
      { who: 'pip', line: 'I can run!', repeat: true }, { who: 'mia', line: 'I can dance!', repeat: true },
      { who: 'leo', line: 'I can jump!', repeat: true }, { who: 'pip', line: 'We are action heroes!', repeat: true },
    ] }],
    board: { title: 'Hero Board! Roll and say!', done: 'You are an action hero!' },
    hunt: [
      { img: G('u10l1-run'), label: 'run', ask: 'Hero training: run on the spot!', found: 'Say: I can run!' },
      { img: G('u10l1-jump'), label: 'jump', ask: 'Hero training: jump high!', found: 'Say: I can jump!' },
      { img: G('u10l2-dance'), label: 'dance', ask: 'Hero training: dance!', found: 'Say: I can dance!' },
      { img: I('bird-fly'), label: 'fly', ask: 'Hero training: flap like a bird!', found: 'Say: It can fly! I can run!' },
    ],
  },
};

export const EXTRA_PRACTICE: Record<string, Scene[]> = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [k, build(k, p)]));

/** The shared Pre-A1 goodbye song (lessons that ended without one: owner 2026-10-12 "there is no goodbye song at the end"). */
export function goodbyeSong(id: string, bg: string): Scene {
  return {
    id, kind: 'song', bg, title: '\u{1F44B} Goodbye Song \u{1F44B}', teacher: 'Wave goodbye! Sing along together.',
    durationSeconds: 20, bigWord: 'Goodbye', songUrl: '/lep1/audio/goodbye-song.mp3?v=3',
    lineDurationsMs: [3580, 4020, 4980, 7482],
    lyrics: [
      { who: 'bella', text: '\u{1F44B} Goodbye, goodbye, goodbye my friend', emotion: 'happy' },
      { who: 'willow', text: '\u{1F44B} Goodbye, goodbye, see you again', emotion: 'happy' },
      { who: 'leo', text: '\u{1F590}️ Wave your hand and say goodbye', emotion: 'happy' },
      { who: 'mia', text: '\u{1F496} Byeeee, friend! See you soon!', emotion: 'happy' },
    ],
  } as Scene;
}
