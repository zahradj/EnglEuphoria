import { useState, useEffect, useCallback, useRef } from 'react';
import { RealTimeVideoService, VideoParticipant } from '@/services/video/realTimeVideoService';
import { toast } from 'sonner';

interface UseWebRTCConnectionProps {
  roomId: string;
  userId: string;
  localStream: MediaStream | null;
  enabled: boolean;
}

export const useWebRTCConnection = ({
  roomId,
  userId,
  localStream,
  enabled
}: UseWebRTCConnectionProps) => {
  const [participants, setParticipants] = useState<VideoParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const connectingRef = useRef(false);
  const connectedRef = useRef(false);
  // Owned per-mount, not a shared module singleton — two classrooms
  // rendered in the same tab/process (e.g. a future multi-room teacher
  // view) must not share roomId/participants/localStream state.
  const serviceRef = useRef<RealTimeVideoService | null>(null);
  if (!serviceRef.current) {
    serviceRef.current = new RealTimeVideoService();
  }

  const connect = useCallback(async () => {
    if (!localStream || !enabled || connectedRef.current || connectingRef.current) {
      return;
    }

    connectingRef.current = true;
    setIsConnecting(true);
    try {
      serviceRef.current!.setRoomConfig(roomId, userId, localStream);
      await serviceRef.current!.joinRoom();
      connectedRef.current = true;
      setIsConnected(true);
      toast.success("Connected to video call");
    } catch (error) {
      console.error('Error connecting to video room:', error);
      toast.error("Failed to connect to video call");
    } finally {
      connectingRef.current = false;
      setIsConnecting(false);
    }
  }, [roomId, userId, localStream, enabled]);

  const disconnect = useCallback(async () => {
    if (!connectedRef.current) return;

    await serviceRef.current!.leaveRoom();
    connectedRef.current = false;
    setIsConnected(false);
    setParticipants([]);
  }, []);

  // Set up participants listener — stable across renders
  useEffect(() => {
    const service = serviceRef.current!;
    service.onParticipantsChange((newParticipants) => {
      setParticipants(newParticipants);
    });

    return () => {
      // Tear down this hook instance's own service — never touches another
      // mounted classroom's service, since each owns its own instance.
      service.dispose();
      connectedRef.current = false;
    };
  }, []); // Empty deps — only mount/unmount

  // Auto-connect/disconnect based on enabled state
  useEffect(() => {
    if (enabled && localStream && !connectedRef.current && !connectingRef.current) {
      connect();
    } else if (!enabled && connectedRef.current) {
      disconnect();
    }
  }, [enabled, localStream, connect, disconnect]);

  return {
    participants,
    isConnected,
    isConnecting,
    connect,
    disconnect
  };
};
