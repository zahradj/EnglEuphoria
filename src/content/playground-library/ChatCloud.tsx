import type { ReactNode } from 'react';

/**
 * A white "chat cloud" speech bubble for a character's line: a soft cloud
 * silhouette (body + bumps on top) with trailing puffs pointing at whoever
 * is speaking. Replaces the big white cards that used to cover the
 * character. Sizes use --svh (see MainStage's design canvas) so it looks
 * the same on every screen in the classroom.
 */
export function ChatCloud({
  children,
  color,
  tail = 'left',
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  /** Accent (the speaker's colour) for the text and the puff outline. */
  color: string;
  /** Which side the speaker is on — the puffs trail toward it. */
  tail?: 'left' | 'right';
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const Tag = onClick ? 'button' : 'div';
  const puffSide = tail === 'left' ? { left: '6%' } : { right: '6%' };
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={ariaLabel}
      className="pointer-events-auto relative block text-center transition active:scale-95"
      // One drop-shadow over the whole silhouette so the bumps and body read
      // as a single cloud instead of separate shapes.
      style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.28))', animation: 'lep1-pop 0.4s ease-out' }}
    >
      {/* Cloud bumps along the top edge */}
      <span aria-hidden className="absolute rounded-full bg-white" style={{ width: '38%', height: '70%', left: '8%', top: '-22%' }} />
      <span aria-hidden className="absolute rounded-full bg-white" style={{ width: '44%', height: '82%', left: '34%', top: '-34%' }} />
      <span aria-hidden className="absolute rounded-full bg-white" style={{ width: '30%', height: '60%', right: '6%', top: '-16%' }} />
      {/* Body */}
      <span
        className="relative block rounded-[999px] bg-white px-[calc(3.2*var(--svh,1vh))] py-[calc(1.6*var(--svh,1vh))]"
        style={{ color }}
      >
        {children}
      </span>
      {/* Trailing puffs toward the speaker */}
      <span aria-hidden className="absolute rounded-full bg-white" style={{ ...puffSide, bottom: 'calc(-2.6 * var(--svh, 1vh))', width: 'calc(2.8 * var(--svh, 1vh))', height: 'calc(2.8 * var(--svh, 1vh))' }} />
      <span
        aria-hidden
        className="absolute rounded-full bg-white"
        style={{
          ...(tail === 'left' ? { left: '1%' } : { right: '1%' }),
          bottom: 'calc(-5.4 * var(--svh, 1vh))',
          width: 'calc(1.6 * var(--svh, 1vh))',
          height: 'calc(1.6 * var(--svh, 1vh))',
        }}
      />
    </Tag>
  );
}
