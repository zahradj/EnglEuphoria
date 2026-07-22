
import React, { useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, RefreshCw, AlertCircle, Play, CheckCircle, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoPreviewCardProps {
  stream: MediaStream | null;
  isLoading: boolean;
  mediaError: string | null;
  cameraStatus: 'unknown' | 'working' | 'error';
  setCameraStatus: (status: 'unknown' | 'working' | 'error') => void;
  microphoneStatus: 'unknown' | 'working' | 'error';
  setMicrophoneStatus: (status: 'unknown' | 'working' | 'error') => void;
  isVideoPlaying: boolean;
  setIsVideoPlaying: (playing: boolean) => void;
  videoLoadTimeout: boolean;
  setVideoLoadTimeout: (timeout: boolean) => void;
  needsUserInteraction: boolean;
  setNeedsUserInteraction: (needs: boolean) => void;
  isCameraOff: boolean;
  isMuted: boolean;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  retryMediaAccess: () => void;
  startAudioLevelMonitoring: (stream: MediaStream) => void;
}

export const VideoPreviewCard = ({
  stream,
  isLoading,
  mediaError,
  cameraStatus,
  setCameraStatus,
  microphoneStatus,
  setMicrophoneStatus,
  isVideoPlaying,
  setIsVideoPlaying,
  videoLoadTimeout,
  setVideoLoadTimeout,
  needsUserInteraction,
  setNeedsUserInteraction,
  isCameraOff,
  isMuted,
  toggleCamera,
  toggleMicrophone,
  retryMediaAccess,
  startAudioLevelMonitoring
}: VideoPreviewCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const setupVideoElement = (mediaStream: MediaStream) => {
    const video = videoRef.current;
    if (!video) return;
    if (videoTimeoutRef.current) {
      clearTimeout(videoTimeoutRef.current);
    }

    const handleLoadedMetadata = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
            setVideoLoadTimeout(false);
            setNeedsUserInteraction(false);
          })
          .catch((error) => {
            console.error('Video play failed:', error);
            if (error.name === 'NotAllowedError') {
              setNeedsUserInteraction(true);
              toast({
                title: "User Interaction Required",
                description: "Click the play button to start the video.",
                variant: "destructive"
              });
            } else {
              setCameraStatus('error');
            }
          });
      }
    };

    const handlePlaying = () => {
      setIsVideoPlaying(true);
      setVideoLoadTimeout(false);
      setCameraStatus('working');
      setNeedsUserInteraction(false);
      
      if (videoTimeoutRef.current) {
        clearTimeout(videoTimeoutRef.current);
      }
    };

    const handleError = () => {
      console.error('Video element error');
      setCameraStatus('error');
      setIsVideoPlaying(false);
    };

    video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    video.removeEventListener('playing', handlePlaying);
    video.removeEventListener('error', handleError);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    video.srcObject = mediaStream;

    videoTimeoutRef.current = setTimeout(() => {
      if (!isVideoPlaying) {
        console.warn('Video failed to start within timeout period');
        setVideoLoadTimeout(true);
        setNeedsUserInteraction(true);
      }
    }, 5000);
  };

  const validateMediaTracks = (mediaStream: MediaStream) => {
    const videoTracks = mediaStream.getVideoTracks();
    const audioTracks = mediaStream.getAudioTracks();
    if (audioTracks.length > 0 && audioTracks[0].readyState === 'live' && audioTracks[0].enabled) {
      setMicrophoneStatus('working');
      startAudioLevelMonitoring(mediaStream);
    } else {
      setMicrophoneStatus('error');
    }

    if (videoTracks.length > 0 && videoTracks[0].readyState === 'live' && videoTracks[0].enabled) {
      setupVideoElement(mediaStream);
    } else {
      setCameraStatus('error');
    }
  };

  const handleManualVideoStart = async () => {
    const video = videoRef.current;
    if (!video || !stream) return;

    try {
      await video.play();
      setNeedsUserInteraction(false);
      setIsVideoPlaying(true);
      setCameraStatus('working');
      
      toast({
        title: "Video Started",
        description: "Camera test is now working!",
      });
    } catch (error) {
      console.error('Manual video start failed:', error);
    }
  };

  useEffect(() => {
    if (stream) {
      validateMediaTracks(stream);
    }

    return () => {
      if (videoTimeoutRef.current) {
        clearTimeout(videoTimeoutRef.current);
      }
    };
  }, [stream]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Camera Test
          {cameraStatus === 'working' && isVideoPlaying && <CheckCircle className="h-4 w-4 text-green-500" />}
          {cameraStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
          {cameraStatus === 'unknown' && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Requesting camera access...
              </div>
            </div>
          ) : mediaError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p className="mb-2">{mediaError}</p>
                <Button onClick={retryMediaAccess} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {stream && (
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Badge variant={isVideoPlaying ? "default" : "destructive"}>
                    {isVideoPlaying ? "Video Live" : videoLoadTimeout ? "Video Failed" : "Video Loading"}
                  </Badge>
                  {videoLoadTimeout && (
                    <Badge variant="secondary" className="text-xs">
                      Timeout
                    </Badge>
                  )}
                </div>
              )}

              {needsUserInteraction && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Button onClick={handleManualVideoStart} size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Play className="h-6 w-6 mr-2" />
                    Start Video
                  </Button>
                </div>
              )}
            </>
          )}
          
          {isCameraOff && !mediaError && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <CameraOff className="h-12 w-12 mx-auto mb-2" />
                <p>Camera is off</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            onClick={toggleCamera}
            variant={isCameraOff ? "destructive" : "outline"}
            disabled={!stream || !!mediaError}
            className="flex-1"
          >
            {isCameraOff ? <CameraOff className="h-4 w-4 mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
            {isCameraOff ? "Turn On Camera" : "Turn Off Camera"}
          </Button>
          
          <Button
            onClick={toggleMicrophone}
            variant={isMuted ? "destructive" : "outline"}
            disabled={!stream || !!mediaError}
            className="flex-1"
          >
            {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {isMuted ? "Unmute" : "Mute"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
