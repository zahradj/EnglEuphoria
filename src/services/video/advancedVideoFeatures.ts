import { logger } from '@/utils/logger';

export interface ScreenShareState {
  isScreenSharing: boolean;
  screenStream: MediaStream | null;
  participantScreenShares: Map<string, MediaStream>;
}

export interface RecordingState {
  isRecording: boolean;
  recordingStartTime: Date | null;
  recordingDuration: number;
  recordingUrl: string | null;
}

export interface VideoQualitySettings {
  resolution: 'low' | 'medium' | 'high' | 'hd';
  frameRate: number;
  bitrate: number;
}

export interface AdvancedVideoControls {
  startScreenShare(): Promise<boolean>;
  stopScreenShare(): Promise<boolean>;
  startRecording(): Promise<boolean>;
  stopRecording(): Promise<string | null>;
  setVideoQuality(quality: VideoQualitySettings): Promise<void>;
  spotlightParticipant(participantId: string): Promise<void>;
  pinParticipant(participantId: string): Promise<void>;
  muteParticipant(participantId: string): Promise<void>;
  removeParticipant(participantId: string): Promise<void>;
}

export class AdvancedVideoFeatureManager {
  private screenShareState: ScreenShareState = {
    isScreenSharing: false,
    screenStream: null,
    participantScreenShares: new Map()
  };

  private recordingState: RecordingState = {
    isRecording: false,
    recordingStartTime: null,
    recordingDuration: 0,
    recordingUrl: null
  };

  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  async startScreenShare(): Promise<boolean> {
    try {
      logger.debug('Starting screen share');
      
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor'
        } as DisplayMediaStreamOptions['video'],
        audio: true
      });

      this.screenShareState.isScreenSharing = true;
      this.screenShareState.screenStream = screenStream;

      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopScreenShare();
      });

      logger.info('Screen share started');
      return true;
    } catch (error) {
      logger.error('Failed to start screen share', error);
      return false;
    }
  }

  async stopScreenShare(): Promise<boolean> {
    try {
      if (this.screenShareState.screenStream) {
        this.screenShareState.screenStream.getTracks().forEach(track => track.stop());
      }
      
      this.screenShareState.isScreenSharing = false;
      this.screenShareState.screenStream = null;
      
      logger.debug('Screen share stopped');
      return true;
    } catch (error) {
      logger.error('Failed to stop screen share', error);
      return false;
    }
  }

  async startRecording(stream: MediaStream): Promise<boolean> {
    try {
      logger.debug('Starting recording');
      
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        throw new Error('WebM recording not supported');
      }

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        this.recordingState.recordingUrl = URL.createObjectURL(blob);
      };

      this.mediaRecorder.start(1000);
      
      this.recordingState.isRecording = true;
      this.recordingState.recordingStartTime = new Date();
      
      logger.info('Recording started');
      return true;
    } catch (error) {
      logger.error('Failed to start recording', error);
      return false;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (this.mediaRecorder && this.recordingState.isRecording) {
        this.mediaRecorder.stop();
        this.recordingState.isRecording = false;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        logger.debug('Recording stopped, URL:', this.recordingState.recordingUrl);
        return this.recordingState.recordingUrl;
      }
      return null;
    } catch (error) {
      logger.error('Failed to stop recording', error);
      return null;
    }
  }

  getScreenShareState(): ScreenShareState {
    return { ...this.screenShareState };
  }

  getRecordingState(): RecordingState {
    return { ...this.recordingState };
  }

  updateRecordingDuration() {
    if (this.recordingState.isRecording && this.recordingState.recordingStartTime) {
      this.recordingState.recordingDuration = 
        Date.now() - this.recordingState.recordingStartTime.getTime();
    }
  }
}
