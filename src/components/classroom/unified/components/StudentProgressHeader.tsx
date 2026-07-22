
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StudentProgressHeaderProps {
  studentName: string;
  studentXP: number;
  currentUser: {
    id: string;
    name: string;
    role: 'teacher' | 'student';
  };
}

export function StudentProgressHeader({ studentName, studentXP, currentUser }: StudentProgressHeaderProps) {
  const isTeacher = currentUser.role === 'teacher';
  const currentLevel = Math.floor(studentXP / 500) + 1;
  const xpInCurrentLevel = studentXP % 500;
  const progressPercentage = (xpInCurrentLevel / 500) * 100;

  return (
    <div className="p-4 border-b flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">
            {isTeacher ? studentName : currentUser.name}
          </h3>
          <Badge variant="secondary" className="text-xs">
            Level {currentLevel}
          </Badge>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-blue-600">
            {studentXP} XP
          </div>
          <div className="text-xs text-gray-500">
            {500 - xpInCurrentLevel} to next level
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>Level {currentLevel}</span>
          <span>Level {currentLevel + 1}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  );
}
