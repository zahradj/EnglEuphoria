// Spontaneity engine — open-ended prompts gated by learner readiness.

import type { Hub } from '@/governance/types';
import type { SpeakingTaskSpec, SpeakingRung } from './types';

const PROMPTS: Record<Hub, string[]> = {
  playground: [
    'Tell me 3 things you love.',
    'What did you do this morning?',
  ],
  academy: [
    'If you could live anywhere, where would you live and why?',
    'Describe a time you helped someone.',
    'What is one thing you would change about your week?',
  ],
  success: [
    'Describe the most useful skill you have learned at work.',
    'How do you handle disagreement with a colleague?',
    'Pitch yourself for a role you would love in 30 seconds.',
  ],
};

export interface SpontaneityInputs {
  hub: Hub;
  rung: SpeakingRung;
  ready: boolean;                 // typically true only if rung ∈ free|spontaneous
  targetSkills: SpeakingTaskSpec['target_skills'];
}

export function buildSpontaneityTask(input: SpontaneityInputs): SpeakingTaskSpec | null {
  if (!input.ready) return null;
  const list = PROMPTS[input.hub];
  const prompt = list[Math.floor(Math.random() * list.length)] ?? list[0];
  return {
    task_type: input.hub === 'academy' ? 'opinion_exchange' : input.hub === 'success' ? 'professional_smalltalk' : 'picture_talk',
    rung: input.rung,
    scenario_key: `spontaneous_${input.hub}`,
    target_skills: input.targetSkills,
    duration_seconds: 75,
    bravery_eligible: true,
    prompt,
    rubric_hint: 'Reward attempt + fluency over perfect accuracy.',
  };
}
