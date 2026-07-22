// Storybook Creator — public surface.
// Single entry: runStorybookGeneration().
//
// All other engines (planning, governance, adaptive, memory, speaking, qa)
// are reached through this module — story generation MUST NOT touch
// curriculum_lessons or runLessonGeneration.

import { supabase } from '@/integrations/supabase/client';
import type {
  RunStorybookGenerationInput,
  RunStorybookGenerationResult,
  Storybook,
  CastVaultCharacter,
} from './types';
import { getStorybookHubProfile } from './hubProfiles';
import { pickStorybookStyle, styleDirective, type StorybookArtStyle } from './artStyle';

export * from './types';
export { getStorybookHubProfile, STORYBOOK_HUB_PROFILES } from './hubProfiles';
export { pickStorybookStyle, styleDirective, applyStyle, type StorybookArtStyle } from './artStyle';

/**
 * runStorybookGeneration
 *
 * Single entry point for creating a real, persistent interactive storybook.
 * The heavy AI orchestration happens in the `storybook-generate` edge function
 * (Gemini direct, runtime-AI-Gemini-only rule). This wrapper:
 *  1. Validates input shape & hub-profile constraints.
 *  2. Calls the edge function.
 *  3. Persists the returned book to `storybooks` / `storybook_chapters`
 *     / `storybook_pages` / `storybook_character_bindings`.
 *  4. Returns the canonical `Storybook` row.
 */
export async function runStorybookGeneration(
  input: RunStorybookGenerationInput,
): Promise<RunStorybookGenerationResult> {
  const t0 = performance.now();
  validateInput(input);

  const profile = getStorybookHubProfile(input.brief.hub);
  const artStyle: StorybookArtStyle =
    (input.brief as any).art_style ??
    pickStorybookStyle({
      hub: input.brief.hub,
      cefr: input.brief.cefr,
      unitTheme: input.brief.theme,
      learnerPref: (input as any).learnerStylePref ?? null,
    });
  // Lock a lead cast character on every page. Prefer an explicit hint from
  // the orchestrator's media plan; otherwise pick the first cast member.
  const leadName: string | null =
    (input.brief as any).lead_character_name ??
    (input.cast?.[0]?.name ?? null);
  const leadBlueprint: string | null =
    (input.brief as any).lead_character_blueprint ??
    (input.cast?.[0] as any)?.visual_blueprint ??
    null;
  const leadDirective = leadName
    ? ` HARD CONTRACT: the lead character "${leadName}" MUST appear on every page${leadBlueprint ? ` — locked visual: ${leadBlueprint}` : ''}.`
    : '';

  const briefWithDefaults = {
    ...input.brief,
    chapter_count: input.brief.chapter_count ?? profile.chapter_count.default,
    pages_per_chapter: input.brief.pages_per_chapter ?? profile.pages_per_chapter.default,
    art_style: artStyle,
    style_directive: styleDirective(artStyle) + leadDirective,
    lead_character_name: leadName,
  };

  const { data, error } = await supabase.functions.invoke('storybook-generate', {
    body: {
      brief: briefWithDefaults,
      cast: input.cast.map(slimCharacter),
      studentId: input.studentId,
      createdBy: input.createdBy,
      withIllustrations: input.withIllustrations !== false,
      withAudio: input.withAudio === true,
    },
  });

  if (error) {
    // supabase.functions.invoke surfaces non-2xx as a generic FunctionsHttpError.
    // Try to pull the real {error, stage, detail} payload out of `error.context`
    // so the user sees the actual cause instead of "non-2xx status code".
    let detail = error.message;
    try {
      const ctx: any = (error as any).context;
      const payload = ctx && typeof ctx.json === 'function' ? await ctx.json() : null;
      if (payload?.error) {
        detail = payload.stage ? `[${payload.stage}] ${payload.error}` : payload.error;
        if (payload.detail) detail += ` — ${payload.detail}`;
      }
    } catch { /* ignore */ }
    throw new Error(`storybook-generate failed: ${detail}`);
  }

  const result = data as { book: Storybook; bookId: string; warnings?: string[]; verdict?: RunStorybookGenerationResult['verdict'] };
  if (!result?.bookId || !result.book) {
    throw new Error('storybook-generate returned malformed response (missing book)');
  }

  return {
    book: result.book,
    bookId: result.bookId,
    verdict: result.verdict ?? 'draft',
    warnings: result.warnings ?? [],
    durationMs: Math.round(performance.now() - t0),
  };
}

function validateInput(input: RunStorybookGenerationInput): void {
  if (!input?.brief?.hub) throw new Error('brief.hub is required');
  if (!input?.brief?.cefr) throw new Error('brief.cefr is required');
  if (!Array.isArray(input.cast) || input.cast.length === 0) {
    throw new Error('At least one Cast Vault character is required. Storybooks must use Cast Vault for continuity.');
  }
  if (!input.createdBy) throw new Error('createdBy is required');
}

function slimCharacter(c: CastVaultCharacter) {
  return {
    id: c.id,
    name: c.name,
    role: c.role,
    personality_traits: c.personality_traits,
    visual_blueprint: c.visual_blueprint,
    voice_id: c.voice_id,
    signature_traits: c.signature_traits,
  };
}
