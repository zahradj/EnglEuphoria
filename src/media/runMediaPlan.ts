// Media planner — stage 6.5 of the orchestrator (Playground only).
//
// Reads the lesson kind contract and emits a deterministic MediaPlan of
// every image / audio / song / storybook-page asset the lesson is expected
// to ship. The plan is persisted to `curriculum_lessons.media_plan` (jsonb)
// and consumed by the `generate-playground-images` edge function in a
// `mode: 'from_plan'` background pass.
//
// This module does NOT call any AI itself — it only plans.

import type { Cefr, Hub } from '@/governance/types';
import type { LessonPlan } from '@/planning/types';
import {
  getPlaygroundLessonContract,
  type LessonKindContract,
} from '@/planning/playgroundLessonContract';
import type { PlaygroundLessonKind } from '@/planning/playgroundUnitTemplates';
import {
  applyStyle,
  pickStorybookStyle,
  type StorybookArtStyle,
} from '@/storybook/artStyle';
import {
  characterStyleBlock,
  pickCharacterForAction,
  pickLeadCharacter,
  toLeadRef,
  type LeadCharacterRef,
} from './castPicker';
import { classifyVocab, needsCharacter } from './vocabClassifier';
import { topicToVocabScene } from '@/orchestrator/topicToEnvironment';
import type { PlaygroundCastPreset } from '@/constants/playgroundCastPresets';

export type MediaAssetKind =
  | 'vocab_image'
  | 'scene_image'
  | 'audio_clip'
  | 'warmup_song'
  | 'storybook_page';

export interface MediaAsset {
  id: string;
  kind: MediaAssetKind;
  prompt: string;
  style?: StorybookArtStyle | null;
  target_slide_id?: string;
  /** Cast character locked to this asset (for vocab-action / scene / story). */
  character?: string;
  /** Optional payload — e.g. word for vocab images, line for audio clips. */
  meta?: Record<string, unknown>;
}

export interface MediaPlan {
  hub: Hub;
  cefr: Cefr;
  lesson_kind: PlaygroundLessonKind;
  storybook_style: StorybookArtStyle | null;
  /** Locked Playground cast character for the whole unit (null if no character
   *  needed — i.e. no scene/story images and all vocab is concrete objects). */
  lead_character: LeadCharacterRef | null;
  assets: MediaAsset[];
  totals: {
    vocab_images: number;
    scene_images: number;
    audio_clips: number;
    songs: number;
    storybook_pages: number;
  };
  generated_at: string;
  planner_version: string;
}

export interface RunMediaPlanArgs {
  plan: LessonPlan;
  lessonKind: PlaygroundLessonKind | null | undefined;
  unitTheme?: string;
  learnerStylePref?: StorybookArtStyle | null;
}

const MEDIA_PLANNER_VERSION = '1.0.0';

export function runMediaPlan(args: RunMediaPlanArgs): MediaPlan | null {
  const hub = args.plan.blueprint.hub;
  if (hub !== 'playground') return null;
  const contract = getPlaygroundLessonContract(args.lessonKind);
  if (!contract) return null;

  const cefr = args.plan.blueprint.cefr_level;
  const recipe = contract.media_recipe;
  const targetVocab = args.plan.blueprint.target_vocab ?? [];
  const theme = args.unitTheme ?? args.plan.blueprint.theme ?? 'everyday english';
  // Scene phrase bound to the theme (e.g. "family" → "cozy living room with soft pastel walls").
  // Ensures vocab/scene image backgrounds match the mascot backdrop for a coherent world.
  const scenePhrase = topicToVocabScene(theme);

  const style = recipe.storybook_pages > 0
    ? pickStorybookStyle({
        hub,
        cefr,
        unitTheme: theme,
        learnerPref: args.learnerStylePref ?? null,
      })
    : null;

  // Decide whether this lesson needs a locked cast character at all.
  const hasCharacterVocab = targetVocab.some(needsCharacter);
  const needsLead =
    recipe.storybook_pages > 0 || recipe.scene_images > 0 || hasCharacterVocab;
  const leadPreset = needsLead
    ? pickLeadCharacter({ unitTheme: theme, lessonKind: contract.kind })
    : null;
  const lead = leadPreset ? toLeadRef(leadPreset, cefr) : null;

  const assets: MediaAsset[] = [];

  // Vocab images — one per target word, capped by recipe.
  const vocabImages = Math.min(recipe.vocab_images, targetVocab.length);
  for (let i = 0; i < vocabImages; i++) {
    const word = targetVocab[i];
    const kind = classifyVocab(word);
    const useChar = kind !== 'object' && leadPreset;
    const character = useChar
      ? pickCharacterForAction(word, leadPreset!, contract.kind)
      : null;
    assets.push({
      id: `vocab_${i + 1}`,
      kind: 'vocab_image',
      prompt: buildVocabPrompt(word, scenePhrase, kind, character, cefr),
      character: character?.name,
      meta: { word, vocab_kind: kind },
    });
  }

  // Scene images — hero illustrations for the lesson theme, lead in-frame.
  for (let i = 0; i < recipe.scene_images; i++) {
    assets.push({
      id: `scene_${i + 1}`,
      kind: 'scene_image',
      prompt: buildScenePrompt(scenePhrase, i, leadPreset, cefr),
      character: leadPreset?.name,
      meta: { theme },
    });
  }

  // Audio clips — listen-and-repeat / dictation lines.
  for (let i = 0; i < recipe.audio_clips; i++) {
    assets.push({
      id: `audio_${i + 1}`,
      kind: 'audio_clip',
      prompt: buildAudioPrompt(
        targetVocab[i % Math.max(1, targetVocab.length)] ?? theme,
        contract,
      ),
      meta: { index: i },
    });
  }

  // Warm-up song (L1/L2/L3 only).
  if (recipe.song) {
    assets.push({
      id: 'song_warmup',
      kind: 'warmup_song',
      prompt: buildSongPrompt(theme, targetVocab.slice(0, 4)),
      meta: { words: targetVocab.slice(0, 4) },
    });
  }

  // Storybook pages — L5 only. Lead character on every page + style directive.
  if (recipe.storybook_pages > 0 && style && leadPreset) {
    for (let i = 0; i < recipe.storybook_pages; i++) {
      const rawPrompt = buildStoryPagePrompt(
        theme,
        i,
        recipe.storybook_pages,
        leadPreset,
        cefr,
      );
      assets.push({
        id: `story_page_${i + 1}`,
        kind: 'storybook_page',
        prompt: applyStyle(rawPrompt, style),
        style,
        character: leadPreset.name,
        meta: { page_index: i },
      });
    }
  }

  return {
    hub,
    cefr,
    lesson_kind: contract.kind,
    storybook_style: style,
    lead_character: lead,
    assets,
    totals: {
      vocab_images: vocabImages,
      scene_images: recipe.scene_images,
      audio_clips: recipe.audio_clips,
      songs: recipe.song ? 1 : 0,
      storybook_pages: recipe.storybook_pages,
    },
    generated_at: new Date().toISOString(),
    planner_version: MEDIA_PLANNER_VERSION,
  };
}

// ── Prompt builders ─────────────────────────────────────────────────────────
// Flat 2.0: no 3D, no photorealism, no rendered shadows.

function buildVocabPrompt(
  word: string,
  theme: string,
  kind: ReturnType<typeof classifyVocab>,
  character: PlaygroundCastPreset | null,
  cefr?: string | null,
): string {
  if (kind === 'object' || !character) {
    return `STYLE: bright flat cartoon vocabulary card. Single concrete illustration of "${word}" in a ${theme} setting. Bold clean outlines, no text in image, no 3D, no photorealism, no rendered shadows.`;
  }
  const action =
    kind === 'expression'
      ? `expressing "${word}" with clear facial expression and gesture`
      : `performing the action "${word}"`;
  return `STYLE: bright flat cartoon vocabulary card. Subject: ${character.name} ${action} in a ${theme} setting. ${characterStyleBlock(character, cefr)} Bold clean outlines, no text in image, no 3D, no photorealism, no rendered shadows.`;
}

function buildScenePrompt(
  theme: string,
  idx: number,
  lead: PlaygroundCastPreset | null,
  cefr?: string | null,
): string {
  const angle = idx === 0 ? 'wide establishing shot' : 'close-up detail view';
  const leadLine = lead
    ? ` Feature ${lead.name} in the scene. ${characterStyleBlock(lead, cefr)}`
    : '';
  return `STYLE: bright flat cartoon scene. ${angle} of a ${theme} setting.${leadLine} Bold clean outlines, kid-friendly palette, no text, no 3D, no photorealism, no rendered shadows.`;
}

function buildAudioPrompt(focus: string, contract: LessonKindContract): string {
  return `Warm child-friendly narrator. Short clear utterance featuring "${focus}". Lesson kind: ${contract.kind}. Pacing: slow, articulate, with a brief pause after the key word.`;
}

function buildSongPrompt(theme: string, words: string[]): string {
  const wordList = words.length ? words.join(', ') : theme;
  return `Cheerful 60-second warm-up chant for young learners about ${theme}. Repeats and rhymes around: ${wordList}. Simple melody, kid-friendly voice, easy to sing along.`;
}

function buildStoryPagePrompt(
  theme: string,
  idx: number,
  total: number,
  lead: PlaygroundCastPreset,
  cefr?: string | null,
): string {
  const beat =
    idx === 0 ? 'opening — meet the characters'
    : idx === total - 1 ? 'resolution — happy conclusion'
    : idx < total / 2 ? 'rising action'
    : 'climax moment';
  return `Single full-page illustration. Page ${idx + 1} of ${total} (${beat}) in a ${theme} story. The lead character ${lead.name} MUST appear on this page. ${characterStyleBlock(lead, cefr)} No text in image.`;
}
