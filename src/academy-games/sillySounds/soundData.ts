/**
 * Silly Sounds Circus — a funny phonics game for Academy teens (they read well, they pronounce and spell by sound poorly).
 *
 * Why it is built this way (docs/research/silly-sounds.md):
 *  - English spelling hides the sound: through / blue / two rhyme, though / rough / cough do not. Rhymes and odd-one-out train
 *    the EARS first, on the patterns that surprise readers (ough, ea, oo, ight, gh).
 *  - Silent letters and tricky spellings are drilled in silly sentences, because silly is easier to remember.
 *  - Last: a private echo (record yourself next to the model). Never scored, never uploaded.
 * Every word and sentence is a pre-baked recorded clip (teacher voice). Heteronyms (read, lead, wind, live, tear, bow ...) are avoided on purpose.
 */

/* ---------------------------------------------------------------- 1 · Rhyme Roulette */
export interface RhymeRound { id: string; word: string; answer: string; wrong: [string, string]; pattern: string }
const rh = (id: string, word: string, answer: string, wrong: [string, string], pattern: string): RhymeRound => ({ id, word, answer, wrong, pattern });

export const RHYMES: RhymeRound[] = [
  rh('r1', 'though', 'go', ['how', 'tough'], 'ough = /oh/ in though'),
  rh('r2', 'through', 'blue', ['though', 'rough'], 'ough = /oo/ in through'),
  rh('r3', 'rough', 'stuff', ['cough', 'though'], 'ough = /uff/ in rough'),
  rh('r4', 'cough', 'off', ['rough', 'through'], 'ough = /off/ in cough'),
  rh('r5', 'night', 'kite', ['late', 'nut'], 'igh = the vowel in my'),
  rh('r6', 'eight', 'late', ['night', 'height'], 'eigh = the vowel in day'),
  rh('r7', 'bear', 'chair', ['hear', 'beer'], 'ear can be /air/ (bear, wear)'),
  rh('r8', 'great', 'eight', ['treat', 'meat'], 'ea can be /ay/ (great, steak)'),
  rh('r9', 'food', 'mood', ['good', 'flood'], 'oo = /oo/ in food'),
  rh('r10', 'blood', 'mud', ['food', 'good'], 'oo = /uh/ in blood'),
];
export const rhymeOptions = (r: RhymeRound) => [r.answer, ...r.wrong];

/* ---------------------------------------------------------------- 2 · Odd One Out */
export interface OddRound { id: string; words: [string, string, string, string]; odd: string; sound: string }
const od = (id: string, words: [string, string, string, string], odd: string, sound: string): OddRound => ({ id, words, odd, sound });

export const ODDS: OddRound[] = [
  od('o1', ['boot', 'food', 'book', 'moon'], 'book', 'boot, food, moon: long /oo/. book is short.'),
  od('o2', ['cat', 'hat', 'cake', 'bat'], 'cake', 'cat, hat, bat: /a/. cake is /ay/.'),
  od('o3', ['bed', 'head', 'bread', 'bead'], 'bead', 'bed, head, bread: /e/. bead is /ee/.'),
  od('o4', ['cow', 'now', 'show', 'how'], 'show', 'cow, now, how: /ow/. show is /oh/.'),
  od('o5', ['rain', 'day', 'great', 'eat'], 'eat', 'rain, day, great: /ay/. eat is /ee/.'),
  od('o6', ['sheep', 'green', 'ship', 'tree'], 'ship', 'sheep, green, tree: long /ee/. ship is short /i/.'),
  od('o7', ['phone', 'stone', 'gone', 'bone'], 'gone', 'phone, stone, bone: /oh/. gone is not.'),
  od('o8', ['bus', 'love', 'cup', 'home'], 'home', 'bus, love, cup: /uh/. home is /oh/.'),
];

/* ---------------------------------------------------------------- 3 · Silent Ninja */
export interface NinjaRound { id: string; word: string; silent: string; index: number; note: string }
const nj = (id: string, word: string, index: number, note: string): NinjaRound => ({ id, word, silent: word[index], index, note });

export const NINJAS: NinjaRound[] = [
  nj('n1', 'knife', 0, 'kn: the k is silent.'),
  nj('n2', 'write', 0, 'wr: the w is silent.'),
  nj('n3', 'island', 1, 'island: the s is silent.'),
  nj('n4', 'listen', 4, 'listen: the t is silent.'),
  nj('n5', 'comb', 3, 'mb at the end: the b is silent.'),
  nj('n6', 'castle', 3, 'castle: the t is silent.'),
  nj('n7', 'hour', 0, 'hour: the h is silent.'),
  nj('n8', 'Wednesday', 2, 'Wednesday: the first d is silent.'),
];

/* ---------------------------------------------------------------- 4 · Spelling Doctor */
export interface DoctorRound { id: string; text: string; answer: string; wrong: [string, string]; tip: string }
const dr = (id: string, text: string, answer: string, wrong: [string, string], tip: string): DoctorRound => ({ id, text, answer, wrong, tip });

export const DOCTORS: DoctorRound[] = [
  dr('d1', 'The monster went to bed at ___.', 'night', ['nite', 'nyte'], 'The sound /ight/ is spelled igh + t.'),
  dr('d2', 'A pirate sailed ___ the storm.', 'through', ['thru', 'threw'], 'through: the ough sounds like /oo/. (threw = past of throw.)'),
  dr('d3', 'I have ___ pizza for ten monsters.', 'enough', ['enuff', 'enougg'], 'enough: the ough sounds like /uff/.'),
  dr('d4', 'The clown ___ a big fish.', 'caught', ['cought', 'cort'], 'caught: aught sounds like /awt/.'),
  dr('d5', 'The alien said hello to my ___.', 'friend', ['freind', 'frend'], 'friend: i before e, then nd.'),
  dr('d6', 'Our robot teacher ___ everything.', 'knows', ['nose', 'noes'], 'knows: silent k. (nose is on your face.)'),
  dr('d7', 'The dragon likes to wear a ___.', 'crown', ['crowne', 'kroun'], 'crown: ow sounds like /ow/.'),
  dr('d8', 'The giant has ___ fingers.', 'eight', ['ate', 'eigth'], 'eight: eigh then t. (ate = past of eat.)'),
];
export const doctorOptions = (d: DoctorRound) => [d.answer, ...d.wrong];
export const doctorSentence = (d: DoctorRound) => d.text.replace('___', d.answer);

/* ---------------------------------------------------------------- 5 · Parrot Echo */
export interface EchoPair { id: string; a: string; b: string; tip: string }
export const ECHOES: EchoPair[] = [
  { id: 'e1', a: 'through', b: 'blue', tip: 'Both end in the same long oo. Round your lips.' },
  { id: 'e2', a: 'though', b: 'go', tip: 'Both end in oh. The gh is silent.' },
  { id: 'e3', a: 'night', b: 'kite', tip: 'Same vowel as my. The gh is silent.' },
  { id: 'e4', a: 'bear', b: 'chair', tip: 'Same air sound. Keep it short and clear.' },
  { id: 'e5', a: 'rough', b: 'stuff', tip: 'End with a clear f sound: top teeth on your lip.' },
];

/** Every line the game says aloud (baked as recorded clips, voice 'teacher'). */
export function sillySoundsLines(): string[] {
  const out = new Set<string>();
  for (const r of RHYMES) { out.add(r.word); out.add(r.answer); }
  for (const o of ODDS) o.words.forEach((w) => out.add(w));
  for (const n of NINJAS) out.add(n.word);
  for (const d of DOCTORS) out.add(doctorSentence(d));
  for (const e of ECHOES) { out.add(e.a); out.add(e.b); }
  return [...out];
}
