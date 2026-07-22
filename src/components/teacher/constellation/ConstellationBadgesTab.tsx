import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
  unlockedDate?: Date;
  requirement: string;
  progress?: number;
  progressTarget?: number;
}

interface ConstellationBadgesTabProps {
  overallHealth: number;
}

export const ConstellationBadgesTab = ({ overallHealth }: ConstellationBadgesTabProps) => {
  const badges: AchievementBadge[] = useMemo(() => [
    {
      id: 'perfect_constellation',
      name: 'Perfect Constellation',
      description: 'Maintain 100% health for 7 consecutive days',
      icon: '✨',
      rarity: 'legendary',
      isUnlocked: overallHealth === 100,
      requirement: '7 days at 100% health',
      progress: overallHealth === 100 ? 3 : 0,
      progressTarget: 7,
    },
    {
      id: 'rising_star',
      name: 'Rising Star',
      description: 'Recover from below 50% to above 90% health',
      icon: '🌟',
      rarity: 'epic',
      isUnlocked: false,
      requirement: 'Recover from critical to excellent',
      progress: 0,
      progressTarget: 1,
    },
    {
      id: 'attendance_champion',
      name: 'Attendance Champion',
      description: 'Perfect attendance for 30 days',
      icon: '🏆',
      rarity: 'rare',
      isUnlocked: true,
      unlockedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      requirement: '30 days perfect attendance',
    },
    {
      id: 'tech_wizard',
      name: 'Tech Wizard',
      description: 'No technical issues for 20 classes',
      icon: '💻',
      rarity: 'rare',
      isUnlocked: false,
      requirement: '20 classes without technical issues',
      progress: 12,
      progressTarget: 20,
    },
    {
      id: 'student_favorite',
      name: 'Student Favorite',
      description: 'Receive 10 five-star reviews',
      icon: '💖',
      rarity: 'epic',
      isUnlocked: true,
      unlockedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      requirement: '10 five-star reviews',
    },
    {
      id: 'punctual_pro',
      name: 'Punctual Pro',
      description: 'On time for 50 consecutive classes',
      icon: '⏰',
      rarity: 'rare',
      isUnlocked: false,
      requirement: '50 classes on time',
      progress: 37,
      progressTarget: 50,
    },
    {
      id: 'consistency_king',
      name: 'Consistency King',
      description: 'Maintain 90%+ health for 90 days',
      icon: '👑',
      rarity: 'legendary',
      isUnlocked: false,
      requirement: '90 days at 90%+ health',
      progress: 45,
      progressTarget: 90,
    },
    {
      id: 'first_star',
      name: 'First Star',
      description: 'Complete your first class',
      icon: '⭐',
      rarity: 'common',
      isUnlocked: true,
      unlockedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      requirement: 'Complete first class',
    },
  ], [overallHealth]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      case 'common':
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'epic':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'rare':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'common':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
      default:
        return '';
    }
  };

  const unlockedBadges = badges.filter(b => b.isUnlocked);
  const lockedBadges = badges.filter(b => !b.isUnlocked);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{unlockedBadges.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Unlocked</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-muted-foreground">{lockedBadges.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Locked</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">
            {Math.round((unlockedBadges.length / badges.length) * 100)}%
          </div>
          <div className="text-sm text-muted-foreground mt-1">Completion</div>
        </Card>
      </div>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Unlocked Achievements</h3>
          </div>
          <div className="grid gap-3">
            {unlockedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 border-2 bg-gradient-to-br ${getRarityColor(badge.rarity)} bg-opacity-10`}>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{badge.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{badge.name}</h4>
                        <Badge variant="outline" className={getRarityBadgeColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      {badge.unlockedDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3" />
                          <span>Unlocked {badge.unlockedDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Locked Achievements</h3>
          </div>
          <div className="grid gap-3">
            {lockedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 opacity-60 hover:opacity-80 transition-opacity">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl grayscale">{badge.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{badge.name}</h4>
                        <Badge variant="outline" className={getRarityBadgeColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          Requirement: {badge.requirement}
                        </div>
                        {badge.progress !== undefined && badge.progressTarget !== undefined && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">
                                {badge.progress} / {badge.progressTarget}
                              </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${(badge.progress / badge.progressTarget) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
