
import { useState, useEffect, useCallback, useMemo } from 'react';
import { RealTimeVideoService } from '@/services/video/realTimeVideoService';
import { EnhancedVideoService } from '@/services/video/enhancedVideoService';
import { ParticipantData } from '@/services/video/enhancedVideoService';

type VideoServiceType = RealTimeVideoService | EnhancedVideoService;

interface UseVideoServiceManagerProps {
  roomId: string;
  displayName: string;
  userRole: 'teacher' | 'student';
}

export function useVideoServiceManager({
  roomId,
  displayName,
  userRole
}: UseVideoServiceManagerProps) {
  const [videoService, setVideoService] = useState<VideoServiceType | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [error, setError] = useState<string | null>(null);

  // Memoize service configuration to prevent unnecessary re-initializations
  const serviceConfig = useMemo(() => ({
    roomName: roomId,
    displayName,
    enableRecording: userRole === 'teacher',
    enableScreenShare: true,
    maxParticipants: 10
  }), [roomId, displayName, userRole]);

  const serviceCallbacks = useMemo(() => ({
    onConnectionStatusChanged: (connected: boolean) => {
      setIsConnected(connected);
    },
    onError: (err: string) => {
      console.error('❌ Video service error:', err);
      setError(err);
    },
    onParticipantJoined: (id: string, name: string) => {
    },
    onParticipantLeft: (id: string) => {
    }
  }), []);

  // Initialize video service only when config changes
  useEffect(() => {
    let mounted = true;

    const initService = async () => {
      try {
        const service = new RealTimeVideoService();

        await service.initialize();
        
        if (mounted) {
          setVideoService(service);
        }
      } catch (err) {
        if (mounted) {
          console.error('❌ Failed to initialize video service:', err);
          setError(err instanceof Error ? err.message : 'Video service initialization failed');
        }
      }
    };

    initService();

    return () => {
      mounted = false;
      if (videoService) {
        videoService.dispose();
      }
    };
  }, [serviceConfig, serviceCallbacks]);

  const updateParticipants = useCallback(() => {
    if (videoService) {
      try {
        const currentParticipants = videoService.getParticipants();
        setParticipants(currentParticipants);
        setConnectionQuality(videoService.getConnectionQuality());
        setIsRecording(videoService.isRecordingActive());
      } catch (error) {
        console.error('Error updating participants:', error);
      }
    }
  }, [videoService]);

  return {
    videoService,
    participants,
    isConnected,
    isRecording,
    connectionQuality,
    error,
    updateParticipants
  };
}
