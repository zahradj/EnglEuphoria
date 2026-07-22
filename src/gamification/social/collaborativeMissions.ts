import type { Hub } from '../types';
import { getHubProfile } from '../hubGamificationProfiles';

export interface CollaborativeMission {
  id: string;
  title: string;
  description: string;
  participantIds: string[];
  goal: { kind: 'class_speaking_minutes' | 'shared_vocab_mastery' | 'pair_dialogue'; target: number };
  rewardCopy: string;
  startedAt: string;
  status: 'open' | 'in_progress' | 'completed';
}

interface CreateCollaborativeInput {
  hub: Hub;
  participantIds: string[];
  goal: CollaborativeMission['goal'];
  initiatorId: string;
}

/**
 * Creates a collaborative mission with anti-toxicity guards:
 *  - No leaderboards in Playground.
 *  - Opt-in only.
 *  - Shared goals (cooperative) over zero-sum (competitive).
 *  - Min 2 participants, max 6.
 */
export function createCollaborativeMission(input: CreateCollaborativeInput): CollaborativeMission {
  const hub = getHubProfile(input.hub);
  if (input.hub === 'playground') {
    // Allowed in Playground only as small cooperative goals (no rankings)
    if (input.goal.kind === 'pair_dialogue' && input.participantIds.length > 2) {
      throw new Error('Playground pair dialogue is limited to 2 participants.');
    }
  }
  if (input.participantIds.length < 2 || input.participantIds.length > 6) {
    throw new Error('Collaborative missions need 2–6 participants.');
  }
  if (!input.participantIds.includes(input.initiatorId)) {
    throw new Error('Initiator must be a participant.');
  }

  const rewardCopy = hub.childishCopyAllowed
    ? 'Great teamwork — everyone wins together!'
    : 'Shared goal reached. Strong collaboration.';

  return {
    id: crypto.randomUUID(),
    title: titleFor(input.goal.kind),
    description: descriptionFor(input.goal.kind, input.goal.target),
    participantIds: input.participantIds,
    goal: input.goal,
    rewardCopy,
    startedAt: new Date().toISOString(),
    status: 'open',
  };
}

function titleFor(kind: CollaborativeMission['goal']['kind']): string {
  switch (kind) {
    case 'class_speaking_minutes': return 'Class Speaking Goal';
    case 'shared_vocab_mastery': return 'Shared Vocabulary Quest';
    case 'pair_dialogue': return 'Pair Dialogue Challenge';
  }
}
function descriptionFor(kind: CollaborativeMission['goal']['kind'], target: number): string {
  switch (kind) {
    case 'class_speaking_minutes':
      return `Together, reach ${target} minutes of English speaking this week.`;
    case 'shared_vocab_mastery':
      return `As a group, master ${target} new words together.`;
    case 'pair_dialogue':
      return `Complete ${target} short dialogues with your partner.`;
  }
}
