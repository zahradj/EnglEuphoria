import React, { useRef } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useCoPlaySync } from '@/hooks/useCoPlaySync';
import { SharedCursors } from './SharedCursors';
import { CoPlayMemoryMatch, type MemoryPair } from './CoPlayMemoryMatch';

export type CoPlayGame = 'memory_match';

interface NativeCoPlayArenaProps {
  classroomId: string;
  userId: string;
  userName?: string;
  role: 'teacher' | 'student';
  game?: CoPlayGame;
  pairs?: MemoryPair[];
  /** Hub primary color (hex or hsl). */
  accent?: string;
}

/**
 * Native, third-party-free Co-Play multiplayer surface.
 * Hosts an interactive mini-game and a shared-cursor overlay,
 * synchronized over a single Supabase Realtime channel.
 */
export const NativeCoPlayArena: React.FC<NativeCoPlayArenaProps> = ({
  classroomId,
  userId,
  userName,
  role,
  game = 'memory_match',
  pairs = [],
  accent = 'hsl(243 75% 59%)',
}) => {
  const arenaRef = useRef<HTMLDivElement>(null);
  const sync = useCoPlaySync({ classroomId, userId, userName, role });

  return (
    <div
      ref={arenaRef}
      className="relative w-full h-full bg-gradient-to-br from-muted/30 to-background rounded-xl overflow-hidden border border-border"
    >
      <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
            sync.isConnected
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {sync.isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {sync.isConnected ? 'Live' : 'Connecting…'}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
          {sync.peers.length + 1} in room
        </span>
      </div>

      <div className="relative w-full h-full">
        {game === 'memory_match' && (
          <CoPlayMemoryMatch pairs={pairs} sync={sync} role={role} accent={accent} />
        )}
      </div>

      <SharedCursors containerRef={arenaRef} sync={sync} />
    </div>
  );
};

export default NativeCoPlayArena;
