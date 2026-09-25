import { VideoService, VideoServiceCallbacks } from '../videoService';
import { EnhancedVideoConfig, ParticipantData } from './types';
import { JitsiApiLoader } from './jitsiApiLoader';
import { JitsiEventHandlers } from './jitsiEventHandlers';
import { JitsiConfigBuilder } from './jitsiConfig';
import { AdvancedVideoFeatureManager } from './advancedVideoFeatures';
import { logger } from '@/utils/logger';

export class EnhancedVideoService extends VideoService {
  private api: any = null;
  private eventHandlers: JitsiEventHandlers;
  private featureManager: AdvancedVideoFeatureManager;
  private connectionQuality = 'good';
  private initialized = false;
  private localMediaStream: MediaStream | null = null;
  private connectionSimTimeout: ReturnType<typeof setTimeout> | null = null;
  private isDisposed = false;

  // Monotonic id for the current joinRoom() attempt. leaveRoom()/dispose()
  // bump it, which invalidates any join that is still mid-await: when that
  // join resumes it sees a stale token and bails instead of installing a
  // connection timer or mutating state on an already-torn-down service.
  private joinToken = 0;

  // Last connection state we surfaced to the consumer. Used to collapse
  // duplicate transitions — notably, leaveRoom() must not emit a spurious
  // `false` for a session that never reached `true` (leave-during-join).
  private lastConnectionState: boolean | null = null;

  constructor(config: EnhancedVideoConfig, callbacks: VideoServiceCallbacks = {}) {
    super(config, callbacks);
    // Route Jitsi's own `videoConferenceJoined` -> connection-status callback
    // through the same dedupe gate the service uses, so the event path and
    // the simulated-connection path can't double-fire or race a teardown.
    this.eventHandlers = new JitsiEventHandlers({
      ...callbacks,
      onConnectionStatusChanged: this.emitConnectionStatus,
    });
    this.featureManager = new AdvancedVideoFeatureManager();
  }

  /** Single choke point for connection-status updates: no updates after
   *  dispose, and no repeated/again-false transitions. */
  private emitConnectionStatus = (connected: boolean): void => {
    if (this.isDisposed) return;
    if ((this.lastConnectionState ?? false) === connected) return;
    this.lastConnectionState = connected;
    this.callbacks.onConnectionStatusChanged?.(connected);
  };

  /** True once a leaveRoom()/dispose() has superseded the join that owns
   *  `token`, or the service has been disposed outright. */
  private isJoinSuperseded(token: number): boolean {
    return token !== this.joinToken || this.isDisposed;
  }

  /** Tear down the Jitsi API instance and its container. Safe to call when
   *  there is nothing to tear down. */
  private teardownApi(): void {
    if (!this.api) return;
    try {
      this.api.dispose();
    } catch (error) {
      logger.warn('Enhanced: error disposing Jitsi API', error);
    }
    this.api = null;
    JitsiApiLoader.removeContainer();
  }

  private get enhancedConfig(): EnhancedVideoConfig {
    return this.config as EnhancedVideoConfig;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.debug('Enhanced: video service already initialized');
      return;
    }

    logger.debug('Enhanced: initializing video service');
    try {
      await JitsiApiLoader.loadJitsiApi();
      this.initialized = true;
      logger.info('Enhanced: video service initialized');
    } catch (error) {
      logger.error('Enhanced: failed to initialize video service', error);
      this.callbacks.onError?.('Failed to initialize video service');
      throw error;
    }
  }

  async joinRoom(): Promise<void> {
    logger.debug('Enhanced: joinRoom called', {
      initialized: this.initialized,
      hasApi: !!this.api,
    });

    if (!this.initialized) {
      throw new Error('Video service not initialized');
    }

    if (this.api) {
      logger.debug('Enhanced: already connected to room');
      return;
    }

    const token = ++this.joinToken;

    try {
      logger.debug('Enhanced: joining room', { domain: this.enhancedConfig.domain });
      const domain = this.enhancedConfig.domain || 'meet.jit.si';

      const container = JitsiApiLoader.createContainer();
      const options = JitsiConfigBuilder.buildOptions(this.enhancedConfig, container);

      logger.debug('Enhanced: creating Jitsi API instance');

      if (!window.JitsiMeetExternalAPI) {
        throw new Error('JitsiMeetExternalAPI not available');
      }

      this.api = new window.JitsiMeetExternalAPI(domain, options);
      logger.debug('Enhanced: Jitsi API instance created', !!this.api);

      logger.debug('Enhanced: setting up event listeners');
      this.eventHandlers.setupEventListeners(this.api);

      // Get local media stream for preview
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        if (this.isJoinSuperseded(token)) {
          // leaveRoom()/dispose() ran while getUserMedia was pending. Release
          // the stream we just acquired and abandon this join entirely.
          stream.getTracks().forEach(track => track.stop());
          this.teardownApi();
          return;
        }
        this.localMediaStream = stream;
        logger.debug('Enhanced: local media stream obtained');
      } catch (mediaError) {
        logger.warn('Enhanced: failed to get local media stream', mediaError);
      }

      if (this.isJoinSuperseded(token)) {
        // Torn down during setup — do not arm the connection timer.
        this.teardownApi();
        return;
      }

      // Simulate connection after a short delay
      this.connectionSimTimeout = setTimeout(() => {
        this.connectionSimTimeout = null;
        if (this.isJoinSuperseded(token)) return;
        logger.debug('Enhanced: simulating connection success');
        this.emitConnectionStatus(true);
      }, 2000);

    } catch (error) {
      logger.error('Enhanced: failed to join room', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join room';
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  async startRecording(): Promise<boolean> {
    if (this.api && this.enhancedConfig.enableRecording && this.localMediaStream) {
      try {
        logger.debug('Enhanced: starting recording');
        return await this.featureManager.startRecording(this.localMediaStream);
      } catch (error) {
        logger.error('Enhanced: failed to start recording', error);
        return false;
      }
    }
    return false;
  }

  async stopRecording(): Promise<string | null> {
    if (this.featureManager) {
      try {
        logger.debug('Enhanced: stopping recording');
        return await this.featureManager.stopRecording();
      } catch (error) {
        logger.error('Enhanced: failed to stop recording', error);
        return null;
      }
    }
    return null;
  }

  async startScreenShare(): Promise<boolean> {
    if (this.api && this.enhancedConfig.enableScreenShare) {
      try {
        logger.debug('Enhanced: starting screen share');
        const success = await this.featureManager.startScreenShare();
        
        if (success && this.api) {
          try {
            await this.api.executeCommand('toggleShareScreen');
          } catch (jitsiError) {
            logger.warn('Enhanced: Jitsi screen share failed, using local only', jitsiError);
          }
        }
        
        return success;
      } catch (error) {
        logger.error('Enhanced: failed to start screen share', error);
        return false;
      }
    }
    return false;
  }

  async stopScreenShare(): Promise<boolean> {
    try {
      logger.debug('Enhanced: stopping screen share');
      const success = await this.featureManager.stopScreenShare();
      
      if (this.api) {
        try {
          await this.api.executeCommand('toggleShareScreen');
        } catch (jitsiError) {
          logger.warn('Enhanced: Jitsi screen share stop failed', jitsiError);
        }
      }
      
      return success;
    } catch (error) {
      logger.error('Enhanced: failed to stop screen share', error);
      return false;
    }
  }

  getScreenShareState() {
    return this.featureManager.getScreenShareState();
  }

  getRecordingState() {
    return this.featureManager.getRecordingState();
  }

  async raiseHand(): Promise<boolean> {
    if (this.api) {
      try {
        logger.debug('Enhanced: raising hand');
        await this.api.executeCommand('toggleRaiseHand');
        return true;
      } catch (error) {
        logger.error('Enhanced: failed to raise hand', error);
        return false;
      }
    }
    return false;
  }

  getParticipants(): ParticipantData[] {
    return this.eventHandlers.getParticipants();
  }

  getConnectionQuality(): string {
    return this.connectionQuality;
  }

  isRecordingActive(): boolean {
    const recordingState = this.featureManager.getRecordingState();
    return recordingState.isRecording || this.eventHandlers.isRecordingActive();
  }

  async toggleMicrophone(): Promise<boolean> {
    logger.debug('Enhanced: toggleMicrophone called');
    
    if (this.localMediaStream) {
      const audioTrack = this.localMediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        logger.debug('Enhanced: local audio track toggled', audioTrack.enabled ? 'unmuted' : 'muted');
      }
    }
    
    if (this.api) {
      try {
        logger.debug('Enhanced: toggling microphone in Jitsi');
        await this.api.executeCommand('toggleAudio');
        return true;
      } catch (error) {
        logger.error('Enhanced: failed to toggle microphone in Jitsi', error);
        return false;
      }
    }
    
    logger.debug('Enhanced: microphone toggled (local only)');
    return true;
  }

  async toggleCamera(): Promise<boolean> {
    logger.debug('Enhanced: toggleCamera called');
    
    if (this.localMediaStream) {
      const videoTrack = this.localMediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        logger.debug('Enhanced: local video track toggled', videoTrack.enabled ? 'on' : 'off');
      }
    }
    
    if (this.api) {
      try {
        logger.debug('Enhanced: toggling camera in Jitsi');
        await this.api.executeCommand('toggleVideo');
        return true;
      } catch (error) {
        logger.error('Enhanced: failed to toggle camera in Jitsi', error);
        return false;
      }
    }
    
    logger.debug('Enhanced: camera toggled (local only)');
    return true;
  }

  getLocalStream(): MediaStream | null {
    return this.localMediaStream;
  }

  getRemoteStreams(): Map<string, MediaStream> {
    return new Map();
  }

  isConnected(): boolean {
    return this.api !== null;
  }

  private clearConnectionTimeout(): void {
    if (this.connectionSimTimeout !== null) {
      clearTimeout(this.connectionSimTimeout);
      this.connectionSimTimeout = null;
    }
  }

  async leaveRoom(): Promise<void> {
    logger.debug('Enhanced: leaving room');
    // Invalidate any joinRoom() still mid-await, then kill the pending timer.
    this.joinToken++;
    this.clearConnectionTimeout();

    await this.featureManager.stopScreenShare();
    await this.featureManager.stopRecording();

    this.teardownApi();

    if (this.localMediaStream) {
      this.localMediaStream.getTracks().forEach(track => track.stop());
      this.localMediaStream = null;
    }

    this.eventHandlers.clearParticipants();
    // emitConnectionStatus swallows this when we never reached `true`.
    this.emitConnectionStatus(false);
  }

  async dispose(): Promise<void> {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.clearConnectionTimeout();
    await this.leaveRoom();
    this.initialized = false;
  }
}

// Re-export types for convenience
export type { EnhancedVideoConfig, ParticipantData };
