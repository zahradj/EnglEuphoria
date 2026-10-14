// The Academy's menu of vocabulary matching / memory games (research: docs/research/academy-memory-games-list.md, 2026-10-12).
// Every lesson plan CHOOSES from this list: after each word set, two games of different roles (`recognise` first, then `deepen`).
// `status: 'built'` = a slide kind exists in the lesson player (src/academy-deck); 'planned' = to be built before a lesson may pick it.

export type VocabGameRole = 'recognise' | 'deepen';
export interface VocabGame {
  id: string;
  name: string;
  /** one-line how it plays (no timer, no ranking) */
  how: string;
  role: VocabGameRole;
  trains: string;
  status: 'built' | 'planned';
  /** the lesson-player slide kind that runs it (built games only) */
  slideKind?: string;
  /** levels it suits */
  levels: ('A1' | 'A2' | 'B1' | 'B2' | 'C1')[];
}

const ALL: VocabGame['levels'] = ['A1', 'A2', 'B1', 'B2', 'C1'];
const LOW: VocabGame['levels'] = ['A1', 'A2'];
const MID: VocabGame['levels'] = ['A2', 'B1', 'B2', 'C1'];

export const VOCAB_GAME_MENU: readonly VocabGame[] = [
  { id: 'drag-match', name: 'Drag-match', how: 'drag the word onto its scattered picture', role: 'recognise', trains: 'meaning', status: 'built', slideKind: 'match', levels: LOW },
  { id: 'listen-pick', name: 'Listen and pick', how: 'hear the word, tap its picture', role: 'recognise', trains: 'sound to meaning', status: 'built', slideKind: 'match', levels: LOW },
  { id: 'flip-memory', name: 'Flip memory', how: 'flip two cards: a picture and its word', role: 'recognise', trains: 'meaning + place memory', status: 'built', slideKind: 'memory', levels: ['A1', 'A2', 'B1'] },
  { id: 'shadow-match', name: 'Shadow match', how: 'match a picture to its silhouette', role: 'recognise', trains: 'visual discrimination', status: 'built', slideKind: 'shadow', levels: LOW },
  { id: 'spelling-rebuild', name: 'Spelling rebuild', how: 'drag letter tiles to build the word', role: 'deepen', trains: 'spelling', status: 'built', slideKind: 'spell', levels: ['A1', 'A2', 'B1'] },
  { id: 'sentence-build', name: 'Build the sentence', how: 'drag words into the right order', role: 'deepen', trains: 'word order + use', status: 'built', slideKind: 'build', levels: ALL },
  { id: 'number-games', name: 'Locker Pop / Number Train', how: 'open the locker or fill the carriage for the number word', role: 'recognise', trains: 'number words', status: 'built', slideKind: 'lockers', levels: LOW },
  { id: 'category-sort', name: 'Category sort', how: 'drop items into labelled baskets (feelings, countries, classroom words)', role: 'deepen', trains: 'grouping, recall by category', status: 'planned', levels: ALL },
  { id: 'kims-game', name: "Kim's game", how: 'look at six pictures; one disappears; say or pick which', role: 'deepen', trains: 'recall without cues', status: 'planned', levels: ALL },
  { id: 'triples', name: 'Triples', how: 'find three linked cards: word, picture, example sentence', role: 'deepen', trains: 'depth of knowledge', status: 'planned', levels: ALL },
  { id: 'sound-pairs', name: 'Sound pairs', how: 'match words that share a sound (cat, hat)', role: 'deepen', trains: 'phonics', status: 'planned', levels: LOW },
  { id: 'sentence-halves', name: 'Sentence halves', how: 'put two halves back together', role: 'deepen', trains: 'grammar + vocabulary', status: 'planned', levels: ALL },
  { id: 'odd-one-out', name: 'Odd one out', how: 'tap the word that does not belong, then say why', role: 'deepen', trains: 'categories', status: 'planned', levels: MID },
  { id: 'first-letter', name: 'First-letter match', how: 'match a picture to its first letter', role: 'recognise', trains: 'letter-sound', status: 'planned', levels: ['A1'] },
  { id: 'gap-fill', name: 'Fill the gap', how: 'pick the word that fits the sentence', role: 'deepen', trains: 'use in context', status: 'planned', levels: ALL },
  { id: 'say-it-memory', name: 'Memory, then say it', how: 'after a pair is found the student says the word (private, optional)', role: 'deepen', trains: 'production', status: 'planned', levels: ALL },
  { id: 'memory-palace', name: 'Memory palace walk', how: "walk through last lesson's scene and name the objects", role: 'deepen', trains: 'spaced retrieval', status: 'planned', levels: ALL },
  { id: 'tile-review', name: 'Tile-matching review', how: 'clear word and meaning tiles, calm, no timer', role: 'recognise', trains: 'review', status: 'planned', levels: MID },
  { id: 'connections', name: 'Connections', how: 'group 16 words into 4 hidden groups', role: 'deepen', trains: 'categories', status: 'planned', levels: ['B1', 'B2', 'C1'] },
  { id: 'snap', name: 'Snap', how: 'tap when picture and word agree, at a calm speed', role: 'recognise', trains: 'recognition speed', status: 'planned', levels: ALL },
];

export interface VocabGamePicks { first: string; second: string }

/** Suggest the two games for the `setIndex`-th word set of a lesson; rotates with the lesson number so neighbouring lessons differ. Built games only unless `allowPlanned`. */
export function suggestVocabGames(level: VocabGame['levels'][number], lessonNo: number, setIndex: number, allowPlanned = false): VocabGamePicks {
  const ok = (g: VocabGame) => g.levels.includes(level) && (allowPlanned || g.status === 'built');
  const pool = (role: VocabGameRole) => {
    const built = VOCAB_GAME_MENU.filter((g) => g.role === role && ok(g));
    // B2/C1 have no built recognition game yet: fall back to the planned ones (they must be built before such a lesson is made)
    return built.length ? built : VOCAB_GAME_MENU.filter((g) => g.role === role && g.levels.includes(level));
  };
  const first = pool('recognise');
  const second = pool('deepen');
  const n = lessonNo * 3 + setIndex;
  return { first: first[n % first.length].id, second: second[(n + 1) % second.length].id };
}

/** A lesson plan's choice is valid when both games are in the menu, are different, the first recognises and the second deepens, both suit the level. */
export function validateVocabGamePicks(level: VocabGame['levels'][number], p: VocabGamePicks): string[] {
  const errs: string[] = [];
  const a = VOCAB_GAME_MENU.find((g) => g.id === p.first);
  const b = VOCAB_GAME_MENU.find((g) => g.id === p.second);
  if (!a) errs.push(`unknown game: ${p.first}`);
  if (!b) errs.push(`unknown game: ${p.second}`);
  if (a && b) {
    if (a.id === b.id) errs.push('the two games must be different');
    if (a.role !== 'recognise') errs.push(`${a.id} is not a recognition game (use one first)`);
    if (b.role !== 'deepen') errs.push(`${b.id} is not a deepening game (use one second)`);
    for (const g of [a, b]) if (!g.levels.includes(level)) errs.push(`${g.id} does not suit ${level}`);
  }
  return errs;
}
