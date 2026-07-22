// Storybook art-style picker. Deterministic by hub × CEFR with optional
// per-learner override. Used by `runStorybookGeneration` to prefix every
// page's `image_prompt` with a STYLE directive so illustrations stay
// consistent within a book and on-brand for the hub.
//
// Flat 2.0 constraint preserved everywhere: no 3D, no photorealism,
// no rendered shadows.

import type { Hub, Cefr } from '@/governance/types';

export type StorybookArtStyle =
  | 'picture_book'    // soft watercolor children's picture book
  | 'cartoon'         // bright flat cartoon mascots
  | 'comic'           // paneled comic-strip
  | 'manga_chibi'     // kawaii chibi line-art with color pops
  | 'storyboard';     // cinematic adult storyboard

export interface PickStyleArgs {
  hub: Hub;
  cefr: Cefr;
  unitTheme?: string;
  learnerPref?: StorybookArtStyle | null;
}

export function pickStorybookStyle(args: PickStyleArgs): StorybookArtStyle {
  if (args.learnerPref) return args.learnerPref;

  if (args.hub === 'playground') {
    // Pre-A1 / A1 → softest, most picture-book feel. A2+ → brighter cartoon.
    if (args.cefr === 'Pre-A1' || args.cefr === 'A1') return 'picture_book';
    return 'cartoon';
  }

  if (args.hub === 'academy') {
    // Teens — comic feel by default, opt-in chibi.
    return 'comic';
  }

  // Success — adult, cinematic storyboard.
  return 'storyboard';
}

const STYLE_PROMPTS: Record<StorybookArtStyle, string> = {
  picture_book:
    "soft watercolor children's picture book, warm pastel palette, gentle line work, full-page illustration, no text, no 3D, no photorealism, no rendered shadows",
  cartoon:
    'bright flat cartoon, bold clean outlines, saturated kid-friendly palette, friendly mascot faces, no text, no 3D, no photorealism, no rendered shadows',
  comic:
    'modern comic-strip panel art, dynamic poses, halftone shading, expressive faces, no text in image, no photorealism, no 3D',
  manga_chibi:
    'kawaii chibi manga line art with color pops, oversized eyes, simple two-tone shading, no text, no photorealism, no 3D',
  storyboard:
    'cinematic adult storyboard frame, muted editorial palette, confident line work, grounded composition, no text, no photorealism, no rendered shadows',
};

export function styleDirective(style: StorybookArtStyle): string {
  return `STYLE: ${STYLE_PROMPTS[style]}.`;
}

/** Prefix a raw image prompt with the style directive, idempotent. */
export function applyStyle(rawPrompt: string, style: StorybookArtStyle): string {
  if (rawPrompt.startsWith('STYLE:')) return rawPrompt;
  return `${styleDirective(style)} ${rawPrompt}`.trim();
}
