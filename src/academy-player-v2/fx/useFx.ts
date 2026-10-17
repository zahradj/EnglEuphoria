// Game-feel kit (concept from the Playground player, re-implemented for the Academy): bursts, floating "+10", soft shake, confetti.
// All effects are data + CSS classes (shell/tokens.css, shell/games.css). Calm mode (and the OS "reduce motion" setting) turns shake, bursts,
// confetti and loops off AT THE SOURCE; the floating text stays (it only fades, see CSS) so feedback is still visible.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FxTone, SceneFx } from '../types';

export interface Burst { id: number; x: number; y: number; tone: FxTone }
export interface Floater { id: number; x: number; y: number; text: string; tone: FxTone }
export interface Confetti { id: number }
export type Shake = false | 'soft' | 'hard';

/** true when the OS asks for reduced motion (safe in jsdom and SSR) */
export function prefersReducedMotion(): boolean {
  try { return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}

/** where an element's centre is, as % of the player root (so effects line up with the piece that was tapped) */
export function centreOf(el: Element | null | undefined): { x: number; y: number } {
  if (!el) return { x: 50, y: 50 };
  const root = el.closest('.av-root');
  if (!root) return { x: 50, y: 50 };
  const r = root.getBoundingClientRect(); const b = el.getBoundingClientRect();
  if (!r.width || !r.height) return { x: 50, y: 50 };
  return { x: ((b.left + b.width / 2 - r.left) / r.width) * 100, y: ((b.top + b.height / 2 - r.top) / r.height) * 100 };
}

/** a scene with no player around it (tests, previews) gets this: it does nothing, nothing throws */
export const NOOP_FX: SceneFx = {
  calm: true, burst: () => undefined, float: () => undefined, shake: () => undefined, confetti: () => undefined, at: centreOf,
  burstAt: () => undefined, floatAt: () => undefined,
};

export function useFx(calmPref: boolean) {
  const calm = calmPref || prefersReducedMotion();
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [confettis, setConfettis] = useState<Confetti[]>([]);
  const [shaking, setShaking] = useState<Shake>(false);
  const n = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((x) => window.clearTimeout(x)); }, []);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const drop = <T extends { id: number }>(set: React.Dispatch<React.SetStateAction<T[]>>, id: number, ms: number) => later(() => set((l) => l.filter((x) => x.id !== id)), ms);

  /** sparks at a point (0-100 % of the stage) */
  const burst = useCallback((x: number, y: number, tone: FxTone = 'gold') => {
    if (calm) return;
    const id = ++n.current;
    setBursts((l) => [...l.slice(-5), { id, x, y, tone }]);
    drop(setBursts, id, 900);
  }, [calm]);
  /** a floating "+10" (in calm mode it only fades in place) */
  const float = useCallback((x: number, y: number, text: string, tone: FxTone = 'gold') => {
    const id = ++n.current;
    setFloaters((l) => [...l.slice(-5), { id, x, y, text, tone }]);
    drop(setFloaters, id, calm ? 1100 : 1250);
  }, [calm]);
  /** a short, soft screen shake (stage only, decays; never on the picture) */
  const shake = useCallback((strength: 'soft' | 'hard' = 'soft') => {
    if (calm) return;
    setShaking(strength);
    later(() => setShaking(false), strength === 'hard' ? 480 : 340);
  }, [calm]);
  /** confetti rain for a win */
  const confetti = useCallback(() => {
    if (calm) return;
    const id = ++n.current;
    setConfettis((l) => [...l.slice(-1), { id }]);
    drop(setConfettis, id, 2600);
  }, [calm]);

  const api = useMemo<SceneFx>(() => ({
    calm, burst, float, shake, confetti, at: centreOf,
    burstAt: (el, tone) => { const p = centreOf(el); burst(p.x, p.y, tone); },
    floatAt: (el, text, tone) => { const p = centreOf(el); float(p.x, p.y - 4, text, tone); },
  }), [calm, burst, float, shake, confetti]);

  return { bursts, floaters, confettis, shaking, calm, burst, float, shake, confetti, api };
}
