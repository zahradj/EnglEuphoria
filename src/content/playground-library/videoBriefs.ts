import { MAX_CLIP_SECONDS } from '@/lib/videoPolicy';

/**
 * The approved video briefs for LESSONS (not games): short, silent intro/atmosphere clips that open a lesson.
 * Built to the pattern in .claude/skills/video-quality-gate.
 *
 * A brief is image-to-video: the START IMAGE is a lesson background the user has already seen, so `motion`
 * describes ONLY what moves. Keep it slow and ambient (sparkles, sway, drifting clouds, gentle camera push).
 * Characters stay still. Nothing here is generated until `npm run audit:video` is clean AND the user has
 * approved the first clip. Games never get generated video.
 */
export interface VideoBrief {
  id: string;
  /** Hub, level, unit and lesson this opens, e.g. "Playground · Pre-A1 · Unit 1 · Lesson 3 — How Are You?". */
  lesson: string;
  /** What a child should feel/learn from the clip. */
  purpose: string;
  /** Public path of the approved still (becomes the first frame). */
  startImage: string;
  /** Motion only. Do not re-describe the picture. */
  motion: string;
  seconds: number;
  /** The user has seen and approved the start image. */
  stillApproved: boolean;
  /** Where the brief is in the pipeline. Only the user moves a brief to 'clip-approved'. */
  status: 'draft' | 'ready' | 'clip-approved';
}

export const VIDEO_BRIEFS: VideoBrief[] = [
  {
    // First clip to order: no characters in the picture, so no hands/faces/limbs to get wrong. Safest way to test the pipeline.
    id: 'l3-feelings-meadow-intro',
    lesson: 'Playground \u00b7 Pre-A1 \u00b7 Unit 1 \u00b7 Lesson 3 \u2014 How Are You?',
    purpose: 'A calm, happy opening for the feelings lesson: a warm meadow where butterflies drift and the sun glows.',
    startImage: '/lep1/scenes/bg-feelings-meadow.jpg',
    motion: 'The butterflies drift slowly across the sky. Tiny hearts and sparkles float gently upward. The flowers sway very slightly in a soft breeze. The sun glows softly and the clouds drift slowly. The camera makes a slow, gentle push forward. The bench and the tree stay still.',
    seconds: 8,
    stillApproved: true, // approved by the owner 2026-10-03
    status: 'ready',
  },
  {
    // Second: one cartoon character. Order only after the first clip passed the full review.
    id: 'l1-forest-of-hellos-intro',
    lesson: 'Playground \u00b7 Pre-A1 \u00b7 Unit 1 \u00b7 Lesson 1 \u2014 The Forest of Hellos',
    purpose: 'A friendly opening for the greeting lesson: the forest clearing comes alive around the fox.',
    startImage: '/lep1/scenes/bg-hello-cast.jpg',
    motion: 'The leaves of the trees sway gently. Butterflies drift slowly over the flowers. Little music notes and hearts float softly upward. Warm golden light shimmers. The camera makes a slow, gentle push forward. The fox stays still.',
    seconds: 8,
    stillApproved: false,
    status: 'draft',
  },
];

export const briefIsWithinLimits = (b: VideoBrief) => b.seconds > 0 && b.seconds <= MAX_CLIP_SECONDS;
