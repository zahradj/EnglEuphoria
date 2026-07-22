// Wraps grammar targets into communicative directives — never isolated drills.

import type { GenerationContext } from '../types';

export function buildGrammarDirectives(ctx: GenerationContext): string {
  const targets = ctx.state.grammar.target_grammar;
  if (!targets.length) return 'Grammar: no new structure — recycle review structures naturally.';
  return [
    'Grammar use:',
    `- TARGET structures to surface contextually: ${targets.join(', ')}`,
    '- Embed each structure inside a scenario sentence the character would naturally say.',
    '- DO NOT write meta-explanations ("This is the present perfect..."). Show, don\'t tell.',
    '- DO NOT generate isolated conjugation drills.',
  ].join('\n');
}
