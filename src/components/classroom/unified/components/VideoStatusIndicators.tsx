
import React from "react";
import { Badge } from "@/components/ui/badge";

interface VideoStatusIndicatorsProps {
  isConnected: boolean;
  sessionStatus?: string;
  isTeacher: boolean;
}

export function VideoStatusIndicators({ isConnected, sessionStatus, isTeacher }: VideoStatusIndicatorsProps) {
  const badgeColor = isTeacher ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";

  return (
    <div className="absolute top-3 left-3 flex flex-col gap-2">
      {isConnected && (
        <Badge className="bg-blue-500 text-white animate-pulse">
          ● Live
        </Badge>
      )}
      {sessionStatus === 'started' && (
        <Badge className="bg-blue-100 text-blue-800">
          Session Active
        </Badge>
      )}
      <Badge variant="secondary" className={badgeColor}>
        {isTeacher ? 'Teacher' : 'Student'}
      </Badge>
    </div>
  );
}
