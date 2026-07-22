// Phonics pseudoword overlay — supports Phonics Screening Check style
// "decode-only" probes. Pseudowords are real-phonics, non-real-meaning strings
// that prove the child decoded from sounds rather than memorized the whole word.
//
// READ-ONLY overlay. Locked phonics engine is not modified; Cycle-5 Playground
// activity wrappers import this directly.

export interface PseudowordSet {
  patternKey: string;       // e.g. 'silent_e', 'cvc_short_a'
  examples: string[];       // legal pseudowords for the pattern
  realDistractors: string[]; // optional real words to mix in for variety
}

export const PHONICS_PSEUDOWORDS: PseudowordSet[] = [
  { patternKey: 'cvc_short_a', examples: ['vap', 'zab', 'lan', 'mag'], realDistractors: ['cat', 'ham'] },
  { patternKey: 'cvc_short_i', examples: ['vid', 'zim', 'fip'], realDistractors: ['pig', 'tin'] },
  { patternKey: 'cvc_short_o', examples: ['vop', 'zol', 'mog'], realDistractors: ['dog', 'top'] },
  { patternKey: 'silent_e', examples: ['vope', 'mide', 'lome', 'kade'], realDistractors: ['cake', 'time'] },
  { patternKey: 'digraph_sh', examples: ['shum', 'vesh', 'sholt'], realDistractors: ['ship', 'fish'] },
  { patternKey: 'digraph_ch', examples: ['chab', 'vech', 'cholm'], realDistractors: ['chip', 'much'] },
  { patternKey: 'blend_tr', examples: ['trom', 'tref', 'trun', 'trib'], realDistractors: ['tree', 'trip'] },
  { patternKey: 'blend_st', examples: ['stog', 'stib', 'stum'], realDistractors: ['stop', 'star'] },
  { patternKey: 'vowel_team_ea', examples: ['veam', 'zean'], realDistractors: ['team', 'read'] },
];

export function pseudowordsFor(patternKey: string): string[] {
  return PHONICS_PSEUDOWORDS.find((p) => p.patternKey === patternKey)?.examples ?? [];
}

/** Returns a deterministic decoding probe: 2 pseudowords + 1 real word per pattern. */
export function buildDecodingProbe(patternKey: string): Array<{ word: string; isPseudoword: boolean }> {
  const set = PHONICS_PSEUDOWORDS.find((p) => p.patternKey === patternKey);
  if (!set) return [];
  return [
    { word: set.examples[0], isPseudoword: true },
    { word: set.examples[1] ?? set.examples[0], isPseudoword: true },
    { word: set.realDistractors[0] ?? set.examples[0], isPseudoword: false },
  ];
}
