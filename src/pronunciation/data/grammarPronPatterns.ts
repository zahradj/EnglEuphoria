// Grammar-driven pronunciation pattern derivation.
// Example: Past Simple → -ed endings /t/ /d/ /ɪd/.

import type { PronunciationFocus } from '../types';

interface GrammarPatternRule {
  matches: RegExp;
  focus: PronunciationFocus;
}

const GRAMMAR_PRON_RULES: GrammarPatternRule[] = [
  {
    matches: /past simple|simple past|-ed/i,
    focus: {
      pronunciation_focus: 'Regular past tense -ed endings',
      target_sounds: ['/t/', '/d/', '/ɪd/'],
      stress_patterns: [],
      intonation_patterns: [],
      connected_speech_targets: [],
      common_pronunciation_errors: [
        'adding an extra syllable to /t/ or /d/ endings (e.g., "walked-ed")',
        'voicing /t/ where /d/ is required and vice versa',
      ],
    },
  },
  {
    matches: /third person|3rd person|present simple -s/i,
    focus: {
      pronunciation_focus: 'Third-person -s endings',
      target_sounds: ['/s/', '/z/', '/ɪz/'],
      stress_patterns: [],
      intonation_patterns: [],
      connected_speech_targets: [],
      common_pronunciation_errors: [
        'using /s/ after voiced consonants',
        'omitting /ɪz/ after sibilants',
      ],
    },
  },
  {
    matches: /question|wh-?question|yes\/?no question/i,
    focus: {
      pronunciation_focus: 'Question intonation',
      target_sounds: [],
      stress_patterns: [],
      intonation_patterns: ['rising for yes/no questions', 'falling for wh-questions'],
      connected_speech_targets: [],
      common_pronunciation_errors: [
        'flat intonation on yes/no questions',
        'rising intonation on wh-questions',
      ],
    },
  },
  {
    matches: /going to|gonna|future/i,
    focus: {
      pronunciation_focus: 'Connected speech: "going to" → /ˈɡənə/',
      target_sounds: [],
      stress_patterns: [],
      intonation_patterns: [],
      connected_speech_targets: ['going to → gonna', 'want to → wanna'],
      common_pronunciation_errors: [
        'over-articulating each word in fast speech',
      ],
    },
  },
  {
    matches: /present perfect/i,
    focus: {
      pronunciation_focus: 'Contracted "have/has" + past participle',
      target_sounds: [],
      stress_patterns: ['I\'ve SEEN', 'she\'s GONE'],
      intonation_patterns: [],
      connected_speech_targets: ["I have → I've", 'she has → she\'s'],
      common_pronunciation_errors: ['placing stress on the auxiliary'],
    },
  },
];

export function focusFromGrammarTargets(targets: string[]): PronunciationFocus | null {
  for (const t of targets) {
    for (const rule of GRAMMAR_PRON_RULES) {
      if (rule.matches.test(t)) return rule.focus;
    }
  }
  return null;
}
