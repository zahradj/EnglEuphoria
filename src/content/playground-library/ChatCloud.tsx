import type { ReactNode } from 'react';

/**
 * A white "chat cloud" speech bubble for a character's line: a soft cloud
 * silhouette (body + two overlapping top bumps) with one teardrop tail
 * pointing at whoever is speaking. Replaces the big white cards that used
 * to cover the character. Sizes use --svh (see MainStage's design canvas)
 * so it looks the same on every screen in the classroom.
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
      {/* Cloud bumps along the top edge — two, deeply tucked into the body
          (large negative top offset kept small) rather than three shallow
          ones, so the top edge reads as one continuous poofy silhouette
          instead of three separate circles balanced on a pill. Reported
          live: "the shape of it does not look good." */}
      <span aria-hidden className="absolute rounded-full bg-white" style={{ width: '46%', height: '78%', left: '10%', top: '-14%' }} />
      <span aria-hidden className="absolute rounded-full bg-white" style={{ width: '46%', height: '78%', right: '10%', top: '-14%' }} />
      {/* Body */}
      <span
        className="relative block rounded-[999px] bg-white px-[calc(3.2*var(--svh,1vh))] py-[calc(1.6*var(--svh,1vh))]"
        style={{ color }}
      >
        {children}
      </span>
      {/* Single teardrop tail toward the speaker — a rotated rounded
          square overlapping the body's bottom corner reads as one
          attached point, unlike the old two free-floating dot "puffs"
          that looked like stray debris rather than a tail. */}
      <span
        aria-hidden
        className="absolute rounded-[30%] bg-white"
        style={{
          ...(tail === 'left' ? { left: '10%' } : { right: '10%' }),
          bottom: 'calc(-1.6 * var(--svh, 1vh))',
          width: 'calc(2.6 * var(--svh, 1vh))',
          height: 'calc(2.6 * var(--svh, 1vh))',
          transform: 'rotate(45deg)',
        }}
      />
    </Tag>
  );
}
