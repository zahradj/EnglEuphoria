// Master Character & Style Prompt — guarantees every generated image_prompt
// across a lesson features the SAME protagonist and art style. Used at two
// layers: (1) the system prompt instructs the LLM to append the master
// signature verbatim, (2) a post-generation walker enforces it deterministically
// in case the LLM drops it on a vocab card, grammar rule, or question block.

export type MasterHub = 'playground' | 'academy' | 'success';

const HUB_MASTER: Record<MasterHub, string> = {
  playground:
    "MASTER CHARACTER: Pip, a cheerful 6-year-old with messy chestnut hair, big curious brown eyes, freckles, wearing a yellow hoodie and red sneakers. " +
    "MASTER STYLE: Pixar-quality 3D render, soft warm pastel palette, gentle rim lighting, square framing, friendly facial expressions, no text overlays.",
  academy:
    "MASTER CHARACTER: Mia, a confident 14-year-old with shoulder-length dark hair and a teal denim jacket. " +
    "MASTER STYLE: Modern semi-realistic illustration, vibrant editorial colour palette, clean line work, dynamic lighting, no text overlays.",
  success:
    "MASTER CHARACTER: Alex, a sharp adult professional in their early thirties wearing a charcoal blazer and crisp white shirt. " +
    "MASTER STYLE: Clean flat-vector editorial illustration, muted premium palette (navy, ivory, gold accents), subtle depth, no text overlays.",
};

const MASTER_SIGNATURE = 'MASTER CHARACTER:';

export function buildMasterVisualPrompt(hub?: string | null): string {
  const key = (hub || '').toLowerCase() as MasterHub;
  return HUB_MASTER[key] ?? HUB_MASTER.academy;
}

export function buildMasterPromptDirective(master: string): string {
  return (
    `\n\n=== MASTER CHARACTER & STYLE PROMPT (BINDING) ===\n` +
    `${master}\n\n` +
    `RULE — IMAGE CONSISTENCY: You MUST append the EXACT master prompt above, verbatim, ` +
    `to the "image_prompt" field of EVERY block in the JSON output. This includes every ` +
    `slide, every vocab card, every grammar rule card, every question, every option with ` +
    `imagery, every cool-off, and every nested item. ZERO EXCEPTIONS. Every generated image ` +
    `must feature the SAME character and the SAME art style across the lesson.\n` +
    `=== END MASTER PROMPT ===\n`
  );
}

/**
 * Deterministic safety net: walk the parsed lesson JSON and ensure every
 * node that has an `image_prompt` (or that conceptually should — vocab cards,
 * questions, options with `image_url`) carries the master signature.
 * Returns the number of injections performed.
 */
export function enforceMasterPrompt(node: unknown, master: string): number {
  let injections = 0;

  const append = (obj: Record<string, unknown>) => {
    const current = typeof obj.image_prompt === 'string' ? obj.image_prompt.trim() : '';
    if (!current) {
      obj.image_prompt = master;
      injections++;
    } else if (!current.includes(MASTER_SIGNATURE)) {
      obj.image_prompt = `${current}\n\n${master}`;
      injections++;
    }
  };

  const visit = (n: unknown, parentHasImagery = false) => {
    if (!n) return;
    if (Array.isArray(n)) {
      for (const item of n) visit(item, parentHasImagery);
      return;
    }
    if (typeof n !== 'object') return;
    const obj = n as Record<string, unknown>;

    // If the node already declares image_prompt OR carries imagery hints,
    // ensure the master prompt is present.
    const hasImageField =
      'image_prompt' in obj || 'image_url' in obj || 'imageUrl' in obj || 'visual' in obj;
    if (hasImageField) append(obj);

    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object') visit(value, hasImageField);
    }
  };

  visit(node);
  return injections;
}
