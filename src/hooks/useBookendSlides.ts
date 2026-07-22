import { useMemo } from 'react';

/**
 * Wraps a slide array with automatic Front Page (slide 0) and Celebration (final slide).
 * The bookend slides use slide_type = 'front_page' | 'celebration' which the renderer handles.
 */
export function useBookendSlides(
  slides: any[],
  options: {
    lessonTitle?: string;
    topic?: string;
    level?: string;
    hub?: string;
    coverImageUrl?: string;
  }
) {
  return useMemo(() => {
    if (!slides || slides.length === 0) return slides;

    // Don't double-inject if already present
    const first = slides[0];
    const last = slides[slides.length - 1];
    const hasBookends =
      first?.slide_type === 'front_page' && last?.slide_type === 'celebration';
    if (hasBookends) return slides;

    const frontPage = {
      id: '__front_page__',
      title: options.lessonTitle || 'Lesson',
      slide_type: 'front_page',
      topic: options.topic,
      level: options.level,
      coverImageUrl: options.coverImageUrl,
    };

    const celebration = {
      id: '__celebration__',
      title: options.lessonTitle || 'Lesson',
      slide_type: 'celebration',
      topic: options.topic,
    };

    return [frontPage, ...slides, celebration];
  }, [slides, options.lessonTitle, options.topic, options.level, options.hub, options.coverImageUrl]);
}
