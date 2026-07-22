
export interface EnhancedVideoConfig {
  roomName: string;
  displayName: string;
  domain?: string;
  enableRecording?: boolean;
  enableScreenShare?: boolean;
  maxParticipants?: number;
  moderatorPassword?: string;
}

export interface ParticipantData {
  id: string;
  displayName: string;
  role: 'teacher' | 'student';
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  joinTime: Date;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}
