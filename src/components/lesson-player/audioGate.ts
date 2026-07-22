/**
 * Pure logic for the "Play Sound" UI gate.
 *
 * Rule: the audio button is visible if and only if the slide is explicitly
 * flagged as `requires_audio === true` by the curriculum AI. Every other slide
 * type — regardless of `slide_type` — must hide the button to keep the UI
 * intentional and uncluttered.
 *
 * Kept as a standalone pure function so it can be exhaustively unit-tested
 * across every SlideType without needing to mount the full SlideCanvas /
 * SlideRenderer tree.
 */
export interface AudioGateInput {
  requires_audio?: boolean;
  slide_type?: string;
}

export function shouldShowAudioButton(slide: AudioGateInput | null | undefined): boolean {
  if (!slide) return false;
  return slide.requires_audio === true;
}
