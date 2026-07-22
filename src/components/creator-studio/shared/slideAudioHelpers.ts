/**
 * Slide audio helpers — work for both Playground and Academy slide shapes.
 *
 * Playground stores narration in `slide.voice = { text, autoPlay, audio_url? }`.
 * Academy stores text on top-level fields like `passage`, `transcript`, `prompt`,
 * `text`, `statement`, `question`, etc., and saves the resulting audio URL on
 * `slide.audio_url`.
 *
 * These helpers normalize both so the bulk-audio generator can scan + patch
 * either shape via the existing `update`/`onPatch` reducer.
 */

export interface AudioSlideTask {
  index: number;
  text: string;
  /** Patch to apply once the URL is generated. */
  apply: (url: string) => Record<string, any>;
  /** Existing URL (if any) — used so we can skip already-generated slides. */
  existingUrl?: string;
}

const ACADEMY_TEXT_FIELDS = [
  'passage',     // reading_passage
  'transcript',  // listening
  'text',        // intro/fill
  'statement',   // truefalse
  'question',    // multiple
  'prompt',      // many types
  'subtitle',    // intro
];

/**
 * Returns the narratable text + a patcher for the given slide.
 * Returns null if the slide has no narratable content.
 */
export function getAudioTaskForSlide(slide: any, index: number): AudioSlideTask | null {
  if (!slide || typeof slide !== 'object') return null;

  // Playground shape: voice.text
  if (slide.voice && typeof slide.voice === 'object' && typeof slide.voice.text === 'string') {
    const text = slide.voice.text.trim();
    if (!text) return null;
    return {
      index,
      text,
      existingUrl: slide.voice.audio_url || slide.audio_url,
      apply: (url) => ({
        voice: { ...slide.voice, audio_url: url },
        audio_url: url,
      }),
    };
  }

  // Academy shape: top-level audio_url + a text field
  for (const field of ACADEMY_TEXT_FIELDS) {
    const value = slide[field];
    if (typeof value === 'string' && value.trim().length > 4) {
      return {
        index,
        text: value.trim(),
        existingUrl: slide.audio_url,
        apply: (url) => ({ audio_url: url }),
      };
    }
  }

  return null;
}

export interface BulkAudioCandidate extends AudioSlideTask {
  slideTitlePreview: string;
}

/** Build the list of slides that have narratable text but no audio_url yet. */
export function findSlidesMissingAudio(slides: any[]): BulkAudioCandidate[] {
  const out: BulkAudioCandidate[] = [];
  slides.forEach((slide, index) => {
    const task = getAudioTaskForSlide(slide, index);
    if (!task) return;
    if (task.existingUrl) return;
    out.push({
      ...task,
      slideTitlePreview: task.text.slice(0, 60),
    });
  });
  return out;
}
