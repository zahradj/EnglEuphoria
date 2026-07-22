// Generation-time image-prompt simplifier (Rule 6).
// Keeps the first N style descriptors, strips lens/camera jargon and triple stacks,
// and caps total length.

import { STYLE_TOKENS } from '@/qa/validators/imagePromptComplexity';

const MAX_STYLES = 2;
const MAX_WORDS = 25;
const CAMERA_JARGON = /\b(35mm|50mm|85mm|bokeh|f\/?\d+(\.\d+)?|dslr|cinematic|hdr|raytracing|octane|unreal\s*engine|hyper[-\s]?realistic|ultra[-\s]?realistic|8k|4k)\b/gi;

export function normalizeImagePrompt(prompt: string): string {
  if (typeof prompt !== 'string') return prompt;
  let p = prompt.trim();
  if (!p) return p;

  // Strip camera jargon.
  p = p.replace(CAMERA_JARGON, '');

  // Split into comma-separated phrases so we keep "{character}, {action}, …".
  const phrases = p.split(',').map((s) => s.trim()).filter(Boolean);

  // Identify which phrases are style-only (every word is a style token).
  let stylesKept = 0;
  const kept: string[] = [];
  for (const phrase of phrases) {
    const words = phrase.toLowerCase().split(/[\s+|/]+/).map((w) => w.replace(/[^\w-]/g, '')).filter(Boolean);
    const allStyle = words.length > 0 && words.every((w) => STYLE_TOKENS.has(w));
    if (allStyle) {
      if (stylesKept >= MAX_STYLES) continue;
      stylesKept++;
      kept.push(phrase);
      continue;
    }
    kept.push(phrase);
  }

  let out = kept.join(', ').replace(/\s+/g, ' ').replace(/,\s*,/g, ',').trim();

  // Hard cap by words.
  const words = out.split(/\s+/);
  if (words.length > MAX_WORDS) out = words.slice(0, MAX_WORDS).join(' ');

  return out;
}

export function normalizeImagePromptsDeep<T = any>(node: T): T {
  if (!node || typeof node !== 'object') return node;
  const clone: any = Array.isArray(node) ? [...(node as any)] : { ...(node as any) };
  if (typeof clone.image_prompt === 'string') clone.image_prompt = normalizeImagePrompt(clone.image_prompt);
  for (const [k, v] of Object.entries(clone)) {
    if (Array.isArray(v)) clone[k] = v.map((entry) => normalizeImagePromptsDeep(entry));
    else if (v && typeof v === 'object') clone[k] = normalizeImagePromptsDeep(v);
  }
  return clone as T;
}
