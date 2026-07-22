import { supabase } from '@/integrations/supabase/client';
import { logPeer, logWebRTC } from '@/lib/connectionDebugLog';

interface WebRTCCallbacks {
  onRemoteStream?: (stream: MediaStream) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
  /** Fired whenever the signaling channel becomes SUBSCRIBED (initial + after reconnects). */
  onSignalingReady?: () => void;
  /** Fired when the signaling channel drops. */
  onSignalingLost?: () => void;
}

const SIGNALING_RECONNECT_DELAY_MS = 3000;

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private channel: any = null;
  private roomId: string = '';
  private userId: string = '';
  private callbacks: WebRTCCallbacks = {};

  private signalingReady = false;
  private signalingReadyPromise: Promise<void> | null = null;
  private resolveSignalingReady: (() => void) | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;

  constructor(callbacks: WebRTCCallbacks = {}) {
    this.callbacks = callbacks;
  }

  async initialize(roomId: string, userId: string, localStream: MediaStream) {
    this.roomId = roomId;
    this.userId = userId;
    this.localStream = localStream;
    this.disposed = false;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    localStream.getTracks().forEach((track) => {
      this.peerConnection!.addTrack(track, localStream);
    });

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.callbacks.onRemoteStream?.(this.remoteStream);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      logPeer(
        state === 'connected' ? 'info' : state === 'failed' ? 'error' : 'warn',
        `Peer connection state: ${state}`,
        { iceState: this.peerConnection?.iceConnectionState },
      );
      this.callbacks.onConnectionChange?.(state === 'connected');
      if (state === 'failed') {
        this.callbacks.onError?.('Peer connection failed');
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Queue ICE candidates until signaling is ready (Supabase drops sends on un-subscribed channels)
        void this.sendSignal('ice-candidate', { candidate: event.candidate });
      }
    };

    await this.setupSignaling();
  }

  /**
   * Resolves once the signaling channel is SUBSCRIBED.
   * Callers (teacher) MUST await this before calling createOffer().
   */
  waitForSignaling(): Promise<void> {
    if (this.signalingReady) return Promise.resolve();
    if (!this.signalingReadyPromise) {
      this.signalingReadyPromise = new Promise<void>((resolve) => {
        this.resolveSignalingReady = resolve;
      });
    }
    return this.signalingReadyPromise;
  }

  isSignalingReady(): boolean {
    return this.signalingReady;
  }

  private resetReadyPromise() {
    this.signalingReady = false;
    this.signalingReadyPromise = new Promise<void>((resolve) => {
      this.resolveSignalingReady = resolve;
    });
  }

  private async setupSignaling() {
    if (this.disposed) return;
    this.resetReadyPromise();

    // Tear down any prior channel before re-subscribing
    if (this.channel) {
      try { await this.channel.unsubscribe(); } catch {}
      this.channel = null;
    }

    const channelName = `webrtc-${this.roomId}`;
    logWebRTC('info', 'Opening signaling channel', { channel: channelName });

    this.channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'offer' }, async ({ payload }: any) => {
        if (payload.from === this.userId) return;
        await this.handleOffer(payload.offer);
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }: any) => {
        if (payload.from === this.userId) return;
        await this.handleAnswer(payload.answer);
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }: any) => {
        if (payload.from === this.userId) return;
        await this.handleIceCandidate(payload.candidate);
      });

    this.channel.subscribe((status: string, err?: Error) => {
      if (err) {
        console.error('❌ Supabase Realtime Error (WebRTC):', err);
        logWebRTC('error', `Signaling error: ${err.message}`, {
          status,
          stack: err.stack,
          channel: `webrtc-${this.roomId}`,
        });
        this.callbacks.onError?.(err.message);
      } else {
        logWebRTC(
          status === 'SUBSCRIBED' ? 'info' : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' ? 'error' : 'warn',
          `Signaling status: ${status}`,
          { channel: `webrtc-${this.roomId}` },
        );
      }

      if (status === 'SUBSCRIBED') {
        this.signalingReady = true;
        if (this.resolveSignalingReady) {
          this.resolveSignalingReady();
          this.resolveSignalingReady = null;
        }
        this.callbacks.onSignalingReady?.();
      } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
        this.signalingReady = false;
        this.callbacks.onSignalingLost?.();
        this.scheduleSignalingReconnect(status);
      }
    });
  }

  private scheduleSignalingReconnect(reason: string) {
    if (this.disposed) return;
    if (this.reconnectTimer) return;
    console.warn(`📡 WebRTC signaling lost (${reason}). Reconnecting in ${SIGNALING_RECONNECT_DELAY_MS}ms…`);
    logWebRTC('warn', `Signaling lost — reconnecting in ${SIGNALING_RECONNECT_DELAY_MS}ms`, { reason });
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      if (this.disposed) return;
      await this.setupSignaling();
    }, SIGNALING_RECONNECT_DELAY_MS);
  }

  /**
   * Creates and sends an SDP offer. Waits for signaling readiness so the
   * peer is guaranteed to be subscribed before we broadcast.
   */
  async createOffer() {
    if (!this.peerConnection) return;
    await this.waitForSignaling();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    await this.sendSignal('offer', { offer });
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await this.sendSignal('answer', { answer });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) return;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  private async sendSignal(event: string, payload: any) {
    if (!this.channel) return;
    // Wait briefly if signaling is mid-handshake
    if (!this.signalingReady) {
      try {
        await Promise.race([
          this.waitForSignaling(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('signaling-timeout')), 5000)),
        ]);
      } catch {
        console.warn(`📡 Dropping signal '${event}' — signaling not ready`);
        return;
      }
    }
    this.channel.send({
      type: 'broadcast',
      event,
      payload: { ...payload, from: this.userId },
    });
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  dispose() {
    this.disposed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    try { this.channel?.unsubscribe(); } catch {}
    this.channel = null;
    this.peerConnection?.close();
    this.peerConnection = null;
    this.remoteStream = null;
    this.signalingReady = false;
  }
}
