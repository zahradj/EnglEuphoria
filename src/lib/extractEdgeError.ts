/**
 * Extracts the EXACT raw error string from a Supabase Edge Function response.
 *
 * Lesson generation must never collapse provider/parser errors into a generic
 * "Something went wrong". This walks every known error envelope shape and
 * returns the most specific technical string available.
 *
 * IMPORTANT: supabase-js v2 wraps the response body of a non-2xx edge call in
 * `error.context.body` as a Blob/ReadableStream. JSON.stringify(Blob) → "{}",
 * which silently swallows the function's real error message. This helper now
 * drains that body before formatting, so the toast shows the actual reason.
 */
export async function extractEdgeError(args: {
  error?: any;
  data?: any;
  fallback?: string;
}): Promise<string> {
  const { error, data, fallback = 'Unknown error from edge function' } = args;

  // 1. Supabase invoke transport error
  if (error) {
    const ctx = (error as any)?.context;
    let ctxBody = '';
    if (ctx?.body !== undefined && ctx?.body !== null) {
      ctxBody = await readBody(ctx.body);
    }

    // If body parsed as JSON with a structured error/hint, prefer the human pieces.
    let parsed: any = null;
    if (ctxBody) {
      try { parsed = JSON.parse(ctxBody); } catch { /* keep raw */ }
    }
    const human = parsed && typeof parsed === 'object'
      ? [
          typeof parsed.error === 'string' ? parsed.error : parsed.error?.message,
          typeof parsed.message === 'string' ? parsed.message : null,
          parsed.hint,
          parsed.detail && typeof parsed.detail === 'string' ? parsed.detail : null,
          parsed.code ? `[${parsed.code}]` : null,
        ].filter(Boolean).join(' — ')
      : '';

    const parts = [
      error?.name && `${error.name}`,
      error?.message,
      human || (ctxBody && `body=${ctxBody.length > 600 ? ctxBody.slice(0, 600) + '…' : ctxBody}`),
      ctx?.status && `status=${ctx.status}`,
    ].filter(Boolean);
    if (parts.length) return parts.join(' | ');
  }

  // 2. Edge function returned a non-2xx body that supabase-js parsed as data
  if (data && typeof data === 'object') {
    const pieces: string[] = [];
    if (typeof data.error === 'string') pieces.push(data.error);
    else if (data.error?.message) pieces.push(String(data.error.message));
    if (data.hint) pieces.push(String(data.hint));
    if (data.detail) pieces.push(typeof data.detail === 'string' ? data.detail : safeStringify(data.detail));
    if (data.stack && typeof data.stack === 'string') pieces.push(data.stack.split('\n')[0]);
    if (data.message && !pieces.length) pieces.push(String(data.message));
    if (pieces.length) return pieces.join(' — ');
  }

  return fallback;
}

async function readBody(body: any): Promise<string> {
  try {
    if (typeof body === 'string') return body;
    if (typeof Blob !== 'undefined' && body instanceof Blob) return await body.text();
    if (body && typeof body.text === 'function') return await body.text();
    if (body && typeof body.getReader === 'function') {
      const reader = body.getReader();
      const chunks: Uint8Array[] = [];
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const total = chunks.reduce((n, c) => n + c.length, 0);
      const merged = new Uint8Array(total);
      let off = 0;
      for (const c of chunks) { merged.set(c, off); off += c.length; }
      return new TextDecoder().decode(merged);
    }
    if (typeof body === 'object') return safeStringify(body);
    return String(body);
  } catch {
    return '';
  }
}

function safeStringify(x: unknown): string {
  try {
    const s = JSON.stringify(x);
    return s.length > 600 ? s.slice(0, 600) + '…' : s;
  } catch {
    return String(x);
  }
}
