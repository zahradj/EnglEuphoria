import type { ReactNode } from 'react';
import { FocusLine } from './FocusLine';
import { useCaptionPlacement } from './captionPlacement';

/**
 * A character's line as a clean "dialogue plate" docked at the bottom of the
 * scene — the pattern story games and visual novels use — instead of a cloud
 * bubble floating over the artwork:
 *   • a frosted dark plate (readable on any background, never covers the character)
 *   • the speaker's name on a coloured tab (who is talking, at a glance)
 *   • the line in big type, plus one big speaker button on the right
 *     (equalizer bars move while the voice is playing; a ring pulses when it is
 *     the student's turn to tap)
 *   • tapping anywhere on the plate replays the line
 *
 * No character emoji (project rule) and no browser voice: the caller plays the
 * recorded clip. Sizes use --svh (the classroom's design canvas) so it looks the
 * same on every screen.
 */
/** Big, friendly type for short lines; longer lines step down so they wrap to fewer, wider lines. */
export function plateFontSize(line: string): string {
  const words = line.trim().split(/\s+/).length;
  return words <= 4 ? 'calc(5*var(--svh,1vh))' : words <= 9 ? 'calc(4.2*var(--svh,1vh))' : 'calc(3.5*var(--svh,1vh))';
}

/**
 * The plate's look follows the lesson's setting:
 *  • 'paper' (default) — a warm picture-book caption card; fits every storybook scene.
 *  • 'chalk' — a chalkboard in a wooden frame, for scenes set in the classroom.
 */
export type PlateLook = 'paper' | 'chalk';

export interface Look {
  plate: React.CSSProperties;
  text: React.CSSProperties;
  tab: React.CSSProperties;
  speakerBg: string;
  speakerFg: string;
}

export const lookFor = (look: PlateLook, color: string): Look =>
  look === 'chalk'
    ? {
        plate: { background: 'radial-gradient(120% 140% at 30% 20%, #3C7048, #2A5535)', border: 'calc(1.4*var(--svh,1vh)) solid #B07A3E', boxShadow: '0 12px 24px rgba(0,0,0,.4), inset 0 0 34px rgba(0,0,0,.38)' },
        text: { color: '#F8F6EA', textShadow: '0 1px 0 rgba(255,255,255,.18)' },
        tab: { background: '#FFE08A', color: '#5A3A12', border: '2px solid #fff6d6' },
        speakerBg: '#FFE08A',
        speakerFg: '#5A3A12',
      }
    : {
        plate: { background: 'linear-gradient(180deg,#FFFBEF,#FBEBCB)', border: '3px solid #E3A857', boxShadow: '0 10px 26px rgba(120,70,20,.35), inset 0 0 0 5px rgba(255,255,255,.55)' },
        text: { color: '#5A3417' },
        tab: { background: color, color: '#fff', border: '2px solid #fff' },
        speakerBg: color,
        speakerFg: '#fff',
      };

export function DialoguePlate({
  name,
  color,
  children,
  onTap,
  speaking = false,
  nudge = false,
  action,
  ariaLabel,
  bottom = 'calc(2*var(--svh,1vh))',
  fontSize = 'calc(4.2*var(--svh,1vh))',
  look = 'paper',
  focusLine,
  img,
  pin,
}: {
  /** Speaker's name for the tab. */
  name: string;
  /** Speaker's colour (name tab, speaker button). */
  color: string;
  /** The line itself. */
  children?: ReactNode;
  /** Replays the line (and, for callers that want it, completes the scene). */
  onTap: () => void;
  /** The recorded voice is playing right now. */
  speaking?: boolean;
  /** Pulse the speaker button — "your turn, tap me". */
  nudge?: boolean;
  /** Optional extra control on the right (e.g. a "Next" button once the scene is done). */
  action?: ReactNode;
  ariaLabel?: string;
  /** CSS `bottom` offset, for scenes that keep another bar along the bottom edge. */
  bottom?: string;
  fontSize?: string;
  look?: PlateLook;
  /** The picture the plate sits on. When given, the plate goes to the top or the bottom — whichever hides less of the picture
   *  (owner rule: never hide anything important; see captionPlacement.ts). Omit to keep the plate at the bottom. */
  img?: string;
  /** Force 'top' or 'bottom' (a pinned exception). */
  pin?: 'top' | 'bottom';
  /** Highlight the vocabulary in the line once the voice has finished (replaces `children`). */
  focusLine?: { text: string; focus?: string[]; reveal: boolean; before?: ReactNode; after?: ReactNode };
}) {
  const L = lookFor(look, color);
  // A wide plate only goes top or bottom; below the lives/hearts bar when it is at the top.
  const placed = useCaptionPlacement(img, pin, ['left', 'right']);
  const atTop = !!img && placed.pos === 'top';
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-20 flex justify-center px-[calc(2.5*var(--svh,1vh))]"
      style={{ ...(atTop ? { top: 'calc(14*var(--svh,1vh))' } : { bottom }), opacity: img && !placed.ready ? 0 : 1, transition: 'opacity .2s ease' }}
      data-plate-pos={atTop ? 'top' : 'bottom'}
    >
      <style>{`
        @keyframes dp-rise { from { opacity: 0; transform: translateY(14px) scale(.98) } to { opacity: 1; transform: none } }
        @keyframes dp-bar { 0%,100% { transform: scaleY(.35) } 50% { transform: scaleY(1) } }
        @keyframes dp-ring { 0% { box-shadow: 0 0 0 0 var(--dp-c) } 100% { box-shadow: 0 0 0 14px transparent } }
        @media (prefers-reduced-motion: reduce) { .dp-anim { animation: none !important } }
      `}</style>
      <div
        className="dp-anim pointer-events-auto relative flex w-full max-w-[min(100%,64rem)] flex-col items-stretch sm:flex-row"
        style={{ animation: 'dp-rise .45s cubic-bezier(.2,.8,.2,1)', ['--dp-c' as string]: `${color}88` }}
      >
        {/* Name tab, sitting on the plate's top-left edge */}
        <span
          className="absolute left-[calc(2.6*var(--svh,1vh))] top-0 z-10 -translate-y-1/2 rounded-full px-[calc(2*var(--svh,1vh))] py-[calc(.5*var(--svh,1vh))] font-black uppercase tracking-[0.14em] shadow-lg"
          style={{ fontSize: 'calc(1.9*var(--svh,1vh))', ...L.tab }}
        >
          {name}
        </span>

        <button
          type="button"
          onClick={onTap}
          aria-label={ariaLabel ?? `Hear ${name} again`}
          className="flex min-w-0 flex-1 items-center gap-[calc(2*var(--svh,1vh))] rounded-[calc(2.6*var(--svh,1vh))] border border-white/20 px-[calc(3*var(--svh,1vh))] pb-[calc(2.6*var(--svh,1vh))] pt-[calc(3.6*var(--svh,1vh))] text-left transition active:scale-[0.99]"
          style={L.plate}
        >
          <span className="min-w-0 flex-1 font-extrabold leading-snug" style={{ fontSize, textWrap: 'balance' as never, ...L.text }}>
            {focusLine ? <FocusLine {...focusLine} look={look} color={color} /> : children}
          </span>

          {/* Speaker: equalizer bars while the voice plays, a calm icon otherwise */}
          <span
            aria-hidden
            className="dp-anim relative grid shrink-0 place-items-center rounded-full"
            style={{
              background: L.speakerBg,
              width: 'calc(8.4*var(--svh,1vh))',
              height: 'calc(8.4*var(--svh,1vh))',
              animation: nudge && !speaking ? 'dp-ring 1.4s ease-out infinite' : undefined,
              color: L.speakerFg,
            }}
          >
            {speaking ? (
              <span className="flex h-[45%] items-center gap-[7%]">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="dp-anim block w-[calc(.9*var(--svh,1vh))] origin-center rounded-full"
                    style={{ height: '100%', background: L.speakerFg, animation: `dp-bar .8s ease-in-out ${i * 0.13}s infinite` }}
                  />
                ))}
              </span>
            ) : (
              <svg viewBox="0 0 24 24" width="52%" height="52%" fill="currentColor">
                <path d="M3 10v4a1 1 0 0 0 1 1h3l4.3 3.4A1 1 0 0 0 13 17.6V6.4a1 1 0 0 0-1.7-.8L7 9H4a1 1 0 0 0-1 1Zm13.5 2a4.5 4.5 0 0 0-2-3.7v7.4a4.5 4.5 0 0 0 2-3.7Zm-2-8.2v2.1a7 7 0 0 1 0 12.2v2.1a9 9 0 0 0 0-16.4Z" />
              </svg>
            )}
          </span>
        </button>

        {action && <div className="mt-[calc(1.5*var(--svh,1vh))] flex shrink-0 items-center justify-end sm:ml-[calc(1.5*var(--svh,1vh))] sm:mt-0">{action}</div>}
      </div>
    </div>
  );
}
