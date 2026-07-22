
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickRewardButtons } from "./QuickRewardButtons";
import { CustomRewardDialog } from "./CustomRewardDialog";
import { RewardHistory } from "./RewardHistory";
import { SessionStats } from "./SessionStats";
import { ApiKeyDialog } from "./ApiKeyDialog";
import { Trophy, Award, History, BarChart3, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { audioService } from "@/services/audioService";
import { soundEffectsService } from "@/services/soundEffectsService";

interface RewardData {
  id: string;
  points: number;
  reason: string;
  timestamp: Date;
  category: string;
}

interface TeacherRewardSystemProps {
  onAwardPoints: (points: number, reason?: string) => void;
  studentXP: number;
  currentUser: {
    role: 'teacher' | 'student';
    name: string;
  };
}

export function TeacherRewardSystem({ 
  onAwardPoints, 
  studentXP, 
  currentUser 
}: TeacherRewardSystemProps) {
  const [rewardHistory, setRewardHistory] = useState<RewardData[]>([]);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const handleQuickReward = (points: number, category: string) => {
    const reward: RewardData = {
      id: Date.now().toString(),
      points,
      reason: `${category} reward`,
      timestamp: new Date(),
      category
    };

    setRewardHistory(prev => [reward, ...prev.slice(0, 4)]); // Keep last 5 rewards

    // Tactile press feedback first, then the tier-based reward stinger.
    soundEffectsService.playPop();
    audioService.playRewardSound(points);

    // Trigger celebration with sound and visual effects
    onAwardPoints(points, reward.reason);
  };

  const handleCustomReward = (points: number, reason: string) => {
    const reward: RewardData = {
      id: Date.now().toString(),
      points,
      reason,
      timestamp: new Date(),
      category: "Custom"
    };

    setRewardHistory(prev => [reward, ...prev.slice(0, 4)]);

    soundEffectsService.playPop();
    audioService.playRewardSound(points);

    // Trigger celebration with sound and visual effects
    onAwardPoints(points, reason);
    setShowCustomDialog(false);
  };

  // Only show for teachers
  if (currentUser.role !== 'teacher') {
    return null;
  }

  return (
    <Card className="h-full">
      <Tabs defaultValue="rewards" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
          <TabsTrigger value="rewards" className="text-xs">
            <Trophy size={12} className="mr-1" />
            Rewards
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs">
            <History size={12} className="mr-1" />
            History
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs">
            <BarChart3 size={12} className="mr-1" />
            Stats
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-3">
          {/* Voice Setup Banner */}
          {!audioService.hasElevenLabsKey() && (
            <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VolumeX className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-800 font-medium">Enable Voice Rewards</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowApiKeyDialog(true)}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Volume2 className="h-3 w-3 mr-1" />
                  Setup
                </Button>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Add exciting voice congratulations to your rewards!
              </p>
            </div>
          )}

          <TabsContent value="rewards" className="mt-0 space-y-3">
            <QuickRewardButtons onReward={handleQuickReward} />
            <CustomRewardDialog 
              isOpen={showCustomDialog}
              onClose={() => setShowCustomDialog(false)}
              onReward={handleCustomReward}
              onOpen={() => setShowCustomDialog(true)}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <RewardHistory rewards={rewardHistory} />
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <SessionStats 
              totalRewards={rewardHistory.length}
              totalPoints={rewardHistory.reduce((sum, r) => sum + r.points, 0)}
              studentXP={studentXP}
            />
          </TabsContent>
        </div>

        {/* API Key Dialog */}
        <ApiKeyDialog
          isOpen={showApiKeyDialog}
          onClose={() => setShowApiKeyDialog(false)}
        />
      </Tabs>
    </Card>
  );
}
