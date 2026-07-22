// Hub-specific planning profiles.
// Drives blueprint defaults, cognitive load, and interaction balance per hub.

import type { Hub } from '@/governance/types';
import type {
  CognitiveLoadPlan,
  EmotionalTone,
  InteractionStyle,
  PedagogicalStage,
} from './types';
import {
  PLAYGROUND_UNIT_LESSON_TEMPLATES,
  type PlaygroundLessonTemplate,
} from './playgroundUnitTemplates';

export interface HubPlanningProfile {
  default_tone: EmotionalTone;
  default_style: InteractionStyle;
  default_duration: string;
  default_slide_count: number;
  cognitive_load: CognitiveLoadPlan;
  // Slide allocation per pedagogical stage (must sum to default_slide_count).
  stage_allocation: Record<PedagogicalStage, number>;
  // Soft guidance for prompt injection.
  planning_notes: string[];
  /**
   * Optional binding 7-lesson unit pacing template. Only Playground ships one
   * today (extracted from the Animal Adventure Academy blueprint). When set,
   * the planner / architect MUST honour `phases[].stage` order per lesson
   * number before falling back to generic stage_allocation.
   */
  unit_lesson_templates?: readonly PlaygroundLessonTemplate[];
}

export const HUB_PLANNING_PROFILES: Record<Hub, HubPlanningProfile> = {
  playground: {
    default_tone: 'playful',
    default_style: 'story-driven',
    default_duration: '30min',
    default_slide_count: 30,
    cognitive_load: {
      max_consecutive_receptive: 2,
      max_consecutive_same_modality: 2,
      speaking_every_n_slides: 3,
      grammar_explanation_budget_slides: 1,
      difficulty_curve: ['warmup', 'rising', 'peak', 'cooldown'],
    },
    stage_allocation: {
      hook: 2,
      context: 4,
      input: 5,
      discovery: 4,
      controlled: 5,
      communicative: 4,
      production: 4,
      reflection: 2,
    },
    planning_notes: [
      'Total lesson length is 30 minutes — pace ~30 slides at ~60s each with frequent movement. Target 16–20 distinct activities per lesson (never fewer than 16).',
      'Keep activity cycles short (under 90s of attention each) so more activities fit the 30-minute window.',
      'Use visual + movement-based interactions where possible.',
      'Grammar must remain implicit and contextualized — no explicit rule slides.',
      'Every 3 slides include a speaking or chant moment.',
      'Reserve the last ~3 minutes for the homework section to be done with the teacher if the lesson finishes early.',
      // Animal Adventure Academy blueprint binding (see playgroundUnitTemplates.ts):
      'Unit pacing is fixed by PLAYGROUND_UNIT_LESSON_TEMPLATES — L1 Discovery, L2 Expansion, L3 Extension, L4 Practice, L5 Storybook, L6 Review, L7 Mastery Quiz.',
      'Each lesson MUST follow its template phase order verbatim; new vocab + new phonics appear in L1–L3 only; L4–L7 introduce no new language.',
      'L7 is the 80% mastery gate — failure routes to the Reinforcement Generator, not the next unit.',
    ],
    unit_lesson_templates: PLAYGROUND_UNIT_LESSON_TEMPLATES,
  },
  academy: {
    default_tone: 'adventurous',
    default_style: 'identity-driven',
    default_duration: '60min',
    default_slide_count: 36,
    cognitive_load: {
      max_consecutive_receptive: 3,
      max_consecutive_same_modality: 2,
      speaking_every_n_slides: 4,
      grammar_explanation_budget_slides: 3,
      difficulty_curve: ['warmup', 'rising', 'peak', 'cooldown'],
    },
    stage_allocation: {
      hook: 3,
      context: 4,
      input: 6,
      discovery: 4,
      controlled: 5,
      communicative: 5,
      production: 5,
      reflection: 4,
    },
    planning_notes: [
      'Total lesson length is 60 minutes — pace ~36 slides at ~90s each, with two short attention resets.',
      'Frame lessons around teen identity, social dynamics, and challenge.',
      'Use modern, age-relevant references — never childish or corporate.',
      'Communication tasks should feel like real teen conversations.',
      'Reserve ~5 minutes at the end so the homework section can be completed with the teacher when the lesson finishes early.',
    ],
  },
  success: {
    default_tone: 'professional',
    default_style: 'task-based',
    default_duration: '60min',
    default_slide_count: 36,
    cognitive_load: {
      max_consecutive_receptive: 3,
      max_consecutive_same_modality: 3,
      speaking_every_n_slides: 4,
      grammar_explanation_budget_slides: 3,
      difficulty_curve: ['warmup', 'rising', 'peak', 'cooldown'],
    },
    stage_allocation: {
      hook: 2,
      context: 5,
      input: 6,
      discovery: 3,
      controlled: 5,
      communicative: 6,
      production: 5,
      reflection: 4,
    },
    planning_notes: [
      'Total lesson length is 60 minutes — pace ~36 slides at ~95s each, anchored in a single professional scenario.',
      'Anchor every lesson in a realistic professional or life-fluency scenario.',
      'Tone is premium, confident, and respectful — never patronizing.',
      'Production tasks should mirror real workplace or social communication.',
      'Reserve ~5 minutes at the end so the homework section can be completed with the teacher when the lesson finishes early.',
    ],
  },
};
