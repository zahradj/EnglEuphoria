/**
 * The Playground (ages 4-9) placement item bank: Pre-A1 / A1 / A2 for children, many of whom cannot read yet.
 *
 * Design (see docs/placement-kids-research.md):
 *  - Two separate abilities are measured, because a child can understand a lot of English and still not read it:
 *      LISTENING (stage 'listen'): the child hears Pip's spoken instruction and taps one of three pictures. No reading.
 *      LITERACY  (stage 'literacy'): letter names, letter sounds, then words and sentences to read, matched to pictures.
 *  - Every instruction is spoken (a saved clip), every answer is a tap on a picture, letter or word. Three options per item
 *    (the Cambridge Starters format). Letter names and sounds use the real recorded phonics clips, never text-to-speech.
 *  - `difficulty` bands: listening Pre-A1 0.05-0.30, A1 0.30-0.55, A2 0.55-0.80; literacy letters 0.08-0.45, words 0.35-0.58,
 *    sentences 0.55-0.80. They are expert estimates, to be refined from real children's answers.
 *  - All pictures are existing static art (public/lep1/items, public/placement) or drawn in code (SceneArt): nothing is generated live.
 */

export type KidsLevel = 'Pre-A1' | 'A1' | 'A2';
export type KidsStage = 'listen' | 'literacy';

export type ScenePrep = 'on' | 'under' | 'in' | 'behind' | 'beside' | 'front';
export type SceneSpec = {
  ref: 'table' | 'box';
  prep: ScenePrep;
  subject: string;
  /** Optional second picture with its own position (for "the dog is under and the ball is on the table" scenes). */
  extra?: { src: string; prep: ScenePrep };
};

export type KidsOption =
  | { kind: 'img'; src: string; label: string; scale?: number }
  | { kind: 'letter'; text: string }
  | { kind: 'count'; src: string; n: number; label: string }
  | { kind: 'scene'; scene: SceneSpec; label: string }
  | { kind: 'mark'; ok: boolean }
  | { kind: 'pair'; srcs: [string, string]; label: string; ordered?: boolean };

export interface KidsItem {
  id: string;
  stage: KidsStage;
  topic: string;
  level: KidsLevel;
  difficulty: number;
  /** What Pip says (a saved clip made by the bake script). Never shown as text to the child. */
  line: string;
  /** A real recorded clip played after Pip's line (letter name or letter sound). */
  clip?: { type: 'name' | 'sound'; letter: string };
  /** Something shown to read or look at above the options. */
  shown?:
    | { kind: 'word' | 'sentence'; text: string }
    | { kind: 'picture'; src: string; label: string }
    | { kind: 'scene'; scene: SceneSpec; label: string };
  options: KidsOption[];
  correct: number;
  practice?: boolean;
}

const I = (name: string) => `/lep1/items/item-${name}.png`;
const P = (name: string) => `/placement/${name}.png`;
const img = (src: string, label: string, scale?: number): KidsOption => ({ kind: 'img', src, label, scale });
const letters = (...t: string[]): KidsOption[] => t.map((text) => ({ kind: 'letter', text }));
const scene = (s: SceneSpec, label: string): KidsOption => ({ kind: 'scene', scene: s, label });

export const KIDS_PICTURES = {
  cat: I('cat'), dog: I('dog'), apple: I('apple'), ball: I('ball'), ballRed: I('ball-red'), ballBlue: I('ball-blue'), ballYellow: I('ball-yellow'),
  car: I('car'), carRed: I('car-red'), carGreen: I('car-green'), house: I('house'), sun: I('sun'), moon: I('moon'), book: I('book'),
  hat: I('hat'), duck: I('duck-yellow'), frog: I('frog'), elephant: I('elephant'), bear: I('bear'), grapes: I('grapes'), carrot: I('carrot'),
  kite: I('kite'), teddy: I('teddy'), doll: I('doll'), milk: I('milk'), bag: I('bag'), key: I('key'), egg: I('egg'), ship: I('ship'),
  door: I('door'), tree: I('tree'), plane: I('plane'), train: I('train'), clock: I('clock'), ant: I('ant'), shoe: I('shoe'),
  banana: P('banana'), rabbit: P('rabbit'), bird: P('bird'), star: P('star'), cloud: P('cloud'),
  jumping: P('jumping'), running: P('running'), sleeping: P('sleeping'), standing: P('standing'),
} as const;
const K = KIDS_PICTURES;

/** Items shown first, not scored. */
export const KIDS_PRACTICE: KidsItem[] = [
  { id: 'kp-1', stage: 'listen', topic: 'practice', level: 'Pre-A1', difficulty: 0.02, practice: true, line: "Let's practice! Tap the cat.", options: [img(K.cat, 'cat'), img(K.ball, 'ball'), img(K.apple, 'apple')], correct: 0 },
  { id: 'kp-2', stage: 'listen', topic: 'practice', level: 'Pre-A1', difficulty: 0.02, practice: true, line: 'Now tap the apple.', options: [img(K.dog, 'dog'), img(K.apple, 'apple'), img(K.book, 'book')], correct: 1 },
];

export const KIDS_LITERACY_PRACTICE: KidsItem = {
  id: 'kp-3', stage: 'literacy', topic: 'practice', level: 'Pre-A1', difficulty: 0.02, practice: true,
  line: 'Tap the letter A.', clip: { type: 'name', letter: 'a' }, options: letters('A', 'O', 'T'), correct: 0,
};

// ---------------------------------------------------------------- LISTENING (no reading)
export const KIDS_LISTEN: KidsItem[] = [
  // ---- words (Pre-A1)
  { id: 'kl-w01', stage: 'listen', topic: 'animals', level: 'Pre-A1', difficulty: 0.05, line: 'Tap the dog.', options: [img(K.sun, 'sun'), img(K.dog, 'dog'), img(K.book, 'book')], correct: 1 },
  { id: 'kl-w02', stage: 'listen', topic: 'toys', level: 'Pre-A1', difficulty: 0.06, line: 'Tap the ball.', options: [img(K.ball, 'ball'), img(K.house, 'house'), img(K.cat, 'cat')], correct: 0 },
  { id: 'kl-w03', stage: 'listen', topic: 'food', level: 'Pre-A1', difficulty: 0.08, line: 'Tap the banana.', options: [img(K.car, 'car'), img(K.hat, 'hat'), img(K.banana, 'banana')], correct: 2 },
  { id: 'kl-w04', stage: 'listen', topic: 'home', level: 'Pre-A1', difficulty: 0.1, line: 'Tap the house.', options: [img(K.house, 'house'), img(K.apple, 'apple'), img(K.duck, 'duck')], correct: 0 },
  { id: 'kl-w05', stage: 'listen', topic: 'animals', level: 'Pre-A1', difficulty: 0.12, line: 'Tap the duck.', options: [img(K.milk, 'milk'), img(K.duck, 'duck'), img(K.book, 'book')], correct: 1 },
  { id: 'kl-w06', stage: 'listen', topic: 'transport', level: 'Pre-A1', difficulty: 0.14, line: 'Tap the car.', options: [img(K.cat, 'cat'), img(K.banana, 'banana'), img(K.car, 'car')], correct: 2 },
  { id: 'kl-w07', stage: 'listen', topic: 'animals', level: 'Pre-A1', difficulty: 0.18, line: 'Tap the frog.', options: [img(K.cat, 'cat'), img(K.frog, 'frog'), img(K.dog, 'dog')], correct: 1 },
  { id: 'kl-w08', stage: 'listen', topic: 'toys', level: 'Pre-A1', difficulty: 0.2, line: 'Tap the teddy bear.', options: [img(K.doll, 'doll'), img(K.ball, 'ball'), img(K.teddy, 'teddy bear')], correct: 2 },
  { id: 'kl-w09', stage: 'listen', topic: 'animals', level: 'Pre-A1', difficulty: 0.22, line: 'Tap the rabbit.', options: [img(K.dog, 'dog'), img(K.rabbit, 'rabbit'), img(K.cat, 'cat')], correct: 1 },
  { id: 'kl-w10', stage: 'listen', topic: 'food', level: 'Pre-A1', difficulty: 0.24, line: 'Tap the grapes.', options: [img(K.apple, 'apple'), img(K.banana, 'banana'), img(K.grapes, 'grapes')], correct: 2 },
  { id: 'kl-w11', stage: 'listen', topic: 'clothes', level: 'Pre-A1', difficulty: 0.25, line: 'Tap the hat.', options: [img(K.shoe, 'shoe'), img(K.bag, 'bag'), img(K.hat, 'hat')], correct: 2 },
  { id: 'kl-w12', stage: 'listen', topic: 'animals', level: 'Pre-A1', difficulty: 0.27, line: 'Tap the elephant.', options: [img(K.bear, 'bear'), img(K.elephant, 'elephant'), img(K.dog, 'dog')], correct: 1 },
  { id: 'kl-w13', stage: 'listen', topic: 'sky', level: 'Pre-A1', difficulty: 0.28, line: 'Tap the moon.', options: [img(K.sun, 'sun'), img(K.star, 'star'), img(K.moon, 'moon')], correct: 2 },
  // ---- colours and numbers (Pre-A1 to A1 border)
  { id: 'kl-c01', stage: 'listen', topic: 'colours', level: 'Pre-A1', difficulty: 0.15, line: 'Tap the red ball.', options: [img(K.ballBlue, 'blue ball'), img(K.ballRed, 'red ball'), img(K.ballYellow, 'yellow ball')], correct: 1 },
  { id: 'kl-c02', stage: 'listen', topic: 'colours', level: 'Pre-A1', difficulty: 0.2, line: 'Tap the blue ball.', options: [img(K.ballYellow, 'yellow ball'), img(K.ballRed, 'red ball'), img(K.ballBlue, 'blue ball')], correct: 2 },
  { id: 'kl-n01', stage: 'listen', topic: 'numbers', level: 'Pre-A1', difficulty: 0.14, line: 'Tap the one with two apples.', options: [{ kind: 'count', src: K.apple, n: 1, label: '1 apple' }, { kind: 'count', src: K.apple, n: 2, label: '2 apples' }, { kind: 'count', src: K.apple, n: 3, label: '3 apples' }], correct: 1 },
  { id: 'kl-n02', stage: 'listen', topic: 'numbers', level: 'Pre-A1', difficulty: 0.26, line: 'Tap the one with three cats.', options: [{ kind: 'count', src: K.cat, n: 2, label: '2 cats' }, { kind: 'count', src: K.cat, n: 4, label: '4 cats' }, { kind: 'count', src: K.cat, n: 3, label: '3 cats' }], correct: 2 },
  // ---- phrases and simple sentences (A1)
  { id: 'kl-p01', stage: 'listen', topic: 'colours', level: 'A1', difficulty: 0.32, line: 'Tap the green car.', options: [img(K.carRed, 'red car'), img(K.carGreen, 'green car'), img(K.ballRed, 'red ball')], correct: 1 },
  { id: 'kl-p02', stage: 'listen', topic: 'colours', level: 'A1', difficulty: 0.35, line: 'Tap the yellow duck.', options: [img(K.ballYellow, 'yellow ball'), img(K.cat, 'cat'), img(K.duck, 'yellow duck')], correct: 2 },
  { id: 'kl-p03', stage: 'listen', topic: 'actions', level: 'A1', difficulty: 0.34, line: 'Who is jumping?', options: [img(K.sleeping, 'sleeping'), img(K.jumping, 'jumping'), img(K.running, 'running')], correct: 1 },
  { id: 'kl-p04', stage: 'listen', topic: 'actions', level: 'A1', difficulty: 0.38, line: 'Tap the one who is sleeping.', options: [img(K.running, 'running'), img(K.standing, 'standing'), img(K.sleeping, 'sleeping')], correct: 2 },
  { id: 'kl-p05', stage: 'listen', topic: 'numbers', level: 'A1', difficulty: 0.4, line: 'I can see five apples. Tap the picture.', options: [{ kind: 'count', src: K.apple, n: 4, label: '4 apples' }, { kind: 'count', src: K.apple, n: 5, label: '5 apples' }, { kind: 'count', src: K.apple, n: 6, label: '6 apples' }], correct: 1 },
  { id: 'kl-p06', stage: 'listen', topic: 'size', level: 'A1', difficulty: 0.4, line: 'Tap the small dog.', options: [img(K.dog, 'big dog', 1), img(K.dog, 'small dog', 0.5), img(K.cat, 'big cat', 1)], correct: 1 },
  { id: 'kl-p07', stage: 'listen', topic: 'categories', level: 'A1', difficulty: 0.42, line: 'Tap the one you can eat.', options: [img(K.hat, 'hat'), img(K.carrot, 'carrot'), img(K.ball, 'ball')], correct: 1 },
  { id: 'kl-p08', stage: 'listen', topic: 'prepositions', level: 'A1', difficulty: 0.44, line: 'The ball is on the table. Tap the picture.', options: [scene({ ref: 'table', prep: 'under', subject: K.ball }, 'ball under the table'), scene({ ref: 'table', prep: 'on', subject: K.ball }, 'ball on the table'), scene({ ref: 'table', prep: 'beside', subject: K.ball }, 'ball next to the table')], correct: 1 },
  { id: 'kl-p09', stage: 'listen', topic: 'categories', level: 'A1', difficulty: 0.46, line: 'Which one can fly?', options: [img(K.dog, 'dog'), img(K.bird, 'bird'), img(K.cat, 'cat')], correct: 1 },
  { id: 'kl-p10', stage: 'listen', topic: 'questions', level: 'A1', difficulty: 0.48, line: 'Is this a dog? Tap the tick or the cross.', shown: { kind: 'picture', src: K.cat, label: 'cat' }, options: [{ kind: 'mark', ok: true }, { kind: 'mark', ok: false }], correct: 1 },
  { id: 'kl-p11', stage: 'listen', topic: 'prepositions', level: 'A1', difficulty: 0.5, line: 'The cat is in the box. Tap the picture.', options: [scene({ ref: 'box', prep: 'in', subject: K.cat }, 'cat in the box'), scene({ ref: 'box', prep: 'behind', subject: K.cat }, 'cat behind the box'), scene({ ref: 'box', prep: 'front', subject: K.cat }, 'cat in front of the box')], correct: 0 },
  { id: 'kl-p12', stage: 'listen', topic: 'prepositions', level: 'A1', difficulty: 0.53, line: 'Where is the ball? It is under the table.', options: [scene({ ref: 'table', prep: 'on', subject: K.ball }, 'ball on the table'), scene({ ref: 'table', prep: 'beside', subject: K.ball }, 'ball next to the table'), scene({ ref: 'table', prep: 'under', subject: K.ball }, 'ball under the table')], correct: 2 },
  // ---- A2
  { id: 'kl-q01', stage: 'listen', topic: 'colours+size', level: 'A2', difficulty: 0.58, line: 'Tap the big yellow ball.', options: [img(K.ballYellow, 'small yellow ball', 0.5), img(K.ballYellow, 'big yellow ball', 1), img(K.ballBlue, 'big blue ball', 1)], correct: 1 },
  { id: 'kl-q02', stage: 'listen', topic: 'sentences', level: 'A2', difficulty: 0.6, line: 'Tap the picture with a dog and a cat.', options: [{ kind: 'pair', srcs: [K.dog, K.ball], label: 'dog and ball' }, { kind: 'pair', srcs: [K.dog, K.cat], label: 'dog and cat' }, { kind: 'pair', srcs: [K.cat, K.hat], label: 'cat and hat' }], correct: 1 },
  { id: 'kl-q03', stage: 'listen', topic: 'prepositions', level: 'A2', difficulty: 0.64, line: 'The cat is behind the box.', options: [scene({ ref: 'box', prep: 'front', subject: K.cat }, 'cat in front of the box'), scene({ ref: 'box', prep: 'in', subject: K.cat }, 'cat in the box'), scene({ ref: 'box', prep: 'behind', subject: K.cat }, 'cat behind the box')], correct: 2 },
  { id: 'kl-q04', stage: 'listen', topic: 'sequence', level: 'A2', difficulty: 0.68, line: 'First he jumps. Then he sleeps. Tap the pictures in that order.', options: [{ kind: 'pair', srcs: [K.sleeping, K.jumping], label: 'sleeping then jumping', ordered: true }, { kind: 'pair', srcs: [K.running, K.sleeping], label: 'running then sleeping', ordered: true }, { kind: 'pair', srcs: [K.jumping, K.sleeping], label: 'jumping then sleeping', ordered: true }], correct: 2 },
  { id: 'kl-q05', stage: 'listen', topic: 'questions', level: 'A2', difficulty: 0.7, line: 'Is the ball next to the table? Tap the tick or the cross.', shown: { kind: 'scene', scene: { ref: 'table', prep: 'beside', subject: K.ball }, label: 'ball next to the table' }, options: [{ kind: 'mark', ok: true }, { kind: 'mark', ok: false }], correct: 0 },
  { id: 'kl-q06', stage: 'listen', topic: 'sentences', level: 'A2', difficulty: 0.74, line: 'The big dog is under the table and the small ball is on the table.', options: [scene({ ref: 'table', prep: 'under', subject: K.dog, extra: { src: K.ball, prep: 'on' } }, 'dog under, ball on'), scene({ ref: 'table', prep: 'on', subject: K.dog, extra: { src: K.ball, prep: 'under' } }, 'dog on, ball under'), scene({ ref: 'table', prep: 'beside', subject: K.dog, extra: { src: K.ball, prep: 'on' } }, 'dog next to table, ball on')], correct: 0 },
];

// ---------------------------------------------------------------- LITERACY (letters, then words, then sentences)
export const KIDS_LITERACY: KidsItem[] = [
  // ---- letter names (recorded clip)
  { id: 'kr-l01', stage: 'literacy', topic: 'letter names', level: 'Pre-A1', difficulty: 0.1, line: 'Tap this letter.', clip: { type: 'name', letter: 's' }, options: letters('M', 'S', 'T'), correct: 1 },
  { id: 'kr-l02', stage: 'literacy', topic: 'letter names', level: 'Pre-A1', difficulty: 0.14, line: 'Tap this letter.', clip: { type: 'name', letter: 'b' }, options: letters('B', 'O', 'L'), correct: 0 },
  { id: 'kr-l03', stage: 'literacy', topic: 'letter names', level: 'Pre-A1', difficulty: 0.2, line: 'Tap this letter.', clip: { type: 'name', letter: 'k' }, options: letters('H', 'N', 'K'), correct: 2 },
  // ---- letter sounds (recorded clip)
  { id: 'kr-s01', stage: 'literacy', topic: 'letter sounds', level: 'Pre-A1', difficulty: 0.24, line: 'Which letter makes this sound?', clip: { type: 'sound', letter: 's' }, options: letters('M', 'T', 'S'), correct: 2 },
  { id: 'kr-s02', stage: 'literacy', topic: 'letter sounds', level: 'Pre-A1', difficulty: 0.28, line: 'Which letter makes this sound?', clip: { type: 'sound', letter: 'm' }, options: letters('M', 'S', 'P'), correct: 0 },
  { id: 'kr-s03', stage: 'literacy', topic: 'letter sounds', level: 'A1', difficulty: 0.34, line: 'Which letter makes this sound?', clip: { type: 'sound', letter: 't' }, options: letters('D', 'T', 'P'), correct: 1 },
  { id: 'kr-s04', stage: 'literacy', topic: 'letter sounds', level: 'A1', difficulty: 0.4, line: 'Which letter makes this sound?', clip: { type: 'sound', letter: 'a' }, options: letters('O', 'E', 'A'), correct: 2 },
  // ---- first letter of a picture
  { id: 'kr-f01', stage: 'literacy', topic: 'first letter', level: 'A1', difficulty: 0.32, line: 'What is the first letter of this word? Tap it.', shown: { kind: 'picture', src: K.sun, label: 'sun' }, options: letters('M', 'S', 'T'), correct: 1 },
  { id: 'kr-f02', stage: 'literacy', topic: 'first letter', level: 'A1', difficulty: 0.38, line: 'What is the first letter of this word? Tap it.', shown: { kind: 'picture', src: K.cat, label: 'cat' }, options: letters('K', 'C', 'S'), correct: 1 },
  { id: 'kr-f03', stage: 'literacy', topic: 'first letter', level: 'A1', difficulty: 0.44, line: 'What is the first letter of this word? Tap it.', shown: { kind: 'picture', src: K.ballRed, label: 'ball' }, options: letters('D', 'P', 'B'), correct: 2 },
  // ---- read a word, tap the picture (no audio of the word)
  { id: 'kr-w01', stage: 'literacy', topic: 'read a word', level: 'A1', difficulty: 0.36, line: 'Read the word. Tap the picture.', shown: { kind: 'word', text: 'cat' }, options: [img(K.dog, 'dog'), img(K.cat, 'cat'), img(K.sun, 'sun')], correct: 1 },
  { id: 'kr-w02', stage: 'literacy', topic: 'read a word', level: 'A1', difficulty: 0.38, line: 'Read the word. Tap the picture.', shown: { kind: 'word', text: 'sun' }, options: [img(K.sun, 'sun'), img(K.moon, 'moon'), img(K.star, 'star')], correct: 0 },
  { id: 'kr-w03', stage: 'literacy', topic: 'read a word', level: 'A1', difficulty: 0.4, line: 'Read the word. Tap the picture.', shown: { kind: 'word', text: 'dog' }, options: [img(K.cat, 'cat'), img(K.bear, 'bear'), img(K.dog, 'dog')], correct: 2 },
  { id: 'kr-w04', stage: 'literacy', topic: 'read a word', level: 'A1', difficulty: 0.44, line: 'Read the word. Tap the picture.', shown: { kind: 'word', text: 'hat' }, options: [img(K.bag, 'bag'), img(K.hat, 'hat'), img(K.cat, 'cat')], correct: 1 },
  { id: 'kr-w05', stage: 'literacy', topic: 'read a word', level: 'A1', difficulty: 0.46, line: 'Read the word. Tap the picture.', shown: { kind: 'word', text: 'egg' }, options: [img(K.egg, 'egg'), img(K.apple, 'apple'), img(K.milk, 'milk')], correct: 0 },
  { id: 'kr-w06', stage: 'literacy', topic: 'read a word', level: 'A1', difficulty: 0.48, line: 'Read the word. Tap the picture.', shown: { kind: 'word', text: 'book' }, options: [img(K.door, 'door'), img(K.book, 'book'), img(K.key, 'key')], correct: 1 },
  { id: 'kr-w07', stage: 'literacy', topic: 'read a word', level: 'A1', difficulty: 0.52, line: 'Read the word. Tap the picture.', shown: { kind: 'word', text: 'frog' }, options: [img(K.frog, 'frog'), img(K.duck, 'duck'), img(K.rabbit, 'rabbit')], correct: 0 },
  { id: 'kr-w08', stage: 'literacy', topic: 'read a word', level: 'A1', difficulty: 0.56, line: 'Read the word. Tap the picture.', shown: { kind: 'word', text: 'ship' }, options: [img(K.ship, 'ship'), img(K.shoe, 'shoe'), img(K.plane, 'plane')], correct: 0 },
  // ---- read a sentence, tap the picture
  { id: 'kr-r01', stage: 'literacy', topic: 'read a sentence', level: 'A1', difficulty: 0.55, line: 'Read the sentence. Tap the picture.', shown: { kind: 'sentence', text: 'I see a red ball.' }, options: [img(K.ballBlue, 'blue ball'), img(K.carRed, 'red car'), img(K.ballRed, 'red ball')], correct: 2 },
  { id: 'kr-r02', stage: 'literacy', topic: 'read a sentence', level: 'A1', difficulty: 0.56, line: 'Read the sentence. Tap the picture.', shown: { kind: 'sentence', text: 'The dog is big.' }, options: [img(K.dog, 'small dog', 0.5), img(K.dog, 'big dog', 1), img(K.cat, 'big cat', 1)], correct: 1 },
  { id: 'kr-r03', stage: 'literacy', topic: 'read a sentence', level: 'A2', difficulty: 0.64, line: 'Read the sentence. Tap the picture.', shown: { kind: 'sentence', text: 'He is jumping.' }, options: [img(K.sleeping, 'sleeping'), img(K.running, 'running'), img(K.jumping, 'jumping')], correct: 2 },
  { id: 'kr-r04', stage: 'literacy', topic: 'read a sentence', level: 'A2', difficulty: 0.68, line: 'Read the sentence. Tap the picture.', shown: { kind: 'sentence', text: 'The cat is on the box.' }, options: [scene({ ref: 'box', prep: 'in', subject: K.cat }, 'cat in the box'), scene({ ref: 'box', prep: 'on', subject: K.cat }, 'cat on the box'), scene({ ref: 'box', prep: 'behind', subject: K.cat }, 'cat behind the box')], correct: 1 },
  { id: 'kr-r05', stage: 'literacy', topic: 'read a sentence', level: 'A2', difficulty: 0.72, line: 'Read the sentences. Tap the picture.', shown: { kind: 'sentence', text: 'I have two cats. They are on the table.' }, options: [scene({ ref: 'table', prep: 'under', subject: K.cat }, 'cat under the table'), scene({ ref: 'table', prep: 'on', subject: K.cat, extra: { src: K.cat, prep: 'on' } }, 'two cats on the table'), scene({ ref: 'table', prep: 'on', subject: K.cat }, 'one cat on the table')], correct: 1 },
  { id: 'kr-r07', stage: 'literacy', topic: 'read a sentence', level: 'A1', difficulty: 0.55, line: 'Read the sentence. Tap the picture.', shown: { kind: 'sentence', text: 'The cat is under the table.' }, options: [scene({ ref: 'table', prep: 'on', subject: K.cat }, 'cat on the table'), scene({ ref: 'table', prep: 'beside', subject: K.cat }, 'cat next to the table'), scene({ ref: 'table', prep: 'under', subject: K.cat }, 'cat under the table')], correct: 2 },
  { id: 'kr-r08', stage: 'literacy', topic: 'read a sentence', level: 'A2', difficulty: 0.62, line: 'Read the sentence. Tap the picture.', shown: { kind: 'sentence', text: 'The ball is in the box.' }, options: [scene({ ref: 'box', prep: 'behind', subject: K.ball }, 'ball behind the box'), scene({ ref: 'box', prep: 'in', subject: K.ball }, 'ball in the box'), scene({ ref: 'box', prep: 'front', subject: K.ball }, 'ball in front of the box')], correct: 1 },
  { id: 'kr-r09', stage: 'literacy', topic: 'read a sentence', level: 'A2', difficulty: 0.66, line: 'Read the sentence. Tap the picture.', shown: { kind: 'sentence', text: 'The dog is behind the box.' }, options: [scene({ ref: 'box', prep: 'in', subject: K.dog }, 'dog in the box'), scene({ ref: 'box', prep: 'front', subject: K.dog }, 'dog in front of the box'), scene({ ref: 'box', prep: 'behind', subject: K.dog }, 'dog behind the box')], correct: 2 },
  { id: 'kr-r06', stage: 'literacy', topic: 'read a sentence', level: 'A2', difficulty: 0.78, line: 'Read the sentences. Tap the picture.', shown: { kind: 'sentence', text: 'Sam has a big dog. The dog is under the table.' }, options: [scene({ ref: 'table', prep: 'on', subject: K.dog }, 'dog on the table'), scene({ ref: 'table', prep: 'under', subject: K.dog }, 'dog under the table'), scene({ ref: 'table', prep: 'beside', subject: K.dog }, 'dog next to the table')], correct: 1 },
  { id: 'kr-r10', stage: 'literacy', topic: 'read a sentence', level: 'A2', difficulty: 0.76, line: 'Read the sentences. Tap the picture.', shown: { kind: 'sentence', text: 'The dog is on the table. The ball is under the table.' }, options: [scene({ ref: 'table', prep: 'under', subject: K.dog, extra: { src: K.ball, prep: 'on' } }, 'dog under, ball on'), scene({ ref: 'table', prep: 'on', subject: K.dog, extra: { src: K.ball, prep: 'under' } }, 'dog on, ball under'), scene({ ref: 'table', prep: 'on', subject: K.dog, extra: { src: K.ball, prep: 'on' } }, 'dog and ball on')], correct: 1 },
];

export const KIDS_BANK: KidsItem[] = [...KIDS_LISTEN, ...KIDS_LITERACY];

/** Pip's spoken lines (saved clips): every instruction, the practice, the section cards and the cheers. */
export const KIDS_CHEERS = ['Great job!', 'Super!', 'Well done!', 'Nice one!'];
export const KIDS_SCRIPT = {
  welcome: "Hi! I'm Pip. Let's play a picture game! I will talk, and you tap the right picture. Ready?",
  practiceDone: "Great! Now let's start the game.",
  tryAgain: "Let's try again!",
  notSure: 'Not sure? That is okay. Tap here.',
  lettersIntro: "Now let's play with letters!",
  readIntro: 'Now it is time to read. Look at the words!',
  finish: 'You did it! Great job! You are a star!',
};
