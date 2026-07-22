
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Users, Calendar } from "lucide-react";

interface ClassroomSession {
  id: string;
  roomId: string;
  teacherId: string;
  studentId: string;
  startTime: Date;
  endTime?: Date;
  isRecording: boolean;
  status: 'waiting' | 'active' | 'ended';
}

interface SessionManagerProps {
  session: ClassroomSession | null;
  isConnected: boolean;
  onJoinClassroom: () => void;
  onLeaveClassroom: () => void;
  classTime: number;
}

export function SessionManager({
  session,
  isConnected,
  onJoinClassroom,
  onLeaveClassroom,
  classTime
}: SessionManagerProps) {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionDuration = (): string => {
    if (!session?.startTime) return '00:00';
    const now = session.endTime || new Date();
    const duration = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
    return formatTime(duration);
  };

  const getStatusBadge = () => {
    if (!session) return null;
    
    const variant = session.status === 'active' ? 'default' : 
                   session.status === 'waiting' ? 'secondary' : 'outline';
    
    return (
      <Badge variant={variant}>
        {session.status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Session Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Session Status</span>
          </div>
          {getStatusBadge()}
        </div>

        {/* Session Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Class Duration</span>
          </div>
          <span className="font-mono text-lg">
            {session ? getSessionDuration() : formatTime(classTime)}
          </span>
        </div>

        {/* Session Info */}
        {session && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Room ID: {session.roomId}</div>
            <div>Started: {session.startTime.toLocaleTimeString()}</div>
            {session.endTime && (
              <div>Ended: {session.endTime.toLocaleTimeString()}</div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={onJoinClassroom}
              className="flex-1"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Join Classroom
            </Button>
          ) : (
            <Button 
              onClick={onLeaveClassroom}
              variant="destructive"
              className="flex-1"
              size="sm"
            >
              <Square className="h-4 w-4 mr-2" />
              Leave Classroom
            </Button>
          )}
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-muted-foreground">
            {isConnected ? 'Connected to classroom' : 'Not connected'}
          </span>
        </div>
      </div>
    </Card>
  );
}
