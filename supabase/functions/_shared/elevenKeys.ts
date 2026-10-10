// ElevenLabs API keys, in the order to try. A key whose monthly quota is used up (or that was revoked)
// answers 401/402/429; the next key is tried instead, so adding a key in Supabase secrets keeps voices
// and songs working without a code change. Newer names come first (owner 2026-10-09: "use another api
// elevenlabs 2" - the secret is named "elevenlabs 2"), the older ones after.
const NAMES = ['elevenlabs 2', 'ELEVENLABS 2', 'Elevenlabs 2', 'ElevenLabs 2', 'elevenlabs2', 'ELEVENLABS2', 'Elevenlabs2', 'ElevenLabs2',
  'elevenlabs_2', 'ELEVENLABS_2', 'ELEVENLABS_API_KEY_2', 'ELEVENLABS_API_KEY2', 'ELEVEN_LABS_API_KEY_2', 'ELEVENLABS_KEY_2', 'elevenlab2',
  'elevenlabs', 'ELEVENLABS', 'ElevenLabs', 'ELEVEN_LABS_API_KEY', 'ELEVENLABS_KEY',
  'ELEVENLABS_API_KEY', 'elevenlab3', 'ELEVENLABS_API_KEY_3', 'ELEVENLABS_API_KEY_1'];

/** Which names are set, with the SHAPE of each value (length, sk_ prefix) - never the value - to debug a 401. */
export function elevenLabsKeyNames(): string[] {
  return NAMES.filter((n) => (Deno.env.get(n) ?? '') !== '').map((n) => {
    const raw = Deno.env.get(n) ?? '';
    const k = clean(raw);
    return `${n} [${raw.length}->${k.length} chars, ${k.startsWith('sk_') ? 'sk_' : 'no sk_ prefix'}]`;
  });
}

/** A pasted secret can carry spaces, line breaks, quotes or a label ("xi-api-key: sk_..."): keep only the key. */
function clean(raw: string): string {
  const s = raw.trim().replace(/^["'`]+|["'`]+$/g, '').trim();
  const m = s.match(/sk_[A-Za-z0-9]+/);
  return m ? m[0] : s.replace(/^(xi-api-key|bearer)\s*[:=]?\s*/i, '');
}

export function elevenLabsKeys(): string[] {
  const keys = NAMES.map((n) => clean(Deno.env.get(n) ?? '')).filter(Boolean);
  return [...new Set(keys)];
}

/** Accounts with data residency get keys that only work on their regional API host; the global host answers
 *  "invalid_api_key" for them. So an invalid key is also tried on the regional hosts. */
const HOSTS = ['api.elevenlabs.io', 'api.us.elevenlabs.io', 'api.eu.residency.elevenlabs.io', 'api.in.residency.elevenlabs.io'];

/** fetch() against the ElevenLabs API, moving to the next key (or regional host) on quota/auth errors. */
export async function fetchElevenLabs(url: string, init: RequestInit & { headers?: Record<string, string> }): Promise<Response> {
  const keys = elevenLabsKeys();
  let last: Response | null = null;
  for (const [k, key] of keys.entries()) {
    for (const host of HOSTS) {
      const res = await fetch(url.replace('api.elevenlabs.io', host), { ...init, headers: { ...(init.headers ?? {}), 'xi-api-key': key } });
      if (res.status !== 401 && res.status !== 402 && res.status !== 429) {
        if (host !== HOSTS[0] || k > 0) console.log(`ElevenLabs: key #${k + 1} works on ${host}`);
        return res;
      }
      const body = await res.clone().text();
      if (!/quota|credits|unauthori|invalid_api_key|payment/i.test(body)) return res;
      last = res;
      if (!/invalid_api_key/i.test(body)) break; // quota/payment: same on every host, try the next key
    }
  }
  return last ?? new Response(JSON.stringify({ error: 'ElevenLabs not connected' }), { status: 500 });
}
