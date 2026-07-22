// Grammar system prompt — chained AFTER adaptive, BEFORE pronunciation in the pipeline.
// Constrains ALL downstream generation to the active grammar scope.

import { GRAMMAR_HUB_PROFILES } from './hubProfiles';
import type { GrammarPackage } from './types';

export function buildGrammarSystemPrompt(pkg: GrammarPackage): string {
  const profile = GRAMMAR_HUB_PROFILES[pkg.hub];
  const lines: string[] = [];

  lines.push('GRAMMAR ACQUISITION CONTRACT (binding):');
  lines.push(`- Active target: ${pkg.target.label} (id=${pkg.target.id}, scope=${pkg.target.scopeTokens.join(', ')}).`);
  lines.push(`- Hub: ${pkg.hub} | CEFR: ${pkg.cefr}`);
  lines.push(`- Explanation depth: ${profile.explanationDepth}.`);
  if (!profile.metalanguageAllowed) {
    lines.push('- Do NOT use grammar metalanguage (no "tense", "auxiliary", "conjugation").');
  }
  lines.push(`- Visual mode: ${profile.visualMode}. Highlight aux/ending/base/time/contraction/inversion.`);

  lines.push('');
  lines.push('FORM CARDS (must be respected as canonical — ALL FOUR required):');
  lines.push(`  Positive: ${pkg.formCards.positive.map((l) => l.text).join(' | ')}`);
  lines.push(`  Negative: ${pkg.formCards.negative.map((l) => l.text).join(' | ')}`);
  lines.push(`  Question: ${pkg.formCards.question.map((l) => l.text).join(' | ')}`);
  if (pkg.formCards.shortAnswers?.length) {
    lines.push(`  Short answers: ${pkg.formCards.shortAnswers.map((l) => l.text).join(' | ')}`);
  }
  if (pkg.formCards.contractions?.length) {
    lines.push(`  Contractions: ${pkg.formCards.contractions.map((l) => l.text).join(' | ')}`);
  }

  lines.push('');
  lines.push('HARD CONSTRAINTS:');
  lines.push(`- All exercises must target ONLY '${pkg.target.label}' — no other tenses/structures.`);
  lines.push('- Every grammar block MUST present affirmative, negative, AND question forms with contractions.');
  lines.push('- Drilling is required across THREE tiers: substitution → guided practice → controlled practice → communicative practice.');
  lines.push('- Include at least one SPEAKING moment per grammar block.');
  lines.push('- Grammar must serve communication: every example should be something a real speaker would say.');
  lines.push('- Use inline highlight markup on every example: wrap target tokens with <hl role="aux|verb|ending|base|time|contraction|inversion">…</hl>. Highlight verbs, auxiliary verbs, and inflections (e.g. third-person -s).');
  if (profile.forbidden.length) {
    lines.push(`- Forbidden activity styles: ${profile.forbidden.join(', ')}.`);
  }

  lines.push('');
  lines.push('PRODUCTION CONTEXTS to favor:');
  lines.push(`- ${profile.productionContexts.join(', ')}`);

  // Reported-speech backshift contract (Rule 3 of QA cleanup).
  if (/reported|backshift/i.test(pkg.target.label) || /reported|backshift/i.test(pkg.target.id)) {
    lines.push('');
    lines.push('REPORTED SPEECH BACKSHIFT TABLE (binding when reporting verb is past):');
    lines.push('  Present Simple      → Past Simple        (am/is/are → was/were ; do/does → did ; have/has → had)');
    lines.push('  Present Continuous  → Past Continuous    (am/is/are V-ing → was/were V-ing)');
    lines.push('  Present Perfect     → Past Perfect       (have/has V3 → had V3)');
    lines.push('  Past Simple         → Past Perfect       (went → had gone)');
    lines.push('  will                → would');
    lines.push('  can                 → could');
    lines.push('  may                 → might');
    lines.push('  must                → had to');
    lines.push('Every reported-speech pair you emit MUST conform. Never leave "will/can/may/must/am/is/are" in the reported clause.');
  }

  return lines.join('\n');
}
