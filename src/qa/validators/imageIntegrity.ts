// Image field integrity — blocks "AI:..." prompt leaks reaching the renderer.
// Also flags duplicate image URLs inside matching-style activities so we never
// ship a lesson where every vocab pair shows the same fox.

import type { QAActivity, QAIssue, QALesson, QASlide } from '../types';

const BAD_URL_PREFIXES = [
  'ai:',
  'prompt:',
  'generate:',
  '{',
  '[',
  '<',
];

export function validateImageIntegrity(lesson: QALesson): QAIssue[] {
  const issues: QAIssue[] = [];

  for (const slide of lesson.slides ?? []) {
    walk(slide, (node, path) => {
      // Leaked prompt as URL
      if (typeof node?.image_url === 'string') {
        const v = node.image_url.trim();
        const lower = v.toLowerCase();
        if (!v) {
          if (typeof node.image_prompt === 'string' && node.image_prompt.trim()) {
            issues.push(block(
              'IMAGE_URL_EMPTY_WITH_PROMPT',
              `Image prompt present but image_url is empty at ${path} (slide ${slide.id}). Generate the image before publishing.`,
              slide,
            ));
          }
        } else if (BAD_URL_PREFIXES.some((p) => lower.startsWith(p))) {
          issues.push(block(
            'IMAGE_URL_PROMPT_LEAK',
            `image_url contains a raw prompt instead of a URL at ${path} (slide ${slide.id}). Value started with "${v.slice(0, 12)}…".`,
            slide,
          ));
        } else if (!/^(https?:|data:image\/|\/)/.test(v)) {
          issues.push(block(
            'IMAGE_URL_INVALID',
            `image_url is not a valid http(s)/data/relative URL at ${path} (slide ${slide.id}).`,
            slide,
          ));
        }
      }
    });

    // Duplicate-image guard for matching-style activities.
    for (const act of slide.activities ?? []) {
      if (!isMatchingLike(act)) continue;
      const urls = collectImageUrls(act.content);
      const seen = new Map<string, number>();
      for (const u of urls) {
        seen.set(u, (seen.get(u) ?? 0) + 1);
      }
      for (const [url, count] of seen) {
        if (count >= 2) {
          issues.push({
            code: 'MATCHING_DUPLICATE_IMAGE',
            domain: 'activity',
            severity: 'block',
            message: `Matching activity "${act.id}" reuses the same image ${count}× (${url.slice(0, 60)}…). Every option needs a visually distinct image.`,
            locator: { slideId: slide.id, activityId: act.id },
            suggestion: 'Generate one unique image per pair from its own image_prompt.',
            auto_repairable: true,
          });
        }
      }
    }
  }

  return issues;
}

function isMatchingLike(a: QAActivity): boolean {
  const t = (a.type || '').toLowerCase();
  return /match|drag_drop|audio_to_image|listen_and_match|memory_flip/.test(t);
}

function collectImageUrls(node: any, out: string[] = []): string[] {
  if (!node) return out;
  if (Array.isArray(node)) {
    for (const n of node) collectImageUrls(n, out);
    return out;
  }
  if (typeof node === 'object') {
    if (typeof node.image_url === 'string' && node.image_url.trim()) {
      out.push(node.image_url.trim());
    }
    for (const v of Object.values(node)) collectImageUrls(v, out);
  }
  return out;
}

function walk(slide: QASlide, fn: (node: any, path: string) => void) {
  const visit = (n: any, p: string) => {
    if (!n || typeof n !== 'object') return;
    fn(n, p);
    if (Array.isArray(n)) {
      n.forEach((c, i) => visit(c, `${p}[${i}]`));
      return;
    }
    for (const [k, v] of Object.entries(n)) visit(v, `${p}.${k}`);
  };
  visit(slide, `slide:${slide.id}`);
}

function block(code: string, message: string, slide: QASlide): QAIssue {
  return {
    code,
    domain: 'activity',
    severity: 'block',
    message,
    locator: { slideId: slide.id },
    auto_repairable: true,
  };
}
