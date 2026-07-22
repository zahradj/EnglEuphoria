// Intelligent review injection — decides WHERE review lands.
// Never produces a "review-only" lesson; spreads items across slots.

import type { Hub } from '@/governance/types';
import type { InjectionSlot, MemoryInjectionPlan, ReviewQueueEntry, SkillKind } from './types';
import { getMemoryHubProfile } from './hubProfiles';

export function planInjection(
  queue: ReviewQueueEntry[],
  hub: Hub,
  mix: SkillKind[],
): MemoryInjectionPlan {
  const profile = getMemoryHubProfile(hub);
  const slots: Partial<Record<InjectionSlot, ReviewQueueEntry[]>> = {};

  const order: InjectionSlot[] = profile.preferredSlots;
  let i = 0;
  for (const entry of queue.slice(0, profile.maxItemsPerLesson)) {
    let slot: InjectionSlot;

    if (entry.must_be_spoken) {
      slot = 'speaking_task';
    } else if (entry.item.skill_kind === 'phonics' || entry.item.skill_kind === 'pronunciation') {
      slot = hub === 'playground' ? 'warmup' : 'micro_drill';
    } else if (entry.spiral_escalation) {
      slot = 'challenge_mission';
    } else {
      slot = order[i % order.length];
      i += 1;
    }

    const arr = slots[slot] ?? [];
    arr.push(entry);
    slots[slot] = arr;
  }

  const totalReviewCount = Object.values(slots).reduce((n, v) => n + (v?.length ?? 0), 0);
  const reviewDensity = Math.min(1, totalReviewCount / profile.lessonItemBudget);

  return {
    slots,
    totalReviewCount,
    reviewDensity,
    interleavingMix: mix,
  };
}
