import { describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {}, supabaseUrl: '', supabaseAnonKey: '' }));
import { cacheFileName } from '@/content/playground-library/unit1/audio';
import { spokenText } from '@/content/playground-library/unit1/spokenText';
import { ACADEMY_GAMES } from '../academyGamesCatalog';
import { DOCTORS, ECHOES, NINJAS, ODDS, RHYMES, doctorOptions, rhymeOptions, sillySoundsLines } from './soundData';

const HETERONYMS = /\b(read|lead|wind|live|tear|bow|row|bass|close|use|wound|minute|record|present|object|desert|refuse)\b/i;

describe('Silly Sounds data', () => {
  it('rhymes: three different options, the right one included, no heteronyms', () => {
    for (const r of RHYMES) {
      const o = rhymeOptions(r);
      expect(new Set(o).size, r.id).toBe(3);
      expect(o).toContain(r.answer);
      expect(r.word, r.id).not.toBe(r.answer);
    }
  });

  it('odd one out: the odd word is one of the four, four different words', () => {
    for (const o of ODDS) {
      expect(new Set(o.words).size, o.id).toBe(4);
      expect(o.words).toContain(o.odd);
    }
  });

  it('silent letters: the marked letter is in the word', () => {
    for (const n of NINJAS) {
      expect(n.word[n.index], n.id).toBe(n.silent);
      expect(n.silent.length).toBe(1);
    }
  });

  it('spelling doctor: one gap, three different spellings, the right one included', () => {
    for (const d of DOCTORS) {
      expect(d.text.split('___').length, d.id).toBe(2);
      expect(new Set(doctorOptions(d)).size, d.id).toBe(3);
    }
    expect(ECHOES.length).toBeGreaterThanOrEqual(3);
  });

  it('no heteronym is spoken (a recorded voice could say the wrong one)', () => {
    for (const l of sillySoundsLines()) expect(l, l).not.toMatch(HETERONYMS);
  });

  it('every spoken line is a baked static clip on disk (no live voice)', () => {
    const missing = sillySoundsLines().filter((l) => !existsSync(join(process.cwd(), 'public', 'audio-cache', `${cacheFileName('teacher', spokenText(l))}.mp3`)));
    expect(missing).toEqual([]);
  });

  it('the game code uses no AI, no recognition, no browser voice and no upload', () => {
    const dir = join(process.cwd(), 'src', 'academy-games', 'sillySounds');
    const code = readdirSync(dir).filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes('.test.')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
    expect(code).not.toMatch(/speechSynthesis|SpeechRecognition|webkitSpeechRecognition|functions\.invoke|\bfetch\(|XMLHttpRequest|openai|anthropic|gemini/i);
  });

  it('is in the Academy catalog with a cover that exists', () => {
    const g = ACADEMY_GAMES.find((x) => x.id === 'silly-sounds')!;
    expect(g).toBeTruthy();
    expect(existsSync(join(process.cwd(), 'public', g.cover.replace(/^\//, '')))).toBe(true);
  });
});
