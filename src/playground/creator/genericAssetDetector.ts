/**
 * Detects whether an image URL points at the generic baseline Pip fox asset
 * (the one that many auto-generated Playground lessons reuse for every
 * vocab_solo card). Creator surfaces a "Regenerate unique image" affordance
 * when this returns true and the slide has an `image_prompt` set.
 */
const BASELINE_FOX_FRAGMENTS = [
  'a-small-bright-orange-cartoon-fox-with-a-fluffy',
  'playground/placeholder-dropzone',
];

export function isGenericBaselineAsset(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  return BASELINE_FOX_FRAGMENTS.some((frag) => lower.includes(frag));
}
