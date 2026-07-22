// Regex fingerprints for common English grammar constructs.
// Used by grammarEngine to detect blocked constructs in generated text.
// Patterns are intentionally conservative — false negatives preferred over
// false positives. Tune as we collect repair feedback.

export interface GrammarFingerprint {
  id: string;          // canonical name used in policy.blocked_grammar
  aliases: string[];   // alternative names a teacher might write
  // Word-boundary regex that matches a STRONG signal of the construct.
  pattern: RegExp;
}

export const GRAMMAR_FINGERPRINTS: GrammarFingerprint[] = [
  {
    id: 'Passive Voice',
    aliases: ['passive', 'passive voice'],
    // "was/were/is/are/been + past participle" — heuristic, requires "by" nearby for confidence.
    pattern: /\b(?:was|were|is|are|been|being)\s+\w+(?:ed|en)\b(?:[^.?!]{0,40}\bby\b)/i,
  },
  {
    id: 'Future Perfect',
    aliases: ['future perfect'],
    pattern: /\bwill\s+have\s+\w+(?:ed|en)\b/i,
  },
  {
    id: 'Future Perfect Continuous',
    aliases: ['future perfect continuous', 'future perfect progressive'],
    pattern: /\bwill\s+have\s+been\s+\w+ing\b/i,
  },
  {
    id: 'Past Perfect',
    aliases: ['past perfect', 'pluperfect'],
    pattern: /\bhad\s+\w+(?:ed|en)\b/i,
  },
  {
    id: 'Past Perfect Continuous',
    aliases: ['past perfect continuous', 'past perfect progressive'],
    pattern: /\bhad\s+been\s+\w+ing\b/i,
  },
  {
    id: 'Third Conditional',
    aliases: ['third conditional', '3rd conditional'],
    pattern: /\bif\s+\w+\s+had\s+\w+(?:ed|en)\b[^.?!]{0,60}\bwould\s+have\b/i,
  },
  {
    id: 'Second Conditional',
    aliases: ['second conditional', '2nd conditional'],
    pattern: /\bif\s+\w+\s+(?:were|was)\b[^.?!]{0,40}\bwould\b/i,
  },
  {
    id: 'Mixed Conditional',
    aliases: ['mixed conditional'],
    pattern: /\bif\s+\w+\s+had\s+\w+(?:ed|en)\b[^.?!]{0,60}\bwould\b(?!\s+have)/i,
  },
  {
    id: 'Subjunctive',
    aliases: ['subjunctive'],
    pattern: /\b(?:suggest|recommend|insist|demand|require|propose)\s+that\s+\w+\s+\w+\b/i,
  },
  {
    id: 'Inversion',
    aliases: ['inversion', 'subject-aux inversion'],
    pattern: /\b(?:not only|never|rarely|seldom|hardly|no sooner|little|nowhere|only then)\b[^.?!]{0,8}\b(?:did|does|do|have|has|had|is|was|were|will|would|can|could|should)\s+\w+/i,
  },
  {
    id: 'Reported Speech Backshift',
    aliases: ['reported speech', 'reported speech backshift'],
    pattern: /\b(?:said|told|asked|claimed|reported)\s+(?:that\s+)?\w+\s+(?:had|would|could|might)\b/i,
  },
  {
    id: 'Causative Have',
    aliases: ['causative', 'causative have', 'have something done'],
    pattern: /\b(?:have|has|had|get|got|getting)\s+(?:my|your|his|her|our|their|the|a|an)\s+\w+\s+\w+(?:ed|en)\b/i,
  },
  {
    id: 'Present Perfect Continuous',
    aliases: ['present perfect continuous', 'present perfect progressive'],
    pattern: /\b(?:have|has)\s+been\s+\w+ing\b/i,
  },
  {
    id: 'Present Perfect',
    aliases: ['present perfect'],
    pattern: /\b(?:have|has)\s+\w+(?:ed|en)\b/i,
  },
  {
    id: 'Past Continuous',
    aliases: ['past continuous', 'past progressive'],
    pattern: /\b(?:was|were)\s+\w+ing\b/i,
  },
  {
    id: 'Modal Perfect',
    aliases: ['modal perfect', 'must have', 'should have'],
    pattern: /\b(?:must|should|could|would|may|might)\s+have\s+\w+(?:ed|en)\b/i,
  },
  {
    id: 'Relative Clauses',
    aliases: ['relative clauses', 'defining relative clause', 'non-defining relative clause'],
    pattern: /,\s*(?:which|who|whom|whose)\b/i,
  },
];

/** Resolve a free-form policy label to a fingerprint id. */
export function resolveGrammarLabel(label: string): GrammarFingerprint | undefined {
  const norm = label.trim().toLowerCase();
  return GRAMMAR_FINGERPRINTS.find(
    (g) => g.id.toLowerCase() === norm || g.aliases.some((a) => a.toLowerCase() === norm),
  );
}
