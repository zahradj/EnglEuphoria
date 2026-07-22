import React, { useEffect, useState } from "react";
import { Clock, Users, Star, Trophy, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import englePhoriaLogo from "@/assets/englephoria-logo.png";
import { AnimatedXPCounter } from "./rewards/AnimatedXPCounter";
interface JoyfulClassroomHeaderProps {
  classTime?: string | number;
  studentCount?: number;
  className?: string;
  studentXP?: number | string;
  studentLevel?: number | string;
  userRole?: string; // Add user role to control what to show
}
export function JoyfulClassroomHeader({
  classTime,
  studentCount = 0,
  className,
  studentXP = 0,
  studentLevel = 1,
  userRole = "student"
}: JoyfulClassroomHeaderProps) {
  const xpValue = typeof studentXP === 'string' ? parseInt(studentXP) || 0 : studentXP;
  const levelValue = typeof studentLevel === 'string' ? parseInt(studentLevel) || 1 : studentLevel;
  const [previousXP, setPreviousXP] = useState(xpValue);
  const isTeacher = userRole === "teacher";

  // Track XP changes for animation
  useEffect(() => {
    if (xpValue !== previousXP) {
      setTimeout(() => setPreviousXP(xpValue), 100);
    }
  }, [xpValue, previousXP]);

  return (
    <div className={cn("px-4 py-3 bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/50 dark:via-indigo-900/50 dark:to-blue-900/50 border-b border-purple-200/50 dark:border-purple-700/50 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={englePhoriaLogo} alt="EngLePhoria" className="h-8 w-8" />
          <div className="flex items-center gap-6">
            {typeof classTime === 'number' ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>{Math.floor(classTime / 60)}:{(classTime % 60).toString().padStart(2, '0')}</span>
              </div>
            ) : classTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={16} />
                <span>{classTime}</span>
              </div>
            )}
            {isTeacher && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users size={16} />
                <span>{studentCount} students</span>
              </div>
            )}
          </div>
        </div>
        
        {!isTeacher && (
          <div className="flex items-center gap-4">
            <AnimatedXPCounter currentXP={xpValue} previousXP={previousXP} level={levelValue} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy size={16} />
              <span>Level {levelValue}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}