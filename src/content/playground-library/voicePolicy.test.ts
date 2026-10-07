import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { VOICE_PROFILES, isApprovedVoice, normalizeForSpeech, unresolvedSpeechRisks, voiceStatus } from '@/lib/speechPolicy';
import { VOICES_BY_HUB } from '@/constants/characterVoices';
import { LIBRARY_GAMES } from './gamesCatalog';
import { artFor } from './alphabetArt';
import { colorPlayLines } from './colorPlayText';

/**
 * QUALITY AUDIT — "Voice" engine (see .claude/skills/lesson-quality-gate).
 * Product rule: every voice a student or teacher hears has NO accent (standard native
 * American English) and says words ACCURATELY. These guards run in the deploy gate so
 * a new voice, edge function or game cannot quietly skip the policy.
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const eol = (s: string) => s.replace(/\r\n/g, '\n');

describe('voice policy: no accent', () => {
  it('every character voice in the client AND the bake script is an approved voice', () => {
    for (const file of ['src/content/playground-library/unit1/audio.ts', 'scripts/generate-voice-cache.mjs']) {
      const block = read(file).match(/VOICE_ID[^=]*=\s*\{([\s\S]*?)\n\};/);
      expect(block, `VOICE_ID block in ${file}`).toBeTruthy();
      const ids = [...block![1].matchAll(/['"]([A-Za-z0-9]{20})['"]/g)].map((m) => m[1]);
      expect(ids.length).toBeGreaterThanOrEqual(6);
      for (const id of ids) expect(isApprovedVoice(id), `${file}: ${id} must be an approved (no-accent) voice`).toBe(true);
    }
  });

  it('the client and the bake script cast the same voice for every character', () => {
    const grab = (file: string) => Object.fromEntries(
      [...read(file).match(/VOICE_ID[^=]*=\s*\{([\s\S]*?)\n\};/)![1].matchAll(/(\w+):\s*['"]([A-Za-z0-9]{20})['"]/g)].map((m) => [m[1], m[2]]),
    );
    expect(grab('scripts/generate-voice-cache.mjs')).toEqual(grab('src/content/playground-library/unit1/audio.ts'));
  });

  it('re-cast characters carry a bumped clip version, in the client and in the bake script', () => {
    for (const file of ['src/content/playground-library/unit1/audio.ts', 'scripts/generate-voice-cache.mjs']) {
      expect(read(file), file).toMatch(/CLIP_VERSION[^=]*=\s*\{[^}]*mia: 'v12'[^}]*leo: 'v12'/);
    }
  });

  it('the voice pickers only offer approved voices', () => {
    for (const hub of Object.keys(VOICES_BY_HUB) as (keyof typeof VOICES_BY_HUB)[]) {
      expect(VOICES_BY_HUB[hub].length, hub).toBeGreaterThan(0);
      for (const v of VOICES_BY_HUB[hub]) expect(voiceStatus(v.id), `${hub}: ${v.label}`).not.toBe('accented');
    }
  });

  it('the voice profile list has no duplicate ids', () => {
    const ids = VOICE_PROFILES.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('voice policy: every ElevenLabs edge function follows it', () => {
  const fnDir = 'supabase/functions';
  const fns = readdirSync(join(root, fnDir)).filter((d) => existsSync(join(root, fnDir, d, 'index.ts')));
  const speakers = fns.filter((d) => /api\.elevenlabs\.io\/v1\/text-to-speech/.test(read(`${fnDir}/${d}/index.ts`)));

  it('finds the TTS functions', () => {
    expect(speakers).toEqual(expect.arrayContaining(['elevenlabs-tts', 'generate-speech', 'generate-slide-voiceover']));
  });

  for (const fn of speakers) {
    describe(fn, () => {
      const src = read(`${fnDir}/${fn}/index.ts`);

      it('imports the shared speech policy and uses what it imports', () => {
        const imp = src.match(/import \{([^}]+)\} from "\.\.\/_shared\/speechPolicy\.ts"/);
        expect(imp, `${fn} must import ../_shared/speechPolicy.ts`).toBeTruthy();
        const names = imp![1].split(',').map((n) => n.replace(/\btype\b/, '').trim()).filter(Boolean);
        for (const name of names) expect(src.split(name).length - 1, `${fn}: ${name} imported but unused`).toBeGreaterThan(1);
        expect(src, `${fn} must swap accented voices`).toContain('approvedVoiceId(');
        expect(src, `${fn} must clean the spoken text`).toContain('normalizeForSpeech(');
        expect(src, `${fn} must bound the delivery settings`).toMatch(/safeVoiceSettings\(|voice_settings: voiceSettings/);
      });

      it('is syntactically valid TypeScript', () => {
        const out = ts.transpileModule(src, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
        const errors = (out.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
        expect(errors).toEqual([]);
      });
    });
  }

  it('the server copy of the policy is byte-identical to the client copy (Deno cannot import from src/)', () => {
    expect(eol(read('supabase/functions/_shared/speechPolicy.ts'))).toBe(eol(read('src/lib/speechPolicy.ts')));
  });

  it('the server copy of the word pronunciations is byte-identical to the client copy', () => {
    expect(eol(read('supabase/functions/_shared/pronunciations.ts'))).toBe(eol(read('src/lib/pronunciations.ts')));
  });
});

describe('voice policy: accurate pronunciation of the words the games teach', () => {
  const words = new Set<string>();
  const grammarLines = new Set<string>();
  for (const game of LIBRARY_GAMES) {
    for (const stage of game.stages) {
      const scene = stage.scene;
      if (scene.kind === 'whats-missing') scene.rounds.forEach((r) => r.items.forEach((i) => words.add(i.word)));
      if (scene.kind === 'color-play') colorPlayLines(scene.mode, scene.rounds, scene.intro).forEach((l) => grammarLines.add(l));
      if (scene.kind === 'grammar-gap') {
        (scene.examples ?? []).forEach((e) => grammarLines.add(e));
        scene.rounds.forEach((r) => grammarLines.add([r.before, r.answer, r.after].map((p) => p.trim()).filter(Boolean).join(' ')));
      }
      if (scene.kind === 'sort-basket') { scene.baskets.forEach((b) => words.add(b.label)); scene.items.forEach((i) => words.add(i.word)); }
      if (scene.kind === 'first-sound') scene.rounds.forEach((r) => words.add(r.word));
      if (scene.kind === 'letter-blocks') scene.rounds.forEach((r) => (r.word ? words.add(r.word) : r.blocks.forEach((b) => { const a = artFor(b); if (a) words.add(a.word); })));
    }
  }

  it('collects the game picture-words', () => {
    expect(words.size).toBeGreaterThan(30);
    expect(words.has('teddy')).toBe(true);
    expect(words.has('yo-yo')).toBe(true);
  });

  it('every word is plain lowercase text a voice reads correctly (or is cleaned first)', () => {
    for (const w of words) {
      const spoken = normalizeForSpeech(w);
      expect(spoken, w).toMatch(/^[a-z' ]+$/);
      expect(unresolvedSpeechRisks(w), w).toEqual([]);
    }
  });

  it('every grammar sentence reads cleanly (no unresolved pronunciation risks)', () => {
    expect(grammarLines.size).toBeGreaterThan(20);
    for (const line of grammarLines) expect(unresolvedSpeechRisks(line), line).toEqual([]);
  });

  it('"yo-yo" is spoken as two words, not read as a hyphenated blob', () => {
    expect(normalizeForSpeech('yo-yo')).toBe('yo yo');
  });
});
