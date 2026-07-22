
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Award, Star } from "lucide-react";

interface SessionStatsProps {
  totalRewards: number;
  totalPoints: number;
  studentXP: number;
}

export function SessionStats({ totalRewards, totalPoints, studentXP }: SessionStatsProps) {
  const currentLevel = Math.floor(studentXP / 500) + 1;
  const xpInCurrentLevel = studentXP % 500;
  const progressPercentage = (xpInCurrentLevel / 500) * 100;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Session Stats</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-2 bg-blue-50">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-lg font-bold text-blue-700">{totalRewards}</div>
              <div className="text-xs text-blue-600">Rewards Given</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-2 bg-green-50">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-lg font-bold text-green-700">{totalPoints}</div>
              <div className="text-xs text-green-600">Session Points</div>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-3 bg-orange-50">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-orange-600" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-orange-700">Student Progress</span>
            <Badge className="bg-orange-500 text-white text-xs">
              Level {currentLevel}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-orange-600">
            <span>Level Progress</span>
            <span>{xpInCurrentLevel}/500 XP</span>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-orange-700">{studentXP}</div>
            <div className="text-xs text-orange-600">Total XP</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
