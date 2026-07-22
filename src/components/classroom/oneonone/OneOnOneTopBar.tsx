
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Circle, 
  Square,
  PhoneCall,
  PhoneOff,
  Users,
  Hand,
  Monitor
} from "lucide-react";
import { useMediaContext } from "./video/MediaContext";
import { useSmartTimer } from "@/hooks/classroom/useSmartTimer";

interface OneOnOneTopBarProps {
  classTime: number;
  studentName: string;
  studentLevel: string;
  enhancedClassroom: any;
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  isTeacher: boolean;
  sessionDuration?: 25 | 55;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function OneOnOneTopBar({
  classTime,
  studentName,
  studentLevel,
  enhancedClassroom,
  roomId,
  currentUserId,
  currentUserName,
  isTeacher,
  sessionDuration = 25
}: OneOnOneTopBarProps) {
  const smartTimer = useSmartTimer(classTime, sessionDuration);
  // Use the shared media context for state and controls
  const media = useMediaContext();
  const participants = enhancedClassroom?.participants || [];

  return (
    <Card className="w-full shadow-sm">
      <div className="p-4 flex items-center justify-between">
        {/* Left: Student Info */}
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">{studentName}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {studentLevel}
              </Badge>
              <div className="text-xs text-gray-500">
                One-on-One Lesson
              </div>
            </div>
          </div>
        </div>

        {/* Center: Class Timer & Connection Status */}
        <div className="text-center">
          <div className={`text-2xl font-mono font-bold ${smartTimer.phaseColor}`}>
            {formatTime(classTime)}
            {smartTimer.phase === 'overtime' && (
              <span className="ml-2 text-xs font-semibold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full align-middle">
                OVERTIME
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                media.isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span>{media.isConnected ? 'Connected' : 'Ready'}</span>
              {/* still showing 'good' quality */}
              <span className="text-gray-400">(good)</span>
            </div>
            {participants.length > 0 && (
              <div className="flex items-center gap-1">
                <Users size={12} className="text-gray-400" />
                <span className="text-gray-400">{participants.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Enhanced Video Controls */}
        <div className="flex items-center gap-2">
          {/* Connection Control */}
          {!media.isConnected ? (
            <Button 
              onClick={media.join} 
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
            >
              <PhoneCall size={12} className="mr-1" />
              Join
            </Button>
          ) : (
            <Button 
              onClick={media.leave} 
              size="sm"
              variant="destructive"
              className="text-xs px-3 py-1"
            >
              <PhoneOff size={12} className="mr-1" />
              Leave
            </Button>
          )}

          {/* Microphone Control */}
          <Button
            variant={media.isMuted ? "destructive" : "outline"}
            size="sm"
            onClick={media.toggleMicrophone}
            className="rounded-full w-10 h-10 p-0"
          >
            {media.isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </Button>
          
          {/* Camera Control */}
          <Button
            variant={media.isCameraOff ? "destructive" : "outline"}
            size="sm"
            onClick={media.toggleCamera}
            className="rounded-full w-10 h-10 p-0"
          >
            {media.isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
          </Button>

          {/* Raise Hand / Screen Share / Record placeholders */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full w-10 h-10 p-0"
            disabled={!media.isConnected}
          >
            <Hand size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full w-10 h-10 p-0"
            disabled={!media.isConnected}
          >
            <Monitor size={16} />
          </Button>
          {/* Recording only for teacher, placeholder only */}
          {isTeacher && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full w-10 h-10 p-0"
              disabled={!media.isConnected}
            >
              <Circle size={16} />
            </Button>
          )}
        </div>
      </div>
      {/* Error Display */}
      {media.error && (
        <div className="px-4 pb-2">
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {media.error}
          </div>
        </div>
      )}
    </Card>
  );
}
