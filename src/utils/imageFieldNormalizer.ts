// Pre-render sanitizer: if image_url contains a raw AI prompt (e.g. "AI: a fox"),
// move it into image_prompt and null the URL so the generator can run.
// Idempotent.

const BAD_PREFIXES = /^(ai:|prompt:|generate:|\{|\[|<)/i;

export function normalizeImageFields<T = any>(node: T): T {
  if (!node || typeof node !== 'object') return node;
  const clone: any = Array.isArray(node) ? [...(node as any)] : { ...(node as any) };

  if (typeof clone.image_url === 'string') {
    const raw = clone.image_url.trim();
    if (BAD_PREFIXES.test(raw)) {
      const promptText = raw.replace(BAD_PREFIXES, '').trim();
      if (promptText && !clone.image_prompt) clone.image_prompt = promptText;
      clone.image_url = null;
    } else if (!raw) {
      clone.image_url = null;
    }
  }

  for (const [k, v] of Object.entries(clone)) {
    if (Array.isArray(v)) {
      clone[k] = v.map((entry) => normalizeImageFields(entry));
    } else if (v && typeof v === 'object') {
      clone[k] = normalizeImageFields(v);
    }
  }
  return clone as T;
}

export function hasUnresolvedImagePrompts(node: any): boolean {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node)) return node.some(hasUnresolvedImagePrompts);
  const hasPrompt =
    typeof node.image_prompt === 'string' && node.image_prompt.trim().length > 0;
  const hasUrl = typeof node.image_url === 'string' && node.image_url.trim().length > 0;
  if (hasPrompt && !hasUrl) return true;
  return Object.values(node).some(hasUnresolvedImagePrompts);
}
