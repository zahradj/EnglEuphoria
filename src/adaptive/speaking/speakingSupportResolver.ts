import type { SpeakingSupport, SpeakingTier, LearnerProfile, EngagementState, DifficultyProfile } from '../types';
import { getHubAdaptationProfile } from '../hubAdaptationProfiles';

export interface SpeakingResolverInput {
  profile: LearnerProfile;
  engagement: EngagementState;
  difficulty: DifficultyProfile;
}

export function resolveSpeakingSupport(input: SpeakingResolverInput): SpeakingSupport {
  const hub = getHubAdaptationProfile(input.profile.hub);
  let tier: SpeakingTier = hub.default_speaking_tier;

  if (input.profile.anxiety_level === 'high' || input.engagement.frustration_risk > 65) {
    tier = 'sentence_starters';
  } else if (input.engagement.confidence > 80 && input.difficulty.challenge_tier >= 3) {
    tier = input.profile.hub === 'Success' ? 'debate_improv' : 'open_communication';
  }

  return {
    tier,
    starters: starters(tier),
    frames: frames(tier),
    hype: hype(input.profile.hub),
  };
}

function starters(tier: SpeakingTier): string[] {
  switch (tier) {
    case 'sentence_starters':
      return ['I like…', 'I can…', 'I want to…', 'It is…'];
    case 'guided_frames':
      return ['I think that…', 'In my experience…', 'One example is…'];
    case 'open_communication':
      return ['From my perspective…', 'What strikes me is…'];
    case 'debate_improv':
      return ['I would argue that…', 'On the contrary…', 'A counterpoint is…'];
  }
}
function frames(tier: SpeakingTier): string[] {
  switch (tier) {
    case 'sentence_starters':
      return ['Subject + verb + object', 'Question word + verb + subject?'];
    case 'guided_frames':
      return ['Claim + reason + example', 'Compare + contrast'];
    case 'open_communication':
      return ['Hook + position + evidence + invitation'];
    case 'debate_improv':
      return ['Concede + pivot + assert', 'Reframe + evidence + close'];
  }
}
function hype(hub: 'Playground' | 'Academy' | 'Success'): string[] {
  if (hub === 'Playground') return ['You can do it!', 'Try one word!'];
  if (hub === 'Academy') return ['Your voice matters.', 'Take the mic.'];
  return ['Be heard.', 'Own the room.'];
}
