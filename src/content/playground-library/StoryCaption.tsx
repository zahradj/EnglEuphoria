import type { ReactNode } from 'react';
import { StoryPlate } from './StoryPlate';
import { useCaptionPlacement, type CaptionPos } from './captionPlacement';

/**
 * THE way any story / narration line is shown over a picture, in every hub and
 * every scene kind (owner rule, 2026-10-06): the framed paper plate of the
 * character-introduction pages, on the calm side of the picture — top, bottom,
 * left or right — chosen by captionPlacement.ts from the picture itself.
 *
 * Drop it inside any positioned parent that is the picture's box. It makes
 * itself an inline-size container, so the plate scales with the picture (laptop,
 * classroom canvas, phone) and never depends on a stray ancestor's cqw.
 * `deploy gate`: storyText.test.ts fails if a story scene prints its line any other way.
 */
export function StoryCaption({
  img,
  pin,
  avoid,
  bottomOffset,
  name,
  color = '#E3A857',
  text,
  onReplay,
  children,
}: {
  /** The picture the line sits on (analysed once to find calm space). */
  img: string | undefined;
  /** Force a side (a page's `textPos`) — normally omitted. */
  pin?: CaptionPos;
  /** Sides this scene's own title / controls already use. */
  avoid?: CaptionPos[];
  /** Lift a bottom plate above a control on the bottom edge. */
  bottomOffset?: string;
  /** Speaker's name for the tab; omit for narration. */
  name?: string;
  color?: string;
  text: string;
  /** Replays the recorded line. */
  onReplay: () => void;
  children?: ReactNode;
}) {
  const { pos, ready } = useCaptionPlacement(img, pin, avoid);
  return (
    <div className="pointer-events-none absolute inset-0 z-20" style={{ containerType: 'inline-size', opacity: ready ? 1 : 0, transition: 'opacity .25s ease' }}>
      <StoryPlate pos={pos} bottomOffset={bottomOffset} name={name} color={color} text={text} onReplay={onReplay}>{children}</StoryPlate>
    </div>
  );
}
