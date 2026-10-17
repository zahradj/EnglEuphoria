// Pre-A1 is reading-first (owner 2026-10-15, CLAUDE.md "Pre-A1 is reading-first"): every episode of Seasons P1-P5 carries its reading plan as data:
// (1) ACTIVATE: the words the student may already know from school or from their phone ("I know it / New to me"),
// (2) the MESSAGE: a short text from a cast member, made only of sounds taught so far, whole words taught so far and the cast's names, read twice (listen, then read),
// (3) the WORD BANK: the words kept from the message, practised in the lesson and returned on the spaced schedule.
// Design note: docs/academy-pre-a1-reading-first.md. Research: docs/research/academy-pre-a1-reading-research.md. Imports only from this folder.
import { PA1_SEASONS, type PreA1Season } from './preA1';

export interface EpisodeReading {
  /** `${seasonId}-E${episodeNo}` */
  id: string;
  /** words for the "I know it / New to me" check (the episode's own words, as the student may meet them on a phone or at school) */
  activate: string[];
  /** a short text from a cast member; 3 to 6 lines of at most 8 words */
  message: { from: 'Vee' | 'Ava' | 'Theo'; lines: string[] };
  /** the words the student may keep (all in the message), at least 3 */
  bank: string[];
  /** whole words introduced on the lesson's own picture or plate (theme nouns), at most 4 per episode; they are taught before they are read */
  taught?: string[];
}

const R = (id: string, activate: string[], from: 'Vee' | 'Ava' | 'Theo', lines: string[], bank: string[], taught?: string[]): EpisodeReading => ({ id, activate, message: { from, lines }, bank, ...(taught ? { taught } : {}) });

export const PRE_A1_READING: readonly EpisodeReading[] = [
  // ---------- P1 Hello, letters (s a t p) ----------
  R('PA1-S01-E1', ['hello', 'hi', 'bye', 'name'], 'Vee', ['Hello!', 'I am Vee.', 'My name is Vee.', 'Bye!'], ['hello', 'name', 'bye']),
  R('PA1-S01-E2', ['yes', 'no', 'boy', 'girl', 'friend'], 'Theo', ['Hi! I am Theo.', 'Yes. Yes. No. No.', 'Ava is my friend.', 'Sam is my friend.'], ['yes', 'no', 'friend']),
  R('PA1-S01-E3', ['thanks', 'please', 'spell'], 'Ava', ['Hi! I am Ava.', 'How do you spell it?', 'A-V-A.', 'Pat sat. Ava sat.', 'Thanks! Please.'], ['thanks', 'please', 'sat']),
  R('PA1-S01-E4', ['nice', 'meet', 'sorry'], 'Theo', ['Hello! I am Theo.', 'Nice to meet you.', 'Me too.', 'Sorry? Ava sat.', 'Thanks!'], ['nice', 'meet', 'sorry']),
  R('PA1-S01-E5', ['the', 'is', 'a'], 'Vee', ['Pat is a girl.', 'Pat sat.', 'Sam is a boy.', 'Sam is at the tap.', 'Pat sat. Sam sat.'], ['girl', 'boy', 'sat']),
  R('PA1-S01-E6', ['name', 'friend', 'girl', 'boy'], 'Vee', ['I am Vee.', 'My name is Vee.', 'Sam is my friend.', 'Pat is my friend.'], ['name', 'friend', 'Vee']),
  R('PA1-S01-E7', ['sat', 'tap', 'bye'], 'Ava', ['Hi! I am Ava.', 'Pat sat at the tap.', 'Sam is a boy.', 'Pat is a girl.', 'Thanks! Bye!'], ['sat', 'tap', 'bye']),
  R('PA1-S01-E8', ['hello', 'name', 'friend'], 'Theo', ['Hello! My name is Theo.', 'Ava is my friend.', 'Pat is my friend.', 'Sam is my friend.', 'Bye!'], ['hello', 'name', 'friend']),

  // ---------- P2 First sounds (the phone; + i n m d) ----------
  R('PA1-S02-E1', ['phone', 'map', 'pin', 'tin'], 'Theo', ['I am Theo.', 'It is a pin.', 'It is in a tin.', 'It is a map.'], ['pin', 'tin', 'map', 'in', 'it', 'is']),
  R('PA1-S02-E2', ['man', 'mat', 'dad', 'did', 'app', 'camera'], 'Vee', ['Hi! I am Vee.', 'This is my dad.', 'Dad is a man.', 'This is a mat.', 'Dad did a nap.'], ['dad', 'man', 'mat']),
  R('PA1-S02-E3', ['map', 'pin', 'yes', 'not'], 'Ava', ['This is a map.', 'Is it a map? Yes, it is.', 'Is it a pin? No, it is not.', 'This is a tin.'], ['map', 'pin', 'yes']),
  R('PA1-S02-E4', ['look', 'again', 'sorry'], 'Theo', ['Look! Is it a map?', 'Sorry? Again, please.', 'It is a mat. Yes, it is!', 'Thanks, Dad!'], ['look', 'again', 'mat']),
  R('PA1-S02-E5', ['and', 'in', 'on'], 'Vee', ['A man and a map.', 'Dad is on the mat.', 'A pin in a tin.', 'Pam and Tim sat.', 'Dan did a nap.'], ['and', 'on', 'nap']),
  R('PA1-S02-E6', ['phone', 'map', 'man'], 'Ava', ['This is Pam. This is Tim.', 'Tim is in my phone.', 'This is a map.', 'Tim did a nap.'], ['phone', 'map', 'nap']),
  R('PA1-S02-E7', ['sit', 'tin', 'dad'], 'Theo', ['Pam sat. Tim sat.', 'Dad is in my phone.', 'It is a pin. It is a tin.', 'Dan is a man.'], ['sat', 'phone', 'man']),
  R('PA1-S02-E8', ['phone', 'map', 'pin', 'tin'], 'Vee', ['My phone.', 'This is a map.', 'This is a pin.', 'This is a tin.', 'This is my dad.'], ['phone', 'map', 'dad']),

  // ---------- P3 Numbers and age (the lockers; no new sounds) ----------
  R('PA1-S03-E1', ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'number'], 'Vee', ['Locker six is open.', 'One, two, three, four.', 'Five, six.', 'Six! It is my locker.'], ['locker', 'six', 'open'], ['locker', 'open']),
  R('PA1-S03-E2', ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen'], 'Ava', ['Locker eleven. Locker twelve.', 'Locker thirteen is open.', 'Locker thirty?', 'Thirteen, thirteen. Not thirty!'], ['thirteen', 'thirty', 'twelve'], ['thirty']),
  R('PA1-S03-E3', ['age', 'old', 'fifteen', 'sixteen'], 'Theo', ['Hi! I am Theo. I am fifteen.', 'How old are you?', 'I am sixteen.', 'Thanks!'], ['old', 'fifteen', 'sixteen']),
  R('PA1-S03-E4', ['phone number', 'again', 'six'], 'Vee', ['My phone number.', 'Is that six?', 'Say it again, please.', 'Yes! Five, six, one, two.'], ['phone', 'number', 'again']),
  R('PA1-S03-E5', ['nineteen', 'twenty', 'ten'], 'Ava', ['Ava is fifteen. Locker ten.', 'Theo is sixteen. Locker twenty.', 'Vee is seventeen. Locker nineteen.', 'Dan is thirteen. Locker eleven.'], ['ten', 'twenty', 'nineteen']),
  R('PA1-S03-E6', ['locker', 'phone', 'number'], 'Theo', ['I am fifteen. My locker is ten.', 'My phone number is one, two, three.', 'Ava is my friend.'], ['locker', 'phone', 'number']),
  R('PA1-S03-E7', ['six', 'thirteen', 'again'], 'Vee', ['Locker six is open.', 'Dan is thirteen. Locker thirteen.', 'Say it again, please.', 'It is my phone number?'], ['six', 'thirteen', 'again']),
  R('PA1-S03-E8', ['locker', 'old', 'phone number'], 'Ava', ['My locker.', 'I am fifteen.', 'My phone number is one, two, three.', 'Theo is sixteen.'], ['locker', 'fifteen', 'phone']),

  // ---------- P4 My things (the school bag; + o c b g) ----------
  R('PA1-S04-E1', ['bag', 'cap', 'book', 'pen'], 'Theo', ['It is a bag.', 'It is a cap.', 'It is a book.', 'It is a pen.'], ['bag', 'cap', 'book']),
  R('PA1-S04-E2', ['dog', 'bin', 'box', 'pot', 'top', 'mop'], 'Vee', ['It is a big bag.', 'It is a dog.', 'It is a big dog.', 'It is a pot on a box.', 'A mop. A bin.'], ['big', 'dog', 'box']),
  R('PA1-S04-E3', ['an', 'apple', 'bag'], 'Ava', ['It is a bag.', 'It is an apple.', 'It is a cap.', 'It is an apple.'], ['an', 'apple', 'bag']),
  R('PA1-S04-E4', ['what', 'your', 'phone'], 'Theo', ['What is it?', 'It is a phone!', 'Is it your phone?', 'Yes, it is. Thanks!'], ['what', 'your', 'phone']),
  R('PA1-S04-E5', ['top', 'not', 'bag'], 'Vee', ['A pen, a cap, a book.', 'A pot, a mop, a top.', 'A dog is on the bag.', 'A phone is in the bag.', 'It is not a bin.'], ['top', 'not', 'bag']),
  R('PA1-S04-E6', ['book', 'pen', 'bag'], 'Ava', ['My bag.', 'It is a big bag.', 'A pen, a book and a phone.', 'It is my bag.'], ['book', 'pen', 'bag']),
  R('PA1-S04-E7', ['got', 'cat', 'dig'], 'Theo', ['Dad got a big dog.', 'It is not a cat.', 'The cap is on the dog.', 'Tom did a dig.'], ['got', 'cat', 'dog']),
  R('PA1-S04-E8', ['box', 'pot', 'mop'], 'Vee', ['My bag.', 'A pen, a cap, a book.', 'A box, a pot, a mop.', 'It is my bag!'], ['bag', 'box', 'mop']),

  // ---------- P5 People and places (the world map; + e u h r) ----------
  R('PA1-S05-E1', ['map', 'friend', 'bus'], 'Ava', ['Ben is my friend.', 'Ben is on the bus.', 'A pin on the map.', 'Ben sat on a bed.'], ['friend', 'bus', 'map']),
  R('PA1-S05-E2', ['he', 'she', 'man', 'woman'], 'Vee', ['He is a man. He is Ben.', 'She is a woman. She is Pam.', 'Ben ran. Pam ran.', 'Ben has a red hat.'], ['he', 'she', 'hat']),
  R('PA1-S05-E3', ['from', 'Spain', 'Italy', 'Turkey'], 'Ava', ['I am Ava. I am from Spain.', 'He is Ben. He is from Italy.', 'She is Pam. She is from Turkey.', 'Where are you from?'], ['from', 'Spain', 'Italy'], ['Spain', 'Italy', 'Turkey']),
  R('PA1-S05-E4', ['where', 'meet', 'from'], 'Theo', ['Nice to meet you.', 'Me too. Where are you from?', 'I am from Italy.', 'Where is he from?', 'He is from Spain.'], ['where', 'meet', 'from']),
  R('PA1-S05-E5', ['France', 'Spain', 'Italy', 'Turkey'], 'Vee', ['Sam is a man. He is from France.', 'Sam is on a bus.', 'He is a friend.', 'Sam has a red hat.', 'Sam is not from Turkey.'], ['France', 'hat', 'friend']),
  R('PA1-S05-E6', ['map', 'Spain', 'Italy'], 'Ava', ['My map.', 'I am from Spain.', 'Pam is from Italy.', 'Ben is from Turkey.'], ['map', 'Spain', 'Italy']),
  R('PA1-S05-E7', ['he', 'she', 'bus'], 'Theo', ['Ben is a man. He is from France.', 'Pam is a girl. She is from Spain.', 'Sam ran on the bus.', 'Ron is not on the bus.'], ['he', 'she', 'bus']),
  R('PA1-S05-E8', ['world map', 'from', 'friend'], 'Vee', ['My map.', 'I am from Spain.', 'Ben is from France.', 'Pam is from Italy.', 'Sam is from Turkey.'], ['map', 'from', 'Spain']),
];

const clean = (w: string): string => w.toLowerCase().replace(/[^a-z']/g, '');
const tokens = (text: string): string[] => text.split(/\s+/).map(clean).filter(Boolean);
/** Names of the cast and of the friends in the texts: always readable (proper names). */
export const READING_NAMES: readonly string[] = ['vee', 'ava', 'theo', 'mia', 'sam', 'tim', 'dan', 'pam', 'pat', 'tom', 'bob', 'ben', 'ron'];

export const seasonOfReading = (id: string): PreA1Season | undefined => PA1_SEASONS.find((s) => id.startsWith(s.id + '-'));
export const episodeNoOfReading = (id: string): number => Number(id.split('-E')[1]);

/** The sounds taught up to and including the episode: all earlier Seasons' sounds plus this Season's episodes 1..no. */
export function soundsAt(id: string): string[] {
  const season = seasonOfReading(id);
  if (!season) return [];
  const no = episodeNoOfReading(id);
  const before = PA1_SEASONS.filter((s) => s.seasonNo < season.seasonNo).flatMap((s) => [...s.sounds]);
  const here = season.episodes.filter((e) => e.no <= no).flatMap((e) => e.sounds ?? []);
  return [...before, ...here].map((x) => x.toLowerCase());
}

/** The whole words the student can read by this episode: new items of every earlier Season and of this Season up to the episode (taught on their own page first), the Seasons' sight words from P2 on, the episode's own theme words and the names. */
export function wholeWordsAt(id: string): string[] {
  const season = seasonOfReading(id);
  if (!season) return [];
  const no = episodeNoOfReading(id);
  const items = PA1_SEASONS.flatMap((s) => s.episodes.filter((e) => s.seasonNo < season.seasonNo || (s.seasonNo === season.seasonNo && e.no <= no)).flatMap((e) => e.newItems));
  const sight = season.seasonNo >= 2 ? PA1_SEASONS.filter((s) => s.seasonNo <= season.seasonNo).flatMap((s) => [...s.sightWords]) : [];
  const taught = PRE_A1_READING.filter((r) => seasonOfReading(r.id)?.seasonNo === season.seasonNo && episodeNoOfReading(r.id) <= no).flatMap((r) => r.taught ?? []);
  return [...items.flatMap(tokens), ...sight.flatMap(tokens), ...taught.flatMap(tokens), ...READING_NAMES];
}

/** Words of a text the student cannot yet read at this episode (neither blendable from the sounds taught nor a taught whole word). */
export function unreadableAt(id: string, text: string): string[] {
  const sounds = soundsAt(id);
  const whole = new Set(wholeWordsAt(id));
  return tokens(text).filter((w) => !whole.has(w) && !(w.length > 0 && [...w].every((ch) => sounds.includes(ch))));
}

/** Every problem of the Pre-A1 reading plan: an episode without a reading block, a text with words not yet readable, a bank word that is not in the message, too long or too short a message. */
export function readingProblems(): string[] {
  const out: string[] = [];
  const ids = PA1_SEASONS.flatMap((s) => s.episodes.map((e) => `${s.id}-E${e.no}`));
  ids.forEach((id) => { if (!PRE_A1_READING.some((r) => r.id === id)) out.push(`${id}: no reading plan`); });
  for (const r of PRE_A1_READING) {
    if (!ids.includes(r.id)) out.push(`${r.id}: not an episode`);
    const lines = r.message.lines;
    if (lines.length < 3 || lines.length > 6) out.push(`${r.id}: the message has ${lines.length} lines (3-6)`);
    lines.forEach((l) => { if (tokens(l).length > 8) out.push(`${r.id}: line too long: "${l}"`); });
    const bad = [...new Set(lines.flatMap((l) => unreadableAt(r.id, l)))];
    if (bad.length) out.push(`${r.id}: words not yet readable: ${bad.join(', ')}`);
    const inText = new Set(lines.flatMap(tokens));
    if (r.bank.length < 3) out.push(`${r.id}: the word bank has fewer than 3 words`);
    r.bank.forEach((w) => { if (!inText.has(clean(w))) out.push(`${r.id}: bank word "${w}" is not in the message`); });
    if (r.activate.length < 3) out.push(`${r.id}: fewer than 3 words to activate`);
    if ((r.taught?.length ?? 0) > 4) out.push(`${r.id}: more than 4 theme words taught on the plate`);
  }
  return out;
}

/** The reading plan of an episode id, e.g. 'PA1-S02-E1'. */
export const readingOf = (id: string): EpisodeReading | undefined => PRE_A1_READING.find((r) => r.id === id);
