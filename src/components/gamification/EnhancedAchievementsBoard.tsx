import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { EnhancedAchievementBadge } from "@/types/gamification";
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Book, 
  Users, 
  Award,
  Crown,
  Medal,
  Zap
} from "lucide-react";

interface EnhancedAchievementsBoardProps {
  studentId: string;
  className?: string;
}

export function EnhancedAchievementsBoard({ 
  studentId, 
  className = "" 
}: EnhancedAchievementsBoardProps) {
  const [achievements, setAchievements] = useState<EnhancedAchievementBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchAchievements = async () => {
    // For now, we'll create mock enhanced achievements since the tier system would need more setup
    // In a real implementation, this would query the achievement_tiers and student_achievement_tiers tables
    
    const mockAchievements: EnhancedAchievementBadge[] = [
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '📚' as any,
        category: 'special' as any,
        tier_level: 1,
        tier_name: 'Bronze',
        unlocked: true,
        xp_reward: 50,
        coin_reward: 10,
        unlocked_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Vocabulary Explorer',
        description: 'Learn 25 new words',
        icon: <Target className="h-6 w-6" />,
        category: 'learning',
        tier_level: 2,
        tier_name: 'Silver',
        unlocked: true,
        progress: { current: 25, total: 25 },
        xp_reward: 100,
        coin_reward: 25,
        unlocked_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Grammar Master',
        description: 'Perfect score on 5 grammar exercises',
        icon: <Award className="h-6 w-6" />,
        category: 'mastery',
        tier_level: 3,
        tier_name: 'Gold',
        unlocked: false,
        progress: { current: 3, total: 5 },
        xp_reward: 200,
        coin_reward: 50
      },
      {
        id: '4',
        name: 'Speaking Champion',
        description: 'Complete 50 speaking sessions',
        icon: <Crown className="h-6 w-6" />,
        category: 'mastery',
        tier_level: 4,
        tier_name: 'Platinum',
        unlocked: false,
        progress: { current: 12, total: 50 },
        xp_reward: 500,
        coin_reward: 100
      },
      {
        id: '5',
        name: 'Streak Master',
        description: 'Maintain a 30-day learning streak',
        icon: <Flame className="h-6 w-6" />,
        category: 'streak',
        tier_level: 3,
        tier_name: 'Gold',
        unlocked: false,
        progress: { current: 7, total: 30 },
        xp_reward: 300,
        coin_reward: 75
      },
      {
        id: '6',
        name: 'Community Helper',
        description: 'Help 10 fellow learners',
        icon: <Users className="h-6 w-6" />,
        category: 'social',
        tier_level: 2,
        tier_name: 'Silver',
        unlocked: false,
        progress: { current: 2, total: 10 },
        xp_reward: 150,
        coin_reward: 35
      },
      {
        id: '7',
        name: 'Speed Learner',
        description: 'Complete 5 lessons in one day',
        icon: <Zap className="h-6 w-6" />,
        category: 'learning',
        tier_level: 2,
        tier_name: 'Silver',
        unlocked: true,
        xp_reward: 125,
        coin_reward: 30,
        unlocked_at: new Date().toISOString()
      },
      {
        id: '8',
        name: 'Knowledge Seeker',
        description: 'Complete 100 total lessons',
        icon: <Medal className="h-6 w-6" />,
        category: 'learning',
        tier_level: 4,
        tier_name: 'Platinum',
        unlocked: false,
        progress: { current: 45, total: 100 },
        xp_reward: 750,
        coin_reward: 150
      }
    ];

    setAchievements(mockAchievements);
    setLoading(false);
  };

  useEffect(() => {
    fetchAchievements();
  }, [studentId]);

  const getTierColor = (tierLevel: number) => {
    switch (tierLevel) {
      case 1: return {
        bg: "bg-gradient-to-br from-amber-50 to-orange-100",
        border: "border-amber-300",
        iconBg: "bg-amber-200",
        text: "text-amber-800",
        badge: "bg-amber-500 text-white"
      };
      case 2: return {
        bg: "bg-gradient-to-br from-gray-50 to-slate-100", 
        border: "border-gray-300",
        iconBg: "bg-gray-200",
        text: "text-gray-800",
        badge: "bg-gray-500 text-white"
      };
      case 3: return {
        bg: "bg-gradient-to-br from-yellow-50 to-amber-100",
        border: "border-yellow-400",
        iconBg: "bg-yellow-200", 
        text: "text-yellow-800",
        badge: "bg-yellow-500 text-white"
      };
      case 4: return {
        bg: "bg-gradient-to-br from-purple-50 to-indigo-100",
        border: "border-purple-400",
        iconBg: "bg-purple-200",
        text: "text-purple-800", 
        badge: "bg-purple-500 text-white"
      };
      default: return {
        bg: "bg-gray-50",
        border: "border-gray-200", 
        iconBg: "bg-gray-100",
        text: "text-gray-600",
        badge: "bg-gray-400 text-white"
      };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning': return <Book className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'streak': return <Flame className="h-4 w-4" />;
      case 'mastery': return <Star className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const filteredAchievements = activeTab === "all" 
    ? achievements 
    : achievements.filter(a => a.category === activeTab);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp_reward, 0);
  const totalCoins = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.coin_reward, 0);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-purple-600" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{unlockedCount}/{achievements.length}</p>
              <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">XP Earned</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{totalCoins}</p>
              <p className="text-sm text-muted-foreground">Coins Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">All</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-1">
            <Book className="h-4 w-4" />
            <span className="hidden sm:inline">Learning</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="streak" className="flex items-center gap-1">
            <Flame className="h-4 w-4" />
            <span className="hidden sm:inline">Streaks</span>
          </TabsTrigger>
          <TabsTrigger value="mastery" className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Mastery</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAchievements.map((achievement) => {
              const colors = getTierColor(achievement.tier_level);
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`${achievement.unlocked ? colors.bg : "bg-gray-50"} 
                    ${achievement.unlocked ? colors.border : "border-gray-200"} 
                    ${achievement.unlocked ? "shadow-lg" : "opacity-70"} 
                    transition-all hover:shadow-xl`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className={`rounded-full p-3 ${
                            achievement.unlocked ? colors.iconBg : "bg-gray-200"
                          }`}
                        >
                          <div className={achievement.unlocked ? colors.text : "text-gray-500"}>
                            {achievement.icon}
                          </div>
                        </div>
                        <div>
                          <h4 className={`font-bold ${achievement.unlocked ? colors.text : "text-gray-500"}`}>
                            {achievement.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={colors.badge}>
                              {achievement.tier_name}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getCategoryIcon(achievement.category)}
                              {achievement.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <Trophy className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className={`text-sm ${achievement.unlocked ? "text-muted-foreground" : "text-gray-500"}`}>
                      {achievement.description}
                    </p>

                    {/* Rewards */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-blue-500" />
                          {achievement.xp_reward} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          {achievement.coin_reward} Coins
                        </span>
                      </div>
                      {achievement.unlocked_at && (
                        <Badge variant="outline" className="text-xs">
                          Unlocked!
                        </Badge>
                      )}
                    </div>

                    {/* Progress */}
                    {achievement.progress && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress.current}/{achievement.progress.total}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress.current / achievement.progress.total) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {filteredAchievements.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No achievements found in this category</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}