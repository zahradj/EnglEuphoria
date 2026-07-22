
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Clock, Star, BookOpen } from "lucide-react";

interface StudentProgressTrackerProps {
  studentXP: number;
  currentUser?: {
    role: 'teacher' | 'student';
    name: string;
  };
}

export function StudentProgressTracker({ 
  studentXP, 
  currentUser = { role: 'teacher', name: 'Teacher' }
}: StudentProgressTrackerProps) {
  const currentLevel = Math.floor(studentXP / 500) + 1;
  const xpInCurrentLevel = studentXP % 500;
  const progressPercentage = (xpInCurrentLevel / 500) * 100;

  const skillProgress = [
    { skill: "Speaking", progress: 85, color: "bg-blue-500", recent: "+5%" },
    { skill: "Grammar", progress: 72, color: "bg-green-500", recent: "+12%" },
    { skill: "Vocabulary", progress: 88, color: "bg-purple-500", recent: "+8%" },
    { skill: "Reading", progress: 76, color: "bg-orange-500", recent: "+3%" }
  ];

  const weeklyStats = {
    lessonsCompleted: 4,
    timeSpent: 180, // minutes
    tasksCompleted: 12,
    streakDays: 5
  };

  return (
    <div className="space-y-4">
      {/* Level Progress */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-sm">Emma's Progress</h4>
            <Badge variant="secondary" className="text-xs mt-1">
              Level {currentLevel}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-blue-600">{studentXP} XP</div>
            <div className="text-xs text-gray-500">{500 - xpInCurrentLevel} to next</div>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </Card>

      {/* Skills Overview */}
      <Card className="p-3">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target size={14} />
            Skills Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          {skillProgress.map((skill, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">{skill.skill}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-green-600">{skill.recent}</span>
                  <span className="text-xs text-gray-500">{skill.progress}%</span>
                </div>
              </div>
              <Progress value={skill.progress} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Stats */}
      <Card className="p-3">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp size={14} />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{weeklyStats.lessonsCompleted}</div>
              <div className="text-xs text-gray-600">Lessons</div>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{Math.round(weeklyStats.timeSpent / 60)}h</div>
              <div className="text-xs text-gray-600">Study Time</div>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{weeklyStats.tasksCompleted}</div>
              <div className="text-xs text-gray-600">Tasks Done</div>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{weeklyStats.streakDays}</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="p-3">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star size={14} />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
            <div className="text-lg">🏆</div>
            <div>
              <div className="text-xs font-medium">Grammar Champion</div>
              <div className="text-xs text-gray-500">2 days ago</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
            <div className="text-lg">📚</div>
            <div>
              <div className="text-xs font-medium">Week Warrior</div>
              <div className="text-xs text-gray-500">Yesterday</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Focus */}
      <Card className="p-3">
        <CardHeader className="p-0 pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen size={14} />
            Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">Past Tense Practice</span>
            <Badge variant="outline" className="text-xs">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Family Vocabulary</span>
            <Badge variant="secondary" className="text-xs">Next</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
