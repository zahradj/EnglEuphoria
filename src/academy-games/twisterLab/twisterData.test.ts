import { describe, expect, it, vi } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
vi.mock('@/integrations/supabase/client', () => ({ supabase: {}, supabaseUrl: '', supabaseAnonKey: '' }));
import { cacheFileName } from '@/content/playground-library/unit1/audio';
import { ACADEMY_GAMES } from '../academyGamesCatalog';
import { TWISTERS, TWISTER_VOICES, twisterLines, wordsOf } from './twisterData';

describe('Twister Lab data (all registered, nothing live)', () => {
  it('chunks join to the full text and the data is complete', () => {
    expect(TWISTERS.length).toBe(8);
    for (const t of TWISTERS) {
      expect(t.chunks.join(' '), t.id).toBe(t.text);
      expect(t.tip.length, t.id).toBeGreaterThan(10);
      expect(t.focus.length, t.id).toBeGreaterThan(0);
      for (const s of t.spellingTips) expect(wordsOf(t.text), `${t.id}/${s.word}`).toContain(s.word);
    }
    expect(new Set(TWISTERS.map((t) => t.id)).size).toBe(TWISTERS.length);
  });

  it('American English only', () => {
    expect(TWISTERS.map((t) => t.text).join(' ')).not.toMatch(/\blorry\b|\bcolour\b/i);
  });

  it('every line the game can say is a baked static clip on disk (no live voice)', () => {
    const missing = twisterLines().filter(([v, line]) => !existsSync(join(process.cwd(), 'public', 'audio-cache', `${cacheFileName(v, line)}.mp3`)));
    expect(missing).toEqual([]);
    expect(TWISTER_VOICES).toEqual(['teacher', 'leo']);
  });

  it('the game code uses no AI, no recognition, no browser voice and no upload', () => {
    const dir = join(process.cwd(), 'src', 'academy-games', 'twisterLab');
    const code = readdirSync(dir).filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes('.test.')).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
    expect(code).not.toMatch(/speechSynthesis|SpeechRecognition|webkitSpeechRecognition|functions\.invoke|\bfetch\(|XMLHttpRequest|openai|anthropic|gemini/i);
  });

  it('is in the Academy catalog with a cover that exists', () => {
    const g = ACADEMY_GAMES.find((x) => x.id === 'twister-lab')!;
    expect(g).toBeTruthy();
    expect(existsSync(join(process.cwd(), 'public', g.cover.replace(/^\//, '')))).toBe(true);
  });
});
