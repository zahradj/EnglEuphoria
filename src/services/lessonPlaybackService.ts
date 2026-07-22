import { supabase } from '@/integrations/supabase/client';

interface QuizAnswer {
  questionIndex: number;
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
}

interface LessonPlaybackResult {
  score: number;
  xpEarned: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  achievements: Array<{
    id: string;
    name: string;
    icon: string;
    xp_reward: number;
  }>;
}

// Calculate score from quiz answers
export function calculateLessonScore(
  answers: QuizAnswer[],
  totalQuestions: number
): { score: number; correctAnswers: number } {
  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const score = totalQuestions > 0 
    ? Math.round((correctAnswers / totalQuestions) * 100) 
    : 100;
  
  return { score, correctAnswers };
}

// Calculate XP based on score
export function calculateXpReward(baseXp: number, score: number): number {
  let bonus = 0;
  
  if (score === 100) {
    bonus = Math.round(baseXp * 0.5); // 50% bonus for perfect score
  } else if (score >= 90) {
    bonus = Math.round(baseXp * 0.3); // 30% bonus for 90%+
  } else if (score >= 80) {
    bonus = Math.round(baseXp * 0.15); // 15% bonus for 80%+
  } else if (score >= 70) {
    bonus = Math.round(baseXp * 0.05); // 5% bonus for 70%+
  }
  
  return baseXp + bonus;
}

// Award XP to student via SECURITY DEFINER RPC (server-side capped)
export async function awardXp(
  userId: string,
  amount: number,
  reason: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('update_student_xp', {
      student_uuid: userId,
      xp_to_add: Math.max(1, Math.min(200, Math.round(amount))),
    });
    if (error) {
      console.error('Error awarding XP:', error, { reason });
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error awarding XP:', error);
    return false;
  }
}

// Check and unlock achievements
export async function checkAchievements(
  userId: string,
  context: {
    lessonsCompleted?: number;
    perfectScores?: number;
    totalXp?: number;
    streak?: number;
  }
): Promise<Array<{ id: string; name: string; icon: string; xp_reward: number }>> {
  const unlockedAchievements: Array<{ id: string; name: string; icon: string; xp_reward: number }> = [];

  try {
    // Fetch all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (achievementsError || !achievements) return [];

    // Fetch user's current achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('student_achievements')
      .select('achievement_id')
      .eq('student_id', userId);

    if (userAchievementsError) return [];

    const unlockedIds = new Set((userAchievements || []).map((ua) => ua.achievement_id));

    // Check each achievement
    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const requirements = achievement.requirements as Record<string, number>;
      let shouldUnlock = false;

      // Check requirements
      if (requirements.lessons_completed && context.lessonsCompleted) {
        shouldUnlock = context.lessonsCompleted >= requirements.lessons_completed;
      }
      if (requirements.perfect_scores && context.perfectScores) {
        shouldUnlock = context.perfectScores >= requirements.perfect_scores;
      }
      if (requirements.total_xp && context.totalXp) {
        shouldUnlock = context.totalXp >= requirements.total_xp;
      }
      if (requirements.streak_days && context.streak) {
        shouldUnlock = context.streak >= requirements.streak_days;
      }

      if (shouldUnlock) {
        // Unlock the achievement
        const { error: insertError } = await supabase
          .from('student_achievements')
          .insert({
            student_id: userId,
            achievement_id: achievement.id,
          });

        if (!insertError) {
          unlockedAchievements.push({
            id: achievement.id,
            name: achievement.name,
            icon: achievement.icon,
            xp_reward: achievement.xp_reward,
          });

          // Award achievement XP
          await awardXp(userId, achievement.xp_reward, `Achievement: ${achievement.name}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }

  return unlockedAchievements;
}

// Complete lesson and calculate results
export async function completeLessonPlayback(
  userId: string,
  lessonId: string,
  answers: QuizAnswer[],
  totalQuestions: number,
  timeSpent: number,
  baseXpReward: number
): Promise<LessonPlaybackResult> {
  const { score, correctAnswers } = calculateLessonScore(answers, totalQuestions);
  const xpEarned = calculateXpReward(baseXpReward, score);

  // Award XP
  await awardXp(userId, xpEarned, `Completed lesson`);

  // Get user stats for achievement checking
  const { data: progressData } = await supabase
    .from('student_lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed');

  const lessonsCompleted = (progressData?.length || 0) + 1;
  const perfectScores = (progressData?.filter((p) => p.score === 100).length || 0) + (score === 100 ? 1 : 0);

  // Check achievements
  const achievements = await checkAchievements(userId, {
    lessonsCompleted,
    perfectScores,
  });

  return {
    score,
    xpEarned,
    totalQuestions,
    correctAnswers,
    timeSpent,
    achievements,
  };
}
