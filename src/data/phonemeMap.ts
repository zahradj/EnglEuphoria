// Phoneme definitions and ordering for the Map of Sounds
export interface PhonemeDefinition {
  symbol: string;
  example: string;
  category: 'short_vowel' | 'long_vowel' | 'consonant' | 'digraph';
  displayLabel: string;
}

export const PHONEME_MAP: PhonemeDefinition[] = [
  // Short Vowels
  { symbol: '/æ/', example: 'cat', category: 'short_vowel', displayLabel: 'a' },
  { symbol: '/ɛ/', example: 'bed', category: 'short_vowel', displayLabel: 'e' },
  { symbol: '/ɪ/', example: 'sit', category: 'short_vowel', displayLabel: 'i' },
  { symbol: '/ɒ/', example: 'hot', category: 'short_vowel', displayLabel: 'o' },
  { symbol: '/ʌ/', example: 'cup', category: 'short_vowel', displayLabel: 'u' },

  // Long Vowels
  { symbol: '/eɪ/', example: 'cake', category: 'long_vowel', displayLabel: 'ā' },
  { symbol: '/iː/', example: 'tree', category: 'long_vowel', displayLabel: 'ē' },
  { symbol: '/aɪ/', example: 'kite', category: 'long_vowel', displayLabel: 'ī' },
  { symbol: '/oʊ/', example: 'bone', category: 'long_vowel', displayLabel: 'ō' },
  { symbol: '/juː/', example: 'cute', category: 'long_vowel', displayLabel: 'ū' },

  // Consonants
  { symbol: '/b/', example: 'bat', category: 'consonant', displayLabel: 'b' },
  { symbol: '/k/', example: 'cat', category: 'consonant', displayLabel: 'c' },
  { symbol: '/d/', example: 'dog', category: 'consonant', displayLabel: 'd' },
  { symbol: '/f/', example: 'fish', category: 'consonant', displayLabel: 'f' },
  { symbol: '/ɡ/', example: 'go', category: 'consonant', displayLabel: 'g' },
  { symbol: '/h/', example: 'hat', category: 'consonant', displayLabel: 'h' },
  { symbol: '/dʒ/', example: 'jump', category: 'consonant', displayLabel: 'j' },
  { symbol: '/l/', example: 'leg', category: 'consonant', displayLabel: 'l' },
  { symbol: '/m/', example: 'map', category: 'consonant', displayLabel: 'm' },
  { symbol: '/n/', example: 'net', category: 'consonant', displayLabel: 'n' },
  { symbol: '/p/', example: 'pen', category: 'consonant', displayLabel: 'p' },
  { symbol: '/r/', example: 'red', category: 'consonant', displayLabel: 'r' },
  { symbol: '/s/', example: 'sun', category: 'consonant', displayLabel: 's' },
  { symbol: '/t/', example: 'top', category: 'consonant', displayLabel: 't' },
  { symbol: '/v/', example: 'van', category: 'consonant', displayLabel: 'v' },
  { symbol: '/w/', example: 'wet', category: 'consonant', displayLabel: 'w' },
  { symbol: '/j/', example: 'yes', category: 'consonant', displayLabel: 'y' },
  { symbol: '/z/', example: 'zip', category: 'consonant', displayLabel: 'z' },

  // Digraphs
  { symbol: '/ʃ/', example: 'ship', category: 'digraph', displayLabel: 'sh' },
  { symbol: '/tʃ/', example: 'chip', category: 'digraph', displayLabel: 'ch' },
  { symbol: '/θ/', example: 'thin', category: 'digraph', displayLabel: 'th' },
  { symbol: '/ŋ/', example: 'ring', category: 'digraph', displayLabel: 'ng' },
];

export const CATEGORY_LABELS: Record<PhonemeDefinition['category'], string> = {
  short_vowel: 'Short Vowels',
  long_vowel: 'Long Vowels',
  consonant: 'Consonants',
  digraph: 'Digraphs',
};

export type MasteryLevel = 'unseen' | 'introduced' | 'practiced' | 'mastered';

export const MASTERY_COLORS: Record<MasteryLevel, { bg: string; border: string; text: string }> = {
  unseen: { bg: 'bg-muted/50', border: 'border-border', text: 'text-muted-foreground' },
  introduced: { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300' },
  practiced: { bg: 'bg-slate-100 dark:bg-slate-800/50', border: 'border-slate-400 dark:border-slate-500', text: 'text-slate-700 dark:text-slate-300' },
  mastered: { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-400 dark:border-amber-600', text: 'text-amber-700 dark:text-amber-300' },
};
