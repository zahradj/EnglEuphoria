import { SLIDES, type Slide } from '@/pages/SuccessDemo';

/**
 * Success Hub — preloaded 60-minute lesson.
 * Topic: "Making Requests at Work" (B1, adults, professional English)
 * 32 slides across 7 blocks.
 */
export const MAKING_REQUESTS_AT_WORK: { id: string; title: string; level: string; durationMin: number; slides: Slide[] } = {
  id: 'making-requests-at-work',
  title: 'Making Requests at Work',
  level: 'B1',
  durationMin: 60,
  slides: SLIDES,
};
