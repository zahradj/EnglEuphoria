import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGamification } from "@/hooks/useGamification";
import { 
  Coins, 
  Flame, 
  Trophy, 
  Target, 
  Crown, 
  Gift,
  TrendingUp,
  Calendar,
  Star,
  Award
} from "lucide-react";
import { StreakCard } from "./StreakCard";
import { ChallengesBoard } from "./ChallengesBoard";
import { VirtualStore } from "./VirtualStore";
import { EnhancedAchievementsBoard } from "./EnhancedAchievementsBoard";
import { SocialLeaderboard } from "./SocialLeaderboard";

interface GamificationDashboardProps {
  studentId?: string;
  className?: string;
}

export function GamificationDashboard({ studentId = 'demo-student-id', className = "" }: GamificationDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { 
    currency, 
    streaks, 
    challenges, 
    challengeProgress, 
    stats, 
    loading,
    updateStreak,
    joinChallenge,
    purchaseReward
  } = useGamification(studentId);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Total Coins</p>
                <p className="text-2xl font-bold text-amber-900">{currency?.total_coins || 0}</p>
              </div>
              <Coins className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Daily Streak</p>
                <p className="text-2xl font-bold text-orange-900">{stats?.current_daily_streak || 0}</p>
              </div>
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Level</p>
                <p className="text-2xl font-bold text-purple-900">{stats?.level || 1}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Achievements</p>
                <p className="text-2xl font-bold text-green-900">
                  {stats?.unlocked_achievements || 0}/{stats?.total_achievements || 0}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      {stats && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">Level {stats.level}</span>
                </div>
                <Badge variant="outline">{stats.xp} / {stats.next_level_xp} XP</Badge>
              </div>
              <Progress 
                value={(stats.xp / stats.next_level_xp) * 100} 
                className="h-3"
              />
              <p className="text-sm text-muted-foreground">
                {stats.next_level_xp - stats.xp} XP to next level
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Challenges</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span className="hidden sm:inline">Achievements</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-1">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1">
            <Crown className="h-4 w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StreakCard 
              streaks={streaks}
              onUpdateStreak={updateStreak}
            />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Active Challenges
              </h3>
              {challengeProgress.slice(0, 3).map((progress) => (
                <Card key={progress.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{progress.challenge?.title}</h4>
                      <Badge variant={progress.is_completed ? "default" : "secondary"}>
                        {progress.completion_percentage}%
                      </Badge>
                    </div>
                    <Progress value={progress.completion_percentage} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <ChallengesBoard 
            challenges={challenges}
            challengeProgress={challengeProgress}
            onJoinChallenge={joinChallenge}
          />
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <EnhancedAchievementsBoard studentId={studentId} />
        </TabsContent>

        <TabsContent value="store" className="mt-6">
          <VirtualStore 
            studentId={studentId}
            onPurchaseReward={purchaseReward}
          />
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <SocialLeaderboard studentId={studentId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}