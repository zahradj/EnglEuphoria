import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Lean realtime sync hook for the Native Co-Play Arena.
 *
 * Subscribes to a Supabase Realtime channel keyed by classroom id and exposes
 * a typed broadcast/on API plus presence — enough to power the multiplayer
 * mini-games and shared cursors without any third-party WebRTC.
 */

export type CoPlayEvent =
  | 'cursor_move'
  | 'card_dragged'
  | 'card_dropped'
  | 'card_flipped'
  | 'game_state_update'
  | 'game_reset'
  | 'reaction';

export interface CoPlayPayload<T = any> {
  senderId: string;
  senderName?: string;
  senderRole: 'teacher' | 'student';
  data: T;
  ts: number;
}

export type CoPlayHandler<T = any> = (payload: CoPlayPayload<T>) => void;

interface UseCoPlaySyncOptions {
  classroomId: string | null | undefined;
  userId: string;
  userName?: string;
  role: 'teacher' | 'student';
}

interface UseCoPlaySyncReturn {
  isConnected: boolean;
  peers: Array<{ userId: string; userName?: string; role: 'teacher' | 'student' }>;
  broadcast: <T>(event: CoPlayEvent, data: T) => void;
  on: <T>(event: CoPlayEvent, handler: CoPlayHandler<T>) => () => void;
}

const ALL_EVENTS: CoPlayEvent[] = [
  'cursor_move',
  'card_dragged',
  'card_dropped',
  'card_flipped',
  'game_state_update',
  'game_reset',
  'reaction',
];

export function useCoPlaySync({
  classroomId,
  userId,
  userName,
  role,
}: UseCoPlaySyncOptions): UseCoPlaySyncReturn {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlersRef = useRef<Map<CoPlayEvent, Set<CoPlayHandler>>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [peers, setPeers] = useState<UseCoPlaySyncReturn['peers']>([]);

  const broadcast = useCallback<UseCoPlaySyncReturn['broadcast']>(
    (event, data) => {
      const ch = channelRef.current;
      if (!ch) return;
      const payload: CoPlayPayload = {
        senderId: userId,
        senderName: userName,
        senderRole: role,
        data,
        ts: Date.now(),
      };
      ch.send({ type: 'broadcast', event, payload });
    },
    [userId, userName, role],
  );

  const on = useCallback<UseCoPlaySyncReturn['on']>((event, handler) => {
    const map = handlersRef.current;
    if (!map.has(event)) map.set(event, new Set());
    map.get(event)!.add(handler as CoPlayHandler);
    return () => {
      map.get(event)?.delete(handler as CoPlayHandler);
    };
  }, []);

  useEffect(() => {
    if (!classroomId) return;

    const channel = supabase.channel(`co-play:${classroomId}`, {
      config: {
        broadcast: { self: false, ack: false },
        presence: { key: userId },
      },
    });

    for (const ev of ALL_EVENTS) {
      channel.on('broadcast', { event: ev }, ({ payload }) => {
        if (!payload || payload.senderId === userId) return;
        handlersRef.current.get(ev)?.forEach((h) => {
          try {
            h(payload as CoPlayPayload);
          } catch (err) {
            console.error('[useCoPlaySync] handler error', ev, err);
          }
        });
      });
    }

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as Record<
        string,
        Array<{ userId: string; userName?: string; role: 'teacher' | 'student' }>
      >;
      const list: UseCoPlaySyncReturn['peers'] = [];
      for (const key of Object.keys(state)) {
        const meta = state[key]?.[0];
        if (!meta || meta.userId === userId) continue;
        list.push(meta);
      }
      setPeers(list);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        await channel.track({ userId, userName, role });
      } else if (
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT' ||
        status === 'CLOSED'
      ) {
        setIsConnected(false);
      }
    });

    channelRef.current = channel;
    return () => {
      setIsConnected(false);
      try {
        channel.untrack();
      } catch {
        /* noop */
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [classroomId, userId, userName, role]);

  return { isConnected, peers, broadcast, on };
}
