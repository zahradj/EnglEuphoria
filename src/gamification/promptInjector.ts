import type { Hub, MotivationProfile, MissionNarrative } from './types';
import { getHubProfile } from './hubGamificationProfiles';

/**
 * Builds the gamification system prompt fragment. Chains AFTER
 * buildAdaptationSystemPrompt(ctx) and BEFORE the narrative binder
 * and per-activity prompt.
 *
 * Order (binding contract — see mem://index.md):
 *   planner → governance → adaptive → pronunciation → GAMIFICATION → activities → QA
 */
export function buildGamificationSystemPrompt(args: {
  hub: Hub;
  profile: MotivationProfile;
  mission: MissionNarrative;
}): string {
  const hub = getHubProfile(args.hub);

  return [
    '=== GAMIFICATION & MOTIVATION CONTRACT ===',
    `Hub: ${args.hub}  |  Reward density: ${hub.rewardDensity}  |  Celebration style: ${hub.celebrationStyle}`,
    `Learner motivation: ${args.profile.profileType}  |  Encouragement: ${args.profile.encouragementStyle}`,
    `Active mission: "${args.mission.title}" (${args.mission.archetype})`,
    `Mission objective copy: ${args.mission.objectiveCopy}`,
    '',
    'BINDING RULES:',
    '- Gamification REINFORCES the lesson objective. It NEVER replaces it.',
    '- Never reward passive clicks. Reward effort, courage, mastery, communication.',
    '- Frame errors as "let\'s try again". No shame. No comparison to peers.',
    '- Speaking bravery is celebrated independently of accuracy.',
    '- Celebrations never interrupt active speaking/communication tasks.',
    `- Childish copy allowed: ${hub.childishCopyAllowed}.`,
    `- Leaderboards allowed: ${hub.allowLeaderboards} (and only opt-in cooperative if true).`,
    '',
    'TONE RULES:',
    ...hub.toneRules.map((r) => `- ${r}`),
  ].join('\n');
}
