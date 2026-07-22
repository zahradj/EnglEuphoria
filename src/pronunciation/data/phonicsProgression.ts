// Standalone phonics progression — Playground-first, systematic synthetic phonics.
// Five canonical phases: sounds → cvc → digraphs → blends → advanced.
// Order is canonical and must not be shuffled.

import type { PhonicsPhase, PhonicsUnit } from '../types';

export const PHONICS_PROGRESSION: PhonicsUnit[] = [
  // ───────── Phase 1: SOUNDS ─────────
  {
    id: 'ph_u1', order: 1, phase: 'sounds',
    graphemes: ['s', 'a', 't', 'p'],
    phonemes: ['/s/', '/æ/', '/t/', '/p/'],
    skill: 'phonemic_awareness',
    sight_words: ['a', 'at'],
    reading_stage: 'pre_reader',
  },
  {
    id: 'ph_u2', order: 2, phase: 'sounds',
    graphemes: ['i', 'n', 'm', 'd'],
    phonemes: ['/ɪ/', '/n/', '/m/', '/d/'],
    skill: 'phonemic_awareness',
    sight_words: ['in', 'and', 'is'],
    reading_stage: 'pre_reader',
  },

  // ───────── Phase 2: CVC ─────────
  {
    id: 'ph_u3', order: 3, phase: 'cvc',
    graphemes: ['g', 'o', 'c', 'k'],
    phonemes: ['/g/', '/ɒ/', '/k/', '/k/'],
    skill: 'blending',
    blend_targets: ['sat', 'pat', 'tap', 'tin', 'man', 'dog', 'cat'],
    sight_words: ['it', 'on', 'can'],
    reading_stage: 'early_decoder',
  },
  {
    id: 'ph_u4', order: 4, phase: 'cvc',
    graphemes: ['e', 'u', 'r', 'h', 'b'],
    phonemes: ['/e/', '/ʌ/', '/r/', '/h/', '/b/'],
    skill: 'blending',
    blend_targets: ['red', 'run', 'hen', 'bag', 'bus'],
    sight_words: ['he', 'be', 'no'],
    reading_stage: 'early_decoder',
  },
  {
    id: 'ph_u5', order: 5, phase: 'cvc',
    graphemes: ['f', 'l', 'j', 'v', 'w'],
    phonemes: ['/f/', '/l/', '/dʒ/', '/v/', '/w/'],
    skill: 'segmenting',
    blend_targets: ['fan', 'log', 'jam', 'van', 'win'],
    sight_words: ['I', 'go', 'we', 'me'],
    reading_stage: 'early_decoder',
  },
  {
    id: 'ph_u6', order: 6, phase: 'cvc',
    graphemes: ['y', 'x', 'z', 'qu'],
    phonemes: ['/j/', '/ks/', '/z/', '/kw/'],
    skill: 'decoding',
    blend_targets: ['yes', 'box', 'zip', 'quiz'],
    sight_words: ['yes', 'see', 'you'],
    reading_stage: 'developing_decoder',
  },

  // ───────── Phase 3: DIGRAPHS ─────────
  {
    id: 'ph_u7', order: 7, phase: 'digraphs',
    graphemes: ['ch', 'sh', 'th', 'ng'],
    phonemes: ['/tʃ/', '/ʃ/', '/θ/', '/ŋ/'],
    skill: 'digraphs',
    blend_targets: ['chip', 'ship', 'thin', 'sing'],
    sight_words: ['the', 'this', 'they'],
    reading_stage: 'developing_decoder',
  },
  {
    id: 'ph_u8', order: 8, phase: 'digraphs',
    graphemes: ['ai', 'ee', 'oa', 'oo'],
    phonemes: ['/eɪ/', '/iː/', '/əʊ/', '/uː/'],
    skill: 'digraphs',
    blend_targets: ['rain', 'see', 'boat', 'moon'],
    sight_words: ['my', 'are', 'said'],
    reading_stage: 'fluent_decoder',
  },

  // ───────── Phase 4: BLENDS ─────────
  {
    id: 'ph_u9', order: 9, phase: 'blends',
    graphemes: ['bl', 'cl', 'fl', 'gl', 'pl', 'sl'],
    phonemes: ['/bl/', '/kl/', '/fl/', '/gl/', '/pl/', '/sl/'],
    skill: 'blends',
    blend_targets: ['black', 'clap', 'flag', 'glad', 'plum', 'slip'],
    sight_words: ['was', 'her', 'one'],
    reading_stage: 'fluent_decoder',
  },
  {
    id: 'ph_u10', order: 10, phase: 'blends',
    graphemes: ['br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr'],
    phonemes: ['/br/', '/kr/', '/dr/', '/fr/', '/gr/', '/pr/', '/tr/'],
    skill: 'blends',
    blend_targets: ['brown', 'crab', 'drum', 'frog', 'grass', 'prize', 'truck'],
    sight_words: ['from', 'when', 'were'],
    reading_stage: 'fluent_decoder',
  },
  {
    id: 'ph_u11', order: 11, phase: 'blends',
    graphemes: ['str', 'spr', 'scr', 'spl'],
    phonemes: ['/str/', '/spr/', '/skr/', '/spl/'],
    skill: 'blends',
    blend_targets: ['string', 'spring', 'scrap', 'splash'],
    sight_words: ['there', 'their', 'what'],
    reading_stage: 'fluent_decoder',
  },

  // ───────── Phase 5: ADVANCED ─────────
  {
    id: 'ph_u12', order: 12, phase: 'advanced',
    graphemes: ['silent-e', 'igh', 'eigh', 'ough'],
    phonemes: ['/aɪ/', '/aɪ/', '/eɪ/', '/ɔː|ʌf|aʊ/'],
    skill: 'advanced',
    blend_targets: ['cake', 'light', 'eight', 'thought'],
    sight_words: ['through', 'could', 'would'],
    reading_stage: 'advanced_reader',
  },
  {
    id: 'ph_u13', order: 13, phase: 'advanced',
    graphemes: ['kn', 'wr', 'gn', 'mb'],
    phonemes: ['/n/', '/r/', '/n/', '/m/'],
    skill: 'advanced',
    blend_targets: ['knee', 'write', 'gnome', 'lamb'],
    sight_words: ['know', 'write', 'climb'],
    reading_stage: 'advanced_reader',
  },
  {
    id: 'ph_u14', order: 14, phase: 'advanced',
    graphemes: ['schwa(a)', 'schwa(e)', 'schwa(o)'],
    phonemes: ['/ə/', '/ə/', '/ə/'],
    skill: 'advanced',
    blend_targets: ['banana', 'taken', 'lemon'],
    sight_words: ['about', 'again', 'other'],
    reading_stage: 'advanced_reader',
  },
];

export function unitsForReadingStage(stage: PhonicsUnit['reading_stage']): PhonicsUnit[] {
  return PHONICS_PROGRESSION.filter((u) => u.reading_stage === stage);
}

export function unitsForPhase(phase: PhonicsPhase): PhonicsUnit[] {
  return PHONICS_PROGRESSION.filter((u) => u.phase === phase);
}

export function nextPhonicsUnit(completedIds: string[]): PhonicsUnit | null {
  for (const u of PHONICS_PROGRESSION) {
    if (!completedIds.includes(u.id)) return u;
  }
  return null;
}

export const PHONICS_PHASES: PhonicsPhase[] = ['sounds', 'cvc', 'digraphs', 'blends', 'advanced'];
