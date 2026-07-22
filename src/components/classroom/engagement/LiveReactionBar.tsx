import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useHubClassroomTheme, type HubType } from '@/components/classroom/shared/useHubClassroomTheme';

interface LiveReactionBarProps {
  roomId: string;
  userId: string;
  hubType?: HubType;
  /** When true the user can send reactions (typically the student). Teachers see, but can also send a 👏. */
  canSend?: boolean;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

const REACTIONS = ['👍', '❤️', '🎉', '🤔', '❓', '👏'] as const;

/**
 * Floating reaction dock. Broadcasts via Supabase Realtime (no DB writes) so
 * latency stays low. Renders animated emoji over the slide on both sides.
 */
export const LiveReactionBar: React.FC<LiveReactionBarProps> = ({
  roomId,
  userId,
  hubType = 'academy',
  canSend = true,
}) => {
  const theme = useHubClassroomTheme(hubType);
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const pushFloating = useCallback((emoji: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const x = 20 + Math.random() * 60; // % from left within the dock area
    setFloating((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setFloating((prev) => prev.filter((r) => r.id !== id));
    }, 1800);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    const ch = supabase.channel(`classroom:${roomId}:reactions`, {
      config: { broadcast: { self: false } },
    });
    ch.on('broadcast', { event: 'reaction' }, (payload: any) => {
      const emoji = payload?.payload?.emoji;
      if (typeof emoji === 'string') pushFloating(emoji);
    }).subscribe();
    channelRef.current = ch;
    return () => {
      try {
        supabase.removeChannel(ch);
      } catch {}
      channelRef.current = null;
    };
  }, [roomId, pushFloating]);

  const send = useCallback(
    (emoji: string) => {
      if (!canSend || !channelRef.current) return;
      pushFloating(emoji); // optimistic local
      channelRef.current.send({
        type: 'broadcast',
        event: 'reaction',
        payload: { emoji, from: userId, ts: Date.now() },
      });
    },
    [canSend, pushFloating, userId],
  );

  return (
    <>
      {/* Floating layer (does not catch pointer events) */}
      <div className="pointer-events-none fixed bottom-24 right-6 w-32 h-64 z-30 overflow-visible">
        <AnimatePresence>
          {floating.map((r) => (
            <motion.div
              key={r.id}
              initial={{ y: 0, opacity: 0, scale: 0.6 }}
              animate={{ y: -180, opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              style={{ left: `${r.x}%` }}
              className="absolute bottom-0 text-3xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]"
            >
              {r.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction dock */}
      {canSend && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-2 py-1.5 backdrop-blur-xl bg-white/70 border border-white/60 ${theme.radiusClass}`}
          style={theme.glowShadow}
        >
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => send(emoji)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-xl hover:bg-white hover:scale-125 transition-transform"
              aria-label={`Send ${emoji} reaction`}
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}
    </>
  );
};

export default LiveReactionBar;
