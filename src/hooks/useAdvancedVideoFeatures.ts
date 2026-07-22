
import { useState, useEffect, useCallback, useRef } from 'react';
import { AdvancedVideoFeatureManager, VideoQualitySettings } from '@/services/video/advancedVideoFeatures';
import { useToast } from '@/hooks/use-toast';

interface UseAdvancedVideoFeaturesProps {
  localStream: MediaStream | null;
  isTeacher: boolean;
  roomId: string;
}

export function useAdvancedVideoFeatures({
  localStream,
  isTeacher,
  roomId
}: UseAdvancedVideoFeaturesProps) {
  const [featureManager] = useState(() => new AdvancedVideoFeatureManager());
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [showVideoSettings, setShowVideoSettings] = useState(false);
  const [videoQuality, setVideoQuality] = useState<VideoQualitySettings>({
    resolution: 'medium',
    frameRate: 24,
    bitrate: 600
  });
  
  const recordingIntervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Update recording duration
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        featureManager.updateRecordingDuration();
        const state = featureManager.getRecordingState();
        setRecordingDuration(state.recordingDuration);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording, featureManager]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        const success = await featureManager.stopScreenShare();
        if (success) {
          setIsScreenSharing(false);
          setScreenStream(null);
          toast({
            title: "Screen Share Stopped",
            description: "You are no longer sharing your screen",
          });
        }
      } else {
        const success = await featureManager.startScreenShare();
        if (success) {
          const state = featureManager.getScreenShareState();
          setIsScreenSharing(true);
          setScreenStream(state.screenStream);
          toast({
            title: "Screen Share Started",
            description: "You are now sharing your screen",
          });
        } else {
          toast({
            title: "Screen Share Failed",
            description: "Could not start screen sharing. Please check permissions.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Screen share toggle failed:', error);
      toast({
        title: "Screen Share Error",
        description: "An error occurred while toggling screen share",
        variant: "destructive"
      });
    }
  }, [isScreenSharing, featureManager, toast]);

  const toggleRecording = useCallback(async () => {
    if (!isTeacher) {
      toast({
        title: "Permission Denied",
        description: "Only teachers can start recordings",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isRecording) {
        const url = await featureManager.stopRecording();
        setIsRecording(false);
        setRecordingUrl(url);
        toast({
          title: "Recording Stopped",
          description: "Your session recording has been saved",
        });
      } else {
        if (!localStream) {
          toast({
            title: "Recording Failed",
            description: "No video stream available to record",
            variant: "destructive"
          });
          return;
        }

        const success = await featureManager.startRecording(localStream);
        if (success) {
          setIsRecording(true);
          setRecordingDuration(0);
          toast({
            title: "Recording Started",
            description: "Your session is now being recorded",
          });
        } else {
          toast({
            title: "Recording Failed",
            description: "Could not start recording. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Recording toggle failed:', error);
      toast({
        title: "Recording Error",
        description: "An error occurred while toggling recording",
        variant: "destructive"
      });
    }
  }, [isRecording, localStream, isTeacher, featureManager, toast]);

  const handleVideoQualityChange = useCallback((newSettings: VideoQualitySettings) => {
    setVideoQuality(newSettings);
    toast({
      title: "Video Quality Updated",
      description: `Quality set to ${newSettings.resolution} @ ${newSettings.frameRate}fps`,
    });
  }, [toast]);

  const downloadRecording = useCallback(() => {
    if (recordingUrl) {
      const link = document.createElement('a');
      link.href = recordingUrl;
      link.download = `classroom-recording-${roomId}-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Your recording is being downloaded",
      });
    }
  }, [recordingUrl, roomId, toast]);

  return {
    // Screen sharing
    isScreenSharing,
    screenStream,
    toggleScreenShare,
    
    // Recording
    isRecording,
    recordingDuration,
    recordingUrl,
    toggleRecording,
    downloadRecording,
    
    // Video settings
    showVideoSettings,
    setShowVideoSettings,
    videoQuality,
    handleVideoQualityChange,
    
    // Permissions
    canRecord: isTeacher,
    canScreenShare: true,
    canControlParticipants: isTeacher
  };
}
