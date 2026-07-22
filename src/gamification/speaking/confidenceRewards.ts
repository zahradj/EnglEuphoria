import type { SpeakingBraveryReward } from '../types';
import { resolveXPAward } from '../xp/xpAwarder';

interface BraveryInput {
  attemptId: string;
  studentId: string;
  bravery: SpeakingBraveryReward['bravery'];
  studentSubmittedAttempt: boolean;        // qualityOk gate — did they actually try?
  todayBraveryCount: number;
  rewardDensity?: 'low' | 'medium' | 'high';
}

const BRAVERY_LEVEL: Record<SpeakingBraveryReward['bravery'], 0 | 1 | 2 | 3> = {
  attempted: 0,
  tried_hard_word: 1,
  shared_opinion: 2,
  completed_roleplay: 2,
  public_speaking: 3,
};

const MESSAGES: Record<SpeakingBraveryReward['bravery'], string> = {
  attempted: 'You spoke up — that\'s how fluency grows.',
  tried_hard_word: 'You tackled a tough sound. Brave move.',
  shared_opinion: 'You shared your view in English. That\'s confidence.',
  completed_roleplay: 'You stayed in role to the end. Communication win.',
  public_speaking: 'You spoke in front of others. That takes courage.',
};

/**
 * Reward speaking BRAVERY (attempt + courage), not correctness.
 * The pronunciation engine separately handles accuracy scoring.
 */
export function rewardSpeakingBravery(input: BraveryInput): SpeakingBraveryReward {
  const event = resolveXPAward({
    action: 'speaking_bravery',
    studentId: input.studentId,
    refId: input.attemptId,
    rewardDensity: input.rewardDensity,
    signals: {
      qualityOk: input.studentSubmittedAttempt,
      braveryLevel: BRAVERY_LEVEL[input.bravery],
      todayActionCount: input.todayBraveryCount,
      effort: 1.2,
    },
  });

  return {
    attemptId: input.attemptId,
    bravery: input.bravery,
    xp: event.finalXP,
    message: MESSAGES[input.bravery],
  };
}
