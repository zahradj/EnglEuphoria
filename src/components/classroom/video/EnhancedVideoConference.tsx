import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVideoServiceManager } from '@/hooks/enhanced-classroom/useVideoServiceManager';
import { VideoTile } from '@/components/classroom/unified/components/VideoTile';
import { Video, VideoOff, Mic, MicOff, Users, PhoneOff } from 'lucide-react';

interface EnhancedVideoConferenceProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  isTeacher: boolean;
  onLeave?: () => void;
}

export function EnhancedVideoConference({
  roomId,
  currentUserId,
  currentUserName,
  isTeacher,
  onLeave
}: EnhancedVideoConferenceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const {
    videoService,
    participants,
    isConnected,
    error,
    updateParticipants
  } = useVideoServiceManager({
    roomId,
    displayName: currentUserName,
    userRole: isTeacher ? 'teacher' : 'student'
  });

  useEffect(() => {
    const initializeVideo = async () => {
      if (videoService && !isConnected) {
        try {
          await videoService.initialize();
          
          // Wait a bit for initialization
          setTimeout(async () => {
            try {
              await videoService.joinRoom();
              updateParticipants();
            } catch (err) {
              console.error('Failed to auto-join room:', err);
            }
          }, 1000);
        } catch (err) {
          console.error('Failed to initialize video:', err);
        }
      }
    };

    initializeVideo();
  }, [videoService, isConnected, updateParticipants]);

  const handleToggleMicrophone = async () => {
    if (videoService) {
      const newMutedState = await videoService.toggleMicrophone();
      setIsMuted(newMutedState);
      updateParticipants();
    }
  };

  const handleToggleCamera = async () => {
    if (videoService) {
      const newCameraState = await videoService.toggleCamera();
      setIsCameraOff(newCameraState);
      updateParticipants();
    }
  };

  const handleLeaveRoom = () => {
    if (videoService) {
      videoService.leaveRoom();
    }
    onLeave?.();
  };

  const localStream = videoService?.getLocalStream();
  const remoteStreams = videoService?.getRemoteStreams() || new Map();

  // Combine local user and participants for display
  const allParticipants = [
    {
      id: currentUserId,
      name: currentUserName,
      isTeacher,
      isMuted,
      isCameraOff,
      stream: localStream,
      isLocal: true
    },
    ...participants.map(p => ({
      id: p.id,
      name: p.displayName,
      isTeacher: p.role === 'teacher',
      isMuted: p.isMuted,
      isCameraOff: p.isVideoOff,
      stream: remoteStreams.get(p.id) || null,
      isLocal: false
    }))
  ];

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-destructive mb-4">
          <VideoOff className="h-5 w-5" />
          <span>Video Conference Error</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video size={20} className="text-blue-600" />
          <h3 className="font-semibold">Live Video Conference</h3>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span className="text-sm">{allParticipants.length}</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {allParticipants.map((participant) => (
            <div key={participant.id} className="relative">
              <VideoTile
                stream={participant.stream}
                hasVideo={participant.stream !== null && !participant.isCameraOff}
                isTeacher={participant.isTeacher}
                userLabel={participant.name}
                isCameraOff={participant.isCameraOff}
              />
              
              {/* User info overlay */}
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <Badge variant={participant.isLocal ? "default" : "secondary"} className="text-xs">
                  {participant.isLocal ? "You" : participant.name}
                  {participant.isTeacher && " (Teacher)"}
                </Badge>
                {participant.isMuted && (
                  <div className="bg-red-500 rounded-full p-1">
                    <MicOff size={12} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Empty state if no participants */}
          {allParticipants.length === 0 && (
            <div className="col-span-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Users size={48} className="mx-auto mb-2 opacity-50" />
                <p>Waiting for participants to join...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant={isMuted ? "destructive" : "outline"}
            size="sm"
            onClick={handleToggleMicrophone}
            className="flex items-center gap-2"
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            {isMuted ? "Unmute" : "Mute"}
          </Button>
          
          <Button
            variant={isCameraOff ? "destructive" : "outline"}
            size="sm"
            onClick={handleToggleCamera}
            className="flex items-center gap-2"
          >
            {isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
            {isCameraOff ? "Start Video" : "Stop Video"}
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLeaveRoom}
            className="flex items-center gap-2"
          >
            <PhoneOff size={16} />
            Leave
          </Button>
        </div>
      </div>
    </Card>
  );
}