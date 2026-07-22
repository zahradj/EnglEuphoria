// Grammar Acquisition Engine — orchestrator entry.
// Pure, deterministic core. Future AI enrichment hooks into formCards + drills.

import { buildFormCard } from './formCards';
import { buildAcquisitionFlow } from './acquisitionFlow';
import { highlightSentence } from './highlighter';
import { selectDrills } from './drills/drillSelector';
import { validateGrammarPackage } from './grammarValidator';
import { buildGrammarSystemPrompt } from './promptInjector';
import type { GrammarPackage, RunGrammarInput } from './types';

export const GRAMMAR_ENGINE_VERSION = '1.0.0';

/**
 * runGrammar — produces the full GrammarPackage for the active target.
 * Stage in pipeline: AFTER adaptive, BEFORE pronunciation.
 */
export function runGrammar(input: RunGrammarInput): GrammarPackage {
  const { hub, cefr, target } = input;

  const formCards = buildFormCard(target);
  const acquisitionFlow = buildAcquisitionFlow(target, hub);
  const { drills, productionTasks } = selectDrills(hub, cefr, target);

  // Canonical highlights = union of all form-card highlights.
  const highlights = [
    ...formCards.positive.flatMap((l) => l.highlights),
    ...formCards.negative.flatMap((l) => l.highlights),
    ...formCards.question.flatMap((l) => l.highlights),
    ...(formCards.shortAnswers?.flatMap((l) => l.highlights) ?? []),
  ];

  const validation = validateGrammarPackage({
    target, hub, formCards, drills, productionTasks,
  });

  const pkgWithoutPrompt: Omit<GrammarPackage, 'systemPrompt'> = {
    target,
    hub,
    cefr,
    formCards,
    highlights,
    acquisitionFlow,
    drills,
    productionTasks,
    validation,
    meta: {
      generatedAt: new Date().toISOString(),
      version: GRAMMAR_ENGINE_VERSION,
    },
  };

  const systemPrompt = buildGrammarSystemPrompt({ ...pkgWithoutPrompt, systemPrompt: '' });

  return { ...pkgWithoutPrompt, systemPrompt };
}

export * from './types';
export { buildGrammarSystemPrompt } from './promptInjector';
export { highlightSentence, highlightRoleClass } from './highlighter';
export { GRAMMAR_HUB_PROFILES } from './hubProfiles';
