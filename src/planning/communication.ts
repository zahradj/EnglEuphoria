// Communication Objective builder.
// Grammar must SUPPORT communication, not the other way around.

import type {
  CommunicationObjective,
  LessonBlueprint,
} from './types';

export function buildCommunicationObjective(
  blueprint: LessonBlueprint,
): CommunicationObjective {
  return {
    goal: blueprint.communication_goal,
    real_world_use: realWorldUseFor(blueprint),
    success_criteria: [
      `Learner uses at least 3 target-vocab items while ${blueprint.communication_goal.toLowerCase()}.`,
      `Learner produces at least one ${blueprint.grammar_focus[0] ?? 'target structure'} sentence in context.`,
      `Learner participates in at least one communicative exchange without scaffolding.`,
    ],
  };
}

function realWorldUseFor(b: LessonBlueprint): string {
  switch (b.hub) {
    case 'playground':
      return `Sharing this in a story, song, or pretend-play moment with a friend or family member.`;
    case 'academy':
      return `Using this with peers in chat, voice notes, social posts, or class debate.`;
    case 'success':
      return `Using this in real meetings, emails, interviews, or daily fluency situations.`;
  }
}
