import type { CSSProperties, ReactNode } from 'react';
import { lookFor } from './DialoguePlate';
import type { CaptionPos } from './captionPlacement';

/**
 * The story caption: the same framed paper plate as the character-introduction
 * pages (DialoguePlate), but placed on the side of the picture that has calm
 * space — top, bottom, left or right (see captionPlacement.ts). It sits INSIDE
 * the picture's own box so it is always on screen, and tapping it replays the
 * line without turning the page.
 */
/* Sizes follow the PICTURE's width (the art box is an inline-size container), so the plate
   looks right on a laptop, the classroom canvas and a phone alike. */
const EDGE = 'clamp(8px,1.3cqw,24px)';

const POSITION: Record<CaptionPos, CSSProperties> = {
  bottom: { left: EDGE, right: EDGE, bottom: EDGE, alignItems: 'flex-end' },
  top: { left: EDGE, right: 'clamp(44px,5.3cqw,80px)', top: 'clamp(34px,3.4cqw,60px)' },
  left: { left: EDGE, top: '50%', transform: 'translateY(-50%)', width: '38%' },
  right: { right: EDGE, top: '50%', transform: 'translateY(-50%)', width: '38%' },
};

export function StoryPlate({
  pos,
  name,
  color,
  text,
  speaking = false,
  onReplay,
  bottomOffset,
  children,
}: {
  pos: CaptionPos;
  /** Speaker's name for the tab (omit for narration). */
  name?: string;
  color: string;
  text: string;
  speaking?: boolean;
  onReplay: () => void;
  /** Lift a bottom plate above a control that owns the bottom edge (e.g. a CTA button). */
  bottomOffset?: string;
  /** Extra content after the line (e.g. a "next" hint). */
  children?: ReactNode;
}) {
  const L = lookFor('paper', color);
  const side = pos === 'left' || pos === 'right';
  const words = text.trim().split(/\s+/).length;
  const fontSize = side
    ? words <= 8 ? 'clamp(14px,2cqw,34px)' : 'clamp(13px,1.65cqw,28px)'
    : words <= 9 ? 'clamp(15px,2.35cqw,40px)' : 'clamp(13px,1.95cqw,34px)';
  return (
    <div
      data-caption-pos={pos}
      className="pointer-events-none absolute z-20 flex"
      style={{ ...POSITION[pos], ...(pos === 'bottom' && bottomOffset ? { bottom: bottomOffset } : {}), justifyContent: 'center' }}
    >
      <button
        type="button"
        aria-label={`Hear ${name ?? 'the story'} again`}
        onClick={(e) => { e.stopPropagation(); onReplay(); }}
        className="pointer-events-auto relative flex min-w-0 items-center rounded-[clamp(10px,1.4cqw,26px)] text-left active:scale-[.99]"
        style={{ ...L.plate, gap: 'clamp(6px,1cqw,20px)', paddingLeft: 'clamp(10px,1.5cqw,28px)', paddingRight: 'clamp(10px,1.5cqw,28px)', paddingBottom: 'clamp(8px,1.2cqw,22px)', paddingTop: name ? 'clamp(18px,1.9cqw,34px)' : 'clamp(8px,1.2cqw,22px)', maxWidth: '100%', width: side ? '100%' : undefined }}
      >
        {name && (
          <span
            className="absolute left-[clamp(8px,1.4cqw,26px)] top-0 -translate-y-1/2 rounded-full px-[clamp(8px,1.1cqw,20px)] py-[clamp(1px,.25cqw,5px)] font-black uppercase tracking-[0.14em] shadow-md"
            style={{ fontSize: 'clamp(10px,1.1cqw,18px)', ...L.tab }}
          >
            {name}
          </span>
        )}
        <span className="min-w-0 flex-1 font-extrabold leading-snug" style={{ fontSize, textWrap: 'balance' as never, ...L.text }}>{text}</span>
        <span
          aria-hidden
          className="grid shrink-0 place-items-center rounded-full"
          style={{ background: L.speakerBg, color: L.speakerFg, width: 'clamp(28px,3.7cqw,64px)', height: 'clamp(28px,3.7cqw,64px)', opacity: speaking ? 1 : 0.92 }}
        >
          <svg viewBox="0 0 24 24" width="52%" height="52%" fill="currentColor">
            <path d="M3 10v4a1 1 0 0 0 1 1h3l4.3 3.4A1 1 0 0 0 13 17.6V6.4a1 1 0 0 0-1.7-.8L7 9H4a1 1 0 0 0-1 1Zm13.5 2a4.5 4.5 0 0 0-2-3.7v7.4a4.5 4.5 0 0 0 2-3.7Zm-2-8.2v2.1a7 7 0 0 1 0 12.2v2.1a9 9 0 0 0 0-16.4Z" />
          </svg>
        </span>
        {children}
      </button>
    </div>
  );
}
