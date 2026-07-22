// Gamification & Motivation System — type contract
// Layered on top of planner → governance → adaptive → pronunciation → activities, BEFORE QA.

export type Hub = 'playground' | 'academy' | 'success';

export type MotivationProfileType =
  | 'challenge'      // thrives on difficulty
  | 'achievement'    // collects milestones
  | 'social'         // motivated by peers
  | 'explorer'       // curiosity-driven
  | 'anxious'        // needs reassurance
  | 'balanced';      // default

export type EncouragementStyle =
  | 'supportive'
  | 'enthusiastic'
  | 'calm'
  | 'professional'
  | 'playful';

export type RewardDensity = 'low' | 'medium' | 'high';

export interface MotivationProfile {
  studentId: string;
  profileType: MotivationProfileType;
  encouragementStyle: EncouragementStyle;
  rewardDensity: RewardDensity;
  signals: {
    completionRate?: number;
    speakingParticipation?: number;
    averageAccuracy?: number;
    quitRate?: number;
    sessionLengthAvg?: number;
    streakRecoveries?: number;
  };
  lastRecomputedAt: string;
}

// XP -----------------------------------------------------------------

export type XPActionType =
  | 'phonics_listen'
  | 'vocab_quiz_pass'
  | 'speaking_submit'
  | 'speaking_bravery'         // NEW: attempt difficult / opinion / roleplay
  | 'pronunciation_attempt'    // NEW: try a hard phoneme
  | 'pronunciation_improvement'
  | 'library_read'
  | 'class_attended'
  | 'mission_complete'         // NEW
  | 'mastery_milestone'        // NEW: reached ≥85% on item
  | 'review_streak'            // NEW: SM-2 review chain
  | 'lesson_complete';

export interface XPEvent {
  action: XPActionType;
  baseXP: number;
  multipliers: {
    effort?: number;       // 1.0–1.5 based on session struggle
    mastery?: number;      // 1.0–1.3 when adaptive mastery rises
    bravery?: number;      // 1.0–1.5 for speaking attempts
    consistency?: number;  // 1.0–1.2 for streak milestones
  };
  finalXP: number;
  refId?: string;
  reason?: string;
}

// Achievements -------------------------------------------------------

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: 'vocabulary' | 'pronunciation' | 'speaking' | 'grammar' | 'reading' | 'consistency' | 'communication';
  icon: string;
  hubs: Hub[];                 // which hubs surface this achievement
  unlockCondition: {
    kind: 'mastery_count' | 'speaking_sessions' | 'streak_days' | 'missions_completed' | 'reviews_passed';
    threshold: Record<AchievementTier, number>;
  };
}

export interface AchievementUnlock {
  achievementId: string;
  tier: AchievementTier;
  evidence: Record<string, unknown>;
  unlockedAt: string;
}

// Missions -----------------------------------------------------------

export type MissionArchetype =
  | 'mystery'
  | 'travel_challenge'
  | 'interview'
  | 'debate'
  | 'speaking_quest'
  | 'help_character'
  | 'detective'
  | 'survival';

export interface MissionNarrative {
  archetype: MissionArchetype;
  title: string;
  hook: string;                // 1–2 sentence framing
  character?: string;          // hub-appropriate companion
  objectiveCopy: string;       // student-facing version of plan.objective
  steps: Array<{ stageId: string; label: string; tiedToActivity: string }>;
  successCopy: string;
  encouragementCopy: string;
}

export interface Mission {
  id: string;
  studentId: string;
  lessonId?: string;
  narrative: MissionNarrative;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
}

// Streaks ------------------------------------------------------------

export type StreakKind = 'learning' | 'speaking' | 'review' | 'pronunciation';

export interface StreakState {
  kind: StreakKind;
  current: number;
  longest: number;
  lastActivityDate: string | null;
  freezesRemaining: number;
  status: 'active' | 'frozen' | 'at_risk' | 'broken_compassionately';
}

// Mastery viz --------------------------------------------------------

export interface SkillTreeNode {
  id: string;
  label: string;
  domain: 'vocabulary' | 'grammar' | 'pronunciation' | 'fluency' | 'reading';
  masteryPct: number;          // 0–100
  exposures: number;
  status: 'locked' | 'in_progress' | 'mastered';
  children?: SkillTreeNode[];
}

export interface SkillTree {
  hub: Hub;
  studentId: string;
  roots: SkillTreeNode[];
  updatedAt: string;
}

// Speaking bravery ---------------------------------------------------

export interface SpeakingBraveryReward {
  attemptId: string;
  bravery: 'attempted' | 'tried_hard_word' | 'shared_opinion' | 'completed_roleplay' | 'public_speaking';
  xp: number;
  message: string;
}

// Celebrations -------------------------------------------------------

export type CelebrationTrigger =
  | 'mastery_milestone'
  | 'streak_milestone'
  | 'speaking_bravery'
  | 'mission_complete'
  | 'achievement_unlocked'
  | 'level_up'
  | 'comeback';                // returning after a break

export interface Celebration {
  id?: string;
  triggerType: CelebrationTrigger;
  payload: Record<string, unknown>;
  copy: string;                // personalized per motivation profile
  intensity: 'subtle' | 'medium' | 'high';
  blocksUI: boolean;           // never true during speaking tasks
}

// Hub profile --------------------------------------------------------

export interface HubGamificationProfile {
  hub: Hub;
  rewardDensity: RewardDensity;
  celebrationStyle: 'animated' | 'modern' | 'elegant';
  allowLeaderboards: boolean;
  allowCollectibles: boolean;
  childishCopyAllowed: boolean;
  missionArchetypes: MissionArchetype[];
  encouragementDefault: EncouragementStyle;
  toneRules: string[];
}

// Orchestrator I/O ---------------------------------------------------

export interface RunGamificationInput {
  studentId: string;
  hub: Hub;
  plan: { objective?: string; targetVocab?: string[]; grammarFocus?: string[] } & Record<string, unknown>;
  motivationProfile: MotivationProfile;
  adaptiveContext?: { masteryRising?: boolean; difficultyTier?: number };
}

export interface RunGamificationResult {
  mission: Mission;
  rewardPlan: {
    densityApplied: RewardDensity;
    expectedCelebrations: CelebrationTrigger[];
  };
  governanceFlags: string[];
}
