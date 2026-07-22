import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface WebRTCParticipant {
  id: string;
  name: string;
  role: 'teacher' | 'student' | 'observer';
  stream?: MediaStream;
  peerConnection?: RTCPeerConnection;
  hasAudio: boolean;
  hasVideo: boolean;
  isPresenting: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
}

interface ConnectionStats {
  bitrate: number;
  packetLoss: number;
  latency: number;
  jitter: number;
}

export const useEnhancedWebRTC = (roomId: string, userId: string) => {
  const [participants, setParticipants] = useState<WebRTCParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStats, setConnectionStats] = useState<ConnectionStats>({
    bitrate: 0,
    packetLoss: 0,
    latency: 0,
    jitter: 0
  });
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const signalingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { toast } = useToast();

  // Lazily get or create the signaling channel — single channel per room
  const getSignalingChannel = useCallback(() => {
    if (!signalingChannelRef.current) {
      signalingChannelRef.current = supabase.channel(`webrtc_${roomId}`);
      signalingChannelRef.current.subscribe();
    }
    return signalingChannelRef.current;
  }, [roomId]);

  // ICE servers configuration with TURN/STUN
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN servers for production
    // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
  ];

  const initializeLocalMedia = useCallback(async (constraints = { video: true, audio: true }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Apply noise cancellation and audio processing
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack && audioTrack.getSettings) {
        audioTrack.applyConstraints({
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        });
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media:', error);
      toast({
        title: "Media Access Error",
        description: "Could not access camera or microphone",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const createPeerConnection = useCallback((participantId: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({ iceServers });
    
    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle incoming stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setParticipants(prev => prev.map(p => 
        p.id === participantId ? { ...p, stream: remoteStream } : p
      ));
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      
      if (peerConnection.connectionState === 'failed') {
        // Attempt to restart ICE
        peerConnection.restartIce();
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate via Supabase signaling
        getSignalingChannel().send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            to: participantId,
            from: userId,
            candidate: event.candidate
          }
        });
      }
    };

    // Monitor connection quality
    const statsInterval = setInterval(async () => {
      try {
        const stats = await peerConnection.getStats();
        const connectionQuality = analyzeConnectionQuality(stats);
        
        setParticipants(prev => prev.map(p => 
          p.id === participantId ? { ...p, connectionQuality } : p
        ));
        
        updateConnectionStats(stats);
      } catch (error) {
        console.error('Error getting stats:', error);
      }
    }, 5000);

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'closed' || 
          peerConnection.connectionState === 'failed') {
        clearInterval(statsInterval);
      }
    };

    peerConnectionsRef.current.set(participantId, peerConnection);
    return peerConnection;
  }, [localStream, roomId, userId]);

  const analyzeConnectionQuality = (stats: RTCStatsReport): 'excellent' | 'good' | 'poor' => {
    let packetLoss = 0;
    let bitrate = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        packetLoss = report.packetsLost / (report.packetsReceived + report.packetsLost) * 100;
        bitrate = report.bytesReceived * 8 / 1000; // kbps
      }
    });

    if (packetLoss < 1 && bitrate > 500) return 'excellent';
    if (packetLoss < 3 && bitrate > 300) return 'good';
    return 'poor';
  };

  const updateConnectionStats = (stats: RTCStatsReport) => {
    let newStats: ConnectionStats = {
      bitrate: 0,
      packetLoss: 0,
      latency: 0,
      jitter: 0
    };

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp') {
        newStats.bitrate = report.bytesReceived * 8 / 1000; // kbps
        newStats.packetLoss = report.packetsLost;
        newStats.jitter = report.jitter || 0;
      }
      
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        newStats.latency = report.currentRoundTripTime * 1000 || 0; // ms
      }
    });

    setConnectionStats(newStats);
  };

  const adaptiveBitrateControl = useCallback(async (quality: 'excellent' | 'good' | 'poor') => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const constraints: MediaTrackConstraints = {};

    switch (quality) {
      case 'poor':
        constraints.width = { ideal: 320 };
        constraints.height = { ideal: 240 };
        constraints.frameRate = { ideal: 15 };
        break;
      case 'good':
        constraints.width = { ideal: 640 };
        constraints.height = { ideal: 480 };
        constraints.frameRate = { ideal: 24 };
        break;
      case 'excellent':
        constraints.width = { ideal: 1280 };
        constraints.height = { ideal: 720 };
        constraints.frameRate = { ideal: 30 };
        break;
    }

    try {
      await videoTrack.applyConstraints(constraints);
    } catch (error) {
      console.error('Error applying adaptive bitrate:', error);
    }
  }, [localStream]);

  const handleOffer = async (offer: RTCSessionDescriptionInit, fromId: string) => {
    const peerConnection = createPeerConnection(fromId);
    
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send answer via Supabase signaling
    getSignalingChannel().send({
      type: 'broadcast',
      event: 'answer',
      payload: {
        to: fromId,
        from: userId,
        answer
      }
    });
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit, fromId: string) => {
    const peerConnection = peerConnectionsRef.current.get(fromId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit, fromId: string) => {
    const peerConnection = peerConnectionsRef.current.get(fromId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  };

  const initiateCall = async (participantId: string) => {
    const peerConnection = createPeerConnection(participantId);
    
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Send offer via Supabase signaling
    getSignalingChannel().send({
      type: 'broadcast',
      event: 'offer',
      payload: {
        to: participantId,
        from: userId,
        offer
      }
    });
  };

  const cleanup = useCallback(() => {
    // Close all peer connections
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Remove Realtime signaling channel
    if (signalingChannelRef.current) {
      supabase.removeChannel(signalingChannelRef.current);
      signalingChannelRef.current = null;
    }

    setIsConnected(false);
    setLocalStream(null);
    setParticipants([]);
  }, [localStream]);

  return {
    participants,
    localStream,
    localVideoRef,
    isConnected,
    connectionStats,
    initializeLocalMedia,
    initiateCall,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    adaptiveBitrateControl,
    cleanup
  };
};