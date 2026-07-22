import type { MissionNarrative, Hub, MotivationProfile } from '../types';
import { getHubProfile } from '../hubGamificationProfiles';

/**
 * System prompt fragment for AI mission-copy generation.
 * Chains AFTER buildAdaptationSystemPrompt(), BEFORE the narrative binder
 * and any per-activity prompt. Output is short, hub-appropriate, and
 * traces directly to plan.objective (validated downstream).
 */
export function buildMissionSystemPrompt(args: {
  hub: Hub;
  skeleton: MissionNarrative;
  motivationProfile: MotivationProfile;
  planObjective: string;
}): string {
  const hub = getHubProfile(args.hub);
  const toneRules = hub.toneRules.map((r) => `- ${r}`).join('\n');

  return [
    '=== MISSION NARRATIVE GENERATION ===',
    `Hub: ${args.hub}`,
    `Archetype: ${args.skeleton.archetype}`,
    `Character: ${args.skeleton.character ?? 'none'}`,
    `Lesson Objective (MUST trace to this): ${args.planObjective}`,
    `Learner profile: ${args.motivationProfile.profileType} / ${args.motivationProfile.encouragementStyle}`,
    '',
    'TONE RULES:',
    toneRules,
    '',
    'HARD RULES:',
    '- Mission framing MUST reinforce the lesson objective, never distract from it.',
    '- No public ranking, no humiliation, no comparison to other students.',
    '- Errors are reframed as "let\'s try again", never failure.',
    `- Reward density: ${hub.rewardDensity}. Do not over-celebrate trivial actions.`,
    `- Childish tone allowed: ${hub.childishCopyAllowed}.`,
    '- Copy must be short, vivid, and emotionally supportive.',
    '- No placeholder text. No "as an AI". No meta commentary.',
    '',
    'OUTPUT: A JSON mission with title, hook, objectiveCopy, steps[].label, successCopy, encouragementCopy.',
  ].join('\n');
}
