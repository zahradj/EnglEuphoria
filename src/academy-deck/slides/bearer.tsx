// A cast character holding the flag of a country: the painted character picture (cast/<who>/neutral-open.webp) breathes and sways,
// the pole sways from the hand, and the flag ripples like cloth (SVG). Calm, silent, no zoom or pan of a still; Calm mode freezes it.
import { useState } from 'react';
import { useDeck } from '../ctx';
import type { CastName } from '../types';
import { WavingFlag } from './anim';

const SKIN: Record<CastName, string> = { Vee: '#cc9270', Ava: '#d38857', Theo: '#a6572e', Mia: '#a5785c' };

export function Bearer({ code, who, label, size = 'md' }: { code: string; who: CastName; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const { artBase } = useDeck();
  const [broken, setBroken] = useState(false);
  return (
    <div className={`ad-bearer ad-bearer-${size}`} role="img" aria-label={label} style={{ ['--skin' as string]: SKIN[who] }}>
      <span className="ad-bearer-shadow" aria-hidden="true" />
      {artBase && !broken && <img className="ad-bearer-char" src={`${artBase}/cast/${who.toLowerCase()}/neutral-open.webp`} alt="" draggable={false} onError={() => setBroken(true)} />}
      <span className="ad-bearer-pole" aria-hidden="true">
        <i className="ad-pole-stick" />
        <span className="ad-pole-flag"><WavingFlag code={code} label={`Flag of ${code}`} /></span>
        <svg className="ad-pole-hand" viewBox="0 0 40 52" aria-hidden="true">
          <path d="M6 14 Q8 4 20 4 Q34 4 34 16 L34 38 Q34 48 20 48 Q8 48 6 38Z" fill="var(--skin)" stroke="rgba(60,20,10,0.55)" strokeWidth="2" />
          <path d="M9 18h22M9 26h22M9 34h22" stroke="rgba(60,20,10,0.35)" strokeWidth="2" strokeLinecap="round" />
          <path d="M31 12 Q40 16 36 30" fill="none" stroke="rgba(60,20,10,0.45)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}
