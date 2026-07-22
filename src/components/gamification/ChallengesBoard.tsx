import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LearningChallenge, StudentChallengeProgress } from "@/types/gamification";
import { 
  Target, 
  Clock, 
  Users, 
  Gift, 
  Calendar,
  Trophy,
  Star,
  Zap,
  CheckCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChallengesBoardProps {
  challenges: LearningChallenge[];
  challengeProgress: StudentChallengeProgress[];
  onJoinChallenge: (challengeId: string) => Promise<void>;
}

export function ChallengesBoard({ 
  challenges, 
  challengeProgress, 
  onJoinChallenge 
}: ChallengesBoardProps) {
  const [activeTab, setActiveTab] = useState("active");

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'weekly': return <Target className="h-4 w-4" />;
      case 'monthly': return <Trophy className="h-4 w-4" />;
      case 'seasonal': return <Star className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getChallengeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'weekly': return 'bg-green-50 border-green-200 text-green-700';
      case 'monthly': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'seasonal': return 'bg-orange-50 border-orange-200 text-orange-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getDifficultyBadge = (level: number) => {
    if (level >= 4) return { text: 'Expert', variant: 'default' as const, color: 'text-red-600' };
    if (level >= 3) return { text: 'Hard', variant: 'secondary' as const, color: 'text-orange-600' };
    if (level >= 2) return { text: 'Medium', variant: 'outline' as const, color: 'text-yellow-600' };
    return { text: 'Easy', variant: 'outline' as const, color: 'text-green-600' };
  };

  const isJoined = (challengeId: string) => {
    return challengeProgress.some(cp => cp.challenge_id === challengeId);
  };

  const getProgress = (challengeId: string) => {
    return challengeProgress.find(cp => cp.challenge_id === challengeId);
  };

  const activeChallenges = challenges.filter(c => 
    new Date(c.end_date) > new Date() && c.is_active
  );

  const completedChallenges = challengeProgress.filter(cp => cp.is_completed);

  const renderChallengeCard = (challenge: LearningChallenge) => {
    const progress = getProgress(challenge.id);
    const difficulty = getDifficultyBadge(challenge.difficulty_level || challenge.difficulty as any);
    const joined = isJoined(challenge.id);

    return (
      <Card key={challenge.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${getChallengeColor(challenge.challenge_type)}`}>
                {getChallengeIcon(challenge.challenge_type)}
              </div>
              <div>
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={difficulty.variant} className={difficulty.color}>
                    {difficulty.text}
                  </Badge>
                  <Badge variant="outline">
                    {challenge.challenge_type}
                  </Badge>
                </div>
              </div>
            </div>
            {progress?.is_completed && (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{challenge.description}</p>

          {/* Challenge Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Ends {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{challenge.current_participants} participants</span>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Gift className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Rewards</span>
            </div>
            <div className="text-sm text-yellow-600">
              {challenge.rewards.xp && `${challenge.rewards.xp} XP`}
              {challenge.rewards.coins && ` • ${challenge.rewards.coins} Coins`}
              {challenge.rewards.badge && ` • ${challenge.rewards.badge} Badge`}
            </div>
          </div>

          {/* Progress (if joined) */}
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress.completion_percentage}%</span>
              </div>
              <Progress value={progress.completion_percentage} className="h-2" />
            </div>
          )}

          {/* Action Button */}
          {!joined ? (
            <Button 
              onClick={() => onJoinChallenge(challenge.id)}
              className="w-full"
            >
              Join Challenge
            </Button>
          ) : progress?.is_completed ? (
            <Button disabled className="w-full bg-green-100 text-green-700">
              Completed! 🎉
            </Button>
          ) : (
            <Button disabled className="w-full" variant="outline">
              Joined - Keep Going! 💪
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Challenges</h2>
          <p className="text-muted-foreground">
            Complete challenges to earn XP, coins, and exclusive badges
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedChallenges.length}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeChallenges.map(renderChallengeCard)}
            {activeChallenges.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active challenges available</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="daily" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeChallenges
              .filter(c => c.challenge_type === 'daily')
              .map(renderChallengeCard)}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeChallenges
              .filter(c => c.challenge_type === 'weekly')
              .map(renderChallengeCard)}
          </div>
        </TabsContent>

        <TabsContent value="seasonal" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeChallenges
              .filter(c => c.challenge_type === 'seasonal')
              .map(renderChallengeCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}