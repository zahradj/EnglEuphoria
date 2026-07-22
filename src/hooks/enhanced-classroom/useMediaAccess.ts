
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

export function useMediaAccess() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();
  const hasShownToast = useRef(false);

  // Initialize media access
  const initializeMedia = useCallback(async () => {
    if (isInitialized || isInitializing) {
      return localStream;
    }
    
    setIsInitializing(true);
    
    try {
      
      // Try to get both video and audio first
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640, max: 1280 }, 
            height: { ideal: 480, max: 720 },
            facingMode: "user"
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (error) {
        console.warn('🎤 Failed to get video+audio, trying audio only:', error);
        // Fallback to audio only
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        setIsCameraOff(true);
      }
      
      setLocalStream(stream);
      setMediaError(null);
      setIsInitialized(true);
      
      console.log('🎤 Media access granted:', { 
        video: stream.getVideoTracks().length > 0,
        audio: stream.getAudioTracks().length > 0,
        streamId: stream.id
      });
      
      if (!hasShownToast.current) {
        toast({
          title: "Media Ready",
          description: `${stream.getVideoTracks().length > 0 ? 'Camera and microphone' : 'Microphone only'} connected`,
        });
        hasShownToast.current = true;
      }
      
      return stream;
    } catch (error) {
      console.error('🎤 Media access denied:', error);
      const name = error instanceof Error ? error.name : '';
      let description = 'Please allow camera and microphone access to join the classroom.';
      if (name === 'NotAllowedError') {
        description = "🔒 Permission blocked. Click the lock icon in your browser's address bar → set Camera + Microphone to 'Allow' → reload.";
      } else if (name === 'NotFoundError') {
        description = '📷 No camera or microphone detected. Plug in a device and try again.';
      } else if (name === 'NotReadableError') {
        description = '⚠️ Camera/mic in use by another app (Zoom, Meet, etc.). Close it and retry.';
      }
      const errorMessage = error instanceof Error ? error.message : 'Media access denied';
      setMediaError(description);
      setIsInitialized(true); // Mark as initialized even on error to prevent infinite retries
      
      if (!hasShownToast.current) {
        toast({
          title: "Camera & Mic Required",
          description,
          variant: "destructive"
        });
        hasShownToast.current = true;
      }
      
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [toast, isInitialized, isInitializing, localStream]);

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        return !audioTrack.enabled;
      }
    }
    
    // If no stream, toggle state only
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    return newMutedState;
  }, [localStream, isMuted]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
        return !videoTrack.enabled;
      }
    }
    
    // If no stream, toggle state only
    const newCameraState = !isCameraOff;
    setIsCameraOff(newCameraState);
    return newCameraState;
  }, [localStream, isCameraOff]);

  // Stop media stream
  const stopMedia = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
      setIsInitialized(false);
      hasShownToast.current = false;
    }
  }, [localStream]);

  // Auto-initialize media on mount
  useEffect(() => {
    if (!isInitialized && !isInitializing) {
      // Delay initialization to allow component to settle
      const timeoutId = setTimeout(() => {
        initializeMedia().catch(console.error);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [initializeMedia, isInitialized, isInitializing]);

  return {
    localStream,
    isMuted,
    isCameraOff,
    mediaError,
    isInitialized,
    isInitializing,
    toggleMicrophone,
    toggleCamera,
    initializeMedia,
    stopMedia
  };
}
