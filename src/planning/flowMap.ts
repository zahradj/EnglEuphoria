// Builds the Pedagogical Flow Map for a blueprint.
// Each stage has explicit pedagogical purpose, slide count, and modality mix.

import { HUB_PLANNING_PROFILES } from './hubProfiles';
import type {
  LessonBlueprint,
  Modality,
  PedagogicalFlowMap,
  PedagogicalStage,
  PedagogicalStageSpec,
} from './types';

const STAGE_PURPOSE: Record<PedagogicalStage, string> = {
  hook:
    'Emotional Hook — activate curiosity and prior knowledge before any new language is introduced.',
  context:
    'Context Introduction — situate the learner in the theme, characters, and scenario.',
  input:
    'Comprehensible Input — expose learners to target language in meaningful, supported context.',
  discovery:
    'Guided Discovery — learners notice patterns themselves; rules emerge, are not pre-taught.',
  controlled:
    'Controlled Practice — accuracy-focused, low-risk reps with immediate feedback.',
  communicative:
    'Interactive Communication — meaning-focused exchange using target language.',
  production:
    'Production Task — a real communicative outcome the learner produces independently.',
  reflection:
    'Reflection & Review — consolidate learning, self-assess, recycle vocabulary.',
};

const STAGE_DEFAULT_MODALITIES: Record<PedagogicalStage, Modality[]> = {
  hook: ['listening', 'thinking'],
  context: ['reading', 'listening'],
  input: ['listening', 'reading'],
  discovery: ['thinking', 'reading'],
  controlled: ['writing', 'speaking'],
  communicative: ['speaking', 'collaboration'],
  production: ['speaking', 'writing'],
  reflection: ['reflection', 'thinking'],
};

const STAGE_EXPECTED_OUTPUTS: Record<PedagogicalStage, string[]> = {
  hook: ['curiosity prompt response', 'image/sound reaction'],
  context: ['theme comprehension', 'character recall'],
  input: ['noticed target patterns', 'gist comprehension'],
  discovery: ['learner-formulated rule', 'pattern match'],
  controlled: ['accurate gap-fill', 'sentence transform'],
  communicative: ['short paired exchange', 'opinion swap'],
  production: ['short monologue / message / role-play', 'task artifact'],
  reflection: ['self-rating', 'vocabulary callback'],
};

export function buildFlowMap(blueprint: LessonBlueprint): PedagogicalFlowMap {
  const profile = HUB_PLANNING_PROFILES[blueprint.hub];
  const stages: PedagogicalStage[] = [
    'hook',
    'context',
    'input',
    'discovery',
    'controlled',
    'communicative',
    'production',
    'reflection',
  ];

  return stages.map<PedagogicalStageSpec>((stage) => ({
    stage,
    slide_count: profile.stage_allocation[stage],
    why: STAGE_PURPOSE[stage],
    modalities: STAGE_DEFAULT_MODALITIES[stage],
    expected_outputs: STAGE_EXPECTED_OUTPUTS[stage],
  }));
}

export function totalSlides(flow: PedagogicalFlowMap): number {
  return flow.reduce((acc, s) => acc + s.slide_count, 0);
}
