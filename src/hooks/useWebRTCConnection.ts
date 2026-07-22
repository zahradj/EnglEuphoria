import { useState, useEffect, useCallback, useRef } from 'react';
import { realTimeVideoService, VideoParticipant } from '@/services/video/realTimeVideoService';
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

  const connect = useCallback(async () => {
    if (!localStream || !enabled || connectedRef.current || connectingRef.current) {
      return;
    }

    connectingRef.current = true;
    setIsConnecting(true);
    try {
      realTimeVideoService.setRoomConfig(roomId, userId, localStream);
      await realTimeVideoService.joinRoom();
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

    await realTimeVideoService.leaveRoom();
    connectedRef.current = false;
    setIsConnected(false);
    setParticipants([]);
  }, []);

  // Set up participants listener — stable across renders
  useEffect(() => {
    realTimeVideoService.onParticipantsChange((newParticipants) => {
      setParticipants(newParticipants);
    });

    return () => {
      // Clean up on unmount
      if (connectedRef.current) {
        realTimeVideoService.leaveRoom();
        connectedRef.current = false;
      }
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
