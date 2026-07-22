import type { HubId } from "./types";

export interface HiddenObjectHubProfile {
  minTargets: number;
  maxTargets: number;
  /** Max words allowed in a prompt line (age-appropriate reading load). */
  maxPromptWords: number;
  /** Whether prepositions must be present on every target. */
  requirePreposition: boolean;
  /** Whether definitions must be attached to every target. */
  requireDefinition: boolean;
  /** Max misclicks before a compassionate hint is shown. */
  hintAfterMisses: number;
  /** UI tone label used by the runner. */
  tone: "playful" | "focused" | "professional";
}

export const HIDDEN_OBJECT_PROFILES: Record<HubId, HiddenObjectHubProfile> = {
  playground: {
    minTargets: 3,
    maxTargets: 5,
    maxPromptWords: 6,
    requirePreposition: false,
    requireDefinition: false,
    hintAfterMisses: 2,
    tone: "playful",
  },
  academy: {
    minTargets: 5,
    maxTargets: 7,
    maxPromptWords: 10,
    requirePreposition: true,
    requireDefinition: true,
    hintAfterMisses: 3,
    tone: "focused",
  },
  success: {
    minTargets: 6,
    maxTargets: 8,
    maxPromptWords: 14,
    requirePreposition: true,
    requireDefinition: true,
    hintAfterMisses: 3,
    tone: "professional",
  },
};

export function getHiddenObjectProfile(hub: HubId): HiddenObjectHubProfile {
  return HIDDEN_OBJECT_PROFILES[hub];
}
