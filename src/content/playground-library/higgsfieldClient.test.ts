import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

/** Higgsfield (Seedance 2.5) edge-function client. Deno.env is stubbed. */
(globalThis as unknown as { Deno: unknown }).Deno = { env: { get: (k: string) => (k === 'HF_CREDENTIALS' ? 'id:secret' : undefined) } };
const { checkHiggsfield, higgsfieldCredentials, startHiggsfield, HIGGSFIELD_MODEL } = await import('../../../supabase/functions/_shared/higgsfieldClient');

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
afterEach(() => vi.restoreAllMocks());

describe('higgsfieldClient', () => {
  it('reads credentials from the secret and never needs them in code', () => {
    expect(higgsfieldCredentials()).toBe('id:secret');
  });

  it('starts a SILENT image-to-video request on Seedance 2.5', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json({ request_id: 'req-1', status: 'queued' }));
    const id = await startHiggsfield('id:secret', 'calm motion prompt', 'https://x/y.jpg', 8);
    expect(id).toBe('req-1');
    const [url, init] = spy.mock.calls[0];
    expect(String(url)).toBe(`https://api.higgsfield.ai/${HIGGSFIELD_MODEL}`);
    expect((init!.headers as Record<string, string>).Authorization).toBe('Key id:secret');
    const body = JSON.parse(String(init!.body));
    expect(body).toMatchObject({ image_url: 'https://x/y.jpg', duration: 8, resolution: '720p', generate_audio: false });
  });

  it('maps credits / auth / validation errors', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    spy.mockResolvedValueOnce(json({}, 403));
    await expect(startHiggsfield('k:s', 'p', 'u', 8)).rejects.toMatchObject({ status: 402 });
    spy.mockResolvedValueOnce(json({}, 401));
    await expect(startHiggsfield('k:s', 'p', 'u', 8)).rejects.toMatchObject({ status: 401 });
  });

  it('reports rendering / failed / moderated / ready, and never calls a request without a video ready', async () => {
    const spy = vi.spyOn(globalThis, 'fetch');
    spy.mockResolvedValueOnce(json({ status: 'in_progress' }));
    expect(await checkHiggsfield('k:s', 'r')).toEqual({ state: 'rendering' });
    spy.mockResolvedValueOnce(json({ status: 'nsfw' }));
    expect((await checkHiggsfield('k:s', 'r')).state).toBe('failed');
    spy.mockResolvedValueOnce(json({ status: 'failed' }));
    expect((await checkHiggsfield('k:s', 'r')).state).toBe('failed');
    spy.mockResolvedValueOnce(json({ status: 'completed' }));
    expect((await checkHiggsfield('k:s', 'r')).state).toBe('failed');
    spy.mockResolvedValueOnce(json({ status: 'completed', video: { url: 'https://v/x.mp4' } }));
    expect(await checkHiggsfield('k:s', 'r')).toEqual({ state: 'ready', url: 'https://v/x.mp4' });
  });

  it('the edge functions parse as valid TypeScript, use the client, and the gate runs before Higgsfield is called', () => {
    for (const fn of ['generate-playground-video', 'poll-playground-video']) {
      const src = readFileSync(join(process.cwd(), 'supabase/functions', fn, 'index.ts'), 'utf8');
      expect(src).toContain('../_shared/higgsfieldClient.ts');
      const out = ts.transpileModule(src, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
      expect((out.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error)).toEqual([]);
    }
    const gen = readFileSync(join(process.cwd(), 'supabase/functions/generate-playground-video/index.ts'), 'utf8');
    expect(gen.indexOf('lintVideoPrompt(')).toBeLessThan(gen.indexOf('startHiggsfield('));
  });
});
