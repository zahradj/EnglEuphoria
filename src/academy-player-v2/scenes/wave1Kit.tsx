// Small helpers shared by the four Wave 1 games (inspect, interview, objection, cipher). Academy only.
import { useEffect } from 'react';
import { sayLine, stopVoice } from '../services/voice';

/** seeded shuffle (both screens of a live class get the same order) */
export function shuffleSeed<T>(a: readonly T[], seed: number): T[] {
  const r = [...a]; let s = (seed || 1) >>> 0;
  for (let i = r.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** say a recorded line whenever `key` changes (silent if there is no clip; the voice stops when the key changes or the scene closes) */
export function useVoiceKey(who: string, text: string | undefined, key: string | number, artBase: string) {
  useEffect(() => {
    if (!text) return;
    void sayLine({ who, text }, artBase);
    return () => stopVoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, artBase]);
}

/** replace {name} / {facts} in a frame */
export const fillFrame = (frame: string, vars: Record<string, string>) => frame.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');

/** "a, b and c" */
export const listJoin = (xs: string[], and = 'and') => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${and} ${xs[xs.length - 1]}`);

/** the first-try star count the other games use */
export const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
