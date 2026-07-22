import { useState, useCallback, useRef, useEffect } from 'react';

interface UseScreenShareOptions {
  onStreamStart?: (stream: MediaStream) => void;
  onStreamEnd?: () => void;
  onError?: (error: Error) => void;
}

export function useScreenShare(options: UseScreenShareOptions = {}) {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startScreenShare = useCallback(async (shareType: 'screen' | 'window' = 'screen') => {
    try {
      setError(null);
      
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          displaySurface: shareType === 'window' ? 'window' : 'monitor',
        } as MediaTrackConstraints,
        audio: true,
      };

      const mediaStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      
      setStream(mediaStream);
      setIsSharing(true);
      
      // Handle when user stops sharing via browser UI
      mediaStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      options.onStreamStart?.(mediaStream);
      
      return mediaStream;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start screen share');
      
      if (error.name === 'NotAllowedError') {
        setError('Screen sharing permission denied');
      } else if (error.name === 'NotFoundError') {
        setError('No screen sharing source found');
      } else {
        setError(error.message);
      }
      
      options.onError?.(error);
      return null;
    }
  }, [options]);

  const stopScreenShare = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsSharing(false);
    setError(null);
    options.onStreamEnd?.();
  }, [stream, options]);

  const attachToVideo = useCallback((videoElement: HTMLVideoElement) => {
    videoRef.current = videoElement;
    if (stream && videoElement) {
      videoElement.srcObject = stream;
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    isSharing,
    stream,
    error,
    startScreenShare,
    stopScreenShare,
    attachToVideo
  };
}
