import type { ReactNode } from 'react';

// A real illustrated cloud-shaped speech bubble (bold outline, puffy
// silhouette, one tapering tail), generated once as a single sticker
// asset — see public/shared/stickers/chat-cloud-bubble.png. Replaces an
// earlier attempt at faking the same shape from overlapping CSS circles,
// which read as scattered blobs rather than a real cloud no matter how
// it was tuned ("the shape of it does not look good... try to make more
// real"). The source art draws its tail from the bottom-LEFT; the
// `tail="right"` variant just mirrors the whole image horizontally
// (scaleX(-1)) rather than needing a second asset.
//
// The generator's first pass baked a literal checkerboard pattern into
// the pixels instead of real alpha transparency (colorType 2/RGB, no
// alpha channel at all) — it rendered what "transparent" LOOKS like in a
// screenshot rather than actually being transparent, which is why it
// showed as a solid grey box in the app ("there is a background in it").
// Fixed by flood-filling from the canvas edges inward (stopping at the
// bold dark outline, which the fill can't cross) to punch real
// transparency through every background pixel, then cropped tight to the
// opaque content with ~4% padding — the original had ~45% of the canvas
// as dead space around a small cloud, which combined with
// object-fit:fill below to render the cloud itself tiny ("it's small").
const CLOUD_SRC = '/shared/stickers/chat-cloud-bubble.png';

/**
 * A white "chat cloud" speech bubble for a character's line. Replaces the
 * big white cards that used to cover the character. Sizes use --svh (see
 * MainStage's design canvas) so it looks the same on every screen in the
 * classroom.
 */
export function ChatCloud({
  children,
  color,
  tail = 'left',
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  /** Accent (the speaker's colour) for the text. */
  color: string;
  /** Which side the speaker is on — the tail points toward it. */
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
      style={{ animation: 'lep1-pop 0.4s ease-out' }}
    >
      {/* The cloud art itself stretches to fill the box (object-fit: fill)
          so the bubble still grows to fit however much text a given
          scene's line needs — the source image's own transparent margin
          around the cloud scales along with it, so this doesn't pinch the
          outline at typical (short-phrase) content lengths. */}
      <img
        aria-hidden
        src={CLOUD_SRC}
        alt=""
        className="absolute inset-0 h-full w-full"
        style={{
          objectFit: 'fill',
          transform: tail === 'right' ? 'scaleX(-1)' : undefined,
          filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.22))',
        }}
      />
      {/* Body padding, tuned against the now-tightly-cropped art (see
          above): generous side/top padding to clear the puffy outline,
          and extra bottom padding since the tail eats a real chunk of the
          image's lower portion and text must stay clear of it. Padding
          only gives a safety margin for the TEXT's own box — it can't
          compensate for the box's overall shape getting distorted by a
          long wrapped line (see the word-count font sizing callers use
          for that), so keep both in mind when a line still crowds the
          outline. */}
      <span className="relative block px-[calc(6.5*var(--svh,1vh))] pt-[calc(5*var(--svh,1vh))] pb-[calc(8*var(--svh,1vh))]" style={{ color }}>
        {children}
      </span>
    </Tag>
  );
}
