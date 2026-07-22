
import { useState, useEffect, useRef, useCallback } from 'react';
import { JitsiVideoService } from '@/services/jitsiVideoService';
import { VideoService, VideoStream } from '@/services/videoService';

interface UseVideoRoomProps {
  roomId: string;
  userId: string;
  displayName: string;
  autoJoin?: boolean;
}

export function useVideoRoom({ roomId, userId, displayName, autoJoin = false }: UseVideoRoomProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const videoServiceRef = useRef<VideoService | null>(null);

  const initializeService = useCallback(async () => {
    if (videoServiceRef.current) return;

    const service = new JitsiVideoService(
      {
        roomName: roomId,
        displayName: displayName
      },
      {
        onParticipantJoined: (participantId, displayName) => {
          setParticipants(prev => new Map(prev).set(participantId, displayName));
        },
        onParticipantLeft: (participantId) => {
          setParticipants(prev => {
            const newMap = new Map(prev);
            newMap.delete(participantId);
            return newMap;
          });
        },
        onConnectionStatusChanged: (connected) => {
          setIsConnected(connected);
          setIsLoading(false);
        },
        onError: (errorMessage) => {
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    );

    try {
      await service.initialize();
      videoServiceRef.current = service;
    } catch (err) {
      setError('Failed to initialize video service');
      setIsLoading(false);
    }
  }, [roomId, displayName]);

  const joinRoom = useCallback(async () => {
    if (!videoServiceRef.current) {
      await initializeService();
    }
    
    if (videoServiceRef.current && !isConnected) {
      setIsLoading(true);
      setError(null);
      try {
        await videoServiceRef.current.joinRoom();
      } catch (err) {
        setError('Failed to join room');
        setIsLoading(false);
      }
    }
  }, [initializeService, isConnected]);

  const leaveRoom = useCallback(async () => {
    if (videoServiceRef.current) {
      await videoServiceRef.current.leaveRoom();
      setParticipants(new Map());
    }
  }, []);

  const toggleMicrophone = useCallback(async () => {
    if (videoServiceRef.current) {
      const muted = await videoServiceRef.current.toggleMicrophone();
      setIsMuted(muted);
      return muted;
    }
    return false;
  }, []);

  const toggleCamera = useCallback(async () => {
    if (videoServiceRef.current) {
      const cameraOff = await videoServiceRef.current.toggleCamera();
      setIsCameraOff(cameraOff);
      return cameraOff;
    }
    return false;
  }, []);

  // Auto-join if requested
  useEffect(() => {
    if (autoJoin) {
      initializeService();
    }
  }, [autoJoin, initializeService]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoServiceRef.current) {
        videoServiceRef.current.dispose();
      }
    };
  }, []);

  return {
    isConnected,
    participants,
    error,
    isMuted,
    isCameraOff,
    isLoading,
    joinRoom,
    leaveRoom,
    toggleMicrophone,
    toggleCamera,
    initializeService
  };
}
