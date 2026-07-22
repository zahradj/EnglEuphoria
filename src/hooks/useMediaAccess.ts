
import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useMediaAccess = (opts?: { cameraId?: string; micId?: string }) => {
  const { toast } = useToast();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  
  const [cameraStatus, setCameraStatus] = useState<'unknown' | 'working' | 'error'>('unknown');
  const [microphoneStatus, setMicrophoneStatus] = useState<'unknown' | 'working' | 'error'>('unknown');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoLoadTimeout, setVideoLoadTimeout] = useState(false);

  const initializeMedia = async () => {
    setIsLoading(true);
    setMediaError(null);
    setCameraStatus('unknown');
    setMicrophoneStatus('unknown');
    setIsVideoPlaying(false);
    setVideoLoadTimeout(false);
    setNeedsUserInteraction(false);
    
    try {
      
      const constraints = {
        video: { 
          deviceId: opts?.cameraId ? { exact: opts.cameraId } : undefined,
          width: { ideal: 640, max: 1280 }, 
          height: { ideal: 480, max: 720 },
          facingMode: "user",
          frameRate: { ideal: 30, max: 30 }
        },
        audio: {
          deviceId: opts?.micId ? { exact: opts.micId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('Media access granted, stream details:', {
        id: mediaStream.id,
        active: mediaStream.active,
        videoTracks: mediaStream.getVideoTracks().length,
        audioTracks: mediaStream.getAudioTracks().length
      });
      
      setStream(mediaStream);
      
      toast({
        title: "Media Access Granted",
        description: "Setting up camera and microphone...",
      });
      
    } catch (error) {
      console.error('Media access error:', error);
      let errorMessage = "Unable to access camera/microphone";
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "🎤 Camera & microphone blocked. Click the 🔒 lock icon in your browser's address bar → set Camera + Microphone to 'Allow' → reload this page.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "📷 No camera or microphone detected. Plug in a device or check your system settings, then try again.";
        } else if (error.name === "NotReadableError") {
          errorMessage = "⚠️ Your camera or mic is already in use by another app (Zoom, Meet, etc.). Close it and click 'Try again'.";
        } else if (error.name === "OverconstrainedError") {
          errorMessage = "Your camera/mic doesn't support the required quality. Try a different device.";
        } else {
          errorMessage = `Media error: ${error.message}`;
        }
      }
      
      setMediaError(errorMessage);
      setCameraStatus('error');
      setMicrophoneStatus('error');
      
      toast({
        title: "Media Access Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const retryMediaAccess = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    initializeMedia();
  };

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }, [stream]);

  return {
    stream,
    isMuted,
    setIsMuted,
    isCameraOff,
    setIsCameraOff,
    mediaError,
    isLoading,
    needsUserInteraction,
    setNeedsUserInteraction,
    cameraStatus,
    setCameraStatus,
    microphoneStatus,
    setMicrophoneStatus,
    isVideoPlaying,
    setIsVideoPlaying,
    videoLoadTimeout,
    setVideoLoadTimeout,
    initializeMedia,
    retryMediaAccess,
    cleanup
  };
};
