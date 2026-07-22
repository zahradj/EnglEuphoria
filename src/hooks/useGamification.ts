import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  LearningCurrency,
  LearningChallenge,
  StudentChallengeProgress,
  StudentLearningStreak,
  VirtualReward,
  StudentRewardPurchase,
  LeaderboardEntry,
  GamificationStats,
  EnhancedAchievementBadge
} from '@/types/gamification';

export function useGamification(studentId?: string) {
  const [currency, setCurrency] = useState<LearningCurrency | null>(null);
  const [streaks, setStreaks] = useState<StudentLearningStreak[]>([]);
  const [challenges, setChallenges] = useState<LearningChallenge[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<StudentChallengeProgress[]>([]);
  const [achievements, setAchievements] = useState<EnhancedAchievementBadge[]>([]);
  const [rewards, setRewards] = useState<VirtualReward[]>([]);
  const [purchases, setPurchases] = useState<StudentRewardPurchase[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch student's currency
  const fetchCurrency = async () => {
    if (!studentId) return;

    const { data, error } = await supabase
      .from('learning_currency')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching currency:', error);
      return;
    }

    setCurrency(data);
  };

  // Fetch student's streaks
  const fetchStreaks = async () => {
    if (!studentId) return;

    const { data, error } = await supabase
      .from('student_learning_streaks')
      .select('*')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching streaks:', error);
      return;
    }

    setStreaks(data || []);
  };

  // Fetch active challenges
  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from('learning_challenges')
      .select('*')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching challenges:', error);
      return;
    }

    setChallenges(data || []);
  };

  // Fetch student's challenge progress
  const fetchChallengeProgress = async () => {
    if (!studentId) return;

    const { data, error } = await supabase
      .from('student_challenge_progress')
      .select(`
        *,
        challenge:learning_challenges(*)
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching challenge progress:', error);
      return;
    }

    setChallengeProgress(data || []);
  };

  // Fetch available rewards
  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from('virtual_rewards')
      .select('*')
      .eq('is_available', true)
      .order('cost_coins', { ascending: true });

    if (error) {
      console.error('Error fetching rewards:', error);
      return;
    }

    setRewards(data || []);
  };

  // Fetch student's purchases
  const fetchPurchases = async () => {
    if (!studentId) return;

    const { data, error } = await supabase
      .from('student_reward_purchases')
      .select(`
        *,
        reward:virtual_rewards(*)
      `)
      .eq('student_id', studentId)
      .eq('is_active', true)
      .order('purchased_at', { ascending: false });

    if (error) {
      console.error('Error fetching purchases:', error);
      return;
    }

    setPurchases(data || []);
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .from('leaderboards')
      .select('id')
      .eq('leaderboard_type', 'global')
      .eq('calculation_period', 'current')
      .maybeSingle();

    if (leaderboardError || !leaderboardData) {
      console.error('Error fetching leaderboard:', leaderboardError);
      return;
    }

    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('leaderboard_id', leaderboardData.id)
      .order('rank_position', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard entries:', error);
      return;
    }

    setLeaderboard(data || []);
  };

  // Calculate gamification stats
  const calculateStats = async () => {
    if (!studentId) return;

    // Get student XP
    const { data: xpData } = await supabase
      .from('student_xp')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    // Get achievements count
    const { data: achievementsData } = await supabase
      .from('student_achievements')
      .select('count')
      .eq('student_id', studentId);

    const { data: totalAchievements } = await supabase
      .from('achievements')
      .select('count')
      .eq('is_active', true);

    // Calculate stats
    const totalCoins = currency?.total_coins || 0;
    const coinsSpent = currency?.coins_spent || 0;
    const dailyStreak = streaks.find(s => s.streak_type === 'daily')?.current_streak || 0;
    const longestStreak = Math.max(...streaks.map(s => s.longest_streak), 0);
    const completedChallenges = challengeProgress.filter(cp => cp.is_completed).length;
    const activeChallenges = challengeProgress.filter(cp => !cp.is_completed).length;
    const unlockedAchievements = achievementsData?.[0]?.count || 0;
    const totalAchievementsCount = totalAchievements?.[0]?.count || 0;

    const currentLevel = xpData?.current_level || 1;
    const currentXP = xpData?.total_xp || 0;
    const nextLevelXP = currentLevel * 500; // 500 XP per level

    const gamificationStats: GamificationStats = {
      total_coins: totalCoins,
      coins_spent: coinsSpent,
      current_daily_streak: dailyStreak,
      longest_streak: longestStreak,
      completed_challenges: completedChallenges,
      active_challenges: activeChallenges,
      unlocked_achievements: unlockedAchievements,
      total_achievements: totalAchievementsCount,
      level: currentLevel,
      xp: currentXP,
      next_level_xp: nextLevelXP
    };

    setStats(gamificationStats);
  };

  // Update learning streak
  const updateStreak = async (streakType: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    if (!studentId) return;

    try {
      const { data, error } = await supabase
        .rpc('update_learning_streak', {
          student_uuid: studentId,
          streak_type_param: streakType
        });

      if (error) throw error;

      toast({
        title: "Streak Updated! 🔥",
        description: `${streakType} streak: ${data.current_streak} days${data.bonus_coins > 0 ? ` (+${data.bonus_coins} coins!)` : ''}`,
      });

      await fetchStreaks();
      await fetchCurrency();
      return data;
    } catch (error) {
      console.error('Error updating streak:', error);
      toast({
        title: "Error",
        description: "Failed to update learning streak",
        variant: "destructive",
      });
    }
  };

  // Join challenge
  const joinChallenge = async (challengeId: string) => {
    if (!studentId) return;

    try {
      const { error } = await supabase
        .from('student_challenge_progress')
        .insert({
          student_id: studentId,
          challenge_id: challengeId
        });

      if (error) throw error;

      toast({
        title: "Challenge Joined! 🎯",
        description: "Good luck completing this challenge!",
      });

      await fetchChallengeProgress();
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive",
      });
    }
  };

  // Purchase reward
  const purchaseReward = async (rewardId: string) => {
    if (!studentId) return;

    try {
      const { data, error } = await supabase
        .rpc('purchase_virtual_reward', {
          student_uuid: studentId,
          reward_uuid: rewardId
        });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Purchase Successful! 🎉",
          description: `You bought ${data.reward_name} for ${data.coins_spent} coins`,
        });

        await fetchCurrency();
        await fetchPurchases();
        await fetchRewards();
      } else {
        toast({
          title: "Purchase Failed",
          description: data.error,
          variant: "destructive",
        });
      }

      return data;
    } catch (error) {
      console.error('Error purchasing reward:', error);
      toast({
        title: "Error",
        description: "Failed to purchase reward",
        variant: "destructive",
      });
    }
  };

  // Award coins
  const awardCoins = async (amount: number, source: string = 'general') => {
    if (!studentId) return;

    try {
      const { data, error } = await supabase
        .rpc('update_learning_currency', {
          student_uuid: studentId,
          coins_to_add: amount,
          currency_source: source
        });

      if (error) throw error;

      toast({
        title: "Coins Earned! 💰",
        description: `You earned ${amount} coins!`,
      });

      await fetchCurrency();
      return data;
    } catch (error) {
      console.error('Error awarding coins:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    const initializeGamification = async () => {
      setLoading(true);
      
      await Promise.all([
        fetchCurrency(),
        fetchStreaks(),
        fetchChallenges(),
        fetchChallengeProgress(),
        fetchRewards(),
        fetchPurchases(),
        fetchLeaderboard()
      ]);

      await calculateStats();
      setLoading(false);
    };

    if (studentId) {
      initializeGamification();
    } else {
      setLoading(false);
    }
  }, [studentId]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!studentId) return;

    const currencyChannel = supabase
      .channel('learning_currency_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'learning_currency',
        filter: `student_id=eq.${studentId}`
      }, () => {
        fetchCurrency();
        calculateStats();
      })
      .subscribe();

    const streaksChannel = supabase
      .channel('streaks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'student_learning_streaks',
        filter: `student_id=eq.${studentId}`
      }, () => {
        fetchStreaks();
        calculateStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(currencyChannel);
      supabase.removeChannel(streaksChannel);
    };
  }, [studentId]);

  return {
    // Data
    currency,
    streaks,
    challenges,
    challengeProgress,
    achievements,
    rewards,
    purchases,
    leaderboard,
    stats,
    loading,

    // Actions
    updateStreak,
    joinChallenge,
    purchaseReward,
    awardCoins,

    // Refresh functions
    fetchCurrency,
    fetchStreaks,
    fetchChallenges,
    fetchChallengeProgress,
    fetchRewards,
    fetchPurchases
  };
}