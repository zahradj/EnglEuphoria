// Helpers used by more than one scene. Anything used by a single scene lives next to it.
import type { CharKey } from '../scenes';
import { VOICE_KEY } from '../scenes';

/** Shorthand: every audio call here takes a story CharKey (pip/marigold),
 *  but the shared voice pipeline is keyed by role/name (Character) — see
 *  scenes.ts's VOICE_KEY for why that mapping is a fixed, tiny table. */
export const voiceOf = (who: CharKey) => VOICE_KEY[who];

/* ---------- Shared chrome (small, local copies — see unit1/SceneRenderer.tsx
   for the originals; kept local here so this module has no dependency on
   the Little Explorers cast beyond the CAST-independent fx/audio/chrome
   helpers imported above). ---------- */

export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/40 bg-white/95 p-5 text-neutral-900 shadow-2xl backdrop-blur-2xl ring-1 ring-white/30 ${className}`}
      style={{ boxShadow: '0 20px 60px -20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.6)' }}
    >
      {children}
    </div>
  );
}

/** A persistent (non-tappable) bouncing arrow + glow marking exactly which
 *  character on screen a sentence/question refers to — for scenes whose
 *  background has more than one character in it and the text alone
 *  ("He is happy," "How do they feel?") doesn't say which one. Visually
 *  the same arrow VocabSpotScene uses for its hotspots, just without the
 *  tap-to-reveal behavior — this one only ever points, it never opens a
 *  flashcard. */
export function CharacterPointer({ left, top, dir = 'down', color }: { left: string; top: string; dir?: 'down' | 'left' | 'right'; color: string }) {
  // GAP and the arrow's own size were tuned small enough that on a real
  // classroom-scaled frame (letterboxed well below full viewport size, see
  // useFrameScale) the arrow read as a barely-visible sliver — reported
  // live as "the arrows look very small." Both bumped ~45%; GAP grows with
  // the arrow so it still sits fully clear of whatever it's pointing at
  // rather than overlapping it.
  const GAP = 90;
  const pos = dir === 'down'
    ? { left, top: `calc(${top} - ${GAP}px)` }
    : dir === 'right'
    ? { left: `calc(${left} - ${GAP}px)`, top }
    : { left: `calc(${left} + ${GAP}px)`, top };
  const angle = dir === 'down' ? 0 : dir === 'right' ? -90 : 90;
  return (
    <>
      {/* A bright spotlight ring sits directly around the character itself
          (at their own left/top, not the arrow's offset position) — the
          arrow says "look here," the ring highlights the character once
          you do. Deliberately white+gold rather than the character's own
          color: a character-colored glow can blend right into a
          same-toned character or background (e.g. Leo's own warm brown-
          gold fur), while white+gold reads against any scene. */}
      <div
        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ left, top, width: 200, height: 200, border: '6px solid white', boxShadow: '0 0 0 4px #FFD34E, 0 0 32px 10px rgba(255,211,78,0.75)', animation: 'lep1-ping 1.7s ease-in-out infinite' }}
      />
      <div className="pointer-events-none absolute z-20" style={{ ...pos, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}>
        <span className="relative block" style={{ animation: 'lep1-hop 0.9s ease-in-out infinite' }}>
          <span className="pointer-events-none absolute bottom-0 left-1/2 h-16 w-16 -translate-x-1/2 translate-y-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${color}88, transparent 65%)`, animation: 'lep1-ping 1.4s ease-out infinite' }} />
          {/* White fill + a thin dark outline (not the character/room's own
              color) so the arrow itself always reads as crisp and bright
              against any background — reported live as looking "black,
              dark" when filled with a darker accent colour like brown or
              teal. The colored glow just below still carries that per-item
              color cue. */}
          <svg width="76" height="110" viewBox="0 0 40 58" className="relative drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">
            <path
              d="M13 3 C13 1.9 13.9 1 15 1 L25 1 C26.1 1 27 1.9 27 3 L27 21 L36 21 C37.9 21 38.8 23.3 37.4 24.6 L21.4 43.6 C20.6 44.5 19.4 44.5 18.6 43.6 L2.6 24.6 C1.2 23.3 2.1 21 4 21 L13 21 Z"
              fill="white"
              stroke="#2A2A2A"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </>
  );
}

/* ---------- Title card ---------- */

/* Calm cream-card look (opt-in per scene via `look: 'card'`). */
export const CARD_STYLE: React.CSSProperties = { background: '#FFF6DF', color: '#2A1459', boxShadow: '0 20px 50px rgba(0,0,0,0.45)' };

export const CARD_FONT = "'Fredoka', 'Grandstander', system-ui, sans-serif";

export function shuffledIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let k = arr.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [arr[k], arr[j]] = [arr[j], arr[k]];
  }
  // A shuffle that happens to land in the original order defeats the
  // point of the exercise -- nudge with one swap so it's never a no-op
  // for anything longer than a single word.
  if (n > 1 && arr.every((v, i) => v === i)) [arr[0], arr[1]] = [arr[1], arr[0]];
  return arr;
}

/* ---------- Wizard / magic styling (phonics segment of Magic Castle) ---------- */

export const MAGIC_PURPLE = '#6D28D9';

export const MAGIC_GOLD = '#F5C542';

export const MAGIC_GRADIENT = 'linear-gradient(90deg, #6D28D9, #A855F7 55%, #F59E0B)';

export const MAGIC_GLOW = '0 0 0 4px rgba(245,197,66,0.55), 0 0 40px rgba(168,85,247,0.75)';

export const MAGIC_STARS = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37 + 7) % 100}%`, top: `${(i * 53 + 11) % 94}%`, size: 2 + (i % 3) * 2,
  dur: 1400 + (i % 5) * 320, delay: (i * 170) % 1700,
}));

/** Night-sky wash + twinkling stars + drifting sparkles over a scene bg. */
export function MagicLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(124,58,237,0.28), rgba(24,8,56,0.78) 78%)' }} />
      {MAGIC_STARS.map((st, i) => (
        <span key={i} className="absolute rounded-full bg-amber-100" style={{ left: st.left, top: st.top, width: st.size, height: st.size, boxShadow: '0 0 8px 2px rgba(255,230,160,0.9)', animation: `lep1-twinkle ${st.dur}ms ease-in-out ${st.delay}ms infinite` }} />
      ))}
      {['8%', '88%', '14%', '80%'].map((left, i) => (
        <span key={`sp-${i}`} className="absolute text-2xl" style={{ left, top: i < 2 ? '18%' : '70%', animation: `lep1-twinkle ${1800 + i * 400}ms ease-in-out ${i * 300}ms infinite` }}>✨</span>
      ))}
    </div>
  );
}
