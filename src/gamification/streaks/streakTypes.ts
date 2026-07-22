import type { StreakKind } from '../types';

export const STREAK_KINDS: StreakKind[] = ['learning', 'speaking', 'review', 'pronunciation'];

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 200];

export function isMilestone(value: number): boolean {
  return STREAK_MILESTONES.includes(value);
}
