// Game-feel kit (concept from the Playground player, re-implemented for the Academy): bursts, floating "+10", soft shake.
// All effects are data + CSS classes (shell/tokens.css); Calm mode turns them off at the source.
import { useCallback, useRef, useState } from 'react';

export interface Burst { id: number; x: number; y: number }
export interface Floater { id: number; x: number; y: number; text: string }

export function useFx(calm: boolean) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [shaking, setShaking] = useState(false);
  const n = useRef(0);
  const drop = <T extends { id: number }>(set: React.Dispatch<React.SetStateAction<T[]>>, id: number, ms: number) => setTimeout(() => set((l) => l.filter((x) => x.id !== id)), ms);

  /** sparks at a point (0-100 % of the stage) */
  const burst = useCallback((x: number, y: number) => {
    if (calm) return;
    const id = ++n.current;
    setBursts((l) => [...l, { id, x, y }]);
    drop(setBursts, id, 700);
  }, [calm]);
  /** a floating "+10" */
  const float = useCallback((x: number, y: number, text: string) => {
    const id = ++n.current;
    setFloaters((l) => [...l, { id, x, y, text }]);
    drop(setFloaters, id, calm ? 900 : 1100);
  }, [calm]);
  /** a short, soft screen shake on a miss */
  const shake = useCallback(() => {
    if (calm) return;
    setShaking(true);
    setTimeout(() => setShaking(false), 320);
  }, [calm]);

  return { bursts, floaters, shaking, burst, float, shake };
}
