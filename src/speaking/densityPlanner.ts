// Density planner — converts hub profile + plan size into a task count.

import type { HubSpeakingProfile } from './hubProfiles';

export interface DensityInputs {
  totalActivityCount: number;
  profile: HubSpeakingProfile;
}

export interface DensityPlan {
  task_count: number;
  density_floor: number;
}

export function planDensity({ totalActivityCount, profile }: DensityInputs): DensityPlan {
  const byRatio = Math.ceil(totalActivityCount * profile.min_density);
  const task_count = Math.max(profile.min_speaking_tasks, byRatio);
  return { task_count, density_floor: profile.min_density };
}
