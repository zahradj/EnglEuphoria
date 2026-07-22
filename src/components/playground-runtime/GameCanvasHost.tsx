/**
 * GameCanvasHost — owns the Phaser lifecycle ONLY.
 * No game logic, no lesson parsing. Receives an already-compiled lesson.
 */
import { useEffect, useRef } from 'react';
import { bootGame, type BootHandle, type BootHooks } from '@/game-runtime';
import type { CompiledLesson } from '@/game-runtime';

interface Props {
  compiled: CompiledLesson;
  hooks?: BootHooks;
  className?: string;
}

export function GameCanvasHost({ compiled, hooks, className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<BootHandle | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    handleRef.current = bootGame(hostRef.current, compiled, hooks);
    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
    // Re-boot whenever the compiled lesson changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiled]);

  return (
    <div
      ref={hostRef}
      className={className ?? 'w-full h-full min-h-[480px] rounded-2xl overflow-hidden bg-background'}
    />
  );
}
