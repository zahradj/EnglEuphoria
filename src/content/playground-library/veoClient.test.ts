import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { checkVeo, startVeo, VeoError } from '../../../supabase/functions/_shared/veoClient';

/** Gemini (Veo) video client used by generate-/poll-playground-video. */
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => vi.restoreAllMocks());

describe('veoClient', () => {
  it('starts a clip with the policy negative prompt (no speech, text or extra fingers)', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json({ name: 'models/veo-3.0-fast-generate-001/operations/abc' }));
    const id = await startVeo('KEY', 'a magician rabbit pulls a flower out of a hat');
    expect(id).toBe('veo-3.0-fast-generate-001::models/veo-3.0-fast-generate-001/operations/abc');
    const [url, init] = spy.mock.calls[0];
    expect(String(url)).toContain('veo-3.0-fast-generate-001:predictLongRunning');
    expect((init!.headers as Record<string, string>)['x-goog-api-key']).toBe('KEY');
    const body = JSON.parse(String(init!.body));
    expect(body.instances[0].prompt).toBe('a magician rabbit pulls a flower out of a hat');
    expect(body.parameters.negativePrompt).toMatch(/speech/);
    expect(body.parameters.negativePrompt).toMatch(/extra fingers/);
    expect(body.parameters.aspectRatio).toBe('16:9');
  });

  it('falls back to the next Veo model when the first is not available on the key', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json({ error: { message: 'models/veo-3.0-fast-generate-001 is not found' } }, 404))
      .mockResolvedValueOnce(json({ name: 'models/veo-3.0-generate-001/operations/xyz' }));
    const id = await startVeo('KEY', 'prompt');
    expect(id.startsWith('veo-3.0-generate-001::')).toBe(true);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('stops on quota / auth errors instead of trying every model', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json({ error: { message: 'quota exceeded' } }, 429));
    await expect(startVeo('KEY', 'prompt')).rejects.toBeInstanceOf(VeoError);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('reports rendering, failed and ready', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    spy.mockResolvedValueOnce(json({ done: false }));
    expect(await checkVeo('K', 'models/m/operations/1')).toEqual({ state: 'rendering' });
    spy.mockResolvedValueOnce(json({ done: true, error: { message: 'blocked' } }));
    expect(await checkVeo('K', 'models/m/operations/1')).toEqual({ state: 'failed', error: 'blocked' });
    spy.mockResolvedValueOnce(json({ done: true, response: { generateVideoResponse: { generatedSamples: [{ video: { uri: 'https://x/video.mp4' } }] } } }));
    expect(await checkVeo('K', 'models/m/operations/1')).toEqual({ state: 'ready', uri: 'https://x/video.mp4' });
    spy.mockResolvedValueOnce(json({ done: true, response: { generateVideoResponse: { raiMediaFilteredReasons: ['unsafe'] } } }));
    const filtered = await checkVeo('K', 'models/m/operations/1');
    expect(filtered.state).toBe('failed');
  });

  it('the video edge functions parse as valid TypeScript and use the shared client', () => {
    for (const fn of ['generate-playground-video', 'poll-playground-video']) {
      const src = readFileSync(join(process.cwd(), 'supabase/functions', fn, 'index.ts'), 'utf8');
      expect(src).toContain('../_shared/veoClient.ts');
      const out = ts.transpileModule(src, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
      const errors = (out.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error);
      expect(errors.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))).toEqual([]);
    }
  });
});
