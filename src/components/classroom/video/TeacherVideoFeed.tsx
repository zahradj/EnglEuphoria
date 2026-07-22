
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, UserCircle2 } from 'lucide-react';

interface TeacherVideoFeedProps {
  stream: MediaStream | null;
  isConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onJoinCall: () => void;
  onLeaveCall: () => void;
}

export function TeacherVideoFeed({
  stream,
  isConnected,
  isMuted,
  isCameraOff,
  onToggleMute,
  onToggleCamera,
  onJoinCall,
  onLeaveCall
}: TeacherVideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream && !isCameraOff) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, isCameraOff]);

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="aspect-video bg-gray-900 relative">
        {stream && !isCameraOff && isConnected ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <UserCircle2 className="h-16 w-16 text-gray-400 mb-2" />
            <span className="text-white font-medium">Ms. Johnson</span>
            {isCameraOff && isConnected && (
              <span className="text-gray-400 text-sm mt-1">Camera off</span>
            )}
            {!isConnected && (
              <span className="text-gray-400 text-sm mt-1">Not connected</span>
            )}
          </div>
        )}

        {/* Teacher badge */}
        <div className="absolute top-2 left-2">
          <span className="bg-teal-500 px-2 py-0.5 rounded-full text-xs text-white font-medium">
            Teacher
          </span>
        </div>

        {/* Muted indicator */}
        {isMuted && isConnected && (
          <div className="absolute top-2 right-2">
            <div className="bg-red-500 rounded-full p-1">
              <MicOff size={16} className="text-white" />
            </div>
          </div>
        )}

        {/* Connection status */}
        <div className="absolute bottom-2 left-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-3 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="sm"
            onClick={onToggleMute}
            disabled={!isConnected}
            className="rounded-full w-8 h-8 p-0"
          >
            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </Button>
          
          <Button
            variant={isCameraOff ? "destructive" : "outline"}
            size="sm"
            onClick={onToggleCamera}
            disabled={!isConnected}
            className="rounded-full w-8 h-8 p-0"
          >
            {isCameraOff ? <VideoOff size={14} /> : <Video size={14} />}
          </Button>
        </div>

        {!isConnected ? (
          <Button onClick={onJoinCall} size="sm" className="bg-green-600 hover:bg-green-700">
            Join Call
          </Button>
        ) : (
          <Button onClick={onLeaveCall} size="sm" variant="destructive">
            Leave
          </Button>
        )}
      </div>
    </Card>
  );
}
