// Gamification & Motivation System — public API
//
// Chain position (binding contract):
//   planner → governance → adaptive → pronunciation → GAMIFICATION → activities → QA
//
// Core principle: gamification REINFORCES mastery — it never replaces it.

export * from './types';
export { runGamification } from './orchestrator';
export { buildGamificationSystemPrompt } from './promptInjector';
export { getHubProfile, HUB_GAMIFICATION_PROFILES } from './hubGamificationProfiles';

// XP
export { resolveXPAward } from './xp/xpAwarder';
export { XP_BASE, XP_DAILY_CAP } from './xp/xpRules';
export { checkAntiFarming } from './xp/antiFarmingGuards';

// Achievements
export {
  ACHIEVEMENT_CATALOG,
  getAchievementsForHub,
  getAchievementById,
} from './achievements/achievementCatalog';
export { evaluateAchievements } from './achievements/achievementEvaluator';
export { resolveTier, isTierUpgrade } from './achievements/tierResolver';

// Missions
export { generateMissionSkeleton } from './missions/missionGenerator';
export { buildMissionSystemPrompt } from './missions/missionPromptBuilder';
export { validateMission } from './missions/missionValidator';
export { MISSION_TEMPLATES } from './missions/missionTemplates';

// Streaks
export { resolveStreak } from './streaks/streakResolver';
export { STREAK_KINDS, STREAK_MILESTONES, isMilestone } from './streaks/streakTypes';

// Mastery viz
export { buildSkillTree } from './mastery-viz/skillTreeBuilder';
export { projectMasteryToNodes } from './mastery-viz/masteryProjector';

// Speaking
export { rewardSpeakingBravery } from './speaking/confidenceRewards';

// Motivation
export { classifyMotivation } from './motivation/motivationProfiler';
export { styleEncouragement } from './motivation/encouragementStyler';
export { scaleRewardDensity } from './motivation/adaptiveRewardScaler';

// Social
export { createCollaborativeMission } from './social/collaborativeMissions';

// Celebration
export { buildCelebration } from './celebration/celebrationTriggers';
export { composeFeedback } from './celebration/feedbackComposer';

// Governance
export { runGamificationGuards, hasGuardErrors } from './governance/gamificationGuards';
