// Roleplay engine — hub-aware scenario catalog + builder.

import type { Hub } from '@/governance/types';
import type { SpeakingTaskSpec, SpeakingRung } from './types';

interface Scenario {
  key: string;
  hub: Hub;
  prompt: string;
  rubric: string;
}

const SCENARIOS: Scenario[] = [
  // Playground
  { key: 'pg_shop', hub: 'playground', prompt: 'You and a friend visit a fruit shop. Order 3 fruits.', rubric: 'Use please/thank-you. 5+ turns.' },
  { key: 'pg_park', hub: 'playground', prompt: 'You meet a new friend in the park. Say hello and ask 3 questions.', rubric: 'Greet + 3 questions + 1 follow-up.' },
  { key: 'pg_pet', hub: 'playground', prompt: 'Talk to your pet about your day in simple sentences.', rubric: 'Use 3 target words.' },
  // Academy
  { key: 'ac_cafe', hub: 'academy', prompt: 'You disagree with a friend about a movie. Explain why politely.', rubric: 'Express opinion, give reason, soften.' },
  { key: 'ac_travel', hub: 'academy', prompt: 'Plan a weekend trip with a friend — negotiate options.', rubric: 'Suggest, accept, refuse, propose alternative.' },
  { key: 'ac_school', hub: 'academy', prompt: 'Tell a story about your most embarrassing school moment.', rubric: 'Past narrative, 5+ sentences, sequencing words.' },
  // Success
  { key: 'sc_meeting', hub: 'success', prompt: 'You are in a status meeting. Update the team on your project.', rubric: 'Open, progress, blockers, next steps.' },
  { key: 'sc_pitch', hub: 'success', prompt: 'Pitch a product feature in 60 seconds.', rubric: 'Problem → solution → benefit → CTA.' },
  { key: 'sc_negotiate', hub: 'success', prompt: 'Negotiate a deadline extension with your manager.', rubric: 'Acknowledge, propose, justify, agree.' },
  { key: 'sc_smalltalk', hub: 'success', prompt: 'Start small talk with a new colleague before a meeting.', rubric: '4+ exchanges, professional register.' },
];

export interface RoleplayInputs {
  hub: Hub;
  rung: SpeakingRung;
  recentScenarios: string[];
  targetSkills: SpeakingTaskSpec['target_skills'];
  pronFocus?: string[];
  connectedTargets?: string[];
}

export function buildRoleplayTask(input: RoleplayInputs): SpeakingTaskSpec | null {
  const pool = SCENARIOS.filter((s) => s.hub === input.hub && !input.recentScenarios.includes(s.key));
  const fallback = SCENARIOS.filter((s) => s.hub === input.hub);
  const pick = (pool[0] ?? fallback[0]);
  if (!pick) return null;

  return {
    task_type: input.hub === 'success' ? 'meeting_sim' : 'roleplay',
    rung: input.rung,
    scenario_key: pick.key,
    target_skills: input.targetSkills,
    pronunciation_focus: input.pronFocus,
    connected_speech_targets: input.connectedTargets,
    duration_seconds: 120,
    bravery_eligible: true,
    prompt: pick.prompt,
    rubric_hint: pick.rubric,
  };
}
