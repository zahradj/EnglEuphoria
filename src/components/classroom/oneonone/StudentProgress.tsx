
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Star, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentProgressProps {
  studentXP: number;
  studentName: string;
  showRewardPopup?: boolean;
  onAwardPoints?: (points: number, reason?: string) => void;
}

export function StudentProgress({ 
  studentXP, 
  studentName, 
  showRewardPopup,
  onAwardPoints 
}: StudentProgressProps) {
  const currentLevel = Math.floor(studentXP / 500) + 1;
  const xpInCurrentLevel = studentXP % 500;
  const progressPercentage = (xpInCurrentLevel / 500) * 100;

  return (
    <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-orange-500 rounded-lg">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-sm">{studentName}'s Progress</h3>
          <Badge className="bg-orange-500 text-white text-xs mt-1">
            Level {currentLevel}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span>XP Progress</span>
          <span>{xpInCurrentLevel}/500 XP</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="text-center">
          <div className="text-sm font-bold text-orange-700">{studentXP}</div>
          <div className="text-xs text-orange-600">Total XP</div>
        </div>
      </div>

      {/* Quick reward buttons for teachers */}
      {onAwardPoints && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 mb-1">Quick Rewards</div>
          <div className="grid grid-cols-2 gap-1">
            <Button
              size="sm"
              onClick={() => onAwardPoints(5, "Good effort")}
              className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 h-6"
            >
              <Star size={10} className="mr-1" />
              +5
            </Button>
            <Button
              size="sm"
              onClick={() => onAwardPoints(10, "Great work")}
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 h-6"
            >
              <Award size={10} className="mr-1" />
              +10
            </Button>
          </div>
        </div>
      )}

      {showRewardPopup && (
        <div className="mt-2 text-center">
          <div className="bg-green-100 border border-green-300 rounded-lg px-2 py-1">
            <span className="text-green-700 text-xs font-medium">Points Awarded! 🎉</span>
          </div>
        </div>
      )}
    </Card>
  );
}
