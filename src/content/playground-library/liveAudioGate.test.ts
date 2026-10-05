/**
 * LIVE-AUDIO GATE (deploy gate, runs with `vitest run src/content/playground-library`).
 *
 * Product rule: everything a student or teacher hears is a SAVED file, made once by the bake script
 * (scripts/generate-voice-cache.mjs) and served like any other file. Nothing generates speech live while
 * someone is waiting: a provider key/quota/outage must never be able to silence a lesson or trap a student.
 *
 * This test scans src/ for code that calls a speech-generating function at play time and fails when:
 *   1. a NEW file does so (it is in neither list below), or
 *   2. a file listed under MIGRATE no longer does so (remove it: that list must only ever shrink).
 *
 * AUTHORING files are admin/creator tools whose whole job is to generate audio once and store it.
 * MIGRATE files are student-facing flows still on live generation; see docs/audio-audit.md for the plan.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(process.cwd(), 'src');

const FUNCTIONS = [
  'elevenlabs-tts', 'generate-speech', 'generate-elevenlabs-audio', 'placement-voiceover',
  'generate-slide-voiceover', 'ai-character-voices', 'elevenlabs-sfx', 'elevenlabs-music',
].join('|');
const DIRECT_CALL = new RegExp(`functions\\.invoke\\(\\s*['"\`](?:${FUNCTIONS})['"\`]|functions/v1/(?:${FUNCTIONS})`);
const FUNNEL_CALL = /\bplayElevenLabs\(/;

const AUTHORING = new Set([
  'components/admin/editor/PlaygroundUnitEditor.tsx',
  'components/admin/editor/SlideEditor.tsx',
  'components/admin/lesson-builder/canvas/PropertiesPanel.tsx',
  'components/creator-studio/characters/CharacterCreator.tsx',
  'components/creator-studio/shared/StorybookEditor.tsx',
  'components/creator-studio/shared/LivingCanvas.tsx',
  'components/creator-studio/shared/PhonicsFocusCard.tsx',
  'components/creator-studio/shared/VisualFlashcard.tsx',
  'services/characterVoiceService.ts',
  'services/elevenLabsSfxBank.ts',
  'services/lessonMediaService.ts',
  // The one allowed funnel: it defines playElevenLabs and its read-through to the server cache.
  'lib/elevenLabsAudio.ts',
]);

// Student-facing flows that still ASK the server to generate. Since 2026-10-05 the elevenlabs-tts function refuses to make
// new clips for anyone but an admin / the bake script (they get saved clips or silence), so these are inert - still convert
// them to saved files, then delete them from here. Burn this list down to zero (see docs/audio-audit.md).
const MIGRATE = new Set([
  'components/dashboard/rooms/VocabularyRoom.tsx',
  'components/lesson-player/slides/SlideHook.tsx',
  'components/lesson-player/editorial/VocabFlipGrid.tsx',
  'components/lesson/MimicPhaseSlide.tsx',
  'components/lesson/PrimePhaseSlide.tsx',
  'components/lesson/VocabSlideSplit.tsx',
  'components/student/kids/LessonPlayerModal.tsx',
  'components/classroom/student/StudentDictionary.tsx',
  'components/classroom/ai/AITranslator.tsx',
  'hooks/useAcademyAudio.ts',
  'hooks/usePlaygroundAudio.ts',
  'hooks/useSuccessAudio.ts',
  'hooks/useTextToSpeech.ts',
  'lib/playSlideAudio.ts',
  'playground-blueprint/lib/speech.ts',
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.(test|spec)\./.test(entry.name)) out.push(full);
  }
  return out;
}

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

function liveAudioFiles(): string[] {
  const hits: string[] = [];
  for (const file of walk(SRC)) {
    const rel = path.relative(SRC, file).split(path.sep).join('/');
    if (rel.startsWith('integrations/')) continue;
    const code = stripComments(fs.readFileSync(file, 'utf8'));
    if (DIRECT_CALL.test(code) || FUNNEL_CALL.test(code)) hits.push(rel);
  }
  return hits.sort();
}

describe('live-audio gate', () => {
  const hits = liveAudioFiles();

  it('finds no NEW live speech generation (use saved clips; see docs/audio-audit.md)', () => {
    const unknown = hits.filter((f) => !AUTHORING.has(f) && !MIGRATE.has(f));
    expect(unknown, `New live-audio call(s). Bake the lines and play saved clips instead:\n${unknown.join('\n')}`).toEqual([]);
  });

  it('keeps the MIGRATE list honest: converted files must be removed from it', () => {
    const converted = [...MIGRATE].filter((f) => !hits.includes(f));
    expect(converted, `These no longer call live audio; delete them from MIGRATE:\n${converted.join('\n')}`).toEqual([]);
  });

  it('keeps the AUTHORING list honest', () => {
    const gone = [...AUTHORING].filter((f) => !hits.includes(f));
    expect(gone, `These no longer call live audio; delete them from AUTHORING:\n${gone.join('\n')}`).toEqual([]);
  });
});
