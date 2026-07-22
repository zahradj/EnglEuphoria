import { PeerConnectionManager } from './peerConnectionManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

/**
 * WebRTC Video Service using Supabase Realtime Broadcast for signaling.
 * 
 * Replaces the old WebSocket-based edge function signaling which failed
 * because Supabase Edge Functions are stateless (each connection hits a
 * different isolate, so in-memory Maps are never shared).
 * 
 * Supabase Realtime channels are managed by persistent infrastructure,
 * so both participants reliably receive each other's messages.
 */
export class WebRTCVideoService {
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private peerManager: PeerConnectionManager;
  private roomId: string | null = null;
  private userId: string | null = null;
  private onParticipantsUpdate: ((participants: Map<string, MediaStream>) => void) | null = null;
  private isJoined = false;

  constructor() {
    this.peerManager = new PeerConnectionManager();
  }

  setOnParticipantsUpdate(callback: (participants: Map<string, MediaStream>) => void) {
    this.onParticipantsUpdate = callback;
  }

  async joinRoom(roomId: string, userId: string, localStream: MediaStream): Promise<void> {
    this.roomId = roomId;
    this.userId = userId;

    this.peerManager.setLocalStream(localStream);

    // Set up remote stream handler
    this.peerManager.setOnRemoteStream((peerId, stream) => {
      this.notifyParticipantsUpdate();
    });

    // Set up connection state handler
    this.peerManager.setOnConnectionStateChange((peerId, state) => {
      if (state === 'failed' || state === 'disconnected') {
        this.notifyParticipantsUpdate();
      }
    });

    // Connect via Supabase Realtime Broadcast
    await this.connectViaRealtimeBroadcast(roomId, userId);
  }

  private async connectViaRealtimeBroadcast(roomId: string, userId: string): Promise<void> {
    const channelName = `webrtc-${roomId}`;

    this.channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false },
        presence: { key: userId },
      },
    });

    // Listen for signaling events
    this.channel
      .on('broadcast', { event: 'join' }, (payload) => {
        this.handleRemoteJoin(payload.payload);
      })
      .on('broadcast', { event: 'offer' }, (payload) => {
        this.handleOffer(payload.payload.fromUserId, payload.payload.data);
      })
      .on('broadcast', { event: 'answer' }, (payload) => {
        this.handleAnswer(payload.payload.fromUserId, payload.payload.data);
      })
      .on('broadcast', { event: 'ice-candidate' }, (payload) => {
        this.handleIceCandidate(payload.payload.fromUserId, payload.payload.data);
      })
      .on('broadcast', { event: 'leave' }, (payload) => {
        this.handleUserLeft(payload.payload.userId);
      })
      .on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync();
      });

    // Subscribe and then announce join
    return new Promise((resolve, reject) => {
      this.channel!.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          this.isJoined = true;

          // Track presence so peers can deterministically discover each other
          // even when broadcast 'join' messages race the subscribe handshake.
          await this.channel!.track({ userId, joinedAt: Date.now() });

          // Announce our presence — other participants will initiate offers
          this.channel!.send({
            type: 'broadcast',
            event: 'join',
            payload: { userId, roomId }
          });

          toast.success("Joined video room");
          resolve();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime channel error');
          toast.error("Connection error");
          reject(new Error('Channel subscription failed'));
        }
      });
    });
  }

  /**
   * Presence sync fires whenever the participant list changes. We use it as
   * the authoritative source of truth and run a deterministic offerer rule:
   * the peer with the lexicographically smaller userId initiates. This makes
   * negotiation immune to broadcast races on simultaneous joins.
   */
  private handlePresenceSync() {
    if (!this.channel || !this.userId) return;
    const state = this.channel.presenceState() as Record<string, Array<{ userId?: string }>>;

    const remoteUserIds = new Set<string>();
    Object.entries(state).forEach(([key, presences]) => {
      const presenceUserId = presences?.[0]?.userId || key;
      if (presenceUserId && presenceUserId !== this.userId) {
        remoteUserIds.add(presenceUserId);
      }
    });

    remoteUserIds.forEach((remoteUserId) => {
      if (this.peerManager.getConnectionState(remoteUserId)) return;
      if (this.userId! < remoteUserId) {
        this.initiateConnectionToUser(remoteUserId).catch((err) =>
          console.error('Presence-driven offer failed', err)
        );
      } else {
      }
    });
  }

  /**
   * Broadcast 'join' fallback. Same deterministic offerer rule as presence
   * sync to avoid glare; getConnectionState() guards against duplicates.
   */
  private async handleRemoteJoin(payload: { userId: string; roomId: string }) {
    const remoteUserId = payload.userId;
    if (remoteUserId === this.userId) return;
    if (this.peerManager.getConnectionState(remoteUserId)) return;
    if (this.userId! >= remoteUserId) return;

    await this.initiateConnectionToUser(remoteUserId);
  }

  private async initiateConnectionToUser(targetUserId: string) {

    // Create peer connection with ICE candidate relay
    await this.peerManager.createPeerConnection(targetUserId, (candidate) => {
      this.sendBroadcast('ice-candidate', {
        fromUserId: this.userId!,
        targetUserId,
        data: candidate.toJSON()
      });
    });

    // Create and send offer
    const offer = await this.peerManager.createOffer(targetUserId);
    this.sendBroadcast('offer', {
      fromUserId: this.userId!,
      targetUserId,
      data: offer
    });
  }

  private async handleOffer(fromUserId: string, offer: RTCSessionDescriptionInit) {
    if (fromUserId === this.userId) return;

    // Create peer connection if it doesn't exist
    if (!this.peerManager.getConnectionState(fromUserId)) {
      await this.peerManager.createPeerConnection(fromUserId, (candidate) => {
        this.sendBroadcast('ice-candidate', {
          fromUserId: this.userId!,
          targetUserId: fromUserId,
          data: candidate.toJSON()
        });
      });
    }

    // Handle offer and create answer
    const answer = await this.peerManager.handleOffer(fromUserId, offer);
    this.sendBroadcast('answer', {
      fromUserId: this.userId!,
      targetUserId: fromUserId,
      data: answer
    });
  }

  private async handleAnswer(fromUserId: string, answer: RTCSessionDescriptionInit) {
    if (fromUserId === this.userId) return;
    await this.peerManager.handleAnswer(fromUserId, answer);
  }

  private async handleIceCandidate(fromUserId: string, candidate: RTCIceCandidateInit) {
    if (fromUserId === this.userId) return;
    await this.peerManager.handleIceCandidate(fromUserId, candidate);
  }

  private handleUserLeft(userId: string) {
    if (userId === this.userId) return;
    this.peerManager.closePeerConnection(userId);
    this.notifyParticipantsUpdate();
    toast.info("Participant left");
  }

  private sendBroadcast(event: string, payload: Record<string, any>) {
    if (!this.channel || !this.isJoined) {
      console.error('Realtime channel not connected');
      return;
    }
    this.channel.send({
      type: 'broadcast',
      event,
      payload
    });
  }

  private notifyParticipantsUpdate() {
    if (this.onParticipantsUpdate) {
      const participants = this.peerManager.getAllRemoteStreams();
      this.onParticipantsUpdate(participants);
    }
  }

  leaveRoom() {
    if (this.channel && this.roomId && this.userId) {
      this.sendBroadcast('leave', { userId: this.userId, roomId: this.roomId });
    }

    this.peerManager.closeAllConnections();

    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }

    this.roomId = null;
    this.userId = null;
    this.isJoined = false;
  }

  getRemoteStreams(): Map<string, MediaStream> {
    return this.peerManager.getAllRemoteStreams();
  }
}
