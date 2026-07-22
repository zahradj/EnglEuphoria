
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, UserCircle2 } from 'lucide-react';

interface CompactVideoFeedProps {
  stream: MediaStream | null;
  isConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  userName: string;
  userRole: 'teacher' | 'student';
  isOwnVideo: boolean; // Whether this is the current user's own video
  onToggleMute?: () => void;
  onToggleCamera?: () => void;
  onJoinCall?: () => void;
  onLeaveCall?: () => void;
}

export function CompactVideoFeed({
  stream,
  isConnected,
  isMuted,
  isCameraOff,
  userName,
  userRole,
  isOwnVideo,
  onToggleMute,
  onToggleCamera,
  onJoinCall,
  onLeaveCall
}: CompactVideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && !isCameraOff) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraOff]);

  return (
    <Card className="overflow-hidden">
      {/* Video Container with consistent 16:9 aspect ratio */}
      <div className="aspect-video bg-gray-900 relative">
        {stream && !isCameraOff && isConnected ? (
          <video
            ref={videoRef}
            autoPlay
            muted={isOwnVideo} // Only mute own video to prevent feedback
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <UserCircle2 className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-white font-medium text-sm">{userName}</span>
            {isCameraOff && isConnected && (
              <span className="text-gray-400 text-xs mt-1">Camera off</span>
            )}
            {!isConnected && (
              <span className="text-gray-400 text-xs mt-1">Not connected</span>
            )}
          </div>
        )}

        {/* Role badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-0.5 rounded-full text-xs text-white font-medium ${
            userRole === 'teacher' ? 'bg-teal-500' : 'bg-purple-500'
          }`}>
            {userRole === 'teacher' ? 'Teacher' : 'Student'}
          </span>
        </div>

        {/* Muted indicator */}
        {isMuted && isConnected && (
          <div className="absolute top-2 right-2">
            <div className="bg-red-500 rounded-full p-1">
              <MicOff size={12} className="text-white" />
            </div>
          </div>
        )}

        {/* Connection status */}
        <div className="absolute bottom-2 left-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </div>

      {/* Controls - Only show for own video */}
      {isOwnVideo && (
        <div className="p-2 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="sm"
              onClick={onToggleMute}
              disabled={!isConnected}
              className="rounded-full w-6 h-6 p-0"
            >
              {isMuted ? <MicOff size={10} /> : <Mic size={10} />}
            </Button>
            
            <Button
              variant={isCameraOff ? "destructive" : "outline"}
              size="sm"
              onClick={onToggleCamera}
              disabled={!isConnected}
              className="rounded-full w-6 h-6 p-0"
            >
              {isCameraOff ? <VideoOff size={10} /> : <Video size={10} />}
            </Button>
          </div>

          {!isConnected ? (
            <Button onClick={onJoinCall} size="sm" className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1">
              Join Call
            </Button>
          ) : (
            <Button onClick={onLeaveCall} size="sm" variant="destructive" className="text-xs px-2 py-1">
              Leave
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
