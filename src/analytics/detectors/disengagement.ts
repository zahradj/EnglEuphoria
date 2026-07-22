import type { LearnerSignal } from '../types';
import type { Hub } from '@/governance/types';

export interface DisengagementInput {
  hub: Hub;
  session_minutes: number;
  speaking_attempts: number;
  game_rounds: number;
}

export function detectDisengagement(i: DisengagementInput): LearnerSignal | null {
  const minFloor = i.hub === 'playground' ? 8 : 15;
  if (i.session_minutes >= minFloor && (i.speaking_attempts > 0 || i.game_rounds > 0)) return null;
  const evidence: Array<Record<string, unknown>> = [
    { k: 'session_minutes', v: i.session_minutes },
    { k: 'speaking', v: i.speaking_attempts },
    { k: 'game', v: i.game_rounds },
  ];
  return {
    type: 'disengagement',
    severity: i.session_minutes < minFloor / 2 ? 0.8 : 0.5,
    evidence,
  };
}
