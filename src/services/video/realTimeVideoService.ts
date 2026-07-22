import { WebRTCVideoService } from './webrtcVideoService';
import { ConnectionQualityMonitor, ConnectionQualityMetrics } from './connectionQualityMonitor';
import { ReconnectionManager } from './reconnectionManager';

export interface VideoParticipant {
  id: string;
  name: string;
  stream: MediaStream;
  isSpeaking: boolean;
  audioLevel: number;
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

export class RealTimeVideoService {
  private webrtcService: WebRTCVideoService;
  private participants = new Map<string, VideoParticipant>();
  private onParticipantsChangeCallback: ((participants: VideoParticipant[]) => void) | null = null;
  private localStream: MediaStream | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private connected = false;
  private qualityMonitor: ConnectionQualityMonitor;
  private reconnectionManager: ReconnectionManager;
  private currentQuality: ConnectionQualityMetrics | null = null;

  constructor() {
    this.webrtcService = new WebRTCVideoService();
    this.qualityMonitor = new ConnectionQualityMonitor();
    this.reconnectionManager = new ReconnectionManager({
      maxAttempts: 5,
      initialDelay: 2000,
      maxDelay: 30000,
      backoffMultiplier: 2
    });
    
    this.webrtcService.setOnParticipantsUpdate((remoteStreams) => {
      this.updateParticipantsFromStreams(remoteStreams);
    });

    // Set up reconnection callback
    this.reconnectionManager.setCallbacks(
      async () => {
        if (this.roomId && this.userId && this.localStream) {
          await this.webrtcService.joinRoom(this.roomId, this.userId, this.localStream);
        }
      },
      (status) => {
      }
    );
  }

  async initialize(): Promise<void> {
  }

  private updateParticipantsFromStreams(remoteStreams: Map<string, MediaStream>) {
    const newParticipants = new Map<string, VideoParticipant>();

    remoteStreams.forEach((stream, userId) => {
      const existingParticipant = this.participants.get(userId);
      newParticipants.set(userId, {
        id: userId,
        name: existingParticipant?.name || `User ${userId.substring(0, 8)}`,
        stream,
        isSpeaking: existingParticipant?.isSpeaking || false,
        audioLevel: existingParticipant?.audioLevel || 0
      });
    });

    this.participants = newParticipants;
    this.notifyParticipantsChange();
  }

  async joinRoom(): Promise<void> {
    if (!this.roomId || !this.userId || !this.localStream) {
      throw new Error('Room configuration not set. Call setRoomConfig first.');
    }
    await this.webrtcService.joinRoom(this.roomId, this.userId, this.localStream);
    this.connected = true;
  }

  setRoomConfig(roomId: string, userId: string, localStream: MediaStream): void {
    this.roomId = roomId;
    this.userId = userId;
    this.localStream = localStream;
  }

  async leaveRoom(): Promise<void> {
    this.webrtcService.leaveRoom();
    this.participants.clear();
    this.notifyParticipantsChange();
    this.connected = false;
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  getParticipants(): ParticipantData[] {
    return Array.from(this.participants.values()).map(p => ({
      id: p.id,
      displayName: p.name,
      role: 'student' as const,
      isMuted: false,
      isVideoOff: false,
      isHandRaised: false,
      joinTime: new Date()
    }));
  }

  getVideoParticipants(): VideoParticipant[] {
    return Array.from(this.participants.values());
  }

  onParticipantsChange(callback: (participants: VideoParticipant[]) => void): void {
    this.onParticipantsChangeCallback = callback;
  }

  private notifyParticipantsChange(): void {
    if (this.onParticipantsChangeCallback) {
      this.onParticipantsChangeCallback(this.getVideoParticipants());
    }
  }

  updateParticipantName(userId: string, name: string): void {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.name = name;
      this.notifyParticipantsChange();
    }
  }

  updateSpeakingStatus(userId: string, isSpeaking: boolean, audioLevel: number = 0): void {
    const participant = this.participants.get(userId);
    if (participant) {
      participant.isSpeaking = isSpeaking;
      participant.audioLevel = audioLevel;
      this.notifyParticipantsChange();
    }
  }

  async toggleMicrophone(): Promise<boolean> {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return true;
      }
    }
    return false;
  }

  async toggleCamera(): Promise<boolean> {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return true;
      }
    }
    return false;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStreams(): Map<string, MediaStream> {
    return this.webrtcService.getRemoteStreams();
  }

  getConnectionQuality(): string {
    if (!this.currentQuality) return 'unknown';
    return this.currentQuality.quality;
  }

  getConnectionMetrics(): ConnectionQualityMetrics | null {
    return this.currentQuality;
  }

  startQualityMonitoring(callback?: (metrics: ConnectionQualityMetrics) => void) {
    this.qualityMonitor.startMonitoring((metrics) => {
      this.currentQuality = metrics;
      if (callback) {
        callback(metrics);
      }
    });
  }

  stopQualityMonitoring() {
    this.qualityMonitor.stopMonitoring();
  }

  isRecordingActive(): boolean {
    return false;
  }

  async startRecording(): Promise<boolean> {
    return false;
  }

  async stopRecording(): Promise<string | null> {
    return null;
  }

  async raiseHand(): Promise<boolean> {
    return false;
  }

  async startScreenShare(): Promise<boolean> {
    return false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  dispose(): void {
    this.leaveRoom();
    this.qualityMonitor.dispose();
    this.reconnectionManager.dispose();
  }
}

export const realTimeVideoService = new RealTimeVideoService();
