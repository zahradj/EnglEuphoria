
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { RealTimeVideoService } from '@/services/video/realTimeVideoService';
import { EnhancedVideoService } from '@/services/video/enhancedVideoService';
import { ClassroomSession } from './types';

// Create a union type for video services
type VideoServiceType = RealTimeVideoService | EnhancedVideoService;

interface UseClassroomActionsProps {
  videoService: VideoServiceType | null;
  isConnected: boolean;
  isRecording: boolean;
  userRole: 'teacher' | 'student';
  roomId: string;
  userId: string;
  session: ClassroomSession | null;
  setSession: (session: ClassroomSession | null) => void;
  updateParticipants: () => void;
  localStream?: MediaStream | null;
}

export function useClassroomActions({
  videoService,
  isConnected,
  isRecording,
  userRole,
  roomId,
  userId,
  session,
  setSession,
  updateParticipants,
  localStream
}: UseClassroomActionsProps) {
  const { toast } = useToast();

  const joinRoom = useCallback(async () => {
    if (!videoService) {
      console.error('❌ Video service not available');
      return false;
    }

    try {
      
      // Configure RealTimeVideoService with room details and local stream
      if ('setRoomConfig' in videoService && localStream) {
        videoService.setRoomConfig(roomId, userId, localStream);
      }
      
      await videoService.joinRoom();
      updateParticipants();
      
      toast({
        title: "Connected",
        description: "Successfully joined the classroom",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to join room:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to join the classroom",
        variant: "destructive"
      });
      return false;
    }
  }, [videoService, roomId, userId, localStream, updateParticipants, toast]);

  const leaveRoom = useCallback(async () => {
    if (!videoService) {
      console.error('❌ Video service not available');
      return false;
    }

    try {
      await videoService.leaveRoom();
      updateParticipants();
      
      toast({
        title: "Disconnected",
        description: "Left the classroom",
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to leave room:', error);
      return false;
    }
  }, [videoService, updateParticipants, toast]);

  const startRecording = useCallback(async () => {
    if (userRole !== 'teacher') {
      toast({
        title: "Permission Denied",
        description: "Only teachers can start recording",
        variant: "destructive"
      });
      return false;
    }

    if (!videoService || !isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to the classroom first",
        variant: "destructive"
      });
      return false;
    }

    try {
      const success = await videoService.startRecording();
      
      if (success) {
        toast({
          title: "Recording Started",
          description: "Class recording has begun",
        });
        updateParticipants();
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      toast({
        title: "Recording Failed",
        description: "Failed to start recording",
        variant: "destructive"
      });
      return false;
    }
  }, [videoService, isConnected, userRole, updateParticipants, toast]);

  const stopRecording = useCallback(async () => {
    if (userRole !== 'teacher') {
      toast({
        title: "Permission Denied",
        description: "Only teachers can stop recording",
        variant: "destructive"
      });
      return false;
    }

    if (!videoService || !isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to the classroom first",
        variant: "destructive"
      });
      return false;
    }

    try {
      const success = await videoService.stopRecording();
      
      if (success) {
        toast({
          title: "Recording Stopped",
          description: "Class recording has ended",
        });
        updateParticipants();
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      toast({
        title: "Stop Recording Failed",
        description: "Failed to stop recording",
        variant: "destructive"
      });
      return false;
    }
  }, [videoService, isConnected, userRole, updateParticipants, toast]);

  const raiseHand = useCallback(async () => {
    if (!videoService || !isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to the classroom first",
        variant: "destructive"
      });
      return false;
    }

    try {
      const success = await videoService.raiseHand();
      
      if (success) {
        toast({
          title: "Hand Raised",
          description: "Your hand has been raised",
        });
        updateParticipants();
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to raise hand:', error);
      return false;
    }
  }, [videoService, isConnected, updateParticipants, toast]);

  const startScreenShare = useCallback(async () => {
    if (!videoService || !isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to the classroom first",
        variant: "destructive"
      });
      return false;
    }

    try {
      const success = await videoService.startScreenShare();
      
      if (success) {
        toast({
          title: "Screen Share Started",
          description: "You are now sharing your screen",
        });
        updateParticipants();
      }
      
      return success;
    } catch (error) {
      console.error('❌ Failed to start screen share:', error);
      toast({
        title: "Screen Share Failed",
        description: "Failed to start screen sharing",
        variant: "destructive"
      });
      return false;
    }
  }, [videoService, isConnected, updateParticipants, toast]);

  return {
    joinRoom,
    leaveRoom,
    startRecording,
    stopRecording,
    raiseHand,
    startScreenShare
  };
}
