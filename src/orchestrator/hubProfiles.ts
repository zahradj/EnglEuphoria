// Orchestrator-level Hub Profiles
// --------------------------------
// Single source of truth for the hard caps, floors, register, and allowed
// CEFR ceilings every creator must honor when calling runLessonGeneration().
//
// Engine-specific profiles (speaking density floors, coherence caps, arcade
// gates, storybook hub tone, etc.) live inside each engine folder. This file
// is the *creator-facing* contract — what the three creator pages and the
// publish gate UI read so they all enforce the same rules.
//
// Memory: Core › Hub × CEFR Matrix, Hub Branding, Speaking/Coherence/Arcade.

import type { Hub, Cefr } from '@/governance/types';

export type Register = 'kids' | 'teens' | 'adults';

export interface HubOrchestratorProfile {
  hub: Hub;
  register: Register;
  /** Minimum + maximum CEFR allowed for lessons in this hub. */
  cefrFloor: Cefr;
  cefrCeiling: Cefr;
  /** Default CEFR used when a creator doesn't specify one. */
  cefrDefault: Cefr;
  /** Lesson length in minutes (curriculum rule). */
  lessonDurationMin: number;
  /** Slide count target window for one lesson. */
  slideTarget: { min: number; max: number };
  /** Speaking density floor (% of activities that must be speaking). */
  speakingDensityFloorPct: number;
  /** Minimum speaking tasks per lesson. */
  speakingTaskFloor: number;
  /** Highest speaking ladder rung this hub is allowed to reach. */
  speakingCeilingRung:
    | 'repetition'
    | 'cued'
    | 'guided'
    | 'free'
    | 'spontaneous';
  /** Homework cap: minutes + task count. */
  homework: { maxMinutes: number; minTasks: number; maxTasks: number };
  /** Arcade cap: games + minutes per lesson run. */
  arcade: { maxGames: number; maxMinutes: number; speakingFloor: number };
  /** Activity caps Cambridge contract enforces. */
  activityCaps: { mcqMax: number; fillBlankMax: number };
  /** True if leaderboards are allowed (Playground = false). */
  leaderboardsAllowed: boolean;
  /** True if the hub permits unsupervised long-form writing homework. */
  writingHomeworkAllowed: boolean;
  /** Branded accent (matches custom-instructions hub coating). */
  brand: { primary: string; accent: string };
  /** UI label. */
  label: string;
}

const CEFR_ORDER: Cefr[] = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];

export const HUB_ORCHESTRATOR_PROFILES: Record<Hub, HubOrchestratorProfile> = {
  playground: {
    hub: 'playground',
    register: 'kids',
    cefrFloor: 'Pre-A1',
    cefrCeiling: 'B1',
    cefrDefault: 'A1',
    lessonDurationMin: 30,
    slideTarget: { min: 20, max: 25 },
    speakingDensityFloorPct: 40,
    speakingTaskFloor: 4,
    speakingCeilingRung: 'guided',
    homework: { maxMinutes: 10, minTasks: 2, maxTasks: 4 },
    arcade: { maxGames: 3, maxMinutes: 8, speakingFloor: 1 },
    activityCaps: { mcqMax: 2, fillBlankMax: 2 },
    leaderboardsAllowed: false,
    writingHomeworkAllowed: false,
    brand: { primary: '#FE6A2F', accent: '#FEFBDD' },
    label: 'Playground Creator (4–9)',
  },
  academy: {
    hub: 'academy',
    register: 'teens',
    cefrFloor: 'Pre-A1',
    cefrCeiling: 'C1',
    cefrDefault: 'B1',
    lessonDurationMin: 60,
    slideTarget: { min: 20, max: 25 },
    speakingDensityFloorPct: 35,
    speakingTaskFloor: 3,
    speakingCeilingRung: 'spontaneous',
    homework: { maxMinutes: 20, minTasks: 3, maxTasks: 5 },
    arcade: { maxGames: 4, maxMinutes: 12, speakingFloor: 2 },
    activityCaps: { mcqMax: 2, fillBlankMax: 2 },
    leaderboardsAllowed: true,
    writingHomeworkAllowed: true,
    brand: { primary: '#6B21A8', accent: '#F5F3FF' },
    label: 'Academy Creator (10–17)',
  },
  success: {
    hub: 'success',
    register: 'adults',
    cefrFloor: 'Pre-A1',
    cefrCeiling: 'C1',
    cefrDefault: 'B2',
    lessonDurationMin: 60,
    slideTarget: { min: 20, max: 25 },
    speakingDensityFloorPct: 35,
    speakingTaskFloor: 3,
    speakingCeilingRung: 'spontaneous',
    homework: { maxMinutes: 25, minTasks: 3, maxTasks: 6 },
    arcade: { maxGames: 3, maxMinutes: 10, speakingFloor: 2 },
    activityCaps: { mcqMax: 2, fillBlankMax: 2 },
    leaderboardsAllowed: true,
    writingHomeworkAllowed: true,
    brand: { primary: '#059669', accent: '#F0FDFA' },
    label: 'Success Creator (Adults)',
  },
};

export function getHubProfile(hub: Hub): HubOrchestratorProfile {
  return HUB_ORCHESTRATOR_PROFILES[hub];
}

/** True if `cefr` is within the hub's allowed [floor, ceiling]. */
export function cefrAllowedForHub(hub: Hub, cefr: Cefr): boolean {
  const p = getHubProfile(hub);
  const i = CEFR_ORDER.indexOf(cefr);
  const lo = CEFR_ORDER.indexOf(p.cefrFloor);
  const hi = CEFR_ORDER.indexOf(p.cefrCeiling);
  return i >= 0 && lo >= 0 && hi >= 0 && i >= lo && i <= hi;
}

/** Clamp a requested CEFR into the hub's allowed range. */
export function clampCefrToHub(hub: Hub, cefr: Cefr): Cefr {
  const p = getHubProfile(hub);
  const i = CEFR_ORDER.indexOf(cefr);
  const lo = CEFR_ORDER.indexOf(p.cefrFloor);
  const hi = CEFR_ORDER.indexOf(p.cefrCeiling);
  if (i < lo) return p.cefrFloor;
  if (i > hi) return p.cefrCeiling;
  return cefr;
}
