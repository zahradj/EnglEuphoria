import type { MissionNarrative, MissionArchetype, Hub, MotivationProfile } from '../types';
import { getHubProfile } from '../hubGamificationProfiles';
import { getTemplatesForHub, getTemplate } from './missionTemplates';

interface GenerateMissionInput {
  hub: Hub;
  plan: {
    objective?: string;
    targetVocab?: string[];
    grammarFocus?: string[];
    activitySteps?: string[];     // ids from activity sequencer
  };
  motivationProfile: MotivationProfile;
  preferredArchetype?: MissionArchetype;
}

/**
 * Deterministic mission narrative skeleton.
 * AI prompt (missionPromptBuilder) fills realistic copy. This function
 * picks the archetype, character, and binds steps to the plan.
 */
export function generateMissionSkeleton(input: GenerateMissionInput): MissionNarrative {
  const hubProfile = getHubProfile(input.hub);
  const allowed = getTemplatesForHub(input.hub);
  if (allowed.length === 0) {
    throw new Error(`No mission archetypes available for hub: ${input.hub}`);
  }

  // Pick archetype: explicit > motivation-profile preference > first allowed
  const archetype =
    (input.preferredArchetype && getTemplate(input.preferredArchetype) && input.preferredArchetype) ||
    pickArchetypeForProfile(input.motivationProfile, allowed.map((a) => a.archetype)) ||
    allowed[0].archetype;

  const tmpl = getTemplate(archetype)!;
  const character = tmpl.characterByHub[input.hub];
  const hook = tmpl.hookTemplates[0];

  const steps =
    (input.plan.activitySteps ?? tmpl.stepLabels).slice(0, tmpl.stepLabels.length).map((label, i) => ({
      stageId: `step_${i + 1}`,
      label: tmpl.stepLabels[i] ?? label,
      tiedToActivity: input.plan.activitySteps?.[i] ?? `activity_${i + 1}`,
    }));

  const objective = input.plan.objective ?? 'Practice your English in a real moment.';

  return {
    archetype,
    title: titleFor(archetype, input.hub),
    hook,
    character,
    objectiveCopy: hubProfile.childishCopyAllowed
      ? `Your mission: ${objective}`
      : `Objective: ${objective}`,
    steps,
    successCopy: hubProfile.childishCopyAllowed
      ? 'Amazing work — you did it!'
      : 'Mission complete. Real progress made.',
    encouragementCopy: encouragementFor(input.motivationProfile.profileType),
  };
}

function pickArchetypeForProfile(
  profile: MotivationProfile,
  options: MissionArchetype[],
): MissionArchetype | null {
  const prefByType: Record<string, MissionArchetype[]> = {
    challenge: ['debate', 'survival', 'mystery'],
    achievement: ['speaking_quest', 'interview', 'mystery'],
    social: ['debate', 'interview', 'help_character'],
    explorer: ['travel_challenge', 'mystery', 'detective'],
    anxious: ['help_character', 'travel_challenge', 'speaking_quest'],
    balanced: ['speaking_quest', 'mystery', 'travel_challenge'],
  };
  const prefs = prefByType[profile.profileType] ?? [];
  for (const p of prefs) if (options.includes(p)) return p;
  return null;
}

function titleFor(arch: MissionArchetype, hub: Hub): string {
  const playful = hub === 'playground';
  const titles: Record<MissionArchetype, string> = {
    mystery: playful ? 'The Mystery of the Missing Word' : 'The Word Mystery',
    travel_challenge: playful ? 'Trip Around the World' : 'Travel Challenge',
    interview: 'The Real Interview',
    debate: 'The Friendly Debate',
    speaking_quest: 'Speaking Quest',
    help_character: 'Help a Friend',
    detective: playful ? 'Junior Detective' : 'On the Case',
    survival: 'Real-Life Situation',
  };
  return titles[arch];
}

function encouragementFor(type: MotivationProfile['profileType']): string {
  switch (type) {
    case 'anxious': return 'Take your time. Every attempt counts.';
    case 'challenge': return 'Push yourself — you can handle this.';
    case 'achievement': return 'Another milestone is within reach.';
    case 'social': return 'Communicate with confidence — your voice matters.';
    case 'explorer': return 'Discover something new in your English today.';
    default: return 'You\'re growing. Keep going.';
  }
}
