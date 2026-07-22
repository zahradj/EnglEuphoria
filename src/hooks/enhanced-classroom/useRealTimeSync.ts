import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { logRealtime } from '@/lib/connectionDebugLog';

interface SyncState {
  whiteboardData: any;
  chatMessages: any[];
  activeTab: string;
  participants: any[];
  currentSlide: number;
}

interface UseRealTimeSyncProps {
  roomId: string;
  userId: string;
  userRole: 'teacher' | 'student';
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export function useRealTimeSync({ roomId, userId, userRole }: UseRealTimeSyncProps) {
  const [syncState, setSyncState] = useState<SyncState>({
    whiteboardData: null,
    chatMessages: [],
    activeTab: 'whiteboard',
    participants: [],
    currentSlide: 0,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');

  const channelRef = useRef<any>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const hasAnnouncedConnectedRef = useRef(false);
  const connectInFlightRef = useRef(false);
  const { toast } = useToast();

  const teardownChannel = useCallback(() => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (e) {
        console.warn('🔄 Error removing channel:', e);
      }
      channelRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback((reason: string) => {
    if (!isMountedRef.current) return;
    if (reconnectTimerRef.current) return; // already scheduled

    reconnectAttemptsRef.current += 1;
    if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
      console.error('🔄 Max reconnect attempts reached. Giving up.');
      logRealtime('error', 'Max reconnect attempts reached — giving up', { reason });
      setConnectionStatus('disconnected');
      toast({
        title: 'Connection lost',
        description: 'Could not restore the live classroom connection. Please refresh.',
        variant: 'destructive',
      });
      return;
    }

    const delay = Math.min(
      RECONNECT_DELAY_MS * reconnectAttemptsRef.current,
      15000,
    );
    console.warn(`🔄 Scheduling reconnect (attempt ${reconnectAttemptsRef.current}) in ${delay}ms — reason: ${reason}`);
    logRealtime('warn', `Scheduling reconnect in ${delay}ms`, { reason, attempt: reconnectAttemptsRef.current });
    setConnectionStatus('reconnecting');

    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      void connectToSync();
    }, delay);
  }, [toast]);

  const connectToSync = useCallback(async () => {
    if (!isMountedRef.current) return;
    if (connectInFlightRef.current) {
      return;
    }
    connectInFlightRef.current = true;

    try {
      // Always teardown any stale channel before opening a new one
      teardownChannel();

      // Small delay to ensure the previous WebSocket fully closes
      await new Promise((resolve) => setTimeout(resolve, 150));

      const channelName = `classroom_sync_${roomId}_${userId}`;
      logRealtime('info', 'Opening sync channel', { channel: channelName, userRole });
      setConnectionStatus(reconnectAttemptsRef.current === 0 ? 'connecting' : 'reconnecting');

      const channel = supabase
        .channel(channelName, {
          config: { presence: { key: userId } },
        })
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const participants = Object.entries(state).map(([key, data]: [string, any]) => ({
            id: key,
            ...data[0],
          }));
          setSyncState((prev) => ({ ...prev, participants }));
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        })
        .on('broadcast', { event: 'whiteboard_update' }, ({ payload }) => {
          if (payload.userId !== userId) {
            setSyncState((prev) => ({ ...prev, whiteboardData: payload.data }));
          }
        })
        .on('broadcast', { event: 'tab_change' }, ({ payload }) => {
          if (payload.userId !== userId) {
            setSyncState((prev) => ({ ...prev, activeTab: payload.tabId }));
          }
        })
        .on('broadcast', { event: 'slide_change' }, ({ payload }) => {
          if (payload.userId !== userId) {
            setSyncState((prev) => ({ ...prev, currentSlide: payload.slideNumber }));
          }
        });

      channel.subscribe(async (status, err) => {
        if (err) {
          console.error('❌ Supabase Realtime Error:', err);
          logRealtime('error', `Realtime error: ${err.message}`, {
            status,
            stack: err.stack,
            channel: `classroom_sync_${roomId}_${userId}`,
          });
        } else {
          logRealtime(
            status === 'SUBSCRIBED' ? 'info' : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' ? 'error' : 'warn',
            `Sync channel status: ${status}`,
            { channel: `classroom_sync_${roomId}_${userId}` },
          );
        }

        if (!isMountedRef.current) return;

        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            userRole,
            joinedAt: new Date().toISOString(),
          });

          reconnectAttemptsRef.current = 0;
          setIsConnected(true);
          setConnectionStatus('connected');

          if (!hasAnnouncedConnectedRef.current) {
            hasAnnouncedConnectedRef.current = true;
            toast({ title: 'Connected', description: 'Live classroom sync is active' });
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
          setIsConnected(false);
          if (connectionStatus !== 'reconnecting') setConnectionStatus('disconnected');
          scheduleReconnect(status);
        }
      });

      channelRef.current = channel;
    } catch (error) {
      console.error('🔄 Sync connection failed:', error);
      setIsConnected(false);
      scheduleReconnect('exception');
    } finally {
      connectInFlightRef.current = false;
    }
  }, [roomId, userId, userRole, toast, scheduleReconnect, teardownChannel, connectionStatus]);

  const broadcastStateChange = useCallback((event: string, payload: any) => {
    if (!channelRef.current || !isConnected) {
      console.warn('🔄 Cannot broadcast — not connected');
      return;
    }
    channelRef.current.send({
      type: 'broadcast',
      event,
      payload: { ...payload, userId },
    });
  }, [isConnected, userId]);

  const syncWhiteboard = useCallback((whiteboardData: any) => {
    setSyncState((prev) => ({ ...prev, whiteboardData }));
    broadcastStateChange('whiteboard_update', { data: whiteboardData });
  }, [broadcastStateChange]);

  const syncActiveTab = useCallback((tabId: string) => {
    if (userRole !== 'teacher') return;
    setSyncState((prev) => ({ ...prev, activeTab: tabId }));
    broadcastStateChange('tab_change', { tabId });
  }, [userRole, broadcastStateChange]);

  const syncSlideChange = useCallback((slideNumber: number) => {
    if (userRole !== 'teacher') return;
    setSyncState((prev) => ({ ...prev, currentSlide: slideNumber }));
    broadcastStateChange('slide_change', { slideNumber });
  }, [userRole, broadcastStateChange]);

  const addChatMessage = useCallback((message: any) => {
    setSyncState((prev) => ({ ...prev, chatMessages: [...prev.chatMessages, message] }));
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    teardownChannel();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, [teardownChannel]);

  // Re-subscribe when offline → online (network flap)
  useEffect(() => {
    const handleOnline = () => {
      reconnectAttemptsRef.current = 0;
      void connectToSync();
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [connectToSync]);

  // Auto-connect once on mount
  useEffect(() => {
    isMountedRef.current = true;
    const t = setTimeout(() => { void connectToSync(); }, 300);
    return () => {
      isMountedRef.current = false;
      clearTimeout(t);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      teardownChannel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    syncState,
    isConnected,
    connectionStatus,
    connectToSync,
    disconnect,
    syncWhiteboard,
    syncActiveTab,
    syncSlideChange,
    addChatMessage,
  };
}
