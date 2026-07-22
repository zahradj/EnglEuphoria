// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { shouldShowAudioButton } from '../audioGate';
import type { SlideType } from '@/components/creator-studio/CreatorContext';

/**
 * Pedagogical contract: the "Play Sound" button must ONLY appear on slides
 * the AI has explicitly flagged with `requires_audio: true` (Pronunciation,
 * Listening, Dialogue). For every other slide — regardless of slide_type —
 * the button MUST be hidden so the UI stays clean and intentional.
 */
const ALL_SLIDE_TYPES: SlideType[] = [
  'text_image',
  'multiple_choice',
  'drawing_prompt',
  'drawing_canvas',
  'drag_and_drop',
  'flashcard',
  'mascot_speech',
  'drag_and_match',
  'fill_in_the_gaps',
];

describe('SlideRenderer audio-button gate (shouldShowAudioButton)', () => {
  it('returns false for null / undefined slides', () => {
    expect(shouldShowAudioButton(null)).toBe(false);
    expect(shouldShowAudioButton(undefined)).toBe(false);
  });

  describe('hides the audio button when requires_audio is falsy', () => {
    it.each(ALL_SLIDE_TYPES)('hides on slide_type=%s with requires_audio undefined', (slide_type) => {
      expect(shouldShowAudioButton({ slide_type })).toBe(false);
    });

    it.each(ALL_SLIDE_TYPES)('hides on slide_type=%s with requires_audio=false', (slide_type) => {
      expect(shouldShowAudioButton({ slide_type, requires_audio: false })).toBe(false);
    });

    it('hides when requires_audio is a truthy non-boolean (strict boolean check)', () => {
      // Defensive: AI must send a real boolean. Strings/numbers are rejected.
      expect(shouldShowAudioButton({ requires_audio: 'true' as unknown as boolean })).toBe(false);
      expect(shouldShowAudioButton({ requires_audio: 1 as unknown as boolean })).toBe(false);
    });
  });

  describe('shows the audio button only when requires_audio === true', () => {
    it.each(ALL_SLIDE_TYPES)('shows on slide_type=%s when requires_audio=true', (slide_type) => {
      expect(shouldShowAudioButton({ slide_type, requires_audio: true })).toBe(true);
    });

    it('shows even when slide_type is missing, as long as requires_audio=true', () => {
      expect(shouldShowAudioButton({ requires_audio: true })).toBe(true);
    });
  });
});
