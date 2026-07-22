// Lesson Planner — orchestrates blueprint -> flow -> cognitive -> communication
// -> vocab recycling -> interaction distribution -> validation.
// Also builds a LessonState contract the governance system consumes.

import type { LessonState } from '@/governance/types';
import { buildLessonBlueprint, type BlueprintInput } from './blueprintBuilder';
import { buildFlowMap } from './flowMap';
import { buildCognitiveLoadPlan } from './cognitiveLoad';
import { buildCommunicationObjective } from './communication';
import { buildVocabRecyclingPlan } from './vocabRecycling';
import { buildInteractionDistribution } from './interactionDistribution';
import { validateLessonPlan } from './planValidator';
import { HUB_PLANNING_PROFILES } from './hubProfiles';
import type {
  LessonBlueprint,
  LessonPlan,
  PlanValidationReport,
} from './types';

export const PLANNER_VERSION = '1.0.0';

export interface PlanResult {
  plan: LessonPlan;
  validation: PlanValidationReport;
}

export function generateLessonPlan(input: BlueprintInput): PlanResult {
  const blueprint = buildLessonBlueprint(input);

  const flow_map = buildFlowMap(blueprint);
  const cognitive_load = buildCognitiveLoadPlan(blueprint);
  const communication = buildCommunicationObjective(blueprint);
  const vocab_recycling = buildVocabRecyclingPlan(blueprint, flow_map);
  const interaction_distribution = buildInteractionDistribution(flow_map);
  const lesson_state = blueprintToLessonState(blueprint);

  const plan: LessonPlan = {
    blueprint,
    lesson_state,
    flow_map,
    cognitive_load,
    communication,
    vocab_recycling,
    interaction_distribution,
    generated_at: new Date().toISOString(),
    planner_version: PLANNER_VERSION,
  };

  const validation = validateLessonPlan(plan);
  return { plan, validation };
}

export function blueprintToLessonState(b: LessonBlueprint): LessonState {
  const profile = HUB_PLANNING_PROFILES[b.hub];
  return {
    hub: b.hub,
    cefr: b.cefr_level,
    grammar: {
      target_grammar: b.grammar_focus,
      review_grammar: b.review_targets,
      blocked_grammar: [],
      exposure_grammar: [],
    },
    vocab: {
      theme: b.theme,
      target_vocab: b.target_vocab,
      support_vocab: [],
      recycled_vocab: b.review_targets,
      forbidden_vocab_categories:
        b.hub === 'playground' ? ['corporate', 'exam-prep'] : [],
    },
    theme: {
      theme: b.theme,
      characters: [],
      tone: profile.default_tone,
      communication_goal: b.communication_goal,
      // Setting binds every governance-anchored prompt (incl. image_prompt).
      // When a backdrop world is declared, use it; else fall back to topic.
      setting: b.unit_theme || b.theme,
    },
    sequence_template: [
      'hook', 'context', 'input', 'discovery',
      'controlled', 'communicative', 'production', 'reflection',
    ],
  };
}
