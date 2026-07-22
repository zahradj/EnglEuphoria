
import { useState, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseEnhancedMediaControlsProps {
  videoService: any;
  isConnected: boolean;
  updateParticipants: () => void;
}

export function useEnhancedMediaControls({
  videoService,
  isConnected,
  updateParticipants
}: UseEnhancedMediaControlsProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize local media stream
  useEffect(() => {
    if (isConnected && videoService && !localStream) {
      initializeLocalMedia();
    }
  }, [isConnected, videoService]);

  const initializeLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      setMediaError(null);
      
      // Configure WebRTC service with room and stream
      if (videoService && 'setRoomConfig' in videoService) {
        // For RealTimeVideoService, we need to provide room configuration
        // This will be done by the parent component when joining
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to access media devices';
      setMediaError(errorMessage);
      console.error('📹 Media initialization failed:', error);
      
      toast({
        title: "Media Access Error",
        description: "Please allow camera and microphone access to join the session",
        variant: "destructive"
      });
    }
  };

  const enhancedToggleMicrophone = useCallback(async () => {
    try {
      if (videoService && isConnected) {
        const muted = await videoService.toggleMicrophone();
        setIsMuted(muted);
        updateParticipants();
        
        toast({
          title: muted ? "Microphone Muted" : "Microphone Enabled",
          description: muted ? "You are now muted" : "You can now speak",
        });
        
        return muted;
      } else {
        // Fallback for local stream control
        if (localStream) {
          const audioTrack = localStream.getAudioTracks()[0];
          if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMuted(!audioTrack.enabled);
            return !audioTrack.enabled;
          }
        }
      }
    } catch (error) {
      console.error('🎤 Toggle microphone failed:', error);
      setMediaError('Failed to toggle microphone');
      
      toast({
        title: "Microphone Error",
        description: "Failed to toggle microphone. Please try again.",
        variant: "destructive"
      });
    }
    return isMuted;
  }, [videoService, isConnected, localStream, isMuted, updateParticipants, toast]);

  const enhancedToggleCamera = useCallback(async () => {
    try {
      if (videoService && isConnected) {
        const cameraOff = await videoService.toggleCamera();
        setIsCameraOff(cameraOff);
        updateParticipants();
        
        toast({
          title: cameraOff ? "Camera Disabled" : "Camera Enabled",
          description: cameraOff ? "Your camera is now off" : "You are now visible",
        });
        
        return cameraOff;
      } else {
        // Fallback for local stream control
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsCameraOff(!videoTrack.enabled);
            return !videoTrack.enabled;
          }
        }
      }
    } catch (error) {
      console.error('📹 Toggle camera failed:', error);
      setMediaError('Failed to toggle camera');
      
      toast({
        title: "Camera Error",
        description: "Failed to toggle camera. Please try again.",
        variant: "destructive"
      });
    }
    return isCameraOff;
  }, [videoService, isConnected, localStream, isCameraOff, updateParticipants, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  return {
    localStream,
    isMuted,
    isCameraOff,
    mediaError,
    enhancedToggleMicrophone,
    enhancedToggleCamera,
    initializeLocalMedia
  };
}
