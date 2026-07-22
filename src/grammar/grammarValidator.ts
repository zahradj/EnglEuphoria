// Validator for a generated GrammarPackage.

import { GRAMMAR_HUB_PROFILES } from './hubProfiles';
import type {
  DrillSpec,
  FormCard,
  GrammarTarget,
  GrammarValidationIssue,
  GrammarValidationReport,
} from './types';
import type { Hub } from '@/governance/types';

function formComplete(card: FormCard): boolean {
  return card.positive.length > 0 && card.negative.length > 0 && card.question.length > 0;
}

export function validateGrammarPackage(args: {
  target: GrammarTarget;
  hub: Hub;
  formCards: FormCard;
  drills: DrillSpec[];
  productionTasks: DrillSpec[];
}): GrammarValidationReport {
  const { target, hub, formCards, drills, productionTasks } = args;
  const profile = GRAMMAR_HUB_PROFILES[hub];
  const issues: GrammarValidationIssue[] = [];

  if (!formComplete(formCards)) {
    issues.push({
      code: 'form_cards_incomplete',
      severity: 'hard',
      message: 'Form cards must include positive, negative, and question forms.',
    });
  }

  if (!formCards.contractions || formCards.contractions.length === 0) {
    issues.push({
      code: 'GRAMMAR_FORM_MISSING',
      severity: 'hard',
      message: 'Form cards must include contractions (e.g., "don\'t", "doesn\'t", "isn\'t").',
    });
  }

  // Tier coverage: substitution + guided + controlled + communicative must all exist.
  const stages = new Set([...drills, ...productionTasks].map((d) => d.stage));
  const types = new Set([...drills, ...productionTasks].map((d) => d.type));
  const requiredStages: Array<['controlled' | 'semi_controlled' | 'free', string]> = [
    ['controlled', 'controlled practice'],
    ['semi_controlled', 'guided/semi-controlled practice'],
    ['free', 'communicative/free practice'],
  ];
  for (const [stage, label] of requiredStages) {
    if (!stages.has(stage)) {
      issues.push({
        code: 'GRAMMAR_PRACTICE_TIER_MISSING',
        severity: 'hard',
        message: `Missing ${label} tier.`,
      });
    }
  }
  if (!types.has('substitution')) {
    issues.push({
      code: 'GRAMMAR_SUBSTITUTION_MISSING',
      severity: 'hard',
      message: 'At least one substitution drill is required.',
    });
  }

  // Highlight markup coverage — warn if no example line carries highlights.
  const sampleHasHighlights =
    formCards.positive.some((l) => l.highlights?.length > 0) ||
    formCards.negative.some((l) => l.highlights?.length > 0) ||
    formCards.question.some((l) => l.highlights?.length > 0);
  if (!sampleHasHighlights) {
    issues.push({
      code: 'GRAMMAR_HIGHLIGHTS_MISSING',
      severity: 'soft',
      message: 'No highlight markup found on form-card examples (aux/verb/ending/time).',
    });
  }

  const drillTypes = new Set(drills.map((d) => d.type));
  if (drills.length < profile.minDrillCount) {
    issues.push({
      code: 'drill_count_below_min',
      severity: 'soft',
      message: `Hub ${hub} requires at least ${profile.minDrillCount} drills (got ${drills.length}).`,
    });
  }

  const speakingDrills = [...drills, ...productionTasks].filter(
    (d) => d.type === 'speaking' || d.type === 'pron_linked',
  ).length;
  if (speakingDrills < profile.speakingDrillMin) {
    issues.push({
      code: 'speaking_drill_min',
      severity: 'hard',
      message: `Need ≥${profile.speakingDrillMin} speaking/pron drills (got ${speakingDrills}).`,
    });
  }

  for (const forbidden of profile.forbidden) {
    if (drillTypes.has(forbidden as DrillSpec['type'])) {
      issues.push({
        code: 'forbidden_drill_for_hub',
        severity: 'hard',
        message: `Drill type '${forbidden}' is not allowed in hub '${hub}'.`,
      });
    }
  }

  const hasFreeProduction = productionTasks.some((t) => t.stage === 'free');
  if (!hasFreeProduction) {
    issues.push({
      code: 'missing_free_production',
      severity: 'soft',
      message: 'No free-production task generated.',
    });
  }

  // Scope drift: drills targeting other grammar IDs.
  const drift = [...drills, ...productionTasks].filter((d) => d.grammarTarget !== target.id);
  if (drift.length) {
    issues.push({
      code: 'grammar_scope_drift',
      severity: 'hard',
      message: `${drift.length} drill(s) target a different grammar id than '${target.id}'.`,
    });
  }

  const hard = issues.filter((i) => i.severity === 'hard');
  const soft = issues.filter((i) => i.severity === 'soft');
  const verdict: GrammarValidationReport['verdict'] =
    hard.length > 0 ? 'block' : soft.length > 0 ? 'repair' : 'pass';

  return {
    passed: hard.length === 0,
    verdict,
    issues,
    coverage: {
      formCardsComplete: formComplete(formCards),
      drillTypeCount: drillTypes.size,
      speakingDrills,
      hasFreeProduction,
    },
  };
}
