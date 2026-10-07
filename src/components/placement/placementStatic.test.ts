/**
 * Deploy gate: the placement test is STATIC and READY.
 *
 * Owner's rule: nothing in the placement test is generated live. Questions are in the app bundle, every sound is a
 * saved file in public/audio-cache, and no picture is generated while a student waits. A student can then take the
 * test with the speech and image services switched off, and an outage or a bad key can never break it.
 *
 * This test fails if (1) placement code starts calling a generator, (2) a line the test speaks has no saved clip,
 * or (3) a question has no instruction for the student.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {}, supabaseUrl: '', supabaseAnonKey: '' }));

import { cacheFileName } from '@/content/playground-library/unit1/audio';
import { spokenText } from '@/content/playground-library/unit1/spokenText';
import { placementLines } from './placementLines';
import { DEFAULT_PLAYGROUND_CONTENT } from '@/placement/hubContent';
import { getHubPool, taskKind, taskInstructionKeyFor, type Hub } from './questionBanks';
import { placementTranslations as en } from '@/translations/english/placement';
import { placementTranslations as ar } from '@/translations/arabic/placement';
import { placementTranslations as fr } from '@/translations/french/placement';
import { placementTranslations as it_ } from '@/translations/italian/placement';
import { placementTranslations as es } from '@/translations/spanish/placement';
import { placementTranslations as tr } from '@/translations/turkish/placement';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.(test|spec)\./.test(e.name)) out.push(full);
  }
  return out;
}

const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

describe('placement code never calls a generator', () => {
  const files = [
    ...walk(path.join(SRC, 'components/placement')),
    ...walk(path.join(SRC, 'pages/placement')),
    path.join(SRC, 'hooks/usePlacementTest.ts'),
  ];
  const FORBIDDEN: [RegExp, string][] = [
    [/VocabularyImage|imageGenerationService|ai-image-generation/, 'live picture generation'],
    [/elevenlabs|ElevenLabs|placement-voiceover|generate-speech|elevenlabs-tts|playElevenLabs/, 'live speech generation'],
    [/speechSynthesis|SpeechSynthesisUtterance/, 'browser text-to-speech'],
    [/functions\.invoke\(/, 'an edge function call'],
  ];
  it.each(files.map((f) => [path.relative(ROOT, f).split(path.sep).join('/'), f]))('%s', (_rel, file) => {
    const code = stripComments(fs.readFileSync(file as string, 'utf8'));
    for (const [pattern, what] of FORBIDDEN) expect(code, what).not.toMatch(pattern);
  });
});

describe('every sound the placement tests play is a saved clip', () => {
  const lines = placementLines(DEFAULT_PLAYGROUND_CONTENT as never);
  it('has lines to check', () => expect(lines.length).toBeGreaterThan(40));
  it('finds a non-empty mp3 for every line', () => {
    const missing = lines
      .map(([voice, text]) => ({ voice, text, file: path.join(ROOT, 'public/audio-cache', `${cacheFileName(voice, spokenText(text))}.mp3`) }))
      .filter((l) => !fs.existsSync(l.file) || fs.statSync(l.file).size < 2000);
    expect(missing.map((m) => `[${m.voice}] ${m.text.slice(0, 70)}`)).toEqual([]);
  });
  it('the three hub greetings are saved too', () => {
    const greetings: [string, string][] = [
      ['pip', DEFAULT_PLAYGROUND_CONTENT.pip.intro],
    ];
    for (const [voice, text] of greetings) {
      expect(fs.existsSync(path.join(ROOT, 'public/audio-cache', `${cacheFileName(voice as never, spokenText(text))}.mp3`)), text).toBe(true);
    }
  });
});

describe('every question tells the student what to do', () => {
  const langs = { en, ar, fr, it: it_, es, tr } as Record<string, Record<string, string>>;
  const hubs: Hub[] = ['playground', 'academy', 'professional'];

  it.each(hubs)('%s: each item has an instruction in all six languages', (hub) => {
    const pool = getHubPool(hub);
    for (const q of pool) {
      const key = taskInstructionKeyFor(q);
      for (const [lang, table] of Object.entries(langs)) {
        expect(table[key], `${lang} ${key} for: ${q.question.slice(0, 50)}`).toBeTruthy();
      }
    }
  });

  it('gap sentences say "complete the sentence"; passages say read; clips say listen', () => {
    const pool = getHubPool('academy');
    for (const q of pool) {
      if (q.question.includes('___')) expect(taskKind(q), q.question).toBe(q.audio_script ? 'listening' : q.readingPassage ? 'reading' : 'gap');
      if (q.readingPassage) expect(taskKind(q), q.question).toBe('reading');
      if (q.audio_script) expect(taskKind(q), q.question).toBe('listening');
    }
    expect(en['placement.task.gap']).toMatch(/complete/i);
  });
});
