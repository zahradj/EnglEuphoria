
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TeacherRewardSystem } from "@/components/classroom/rewards/TeacherRewardSystem";
import { 
  TrendingUp, 
  Trophy, 
  Target,
  Star,
  Award,
  Book
} from "lucide-react";

interface UnifiedLeftSidebarProps {
  studentXP: number;
  currentUser: {
    id: string;
    name: string;
    role: 'teacher' | 'student';
  };
  onAwardPoints?: (points: number, reason?: string) => void;
}

export function UnifiedLeftSidebar({ 
  studentXP, 
  currentUser,
  onAwardPoints 
}: UnifiedLeftSidebarProps) {
  const currentLevel = Math.floor(studentXP / 500) + 1;
  const xpInCurrentLevel = studentXP % 500;
  const progressPercentage = (xpInCurrentLevel / 500) * 100;

  return (
    <div className="space-y-4 h-full">
      {/* Student Learning Progress Card - Always visible */}
      <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-orange-500 rounded-lg">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Learning Progress</h3>
            <Badge className="bg-orange-500 text-white text-xs mt-1">
              Level {currentLevel}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>XP Progress</span>
            <span>{xpInCurrentLevel}/500 XP</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </Card>

      {/* Teacher Reward System - Only for teachers */}
      {currentUser.role === 'teacher' && onAwardPoints && (
        <div className="flex-1">
          <TeacherRewardSystem
            onAwardPoints={onAwardPoints}
            studentXP={studentXP}
            currentUser={currentUser}
          />
        </div>
      )}

      {/* Student Achievements Card - For students or remaining space for teachers */}
      {(currentUser.role === 'student' || !onAwardPoints) && (
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-sm">Achievements</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Achievement Badges */}
            <div className="bg-green-100 rounded-lg p-2 text-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div className="text-xs font-medium text-green-700">First Steps</div>
            </div>
            
            <div className="bg-blue-100 rounded-lg p-2 text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-1">
                <Book className="h-4 w-4 text-white" />
              </div>
              <div className="text-xs font-medium text-blue-700">Word Master</div>
            </div>
            
            <div className="bg-purple-100 rounded-lg p-2 text-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-1">
                <Star className="h-4 w-4 text-white" />
              </div>
              <div className="text-xs font-medium text-purple-700">Speaker</div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-2 text-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-1">
                <Award className="h-4 w-4 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-600">Grammar Pro</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
