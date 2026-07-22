import type { HubGamificationProfile, Hub } from './types';

export const HUB_GAMIFICATION_PROFILES: Record<Hub, HubGamificationProfile> = {
  playground: {
    hub: 'playground',
    rewardDensity: 'high',
    celebrationStyle: 'animated',
    allowLeaderboards: false,
    allowCollectibles: true,
    childishCopyAllowed: true,
    missionArchetypes: ['mystery', 'travel_challenge', 'help_character', 'detective'],
    encouragementDefault: 'playful',
    toneRules: [
      'Always positive, never shame missed days.',
      'Use mascots and characters as mission guides.',
      'Frame errors as "let\'s try again together".',
      'No public rankings.',
      'Collectibles and stickers reinforce mastery, never replace it.',
    ],
  },
  academy: {
    hub: 'academy',
    rewardDensity: 'medium',
    celebrationStyle: 'modern',
    allowLeaderboards: true,        // opt-in cooperative only
    allowCollectibles: true,
    childishCopyAllowed: false,
    missionArchetypes: ['debate', 'speaking_quest', 'mystery', 'survival', 'interview'],
    encouragementDefault: 'enthusiastic',
    toneRules: [
      'Identity-forward: "Debate Champion", "Fluency Builder".',
      'Cooperative challenges over competitive ones.',
      'Leaderboards are opt-in and class-scoped, never global humiliation.',
      'Celebrate progress milestones, not raw speed.',
    ],
  },
  success: {
    hub: 'success',
    rewardDensity: 'low',
    celebrationStyle: 'elegant',
    allowLeaderboards: false,
    allowCollectibles: false,
    childishCopyAllowed: false,
    missionArchetypes: ['interview', 'debate', 'speaking_quest', 'survival'],
    encouragementDefault: 'professional',
    toneRules: [
      'Professional, never childish. No cartoons, no stickers.',
      'Reward fluency confidence, communication breakthroughs.',
      'Sparse, premium milestones over frequent micro-rewards.',
      'Use real-world framing: "you can now handle X situation".',
    ],
  },
};

export function getHubProfile(hub: Hub): HubGamificationProfile {
  return HUB_GAMIFICATION_PROFILES[hub];
}
