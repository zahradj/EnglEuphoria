// IPA (International Phonetic Alphabet) utilities for English language learning

// Common English IPA vowel sounds
export const IPA_VOWELS = {
  short: ['ɪ', 'e', 'æ', 'ɒ', 'ʊ', 'ʌ', 'ə'],
  long: ['iː', 'ɑː', 'ɔː', 'uː', 'ɜː'],
  diphthongs: ['eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə'],
};

// Common English IPA consonant sounds
export const IPA_CONSONANTS = {
  plosives: ['p', 'b', 't', 'd', 'k', 'g'],
  fricatives: ['f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h'],
  affricates: ['tʃ', 'dʒ'],
  nasals: ['m', 'n', 'ŋ'],
  approximants: ['l', 'r', 'j', 'w'],
};

// Stress and length markers
export const IPA_MARKERS = {
  stress: ['ˈ', 'ˌ'],
  length: ['ː'],
  syllable: ['.'],
  linking: ['‿'],
};

// All IPA symbols grouped for keyboard display
export const IPA_KEYBOARD_LAYOUT = {
  'Short Vowels': IPA_VOWELS.short,
  'Long Vowels': IPA_VOWELS.long,
  'Diphthongs': IPA_VOWELS.diphthongs,
  'Plosives': IPA_CONSONANTS.plosives,
  'Fricatives': IPA_CONSONANTS.fricatives,
  'Affricates': IPA_CONSONANTS.affricates,
  'Nasals': IPA_CONSONANTS.nasals,
  'Approximants': IPA_CONSONANTS.approximants,
  'Markers': [...IPA_MARKERS.stress, ...IPA_MARKERS.length, ...IPA_MARKERS.syllable],
};

// Common English word IPA patterns for validation
export const COMMON_IPA_PATTERNS: Record<string, string> = {
  'the': 'ðə',
  'a': 'ə',
  'an': 'ən',
  'is': 'ɪz',
  'are': 'ɑː',
  'was': 'wɒz',
  'were': 'wɜː',
  'be': 'biː',
  'been': 'biːn',
  'being': 'ˈbiːɪŋ',
  'have': 'hæv',
  'has': 'hæz',
  'had': 'hæd',
  'do': 'duː',
  'does': 'dʌz',
  'did': 'dɪd',
  'will': 'wɪl',
  'would': 'wʊd',
  'can': 'kæn',
  'could': 'kʊd',
  'should': 'ʃʊd',
  'may': 'meɪ',
  'might': 'maɪt',
  'must': 'mʌst',
  'hello': 'həˈləʊ',
  'goodbye': 'ɡʊdˈbaɪ',
  'thank': 'θæŋk',
  'please': 'pliːz',
  'sorry': 'ˈsɒri',
  'yes': 'jes',
  'no': 'nəʊ',
};

// Validate if a string contains only valid IPA characters
export function isValidIPA(text: string): boolean {
  const allSymbols = [
    ...IPA_VOWELS.short,
    ...IPA_VOWELS.long,
    ...IPA_VOWELS.diphthongs,
    ...IPA_CONSONANTS.plosives,
    ...IPA_CONSONANTS.fricatives,
    ...IPA_CONSONANTS.affricates,
    ...IPA_CONSONANTS.nasals,
    ...IPA_CONSONANTS.approximants,
    ...IPA_MARKERS.stress,
    ...IPA_MARKERS.length,
    ...IPA_MARKERS.syllable,
    ...IPA_MARKERS.linking,
    ' ', // Allow spaces
  ];

  // Check each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const twoChar = text.substring(i, i + 2);
    
    // Check for two-character symbols first
    if (allSymbols.includes(twoChar)) {
      i++; // Skip next character
      continue;
    }
    
    if (!allSymbols.includes(char)) {
      return false;
    }
  }
  
  return true;
}

// Check if IPA transcription looks reasonable for English
export function validateIPATranscription(ipa: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!ipa || ipa.trim().length === 0) {
    return { isValid: false, issues: ['IPA transcription is empty'] };
  }

  // Remove slashes and brackets if present
  const cleanIpa = ipa.replace(/[/\[\]]/g, '').trim();

  // Check for basic validity
  if (!isValidIPA(cleanIpa)) {
    issues.push('Contains invalid IPA characters');
  }

  // Check for common issues
  if (cleanIpa.includes('?')) {
    issues.push('Contains question marks - likely placeholder');
  }

  if (/[A-Z]/.test(cleanIpa)) {
    issues.push('Contains uppercase letters - should be lowercase IPA symbols');
  }

  if (/[0-9]/.test(cleanIpa)) {
    issues.push('Contains numbers - IPA should not have numbers');
  }

  // Check for stress markers in multi-syllable words
  const syllableCount = cleanIpa.split(/[aeiouɪɛæɑɒɔʊʌəɜ]/).length - 1;
  if (syllableCount > 1 && !cleanIpa.includes('ˈ') && !cleanIpa.includes('ˌ')) {
    issues.push('Multi-syllable word may be missing stress marker (ˈ or ˌ)');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

// Get IPA symbol description for tooltip
export function getIPADescription(symbol: string): string {
  const descriptions: Record<string, string> = {
    // Vowels
    'ɪ': 'Short i (kit, bit)',
    'iː': 'Long ee (fleece, see)',
    'e': 'Short e (dress, bed)',
    'æ': 'Short a (trap, cat)',
    'ɑː': 'Long ah (bath, father)',
    'ɒ': 'Short o (lot, hot)',
    'ɔː': 'Long aw (thought, law)',
    'ʊ': 'Short oo (foot, put)',
    'uː': 'Long oo (goose, too)',
    'ʌ': 'Short u (strut, cup)',
    'ɜː': 'Long er (nurse, bird)',
    'ə': 'Schwa (about, comma)',
    // Diphthongs
    'eɪ': 'Long a (face, day)',
    'aɪ': 'Long i (price, my)',
    'ɔɪ': 'oy (choice, boy)',
    'aʊ': 'ow (mouth, now)',
    'əʊ': 'Long o (goat, no)',
    'ɪə': 'ear (near, here)',
    'eə': 'air (square, fair)',
    'ʊə': 'oor (cure, tour)',
    // Consonants
    'θ': 'Voiceless th (think)',
    'ð': 'Voiced th (this)',
    'ʃ': 'sh (ship)',
    'ʒ': 'zh (measure)',
    'tʃ': 'ch (church)',
    'dʒ': 'j (judge)',
    'ŋ': 'ng (sing)',
    'j': 'y (yes)',
    // Markers
    'ˈ': 'Primary stress',
    'ˌ': 'Secondary stress',
    'ː': 'Long vowel',
  };

  return descriptions[symbol] || symbol;
}

// Format IPA with slashes
export function formatIPA(ipa: string): string {
  const clean = ipa.replace(/[/\[\]]/g, '').trim();
  return `/${clean}/`;
}
