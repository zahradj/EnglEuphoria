// Image prompt over-specification guard (Rule 6).
// HARD-blocks `image_prompt` strings that pile on more than 2 style descriptors
// or exceed 25 words. Generation-time normalizer in src/utils/normalizeImagePrompt.ts
// trims most cases; this validator catches escapes.

import type { QAIssue, QALesson } from '../types';

// Recognised style descriptors (lowercase, single tokens after split).
export const STYLE_TOKENS = new Set([
  'flat', 'vector', 'realistic', 'anime', 'manga', 'webcomic', 'cel-shading', 'cel', 'shading',
  'watercolor', 'oilpainting', 'pastel', 'cartoon', 'pixar', 'disney', 'minimalist', 'sketch',
  'claymorphism', 'clay', 'isometric', '3d', 'noir', 'cyberpunk', 'pixel', 'low-poly', 'slice-of-life',
  'photorealistic', 'render', 'studio', 'glossy', 'matte', 'pastel-palette',
]);

const MAX_STYLE_TOKENS = 2;
const MAX_WORDS = 25;

export function validateImagePromptComplexity(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];
  visit(lesson, (node, path) => {
    const prompt = typeof node.image_prompt === 'string' ? node.image_prompt.trim() : '';
    if (!prompt) return;

    const styleCount = countStyleTokens(prompt);
    const wordCount = prompt.split(/\s+/).filter(Boolean).length;

    if (styleCount > MAX_STYLE_TOKENS || wordCount > MAX_WORDS) {
      issues.push({
        code: 'IMAGE_PROMPT_OVER_SPECIFIED',
        domain: 'activity',
        severity: 'block',
        message: `image_prompt at ${path} is over-specified (${styleCount} style tokens, ${wordCount} words). Cap: ${MAX_STYLE_TOKENS} style tokens, ${MAX_WORDS} words.`,
        locator: { path },
        suggestion: 'Keep prompts to: {character}, {action}, {≤2 style descriptors}. Strip stacked styles like "realistic + anime + cel shading".',
        auto_repairable: true,
      });
    }
  });
  return issues;
}

export function countStyleTokens(prompt: string): number {
  const tokens = prompt
    .toLowerCase()
    .split(/[\s,+|/]+/)
    .map((t) => t.replace(/[^\w-]/g, ''))
    .filter(Boolean);
  let n = 0;
  for (const t of tokens) if (STYLE_TOKENS.has(t)) n++;
  return n;
}

function visit(node: any, fn: (n: any, path: string) => void, path = '$') {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((c, i) => visit(c, fn, `${path}[${i}]`));
    return;
  }
  fn(node, path);
  for (const [k, v] of Object.entries(node)) visit(v, fn, `${path}.${k}`);
}
