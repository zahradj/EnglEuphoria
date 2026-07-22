
export interface VideoStream {
  id: string;
  stream: MediaStream | null;
  isLocal: boolean;
  displayName: string;
}

export interface VideoServiceConfig {
  roomName: string;
  displayName: string;
  domain?: string;
}

export interface VideoServiceCallbacks {
  onParticipantJoined?: (participantId: string, displayName: string) => void;
  onParticipantLeft?: (participantId: string) => void;
  onLocalStreamChanged?: (stream: MediaStream | null) => void;
  onRemoteStreamChanged?: (participantId: string, stream: MediaStream | null) => void;
  onConnectionStatusChanged?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

export abstract class VideoService {
  protected config: VideoServiceConfig;
  protected callbacks: VideoServiceCallbacks;

  constructor(config: VideoServiceConfig, callbacks: VideoServiceCallbacks = {}) {
    this.config = config;
    this.callbacks = callbacks;
  }

  abstract initialize(): Promise<void>;
  abstract joinRoom(): Promise<void>;
  abstract leaveRoom(): Promise<void>;
  abstract toggleMicrophone(): Promise<boolean>;
  abstract toggleCamera(): Promise<boolean>;
  abstract getLocalStream(): MediaStream | null;
  abstract getRemoteStreams(): Map<string, MediaStream>;
  abstract isConnected(): boolean;
  abstract dispose(): void | Promise<void>;
}
