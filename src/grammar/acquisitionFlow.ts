// Builds the 9-stage Grammar Acquisition Flow per hub.

import { GRAMMAR_HUB_PROFILES } from './hubProfiles';
import type { AcquisitionStep, GrammarTarget } from './types';
import type { Hub } from '@/governance/types';

const STAGE_LABELS = {
  exposure:           'Contextual Exposure',
  noticing:           'Pattern Noticing',
  discovery:          'Rule Discovery',
  form:               'Form Cards',
  controlled_drill:   'Controlled Drilling',
  semi_controlled:    'Semi-Controlled Practice',
  guided_production:  'Guided Production',
  free_communication: 'Free Communication',
  review:             'Review & Reinforcement',
} as const;

export function buildAcquisitionFlow(target: GrammarTarget, hub: Hub): AcquisitionStep[] {
  const profile = GRAMMAR_HUB_PROFILES[hub];
  const implicit = profile.explanationDepth === 'implicit';
  return [
    {
      stage: 'exposure',
      title: STAGE_LABELS.exposure,
      description: implicit
        ? `Hear ${target.label} inside a chant, story, or roleplay before any rule is shown.`
        : `Encounter ${target.label} inside a short dialogue or situation before any explanation.`,
      slideKind: 'story_exposure',
      requires: [],
    },
    {
      stage: 'noticing',
      title: STAGE_LABELS.noticing,
      description: `Spot the repeated pattern of ${target.label}. The system highlights the structure visually.`,
      slideKind: 'pattern_noticing',
      requires: ['highlights'],
    },
    {
      stage: 'discovery',
      title: STAGE_LABELS.discovery,
      description: implicit
        ? `Discover when we use ${target.label} through guided examples — no metalanguage.`
        : `Discover the rule for ${target.label}: structure, meaning, and communicative purpose.`,
      slideKind: 'rule_discovery',
      requires: [],
    },
    {
      stage: 'form',
      title: STAGE_LABELS.form,
      description: `See ${target.label} in Positive / Negative / Question form with short answers when applicable.`,
      slideKind: 'grammar_form_cards',
      requires: ['formCards'],
    },
    {
      stage: 'controlled_drill',
      title: STAGE_LABELS.controlled_drill,
      description: `Drill ${target.label} with single-answer activities (repetition, transformation, completion).`,
      slideKind: 'drill_block',
      requires: ['drills:controlled'],
    },
    {
      stage: 'semi_controlled',
      title: STAGE_LABELS.semi_controlled,
      description: `Build sentences with ${target.label} in guided contexts.`,
      slideKind: 'drill_block',
      requires: ['drills:semi_controlled'],
    },
    {
      stage: 'guided_production',
      title: STAGE_LABELS.guided_production,
      description: `Speak in a structured dialogue using ${target.label}. Scaffolding visible.`,
      slideKind: 'guided_speaking',
      requires: ['productionTasks'],
    },
    {
      stage: 'free_communication',
      title: STAGE_LABELS.free_communication,
      description: `Free production task using ${target.label} — context: ${profile.productionContexts.join(', ')}.`,
      slideKind: 'free_production',
      requires: ['productionTasks'],
    },
    {
      stage: 'review',
      title: STAGE_LABELS.review,
      description: `Quick reinforcement of ${target.label} — fast recognition and a final speaking moment.`,
      slideKind: 'grammar_review',
      requires: ['drills:fast_recognition'],
    },
  ];
}
