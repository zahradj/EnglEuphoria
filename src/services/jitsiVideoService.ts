
import { VideoService, VideoServiceConfig, VideoServiceCallbacks } from './videoService';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export class JitsiVideoService extends VideoService {
  private api: any = null;
  private localStream: MediaStream | null = null;
  private remoteStreams: Map<string, MediaStream> = new Map();
  private connected = false;
  private muted = false;
  private videoOff = false;

  constructor(config: VideoServiceConfig, callbacks: VideoServiceCallbacks = {}) {
    super(config, callbacks);
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load Jitsi Meet API script if not already loaded
      if (!window.JitsiMeetExternalAPI) {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Jitsi Meet API'));
        document.head.appendChild(script);
      } else {
        resolve();
      }
    });
  }

  async joinRoom(): Promise<void> {
    try {
      const domain = this.config.domain || 'meet.jit.si';
      const options = {
        roomName: this.config.roomName,
        width: '100%',
        height: '100%',
        parentNode: document.createElement('div'), // We'll manage this differently
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'hangup'
          ],
        },
        userInfo: {
          displayName: this.config.displayName
        }
      };

      this.api = new window.JitsiMeetExternalAPI(domain, options);

      // Set up event listeners
      this.api.addEventListener('participantJoined', this.handleParticipantJoined.bind(this));
      this.api.addEventListener('participantLeft', this.handleParticipantLeft.bind(this));
      this.api.addEventListener('videoConferenceJoined', this.handleConferenceJoined.bind(this));
      this.api.addEventListener('videoConferenceLeft', this.handleConferenceLeft.bind(this));

      this.connected = true;
      this.callbacks.onConnectionStatusChanged?.(true);

    } catch (error) {
      this.callbacks.onError?.('Failed to join room');
      throw error;
    }
  }

  async leaveRoom(): Promise<void> {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }
    this.connected = false;
    this.localStream = null;
    this.remoteStreams.clear();
    this.callbacks.onConnectionStatusChanged?.(false);
  }

  async toggleMicrophone(): Promise<boolean> {
    if (this.api) {
      await this.api.executeCommand('toggleAudio');
      this.muted = !this.muted;
      return this.muted;
    }
    return false;
  }

  async toggleCamera(): Promise<boolean> {
    if (this.api) {
      await this.api.executeCommand('toggleVideo');
      this.videoOff = !this.videoOff;
      return this.videoOff;
    }
    return false;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStreams(): Map<string, MediaStream> {
    return this.remoteStreams;
  }

  isConnected(): boolean {
    return this.connected;
  }

  dispose(): void {
    this.leaveRoom();
  }

  private handleParticipantJoined(event: any) {
    this.callbacks.onParticipantJoined?.(event.id, event.displayName);
  }

  private handleParticipantLeft(event: any) {
    this.callbacks.onParticipantLeft?.(event.id);
    this.remoteStreams.delete(event.id);
  }

  private handleConferenceJoined() {
    this.connected = true;
    this.callbacks.onConnectionStatusChanged?.(true);
  }

  private handleConferenceLeft() {
    this.connected = false;
    this.callbacks.onConnectionStatusChanged?.(false);
  }
}
