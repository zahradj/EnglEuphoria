// ElevenLabs API keys, in the order to try. A key whose monthly quota is
// used up answers 401 quota_exceeded; the next key is tried instead, so
// adding a key in Supabase secrets (ELEVENLABS_API_KEY_1, elevenlab3, …)
// keeps voices and songs working without a code change.
export function elevenLabsKeys(): string[] {
  const names = ['ELEVENLABS_API_KEY', 'elevenlab3', 'ELEVENLABS_API_KEY_3', 'ELEVENLABS_API_KEY_2', 'ELEVENLABS_API_KEY_1'];
  const keys = names.map((n) => Deno.env.get(n) ?? '').filter(Boolean);
  return [...new Set(keys)];
}

/** fetch() against the ElevenLabs API, moving to the next key on quota/auth errors. */
export async function fetchElevenLabs(url: string, init: RequestInit & { headers?: Record<string, string> }): Promise<Response> {
  const keys = elevenLabsKeys();
  let last: Response | null = null;
  for (const key of keys) {
    const res = await fetch(url, { ...init, headers: { ...(init.headers ?? {}), 'xi-api-key': key } });
    if (res.status !== 401 && res.status !== 402 && res.status !== 429) return res;
    const body = await res.clone().text();
    if (!/quota|credits|unauthori|invalid_api_key|payment/i.test(body)) return res;
    last = res;
  }
  return last ?? new Response(JSON.stringify({ error: 'ElevenLabs not connected' }), { status: 500 });
}
