// Shadowing engine — builds a shadowing task spec.

import type { SpeakingTaskSpec, SpeakingRung } from './types';

export interface ShadowingInputs {
  targetSentence: string;
  rung: SpeakingRung;
  scenarioKey: string;
  targetSkills: SpeakingTaskSpec['target_skills'];
  pronFocus?: string[];
  connectedTargets?: string[];
}

export function buildShadowingTask(input: ShadowingInputs): SpeakingTaskSpec {
  return {
    task_type: 'shadowing',
    rung: input.rung,
    scenario_key: input.scenarioKey,
    target_skills: input.targetSkills,
    pronunciation_focus: input.pronFocus,
    connected_speech_targets: input.connectedTargets,
    duration_seconds: 60,
    bravery_eligible: input.rung !== 'repetition',
    prompt: `Shadow the model line at natural pace: "${input.targetSentence}". Match rhythm, stress and linking.`,
    rubric_hint: 'Reward matched rhythm + linking even if minor phoneme slips.',
  };
}
