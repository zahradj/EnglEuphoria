import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeaderboardEntry } from "@/types/gamification";
import { 
  Crown, 
  Trophy, 
  Medal, 
  TrendingUp, 
  Calendar,
  Star,
  Flame,
  Users
} from "lucide-react";

interface SocialLeaderboardProps {
  studentId: string;
  className?: string;
}

interface LeaderboardUser extends LeaderboardEntry {
  user_name: string;
  user_avatar?: string;
  user_level: number;
  achievement_count: number;
}

export function SocialLeaderboard({ studentId, className = "" }: SocialLeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("global");

  const fetchLeaderboard = async () => {
    // Mock leaderboard data - in real implementation, this would fetch from Supabase
    const mockData: LeaderboardUser[] = [
      {
        id: '1',
        leaderboard_id: 'global',
        student_id: 'user-1',
        score: 2850,
        rank_position: 1,
        additional_data: {},
        recorded_at: new Date().toISOString(),
        user_name: 'Sarah Chen',
        user_avatar: '/api/placeholder/32/32',
        user_level: 12,
        achievement_count: 18
      },
      {
        id: '2',
        leaderboard_id: 'global',
        student_id: 'user-2',
        score: 2640,
        rank_position: 2,
        additional_data: {},
        recorded_at: new Date().toISOString(),
        user_name: 'Ahmed Hassan',
        user_level: 11,
        achievement_count: 15
      },
      {
        id: '3',
        leaderboard_id: 'global',
        student_id: 'user-3',
        score: 2420,
        rank_position: 3,
        additional_data: {},
        recorded_at: new Date().toISOString(),
        user_name: 'Maria Garcia',
        user_level: 10,
        achievement_count: 14
      },
      {
        id: '4',
        leaderboard_id: 'global',
        student_id: studentId,
        score: 1850,
        rank_position: 7,
        additional_data: {},
        recorded_at: new Date().toISOString(),
        user_name: 'You',
        user_level: 8,
        achievement_count: 9
      },
      {
        id: '5',
        leaderboard_id: 'global',
        student_id: 'user-4',
        score: 2180,
        rank_position: 4,
        additional_data: {},
        recorded_at: new Date().toISOString(),
        user_name: 'Yuki Tanaka',
        user_level: 9,
        achievement_count: 12
      },
      {
        id: '6',
        leaderboard_id: 'global',
        student_id: 'user-5',
        score: 1950,
        rank_position: 5,
        additional_data: {},
        recorded_at: new Date().toISOString(),
        user_name: 'Emma Wilson',
        user_level: 9,
        achievement_count: 11
      },
      {
        id: '7',
        leaderboard_id: 'global',
        student_id: 'user-6',
        score: 1920,
        rank_position: 6,
        additional_data: {},
        recorded_at: new Date().toISOString(),
        user_name: 'Carlos Rodriguez',
        user_level: 8,
        achievement_count: 10
      }
    ];

    // Sort by rank position
    const sortedData = mockData.sort((a, b) => a.rank_position - b.rank_position);
    setLeaderboardData(sortedData);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [studentId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</div>;
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-blue-50 border-blue-200 border-2";
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
      case 2: return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
      case 3: return "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200";
      default: return "bg-white border-gray-100";
    }
  };

  const currentUser = leaderboardData.find(user => user.student_id === studentId);
  const topUsers = leaderboardData.slice(0, 10);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Leaderboard
          </h2>
          <p className="text-muted-foreground">
            See how you rank against other learners
          </p>
        </div>
        {currentUser && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Your Rank</p>
            <div className="flex items-center gap-2">
              {getRankIcon(currentUser.rank_position)}
              <span className="text-2xl font-bold">#{currentUser.rank_position}</span>
            </div>
          </div>
        )}
      </div>

      {/* Current User Stats */}
      {currentUser && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={currentUser.user_avatar} />
                  <AvatarFallback>{currentUser.user_name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{currentUser.user_name}</p>
                  <p className="text-sm text-muted-foreground">Level {currentUser.user_level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{currentUser.score}</p>
                <p className="text-sm text-muted-foreground">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="global" className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            This Week
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Friends
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-3">
            {topUsers.map((user, index) => {
              const isCurrentUser = user.student_id === studentId;
              
              return (
                <Card 
                  key={user.id} 
                  className={`${getRankBg(user.rank_position, isCurrentUser)} hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(user.rank_position)}
                        </div>
                        <Avatar>
                          <AvatarImage src={user.user_avatar} />
                          <AvatarFallback>{user.user_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold ${isCurrentUser ? 'text-blue-700' : ''}`}>
                              {user.user_name}
                            </p>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Level {user.user_level}
                            </span>
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {user.achievement_count} achievements
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold">{user.score.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">XP</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Show more button */}
          <div className="text-center pt-4">
            <Badge variant="outline" className="px-4 py-2">
              Showing top 10 learners
            </Badge>
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievement Spotlight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Trophy className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium">Sarah Chen unlocked "Speaking Master"</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Star className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">Ahmed Hassan reached Level 11</p>
                <p className="text-sm text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Medal className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium">Maria Garcia completed "Grammar Challenge"</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}