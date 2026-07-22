// Public surface for the Master Curriculum Orchestration Engine.
//
// Single entry: runLessonGeneration().
// All other engines (planning, governance, adaptive, pronunciation,
// activities, gamification, qa) MUST be reached through this module
// during lesson generation. See mem://index.md > Orchestration.

export * from './types';
export { runLessonGeneration } from './pipeline';
export { composePromptChain } from './promptChain';
export { resolveField, resolveAll } from './conflictResolver';
export { tierRank, isHardTier, tierWins, HARD_TIERS } from './priorityMatrix';
export { createAdaptationLoop } from './adaptationLoop';
export { processFeedback } from './feedbackLoop';
export type { CurriculumMutation, CurriculumMutationKind } from './feedbackLoop';
export {
  HUB_ORCHESTRATOR_PROFILES,
  getHubProfile,
  cefrAllowedForHub,
  clampCefrToHub,
} from './hubProfiles';
export type { HubOrchestratorProfile, Register } from './hubProfiles';
