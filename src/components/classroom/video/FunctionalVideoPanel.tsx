
import React, { useState, useEffect } from 'react';
import { useVideoRoom } from '@/hooks/useVideoRoom';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, PhoneCall, PhoneOff, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FunctionalVideoPanelProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  isTeacher: boolean;
}

export function FunctionalVideoPanel({
  roomId,
  currentUserId,
  currentUserName,
  isTeacher
}: FunctionalVideoPanelProps) {
  const { toast } = useToast();

  const {
    isConnected,
    participants,
    error,
    isMuted,
    isCameraOff,
    isLoading,
    joinRoom,
    leaveRoom,
    toggleMicrophone,
    toggleCamera
  } = useVideoRoom({
    roomId,
    userId: currentUserId,
    displayName: currentUserName
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Video Conference Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleToggleMute = async () => {
    const newMutedState = await toggleMicrophone();
    toast({
      title: newMutedState ? "Microphone Disabled" : "Microphone Enabled",
      description: newMutedState ? "You are now muted" : "You can now speak"
    });
  };

  const handleToggleCamera = async () => {
    const newCameraOffState = await toggleCamera();
    toast({
      title: newCameraOffState ? "Camera Disabled" : "Camera Enabled",
      description: newCameraOffState ? "Your camera is off" : "You are now visible"
    });
  };

  const handleJoinCall = async () => {
    toast({
      title: "Joining Video Conference",
      description: "Please wait while we connect you..."
    });
    await joinRoom();
  };

  const handleLeaveCall = async () => {
    await leaveRoom();
    toast({
      title: "Left Video Conference",
      description: "You have left the video call"
    });
  };

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg flex flex-col overflow-hidden">
      {/* Connection Status Header */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between bg-gray-800">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : isLoading ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <span className="text-white text-sm font-medium">
            {isConnected ? 'Connected' : isLoading ? 'Connecting...' : 'Disconnected'}
          </span>
          {participants.size > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <Users size={14} className="text-gray-400" />
              <span className="text-gray-400 text-xs">{participants.size + 1}</span>
            </div>
          )}
        </div>
        
        {!isConnected ? (
          <Button 
            onClick={handleJoinCall} 
            size="sm"
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <PhoneCall size={14} className="mr-1" />
            {isLoading ? 'Joining...' : 'Join Call'}
          </Button>
        ) : (
          <Button 
            onClick={handleLeaveCall} 
            size="sm"
            variant="destructive"
          >
            <PhoneOff size={14} className="mr-1" />
            Leave
          </Button>
        )}
      </div>

      {/* Video Content */}
      <div className="flex-1 p-3 min-h-0">
        {isConnected ? (
          <div className="h-full flex flex-col gap-3">
            {/* Video Conference Area */}
            <div className="flex-1 bg-black rounded-lg flex items-center justify-center min-h-0">
              <div className="text-center text-white">
                <Video size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm mb-2">Video conference is active</p>
                <p className="text-xs text-gray-400">
                  {participants.size > 0 
                    ? `${participants.size} other participant(s) in the call`
                    : 'Waiting for other participants...'
                  }
                </p>
                {participants.size > 0 && (
                  <div className="mt-2 text-xs text-gray-300">
                    Participants: {Array.from(participants.values()).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex justify-center gap-2 pt-2 border-t border-gray-700">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={handleToggleMute}
                className="rounded-full w-10 h-10 p-0"
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
              
              <Button
                variant={isCameraOff ? "destructive" : "outline"}
                size="sm"
                onClick={handleToggleCamera}
                className="rounded-full w-10 h-10 p-0"
              >
                {isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
              </Button>
            </div>
          </div>
        ) : (
          /* Placeholder when not connected */
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Video size={32} className="mb-3" />
            <p className="text-sm text-center mb-2">Click "Join Call" to start video conference</p>
            <p className="text-xs text-center text-gray-500">Real-time video powered by Jitsi Meet</p>
            {error && (
              <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
