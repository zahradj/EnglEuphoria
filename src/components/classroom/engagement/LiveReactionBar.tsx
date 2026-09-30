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
  /** Which emoji buttons this side's dock shows. Defaults to the full set. */
  reactions?: readonly string[];
  /** 'bottom' (default): horizontal dock, fixed to the page's bottom-centre.
   *  'side': vertical dock fixed to the right edge — keeps the bottom of
   *  the stage (scene progress dots, nav) clear. 'inline': not
   *  page-fixed at all — a plain horizontal row sized to its parent, for
   *  embedding directly inside a layout (e.g. the scene lesson's own nav
   *  row) instead of floating over it. */
  placement?: 'bottom' | 'side' | 'inline';
  /** Called for each reaction received from the other side. */
  onReceive?: (emoji: string) => void;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

const REACTIONS = ['👍', '❤️', '🎉', '🤔', '❓', '👏'] as const;
/** Simplified dock — just a thumbs up/down. */
export const THUMBS_REACTIONS = ['👍', '👎'] as const;
/** The student's dock: quick, wordless signals a child can send mid-lesson. */
export const STUDENT_REACTIONS = ['👍', '❤️', '🤔', '❓', '🔇', '👎'] as const;
/** Tooltip / screen-reader meaning of each reaction. */
export const REACTION_LABELS: Record<string, string> = {
  '👍': 'Thumbs up',
  '👎': 'Thumbs down',
  '❤️': 'I love it',
  '🤔': "I'm thinking",
  '❓': 'I have a question',
  '🔇': "I can't hear you",
  '🎉': 'Hooray',
  '👏': 'Well done',
};

/**
 * Floating reaction dock. Broadcasts via Supabase Realtime (no DB writes) so
 * latency stays low. Renders animated emoji over the slide on both sides.
 */
export const LiveReactionBar: React.FC<LiveReactionBarProps> = ({
  roomId,
  userId,
  hubType = 'academy',
  canSend = true,
  reactions = REACTIONS,
  placement = 'bottom',
  onReceive,
}) => {
  const isSide = placement === 'side';
  const isInline = placement === 'inline';
  // Latest callback without re-subscribing the channel on every render.
  const onReceiveRef = useRef(onReceive);
  onReceiveRef.current = onReceive;
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
      if (typeof emoji === 'string') {
        pushFloating(emoji);
        onReceiveRef.current?.(emoji);
      }
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
      <div className={`pointer-events-none fixed w-32 h-64 z-30 overflow-visible ${isSide ? 'right-20 top-[18%]' : 'bottom-24 right-6'}`}>
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

      {/* Reaction dock — 'inline' sits in normal document flow (no `fixed`,
          no page-level positioning) so it can be embedded directly inside
          a layout, e.g. the scene lesson's own nav row, instead of
          floating over the stage. */}
      {canSend && (
        <motion.div
          initial={{ opacity: 0, ...(isSide ? { x: 20 } : { y: 20 }) }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          className={`flex items-center gap-1 backdrop-blur-xl bg-white/80 border border-white/60 ${theme.radiusClass} ${
            isInline
              ? 'px-2 py-1.5'
              : isSide
              ? 'fixed z-40 right-3 top-1/2 -translate-y-1/2 flex-col px-1.5 py-2'
              : 'fixed z-40 bottom-6 left-1/2 -translate-x-1/2 px-2 py-1.5'
          }`}
          style={theme.glowShadow}
        >
          {reactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => send(emoji)}
              className={`rounded-full flex items-center justify-center hover:bg-white hover:scale-125 active:scale-95 transition-transform ${isSide ? 'w-11 h-11 text-2xl' : 'w-9 h-9 text-xl'}`}
              title={REACTION_LABELS[emoji] ?? emoji}
              aria-label={REACTION_LABELS[emoji] ?? `Send ${emoji} reaction`}
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
