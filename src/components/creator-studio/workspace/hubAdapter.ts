import type React from 'react';
import type { CreatorHub } from './HubTheme';

/**
 * HubCreatorAdapter — contract every hub creator implements so the shared
 * `CreatorWorkspace` shell can host any of them without duplicating
 * layout/header/save chrome.
 *
 * Per-hub pages (`PlaygroundCreator`, `AcademyCreator`, `SuccessCreator`)
 * own their slide reducer, renderer registry, and slide-type configs.
 * They expose the three slots below; the workspace owns the shell.
 *
 * The adapter is intentionally minimal — anything specific to a hub
 * (block taxonomy, slide types, scaffolding fields) stays inside the
 * renderer/inspector components and never leaks into the shell.
 */

export type PreviewMode = 'canvas' | 'playable';
export type PreviewRole = 'teacher' | 'student';

/** Minimal shape every hub slide must expose so the architecture rail
 *  can group, label, and badge slides without knowing hub specifics. */
export interface SlideHeader {
  id: string;
  /** Hub slide-type discriminator, e.g. 'intro', 'vocab', 'speaking_task' */
  type: string;
  /** 6-arc stage. Falls back to 'unassigned' if the hub doesn't tag it. */
  stage?: 'warm-up' | 'prime' | 'mimic' | 'practice' | 'produce' | 'cool-off' | 'unassigned';
  /** Short label for the rail */
  title?: string;
  /** Optional validation severity for the rail badge dot */
  validation?: 'ok' | 'warn' | 'block';
}

export interface HubCreatorAdapter {
  hub: CreatorHub;

  /** Current slide list + active slide id. The rail reads this. */
  useSlides: () => {
    slides: SlideHeader[];
    activeSlideId: string | null;
    setActiveSlideId: (id: string) => void;
    addSlide: (afterId?: string, type?: string) => void;
    removeSlide: (id: string) => void;
    reorderSlides: (fromId: string, toId: string) => void;
    duplicateSlide: (id: string) => void;
  };

  /** Preview body for the active slide. Hub owns the JSX; shell owns
   *  the framing (scaled canvas frame vs. playable runtime shell). */
  SlideRenderer: React.ComponentType<{
    slideId: string;
    mode: PreviewMode;
    role: PreviewRole;
  }>;

  /** Inspector panel body for the active slide. Hub owns the fields;
   *  shell owns the dock chrome. */
  SlideInspector: React.ComponentType<{
    slideId: string;
  }>;

  /** Optional: extra panels the hub wants in the dock (after the four
   *  standard tabs). Each entry becomes a dock tab. */
  extraDockPanels?: Array<{
    id: string;
    label: string;
    Icon?: React.ComponentType<{ className?: string }>;
    Component: React.ComponentType;
  }>;
}

/** Helper: groups a slide list by 6-arc stage in canonical order. */
export const STAGE_ORDER: NonNullable<SlideHeader['stage']>[] = [
  'warm-up',
  'prime',
  'mimic',
  'practice',
  'produce',
  'cool-off',
  'unassigned',
];

export const STAGE_LABEL: Record<NonNullable<SlideHeader['stage']>, string> = {
  'warm-up': 'Warm-Up',
  prime: 'Prime',
  mimic: 'Mimic',
  practice: 'Practice',
  produce: 'Produce',
  'cool-off': 'Cool-Off',
  unassigned: 'Unassigned',
};

export const groupSlidesByStage = (slides: SlideHeader[]) => {
  const groups = new Map<NonNullable<SlideHeader['stage']>, SlideHeader[]>();
  for (const stage of STAGE_ORDER) groups.set(stage, []);
  for (const s of slides) {
    const stage = s.stage ?? 'unassigned';
    groups.get(stage)!.push(s);
  }
  return STAGE_ORDER
    .map((stage) => ({ stage, label: STAGE_LABEL[stage], slides: groups.get(stage)! }))
    .filter((g) => g.slides.length > 0);
};
