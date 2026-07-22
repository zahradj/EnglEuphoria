// Engine Mastery Achievements — vault stickers awarded from student_engine_runs.
// Pure functions; UI can call `evaluateEngineAchievements(runs)`.

export type EngineAchievementKey =
  | 'explorer_10'
  | 'explorer_25'
  | 'explorer_50'
  | 'streak_5_hi_accuracy';

export interface EngineAchievement {
  key: EngineAchievementKey;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0..1
}

interface RunLike {
  accuracy: number;
  created_at?: string;
}

export function evaluateEngineAchievements(runs: RunLike[]): EngineAchievement[] {
  const total = runs.length;
  const sorted = [...runs].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  // Longest run of ≥5 consecutive with accuracy ≥ 0.85
  let bestStreak = 0;
  let cur = 0;
  for (const r of sorted) {
    if ((r.accuracy || 0) >= 0.85) {
      cur += 1;
      bestStreak = Math.max(bestStreak, cur);
    } else {
      cur = 0;
    }
  }
  const mk = (
    key: EngineAchievementKey,
    label: string,
    description: string,
    icon: string,
    value: number,
    goal: number,
  ): EngineAchievement => ({
    key,
    label,
    description,
    icon,
    unlocked: value >= goal,
    progress: Math.min(1, value / goal),
  });
  return [
    mk('explorer_10', 'Explorer', 'Complete 10 immersive quests.', '🧭', total, 10),
    mk('explorer_25', 'Pathfinder', 'Complete 25 immersive quests.', '🗺️', total, 25),
    mk('explorer_50', 'Grandmaster', 'Complete 50 immersive quests.', '🏆', total, 50),
    mk('streak_5_hi_accuracy', 'Sharp Streak', '5 quests in a row ≥85% accuracy.', '⚡', bestStreak, 5),
  ];
}
