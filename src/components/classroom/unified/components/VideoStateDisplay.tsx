
import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, Play } from "lucide-react";

interface VideoStateDisplayProps {
  isTeacher: boolean;
  isWaitingForTeacher: boolean;
  canStartSession: boolean;
  canJoinVideo: boolean;
  sessionStatus?: string;
  onStartSession: () => void;
  onJoinVideo: () => void;
}

export function VideoStateDisplay({
  isTeacher,
  isWaitingForTeacher,
  canStartSession,
  canJoinVideo,
  sessionStatus,
  onStartSession,
  onJoinVideo
}: VideoStateDisplayProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-6">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full ${isTeacher ? 'bg-blue-100' : 'bg-purple-100'} flex items-center justify-center shadow-lg mb-3 mx-auto`}>
          {isWaitingForTeacher ? (
            <Clock className={`w-8 h-8 ${isTeacher ? 'text-blue-600' : 'text-purple-600'} animate-pulse`} />
          ) : canStartSession ? (
            <Play className={`w-8 h-8 ${isTeacher ? 'text-blue-600' : 'text-purple-600'}`} />
          ) : (
            <span className={`text-2xl font-bold ${isTeacher ? 'text-blue-600' : 'text-purple-600'}`}>
              {isTeacher ? 'T' : 'S'}
            </span>
          )}
        </div>
        <p className={`${isTeacher ? 'text-blue-600' : 'text-purple-600'} font-semibold mb-2`}>
          {isTeacher ? 'Teacher' : 'Student'} Video
        </p>
        
        {isWaitingForTeacher ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Waiting for teacher to start session...</span>
            </div>
            <p className="text-xs text-gray-500">Your teacher needs to start the session first</p>
          </div>
        ) : canStartSession && isTeacher ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Ready to start the session?</p>
            <Button 
              onClick={onStartSession}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Session
            </Button>
          </div>
        ) : canJoinVideo ? (
          <div className="space-y-3">
            {sessionStatus === 'started' && !isTeacher && (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Session is active!</span>
              </div>
            )}
            <p className="text-sm text-gray-500">Ready to join the video?</p>
            <Button 
              onClick={onJoinVideo}
              className={`${isTeacher ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'} text-white px-6 py-2 rounded-lg shadow-lg`}
            >
              Join Video
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Session not available</p>
          </div>
        )}
      </div>
    </div>
  );
}
